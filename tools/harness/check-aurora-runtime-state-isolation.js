#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function assert(condition, message, payload){
  if(!condition) fail(message, payload);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 98271 }, async ({ page }) => page.evaluate(() => {
    if(typeof window.__galagaHarness__?.checkAuroraRuntimeStateIsolation !== 'function'){
      throw new Error('missing harness checkAuroraRuntimeStateIsolation helper');
    }
    return window.__galagaHarness__.checkAuroraRuntimeStateIsolation();
  }));

  assert(result.adapterShape.hasAdapter && result.adapterShape.hasStart && result.adapterShape.hasUpdate && result.adapterShape.hasSnapshot,
    'Aurora gameplay adapter did not expose the required start/update/snapshot surface', result);

  const aliasValues = Object.entries(result.factoryAliases).filter(([, value]) => value);
  assert(!aliasValues.length, 'createAuroraRuntimeState returned aliased nested state objects', result);
  const postStartAliasValues = Object.entries(result.postStartAliases).filter(([, value]) => value);
  assert(!postStartAliasValues.length, 'started Aurora runtime states share nested mutable objects', result);

  assert(result.aAfterStart.score === 1234 && result.aAfterStart.playerBullets === 1 && result.aAfterStart.effects === 1,
    'state A was not initialized/mutated as expected before isolation check', result);
  assert(result.bAfterStart.score === 4321 && result.bAfterStart.playerBullets === 1 && result.bAfterStart.enemyBullets === 1,
    'state B was not initialized/mutated as expected before isolation check', result);
  assert(result.aAfterStartB.score === 1234 && result.aAfterStartB.playerBullets === 1 && result.aAfterStartB.effects === 1,
    'starting state B changed state A mutable gameplay state', result);

  assert(result.aAfterStep.stageClock > result.aAfterStartB.stageClock && result.aAfterStep.simT > result.aAfterStartB.simT,
    'stepping state A did not advance state A time', result);
  assert(result.bAfterStepA.stageClock === result.bAfterStart.stageClock && result.bAfterStepA.simT === result.bAfterStart.simT && result.bAfterStepA.score === result.bAfterStart.score,
    'stepping state A changed state B counters', result);
  assert(result.bAfterStep.stageClock > result.bAfterStepA.stageClock && result.bAfterStep.simT > result.bAfterStepA.simT,
    'stepping state B did not advance state B time', result);
  assert(result.aAfterStepB.stageClock === result.aAfterStep.stageClock && result.aAfterStepB.simT === result.aAfterStep.simT && result.aAfterStepB.score === result.aAfterStep.score,
    'stepping state B changed state A counters', result);

  assert(result.activeAfterPairStep.isB && !result.activeAfterPairStep.isA,
    'stepAuroraRuntime did not leave the latest stepped runtime state active for render/UI compatibility', result);
  assert(result.adapter.stateExists && result.adapter.activeAfterStart,
    'Aurora adapter did not own and activate a runtime state on start', result);
  assert(result.adapter.after && result.adapter.after.stageClock >= result.adapter.before.stageClock,
    'Aurora adapter update did not step its owned runtime state', result);
  assert(result.adapter.snapshot?.gameKey === 'aurora-galactica',
    'Aurora adapter snapshot did not report the Aurora game key', result);

  console.log(JSON.stringify({
    ok: true,
    adapterShape: result.adapterShape,
    stateA: {
      beforeStep: result.aAfterStartB,
      afterOwnStep: result.aAfterStep,
      afterOtherStep: result.aAfterStepB
    },
    stateB: {
      beforeStep: result.bAfterStart,
      afterOtherStep: result.bAfterStepA,
      afterOwnStep: result.bAfterStep
    },
    adapter: {
      activeAfterStart: result.adapter.activeAfterStart,
      before: result.adapter.before,
      after: result.adapter.after,
      snapshotGameKey: result.adapter.snapshot?.gameKey || ''
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { writePortableSummary } = require('./summary-path-util');
const { withHarnessPage, sleep, waitForHarness } = require('./browser-check-util');

const OUT = path.join(__dirname, '..', '..', 'harness-artifacts', 'checks', 'carry-visuals');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function stamp(){
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main(){
  const outDir = path.join(OUT, `carry-visuals-seed9041-${stamp()}`);
  fs.mkdirSync(outDir, { recursive: true });

  const result = await withHarnessPage({ stage: 2, ships: 5, challenge: false, seed: 9041 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.setCarryDebug({ enabled: true }));
    await page.evaluate(() => window.__galagaHarness__.setupNaturalCaptureCycleTest({
      stage: 2,
      playerX: 140,
      keepAlive: 1
    }));

    const sampled = [];
    const endAt = Date.now() + 3500;
    while(Date.now() < endAt){
      const state = await page.evaluate(() => window.__galagaHarness__.carryState());
      sampled.push(state.carry || { mode: 'none' });
      if(state.carry?.mode === 'carried' && state.carry?.relation === 'above' && state.carry?.dive === 0) break;
      await sleep(50);
    }

    const docked = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.carryState();
      return state.carry && state.carry.mode === 'carried' && state.carry.relation === 'above' && state.carry.dive === 0 ? state.carry : null;
    }, 2500, 50);
    const dockedRender = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.renderState();
      const carry = (state.carryDraws || [])[0] || null;
      return carry && carry.relation === 'above' && carry.dive === 0 ? carry : null;
    }, 1200, 50);
    await page.screenshot({ path: path.join(outDir, 'docked-carry.png') });

    await page.evaluate(() => window.__galagaHarness__.setupWaitModeCarriedBossTest({ timer: 6 }));
    await sleep(120);
    const waitCarry = await page.evaluate(() => window.__galagaHarness__.carryState().carry);
    const waitRender = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.renderState();
      const carry = (state.carryDraws || [])[0] || null;
      return carry && carry.relation === 'above' && carry.dive === 0 ? carry : null;
    }, 1200, 50);
    await page.screenshot({ path: path.join(outDir, 'wait-mode-carry.png') });

    await page.evaluate(() => window.__galagaHarness__.setupCarriedBossFormationTest({
      stage: 2,
      playerX: 140,
      bossX: 140,
      bossY: 126
    }));
    await page.evaluate(() => window.__galagaHarness__.launchCarryingBossAttack({
      playerX: 140,
      bossX: 140,
      bossY: 126,
      vy: 24
    }));
    const divingCarry = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.carryState().carry;
      return state && state.mode === 'carried' && state.dive === 1 ? state : null;
    }, 1200, 50);
    const divingRender = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.renderState();
      const carry = (state.carryDraws || [])[0] || null;
      return carry && carry.dive === 1 ? carry : null;
    }, 1200, 50);
    await page.screenshot({ path: path.join(outDir, 'diving-carry.png') });

    return { sampled, docked, dockedRender, waitCarry, waitRender, divingCarry, divingRender };
  });

  const badCaptured = result.sampled.filter(state => state.mode === 'captured' && state.relation !== 'below');
  if(badCaptured.length){
    fail('captured fighter flipped above the boss before the carried state began', { badCaptured, sampled: result.sampled });
  }
  const retreatingCarried = result.sampled.filter(state => state.mode === 'carried' && state.dive === 3);
  if(!retreatingCarried.length){
    fail('no carried retreat state was observed before docking', result);
  }
  const badRetreating = retreatingCarried.filter(state => state.relation !== 'below');
  if(badRetreating.length){
    fail('carried fighter flipped above the boss before the boss reached the upper dock', { badRetreating, sampled: result.sampled });
  }
  if(result.docked.relation !== 'above' || result.docked.dive !== 0){
    fail('carried fighter did not settle above the boss in docked state', result);
  }
  if(!result.dockedRender || result.dockedRender.relation !== 'above' || result.dockedRender.dive !== 0){
    fail('renderer did not draw the docked carried fighter above the boss', result);
  }
  if(!result.waitCarry || result.waitCarry.mode !== 'carried' || result.waitCarry.relation !== 'above'){
    fail('wait-mode carried boss did not report an above relation', result);
  }
  if(!result.waitRender || result.waitRender.relation !== 'above' || result.waitRender.dive !== 0){
    fail('renderer did not draw the wait-mode carried fighter above the boss', result);
  }
  if(!result.divingCarry || result.divingCarry.relation !== 'above' || result.divingCarry.dive !== 1){
    fail('diving carried boss did not report an above relation', result);
  }
  if(!result.divingRender || result.divingRender.relation !== 'above' || result.divingRender.dive !== 1){
    fail('renderer did not draw the diving carried fighter above the boss', result);
  }

  writePortableSummary(path.join(outDir, 'summary.json'), {
    ok: true,
    outDir,
    docked: result.docked,
    dockedRender: result.dockedRender,
    waitCarry: result.waitCarry,
    waitRender: result.waitRender,
    divingCarry: result.divingCarry,
    divingRender: result.divingRender,
    sampledCount: result.sampled.length
  });

  console.log(JSON.stringify({
    ok: true,
    outDir,
    docked: result.docked,
    dockedRender: result.dockedRender,
    waitCarry: result.waitCarry,
    waitRender: result.waitRender,
    divingCarry: result.divingCarry,
    divingRender: result.divingRender,
    sampledCount: result.sampled.length
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

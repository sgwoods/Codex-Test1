#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { writePortableSummary } = require('./summary-path-util');
const { withHarnessPage, sleep, waitForHarness, capturePlayfieldRegion } = require('./browser-check-util');

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

    const topSample = await capturePlayfieldRegion(page, {
      x: docked.fighterX - 10,
      y: docked.fighterY - 10,
      w: 20,
      h: 20
    });
    await page.screenshot({ path: path.join(outDir, 'docked-carry.png') });

    await page.evaluate(() => window.__galagaHarness__.setupWaitModeCarriedBossTest({ timer: 6 }));
    await sleep(120);
    const waitCarry = await page.evaluate(() => window.__galagaHarness__.carryState().carry);
    const waitSample = await capturePlayfieldRegion(page, {
      x: waitCarry.fighterX - 10,
      y: waitCarry.fighterY - 10,
      w: 20,
      h: 20
    });
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
    const divingSample = await capturePlayfieldRegion(page, {
      x: divingCarry.fighterX - 10,
      y: divingCarry.fighterY - 10,
      w: 20,
      h: 20
    });
    const divingWrongSideSample = await capturePlayfieldRegion(page, {
      x: divingCarry.fighterX - 10,
      y: (divingCarry.bossY + 18) - 10,
      w: 20,
      h: 20
    });
    await page.screenshot({ path: path.join(outDir, 'diving-carry.png') });

    return { sampled, docked, topSample, waitCarry, waitSample, divingCarry, divingSample, divingWrongSideSample };
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
  if(result.topSample.count < 18){
    fail('carried fighter was not visibly rendered at the top dock position', result);
  }
  if(!result.waitCarry || result.waitCarry.mode !== 'carried' || result.waitCarry.relation !== 'above'){
    fail('wait-mode carried boss did not report an above relation', result);
  }
  if(result.waitSample.count < 18){
    fail('wait-mode carried fighter was not visibly rendered near the expected position', result);
  }
  if(!result.divingCarry || result.divingCarry.relation !== 'above' || result.divingCarry.dive !== 1){
    fail('diving carried boss did not report an above relation', result);
  }
  if(result.divingSample.count < 18){
    fail('diving carried fighter was not visibly rendered at the expected upper-side position', result);
  }
  if(result.divingWrongSideSample.count >= result.divingSample.count){
    fail('diving carried fighter still appears on the wrong side of the boss', result);
  }

  writePortableSummary(path.join(outDir, 'summary.json'), {
    ok: true,
    outDir,
    docked: result.docked,
    topSample: result.topSample,
    waitCarry: result.waitCarry,
    waitSample: result.waitSample,
    divingCarry: result.divingCarry,
    divingSample: result.divingSample,
    divingWrongSideSample: result.divingWrongSideSample,
    sampledCount: result.sampled.length
  });

  console.log(JSON.stringify({
    ok: true,
    outDir,
    docked: result.docked,
    topSample: result.topSample,
    waitCarry: result.waitCarry,
    waitSample: result.waitSample,
    divingCarry: result.divingCarry,
    divingSample: result.divingSample,
    divingWrongSideSample: result.divingWrongSideSample,
    sampledCount: result.sampled.length
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

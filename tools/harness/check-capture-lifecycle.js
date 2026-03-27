#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { writePortableSummary } = require('./summary-path-util');
const { withHarnessPage, sleep, waitForHarness } = require('./browser-check-util');

const OUT = path.join(__dirname, '..', '..', 'harness-artifacts', 'checks', 'capture-lifecycle');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function stamp(){
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function waitForCarry(page, predicate, timeoutMs = 3000){
  const start = Date.now();
  while(Date.now() - start < timeoutMs){
    const state = await page.evaluate(() => window.__galagaHarness__.carryState());
    if(predicate(state)) return state;
    await sleep(50);
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for carry state`);
}

async function waitForCarryRender(page, predicate, timeoutMs = 1500){
  const start = Date.now();
  while(Date.now() - start < timeoutMs){
    const state = await page.evaluate(() => window.__galagaHarness__.renderState());
    const carry = (state.carryDraws || [])[0] || null;
    if(predicate(carry)) return carry;
    await sleep(50);
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for carry render state`);
}

async function captureEscapeBranch(page, outDir){
  await page.evaluate(() => window.__galagaHarness__.setupCaptureEscapeTest({
    stage: 4,
    playerX: 140,
    bossX: 140,
    playerY: 186,
    bossY: 110,
    capT: 0.95,
    beamT: 1.2,
    keepAlive: 1
  }));
  const captured = await waitForCarry(page, state => state.carry && state.carry.mode === 'captured' && state.carry.relation === 'below');
  await page.screenshot({ path: path.join(outDir, 'capture-escape-captured.png') });
  await page.evaluate(() => window.__galagaHarness__.spawnPlayerBullet({ x: 140, y: 156, v: 560 }));
  const banner = await waitForHarness(page, () => {
    const s = window.__galagaHarness__.bannerState();
    return s.bannerMode === 'captureEscape' ? s : null;
  }, 2200, 50);
  const recovered = await waitForHarness(page, () => {
    const s = window.__galagaHarness__.state();
    return !s.player?.captured;
  }, 1500, 50).catch(() => null);
  await sleep(200);
  await page.screenshot({ path: path.join(outDir, 'capture-escape-recovered.png') });
  return { captured: captured.carry, banner, recovered };
}

async function fullCaptureBranch(page, outDir){
  await page.evaluate(() => window.__galagaHarness__.setCarryDebug({ enabled: true }));
  await page.evaluate(() => window.__galagaHarness__.setupNaturalCaptureCycleTest({
    stage: 2,
    playerX: 140,
    keepAlive: 1
  }));

  const captured = await waitForCarry(page, state => state.carry && state.carry.mode === 'captured' && state.carry.relation === 'below');
  await page.screenshot({ path: path.join(outDir, 'full-capture-captured.png') });

  const retreat = await waitForCarry(page, state => state.carry && state.carry.mode === 'carried' && state.carry.dive === 3 && state.carry.relation === 'below');
  await page.screenshot({ path: path.join(outDir, 'full-capture-retreat.png') });

  const docked = await waitForCarry(page, state => state.carry && state.carry.mode === 'carried' && state.carry.dive === 0 && state.carry.relation === 'above');
  const dockedRender = await waitForCarryRender(page, carry => carry && carry.dive === 0 && carry.relation === 'above');
  await page.screenshot({ path: path.join(outDir, 'full-capture-docked.png') });

  await page.evaluate(() => window.__galagaHarness__.launchCarryingBossAttack({
    playerX: 140,
    bossX: 140,
    bossY: 126,
    vy: 24
  }));
  const diving = await waitForCarry(page, state => state.carry && state.carry.mode === 'carried' && state.carry.dive === 1 && state.carry.relation === 'above');
  const divingRender = await waitForCarryRender(page, carry => carry && carry.dive === 1 && carry.relation === 'above');
  await page.screenshot({ path: path.join(outDir, 'full-capture-diving.png') });

  await page.evaluate(() => window.__galagaHarness__.triggerCarriedBossRescueKill());
  const rescueBanner = await waitForHarness(page, () => {
    const s = window.__galagaHarness__.bannerState();
    return s.bannerMode === 'rescueReturn' ? s : null;
  }, 1600, 50);
  const rescueState = await waitForHarness(page, () => {
    const s = window.__galagaHarness__.carryState();
    return s.rescue && s.rescue.mode === 'rescue_pod' ? s.rescue : null;
  }, 1600, 50);
  await page.screenshot({ path: path.join(outDir, 'full-capture-rescue.png') });

  return {
    captured: captured.carry,
    retreat: retreat.carry,
    docked: docked.carry,
    dockedRender,
    diving: diving.carry,
    divingRender,
    rescueBanner,
    rescueState
  };
}

async function main(){
  const outDir = path.join(OUT, `capture-lifecycle-seed9051-${stamp()}`);
  fs.mkdirSync(outDir, { recursive: true });

  const captureEscape = await withHarnessPage({ stage: 4, ships: 5, challenge: false, seed: 9051 }, async ({ page }) => captureEscapeBranch(page, outDir));
  const fullCapture = await withHarnessPage({ stage: 2, ships: 5, challenge: false, seed: 9052 }, async ({ page }) => fullCaptureBranch(page, outDir));

  if(captureEscape.captured.relation !== 'below'){
    fail('capture-escape branch did not keep the fighter below the boss during beam-up', { captureEscape, fullCapture });
  }
  if(fullCapture.captured.relation !== 'below'){
    fail('full-capture branch did not keep the fighter below the boss during beam-up', { captureEscape, fullCapture });
  }
  if(fullCapture.retreat.relation !== 'below' || fullCapture.retreat.dive !== 3){
    fail('carried retreat did not stay below the boss until docking', { captureEscape, fullCapture });
  }
  if(fullCapture.docked.relation !== 'above' || fullCapture.docked.dive !== 0){
    fail('docked carried fighter did not settle above the boss', { captureEscape, fullCapture });
  }
  if(fullCapture.dockedRender.relation !== 'above' || fullCapture.dockedRender.dive !== 0){
    fail('renderer did not draw the docked carried fighter above the boss', { captureEscape, fullCapture });
  }
  if(fullCapture.diving.relation !== 'above' || fullCapture.diving.dive !== 1){
    fail('diving carried boss did not report an above relation', { captureEscape, fullCapture });
  }
  if(fullCapture.divingRender.relation !== 'above' || fullCapture.divingRender.dive !== 1){
    fail('renderer did not draw the diving carried fighter above the boss', { captureEscape, fullCapture });
  }
  if(fullCapture.rescueBanner.bannerMode !== 'rescueReturn'){
    fail('rescue branch did not reach the expected rescue-return banner', { captureEscape, fullCapture });
  }
  if(fullCapture.rescueState.podMode !== 'dock'){
    fail('rescue branch did not create the expected returning rescue pod state', { captureEscape, fullCapture });
  }

  writePortableSummary(path.join(outDir, 'summary.json'), {
    ok: true,
    outDir,
    captureEscape,
    fullCapture
  });

  console.log(JSON.stringify({
    ok: true,
    outDir,
    captureEscape,
    fullCapture
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

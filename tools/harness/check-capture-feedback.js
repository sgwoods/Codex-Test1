#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { writePortableSummary } = require('./summary-path-util');
const { withHarnessPage, sleep, waitForHarness } = require('./browser-check-util');

const OUT = path.join(__dirname, '..', '..', 'harness-artifacts', 'checks', 'capture-feedback');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function stamp(){
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function captureEscapeBanner(page){
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
  await page.evaluate(() => window.__galagaHarness__.spawnPlayerBullet({ x: 140, y: 156, v: 560 }));
  return waitForHarness(page, () => {
    const banner = window.__galagaHarness__.bannerState();
    return banner.bannerMode === 'captureEscape' ? banner : null;
  }, 2200, 50);
}

async function captureLossBanner(page){
  await page.evaluate(() => window.__galagaHarness__.setupCarriedBossFormationTest({
    stage: 2,
    playerX: 140,
    bossX: 140,
    bossY: 112
  }));
  await sleep(80);
  await page.evaluate(() => window.__galagaHarness__.triggerCarriedFighterHit());
  return waitForHarness(page, () => {
    const banner = window.__galagaHarness__.bannerState();
    return banner.bannerMode === 'captureLoss' ? banner : null;
  }, 1500, 50);
}

async function rescueReturnBanner(page){
  await page.evaluate(() => window.__galagaHarness__.setCarryDebug({ enabled: true }));
  await page.evaluate(() => window.__galagaHarness__.setupNaturalCaptureCycleTest({
    stage: 2,
    playerX: 140,
    keepAlive: 1
  }));
  await waitForHarness(page, () => {
    const state = window.__galagaHarness__.carryState();
    return state.carry && state.carry.mode === 'carried' ? true : false;
  }, 2500, 50);
  await page.evaluate(() => window.__galagaHarness__.launchCarryingBossAttack({ playerX: 140 }));
  await sleep(350);
  await page.evaluate(() => window.__galagaHarness__.triggerCarriedBossRescueKill());
  return waitForHarness(page, () => {
    const banner = window.__galagaHarness__.bannerState();
    return banner.bannerMode === 'rescueReturn' ? banner : null;
  }, 1500, 50);
}

async function main(){
  const outDir = path.join(OUT, `capture-feedback-seed9042-${stamp()}`);
  fs.mkdirSync(outDir, { recursive: true });
  const captureEscape = await withHarnessPage({ stage: 2, ships: 5, challenge: false, seed: 9042 }, async ({ page }) => {
    const banner = await captureEscapeBanner(page);
    await page.screenshot({ path: path.join(outDir, 'capture-escape.png') });
    return banner;
  });
  const captureLoss = await withHarnessPage({ stage: 2, ships: 5, challenge: false, seed: 9042 }, async ({ page }) => {
    const banner = await captureLossBanner(page);
    await page.screenshot({ path: path.join(outDir, 'capture-loss.png') });
    return banner;
  });
  const rescueReturn = await withHarnessPage({ stage: 2, ships: 5, challenge: false, seed: 9042 }, async ({ page }) => {
    const banner = await rescueReturnBanner(page);
    await page.screenshot({ path: path.join(outDir, 'rescue-return.png') });
    return banner;
  });
  const result = { captureEscape, captureLoss, rescueReturn };

  if(result.captureEscape.bannerTxt !== 'CAPTURE BROKEN' || result.captureEscape.bannerSub !== 'FIGHTER ESCAPED'){
    fail('capture escape banner text is not the expected wording', result);
  }
  if(result.captureLoss.bannerTxt !== 'CAPTURED FIGHTER' || result.captureLoss.bannerSub !== 'DESTROYED'){
    fail('captured fighter loss banner text is not the expected wording', result);
  }
  if(result.rescueReturn.bannerTxt !== 'FIGHTER RELEASED' || result.rescueReturn.bannerSub !== 'RETURNING TO SHIP'){
    fail('rescue return banner text is not the expected wording', result);
  }

  writePortableSummary(path.join(outDir, 'summary.json'), {
    ok: true,
    outDir,
    captureEscape: result.captureEscape,
    captureLoss: result.captureLoss,
    rescueReturn: result.rescueReturn
  });

  console.log(JSON.stringify({
    ok: true,
    outDir,
    captureEscape: result.captureEscape,
    captureLoss: result.captureLoss,
    rescueReturn: result.rescueReturn
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

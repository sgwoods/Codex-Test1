#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { withHarnessPage, sleep, capturePlayfieldRegion } = require('./browser-check-util');

const OUT = path.join(__dirname, '..', '..', 'harness-artifacts', 'checks', 'boss-first-hit-visual');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function stamp(){
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main(){
  const outDir = path.join(OUT, `boss-first-hit-seed21001-${stamp()}`);
  fs.mkdirSync(outDir, { recursive: true });
  const result = await withHarnessPage({ stage: 1, ships: 5, challenge: false, seed: 21001 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.setupBossFirstHitTest({
      stage: 1,
      playerX: 140,
      bossX: 140,
      bossY: 112
    }));
    await sleep(80);
    const before = await capturePlayfieldRegion(page, { x: 108, y: 88, w: 64, h: 48 });
    await page.screenshot({ path: path.join(outDir, 'before.png'), clip: { x: 108, y: 88, width: 64, height: 48 } });

    await page.evaluate(() => window.__galagaHarness__.triggerBossFirstHit());
    await sleep(90);
    const flash = await capturePlayfieldRegion(page, { x: 108, y: 88, w: 64, h: 48 });
    await page.screenshot({ path: path.join(outDir, 'flash.png'), clip: { x: 108, y: 88, width: 64, height: 48 } });

    await sleep(700);
    const settled = await capturePlayfieldRegion(page, { x: 108, y: 88, w: 64, h: 48 });
    await page.screenshot({ path: path.join(outDir, 'settled.png'), clip: { x: 108, y: 88, width: 64, height: 48 } });

    return { before, flash, settled };
  });

  if(!result.flash.bbox) fail('boss hit flash was not visible in the sampled region', result);
  if(!result.settled.bbox) fail('boss sprite disappeared after first hit', result);
  if(result.flash.count <= result.before.count) fail('boss hit flash did not increase visible activity', result);
  if(result.settled.bbox.w > 30 || result.settled.bbox.h > 24){
    fail('settled boss region is too large; possible lingering first-hit visual artifact', result);
  }
  if(result.settled.count >= result.flash.count){
    fail('settled boss region did not calm down after the hit flash', result);
  }

  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({
    ok: true,
    outDir,
    before: result.before,
    flash: result.flash,
    settled: result.settled
  }, null, 2));

  console.log(JSON.stringify({
    ok: true,
    outDir,
    before: result.before,
    flash: result.flash,
    settled: result.settled
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({
    stage: 1,
    ships: 3,
    extendFirst: 2000,
    extendRecurring: 5000,
    challenge: false,
    seed: 14501
  }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.setTest({
        stage: 1,
        ships: 3,
        extendFirst: 2000,
        extendRecurring: 5000,
        challenge: false
      });
      window.__galagaHarness__.restartCurrentConfig();
    });
    const initial = await page.evaluate(() => window.__galagaHarness__.state());
    const beforeThreshold = await page.evaluate(() => window.__galagaHarness__.awardScore({ points: 1999 }));
    const firstAward = await page.evaluate(() => window.__galagaHarness__.awardScore({ points: 1 }));
    const nearRecurring = await page.evaluate(() => window.__galagaHarness__.awardScore({ points: 2999 }));
    const secondAward = await page.evaluate(() => window.__galagaHarness__.awardScore({ points: 1 }));
    const largeJump = await page.evaluate(() => {
      window.__galagaHarness__.setTest({
        stage: 1,
        ships: 3,
        extendFirst: 2000,
        extendRecurring: 5000,
        challenge: false
      });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.awardScore({ points: 11000 });
    });
    return { initial, beforeThreshold, firstAward, nearRecurring, secondAward, largeJump };
  });

  if(result.initial.extend.first !== 2000) fail('initial state did not pick up the configured first extend threshold', result);
  if(result.initial.extend.recurring !== 5000) fail('initial state did not pick up the configured recurring extend threshold', result);
  if(result.beforeThreshold.lives !== 3) fail('score below the first threshold still awarded an extra ship', result);
  if(result.beforeThreshold.extendAwards !== 0) fail('score below the first threshold incremented the extend counter', result);
  if(result.firstAward.lives !== 4) fail('crossing the first threshold did not award exactly one extra ship', result);
  if(result.firstAward.extendAwards !== 1) fail('first threshold did not increment the extend counter once', result);
  if(result.firstAward.nextExtendScore !== 5000) fail('next extend threshold after the first award was not set to the recurring milestone', result);
  if(!String(result.firstAward.alertTxt || '').includes('BONUS SHIP AWARDED')) fail('first threshold did not surface the bonus-ship alert', result);
  if(result.nearRecurring.lives !== 4) fail('score just below the recurring threshold still awarded an extra ship', result);
  if(result.nearRecurring.extendAwards !== 1) fail('score just below the recurring threshold incremented the extend counter', result);
  if(result.secondAward.lives !== 5) fail('crossing the recurring threshold did not award the second extra ship', result);
  if(result.secondAward.extendAwards !== 2) fail('recurring threshold did not increment the extend counter twice total', result);
  if(result.secondAward.nextExtendScore !== 10000) fail('next extend threshold after the second award was not advanced correctly', result);
  if(result.largeJump.lives !== 6) fail('large score jump did not award every crossed threshold', result);
  if(result.largeJump.extendAwards !== 3) fail('large score jump did not count all crossed thresholds', result);
  if(result.largeJump.nextExtendScore !== 15000) fail('large score jump did not leave the next recurring threshold in the right place', result);

  console.log(JSON.stringify({
    ok: true,
    initial: result.initial.extend,
    firstAward: result.firstAward,
    nearRecurring: result.nearRecurring,
    secondAward: result.secondAward,
    largeJump: result.largeJump
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

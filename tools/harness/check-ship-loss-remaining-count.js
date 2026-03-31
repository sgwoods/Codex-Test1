#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 2, challenge: false, seed: 9132 }, async ({ page }) => {
    return page.evaluate(() => {
      if(!window.__galagaHarness__ || typeof window.__galagaHarness__.triggerShipLoss !== 'function'){
        return { error: 'triggerShipLoss_unavailable' };
      }
      return window.__galagaHarness__.triggerShipLoss({
        reserveLives: 1,
        cause: 'harness_ship_loss_remaining_check'
      });
    });
  });

  if(result.error) fail('ship-loss harness could not trigger a real ship loss through the harness hook', result);
  if(!result.alertTxt.includes('SHIP DESTROYED')) fail('ship-loss message missing SHIP DESTROYED', result);
  if(!result.alertTxt.includes('ONE SHIP REMAINING')) fail('ship-loss message did not report one ship remaining when one reserve remained', result);
  if(result.alertTxt.includes('TWO SHIPS REMAINING')) fail('ship-loss message still overcounts remaining ships', result);
  if(result.livesAfter !== 0) fail('lives counter after ship loss was not decremented as expected', result);

  console.log(JSON.stringify({
    ok: true,
    alertTxt: result.alertTxt,
    livesAfter: result.livesAfter,
    spawn: result.spawn,
    inv: result.inv
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 1, challenge: false, seed: 9133 }, async ({ page }) => {
    return page.evaluate(() => {
      if(!window.__galagaHarness__ || typeof window.__galagaHarness__.triggerShipLoss !== 'function'){
        return { error: 'triggerShipLoss_unavailable' };
      }
      return window.__galagaHarness__.triggerShipLoss({
        reserveLives: 0,
        dual: true,
        cause: 'harness_dual_final_life_check'
      });
    });
  });

  if(result.error) fail('dual-final-life harness could not trigger a dual-ship loss through the harness hook', result);
  if(!result.started) fail('dual-final-life loss incorrectly ended the run', result);
  if(result.livesAfter !== 0) fail('dual-final-life loss should not spend a reserve ship', result);
  if(result.dualAfter) fail('dual-final-life loss should collapse back to a single active ship', result);
  if(result.spawn !== 0) fail('dual-final-life loss should continue with the surviving ship instead of forcing a respawn', result);
  if(!result.alertTxt.includes('ONE SHIP REMAINING')) fail('dual-final-life message should report one ship remaining', result);

  console.log(JSON.stringify({
    ok: true,
    alertTxt: result.alertTxt,
    livesAfter: result.livesAfter,
    dualAfter: result.dualAfter,
    started: result.started,
    spawn: result.spawn,
    inv: result.inv
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

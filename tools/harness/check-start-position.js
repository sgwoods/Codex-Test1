#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 5, ships: 1, challenge: false, seed: 9047 }, async ({ page }) => {
    const state = await page.evaluate(() => window.__galagaHarness__.state());
    const snap = await page.evaluate(() => window.__galagaHarness__.snapshot());
    return { state, snap };
  });

  const player = result.snap.player || {};
  if(Math.abs((player.y || 0) - 340) > 2){
    fail('fresh game did not start the player on the normal bottom row', result);
  }
  if(Math.abs((player.x || 0) - 140) > 2){
    fail('fresh game did not start the player near the normal center start position', result);
  }

  console.log(JSON.stringify({
    ok: true,
    state: result.state,
    player
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

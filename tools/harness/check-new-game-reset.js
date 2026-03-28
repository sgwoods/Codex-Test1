#!/usr/bin/env node
const { withHarnessPage, waitForHarness, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 5, ships: 1, challenge: false, seed: 9047 }, async ({ page }) => {
    const first = await page.evaluate(() => window.__galagaHarness__.snapshot());
    await page.evaluate(() => window.__galagaHarness__.restartCurrentConfig());
    await sleep(80);
    const restarted = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      return state.started ? {
        state,
        snap: window.__galagaHarness__.snapshot()
      } : null;
    }, 1200, 40);
    return { first, restarted };
  });

  const player = result.restarted.snap.player || {};
  if(Math.abs((player.y || 0) - 340) > 2){
    fail('second game did not reset the player to the normal bottom row', result);
  }
  if(Math.abs((player.x || 0) - 140) > 2){
    fail('second game did not reset the player near the normal center start position', result);
  }
  if((result.restarted.state.stage || 0) !== 5){
    fail('second game did not restart on the requested stage', result);
  }

  console.log(JSON.stringify({
    ok: true,
    firstPlayer: result.first.player,
    restartedPlayer: player,
    state: result.restarted.state
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

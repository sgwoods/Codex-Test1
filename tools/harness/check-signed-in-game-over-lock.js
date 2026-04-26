#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 1, seed: 48127 }, async ({ page }) => {
    return page.evaluate(() => {
      window.__galagaHarness__.setupRemoteScoreSubmitTest({
        userId: 'pilot-ste',
        email: 'steven@stevenwoods.com',
        initials: 'STE'
      });
      window.__galagaHarness__.triggerRemoteScoreGameOver({
        score: 1790,
        stage: 1,
        reserveLives: 0,
        shots: 12,
        hits: 7
      });
      return {
        gameOver: window.__galagaHarness__.gameOverView(),
        accountSummary: document.getElementById('accountSummary')?.textContent?.trim() || '',
        hudPilot: document.getElementById('hud')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        localBoard: (typeof loadScoreboard === 'function' ? loadScoreboard() : []).slice(0, 3)
      };
    });
  });

  if(result.gameOver.editing){
    fail('signed-in pilot still entered initials-edit mode at game over', result);
  }
  if(result.gameOver.initials !== 'STE'){
    fail('signed-in pilot did not carry the locked pilot ID into game over', result);
  }
  if(/ENTER INITIALS/i.test(result.gameOver.html)){
    fail('game-over screen still rendered initials entry for a signed-in pilot', result);
  }
  if((result.localBoard[0]?.initials || '') !== 'STE'){
    fail('signed-in local score did not save using the locked pilot ID', result);
  }

  console.log(JSON.stringify({
    ok: true,
    gameOver: result.gameOver,
    latestLocal: result.localBoard[0] || null
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

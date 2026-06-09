#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 6281 }, async ({ page }) => {
    await page.evaluate(() => {
      if(typeof installGamePack !== 'function') throw new Error('missing installGamePack');
      if(!window.__galagaHarness__?.start) throw new Error('missing harness start entrypoint');
      installGamePack('galaxy-guardians-preview', { persist: false });
      window.__galagaHarness__.start({
        autoVideo: false,
        gameKey: 'galaxy-guardians-preview',
        forceAurora: false,
        stage: 1,
        ships: 3,
        seed: 6281
      });
    });

    await page.waitForTimeout(180);

    return page.evaluate(() => {
      const resultsView = window.__galagaHarness__.forceGuardiansGameOver({
        score: 2345,
        stage: 2,
        lives: 1,
        shots: 12,
        hits: 7,
        reason: 'harness_high_score_identity',
        activePackDrift: 'aurora-galactica'
      });
      if(!resultsView) throw new Error('missing active Guardians state');
      const scoreboardView = window.__galagaHarness__.showGameOverScoreboard();
      const msgEl = document.getElementById('msg');

      return {
        activePack: currentGamePackKey(),
        resultsView,
        scoreboardView,
        visibleText: msgEl?.innerText?.replace(/\s+/g, ' ').trim() || '',
        guardiansRows: window.__galagaHarness__.localScoreRows('galaxy-guardians-preview'),
        guardiansHistory: window.__galagaHarness__.localScoreHistory('galaxy-guardians-preview'),
        auroraRows: window.__galagaHarness__.localScoreRows('aurora-galactica'),
        auroraHistory: window.__galagaHarness__.localScoreHistory('aurora-galactica')
      };
    });
  });

  if(result.activePack !== 'aurora-galactica'){
    fail('Harness did not simulate the active-shell drift back to Aurora.', result);
  }
  if(result.resultsView.gameKey !== 'galaxy-guardians-preview' || result.resultsView.gameTitle !== 'Galaxy Guardians'){
    fail('Guardians game-over state did not keep Guardians score identity.', result);
  }
  if(!/GALAXY GUARDIANS RUN SUMMARY/i.test(result.resultsView.html || '')){
    fail('Guardians result summary did not label the run as Galaxy Guardians.', result);
  }
  if(!/GALAXY GUARDIANS TOP 10 PILOTS/i.test(result.visibleText || '')){
    fail('Guardians high-score screen did not use the Guardians leaderboard title.', result);
  }
  if(/AURORA GALACTICA/i.test(result.visibleText || '')){
    fail('Guardians high-score screen leaked Aurora Galactica copy.', result);
  }
  if(!result.guardiansRows.some(row => row.score === 2345 && row.gameKey === 'galaxy-guardians-preview' && row.gameTitle === 'Galaxy Guardians')){
    fail('Guardians score was not saved to the Guardians local board.', result);
  }
  if(!result.guardiansHistory.some(row => row.score === 2345 && row.gameKey === 'galaxy-guardians-preview' && row.gameTitle === 'Galaxy Guardians')){
    fail('Guardians score was not saved to Guardians score history.', result);
  }
  if(result.auroraRows.some(row => row.score === 2345) || result.auroraHistory.some(row => row.score === 2345)){
    fail('Guardians score leaked into Aurora local score storage.', result);
  }

  console.log(JSON.stringify({
    ok: true,
    activePack: result.activePack,
    gameOver: {
      gameKey: result.resultsView.gameKey,
      gameTitle: result.resultsView.gameTitle,
      phase: result.scoreboardView.phase
    },
    visibleText: result.visibleText,
    guardiansRows: result.guardiansRows,
    auroraRows: result.auroraRows
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

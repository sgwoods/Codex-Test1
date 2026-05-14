#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 49062 }, async ({ page }) => {
    await page.evaluate(() => {
      if(typeof installGamePack !== 'function') throw new Error('missing installGamePack');
      installGamePack('galaxy-guardians-preview', { persist: false });
      window.__galagaHarness__.seedLocalLeaderboard([
        {
          id: 'guardians-preclear-top',
          initials: 'GGD',
          score: 1200,
          stage: 1,
          at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          gameKey: 'galaxy-guardians-preview',
          gameTitle: 'Galaxy Guardians'
        }
      ]);
      if(!window.__galagaHarness__?.start) throw new Error('missing harness start entrypoint');
      window.__galagaHarness__.start({ autoVideo: false, stage: 1, ships: 3, seed: 49062 });
    });

    await page.waitForTimeout(180);

    await page.evaluate(() => {
      const state = typeof currentGalaxyGuardiansDevPreviewState === 'function'
        ? currentGalaxyGuardiansDevPreviewState()
        : null;
      if(!state) throw new Error('missing active Guardians state');
      state.player.inv = 999;
      for(const alien of state.aliens) alien.hp = 0;
    });

    await page.waitForTimeout(1700);

    return page.evaluate(() => ({
      gameOverView: window.__galagaHarness__.gameOverView(),
      guardians: typeof window.__galagaHarness__.guardiansState === 'function' ? window.__galagaHarness__.guardiansState() : null,
      localRows: window.__galagaHarness__.localScoreRows(),
      historyRows: window.__galagaHarness__.localScoreHistory(),
      gameOverText: document.getElementById('msg')?.innerText?.replace(/\s+/g, ' ').trim() || ''
    }));
  });

  if(!result.guardians?.gameOver || !result.guardians?.completed){
    fail('Galaxy Guardians did not end the one-level run in a completed game-over state', result);
  }
  if(result.guardians.stage !== 1 || result.guardians.gameOverReason !== 'mission_complete'){
    fail('Galaxy Guardians completion drifted from the one-level mission contract', result);
  }
  if(!result.guardians.eventTypes.includes('wave_clear') || !result.guardians.eventTypes.includes('mission_complete')){
    fail('Galaxy Guardians did not emit both wave_clear and mission_complete for the one-level ending', result);
  }
  if(!/MISSION COMPLETE/i.test(result.gameOverView?.html || '') || !/SIGNAL RACK BROKEN/i.test(result.gameOverView?.html || '')){
    fail('Galaxy Guardians did not render the mission-complete result surface', result);
  }
  if(/DEV PREVIEW COMPLETE/i.test(result.gameOverView?.html || '')){
    fail('Galaxy Guardians still rendered the old preview placeholder during mission completion', result);
  }
  if(!/MISSION COMPLETE/i.test(result.gameOverText || '')){
    fail('Visible Galaxy Guardians mission-complete text did not render in the browser surface', result);
  }
  if(!result.localRows.length || result.localRows.some(row => row.gameKey !== 'galaxy-guardians-preview')){
    fail('Galaxy Guardians completion rows were not persisted as Galaxy Guardians rows', result);
  }
  if(!result.historyRows.length || result.historyRows.some(row => row.gameKey !== 'galaxy-guardians-preview')){
    fail('Galaxy Guardians completion history rows were not persisted as Galaxy Guardians rows', result);
  }

  console.log(JSON.stringify({
    ok: true,
    gameOverPhase: result.gameOverView.phase,
    gameOverText: result.gameOverText,
    localRows: result.localRows,
    guardians: {
      stage: result.guardians.stage,
      completed: result.guardians.completed,
      gameOverReason: result.guardians.gameOverReason,
      eventTypes: result.guardians.eventTypes
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

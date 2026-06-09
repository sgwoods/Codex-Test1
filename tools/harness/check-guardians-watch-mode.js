#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, stage: 1, ships: 1, seed: 86420 }, async ({ page }) => {
    await page.evaluate(() => {
      installGamePack('galaxy-guardians-preview', { persist: false });
      if(typeof setWatchPersona === 'function') setWatchPersona('advanced', { silent: 1, source: 'harness' });
      if(typeof setWatchScope === 'function') setWatchScope('game', { silent: 1, source: 'harness' });
      window.__galagaHarness__.showFrontDoor();
    });

    const frontDoor = await waitForHarness(page, () => {
      const text = (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim();
      const modalities = {
        watch: typeof gamePackSupportsWatchMode === 'function' ? gamePackSupportsWatchMode('galaxy-guardians-preview') : null,
        rival: typeof gamePackSupportsPersonaRival === 'function' ? gamePackSupportsPersonaRival('galaxy-guardians-preview') : null
      };
      return text.includes('GALAXY GUARDIANS') ? { text, modalities } : null;
    }, 1200, 40);

    await page.evaluate(() => {
      document.querySelector('[data-watch-mode="1"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    });

    const live = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      const guardians = typeof window.__galagaHarness__.guardiansState === 'function' ? window.__galagaHarness__.guardiansState() : null;
      if(!state.started || !guardians) return null;
      return {
        state,
        guardians,
        pilotCard: {
          mode: document.getElementById('accountDockBtn')?.dataset?.pilotMode || '',
          dock: document.getElementById('accountDockBtn')?.textContent || '',
          summary: document.getElementById('accountSummary')?.textContent || ''
        }
      };
    }, 1600, 40);

    await page.evaluate(() => window.__galagaHarness__.advanceFor(10));
    const afterProgress = await page.evaluate(() => ({
      state: window.__galagaHarness__.state(),
      guardians: window.__galagaHarness__.guardiansState()
    }));

    await page.evaluate(() => {
      const runtime = typeof currentGalaxyGuardiansDevPreviewState === 'function'
        ? currentGalaxyGuardiansDevPreviewState()
        : null;
      if(runtime?.player) runtime.player.inv = 0;
      if(runtime){
        runtime.resetT = 0;
        runtime.lives = 1;
      }
      window.__galagaHarness__.forceGuardiansPlayerLoss('harness_guardians_watch_result');
      window.__galagaHarness__.advanceFor(0.2);
    });
    const gameOver = await waitForHarness(page, () => {
      const view = window.__galagaHarness__.gameOverView();
      return view?.phase ? {
        view,
        localRows: window.__galagaHarness__.localScoreRows(),
        text: (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim()
      } : null;
    }, 1200, 40);

    return { frontDoor, live, afterProgress, gameOver };
  });

  if(result.frontDoor?.modalities?.watch !== true || result.frontDoor?.modalities?.rival !== false){
    fail('Guardians should expose Watch while keeping Rival unsupported in pack-neutral modality helpers', result);
  }
  if(!/WATCH/.test(result.frontDoor?.text || '') || !/INTERMEDIATE/.test(result.frontDoor?.text || '') || !/SCORE NOT RECORDED/.test(result.frontDoor?.text || '')){
    fail('Guardians front door should expose Watch with Intermediate default persona and score-not-recorded copy', result);
  }
  if(!/AURORA ONLY/.test(result.frontDoor?.text || '') || !/RIVAL UNSUPPORTED/.test(result.frontDoor?.text || '')){
    fail('Guardians front door should make Rival unsupported rather than hiding the modality boundary', result);
  }
  if(!result.live?.state?.watchMode || result.live?.state?.watchPersona !== 'advanced' || result.live?.state?.harnessPersona !== 'advanced'){
    fail('Guardians Watch should launch the selected Intermediate persona as the active pilot', result);
  }
  if((result.afterProgress?.state?.score | 0) <= 0){
    fail('Guardians Watch persona should actively play and score during the watched run', result);
  }
  if(result.live?.pilotCard?.mode !== 'watch' || !/WATCH/.test(result.live?.pilotCard?.dock || '') || !/INTERMEDIATE/.test(result.live?.pilotCard?.dock || '') || !/not eligible/.test(result.live?.pilotCard?.summary || '')){
    fail('Guardians Watch should use the shared score-ineligible pilot-card presentation', result);
  }
  if(!result.gameOver?.view?.watchMode || !/WATCH MODE/.test(result.gameOver?.view?.html || '') || !/SCORE NOT RECORDED/.test(result.gameOver?.view?.html || '')){
    fail('Guardians Watch results should clearly mark the run as non-recorded', result);
  }
  if(result.gameOver?.localRows?.some(row => (row.score | 0) === (result.gameOver?.view?.score | 0))){
    fail('Guardians Watch score must not be recorded in local scores', result);
  }

  console.log(JSON.stringify({
    ok: true,
    modality: result.frontDoor.modalities,
    watchPersona: result.live.state.watchPersona,
    watchScore: result.afterProgress.state.score,
    recorded: false
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

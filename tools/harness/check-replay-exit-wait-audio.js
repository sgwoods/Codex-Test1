#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 9047 }, async ({ page }) => {
    const support = await page.evaluate(() => ({
      replayStore: !!window.AuroraReplayStore?.supported?.(),
      movieButton: !!document.getElementById('movieDockBtn')
    }));
    if(!support.replayStore) throw new Error('local replay store is unavailable in the harness browser');
    if(!support.movieButton) throw new Error('movie dock button is missing');

    await page.evaluate(() => window.__galagaHarness__.seedLocalReplay({
      id: 'harness-replay-audio',
      clearExisting: true,
      duration: 12,
      score: 4321,
      stage: 2
    }));
    await page.evaluate(() => window.__galagaHarness__.openMoviePanel());

    await waitForHarness(page, () => window.isMoviePanelOpen?.() ? true : false, 1200, 40);
    await waitForHarness(page, () => {
      const select = document.getElementById('movieRunSelect');
      return select && select.options.length > 0 ? true : false;
    }, 1200, 40);
    await page.evaluate(() => window.__galagaHarness__.startSelectedMovieReplay());
    await waitForHarness(page, () => {
      const panel = document.getElementById('moviePanel');
      return panel && panel.classList.contains('ready') ? true : false;
    }, 1200, 40);
    await page.evaluate(() => window.__galagaHarness__.closeMoviePanel());

    return waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      const snap = window.__galagaHarness__.snapshot();
      const ui = window.__galagaHarness__.uiState();
      if(ui.movieOpen) return null;
      if(state.started || state.paused) return null;
      if(ui.aud !== 0) return null;
      if(!snap.attract?.active || snap.attract?.phase !== 'demo') return null;
      return { state, snap, ui };
    }, 2200, 50);
  });

  console.log(JSON.stringify({
    ok: true,
    audioFlag: result.ui.aud,
    attract: result.snap.attract,
    state: result.state
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

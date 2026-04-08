#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function runCapturedPauseCase(){
  return withHarnessPage({ stage: 4, ships: 1, challenge: false, seed: 9181 }, async ({ page }) => {
    const ready = await page.evaluate(() => {
      if(!window.__galagaHarness__) return { error: 'harness_unavailable' };
      const ok = window.__galagaHarness__.setupCaptureEscapeTest({
        stage: 4,
        playerX: 140,
        playerY: 186,
        bossX: 140,
        bossY: 110
      });
      if(!ok) return { error: 'capture_escape_setup_failed' };
      if(typeof draw === 'function') draw();
      return true;
    });
    if(ready?.error) return ready;

    const before = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      return state.carry?.mode === 'captured' && state.render?.captureTetherVisible && state.render?.capturedGhostVisible ? state : null;
    }, 1500, 50);

    await page.evaluate(() => document.getElementById('pauseToggleBtn')?.click());

    const after = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      return state.paused && state.carry?.mode === 'captured' ? state : null;
    }, 2500, 50);

    return { before, after };
  });
}

async function runCapturedHelpCase(){
  return withHarnessPage({ stage: 4, ships: 1, challenge: false, seed: 9182 }, async ({ page }) => {
    const ready = await page.evaluate(() => {
      if(!window.__galagaHarness__) return { error: 'harness_unavailable' };
      const ok = window.__galagaHarness__.setupCaptureEscapeTest({
        stage: 4,
        playerX: 144,
        playerY: 186,
        bossX: 144,
        bossY: 110
      });
      if(!ok) return { error: 'capture_escape_setup_failed' };
      if(typeof draw === 'function') draw();
      return true;
    });
    if(ready?.error) return ready;

    const before = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      return state.carry?.mode === 'captured' && state.render?.captureTetherVisible && state.render?.capturedGhostVisible ? state : null;
    }, 1500, 50);

    await page.evaluate(() => document.getElementById('guideDockBtn')?.click());

    const after = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      return state.helpOpen && state.paused && state.carry?.mode === 'captured' ? state : null;
    }, 2500, 50);

    return { before, after };
  });
}

async function runCarriedLeaderboardCase(){
  return withHarnessPage({ stage: 2, ships: 1, challenge: false, seed: 9183 }, async ({ page }) => {
    const ready = await page.evaluate(() => {
      if(!window.__galagaHarness__) return { error: 'harness_unavailable' };
      const ok = window.__galagaHarness__.setupCarriedBossFormationTest({
        stage: 2,
        playerX: 140,
        bossX: 140,
        bossY: 112
      });
      if(!ok) return { error: 'carried_boss_setup_failed' };
      if(typeof draw === 'function') draw();
      return true;
    });
    if(ready?.error) return ready;

    const before = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      const carryDraw = (state.render?.carryDraws || [])[0] || null;
      return state.carry?.mode === 'carried' && carryDraw ? state : null;
    }, 1500, 50);

    await page.evaluate(() => document.getElementById('leaderboardDockBtn')?.click());

    const after = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      const carryDraw = (state.render?.carryDraws || [])[0] || null;
      return state.leaderboardOpen && state.paused && state.carry?.mode === 'carried' && carryDraw ? state : null;
    }, 2500, 50);

    return { before, after };
  });
}

async function runCarriedPlatformSplashCase(){
  return withHarnessPage({ stage: 2, ships: 1, challenge: false, seed: 9184 }, async ({ page }) => {
    const ready = await page.evaluate(() => {
      if(!window.__galagaHarness__) return { error: 'harness_unavailable' };
      const ok = window.__galagaHarness__.setupCarriedBossFormationTest({
        stage: 2,
        playerX: 136,
        bossX: 136,
        bossY: 112
      });
      if(!ok) return { error: 'carried_boss_setup_failed' };
      if(typeof draw === 'function') draw();
      return true;
    });
    if(ready?.error) return ready;

    const before = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      const carryDraw = (state.render?.carryDraws || [])[0] || null;
      return state.carry?.mode === 'carried' && carryDraw ? state : null;
    }, 1500, 50);

    await page.evaluate(() => document.getElementById('platformSplashBtn')?.click());

    const after = await waitForHarness(page, () => {
      const ui = window.__galagaHarness__.uiState();
      const state = {
        paused: !!ui.paused,
        helpOpen: document.getElementById('guideDockBtn')?.getAttribute('aria-expanded') === 'true',
        platformSplashOpen: document.getElementById('platformSplashBtn')?.getAttribute('aria-expanded') === 'true',
        leaderboardOpen: document.getElementById('leaderboardDockBtn')?.getAttribute('aria-expanded') === 'true',
        accountOpen: false,
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
      const carryDraw = (state.render?.carryDraws || [])[0] || null;
      return state.platformSplashOpen && state.paused && state.carry?.mode === 'carried' && carryDraw ? state : null;
    }, 2500, 50);

    return { before, after };
  });
}

function assertCapturedCase(label, result){
  if(result?.error) fail(`${label} harness setup failed`, result);
  if(result.before?.carry?.relation !== 'below') fail(`${label} capture relation was not below before overlay state`, result);
  if(!result.before?.render?.captureTetherVisible || !result.before?.render?.capturedGhostVisible) fail(`${label} capture visuals were not present before overlay state`, result);
  if(result.after?.carry?.relation !== 'below') fail(`${label} capture relation flipped while overlay state was active`, result);
  if(!result.after?.render?.captureTetherVisible || !result.after?.render?.capturedGhostVisible) fail(`${label} capture visuals disappeared while overlay state was active`, result);
  if((result.after?.render?.carryDraws || []).length) fail(`${label} unexpectedly drew a carried-fighter sprite during captured overlay state`, result);
}

function assertCarriedCase(label, result, overlayKey){
  if(result?.error) fail(`${label} harness setup failed`, result);
  const beforeCarryDraw = (result.before?.render?.carryDraws || [])[0] || null;
  const afterCarryDraw = (result.after?.render?.carryDraws || [])[0] || null;
  if(result.before?.carry?.relation !== 'above' || beforeCarryDraw?.relation !== 'above') fail(`${label} carried fighter was not above the boss before overlay state`, result);
  if(result.after?.carry?.relation !== 'above' || afterCarryDraw?.relation !== 'above') fail(`${label} carried fighter flipped while overlay state was active`, result);
  if(!result.after?.[overlayKey]) fail(`${label} overlay state never opened`, result);
  if(result.after?.render?.captureTetherVisible || result.after?.render?.capturedGhostVisible) fail(`${label} capture-only visuals leaked into carried overlay state`, result);
}

async function main(){
  const capturedPause = await runCapturedPauseCase();
  const capturedHelp = await runCapturedHelpCase();
  const carriedLeaderboard = await runCarriedLeaderboardCase();
  const carriedPlatformSplash = await runCarriedPlatformSplashCase();

  assertCapturedCase('pause overlay', capturedPause);
  assertCapturedCase('help overlay', capturedHelp);
  assertCarriedCase('leaderboard overlay', carriedLeaderboard, 'leaderboardOpen');
  assertCarriedCase('platform splash overlay', carriedPlatformSplash, 'platformSplashOpen');

  console.log(JSON.stringify({
    ok: true,
    capturedPause: {
      relation: capturedPause.after.carry.relation,
      tetherVisible: !!capturedPause.after.render.captureTetherVisible,
      ghostVisible: !!capturedPause.after.render.capturedGhostVisible
    },
    capturedHelp: {
      relation: capturedHelp.after.carry.relation,
      tetherVisible: !!capturedHelp.after.render.captureTetherVisible,
      ghostVisible: !!capturedHelp.after.render.capturedGhostVisible
    },
    carriedLeaderboard: {
      relation: carriedLeaderboard.after.carry.relation,
      drawRelation: carriedLeaderboard.after.render.carryDraws[0].relation,
      paused: !!carriedLeaderboard.after.paused
    },
    carriedPlatformSplash: {
      relation: carriedPlatformSplash.after.carry.relation,
      drawRelation: carriedPlatformSplash.after.render.carryDraws[0].relation,
      paused: !!carriedPlatformSplash.after.paused
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

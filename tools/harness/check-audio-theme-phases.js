#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 24141, skipStart: true }, async ({ page }) => {
    const runtimeInfo = await page.evaluate(async () => {
      let buildInfo = null;
      try{
        const response = await fetch('build-info.json', { cache: 'no-store' });
        if(response.ok) buildInfo = await response.json();
      }catch{}
      const host = String(location.hostname || '').toLowerCase();
      const boundaryEnabled = !!buildInfo?.publicArtifactBoundaryEnabled;
      return {
        boundaryEnabled,
        referenceAudioAvailable: !boundaryEnabled || (
          buildInfo?.releaseChannel === 'development'
          && (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1')
        )
      };
    });
    const frontDoor = await page.evaluate(() => {
      window.__galagaHarness__.showFrontDoor();
      return window.__galagaHarness__.triggerAudioCue('uiTick', { phase: 'frontDoor' });
    });
    const waitEnter = await page.evaluate(() => {
      window.enterAttractScores();
      return window.__galagaHarness__.audioHistory(12);
    });
    const waitPulse = await page.evaluate(() => {
      window.__galagaHarness__.advanceFor(3.1, { step: 1 / 60 });
      return window.__galagaHarness__.audioHistory(24);
    });
    const demoEnter = await page.evaluate(() => {
      window.startAttractDemo({ record: false });
      return window.__galagaHarness__.audioHistory(24);
    });
    const demoPulse = await page.evaluate(() => {
      window.__galagaHarness__.advanceFor(2.5, { step: 1 / 60 });
      return window.__galagaHarness__.audioHistory(24);
    });
    const gameplayStart = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 3, challenge: false });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.state();
    });
    const challengeTransition = await page.evaluate(() => {
      window.__galagaHarness__.triggerAudioCue('challengeTransition', { phase: 'challenge', challenge: true });
      return window.__galagaHarness__.state();
    });
    return { runtimeInfo, frontDoor, waitEnter, waitPulse, demoEnter, demoPulse, gameplayStart, challengeTransition };
  });
  const expectedReviewGameplayTheme = 'aurora-surge';
  const expectedDemoEnterTheme = 'aurora-crown';
  const expectedDemoPulseTheme = 'classic-arcade';

  if(result.frontDoor?.cue !== 'uiTick' || result.frontDoor?.phase !== 'frontDoor' || result.frontDoor?.audioTheme !== 'aurora-crown'){
    fail('front-door ui tick did not resolve through the Aurora Crown front-door audio theme', result);
  }

  const waitEnterCue = result.waitEnter.find(entry => entry.cue === 'attractEnter' && entry.phase === 'wait');
  if(!waitEnterCue || waitEnterCue.audioTheme !== 'aurora-crown'){
    fail('wait-mode entry did not record the Aurora wait attract cue', result);
  }

  const waitPulseCue = result.waitPulse.find(entry => entry.cue === 'attractPulse' && entry.phase === 'wait');
  if(!waitPulseCue || waitPulseCue.audioTheme !== 'aurora-crown'){
    fail('wait-mode pulse did not resolve through the Aurora wait audio theme', result);
  }

  const demoEnterCue = result.demoEnter.find(entry => entry.cue === 'attractEnter' && entry.phase === 'demo');
  if(!demoEnterCue || demoEnterCue.audioTheme !== expectedDemoEnterTheme){
    fail('demo entry did not resolve through the expected review audio theme', result);
  }

  const demoPulseCue = result.demoPulse.find(entry => entry.cue === 'attractPulse' && entry.phase === 'demo');
  if(!demoPulseCue || demoPulseCue.audioTheme !== expectedDemoPulseTheme){
    fail('demo pulse did not resolve through the expected attract playback audio theme', result);
  }

  if(result.gameplayStart.audioCue?.cue !== 'gameStart' || result.gameplayStart.audioCue?.audioTheme !== expectedReviewGameplayTheme){
    fail('gameplay start did not resolve through the current stage-atmosphere cue family', result);
  }

  if(result.challengeTransition.audioCue?.cue !== 'challengeTransition' || result.challengeTransition.audioCue?.phase !== 'challenge' || result.challengeTransition.audioCue?.audioTheme !== expectedReviewGameplayTheme){
    fail('challenge transition did not resolve through the current stage-atmosphere cue family', result);
  }

  console.log(JSON.stringify({
    ok: true,
    runtimeInfo: result.runtimeInfo,
    frontDoor: result.frontDoor,
    waitEnter: waitEnterCue,
    waitPulse: waitPulseCue,
    demoEnter: demoEnterCue,
    demoPulse: demoPulseCue,
    gameplayStart: result.gameplayStart.audioCue,
    challengeTransition: result.challengeTransition.audioCue
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

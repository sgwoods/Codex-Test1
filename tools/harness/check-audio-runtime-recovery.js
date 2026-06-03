#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function waitForStarted(page, predicate, label, timeout = 3000){
  try{
    await page.waitForFunction(predicate, null, { timeout });
  }catch(err){
    const debug = await page.evaluate((labelValue) => {
      const ref = (window.__platinumAudioDebug || window.__auroraAudioDebug || {}).reference || {};
      return {
        label: labelValue,
        lastStarted: ref.lastStarted || '',
        startedHistory: ref.startedHistory || [],
        blockedHistory: ref.blockedHistory || []
      };
    }, label);
    fail(`Timed out waiting for ${label} reference audio to start`, debug);
  }
}

function latestCueEntry(history = [], cue = ''){
  return [...(history || [])].reverse().find(entry => entry.cue === cue) || null;
}

function cueUsesReferenceClip(entry){
  return !!String(entry?.referenceClip || '').trim();
}

async function main(){
  const result = await withHarnessPage({ stage: 8, ships: 1, challenge: false, seed: 9428 }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 1, challenge: false, audioTheme: 'galaga-reference-assets' });
      window.__galagaHarness__.restartCurrentConfig();
      const debug = window.__platinumAudioDebug || window.__auroraAudioDebug;
      if(debug){
        debug.history = [];
        debug.lastCue = null;
        debug.reference = debug.reference || {};
        debug.reference.startedHistory = [];
        debug.reference.blockedHistory = [];
        debug.reference.lastBlocked = null;
        debug.reference.lastStarted = '';
      }
    });

    const transitionCue = await page.evaluate(() => window.__galagaHarness__.triggerAudioCue('stageTransition', { phase: 'stage' }));
    if(cueUsesReferenceClip(transitionCue)){
      await waitForStarted(page, () => {
        const history = ((window.__platinumAudioDebug || window.__auroraAudioDebug || {}).reference || {}).startedHistory || [];
        return history.some(entry => entry.cue === 'stageTransition');
      }, 'stageTransition');
    }

    const loss = await page.evaluate(() => window.__galagaHarness__.triggerShipLoss({ reserveLives: 0, cause: 'harness_audio_runtime_recovery' }));
    const lossHistoryPreview = await page.evaluate(() => window.__galagaHarness__.audioHistory(24));
    const lossRequiresReferenceStart = ['playerHit', 'gameOver'].some(cue => cueUsesReferenceClip(latestCueEntry(lossHistoryPreview, cue)));
    if(lossRequiresReferenceStart){
      await waitForStarted(page, () => {
        const history = ((window.__platinumAudioDebug || window.__auroraAudioDebug || {}).reference || {}).startedHistory || [];
        return history.some(entry => entry.cue === 'playerHit') && history.some(entry => entry.cue === 'gameOver');
      }, 'playerHit and gameOver');
    }

    const afterLoss = await page.evaluate(() => {
      const debug = window.__platinumAudioDebug || window.__auroraAudioDebug || {};
      return {
        history: window.__galagaHarness__.audioHistory(24),
        reference: debug.reference || {}
      };
    });

    await page.evaluate(() => {
      const ref = (window.__platinumAudioDebug || window.__auroraAudioDebug || {}).reference || {};
      ref.startedHistory = [];
      ref.blockedHistory = [];
      ref.lastBlocked = null;
      ref.lastStarted = '';
    });
    await page.evaluate(() => window.__galagaHarness__.start({ stage: 2, ships: 3, challenge: false, audioTheme: 'galaga-reference-assets', autoVideo: false }));
    const restartCuePreview = await page.evaluate(() => window.__galagaHarness__.state()?.audioCue || null);
    if(cueUsesReferenceClip(restartCuePreview)){
      await waitForStarted(page, () => {
        const history = ((window.__platinumAudioDebug || window.__auroraAudioDebug || {}).reference || {}).startedHistory || [];
        return history.some(entry => entry.cue === 'gameStart');
      }, 'post-game-over gameStart');
    }

    const afterRestart = await page.evaluate(() => {
      const debug = window.__platinumAudioDebug || window.__auroraAudioDebug || {};
      return {
        state: window.__galagaHarness__.state(),
        history: window.__galagaHarness__.audioHistory(32),
        reference: debug.reference || {}
      };
    });

    return { transitionCue, loss, afterLoss, afterRestart };
  });

  const lossStartedHistory = result.afterLoss.reference.startedHistory || [];
  const restartStartedHistory = result.afterRestart.reference.startedHistory || [];
  const lossHistory = result.afterLoss.history || [];
  const blockedHistory = [
    ...(result.afterLoss.reference.blockedHistory || []),
    ...(result.afterRestart.reference.blockedHistory || [])
  ];
  const lossCueStarted = cue => lossStartedHistory.find(entry => entry.cue === cue) || null;
  const restartCueStarted = cue => restartStartedHistory.find(entry => entry.cue === cue) || null;
  const lossCueLogged = cue => latestCueEntry(lossHistory, cue);
  const criticalBlocked = blockedHistory.filter(entry => ['stageTransition', 'playerHit', 'gameOver', 'gameStart'].includes(entry.cue));

  if(!result.transitionCue || result.transitionCue.cue !== 'stageTransition'){
    fail('stage transition cue did not resolve for runtime recovery check', result);
  }
  if(cueUsesReferenceClip(result.transitionCue) && +result.transitionCue.referenceClipDuration < 3.2){
    fail('stage transition reference phrase remains too abbreviated for inter-level readability', result);
  }
  if(!result.loss || result.loss.started !== false){
    fail('final-loss setup did not reach game over', result);
  }
  for(const cue of ['playerHit', 'gameOver']){
    if(!lossCueLogged(cue)) fail(`critical runtime audio cue was not recorded: ${cue}`, result);
  }
  if(cueUsesReferenceClip(result.transitionCue) && !lossCueStarted('stageTransition')){
    fail('critical reference cue did not actually start: stageTransition', result);
  }
  for(const cue of ['playerHit', 'gameOver']){
    if(cueUsesReferenceClip(lossCueLogged(cue)) && !lossCueStarted(cue)){
      fail(`critical reference cue did not actually start: ${cue}`, result);
    }
  }
  if(cueUsesReferenceClip(result.afterRestart.state?.audioCue) && !restartCueStarted('gameStart')){
    fail('post-game-over gameStart did not actually start', result.afterRestart);
  }
  if(criticalBlocked.length){
    fail('critical runtime audio cue was blocked by idle, mute, or cooldown gating', { criticalBlocked, result });
  }
  if(!result.afterRestart.state?.started || result.afterRestart.state?.audioCue?.cue !== 'gameStart'){
    fail('audio did not recover on the next game start after game over', result.afterRestart);
  }

  console.log(JSON.stringify({
    ok: true,
    transitionCue: result.transitionCue,
    loss: result.loss,
    lossStarted: ['stageTransition', 'playerHit', 'gameOver'].map(cue => lossCueStarted(cue)),
    restartStarted: restartCueStarted('gameStart'),
    blockedCount: blockedHistory.length,
    restartCue: result.afterRestart.state.audioCue
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

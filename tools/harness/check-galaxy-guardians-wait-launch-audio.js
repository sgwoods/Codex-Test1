#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true }, async ({ page }) => {
    await page.evaluate(() => {
      if(typeof installGamePack === 'function') installGamePack('galaxy-guardians-preview', { persist: false });
      if(typeof draw === 'function') draw();
      const muteBtn = document.getElementById('muteToggleBtn');
      if(muteBtn?.dataset?.muted === 'true') muteBtn.click();
      const toast = document.getElementById('feedbackToast');
      if(toast){
        toast.classList.remove('show');
        toast.textContent = '';
      }
      const debug = window.__platinumAudioDebug || window.__auroraAudioDebug;
      if(debug){
        debug.lastCue = null;
        debug.history = [];
      }
    });

    await page.waitForFunction(() => {
      return typeof currentGamePackKey === 'function'
        && currentGamePackKey() === 'galaxy-guardians-preview'
        && !!window.__galagaHarness__
        && !window.__galagaHarness__.state().started;
    }, null, { timeout: 2500 });

    await page.keyboard.press('Enter');

    await page.waitForFunction(() => window.__galagaHarness__.state().started, null, { timeout: 2500 });
    await page.waitForFunction(() => {
      const toast = document.getElementById('feedbackToast');
      return !!toast
        && toast.classList.contains('show')
        && /Sound effects on/i.test(toast.textContent || '');
    }, null, { timeout: 2500 });

    return page.evaluate(() => {
      const toast = document.getElementById('feedbackToast');
      const debug = window.__platinumAudioDebug || window.__auroraAudioDebug || {};
      const state = window.__galagaHarness__.state();
      return {
        started: !!state.started,
        gameKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        toastText: toast?.textContent || '',
        toastShown: !!toast?.classList.contains('show'),
        audioState: String(debug.audioContextState || ''),
        audioUnlocked: !!debug.interactionUnlocked,
        muted: document.getElementById('muteToggleBtn')?.dataset?.muted === 'true',
        lastCue: debug.lastCue || null,
        history: Array.isArray(debug.history) ? debug.history.slice(-8) : []
      };
    });
  });

  if(result.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians wait-mode audio check did not stay on the Guardians pack.', result);
  }
  if(!result.started){
    fail('Guardians wait-mode audio check did not launch the game from wait mode.', result);
  }
  if(!result.audioUnlocked){
    fail('Guardians wait-mode launch did not unlock audio before starting play.', result);
  }
  if(result.audioState === 'suspended'){
    fail('Guardians wait-mode launch still left the audio context suspended.', result);
  }
  if(result.muted){
    fail('Guardians wait-mode launch audio check remained muted after launch preparation.', result);
  }
  if(!result.toastShown || !/Sound effects on/i.test(result.toastText || '')){
    fail('Guardians wait-mode launch did not explicitly announce opening audio readiness.', result);
  }

  console.log(JSON.stringify({
    ok: true,
    gameKey: result.gameKey,
    started: result.started,
    audioUnlocked: result.audioUnlocked,
    audioState: result.audioState,
    toastText: result.toastText,
    lastCue: result.lastCue,
    historyCount: result.history.length
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

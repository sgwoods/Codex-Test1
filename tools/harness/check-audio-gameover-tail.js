#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 8, ships: 1, challenge: false, seed: 8428 }, async ({ page }) => {
    return page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 1, challenge: false });
      window.__galagaHarness__.restartCurrentConfig();
      const transitionCue = window.__galagaHarness__.triggerAudioCue('stageTransition', { phase: 'stage' });
      const beforeLossHistory = window.__galagaHarness__.audioHistory(12);
      const loss = window.__galagaHarness__.triggerShipLoss({ reserveLives: 0, cause: 'harness_final_loss_audio_tail' });
      const afterLossHistory = window.__galagaHarness__.audioHistory(24);
      return {
        transitionCue,
        loss,
        beforeLossHistory,
        afterLossHistory,
        gameOverCue: [...afterLossHistory].reverse().find(entry => entry.cue === 'gameOver') || null,
        playerHitCue: [...afterLossHistory].reverse().find(entry => entry.cue === 'playerHit') || null,
        stopTailAvailable: typeof window.stopRunRecordingAfterAudioTail === 'function'
      };
    });
  });

  if(!result.transitionCue || result.transitionCue.cue !== 'stageTransition'){
    fail('stage transition cue did not resolve for audio tail check', result);
  }
  if(+result.transitionCue.referenceClipDuration < 2.6){
    fail('stage transition reference cue remains too abbreviated for inter-level readability', result);
  }
  if(!result.loss || result.loss.started !== false){
    fail('final-loss harness setup did not reach game over', result);
  }
  if(!result.playerHitCue || result.playerHitCue.cue !== 'playerHit'){
    fail('final-loss player-hit cue was not recorded before game over', result);
  }
  if(!result.gameOverCue || result.gameOverCue.cue !== 'gameOver'){
    fail('game-over cue was not recorded after final ship loss', result);
  }
  if(+result.gameOverCue.referenceClipStart < 2 || +result.gameOverCue.referenceClipDuration < 4){
    fail('game-over reference cue still includes the silent lead-in or is too short', result);
  }
  if(!result.stopTailAvailable){
    fail('recorder tail-delay helper is not available to preserve final audio in captured runs', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

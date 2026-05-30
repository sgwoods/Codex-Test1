#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 1979 }, async ({ page }) => {
    await page.evaluate(async () => {
      if(!window.AuroraReplayStore?.supported?.()) throw new Error('local replay store is unavailable');
      const existing = await window.AuroraReplayStore.listReplays();
      for(const replay of existing) await window.AuroraReplayStore.deleteReplay(replay.id);
      installGamePack('galaxy-guardians-preview', { persist: false });
      getDevPreviewGameplayAdapter('galaxy-guardians-preview').start({ stage: 1, ships: 1, seed: 1979 });
    });

    const launched = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      const guardians = window.__galagaHarness__.guardiansState?.();
      if(!state.started || !guardians) return null;
      return {
        state,
        guardians,
        packKey: currentGamePackKey()
      };
    }, 1800, 40);

    await page.evaluate(() => window.__galagaHarness__.advanceFor(3.45, { step: 1 / 60 }));
    const beforeLoss = await page.evaluate(() => window.__galagaHarness__.guardiansState?.());
    await page.evaluate(() => window.__galagaHarness__.forceGuardiansPlayerLoss('harness_replay_capture_final_loss'));
    await page.waitForTimeout(3400);

    const stored = await page.evaluate(async () => {
      const replays = await window.AuroraReplayStore.listReplays();
      return replays.map(replay => ({
        id: replay.id,
        gameKey: replay.gameKey,
        gameTitle: replay.gameTitle,
        duration: replay.duration,
        stage: replay.stage,
        score: replay.score,
        source: replay.source,
        createdAt: replay.createdAt
      }));
    });

    return { launched, beforeLoss, stored };
  });

  if(result.launched.packKey !== 'galaxy-guardians-preview'){
    fail('Guardians replay capture did not run from the Guardians pack.', result);
  }
  if(!result.beforeLoss || result.beforeLoss.stage !== 1 || result.beforeLoss.gameOver){
    fail('Guardians replay capture did not hold a live stage-one run before forced game over.', result);
  }
  if(!Array.isArray(result.stored) || result.stored.length < 1){
    fail('Guardians replay capture did not persist a local replay.', result);
  }
  const latest = result.stored[0];
  if(latest.gameKey !== 'galaxy-guardians-preview' || latest.gameTitle !== 'Galaxy Guardians'){
    fail('Guardians replay capture persisted the wrong game identity.', result);
  }
  if((latest.duration || 0) < 3){
    fail('Guardians replay capture persisted a replay shorter than the minimum supported duration.', result);
  }
  if((latest.stage || 0) !== 1){
    fail('Guardians replay capture persisted the wrong stage metadata.', result);
  }

  console.log(JSON.stringify({
    ok: true,
    replayCount: result.stored.length,
    latest
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

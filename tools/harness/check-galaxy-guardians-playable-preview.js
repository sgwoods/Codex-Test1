#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, stage: 1, ships: 2, seed: 1979 }, async ({ page }) => {
    await page.evaluate(() => {
      installGamePack('galaxy-guardians-preview');
      getDevPreviewGameplayAdapter('galaxy-guardians-preview').start({ stage: 1, ships: 2, seed: 1979 });
    });

    const launched = await waitForHarness(page, () => {
      const state = window.__platinumHarness__.state();
      const guardians = window.__platinumHarness__.guardiansState();
      if(!state.started || !guardians) return null;
      return {
        state,
        guardians,
        packKey: currentGamePackKey(),
        publicAdapter: currentGamePackHasPlayableAdapter(),
        devAdapter: currentGamePackHasDevPreviewAdapter(),
        publicPlayable: currentGamePackPlayable(),
        snapshotGameKey: window.__platinumHarness__.snapshot().gameKey || ''
      };
    }, 1800, 40);

    await page.keyboard.down('Space');
    await page.evaluate(() => window.__platinumHarness__.advanceFor(.12, { step: 1/60 }));
    await page.keyboard.up('Space');

    const afterShot = await page.evaluate(() => ({
      guardians: window.__platinumHarness__.guardiansState(),
      state: window.__platinumHarness__.state()
    }));

    const firstLoss = await page.evaluate(() => window.__platinumHarness__.forceGuardiansPlayerLoss('harness_first_loss'));
    await page.evaluate(() => window.__platinumHarness__.advanceFor(1.55, { step: 1/60 }));

    const afterReset = await page.evaluate(() => ({
      guardians: window.__platinumHarness__.guardiansState(),
      state: window.__platinumHarness__.state()
    }));

    await page.evaluate(() => window.__platinumHarness__.advanceFor(1.05, { step: 1/60 }));
    const secondLoss = await page.evaluate(() => window.__platinumHarness__.forceGuardiansPlayerLoss('harness_final_loss'));

    const final = await page.evaluate(() => {
      const guardians = window.__platinumHarness__.guardiansState();
      const state = window.__platinumHarness__.state();
      return {
        guardians,
        state,
        packKey: currentGamePackKey(),
        snapshotGameKey: window.__platinumHarness__.snapshot().gameKey || ''
      };
    });

    return { launched, afterShot, firstLoss, afterReset, secondLoss, final };
  });

  if(result.launched.packKey !== 'galaxy-guardians-preview' || result.launched.snapshotGameKey !== 'galaxy-guardians-preview'){
    fail('Galaxy Guardians playable preview did not launch as the active pack', result);
  }
  if(result.launched.publicPlayable !== false || result.launched.publicAdapter !== false || result.launched.devAdapter !== true){
    fail('Galaxy Guardians playable preview crossed the public gameplay adapter boundary', result);
  }
  if(result.launched.guardians.publicPlayable !== 0 || result.launched.guardians.devPlayable !== 1){
    fail('Galaxy Guardians runtime summary is not marked dev-only', result);
  }
  if(result.launched.guardians.alienCount !== 38 || result.launched.guardians.liveRoles.flagship !== 2){
    fail('Galaxy Guardians playable preview did not start from the expected scout-wave rack', result);
  }
  if(!result.afterShot.guardians.eventTypes.includes('player_shot_fired')){
    fail('Galaxy Guardians playable preview did not route player fire input into the runtime', result);
  }
  if(!result.afterShot.guardians.hasPlayerShot && !result.afterShot.guardians.eventTypes.includes('player_shot_resolved')){
    fail('Galaxy Guardians single-shot runtime did not keep or resolve the fired player shot', result);
  }
  if(!result.firstLoss || !result.firstLoss.eventTypes.includes('player_lost') || result.firstLoss.lives !== 1){
    fail('Galaxy Guardians first life-loss flow did not decrement runtime lives', result);
  }
  if(result.firstLoss.gameOver || result.firstLoss.playerVisible){
    fail('Galaxy Guardians first life-loss flow should hide the player without ending the game', result);
  }
  if(!result.afterReset.guardians.eventTypes.includes('wave_reset') || !result.afterReset.guardians.playerVisible || result.afterReset.guardians.alienCount !== 38){
    fail('Galaxy Guardians life-reset flow did not restore the scout-wave rack and player', result);
  }
  if(!result.secondLoss || !result.secondLoss.eventTypes.includes('game_over') || !result.secondLoss.gameOver){
    fail('Galaxy Guardians final life-loss flow did not emit game over', result);
  }
  if(result.final.state.started){
    fail('Galaxy Guardians dev preview stayed in active gameplay after game over', result);
  }
  for(const cueId of ['guardians-player-single-shot','guardians-player-loss']){
    if(!result.final.guardians.audioCueIds.includes(cueId)){
      fail(`Galaxy Guardians playable preview did not emit owned audio cue ${cueId}`, result);
    }
  }
  for(const forbiddenName of ['capture','dual','challenge','boss']){
    if(result.final.guardians.visualIds.some(id => String(id).includes(forbiddenName))){
      fail(`Galaxy Guardians playable preview leaked Aurora visual naming: ${forbiddenName}`, result);
    }
  }

  console.log(JSON.stringify({
    ok:true,
    packKey:result.final.packKey,
    score:result.final.guardians.score,
    lives:result.final.guardians.lives,
    gameOver:result.final.guardians.gameOver,
    eventTypes:result.final.guardians.eventTypes,
    audioCueIds:result.final.guardians.audioCueIds
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

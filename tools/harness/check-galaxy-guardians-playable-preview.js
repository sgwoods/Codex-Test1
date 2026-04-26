#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 71391, controlledClock: true }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.exportAndReset({ label: 'galaxy_guardians_preview_wait' });
      installGamePack('galaxy-guardians-preview', { persist: false });
    });
    await page.waitForTimeout(180);

    const waitState = await waitForHarness(page, () => {
      const pack = currentGamePack();
      const model = currentGamePackPreviewModel();
      return currentGamePackKey() === 'galaxy-guardians-preview'
        ? {
          packKey: currentGamePackKey(),
          playable: currentGamePackPlayable(),
          title: currentGamePackFrontDoor().title,
          capabilities: pack.capabilities,
          modelStatus: model.status,
          eventFamilies: model.eventFamilies || [],
          nonGoals: model.nonGoals || []
        }
        : null;
    }, 1400, 40);

    await page.keyboard.press('Enter');
    const launched = await waitForHarness(page, () => {
      const snap = window.__galagaHarness__.snapshot();
      if(!snap.started || snap.gameKey !== 'galaxy-guardians-preview') return null;
      return {
        snap,
        state: window.__galagaHarness__.state(),
        formation: window.__galagaHarness__.formationState()
      };
    }, 1800, 40);

    await page.keyboard.down('Space');
    await page.evaluate(() => window.__galagaHarness__.advanceFor(0.7, { step: 1 / 60 }));
    await page.keyboard.up('Space');
    const afterShot = await page.evaluate(() => window.__galagaHarness__.snapshot());

    await page.evaluate(() => window.__galagaHarness__.advanceFor(13, { step: 1 / 60 }));
    const afterPressure = await page.evaluate(() => ({
      snap: window.__galagaHarness__.snapshot(),
      formation: window.__galagaHarness__.formationState(),
      state: window.__galagaHarness__.state()
    }));

    return { waitState, launched, afterShot, afterPressure };
  });

  if(result.waitState.packKey !== 'galaxy-guardians-preview') fail('Galaxy Guardians was not installed in wait mode', result);
  if(!result.waitState.playable) fail('Galaxy Guardians is not marked playable', result);
  if(result.waitState.capabilities.usesCaptureRescue || result.waitState.capabilities.usesDualFighterMode || result.waitState.capabilities.usesChallengeStages){
    fail('Galaxy Guardians leaked Aurora-only capabilities', result);
  }
  if(result.waitState.modelStatus !== 'first-playable-scout-slice') fail('Galaxy Guardians preview model status is wrong', result);
  for(const required of ['game_start', 'player_shot', 'regular_dive_start', 'enemy_projectile', 'wave_clear']){
    if(!result.waitState.eventFamilies.includes(required)) fail(`Galaxy Guardians event family missing: ${required}`, result);
  }
  for(const forbidden of ['capture_rescue', 'dual_fighter', 'challenge_stage']){
    if(!result.waitState.nonGoals.includes(forbidden)) fail(`Galaxy Guardians non-goal missing: ${forbidden}`, result);
  }

  if(result.launched.snap.gameKey !== 'galaxy-guardians-preview') fail('Launch snapshot did not preserve Galaxy Guardians pack key', result);
  if(result.launched.snap.challenge) fail('Galaxy Guardians preview should not launch a challenge stage', result);
  if(result.launched.snap.player.dual || result.launched.snap.player.captured || result.launched.snap.player.pending){
    fail('Galaxy Guardians player leaked Aurora dual/capture state', result);
  }
  if((result.launched.formation.targets || []).some(enemy => enemy.carry || enemy.beam)){
    fail('Galaxy Guardians formation leaked capture/beam enemy state', result);
  }
  if((result.afterShot.counts.playerBullets || 0) > 1) fail('Galaxy Guardians one-shot rule allowed more than one active player shot', result);
  const pressureTargets = result.afterPressure.formation.targets || [];
  const activeDives = pressureTargets.filter(enemy => enemy.dive > 0).length;
  if(activeDives <= 0 && (result.afterPressure.snap.counts.enemyBullets || 0) <= 0){
    fail('Galaxy Guardians did not produce dive or projectile pressure during the scout slice', result);
  }

  console.log(JSON.stringify({
    ok: true,
    packKey: result.launched.snap.gameKey,
    enemies: result.launched.snap.counts.enemies,
    playerBulletsAfterShot: result.afterShot.counts.playerBullets,
    activeDives,
    enemyBullets: result.afterPressure.snap.counts.enemyBullets,
    stageTheme: result.afterPressure.snap.theme
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

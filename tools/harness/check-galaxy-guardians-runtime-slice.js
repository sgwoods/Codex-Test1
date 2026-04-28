#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, stage: 1, ships: 3, seed: 42720 }, async ({ page }) => page.evaluate(() => {
    const profile = window.GALAXY_GUARDIANS_RUNTIME_PROFILE || null;
    const state = window.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
    const initial = window.summarizeGalaxyGuardiansRuntime(state);
    const firstShot = window.stepGalaxyGuardiansRuntime(state, .016, { fire: true });
    const afterFirstShotCount = state.events.filter(event => event.type === 'player_shot_fired').length;
    window.stepGalaxyGuardiansRuntime(state, .016, { fire: true });
    const afterSecondShotCount = state.events.filter(event => event.type === 'player_shot_fired').length;
    const secondShotBlocked = afterSecondShotCount === afterFirstShotCount;
    for(let i=0;i<520;i++){
      window.stepGalaxyGuardiansRuntime(state, 1/60, {
        left: i%180 < 90,
        right: i%180 >= 90,
        fire: i%72 === 0
      });
    }
    const summary = window.summarizeGalaxyGuardiansRuntime(state);
    const playableAdapters = typeof availableGameplayAdapters === 'function' ? availableGameplayAdapters() : {};
    return {
      profile,
      initial,
      firstShot: !!firstShot,
      secondShotBlocked,
      summary,
      playableAdapterKeys: Object.keys(playableAdapters),
      forbidden: state.forbiddenAuroraCapabilities,
      hasAuroraState: ['captureRescue','dualFighter','challengeStage','auroraScoring'].some(key => Object.prototype.hasOwnProperty.call(state, key))
    };
  }));

  if(!result.profile || result.profile.status !== 'dev-runtime-slice-not-public-release'){
    fail('Galaxy Guardians runtime profile is missing or not marked dev-only', result);
  }
  if(result.profile.publicPlayable !== 0 || result.profile.devPlayable !== 1){
    fail('Galaxy Guardians runtime profile is not correctly scoped as dev-only', result);
  }
  if(result.playableAdapterKeys.includes('galaxy-guardians-preview')){
    fail('Galaxy Guardians runtime leaked into the public playable adapter registry', result);
  }
  if(result.initial.alienCount !== 38){
    fail('Galaxy Guardians runtime did not create the expected 38-slot scout-wave rack', result);
  }
  if(result.initial.liveRoles.flagship !== 2 || result.initial.liveRoles.escort !== 6 || result.initial.liveRoles.scout !== 30){
    fail('Galaxy Guardians runtime rack roles do not match the promoted scout-wave baseline', result);
  }
  if(!result.firstShot || !result.secondShotBlocked){
    fail('Galaxy Guardians runtime did not enforce the single-shot player fire model', result);
  }
  for(const eventName of ['formation_entry_start','formation_entry_settle','formation_rack_complete','alien_dive_start','flagship_dive_start','escort_join','player_shot_fired','player_shot_resolved']){
    if(!result.summary.eventTypes.includes(eventName)){
      fail(`Galaxy Guardians runtime did not emit ${eventName}`, result);
    }
  }
  const forbidden = result.forbidden || {};
  for(const key of ['usesCaptureRescue','usesDualFighterMode','usesChallengeStages','usesAuroraScoring','usesAuroraEnemyFamilies']){
    if(forbidden[key] !== 0) fail(`Galaxy Guardians runtime did not explicitly disable ${key}`, result);
  }
  if(result.hasAuroraState){
    fail('Galaxy Guardians runtime state includes Aurora-specific state fields', result);
  }
  if(result.summary.gameKey !== 'galaxy-guardians-preview' || result.summary.publicPlayable !== 0 || result.summary.devPlayable !== 1){
    fail('Galaxy Guardians runtime summary does not preserve the dev-only game identity', result);
  }

  console.log(JSON.stringify({
    ok: true,
    alienCount: result.summary.alienCount,
    liveRoles: result.summary.liveRoles,
    eventTypes: result.summary.eventTypes,
    score: result.summary.score
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

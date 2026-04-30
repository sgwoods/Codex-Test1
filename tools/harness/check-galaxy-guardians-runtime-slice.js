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
    state.player.inv = 999;
    for(let i=0;i<520;i++){
      window.stepGalaxyGuardiansRuntime(state, 1/60, {
        left: i%180 < 90,
        right: i%180 >= 90,
        fire: i%72 === 0
      });
    }
    const summary = window.summarizeGalaxyGuardiansRuntime(state);
    const playableAdapters = typeof availableGameplayAdapters === 'function' ? availableGameplayAdapters() : {};
    const pack = window.getGamePack ? window.getGamePack('galaxy-guardians-preview') : null;
    const visualCatalog = pack?.alienVisualCatalog || {};
    const audioCueCatalog = pack?.audioCueCatalog || {};
    const timingState = window.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 42719 });
    timingState.player.inv = 999;
    for(let i=0;i<430;i++){
      window.stepGalaxyGuardiansRuntime(timingState, 1/60, {});
    }
    const firstDiveEvent = timingState.events.find(event => event.type === 'alien_dive_start');
    const flagshipDiveEvent = timingState.events.find(event => event.type === 'flagship_dive_start');
    const escortJoinEvent = timingState.events.find(event => event.type === 'escort_join');
    return {
      profile,
      initial,
      firstShot: !!firstShot,
      secondShotBlocked,
      summary,
      visualCatalogKeys: Object.keys(visualCatalog),
      audioCueCatalogKeys: Object.keys(audioCueCatalog),
      runtimeAlienCatalog: profile?.alienCatalog || {},
      runtimeVisualCatalogKeys: Object.keys(profile?.visualCatalog || {}),
      runtimeAudioCueCatalogKeys: Object.keys(profile?.audioCueCatalog || {}),
      playerVisualId: profile?.playerVisualId || '',
      timing: {
        firstScoutDiveDelay: profile?.rules?.firstScoutDiveDelay,
        flagshipEscortDelay: profile?.rules?.flagshipEscortDelay,
        singleShotCooldown: profile?.rules?.singleShotCooldown,
        firstDiveT: firstDiveEvent?.t,
        flagshipDiveT: flagshipDiveEvent?.t,
        escortJoinT: escortJoinEvent?.t
      },
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
  for(const visualId of ['signal-flagship','signal-escort','signal-scout','player-interceptor']){
    if(!result.visualCatalogKeys.includes(visualId)){
      fail(`Galaxy Guardians pack is missing owned visual catalog entry ${visualId}`, result);
    }
  }
  for(const cueName of ['gameStart','formationPulse','playerShot','enemyShot','scoutDive','flagshipDive','escortJoin','scoutHit','escortHit','flagshipHit','wrapReturn','playerLoss']){
    if(!result.audioCueCatalogKeys.includes(cueName)){
      fail(`Galaxy Guardians pack is missing owned audio cue catalog entry ${cueName}`, result);
    }
  }
  for(const key of ['flagship','escort','scout']){
    const entry = result.runtimeAlienCatalog[key] || {};
    if(!entry.visualId || !result.runtimeVisualCatalogKeys.includes(entry.visualId)){
      fail(`Galaxy Guardians runtime alien ${key} does not map to an owned visual catalog entry`, result);
    }
    if(!entry.diveAudioCue || !entry.hitAudioCue){
      fail(`Galaxy Guardians runtime alien ${key} does not map to owned audio cue ids`, result);
    }
  }
  if(result.playerVisualId !== 'player-interceptor' || !result.runtimeVisualCatalogKeys.includes(result.playerVisualId)){
    fail('Galaxy Guardians runtime does not expose an owned player visual identity', result);
  }
  for(const forbiddenName of ['bee','but','boss','capture','dual','challenge']){
    if(result.summary.visualIds.some(id => String(id).includes(forbiddenName))){
      fail(`Galaxy Guardians runtime visual id leaked Aurora-oriented naming: ${forbiddenName}`, result);
    }
  }
  if(!result.firstShot || !result.secondShotBlocked){
    fail('Galaxy Guardians runtime did not enforce the single-shot player fire model', result);
  }
  if(Math.abs(result.timing.firstDiveT - result.timing.firstScoutDiveDelay) > .08){
    fail('Galaxy Guardians runtime first scout dive timing drifted outside the first timing pass band', result);
  }
  if(Math.abs(result.timing.flagshipDiveT - result.timing.flagshipEscortDelay) > .08 || Math.abs(result.timing.escortJoinT - result.timing.flagshipDiveT) > .001){
    fail('Galaxy Guardians runtime flagship/escort timing drifted outside the first timing pass band', result);
  }
  if(Math.abs(result.timing.singleShotCooldown - .72) > .001){
    fail('Galaxy Guardians runtime single-shot cooldown drifted from the first timing pass baseline', result);
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
  for(const cueId of ['guardians-formation-pulse','guardians-player-single-shot','guardians-scout-dive','guardians-flagship-dive','guardians-escort-join','guardians-wrap-return']){
    if(!result.summary.audioCueIds.includes(cueId)){
      fail(`Galaxy Guardians runtime did not emit owned audio cue id ${cueId}`, result);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    alienCount: result.summary.alienCount,
    liveRoles: result.summary.liveRoles,
    visualIds: result.summary.visualIds,
    audioCueIds: result.summary.audioCueIds,
    eventTypes: result.summary.eventTypes,
    timing: result.timing,
    score: result.summary.score
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

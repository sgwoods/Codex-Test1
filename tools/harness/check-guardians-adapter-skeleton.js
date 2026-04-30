#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, stage: 1, ships: 3, seed: 42719 }, async ({ page }) => page.evaluate(() => {
    const playableAdapters = typeof availableGameplayAdapters === 'function' ? availableGameplayAdapters() : {};
    const skeletons = typeof availableGameplayAdapterSkeletons === 'function' ? availableGameplayAdapterSkeletons() : {};
    const skeleton = skeletons['galaxy-guardians-preview'];
    const initialState = skeleton?.createInitialState?.({ stage: 2, ships: 4 }) || null;
    let startError = '';
    try{
      skeleton?.start?.();
    }catch(err){
      startError = String(err?.message || err);
    }
    return {
      playableAdapterKeys:Object.keys(playableAdapters),
      skeletonKeys:Object.keys(skeletons),
      skeleton:Object.freeze({
        gameKey:skeleton?.gameKey || '',
        enabled:skeleton?.enabled,
        publicPlayable:skeleton?.publicPlayable,
        evidenceRequired:skeleton?.evidenceRequired,
        referenceStatus:skeleton?.referenceProfile?.status || '',
        promotedEventLog:skeleton?.referenceProfile?.promotedEventLog || '',
        promotedEventStatus:skeleton?.referenceProfile?.promotedEventStatus || '',
        promotedEventCount:skeleton?.referenceProfile?.promotedEventCount || 0,
        devRuntime:skeleton?.referenceProfile?.devRuntime || '',
        devRuntimeStatus:skeleton?.referenceProfile?.devRuntimeStatus || '',
        devRuntimeHarness:skeleton?.referenceProfile?.devRuntimeHarness || '',
        referenceSourceCount:skeleton?.referenceProfile?.sourceCount || 0,
        fireMode:skeleton?.profile?.playerFireMode || '',
        formationModel:skeleton?.profile?.formationModel || '',
        flagshipModel:skeleton?.profile?.flagshipModel || '',
        wrapThreatModel:skeleton?.profile?.wrapThreatModel || '',
        evidenceState:skeleton?.profile?.evidenceState || '',
        nextPromotionTargets:skeleton?.referenceProfile?.nextPromotionTargets || [],
        forbiddenAuroraCapabilities:skeleton?.forbiddenAuroraCapabilities || null
      }),
      initialState,
      startError,
      started:window.__galagaHarness__.state().started,
      currentPack:typeof currentGamePackKey === 'function' ? currentGamePackKey() : ''
    };
  }));

  if(result.playableAdapterKeys.includes('galaxy-guardians-preview')){
    fail('Galaxy Guardians skeleton leaked into the playable adapter registry', result);
  }
  if(!result.playableAdapterKeys.includes('aurora-galactica')){
    fail('Aurora playable adapter is missing while checking the Guardians skeleton', result);
  }
  if(!result.skeletonKeys.includes('galaxy-guardians-preview')){
    fail('Galaxy Guardians adapter skeleton is missing', result);
  }
  if(result.skeleton.enabled !== 0 || result.skeleton.publicPlayable !== 0 || result.skeleton.evidenceRequired !== 1){
    fail('Galaxy Guardians skeleton is not explicitly disabled and evidence-gated', result);
  }
  if(result.skeleton.fireMode !== 'single-shot'){
    fail('Galaxy Guardians skeleton does not preserve the single-shot baseline', result);
  }
  if(result.skeleton.referenceStatus !== 'source-manifested-contact-sheets-and-waveforms' || result.skeleton.referenceSourceCount !== 3){
    fail('Galaxy Guardians skeleton is not linked to the measured Galaxian reference profile', result);
  }
  if(!result.skeleton.formationModel.includes('rack') || !result.skeleton.flagshipModel.includes('flagship')){
    fail('Galaxy Guardians skeleton is missing its scout-wave/flagship model labels', result);
  }
  if(result.skeleton.promotedEventLog !== 'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json' || result.skeleton.promotedEventStatus !== 'promoted-reviewed-event-windows'){
    fail('Galaxy Guardians skeleton is not linked to the promoted Galaxian event log', result);
  }
  if(result.skeleton.promotedEventCount < 11){
    fail('Galaxy Guardians skeleton does not carry the promoted scout-wave event count', result);
  }
  if(result.skeleton.devRuntime !== 'src/js/13-galaxy-guardians-runtime.js' || result.skeleton.devRuntimeStatus !== 'dev-runtime-slice-not-public-release'){
    fail('Galaxy Guardians skeleton is not linked to the dev runtime slice', result);
  }
  if(result.skeleton.devRuntimeHarness !== 'tools/harness/check-galaxy-guardians-runtime-slice.js'){
    fail('Galaxy Guardians skeleton does not cite the runtime slice harness', result);
  }
  if(result.skeleton.wrapThreatModel !== 'bottom-exit-or-return-explicit-preview-rule'){
    fail('Galaxy Guardians skeleton lost the explicit wrap/return preview rule', result);
  }
  if(result.skeleton.evidenceState !== 'promoted-event-log-awaiting-runtime-implementation'){
    fail('Galaxy Guardians skeleton lost its promoted-event-log evidence state', result);
  }
  for(const eventName of ['formation_entry_start','alien_dive_start','flagship_dive_start','escort_join','enemy_wrap_or_return']){
    if(!result.skeleton.nextPromotionTargets.includes(eventName)){
      fail(`Galaxy Guardians skeleton missing promotion event ${eventName}`, result);
    }
  }
  const forbidden = result.skeleton.forbiddenAuroraCapabilities || {};
  for(const key of ['usesCaptureRescue','usesDualFighterMode','usesChallengeStages','usesAuroraScoring','usesAuroraEnemyFamilies']){
    if(forbidden[key] !== 0) fail(`Galaxy Guardians skeleton did not explicitly disable ${key}`, result);
  }
  if(!result.initialState || result.initialState.gameKey !== 'galaxy-guardians-preview'){
    fail('Galaxy Guardians skeleton did not create its own initial state shape', result);
  }
  for(const key of ['captureRescue','dualFighter','challengeStage','auroraScoring']){
    if(result.initialState[key] !== null) fail(`Galaxy Guardians initial state unexpectedly includes ${key}`, result);
  }
  if(result.initialState.fireMode !== 'single-shot' || result.initialState.stage !== 2 || result.initialState.lives !== 4){
    fail('Galaxy Guardians initial state did not preserve configured skeleton state', result);
  }
  if(result.initialState.sourceProfile !== 'reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json'){
    fail('Galaxy Guardians initial state does not cite the measured profile', result);
  }
  if(result.initialState.promotedEventLog !== 'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json'){
    fail('Galaxy Guardians initial state does not cite the promoted event log', result);
  }
  if(result.initialState.devRuntime !== 'src/js/13-galaxy-guardians-runtime.js'){
    fail('Galaxy Guardians initial state does not cite the dev runtime slice', result);
  }
  if(!result.startError.includes('disabled until measured 0.1 scout-wave evidence exists')){
    fail('Galaxy Guardians skeleton start did not fail closed with the expected evidence gate', result);
  }
  if(result.started){
    fail('Galaxy Guardians skeleton started gameplay while disabled', result);
  }

  console.log(JSON.stringify({
    ok:true,
    playableAdapterKeys:result.playableAdapterKeys,
    skeletonKeys:result.skeletonKeys,
    fireMode:result.initialState.fireMode,
    startGate:result.startError
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

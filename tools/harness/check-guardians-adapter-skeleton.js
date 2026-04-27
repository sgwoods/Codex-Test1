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
        fireMode:skeleton?.profile?.playerFireMode || '',
        formationModel:skeleton?.profile?.formationModel || '',
        flagshipModel:skeleton?.profile?.flagshipModel || '',
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
  if(!result.skeleton.formationModel.includes('rack') || !result.skeleton.flagshipModel.includes('flagship')){
    fail('Galaxy Guardians skeleton is missing its scout-wave/flagship model labels', result);
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

#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 240427 }, async ({ page }) => page.evaluate(() => {
    const packs = typeof availableGamePacks === 'function' ? availableGamePacks() : {};
    const aurora = packs['aurora-galactica'];
    const guardians = packs['galaxy-guardians-preview'];
    if(!aurora || !guardians){
      return { ok: false, reason: 'missing-pack', packKeys: Object.keys(packs) };
    }

    const sharedFields = [
      'atmosphereThemes',
      'audioThemes',
      'referenceTimings',
      'stageCadence',
      'stageBandProfiles',
      'formationLayouts',
      'challengeLayout',
      'stageThemeProgression',
      'frameAccents',
      'scoring'
    ];
    const sharedReferences = sharedFields.filter(field => aurora[field] === guardians[field]);

    installGamePack('galaxy-guardians-preview');
    const guardiansCadence = currentGamePack().stageCadence;
    const guardianIsChallenge = stage => stage === guardiansCadence.challengeFirstStage
      || ((stage - guardiansCadence.challengeFirstStage) % guardiansCadence.challengeEvery === 0 && stage > guardiansCadence.challengeFirstStage);
    const guardianState = {
      key: currentGamePackKey(),
      playable: currentGamePackPlayable(),
      stage3Challenge: guardianIsChallenge(3),
      stage7Challenge: guardianIsChallenge(7),
      challengeGroups: currentGamePack().challengeLayout?.groups,
      atmosphereTheme: currentGamePackResolvedAtmosphere({ frontDoor: true })?.id,
      audioTheme: currentGamePackAudioTheme('guardians-signal')?.id,
      referenceTiming: currentGamePackReferenceTiming('previewEntry')
    };

    installGamePack('aurora-galactica');
    const auroraCadence = currentGamePack().stageCadence;
    const auroraIsChallenge = stage => stage === auroraCadence.challengeFirstStage
      || ((stage - auroraCadence.challengeFirstStage) % auroraCadence.challengeEvery === 0 && stage > auroraCadence.challengeFirstStage);
    const auroraState = {
      key: currentGamePackKey(),
      playable: currentGamePackPlayable(),
      stage3Challenge: auroraIsChallenge(3),
      referenceTiming: currentGamePackReferenceTiming('stage1Opening')
    };

    return {
      ok: true,
      packKeys: Object.keys(packs),
      sharedReferences,
      guardianCapabilities: guardians.capabilities,
      guardianState,
      auroraState
    };
  }));

  if(!result.ok) fail('Pack registry boundary check failed before assertions', result);
  if(result.sharedReferences.length){
    fail('Galaxy Guardians directly shares game-owned table references with Aurora', result);
  }
  if(result.guardianState.key !== 'galaxy-guardians-preview'){
    fail('Galaxy Guardians could not be installed as the active preview pack', result);
  }
  if(result.guardianState.playable !== false){
    fail('Galaxy Guardians preview became playable before a gameplay adapter exists', result);
  }
  if(result.guardianState.stage3Challenge || result.guardianState.stage7Challenge){
    fail('Galaxy Guardians preview inherited Aurora challenge cadence', result);
  }
  if(result.guardianState.challengeGroups !== 0){
    fail('Galaxy Guardians preview inherited Aurora challenge layout groups', result);
  }
  if(result.guardianState.atmosphereTheme !== 'signal-rack'){
    fail('Galaxy Guardians preview did not resolve its pack-owned atmosphere theme', result);
  }
  if(result.guardianState.audioTheme !== 'guardians-signal'){
    fail('Galaxy Guardians preview did not resolve its pack-owned audio theme', result);
  }
  if(!result.guardianState.referenceTiming || result.guardianState.referenceTiming.firstScoutDiveDelay !== 2.2){
    fail('Galaxy Guardians preview did not resolve pack-owned reference timing data', result);
  }
  if(result.auroraState.key !== 'aurora-galactica' || result.auroraState.playable !== true){
    fail('Aurora did not restore as the playable default pack', result);
  }
  if(!result.auroraState.stage3Challenge){
    fail('Aurora challenge cadence was damaged by the pack split', result);
  }
  if(!result.auroraState.referenceTiming || result.auroraState.referenceTiming.startPhraseDuration !== 4){
    fail('Aurora reference timing data was damaged by the pack split', result);
  }

  console.log(JSON.stringify({
    ok: true,
    packKeys: result.packKeys,
    checkedBoundaryFields: 9,
    guardiansPlayable: result.guardianState.playable,
    guardiansChallengeGroups: result.guardianState.challengeGroups,
    auroraStage3Challenge: result.auroraState.stage3Challenge
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

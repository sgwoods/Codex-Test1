#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'movement-pacing-0.1.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const RUNTIME_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-runtime.js');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function loadGuardiansRuntime(){
  const packSource = fs.readFileSync(PACK_SOURCE, 'utf8');
  const runtimeSource = fs.readFileSync(RUNTIME_SOURCE, 'utf8');
  const sandbox = {
    window: null,
    GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES: Object.freeze({
      usesCaptureRescue: 0,
      usesDualFighterMode: 0,
      usesChallengeStages: 0,
      usesAuroraScoring: 0,
      usesAuroraEnemyFamilies: 0
    })
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${packSource}\n${runtimeSource}`, sandbox, { filename: 'galaxy-guardians-runtime-vm.js' });
  return sandbox;
}

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadGuardiansRuntime();
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 42719 });
  state.player.inv = 999;
  const samples = [];
  for(let i=0;i<620;i++){
    runtime.stepGalaxyGuardiansRuntime(state, 1/60, { fire: i % 90 === 0 });
    if(i % 30 === 0){
      const summary = runtime.summarizeGalaxyGuardiansRuntime(state);
      samples.push({
        t: +state.t.toFixed(3),
        activeDives: summary.activeDives,
        events: summary.eventTypes
      });
    }
  }
  const summary = runtime.summarizeGalaxyGuardiansRuntime(state);
  const firstScoutDive = state.events.find(event => event.type === 'alien_dive_start');
  const firstFlagshipDive = state.events.find(event => event.type === 'flagship_dive_start');
  const firstEscortJoin = state.events.find(event => event.type === 'escort_join');
  const wrapCount = state.events.filter(event => event.type === 'enemy_wrap_or_return').length;
  const linkedEscortSamples = samples.flatMap(sample => sample.activeDives.filter(dive => dive.linkedTo));
  const rules = runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
  const result = {
    specStatus: artifact.status,
    rules: {
      playerSpeedPxPerSecond: rules.playerSpeed,
      formationDriftAmplitudePx: rules.formationDriftAmplitude,
      formationDriftHz: rules.formationDriftHz,
      scoutDiveIntervalBaseSeconds: rules.scoutDiveIntervalBase,
      scoutDiveIntervalJitterSeconds: rules.scoutDiveIntervalJitter,
      flagshipDiveIntervalBaseSeconds: rules.flagshipDiveIntervalBase,
      flagshipDiveIntervalJitterSeconds: rules.flagshipDiveIntervalJitter,
      diveSwayAmplitudePx: rules.diveSwayAmplitude,
      diveSwayHz: rules.diveSwayHz,
      diveSideDriftPxPerSecond: rules.diveSideDrift,
      diveBaseVyPxPerSecond: rules.diveBaseVy,
      diveAccelPxPerSecondSquared: rules.diveAccel,
      escortSpacingPx: rules.escortSpacing,
      escortLagSeconds: rules.escortLag,
      escortYOffsetPx: rules.escortYOffset,
      bottomExitPaddingPx: rules.bottomExitPadding
    },
    firstScoutDive,
    firstFlagshipDive,
    firstEscortJoin,
    wrapCount,
    linkedEscortSamples,
    summary
  };

  if(result.specStatus !== 'dev-preview-pacing-contract-not-public-release-tuning'){
    fail('Guardians movement/pacing artifact has the wrong status', result);
  }
  for(const [key, expected] of Object.entries(artifact.runtimeRules || {})){
    if(Math.abs((+result.rules[key] || 0) - (+expected || 0)) > .0001){
      fail(`Runtime pacing rule ${key} drifted from the persistent artifact`, result);
    }
  }
  const bands = artifact.runtimeExpectations || {};
  const inBand = (value, band) => Number.isFinite(+value) && Array.isArray(band) && +value >= band[0] && +value <= band[1];
  if(!inBand(result.firstScoutDive?.t, bands.firstScoutDiveBandSeconds)){
    fail('First scout dive timing drifted outside the movement/pacing artifact band', result);
  }
  if(!inBand(result.firstFlagshipDive?.t, bands.firstFlagshipDiveBandSeconds)){
    fail('First flagship dive timing drifted outside the movement/pacing artifact band', result);
  }
  const escortDelta = +(result.firstEscortJoin?.t - result.firstFlagshipDive?.t).toFixed(3);
  if(!inBand(escortDelta, bands.escortJoinDeltaSeconds)){
    fail('Escort join timing no longer matches the flagship dive event window', result);
  }
  if((result.firstEscortJoin?.escorts || 0) < bands.minimumLinkedEscortCountOnFirstFlagshipDive){
    fail('First flagship dive did not attach the expected escort count', result);
  }
  if(result.linkedEscortSamples.length < bands.minimumLinkedEscortCountOnFirstFlagshipDive){
    fail('Movement samples did not show escorts linked to a flagship dive', result);
  }
  if(result.wrapCount < bands.minimumWrapEventsByNineSeconds){
    fail('Runtime did not produce enough wrap/return pressure by the pacing window', result);
  }
  if(!result.summary.activeDives || !Array.isArray(result.summary.activeDives)){
    fail('Runtime summary no longer exposes active dive snapshots for movement review', result);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    firstScoutDiveT: result.firstScoutDive.t,
    firstFlagshipDiveT: result.firstFlagshipDive.t,
    escortJoinT: result.firstEscortJoin.t,
    escortIds: result.firstEscortJoin.escortIds,
    wrapCount: result.wrapCount,
    linkedEscortSamples: result.linkedEscortSamples.length
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

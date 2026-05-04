#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/stage-rank-pressure-0.1.json';
const PACK_SOURCE = 'src/js/13-galaxy-guardians-game-pack.js';
const RUNTIME_SOURCE = 'src/js/13-galaxy-guardians-runtime.js';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function loadRuntime(){
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
  vm.runInContext(
    `${fs.readFileSync(path.join(ROOT, PACK_SOURCE), 'utf8')}\n${fs.readFileSync(path.join(ROOT, RUNTIME_SOURCE), 'utf8')}`,
    sandbox,
    { filename: 'galaxy-guardians-stage-rank-pressure-vm.js' }
  );
  return sandbox;
}

function inBand(value, band){
  return Number.isFinite(+value) && Array.isArray(band) && +value >= band[0] && +value <= band[1];
}

function ruleSubset(rules){
  return {
    firstScoutDiveDelay: rules.firstScoutDiveDelay,
    flagshipEscortDelay: rules.flagshipEscortDelay,
    scoutDiveIntervalBase: rules.scoutDiveIntervalBase,
    firstEnemyShotDelay: rules.firstEnemyShotDelay,
    enemyShotIntervalBase: rules.enemyShotIntervalBase,
    enemyShotMaxLive: rules.enemyShotMaxLive,
    enemyShotVy: rules.enemyShotVy,
    diveBaseVy: rules.diveBaseVy,
    diveAccel: rules.diveAccel,
    formationDriftHz: rules.formationDriftHz
  };
}

function simulate(ctx, stage, seconds){
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage, ships: 3, seed: 1979 });
  state.player.inv = 999;
  const frames = Math.round(seconds * 60);
  for(let i = 0; i < frames; i++){
    ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {
      left: i % 180 < 90,
      right: i % 180 >= 90,
      fire: i % 72 === 0
    });
  }
  const events = state.events;
  return {
    stage,
    t: +state.t.toFixed(3),
    diveEvents: events.filter(event => event.type === 'alien_dive_start' || event.type === 'flagship_dive_start').length,
    enemyShots: events.filter(event => event.type === 'enemy_shot').length,
    wraps: events.filter(event => event.type === 'enemy_wrap_or_return').length,
    firstScoutDiveT: events.find(event => event.type === 'alien_dive_start')?.t || 0,
    firstFlagshipDiveT: events.find(event => event.type === 'flagship_dive_start')?.t || 0,
    eventTypes: Array.from(new Set(events.map(event => event.type)))
  };
}

function main(){
  const artifact = readJson(ARTIFACT);
  const ctx = loadRuntime();
  const rules = {
    stage1: ruleSubset(ctx.guardiansRuntimeRules(1)),
    stage3: ruleSubset(ctx.guardiansRuntimeRules(3)),
    stage5: ruleSubset(ctx.guardiansRuntimeRules(5)),
    stage7: ruleSubset(ctx.guardiansRuntimeRules(7))
  };
  const sims = {
    stage1: simulate(ctx, 1, artifact.eventDensityTargets.simulationWindowSeconds),
    stage3: simulate(ctx, 3, artifact.eventDensityTargets.simulationWindowSeconds),
    stage5: simulate(ctx, 5, artifact.eventDensityTargets.simulationWindowSeconds)
  };
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    ranks: {
      stage1: ctx.guardiansStageRank(1),
      stage3: ctx.guardiansStageRank(3),
      stage5: ctx.guardiansStageRank(5),
      stage7: ctx.guardiansStageRank(7)
    },
    rules,
    sims
  };

  if(artifact.status !== 'dev-preview-stage-pressure-contract-not-final-reference-match'){
    fail('Guardians stage-rank pressure artifact has the wrong status', payload);
  }
  for(const relPath of Object.values(artifact.sourceEvidence || {})){
    if(!fs.existsSync(path.join(ROOT, relPath))) fail(`Missing stage-rank pressure evidence file: ${relPath}`, payload);
  }
  for(const [key, expected] of Object.entries(artifact.stageOneMustPreserve || {})){
    if(Math.abs((+rules.stage1[key] || 0) - (+expected || 0)) > .0001){
      fail(`Stage-one pressure rule ${key} drifted from the evidence baseline`, payload);
    }
  }

  const stage3 = artifact.stageThreeTargets || {};
  const stage5 = artifact.stageFiveTargets || {};
  const checks = [
    ['stage3', 'firstScoutDiveDelay', 'firstScoutDiveDelayBandSeconds'],
    ['stage3', 'scoutDiveIntervalBase', 'scoutDiveIntervalBaseBandSeconds'],
    ['stage3', 'firstEnemyShotDelay', 'firstEnemyShotDelayBandSeconds'],
    ['stage3', 'enemyShotIntervalBase', 'enemyShotIntervalBaseBandSeconds'],
    ['stage3', 'enemyShotMaxLive', 'enemyShotMaxLive'],
    ['stage3', 'enemyShotVy', 'enemyShotVyBandPxPerSecond'],
    ['stage3', 'diveBaseVy', 'diveBaseVyBandPxPerSecond'],
    ['stage3', 'diveAccel', 'diveAccelBandPxPerSecondSquared'],
    ['stage3', 'formationDriftHz', 'formationDriftHzBand'],
    ['stage5', 'firstScoutDiveDelay', 'firstScoutDiveDelayBandSeconds'],
    ['stage5', 'scoutDiveIntervalBase', 'scoutDiveIntervalBaseBandSeconds'],
    ['stage5', 'firstEnemyShotDelay', 'firstEnemyShotDelayBandSeconds'],
    ['stage5', 'enemyShotIntervalBase', 'enemyShotIntervalBaseBandSeconds'],
    ['stage5', 'enemyShotMaxLive', 'enemyShotMaxLive'],
    ['stage5', 'enemyShotVy', 'enemyShotVyBandPxPerSecond'],
    ['stage5', 'diveBaseVy', 'diveBaseVyBandPxPerSecond'],
    ['stage5', 'diveAccel', 'diveAccelBandPxPerSecondSquared'],
    ['stage5', 'formationDriftHz', 'formationDriftHzBand']
  ];
  for(const [stageName, ruleName, bandName] of checks){
    const target = stageName === 'stage3' ? stage3 : stage5;
    const targetBand = Array.isArray(target[bandName]) ? target[bandName] : [target[bandName], target[bandName]];
    if(!inBand(rules[stageName][ruleName], targetBand)){
      fail(`${stageName} ${ruleName} is outside the stage-rank pressure target`, payload);
    }
  }
  if(JSON.stringify(rules.stage5) !== JSON.stringify(rules.stage7)){
    fail('Stage-rank pressure did not cap after the preview maximum rank', payload);
  }
  const density = artifact.eventDensityTargets || {};
  if(sims.stage3.firstScoutDiveT >= sims.stage1.firstScoutDiveT || sims.stage5.firstScoutDiveT >= sims.stage3.firstScoutDiveT){
    fail('Stage-rank pressure did not make first scout dives arrive earlier by stage', payload);
  }
  if(sims.stage3.diveEvents - sims.stage1.diveEvents < density.stageThreeMinimumExtraDiveEventsOverStageOne){
    fail('Stage three did not add enough dive pressure over stage one', payload);
  }
  if(sims.stage3.enemyShots - sims.stage1.enemyShots < density.stageThreeMinimumExtraEnemyShotsOverStageOne){
    fail('Stage three did not add enough shot pressure over stage one', payload);
  }
  if(sims.stage5.diveEvents - sims.stage1.diveEvents < density.stageFiveMinimumExtraDiveEventsOverStageOne){
    fail('Stage five did not add enough dive pressure over stage one', payload);
  }
  if(sims.stage5.enemyShots - sims.stage1.enemyShots < density.stageFiveMinimumExtraEnemyShotsOverStageOne){
    fail('Stage five did not add enough shot pressure over stage one', payload);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    ranks: payload.ranks,
    stage1: rules.stage1,
    stage3: rules.stage3,
    stage5: rules.stage5,
    eventDensity: {
      stage1: sims.stage1,
      stage3: sims.stage3,
      stage5: sims.stage5
    }
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

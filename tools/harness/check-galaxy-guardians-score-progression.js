#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'score-progression-0.1.json');
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
  vm.runInContext(`${packSource}\n${runtimeSource}`, sandbox, { filename: 'galaxy-guardians-score-progression-vm.js' });
  vm.runInContext(`
    this.GALAXY_GUARDIANS_PACK = GALAXY_GUARDIANS_PACK;
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
  `, sandbox);
  return sandbox;
}

function hitScore(runtime, type, mode, escorts=0){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 9001 });
  state.player.inv = 999;
  if(mode === 'formation'){
    for(let i = 0; i < 90; i++) runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  }
  const alien = state.aliens.find(entry => entry.type === type);
  if(!alien) throw new Error(`Missing alien type ${type}`);
  alien.mode = mode;
  alien.escorts = escorts;
  alien.diveStartX = alien.x;
  alien.diveStartY = alien.y;
  alien.diveSide = alien.x < runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldWidth / 2 ? -1 : 1;
  alien.diveT = 0;
  state.player.shot = { x: alien.x, y: alien.y + 4, vy: -10, active: 1 };
  runtime.stepGalaxyGuardiansRuntime(state, 0, {});
  const event = state.events.find(entry => entry.type === 'player_shot_resolved' && entry.result === 'hit');
  return { score: state.score, event };
}

function simulateWaveAdvance(runtime){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  state.player.inv = 999;
  state.score = 1230;
  for(const alien of state.aliens) alien.hp = 0;
  runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  const afterClear = runtime.summarizeGalaxyGuardiansRuntime(state);
  for(let i = 0; i < Math.ceil((runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.waveClearDelay + .1) * 60); i++){
    runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  }
  const afterAdvance = runtime.summarizeGalaxyGuardiansRuntime(state);
  return { afterClear, afterAdvance };
}

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadGuardiansRuntime();
  const pack = runtime.GALAXY_GUARDIANS_PACK;
  const rules = runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
  const scoreTable = pack.scoreAdvanceTable || [];
  const scoreByRole = Object.fromEntries(scoreTable.map(row => [row.role, row]));
  const scoreCases = {
    scoutFormationPoints: hitScore(runtime, 'scout', 'formation').score,
    scoutDivePoints: hitScore(runtime, 'scout', 'diving').score,
    escortFormationPoints: hitScore(runtime, 'escort', 'formation').score,
    escortDivePoints: hitScore(runtime, 'escort', 'diving').score,
    flagshipFormationPoints: hitScore(runtime, 'flagship', 'formation').score,
    flagshipDivePoints: hitScore(runtime, 'flagship', 'diving').score,
    flagshipOneEscortDivePoints: hitScore(runtime, 'flagship', 'diving', 1).score,
    flagshipTwoEscortDivePoints: hitScore(runtime, 'flagship', 'diving', 2).score
  };
  const progression = simulateWaveAdvance(runtime);
  const payload = {
    artifactStatus: artifact.status,
    mission: pack.attractMission,
    scoreTable,
    scoreCases,
    waveClearDelay: rules.waveClearDelay,
    progression,
    forbiddenAuroraCapabilities: runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.forbiddenAuroraCapabilities
  };

  if(artifact.gameKey !== pack.metadata?.gameKey || artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians score/progression artifact is not linked to the preview pack', payload);
  }
  if(artifact.status !== 'dev-preview-score-table-and-wave-progression-contract-not-public-release-tuning'){
    fail('Guardians score/progression artifact has the wrong status', payload);
  }
  if(pack.metadata?.playable !== 0 || runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.publicPlayable !== 0){
    fail('Guardians score/progression work crossed the public playable boundary', payload);
  }
  if(!pack.attractMission || pack.attractMission.title !== artifact.attractMission.title){
    fail('Guardians attract mission title drifted from the persistent artifact', payload);
  }
  for(const line of artifact.attractMission.requiredLines || []){
    if(!Array.from(pack.attractMission.lines || []).includes(line)){
      fail(`Guardians attract mission is missing line: ${line}`, payload);
    }
  }
  for(const row of artifact.scoreAdvanceTable || []){
    const runtimeRow = scoreByRole[row.role];
    if(!runtimeRow || runtimeRow.id !== row.id){
      fail(`Guardians score table is missing role ${row.role}`, payload);
    }
    for(const [key, expected] of Object.entries(row)){
      if(key === 'id' || key === 'role') continue;
      if((+runtimeRow[key] || 0) !== (+expected || 0)){
        fail(`Guardians score table value ${row.role}.${key} drifted from artifact`, payload);
      }
    }
  }
  if(scoreCases.scoutFormationPoints !== scoreByRole.scout.formationPoints) fail('Scout formation score does not match the score table', payload);
  if(scoreCases.scoutDivePoints !== scoreByRole.scout.divePoints) fail('Scout dive score does not match the score table', payload);
  if(scoreCases.escortFormationPoints !== scoreByRole.escort.formationPoints) fail('Escort formation score does not match the score table', payload);
  if(scoreCases.escortDivePoints !== scoreByRole.escort.divePoints) fail('Escort dive score does not match the score table', payload);
  if(scoreCases.flagshipFormationPoints !== scoreByRole.flagship.formationPoints) fail('Flagship formation score does not match the score table', payload);
  if(scoreCases.flagshipDivePoints !== scoreByRole.flagship.divePoints) fail('Flagship dive score does not match the score table', payload);
  if(scoreCases.flagshipOneEscortDivePoints !== scoreByRole.flagship.oneEscortDivePoints) fail('Flagship one-escort score does not match the score table', payload);
  if(scoreCases.flagshipTwoEscortDivePoints !== scoreByRole.flagship.twoEscortDivePoints) fail('Flagship two-escort score does not match the score table', payload);

  const waveRules = artifact.waveProgressionRules || {};
  if(Math.abs((+rules.waveClearDelay || 0) - (+waveRules.waveClearDelaySeconds || 0)) > .0001){
    fail('Guardians wave-clear delay drifted from the persistent artifact', payload);
  }
  if(!progression.afterClear.waveClearPending || !progression.afterClear.eventTypes.includes(waveRules.waveClearEvent)){
    fail('Guardians did not emit wave_clear when the rack was cleared', payload);
  }
  if(progression.afterAdvance.stage !== 2 || progression.afterAdvance.alienCount !== waveRules.nextStageAlienCount){
    fail('Guardians did not advance to a fresh next-stage rack after wave clear', payload);
  }
  if(!progression.afterAdvance.eventTypes.includes(waveRules.stageAdvanceEvent) || !progression.afterAdvance.eventTypes.includes('wave_reset')){
    fail('Guardians did not emit stage_advance and wave_reset during progression', payload);
  }
  if(waveRules.scoreMustPersist && progression.afterAdvance.score !== 1230){
    fail('Guardians score did not persist across stage advance', payload);
  }
  if(waveRules.livesMustPersist && progression.afterAdvance.lives !== 3){
    fail('Guardians lives did not persist across stage advance', payload);
  }
  for(const [key, expected] of Object.entries(artifact.forbiddenAuroraCarryover || {})){
    if((runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.forbiddenAuroraCapabilities || {})[key] !== expected){
      fail(`Guardians score/progression leaked forbidden Aurora capability ${key}`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    scoreCases,
    missionTitle: pack.attractMission.title,
    waveClearDelay: rules.waveClearDelay,
    afterClear: {
      stage: progression.afterClear.stage,
      waveClearPending: progression.afterClear.waveClearPending,
      eventTypes: progression.afterClear.eventTypes
    },
    afterAdvance: {
      stage: progression.afterAdvance.stage,
      alienCount: progression.afterAdvance.alienCount,
      score: progression.afterAdvance.score,
      lives: progression.afterAdvance.lives,
      eventTypes: progression.afterAdvance.eventTypes
    }
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

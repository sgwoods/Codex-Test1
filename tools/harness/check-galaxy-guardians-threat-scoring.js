#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'threat-scoring-0.1.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const RUNTIME_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-runtime.js');
const ADAPTER_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-gameplay-adapter.js');

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
  vm.runInContext(`${packSource}\n${runtimeSource}`, sandbox, { filename: 'galaxy-guardians-threat-scoring-vm.js' });
  return sandbox;
}

function hitScore(runtime, type, mode, escorts=0){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 9001 });
  state.player.inv = 999;
  if(mode === 'formation'){
    for(let i=0;i<90;i++) runtime.stepGalaxyGuardiansRuntime(state, 1/60, {});
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

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadGuardiansRuntime();
  const adapterSource = fs.readFileSync(ADAPTER_SOURCE, 'utf8');
  const rules = runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
  const result = {
    artifactStatus: artifact.status,
    rules: {
      firstEnemyShotDelaySeconds: rules.firstEnemyShotDelay,
      enemyShotIntervalBaseSeconds: rules.enemyShotIntervalBase,
      enemyShotIntervalJitterSeconds: rules.enemyShotIntervalJitter,
      enemyShotVyPxPerSecond: rules.enemyShotVy,
      enemyShotMaxLive: rules.enemyShotMaxLive,
      enemyShotStartYOffsetPx: rules.enemyShotStartYOffset,
      enemyShotPlayerHitboxPx: rules.enemyShotPlayerHitbox,
      enemyShotBottomPaddingPx: rules.enemyShotBottomPadding
    },
    events: {},
    scoreCases: {
      scoutFormationPoints: hitScore(runtime, 'scout', 'formation').score,
      scoutDivePoints: hitScore(runtime, 'scout', 'diving').score,
      escortFormationPoints: hitScore(runtime, 'escort', 'formation').score,
      escortDivePoints: hitScore(runtime, 'escort', 'diving').score,
      flagshipFormationPoints: hitScore(runtime, 'flagship', 'formation').score,
      flagshipDivePoints: hitScore(runtime, 'flagship', 'diving').score,
      flagshipOneEscortDivePoints: hitScore(runtime, 'flagship', 'diving', 1).score,
      flagshipTwoEscortDivePoints: hitScore(runtime, 'flagship', 'diving', 2).score
    }
  };

  const threatState = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 42719 });
  threatState.player.inv = 999;
  for(let i=0;i<360;i++) runtime.stepGalaxyGuardiansRuntime(threatState, 1/60, {});
  const threatSummary = runtime.summarizeGalaxyGuardiansRuntime(threatState);
  const enemyShotEvents = threatState.events.filter(event => event.type === 'enemy_shot');
  result.events.firstEnemyShot = enemyShotEvents[0];
  result.events.enemyShotCount = enemyShotEvents.length;
  result.events.liveEnemyShotCount = threatSummary.enemyShotCount;
  result.events.audioCueIds = threatSummary.audioCueIds;

  const lossState = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  lossState.player.inv = 0;
  lossState.enemyShots.push({
    id: 'forced-threat-harness-shot',
    role: 'scout',
    x: lossState.player.x,
    y: lossState.player.y - 2,
    vy: 0,
    active: 1
  });
  runtime.stepGalaxyGuardiansRuntime(lossState, 1/60, {});
  result.events.loss = lossState.events.find(event => event.type === 'player_lost') || null;

  if(result.artifactStatus !== 'dev-preview-threat-scoring-contract-not-public-release-tuning'){
    fail('Guardians threat/scoring artifact has the wrong status', result);
  }
  for(const [key, expected] of Object.entries(artifact.runtimeRules || {})){
    if(Math.abs((+result.rules[key] || 0) - (+expected || 0)) > .0001){
      fail(`Runtime threat rule ${key} drifted from the persistent artifact`, result);
    }
  }
  for(const [key, expected] of Object.entries(artifact.scoringRules || {})){
    if((+result.scoreCases[key] || 0) !== (+expected || 0)){
      fail(`Runtime scoring rule ${key} drifted from the persistent artifact`, result);
    }
  }
  const expectations = artifact.runtimeExpectations || {};
  const band = expectations.firstEnemyShotBandSeconds || [];
  const firstShotT = +result.events.firstEnemyShot?.t;
  if(!Number.isFinite(firstShotT) || firstShotT < band[0] || firstShotT > band[1]){
    fail('First enemy-shot timing drifted outside the threat/scoring artifact band', result);
  }
  if(result.events.enemyShotCount < expectations.minimumEnemyShotsBySixSeconds){
    fail('Runtime did not produce enough lower-field shot pressure by six seconds', result);
  }
  if(result.events.liveEnemyShotCount > expectations.maximumLiveEnemyShots){
    fail('Runtime exceeded the enemy-shot live cap', result);
  }
  if(!result.events.audioCueIds.includes(expectations.requiredAudioCueId)){
    fail('Runtime did not emit the owned Guardians enemy-shot cue id', result);
  }
  if(result.events.loss?.cause !== expectations.requiredPlayerLossCause){
    fail('Enemy shot did not resolve to the expected player-loss cause', result);
  }
  if(!adapterSource.includes("event.type==='enemy_shot'") || !adapterSource.includes("return 'enemyShot'")){
    fail('Guardians adapter does not map enemy_shot events to the owned enemyShot cue', result);
  }
  if((lossState.forbiddenAuroraCapabilities || {}).usesCaptureRescue !== 0 || Object.prototype.hasOwnProperty.call(lossState, 'captureRescue')){
    fail('Enemy-shot player loss leaked Aurora capture/dual-fighter state into Guardians', result);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    firstEnemyShotT: firstShotT,
    enemyShotEventsBySixSeconds: result.events.enemyShotCount,
    liveEnemyShotCount: result.events.liveEnemyShotCount,
    lossCause: result.events.loss.cause,
    scoreCases: result.scoreCases
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

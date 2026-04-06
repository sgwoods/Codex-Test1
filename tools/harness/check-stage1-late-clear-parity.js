#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const EXPECTED = Object.freeze([
  Object.freeze({ type: 'enemy_attack_start', id: 65670271, enemyType: 'but', column: 2, row: 0, mode: 'dive', targetLane: 5 }),
  Object.freeze({ type: 'enemy_attack_start', id: 529755315, enemyType: 'but', column: 7, row: 1, mode: 'dive', targetLane: 3 }),
  Object.freeze({ type: 'enemy_attack_start', id: 777277430, enemyType: 'bee', column: 0, row: 2, mode: 'dive', targetLane: 6 }),
  Object.freeze({ type: 'enemy_lower_field', id: 777277430, enemyType: 'bee', column: 0, row: 2, stageClock: 13.467 }),
  Object.freeze({ type: 'ship_lost', enemyId: 777277430, enemyType: 'bee', cause: 'enemy_collision', stageClock: 13.867, score: 1780, playerLane: 5, enemyLane: 5 }),
  Object.freeze({ type: 'enemy_attack_start', id: 561491394, enemyType: 'bee', column: 8, row: 2, mode: 'dive', targetLane: 5 }),
  Object.freeze({ type: 'enemy_lower_field', id: 561491394, enemyType: 'bee', column: 8, row: 2, stageClock: 15.283 }),
  Object.freeze({ type: 'enemy_attack_start', id: 204735222, enemyType: 'but', column: 3, row: 1, mode: 'dive', targetLane: 4 }),
  Object.freeze({ type: 'enemy_attack_start', id: 820051368, enemyType: 'boss', column: 6, row: 0, mode: 'dive', targetLane: 6 }),
  Object.freeze({ type: 'enemy_attack_start', id: 329274256, enemyType: 'bee', column: 1, row: 2, mode: 'dive', targetLane: 4 }),
  Object.freeze({ type: 'enemy_attack_start', id: 925902285, enemyType: 'but', column: 0, row: 0, mode: 'dive', targetLane: 3 }),
  Object.freeze({ type: 'stage_clear', score: 3500 })
]);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function roundMaybe(value){
  return value == null ? null : +(+(value)).toFixed(3);
}

function normalizeEvent(event){
  if(event.type === 'enemy_attack_start'){
    return {
      type: event.type,
      id: event.id ?? null,
      enemyType: event.enemyType ?? null,
      column: event.column ?? null,
      row: event.row ?? null,
      mode: event.mode ?? null,
      targetLane: event.targetLane ?? null
    };
  }
  if(event.type === 'enemy_lower_field'){
    return {
      type: event.type,
      id: event.id ?? null,
      enemyType: event.enemyType ?? null,
      column: event.column ?? null,
      row: event.row ?? null,
      stageClock: roundMaybe(event.stageClock)
    };
  }
  if(event.type === 'ship_lost'){
    return {
      type: event.type,
      enemyId: event.enemyId ?? null,
      enemyType: event.enemyType ?? null,
      cause: event.cause ?? null,
      stageClock: roundMaybe(event.stageClock),
      score: event.score ?? null,
      playerLane: event.playerLane ?? null,
      enemyLane: event.enemyLane ?? null
    };
  }
  if(event.type === 'stage_clear'){
    return {
      type: event.type,
      score: event.score ?? null
    };
  }
  return { type: event.type };
}

function runScenario(root){
  const runGameplay = path.join(__dirname, 'run-gameplay.js');
  const args = [
    runGameplay,
    '--scenario', 'full-run-persona',
    '--persona', 'professional',
    '--seed', '51301',
    '--auto-video', '0'
  ];
  if(root){
    args.push('--root', root);
  }
  const stdout = execFileSync(process.execPath, args, {
    cwd: path.resolve(__dirname, '..', '..'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return JSON.parse(stdout);
}

function captureLateStage1Signature(result){
  const sessionFile = result.files && result.files[0];
  if(!sessionFile || !fs.existsSync(sessionFile)){
    return {
      error: 'run-gameplay did not produce a readable session artifact',
      result
    };
  }
  const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8')).session;
  const relevant = session.events.filter(event => (
    event.stage === 1 &&
    ['enemy_attack_start', 'enemy_lower_field', 'ship_lost', 'stage_clear'].includes(event.type)
  ));
  return {
    result,
    snapshot: result.state,
    recent: relevant.slice(-20),
    last12: relevant.slice(-12)
  };
}

function main(){
  const rootArgIndex = process.argv.indexOf('--root');
  const root = rootArgIndex >= 0 ? process.argv[rootArgIndex + 1] : null;
  const capture = captureLateStage1Signature(runScenario(root));

  if(capture.error) fail(capture.error, capture);

  const actual = capture.last12.map(normalizeEvent);
  const expected = EXPECTED.map(event => ({ ...event }));
  if(JSON.stringify(actual) !== JSON.stringify(expected)){
    fail('late stage-1 carryover drifted away from the shipped production baseline', {
      snapshot: capture.snapshot,
      expected,
      actual,
      raw: capture.last12
    });
  }

  console.log(JSON.stringify({ ok: true, snapshot: capture.snapshot, actual }, null, 2));
}

module.exports = {
  EXPECTED,
  normalizeEvent,
  captureLateStage1Signature
};

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

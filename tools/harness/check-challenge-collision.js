#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const SCENARIO = path.join(__dirname, 'scenarios', 'challenge-collision.json');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'challenge-collision');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const run = spawnSync(process.execPath, [HARNESS, '--scenario', SCENARIO, '--out', OUT], {
  cwd: ROOT,
  encoding: 'utf8'
});

if(run.status !== 0){
  fail('challenge collision harness run failed', { stdout: run.stdout, stderr: run.stderr, status: run.status });
}

let result;
try{
  result = JSON.parse(run.stdout.trim());
}catch(err){
  fail('could not parse challenge collision harness output', { stdout: run.stdout, stderr: run.stderr });
}

const analysis = result.analysis || {};
const rules = analysis.challengeRules || {};
const losses = rules.shipLossesDuringChallenge || 0;
const bullets = rules.bulletsDuringChallenge || 0;
const attacks = rules.attacksDuringChallenge || 0;
const lossCause = (analysis.lossCauseCounts || {}).enemy_collision || 0;

if(losses < 1) fail('expected a lethal challenge-stage collision, but no challenge ship loss was recorded', result);
if(lossCause < 1) fail('expected the challenge-stage loss to be caused by enemy_collision', result);
if(bullets !== 0) fail('challenge-stage automation regressed: enemy bullets were fired during challenge', result);
if(attacks !== 0) fail('challenge-stage automation regressed: enemy attack starts were logged during challenge', result);

console.log(JSON.stringify({
  ok: true,
  scenario: result.name,
  files: result.files,
  challengeRules: rules,
  lossCauseCounts: analysis.lossCauseCounts || {}
}, null, 2));

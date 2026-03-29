#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const SCENARIO = path.join(__dirname, 'scenarios', 'rescue-join-stage-clear.json');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'rescue-join-stage-clear');

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
  fail('rescue-join-stage-clear harness run failed', { stdout: run.stdout, stderr: run.stderr, status: run.status });
}

let result;
try{
  result = JSON.parse(run.stdout.trim());
}catch(err){
  fail('could not parse rescue-join-stage-clear harness output', { stdout: run.stdout, stderr: run.stderr });
}

const sessionPath = (result.files || []).find(file => file.endsWith('.json'));
if(!sessionPath) fail('rescue-join-stage-clear check did not produce a session log', result);

const session = require(sessionPath).session;
const events = session.events || [];
const types = events.map(event => event.type);

const releaseIndex = types.indexOf('captured_fighter_released');
const rescuedIndex = types.indexOf('fighter_rescued');
const joinIndex = types.indexOf('rescue_join_phase');
const stageClearIndex = types.indexOf('stage_clear');
const transitionIndex = types.indexOf('challenge_transition_started');

if(releaseIndex < 0){
  fail('rescue-join-stage-clear run never released the captured fighter', { result, types });
}
if(rescuedIndex < 0){
  fail('rescue-join-stage-clear run never rescued the released fighter', { result, types });
}
if(joinIndex < 0){
  fail('rescue-join-stage-clear run never emitted the rescue join phase', { result, types });
}
if(stageClearIndex >= 0 && stageClearIndex < rescuedIndex){
  fail('stage clear fired before fighter_rescued in the rescue edge case', { result, types, releaseIndex, rescuedIndex, stageClearIndex, transitionIndex });
}
if(transitionIndex >= 0 && transitionIndex < rescuedIndex){
  fail('stage transition started before fighter_rescued in the rescue edge case', { result, types, releaseIndex, rescuedIndex, stageClearIndex, transitionIndex });
}

console.log(JSON.stringify({
  ok: true,
  files: result.files,
  releaseAt: events[releaseIndex]?.t ?? null,
  rescuedAt: events[rescuedIndex]?.t ?? null,
  joinAt: events[joinIndex]?.t ?? null,
  stageClearAt: stageClearIndex >= 0 ? events[stageClearIndex]?.t ?? null : null,
  transitionAt: transitionIndex >= 0 ? events[transitionIndex]?.t ?? null : null
}, null, 2));

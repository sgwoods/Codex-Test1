#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const SCENARIO = path.join(__dirname, 'scenarios', 'close-shot-hit.json');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'close-shot-hit');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const run = spawnSync(process.execPath, [HARNESS, '--scenario', SCENARIO, '--auto-video', '0', '--deterministic-replay', '1', '--out', OUT], {
  cwd: ROOT,
  encoding: 'utf8'
});

if(run.status !== 0){
  fail('close-shot harness run failed', { stdout: run.stdout, stderr: run.stderr, status: run.status });
}

let result;
try{
  result = JSON.parse(run.stdout.trim());
}catch(err){
  fail('could not parse close-shot harness output', { stdout: run.stdout, stderr: run.stderr });
}

const sessionPath = (result.files || []).find(f => f.endsWith('.json'));
if(!sessionPath) fail('close-shot check did not produce a session log', result);
const session = require(sessionPath).session;
const events = session.events || [];

const shot = events.find(e => e.type === 'player_shot');
const kill = events.find(e => e.type === 'enemy_killed');
if(!shot) fail('close-shot scenario did not emit a player shot', result);
if(!kill) fail('close-range descending enemy was not killed by the visible shot', result);
if(kill.t - shot.t > 0.3){
  fail('close-range shot registered too late relative to the fired missile', { shot, kill, result });
}

console.log(JSON.stringify({
  ok: true,
  files: result.files,
  shotAt: shot.t,
  killAt: kill.t,
  delay: +(kill.t - shot.t).toFixed(3),
  enemy: {
    id: kill.id,
    type: kill.enemyType,
    lane: kill.lane
  }
}, null, 2));

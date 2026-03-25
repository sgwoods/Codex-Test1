#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const SCENARIO = path.join(__dirname, 'scenarios', 'capture-escape-recovery.json');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'capture-escape');

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
  fail('capture escape harness run failed', { stdout: run.stdout, stderr: run.stderr, status: run.status });
}

let result;
try{
  result = JSON.parse(run.stdout.trim());
}catch(err){
  fail('could not parse capture escape harness output', { stdout: run.stdout, stderr: run.stderr });
}

const sessionPath = (result.files || []).find(f => f.endsWith('.json'));
if(!sessionPath) fail('capture escape check did not produce a session log', result);
const session = require(sessionPath).session;
const events = session.events || [];
const snapshots = session.snapshots || [];

const escape = events.find(e => e.type === 'capture_escape');
if(!escape) fail('expected a capture_escape event, but none was recorded', result);

const captured = events.find(e => e.type === 'fighter_captured');
if(captured) fail('capture escape regressed into a full fighter capture', { result, captured });

const losses = events.filter(e => e.type === 'ship_lost');
if(losses.length) fail('player lost a ship during capture escape recovery', { result, losses });

const postEscapeShots = events.filter(e => e.type === 'player_shot' && e.t > escape.t + 0.6);
if(!postEscapeShots.length) fail('expected control to return and allow a post-escape shot', result);

const settled = snapshots.find(s =>
  s.t > escape.t + 0.7 &&
  !s.player?.captured &&
  !s.player?.pending &&
  Math.abs((s.player?.y || 0) - 340) <= 4
) || null;

if(!settled) fail('player did not settle back near the normal bottom row after capture escape', result);

console.log(JSON.stringify({
  ok: true,
  scenario: result.name,
  files: result.files,
  escapeAt: escape.t,
  postEscapeShots: postEscapeShots.length,
  settledSnapshot: {
    t: settled.t,
    x: settled.player.x,
    y: settled.player.y,
    captured: settled.player.captured,
    pending: settled.player.pending
  }
}, null, 2));

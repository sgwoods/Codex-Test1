#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'capture-shot-window');
const EARLY = path.join(__dirname, 'scenarios', 'capture-shot-early.json');
const LATE = path.join(__dirname, 'scenarios', 'capture-shot-late.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(file){
  const run = spawnSync(process.execPath, [HARNESS, '--scenario', file, '--out', OUT], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if(run.status !== 0){
    fail('capture shot-window harness run failed', {
      scenario: file,
      stdout: run.stdout,
      stderr: run.stderr,
      status: run.status
    });
  }
  let result;
  try{
    result = JSON.parse(run.stdout.trim());
  }catch(err){
    fail('could not parse capture shot-window harness output', {
      scenario: file,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  const sessionPath = (result.files || []).find(f => f.endsWith('.json'));
  if(!sessionPath) fail('capture shot-window run did not produce a session log', result);
  const session = require(sessionPath).session;
  return { result, sessionPath, session, events: session.events || [], snapshots: session.snapshots || [] };
}

const early = runScenario(EARLY);
const late = runScenario(LATE);

const earlySetup = early.events.find(e => e.type === 'harness_capture_escape_setup');
const earlyShot = early.events.find(e => e.type === 'player_shot');
const earlyEscape = early.events.find(e => e.type === 'capture_escape');
const earlyCaptured = early.events.find(e => e.type === 'fighter_captured');
if(!earlySetup) fail('early scenario did not record setup state', early.result);
if(!earlyShot) fail('expected an early capture-window shot, but none was recorded', early.result);
if(!earlyShot.captureWindow) fail('early shot did not occur inside the capture firing window', { earlyShot, result: early.result });
if(earlyShot.t <= earlySetup.t) fail('early shot timing is invalid', { earlySetup, earlyShot, result: early.result });
if(!earlyEscape) fail('early capture-window shot did not break capture', early.result);
if(earlyCaptured) fail('early capture-window shot still regressed into full capture', { earlyCaptured, result: early.result });

const lateSetup = late.events.find(e => e.type === 'harness_capture_escape_setup');
const lateShots = late.events.filter(e => e.type === 'player_shot' && e.t > (lateSetup?.t || 0));
const lateCaptured = late.events.find(e => e.type === 'fighter_captured');
const lateEscape = late.events.find(e => e.type === 'capture_escape');
if(!lateSetup) fail('late scenario did not record setup state', late.result);
if(lateShots.length) fail('late capture state still allowed a player shot after the firing window should be closed', { lateShots, result: late.result });
if(!lateCaptured) fail('late capture state did not progress to fighter capture; closing-window path is not being exercised', late.result);
if(lateEscape) fail('late capture state incorrectly escaped after the firing window should be closed', { lateEscape, result: late.result });

console.log(JSON.stringify({
  ok: true,
  early: {
    files: early.result.files,
    setupAt: earlySetup.t,
    shotAt: earlyShot.t,
    escapeAt: earlyEscape.t,
    captureWindow: earlyShot.captureWindow
  },
  late: {
    files: late.result.files,
    setupAt: lateSetup.t,
    capturedAt: lateCaptured.t,
    shotsAfterSetup: lateShots.length
  }
}, null, 2));

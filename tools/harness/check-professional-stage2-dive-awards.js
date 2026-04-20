#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'professional-stage2-dive-awards');
const SEED = 51101;
const PERSONAS = ['expert', 'professional'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(persona){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', 'stage2-opening',
    '--persona', persona,
    '--seed', String(SEED),
    '--out', OUT,
    '--auto-video', '0'
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    fail('professional stage2 dive-awards harness run failed', {
      persona,
      seed: SEED,
      status: run.status,
      signal: run.signal,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(err){
    fail('could not parse professional stage2 dive-awards harness output', {
      persona,
      seed: SEED,
      error: String(err),
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

function summarize(run){
  const sessionFile = (run.files || []).find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
  const events = sessionFile ? (JSON.parse(fs.readFileSync(sessionFile, 'utf8')).session?.events || []) : [];
  const highValueBossDiveKills = events.filter(event =>
    event.type === 'enemy_killed' &&
    event.enemyType === 'boss' &&
    event.dive === 1 &&
    (event.points || 0) >= 400
  );
  return {
    score: run.state?.score || 0,
    lives: run.state?.lives || 0,
    shipLosses: (run.analysis?.shipLost || []).length,
    kills: run.analysis?.eventCounts?.enemy_killed || 0,
    highValueBossDiveKillCount: highValueBossDiveKills.length,
    highValueBossDivePoints: highValueBossDiveKills.reduce((sum, event) => sum + (event.points || 0), 0),
    highValueBossDiveAwards: highValueBossDiveKills.map(event => ({
      t: event.t,
      points: event.points,
      enemyId: event.enemyId || event.id || null
    })),
    files: run.files || []
  };
}

const results = {};
for(const persona of PERSONAS){
  results[persona] = summarize(runScenario(persona));
}

const expert = results.expert;
const professional = results.professional;
if(professional.shipLosses > expert.shipLosses){
  fail('professional persona regressed on stage-2 dive awards: extra ship losses appeared relative to expert on seed 51101', {
    seed: SEED,
    expert,
    professional
  });
}
if(professional.highValueBossDivePoints < expert.highValueBossDivePoints){
  fail('professional persona regressed on stage-2 dive awards: professional converted fewer high-value boss dives than expert on seed 51101', {
    seed: SEED,
    expert,
    professional
  });
}

console.log(JSON.stringify({
  ok: true,
  seed: SEED,
  personas: results
}, null, 2));

#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'professional-stage2-throughput');
const SEEDS = [51101, 51201, 51301];
const PERSONAS = ['expert', 'professional'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(persona, seed){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', 'stage2-opening',
    '--persona', persona,
    '--seed', String(seed),
    '--out', OUT,
    '--auto-video', '0'
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    fail('professional stage2 throughput harness run failed', {
      persona,
      seed,
      status: run.status,
      signal: run.signal,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(err){
    fail('could not parse professional stage2 throughput harness output', {
      persona,
      seed,
      error: String(err),
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

function summarize(run){
  return {
    score: run.state?.score || 0,
    lives: run.state?.lives || 0,
    stage: run.state?.stage || 0,
    shipLosses: (run.analysis?.shipLost || []).length,
    kills: run.analysis?.eventCounts?.enemy_killed || 0,
    shots: run.analysis?.eventCounts?.player_shot || 0,
    files: run.files || []
  };
}

const results = {};
for(const seed of SEEDS){
  results[seed] = {};
  for(const persona of PERSONAS){
    results[seed][persona] = summarize(runScenario(persona, seed));
  }
}

for(const seed of SEEDS){
  const expert = results[seed].expert;
  const professional = results[seed].professional;
  if(professional.shipLosses > expert.shipLosses){
    fail('professional persona regressed on stage-2 throughput: extra ship losses appeared relative to expert on a shared seed', {
      seed,
      expert,
      professional,
      results
    });
  }
  if(professional.kills < expert.kills){
    fail('professional persona regressed on stage-2 throughput: professional killed fewer enemies than expert on a shared seed', {
      seed,
      expert,
      professional,
      results
    });
  }
  if(professional.score < expert.score){
    fail('professional persona regressed on stage-2 throughput: professional scored below expert on a shared seed', {
      seed,
      expert,
      professional,
      results
    });
  }
}

console.log(JSON.stringify({
  ok: true,
  seeds: results
}, null, 2));

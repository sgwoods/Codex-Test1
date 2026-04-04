#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'challenge-outcome-distribution');

// Frozen from the known-good persona challenge batch:
// /Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/batch-personas-2026-03-23T18-08-42-722Z
const BASELINE = Object.freeze({
  novice: Object.freeze({
    seed: 3101,
    endingStage: 4,
    lives: 3,
    shipLost: 0,
    challengeShipLosses: 0,
    challengeHitRate: 0.725,
    challengeDuration: 12.662
  }),
  advanced: Object.freeze({
    seed: 3201,
    endingStage: 4,
    lives: 2,
    shipLost: 1,
    challengeShipLosses: 0,
    challengeHitRate: 1,
    challengeDuration: 11.01
  }),
  expert: Object.freeze({
    seed: 3301,
    endingStage: 4,
    lives: 2,
    shipLost: 1,
    challengeShipLosses: 0,
    challengeHitRate: 1,
    challengeDuration: 11.071
  })
});

const PERSONAS = ['novice', 'advanced', 'expert'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(persona, seed){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', 'stage3-challenge-persona',
    '--persona', persona,
    '--seed', String(seed),
    '--out', OUT
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 120000
  });
  if(run.status !== 0){
    fail('challenge outcome distribution harness run failed', {
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
    fail('could not parse challenge outcome distribution run output', {
      persona,
      seed,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

function summarizeRun(run){
  const challengeClear = run.analysis?.challengeClears?.[0] || null;
  return {
    endingStage: run.state?.stage || 0,
    lives: run.state?.lives || 0,
    shipLost: (run.analysis?.shipLost || []).length,
    challengeShipLosses: run.analysis?.challengeRules?.shipLossesDuringChallenge ?? 0,
    challengeHitRate: challengeClear?.total ? +(challengeClear.hits / challengeClear.total).toFixed(3) : 0,
    challengeDuration: challengeClear ? +challengeClear.t.toFixed(3) : null,
    challengeCleared: !!challengeClear
  };
}

function avg(values){
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

const results = {};
for(const persona of PERSONAS){
  const baseline = BASELINE[persona];
  const run = runScenario(persona, baseline.seed);
  results[persona] = {
    baseline,
    current: summarizeRun(run),
    files: run.files
  };
}

for(const persona of PERSONAS){
  const { baseline, current } = results[persona];
  if(!current.challengeCleared){
    fail(`${persona} persona no longer clears the first challenge-stage baseline seed`, {
      persona,
      baseline,
      current,
      results
    });
  }
  if(current.endingStage < baseline.endingStage){
    fail(`${persona} persona no longer reaches stage ${baseline.endingStage} after the first challenge baseline seed`, {
      persona,
      baseline,
      current,
      results
    });
  }
  if(current.challengeShipLosses > baseline.challengeShipLosses){
    fail(`${persona} persona now loses ships during the challenge stage on a baseline seed`, {
      persona,
      baseline,
      current,
      results
    });
  }
  if(current.lives < baseline.lives - 1){
    fail(`${persona} persona ends the first challenge baseline seed with materially fewer lives`, {
      persona,
      baseline,
      current,
      results
    });
  }
  if(current.challengeHitRate < baseline.challengeHitRate - 0.15){
    fail(`${persona} persona challenge hit rate drifted well below the known-good baseline`, {
      persona,
      baseline,
      current,
      results
    });
  }
}

const baselineAverageHitRate = avg(PERSONAS.map(persona => BASELINE[persona].challengeHitRate));
const currentAverageHitRate = avg(PERSONAS.map(persona => results[persona].current.challengeHitRate));
const baselineAverageChallengeLosses = avg(PERSONAS.map(persona => BASELINE[persona].challengeShipLosses));
const currentAverageChallengeLosses = avg(PERSONAS.map(persona => results[persona].current.challengeShipLosses));

if(currentAverageHitRate < baselineAverageHitRate - 0.1){
  fail('persona challenge outcome distribution regressed: average challenge hit rate drifted well below the known-good baseline', {
    baselineAverageHitRate: +baselineAverageHitRate.toFixed(3),
    currentAverageHitRate: +currentAverageHitRate.toFixed(3),
    results
  });
}

if(currentAverageChallengeLosses > baselineAverageChallengeLosses){
  fail('persona challenge outcome distribution regressed: challenge-stage ship losses increased on the baseline persona set', {
    baselineAverageChallengeLosses: +baselineAverageChallengeLosses.toFixed(3),
    currentAverageChallengeLosses: +currentAverageChallengeLosses.toFixed(3),
    results
  });
}

console.log(JSON.stringify({
  ok: true,
  aggregate: {
    baselineAverageHitRate: +baselineAverageHitRate.toFixed(3),
    currentAverageHitRate: +currentAverageHitRate.toFixed(3),
    baselineAverageChallengeLosses: +baselineAverageChallengeLosses.toFixed(3),
    currentAverageChallengeLosses: +currentAverageChallengeLosses.toFixed(3)
  },
  personas: results
}, null, 2));

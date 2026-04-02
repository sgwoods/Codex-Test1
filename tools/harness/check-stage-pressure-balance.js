#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'stage-pressure-balance');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenarioOnce(scenario, seed, persona){
  const args = [HARNESS, '--scenario', scenario, '--seed', String(seed), '--out', OUT];
  if(persona) args.push('--persona', persona);
  const run = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 90000
  });
  if(run.status !== 0){
    const err = new Error('stage pressure harness run failed');
    err.payload = {
      scenario,
      seed,
      persona,
      stdout: run.stdout,
      stderr: run.stderr,
      status: run.status,
      signal: run.signal
    };
    throw err;
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(err){
    const parseErr = new Error('could not parse stage pressure harness output');
    parseErr.payload = {
      scenario,
      seed,
      persona,
      stdout: run.stdout,
      stderr: run.stderr
    };
    throw parseErr;
  }
}

function runScenario(scenario, seed, persona, attempts=2){
  let lastErr = null;
  for(let attempt=1; attempt<=attempts; attempt++){
    try{
      return runScenarioOnce(scenario, seed, persona);
    }catch(err){
      lastErr = err;
    }
  }
  fail(lastErr?.message || 'stage pressure harness run failed', lastErr?.payload || {
    scenario,
    seed,
    persona
  });
}

function isUsableResult(result){
  return result && result.artifactQuality && result.artifactQuality.ok === true;
}

function avg(nums){
  return nums.length ? nums.reduce((sum, n) => sum + n, 0) / nums.length : 0;
}

function seriesMedian(nums){
  if(!nums.length)return 0;
  const sorted = [...nums].sort((a,b)=>a-b);
  const mid = Math.floor(sorted.length / 2);
  if(sorted.length % 2) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function shipLossCount(result){
  return (result.analysis?.shipLost || []).length;
}

function bulletDeaths(result){
  return (result.analysis?.lossCauseCounts || {}).enemy_bullet || 0;
}

function runScenarioSeries(scenario, seed, persona, repeats=2, maxTotalRuns=4){
  const results = [];
  let totalRuns = 0;
  while(results.length < repeats && totalRuns < maxTotalRuns){
    const result = runScenario(scenario, seed, persona);
    totalRuns++;
    if(isUsableResult(result)) results.push(result);
  }
  if(results.length < repeats){
    fail('stage pressure harness could not gather enough usable runs', {
      scenario,
      seed,
      persona,
      repeatsRequested: repeats,
      usableRuns: results.length,
      maxTotalRuns
    });
  }
  const losses = results.map(shipLossCount);
  const bulletPressure = results.map(r => r.analysis?.bulletPressure?.overall?.bulletsPerAttack || 0);
  const bulletDeathCounts = results.map(bulletDeaths);
  const endingStages = results.map(r => r.state?.stage || 0);
  return {
    results,
    representative: results[results.length - 1],
    stats: {
      repeats,
      totalRuns,
      losses,
      bulletPressure,
      bulletDeathCounts,
      endingStages,
      avgLosses: +avg(losses).toFixed(3),
      medianLosses: +seriesMedian(losses).toFixed(3),
      avgBulletsPerAttack: +avg(bulletPressure).toFixed(3),
      medianBulletsPerAttack: +seriesMedian(bulletPressure).toFixed(3),
      maxBulletDeaths: Math.max(...bulletDeathCounts, 0),
      minEndingStage: Math.min(...endingStages),
      maxEndingStage: Math.max(...endingStages)
    }
  };
}

const stage2Series = runScenarioSeries('stage2-opening', 2201, 'advanced', 2, 4);
const stage4FiveSeries = runScenarioSeries('stage4-five-ships', 4201, 'advanced', 2, 4);
const stage4SurvivalSeries = runScenarioSeries('stage4-survival', 4301, 'advanced', 2, 4);

const stage2 = stage2Series.representative;
const stage4Five = stage4FiveSeries.representative;
const stage4Survival = stage4SurvivalSeries.representative;

const stage2Pressure = stage2.analysis?.bulletPressure?.overall || {};
const stage4FivePressure = stage4Five.analysis?.bulletPressure?.overall || {};
const stage4SurvivalPressure = stage4Survival.analysis?.bulletPressure?.overall || {};
const stage4SurvivalLossCauses = stage4Survival.analysis?.lossCauseCounts || {};

if(stage2Series.stats.avgLosses > 2){
  fail('Stage 2 opening regressed: advanced persona lost too many ships on average across the baseline seed', {
    stats: stage2Series.stats,
    representative: stage2
  });
}
if(stage2Series.stats.maxBulletDeaths !== 0){
  fail('Stage 2 opening regressed: bullet deaths returned to the baseline Stage 2 seed', {
    stats: stage2Series.stats,
    representative: stage2
  });
}
if(stage2Series.stats.avgBulletsPerAttack > 0.75){
  fail('Stage 2 opening regressed: bullets per attack are above the current baseline guardrail', {
    stats: stage2Series.stats,
    representative: stage2
  });
}

// Stage 4 pressure is intentionally checked with coarse guardrails. The
// scenario has enough frame-to-frame variance that single-run fine thresholds
// produced false failures across both "before" and "after" structural refactors.
if(stage4FiveSeries.stats.avgBulletsPerAttack > 0.65){
  fail('Stage 4 five-ships regressed: bullets per attack are well above the current coarse guardrail', {
    stats: stage4FiveSeries.stats,
    representative: stage4Five
  });
}
if(stage4FiveSeries.stats.avgLosses > 3.5){
  fail('Stage 4 five-ships regressed: advanced persona lost too many ships on average across the baseline seed', {
    stats: stage4FiveSeries.stats,
    representative: stage4Five
  });
}
if(stage4FiveSeries.stats.minEndingStage < 5){
  fail('Stage 4 five-ships regressed: advanced persona no longer clears the Stage 4 baseline window', {
    stats: stage4FiveSeries.stats,
    representative: stage4Five
  });
}
if(stage4FiveSeries.stats.maxBulletDeaths > 1){
  fail('Stage 4 five-ships regressed: bullet deaths rose above the current baseline guardrail', {
    stats: stage4FiveSeries.stats,
    representative: stage4Five
  });
}

if(stage4SurvivalSeries.stats.avgLosses > 2){
  fail('Stage 4 survival regressed: advanced persona lost too many ships on average across the baseline seed', {
    stats: stage4SurvivalSeries.stats,
    representative: stage4Survival
  });
}
if(stage4SurvivalSeries.stats.minEndingStage < 5){
  fail('Stage 4 survival regressed: advanced persona no longer clears the Stage 4 survival window', {
    stats: stage4SurvivalSeries.stats,
    representative: stage4Survival
  });
}
if(stage4SurvivalSeries.stats.maxBulletDeaths !== 0){
  fail('Stage 4 survival regressed: bullet deaths returned to the baseline survival seed', {
    stats: stage4SurvivalSeries.stats,
    representative: stage4Survival
  });
}
if(stage4SurvivalSeries.stats.avgBulletsPerAttack > 0.55){
  fail('Stage 4 survival regressed: bullets per attack are above the current coarse guardrail', {
    stats: stage4SurvivalSeries.stats,
    representative: stage4Survival
  });
}

console.log(JSON.stringify({
  ok: true,
  stage2: {
    stats: stage2Series.stats,
    files: stage2.files,
    bulletPressure: stage2Pressure,
    lossCauseCounts: stage2.analysis?.lossCauseCounts || {}
  },
  stage4FiveShips: {
    stats: stage4FiveSeries.stats,
    files: stage4Five.files,
    bulletPressure: stage4FivePressure,
    lossCauseCounts: stage4Five.analysis?.lossCauseCounts || {}
  },
  stage4Survival: {
    stats: stage4SurvivalSeries.stats,
    files: stage4Survival.files,
    bulletPressure: stage4SurvivalPressure,
    stageLossClusters: stage4Survival.analysis?.stageLossClusters || {},
    lossCauseCounts: stage4SurvivalLossCauses
  }
}, null, 2));

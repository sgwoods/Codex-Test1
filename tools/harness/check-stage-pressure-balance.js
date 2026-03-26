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

function runScenario(scenario, seed, persona){
  const args = [HARNESS, '--scenario', scenario, '--seed', String(seed), '--out', OUT];
  if(persona) args.push('--persona', persona);
  const run = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 90000
  });
  if(run.status !== 0){
    fail('stage pressure harness run failed', {
      scenario,
      seed,
      persona,
      stdout: run.stdout,
      stderr: run.stderr,
      status: run.status,
      signal: run.signal
    });
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(err){
    fail('could not parse stage pressure harness output', {
      scenario,
      seed,
      persona,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

const stage2 = runScenario('stage2-opening', 2201, 'advanced');
const stage4Five = runScenario('stage4-five-ships', 4201, 'advanced');
const stage4Survival = runScenario('stage4-survival', 4301, 'advanced');

const stage2Pressure = stage2.analysis?.bulletPressure?.overall || {};
const stage4FivePressure = stage4Five.analysis?.bulletPressure?.overall || {};
const stage4SurvivalPressure = stage4Survival.analysis?.bulletPressure?.overall || {};
const stage4SurvivalClusters = stage4Survival.analysis?.stageLossClusters?.['4'] || {};
const stage4SurvivalLossCauses = stage4Survival.analysis?.lossCauseCounts || {};

if((stage2.analysis?.shipLost || []).length > 2){
  fail('Stage 2 opening regressed: advanced persona lost too many ships on the baseline seed', stage2);
}
if(((stage2.analysis?.lossCauseCounts || {}).enemy_bullet || 0) !== 0){
  fail('Stage 2 opening regressed: bullet deaths returned to the baseline Stage 2 seed', {
    lossCauseCounts: stage2.analysis?.lossCauseCounts || {},
    result: stage2
  });
}
if((stage2Pressure.bulletsPerAttack || 0) > 0.85){
  fail('Stage 2 opening regressed: bullets per attack are above the current baseline guardrail', {
    bulletsPerAttack: stage2Pressure.bulletsPerAttack,
    result: stage2
  });
}

if((stage4FivePressure.bulletsPerAttack || 0) > 0.55){
  fail('Stage 4 five-ships regressed: bullets per attack are above the current baseline guardrail', {
    bulletsPerAttack: stage4FivePressure.bulletsPerAttack,
    result: stage4Five
  });
}
if((stage4Five.analysis?.shipLost || []).length > 2){
  fail('Stage 4 five-ships regressed: advanced persona lost too many ships on the baseline seed', stage4Five);
}
if(((stage4Five.analysis?.lossCauseCounts || {}).enemy_bullet || 0) > 1){
  fail('Stage 4 five-ships regressed: bullet deaths rose above the current baseline guardrail', {
    lossCauseCounts: stage4Five.analysis?.lossCauseCounts || {},
    result: stage4Five
  });
}

if((stage4Survival.analysis?.shipLost || []).length > 2){
  fail('Stage 4 survival regressed: advanced persona lost too many ships on the baseline seed', stage4Survival);
}
if((stage4SurvivalLossCauses.enemy_bullet || 0) !== 0){
  fail('Stage 4 survival regressed: bullet deaths returned to the baseline survival seed', {
    lossCauseCounts: stage4SurvivalLossCauses,
    result: stage4Survival
  });
}
if((stage4SurvivalPressure.bulletsPerAttack || 0) > 0.47){
  fail('Stage 4 survival regressed: bullets per attack are above the current baseline guardrail', {
    bulletsPerAttack: stage4SurvivalPressure.bulletsPerAttack,
    result: stage4Survival
  });
}
if(Number.isFinite(stage4SurvivalClusters.minGap) && stage4SurvivalClusters.minGap < 10){
  fail('Stage 4 survival regressed: loss clustering is tighter than the current baseline guardrail', {
    stageLossClusters: stage4Survival.analysis?.stageLossClusters || {},
    result: stage4Survival
  });
}

console.log(JSON.stringify({
  ok: true,
  stage2: {
    files: stage2.files,
    bulletPressure: stage2Pressure,
    lossCauseCounts: stage2.analysis?.lossCauseCounts || {}
  },
  stage4FiveShips: {
    files: stage4Five.files,
    bulletPressure: stage4FivePressure,
    lossCauseCounts: stage4Five.analysis?.lossCauseCounts || {}
  },
  stage4Survival: {
    files: stage4Survival.files,
    bulletPressure: stage4SurvivalPressure,
    stageLossClusters: stage4Survival.analysis?.stageLossClusters || {},
    lossCauseCounts: stage4SurvivalLossCauses
  }
}, null, 2));

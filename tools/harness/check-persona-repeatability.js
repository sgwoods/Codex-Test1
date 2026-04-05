#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(ROOT, 'tools', 'harness', 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts');

function fail(message, data){
  console.error(JSON.stringify({ ok: false, message, data }, null, 2));
  process.exit(1);
}

function runScenario(scenario, persona, seed){
  const args = [
    HARNESS,
    '--scenario', scenario,
    '--persona', persona,
    '--seed', String(seed),
    '--auto-video', '0',
    '--out', OUT
  ];
  const run = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    fail(`repeatability run failed for ${scenario}/${persona}/${seed}`, {
      status: run.status,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  try{
    return JSON.parse(run.stdout);
  }catch(err){
    fail(`repeatability run returned invalid JSON for ${scenario}/${persona}/${seed}`, {
      error: String(err),
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

function pickRepeatSignature(summary){
  const analysis = summary.analysis || {};
  return {
    state: {
      started: !!summary.state?.started,
      stage: summary.state?.stage ?? null,
      score: summary.state?.score ?? null,
      lives: summary.state?.lives ?? null,
      challenge: !!summary.state?.challenge,
      simT: Number(summary.state?.simT ?? 0).toFixed(3)
    },
    eventCounts: analysis.eventCounts || {},
    stageClears: (analysis.stageClears || []).map(x => ({
      stage: x.stage,
      score: x.score
    })),
    challengeClears: (analysis.challengeClears || []).map(x => ({
      stage: x.stage,
      hits: x.hits,
      total: x.total
    })),
    shipLost: (analysis.shipLost || []).map(x => ({
      stage: x.stage,
      score: x.score,
      sourceType: x.sourceType || null,
      sourceColumn: x.sourceColumn ?? null,
      sourceOriginLane: x.sourceOriginLane ?? null,
      sourceTargetLane: x.sourceTargetLane ?? null,
      playerLane: x.playerLane ?? null,
      cause: x.cause || null
    })),
    lossCauseCounts: analysis.lossCauseCounts || {}
  };
}

function assertRepeatable(spec){
  const first = pickRepeatSignature(runScenario(spec.scenario, spec.persona, spec.seed));
  const second = pickRepeatSignature(runScenario(spec.scenario, spec.persona, spec.seed));
  if(JSON.stringify(first) !== JSON.stringify(second)){
    fail(`repeatability regressed for ${spec.scenario}/${spec.persona}/${spec.seed}`, {
      first,
      second
    });
  }
  return { spec, signature: first };
}

const checks = [
  { scenario: 'stage2-opening', persona: 'advanced', seed: 51101 },
  { scenario: 'full-run-persona', persona: 'advanced', seed: 51101 }
];

const results = checks.map(assertRepeatable);
console.log(JSON.stringify({
  ok: true,
  checked: results.map(({ spec, signature }) => ({
    scenario: spec.scenario,
    persona: spec.persona,
    seed: spec.seed,
    state: signature.state
  }))
}, null, 2));

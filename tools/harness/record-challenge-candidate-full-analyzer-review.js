#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SWEEP = path.join(ANALYSES, 'challenge-stage-candidate-sweep', 'latest.json');
const CONFORMANCE = path.join(ANALYSES, 'challenge-stage-conformance', 'latest.json');
const OUT_ROOT = path.join(ANALYSES, 'challenge-stage-candidate-full-analyzer-review');

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function numericArg(name){
  const value = argValue(name, '');
  return value === '' ? null : round(value, 3);
}

function stageRow(conformance, stage){
  return (conformance?.stageRows || []).find(row => +row.stage === +stage) || null;
}

function delta(after, before){
  return Number.isFinite(+after) && Number.isFinite(+before) ? round(+after - +before, 3) : null;
}

function buildMarkdown(report){
  const summary = report.summary || {};
  const trial = report.trial || {};
  const baseline = report.restoredBaseline || {};
  return `# Challenge Candidate Full-Analyzer Review

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Candidate

- Stage: ${report.stage}
- Candidate: ${report.candidateId}
- Sweep decision: ${summary.sweepDecision}
- Sweep expected-label lift: ${summary.sweepExpectedLift10}/10
- Sweep target-video lift: ${summary.sweepTargetVideoObjectFitLift10}/10

## Full Analyzer Trial

- Decision: ${report.decision}
- Current restored summary score: ${baseline.summaryScore10}/10
- Trial summary score: ${trial.summaryScore10 ?? 'n/a'}/10
- Current restored movement score: ${baseline.summaryMovementScore10}/10
- Trial movement score: ${trial.summaryMovementScore10 ?? 'n/a'}/10
- Current restored target-video object-track score: ${baseline.summaryTargetVideoObjectTrackFitScore10}/10
- Trial target-video object-track score: ${trial.summaryTargetVideoObjectTrackFitScore10 ?? 'n/a'}/10
- Current restored Stage ${report.stage} object score: ${baseline.stageObjectScore10}/10
- Trial Stage ${report.stage} object score: ${trial.stageObjectScore10 ?? 'n/a'}/10

## Read

${report.read}

## Next Step

${report.nextStep}
`;
}

function main(){
  const sweep = readJson(SWEEP, {});
  const conformance = readJson(CONFORMANCE, {});
  const stage = +(argValue('stage', sweep.stage || '7') || 7);
  const row = stageRow(conformance, stage);
  const candidateId = argValue('candidate', sweep.summary?.bestCandidateId || 'unknown');
  const decision = argValue('decision', 'pending-full-analyzer-review');
  const trial = {
    summaryScore10: numericArg('trial-summary-score'),
    summaryMovementScore10: numericArg('trial-summary-movement'),
    summaryTargetVideoObjectTrackFitScore10: numericArg('trial-summary-target-video'),
    stageMovementScore10: numericArg('trial-stage-movement'),
    stageConformanceScore10: numericArg('trial-stage-conformance'),
    stageObjectScore10: numericArg('trial-stage-object'),
    stageTargetFitScore10: numericArg('trial-stage-target-fit'),
    notes: argValue('notes', '')
  };
  const restoredBaseline = {
    summaryScore10: round(conformance.summary?.score10, 1),
    summaryMovementScore10: round(conformance.summary?.movementConformanceScore10, 1),
    summaryTargetVideoObjectTrackFitScore10: round(conformance.summary?.targetVideoObjectTrackFitScore10, 1),
    stageMovementScore10: round(row?.movementConformanceScore10, 1),
    stageConformanceScore10: round(row?.conformanceScore10, 1),
    stageObjectScore10: round(row?.objectTrackProbe?.score10, 1),
    stageTargetFitScore10: round(row?.objectTrackProbe?.targetFitScore10, 1),
    bestReferenceMatch: row?.bestReferenceMatch?.labelId || null
  };
  const deltas = {
    summaryScore10: delta(trial.summaryScore10, restoredBaseline.summaryScore10),
    summaryMovementScore10: delta(trial.summaryMovementScore10, restoredBaseline.summaryMovementScore10),
    summaryTargetVideoObjectTrackFitScore10: delta(trial.summaryTargetVideoObjectTrackFitScore10, restoredBaseline.summaryTargetVideoObjectTrackFitScore10),
    stageMovementScore10: delta(trial.stageMovementScore10, restoredBaseline.stageMovementScore10),
    stageObjectScore10: delta(trial.stageObjectScore10, restoredBaseline.stageObjectScore10),
    stageTargetFitScore10: delta(trial.stageTargetFitScore10, restoredBaseline.stageTargetFitScore10)
  };
  const rejected = String(decision).includes('reject');
  const accepted = String(decision).includes('accept') || String(decision).includes('promote');
  const read = rejected
    ? `Rejected ${candidateId}: the focused sweep found a narrow shape win, but the full analyzer did not confirm a player-facing improvement. Summary movement delta ${deltas.summaryMovementScore10 ?? 'n/a'}, target-video object-track delta ${deltas.summaryTargetVideoObjectTrackFitScore10 ?? 'n/a'}, and Stage ${stage} target-fit delta ${deltas.stageTargetFitScore10 ?? 'n/a'} are not acceptable for runtime promotion.`
    : accepted
      ? `Accepted ${candidateId}: full analyzer trial confirmed the sweep result and can proceed to normal guardrails.`
      : `Pending review for ${candidateId}: run a temporary runtime trial and record the full analyzer scores before promotion.`;
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-stage-candidate-full-analyzer-review',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage,
    candidateId,
    decision,
    summary: {
      sweepDecision: sweep.summary?.keeperDecision || null,
      sweepExpectedLift10: sweep.summary?.expectedLift10 ?? null,
      sweepTargetVideoObjectFitLift10: sweep.summary?.targetVideoObjectFitLift10 ?? null,
      sweepBestExpectedScore10: sweep.summary?.bestExpectedScore10 ?? null,
      sweepBestTargetVideoObjectFitScore10: sweep.summary?.bestTargetVideoObjectFitScore10 ?? null
    },
    restoredBaseline,
    trial,
    deltas,
    read,
    nextStep: rejected
      ? 'Do not promote this candidate. Extend the scorer to compare full-stage vectors or author a stronger reference-path contract before the next runtime trial.'
      : accepted
        ? 'Run challenge-stage conformance, challenge-motion-profile, build, and manual visual review before commit.'
        : 'Apply candidate temporarily, run full challenge-stage conformance, then record accepted or rejected scores here.',
    sources: {
      candidateSweep: rel(SWEEP),
      challengeStageConformance: rel(CONFORMANCE)
    }
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    stage: report.stage,
    candidateId: report.candidateId,
    decision: report.decision,
    read: report.read,
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main();

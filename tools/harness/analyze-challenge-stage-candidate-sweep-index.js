#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SWEEP_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep-index');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
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

function findReports(dir){
  if(!fs.existsSync(dir)) return [];
  const out = [];
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      const report = path.join(full, 'report.json');
      if(fs.existsSync(report)) out.push(report);
    }
  }
  return out;
}

function summarizeReport(file, report){
  const summary = report.summary || {};
  const retention = report.candidateRetention || {};
  const best = (report.candidates || []).find(row => row.candidateId === summary.bestCandidateId) || (report.candidates || [])[0] || {};
  const identity = best.stageIdentity || {};
  const readyDecision = ['candidate-ready-for-full-analyzer-review', 'keeper-ready-for-runtime-review'].includes(summary.keeperDecision || '');
  const strictIdentityScored = Object.prototype.hasOwnProperty.call(identity, 'identityMargin10');
  const humanPerfectScored = Object.prototype.hasOwnProperty.call(summary, 'humanPerfectPotentialLift10')
    && Object.prototype.hasOwnProperty.call(best, 'humanPerfectGuard');
  return {
    stage: report.stage,
    generatedAt: report.generatedAt,
    sourceReport: rel(file),
    expectedLabels: report.expectedLabels || [],
    candidateCount: report.candidateCount || retention.totalMeasured || 0,
    retained: retention.retained || (report.candidates || []).length || 0,
    keeperDecision: summary.keeperDecision || 'pending',
    runtimeReadyUnderCurrentPolicy: !!(readyDecision && strictIdentityScored && humanPerfectScored && summary.noHumanPerfectRegression !== false),
    legacyReadyNeedsResweep: !!(readyDecision && !strictIdentityScored),
    strictIdentityScored,
    humanPerfectScored,
    bestCandidateId: summary.bestCandidateId || null,
    baselineExpectedScore10: round(summary.baselineExpectedScore10, 1),
    bestExpectedScore10: round(summary.bestExpectedScore10, 1),
    expectedLift10: round(summary.expectedLift10, 2),
    baselineTargetVideoObjectFitScore10: round(summary.baselineTargetVideoObjectFitScore10, 1),
    bestTargetVideoObjectFitScore10: round(summary.bestTargetVideoObjectFitScore10, 1),
    targetVideoObjectFitLift10: round(summary.targetVideoObjectFitLift10, 2),
    baselineHumanPerfectPotentialScore10: round(summary.baselineHumanPerfectPotentialScore10, 1),
    bestHumanPerfectPotentialScore10: round(summary.bestHumanPerfectPotentialScore10, 1),
    humanPerfectPotentialLift10: round(summary.humanPerfectPotentialLift10, 2),
    noHumanPerfectRegression: Object.prototype.hasOwnProperty.call(summary, 'noHumanPerfectRegression') ? !!summary.noHumanPerfectRegression : null,
    intendedStageSupported: !!summary.intendedStageSupported,
    noTargetVideoRegression: !!summary.noTargetVideoRegression,
    stageIdentityMargin10: round(identity.identityMargin10, 2),
    wrongReferencePenalty10: round(identity.wrongReferencePenalty10, 2),
    lateStageIdentityPass: Object.prototype.hasOwnProperty.call(identity, 'lateStageIdentityPass') ? !!identity.lateStageIdentityPass : null,
    lateWrongChallengePenalty10: round(identity.lateWrongChallengePenalty10, 2),
    expectedChallengeNumber: identity.expectedChallengeNumber ?? null,
    bestMatchChallengeNumber: identity.bestMatchChallengeNumber ?? null,
    bestFamilyIsExpected: Object.prototype.hasOwnProperty.call(identity, 'bestFamilyIsExpected') ? !!identity.bestFamilyIsExpected : null,
    bestMatchLabelId: summary.bestMatch?.labelId || best.bestMatch?.labelId || null,
    expectedReferenceHit: !!best.expectedReferenceHit,
    noSafetyRegression: !!best.noSafetyRegression,
    nextStep: summary.nextStep || `Rerun a focused candidate sweep for stage ${report.stage}.`,
    read: identity.lateStageIdentityPass === false
      ? `No runtime keeper: late-stage identity blocked because best match ${summary.bestMatch?.labelId || best.bestMatch?.labelId || 'none'} does not represent challenge ${identity.expectedChallengeNumber || 'n/a'}.`
      : humanPerfectScored && summary.noHumanPerfectRegression === false
        ? `No runtime keeper: candidate regresses human-perfect potential by ${Math.abs(round(summary.humanPerfectPotentialLift10, 2) || 0)}/10.`
      : readyDecision && strictIdentityScored
      ? 'Candidate is ready for temporary full-analyzer review before runtime promotion.'
      : readyDecision
        ? 'Legacy ready decision predates current identity-margin scoring; rerun before promotion.'
      : 'No runtime keeper yet; use this row as search evidence and improve reference identity/path shape before gameplay promotion.'
  };
}

function buildMarkdown(report){
  const lateIdentityRead = row => {
    if(row.lateStageIdentityPass === false){
      return `blocked (${row.bestMatchChallengeNumber ?? 'n/a'} vs ${row.expectedChallengeNumber ?? 'n/a'}; penalty ${row.lateWrongChallengePenalty10 ?? 'n/a'})`;
    }
    if(row.lateStageIdentityPass === true) return 'pass';
    return 'n/a';
  };
  const rows = report.rows.map(row => `| ${row.stage} | ${row.candidateCount} | ${row.keeperDecision} | ${row.runtimeReadyUnderCurrentPolicy ? 'yes' : 'no'} | ${row.legacyReadyNeedsResweep ? 'yes' : 'no'} | ${row.bestExpectedScore10 ?? 'n/a'}/10 | ${row.bestTargetVideoObjectFitScore10 ?? 'n/a'}/10 | ${row.bestHumanPerfectPotentialScore10 ?? 'n/a'}/10 | ${row.humanPerfectPotentialLift10 ?? 'n/a'} | ${row.stageIdentityMargin10 ?? 'n/a'} | ${row.bestMatchLabelId || 'none'} | ${lateIdentityRead(row)} | ${row.nextStep} |`).join('\n');
  return `# Challenge Stage Candidate Sweep Index

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

This index preserves the latest candidate-sweep result for each challenged Aurora stage. It prevents a single \`latest.json\` sweep from hiding earlier stage evidence, and it makes failed search work reusable for the next conformance cycle.

## Summary

- Stages covered: ${report.summary.stagesCovered}.
- Total candidates represented by latest per-stage rows: ${report.summary.totalCandidateCount}.
- Runtime-ready candidates under current identity policy: ${report.summary.runtimeReadyCount}.
- Legacy ready candidates needing resweep: ${report.summary.legacyReadyNeedsResweepCount}.
- Rows with human-perfect scoring: ${report.summary.humanPerfectScoredCount}.
- Strongest target-video lift: ${report.summary.strongestTargetVideoLift10}/10 on stage ${report.summary.strongestTargetVideoLiftStage || 'n/a'}.
- Strongest expected-label lift: ${report.summary.strongestExpectedLift10}/10 on stage ${report.summary.strongestExpectedLiftStage || 'n/a'}.
- Strongest human-perfect lift: ${report.summary.strongestHumanPerfectLift10}/10 on stage ${report.summary.strongestHumanPerfectLiftStage || 'n/a'}.

## Latest Per-Stage Rows

| Stage | Candidates | Decision | Current Ready | Legacy Resweep | Expected | Target Video | Human-Perfect | Human Lift | Identity Margin | Best Match | Late Identity | Next Step |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${rows}
`;
}

function main(){
  const reports = findReports(SWEEP_ROOT)
    .map(file => ({ file, report: readJson(file) }))
    .filter(item => item.report && Number.isFinite(+item.report.stage) && item.report.summary)
    .sort((a, b) => String(a.report.generatedAt || '').localeCompare(String(b.report.generatedAt || '')));
  const latestByStage = new Map();
  for(const item of reports){
    latestByStage.set(+item.report.stage, item);
  }
  const rows = [...latestByStage.values()]
    .map(item => summarizeReport(item.file, item.report))
    .sort((a, b) => a.stage - b.stage);
  const strongestTarget = rows.slice().sort((a, b) => (b.targetVideoObjectFitLift10 ?? -99) - (a.targetVideoObjectFitLift10 ?? -99))[0] || {};
  const strongestExpected = rows.slice().sort((a, b) => (b.expectedLift10 ?? -99) - (a.expectedLift10 ?? -99))[0] || {};
  const strongestHumanPerfect = rows.slice().sort((a, b) => (b.humanPerfectPotentialLift10 ?? -99) - (a.humanPerfectPotentialLift10 ?? -99))[0] || {};
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-stage-candidate-sweep-index',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    summary: {
      stagesCovered: rows.length,
      stages: rows.map(row => row.stage),
      totalCandidateCount: rows.reduce((sum, row) => sum + (+row.candidateCount || 0), 0),
      runtimeReadyCount: rows.filter(row => row.runtimeReadyUnderCurrentPolicy).length,
      legacyReadyNeedsResweepCount: rows.filter(row => row.legacyReadyNeedsResweep).length,
      humanPerfectScoredCount: rows.filter(row => row.humanPerfectScored).length,
      noKeeperCount: rows.filter(row => !row.runtimeReadyUnderCurrentPolicy).length,
      strongestTargetVideoLiftStage: strongestTarget.stage || null,
      strongestTargetVideoLift10: strongestTarget.targetVideoObjectFitLift10 ?? null,
      strongestExpectedLiftStage: strongestExpected.stage || null,
      strongestExpectedLift10: strongestExpected.expectedLift10 ?? null,
      strongestHumanPerfectLiftStage: strongestHumanPerfect.stage || null,
      strongestHumanPerfectLift10: strongestHumanPerfect.humanPerfectPotentialLift10 ?? null,
      read: rows.some(row => row.runtimeReadyUnderCurrentPolicy)
        ? 'At least one stage has a candidate ready for temporary full-analyzer review.'
        : rows.some(row => row.legacyReadyNeedsResweep)
          ? 'Some old sweeps claimed ready candidates, but they predate identity-margin scoring and must be rerun before promotion.'
        : 'Recent candidate sweeps improved measurement and search evidence, but no stage currently has a runtime keeper.'
    },
    rows
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    stagesCovered: report.summary.stagesCovered,
    totalCandidateCount: report.summary.totalCandidateCount,
    runtimeReadyCount: report.summary.runtimeReadyCount,
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main();

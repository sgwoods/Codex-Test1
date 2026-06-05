#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep', 'latest.json');

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

const EXPECTED_STAGE = argValue('stage', '');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function isFiniteNumber(value){
  return Number.isFinite(+value);
}

if(!fs.existsSync(REPORT)){
  fail('Challenge-stage candidate sweep artifact is missing; run npm run harness:sweep:stage7-challenge-candidates first.', { report: rel(REPORT) });
}

const report = readJson(REPORT);
if(report.artifactType !== 'challenge-stage-candidate-sweep'){
  fail('Unexpected challenge-stage candidate sweep artifact type.', { artifactType: report.artifactType });
}

if(EXPECTED_STAGE && +report.stage !== +EXPECTED_STAGE){
  fail('Challenge-stage candidate sweep latest artifact is for the wrong stage.', {
    expectedStage: +EXPECTED_STAGE,
    actualStage: report.stage,
    report: rel(REPORT)
  });
}

if(!Array.isArray(report.expectedLabels) || !report.expectedLabels.length){
  fail('Candidate sweep is missing expected target labels.', report);
}

if(!Array.isArray(report.sampleTimes) || report.sampleTimes.length < 20){
  fail('Candidate sweep has too few sampled time points to support a motion gate.', {
    sampleTimes: report.sampleTimes
  });
}

if(!isFiniteNumber(report.candidateCount) || +report.candidateCount < 4){
  fail('Candidate sweep measured too few candidates.', { candidateCount: report.candidateCount });
}

const rows = Array.isArray(report.candidates) ? report.candidates : [];
if(!rows.length){
  fail('Candidate sweep retained no candidate rows.', report);
}

const baseline = rows.find(row => row.candidateId === report.summary?.baselineCandidateId)
  || rows.find(row => row.candidateId === 'baseline-current');
if(!baseline){
  fail('Candidate sweep is missing a retained baseline row.', { summary: report.summary });
}

const best = rows.find(row => row.candidateId === report.summary?.bestCandidateId);
if(!best){
  fail('Candidate sweep is missing its retained best candidate row.', { summary: report.summary });
}

for(const row of [baseline, best]){
  if(!row.runtimeVector || !row.runtimeSemantic || !row.stageIdentity){
    fail('Candidate sweep row is missing runtime vector, semantic read, or identity gate data.', row);
  }
  if(!row.bestMatch || !row.expectedMatch){
    fail('Candidate sweep row is missing best/expected reference match data.', row);
  }
  if(!row.targetVideoObjectFit || !isFiniteNumber(row.targetVideoObjectFit.score10)){
    fail('Candidate sweep row is missing target-video object-track fit data.', row);
  }
  if(!row.humanPerfectPotential || !isFiniteNumber(row.humanPerfectPotential.score10)){
    fail('Candidate sweep row is missing human-perfect potential data.', row);
  }
  if(!row.humanPerfectGuard || typeof row.humanPerfectGuard.pass !== 'boolean' || !isFiniteNumber(row.humanPerfectGuard.lift10)){
    fail('Candidate sweep row is missing the human-perfect regression gate.', row);
  }
  if(!row.humanVisibleGuardrails
    || typeof row.humanVisibleGuardrails.pass !== 'boolean'
    || !isFiniteNumber(row.humanVisibleGuardrails.score10)
    || !isFiniteNumber(row.humanVisibleGuardrails.groupVisibility)
    || !isFiniteNumber(row.humanVisibleGuardrails.arrivalContinuity)
    || !isFiniteNumber(row.humanVisibleGuardrails.spacingScore)
    || !isFiniteNumber(row.humanVisibleGuardrails.bunchingRisk)){
    fail('Candidate sweep row is missing the human-visible challenge guardrails.', row);
  }
  if(!isFiniteNumber(row.selectionScore10)){
    fail('Candidate sweep row is missing a selection score.', row);
  }
  if(!row.fullAnalyzerRisk || typeof row.fullAnalyzerRisk.pass !== 'boolean' || !row.fullAnalyzerRisk.reason){
    fail('Candidate sweep row is missing calibrated full-analyzer risk data.', row);
  }
}

const summary = report.summary || {};
for(const field of ['baselineExpectedScore10', 'bestExpectedScore10', 'expectedLift10']){
  if(!isFiniteNumber(summary[field])){
    fail(`Candidate sweep summary field ${field} is invalid.`, summary);
  }
}

if(summary.targetVideoComparable !== false){
  for(const field of ['baselineTargetVideoObjectFitScore10', 'bestTargetVideoObjectFitScore10', 'targetVideoObjectFitLift10']){
    if(!isFiniteNumber(summary[field])){
      fail(`Candidate sweep summary field ${field} is invalid.`, summary);
    }
  }
}

for(const field of ['baselineHumanPerfectPotentialScore10', 'bestHumanPerfectPotentialScore10', 'humanPerfectPotentialLift10']){
  if(!isFiniteNumber(summary[field])){
    fail(`Candidate sweep summary field ${field} is invalid.`, summary);
  }
}

for(const field of ['baselineHumanVisibleScore10', 'bestHumanVisibleScore10', 'humanVisibleLift10']){
  if(!isFiniteNumber(summary[field])){
    fail(`Candidate sweep summary field ${field} is invalid.`, summary);
  }
}

const validDecisions = new Set([
  'no-runtime-keeper-yet',
  'candidate-ready-for-full-analyzer-review',
  'keeper-ready-for-runtime-review'
]);
if(!validDecisions.has(summary.keeperDecision)){
  fail('Candidate sweep has an unknown keeper decision.', summary);
}

const promotionLikeDecision = summary.keeperDecision !== 'no-runtime-keeper-yet';
if(promotionLikeDecision){
  if(best.noSafetyRegression !== true){
    fail('Candidate is marked promotion-like but has safety regression.', best);
  }
  if(best.fullAnalyzerRisk?.pass !== true || summary.fullAnalyzerRisk?.pass !== true){
    fail('Candidate is marked promotion-like but does not pass the calibrated full-analyzer risk gate.', {
      summaryRisk: summary.fullAnalyzerRisk,
      bestRisk: best.fullAnalyzerRisk
    });
  }
  if(summary.noTargetVideoRegression !== true || summary.noExpectedRegression !== true || summary.intendedStageSupported !== true){
    fail('Candidate is marked promotion-like but does not satisfy the promotion policy booleans.', summary);
  }
  if(summary.noHumanPerfectRegression !== true || best.humanPerfectGuard?.pass !== true){
    fail('Candidate is marked promotion-like but regresses human-perfect potential.', {
      summary,
      bestHumanPerfectGuard: best.humanPerfectGuard
    });
  }
  if(summary.noHumanVisibleRegression !== true || best.humanVisibleGuardrails?.pass !== true){
    fail('Candidate is marked promotion-like but regresses human-visible challenge readability.', {
      summary,
      bestHumanVisibleGuardrails: best.humanVisibleGuardrails
    });
  }
}

const retention = report.candidateRetention || {};
if(isFiniteNumber(retention.totalMeasured) && +retention.totalMeasured < rows.length){
  fail('Candidate retention total is smaller than retained rows.', retention);
}

if(!report.measurementPolicy?.promotionRule || !report.measurementPolicy?.safety){
  fail('Candidate sweep is missing the durable measurement policy text.', report.measurementPolicy);
}

console.log(JSON.stringify({
  ok: true,
  artifact: rel(REPORT),
  stage: report.stage,
  expectedLabels: report.expectedLabels,
  candidateCount: report.candidateCount,
  retained: rows.length,
  baselineExpectedScore10: summary.baselineExpectedScore10,
  bestCandidateId: summary.bestCandidateId,
  bestExpectedScore10: summary.bestExpectedScore10,
  bestHumanPerfectPotentialScore10: summary.bestHumanPerfectPotentialScore10,
  expectedLift10: summary.expectedLift10,
  targetVideoObjectFitLift10: summary.targetVideoObjectFitLift10,
  humanPerfectPotentialLift10: summary.humanPerfectPotentialLift10,
  humanVisibleLift10: summary.humanVisibleLift10,
  keeperDecision: summary.keeperDecision,
  baselineSafetyPass: baseline.noSafetyRegression === true,
  bestSafetyPass: best.noSafetyRegression === true
}, null, 2));

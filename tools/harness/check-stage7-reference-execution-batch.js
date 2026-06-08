#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage7-challenge2', 'latest-batch.json');
const EXPECTED_CLASSES = [
  'canonical-family-alignment',
  'group1-path-length-compression',
  'lower-field-overstay-reduction',
  'phase-duration-rebalance',
  'preserve-scoreable-window',
  'protect-group4-group5'
];

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 7 semantic candidate batch report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage7-reference-execution-semantic-candidate-batch'){
    fail('Unexpected semantic candidate batch artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 7 || +report.scope?.challengeNumber !== 2){
    fail('Semantic candidate batch must stay scoped to Stage 7 / Challenge 2.', { scope: report.scope });
  }
  if(report.summary?.runtimeKeeperRecommendation !== 'not-a-runtime-keeper'){
    fail('Semantic batch must not claim a runtime keeper.', { summary: report.summary });
  }
  const tested = new Set(report.transformationClassesTested || []);
  const missingClasses = EXPECTED_CLASSES.filter(classId => !tested.has(classId));
  if(missingClasses.length) fail('Semantic batch did not test all expected transformation classes.', { missingClasses });
  const candidates = Array.isArray(report.candidates) ? report.candidates : [];
  if(candidates.length < EXPECTED_CLASSES.length){
    fail('Semantic batch must include at least one candidate per expected transformation class.', { candidateCount: candidates.length });
  }
  const rowIssues = [];
  for(const candidate of candidates){
    const prefix = candidate.candidateId || 'candidate';
    if(!Array.isArray(candidate.semanticTransformations) || !candidate.semanticTransformations.length) rowIssues.push(`${prefix}: missing semantic transformations`);
    if(!Number.isFinite(+candidate.totalObjectTrackScore10)) rowIssues.push(`${prefix}: missing total object-track score`);
    if(!Number.isFinite(+candidate.totalObjectTrackCoverage)) rowIssues.push(`${prefix}: missing total coverage`);
    if(!candidate.groupScores || !Number.isFinite(+candidate.groupScores.group1) || !Number.isFinite(+candidate.groupScores.group4) || !Number.isFinite(+candidate.groupScores.group5)) rowIssues.push(`${prefix}: missing focus group scores`);
    if(!candidate.canonicalFamilyMatch || typeof candidate.canonicalFamilyMatch.allGroups !== 'boolean') rowIssues.push(`${prefix}: missing canonical family status`);
    if(!candidate.guardrails || typeof candidate.guardrails.spacingReadability !== 'boolean' || typeof candidate.guardrails.scoreableRoutes !== 'boolean' || typeof candidate.guardrails.safety !== 'boolean') rowIssues.push(`${prefix}: missing guardrail statuses`);
    if(!candidate.semanticValidity || typeof candidate.semanticValidity.pass !== 'boolean') rowIssues.push(`${prefix}: missing semantic validity read`);
    if(typeof candidate.readyForRuntimeSourceCandidate !== 'boolean') rowIssues.push(`${prefix}: missing runtime-source readiness`);
  }
  if(rowIssues.length) fail('Semantic batch candidate rows are incomplete.', { rowIssues });
  const classSummaries = Array.isArray(report.classSummaries) ? report.classSummaries : [];
  if(classSummaries.length !== EXPECTED_CLASSES.length){
    fail('Semantic batch class summary must cover each expected class.', { classSummaryCount: classSummaries.length });
  }
  const ready = candidates.filter(candidate => candidate.readyForRuntimeSourceCandidate);
  const recommendation = report.summary?.recommendation || '';
  if(ready.length > 1){
    fail('Semantic batch may recommend at most one runtime source candidate.', { ready: ready.map(candidate => candidate.candidateId) });
  }
  if(ready.length === 1 && recommendation !== 'exactly-one-runtime-source-candidate-to-try'){
    fail('Semantic batch has one ready candidate but did not make the exact-one recommendation.', { recommendation, ready: ready[0].candidateId });
  }
  if(ready.length === 0 && recommendation !== 'no-runtime-source-candidate'){
    fail('Semantic batch has no ready candidate but did not make the no-runtime recommendation.', { recommendation });
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidateCount: candidates.length,
    transformationClassesTested: Array.from(tested),
    recommendation,
    runtimeSourceCandidateId: report.summary.runtimeSourceCandidateId || null,
    bestCandidateId: report.bestCandidate?.candidateId || null
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}

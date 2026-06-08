#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1', 'latest-batch.json');
const REGRESSION = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1', 'latest-regression-baseline.json');
const COMPARISON = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1', 'latest-batch-comparison.json');
const EXPECTED_CLASSES = [
  'group1-object-track-path-fit',
  'group4-object-track-path-fit',
  'group1-peel-off-readability',
  'group4-peel-off-readability',
  'preserve-upper-band-scoreability',
  'protect-semantic-line-roles',
  'protect-no-combat-scoreable-routes'
];

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 3 semantic candidate batch report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function requireTruthy(value, message, payload){
  if(!value) fail(message, payload);
}

function main(){
  const report = readJson(REPORT);
  requireTruthy(report.artifactType === 'stage3-reference-execution-semantic-candidate-batch', 'Unexpected Stage 3 semantic batch artifact type.', { artifactType: report.artifactType });
  requireTruthy(+report.scope?.stage === 3 && +report.scope?.challengeNumber === 1, 'Stage 3 semantic batch must stay scoped to Stage 3 / Challenge 1.', { scope: report.scope });
  requireTruthy(report.summary?.runtimeKeeperRecommendation === 'not-a-runtime-keeper', 'Stage 3 semantic batch must not claim a runtime keeper.', { summary: report.summary });
  requireTruthy(report.summary?.readyForRuntimeSourceCandidate === false, 'Stage 3 semantic batch must not authorize runtime source.', { summary: report.summary });
  requireTruthy(report.summary?.sourceCandidateGenerationAllowed === false, 'Stage 3 semantic batch must not authorize source candidate generation.', { summary: report.summary });
  requireTruthy(report.sourceReadyGate?.runtimeSourceCandidateAuthorized === false, 'Source-ready gate must explicitly block runtime source candidates.', { sourceReadyGate: report.sourceReadyGate });
  requireTruthy(report.sourceReadyGate?.requiresRuntimeExpressibilityProofBeforeSourceEdit === true, 'Source-ready gate must require transfer proof before source edits.', { sourceReadyGate: report.sourceReadyGate });

  const candidateDir = path.join(ROOT, report.generatedCandidateDir || '');
  requireTruthy(fs.existsSync(candidateDir), 'Generated candidate directory is missing.', { generatedCandidateDir: report.generatedCandidateDir });
  const candidates = Array.isArray(report.candidates) ? report.candidates : [];
  requireTruthy(candidates.length >= 8 && candidates.length <= 12, 'Stage 3 semantic batch must generate roughly 8-12 candidates.', { candidateCount: candidates.length });

  const tested = new Set(report.transformationClassesTested || []);
  const missingClasses = EXPECTED_CLASSES.filter(classId => !tested.has(classId));
  if(missingClasses.length) fail('Stage 3 semantic batch did not test every expected transform class.', { missingClasses });

  const rowIssues = [];
  for(const candidate of candidates){
    const prefix = candidate.candidateId || 'candidate';
    if(!candidate.candidateId) rowIssues.push(`${prefix}: missing candidate id`);
    if(!candidate.semanticTransformId) rowIssues.push(`${prefix}: missing semantic transform id`);
    if(!Array.isArray(candidate.semanticTransformations) || !candidate.semanticTransformations.length) rowIssues.push(`${prefix}: missing transformation list`);
    if(!Array.isArray(candidate.touchedGroups)) rowIssues.push(`${prefix}: missing touched groups`);
    if(!Array.isArray(candidate.protectedGroups)) rowIssues.push(`${prefix}: missing protected groups`);
    if(!Array.isArray(candidate.protectedRoles) || !candidate.protectedRoles.length) rowIssues.push(`${prefix}: missing protected roles`);
    if(!candidate.expectedPlayerVisibleImprovement) rowIssues.push(`${prefix}: missing expected player-visible improvement`);
    if(!candidate.expectedStrictMetricMovement || typeof candidate.expectedStrictMetricMovement !== 'object') rowIssues.push(`${prefix}: missing expected strict metric movement`);
    if(!candidate.authorityAssumptions || typeof candidate.authorityAssumptions !== 'object') rowIssues.push(`${prefix}: missing authority assumptions`);
    if(!candidate.expectedMetricDeltas || typeof candidate.expectedMetricDeltas !== 'object') rowIssues.push(`${prefix}: missing expected metric deltas`);
    if(!Array.isArray(candidate.hardGuardrails) || candidate.hardGuardrails.length < 5) rowIssues.push(`${prefix}: missing hard guardrails`);
    if(!Array.isArray(candidate.softOptimizationTargets) || !candidate.softOptimizationTargets.length) rowIssues.push(`${prefix}: missing soft optimization targets`);
    if(!candidate.transferProofHypothesis || candidate.transferProofHypothesis.browserTransferProofRequired !== true) rowIssues.push(`${prefix}: missing browser transfer-proof hypothesis`);
    if(candidate.transferProofHypothesis?.runtimeSourceCandidateAuthorized !== false) rowIssues.push(`${prefix}: transfer-proof hypothesis must not authorize runtime source`);
    if(!Array.isArray(candidate.transferProofHypothesis?.hypothesizedRuntimeControls) || !candidate.transferProofHypothesis.hypothesizedRuntimeControls.length) rowIssues.push(`${prefix}: missing hypothesized runtime controls`);
    if(!Array.isArray(candidate.redProvenanceFieldsUsed) || !candidate.redProvenanceFieldsUsed.length) rowIssues.push(`${prefix}: missing RED provenance fields`);
    if(!candidate.candidateInput || !fs.existsSync(path.join(ROOT, candidate.candidateInput))) rowIssues.push(`${prefix}: missing generated candidate input file`);
    const scores = candidate.scores || {};
    for(const key of [
      'semanticRolePreservation',
      'strictObjectTrackFit',
      'strictObjectTrackDelta10',
      'focusObjectTrackFit',
      'focusObjectTrackDelta',
      'pathShapeFit',
      'pathLengthShapeFit',
      'pathLengthSanity',
      'peelOffReadability',
      'focusPeelOffReadability',
      'upperBandScoreability',
      'routeLearnability',
      'noCombatGrammarPreservation',
      'spacingReadability',
      'authorityConflictCount',
      'humanVisibleVsCpuFieldOccupancyTensionCount',
      'rankingScore'
    ]){
      if(!Number.isFinite(+scores[key])) rowIssues.push(`${prefix}: missing score ${key}`);
    }
    if(!scores.groupObjectDeltas || !Object.prototype.hasOwnProperty.call(scores.groupObjectDeltas, 'group1') || !Object.prototype.hasOwnProperty.call(scores.groupObjectDeltas, 'group4')){
      rowIssues.push(`${prefix}: missing group 1/group 4 object deltas`);
    }
    if(!scores.pathLengthShapeFitByGroup || !Object.prototype.hasOwnProperty.call(scores.pathLengthShapeFitByGroup, 'group1') || !Object.prototype.hasOwnProperty.call(scores.pathLengthShapeFitByGroup, 'group4')){
      rowIssues.push(`${prefix}: missing group 1/group 4 path-length shape scores`);
    }
    if(!scores.pathShapeFitByGroup || !Object.prototype.hasOwnProperty.call(scores.pathShapeFitByGroup, 'group1') || !Object.prototype.hasOwnProperty.call(scores.pathShapeFitByGroup, 'group4')){
      rowIssues.push(`${prefix}: missing group 1/group 4 path-shape scores`);
    }
    if(!scores.pathLengthSanityByGroup || !Object.prototype.hasOwnProperty.call(scores.pathLengthSanityByGroup, 'group1') || !Object.prototype.hasOwnProperty.call(scores.pathLengthSanityByGroup, 'group4')){
      rowIssues.push(`${prefix}: missing group 1/group 4 path-length sanity scores`);
    }
    const guardrails = candidate.guardrails || {};
    for(const key of ['spacingReadability', 'scoreableRoutes', 'safety', 'noCombatGrammar']){
      if(typeof guardrails[key] !== 'boolean') rowIssues.push(`${prefix}: missing guardrail ${key}`);
    }
    const yieldRead = candidate.yield || {};
    for(const key of ['valid', 'improved', 'objectImproved', 'pathShapeImproved', 'pathLengthSanityImproved', 'pathImproved', 'peelImproved', 'multiAxisImproved', 'geometryOnlyLift', 'guardrailSafe', 'trialPromising', 'sourceBlocked']){
      if(typeof yieldRead[key] !== 'boolean') rowIssues.push(`${prefix}: missing yield ${key}`);
    }
    if(!['player-visible-semantic-lift', 'metric-only-probe', 'semantic-only-probe', 'low-yield', 'guardrail-regression'].includes(yieldRead.candidateClassification)){
      rowIssues.push(`${prefix}: missing calibrated candidate classification`);
    }
    if(!Array.isArray(yieldRead.blockedReasons)) rowIssues.push(`${prefix}: missing blocked reasons`);
    if(!Array.isArray(yieldRead.blockerTypes)) rowIssues.push(`${prefix}: missing blocker types`);
    if(yieldRead.geometryOnlyLift && yieldRead.trialPromising) rowIssues.push(`${prefix}: geometry-only lift must not be trial-promising`);
    if(yieldRead.candidateClassification === 'metric-only-probe' && yieldRead.trialPromising) rowIssues.push(`${prefix}: metric-only probe must not be trial-promising`);
    if(yieldRead.trialPromising && yieldRead.candidateClassification !== 'player-visible-semantic-lift') rowIssues.push(`${prefix}: trial-promising candidates must be player-visible semantic lifts`);
    if(candidate.runtimePromotion?.readyForRuntimeSourceCandidate !== false || candidate.runtimePromotion?.sourceCandidateGenerationAllowed !== false){
      rowIssues.push(`${prefix}: runtime promotion fields must remain false`);
    }
  }
  if(rowIssues.length) fail('Stage 3 semantic batch candidate rows are incomplete.', { rowIssues });

  const classYield = Array.isArray(report.candidateClassYield) ? report.candidateClassYield : [];
  requireTruthy(classYield.length === EXPECTED_CLASSES.length, 'Stage 3 semantic batch must report yield for every expected class.', { classYieldCount: classYield.length });
  for(const classId of EXPECTED_CLASSES){
    const row = classYield.find(item => item.classId === classId);
    if(!row) fail(`Missing class-yield row for ${classId}.`, { classYield });
    for(const key of ['generated', 'valid', 'improved', 'guardrailSafe', 'trialPromising', 'blocked']){
      if(!Number.isFinite(+row[key])) fail(`Class-yield row missing ${key}.`, { row });
    }
  }

  requireTruthy(Array.isArray(report.blockerSummary), 'Stage 3 semantic batch must include a blocker summary.', { blockerSummary: report.blockerSummary });
  requireTruthy(Array.isArray(report.blockerTaxonomy), 'Stage 3 semantic batch must include a blocker taxonomy.', { blockerTaxonomy: report.blockerTaxonomy });
  const rankingCalibration = report.rankingCalibration || {};
  requireTruthy(rankingCalibration.rankingModelVersion === 'stage3-player-visible-multiaxis-0.2', 'Stage 3 semantic batch must use the calibrated multi-axis ranking model.', { rankingCalibration });
  requireTruthy(rankingCalibration.peelOffReadabilityRequiredForTrialPromising === true, 'Trial-promising status must require peel-off readability.', { rankingCalibration });
  requireTruthy(rankingCalibration.geometryOnlyWinnersClassifiedAs === 'metric-only-probe', 'Geometry-only winners must be classified as metric-only probes.', { rankingCalibration });
  requireTruthy(rankingCalibration.semanticScoreAloneCanAuthorizeReadiness === false, 'Semantic score alone must not authorize readiness.', { rankingCalibration });
  if(rankingCalibration.focusedComparison){
    const focused = rankingCalibration.focusedComparison;
    requireTruthy(focused.after?.multiAxisRank < focused.after?.geometryHeavyRank, 'Calibrated ranking must promote the multi-axis candidate over the geometry-heavy probe.', { focusedComparison: focused });
    requireTruthy(focused.after?.geometryHeavyClassification === 'metric-only-probe', 'Geometry-heavy comparison candidate must be classified as a metric-only probe.', { focusedComparison: focused });
    requireTruthy(focused.after?.geometryHeavyTrialPromising === false, 'Geometry-heavy comparison candidate must not be trial-promising.', { focusedComparison: focused });
    requireTruthy(focused.after?.multiAxisClassification === 'player-visible-semantic-lift', 'Multi-axis comparison candidate must be classified as player-visible semantic lift.', { focusedComparison: focused });
  }
  const calibration = report.scoringCalibrationNote || {};
  requireTruthy(Number.isFinite(+calibration.baselineSemanticScore), 'Calibration note must include baseline semantic score.', { scoringCalibrationNote: calibration });
  requireTruthy(Number.isFinite(+calibration.baselineObjectTrackScore10), 'Calibration note must include baseline object-track score.', { scoringCalibrationNote: calibration });
  requireTruthy(typeof calibration.objectTrackMetricResponsive === 'boolean', 'Calibration note must classify object-track responsiveness.', { scoringCalibrationNote: calibration });
  requireTruthy(typeof calibration.pathLengthShapeMetricResponsive === 'boolean', 'Calibration note must classify path-length/shape responsiveness.', { scoringCalibrationNote: calibration });
  requireTruthy(typeof calibration.peelOffMetricResponsive === 'boolean', 'Calibration note must classify peel-off responsiveness.', { scoringCalibrationNote: calibration });
  requireTruthy(calibration.predictiveEnoughForRuntimeSource === false, 'Calibration must not claim runtime-source predictiveness.', { scoringCalibrationNote: calibration });

  const promising = candidates.filter(candidate => candidate.yield.trialPromising);
  const recommendation = report.summary?.recommendation || '';
  if(recommendation === 'ready-for-one-more-small-stage3-semantic-batch'){
    requireTruthy(!!report.summary.trialPromisingCandidateId, 'One-candidate recommendation must name the trial-promising candidate.', { summary: report.summary });
    requireTruthy(candidates[0]?.candidateId === report.summary.trialPromisingCandidateId, 'Trial-promising candidate must be ranked first.', { bestCandidate: candidates[0], summary: report.summary });
    requireTruthy(candidates[0]?.yield?.candidateClassification === 'player-visible-semantic-lift', 'Ranked-first candidate must be a player-visible semantic lift.', { bestCandidate: candidates[0] });
    requireTruthy(report.scoringCalibrationNote?.predictiveEnoughForNextTrialBatch === true, 'Calibrated batch must explicitly allow one more small trial batch only.', { scoringCalibrationNote: report.scoringCalibrationNote });
  }else if(recommendation === 'transfer-proof-ready'){
    requireTruthy(!!report.summary.transferProofReadyCandidateId, 'Transfer-proof-ready recommendation must name a candidate.', { summary: report.summary });
    requireTruthy(candidates[0]?.candidateId === report.summary.transferProofReadyCandidateId, 'Transfer-proof-ready candidate must be ranked first.', { bestCandidate: candidates[0], summary: report.summary });
    requireTruthy(candidates[0]?.yield?.candidateClassification === 'player-visible-semantic-lift', 'Transfer-proof-ready candidate must be a player-visible semantic lift.', { bestCandidate: candidates[0] });
    requireTruthy(report.summary.readyForRuntimeSourceCandidate === false && report.sourceReadyGate.runtimeSourceCandidateAuthorized === false, 'Transfer-proof-ready must not authorize runtime source.', { summary: report.summary, sourceReadyGate: report.sourceReadyGate });
  }else if(recommendation === 'transfer-proof-tie-select-smallest'){
    requireTruthy(!!report.summary.transferProofReadyCandidateId, 'Tie recommendation must select a future proof candidate.', { summary: report.summary });
    const selected = candidates.find(candidate => candidate.candidateId === report.summary.transferProofReadyCandidateId);
    requireTruthy(selected?.yield?.candidateClassification === 'player-visible-semantic-lift', 'Tie-selected candidate must be a player-visible semantic lift.', { selected });
    requireTruthy(report.summary.readyForRuntimeSourceCandidate === false, 'Tie-selected transfer proof target must not authorize runtime source.', { summary: report.summary });
  }else if(recommendation === 'metric-language-improvements-before-transfer-proof'){
    requireTruthy(!report.summary.transferProofReadyCandidateId, 'Metric/language recommendation must not name a transfer-proof candidate.', { summary: report.summary });
  }else if(recommendation === 'metric-language-improvements-before-more-generation'){
    requireTruthy(!report.summary.trialPromisingCandidateId, 'Metric/language recommendation must not name a trial-promising candidate.', { summary: report.summary });
  }else{
    fail('Unexpected Stage 3 semantic batch recommendation.', { recommendation });
  }

  requireTruthy(promising.length === report.summary?.trialPromisingCandidateCount, 'Promising candidate count mismatch.', {
    counted: promising.length,
    summary: report.summary
  });
  requireTruthy(candidates.every(candidate => candidate.runtimePromotion?.readyForRuntimeSourceCandidate === false), 'No generated candidate may be runtime-source-ready.', { candidates: candidates.map(candidate => candidate.candidateId) });

  let comparisonRead = null;
  if(fs.existsSync(COMPARISON)){
    const comparison = readJson(COMPARISON);
    requireTruthy(comparison.artifactType === 'stage3-reference-execution-batch-yield-comparison', 'Unexpected Stage 3 batch comparison artifact.', { artifactType: comparison.artifactType });
    requireTruthy(comparison.calibrationVerdict?.geometryOnlyCandidatesRemainMetricOnly === true, 'Geometry-only candidates must remain metric-only in the old-vs-new comparison.', { calibrationVerdict: comparison.calibrationVerdict });
    requireTruthy(comparison.calibrationVerdict?.runtimeSourceCandidateAuthorized === false, 'Comparison must not authorize runtime source.', { calibrationVerdict: comparison.calibrationVerdict });
    requireTruthy(comparison.freshBatch?.generated >= 8 && comparison.freshBatch?.generated <= 12, 'Fresh comparison batch must contain roughly 8-12 candidates.', { freshBatch: comparison.freshBatch });
    requireTruthy(comparison.regressionBaseline?.generated >= 8 && comparison.regressionBaseline?.generated <= 12, 'Regression baseline must contain roughly 8-12 candidates.', { regressionBaseline: comparison.regressionBaseline });
    if(comparison.calibrationVerdict?.candidateLanguageStableEnoughForTransferProof === true){
      requireTruthy(!!comparison.calibrationVerdict.selectedFutureTransferProofCandidateId, 'Stable comparison must select a future transfer-proof candidate.', { calibrationVerdict: comparison.calibrationVerdict });
    }
    comparisonRead = {
      stableEnoughForTransferProof: comparison.calibrationVerdict?.candidateLanguageStableEnoughForTransferProof,
      selectedFutureTransferProofCandidateId: comparison.calibrationVerdict?.selectedFutureTransferProofCandidateId || null
    };
  }
  if(fs.existsSync(REGRESSION)){
    const regression = readJson(REGRESSION);
    requireTruthy(regression.artifactType === 'stage3-reference-execution-semantic-candidate-batch', 'Unexpected Stage 3 regression baseline artifact.', { artifactType: regression.artifactType });
    requireTruthy(regression.candidateGenerationMode === 'regression-baseline-existing-candidates', 'Regression baseline must be marked as existing-candidate regression.', { candidateGenerationMode: regression.candidateGenerationMode });
  }

  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidateCount: candidates.length,
    recommendation,
    trialPromisingCandidateId: report.summary.trialPromisingCandidateId || null,
    transferProofReadyCandidateId: report.summary.transferProofReadyCandidateId || null,
    bestCandidateId: candidates[0]?.candidateId || null,
    bestRankingScore: candidates[0]?.scores?.rankingScore ?? null,
    comparison: comparisonRead,
    classYield: classYield.map(row => ({ classId: row.classId, generated: row.generated, trialPromising: row.trialPromising }))
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}

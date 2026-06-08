#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CANDIDATE_ID = 'stage7-semantic-phase-align-protect-0.1';
const CALIBRATION_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-calibrations', 'stage7-challenge2', '2026-06-08-stage7-semantic-phase-align-protect-runtime-rejection');
const BATCH = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage7-challenge2', 'latest-batch.json');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage7-challenge2-0.1.json');
const VOCABULARY = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', 'stage7-semantic-vocabulary-0.1.json');
const TARGET_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-target-contracts', 'aurora-challenge-contracts-0.1.json');
const SETPIECE_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-setpiece-contracts', 'latest.json');
const ACTUAL_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', '2026-06-08-42bae02e1', 'report.json');
const AURORA_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');
const MOTION_PROFILE_CHECK = path.join(ROOT, 'tools', 'harness', 'check-challenge-motion-profile.js');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-calibrations', 'stage7-challenge2');
const OUT_JSON = path.join(OUT_ROOT, 'latest-semantic-runtime-calibration.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-semantic-runtime-calibration.md');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  if(!fs.existsSync(file)) throw new Error(`Missing required artifact: ${rel(file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function git(args, fallback = 'unknown'){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  }catch{
    return fallback;
  }
}

function round(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function sameOrder(a = [], b = []){
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function quoteListOrder(text){
  return Array.from(String(text || '').matchAll(/'([^']+)'/g)).map(match => match[1]);
}

function sourceSlice(text, startPattern, endPattern){
  const start = text.indexOf(startPattern);
  if(start < 0) return '';
  const end = endPattern ? text.indexOf(endPattern, start + startPattern.length) : -1;
  return text.slice(start, end > start ? end : undefined);
}

function extractFreezeList(text, pattern){
  const match = String(text || '').match(pattern);
  return match ? quoteListOrder(match[1]) : [];
}

function stage7RuntimeOrders(){
  const text = fs.existsSync(AURORA_PACK) ? fs.readFileSync(AURORA_PACK, 'utf8') : '';
  const layoutSlice = sourceSlice(text, 'fromStage:7,', 'fromStage:11,');
  const motionSlice = sourceSlice(text, 'const AURORA_CHALLENGE_STAGE7_MOTION_SPEC_GROUPS', 'const AURORA_CHALLENGE_STAGE7_CONTRACT_GROUPS');
  const contractSlice = sourceSlice(text, 'const AURORA_CHALLENGE_STAGE7_CONTRACT_GROUPS', 'const AURORA_CHALLENGE_STAGE11_CONTRACT_GROUPS');
  return {
    runtimeLayout: extractFreezeList(layoutSlice, /groupPathFamilies:Object\.freeze\(\[([^\]]+)\]\)/),
    runtimeMotionSpec: Array.from(motionSlice.matchAll(/pathFamilyHint:'([^']+)'/g)).map(match => match[1]),
    runtimeContract: Array.from(contractSlice.matchAll(/pathFamily:'([^']+)'/g)).map(match => match[1])
  };
}

function motionProfileOrder(){
  const text = fs.existsSync(MOTION_PROFILE_CHECK) ? fs.readFileSync(MOTION_PROFILE_CHECK, 'utf8') : '';
  const match = text.match(/7:\s*Object\.freeze\(\{[\s\S]*?pathFamilies:\s*Object\.freeze\(\[([^\]]+)\]\)/);
  return match ? quoteListOrder(match[1]) : [];
}

function targetContractOrder(){
  const contracts = readJson(TARGET_CONTRACTS);
  const row = (contracts.contracts || []).find(item => +item.stage === 7 || +item.challengeNumber === 2) || {};
  return (row.groups || []).map(group => group.pathFamily || '');
}

function setpieceOrder(){
  const report = readJson(SETPIECE_CONTRACTS);
  const row = (report.contracts || []).find(item => +item.stage === 7 || +item.challengeNumber === 2) || {};
  return (row.targetContract?.groupSchedule || []).map(group => group.pathFamily || '');
}

function descriptionOrder(description){
  return (description.groups || []).map(group => group.canonicalComparisonPathFamily || '');
}

function candidateOrder(candidate, fallbackOrder){
  const order = fallbackOrder.slice();
  for(const group of candidate.groups || []){
    const index = (+group.groupIndex || 0) - 1;
    if(index >= 0 && group.pathFamily) order[index] = group.pathFamily;
  }
  return order;
}

function stage7Row(report){
  const row = (report.stageRows || []).find(item => +item.stage === 7 || +item.challengeNumber === 2);
  if(!row) throw new Error(`Missing Stage 7 row in ${rel(ACTUAL_CONFORMANCE)}`);
  return row;
}

function groupScoresFromActual(row){
  const fits = row.strictAxisReads?.targetContractFit?.objectTrackFits || [];
  return Object.fromEntries(fits.map(fit => [`group${fit.groupIndex}`, fit.score10]));
}

function focusScores(groupScores = {}){
  return {
    group1: groupScores.group1 ?? null,
    group4: groupScores.group4 ?? null,
    group5: groupScores.group5 ?? null
  };
}

function delta(predicted, actual){
  if(!Number.isFinite(+predicted) || !Number.isFinite(+actual)) return null;
  return round(+actual - +predicted, 3);
}

function classSpec(vocabulary, classId){
  return (vocabulary.transformationClasses || []).find(row => row.classId === classId) || {};
}

function buildTruthAlignment(description, candidate){
  const runtimeOrders = stage7RuntimeOrders();
  const liveGateOrder = motionProfileOrder();
  const targetOrder = targetContractOrder();
  const redOrder = descriptionOrder(description);
  const setpiece = setpieceOrder();
  const projected = candidateOrder(candidate, targetOrder);
  const sources = [
    {
      sourceId: 'reference-execution-description',
      role: 'measured-reference-intent',
      order: redOrder,
      canonicality: 'canonical for semantic/object-track candidate analysis'
    },
    {
      sourceId: 'challenge-setpiece-contracts',
      role: 'measured-reference-intent',
      order: setpiece,
      canonicality: 'measured setpiece contract; agrees with reference execution description'
    },
    {
      sourceId: 'semantic-candidate',
      role: 'candidate-projection',
      order: projected,
      canonicality: 'candidate attempted runtime projection'
    },
    {
      sourceId: 'challenge-motion-profile-check',
      role: 'live-promotion-gate',
      order: liveGateOrder,
      canonicality: 'live gate for runtime promotion until explicitly migrated'
    },
    {
      sourceId: 'challenge-stage-target-contracts',
      role: 'live-promotion-gate',
      order: targetOrder,
      canonicality: 'current strict-conformance target-contract source'
    },
    {
      sourceId: 'runtime-layout',
      role: 'live-runtime-source',
      order: runtimeOrders.runtimeLayout,
      canonicality: 'restored baseline runtime layout'
    },
    {
      sourceId: 'runtime-motion-spec',
      role: 'live-runtime-source',
      order: runtimeOrders.runtimeMotionSpec,
      canonicality: 'runtime path generator input'
    },
    {
      sourceId: 'runtime-contract-groups',
      role: 'live-runtime-source',
      order: runtimeOrders.runtimeContract,
      canonicality: 'runtime contract group exposure'
    }
  ];
  const liveGateSources = sources.filter(source => ['live-promotion-gate', 'live-runtime-source'].includes(source.role));
  return {
    liveGateOrder,
    measuredIntentOrder: redOrder,
    candidateProjectedOrder: projected,
    measuredIntentAgrees: sameOrder(redOrder, setpiece),
    liveGatesAgree: liveGateSources.every(source => sameOrder(source.order, liveGateOrder)),
    measuredIntentMatchesLiveGate: sameOrder(redOrder, liveGateOrder),
    candidateMatchesMeasuredIntent: sameOrder(projected, redOrder),
    candidateMatchesLiveGate: liveGateSources.every(source => sameOrder(projected, source.order)),
    canonicalForRuntimeCandidateGates: 'Use the live promotion gates and restored runtime source as candidate gate authority until the project explicitly migrates them to the measured reference-execution/setpiece order.',
    staleOrDiagnostic: [
      {
        artifact: 'reference-execution-description and challenge-setpiece-contracts',
        status: 'newer measured intent',
        read: sameOrder(redOrder, setpiece)
          ? 'They agree with each other and should guide the next truth-migration discussion.'
          : 'They disagree and need reconciliation before promotion.'
      },
      {
        artifact: 'challenge-motion-profile-check, target contracts, and runtime source',
        status: 'live gate authority',
        read: 'They currently preserve the restored baseline order and block candidate source promotion when a projection differs.'
      }
    ],
    sources
  };
}

function buildRuntimeExpressibility(candidate, vocabulary){
  return (candidate.semanticTransformations || []).map(classId => {
    const spec = classSpec(vocabulary, classId);
    const mapping = spec.runtimeExpressibility || {};
    return {
      classId,
      sourceReadySupported: mapping.sourceReadySupported === true,
      sourceReadyRole: mapping.sourceReadyRole || (mapping.sourceReadySupported === true ? 'runtime-transform' : 'analysis-only'),
      sourceFields: mapping.sourceFields || [],
      generatedRuntimeControls: mapping.generatedRuntimeControls || [],
      runtimeConsumer: mapping.runtimeConsumer || '',
      predictionLimits: mapping.predictionLimits || '',
      requiresCompiledRuntimeControls: mapping.requiresCompiledRuntimeControls === true,
      requiresProofArtifact: mapping.requiresProofArtifact || null,
      remainingCompilerGap: mapping.remainingCompilerGap || null,
      proofHarnesses: mapping.proofHarnesses || []
    };
  });
}

function overpredictedTransforms(candidate, actualMatchesPrediction){
  const rows = [];
  for(const classId of candidate.semanticTransformations || []){
    if(classId === 'phase-duration-rebalance'){
      rows.push({
        classId,
        overpredicted: true,
        read: 'The rejected runtime attempt did not transfer predicted phase-window lift into actual object-track movement. Current compiler output must use compiledRuntimeControls and passing proof before another source attempt.'
      });
    }else if(classId === 'canonical-family-alignment'){
      rows.push({
        classId,
        overpredicted: !actualMatchesPrediction,
        read: 'Path-family labels transferred while applied, but label alignment alone did not move object-track score and conflicted with live motion/profile order.'
      });
    }else if(classId === 'preserve-scoreable-window'){
      rows.push({
        classId,
        overpredicted: false,
        read: 'Guardrail held; this class does not claim movement lift.'
      });
    }else if(classId === 'protect-group4-group5'){
      rows.push({
        classId,
        overpredicted: false,
        read: 'Group 5 was preserved and group 4 did not regress in actual runtime, but this protection is not a movement compiler.'
      });
    }else{
      rows.push({
        classId,
        overpredicted: true,
        read: 'No actual runtime proof exists for this transform class.'
      });
    }
  }
  return rows;
}

function markdown(report){
  const metricRows = report.predictedVsActual.metrics.map(row => `| ${row.metric} | ${row.predicted} | ${row.actual} | ${row.delta ?? 'n/a'} | ${row.read} |`).join('\n');
  const truthRows = report.truthAlignment.sources.map(source => `| ${source.sourceId} | ${source.role} | ${source.order.join(', ')} | ${source.canonicality} |`).join('\n');
  const mappingRows = report.runtimeExpressibility.map(row => `| ${row.classId} | ${row.sourceReadySupported} | ${row.sourceReadyRole} | ${row.sourceFields.join('<br>') || 'none'} | ${row.remainingCompilerGap || row.predictionLimits || 'none'} |`).join('\n');
  const transformRows = report.overpredictedTransforms.map(row => `| ${row.classId} | ${row.overpredicted} | ${row.read} |`).join('\n');
  return `# Stage 7 Semantic Runtime Calibration

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Candidate: \`${report.candidateId}\`

Decision: ${report.decision.runtimeCandidateAllowed ? 'runtime candidate allowed' : 'runtime candidate blocked'}

## Predicted Vs Actual

| Metric | Predicted | Actual | Delta | Read |
| --- | ---: | ---: | ---: | --- |
${metricRows}

## Truth Alignment

Live gate order: ${report.truthAlignment.liveGateOrder.join(', ')}

Measured intent order: ${report.truthAlignment.measuredIntentOrder.join(', ')}

Candidate projected order: ${report.truthAlignment.candidateProjectedOrder.join(', ')}

Measured intent matches live gate: ${report.truthAlignment.measuredIntentMatchesLiveGate}

Candidate matches live gate: ${report.truthAlignment.candidateMatchesLiveGate}

${report.truthAlignment.canonicalForRuntimeCandidateGates}

| Source | Role | Path-family order | Canonicality |
| --- | --- | --- | --- |
${truthRows}

## Runtime Expressibility

| Transform | Source-ready | Role | Source fields | Gap |
| --- | --- | --- | --- | --- |
${mappingRows}

## Overprediction

| Transform | Overpredicted | Read |
| --- | --- | --- |
${transformRows}

## Recommendation

${report.decision.nextRecommendation}
`;
}

function main(){
  const batch = readJson(BATCH);
  const description = readJson(DESCRIPTION);
  const vocabulary = readJson(VOCABULARY);
  const candidateRow = (batch.candidates || []).find(row => row.candidateId === CANDIDATE_ID);
  if(!candidateRow) throw new Error(`Missing ${CANDIDATE_ID} in ${rel(BATCH)}`);
  const candidatePath = path.join(ROOT, candidateRow.candidateInput || '');
  const trialPath = path.join(ROOT, candidateRow.trialReport || '');
  const candidate = readJson(candidatePath);
  const trial = readJson(trialPath);
  const actualReport = readJson(ACTUAL_CONFORMANCE);
  const actualRow = stage7Row(actualReport);
  const actualGroupScores = focusScores(groupScoresFromActual(actualRow));
  const predictedGroupScores = focusScores(candidateRow.groupScores || {});
  const truthAlignment = buildTruthAlignment(description, candidate);
  const runtimeExpressibility = buildRuntimeExpressibility(candidate, vocabulary);
  const actualMatchesPrediction = round(actualRow.targetVideoObjectTrackFitScore10, 1) >= round(candidateRow.totalObjectTrackScore10, 1);
  const metrics = [
    {
      metric: 'totalObjectTrackScore10',
      predicted: candidateRow.totalObjectTrackScore10,
      actual: actualRow.targetVideoObjectTrackFitScore10,
      delta: delta(candidateRow.totalObjectTrackScore10, actualRow.targetVideoObjectTrackFitScore10),
      read: actualRow.targetVideoObjectTrackFitScore10 > (trial.baseline?.totalObjectTrackScore10 || 0)
        ? 'actual runtime improved over baseline'
        : 'actual runtime stayed at baseline'
    },
    {
      metric: 'totalObjectTrackCoverage',
      predicted: candidateRow.totalObjectTrackCoverage,
      actual: actualRow.targetVideoObjectTrackCoverage,
      delta: delta(candidateRow.totalObjectTrackCoverage, actualRow.targetVideoObjectTrackCoverage),
      read: 'coverage did not realize the predicted lift'
    },
    {
      metric: 'group1',
      predicted: predictedGroupScores.group1,
      actual: actualGroupScores.group1,
      delta: delta(predictedGroupScores.group1, actualGroupScores.group1),
      read: 'predicted group 1 lift did not transfer'
    },
    {
      metric: 'group4',
      predicted: predictedGroupScores.group4,
      actual: actualGroupScores.group4,
      delta: delta(predictedGroupScores.group4, actualGroupScores.group4),
      read: 'protected group held baseline but not predicted lift'
    },
    {
      metric: 'group5',
      predicted: predictedGroupScores.group5,
      actual: actualGroupScores.group5,
      delta: delta(predictedGroupScores.group5, actualGroupScores.group5),
      read: 'protected group matched prediction'
    },
    {
      metric: 'canonicalPathFamilyStatus',
      predicted: candidateRow.canonicalFamilyMatch?.allGroups === true ? 1 : 0,
      actual: truthAlignment.candidateMatchesLiveGate ? 1 : 0,
      delta: null,
      read: 'canonical reference-execution match did not imply live motion/profile gate match'
    }
  ];
  const runtimeCandidateAllowed = false;
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-semantic-runtime-calibration',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage7-semantic-runtime-calibration.js',
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 7,
      challengeNumber: 2,
      displayLabel: 'Stage 7 / Challenge 2'
    },
    candidateId: CANDIDATE_ID,
    sourceArtifacts: {
      calibrationDirectory: rel(CALIBRATION_DIR),
      semanticBatch: rel(BATCH),
      candidateInput: rel(candidatePath),
      candidateTrial: rel(trialPath),
      actualRuntimeConformance: rel(ACTUAL_CONFORMANCE),
      referenceExecutionDescription: rel(DESCRIPTION),
      semanticVocabulary: rel(VOCABULARY)
    },
    predictedVsActual: {
      baseline: {
        totalObjectTrackScore10: trial.baseline?.totalObjectTrackScore10 ?? null,
        totalObjectTrackCoverage: trial.baseline?.totalObjectTrackCoverage ?? null,
        groupScores: focusScores(Object.fromEntries((trial.baseline?.groupScores || []).map(row => [`group${row.groupIndex}`, row.aggregateObjectTrackScore10])))
      },
      metrics
    },
    truthAlignment,
    runtimeExpressibility,
    overpredictedTransforms: overpredictedTransforms(candidate, actualMatchesPrediction),
    likelyCauses: [
      {
        cause: 'runtime-expressibility',
        read: 'The rejected source attempt overpredicted phase-window transfer. The phase-duration compiler now emits consumed controls and preserves protected group 4/group 5 timing, but the constrained proof is still blocked by the motion/profile spacing-readability guard. The lower-field proof confirms lowerFieldBias/yOffset are consumed, but current generated values do not move group 2 lower-field share in the intended direction.'
      },
      {
        cause: 'stale-or-unreconciled-target-artifact',
        read: 'reference execution and setpiece orders disagree with the restored live motion-profile/target-contract/runtime order.'
      },
      {
        cause: 'metric-overprediction',
        read: 'the trial evaluator scored optimistic vectors without browser runtime proof.'
      },
      {
        cause: 'candidate-to-runtime-projection-mismatch',
        read: 'the runtime edit projected path-family labels but not the phase-window movement that produced the predicted score lift.'
      }
    ],
    decision: {
      runtimeCandidateAllowed,
      sourceReadyGatePass: false,
      nextRecommendation: 'Do not try another Stage 7 runtime candidate. Keep source-ready path-family authority on the live gates/runtime source, pause Stage 7 candidate work, and apply the RED pipeline front-first to Stage 3 / Challenge 1.',
      remainingCompilerGap: 'phase-duration-rebalance now emits runtime-consumed compiled controls and preserves protected group 4/group 5 timing, but the constrained proof is not source-ready because the motion/profile spacing-readability guard fails. lower-field-overstay-reduction now has a consumed-control proof, but group 2 lower-field share held at 0.6667 instead of moving toward 0.4522 and the proof failed motion/profile plus spacing/readability guards. group1 path-length compression remains analysis-only until a browser transfer proof exists.'
    }
  };
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(OUT_JSON),
    markdown: rel(OUT_MD),
    candidateId: CANDIDATE_ID,
    runtimeCandidateAllowed,
    measuredIntentMatchesLiveGate: truthAlignment.measuredIntentMatchesLiveGate,
    candidateMatchesLiveGate: truthAlignment.candidateMatchesLiveGate,
    remainingCompilerGap: report.decision.remainingCompilerGap
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

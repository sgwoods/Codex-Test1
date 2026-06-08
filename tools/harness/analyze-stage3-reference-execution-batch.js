#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  DEFAULT_CANDIDATE,
  OUT_ROOT,
  buildReport,
  readJson,
  rel,
  writeJson,
  writeText
} = require('./analyze-stage3-reference-execution-trial.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage3-challenge1-0.1.json');
const VOCABULARY = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', 'stage3-semantic-vocabulary-0.1.json');
const BATCH_LATEST = path.join(OUT_ROOT, 'latest-batch.json');
const BATCH_MARKDOWN = path.join(OUT_ROOT, 'latest-batch.md');
const CALIBRATION_LATEST = path.join(OUT_ROOT, 'latest-ranking-calibration.json');
const CALIBRATION_MARKDOWN = path.join(OUT_ROOT, 'latest-ranking-calibration.md');
const REGRESSION_LATEST = path.join(OUT_ROOT, 'latest-regression-baseline.json');
const REGRESSION_MARKDOWN = path.join(OUT_ROOT, 'latest-regression-baseline.md');
const COMPARISON_LATEST = path.join(OUT_ROOT, 'latest-batch-comparison.json');
const COMPARISON_MARKDOWN = path.join(OUT_ROOT, 'latest-batch-comparison.md');
const FOCUS_GROUPS = [1, 4];
const HARD_GUARDRAILS = [
  'preserve semantic line roles',
  'preserve upper-band scoreability',
  'preserve scoreable routes',
  'preserve spacing/readability',
  'preserve no-shot/no-attack/no-loss/no-contact safety',
  'do not increase authority conflict count',
  'do not treat RED target-conformance as runtime promotion authority'
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function argFlag(name){
  return process.argv.includes(`--${name}`);
}

function round(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function git(args, fallback = 'unknown'){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  }catch{
    return fallback;
  }
}

function gitJson(args){
  try{
    const raw = execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return raw ? JSON.parse(raw) : null;
  }catch{
    return null;
  }
}

function committedLatestBatchReport(){
  return gitJson(['show', `HEAD:${rel(BATCH_LATEST)}`]);
}

function byGroup(rows){
  return new Map((rows || []).map(row => [+row.groupIndex, row]));
}

function classSpec(vocabulary, classId){
  return (vocabulary.transformationClasses || []).find(row => row.classId === classId) || {};
}

function blend(value, target, amount){
  if(!Number.isFinite(+value) || !Number.isFinite(+target)) return value;
  return +value + ((+target - +value) * clamp(amount));
}

function expectedSideFromGesture(gesture){
  const text = String(gesture || '').toLowerCase();
  if(text.includes('lower-sides')) return 'lower-sides';
  if(text.includes('right')) return 'right';
  if(text.includes('left')) return 'left';
  if(text.includes('center')) return 'center';
  return '';
}

function baseCandidateTemplate(description, baselineCandidate){
  return {
    schemaVersion: 1,
    artifactType: 'stage3-reference-execution-candidate-trial-input',
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 3,
      challengeNumber: 1,
      displayLabel: 'Stage 3 / Challenge 1'
    },
    authorityLayerInputs: {
      targetConformanceAuthority: rel(DESCRIPTION),
      livePromotionAuthority: 'reference-artifacts/analyses/challenge-stage-conformance/latest.json',
      runtimeSourcePromotion: 'disabled for this semantic batch',
      authoritySeparation: 'Candidate trials may use RED target-conformance to rank non-overwriting intent, but they do not authorize runtime source edits.',
      knownPrivateArtifactCaveat: baselineCandidate.authorityLayerInputs?.knownPrivateArtifactCaveat || null
    },
    guardrails: baselineCandidate.guardrails,
    semanticMetrics: {
      preserveLineRoles: true,
      preserveUpperBandScoreability: true,
      preservePeelOffReadability: true,
      preserveRouteLearnability: true,
      preserveNoCombatGrammar: true
    },
    gates: Object.assign({}, baselineCandidate.gates, {
      allowRuntimeSourceCandidate: false,
      requireNoRuntimeSourceEdits: true
    }),
    hardGuardrails: HARD_GUARDRAILS,
    redArtifactDigest: {
      directSemanticLabelCount: description.summary?.directSemanticLabelCount ?? null,
      fieldOccupancyConflictCount: description.summary?.fieldOccupancyConflictCount ?? null,
      pathFamilyAuthorityConflictCount: description.summary?.pathFamilyAuthorityConflictCount ?? null
    }
  };
}

function semanticForGroup(descriptionGroup){
  const semantic = descriptionGroup.semanticExecution || {};
  return {
    lineRole: semantic.lineRole || null,
    entryCue: semantic.entryCue || null,
    exitGesture: semantic.exitGesture || null,
    scoreableBand: semantic.scoreableBand || 'upper-band'
  };
}

function pathFitVector({ baselineGroup, descriptionGroup, strength }){
  const base = baselineGroup.candidateVector || {};
  const target = descriptionGroup.aggregateObjectTrackTarget || {};
  const vector = Object.assign({}, base);
  vector.pathLength = round(blend(base.pathLength, target.pathLength, strength), 4);
  vector.yRange = round(blend(base.yRange, target.yRange, strength * 0.82), 4);
  vector.xRange = round(blend(base.xRange, target.xRange, strength * 0.58), 4);
  vector.visibleStartS = round(blend(base.visibleStartS, target.visibleStartS, strength * 0.38), 2);
  vector.visibleEndS = round(blend(base.visibleEndS, target.visibleEndS, strength * 0.68), 2);
  vector.turnCount = round(blend(base.turnCount, target.turnCount, strength * 0.5), 3);
  vector.reversalCount = round(blend(base.reversalCount, target.reversalCount, strength * 0.5), 3);
  vector.lowerFieldShare = round(base.lowerFieldShare, 4);
  vector.pathFamily = baselineGroup.candidatePathFamily || descriptionGroup.canonicalComparisonPathFamily || null;
  return vector;
}

function peelVector({ baselineGroup, descriptionGroup }){
  const base = baselineGroup.candidateVector || {};
  const vector = {};
  const side = expectedSideFromGesture(descriptionGroup.semanticExecution?.exitGesture);
  if(side && side !== 'lower-sides') vector.exitSide = side;
  if(side === 'lower-sides') vector.exitSide = base.exitSide === 'right' ? 'right' : 'left';
  vector.pathFamily = baselineGroup.candidatePathFamily || descriptionGroup.canonicalComparisonPathFamily || null;
  return vector;
}

function mergeGroupControl(existing, next){
  if(!existing) return next;
  return Object.assign({}, existing, next, {
    semanticExecution: Object.assign({}, existing.semanticExecution || {}, next.semanticExecution || {}),
    predictedRuntimeVector: Object.assign({}, existing.predictedRuntimeVector || {}, next.predictedRuntimeVector || {}),
    semanticTransformations: Array.from(new Set([...(existing.semanticTransformations || []), ...(next.semanticTransformations || [])]))
  });
}

function makeGroupControl({ groupIndex, descriptionByIndex, baselineByIndex, transformations, pathStrength = null, peel = false }){
  const descriptionGroup = descriptionByIndex.get(groupIndex);
  const baselineGroup = baselineByIndex.get(groupIndex);
  let vector = {};
  if(pathStrength !== null){
    vector = pathFitVector({ baselineGroup, descriptionGroup, strength: pathStrength });
  }
  if(peel){
    vector = Object.assign(vector, peelVector({ baselineGroup, descriptionGroup }));
  }
  return {
    groupIndex,
    semanticTransformations: transformations,
    pathFamily: baselineGroup?.candidatePathFamily || descriptionGroup?.canonicalComparisonPathFamily || null,
    semanticExecution: semanticForGroup(descriptionGroup),
    predictedRuntimeVector: vector,
    controlsRead: pathStrength !== null
      ? `path-fit blend ${round(pathStrength, 2)} toward RED aggregate target while preserving current lower-field share`
      : (peel ? 'peel-off side read projected from RED exitGesture' : 'semantic invariant only')
  };
}

function defaultTransferProofHypothesis(semanticTransformations){
  const controls = [];
  if(semanticTransformations.some(classId => classId.includes('object-track') || classId.includes('path-fit'))){
    controls.push('referencePath.playbackScale');
    controls.push('referencePath.pathLengthScale');
    controls.push('motionSpecGroup.spawnOffsetS');
    controls.push('routeCurveX');
    controls.push('routeCurveY');
  }
  if(semanticTransformations.some(classId => classId.includes('peel-off'))){
    controls.push('routeOffsetX');
    controls.push('routeCurveX');
    controls.push('routeCurveY');
    controls.push('path endpoint / exit-side control');
  }
  if(semanticTransformations.includes('preserve-upper-band-scoreability')){
    controls.push('scoreable-window timing read');
  }
  return {
    browserTransferProofRequired: true,
    runtimeSourceCandidateAuthorized: false,
    hypothesizedRuntimeControls: Array.from(new Set(controls)),
    read: 'Hypothesized controls must be proven in a later non-overwriting browser transfer proof before any runtime source edit.'
  };
}

function buildCandidate({ candidateId, semanticTransformId, semanticTransformations, meaning, touchedGroups, protectedGroups, protectedRoles, groupControls, description, baselineCandidate, expectedMetricDeltas, expectedPlayerVisibleImprovement, expectedStrictMetricMovement, softOptimizationTargets, transferProofHypothesis }){
  const template = baseCandidateTemplate(description, baselineCandidate);
  const groups = [];
  for(const control of groupControls){
    const existingIndex = groups.findIndex(group => +group.groupIndex === +control.groupIndex);
    if(existingIndex >= 0) groups[existingIndex] = mergeGroupControl(groups[existingIndex], control);
    else groups.push(control);
  }
  return Object.assign(template, {
    candidateId,
    semanticTransformId,
    semanticTransformations,
    intent: {
      kind: 'semantic-candidate-trial',
      read: meaning,
      playerFacingMeaning: meaning
    },
    touchedGroups,
    protectedGroups,
    protectedRoles,
    expectedPlayerVisibleImprovement: expectedPlayerVisibleImprovement || meaning,
    expectedStrictMetricMovement: expectedStrictMetricMovement || expectedMetricDeltas,
    authorityAssumptions: {
      pathFamilyAuthority: 'preserve current RED canonical path-family order for non-overwriting comparison',
      runtimePromotionAuthority: 'not-authorized',
      targetConformanceDebtCarriedForward: true,
      fieldOccupancyPolicy: 'human-visible upper-band scoreability and CPU lower-field geometry remain separate reads'
    },
    expectedMetricDeltas,
    hardGuardrails: HARD_GUARDRAILS,
    softOptimizationTargets,
    transferProofHypothesis: transferProofHypothesis || defaultTransferProofHypothesis(semanticTransformations),
    redProvenanceFieldsUsed: Array.from(new Set(semanticTransformations.flatMap(classId => [
      ...(classId.includes('path-fit') ? ['aggregateObjectTrackTarget', 'candidateComparisonGate.targetVector'] : []),
      ...(classId.includes('peel-off') ? ['semanticExecution.exitGesture', 'uncertaintyAndProvenance'] : []),
      ...(classId.includes('upper-band') ? ['semanticExecution.scoreableBand', 'semanticExecution.scoreableFrameWindow', 'fieldOccupancyExpectation'] : []),
      ...(classId.includes('line-roles') ? ['semanticExecution.lineRole', 'semanticExecution.entryCue'] : []),
      ...(classId.includes('no-combat') ? ['executionModel.noCombatGrammar', 'keeperRules'] : [])
    ]))),
    groups: groups.sort((a, b) => +a.groupIndex - +b.groupIndex)
  });
}

function buildCandidates({ description, vocabulary, baselineReport, baselineCandidate }){
  const descriptionByIndex = byGroup(description.groups || []);
  const baselineByIndex = byGroup(baselineReport.trial.groupResults || []);
  const controls = {
    g1Path: strength => makeGroupControl({ groupIndex: 1, descriptionByIndex, baselineByIndex, transformations: ['group1-object-track-path-fit'], pathStrength: strength }),
    g4Path: strength => makeGroupControl({ groupIndex: 4, descriptionByIndex, baselineByIndex, transformations: ['group4-object-track-path-fit'], pathStrength: strength }),
    g1Peel: () => makeGroupControl({ groupIndex: 1, descriptionByIndex, baselineByIndex, transformations: ['group1-peel-off-readability'], peel: true }),
    g4Peel: () => makeGroupControl({ groupIndex: 4, descriptionByIndex, baselineByIndex, transformations: ['group4-peel-off-readability'], peel: true })
  };
  const commonProtect = ['preserve-upper-band-scoreability', 'protect-semantic-line-roles', 'protect-no-combat-scoreable-routes'];
  const rows = [
    {
      candidateId: 'stage3-semantic-g1-path-fit-0.1',
      semanticTransformId: 'group1-object-track-path-fit',
      semanticTransformations: ['group1-object-track-path-fit', ...commonProtect],
      meaning: 'Pull the top-right bee line toward the RED object-track length and visible duration while preserving scoreable upper-band semantics.',
      touchedGroups: [1],
      protectedGroups: [2, 3, 4, 5],
      protectedRoles: ['late top-left butterfly line', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Path(0.72)],
      expectedMetricDeltas: { group1ObjectTrack: 'positive', group1PathLengthRatio: 'toward RED aggregate target', peelOffReadability: 'preserve baseline' },
      softOptimizationTargets: ['reduce group 1 path-length ratio', 'improve group 1 object-track fit without changing lower-field policy']
    },
    {
      candidateId: 'stage3-semantic-g4-path-fit-0.1',
      semanticTransformId: 'group4-object-track-path-fit',
      semanticTransformations: ['group4-object-track-path-fit', ...commonProtect],
      meaning: 'Pull the late top-left butterfly line toward the RED object-track path length and timing while preserving the opener.',
      touchedGroups: [4],
      protectedGroups: [1, 2, 3, 5],
      protectedRoles: ['top-right bee line', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g4Path(0.72)],
      expectedMetricDeltas: { group4ObjectTrack: 'positive', group4PathLengthRatio: 'toward RED aggregate target', peelOffReadability: 'preserve baseline' },
      softOptimizationTargets: ['reduce group 4 path-length ratio', 'improve group 4 object-track fit without reducing group 1']
    },
    {
      candidateId: 'stage3-semantic-g1-peel-read-0.1',
      semanticTransformId: 'group1-peel-off-readability',
      semanticTransformations: ['group1-peel-off-readability', ...commonProtect],
      meaning: 'Project the opener as a left peel-off phrase so the exit read matches the RED semantic contract.',
      touchedGroups: [1],
      protectedGroups: [2, 3, 4, 5],
      protectedRoles: ['late top-left butterfly line', 'scoreable routes', 'no-combat grammar'],
      groupControls: [controls.g1Peel()],
      expectedMetricDeltas: { group1PeelOffReadability: 'positive', objectTrackFit: 'neutral', scoreableRoutes: 'preserve' },
      softOptimizationTargets: ['make group 1 exit side match RED exitGesture', 'preserve path-family order']
    },
    {
      candidateId: 'stage3-semantic-g4-peel-read-0.1',
      semanticTransformId: 'group4-peel-off-readability',
      semanticTransformations: ['group4-peel-off-readability', ...commonProtect],
      meaning: 'Project the late butterfly line as a right peel-off phrase so the exit read matches the RED semantic contract.',
      touchedGroups: [4],
      protectedGroups: [1, 2, 3, 5],
      protectedRoles: ['top-right bee line', 'scoreable routes', 'no-combat grammar'],
      groupControls: [controls.g4Peel()],
      expectedMetricDeltas: { group4PeelOffReadability: 'positive', objectTrackFit: 'neutral', scoreableRoutes: 'preserve' },
      softOptimizationTargets: ['make group 4 exit side match RED exitGesture', 'preserve path-family order']
    },
    {
      candidateId: 'stage3-semantic-direct-lines-path-fit-0.1',
      semanticTransformId: 'direct-line-object-track-path-fit',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', ...commonProtect],
      meaning: 'Improve both direct-labeled teaching lines against their RED object-track/path-length targets while leaving inferred groups untouched.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Path(0.72), controls.g4Path(0.72)],
      expectedMetricDeltas: { group1ObjectTrack: 'positive', group4ObjectTrack: 'positive', strictWeakRows: 'may remain but should reduce direct-line weakness' },
      softOptimizationTargets: ['raise direct-labeled group object-track fit', 'reduce direct-line path-length ratios']
    },
    {
      candidateId: 'stage3-semantic-direct-lines-peel-read-0.1',
      semanticTransformId: 'direct-line-peel-off-readability',
      semanticTransformations: ['group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Improve both direct-labeled peel-off exit reads without projecting object-track geometry movement.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Peel(), controls.g4Peel()],
      expectedMetricDeltas: { peelOffReadability: 'positive', objectTrackFit: 'neutral', strictWeakRows: 'unchanged' },
      softOptimizationTargets: ['raise direct-line peel-off readability', 'preserve geometry baseline']
    },
    {
      candidateId: 'stage3-semantic-g1-path-peel-0.1',
      semanticTransformId: 'group1-path-fit-plus-peel',
      semanticTransformations: ['group1-object-track-path-fit', 'group1-peel-off-readability', ...commonProtect],
      meaning: 'Combine group 1 object-track/path-length compression with the RED left peel-off read.',
      touchedGroups: [1],
      protectedGroups: [2, 3, 4, 5],
      protectedRoles: ['late top-left butterfly line', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.72), controls.g1Peel())],
      expectedMetricDeltas: { group1ObjectTrack: 'positive', group1PeelOffReadability: 'positive', scoreableRoutes: 'preserve' },
      softOptimizationTargets: ['raise group 1 object-track fit', 'make group 1 exit read match RED']
    },
    {
      candidateId: 'stage3-semantic-g4-path-peel-0.1',
      semanticTransformId: 'group4-path-fit-plus-peel',
      semanticTransformations: ['group4-object-track-path-fit', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Combine group 4 object-track/path-length compression with the RED right peel-off read.',
      touchedGroups: [4],
      protectedGroups: [1, 2, 3, 5],
      protectedRoles: ['top-right bee line', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g4Path(0.72), controls.g4Peel())],
      expectedMetricDeltas: { group4ObjectTrack: 'positive', group4PeelOffReadability: 'positive', scoreableRoutes: 'preserve' },
      softOptimizationTargets: ['raise group 4 object-track fit', 'make group 4 exit read match RED']
    },
    {
      candidateId: 'stage3-semantic-direct-lines-shape-peel-0.1',
      semanticTransformId: 'direct-line-shape-plus-peel',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', 'group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Combine direct-labeled line path compression with the RED peel-off exit reads for groups 1 and 4.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.72), controls.g1Peel()), mergeGroupControl(controls.g4Path(0.72), controls.g4Peel())],
      expectedMetricDeltas: { group1ObjectTrack: 'positive', group4ObjectTrack: 'positive', directLinePeelOffReadability: 'positive' },
      softOptimizationTargets: ['best combined direct-line object-track and peel-off read', 'keep inferred group debt visible']
    },
    {
      candidateId: 'stage3-semantic-direct-lines-red-target-probe-0.1',
      semanticTransformId: 'direct-line-red-target-probe',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', ...commonProtect],
      meaning: 'Probe a stronger RED-target blend for direct-labeled path length only, to test whether object-track scoring responds predictably before any runtime expression proof.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['peel-off semantics', 'inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Path(0.92), controls.g4Path(0.92)],
      expectedMetricDeltas: { group1ObjectTrack: 'strong positive', group4ObjectTrack: 'strong positive', peelOffReadability: 'preserve baseline' },
      softOptimizationTargets: ['calibrate object-track/path-length sensitivity', 'detect whether the metric can be gamed by geometry without peel-off improvement']
    }
  ];
  const knownClasses = new Set((vocabulary.transformationClasses || []).map(row => row.classId));
  return rows.map(row => {
    const unknown = row.semanticTransformations.filter(classId => !knownClasses.has(classId));
    return buildCandidate(Object.assign({}, row, {
      description,
      baselineCandidate,
      semanticTransformations: row.semanticTransformations,
      vocabularyWarnings: unknown.map(classId => `class ${classId} is not declared in the Stage 3 vocabulary`)
    }));
  });
}

function buildFreshCandidates({ description, vocabulary, baselineReport, baselineCandidate }){
  const descriptionByIndex = byGroup(description.groups || []);
  const baselineByIndex = byGroup(baselineReport.trial.groupResults || []);
  const controls = {
    g1Path: strength => makeGroupControl({ groupIndex: 1, descriptionByIndex, baselineByIndex, transformations: ['group1-object-track-path-fit'], pathStrength: strength }),
    g4Path: strength => makeGroupControl({ groupIndex: 4, descriptionByIndex, baselineByIndex, transformations: ['group4-object-track-path-fit'], pathStrength: strength }),
    g1Peel: () => makeGroupControl({ groupIndex: 1, descriptionByIndex, baselineByIndex, transformations: ['group1-peel-off-readability'], peel: true }),
    g4Peel: () => makeGroupControl({ groupIndex: 4, descriptionByIndex, baselineByIndex, transformations: ['group4-peel-off-readability'], peel: true })
  };
  const commonProtect = ['preserve-upper-band-scoreability', 'protect-semantic-line-roles', 'protect-no-combat-scoreable-routes'];
  const proofHypothesis = (groups, controlsRead) => ({
    browserTransferProofRequired: true,
    runtimeSourceCandidateAuthorized: false,
    intendedProofGroups: groups,
    hypothesizedRuntimeControls: controlsRead,
    requiredEvidence: [
      'browser-visible path/peel movement',
      'motion-profile compatibility',
      'spacing/readability preservation',
      'scoreable-route preservation',
      'no-shot/no-attack/no-loss safety'
    ],
    read: 'This is transfer-proof-ready only if the later browser proof shows these controls are consumed and visible without guardrail regression.'
  });
  const rows = [
    {
      candidateId: 'stage3-semantic-fresh-direct-lines-balanced-shape-peel-0.1',
      semanticTransformId: 'fresh-direct-lines-balanced-shape-peel',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', 'group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Balance direct-line object-track/path-shape improvement with explicit left/right peel readability for the two reference-labeled teaching lines.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['inferred columns', 'mixed closing peel', 'upper-band score windows', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.78), controls.g1Peel()), mergeGroupControl(controls.g4Path(0.78), controls.g4Peel())],
      expectedPlayerVisibleImprovement: 'Both direct lines should read as shorter, cleaner upper-band phrases with the RED left/right peel-off exits intact.',
      expectedStrictMetricMovement: { group1ObjectTrack: 'positive', group4ObjectTrack: 'positive', pathShape: 'positive', pathLengthSanity: 'positive', peelReadability: 'positive' },
      expectedMetricDeltas: { directLineObjectTrack: 'positive', directLinePathShape: 'positive', directLinePeelOffReadability: 'positive' },
      softOptimizationTargets: ['raise both direct-line object-track fits', 'preserve upper-band score windows', 'avoid geometry-only ranking'],
      transferProofHypothesis: proofHypothesis([1, 4], ['referencePath.playbackScale', 'referencePath.pathLengthScale', 'motionSpecGroup.spawnOffsetS', 'routeCurveX', 'routeCurveY', 'path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-direct-lines-conservative-shape-peel-0.1',
      semanticTransformId: 'fresh-direct-lines-conservative-shape-peel',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', 'group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Use a conservative direct-line path blend with full peel semantics to test whether readability can lead without overfitting object-track geometry.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['inferred columns', 'mixed closing peel', 'scoreable routes', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.58), controls.g1Peel()), mergeGroupControl(controls.g4Path(0.58), controls.g4Peel())],
      expectedPlayerVisibleImprovement: 'Direct-line exit gestures should become readable while shape/timing moves only moderately toward RED.',
      expectedStrictMetricMovement: { objectTrack: 'moderate positive', pathShape: 'moderate positive', peelReadability: 'positive' },
      expectedMetricDeltas: { directLineObjectTrack: 'moderate positive', directLinePeelOffReadability: 'positive' },
      softOptimizationTargets: ['prefer readable peel over aggressive geometry', 'keep field-occupancy tension visible'],
      transferProofHypothesis: proofHypothesis([1, 4], ['referencePath.playbackScale', 'routeCurveX', 'routeCurveY', 'path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-g1-recovery-g4-peel-protect-0.1',
      semanticTransformId: 'fresh-g1-recovery-g4-peel-protect',
      semanticTransformations: ['group1-object-track-path-fit', 'group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Prioritize the weak group 1 bee-line path recovery while preserving group 4 as a readable right peel rather than re-shaping both lines.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['late butterfly line role', 'inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.88), controls.g1Peel()), controls.g4Peel()],
      expectedPlayerVisibleImprovement: 'The top-right bee line should become shorter and left-peeling while group 4 keeps its right-peel read.',
      expectedStrictMetricMovement: { group1ObjectTrack: 'strong positive', group4ObjectTrack: 'preserve', peelReadability: 'positive' },
      expectedMetricDeltas: { group1ObjectTrack: 'strong positive', group1PathLengthRatio: 'toward RED target', group4PeelOffReadability: 'positive' },
      softOptimizationTargets: ['recover the weakest direct-line path', 'avoid changing both direct-line geometries at once'],
      transferProofHypothesis: proofHypothesis([1], ['referencePath.playbackScale', 'referencePath.pathLengthScale', 'motionSpecGroup.spawnOffsetS', 'routeCurveX', 'path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-g4-anchor-g1-peel-protect-0.1',
      semanticTransformId: 'fresh-g4-anchor-g1-peel-protect',
      semanticTransformations: ['group4-object-track-path-fit', 'group4-peel-off-readability', 'group1-peel-off-readability', ...commonProtect],
      meaning: 'Anchor the late top-left butterfly line to the RED shape while only correcting the group 1 peel read.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['top-right bee line role', 'inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Peel(), mergeGroupControl(controls.g4Path(0.88), controls.g4Peel())],
      expectedPlayerVisibleImprovement: 'The late butterfly line should become the cleaner direct-line anchor while group 1 gains the correct left peel.',
      expectedStrictMetricMovement: { group4ObjectTrack: 'strong positive', group1ObjectTrack: 'preserve', peelReadability: 'positive' },
      expectedMetricDeltas: { group4ObjectTrack: 'strong positive', group4PathLengthRatio: 'toward RED target', group1PeelOffReadability: 'positive' },
      softOptimizationTargets: ['test whether group 4 can be the least-authority-conflicted proof target', 'preserve group 1 geometry'],
      transferProofHypothesis: proofHypothesis([4], ['referencePath.playbackScale', 'referencePath.pathLengthScale', 'motionSpecGroup.spawnOffsetS', 'routeCurveY', 'path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-g4-score-window-shape-peel-0.1',
      semanticTransformId: 'fresh-g4-score-window-shape-peel',
      semanticTransformations: ['group4-object-track-path-fit', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Make group 4 the smallest direct-line shape+peel proof target while protecting all other Stage 3 teaching roles.',
      touchedGroups: [4],
      protectedGroups: [1, 2, 3, 5],
      protectedRoles: ['top-right bee line', 'inferred columns', 'mixed closing peel', 'upper-band score windows', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g4Path(0.76), controls.g4Peel())],
      expectedPlayerVisibleImprovement: 'The late butterfly line should gain a clearer right peel and tighter path shape without changing the opener.',
      expectedStrictMetricMovement: { group4ObjectTrack: 'positive', group4PathShape: 'positive', group1: 'preserve' },
      expectedMetricDeltas: { group4ObjectTrack: 'positive', group4PeelOffReadability: 'positive', directLineAuthorityConflict: 'preserve' },
      softOptimizationTargets: ['smallest single-line player-visible candidate', 'avoid touching group 1 geometry'],
      transferProofHypothesis: proofHypothesis([4], ['referencePath.playbackScale', 'routeCurveY', 'path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-g1-score-window-shape-peel-0.1',
      semanticTransformId: 'fresh-g1-score-window-shape-peel',
      semanticTransformations: ['group1-object-track-path-fit', 'group1-peel-off-readability', ...commonProtect],
      meaning: 'Make group 1 the smallest direct-line shape+peel proof target while protecting the late butterfly line.',
      touchedGroups: [1],
      protectedGroups: [2, 3, 4, 5],
      protectedRoles: ['late top-left butterfly line', 'inferred columns', 'mixed closing peel', 'upper-band score windows', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.76), controls.g1Peel())],
      expectedPlayerVisibleImprovement: 'The opener should become a clearer left peel with a shorter, more target-like direct-line path.',
      expectedStrictMetricMovement: { group1ObjectTrack: 'positive', group1PathShape: 'positive', group4: 'preserve' },
      expectedMetricDeltas: { group1ObjectTrack: 'positive', group1PeelOffReadability: 'positive', directLineAuthorityConflict: 'preserve' },
      softOptimizationTargets: ['smallest opener-focused player-visible candidate', 'avoid touching group 4 geometry'],
      transferProofHypothesis: proofHypothesis([1], ['referencePath.playbackScale', 'routeCurveX', 'path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-direct-lines-path-only-sensitivity-0.1',
      semanticTransformId: 'fresh-direct-lines-path-only-sensitivity',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', ...commonProtect],
      meaning: 'Deliberately move direct-line object-track/path metrics without peel correction to confirm the calibrated ranker treats it as metric-only.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['peel-off semantics', 'inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Path(0.84), controls.g4Path(0.84)],
      expectedPlayerVisibleImprovement: 'No player-visible peel improvement is expected; this is a calibration control.',
      expectedStrictMetricMovement: { objectTrack: 'positive', pathShape: 'positive', peelReadability: 'preserve baseline' },
      expectedMetricDeltas: { directLineObjectTrack: 'positive', directLinePathShape: 'positive', peelOffReadability: 'baseline' },
      softOptimizationTargets: ['verify geometry-only lift remains metric-only', 'keep calibrated hard rule active'],
      transferProofHypothesis: proofHypothesis([1, 4], ['referencePath.playbackScale', 'referencePath.pathLengthScale'])
    },
    {
      candidateId: 'stage3-semantic-fresh-direct-lines-peel-only-sensitivity-0.1',
      semanticTransformId: 'fresh-direct-lines-peel-only-sensitivity',
      semanticTransformations: ['group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Deliberately improve direct-line peel semantics without path movement to confirm semantic-only lift is not enough.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['object-track/path-shape fit', 'inferred columns', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Peel(), controls.g4Peel()],
      expectedPlayerVisibleImprovement: 'Peel direction should read correctly, but path/object-track weakness should remain visible.',
      expectedStrictMetricMovement: { objectTrack: 'neutral', pathShape: 'neutral', peelReadability: 'positive' },
      expectedMetricDeltas: { directLinePeelOffReadability: 'positive', strictObjectTrack: 'neutral' },
      softOptimizationTargets: ['verify semantic-only lift is blocked from proof-ready status', 'keep object-track weakness visible'],
      transferProofHypothesis: proofHypothesis([1, 4], ['path endpoint / exit-side control'])
    },
    {
      candidateId: 'stage3-semantic-fresh-g1-path-only-sensitivity-0.1',
      semanticTransformId: 'fresh-g1-path-only-sensitivity',
      semanticTransformations: ['group1-object-track-path-fit', ...commonProtect],
      meaning: 'Move only group 1 path/object metrics without correcting its peel read to test metric-only classification on the weakest line.',
      touchedGroups: [1],
      protectedGroups: [2, 3, 4, 5],
      protectedRoles: ['late butterfly line', 'peel-off semantics', 'mixed closing peel', 'no-combat grammar'],
      groupControls: [controls.g1Path(0.9)],
      expectedPlayerVisibleImprovement: 'No complete player-visible lift is expected because the opener still lacks peel correction.',
      expectedStrictMetricMovement: { group1ObjectTrack: 'strong positive', group1PathShape: 'positive', peelReadability: 'preserve baseline' },
      expectedMetricDeltas: { group1ObjectTrack: 'strong positive', group1PathLengthRatio: 'toward RED target' },
      softOptimizationTargets: ['verify single-line geometry-only lift remains blocked', 'protect group 4'],
      transferProofHypothesis: proofHypothesis([1], ['referencePath.playbackScale', 'referencePath.pathLengthScale'])
    },
    {
      candidateId: 'stage3-semantic-fresh-staggered-direct-lines-shape-peel-0.1',
      semanticTransformId: 'fresh-staggered-direct-lines-shape-peel',
      semanticTransformations: ['group1-object-track-path-fit', 'group4-object-track-path-fit', 'group1-peel-off-readability', 'group4-peel-off-readability', ...commonProtect],
      meaning: 'Use asymmetric direct-line shaping: lighter group 1 compression and stronger group 4 anchoring, both with peel reads corrected.',
      touchedGroups: [1, 4],
      protectedGroups: [2, 3, 5],
      protectedRoles: ['inferred columns', 'mixed closing peel', 'scoreable routes', 'no-combat grammar'],
      groupControls: [mergeGroupControl(controls.g1Path(0.68), controls.g1Peel()), mergeGroupControl(controls.g4Path(0.82), controls.g4Peel())],
      expectedPlayerVisibleImprovement: 'The candidate should keep the opener readable while leaning on group 4 as the stronger proof anchor.',
      expectedStrictMetricMovement: { group1ObjectTrack: 'positive', group4ObjectTrack: 'positive', peelReadability: 'positive', authorityConflict: 'preserve' },
      expectedMetricDeltas: { directLineObjectTrack: 'positive', directLinePeelOffReadability: 'positive', group4PathShape: 'positive' },
      softOptimizationTargets: ['test least-authority-conflicted asymmetric proof path', 'avoid pure geometry win'],
      transferProofHypothesis: proofHypothesis([1, 4], ['referencePath.playbackScale', 'motionSpecGroup.spawnOffsetS', 'routeCurveX', 'routeCurveY', 'path endpoint / exit-side control'])
    }
  ];
  const knownClasses = new Set((vocabulary.transformationClasses || []).map(row => row.classId));
  return rows.map(row => {
    const unknown = row.semanticTransformations.filter(classId => !knownClasses.has(classId));
    return buildCandidate(Object.assign({}, row, {
      description,
      baselineCandidate,
      semanticTransformations: row.semanticTransformations,
      vocabularyWarnings: unknown.map(classId => `class ${classId} is not declared in the Stage 3 vocabulary`)
    }));
  });
}

function pathLengthSanityScore(group){
  const ratios = [group.deviations?.aggregatePathLengthRatio, group.deviations?.primaryPathLengthRatio]
    .filter(value => Number.isFinite(+value));
  if(!ratios.length) return 0;
  return round(average(ratios.map(ratio => clamp(1 - Math.abs(Math.log(Math.max(0.001, +ratio))) / Math.log(3)))), 3);
}

function componentCloseness(value, target, tolerance){
  if(!Number.isFinite(+value) || !Number.isFinite(+target)) return 0;
  return clamp(1 - Math.abs(+value - +target) / Math.max(0.0001, +tolerance));
}

function pathShapeScore(group, descriptionGroup){
  const vector = group?.candidateVector || {};
  const target = descriptionGroup?.aggregateObjectTrackTarget || {};
  if(!Object.keys(vector).length || !Object.keys(target).length) return 0;
  const xRange = componentCloseness(vector.xRange, target.xRange, Math.max(0.12, (+target.xRange || 0.6) * 0.46));
  const yRange = componentCloseness(vector.yRange, target.yRange, Math.max(0.1, (+target.yRange || 0.4) * 0.48));
  const turnCount = componentCloseness(vector.turnCount, target.turnCount || 1, 2.1);
  const reversalCount = componentCloseness(vector.reversalCount, target.reversalCount || 1, 2.2);
  const pathFamily = group?.canonicalPathFamilyMatch ? 1 : 0;
  return round(
    (0.28 * xRange)
    + (0.28 * yRange)
    + (0.17 * turnCount)
    + (0.12 * reversalCount)
    + (0.15 * pathFamily),
    3
  );
}

function averageForGroups(groupIndexes, sourceByGroup, scoreFn){
  return round(average(groupIndexes.map(groupIndex => scoreFn(sourceByGroup.get(groupIndex), groupIndex))), 3);
}

function classificationRank(row){
  const rank = {
    'player-visible-semantic-lift': 5,
    'metric-only-probe': 4,
    'semantic-only-probe': 3,
    'low-yield': 2,
    'guardrail-regression': 1
  };
  return rank[row.yield?.candidateClassification] || 0;
}

function compactCandidate({ candidate, trialReport, baselineReport, candidatePath, description }){
  const groups = trialReport.trial.groupResults || [];
  const baselineGroups = byGroup(baselineReport.trial.groupResults || []);
  const descriptionGroups = byGroup(description.groups || []);
  const focusGroups = groups.filter(group => FOCUS_GROUPS.includes(+group.groupIndex));
  const guardrails = {
    spacingReadability: trialReport.trial.spacingReadability.pass === true,
    scoreableRoutes: trialReport.trial.scoreableRoutes.pass === true,
    safety: trialReport.trial.safety.pass === true,
    noCombatGrammar: trialReport.trial.noCombatGrammar.pass === true
  };
  const groupObjectDeltas = Object.fromEntries(groups.map(group => {
    const base = baselineGroups.get(+group.groupIndex);
    return [`group${group.groupIndex}`, round((group.aggregateObjectTrackScore10 || 0) - (base?.aggregateObjectTrackScore10 || 0), 2)];
  }));
  const pathShapeByGroup = Object.fromEntries(groups.map(group => [`group${group.groupIndex}`, pathShapeScore(group, descriptionGroups.get(+group.groupIndex))]));
  const pathLengthSanityByGroup = Object.fromEntries(groups.map(group => [`group${group.groupIndex}`, pathLengthSanityScore(group)]));
  const pathLengthShapeByGroup = Object.fromEntries(groups.map(group => {
    const key = `group${group.groupIndex}`;
    return [key, round(average([pathShapeByGroup[key], pathLengthSanityByGroup[key]]), 3)];
  }));
  const directLinePathShapeFit = round(average(focusGroups.map(group => pathShapeScore(group, descriptionGroups.get(+group.groupIndex)))), 3);
  const directLinePathLengthSanity = round(average(focusGroups.map(pathLengthSanityScore)), 3);
  const combinedPathFit = round(average([directLinePathShapeFit, directLinePathLengthSanity]), 3);
  const focusObjectTrackFit = round(average(focusGroups.map(group => group.aggregateObjectTrackScore10)), 2);
  const focusObjectTrackDelta = round(average(focusGroups.map(group => groupObjectDeltas[`group${group.groupIndex}`])), 2);
  const focusPeelOffReadability = round(average(focusGroups.map(group => group.semantic?.peelOffReadability?.score)), 3);
  const semantic = trialReport.trial.semanticScores || {};
  const strictObjectTrackFit = trialReport.trial.totalObjectTrackScore10;
  const authorityConflictCount = trialReport.trial.pathFamilyOrder?.conflictCount ?? 0;
  const fieldOccupancyTensionCount = trialReport.trial.fieldOccupancyTension?.conflictCount ?? 0;
  const spacingReadabilityScore = guardrails.spacingReadability ? trialReport.trial.spacingReadability.spacingScore || 1 : 0;
  const semanticComposite = round(average([
    semantic.lineRolePreservation,
    semantic.upperBandScoreability,
    semantic.routeLearnability,
    semantic.noCombatGrammarPreservation
  ]), 3);
  const semanticValidityPass = semantic.lineRolePreservation >= (baselineReport.trial.semanticScores.lineRolePreservation - 0.01)
    && semantic.upperBandScoreability >= (baselineReport.trial.semanticScores.upperBandScoreability - 0.01)
    && semantic.routeLearnability >= (baselineReport.trial.semanticScores.routeLearnability - 0.01)
    && semantic.noCombatGrammarPreservation >= (baselineReport.trial.semanticScores.noCombatGrammarPreservation - 0.01)
    && guardrails.noCombatGrammar;
  const objectImproved = trialReport.trial.deltas.totalObjectTrackScore10 > 0.05 || focusObjectTrackDelta > 0.1;
  const baselinePathShapeFit = averageForGroups(FOCUS_GROUPS, baselineGroups, (group, groupIndex) => pathShapeScore(group, descriptionGroups.get(groupIndex)));
  const baselinePathLengthSanity = averageForGroups(FOCUS_GROUPS, baselineGroups, group => pathLengthSanityScore(group));
  const pathShapeImproved = directLinePathShapeFit > baselinePathShapeFit + 0.03;
  const pathLengthSanityImproved = directLinePathLengthSanity > baselinePathLengthSanity + 0.03;
  const pathImproved = pathShapeImproved || pathLengthSanityImproved;
  const peelImproved = focusPeelOffReadability > round(average(FOCUS_GROUPS.map(groupIndex => baselineGroups.get(groupIndex)?.semantic?.peelOffReadability?.score)), 3) + 0.03;
  const guardrailSafe = Object.values(guardrails).every(Boolean);
  const authorityStable = authorityConflictCount <= (baselineReport.trial.pathFamilyOrder?.conflictCount ?? 0);
  const fieldTensionStable = fieldOccupancyTensionCount <= (baselineReport.trial.fieldOccupancyTension?.conflictCount ?? 0);
  const geometryOnlyLift = objectImproved && pathImproved && !peelImproved;
  const playerVisibleSemanticLift = objectImproved
    && pathImproved
    && peelImproved
    && semanticValidityPass
    && guardrailSafe
    && authorityStable
    && fieldTensionStable;
  const candidateClassification = !guardrailSafe
    ? 'guardrail-regression'
    : (playerVisibleSemanticLift
      ? 'player-visible-semantic-lift'
      : (geometryOnlyLift
        ? 'metric-only-probe'
        : (peelImproved ? 'semantic-only-probe' : 'low-yield')));
  const blockerReasons = [];
  const blockerTypes = [];
  if(!semanticValidityPass) blockerReasons.push('semantic role/upper-band/no-combat validity regressed');
  if(!guardrailSafe) blockerReasons.push('hard guardrail failed');
  if(!objectImproved) blockerReasons.push('no strict object-track lift');
  if(!pathImproved) blockerReasons.push('no path-shape or path-length sanity lift');
  if(!peelImproved) blockerReasons.push('no peel-off readability lift');
  if(geometryOnlyLift) blockerReasons.push('geometry-only lift: object/path improved without player-visible peel/readability lift');
  if(strictObjectTrackFit < 5) blockerReasons.push(`strict object-track fit remains below first trial floor (${strictObjectTrackFit}/10)`);
  if(!authorityStable) blockerReasons.push('authority conflict count increased');
  if(!fieldTensionStable) blockerReasons.push('human-vs-CPU field-occupancy tension increased');
  blockerReasons.push('runtime source expression proof does not exist for these Stage 3 semantic transforms');
  if(geometryOnlyLift) blockerTypes.push('geometry-only-lift');
  if(playerVisibleSemanticLift) blockerTypes.push('player-visible-semantic-lift');
  if(strictObjectTrackFit < 5) blockerTypes.push('strict-object-track-floor');
  if(!authorityStable) blockerTypes.push('authority-conflict-regression');
  if(!fieldTensionStable) blockerTypes.push('field-occupancy-tension-regression');
  if(!guardrailSafe) blockerTypes.push('guardrail-regression');
  blockerTypes.push('runtime-expression-proof-missing');
  const trialPromising = playerVisibleSemanticLift;
  const rankingScore = round(
    (0.18 * ((focusObjectTrackFit || 0) / 10))
    + (0.16 * (directLinePathShapeFit || 0))
    + (0.15 * (directLinePathLengthSanity || 0))
    + (0.23 * (focusPeelOffReadability || 0))
    + (0.1 * (semanticComposite || 0))
    + (0.06 * (spacingReadabilityScore || 0))
    + (0.04 * (objectImproved ? 1 : 0))
    + (0.04 * (pathImproved ? 1 : 0))
    + (0.04 * (peelImproved ? 1 : 0))
    - (0.03 * Math.max(0, authorityConflictCount - (baselineReport.trial.pathFamilyOrder?.conflictCount ?? 0)))
    - (0.025 * Math.max(0, fieldOccupancyTensionCount - (baselineReport.trial.fieldOccupancyTension?.conflictCount ?? 0)))
    - (0.055 * (geometryOnlyLift ? 1 : 0)),
    4
  );
  return {
    candidateId: candidate.candidateId,
    semanticTransformId: candidate.semanticTransformId,
    semanticTransformations: candidate.semanticTransformations,
    touchedGroups: candidate.touchedGroups,
    protectedGroups: candidate.protectedGroups,
    protectedRoles: candidate.protectedRoles,
    expectedPlayerVisibleImprovement: candidate.expectedPlayerVisibleImprovement || candidate.intent?.playerFacingMeaning || candidate.intent?.read || null,
    expectedStrictMetricMovement: candidate.expectedStrictMetricMovement || candidate.expectedMetricDeltas || {},
    authorityAssumptions: candidate.authorityAssumptions,
    expectedMetricDeltas: candidate.expectedMetricDeltas,
    hardGuardrails: candidate.hardGuardrails,
    softOptimizationTargets: candidate.softOptimizationTargets,
    transferProofHypothesis: candidate.transferProofHypothesis || defaultTransferProofHypothesis(candidate.semanticTransformations || []),
    redProvenanceFieldsUsed: candidate.redProvenanceFieldsUsed,
    candidateInput: rel(candidatePath),
    scores: {
      semanticRolePreservation: semantic.lineRolePreservation,
      strictObjectTrackFit,
      strictObjectTrackDelta10: trialReport.trial.deltas.totalObjectTrackScore10,
      focusObjectTrackFit,
      focusObjectTrackDelta,
      pathShapeFit: directLinePathShapeFit,
      pathShapeFitByGroup: pathShapeByGroup,
      pathLengthSanity: directLinePathLengthSanity,
      pathLengthSanityByGroup,
      pathLengthShapeFit: combinedPathFit,
      pathLengthShapeFitByGroup: pathLengthShapeByGroup,
      peelOffReadability: semantic.peelOffReadability,
      focusPeelOffReadability,
      upperBandScoreability: semantic.upperBandScoreability,
      routeLearnability: semantic.routeLearnability,
      noCombatGrammarPreservation: semantic.noCombatGrammarPreservation,
      spacingReadability: round(spacingReadabilityScore, 3),
      authorityConflictCount,
      humanVisibleVsCpuFieldOccupancyTensionCount: fieldOccupancyTensionCount,
      groupObjectDeltas,
      rankingScore
    },
    guardrails,
    yield: {
      valid: semanticValidityPass,
      improved: objectImproved || pathImproved || peelImproved,
      objectImproved,
      pathShapeImproved,
      pathLengthSanityImproved,
      pathImproved,
      peelImproved,
      multiAxisImproved: playerVisibleSemanticLift,
      geometryOnlyLift,
      candidateClassification,
      guardrailSafe,
      trialPromising,
      sourceBlocked: true,
      blockerTypes,
      blockedReasons: blockerReasons
    },
    runtimePromotion: {
      readyForRuntimeSourceCandidate: false,
      sourceCandidateGenerationAllowed: false,
      read: 'This is a non-overwriting trial prediction only. Runtime source promotion is intentionally disabled for this cycle.'
    }
  };
}

function classYield(candidateRows, vocabulary){
  return (vocabulary.transformationClasses || []).map(spec => {
    const rows = candidateRows.filter(row => row.semanticTransformations.includes(spec.classId));
    return {
      classId: spec.classId,
      generated: rows.length,
      valid: rows.filter(row => row.yield.valid).length,
      improved: rows.filter(row => row.yield.improved).length,
      guardrailSafe: rows.filter(row => row.yield.guardrailSafe).length,
      trialPromising: rows.filter(row => row.yield.trialPromising).length,
      sourceBlocked: rows.filter(row => row.yield.sourceBlocked).length,
      blocked: rows.filter(row => !row.yield.trialPromising).length,
      bestCandidateId: rows.slice().sort((a, b) => b.scores.rankingScore - a.scores.rankingScore)[0]?.candidateId || null,
      read: rows.length
        ? `${rows.filter(row => row.yield.trialPromising).length}/${rows.length} candidate(s) using ${spec.classId} were trial-promising.`
        : `No generated candidates used ${spec.classId}.`
    };
  });
}

function blockerSummary(candidateRows){
  const counts = {};
  for(const row of candidateRows){
    for(const reason of row.yield.blockedReasons){
      counts[reason] = (counts[reason] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([reason, count]) => ({ reason, count }));
}

function blockerTaxonomy(candidateRows){
  const counts = {};
  for(const row of candidateRows){
    for(const type of row.yield.blockerTypes || []){
      counts[type] = (counts[type] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([type, count]) => ({ type, count }));
}

function sortRows(rows){
  return rows.sort((a, b) => {
    const tierDelta = classificationRank(b) - classificationRank(a);
    if(tierDelta) return tierDelta;
    return b.scores.rankingScore - a.scores.rankingScore || a.candidateId.localeCompare(b.candidateId);
  });
}

function rankingSnapshot(rows){
  return rows.map((row, index) => ({
    rank: index + 1,
    candidateId: row.candidateId,
    rankingScore: row.scores.rankingScore,
    trialPromising: row.yield.trialPromising,
    classification: row.yield.candidateClassification,
    objectTrackFit: row.scores.strictObjectTrackFit,
    pathShapeFit: row.scores.pathShapeFit,
    pathLengthSanity: row.scores.pathLengthSanity,
    peelOffReadability: row.scores.focusPeelOffReadability,
    authorityConflictCount: row.scores.authorityConflictCount,
    fieldOccupancyTensionCount: row.scores.humanVisibleVsCpuFieldOccupancyTensionCount
  }));
}

function previousRankingRows(report){
  const before = report?.rankingCalibration?.beforeRanking;
  if(Array.isArray(before) && before.length){
    return before.map(row => ({
      candidateId: row.candidateId,
      scores: { rankingScore: row.rankingScore },
      yield: {
        trialPromising: row.trialPromising,
        candidateClassification: row.classification || null
      }
    }));
  }
  return report?.candidates || [];
}

function addPreviousRanking(rows, previousReport){
  const previous = new Map(previousRankingRows(previousReport).map((row, index) => [row.candidateId, {
    rank: index + 1,
    rankingScore: row.scores?.rankingScore ?? null,
    trialPromising: row.yield?.trialPromising ?? null,
    classification: row.yield?.candidateClassification || null
  }]));
  for(const row of rows){
    const before = previous.get(row.candidateId) || {};
    row.previousRanking = {
      rank: before.rank ?? null,
      rankingScore: before.rankingScore ?? null,
      trialPromising: before.trialPromising ?? null,
      classification: before.classification
    };
  }
  return rows;
}

function focusedComparison(rows, previousReport){
  const beforeRows = previousRankingRows(previousReport);
  const after = new Map(rows.map((row, index) => [row.candidateId, Object.assign({ rank: index + 1 }, row)]));
  const before = new Map(beforeRows.map((row, index) => [row.candidateId, Object.assign({ rank: index + 1 }, row)]));
  const geometryId = 'stage3-semantic-direct-lines-red-target-probe-0.1';
  const multiAxisId = 'stage3-semantic-direct-lines-shape-peel-0.1';
  const geometryAfter = after.get(geometryId);
  const multiAfter = after.get(multiAxisId);
  return {
    geometryHeavyCandidateId: geometryId,
    multiAxisCandidateId: multiAxisId,
    before: {
      geometryHeavyRank: before.get(geometryId)?.rank ?? null,
      geometryHeavyScore: before.get(geometryId)?.scores?.rankingScore ?? null,
      geometryHeavyTrialPromising: before.get(geometryId)?.yield?.trialPromising ?? null,
      multiAxisRank: before.get(multiAxisId)?.rank ?? null,
      multiAxisScore: before.get(multiAxisId)?.scores?.rankingScore ?? null,
      multiAxisTrialPromising: before.get(multiAxisId)?.yield?.trialPromising ?? null
    },
    after: {
      geometryHeavyRank: geometryAfter?.rank ?? null,
      geometryHeavyScore: geometryAfter?.scores?.rankingScore ?? null,
      geometryHeavyTrialPromising: geometryAfter?.yield?.trialPromising ?? null,
      geometryHeavyClassification: geometryAfter?.yield?.candidateClassification ?? null,
      multiAxisRank: multiAfter?.rank ?? null,
      multiAxisScore: multiAfter?.scores?.rankingScore ?? null,
      multiAxisTrialPromising: multiAfter?.yield?.trialPromising ?? null,
      multiAxisClassification: multiAfter?.yield?.candidateClassification ?? null
    },
    whyOldWinnerRankedFirst: 'The previous model weighted focus object-track and path-length geometry enough that the RED target probe could rank first even though direct-line peel readability stayed at baseline.',
    calibratedRead: geometryAfter && multiAfter && multiAfter.rank < geometryAfter.rank
      ? 'The calibrated model places the multi-axis path+peel candidate ahead of the geometry-only probe because trial-promising status now requires object/path movement plus player-visible peel/readability lift.'
      : 'The calibrated model still does not separate geometry-only lift from player-visible semantic lift strongly enough.'
  };
}

function calibrationNote(candidateRows, baselineReport){
  const best = candidateRows[0] || null;
  const bestMultiAxis = candidateRows.find(row => row.yield.candidateClassification === 'player-visible-semantic-lift') || null;
  const semanticHighObjectWeak = candidateRows.filter(row => row.scores.semanticRolePreservation >= 0.85 && row.scores.strictObjectTrackFit < 5).length;
  const objectResponsive = candidateRows.some(row => row.yield.objectImproved);
  const peelResponsive = candidateRows.some(row => row.yield.peelImproved);
  const pathResponsive = candidateRows.some(row => row.yield.pathImproved);
  const geometryOnlyTop = !!best && best.yield.candidateClassification === 'metric-only-probe';
  const promotedMultiAxis = !!best && best.yield.candidateClassification === 'player-visible-semantic-lift';
  return {
    baselineSemanticScore: baselineReport.trial.semanticScores.overallSemanticScore,
    baselineObjectTrackScore10: baselineReport.trial.totalObjectTrackScore10,
    bestCandidateId: best?.candidateId || null,
    bestRankingScore: best?.scores.rankingScore ?? null,
    bestMultiAxisCandidateId: bestMultiAxis?.candidateId || null,
    geometryOnlyTopCandidate: geometryOnlyTop,
    semanticHighObjectWeakCount: semanticHighObjectWeak,
    objectTrackMetricResponsive: objectResponsive,
    pathLengthShapeMetricResponsive: pathResponsive,
    peelOffMetricResponsive: peelResponsive,
    predictiveEnoughForNextTrialBatch: objectResponsive && pathResponsive && peelResponsive && promotedMultiAxis,
    predictiveEnoughForRuntimeSource: false,
    read: geometryOnlyTop
      ? 'The gate is responsive, but its top rank is still geometry-heavy while a close multi-axis shape+peel candidate trails it. Tighten ranking/calibration before more generation or runtime transfer work.'
      : (promotedMultiAxis
        ? 'The calibrated gate now ranks a player-visible multi-axis path+peel candidate above the geometry-only probe. It is ready for one more small Stage 3 semantic batch, still without runtime source authorization.'
        : 'The current metrics are not predictive enough for more candidate generation; refine the RED/trial language before continuing.')
  };
}

function chooseLeastAuthorityProofCandidate(promisingRows){
  return promisingRows.slice().sort((a, b) => {
    const touchedDelta = (a.touchedGroups?.length || 99) - (b.touchedGroups?.length || 99);
    if(touchedDelta) return touchedDelta;
    const authorityDelta = (a.scores.authorityConflictCount || 0) - (b.scores.authorityConflictCount || 0);
    if(authorityDelta) return authorityDelta;
    const tensionDelta = (a.scores.humanVisibleVsCpuFieldOccupancyTensionCount || 0) - (b.scores.humanVisibleVsCpuFieldOccupancyTensionCount || 0);
    if(tensionDelta) return tensionDelta;
    return b.scores.rankingScore - a.scores.rankingScore || a.candidateId.localeCompare(b.candidateId);
  })[0] || null;
}

function yieldSummary(report){
  const candidates = report.candidates || [];
  return {
    generated: candidates.length,
    semanticallyValid: candidates.filter(row => row.yield.valid).length,
    guardrailSafe: candidates.filter(row => row.yield.guardrailSafe).length,
    geometryOnlyProbes: candidates.filter(row => row.yield.candidateClassification === 'metric-only-probe').length,
    playerVisibleSemanticLifts: candidates.filter(row => row.yield.candidateClassification === 'player-visible-semantic-lift').length,
    proofReadyCandidates: candidates.filter(row => row.yield.trialPromising).length,
    blockedCandidates: candidates.filter(row => !row.yield.trialPromising).length,
    metricOnlyTrialPromising: candidates.filter(row => row.yield.candidateClassification === 'metric-only-probe' && row.yield.trialPromising).length,
    bestCandidateId: candidates[0]?.candidateId || null,
    bestCandidateClass: candidates[0]?.yield?.candidateClassification || null,
    selectedTransferProofCandidateId: report.summary?.transferProofReadyCandidateId || report.summary?.trialPromisingCandidateId || null,
    recommendation: report.summary?.recommendation || null
  };
}

function compareYields({ generatedAt, commit, branch, regressionReport, freshReport }){
  const regression = yieldSummary(regressionReport);
  const fresh = yieldSummary(freshReport);
  const geometryRulePass = fresh.metricOnlyTrialPromising === 0
    && (freshReport.candidates || []).filter(row => row.yield.geometryOnlyLift).every(row => row.yield.candidateClassification === 'metric-only-probe' && !row.yield.trialPromising);
  const stableForTransferProof = geometryRulePass
    && fresh.proofReadyCandidates > 0
    && ['transfer-proof-ready', 'transfer-proof-tie-select-smallest'].includes(fresh.recommendation);
  return {
    schemaVersion: 1,
    artifactType: 'stage3-reference-execution-batch-yield-comparison',
    generatedAt,
    generatedBy: 'tools/harness/analyze-stage3-reference-execution-batch.js',
    commit,
    branch,
    releaseFamily: '1.4.1',
    scope: {
      stage: 3,
      challengeNumber: 1,
      displayLabel: 'Stage 3 / Challenge 1'
    },
    sourceReports: {
      regressionBaseline: rel(REGRESSION_LATEST),
      freshBatch: rel(BATCH_LATEST)
    },
    regressionBaseline: regression,
    freshBatch: fresh,
    deltas: {
      generated: fresh.generated - regression.generated,
      semanticallyValid: fresh.semanticallyValid - regression.semanticallyValid,
      guardrailSafe: fresh.guardrailSafe - regression.guardrailSafe,
      geometryOnlyProbes: fresh.geometryOnlyProbes - regression.geometryOnlyProbes,
      playerVisibleSemanticLifts: fresh.playerVisibleSemanticLifts - regression.playerVisibleSemanticLifts,
      proofReadyCandidates: fresh.proofReadyCandidates - regression.proofReadyCandidates,
      blockedCandidates: fresh.blockedCandidates - regression.blockedCandidates
    },
    calibrationVerdict: {
      geometryOnlyCandidatesRemainMetricOnly: geometryRulePass,
      candidateLanguageStableEnoughForTransferProof: stableForTransferProof,
      selectedFutureTransferProofCandidateId: fresh.selectedTransferProofCandidateId,
      runtimeSourceCandidateAuthorized: false,
      read: stableForTransferProof
        ? `Fresh out-of-sample candidates preserved the calibrated ranking rule. ${fresh.selectedTransferProofCandidateId} is recommended for a later non-overwriting browser transfer proof only.`
        : 'Fresh out-of-sample candidates did not provide a stable transfer-proof target; refine language/ranking before proof work.'
    }
  };
}

function buildComparisonMarkdown(report){
  const lines = [];
  lines.push('# Stage 3 Old-vs-New Semantic Batch Yield Comparison');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Commit: ${report.commit}`);
  lines.push('');
  lines.push('## Verdict');
  lines.push('');
  lines.push(report.calibrationVerdict.read);
  lines.push('');
  lines.push(`Selected future transfer-proof candidate: ${report.calibrationVerdict.selectedFutureTransferProofCandidateId || 'none'}`);
  lines.push('');
  lines.push(`Runtime source authorized: ${report.calibrationVerdict.runtimeSourceCandidateAuthorized}`);
  lines.push('');
  lines.push('## Yield');
  lines.push('');
  lines.push('| Metric | Prior calibrated 10 | Fresh batch | Delta |');
  lines.push('| --- | ---: | ---: | ---: |');
  for(const key of ['generated', 'semanticallyValid', 'guardrailSafe', 'geometryOnlyProbes', 'playerVisibleSemanticLifts', 'proofReadyCandidates', 'blockedCandidates']){
    lines.push(`| ${key} | ${report.regressionBaseline[key]} | ${report.freshBatch[key]} | ${report.deltas[key]} |`);
  }
  lines.push('');
  lines.push('## Calibration Rule');
  lines.push('');
  lines.push(`Geometry-only candidates remain metric-only: ${report.calibrationVerdict.geometryOnlyCandidatesRemainMetricOnly}`);
  lines.push('');
  lines.push(`Candidate language stable enough for transfer proof: ${report.calibrationVerdict.candidateLanguageStableEnoughForTransferProof}`);
  return lines.join('\n');
}

function buildMarkdown(report){
  const lines = [];
  lines.push('# Stage 3 Semantic Candidate Batch');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Commit: ${report.commit}`);
  lines.push(`Branch: ${report.branch}`);
  lines.push('');
  lines.push('## Decision');
  lines.push('');
  lines.push(`Recommendation: ${report.summary.recommendation}`);
  lines.push('');
  lines.push(`Trial-promising candidate: ${report.summary.trialPromisingCandidateId || 'none'}`);
  if(report.summary.transferProofReadyCandidateId){
    lines.push('');
    lines.push(`Transfer-proof-ready candidate: ${report.summary.transferProofReadyCandidateId}`);
  }
  lines.push('');
  lines.push(`Runtime keeper: ${report.summary.runtimeKeeperRecommendation}`);
  lines.push('');
  lines.push(report.summary.read);
  lines.push('');
  lines.push('## Ranked Candidates');
  lines.push('');
  lines.push('| Rank | Candidate | Class | Object | Path shape | Path sanity | Peel | Guardrails | Trial promising |');
  lines.push('| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |');
  report.candidates.forEach((row, index) => {
    const guardrails = Object.entries(row.guardrails).map(([key, pass]) => `${key}:${pass}`).join('<br>');
    lines.push(`| ${index + 1} | ${row.candidateId} | ${row.yield.candidateClassification} | ${row.scores.strictObjectTrackFit} | ${row.scores.pathShapeFit} | ${row.scores.pathLengthSanity} | ${row.scores.focusPeelOffReadability} | ${guardrails} | ${row.yield.trialPromising} |`);
  });
  if(report.rankingCalibration?.focusedComparison){
    const focused = report.rankingCalibration.focusedComparison;
    lines.push('');
    lines.push('## Before/After Ranking Calibration');
    lines.push('');
    lines.push('| Candidate | Before rank | Before score | After rank | After score | After class | Trial promising |');
    lines.push('| --- | ---: | ---: | ---: | ---: | --- | --- |');
    lines.push(`| ${focused.geometryHeavyCandidateId} | ${focused.before.geometryHeavyRank} | ${focused.before.geometryHeavyScore} | ${focused.after.geometryHeavyRank} | ${focused.after.geometryHeavyScore} | ${focused.after.geometryHeavyClassification} | ${focused.after.geometryHeavyTrialPromising} |`);
    lines.push(`| ${focused.multiAxisCandidateId} | ${focused.before.multiAxisRank} | ${focused.before.multiAxisScore} | ${focused.after.multiAxisRank} | ${focused.after.multiAxisScore} | ${focused.after.multiAxisClassification} | ${focused.after.multiAxisTrialPromising} |`);
    lines.push('');
    lines.push(focused.whyOldWinnerRankedFirst);
    lines.push('');
    lines.push(focused.calibratedRead);
  }
  lines.push('');
  lines.push('## Class Yield');
  lines.push('');
  lines.push('| Class | Generated | Valid | Improved | Guardrail-safe | Trial-promising | Blocked |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for(const row of report.candidateClassYield){
    lines.push(`| ${row.classId} | ${row.generated} | ${row.valid} | ${row.improved} | ${row.guardrailSafe} | ${row.trialPromising} | ${row.blocked} |`);
  }
  lines.push('');
  lines.push('## Calibration');
  lines.push('');
  lines.push(report.scoringCalibrationNote.read);
  lines.push('');
  lines.push('- Semantic-high/object-weak candidates: ' + report.scoringCalibrationNote.semanticHighObjectWeakCount);
  lines.push('- Object-track responsive: ' + report.scoringCalibrationNote.objectTrackMetricResponsive);
  lines.push('- Path-length/shape responsive: ' + report.scoringCalibrationNote.pathLengthShapeMetricResponsive);
  lines.push('- Peel-off responsive: ' + report.scoringCalibrationNote.peelOffMetricResponsive);
  lines.push('');
  lines.push('## Blocker Summary');
  lines.push('');
  lines.push(report.blockerSummary.map(row => `- ${row.count}x ${row.reason}`).join('\n') || '- none');
  if(Array.isArray(report.blockerTaxonomy)){
    lines.push('');
    lines.push('## Blocker Taxonomy');
    lines.push('');
    lines.push(report.blockerTaxonomy.map(row => `- ${row.count}x ${row.type}`).join('\n') || '- none');
  }
  return lines.join('\n');
}

function buildBatchReport({ generatedAt, calibratedAt = null, commit, branch, candidateDir, rows, vocabulary, baselineReport, previousReport = null, mode = 'generate-candidates' }){
  sortRows(rows);
  if(previousReport) addPreviousRanking(rows, previousReport);
  const promising = rows.filter(row => row.yield.trialPromising);
  const nextPromising = rows.slice(1).find(row => row.yield.trialPromising) || null;
  const clearBest = promising.length > 0
    && rows[0].yield.trialPromising
    && rows[0].yield.multiAxisImproved
    && rows[0].yield.candidateClassification === 'player-visible-semantic-lift'
    && (!nextPromising || rows[0].scores.rankingScore - nextPromising.scores.rankingScore >= 0.03);
  const freshMode = mode === 'fresh-calibrated-candidates';
  const calibration = calibrationNote(rows, baselineReport);
  const tieProofCandidate = !clearBest && freshMode && promising.length > 0 ? chooseLeastAuthorityProofCandidate(promising) : null;
  const transferProofReadyCandidate = freshMode
    ? (clearBest ? rows[0] : tieProofCandidate)
    : null;
  if(freshMode){
    calibration.predictiveEnoughForNextTrialBatch = false;
    calibration.predictiveEnoughForTransferProofSelection = !!transferProofReadyCandidate;
    calibration.read = transferProofReadyCandidate
      ? 'The fresh out-of-sample batch preserved the calibrated ranking rule: geometry-only probes stayed metric-only, player-visible multi-axis candidates ranked above them, and the language is stable enough to choose one later browser transfer-proof target.'
      : 'The fresh out-of-sample batch did not yield a stable later browser transfer-proof target; refine candidate language before proof work.';
  }
  const recommendation = freshMode
    ? (clearBest
      ? 'transfer-proof-ready'
      : (tieProofCandidate ? 'transfer-proof-tie-select-smallest' : 'metric-language-improvements-before-transfer-proof'))
    : (clearBest
      ? 'ready-for-one-more-small-stage3-semantic-batch'
      : 'metric-language-improvements-before-more-generation');
  return {
    schemaVersion: 1,
    artifactType: 'stage3-reference-execution-semantic-candidate-batch',
    generatedAt,
    calibratedAt,
    generatedBy: 'tools/harness/analyze-stage3-reference-execution-batch.js',
    candidateGenerationMode: mode,
    commit,
    branch,
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 3,
      challengeNumber: 1,
      displayLabel: 'Stage 3 / Challenge 1'
    },
    sourceArtifacts: {
      semanticVocabulary: rel(VOCABULARY),
      referenceExecutionDescription: rel(DESCRIPTION),
      baselineTrialInput: rel(DEFAULT_CANDIDATE),
      baselineTrialReport: rel(path.join(OUT_ROOT, 'latest.json'))
    },
    generatedCandidateDir: rel(candidateDir),
    candidateCount: rows.length,
    transformationClassesTested: (vocabulary.transformationClasses || []).map(row => row.classId),
    candidates: rows,
    candidateClassYield: classYield(rows, vocabulary),
    blockerSummary: blockerSummary(rows),
    blockerTaxonomy: blockerTaxonomy(rows),
    scoringCalibrationNote: calibration,
    rankingCalibration: {
      rankingModelVersion: 'stage3-player-visible-multiaxis-0.2',
      strictObjectTrackFitSeparated: true,
      pathShapeFitSeparated: true,
      pathLengthSanitySeparated: true,
      peelOffReadabilityRequiredForTrialPromising: true,
      geometryOnlyWinnersClassifiedAs: 'metric-only-probe',
      semanticScoreAloneCanAuthorizeReadiness: false,
      beforeRanking: previousReport ? rankingSnapshot(previousRankingRows(previousReport)) : [],
      afterRanking: rankingSnapshot(rows),
      focusedComparison: previousReport ? focusedComparison(rows, previousReport) : null
    },
    sourceReadyGate: {
      runtimeSourceCandidateAuthorized: false,
      sourceCandidateGenerationAllowed: false,
      requiresRuntimeExpressibilityProofBeforeSourceEdit: true,
      requiresStrictObjectTrackLift: true,
      requiresPathLengthShapeLift: true,
      requiresPeelOffReadabilityPreservationOrLift: true,
      requiresUpperBandScoreability: true,
      requiresScoreableRoutes: true,
      requiresNoCombatSafety: true,
      requiresAuthorityDebtVisibility: true,
      read: 'This batch can recommend a trial-promising candidate only; runtime source candidates are explicitly blocked in this cycle.'
    },
    summary: {
      measurementKeeperRecommendation: 'accept-semantic-batch-mechanism',
      runtimeKeeperRecommendation: 'not-a-runtime-keeper',
      recommendation,
      trialPromisingCandidateId: clearBest ? rows[0].candidateId : null,
      transferProofReadyCandidateId: transferProofReadyCandidate?.candidateId || null,
      readyForRuntimeSourceCandidate: false,
      sourceCandidateGenerationAllowed: false,
      trialPromisingCandidateCount: promising.length,
      readyForNextSmallBatch: !freshMode && clearBest,
      readyForFutureTransferProof: freshMode && !!transferProofReadyCandidate,
      read: freshMode
        ? (transferProofReadyCandidate
          ? `${transferProofReadyCandidate.candidateId} is recommended for a later non-overwriting browser transfer proof only. Runtime source remains unauthorized.`
          : 'The fresh batch did not produce a stable transfer-proof target; refine metrics or semantic language before proof work.')
        : (clearBest
          ? `${rows[0].candidateId} is trial-promising only as a calibration exemplar. Generate one more small Stage 3 semantic batch with this calibrated ranker before any transfer-proof or runtime-source work.`
          : 'The batch did not produce one clearly superior trial-promising candidate; refine metrics or semantic language before generating more variants.')
    },
    nextBestStep: freshMode
      ? (transferProofReadyCandidate
        ? `Run a later non-overwriting browser transfer proof for ${transferProofReadyCandidate.candidateId}; do not edit runtime source until browser-visible control consumption is proven.`
        : 'Refine Stage 3 candidate language/ranker before any transfer proof.')
      : (clearBest
        ? 'Generate one more small Stage 3 semantic batch using the calibrated player-visible multi-axis ranking model; do not edit runtime source.'
        : 'Refine Stage 3 RED/trial metrics so object-track, path-length shape, and peel-off readability cannot be gamed independently before generating another batch.')
  };
}

function main(){
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD']);
  const branch = git(['branch', '--show-current']);
  const description = readJson(DESCRIPTION);
  const vocabulary = readJson(VOCABULARY);
  const baselineCandidate = readJson(DEFAULT_CANDIDATE);
  const baselineReport = buildReport(DEFAULT_CANDIDATE);

  if(argFlag('reuse-existing-candidates')){
    const previousReport = readJson(BATCH_LATEST);
    const comparisonReport = committedLatestBatchReport() || previousReport;
    const calibrationDir = path.join(OUT_ROOT, 'ranking-calibrations', `${generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}`);
    const rows = [];
    for(const previous of previousReport.candidates || []){
      const candidatePath = path.join(ROOT, previous.candidateInput || '');
      const candidate = readJson(candidatePath);
      const trialReport = buildReport(candidatePath);
      rows.push(compactCandidate({ candidate, trialReport, baselineReport, candidatePath, description }));
    }
    const report = buildBatchReport({
      generatedAt: previousReport.generatedAt || generatedAt,
      calibratedAt: generatedAt,
      commit,
      branch,
      candidateDir: path.join(ROOT, previousReport.generatedCandidateDir || ''),
      rows,
      vocabulary,
      baselineReport,
      previousReport: comparisonReport,
      mode: 'reuse-existing-candidates'
    });
    writeJson(path.join(calibrationDir, 'report.json'), report);
    writeText(path.join(calibrationDir, 'README.md'), buildMarkdown(report));
    writeJson(CALIBRATION_LATEST, report);
    writeText(CALIBRATION_MARKDOWN, buildMarkdown(report));
    writeJson(BATCH_LATEST, report);
    writeText(BATCH_MARKDOWN, buildMarkdown(report));
    console.log(JSON.stringify({
      ok: true,
      report: rel(BATCH_LATEST),
      calibrationReport: rel(CALIBRATION_LATEST),
      candidateCount: report.candidateCount,
      recommendation: report.summary.recommendation,
      trialPromisingCandidateId: report.summary.trialPromisingCandidateId,
      bestCandidateId: report.candidates[0]?.candidateId || null,
      bestRankingScore: report.candidates[0]?.scores.rankingScore ?? null,
      candidateGenerationMode: report.candidateGenerationMode
    }, null, 2));
    return;
  }

  if(argFlag('fresh-calibrated-candidates')){
    const regressionSource = committedLatestBatchReport() || readJson(BATCH_LATEST);
    const regressionDir = path.join(OUT_ROOT, 'regression-baselines', `${generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}`);
    const freshBatchDir = path.join(OUT_ROOT, 'semantic-batches', `${generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}-fresh`);
    const freshCandidateDir = path.join(freshBatchDir, 'candidates');
    ensureDir(freshCandidateDir);

    const regressionRows = [];
    for(const previous of regressionSource.candidates || []){
      const candidatePath = path.join(ROOT, previous.candidateInput || '');
      const candidate = readJson(candidatePath);
      const trialReport = buildReport(candidatePath);
      regressionRows.push(compactCandidate({ candidate, trialReport, baselineReport, candidatePath, description }));
    }
    const regressionReport = buildBatchReport({
      generatedAt: regressionSource.generatedAt || generatedAt,
      calibratedAt: generatedAt,
      commit,
      branch,
      candidateDir: path.join(ROOT, regressionSource.generatedCandidateDir || ''),
      rows: regressionRows,
      vocabulary,
      baselineReport,
      previousReport: regressionSource,
      mode: 'regression-baseline-existing-candidates'
    });
    writeJson(path.join(regressionDir, 'report.json'), regressionReport);
    writeText(path.join(regressionDir, 'README.md'), buildMarkdown(regressionReport));
    writeJson(REGRESSION_LATEST, regressionReport);
    writeText(REGRESSION_MARKDOWN, buildMarkdown(regressionReport));

    const freshCandidates = buildFreshCandidates({ description, vocabulary, baselineReport, baselineCandidate });
    const freshRows = [];
    for(const candidate of freshCandidates){
      const candidatePath = path.join(freshCandidateDir, `${candidate.candidateId}.json`);
      writeJson(candidatePath, candidate);
      const trialReport = buildReport(candidatePath);
      freshRows.push(compactCandidate({ candidate, trialReport, baselineReport, candidatePath, description }));
    }
    const freshReport = buildBatchReport({
      generatedAt,
      commit,
      branch,
      candidateDir: freshCandidateDir,
      rows: freshRows,
      vocabulary,
      baselineReport,
      mode: 'fresh-calibrated-candidates'
    });
    freshReport.sourceArtifacts.regressionBaselineReport = rel(REGRESSION_LATEST);
    writeJson(path.join(freshBatchDir, 'report.json'), freshReport);
    writeText(path.join(freshBatchDir, 'README.md'), buildMarkdown(freshReport));
    writeJson(BATCH_LATEST, freshReport);
    writeText(BATCH_MARKDOWN, buildMarkdown(freshReport));

    const comparisonReport = compareYields({ generatedAt, commit, branch, regressionReport, freshReport });
    writeJson(path.join(freshBatchDir, 'yield-comparison.json'), comparisonReport);
    writeText(path.join(freshBatchDir, 'yield-comparison.md'), buildComparisonMarkdown(comparisonReport));
    writeJson(COMPARISON_LATEST, comparisonReport);
    writeText(COMPARISON_MARKDOWN, buildComparisonMarkdown(comparisonReport));

    console.log(JSON.stringify({
      ok: true,
      report: rel(BATCH_LATEST),
      regressionReport: rel(REGRESSION_LATEST),
      comparisonReport: rel(COMPARISON_LATEST),
      candidateCount: freshReport.candidateCount,
      recommendation: freshReport.summary.recommendation,
      transferProofReadyCandidateId: freshReport.summary.transferProofReadyCandidateId,
      bestCandidateId: freshReport.candidates[0]?.candidateId || null,
      bestRankingScore: freshReport.candidates[0]?.scores.rankingScore ?? null,
      geometryOnlyCandidatesRemainMetricOnly: comparisonReport.calibrationVerdict.geometryOnlyCandidatesRemainMetricOnly,
      candidateGenerationMode: freshReport.candidateGenerationMode
    }, null, 2));
    return;
  }

  const batchDir = path.join(OUT_ROOT, 'semantic-batches', `${generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}`);
  const candidateDir = path.join(batchDir, 'candidates');
  ensureDir(candidateDir);
  const candidates = buildCandidates({ description, vocabulary, baselineReport, baselineCandidate });
  const rows = [];
  for(const candidate of candidates){
    const candidatePath = path.join(candidateDir, `${candidate.candidateId}.json`);
    writeJson(candidatePath, candidate);
    const trialReport = buildReport(candidatePath);
    rows.push(compactCandidate({ candidate, trialReport, baselineReport, candidatePath, description }));
  }
  const report = buildBatchReport({
    generatedAt,
    commit,
    branch,
    candidateDir,
    rows,
    vocabulary,
    baselineReport
  });
  writeJson(path.join(batchDir, 'report.json'), report);
  writeText(path.join(batchDir, 'README.md'), buildMarkdown(report));
  writeJson(BATCH_LATEST, report);
  writeText(BATCH_MARKDOWN, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(BATCH_LATEST),
    candidateCount: report.candidateCount,
    recommendation: report.summary.recommendation,
    trialPromisingCandidateId: report.summary.trialPromisingCandidateId,
    bestCandidateId: report.candidates[0]?.candidateId || null,
    bestRankingScore: report.candidates[0]?.scores.rankingScore ?? null
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
}

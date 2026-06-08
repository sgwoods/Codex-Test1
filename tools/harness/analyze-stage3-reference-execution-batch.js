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

function buildCandidate({ candidateId, semanticTransformId, semanticTransformations, meaning, touchedGroups, protectedGroups, protectedRoles, groupControls, description, baselineCandidate, expectedMetricDeltas, softOptimizationTargets }){
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
    authorityAssumptions: {
      pathFamilyAuthority: 'preserve current RED canonical path-family order for non-overwriting comparison',
      runtimePromotionAuthority: 'not-authorized',
      targetConformanceDebtCarriedForward: true,
      fieldOccupancyPolicy: 'human-visible upper-band scoreability and CPU lower-field geometry remain separate reads'
    },
    expectedMetricDeltas,
    hardGuardrails: HARD_GUARDRAILS,
    softOptimizationTargets,
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

function pathLengthShapeScore(group){
  const ratios = [group.deviations?.aggregatePathLengthRatio, group.deviations?.primaryPathLengthRatio]
    .filter(value => Number.isFinite(+value));
  if(!ratios.length) return 0;
  return round(average(ratios.map(ratio => clamp(1 - Math.abs(Math.log(Math.max(0.001, +ratio))) / Math.log(3)))), 3);
}

function compactCandidate({ candidate, trialReport, baselineReport, candidatePath }){
  const groups = trialReport.trial.groupResults || [];
  const baselineGroups = byGroup(baselineReport.trial.groupResults || []);
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
  const pathShapeByGroup = Object.fromEntries(groups.map(group => [`group${group.groupIndex}`, pathLengthShapeScore(group)]));
  const directLinePathShapeFit = round(average(focusGroups.map(pathLengthShapeScore)), 3);
  const focusObjectTrackFit = round(average(focusGroups.map(group => group.aggregateObjectTrackScore10)), 2);
  const focusObjectTrackDelta = round(average(focusGroups.map(group => groupObjectDeltas[`group${group.groupIndex}`])), 2);
  const focusPeelOffReadability = round(average(focusGroups.map(group => group.semantic?.peelOffReadability?.score)), 3);
  const semantic = trialReport.trial.semanticScores || {};
  const strictObjectTrackFit = trialReport.trial.totalObjectTrackScore10;
  const authorityConflictCount = trialReport.trial.pathFamilyOrder?.conflictCount ?? 0;
  const fieldOccupancyTensionCount = trialReport.trial.fieldOccupancyTension?.conflictCount ?? 0;
  const semanticValidityPass = semantic.lineRolePreservation >= (baselineReport.trial.semanticScores.lineRolePreservation - 0.01)
    && semantic.upperBandScoreability >= (baselineReport.trial.semanticScores.upperBandScoreability - 0.01)
    && guardrails.noCombatGrammar;
  const objectImproved = trialReport.trial.deltas.totalObjectTrackScore10 > 0.05 || focusObjectTrackDelta > 0.1;
  const pathImproved = directLinePathShapeFit > round(average(FOCUS_GROUPS.map(groupIndex => pathLengthShapeScore(baselineGroups.get(groupIndex)))), 3) + 0.03;
  const peelImproved = focusPeelOffReadability > round(average(FOCUS_GROUPS.map(groupIndex => baselineGroups.get(groupIndex)?.semantic?.peelOffReadability?.score)), 3) + 0.03;
  const guardrailSafe = Object.values(guardrails).every(Boolean);
  const blockerReasons = [];
  if(!semanticValidityPass) blockerReasons.push('semantic role/upper-band/no-combat validity regressed');
  if(!guardrailSafe) blockerReasons.push('hard guardrail failed');
  if(!objectImproved) blockerReasons.push('no strict object-track lift');
  if(strictObjectTrackFit < 5) blockerReasons.push(`strict object-track fit remains below first trial floor (${strictObjectTrackFit}/10)`);
  if(authorityConflictCount > (baselineReport.trial.pathFamilyOrder?.conflictCount ?? 0)) blockerReasons.push('authority conflict count increased');
  if(fieldOccupancyTensionCount > (baselineReport.trial.fieldOccupancyTension?.conflictCount ?? 0)) blockerReasons.push('human-vs-CPU field-occupancy tension increased');
  blockerReasons.push('runtime source expression proof does not exist for these Stage 3 semantic transforms');
  const trialPromising = semanticValidityPass
    && guardrailSafe
    && objectImproved
    && pathImproved
    && authorityConflictCount <= (baselineReport.trial.pathFamilyOrder?.conflictCount ?? 0)
    && fieldOccupancyTensionCount <= (baselineReport.trial.fieldOccupancyTension?.conflictCount ?? 0);
  const rankingScore = round(
    (0.25 * ((focusObjectTrackFit || 0) / 10))
    + (0.24 * (directLinePathShapeFit || 0))
    + (0.18 * (focusPeelOffReadability || 0))
    + (0.12 * (semantic.upperBandScoreability || 0))
    + (0.08 * (semantic.routeLearnability || 0))
    + (0.06 * (semantic.lineRolePreservation || 0))
    + (0.04 * (guardrailSafe ? 1 : 0))
    + (0.03 * (objectImproved ? 1 : 0))
    - (0.015 * Math.max(0, authorityConflictCount - (baselineReport.trial.pathFamilyOrder?.conflictCount ?? 0)))
    - (0.01 * Math.max(0, fieldOccupancyTensionCount - (baselineReport.trial.fieldOccupancyTension?.conflictCount ?? 0))),
    4
  );
  return {
    candidateId: candidate.candidateId,
    semanticTransformId: candidate.semanticTransformId,
    semanticTransformations: candidate.semanticTransformations,
    touchedGroups: candidate.touchedGroups,
    protectedGroups: candidate.protectedGroups,
    protectedRoles: candidate.protectedRoles,
    authorityAssumptions: candidate.authorityAssumptions,
    expectedMetricDeltas: candidate.expectedMetricDeltas,
    hardGuardrails: candidate.hardGuardrails,
    softOptimizationTargets: candidate.softOptimizationTargets,
    redProvenanceFieldsUsed: candidate.redProvenanceFieldsUsed,
    candidateInput: rel(candidatePath),
    scores: {
      semanticRolePreservation: semantic.lineRolePreservation,
      strictObjectTrackFit,
      strictObjectTrackDelta10: trialReport.trial.deltas.totalObjectTrackScore10,
      focusObjectTrackFit,
      focusObjectTrackDelta,
      pathLengthShapeFit: directLinePathShapeFit,
      pathLengthShapeFitByGroup: pathShapeByGroup,
      peelOffReadability: semantic.peelOffReadability,
      focusPeelOffReadability,
      upperBandScoreability: semantic.upperBandScoreability,
      routeLearnability: semantic.routeLearnability,
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
      pathImproved,
      peelImproved,
      multiAxisImproved: objectImproved && pathImproved && peelImproved,
      guardrailSafe,
      trialPromising,
      sourceBlocked: true,
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

function calibrationNote(candidateRows, baselineReport){
  const best = candidateRows[0] || null;
  const bestMultiAxis = candidateRows.find(row => row.yield.multiAxisImproved && row.yield.guardrailSafe && row.yield.valid) || null;
  const semanticHighObjectWeak = candidateRows.filter(row => row.scores.semanticRolePreservation >= 0.85 && row.scores.strictObjectTrackFit < 5).length;
  const objectResponsive = candidateRows.some(row => row.yield.objectImproved);
  const peelResponsive = candidateRows.some(row => row.yield.peelImproved);
  const pathResponsive = candidateRows.some(row => row.yield.pathImproved);
  const geometryOnlyTop = !!best && best.yield.objectImproved && best.yield.pathImproved && !best.yield.peelImproved;
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
    predictiveEnoughForNextTrialBatch: objectResponsive && pathResponsive && peelResponsive && !geometryOnlyTop,
    predictiveEnoughForRuntimeSource: false,
    read: geometryOnlyTop
      ? 'The gate is responsive, but its top rank is still geometry-heavy while a close multi-axis shape+peel candidate trails it. Tighten ranking/calibration before more generation or runtime transfer work.'
      : (objectResponsive && pathResponsive && peelResponsive
        ? 'The gate can distinguish semantic-preserving object/path/peel candidates, but it remains a trial predictor only because runtime expressibility is unproven.'
        : 'The current metrics are not predictive enough for more candidate generation; refine the RED/trial language before continuing.')
  };
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
  lines.push('');
  lines.push(`Runtime keeper: ${report.summary.runtimeKeeperRecommendation}`);
  lines.push('');
  lines.push(report.summary.read);
  lines.push('');
  lines.push('## Ranked Candidates');
  lines.push('');
  lines.push('| Rank | Candidate | Transforms | Object | Focus object | Path/shape | Peel | Guardrails | Trial promising |');
  lines.push('| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |');
  report.candidates.forEach((row, index) => {
    const guardrails = Object.entries(row.guardrails).map(([key, pass]) => `${key}:${pass}`).join('<br>');
    lines.push(`| ${index + 1} | ${row.candidateId} | ${row.semanticTransformations.join('<br>')} | ${row.scores.strictObjectTrackFit} | ${row.scores.focusObjectTrackFit} | ${row.scores.pathLengthShapeFit} | ${row.scores.focusPeelOffReadability} | ${guardrails} | ${row.yield.trialPromising} |`);
  });
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
  return lines.join('\n');
}

function main(){
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD']);
  const batchDir = path.join(OUT_ROOT, 'semantic-batches', `${generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}`);
  const candidateDir = path.join(batchDir, 'candidates');
  ensureDir(candidateDir);
  const description = readJson(DESCRIPTION);
  const vocabulary = readJson(VOCABULARY);
  const baselineCandidate = readJson(DEFAULT_CANDIDATE);
  const baselineReport = buildReport(DEFAULT_CANDIDATE);
  const candidates = buildCandidates({ description, vocabulary, baselineReport, baselineCandidate });
  const rows = [];
  for(const candidate of candidates){
    const candidatePath = path.join(candidateDir, `${candidate.candidateId}.json`);
    writeJson(candidatePath, candidate);
    const trialReport = buildReport(candidatePath);
    rows.push(compactCandidate({ candidate, trialReport, baselineReport, candidatePath }));
  }
  rows.sort((a, b) => b.scores.rankingScore - a.scores.rankingScore || a.candidateId.localeCompare(b.candidateId));
  const promising = rows.filter(row => row.yield.trialPromising);
  const clearBest = promising.length > 0
    && rows[0].yield.trialPromising
    && rows[0].yield.multiAxisImproved
    && (rows.length === 1 || rows[0].scores.rankingScore - rows[1].scores.rankingScore >= 0.03);
  const calibration = calibrationNote(rows, baselineReport);
  const report = {
    schemaVersion: 1,
    artifactType: 'stage3-reference-execution-semantic-candidate-batch',
    generatedAt,
    generatedBy: 'tools/harness/analyze-stage3-reference-execution-batch.js',
    commit,
    branch: git(['branch', '--show-current']),
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
    scoringCalibrationNote: calibration,
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
      recommendation: clearBest ? 'one-trial-promising-candidate' : 'metric-language-improvements-before-more-generation',
      trialPromisingCandidateId: clearBest ? rows[0].candidateId : null,
      readyForRuntimeSourceCandidate: false,
      sourceCandidateGenerationAllowed: false,
      trialPromisingCandidateCount: promising.length,
      read: clearBest
        ? `${rows[0].candidateId} is trial-promising only. It should not become a runtime source candidate until a transfer proof maps the named transforms into consumed runtime controls and browser-visible evidence.`
        : 'The batch did not produce one clearly superior trial-promising candidate; refine metrics or semantic language before generating more variants.'
    },
    nextBestStep: clearBest
      ? `Build a focused Stage 3 transfer-proof harness for ${rows[0].candidateId}; do not edit runtime source until the transform maps cleanly to consumed controls and browser-visible evidence.`
      : 'Refine Stage 3 RED/trial metrics so object-track, path-length shape, and peel-off readability cannot be gamed independently before generating another batch.'
  };
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

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
} = require('./analyze-stage7-reference-execution-trial.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage7-challenge2-0.1.json');
const VOCABULARY = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', 'stage7-semantic-vocabulary-0.1.json');
const BATCH_LATEST = path.join(OUT_ROOT, 'latest-batch.json');
const TARGET_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-target-contracts', 'aurora-challenge-contracts-0.1.json');
const SETPIECE_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-setpiece-contracts', 'latest.json');
const AURORA_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');
const MOTION_PROFILE_CHECK = path.join(ROOT, 'tools', 'harness', 'check-challenge-motion-profile.js');
const FOCUS_GROUPS = [1, 4, 5];

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

function mapByGroup(rows){
  return new Map((rows || []).map(row => [+row.groupIndex, row]));
}

function knownClassSet(vocabulary){
  return new Set((vocabulary.transformationClasses || []).map(row => row.classId));
}

function classSpec(vocabulary, classId){
  return (vocabulary.transformationClasses || []).find(row => row.classId === classId) || {};
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

function descriptionCanonicalOrder(description){
  return (description.groups || []).map(group => group.canonicalComparisonPathFamily || '');
}

function candidateProjectedOrder(candidate, liveBaselineOrder){
  const order = liveBaselineOrder.slice();
  for(const group of candidate.groups || []){
    const index = (+group.groupIndex || 0) - 1;
    if(index >= 0 && group.pathFamily) order[index] = group.pathFamily;
  }
  return order;
}

function buildTruthAlignment(description){
  const runtimeOrders = stage7RuntimeOrders();
  const motionOrder = motionProfileOrder();
  const targetOrder = targetContractOrder();
  const setpiece = setpieceOrder();
  const red = descriptionCanonicalOrder(description);
  const sources = [
    {
      sourceId: 'reference-execution-description',
      role: 'measured-reference-intent',
      order: red,
      path: rel(DESCRIPTION),
      read: 'Reference Execution Description canonicalComparisonPathFamily order used by semantic trials.'
    },
    {
      sourceId: 'challenge-setpiece-contracts',
      role: 'measured-reference-intent',
      order: setpiece,
      path: rel(SETPIECE_CONTRACTS),
      read: 'Measured setpiece contract order generated from challenge motion/spec evidence.'
    },
    {
      sourceId: 'challenge-stage-target-contracts',
      role: 'live-promotion-gate',
      order: targetOrder,
      path: rel(TARGET_CONTRACTS),
      read: 'Current target-contract artifact consumed by strict challenge-stage conformance.'
    },
    {
      sourceId: 'challenge-motion-profile-check',
      role: 'live-promotion-gate',
      order: motionOrder,
      path: rel(MOTION_PROFILE_CHECK),
      read: 'Current hard gate for challenge motion/profile path-order drift.'
    },
    {
      sourceId: 'runtime-layout',
      role: 'live-runtime-source',
      order: runtimeOrders.runtimeLayout,
      path: rel(AURORA_PACK),
      read: 'Stage 7 layout groupPathFamilies in the Aurora runtime source.'
    },
    {
      sourceId: 'runtime-motion-spec',
      role: 'live-runtime-source',
      order: runtimeOrders.runtimeMotionSpec,
      path: rel(AURORA_PACK),
      read: 'Stage 7 motionSpecGroups pathFamilyHint values consumed first by spawnChallenge.'
    },
    {
      sourceId: 'runtime-contract-groups',
      role: 'live-runtime-source',
      order: runtimeOrders.runtimeContract,
      path: rel(AURORA_PACK),
      read: 'Stage 7 runtime contract group pathFamily declarations exposed to harnesses.'
    }
  ];
  const liveGateOrder = motionOrder.length ? motionOrder : targetOrder;
  const liveGateSources = sources.filter(source => ['live-promotion-gate', 'live-runtime-source'].includes(source.role));
  const liveGateAlignmentPass = liveGateSources.every(source => sameOrder(source.order, liveGateOrder));
  const measuredIntentPass = sameOrder(red, setpiece);
  const measuredIntentMatchesLiveGate = sameOrder(red, liveGateOrder);
  const mismatches = [];
  for(const source of sources){
    if(!sameOrder(source.order, liveGateOrder)){
      mismatches.push({
        sourceId: source.sourceId,
        role: source.role,
        order: source.order,
        liveGateOrder,
        read: `${source.sourceId} path-family order differs from the current live promotion gate order.`
      });
    }
  }
  return {
    stage: 7,
    challengeNumber: 2,
    liveGateCanonicalOrder: liveGateOrder,
    measuredIntentOrder: red,
    sources,
    liveGateAlignmentPass,
    measuredIntentPass,
    measuredIntentMatchesLiveGate,
    candidateGatePolicy: 'A semantic candidate is source-ready only when its projected full path-family order matches all live promotion gates and its movement transforms map to consumed runtime fields.',
    canonicalForRuntimeCandidateGates: 'Current live runtime-candidate gates are the restored runtime source, challenge-stage target-contract artifact, and check-challenge-motion-profile expected order. The Reference Execution Description and challenge-setpiece contract are measured reference intent, but they are not sufficient to pass live promotion until the gate authority is explicitly reconciled.',
    mismatches,
    staleOrDiagnosticRead: measuredIntentMatchesLiveGate
      ? 'Measured reference intent and live promotion gates agree for Stage 7 path-family order.'
      : 'Measured reference intent disagrees with the restored live gate order. Treat this as an unresolved source-of-truth conflict; do not update old gates merely to pass the rejected candidate.'
  };
}

function baselineVector(baselineByGroup, groupIndex){
  return Object.assign({}, baselineByGroup.get(+groupIndex)?.candidateVector || {});
}

function descriptionByGroup(description){
  return new Map((description.groups || []).map(group => [+group.groupIndex, group]));
}

function templateCandidate({ candidateId, classes, vocabulary, targetGroups, meaning, expectedMetricMovement, generatedLowLevelControls, why, groups }){
  const control = readJson(DEFAULT_CANDIDATE);
  const specs = classes.map(classId => classSpec(vocabulary, classId));
  return {
    schemaVersion: 1,
    artifactType: 'stage7-reference-execution-candidate-trial-input',
    generatedBy: 'tools/harness/analyze-stage7-reference-execution-batch.js',
    candidateId,
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 7,
      challengeNumber: 2,
      displayLabel: 'Stage 7 / Challenge 2'
    },
    semanticTransformationClass: classes.length === 1 ? classes[0] : 'semantic-composition',
    semanticTransformations: classes,
    intendedPlayerFacingMeaning: meaning,
    targetGroups,
    invariantsPreserved: Array.from(new Set(specs.flatMap(spec => spec.invariants || []))).sort(),
    expectedMetricMovement,
    generatedLowLevelControls,
    whyMoreLikelyThanBlindTuning: why,
    intent: {
      kind: classes.length === 1 ? classes[0] : 'semantic-composition',
      read: meaning
    },
    groups,
    guardrails: control.guardrails,
    gates: control.gates
  };
}

function canonicalFamilyGroups(description){
  return (description.groups || [])
    .filter(group => group.semanticPathFamily !== group.canonicalComparisonPathFamily)
    .map(group => ({
      groupIndex: group.groupIndex,
      pathFamily: group.canonicalComparisonPathFamily,
      semanticReason: 'canonical-family-alignment',
      generatedLowLevelControls: {
        source: 'canonicalComparisonPathFamily',
        value: group.canonicalComparisonPathFamily
      }
    }));
}

function group1CompressionGroup(description, baselineByGroup){
  const group = descriptionByGroup(description).get(1);
  const baseline = baselineVector(baselineByGroup, 1);
  const gate = group.candidateComparisonGate || {};
  const target = group.aggregateObjectTrackTarget || {};
  const maxRatio = Number.isFinite(+gate.maxAggregatePathLengthRatio) ? +gate.maxAggregatePathLengthRatio : 3;
  const generatedPathLength = round(Math.min(+baseline.pathLength || 0, (+target.pathLength || 0) * maxRatio), 4);
  return {
    groupIndex: 1,
    pathFamily: group.canonicalComparisonPathFamily,
    controls: {
      pathLength: generatedPathLength
    },
    semanticReason: 'group1-path-length-compression',
    generatedLowLevelControls: {
      pathLengthFormula: 'min(baseline.pathLength, aggregateTarget.pathLength * maxAggregatePathLengthRatio)',
      baselinePathLength: round(baseline.pathLength, 4),
      aggregateTargetPathLength: round(target.pathLength, 4),
      maxAggregatePathLengthRatio: maxRatio,
      generatedPathLength
    }
  };
}

function lowerFieldReductionGroups(description, baselineByGroup){
  const byGroup = descriptionByGroup(description);
  const rows = [];
  for(const [groupIndex, group] of byGroup.entries()){
    const baseline = baselineVector(baselineByGroup, groupIndex);
    const target = group.aggregateObjectTrackTarget || {};
    const gate = group.candidateComparisonGate || {};
    const upper = Array.isArray(gate.lowerFieldDeltaRange) && Number.isFinite(+gate.lowerFieldDeltaRange[1])
      ? +gate.lowerFieldDeltaRange[1]
      : 0.18;
    const currentDelta = Number.isFinite(+baseline.lowerFieldShare) && Number.isFinite(+target.lowerFieldShare)
      ? +baseline.lowerFieldShare - +target.lowerFieldShare
      : 0;
    if(currentDelta <= upper) continue;
    const generatedDelta = round(Math.max(0, upper - 0.04), 3);
    rows.push({
      groupIndex,
      pathFamily: group.canonicalComparisonPathFamily,
      lowerField: {
        lowerFieldDeltaFromAggregate: generatedDelta
      },
      semanticReason: 'lower-field-overstay-reduction',
      generatedLowLevelControls: {
        lowerFieldFormula: 'aggregateTarget.lowerFieldShare + (lowerFieldGateUpper - 0.04)',
        baselineLowerFieldShare: round(baseline.lowerFieldShare, 4),
        aggregateTargetLowerFieldShare: round(target.lowerFieldShare, 4),
        baselineDelta: round(currentDelta, 3),
        generatedDelta
      }
    });
  }
  return rows;
}

function phaseRebalanceGroups(description, baselineByGroup){
  return (description.groups || []).filter(group => {
    const baseline = baselineVector(baselineByGroup, group.groupIndex);
    const target = group.aggregateObjectTrackTarget || {};
    const startDelta = Math.abs((+baseline.visibleStartS || 0) - (+target.visibleStartS || 0));
    const endDelta = Math.abs((+baseline.visibleEndS || 0) - (+target.visibleEndS || 0));
    return startDelta > 0.25 || endDelta > 0.25;
  }).map(group => {
    const target = group.aggregateObjectTrackTarget || {};
    return {
      groupIndex: group.groupIndex,
      pathFamily: group.canonicalComparisonPathFamily,
      timing: {
        visibleStartS: round(target.visibleStartS, 2),
        visibleEndS: round(target.visibleEndS, 2)
      },
      semanticReason: 'phase-duration-rebalance',
      generatedLowLevelControls: {
        visibleWindowFormula: 'aggregateObjectTrackTarget.visibleStartS/visibleEndS',
        visibleStartS: round(target.visibleStartS, 2),
        visibleEndS: round(target.visibleEndS, 2)
      }
    };
  });
}

function protectLateGroups(description, baselineByGroup, canonical = false){
  const byGroup = descriptionByGroup(description);
  return [4, 5].map(groupIndex => {
    const group = byGroup.get(groupIndex);
    const vector = baselineVector(baselineByGroup, groupIndex);
    if(canonical) vector.pathFamily = group.canonicalComparisonPathFamily;
    return {
      groupIndex,
      pathFamily: canonical ? group.canonicalComparisonPathFamily : vector.pathFamily,
      predictedRuntimeVector: vector,
      semanticReason: 'protect-group4-group5',
      generatedLowLevelControls: {
        protectionFormula: canonical
          ? 'baseline vector with canonicalComparisonPathFamily only'
          : 'baseline vector preserved exactly',
        baselineAggregateScoreFloor: baselineByGroup.get(groupIndex)?.aggregateObjectTrackScore10,
        baselinePathFamily: baselineByGroup.get(groupIndex)?.candidatePathFamily,
        canonicalPathFamily: group.canonicalComparisonPathFamily
      }
    };
  });
}

function mergeGroups(...groupLists){
  const byGroup = new Map();
  for(const row of groupLists.flat()){
    if(!row) continue;
    const prior = byGroup.get(+row.groupIndex) || {};
    byGroup.set(+row.groupIndex, Object.assign({}, prior, row, {
      controls: Object.assign({}, prior.controls || {}, row.controls || {}),
      timing: Object.assign({}, prior.timing || {}, row.timing || {}),
      lowerField: Object.assign({}, prior.lowerField || {}, row.lowerField || {}),
      generatedLowLevelControls: Object.assign({}, prior.generatedLowLevelControls || {}, row.generatedLowLevelControls || {})
    }));
  }
  return Array.from(byGroup.values()).sort((a, b) => +a.groupIndex - +b.groupIndex);
}

function buildCandidates({ description, vocabulary, baselineReport }){
  const baselineByGroup = mapByGroup(baselineReport.trial.groupResults);
  const canonicalGroups = canonicalFamilyGroups(description);
  const group1 = group1CompressionGroup(description, baselineByGroup);
  const lowerGroups = lowerFieldReductionGroups(description, baselineByGroup);
  const phaseGroups = phaseRebalanceGroups(description, baselineByGroup);
  const lateProtection = protectLateGroups(description, baselineByGroup, false);
  const lateCanonicalProtection = protectLateGroups(description, baselineByGroup, true);
  return [
    templateCandidate({
      candidateId: 'stage7-semantic-canonical-family-alignment-0.1',
      classes: ['canonical-family-alignment'],
      vocabulary,
      targetGroups: canonicalGroups.map(group => group.groupIndex),
      meaning: 'Make groups 2, 4, and 5 use the reference-execution canonical families before any geometry claim.',
      expectedMetricMovement: 'Remove canonical family blockers while leaving object-track score unchanged.',
      generatedLowLevelControls: { groups: canonicalGroups.map(group => group.generatedLowLevelControls) },
      why: 'The family labels are generated from canonicalComparisonPathFamily in the reference execution description.',
      groups: canonicalGroups
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-group1-path-compression-0.1',
      classes: ['group1-path-length-compression'],
      vocabulary,
      targetGroups: [1],
      meaning: 'Shorten the opening cross-sweep path so the opener is a tighter, more readable bonus-stage route.',
      expectedMetricMovement: 'Improve group 1 aggregate object-track score without touching groups 4 and 5.',
      generatedLowLevelControls: group1.generatedLowLevelControls,
      why: 'The path length is derived from the aggregate target and promotion-gate ratio, not hand-selected.',
      groups: [group1]
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-lower-field-overstay-reduction-0.1',
      classes: ['lower-field-overstay-reduction'],
      vocabulary,
      targetGroups: lowerGroups.map(group => group.groupIndex),
      meaning: 'Pull overstaying groups back toward their reference lower-field share without changing late groups.',
      expectedMetricMovement: 'Reduce lower-field overstay warnings for selected groups.',
      generatedLowLevelControls: { groups: lowerGroups.map(group => group.generatedLowLevelControls) },
      why: 'Groups are selected from measured lower-field deltas and the new share is generated from the lower-field gate.',
      groups: lowerGroups
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-phase-duration-rebalance-0.1',
      classes: ['phase-duration-rebalance'],
      vocabulary,
      targetGroups: phaseGroups.map(group => group.groupIndex),
      meaning: 'Align visible group windows to the reference phase order without changing target count or challenge safety.',
      expectedMetricMovement: 'Improve visible-start/end components while exposing any geometry loss.',
      generatedLowLevelControls: { groups: phaseGroups.map(group => group.generatedLowLevelControls) },
      why: 'The timing windows are copied from aggregate object-track targets in the reference execution description.',
      groups: phaseGroups
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-preserve-scoreable-window-0.1',
      classes: ['preserve-scoreable-window'],
      vocabulary,
      targetGroups: [],
      meaning: 'Exercise the scoreable-window guardrail as a semantic invariant rather than a geometry candidate.',
      expectedMetricMovement: 'No object-track movement; should reject as measurement-only while preserving route evidence.',
      generatedLowLevelControls: { geometry: 'none', guardrail: 'baseline scoreable-route evidence' },
      why: 'This is a guardrail class; it proves route preservation remains explicit in batch candidates.',
      groups: []
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-protect-group4-group5-0.1',
      classes: ['protect-group4-group5'],
      vocabulary,
      targetGroups: [4, 5],
      meaning: 'Lock late groups to their restored baseline vectors so opener improvements cannot hide late regression.',
      expectedMetricMovement: 'No object-track lift; preserves group 4 and group 5 as explicit guardrails.',
      generatedLowLevelControls: { groups: lateProtection.map(group => group.generatedLowLevelControls) },
      why: 'The protection values come from the restored baseline trial report and prior rejection lesson.',
      groups: lateProtection
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-opener-align-protect-0.1',
      classes: [
        'canonical-family-alignment',
        'group1-path-length-compression',
        'lower-field-overstay-reduction',
        'preserve-scoreable-window',
        'protect-group4-group5'
      ],
      vocabulary,
      targetGroups: Array.from(new Set([1, ...canonicalGroups.map(group => group.groupIndex), ...lowerGroups.map(group => group.groupIndex), 4, 5])).sort((a, b) => a - b),
      meaning: 'Try the smallest semantic composition: improve the opener, align canonical families, reduce measured lower-field overstay, and explicitly protect groups 4 and 5.',
      expectedMetricMovement: 'Potential total object-track lift through group 1 while preserving late group floors and guardrails.',
      generatedLowLevelControls: {
        group1: group1.generatedLowLevelControls,
        canonicalFamilies: canonicalGroups.map(group => group.generatedLowLevelControls),
        lowerField: lowerGroups.map(group => group.generatedLowLevelControls),
        lateProtection: lateCanonicalProtection.map(group => group.generatedLowLevelControls)
      },
      why: 'The composition encodes the rejected-candidate lesson: group 1 can move only if groups 4 and 5 stay protected and all family labels are canonical.',
      groups: mergeGroups(canonicalGroups, [group1], lowerGroups, lateCanonicalProtection)
    }),
    templateCandidate({
      candidateId: 'stage7-semantic-phase-align-protect-0.1',
      classes: [
        'canonical-family-alignment',
        'phase-duration-rebalance',
        'preserve-scoreable-window',
        'protect-group4-group5'
      ],
      vocabulary,
      targetGroups: Array.from(new Set([...canonicalGroups.map(group => group.groupIndex), ...phaseGroups.map(group => group.groupIndex), 5])).sort((a, b) => a - b),
      meaning: 'Combine the strongest measured phase-window signal with canonical family alignment and explicit late-group protection.',
      expectedMetricMovement: 'Potential total object-track lift through phase-order/window fit while preserving groups 4 and 5.',
      generatedLowLevelControls: {
        phaseWindows: phaseGroups.map(group => group.generatedLowLevelControls),
        canonicalFamilies: canonicalGroups.map(group => group.generatedLowLevelControls),
        group5Protection: lateCanonicalProtection.filter(group => +group.groupIndex === 5).map(group => group.generatedLowLevelControls)
      },
      why: 'The first semantic batch signal showed phase-duration rebalance moved group 1 and group 4, while canonical alignment was the remaining blocker. This candidate composes those named classes without adding free numeric deltas.',
      groups: mergeGroups(canonicalGroups, phaseGroups, lateCanonicalProtection.filter(group => +group.groupIndex === 5))
    })
  ];
}

function semanticValidity(candidate, trialReport, vocabulary){
  const known = knownClassSet(vocabulary);
  const classes = Array.isArray(candidate.semanticTransformations) ? candidate.semanticTransformations : [candidate.semanticTransformationClass].filter(Boolean);
  const blockers = [];
  const warnings = [];
  if(!classes.length) blockers.push('candidate does not name a semantic transformation class');
  for(const classId of classes){
    if(!known.has(classId)) blockers.push(`unknown semantic transformation class ${classId}`);
  }
  if(!candidate.intendedPlayerFacingMeaning) blockers.push('missing intended player-facing meaning');
  if(!candidate.expectedMetricMovement) blockers.push('missing expected metric movement');
  if(!candidate.whyMoreLikelyThanBlindTuning) blockers.push('missing why-more-likely-than-blind-tuning read');
  if(!candidate.generatedLowLevelControls) blockers.push('missing generated low-level controls');
  const groups = trialReport.trial.groupResults || [];
  const touched = new Set((candidate.groups || []).map(group => +group.groupIndex));
  for(const group of groups){
    if(touched.has(+group.groupIndex) && !group.canonicalPathFamilyMatch){
      blockers.push(`group ${group.groupIndex} touched but does not match canonical family`);
    }
  }
  const group4 = groups.find(group => +group.groupIndex === 4);
  const group5 = groups.find(group => +group.groupIndex === 5);
  if(group4 && group4.aggregateObjectTrackScore10 < group4.baselineAggregateObjectTrackScore10){
    blockers.push('semantic validity failed: group 4 regressed below baseline');
  }
  if(group5 && group5.aggregateObjectTrackScore10 < group5.baselineAggregateObjectTrackScore10){
    blockers.push('semantic validity failed: group 5 regressed below baseline');
  }
  if(classes.includes('group1-path-length-compression') && !classes.includes('protect-group4-group5')){
    warnings.push('group 1 compression is isolated; runtime promotion should combine it with late-group protection');
  }
  if(classes.includes('phase-duration-rebalance')){
    warnings.push('phase-duration rebalance needs browser capture before promotion because timing changes can affect spacing.');
  }
  const directVectors = (candidate.groups || []).filter(group => group.predictedRuntimeVector);
  if(directVectors.length && !classes.includes('protect-group4-group5')){
    blockers.push('direct predictedRuntimeVector is only allowed for explicit protection classes in this pilot');
  }
  return {
    pass: blockers.length === 0,
    blockers,
    warnings,
    read: blockers.length
      ? 'Semantic validity failed; the candidate should not be promoted even if numeric scores look promising.'
      : 'Semantic validity passed; numeric movement remains subject to the trial promotion gate.'
  };
}

function runtimeExpressibility(candidate, trialReport, vocabulary, truthAlignment){
  const classes = Array.isArray(candidate.semanticTransformations) ? candidate.semanticTransformations : [candidate.semanticTransformationClass].filter(Boolean);
  const blockers = [];
  const warnings = [];
  const classMappings = classes.map(classId => {
    const spec = classSpec(vocabulary, classId);
    const mapping = spec.runtimeExpressibility || {};
    const sourceReadySupported = mapping.sourceReadySupported === true;
    const sourceReadyRole = mapping.sourceReadyRole || (sourceReadySupported ? 'runtime-transform' : 'analysis-only');
    if(!sourceReadySupported){
      blockers.push(`${classId}: no explicit runtime-expressibility mapping for source promotion (${mapping.remainingCompilerGap || mapping.predictionLimits || 'mapping missing'})`);
    }
    return {
      classId,
      sourceReadySupported,
      sourceReadyRole,
      sourceFields: mapping.sourceFields || [],
      runtimeConsumer: mapping.runtimeConsumer || '',
      predictionLimits: mapping.predictionLimits || '',
      proofHarnesses: mapping.proofHarnesses || [],
      remainingCompilerGap: mapping.remainingCompilerGap || null
    };
  });
  const hasRuntimeTransform = classMappings.some(row => row.sourceReadySupported && row.sourceReadyRole !== 'guardrail-only');
  if(!hasRuntimeTransform){
    blockers.push('candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready');
  }
  const candidateOrder = candidateProjectedOrder(candidate, truthAlignment.liveGateCanonicalOrder || []);
  const liveGateMismatches = (truthAlignment.sources || [])
    .filter(source => ['live-promotion-gate', 'live-runtime-source'].includes(source.role))
    .filter(source => !sameOrder(candidateOrder, source.order))
    .map(source => ({
      sourceId: source.sourceId,
      role: source.role,
      expectedOrder: source.order,
      candidateOrder
    }));
  if(liveGateMismatches.length){
    blockers.push(`candidate projected path-family order ${candidateOrder.join(', ')} does not match all live promotion gates`);
  }
  if(!truthAlignment.measuredIntentMatchesLiveGate){
    warnings.push('measured reference intent and live promotion gates disagree; candidate source-readiness must honor live gates until source-of-truth reconciliation is explicit');
  }
  for(const group of candidate.groups || []){
    if(group.timing && (Number.isFinite(+group.timing.visibleStartS) || Number.isFinite(+group.timing.visibleEndS))){
      const classesForGroup = classes.filter(classId => classId === group.semanticReason || classId === 'phase-duration-rebalance');
      if(classesForGroup.includes('phase-duration-rebalance')){
        blockers.push(`group ${group.groupIndex}: visibleStartS/visibleEndS trial timing is not an explicit consumed runtime control`);
      }
    }
    if(group.controls && Number.isFinite(+group.controls.pathLength)){
      blockers.push(`group ${group.groupIndex}: pathLength trial control is not an explicit consumed runtime source field`);
    }
    if(group.lowerField && Object.keys(group.lowerField).length){
      blockers.push(`group ${group.groupIndex}: lower-field trial control must compile to consumed lowerFieldBias/yOffset or reference geometry before source promotion`);
    }
    if(group.predictedRuntimeVector && group.semanticReason !== 'protect-group4-group5'){
      blockers.push(`group ${group.groupIndex}: predictedRuntimeVector is not a source mapping outside protection semantics`);
    }
  }
  const uniqueBlockers = Array.from(new Set(blockers));
  const uniqueWarnings = Array.from(new Set(warnings));
  return {
    pass: uniqueBlockers.length === 0,
    blockers: uniqueBlockers,
    warnings: uniqueWarnings,
    classMappings,
    candidateProjectedPathOrder: candidateOrder,
    liveGatePathOrder: truthAlignment.liveGateCanonicalOrder,
    liveGateMismatches,
    explicitRuntimeControlMapping: uniqueBlockers.length === 0,
    read: uniqueBlockers.length
      ? 'Runtime expressibility failed; the candidate may remain useful analysis but is not ready for source promotion.'
      : 'Runtime expressibility passed; every source-moving transform maps to consumed runtime controls and live gate path order.'
  };
}

function compactTrial(candidate, trialReport, semanticRead, runtimeRead, trialReportPath, candidatePath){
  const groups = trialReport.trial.groupResults || [];
  const groupScore = groupIndex => groups.find(group => +group.groupIndex === +groupIndex)?.aggregateObjectTrackScore10 ?? null;
  const groupMatch = groupIndex => groups.find(group => +group.groupIndex === +groupIndex)?.canonicalPathFamilyMatch === true;
  const readyForRuntimeSourceCandidate = trialReport.summary.readyForRuntimeSourceCandidate && semanticRead.pass && runtimeRead.pass;
  return {
    candidateId: candidate.candidateId,
    semanticTransformationClass: candidate.semanticTransformationClass,
    semanticTransformations: candidate.semanticTransformations || [],
    intendedPlayerFacingMeaning: candidate.intendedPlayerFacingMeaning,
    targetGroups: candidate.targetGroups || [],
    candidateInput: candidatePath,
    trialReport: trialReportPath,
    totalObjectTrackScore10: trialReport.trial.totalObjectTrackScore10,
    totalObjectTrackCoverage: trialReport.trial.totalObjectTrackCoverage,
    totalObjectTrackDelta10: trialReport.trial.deltas.totalObjectTrackScore10,
    coverageDelta: trialReport.trial.deltas.totalObjectTrackCoverage,
    groupScores: {
      group1: groupScore(1),
      group4: groupScore(4),
      group5: groupScore(5)
    },
    canonicalFamilyMatch: {
      allGroups: groups.every(group => group.canonicalPathFamilyMatch),
      group1: groupMatch(1),
      group4: groupMatch(4),
      group5: groupMatch(5)
    },
    guardrails: {
      spacingReadability: trialReport.trial.spacingReadability.pass,
      scoreableRoutes: trialReport.trial.scoreableRoutes.pass,
      safety: trialReport.trial.safety.pass
    },
    semanticValidity: semanticRead,
    runtimeExpressibility: runtimeRead,
    readyForRuntimeSourceCandidate,
    blockerCount: trialReport.summary.blockerCount + semanticRead.blockers.length + runtimeRead.blockers.length,
    blockers: [...runtimeRead.blockers, ...semanticRead.blockers, ...trialReport.summary.blockers],
    warnings: [...runtimeRead.warnings, ...semanticRead.warnings, ...trialReport.summary.warnings],
    rankingScore: round(
      (trialReport.trial.deltas.totalObjectTrackScore10 * 10)
      + ((groupScore(1) || 0) - (groups.find(group => +group.groupIndex === 1)?.baselineAggregateObjectTrackScore10 || 0)) * 2
      - Math.max(0, (groups.find(group => +group.groupIndex === 4)?.baselineAggregateObjectTrackScore10 || 0) - (groupScore(4) || 0)) * 3
      - Math.max(0, (groups.find(group => +group.groupIndex === 5)?.baselineAggregateObjectTrackScore10 || 0) - (groupScore(5) || 0)) * 3
      - (semanticRead.blockers.length * 2)
      - (runtimeRead.blockers.length * 2)
      - (trialReport.summary.blockerCount * 0.4),
      3
    )
  };
}

function classSummary(rows, vocabulary){
  return (vocabulary.transformationClasses || []).map(spec => {
    const candidates = rows.filter(row => row.semanticTransformations.includes(spec.classId));
    const blockers = candidates.flatMap(row => row.blockers.map(blocker => ({ candidateId: row.candidateId, blocker })));
    const best = candidates.slice().sort((a, b) => b.rankingScore - a.rankingScore)[0] || null;
    const standalone = candidates.find(row => row.semanticTransformations.length === 1) || null;
    const readyCandidate = candidates.find(row => row.readyForRuntimeSourceCandidate) || null;
    const standaloneObjectTrackPromise = standalone
      && standalone.semanticValidity.pass
      && standalone.runtimeExpressibility.pass
      && standalone.totalObjectTrackDelta10 > 0
      && standalone.groupScores.group4 >= 5
      && standalone.groupScores.group5 >= 4.9
      && standalone.guardrails.spacingReadability
      && standalone.guardrails.scoreableRoutes
      && standalone.guardrails.safety;
    const composedObjectTrackPromise = candidates.some(row =>
      row.semanticValidity.pass
      && row.runtimeExpressibility.pass
      && row.totalObjectTrackDelta10 > 0
      && row.groupScores.group4 >= 5
      && row.groupScores.group5 >= 4.9
      && row.guardrails.spacingReadability
      && row.guardrails.scoreableRoutes
      && row.guardrails.safety
    );
    const promise = !!readyCandidate || !!standaloneObjectTrackPromise || (spec.classId === 'canonical-family-alignment' && composedObjectTrackPromise);
    const promiseKind = readyCandidate
      ? 'runtime-source-candidate-component'
      : standaloneObjectTrackPromise
        ? 'standalone-object-track-signal'
      : spec.classId === 'canonical-family-alignment' && composedObjectTrackPromise
        ? 'required-composition-prerequisite'
        : spec.runtimeExpressibility?.sourceReadySupported === false
          ? 'analysis-only-until-runtime-mapped'
          : spec.classId === 'preserve-scoreable-window'
            ? 'guardrail-only'
            : spec.classId === 'protect-group4-group5'
              ? 'guardrail-or-composition-only'
              : 'no-current-promise';
    return {
      classId: spec.classId,
      candidateCount: candidates.length,
      bestCandidateId: best?.candidateId || null,
      bestObjectTrackDelta10: best?.totalObjectTrackDelta10 ?? null,
      promise,
      promiseKind,
      groupedRejectionReasons: blockers.slice(0, 12),
      read: readyCandidate
        ? `${spec.classId} participates in the single runtime-source candidate recommendation.`
        : promise
          ? `${spec.classId} showed measurement promise but still needs composition or runtime capture.`
          : `${spec.classId} did not produce a promotion-ready candidate in this batch.`
    };
  });
}

function buildMarkdown(report){
  const rows = report.candidates.map(row => `| ${row.candidateId} | ${row.semanticTransformations.join(', ')} | ${row.totalObjectTrackScore10} | ${row.totalObjectTrackDelta10} | ${row.totalObjectTrackCoverage} | ${row.groupScores.group1} | ${row.groupScores.group4} | ${row.groupScores.group5} | ${row.canonicalFamilyMatch.allGroups} | ${row.semanticValidity.pass} | ${row.runtimeExpressibility.pass} | ${row.readyForRuntimeSourceCandidate} | ${row.blockers.slice(0, 3).join('<br>') || 'none'} |`).join('\n');
  const classRows = report.classSummaries.map(row => `| ${row.classId} | ${row.candidateCount} | ${row.bestCandidateId || 'n/a'} | ${row.bestObjectTrackDelta10 ?? 'n/a'} | ${row.promiseKind} | ${row.groupedRejectionReasons.slice(0, 3).map(item => `${item.candidateId}: ${item.blocker}`).join('<br>') || 'none'} |`).join('\n');
  const truthRows = (report.truthAlignment.sources || []).map(source => `| ${source.sourceId} | ${source.role} | ${source.order.join(', ')} | ${sameOrder(source.order, report.truthAlignment.liveGateCanonicalOrder)} |`).join('\n');
  return `# Stage 7 Semantic Candidate Batch

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Decision

Recommendation: ${report.summary.recommendation}

Runtime source candidate: ${report.summary.runtimeSourceCandidateId || 'none'}

${report.summary.read}

## Truth Alignment

Live gate order: ${report.truthAlignment.liveGateCanonicalOrder.join(', ')}

Measured intent order: ${report.truthAlignment.measuredIntentOrder.join(', ')}

Measured intent matches live gate: ${report.truthAlignment.measuredIntentMatchesLiveGate}

${report.truthAlignment.staleOrDiagnosticRead}

| Source | Role | Path-family order | Matches live gate |
| --- | --- | --- | --- |
${truthRows}

## Candidates

| Candidate | Transformations | Score | Delta | Coverage | G1 | G4 | G5 | Canonical families | Semantic valid | Runtime expressible | Source-ready | First blockers |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |
${rows}

## Class Summary

| Class | Candidates | Best candidate | Best delta | Promise kind | Rejection examples |
| --- | ---: | --- | ---: | --- | --- |
${classRows}

## Next Step

${report.nextBestStep}
`;
}

function main(){
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD']);
  const stamp = `${generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}`;
  const batchDir = path.join(OUT_ROOT, 'semantic-batches', stamp);
  const candidateDir = path.join(batchDir, 'candidates');
  const trialDir = path.join(batchDir, 'trials');
  ensureDir(candidateDir);
  ensureDir(trialDir);

  const description = readJson(DESCRIPTION);
  const vocabulary = readJson(VOCABULARY);
  const truthAlignment = buildTruthAlignment(description);
  const baselineReport = buildReport(DEFAULT_CANDIDATE);
  const candidates = buildCandidates({ description, vocabulary, baselineReport });
  const compactRows = [];
  for(const candidate of candidates){
    const candidatePath = path.join(candidateDir, `${candidate.candidateId}.json`);
    writeJson(candidatePath, candidate);
    const trialReport = buildReport(candidatePath);
    const trialReportPath = path.join(trialDir, `${candidate.candidateId}.json`);
    writeJson(trialReportPath, trialReport);
    const semanticRead = semanticValidity(candidate, trialReport, vocabulary);
    const runtimeRead = runtimeExpressibility(candidate, trialReport, vocabulary, truthAlignment);
    compactRows.push(compactTrial(candidate, trialReport, semanticRead, runtimeRead, rel(trialReportPath), rel(candidatePath)));
  }
  compactRows.sort((a, b) => {
    if(a.readyForRuntimeSourceCandidate !== b.readyForRuntimeSourceCandidate) return a.readyForRuntimeSourceCandidate ? -1 : 1;
    return b.rankingScore - a.rankingScore || a.candidateId.localeCompare(b.candidateId);
  });
  const ready = compactRows.filter(row => row.readyForRuntimeSourceCandidate);
  const runtimeSourceCandidate = ready.length === 1 ? ready[0] : null;
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-reference-execution-semantic-candidate-batch',
    generatedAt,
    generatedBy: 'tools/harness/analyze-stage7-reference-execution-batch.js',
    commit,
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 7,
      challengeNumber: 2,
      displayLabel: 'Stage 7 / Challenge 2'
    },
    sourceArtifacts: {
      semanticVocabulary: rel(VOCABULARY),
      referenceExecutionDescription: rel(DESCRIPTION),
      baselineTrialInput: rel(DEFAULT_CANDIDATE)
    },
    generatedCandidateDir: rel(candidateDir),
    generatedTrialReportDir: rel(trialDir),
    truthAlignment,
    sourceReadyGate: {
      requiresSemanticValidity: true,
      requiresPredictedObjectTrackLift: true,
      requiresGroup1Improvement: true,
      requiresGroup4Group5Preservation: true,
      requiresGuardrailPreservation: true,
      requiresLiveGatePathFamilyAlignment: true,
      requiresRuntimeExpressibilityMapping: true,
      read: 'Source-ready now means a candidate can prove both semantic score intent and concrete runtime/source expressibility against live promotion gates.'
    },
    candidateCount: compactRows.length,
    transformationClassesTested: (vocabulary.transformationClasses || []).map(row => row.classId),
    candidates: compactRows,
    classSummaries: classSummary(compactRows, vocabulary),
    bestCandidate: compactRows[0] || null,
    summary: {
      measurementKeeperRecommendation: 'accept-semantic-batch-mechanism',
      runtimeKeeperRecommendation: 'not-a-runtime-keeper',
      recommendation: runtimeSourceCandidate ? 'exactly-one-runtime-source-candidate-to-try' : 'no-runtime-source-candidate',
      runtimeSourceCandidateId: runtimeSourceCandidate?.candidateId || null,
      readyCandidateCount: ready.length,
      read: runtimeSourceCandidate
        ? `Candidate ${runtimeSourceCandidate.candidateId} is ready for exactly one runtime source attempt, not a runtime keeper.`
        : 'No semantic candidate passed the full pre-source promotion gate; preserve this batch as measurement evidence and refine the failing transformation classes.'
    },
    nextBestStep: runtimeSourceCandidate
      ? `Try exactly one runtime source candidate for ${runtimeSourceCandidate.candidateId}, rebuild, then run before/after evidence and strict challenge guardrails.`
      : 'Refine the semantic compiler before touching runtime source: reconcile Stage 7 path-family truth across live gates, then map phase-duration/path-length/lower-field intent to explicit consumed runtime controls.'
  };
  writeJson(path.join(batchDir, 'report.json'), report);
  writeText(path.join(batchDir, 'README.md'), buildMarkdown(report));
  writeJson(BATCH_LATEST, report);
  writeText(path.join(OUT_ROOT, 'latest-batch.md'), buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(BATCH_LATEST),
    candidateCount: report.candidateCount,
    transformationClassesTested: report.transformationClassesTested,
    recommendation: report.summary.recommendation,
    runtimeSourceCandidateId: report.summary.runtimeSourceCandidateId,
    bestCandidateId: report.bestCandidate?.candidateId || null,
    bestCandidateScore10: report.bestCandidate?.totalObjectTrackScore10 ?? null,
    bestCandidateDelta10: report.bestCandidate?.totalObjectTrackDelta10 ?? null
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

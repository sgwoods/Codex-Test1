#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION_ROOT = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions');
const DESCRIPTION_PATH = path.join(DESCRIPTION_ROOT, 'aurora-stage3-challenge1-0.1.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-description', 'stage3-challenge1');

const OBJECT_TRACKS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
const TARGET_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-target-contracts', 'aurora-challenge-contracts-0.1.json');
const SETPIECE_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-setpiece-contracts', 'latest.json');
const MOVEMENT_GRAMMAR = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-movement-grammar', 'aurora-first-five-0.1.json');
const PATH_LABELS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-labels', 'latest.json');
const RAW_PATH_LABELS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-path-reference-labels', 'snake-latino-media-backed-labels-0.1.json');
const VIDEO_REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-video-reference', 'latest.json');
const CHALLENGE_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');

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
  if(value === null || value === undefined || value === '') return null;
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

function objectTrackVector(track){
  if(!track) return null;
  return {
    visibleStartS: round(track.visibleStartS, 2),
    visibleEndS: round(track.visibleEndS, 2),
    entrySide: track.entrySide || null,
    exitSide: track.exitSide || null,
    xRange: round(track.xRange, 4),
    yRange: round(track.yRange, 4),
    pathLength: round(track.pathLength, 4),
    turnCount: round(track.turnCount, 3),
    reversalCount: round(track.reversalCount, 3),
    lowerFieldShare: round(track.lowerFieldShare, 4)
  };
}

function relativePoints(track){
  const start = Number.isFinite(+track?.visibleStartS) ? +track.visibleStartS : 0;
  return (track?.sampledPoints || []).map(point => ({
    t: round((+point.t || 0) - start, 2),
    sourceT: round(point.t, 2),
    x: round(point.x, 4),
    y: round(point.y, 4)
  }));
}

function findChallenge1ObjectTracks(report){
  const row = (report.challenges || report.challengeStages || []).find(item => +item.challengeNumber === 1);
  if(!row) throw new Error('Missing Galaga Challenge 1 object-track row.');
  return row;
}

function findStage3TargetContract(report){
  const row = (report.contracts || report.challengeStages || report.stages || []).find(item => +item.stage === 3 || +item.challengeNumber === 1);
  if(!row) throw new Error('Missing Stage 3 / Challenge 1 target contract.');
  return row;
}

function findStage3Setpiece(report){
  const row = (report.contracts || []).find(item => +item.stage === 3 || +item.challengeNumber === 1);
  if(!row) throw new Error('Missing Stage 3 / Challenge 1 setpiece contract.');
  return row;
}

function findStage3Grammar(report){
  const row = (report.grammar || []).find(item => +item.stage === 3 || +item.challengeNumber === 1);
  if(!row) throw new Error('Missing Stage 3 / Challenge 1 movement grammar.');
  return row;
}

function findStage3Conformance(report){
  const row = (report.stageRows || report.challengeStages || []).find(item => +item.stage === 3 || +item.challengeNumber === 1);
  if(!row) throw new Error('Missing Stage 3 / Challenge 1 conformance row.');
  return row;
}

function findVideoWindow(report){
  return (report.primaryWindows || []).find(item => +item.challengeNumber === 1 || +item.stageMarker === 3) || null;
}

function challenge1Labels(){
  const accepted = readJson(PATH_LABELS).acceptedLabels || [];
  const rawLabels = readJson(RAW_PATH_LABELS).labels || [];
  const rawById = new Map(rawLabels.map(label => [label.id, label]));
  return accepted
    .filter(label => +label.challengeNumber === 1)
    .map(label => Object.assign({}, label, rawById.get(label.labelId || label.id) || {}, {
      labelId: label.labelId || label.id,
      acceptedAnalysis: {
        sourceAnchorMediaEvidence: label.sourceAnchorMediaEvidence === true,
        confidenceScore: label.confidenceScore ?? label.confidence ?? null,
        sourceFile: label.file || null
      }
    }));
}

function labelForGroup(labels, groupIndex){
  return labels.find(label => +label.groupIndex === +groupIndex) || null;
}

function normalizedHumanVector(group, label){
  const vector = label?.comparisonVector || group.objectTrackTarget || {};
  return {
    visibleStartS: round(group.targetVisibleS?.[0] ?? vector.visibleStartS, 2),
    visibleEndS: round(group.targetVisibleS?.[1] ?? vector.visibleEndS, 2),
    entrySide: label?.entrySide || vector.entrySide || group.entrySide || null,
    exitSide: label?.exitSide || vector.exitSide || group.exitSide || null,
    xRange: round(vector.xRange, 4),
    yRange: round(vector.yRange, 4),
    pathLength: round(vector.pathLength, 4),
    turnCount: round(vector.turnCount, 3),
    reversalCount: round(vector.reversalCount, 3),
    lowerFieldShare: round(vector.lowerFieldShare, 4)
  };
}

function sourceAgreement(semanticFamily, scheduleFamily, grammarFamily, runtimeFamily){
  const canonical = semanticFamily || scheduleFamily || grammarFamily || runtimeFamily || null;
  return {
    semanticMatchesCanonical: semanticFamily && canonical ? semanticFamily === canonical : null,
    scheduleMatchesCanonical: scheduleFamily && canonical ? scheduleFamily === canonical : null,
    grammarMatchesCanonical: grammarFamily && canonical ? grammarFamily === canonical : null,
    runtimeMatchesCanonical: runtimeFamily && canonical ? runtimeFamily === canonical : null,
    scheduleMatchesGrammar: scheduleFamily && grammarFamily ? scheduleFamily === grammarFamily : null
  };
}

function resolvePathFamily({ semantic, scheduled, grammar, runtime }){
  const semanticFamily = semantic.pathFamily || null;
  const scheduleFamily = scheduled.pathFamily || null;
  const grammarFamily = grammar.runtimePathFamilyHint || null;
  const runtimeFamily = runtime.pathFamilies?.[0] || null;
  const canonicalPathFamily = semanticFamily || runtimeFamily || scheduleFamily || grammarFamily || null;
  const agreement = sourceAgreement(semanticFamily, scheduleFamily, grammarFamily, runtimeFamily);
  let canonicalSource = 'target-contract-semantic';
  let reason = 'Stage 3 RED target conformance is anchored first to the human-readable teaching contract and accepted path labels.';
  if(!semanticFamily && runtimeFamily){
    canonicalSource = 'runtime-group-signature';
    reason = 'No semantic path family is available, so the current runtime group signature is kept as a comparison placeholder.';
  }
  const debts = [];
  if(scheduleFamily && semanticFamily && scheduleFamily !== semanticFamily){
    debts.push(`setpiece schedule says ${scheduleFamily} while target contract says ${semanticFamily}`);
  }
  if(grammarFamily && semanticFamily && grammarFamily !== semanticFamily){
    debts.push(`movement grammar says ${grammarFamily} while target contract says ${semanticFamily}`);
  }
  return {
    canonicalPathFamily,
    canonicalSource,
    reason,
    legacySemanticPathFamily: semanticFamily,
    objectTrackExecutionFamily: scheduleFamily,
    motionGrammarSeedFamily: grammarFamily,
    runtimeCurrentFamily: runtimeFamily,
    sourceAgreement: agreement,
    targetConformanceDebt: debts
  };
}

function inferredLineRole(group, label){
  if(label?.entityFamily) return label.entityFamily;
  const role = String(group.role || '').toLowerCase();
  const types = group.expectedTypes || [];
  if(role.includes('closing')) return 'mixed-closing-peel';
  if(role.includes('hook')) return 'mixed-side-hook-line';
  if(role.includes('bee')) return 'bee-column';
  if(role.includes('butterfly') || types.includes('but')) return 'butterfly-column';
  return 'mixed-challenge-line';
}

function semanticExecution(group, label){
  const lineRole = inferredLineRole(group, label);
  const direct = !!label;
  const scoreableFrameWindow = direct ? {
    sourceFps: 4,
    firstVisibleFrame: label.firstVisibleFrame ?? null,
    pathCommitFrame: label.pathCommitFrame ?? null,
    scoreableUpperBandStartFrame: label.scoreableUpperBandStartFrame ?? null,
    scoreableUpperBandEndFrame: label.scoreableUpperBandEndFrame ?? null
  } : null;
  return {
    lineRole,
    lineFormationIntent: lineRole.includes('column') ? 'vertical column lesson' : 'horizontal line / upper-band teaching phrase',
    entryCue: label?.entrySide || group.objectTrackTarget?.entrySide || group.entrySide || null,
    exitGesture: label?.exitSide
      ? `${label.exitSide} peel-off`
      : (String(group.role || '').toLowerCase().includes('peel') ? `${group.exitSide || 'unknown'} peel-off` : `${group.exitSide || 'unknown'} exit`),
    scoreableBand: 'upper-band',
    scoreableWindowRead: label?.bonusOpportunity || group.scoreWindow || '',
    scoreableFrameWindow,
    noCombatGrammar: {
      enemyShots: 'forbidden',
      attackStarts: 'forbidden',
      shipLosses: 'forbidden',
      playerMeaning: 'safe bonus exhibition, not a combat wave'
    },
    provenance: {
      strength: direct ? 'direct-path-label' : 'target-contract-inferred',
      labelId: label?.labelId || null,
      sourceAnchor: label?.sourceAnchor || null,
      sourceTimestampS: label?.sourceTimestampS ?? null,
      confidence: round(label?.confidenceScore ?? label?.confidence ?? null, 3),
      note: direct
        ? 'Accepted media-backed path label carries entry side, line family, scoreable upper-band frames, exit side, and comparison vector.'
        : 'No accepted per-group path label yet; semantic phrase is inferred from the Stage 3 target contract and object-track group order.'
    }
  };
}

function buildCandidateGate(canonicalPathFamily, humanVector, aggregateVector, primaryVector){
  return {
    authorityLayer: 'target-conformance-red-not-live-promotion',
    canonicalPathFamily,
    pathFamilyGate: 'candidate trials should preserve canonical target-contract path family unless the RED language is explicitly refined first',
    aggregateObjectTrackFitFloorScore10: 5,
    primaryObjectTrackFitFloorScore10: 5,
    scoreableWindowRequired: true,
    noCombatRequired: true,
    spacingReadabilityRequired: true,
    lowerFieldDeltaRange: [-0.25, 0.18],
    maxAggregatePathLengthRatio: 3,
    maxPrimaryPathLengthRatio: 3,
    semanticGates: [
      'lineFormationIntent',
      'scoreableBand',
      'exitGesture',
      'noCombatGrammar',
      'fieldOccupancyExpectation'
    ],
    targetVector: {
      humanPathLength: round(humanVector?.pathLength, 4),
      aggregatePathLength: round(aggregateVector?.pathLength, 4),
      primaryPathLength: round(primaryVector?.pathLength, 4),
      humanLowerFieldShare: round(humanVector?.lowerFieldShare, 4),
      aggregateLowerFieldShare: round(aggregateVector?.lowerFieldShare, 4),
      primaryLowerFieldShare: round(primaryVector?.lowerFieldShare, 4)
    }
  };
}

function fieldOccupancyExpectation(humanVector, aggregateVector, primaryVector, label){
  const humanLower = humanVector?.lowerFieldShare;
  const aggregateLower = aggregateVector?.lowerFieldShare;
  const primaryLower = primaryVector?.lowerFieldShare;
  const conflict = Number.isFinite(+humanLower)
    && Number.isFinite(+aggregateLower)
    && Math.abs(+humanLower - +aggregateLower) > 0.25;
  return {
    expectedPrimaryBand: 'upper-band score window with later peel/drop exit',
    humanLabelLowerFieldShare: round(humanLower, 4),
    aggregateObjectTrackLowerFieldShare: round(aggregateLower, 4),
    primaryObjectTrackLowerFieldShare: round(primaryLower, 4),
    upperBandEmphasis: Number.isFinite(+humanLower) ? round(1 - +humanLower, 4) : null,
    conflictBetweenHumanLabelAndCpuTrack: conflict,
    conflictRead: conflict
      ? 'Human/contact-sheet label reads an upper-band score phrase, while CPU object-track clustering includes substantial lower-field occupancy. Keep both; do not tune from one scalar alone.'
      : 'Human/contact-sheet label and object-track occupancy are close enough for first-pass RED comparison.',
    provenance: label ? 'direct-path-label-plus-object-track' : 'target-contract-plus-object-track'
  };
}

function buildDescription(){
  const objectTracks = findChallenge1ObjectTracks(readJson(OBJECT_TRACKS));
  const targetContract = findStage3TargetContract(readJson(TARGET_CONTRACTS));
  const setpiece = findStage3Setpiece(readJson(SETPIECE_CONTRACTS));
  const grammar = findStage3Grammar(readJson(MOVEMENT_GRAMMAR));
  const videoWindow = findVideoWindow(readJson(VIDEO_REFERENCE));
  const labels = challenge1Labels();
  const candidateTracks = new Map((objectTracks.candidateTracks || []).map(track => [track.id, track]));
  const targetGroups = objectTracks.targetGroups || [];
  const semanticGroups = targetContract.groups || [];
  const schedule = setpiece.targetContract?.groupSchedule || [];
  const grammarGroups = grammar.groupContracts || [];
  const runtimeSignatures = new Map((findStage3Conformance(readJson(CHALLENGE_CONFORMANCE)).runtimeGroupSignatures || []).map(sig => [(+sig.group) + 1, sig]));

  const groups = semanticGroups.map(semantic => {
    const index = +semantic.groupIndex;
    const objectGroup = targetGroups.find(group => +group.groupIndex === index) || {};
    const scheduled = schedule.find(group => +group.groupIndex === index) || {};
    const grammarGroup = grammarGroups.find(group => +group.groupIndex === index) || {};
    const runtime = runtimeSignatures.get(index) || {};
    const label = labelForGroup(labels, index);
    const primaryId = scheduled.referencePathId || grammarGroup.referencePath?.sourceTrackId || objectGroup.trackIds?.[0] || '';
    const primaryTrack = candidateTracks.get(primaryId) || null;
    const aggregateVector = objectTrackVector(objectGroup.objectTrackTarget || {});
    const primaryVector = objectTrackVector(primaryTrack);
    const humanVector = normalizedHumanVector(semantic, label);
    const pathFamilyDecision = resolvePathFamily({ semantic, scheduled, grammar: grammarGroup, runtime });
    const semanticRead = semanticExecution(semantic, label);
    const occupancy = fieldOccupancyExpectation(humanVector, aggregateVector, primaryVector, label);
    const uncertainty = [];
    if(!label) uncertainty.push('no direct accepted path label for this group yet');
    if(pathFamilyDecision.targetConformanceDebt.length) uncertainty.push(...pathFamilyDecision.targetConformanceDebt);
    if(occupancy.conflictBetweenHumanLabelAndCpuTrack) uncertainty.push('human upper-band read and CPU lower-field occupancy differ');
    if((primaryTrack?.sampleCount || 0) < 6) uncertainty.push('primary object track is short and should not be treated as a complete phrase');
    return {
      groupIndex: index,
      phaseId: `challenge-1-group-${index}`,
      order: index,
      role: semantic.role || grammarGroup.controlIntent || '',
      semanticPathFamily: semantic.pathFamily || null,
      objectTrackExecutionFamily: scheduled.pathFamily || null,
      motionGrammarSeedFamily: grammarGroup.runtimePathFamilyHint || null,
      canonicalComparisonPathFamily: pathFamilyDecision.canonicalPathFamily,
      pathFamilyDecision,
      expectedTypes: semantic.expectedTypes || [],
      expectedFamilies: semantic.expectedFamilies || [],
      semanticExecution: semanticRead,
      scoreWindowRead: semantic.scoreWindow || semanticRead.scoreableWindowRead || '',
      humanContractWindowS: semantic.targetVisibleS || null,
      humanContractTarget: humanVector,
      objectTrackWindowS: [aggregateVector?.visibleStartS, aggregateVector?.visibleEndS],
      spawnOffsetS: round(grammarGroup.runtimeControl?.spawnOffsetS ?? scheduled.spawnOffsetS ?? aggregateVector?.visibleStartS ?? 0, 2),
      primaryTargetTrackId: primaryId,
      targetTrackConfidence: round(objectGroup.confidence ?? grammarGroup.confidence, 3),
      sourceTrackIds: objectGroup.trackIds || [],
      aggregateObjectTrackTarget: aggregateVector,
      primaryObjectTrackTarget: primaryVector,
      primaryTrackRelativePoints: primaryTrack ? relativePoints(primaryTrack) : [],
      fieldOccupancyExpectation: occupancy,
      candidateComparisonGate: buildCandidateGate(pathFamilyDecision.canonicalPathFamily, humanVector, aggregateVector, primaryVector),
      comparisonAxes: [
        'phase-order',
        'semantic-line-role',
        'semantic-path-family',
        'canonical-comparison-path-family',
        'human-contract-target',
        'aggregate-object-track-fit',
        'primary-object-track-fit',
        'upper-lower-field-occupancy',
        'scoreable-window',
        'spacing-readability',
        'challenge-safety',
        'field-level-provenance'
      ],
      uncertaintyAndProvenance: {
        confidence: round(average([objectGroup.confidence, label?.confidenceScore ?? label?.confidence, grammarGroup.confidence]), 3),
        directPathLabel: !!label,
        uncertainty,
        sourceEvidence: [
          ...(label ? [label.sourceAnchor] : []),
          objectTracks.evidence?.overlaySvg,
          objectTracks.evidence?.contactSheetSvg,
          objectTracks.evidence?.perChallengeJson
        ].filter(Boolean)
      },
      precisionNotes: uncertainty
    };
  });

  const directLabelCount = groups.filter(group => group.uncertaintyAndProvenance.directPathLabel).length;
  const pathFamilyConflicts = groups.filter(group => group.pathFamilyDecision.targetConformanceDebt.length);
  const occupancyConflicts = groups.filter(group => group.fieldOccupancyExpectation.conflictBetweenHumanLabelAndCpuTrack);
  const shortTracks = groups.filter(group => (group.primaryTrackRelativePoints || []).length < 6);
  return {
    schemaVersion: 1,
    artifactType: 'reference-execution-description',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 3,
      challengeNumber: 1,
      displayLabel: 'Stage 3 / Challenge 1',
      descriptionId: 'aurora-stage3-challenge1-0.1',
      windowScope: 'opening challenge execution window'
    },
    sourceReferenceWindow: {
      sourceVideo: objectTracks.sourceVideo,
      sourceWindowId: objectTracks.sourceWindow?.id || videoWindow?.id || null,
      sourceId: objectTracks.sourceWindow?.sourceId || videoWindow?.sourceId || null,
      sourceStartSeconds: round(objectTracks.sourceStartSeconds, 2),
      durationSeconds: round(objectTracks.durationSeconds, 2),
      fullMediaWindowSeconds: videoWindow ? [round(videoWindow.start, 2), round(videoWindow.start + videoWindow.duration, 2)] : null,
      motionRead: objectTracks.sourceWindow?.motionRead || videoWindow?.motionRead || '',
      contactSheet: objectTracks.sourceWindow?.contactSheet || videoWindow?.contactSheet || null,
      denseContactSheet: objectTracks.sourceWindow?.denseContactSheet || videoWindow?.denseContactSheet || null,
      focusedSheet: objectTracks.sourceWindow?.focusedSheet || videoWindow?.focusedSheet || null,
      frameIndex: objectTracks.sourceWindow?.frameIndex || videoWindow?.frameIndex || null,
      objectTrackOverlay: objectTracks.evidence?.overlaySvg || null,
      objectTrackContactSheet: objectTracks.evidence?.contactSheetSvg || null
    },
    sourceArtifacts: {
      galagaChallengeObjectTracks: rel(OBJECT_TRACKS),
      challengeStageTargetContracts: rel(TARGET_CONTRACTS),
      challengeSetpieceContracts: rel(SETPIECE_CONTRACTS),
      challengeMovementGrammar: rel(MOVEMENT_GRAMMAR),
      galagaPathReferenceLabels: rel(PATH_LABELS),
      rawGalagaPathReferenceLabels: rel(RAW_PATH_LABELS),
      galagaChallengeVideoReference: rel(VIDEO_REFERENCE),
      challengeStageConformance: rel(CHALLENGE_CONFORMANCE)
    },
    executionModel: {
      phaseOrder: groups.map(group => group.phaseId),
      groupCount: groups.length,
      targetCount: 40,
      playerMeaning: targetContract.targetRead || grammar.playerMeaning || '',
      successRead: targetContract.successRead || '',
      noCombatGrammar: {
        enemyShots: 'hard-blocked',
        enemyAttackStarts: 'hard-blocked',
        shipLosses: 'hard-blocked',
        challengeContacts: 'hard-blocked',
        read: 'Challenge 1 is a score exhibition and teaching pattern; safety is a guardrail, not a score substitute.'
      },
      safetyGuardrails: setpiece.targetContract?.safetyGuardrails || [
        'no enemy shots',
        'no enemy attack starts',
        'no ship losses',
        '40 targets presented as a bonus set piece',
        'perfect-bonus feedback remains visible after clear'
      ],
      runtimeComparisonProtocol: {
        phaseOrder: 'Runtime group visible starts should preserve the five Stage 3 teaching phrases and the opening-to-late-wave order.',
        pathFamily: 'Use canonicalComparisonPathFamily as target-conformance intent. Keep setpiece/movement-grammar conflicts visible as RED authority debt, not as source-promotion permission.',
        semanticLineRoles: 'Compare top-right bee-line and late top-left butterfly-line intent directly, including entry cue, line family, scoreable band, and exit gesture.',
        objectTrackFit: 'Report human-contract target fit, aggregate object-track fit, and primary object-track fit separately.',
        fieldOccupancy: 'Do not collapse upper-band score-window intent into lowerFieldShare alone. Report human-label lower-field share beside CPU object-track occupancy.',
        spacing: 'Use challenge-motion-profile spacing/bunching checks before any later candidate can become source-ready.',
        scoreableWindows: 'Promotion requires multi-target score windows and preservation of upper-band lane readability.',
        safety: 'No enemy shots, no enemy attack starts, no challenge contacts, and no ship losses remain hard blockers.'
      }
    },
    groups,
    summary: {
      referenceBackedGroupCount: groups.filter(group => group.primaryTargetTrackId && group.primaryTrackRelativePoints.length >= 3).length,
      directSemanticLabelCount: directLabelCount,
      inferredSemanticGroupCount: groups.length - directLabelCount,
      averageTargetConfidence: round(average(groups.map(group => group.targetTrackConfidence)), 3),
      pathFamilyAuthorityConflictCount: pathFamilyConflicts.length,
      fieldOccupancyConflictCount: occupancyConflicts.length,
      shortPrimaryTrackCount: shortTracks.length,
      read: 'Stage 3 / Challenge 1 now has a RED that preserves the Stage 7 object-track schema while adding explicit semantic line roles, upper-band score windows, peel-off exits, no-combat grammar, field occupancy expectations, and field-level provenance.'
    },
    keeperRules: {
      measurementKeeper: 'Useful if the artifact makes one non-overwriting Stage 3 candidate-trial gate simpler and more inspectable.',
      runtimeKeeper: 'No runtime keeper can be claimed from this artifact. A future runtime keeper must improve strict evidence, preserve scoreable windows, spacing/readability, and no-shot/no-loss safety, and include before/after visual evidence.',
      betaPolicy: 'This artifact is measurement-only and is not beta justification by itself.'
    }
  };
}

function sideMatch(actual, expected){
  if(!actual || !expected) return null;
  if(actual === expected) return true;
  if(String(expected).includes(actual) || String(actual).includes(expected)) return true;
  if(expected === 'both-sides' && ['left', 'right', 'center'].includes(actual)) return true;
  if(expected === 'top' && ['center', 'left', 'right'].includes(actual)) return true;
  return false;
}

function groupRuntimeReads(description, conformanceRow){
  const targetFit = conformanceRow.strictAxisReads?.targetContractFit || conformanceRow.targetContractFit || {};
  const fits = new Map((targetFit.objectTrackFits || []).map(fit => [+fit.groupIndex, fit]));
  const signatures = new Map((conformanceRow.runtimeGroupSignatures || []).map(sig => [(+sig.group) + 1, sig]));
  return description.groups.map(group => {
    const fit = fits.get(+group.groupIndex) || {};
    const runtime = fit.runtime || {};
    const signature = signatures.get(+group.groupIndex) || {};
    const runtimeFamily = runtime.pathFamily || signature.pathFamilies?.[0] || null;
    const canonicalMatch = runtimeFamily && group.canonicalComparisonPathFamily ? runtimeFamily === group.canonicalComparisonPathFamily : null;
    const role = group.semanticExecution || {};
    const human = group.humanContractTarget || {};
    const aggregate = group.aggregateObjectTrackTarget || {};
    const runtimeLower = runtime.lowerFieldShare;
    const runtimePathLength = runtime.pathLength;
    const issues = [];
    if(canonicalMatch === false) issues.push('runtime path family misses RED canonical target-conformance family');
    if(sideMatch(runtime.entrySide, human.entrySide) === false) issues.push('runtime entry side does not match human contract entry side');
    if(sideMatch(runtime.exitSide, human.exitSide) === false) issues.push('runtime exit side does not match human contract exit side');
    const humanLowerDelta = Number.isFinite(+runtimeLower) && Number.isFinite(+human.lowerFieldShare)
      ? round(+runtimeLower - +human.lowerFieldShare, 4)
      : null;
    const aggregateLowerDelta = Number.isFinite(+runtimeLower) && Number.isFinite(+aggregate.lowerFieldShare)
      ? round(+runtimeLower - +aggregate.lowerFieldShare, 4)
      : null;
    const aggregatePathRatio = Number.isFinite(+runtimePathLength) && +aggregate.pathLength
      ? round(+runtimePathLength / +aggregate.pathLength, 2)
      : null;
    const candidateFocus = [];
    if((+fit.score10 || 0) < 5) candidateFocus.push('raise direct object-track fit to first RED trial floor');
    if(humanLowerDelta !== null && Math.abs(humanLowerDelta) > 0.25) candidateFocus.push('separate upper-band semantic target from runtime lower-field occupancy before tuning');
    if(aggregatePathRatio !== null && aggregatePathRatio > 3) candidateFocus.push('reduce aggregate path-length ratio or refine the target vector before candidate generation');
    if(!role.provenance?.labelId && [2, 3, 5].includes(+group.groupIndex)) candidateFocus.push('candidate trial must preserve inferred semantic role provenance');
    return {
      groupIndex: group.groupIndex,
      semanticLineRole: role.lineRole,
      canonicalComparisonPathFamily: group.canonicalComparisonPathFamily,
      runtimePathFamily: runtimeFamily,
      canonicalComparisonPathFamilyMatch: canonicalMatch,
      directPathLabel: group.uncertaintyAndProvenance.directPathLabel,
      aggregateObjectTrackScore10: fit.score10 ?? null,
      aggregateObjectTrackCoverage: fit.coverage ?? null,
      runtimeVector: {
        visibleStartS: runtime.visibleStartS ?? null,
        visibleEndS: runtime.visibleEndS ?? null,
        entrySide: runtime.entrySide ?? null,
        exitSide: runtime.exitSide ?? null,
        xRange: runtime.xRange ?? null,
        yRange: runtime.yRange ?? null,
        pathLength: runtime.pathLength ?? null,
        turnCount: runtime.turnCount ?? null,
        reversalCount: runtime.reversalCount ?? null,
        lowerFieldShare: runtime.lowerFieldShare ?? null
      },
      deviations: {
        humanLowerFieldDelta: humanLowerDelta,
        aggregateLowerFieldDelta: aggregateLowerDelta,
        aggregatePathLengthRatio: aggregatePathRatio,
        visibleStartDeltaS: Number.isFinite(+runtime.visibleStartS) && Number.isFinite(+aggregate.visibleStartS) ? round(+runtime.visibleStartS - +aggregate.visibleStartS, 2) : null,
        visibleEndDeltaS: Number.isFinite(+runtime.visibleEndS) && Number.isFinite(+aggregate.visibleEndS) ? round(+runtime.visibleEndS - +aggregate.visibleEndS, 2) : null
      },
      candidateFocus,
      issues
    };
  });
}

function buildLanguageAdequacy(description){
  const groups = description.groups || [];
  const directCount = groups.filter(group => group.uncertaintyAndProvenance.directPathLabel).length;
  const pathDebtCount = groups.filter(group => group.pathFamilyDecision.targetConformanceDebt.length).length;
  const occupancyConflictCount = groups.filter(group => group.fieldOccupancyExpectation.conflictBetweenHumanLabelAndCpuTrack).length;
  const shortTrackCount = groups.filter(group => group.primaryTrackRelativePoints.length < 6).length;
  const requiredSemanticFields = ['lineRole', 'lineFormationIntent', 'entryCue', 'exitGesture', 'scoreableBand', 'noCombatGrammar', 'provenance'];
  const semanticFieldCoverage = average(groups.map(group => {
    const semantic = group.semanticExecution || {};
    const present = requiredSemanticFields.filter(field => semantic[field] != null && semantic[field] !== '').length;
    return present / requiredSemanticFields.length;
  }));
  const adequacyScore = clamp(
    0.28 * (directCount / Math.max(1, groups.length))
    + 0.28 * (groups.filter(group => group.primaryTrackRelativePoints.length >= 3).length / Math.max(1, groups.length))
    + 0.22 * (semanticFieldCoverage || 0)
    + 0.12 * (1 - pathDebtCount / Math.max(1, groups.length))
    + 0.10 * (1 - Math.min(1, occupancyConflictCount / Math.max(1, groups.length)))
  );
  const readyForTrial = groups.length === 5
    && groups.every(group => group.canonicalComparisonPathFamily)
    && groups.every(group => group.primaryTrackRelativePoints.length >= 3)
    && semanticFieldCoverage >= 0.9;
  return {
    adequacyScore: round(adequacyScore, 3),
    lowFuzzForNonOverwritingTrialGate: readyForTrial,
    representedCleanly: [
      'five ordered challenge phases',
      'top-right bee-line direct reference label',
      'late top-left butterfly-line direct reference label',
      'no-combat grammar as a hard semantic guardrail',
      'scoreable upper-band windows for direct labels',
      'path-family order with target-conformance authority separated from live promotion authority',
      'object-track aggregate and primary target vectors with provenance'
    ],
    approximations: [
      'groups 2, 3, and 5 still use target-contract inference rather than direct accepted path labels',
      'CPU object-track lower-field occupancy conflicts with the human upper-band score-window read in several groups',
      'setpiece/movement-grammar path families conflict with the target-contract path family for groups 3 and 5',
      'primary tracks for groups 1 and 5 are short and should guide only first-pass candidate trials',
      'private contact sheets are referenced as provenance but not stored in this checkout'
    ],
    stage7LanguageWeaknessesFound: [
      'Stage 7 RED fields were too numeric to express bee-line vs butterfly-line teaching roles without extension fields.',
      'Stage 7 lowerFieldShare was too blunt for Stage 3 because upper-band scoreability and lower-field occupancy can conflict.',
      'Stage 7 path-family authority fields needed a clearer target-conformance vs source-promotion split.',
      'Stage 7 provenance was group-level; Stage 3 needs field-level provenance for entry side, score window, exit gesture, and inferred roles.'
    ],
    newPrimitivesNeeded: [
      'semanticExecution.lineRole',
      'semanticExecution.scoreableFrameWindow',
      'semanticExecution.exitGesture',
      'fieldOccupancyExpectation',
      'uncertaintyAndProvenance',
      'candidateComparisonGate.authorityLayer'
    ],
    recommendation: readyForTrial
      ? 'ready-for-stage3-non-overwriting-candidate-trial-gate'
      : 'refine-stage3-red-language-before-candidate-trial',
    recommendationRead: readyForTrial
      ? 'The RED can guide a non-overwriting Stage 3 candidate-trial gate if the gate keeps semantic provenance and does not treat numeric lower-field/object-track values as sole truth.'
      : 'The RED language still needs one more refinement pass before candidate generation.'
  };
}

function buildReport(description){
  const conformance = findStage3Conformance(readJson(CHALLENGE_CONFORMANCE));
  const groupReads = groupRuntimeReads(description, conformance);
  const languageAdequacy = buildLanguageAdequacy(description);
  const targetFit = conformance.strictAxisReads?.targetContractFit || conformance.targetContractFit || {};
  const safety = conformance.safetyProbe || {};
  const scoreable = conformance.shotOpportunityProbe || {};
  const runtimePromotionBlockers = [];
  if((+targetFit.objectTrackFitScore10 || +conformance.targetVideoObjectTrackFitScore10 || 0) < 5){
    runtimePromotionBlockers.push('Stage 3 direct target-video object-track fit remains below the first runtime promotion floor.');
  }
  for(const read of groupReads){
    if(read.issues.length) runtimePromotionBlockers.push(`Group ${read.groupIndex}: ${read.issues.join('; ')}.`);
    if(read.candidateFocus.length) runtimePromotionBlockers.push(`Group ${read.groupIndex}: ${read.candidateFocus.join('; ')}.`);
  }
  const safetyPass = safety.noEnemyShots === true && safety.noAttackStarts === true && safety.noShipLosses === true;
  if(!safetyPass) runtimePromotionBlockers.push('No-combat safety is not clean.');
  return {
    schemaVersion: 1,
    artifactType: 'stage3-reference-execution-description-analysis',
    generatedAt: new Date().toISOString(),
    commit: description.commit,
    branch: description.branch,
    releaseFamily: '1.4.1',
    gameKey: description.gameKey,
    scope: description.scope,
    sourceDescription: rel(DESCRIPTION_PATH),
    sourceArtifacts: description.sourceArtifacts,
    currentRuntimeRead: {
      interestingFactorScore10: conformance.interestingFactorScore10 ?? null,
      challengeConformanceScore10: conformance.conformanceScore10 ?? null,
      movementScore10: conformance.movementConformanceScore10 ?? null,
      graphicsScore10: conformance.graphicalConformanceScore10 ?? null,
      alienNoveltyScore10: conformance.alienNoveltyScore10 ?? null,
      shotOpportunityScore10: conformance.playerShotOpportunityScore10 ?? null,
      targetContractFitScore10: conformance.targetContractFitScore10 ?? null,
      targetVideoObjectTrackFitScore10: targetFit.objectTrackFitScore10 ?? conformance.targetVideoObjectTrackFitScore10 ?? null,
      targetVideoObjectTrackCoverage: targetFit.objectTrackCoverage ?? conformance.targetVideoObjectTrackCoverage ?? null,
      safety: {
        pass: safetyPass,
        noEnemyShots: safety.noEnemyShots,
        noAttackStarts: safety.noAttackStarts,
        noShipLosses: safety.noShipLosses,
        eventCounts: safety.eventCounts || null
      },
      scoreableRoutes: {
        pass: (+scoreable.activeWindows || 0) > 0 && (+scoreable.multiTargetWindowShare || 0) >= 0.5,
        activeWindows: scoreable.activeWindows ?? null,
        multiTargetWindowShare: scoreable.multiTargetWindowShare ?? null,
        laneDiversity: scoreable.laneDiversity ?? null,
        centerBias: scoreable.centerBias ?? null,
        read: scoreable.read || ''
      }
    },
    groupReads,
    languageAdequacy,
    summary: {
      measurementKeeperRecommendation: 'accept-measurement-keeper',
      candidateTrialRecommendation: languageAdequacy.recommendation,
      readyForNonOverwritingCandidateTrialGate: languageAdequacy.lowFuzzForNonOverwritingTrialGate,
      runtimeSourceCandidateAllowed: false,
      runtimePromotionReady: false,
      runtimePromotionBlockerCount: runtimePromotionBlockers.length,
      runtimePromotionBlockers,
      read: languageAdequacy.recommendationRead
    },
    nextBestStep: languageAdequacy.lowFuzzForNonOverwritingTrialGate
      ? 'Build a Stage 3 non-overwriting candidate-trial gate that evaluates semantic line-role, upper-band score-window, path-family, object-track, spacing/readability, scoreable-route, and no-combat guardrails before any runtime source edit.'
      : 'Refine the Stage 3 RED language and add direct labels for the inferred groups before candidate-trial generation.'
  };
}

function buildMarkdown(report, description){
  const rows = report.groupReads.map(read => `| ${read.groupIndex} | ${read.semanticLineRole} | ${read.canonicalComparisonPathFamily || 'n/a'} | ${read.runtimePathFamily || 'n/a'} | ${read.directPathLabel} | ${read.aggregateObjectTrackScore10 ?? 'n/a'} | ${read.deviations.humanLowerFieldDelta ?? 'n/a'} | ${read.deviations.aggregatePathLengthRatio ?? 'n/a'} | ${(read.candidateFocus.concat(read.issues)).join('<br>') || 'none'} |`).join('\n');
  return `# Stage 3 Reference Execution Description Analysis

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Decision

Measurement keeper: ${report.summary.measurementKeeperRecommendation}

Candidate-trial recommendation: ${report.summary.candidateTrialRecommendation}

Runtime source candidate allowed: ${report.summary.runtimeSourceCandidateAllowed}

${report.summary.read}

## Language Adequacy

Adequacy score: ${report.languageAdequacy.adequacyScore}

Low fuzz for non-overwriting trial gate: ${report.languageAdequacy.lowFuzzForNonOverwritingTrialGate}

Clean representations:
${report.languageAdequacy.representedCleanly.map(item => `- ${item}`).join('\n')}

Approximations:
${report.languageAdequacy.approximations.map(item => `- ${item}`).join('\n')}

New primitives:
${report.languageAdequacy.newPrimitivesNeeded.map(item => `- ${item}`).join('\n')}

## Runtime Deviation Rows

| Group | Semantic role | RED path family | Runtime path family | Direct label | Object score | Human lower-field delta | Path ratio | Candidate focus |
| ---: | --- | --- | --- | --- | ---: | ---: | ---: | --- |
${rows}

## Evidence

- Description: \`${report.sourceDescription}\`
- Source window: \`${description.sourceReferenceWindow.sourceWindowId}\`
- Contact sheet: \`${description.sourceReferenceWindow.contactSheet}\`
- Focused sheet: \`${description.sourceReferenceWindow.focusedSheet}\`
- Object-track overlay: \`${description.sourceReferenceWindow.objectTrackOverlay}\`
`;
}

function main(){
  const description = buildDescription();
  const report = buildReport(description);
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(DESCRIPTION_PATH, description);
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report, description));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'latest.md'), buildMarkdown(report, description));
  console.log(JSON.stringify({
    ok: true,
    description: rel(DESCRIPTION_PATH),
    report: rel(path.join(OUT_ROOT, 'latest.json')),
    markdown: rel(path.join(OUT_ROOT, 'latest.md')),
    candidateTrialRecommendation: report.summary.candidateTrialRecommendation,
    readyForNonOverwritingCandidateTrialGate: report.summary.readyForNonOverwritingCandidateTrialGate,
    runtimeSourceCandidateAllowed: report.summary.runtimeSourceCandidateAllowed,
    languageAdequacyScore: report.languageAdequacy.adequacyScore
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
  process.exit(1);
}

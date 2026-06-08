#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-description', 'stage7-challenge2');
const DESCRIPTION_ROOT = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions');
const DESCRIPTION_PATH = path.join(DESCRIPTION_ROOT, 'aurora-stage7-challenge2-0.1.json');
const OBJECT_TRACKS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
const TARGET_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-target-contracts', 'aurora-challenge-contracts-0.1.json');
const SETPIECE_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-setpiece-contracts', 'latest.json');
const MOTION_SPEC = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-motion-spec', 'aurora-challenge-2-0.1.json');
const CHALLENGE_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');

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

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
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

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function average(values){
  const nums = values.filter(value => Number.isFinite(+value)).map(Number);
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : 0;
}

function closenessToTarget(value, target, tolerance){
  if(!Number.isFinite(+value) || !Number.isFinite(+target)) return 0;
  return clamp(1 - Math.abs(+value - +target) / Math.max(0.0001, +tolerance));
}

function sideCompatibility(value, expected){
  if(!value || !expected) return 0;
  const actual = String(value);
  const target = String(expected);
  if(actual === target) return 1;
  if(target.includes(actual) || actual.includes(target)) return 0.65;
  if(target === 'both-sides' && (actual === 'left' || actual === 'right' || actual === 'center')) return 0.65;
  return 0;
}

function compareTrackVector(vector, target){
  if(!vector || !target) return null;
  const xRange = closenessToTarget(vector.xRange, target.xRange, Math.max(0.12, (+target.xRange || 0.6) * 0.42));
  const yRange = closenessToTarget(vector.yRange, target.yRange, Math.max(0.1, (+target.yRange || 0.4) * 0.45));
  const pathLength = closenessToTarget(vector.pathLength, target.pathLength, Math.max(0.16, (+target.pathLength || 0.8) * 0.42));
  const turnCount = closenessToTarget(vector.turnCount, target.turnCount || 1, 2.1);
  const reversalCount = closenessToTarget(vector.reversalCount, target.reversalCount || 1, 2.2);
  const lowerFieldShare = closenessToTarget(vector.lowerFieldShare, target.lowerFieldShare || 0, 0.18);
  const visibleStart = closenessToTarget(vector.visibleStartS, target.visibleStartS, 0.95);
  const visibleEnd = closenessToTarget(vector.visibleEndS, target.visibleEndS, 1.35);
  const entrySide = sideCompatibility(vector.entrySide, target.entrySide);
  const exitSide = sideCompatibility(vector.exitSide, target.exitSide);
  const coverage = clamp(
    (0.14 * xRange)
    + (0.16 * yRange)
    + (0.18 * pathLength)
    + (0.12 * turnCount)
    + (0.08 * reversalCount)
    + (0.09 * lowerFieldShare)
    + (0.08 * visibleStart)
    + (0.07 * visibleEnd)
    + (0.04 * entrySide)
    + (0.04 * exitSide)
  );
  return {
    coverage: round(coverage, 3),
    score10: round(1 + coverage * 7.4, 1),
    components: {
      xRange: round(xRange, 3),
      yRange: round(yRange, 3),
      pathLength: round(pathLength, 3),
      turnCount: round(turnCount, 3),
      reversalCount: round(reversalCount, 3),
      lowerFieldShare: round(lowerFieldShare, 3),
      visibleStart: round(visibleStart, 3),
      visibleEnd: round(visibleEnd, 3),
      entrySide: round(entrySide, 3),
      exitSide: round(exitSide, 3)
    }
  };
}

function trackVector(track){
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

function resolvePathFamily(semantic, scheduled, motion, targetGroup){
  const semanticFamily = semantic.pathFamily || null;
  const objectTrackFamily = scheduled.pathFamily || null;
  const motionSpecFamily = motion.pathFamilyHint || null;
  const canonicalPathFamily = objectTrackFamily || motionSpecFamily || semanticFamily || null;
  const sourceAgreement = {
    semanticMatchesCanonical: semanticFamily && canonicalPathFamily ? semanticFamily === canonicalPathFamily : null,
    objectTrackMatchesCanonical: objectTrackFamily && canonicalPathFamily ? objectTrackFamily === canonicalPathFamily : null,
    motionSpecMatchesCanonical: motionSpecFamily && canonicalPathFamily ? motionSpecFamily === canonicalPathFamily : null,
    objectTrackMatchesMotionSpec: objectTrackFamily && motionSpecFamily ? objectTrackFamily === motionSpecFamily : null
  };
  let canonicalSource = 'semantic-contract';
  let reason = 'Only the first-pass semantic contract names a path family.';
  if(objectTrackFamily && motionSpecFamily && objectTrackFamily === motionSpecFamily){
    canonicalSource = 'object-track-and-motion-spec';
    reason = 'Measured object-track schedule agrees with the motion-spec seed; treat the older semantic label as legacy context when it differs.';
  }else if(objectTrackFamily){
    canonicalSource = 'object-track-schedule';
    reason = 'Measured object-track schedule is the newest source with per-group reference tracks.';
  }else if(motionSpecFamily){
    canonicalSource = 'motion-spec';
    reason = 'Motion spec is the newest executable source naming a path family.';
  }
  return {
    canonicalPathFamily,
    canonicalSource,
    reason,
    targetTrackConfidence: round(targetGroup.confidence ?? scheduled.targetTrackConfidence, 3),
    legacySemanticPathFamily: semanticFamily,
    objectTrackExecutionFamily: objectTrackFamily,
    motionSpecSeedFamily: motionSpecFamily,
    sourceAgreement
  };
}

function buildCandidateGate(groupIndex, canonicalPathFamily, aggregate, primaryVector, hasAggregatePrimaryTension){
  const primaryTrackIsTuningGate = hasAggregatePrimaryTension || groupIndex === 5;
  return {
    canonicalPathFamily,
    pathFamilyGate: 'runtime path family must match canonicalComparisonPathFamily before promotion',
    primaryObjectTrackFitFloorScore10: 5,
    aggregateObjectTrackFitFloorScore10: 5,
    maxAggregatePathLengthRatio: 3,
    maxPrimaryPathLengthRatio: 3,
    lowerFieldDeltaRange: [-0.25, 0.18],
    primaryTrackIsTuningGate,
    aggregateTrackIsGuardrail: true,
    tuningRead: primaryTrackIsTuningGate
      ? 'Tune against the primary object track first; use the aggregate group vector as a spacing/readability guardrail.'
      : 'Use aggregate and primary object-track fit together; neither should regress during promotion.',
    targetVector: {
      aggregatePathLength: round(aggregate.pathLength, 4),
      primaryPathLength: round(primaryVector?.pathLength, 4),
      aggregateLowerFieldShare: round(aggregate.lowerFieldShare, 4),
      primaryLowerFieldShare: round(primaryVector?.lowerFieldShare, 4)
    }
  };
}

function findChallenge2ObjectTracks(report){
  const challenges = report.challenges || report.challengeStages || [];
  const challenge = challenges.find(item => +item.challengeNumber === 2 || +item.stage === 7);
  if(!challenge) throw new Error('Missing Galaga Challenge 2 object-track row.');
  return challenge;
}

function findStage7Contract(report){
  const rows = report.challengeStages || report.stages || report.contracts || [];
  const row = rows.find(item => +item.stage === 7 || +item.challengeNumber === 2);
  if(!row) throw new Error('Missing Challenge 2 target contract row.');
  return row;
}

function findSetpieceStage7(report){
  const rows = report.contracts || [];
  const row = rows.find(item => +item.stage === 7 || +item.challengeNumber === 2);
  if(!row) throw new Error('Missing Stage 7 set-piece contract row.');
  return row;
}

function findConformanceStage7(report){
  const rows = report.stageRows || [];
  const row = rows.find(item => +item.stage === 7 || +item.challengeNumber === 2);
  if(!row) throw new Error('Missing Stage 7 challenge conformance row.');
  return row;
}

function buildDescription(){
  const objectTracks = findChallenge2ObjectTracks(readJson(OBJECT_TRACKS));
  const targetContract = findStage7Contract(readJson(TARGET_CONTRACTS));
  const setpiece = findSetpieceStage7(readJson(SETPIECE_CONTRACTS));
  const motionSpec = readJson(MOTION_SPEC);
  const motionGroups = motionSpec.spec?.groups || [];
  const candidateTracks = new Map((objectTracks.candidateTracks || []).map(track => [track.id, track]));
  const targetGroups = objectTracks.targetGroups || [];
  const semanticGroups = targetContract.groups || [];
  const schedule = setpiece.targetContract?.groupSchedule || [];
  const groups = targetGroups.map(targetGroup => {
    const index = +targetGroup.groupIndex;
    const semantic = semanticGroups.find(group => +group.groupIndex === index) || {};
    const scheduled = schedule.find(group => +group.groupIndex === index) || {};
    const motion = motionGroups.find(group => +group.groupIndex === index) || {};
    const primaryId = scheduled.referencePathId || motion.referencePath?.sourceTrackId || targetGroup.trackIds?.[0] || '';
    const primaryTrack = candidateTracks.get(primaryId) || null;
    const aggregate = targetGroup.objectTrackTarget || {};
    const primaryVector = trackVector(primaryTrack);
    const pathFamilyDecision = resolvePathFamily(semantic, scheduled, motion, targetGroup);
    const hasAggregatePrimaryTension = primaryVector && Math.abs((+primaryVector.xRange || 0) - (+aggregate.xRange || 0)) > 0.25;
    const notes = [];
    if(semantic.pathFamily && scheduled.pathFamily && semantic.pathFamily !== scheduled.pathFamily){
      notes.push(`legacy semantic path family ${semantic.pathFamily} differs from canonical comparison family ${pathFamilyDecision.canonicalPathFamily}`);
    }
    if(motion.pathFamilyHint && scheduled.pathFamily && motion.pathFamilyHint !== scheduled.pathFamily){
      notes.push(`motion-spec seed ${motion.pathFamilyHint} differs from object-track execution family ${scheduled.pathFamily}`);
    }
    if(hasAggregatePrimaryTension){
      notes.push('aggregate x-range is much wider than the primary object track; candidate tuning should not treat the aggregate as one object path');
    }
    return {
      groupIndex: index,
      phaseId: `challenge-2-group-${index}`,
      order: index,
      role: semantic.role || scheduled.controlIntent || motion.intent || '',
      semanticPathFamily: semantic.pathFamily || null,
      objectTrackExecutionFamily: scheduled.pathFamily || motion.pathFamilyHint || null,
      motionSpecSeedFamily: motion.pathFamilyHint || null,
      canonicalComparisonPathFamily: pathFamilyDecision.canonicalPathFamily,
      pathFamilyDecision,
      expectedTypes: semantic.expectedTypes || [],
      expectedFamilies: semantic.expectedFamilies || [],
      scoreWindowRead: semantic.scoreWindow || '',
      humanContractWindowS: semantic.targetVisibleS || null,
      objectTrackWindowS: [aggregate.visibleStartS, aggregate.visibleEndS].map(value => round(value, 2)),
      spawnOffsetS: round(scheduled.spawnOffsetS ?? motion.spawnOffsetS ?? aggregate.visibleStartS ?? 0, 2),
      primaryTargetTrackId: primaryId,
      targetTrackConfidence: round(targetGroup.confidence ?? scheduled.targetTrackConfidence, 3),
      sourceTrackIds: targetGroup.trackIds || [],
      aggregateObjectTrackTarget: {
        visibleStartS: round(aggregate.visibleStartS, 2),
        visibleEndS: round(aggregate.visibleEndS, 2),
        entrySide: aggregate.entrySide || null,
        exitSide: aggregate.exitSide || null,
        xRange: round(aggregate.xRange, 4),
        yRange: round(aggregate.yRange, 4),
        pathLength: round(aggregate.pathLength, 4),
        turnCount: round(aggregate.turnCount, 3),
        reversalCount: round(aggregate.reversalCount, 3),
        lowerFieldShare: round(aggregate.lowerFieldShare, 4)
      },
      primaryObjectTrackTarget: primaryVector,
      primaryTrackRelativePoints: primaryTrack ? relativePoints(primaryTrack) : [],
      candidateComparisonGate: buildCandidateGate(index, pathFamilyDecision.canonicalPathFamily, aggregate, primaryVector, hasAggregatePrimaryTension),
      comparisonAxes: [
        'phase-order',
        'semantic-path-family',
        'object-track-execution-family',
        'canonical-comparison-path-family',
        'aggregate-object-track-fit',
        'primary-object-track-fit',
        'lower-field-overstay',
        'scoreable-window',
        'spacing-readability',
        'challenge-safety'
      ],
      precisionNotes: notes
    };
  });
  const pathFamilyConflicts = groups.filter(group => group.semanticPathFamily && group.objectTrackExecutionFamily && group.semanticPathFamily !== group.objectTrackExecutionFamily);
  const aggregatePrimaryTensions = groups.filter(group => group.precisionNotes.some(note => note.includes('aggregate x-range')));
  const unresolvedPathFamilies = groups.filter(group => !group.canonicalComparisonPathFamily);
  return {
    schemaVersion: 1,
    artifactType: 'reference-execution-description',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 7,
      challengeNumber: 2,
      displayLabel: 'Stage 7 / Challenge 2',
      descriptionId: 'aurora-stage7-challenge2-0.1'
    },
    sourceReferenceWindow: {
      sourceVideo: objectTracks.sourceVideo,
      sourceWindowId: objectTracks.sourceWindow?.id || null,
      sourceId: objectTracks.sourceWindow?.sourceId || null,
      sourceStartSeconds: round(objectTracks.sourceStartSeconds, 2),
      durationSeconds: round(objectTracks.durationSeconds, 2),
      motionRead: objectTracks.sourceWindow?.motionRead || '',
      contactSheet: objectTracks.sourceWindow?.contactSheet || null,
      denseContactSheet: objectTracks.sourceWindow?.denseContactSheet || null,
      focusedSheet: objectTracks.sourceWindow?.focusedSheet || null,
      frameIndex: objectTracks.sourceWindow?.frameIndex || null
    },
    sourceArtifacts: {
      galagaChallengeObjectTracks: rel(OBJECT_TRACKS),
      challengeStageTargetContracts: rel(TARGET_CONTRACTS),
      challengeSetpieceContracts: rel(SETPIECE_CONTRACTS),
      challengeMotionSpec: rel(MOTION_SPEC),
      challengeStageConformance: rel(CHALLENGE_CONFORMANCE)
    },
    executionModel: {
      phaseOrder: groups.map(group => group.phaseId),
      groupCount: groups.length,
      targetCount: 40,
      playerMeaning: targetContract.targetRead || setpiece.runtimeRead?.currentRead || '',
      successRead: targetContract.successRead || '',
      safetyGuardrails: setpiece.targetContract?.safetyGuardrails || [
        'no enemy shots',
        'no enemy attack starts',
        'no ship losses',
        '40 targets presented as a bonus set piece'
      ],
      runtimeComparisonProtocol: {
        phaseOrder: 'Runtime group visible starts should follow the reference group order and stay within roughly 0.5s of each object-track window unless a candidate explicitly widens a score window.',
        pathFamily: 'Use canonicalComparisonPathFamily for candidate gates. Preserve semanticPathFamily and objectTrackExecutionFamily as inspectable source context so legacy label drift remains visible.',
        objectTrackFit: 'Compare each runtime group against both aggregate group object-track targets and the selected primary object track.',
        lowerFieldOverstay: 'Flag positive lower-field deltas above 0.18, and separately flag under-field deltas below -0.25 when the target expects a lower pass.',
        spacing: 'Use npm run harness:check:challenge-motion-profile for spacing and bunching risk after any runtime candidate.',
        scoreableWindows: 'Use shot-opportunity probes and group scoreWindowRead values; promotion requires clear multi-target lanes and no center-lane-only collapse.',
        safety: 'No enemy shots, no enemy attack starts, and no ship losses remain hard blockers.'
      }
    },
    groups,
    summary: {
      referenceBackedGroupCount: groups.filter(group => group.primaryTargetTrackId && group.primaryTrackRelativePoints.length >= 3).length,
      averageTargetConfidence: round(average(groups.map(group => group.targetTrackConfidence)), 3),
      semanticVsExecutionPathFamilyConflictCount: pathFamilyConflicts.length,
      unresolvedCanonicalPathFamilyCount: unresolvedPathFamilies.length,
      aggregateVsPrimaryTrackTensionCount: aggregatePrimaryTensions.length,
      read: 'Stage 7 / Challenge 2 now has a structured reference execution description with source window evidence, five ordered groups, legacy semantic path-family intent, canonical comparison path families, object-track execution targets, primary track points, comparison axes, and guardrails.'
    },
    keeperRules: {
      measurementKeeper: 'Useful if the artifact is stable, inspectable, and exposes deviations that make the next runtime candidate simpler.',
      runtimeKeeper: 'A runtime keeper must improve focused strict evidence, preserve no-shot/no-ship-loss safety, preserve scoreable routes, avoid spacing/readability regression, and include before/after visual evidence.',
      betaPolicy: 'This artifact is measurement-only and is not beta justification by itself.'
    }
  };
}

function groupRuntimeRead(description, conformanceRow){
  const targetFit = conformanceRow.strictAxisReads?.targetContractFit || {};
  const fits = new Map((targetFit.objectTrackFits || []).map(fit => [+fit.groupIndex, fit]));
  const signatures = new Map((conformanceRow.runtimeGroupSignatures || []).map(sig => [(+sig.group) + 1, sig]));
  return description.groups.map(group => {
    const fit = fits.get(+group.groupIndex) || {};
    const runtime = fit.runtime || {};
    const signature = signatures.get(+group.groupIndex) || {};
    const runtimePathFamily = runtime.pathFamily || signature.pathFamilies?.[0] || null;
    const primaryFit = compareTrackVector(runtime, group.primaryObjectTrackTarget);
    const aggregateTarget = group.aggregateObjectTrackTarget || {};
    const primaryTarget = group.primaryObjectTrackTarget || {};
    const semanticMatch = runtimePathFamily && group.semanticPathFamily ? runtimePathFamily === group.semanticPathFamily : null;
    const executionMatch = runtimePathFamily && group.objectTrackExecutionFamily ? runtimePathFamily === group.objectTrackExecutionFamily : null;
    const canonicalMatch = runtimePathFamily && group.canonicalComparisonPathFamily ? runtimePathFamily === group.canonicalComparisonPathFamily : null;
    const lowerFieldDelta = Number.isFinite(+runtime.lowerFieldShare) && Number.isFinite(+aggregateTarget.lowerFieldShare)
      ? round((+runtime.lowerFieldShare) - (+aggregateTarget.lowerFieldShare), 3)
      : null;
    const primaryLowerFieldDelta = Number.isFinite(+runtime.lowerFieldShare) && Number.isFinite(+primaryTarget.lowerFieldShare)
      ? round((+runtime.lowerFieldShare) - (+primaryTarget.lowerFieldShare), 3)
      : null;
    const pathLengthRatio = Number.isFinite(+runtime.pathLength) && +aggregateTarget.pathLength
      ? round((+runtime.pathLength) / (+aggregateTarget.pathLength), 2)
      : null;
    const primaryPathLengthRatio = Number.isFinite(+runtime.pathLength) && +primaryTarget.pathLength
      ? round((+runtime.pathLength) / (+primaryTarget.pathLength), 2)
      : null;
    const issues = [];
    const candidateFocus = [];
    const gate = group.candidateComparisonGate || {};
    if(canonicalMatch === false){
      issues.push('runtime misses canonical comparison path family');
    }
    if(group.semanticPathFamily !== group.objectTrackExecutionFamily){
      candidateFocus.push('legacy semantic label differs from canonical object-track execution family');
    }
    if(semanticMatch === false && executionMatch === true){
      candidateFocus.push('runtime follows canonical object-track family rather than legacy semantic label');
    }
    if((+fit.score10 || 0) < (gate.aggregateObjectTrackFitFloorScore10 || 5)) candidateFocus.push('raise aggregate object-track fit to first promotion floor');
    if(primaryFit && primaryFit.score10 < (gate.primaryObjectTrackFitFloorScore10 || 5)) candidateFocus.push('raise primary object-track fit to first promotion floor');
    if(lowerFieldDelta !== null && lowerFieldDelta > 0.18) candidateFocus.push('reduce lower-field overstay against aggregate target');
    if(lowerFieldDelta !== null && lowerFieldDelta < -0.25) candidateFocus.push('avoid lower-field undershoot against aggregate target');
    if(pathLengthRatio !== null && pathLengthRatio > (gate.maxAggregatePathLengthRatio || 3)) candidateFocus.push('reduce aggregate path-length ratio below first promotion floor');
    if(primaryPathLengthRatio !== null && primaryPathLengthRatio > (gate.maxPrimaryPathLengthRatio || 3)) candidateFocus.push('reduce primary path-length ratio below first promotion floor');
    return {
      groupIndex: group.groupIndex,
      runtimePathFamily,
      semanticPathFamily: group.semanticPathFamily,
      objectTrackExecutionFamily: group.objectTrackExecutionFamily,
      canonicalComparisonPathFamily: group.canonicalComparisonPathFamily,
      semanticPathFamilyMatch: semanticMatch,
      objectTrackExecutionFamilyMatch: executionMatch,
      canonicalComparisonPathFamilyMatch: canonicalMatch,
      aggregateObjectTrackScore10: fit.score10 ?? null,
      aggregateObjectTrackCoverage: fit.coverage ?? null,
      primaryObjectTrackScore10: primaryFit?.score10 ?? null,
      primaryObjectTrackCoverage: primaryFit?.coverage ?? null,
      runtimeVector: {
        visibleStartS: runtime.visibleStartS ?? null,
        visibleEndS: runtime.visibleEndS ?? null,
        xRange: runtime.xRange ?? null,
        yRange: runtime.yRange ?? null,
        pathLength: runtime.pathLength ?? null,
        turnCount: runtime.turnCount ?? null,
        reversalCount: runtime.reversalCount ?? null,
        lowerFieldShare: runtime.lowerFieldShare ?? null
      },
      deviations: {
        visibleStartDeltaS: Number.isFinite(+runtime.visibleStartS) ? round((+runtime.visibleStartS) - (+aggregateTarget.visibleStartS || 0), 2) : null,
        visibleEndDeltaS: Number.isFinite(+runtime.visibleEndS) ? round((+runtime.visibleEndS) - (+aggregateTarget.visibleEndS || 0), 2) : null,
        aggregatePathLengthRatio: pathLengthRatio,
        primaryPathLengthRatio,
        aggregateLowerFieldDelta: lowerFieldDelta,
        primaryLowerFieldDelta,
        aggregateYRangeDelta: Number.isFinite(+runtime.yRange) && Number.isFinite(+aggregateTarget.yRange) ? round((+runtime.yRange) - (+aggregateTarget.yRange), 3) : null
      },
      candidateGate: gate,
      candidateFocus,
      issues
    };
  });
}

function buildReport(description){
  const conformance = readJson(CHALLENGE_CONFORMANCE);
  const row = findConformanceStage7(conformance);
  const groupReads = groupRuntimeRead(description, row);
  const precisionBlockers = [];
  const unresolvedCanonical = description.groups.filter(group => !group.canonicalComparisonPathFamily);
  if(unresolvedCanonical.length > 0){
    precisionBlockers.push(`${unresolvedCanonical.length} group(s) do not have a canonical comparison path family.`);
  }
  const missingPrimaryTracks = description.groups.filter(group => !group.primaryTargetTrackId || !Array.isArray(group.primaryTrackRelativePoints) || group.primaryTrackRelativePoints.length < 3);
  if(missingPrimaryTracks.length > 0){
    precisionBlockers.push(`${missingPrimaryTracks.length} group(s) do not have enough primary-track points for direct candidate comparison.`);
  }
  const legacyResolutions = description.groups
    .filter(group => group.semanticPathFamily && group.objectTrackExecutionFamily && group.semanticPathFamily !== group.objectTrackExecutionFamily)
    .map(group => `Group ${group.groupIndex}: canonical ${group.canonicalComparisonPathFamily} from ${group.pathFamilyDecision?.canonicalSource}; legacy semantic label remains ${group.semanticPathFamily}.`);
  const primaryGateResolutions = description.groups
    .filter(group => group.candidateComparisonGate?.primaryTrackIsTuningGate)
    .map(group => `Group ${group.groupIndex}: primary track ${group.primaryTargetTrackId} is the candidate tuning gate; aggregate track remains a guardrail.`);
  const runtimePromotionBlockers = [];
  if((+row.targetVideoObjectTrackFitScore10 || 0) < 5) runtimePromotionBlockers.push(`Stage 7 target-video object-track fit is ${row.targetVideoObjectTrackFitScore10}/10, below the first promotion floor of 5.0/10.`);
  for(const read of groupReads){
    if(read.issues.length) runtimePromotionBlockers.push(`Group ${read.groupIndex}: ${read.issues.join('; ')}.`);
    if(read.candidateFocus.length) runtimePromotionBlockers.push(`Group ${read.groupIndex}: ${read.candidateFocus.join('; ')}.`);
  }
  const safety = row.safetyProbe || {};
  const shotOpportunity = row.shotOpportunityProbe || {};
  const candidateReadinessBlockers = [...precisionBlockers];
  if(!safety.noEnemyShots || !safety.noAttackStarts || !safety.noShipLosses){
    candidateReadinessBlockers.push('Current Stage 7 safety probe is not clean enough to begin a runtime candidate.');
  }
  if((+shotOpportunity.activeWindows || 0) < 1 || (+shotOpportunity.multiTargetWindowShare || 0) < 0.5){
    candidateReadinessBlockers.push('Current Stage 7 scoreable-window probe is too weak for a focused runtime candidate.');
  }
  const runtimeCandidateReady = candidateReadinessBlockers.length === 0;
  const runtimePromotionReady = runtimePromotionBlockers.length === 0 && runtimeCandidateReady;
  const recommendation = runtimeCandidateReady
    ? 'ready-for-one-measured-runtime-candidate'
    : 'reference-description-needs-precision-before-runtime-candidate';
  return {
    schemaVersion: 1,
    artifactType: 'reference-execution-description-analysis',
    generatedAt: new Date().toISOString(),
    commit: description.commit,
    branch: description.branch,
    releaseFamily: '1.4.1',
    gameKey: description.gameKey,
    scope: description.scope,
    sourceDescription: rel(DESCRIPTION_PATH),
    sourceArtifacts: description.sourceArtifacts,
    currentRuntimeRead: {
      challengeConformanceScore10: row.conformanceScore10,
      movementScore10: row.movementConformanceScore10,
      graphicsScore10: row.graphicalConformanceScore10,
      alienNoveltyScore10: row.alienNoveltyScore10,
      shotOpportunityScore10: row.playerShotOpportunityScore10,
      targetContractFitScore10: row.targetContractFitScore10,
      targetVideoObjectTrackFitScore10: row.targetVideoObjectTrackFitScore10,
      targetVideoObjectTrackCoverage: row.targetVideoObjectTrackCoverage,
      safety: row.safetyProbe || null,
      shotOpportunity: row.shotOpportunityProbe ? {
        score10: row.shotOpportunityProbe.score10,
        activeWindows: row.shotOpportunityProbe.activeWindows,
        multiTargetWindowShare: row.shotOpportunityProbe.multiTargetWindowShare,
        laneDiversity: row.shotOpportunityProbe.laneDiversity,
        centerBias: row.shotOpportunityProbe.centerBias,
        read: row.shotOpportunityProbe.read
      } : null
    },
    groupReads,
    comparisonProtocol: description.executionModel.runtimeComparisonProtocol,
    guardrailCommands: [
      'npm run harness:check:challenge-stage-conformance',
      'npm run harness:check:challenge-motion-profile',
      'npm run harness:check:challenge-outcomes',
      'npm run harness:check:sprite-render-mode-guard',
      'npm run harness:check:aurora-runtime-sprite-conformance'
    ],
    summary: {
      measurementKeeperRecommendation: 'accept-measurement-keeper',
      runtimeCandidateRecommendation: recommendation,
      runtimeCandidateReady,
      runtimePromotionReady,
      precisionBlockerCount: precisionBlockers.length,
      candidateReadinessBlockerCount: candidateReadinessBlockers.length,
      runtimePromotionBlockerCount: runtimePromotionBlockers.length,
      precisionBlockers,
      candidateReadinessBlockers,
      runtimePromotionBlockers,
      pathFamilyResolutions: legacyResolutions,
      primaryTrackGateResolutions: primaryGateResolutions,
      read: runtimeCandidateReady
        ? 'The Stage 7 execution description is precise enough for one measured runtime candidate; the current runtime is still not promotable without a player-visible improvement.'
        : 'The Stage 7 execution description is useful and repeatable, but it exposes target precision issues that should be resolved before the next runtime candidate.'
    },
    nextBestStep: runtimeCandidateReady
      ? 'Run one timing-aware Stage 7 candidate against this description, focused on groups 1, 4, and 5 path length/lower-field/late-loop shape, then produce before/after evidence and guardrail results.'
      : 'Resolve the remaining reference precision blockers before attempting another runtime keeper.'
  };
}

function buildMarkdown(report, description){
  const rows = report.groupReads.map(read => `| ${read.groupIndex} | ${read.semanticPathFamily || 'n/a'} | ${read.canonicalComparisonPathFamily || 'n/a'} | ${read.runtimePathFamily || 'n/a'} | ${read.aggregateObjectTrackScore10 ?? 'n/a'} | ${read.primaryObjectTrackScore10 ?? 'n/a'} | ${read.deviations.aggregatePathLengthRatio ?? 'n/a'} | ${read.deviations.aggregateLowerFieldDelta ?? 'n/a'} | ${read.candidateFocus.join('<br>') || read.issues.join('<br>') || 'none'} |`).join('\n');
  return `# Stage 7 Reference Execution Description Analysis

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Decision

Measurement keeper: ${report.summary.measurementKeeperRecommendation}

Runtime candidate recommendation: ${report.summary.runtimeCandidateRecommendation}

Runtime promotion ready: ${report.summary.runtimePromotionReady}

${report.summary.read}

## Runtime Deviation Rows

| Group | Legacy semantic family | Canonical family | Runtime family | Aggregate score | Primary score | Path ratio | Lower-field delta | Candidate focus |
| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
${rows}

## Path-Family Resolutions

${report.summary.pathFamilyResolutions.map(item => `- ${item}`).join('\n') || '- none'}

## Primary-Track Gates

${report.summary.primaryTrackGateResolutions.map(item => `- ${item}`).join('\n') || '- none'}

## Evidence

- Description: \`${report.sourceDescription}\`
- Source window: \`${description.sourceReferenceWindow.sourceWindowId}\`
- Contact sheet: \`${description.sourceReferenceWindow.contactSheet}\`
- Focused sheet: \`${description.sourceReferenceWindow.focusedSheet}\`
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
  writeText(path.join(OUT_ROOT, 'README.md'), buildMarkdown(report, description));
  console.log(JSON.stringify({
    ok: true,
    description: rel(DESCRIPTION_PATH),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    measurementKeeperRecommendation: report.summary.measurementKeeperRecommendation,
    runtimeCandidateRecommendation: report.summary.runtimeCandidateRecommendation,
    runtimeCandidateReady: report.summary.runtimeCandidateReady,
    precisionBlockerCount: report.summary.precisionBlockerCount,
    candidateReadinessBlockerCount: report.summary.candidateReadinessBlockerCount,
    runtimePromotionReady: report.summary.runtimePromotionReady,
    runtimePromotionBlockerCount: report.summary.runtimePromotionBlockerCount
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

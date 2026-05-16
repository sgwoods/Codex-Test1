#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-boss-path-slot-extraction');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-boss-path-family-comparison');
const REFERENCE_LABEL_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-labels');
const PROFILE_PATH = path.join(ROOT, 'tools', 'harness', 'reference-profiles', 'formation-boss-grammar-conformance.json');
const TRAJECTORY_VECTOR_FIELDS = ['xRange', 'yRange', 'pathLength', 'turnCount', 'reversalCount', 'lowerFieldShare', 'rackSlotError'];
const TRAJECTORY_VECTOR_WEIGHTS = {
  xRange: 0.18,
  yRange: 0.18,
  pathLength: 0.22,
  turnCount: 0.14,
  reversalCount: 0.1,
  lowerFieldShare: 0.1,
  rackSlotError: 0.08
};
const CHALLENGE_ARRIVAL_COMPARISON_SECONDS = 8.5;
const CHALLENGE_SEMANTIC_SCORE_WEIGHT = 0.22;

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectReports(root){
  const out = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(root){
  const reports = collectReports(root);
  return reports.length ? reports[reports.length - 1] : null;
}

function pointFeatures(track){
  const points = (track.points || []).filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y));
  if(points.length < 2){
    return {
      pointCount: points.length,
      durationS: 0,
      dx: 0,
      dy: 0,
      xRange: 0,
      yRange: 0,
      pathLength: track.pathLength || 0,
      turnCount: 0,
      reversalCount: 0,
      lowerFieldShare: 0,
      upperFieldShare: 0,
      slotError: null
    };
  }
  const xs = points.map(point => +point.x);
  const ys = points.map(point => +point.y);
  let pathLength = 0;
  let turnCount = 0;
  let reversalCount = 0;
  let lastHeading = null;
  let lastDxSign = 0;
  let minSlotError = Infinity;
  for(let i = 1; i < points.length; i += 1){
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    pathLength += Math.hypot(dx, dy);
    const heading = Math.atan2(dy, dx);
    if(lastHeading != null){
      const delta = Math.abs(Math.atan2(Math.sin(heading - lastHeading), Math.cos(heading - lastHeading)));
      if(delta > 0.65) turnCount += 1;
    }
    const dxSign = Math.sign(dx);
    if(dxSign && lastDxSign && dxSign !== lastDxSign) reversalCount += 1;
    if(dxSign) lastDxSign = dxSign;
    lastHeading = heading;
  }
  const last = points.at(-1);
  const targetX = Number.isFinite(+track.targetX) ? +track.targetX : null;
  const targetY = Number.isFinite(+track.targetY) ? +track.targetY : null;
  if(targetX != null && targetY != null){
    for(const point of points){
      minSlotError = Math.min(minSlotError, Math.hypot(point.x - targetX, point.y - targetY));
    }
  }
  return {
    pointCount: points.length,
    durationS: round((points.at(-1).t || 0) - (points[0].t || 0)),
    dx: round(xs.at(-1) - xs[0]),
    dy: round(ys.at(-1) - ys[0]),
    xRange: round(Math.max(...xs) - Math.min(...xs)),
    yRange: round(Math.max(...ys) - Math.min(...ys)),
    pathLength: round(pathLength || track.pathLength || 0),
    turnCount,
    reversalCount,
    lowerFieldShare: round(ys.filter(y => y >= 150).length / ys.length),
    upperFieldShare: round(ys.filter(y => y <= 90).length / ys.length),
    slotError: targetX == null || targetY == null || !Number.isFinite(minSlotError) ? null : round(minSlotError),
    finalSlotError: targetX == null || targetY == null ? null : round(Math.hypot(last.x - targetX, last.y - targetY))
  };
}

function comparisonFeatures(track){
  if(track.kind !== 'challenge' || !Array.isArray(track.points)) return pointFeatures(track);
  const firstT = Number.isFinite(+track.points[0]?.t) ? +track.points[0].t : 0;
  const firstLowerIndex = track.points.findIndex(point => Number.isFinite(+point.y) && +point.y >= 150);
  const upperArrivalPoints = firstLowerIndex > 3
    ? track.points.slice(0, firstLowerIndex)
    : track.points.filter(point => Number.isFinite(+point.y) && +point.y < 150);
  const arrivalPoints = upperArrivalPoints.filter(point => {
    const t = Number.isFinite(+point.t) ? +point.t : firstT;
    return t - firstT <= CHALLENGE_ARRIVAL_COMPARISON_SECONDS;
  });
  if(arrivalPoints.length < 4) return pointFeatures(track);
  return pointFeatures(Object.assign({}, track, { points: arrivalPoints }));
}

function classifyTrack(track){
  const features = pointFeatures(track);
  const comparison = comparisonFeatures(track);
  const families = [];
	  const slotObserved = !!(track.slotObserved || track.challengeSlotObserved);
	  if(track.kind === 'regular' && slotObserved) families.push('rack-slot-settle');
	  if(track.kind === 'regular' && features.pathLength > 90 && features.yRange > 35) families.push('entry-arc-to-rack');
	  if(track.kind === 'regular' && track.pathFamily && track.pathFamily !== 'classic-center-arc-entry') families.push(`entry-${track.pathFamily}`);
	  if(track.type === 'boss' && features.pathLength > 60) families.push('boss-entry-or-dive');
  if(track.type === 'boss' && features.turnCount >= 2) families.push('boss-looping-arc');
  if(track.escort && features.pathLength > 55) families.push('escort-paired-dive');
	  if(track.kind === 'challenge' && slotObserved) families.push('challenge-lane-wave');
	  if(track.kind === 'challenge' && features.pathLength > 70 && features.xRange > 20) families.push('challenge-sweeping-path');
	  if(track.kind === 'challenge' && track.pathFamily && track.pathFamily !== 'classic-lane-wave') families.push(`challenge-${track.pathFamily}`);
	  if(features.lowerFieldShare > 0.15 && features.yRange > 70) families.push('player-pressure-dive');
  return {
    id: track.id,
    kind: track.kind,
    type: track.type,
    lane: Number.isFinite(+track.lane) ? +track.lane : null,
    wave: Number.isFinite(+track.wave) ? +track.wave : null,
    visualFamily: track.family || null,
    pathFamily: track.pathFamily || null,
    stageFamily: null,
    families,
    features,
    comparisonFeatures: comparison,
    slotObserved
  };
}

function expectedFamilies(profile){
  const fromProfile = profile.referencePathFamilies || [];
  if(fromProfile.length) return fromProfile;
  return [
    { id: 'rack-slot-settle', label: 'Rack slot settle', target: 5 },
    { id: 'entry-arc-to-rack', label: 'Entry arc to rack', target: 5 },
    { id: 'boss-entry-or-dive', label: 'Boss entry or dive', target: 4 },
    { id: 'escort-paired-dive', label: 'Escort paired dive', target: 2 },
    { id: 'challenge-lane-wave', label: 'Challenge lane wave', target: 1 },
    { id: 'challenge-sweeping-path', label: 'Challenge sweeping path', target: 1 }
  ];
}

function familySummary(expected, classifications){
  return expected.map(family => {
    const matches = classifications.filter(item => item.families.includes(family.id));
    return {
      id: family.id,
      label: family.label,
      target: family.target,
      observed: matches.length,
      coverage: round(clamp(matches.length / Math.max(family.target || 1, 1))),
      examples: matches.slice(0, 6).map(match => match.id)
    };
  });
}

function referenceLabelSupport(profile){
  const reportPath = latestReport(REFERENCE_LABEL_ROOT);
  const minimumMeanConfidence = profile.thresholds?.minimumReferenceLabelConfidence || 0.72;
  const requiredRegularEntryCount = profile.thresholds?.targetRegularWindows || 6;
  const requiredChallengeEntryCount = profile.thresholds?.targetChallengeWindows || 4;
  const heuristicCap10 = profile.thresholds?.heuristicPathFamilyCap10 || 6.8;
  const labelBackedCap10 = profile.thresholds?.labelBackedPathFamilyCap10 || 8.2;
  const directTrackedCap10 = profile.thresholds?.directTrackedPathFamilyCap10 || 9.2;
  if(!reportPath){
    return {
      status: 'missing-reference-label-report',
      report: null,
      acceptedRegularEntryCount: 0,
      acceptedChallengeEntryCount: 0,
      acceptedLabelCount: 0,
      coverageScore10: 0,
      confidenceScore: 0,
      mediaEvidenceReady: false,
      labelBackedComparisonReady: false,
      cap10: heuristicCap10,
      capReason: 'heuristic-runtime-family-cap'
    };
  }
  const report = readJson(reportPath);
  const summary = report.summary || {};
  const acceptedLabels = report.acceptedLabels || [];
  const acceptedRegularEntryCount = +(summary.acceptedRegularEntryCount || 0);
  const acceptedChallengeEntryCount = +(summary.acceptedChallengeEntryCount || 0);
  const acceptedLabelCount = +(summary.acceptedLabelCount || acceptedLabels.length || 0);
  const confidenceScore = +(summary.confidenceScore || 0);
  const coverageScore10 = +(summary.coverageScore10 || 0);
  const mediaEvidenceCount = acceptedLabels.filter(label => {
    if(!label.sourceAnchorMediaEvidence || !label.sourceAnchor) return false;
    return fs.existsSync(path.join(ROOT, label.sourceAnchor));
  }).length;
  const mediaEvidenceReady = acceptedLabelCount > 0 && mediaEvidenceCount === acceptedLabelCount;
  const vectorLabels = acceptedLabels.filter(label => label.comparisonVector);
  const regularVectorLabelCount = vectorLabels.filter(label => label.kind === 'regularEntry').length;
  const challengeVectorLabelCount = vectorLabels.filter(label => label.kind === 'challengeEntry').length;
  const labelGateReady = !!summary.directReferenceReady
    && acceptedRegularEntryCount >= requiredRegularEntryCount
    && acceptedChallengeEntryCount >= requiredChallengeEntryCount
    && confidenceScore >= minimumMeanConfidence;
  const labelBackedComparisonReady = labelGateReady && mediaEvidenceReady;
  return {
    status: labelBackedComparisonReady ? 'media-backed-reference-label-gate-passed' : 'reference-label-gate-incomplete',
    report: rel(reportPath),
    acceptedRegularEntryCount,
    acceptedChallengeEntryCount,
    acceptedLabelCount,
    requiredRegularEntryCount,
    requiredChallengeEntryCount,
    confidenceScore: round(confidenceScore),
    minimumMeanConfidence,
    coverageScore10: round(coverageScore10, 1),
    mediaEvidenceCount,
    mediaEvidenceReady,
    vectorLabelCount: vectorLabels.length,
    regularVectorLabelCount,
    challengeVectorLabelCount,
    labelGateReady,
    labelBackedComparisonReady,
    cap10: labelBackedComparisonReady ? labelBackedCap10 : heuristicCap10,
    capReason: labelBackedComparisonReady ? 'media-backed-reference-label-cap' : 'heuristic-runtime-family-cap',
    futureCap10: directTrackedCap10,
    playerMeaning: labelBackedComparisonReady
      ? 'Aurora path families can now be judged against committed Galaga contact-sheet labels, but not yet against tracked reference trajectories or rack-slot coordinates.'
      : 'Aurora path families are still scored as heuristic runtime coverage until committed Galaga media labels pass the reference gate.'
  };
}

function normalizeRuntimeVector(features = {}){
  return {
    xRange: clamp((+features.xRange || 0) / 280),
    yRange: clamp((+features.yRange || 0) / 430),
    pathLength: clamp((+features.pathLength || 0) / 850),
    turnCount: clamp((+features.turnCount || 0) / 5),
    reversalCount: clamp((+features.reversalCount || 0) / 4),
    lowerFieldShare: clamp(+features.lowerFieldShare || 0),
    rackSlotError: features.slotError == null ? 0 : clamp((+features.slotError || 0) / 24)
  };
}

function normalizeReferenceVector(vector = {}){
  return {
    xRange: clamp(+vector.xRange || 0),
    yRange: clamp(+vector.yRange || 0),
    pathLength: clamp(+vector.pathLength || 0),
    turnCount: clamp((+vector.turnCount || 0) / 3),
    reversalCount: clamp((+vector.reversalCount || 0) / 2),
    lowerFieldShare: clamp(+vector.lowerFieldShare || 0),
    rackSlotError: clamp((+vector.rackSlotError || 0) / 24)
  };
}

function averageVector(vectors){
  const out = {};
  for(const field of TRAJECTORY_VECTOR_FIELDS){
    out[field] = round(average(vectors.map(vector => +vector[field]).filter(Number.isFinite)), 4);
  }
  return out;
}

function trajectoryDistance(a, b){
  let weighted = 0;
  let totalWeight = 0;
  for(const field of TRAJECTORY_VECTOR_FIELDS){
    const weight = TRAJECTORY_VECTOR_WEIGHTS[field] || 0;
    weighted += weight * (((+a[field] || 0) - (+b[field] || 0)) ** 2);
    totalWeight += weight;
  }
  return Math.sqrt(weighted / Math.max(totalWeight, 0.001));
}

function trajectoryScore(distance){
  return round(10 * (1 - clamp(distance / 0.6)), 1);
}

function share(count, total){
  return total ? count / total : 0;
}

function typeSummary(classifications){
  const challengeTracks = (classifications || []).filter(item => item.kind === 'challenge');
  const total = challengeTracks.length || 0;
  const counts = {};
  let leadBossCount = 0;
  const pathFamilies = new Set();
  const visualFamilies = new Set();
  for(const item of challengeTracks){
    counts[item.type] = (counts[item.type] || 0) + 1;
    if(item.type === 'boss' && (item.lane === 0 || item.lane === 4)) leadBossCount += 1;
    if(item.pathFamily) pathFamilies.add(item.pathFamily);
    if(item.visualFamily) visualFamilies.add(item.visualFamily);
  }
  return {
    total,
    typeCount: Object.keys(counts).length,
    beeShare: share(counts.bee || 0, total),
    butterflyShare: share(counts.but || 0, total),
    bossShare: share(counts.boss || 0, total),
    leadBossShare: share(leadBossCount, total),
    rogueShare: share(counts.rogue || 0, total),
    onlyBeeButterfly: total > 0 && Object.keys(counts).every(type => type === 'bee' || type === 'but'),
    hasNonClassicVisual: [...visualFamilies].some(family => family && family !== 'classic'),
    pathFamilies: [...pathFamilies],
    visualFamilies: [...visualFamilies],
    counts
  };
}

function challengeSemanticScore10(label, semantic){
  if(label.kind !== 'challengeEntry') return null;
  const family = label.entityFamily || '';
  if(family === 'bee-line'){
    const linePurity = semantic.onlyBeeButterfly ? 1 : 0.35;
    const beePresence = clamp(semantic.beeShare / 0.45);
    const noBoss = semantic.bossShare === 0 ? 1 : 0.25;
    return round((0.45 * linePurity + 0.35 * beePresence + 0.2 * noBoss) * 10, 1);
  }
  if(family === 'butterfly-line'){
    const linePurity = semantic.onlyBeeButterfly ? 1 : 0.35;
    const butterflyPresence = clamp(semantic.butterflyShare / 0.45);
    const noBoss = semantic.bossShare === 0 ? 1 : 0.25;
    return round((0.45 * linePurity + 0.35 * butterflyPresence + 0.2 * noBoss) * 10, 1);
  }
  if(family === 'mixed-novelty-line'){
    const mix = clamp(semantic.typeCount / 4);
    const moderateBoss = semantic.bossShare > 0 && semantic.bossShare <= 0.28 ? 1 : 0.45;
    const crossOrClassic = semantic.pathFamilies.includes('cross-sweep') || !semantic.hasNonClassicVisual ? 1 : 0.2;
    const nonLeadBoss = semantic.leadBossShare === 0 ? 1 : 0.35;
    return round((0.45 * mix + 0.2 * moderateBoss + 0.25 * crossOrClassic + 0.1 * nonLeadBoss) * 10, 1);
  }
  if(family === 'boss-led-novelty-line'){
    const bossShare = clamp(semantic.bossShare / 0.25);
    const leadBoss = clamp(semantic.leadBossShare / 0.25);
    const novelty = semantic.hasNonClassicVisual || semantic.pathFamilies.some(path => path === 'hook-arc' || path === 'boss-led-loop') ? 1 : 0.35;
    const mix = clamp(semantic.typeCount / 4);
    return round((0.32 * bossShare + 0.3 * leadBoss + 0.28 * novelty + 0.1 * mix) * 10, 1);
  }
  return 5;
}

function combinedTrajectorySemanticScore(trajectoryScore10, semanticScore10){
  if(!Number.isFinite(+semanticScore10)) return trajectoryScore10;
  return round((1 - CHALLENGE_SEMANTIC_SCORE_WEIGHT) * trajectoryScore10 + CHALLENGE_SEMANTIC_SCORE_WEIGHT * semanticScore10, 1);
}

function referenceTrajectoryComparison(profile, windows){
  const reportPath = latestReport(REFERENCE_LABEL_ROOT);
  if(!reportPath){
    return {
      status: 'missing-reference-label-report',
      ready: false,
      score10: 0,
      capLiftReady: false,
      reason: 'No Galaga path reference label report is available.'
    };
  }
  const labelReport = readJson(reportPath);
  const acceptedLabels = (labelReport.acceptedLabels || []).filter(label => label.comparisonVector);
  const regularLabels = acceptedLabels.filter(label => label.kind === 'regularEntry');
  const challengeLabels = acceptedLabels.filter(label => label.kind === 'challengeEntry');
  const runtimeWindows = windows.map(window => {
    const normalized = (window.classifications || [])
      .map(item => normalizeRuntimeVector(item.comparisonFeatures || item.features || {}));
    return {
      windowId: window.windowId,
      stage: window.stage,
      challenge: !!window.challenge,
      vector: averageVector(normalized),
      semantic: typeSummary(window.classifications || []),
      slotCoverage: window.classifications?.length
        ? round(window.classifications.filter(item => item.slotObserved).length / window.classifications.length)
        : 0
    };
  });
  const matches = runtimeWindows.map(window => {
    const candidates = (window.challenge ? challengeLabels : regularLabels)
      .map(label => {
        const distance = trajectoryDistance(window.vector, normalizeReferenceVector(label.comparisonVector));
        const trajectoryScore10 = trajectoryScore(distance);
        const semanticScore10 = window.challenge ? challengeSemanticScore10(label, window.semantic) : null;
        return {
          labelId: label.labelId,
          kind: label.kind,
          entityFamily: label.entityFamily,
          entryCurveFamily: label.entryCurveFamily || null,
          sourceAnchor: label.sourceAnchor,
          distance: round(distance),
          trajectoryScore10,
          semanticScore10,
          score10: combinedTrajectorySemanticScore(trajectoryScore10, semanticScore10)
        };
      })
      .sort((a, b) => b.score10 - a.score10 || a.distance - b.distance || a.labelId.localeCompare(b.labelId));
    return {
      windowId: window.windowId,
      stage: window.stage,
      challenge: window.challenge,
      runtimeVector: window.vector,
      runtimeSemantic: window.semantic,
      slotCoverage: window.slotCoverage,
      bestMatch: candidates[0] || null,
      alternatives: candidates.slice(1, 4)
    };
  });
  const bestScores = matches.map(match => +(match.bestMatch?.score10 ?? NaN)).filter(Number.isFinite);
  const matchedLabelIds = new Set(matches.map(match => match.bestMatch?.labelId).filter(Boolean));
  const referenceCoverage = acceptedLabels.length ? matchedLabelIds.size / acceptedLabels.length : 0;
  const slotCoverage = average(runtimeWindows.map(window => window.slotCoverage));
  const meanBestScore10 = average(bestScores);
  const minBestScore10 = bestScores.length ? Math.min(...bestScores) : 0;
  const score10 = round((0.48 * meanBestScore10) + (0.18 * minBestScore10) + (0.2 * referenceCoverage * 10) + (0.14 * slotCoverage * 10), 1);
  const requiredRegular = profile.thresholds?.targetRegularWindows || 6;
  const requiredChallenge = profile.thresholds?.targetChallengeWindows || 4;
  const minimumTrajectoryScore10 = profile.thresholds?.minimumReferenceTrajectoryScore10 || 7.4;
  const ready = regularLabels.length >= requiredRegular && challengeLabels.length >= requiredChallenge && runtimeWindows.length >= 10;
  const capLiftReady = ready && score10 >= minimumTrajectoryScore10 && minBestScore10 >= 5.5 && slotCoverage >= 0.9;
  return {
    status: capLiftReady
      ? 'reference-trajectory-vector-cap-ready'
      : ready
        ? 'reference-trajectory-vector-comparison-active-no-cap-lift'
        : 'reference-trajectory-vector-comparison-incomplete',
    ready,
    report: rel(reportPath),
    regularVectorLabelCount: regularLabels.length,
    challengeVectorLabelCount: challengeLabels.length,
    runtimeWindowCount: runtimeWindows.length,
    referenceCoverage: round(referenceCoverage),
    slotCoverage: round(slotCoverage),
    meanBestScore10: round(meanBestScore10, 1),
    minBestScore10: round(minBestScore10, 1),
    score10,
    minimumTrajectoryScore10,
    capLiftReady,
    capReason: capLiftReady ? 'reference-trajectory-vector-rack-slot-cap' : 'media-backed-reference-label-cap',
    playerMeaning: capLiftReady
      ? 'Aurora runtime trajectories and rack settlement are close enough to comparison-vector Galaga labels to lift the broad label cap.'
      : 'Aurora now has an active vector/rack comparison, but the paths are not yet close enough to Galaga reference vectors to lift the broad label-backed cap.',
    matches
  };
}

function windowSummary(window){
  const classifications = (window.tracks || []).map(classifyTrack);
  const families = new Set(classifications.flatMap(item => item.families));
  return {
    windowId: window.windowId,
    stage: window.stage,
    challenge: !!window.challenge,
    trackCount: window.trackCount,
    classifiedTrackCount: classifications.filter(item => item.families.length).length,
    familyCount: families.size,
    families: [...families].sort(),
    classifications
  };
}

function scoreSummary(profile, sourceReport, windows, referenceSupport, trajectoryComparison){
  const expected = expectedFamilies(profile);
  const classifications = windows.flatMap(window => window.classifications);
  const families = familySummary(expected, classifications);
  const expectedCoverage = average(families.map(family => family.coverage));
  const windowFamilyCoverage = windows.length ? windows.filter(window => window.familyCount >= (window.challenge ? 2 : 3)).length / windows.length : 0;
  const bossCoverage = classifications.some(item => item.families.includes('boss-entry-or-dive')) ? 1 : 0;
  const escortCoverage = classifications.some(item => item.families.includes('escort-paired-dive')) ? 1 : 0;
  const challengeCoverage = classifications.some(item => item.families.includes('challenge-sweeping-path')) ? 1 : 0;
  const slotCoverage = classifications.length ? classifications.filter(item => item.slotObserved).length / classifications.length : 0;
  const meanTurnScore = average(classifications.map(item => clamp(item.features.turnCount / 3)));
  const scoreBeforeCap10 = round(10 * (
    (0.34 * expectedCoverage)
    + (0.2 * windowFamilyCoverage)
    + (0.12 * bossCoverage)
    + (0.1 * escortCoverage)
    + (0.1 * challengeCoverage)
    + (0.09 * slotCoverage)
    + (0.05 * meanTurnScore)
  ), 1);
  const referenceComparisonCap10 = trajectoryComparison.capLiftReady
    ? (referenceSupport.futureCap10 || profile.thresholds?.directTrackedPathFamilyCap10 || 9.2)
    : (referenceSupport.cap10 || profile.thresholds?.heuristicPathFamilyCap10 || 6.8);
  const comparisonConfidence = referenceSupport.labelBackedComparisonReady
    ? round(average([0.64, referenceSupport.confidenceScore, clamp(referenceSupport.coverageScore10 / 10)]), 2)
    : 0.64;
  return {
    sourceReport: rel(sourceReport),
    windowCount: windows.length,
    classifiedTrackCount: classifications.filter(item => item.families.length).length,
    totalTrackCount: classifications.length,
    expectedFamilyCoverage: round(expectedCoverage),
    windowFamilyCoverage: round(windowFamilyCoverage),
    bossCoverage,
    escortCoverage,
    challengeCoverage,
    slotCoverage: round(slotCoverage),
    meanTurnScore: round(meanTurnScore),
    scoreBeforeCap10,
    referenceComparisonCap10,
    referenceComparisonCapReason: trajectoryComparison.capLiftReady ? trajectoryComparison.capReason : referenceSupport.capReason,
    score10: round(Math.min(scoreBeforeCap10, referenceComparisonCap10), 1),
    comparisonConfidence,
    referenceLabelSupport: referenceSupport,
    referenceTrajectoryComparison: trajectoryComparison,
    topProblem: scoreBeforeCap10 >= referenceComparisonCap10
      ? (trajectoryComparison.capLiftReady
        ? 'Reference trajectory vectors and rack-slot comparison are active; the remaining gap is gameplay tuning against the weakest matched reference paths.'
        : referenceSupport.labelBackedComparisonReady
        ? 'Media-backed Galaga path labels now lift the heuristic cap; the remaining gap is direct tracked trajectory comparison and regular-stage geometry separation.'
        : 'Heuristic path-family coverage is available; the remaining gap is frame-labeled Galaga reference path comparison.')
      : 'At least one expected boss, escort, rack, or challenge path family is missing from the current Aurora extraction.',
    strategy: trajectoryComparison.ready
      ? 'Use the active trajectory-vector/rack-slot comparison to select the weakest Aurora windows before making gameplay changes; only lift beyond the label-backed cap when the vector score passes the gate.'
      : referenceSupport.labelBackedComparisonReady
      ? 'Use media-backed Galaga path labels to score broad reference readiness now, then add tracked reference trajectories and rack-slot coordinates before claiming near-perfect path conformance.'
      : 'Use classified runtime path families to rank gameplay gaps now, then add labeled Galaga path families to replace heuristic coverage with direct visual conformance.',
    successMeasure: referenceSupport.labelBackedComparisonReady
      ? `Raise path-family score beyond the label-backed cap (${referenceSupport.cap10}/10) only after reference trajectories are tracked against Aurora paths, not just labeled by contact-sheet family. Current trajectory-vector score is ${trajectoryComparison.score10}/10.`
      : 'Raise path-family score above the heuristic cap only after reference contact sheets or video-derived path labels can compare boss, escort, rack, and challenge trajectories directly.'
  };
}

function buildReport(){
  const profile = readJson(PROFILE_PATH);
  const sourceReport = latestReport(SOURCE_ROOT);
  if(!sourceReport) throw new Error('No formation-boss path-slot extraction report found. Run npm run harness:extract:formation-boss-path-slots first.');
  const source = readJson(sourceReport);
  const windows = (source.windows || []).map(windowSummary);
  const referenceSupport = referenceLabelSupport(profile);
  const trajectoryComparison = referenceTrajectoryComparison(profile, windows);
  const summary = scoreSummary(profile, sourceReport, windows, referenceSupport, trajectoryComparison);
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    artifactType: 'formation-boss-path-family-comparison',
    profile: rel(PROFILE_PATH),
    summary,
    families: familySummary(expectedFamilies(profile), windows.flatMap(window => window.classifications)),
    windows,
    problem: 'Boss and formation conformance needs not just path capture, but a reusable grammar that distinguishes rack-settle, boss, escort, pressure-dive, and challenge-stage path families.',
    plan: 'Classify extracted runtime paths into Galaga-like reference families, score coverage with a confidence/cap penalty, and use the result to select future reference-labeling or gameplay-tuning investments.',
    successMeasure: summary.successMeasure
  };
  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  const lines = [
    '# Formation Boss Path Family Comparison',
    '',
    'This artifact classifies extracted Aurora boss, escort, rack-settle, and challenge-stage trajectories into reusable path families.',
    '',
    `- Score: ${summary.score10}/10`,
    `- Score before cap: ${summary.scoreBeforeCap10}/10`,
    `- Reference comparison cap: ${summary.referenceComparisonCap10}/10`,
    `- Reference cap reason: ${summary.referenceComparisonCapReason}`,
    `- Confidence: ${summary.comparisonConfidence}`,
    `- Classified tracks: ${summary.classifiedTrackCount}/${summary.totalTrackCount}`,
    `- Expected family coverage: ${summary.expectedFamilyCoverage}`,
    `- Reference labels: ${summary.referenceLabelSupport.acceptedRegularEntryCount} regular / ${summary.referenceLabelSupport.acceptedChallengeEntryCount} challenge`,
    `- Trajectory-vector comparison: ${summary.referenceTrajectoryComparison.score10}/10 (${summary.referenceTrajectoryComparison.status})`,
    '',
    `Problem: ${report.problem}`,
    '',
    `Plan: ${report.plan}`,
    '',
    `Success: ${report.successMeasure}`,
    '',
    '## Families',
    '',
    '| Family | Target | Observed | Coverage | Examples |',
    '| --- | ---: | ---: | ---: | --- |'
  ];
  for(const family of report.families){
    lines.push(`| ${family.label} | ${family.target} | ${family.observed} | ${family.coverage} | ${family.examples.join(', ')} |`);
  }
  lines.push('');
  lines.push('## Windows');
  lines.push('');
  lines.push('| Window | Stage | Families | Classified Tracks |');
  lines.push('| --- | ---: | --- | ---: |');
  for(const window of windows){
    lines.push(`| ${window.windowId} | ${window.stage} | ${window.families.join(', ')} | ${window.classifiedTrackCount}/${window.trackCount} |`);
  }
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  return { ok: true, outDir, score10: summary.score10, topProblem: summary.topProblem };
}

if(require.main === module){
  console.log(JSON.stringify(buildReport(), null, 2));
}

module.exports = { buildReport };

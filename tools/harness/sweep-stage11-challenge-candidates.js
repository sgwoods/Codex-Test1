#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep');
const LABELS_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-labels', 'latest.json');
const TARGET_TRACKS_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}
const STAGE = Number(argValue('stage', '11'));
const EXPECTED_LABELS_BY_STAGE = {
  3: ['challenge-1-arrival-group-1', 'challenge-1-late-wave-group-4'],
  7: ['challenge-2-arrival-group-1'],
  11: ['challenge-3-arrival-group-1'],
  15: [
    'challenge-4-pink-serpentine-group-1',
    'challenge-4-pink-serpentine-group-2',
    'challenge-4-pink-serpentine-group-3',
    'challenge-4-pink-serpentine-group-4',
    'challenge-4-pink-serpentine-group-5'
  ],
  19: [
    'challenge-5-pink-green-cascade-group-1',
    'challenge-5-pink-green-cascade-group-2',
    'challenge-5-pink-green-cascade-group-3',
    'challenge-5-pink-green-cascade-group-4',
    'challenge-5-pink-green-cascade-group-5'
  ],
  23: [
    'challenge-6-green-ladder-split-group-1',
    'challenge-6-green-ladder-split-group-2',
    'challenge-6-green-ladder-split-group-3',
    'challenge-6-green-ladder-split-group-4',
    'challenge-6-green-ladder-split-group-5'
  ],
  27: [
    'challenge-7-yellow-diagonal-fan-group-1',
    'challenge-7-yellow-diagonal-fan-group-2',
    'challenge-7-yellow-diagonal-fan-group-3',
    'challenge-7-yellow-diagonal-fan-group-4',
    'challenge-7-yellow-diagonal-fan-group-5'
  ],
  31: [
    'challenge-8-blue-purple-finale-group-1',
    'challenge-8-blue-purple-finale-group-2',
    'challenge-8-blue-purple-finale-group-3',
    'challenge-8-blue-purple-finale-group-4',
    'challenge-8-blue-purple-finale-group-5'
  ]
};
const EXPECTED_LABELS = (argValue('expected-labels') || '').split(',').map(item => item.trim()).filter(Boolean).length
  ? (argValue('expected-labels') || '').split(',').map(item => item.trim()).filter(Boolean)
  : (EXPECTED_LABELS_BY_STAGE[STAGE] || ['challenge-3-arrival-group-1']);
const EXPECTED_LABEL = EXPECTED_LABELS[0];
const SAMPLE_TIMES = Array.from({ length: 65 }, (_, index) => +(index * 0.25).toFixed(2));
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
const CHALLENGE_SEMANTIC_SCORE_WEIGHT = 0.22;

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
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

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
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
      pathLength: 0,
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
  return {
    pointCount: points.length,
    durationS: round((points.at(-1).t || 0) - (points[0].t || 0)),
    dx: round(xs.at(-1) - xs[0]),
    dy: round(ys.at(-1) - ys[0]),
    xRange: round(Math.max(...xs) - Math.min(...xs)),
    yRange: round(Math.max(...ys) - Math.min(...ys)),
    pathLength: round(pathLength),
    turnCount,
    reversalCount,
    lowerFieldShare: round(ys.filter(y => y >= 150).length / ys.length),
    upperFieldShare: round(ys.filter(y => y <= 90).length / ys.length),
    slotError: null
  };
}

function comparisonFeatures(track){
  const points = Array.isArray(track.points) ? track.points : [];
  if(points.length < 4) return pointFeatures(track);
  const firstT = Number.isFinite(+points[0]?.t) ? +points[0].t : 0;
  const firstLowerIndex = points.findIndex(point => Number.isFinite(+point.y) && +point.y >= 150);
  const upperArrivalPoints = firstLowerIndex > 3
    ? points.slice(0, firstLowerIndex)
    : points.filter(point => Number.isFinite(+point.y) && +point.y < 150);
  const arrivalPoints = upperArrivalPoints.filter(point => {
    const t = Number.isFinite(+point.t) ? +point.t : firstT;
    return t - firstT <= 8.5;
  });
  if(arrivalPoints.length < 4) return pointFeatures(track);
  return pointFeatures(Object.assign({}, track, { points: arrivalPoints }));
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

function closenessToTarget(value, target, tolerance){
  if(!Number.isFinite(+value) || !Number.isFinite(+target)) return 0;
  return clamp(1 - Math.abs(+value - +target) / Math.max(0.001, tolerance));
}

function sideForX(x){
  const value = Number.isFinite(+x) ? +x : 140;
  if(value < 280 * 0.34) return 'left';
  if(value > 280 * 0.66) return 'right';
  return 'center';
}

function sideCompatibility(actual, expected){
  const a = String(actual || '').toLowerCase();
  const e = String(expected || '').toLowerCase();
  if(!a || !e) return 0;
  if(e.includes('both') || e.includes('side')) return a === 'left' || a === 'right' ? 1 : 0.65;
  if(e.includes('opposite') || e.includes('lower')) return a === 'left' || a === 'right' ? 1 : 0.5;
  if(e.includes(a)) return 1;
  return e.includes('center') && a === 'center' ? 1 : 0;
}

function vectorForMeasuredTrack(track){
  const points = (track.points || []).filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y));
  if(!points.length) return null;
  const xs = points.map(point => +point.x);
  const ys = points.map(point => +point.y);
  let pathPixels = 0;
  let turnCount = 0;
  let reversalCount = 0;
  let previousHeading = null;
  let previousDxSign = 0;
  for(let i = 1; i < points.length; i += 1){
    const a = points[i - 1];
    const b = points[i];
    const dx = +b.x - +a.x;
    const dy = +b.y - +a.y;
    pathPixels += Math.hypot(dx, dy);
    const heading = Math.atan2(dy, dx);
    if(previousHeading !== null){
      const delta = Math.abs(Math.atan2(Math.sin(heading - previousHeading), Math.cos(heading - previousHeading)));
      if(delta > 0.65) turnCount += 1;
    }
    const dxSign = Math.sign(dx);
    if(dxSign && previousDxSign && dxSign !== previousDxSign) reversalCount += 1;
    if(dxSign) previousDxSign = dxSign;
    previousHeading = heading;
  }
  const first = points[0];
  const last = points[points.length - 1];
  return {
    sampleCount: points.length,
    visibleStartS: round(first.t, 2),
    visibleEndS: round(last.t, 2),
    entrySide: sideForX(first.x),
    exitSide: sideForX(last.x),
    xRange: (Math.max(...xs) - Math.min(...xs)) / 280,
    yRange: (Math.max(...ys) - Math.min(...ys)) / 360,
    pathLength: pathPixels / 360,
    turnCount,
    reversalCount,
    lowerFieldShare: ys.filter(y => y > 180).length / Math.max(1, ys.length)
  };
}

function compareToObjectTrackTarget(vector, targetGroup){
  const target = targetGroup?.objectTrackTarget || null;
  if(!vector || !target) return null;
  const xRange = closenessToTarget(vector.xRange, target.xRange, Math.max(0.12, (+target.xRange || 0.6) * 0.42));
  const yRange = closenessToTarget(vector.yRange, target.yRange, Math.max(0.1, (+target.yRange || 0.4) * 0.45));
  const pathLength = closenessToTarget(vector.pathLength, target.pathLength, Math.max(0.16, (+target.pathLength || 0.8) * 0.42));
  const turnCount = closenessToTarget(vector.turnCount, target.turnCount || 1, 2.1);
  const reversalCount = closenessToTarget(vector.reversalCount, target.reversalCount || 1, 2.2);
  const lowerFieldShare = closenessToTarget(vector.lowerFieldShare, target.lowerFieldShare || 0, 0.18);
  const visibleStart = closenessToTarget(vector.visibleStartS, target.visibleStartS, 0.95);
  const visibleEnd = closenessToTarget(vector.visibleEndS, target.visibleEndS, 1.35);
  const entrySide = sideCompatibility(vector.entrySide, target.entrySide || targetGroup.entrySide);
  const exitSide = sideCompatibility(vector.exitSide, target.exitSide || targetGroup.exitSide);
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
    groupIndex: targetGroup.groupIndex,
    coverage: round(coverage, 3),
    score10: round(1 + coverage * 7.4, 1),
    runtime: vector,
    target,
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

function targetVideoObjectFit(measured){
  const artifact = readJson(TARGET_TRACKS_PATH, {});
  const challengeNumber = STAGE >= 3 ? Math.floor((STAGE - 3) / 4) + 1 : null;
  const targetChallenge = (artifact.challenges || []).find(item => +item.challengeNumber === +challengeNumber);
  const targetGroups = Array.isArray(targetChallenge?.targetGroups) ? targetChallenge.targetGroups : [];
  if(!targetGroups.length){
    return {
      score10: null,
      coverage: 0,
      groupCount: 0,
      read: 'No target-video object tracks available for this candidate stage.'
    };
  }
  const trackVectors = (measured.tracks || []).map(track => {
    const vector = vectorForMeasuredTrack(track);
    return vector ? Object.assign({
      id: track.id,
      wave: track.wave,
      lane: track.lane,
      type: track.type,
      visualFamily: track.visualFamily,
      pathFamily: track.pathFamily
    }, vector) : null;
  }).filter(Boolean);
  const groupFits = targetGroups.map((targetGroup, index) => {
    const candidates = trackVectors
      .filter(vector => +vector.wave === index)
      .map(vector => compareToObjectTrackTarget(vector, targetGroup))
      .filter(Boolean)
      .sort((a, b) => b.coverage - a.coverage || b.score10 - a.score10);
    return candidates[0] || null;
  }).filter(Boolean);
  const coverage = groupFits.length ? average(groupFits.map(item => item.coverage)) : 0;
  return {
    score10: groupFits.length ? round(1 + coverage * 7.4, 1) : null,
    coverage: round(coverage, 3),
    groupCount: groupFits.length,
    targetGroupCount: targetGroups.length,
    groupFits,
    read: groupFits.length
      ? `Candidate target-video object-track fit ${round(1 + coverage * 7.4, 1)}/10 across ${groupFits.length}/${targetGroups.length} group(s).`
      : 'Candidate produced no comparable group object tracks.'
  };
}

function share(count, total){
  return total ? count / total : 0;
}

function typeSummary(classifications){
  const total = classifications.length || 0;
  const counts = {};
  let leadBossCount = 0;
  const pathFamilies = new Set();
  const visualFamilies = new Set();
  for(const item of classifications){
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
  if(family === 'pink-serpentine-specialty'){
    const path = semantic.pathFamilies.includes('pink-serpentine') ? 1 : 0.2;
    const specialtyVisual = semantic.visualFamilies.some(item => ['galboss', 'dragonfly', 'crown'].includes(item)) ? 1 : 0.35;
    const mix = clamp(semantic.typeCount / 4);
    return round((0.44 * path + 0.34 * specialtyVisual + 0.22 * mix) * 10, 1);
  }
  if(family === 'pink-green-cascade'){
    const cascade = semantic.pathFamilies.includes('pink-green-cascade') ? 1 : 0.2;
    const alternation = semantic.pathFamilies.includes('green-ladder-split') || semantic.visualFamilies.length >= 2 ? 1 : 0.42;
    const mix = clamp(semantic.typeCount / 4);
    return round((0.42 * cascade + 0.34 * alternation + 0.24 * mix) * 10, 1);
  }
  if(family === 'green-ladder-split'){
    const ladder = semantic.pathFamilies.includes('green-ladder-split') ? 1 : 0.18;
    const greenNovelty = semantic.visualFamilies.some(item => ['dragonfly', 'mosquito'].includes(item)) ? 1 : 0.38;
    const mix = clamp(semantic.typeCount / 4);
    return round((0.48 * ladder + 0.32 * greenNovelty + 0.2 * mix) * 10, 1);
  }
  if(family === 'yellow-diagonal-fan'){
    const fan = semantic.pathFamilies.includes('yellow-diagonal-fan') ? 1 : 0.16;
    const crown = semantic.visualFamilies.includes('crown') ? 1 : 0.35;
    const mix = clamp(semantic.typeCount / 4);
    return round((0.52 * fan + 0.28 * crown + 0.2 * mix) * 10, 1);
  }
  if(family === 'blue-purple-finale-cluster'){
    const finalePath = semantic.pathFamilies.some(path => ['blue-purple-finale', 'yellow-diagonal-fan', 'green-ladder-split'].includes(path)) ? 1 : 0.24;
    const lateVisual = semantic.visualFamilies.some(item => ['stingray', 'mosquito', 'galboss'].includes(item)) ? 1 : 0.4;
    const mix = clamp(semantic.typeCount / 4);
    return round((0.42 * finalePath + 0.34 * lateVisual + 0.24 * mix) * 10, 1);
  }
  return 5;
}

function combinedTrajectorySemanticScore(trajectoryScore10, semanticScore10){
  return round((1 - CHALLENGE_SEMANTIC_SCORE_WEIGHT) * trajectoryScore10 + CHALLENGE_SEMANTIC_SCORE_WEIGHT * semanticScore10, 1);
}

function challengeNumberForStage(stage){
  return stage >= 3 ? Math.floor((stage - 3) / 4) + 1 : null;
}

function targetGroupsForStage(stage){
  const artifact = readJson(TARGET_TRACKS_PATH, {});
  const challengeNumber = challengeNumberForStage(stage);
  const challenge = (artifact.challenges || []).find(item => +item.challengeNumber === +challengeNumber);
  return Array.isArray(challenge?.targetGroups) ? challenge.targetGroups : [];
}

function targetTimingCandidates(base, pathSets = []){
  const groups = targetGroupsForStage(STAGE);
  if(groups.length < 3) return [];
  const starts = groups.map(group => round(+(group.objectTrackTarget?.visibleStartS || 0), 2));
  const durations = groups.map(group => {
    const target = group.objectTrackTarget || {};
    return Math.max(0.75, (+target.visibleEndS || 0) - (+target.visibleStartS || 0));
  });
  const baseSpeeds = Array.isArray(base.groupSpeedScales) && base.groupSpeedScales.length
    ? base.groupSpeedScales
    : Array.from({ length: groups.length }, () => 1);
  const offsetVariants = [
    {
      id: 'target-starts',
      groupSpawnOffsets: starts
    },
    {
      id: 'target-compressed',
      groupSpawnOffsets: starts.map((value, index) => round(index ? value * 0.92 : 0, 2))
    },
    {
      id: 'target-late-hold',
      groupSpawnOffsets: starts.map((value, index) => round(value + (index >= 3 ? 0.35 : 0), 2))
    }
  ];
  const speedVariants = [
    {
      id: 'current-speed',
      groupSpeedScales: baseSpeeds
    },
    {
      id: 'target-duration',
      groupSpeedScales: durations.map(duration => round(clamp(8.2 / duration, 0.72, 3.4), 2))
    },
    {
      id: 'late-hold-speed',
      groupSpeedScales: baseSpeeds.map((value, index) => round(value * (index >= 3 ? 0.78 : 1), 2))
    }
  ];
  const pathVariants = pathSets.length ? pathSets : [base.groupPathFamilies || []];
  const candidates = [];
  for(const offsets of offsetVariants){
    for(const speeds of speedVariants){
      for(let pathIndex = 0; pathIndex < pathVariants.length; pathIndex += 1){
        candidates.push({
          id: `stage${STAGE}-${offsets.id}-${speeds.id}-p${pathIndex}`,
          description: `Stage ${STAGE} target-video timing candidate: ${offsets.id}, ${speeds.id}, path set ${pathIndex}.`,
          layoutOverride: Object.assign({}, base, {
            groupSpawnOffsets: offsets.groupSpawnOffsets,
            groupSpeedScales: speeds.groupSpeedScales,
            groupPathFamilies: pathVariants[pathIndex]
          })
        });
      }
    }
  }
  return candidates;
}

function candidateBaseLayout(){
  if(STAGE === 3){
    return {
      id: 'first-challenge-peel',
      pathFamily: 'first-challenge-peel',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.5,
      spawnOffsetX: 64,
      waveSpacingY: 13,
      rowSpacingY: 8,
      waveDelay: 1.55,
      slotDelay: 0.13,
      arcAmp: 1.12,
      dropAmp: 1.02,
      groupSpawnOffsets: [0,4.1,7.4,10.9,14.5],
      groupSpeedScales: [2.65,1.58,1.5,1.44,1.28],
      laneTypes: ['bee','bee','bee','bee','but','but','but','but'],
      groupLaneTypes: [
        ['bee','bee','bee','bee','but','but','but','but'],
        ['bee','bee','bee','bee','bee','bee','bee','bee'],
        ['but','but','but','but','but','but','but','but'],
        ['bee','but','bee','but','but','bee','but','bee'],
        ['but','bee','bee','but','but','bee','bee','but']
      ],
      groupVisualFamilies: ['classic','classic','classic','classic','classic'],
      groupPathFamilies: ['first-challenge-peel','classic-column-drop','classic-column-drop','side-hook-return','first-challenge-peel']
    };
  }
  if(STAGE === 7){
    return {
      id: 'scorpion-cross-sweep',
      pathFamily: 'cross-sweep',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.5,
      spawnOffsetX: 68,
      waveSpacingY: 12,
      rowSpacingY: 9,
      waveDelay: 1.46,
      slotDelay: 0.12,
      arcAmp: 1.46,
      dropAmp: 1.08,
      groupArcAmps: [1.34,1.28,1.46,1.38,1.18],
      groupDropAmps: [0.86,0.94,1.08,1.12,1.02],
      groupSpeedScales: [1.34,1.28,1.22,1.18,1.16],
      laneTypes: ['but','boss','rogue','bee','bee','rogue','boss','but'],
      groupLaneTypes: [
        ['but','boss','rogue','bee','bee','rogue','boss','but'],
        ['bee','rogue','but','boss','boss','but','rogue','bee'],
        ['boss','but','bee','rogue','rogue','bee','but','boss'],
        ['rogue','bee','boss','but','but','boss','bee','rogue'],
        ['but','rogue','boss','bee','bee','boss','rogue','but']
      ],
      groupVisualFamilies: ['classic','scorpion','scorpion','stingray','stingray'],
      groupPathFamilies: ['cross-sweep','cross-sweep','hook-arc','hook-arc','boss-led-loop']
    };
  }
  if(STAGE === 15){
    return {
      id: 'pink-serpentine-late',
      pathFamily: 'pink-serpentine',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.43,
      spawnOffsetX: 74,
      waveSpacingY: 10,
      rowSpacingY: 9,
      waveDelay: 1.22,
      slotDelay: 0.1,
      arcAmp: 1.68,
      dropAmp: 1.08,
      groupSpawnOffsets: [0,0.45,2.85,6.25,12.85],
      groupSpeedScales: [2.1,1.85,1.5,1.3,1.05],
      laneTypes: ['boss','rogue','but','bee','bee','but','rogue','boss'],
      groupLaneTypes: [
        ['boss','rogue','but','bee','bee','but','rogue','boss'],
        ['but','boss','rogue','bee','bee','rogue','boss','but'],
        ['bee','but','boss','rogue','rogue','boss','but','bee'],
        ['rogue','bee','but','boss','boss','but','bee','rogue'],
        ['boss','but','bee','rogue','rogue','bee','but','boss']
      ],
      groupVisualFamilies: ['galboss','galboss','dragonfly','galboss','dragonfly'],
      groupPathFamilies: ['pink-serpentine','pink-serpentine','green-ladder-split','pink-serpentine','pink-green-cascade']
    };
  }
  if(STAGE === 19){
    return {
      id: 'pink-green-cascade',
      pathFamily: 'pink-green-cascade',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.42,
      spawnOffsetX: 76,
      waveSpacingY: 9,
      rowSpacingY: 8,
      waveDelay: 1.1,
      slotDelay: 0.085,
      arcAmp: 1.86,
      dropAmp: 1.22,
      laneTypes: ['rogue','boss','but','bee','boss','but','bee','rogue'],
      groupLaneTypes: [
        ['rogue','boss','but','bee','boss','but','bee','rogue'],
        ['boss','but','bee','rogue','rogue','bee','but','boss'],
        ['bee','rogue','boss','but','but','boss','rogue','bee'],
        ['but','bee','rogue','boss','boss','rogue','bee','but'],
        ['boss','rogue','bee','but','but','bee','rogue','boss']
      ],
      groupVisualFamilies: ['galboss','dragonfly','crown','dragonfly','galboss'],
      groupPathFamilies: ['pink-green-cascade','green-ladder-split','pink-green-cascade','pink-serpentine','pink-green-cascade']
    };
  }
  if(STAGE === 23){
    return {
      id: 'green-ladder-split',
      pathFamily: 'green-ladder-split',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.41,
      spawnOffsetX: 80,
      waveSpacingY: 9,
      rowSpacingY: 8,
      waveDelay: 1.04,
      slotDelay: 0.08,
      arcAmp: 1.58,
      dropAmp: 1.34,
      groupSpeedScales: [1,1,1,1,1],
      laneTypes: ['bee','but','rogue','boss','boss','rogue','but','bee'],
      groupLaneTypes: [
        ['bee','but','rogue','boss','boss','rogue','but','bee'],
        ['but','bee','boss','rogue','rogue','boss','bee','but'],
        ['rogue','boss','bee','but','but','bee','boss','rogue'],
        ['boss','rogue','but','bee','bee','but','rogue','boss'],
        ['bee','rogue','boss','but','but','boss','rogue','bee']
      ],
      groupVisualFamilies: ['dragonfly','dragonfly','dragonfly','mosquito','dragonfly'],
      groupPathFamilies: ['green-ladder-split','green-ladder-split','green-ladder-split','green-ladder-split','green-ladder-split']
    };
  }
  if(STAGE === 27){
    return {
      id: 'yellow-diagonal-fan',
      pathFamily: 'yellow-diagonal-fan',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.4,
      spawnOffsetX: 84,
      waveSpacingY: 8,
      rowSpacingY: 8,
      waveDelay: 1,
      slotDelay: 0.075,
      arcAmp: 1.88,
      dropAmp: 1.6,
      groupSpawnOffsets: [0,1.05,4.5,8.85,10.25],
      groupSpeedScales: [0.92,0.9,0.92,0.9,0.78],
      laneTypes: ['boss','bee','but','rogue','rogue','but','bee','boss'],
      groupLaneTypes: [
        ['boss','bee','but','rogue','rogue','but','bee','boss'],
        ['bee','boss','rogue','but','but','rogue','boss','bee'],
        ['but','rogue','boss','bee','bee','boss','rogue','but'],
        ['rogue','but','bee','boss','boss','bee','but','rogue'],
        ['boss','rogue','but','bee','bee','but','rogue','boss']
      ],
      groupVisualFamilies: ['crown','crown','crown','crown','crown'],
      groupPathFamilies: ['yellow-diagonal-fan','yellow-diagonal-fan','yellow-diagonal-fan','yellow-diagonal-fan','yellow-diagonal-fan']
    };
  }
  if(STAGE === 31){
    return {
      id: 'blue-purple-finale',
      pathFamily: 'blue-purple-finale',
      groups: 5,
      enemiesPerGroup: 8,
      upperBandRatio: 0.4,
      spawnOffsetX: 86,
      waveSpacingY: 8,
      rowSpacingY: 7,
      waveDelay: 0.96,
      slotDelay: 0.07,
      arcAmp: 1.8,
      dropAmp: 1.26,
      laneTypes: ['rogue','boss','bee','but','but','bee','boss','rogue'],
      groupLaneTypes: [
        ['rogue','boss','bee','but','but','bee','boss','rogue'],
        ['boss','rogue','but','bee','bee','but','rogue','boss'],
        ['bee','but','boss','rogue','rogue','boss','but','bee'],
        ['but','bee','rogue','boss','boss','rogue','bee','but'],
        ['boss','but','rogue','bee','bee','rogue','but','boss']
      ],
      groupVisualFamilies: ['stingray','mosquito','stingray','mosquito','galboss'],
      groupPathFamilies: ['blue-purple-finale','green-ladder-split','blue-purple-finale','yellow-diagonal-fan','blue-purple-finale']
    };
  }
  return {
    id: 'stingray-crown-hook-hybrid',
    pathFamily: 'hook-arc',
    groups: 5,
    enemiesPerGroup: 8,
    upperBandRatio: 0.46,
    spawnOffsetX: 72,
    waveSpacingY: 11,
    rowSpacingY: 8,
    waveDelay: 1.28,
    slotDelay: 0.12,
    arcAmp: 2.08,
    dropAmp: 1.02,
    laneTypes: ['boss','rogue','but','bee','boss','bee','but','rogue'],
    groupLaneTypes: [
      ['boss','rogue','but','bee','boss','bee','but','rogue'],
      ['boss','boss','but','rogue','bee','but','rogue','boss'],
      ['rogue','boss','bee','but','boss','but','bee','rogue'],
      ['but','rogue','boss','boss','boss','boss','rogue','but'],
      ['boss','bee','rogue','but','but','rogue','bee','boss']
    ],
    groupPathFamilies: ['crown-split-cascade','boss-led-loop','hook-arc','boss-led-loop','hook-arc']
  };
}

function candidateDefinitions(){
  const base = candidateBaseLayout();
  if(STAGE === 3 || STAGE === 7){
    const arcValues = STAGE === 3 ? [0.92, 1.12, 1.32] : [1.28, 1.58, 1.88];
    const dropValues = STAGE === 3 ? [0.78, 0.96, 1.14] : [0.9, 1.14, 1.38];
    const spawnValues = STAGE === 3 ? [56, 72] : [62, 78];
    const waveValues = STAGE === 3 ? [1.42, 1.68] : [1.28, 1.56];
    const slotValues = STAGE === 3 ? [0.1, 0.15] : [0.09, 0.14];
    const lowerBiasValues = STAGE === 3 ? [0, 20, 40, 60] : [0, 24, 48, 72];
    const pathSets = STAGE === 3
      ? [
        ['first-challenge-peel','classic-column-drop','classic-column-drop','side-hook-return','first-challenge-peel'],
        ['first-challenge-peel','first-challenge-peel','classic-column-drop','side-hook-return','first-challenge-peel'],
        ['classic-column-drop','classic-column-drop','first-challenge-peel','side-hook-return','classic-column-drop']
      ]
      : [
        ['cross-sweep','cross-sweep','hook-arc','hook-arc','boss-led-loop'],
        ['cross-sweep','hook-arc','cross-sweep','hook-arc','cross-sweep'],
        ['hook-arc','cross-sweep','hook-arc','cross-sweep','boss-led-loop']
      ];
    const candidates = [{
      id: 'baseline-current',
      description: `Current stage-${STAGE} layout, used as the measured baseline.`,
      layoutOverride: {}
    }];
    for(const arcAmp of arcValues){
      for(const dropAmp of dropValues){
        for(const spawnOffsetX of spawnValues){
          for(const waveDelay of waveValues){
            for(const slotDelay of slotValues){
              for(const lowerFieldBias of lowerBiasValues){
                for(let pathIndex = 0; pathIndex < pathSets.length; pathIndex += 1){
                  candidates.push({
                    id: `stage${STAGE}-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-w${String(waveDelay).replace('.','')}-s${String(slotDelay).replace('.','')}-lb${lowerFieldBias}-p${pathIndex}`,
                    description: `Stage ${STAGE} sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, wave ${waveDelay}, slot ${slotDelay}, lower-field bias ${lowerFieldBias}, path set ${pathIndex}.`,
                    layoutOverride: Object.assign({}, base, {
                      arcAmp,
                      dropAmp,
                      spawnOffsetX,
                      waveDelay,
                      slotDelay,
                      lowerFieldBias,
                      groupPathFamilies: pathSets[pathIndex]
                    })
                  });
                }
              }
            }
          }
        }
      }
    }
    candidates.push(...targetTimingCandidates(base, pathSets));
    return candidates;
  }
  if(STAGE === 15){
    const arcValues = [1.42, 1.68, 1.94];
    const dropValues = [0.92, 1.08, 1.24];
    const spawnValues = [68, 74, 82];
    const waveValues = [1.06, 1.22];
    const slotValues = [0.08, 0.1];
    const lowerBiasSets = [
      [],
      [96,112,40,36,128],
      [136,152,68,56,164],
      [176,196,96,82,208]
    ];
    const yOffsetSets = [
      [],
      [78,86,8,8,118],
      [104,112,14,18,142],
      [128,136,24,28,168]
    ];
    const pathSets = [
      ['pink-serpentine','pink-serpentine','green-ladder-split','pink-serpentine','pink-green-cascade'],
      ['pink-serpentine','green-ladder-split','pink-serpentine','pink-green-cascade','pink-serpentine'],
      ['green-ladder-split','pink-serpentine','pink-green-cascade','pink-serpentine','pink-green-cascade']
    ];
    const candidates = [{
      id: 'baseline-current',
      description: `Current stage-${STAGE} layout, used as the measured baseline.`,
      layoutOverride: {}
    }];
    for(const arcAmp of arcValues){
      for(const dropAmp of dropValues){
        for(const spawnOffsetX of spawnValues){
            for(const waveDelay of waveValues){
              for(const slotDelay of slotValues){
                for(let lowerIndex = 0; lowerIndex < lowerBiasSets.length; lowerIndex += 1){
                  for(let yOffsetIndex = 0; yOffsetIndex < yOffsetSets.length; yOffsetIndex += 1){
                    for(let pathIndex = 0; pathIndex < pathSets.length; pathIndex += 1){
                      const groupLowerFieldBiases = lowerBiasSets[lowerIndex];
                      const groupYOffsets = yOffsetSets[yOffsetIndex];
                      candidates.push({
                        id: `stage${STAGE}-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-w${String(waveDelay).replace('.','')}-s${String(slotDelay).replace('.','')}-lb${lowerIndex}-y${yOffsetIndex}-p${pathIndex}`,
                        description: `Stage ${STAGE} sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, wave ${waveDelay}, slot ${slotDelay}, lower-bias set ${lowerIndex}, y-offset set ${yOffsetIndex}, path set ${pathIndex}.`,
                        layoutOverride: Object.assign({}, base, {
                          arcAmp,
                          dropAmp,
                          spawnOffsetX,
                          waveDelay,
                          slotDelay,
                          groupPathFamilies: pathSets[pathIndex],
                          groupLowerFieldBiases,
                          groupYOffsets
                        })
                      });
                    }
                  }
                }
              }
            }
          }
        }
    }
    candidates.push(...targetTimingCandidates(base, pathSets));
    return candidates;
  }
  if(STAGE === 19 || STAGE === 31){
    const arcValues = STAGE === 19 ? [1.62, 1.86, 2.08] : [1.62, 1.8, 2.02];
    const dropValues = STAGE === 19 ? [1.06, 1.22, 1.4] : [1.08, 1.26, 1.44];
    const spawnValues = STAGE === 19 ? [68, 76, 84] : [78, 86, 94];
    const waveValues = STAGE === 19 ? [0.96, 1.1] : [0.86, 0.96, 1.08];
    const slotValues = STAGE === 19 ? [0.07, 0.085] : [0.055, 0.07];
    const lowerBiasValues = STAGE === 19 ? [0, 28, 52, 76] : [0, 24, 48, 72];
    const lowerBiasSets = STAGE === 31
      ? [
        [],
        [48,32,48,36,60],
        [72,54,72,48,84],
        [96,72,96,60,108]
      ]
      : [];
    const yOffsetSets = STAGE === 31
      ? [
        [],
        [24,8,28,10,34],
        [44,18,52,22,62],
        [64,30,78,36,88]
      ]
      : [];
    const pathSets = STAGE === 19
      ? [
        ['pink-green-cascade','green-ladder-split','pink-green-cascade','pink-serpentine','pink-green-cascade'],
        ['pink-green-cascade','pink-green-cascade','green-ladder-split','pink-green-cascade','pink-serpentine'],
        ['green-ladder-split','pink-green-cascade','pink-serpentine','pink-green-cascade','pink-green-cascade']
      ]
      : [
        ['blue-purple-finale','green-ladder-split','blue-purple-finale','yellow-diagonal-fan','blue-purple-finale'],
        ['blue-purple-finale','blue-purple-finale','green-ladder-split','blue-purple-finale','yellow-diagonal-fan'],
        ['yellow-diagonal-fan','blue-purple-finale','green-ladder-split','blue-purple-finale','blue-purple-finale'],
        ['blue-purple-finale','yellow-diagonal-fan','blue-purple-finale','green-ladder-split','blue-purple-finale']
      ];
    const candidates = [{
      id: 'baseline-current',
      description: `Current stage-${STAGE} layout, used as the measured baseline.`,
      layoutOverride: {}
    }];
    for(const arcAmp of arcValues){
      for(const dropAmp of dropValues){
        for(const spawnOffsetX of spawnValues){
          for(const waveDelay of waveValues){
            for(const slotDelay of slotValues){
              for(const lowerFieldBias of lowerBiasValues){
                for(let pathIndex = 0; pathIndex < pathSets.length; pathIndex += 1){
                  candidates.push({
                    id: `stage${STAGE}-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-w${String(waveDelay).replace('.','')}-s${String(slotDelay).replace('.','')}-lb${lowerFieldBias}-p${pathIndex}`,
                    description: `Stage ${STAGE} sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, wave ${waveDelay}, slot ${slotDelay}, lower-field bias ${lowerFieldBias}, path set ${pathIndex}.`,
                    layoutOverride: Object.assign({}, base, {
                      arcAmp,
                      dropAmp,
                      spawnOffsetX,
                      waveDelay,
                      slotDelay,
                      lowerFieldBias,
                      groupPathFamilies: pathSets[pathIndex]
                    })
                  });
                }
                if(
                  STAGE === 31
                  && lowerFieldBias === 0
                  && dropAmp === 1.08
                  && [1.62, 1.8].includes(arcAmp)
                  && [86, 94].includes(spawnOffsetX)
                  && [0.96, 1.08].includes(waveDelay)
                ){
                  for(let lowerSetIndex = 0; lowerSetIndex < lowerBiasSets.length; lowerSetIndex += 1){
                    for(let yOffsetIndex = 0; yOffsetIndex < yOffsetSets.length; yOffsetIndex += 1){
                      if(!lowerSetIndex && !yOffsetIndex) continue;
                      for(let pathIndex = 0; pathIndex < pathSets.length; pathIndex += 1){
                        candidates.push({
                          id: `stage${STAGE}-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-w${String(waveDelay).replace('.','')}-s${String(slotDelay).replace('.','')}-lbs${lowerSetIndex}-y${yOffsetIndex}-p${pathIndex}`,
                          description: `Stage ${STAGE} per-group sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, wave ${waveDelay}, slot ${slotDelay}, lower-bias set ${lowerSetIndex}, y-offset set ${yOffsetIndex}, path set ${pathIndex}.`,
                          layoutOverride: Object.assign({}, base, {
                            arcAmp,
                            dropAmp,
                            spawnOffsetX,
                            waveDelay,
                            slotDelay,
                            groupPathFamilies: pathSets[pathIndex],
                            groupLowerFieldBiases: lowerBiasSets[lowerSetIndex],
                            groupYOffsets: yOffsetSets[yOffsetIndex]
                          })
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    candidates.push(...targetTimingCandidates(base, pathSets));
    return candidates;
  }
  if(STAGE === 23 || STAGE === 27){
    const arcValues = STAGE === 23 ? [1.42, 1.58, 1.78] : [1.68, 1.88, 2.12];
    const dropValues = STAGE === 23 ? [1.18, 1.34, 1.5] : [1.42, 1.6, 1.78];
    const spawnValues = STAGE === 23 ? [72, 80, 88] : [76, 84, 92];
    const waveValues = STAGE === 23 ? [0.98, 1.1] : [0.94, 1.06];
    const slotValues = STAGE === 23 ? [0.07, 0.09] : [0.065, 0.085];
    const candidates = [{
      id: 'baseline-current',
      description: `Current stage-${STAGE} layout, used as the measured baseline.`,
      layoutOverride: {}
    }];
    for(const arcAmp of arcValues){
      for(const dropAmp of dropValues){
        for(const spawnOffsetX of spawnValues){
          for(const waveDelay of waveValues){
            for(const slotDelay of slotValues){
              candidates.push({
                id: `stage${STAGE}-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-w${String(waveDelay).replace('.','')}-s${String(slotDelay).replace('.','')}`,
                description: `Stage ${STAGE} sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, wave ${waveDelay}, slot ${slotDelay}.`,
                layoutOverride: Object.assign({}, base, {
                  arcAmp,
                  dropAmp,
                  spawnOffsetX,
                  waveDelay,
                  slotDelay
                })
              });
            }
          }
        }
      }
    }
    candidates.push(...targetTimingCandidates(base, [base.groupPathFamilies || []]));
    return candidates;
  }
  const pathSets = [
    ['crown-split-cascade','boss-led-loop','hook-arc','boss-led-loop','hook-arc'],
    ['hook-arc','hook-arc','cross-sweep','boss-led-loop','hook-arc'],
    ['boss-led-loop','hook-arc','cross-sweep','boss-led-loop','hook-arc'],
    ['boss-led-loop','boss-led-loop','cross-sweep','boss-led-loop','hook-arc'],
    ['hook-arc','boss-led-loop','hook-arc','boss-led-loop','cross-sweep']
  ];
  const candidates = [{
    id: 'baseline-current',
    description: 'Current stage-11 layout, used as the measured baseline.',
    layoutOverride: {}
  }];
  for(const arcAmp of [1.68, 1.88, 2.08, 2.22]){
    for(const dropAmp of [0.96, 1.02, 1.12]){
      for(const spawnOffsetX of [64, 72, 86]){
        for(let pathIndex = 0; pathIndex < pathSets.length; pathIndex += 1){
          candidates.push({
            id: `stage11-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-p${pathIndex}`,
            description: `Stage 11 sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, path set ${pathIndex}.`,
            layoutOverride: Object.assign({}, base, {
              id: `stage11-candidate-${pathIndex}`,
              arcAmp,
              dropAmp,
              spawnOffsetX,
              groupPathFamilies: pathSets[pathIndex]
            })
          });
        }
      }
    }
  }
  candidates.push(...targetTimingCandidates(base, pathSets));
  return candidates;
}

async function measureCandidates(candidates){
  return withHarnessPage({ stage: STAGE, ships: 3, challenge: false, seed: 9311 }, async ({ page }) => {
    const rows = [];
    for(const candidate of candidates){
      const measured = await page.evaluate(({ stage, sampleTimes, candidate }) => {
        const h = window.__galagaHarness__;
        h.setupChallengeMotionProfileTest({ stage, layoutOverride: candidate.layoutOverride || null });
        const layout = h.challengeFormationState().layout;
        const tracks = {};
        const record = t => {
          const formation = h.challengeFormationState();
          for(const e of formation.enemies || []){
            if(Number.isFinite(+e.spawn) && +e.spawn > 0.03) continue;
            if(Number.isFinite(+e.x) && (+e.x < -12 || +e.x > 292)) continue;
            if(Number.isFinite(+e.y) && (+e.y < -24 || +e.y > 384)) continue;
            const id = `${e.wave}:${e.lane}:${e.id}`;
            if(!tracks[id]){
              tracks[id] = {
                id,
                type: e.type,
                visualFamily: e.family,
                pathFamily: e.pathFamily,
                lane: e.lane,
                wave: e.wave,
                points: []
              };
            }
            tracks[id].points.push({ t, x: e.x, y: e.y });
          }
        };
        let previous = 0;
        for(const t of sampleTimes){
          const dt = Math.max(0, t - previous);
          if(dt) h.advanceFor(dt, { step: 1 / 60, stopOnGameOver: false });
          previous = t;
          record(t);
        }
        const finalState = h.state();
        const recent = h.recentEvents({ count: 200 }) || [];
        return {
          candidateId: candidate.id,
          description: candidate.description,
          layout,
          tracks: Object.values(tracks),
          finalState: {
            stage: finalState.stage,
            challenge: !!finalState.challenge,
            lives: finalState.lives,
            score: finalState.score
          },
          eventCounts: {
            enemyShots: recent.filter(e => e.type === 'enemy_shot' || e.type === 'enemy_bullet').length,
            enemyAttackStarts: recent.filter(e => e.type === 'enemy_attack_start').length,
            shipLosses: recent.filter(e => e.type === 'ship_loss' || e.type === 'player_loss').length
          }
        };
      }, { stage: STAGE, sampleTimes: SAMPLE_TIMES, candidate });
      rows.push(measured);
    }
    return rows;
  });
}

function scoreMeasuredCandidate(measured, labels){
  const classifications = (measured.tracks || []).map(track => Object.assign({}, track, {
    features: pointFeatures(track),
    comparisonFeatures: comparisonFeatures(track)
  }));
  const vector = averageVector(classifications.map(item => normalizeRuntimeVector(item.comparisonFeatures)));
  const semantic = typeSummary(classifications);
  const matches = labels.map(label => {
    const distance = trajectoryDistance(vector, normalizeReferenceVector(label.comparisonVector));
    const trajectoryScore10 = trajectoryScore(distance);
    const semanticScore10 = challengeSemanticScore10(label, semantic);
    return {
      labelId: label.labelId,
      entityFamily: label.entityFamily,
      sourceAnchor: label.sourceAnchor,
      distance: round(distance),
      trajectoryScore10,
      semanticScore10,
      score10: combinedTrajectorySemanticScore(trajectoryScore10, semanticScore10)
    };
  }).sort((a, b) => b.score10 - a.score10 || a.distance - b.distance || a.labelId.localeCompare(b.labelId));
  const expected = matches.find(match => EXPECTED_LABELS.includes(match.labelId)) || null;
  const targetVideoFit = targetVideoObjectFit(measured);
  const noSafetyRegression = measured.eventCounts.enemyShots === 0
    && measured.eventCounts.enemyAttackStarts === 0
    && measured.eventCounts.shipLosses === 0;
  return Object.assign({}, measured, {
    trackCount: classifications.length,
    runtimeVector: vector,
    runtimeSemantic: semantic,
    bestMatch: matches[0] || null,
    expectedMatch: expected,
    expectedReferenceHit: EXPECTED_LABELS.includes(matches[0]?.labelId),
    targetVideoObjectFit: targetVideoFit,
    noSafetyRegression,
    selectionScore10: round((expected?.score10 || 0) + ((targetVideoFit.score10 || 0) * 0.22) + (matches[0]?.labelId === EXPECTED_LABEL ? 0.75 : 0) + (noSafetyRegression ? 0.2 : -3), 2)
  });
}

function buildMarkdown(report){
  const topRows = report.candidates.slice(0, 12).map((row, index) => {
    const hit = row.expectedReferenceHit ? 'yes' : 'no';
    const eventRead = row.noSafetyRegression ? 'pass' : `risk ${JSON.stringify(row.eventCounts)}`;
    return `| ${index + 1} | ${row.candidateId} | ${row.selectionScore10}/10 | ${row.expectedMatch?.score10 ?? 0}/10 | ${row.targetVideoObjectFit?.score10 ?? 'n/a'}/10 | ${row.bestMatch?.labelId || 'none'} (${row.bestMatch?.score10 ?? 0}/10) | ${hit} | ${eventRead} |`;
  }).join('\n');
  return `# Stage ${report.stage} Challenge Candidate Sweep

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

Stage ${report.stage} currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: ${report.summary.baselineExpectedScore10}/10.
- Best candidate expected-reference score: ${report.summary.bestExpectedScore10}/10.
- Best candidate: ${report.summary.bestCandidateId}.
- Keeper decision: ${report.summary.keeperDecision}.
- Player-facing meaning: ${report.summary.playerMeaning}
- Process meaning: ${report.summary.processMeaning}

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Target-Video Fit | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- |
${topRows}

## Next Step

${report.summary.nextStep}
`;
}

async function main(){
  const labels = (readJson(LABELS_PATH, {})?.acceptedLabels || [])
    .filter(label => label.kind === 'challengeEntry' && label.comparisonVector);
  if(!labels.length) throw new Error(`No challenge reference labels found at ${rel(LABELS_PATH)}`);
  const candidates = candidateDefinitions();
  const measured = await measureCandidates(candidates);
  const scored = measured
    .map(item => scoreMeasuredCandidate(item, labels))
    .sort((a, b) => b.selectionScore10 - a.selectionScore10 || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0) || a.candidateId.localeCompare(b.candidateId));
  const baseline = scored.find(row => row.candidateId === 'baseline-current') || scored.at(-1);
  const baselineExpectedScore = baseline.expectedMatch?.score10 || 0;
  const baselineTargetVideoScore = baseline.targetVideoObjectFit?.score10 || 0;
  const promotionCandidates = scored.filter(candidate => {
    const candidateExpectedLift = round((candidate.expectedMatch?.score10 || 0) - baselineExpectedScore, 2);
    const candidateTargetVideoLift = round((candidate.targetVideoObjectFit?.score10 || 0) - baselineTargetVideoScore, 2);
    const candidateTargetVideoComparable = Number.isFinite(+(baseline.targetVideoObjectFit?.score10)) && Number.isFinite(+(candidate.targetVideoObjectFit?.score10));
    const candidateNoTargetRegression = !candidateTargetVideoComparable || candidateTargetVideoLift >= -0.05;
    const candidateNoExpectedRegression = candidateExpectedLift >= -0.05;
    const strongExpectedLift = (candidate.expectedMatch?.score10 || 0) >= 7
      && candidateExpectedLift >= 0.5
      && candidateTargetVideoLift >= 0.8;
    const intendedStageSupported = candidate.expectedReferenceHit || strongExpectedLift;
    return candidate.noSafetyRegression
      && candidateNoTargetRegression
      && candidateNoExpectedRegression
      && intendedStageSupported
      && (candidateExpectedLift >= 0.35 || candidateTargetVideoLift >= 0.35 || (candidateExpectedLift >= 0.25 && candidateTargetVideoLift >= 0.25));
  }).sort((a, b) => {
    const aLift = ((a.expectedMatch?.score10 || 0) - baselineExpectedScore) + ((a.targetVideoObjectFit?.score10 || 0) - baselineTargetVideoScore);
    const bLift = ((b.expectedMatch?.score10 || 0) - baselineExpectedScore) + ((b.targetVideoObjectFit?.score10 || 0) - baselineTargetVideoScore);
    return bLift - aLift || b.selectionScore10 - a.selectionScore10 || a.candidateId.localeCompare(b.candidateId);
  });
  const best = promotionCandidates[0] || scored[0];
  const expectedLift = round((best.expectedMatch?.score10 || 0) - (baseline.expectedMatch?.score10 || 0), 2);
  const targetVideoLift = round((best.targetVideoObjectFit?.score10 || 0) - (baseline.targetVideoObjectFit?.score10 || 0), 2);
  const targetVideoComparable = Number.isFinite(+(baseline.targetVideoObjectFit?.score10)) && Number.isFinite(+(best.targetVideoObjectFit?.score10));
  const noTargetVideoRegression = !targetVideoComparable || targetVideoLift >= -0.05;
  const noExpectedRegression = expectedLift >= -0.05;
  const strongExpectedLift = (best.expectedMatch?.score10 || 0) >= 7
    && expectedLift >= 0.5
    && targetVideoLift >= 0.8;
  const intendedStageSupported = best.expectedReferenceHit || strongExpectedLift;
  const keeper = best.noSafetyRegression && noTargetVideoRegression && noExpectedRegression && intendedStageSupported && (expectedLift >= 0.35 || targetVideoLift >= 0.35 || (expectedLift >= 0.25 && targetVideoLift >= 0.25));
  const retainedCandidateLimit = 120;
  const retainedCandidates = scored.slice(0, retainedCandidateLimit);
  if(!retainedCandidates.some(row => row.candidateId === baseline.candidateId)){
    retainedCandidates.push(baseline);
  }
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-stage-candidate-sweep',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage: STAGE,
    expectedLabel: EXPECTED_LABEL,
    expectedLabels: EXPECTED_LABELS,
    sampleTimes: SAMPLE_TIMES,
    candidateCount: candidates.length,
    summary: {
      baselineCandidateId: baseline.candidateId,
      baselineExpectedScore10: baseline.expectedMatch?.score10 || 0,
      baselineTargetVideoObjectFitScore10: baseline.targetVideoObjectFit?.score10 || null,
      baselineBestMatch: baseline.bestMatch,
      bestCandidateId: best.candidateId,
      bestExpectedScore10: best.expectedMatch?.score10 || 0,
      bestTargetVideoObjectFitScore10: best.targetVideoObjectFit?.score10 || null,
      bestSelectionScore10: best.selectionScore10,
      bestMatch: best.bestMatch,
      expectedLift10: expectedLift,
      targetVideoObjectFitLift10: targetVideoLift,
      targetVideoComparable,
      noTargetVideoRegression,
      noExpectedRegression,
      intendedStageSupported,
      strongExpectedLift,
      intendedStageSupportPolicy: 'runtime promotion requires no expected-label regression, and either the best trajectory match to be one of the expected stage labels or a strong expected-label score >=7 with >=0.5 expected lift and >=0.8 target-video lift',
      keeperDecision: keeper ? 'candidate-ready-for-full-analyzer-review' : 'no-runtime-keeper-yet',
      playerMeaning: keeper
        ? `A measured stage-${STAGE} layout candidate is worth a temporary runtime review, but it must be confirmed by the full challenge-stage analyzer and persona guardrails before promotion.`
        : 'This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.',
      processMeaning: 'Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.',
      nextStep: keeper
        ? `Apply the best candidate temporarily, rerun full challenge-stage conformance plus guardrails, and accept it only if the full analyzer confirms the expected lift.`
        : `Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-${STAGE} gameplay.`
    },
    candidates: retainedCandidates.map(row => ({
      candidateId: row.candidateId,
      description: row.description,
      layout: row.layout,
      eventCounts: row.eventCounts,
      noSafetyRegression: row.noSafetyRegression,
      runtimeVector: row.runtimeVector,
      runtimeSemantic: row.runtimeSemantic,
      bestMatch: row.bestMatch,
      expectedMatch: row.expectedMatch,
      expectedReferenceHit: row.expectedReferenceHit,
      targetVideoObjectFit: row.targetVideoObjectFit,
      selectionScore10: row.selectionScore10
    })),
    candidateRetention: {
      totalMeasured: scored.length,
      retained: retainedCandidates.length,
      policy: `Keep the top ${retainedCandidateLimit} candidates by selection score plus the baseline row; use candidateCount for the full measured search size.`
    },
    measurementPolicy: {
      scope: `harness-only stage-${STAGE} challenge layout candidates`,
      reference: 'media-backed Galaga challenge labels with comparison vectors',
      promotionRule: 'Require an expected challenge-label best match, no safety regression, and at least +0.35/10 expected-label lift over baseline before runtime promotion.',
      safety: 'Reject candidates with enemy shots, enemy attack starts, or ship losses in the challenge window.'
    }
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    candidateCount: report.candidateCount,
    baselineExpectedScore10: report.summary.baselineExpectedScore10,
    bestCandidateId: report.summary.bestCandidateId,
    bestExpectedScore10: report.summary.bestExpectedScore10,
    bestTargetVideoObjectFitScore10: report.summary.bestTargetVideoObjectFitScore10,
    expectedLift10: report.summary.expectedLift10,
    targetVideoObjectFitLift10: report.summary.targetVideoObjectFitLift10,
    keeperDecision: report.summary.keeperDecision,
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep');
const LABELS_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-labels', 'latest.json');
const TARGET_TRACKS_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
const TARGET_CONTROLS_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-trajectory-controls', 'latest.json');
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

function targetControlsForStage(stage){
  const artifact = readJson(TARGET_CONTROLS_PATH, {});
  const challengeNumber = challengeNumberForStage(stage);
  return (artifact.challenges || []).find(item => +item.challengeNumber === +challengeNumber || +item.stage === +stage) || null;
}

function dedupePathSets(pathSets){
  const seen = new Set();
  const out = [];
  for(const set of pathSets){
    const clean = Array.isArray(set) ? set.filter(Boolean) : [];
    if(!clean.length) continue;
    const key = clean.join('|');
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

function controlArray(values, fallback, length){
  const source = Array.isArray(values) && values.length ? values : fallback;
  const out = [];
  for(let index = 0; index < length; index += 1){
    out.push(source?.[index] ?? fallback?.[index] ?? fallback?.[0] ?? 1);
  }
  return out;
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

function targetControlCandidates(base, pathSets = []){
  const controls = targetControlsForStage(STAGE);
  const seed = controls?.runtimeLayoutSeed || null;
  const groups = Array.isArray(controls?.groups) ? controls.groups : [];
  if(!seed || groups.length < 3) return [];
  const groupCount = groups.length;
  const baseSpeeds = Array.isArray(base.groupSpeedScales) && base.groupSpeedScales.length
    ? base.groupSpeedScales
    : Array.from({ length: groupCount }, () => 1);
  const pathVariants = dedupePathSets([
    seed.groupPathFamilies,
    base.groupPathFamilies,
    ...pathSets
  ]);
  const offsets = controlArray(seed.groupSpawnOffsets, [], groupCount).map(value => round(value, 2));
  const speedScales = controlArray(seed.groupSpeedScales, baseSpeeds, groupCount).map(value => round(value, 2));
  const softSpeedScales = controlArray(seed.groupSoftSpeedScales, baseSpeeds, groupCount).map(value => round(value, 2));
  const arcAmps = controlArray(seed.groupArcAmps, [], groupCount).map(value => round(value, 2));
  const dropAmps = controlArray(seed.groupDropAmps, [], groupCount).map(value => round(value, 2));
  const lowerFieldBiases = controlArray(seed.groupLowerFieldBiases, [], groupCount).map(value => Math.round(+value || 0));
  const yOffsets = controlArray(seed.groupYOffsets, [], groupCount).map(value => Math.round(+value || 0));
  const referencePaths = Array.isArray(seed.groupReferencePaths) ? seed.groupReferencePaths : [];
  const baseArcAmps = controlArray(base.groupArcAmps, [base.arcAmp || 1], groupCount).map(value => +value || 1);
  const baseDropAmps = controlArray(base.groupDropAmps, [base.dropAmp || 1], groupCount).map(value => +value || 1);
  const blendedArcAmps = arcAmps.map((value, index) => round(((+value || 1) + baseArcAmps[index]) / 2, 2));
  const blendedDropAmps = dropAmps.map((value, index) => round(((+value || 1) + baseDropAmps[index]) / 2, 2));
  const blendedLowerFieldBiases = lowerFieldBiases.map(value => Math.round((+value || 0) * 0.5));
  const blendedYOffsets = yOffsets.map(value => Math.round((+value || 0) * 0.5));
  const candidates = [];
  for(let pathIndex = 0; pathIndex < pathVariants.length; pathIndex += 1){
    const groupPathFamilies = pathVariants[pathIndex];
    candidates.push({
      id: `stage${STAGE}-target-controls-direct-p${pathIndex}`,
      description: `Stage ${STAGE} target-trajectory controls: source-video schedule, direct duration speed, arc/drop, lower-field, y-offset, path set ${pathIndex}.`,
      layoutOverride: Object.assign({}, base, {
        groupSpawnOffsets: offsets,
        groupSpeedScales: speedScales,
        groupArcAmps: arcAmps,
        groupDropAmps: dropAmps,
        groupLowerFieldBiases: lowerFieldBiases,
        groupYOffsets: yOffsets,
        groupPathFamilies
      })
    });
    candidates.push({
      id: `stage${STAGE}-target-controls-soft-p${pathIndex}`,
      description: `Stage ${STAGE} target-trajectory controls: source-video schedule with softer duration speed and full shape controls, path set ${pathIndex}.`,
      layoutOverride: Object.assign({}, base, {
        groupSpawnOffsets: offsets,
        groupSpeedScales: softSpeedScales,
        groupArcAmps: arcAmps,
        groupDropAmps: dropAmps,
        groupLowerFieldBiases: lowerFieldBiases,
        groupYOffsets: yOffsets,
        groupPathFamilies
      })
    });
    candidates.push({
      id: `stage${STAGE}-target-controls-shape-only-p${pathIndex}`,
      description: `Stage ${STAGE} target-trajectory controls: preserve current schedule/speed but apply source-video arc/drop/lower-field/y-offset shape, path set ${pathIndex}.`,
      layoutOverride: Object.assign({}, base, {
        groupArcAmps: arcAmps,
        groupDropAmps: dropAmps,
        groupLowerFieldBiases: lowerFieldBiases,
        groupYOffsets: yOffsets,
        groupPathFamilies
      })
    });
    candidates.push({
      id: `stage${STAGE}-target-controls-shape-blend-p${pathIndex}`,
      description: `Stage ${STAGE} target-trajectory controls: preserve current schedule/speed and apply half-strength source-video shape controls, path set ${pathIndex}.`,
      layoutOverride: Object.assign({}, base, {
        groupArcAmps: blendedArcAmps,
        groupDropAmps: blendedDropAmps,
        groupLowerFieldBiases: blendedLowerFieldBiases,
        groupYOffsets: blendedYOffsets,
        groupPathFamilies
      })
    });
    candidates.push({
      id: `stage${STAGE}-target-controls-soft-blend-p${pathIndex}`,
      description: `Stage ${STAGE} target-trajectory controls: source-video schedule with softer duration speed and half-strength shape controls, path set ${pathIndex}.`,
      layoutOverride: Object.assign({}, base, {
        groupSpawnOffsets: offsets,
        groupSpeedScales: softSpeedScales,
        groupArcAmps: blendedArcAmps,
        groupDropAmps: blendedDropAmps,
        groupLowerFieldBiases: blendedLowerFieldBiases,
        groupYOffsets: blendedYOffsets,
        groupPathFamilies
      })
    });
    if(referencePaths.filter(Boolean).length >= 3){
      candidates.push({
        id: `stage${STAGE}-target-reference-paths-direct-p${pathIndex}`,
        description: `Stage ${STAGE} target reference-path candidate: source-video sampled paths with source schedule and path set ${pathIndex}.`,
        layoutOverride: Object.assign({}, base, {
          groupSpawnOffsets: offsets,
          groupSpeedScales: softSpeedScales,
          groupArcAmps: blendedArcAmps,
          groupDropAmps: blendedDropAmps,
          groupPathFamilies,
          groupReferencePaths: referencePaths
        })
      });
      candidates.push({
        id: `stage${STAGE}-target-reference-paths-lower-field-p${pathIndex}`,
        description: `Stage ${STAGE} target reference-path candidate: sampled paths plus measured lower-field/y controls and source schedule, path set ${pathIndex}.`,
        layoutOverride: Object.assign({}, base, {
          groupSpawnOffsets: offsets,
          groupSpeedScales: softSpeedScales,
          groupArcAmps: blendedArcAmps,
          groupDropAmps: blendedDropAmps,
          groupLowerFieldBiases: blendedLowerFieldBiases,
          groupYOffsets: blendedYOffsets,
          groupPathFamilies,
          groupReferencePaths: referencePaths
        })
      });
      candidates.push({
        id: `stage${STAGE}-target-reference-paths-shape-only-p${pathIndex}`,
        description: `Stage ${STAGE} target reference-path candidate: preserve current schedule while using source-video sampled paths and path set ${pathIndex}.`,
        layoutOverride: Object.assign({}, base, {
          groupArcAmps: blendedArcAmps,
          groupDropAmps: blendedDropAmps,
          groupPathFamilies,
          groupReferencePaths: referencePaths
        })
      });
      candidates.push({
        id: `stage${STAGE}-target-reference-paths-shape-lower-p${pathIndex}`,
        description: `Stage ${STAGE} target reference-path candidate: preserve current schedule while using sampled paths plus measured lower-field/y controls, path set ${pathIndex}.`,
        layoutOverride: Object.assign({}, base, {
          groupArcAmps: blendedArcAmps,
          groupDropAmps: blendedDropAmps,
          groupLowerFieldBiases: blendedLowerFieldBiases,
          groupYOffsets: blendedYOffsets,
          groupPathFamilies,
          groupReferencePaths: referencePaths
        })
      });
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
    candidates.push(...targetControlCandidates(base, pathSets));
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
    candidates.push(...targetControlCandidates(base, pathSets));
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
      : [
        [],
        [52,36,52,40,64],
        [64,44,68,52,76],
        [76,52,84,60,92]
      ];
    const yOffsetSets = STAGE === 31
      ? [
        [],
        [24,8,28,10,34],
        [44,18,52,22,62],
        [64,30,78,36,88]
      ]
      : [
        [],
        [16,8,18,10,24],
        [28,12,32,16,38],
        [40,18,48,22,56]
      ];
    const pathSets = STAGE === 19
      ? [
        ['pink-green-cascade','green-ladder-split','pink-green-cascade','pink-serpentine','pink-green-cascade'],
        ['pink-green-cascade','pink-green-cascade','green-ladder-split','pink-green-cascade','pink-serpentine'],
        ['green-ladder-split','pink-green-cascade','pink-serpentine','pink-green-cascade','pink-green-cascade'],
        ['pink-green-low-sweep','pink-green-low-sweep','pink-green-tall-drift','pink-green-tall-drift','pink-green-compact-exit'],
        ['pink-green-low-sweep','pink-green-low-sweep','pink-green-tall-drift','pink-green-compact-exit','pink-green-low-sweep']
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
                const shouldExpandPerGroup = STAGE === 31
                  ? lowerFieldBias === 0
                    && dropAmp === 1.08
                    && [1.62, 1.8].includes(arcAmp)
                    && [86, 94].includes(spawnOffsetX)
                    && [0.96, 1.08].includes(waveDelay)
                  : lowerFieldBias === 0
                    && [1.06, 1.22].includes(dropAmp)
                    && [1.62, 1.86, 2.08].includes(arcAmp)
                    && [68, 76, 84].includes(spawnOffsetX)
                    && waveDelay === 0.96
                    && slotDelay === 0.07;
                if(shouldExpandPerGroup){
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
    candidates.push(...targetControlCandidates(base, pathSets));
    return candidates;
  }
  if(STAGE === 23 || STAGE === 27){
    const arcValues = STAGE === 23 ? [1.42, 1.58, 1.78] : [1.68, 1.88, 2.12];
    const dropValues = STAGE === 23 ? [1.18, 1.34, 1.5] : [1.42, 1.6, 1.78];
    const spawnValues = STAGE === 23 ? [72, 80, 88] : [76, 84, 92];
    const waveValues = STAGE === 23 ? [0.98, 1.1] : [0.94, 1.06];
    const slotValues = STAGE === 23 ? [0.07, 0.09] : [0.065, 0.085];
    const pathSets = STAGE === 23
      ? [
        ['green-ladder-split','green-ladder-split','green-ladder-split','green-ladder-split','green-ladder-split'],
        ['green-ladder-deep-drop','green-ladder-deep-drop','green-ladder-center-fork','green-ladder-center-fork','green-ladder-high-exit'],
        ['green-ladder-deep-drop','green-ladder-center-fork','green-ladder-center-fork','green-ladder-high-exit','green-ladder-high-exit'],
        ['green-ladder-center-fork','green-ladder-deep-drop','green-ladder-deep-drop','green-ladder-center-fork','green-ladder-high-exit']
      ]
      : [
        ['yellow-diagonal-fan','yellow-diagonal-fan','yellow-diagonal-fan','yellow-diagonal-fan','yellow-diagonal-fan'],
        ['yellow-fan-low-drift','yellow-fan-cross-cut','yellow-fan-cross-cut','yellow-fan-high-pop','yellow-fan-low-drift'],
        ['yellow-fan-low-drift','yellow-fan-low-drift','yellow-fan-cross-cut','yellow-fan-high-pop','yellow-fan-high-pop'],
        ['yellow-fan-cross-cut','yellow-fan-cross-cut','yellow-fan-low-drift','yellow-fan-high-pop','yellow-fan-low-drift']
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
              for(let pathIndex = 0; pathIndex < pathSets.length; pathIndex += 1){
                candidates.push({
                  id: `stage${STAGE}-a${String(arcAmp).replace('.','')}-d${String(dropAmp).replace('.','')}-x${spawnOffsetX}-w${String(waveDelay).replace('.','')}-s${String(slotDelay).replace('.','')}-p${pathIndex}`,
                  description: `Stage ${STAGE} sweep: arc ${arcAmp}, drop ${dropAmp}, spawn ${spawnOffsetX}, wave ${waveDelay}, slot ${slotDelay}, path set ${pathIndex}.`,
                  layoutOverride: Object.assign({}, base, {
                    arcAmp,
                    dropAmp,
                    spawnOffsetX,
                    waveDelay,
                    slotDelay,
                    groupPathFamilies: pathSets[pathIndex]
                  })
                });
              }
            }
          }
        }
      }
    }
    candidates.push(...targetTimingCandidates(base, pathSets));
    candidates.push(...targetControlCandidates(base, pathSets));
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
  candidates.push(...targetControlCandidates(base, pathSets));
  return candidates;
}

async function measureCandidates(candidates){
  return withHarnessPage({ stage: STAGE, ships: 3, challenge: false, seed: 9311 }, async ({ page }) => {
    const rows = [];
    for(const candidate of candidates){
      const measured = await page.evaluate(({ stage, sampleTimes, candidate }) => {
        const h = window.__galagaHarness__;
        h.setupChallengeMotionProfileTest({ stage, layoutOverride: candidate.layoutOverride || null });
        const setupEvents = h.recentEvents({ count: 200 }) || [];
        const eventWindowStartT = setupEvents.reduce((max, event) => Math.max(max, Number.isFinite(+event.t) ? +event.t : max), -Infinity);
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
        const recent = (h.recentEvents({ count: 200 }) || []).filter(event => {
          const t = Number.isFinite(+event.t) ? +event.t : null;
          return t !== null && t > eventWindowStartT + 0.0001;
        });
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
          },
          eventWindow: {
            startT: Number.isFinite(eventWindowStartT) ? +eventWindowStartT.toFixed(3) : null,
            sampledEvents: recent.length
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
  const bestMatch = matches[0] || null;
  const expectedScore10 = expected?.score10 || 0;
  const bestScore10 = bestMatch?.score10 || 0;
  const expectedReferenceHit = EXPECTED_LABELS.includes(bestMatch?.labelId);
  const identityMargin10 = round(expectedScore10 - bestScore10, 2);
  const wrongReferencePenalty10 = expectedReferenceHit ? 0 : round(Math.max(0, bestScore10 - expectedScore10), 2);
  const identityConfidence = expectedReferenceHit
    ? 1
    : round(clamp((identityMargin10 + 1.15) / 1.35) * clamp(expectedScore10 / 6.2), 3);
  const targetVideoScore10 = targetVideoFit.score10 || 0;
  return Object.assign({}, measured, {
    trackCount: classifications.length,
    runtimeVector: vector,
    runtimeSemantic: semantic,
    bestMatch,
    expectedMatch: expected,
    expectedReferenceHit,
    stageIdentity: {
      expectedLabels: EXPECTED_LABELS,
      expectedScore10,
      bestScore10,
      identityMargin10,
      wrongReferencePenalty10,
      confidence: identityConfidence,
      read: expectedReferenceHit
        ? 'Best measured label is one of the expected labels for this challenge stage.'
        : `Best measured label is ${bestMatch?.labelId || 'none'}; expected-stage score trails by ${Math.abs(identityMargin10)}/10.`
    },
    targetVideoObjectFit: targetVideoFit,
    noSafetyRegression,
    selectionScore10: round(
      (expectedScore10 * 0.62)
      + (targetVideoScore10 * 0.24)
      + (identityConfidence * 1.1)
      + (noSafetyRegression ? 0.3 : -2.75)
      - (wrongReferencePenalty10 * 0.65),
      2
    )
  });
}

function summarizeCandidate(row){
  if(!row) return null;
  return {
    candidateId: row.candidateId,
    expectedScore10: row.expectedMatch?.score10 || 0,
    targetVideoObjectFitScore10: row.targetVideoObjectFit?.score10 || null,
    selectionScore10: row.selectionScore10,
    expectedReferenceHit: !!row.expectedReferenceHit,
    stageIdentityMargin10: row.stageIdentity?.identityMargin10 ?? null,
    wrongReferencePenalty10: row.stageIdentity?.wrongReferencePenalty10 ?? 0,
    noSafetyRegression: !!row.noSafetyRegression,
    bestMatchLabelId: row.bestMatch?.labelId || null,
    bestMatchScore10: row.bestMatch?.score10 || 0,
    expectedMatchLabelId: row.expectedMatch?.labelId || null,
    groupPathFamilies: row.layout?.groupPathFamilies || [],
    groupSpawnOffsets: row.layout?.groupSpawnOffsets || [],
    groupLowerFieldBiases: row.layout?.groupLowerFieldBiases || [],
    groupYOffsets: row.layout?.groupYOffsets || []
  };
}

function buildMarkdown(report){
  const topRows = report.candidates.slice(0, 12).map((row, index) => {
    const hit = row.expectedReferenceHit ? 'yes' : 'no';
    const eventRead = row.noSafetyRegression ? 'pass' : `risk ${JSON.stringify(row.eventCounts)}`;
    return `| ${index + 1} | ${row.candidateId} | ${row.selectionScore10}/10 | ${row.expectedMatch?.score10 ?? 0}/10 | ${row.targetVideoObjectFit?.score10 ?? 'n/a'}/10 | ${row.stageIdentity?.identityMargin10 ?? 'n/a'} | ${row.bestMatch?.labelId || 'none'} (${row.bestMatch?.score10 ?? 0}/10) | ${hit} | ${eventRead} |`;
  }).join('\n');
  const diagnosticRow = row => `| ${row.candidateId} | ${row.expectedScore10}/10 | ${row.targetVideoObjectFitScore10 ?? 'n/a'}/10 | ${row.stageIdentityMargin10 ?? 'n/a'} | ${row.bestMatchLabelId || 'none'} (${row.bestMatchScore10}/10) | ${row.expectedReferenceHit ? 'yes' : 'no'} | ${row.noSafetyRegression ? 'pass' : 'risk'} | ${(row.groupPathFamilies || []).join(', ') || 'default'} |`;
  const targetTimingRows = (report.diagnostics?.targetTimingTop || []).map(diagnosticRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  const targetControlRows = (report.diagnostics?.targetControlTop || []).map(diagnosticRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  const targetReferencePathRows = (report.diagnostics?.targetReferencePathTop || []).map(diagnosticRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  const pathShapeRows = (report.diagnostics?.pathShapeTop || []).map(diagnosticRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
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
- Candidate retention: ${report.candidateRetention?.retained ?? report.candidates.length}/${report.candidateRetention?.totalMeasured ?? report.candidateCount} retained; ${report.candidateRetention?.targetTimingDiagnostics ?? 0} target-timing diagnostics, ${report.candidateRetention?.targetControlDiagnostics ?? 0} target-control diagnostics, ${report.candidateRetention?.targetReferencePathDiagnostics ?? 0} target-reference-path diagnostics, and ${report.candidateRetention?.pathShapeDiagnostics ?? 0} path-shape diagnostics preserved.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Target-Video Fit | Identity Margin | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
${topRows}

## Diagnostic Candidates

These rows are intentionally retained even when they are not promotion candidates. They show whether target-timed schedules or new path-shape primitives improve one measurement while failing expected-reference identity or safety.

### Target-Timing Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Identity Margin | Best Match | Expected Hit | Safety | Paths |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
${targetTimingRows}

### Target-Control Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Identity Margin | Best Match | Expected Hit | Safety | Paths |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
${targetControlRows}

### Target Reference-Path Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Identity Margin | Best Match | Expected Hit | Safety | Paths |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
${targetReferencePathRows}

### Path-Shape Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Identity Margin | Best Match | Expected Hit | Safety | Paths |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
${pathShapeRows}

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
    const candidateMaterialTargetWin = candidate.expectedReferenceHit && candidateExpectedLift >= -0.15 && candidateTargetVideoLift >= 0.55;
    const candidateNoExpectedRegression = candidateExpectedLift >= -0.05 || candidateMaterialTargetWin;
    const candidateIdentityClose = (candidate.stageIdentity?.identityMargin10 ?? -10) >= -0.35;
    const candidateIdentityTieSupported = (candidate.stageIdentity?.identityMargin10 ?? -10) >= -0.05
      && candidateExpectedLift >= 0.3
      && candidateTargetVideoLift >= 0.15;
    const strongExpectedLift = (candidate.expectedMatch?.score10 || 0) >= 7
      && candidateExpectedLift >= 0.5
      && candidateTargetVideoLift >= 0.8
      && candidateIdentityClose;
    const intendedStageSupported = candidate.expectedReferenceHit || candidateIdentityTieSupported || strongExpectedLift;
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
  const materialTargetVideoWin = best.expectedReferenceHit && expectedLift >= -0.15 && targetVideoLift >= 0.55;
  const noExpectedRegression = expectedLift >= -0.05 || materialTargetVideoWin;
  const identityClose = (best.stageIdentity?.identityMargin10 ?? -10) >= -0.35;
  const identityTieSupported = (best.stageIdentity?.identityMargin10 ?? -10) >= -0.05
    && expectedLift >= 0.3
    && targetVideoLift >= 0.15;
  const strongExpectedLift = (best.expectedMatch?.score10 || 0) >= 7
    && expectedLift >= 0.5
    && targetVideoLift >= 0.8
    && identityClose;
  const intendedStageSupported = best.expectedReferenceHit || identityTieSupported || strongExpectedLift;
  const keeper = best.noSafetyRegression && noTargetVideoRegression && noExpectedRegression && intendedStageSupported && (expectedLift >= 0.35 || targetVideoLift >= 0.35 || (expectedLift >= 0.25 && targetVideoLift >= 0.25));
  const retainedCandidateLimit = 120;
  const pathShapeMarkers = [
    'pink-green-low-sweep',
    'pink-green-tall-drift',
    'pink-green-compact-exit',
    'green-ladder-deep-drop',
    'green-ladder-center-fork',
    'green-ladder-high-exit',
    'yellow-fan-low-drift',
    'yellow-fan-cross-cut',
    'yellow-fan-high-pop'
  ];
  const targetTimingDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('target-') && !String(row.candidateId || '').includes('target-controls') && !String(row.candidateId || '').includes('target-reference-paths'))
    .sort((a, b) => (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0) || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 8);
  const targetControlDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('target-controls'))
    .sort((a, b) => (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0) || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 8);
  const targetReferencePathDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('target-reference-paths'))
    .sort((a, b) => (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0) || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 8);
  const pathShapeDiagnostics = scored
    .filter(row => pathShapeMarkers.some(marker => (row.layout?.groupPathFamilies || []).includes(marker)))
    .sort((a, b) => (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0) || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 8);
  const retainedById = new Map();
  for(const row of scored.slice(0, retainedCandidateLimit)) retainedById.set(row.candidateId, row);
  for(const row of targetTimingDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of targetControlDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of targetReferencePathDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of pathShapeDiagnostics) retainedById.set(row.candidateId, row);
  const retainedCandidates = Array.from(retainedById.values());
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
      identityTieSupported,
      materialTargetVideoWin,
      strongExpectedLift,
      intendedStageSupportPolicy: 'runtime promotion requires no expected-label regression unless the expected label remains the best match and target-video fit improves by >=0.55/10 with no more than -0.15/10 expected drift. It also requires the best trajectory match to be one of the expected stage labels, an expected-label tie within 0.05/10 with >=0.3 expected lift and >=0.15 target-video lift, or a strong expected-label score >=7 with >=0.5 expected lift, >=0.8 target-video lift, and an identity margin no worse than -0.35/10',
      keeperDecision: keeper ? 'candidate-ready-for-full-analyzer-review' : 'no-runtime-keeper-yet',
      playerMeaning: keeper
        ? `A measured stage-${STAGE} layout candidate is worth a temporary runtime review, but it must be confirmed by the full challenge-stage analyzer and persona guardrails before promotion.`
        : 'This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.',
      processMeaning: 'Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.',
      nextStep: keeper
        ? `Apply the best candidate temporarily, rerun full challenge-stage conformance plus guardrails, and accept it only if the full analyzer confirms the expected lift.`
        : `Use target-trajectory controls and richer reference labels before changing runtime stage-${STAGE} gameplay.`
    },
    candidates: retainedCandidates.map(row => ({
      candidateId: row.candidateId,
      description: row.description,
      layout: row.layout,
      eventCounts: row.eventCounts,
      eventWindow: row.eventWindow,
      noSafetyRegression: row.noSafetyRegression,
      runtimeVector: row.runtimeVector,
      runtimeSemantic: row.runtimeSemantic,
      bestMatch: row.bestMatch,
      expectedMatch: row.expectedMatch,
      expectedReferenceHit: row.expectedReferenceHit,
      stageIdentity: row.stageIdentity,
      targetVideoObjectFit: row.targetVideoObjectFit,
      selectionScore10: row.selectionScore10
    })),
    candidateRetention: {
      totalMeasured: scored.length,
      retained: retainedCandidates.length,
      targetTimingDiagnostics: targetTimingDiagnostics.length,
      targetControlDiagnostics: targetControlDiagnostics.length,
      targetReferencePathDiagnostics: targetReferencePathDiagnostics.length,
      pathShapeDiagnostics: pathShapeDiagnostics.length,
      policy: `Keep the top ${retainedCandidateLimit} candidates by selection score, the baseline row, and top target-timing/target-control/target-reference-path/path-shape diagnostic candidates; use candidateCount for the full measured search size.`
    },
    diagnostics: {
      targetTimingTop: targetTimingDiagnostics.map(summarizeCandidate),
      targetControlTop: targetControlDiagnostics.map(summarizeCandidate),
      targetReferencePathTop: targetReferencePathDiagnostics.map(summarizeCandidate),
      pathShapeTop: pathShapeDiagnostics.map(summarizeCandidate)
    },
    measurementPolicy: {
      scope: `harness-only stage-${STAGE} challenge layout candidates`,
      reference: 'media-backed Galaga challenge labels with comparison vectors',
      promotionRule: 'Require the expected challenge-label identity to be the best match or tied within 0.05/10 with evidence on both expected and target-video axes, no safety regression, and at least +0.35/10 expected-label or target-video lift over baseline before runtime promotion. A material target-video win may tolerate up to -0.15/10 expected drift only when expected identity remains the best match. Strong non-best candidates must be very close on identity margin and improve both expected and target-video scores.',
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

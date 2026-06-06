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
const MOTION_SPEC_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-motion-spec', 'latest.json');
const FULL_ANALYZER_REVIEW_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-full-analyzer-review');
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

function findFullAnalyzerReviews(){
  if(!fs.existsSync(FULL_ANALYZER_REVIEW_ROOT)) return [];
  const files = [];
  const latest = path.join(FULL_ANALYZER_REVIEW_ROOT, 'latest.json');
  if(fs.existsSync(latest)) files.push(latest);
  for(const entry of fs.readdirSync(FULL_ANALYZER_REVIEW_ROOT, { withFileTypes: true })){
    if(!entry.isDirectory()) continue;
    const report = path.join(FULL_ANALYZER_REVIEW_ROOT, entry.name, 'report.json');
    if(fs.existsSync(report)) files.push(report);
  }
  const seen = new Set();
  return files
    .map(file => ({ file, review: readJson(file, null) }))
    .filter(item => item.review && Number.isFinite(+item.review.stage) && item.review.candidateId)
    .filter(item => {
      const key = `${item.review.stage}:${item.review.candidateId}:${item.review.decision}:${item.review.generatedAt || item.file}`;
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(item => Object.assign({ sourceFile: rel(item.file) }, item.review));
}

function rejectedFullAnalyzerReviewsForStage(stage){
  return findFullAnalyzerReviews()
    .filter(review => +review.stage === +stage && String(review.decision || '').includes('reject'))
    .sort((a, b) => String(b.generatedAt || '').localeCompare(String(a.generatedAt || '')));
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

function distance(a, b){
  if(!a || !b) return null;
  if(!Number.isFinite(+a.x) || !Number.isFinite(+a.y) || !Number.isFinite(+b.x) || !Number.isFinite(+b.y)) return null;
  return Math.hypot(+a.x - +b.x, +a.y - +b.y);
}

function humanVisibleGuardrails(measured, noSafetyRegression){
  const tracks = Array.isArray(measured?.tracks) ? measured.tracks : [];
  const layout = measured?.layout || {};
  const expectedGroups = Math.max(1, +layout.groups || 5);
  const waves = new Map();
  for(const track of tracks){
    if(!Array.isArray(track.points) || !track.points.length) continue;
    const wave = Number.isFinite(+track.wave) ? +track.wave : -1;
    if(!waves.has(wave)) waves.set(wave, []);
    waves.get(wave).push(track);
  }
  const leadIns = Array.isArray(measured?.leadIns) ? measured.leadIns : [];
  const leadInWaves = new Set(leadIns.map(item => +item.wave).filter(Number.isFinite));
  const visibleGroupCount = [...waves.keys()].filter(wave => wave >= 0).length;
  const groupVisibility = clamp(visibleGroupCount / expectedGroups);
  const arrivalScores = [];
  for(const [wave, groupTracks] of waves.entries()){
    if(wave < 0) continue;
    const firstPoints = groupTracks
      .map(track => (track.points || [])[0])
      .filter(Boolean)
      .sort((a, b) => (+a.t || 0) - (+b.t || 0))
      .slice(0, 4);
    const nearEdgeOrTop = firstPoints.some(point => (+point.x < 34 || +point.x > 246 || +point.y < 58));
    const hasLeadIn = leadInWaves.has(wave);
    const firstT = firstPoints.length ? Math.min(...firstPoints.map(point => +point.t || 0)) : null;
    const planned = Array.isArray(layout.groupSpawnOffsets) ? +layout.groupSpawnOffsets[wave] : null;
    const timingContinuity = Number.isFinite(firstT) && Number.isFinite(planned)
      ? clamp(1 - Math.max(0, firstT - planned - 1.2) / 2.2)
      : 0.65;
    arrivalScores.push(clamp((hasLeadIn ? 0.48 : 0) + (nearEdgeOrTop ? 0.36 : 0) + timingContinuity * 0.16));
  }
  const arrivalContinuity = arrivalScores.length ? average(arrivalScores) : 0;
  const magicAppearanceRisk = clamp(1 - arrivalContinuity);
  const sampleMap = new Map();
  for(const track of tracks){
    for(const point of track.points || []){
      const key = Number.isFinite(+point.t) ? (+point.t).toFixed(2) : '';
      if(!key) continue;
      if(!sampleMap.has(key)) sampleMap.set(key, []);
      sampleMap.get(key).push(point);
    }
  }
  const minDistances = [];
  for(const points of sampleMap.values()){
    if(points.length < 2) continue;
    let min = Infinity;
    for(let i = 0; i < points.length; i += 1){
      for(let j = i + 1; j < points.length; j += 1){
        const d = distance(points[i], points[j]);
        if(Number.isFinite(d)) min = Math.min(min, d);
      }
    }
    if(Number.isFinite(min)) minDistances.push(min);
  }
  const crampedSamples = minDistances.filter(value => value < 7.5).length;
  const bunchingRisk = minDistances.length ? clamp(crampedSamples / minDistances.length) : 0;
  const spacingScore = minDistances.length
    ? clamp((average(minDistances.map(value => clamp(value / 13))) * 0.72) + ((1 - bunchingRisk) * 0.28))
    : 0.6;
  const trackDensity = clamp(tracks.length / Math.max(1, expectedGroups * 5));
  const coverage = clamp(
    (0.24 * groupVisibility)
    + (0.3 * arrivalContinuity)
    + (0.28 * spacingScore)
    + (0.1 * trackDensity)
    + (0.08 * (noSafetyRegression ? 1 : 0))
  );
  const score10 = round(1 + coverage * 8.2, 1);
  const pass = groupVisibility >= 0.98
    && arrivalContinuity >= 0.58
    && magicAppearanceRisk <= 0.42
    && spacingScore >= 0.52
    && bunchingRisk <= 0.36
    && noSafetyRegression;
  return {
    pass,
    score10,
    groupVisibility: round(groupVisibility, 3),
    visibleGroupCount,
    expectedGroups,
    arrivalContinuity: round(arrivalContinuity, 3),
    magicAppearanceRisk: round(magicAppearanceRisk, 3),
    spacingScore: round(spacingScore, 3),
    bunchingRisk: round(bunchingRisk, 3),
    leadInWaveCount: leadInWaves.size,
    trackDensity: round(trackDensity, 3),
    read: pass
      ? `Human-visible guardrails pass: ${visibleGroupCount}/${expectedGroups} groups visible, arrival continuity ${round(arrivalContinuity, 2)}, magic-appearance risk ${round(magicAppearanceRisk, 2)}, spacing ${round(spacingScore, 2)}, bunching risk ${round(bunchingRisk, 2)}.`
      : `Human-visible guardrails block promotion: ${visibleGroupCount}/${expectedGroups} groups visible, arrival continuity ${round(arrivalContinuity, 2)}, magic-appearance risk ${round(magicAppearanceRisk, 2)}, spacing ${round(spacingScore, 2)}, bunching risk ${round(bunchingRisk, 2)}.`
  };
}

function visualPresenceMetrics(measured){
  const sampleMap = new Map(SAMPLE_TIMES.map(t => [t.toFixed(2), []]));
  const tracks = Array.isArray(measured?.tracks) ? measured.tracks : [];
  for(const track of tracks){
    for(const point of track.points || []){
      const key = Number.isFinite(+point.t) ? (+point.t).toFixed(2) : '';
      if(!key) continue;
      if(!sampleMap.has(key)) sampleMap.set(key, []);
      sampleMap.get(key).push(point);
    }
  }
  const samples = [...sampleMap.entries()]
    .sort((a, b) => +a[0] - +b[0])
    .map(([t, points]) => {
      const xs = points.map(point => +point.x).filter(Number.isFinite);
      const ys = points.map(point => +point.y).filter(Number.isFinite);
      return {
        t: +t,
        enemyCount: points.length,
        xRange: xs.length ? round(Math.max(...xs) - Math.min(...xs), 2) : 0,
        yRange: ys.length ? round(Math.max(...ys) - Math.min(...ys), 2) : 0
      };
    });
  return {
    averageEnemyCount: round(average(samples.map(sample => sample.enemyCount)), 2),
    averageXRange: round(average(samples.map(sample => sample.xRange)), 2),
    averageYRange: round(average(samples.map(sample => sample.yRange)), 2),
    maxEnemyCount: samples.length ? Math.max(...samples.map(sample => sample.enemyCount)) : 0,
    sampleCount: samples.length
  };
}

function ratio(candidate, baseline){
  const c = +candidate;
  const b = +baseline;
  return Number.isFinite(c) && Number.isFinite(b) && b > 0 ? round(c / b, 3) : null;
}

function visualPresenceRegressionGuard(candidateMetrics = {}, baselineMetrics = {}){
  const enemyCountRatio = ratio(candidateMetrics.averageEnemyCount, baselineMetrics.averageEnemyCount);
  const xRangeRatio = ratio(candidateMetrics.averageXRange, baselineMetrics.averageXRange);
  const yRangeRatio = ratio(candidateMetrics.averageYRange, baselineMetrics.averageYRange);
  const enemyCountDelta = round((+candidateMetrics.averageEnemyCount || 0) - (+baselineMetrics.averageEnemyCount || 0), 2);
  const xRangeDelta = round((+candidateMetrics.averageXRange || 0) - (+baselineMetrics.averageXRange || 0), 2);
  const yRangeDelta = round((+candidateMetrics.averageYRange || 0) - (+baselineMetrics.averageYRange || 0), 2);
  const enemyCountPass = enemyCountRatio === null || enemyCountRatio >= 0.82;
  const xRangePass = xRangeRatio === null || xRangeRatio >= 0.72;
  const yRangePass = yRangeRatio === null || yRangeRatio >= 0.72;
  const pass = enemyCountPass && xRangePass && yRangePass;
  const blocked = [];
  if(!enemyCountPass) blocked.push(`visible density ${enemyCountRatio}x baseline`);
  if(!xRangePass) blocked.push(`horizontal range ${xRangeRatio}x baseline`);
  if(!yRangePass) blocked.push(`vertical range ${yRangeRatio}x baseline`);
  return {
    pass,
    baseline: baselineMetrics,
    candidate: candidateMetrics,
    enemyCountRatio,
    xRangeRatio,
    yRangeRatio,
    enemyCountDelta,
    xRangeDelta,
    yRangeDelta,
    read: pass
      ? `Visual presence preserved versus baseline: density ${enemyCountRatio ?? 'n/a'}x, X range ${xRangeRatio ?? 'n/a'}x, Y range ${yRangeRatio ?? 'n/a'}x.`
      : `Visual presence regression blocks promotion: ${blocked.join('; ')}.`
  };
}

const SHOT_ROUTE_PLAYER_X = 140;
const SHOT_ROUTE_PLAYER_Y = 338;
const SHOT_ROUTE_BULLET_SPEED = 560;
const SHOT_ROUTE_PLAYER_SPEED = 440;
const SHOT_ROUTE_COOLDOWN = 0.095;

function interpolateMeasuredTrack(points, t){
  if(!Array.isArray(points) || !points.length || !Number.isFinite(+t)) return null;
  const targetT = +t;
  let prev = null;
  let next = null;
  for(const point of points){
    const pt = +point.t;
    if(!Number.isFinite(pt)) continue;
    if(pt <= targetT) prev = point;
    if(pt >= targetT){
      next = point;
      break;
    }
  }
  if(!prev || !next) return null;
  const prevT = +prev.t;
  const nextT = +next.t;
  if(Math.abs(nextT - prevT) < 0.0001) return next;
  const ratio = clamp((targetT - prevT) / (nextT - prevT));
  return Object.assign({}, next, {
    t: targetT,
    x: (+prev.x || 0) + (((+next.x || 0) - (+prev.x || 0)) * ratio),
    y: (+prev.y || 0) + (((+next.y || 0) - (+prev.y || 0)) * ratio)
  });
}

function buildPerfectRoute(targets, opportunities){
  const killed = new Set();
  const route = [];
  let playerX = SHOT_ROUTE_PLAYER_X;
  let availableAt = 0;
  const ordered = opportunities.slice().sort((a, b) => a.t - b.t || a.x - b.x);
  let transitionFitSum = 0;
  let transitionCount = 0;
  for(const opportunity of ordered){
    if(killed.has(opportunity.id)) continue;
    const t = +opportunity.t;
    const dt = Math.max(0, t - availableAt);
    const reachableDx = (SHOT_ROUTE_PLAYER_SPEED * dt) + opportunity.tolerance + 8;
    const dx = Math.abs((+opportunity.x || 0) - playerX);
    if(dx > reachableDx) continue;
    const fit = dx <= opportunity.tolerance ? 1 : clamp(1 - ((dx - opportunity.tolerance) / Math.max(1, SHOT_ROUTE_PLAYER_SPEED * Math.max(dt, 0.001))));
    transitionFitSum += fit;
    transitionCount += 1;
    killed.add(opportunity.id);
    route.push(opportunity);
    playerX = +opportunity.x || playerX;
    availableAt = Math.max(availableAt, t + SHOT_ROUTE_COOLDOWN);
  }
  return {
    routeKills: killed.size,
    routeCoverageShare: targets.length ? killed.size / targets.length : 0,
    laneTransitionFit: transitionCount ? transitionFitSum / transitionCount : 0,
    firstRouteT: route.length ? route[0].t : null,
    lastRouteT: route.length ? route[route.length - 1].t : null,
    route
  };
}

function humanPerfectPotential(measured){
  const expectedTargetCount = 40;
  const targets = (measured.tracks || [])
    .map(track => ({
      id: track.id,
      type: track.type,
      wave: track.wave,
      lane: track.lane,
      points: (track.points || [])
        .filter(point => Number.isFinite(+point.t) && Number.isFinite(+point.x) && Number.isFinite(+point.y))
        .sort((a, b) => (+a.t || 0) - (+b.t || 0))
    }))
    .filter(track => track.points.length);
  if(!targets.length){
    return {
      score10: 1,
      coverage: 0,
      targetCount: 0,
      expectedTargetCount,
      routeKills: 0,
      read: 'Human-perfect guard found no stable challenge targets.'
    };
  }
  const opportunities = [];
  const opportunityById = new Map();
  let topCrowdPositions = 0;
  let activePositions = 0;
  for(const target of targets){
    const targetOpportunities = [];
    for(const pos of target.points){
      const y = +pos.y;
      const x = +pos.x;
      if(!Number.isFinite(x) || !Number.isFinite(y)) continue;
      activePositions += 1;
      if(y < 58) topCrowdPositions += 1;
      if(y < 58 || y > 298) continue;
      const travelT = Math.max(0.02, (SHOT_ROUTE_PLAYER_Y - y) / SHOT_ROUTE_BULLET_SPEED);
      if(travelT > 0.62) continue;
      const impact = interpolateMeasuredTrack(target.points, (+pos.t || 0) + travelT);
      if(!impact || !Number.isFinite(+impact.x) || !Number.isFinite(+impact.y)) continue;
      if(+impact.y < 42 || +impact.y > 310) continue;
      const tolerance = target.type === 'boss' ? 18 : 13;
      const horizontalDrift = Math.abs((+impact.x || 0) - x);
      if(horizontalDrift > tolerance + 7) continue;
      const opportunity = {
        id: target.id,
        t: round(+pos.t || 0, 3),
        x: round(x, 2),
        y: round(y, 2),
        impactT: round((+pos.t || 0) + travelT, 3),
        travelT: round(travelT, 3),
        tolerance,
        readableAltitude: y >= 76 && y <= 270,
        horizontalDrift: round(horizontalDrift, 2),
        type: target.type || '',
        wave: target.wave ?? null,
        lane: target.lane ?? null
      };
      targetOpportunities.push(opportunity);
      opportunities.push(opportunity);
    }
    opportunityById.set(target.id, targetOpportunities);
  }
  const exposedTargets = targets.filter(target => (opportunityById.get(target.id) || []).length > 0);
  const sustainedTargets = targets.filter(target => (opportunityById.get(target.id) || []).length >= 2);
  const readableOpportunities = opportunities.filter(item => item.readableAltitude);
  const route = buildPerfectRoute(targets, opportunities);
  const denominator = Math.max(expectedTargetCount, targets.length);
  const targetExposureShare = exposedTargets.length / denominator;
  const sustainedExposureShare = sustainedTargets.length / denominator;
  const readableAltitudeShare = opportunities.length ? readableOpportunities.length / opportunities.length : 0;
  const topCrowdShare = activePositions ? topCrowdPositions / activePositions : 0;
  const opportunityDensity = clamp(opportunities.length / Math.max(1, denominator * 2.2));
  const targetCountFit = clamp(targets.length / expectedTargetCount);
  const crowdPenalty = clamp(1 - (topCrowdShare / 0.62));
  const routeCoverageShare = route.routeKills / denominator;
  const coverage = clamp(
    (0.3 * routeCoverageShare)
    + (0.22 * targetExposureShare)
    + (0.16 * sustainedExposureShare)
    + (0.12 * readableAltitudeShare)
    + (0.1 * route.laneTransitionFit)
    + (0.06 * opportunityDensity)
    + (0.04 * targetCountFit)
  ) * (0.82 + (0.18 * crowdPenalty));
  return {
    score10: round(1 + coverage * 7.2, 1),
    coverage: round(coverage, 3),
    targetCount: targets.length,
    expectedTargetCount,
    routeKills: route.routeKills,
    routeCoverageShare: round(routeCoverageShare, 3),
    targetExposureShare: round(targetExposureShare, 3),
    sustainedExposureShare: round(sustainedExposureShare, 3),
    readableAltitudeShare: round(readableAltitudeShare, 3),
    laneTransitionFit: round(route.laneTransitionFit, 3),
    opportunityDensity: round(opportunityDensity, 3),
    topCrowdShare: round(topCrowdShare, 3),
    candidateWindowCount: opportunities.length,
    firstRouteT: route.firstRouteT,
    lastRouteT: route.lastRouteT,
    read: `Human-perfect guard estimates ${route.routeKills}/${denominator} expected targets reachable by a greedy strong-player route, ${round(targetExposureShare * 100, 0)}% with any ballistic window, ${round(sustainedExposureShare * 100, 0)}% with repeated aim windows, and ${round(topCrowdShare * 100, 0)}% top-crowd pressure.`
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

function challengeNumberForLabel(labelId){
  const match = /^challenge-(\d+)-/.exec(String(labelId || ''));
  return match ? +match[1] : null;
}

function expectedFamiliesForMatches(matches){
  return [...new Set(matches
    .filter(match => EXPECTED_LABELS.includes(match.labelId))
    .map(match => match.entityFamily)
    .filter(Boolean))];
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

function challengeMotionSpecGroupsForStage(stage){
  const artifact = readJson(MOTION_SPEC_PATH, null);
  const spec = artifact?.spec || null;
  if(!spec || +spec.stage !== +stage || !Array.isArray(spec.groups)) return [];
  return spec.groups;
}

function specAwareLayoutOverride(layoutOverride){
  const layout = layoutOverride && typeof layoutOverride === 'object' ? Object.assign({}, layoutOverride) : {};
  const sourceGroups = Array.isArray(layout.motionSpecGroups) && layout.motionSpecGroups.length
    ? layout.motionSpecGroups
    : challengeMotionSpecGroupsForStage(STAGE);
  if(!sourceGroups.length) return layout;
  const arcs = Array.isArray(layout.groupArcAmps) ? layout.groupArcAmps : [];
  const drops = Array.isArray(layout.groupDropAmps) ? layout.groupDropAmps : [];
  const speeds = Array.isArray(layout.groupSpeedScales) ? layout.groupSpeedScales : [];
  const lowerBiases = Array.isArray(layout.groupLowerFieldBiases) ? layout.groupLowerFieldBiases : [];
  const yOffsets = Array.isArray(layout.groupYOffsets) ? layout.groupYOffsets : [];
  const spawnOffsets = Array.isArray(layout.groupSpawnOffsets) ? layout.groupSpawnOffsets : [];
  const laneSpreadScales = Array.isArray(layout.groupLaneSpreadScales) ? layout.groupLaneSpreadScales : [];
  const rowSpreadScales = Array.isArray(layout.groupRowSpreadScales) ? layout.groupRowSpreadScales : [];
  const laneStaggers = Array.isArray(layout.groupLaneStaggers) ? layout.groupLaneStaggers : [];
  const phaseOffsets = Array.isArray(layout.groupPhaseOffsets) ? layout.groupPhaseOffsets : [];
  const lanePhaseOffsets = Array.isArray(layout.groupLanePhaseOffsets) ? layout.groupLanePhaseOffsets : [];
  const slotDelays = Array.isArray(layout.groupSlotDelays) ? layout.groupSlotDelays : [];
  const slotXOffsets = Array.isArray(layout.groupSlotXOffsets) ? layout.groupSlotXOffsets : [];
  const slotYOffsets = Array.isArray(layout.groupSlotYOffsets) ? layout.groupSlotYOffsets : [];
  const deconflictSpreads = Array.isArray(layout.groupDeconflictSpreads) ? layout.groupDeconflictSpreads : [];
  const deconflictPhases = Array.isArray(layout.groupDeconflictPhases) ? layout.groupDeconflictPhases : [];
  const deconflictLaneBiases = Array.isArray(layout.groupDeconflictLaneBiases) ? layout.groupDeconflictLaneBiases : [];
  const deconflictYOffsets = Array.isArray(layout.groupDeconflictYOffsets) ? layout.groupDeconflictYOffsets : [];
  const routeOffsetsX = Array.isArray(layout.groupRouteOffsetsX) ? layout.groupRouteOffsetsX : [];
  const routeOffsetsY = Array.isArray(layout.groupRouteOffsetsY) ? layout.groupRouteOffsetsY : [];
  const routeCurveXs = Array.isArray(layout.groupRouteCurveXs) ? layout.groupRouteCurveXs : [];
  const routeCurveYs = Array.isArray(layout.groupRouteCurveYs) ? layout.groupRouteCurveYs : [];
  const routePhases = Array.isArray(layout.groupRoutePhases) ? layout.groupRoutePhases : [];
  const laneOrders = Array.isArray(layout.groupLaneOrders) ? layout.groupLaneOrders : [];
  const scalarArc = Number.isFinite(+layout.arcAmp) ? +layout.arcAmp : null;
  const scalarDrop = Number.isFinite(+layout.dropAmp) ? +layout.dropAmp : null;
  const scalarSpeed = Number.isFinite(+layout.speedScale) ? +layout.speedScale : null;
  const scalarLowerBias = Number.isFinite(+layout.lowerFieldBias) ? +layout.lowerFieldBias : null;
  const scalarYOffset = Number.isFinite(+layout.yOffset) ? +layout.yOffset : null;
  const scalarLaneSpread = Number.isFinite(+layout.laneSpreadScale) ? +layout.laneSpreadScale : null;
  const scalarRowSpread = Number.isFinite(+layout.rowSpreadScale) ? +layout.rowSpreadScale : null;
  const scalarLaneStagger = Number.isFinite(+layout.laneStaggerS) ? +layout.laneStaggerS : null;
  const scalarPhaseOffset = Number.isFinite(+layout.phaseOffsetS) ? +layout.phaseOffsetS : null;
  const scalarLanePhaseOffsets = Array.isArray(layout.lanePhaseOffsets) ? layout.lanePhaseOffsets : null;
  const scalarSlotDelay = Number.isFinite(+layout.slotDelay) ? +layout.slotDelay : null;
  const scalarSlotXOffset = Number.isFinite(+layout.slotXOffset) ? +layout.slotXOffset : null;
  const scalarSlotYOffset = Number.isFinite(+layout.slotYOffset) ? +layout.slotYOffset : null;
  const scalarDeconflictSpread = Number.isFinite(+layout.deconflictSpread) ? +layout.deconflictSpread : null;
  const scalarDeconflictPhase = Number.isFinite(+layout.deconflictPhase) ? +layout.deconflictPhase : null;
  const scalarDeconflictLaneBias = Number.isFinite(+layout.deconflictLaneBias) ? +layout.deconflictLaneBias : null;
  const scalarDeconflictYOffset = Number.isFinite(+layout.deconflictYOffset) ? +layout.deconflictYOffset : null;
  const scalarRouteOffsetX = Number.isFinite(+layout.routeOffsetX) ? +layout.routeOffsetX : null;
  const scalarRouteOffsetY = Number.isFinite(+layout.routeOffsetY) ? +layout.routeOffsetY : null;
  const scalarRouteCurveX = Number.isFinite(+layout.routeCurveX) ? +layout.routeCurveX : null;
  const scalarRouteCurveY = Number.isFinite(+layout.routeCurveY) ? +layout.routeCurveY : null;
  const scalarRoutePhase = Number.isFinite(+layout.routePhaseS) ? +layout.routePhaseS : null;
  const paths = Array.isArray(layout.groupPathFamilies) ? layout.groupPathFamilies : [];
  const normalizeLanePhaseOffsets = values => Array.isArray(values)
    ? values.slice(0, 8).map(value => round(Number.isFinite(+value) ? +value : 0, 3))
    : null;
  layout.motionSpecGroups = sourceGroups.map((group, index) => {
    const controls = Object.assign({}, group.controls || {});
    const spawnOffset = Number.isFinite(+spawnOffsets[index]) ? +spawnOffsets[index] : null;
    const arc = Number.isFinite(+arcs[index]) ? +arcs[index] : scalarArc;
    const drop = Number.isFinite(+drops[index]) ? +drops[index] : scalarDrop;
    const speed = Number.isFinite(+speeds[index]) ? +speeds[index] : scalarSpeed;
    const lowerBias = Number.isFinite(+lowerBiases[index]) ? +lowerBiases[index] : scalarLowerBias;
    const yOffset = Number.isFinite(+yOffsets[index]) ? +yOffsets[index] : scalarYOffset;
    const laneSpread = Number.isFinite(+laneSpreadScales[index]) ? +laneSpreadScales[index] : scalarLaneSpread;
    const rowSpread = Number.isFinite(+rowSpreadScales[index]) ? +rowSpreadScales[index] : scalarRowSpread;
    const laneStagger = Number.isFinite(+laneStaggers[index]) ? +laneStaggers[index] : scalarLaneStagger;
    const phaseOffset = Number.isFinite(+phaseOffsets[index]) ? +phaseOffsets[index] : scalarPhaseOffset;
    const lanePhaseOffset = normalizeLanePhaseOffsets(lanePhaseOffsets[index]) || normalizeLanePhaseOffsets(scalarLanePhaseOffsets);
    const slotDelay = Number.isFinite(+slotDelays[index]) ? +slotDelays[index] : scalarSlotDelay;
    const slotXOffset = Number.isFinite(+slotXOffsets[index]) ? +slotXOffsets[index] : scalarSlotXOffset;
    const slotYOffset = Number.isFinite(+slotYOffsets[index]) ? +slotYOffsets[index] : scalarSlotYOffset;
    const deconflictSpread = Number.isFinite(+deconflictSpreads[index]) ? +deconflictSpreads[index] : scalarDeconflictSpread;
    const deconflictPhase = Number.isFinite(+deconflictPhases[index]) ? +deconflictPhases[index] : scalarDeconflictPhase;
    const deconflictLaneBias = Number.isFinite(+deconflictLaneBiases[index]) ? +deconflictLaneBiases[index] : scalarDeconflictLaneBias;
    const deconflictYOffset = Number.isFinite(+deconflictYOffsets[index]) ? +deconflictYOffsets[index] : scalarDeconflictYOffset;
    const routeOffsetX = Number.isFinite(+routeOffsetsX[index]) ? +routeOffsetsX[index] : scalarRouteOffsetX;
    const routeOffsetY = Number.isFinite(+routeOffsetsY[index]) ? +routeOffsetsY[index] : scalarRouteOffsetY;
    const routeCurveX = Number.isFinite(+routeCurveXs[index]) ? +routeCurveXs[index] : scalarRouteCurveX;
    const routeCurveY = Number.isFinite(+routeCurveYs[index]) ? +routeCurveYs[index] : scalarRouteCurveY;
    const routePhase = Number.isFinite(+routePhases[index]) ? +routePhases[index] : scalarRoutePhase;
    if(Number.isFinite(+arc)) controls.arcAmp = round(+arc, 3);
    if(Number.isFinite(+drop)) controls.dropAmp = round(+drop, 3);
    if(Number.isFinite(+speed)){
      controls.speedScale = round(+speed, 3);
      controls.softSpeedScale = round(+speed, 3);
    }
    if(Number.isFinite(+lowerBias)) controls.lowerFieldBias = Math.round(+lowerBias);
    if(Number.isFinite(+yOffset)) controls.yOffset = Math.round(+yOffset);
    if(Number.isFinite(+laneSpread)) controls.laneSpreadScale = round(+laneSpread, 3);
    if(Number.isFinite(+rowSpread)) controls.rowSpreadScale = round(+rowSpread, 3);
    if(Number.isFinite(+laneStagger)) controls.laneStaggerS = round(+laneStagger, 3);
    if(Number.isFinite(+phaseOffset)) controls.phaseOffsetS = round(+phaseOffset, 3);
    if(lanePhaseOffset && lanePhaseOffset.length) controls.lanePhaseOffsets = lanePhaseOffset;
    if(Number.isFinite(+slotDelay)) controls.slotDelayS = round(+slotDelay, 3);
    if(Number.isFinite(+slotXOffset)) controls.slotXOffset = round(+slotXOffset, 3);
    if(Number.isFinite(+slotYOffset)) controls.slotYOffset = round(+slotYOffset, 3);
    if(Number.isFinite(+deconflictSpread)) controls.deconflictSpread = round(+deconflictSpread, 3);
    if(Number.isFinite(+deconflictPhase)) controls.deconflictPhase = round(+deconflictPhase, 3);
    if(Number.isFinite(+deconflictLaneBias)) controls.deconflictLaneBias = round(+deconflictLaneBias, 3);
    if(Number.isFinite(+deconflictYOffset)) controls.deconflictYOffset = round(+deconflictYOffset, 3);
    if(Number.isFinite(+routeOffsetX)) controls.routeOffsetX = round(+routeOffsetX, 3);
    if(Number.isFinite(+routeOffsetY)) controls.routeOffsetY = round(+routeOffsetY, 3);
    if(Number.isFinite(+routeCurveX)) controls.routeCurveX = round(+routeCurveX, 3);
    if(Number.isFinite(+routeCurveY)) controls.routeCurveY = round(+routeCurveY, 3);
    if(Number.isFinite(+routePhase)) controls.routePhaseS = round(+routePhase, 3);
    if(Array.isArray(laneOrders[index]) && laneOrders[index].length){
      controls.laneOrder = laneOrders[index].map(value => Math.max(0, Math.min(7, Math.round(+value || 0))));
    }
    return Object.assign({}, group, {
      spawnOffsetS: Number.isFinite(+spawnOffset) ? round(+spawnOffset, 3) : group.spawnOffsetS,
      pathFamilyHint: paths[index] || group.pathFamilyHint,
      controls,
      phaseDurations: Object.assign({}, group.phaseDurations || {})
    });
  });
  layout.specAwareCandidate = true;
  return layout;
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
    if(STAGE === 7){
      const laneSpreadSets = [
        { id: 'ref', values: [1.5, 1.04, 0.893, 1.5, 0.994] },
        { id: 'wide', values: [1.62, 1.16, 1.02, 1.62, 1.12] },
        { id: 'latewide', values: [1.5, 1.12, 1.1, 1.68, 1.22] },
        { id: 'balanced', values: [1.36, 1.24, 1.16, 1.36, 1.24] }
      ];
      const rowSpreadSets = [
        { id: 'ref', values: [0.937, 1.366, 0.859, 1.369, 1.369] },
        { id: 'tall', values: [1.08, 1.48, 1.02, 1.5, 1.48] },
        { id: 'balanced', values: [1.14, 1.22, 1.1, 1.24, 1.22] }
      ];
      const laneOrders = [
        { id: 'id', value: [0, 1, 2, 3, 4, 5, 6, 7] },
        { id: 'pair', value: [0, 2, 1, 3, 4, 6, 5, 7] },
        { id: 'outer', value: [0, 3, 1, 2, 4, 7, 5, 6] },
        { id: 'fan', value: [3, 1, 0, 2, 5, 7, 4, 6] }
      ];
      const laneStaggers = [0, 0.025, 0.045];
      const slotDelays = [0.14, 0.18, 0.22];
      const phaseOffsetSets = [
        { id: 'sync', values: [0, 0, 0, 0, 0] },
        { id: 'ripple', values: [-0.06, 0, 0.05, 0.09, 0.13] },
        { id: 'latehold', values: [0, 0.04, 0.08, 0.16, 0.2] }
      ];
      for(const laneSpread of laneSpreadSets){
        for(const rowSpread of rowSpreadSets){
          for(const laneOrder of laneOrders){
            for(const laneStaggerS of laneStaggers){
              for(const slotDelay of slotDelays){
                for(const phaseOffsets of phaseOffsetSets){
                  candidates.push({
                    id: `stage7-read-${laneSpread.id}-${rowSpread.id}-${laneOrder.id}-ls${String(laneStaggerS).replace('.','')}-sd${String(slotDelay).replace('.','')}-${phaseOffsets.id}`,
                    description: `Stage 7 readability sweep: lane spread ${laneSpread.id}, row spread ${rowSpread.id}, lane order ${laneOrder.id}, lane stagger ${laneStaggerS}, slot delay ${slotDelay}, phase ${phaseOffsets.id}.`,
                    layoutOverride: Object.assign({}, base, {
                      groupLaneSpreadScales: laneSpread.values,
                      groupRowSpreadScales: rowSpread.values,
                      groupLaneStaggers: Array.from({ length: 5 }, () => laneStaggerS),
                      groupSlotDelays: Array.from({ length: 5 }, () => slotDelay),
                      groupPhaseOffsets: phaseOffsets.values,
                      groupLaneOrders: Array.from({ length: 5 }, () => laneOrder.value)
                    })
                  });
                }
              }
            }
          }
        }
      }
      const lanePhaseSets = [
        { id: 'sync', value: [0, 0, 0, 0, 0, 0, 0, 0] },
        { id: 'zipper', value: [0, 0.055, 0.11, 0.165, 0, 0.055, 0.11, 0.165] },
        { id: 'fanphase', value: [-0.08, -0.035, 0.035, 0.08, -0.08, -0.035, 0.035, 0.08] }
      ];
      const deconflictSpreadSets = [
        { id: 'light', values: [4, 5, 4, 5, 4] },
        { id: 'mid', values: [8, 9, 8, 9, 8] },
        { id: 'strong', values: [12, 12, 10, 12, 10] },
        { id: 'wide', values: [16, 16, 14, 16, 14] },
        { id: 'maxsafe', values: [22, 20, 18, 22, 18] }
      ];
      const deconflictLaneBiasSets = [
        { id: 'nobias', values: [0, 0, 0, 0, 0] },
        { id: 'softbias', values: [2.5, 2.5, 2, 2.5, 2] },
        { id: 'wavebias', values: [4.5, 4, 3.5, 4.5, 3.5] }
      ];
      const deconflictYOffsets = [
        { id: 'flat', values: [0, 0, 0, 0, 0] },
        { id: 'lift', values: [2.5, 2.5, 2, 3, 2.5] },
        { id: 'tiered', values: [4, 3, 4, 5, 3] }
      ];
      const deconflictLaneOrder = [3, 1, 0, 2, 5, 7, 4, 6];
      for(const spread of deconflictSpreadSets){
        for(const laneBias of deconflictLaneBiasSets){
          for(const yOffset of deconflictYOffsets){
            for(const lanePhase of lanePhaseSets){
              candidates.push({
                id: `stage7-deconflict-${spread.id}-${laneBias.id}-${yOffset.id}-${lanePhase.id}`,
                description: `Stage 7 deconfliction sweep: direct separation ${spread.id}, lane bias ${laneBias.id}, y offset ${yOffset.id}, lane phase ${lanePhase.id}.`,
                layoutOverride: Object.assign({}, base, {
                  groupLaneSpreadScales: [1.36, 1.24, 1.16, 1.36, 1.24],
                  groupRowSpreadScales: [1.14, 1.22, 1.1, 1.24, 1.22],
                  groupSlotDelays: Array.from({ length: 5 }, () => 0.18),
                  groupLaneStaggers: Array.from({ length: 5 }, () => 0.035),
                  groupLaneOrders: Array.from({ length: 5 }, () => deconflictLaneOrder),
                  groupLanePhaseOffsets: Array.from({ length: 5 }, () => lanePhase.value),
                  groupDeconflictSpreads: spread.values,
                  groupDeconflictLaneBiases: laneBias.values,
                  groupDeconflictYOffsets: yOffset.values,
                  groupDeconflictPhases: [0, 0.04, 0.08, 0.12, 0.16]
                })
              });
            }
          }
        }
      }
      const routeContracts = [
        {
          id: 'spread-left-right',
          x: [-26, -13, 0, 14, 28],
          y: [0, 4, -3, 5, 0],
          curveX: [8, 10, 6, 10, 8],
          curveY: [0, 2, 0, 2, 0],
          phase: [0, 0.05, 0.1, 0.15, 0.2]
        },
        {
          id: 'stair-step',
          x: [-18, -8, 4, 16, 26],
          y: [-4, 2, 8, 2, -4],
          curveX: [10, 7, 5, 7, 10],
          curveY: [2, 3, 4, 3, 2],
          phase: [0, 0.08, 0.16, 0.24, 0.32]
        },
        {
          id: 'crossing-lanes',
          x: [-22, 16, -8, 20, 4],
          y: [2, -2, 6, -4, 4],
          curveX: [12, -10, 8, -12, 6],
          curveY: [3, 3, 2, 4, 2],
          phase: [0.02, 0.1, 0.18, 0.26, 0.34]
        }
      ];
      const routeBaseLaneOrders = [
        { id: 'id', value: [0, 1, 2, 3, 4, 5, 6, 7] },
        { id: 'fan', value: [3, 1, 0, 2, 5, 7, 4, 6] }
      ];
      const routePhase = [0, 0.045, 0.09, 0.135, 0, 0.045, 0.09, 0.135];
      for(const contract of routeContracts){
        for(const laneOrder of routeBaseLaneOrders){
          for(const slotDelay of [0.16, 0.2, 0.24]){
            candidates.push({
              id: `stage7-route-${contract.id}-${laneOrder.id}-sd${String(slotDelay).replace('.','')}`,
              description: `Stage 7 route-aware contract candidate: ${contract.id}, lane order ${laneOrder.id}, slot delay ${slotDelay}.`,
              layoutOverride: Object.assign({}, base, {
                groupLaneSpreadScales: [1.36, 1.24, 1.16, 1.36, 1.24],
                groupRowSpreadScales: [1.14, 1.22, 1.1, 1.24, 1.22],
                groupSlotDelays: Array.from({ length: 5 }, () => slotDelay),
                groupLaneStaggers: Array.from({ length: 5 }, () => 0.035),
                groupLaneOrders: Array.from({ length: 5 }, () => laneOrder.value),
                groupLanePhaseOffsets: Array.from({ length: 5 }, () => routePhase),
                groupRouteOffsetsX: contract.x,
                groupRouteOffsetsY: contract.y,
                groupRouteCurveXs: contract.curveX,
                groupRouteCurveYs: contract.curveY,
                groupRoutePhases: contract.phase
              })
            });
          }
        }
      }
      const comboDeconflicts = [
        { id: 'wide-soft-flat', spread: [16, 16, 14, 16, 14], bias: [2.5, 2.5, 2, 2.5, 2], y: [0, 0, 0, 0, 0], phaseSet: lanePhaseSets[0].value },
        { id: 'strong-soft-tiered', spread: [12, 12, 10, 12, 10], bias: [2.5, 2.5, 2, 2.5, 2], y: [4, 3, 4, 5, 3], phaseSet: lanePhaseSets[1].value }
      ];
      for(const contract of routeContracts.slice(0, 2)){
        for(const deconflict of comboDeconflicts){
          for(const laneOrder of routeBaseLaneOrders){
            for(const slotDelay of [0.14, 0.16]){
              candidates.push({
                id: `stage7-route-deconflict-${contract.id}-${deconflict.id}-${laneOrder.id}-sd${String(slotDelay).replace('.','')}`,
                description: `Stage 7 route-aware plus direct deconfliction candidate: route ${contract.id}, deconflict ${deconflict.id}, lane order ${laneOrder.id}, slot delay ${slotDelay}.`,
                layoutOverride: Object.assign({}, base, {
                  groupLaneSpreadScales: [1.36, 1.24, 1.16, 1.36, 1.24],
                  groupRowSpreadScales: [1.14, 1.22, 1.1, 1.24, 1.22],
                  groupSlotDelays: Array.from({ length: 5 }, () => slotDelay),
                  groupLaneStaggers: Array.from({ length: 5 }, () => 0.035),
                  groupLaneOrders: Array.from({ length: 5 }, () => laneOrder.value),
                  groupLanePhaseOffsets: Array.from({ length: 5 }, () => deconflict.phaseSet),
                  groupRouteOffsetsX: contract.x,
                  groupRouteOffsetsY: contract.y,
                  groupRouteCurveXs: contract.curveX,
                  groupRouteCurveYs: contract.curveY,
                  groupRoutePhases: contract.phase,
                  groupDeconflictSpreads: deconflict.spread,
                  groupDeconflictLaneBiases: deconflict.bias,
                  groupDeconflictYOffsets: deconflict.y,
                  groupDeconflictPhases: [0, 0.04, 0.08, 0.12, 0.16]
                })
              });
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
      const runtimeCandidate = Object.assign({}, candidate, {
        layoutOverride: specAwareLayoutOverride(candidate.layoutOverride || {})
      });
      const measured = await page.evaluate(({ stage, sampleTimes, candidate }) => {
        const h = window.__galagaHarness__;
        h.setupChallengeMotionProfileTest({ stage, layoutOverride: candidate.layoutOverride || null });
        const setupEvents = h.recentEvents({ count: 200 }) || [];
        const eventWindowStartT = setupEvents.reduce((max, event) => Math.max(max, Number.isFinite(+event.t) ? +event.t : max), -Infinity);
        const layout = h.challengeFormationState().layout;
        const tracks = {};
        const leadIns = {};
        const record = t => {
          const formation = h.challengeFormationState();
          for(const e of formation.enemies || []){
            if(Number.isFinite(+e.spawn) && +e.spawn > 0.03){
              if(Number.isFinite(+e.referenceLeadIn) && +e.referenceLeadIn > 0){
                const wave = Number.isFinite(+e.wave) ? +e.wave : -1;
                if(!leadIns[wave]) leadIns[wave] = [];
                leadIns[wave].push({
                  t,
                  wave,
                  lane: e.lane,
                  referenceLeadIn: e.referenceLeadIn,
                  spawn: e.spawn,
                  x: e.x,
                  y: e.y
                });
              }
              continue;
            }
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
          leadIns: Object.entries(leadIns).map(([wave, points]) => ({
            wave: +wave,
            sampleCount: points.length,
            firstT: points.length ? Math.min(...points.map(point => +point.t || 0)) : null,
            maxLeadIn: points.length ? Math.max(...points.map(point => +point.referenceLeadIn || 0)) : 0
          })),
          eventWindow: {
            startT: Number.isFinite(eventWindowStartT) ? +eventWindowStartT.toFixed(3) : null,
            sampledEvents: recent.length
          }
        };
      }, { stage: STAGE, sampleTimes: SAMPLE_TIMES, candidate: runtimeCandidate });
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
  const perfectPotential = humanPerfectPotential(measured);
  const noSafetyRegression = measured.eventCounts.enemyShots === 0
    && measured.eventCounts.enemyAttackStarts === 0
    && measured.eventCounts.shipLosses === 0;
  const visibleGuardrails = humanVisibleGuardrails(measured, noSafetyRegression);
  const visualPresence = visualPresenceMetrics(measured);
  const bestMatch = matches[0] || null;
  const expectedScore10 = expected?.score10 || 0;
  const bestScore10 = bestMatch?.score10 || 0;
  const expectedReferenceHit = EXPECTED_LABELS.includes(bestMatch?.labelId);
  const identityMargin10 = round(expectedScore10 - bestScore10, 2);
  const wrongReferencePenalty10 = expectedReferenceHit ? 0 : round(Math.max(0, bestScore10 - expectedScore10), 2);
  const expectedChallengeNumber = challengeNumberForStage(STAGE);
  const bestMatchChallengeNumber = challengeNumberForLabel(bestMatch?.labelId);
  const bestMatchChallengeDelta = Number.isFinite(+expectedChallengeNumber) && Number.isFinite(+bestMatchChallengeNumber)
    ? Math.abs(+expectedChallengeNumber - +bestMatchChallengeNumber)
    : null;
  const expectedFamilies = expectedFamiliesForMatches(matches);
  const bestFamilyIsExpected = !!(bestMatch?.entityFamily && expectedFamilies.includes(bestMatch.entityFamily));
  const isLateStageChallenge = STAGE >= 19;
  const wrongChallengeNumber = !!(isLateStageChallenge && Number.isFinite(+bestMatchChallengeDelta) && bestMatchChallengeDelta > 0);
  const lateWrongChallengePenalty10 = wrongChallengeNumber
    ? round(Math.min(2.75,
      0.55
      + (bestMatchChallengeDelta * 0.22)
      + (Math.max(0, bestScore10 - expectedScore10) * 0.45)
      + (bestFamilyIsExpected ? 0 : 0.35)), 2)
    : 0;
  const lateStageIdentityPass = !isLateStageChallenge
    || expectedReferenceHit
    || (!wrongChallengeNumber && bestFamilyIsExpected && identityMargin10 >= -0.08);
  const identityConfidence = expectedReferenceHit
    ? 1
    : round(clamp((identityMargin10 + 1.15) / 1.35) * clamp(expectedScore10 / 6.2), 3);
  const adjustedIdentityConfidence = lateStageIdentityPass ? identityConfidence : round(identityConfidence * 0.35, 3);
  const targetVideoScore10 = targetVideoFit.score10 || 0;
  const humanPerfectScore10 = perfectPotential.score10 || 0;
  return Object.assign({}, measured, {
    trackCount: classifications.length,
    runtimeVector: vector,
    runtimeSemantic: semantic,
    bestMatch,
    expectedMatch: expected,
    expectedReferenceHit,
    stageIdentity: {
      expectedLabels: EXPECTED_LABELS,
      expectedChallengeNumber,
      bestMatchChallengeNumber,
      bestMatchChallengeDelta,
      expectedFamilies,
      bestFamilyIsExpected,
      expectedScore10,
      bestScore10,
      identityMargin10,
      wrongReferencePenalty10,
      lateStageIdentityPass,
      lateWrongChallengePenalty10,
      confidence: adjustedIdentityConfidence,
      rawConfidence: identityConfidence,
      read: expectedReferenceHit
        ? 'Best measured label is one of the expected labels for this challenge stage.'
        : !lateStageIdentityPass
          ? `Late-stage identity blocked: best measured label is ${bestMatch?.labelId || 'none'}, not challenge ${expectedChallengeNumber}; expected-stage score trails by ${Math.abs(identityMargin10)}/10.`
        : `Best measured label is ${bestMatch?.labelId || 'none'}; expected-stage score trails by ${Math.abs(identityMargin10)}/10.`
    },
    targetVideoObjectFit: targetVideoFit,
    humanPerfectPotential: perfectPotential,
    humanVisibleGuardrails: visibleGuardrails,
    visualPresence,
    noSafetyRegression,
    selectionScore10: round(
      (expectedScore10 * 0.62)
      + (targetVideoScore10 * 0.24)
      + (humanPerfectScore10 * 0.04)
      + ((visibleGuardrails.score10 || 0) * 0.08)
      + (adjustedIdentityConfidence * 1.1)
      + (noSafetyRegression ? 0.3 : -2.75)
      - (wrongReferencePenalty10 * 0.65)
      - (lateWrongChallengePenalty10 * 0.85)
      - (visibleGuardrails.pass ? 0 : 1.4),
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
    humanPerfectPotentialScore10: row.humanPerfectPotential?.score10 || null,
    humanPerfectGuard: row.humanPerfectGuard || null,
    humanVisibleGuardrails: row.humanVisibleGuardrails || null,
    selectionScore10: row.selectionScore10,
    expectedReferenceHit: !!row.expectedReferenceHit,
    stageIdentityMargin10: row.stageIdentity?.identityMargin10 ?? null,
    wrongReferencePenalty10: row.stageIdentity?.wrongReferencePenalty10 ?? 0,
    lateStageIdentityPass: row.stageIdentity?.lateStageIdentityPass ?? null,
    lateWrongChallengePenalty10: row.stageIdentity?.lateWrongChallengePenalty10 ?? 0,
    expectedChallengeNumber: row.stageIdentity?.expectedChallengeNumber ?? null,
    bestMatchChallengeNumber: row.stageIdentity?.bestMatchChallengeNumber ?? null,
    bestFamilyIsExpected: row.stageIdentity?.bestFamilyIsExpected ?? null,
    noSafetyRegression: !!row.noSafetyRegression,
    bestMatchLabelId: row.bestMatch?.labelId || null,
    bestMatchScore10: row.bestMatch?.score10 || 0,
    expectedMatchLabelId: row.expectedMatch?.labelId || null,
    groupPathFamilies: row.layout?.groupPathFamilies || [],
    groupSpawnOffsets: row.layout?.groupSpawnOffsets || [],
    groupLowerFieldBiases: row.layout?.groupLowerFieldBiases || [],
    groupYOffsets: row.layout?.groupYOffsets || [],
    groupLaneSpreadScales: row.layout?.groupLaneSpreadScales || [],
    groupRowSpreadScales: row.layout?.groupRowSpreadScales || [],
    groupLaneStaggers: row.layout?.groupLaneStaggers || [],
    groupLanePhaseOffsets: row.layout?.groupLanePhaseOffsets || [],
    groupSlotDelays: row.layout?.groupSlotDelays || [],
    groupDeconflictSpreads: row.layout?.groupDeconflictSpreads || [],
    groupDeconflictLaneBiases: row.layout?.groupDeconflictLaneBiases || [],
    groupDeconflictYOffsets: row.layout?.groupDeconflictYOffsets || [],
    groupDeconflictPhases: row.layout?.groupDeconflictPhases || [],
    groupRouteOffsetsX: row.layout?.groupRouteOffsetsX || [],
    groupRouteOffsetsY: row.layout?.groupRouteOffsetsY || [],
    groupRouteCurveXs: row.layout?.groupRouteCurveXs || [],
    groupRouteCurveYs: row.layout?.groupRouteCurveYs || [],
    groupRoutePhases: row.layout?.groupRoutePhases || [],
    groupLaneOrders: row.layout?.groupLaneOrders || [],
    visualPresence: row.visualPresence || null,
    visualPresenceRegressionGuard: row.visualPresenceRegressionGuard || null
  };
}

function fullAnalyzerRiskForCandidate(candidate, context){
  const expectedLift = round((candidate.expectedMatch?.score10 || 0) - context.baselineExpectedScore, 2);
  const targetVideoLift = round((candidate.targetVideoObjectFit?.score10 || 0) - context.baselineTargetVideoScore, 2);
  const rejectedReviews = Array.isArray(context.rejectedReviews) ? context.rejectedReviews : [];
  const exactRejection = rejectedReviews.find(review => review.candidateId === candidate.candidateId);
  if(exactRejection){
    return {
      pass: false,
      reason: 'prior-full-analyzer-rejection',
      source: exactRejection.sourceFile || null,
      decision: exactRejection.decision || null,
      expectedLift10: expectedLift,
      targetVideoObjectFitLift10: targetVideoLift,
      trialDeltas: exactRejection.deltas || {},
      read: exactRejection.read || `Candidate ${candidate.candidateId} was already rejected by a full challenge-stage analyzer trial.`
    };
  }
  const relevantRejection = rejectedReviews
    .filter(review => Number.isFinite(+(review.summary?.sweepExpectedLift10)) || Number.isFinite(+(review.summary?.sweepTargetVideoObjectFitLift10)))
    .sort((a, b) => {
      const aLift = (+(a.summary?.sweepExpectedLift10) || 0) + (+(a.summary?.sweepTargetVideoObjectFitLift10) || 0);
      const bLift = (+(b.summary?.sweepExpectedLift10) || 0) + (+(b.summary?.sweepTargetVideoObjectFitLift10) || 0);
      return bLift - aLift;
    })[0] || null;
  if(relevantRejection){
    const rejectedExpectedLift = +(relevantRejection.summary?.sweepExpectedLift10) || 0;
    const rejectedTargetLift = +(relevantRejection.summary?.sweepTargetVideoObjectFitLift10) || 0;
    const clearsExpected = expectedLift >= rejectedExpectedLift + 0.2;
    const clearsTarget = targetVideoLift >= rejectedTargetLift + 0.4 && expectedLift >= rejectedExpectedLift;
    if(!clearsExpected && !clearsTarget){
      return {
        pass: false,
        reason: 'below-calibrated-full-analyzer-threshold',
        source: relevantRejection.sourceFile || null,
        decision: relevantRejection.decision || null,
        expectedLift10: expectedLift,
        targetVideoObjectFitLift10: targetVideoLift,
        rejectedExpectedLift10: round(rejectedExpectedLift, 2),
        rejectedTargetVideoObjectFitLift10: round(rejectedTargetLift, 2),
        read: `Candidate lift does not clear the latest rejected full-analyzer calibration for stage ${STAGE}: expected lift ${expectedLift}/10 and target-video lift ${targetVideoLift}/10 are not materially stronger than rejected lift ${round(rejectedExpectedLift, 2)}/10 and ${round(rejectedTargetLift, 2)}/10.`
      };
    }
  }
  return {
    pass: true,
    reason: 'no-recorded-full-analyzer-block',
    expectedLift10: expectedLift,
    targetVideoObjectFitLift10: targetVideoLift,
    read: 'No recorded full-analyzer rejection blocks this candidate.'
  };
}

function buildMarkdown(report){
  const topRows = report.candidates.slice(0, 12).map((row, index) => {
    const hit = row.expectedReferenceHit ? 'yes' : 'no';
    const eventRead = row.noSafetyRegression ? 'pass' : `risk ${JSON.stringify(row.eventCounts)}`;
    const fullAnalyzerRead = row.fullAnalyzerRisk?.pass === false ? `blocked: ${row.fullAnalyzerRisk.reason}` : 'pass';
    const humanPerfectRead = row.humanPerfectGuard?.pass === false
      ? `blocked: ${row.humanPerfectGuard.lift10}/10`
      : `${row.humanPerfectPotential?.score10 ?? 'n/a'}/10`;
    const visibleRead = row.humanVisibleGuardrails?.pass === false
      ? `blocked: ${row.humanVisibleGuardrails.score10}/10`
      : `${row.humanVisibleGuardrails?.score10 ?? 'n/a'}/10`;
    const presenceRead = row.visualPresenceRegressionGuard?.pass === false
      ? 'blocked'
      : 'pass';
    return `| ${index + 1} | ${row.candidateId} | ${row.selectionScore10}/10 | ${row.expectedMatch?.score10 ?? 0}/10 | ${row.targetVideoObjectFit?.score10 ?? 'n/a'}/10 | ${humanPerfectRead} | ${visibleRead} | ${presenceRead} | ${row.stageIdentity?.identityMargin10 ?? 'n/a'} | ${row.bestMatch?.labelId || 'none'} (${row.bestMatch?.score10 ?? 0}/10) | ${hit} | ${eventRead} | ${fullAnalyzerRead} |`;
  }).join('\n');
  const diagnosticRow = row => `| ${row.candidateId} | ${row.expectedScore10}/10 | ${row.targetVideoObjectFitScore10 ?? 'n/a'}/10 | ${row.humanPerfectPotentialScore10 ?? 'n/a'}/10 | ${row.humanVisibleGuardrails?.score10 ?? 'n/a'}/10 | ${row.visualPresenceRegressionGuard?.pass === false ? 'blocked' : 'pass'} | ${row.stageIdentityMargin10 ?? 'n/a'} | ${row.bestMatchLabelId || 'none'} (${row.bestMatchScore10}/10) | ${row.expectedReferenceHit ? 'yes' : 'no'} | ${row.lateStageIdentityPass === false ? `blocked (${row.bestMatchChallengeNumber || 'n/a'} vs ${row.expectedChallengeNumber || 'n/a'})` : 'pass'} | ${row.humanPerfectGuard?.pass === false ? `risk ${row.humanPerfectGuard.lift10}/10` : 'pass'} | ${row.humanVisibleGuardrails?.pass === false ? 'blocked' : 'pass'} | ${row.noSafetyRegression ? 'pass' : 'risk'} | ${(row.groupPathFamilies || []).join(', ') || 'default'} |`;
  const emptyDiagnosticRow = '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  const targetTimingRows = (report.diagnostics?.targetTimingTop || []).map(diagnosticRow).join('\n') || emptyDiagnosticRow;
  const targetControlRows = (report.diagnostics?.targetControlTop || []).map(diagnosticRow).join('\n') || emptyDiagnosticRow;
  const targetReferencePathRows = (report.diagnostics?.targetReferencePathTop || []).map(diagnosticRow).join('\n') || emptyDiagnosticRow;
  const pathShapeRows = (report.diagnostics?.pathShapeTop || []).map(diagnosticRow).join('\n') || emptyDiagnosticRow;
  const readabilityRows = (report.diagnostics?.readabilityTop || []).map(diagnosticRow).join('\n') || emptyDiagnosticRow;
  const leastBunchedRow = row => `| ${row.candidateId} | ${row.humanVisibleGuardrails?.bunchingRisk ?? 'n/a'} | ${row.humanVisibleGuardrails?.spacingScore ?? 'n/a'} | ${row.humanVisibleGuardrails?.score10 ?? 'n/a'}/10 | ${row.humanPerfectPotentialScore10 ?? 'n/a'}/10 | ${row.expectedScore10}/10 | ${row.targetVideoObjectFitScore10 ?? 'n/a'}/10 | ${row.noSafetyRegression ? 'pass' : 'risk'} | ${(row.groupDeconflictSpreads || []).join(', ') || 'none'} | ${(row.groupLanePhaseOffsets?.[0] || []).join(', ') || 'none'} |`;
  const leastBunchedRows = (report.diagnostics?.leastBunchedTop || []).map(leastBunchedRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  const deconflictRows = (report.diagnostics?.deconflictTop || []).map(leastBunchedRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  const routeRow = row => `| ${row.candidateId} | ${row.humanVisibleGuardrails?.bunchingRisk ?? 'n/a'} | ${row.humanVisibleGuardrails?.magicAppearanceRisk ?? 'n/a'} | ${row.humanVisibleGuardrails?.spacingScore ?? 'n/a'} | ${row.humanVisibleGuardrails?.score10 ?? 'n/a'}/10 | ${row.humanPerfectPotentialScore10 ?? 'n/a'}/10 | ${row.expectedScore10}/10 | ${row.targetVideoObjectFitScore10 ?? 'n/a'}/10 | ${(row.groupRouteOffsetsX || []).join(', ') || 'none'} | ${(row.groupRouteOffsetsY || []).join(', ') || 'none'} |`;
  const routeRows = (report.diagnostics?.routeAwareTop || []).map(routeRow).join('\n') || '| none | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |';
  return `# Stage ${report.stage} Challenge Candidate Sweep

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

Stage ${report.stage} currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: ${report.summary.baselineExpectedScore10}/10.
- Baseline human-perfect potential: ${report.summary.baselineHumanPerfectPotentialScore10}/10.
- Best candidate expected-reference score: ${report.summary.bestExpectedScore10}/10.
- Best candidate human-perfect potential: ${report.summary.bestHumanPerfectPotentialScore10}/10.
- Best candidate: ${report.summary.bestCandidateId}.
- Keeper decision: ${report.summary.keeperDecision}.
- Promotion blockers: ${(report.summary.promotionBlockers || []).length ? report.summary.promotionBlockers.join(' ') : 'none'}.
- Promotion wins: ${(report.summary.promotionWins || []).length ? report.summary.promotionWins.join(' ') : 'none'}.
- Player-facing meaning: ${report.summary.playerMeaning}
- Process meaning: ${report.summary.processMeaning}
- Candidate retention: ${report.candidateRetention?.retained ?? report.candidates.length}/${report.candidateRetention?.totalMeasured ?? report.candidateCount} retained; ${report.candidateRetention?.targetTimingDiagnostics ?? 0} target-timing diagnostics, ${report.candidateRetention?.targetControlDiagnostics ?? 0} target-control diagnostics, ${report.candidateRetention?.targetReferencePathDiagnostics ?? 0} target-reference-path diagnostics, ${report.candidateRetention?.pathShapeDiagnostics ?? 0} path-shape diagnostics, ${report.candidateRetention?.readabilityDiagnostics ?? 0} readability diagnostics, and ${report.candidateRetention?.leastBunchedDiagnostics ?? 0} least-bunched diagnostics preserved.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Target-Video Fit | Human-Perfect | Human-Visible | Presence | Identity Margin | Best Match | Expected Hit | Safety | Full Analyzer Gate |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- |
${topRows}

## Diagnostic Candidates

These rows are intentionally retained even when they are not promotion candidates. They show whether target-timed schedules or new path-shape primitives improve one measurement while failing expected-reference identity or safety.

### Target-Timing Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Human-Perfect | Human-Visible | Presence | Identity Margin | Best Match | Expected Hit | Late Identity | Human Guard | Visible Guard | Safety | Paths |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
${targetTimingRows}

### Target-Control Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Human-Perfect | Human-Visible | Presence | Identity Margin | Best Match | Expected Hit | Late Identity | Human Guard | Visible Guard | Safety | Paths |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
${targetControlRows}

### Target Reference-Path Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Human-Perfect | Human-Visible | Presence | Identity Margin | Best Match | Expected Hit | Late Identity | Human Guard | Visible Guard | Safety | Paths |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
${targetReferencePathRows}

### Path-Shape Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Human-Perfect | Human-Visible | Presence | Identity Margin | Best Match | Expected Hit | Late Identity | Human Guard | Visible Guard | Safety | Paths |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
${pathShapeRows}

### Readability Diagnostics

| Candidate | Expected Labels | Target-Video Fit | Human-Perfect | Human-Visible | Presence | Identity Margin | Best Match | Expected Hit | Late Identity | Human Guard | Visible Guard | Safety | Paths |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
${readabilityRows}

### Least-Bunched Diagnostics

These rows are ranked by lowest measured nearest-neighbor bunching risk first. They are process diagnostics: a low bunching score is useful only if it preserves visible scoring windows, expected stage identity, and safety.

| Candidate | Bunching Risk | Spacing | Human-Visible | Human-Perfect | Expected Labels | Target-Video Fit | Safety | Deconflict Spread | First Lane Phase Set |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${leastBunchedRows}

### Deconflict Primitive Diagnostics

These rows isolate the new direct separation primitive. If they do not appear among the least-bunched rows, the primitive ranges or scoring windows still need work before promotion.

| Candidate | Bunching Risk | Spacing | Human-Visible | Human-Perfect | Expected Labels | Target-Video Fit | Safety | Deconflict Spread | First Lane Phase Set |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${deconflictRows}

### Route-Aware Group Diagnostics

These rows test coherent whole-group route offsets. They are intended to reduce inter-group overlap and magic appearance without making individual aliens jitter away from their authored wave.

| Candidate | Bunching Risk | Magic Risk | Spacing | Human-Visible | Human-Perfect | Expected Labels | Target-Video Fit | Route X Offsets | Route Y Offsets |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
${routeRows}

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
  const baselineHumanPerfectScore = baseline.humanPerfectPotential?.score10 || 0;
  const baselineHumanVisibleScore = baseline.humanVisibleGuardrails?.score10 || 0;
  const baselineVisualPresence = baseline.visualPresence || visualPresenceMetrics(baseline);
  const rejectedFullAnalyzerReviews = rejectedFullAnalyzerReviewsForStage(STAGE);
  for(const row of scored){
    const humanPerfectLift = round((row.humanPerfectPotential?.score10 || 0) - baselineHumanPerfectScore, 2);
    row.humanPerfectGuard = {
      pass: humanPerfectLift >= -0.05,
      lift10: humanPerfectLift,
      baselineScore10: baselineHumanPerfectScore,
      candidateScore10: row.humanPerfectPotential?.score10 || 0,
      read: humanPerfectLift >= -0.05
        ? `Human-perfect potential preserved (${humanPerfectLift >= 0 ? '+' : ''}${humanPerfectLift}/10 versus baseline).`
        : `Human-perfect potential regressed ${Math.abs(humanPerfectLift)}/10 versus baseline; block runtime promotion until a full player-route review explains the tradeoff.`
    };
    row.visualPresenceRegressionGuard = visualPresenceRegressionGuard(row.visualPresence || visualPresenceMetrics(row), baselineVisualPresence);
    row.fullAnalyzerRisk = fullAnalyzerRiskForCandidate(row, {
      baselineExpectedScore,
      baselineTargetVideoScore,
      rejectedReviews: rejectedFullAnalyzerReviews
    });
  }
  const promotionCandidates = scored.filter(candidate => {
    const candidateExpectedLift = round((candidate.expectedMatch?.score10 || 0) - baselineExpectedScore, 2);
    const candidateTargetVideoLift = round((candidate.targetVideoObjectFit?.score10 || 0) - baselineTargetVideoScore, 2);
    const candidateNoHumanPerfectRegression = candidate.humanPerfectGuard?.pass !== false;
    const candidateNoHumanVisibleRegression = candidate.humanVisibleGuardrails?.pass !== false
      && ((candidate.humanVisibleGuardrails?.score10 || 0) >= baselineHumanVisibleScore - 0.25);
    const candidateNoVisualPresenceRegression = candidate.visualPresenceRegressionGuard?.pass !== false;
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
    const lateStageIdentityPass = candidate.stageIdentity?.lateStageIdentityPass !== false;
    const intendedStageSupported = lateStageIdentityPass && (candidate.expectedReferenceHit || candidateIdentityTieSupported || strongExpectedLift);
    return candidate.noSafetyRegression
      && candidateNoTargetRegression
      && candidateNoExpectedRegression
      && candidateNoHumanPerfectRegression
      && candidateNoHumanVisibleRegression
      && candidateNoVisualPresenceRegression
      && intendedStageSupported
      && candidate.fullAnalyzerRisk?.pass !== false
      && (candidateExpectedLift >= 0.35 || candidateTargetVideoLift >= 0.35 || (candidateExpectedLift >= 0.25 && candidateTargetVideoLift >= 0.25));
  }).sort((a, b) => {
    const aLift = ((a.expectedMatch?.score10 || 0) - baselineExpectedScore) + ((a.targetVideoObjectFit?.score10 || 0) - baselineTargetVideoScore);
    const bLift = ((b.expectedMatch?.score10 || 0) - baselineExpectedScore) + ((b.targetVideoObjectFit?.score10 || 0) - baselineTargetVideoScore);
    return bLift - aLift || b.selectionScore10 - a.selectionScore10 || a.candidateId.localeCompare(b.candidateId);
  });
  const best = promotionCandidates[0]
    || scored.find(candidate => candidate.noSafetyRegression && candidate.humanPerfectGuard?.pass !== false && candidate.visualPresenceRegressionGuard?.pass !== false)
    || scored.find(candidate => candidate.noSafetyRegression && candidate.visualPresenceRegressionGuard?.pass !== false)
    || scored[0];
  const expectedLift = round((best.expectedMatch?.score10 || 0) - (baseline.expectedMatch?.score10 || 0), 2);
  const targetVideoLift = round((best.targetVideoObjectFit?.score10 || 0) - (baseline.targetVideoObjectFit?.score10 || 0), 2);
  const humanPerfectLift = round((best.humanPerfectPotential?.score10 || 0) - baselineHumanPerfectScore, 2);
  const humanVisibleLift = round((best.humanVisibleGuardrails?.score10 || 0) - baselineHumanVisibleScore, 2);
  const noHumanPerfectRegression = best.humanPerfectGuard?.pass !== false;
  const noHumanVisibleRegression = best.humanVisibleGuardrails?.pass !== false
    && ((best.humanVisibleGuardrails?.score10 || 0) >= baselineHumanVisibleScore - 0.25);
  const noVisualPresenceRegression = best.visualPresenceRegressionGuard?.pass !== false;
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
  const lateStageIdentityPass = best.stageIdentity?.lateStageIdentityPass !== false;
  const intendedStageSupported = lateStageIdentityPass && (best.expectedReferenceHit || identityTieSupported || strongExpectedLift);
  const fullAnalyzerRisk = best.fullAnalyzerRisk || fullAnalyzerRiskForCandidate(best, {
    baselineExpectedScore,
    baselineTargetVideoScore,
    rejectedReviews: rejectedFullAnalyzerReviews
  });
  const materialLift = expectedLift >= 0.35 || targetVideoLift >= 0.35 || (expectedLift >= 0.25 && targetVideoLift >= 0.25);
  const promotionBlockers = [];
  const promotionWins = [];
  if(best.noSafetyRegression) promotionWins.push('No enemy-fire, enemy-attack, or ship-loss safety regression in the sampled challenge window.');
  else promotionBlockers.push(`Safety regression in sampled challenge window: ${JSON.stringify(best.eventCounts || {})}.`);
  if(noTargetVideoRegression) promotionWins.push(`Target-video object-track fit preserved (${targetVideoLift >= 0 ? '+' : ''}${targetVideoLift}/10 versus baseline).`);
  else promotionBlockers.push(`Target-video object-track fit regressed ${Math.abs(targetVideoLift)}/10 versus baseline.`);
  if(noExpectedRegression) promotionWins.push(`Expected-label score preserved (${expectedLift >= 0 ? '+' : ''}${expectedLift}/10 versus baseline).`);
  else promotionBlockers.push(`Expected-label score regressed ${Math.abs(expectedLift)}/10 versus baseline.`);
  if(noHumanPerfectRegression) promotionWins.push(`Human-perfect potential preserved (${humanPerfectLift >= 0 ? '+' : ''}${humanPerfectLift}/10 versus baseline).`);
  else promotionBlockers.push(`Human-perfect potential regressed ${Math.abs(humanPerfectLift)}/10 versus baseline.`);
  if(noHumanVisibleRegression) promotionWins.push(`Human-visible readability preserved (${humanVisibleLift >= 0 ? '+' : ''}${humanVisibleLift}/10 versus baseline).`);
  else if(best.humanVisibleGuardrails?.pass === false) promotionBlockers.push(`Human-visible guardrails still fail despite ${humanVisibleLift >= 0 ? '+' : ''}${humanVisibleLift}/10 score movement: ${best.humanVisibleGuardrails.read || 'subcondition failed'}`);
  else promotionBlockers.push(`Human-visible readability regressed ${Math.abs(humanVisibleLift)}/10 versus baseline.`);
  if(noVisualPresenceRegression) promotionWins.push(best.visualPresenceRegressionGuard?.read || 'Visual presence preserved versus baseline.');
  else promotionBlockers.push(best.visualPresenceRegressionGuard?.read || 'Visual presence regressed versus baseline.');
  if(intendedStageSupported) promotionWins.push('Expected challenge-stage identity remains supported.');
  else promotionBlockers.push(`Expected challenge-stage identity is not sufficiently supported; best match is ${best.bestMatch?.labelId || 'none'}.`);
  if(fullAnalyzerRisk.pass !== false) promotionWins.push(fullAnalyzerRisk.read || 'No full-analyzer calibration block.');
  else promotionBlockers.push(fullAnalyzerRisk.read || `Full-analyzer calibration blocks ${best.candidateId}.`);
  if(materialLift) promotionWins.push(`Candidate has material lift: expected ${expectedLift}/10, target-video ${targetVideoLift}/10.`);
  else promotionBlockers.push(`Candidate lacks material lift: expected ${expectedLift}/10, target-video ${targetVideoLift}/10.`);
  const keeper = best.noSafetyRegression && noTargetVideoRegression && noExpectedRegression && noHumanPerfectRegression && noHumanVisibleRegression && noVisualPresenceRegression && intendedStageSupported && fullAnalyzerRisk.pass !== false && materialLift;
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
  const readabilityDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('stage7-read'))
    .sort((a, b) => (b.humanVisibleGuardrails?.score10 || 0) - (a.humanVisibleGuardrails?.score10 || 0)
      || (b.humanPerfectPotential?.score10 || 0) - (a.humanPerfectPotential?.score10 || 0)
      || (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0)
      || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 12);
  const bunchingRiskOf = row => Number.isFinite(+(row.humanVisibleGuardrails?.bunchingRisk))
    ? +(row.humanVisibleGuardrails.bunchingRisk)
    : 1;
  const magicRiskOf = row => Number.isFinite(+(row.humanVisibleGuardrails?.magicAppearanceRisk))
    ? +(row.humanVisibleGuardrails.magicAppearanceRisk)
    : 1;
  const leastBunchedDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('stage7-read') || String(row.candidateId || '').includes('stage7-deconflict') || String(row.candidateId || '').includes('stage7-route'))
    .sort((a, b) => bunchingRiskOf(a) - bunchingRiskOf(b)
      || magicRiskOf(a) - magicRiskOf(b)
      || (b.humanVisibleGuardrails?.spacingScore || 0) - (a.humanVisibleGuardrails?.spacingScore || 0)
      || (b.humanVisibleGuardrails?.score10 || 0) - (a.humanVisibleGuardrails?.score10 || 0)
      || (b.humanPerfectPotential?.score10 || 0) - (a.humanPerfectPotential?.score10 || 0))
    .slice(0, 12);
  const deconflictDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('stage7-deconflict'))
    .sort((a, b) => bunchingRiskOf(a) - bunchingRiskOf(b)
      || (b.humanVisibleGuardrails?.spacingScore || 0) - (a.humanVisibleGuardrails?.spacingScore || 0)
      || (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0)
      || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 12);
  const routeAwareDiagnostics = scored
    .filter(row => String(row.candidateId || '').includes('stage7-route'))
    .sort((a, b) => bunchingRiskOf(a) - bunchingRiskOf(b)
      || magicRiskOf(a) - magicRiskOf(b)
      || (b.humanVisibleGuardrails?.spacingScore || 0) - (a.humanVisibleGuardrails?.spacingScore || 0)
      || (b.targetVideoObjectFit?.score10 || 0) - (a.targetVideoObjectFit?.score10 || 0)
      || (b.expectedMatch?.score10 || 0) - (a.expectedMatch?.score10 || 0))
    .slice(0, 12);
  const retainedById = new Map();
  for(const row of scored.slice(0, retainedCandidateLimit)) retainedById.set(row.candidateId, row);
  for(const row of targetTimingDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of targetControlDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of targetReferencePathDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of pathShapeDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of readabilityDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of leastBunchedDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of deconflictDiagnostics) retainedById.set(row.candidateId, row);
  for(const row of routeAwareDiagnostics) retainedById.set(row.candidateId, row);
  const retainedCandidates = Array.from(retainedById.values());
  if(!retainedCandidates.some(row => row.candidateId === baseline.candidateId)){
    retainedCandidates.push(baseline);
  }
  if(!retainedCandidates.some(row => row.candidateId === best.candidateId)){
    retainedCandidates.push(best);
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
      baselineHumanPerfectPotentialScore10: baseline.humanPerfectPotential?.score10 || null,
      baselineHumanVisibleScore10: baseline.humanVisibleGuardrails?.score10 || null,
      baselineBestMatch: baseline.bestMatch,
      bestCandidateId: best.candidateId,
      bestExpectedScore10: best.expectedMatch?.score10 || 0,
      bestTargetVideoObjectFitScore10: best.targetVideoObjectFit?.score10 || null,
      bestHumanPerfectPotentialScore10: best.humanPerfectPotential?.score10 || null,
      bestHumanVisibleScore10: best.humanVisibleGuardrails?.score10 || null,
      bestSelectionScore10: best.selectionScore10,
      bestMatch: best.bestMatch,
      expectedLift10: expectedLift,
      targetVideoObjectFitLift10: targetVideoLift,
      humanPerfectPotentialLift10: humanPerfectLift,
      humanVisibleLift10: humanVisibleLift,
      targetVideoComparable,
      noTargetVideoRegression,
      noExpectedRegression,
      noHumanPerfectRegression,
      noHumanVisibleRegression,
      noVisualPresenceRegression,
      intendedStageSupported,
      fullAnalyzerRisk,
      fullAnalyzerRejectionCount: rejectedFullAnalyzerReviews.length,
      promotionBlockers,
      promotionWins,
      lateStageIdentityPass,
      identityTieSupported,
      materialTargetVideoWin,
      strongExpectedLift,
      intendedStageSupportPolicy: 'runtime promotion requires no expected-label regression unless the expected label remains the best match and target-video fit improves by >=0.55/10 with no more than -0.15/10 expected drift. It also requires the best trajectory match to be one of the expected stage labels, an expected-label tie within 0.05/10 with >=0.3 expected lift and >=0.15 target-video lift, or a strong expected-label score >=7 with >=0.5 expected lift, >=0.8 target-video lift, and an identity margin no worse than -0.35/10. Human-perfect potential and human-visible guardrails must not regress versus baseline because challenge-stage conformance is not useful if a strong player loses readable scoring windows or if enemies appear/bunch incoherently. For late challenge stages, candidates whose best match belongs to the wrong Galaga challenge number are explicitly penalized and blocked from promotion.',
      keeperDecision: keeper ? 'candidate-ready-for-full-analyzer-review' : 'no-runtime-keeper-yet',
      playerMeaning: keeper
        ? `A measured stage-${STAGE} layout candidate is worth a temporary runtime review, but it must be confirmed by the full challenge-stage analyzer and persona guardrails before promotion.`
        : 'This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.',
      processMeaning: fullAnalyzerRisk.pass === false
        ? `Future challenge tuning can now reject candidates that look promising in a focused sweep but fail our recorded full-analyzer calibration: ${fullAnalyzerRisk.read}`
        : 'Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.',
      nextStep: keeper
        ? `Apply the best candidate temporarily, rerun full challenge-stage conformance plus guardrails, and accept it only if the full analyzer confirms the expected lift.`
        : noVisualPresenceRegression === false
          ? `Do not promote ${best.candidateId}; it fails the visual-presence guard, so author a coherent group route that preserves visible density and X/Y spread before another runtime trial.`
        : fullAnalyzerRisk.pass === false
          ? `Do not promote ${best.candidateId}; strengthen the full-stage scorer or author a richer Stage ${STAGE} contract before another runtime trial.`
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
      humanPerfectPotential: row.humanPerfectPotential,
      humanPerfectGuard: row.humanPerfectGuard,
      humanVisibleGuardrails: row.humanVisibleGuardrails,
      visualPresence: row.visualPresence,
      visualPresenceRegressionGuard: row.visualPresenceRegressionGuard,
      fullAnalyzerRisk: row.fullAnalyzerRisk,
      selectionScore10: row.selectionScore10
    })),
    candidateRetention: {
      totalMeasured: scored.length,
      retained: retainedCandidates.length,
      targetTimingDiagnostics: targetTimingDiagnostics.length,
      targetControlDiagnostics: targetControlDiagnostics.length,
      targetReferencePathDiagnostics: targetReferencePathDiagnostics.length,
      pathShapeDiagnostics: pathShapeDiagnostics.length,
      readabilityDiagnostics: readabilityDiagnostics.length,
      leastBunchedDiagnostics: leastBunchedDiagnostics.length,
      deconflictDiagnostics: deconflictDiagnostics.length,
      routeAwareDiagnostics: routeAwareDiagnostics.length,
      policy: `Keep the top ${retainedCandidateLimit} candidates by selection score, the baseline row, and top target-timing/target-control/target-reference-path/path-shape/readability/least-bunched/deconflict/route-aware diagnostic candidates; use candidateCount for the full measured search size.`
    },
    diagnostics: {
      targetTimingTop: targetTimingDiagnostics.map(summarizeCandidate),
      targetControlTop: targetControlDiagnostics.map(summarizeCandidate),
      targetReferencePathTop: targetReferencePathDiagnostics.map(summarizeCandidate),
      pathShapeTop: pathShapeDiagnostics.map(summarizeCandidate),
      readabilityTop: readabilityDiagnostics.map(summarizeCandidate),
      leastBunchedTop: leastBunchedDiagnostics.map(summarizeCandidate),
      deconflictTop: deconflictDiagnostics.map(summarizeCandidate),
      routeAwareTop: routeAwareDiagnostics.map(summarizeCandidate)
    },
    measurementPolicy: {
      scope: `harness-only stage-${STAGE} challenge layout candidates`,
      reference: 'media-backed Galaga challenge labels with comparison vectors',
      promotionRule: 'Require the expected challenge-label identity to be the best match or tied within 0.05/10 with evidence on both expected and target-video axes, no safety regression, no human-perfect potential regression, no human-visible guardrail regression, no visual-presence regression versus baseline, no matching full-analyzer rejection, and at least +0.35/10 expected-label or target-video lift over baseline before runtime promotion. A material target-video win may tolerate up to -0.15/10 expected drift only when expected identity remains the best match. Strong non-best candidates must be very close on identity margin and improve both expected and target-video scores. If a prior full-analyzer review rejected a similar or identical candidate, the sweep must clear that calibration by a material margin before it can be marked ready again. Any promotion-like sweep decision must be followed by a matching challenge-candidate-before-after precheck whose visual-presence guard passes before runtime review.',
      safety: 'Reject candidates with enemy shots, enemy attack starts, ship losses, lower human-perfect potential, in-playfield magic appearance, missing groups, or high bunching risk in the challenge window.'
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
    bestHumanPerfectPotentialScore10: report.summary.bestHumanPerfectPotentialScore10,
    expectedLift10: report.summary.expectedLift10,
    targetVideoObjectFitLift10: report.summary.targetVideoObjectFitLift10,
    humanPerfectPotentialLift10: report.summary.humanPerfectPotentialLift10,
    keeperDecision: report.summary.keeperDecision,
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

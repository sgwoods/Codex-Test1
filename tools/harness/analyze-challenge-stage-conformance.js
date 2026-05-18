#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'challenge-stage-conformance');
const CHALLENGE_STAGES = [3, 7, 11, 15, 19, 23, 27, 31];
const SAMPLE_TIMES = [0, 0.7, 1.4, 2.5, 4.2, 6.0, 8.5, 10.8, 12.4];

const STAGE_INTENT = {
  3: {
    challengeNumber: 1,
    windowId: 'challenge-stage-candidate',
    expectedReferenceLabels: ['challenge-1-arrival-group-1', 'challenge-1-late-wave-group-4'],
    expectedFirstWaveTypes: ['bee', 'but'],
    forbiddenFirstWaveTypes: ['boss', 'rogue'],
    target: 'First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.',
    criticalExpectation: 'Should teach the player that challenge stages are safe, scoreable pattern reads rather than combat waves.'
  },
  7: {
    challengeNumber: 2,
    windowId: 'challenge-stage-scorpion-cross',
    expectedReferenceLabels: ['challenge-2-arrival-group-1'],
    expectedReferenceSemantics: ['mixed', 'novelty', 'cross'],
    target: 'Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.',
    criticalExpectation: 'Should introduce a stronger mixed-family visual grammar and a learnable crossing pattern.'
  },
  11: {
    challengeNumber: 3,
    windowId: 'challenge-stage-stingray-hook',
    expectedReferenceLabels: ['challenge-3-arrival-group-1'],
    expectedReferenceSemantics: ['boss-led', 'novelty', 'dragonfly', 'hook'],
    target: 'Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.',
    criticalExpectation: 'Should read as a later Galaga challenge with alien novelty and a distinct high-bonus route.'
  },
  15: {
    challengeNumber: 4,
    windowId: 'challenge-stage-pink-serpentine',
    expectedReferenceLabels: [
      'challenge-4-pink-serpentine-group-1',
      'challenge-4-pink-serpentine-group-2',
      'challenge-4-pink-serpentine-group-3',
      'challenge-4-pink-serpentine-group-4',
      'challenge-4-pink-serpentine-group-5'
    ],
    expectedReferenceSemantics: ['pink', 'serpentine'],
    target: 'Fourth challenge should shift into long specialty serpentine arcs with obvious new color/family identity while staying nonlethal.',
    criticalExpectation: 'Should feel like the first truly late-stage set piece, not a boss-led remix of earlier challenge stages.'
  },
  19: {
    challengeNumber: 5,
    windowId: 'challenge-stage-pink-green-cascade',
    expectedReferenceLabels: [
      'challenge-5-pink-green-cascade-group-1',
      'challenge-5-pink-green-cascade-group-2',
      'challenge-5-pink-green-cascade-group-3',
      'challenge-5-pink-green-cascade-group-4',
      'challenge-5-pink-green-cascade-group-5'
    ],
    expectedReferenceSemantics: ['pink', 'green', 'cascade'],
    target: 'Fifth challenge should distinguish itself with pink/green cascade motion, alternating group identity, and stronger lower-field pass readability.',
    criticalExpectation: 'Should prove that late challenge progression is authored stage by stage, not repeated from Challenge 4.'
  },
  23: {
    challengeNumber: 6,
    windowId: 'challenge-stage-green-ladder-split',
    expectedReferenceLabels: [
      'challenge-6-green-ladder-split-group-1',
      'challenge-6-green-ladder-split-group-2',
      'challenge-6-green-ladder-split-group-3',
      'challenge-6-green-ladder-split-group-4',
      'challenge-6-green-ladder-split-group-5'
    ],
    expectedReferenceSemantics: ['green', 'ladder', 'split'],
    target: 'Sixth challenge should emphasize green ladder rhythm and split exits.',
    criticalExpectation: 'Should make staggered group timing and split route separation visible enough for a player to learn.'
  },
  27: {
    challengeNumber: 7,
    windowId: 'challenge-stage-yellow-diagonal-fan',
    expectedReferenceLabels: [
      'challenge-7-yellow-diagonal-fan-group-1',
      'challenge-7-yellow-diagonal-fan-group-2',
      'challenge-7-yellow-diagonal-fan-group-3',
      'challenge-7-yellow-diagonal-fan-group-4',
      'challenge-7-yellow-diagonal-fan-group-5'
    ],
    expectedReferenceSemantics: ['yellow', 'diagonal', 'fan'],
    target: 'Seventh challenge should introduce a yellow diagonal fan with a memorable scoring lane.',
    criticalExpectation: 'Should be visually and tactically unlike the prior ladder/cascade stages.'
  },
  31: {
    challengeNumber: 8,
    windowId: 'challenge-stage-blue-purple-finale',
    expectedReferenceLabels: [
      'challenge-8-blue-purple-finale-group-1',
      'challenge-8-blue-purple-finale-group-2',
      'challenge-8-blue-purple-finale-group-3',
      'challenge-8-blue-purple-finale-group-4',
      'challenge-8-blue-purple-finale-group-5'
    ],
    expectedReferenceSemantics: ['blue', 'purple', 'finale'],
    target: 'Eighth visible challenge should act as a compact blue/purple late-loop capstone.',
    criticalExpectation: 'Should avoid returning to early-stage column/cross vocabulary and make the late-loop identity obvious.'
  }
};

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
  fs.writeFileSync(file, String(value).replace(/\r\n/g, '\n').trimEnd() + '\n');
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 1){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
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

function challengeMatches(){
  const pathFamily = readJson(path.join(ANALYSES, 'formation-boss-path-family-comparison', 'latest.json'), {});
  const matches = pathFamily?.summary?.referenceTrajectoryComparison?.matches;
  return Array.isArray(matches) ? matches.filter(match => match.challenge) : [];
}

function challengeReferenceLabels(){
  const labels = readJson(path.join(ANALYSES, 'galaga-path-reference-labels', 'latest.json'), {});
  const accepted = Array.isArray(labels.acceptedLabels) ? labels.acceptedLabels : [];
  return accepted.filter(label => label.kind === 'challengeEntry');
}

function alienVariationRead(){
  return readJson(path.join(ANALYSES, 'alien-entry-challenge-variation', 'latest.json'), {});
}

function galagaTargetArtifactCoverageRead(){
  return readJson(path.join(ANALYSES, 'galaga-target-artifact-coverage', 'latest.json'), {});
}

function layoutSignature(layout){
  if(!layout) return 'layout pending';
  const lanes = Array.isArray(layout.laneTypes) ? layout.laneTypes.join(', ') : 'lane types pending';
  return `${layout.id || 'unknown'} / ${layout.pathFamily || 'unknown'}; lanes ${lanes}`;
}

function familySet(firstWave){
  return Array.from(new Set((firstWave || []).map(item => item.family).filter(Boolean))).sort();
}

function typeSet(firstWave){
  return Array.from(new Set((firstWave || []).map(item => item.type).filter(Boolean))).sort();
}

function typeSequence(firstWave){
  return (firstWave || []).map(item => item.type).filter(Boolean).join(', ');
}

function distinctCount(values){
  return new Set(values.filter(Boolean)).size;
}

function groupIdentity(runtime){
  const groups = Array.isArray(runtime?.groupSignatures) ? runtime.groupSignatures : [];
  if(!groups.length){
    return {
      score10: 0,
      component: 0,
      distinctTypeSequences: 0,
      distinctPathSignatures: 0,
      groupCount: 0,
      read: 'Group identity pending; no wave signatures were captured.'
    };
  }
  const typeKeys = groups.map(group => (group.types || []).join('|'));
  const pathKeys = groups.map(group => (group.pathFamilies || []).join('|'));
  const spawnSpans = groups.map(group => +group.spawnSpan || 0).filter(Number.isFinite);
  const avgSpawnSpan = average(spawnSpans);
  const distinctTypeSequences = distinctCount(typeKeys);
  const distinctPathSignatures = distinctCount(pathKeys);
  const typeRatio = groups.length ? distinctTypeSequences / groups.length : 0;
  const pathRatio = groups.length ? distinctPathSignatures / groups.length : 0;
  const timingSpread = clamp(avgSpawnSpan / 0.5);
  const score10 = round(10 * ((0.42 * typeRatio) + (0.34 * pathRatio) + (0.24 * timingSpread)), 1);
  return {
    score10,
    component: round(clamp(score10 / 10) * 0.9, 2),
    distinctTypeSequences,
    distinctPathSignatures,
    groupCount: groups.length,
    avgSpawnSpan: round(avgSpawnSpan, 3),
    read: `${distinctTypeSequences}/${groups.length} wave type signatures and ${distinctPathSignatures}/${groups.length} path signatures; average within-wave spawn span ${round(avgSpawnSpan, 2)}s.`
  };
}

function referenceLabelForStage(stage, intent, match, referenceLabels){
  const bestLabel = match?.bestMatch?.labelId || '';
  const expected = (intent.expectedReferenceLabels || [])
    .map(labelId => referenceLabels.find(label => label.labelId === labelId))
    .filter(Boolean);
  if(expected.length && match?.runtimeVector){
    const closestExpected = expected
      .filter(label => label.comparisonVector)
      .map(label => ({
        label,
        fit: trajectoryFit(match.runtimeVector, label.comparisonVector)
      }))
      .sort((a, b) => b.fit.rawFit - a.fit.rawFit || a.label.labelId.localeCompare(b.label.labelId))[0];
    if(closestExpected) return closestExpected.label;
  }
  if(bestLabel && intent.expectedReferenceLabels.includes(bestLabel)){
    return referenceLabels.find(label => label.labelId === bestLabel) || expected[0] || null;
  }
  if(expected.length) return expected[0];
  if(bestLabel) return referenceLabels.find(label => label.labelId === bestLabel) || null;
  return null;
}

function ratioToTarget(actual, target){
  const a = Number.isFinite(+actual) ? +actual : 0;
  const t = Number.isFinite(+target) ? +target : 0;
  if(t <= 0) return a <= 0.03 ? 1 : 0;
  return clamp(a / t);
}

function closenessToTarget(actual, target, tolerance){
  const a = Number.isFinite(+actual) ? +actual : 0;
  const t = Number.isFinite(+target) ? +target : 0;
  const tol = Math.max(Number.isFinite(+tolerance) ? +tolerance : 0.001, 0.001);
  return clamp(1 - (Math.abs(a - t) / tol));
}

function normalizeRuntimeMotion(samples){
  const waveSamples = new Map();
  for(const sample of samples || []){
    const byWave = new Map();
    for(const pos of sample.positions || []){
      const wave = Number.isFinite(+pos.wave) ? +pos.wave : 0;
      if(!byWave.has(wave)) byWave.set(wave, []);
      byWave.get(wave).push(pos);
    }
    for(const [wave, positions] of byWave.entries()){
      const xs = positions.map(pos => +pos.x).filter(Number.isFinite);
      const ys = positions.map(pos => +pos.y).filter(Number.isFinite);
      if(!xs.length || !ys.length) continue;
      if(!waveSamples.has(wave)) waveSamples.set(wave, []);
      waveSamples.get(wave).push({
        t: +sample.t || 0,
        centerX: xs.reduce((sum, value) => sum + value, 0) / xs.length,
        centerY: ys.reduce((sum, value) => sum + value, 0) / ys.length,
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
        lowerFieldShare: ys.filter(y => y > 180).length / ys.length
      });
    }
  }
  const groupVectors = Array.from(waveSamples.values()).map(points => {
    const xs = points.flatMap(point => [point.minX, point.maxX]);
    const ys = points.flatMap(point => [point.minY, point.maxY]);
    let pathPixels = 0;
    let turnCount = 0;
    let reversalCount = 0;
    let previousHeading = null;
    let previousDxSign = 0;
    for(let i = 1; i < points.length; i += 1){
      const a = points[i - 1];
      const b = points[i];
      const dx = b.centerX - a.centerX;
      const dy = b.centerY - a.centerY;
      pathPixels += Math.hypot(dx, dy);
      const heading = Math.atan2(dy, dx);
      if(previousHeading != null){
        const delta = Math.abs(Math.atan2(Math.sin(heading - previousHeading), Math.cos(heading - previousHeading)));
        if(delta > 0.65) turnCount += 1;
      }
      const dxSign = Math.sign(dx);
      if(dxSign && previousDxSign && dxSign !== previousDxSign) reversalCount += 1;
      if(dxSign) previousDxSign = dxSign;
      previousHeading = heading;
    }
    return {
      xRange: xs.length ? (Math.max(...xs) - Math.min(...xs)) / 280 : 0,
      yRange: ys.length ? (Math.max(...ys) - Math.min(...ys)) / 360 : 0,
      pathLength: pathPixels / 360,
      turnCount,
      reversalCount,
      lowerFieldShare: average(points.map(point => point.lowerFieldShare))
    };
  }).filter(vector => vector.xRange || vector.yRange || vector.pathLength);
  const populated = groupVectors.length ? groupVectors : (samples || []).filter(sample => Number.isFinite(+sample.centerX) && Number.isFinite(+sample.centerY));
  const xRange = average(populated.map(vector => +vector.xRange || 0));
  const yRange = average(populated.map(vector => +vector.yRange || 0));
  const pathLength = average(populated.map(vector => +vector.pathLength || 0));
  const turnCount = round(average(populated.map(vector => +vector.turnCount || 0)), 2);
  const reversalCount = round(average(populated.map(vector => +vector.reversalCount || 0)), 2);
  return {
    xRange: round(xRange, 4),
    yRange: round(yRange, 4),
    pathLength: round(pathLength, 4),
    turnCount,
    reversalCount,
    lowerFieldShare: round(average(populated.map(vector => +vector.lowerFieldShare || 0)), 4),
    rackSlotError: 0,
    timingOffsetS: 0
  };
}

function trajectoryFit(runtimeVector, target){
  if(!runtimeVector || !target) return { rawFit: 0, trajectoryScore10: 0, distance: 1 };
  const yRange = ratioToTarget(runtimeVector.yRange, target.yRange);
  const pathLength = ratioToTarget(runtimeVector.pathLength, target.pathLength);
  const turnCount = ratioToTarget(runtimeVector.turnCount, target.turnCount || 1);
  const reversalCount = closenessToTarget(runtimeVector.reversalCount, target.reversalCount || 0, 1);
  const lowerFieldShare = closenessToTarget(runtimeVector.lowerFieldShare, target.lowerFieldShare || 0, 0.14);
  const xRange = ratioToTarget(runtimeVector.xRange, target.xRange);
  const rawFit = clamp(
    (0.18 * xRange)
    + (0.22 * yRange)
    + (0.24 * pathLength)
    + (0.16 * turnCount)
    + (0.1 * reversalCount)
    + (0.1 * lowerFieldShare)
  );
  return {
    rawFit: round(rawFit, 4),
    trajectoryScore10: round(1 + rawFit * 8.2, 1),
    distance: round(1 - rawFit, 4),
    components: {
      xRange: round(xRange, 3),
      yRange: round(yRange, 3),
      pathLength: round(pathLength, 3),
      turnCount: round(turnCount, 3),
      reversalCount: round(reversalCount, 3),
      lowerFieldShare: round(lowerFieldShare, 3)
    }
  };
}

function referenceMatchForRuntime(stage, runtime, referenceLabels){
  const runtimeVector = runtime?.motionVector || null;
  if(!runtimeVector) return null;
  const intent = STAGE_INTENT[stage] || {};
  const expectedSemantics = (intent.expectedReferenceSemantics || []).map(item => String(item).toLowerCase());
  const runtimeSemanticText = [
    runtime?.layout?.id,
    runtime?.layout?.pathFamily,
    ...(runtime?.groupSignatures || []).flatMap(group => [
      ...(group.families || []),
      ...(group.pathFamilies || [])
    ])
  ].join(' ').toLowerCase();
  const semanticFitForLabel = (label) => {
    const labelText = [
      label.labelId,
      label.entityFamily,
      label.bonusOpportunity
    ].join(' ').toLowerCase();
    const expectedHits = expectedSemantics.length
      ? expectedSemantics.filter(token => labelText.includes(token) || runtimeSemanticText.includes(token)).length / expectedSemantics.length
      : 0;
    const challengeNumberHit = Number.isFinite(+label.challengeNumber)
      && Number.isFinite(+intent.challengeNumber)
      && +label.challengeNumber === +intent.challengeNumber;
    const expectedLabelHit = (intent.expectedReferenceLabels || []).includes(label.labelId);
    return clamp((expectedHits * 0.55) + (challengeNumberHit ? 0.25 : 0) + (expectedLabelHit ? 0.2 : 0));
  };
  const candidates = referenceLabels
    .filter(label => label.comparisonVector)
    .map(label => {
      const fit = trajectoryFit(runtimeVector, label.comparisonVector);
      const expectedBonus = (intent.expectedReferenceLabels || []).includes(label.labelId) ? 0.55 : 0;
      const semanticFit = semanticFitForLabel(label);
      const challengeDistance = Number.isFinite(+label.challengeNumber) && Number.isFinite(+intent.challengeNumber)
        ? Math.abs(+label.challengeNumber - +intent.challengeNumber)
        : 0;
      const stageProgressionPenalty = (intent.expectedReferenceLabels || []).includes(label.labelId)
        ? 0
        : Math.min(0.9, challengeDistance * 0.16);
      const semanticScore10 = round(semanticFit * 10, 1);
      return {
        labelId: label.labelId,
        kind: label.kind,
        entityFamily: label.entityFamily,
        sourceAnchor: label.sourceAnchor,
        distance: fit.distance,
        trajectoryScore10: fit.trajectoryScore10,
        semanticScore10,
        score10: round(Math.max(0, Math.min(10, fit.trajectoryScore10 + expectedBonus + (semanticFit * 0.75) - stageProgressionPenalty)), 1),
        components: Object.assign({}, fit.components, {
          semanticFit: round(semanticFit, 3),
          expectedBonus: round(expectedBonus, 3),
          stageProgressionPenalty: round(stageProgressionPenalty, 3)
        })
      };
    })
    .sort((a, b) => b.score10 - a.score10 || b.semanticScore10 - a.semanticScore10 || a.distance - b.distance || a.labelId.localeCompare(b.labelId));
  return {
    stage,
    challenge: true,
    runtimeVector,
    runtimeSemantic: {
      types: typeSet(runtime?.firstWave || []),
      families: familySet(runtime?.firstWave || [])
    },
    bestMatch: candidates[0] || null,
    alternatives: candidates.slice(1, 4),
    source: 'challenge-stage-runtime-motion-vector'
  };
}

function strictTrajectoryRead(runtimeVector, referenceLabel, match, expectedHit, lateReferenceGap){
  const target = referenceLabel?.comparisonVector || {};
  if(!runtimeVector || !referenceLabel || !target){
    return {
      score10: 1,
      rawFit: 0,
      referenceLabelId: referenceLabel?.labelId || null,
      components: {},
      read: 'Movement conformance starts at 1/10 because no durable Galaga challenge trajectory target was available for this stage.'
    };
  }
  const yRange = ratioToTarget(runtimeVector.yRange, target.yRange);
  const pathLength = ratioToTarget(runtimeVector.pathLength, target.pathLength);
  const turnCount = ratioToTarget(runtimeVector.turnCount, target.turnCount || 1);
  const reversalCount = closenessToTarget(runtimeVector.reversalCount, target.reversalCount || 0, 1);
  const lowerFieldShare = closenessToTarget(runtimeVector.lowerFieldShare, target.lowerFieldShare || 0, 0.12);
  const trajectoryScore = clamp((+match?.bestMatch?.trajectoryScore10 || 0) / 10);
  const rawFit = clamp(
    (0.24 * yRange)
    + (0.28 * pathLength)
    + (0.18 * turnCount)
    + (0.1 * reversalCount)
    + (0.08 * lowerFieldShare)
    + (0.12 * trajectoryScore)
  );
  const referenceReliability = lateReferenceGap ? 0.52 : (expectedHit ? 0.92 : 0.62);
  const temporalCoverage = 0.58; // Current probes are sampled path summaries, not full tracked temporal trajectories.
  const score10 = round(1 + (5.4 * rawFit * referenceReliability * temporalCoverage), 1);
  return {
    score10,
    rawFit: round(rawFit, 3),
    referenceLabelId: referenceLabel.labelId,
    referenceReliability,
    temporalCoverage,
    components: {
      yRange: round(yRange, 3),
      pathLength: round(pathLength, 3),
      turnCount: round(turnCount, 3),
      reversalCount: round(reversalCount, 3),
      lowerFieldShare: round(lowerFieldShare, 3),
      trajectoryBestMatch: round(trajectoryScore, 3)
    },
    read: `Strict movement score ${score10}/10 against ${referenceLabel.labelId}: y-range fit ${round(yRange, 2)}, path-length fit ${round(pathLength, 2)}, turn fit ${round(turnCount, 2)}. Current probes are still sampled summaries, so full temporal choreography is not yet proven.`
  };
}

function summarizeSpriteMotion(samples, runtime){
  const positions = (samples || []).flatMap(sample => (sample.positions || []).map(pos => Object.assign({ t: sample.t }, pos)));
  const active = positions.filter(pos => Number.isFinite(+pos.tm));
  const families = Array.from(new Set(active.map(pos => pos.family).filter(Boolean))).sort();
  const pathFamilies = Array.from(new Set(active.map(pos => pos.pathFamily).filter(Boolean))).sort();
  const flapStates = new Set(active.map(pos => pos.flapOpen === true ? 'open' : pos.flapOpen === false ? 'closed' : '').filter(Boolean));
  const phaseBuckets = new Set(active.map(pos => Number.isFinite(+pos.animationPhase) ? Math.floor(((+pos.animationPhase + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 3)) : null).filter(value => value !== null));
  const familyMotionCoverage = families.length ? families.filter(family => {
    const states = new Set(active.filter(pos => pos.family === family).map(pos => pos.flapOpen === true ? 'open' : pos.flapOpen === false ? 'closed' : '').filter(Boolean));
    return states.size >= 2;
  }).length / families.length : 0;
  const flapCycle = flapStates.size >= 2 ? 1 : 0;
  const phaseCoverage = clamp(phaseBuckets.size / 6);
  const poseDiversity = clamp(pathFamilies.length / 4);
  const visualFamilyDiversity = clamp(families.length / 4);
  const objectTrackedPixelSilhouette = summarizeObjectTrackedSilhouettes(samples);
  const activeMotionCoverage = clamp(
    (0.32 * flapCycle)
    + (0.28 * phaseCoverage)
    + (0.2 * familyMotionCoverage)
    + (0.12 * poseDiversity)
    + (0.08 * visualFamilyDiversity)
  );
  const combinedMotionCoverage = clamp((activeMotionCoverage * 0.72) + ((objectTrackedPixelSilhouette.coverage || 0) * 0.28));
  return {
    score10: round(1 + combinedMotionCoverage * 4.6, 1),
    activeMotionCoverage: round(activeMotionCoverage, 3),
    combinedMotionCoverage: round(combinedMotionCoverage, 3),
    objectTrackedPixelSilhouette,
    flapCycleObserved: !!flapCycle,
    flapStates: Array.from(flapStates).sort(),
    phaseBucketCount: phaseBuckets.size,
    families,
    pathFamilies,
    familyMotionCoverage: round(familyMotionCoverage, 3),
    poseDiversity: round(poseDiversity, 3),
    visualFamilyDiversity: round(visualFamilyDiversity, 3),
    measurementLimits: [
      'This now includes object-tracked runtime pixel/silhouette observations, but it is not yet full Galaga reference-frame silhouette matching.',
      'It observes flap phase, family diversity, path-pose diversity, and per-object lit-pixel/bounding-box variation inside challenge windows; target crop comparison in motion remains the next precision step.'
    ],
    read: active.length
      ? `Runtime sprite-motion hook observed ${families.length} visual family/families, ${pathFamilies.length} path pose family/families, ${phaseBuckets.size}/6 animation phase buckets, ${flapCycle ? 'both' : 'one'} flap state(s), and ${objectTrackedPixelSilhouette.trackedObjectCount || 0} object-tracked silhouette track(s).`
      : 'Runtime sprite-motion hook found no active challenge enemies in sampled windows.',
    runtimeLayoutId: runtime?.layout?.id || null
  };
}

let spriteTargetStatsCache = null;
function spriteTargetStats(){
  if(spriteTargetStatsCache) return spriteTargetStatsCache;
  const models = readJson(path.join(ANALYSES, 'galaga-reference-sprites', 'model-0.1.json'), {});
  const stats = new Map();
  for(const target of models.targets || []){
    const rows = Array.isArray(target.rows) ? target.rows : [];
    const lit = [];
    for(let y = 0; y < rows.length; y += 1){
      const row = String(rows[y] || '');
      for(let x = 0; x < row.length; x += 1){
        if(row[x] && row[x] !== '.') lit.push({ x, y });
      }
    }
    if(!lit.length) continue;
    const width = rows.reduce((max, row) => Math.max(max, String(row || '').length), 0) || target.logicalGrid?.cols || 1;
    const height = rows.length || target.logicalGrid?.rows || 1;
    const minX = Math.min(...lit.map(point => point.x));
    const maxX = Math.max(...lit.map(point => point.x));
    const minY = Math.min(...lit.map(point => point.y));
    const maxY = Math.max(...lit.map(point => point.y));
    const bboxW = Math.max(1, maxX - minX + 1);
    const bboxH = Math.max(1, maxY - minY + 1);
    const hash = spriteRowsOccupancyHash(rows, width, height);
    const row = {
      targetId: target.id,
      role: target.role,
      fillRatio: lit.length / Math.max(1, width * height),
      bboxFillRatio: lit.length / Math.max(1, bboxW * bboxH),
      bboxAspect: bboxW / bboxH,
      occupancyHash: hash
    };
    for(const key of target.catalogKeys || [target.role]){
      stats.set(key, row);
    }
  }
  spriteTargetStatsCache = stats;
  return stats;
}

function spriteRowsOccupancyHash(rows, width, height){
  const cols = 8;
  const gridRows = 6;
  const bits = [];
  for(let gy = 0; gy < gridRows; gy += 1){
    for(let gx = 0; gx < cols; gx += 1){
      const x0 = Math.floor(gx * width / cols);
      const x1 = Math.max(x0 + 1, Math.floor((gx + 1) * width / cols));
      const y0 = Math.floor(gy * height / gridRows);
      const y1 = Math.max(y0 + 1, Math.floor((gy + 1) * height / gridRows));
      let lit = 0;
      let cells = 0;
      for(let y = y0; y < y1; y += 1){
        const row = String(rows[y] || '');
        for(let x = x0; x < x1; x += 1){
          cells += 1;
          if(row[x] && row[x] !== '.') lit += 1;
        }
      }
      bits.push(lit / Math.max(1, cells) > 0.045 ? '1' : '0');
    }
  }
  return bits.join('');
}

function spriteTargetKeyForObservation(item){
  const family = String(item.family || '').toLowerCase();
  const type = String(item.type || '').toLowerCase();
  if(family === 'dragonfly') return 'challenge-dragonfly';
  if(family === 'mosquito') return 'challenge-mosquito';
  if(family === 'galboss' || family === 'crown') return 'boss-line';
  if(type === 'bee') return 'bee-line';
  if(type === 'but') return 'but-line';
  if(type === 'boss') return 'boss-line';
  if(type === 'rogue') return 'rogue-fighter';
  return null;
}

function bitSimilarity(a, b){
  const left = String(a || '');
  const right = String(b || '');
  const count = Math.min(left.length, right.length);
  if(!count) return 0;
  let same = 0;
  for(let i = 0; i < count; i += 1){
    if(left[i] === right[i]) same += 1;
  }
  return same / count;
}

function objectTargetFit(item, targets){
  const targetKey = spriteTargetKeyForObservation(item);
  const target = targetKey ? targets.get(targetKey) : null;
  if(!target) return null;
  const fillFit = closenessToTarget(item.bboxFillRatio, target.bboxFillRatio, 0.32);
  const aspectFit = closenessToTarget(item.bboxAspect, target.bboxAspect, 1.15);
  const hashFit = bitSimilarity(item.occupancyHash, target.occupancyHash);
  const score = clamp((0.36 * fillFit) + (0.28 * aspectFit) + (0.36 * hashFit));
  return {
    targetKey,
    targetId: target.targetId,
    score,
    fillFit,
    aspectFit,
    hashFit
  };
}

function summarizeObjectTrackedSilhouettes(samples){
  const targets = spriteTargetStats();
  const observations = (samples || []).flatMap(sample => (sample.positions || [])
    .filter(pos => pos.silhouette?.ok)
    .map(pos => ({
      id: pos.id,
      t: +sample.t || 0,
      wave: pos.wave,
      lane: pos.lane,
      type: pos.type,
      family: pos.family,
      pathFamily: pos.pathFamily,
      x: +pos.x,
      y: +pos.y,
      litPixels: +pos.silhouette.litPixels || 0,
      fillRatio: +pos.silhouette.fillRatio || 0,
      bboxFillRatio: +pos.silhouette.bboxFillRatio || 0,
      bboxAspect: +pos.silhouette.bboxAspect || 0,
      occupancyHash: pos.silhouette.occupancyHash || ''
    })));
  if(!observations.length){
    return {
      score10: 1,
      coverage: 0,
      trackedObjectCount: 0,
      trackedFrameCount: 0,
      read: 'Object-tracked pixel/silhouette probe found no measurable lit challenge sprites.'
    };
  }
  const byId = new Map();
  for(const item of observations){
    if(!byId.has(item.id)) byId.set(item.id, []);
    byId.get(item.id).push(item);
  }
  const tracks = Array.from(byId.values())
    .map(track => track.sort((a, b) => a.t - b.t))
    .filter(track => track.length);
  const repeatedTracks = tracks.filter(track => track.length >= 2);
  const trackDiversity = clamp(repeatedTracks.length / 12);
  const readableFill = clamp(average(observations.map(item => item.bboxFillRatio)) / 0.35);
  const litStability = clamp(1 - ((average(observations.map(item => Math.abs(item.fillRatio - 0.1))) || 0) / 0.16));
  const hashChangeShare = repeatedTracks.length
    ? average(repeatedTracks.map(track => {
      const hashes = new Set(track.map(item => item.occupancyHash).filter(Boolean));
      return clamp(hashes.size / Math.max(2, track.length));
    }))
    : 0;
  const bboxVariation = repeatedTracks.length
    ? average(repeatedTracks.map(track => {
      const aspects = track.map(item => item.bboxAspect).filter(Number.isFinite);
      const fills = track.map(item => item.bboxFillRatio).filter(Number.isFinite);
      const aspectRange = aspects.length ? Math.max(...aspects) - Math.min(...aspects) : 0;
      const fillRange = fills.length ? Math.max(...fills) - Math.min(...fills) : 0;
      return clamp((aspectRange / 0.9) + (fillRange / 0.45));
    }))
    : 0;
  for(const item of observations){
    item.targetFit = objectTargetFit(item, targets);
  }
  const targetFits = observations.map(item => item.targetFit).filter(Boolean);
  const targetFitCoverage = targetFits.length ? average(targetFits.map(item => item.score)) : 0;
  const targetFitFrameShare = observations.length ? targetFits.length / observations.length : 0;
  const coverage = clamp(
    (0.28 * trackDiversity)
    + (0.18 * readableFill)
    + (0.14 * litStability)
    + (0.14 * hashChangeShare)
    + (0.08 * bboxVariation)
    + (0.18 * targetFitCoverage)
  );
  const topTracks = tracks
    .sort((a, b) => b.length - a.length || String(a[0]?.id).localeCompare(String(b[0]?.id)))
    .slice(0, 6)
    .map(track => ({
      id: track[0].id,
      family: track[0].family,
      pathFamily: track[0].pathFamily,
      wave: track[0].wave,
      lane: track[0].lane,
      targetKey: track.find(item => item.targetFit)?.targetFit?.targetKey || null,
      targetFitScore10: round(1 + (average(track.map(item => item.targetFit?.score).filter(Number.isFinite)) || 0) * 5.2, 1),
      frameCount: track.length,
      litPixelsMean: round(average(track.map(item => item.litPixels)), 1),
      fillRatioRange: round(Math.max(...track.map(item => item.fillRatio)) - Math.min(...track.map(item => item.fillRatio)), 4),
      bboxAspectRange: round(Math.max(...track.map(item => item.bboxAspect)) - Math.min(...track.map(item => item.bboxAspect)), 4),
      hashStates: new Set(track.map(item => item.occupancyHash).filter(Boolean)).size,
      points: track.map(item => ({
        t: round(item.t, 2),
        x: round(item.x, 1),
        y: round(item.y, 1),
        fill: round(item.bboxFillRatio, 3),
        aspect: round(item.bboxAspect, 3)
      }))
    }));
  return {
    score10: round(1 + coverage * 4.8, 1),
    coverage: round(coverage, 3),
    trackedObjectCount: tracks.length,
    repeatedTrackCount: repeatedTracks.length,
    trackedFrameCount: observations.length,
    trackDiversity: round(trackDiversity, 3),
    readableFill: round(readableFill, 3),
    litStability: round(litStability, 3),
    hashChangeShare: round(hashChangeShare, 3),
    bboxVariation: round(bboxVariation, 3),
    targetFitCoverage: round(targetFitCoverage, 3),
    targetFitFrameShare: round(targetFitFrameShare, 3),
    targetFitScore10: round(1 + targetFitCoverage * 5.2, 1),
    topTracks,
    read: `Object-tracked silhouette probe measured ${observations.length} sprite crops across ${tracks.length} object track(s); ${repeatedTracks.length} track(s) persisted across multiple samples, with ${round(hashChangeShare, 2)} hash-change share, ${round(bboxVariation, 2)} bounding-box variation, and ${round(targetFitCoverage, 2)} Galaga sprite target-fit coverage.`
  };
}

function summarizeShotOpportunity(samples){
  const lanes = [32, 68, 104, 140, 176, 212, 248];
  const laneRows = lanes.map(x => ({ x, hits: 0, windows: 0, maxTargets: 0, lowerTargets: 0 }));
  const windowReads = [];
  for(const sample of samples || []){
    const active = (sample.positions || []).filter(pos => Number.isFinite(+pos.x) && Number.isFinite(+pos.y) && +pos.y >= 46 && +pos.y <= 302);
    if(!active.length) continue;
    const laneCounts = lanes.map((x, index) => {
      const targets = active.filter(pos => Math.abs(+pos.x - x) <= 13 + Math.max(0, (+pos.y - 90) / 32));
      laneRows[index].hits += targets.length;
      laneRows[index].maxTargets = Math.max(laneRows[index].maxTargets, targets.length);
      laneRows[index].lowerTargets += targets.filter(pos => +pos.y > 170).length;
      if(targets.length) laneRows[index].windows += 1;
      return { x, targets: targets.length };
    });
    const best = laneCounts.slice().sort((a, b) => b.targets - a.targets)[0];
    windowReads.push({
      t: +sample.t || 0,
      activeCount: active.length,
      bestLaneX: best?.x || null,
      bestLaneTargets: best?.targets || 0,
      laneCounts
    });
  }
  if(!windowReads.length){
    return {
      score10: 1,
      coverage: 0,
      read: 'Shot-opportunity probe found no active scoreable challenge targets.'
    };
  }
  const activeWindows = windowReads.length;
  const multiTargetWindowShare = windowReads.filter(row => row.bestLaneTargets >= 2).length / activeWindows;
  const laneDiversity = laneRows.filter(row => row.windows > 0).length / lanes.length;
  const maxCluster = clamp(Math.max(...laneRows.map(row => row.maxTargets)) / 6);
  const lowerFieldRead = clamp(laneRows.reduce((sum, row) => sum + row.lowerTargets, 0) / Math.max(1, laneRows.reduce((sum, row) => sum + row.hits, 0)));
  const centerBias = laneRows[3].hits / Math.max(1, laneRows.reduce((sum, row) => sum + row.hits, 0));
  const laneSpreadCredit = clamp(1 - Math.max(0, centerBias - 0.42) / 0.58);
  const coverage = clamp(
    (0.3 * multiTargetWindowShare)
    + (0.24 * laneDiversity)
    + (0.2 * maxCluster)
    + (0.14 * lowerFieldRead)
    + (0.12 * laneSpreadCredit)
  );
  return {
    score10: round(1 + coverage * 5.4, 1),
    coverage: round(coverage, 3),
    activeWindows,
    multiTargetWindowShare: round(multiTargetWindowShare, 3),
    laneDiversity: round(laneDiversity, 3),
    maxCluster: round(maxCluster, 3),
    lowerFieldRead: round(lowerFieldRead, 3),
    centerBias: round(centerBias, 3),
    laneSpreadCredit: round(laneSpreadCredit, 3),
    laneRows: laneRows.map(row => Object.assign({}, row, {
      laneShare: round(row.hits / Math.max(1, laneRows.reduce((sum, item) => sum + item.hits, 0)), 3)
    })),
    windowReads,
    read: `Shot-opportunity probe found scoreable targets in ${activeWindows} sampled windows; ${round(multiTargetWindowShare * 100, 0)}% had a lane with 2+ targets, lane diversity was ${round(laneDiversity, 2)}, and center-lane bias was ${round(centerBias, 2)}.`
  };
}

function strictGraphicsRead(stage, runtime, expectedHit){
  const firstWave = runtime?.firstWave || [];
  const types = typeSet(firstWave);
  const families = familySet(firstWave);
  const classicLineContract = stage === 3 && types.length === 2 && types.every(type => ['bee', 'but'].includes(type));
  const hasNonClassicVisual = families.some(family => family !== 'classic');
  const typeMixCredit = clamp(types.length / 4) * 0.18;
  const familyCredit = hasNonClassicVisual ? 0.14 : 0;
  const contractCredit = classicLineContract && expectedHit ? 0.18 : 0;
  const spriteMotion = runtime?.spriteMotion || summarizeSpriteMotion(runtime?.samples || [], runtime);
  const measuredRuntimeSpriteMotionCoverage = spriteMotion.activeMotionCoverage || 0;
  const objectSilhouetteCoverage = spriteMotion.objectTrackedPixelSilhouette?.coverage || 0;
  const objectTargetFitCoverage = spriteMotion.objectTrackedPixelSilhouette?.targetFitCoverage || 0;
  const activeMotionCap = objectTargetFitCoverage ? 4.6 : (objectSilhouetteCoverage ? 4.2 : (measuredRuntimeSpriteMotionCoverage ? 3.6 : 2.2));
  const spriteMotionCredit = (measuredRuntimeSpriteMotionCoverage * 0.24) + (objectSilhouetteCoverage * 0.3) + (objectTargetFitCoverage * 0.18);
  const score10 = round(Math.min(activeMotionCap, 1 + (4.0 * (typeMixCredit + familyCredit + contractCredit + spriteMotionCredit))), 1);
  return {
    score10,
    activeMotionCap,
    measuredRuntimeSpriteMotionCoverage,
    objectSilhouetteCoverage,
    spriteMotion,
    components: {
      alienTypeMix: round(typeMixCredit, 3),
      visualFamilyNovelty: round(familyCredit, 3),
      firstChallengeLineContract: round(contractCredit, 3),
      activeSpriteMotionCoverage: measuredRuntimeSpriteMotionCoverage,
      objectTrackedPixelSilhouetteCoverage: objectSilhouetteCoverage,
      objectTrackedTargetFitCoverage: round(objectTargetFitCoverage, 3),
      spriteMotionCredit: round(spriteMotionCredit, 3)
    },
    read: `Strict graphics score ${score10}/10. Current visible family/type labels are present and ${spriteMotion.read} Graphics remain capped at ${activeMotionCap}/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.`
  };
}

function strictAlienNoveltyRead(stage, runtime, score, expectedHit, lateReferenceGap){
  const types = typeSet(runtime?.firstWave || []);
  const families = familySet(runtime?.firstWave || []);
  const group = score.groupIdentity || groupIdentity(runtime);
  const expectedTypes = STAGE_INTENT[stage].expectedFirstWaveTypes || null;
  const firstChallengeSemantic = expectedTypes
    ? (types.length > 0 && types.every(type => expectedTypes.includes(type)) ? 0.35 : 0)
    : 0;
  const typeMix = clamp(types.length / 4) * 0.28;
  const familyNovelty = families.some(family => family !== 'classic') ? 0.22 : 0;
  const groupDiversity = clamp((+group.distinctTypeSequences || 0) / Math.max(+group.groupCount || 1, 1)) * 0.2;
  const referenceStageCredit = expectedHit ? 0.16 : (lateReferenceGap ? 0 : 0.08);
  const score10 = round(Math.min(3.4, 1 + (4.8 * (firstChallengeSemantic + typeMix + familyNovelty + groupDiversity + referenceStageCredit))), 1);
  return {
    score10,
    components: {
      firstChallengeSemantic,
      typeMix: round(typeMix, 3),
      familyNovelty,
      groupDiversity: round(groupDiversity, 3),
      referenceStageCredit
    },
    read: `Strict alien/progression novelty score ${score10}/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments.`
  };
}

function stageProgressionRead(stage, runtime, expectedHit, lateReferenceGap){
  const pathFamilies = Array.from(new Set((runtime?.groupSignatures || []).flatMap(group => group.pathFamilies || []))).filter(Boolean);
  const pathFamilyCredit = clamp(pathFamilies.length / 4) * 0.2;
  const referenceCredit = expectedHit ? 0.24 : 0;
  const latePenalty = lateReferenceGap ? -0.12 : 0;
  const stageRoleCredit = stage === 3 ? 0.12 : (stage === 7 || stage === 11 ? 0.16 : 0.08);
  const score10 = round(Math.max(1, Math.min(3.2, 1 + (4.5 * (pathFamilyCredit + referenceCredit + stageRoleCredit + latePenalty)))), 1);
  return {
    score10,
    pathFamilies,
    components: {
      pathFamilyCredit: round(pathFamilyCredit, 3),
      referenceCredit,
      stageRoleCredit,
      lateReferencePenalty: latePenalty
    },
    read: `Strict progression score ${score10}/10. The current stage has ${pathFamilies.length || 0} path-family label(s), but later challenge stages are not yet backed by enough reference-specific set-piece contracts to claim real Galaga progression.`
  };
}

function summarizeMotion(samples){
  const populated = samples.filter(sample => sample.activeCount > 0);
  return {
    sampleCount: samples.length,
    activeSamples: populated.length,
    minActive: populated.length ? Math.min(...populated.map(sample => sample.activeCount)) : 0,
    maxActive: populated.length ? Math.max(...populated.map(sample => sample.activeCount)) : 0,
    meanActive: round(average(populated.map(sample => sample.activeCount)), 1),
    xRange: round(average(populated.map(sample => sample.xRange)), 3),
    yRange: round(average(populated.map(sample => sample.yRange)), 3),
    lowerFieldShare: round(average(populated.map(sample => sample.lowerFieldShare)), 3)
  };
}

async function runtimeProbeForStage(stage){
  return withHarnessPage({ stage, ships: 3, challenge: false, seed: 9100 + stage }, async ({ page }) => {
    return page.evaluate(({ stage, sampleTimes }) => {
      const h = window.__galagaHarness__;
      h.setupChallengeMotionProfileTest({ stage });
      const starting = h.state();
      const initialFormation = h.challengeFormationState();
      const initialFirstWave = (initialFormation.enemies || [])
        .filter(e => e.wave === 0)
        .sort((a, b) => a.lane - b.lane)
        .map(e => ({
          lane: e.lane,
          type: e.type,
          family: e.family,
          pathFamily: e.pathFamily,
          x: +(+e.x || 0).toFixed(2),
          y: +(+e.y || 0).toFixed(2),
          tm: +(+e.tm || 0).toFixed(3),
          spawnPlan: +(+e.spawnPlan || 0).toFixed(2)
        }));
      const initialGroupSignatures = Object.values((initialFormation.enemies || []).reduce((acc, e) => {
        const key = String(e.wave || 0);
        if(!acc[key]) acc[key] = { group: e.wave || 0, types: [], families: [], pathFamilies: [], spawnPlans: [] };
        acc[key].types[e.lane || 0] = e.type || '';
        acc[key].families[e.lane || 0] = e.family || '';
        acc[key].pathFamilies[e.lane || 0] = e.pathFamily || '';
        acc[key].spawnPlans.push(+e.spawnPlan || 0);
        return acc;
      }, {})).sort((a, b) => a.group - b.group).map(group => {
        const spawnPlans = group.spawnPlans.filter(Number.isFinite);
        return {
          group: group.group,
          types: group.types.filter(Boolean),
          families: Array.from(new Set(group.families.filter(Boolean))).sort(),
          pathFamilies: Array.from(new Set(group.pathFamilies.filter(Boolean))).sort(),
          spawnSpan: spawnPlans.length ? +(Math.max(...spawnPlans) - Math.min(...spawnPlans)).toFixed(3) : 0
        };
      });
      const samples = [];
      let previous = 0;
      const captureSilhouette = (enemy) => {
        const canvas = document.getElementById('c');
        const frame = document.getElementById('playfieldFrame');
        if(!canvas || !frame) return { ok: false, reason: 'canvas-or-frame-missing' };
        const ctx = canvas.getContext('2d');
        const canvasRect = canvas.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const scaleX = (frameRect.width - 4) / 280;
        const scaleY = (frameRect.height - 4) / 360;
        const playW = enemy.type === 'boss' ? 62 : enemy.type === 'but' ? 54 : 50;
        const playH = enemy.type === 'boss' ? 52 : enemy.type === 'but' ? 46 : 44;
        const left = frameRect.left + 2 + ((+enemy.x || 0) - playW / 2) * scaleX;
        const top = frameRect.top + 2 + ((+enemy.y || 0) - playH / 2) * scaleY;
        const width = playW * scaleX;
        const height = playH * scaleY;
        const sx = Math.max(0, Math.floor((left - canvasRect.left) * (canvas.width / canvasRect.width)));
        const sy = Math.max(0, Math.floor((top - canvasRect.top) * (canvas.height / canvasRect.height)));
        const sw = Math.max(1, Math.min(canvas.width - sx, Math.floor(width * (canvas.width / canvasRect.width))));
        const sh = Math.max(1, Math.min(canvas.height - sy, Math.floor(height * (canvas.height / canvasRect.height))));
        if(sw <= 0 || sh <= 0) return { ok: false, reason: 'empty-clip' };
        const image = ctx.getImageData(sx, sy, sw, sh);
        const data = image.data;
        const isLit = (px, py) => {
          const i = (py * sw + px) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          return a > 0 && r + g + b > 105 && Math.max(r, g, b) > 42;
        };
        let litPixels = 0;
        let minX = sw;
        let minY = sh;
        let maxX = -1;
        let maxY = -1;
        for(let py = 0; py < sh; py += 1){
          for(let px = 0; px < sw; px += 1){
            if(!isLit(px, py)) continue;
            litPixels += 1;
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
          }
        }
        if(maxX < 0) return { ok: false, reason: 'no-lit-pixels', sx, sy, sw, sh, litPixels };
        const bw = Math.max(1, maxX - minX + 1);
        const bh = Math.max(1, maxY - minY + 1);
        const gridCols = 8;
        const gridRows = 6;
        const bits = [];
        for(let gy = 0; gy < gridRows; gy += 1){
          for(let gx = 0; gx < gridCols; gx += 1){
            const x0 = Math.floor(gx * sw / gridCols);
            const x1 = Math.max(x0 + 1, Math.floor((gx + 1) * sw / gridCols));
            const y0 = Math.floor(gy * sh / gridRows);
            const y1 = Math.max(y0 + 1, Math.floor((gy + 1) * sh / gridRows));
            let lit = 0;
            for(let py = y0; py < y1; py += 1){
              for(let px = x0; px < x1; px += 1){
                if(isLit(px, py)) lit += 1;
              }
            }
            bits.push(lit / Math.max(1, (x1 - x0) * (y1 - y0)) > 0.045 ? '1' : '0');
          }
        }
        return {
          ok: true,
          litPixels,
          fillRatio: +(litPixels / Math.max(1, sw * sh)).toFixed(4),
          bboxFillRatio: +(litPixels / Math.max(1, bw * bh)).toFixed(4),
          bboxAspect: +(bw / bh).toFixed(3),
          bbox: { x: minX, y: minY, width: bw, height: bh },
          clip: { x: sx, y: sy, width: sw, height: sh },
          occupancyHash: bits.join('')
        };
      };
      for(const t of sampleTimes){
        const delta = Math.max(0, t - previous);
        if(delta) h.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false });
        previous = t;
        const formation = h.challengeFormationState();
        const active = formation.enemies || [];
        const xs = active.map(e => +e.x).filter(Number.isFinite);
        const ys = active.map(e => +e.y).filter(Number.isFinite);
        const lowerFieldCount = active.filter(e => +e.y > 180).length;
        samples.push({
          t,
          activeCount: active.length,
          xRange: xs.length ? +(Math.max(...xs) - Math.min(...xs)).toFixed(2) : 0,
          yRange: ys.length ? +(Math.max(...ys) - Math.min(...ys)).toFixed(2) : 0,
          centerX: xs.length ? +(xs.reduce((sum, value) => sum + value, 0) / xs.length).toFixed(2) : null,
          centerY: ys.length ? +(ys.reduce((sum, value) => sum + value, 0) / ys.length).toFixed(2) : null,
          lowerFieldShare: active.length ? +(lowerFieldCount / active.length).toFixed(3) : 0,
          positions: active.map(e => ({
            id: e.id,
            wave: e.wave,
            lane: e.lane,
            type: e.type,
            family: e.family,
            pathFamily: e.pathFamily,
            tm: +(+e.tm || 0).toFixed(3),
            flapOpen: e.flapOpen === true,
            animationPhase: +(+e.animationPhase || 0).toFixed(3),
            x: +(+e.x || 0).toFixed(2),
            y: +(+e.y || 0).toFixed(2),
            silhouette: captureSilhouette(e)
          }))
        });
      }
      const formation = h.challengeFormationState();
      const finalState = h.state();
      const recent = h.recentEvents({ count: 500 }) || [];
      const eventCounts = {
        enemyShots: recent.filter(e => e.type === 'enemy_shot' || e.type === 'enemy_bullet').length,
        enemyAttackStarts: recent.filter(e => e.type === 'enemy_attack_start').length,
        shipLosses: recent.filter(e => e.type === 'ship_loss' || e.type === 'player_loss').length,
        challengeContacts: recent.filter(e => e.type === 'challenge_enemy_contact').length
      };
      return {
        ok: true,
        stage,
        challengeAtStart: !!starting.challenge,
        challengeAtEnd: !!finalState.challenge,
        livesAtStart: starting.lives,
        livesAtEnd: finalState.lives,
        scoreAtEnd: finalState.score,
        layout: initialFormation.layout || formation.layout,
        initialEnemyCount: initialFormation.enemies.length,
        activeEnemyCount: formation.enemies.length,
        firstWave: initialFirstWave,
        groupSignatures: initialGroupSignatures,
        samples,
        motionVector: null,
        motionSummary: samples.length ? null : {},
        eventCounts,
        ruleConformance: {
          noEnemyShots: eventCounts.enemyShots === 0,
          noAttackStarts: eventCounts.enemyAttackStarts === 0,
          noShipLosses: eventCounts.shipLosses === 0 && finalState.lives === starting.lives
        }
      };
    }, { stage, sampleTimes: SAMPLE_TIMES });
  });
}

async function collectRuntimeProbes(){
  const rows = [];
  for(const stage of CHALLENGE_STAGES){
    const probe = await runtimeProbeForStage(stage);
    probe.motionSummary = summarizeMotion(probe.samples || []);
    probe.motionVector = normalizeRuntimeMotion(probe.samples || []);
    probe.spriteMotion = summarizeSpriteMotion(probe.samples || [], probe);
    probe.shotOpportunity = summarizeShotOpportunity(probe.samples || []);
    rows.push(probe);
  }
  return rows;
}

function stageScore(stage, runtime, match, referenceLabels){
  const intent = STAGE_INTENT[stage];
  const bestScore = Number(match?.bestMatch?.score10 || 0);
  const bestLabel = match?.bestMatch?.labelId || '';
  const expectedHit = intent.expectedReferenceLabels.includes(bestLabel);
  const types = typeSet(runtime?.firstWave || []);
  const families = familySet(runtime?.firstWave || []);
  const safetyPass = runtime?.ruleConformance?.noEnemyShots && runtime?.ruleConformance?.noAttackStarts && runtime?.ruleConformance?.noShipLosses;
  const hasReference = !!bestLabel && (intent.expectedReferenceLabels.length > 0);
  const lateReferenceGap = stage >= 19 && !intent.expectedReferenceLabels.length;
  const base = 1.0;
  const safety = safetyPass ? 1.0 : 0;
  const trajectory = clamp(bestScore / 10) * 2.0;
  const expectedMatch = expectedHit ? 0.55 : 0;
  const typeNovelty = clamp(types.length / 4) * 1.05;
  const familyNovelty = families.some(family => family !== 'classic') ? 0.55 : 0;
  const referenceEvidence = hasReference ? 0.35 : 0;
  const latePenalty = lateReferenceGap ? -0.45 : 0;
  const group = groupIdentity(runtime);
  const expectedTypes = intent.expectedFirstWaveTypes || null;
  const forbiddenTypes = intent.forbiddenFirstWaveTypes || [];
  const lineContractHit = expectedTypes
    ? types.length > 0
      && types.every(type => expectedTypes.includes(type))
      && !types.some(type => forbiddenTypes.includes(type))
    : false;
  const adjustedTypeNovelty = expectedTypes
    ? (lineContractHit ? 1.05 : typeNovelty * 0.62)
    : typeNovelty;
  const oldCoverageScore = clamp(base + safety + trajectory + expectedMatch + adjustedTypeNovelty + familyNovelty + referenceEvidence + group.component + latePenalty, 0, 10);
  const referenceLabel = referenceLabelForStage(stage, intent, match, referenceLabels);
  const movement = strictTrajectoryRead(match?.runtimeVector, referenceLabel, match, expectedHit, lateReferenceGap);
  const graphics = strictGraphicsRead(stage, runtime, expectedHit);
  const alienNovelty = strictAlienNoveltyRead(stage, runtime, { groupIdentity: group }, expectedHit, lateReferenceGap);
  const progression = stageProgressionRead(stage, runtime, expectedHit, lateReferenceGap);
  const shotOpportunity = runtime?.shotOpportunity || summarizeShotOpportunity(runtime?.samples || []);
  const safetyRuleScore10 = safetyPass ? 10 : 1;
  const conformanceRaw = (0.34 * movement.score10)
    + (0.25 * graphics.score10)
    + (0.18 * alienNovelty.score10)
    + (0.13 * progression.score10)
    + (0.1 * shotOpportunity.score10);
  const interestRaw = (0.31 * movement.score10)
    + (0.25 * graphics.score10)
    + (0.19 * alienNovelty.score10)
    + (0.13 * progression.score10)
    + (0.12 * shotOpportunity.score10);
  const strictScore = safetyPass ? conformanceRaw : Math.min(1.5, conformanceRaw);
  const strictInterest = safetyPass ? interestRaw : Math.min(1.5, interestRaw);
  return {
    conformanceScore10: round(strictScore, 1),
    interestingFactor10: round(strictInterest, 1),
    legacyCoverageScore10: round(oldCoverageScore, 1),
    movementConformanceScore10: movement.score10,
    graphicalConformanceScore10: graphics.score10,
    alienNoveltyScore10: alienNovelty.score10,
    progressionConformanceScore10: progression.score10,
    playerShotOpportunityScore10: shotOpportunity.score10,
    safetyRuleScore10,
    strictAxisReads: {
      movement,
      graphics,
      alienNovelty,
      progression,
      shotOpportunity
    },
    scoreComponents: {
      baseline: base,
      movementConformance: movement.score10,
      graphicalConformance: graphics.score10,
      alienNovelty: alienNovelty.score10,
      stageProgression: progression.score10,
      playerShotOpportunity: shotOpportunity.score10,
      safetyRule: safetyRuleScore10,
      legacyCoverageScore: round(oldCoverageScore, 1)
    },
    groupIdentity: group,
    expectedReferenceHit: expectedHit
  };
}

function criticalGaps(stage, runtime, match, score){
  const intent = STAGE_INTENT[stage];
  const gaps = [];
  const bestLabel = match?.bestMatch?.labelId || '';
  if(!score.expectedReferenceHit && intent.expectedReferenceLabels.length){
    gaps.push(`Best reference match is ${bestLabel || 'missing'}, not expected ${intent.expectedReferenceLabels.join(' or ')}.`);
  }
  if((score.movementConformanceScore10 || 1) < 4){
    gaps.push(`Movement conformance is only ${score.movementConformanceScore10}/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.`);
  }
  if((score.graphicalConformanceScore10 || 1) < 4){
    gaps.push(`Graphical conformance is only ${score.graphicalConformanceScore10}/10: runtime object-track silhouettes are now measured, but they are not yet matched frame-by-frame against Galaga target sprite crops, rotations, dive poses, and pulsing/flapping cadence.`);
  }
  if((score.alienNoveltyScore10 || 1) < 4){
    gaps.push(`Alien/stage novelty is only ${score.alienNoveltyScore10}/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.`);
  }
  if((score.playerShotOpportunityScore10 || 1) < 4){
    gaps.push(`Player shot-opportunity read is only ${score.playerShotOpportunityScore10}/10: current sampled lanes do not yet prove the challenge has a clear learnable high-bonus firing route rather than incidental hits.`);
  }
  if(stage === 3){
    const types = typeSet(runtime?.firstWave || []);
    if(types.some(type => ['boss', 'rogue'].includes(type))){
      gaps.push('First challenge still mixes boss or rogue entries into the opening lane sequence; the original first challenge reads more like a clean bonus pattern language than combat grammar.');
    }
  }
  if(stage === 7){
    if(score.expectedReferenceHit) gaps.push('Cross-sweep identity now lands on the expected Challenge 2 reference family; next work is trajectory precision and active visual novelty, not basic identity.');
    else gaps.push('Cross-sweep identity is visible in labels, but the measured vector still misses the expected Challenge 2 reference family.');
  }
  if(stage === 11){
    if(score.expectedReferenceHit) gaps.push('Dragonfly/boss-led identity now lands on the expected Challenge 3 reference family, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.');
    else gaps.push('Dragonfly family appears, but the measured vector still misses the expected Challenge 3 reference family and sprite-motion novelty is not yet scored.');
  }
  if(stage === 15){
    if(score.expectedReferenceHit) gaps.push('Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity.');
    else gaps.push('Stage 15 has a pink-serpentine runtime contract, but its measured vector still misses the first-pass Galaga late-challenge label.');
  }
  if(stage === 19){
    if(score.expectedReferenceHit) gaps.push('Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability.');
    else gaps.push('Stage 19 has a pink/green cascade runtime contract, but its measured vector still misses the first-pass Galaga cascade label.');
  }
  if(stage === 23){
    if(score.expectedReferenceHit) gaps.push('Green-ladder split now lands on a Challenge 6 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing.');
    else gaps.push('Green-ladder split is now represented as its own runtime contract, but the measured vector still reads closer to an early challenge than the expected ladder/split reference.');
  }
  if(stage === 27){
    if(score.expectedReferenceHit) gaps.push('Yellow diagonal fan now lands on a Challenge 7 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing.');
    else gaps.push('Yellow diagonal fan is now represented as its own runtime contract, but it still needs stronger diagonal lane identity and must not collapse into another reference signature.');
  }
  if(stage === 31){
    gaps.push('Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone.');
  }
  if(!runtime?.ruleConformance?.noEnemyShots || !runtime?.ruleConformance?.noAttackStarts || !runtime?.ruleConformance?.noShipLosses){
    gaps.push('Challenge safety rule failed or was not measured in this probe.');
  }
  return gaps;
}

function nextActionsForStage(stage){
  if(stage === 3){
    return [
      'Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.',
      'Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.'
    ];
  }
  if(stage === 7){
    return [
      'Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.',
      'Score separate group identities so stage 7 is not just a slightly wider stage 3.'
    ];
  }
  if(stage === 11){
    return [
      'Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.',
      'Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.'
    ];
  }
  if(stage === 15){
    return [
      'Promote the Challenge 4 pink-serpentine window into five group labels and tune the runtime path so all groups keep a readable serpentine score lane.',
      'Add high-bonus readability probes so late-stage complexity stays learnable instead of becoming visual noise.'
    ];
  }
  if(stage === 19){
    return [
      'Promote the Challenge 5 pink/green cascade window into five group labels and tune lower-field pass timing against those labels.',
      'Score group-to-group alternation so cascade identity is not just a different path-family name.'
    ];
  }
  if(stage === 23){
    return [
      'Rebuild Challenge 6 around green ladder and split-exit timing until its measured vector hits challenge-6-green-ladder-split-group-1.',
      'Add frame labels for staggered ladder rungs, split exit side, and upper-band scoreability.'
    ];
  }
  if(stage === 27){
    return [
      'Rebuild Challenge 7 around the yellow diagonal fan so the best match lands on challenge-7-yellow-diagonal-fan-group-1, not the finale label.',
      'Add a player-hit opportunity probe that rewards firing along the diagonal band rather than center-lane waiting.'
    ];
  }
  return [
    'Refine the Challenge 8 blue/purple finale with fuller path length and compact late-loop timing.',
    'Promote challenge enemy active-motion scoring so visual novelty is measured through animation, not only family labels.'
  ];
}

function makeStageRow(stage, runtime, match, referenceLabels){
  const intent = STAGE_INTENT[stage];
  const bestLabel = match?.bestMatch?.labelId || '';
  const score = stageScore(stage, runtime, match, referenceLabels);
  const referenceTarget = referenceLabelForStage(stage, intent, match, referenceLabels)
    || referenceLabels.find(label => label.labelId === bestLabel)
    || referenceLabels.find(label => intent.expectedReferenceLabels.includes(label.labelId))
    || null;
  const firstWave = runtime?.firstWave || [];
  return {
    stage,
    challengeNumber: intent.challengeNumber,
    auroraWindowId: intent.windowId,
    auroraLayoutId: runtime?.layout?.id || null,
    pathFamily: runtime?.layout?.pathFamily || null,
    laneTypes: runtime?.layout?.laneTypes || [],
    runtimeFirstWaveTypes: typeSequence(firstWave),
    runtimeGroupSignatures: runtime?.groupSignatures || [],
    runtimeVisualFamilies: familySet(firstWave),
    galagaTarget: intent.target,
    criticalExpectation: intent.criticalExpectation,
    expectedReferenceLabels: intent.expectedReferenceLabels,
    bestReferenceMatch: match?.bestMatch || null,
    referenceMatchScore10: round(match?.bestMatch?.score10, 1),
    runtimeVector: match?.runtimeVector || null,
    galagaReferenceVector: referenceTarget?.comparisonVector || null,
    galagaReferenceAnchor: referenceTarget?.sourceAnchor || match?.bestMatch?.sourceAnchor || null,
    galagaReferenceMeaning: referenceTarget?.bonusOpportunity || null,
    safetyProbe: runtime ? {
      noEnemyShots: !!runtime.ruleConformance?.noEnemyShots,
      noAttackStarts: !!runtime.ruleConformance?.noAttackStarts,
      noShipLosses: !!runtime.ruleConformance?.noShipLosses,
      eventCounts: runtime.eventCounts || {}
    } : null,
    motionProbe: runtime ? runtime.motionSummary : null,
    currentRead: runtime
      ? `${layoutSignature(runtime.layout)}; first-wave types ${typeSequence(firstWave) || 'pending'}; visual families ${familySet(firstWave).join(', ') || 'pending'}; strict movement ${score.movementConformanceScore10}/10, graphics ${score.graphicalConformanceScore10}/10, alien novelty ${score.alienNoveltyScore10}/10, shot opportunity ${score.playerShotOpportunityScore10}/10.`
      : 'Runtime probe pending.',
    graphicsRead: runtime
      ? score.strictAxisReads.graphics.read
      : 'Graphics runtime probe pending.',
    spriteMotionRead: runtime
      ? score.strictAxisReads.graphics.spriteMotion?.read || 'Sprite-motion hook pending.'
      : 'Sprite-motion hook pending.',
    spriteMotionProbe: runtime
      ? score.strictAxisReads.graphics.spriteMotion || null
      : null,
    objectTrackProbe: runtime
      ? score.strictAxisReads.graphics.spriteMotion?.objectTrackedPixelSilhouette || null
      : null,
    shotOpportunityRead: runtime
      ? score.strictAxisReads.shotOpportunity?.read || 'Shot-opportunity probe pending.'
      : 'Shot-opportunity probe pending.',
    shotOpportunityProbe: runtime
      ? score.strictAxisReads.shotOpportunity || null
      : null,
    movementRead: match
      ? `${score.strictAxisReads.movement.read} Legacy broad vector best-match was ${round(match.bestMatch?.score10, 1)}/10 against ${bestLabel || 'no label'}; xRange ${match.runtimeVector?.xRange}, yRange ${match.runtimeVector?.yRange}, pathLength ${match.runtimeVector?.pathLength}.`
      : 'No reference trajectory comparison row was found for this stage.',
    alienVariationRead: runtime
      ? `${score.strictAxisReads.alienNovelty.read} Opening wave exposes ${typeSet(firstWave).length} type(s) and ${familySet(firstWave).join(', ') || 'no'} visual family labels. Group identity diagnostic: ${score.groupIdentity.read}`
      : 'Alien variation probe pending.',
    groupIdentityRead: score.groupIdentity.read,
    groupIdentityScore10: score.groupIdentity.score10,
    criticalGaps: criticalGaps(stage, runtime, match, score),
    nextActions: nextActionsForStage(stage),
    interestingFactor10: score.interestingFactor10,
    conformanceScore10: score.conformanceScore10,
    legacyCoverageScore10: score.legacyCoverageScore10,
    movementConformanceScore10: score.movementConformanceScore10,
    graphicalConformanceScore10: score.graphicalConformanceScore10,
    alienNoveltyScore10: score.alienNoveltyScore10,
    progressionConformanceScore10: score.progressionConformanceScore10,
    playerShotOpportunityScore10: score.playerShotOpportunityScore10,
    safetyRuleScore10: score.safetyRuleScore10,
    strictAxisReads: score.strictAxisReads,
    expectedReferenceHit: score.expectedReferenceHit,
    scoreComponents: score.scoreComponents,
    evidence: [
      'reference-artifacts/analyses/galaga-path-reference-labels/latest.json',
      'reference-artifacts/analyses/galaga-challenge-video-reference/latest.json',
      'reference-artifacts/analyses/formation-boss-path-family-comparison/latest.json',
      'reference-artifacts/analyses/alien-entry-challenge-variation/latest.json',
      runtime?.layout ? 'browser-backed challengeFormationState runtime probe' : 'runtime probe pending'
    ]
  };
}

function buildMarkdown(report){
  const rows = report.stageRows || [];
  const targetCoverage = report.targetArtifactCoverage || {};
  const targetSummary = targetCoverage.summary || {};
  const challengeTargetRows = Array.isArray(targetCoverage.challengeStageCoverage)
    ? targetCoverage.challengeStageCoverage
    : [];
  const targetCoverageSection = targetSummary.coverageScore10 ? `
## Target Artifact Coverage

The broader Galaga target-artifact coverage read is **${targetSummary.coverageScore10}/10** overall and **${targetSummary.challengeStageReadiness10}/10** for challenge-stage target readiness. The important implication is not that Aurora lacks all grounding; it is that the currently ingested challenge-stage corpus is still early-stage heavy. ${targetSummary.interpretation || ''}

| Challenge | Stage Marker | Target Status | Coverage | Next Need |
| ---: | ---: | --- | ---: | --- |
${challengeTargetRows.map(row => `| ${row.challengeNumber} | ${row.stageMarker} | ${row.status} | ${row.coverage10}/10 | ${row.nextNeed} |`).join('\n')}

Full target-artifact report: \`GALAGA_TARGET_ARTIFACT_COVERAGE.md\` and \`reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json\`.
` : `
## Target Artifact Coverage

Target-artifact coverage has not been generated yet. Run \`npm run harness:analyze:galaga-target-artifact-coverage\` before relying on this report for reference acquisition planning.
`;
  const tableRows = rows.map(row => {
    const gapCell = row.criticalGaps.length
      ? row.criticalGaps.join('<br>')
      : 'Reference target hit; remaining work is trajectory precision and active motion scoring.';
    return `| ${row.stage} | ${row.challengeNumber} | ${row.interestingFactor10}/10 | ${row.movementConformanceScore10}/10 | ${row.graphicalConformanceScore10}/10 | ${row.alienNoveltyScore10}/10 | ${row.playerShotOpportunityScore10}/10 | ${row.conformanceScore10}/10 | ${row.bestReferenceMatch?.labelId || 'pending'} (${row.referenceMatchScore10 ?? 'n/a'}/10 legacy) | ${row.safetyProbe?.noEnemyShots && row.safetyProbe?.noAttackStarts && row.safetyProbe?.noShipLosses ? 'pass' : 'pending/fail'} | ${gapCell} |`;
  }).join('\n');
  const stageSections = rows.map(row => `
## Stage ${row.stage} / Challenge ${row.challengeNumber}

**Current score:** interesting factor ${row.interestingFactor10}/10; challenge conformance ${row.conformanceScore10}/10. Movement ${row.movementConformanceScore10}/10, graphics ${row.graphicalConformanceScore10}/10, alien novelty ${row.alienNoveltyScore10}/10, progression ${row.progressionConformanceScore10}/10, player shot opportunity ${row.playerShotOpportunityScore10}/10.

**Legacy broad coverage score:** ${row.legacyCoverageScore10}/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** ${row.galagaTarget}

**Aurora current:** ${row.currentRead}

**Graphics read:** ${row.graphicsRead}

**Movement read:** ${row.movementRead}

**Alien variation read:** ${row.alienVariationRead}

**Group identity read:** ${row.groupIdentityRead || 'Group identity pending.'}

**Shot-opportunity read:** ${row.shotOpportunityRead || 'Shot-opportunity probe pending.'}

**Safety rule:** ${row.safetyProbe ? `enemy shots ${row.safetyProbe.eventCounts.enemyShots}, attack starts ${row.safetyProbe.eventCounts.enemyAttackStarts}, ship losses ${row.safetyProbe.eventCounts.shipLosses}` : 'runtime probe pending'}.

**Critical gaps:**
${row.criticalGaps.length ? row.criticalGaps.map(gap => `- ${gap}`).join('\n') : '- Reference target hit; remaining work is trajectory precision, lane timing, and active sprite-motion scoring.'}

**Next actions:**
${row.nextActions.map(action => `- ${action}`).join('\n')}
`).join('\n');

  return `# Challenge Stage Conformance Analysis

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Executive Summary

This is now a strict challenge-stage readout. The prior alien-entry score looked too healthy because it rewarded coverage, type labels, and broad stage signatures. That was useful harness progress, but it overstated the player-facing experience. This report follows the current project decision that challenging stages start at **1/10 interesting**, **1/10 movement**, and **1/10 graphical conformance** until they earn credit through reference-grounded movement, active visual evidence, alien/stage novelty, and durable bonus-stage contracts.

Current result: **${report.summary.interestingFactorScore10}/10 interesting factor** and **${report.summary.score10}/10 challenge-stage conformance**. Movement is **${report.summary.movementConformanceScore10}/10**, graphical conformance is **${report.summary.graphicalConformanceScore10}/10**, alien/stage novelty is **${report.summary.alienNoveltyScore10}/10**, and player shot opportunity is **${report.summary.playerShotOpportunityScore10}/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that ${report.summary.weakestFinding}

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using \`challengeFormationState()\`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, but those broad scores are now retained as diagnostic coverage instead of the conformance score.
- Strict movement scoring compares runtime y-range, path length, turn count, reversals, lower-field share, and trajectory best-match against the selected Galaga challenge reference vector. It is capped by current temporal-measurement limits because the harness still samples summaries rather than full tracked choreography.
- Strict graphical scoring now includes active sprite-motion plus object-tracked runtime pixel/silhouette crops for flap state, phase coverage, visual family diversity, path-pose diversity, lit-pixel stability, and bounding-box variation. It remains capped until those object tracks are compared frame-by-frame to Galaga target crops, rotations, dive poses, capture/rescue transitions, and direct target crop sequences.
- Player shot-opportunity scoring samples plausible firing lanes through each challenge window so movement work can be judged by whether it creates learnable high-bonus routes, not only by broad movement shape.
- Challenge path-slot extraction suppresses player fire for challenge windows, so trajectory comparison measures authored alien motion instead of bullet-truncated player-score fragments.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant and contributes only as a guardrail.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.

${targetCoverageSection}

## Stage Summary

| Stage | Challenge | Interest | Movement | Graphics | Alien Novelty | Shot Opportunity | Strict Score | Diagnostic Best Reference | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
${tableRows}

${stageSections}

## Plan To Improve

1. Treat the current strict scores as the release-facing truth: the broad coverage score is diagnostic only.
2. Build the challenge-stage target grammar: per-challenge group order, first-visible frame, entry side, exit side, path length, turn count, featured alien family, scoring window, perfect-bonus expectation, and result feedback.
3. Implement Stage 3 / Challenging Stage 1 first: top-right bee line, late top-left butterfly line, visibly longer upper-band sweep, clear peel-off exits, no combat grammar, and reference-matched duration/turn count.
4. Implement Stage 7 / Challenging Stage 2 as a different authored set piece, not just wider Stage 3: denser mixed novelty, crossing pattern, different entry side and exit side, readable scoring route.
5. Implement Stage 11 / Challenging Stage 3 with boss-led novelty and active animation evidence: featured alien role, flapping/pulsing/rotation windows, and a distinct reward read.
6. Continue the late-stage rebuild now that Challenges 4-8 have media-backed windows: preserve the new Stage 15, 19, 23, 27, and 31 contracts, then promote five group labels for each.
7. Prioritize Challenge 6 green-ladder and Challenge 7 yellow-fan precision work, because they now hit the expected reference families but still need longer path length, cleaner lower-field travel, and lower reversal noise.
8. Promote challenge-stage contact sheets, trajectory SVGs, active sprite-motion probes, and per-stage motion timelines into the Application Guide so the human review can see the actual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from ${report.summary.interestingFactorScore10}/10 to 3.5/10 as the first honest gate by implementing one visibly reference-like challenge, then toward 6.0/10 after Stage 3, 7, and 11 each have distinct authored contracts.
- Raise movement conformance from ${report.summary.movementConformanceScore10}/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from ${report.summary.graphicalConformanceScore10}/10 by extending the object-tracked silhouette hook into Galaga target-crop sequence comparisons; do not inflate it from type labels alone.
- Raise player shot opportunity from ${report.summary.playerShotOpportunityScore10}/10 by creating lane-readable scoring windows for each challenge rather than incidental central-lane hits.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Convert the first-pass late-reference labels into five-group frame/object labels before treating the late challenge sequence as conformant.
- Extend sprite-motion scoring for challenge enemies so visual novelty becomes object-tracked pixel evidence, not only a phase/family hook.
`;
}

function svgEsc(value){
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function vectorPath(vector, x0, y0, width, height, direction = 1){
  const xRange = clamp(+vector?.xRange || 0, 0.2, 1.6);
  const yRange = clamp(+vector?.yRange || 0, 0.1, 1);
  const turns = Math.max(1, Math.min(5, Math.round(+vector?.turnCount || 1)));
  const points = [];
  const horizontal = Math.min(width * 0.82, width * 0.38 * xRange);
  const vertical = Math.min(height * 0.86, height * yRange);
  for(let i = 0; i <= turns + 2; i += 1){
    const q = i / (turns + 2);
    const wave = Math.sin(q * Math.PI * (turns + 1));
    const x = x0 + width / 2 + direction * ((q - 0.5) * horizontal + wave * horizontal * 0.22);
    const y = y0 + 18 + q * vertical;
    points.push(`${round(x, 1)},${round(y, 1)}`);
  }
  return points.join(' ');
}

function metricBar(label, current, target, x, y, width){
  const c = clamp(+current || 0, 0, 1.6);
  const t = clamp(+target || 0, 0, 1.6);
  const scale = width / 1.6;
  return [
    '<g>',
    `<text x="${x}" y="${y - 6}" class="tiny">${svgEsc(label)}</text>`,
    `<rect x="${x}" y="${y}" width="${width}" height="8" rx="4" class="barBg"/>`,
    `<rect x="${x}" y="${y}" width="${round(t * scale, 1)}" height="8" rx="4" class="targetBar"/>`,
    `<rect x="${x}" y="${y + 11}" width="${width}" height="8" rx="4" class="barBg"/>`,
    `<rect x="${x}" y="${y + 11}" width="${round(c * scale, 1)}" height="8" rx="4" class="currentBar"/>`,
    '</g>'
  ].join('\n  ');
}

function trajectoryDiagramSvg(row){
  const label = `Challenging Stage ${row.challengeNumber} (${row.stage}-${row.stage + 1})`;
  const target = row.galagaReferenceVector || {};
  const current = row.runtimeVector || {};
  const targetPath = vectorPath(target, 56, 62, 236, 170, -1);
  const currentPath = vectorPath(current, 344, 62, 236, 170, 1);
  const targetStart = targetPath.split(' ')[0].split(',');
  const currentStart = currentPath.split(' ')[0].split(',');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="300" viewBox="0 0 760 300" role="img" aria-labelledby="title desc">
  <title id="title">${svgEsc(label)} trajectory comparison</title>
  <desc id="desc">Large readable reference-versus-current vector sketch generated from challenge-stage conformance metrics. It is a human-review aid, not raw optical tracking.</desc>
  <style>
    .bg{fill:#06111d}.panel{fill:#0d1b2a;stroke:#2e5d78;stroke-width:2}.grid{stroke:#1b3344;stroke-width:1}.target{fill:none;stroke:#78f7ff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.current{fill:none;stroke:#ffd36a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.dotT{fill:#78f7ff}.dotC{fill:#ffd36a}.text{fill:#f2fbff;font:700 20px ui-monospace,Menlo,monospace}.small{fill:#b8d7ec;font:700 13px ui-monospace,Menlo,monospace}.tiny{fill:#9ec9e6;font:11px ui-monospace,Menlo,monospace}.barBg{fill:#14283a}.targetBar{fill:#78f7ff}.currentBar{fill:#ffd36a}.pill{fill:#102a3b;stroke:#2e5d78}
  </style>
  <rect class="bg" x="0" y="0" width="760" height="300"/>
  <text class="text" x="24" y="34">${svgEsc(label)}</text>
  <rect class="pill" x="560" y="14" width="176" height="32" rx="16"/>
  <text class="small" x="576" y="35">${svgEsc(row.conformanceScore10)}/10 strict score</text>
  <rect class="panel" x="40" y="56" width="268" height="190" rx="10"/>
  <rect class="panel" x="328" y="56" width="268" height="190" rx="10"/>
  <text class="small" x="58" y="82">Galaga target vector</text>
  <text class="small" x="346" y="82">Aurora current vector</text>
  ${[0, 1, 2, 3].map(i => `<line class="grid" x1="${64 + i * 56}" y1="96" x2="${64 + i * 56}" y2="228"/><line class="grid" x1="${352 + i * 56}" y1="96" x2="${352 + i * 56}" y2="228"/>`).join('')}
  ${[0, 1, 2].map(i => `<line class="grid" x1="64" y1="${108 + i * 42}" x2="284" y2="${108 + i * 42}"/><line class="grid" x1="352" y1="${108 + i * 42}" x2="572" y2="${108 + i * 42}"/>`).join('')}
  <polyline class="target" points="${targetPath}"/>
  <polyline class="current" points="${currentPath}"/>
  <circle class="dotT" cx="${targetStart[0]}" cy="${targetStart[1]}" r="5"/>
  <circle class="dotC" cx="${currentStart[0]}" cy="${currentStart[1]}" r="5"/>
  <text class="tiny" x="58" y="264">target: y ${svgEsc(target.yRange ?? 'n/a')} path ${svgEsc(target.pathLength ?? 'n/a')} turns ${svgEsc(target.turnCount ?? 'n/a')}</text>
  <text class="tiny" x="346" y="264">current: y ${svgEsc(current.yRange ?? 'n/a')} path ${svgEsc(current.pathLength ?? 'n/a')} turns ${svgEsc(current.turnCount ?? 'n/a')}</text>
  ${metricBar('y range target/current', current.yRange, target.yRange, 620, 88, 108)}
  ${metricBar('path length target/current', current.pathLength, target.pathLength, 620, 134, 108)}
  ${metricBar('lower field target/current', current.lowerFieldShare, target.lowerFieldShare, 620, 180, 108)}
  <text class="tiny" x="620" y="242">Reference: ${svgEsc(row.bestReferenceMatch?.labelId || 'pending')}</text>
</svg>`;
  return `${svg.replace(/[ \t]+$/gm, '')}\n`;
}

function objectTrackPath(points = [], x0, y0, width, height){
  return points
    .filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y))
    .map(point => `${round(x0 + (+point.x / 280) * width, 1)},${round(y0 + (+point.y / 360) * height, 1)}`)
    .join(' ');
}

function objectTrackDiagramSvg(row){
  const label = `Challenging Stage ${row.challengeNumber} (${row.stage}-${row.stage + 1})`;
  const objectProbe = row.objectTrackProbe || {};
  const shotProbe = row.shotOpportunityProbe || {};
  const tracks = Array.isArray(objectProbe.topTracks) ? objectProbe.topTracks.slice(0, 5) : [];
  const lanes = Array.isArray(shotProbe.laneRows) ? shotProbe.laneRows : [];
  const colors = ['#78f7ff', '#ffd36a', '#ff7bd5', '#8cffb4', '#b08cff'];
  const trackLines = tracks.length
    ? tracks.map((track, index) => {
      const d = objectTrackPath(track.points || [], 50, 76, 430, 168);
      const color = colors[index % colors.length];
      if(!d) return '';
      const start = d.split(' ')[0].split(',');
      return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${start[0]}" cy="${start[1]}" r="5" fill="${color}"/><text class="tiny" x="500" y="${96 + index * 24}" fill="${color}">${svgEsc(track.family || 'family')} ${svgEsc(track.pathFamily || '')} ${svgEsc(track.frameCount || 0)}f</text>`;
    }).filter(Boolean).join('\n  ')
    : '<text class="small" x="68" y="154">object tracks pending</text>';
  const maxHits = Math.max(1, ...lanes.map(lane => +lane.hits || 0));
  const laneBars = lanes.length
    ? lanes.map((lane, index) => {
      const h = round(((+lane.hits || 0) / maxHits) * 84, 1);
      const x = 586 + index * 20;
      return `<rect x="${x}" y="${222 - h}" width="12" height="${h}" rx="3" fill="#ffd36a"/><text class="tiny" x="${x - 4}" y="242">${svgEsc(lane.x)}</text>`;
    }).join('\n  ')
    : '<text class="tiny" x="586" y="222">shot lanes pending</text>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="300" viewBox="0 0 760 300" role="img" aria-labelledby="title desc">
  <title id="title">${svgEsc(label)} object-track and shot-opportunity sketch</title>
  <desc id="desc">Readable object tracks from runtime challenge sprite silhouettes plus sampled player shot opportunity lanes.</desc>
  <style>
    .bg{fill:#06111d}.panel{fill:#0d1b2a;stroke:#2e5d78;stroke-width:2}.grid{stroke:#1b3344;stroke-width:1}.text{fill:#f2fbff;font:700 20px ui-monospace,Menlo,monospace}.small{fill:#b8d7ec;font:700 13px ui-monospace,Menlo,monospace}.tiny{fill:#9ec9e6;font:11px ui-monospace,Menlo,monospace}.pill{fill:#102a3b;stroke:#2e5d78}
  </style>
  <rect class="bg" x="0" y="0" width="760" height="300"/>
  <text class="text" x="24" y="34">${svgEsc(label)}</text>
  <rect class="pill" x="482" y="14" width="254" height="32" rx="16"/>
  <text class="small" x="498" y="35">${svgEsc(row.playerShotOpportunityScore10 ?? 'n/a')}/10 shot opportunity</text>
  <rect class="panel" x="36" y="56" width="456" height="210" rx="10"/>
  <rect class="panel" x="548" y="56" width="176" height="210" rx="10"/>
  <text class="small" x="56" y="82">Object-tracked silhouette paths</text>
  <text class="small" x="568" y="82">Shot-lane hits</text>
  ${[0, 1, 2, 3, 4].map(i => `<line class="grid" x1="${50 + i * 86}" y1="92" x2="${50 + i * 86}" y2="244"/>`).join('')}
  ${[0, 1, 2, 3].map(i => `<line class="grid" x1="50" y1="${100 + i * 42}" x2="480" y2="${100 + i * 42}"/>`).join('')}
  ${trackLines}
  ${laneBars}
  <text class="tiny" x="56" y="260">Silhouette: ${svgEsc(objectProbe.score10 ?? 'n/a')}/10; ${svgEsc(objectProbe.trackedObjectCount ?? 0)} tracks, ${svgEsc(objectProbe.trackedFrameCount ?? 0)} crops.</text>
  <text class="tiny" x="568" y="260">Lane diversity ${svgEsc(shotProbe.laneDiversity ?? 'n/a')}; center bias ${svgEsc(shotProbe.centerBias ?? 'n/a')}.</text>
</svg>`;
  return `${svg.replace(/[ \t]+$/gm, '')}\n`;
}

function attachChallengeDiagrams(report, outDir){
  const latestDir = path.join(OUT_ROOT, 'latest-diagrams');
  ensureDir(latestDir);
  for(const row of report.stageRows || []){
    const fileName = `challenge-stage-${String(row.challengeNumber || row.stage).padStart(2, '0')}-trajectory.svg`;
    const objectTrackFileName = `challenge-stage-${String(row.challengeNumber || row.stage).padStart(2, '0')}-object-track.svg`;
    const datedPath = path.join(outDir, fileName);
    const latestPath = path.join(latestDir, fileName);
    const svg = trajectoryDiagramSvg(row);
    writeText(datedPath, svg);
    writeText(latestPath, svg);
    row.trajectoryDiagram = rel(latestPath);
    const objectTrackDatedPath = path.join(outDir, objectTrackFileName);
    const objectTrackLatestPath = path.join(latestDir, objectTrackFileName);
    const objectTrackSvg = objectTrackDiagramSvg(row);
    writeText(objectTrackDatedPath, objectTrackSvg);
    writeText(objectTrackLatestPath, objectTrackSvg);
    row.objectTrackDiagram = rel(objectTrackLatestPath);
    row.evidence = Array.from(new Set([...(row.evidence || []), row.trajectoryDiagram, row.objectTrackDiagram]));
  }
  report.diagramArtifacts = {
    trajectoryDiagramDirectory: rel(latestDir),
    description: 'Large readable vector sketches comparing Galaga target motion metrics to Aurora runtime metrics plus object-track/shot-opportunity sketches from runtime silhouette probes. These diagrams are human-review aids derived from the measurement artifact, not raw optical tracking.'
  };
}

async function buildReport(){
  const commit = gitShortCommit();
  const branch = gitBranch();
  const generatedAt = new Date().toISOString();
  const runtimeProbes = await collectRuntimeProbes();
  const matches = challengeMatches();
  const referenceLabels = challengeReferenceLabels();
  const alienVariation = alienVariationRead();
  const targetArtifactCoverage = galagaTargetArtifactCoverageRead();
  const rows = CHALLENGE_STAGES.map(stage => {
    const runtime = runtimeProbes.find(probe => probe.stage === stage);
    const intent = STAGE_INTENT[stage];
    const directMatch = referenceMatchForRuntime(stage, runtime, referenceLabels);
    const externalMatch = matches.find(item => item.stage === stage || item.windowId === intent.windowId) || null;
    const match = directMatch || externalMatch;
    if(match && externalMatch?.bestMatch) match.externalLegacyBestMatch = externalMatch.bestMatch;
    return makeStageRow(stage, runtime, match, referenceLabels);
  });
  const stage3Row = rows.find(row => row.stage === 3);
  const stage3ExpectedReferenceHit = !!stage3Row?.expectedReferenceHit;
  const challenge2BestMatchCount = rows.filter(row => row.bestReferenceMatch?.labelId === 'challenge-2-arrival-group-1').length;
  const weakestFinding = stage3ExpectedReferenceHit
    ? `challenge stages are still not authored enough as memorable Galaga-like set pieces: ${challenge2BestMatchCount} sampled stage(s) still best-match the same Galaga challenge-2 reference, stage 3 now lands on the first-challenge bee-line reference but needs stronger trajectory precision, active sprite-motion is now detected only as phase/family coverage, and late stages need object-tracked group refinement.`
    : `challenge stages are still not authored enough as memorable Galaga-like set pieces: most measured runtime vectors best-match the same Galaga challenge-2 reference, stage 3 does not read as the original first challenge, active sprite-motion is now detected only as phase/family coverage, and late-stage labels need per-group refinement.`;
  const summary = {
    score10: round(average(rows.map(row => row.conformanceScore10)), 1),
    interestingFactorScore10: round(average(rows.map(row => row.interestingFactor10)), 1),
    movementConformanceScore10: round(average(rows.map(row => row.movementConformanceScore10)), 1),
    graphicalConformanceScore10: round(average(rows.map(row => row.graphicalConformanceScore10)), 1),
    alienNoveltyScore10: round(average(rows.map(row => row.alienNoveltyScore10)), 1),
    progressionConformanceScore10: round(average(rows.map(row => row.progressionConformanceScore10)), 1),
    playerShotOpportunityScore10: round(average(rows.map(row => row.playerShotOpportunityScore10)), 1),
    safetyRuleScore10: round(average(rows.map(row => row.safetyRuleScore10)), 1),
    legacyCoverageScore10: round(average(rows.map(row => row.legacyCoverageScore10)), 1),
    confidence: 'medium-high for the gap; medium-low for exact remediation size',
    resolution: 'strict stage-by-stage browser runtime probe plus media-backed Galaga challenge labels; broad legacy path/type coverage is retained as diagnostic evidence only',
    scoringModel: 'strict-v2-user-baseline',
    startingAssumption: 'Each challenge stage starts at 1.0/10 for interesting factor, movement conformance, and graphical conformance. Safety is a pass/fail guardrail and no longer inflates player-facing conformance.',
    strongestFinding: 'Sampled challenge windows preserve the Galaga-like no-shot/no-ship-loss rule.',
    stage3ExpectedReferenceHit,
    challenge2BestMatchCount,
    weakestFinding: `current challenge stages are functionally safe but not yet fully credible Galaga-like bonus exhibitions: strict movement is ${round(average(rows.map(row => row.movementConformanceScore10)), 1)}/10, strict graphics is ${round(average(rows.map(row => row.graphicalConformanceScore10)), 1)}/10, alien/stage novelty is ${round(average(rows.map(row => row.alienNoveltyScore10)), 1)}/10, player shot opportunity is ${round(average(rows.map(row => row.playerShotOpportunityScore10)), 1)}/10, active sprite-motion now includes object-tracked runtime pixel/silhouette evidence but not yet Galaga target-crop sequence comparison, and late challenge references are still first-pass group labels rather than full object tracks. Diagnostic legacy coverage was ${round(average(rows.map(row => row.legacyCoverageScore10)), 1)}/10, which is why the old read was too generous.`,
    playerMeaning: 'A player should experience challenging stages as safe but tense score exhibitions with memorable entry routes, fresh alien types, readable trajectories, and a learnable perfect-bonus opportunity. Aurora currently preserves the safety rule, but the actual spectacle, motion, and visual novelty are still early.',
    designerMeaning: 'Design work should move from broad path-family labels to explicit per-challenge contracts: group order, first-visible frame, entry side, exit side, path length, turn count, alien family, animation phases, bonus opportunity, and result feedback.',
    sourceScores: {
      alienEntryChallengeVariation: alienVariation?.score10 ?? null,
      challengeArrivalVsAppearance: (alienVariation?.metrics || []).find(item => item.id === 'challenge-arrival-vs-appearance')?.score10 ?? null,
      challengePatternNoveltyDepth: (alienVariation?.metrics || []).find(item => item.id === 'challenge-pattern-novelty-depth')?.score10 ?? null
    }
  };
  return {
    schemaVersion: 1,
    artifactType: 'challenge-stage-conformance',
    generatedAt,
    commit,
    branch,
    challengeStages: CHALLENGE_STAGES,
    summary,
    stageRows: rows,
    referenceLabels: referenceLabels.map(label => ({
      labelId: label.labelId,
      challengeNumber: label.challengeNumber,
      groupIndex: label.groupIndex,
      entityFamily: label.entityFamily,
      entrySide: label.entrySide,
      exitSide: label.exitSide,
      sourceAnchor: label.sourceAnchor,
      bonusOpportunity: label.bonusOpportunity,
      confidenceScore: label.confidenceScore,
      comparisonVector: label.comparisonVector
    })),
    sourceArtifacts: {
      galagaPathReferenceLabels: 'reference-artifacts/analyses/galaga-path-reference-labels/latest.json',
      galagaChallengeVideoReference: 'reference-artifacts/analyses/galaga-challenge-video-reference/latest.json',
      galagaTargetArtifactCoverage: 'reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json',
      pathFamilyComparison: 'reference-artifacts/analyses/formation-boss-path-family-comparison/latest.json',
      alienEntryChallengeVariation: 'reference-artifacts/analyses/alien-entry-challenge-variation/latest.json',
      challengeCollisionGuardrail: 'tools/harness/check-challenge-collision.js',
      challengeMotionProfileGuardrail: 'tools/harness/check-challenge-motion-profile.js'
    },
    targetArtifactCoverage: {
      summary: targetArtifactCoverage.summary || {},
      challengeStageCoverage: Array.isArray(targetArtifactCoverage.challengeStageCoverage)
        ? targetArtifactCoverage.challengeStageCoverage
        : []
    },
    improvementPlan: [
      'Use strict challenge-stage scores as the release-facing truth; keep broad coverage scores only as diagnostics.',
      'Define a challenge-stage target grammar for group order, entry/exit side, path length, turn count, featured alien, scoring window, perfect bonus, animation phases, and result feedback.',
      'Stage 3: rebuild Challenging Stage 1 against the Galaga challenge-1 arrival and late-wave references with visibly longer movement and readable exits.',
      'Stage 7: rebuild Challenging Stage 2 as a separate mixed-novelty crossing set piece with different entry/exit and timing grammar.',
      'Stage 11: rebuild Challenging Stage 3 around boss-led novelty plus active sprite-motion scoring.',
      'Stage 15/19/23/27/31: continue replacing repeated late-stage patterns with first-pass media-backed contracts, then promote each to five-group frame labels.',
      'Publish contact sheets, trajectory SVGs, per-stage critical gaps, and strict axis scores in generated docs.'
    ]
  };
}

async function main(){
  const report = await buildReport();
  const stamp = `${report.generatedAt.slice(0, 10)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  const reportPath = path.join(outDir, 'report.json');
  const readmePath = path.join(outDir, 'README.md');
  const latestPath = path.join(OUT_ROOT, 'latest.json');
  const topLevelReportPath = path.join(ROOT, 'CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md');
  attachChallengeDiagrams(report, outDir);
  const markdown = buildMarkdown(report);
  writeJson(reportPath, report);
  writeText(readmePath, markdown);
  writeJson(latestPath, report);
  writeText(topLevelReportPath, markdown);
  console.log(JSON.stringify({
    ok: true,
    score10: report.summary.score10,
    interestingFactorScore10: report.summary.interestingFactorScore10,
    report: rel(reportPath),
    latest: rel(latestPath),
    markdown: rel(topLevelReportPath)
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

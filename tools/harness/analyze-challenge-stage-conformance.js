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
    expectedReferenceLabels: ['challenge-4-pink-serpentine-group-1'],
    expectedReferenceSemantics: ['pink', 'serpentine'],
    target: 'Fourth challenge should shift into long specialty serpentine arcs with obvious new color/family identity while staying nonlethal.',
    criticalExpectation: 'Should feel like the first truly late-stage set piece, not a boss-led remix of earlier challenge stages.'
  },
  19: {
    challengeNumber: 5,
    windowId: 'challenge-stage-pink-green-cascade',
    expectedReferenceLabels: ['challenge-5-pink-green-cascade-group-1'],
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
    expectedReferenceLabels: ['challenge-8-blue-purple-finale-group-1'],
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
  const activeMotionCoverage = clamp(
    (0.32 * flapCycle)
    + (0.28 * phaseCoverage)
    + (0.2 * familyMotionCoverage)
    + (0.12 * poseDiversity)
    + (0.08 * visualFamilyDiversity)
  );
  return {
    score10: round(1 + activeMotionCoverage * 4.2, 1),
    activeMotionCoverage: round(activeMotionCoverage, 3),
    flapCycleObserved: !!flapCycle,
    flapStates: Array.from(flapStates).sort(),
    phaseBucketCount: phaseBuckets.size,
    families,
    pathFamilies,
    familyMotionCoverage: round(familyMotionCoverage, 3),
    poseDiversity: round(poseDiversity, 3),
    visualFamilyDiversity: round(visualFamilyDiversity, 3),
    measurementLimits: [
      'This is an active runtime animation-phase hook, not object-tracked sprite-pixel conformance.',
      'It observes flap phase, family diversity, and path-pose diversity inside challenge windows, but it does not yet compare per-frame silhouettes to Galaga target crops.'
    ],
    read: active.length
      ? `Runtime sprite-motion hook observed ${families.length} visual family/families, ${pathFamilies.length} path pose family/families, ${phaseBuckets.size}/6 animation phase buckets, and ${flapCycle ? 'both' : 'one'} flap state(s).`
      : 'Runtime sprite-motion hook found no active challenge enemies in sampled windows.',
    runtimeLayoutId: runtime?.layout?.id || null
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
  const activeMotionCap = measuredRuntimeSpriteMotionCoverage ? 3.6 : 2.2;
  const spriteMotionCredit = measuredRuntimeSpriteMotionCoverage * 0.36;
  const score10 = round(Math.min(activeMotionCap, 1 + (4.0 * (typeMixCredit + familyCredit + contractCredit + spriteMotionCredit))), 1);
  return {
    score10,
    activeMotionCap,
    measuredRuntimeSpriteMotionCoverage,
    spriteMotion,
    components: {
      alienTypeMix: round(typeMixCredit, 3),
      visualFamilyNovelty: round(familyCredit, 3),
      firstChallengeLineContract: round(contractCredit, 3),
      activeSpriteMotionCoverage: measuredRuntimeSpriteMotionCoverage,
      spriteMotionCredit: round(spriteMotionCredit, 3)
    },
    read: `Strict graphics score ${score10}/10. Current visible family/type labels are present and ${spriteMotion.read} Graphics remain capped at ${activeMotionCap}/10 until live silhouettes, rotations, dive poses, capture/rescue transitions, and Galaga target sprite crops are scored in motion.`
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
            family: e.family,
            pathFamily: e.pathFamily,
            tm: +(+e.tm || 0).toFixed(3),
            flapOpen: e.flapOpen === true,
            animationPhase: +(+e.animationPhase || 0).toFixed(3),
            x: +(+e.x || 0).toFixed(2),
            y: +(+e.y || 0).toFixed(2)
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
  const safetyRuleScore10 = safetyPass ? 10 : 1;
  const conformanceRaw = (0.38 * movement.score10)
    + (0.27 * graphics.score10)
    + (0.2 * alienNovelty.score10)
    + (0.15 * progression.score10);
  const interestRaw = (0.35 * movement.score10)
    + (0.28 * graphics.score10)
    + (0.22 * alienNovelty.score10)
    + (0.15 * progression.score10);
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
    safetyRuleScore10,
    strictAxisReads: {
      movement,
      graphics,
      alienNovelty,
      progression
    },
    scoreComponents: {
      baseline: base,
      movementConformance: movement.score10,
      graphicalConformance: graphics.score10,
      alienNovelty: alienNovelty.score10,
      stageProgression: progression.score10,
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
    gaps.push(`Graphical conformance is only ${score.graphicalConformanceScore10}/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.`);
  }
  if((score.alienNoveltyScore10 || 1) < 4){
    gaps.push(`Alien/stage novelty is only ${score.alienNoveltyScore10}/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.`);
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
  const referenceTarget = referenceLabels.find(label => label.labelId === bestLabel)
    || referenceLabels.find(label => intent.expectedReferenceLabels.includes(label.labelId))
    || null;
  const score = stageScore(stage, runtime, match, referenceLabels);
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
      ? `${layoutSignature(runtime.layout)}; first-wave types ${typeSequence(firstWave) || 'pending'}; visual families ${familySet(firstWave).join(', ') || 'pending'}; strict movement ${score.movementConformanceScore10}/10, graphics ${score.graphicalConformanceScore10}/10, alien novelty ${score.alienNoveltyScore10}/10.`
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
    return `| ${row.stage} | ${row.challengeNumber} | ${row.interestingFactor10}/10 | ${row.movementConformanceScore10}/10 | ${row.graphicalConformanceScore10}/10 | ${row.alienNoveltyScore10}/10 | ${row.conformanceScore10}/10 | ${row.bestReferenceMatch?.labelId || 'pending'} (${row.referenceMatchScore10 ?? 'n/a'}/10 legacy) | ${row.safetyProbe?.noEnemyShots && row.safetyProbe?.noAttackStarts && row.safetyProbe?.noShipLosses ? 'pass' : 'pending/fail'} | ${gapCell} |`;
  }).join('\n');
  const stageSections = rows.map(row => `
## Stage ${row.stage} / Challenge ${row.challengeNumber}

**Current score:** interesting factor ${row.interestingFactor10}/10; challenge conformance ${row.conformanceScore10}/10. Movement ${row.movementConformanceScore10}/10, graphics ${row.graphicalConformanceScore10}/10, alien novelty ${row.alienNoveltyScore10}/10, progression ${row.progressionConformanceScore10}/10.

**Legacy broad coverage score:** ${row.legacyCoverageScore10}/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** ${row.galagaTarget}

**Aurora current:** ${row.currentRead}

**Graphics read:** ${row.graphicsRead}

**Movement read:** ${row.movementRead}

**Alien variation read:** ${row.alienVariationRead}

**Group identity read:** ${row.groupIdentityRead || 'Group identity pending.'}

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

Current result: **${report.summary.interestingFactorScore10}/10 interesting factor** and **${report.summary.score10}/10 challenge-stage conformance**. Movement is **${report.summary.movementConformanceScore10}/10**, graphical conformance is **${report.summary.graphicalConformanceScore10}/10**, and alien/stage novelty is **${report.summary.alienNoveltyScore10}/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that ${report.summary.weakestFinding}

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using \`challengeFormationState()\`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, but those broad scores are now retained as diagnostic coverage instead of the conformance score.
- Strict movement scoring compares runtime y-range, path length, turn count, reversals, lower-field share, and trajectory best-match against the selected Galaga challenge reference vector. It is capped by current temporal-measurement limits because the harness still samples summaries rather than full tracked choreography.
- Strict graphical scoring now includes a first active sprite-motion hook for flap state, phase coverage, visual family diversity, and path-pose diversity. It remains capped until object-tracked silhouettes, rotations, dive poses, capture/rescue transitions, and direct target crop comparison are measured.
- Challenge path-slot extraction suppresses player fire for challenge windows, so trajectory comparison measures authored alien motion instead of bullet-truncated player-score fragments.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant and contributes only as a guardrail.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.

${targetCoverageSection}

## Stage Summary

| Stage | Challenge | Interest | Movement | Graphics | Alien Novelty | Strict Score | Diagnostic Best Reference | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
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
- Raise graphical conformance from ${report.summary.graphicalConformanceScore10}/10 by extending the active sprite-motion hook into object-tracked silhouette, rotation, dive-pose, and reference-crop comparisons; do not inflate it from type labels alone.
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

function attachTrajectoryDiagrams(report, outDir){
  const latestDir = path.join(OUT_ROOT, 'latest-diagrams');
  ensureDir(latestDir);
  for(const row of report.stageRows || []){
    const fileName = `challenge-stage-${String(row.challengeNumber || row.stage).padStart(2, '0')}-trajectory.svg`;
    const datedPath = path.join(outDir, fileName);
    const latestPath = path.join(latestDir, fileName);
    const svg = trajectoryDiagramSvg(row);
    writeText(datedPath, svg);
    writeText(latestPath, svg);
    row.trajectoryDiagram = rel(latestPath);
    row.evidence = Array.from(new Set([...(row.evidence || []), row.trajectoryDiagram]));
  }
  report.diagramArtifacts = {
    trajectoryDiagramDirectory: rel(latestDir),
    description: 'Large readable vector sketches comparing Galaga target motion metrics to Aurora runtime metrics. These diagrams are human-review aids derived from the measurement artifact, not raw optical tracking.'
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
    safetyRuleScore10: round(average(rows.map(row => row.safetyRuleScore10)), 1),
    legacyCoverageScore10: round(average(rows.map(row => row.legacyCoverageScore10)), 1),
    confidence: 'medium-high for the gap; medium-low for exact remediation size',
    resolution: 'strict stage-by-stage browser runtime probe plus media-backed Galaga challenge labels; broad legacy path/type coverage is retained as diagnostic evidence only',
    scoringModel: 'strict-v2-user-baseline',
    startingAssumption: 'Each challenge stage starts at 1.0/10 for interesting factor, movement conformance, and graphical conformance. Safety is a pass/fail guardrail and no longer inflates player-facing conformance.',
    strongestFinding: 'Sampled challenge windows preserve the Galaga-like no-shot/no-ship-loss rule.',
    stage3ExpectedReferenceHit,
    challenge2BestMatchCount,
    weakestFinding: `current challenge stages are functionally safe but not yet fully credible Galaga-like bonus exhibitions: strict movement is ${round(average(rows.map(row => row.movementConformanceScore10)), 1)}/10, strict graphics is ${round(average(rows.map(row => row.graphicalConformanceScore10)), 1)}/10, alien/stage novelty is ${round(average(rows.map(row => row.alienNoveltyScore10)), 1)}/10, active sprite-motion is now measured as phase/family coverage but not yet as object-tracked pixel-silhouette conformance, and late challenge references are first-pass window labels rather than full object tracks. Diagnostic legacy coverage was ${round(average(rows.map(row => row.legacyCoverageScore10)), 1)}/10, which is why the old read was too generous.`,
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
  attachTrajectoryDiagrams(report, outDir);
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

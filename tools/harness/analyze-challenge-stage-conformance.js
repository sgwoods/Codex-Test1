#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'challenge-stage-conformance');
const CHALLENGE_STAGES = [3, 7, 11, 15, 19];
const SAMPLE_TIMES = [0, 0.7, 1.4, 2.5, 4.2, 6.0];

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
    target: 'Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.',
    criticalExpectation: 'Should introduce a stronger mixed-family visual grammar and a learnable crossing pattern.'
  },
  11: {
    challengeNumber: 3,
    windowId: 'challenge-stage-stingray-hook',
    expectedReferenceLabels: ['challenge-3-arrival-group-1'],
    target: 'Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.',
    criticalExpectation: 'Should read as a later Galaga challenge with alien novelty and a distinct high-bonus route.'
  },
  15: {
    challengeNumber: 4,
    windowId: 'challenge-stage-boss-led-loop',
    expectedReferenceLabels: ['challenge-3-arrival-group-1'],
    target: 'Later challenge should increase set-piece complexity, boss-led grouping, path length, and visual novelty without becoming combat.',
    criticalExpectation: 'Should feel authored as a new late-game challenge, not only a faster or denser version of earlier waves.'
  },
  19: {
    challengeNumber: 5,
    windowId: 'challenge-stage-crown-split-cascade',
    expectedReferenceLabels: [],
    target: 'Very-late challenge should have a specialty cascade identity and a supported reference window before it is trusted.',
    criticalExpectation: 'Should become an explicit late-game challenge contract with its own reference contact sheet and trajectory labels.'
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

function strictGraphicsRead(stage, runtime, expectedHit){
  const firstWave = runtime?.firstWave || [];
  const types = typeSet(firstWave);
  const families = familySet(firstWave);
  const classicLineContract = stage === 3 && types.length === 2 && types.every(type => ['bee', 'but'].includes(type));
  const hasNonClassicVisual = families.some(family => family !== 'classic');
  const typeMixCredit = clamp(types.length / 4) * 0.18;
  const familyCredit = hasNonClassicVisual ? 0.14 : 0;
  const contractCredit = classicLineContract && expectedHit ? 0.18 : 0;
  const measuredRuntimeSpriteMotionCoverage = 0;
  const activeMotionCap = measuredRuntimeSpriteMotionCoverage ? 5.5 : 2.2;
  const score10 = round(Math.min(activeMotionCap, 1 + (4.0 * (typeMixCredit + familyCredit + contractCredit))), 1);
  return {
    score10,
    activeMotionCap,
    measuredRuntimeSpriteMotionCoverage,
    components: {
      alienTypeMix: round(typeMixCredit, 3),
      visualFamilyNovelty: round(familyCredit, 3),
      firstChallengeLineContract: round(contractCredit, 3),
      activeSpriteMotionCoverage: measuredRuntimeSpriteMotionCoverage
    },
    read: `Strict graphics score ${score10}/10. Current visible family/type labels are present, but challenge-window graphics are capped at ${activeMotionCap}/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.`
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
          lowerFieldShare: active.length ? +(lowerFieldCount / active.length).toFixed(3) : 0
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
    gaps.push('Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages.');
  }
  if(stage === 11){
    gaps.push('Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.');
  }
  if(stage === 15){
    if(score.expectedReferenceHit){
      gaps.push('Boss-led-loop now lands on the challenge-3 reference, but late-stage reference labels and high-bonus readability probes are still thin.');
    }else{
      gaps.push('Boss-led-loop has the strongest runtime spread, yet it still best-matches challenge 2 and lacks a late-stage Galaga contact-sheet target.');
    }
  }
  if(stage === 19){
    if(match?.bestMatch?.labelId){
      gaps.push('Stage 19 now has crown-split-cascade runtime path extraction, but Galaga late-challenge reference labels and high-bonus readability probes are still missing.');
    }else{
      gaps.push('Stage 19 has a configured crown-split-cascade, but durable path extraction and Galaga late-challenge reference labels are missing.');
    }
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
      'Capture or label later Galaga challenge references, then make boss-led-loop a late-stage contract with stronger exits and bonus route clarity.',
      'Add high-bonus readability probes so later challenge complexity stays learnable.'
    ];
  }
  return [
    'Promote the stage-19 evidence window into a late-challenge reference-label target before treating crown-split-cascade as conformant.',
    'Promote mosquito/crown visual novelty into runtime sprite-motion scoring.'
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
      'reference-artifacts/analyses/formation-boss-path-family-comparison/latest.json',
      'reference-artifacts/analyses/alien-entry-challenge-variation/latest.json',
      runtime?.layout ? 'browser-backed challengeFormationState runtime probe' : 'runtime probe pending'
    ]
  };
}

function buildMarkdown(report){
  const rows = report.stageRows || [];
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
- Strict graphical scoring is intentionally low until challenge-window sprite animation is measured: flaps, pulsing, dive/rotation silhouettes, capture/rescue transitions, and direct target crop comparison.
- Challenge path-slot extraction suppresses player fire for challenge windows, so trajectory comparison measures authored alien motion instead of bullet-truncated player-score fragments.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant and contributes only as a guardrail.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.

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
6. Do not claim late challenge conformance for Stage 15/19 until later Galaga challenge references are labeled or an explicit inspired-but-non-Galaga contract is documented.
7. Promote challenge-stage contact sheets, trajectory SVGs, and per-stage motion timelines into the Application Guide so the human review can see the actual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from ${report.summary.interestingFactorScore10}/10 to 3.5/10 as the first honest gate by implementing one visibly reference-like challenge, then toward 6.0/10 after Stage 3, 7, and 11 each have distinct authored contracts.
- Raise movement conformance from ${report.summary.movementConformanceScore10}/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from ${report.summary.graphicalConformanceScore10}/10 only when active sprite-motion windows and reference target crops are attached; do not inflate it from type labels alone.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Add stage 19 late-reference labels and high-bonus readability probes before treating the late challenge as conformant.
- Add sprite-motion scoring for challenge enemies so visual novelty is active-motion evidence, not only a family label.
`;
}

async function buildReport(){
  const commit = gitShortCommit();
  const branch = gitBranch();
  const generatedAt = new Date().toISOString();
  const runtimeProbes = await collectRuntimeProbes();
  const matches = challengeMatches();
  const referenceLabels = challengeReferenceLabels();
  const alienVariation = alienVariationRead();
  const rows = CHALLENGE_STAGES.map(stage => {
    const runtime = runtimeProbes.find(probe => probe.stage === stage);
    const intent = STAGE_INTENT[stage];
    const match = matches.find(item => item.stage === stage || item.windowId === intent.windowId) || null;
    return makeStageRow(stage, runtime, match, referenceLabels);
  });
  const stage3Row = rows.find(row => row.stage === 3);
  const stage3ExpectedReferenceHit = !!stage3Row?.expectedReferenceHit;
  const challenge2BestMatchCount = rows.filter(row => row.bestReferenceMatch?.labelId === 'challenge-2-arrival-group-1').length;
  const weakestFinding = stage3ExpectedReferenceHit
    ? `challenge stages are still not authored enough as memorable Galaga-like set pieces: ${challenge2BestMatchCount} sampled stage(s) still best-match the same Galaga challenge-2 reference, stage 3 now lands on the first-challenge bee-line reference but needs stronger trajectory precision, active sprite-motion novelty is unscored, and stage 19 lacks reference grounding.`
    : `challenge stages are still not authored enough as memorable Galaga-like set pieces: most measured runtime vectors best-match the same Galaga challenge-2 reference, stage 3 does not read as the original first challenge, active sprite-motion novelty is unscored, and stage 19 lacks reference grounding.`;
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
    weakestFinding: `current challenge stages are functionally safe but not yet credible Galaga-like bonus exhibitions: strict movement is ${round(average(rows.map(row => row.movementConformanceScore10)), 1)}/10, strict graphics is ${round(average(rows.map(row => row.graphicalConformanceScore10)), 1)}/10, alien/stage novelty is ${round(average(rows.map(row => row.alienNoveltyScore10)), 1)}/10, active sprite-motion evidence is missing, and late challenge references remain thin. Diagnostic legacy coverage was ${round(average(rows.map(row => row.legacyCoverageScore10)), 1)}/10, which is why the old read was too generous.`,
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
      pathFamilyComparison: 'reference-artifacts/analyses/formation-boss-path-family-comparison/latest.json',
      alienEntryChallengeVariation: 'reference-artifacts/analyses/alien-entry-challenge-variation/latest.json',
      challengeCollisionGuardrail: 'tools/harness/check-challenge-collision.js',
      challengeMotionProfileGuardrail: 'tools/harness/check-challenge-motion-profile.js'
    },
    improvementPlan: [
      'Use strict challenge-stage scores as the release-facing truth; keep broad coverage scores only as diagnostics.',
      'Define a challenge-stage target grammar for group order, entry/exit side, path length, turn count, featured alien, scoring window, perfect bonus, animation phases, and result feedback.',
      'Stage 3: rebuild Challenging Stage 1 against the Galaga challenge-1 arrival and late-wave references with visibly longer movement and readable exits.',
      'Stage 7: rebuild Challenging Stage 2 as a separate mixed-novelty crossing set piece with different entry/exit and timing grammar.',
      'Stage 11: rebuild Challenging Stage 3 around boss-led novelty plus active sprite-motion scoring.',
      'Stage 15/19: label late challenge references or document an explicitly inspired alternate contract before claiming maturity.',
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

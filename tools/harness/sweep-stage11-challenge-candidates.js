#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep');
const LABELS_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-labels', 'latest.json');
const STAGE = 11;
const EXPECTED_LABEL = 'challenge-3-arrival-group-1';
const SAMPLE_TIMES = Array.from({ length: 35 }, (_, index) => +(index * 0.25).toFixed(2));
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
  return 5;
}

function combinedTrajectorySemanticScore(trajectoryScore10, semanticScore10){
  return round((1 - CHALLENGE_SEMANTIC_SCORE_WEIGHT) * trajectoryScore10 + CHALLENGE_SEMANTIC_SCORE_WEIGHT * semanticScore10, 1);
}

function candidateBaseLayout(){
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
  const expected = matches.find(match => match.labelId === EXPECTED_LABEL) || null;
  const noSafetyRegression = measured.eventCounts.enemyShots === 0
    && measured.eventCounts.enemyAttackStarts === 0
    && measured.eventCounts.shipLosses === 0;
  return Object.assign({}, measured, {
    trackCount: classifications.length,
    runtimeVector: vector,
    runtimeSemantic: semantic,
    bestMatch: matches[0] || null,
    expectedMatch: expected,
    expectedReferenceHit: matches[0]?.labelId === EXPECTED_LABEL,
    noSafetyRegression,
    selectionScore10: round((expected?.score10 || 0) + (matches[0]?.labelId === EXPECTED_LABEL ? 0.75 : 0) + (noSafetyRegression ? 0.2 : -3), 2)
  });
}

function buildMarkdown(report){
  const topRows = report.candidates.slice(0, 12).map((row, index) => {
    const hit = row.expectedReferenceHit ? 'yes' : 'no';
    const eventRead = row.noSafetyRegression ? 'pass' : `risk ${JSON.stringify(row.eventCounts)}`;
    return `| ${index + 1} | ${row.candidateId} | ${row.selectionScore10}/10 | ${row.expectedMatch?.score10 ?? 0}/10 | ${row.bestMatch?.labelId || 'none'} (${row.bestMatch?.score10 ?? 0}/10) | ${hit} | ${eventRead} |`;
  }).join('\n');
  return `# Stage 11 Challenge Candidate Sweep

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

Stage 11 currently has safe challenge behavior but still does not consistently read as the third Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage-11 reference without safety regression.

## Summary

- Baseline expected-reference score: ${report.summary.baselineExpectedScore10}/10.
- Best candidate expected-reference score: ${report.summary.bestExpectedScore10}/10.
- Best candidate: ${report.summary.bestCandidateId}.
- Keeper decision: ${report.summary.keeperDecision}.
- Player-facing meaning: ${report.summary.playerMeaning}
- Process meaning: ${report.summary.processMeaning}

## Top Candidates

| Rank | Candidate | Selection | Expected Challenge 3 | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | --- | --- | --- |
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
    .sort((a, b) => b.selectionScore10 - a.selectionScore10 || b.expectedMatch.score10 - a.expectedMatch.score10 || a.candidateId.localeCompare(b.candidateId));
  const baseline = scored.find(row => row.candidateId === 'baseline-current') || scored.at(-1);
  const best = scored[0];
  const expectedLift = round((best.expectedMatch?.score10 || 0) - (baseline.expectedMatch?.score10 || 0), 2);
  const keeper = best.expectedReferenceHit && best.noSafetyRegression && expectedLift >= 0.35;
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-stage-candidate-sweep',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage: STAGE,
    expectedLabel: EXPECTED_LABEL,
    sampleTimes: SAMPLE_TIMES,
    candidateCount: candidates.length,
    summary: {
      baselineCandidateId: baseline.candidateId,
      baselineExpectedScore10: baseline.expectedMatch?.score10 || 0,
      baselineBestMatch: baseline.bestMatch,
      bestCandidateId: best.candidateId,
      bestExpectedScore10: best.expectedMatch?.score10 || 0,
      bestSelectionScore10: best.selectionScore10,
      bestMatch: best.bestMatch,
      expectedLift10: expectedLift,
      keeperDecision: keeper ? 'keeper-ready-for-runtime-review' : 'no-runtime-keeper-yet',
      playerMeaning: keeper
        ? 'A measured stage-11 layout candidate now better matches the third Galaga challenge reference while keeping challenge stages safe.'
        : 'This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.',
      processMeaning: 'Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.',
      nextStep: keeper
        ? 'Promote the best candidate into the stage-11 layout, rebuild, and rerun challenge-stage conformance plus guardrails.'
        : 'Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-11 gameplay.'
    },
    candidates: scored.map(row => ({
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
      selectionScore10: row.selectionScore10
    })),
    measurementPolicy: {
      scope: 'harness-only stage-11 challenge layout candidates',
      reference: 'media-backed Galaga challenge labels with comparison vectors',
      promotionRule: 'Require expected challenge-3 best match, no safety regression, and at least +0.35/10 expected-label lift over baseline before runtime promotion.',
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
    expectedLift10: report.summary.expectedLift10,
    keeperDecision: report.summary.keeperDecision,
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  loadGuardiansVm,
  simulatePersona,
  installGuardiansRuntimeRulePatch
} = require('./guardians-long-surface-lib');

const IDENTITY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity');
const SPEC_DELTA = path.join(IDENTITY_ROOT, 'stage-five-lower-field-readability-spec-delta-0.1.json');
const STAGE_FIVE = path.join(IDENTITY_ROOT, 'stage-five-galaxian-closeness-0.1.json');
const OUT = path.join(IDENTITY_ROOT, 'stage-five-readability-candidate-0.1.json');
const OUT_MD = path.join(IDENTITY_ROOT, 'stage-five-readability-candidate-0.1.md');
const OUT_SVG = path.join(IDENTITY_ROOT, 'stage-five-readability-candidate-0.1.svg');

const PERSONAS = ['advanced', 'expert', 'professional'];
const SEEDS = {
  advanced: 12101,
  expert: 12144,
  professional: 12187
};

const CANDIDATES = [
  {
    id: 'guardians-stage-five-lower-field-readability-v0',
    label: 'Lower-field path clarity v0',
    intent: 'Clarify stage-five lower-field alien paths by slightly lengthening visible dive commitment and reducing lateral ambiguity while preserving missile pace.',
    patch: {
      minRank: 3,
      maxRank: 3,
      scales: {
        scoutDiveIntervalBase: 1.03,
        flagshipDiveIntervalBase: 1.02,
        diveBaseVy: 0.97,
        diveAccel: 0.94,
        diveSideDrift: 0.86,
        diveSwayAmplitude: 0.9,
        topReentrySwayAmplitude: 0.9
      }
    }
  },
  {
    id: 'guardians-stage-five-lane-separation-v1',
    label: 'Lane separation v1',
    intent: 'Reduce confusing lower-field horizontal overlap while leaving dive and shot cadence nearly unchanged.',
    patch: {
      minRank: 3,
      maxRank: 3,
      scales: {
        diveSideDrift: 0.82,
        diveSwayAmplitude: 0.86,
        topReentrySwayAmplitude: 0.88
      }
    }
  },
  {
    id: 'guardians-stage-five-commitment-window-v1',
    label: 'Commitment window v1',
    intent: 'Lengthen the readable lower-field commitment window without spending missile velocity or player single-shot cadence.',
    patch: {
      minRank: 3,
      maxRank: 3,
      scales: {
        scoutDiveIntervalBase: 1.04,
        diveBaseVy: 0.95,
        diveAccel: 0.92,
        diveSideDrift: 0.9,
        diveSwayAmplitude: 0.93
      }
    }
  },
  {
    id: 'guardians-stage-five-commitment-window-v2',
    label: 'Commitment window v2',
    intent: 'Test a stronger alien-path readability window while preserving enemy missile velocity, enemy missile cadence, and player single-shot cadence exactly.',
    patch: {
      minRank: 3,
      maxRank: 3,
      scales: {
        scoutDiveIntervalBase: 1.06,
        flagshipDiveIntervalBase: 1.02,
        diveBaseVy: 0.93,
        diveAccel: 0.88,
        diveSideDrift: 0.94,
        diveSwayAmplitude: 0.96
      }
    }
  }
];

function readJson(file, fallback = {}){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function esc(text){
  return String(text ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp01(value){
  return Math.max(0, Math.min(1, Number.isFinite(+value) ? +value : 0));
}

function average(values = []){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function median(values = []){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number).sort((a, b) => a - b);
  if(!finite.length) return 0;
  const mid = Math.floor(finite.length / 2);
  return finite.length % 2 ? finite[mid] : (finite[mid - 1] + finite[mid]) / 2;
}

function closeness(value, target, tolerance){
  if(!Number.isFinite(+value) || !Number.isFinite(+target) || !Number.isFinite(+tolerance) || tolerance <= 0) return 0;
  return clamp01(1 - Math.abs((+value) - (+target)) / (+tolerance));
}

function score10FromShare(value){
  return round(1 + clamp01(value) * 9, 1);
}

function eventCount(events, type){
  return (events || []).filter(event => event && event.type === type).length;
}

function collisionLossShare(run){
  const reasons = Array.isArray(run.lossReasons) ? run.lossReasons : [];
  if(!reasons.length) return 0;
  return reasons.filter(reason => String(reason || '').includes('collision')).length / reasons.length;
}

function scoreRun(run = {}){
  const duration = Math.max(1, +run.durationSeconds || +run.simT || 1);
  const survivalShare = clamp01((+run.simT || 0) / duration);
  const stageSpan = Math.max(1, ((+run.maxPlayableStage || +run.stageStart || 1) - (+run.stageStart || 1)) + 1);
  const progressionShare = clamp01(((+run.stageAdvances || 0) + (+run.waveClears || 0)) / stageSpan);
  const lossBudgetShare = clamp01(1 - ((+run.playerLosses || 0) / Math.max(1, +run.ships || 3)));
  const shotResolutionShare = eventCount(run.events, 'player_shot_fired')
    ? clamp01(eventCount(run.events, 'player_shot_resolved') / Math.max(1, eventCount(run.events, 'player_shot_fired')))
    : clamp01((run.eventCounts?.player_shot_resolved || 0) / Math.max(1, run.eventCounts?.player_shot_fired || 1));
  const collisionSafetyShare = clamp01(1 - collisionLossShare(run));
  const divePressurePerMinute = (run.eventCounts?.alien_dive_start || 0) / Math.max(1, duration / 60);
  const shotPressurePerMinute = (run.eventCounts?.enemy_shot || 0) / Math.max(1, duration / 60);
  const pressureSurvivability = clamp01(1 - Math.max(0, ((divePressurePerMinute + (shotPressurePerMinute * 0.55)) - 42) / 52));
  const routeability = clamp01(
    (0.24 * survivalShare)
    + (0.18 * progressionShare)
    + (0.16 * lossBudgetShare)
    + (0.17 * collisionSafetyShare)
    + (0.12 * shotResolutionShare)
    + (0.13 * pressureSurvivability)
  );
  return Object.assign({}, run, {
    score10: round(1 + routeability * 8.4, 1),
    components: {
      survivalShare: round(survivalShare, 3),
      progressionShare: round(progressionShare, 3),
      lossBudgetShare: round(lossBudgetShare, 3),
      collisionSafetyShare: round(collisionSafetyShare, 3),
      shotResolutionShare: round(shotResolutionShare, 3),
      pressureSurvivability: round(pressureSurvivability, 3),
      divePressurePerMinute: round(divePressurePerMinute, 2),
      shotPressurePerMinute: round(shotPressurePerMinute, 2),
      collisionLossShare: round(collisionLossShare(run), 3)
    }
  });
}

function summarizeRuns(label, runs){
  const rows = runs.map(scoreRun);
  return {
    label,
    score10: round(average(rows.map(row => row.score10)), 1),
    survivalShare: round(average(rows.map(row => row.components.survivalShare)), 3),
    collisionLossShare: round(average(rows.map(row => row.components.collisionLossShare)), 3),
    playerLosses: round(average(rows.map(row => row.playerLosses)), 2),
    waveClears: round(average(rows.map(row => row.waveClears)), 2),
    divePressurePerMinute: round(average(rows.map(row => row.components.divePressurePerMinute)), 2),
    shotPressurePerMinute: round(average(rows.map(row => row.components.shotPressurePerMinute)), 2),
    rows
  };
}

function simulateRouteability(ctx){
  return summarizeRuns('stage-five-routeability-window', PERSONAS.map(persona => simulatePersona(ctx, persona, {
    stage: 5,
    ships: 5,
    seed: SEEDS[persona],
    maxPlayableStage: 9,
    durationSeconds: 120
  })));
}

function trackDelta(previous, rows, dt, speeds, ySpeeds){
  for(const row of rows){
    if(!row || !row.id) continue;
    const prev = previous.get(row.id);
    if(prev){
      const dx = (+row.x || 0) - (+prev.x || 0);
      const dy = (+row.y || 0) - (+prev.y || 0);
      speeds.push(Math.sqrt(dx * dx + dy * dy) / dt);
      ySpeeds.push(dy / dt);
    }
    previous.set(row.id, { x:+row.x || 0, y:+row.y || 0 });
  }
}

function simulateReadabilityWindow(ctx, { seconds = 36, seed = 12553, persona = 'professional' } = {}){
  const state = ctx.createGalaxyGuardiansRuntimeState({
    stage: 5,
    ships: 5,
    seed,
    maxPlayableStage: 9
  });
  const rules = ctx.guardiansRuntimeRules(5);
  const dt = 1 / 60;
  const frames = Math.round(seconds / dt);
  const alienPrevious = new Map();
  const enemyShotPrevious = new Map();
  const alienSpeeds = [];
  const alienYSpeeds = [];
  const enemyShotSpeeds = [];
  const enemyShotYSpeeds = [];
  const playerShotYSpeeds = [];
  const lowerFieldThreatCounts = [];
  const laneGaps = [];
  let previousPlayerShot = null;
  let lowerFieldThreatFrames = 0;
  let lowerFieldMultiThreatFrames = 0;
  let laneOverlapFrames = 0;
  let playerCorridorBlockedFrames = 0;
  let maxConcurrentThreats = 0;
  let maxEnemyShots = 0;

  for(let frame = 0; frame < frames && !state.gameOver; frame++){
    const input = ctx.galaxyGuardiansHarnessPersonaInput(state, persona);
    ctx.stepGalaxyGuardiansRuntime(state, dt, input);
    const summary = ctx.summarizeGalaxyGuardiansRuntime(state);
    const dives = (summary.activeDives || []).filter(dive => dive.mode === 'diving' || dive.mode === 'wrapping');
    const lowerFieldDives = dives.filter(dive => (+dive.y || 0) >= rules.playfieldHeight * 0.42);
    const enemyShots = summary.enemyShots || [];
    const concurrentThreats = lowerFieldDives.length + enemyShots.length;
    const playerX = +state.player?.x || rules.playfieldWidth / 2;
    const playerCorridorBlocked = lowerFieldDives.some(dive => Math.abs((+dive.x || 0) - playerX) <= 18)
      || enemyShots.some(shot => Math.abs((+shot.x || 0) - playerX) <= 16 && (+shot.y || 0) >= rules.playfieldHeight * 0.52);
    const laneOverlap = lowerFieldDives.some(dive => enemyShots.some(shot =>
      Math.abs((+dive.x || 0) - (+shot.x || 0)) <= 18
      && Math.abs((+dive.y || 0) - (+shot.y || 0)) <= 84
    ));

    if(lowerFieldDives.length) lowerFieldThreatFrames++;
    if(concurrentThreats >= 2) lowerFieldMultiThreatFrames++;
    if(laneOverlap) laneOverlapFrames++;
    if(playerCorridorBlocked) playerCorridorBlockedFrames++;
    if(concurrentThreats > maxConcurrentThreats) maxConcurrentThreats = concurrentThreats;
    if(enemyShots.length > maxEnemyShots) maxEnemyShots = enemyShots.length;
    lowerFieldThreatCounts.push(concurrentThreats);

    for(const dive of lowerFieldDives){
      const nearestShotGap = enemyShots.reduce((best, shot) => Math.min(best, Math.abs((+dive.x || 0) - (+shot.x || 0))), Infinity);
      if(Number.isFinite(nearestShotGap)) laneGaps.push(nearestShotGap);
    }

    trackDelta(alienPrevious, dives, dt, alienSpeeds, alienYSpeeds);
    trackDelta(enemyShotPrevious, enemyShots, dt, enemyShotSpeeds, enemyShotYSpeeds);
    if(state.player && state.player.shot){
      const shot = state.player.shot;
      if(previousPlayerShot){
        playerShotYSpeeds.push(((+shot.y || 0) - (+previousPlayerShot.y || 0)) / dt);
      }
      previousPlayerShot = { y:+shot.y || 0 };
    } else {
      previousPlayerShot = null;
    }
  }

  const events = state.events || [];
  return {
    stage: 5,
    stageRank: ctx.guardiansStageRank(5),
    persona,
    seed,
    seconds,
    simT: round(state.t, 3),
    rules: {
      scoutDiveIntervalBase: rules.scoutDiveIntervalBase,
      flagshipDiveIntervalBase: rules.flagshipDiveIntervalBase,
      diveBaseVy: rules.diveBaseVy,
      diveAccel: rules.diveAccel,
      diveSideDrift: rules.diveSideDrift,
      diveSwayAmplitude: rules.diveSwayAmplitude,
      enemyShotIntervalBase: rules.enemyShotIntervalBase,
      enemyShotVy: rules.enemyShotVy,
      enemyShotMaxLive: rules.enemyShotMaxLive,
      singleShotCooldown: rules.singleShotCooldown
    },
    events: {
      alienDiveStart: eventCount(events, 'alien_dive_start'),
      flagshipDiveStart: eventCount(events, 'flagship_dive_start'),
      escortJoin: eventCount(events, 'escort_join'),
      enemyShot: eventCount(events, 'enemy_shot'),
      enemyWrapOrReturn: eventCount(events, 'enemy_wrap_or_return'),
      playerShotFired: eventCount(events, 'player_shot_fired'),
      playerShotResolved: eventCount(events, 'player_shot_resolved')
    },
    pace: {
      medianAlienShipSpeedPxPerSecond: round(median(alienSpeeds), 2),
      medianAlienShipYSpeedPxPerSecond: round(median(alienYSpeeds), 2),
      medianEnemyMissileSpeedPxPerSecond: round(median(enemyShotSpeeds), 2),
      medianEnemyMissileYSpeedPxPerSecond: round(median(enemyShotYSpeeds), 2),
      medianPlayerMissileYSpeedPxPerSecond: round(Math.abs(median(playerShotYSpeeds)), 2),
      lowerFieldThreatShare: round(lowerFieldThreatFrames / Math.max(1, frames), 3),
      lowerFieldMultiThreatShare: round(lowerFieldMultiThreatFrames / Math.max(1, frames), 3),
      laneOverlapShare: round(laneOverlapFrames / Math.max(1, frames), 3),
      playerCorridorBlockedShare: round(playerCorridorBlockedFrames / Math.max(1, frames), 3),
      medianNearestShotLaneGapPx: round(median(laneGaps), 2),
      averageConcurrentThreats: round(average(lowerFieldThreatCounts), 2),
      maxConcurrentThreats,
      maxEnemyShots
    },
    finalState: {
      score: state.score,
      lives: state.lives,
      stage: state.stage,
      gameOver: !!state.gameOver,
      gameOverReason: state.gameOverReason || ''
    }
  };
}

function readabilityScore(window, routeability){
  return round(average([
    routeability.score10,
    score10FromShare(closeness(window.pace.lowerFieldMultiThreatShare, 0.2, 0.2)),
    score10FromShare(clamp01(1 - routeability.collisionLossShare)),
    score10FromShare(clamp01(1 - (window.pace.laneOverlapShare / 0.18))),
    score10FromShare(closeness(window.pace.lowerFieldThreatShare, 0.24, 0.18))
  ]), 1);
}

function buildContext(candidate = null){
  const ctx = loadGuardiansVm();
  if(candidate) installGuardiansRuntimeRulePatch(ctx, candidate.patch);
  return ctx;
}

function evaluateCandidate(candidate, baseline){
  const ctx = buildContext(candidate);
  const routeability = simulateRouteability(ctx);
  const readabilityWindow = simulateReadabilityWindow(ctx);
  const lowerFieldReadabilityScore10 = readabilityScore(readabilityWindow, routeability);
  const routeabilityLift10 = round(routeability.score10 - baseline.routeability.score10, 1);
  const readabilityLift10 = round(lowerFieldReadabilityScore10 - baseline.lowerFieldReadabilityScore10, 1);
  const collisionLossDelta = round(routeability.collisionLossShare - baseline.routeability.collisionLossShare, 3);
  const laneOverlapDelta = round(readabilityWindow.pace.laneOverlapShare - baseline.readabilityWindow.pace.laneOverlapShare, 3);
  const missilePacePreserved = Math.abs(readabilityWindow.rules.enemyShotVy - baseline.readabilityWindow.rules.enemyShotVy) < 0.001
    && Math.abs(readabilityWindow.rules.enemyShotIntervalBase - baseline.readabilityWindow.rules.enemyShotIntervalBase) < 0.001
    && Math.abs(readabilityWindow.rules.singleShotCooldown - baseline.readabilityWindow.rules.singleShotCooldown) < 0.001;
  const pressureRetention = (baseline.routeability.divePressurePerMinute + baseline.routeability.shotPressurePerMinute)
    ? (routeability.divePressurePerMinute + routeability.shotPressurePerMinute) / Math.max(0.1, baseline.routeability.divePressurePerMinute + baseline.routeability.shotPressurePerMinute)
    : 1;
  const pass = readabilityLift10 >= 0.2
    && routeabilityLift10 >= 0
    && collisionLossDelta <= 0
    && laneOverlapDelta <= 0
    && pressureRetention >= 0.88
    && missilePacePreserved;
  return {
    id: candidate.id,
    label: candidate.label,
    intent: candidate.intent,
    patch: candidate.patch,
    routeability,
    readabilityWindow,
    lowerFieldReadabilityScore10,
    routeabilityLift10,
    readabilityLift10,
    collisionLossDelta,
    laneOverlapDelta,
    pressureRetention: round(pressureRetention, 3),
    missilePacePreserved,
    promotionGate: {
      pass,
      runtimeChangeAllowed: false,
      requiredReadabilityLift10: 0.2,
      minPressureRetention: 0.88,
      requireMissilePacePreserved: true,
      read: pass
        ? 'Candidate clears the measurement gate for browser/contact-sheet review, but it remains analysis-only.'
        : 'Candidate is useful evidence but does not clear the measurement gate for runtime promotion.'
    }
  };
}

function buildMarkdown(report){
  const rows = report.candidates.map(candidate => `| ${candidate.label} | ${candidate.lowerFieldReadabilityScore10}/10 | ${candidate.readabilityLift10}/10 | ${candidate.routeability.score10}/10 | ${round(candidate.routeability.collisionLossShare * 100, 0)}% | ${round(candidate.readabilityWindow.pace.laneOverlapShare * 100, 0)}% | ${round(candidate.pressureRetention * 100, 0)}% | ${candidate.promotionGate.pass ? 'measurement pass' : 'blocked'} |`).join('\n');
  return `# Galaxy Guardians Stage-Five Readability Candidate

Generated: ${report.createdOn}
Status: ${report.status}

## Summary

${report.summary.releaseRead}

This artifact is candidate-harness evidence only. It does not change shipped
Guardians runtime constants.

| Candidate | Readability | Lift | Routeability | Collision Losses | Lane Overlap | Pressure Retention | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Baseline

| Signal | Current |
| --- | ---: |
| Lower-field readability | ${report.baseline.lowerFieldReadabilityScore10}/10 |
| Routeability | ${report.baseline.routeability.score10}/10 |
| Collision-loss share | ${round(report.baseline.routeability.collisionLossShare * 100, 0)}% |
| Lane-overlap share | ${round(report.baseline.readabilityWindow.pace.laneOverlapShare * 100, 0)}% |
| Enemy missile speed | ${report.baseline.readabilityWindow.rules.enemyShotVy}px/s |
| Single-shot cooldown | ${report.baseline.readabilityWindow.rules.singleShotCooldown}s |

## Best Candidate

${report.summary.bestCandidateId || 'No candidate'} is the current best measured
candidate. ${report.summary.bestCandidateRead}

## Next Step

${report.nextSteps.map(step => `- ${step}`).join('\n')}
`;
}

function svgText(text, x, y, size = 16, fill = '#eaf8ff', weight = 700){
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(text)}</text>`;
}

function bar({ x, y, width, height, value, max, fill, label }){
  const ratio = clamp01((+value || 0) / Math.max(0.001, +max || 1));
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="7" fill="#102237" stroke="#244863"/>`,
    `<rect x="${x}" y="${y}" width="${Math.max(2, width * ratio)}" height="${height}" rx="7" fill="${fill}"/>`,
    svgText(label, x + 10, y + height - 10, 13, '#06101a', 800)
  ].join('\n');
}

function writeChart(report){
  const width = 1180;
  const rowH = 102;
  const top = 124;
  const height = top + report.candidates.length * rowH + 92;
  const children = [
    `<rect width="100%" height="100%" fill="#06101a"/>`,
    svgText('Galaxy Guardians Stage 5 Readability Candidate', 32, 42, 28, '#f2fbff', 900),
    svgText('Harness-only profile comparison: no shipped runtime constants changed', 32, 72, 15, '#9fc8e8', 600),
    svgText('Readability', 430, 108, 13, '#9fc8e8', 800),
    svgText('Routeability', 640, 108, 13, '#9fc8e8', 800),
    svgText('Lane Clarity', 850, 108, 13, '#9fc8e8', 800),
    svgText('Pressure', 1030, 108, 13, '#9fc8e8', 800)
  ];
  report.candidates.forEach((candidate, index) => {
    const y = top + index * rowH;
    const passFill = candidate.promotionGate.pass ? '#8effd2' : '#ffb0a8';
    children.push(`<rect x="24" y="${y - 24}" width="${width - 48}" height="${rowH - 12}" rx="10" fill="#0b1725" stroke="#193b55"/>`);
    children.push(svgText(candidate.label, 42, y + 2, 16, '#f2fbff', 800));
    children.push(svgText(candidate.id, 42, y + 26, 12, '#9fc8e8', 600));
    children.push(svgText(candidate.promotionGate.pass ? 'measurement pass' : 'blocked', 42, y + 56, 13, passFill, 800));
    children.push(bar({
      x: 408,
      y: y + 5,
      width: 170,
      height: 30,
      value: candidate.lowerFieldReadabilityScore10,
      max: 10,
      fill: '#8effd2',
      label: `${report.baseline.lowerFieldReadabilityScore10} -> ${candidate.lowerFieldReadabilityScore10}`
    }));
    children.push(bar({
      x: 620,
      y: y + 5,
      width: 170,
      height: 30,
      value: candidate.routeability.score10,
      max: 10,
      fill: '#7bd6ff',
      label: `${report.baseline.routeability.score10} -> ${candidate.routeability.score10}`
    }));
    children.push(bar({
      x: 832,
      y: y + 5,
      width: 148,
      height: 30,
      value: 1 - candidate.readabilityWindow.pace.laneOverlapShare,
      max: 1,
      fill: '#ffd36e',
      label: `${round(candidate.readabilityWindow.pace.laneOverlapShare * 100, 0)}% overlap`
    }));
    children.push(bar({
      x: 1012,
      y: y + 5,
      width: 118,
      height: 30,
      value: candidate.pressureRetention,
      max: 1.25,
      fill: '#ff8eb5',
      label: `${round(candidate.pressureRetention * 100, 0)}%`
    }));
  });
  children.push(svgText(report.summary.bestCandidateRead, 32, height - 38, 15, '#c7dff3', 600));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  ${children.join('\n  ')}
</svg>
`;
  writeText(OUT_SVG, svg);
  return rel(OUT_SVG);
}

function main(){
  const specDelta = readJson(SPEC_DELTA);
  const stageFive = readJson(STAGE_FIVE);
  const baselineCtx = buildContext();
  const baselineRouteability = simulateRouteability(baselineCtx);
  const baselineWindow = simulateReadabilityWindow(baselineCtx);
  const baseline = {
    routeability: baselineRouteability,
    readabilityWindow: baselineWindow,
    lowerFieldReadabilityScore10: readabilityScore(baselineWindow, baselineRouteability)
  };
  const candidates = CANDIDATES.map(candidate => evaluateCandidate(candidate, baseline));
  const best = candidates.slice().sort((a, b) => {
    if(b.promotionGate.pass !== a.promotionGate.pass) return b.promotionGate.pass ? 1 : -1;
    if(b.readabilityLift10 !== a.readabilityLift10) return b.readabilityLift10 - a.readabilityLift10;
    return b.routeabilityLift10 - a.routeabilityLift10;
  })[0] || null;
  const report = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-stage-five-readability-candidate',
    version: '0.1-dev-preview',
    createdOn: new Date().toISOString(),
    status: 'analysis-only-no-runtime-change',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-stage-five-readability-candidate.js',
    sourceEvidence: {
      specDelta: rel(SPEC_DELTA),
      stageFiveCloseness: rel(STAGE_FIVE)
    },
    specDeltaCandidateId: specDelta.candidateId || 'guardians-stage-five-lower-field-readability-v0',
    baselineSpecRead: {
      stageFiveClosenessScore10: stageFive.summary?.stageFiveClosenessScore10,
      stageFiveRouteabilityScore10: stageFive.summary?.stageFiveRouteabilityScore10,
      alienShipPaceConformanceScore10: stageFive.summary?.alienShipPaceConformanceScore10,
      missilePaceConformanceScore10: stageFive.summary?.missilePaceConformanceScore10,
      lowerFieldReadabilityScore10: stageFive.summary?.lowerFieldReadabilityScore10,
      weakestFocus: stageFive.summary?.weakestFocus
    },
    scenario: {
      stage: 5,
      stageRank: 3,
      personas: PERSONAS,
      seeds: SEEDS,
      ships: 5,
      maxPlayableStage: 9,
      routeabilityDurationSeconds: 120,
      readabilityWindowSeconds: 36
    },
    baseline,
    candidates,
    summary: {
      candidateCount: candidates.length,
      bestCandidateId: best?.id || null,
      bestCandidatePass: !!best?.promotionGate?.pass,
      bestCandidateReadabilityScore10: best?.lowerFieldReadabilityScore10 ?? null,
      bestCandidateReadabilityLift10: best?.readabilityLift10 ?? null,
      bestCandidateRouteabilityLift10: best?.routeabilityLift10 ?? null,
      baselineReadabilityScore10: baseline.lowerFieldReadabilityScore10,
      missilePacePreservedByBestCandidate: !!best?.missilePacePreserved,
      runtimeChangeAllowed: false,
      bestCandidateRead: best
        ? `${best.label} changes lower-field readability by ${best.readabilityLift10}/10, routeability by ${best.routeabilityLift10}/10, collision-loss share by ${round(best.collisionLossDelta * 100, 0)} points, and retains ${round(best.pressureRetention * 100, 0)}% of measured pressure.`
        : 'No candidate was measured.',
      releaseRead: best
        ? `Measured ${candidates.length} stage-five readability candidates against ${specDelta.candidateId}. ${best.label} is best so far: ${best.readabilityLift10}/10 readability lift, ${best.routeabilityLift10}/10 routeability lift, missile pace preserved: ${best.missilePacePreserved ? 'yes' : 'no'}.`
        : 'No stage-five readability candidates were measured.'
    },
    nextSteps: [
      'Use the best passing candidate, if any, to generate a browser/contact-sheet before-after review.',
      'Do not promote runtime constants until the candidate also passes stage-five closeness, routeability review, and first-class conformance after refreshed artifacts.',
      'If visual review says the lower field is still confusing, bias the next candidate toward path shape and lane separation before changing missile pace.'
    ]
  };
  report.media = {
    summaryChart: writeChart(report)
  };
  writeJson(OUT, report);
  writeText(OUT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    summaryChart: report.media.summaryChart,
    baselineReadabilityScore10: report.summary.baselineReadabilityScore10,
    bestCandidateId: report.summary.bestCandidateId,
    bestCandidateReadabilityScore10: report.summary.bestCandidateReadabilityScore10,
    bestCandidateReadabilityLift10: report.summary.bestCandidateReadabilityLift10,
    bestCandidateRouteabilityLift10: report.summary.bestCandidateRouteabilityLift10,
    bestCandidatePass: report.summary.bestCandidatePass,
    runtimeChangeAllowed: report.summary.runtimeChangeAllowed
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.stack || String(err));
  process.exit(1);
}

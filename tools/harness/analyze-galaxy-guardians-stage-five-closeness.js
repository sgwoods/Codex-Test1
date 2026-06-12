#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  loadGuardiansVm
} = require('./guardians-long-surface-lib');

const IDENTITY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity');
const OUT = path.join(IDENTITY_ROOT, 'stage-five-galaxian-closeness-0.1.json');
const OUT_MD = path.join(IDENTITY_ROOT, 'stage-five-galaxian-closeness-0.1.md');
const ROUTEABILITY = path.join(IDENTITY_ROOT, 'routeability-review-0.1.json');
const LONG_SURFACE = path.join(IDENTITY_ROOT, 'long-surface-conformance-0.1.json');
const MOVEMENT_PACING = path.join(IDENTITY_ROOT, 'movement-pacing-0.1.json');
const RUNTIME_MOVEMENT = path.join(IDENTITY_ROOT, 'runtime-reference-movement-0.1.json');
const REFERENCE_PROFILE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'initial-measured-profile.json');
const PROMOTED_EVENT_LOG = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'promoted-event-log.json');

function readJson(file, fallback = null){
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

function trackDeltaSamples(previous, currentRows, t, dt, speedRows, ySpeedRows){
  for(const row of currentRows){
    if(!row || !row.id) continue;
    const prev = previous.get(row.id);
    if(prev){
      const dx = (+row.x || 0) - (+prev.x || 0);
      const dy = (+row.y || 0) - (+prev.y || 0);
      speedRows.push(Math.sqrt(dx * dx + dy * dy) / dt);
      ySpeedRows.push(dy / dt);
    }
    previous.set(row.id, { x:+row.x || 0, y:+row.y || 0, t });
  }
}

function simulateStageFivePace(ctx, {
  seconds = 24,
  seed = 12553,
  persona = 'professional'
} = {}){
  const state = ctx.createGalaxyGuardiansRuntimeState({
    stage: 5,
    ships: 5,
    seed,
    maxPlayableStage: 9
  });
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
  const rules = ctx.guardiansRuntimeRules(5);
  let previousPlayerShot = null;
  let lowerFieldThreatFrames = 0;
  let lowerFieldMultiThreatFrames = 0;
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

    if(lowerFieldDives.length) lowerFieldThreatFrames++;
    if(concurrentThreats >= 2) lowerFieldMultiThreatFrames++;
    if(concurrentThreats > maxConcurrentThreats) maxConcurrentThreats = concurrentThreats;
    if(enemyShots.length > maxEnemyShots) maxEnemyShots = enemyShots.length;
    lowerFieldThreatCounts.push(concurrentThreats);

    trackDeltaSamples(alienPrevious, dives, state.t, dt, alienSpeeds, alienYSpeeds);
    trackDeltaSamples(enemyShotPrevious, enemyShots, state.t, dt, enemyShotSpeeds, enemyShotYSpeeds);

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
    persona,
    seconds,
    seed,
    simT: round(state.t, 3),
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

function midrunRouteability(routeability){
  const group = (routeability.groups || []).find(candidate => candidate.label === 'midrun-stage-five-stress');
  return {
    score10: group?.score10 ?? routeability.summary?.weakestGroupScore10 ?? 0,
    collisionLossShare: group?.collisionLossShare ?? 0,
    progressionShare: group?.progressionShare ?? 0,
    survivalShare: group?.survivalShare ?? 0,
    read: group?.read || ''
  };
}

function buildMarkdown(report){
  const s = report.summary;
  const alien = report.paceFocus.alienShipMovement;
  const missile = report.paceFocus.missileMovement;
  const stage = report.stageFiveWindow;
  return `# Galaxy Guardians Stage-Five Galaxian Closeness

Generated: ${report.createdOn}
Status: ${report.status}

## Summary

${s.releaseRead}

| Signal | Score |
| --- | ---: |
| Stage-five closeness | ${s.stageFiveClosenessScore10}/10 |
| Routeability | ${s.stageFiveRouteabilityScore10}/10 |
| Alien ship pace conformance | ${s.alienShipPaceConformanceScore10}/10 |
| Missile pace conformance | ${s.missilePaceConformanceScore10}/10 |
| Lower-field readability | ${s.lowerFieldReadabilityScore10}/10 |

## Pace Focus

| Area | Current Read | Maintained Signal |
| --- | --- | --- |
| Alien ship movement | ${alien.currentRead} | ${alien.maintainedSignal} |
| Missile movement | ${missile.currentRead} | ${missile.maintainedSignal} |

## Stage-Five Window

| Metric | Value |
| --- | ---: |
| Persona | ${stage.persona} |
| Sim time | ${stage.simT}s |
| Alien dives | ${stage.events.alienDiveStart} |
| Flagship dives | ${stage.events.flagshipDiveStart} |
| Enemy missiles | ${stage.events.enemyShot} |
| Wrap/returns | ${stage.events.enemyWrapOrReturn} |
| Median alien ship speed | ${stage.pace.medianAlienShipSpeedPxPerSecond}px/s |
| Median enemy missile speed | ${stage.pace.medianEnemyMissileSpeedPxPerSecond}px/s |
| Median player missile speed | ${stage.pace.medianPlayerMissileYSpeedPxPerSecond}px/s |
| Lower-field threat share | ${round(stage.pace.lowerFieldThreatShare * 100, 0)}% |
| Multi-threat share | ${round(stage.pace.lowerFieldMultiThreatShare * 100, 0)}% |

## Promotion Policy

${report.promotionPolicy}

## Next Work

${report.nextSteps.map(step => `- ${step}`).join('\n')}
`;
}

function main(){
  const routeability = readJson(ROUTEABILITY, {});
  const longSurface = readJson(LONG_SURFACE, {});
  const movementPacing = readJson(MOVEMENT_PACING, {});
  const runtimeMovement = readJson(RUNTIME_MOVEMENT, {});
  const ctx = loadGuardiansVm();
  const stageFiveWindow = simulateStageFivePace(ctx);
  const stageOneRules = ctx.guardiansRuntimeRules(1);
  const stageFiveRules = ctx.guardiansRuntimeRules(5);
  const route = midrunRouteability(routeability);
  const movementScoreParts = runtimeMovement.scoreParts || {};
  const durationFit10 = movementScoreParts.durationFit ?? 0;
  const xSpanFit10 = movementScoreParts.xSpanFit ?? 0;
  const ySpanFit10 = movementScoreParts.ySpanFit ?? 0;

  const alienPaceParts = {
    durationFit10,
    xSpanFit10,
    ySpanFit10,
    observedLowerFieldPressure10: score10FromShare(closeness(stageFiveWindow.pace.lowerFieldThreatShare, 0.24, 0.18)),
    routeabilityBridge10: route.score10
  };
  const alienShipPaceConformanceScore10 = round(average(Object.values(alienPaceParts)), 1);

  const enemyShotVelocityRatio = stageFiveRules.enemyShotVy / Math.max(1, stageOneRules.enemyShotVy);
  const enemyShotIntervalRatio = stageFiveRules.enemyShotIntervalBase / Math.max(0.01, stageOneRules.enemyShotIntervalBase);
  const observedEnemyMissileFit = stageFiveWindow.pace.medianEnemyMissileYSpeedPxPerSecond
    ? closeness(stageFiveWindow.pace.medianEnemyMissileYSpeedPxPerSecond, stageFiveRules.enemyShotVy, 8)
    : 0;
  const observedPlayerMissileFit = stageFiveWindow.pace.medianPlayerMissileYSpeedPxPerSecond
    ? closeness(stageFiveWindow.pace.medianPlayerMissileYSpeedPxPerSecond, 178, 6)
    : 0;
  const missilePaceParts = {
    enemyShotVelocityEscalation10: score10FromShare(closeness(enemyShotVelocityRatio, 1.18, 0.22)),
    enemyShotIntervalEscalation10: score10FromShare(closeness(enemyShotIntervalRatio, 0.86, 0.18)),
    observedEnemyMissileSpeedFit10: score10FromShare(observedEnemyMissileFit),
    observedPlayerMissileSpeedFit10: score10FromShare(observedPlayerMissileFit),
    singleShotCadenceAnchor10: score10FromShare(closeness(stageOneRules.singleShotCooldown, 0.72, 0.08))
  };
  const missilePaceConformanceScore10 = round(average(Object.values(missilePaceParts)), 1);
  const lowerFieldReadabilityScore10 = round(average([
    route.score10,
    score10FromShare(closeness(stageFiveWindow.pace.lowerFieldMultiThreatShare, 0.2, 0.2)),
    score10FromShare(clamp01(1 - route.collisionLossShare))
  ]), 1);
  const stageFiveClosenessScore10 = round(
    (route.score10 * 0.34)
    + (alienShipPaceConformanceScore10 * 0.28)
    + (missilePaceConformanceScore10 * 0.22)
    + (lowerFieldReadabilityScore10 * 0.16),
    1
  );
  const weakest = [
    ['stage-five-routeability', route.score10],
    ['alien-ship-pace', alienShipPaceConformanceScore10],
    ['missile-pace', missilePaceConformanceScore10],
    ['lower-field-readability', lowerFieldReadabilityScore10]
  ].sort((a, b) => a[1] - b[1])[0];

  const report = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'stage-five-galaxian-closeness',
    version: '0.1-dev-preview',
    createdOn: new Date().toISOString(),
    status: 'stage-five-galaxian-closeness-planning-gate-not-runtime-promotion',
    sourceEvidence: {
      referenceProfile: rel(REFERENCE_PROFILE),
      promotedEventLog: rel(PROMOTED_EVENT_LOG),
      routeabilityReview: rel(ROUTEABILITY),
      longSurfaceConformance: rel(LONG_SURFACE),
      movementPacing: rel(MOVEMENT_PACING),
      runtimeReferenceMovement: rel(RUNTIME_MOVEMENT)
    },
    summary: {
      stageFiveClosenessScore10,
      stageFiveRouteabilityScore10: route.score10,
      alienShipPaceConformanceScore10,
      missilePaceConformanceScore10,
      lowerFieldReadabilityScore10,
      weakestFocus: weakest[0],
      releaseRead: `Stage-five Guardians closeness is ${stageFiveClosenessScore10}/10. The next Galaxian-fidelity work should keep stage-five routeability, alien-ship pace, and missile pace in the same promotion gate; the weakest current signal is ${weakest[0]} at ${round(weakest[1], 1)}/10.`
    },
    stageFiveRules: {
      firstScoutDiveDelay: stageFiveRules.firstScoutDiveDelay,
      scoutDiveIntervalBase: stageFiveRules.scoutDiveIntervalBase,
      flagshipDiveIntervalBase: stageFiveRules.flagshipDiveIntervalBase,
      diveBaseVy: stageFiveRules.diveBaseVy,
      diveAccel: stageFiveRules.diveAccel,
      enemyShotIntervalBase: stageFiveRules.enemyShotIntervalBase,
      enemyShotVy: stageFiveRules.enemyShotVy,
      enemyShotMaxLive: stageFiveRules.enemyShotMaxLive,
      playerShotVy: -178,
      singleShotCooldown: stageFiveRules.singleShotCooldown
    },
    stageFiveWindow,
    paceFocus: {
      alienShipMovement: {
        score10: alienShipPaceConformanceScore10,
        scoreParts: alienPaceParts,
        currentRead: `Runtime movement has strong x-span fit (${xSpanFit10}/10) but weaker dive-duration fit (${durationFit10}/10), so stage-five tuning should lengthen and clarify attack motion before simply adding density.`,
        maintainedSignal: 'Future Guardians promotion candidates must report alien ship dive duration, x/y span, lower-field threat share, and routeability together.'
      },
      missileMovement: {
        score10: missilePaceConformanceScore10,
        scoreParts: missilePaceParts,
        currentRead: `Stage-five enemy missiles run at ${round(stageFiveRules.enemyShotVy, 1)}px/s with a ${round(stageFiveRules.enemyShotIntervalBase, 3)}s base interval; player missiles remain single-shot at about 178px/s.`,
        maintainedSignal: 'Future Guardians promotion candidates must report enemy missile velocity, enemy missile cadence, player missile velocity, and single-shot cooldown before changing pressure.'
      },
      lowerFieldReadability: {
        score10: lowerFieldReadabilityScore10,
        routeability: route,
        currentRead: 'The lower field has enough pressure to read as Galaxian-family, but route conversion and collision clarity remain the stage-five bottleneck.'
      }
    },
    promotionPolicy: 'Do not promote Guardians stage-five movement candidates only because they increase pressure or look more active. A candidate must preserve or improve stage-five routeability while explicitly reporting alien ship pace and missile pace: dive duration/shape, x/y span, lower-field threat share, enemy missile velocity/cadence, player missile velocity, and single-shot cooldown.',
    nextSteps: [
      'Build the next stage-five candidate as a measured before/after against this artifact, not as a subjective runtime tweak.',
      'Prioritize longer, more readable alien dive shape before increasing enemy count or missile density.',
      'Keep missile movement as a named conformance lane whenever shot velocity, shot cadence, or single-shot timing changes.',
      'Refresh routeability-review, runtime-reference-movement, and this stage-five closeness artifact after each promoted candidate.'
    ],
    relatedLongSurfaceRead: longSurface.summary?.releaseRead || '',
    movementPacingStatus: movementPacing.status || '',
    runtimeReferenceMovementStatus: runtimeMovement.status || ''
  };

  writeJson(OUT, report);
  writeText(OUT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    stageFiveClosenessScore10,
    stageFiveRouteabilityScore10: route.score10,
    alienShipPaceConformanceScore10,
    missilePaceConformanceScore10,
    weakestFocus: report.summary.weakestFocus
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.stack || String(err));
  process.exit(1);
}

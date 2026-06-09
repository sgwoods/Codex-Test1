#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  loadGuardiansVm
} = require('./guardians-long-surface-lib');

const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-opening-failure-0.1.json');
const OUT_MD = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-opening-failure-0.1.md');

function round(value, places = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(places) : 0;
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function eventCounts(events = []){
  const counts = {};
  for(const event of events){
    const key = String(event?.type || '').trim();
    if(key) counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function snapshotPressure(state){
  const player = state.player || {};
  const playerX = +player.x || 0;
  const playerY = +player.y || 0;
  const shots = (state.enemyShots || [])
    .filter(shot => shot && shot.active !== 0)
    .map(shot => ({
      id: String(shot.id || ''),
      sourceId: String(shot.sourceId || ''),
      role: String(shot.role || ''),
      x: round(shot.x, 2),
      y: round(shot.y, 2),
      dx: round((+shot.x || 0) - playerX, 2),
      dyToPlayer: round(playerY - (+shot.y || 0), 2),
      closingSeconds: round((playerY - (+shot.y || 0)) / Math.max(1, +shot.vy || 1), 3)
    }))
    .sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx) || a.dyToPlayer - b.dyToPlayer);
  const dives = (state.aliens || [])
    .filter(alien => alien && alien.hp > 0 && (alien.mode === 'diving' || alien.mode === 'wrapping'))
    .map(alien => ({
      id: String(alien.id || ''),
      role: String(alien.role || ''),
      mode: String(alien.mode || ''),
      x: round(alien.x, 2),
      y: round(alien.y, 2),
      dx: round((+alien.x || 0) - playerX, 2),
      dyToPlayer: round(playerY - (+alien.y || 0), 2),
      linkedTo: String(alien.linkedTo || '')
    }))
    .sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx) || a.dyToPlayer - b.dyToPlayer);
  return {
    t: round(state.t, 3),
    stage: state.stage | 0,
    score: state.score | 0,
    lives: state.lives | 0,
    player: {
      x: round(playerX, 2),
      y: round(playerY, 2),
      visible: player.visible !== 0,
      inv: round(player.inv, 3),
      cooldown: round(player.cooldown, 3),
      shotActive: !!player.shot
    },
    activeShotCount: shots.length,
    activeDiveCount: dives.length,
    nearestShots: shots.slice(0, 4),
    nearestDives: dives.slice(0, 4)
  };
}

function simulateTrace({
  persona = 'expert',
  seed = 5175,
  stage = 1,
  ships = 3,
  maxPlayableStage = 6,
  durationSeconds = 180
} = {}){
  const ctx = loadGuardiansVm();
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage, ships, seed, maxPlayableStage });
  const frames = Math.round(durationSeconds * 60);
  const losses = [];
  let seenEvents = 0;
  let previous = snapshotPressure(state);
  for(let i = 0; i < frames && !state.gameOver; i++){
    previous = snapshotPressure(state);
    const input = ctx.galaxyGuardiansHarnessPersonaInput(state, persona);
    ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, input);
    const events = state.events || [];
    const nextEvents = events.slice(seenEvents);
    if(nextEvents.some(event => event.type === 'player_lost')){
      const loss = nextEvents.find(event => event.type === 'player_lost');
      losses.push({
        t: round(loss.t, 3),
        cause: String(loss.cause || ''),
        livesAfter: +loss.lives || 0,
        score: state.score | 0,
        frameBefore: previous,
        recentEvents: events
          .filter(event => event.t >= loss.t - 4 && event.t <= loss.t + 0.001)
          .map(event => ({
            t: round(event.t, 3),
            type: String(event.type || ''),
            role: String(event.role || ''),
            id: String(event.id || ''),
            sourceId: String(event.sourceId || ''),
            cause: String(event.cause || ''),
            x: Number.isFinite(+event.x) ? round(event.x, 2) : undefined,
            y: Number.isFinite(+event.y) ? round(event.y, 2) : undefined
          }))
      });
    }
    seenEvents = events.length;
  }
  const summary = ctx.summarizeGalaxyGuardiansRuntime(state);
  const events = summary.events || [];
  return {
    persona,
    seed,
    stageStart: stage,
    ships,
    maxPlayableStage,
    durationSeconds,
    simT: round(events.length ? events[events.length - 1].t || 0 : 0),
    finalStage: summary.stage || stage,
    score: summary.score || 0,
    lives: summary.lives || 0,
    gameOver: !!summary.gameOver,
    gameOverReason: summary.gameOverReason || '',
    eventCounts: eventCounts(events),
    lossCount: losses.length,
    lossCauses: eventCounts(losses.map(loss => ({ type: loss.cause }))),
    losses
  };
}

function buildMarkdown(artifact){
  const rows = artifact.trace.losses.map(loss => {
    const before = loss.frameBefore || {};
    const shot = (before.nearestShots || [])[0] || {};
    const dive = (before.nearestDives || [])[0] || {};
    return `| ${loss.t}s | ${loss.cause} | ${loss.livesAfter} | ${before.player?.x ?? ''} | ${before.activeShotCount ?? 0} | ${shot.dx ?? ''} | ${shot.dyToPlayer ?? ''} | ${before.activeDiveCount ?? 0} | ${dive.role || ''} ${dive.dx ?? ''}/${dive.dyToPlayer ?? ''} |`;
  }).join('\n');
  return `# Galaxy Guardians Expert Opening Failure

Generated: ${artifact.createdOn}
Status: ${artifact.status}

## Summary

${artifact.summary.read}

## Loss Timeline

| Time | Cause | Lives After | Player X | Shots | Nearest Shot dx | Nearest Shot dy | Dives | Nearest Dive role dx/dy |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Promotion Policy

${artifact.promotionPolicy}
`;
}

function main(){
  const trace = simulateTrace();
  const enemyShotLosses = trace.losses.filter(loss => loss.cause === 'enemy_shot').length;
  const collisionLosses = trace.losses.filter(loss => String(loss.cause).includes('collision')).length;
  const allLossesHavePressure = trace.losses.every(loss => {
    const before = loss.frameBefore || {};
    return (before.activeShotCount || 0) || (before.activeDiveCount || 0);
  });
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-expert-opening-failure',
    version: '0.1',
    createdOn: new Date().toISOString(),
    status: 'expert-opening-routeability-diagnostic-not-runtime-promotion',
    sourceEvidence: [
      'tools/harness/guardians-long-surface-lib.js',
      'src/js/13-galaxy-guardians-gameplay-adapter.js',
      'src/js/13-galaxy-guardians-runtime.js',
      'reference-artifacts/analyses/galaxy-guardians-identity/routeability-review-0.1.json'
    ],
    summary: {
      persona: trace.persona,
      seed: trace.seed,
      simT: trace.simT,
      score: trace.score,
      finalStage: trace.finalStage,
      lossCount: trace.lossCount,
      enemyShotLosses,
      collisionLosses,
      allLossesHavePressure,
      read: `Expert opening seed ${trace.seed} ends at ${trace.simT}s with score ${trace.score}; losses are ${enemyShotLosses} enemy-shot and ${collisionLosses} collision. The next safe tuning target is whichever loss windows show avoidable pressure without reducing Advanced routeability.`
    },
    trace,
    promotionPolicy: 'Do not promote Expert opening changes from score alone. A candidate should preserve Advanced three-ship routeability, improve Expert survival or stage progress on seed 5175, and reduce repeated loss windows without hiding core Galaxian-family shot/dive pressure.'
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(artifact, null, 2)}\n`);
  fs.writeFileSync(OUT_MD, `${buildMarkdown(artifact).trimEnd()}\n`);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    simT: artifact.summary.simT,
    score: artifact.summary.score,
    enemyShotLosses,
    collisionLosses
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}

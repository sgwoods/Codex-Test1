#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { writePortableSummary } = require('./summary-path-util');
const { spawnSync } = require('child_process');

function parseArgs(argv){
  const args = {};
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i+1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function counts(events){
  const out = {};
  for(const e of events) out[e.type] = (out[e.type] || 0) + 1;
  return out;
}

function nearestSnapshot(session, t){
  const snaps = session.snapshots || [];
  let best = null;
  let bestDt = Infinity;
  for(const snap of snaps){
    const dt = Math.abs((snap.t || 0) - t);
    if(dt < bestDt){
      best = snap;
      bestDt = dt;
    }
  }
  return best;
}

function byStage(events, type){
  const out = {};
  for(const e of events){
    if(type && e.type !== type) continue;
    const stage = e.stage || 0;
    if(!out[stage]) out[stage] = [];
    out[stage].push(e);
  }
  return out;
}

function stageMetrics(session){
  const events = session.events || [];
  const stages = {};
  for(const e of events){
    const stage = e.stage || 0;
    if(!stages[stage]) stages[stage] = { attacks: 0, bullets: 0, kills: 0, losses: 0 };
    if(e.type === 'enemy_attack_start') stages[stage].attacks++;
    if(e.type === 'enemy_bullet_fired') stages[stage].bullets++;
    if(e.type === 'enemy_killed') stages[stage].kills++;
    if(e.type === 'ship_lost') stages[stage].losses++;
  }
  return stages;
}

function bulletPressureMetrics(session, shipLost){
  const stages = stageMetrics(session);
  const overall = {
    attacks: 0,
    bullets: 0,
    bulletsPerAttack: 0,
    shipLosses: shipLost.length,
    bulletDeaths: 0,
    collisionDeaths: 0,
    lossesWithBulletsOnScreen: 0,
    lossesWithoutBulletsOnScreen: 0,
    lossesWithRecentEnemyBullets: 0,
    lossesWithoutRecentEnemyBullets: 0,
    avgRecentEnemyBulletsAtLoss: 0,
    avgAttackersOnScreenAtLoss: 0
  };
  const byStage = {};
  const avg = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(3) : 0;

  for(const [stage, metrics] of Object.entries(stages)){
    const key = String(stage);
    const losses = shipLost.filter(loss => String(loss.stage || 0) === key);
    const bulletDeaths = losses.filter(loss => loss.cause === 'enemy_bullet').length;
    const collisionDeaths = losses.filter(loss => loss.cause === 'enemy_collision').length;
    const lossesWithBulletsOnScreen = losses.filter(loss => (loss.snapshot?.enemyBullets || 0) > 0).length;
    const lossesWithoutBulletsOnScreen = losses.length - lossesWithBulletsOnScreen;
    const lossesWithRecentEnemyBullets = losses.filter(loss => (loss.recentEnemyBullets || 0) > 0).length;
    const lossesWithoutRecentEnemyBullets = losses.length - lossesWithRecentEnemyBullets;
    const stagePressure = {
      attacks: metrics.attacks || 0,
      bullets: metrics.bullets || 0,
      bulletsPerAttack: metrics.attacks ? +((metrics.bullets || 0) / metrics.attacks).toFixed(3) : 0,
      shipLosses: losses.length,
      bulletDeaths,
      collisionDeaths,
      lossesWithBulletsOnScreen,
      lossesWithoutBulletsOnScreen,
      lossesWithRecentEnemyBullets,
      lossesWithoutRecentEnemyBullets,
      avgRecentEnemyBulletsAtLoss: avg(losses.map(loss => loss.recentEnemyBullets || 0)),
      avgAttackersOnScreenAtLoss: avg(losses.map(loss => loss.snapshot?.attackers || 0))
    };
    byStage[key] = stagePressure;
    overall.attacks += stagePressure.attacks;
    overall.bullets += stagePressure.bullets;
    overall.bulletDeaths += bulletDeaths;
    overall.collisionDeaths += collisionDeaths;
    overall.lossesWithBulletsOnScreen += lossesWithBulletsOnScreen;
    overall.lossesWithoutBulletsOnScreen += lossesWithoutBulletsOnScreen;
    overall.lossesWithRecentEnemyBullets += lossesWithRecentEnemyBullets;
    overall.lossesWithoutRecentEnemyBullets += lossesWithoutRecentEnemyBullets;
  }

  overall.bulletsPerAttack = overall.attacks ? +(overall.bullets / overall.attacks).toFixed(3) : 0;
  overall.avgRecentEnemyBulletsAtLoss = avg(shipLost.map(loss => loss.recentEnemyBullets || 0));
  overall.avgAttackersOnScreenAtLoss = avg(shipLost.map(loss => loss.snapshot?.attackers || 0));
  return { overall, byStage };
}

function stageProfiles(events){
  return events
    .filter(e => e.type === 'stage_profile')
    .map(e => ({
      stage: e.stage || 0,
      challenge: !!e.challenge,
      band: e.band || 'classic',
      beeFamily: e.beeFamily || 'classic',
      butFamily: e.butFamily || 'classic',
      bossFamily: e.bossFamily || 'classic',
      challengeFamily: e.challengeFamily || 'classic'
    }));
}

function varietyMetrics(profiles){
  const bands = [...new Set(profiles.map(p => p.band).filter(Boolean))];
  const families = [...new Set(profiles.flatMap(p => [p.beeFamily, p.butFamily, p.bossFamily, p.challengeFamily]).filter(Boolean))];
  return {
    profiles,
    uniqueBands: bands,
    uniqueFamilies: families,
    nonClassicBands: bands.filter(b => b !== 'classic'),
    nonClassicFamilies: families.filter(f => f !== 'classic' && f !== 'rogue')
  };
}

function countEvents(events, type){
  return events.filter(e => e.type === type).length;
}

function dualShotMetrics(events){
  const dualShots = events.filter(e => e.type === 'player_shot' && e.dual);
  const spreads = dualShots.map(e => +e.spread).filter(v => Number.isFinite(v) && v > 0);
  if(!dualShots.length) return { count: 0, avgSpread: 0, minSpread: 0, maxSpread: 0 };
  return {
    count: dualShots.length,
    avgSpread: +(spreads.reduce((a,b)=>a+b,0) / Math.max(1, spreads.length)).toFixed(3),
    minSpread: spreads.length ? Math.min(...spreads) : 0,
    maxSpread: spreads.length ? Math.max(...spreads) : 0
  };
}

function rescuePipelineMetrics(session){
  const events = session.events || [];
  const captureStarts = events.filter(e => e.type === 'capture_started');
  const captured = events.filter(e => e.type === 'fighter_captured');
  const rescued = events.filter(e => e.type === 'fighter_rescued');
  const dualShots = events.filter(e => e.type === 'player_shot' && e.dual);
  const destroyed = events.filter(e => e.type === 'captured_fighter_destroyed');
  if(!rescued.length){
    return {
      captureStarts: captureStarts.length,
      fightersCaptured: captured.length,
      rescued: 0,
      naturalCaptureCycleSuccess: false,
      firstCaptureStartToCaptured: captured.length && captureStarts.length ? +(captured[0].t - captureStarts[0].t).toFixed(3) : null,
      firstCapturedToRescue: null,
      dualShotsAfterRescue: 0,
      firstRescueToDualShot: null,
      rescueToDualSuccess: false,
      destroyedInsteadOfRescued: destroyed.length > 0
    };
  }
  const rescue = rescued[0];
  const after = dualShots.filter(e => e.t >= rescue.t);
  const firstShot = after[0] || null;
  const snap = nearestSnapshot(session, rescue.t);
  return {
    captureStarts: captureStarts.length,
    fightersCaptured: captured.length,
    rescued: rescued.length,
    naturalCaptureCycleSuccess: captureStarts.length > 0 && captured.length > 0,
    firstCaptureStartToCaptured: captured.length && captureStarts.length ? +(captured[0].t - captureStarts[0].t).toFixed(3) : null,
    firstCapturedToRescue: captured.length ? +(rescue.t - captured[0].t).toFixed(3) : null,
    dualShotsAfterRescue: after.length,
    firstRescueToDualShot: firstShot ? +(firstShot.t - rescue.t).toFixed(3) : null,
    rescueToDualSuccess: after.length > 0 || !!snap?.player?.dual,
    destroyedInsteadOfRescued: false
  };
}

function captureBranchMetrics(session){
  const events = session.events || [];
  const rescuePodSpawns = events.filter(e => e.type === 'rescue_pod_spawned');
  const hostileTurns = events.filter(e => e.type === 'captured_fighter_turned_hostile');
  const rescues = events.filter(e => e.type === 'fighter_rescued');
  const destroyed = events.filter(e => e.type === 'captured_fighter_destroyed');
  return {
    rescuePodSpawns: rescuePodSpawns.length,
    hostileTurns: hostileTurns.length,
    fighterRescues: rescues.length,
    carriedFighterDestroyed: destroyed.length,
    divingRecoveryBranchTriggered: rescuePodSpawns.length > 0 || rescues.length > 0,
    formationHostileBranchTriggered: hostileTurns.length > 0
  };
}

function transitionMetrics(session){
  const events = session.events || [];
  const snapshots = session.snapshots || [];
  const challengeClear = events.find(e => e.type === 'challenge_clear');
  if(!challengeClear){
    return {
      challengeClearAt: null,
      nextStage: null,
      stageSpawnAt: null,
      firstNextStageSnapshotAt: null,
      firstVisibleNextStageAt: null,
      challengeToSpawn: null,
      challengeToVisible: null,
      preSpawnNextStageWindow: null,
      prematureNextStageSnapshot: false,
      stageVisibleAfterSpawn: false
    };
  }
  const nextStage = (challengeClear.stage || 0) + 1;
  const stageSpawn = events.find(e => e.type === 'stage_spawn' && e.stage === nextStage && !e.challenge && e.t >= challengeClear.t);
  const firstNextStageSnapshot = snapshots.find(s => s.t >= challengeClear.t && s.stage === nextStage) || null;
  const firstVisibleNextStage = snapshots.find(s =>
    s.t >= challengeClear.t &&
    s.stage === nextStage &&
    !s.challenge &&
    (((s.counts && s.counts.enemies) || 0) > 0 || ((s.counts && s.counts.attackers) || 0) > 0)
  ) || null;
  const prematureNextStageSnapshot = stageSpawn
    ? snapshots.find(s => s.t >= challengeClear.t && s.t < stageSpawn.t && s.stage === nextStage) || null
    : firstNextStageSnapshot;
  return {
    challengeClearAt: challengeClear.t,
    nextStage,
    stageSpawnAt: stageSpawn ? stageSpawn.t : null,
    firstNextStageSnapshotAt: firstNextStageSnapshot ? firstNextStageSnapshot.t : null,
    firstVisibleNextStageAt: firstVisibleNextStage ? firstVisibleNextStage.t : null,
    challengeToSpawn: stageSpawn ? +(stageSpawn.t - challengeClear.t).toFixed(3) : null,
    challengeToVisible: firstVisibleNextStage ? +(firstVisibleNextStage.t - challengeClear.t).toFixed(3) : null,
    preSpawnNextStageWindow: stageSpawn && prematureNextStageSnapshot ? +(stageSpawn.t - prematureNextStageSnapshot.t).toFixed(3) : null,
    prematureNextStageSnapshot: !!prematureNextStageSnapshot,
    stageVisibleAfterSpawn: !!firstVisibleNextStage
  };
}

function challengeRulesMetrics(session){
  const events = session.events || [];
  const stageSpawns = events.filter(e => e.type === 'stage_spawn');
  const challengeStages = stageSpawns.filter(e => !!e.challenge).map(e => e.stage);
  const regularStages = stageSpawns.filter(e => !e.challenge).map(e => e.stage);
  const bulletsDuringChallenge = events.filter(e => e.type === 'enemy_bullet_fired' && !!e.challenge);
  const attacksDuringChallenge = events.filter(e => e.type === 'enemy_attack_start' && !!e.challenge);
  const shipLossesDuringChallenge = events.filter(e => e.type === 'ship_lost' && !!e.challenge);
  const challengeClears = events.filter(e => e.type === 'challenge_clear').map(e => e.stage);
  return {
    challengeStages,
    regularStages,
    challengeClears,
    bulletsDuringChallenge: bulletsDuringChallenge.length,
    attacksDuringChallenge: attacksDuringChallenge.length,
    shipLossesDuringChallenge: shipLossesDuringChallenge.length,
    firstChallengeStage: challengeStages.length ? Math.min(...challengeStages) : null,
    cadenceLooksLikeFirstThenEveryFourthStage:
      challengeStages.length <= 1 ||
      challengeStages.slice(1).every((stage, idx) => stage - challengeStages[idx] === 4)
  };
}

function descentMetrics(events){
  const starts = events.filter(e => e.type === 'enemy_attack_start');
  const lowers = events.filter(e => e.type === 'enemy_lower_field');
  const pairs = [];
  for(const low of lowers){
    const start = [...starts].reverse().find(s => s.id === low.id && s.t <= low.t);
    if(start) pairs.push({
      id: low.id,
      stage: low.stage || start.stage || 0,
      mode: start.mode || 'dive',
      dt: +(low.t - start.t).toFixed(3)
    });
  }
  const avg = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(3) : 0;
  const all = pairs.map(p => p.dt);
  const byStage = {};
  for(const pair of pairs){
    const k = pair.stage || 0;
    if(!byStage[k]) byStage[k] = [];
    byStage[k].push(pair.dt);
  }
  return {
    samples: pairs.length,
    avgToLowerField: avg(all),
    byStage: Object.fromEntries(Object.entries(byStage).map(([k,v]) => [k, { samples: v.length, avgToLowerField: avg(v) }]))
  };
}

function causeSummary(losses){
  const out = {};
  for(const loss of losses){
    const key = loss.cause || 'unknown';
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function nextEventDelta(events, type, stage, t){
  const next = events.find(e => e.type === type && e.stage === stage && e.t > t);
  return next ? +(next.t - t).toFixed(3) : null;
}

function recentCount(events, type, stage, t, windowSec){
  return events.filter(e => e.type === type && e.stage === stage && e.t <= t && e.t >= t - windowSec).length;
}

function latestMatching(events, predicate){
  for(let i = events.length - 1; i >= 0; i--){
    if(predicate(events[i])) return events[i];
  }
  return null;
}

function lossDetails(session){
  const events = session.events || [];
  const losses = events.filter(e => e.type === 'ship_lost');
  const attacks = events.filter(e => e.type === 'enemy_attack_start');
  const bullets = events.filter(e => e.type === 'enemy_bullet_fired');
  const captures = events.filter(e => e.type === 'capture_started');
  const fighterCaptured = events.filter(e => e.type === 'fighter_captured');
  return losses.map((e, i) => {
    const snap = nearestSnapshot(session, e.t);
    const prev = i > 0 ? losses[i - 1] : null;
    const sourceAttack = latestMatching(attacks, a => a.stage === e.stage && a.id === (e.sourceId || e.enemyId) && a.t <= e.t);
    return {
      t: e.t,
      stage: e.stage,
      score: e.score,
      livesBefore: e.livesBefore,
      cause: e.cause || 'unknown',
      bulletKind: e.bulletKind || null,
      sourceType: e.sourceType || e.enemyType || null,
      sourceDive: e.sourceDive ?? e.enemyDive ?? null,
      sourceLane: e.bulletLane ?? e.enemyLane ?? null,
      playerLane: e.playerLane ?? null,
      enemyForm: e.enemyForm ?? null,
      stageClock: e.stageClock ?? null,
      gapFromPrev: prev ? +(e.t - prev.t).toFixed(3) : null,
      recentAttackStarts: attacks.filter(a => a.stage === e.stage && a.t <= e.t && a.t >= e.t - 2.2).length,
      recentEnemyBullets: bullets.filter(b => b.stage === e.stage && b.t <= e.t && b.t >= e.t - 2.2).length,
      recentCaptureStarts: recentCount(captures, 'capture_started', e.stage, e.t, 4),
      recentFighterCaptured: recentCount(fighterCaptured, 'fighter_captured', e.stage, e.t, 4),
      timeSinceCaptureStart: e.timeSinceCaptureStart ?? null,
      timeSinceFighterCaptured: e.timeSinceFighterCaptured ?? null,
      sourceAttackMode: sourceAttack?.mode || null,
      sourceOriginLane: sourceAttack?.originLane ?? sourceAttack?.lane ?? null,
      sourceTargetLane: sourceAttack?.targetLane ?? null,
      sourceColumn: sourceAttack?.column ?? null,
      snapshot: snap ? {
        t: snap.t,
        attackers: snap.counts?.attackers || 0,
        enemies: snap.counts?.enemies || 0,
        enemyBullets: snap.counts?.enemyBullets || 0,
        playerBullets: snap.counts?.playerBullets || 0
      } : null
    };
  });
}

function lifeLossDetails(session){
  const shipLosses = lossDetails(session).map(loss => Object.assign({ lossType: 'ship_lost' }, loss));
  const captureLosses = (session.events || [])
    .filter(e => e.type === 'fighter_captured')
    .map(e => ({
      t: e.t,
      stage: e.stage,
      score: e.score ?? null,
      livesBefore: Number.isFinite(e.livesAfter) ? e.livesAfter + 1 : null,
      cause: 'fighter_captured',
      lossType: 'fighter_captured',
      bulletKind: null,
      sourceType: e.enemyType || null,
      sourceDive: e.dive ?? null,
      sourceLane: e.lane ?? null,
      playerLane: e.playerLane ?? null,
      enemyForm: null,
      stageClock: e.stageClock ?? null,
      gapFromPrev: null,
      recentAttackStarts: 0,
      recentEnemyBullets: 0,
      recentCaptureStarts: 0,
      recentFighterCaptured: 0,
      timeSinceCaptureStart: e.timeSinceCaptureStart ?? null,
      timeSinceFighterCaptured: 0,
      sourceAttackMode: 'capture',
      sourceOriginLane: e.lane ?? null,
      sourceTargetLane: e.playerLane ?? null,
      sourceColumn: e.column ?? null,
      snapshot: nearestSnapshot(session, e.t) ? {
        t: nearestSnapshot(session, e.t).t,
        attackers: nearestSnapshot(session, e.t).counts?.attackers || 0,
        enemies: nearestSnapshot(session, e.t).counts?.enemies || 0,
        enemyBullets: nearestSnapshot(session, e.t).counts?.enemyBullets || 0,
        playerBullets: nearestSnapshot(session, e.t).counts?.playerBullets || 0
      } : null
    }));
  const merged = [...shipLosses, ...captureLosses].sort((a,b) => a.t - b.t);
  for(let i=0;i<merged.length;i++){
    merged[i].gapFromPrev = i > 0 ? +(merged[i].t - merged[i-1].t).toFixed(3) : null;
  }
  return merged;
}

function postHitPauseMetrics(session, losses){
  const events = session.events || [];
  const shipLosses = losses.filter(l => l.lossType === 'ship_lost');
  const toVals = arr => arr.filter(v => Number.isFinite(v));
  const avg = arr => arr.length ? +(arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(3) : null;
  const nextBullet = toVals(shipLosses.map(loss => nextEventDelta(events, 'enemy_bullet_fired', loss.stage, loss.t)));
  const nextAttack = toVals(shipLosses.map(loss => nextEventDelta(events, 'enemy_attack_start', loss.stage, loss.t)));
  return {
    samples: shipLosses.length,
    avgNextEnemyBullet: avg(nextBullet),
    minNextEnemyBullet: nextBullet.length ? Math.min(...nextBullet) : null,
    avgNextEnemyAttack: avg(nextAttack),
    minNextEnemyAttack: nextAttack.length ? Math.min(...nextAttack) : null
  };
}

function clusterSummary(losses){
  if(losses.length < 2) return { count: losses.length, avgGap: null, minGap: null };
  const gaps = losses.map(l => l.gapFromPrev).filter(v => Number.isFinite(v));
  if(!gaps.length) return { count: losses.length, avgGap: null, minGap: null };
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const minGap = Math.min(...gaps);
  return { count: losses.length, avgGap: +avgGap.toFixed(3), minGap: +minGap.toFixed(3) };
}

function hasAudio(video){
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', video], { encoding: 'utf8' });
  if(probe.status !== 0) return { ok: false, error: probe.stderr.trim() || 'ffprobe failed' };
  const streams = probe.stdout.trim().split(/\s+/).filter(Boolean);
  return { ok: true, streams, audio: streams.includes('audio') };
}

function findRunFiles(target){
  const stat = fs.statSync(target);
  if(stat.isFile() && target.endsWith('.json')){
    const session = JSON.parse(fs.readFileSync(target, 'utf8')).session;
    return { dir: path.dirname(target), sessionFile: target, session };
  }
  const files = fs.readdirSync(target);
  const summary = files.includes('summary.json') ? path.join(target, 'summary.json') : null;
  const sessionFile = files.find(f => /^neo-galaga-session-.*\.json$/.test(f));
  const videoFile = files.find(f => /^neo-galaga-video-.*\.webm$/.test(f));
  return {
    dir: target,
    summaryFile: summary,
    sessionFile: sessionFile ? path.join(target, sessionFile) : null,
    videoFile: videoFile ? path.join(target, videoFile) : null,
    session: sessionFile ? JSON.parse(fs.readFileSync(path.join(target, sessionFile), 'utf8')).session : null
  };
}

function analyze(target){
  const run = findRunFiles(path.resolve(target));
  if(!run.session) throw new Error('No session JSON found to analyze.');
  if(!run.videoFile){
    const found = fs.readdirSync(run.dir).find(f => /^neo-galaga-video-.*\.webm$/.test(f));
    if(found) run.videoFile = path.join(run.dir, found);
  }
  const session = run.session;
  const eventCounts = counts(session.events || []);
  const stageClears = (session.events || []).filter(e => e.type === 'stage_clear').map(e => ({ t: e.t, stage: e.stage, score: e.score }));
  const challengeClears = (session.events || []).filter(e => e.type === 'challenge_clear').map(e => ({
    t: e.t,
    stage: e.stage,
    hits: e.hits,
    total: e.total,
    upperBandY: e.upperBandY ?? null,
    upperBandTime: e.upperBandTime ?? null,
    avgUpperBandTime: e.avgUpperBandTime ?? null
  }));
  const shipLost = lossDetails(session);
  const shipLostByStage = byStage(shipLost);
  const stageLossClusters = Object.fromEntries(Object.entries(shipLostByStage).map(([stage, losses]) => [stage, clusterSummary(losses)]));
  const lossCauseCounts = causeSummary(shipLost);
  const stageLossLanePatterns = Object.fromEntries(Object.entries(shipLostByStage).map(([stage, losses]) => [stage, {
    playerLanes: [...new Set(losses.map(l => l.playerLane).filter(Number.isFinite))],
    sourceLanes: [...new Set(losses.map(l => l.sourceLane).filter(Number.isFinite))],
    sourceColumns: [...new Set(losses.map(l => l.sourceColumn).filter(Number.isFinite))]
  }]));
  const lifeLost = lifeLossDetails(session);
  const lifeLostByStage = byStage(lifeLost);
  const lifeLossClusters = Object.fromEntries(Object.entries(lifeLostByStage).map(([stage, losses]) => [stage, clusterSummary(losses)]));
  const lifeLossCauseCounts = causeSummary(lifeLost);
  const events = session.events || [];
  const captureMetrics = {
    captureStarts: countEvents(events, 'capture_started'),
    fightersCaptured: countEvents(events, 'fighter_captured'),
    fightersRescued: countEvents(events, 'fighter_rescued')
  };
  const carriedFighterDestroyed = events.filter(e => e.type === 'captured_fighter_destroyed');
  const specialAttackBonuses = events.filter(e => e.type === 'special_attack_bonus');
  const squadronEscortStarts = events.filter(e => e.type === 'enemy_attack_start' && e.mode === 'escort' && (+e.offset || 0) !== 0);
  const dualMetrics = dualShotMetrics(events);
  const rescuePipeline = rescuePipelineMetrics(session);
  const captureBranches = captureBranchMetrics(session);
  const transition = transitionMetrics(session);
  const challengeRules = challengeRulesMetrics(session);
  const descent = descentMetrics(events);
  const bulletPressure = bulletPressureMetrics(session, shipLost);
  const profiles = stageProfiles(events);
  const audio = run.videoFile ? hasAudio(run.videoFile) : { ok: false, audio: false, error: 'no video file found' };
  const analysis = {
    id: session.id,
    seed: session.seed || 0,
    duration: session.duration,
    eventCounts,
    stageClears,
    challengeClears,
    shipLost,
    lifeLost,
    stageMetrics: stageMetrics(session),
    bulletPressure,
    stageLossClusters,
    stageLossLanePatterns,
    lossCauseCounts,
    lifeLossClusters,
    lifeLossCauseCounts,
    postHitPauseMetrics: postHitPauseMetrics(session, lifeLost),
    captureMetrics,
    carriedFighterMetrics: {
      count: carriedFighterDestroyed.length,
      standbyCount: carriedFighterDestroyed.filter(e => !e.attacking).length,
      attackingCount: carriedFighterDestroyed.filter(e => !!e.attacking).length,
      totalPoints: carriedFighterDestroyed.reduce((sum, e) => sum + (+e.points || 0), 0)
    },
    specialAttackMetrics: {
      count: specialAttackBonuses.length,
      totalBonus: specialAttackBonuses.reduce((sum, e) => sum + (+e.bonus || 0), 0),
      maxEscorts: specialAttackBonuses.reduce((max, e) => Math.max(max, +e.escorts || 0), 0),
      avgEscortOffset: squadronEscortStarts.length ? squadronEscortStarts.reduce((sum, e) => sum + Math.abs(+e.offset || 0), 0) / squadronEscortStarts.length : 0,
      maxEscortOffset: squadronEscortStarts.reduce((max, e) => Math.max(max, Math.abs(+e.offset || 0)), 0)
    },
    dualMetrics,
    rescuePipeline,
    captureBranches,
    transition,
    challengeRules,
    descent,
    varietyMetrics: varietyMetrics(profiles),
    video: Object.assign({ file: run.videoFile || null }, audio)
  };
  if(run.summaryFile){
    const summary = JSON.parse(fs.readFileSync(run.summaryFile, 'utf8'));
    summary.analysis = analysis;
    writePortableSummary(run.summaryFile, summary);
  }
  return analysis;
}

if(require.main === module){
  const args = parseArgs(process.argv.slice(2));
  const target = args.run || args.session || args.dir;
  if(args.help || !target){
    console.log('Usage: node tools/harness/analyze-run.js --run /absolute/path/to/run-dir');
    process.exit(args.help ? 0 : 1);
  }
  console.log(JSON.stringify(analyze(target), null, 2));
}

module.exports = { analyze };

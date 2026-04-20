#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'professional-stage2-shot-window');
const SEED = 51101;
const PERSONAS = ['expert', 'professional'];
const FORMATION_BOSS_ID = 411140818;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(persona){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', 'stage2-opening',
    '--persona', persona,
    '--seed', String(SEED),
    '--out', OUT,
    '--auto-video', '0'
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    fail('professional stage2 shot-window harness run failed', {
      persona,
      seed: SEED,
      status: run.status,
      signal: run.signal,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(err){
    fail('could not parse professional stage2 shot-window harness output', {
      persona,
      seed: SEED,
      error: String(err),
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

function loadEvents(run){
  const sessionFile = (run.files || []).find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
  return sessionFile ? (JSON.parse(fs.readFileSync(sessionFile, 'utf8')).session?.events || []) : [];
}

function collectShotWindow(events){
  const firstBossAttack = events.find(event => event.type === 'enemy_attack_start' && event.enemyType === 'boss');
  const cutoff = firstBossAttack ? firstBossAttack.t : Infinity;
  const windowEvents = events.filter(event => event.t < cutoff);
  const targetDecisions = windowEvents.filter(event => event.type === 'harness_professional_decision' && event.targetId === FORMATION_BOSS_ID);
  const firstTargetDecision = targetDecisions[0] || null;
  const firstShotAtBoss = windowEvents.find(event => event.type === 'harness_professional_decision' && event.reason === 'shot' && event.targetId === FORMATION_BOSS_ID) || null;
  const bossDamages = windowEvents.filter(event => event.type === 'enemy_damaged' && event.id === FORMATION_BOSS_ID);
  const bossKill = windowEvents.find(event => event.type === 'enemy_killed' && event.id === FORMATION_BOSS_ID) || null;
  const shots = windowEvents.filter(event => event.type === 'player_shot');
  const decisionBreakdown = {};
  for(const event of targetDecisions){
    decisionBreakdown[event.reason] = (decisionBreakdown[event.reason] || 0) + 1;
  }
  const maxPlayerBullets = targetDecisions.reduce((max, event) => {
    const bullets = Number.isFinite(event.playerBullets) ? event.playerBullets : 0;
    return Math.max(max, bullets);
  }, 0);
  const minCooldown = targetDecisions.reduce((min, event) => {
    if(!Number.isFinite(event.cooldown)) return min;
    return Math.min(min, event.cooldown);
  }, Infinity);
  return {
    firstBossAttackAt: firstBossAttack ? firstBossAttack.t : null,
    preBossShotCount: shots.length,
    firstTargetDecisionAt: firstTargetDecision ? firstTargetDecision.t : null,
    firstShotAtBossAt: firstShotAtBoss ? firstShotAtBoss.t : null,
    targetDecisionCount: targetDecisions.length,
    decisionBreakdown,
    maxPlayerBulletsWhileTargetingBoss: maxPlayerBullets,
    minCooldownWhileTargetingBoss: Number.isFinite(minCooldown) ? minCooldown : null,
    bossDamageCount: bossDamages.length,
    bossDamageTimes: bossDamages.map(event => event.t),
    bossKilledBeforeWindow: !!bossKill,
    bossKillAt: bossKill ? bossKill.t : null,
    sampleTargetDecisions: targetDecisions.slice(0, 12).map(event => ({
      t: event.t,
      reason: event.reason,
      targetDx: event.targetDx ?? null,
      cooldown: event.cooldown ?? null,
      playerBullets: event.playerBullets ?? null,
      attackables: event.attackables ?? null
    }))
  };
}

const results = {};
for(const persona of PERSONAS){
  const run = runScenario(persona);
  results[persona] = {
    score: run.state?.score || 0,
    kills: run.analysis?.eventCounts?.enemy_killed || 0,
    shots: run.analysis?.eventCounts?.player_shot || 0,
    shotWindow: collectShotWindow(loadEvents(run)),
    files: run.files || []
  };
}

console.log(JSON.stringify({
  ok: true,
  seed: SEED,
  formationBossId: FORMATION_BOSS_ID,
  personas: results
}, null, 2));

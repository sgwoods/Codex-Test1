#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'professional-stage2-shot-cadence');
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
    fail('professional stage2 shot-cadence harness run failed', {
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
    fail('could not parse professional stage2 shot-cadence harness output', {
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

function shotIntervals(shots){
  return shots.slice(1).map((shot, index) => +(shot.t - shots[index].t).toFixed(3));
}

function summarizeCadence(events){
  const firstBossAttack = events.find(event => event.type === 'enemy_attack_start' && event.enemyType === 'boss');
  const cutoff = firstBossAttack ? firstBossAttack.t : Infinity;
  const preBossEvents = events.filter(event => event.t < cutoff);
  const shots = preBossEvents.filter(event => event.type === 'player_shot');
  const bossDamage = preBossEvents.find(event => event.type === 'enemy_damaged' && event.id === FORMATION_BOSS_ID) || null;
  const bossKill = preBossEvents.find(event => event.type === 'enemy_killed' && event.id === FORMATION_BOSS_ID) || null;
  const damageCutoff = bossDamage ? bossDamage.t : cutoff;
  const shotsBeforeBossDamage = shots.filter(event => event.t < damageCutoff);
  const intervals = shotIntervals(shots);
  const preDamageIntervals = shotIntervals(shotsBeforeBossDamage);
  return {
    firstBossAttackAt: firstBossAttack ? firstBossAttack.t : null,
    preBossShotCount: shots.length,
    firstBossDamageAt: bossDamage ? bossDamage.t : null,
    bossKilledBeforeWindow: !!bossKill,
    bossKillAt: bossKill ? bossKill.t : null,
    shotsBeforeBossDamage: shotsBeforeBossDamage.length,
    firstShotAt: shots[0] ? shots[0].t : null,
    lastPreBossShotAt: shots.length ? shots[shots.length - 1].t : null,
    avgShotInterval: intervals.length ? +(intervals.reduce((sum, value) => sum + value, 0) / intervals.length).toFixed(3) : null,
    avgPreDamageShotInterval: preDamageIntervals.length ? +(preDamageIntervals.reduce((sum, value) => sum + value, 0) / preDamageIntervals.length).toFixed(3) : null,
    maxShotInterval: intervals.length ? Math.max(...intervals) : null,
    maxPreDamageShotInterval: preDamageIntervals.length ? Math.max(...preDamageIntervals) : null,
    firstTwelveShotTimes: shots.slice(0, 12).map(event => event.t),
    firstTwelveIntervals: intervals.slice(0, 12),
    lastTwelveShotTimes: shots.slice(-12).map(event => event.t),
    lastTwelveIntervals: intervals.slice(-12)
  };
}

const results = {};
for(const persona of PERSONAS){
  const run = runScenario(persona);
  const events = loadEvents(run);
  results[persona] = {
    score: run.state?.score || 0,
    kills: run.analysis?.eventCounts?.enemy_killed || 0,
    shots: run.analysis?.eventCounts?.player_shot || 0,
    cadence: summarizeCadence(events),
    files: run.files || []
  };
}

console.log(JSON.stringify({
  ok: true,
  seed: SEED,
  formationBossId: FORMATION_BOSS_ID,
  personas: results
}, null, 2));

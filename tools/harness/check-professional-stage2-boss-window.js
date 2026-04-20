#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'professional-stage2-boss-window');
const SEED = 51101;
const PERSONAS = ['expert', 'professional'];

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
    fail('professional stage2 boss-window harness run failed', {
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
    fail('could not parse professional stage2 boss-window harness output', {
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

function summarize(run){
  const events = loadEvents(run);
  const bossAttackStarts = events
    .filter(event => event.type === 'enemy_attack_start' && event.enemyType === 'boss')
    .map(event => ({
      t: event.t,
      enemyId: event.id || null,
      x: event.x,
      targetX: event.targetX || null
    }));
  const bossDiveKills = events
    .filter(event => event.type === 'enemy_killed' && event.enemyType === 'boss' && event.dive === 1)
    .map(event => ({
      t: event.t,
      enemyId: event.id || null,
      points: event.points || 0,
      playerBullets: event.playerBullets || 0
    }));
  const earlyKills = events
    .filter(event => event.type === 'enemy_killed' && (event.t || 0) <= 0.12)
    .reduce((sum, event) => sum + (event.points || 0), 0);
  return {
    score: run.state?.score || 0,
    kills: run.analysis?.eventCounts?.enemy_killed || 0,
    playerShots: run.analysis?.eventCounts?.player_shot || 0,
    bossAttackStartCount: bossAttackStarts.length,
    bossAttackStarts,
    bossDiveKillCount: bossDiveKills.length,
    bossDiveKills,
    earlyKillPoints: earlyKills,
    files: run.files || []
  };
}

const results = {};
for(const persona of PERSONAS){
  results[persona] = summarize(runScenario(persona));
}

const expert = results.expert;
const professional = results.professional;
if(professional.bossAttackStartCount < expert.bossAttackStartCount){
  fail('professional persona regressed on stage-2 boss window: fewer boss attack starts appeared than expert on seed 51101', {
    seed: SEED,
    expert,
    professional
  });
}

console.log(JSON.stringify({
  ok: true,
  seed: SEED,
  personas: results
}, null, 2));

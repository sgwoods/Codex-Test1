#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const baseline = 'cf0e7a666067ede385865ba02e73d1454eb132d1';
function source(file, original){
 return original ? execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(path.join(root, file), 'utf8');
}
function between(text, start, end){
 const a = text.indexOf(start), b = text.indexOf(end, a);
 assert(a >= 0 && b > a, `Missing source boundaries: ${start}`);
 return text.slice(a, b);
}
function load(original, fraction){
 const boot = source('src/js/00-boot.js', original);
 const enemy = source('src/js/06-enemy-behavior.js', original);
 const game = source('src/js/10-gameplay.js', original);
 const rng = [], shots = [], attacks = [];
 const ctx = vm.createContext({
  Math, PLAY_H: 400, PLAY_W: 280, STAGE1_SCRIPT: [],
  isAuroraRuntimeState: () => true,
  rnd: (a, b = 0) => { rng.push(['rnd', a, b]); return b + (a - b) * fraction; },
  randUnit: () => { rng.push(['unit']); return 0; },
  cl: (v, a, b) => Math.max(a, Math.min(b, v)),
  shotCap: s => s.t.shotCap,
  fireEnemyBullet: (s, e, vx, vy, kind) => {
   const shot = { stage: s.stage, vx, vy, kind }; shots.push(shot); s.eb.push(shot);
  },
  familyMotion: () => ({ pulseX: 1, pulseY: 1, diveAccel: 1, weave: 1, steer: 1, jitter: 1, diveVy: 1 }),
  specialSquadronTuning: () => ({ escortTrackX: 1, escortTrackY: 1, escortLift: 10 }),
  canCapture: () => false, usesRuntimeGalagaReferenceAudio: () => false,
  logEnemyAttackStart: (s, e, mode) => attacks.push({ stage: s.stage, mode }),
  logEvent: () => {}, assignEscorts: () => {},
  sfx: { attackCharge(){} }, playLane: () => 4
 });
 vm.runInContext(between(boot, original ? 'const CHALLENGE_STAGE_TUNE=' : 'const combatEffectiveStage=', 'const stageFlightTune=')
  + '\nconst stageFlightTune=s=>stageRuleSet(s).flight;\n'
  + between(enemy, 'function scriptedDiveVy(', 'function pickScriptEnemy(')
  + between(enemy, 'function runStage1Script(', 'function challengePathSpeed(')
  + enemy.slice(enemy.indexOf('function updateEnemy('))
  + '\nfunction formationFixture(S){const p=S.p,T=S.t;\n'
  + between(game, ' const cleanup=!S.challenge&&S.stage===1&&alive.length<=6;', '\n updatePlayerBullets(').replace('alive.length', 'S.e.length')
  + '\n}\nthis.tune=stageTune;', ctx);
 return { ctx, rng, shots, attacks };
}
function fixture(stage, challenge){
 const e = { id: 1, hp: 1, form: 1, t: 'but', c: 1, r: 1, x: 90, y: 150,
  tx: 90, ty: 150, tm: 0, ph: 0, vx: 0, vy: 94, shot: 1, cool: 0, dive: 0 };
 return { stage, challenge, e: [e], eb: [], p: { x: 140, y: 360 }, att: 0,
  stageClock: 20, recoverT: 0, attackGapT: 0, fireCD: 0, liveCount: 20,
  scriptT: 0, scriptI: 0, scriptShotI: 0, scriptShotT: 0 };
}
function run(original, stage, challenge, fraction){
 const h = load(original, fraction), { ctx } = h;
 const S = fixture(stage, challenge);
 S.t = ctx.tune(stage, challenge);
 ctx.formationFixture(S);
 S.eb = [];
 const e = S.e[0];
 e.dive = 1;
 ctx.updateEnemy(S, e, 1 / 60, 0, S.t, S.p);
 S.eb = [];
 const leader = { id: 2, hp: 1, dive: 1, x: 110, y: 150 };
 S.e.push(leader); e.dive = 5; e.lead = 2; e.off = 0; e.shot = 1;
 ctx.updateEnemy(S, e, 1 / 60, 0, S.t, S.p);
 S.e.pop(); S.eb = []; S.att = 0; e.dive = 0; e.cool = 0;
 ctx.updateEnemy(S, e, 1 / 60, 0, S.t, S.p);
 const cooldown = e.cool;
 // Script mode is a Stage 1 path; late-stage fixtures additionally verify its velocity callsite.
 S.eb = []; e.dive = 0; S.scriptMode = 1;
 if(!challenge)ctx.runStage1Script(S, 1 / 60, S.p, S.t);
 return JSON.parse(JSON.stringify({ tune: S.t, cooldown, shots: h.shots, attacks: h.attacks, rng: h.rng,
  stage: S.stage, fireCD: S.fireCD, scriptShotT: S.scriptShotT }));
}

let earlyComparisons = 0;
for(let stage = 1; stage <= 30; stage++){
 for(const fraction of [0, .5, 1]){
  for(const challenge of [false, true]){
   assert.deepEqual(run(false, stage, challenge, fraction), run(true, stage, challenge, fraction),
    `Stage ${stage}, challenge ${challenge}, RNG ${fraction}`);
   earlyComparisons++;
  }
 }
}
const late = [];
for(const stage of [32, 62, 126, 1000]){
 for(const fraction of [0, .5, 1]){
  const r = run(false, stage, false, fraction);
  assert.equal(r.stage, stage, 'Actual stage preserved');
  assert.equal(r.tune.diveRate, .9 + 30 * .035);
  assert(Number.isFinite(r.cooldown) && r.cooldown >= 1.9 && r.cooldown <= 4.2);
  assert.deepEqual(r.shots.map(s => s.kind), ['formation', 'dive', 'escort', 'script']);
  for(const shot of r.shots){
   assert.equal(shot.stage, stage, 'Telemetry stage preserved');
   assert.equal(shot.vy, shot.kind === 'formation' ? 274 : 301);
   assert(Number.isFinite(shot.vy) && shot.vy > 0);
  }
  assert.equal(r.tune.shotCap, 3); assert.equal(r.tune.attackCap, 4);
  assert.equal(r.attacks.length, 1, 'Normal launch callsite exercised');
  const before = run(true, stage, false, fraction);
  late.push({ stage, fraction,
   before: { cooldown: before.cooldown, diveRate: before.tune.diveRate, velocities: before.shots.map(s => s.vy) },
   after: { cooldown: r.cooldown, diveRate: r.tune.diveRate, velocities: r.shots.map(s => s.vy) } });
 }
}
for(const stage of [3, 31, 35, 39, 63, 127, 1000]){
 const candidate = run(false, stage, true, .5);
 assert.deepEqual(candidate, run(true, stage, true, .5));
 assert.equal(candidate.shots.length, 0);
 assert.equal(candidate.attacks.length, 0);
 assert.equal(candidate.tune.shotCap, 0); assert.equal(candidate.tune.attackCap, 0);
}
console.log(JSON.stringify({ ok: true, baseline, earlyComparisons, late,
 challengeControls: [3, 31, 35, 39, 63, 127, 1000],
 limitation: 'VM callsite fixtures, not complete gameplay, perceptual fairness, audio or cadence acceptance.' }, null, 2));

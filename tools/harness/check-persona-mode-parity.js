#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const at = process.argv.indexOf('--root');
if (at >= 0) assert(process.argv[at + 1], '--root needs a checkout path');
const ROOT = at < 0 ? path.resolve(__dirname, '../..') : path.resolve(process.argv[at + 1]);
const personas = ['novice', 'advanced', 'expert', 'professional'];
const seed = 51301, dt = 1 / 60;
const hashes = {};
const plain = value => JSON.parse(JSON.stringify(value));
function read(file) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  hashes[file] = crypto.createHash('sha256').update(text).digest('hex');
  return text;
}
function section(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert(a >= 0 && b > a, `Cannot load source section ${start}`);
  return source.slice(a, b);
}
const boot = read('src/js/00-boot.js');
const flow = read('src/js/05-player-flow.js');
const combat = read('src/js/05-player-combat.js');
const capture = read('src/js/07-capture-rescue.js');
const entity = read('src/js/14-entity-model.js');
const shell = read('src/js/01-runtime-shell.js');
const cases = [];
function check(name, fn) {
  try { fn(); cases.push({ name, pass: true }); }
  catch (error) { cases.push({ name, pass: false, error: String(error.message).slice(0, 1200) }); }
}

function aurora(mode, persona, variance = 1, held = {}, scenario = 'tracking', stage = 2) {
  const state = {
    stage, challenge: false, score: 0, lives: 2, simT: 12, captureCountStage: 0,
    attract: false, scriptMode: false,
    harnessPersona: mode === 'human' ? '' : persona,
    watchMode: mode === 'watch', watchPersona: mode === 'watch' ? persona : '',
    playerTwo: { enabled: mode === 'p2' || mode === 'human',
      activeTurn: mode === 'p2' ? 'p2' : 'p1', personaKey: persona, variance },
    p: { x: 140, y: 335, vx: 0, s: 440, accel: 12, decel: 18,
      manualTapSpeed: 248, manualTapWindow: .072, manualReverseWindow: .11,
      cd: 0, spawn: 0, captured: false, returning: false, dual: false,
      inputResetHoldT: 0, hNoShotT: 0, hDebugT: 0 },
    e: [{ id: 1, t: 'bee', hp: 100, x: scenario === 'aligned' ? 140 : 210,
      y: 150, form: 0, dive: 0, carry: 0, c: 4, r: 0 }],
    eb: scenario === 'threat' ? [{ x: 142, y: 270, vx: 0, vy: 160 }] : [],
    pb: [], stats: { shots: 0, hits: 0 }
  };
  const ctx = vm.createContext({
    window: {}, keys: { ...held }, keyState: {}, performance: { now: () => state.simT * 1000 },
    S: state, PLAY_W: 280, PLAY_H: 360, VIS: { beamLen: 300 },
    isAuroraRuntimeState: s => s === state, currentAuroraRuntimeState: () => state,
    playerHitbox: () => ({ w: 7, h: 6 }), enemyHitbox: () => ({ w: 6, h: 5 }),
    enemyCollisionHitbox: () => ({ w: 4, h: 4 }),
    carriedFighterTarget: () => null, enemyRef: e => ({ id: e.id }),
    playLane: x => Math.floor(x / 28), logEvent() {}, stopReferenceCueSet() {},
    holdReferenceGameplayCadence() {}, bossDamageFx() {}, sfx: { shot() {}, hit() {}, bossHit() {} },
    writePref() {}, removePref() {}, SEED_PREF_KEY: 'fixture-seed',
    setTimeout, clearTimeout
  });
  if (scenario === 'beam') state.e = [{ id: 1, t: 'boss', hp: 100, x: 140,
    y: 138, form: 1, dive: 2, carry: 0, beam: 1, beamT: 2, c: 4, r: 0 }];
  if (scenario.startsWith('rescue-')) state.e = [{ id: 1, t: 'boss', hp: 100,
    x: 140, y: 170, form: 1, dive: scenario === 'rescue-attack' ? 1 : scenario === 'rescue-retreat' ? 3 : 0,
    carry: 1, beam: 0, c: 4, r: 0 }];
  // Load whole controller/combat modules; only boot RNG and key mapping need shell isolation.
  vm.runInContext('let RNG_SEED=0,RNG_STATE=0;\n' +
    section(boot, 'function randUnit(){', 'let DPR=') +
    section(shell, 'function movementLeftCodes(){', 'function controlMoveHelpHtml(){') +
    section(entity, 'function enemyHasCaptureState(', 'function enemyChallengeUpperBandY(') +
    section(capture, 'function hasCarriedFighter(', 'function capturePlayer(') +
    flow + '\n' + combat, ctx, { filename: 'actual-aurora-controller-vm.js' });
  ctx.setSeed(seed);
  const config = plain(ctx.harnessPersonaCfg(state));
  const trace = [];
  for (let tick = 0; tick < 36; tick++) {
    state.simT = 12 + tick * dt;
    state.p.cd = Math.max(0, state.p.cd - dt);
    ctx.updatePlayerControl(state, dt, state.p);
    trace.push(plain({ x: state.p.x, vx: state.p.vx, cd: state.p.cd,
      shots: state.stats.shots, bullets: state.pb, rng: vm.runInContext('RNG_STATE>>>0', ctx) }));
    ctx.updatePlayerBullets(state, dt);
  }
  return { config, trace };
}

for (const persona of personas) {
  for (const stage of [4, 8, 31]) {
    check(`Aurora ${persona}: later-stage ${stage} policy/action parity`, () => {
      for (const scenario of ['tracking', 'aligned', 'threat', 'beam', 'rescue-formation', 'rescue-retreat', 'rescue-attack']) {
        const expected = aurora('harness', persona, 1, {}, scenario, stage);
        assert.deepEqual(aurora('watch', persona, 1, {}, scenario, stage), expected);
        assert.deepEqual(aurora('p2', persona, 1, {}, scenario, stage), expected);
      }
    });
  }
  check(`Aurora ${persona}: harness/Watch config and actions`, () => {
    for (const scenario of ['tracking', 'aligned', 'threat']) {
      const expected = aurora('harness', persona, 1, {}, scenario);
      assert.deepEqual(aurora('watch', persona, 1, {}, scenario), expected);
    }
  });
  for (const variance of [.82, 1, 1.18]) {
    check(`Aurora ${persona}: P2 config unchanged at variance ${variance}`, () => {
      assert.deepEqual(aurora('p2', persona, variance).config, aurora('harness', persona).config);
    });
    check(`Aurora ${persona}: P2 actions equal at variance ${variance}`, () => {
      for (const scenario of ['tracking', 'aligned', 'threat']) {
        assert.deepEqual(aurora('p2', persona, variance, {}, scenario).trace,
          aurora('harness', persona, 1, {}, scenario).trace);
      }
    });
  }
  for (const held of [{ ArrowLeft: true }, { ArrowRight: true, Space: true }]) {
    check(`Aurora ${persona}: owned P2 ignores ${Object.keys(held).join('+')}`, () => {
      assert.deepEqual(aurora('p2', persona, 1, held).trace, aurora('p2', persona).trace);
    });
    check(`Aurora ${persona}: Watch ignores ${Object.keys(held).join('+')}`, () => {
      assert.deepEqual(aurora('watch', persona, 1, held).trace, aurora('watch', persona).trace);
    });
  }
  check(`Aurora ${persona}: interactive harness still permits manual override`, () => {
    const quiet = aurora('harness', persona).trace;
    const manual = aurora('harness', persona, 1, { ArrowLeft: true, Space: true }).trace;
    assert(manual.at(-1).x < quiet.at(-1).x);
    assert(manual.at(-1).shots > 0);
  });
  check(`Aurora ${persona}: P1 remains human-controlled`, () => {
    const quiet = aurora('human', persona).trace;
    const left = aurora('human', persona, 1, { ArrowLeft: true }).trace;
    const right = aurora('human', persona, 1, { ArrowRight: true, Space: true }).trace;
    assert(left.at(-1).x < quiet.at(-1).x);
    assert(right.at(-1).x > quiet.at(-1).x);
    assert(right.at(-1).shots > 0);
    assert.equal(quiet.at(-1).shots, 0);
  });
}

check('Aurora Professional: opening, normal and challenge policy transitions', () => {
  const state = { stage: 3, challenge: true, harnessPersona: 'professional' };
  const ctx = vm.createContext({
    window: {}, S: state, isAuroraRuntimeState: s => s === state,
    currentAuroraRuntimeState: () => state
  });
  vm.runInContext(flow, ctx);
  const opening = plain(ctx.harnessPersonaCfg(state));
  state.stage = 4; state.challenge = false;
  const later = plain(ctx.harnessPersonaCfg(state));
  state.harnessPersona = 'expert';
  const expert = plain(ctx.harnessPersonaCfg(state));
  assert.deepEqual(later, { ...expert, name: 'professional', fireChance: 1 });
  state.harnessPersona = 'professional'; state.stage = 7; state.challenge = true;
  assert.deepEqual(plain(ctx.harnessPersonaCfg(state)), opening);
  state.stage = 8; state.challenge = false;
  assert.deepEqual(plain(ctx.harnessPersonaCfg(state)), later);
  state.stage = 2;
  assert.deepEqual(plain(ctx.harnessPersonaCfg(state)), opening);
  state.stage = 1;
  assert.deepEqual(plain(ctx.harnessPersonaCfg(state)), opening);
});

// Guardians owns a different controller. P2 is explicitly unsupported by its pack.
const helper = 'tools/harness/guardians-long-surface-lib.js';
read(helper);
for (const file of ['src/js/13-galaxy-guardians-game-pack.js',
  'src/js/13-galaxy-guardians-gameplay-adapter.js', 'src/js/13-galaxy-guardians-runtime.js']) read(file);
const { loadGuardiansVm } = require(path.join(ROOT, helper));
function guardians(mode, persona, held = {}) {
  const ctx = loadGuardiansVm();
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 2, ships: 3, seed, maxPlayableStage: 9 });
  state.t = 12;
  ctx.S = { harnessPersona: mode === 'human' ? '' : persona,
    watchMode: mode === 'watch', watchPersona: mode === 'watch' ? persona : '', stage: 2 };
  ctx.keys = { ...held };
  if (mode === 'harness') ctx.__platinumHarnessPersona = persona;
  // Stub shell presentation/audio/telemetry only, not the controller or runtime step.
  Object.assign(ctx, { advanceSharedStarfield() {} });
  ctx.__parityState = state;
  vm.runInContext(`
    GALAXY_GUARDIANS_ACTIVE_DEV_STATE=__parityState;
    syncGalaxyGuardiansShellState=function(){};
    mirrorGalaxyGuardiansRuntimeEvents=function(){};
    playGalaxyGuardiansRuntimeCues=function(){};
  `, ctx);
  const config = plain(vm.runInContext('guardiansPersonaEffectiveCfg(__parityState, guardiansHarnessPersonaCfgForKey(S.harnessPersona))', ctx));
  const decisions = [];
  const actualStep = ctx.stepGalaxyGuardiansRuntime;
  ctx.stepGalaxyGuardiansRuntime = (runtime, seconds, input) => {
    decisions.push(plain(input));
    return actualStep(runtime, seconds, input);
  };
  const trace = [];
  for (let tick = 0; tick < 36; tick++) {
    ctx.updateGalaxyGuardiansDevPreview(dt);
    trace.push(plain({ x: state.player.x, cooldown: state.player.cooldown,
      shot: state.player.shot, shots: state.stats.shots, personaMemory: state.personaMemory }));
  }
  return { config, trace, decisions };
}
check('Guardians: P2 unsupported, not silently simulated as an implemented mode', () => {
  assert.equal(loadGuardiansVm().GALAXY_GUARDIANS_PACK.capabilities.supportsPersonaRival, 0);
});
for (const persona of personas) {
  check(`Guardians ${persona}: harness/Watch config, decisions and runtime actions`, () => {
    assert.deepEqual(guardians('watch', persona), guardians('harness', persona));
  });
  check(`Guardians ${persona}: Watch ignores human keys`, () => {
    assert.deepEqual(guardians('watch', persona, { ArrowLeft: true, Space: true }).trace,
      guardians('watch', persona).trace);
  });
  check(`Guardians ${persona}: human remains controllable`, () => {
    const left = guardians('human', persona, { ArrowLeft: true }).trace;
    const right = guardians('human', persona, { ArrowRight: true, Space: true }).trace;
    assert(left.at(-1).x < right.at(-1).x);
    assert(right.at(-1).shots > 0);
  });
}

check('Source identities remained stable during the VM matrix', () => {
  for (const [file, expected] of Object.entries(hashes)) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex'), expected,
      `Source changed during test: ${file}`);
  }
});
const report = {
  ok: cases.every(row => row.pass),
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
  sourceStatus: execFileSync('git', ['status', '--short', '--', 'src/js', helper],
    { cwd: ROOT, encoding: 'utf8' }).trim(),
  methodHash: crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
  seed, step: dt, sourceHashes: hashes,
  passed: cases.filter(row => row.pass).length, failed: cases.filter(row => !row.pass).length,
  cases,
  limitations: ['Actual source controller and input-router VM tests, not browser launch/DOM coverage or skill calibration.',
    'Aurora fixtures isolate controller time/cooldown and bullet updates; no full enemy/stage progression.',
    'Guardians uses actual runtime stepping with presentation/audio/telemetry stubbed; its pack declares P2 unsupported.',
    'No assertion that automated movement follows human acceleration physics or proves human feasibility.']
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;

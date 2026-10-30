const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const boot = fs.readFileSync(path.join(__dirname, '../../src/js/00-boot.js'), 'utf8');
const start = boot.indexOf('function useDeterministicHarnessClock(){');
const end = boot.indexOf('const playLane=', start);
assert(start >= 0 && end > start);
function fixture() {
  const ctx = vm.createContext({ window: {}, S: { simT: 0 }, wall: 100000 });
  vm.runInContext('let harnessClockControlled=0,harnessFrameAccum=0;' +
    'const performance={now:()=>wall};' + boot.slice(start, end), ctx);
  return ctx;
}

test('controlled motion time does not require a global autopilot', () => {
  const ctx = fixture();
  ctx.setHarnessClockControlled(true);
  assert.equal(ctx.advanceGameplayClock(.25), .25);
  ctx.wall = 900000;
  assert.equal(ctx.advanceGameplayClock(.25), .5);
  assert.deepEqual(Object.keys(ctx.window), []);
  assert.equal(ctx.useDeterministicHarnessClock(), false);
});

test('ordinary play retains wall time and disabling control restores it', () => {
  const ctx = fixture();
  assert.equal(ctx.advanceGameplayClock(.25), 100);
  ctx.setHarnessClockControlled(true);
  assert.equal(ctx.advanceGameplayClock(.25), .5);
  ctx.setHarnessClockControlled(false);
  ctx.wall = 200000;
  assert.equal(ctx.advanceGameplayClock(.25), 200);
  assert.equal(ctx.S.simT, .75);
});

test('runtime Watch and P2 persona labels alone do not change normal timing', () => {
  for (const mode of ['watch', 'p1', 'p2']) {
    const ctx = fixture();
    ctx.S.harnessPersona = 'expert';
    ctx.S.watchMode = mode === 'watch';
    ctx.S.playerTwo = { enabled: mode !== 'watch', activeTurn: mode };
    assert.equal(ctx.advanceGameplayClock(.25), 100);
    ctx.wall = 200000;
    assert.equal(ctx.advanceGameplayClock(.25), 200);
  }
});

test('legacy global harness personas retain deterministic motion', () => {
  for (const key of ['__platinumHarnessPersona', '__auroraHarnessPersona']) {
    const ctx = fixture();
    ctx.window[key] = 'expert';
    assert.equal(ctx.advanceGameplayClock(.25), .25);
    ctx.wall = 700000;
    assert.equal(ctx.advanceGameplayClock(.25), .5);
    ctx.setHarnessClockControlled(true);
    assert.equal(ctx.advanceGameplayClock(.25), .75);
  }
});

test('controlled clocks use each runtime state and tolerate uninitialized simT', () => {
  const ctx = fixture();
  ctx.setHarnessClockControlled(true);
  const p1 = { simT: 10 }, p2 = { simT: 2 }, reset = {};
  assert.equal(ctx.advanceGameplayClock(.5, p1), 10.5);
  assert.equal(ctx.advanceGameplayClock(.5, p2), 2.5);
  assert.equal(ctx.advanceGameplayClock(.5, p1), 11);
  assert.equal(ctx.advanceGameplayClock(.5, reset), .5);
});

test('fresh and active harness starts honor initialSimT after gameplay initialization', () => {
  const harness = fs.readFileSync(path.join(__dirname, '../../src/js/90-harness.js'), 'utf8');
  const a = harness.indexOf(' start(cfg={}){'), b = harness.indexOf(' checkAuroraRuntimeStateIsolation(){', a);
  assert(a >= 0 && b > a);
  for (const started of [false, true]) {
    const ctx = fixture();
    Object.assign(ctx, { started, start: () => { ctx.S.simT = 0; } });
    vm.runInContext('const h={' + harness.slice(a, b) + '};', ctx);
    vm.runInContext('h.start({controlledClock:true,initialSimT:12.75})', ctx);
    assert.equal(ctx.S.simT, 12.75);
    assert.equal(ctx.advanceGameplayClock(.25), 13);
    vm.runInContext('h.start({controlledClock:false,initialSimT:99})', ctx);
    assert.equal(ctx.isHarnessClockControlled(), false);
    assert.notEqual(ctx.S.simT, 99);
  }
});

test('regular transition correction uses the current step, preserving default behavior', () => {
  const gameplay = fs.readFileSync(path.join(__dirname, '../../src/js/10-gameplay.js'), 'utf8');
  const a = gameplay.indexOf(' if(S.nextStageT>0){');
  const b = gameplay.indexOf(" if(typeof advanceSharedStarfield===", a);
  assert(a >= 0 && b > a);
  for (const dt of [1 / 60, 1 / 120, 1 / 30]) {
    for (const controlled of [false, true]) for (const challenge of [false, true]) {
      const S = { simT: 10 + dt, nextStageT: dt / 2, pendingStage: 4, stage: 3, challenge };
      const ctx = vm.createContext({ S, dt, logEvent() {}, isHarnessClockControlled: () => controlled,
        spawnStage: state => { state.spawnedAt = state.simT; } });
      vm.runInContext('(function(){' + gameplay.slice(a, b) + '})()', ctx);
      assert.equal(S.spawnedAt, controlled && !challenge ? 10 : 10 + dt);
      assert.equal(S.stage, 4); assert.equal(S.nextStageT, 0);
    }
  }
});

test('P2 board round-trip preserves its documented millisecond clock quantization', () => {
  const flow = fs.readFileSync(path.join(__dirname, '../../src/js/05-player-flow.js'), 'utf8');
  const a = flow.indexOf('function playerTwoClonePojo('), b = flow.indexOf('function playerTwoLaneDefaults(', a);
  assert(a >= 0 && b > a);
  const ctx = fixture();
  Object.assign(ctx.S, { stage: 1, p: {}, e: [], pb: [], eb: [], fx: [] });
  Object.assign(ctx, { stageBandProfile: () => ({}), stageTune: () => ({}),
    currentGamePackStagePresentation: () => ({}), resetHarnessHazardState() {} });
  vm.runInContext(flow.slice(a, b), ctx);
  ctx.setHarnessClockControlled(true);
  const boards = [];
  for (const t of [10.123456, 2.987654]) {
    ctx.S.simT = t; boards.push(ctx.playerTwoBoardSnapshot());
  }
  for (let i = 0; i < boards.length; i++) {
    ctx.S.simT = 99; ctx.wall = 800000;
    assert(ctx.restorePlayerTwoBoardSnapshot(boards[i]));
    const expected = [10.123, 2.988][i];
    assert.equal(ctx.S.simT, expected);
    assert.equal(ctx.advanceGameplayClock(.25), expected + .25);
  }
});

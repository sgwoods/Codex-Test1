const assert = require('node:assert/strict');
const { loadGuardiansVm } = require('./guardians-long-surface-lib');
const ctx = loadGuardiansVm();
function fixture() {
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 72001, maxPlayableStage: 99 });
  Object.assign(state.player, { x: 100, y: 335, visible: true, cooldown: 0, shot: null });
  Object.assign(state, { t: 10, resetT: 0, enemyShots: [], aliens: [{ id: 1, hp: 1, x: 150, y: 90, mode: 'formation', role: 'scout' }] });
  return state;
}
const cases = [];
function test(name, fn) { fn(); cases.push({ name, pass: true }); }
const decide = state => ctx.galaxyGuardiansHarnessPersonaInput(state, 'expert');
test('Pursuit works without hazards', () => assert.equal(decide(fixture()).right, true));
test('A distant shot does not stop pursuit', () => {
  const state = fixture();
  state.enemyShots = [{ id: 2, x: 250, y: 200, active: 1 }];
  assert.equal(decide(state).right, true);
});
test('Aligned safe target does not force movement', () => {
  const state = fixture(); state.player.x = 150;
  const input = decide(state);
  assert.equal(input.left || input.right, false);
});
test('Does not pursue through an immediate shot', () => {
  const state = fixture(); state.enemyShots = [{ id: 2, x: 120, y: 330, active: 1 }];
  assert.equal(decide(state).right, false);
});
test('Escapes a threatened left edge towards the playfield', () => {
  const state = fixture(); state.player.x = 12;
  state.enemyShots = [{ id: 2, x: 12, y: 330, active: 1 }];
  assert.equal(decide(state).right, true);
});
test('Escapes a threatened right edge towards the playfield', () => {
  const state = fixture(); state.player.x = 268;
  state.enemyShots = [{ id: 2, x: 268, y: 330, active: 1 }];
  assert.equal(decide(state).left, true);
});
test('Mode changes and wrap teleports discard stale velocity', () => {
  const state = fixture();
  state.aliens[0].mode = 'diving'; state.aliens[0].y = 200;
  decide(state);
  state.t += 1 / 60; state.aliens[0].y += 2;
  decide(state);
  assert.ok(state.personaMemory.safeLaneObservations['alien:1'].vy > 100);
  state.t += 1 / 60; state.aliens[0].mode = 'wrapping'; state.aliens[0].y += 2;
  decide(state);
  assert.equal(state.personaMemory.safeLaneObservations['alien:1'].vy, 0);
  state.t += 1 / 60; state.aliens[0].y = 12;
  decide(state);
  assert.equal(state.personaMemory.safeLaneObservations['alien:1'].vy, 0);
});
test('Planning neither advances game state nor consumes future RNG', () => {
  const state = fixture(); state.enemyShots = [{ id: 2, x: 250, y: 200, active: 1 }];
  const before = JSON.stringify({ t: state.t, player: state.player, aliens: state.aliens, shots: state.enemyShots, score: state.score, lives: state.lives });
  state.rng = () => { throw new Error('Planner consumed future RNG'); };
  decide(state);
  assert.equal(JSON.stringify({ t: state.t, player: state.player, aliens: state.aliens, shots: state.enemyShots, score: state.score, lives: state.lives }), before);
});
test('Motion estimates use observations and remain stable at repeated timestamps', () => {
  const state = fixture(); state.enemyShots = [{ id: 2, x: 250, y: 200, active: 1 }];
  decide(state);
  state.t += 1 / 60; state.enemyShots[0].y += 1.8;
  decide(state);
  const velocity = state.personaMemory.safeLaneObservations['shot:2'].vy;
  assert.ok(Math.abs(velocity - 108) < .001);
  decide(state);
  assert.equal(state.personaMemory.safeLaneObservations['shot:2'].vy, velocity);
});
test('Other personas do not enter the Expert planner', () => {
  for (const persona of ['novice', 'advanced', 'professional']) {
    const state = fixture(); ctx.galaxyGuardiansHarnessPersonaInput(state, persona);
    assert.equal(state.personaMemory.safeLaneObservations, undefined);
  }
});
test('Expert retains predictive pursuit through later stage bands', () => {
  for (const stage of [3, 5, 9, 31]) {
    const state = fixture(); state.stage = stage;
    state.enemyShots = [{ id: 2, x: 250, y: 200, active: 1 }];
    assert.equal(decide(state).right, true);
    state.t += 1 / 60; state.enemyShots[0].y += 1.8;
    decide(state);
    assert.ok(Math.abs(state.personaMemory.safeLaneObservations['shot:2'].vy - 108) < .001);
  }
});
console.log(JSON.stringify({ ok: true, passed: cases.length, cases }, null, 2));

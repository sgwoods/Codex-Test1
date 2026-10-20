#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/js/05-player-flow.js'), 'utf8');
const start = source.indexOf('function harnessLowerFieldThreat(');
const end = source.indexOf('function runHarnessPlayer(', start);
assert(start >= 0 && end > start, 'Controller entry points must load');
const state = { stage: 4, challenge: false, e: [], eb: [] };
const player = { x: 109, y: 335 };
const ctx = vm.createContext({
  isAuroraRuntimeState: s => s === state,
  currentAuroraRuntimeState: () => state,
  playerHitbox: () => ({ w: 7, h: 6 }),
  enemyCollisionHitbox: () => ({ w: 4, h: 4 }),
  playLane: x => Math.floor(x / 28),
  harnessSelectTarget: () => ({ x: 180 }), PLAY_W: 280
});
vm.runInContext(source.slice(start, end), ctx);
const cfg = {
  name: 'professional', cautiousUntilStage: 2, lowerDiveEvadeY: 208,
  lowerDiveEvadeDx: 40, diveEmergencyY: 236, diveEmergencyDx: 26,
  urgentDx: 42, urgentLook: 198, deadZone: 5
};
let checks = 0;
function check(name, run) { run(); checks++; }
function enemy(y, extra = {}) {
  state.e = [{ id: 1, hp: 1, dive: 1, t: 'bee', x: 120, y, ...extra }];
}
for (const persona of ['expert', 'professional']) {
  cfg.name = persona;
  for (const stage of [4, 6, 8, 31]) {
    state.stage = stage;
    check(`${persona} ${stage} lane crossing`, () => {
      enemy(331);
      assert.equal(ctx.harnessMoveAxis(state, player, cfg), -1);
    });
    check(`${persona} ${stage} body below center`, () => {
      enemy(340);
      assert.equal(ctx.harnessMoveAxis(state, player, cfg), -1);
    });
    check(`${persona} ${stage} clear resumes pursuit`, () => {
      enemy(350);
      assert.equal(ctx.harnessMoveAxis(state, player, cfg), 1);
    });
  }
}
check('Challenge does not use body clearance', () => {
  state.challenge = true; enemy(340);
  assert.equal(ctx.harnessLowerFieldThreat(state, player, cfg), null);
  state.challenge = false;
});
check('Dead enemy is not a threat', () => {
  enemy(340, { hp: 0 });
  assert.equal(ctx.harnessLowerFieldThreat(state, player, cfg), null);
});
check('Non-diving enemy does not use diving avoidance', () => {
  enemy(340, { dive: 0 });
  assert.equal(ctx.harnessLowerFieldThreat(state, player, cfg), null);
});
check('Beginner remains outside the clearance policy', () => {
  cfg.name = 'novice'; enemy(340);
  assert.equal(ctx.harnessLowerFieldThreat(state, player, cfg), null);
});
check('Intermediate remains outside the clearance policy', () => {
  cfg.name = 'advanced';
  assert.equal(ctx.harnessLowerFieldThreat(state, player, cfg), null);
});
check('Opening policy remains unchanged', () => {
  cfg.name = 'professional'; state.stage = 2;
  assert.equal(ctx.harnessLowerFieldThreat(state, player, cfg), null);
});
console.log(JSON.stringify({ ok: true, checks, limitations: [
  'Synthetic collision boxes isolate controller decisions, not full game geometry.',
  'Competing bullet/body arbitration and human actuator equivalence are not proven.'
] }, null, 2));

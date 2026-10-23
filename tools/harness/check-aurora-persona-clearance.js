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
const player = { x: 109, y: 335, s: 440 };
const ctx = vm.createContext({
  isAuroraRuntimeState: s => s === state,
  currentAuroraRuntimeState: () => state,
  playerHitbox: () => ({ w: 7, h: 6 }),
  enemyCollisionHitbox: () => ({ w: 4, h: 4 }),
  playLane: x => Math.floor(x / 28),
  cl: (value,lo,hi) => Math.max(lo,Math.min(hi,value)),
  harnessSelectTarget: () => ({ x: 180 }), PLAY_W: 280
});
vm.runInContext(source.slice(start, end), ctx);
const cfg = {
  name: 'professional', cautiousUntilStage: 2, lowerDiveEvadeY: 208,
  lowerDiveEvadeDx: 40, diveEmergencyY: 236, diveEmergencyDx: 26,
  urgentDx: 42, urgentLook: 198, deadZone: 5, moveMul: .84
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
state.stage=12;cfg.name='professional';player.x=140;
check('Opposing bullet/body proposal is checked against the body',()=>{
  enemy(329,{x:123});state.eb=[{x:155,y:310,vx:0,vy:160}];
  assert.equal(ctx.harnessMoveAxis(state,player,cfg),-1);
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,-1,1/60),1);
});
check('Mirrored conflict chooses the mirrored escape',()=>{
  enemy(329,{x:157});state.eb=[{x:125,y:310,vx:0,vy:160}];
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,1,1/60),-1);
});
check('All bodies matter, not only the first or highest-Y body',()=>{
  enemy(329,{x:123});state.e.unshift({hp:1,x:220,y:340});state.eb=[];
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,-1,1/60),1);
});
check('Equally unsafe sides hold with deterministic decisions',()=>{
  state.e=[{hp:1,x:122,y:335},{hp:1,x:158,y:335}];
  for(const preference of [-1,1,-1,1])assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,preference,1/60),0);
});
check('Clear pursuit is preserved',()=>{
  state.e=[];state.eb=[];
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,1,1/60),1);
});
check('Stage2 remains outside the retained later-stage arbitration',()=>{
  cfg.name='professional';state.stage=2;state.challenge=false;
  enemy(340,{x:157});state.eb=[];
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,1,1/60),1);
  enemy(340,{x:123});
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,-1,1/60),-1);
});
check('Challenge and Stage1 remain outside arbitration',()=>{
  enemy(329,{x:123});state.challenge=true;
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,-1,1/60),-1);
  state.challenge=false;state.stage=1;
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,-1,1/60),-1);
  state.stage=12;cfg.name='expert';
  assert.equal(ctx.harnessResolveHazardAxis(state,player,cfg,-1,1/60),-1);
});
console.log(JSON.stringify({ ok: true, checks, limitations: [
  'Synthetic collision boxes isolate controller decisions, not full game geometry.',
  'Conflict fixtures are synthetic, not exact recorded bullet poses or continuous collision guarantees.',
  'Human actuator equivalence is not proven.'
] }, null, 2));

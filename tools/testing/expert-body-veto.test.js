'use strict';
// Baseline b17c5d63. Adapted from the October29 private 45 + 70 scenario audits.
// Executes the integrated policy and real collider implementations.
// Endpoint/forced-axis fixtures do not prove moving-world safety or human feasibility.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const source = name => fs.readFileSync(path.join(__dirname, '../../src/js', name), 'utf8');
const boot = source('00-boot.js');
const flow = source('05-player-flow.js');
const combat = source('05-player-combat.js');
const capture = source('07-capture-rescue.js');
const entities = source('14-entity-model.js');
const render = source('21-render-board.js');
const DISPATCH = " if(cfg.name==='expert'&&!state.challenge&&state.stage>=4)return harnessExpertBodyVeto(state,p,cfg,preferredAxis,dt);\n";

function section(text, start, end) {
  const a = text.indexOf(start), b = text.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Source section missing: ${start} .. ${end}`);
  return text.slice(a,b);
}

const resolver = section(flow, 'function harnessResolveHazardAxis(', '\nfunction runHarnessPlayer(');
const helperStart = flow.indexOf('function harnessExpertBodyVeto(');
const helper = helperStart < 0 ? '' : section(flow, 'function harnessExpertBodyVeto(', 'function harnessResolveHazardAxis(');
const controlResolver = resolver.replace(DISPATCH, '');

function context(control = false) {
  const ctx = vm.createContext({
    // Observe collision side effects without invoking audio, rendering or life transitions.
    ex() {}, logEvent() {}, enemyRef:e => ({id:e.id}),
    loseShip:(state, cause) => { state.testHits++; state.testCauses.push(cause.cause); }
  });
  const clampLine = boot.split('\n').find(line => line.startsWith('const rnd=') && line.includes('cl='));
  assert(clampLine, 'Actual clamp declaration missing');
  const runtimePredicate = section(boot, 'function isAuroraRuntimeState(', 'window.createAuroraRuntimeState=');
  vm.runInContext([
    section(boot, 'const PLAY_W=', 'const STAGE1_SCRIPT='), clampLine,
    section(boot, 'const playLane=', 'const snapshot='), runtimePredicate,
    section(render, 'function enemyDims(', 'function enemyUnrotatedCullExtent('),
    section(render, 'function enemyCollisionHitbox(', 'function playerMovementHalfWidth('),
    section(entities, 'function enemyHasCaptureState(', 'function enemyChallengeUpperBandY('),
    section(capture, 'function hasCarriedFighter(', 'function capturePlayer('),
    control ? controlResolver : helper + resolver,
    section(combat, 'function updateEnemyBullets(', 'function updateReleasedCapture('),
    'this.cl=cl; this.PLAY_W=PLAY_W;'
  ].join('\n'), ctx, {filename:'expert-body-veto-actual-source.vm.js'});
  return ctx;
}

function makeState(p, opts = {}) {
  const {stage=6, challenge=false, e=[{x:235.04061304382637,y:328.1807141236607}], eb=[]} = opts;
  return {stage, challenge, p, pb:[], e:e.map((enemy,i) => ({id:i+1,hp:1,t:'bee',dive:1,...enemy})),
    eb:structuredClone(eb), lives:3, simT:1, captureCountStage:0, testHits:0, testCauses:[]};
}

function behavior(label, opts = {}, expected) {
  test(`behavior: ${label}`, () => {
    const {x=221.72,y=335,preferred=1,name='expert'} = opts;
    const ctx = context(), p = {x,y,s:440}, cfg = {name,moveMul:.84};
    const state = makeState(p,opts); ctx.S=state;
    // Stage1-3 resets hCaptureRiskSpent by contract; otherwise Expert is stateless.
    const before = JSON.stringify({...state,p:undefined});
    const actual = ctx.harnessResolveHazardAxis(state,p,cfg,preferred,1/60);
    assert.equal(actual,expected);
    assert.equal(JSON.stringify({...state,p:undefined}),before,'Policy mutated world state');
    if (state.stage >= 4) assert.deepEqual(p,{x,y,s:440},'Expert mutated player state');
  });
}

// 21 behavior/exclusion cases. Real Stage6 diving bee dimensions replace old box stubs.
behavior('recorded impact uses hold',{},0);
behavior('mirrored impact',{x:58.28,preferred:-1,e:[{x:44.95938695617363,y:328.1807141236607}]},0);
behavior('next bullet rejects hold',{eb:[{x:224.72,y:328,vx:0,vy:180}]},-1);
behavior('current bullet rejects hold',{eb:[{x:224.72,y:335,vx:0,vy:180}]},-1);
behavior('distant urgency bullet preserves body veto',{eb:[{x:187.92530306131295,y:216.01979582295843,vx:-1.644212896,vy:178}]},0);
behavior('no body-clear alternative preserves preferred',{e:[{x:235.04,y:335},{x:215.56,y:335}]},1);
behavior('all choices bullet-blocked preserves preferred',{eb:[{x:218,y:335,vx:0,vy:0}]},1);
behavior('dead body ignored',{e:[{hp:0,x:235.04,y:335}]},1);
behavior('body below ignored',{e:[{x:235.04,y:345}]},1);
behavior('body above ignored',{e:[{x:235.04,y:325}]},1);
// Place the enemy at zero to avoid subtraction rounding just inside the boundary.
behavior('actual vertical boundary is clear',{y:26*.14+6,e:[{x:235.04,y:0}]},1);
behavior('safe preferred unchanged',{preferred:-1},-1);
behavior('left wall escapes right',{x:9,preferred:-1,e:[{x:3,y:335}]},1);
behavior('right wall escapes left',{x:271,preferred:1,e:[{x:277,y:335}]},-1);
behavior('unsafe hold retreats',{preferred:0,e:[{x:230,y:335}]},-1);
for (const stage of [1,2,3]) behavior(`Stage${stage} excluded`,{stage},1);
behavior('challenge excluded',{challenge:true},1);
for (const name of ['novice','advanced']) behavior(`${name} excluded`,{name},1);

// 24 Professional compatibility cases, completing the original 45-case behavior panel.
for (const stage of [1,4,6,12]) for (const challenge of [false,true]) for (const preferred of [-1,0,1]) {
  test(`Professional unchanged: stage${stage} challenge${challenge} axis${preferred}`, () => {
    const candidate=context(), control=context(true);
    const p={x:221.72,y:335,s:440,spawn:0}, q=structuredClone(p);
    const a=makeState(p,{stage,challenge,e:[{x:235,y:335}]}), b=structuredClone(a); b.p=q;
    candidate.S=a; control.S=b;
    const cfg={name:'professional',moveMul:.84};
    assert.equal(candidate.harnessResolveHazardAxis(a,p,cfg,preferred,1/60),control.harnessResolveHazardAxis(b,q,cfg,preferred,1/60));
    assert.equal(JSON.stringify(p),JSON.stringify(q));
    assert.equal(JSON.stringify(a),JSON.stringify(b));
  });
}

function geometry(label, opts, expected) {
  test(`actual collider: ${label}`, () => {
    const {stage=6,challenge=false,t='bee',dive=1,x=120,ex=132,ey=335,preferred=1,eb=[]}=opts;
    const ctx=context(), p={x,y:335,s:440,spawn:0,captured:false,returning:false};
    const state=makeState(p,{stage,challenge,e:[{t,dive,x:ex,y:ey}],eb}); ctx.S=state;
    const cfg={name:'expert',moveMul:.84}, before=JSON.stringify({state,p,cfg});
    const axis=ctx.harnessResolveHazardAxis(state,p,cfg,preferred,1/60);
    assert.equal(axis,expected); assert.equal(JSON.stringify({state,p,cfg}),before,'Policy mutation');
    const hp=ctx.playerHitbox();
    p.x=ctx.cl(p.x+axis*p.s/60*cfg.moveMul,hp.w+2,ctx.PLAY_W-hp.w-2);
    ctx.updateEnemyBullets(state,1/60,p); ctx.updateEnemyBodyCollisions(state,p);
    assert.equal(state.testHits,0,`Chosen endpoint hit by actual collider: ${state.testCauses}`);
  });
}

// Ten actual collision geometry fixtures.
geometry('Stage4 narrow bee permits hold',{stage:4,ex:130.7},0);
geometry('Stage5 larger bee requires retreat',{stage:5,ex:130.7},-1);
geometry('later bee permits hold at12px',{ex:132},0);
geometry('later boss requires retreat',{t:'boss',ex:132},-1);
geometry('later rogue boundary',{t:'rogue',ex:131.8},-1);
geometry('nondiving boss permits hold',{t:'boss',dive:0,ex:132},0);
geometry('current-only bullet rejects hold',{x:221.72,ex:235.04061304382637,ey:328.1807141236607,eb:[{x:224.72,y:340,vx:0,vy:180}]},-1);
geometry('next-only bullet rejects hold',{x:221.72,ex:235.04061304382637,ey:328.1807141236607,eb:[{x:224.72,y:328,vx:0,vy:180}]},-1);
geometry('mirrored boss',{x:160,ex:148,t:'boss',preferred:-1},1);
geometry('challenge contact remains nonlethal',{challenge:true,x:120,ex:126.16},1);

// 60 consecutive Professional observation/capture checkpoints. Each test replays its
// prefix independently, so test scheduling cannot reset or reorder shared VM state.
for (const lives of [0,1,3]) for (const spent of [false,true]) for (const dual of [false,true]) for (let checkpoint=0;checkpoint<5;checkpoint++) {
  test(`Professional continuity: lives${lives} spent${spent} dual${dual} tick${checkpoint}`, () => {
    const candidate=context(), control=context(true);
    const p={x:120,y:335,s:440,spawn:0,hCaptureRiskSpent:spent,dual}, q=structuredClone(p);
    for (let tick=0;tick<=checkpoint;tick++) {
      const a=makeState(p,{e:[{id:1,t:'boss',dive:1,form:true,x:133-tick,y:300+tick*3,beam:true}],
        eb:[{x:110,y:330,vx:2,vy:190}]});
      Object.assign(a,{lives,simT:1+tick/60,captureCountStage:tick>2?1:0});
      const b=structuredClone(a); b.p=q; candidate.S=a; control.S=b;
      const cfg={name:'professional',moveMul:.88};
      assert.equal(candidate.harnessResolveHazardAxis(a,p,cfg,1,1/60),control.harnessResolveHazardAxis(b,q,cfg,1,1/60));
      assert.equal(JSON.stringify(p),JSON.stringify(q));
      assert.equal(JSON.stringify(a),JSON.stringify(b));
    }
  });
}

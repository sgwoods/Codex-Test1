'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { derive, normalize, classify, comparison, argsFrom, stepChunk, observePostVeto, normalizeSettlement, MAX_TICKS } = require('./check-natural-persona-lifecycle');

test('derivation retains identical observers and adds only the candidate policy', () => {
  const source = `<script>
function logEvent(type,data={}){
 REC.events.push(Object.assign({t:recTime(),type},data));
}
function harnessResolveHazardAxis(state,p,cfg,preferredAxis,dt){
 if(cfg.name!=='professional'||state.challenge||state.stage<4)return preferredAxis;
}
function runHarnessPlayer(){
 const axis=harnessResolveHazardAxis(S,p,cfg,preferredAxis,dt);
}
</script>`;
  const policy = 'function harnessExpertBodyVeto(){return 0;}';
  const control = derive(source, policy, false), candidate = derive(source, policy, true);
  assert(!control.includes(policy));
  assert(candidate.includes(policy));
  assert.equal(candidate.replace(policy + '\n', '').replace(
    " if(cfg.name==='expert'&&!state.challenge&&state.stage>=4)return harnessExpertBodyVeto(state,p,cfg,preferredAxis,dt);\n", ''), control);
  for (const [html, expected] of [[control, 1], [candidate, 0]]) {
    const ctx = {window:{__naturalProbe:{active:true,tick:1,events:[]}},
      REC:{events:[]},recTime:()=>0,S:{watchMode:true}};
    vm.createContext(ctx);
    vm.runInContext(html.slice('<script>'.length, -'</script>'.length), ctx);
    assert.equal(vm.runInContext("harnessResolveHazardAxis({stage:4,challenge:false},{},{name:'expert'},1,1/60)", ctx), expected);
    vm.runInContext("logEvent('score_awarded',{points:10})", ctx);
    assert.equal(ctx.window.__naturalProbe.events[0].event.points, 10);
    assert.equal(ctx.window.__naturalProbe.events[0].owner, 'watch');
  }
  assert.throws(() => derive(source + source, policy, true), /Expected one anchor/);
  assert.throws(() => derive('', policy, false), /Expected one anchor/);
});

test('normalization removes only randomized Rival presentation metadata', () => {
  const input = { seed: 91001, rngState: 123, label: 'mechanical-label',
    playerTwo: {mode:'persona-rival', variance:.9, initials:'ABC', label:'Expert', score:50} };
  assert.deepEqual(normalize(input), {seed:91001, rngState:123, label:'mechanical-label',
    playerTwo:{mode:'persona-rival', score:50}});
  assert.equal(input.playerTwo.variance, .9);
});

test('only a complete active budget is censored; unexplained stops fail', () => {
  assert.equal(classify({started:1}, [], MAX_TICKS).kind, 'time-limit');
  assert.throws(() => classify({started:1}, [], MAX_TICKS - 1), /before its simulation budget/);
  assert.throws(() => classify({started:0,lives:0}, [], 500), /Unexplained/);
  assert.equal(classify({started:0,lives:0,score:50}, [{event:{type:'game_over',score:50}}], 500).kind, 'game-over');
  assert.throws(() => classify({started:0,lives:1,score:50}, [{event:{type:'game_over',score:50}}], 500), /Unexplained/);
});

test('CLI requires all named paths and refuses duplicate/unknown flags', () => {
  const argv = ['--repo','/repo','--bundle','/bundle','--policy','/policy','--out','/out'];
  assert.equal(argsFrom(argv).out, '/out');
  assert.equal(argsFrom(['--smoke', ...argv]).smoke, true);
  assert.equal(argsFrom([...argv, '--smoke']).smoke, true);
  assert.equal(argsFrom([...argv, '--extended']).extended, true);
  assert.throws(() => argsFrom([...argv, '--extended', '--smoke']), /mutually exclusive/);
  assert.throws(() => argsFrom([...argv, '--smoke', '--smoke']), /Duplicate/);
  assert.throws(() => argsFrom(argv.concat(['--out','/other'])), /Duplicate/);
  assert.throws(() => argsFrom(['--repo','/repo']), /Missing/);
  assert.throws(() => argsFrom(['--wat','/repo']), /Usage/);
});

test('explicit smoke budget cannot accidentally classify an incomplete full career', () => {
  assert.equal(classify({started:1}, [], 720, 720).kind, 'time-limit');
  assert.throws(() => classify({started:1}, [], 720), /before its simulation budget/);
});

function mockChunk({owner = 'p2', nextOwner = owner, keys = [], persona = null, humanAfter = 0} = {}) {
  let active = owner, updates = 0;
  const state = () => ({started:1, watchMode:active === 'watch', persona,
    harnessPersona:['watch','p2'].includes(active) ? 'expert' : null,
    playerTwo:{activeTurn:active, humanScore:updates ? humanAfter : 0}});
  const ctx = {window:{__naturalProbe:{tick:0,mode:'p2',events:[],trace:[]}, __galagaHarness__:{
    state, inputState:() => ({keys}),
    advanceFor:(seconds, opts) => { assert.equal(seconds, 1/60); assert.equal(opts.step, 1/60); updates++; active = nextOwner; return state(); },
    snapshot:() => ({counts:{effects:1},stage:4}), spriteRuntimeState:() => ({enemies:[]})
  }}};
  const result = vm.runInNewContext(`(${stepChunk.toString()})(60)`, ctx);
  return {result, updates};
}

test('chunk stops immediately on P2-to-P1 boundary, before another update', () => {
  const {result, updates} = mockChunk({nextOwner:'p1', keys:['ArrowRight','Space']});
  assert.equal(updates, 1);
  assert.equal(result.rows[0].owner, 'p2');
  assert.equal(result.rows[0].afterOwner, 'p1');
  assert.equal(result.rows[0].snapshot.counts.effects, undefined);
});

test('chunk refuses held keys on P1, global autopilot, and score leakage', () => {
  assert.throws(() => mockChunk({owner:'p1',keys:['Space']}), /Held keys reached manual/);
  assert.throws(() => mockChunk({persona:'expert'}), /Global autopilot/);
  assert.throws(() => mockChunk({humanAfter:10}), /human score/);
  assert.throws(() => mockChunk({nextOwner:'p1',humanAfter:999}), /human score/);
});

test('post-veto coverage separates automated time, handoff and subsequent manual updates', () => {
  const c = {automatedTicks:0, returned:false, manualTicks:0};
  observePostVeto(c, {tick:2,owner:'p2',afterOwner:'p2'}, 2);
  assert.equal(c.automatedTicks, 0);
  observePostVeto(c, {tick:3,owner:'p2',afterOwner:'p1'}, 2);
  assert.deepEqual(c, {automatedTicks:1,returned:true,manualTicks:0});
  observePostVeto(c, {tick:4,owner:'p1',afterOwner:'p1'}, 2);
  assert.deepEqual(c, {automatedTicks:1,returned:true,manualTicks:1});
  observePostVeto(c, {tick:5,owner:'p2',afterOwner:'p2'}, undefined);
  assert.equal(c.automatedTicks, 1);
});

test('chunk ticks are monotonic even when board clocks are absent/rounded', () => {
  const {result, updates} = mockChunk();
  assert.equal(updates, 60);
  assert.equal(result.rows[0].tick, 1);
  assert.equal(result.rows[59].tick, 60);
});

test('prefix comparison is exclusive of intervention; whole-run comparison detects divergence', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'natural-probe-unit-'));
  t.after(() => fs.rmSync(root, {recursive:true, force:true}));
  function fixture(name, hash) {
    const out = path.join(root, name); fs.mkdirSync(out);
    fs.writeFileSync(path.join(out,'receipt.json'), JSON.stringify({firstIntervention:{tick:2}}));
    fs.writeFileSync(path.join(out,'ticks.jsonl'), [{tick:1,sha256:'same'},{tick:2,sha256:hash}].map(JSON.stringify).join('\n'));
    for (const file of ['events','trace']) fs.writeFileSync(path.join(out,file+'.jsonl'), '');
    return {out,name,passed:true};
  }
  const a = fixture('control','a'), b = fixture('candidate','b');
  assert(comparison(a,b,true).passed);
  const full = comparison(a,b,false);
  assert(!full.passed); assert.equal(full.firstMismatch.index, 1);
  assert(!comparison({...a,passed:false},b,true).passed);
});

test('managed normal close requires a successful explicit worker teardown receipt', () => {
  const result = {status:0, signal:null, error:null, cleanup:{status:'not-attempted', scope:'observed-descendants', detachedDescendants:'not-verifiable'}};
  const receipt = {passed:true, teardownErrors:[]};
  const settlement = normalizeSettlement(result, receipt, false, 12);
  assert.equal(settlement.cleanupAcceptable, true);
  assert.equal(settlement.cleanup.status, 'not-attempted');
  assert.equal(settlement.cleanupBasis, 'normal-close-and-worker-teardown');
  assert.equal(settlement.cleanup.detachedDescendants, 'not-verifiable');
  assert.equal(normalizeSettlement(result, null, false, 12).cleanupAcceptable, false);
  assert.equal(normalizeSettlement(result, {passed:true}, false, 12).cleanupAcceptable, false);
  assert.equal(normalizeSettlement(result, {passed:true, teardownErrors:['browser timeout']}, false, 12).cleanupAcceptable, false);
});

test('managed incomplete, missing, unknown and not-needed cleanup fail closed even on exit zero', () => {
  for (const status of ['incomplete', 'unknown', 'not-needed', 'unexpected']) {
    const s = normalizeSettlement({status:0, cleanup:{status}}, {passed:true, teardownErrors:[]}, false, 1);
    assert.equal(s.cleanupAcceptable, false, status);
  }
  assert.equal(normalizeSettlement({status:0}, {passed:true, teardownErrors:[]}, false, 1).cleanupAcceptable, false);
});

test('verified observed cleanup retains failure/abort diagnostics, not a successful career', () => {
  const result = {status:null, signal:'SIGTERM', error:new Error('Cancelled browser run'),
    cleanup:{status:'verified', scope:'observed-descendants', detachedDescendants:'not-verifiable'}};
  const s = normalizeSettlement(result, null, true, 1500);
  assert.equal(s.cleanupAcceptable, true);
  assert.equal(s.code, null);
  assert.equal(s.interrupted, true);
  assert.match(s.error, /Cancelled browser run/);
  assert.equal(s.cleanupBasis, 'observed-descendants');
  assert.equal(s.cleanup.detachedDescendants, 'not-verifiable');
});

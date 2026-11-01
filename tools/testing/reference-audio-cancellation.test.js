const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const boot = fs.readFileSync(path.join(__dirname, '../../src/js/00-boot.js'), 'utf8');
const from = boot.indexOf(' stopReferenceClips(predicate=null){');
const to = boot.indexOf(' loadReferenceBuffer(src=', from);
assert(from >= 0 && to > from);
const flush = () => new Promise(resolve => setImmediate(resolve));

function fixture(){
  const loads = new Map(), sources = [];
  const ctx = vm.createContext({ aud: 1, audioMuted: false, performance: { now: () => 1000 },
    window: { __platinumAudioDebug: { reference: { startedHistory: [], blockedHistory: [] } } },
    AC: () => ({ currentTime: 7, state: 'running',
      createGain: () => ({ gain: {}, connect(){} }),
      createBufferSource: () => {
        const source = { connect(){}, start(...args){this.startArgs=args;},
          stop(){this.stopped=true;this.ended?.();}, addEventListener(type, fn){if(type==='ended')this.ended=fn;} };
        sources.push(source); return source;
      } }),
    load: clip => {
      if(!loads.has(clip)){
        let resolve, reject;
        const promise = new Promise((yes,no) => {resolve=yes;reject=no;});
        loads.set(clip,{promise,resolve,reject});
      }
      return loads.get(clip).promise;
    } });
  vm.runInContext('const sfx={referenceActive:[],referencePending:new Set(),referenceCooldowns:{},bus:{},logCueEvent(){},loadReferenceBuffer:load,' + boot.slice(from,to) + '};globalThis.sfx=sfx;',ctx);
  const play = (cue='gameOver',clip='ending',extra={}) => ctx.sfx.playReferenceClip(clip,
    {cueEntry:{cue},clipStart:2.3,clipDuration:4.2,...extra});
  return {ctx,sfx:ctx.sfx,loads,sources,play};
}

for(const kind of ['all','cue','clip']) test(`pending reference playback respects ${kind} stop`,async()=>{
  const f=fixture();f.play();f.play('playerHit','hit');
  if(kind==='all')f.sfx.stopReferenceClips();
  if(kind==='cue')f.sfx.stopCueNames(['gameOver']);
  if(kind==='clip')f.sfx.stopReferenceClips(s=>s.__clip==='ending');
  f.loads.get('ending').resolve({duration:14});f.loads.get('hit').resolve({duration:3});await flush();
  assert.deepEqual(f.sources.map(s=>s.__cue),kind==='all'?[]:['playerHit']);
  assert.equal(f.sfx.referencePending.size,0);
});

test('shared decode preserves unrelated and newer playback requests',async()=>{
  const f=fixture();f.play();f.play('playerHit','ending');f.sfx.stopCueNames(['gameOver']);f.play();
  const buffer={duration:14};f.loads.get('ending').resolve(buffer);await flush();
  assert.deepEqual(f.sources.map(s=>s.__cue),['playerHit','gameOver']);
  for(const s of f.sources){assert.equal(s.buffer,buffer);assert.deepEqual(s.startArgs,[7,2.3,4.2]);}
  assert.equal(f.ctx.window.__platinumAudioDebug.reference.startedHistory.length,2);
  assert.equal(f.sfx.referencePending.size,0);
});

test('all layers of a selected cue are cancelled without source creation',async()=>{
  const f=fixture();f.play('gameOver','one');f.play('gameOver','two');f.sfx.stopCueNames(['gameOver']);
  for(const load of f.loads.values())load.resolve({duration:14});await flush();
  assert.equal(f.sources.length,0);assert.equal(f.ctx.window.__platinumAudioDebug.reference.startedHistory.length,0);
});

test('empty and nonmatching stops preserve pending playback',async()=>{
  const f=fixture();f.play();f.sfx.stopCueNames([]);f.sfx.stopCueNames(['other']);
  f.loads.get('ending').resolve({duration:14});await flush();assert.equal(f.sources.length,1);
});

test('failed, empty and muted loads settle pending bookkeeping',async()=>{
  for(const mode of ['rejected','empty','muted']){
    const f=fixture();f.play();
    if(mode==='rejected')f.loads.get('ending').reject(new Error('fixture'));
    else {if(mode==='muted')f.ctx.audioMuted=true;f.loads.get('ending').resolve(mode==='empty'?null:{duration:14});}
    await flush();assert.equal(f.sfx.referencePending.size,0);assert.equal(f.sources.length,0);
  }
});

test('already scheduled sources still stop selectively',async()=>{
  const f=fixture();f.play('gameOver','ending',{delay:2});f.play('playerHit','hit');
  for(const load of f.loads.values())load.resolve({duration:14});await flush();
  assert.equal(f.sources[0].startArgs[0],9);f.sfx.stopCueNames(['gameOver']);
  assert.equal(f.sources[0].stopped,true);assert(!f.sources[1].stopped);
});

test('synchronous stop cancels an already-resolved cache microtask',async()=>{
  const f=fixture();f.sfx.loadReferenceBuffer=()=>Promise.resolve({duration:14});
  f.play();assert.equal(f.sfx.referencePending.size,1);f.sfx.stopCueNames(['gameOver']);
  assert.equal(f.sfx.referencePending.size,0);await flush();assert.equal(f.sources.length,0);
});

test('one selective stop covers active and pending requests together',async()=>{
  const f=fixture();f.play('gameOver','active-ending');f.play('playerHit','active-hit');
  for(const load of f.loads.values())load.resolve({duration:14});await flush();
  f.play('gameOver','pending-ending');f.play('playerHit','pending-hit');
  f.sfx.stopCueNames(['gameOver']);assert.equal(f.sfx.referencePending.size,1);
  f.loads.get('pending-ending').resolve({duration:14});f.loads.get('pending-hit').resolve({duration:14});await flush();
  assert.equal(f.sources[0].stopped,true);assert(!f.sources[1].stopped);
  assert.deepEqual(f.sources.map(s=>s.__clip),['active-ending','active-hit','pending-hit']);
});

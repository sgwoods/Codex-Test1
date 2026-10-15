#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {createHash}=require('crypto');
const {ROOT,withHarnessPage}=require('./browser-check-util');
const hash=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const expected='d86e64702c5174e791409385c81901817af4e750d56a68e7a39c3eb311ff24b5';
function options(args){
 const read=(key,def)=>args.find(a=>a.startsWith('--'+key+'='))?.split('=')[1]??def;
 const stage=Number(read('stage',31)),seed=Number(read('seed',9131)),seconds=Number(read('seconds',45)),mode=read('mode','challenge');
 assert(Number.isInteger(stage)&&stage>=1&&stage<=99,'Display launch supports stages1-99');
 assert(Number.isInteger(seed)&&seed>0&&seed<=0xffffffff);
 assert(Number.isFinite(seconds)&&seconds>=1&&seconds<=45);
 assert(['challenge','normal'].includes(mode));
 if(mode==='challenge')assert(stage>=3&&(stage-3)%4===0,'Challenge requires actual challenge display stage');
 else assert(!(stage>=3&&(stage-3)%4===0),'Normal launch must use a non-challenge display stage');
 return {stage,seed,seconds,mode};
}
async function run(root,cfg,replay,{completeStage=false}={}){
 return withHarnessPage({root,skipStart:true},async({page})=>{
  // Freezes performance.now/keyHeldMs as well as Date; RAF never advances gameplay.
  await page.clock.install({time:new Date('2026-10-12T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-12T00:00:01Z'));
  const initial=await page.evaluate(cfg=>{
   const h=window.__galagaHarness__;
   h.start({controlledClock:true,stageMode:cfg.mode==='challenge'?'display':'internal',startKind:cfg.mode==='challenge'?'challenge':'level',
    stage:cfg.stage,challengeStage:(cfg.stage+1)/4,seed:cfg.seed,ships:3,persona:null,expertPlays:'human',playerTwo:false,autoVideo:false});
   const s=currentAuroraRuntimeState();
   return {...h.snapshot(),stats:{...s.stats},clockStart:performance.now(),targetIds:s.e.filter(e=>e.hp>0).map(e=>e.id)};
  },cfg);
  assert.equal(initial.simT,0);assert.equal(initial.stage,cfg.stage);assert.equal(initial.watchMode,false);
  assert.equal(initial.challenge,cfg.mode==='challenge');assert.equal(initial.score,0);
  const frames=[],trace=[],events=[],seen=new Set(),previous=new Map();let held=[],targetId=null;
  const maxFrames=replay?replay.length+(completeStage?1200:0):Math.ceil(cfg.seconds*60);
  for(let frame=0;frame<maxFrames;frame++){
   const before=await page.evaluate(()=>{
    const s=currentAuroraRuntimeState();
    return {snapshot:window.__galagaHarness__.snapshot(),speed:s.p.s,
     enemies:s.e.filter(e=>e.hp>0&&e.spawn<=0).map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp})),
     bullets:s.pb.map(b=>({x:b.x,y:b.y,v:b.v})),cd:s.p.cd};
   });
   let keys;
   if(replay)keys=replay[frame]?.keys||[];
   else{
    const p=before.snapshot.player;
    const candidates=before.enemies.map(e=>{
     const prev=previous.get(e.id),vx=prev?(e.x-prev.x)*60:0,vy=prev?(e.y-prev.y)*60:0;
     const flight=Math.max(0,Math.min(.6,(p.y-18-e.y)/Math.max(120,560+vy)));
     const aim=e.x+Math.max(-180,Math.min(180,vx))*flight;
     return {...e,aim,cost:Math.abs(aim-p.x)/440+flight+(e.id===targetId?-.12:0)};
    }).filter(e=>e.aim>=13&&e.aim<=267&&e.y>-32&&e.y<p.y+4).sort((a,b)=>a.cost-b.cost||a.id-b.id);
    const target=candidates[0];targetId=target?.id??null;
    const error=target?target.aim-p.x:0,axis=Math.abs(error)>6?Math.sign(error):0;
    keys=['Space',...(axis<0?['ArrowLeft']:axis>0?['ArrowRight']:[])];
   }
   for(const e of before.enemies)previous.set(e.id,e);
   const released=held.filter(k=>!keys.includes(k)),pressed=keys.filter(k=>!held.includes(k));
   await page.evaluate(({released,pressed})=>{
    for(const code of released)window.dispatchEvent(new KeyboardEvent('keyup',{code,key:code==='Space'?' ':code,bubbles:true}));
    for(const code of pressed)window.dispatchEvent(new KeyboardEvent('keydown',{code,key:code==='Space'?' ':code,bubbles:true}));
   },{released,pressed});held=[...keys];
   trace.push({frame,keys:[...keys]});
   await page.clock.runFor((frame%3===2)?16:17);
   const after=await page.evaluate(()=>{
    const h=window.__galagaHarness__;h.advanceFor(1/60,{step:1/60,stopOnGameOver:false});
    const s=currentAuroraRuntimeState();
    return {snapshot:h.snapshot(),events:h.recentEvents({count:300}),clock:performance.now(),
     actualPlayer:{x:s.p.x,y:s.p.y,vx:s.p.vx},enemyState:s.e.map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,miss:e.miss||0})),
     cd:s.p.cd,cap:s.p.dual?4:2,bullets:s.pb.map(b=>({x:b.x,y:b.y,v:b.v})),
     stats:{...s.stats},challenge:s.ch?{hits:s.ch.hits,total:s.ch.total}:null};
   });
   for(const e of after.events){const sig=JSON.stringify(e);if(!seen.has(sig)){seen.add(sig);events.push(e);}}
   frames.push({frame,keys:[...keys],clock:after.clock-initial.clockStart,absoluteClock:after.clock,snapshot:after.snapshot,cd:after.cd,cap:after.cap,
    actualPlayer:after.actualPlayer,enemyState:after.enemyState,bullets:after.bullets,stats:after.stats,challenge:after.challenge,speed:before.speed});
   if(replay&&completeStage&&frame>=replay.length-1&&after.snapshot.stage!==cfg.stage)break;
   if(!replay&&(events.some(e=>e.type===(cfg.mode==='challenge'?'challenge_clear':'stage_clear')&&e.stage===cfg.stage)||!after.snapshot.started))break;
  }
  await page.evaluate(held=>{for(const code of held)window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));},held);
  return {initial,trace,frames,events,final:frames.at(-1)?.snapshot};
 });
}
function audit(result,cfg){
 const errors=[],shots=result.events.filter(e=>e.type==='player_shot'),kills=result.events.filter(e=>e.type==='enemy_killed'),ids=kills.map(e=>e.id);
 const clear=result.events.find(e=>e.type===(cfg.mode==='challenge'?'challenge_clear':'stage_clear')&&e.stage===cfg.stage);
 let previous=result.initial,minShotGap=Infinity,maxMovement=0,maxBullets=0;
 for(const f of result.frames){
  const s=f.snapshot,p=s.player,dx=Math.abs(p.x-previous.player.x);maxMovement=Math.max(maxMovement,dx);maxBullets=Math.max(maxBullets,f.bullets.length);
  if(f.bullets.length>f.cap)errors.push('Bullet cap exceeded');
  if(Math.abs(p.vx)>f.speed+.02)errors.push('Velocity exceeds actual player speed');
  if(p.spawn===0&&previous.player.spawn===0&&!p.captured&&!previous.player.captured&&!p.pending&&!previous.player.pending&&dx>f.speed/60+.03)errors.push('Unexplained excessive movement');
  if(f.bullets.some(b=>b.v!==560))errors.push('Player bullet velocity changed');
  if(f.cd<0||!Number.isFinite(f.cd))errors.push('Invalid cooldown');
  previous=s;
 }
 for(let i=1;i<shots.length;i++){const gap=shots[i].t-shots[i-1].t;minShotGap=Math.min(minShotGap,gap);if(gap<(cfg.mode==='challenge'?.095:.24)-.002)errors.push('Shot cooldown exceeded');}
 const shotCount=shots.reduce((n,e)=>n+e.shots,0),finalStats=result.frames.at(-1)?.stats;
 if(!finalStats||!result.initial.stats||shotCount!==finalStats.shots-result.initial.stats.shots)errors.push('Shot counter/event mismatch');
 if(kills.length&&(!shots.length||shotCount<kills.length))errors.push('Kills lack sufficient real shots');
 for(const e of shots){
  const cap=e.dual?4:2;
  if(!Number.isInteger(e.activeBullets)||e.activeBullets<e.shots||e.activeBullets>cap)errors.push('Shot event post-push bullet cap exceeded');
  if(e.shots!==(e.dual?2:1)||!Array.isArray(e.shotXs)||e.shotXs.length!==e.shots)errors.push('Invalid shot event');
 }
 for(const e of kills)if(!shots.some(s=>s.t<=e.t))errors.push('Kill precedes real shot');
 if(cfg.mode==='challenge'&&clear&&clear.hits!==kills.length)errors.push('Challenge hit/kill mismatch');
 if(result.events.some(e=>/force_perfect|test_setup|motion_profile_test/.test(e.type)))errors.push('Forbidden setup/forced clear event');
 const uniqueKills=new Set(ids).size;
 if(ids.some(id=>!result.initial.targetIds.includes(id)))errors.push('Kill outside initial target set');
 const perfect=cfg.mode==='challenge'&&result.initial.targetIds.length===40&&clear?.hits===40&&clear?.total===40&&uniqueKills===40&&kills.length===40&&errors.length===0;
 return {errors:[...new Set(errors)],clear:clear||null,kills:kills.length,uniqueKills,misses:clear?clear.total-clear.hits:null,
  shots:shots.length,shipLossEvents:result.events.filter(e=>e.type==='ship_lost'),lives:result.final?.lives,
  maxMovementPerTick:maxMovement,maxPlayerBullets:maxBullets,minShotGap:Number.isFinite(minShotGap)?minShotGap:null,perfect};
}
async function main(){
 const executedSource=fs.readFileSync(__filename),toolHash=createHash('sha256').update(executedSource).digest('hex');
 const cfg=options(process.argv.slice(2)),root=path.join(ROOT,'private-artifacts/feasibility-pilot/artifact');
 const build=JSON.parse(fs.readFileSync(path.join(root,'build-info.json')));assert.equal(build.releaseChannel,'development');assert.equal(hash(path.join(root,'index.html')),expected);
 const first=await run(root,cfg),replay=await run(root,cfg,first.trace);
 const signature=r=>r.frames.map(f=>{const snapshot={...f.snapshot,counts:{...f.snapshot.counts}};delete snapshot.counts.effects;
  return {snapshot,clock:f.clock,actualPlayer:f.actualPlayer,enemyState:f.enemyState,cd:f.cd,bullets:f.bullets,challenge:f.challenge,stats:f.stats};});
 const eventProjection=r=>r.events.filter(e=>['player_shot','enemy_killed','challenge_clear','stage_clear','ship_lost'].includes(e.type));
 const orderedEventsExact=JSON.stringify(eventProjection(first))===JSON.stringify(eventProjection(replay));
 const exact=JSON.stringify(signature(first))===JSON.stringify(signature(replay))&&orderedEventsExact;
 const firstAudit=audit(first,cfg),replayAudit=audit(replay,cfg);
 const differences=first.frames.flatMap((f,i)=>{const r=replay.frames[i];return JSON.stringify(signature({frames:[f]}))===JSON.stringify(signature({frames:[r]}))?[]:[{frame:i,first:f.snapshot.player,replay:r.snapshot.player}];});
 assert.equal(hash(path.join(root,'index.html')),expected);
 const out=path.join(ROOT,'private-artifacts/feasibility-pilot',new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(out,{recursive:true});
 const report={cfg,stageSemantics:cfg.mode==='normal'?'--stage is internal game stage':'--stage is challenge display marker3/7/.../31',build,bundleHash:expected,toolHash,clockMethod:'Playwright installed clock, paused before human launch;17/17/16ms wall-time cycle, exactly1/60 game update each tick. Elapsed performance clock compared; absolute origin retained. No runtime/global dt scaling.',
  verdict:firstAudit.perfect&&replayAudit.perfect&&exact?'FEASIBLE perfect witness, this artifact/stage/seed only':
   cfg.mode==='normal'&&firstAudit.clear&&replayAudit.clear&&exact&&!firstAudit.errors.length&&!replayAudit.errors.length?
    'FEASIBLE normal stage-clear witness, this artifact/stage/seed only':'INCONCLUSIVE: no reproducible perfect witness',
  exactReplay:exact,orderedEventsExact,effectCountDifferenceFrames:first.frames.filter((f,i)=>f.snapshot.counts.effects!==replay.frames[i].snapshot.counts.effects).length,
  comparisonScope:'Recorded projection: snapshot excluding effect count, raw player/enemy poses and hp/miss, player bullets, stats, challenge counters, RNG, elapsed clock; ordered shot/kill/clear/loss events. Not complete runtime equivalence; enemy bullets, AI timers and audio are not compared. Raw effect counts retained.',
  differences,firstAudit,replayAudit,first,replay,
  limits:['Greedy target-leading controller with read-only omniscient current state, not human reaction or public flow.',
   'Nonperfect outcomes are inconclusive, not impossibility. No all-level proof or canonical fidelity/audio acceptance.',
   'Professional direct-control persona is deliberately not used as normal-input proof.']};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(out,'executed-tool.js'),executedSource);
 console.log(JSON.stringify({out,verdict:report.verdict,exactReplay:exact,differences:differences.length,firstAudit,replayAudit},null,2));
 assert.equal(firstAudit.errors.length,0);assert.equal(replayAudit.errors.length,0);assert(exact,'Input replay diverged; evidence saved, cannot claim reproducibility');
}
if(require.main===module)main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
module.exports={options,audit,run};

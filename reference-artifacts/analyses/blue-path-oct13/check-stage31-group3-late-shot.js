#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {ROOT,withHarnessPage}=require('../../tools/harness/browser-check-util');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function main(){
 const root=path.resolve(process.argv[2]||path.join(ROOT,'dist/dev')),out=path.resolve(process.argv[3]);
 const result=await withHarnessPage({root,skipStart:true},async({page})=>{
  await page.clock.install({time:new Date('2026-10-13T00:00:00Z')});await page.clock.pauseAt(new Date('2026-10-13T00:00:01Z'));
  return page.evaluate(()=>{
   const h=window.__galagaHarness__;h.start({controlledClock:true,stageMode:'display',startKind:'challenge',stage:31,challengeStage:8,seed:9131,ships:3,persona:null,expertPlays:'human',playerTwo:false,autoVideo:false});
   const initial=h.snapshot(),targets=h.challengeFormationState().enemies,trace=[];
   for(let i=0;i<846;i++)h.advanceFor(1/60,{step:1/60,stopOnGameOver:false});
   const before=h.snapshot(),targetBefore=h.challengeContactDiagnostics(214629079);
   window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));
   h.advanceFor(1/60,{step:1/60,stopOnGameOver:false});window.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' ',bubbles:true}));
   for(let i=0;i<120;i++){const s=h.snapshot();trace.push({state:s,target:h.challengeContactDiagnostics(214629079)});if(!s.counts.playerBullets)break;h.advanceFor(1/60,{step:1/60,stopOnGameOver:false});}
   const events=h.recentEvents({count:300}),shots=events.filter(e=>e.type==='player_shot'),kills=events.filter(e=>e.type==='enemy_killed');
   if(shots.length!==1||shots[0].shots!==1||shots[0].dual||shots[0].shotXs.length!==1)throw Error('Not exactly one ordinary single-ship shot');
   if(h.snapshot().counts.playerBullets)throw Error('Bullet did not resolve');
   return {initial,targets,before,targetBefore,trace,shots,kills,final:h.snapshot()};
  });
 });
 assert.equal(result.before.player.x,140);assert.equal(result.before.player.vx,0);assert.equal(result.shots[0].shotXs[0],140);
 assert(result.kills.some(event=>event.id===214629079&&event.t===14.217),'Retained late-hit witness missing');
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({methodHash:hash(__filename),bundleHash:hash(path.join(root,'index.html')),method:'One preselected center140 normal Space shot at14.1s,seed9131 human launch,controlled60Hz and paused performance clock. No assigned positions. Prediction selected from retained nofire trace before candidate editing.',result},null,2)+'\n');
 console.log(JSON.stringify({out,bundle:hash(path.join(root,'index.html')),shot:result.shots,kills:result.kills,targetBefore:result.targetBefore},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});

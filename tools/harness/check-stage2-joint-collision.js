#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(process.argv[2]||'private-artifacts/stage2-decision-replay-oct20-v3');
const receipt=JSON.parse(fs.readFileSync(path.join(dir,'receipt.json')));
const retained=receipt.profile==='retained-low-tail';
const trace=JSON.parse(fs.readFileSync(path.join(path.dirname(receipt.runs.capture.files[0]),'decision-trace.json')));
const frame=trace.find(f=>f.kind==='pre-bullet'&&Math.abs(f.t-(retained?329.65:8.817))<.001);
assert(frame,'Missing pre-bullet state');
const decision=trace.find(f=>f.kind==='decision'&&Math.abs(f.t-frame.t)<1e-8);assert(decision);
const combat=fs.readFileSync(path.join(dir,'combat.js'),'utf8');
const start=combat.indexOf('function updateEnemyBullets('),end=combat.indexOf('\nfunction ',combat.indexOf('function updateEnemyBodyCollisions(')+10);
assert(start>=0&&end>start);
function simulate(axis,mirror=false,offset=0){
 const state=JSON.parse(JSON.stringify(frame.state)),p={...frame.p};
 const transform=x=>(mirror?280-x:x)+offset;
 p.x=Math.max(frame.playerBox.w+2,Math.min(280-frame.playerBox.w-2,transform(decision.p.x)+axis*decision.p.s*decision.dt*decision.cfg.moveMul));
 for(const e of state.e)e.x=transform(e.x);
 for(const b of state.eb){b.x=transform(b.x);if(mirror)b.vx=-b.vx;}
 const boxes=new Map(frame.enemyBoxes.map(e=>[e.id,e.box])),losses=[];
 const ctx=vm.createContext({PLAY_H:360,PLAY_W:280,playerHitbox:()=>frame.playerBox,enemyCollisionHitbox:e=>boxes.get(e.id),ex:()=>{},
  loseShip:(s,e)=>{losses.push(e);p.spawn=1;},playLane:x=>Math.max(0,Math.min(9,Math.round(x/280*9)))});
 vm.runInContext(combat.slice(start,end),ctx);
 ctx.updateEnemyBullets(state,frame.dt,p);
 ctx.updateEnemyBodyCollisions(state,p);
 return {axis,x:p.x,losses};
}
const normal=[-1,0,1].map(a=>simulate(a));
const mirrored=[-1,0,1].map(a=>simulate(a,true));
for(const a of normal){const m=mirrored.find(b=>b.axis===-a.axis);assert.equal(a.losses.length,m.losses.length);assert(Math.abs(a.x+m.x-280)<1e-8);}
if(retained){
 assert(normal.find(a=>a.axis===decision.axis).losses.some(l=>l.enemyId===751477004),'Recorded retained collision must reproduce');
}else{
 assert.equal(normal.find(a=>a.axis===1).losses[0]?.cause,'enemy_collision');
 assert.equal(normal.find(a=>a.axis===0).losses.length,0);
 assert.equal(normal.find(a=>a.axis===-1).losses.length,0);
}
const edges=[{name:'left',offset:9-decision.p.x},{name:'right',offset:271-decision.p.x}].map(e=>({...e,results:[-1,0,1].map(a=>simulate(a,false,e.offset))}));
for(const e of edges)for(const r of e.results)assert(r.x>=9&&r.x<=271);
assert.equal(edges[0].results[0].x,9);assert.equal(edges[1].results[2].x,271);
const report={ok:true,packet:dir,frameTime:frame.t,normal,mirrored,edges,
  limitations:['One-frame endpoint replay with frozen enemy trajectory, not a future-safe path.','Mirrored and translated edge worlds are synthetic; offscreen hazards are not respawned.',retained?'Retained source diagnostic; no repair acceptance is implied.':'This reconstructs rejected deadband7, not a new accepted controller.']};
if(process.argv.includes('--candidate')){
 const flow=fs.readFileSync(path.resolve(__dirname,'../../src/js/05-player-flow.js'),'utf8');
 const boot=fs.readFileSync(path.join(dir,'boot.js'),'utf8');
 report.candidateHash=require('node:crypto').createHash('sha256').update(flow).digest('hex');
 report.candidateChoices=[];
 for(const variant of [{name:'recorded',mirror:false,offset:0},{name:'mirrored',mirror:true,offset:0},...edges.map(e=>({...e,mirror:false}))]){
  const s=JSON.parse(JSON.stringify(decision.state)),p={...decision.p};
  const transform=x=>(variant.mirror?280-x:x)+variant.offset;
  p.x=transform(p.x);for(const e of s.e)e.x=transform(e.x);
  for(const b of s.eb){b.x=transform(b.x);if(variant.mirror)b.vx=-b.vx;}
  const boxes=new Map(decision.enemyBoxes.map(e=>[e.id,e.box]));
  const ctx=vm.createContext({window:{},PLAY_W:280,cl:(x,a,b)=>Math.max(a,Math.min(b,x)),isAuroraRuntimeState:x=>x===s,currentAuroraRuntimeState:()=>s,playerHitbox:()=>decision.playerBox,enemyCollisionHitbox:e=>boxes.get(e.id)});
  vm.runInContext(boot.match(/^const playLane=.*;$/m)[0]+'\n'+flow.slice(flow.indexOf('function harnessTargetScore('),flow.indexOf('function runHarnessPlayer(')),ctx);
  const preferred=ctx.harnessMoveAxis(s,p,decision.cfg),axis=ctx.harnessResolveHazardAxis(s,p,decision.cfg,preferred,decision.dt);
  const outcome=simulate(axis,variant.mirror,variant.offset);
  assert.equal(outcome.losses.length,0,`Candidate selected unsafe endpoint: ${variant.name}`);
  report.candidateChoices.push({name:variant.name,preferred,axis,...outcome});
 }
}
fs.writeFileSync(path.join(dir,process.argv.includes('--candidate')?'candidate-collision-check.json':'joint-collision-check.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));

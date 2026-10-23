#!/usr/bin/env node
// Offline reachability against recorded hazards, not a full counterfactual game.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve(process.argv[2]);
const read=p=>JSON.parse(fs.readFileSync(p));
const receipt=read(path.join(dir,'receipt.json'));
assert(['retained-low-tail','stage2-retained-loss'].includes(receipt.profile));
const impactTime=receipt.profile==='stage2-retained-loss'?12.467:329.65;
const tracePath=path.join(path.dirname(receipt.runs.capture.files[0]),'decision-trace.json');
const trace=read(tracePath);
const decisions=trace.filter(f=>f.kind==='decision'&&f.t<=impactTime+.001);
const frames=decisions.map(d=>({d,b:trace.find(f=>f.kind==='pre-bullet'&&Math.abs(f.t-d.t)<1e-8)}));
assert(frames.length>1&&frames.every(f=>f.b));
const combat=fs.readFileSync(path.join(dir,'combat.js'),'utf8');
const start=combat.indexOf('function updateEnemyBullets(');
const end=combat.indexOf('\nfunction ',combat.indexOf('function updateEnemyBodyCollisions(')+10);
assert(start>=0&&end>start);
function step(frame,x,axis){
 const {d,b}=frame,state=structuredClone(b.state),p={...b.p};
 p.x=Math.max(b.playerBox.w+2,Math.min(280-b.playerBox.w-2,x+axis*d.p.s*d.dt*d.cfg.moveMul));
 const boxes=new Map(b.enemyBoxes.map(e=>[e.id,e.box])),losses=[];
 const ctx=vm.createContext({PLAY_H:360,PLAY_W:280,playerHitbox:()=>b.playerBox,
  enemyCollisionHitbox:e=>boxes.get(e.id),ex:()=>{},
  loseShip:(s,e)=>{losses.push(e);p.spawn=1;},playLane:x=>Math.max(0,Math.min(9,Math.round(x/280*9)))});
 vm.runInContext(combat.slice(start,end),ctx);
 ctx.updateEnemyBullets(state,b.dt,p);ctx.updateEnemyBodyCollisions(state,p);
 return {x:p.x,safe:losses.length===0};
}
const windows=[];
for(let i=0;i<frames.length;i++){
 let reachable=new Map([[frames[i].d.p.x.toFixed(6),{x:frames[i].d.p.x,axes:[]}]]);
 for(const f of frames.slice(i)){
  const next=new Map();
  for(const r of reachable.values())for(const axis of [-1,0,1]){
   const s=step(f,r.x,axis);
   if(s.safe&&!next.has(s.x.toFixed(6)))next.set(s.x.toFixed(6),{x:s.x,axes:[...r.axes,axis]});
  }
  reachable=next;if(!reachable.size)break;
 }
 windows.push({start:frames[i].d.t,secondsBeforeImpact:frames.at(-1).d.t-frames[i].d.t,
  reachableEndpoints:reachable.size,witness:reachable.values().next().value||null});
}
assert.equal(windows.at(-1).reachableEndpoints,0,'Last-frame trap must reproduce');
const report={controllerHash:receipt.controllerHash,seed:receipt.seed,
 traceHash:crypto.createHash('sha256').update(fs.readFileSync(tracePath)).digest('hex'),
 methodHash:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
 latestRecordedStartWithEscape:windows.filter(w=>w.reachableEndpoints).at(-1)||null,windows,
 limitations:['Recorded enemy and bullet paths are held fixed. Alternate firing, kills and targeting are not simulated.',
 'Endpoint collision checks match the game; this does not establish continuous swept safety.',
 'One encounter only. A witness is a diagnostic route, not an accepted controller or proof of human feasibility.']};
fs.writeFileSync(path.join(dir,'escape-window.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));

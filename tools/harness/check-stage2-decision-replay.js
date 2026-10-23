#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir=path.resolve(process.argv[2]||'private-artifacts/stage2-decision-replay-oct20-v2');
const read=p=>JSON.parse(fs.readFileSync(p));
const receipt=read(path.join(dir,'receipt.json'));
const retained=receipt.profile==='retained-low-tail';
const freshLoss=receipt.profile==='stage2-retained-loss';
const session=name=>read(receipt.runs[name].files.find(p=>p.endsWith('.json')&&!p.endsWith('-system-status.json'))).session;
const control=session('control'),capture=session('capture');
const eventTypes=['player_shot','enemy_killed','enemy_damaged','ship_lost','stage_clear','game_over'];
assert.deepEqual(capture.events.filter(e=>eventTypes.includes(e.type)),control.events.filter(e=>eventTypes.includes(e.type)),'Instrumentation changed gameplay events');
assert.equal(receipt.runs.control.state.score,retained?96450:freshLoss?3900:4540,'Recorded score not reproduced');
const losses=control.events.filter(e=>e.type==='ship_lost');
assert.equal(losses.length,retained?2:1);assert.equal(losses[0].t,retained?329.65:freshLoss?12.467:8.817);assert.equal(losses[0].enemyId,retained?751477004:freshLoss?711405630:248693119);
const runDir=path.dirname(receipt.runs.capture.files[0]);
const trace=read(path.join(runDir,'decision-trace.json'));
const flow=fs.readFileSync(path.join(dir,'controller.js'),'utf8');
const combat=fs.readFileSync(path.join(dir,'combat.js'),'utf8');
const boot=fs.readFileSync(path.join(dir,'boot.js'),'utf8');
const section=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x);return s.slice(x,y);};
const decisions=[];
for(const frame of trace.filter(f=>f.kind==='decision')){
  const state=frame.state,p=frame.p,boxes=new Map(frame.enemyBoxes.map(e=>[e.id,e.box]));
  const ctx=vm.createContext({window:{},PLAY_W:280,cl:(x,a,b)=>Math.max(a,Math.min(b,x)),
    isAuroraRuntimeState:s=>s===state,currentAuroraRuntimeState:()=>state,
    playerHitbox:()=>frame.playerBox,enemyCollisionHitbox:e=>boxes.get(e.id)});
  const lane=boot.match(/^const playLane=.*;$/m);assert(lane);
  vm.runInContext(lane[0]+'\n'+section(flow,'function harnessTargetScore(','function runHarnessPlayer('),ctx);
  const visits=[];
  for(const name of ['harnessLowerFieldThreat','harnessSelectTarget']){
    const fn=ctx[name];ctx[name]=(...args)=>{const r=fn(...args);visits.push({name,id:r?.id??null});return r;};
  }
  const preferred=ctx.harnessMoveAxis(state,p,frame.cfg);
  const actual=ctx.harnessResolveHazardAxis(state,p,frame.cfg,preferred,frame.dt);
  assert.equal(preferred,frame.preferredAxis);assert.equal(actual,frame.axis);
  const branch=visits.some(v=>v.name==='harnessSelectTarget')?'target-pursuit':visits.length?'body-avoidance':'bullet-avoidance';
  decisions.push({t:frame.t,preferred,actual,branch,visits,playerX:p.x});
}
const hit=trace.find(f=>f.kind==='body-collision'&&Math.abs(f.t-losses[0].t)<.001);
assert(hit,'Missing collision-phase state');
const before=trace.find(f=>f.kind==='decision'&&Math.abs(f.t-hit.t)<1e-8);assert(before);
const alternatives=[];
for(const axis of [-1,0,1]){
  const state=JSON.parse(JSON.stringify(hit.state)),p={...hit.p};
  p.x=Math.max(hit.playerBox.w+2,Math.min(280-hit.playerBox.w-2,before.p.x+axis*before.p.s*before.dt*before.cfg.moveMul));
  const boxes=new Map(hit.enemyBoxes.map(e=>[e.id,e.box])),deaths=[];
  const ctx=vm.createContext({playerHitbox:()=>hit.playerBox,enemyCollisionHitbox:e=>boxes.get(e.id),
    ex:()=>{},loseShip:(s,e)=>{deaths.push(e);p.spawn=1;},playLane:x=>Math.max(0,Math.min(9,Math.round(x/280*9)))});
  vm.runInContext(section(combat,'function updateEnemyBodyCollisions(','function '),ctx);
  ctx.updateEnemyBodyCollisions(state,p);
  alternatives.push({axis,x:p.x,bodyCollisions:deaths.map(d=>d.enemyId)});
}
assert(alternatives.find(a=>a.axis===before.axis).bodyCollisions.includes(losses[0].enemyId),'Actual collision not reproduced');
const report={ok:true,baseline:receipt.baseline,controllerHash:receipt.controllerHash,packet:dir,
  traceHash:crypto.createHash('sha256').update(fs.readFileSync(path.join(runDir,'decision-trace.json'))).digest('hex'),
  exactDecisionReplays:decisions.length,instrumentationGameplayEventsEqual:true,loss:losses[0],
  decisions,alternatives,
  limitations:[retained||freshLoss?'Retained policy; one diagnostic seed only.':'Rejected deadband7 policy, not retained policy.','Counterfactuals change only the player endpoint at the recorded collision phase; they are not alternate full simulations or bullet-safety guarantees.','Mirrored and boundary encounter validation remains pending.']};
fs.writeFileSync(path.join(dir,'replay-check.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,exactDecisionReplays:decisions.length,loss:report.loss,alternatives},null,2));

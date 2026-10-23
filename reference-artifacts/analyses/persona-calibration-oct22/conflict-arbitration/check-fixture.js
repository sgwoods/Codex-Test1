const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const packet=path.resolve('private-artifacts/stage2-retained-loss-oct22'),receipt=require(packet+'/receipt.json');
const trace=JSON.parse(fs.readFileSync(path.join(path.dirname(receipt.runs.capture.files[0]),'decision-trace.json')));
const frames=trace.filter(f=>f.kind==='decision'&&f.t<=12.467);
const combat=fs.readFileSync(packet+'/combat.js','utf8'),boot=fs.readFileSync(packet+'/boot.js','utf8');
const collision=combat.slice(combat.indexOf('function updateEnemyBullets('),combat.indexOf('\nfunction ',combat.indexOf('function updateEnemyBodyCollisions(')+10));
function simulate(source,variant){
 const flow=fs.readFileSync(source,'utf8'),rows=[];let observation=null,x=variant.mirror?280-frames[0].p.x:frames[0].p.x;x+=variant.offset;
 for(const f of frames){
  const pre=trace.find(g=>g.kind==='pre-bullet'&&Math.abs(g.t-f.t)<1e-8);assert(pre);
  const transform=n=>(variant.mirror?280-n:n)+variant.offset;
  function stateClone(s){s=structuredClone(s);s.simT=f.t;s.lives=2;s.captureCountStage=0;for(const e of s.e){e.x=transform(e.x);if(variant.mirror)e.vx=-(e.vx||0);}for(const b of s.eb){b.x=transform(b.x);if(variant.mirror)b.vx=-(b.vx||0);}return s;}
  let state=stateClone(f.state),p={...f.p,x,hHazardObservation:observation};
  const boxes=new Map(f.enemyBoxes.map(e=>[e.id,e.box])),losses=[];
  const ctx=vm.createContext({window:{},PLAY_W:280,PLAY_H:360,VIS:{beamLen:180},canCapture:()=>false,enemyHasActiveBeam:()=>false,cl:(v,a,b)=>Math.max(a,Math.min(b,v)),isAuroraRuntimeState:s=>s===state,currentAuroraRuntimeState:()=>state,playerHitbox:()=>f.playerBox,enemyCollisionHitbox:e=>boxes.get(e.id),ex:()=>{},loseShip:(s,e)=>{losses.push(e);p.spawn=1;}});
  vm.runInContext(boot.match(/^const playLane=.*;$/m)[0]+'\n'+flow.slice(flow.indexOf('function harnessTargetScore('),flow.indexOf('function runHarnessPlayer('))+'\n'+collision,ctx);
  const body=ctx.harnessLowerFieldThreat(state,p,f.cfg),bullet=state.eb.filter(b=>b.vy>0&&b.y<p.y&&p.y-b.y<f.cfg.urgentLook&&Math.abs(b.x-p.x)<f.cfg.urgentDx).sort((a,b)=>(p.y-a.y)-(p.y-b.y))[0];
  const preferred=ctx.harnessMoveAxis(state,p,f.cfg),axis=ctx.harnessResolveHazardAxis(state,p,f.cfg,preferred,f.dt);
  observation=p.hHazardObservation;x=Math.max(f.playerBox.w+2,Math.min(280-f.playerBox.w-2,x+axis*p.s*f.dt*f.cfg.moveMul));p.x=x;
  state=stateClone(pre.state);ctx.updateEnemyBullets(state,pre.dt,p);ctx.updateEnemyBodyCollisions(state,p);
  if(source.endsWith('/baseline.js')&&variant.name==='recorded'){
   assert.equal(axis,f.axis,'Baseline action must reproduce recorded action');
   assert(Math.abs(x-pre.p.x)<1e-8,'Baseline position must reproduce recorded position');
  }
  assert(x>=9&&x<=271);rows.push({t:f.t,preferred,axis,x,body:body?{id:body.id,x:body.x,y:body.y}:null,bullet:bullet?{x:bullet.x,y:bullet.y}:null,losses});if(losses.length)break;
 }
 return{variant:variant.name,losses:rows.reduce((n,r)=>n+r.losses.length,0),frames:rows.length,rows};
}
const variants=[{name:'recorded',mirror:false,offset:0},{name:'mirror',mirror:true,offset:0},{name:'left-edge',mirror:false,offset:9-frames[0].p.x},{name:'right-edge',mirror:false,offset:271-frames[0].p.x}];
const results=[];for(const variant of variants)for(const policy of ['baseline','candidate'])results.push({policy,...simulate(__dirname+'/'+policy+'.js',variant)});
const pass=variants.every(({name:v})=>results.find(r=>r.variant===v&&r.policy==='baseline').losses===1&&results.find(r=>r.variant===v&&r.policy==='candidate').losses===0);
fs.writeFileSync(__dirname+'/fixture-results.json',JSON.stringify({pass,limitations:['Recorded enemy/bullet trajectories held fixed; firing/kills are not recomputed.','Boundary translations are synthetic; only player bounds asserted, not universal safety.','Capture beams disabled in fixture; encounter has none.'],results},null,2));console.log(JSON.stringify({pass,results:results.map(({rows,...r})=>r)},null,2));process.exitCode=pass?0:1;

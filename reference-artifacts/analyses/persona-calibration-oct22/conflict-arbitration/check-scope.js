const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const packet=path.resolve('private-artifacts/stage2-retained-loss-oct22'),receipt=require(packet+'/receipt.json');
const frames=JSON.parse(fs.readFileSync(path.join(path.dirname(receipt.runs.capture.files[0]),'decision-trace.json'))).filter(f=>f.kind==='decision');
const boot=fs.readFileSync(packet+'/boot.js','utf8'),sources=Object.fromEntries(['baseline','candidate'].map(p=>[p,fs.readFileSync(__dirname+'/'+p+'.js','utf8')]));
function run(policy,frame,stage,challenge,name,empty=false){
 const state=structuredClone(frame.state),p=structuredClone(frame.p),cfg={...frame.cfg,name};Object.assign(state,{stage,challenge,simT:frame.t,lives:0,captureCountStage:1});if(empty){state.e=[];state.eb=[];}
 const boxes=new Map(frame.enemyBoxes.map(e=>[e.id,e.box]));let calls=0;
 const ctx=vm.createContext({window:{},PLAY_W:280,VIS:{beamLen:180},canCapture:()=>{calls++;return true;},enemyHasActiveBeam:()=>true,cl:(x,a,b)=>Math.max(a,Math.min(b,x)),isAuroraRuntimeState:s=>s===state,currentAuroraRuntimeState:()=>state,playerHitbox:()=>frame.playerBox,enemyCollisionHitbox:e=>boxes.get(e.id)});
 vm.runInContext(boot.match(/^const playLane=.*;$/m)[0]+'\n'+sources[policy].slice(sources[policy].indexOf('function harnessTargetScore('),sources[policy].indexOf('function runHarnessPlayer(')),ctx);
 const preferred=ctx.harnessMoveAxis(state,p,cfg),axis=ctx.harnessResolveHazardAxis(state,p,cfg,preferred,frame.dt);
 return{preferred,axis,calls,captureRisk:!!p.hCaptureRiskSpent};
}
let cases=0;
for(const f of frames){
 for(const [stage,challenge,name] of [[1,false,'professional'],[2,true,'professional'],[3,true,'professional'],[4,false,'professional'],[5,false,'professional'],[2,false,'expert'],[2,false,'advanced'],[2,false,'novice']]){assert.deepEqual(run('candidate',f,stage,challenge,name),run('baseline',f,stage,challenge,name));cases++;}
 const empty=run('candidate',f,2,false,'professional',true);assert.equal(empty.axis,empty.preferred);cases++;
 const stage2=run('candidate',f,2,false,'professional');assert.equal(stage2.calls,0,'Stage2 must not invoke capture-beam policy');assert.equal(stage2.captureRisk,false);cases++;
}
fs.writeFileSync(__dirname+'/scope-results.json',JSON.stringify({pass:true,cases,coverage:'Recorded-state variants: out-of-scope action/capture parity, empty-world no override, Stage2 beam policy not invoked.',limitations:['Synthetic scope fixtures, not mode integration or full-game validation.']},null,2));console.log({pass:true,cases});

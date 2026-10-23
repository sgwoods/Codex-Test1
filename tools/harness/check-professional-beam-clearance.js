#!/usr/bin/env node
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const flow=fs.readFileSync(process.argv[2]||path.join(root,'src/js/05-player-flow.js'),'utf8');
const capture=fs.readFileSync(path.join(root,'src/js/07-capture-rescue.js'),'utf8');
const entity=fs.readFileSync(path.join(root,'src/js/14-entity-model.js'),'utf8');
const section=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
let checks=0;
function fixture({px=140,py=335,ex=140,ey=170,hp=1,beam=1,beamT=2,dual=0,spawn=0,captured=0,pending=0,inv=0,lives=2,stage=8,challenge=false,count=0,carry=0,preferred=0,persona='professional',bullets=[],spent=true}={}){
 const p={x:px,y:py,s:440,spawn,dual,captured,pending,inv,hCaptureRiskSpent:spent};
 const state={p,stage,challenge,lives,captureCountStage:count,e:[{id:1,hp,x:ex,y:ey,beam,beamT,carry}],eb:bullets};
 const ctx=vm.createContext({PLAY_W:280,VIS:{beamLen:300},cl:(x,a,b)=>Math.max(a,Math.min(b,x)),
  isAuroraRuntimeState:s=>s===state,currentAuroraRuntimeState:()=>state,
  playerHitbox:()=>({w:7,h:6}),enemyCollisionHitbox:()=>({w:4,h:4})});
 vm.runInContext(section(entity,'function enemyHasCaptureState(','function enemyChallengeUpperBandY(')+
  section(capture,'function hasCarriedFighter(','function capturePlayer(')+
  section(flow,'function harnessResolveHazardAxis(','function runHarnessPlayer('),ctx);
 return ctx.harnessResolveHazardAxis(state,p,{name:persona,moveMul:.84},preferred,1/60);
}
const check=(name,fn)=>{fn();checks++;};
check('Visible beam breaks aligned hold',()=>assert.notEqual(fixture(),0));
check('First opportunity permitted with spare ships',()=>assert.equal(fixture({spent:false}),0));
check('Low reserves prohibit first opportunity',()=>assert.notEqual(fixture({spent:false,lives:1}),0));
check('Right escape',()=>assert.equal(fixture({px:145}),1));
check('Mirrored escape',()=>assert.equal(fixture({px:135}),-1));
check('Left boundary escape',()=>assert.equal(fixture({px:9,ex:9}),1));
check('Right boundary escape',()=>assert.equal(fixture({px:271,ex:271}),-1));
for(const args of [{beam:0},{dual:1},{count:1},{carry:1},{stage:2},{challenge:true},{persona:'expert'}]){
 check('Ineligible capture or excluded policy preserves hold '+JSON.stringify(args),()=>assert.equal(fixture(args),0));
}
for(const args of [{spawn:1},{captured:1},{pending:1},{lives:-1},{hp:0}]){
 check('No eligible capture '+JSON.stringify(args),()=>assert.equal(fixture(args),0));
}
check('Invulnerability alone does not prevent capture',()=>assert.notEqual(fixture({inv:2}),0));
check('Final expiry tick is still hazardous',()=>assert.notEqual(fixture({beamT:0}),0));
check('Beam activation changes an otherwise clear hold',()=>{assert.equal(fixture({beam:0}),0);assert.notEqual(fixture({beam:1}),0);});
check('Beam lower boundary excluded',()=>assert.equal(fixture({py:470}),0));
check('Just inside lower boundary hazardous',()=>assert.notEqual(fixture({py:469.99}),0));
check('Above beam and body preserves hold',()=>assert.equal(fixture({py:100}),0));
check('Unsafe beam pursuit is redirected',()=>assert.equal(fixture({px:150,preferred:-1}),1));
check('Beam avoidance still accounts for shots',()=>assert.equal(fixture({px:140,ex:140,bullets:[{x:133,y:335,vx:0,vy:160}]}),1));
console.log(JSON.stringify({ok:true,checks,limitations:['Synthetic geometry; actual capture eligibility helpers loaded.','No proof of full-run capture avoidance or safety of every selected direction.']},null,2));

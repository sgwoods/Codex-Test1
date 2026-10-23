#!/usr/bin/env node
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
const start=source.indexOf('function harnessResolveHazardAxis('),end=source.indexOf('function runHarnessPlayer(',start);
const code=end<0?source.slice(start):source.slice(start,end);
let checks=0;
function fixture(){
 const p={x:140,y:335,s:440},e={id:1,hp:1,x:130,y:300,dive:1,form:1};
 const s={stage:13,simT:1,challenge:false,e:[e],eb:[]};
 const ctx=vm.createContext({PLAY_W:280,cl:(x,a,b)=>Math.max(a,Math.min(b,x)),
  playerHitbox:()=>({w:7,h:6}),enemyCollisionHitbox:()=>({w:4,h:4}),canCapture:()=>false});
 vm.runInContext(code,ctx);
 const run=()=>ctx.harnessResolveHazardAxis(s,p,{name:'professional',moveMul:.84},0,1/60);
 run();s.simT+=1/60;e.y+=5;run();
 return {p,e,s,run};
}
function check(name,fn){fn();checks++;}
check('Repeated identical tick preserves velocity and action',()=>{const f=fixture(),before=JSON.stringify(f.p.hHazardObservation);const a=f.run();assert.equal(JSON.stringify(f.p.hHazardObservation),before);assert.equal(f.run(),a);});
for(const kind of ['stage','gap','backward','dive','form','teleport']){
 check('Invalid observation resets '+kind,()=>{const f=fixture();f.s.simT+=1/60;f.e.y+=2;
  if(kind==='stage')f.s.stage++;if(kind==='gap')f.s.simT+=1;if(kind==='backward')f.s.simT-=2;
  if(kind==='dive')f.e.dive=2;if(kind==='form')f.e.form=0;if(kind==='teleport')f.e.y+=100;
  f.run();assert.equal(f.p.hHazardObservation.positions[1].vy,0);
 });
}
check('Disappeared enemies are removed from cache',()=>{const f=fixture();f.s.simT+=1/60;f.s.e=[];f.run();assert.equal(Object.keys(f.p.hHazardObservation.positions).length,0);});
console.log(JSON.stringify({ok:true,checks},null,2));

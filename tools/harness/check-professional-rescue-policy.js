#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(root,'src/js',f),'utf8');
const flow=read('05-player-flow.js'),combat=read('05-player-combat.js');
const section=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
const cases=[];
function check(name,fn){fn();cases.push(name);}
function fixture(mode=3){
 const e={id:1,t:'boss',hp:1,x:140,y:170,form:1,dive:mode,carry:1,c:4,r:0};
 const p={x:140,y:335,s:440,vx:0,cd:0,spawn:0,captured:0,returning:0,dual:0,hNoShotT:0,hDebugT:0};
 const S={stage:8,challenge:false,score:0,lives:2,simT:12,p,e:[e],eb:[],pb:[],fx:[],stats:{shots:0,hits:0},harnessPersona:'professional',shake:0};
 const events=[];
 const ctx=vm.createContext({S,window:{},PLAY_W:280,PLAY_H:360,VIS:{playerBottom:25,beamLen:300},
  cl:(x,a,b)=>Math.max(a,Math.min(b,x)),isAuroraRuntimeState:s=>s===S,currentAuroraRuntimeState:()=>S,
  playerHitbox:()=>({w:7,h:6}),enemyHitbox:()=>({w:6,h:5}),enemyCollisionHitbox:()=>({w:4,h:4}),
  randUnit:()=>0,enemyRef:e=>({id:e.id}),playLane:x=>Math.floor(x/28),logEvent:(type,data)=>events.push({type,...data}),
  ex(){},clearReferenceBossMomentCueWindow(){},activeEscortCount:()=>0,
  currentGamePackEnemyKillPoints:()=>400,awardScorePoints:(s,n)=>s.score+=n,
  currentGamePack:()=>({scoring:{carriedFighter:{attacking:1000,standby:500}}}),
  sfx:{shot(){},boom(){},rescue(){},capturedFighterDestroyed(){},hit(){}},
  stageBandProfile:()=>({}),stageTune:()=>({}),currentGamePackStagePresentation:()=>({})});
 vm.runInContext(read('14-entity-model.js')+
  read('07-capture-rescue.js')+flow+combat+
  section(read('08-score-awards.js'),'function destroyCarriedFighter(','function awardRescueJoin('),ctx);
 const cfg=ctx.harnessPersonaCfg(S);
 const tick=()=>{S.simT+=1/60;p.cd=Math.max(0,p.cd-1/60);ctx.runHarnessPlayer(S,1/60,p,cfg);ctx.updatePlayerBullets(S,1/60);};
 return{S,p,e,ctx,events,cfg,tick};
}
for(const mode of [0,2,3,4,5])check('Conservative policy waits in carrying mode '+mode,()=>{
 const f=fixture(mode);for(let i=0;i<60;i++)f.tick();assert.equal(f.S.stats.shots,0);assert.equal(f.e.carry,1);
});
check('Sole carrier: retreat, formation, attack, release',()=>{
 const f=fixture(3);for(let i=0;i<60;i++)f.tick();f.e.dive=0;for(let i=0;i<60;i++)f.tick();
 assert.equal(f.S.stats.shots,0);f.e.dive=1;for(let i=0;i<60;i++)f.tick();
 assert(f.S.stats.shots>0);assert.equal(f.e.hp,0);assert(f.events.some(e=>e.type==='captured_fighter_released'));
 assert(!f.events.some(e=>e.type==='captured_fighter_destroyed'));assert.equal(f.S.cap.mode,'dock');
});
check('Regression demonstration: firing during retreat destroys captive, not boss',()=>{
 const f=fixture(3);f.ctx.shoot(f.S);for(let i=0;i<60;i++)f.ctx.updatePlayerBullets(f.S,1/60);
 assert.equal(f.e.hp,1);assert.equal(f.e.carry,0);assert(f.events.some(e=>e.type==='captured_fighter_destroyed'));
});
check('Existing airborne shot is not cancelled by new policy',()=>{
 const f=fixture(1);f.ctx.shoot(f.S);f.e.dive=3;for(let i=0;i<60;i++)f.ctx.updatePlayerBullets(f.S,1/60);
 assert(f.events.some(e=>e.type==='captured_fighter_destroyed'));
});
check('Foreground target shares protected firing column: conservatively hold fire',()=>{
 const f=fixture(3);f.S.e.unshift({id:2,t:'bee',hp:1,x:140,y:240,form:1,dive:0,carry:0});
 for(let i=0;i<30;i++)f.tick();assert.equal(f.S.stats.shots,0);
});
check('Run reset removes motion and capture budget state',()=>{
 const f=fixture();f.p.hCaptureRiskSpent=true;f.p.hHazardObservation={stage:8,t:12,positions:{}};
 f.ctx.resetHarnessHazardState(f.p);assert.equal(f.p.hCaptureRiskSpent,false);assert.equal(f.p.hHazardObservation,null);
});
check('Fresh two-player lane resets state',()=>{
 const f=fixture();f.p.hCaptureRiskSpent=true;f.p.hHazardObservation={stage:8,t:12,positions:{}};
 f.ctx.resetPlayerForTurn();assert.equal(f.p.hCaptureRiskSpent,false);assert.equal(f.p.hHazardObservation,null);
});
check('Legacy board cannot inherit another lane state',()=>{
 const f=fixture();f.p.hCaptureRiskSpent=true;f.p.hHazardObservation={stage:8,t:12,positions:{}};
 assert(f.ctx.restorePlayerTwoBoardSnapshot({version:1,stage:8,p:{x:100,y:335},e:[],pb:[],eb:[],fx:[]}));
 assert.equal(f.p.hCaptureRiskSpent,false);assert.equal(f.p.hHazardObservation,null);
});
check('Current board restores its own capture budget',()=>{
 const f=fixture();const observation={stage:8,t:12,positions:{}};
 assert(f.ctx.restorePlayerTwoBoardSnapshot({version:1,stage:8,p:{hCaptureRiskSpent:true,hHazardObservation:observation},e:[],pb:[],eb:[],fx:[]}));
 assert.equal(f.p.hCaptureRiskSpent,true);assert.equal(JSON.stringify(f.p.hHazardObservation),JSON.stringify(observation));
});
console.log(JSON.stringify({ok:true,checks:cases.length,cases,limitations:[
 'Real controller, carried-fighter geometry and bullet resolution; static enemies and simplified hitboxes/presentation.',
 'Only mode 1 is selected for rescue; engine also permits 2/4/5. This is conservative pilot policy, not a rule change.',
 'In-flight shots can still destroy a captive after enemy-state changes. No guarantee of every rescue.'
]},null,2));

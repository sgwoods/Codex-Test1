// Enemy spawning, stage flow, combat, capture, and game-state updates.

function start(){
 stopAttractLoop();
 try{document.activeElement?.blur?.()}catch{}
 if(typeof resetActiveInputState==='function')resetActiveInputState('game_start');
 if(typeof closeAccountPanel==='function')closeAccountPanel();
 if(typeof closeLeaderboardPanel==='function')closeLeaderboardPanel();
 if(typeof closeSettings==='function')closeSettings();
 if(typeof closeHelp==='function'&&helpOpen)closeHelp(1);
 if(typeof closeFeedback==='function'&&feedbackOpen)closeFeedback(1);
 if(typeof closeMoviePanel==='function'&&typeof isMoviePanelOpen==='function'&&isMoviePanelOpen())closeMoviePanel(1);
 resetSession('game_start');
 autoExportedSessionId='';
 const cfg=saveTestCfg();
 setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
 aud=1;AC().resume?.();
 gameOverHtml='';gameOverState=null;
 started=1;paused=0;Object.assign(S,{score:0,lives:Math.max(0,cfg.ships-1),stage:cfg.stage,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,rogue:0,alertT:0,forceChallenge:cfg.challenge?1:0,liveCount:40,recoverT:0,attackGapT:0,nextStageT:0,postChallengeT:0,pendingStage:0,lastChallengeClearT:null,challengeTransitionStallLogged:0,sequenceT:0,sequenceMode:'',attract:0});
 if(typeof syncPauseUi==='function')syncPauseUi();
 S.harnessPersona=(window.__auroraHarnessPersona||'').toLowerCase();
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{x:PLAY_W/2,y:PLAY_H-VIS.playerBottom,inv:0,dual:0,captured:0,returning:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0,vx:0});
 logEvent('game_start',{persona:S.harnessPersona||null});
 startRunRecording();
 spawnStage();msg.textContent='';sfx.start();
 c?.focus?.();
}

function fillPat(px,py,s,pat,col){if(!pat||!col)return;ctx.fillStyle=col;for(const p of pat)ctx.fillRect(px+p[0]*s,py+p[1]*s,s,s)}
function drawPix(px,py,s,pat,col,col2,pat2=null,col3='',pat3=null){fillPat(px,py,s,pat,col);if(pat2)fillPat(px,py,s,pat2,col2);else if(col2){ctx.fillStyle=col2;ctx.fillRect(px-s,py+s*2,s*2,s);ctx.fillRect(px+s*3,py+s*2,s*2,s)}if(pat3)fillPat(px,py,s,pat3,col3)}
function ex(x,y,n=10,col='#fff'){
 for(let i=0;i<n;i++)S.fx.push({x,y,vx:rnd(178,-178),vy:rnd(178,-178),t:rnd(.22,.08),r:rnd(n>14?2.1:1.5,.55),c:col,sq:randUnit()>.25});
 S.fx.push({x,y,vx:0,vy:0,t:n>14?.11:.08,r:n>14?10:7,c:'#fff',flash:1});
}

function loseShip(cause={}){
 const p=S.p;if(p.inv>0||p.spawn>0||p.captured)return;
 const hp=playerHitbox();
 logEvent('ship_lost',Object.assign({
  stage:S.stage,
  score:S.score,
  livesBefore:Math.max(0,S.lives+1),
  stageClock:+S.stageClock.toFixed(3),
  attackers:S.att,
  enemyBullets:S.eb.length,
  enemies:S.liveCount,
  playerX:+p.x.toFixed(2),
  playerY:+p.y.toFixed(2),
  playerLane:playLane(p.x),
  dual:!!p.dual,
  pending:!!p.pending,
  carriedEnemies:S.e.filter(e=>e.hp>0&&e.carry).length,
  timeSinceCaptureStart:S.lastCaptureStartT==null?null:+(S.stageClock-S.lastCaptureStartT).toFixed(3),
  timeSinceFighterCaptured:S.lastFighterCapturedT==null?null:+(S.stageClock-S.lastFighterCapturedT).toFixed(3),
  playerHitbox:{w:hp.w,h:hp.h}
 },cause));
 S.shake=1.1;
 S.recoverT=Math.max(S.recoverT,S.stage>=4?2.75:1.75);
 S.attackGapT=Math.max(S.attackGapT,S.stage>=4?1.9:1.42);
 S.eb.length=0;
 p.inv=2.7;
 p.cd=Math.max(p.cd,0.42);
 ex(p.x,p.y,42,'#86c7ff');
 ex(p.x,p.y,28,'#f4f8ff');
 ex(p.x,p.y,14,'#ff7f9f');
 const shipsRemaining=Math.max(0,S.lives);
 S.alertTxt=shipsRemaining>0?`SHIP DESTROYED\n${shipsRemaining===1?'ONE SHIP REMAINING':`${shipsRemaining} SHIPS REMAINING`}`:'SHIP DESTROYED';
 S.alertT=Math.max(S.alertT,1.25);
 sfx.shipHit();
 if(p.dual)p.dual=0;
 S.lives--;p.spawn=1.32;
 if(S.lives<0)gameOver();
}

function gameOver(){
 if(S.attract){
  logEvent('attract_demo_end',{score:S.score,stage:S.stage,reason:'demo_lost'});
  enterAttractScores();
  return;
 }
 logEvent('game_over',{score:S.score,stage:S.stage});
 logSnapshot('game_over');
 started=0;
 paused=0;
 if(typeof syncPauseUi==='function')syncPauseUi();
 if(VIDEO_REC.enabled)exportSession({auto:1,silent:1});
 stopRunRecording();
 gameOverState=buildGameOverState(S.score,S.stage);
 gameOverHtml=buildGameOverHtmlFromState();
 if(gameOverState&&!gameOverState.editing&&typeof submitGameOverScore==='function')submitGameOverScore();
 sfx.over();
}
function bulletsMax(){return S.p.dual?4:2}
function dualShotOffsets(){return S.p.dual?[-10,10]:[0]}
function attractMoveAxis(p){
 const hp=playerHitbox();
 const urgent=S.eb.filter(b=>b.vy>0&&b.y<p.y&&Math.abs(b.x-p.x)<34).sort((a,b)=>(p.y-a.y)-(p.y-b.y))[0];
 if(urgent){
  p.demoTargetId=null;
  p.demoTargetT=0;
  const away=urgent.x>=p.x?-1:1;
  if((away<0&&p.x>hp.w+16)||(away>0&&p.x<PLAY_W-hp.w-16))return away;
 }
 const lockedTarget=p.demoTargetId==null?null:S.e.find(e=>e.hp>0&&e.id===p.demoTargetId);
 const target=(lockedTarget&&p.demoTargetT>0)?lockedTarget:S.e.filter(e=>e.hp>0).sort((a,b)=>{
  const ap=(b.dive?1000:0)+(b.carry?250:0)+b.y;
  const bp=(a.dive?1000:0)+(a.carry?250:0)+a.y;
  return bp-ap;
 })[0];
 if(!target)return 0;
 p.demoTargetId=target.id;
 p.demoTargetT=Math.max(p.demoTargetT||0,target.dive?0.32:0.2);
 if(Math.abs(target.x-p.x)<12)return 0;
 return target.x>p.x?1:-1;
}
const HARNESS_PERSONAS={
 novice:{name:'novice',moveMul:.5,urgentDx:28,urgentLook:132,deadZone:10,aimBoss:11,aimOther:8,fireChance:.46,challengeFireChance:.42,openShotY:94,diveBias:260,carryBias:150,bossBias:80,activeBias:70,heightBias:.8,distanceBias:1.15},
 advanced:{name:'advanced',moveMul:.64,urgentDx:36,urgentLook:170,deadZone:9,aimBoss:15,aimOther:11,fireChance:.84,challengeFireChance:.82,openShotY:72,diveBias:360,carryBias:220,bossBias:135,activeBias:112,heightBias:1.02,distanceBias:.95},
 expert:{name:'expert',moveMul:.92,urgentDx:40,urgentLook:188,deadZone:6,aimBoss:18,aimOther:13,fireChance:.96,challengeFireChance:.97,openShotY:64,diveBias:560,carryBias:320,bossBias:160,activeBias:120,heightBias:1.08,distanceBias:.9},
 professional:{name:'professional',moveMul:.88,urgentDx:42,urgentLook:198,deadZone:5,aimBoss:22,aimOther:16,fireChance:.99,challengeFireChance:.995,openShotY:58,diveBias:600,carryBias:350,bossBias:175,activeBias:128,heightBias:1.12,distanceBias:.86}
};
function harnessPersonaCfg(){
 const key=(window.__auroraHarnessPersona||'').toLowerCase();
 return HARNESS_PERSONAS[key]||null;
}
function harnessTargetScore(e,p,cfg){
 return (e.dive?cfg.diveBias:0)+(e.carry?cfg.carryBias:0)+(e.t==='boss'?cfg.bossBias:0)+((!e.form||e.dive||S.challenge||e.y>cfg.openShotY)?cfg.activeBias:0)+(e.y*cfg.heightBias)-(Math.abs(e.x-p.x)*cfg.distanceBias);
}
function logProfessionalDecision(p,cfg,reason,extra={}){
 if(cfg?.name!=='professional')return;
 if(p.hDebugT>0)return;
 p.hDebugT=.75;
 logEvent('harness_professional_decision',Object.assign({
  stage:S.stage,
  score:S.score,
  lives:Math.max(0,S.lives+1),
  playerX:+p.x.toFixed(2),
  playerLane:playLane(p.x),
  noShotFor:+p.hNoShotT.toFixed(3),
  reason
 },extra));
}
function logProfessionalHandoff(p,harnessPersona,manualAxis,manualFire){
 if(harnessPersona?.name!=='professional')return;
 if(p.hDebugT>0)return;
 p.hDebugT=.75;
 logEvent('harness_professional_handoff',{
  stage:S.stage,
  score:S.score,
  lives:Math.max(0,S.lives+1),
  playerX:+p.x.toFixed(2),
  playerLane:playLane(p.x),
  spawn:+p.spawn.toFixed(3),
  captured:!!p.captured,
  returning:!!p.returning,
  manualAxis,
  manualFire:!!manualFire,
  scriptMode:!!S.scriptMode
 });
}

function keyHeldMs(...codes){
 const now=performance.now();
 let held=0;
 for(const code of codes){
  if(!keys[code])continue;
  const downAt=keyState[code]?.downAt||0;
  if(!downAt)continue;
  held=Math.max(held,now-downAt);
 }
 return held;
}
function harnessSelectTarget(p,cfg){
 return S.e.filter(e=>e.hp>0).sort((a,b)=>harnessTargetScore(b,p,cfg)-harnessTargetScore(a,p,cfg))[0]||null;
}
function harnessMoveAxis(p,cfg){
 const hp=playerHitbox();
 const urgent=S.eb.filter(b=>b.vy>0&&b.y<p.y&&p.y-b.y<cfg.urgentLook&&Math.abs(b.x-p.x)<cfg.urgentDx).sort((a,b)=>(p.y-a.y)-(p.y-b.y))[0];
 if(urgent){
  const away=urgent.x>=p.x?-1:1;
  if((away<0&&p.x>hp.w+16)||(away>0&&p.x<PLAY_W-hp.w-16))return away;
 }
 const target=harnessSelectTarget(p,cfg);
 if(!target)return 0;
 const dx=target.x-p.x;
 if(Math.abs(dx)<cfg.deadZone)return 0;
 return dx>0?1:-1;
}
function runHarnessPlayer(dt,p,cfg){
 if(p.spawn>0||p.captured)return;
 p.hNoShotT=(p.hNoShotT||0)+dt;
 p.hDebugT=Math.max(0,(p.hDebugT||0)-dt);
 const hp=playerHitbox();
 const axis=harnessMoveAxis(p,cfg);
 p.x=cl(p.x+axis*p.s*dt*cfg.moveMul,hp.w+2,PLAY_W-hp.w-2);
 const attackables=S.e.filter(e=>e.hp>0&&(!e.form||e.dive||S.challenge||e.y>cfg.openShotY));
 const target=attackables.sort((a,b)=>harnessTargetScore(b,p,cfg)-harnessTargetScore(a,p,cfg))[0]||harnessSelectTarget(p,cfg);
 logProfessionalDecision(p,cfg,'tick',{
  attackables:attackables.length,
  targetId:target?target.id:null,
  targetX:target?+target.x.toFixed(2):null,
  targetDx:target?+(target.x-p.x).toFixed(2):null,
  axis,
  cooldown:+p.cd.toFixed(3),
  playerBullets:S.pb.length
 });
 if(!target){
  logProfessionalDecision(p,cfg,'no_target',{attackables:attackables.length});
  return;
 }
 if(p.cd>0){
  logProfessionalDecision(p,cfg,'cooldown',{attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),cooldown:+p.cd.toFixed(3)});
  return;
 }
 if(S.pb.length>=bulletsMax()){
  logProfessionalDecision(p,cfg,'bullet_cap',{attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),playerBullets:S.pb.length});
  return;
 }
 const tol=target.t==='boss'?cfg.aimBoss:cfg.aimOther;
 const fireChance=S.challenge?cfg.challengeFireChance:cfg.fireChance;
 const dx=Math.abs(target.x-p.x);
 if(dx<=tol){
  if(randUnit()<=fireChance){
   shoot();
   p.hNoShotT=0;
   logProfessionalDecision(p,cfg,'shot',{attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),tol});
  }else{
   logProfessionalDecision(p,cfg,'fire_roll_miss',{attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),tol,fireChance});
  }
  return;
 }
 logProfessionalDecision(p,cfg,'not_aligned',{attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),tol,axis});
}
function runAttractPlayer(dt,p){
 if(p.spawn>0||p.captured)return;
 p.demoTargetT=Math.max(0,(p.demoTargetT||0)-dt);
 const hp=playerHitbox();
 const axis=attractMoveAxis(p);
 const targetVx=axis*p.s*.68;
 const blend=Math.min(1,p.accel*dt*.82);
 p.vx+=(targetVx-p.vx)*blend;
 if(!axis&&Math.abs(p.vx)<8)p.vx=0;
 p.x=cl(p.x+p.vx*dt,hp.w+2,PLAY_W-hp.w-2);
 if((p.x<=hp.w+2&&p.vx<0)||(p.x>=PLAY_W-hp.w-2&&p.vx>0))p.vx=0;
 const target=S.e.filter(e=>e.hp>0&&(!e.form||e.dive||e.y>72)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0]||S.e.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 if(target&&p.cd<=0&&Math.abs(target.x-p.x)<(target.t==='boss'?16:12)&&S.pb.length<bulletsMax())shoot();
}
function scriptedDiveVy(stage){
 return stageFlightTune(stage).scriptedDiveVy;
}
function randomDiveVy(stage){
 return stageFlightTune(stage).randomDiveVy;
}
function diveAccel(stage){
 return stageFlightTune(stage).diveAccel;
}

function shoot(){
 const p=S.p;
 const captureWindow=!!(p.captured&&p.capBoss&&p.capBoss.hp>0&&p.capT>.55);
 if(p.cd>0||p.spawn>0||p.returning||(!captureWindow&&p.captured))return;
 if(S.pb.length>=bulletsMax())return;
 p.cd=S.challenge?.095:.24;const y=p.y-18;
 const shotXs=dualShotOffsets().map(off=>p.x+off);
 S.stats.shots+=p.dual?2:1;
 if(p.dual)S.pb.push({x:shotXs[0],y,v:560},{x:shotXs[1],y,v:560});
 else S.pb.push({x:shotXs[0],y,v:560});
 logEvent('player_shot',{dual:!!p.dual,shots:p.dual?2:1,x:+p.x.toFixed(2),y:+y.toFixed(2),shotXs:shotXs.map(v=>+v.toFixed(2)),spread:p.dual?+(shotXs[1]-shotXs[0]).toFixed(2):0,activeBullets:S.pb.length,captureWindow});
 sfx.shot();
}

function playerBulletSegment(b){
 const x=+b.x||0,y=+b.y||0;
 return {x,top:y-16,bottom:y+2};
}

function segmentHitsTarget(seg,targetX,targetY,targetW,targetH){
 return Math.abs(seg.x-targetX)<targetW && seg.bottom>targetY-targetH && seg.top<targetY+targetH;
}

function pickScriptEnemy(type,c){
 const set=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.t===type);
 if(!set.length)return null;
 return set.sort((a,b)=>Math.abs(a.c-c)-Math.abs(b.c-c))[0];
}

function startDive(e,p,opts={}){
 if(!e)return;
 e.low=0;
 if(opts.capture&&e.t==='boss'&&canCapture()){e.dive=4;e.targetX=cl(p.x+rnd(28,-28),24,PLAY_W-24);e.targetY=132;e.vx=0;e.vy=S.stage<=2?110:120;e.shot=0;e.esc=0;logEnemyAttackStart(e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:1});return;}
 const stage1Scripted=S.stage===1&&!S.challenge;
 const steer=stage1Scripted?.42:.56;
 const jitter=stage1Scripted?18:26;
 const vyRnd=stage1Scripted?5:(S.stage<=2?8:12);
 e.dive=1;e.vx=(p.x-e.x)*steer+rnd(jitter,-jitter);e.vy=scriptedDiveVy(S.stage)+rnd(vyRnd,-vyRnd);e.shot=e.t==='boss'?2:1;
 logEnemyAttackStart(e,'dive',{targetX:+p.x.toFixed(2),scripted:1});
 if(opts.escort&&e.t==='boss')assignEscorts(e);
}

function runStage1Script(dt,p,T){
 if(!S.scriptMode)return;
 S.scriptT+=dt;
 if(S.scriptT>52){S.scriptMode=0;return;}
 while(S.scriptI<STAGE1_SCRIPT.length&&S.scriptT>=STAGE1_SCRIPT[S.scriptI].t){
  if(S.stage===1&&S.att>=1)break;
  const s=STAGE1_SCRIPT[S.scriptI++],e=pickScriptEnemy(s.type,s.c);
  startDive(e,p,{capture:!!s.capture,escort:!!s.escort});
 }
 S.scriptShotT-=dt;
 if(S.scriptShotT<=0&&S.eb.length<shotCap()){
 const order=[1,7,3,8,0,9,2,6,4,5];
 const c=order[S.scriptShotI++%order.length];
 const cand=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.c===c).sort((a,b)=>b.y-a.y)[0];
 if(cand){const aim=cl((p.x-cand.x)*T.aimMul,-T.aimClamp,T.aimClamp);fireEnemyBullet(cand,aim,T.bulletVy+S.stage*T.bulletVyStage,'script');}
 S.scriptShotT=1.35;
}
}

function updateChallengeEnemy(e,dt){
 if(e.spawn>0){e.spawn-=dt;return}
 // Challenge-stage fidelity is intentionally isolated here so we can tune the
 // first challenge pattern against reference footage without disturbing the
 // normal stage attack logic.
 const fm=familyMotion(e);
 const classicStage3=S.stage===3&&e.fam==='classic';
 e.tm+=dt*((classicStage3?.345:.355)+(e.wave||0)*.007+Math.min(.012,S.stage*.0015));
 const u=e.tm,p=e.ph,wave=e.wave||0,side=e.side||1,slot=e.slot||0,row=e.row||0,sweep=e.sweep||1;
  const laneX=PLAY_W/2+side*(48+slot*16);
  const topY=38+wave*14+row*8;
 if(u<3.15){
  const q=u/3.15,startX=side>0?PLAY_W+44:-44,curve=1-Math.pow(1-q,2);
  e.x=startX+(laneX-startX)*curve;
  e.y=topY+Math.sin(q*3.14+p)*2*fm.challengeDrop;
 }else if(u<9.7){
  const q=(u-3.15)/6.55;
  e.x=laneX+sweep*Math.sin(q*Math.PI)*28*fm.challengeSweep;
  e.y=topY+q*(classicStage3?5.8:6.5)*fm.challengeDrop+Math.sin(q*5.5+p)*(classicStage3?.82:.95);
 }else{
  const q=(u-9.7)/3.35;
  e.x=laneX-sweep*(4+q*34*fm.challengeSweep)+Math.sin(q*5.1+p)*1.2;
  e.y=topY+8+q*(classicStage3?188:198)*fm.challengeDrop;
 }
 if(e.y<=(e.upperBandY||PLAY_H*.5)){e.ub+=dt;if(S.ch){S.ch.upperBandTime+=dt;S.ch.upperBandSamples++;}}
 if(e.y>PLAY_H+34||e.x<-54||e.x>PLAY_W+54){e.hp=0;e.miss=1;}
}

function updateEnemy(e,dt,t,T,p){
 if(e.hp<=0)return;
 e.hitT=Math.max(0,(e.hitT||0)-dt);
 const cleanup=S.stage===1&&!S.challenge&&S.liveCount<=6;
 const fm=familyMotion(e);
 const pulseX=(S.stage>=8?28:S.stage>=4?34:38)*fm.pulseX,pulseY=(S.stage>=8?1.9:S.stage>=4?2.6:3.4)*fm.pulseY;
 const tx=e.tx+Math.sin(t*.92+e.r*.45)*pulseX,ty=e.ty+Math.sin(t*1.35+e.c*.55)*pulseY;
 if(!e.form){
  if(e.spawn>0){e.spawn-=dt;return}
  const stage1=S.stage===1&&!S.challenge;
  e.en+=dt*(stage1?1.02:1.35);
  const k=Math.max(0,1-e.en*(stage1?0.35:0.42));
  const sx=tx+Math.sin(e.en*(stage1?5.6:5)+e.ph)*(stage1?170:(S.stage>=6?136:150))*fm.entryX*k;
  const sy=ty+Math.cos(e.en*(stage1?4.5:4)+e.ph)*(stage1?58:(S.stage>=6?42:48))*fm.entryY*k;
  e.x+=(sx-e.x)*Math.min(1,dt*(stage1?3.1:3.6));e.y+=(sy-e.y)*Math.min(1,dt*(stage1?3:3.4));if(e.en>(stage1?2.9:2.4))e.form=1;return;
 }
 if(e.dive===5){
  S.att++;const l=S.e.find(q=>q.id===e.lead&&q.hp>0&&(q.dive===1||q.dive===4||q.dive===2));
  if(!l){e.dive=1;e.low=0;e.lead=null;e.vx=rnd(26,-26);e.vy=S.stage<=2?96:104;return}
  const { escortTrackX, escortTrackY, escortLift }=specialSquadronTuning(S.stage);
  e.x+=(l.x+e.off-e.x)*Math.min(1,dt*escortTrackX);e.y+=(l.y-escortLift-e.y)*Math.min(1,dt*escortTrackY);
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap()&&randUnit()<dt*T.diveShotRate*.55){const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);fireEnemyBullet(e,aim,T.bulletVy+S.stage*T.bulletVyStage,'escort');e.shot--;}
  return;
 }
 if(e.dive===2){
  S.att++;e.x+=Math.sin(t*6.4+e.ph)*6*dt;e.beamT-=dt;
  if(e.beam&&canCapture()&&Math.abs(p.x-e.x)<8&&p.y>e.y+12&&p.y<e.y+VIS.beamLen)capturePlayer(e);
  if(e.beamT<=0){e.beam=0;e.dive=1;e.vx=rnd(28,-28);e.vy=S.stage<=2?102:112;e.shot=1;e.esc=0}
  return;
 }
 if(e.dive===4){
  S.att++;e.x+=(e.targetX-e.x)*Math.min(1,dt*3);e.y+=e.vy*dt;
  if(e.y>=e.targetY){e.y=e.targetY;e.vx=e.vy=0;e.dive=2;e.beam=1;e.beamT=2.05}
  return;
 }
 if(e.dive===1){
  S.att++;e.vy+=diveAccel(S.stage)*fm.diveAccel*dt;e.x+=e.vx*dt+Math.sin(e.tm*7+e.ph)*13*fm.weave*dt;e.y+=e.vy*dt;
  if(!e.low&&e.y>=PLAY_H*.62){e.low=1;logEvent('enemy_lower_field',Object.assign({stage:S.stage,y:+e.y.toFixed(2),stageClock:+S.stageClock.toFixed(3),playerLane:playLane(p.x)},enemyRef(e)))}
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap()&&e.y>108&&e.y<p.y-88&&randUnit()<dt*T.diveShotRate){const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);fireEnemyBullet(e,aim,T.bulletVy+S.stage*T.bulletVyStage,'dive');e.shot--;}
  if(e.y>PLAY_H+30){e.x=tx;e.y=-26;e.vx=e.vy=0;e.dive=3;e.low=0;e.beam=0;e.esc=0}
  return;
 }
 if(e.dive===3){e.x+=(tx-e.x)*Math.min(1,dt*3.1);e.y+=(ty-e.y)*Math.min(1,dt*3.2);if(Math.hypot(tx-e.x,ty-e.y)<5){e.dive=0;e.vx=e.vy=0;e.esc=0}return}
 e.x+=(tx-e.x)*Math.min(1,dt*6);e.y+=(ty-e.y)*Math.min(1,dt*6);e.cool-=dt*(cleanup?1.8:1);
 if(S.scriptMode)return;
 const attackCap=cleanup?2:T.attackCap,diveRate=cleanup?T.diveRate*1.7:T.diveRate,stageAttackGap=!S.challenge&&(S.stage===2||S.stage>=4)&&!cleanup;
 if(e.cool<=0&&randUnit()<dt*diveRate&&S.att<attackCap&&S.recoverT<=0&&(!stageAttackGap||S.attackGapT<=0)&&!(S.stage===2&&S.stageClock<3.85)&&!(S.stage===4&&S.stageClock<3.7)&&!(S.stage===5&&S.stageClock<1.9)){
  e.cool=cleanup?rnd(1.4,.6):rnd(T.coolA,T.coolB)-S.stage*.02;
  if(e.t==='boss'&&canCapture()&&!(S.stage===2&&S.stageClock<8.2)&&randUnit()<T.capChance){e.dive=4;e.targetX=cl(p.x+rnd(34,-34),26,PLAY_W-26);e.targetY=138;e.vx=0;e.vy=S.stage<=2?116:128;e.shot=0;e.esc=0;logEnemyAttackStart(e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:0});}
  else{
   const steer=(S.stage===2?.42:S.stage===4?.31:S.stage>=5?.48:S.stage===1?.46:.56)*fm.steer;
   const jitter=(S.stage===2?22:S.stage===4?20:S.stage>=5?32:S.stage===1?24:38)*fm.jitter;
   const vyRnd=S.stage===4?14:S.stage>=5?20:S.stage===2?8:S.stage===1?6:12;
   e.dive=1;e.low=0;e.vx=(p.x-e.x)*steer+rnd(jitter,-jitter);e.vy=randomDiveVy(S.stage)*fm.diveVy+rnd(vyRnd,-vyRnd);e.shot=e.t==='boss'?2:1;logEnemyAttackStart(e,'dive',{targetX:+p.x.toFixed(2),scripted:0});if(e.t==='boss')assignEscorts(e)
  }
  if(stageAttackGap)S.attackGapT=(S.stage>=6?.82:S.stage===5?.88:S.stage===4?1.18:S.stage===2?1.08:1.18)+rnd(.12,.03);
 }
}

function update(dt){
 if((!started&&!S.attract)||paused)return;
 logCarryDebugState();
 recShotT-=dt;
 if(recShotT<=0){logSnapshot('tick');recShotT=.5;}
 S.shake=Math.max(0,S.shake-dt);S.alertT=Math.max(0,S.alertT-dt);
 S.recoverT=Math.max(0,S.recoverT-dt);S.attackGapT=Math.max(0,S.attackGapT-dt);S.nextStageT=Math.max(0,S.nextStageT-dt);
 S.sequenceT=Math.max(0,S.sequenceT-dt);
 if(!S.sequenceT&&S.sequenceMode){S.sequenceMode='';if(S.bannerMode==='captureBeat'||S.bannerMode==='rescueBeat')S.bannerMode='';}
 S.stageClock+=dt;
 const p=S.p;S.t=stageTune(S.stage,S.challenge);const T=S.t;
 if(S.attract){
  ATTRACT.timer=Math.max(0,ATTRACT.timer-dt);
  if(ATTRACT.phase==='scores'){
   for(const s of S.st){s.tw+=dt*(1.6+s.z*.9);s.y+=(10+s.z*18)*dt;if(s.y>PLAY_H+4){s.y=-4;s.x=rnd(PLAY_W)}}
   if(!ATTRACT.timer)startAttractDemo();
   return;
  }
 }
 if(S.nextStageT>0){
  if(S.nextStageT<=dt){
   logEvent('challenge_transition_spawn_commit',{
    stage:S.stage,
    pendingStage:S.pendingStage||null,
    nextStageT:+S.nextStageT.toFixed(3),
    challenge:!!S.challenge
   });
   S.nextStageT=0;
   if(S.pendingStage){S.stage=S.pendingStage;S.pendingStage=0;}
   spawnStage();
  }
  return
 }
 for(const s of S.st){s.tw+=dt*(1.6+s.z*.9);s.y+=(14+s.z*22+S.stage*.5)*dt;if(s.y>PLAY_H+4){s.y=-4;s.x=rnd(PLAY_W)}}
 p.cd=Math.max(0,p.cd-dt);p.inv=Math.max(0,p.inv-dt);p.spawn=Math.max(0,p.spawn-dt);S.banner=Math.max(0,S.banner-dt);S.fireCD=Math.max(0,S.fireCD-dt);
 if(S.postChallengeT>0){
  if(S.postChallengeT<=dt){
   logEvent('challenge_transition_timer_elapsed',{
    stage:S.stage,
    pendingStage:S.pendingStage||null,
    postChallengeT:+S.postChallengeT.toFixed(3),
    nextStageT:+S.nextStageT.toFixed(3),
    challenge:!!S.challenge,
    enemies:S.e.filter(e=>e.hp>0).length
   });
   S.postChallengeT=0;
   queueStageTransition('challengeResult');
  }else S.postChallengeT-=dt;
  return;
 }
 if(p.captured&&p.capBoss&&p.capBoss.hp>0){
  const capY=p.capBoss.y+26+Math.sin(performance.now()/140)*2.5;
  p.capT-=dt;
  p.x+=(p.capBoss.x-p.x)*Math.min(1,dt*4.1);
  p.y+=(capY-p.y)*Math.min(1,dt*3.9);
  if(p.capT<=0||Math.hypot(p.x-p.capBoss.x,p.y-capY)<8)finishCapture();
}else if(p.captured){
  breakCapture('boss_destroyed');
 }
 if(p.returning){
  const targetY=PLAY_H-VIS.playerBottom;
  p.y+=(targetY-p.y)*Math.min(1,dt*5.4)+46*dt;
  if(Math.abs(targetY-p.y)<2){
   p.y=targetY;
   p.returning=0;
  }
 }
 if(p.spawn<=0&&p.pending){p.pending=0;p.x=PLAY_W/2;p.y=PLAY_H-VIS.playerBottom;p.vx=0}
 const harnessPersona=harnessPersonaCfg();
 const leftCodes=movementLeftCodes(),rightCodes=movementRightCodes();
 const manualAxis=(rightCodes.some(code=>!!keys[code])?1:0)-(leftCodes.some(code=>!!keys[code])?1:0);
 const manualFire=!!keys.Space;
 logProfessionalHandoff(p,harnessPersona,manualAxis,manualFire);
 if(p.spawn<=0&&!p.captured&&!p.returning){
  if(S.attract)runAttractPlayer(dt,p);
 else if(harnessPersona&&!manualAxis&&!manualFire)runHarnessPlayer(dt,p,harnessPersona);
  else{
   const hp=playerHitbox();
   const leftHeld=keyHeldMs(...leftCodes);
   const rightHeld=keyHeldMs(...rightCodes);
   const heldMs=manualAxis<0?leftHeld:manualAxis>0?rightHeld:0;
   const precisionWindow=p.manualTapWindow*1000;
   const reverseWindow=p.manualReverseWindow*1000;
   const reversing=manualAxis&&Math.sign(p.vx)!==0&&Math.sign(p.vx)!==Math.sign(manualAxis);
   const precisionMove=!!manualAxis&&(heldMs>0&&heldMs<=precisionWindow||reversing&&heldMs<=reverseWindow);
   const targetSpeed=precisionMove?p.manualTapSpeed:p.s;
   const targetVx=manualAxis*targetSpeed;
   const blend=Math.min(1,(manualAxis?p.accel:p.decel)*dt);
   p.vx+=(targetVx-p.vx)*blend;
   if(!manualAxis&&Math.abs(p.vx)<8)p.vx=0;
   p.x=cl(p.x+p.vx*dt,hp.w+2,PLAY_W-hp.w-2);
   if((p.x<=hp.w+2&&p.vx<0)||(p.x>=PLAY_W-hp.w-2&&p.vx>0))p.vx=0;
  }
 }
 if(!S.attract&&!harnessPersona&&keys.Space)shoot();
 else if(!S.attract&&harnessPersona&&manualFire)shoot();

 const alive=S.e.filter(e=>e.hp>0);
 const normalStageCleared=!alive.length&&!S.challenge;
 S.liveCount=alive.length;
 if(S.challenge&&!alive.length&&!S.ch.done){
  finalizeChallengeClear();
  return;
 }
 if(S.challenge&&S.ch.done&&!alive.length&&S.pendingStage&&S.postChallengeT<=0&&S.nextStageT<=0&&!S.challengeTransitionStallLogged){
  const dtSinceClear=S.lastChallengeClearT==null?Infinity:(S.stageClock-S.lastChallengeClearT);
  if(dtSinceClear>=0.9){
   S.challengeTransitionStallLogged=1;
   logEvent('challenge_transition_stalled',{
    stage:S.stage,
    pendingStage:S.pendingStage,
    dtSinceClear:+dtSinceClear.toFixed(3),
    postChallengeT:+S.postChallengeT.toFixed(3),
    nextStageT:+S.nextStageT.toFixed(3),
    challenge:!!S.challenge,
    enemies:alive.length,
    playerBullets:S.pb.length,
    enemyBullets:S.eb.length
   });
  }
 }
 if(S.challenge&&S.ch.done&&!alive.length&&S.pendingStage&&S.postChallengeT<=0&&S.nextStageT<=0){
  const dtSinceClear=S.lastChallengeClearT==null?Infinity:(S.stageClock-S.lastChallengeClearT);
  if(dtSinceClear>=1.25){
   logEvent('challenge_transition_recovered',{stage:S.stage,pendingStage:S.pendingStage,dtSinceClear:+dtSinceClear.toFixed(3)});
   queueStageTransition('challengeResult');
   return;
  }
 }

 const t=performance.now()/1000;S.seqT-=dt;if(S.seqT<=0&&!S.challenge){S.seqT=.38;sfx.march(S.seq++)}
 const sequenceLock=S.sequenceT>0&&(S.sequenceMode==='captureBeat'||S.sequenceMode==='rescueBeat');
 if(sequenceLock)return;
 S.att=0;
 for(const e of S.e){e.tm+=dt;if(e.hp<=0)continue;if(S.challenge)updateChallengeEnemy(e,dt);else updateEnemy(e,dt,t,T,p)}
 runStage1Script(dt,p,T);

 const cleanup=!S.challenge&&S.stage===1&&alive.length<=6;
 if(!S.challenge&&!S.scriptMode&&S.fireCD<=0&&S.eb.length<shotCap()&&S.recoverT<=0&&!(S.stage>=4&&S.attackGapT>.18)&&!(S.stage===4&&S.stageClock<4.9)&&!(S.stage===5&&S.stageClock<2.8)){
  const bottoms={};for(const e of S.e)if(e.hp>0&&e.form&&!e.dive&&!e.ch){if(!bottoms[e.c]||e.y>bottoms[e.c].y)bottoms[e.c]=e}
  const list=Object.values(bottoms);
  if(list.length){
   let pool=list;
   let bulletVx=rnd(2,-2),bulletVy=154+S.stage*4;
   if(S.stage===4&&S.stageClock<12){
    // Early Stage 4 formation shots should pressure movement without coming
    // straight down the player's current lane while dive pressure is already active.
    const playerLane=playLane(p.x);
    const offLanePool=list.filter(e=>e.c!==playerLane);
    if(S.att>0&&offLanePool.length)pool=offLanePool;
    const offsetPool=list.filter(e=>Math.abs(e.x-p.x)>=26);
    if(pool===list&&offsetPool.length)pool=offsetPool;
    bulletVx=rnd(1.3,-1.3);
    bulletVy-=8;
   }
   const q=pool[(randUnit()*pool.length)|0];
   fireEnemyBullet(q,bulletVx,bulletVy,'formation');
   S.fireCD=(cleanup?rnd(.9,.45):rnd(T.globalA,T.globalB)-Math.min(.08,S.stage*.003))+(S.stage===4&&S.stageClock<12?.18:0);
  }else S.fireCD=.25;
 }

 for(let i=S.pb.length-1;i>=0;i--){const b=S.pb[i];b.y-=b.v*dt;if(b.y<-30){S.pb.splice(i,1);continue}
  const seg=playerBulletSegment(b);
  for(const e of S.e){
   if(e.hp<=0)continue;
   const cf=carriedFighterTarget(e);
   // Check the carried fighter before the boss body so manual scoring can
   // distinguish "shot the rescued fighter" from "killed the boss."
   if(cf&&segmentHitsTarget(seg,cf.x,cf.y,cf.w,cf.h)){
    S.stats.hits++;
    S.pb.splice(i,1);
    destroyCarriedFighter(e);
    break;
   }
   const h=enemyHitbox(e);
   if(e.carry&&seg.top>=e.y+8)continue;
   if(segmentHitsTarget(seg,e.x,e.y,h.w,h.h)){
    S.stats.hits++;
    S.pb.splice(i,1);
    const hpBefore=e.hp;
    e.hp--;
    e.hitT=.34;
    if(e.hp<=0){awardKill(e,e.dive);ex(e.x,e.y,16,e.t==='boss'?'#ff8cd7':e.t==='but'?'#ffb55f':e.t==='rogue'?'#ffa4c0':'#ffe563');sfx.boom(e.t);}
    else{
     logEvent('enemy_damaged',Object.assign({stage:S.stage,hpBefore,hpAfter:e.hp,playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
     if(e.t==='boss'&&hpBefore>e.hp){
      ex(e.x,e.y,8,'#fff4a8');
      sfx.bossHit();
     }else sfx.hit();
    }
    break;
   }
  }
 }

 for(let i=S.eb.length-1;i>=0;i--){const b=S.eb[i];b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>PLAY_H+30||b.x<-30||b.x>PLAY_W+30){S.eb.splice(i,1);continue}
  // Reference note for #33: original Galaga challenge stages are treated as
  // non-attacking/non-lethal bonus rounds, so player deaths remain disabled
  // while S.challenge is active.
  if(!S.challenge&&p.spawn<=0&&!p.captured){const h=playerHitbox();if(Math.abs(b.x-p.x)<h.w&&Math.abs(b.y-p.y)<h.h){S.eb.splice(i,1);loseShip({cause:'enemy_bullet',bulletKind:b.kind||'unknown',sourceId:b.sourceId||null,sourceType:b.sourceType||null,sourceDive:b.sourceDive??null,bulletX:+b.x.toFixed(2),bulletY:+b.y.toFixed(2),bulletLane:playLane(b.x),bulletVx:+b.vx.toFixed(2),bulletVy:+b.vy.toFixed(2)});}}}

 for(const e of S.e){if(e.hp<=0||p.spawn>0||p.captured||p.returning)continue;const he=enemyCollisionHitbox(e),hp=playerHitbox();if(Math.abs(e.x-p.x)<he.w+hp.w&&Math.abs(e.y-p.y)<he.h+hp.h){e.hp=0;ex(e.x,e.y,12,'#fff');loseShip({cause:'enemy_collision',enemyId:e.id,enemyType:e.t,enemyDive:e.dive,enemyX:+e.x.toFixed(2),enemyY:+e.y.toFixed(2),enemyLane:playLane(e.x),enemyForm:!!e.form,challenge:!!S.challenge});}}

 if(S.cap){
  S.cap.t-=dt;
  if(S.cap.mode==='dock'){
   S.cap.spin=(S.cap.spin||0)+dt*8.8;
   const side=S.cap.side||1;
   const targetX=cl(p.x+side*(p.dual?14:10),14,PLAY_W-14);
   const targetY=p.y-2;
   S.cap.x+=(targetX-S.cap.x)*Math.min(1,dt*3.8)+(S.cap.vx||0)*dt;
   S.cap.y+=(targetY-S.cap.y)*Math.min(1,dt*2.8)+(S.cap.vy||0)*dt;
   S.cap.vy=Math.max(0,(S.cap.vy||0)-92*dt);
   if(S.cap.t<=0||S.cap.y>PLAY_H+32)S.cap=null;
   else if(!p.captured&&p.spawn<=0&&Math.abs(S.cap.x-targetX)<5&&Math.abs(S.cap.y-targetY)<5)awardRescueJoin(1);
  }else{
   S.cap.y+=S.cap.vy*dt;
   if(S.cap.t<=0||S.cap.y>PLAY_H+30)S.cap=null;
   else if(Math.abs(S.cap.x-p.x)<12&&Math.abs(S.cap.y-p.y)<10&&!p.captured&&p.spawn<=0)awardRescueJoin(0)
  }
 }
 if(normalStageCleared){
  // Let a released captured fighter finish its return/join flow before the
  // stage transition starts. Without this, killing the last carrying boss on
  // descent can queue stage clear immediately and skip the dual-fighter join.
  if(S.cap)return;
  if(S.attract){logEvent('attract_demo_end',{score:S.score,stage:S.stage,reason:'stage_clear'});enterAttractScores();return}
  logEvent('stage_clear',{stage:S.stage,score:S.score});
  S.stage++;
  queueStageTransition();
  return
 }
 for(let i=S.fx.length-1;i>=0;i--){const f=S.fx[i];f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.985;f.vy*=.985;if(f.t<=0)S.fx.splice(i,1)}
}

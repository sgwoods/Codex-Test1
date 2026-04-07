// Aurora-specific player lifecycle, harness control, and manual movement helpers.

function start(){
 if(typeof currentGamePackPlayable==='function'&&!currentGamePackPlayable()){
  showToast('This pack is a shell preview only for now.');
  return;
 }
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
started=1;paused=0;Object.assign(S,{score:0,lives:Math.max(0,cfg.ships-1),stage:cfg.stage,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,rogue:0,alertT:0,forceChallenge:cfg.challenge?1:0,liveCount:40,recoverT:0,attackGapT:0,nextStageT:0,postChallengeT:0,pendingStage:0,lastChallengeClearT:null,challengeTransitionStallLogged:0,sequenceT:0,sequenceMode:'',attract:0,simT:0});
 if(typeof resetHarnessFrameClock==='function')resetHarnessFrameClock();
 if(typeof syncPauseUi==='function')syncPauseUi();
 S.harnessPersona=(window.__platinumHarnessPersona||window.__auroraHarnessPersona||'').toLowerCase();
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{x:PLAY_W/2,y:PLAY_H-VIS.playerBottom,inv:0,dual:0,captured:0,returning:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0,vx:0});
 logEvent('game_start',{persona:S.harnessPersona||null});
 startRunRecording();
 spawnStage();msg.textContent='';sfx.start();
 c?.focus?.();
}

function loseShip(cause={}){
 const p=S.p;if(p.inv>0||p.spawn>0||p.captured)return;
 const dualLoss=!!p.dual;
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
 const shipsRemaining=dualLoss?Math.max(0,S.lives+1):Math.max(0,S.lives);
 S.alertTxt=shipsRemaining>0?`SHIP DESTROYED\n${shipsRemaining===1?'ONE SHIP REMAINING':`${shipsRemaining} SHIPS REMAINING`}`:'SHIP DESTROYED';
 S.alertT=Math.max(S.alertT,1.25);
 sfx.shipHit();
 if(dualLoss){
  p.dual=0;
  return;
 }
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
 const key=(window.__platinumHarnessPersona||window.__auroraHarnessPersona||'').toLowerCase();
 return HARNESS_PERSONAS[key]||null;
}

function harnessTargetScore(e,p,cfg){
 return (e.dive?cfg.diveBias:0)+(e.carry?cfg.carryBias:0)+(e.t==='boss'?cfg.bossBias:0)+((!e.form||e.dive||S.challenge||e.y>cfg.openShotY)?cfg.activeBias:0)+(e.y*cfg.heightBias)-(Math.abs(e.x-p.x)*cfg.distanceBias);
}

function compareHarnessTargets(a,b,p,cfg){
 const scoreDiff=harnessTargetScore(b,p,cfg)-harnessTargetScore(a,p,cfg);
 if(Math.abs(scoreDiff)>1e-9)return scoreDiff;
 if((b.dive|0)!==(a.dive|0))return (b.dive|0)-(a.dive|0);
 if((b.carry|0)!==(a.carry|0))return (b.carry|0)-(a.carry|0);
 if((b.t==='boss')!==(a.t==='boss'))return (b.t==='boss')-(a.t==='boss');
 if(b.y!==a.y)return b.y-a.y;
 if(Math.abs(b.x-p.x)!==Math.abs(a.x-p.x))return Math.abs(a.x-p.x)-Math.abs(b.x-p.x);
 if((a.c??0)!==(b.c??0))return (a.c??0)-(b.c??0);
 if((a.r??0)!==(b.r??0))return (a.r??0)-(b.r??0);
 return (a.id??0)-(b.id??0);
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
 return S.e.filter(e=>e.hp>0).sort((a,b)=>compareHarnessTargets(a,b,p,cfg))[0]||null;
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
 const target=attackables.sort((a,b)=>compareHarnessTargets(a,b,p,cfg))[0]||harnessSelectTarget(p,cfg);
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

function updatePlayerControl(dt,p){
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
}

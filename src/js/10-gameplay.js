// Enemy spawning, stage flow, combat, capture, and game-state updates.

function fillPat(px,py,s,pat,col){if(!pat||!col)return;ctx.fillStyle=col;for(const p of pat)ctx.fillRect(px+p[0]*s,py+p[1]*s,s,s)}
function drawPix(px,py,s,pat,col,col2,pat2=null,col3='',pat3=null){fillPat(px,py,s,pat,col);if(pat2)fillPat(px,py,s,pat2,col2);else if(col2){ctx.fillStyle=col2;ctx.fillRect(px-s,py+s*2,s*2,s);ctx.fillRect(px+s*3,py+s*2,s*2,s)}if(pat3)fillPat(px,py,s,pat3,col3)}
function ex(x,y,n=10,col='#fff'){
 for(let i=0;i<n;i++)S.fx.push({x,y,vx:auxRnd(178,-178),vy:auxRnd(178,-178),t:auxRnd(.22,.08),r:auxRnd(n>14?2.1:1.5,.55),c:col,sq:auxRandUnit()>.25});
 S.fx.push({x,y,vx:0,vy:0,t:n>14?.11:.08,r:n>14?10:7,c:'#fff',flash:1});
}


function update(dt){
 if((!started&&!S.attract)||paused)return;
 logCarryDebugState();
 recShotT-=dt;
 if(recShotT<=0){logSnapshot('tick');recShotT=.5;}
 S.shake=Math.max(0,S.shake-dt);S.alertT=Math.max(0,S.alertT-dt);
 S.recoverT=Math.max(0,S.recoverT-dt);S.attackGapT=Math.max(0,S.attackGapT-dt);
 S.sequenceT=Math.max(0,S.sequenceT-dt);
 if(!S.sequenceT&&S.sequenceMode){S.sequenceMode='';if(S.bannerMode==='captureBeat'||S.bannerMode==='rescueBeat')S.bannerMode='';}
 S.stageClock+=dt;
 const simT=advanceGameplayClock(dt);
 const p=S.p;S.t=stageTune(S.stage,S.challenge);const T=S.t;
 if(S.attract){
  ATTRACT.timer=Math.max(0,ATTRACT.timer-dt);
  if(ATTRACT.phase==='scores'){
   for(const s of S.st){s.tw+=dt*(1.6+s.z*.9);s.y+=(10+s.z*18)*dt;if(s.y>PLAY_H+4){s.y=-4;s.x=auxRnd(PLAY_W)}}
   if(!ATTRACT.timer)startAttractDemo();
   return;
  }
 }
 if(S.nextStageT>0){
  const remaining=S.nextStageT-dt;
  if(remaining<=0){
   logEvent('challenge_transition_spawn_commit',{
    stage:S.stage,
    pendingStage:S.pendingStage||null,
    nextStageT:+S.nextStageT.toFixed(3),
    challenge:!!S.challenge
   });
   S.nextStageT=0;
   if(S.pendingStage){S.stage=S.pendingStage;S.pendingStage=0;}
   spawnStage();
  }else S.nextStageT=remaining;
  return
 }
 for(const s of S.st){s.tw+=dt*(1.6+s.z*.9);s.y+=(14+s.z*22+S.stage*.5)*dt;if(s.y>PLAY_H+4){s.y=-4;s.x=auxRnd(PLAY_W)}}
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
  const capY=p.capBoss.y+26+Math.sin((simT*1000)/140)*2.5;
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
 updatePlayerControl(dt,p);

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

 const t=simT;S.seqT-=dt;if(S.seqT<=0&&!S.challenge){S.seqT=.38;sfx.march(S.seq++)}
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

 updatePlayerBullets(dt);
 updateEnemyBullets(dt,p);
 updateEnemyBodyCollisions(p);
 updateReleasedCapture(dt,p);
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

// Aurora-specific scoring, rescue-award, and challenge-bonus helpers.

function nextExtendThresholdAfter(threshold){
 const recurring=Math.max(0,+S.extendRecurring||0);
 if(recurring<=0)return 0;
 return (Math.floor((threshold||0)/recurring)+1)*recurring;
}

function awardExtendShips(beforeScore,afterScore){
 let threshold=Math.max(0,+S.nextExtendScore||0);
 if(afterScore<=beforeScore||threshold<=0)return 0;
 let awarded=0;
 let lastThreshold=0;
 while(threshold>0&&afterScore>=threshold){
  S.lives++;
  S.extendAwards=(S.extendAwards|0)+1;
  awarded++;
  lastThreshold=threshold;
  threshold=nextExtendThresholdAfter(threshold);
 }
 if(!awarded)return 0;
 S.nextExtendScore=threshold;
 const totalShips=Math.max(0,S.lives+1);
 const title=awarded===1?'BONUS SHIP AWARDED':`${awarded} BONUS SHIPS AWARDED`;
 S.alertTxt=`${title}\n${totalShips===1?'ONE SHIP READY':`${totalShips} SHIPS READY`}`;
 S.alertT=Math.max(S.alertT,1.75);
 S.bannerTxt=awarded===1?'BONUS SHIP':'BONUS SHIPS';
 S.bannerSub=`SCORE ${formatScore(lastThreshold)}\n${totalShips===1?'ONE SHIP READY':`${totalShips} SHIPS READY`}`;
 S.bannerMode='extendAward';
 S.banner=Math.max(S.banner,1.45);
 S.extendFlashT=Math.max(S.extendFlashT,1.9);
 S.extendFlashShips=Math.max(1,awarded|0);
 logEvent('extend_awarded',{
  stage:S.stage,
  score:afterScore,
  awarded,
  threshold:lastThreshold,
  totalShips,
  nextThreshold:threshold||0
 });
 sfx.extend();
 return awarded;
}

function awardScorePoints(points){
 const value=Math.max(0,+points|0);
 if(!value)return 0;
 const before=S.score|0;
 S.score=before+value;
 awardExtendShips(before,S.score|0);
 return value;
}

function destroyCarriedFighter(e){
 if(!enemyIsCarryingFighter(e))return 0;
 // Manual-backed rule from the 1981 Namco manual:
 // - 500 for destroying a carried fighter in standby/formation
 // - 1000 when the carried fighter is attacking
 // The boss survives; only the carried fighter is lost.
 const attacking=!!e.dive;
 const points=attacking?currentGamePack().scoring.carriedFighter.attacking:currentGamePack().scoring.carriedFighter.standby;
 const off=carriedFighterOffset(e);
 if(enemyHasCaptureState(e))e.carry=0;
 awardScorePoints(points);
 logEvent('captured_fighter_destroyed',Object.assign({stage:S.stage,points,attacking,playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
 S.alertTxt=`CAPTURED FIGHTER DESTROYED ${points}`;
 S.alertT=Math.max(S.alertT,1.45);
 S.bannerTxt='CAPTURED FIGHTER';
 S.bannerSub='DESTROYED';
 S.bannerMode='captureLoss';
 S.banner=1.05;
 ex(e.x+off.x,e.y+off.y,10,'#d8f2ff');
 sfx.hit();
 return points;
}

function releaseCapturedFighter(e){
 const carryPos=carriedFighterTarget(e);
 S.cap={
  mode:'dock',
  x:carryPos?.x??e.x,
  y:carryPos?.y??e.y,
  vx:0,
  vy:78,
  t:8,
  spin:0,
  side:S.p.x<PLAY_W/2?1:-1
 };
 logEvent('captured_fighter_released',Object.assign({stage:S.stage,releaseX:+S.cap.x.toFixed(2),releaseY:+S.cap.y.toFixed(2)},enemyRef(e)));
 S.alertTxt='FIGHTER RELEASED';
 S.alertT=Math.max(S.alertT,1.5);
 S.bannerTxt='FIGHTER RELEASED';
 S.bannerSub='RETURNING TO SHIP';
 S.bannerMode='rescueReturn';
 S.banner=1.1;
 sfx.rescue();
}

function spawnHostileCapturedFighter(e){
 const rogue=makePackEnemyState({
  gamePack:currentGamePack(),
  type:'rogue',
  row:e.r,
  column:e.c,
  tx:e.tx,
  ty:e.ty,
  profile:S.profile,
  hp:1,
  max:1,
  spawn:0
 });
 const carryPos=carriedFighterTarget(e);
 rogue.form=1;
 rogue.en=3;
 rogue.x=carryPos?.x??e.tx;
 rogue.y=carryPos?.y??e.ty;
 rogue.cool=.55;
 rogue.hitT=.2;
 S.e.push(rogue);
 logEvent('captured_fighter_hostile_spawned',Object.assign({stage:S.stage,hostileId:rogue.id,spawnX:+rogue.x.toFixed(2),spawnY:+rogue.y.toFixed(2)},enemyRef(e)));
 return rogue;
}

function awardKill(e,mode){
 const dive=mode===1||mode===2||mode===4||mode===5;
 let pts=0;
 if(S.challenge){
  pts=currentGamePack().scoring.challengeEnemy;
  awardScorePoints(pts);
  S.ch.hits++;
  if(enemyHasChallengeState(e)&&Number.isInteger(e.group)&&S.ch.groups){
   S.ch.groups[e.group]=(S.ch.groups[e.group]||0)+1;
   if(S.ch.groups[e.group]===8){
     const bonus=challengeGroupBonus(S.stage);
     S.ch.bonus=(S.ch.bonus||0)+bonus;
     awardScorePoints(bonus);
     logEvent('challenge_group_bonus',{stage:S.stage,group:e.group,bonus,hits:S.ch.hits,total:S.ch.total});
    }
   }
  logEvent('enemy_killed',Object.assign({points:pts,dive,challenge:1,rescued:0,turnedHostile:0,playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
  return;
 }
 pts=currentGamePackEnemyKillPoints(e,dive);
 if(e.t==='boss'&&dive){
  const escorts=activeEscortCount(e);
  if(S.stage>=4&&escorts>0){
   logEvent('special_attack_bonus',{stage:S.stage,bonus:pts,escorts});
   S.alertTxt=`SPECIAL BONUS ${pts}`;
   S.alertT=Math.max(S.alertT,1.1);
  }
 }
 awardScorePoints(pts);
 const carrying=enemyIsCarryingFighter(e);
 logEvent('enemy_killed',Object.assign({points:pts,dive,challenge:0,rescued:!!(carrying&&dive),turnedHostile:!!(carrying&&!dive),playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
 if(carrying){
  if(dive){
   releaseCapturedFighter(e);
  }else{
   const hostile=spawnHostileCapturedFighter(e);
   logEvent('captured_fighter_turned_hostile',Object.assign({stage:S.stage,hostileId:hostile.id},enemyRef(e)));
   S.alertTxt='CAPTURED FIGHTER TURNED HOSTILE';
   S.alertT=2.2;
  }
 }
}

function awardRescueJoin(autoDock){
 const p=S.p;
 S.cap=null;
 p.dual=1;
 awardScorePoints(currentGamePack().scoring.rescueJoin);
 S.recoverT=Math.max(S.recoverT,1.15);
 S.attackGapT=Math.max(S.attackGapT,.9);
 startSequence('rescueBeat',1.1,'DUAL FIGHTER','JOINED');
 logEvent('fighter_rescued',Object.assign({
  stage:S.stage,
  playerX:+p.x.toFixed(2),
  playerY:+p.y.toFixed(2)
 },autoDock?{autoDock:1}:null));
 logEvent('rescue_join_phase',Object.assign({
  stage:S.stage,
  duration:1.1,
  playerX:+p.x.toFixed(2)
 },autoDock?{autoDock:1}:null));
 sfx.rescue();
 sfx.join();
}

function finalizeChallengeClear(){
 logEvent('challenge_clear',{stage:S.stage,hits:S.ch.hits,total:S.ch.total,upperBandY:Math.round(enemyChallengeUpperBandY(S.ch)),upperBandTime:+(S.ch.upperBandTime||0).toFixed(3),avgUpperBandTime:S.ch.total?+((S.ch.upperBandTime||0)/S.ch.total).toFixed(3):0});
 S.ch.done=1;
 const perfect=S.ch.hits===S.ch.total?currentGamePack().scoring.perfectChallengeClear:0;
 S.ch.perfect=perfect;
 awardScorePoints(perfect);
 S.bannerTxt=perfect?'PERFECT BONUS':'CHALLENGE COMPLETE';
 S.bannerSub=`HITS ${S.ch.hits}/${S.ch.total}`;
 const bonusTotal=(S.ch.bonus||0)+perfect;
 if(bonusTotal)S.bannerSub+=`\nBONUS ${bonusTotal}`;
 S.bannerMode='challengeResult';
 S.banner=1.15;
 S.pendingStage=S.stage+1;
 S.lastChallengeClearT=S.stageClock;
 S.challengeTransitionStallLogged=0;
 S.postChallengeT=1.1;
 logEvent('challenge_transition_queued',{
  stage:S.stage,
  pendingStage:S.pendingStage,
  hits:S.ch.hits,
  total:S.ch.total,
  postChallengeT:+S.postChallengeT.toFixed(3),
  bannerMode:S.bannerMode,
  bonusTotal
 });
}

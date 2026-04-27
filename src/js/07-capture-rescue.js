// Aurora-specific capture, rescue, and carried-fighter helpers.

function hasCarriedFighter(){
 return S.e.some(e=>e.hp>0&&enemyIsCarryingFighter(e));
}

function currentPackUsesCaptureRescue(){
 const pack=typeof currentGamePack==='function'?currentGamePack():null;
 return !!pack?.capabilities?.usesCaptureRescue;
}

function clearEnemyCaptureState(e){
 if(!enemyHasCaptureState(e))return;
 e.carry=0;
 e.beam=0;
 e.beamT=0;
}

function canCapture(){
 if(!currentPackUsesCaptureRescue())return false;
 const p=S.p;
 return !p.dual&&!p.captured&&!p.pending&&!hasCarriedFighter()&&p.spawn<=0&&S.lives>=0&&S.captureCountStage===0;
}

function capturePlayer(e){
 if(!canCapture()){
  clearEnemyCaptureState(e);
  return;
 }
 const p=S.p;
 p.captured=1;
 p.capBoss=e;
 p.capT=1.2;
 if(enemyHasCaptureState(e)){
  e.beam=1;
  e.beamT=Math.max(.5,e.beamT||0);
 }
 S.lastCaptureStartT=S.stageClock;
 logEvent('capture_started',Object.assign({stage:S.stage,playerX:+p.x.toFixed(2),playerY:+p.y.toFixed(2),playerLane:playLane(p.x)},enemyRef(e)));
 sfx.beam();
}

function finishCapture(){
 const p=S.p,e=p.capBoss;
 if(!e||e.hp<=0){
  p.captured=0;
  p.capBoss=null;
 p.inv=1.2;
  return;
 }
 if(enemyHasCaptureState(e)){
  e.carry=1;
  e.beam=0;
 }
 e.dive=3;
 e.vx=0;
 e.vy=0;
 if(enemyHasEscortState(e))e.esc=0;
 p.captured=0;
 p.capBoss=null;
 p.pending=1;
 p.spawn=1;
 S.lives--;
 S.captureCountStage++;
 S.lastFighterCapturedT=S.stageClock;
 S.recoverT=Math.max(S.recoverT,1.6);
 S.attackGapT=Math.max(S.attackGapT,1.35);
 startSequence('captureBeat',1.45,'FIGHTER CAPTURED','BOSS RETREAT');
 logEvent('fighter_captured',Object.assign({
  stage:S.stage,
  stageClock:+S.stageClock.toFixed(3),
  captureCountStage:S.captureCountStage,
  livesAfter:Math.max(0,S.lives+1),
  playerLane:playLane(p.x),
  timeSinceCaptureStart:S.lastCaptureStartT==null?null:+(S.stageClock-S.lastCaptureStartT).toFixed(3)
 },enemyRef(e)));
 logEvent('capture_retreat_phase',{stage:S.stage,duration:1.45,bossId:e.id});
 sfx.captureSuccess();
 sfx.captureRetreat();
 if(S.lives<0)gameOver();
}

function breakCapture(reason='boss_destroyed'){
 const p=S.p,e=p.capBoss;
 p.captured=0;
 p.returning=1;
 p.capBoss=null;
 p.capT=0;
 p.vx=0;
 p.inv=Math.max(p.inv||0,1.2);
 p.cd=Math.max(p.cd||0,.16);
 S.alertTxt='CAPTURE BROKEN';
 S.alertT=Math.max(S.alertT,1.15);
 S.bannerTxt='CAPTURE BROKEN';
 S.bannerSub='FIGHTER ESCAPED';
 S.bannerMode='captureEscape';
 S.banner=1.05;
 ex(p.x,p.y,12,'#d8f2ff');
 logEvent('capture_escape',{
  stage:S.stage,
  reason,
  playerX:+p.x.toFixed(2),
  playerY:+p.y.toFixed(2),
  playerLane:playLane(p.x),
  bossId:e?.id||null,
  timeSinceCaptureStart:S.lastCaptureStartT==null?null:+(S.stageClock-S.lastCaptureStartT).toFixed(3)
 });
 sfx.join();
}

function activeEscortCount(e){
 if(!enemyHasEscortState(e)||!e?.squadId)return Math.max(0,e?.esc|0);
 return S.e.filter(q=>q.hp>0&&q.squadId===e.squadId&&q.id!==e.id).length;
}

function specialSquadronTuning(stage=S.stage){
 if(stage===4){
  return {
   escortOffset:28,
   escortTrackX:7.2,
   escortTrackY:34,
   escortLift:16
  };
 }
 return {
  escortOffset:30,
  escortTrackX:7.4,
  escortTrackY:30,
  escortLift:18
 };
}

function carriedFighterOffset(e){
 if(!enemyIsCarryingFighter(e))return {x:0,y:18};
 // Keep the fighter below the boss while the boss is still retreating upward
 // after a capture. Only flip it to the docked/attached side once the boss is
 // actually back in formation. Active carried attacks stay on the upper side.
 if(e.dive===3)return {x:0,y:18};
 return {x:0,y:-18};
}

function carriedFighterTarget(e){
 if(!enemyIsCarryingFighter(e))return null;
 const off=carriedFighterOffset(e);
 return {x:e.x+off.x,y:e.y+off.y,w:6,h:6};
}

function assignEscorts(boss){
 if(boss.t!=='boss'||!enemyHasEscortState(boss))return;
 const maxEscorts=S.stage===1&&S.scriptMode?1:2;
 const squadId=++S.squadSeq;
 const cand=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.t==='but'&&Math.abs(e.c-boss.c)<=2).sort((a,b)=>Math.abs(a.c-boss.c)-Math.abs(b.c-boss.c)).slice(0,maxEscorts);
 boss.esc=0;
 boss.squadId=cand.length?squadId:0;
 const { escortOffset }=specialSquadronTuning(S.stage);
 for(const [i,e] of cand.entries()){
  if(!enemyHasEscortState(e))continue;
  e.dive=5;
  e.lead=boss.id;
  e.off=(i?1:-1)*escortOffset;
  e.shot=1;
  e.squadId=squadId;
  boss.esc++;
  logEnemyAttackStart(e,'escort',{lead:boss.id,offset:e.off});
 }
}

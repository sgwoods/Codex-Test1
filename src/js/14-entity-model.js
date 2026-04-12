// Shared enemy/entity state helpers for fixed-screen shooter game packs.

function enemyCoreState({
 id,
 type,
 family,
 band,
 row,
 column,
 hp,
 max,
 x,
 y,
 tx,
 ty,
 spawn
}){
 return {
  id,
  t:type,
  fam:family,
  band,
  r:row,
  c:column,
  hp,
  max,
  x,
  y,
  tx,
  ty,
  form:0,
  dive:0,
  vx:0,
  vy:0,
  tm:rnd(6),
  ph:rnd(8),
  cool:rnd(2.3,.8),
  targetX:0,
  targetY:0,
  shot:0,
  chargeCuePending:0,
  chargeCueT:0,
  chargeCueStartY:0,
  spawn,
  spawnPlan:spawn,
  en:0,
  ch:0,
  miss:0,
  low:0,
  hitT:0
 };
}

function enemyEscortState(gamePack){
 if(!gamePack?.capabilities?.usesEscortPatterns)return {};
 return {
  lead:null,
  off:0,
  esc:0,
  squadId:0
 };
}

function enemyCaptureState(gamePack){
 if(!gamePack?.capabilities?.usesCaptureRescue)return {};
 return {
  carry:0,
  beam:0,
  beamT:0
 };
}

function enemyChallengeState({
 wave=0,
 side=0,
 slot=0,
 row=0,
 group=0,
 sweep=0,
 upperBandY=0
}={}){
 return {
  ch:1,
  wave,
  side,
  slot,
  row,
  group,
  sweep,
  ub:0,
  upperBandY
 };
}

function enemyHasEscortState(e){
 return !!e&&('lead' in e||'off' in e||'esc' in e||'squadId' in e);
}

function enemyHasCaptureState(e){
 return !!e&&('carry' in e||'beam' in e||'beamT' in e);
}

function enemyHasChallengeState(e){
 return !!e&&('ch' in e||'wave' in e||'group' in e||'upperBandY' in e);
}

function enemyIsCarryingFighter(e){
 return !!(enemyHasCaptureState(e)&&e.carry);
}

function enemyHasActiveBeam(e){
 return !!(enemyHasCaptureState(e)&&e.beam);
}

function enemyChallengeUpperBandY(e,fallback=PLAY_H*.5){
 if(!enemyHasChallengeState(e))return fallback;
 return e.upperBandY||fallback;
}

function makePackEnemyState({
 gamePack=currentGamePack(),
 type,
 row,
 column,
 tx,
 ty,
 profile=stageBandProfile(S.stage,S.challenge),
 hp,
 max,
 spawn
}){
 const boss=type==='boss';
 return Object.assign(
  enemyCoreState({
   id:(randUnit()*1e9)|0,
   type,
   family:enemyFamilyForType(profile,type),
   band:profile.name,
   row,
   column,
   hp:hp==null?(boss?2:1):hp,
   max:max==null?(boss?2:1):max,
   x:PLAY_W/2+rnd(180,-180),
   y:-80-row*16,
   tx,
   ty,
   spawn:spawn==null?(row*.06+column*.02):spawn
  }),
  enemyEscortState(gamePack),
  enemyCaptureState(gamePack)
 );
}

function makePackChallengeEnemyState({
 gamePack=currentGamePack(),
 type,
 lane,
 profile=stageBandProfile(S.stage,1),
 x,
 y,
 wave=0,
 side=0,
 slot=0,
 row=0,
 group=0,
 sweep=0,
 upperBandY=PLAY_H*.5,
 spawn=0
}){
 return Object.assign({
  id:(randUnit()*1e9)|0,
  t:type,
  fam:profile.challengeFamily,
  band:profile.name,
  r:0,
  c:lane,
  hp:1,
  max:1,
  x,
  y,
  tx:0,
  ty:0,
  form:1,
  dive:9,
  vx:0,
  vy:0,
  tm:0,
  ph:rnd(8),
  cool:99,
  carry:0,
  beam:0,
  beamT:0,
  targetX:0,
  targetY:0,
  shot:0,
  chargeCuePending:0,
  chargeCueT:0,
  chargeCueStartY:0,
  spawn,
  spawnPlan:spawn,
  en:0,
  lead:null,
  off:0,
  esc:0,
  squadId:0,
  miss:0,
  low:0,
  hitT:0
 }, enemyChallengeState({wave,side,slot,row,group,sweep,upperBandY}));
}

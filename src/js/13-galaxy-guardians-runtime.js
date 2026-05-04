// Dev-only Galaxy Guardians scout-wave runtime model.

const GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG=Object.freeze({
 flagship:Object.freeze({
  id:'signal-flagship',
  label:'Signal Flagship',
  role:'flagship',
  color:'#ffdb58',
  accent:'#ff5b5b',
  visualId:'signal-flagship',
  diveAudioCue:'guardians-flagship-dive',
  hitAudioCue:'guardians-flagship-hit',
  formationPoints:150,
  divePoints:300,
  escortDivePoints:Object.freeze({one:500,two:800})
 }),
 escort:Object.freeze({
  id:'signal-escort',
  label:'Signal Escort',
  role:'escort',
  color:'#ff5b5b',
  accent:'#7bd6ff',
  visualId:'signal-escort',
  diveAudioCue:'guardians-scout-dive',
  hitAudioCue:'guardians-escort-hit',
  formationPoints:50,
  divePoints:100
 }),
 scout:Object.freeze({
  id:'signal-scout',
  label:'Signal Scout',
  role:'scout',
  color:'#4b7dff',
  accent:'#49f27a',
  visualId:'signal-scout',
  diveAudioCue:'guardians-scout-dive',
  hitAudioCue:'guardians-scout-hit',
  formationPoints:30,
  divePoints:60
 })
});

const GALAXY_GUARDIANS_RUNTIME_PROFILE=Object.freeze({
 id:'galaxy-guardians-dev-scout-wave-runtime',
 status:'dev-runtime-slice-not-public-release',
 publicPlayable:0,
 devPlayable:1,
 evidenceProfile:'reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json',
 promotedEventLog:'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json',
 eventVocabulary:Object.freeze([
  'formation_entry_start',
  'formation_entry_settle',
  'formation_rack_complete',
  'alien_dive_start',
  'flagship_dive_start',
  'escort_join',
  'player_shot_fired',
  'player_shot_resolved',
  'enemy_shot',
  'enemy_wrap_or_return',
  'player_lost',
  'game_over',
  'wave_clear',
  'stage_advance',
  'wave_reset'
 ]),
 rules:Object.freeze({
  playfieldWidth:280,
  playfieldHeight:360,
  playerFireMode:'single-shot',
  singleShotCooldown:.72,
  firstScoutDiveDelay:2.55,
  flagshipEscortDelay:6.65,
  formationEntrySettleAt:.42,
  formationEntryCompleteAt:.76,
  formationEntryTravelY:18,
  formationEntrySideSpread:6,
  formationEntryRowLag:.035,
  playerSpeed:108,
  formationDriftAmplitude:1.35,
  formationDriftHz:1.15,
  scoutDiveIntervalBase:1.6,
  scoutDiveIntervalJitter:.8,
  flagshipDiveIntervalBase:6.35,
  flagshipDiveIntervalJitter:1.35,
  diveSwayAmplitude:32,
  diveSwayHz:2.25,
  diveSideDrift:16,
  diveBaseVy:36,
  diveAccel:6.2,
  escortSpacing:11,
  escortLag:.14,
  escortYOffset:7,
  bottomExitPadding:12,
  firstEnemyShotDelay:4.1,
  enemyShotIntervalBase:1.25,
  enemyShotIntervalJitter:.75,
  enemyShotVy:108,
  enemyShotMaxLive:3,
  enemyShotStartYOffset:8,
  enemyShotPlayerHitbox:7,
  enemyShotBottomPadding:10,
  playerRespawnDelay:1.35,
  playerInvulnerability:.95,
  waveClearDelay:1.2,
  wrapThreatModel:'bottom-exit-or-return-explicit-preview-rule',
  formation:Object.freeze({
   flagshipSlots:2,
   escortSlots:6,
   scoutSlots:30,
   totalSlots:38
  })
 }),
 alienCatalog:GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG,
 visualCatalog:GALAXY_GUARDIANS_PACK.alienVisualCatalog,
 audioCueCatalog:GALAXY_GUARDIANS_PACK.audioCueCatalog,
 playerVisualId:'player-interceptor',
 forbiddenAuroraCapabilities:GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES
});

function guardiansRuntimeRng(seed=1){
 let state=(+seed>>>0)||1;
 return function next(){
  state=(Math.imul(state,1664525)+1013904223)>>>0;
  return state/4294967296;
 };
}

function guardiansStageRank(stateOrStage=1){
 const stage=typeof stateOrStage==='object'?+stateOrStage.stage:+stateOrStage;
 return Math.max(0,Math.min(4,Math.floor((stage||1)-1)));
}

function guardiansRuntimeRules(stateOrStage=1){
 const base=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
 const rank=guardiansStageRank(stateOrStage);
 if(!rank)return base;
 const diveScale=1+rank*.045;
 const shotScale=1+rank*.08;
 const intervalScale=Math.max(.68,1-rank*.075);
 const flagshipScale=Math.max(.74,1-rank*.065);
 const firstPressureScale=Math.max(.82,1-rank*.04);
 return Object.assign({},base,{
  firstScoutDiveDelay:+(base.firstScoutDiveDelay*firstPressureScale).toFixed(3),
  flagshipEscortDelay:+(base.flagshipEscortDelay*Math.max(.84,1-rank*.035)).toFixed(3),
  scoutDiveIntervalBase:+(base.scoutDiveIntervalBase*intervalScale).toFixed(3),
  scoutDiveIntervalJitter:+(base.scoutDiveIntervalJitter*Math.max(.72,1-rank*.05)).toFixed(3),
  flagshipDiveIntervalBase:+(base.flagshipDiveIntervalBase*flagshipScale).toFixed(3),
  flagshipDiveIntervalJitter:+(base.flagshipDiveIntervalJitter*Math.max(.72,1-rank*.05)).toFixed(3),
  diveBaseVy:+(base.diveBaseVy*diveScale).toFixed(3),
  diveAccel:+(base.diveAccel*(1+rank*.075)).toFixed(3),
  firstEnemyShotDelay:+(base.firstEnemyShotDelay*Math.max(.52,1-rank*.12)).toFixed(3),
  enemyShotIntervalBase:+(base.enemyShotIntervalBase*Math.max(.66,1-rank*.08)).toFixed(3),
  enemyShotIntervalJitter:+(base.enemyShotIntervalJitter*Math.max(.7,1-rank*.06)).toFixed(3),
  enemyShotVy:+(base.enemyShotVy*shotScale).toFixed(3),
  enemyShotMaxLive:Math.min(5,base.enemyShotMaxLive+Math.floor(rank/2)),
  formationDriftHz:+(base.formationDriftHz*(1+rank*.035)).toFixed(3)
 });
}

function createGalaxyGuardiansFormation(){
 const aliens=[];
 const push=(type,row,col,x,y)=>{
  const spec=GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG[type];
  const rules=GALAXY_GUARDIANS_RUNTIME_PROFILE?.rules||{};
  const side=col<5?-1:1;
  const rowLag=(rules.formationEntryRowLag||0)*row;
  const entryStartX=x+side*((rules.formationEntrySideSpread||0)+row*1.5);
  const entryStartY=y-(rules.formationEntryTravelY||0)-row*3;
  aliens.push({
   id:`gg-${type}-${row}-${col}`,
   type,
   role:spec.role,
   visualId:spec.visualId,
   row,
   col,
   rackX:x,
   rackY:y,
   entryStartX,
   entryStartY,
   entryDelay:rowLag+Math.abs(col-4.5)*.008,
   x:entryStartX,
   y:entryStartY,
   hp:1,
   mode:'entering',
   diveT:0,
   diveSide:side,
   escorts:0,
   escortSlot:0,
   linkedTo:''
  });
 };
 for(let col=4;col<=5;col++)push('flagship',0,col,68+col*16,48);
 for(let col=2;col<=7;col++)push('escort',1,col,68+col*16,68);
 for(let row=2;row<=4;row++){
  for(let col=0;col<10;col++)push('scout',row,col,68+col*16,52+row*20);
 }
 return aliens;
}

function createGalaxyGuardiansRuntimeState(opts={}){
 const lives=Math.max(1,Math.min(9,+opts.ships||3));
 const seed=(+opts.seed>>>0)||42719;
 const state={
  gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
  runtimeState:'dev-scout-wave',
  publicPlayable:0,
  devPlayable:1,
  stage:Math.max(1,+opts.stage||1),
  score:0,
  lives,
  t:0,
  gameOver:0,
  resetT:0,
  waveClearT:0,
  waveClearStage:0,
  seed,
  rngSeed:seed,
  formationEntry:Object.assign({started:1,startedAt:0,settled:0,complete:0},guardiansRuntimeRules(+opts.stage||1)),
  diveIndex:0,
  nextDiveAt:0,
  nextFlagshipAt:0,
  nextEnemyShotAt:0,
  player:{
   x:GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldWidth/2,
   y:GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldHeight-40,
   shot:null,
   cooldown:0,
   inv:0,
   visible:1
  },
  aliens:createGalaxyGuardiansFormation(),
  enemyShots:[],
  hitFlashes:[],
  events:[],
  forbiddenAuroraCapabilities:GALAXY_GUARDIANS_RUNTIME_PROFILE.forbiddenAuroraCapabilities,
  evidenceProfile:GALAXY_GUARDIANS_RUNTIME_PROFILE.evidenceProfile,
  promotedEventLog:GALAXY_GUARDIANS_RUNTIME_PROFILE.promotedEventLog,
  eventVocabulary:GALAXY_GUARDIANS_RUNTIME_PROFILE.eventVocabulary.slice()
 };
 state.rng=guardiansRuntimeRng(seed);
 const rules=guardiansRuntimeRules(state);
 state.nextDiveAt=rules.firstScoutDiveDelay;
 state.nextFlagshipAt=rules.flagshipEscortDelay;
 state.nextEnemyShotAt=rules.firstEnemyShotDelay;
 guardiansRuntimeEvent(state,'formation_entry_start',{source:'dev-runtime',audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.formationPulse.id});
 return state;
}

function guardiansRuntimeEvent(state,type,data={}){
 state.events.push(Object.assign({t:+state.t.toFixed(3),type},data));
}

function liveGuardiansAliens(state,role=''){
 return state.aliens.filter(alien=>alien.hp>0&&(!role||alien.role===role));
}

function pickGuardiansAlien(state,role=''){
 const candidates=liveGuardiansAliens(state,role);
 if(!candidates.length)return null;
 const index=Math.floor(state.rng()*candidates.length)%candidates.length;
 return candidates[index];
}

function pickGuardiansEscortAliens(state,count=0,leader=null){
 const escorts=liveGuardiansAliens(state,'escort')
  .filter(alien=>alien.mode==='formation')
  .sort((a,b)=>Math.abs(a.x-(leader?.x||a.x))-Math.abs(b.x-(leader?.x||b.x)));
 return escorts.slice(0,Math.max(0,count|0));
}

function startGuardiansDive(state,alien,escortCount=0){
 if(!alien||alien.hp<=0)return null;
 const rules=guardiansRuntimeRules(state);
 alien.mode='diving';
 alien.diveT=0;
 alien.diveStartX=alien.x;
 alien.diveStartY=alien.y;
 alien.diveSide=alien.x<GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldWidth/2?-1:1;
 alien.escorts=escortCount;
 alien.linkedTo='';
 alien.escortSlot=0;
 const escorts=alien.role==='flagship'?pickGuardiansEscortAliens(state,escortCount,alien):[];
 alien.escorts=escorts.length;
 guardiansRuntimeEvent(state,alien.role==='flagship'?'flagship_dive_start':'alien_dive_start',{
  id:alien.id,
  role:alien.role,
  visualId:alien.visualId,
  audioCue:GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG[alien.type]?.diveAudioCue||'',
  escorts:escorts.length
 });
 escorts.forEach((escort,index)=>{
  escort.mode='diving';
  escort.diveT=-rules.escortLag*(index+1);
  escort.diveStartX=escort.x;
  escort.diveStartY=escort.y;
  escort.diveSide=alien.diveSide;
  escort.linkedTo=alien.id;
  escort.escortSlot=index===0?-1:1;
  escort.escorts=0;
 });
 if(escorts.length>0)guardiansRuntimeEvent(state,'escort_join',{
  flagship:alien.id,
  escorts:escorts.length,
  escortIds:escorts.map(escort=>escort.id),
  audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.escortJoin.id
 });
 return alien;
}

function fireGuardiansPlayerShot(state){
 const rules=guardiansRuntimeRules(state);
 const p=state.player;
 if(state.gameOver||state.resetT>0||!p.visible)return false;
 if(p.shot||p.cooldown>0)return false;
 p.shot={x:p.x,y:p.y-8,vy:-178,active:1};
 p.cooldown=rules.singleShotCooldown;
 guardiansRuntimeEvent(state,'player_shot_fired',{x:+p.x.toFixed(2),y:+p.shot.y.toFixed(2),audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.playerShot.id,visualId:GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId});
 return true;
}

function resetGalaxyGuardiansWave(state,reason='wave_reset'){
 const rules=guardiansRuntimeRules(state);
 state.aliens=createGalaxyGuardiansFormation();
 state.enemyShots.length=0;
 state.hitFlashes.length=0;
 state.waveClearT=0;
 state.waveClearStage=0;
 state.player.shot=null;
 state.player.x=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldWidth/2;
 state.player.y=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldHeight-40;
 state.player.cooldown=0;
 state.player.inv=rules.playerInvulnerability;
 state.player.visible=1;
 state.formationEntry=Object.assign({started:1,startedAt:state.t,settled:0,complete:0},rules);
 state.diveIndex=0;
 state.nextDiveAt=state.t+rules.firstScoutDiveDelay;
 state.nextFlagshipAt=state.t+rules.flagshipEscortDelay;
 state.nextEnemyShotAt=state.t+rules.firstEnemyShotDelay;
 guardiansRuntimeEvent(state,'wave_reset',{reason,aliens:state.aliens.length});
 guardiansRuntimeEvent(state,'formation_entry_start',{source:'dev-runtime',reason,audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.formationPulse.id});
}

function clearGalaxyGuardiansWave(state){
 if(state.gameOver||state.waveClearT>0)return false;
 if(liveGuardiansAliens(state).length>0)return false;
 state.waveClearT=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.waveClearDelay;
 state.waveClearStage=state.stage;
 state.player.shot=null;
 state.enemyShots.length=0;
 guardiansRuntimeEvent(state,'wave_clear',{stage:state.stage,score:state.score,clearDelay:state.waveClearT});
 return true;
}

function advanceGalaxyGuardiansStage(state){
 state.stage=Math.max(1,(state.stage|0)+1);
 guardiansRuntimeEvent(state,'stage_advance',{stage:state.stage,score:state.score,fromStage:state.waveClearStage||state.stage-1});
 resetGalaxyGuardiansWave(state,'stage_advance');
 return state.stage;
}

function loseGalaxyGuardiansPlayer(state,cause='collision'){
 if(state.gameOver||state.resetT>0||state.player.inv>0)return false;
 state.lives=Math.max(0,state.lives-1);
 state.player.visible=0;
 state.player.shot=null;
 state.resetT=state.lives>0?guardiansRuntimeRules(state).playerRespawnDelay:0;
 guardiansRuntimeEvent(state,'player_lost',{
  cause,
  lives:state.lives,
  audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.playerLoss.id,
  visualId:GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId
 });
 if(state.lives<=0){
  state.gameOver=1;
  guardiansRuntimeEvent(state,'game_over',{score:state.score,stage:state.stage,audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.gameOver.id});
 }
 return true;
}

function guardiansAlienPoints(alien){
 const spec=GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG[alien.type];
 if(!spec)return 0;
 if(alien.role==='flagship'&&alien.mode==='diving'){
  if(alien.escorts>=2)return spec.escortDivePoints.two;
  if(alien.escorts===1)return spec.escortDivePoints.one;
 }
 return alien.mode==='diving'?spec.divePoints:spec.formationPoints;
}

function pickGuardiansEnemyShotSource(state){
 const live=liveGuardiansAliens(state).filter(alien=>alien.y<state.player.y-24);
 if(!live.length)return null;
 const active=live.filter(alien=>alien.mode==='diving');
 const candidates=active.length?active:live.sort((a,b)=>b.y-a.y);
 const index=Math.floor(state.rng()*candidates.length)%candidates.length;
 return candidates[index];
}

function fireGuardiansEnemyShot(state){
 const rules=guardiansRuntimeRules(state);
 const liveShots=state.enemyShots.filter(shot=>shot&&shot.active!==0);
 if(liveShots.length>=rules.enemyShotMaxLive)return false;
 const alien=pickGuardiansEnemyShotSource(state);
 if(!alien)return false;
 const shot={
  id:`gg-enemy-shot-${state.events.length}`,
  sourceId:alien.id,
  role:alien.role,
  visualId:alien.visualId,
  x:alien.x,
  y:alien.y+rules.enemyShotStartYOffset,
  vy:rules.enemyShotVy,
  active:1
 };
 state.enemyShots.push(shot);
 guardiansRuntimeEvent(state,'enemy_shot',{
  id:shot.id,
  sourceId:shot.sourceId,
  role:shot.role,
  x:+shot.x.toFixed(2),
  y:+shot.y.toFixed(2),
  audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.enemyShot.id,
  visualId:shot.visualId
 });
 return true;
}

function updateGalaxyGuardiansFormationEntry(state){
 const rules=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
 const entry=state.formationEntry||{};
 const entryElapsed=Math.max(0,state.t-(+entry.startedAt||0));
 if(!entry.settled&&entryElapsed>=rules.formationEntrySettleAt){
  entry.settled=1;
  guardiansRuntimeEvent(state,'formation_entry_settle',{source:'dev-runtime',aliens:state.aliens.filter(alien=>alien.hp>0).length});
 }
 if(!entry.complete&&entryElapsed>=rules.formationEntryCompleteAt){
  entry.complete=1;
  for(const alien of state.aliens){
   if(alien.hp<=0||alien.mode!=='entering')continue;
   alien.mode='formation';
   alien.x=alien.rackX;
   alien.y=alien.rackY;
  }
  guardiansRuntimeEvent(state,'formation_rack_complete',{aliens:state.aliens.filter(alien=>alien.hp>0).length});
 }
 state.formationEntry=entry;
 return entry;
}

function stepGalaxyGuardiansRuntime(state,dt=.016,input={}){
 if(!state||state.gameKey!==GALAXY_GUARDIANS_PACK.metadata.gameKey)throw new Error('Invalid Galaxy Guardians runtime state.');
 const rules=guardiansRuntimeRules(state);
 const p=state.player;
 const move=(input.right?1:0)-(input.left?1:0);
 dt=Math.max(0,Math.min(.2,+dt||0));
 state.t+=dt;
 p.cooldown=Math.max(0,p.cooldown-dt);
 p.inv=Math.max(0,(+p.inv||0)-dt);
 if(Array.isArray(state.hitFlashes)&&state.hitFlashes.length){
  state.hitFlashes=state.hitFlashes
   .map(flash=>Object.assign({},flash,{t:Math.max(0,(+flash.t||0)-dt)}))
   .filter(flash=>flash.t>0);
 }
 if(state.gameOver)return state;
 if(state.resetT>0){
  state.resetT=Math.max(0,state.resetT-dt);
  if(!state.resetT)resetGalaxyGuardiansWave(state,'life_reset');
  return state;
 }
 if(state.waveClearT>0){
  state.waveClearT=Math.max(0,state.waveClearT-dt);
  if(!state.waveClearT)advanceGalaxyGuardiansStage(state);
  return state;
 }
 const entry=updateGalaxyGuardiansFormationEntry(state);
 p.x=Math.max(12,Math.min(rules.playfieldWidth-12,p.x+move*rules.playerSpeed*dt));
 if(input.fire)fireGuardiansPlayerShot(state);
 if(entry.complete&&state.t>=state.nextDiveAt){
  const alien=pickGuardiansAlien(state,'scout')||pickGuardiansAlien(state);
  startGuardiansDive(state,alien,0);
  state.nextDiveAt=state.t+rules.scoutDiveIntervalBase+state.rng()*rules.scoutDiveIntervalJitter;
 }
 if(entry.complete&&state.t>=state.nextFlagshipAt){
  const flagship=pickGuardiansAlien(state,'flagship');
  startGuardiansDive(state,flagship,Math.min(2,liveGuardiansAliens(state,'escort').length));
  state.nextFlagshipAt=state.t+rules.flagshipDiveIntervalBase+state.rng()*rules.flagshipDiveIntervalJitter;
 }
 if(state.t>=state.nextEnemyShotAt){
  fireGuardiansEnemyShot(state);
  state.nextEnemyShotAt=state.t+rules.enemyShotIntervalBase+state.rng()*rules.enemyShotIntervalJitter;
 }
 for(const alien of state.aliens){
  if(alien.hp<=0)continue;
  if(alien.mode==='entering'){
   const entryStartedAt=+state.formationEntry?.startedAt||0;
   const localT=Math.max(0,state.t-entryStartedAt-(+alien.entryDelay||0));
   const q=Math.min(1,localT/Math.max(.1,rules.formationEntryCompleteAt));
   const eased=1-Math.pow(1-q,3);
   const weave=Math.sin((state.t+alien.col*.17)*5.2)*(1-q)*2.4;
   alien.x=alien.entryStartX+(alien.rackX-alien.entryStartX)*eased+weave;
   alien.y=alien.entryStartY+(alien.rackY-alien.entryStartY)*eased;
   continue;
  }
  if(alien.mode==='formation'){
   const drift=Math.sin(state.t*rules.formationDriftHz+alien.row*.7)*rules.formationDriftAmplitude;
   alien.x=alien.rackX+drift;
   alien.y=alien.rackY;
   continue;
  }
  alien.diveT+=dt;
  const leader=alien.linkedTo?state.aliens.find(candidate=>candidate.id===alien.linkedTo&&candidate.hp>0):null;
  if(leader&&leader.mode==='diving'){
   const slot=alien.escortSlot||1;
   alien.x=leader.x+slot*rules.escortSpacing;
   alien.y=leader.y+rules.escortYOffset+Math.max(0,alien.diveT)*4;
  }else{
   const q=Math.max(0,alien.diveT);
   alien.x=alien.diveStartX+Math.sin(q*rules.diveSwayHz)*rules.diveSwayAmplitude*alien.diveSide+alien.diveSide*q*rules.diveSideDrift;
   alien.y=alien.diveStartY+q*rules.diveBaseVy+q*q*rules.diveAccel;
  }
  if(alien.y>rules.playfieldHeight+rules.bottomExitPadding){
   alien.mode='formation';
   alien.diveT=0;
   alien.x=alien.rackX;
   alien.y=alien.rackY;
   alien.linkedTo='';
   alien.escortSlot=0;
   guardiansRuntimeEvent(state,'enemy_wrap_or_return',{id:alien.id,role:alien.role,visualId:alien.visualId,audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.wrapReturn.id});
  }
  if(alien.mode==='diving'&&p.visible&&p.inv<=0&&Math.abs(alien.x-p.x)<=10&&Math.abs(alien.y-p.y)<=10){
   loseGalaxyGuardiansPlayer(state,`alien_${alien.role}_collision`);
  }
 }
 if(state.enemyShots.length){
  const activeShots=[];
  for(const shot of state.enemyShots){
   if(!shot||shot.active===0)continue;
   shot.y+=shot.vy*dt;
   if(shot.y>rules.playfieldHeight+rules.enemyShotBottomPadding)continue;
   if(p.visible&&p.inv<=0&&Math.abs(shot.x-p.x)<=rules.enemyShotPlayerHitbox&&Math.abs(shot.y-p.y)<=rules.enemyShotPlayerHitbox){
    shot.active=0;
    loseGalaxyGuardiansPlayer(state,'enemy_shot');
    continue;
   }
   activeShots.push(shot);
  }
  state.enemyShots=activeShots;
 }
 if(p.shot){
  p.shot.y+=p.shot.vy*dt;
  let resolved=0;
  for(const alien of state.aliens){
   if(alien.hp<=0)continue;
   if(Math.abs(alien.x-p.shot.x)<=8&&Math.abs(alien.y-p.shot.y)<=7){
    alien.hp=0;
    const points=guardiansAlienPoints(alien);
    state.score+=points;
    const hitDuration=alien.role==='flagship' ? .34 : (alien.role==='escort' ? .24 : .18);
    state.hitFlashes.push({
     role:alien.role,
     visualId:alien.visualId,
     x:alien.x,
     y:alien.y,
     t:hitDuration,
     duration:hitDuration,
     color:alien.role==='flagship'?'#ffdf6f':alien.role==='escort'?'#ff5b5b':'#42f285'
    });
    guardiansRuntimeEvent(state,'player_shot_resolved',{result:'hit',id:alien.id,role:alien.role,visualId:alien.visualId,audioCue:GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG[alien.type]?.hitAudioCue||'',points,score:state.score});
    resolved=1;
    break;
   }
  }
  if(!resolved&&p.shot.y<0){
   guardiansRuntimeEvent(state,'player_shot_resolved',{result:'miss'});
   resolved=1;
  }
  if(resolved)p.shot=null;
 }
 clearGalaxyGuardiansWave(state);
 return state;
}

function summarizeGalaxyGuardiansRuntime(state){
 const counts={};
 for(const alien of state.aliens){
  if(alien.hp<=0)continue;
  counts[alien.role]=(counts[alien.role]||0)+1;
 }
 return {
  gameKey:state.gameKey,
  runtimeState:state.runtimeState,
  publicPlayable:state.publicPlayable,
  devPlayable:state.devPlayable,
  stage:state.stage,
  score:state.score,
  lives:state.lives,
  alienCount:state.aliens.filter(alien=>alien.hp>0).length,
  entryComplete:!!state.formationEntry?.complete,
  entrySettled:!!state.formationEntry?.settled,
  enteringCount:state.aliens.filter(alien=>alien.hp>0&&alien.mode==='entering').length,
  liveRoles:counts,
  hasPlayerShot:!!state.player.shot,
  enemyShotCount:state.enemyShots.filter(shot=>shot&&shot.active!==0).length,
  waveClearPending:state.waveClearT>0,
  waveClearT:+(+state.waveClearT||0).toFixed(3),
  hitFlashCount:(state.hitFlashes||[]).length,
  hitFlashes:(state.hitFlashes||[]).map(flash=>({role:flash.role,visualId:flash.visualId,x:+flash.x.toFixed(2),y:+flash.y.toFixed(2),t:+flash.t.toFixed(3),duration:+flash.duration.toFixed(3)})),
  enemyShots:state.enemyShots.filter(shot=>shot&&shot.active!==0).map(shot=>({id:shot.id,role:shot.role,x:+shot.x.toFixed(2),y:+shot.y.toFixed(2)})),
  playerVisible:!!state.player.visible,
  playerInv:+(+state.player.inv||0).toFixed(3),
  resetT:+(+state.resetT||0).toFixed(3),
  gameOver:!!state.gameOver,
  activeDives:state.aliens.filter(alien=>alien.hp>0&&alien.mode==='diving').map(alien=>({id:alien.id,role:alien.role,linkedTo:alien.linkedTo||'',escortSlot:alien.escortSlot||0,x:+alien.x.toFixed(2),y:+alien.y.toFixed(2)})),
  eventTypes:Array.from(new Set(state.events.map(event=>event.type))),
  visualIds:Array.from(new Set(state.aliens.filter(alien=>alien.hp>0).map(alien=>alien.visualId))),
  audioCueIds:Array.from(new Set(state.events.map(event=>event.audioCue).filter(Boolean))),
  events:state.events.slice()
 };
}

window.GALAXY_GUARDIANS_RUNTIME_PROFILE=GALAXY_GUARDIANS_RUNTIME_PROFILE;
window.createGalaxyGuardiansRuntimeState=createGalaxyGuardiansRuntimeState;
window.stepGalaxyGuardiansRuntime=stepGalaxyGuardiansRuntime;
window.summarizeGalaxyGuardiansRuntime=summarizeGalaxyGuardiansRuntime;
window.guardiansRuntimeRules=guardiansRuntimeRules;
window.guardiansStageRank=guardiansStageRank;
window.loseGalaxyGuardiansPlayer=loseGalaxyGuardiansPlayer;
window.resetGalaxyGuardiansWave=resetGalaxyGuardiansWave;
window.clearGalaxyGuardiansWave=clearGalaxyGuardiansWave;
window.advanceGalaxyGuardiansStage=advanceGalaxyGuardiansStage;

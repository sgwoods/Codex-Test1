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
  'enemy_wrap_or_return'
 ]),
 rules:Object.freeze({
  playfieldWidth:280,
  playfieldHeight:360,
  playerFireMode:'single-shot',
  singleShotCooldown:.72,
  firstScoutDiveDelay:2.2,
  flagshipEscortDelay:6.4,
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

function createGalaxyGuardiansFormation(){
 const aliens=[];
 const push=(type,row,col,x,y)=>{
  const spec=GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG[type];
  aliens.push({
   id:`gg-${type}-${row}-${col}`,
   type,
   role:spec.role,
   visualId:spec.visualId,
   row,
   col,
   rackX:x,
   rackY:y,
   x,
   y,
   hp:1,
   mode:'formation',
   diveT:0,
   diveSide:col<5?-1:1,
   escorts:0
  });
 };
 for(let col=4;col<=5;col++)push('flagship',0,col,44+col*21,52);
 for(let col=2;col<=7;col++)push('escort',1,col,44+col*21,74);
 for(let row=2;row<=4;row++){
  for(let col=0;col<10;col++)push('scout',row,col,44+col*21,74+row*22);
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
  seed,
  rngSeed:seed,
  diveIndex:0,
  nextDiveAt:GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.firstScoutDiveDelay,
  nextFlagshipAt:GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.flagshipEscortDelay,
  player:{
   x:GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldWidth/2,
   y:GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldHeight-28,
   shot:null,
   cooldown:0
  },
  aliens:createGalaxyGuardiansFormation(),
  enemyShots:[],
  events:[],
  forbiddenAuroraCapabilities:GALAXY_GUARDIANS_RUNTIME_PROFILE.forbiddenAuroraCapabilities,
  evidenceProfile:GALAXY_GUARDIANS_RUNTIME_PROFILE.evidenceProfile,
  promotedEventLog:GALAXY_GUARDIANS_RUNTIME_PROFILE.promotedEventLog,
  eventVocabulary:GALAXY_GUARDIANS_RUNTIME_PROFILE.eventVocabulary.slice()
 };
 state.rng=guardiansRuntimeRng(seed);
 guardiansRuntimeEvent(state,'formation_entry_start',{source:'dev-runtime',audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.formationPulse.id});
 guardiansRuntimeEvent(state,'formation_entry_settle',{source:'dev-runtime'});
 guardiansRuntimeEvent(state,'formation_rack_complete',{aliens:state.aliens.length});
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

function startGuardiansDive(state,alien,escortCount=0){
 if(!alien||alien.hp<=0)return null;
 alien.mode='diving';
 alien.diveT=0;
 alien.diveStartX=alien.x;
 alien.diveStartY=alien.y;
 alien.diveSide=alien.x<GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldWidth/2?-1:1;
 alien.escorts=escortCount;
 guardiansRuntimeEvent(state,alien.role==='flagship'?'flagship_dive_start':'alien_dive_start',{
  id:alien.id,
  role:alien.role,
  visualId:alien.visualId,
  audioCue:GALAXY_GUARDIANS_RUNTIME_ALIEN_CATALOG[alien.type]?.diveAudioCue||'',
  escorts:escortCount
 });
 if(escortCount>0)guardiansRuntimeEvent(state,'escort_join',{flagship:alien.id,escorts:escortCount,audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.escortJoin.id});
 return alien;
}

function fireGuardiansPlayerShot(state){
 const p=state.player;
 if(p.shot||p.cooldown>0)return false;
 p.shot={x:p.x,y:p.y-8,vy:-178,active:1};
 p.cooldown=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.singleShotCooldown;
 guardiansRuntimeEvent(state,'player_shot_fired',{x:+p.x.toFixed(2),y:+p.shot.y.toFixed(2),audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.playerShot.id,visualId:GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId});
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

function stepGalaxyGuardiansRuntime(state,dt=.016,input={}){
 if(!state||state.gameKey!==GALAXY_GUARDIANS_PACK.metadata.gameKey)throw new Error('Invalid Galaxy Guardians runtime state.');
 const rules=GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
 const p=state.player;
 const move=(input.right?1:0)-(input.left?1:0);
 state.t+=Math.max(0,Math.min(.2,+dt||0));
 p.x=Math.max(12,Math.min(rules.playfieldWidth-12,p.x+move*112*dt));
 p.cooldown=Math.max(0,p.cooldown-dt);
 if(input.fire)fireGuardiansPlayerShot(state);
 if(state.t>=state.nextDiveAt){
  const alien=pickGuardiansAlien(state,'scout')||pickGuardiansAlien(state);
  startGuardiansDive(state,alien,0);
  state.nextDiveAt=state.t+1.85+state.rng()*1.1;
 }
 if(state.t>=state.nextFlagshipAt){
  const flagship=pickGuardiansAlien(state,'flagship');
  startGuardiansDive(state,flagship,Math.min(2,liveGuardiansAliens(state,'escort').length));
  state.nextFlagshipAt=state.t+7.2+state.rng()*2.2;
 }
 for(const alien of state.aliens){
  if(alien.hp<=0)continue;
  if(alien.mode==='formation'){
   const drift=Math.sin(state.t*2.2+alien.row*.7)*2.4;
   alien.x=alien.rackX+drift;
   alien.y=alien.rackY;
   continue;
  }
  alien.diveT+=dt;
  const q=alien.diveT;
  alien.x=alien.diveStartX+Math.sin(q*4.2)*24*alien.diveSide+alien.diveSide*q*10;
  alien.y=alien.diveStartY+q*68+q*q*13;
  if(alien.y>rules.playfieldHeight+12){
   alien.mode='formation';
   alien.diveT=0;
   alien.x=alien.rackX;
   alien.y=alien.rackY;
   guardiansRuntimeEvent(state,'enemy_wrap_or_return',{id:alien.id,role:alien.role,visualId:alien.visualId,audioCue:GALAXY_GUARDIANS_PACK.audioCueCatalog.wrapReturn.id});
  }
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
  liveRoles:counts,
  hasPlayerShot:!!state.player.shot,
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

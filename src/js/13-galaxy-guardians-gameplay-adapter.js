// Galaxy Guardians gameplay adapter skeleton plus the owned hosted preview slice.

const GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES=Object.freeze({
 usesCaptureRescue:0,
 usesDualFighterMode:0,
 usesChallengeStages:0,
 usesAuroraScoring:0,
 usesAuroraEnemyFamilies:0
});

const GALAXY_GUARDIANS_REFERENCE_PROFILE=Object.freeze({
 profile:'reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json',
 manifest:'reference-artifacts/analyses/galaxian-reference/source-manifest.json',
 promotedEventLog:'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json',
 status:'source-manifested-contact-sheets-and-waveforms',
 promotedEventStatus:'promoted-reviewed-event-windows',
 promotedEventCount:11,
 devRuntime:'src/js/13-galaxy-guardians-runtime.js',
   devRuntimeStatus:'preview-runtime-slice-not-production-release',
 devRuntimeHarness:'tools/harness/check-galaxy-guardians-runtime-slice.js',
 sourceCount:3,
 sources:Object.freeze([
  Object.freeze({
   id:'matt-hawkins-arcade-intro',
   role:'arcade_intro_attract_and_opening',
   durationSeconds:59.267,
   frameRate:'30/1',
   dimensions:'560x720',
   contactSheet:'reference-artifacts/analyses/galaxian-reference/matt-hawkins-arcade-intro/frames/contact-sheet-reference-window.jpg',
   waveform:'reference-artifacts/analyses/galaxian-reference/matt-hawkins-arcade-intro/audio/waveform-reference-window.png'
  }),
  Object.freeze({
   id:'arcades-lounge-level-5',
   role:'mid_wave_pressure_and_level_5_clear',
   durationSeconds:58.322,
   frameRate:'25/1',
   dimensions:'1080x1920',
   contactSheet:'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/frames/contact-sheet-reference-window.jpg',
   waveform:'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/audio/waveform-reference-window.png'
  }),
  Object.freeze({
   id:'nenriki-15-wave-session',
   role:'long_session_wave_progression',
   durationSeconds:944.094,
   frameRate:'60/1',
   dimensions:'1080x1234',
   contactSheet:'reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/frames/contact-sheet-reference-window.jpg',
   waveform:'reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/audio/waveform-reference-window.png'
  })
 ]),
 nextPromotionTargets:Object.freeze([
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
 ])
});

const GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE=Object.freeze({
 id:'scout-wave-preview',
 evidenceState:'promoted-event-log-awaiting-runtime-implementation',
 referenceProfile:GALAXY_GUARDIANS_REFERENCE_PROFILE,
 playerFireMode:'single-shot',
 formationModel:'rack-with-independent-dives',
 flagshipModel:'flagship-with-escort-pressure',
 wrapThreatModel:'bottom-exit-or-return-explicit-preview-rule',
 firstWave:Object.freeze({
  formationRows:5,
  flagshipSlots:2,
  escortSlots:6,
  scoutSlots:30,
  entryStyle:'galaxian-rack-entry-awaiting-frame-timing',
  diveStyle:'solo-dive-and-flagship-escort-pressure'
 })
});

const GALAXY_GUARDIANS_PLAYABLE_PREVIEW_RELEASE_CHANNELS=Object.freeze([
 'development',
 'production beta',
 'production'
]);

const GALAXY_GUARDIANS_HARNESS_PERSONAS=Object.freeze({
 novice:Object.freeze({
  name:'novice',
  moveMul:.66,
  urgentShotDx:16,
  urgentShotLook:72,
  diveThreatY:190,
  diveThreatDx:26,
  deadZone:11,
  aimScout:10,
  aimEscort:11,
  aimFlagship:13,
  shotCadence:.28,
  stageOpeningHold:.5,
  openShotY:96,
  diveBias:84,
  escortBias:10,
  flagshipBias:24,
  linkedEscortBias:6,
  rackClearThreshold:10,
  rackClearBonus:20,
  heightBias:.78,
  distanceBias:1.08
 }),
 advanced:Object.freeze({
  name:'advanced',
  moveMul:.78,
  urgentShotDx:18,
  urgentShotLook:108,
  diveThreatY:170,
  diveThreatDx:30,
  deadZone:9,
  aimScout:12,
  aimEscort:14,
  aimFlagship:16,
  shotCadence:.18,
  stageOpeningHold:.28,
  openShotY:82,
  diveBias:124,
  escortBias:20,
  flagshipBias:46,
  linkedEscortBias:10,
  rackClearThreshold:12,
  rackClearBonus:30,
  heightBias:.92,
  distanceBias:.95
 }),
 expert:Object.freeze({
  name:'expert',
  moveMul:.88,
  urgentShotDx:20,
  urgentShotLook:132,
  diveThreatY:158,
  diveThreatDx:34,
  deadZone:7,
  aimScout:13,
  aimEscort:15,
  aimFlagship:18,
  shotCadence:.14,
  stageOpeningHold:.18,
  openShotY:74,
  diveBias:170,
  escortBias:28,
  flagshipBias:72,
  linkedEscortBias:12,
  rackClearThreshold:14,
  rackClearBonus:42,
  heightBias:1.02,
  distanceBias:.88
 }),
 professional:Object.freeze({
  name:'professional',
  moveMul:.94,
  urgentShotDx:22,
  urgentShotLook:150,
  diveThreatY:146,
  diveThreatDx:38,
  deadZone:5,
  aimScout:14,
  aimEscort:16,
  aimFlagship:19,
  shotCadence:.11,
  stageOpeningHold:.12,
  openShotY:68,
  diveBias:220,
  escortBias:36,
  flagshipBias:92,
  linkedEscortBias:22,
  rackClearThreshold:14,
  rackClearBonus:54,
  heightBias:1.08,
  distanceBias:.82,
  holdFireDuringUrgentThreat:1
 })
});

function guardiansHarnessPersonaCfgForKey(key=''){
 return GALAXY_GUARDIANS_HARNESS_PERSONAS[String(key||'').toLowerCase()]||null;
}

function guardiansHarnessPersonaCfg(){
 return guardiansHarnessPersonaCfgForKey(window.__platinumHarnessPersona||window.__auroraHarnessPersona||'');
}

function guardiansHasManualInput(input={}){
 return !!(input.left||input.right||input.fire);
}

function guardiansPersonaMemory(state,cfg){
 if(!state.personaMemory||state.personaMemory.persona!==cfg.name){
  state.personaMemory={
   persona:cfg.name,
   stage:state.stage|0,
   stageStartT:+state.t||0,
   nextShotAt:+state.t||0,
   lastTargetId:''
  };
 }
 if((state.personaMemory.stage|0)!==(state.stage|0)){
  state.personaMemory.stage=state.stage|0;
  state.personaMemory.stageStartT=+state.t||0;
  state.personaMemory.nextShotAt=Math.max(+state.t||0,+state.player?.cooldown||0);
  state.personaMemory.lastTargetId='';
 }
 return state.personaMemory;
}

function guardiansPersonaNearestShotThreat(state,cfg){
 const player=state.player||{};
 return (state.enemyShots||[])
  .filter(shot=>shot&&shot.active!==0&&shot.y<player.y&&player.y-shot.y<cfg.urgentShotLook&&Math.abs(shot.x-player.x)<=cfg.urgentShotDx)
  .sort((a,b)=>(player.y-a.y)-(player.y-b.y))[0]||null;
}

function guardiansPersonaNearestDiveThreat(state,cfg){
 const player=state.player||{};
 return (state.aliens||[])
  .filter(alien=>alien.hp>0&&alien.mode==='diving'&&alien.y<player.y&&alien.y>=cfg.diveThreatY&&Math.abs(alien.x-player.x)<=cfg.diveThreatDx)
  .sort((a,b)=>{
   if(b.y!==a.y)return b.y-a.y;
   return Math.abs(a.x-player.x)-Math.abs(b.x-player.x);
  })[0]||null;
}

function guardiansPersonaTargetScore(alien,state,cfg){
 const player=state.player||{};
 const liveCount=(state.aliens||[]).filter(candidate=>candidate.hp>0).length;
 const rackClearMode=liveCount<=cfg.rackClearThreshold;
 let score=alien.y*cfg.heightBias-Math.abs(alien.x-player.x)*cfg.distanceBias;
 if(alien.mode==='diving')score+=cfg.diveBias*(rackClearMode ? .55 : 1)+alien.y*.18;
 if(alien.role==='escort')score+=cfg.escortBias;
 if(alien.role==='flagship')score+=cfg.flagshipBias;
 if(alien.linkedTo)score+=cfg.linkedEscortBias;
 if(rackClearMode&&alien.mode!=='diving')score+=cfg.rackClearBonus;
 if(alien.mode!=='diving'&&alien.y<cfg.openShotY)score-=10;
 return score;
}

function guardiansPersonaSelectTarget(state,cfg){
 const player=state.player||{};
 return (state.aliens||[])
  .filter(alien=>alien.hp>0)
  .sort((a,b)=>{
   const delta=guardiansPersonaTargetScore(b,state,cfg)-guardiansPersonaTargetScore(a,state,cfg);
   if(Math.abs(delta)>1e-9)return delta;
   if((b.mode==='diving')!==(a.mode==='diving'))return (b.mode==='diving')-(a.mode==='diving');
   if((b.role==='flagship')!==(a.role==='flagship'))return (b.role==='flagship')-(a.role==='flagship');
   if(b.y!==a.y)return b.y-a.y;
   return Math.abs(a.x-player.x)-Math.abs(b.x-player.x);
  })[0]||null;
}

function guardiansPersonaMoveAxis(state,cfg,target){
 const player=state.player||{};
 const playfieldWidth=GALAXY_GUARDIANS_RUNTIME_PROFILE?.rules?.playfieldWidth||280;
 const diveThreat=guardiansPersonaNearestDiveThreat(state,cfg);
 if(diveThreat){
  const away=diveThreat.x>=player.x?-1:1;
  if((away<0&&player.x>18)||(away>0&&player.x<playfieldWidth-18))return away;
 }
 const shotThreat=guardiansPersonaNearestShotThreat(state,cfg);
 if(shotThreat){
  const away=shotThreat.x>=player.x?-1:1;
  if((away<0&&player.x>18)||(away>0&&player.x<playfieldWidth-18))return away;
 }
 if(!target){
  const mid=playfieldWidth/2;
  if(Math.abs(player.x-mid)<=cfg.deadZone)return 0;
  return player.x<mid?1:-1;
 }
 const dx=target.x-player.x;
 if(Math.abs(dx)<=cfg.deadZone)return 0;
 return dx>0?1:-1;
}

function galaxyGuardiansHarnessPersonaInput(state,personaKey=''){
 const cfg=guardiansHarnessPersonaCfgForKey(personaKey||window.__platinumHarnessPersona||window.__auroraHarnessPersona||'');
 if(!cfg||!state||state.gameOver||state.resetT>0||!state.player?.visible)return {left:0,right:0,fire:0};
 const mem=guardiansPersonaMemory(state,cfg);
 const target=guardiansPersonaSelectTarget(state,cfg);
 const axis=guardiansPersonaMoveAxis(state,cfg,target);
 const urgentShot=guardiansPersonaNearestShotThreat(state,cfg);
 let fire=0;
 if(target&&!state.player.shot&&state.player.cooldown<=0&&state.t>=mem.nextShotAt){
  const tol=target.role==='flagship'?cfg.aimFlagship:target.role==='escort'?cfg.aimEscort:cfg.aimScout;
  const dx=Math.abs(target.x-state.player.x);
  const stageOpenElapsed=Math.max(0,(+state.t||0)-(+mem.stageStartT||0));
  const canFireFormation=target.mode==='diving'||target.y>=cfg.openShotY||stageOpenElapsed>=cfg.stageOpeningHold;
  if(dx<=tol&&canFireFormation&&!(cfg.holdFireDuringUrgentThreat&&urgentShot)){
   fire=1;
   mem.nextShotAt=(+state.t||0)+cfg.shotCadence;
   mem.lastTargetId=target.id;
  }
 }
 return {left:axis<0,right:axis>0,fire};
}

function createGalaxyGuardiansInitialState(opts={}){
 return Object.freeze({
  gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
  adapterState:'disabled-skeleton',
  stage:Math.max(1,+opts.stage||1),
  score:0,
  lives:Math.max(1,Math.min(9,+opts.ships||3)),
  fireMode:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.playerFireMode,
  formationModel:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.formationModel,
  flagshipModel:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.flagshipModel,
  wrapThreatModel:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.wrapThreatModel,
  evidenceState:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.evidenceState,
  sourceProfile:GALAXY_GUARDIANS_REFERENCE_PROFILE.profile,
  promotedEventLog:GALAXY_GUARDIANS_REFERENCE_PROFILE.promotedEventLog,
  devRuntime:GALAXY_GUARDIANS_REFERENCE_PROFILE.devRuntime,
  eventVocabulary:GALAXY_GUARDIANS_REFERENCE_PROFILE.nextPromotionTargets,
  captureRescue:null,
  dualFighter:null,
  challengeStage:null,
  auroraScoring:null,
  entities:Object.freeze([]),
  bullets:Object.freeze([]),
  events:Object.freeze([])
 });
}

const GALAXY_GUARDIANS_GAMEPLAY_ADAPTER_SKELETON=Object.freeze({
 gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
 label:'Galaxy Guardians disabled gameplay skeleton',
 enabled:0,
 publicPlayable:0,
 evidenceRequired:1,
 referenceProfile:GALAXY_GUARDIANS_REFERENCE_PROFILE,
 profile:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE,
 forbiddenAuroraCapabilities:GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES,
 createInitialState:createGalaxyGuardiansInitialState,
 start(){
  throw new Error('Galaxy Guardians gameplay adapter is disabled until measured 0.1 scout-wave evidence exists.');
 }
});

let GALAXY_GUARDIANS_ACTIVE_DEV_STATE=null;

function galaxyGuardiansDevPreviewAllowed(){
 const channel=typeof BUILD_INFO!=='undefined'
  ? String(BUILD_INFO.releaseChannel||'development').toLowerCase()
  : '';
 const allowedChannels=Array.from(GALAXY_GUARDIANS_PLAYABLE_PREVIEW_RELEASE_CHANNELS)
  .map(value=>String(value).toLowerCase());
 return typeof BUILD_INFO!=='undefined'
  && allowedChannels.includes(channel)
  && !!(GALAXY_GUARDIANS_RUNTIME_PROFILE.previewPlayable||GALAXY_GUARDIANS_RUNTIME_PROFILE.devPlayable);
}

function syncGalaxyGuardiansShellState(state){
 if(!state)return;
 S.score=state.score|0;
 S.stage=state.stage|0;
 S.lives=Math.max(0,(state.lives|0)-1);
 S.harnessPersona=String(window.__platinumHarnessPersona||window.__auroraHarnessPersona||'').toLowerCase();
 if(typeof currentGamePackStagePresentation==='function')S.stagePresentation=currentGamePackStagePresentation(S.stage,0);
 if(typeof stageBandProfile==='function')S.profile=stageBandProfile(S.stage,0);
 S.stageClock=+state.t||0;
 S.simT=+state.t||0;
 S.challenge=0;
 S.liveCount=state.aliens.filter(alien=>alien.hp>0).length;
 S.stats={
  shots:+state.stats?.shots||0,
  hits:+state.stats?.hits||0
 };
 if(state.gameOver){
  if(!gameOverState&&typeof buildGameOverState==='function'){
   const completed=!!state.completed||String(state.gameOverReason||'')==='mission_complete';
   gameOverState=buildGameOverState(state.score|0,state.stage|0,false,completed?{
    outcome:'mission_complete',
    resultTitle:'MISSION COMPLETE',
    resultSub:'SIGNAL RACK BROKEN'
   }:undefined);
   if(gameOverState&&!gameOverState.editing&&typeof submitGameOverScore==='function')submitGameOverScore();
  }
  gameOverHtml=typeof buildGameOverHtmlFromState==='function'
   ? buildGameOverHtmlFromState()
   : `<span class="gameOverTitle">GAME OVER</span><span class="gameOverSub">GALAXY GUARDIANS</span><span class="gameOverLine">SCORE ${String(state.score|0).padStart(6,'0')}</span><span class="gameOverHint">PRESS ENTER TO PLAY AGAIN</span>`;
  if(msg){
   msg.className='gameOverScreen';
   msg.innerHTML=gameOverHtml;
  }
  return;
 }
 gameOverHtml='';
}

function closeGalaxyGuardiansDevOverlays(){
 if(typeof closeAccountPanel==='function')closeAccountPanel();
 if(typeof closeLeaderboardPanel==='function')closeLeaderboardPanel();
 if(typeof closeSettings==='function')closeSettings();
 if(typeof closeHelp==='function'&&helpOpen)closeHelp(1);
 if(typeof closeFeedback==='function'&&feedbackOpen)closeFeedback(1);
 if(typeof closeGamePreview==='function')closeGamePreview(1);
 if(typeof closeMoviePanel==='function'&&typeof isMoviePanelOpen==='function'&&isMoviePanelOpen())closeMoviePanel(1);
}

function startGalaxyGuardiansDevPreview(cfg={}){
 if(!galaxyGuardiansDevPreviewAllowed()){
  showToast('Galaxy Guardians playable preview is unavailable in this build.');
  return false;
 }
 if(typeof clearRuntimeLoopFault==='function')clearRuntimeLoopFault();
 stopAttractLoop();
 try{document.activeElement?.blur?.()}catch{}
 if(typeof resetActiveInputState==='function')resetActiveInputState('guardians_dev_preview_start');
 closeGalaxyGuardiansDevOverlays();
 resetSession('guardians_dev_preview_start');
 autoExportedSessionId='';
 const testCfg=saveTestCfg();
 setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
 aud=1;AC().resume?.();
 gameOverHtml='';gameOverState=null;
 started=1;paused=0;
 Object.assign(S,{
  score:0,
  lives:Math.max(0,(+cfg.ships||+testCfg.ships||3)-1),
  stage:Math.max(1,+cfg.stage||+testCfg.stage||1),
  shake:0,
  banner:0,
  bannerTxt:'',
  bannerMode:'',
  bannerSub:'',
  alertT:0,
 alertTxt:'',
  challenge:0,
  forceChallenge:0,
  liveCount:0,
  recoverT:0,
  attackGapT:0,
  nextStageT:0,
  postChallengeT:0,
  pendingStage:0,
  transitionMode:'',
  sequenceT:0,
  sequenceMode:'',
  attract:0,
  simT:0,
  stageClock:0
 });
 S.stats={shots:0,hits:0};
 GALAXY_GUARDIANS_ACTIVE_DEV_STATE=createGalaxyGuardiansRuntimeState({
  stage:S.stage,
  ships:Math.max(1,+cfg.ships||+testCfg.ships||3),
  seed:(+cfg.seed>>>0)||(+localStorage.getItem(SEED_PREF_KEY)>>>0)||42719,
  maxPlayableStage:Math.max(
   1,
   +cfg.maxPlayableStage
   || +(window.__platinumHarnessRuntimeOverrides?.maxPlayableStage||window.__auroraHarnessRuntimeOverrides?.maxPlayableStage||0)
   || 1
  )
 });
 GALAXY_GUARDIANS_ACTIVE_DEV_STATE.audioEventIndex=GALAXY_GUARDIANS_ACTIVE_DEV_STATE.events.length;
 syncGalaxyGuardiansShellState(GALAXY_GUARDIANS_ACTIVE_DEV_STATE);
 if(typeof resetHarnessFrameClock==='function')resetHarnessFrameClock();
 if(typeof syncPauseUi==='function')syncPauseUi();
 logEvent('game_start',{
  gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
  devPreview:1,
  persona:S.harnessPersona||null,
  maxPlayableStage:GALAXY_GUARDIANS_ACTIVE_DEV_STATE.maxPlayableStage|0
 });
 startRunRecording();
 sfx.playCue('gameStart',{phase:'stage'});
 msg.textContent='';
 c?.focus?.();
 return true;
}

function galaxyGuardiansInputFromKeys(){
 return {
  left:!!(keys.ArrowLeft||keys.KeyA||keys.KeyZ),
  right:!!(keys.ArrowRight||keys.KeyD||keys.KeyC),
  fire:!!keys.Space
 };
}

function updateGalaxyGuardiansDevPreview(dt){
 if(!GALAXY_GUARDIANS_ACTIVE_DEV_STATE)return;
 const manualInput=galaxyGuardiansInputFromKeys();
 const personaInput=!guardiansHasManualInput(manualInput)
  ? galaxyGuardiansHarnessPersonaInput(GALAXY_GUARDIANS_ACTIVE_DEV_STATE)
  : null;
 stepGalaxyGuardiansRuntime(GALAXY_GUARDIANS_ACTIVE_DEV_STATE,dt,personaInput||manualInput);
 if(typeof advanceGalaxyGuardiansPreviewStarfield==='function'){
  advanceGalaxyGuardiansPreviewStarfield(dt);
 }else if(typeof advanceSharedStarfield==='function'){
  advanceSharedStarfield(dt,{ speedStageLift:(+S.stage||0)*.12 });
 }
 playGalaxyGuardiansRuntimeCues(GALAXY_GUARDIANS_ACTIVE_DEV_STATE);
 syncGalaxyGuardiansShellState(GALAXY_GUARDIANS_ACTIVE_DEV_STATE);
 if(GALAXY_GUARDIANS_ACTIVE_DEV_STATE.gameOver){
  started=0;
  paused=0;
  if(typeof syncPauseUi==='function')syncPauseUi();
  if(typeof stopRunRecordingAfterAudioTail==='function')stopRunRecordingAfterAudioTail(2400,VIDEO_REC.sessionId);
  else stopRunRecording();
 }
}

function galaxyGuardiansCueNameForRuntimeEvent(event){
 if(!event)return '';
 if(event.type==='formation_entry_start')return 'formationPulse';
 if(event.type==='player_shot_fired')return 'playerShot';
 if(event.type==='enemy_shot')return 'enemyShot';
 if(event.type==='rack_pulse')return 'stagePulse';
 if(event.type==='alien_dive_start')return 'scoutDive';
 if(event.type==='flagship_dive_start')return 'flagshipDive';
 if(event.type==='escort_join')return 'escortJoin';
 if(event.type==='stage_advance')return 'stageAdvance';
 if(event.type==='enemy_wrap_or_return')return 'wrapReturn';
 if(event.type==='player_lost')return 'playerLoss';
 if(event.type==='mission_complete')return 'gameOver';
 if(event.type==='game_over')return 'gameOver';
 if(event.type==='player_shot_resolved'){
  if(event.result!=='hit')return '';
  if(event.role==='flagship')return 'flagshipHit';
  if(event.role==='escort')return 'escortHit';
  return 'scoutHit';
 }
 return '';
}

function playGalaxyGuardiansRuntimeCues(state){
 if(!state||!Array.isArray(state.events)||typeof sfx==='undefined'||typeof sfx.playCue!=='function')return;
 const start=Math.max(0,+state.audioEventIndex||0);
 for(let i=start;i<state.events.length;i++){
  const cueName=galaxyGuardiansCueNameForRuntimeEvent(state.events[i]);
  if(!cueName)continue;
  sfx.playCue(cueName,{phase:'stage',gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey});
 }
 state.audioEventIndex=state.events.length;
}

function currentGalaxyGuardiansDevPreviewState(){
 return GALAXY_GUARDIANS_ACTIVE_DEV_STATE;
}

function summarizeGalaxyGuardiansDevPreview(){
 return GALAXY_GUARDIANS_ACTIVE_DEV_STATE
  ? summarizeGalaxyGuardiansRuntime(GALAXY_GUARDIANS_ACTIVE_DEV_STATE)
  : null;
}

const GALAXY_GUARDIANS_DEV_PREVIEW_ADAPTER=Object.freeze({
 gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
 label:'Galaxy Guardians hosted playable preview',
 enabled:1,
 devOnly:0,
 previewOnly:1,
 publicPlayable:0,
 allowedReleaseChannels:Array.from(GALAXY_GUARDIANS_PLAYABLE_PREVIEW_RELEASE_CHANNELS),
 start:startGalaxyGuardiansDevPreview,
 update:updateGalaxyGuardiansDevPreview,
 snapshot:summarizeGalaxyGuardiansDevPreview
});

window.galaxyGuardiansDevPreviewAllowed=galaxyGuardiansDevPreviewAllowed;
window.currentGalaxyGuardiansDevPreviewState=currentGalaxyGuardiansDevPreviewState;
window.summarizeGalaxyGuardiansDevPreview=summarizeGalaxyGuardiansDevPreview;
window.galaxyGuardiansHarnessPersonaInput=galaxyGuardiansHarnessPersonaInput;
window.guardiansHarnessPersonaCfgForKey=guardiansHarnessPersonaCfgForKey;

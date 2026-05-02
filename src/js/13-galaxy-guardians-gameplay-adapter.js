// Disabled Galaxy Guardians gameplay adapter skeleton for the first owned 0.1 slice.

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
 devRuntimeStatus:'dev-runtime-slice-not-public-release',
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
 return typeof BUILD_INFO!=='undefined'
  && String(BUILD_INFO.releaseChannel||'development').toLowerCase()==='development'
  && !!GALAXY_GUARDIANS_RUNTIME_PROFILE.devPlayable
  && !GALAXY_GUARDIANS_RUNTIME_PROFILE.publicPlayable;
}

function syncGalaxyGuardiansShellState(state){
 if(!state)return;
 S.score=state.score|0;
 S.stage=state.stage|0;
 S.lives=Math.max(0,(state.lives|0)-1);
 S.stageClock=+state.t||0;
 S.simT=+state.t||0;
 S.challenge=0;
 S.liveCount=state.aliens.filter(alien=>alien.hp>0).length;
 if(state.gameOver){
  gameOverHtml=`<span class="gameOverTitle">GALAXY GUARDIANS</span><span class="gameOverSub">DEV PREVIEW COMPLETE</span><span class="gameOverLine">SCORE ${String(state.score|0).padStart(6,'0')}</span><span class="gameOverHint">CHOOSE GAME TO RETURN TO AURORA</span>`;
 }
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
  showToast('Galaxy Guardians playable preview is available only in development builds.');
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
 GALAXY_GUARDIANS_ACTIVE_DEV_STATE=createGalaxyGuardiansRuntimeState({
  stage:S.stage,
  ships:Math.max(1,+cfg.ships||+testCfg.ships||3),
  seed:(+cfg.seed>>>0)||(+localStorage.getItem(SEED_PREF_KEY)>>>0)||42719
 });
 GALAXY_GUARDIANS_ACTIVE_DEV_STATE.audioEventIndex=GALAXY_GUARDIANS_ACTIVE_DEV_STATE.events.length;
 syncGalaxyGuardiansShellState(GALAXY_GUARDIANS_ACTIVE_DEV_STATE);
 if(typeof resetHarnessFrameClock==='function')resetHarnessFrameClock();
 if(typeof syncPauseUi==='function')syncPauseUi();
 logEvent('game_start',{gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,devPreview:1});
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
 stepGalaxyGuardiansRuntime(GALAXY_GUARDIANS_ACTIVE_DEV_STATE,dt,galaxyGuardiansInputFromKeys());
 playGalaxyGuardiansRuntimeCues(GALAXY_GUARDIANS_ACTIVE_DEV_STATE);
 syncGalaxyGuardiansShellState(GALAXY_GUARDIANS_ACTIVE_DEV_STATE);
 if(GALAXY_GUARDIANS_ACTIVE_DEV_STATE.gameOver){
  started=0;
  paused=0;
  if(typeof syncPauseUi==='function')syncPauseUi();
  stopRunRecording();
 }
}

function galaxyGuardiansCueNameForRuntimeEvent(event){
 if(!event)return '';
 if(event.type==='player_shot_fired')return 'playerShot';
 if(event.type==='enemy_shot')return 'enemyShot';
 if(event.type==='alien_dive_start')return 'scoutDive';
 if(event.type==='flagship_dive_start')return 'flagshipDive';
 if(event.type==='escort_join')return 'escortJoin';
 if(event.type==='enemy_wrap_or_return')return 'wrapReturn';
 if(event.type==='player_lost')return 'playerLoss';
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
 label:'Galaxy Guardians dev-only playable preview',
 enabled:1,
 devOnly:1,
 publicPlayable:0,
 start:startGalaxyGuardiansDevPreview,
 update:updateGalaxyGuardiansDevPreview,
 snapshot:summarizeGalaxyGuardiansDevPreview
});

window.galaxyGuardiansDevPreviewAllowed=galaxyGuardiansDevPreviewAllowed;
window.currentGalaxyGuardiansDevPreviewState=currentGalaxyGuardiansDevPreviewState;
window.summarizeGalaxyGuardiansDevPreview=summarizeGalaxyGuardiansDevPreview;

// Aurora-specific player lifecycle, harness control, and manual movement helpers.

function resolveDeveloperStartWatchPersona(cfg={}){
 const raw=typeof sanitizeExpertPlayPersona==='function'
  ? sanitizeExpertPlayPersona(cfg.expertPlays)
  : String(cfg.expertPlays||'human').trim().toLowerCase();
 return raw&&raw!=='human'?normalizePlayerTwoPersona(raw):'';
}

function resolveWatchChallengeStartStage(cfg={}){
 const challengeStage=cl(+cfg.challengeStage||DEFAULT_TEST_CFG.challengeStage||1,1,99)|0;
 const stage=internalStageForChallengeStageNumber(challengeStage);
 return {requestedStage:challengeStage,stage,stageMode:'display',forceChallenge:1,startKind:'challenge',challengeStage,displayLabel:challengeStageDisplayLabel(challengeStage,{challengeNumber:1}),watchScope:'challenges'};
}

function startAuroraGameplay(){
 if(typeof clearRuntimeLoopFault==='function')clearRuntimeLoopFault();
 if(typeof clearPlayerTwoAutoTurnTimer==='function')clearPlayerTwoAutoTurnTimer();
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
 let startStage=resolveGameplayStartStage(cfg);
 const extendRules=currentGamePack()?.scoring?.extends||{};
 const extendFirst=Math.max(0,Number.isFinite(+cfg.extendFirst)?(+cfg.extendFirst|0):(+extendRules.first||0));
 const extendRecurring=Math.max(0,Number.isFinite(+cfg.extendRecurring)?(+cfg.extendRecurring|0):(+extendRules.recurring||0));
 const nextExtendScore=extendFirst>0?extendFirst:(extendRecurring>0?extendRecurring:0);
 setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
 const pendingPlayerTwoTurn=resolvePendingPlayerTwoTurn();
 const armedWatchPersona=resolveWatchModeStartPersona();
 const armedWatchScope=armedWatchPersona?resolveWatchModeStartScope():'';
 const developerWatchPersona=resolveDeveloperStartWatchPersona(cfg);
 const watchPersona=pendingPlayerTwoTurn?'':(armedWatchPersona||developerWatchPersona);
 const watchScope=watchPersona?normalizeWatchScope(armedWatchScope||'game'):'game';
 if(watchPersona&&watchScope==='challenges'&&armedWatchPersona)startStage=resolveWatchChallengeStartStage(cfg);
 const playerTwoRun=pendingPlayerTwoTurn||resolvePlayerTwoStartState({
  stage:startStage.stage,
  lives:Math.max(0,cfg.ships-1),
  forceChallenge:startStage.forceChallenge?1:0
 });
 const playerTwoLane=playerTwoRun?.enabled?preparePlayerTwoRunForStart(playerTwoRun,{
  stage:startStage.stage,
  lives:Math.max(0,cfg.ships-1),
  forceChallenge:startStage.forceChallenge?1:0
 }):null;
 const runScore=playerTwoLane?Math.max(0,+playerTwoLane.score||0):0;
 const runLives=playerTwoLane?Math.max(0,+playerTwoLane.lives||0):Math.max(0,cfg.ships-1);
 const runStage=playerTwoLane?Math.max(1,+playerTwoLane.stage||startStage.stage):startStage.stage;
 aud=1;AC().resume?.();
 gameOverHtml='';gameOverState=null;
started=1;paused=0;Object.assign(S,{score:runScore,lives:runLives,stage:runStage,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,startCueT:0,formationCueT:0,audioPulseHoldT:0,rogue:0,alertT:0,forceChallenge:playerTwoLane?((+playerTwoLane.forceChallenge||0)?1:0):(startStage.forceChallenge?1:0),liveCount:40,recoverT:0,attackGapT:0,nextStageT:0,postChallengeT:0,pendingStage:0,transitionMode:'',lastChallengeClearT:null,challengeTransitionStallLogged:0,transitionCueT:0,transitionCueKind:0,challengeResultCueT:0,challengeResultPerfect:0,sequenceT:0,sequenceMode:'',attract:0,simT:0,extendFirst,extendRecurring,nextExtendScore,extendAwards:0,extendFlashT:0,extendFlashShips:0,playerTwo:playerTwoRun,watchMode:watchPersona?1:0,watchPersona:watchPersona||'',watchScope,commentaryT:0,commentaryCooldown:0,commentaryTitle:'',commentaryLines:[]});
 if(typeof resetHarnessFrameClock==='function')resetHarnessFrameClock();
 if(typeof syncPauseUi==='function')syncPauseUi();
 S.harnessPersona=(watchPersona||(playerTwoRun?.activeTurn==='p2'?playerTwoRun.personaKey:'')||window.__platinumHarnessPersona||window.__auroraHarnessPersona||'').toLowerCase();
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{x:PLAY_W/2,y:PLAY_H-VIS.playerBottom,inv:0,dual:0,captured:0,returning:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0,inputResetHoldT:0,vx:0});
 logEvent('game_start',{persona:S.harnessPersona||null,watchMode:!!S.watchMode,watchScope:S.watchScope||'game',developerExpertPlay:developerWatchPersona||'',requestedStage:startStage.requestedStage,stage:startStage.stage,startStageMode:startStage.stageMode,startKind:startStage.startKind||'level',challengeStage:startStage.challengeStage||null,displayLabel:startStage.displayLabel||'',forceChallenge:startStage.forceChallenge,playerTwo:playerTwoRun?.enabled?playerTwoSnapshot(playerTwoRun):null});
 startRunRecording();
 spawnStage();msg.textContent='';
 const openingTiming=(!startStage.forceChallenge&&startStage.stage===1&&usesReferenceTimingModel())
  ? currentGamePackReferenceTiming('stage1Opening')
  : null;
 if(usesRuntimeGalagaReferenceAudio()){
  sfx.stopCueNames(['attractEnter','attractPulse','stagePulse','stageTransition','challengeTransition','challengeResults','challengePerfect','gameOver']);
 }
 sfx.start();
 if(S.watchMode){
  const scopeLine=S.watchScope==='challenges'?`\n${watchModeScopeLabel(S.watchScope)}`:'';
  S.alertTxt=`WATCH MODE\n${watchModePersonaLabel(S.watchPersona)} PILOT${scopeLine}`;
  S.alertT=Math.max(S.alertT,1.8);
  if(typeof commentatorEvent==='function')commentatorEvent('watch_mode',{persona:S.watchPersona,label:watchModePersonaLabel(S.watchPersona),scope:S.watchScope||'game'});
 }else if(playerTwoRun?.enabled&&playerTwoRun.activeTurn==='p2'){
  S.alertTxt=`2UP TURN\n${playerTwoRun.label||watchModePersonaLabel(playerTwoRun.personaKey)} PILOT`;
  S.alertT=Math.max(S.alertT,1.8);
  if(typeof logEvent==='function')logEvent('player_two_turn_active',playerTwoSnapshot(playerTwoRun));
  if(typeof commentatorEvent==='function')commentatorEvent('player_two_turn_start',playerTwoSnapshot(playerTwoRun));
 }else if(playerTwoRun?.enabled&&typeof commentatorEvent==='function'){
  commentatorEvent('player_two_queued',playerTwoSnapshot(playerTwoRun));
 }
 S.startCueT=0;
 if(openingTiming){
  S.formationCueT=openingTiming.formationArrivalDelay;
  S.seqT=Math.max(+S.seqT||0,openingTiming.firstPulseDelay);
  S.audioPulseHoldT=Math.max(+S.audioPulseHoldT||0,openingTiming.firstPulseDelay+.15);
 }else if(usesRuntimeGalagaReferenceAudio()){
  S.seqT=Math.max(+S.seqT||0,3.05);
  S.audioPulseHoldT=Math.max(+S.audioPulseHoldT||0,3.15);
 }
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
 if(typeof handlePlayerTwoShipLoss==='function'&&handlePlayerTwoShipLoss(cause))return;
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
 if(typeof updatePlayerTwoGameOverState==='function')updatePlayerTwoGameOverState();
 started=0;
 paused=0;
 if(typeof syncPauseUi==='function')syncPauseUi();
 gameOverState=buildGameOverState(S.score,S.stage,!!S.challenge);
 gameOverHtml=buildGameOverHtmlFromState();
 if(typeof queuePlayerTwoAutoTurn==='function'&&queuePlayerTwoAutoTurn('auto'))gameOverHtml=buildGameOverHtmlFromState();
 if(gameOverState&&!gameOverState.editing&&!gameOverState.watchMode&&!gameOverState.playerTwoMode&&typeof submitGameOverScore==='function')submitGameOverScore();
 if(usesRuntimeGalagaReferenceAudio()&&typeof sfx.stopCueNames==='function'){
  sfx.stopCueNames(['stagePulse','stageTransition','challengeTransition','challengeResults','challengePerfect']);
 }
 sfx.over();
 if(VIDEO_REC.enabled)exportSession({auto:1,silent:1});
 if(typeof stopRunRecordingAfterAudioTail==='function')stopRunRecordingAfterAudioTail(7000,VIDEO_REC.sessionId);
 else stopRunRecording();
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
 novice:{name:'novice',captureRescueStyle:'rare-opportunistic',moveMul:.5,urgentDx:28,urgentLook:132,deadZone:10,aimBoss:11,aimOther:8,fireChance:.46,challengeFireChance:.42,openShotY:94,diveBias:260,carryBias:80,captureRescueBias:150,captureRescueUnsafePenalty:60,bossBias:80,activeBias:70,heightBias:.8,distanceBias:1.15},
 advanced:{name:'advanced',captureRescueStyle:'practical-rescue',moveMul:.64,urgentDx:36,urgentLook:170,deadZone:9,aimBoss:15,aimOther:11,fireChance:.84,challengeFireChance:.82,openShotY:72,diveBias:360,carryBias:110,captureRescueBias:260,captureRescueUnsafePenalty:110,bossBias:135,activeBias:112,heightBias:1.02,distanceBias:.95},
 expert:{name:'expert',captureRescueStyle:'rescue-priority',moveMul:.84,urgentDx:38,urgentLook:180,deadZone:7,aimBoss:18,aimOther:13,fireChance:.96,challengeFireChance:.97,openShotY:66,diveBias:470,carryBias:135,captureRescueBias:390,captureRescueUnsafePenalty:170,bossBias:150,activeBias:116,heightBias:1.05,distanceBias:.94,cautiousUntilStage:2,lowerDiveEvadeY:208,lowerDiveEvadeDx:40,lowerDiveEvadeLaneGap:1,diveEmergencyY:236,diveEmergencyDx:26},
 professional:{name:'professional',captureRescueStyle:'rescue-first-arcade',moveMul:.88,urgentDx:42,urgentLook:198,deadZone:5,aimBoss:22,aimOther:16,fireChance:.99,challengeFireChance:.995,openShotY:58,diveBias:600,carryBias:160,captureRescueBias:500,captureRescueUnsafePenalty:220,bossBias:175,activeBias:128,heightBias:1.12,distanceBias:.86}
};

const PLAYER_TWO_PERSONA_ORDER=Object.freeze(['novice','advanced','expert','professional']);
const PLAYER_TWO_PERSONA_PROFILES=Object.freeze({
 novice:Object.freeze({id:'novice',label:'BEGINNER',initials:'BEG',scorePerSecond:34,stageSeconds:126,variance:.14}),
 advanced:Object.freeze({id:'advanced',label:'INTERMEDIATE',initials:'INT',scorePerSecond:55,stageSeconds:98,variance:.12}),
 expert:Object.freeze({id:'expert',label:'EXPERT',initials:'EXP',scorePerSecond:78,stageSeconds:78,variance:.1}),
 professional:Object.freeze({id:'professional',label:'PROFESSIONAL',initials:'PRO',scorePerSecond:96,stageSeconds:66,variance:.08})
});
const PLAYER_TWO_PERSONA_DESCRIPTIONS=Object.freeze({
 novice:'Careful learner: slower movement, conservative shots, safer reactions.',
 advanced:'Balanced pilot: steady movement, practical survival, opportunistic rescue shots.',
 expert:'Aggressive pilot: faster tracking, tighter aim, and stronger capture-rescue priority.',
 professional:'Arcade-grade pilot: high tempo, sharper aim, rescue-first pressure movement.'
});
let playerTwoAutoTurnTimer=null;

function clearPlayerTwoAutoTurnTimer(){
 if(playerTwoAutoTurnTimer){
  clearTimeout(playerTwoAutoTurnTimer);
  playerTwoAutoTurnTimer=null;
 }
}

function normalizePlayerTwoPersona(value=''){
 const key=String(value||'').trim().toLowerCase();
 return PLAYER_TWO_PERSONA_PROFILES[key]?key:'advanced';
}
function currentGameSupportsPlayerTwo(){
 const pack=typeof currentGamePack==='function'?currentGamePack():null;
 return typeof gamePackSupportsPersonaRival==='function'
  ? gamePackSupportsPersonaRival(pack)
  : (pack?.metadata?.gameKey||'aurora-galactica')==='aurora-galactica';
}
function currentGameSupportsWatchMode(){
 const pack=typeof currentGamePack==='function'?currentGamePack():null;
 const supports=typeof gamePackSupportsWatchMode==='function'
  ? gamePackSupportsWatchMode(pack)
  : true;
 const canStart=typeof currentGamePackCanStart==='function'
  ? currentGamePackCanStart()
  : (typeof currentGamePackPlayable==='function'?currentGamePackPlayable():true);
 return !!(supports&&canStart);
}
function playerTwoAuthReady(){
 if(window.__platinumHarnessPlayerTwoAuth||window.__auroraHarnessPlayerTwoAuth)return true;
 return typeof LEADERBOARD!=='undefined'&&!!LEADERBOARD?.user&&(typeof remoteAuthEnabled!=='function'||remoteAuthEnabled());
}
function selectedPlayerTwoMode(){
 return readPref(PLAYER_TWO_MODE_PREF_KEY)==='2';
}
function selectedPlayerTwoPersona(){
 return normalizePlayerTwoPersona(readPref(PLAYER_TWO_PERSONA_PREF_KEY)||'advanced');
}
function playerTwoSelectionState(){
 const personaKey=selectedPlayerTwoPersona();
 const profile=PLAYER_TWO_PERSONA_PROFILES[personaKey]||PLAYER_TWO_PERSONA_PROFILES.advanced;
 return{
  supported:currentGameSupportsPlayerTwo(),
  signedIn:playerTwoAuthReady(),
  selected:selectedPlayerTwoMode(),
  personaKey,
  personaLabel:profile.label,
  personaInitials:profile.initials,
  personaPolicy:playerPersonaCardSummary(personaKey)
 };
}
function selectedWatchPersona(){
 const pack=typeof currentGamePack==='function'?currentGamePack():null;
 const config=typeof gamePackModalityConfig==='function'?gamePackModalityConfig(pack,'watch'):null;
 return normalizePlayerTwoPersona(readPref(WATCH_MODE_PERSONA_PREF_KEY)||config?.defaultPersona||'advanced');
}
function setWatchPersona(key,opts={}){
 const personaKey=normalizePlayerTwoPersona(key);
 writePref(WATCH_MODE_PERSONA_PREF_KEY,personaKey);
 if(!opts.silent&&typeof logEvent==='function')logEvent('watch_mode_persona_selected',{persona:personaKey,source:opts.source||'ui'});
 return personaKey;
}
function cycleWatchPersona(dir=1,opts={}){
 const current=selectedWatchPersona();
 const idx=Math.max(0,PLAYER_TWO_PERSONA_ORDER.indexOf(current));
 const next=PLAYER_TWO_PERSONA_ORDER[(idx+(dir<0?-1:1)+PLAYER_TWO_PERSONA_ORDER.length)%PLAYER_TWO_PERSONA_ORDER.length];
 return setWatchPersona(next,opts);
}
function watchModePersonaLabel(key=selectedWatchPersona()){
 return (PLAYER_TWO_PERSONA_PROFILES[normalizePlayerTwoPersona(key)]||PLAYER_TWO_PERSONA_PROFILES.advanced).label;
}
function normalizeWatchScope(value=''){
 const key=String(value||'').trim().toLowerCase().replace(/[_\s-]+/g,'');
 return key==='challenge'||key==='challenges'||key==='challengesonly'||key==='tour'?'challenges':'game';
}
function selectedWatchScope(){
 return normalizeWatchScope(readPref(WATCH_MODE_SCOPE_PREF_KEY)||'game');
}
function setWatchScope(scope,opts={}){
 const next=normalizeWatchScope(scope);
 writePref(WATCH_MODE_SCOPE_PREF_KEY,next);
 if(!opts.silent&&typeof logEvent==='function')logEvent('watch_mode_scope_selected',{scope:next,source:opts.source||'ui'});
 return next;
}
function cycleWatchScope(dir=1,opts={}){
 const current=selectedWatchScope();
 return setWatchScope(current==='game'?'challenges':'game',opts);
}
function watchModeScopeLabel(scope=selectedWatchScope()){
 return normalizeWatchScope(scope)==='challenges'?'CHALLENGE TOUR':'GAME';
}
function playerPersonaCardSummary(key='advanced'){
 const personaKey=normalizePlayerTwoPersona(key);
 const profile=PLAYER_TWO_PERSONA_PROFILES[personaKey]||PLAYER_TWO_PERSONA_PROFILES.advanced;
 const policy=HARNESS_PERSONAS[personaKey]||HARNESS_PERSONAS.advanced;
 return{
  key:personaKey,
  label:profile.label,
  initials:profile.initials,
  description:PLAYER_TWO_PERSONA_DESCRIPTIONS[personaKey]||PLAYER_TWO_PERSONA_DESCRIPTIONS.advanced,
  captureRescueStyle:policy.captureRescueStyle||'',
  carryBias:+policy.carryBias||0,
  captureRescueBias:+policy.captureRescueBias||0,
  captureRescueUnsafePenalty:+policy.captureRescueUnsafePenalty||0
 };
}
function armWatchMode(personaKey=selectedWatchPersona(),opts={}){
 if(!currentGameSupportsWatchMode()){
  if(typeof showToast==='function')showToast('Watch Mode is unavailable for this cabinet.');
  if(typeof logEvent==='function')logEvent('watch_mode_blocked',{source:opts.source||'ui',reason:'unsupported_game'});
  return '';
 }
 const key=setWatchPersona(personaKey,{silent:1,source:opts.source||'ui'});
 const scope=setWatchScope(opts.scope||selectedWatchScope(),{silent:1,source:opts.source||'ui'});
 setPlayerTwoSelection(false,{silent:1,source:opts.source||'ui'});
 window.__platinumWatchModePersona=key;
 window.__auroraWatchModePersona=key;
 window.__platinumWatchModeScope=scope;
 window.__auroraWatchModeScope=scope;
 if(typeof logEvent==='function')logEvent('watch_mode_armed',{persona:key,scope,source:opts.source||'ui'});
 if(typeof launchCurrentGameFromWaitMode==='function')launchCurrentGameFromWaitMode();
 return key;
}
function resolveWatchModeStartPersona(){
 const key=normalizePlayerTwoPersona(window.__platinumWatchModePersona||window.__auroraWatchModePersona||'');
 if(!(window.__platinumWatchModePersona||window.__auroraWatchModePersona))return '';
 delete window.__platinumWatchModePersona;
 delete window.__auroraWatchModePersona;
 return key;
}
function resolveWatchModeStartScope(){
 const armed=window.__platinumWatchModeScope||window.__auroraWatchModeScope||'';
 if(!armed)return '';
 delete window.__platinumWatchModeScope;
 delete window.__auroraWatchModeScope;
 return normalizeWatchScope(armed);
}
function resolvePendingPlayerTwoTurn(){
 const pending=window.__platinumPendingPlayerTwoTurn||window.__auroraPendingPlayerTwoTurn||null;
 delete window.__platinumPendingPlayerTwoTurn;
 delete window.__auroraPendingPlayerTwoTurn;
 if(!pending||!pending.enabled)return null;
 const personaKey=normalizePlayerTwoPersona(pending.personaKey||pending.persona||'advanced');
 const profile=PLAYER_TWO_PERSONA_PROFILES[personaKey]||PLAYER_TWO_PERSONA_PROFILES.advanced;
 const p2=Object.assign({},pending,{
  enabled:true,
  eligibleForLeaderboard:false,
  mode:'persona-rival',
  turnModel:'galaga-per-life-alternation',
  activeTurn:pending.activeTurn==='p1'?'p1':'p2',
  personaKey,
  label:profile.label,
  initials:profile.initials,
  nextLogT:+pending.nextLogT||8
 });
 ensurePlayerTwoLaneStates(p2,{stage:+pending.stage||1,lives:Math.max(0,(+pending.lives||3)-1)});
 return p2;
}
function setPlayerTwoPersona(key,opts={}){
 const personaKey=normalizePlayerTwoPersona(key);
 writePref(PLAYER_TWO_PERSONA_PREF_KEY,personaKey);
 if(!opts.silent&&typeof logEvent==='function')logEvent('player_two_persona_selected',{persona:personaKey,source:opts.source||'ui'});
 return personaKey;
}
function cyclePlayerTwoPersona(dir=1,opts={}){
 const current=selectedPlayerTwoPersona();
 const idx=Math.max(0,PLAYER_TWO_PERSONA_ORDER.indexOf(current));
 const next=PLAYER_TWO_PERSONA_ORDER[(idx+(dir<0?-1:1)+PLAYER_TWO_PERSONA_ORDER.length)%PLAYER_TWO_PERSONA_ORDER.length];
 return setPlayerTwoPersona(next,opts);
}
function blockPlayerTwoSelection(source='ui'){
 const supported=currentGameSupportsPlayerTwo();
 setAccountNotice(supported?'Sign in to choose 2 PLAYERS with a persona rival.':'2UP persona Rival is not available for this cabinet.');
 if(supported&&typeof openAccountPanel==='function')openAccountPanel();
 if(typeof showToast==='function')showToast(supported?'Sign in to choose 2 PLAYERS.':'2UP persona Rival is not available for this cabinet.');
 if(typeof logEvent==='function')logEvent('player_two_mode_blocked',{source,reason:currentGameSupportsPlayerTwo()?'sign_in_required':'unsupported_game'});
}
function setPlayerTwoSelection(enabled,opts={}){
 const want=!!enabled;
 if(want&&(!currentGameSupportsPlayerTwo()||!playerTwoAuthReady())){
  writePref(PLAYER_TWO_MODE_PREF_KEY,'1');
  if(!opts.silent)blockPlayerTwoSelection(opts.source||'ui');
  return false;
 }
 writePref(PLAYER_TWO_MODE_PREF_KEY,want?'2':'1');
 if(!opts.silent&&typeof logEvent==='function')logEvent('player_two_mode_selected',{mode:want?'2p':'1p',persona:selectedPlayerTwoPersona(),source:opts.source||'ui'});
 return true;
}
function playerTwoHashUnit(seed){
 let h=2166136261>>>0;
 const txt=String(seed||'');
 for(let i=0;i<txt.length;i++){
  h^=txt.charCodeAt(i);
  h=Math.imul(h,16777619)>>>0;
 }
 h=(h+0x6D2B79F5)|0;
 let t=Math.imul(h^h>>>15,1|h);
 t^=t+Math.imul(t^t>>>7,61|t);
 return ((t^t>>>14)>>>0)/4294967296;
}

function playerTwoStatsCopy(stats={}){
 return {shots:Math.max(0,+stats.shots||0)|0,hits:Math.max(0,+stats.hits||0)|0};
}
function playerTwoClonePojo(value,fallback=null){
 if(value==null)return fallback;
 try{return JSON.parse(JSON.stringify(value));}catch{return fallback;}
}
function playerTwoBoardSnapshot(){
 return{
  version:1,
  stage:Math.max(1,+S.stage||1)|0,
  challenge:!!S.challenge,
  forceChallenge:+S.forceChallenge?1:0,
  stageClock:+(+S.stageClock||0).toFixed(3),
  simT:+(+S.simT||0).toFixed(3),
  fireCD:+(+S.fireCD||0).toFixed(3),
  recoverT:+(+S.recoverT||0).toFixed(3),
  attackGapT:+(+S.attackGapT||0).toFixed(3),
  nextStageT:+(+S.nextStageT||0).toFixed(3),
  postChallengeT:+(+S.postChallengeT||0).toFixed(3),
  pendingStage:Math.max(0,+S.pendingStage||0)|0,
  transitionMode:String(S.transitionMode||''),
  lastChallengeClearT:S.lastChallengeClearT==null?null:+(+S.lastChallengeClearT||0).toFixed(3),
  challengeTransitionStallLogged:+S.challengeTransitionStallLogged?1:0,
  transitionCueT:+(+S.transitionCueT||0).toFixed(3),
  transitionCueKind:+S.transitionCueKind?1:0,
  challengeResultCueT:+(+S.challengeResultCueT||0).toFixed(3),
  challengeResultPerfect:+S.challengeResultPerfect?1:0,
  sequenceT:+(+S.sequenceT||0).toFixed(3),
  sequenceMode:String(S.sequenceMode||''),
  scriptMode:+S.scriptMode?1:0,
  scriptT:+(+S.scriptT||0).toFixed(3),
  scriptI:Math.max(0,+S.scriptI||0)|0,
  scriptShotI:Math.max(0,+S.scriptShotI||0)|0,
  scriptShotT:+(+S.scriptShotT||0).toFixed(3),
  startCueT:+(+S.startCueT||0).toFixed(3),
  formationCueT:+(+S.formationCueT||0).toFixed(3),
  audioPulseHoldT:+(+S.audioPulseHoldT||0).toFixed(3),
  seq:Math.max(0,+S.seq||0)|0,
  seqT:+(+S.seqT||0).toFixed(3),
  liveCount:S.e.filter(e=>e&&e.hp>0).length,
  captureCountStage:Math.max(0,+S.captureCountStage||0)|0,
  lastCaptureStartT:S.lastCaptureStartT==null?null:+(+S.lastCaptureStartT||0).toFixed(3),
  lastFighterCapturedT:S.lastFighterCapturedT==null?null:+(+S.lastFighterCapturedT||0).toFixed(3),
  stage4Lane2PriorityDive:+S.stage4Lane2PriorityDive?1:0,
  rogue:Math.max(0,+S.rogue||0)|0,
  att:Math.max(0,+S.att||0)|0,
  p:playerTwoClonePojo(S.p,{}),
  e:playerTwoClonePojo(S.e,[]),
  pb:playerTwoClonePojo(S.pb,[]),
  eb:playerTwoClonePojo(S.eb,[]),
  fx:playerTwoClonePojo(S.fx,[]),
  ch:playerTwoClonePojo(S.ch,null),
  cap:playerTwoClonePojo(S.cap,null)
 };
}
function restorePlayerTwoBoardSnapshot(board){
 if(!board||board.version!==1)return false;
 S.stage=Math.max(1,+board.stage||1)|0;
 S.forceChallenge=+board.forceChallenge?1:0;
 S.challenge=!!board.challenge;
 S.profile=stageBandProfile(S.stage,S.challenge);
 S.t=stageTune(S.stage,S.challenge);
 S.stagePresentation=currentGamePackStagePresentation(S.stage,S.challenge);
 S.stageClock=+(+board.stageClock||0);
 S.simT=+(+board.simT||0);
 S.fireCD=+(+board.fireCD||0);
 S.recoverT=+(+board.recoverT||0);
 S.attackGapT=+(+board.attackGapT||0);
 S.nextStageT=+(+board.nextStageT||0);
 S.postChallengeT=+(+board.postChallengeT||0);
 S.pendingStage=Math.max(0,+board.pendingStage||0)|0;
 S.transitionMode=String(board.transitionMode||'');
 S.lastChallengeClearT=board.lastChallengeClearT==null?null:+board.lastChallengeClearT;
 S.challengeTransitionStallLogged=+board.challengeTransitionStallLogged?1:0;
 S.transitionCueT=+(+board.transitionCueT||0);
 S.transitionCueKind=+board.transitionCueKind?1:0;
 S.challengeResultCueT=+(+board.challengeResultCueT||0);
 S.challengeResultPerfect=+board.challengeResultPerfect?1:0;
 S.sequenceT=+(+board.sequenceT||0);
 S.sequenceMode=String(board.sequenceMode||'');
 S.scriptMode=+board.scriptMode?1:0;
 S.scriptT=+(+board.scriptT||0);
 S.scriptI=Math.max(0,+board.scriptI||0)|0;
 S.scriptShotI=Math.max(0,+board.scriptShotI||0)|0;
 S.scriptShotT=+(+board.scriptShotT||0);
 S.startCueT=+(+board.startCueT||0);
 S.formationCueT=+(+board.formationCueT||0);
 S.audioPulseHoldT=+(+board.audioPulseHoldT||0);
 S.seq=Math.max(0,+board.seq||0)|0;
 S.seqT=+(+board.seqT||0);
 S.captureCountStage=Math.max(0,+board.captureCountStage||0)|0;
 S.lastCaptureStartT=board.lastCaptureStartT==null?null:+board.lastCaptureStartT;
 S.lastFighterCapturedT=board.lastFighterCapturedT==null?null:+board.lastFighterCapturedT;
 S.stage4Lane2PriorityDive=+board.stage4Lane2PriorityDive?1:0;
 S.rogue=Math.max(0,+board.rogue||0)|0;
 S.att=Math.max(0,+board.att||0)|0;
 S.p=Object.assign(S.p,playerTwoClonePojo(board.p,{}));
 S.e.length=0;S.e.push(...playerTwoClonePojo(board.e,[]));
 S.pb.length=0;S.pb.push(...playerTwoClonePojo(board.pb,[]));
 S.eb.length=0;S.eb.push(...playerTwoClonePojo(board.eb,[]));
 S.fx.length=0;S.fx.push(...playerTwoClonePojo(board.fx,[]));
 S.ch=playerTwoClonePojo(board.ch,null);
 S.cap=playerTwoClonePojo(board.cap,null);
 S.liveCount=S.e.filter(e=>e&&e.hp>0).length;
 return true;
}
function playerTwoLaneDefaults(lane='p1',opts={}){
 return{
  lane,
  score:Math.max(0,+opts.score||0)|0,
  scoreFloat:Math.max(0,+opts.scoreFloat||+opts.score||0),
  lives:Number.isFinite(+opts.lives)?Math.max(-1,+opts.lives|0):2,
  stage:Math.max(1,+opts.stage||1)|0,
  forceChallenge:+opts.forceChallenge?1:0,
  stats:playerTwoStatsCopy(opts.stats),
  elapsed:+(+opts.elapsed||0).toFixed(3),
  finished:+opts.finished?1:0,
  board:opts.board||null
 };
}
function normalizePlayerTwoLaneState(lane='p1',state={},opts={}){
 const base=playerTwoLaneDefaults(lane,opts);
 const merged=Object.assign({},base,state||{});
 merged.lane=lane;
 merged.score=Math.max(0,+merged.score||0)|0;
 merged.scoreFloat=Math.max(+merged.scoreFloat||0,merged.score);
 merged.lives=Number.isFinite(+merged.lives)?(+merged.lives|0):base.lives;
 merged.stage=Math.max(1,+merged.stage||1)|0;
 merged.forceChallenge=+merged.forceChallenge?1:0;
 merged.stats=playerTwoStatsCopy(merged.stats);
 merged.elapsed=+(+merged.elapsed||0).toFixed(3);
 merged.finished=+merged.finished?1:0;
 merged.board=merged.board&&merged.board.version===1?merged.board:null;
 return merged;
}
function ensurePlayerTwoLaneStates(p2,opts={}){
 if(!p2?.enabled)return p2;
 p2.turnModel='galaga-per-life-alternation';
 p2.p1=normalizePlayerTwoLaneState('p1',p2.p1,{stage:opts.stage,lives:opts.lives,forceChallenge:opts.forceChallenge});
 p2.p2=normalizePlayerTwoLaneState('p2',p2.p2,{stage:opts.stage,lives:opts.lives,forceChallenge:opts.forceChallenge});
 if(p2.activeTurn!=='p2'&&p2.activeTurn!=='done'&&p2.activeTurn!=='final')p2.activeTurn='p1';
 p2.humanScore=p2.p1.score;
 p2.humanStage=displayStageNumber(p2.p1.stage,!!p2.p1.forceChallenge);
 p2.score=p2.p2.score;
 p2.scoreFloat=Math.max(+p2.scoreFloat||0,p2.score);
 p2.stage=p2.p2.stage;
 p2.lives=Math.max(0,(p2.p2.lives|0)+1);
 return p2;
}
function activePlayerTwoLaneKey(p2=S.playerTwo){
 return p2?.activeTurn==='p2'?'p2':'p1';
}
function preparePlayerTwoRunForStart(p2,opts={}){
 ensurePlayerTwoLaneStates(p2,opts);
 const lane=p2[activePlayerTwoLaneKey(p2)];
 return lane||null;
}
function syncPlayerTwoActiveLane(opts={}){
 const p2=S.playerTwo;
 if(!p2?.enabled)return null;
 ensurePlayerTwoLaneStates(p2);
 const laneKey=activePlayerTwoLaneKey(p2);
 const lane=p2[laneKey];
 lane.score=Math.max(0,+S.score||0)|0;
 lane.scoreFloat=Math.max(+lane.scoreFloat||0,lane.score);
 lane.lives=Number.isFinite(+S.lives)?(+S.lives|0):lane.lives;
 lane.stage=Math.max(1,+S.stage||1)|0;
 lane.forceChallenge=+S.forceChallenge?1:0;
 lane.stats=playerTwoStatsCopy(S.stats);
 lane.elapsed=+(+lane.elapsed||0).toFixed(3);
 if(opts.captureBoard)lane.board=playerTwoBoardSnapshot();
 if(opts.finished)lane.finished=1;
 if(laneKey==='p1'){
  p2.humanScore=lane.score;
  p2.humanStage=displayStageNumber(lane.stage,!!S.challenge);
  p2.humanStats=playerTwoStatsCopy(lane.stats);
 }else{
  p2.score=lane.score;
  p2.scoreFloat=Math.max(+p2.scoreFloat||0,lane.score);
  p2.stage=displayStageNumber(lane.stage,!!S.challenge);
 }
 return lane;
}
function playerTwoOtherLaneKey(key=activePlayerTwoLaneKey()){
 return key==='p2'?'p1':'p2';
}
function playerTwoLaneDisplayName(key,p2=S.playerTwo){
 return key==='p2'?`2UP ${(p2?.initials||'---')}`:'1UP';
}
function resetPlayerForTurn(){
 Object.assign(S.p,{x:PLAY_W/2,y:PLAY_H-VIS.playerBottom,inv:1.2,dual:0,captured:0,returning:0,pending:0,spawn:.75,cd:0,capBoss:null,capT:0,inputResetHoldT:0,vx:0,demoTargetId:null,demoTargetT:0});
}
function applyPlayerTwoLaneTurn(to='p1',source='auto'){
 const p2=S.playerTwo;
 if(!p2?.enabled)return false;
 ensurePlayerTwoLaneStates(p2);
 const previous=activePlayerTwoLaneKey(p2);
 if(previous!==to)syncPlayerTwoActiveLane({captureBoard:true});
 const lane=p2[to];
 if(!lane||lane.finished)return false;
 p2.activeTurn=to;
 p2.pendingTurnSwitch=null;
 p2.turnSwitchApplied=1;
 S.score=lane.score|0;
 S.lives=Math.max(0,lane.lives|0);
 S.stage=Math.max(1,lane.stage|0);
 S.forceChallenge=lane.forceChallenge?1:0;
 S.stats=playerTwoStatsCopy(lane.stats);
 S.harnessPersona=to==='p2'?(p2.personaKey||''):'';
 if(lane.board){
  restorePlayerTwoBoardSnapshot(lane.board);
  S.score=lane.score|0;
  S.lives=Math.max(0,lane.lives|0);
  S.stats=playerTwoStatsCopy(lane.stats);
  S.harnessPersona=to==='p2'?(p2.personaKey||''):'';
  S.p.inv=Math.max(+S.p.inv||0,.9);
  S.p.spawn=Math.max(+S.p.spawn||0,.15);
 }else{
  S.pb.length=0;S.eb.length=0;S.fx.length=0;S.cap=null;S.att=0;
  S.recoverT=0;S.attackGapT=0;S.nextStageT=0;S.postChallengeT=0;S.pendingStage=0;S.transitionMode='';S.sequenceT=0;S.sequenceMode='';
  resetPlayerForTurn();
  spawnStage();
 }
 S.alertTxt=`${playerTwoLaneDisplayName(to,p2)} TURN\n${to==='p2'?(p2.label||watchModePersonaLabel(p2.personaKey)):'HUMAN PILOT'}`;
 S.alertT=Math.max(S.alertT,1.55);
 if(typeof logEvent==='function')logEvent('player_two_life_turn_start',Object.assign({lane:to,source},playerTwoSnapshot(p2)));
 if(to==='p2'&&typeof logEvent==='function')logEvent('player_two_turn_active',playerTwoSnapshot(p2));
 if(typeof commentatorEvent==='function')commentatorEvent(to==='p2'?'player_two_turn_start':'player_one_turn_start',playerTwoSnapshot(p2));
 return true;
}
function queuePlayerTwoLifeTurnSwitch(to='p2',reason='ship_lost'){
 const p2=S.playerTwo;
 if(!p2?.enabled)return false;
 ensurePlayerTwoLaneStates(p2);
 if(!p2[to]||p2[to].finished)return false;
 p2.pendingTurnSwitch={to,t:1.35,reason};
 S.alertTxt=`${playerTwoLaneDisplayName(to,p2)} READY\nNEXT SHIP`;
 S.alertT=Math.max(S.alertT,1.35);
 if(typeof logEvent==='function')logEvent('player_two_life_turn_queued',Object.assign({to,reason},playerTwoSnapshot(p2)));
 return true;
}
function consumePlayerTwoTurnSwitchApplied(){
 const p2=S.playerTwo;
 if(!p2?.turnSwitchApplied)return false;
 p2.turnSwitchApplied=0;
 return true;
}
function finalizePlayerTwoHumanScore(p2=S.playerTwo){
 if(!p2?.enabled||p2.humanRecorded)return null;
 const lane=p2.p1||{};
 const pilotInitials=((typeof lockedPilotInitials==='function'&&lockedPilotInitials())||(typeof preferredInitialsFromUser==='function'?preferredInitialsFromUser():'')).padEnd(3,'-').slice(0,3);
 const hasLockedPilotInitials=typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.user&&pilotInitials&&pilotInitials!=='---';
 const shownStage=displayStageNumber(lane.stage||S.stage,!!S.challenge);
 const res=recordScore(lane.score|0,shownStage,hasLockedPilotInitials?pilotInitials:'YOU');
 p2.humanRecorded=1;
 p2.humanRecord={entryId:res.entry.id,rank:res.rank,score:lane.score|0,stage:shownStage};
 if(typeof logEvent==='function')logEvent('player_two_human_score_recorded',p2.humanRecord);
 return p2.humanRecord;
}
function handlePlayerTwoShipLoss(cause={}){
 const p2=S.playerTwo;
 if(!p2?.enabled||S.watchMode)return false;
 ensurePlayerTwoLaneStates(p2);
 const current=activePlayerTwoLaneKey(p2);
 const currentLane=syncPlayerTwoActiveLane({finished:S.lives<0});
 if(current==='p1'&&currentLane?.finished)finalizePlayerTwoHumanScore(p2);
 const other=playerTwoOtherLaneKey(current);
 if(p2.p1?.finished&&p2.p2?.finished){
  p2.finalGameOverLane=current;
  p2.activeTurn=current==='p2'?'done':'final';
  return false;
 }
 if(S.lives>=0&&p2[other]&&!p2[other].finished){
  queuePlayerTwoLifeTurnSwitch(other,cause?.cause||'ship_lost');
  return true;
 }
 if(S.lives<0&&p2[other]&&!p2[other].finished){
  queuePlayerTwoLifeTurnSwitch(other,cause?.cause||'ship_lost');
  return true;
 }
 return false;
}

function resolvePlayerTwoStartState(startOpts={}){
 if(!selectedPlayerTwoMode())return {enabled:false};
 if(!currentGameSupportsPlayerTwo()||!playerTwoAuthReady()){
  writePref(PLAYER_TWO_MODE_PREF_KEY,'1');
  if(typeof logEvent==='function')logEvent('player_two_start_downgraded',{reason:currentGameSupportsPlayerTwo()?'sign_in_required':'unsupported_game'});
  return {enabled:false};
 }
 const personaKey=selectedPlayerTwoPersona();
 const profile=PLAYER_TWO_PERSONA_PROFILES[personaKey]||PLAYER_TWO_PERSONA_PROFILES.advanced;
 const seed=`${RNG_SEED||0}:${Date.now()}:${personaKey}:${Math.random()}`;
 const skillUnit=playerTwoHashUnit(`${seed}:skill`);
 const paceUnit=playerTwoHashUnit(`${seed}:pace`);
 const variance=1+((skillUnit*2)-1)*profile.variance;
 const pace=1+((paceUnit*2)-1)*profile.variance*.7;
 const reserveLives=Number.isFinite(+startOpts.lives)?Math.max(0,+startOpts.lives|0):2;
 const startStage=Math.max(1,+startOpts.stage||1)|0;
 const forceChallenge=+startOpts.forceChallenge?1:0;
 return{
  enabled:true,
  eligibleForLeaderboard:false,
  mode:'persona-rival',
  turnModel:'galaga-per-life-alternation',
  activeTurn:'p1',
  personaKey,
  label:profile.label,
  initials:profile.initials,
  score:0,
  scoreFloat:0,
  stage:startStage,
  lives:reserveLives+1,
  p1:playerTwoLaneDefaults('p1',{stage:startStage,lives:reserveLives,forceChallenge}),
  p2:playerTwoLaneDefaults('p2',{stage:startStage,lives:reserveLives,forceChallenge}),
  elapsed:0,
  nextLogT:8,
  seed,
  variance:+variance.toFixed(4),
  scorePerSecond:+(profile.scorePerSecond*variance).toFixed(3),
  stageSeconds:+Math.max(48,profile.stageSeconds/pace).toFixed(3)
 };
}
function updatePlayerTwoGameOverState(){
 const p2=S.playerTwo;
 if(!p2?.enabled)return;
 ensurePlayerTwoLaneStates(p2);
 if(p2.activeTurn==='p2'){
  syncPlayerTwoActiveLane({finished:1});
  p2.finished=1;
  p2.activeTurn='done';
  if(typeof logEvent==='function')logEvent('player_two_turn_complete',playerTwoSnapshot(p2));
  return;
 }
 if(p2.activeTurn==='p1'){
  syncPlayerTwoActiveLane({finished:1});
  p2.finished=1;
  p2.activeTurn='final';
  if(typeof logEvent==='function')logEvent('player_two_human_turn_complete',playerTwoSnapshot(p2));
  return;
 }
 if(p2.activeTurn==='queued'){
  p2.activeTurn='ready';
  p2.autoStartQueued=0;
  p2.autoStartDelay=2.2;
  p2.humanScore=S.score|0;
  p2.humanStage=displayStageNumber(S.stage,!!S.challenge);
  p2.humanStats={shots:S.stats.shots|0,hits:S.stats.hits|0};
  if(typeof logEvent==='function')logEvent('player_two_turn_ready',playerTwoSnapshot(p2));
 }
}
function playerTwoTurnAvailable(){
 return !!(!started&&gameOverState&&!gameOverState.editing&&S.playerTwo?.enabled&&S.playerTwo.activeTurn==='ready');
}
function queuePlayerTwoAutoTurn(source='auto'){
 clearPlayerTwoAutoTurnTimer();
 if(!playerTwoTurnAvailable())return false;
 const p2=S.playerTwo;
 const delay=Math.max(.8,Math.min(4,Number.isFinite(+p2.autoStartDelay)?+p2.autoStartDelay:2.2));
 p2.autoStartQueued=1;
 if(typeof logEvent==='function')logEvent('player_two_auto_turn_queued',Object.assign({delay:+delay.toFixed(2),source},playerTwoSnapshot(p2)));
 playerTwoAutoTurnTimer=setTimeout(()=>{
  playerTwoAutoTurnTimer=null;
  if(playerTwoTurnAvailable())startPlayerTwoTurnFromGameOver(source);
 },delay*1000);
 return true;
}
function startPlayerTwoTurnFromGameOver(source='keyboard'){
 if(!playerTwoTurnAvailable())return false;
 clearPlayerTwoAutoTurnTimer();
 if(gameOverState&&!gameOverState.editing&&!gameOverState.watchMode&&!gameOverState.playerTwoMode&&typeof submitGameOverScore==='function')submitGameOverScore();
 const p2=Object.assign({},S.playerTwo,{
  activeTurn:'p2',
  turnModel:'galaga-per-life-alternation',
  score:0,
  scoreFloat:0,
  stage:1,
  lives:3,
  elapsed:0,
  nextLogT:8,
  lastStage:1,
  autoStartQueued:0,
  source
 });
 window.__platinumPendingPlayerTwoTurn=p2;
 window.__auroraPendingPlayerTwoTurn=p2;
 if(typeof logEvent==='function')logEvent('player_two_turn_start_requested',playerTwoSnapshot(p2));
 stopAttractLoop();
 start();
 return true;
}
function updatePlayerTwoRival(dt){
 const p2=S.playerTwo;
 if(!p2?.enabled||S.attract||!started)return;
 ensurePlayerTwoLaneStates(p2);
 if(p2.pendingTurnSwitch){
  syncPlayerTwoActiveLane({captureBoard:true});
  p2.pendingTurnSwitch.t=Math.max(0,(+p2.pendingTurnSwitch.t||0)-dt);
  if(!p2.pendingTurnSwitch.t)applyPlayerTwoLaneTurn(p2.pendingTurnSwitch.to,p2.pendingTurnSwitch.reason||'auto');
  return;
 }
 if(p2.activeTurn==='p1'){
  const lane=syncPlayerTwoActiveLane();
  if(lane)lane.elapsed=+(+S.stageClock||0).toFixed(3);
  return;
 }
 if(p2.activeTurn==='p2'){
  p2.elapsed+=dt;
  const lane=syncPlayerTwoActiveLane();
  if(lane)lane.elapsed=+(+S.stageClock||0).toFixed(3);
  p2.score=S.score|0;
  p2.scoreFloat=Math.max(+p2.scoreFloat||0,p2.score);
  const shownStage=displayStageNumber(S.stage,!!S.challenge);
  if(shownStage!==p2.stage){
   p2.stage=shownStage;
   if(typeof logEvent==='function')logEvent('player_two_stage_advance',playerTwoSnapshot(p2));
   if(typeof commentatorEvent==='function')commentatorEvent('player_two_stage',playerTwoSnapshot(p2));
  }
  p2.nextLogT=Math.max(0,(+p2.nextLogT||0)-dt);
  if(!p2.nextLogT){
   p2.nextLogT=8;
   if(typeof logEvent==='function')logEvent('player_two_progress',playerTwoSnapshot(p2));
   if(typeof commentatorEvent==='function')commentatorEvent('player_two_progress',playerTwoSnapshot(p2));
  }
  return;
 }
 if(p2.activeTurn!=='simulated')return;
 p2.elapsed+=dt;
 const stageLift=1+Math.min(.34,Math.max(0,(S.stage-1)*.018));
 const challengeDrag=S.challenge ? .82 : 1;
 p2.scoreFloat+=dt*p2.scorePerSecond*stageLift*challengeDrag;
 p2.score=Math.max(p2.score|0,Math.floor(p2.scoreFloat/10)*10);
 const nextStage=Math.max(1,Math.floor(p2.elapsed/Math.max(1,p2.stageSeconds))+1);
 if(nextStage!==p2.stage){
  p2.stage=nextStage;
  if(typeof logEvent==='function')logEvent('player_two_stage_advance',playerTwoSnapshot(p2));
  if(typeof commentatorEvent==='function')commentatorEvent('player_two_stage',playerTwoSnapshot(p2));
 }
 p2.nextLogT=Math.max(0,(+p2.nextLogT||0)-dt);
 if(!p2.nextLogT){
  p2.nextLogT=8;
  if(typeof logEvent==='function')logEvent('player_two_progress',playerTwoSnapshot(p2));
  if(typeof commentatorEvent==='function')commentatorEvent('player_two_progress',playerTwoSnapshot(p2));
 }
}
function playerTwoSnapshot(state=S.playerTwo){
 const p2=state||{};
 if(!p2.enabled)return {enabled:false};
 const p1=p2.p1?normalizePlayerTwoLaneState('p1',p2.p1):null;
 const p2Lane=p2.p2?normalizePlayerTwoLaneState('p2',p2.p2):null;
 const laneSummary=lane=>lane?{
  score:lane.score,
  stage:lane.stage,
  lives:Math.max(0,lane.lives+1),
  finished:!!lane.finished,
  boardStageClock:lane.board?.version===1?+(+lane.board.stageClock||0).toFixed(3):null,
  boardEnemies:lane.board?.version===1?Math.max(0,+lane.board.liveCount||0):null
 }:null;
 return{
  enabled:true,
  mode:p2.mode||'persona-rival',
  turnModel:p2.turnModel||'galaga-per-life-alternation',
  activeTurn:p2.activeTurn||'p1',
  personaKey:p2.personaKey||'',
  label:p2.label||'',
  initials:p2.initials||'',
  score:+((p2Lane?.score??p2.score)||0)|0,
  stage:+((p2Lane?.stage??p2.stage)||1)|0,
  lives:+((p2Lane?.lives??0)+1)||0,
  humanScore:+((p1?.score??p2.humanScore)||0)|0,
  humanStage:+((p1?.stage??p2.humanStage)||0)|0,
  humanLives:+((p1?.lives??0)+1)||0,
  elapsed:+(+p2.elapsed||0).toFixed(3),
  variance:+(+p2.variance||1).toFixed(4),
  autoStartQueued:!!p2.autoStartQueued,
  pendingTurnSwitch:p2.pendingTurnSwitch?Object.assign({},p2.pendingTurnSwitch):null,
  p1:laneSummary(p1),
  p2:laneSummary(p2Lane),
  eligibleForLeaderboard:false
 };
}
function currentPilotCardState(){
 const signedIn=typeof LEADERBOARD!=='undefined'&&!!LEADERBOARD?.user;
 const verified=!!(typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.user?.email_confirmed_at);
 const humanId=typeof pilotDisplayId==='function'?pilotDisplayId():(signedIn?'PILOT':'GUEST');
 const gameTitle=typeof currentScoreStorageGameTitle==='function'
  ? String(currentScoreStorageGameTitle()||'Current Cabinet').trim()
  : 'Current Cabinet';
 const gameHudLabel=gameTitle.toUpperCase();
 const p2=S.playerTwo;
 if(S.watchMode){
  const persona=playerPersonaCardSummary(S.watchPersona||selectedWatchPersona());
  const challengesOnly=S.watchScope==='challenges';
  const watchRoute=challengesOnly?'Challenging Stage tour':'Full game flow';
  const watchScopeText=challengesOnly?'Challenging Stage tour ':'';
  return{
   mode:'watch',
   icon:'🛰',
   dockLabel:'WATCH',
   dockStatus:challengesOnly?'TOUR':persona.label,
   dockTitle:`Watch Mode: ${persona.label} pilot onboard for ${watchRoute} in ${gameTitle}`,
   panelTitle:`${gameHudLabel} WATCH`,
   panelSub:challengesOnly?'CHALLENGING STAGE WATCH PERSONA':'WATCH MODE PERSONA',
   callsign:`${persona.label} IS FLYING`,
   status:`${persona.description} ${watchRoute}. ${gameTitle} score not recorded.`,
   summary:`Watch Mode is a persona-controlled ${watchScopeText}${gameTitle} demonstration run. Scores and videos are not eligible for posting.`,
   email:'Controller: Persona pilot',
   userId:`Role: ${persona.initials} ${gameTitle} ${watchRoute} watch pilot`,
   hudHtml:`<span class="hudLabel">WATCH</span> <span class="hudValue">${persona.initials}</span>`,
   signedIn
  };
 }
 if(p2?.enabled&&(p2.activeTurn==='p2'||p2.activeTurn==='done'||p2.activeTurn==='final'||p2.activeTurn==='ready')){
  const persona=playerPersonaCardSummary(p2.personaKey||'advanced');
  const active=p2.activeTurn==='p2';
  const ready=p2.activeTurn==='ready';
  const final=p2.activeTurn==='final'||p2.activeTurn==='done';
  return{
   mode:active?'player-two-active':ready?'player-two-ready':'player-two-done',
   icon:'🧑‍🚀',
   dockLabel:active?'2UP PLAY':ready?'2UP READY':'2UP DONE',
   dockStatus:persona.label,
   dockTitle:`2UP ${persona.label} rival ${active?'flying':ready?'ready':'complete'} in ${gameTitle}`,
   panelTitle:active?`${gameHudLabel} 2UP LIVE`:ready?`${gameHudLabel} 2UP READY`:`${gameHudLabel} 2UP RESULTS`,
   panelSub:'PERSONA RIVAL PILOT',
   callsign:`2UP ${persona.label}`,
   status:`${persona.description} Human 1UP ${gameTitle} score is the only scoreboard entry.`,
   summary:active?`Persona rival is flying ${gameTitle} now. Turns alternate after each ship loss; this lane is comparison-only and will not post a score.`:ready?`Persona rival is queued for the next ${gameTitle} turn. Press 2 from results to start it.`:`${gameTitle} 2UP alternation is complete. Only the human 1UP score remains eligible.`,
   email:'Controller: Persona rival',
   userId:`Role: ${persona.initials} ${gameTitle} 2UP rival`,
   hudHtml:`<span class="playerTwoHud${active?' playerTwoHudActive':ready?' playerTwoHudReady':''}"><span class="hudLabel">${active?'2UP PLAY':ready?'2UP READY':final?'2UP DONE':'2UP'}</span> <span class="hudValue">${formatScore(p2.p2?.score??p2.score??0)}</span></span>`,
   signedIn
  };
 }
 if(p2?.enabled&&(p2.activeTurn==='p1'||p2.activeTurn==='queued')){
  const persona=playerPersonaCardSummary(p2.personaKey||'advanced');
  return{
   mode:'human-with-rival',
   icon:'🧑‍🚀',
   dockLabel:signedIn?'1UP PILOT':'1UP',
   dockStatus:signedIn?humanId:'LOCAL',
   dockTitle:signedIn?`${humanId} onboard for ${gameTitle}; ${persona.label} 2UP alternates by life`:`Local 1UP ${gameTitle} pilot; ${persona.label} 2UP alternates by life`,
   panelTitle:`${gameHudLabel} 1UP`,
   panelSub:'HUMAN TURN ACTIVE',
   callsign:signedIn?`${humanId} IS ONBOARD`:'LOCAL PILOT',
   status:`2UP ${persona.label} rival alternates after each ship loss. Human score only.`,
   summary:signedIn?`Signed in as ${LEADERBOARD.user.email}${verified?' · verified':''}. ${gameTitle} now uses arcade-style per-life 1UP/2UP alternation; 2UP rival scores do not post.`:`Local ${gameTitle} score path active. Sign in to post verified human scores.`,
   email:`Email: ${signedIn?(LEADERBOARD.user?.email||'--'):'--'}`,
   userId:`2UP rival: ${persona.label} for ${gameTitle}`,
   hudHtml:`<span class="hudLabel">PILOT</span> <span class="hudValue">${signedIn?humanId:'---'}</span>`,
   signedIn
  };
 }
 return{
  mode:signedIn?'human-signed-in':'human-local',
  icon:'🧑‍🚀',
   dockLabel:signedIn?'ONBOARD':'SIGN IN',
  dockStatus:signedIn?humanId:'Pilot offline',
  dockTitle:signedIn?`${humanId} onboard for ${gameTitle}`:`${gameTitle} Pilot Sign In`,
  panelTitle:`${gameHudLabel} PILOT`,
  panelSub:'QUICK PILOT REFERENCE',
  callsign:signedIn?`${humanId} IS ONBOARD`:'PILOT OFFLINE',
  status:signedIn?`${gameTitle} pilot identity active. Scores and records are summarized below.`:`Sign in for synced ${gameTitle} records, or keep flying locally.`,
  summary:signedIn?`This pilot card summarizes your current ${gameTitle} identity, records, and posting state.`:`Local ${gameTitle} score path is available now. Sign in when you want synced records and verified posting.`,
  email:`Email: ${signedIn?(LEADERBOARD.user?.email||'--'):'--'}`,
  userId:`User ID: ${signedIn?(LEADERBOARD.user?.id||'--'):'--'}`,
  hudHtml:`<span class="hudLabel">PILOT</span> <span class="hudValue">${signedIn?humanId:'---'}</span>`,
  signedIn
 };
}
function buildPlayerTwoStartHtml(){
 const supportsPlayerTwo=currentGameSupportsPlayerTwo();
 const supportsWatch=currentGameSupportsWatchMode();
 if(!supportsPlayerTwo&&!supportsWatch)return '';
 const state=playerTwoSelectionState();
 const watchPersona=selectedWatchPersona();
 const watchLabel=watchModePersonaLabel(watchPersona);
 const watchScope=selectedWatchScope();
 const watchScopeLabel=watchModeScopeLabel(watchScope);
 const watchScopeMeta=watchScope==='challenges'?'CHALLENGING STAGES ONLY':'GAME FLOW';
 const p2Locked=!state.signedIn;
 const p2Unsupported=!supportsPlayerTwo;
 const mode1Class=`playerModeOption playerModeSolo${state.selected?'':' isSelected'}`;
 const mode2Class=`playerModeOption playerModeTwo${state.selected?' isSelected':''}${p2Locked||p2Unsupported?' isLocked':''}`;
 const personaClass=`playerModePersona${state.selected?' isActive':''}${p2Locked||p2Unsupported?' isLocked':''}`;
 const p2Status=p2Unsupported?'AURORA ONLY':p2Locked?'SIGN IN REQUIRED':`${state.personaInitials} RIVAL`;
 const personaMeta=p2Unsupported?'RIVAL UNSUPPORTED':p2Locked?'LOCKED UNTIL SIGN-IN':'HUMAN SCORE ONLY';
 const personaHint=`<span class="k">1</span>${supportsPlayerTwo?'/<span class="k">2</span>':''} START${supportsWatch?'   <span class="k">W</span> WATCH':''}`;
 const rivalPicker=`<span class="${personaClass}" role="button" tabindex="0" data-player-two-persona="next"><span class="playerModeKey"><b>RIVAL</b><small>PILOT</small></span><span class="playerModeText playerModeStepper"><span class="playerModeArrow" data-player-two-persona="prev">&lt;</span><strong>${state.personaLabel}</strong><span class="playerModeArrow" data-player-two-persona="next">&gt;</span><em>${personaMeta}</em></span></span>`;
 const watchPicker=supportsWatch?`<span class="playerModeWatch" role="button" tabindex="0" data-watch-mode="1"><span class="playerModeKey"><span class="k">W</span><b>WATCH</b><small>PILOT</small></span><span class="playerModeStack"><span class="playerModeText playerModeStepper"><span class="playerModeArrow" data-watch-persona="prev">&lt;</span><strong>${watchLabel}</strong><span class="playerModeArrow" data-watch-persona="next">&gt;</span><em>SCORE NOT RECORDED</em></span><span class="playerModeText playerModeStepper playerModeScopeStepper"><span class="playerModeArrow" data-watch-scope="prev">&lt;</span><strong>${watchScopeLabel}</strong><span class="playerModeArrow" data-watch-scope="next">&gt;</span><em>${watchScopeMeta}</em></span></span></span>`:'';
 const playerTwoHtml=`<span class="${mode2Class}" role="button" tabindex="0" data-player-mode="2"><span class="playerModeKey"><span class="k">2</span><b>2UP</b></span><span class="playerModeText"><strong>2 PLAYERS</strong><em>${p2Status}</em></span></span>${rivalPicker}`;
 return `<span class="playerModeSelect${state.selected?' isTwoSelected':' isOneSelected'}${p2Locked||p2Unsupported?' isPlayerTwoLocked':''}" aria-label="Player mode selection"><span class="${mode1Class}" role="button" tabindex="0" data-player-mode="1"><span class="playerModeKey"><span class="k">1</span><b>1UP</b></span><span class="playerModeText"><strong>1 PLAYER</strong><em>SOLO SCORE</em></span></span>${playerTwoHtml}${watchPicker}<span class="playerModeHint">${personaHint}</span></span>`;
}
function buildPlayerTwoResultsHtml(){
 const p2=S.playerTwo;
 if(!p2?.enabled)return '';
 const human=(p2.p1?.score!=null?p2.p1.score:(p2.humanScore!=null?p2.humanScore:S.score))|0;
 const p2Score=(p2.p2?.score!=null?p2.p2.score:p2.score)|0;
 const initials=p2.initials||'---';
 if(p2.activeTurn==='ready')return `<span class="playerTwoResult playerTwoResultReady"><span class="playerTwoKicker">1UP COMPLETE</span><span class="playerTwoVersus"><span class="playerTwoLane is1up"><b>1UP</b><strong>${formatScore(human)}</strong></span><span class="playerTwoLane is2up"><b>2UP ${initials}</b><strong>${p2.autoStartQueued?'NEXT':'READY'}</strong></span></span><span class="playerTwoPrompt">2UP TURN STARTS NEXT   <span class="k">2</span> START 2UP TURN NOW</span><span class="playerTwoRule">HUMAN SCORE ONLY</span></span>`;
 if(p2.activeTurn!=='p2'&&p2.activeTurn!=='done'&&p2.activeTurn!=='final')return `<span class="playerTwoResult playerTwoResultQueued"><span class="playerTwoKicker">2UP ${initials} ${formatScore(p2Score)} READY</span><span class="playerTwoRule">PER-LIFE ALTERNATION ACTIVE   1UP SCORE IS THE ONLY SCOREBOARD ENTRY</span></span>`;
 const outcome=human>=p2Score?'1UP LEADS':'2UP LEADS';
 const humanClass=human>=p2Score?' isLeader':'';
 const p2Class=p2Score>human?' isLeader':'';
 return `<span class="playerTwoResult playerTwoResultFinal"><span class="playerTwoKicker">${outcome}</span><span class="playerTwoVersus"><span class="playerTwoLane is1up${humanClass}"><b>1UP</b><strong>${formatScore(human)}</strong><em>${Math.max(0,(p2.p1?.lives??-1)+1)} SHIPS</em></span><span class="playerTwoLane is2up${p2Class}"><b>2UP ${initials}</b><strong>${formatScore(p2Score)}</strong><em>STG ${String(p2.p2?.stage||p2.stage||1).padStart(2,'0')}</em></span></span><span class="playerTwoRule">ARCADE PER-LIFE ALTERNATION   1UP SCORE IS THE ONLY SCOREBOARD ENTRY</span></span>`;
}
function playerTwoHudHtml(){
 const p2=S.playerTwo;
 if(!p2?.enabled)return '';
 const state=p2.activeTurn==='p2'?' PLAY':p2.activeTurn==='ready'?' READY':'';
 const cls=p2.activeTurn==='p2'?' playerTwoHudActive':p2.activeTurn==='ready'?' playerTwoHudReady':'';
 return `<span class="playerTwoHud${cls}"><span class="hudLabel">2UP${state}</span> <span class="hudValue">${formatScore(p2.p2?.score??p2.score??0)}</span></span>`;
}
function handlePlayerTwoWaitKey(e){
 if(started||gameOverState?.editing)return false;
 if(gameOverState)return false;
 if(e.code==='BracketLeft'||e.code==='BracketRight'){
  e.preventDefault();
  const next=cycleWatchPersona(e.code==='BracketLeft'?-1:1,{source:'keyboard'});
  setPlayerTwoPersona(next,{silent:1,source:'keyboard'});
  if(typeof sfx!=='undefined')sfx.uiTick();
  return true;
 }
 if(e.code==='KeyW'){
  e.preventDefault();
  armWatchMode(selectedWatchPersona(),{source:'keyboard',scope:selectedWatchScope()});
  return true;
 }
 if(e.code==='Digit1'||e.code==='Numpad1'){
  e.preventDefault();
  setPlayerTwoSelection(false,{source:'keyboard'});
  if(typeof launchCurrentGameFromWaitMode==='function')launchCurrentGameFromWaitMode();
  return true;
 }
 if(e.code==='Digit2'||e.code==='Numpad2'){
  e.preventDefault();
  if(setPlayerTwoSelection(true,{source:'keyboard'})){
   if(typeof launchCurrentGameFromWaitMode==='function')launchCurrentGameFromWaitMode();
  }
  return true;
 }
 return false;
}
function handlePlayerTwoGameOverKey(e){
 if(e.code==='Digit2'||e.code==='Numpad2'){
  if(startPlayerTwoTurnFromGameOver('keyboard')){
   e.preventDefault();
   return true;
  }
 }
 return false;
}
function handlePlayerTwoWaitClick(target){
 if(started||gameOverState)return false;
 const mode=target?.closest?.('[data-player-mode]')?.getAttribute('data-player-mode');
 if(mode==='1'||mode==='2'){
  setPlayerTwoSelection(mode==='2',{source:'click'});
  if(typeof sfx!=='undefined')sfx.uiTick();
  return true;
 }
 const playerPersonaTarget=target?.closest?.('[data-player-two-persona]');
 if(playerPersonaTarget){
  const dir=playerPersonaTarget.getAttribute('data-player-two-persona')==='prev'?-1:1;
  cyclePlayerTwoPersona(dir,{source:'click'});
  if(typeof sfx!=='undefined')sfx.uiTick();
  return true;
 }
 const watchPersonaTarget=target?.closest?.('[data-watch-persona]');
 if(watchPersonaTarget){
  const dir=watchPersonaTarget.getAttribute('data-watch-persona')==='prev'?-1:1;
  cycleWatchPersona(dir,{source:'click'});
  if(typeof sfx!=='undefined')sfx.uiTick();
  return true;
 }
 const watchScopeTarget=target?.closest?.('[data-watch-scope]');
 if(watchScopeTarget){
  const dir=watchScopeTarget.getAttribute('data-watch-scope')==='prev'?-1:1;
  cycleWatchScope(dir,{source:'click'});
  if(typeof sfx!=='undefined')sfx.uiTick();
  return true;
 }
 if(target?.closest?.('[data-watch-mode]')){
  armWatchMode(selectedWatchPersona(),{source:'click',scope:selectedWatchScope()});
  return true;
 }
 return false;
}

function harnessPersonaCfg(){
 const key=(S.harnessPersona||window.__platinumHarnessPersona||window.__auroraHarnessPersona||'').toLowerCase();
 const base=HARNESS_PERSONAS[key]||null;
 const p2=S.playerTwo?.activeTurn==='p2'?S.playerTwo:null;
 if(!base||!p2)return base;
 const skill=cl(Number.isFinite(+p2.variance)?+p2.variance:1,.82,1.18);
 const agility=.92+skill*.08;
 const precision=.94+skill*.06;
 return Object.assign({},base,{
  moveMul:cl(base.moveMul*agility,.32,.98),
  urgentLook:base.urgentLook*precision,
  deadZone:Math.max(3,base.deadZone/precision),
  aimBoss:base.aimBoss*precision,
  aimOther:base.aimOther*precision,
  fireChance:cl(base.fireChance*precision,.1,.999),
  challengeFireChance:cl(base.challengeFireChance*precision,.1,.999),
  distanceBias:base.distanceBias/precision
 });
}

function harnessTargetScore(e,p,cfg){
 const rescueCandidate=!!(e.carry&&e.dive);
 const carriedBias=e.carry?(rescueCandidate?(cfg.captureRescueBias??cfg.carryBias??0):(cfg.carryBias??0)):0;
 const unsafeCarryPenalty=e.carry&&!rescueCandidate?(cfg.captureRescueUnsafePenalty||0):0;
 return (e.dive?cfg.diveBias:0)+carriedBias-unsafeCarryPenalty+(e.t==='boss'?cfg.bossBias:0)+((!e.form||e.dive||S.challenge||e.y>cfg.openShotY)?cfg.activeBias:0)+(e.y*cfg.heightBias)-(Math.abs(e.x-p.x)*cfg.distanceBias);
}

function harnessTargetDebug(target,p,cfg){
 if(!target)return {};
 return{
  targetCarry:!!target.carry,
  targetDive:+(target.dive||0),
  targetRescueCandidate:!!(target.carry&&target.dive),
  targetScore:+harnessTargetScore(target,p,cfg).toFixed(2),
  captureRescueStyle:cfg.captureRescueStyle||''
 };
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
 const detailedReason=reason&&reason!=='tick';
 if(!detailedReason&&p.hDebugT>0)return;
 if(!detailedReason)p.hDebugT=.75;
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

function harnessLowerFieldThreat(p,cfg){
 if(!cfg?.lowerDiveEvadeDx||!cfg?.lowerDiveEvadeY)return null;
 if(S.challenge)return null;
 const playerLane=playLane(p.x);
 const earlyStage=(S.stage|0)<=(cfg.cautiousUntilStage||0);
  return S.e
  .filter(e=>{
   if(!(e.hp>0&&e.dive&&e.y<p.y))return 0;
   const laneGap=Math.abs(playLane(e.x)-playerLane);
   if(earlyStage&&e.y>=cfg.lowerDiveEvadeY&&laneGap<=(cfg.lowerDiveEvadeLaneGap??1)){
    return Math.abs(e.x-p.x)<cfg.lowerDiveEvadeDx+(e.t==='boss'?6:0);
   }
   if(cfg.diveEmergencyY&&cfg.diveEmergencyDx&&e.y>=cfg.diveEmergencyY&&laneGap===0){
    return Math.abs(e.x-p.x)<cfg.diveEmergencyDx+(e.t==='boss'?4:0);
   }
   return 0;
  })
  .sort((a,b)=>{
   if(b.y!==a.y)return b.y-a.y;
   return Math.abs(a.x-p.x)-Math.abs(b.x-p.x);
  })[0]||null;
}

function harnessMoveAxis(p,cfg){
 const hp=playerHitbox();
 const urgent=S.eb.filter(b=>b.vy>0&&b.y<p.y&&p.y-b.y<cfg.urgentLook&&Math.abs(b.x-p.x)<cfg.urgentDx).sort((a,b)=>(p.y-a.y)-(p.y-b.y))[0];
 if(urgent){
  const away=urgent.x>=p.x?-1:1;
  if((away<0&&p.x>hp.w+16)||(away>0&&p.x<PLAY_W-hp.w-16))return away;
 }
 const lowerFieldThreat=harnessLowerFieldThreat(p,cfg);
 if(lowerFieldThreat){
  const away=lowerFieldThreat.x>=p.x?-1:1;
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
 const lowerFieldThreat=harnessLowerFieldThreat(p,cfg);
 const axis=harnessMoveAxis(p,cfg);
 p.x=cl(p.x+axis*p.s*dt*cfg.moveMul,hp.w+2,PLAY_W-hp.w-2);
 const attackables=S.e.filter(e=>e.hp>0&&(!e.form||e.dive||S.challenge||e.y>cfg.openShotY));
 const target=attackables.sort((a,b)=>compareHarnessTargets(a,b,p,cfg))[0]||harnessSelectTarget(p,cfg);
 logProfessionalDecision(p,cfg,'tick',Object.assign({
  attackables:attackables.length,
  targetId:target?target.id:null,
  targetX:target?+target.x.toFixed(2):null,
  targetDx:target?+(target.x-p.x).toFixed(2):null,
  axis,
  cooldown:+p.cd.toFixed(3),
  playerBullets:S.pb.length
 },harnessTargetDebug(target,p,cfg)));
 if(lowerFieldThreat){
  logProfessionalDecision(p,cfg,'lower_field_evade',{
   attackables:attackables.length,
   axis,
   threatId:lowerFieldThreat.id,
   threatType:lowerFieldThreat.t,
   threatX:+lowerFieldThreat.x.toFixed(2),
   threatY:+lowerFieldThreat.y.toFixed(2),
   threatLane:playLane(lowerFieldThreat.x)
  });
 }
 if(!target){
  logProfessionalDecision(p,cfg,'no_target',{attackables:attackables.length});
  return;
 }
 if(p.cd>0){
  logProfessionalDecision(p,cfg,'cooldown',Object.assign({attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),cooldown:+p.cd.toFixed(3)},harnessTargetDebug(target,p,cfg)));
  return;
 }
 if(S.pb.length>=bulletsMax()){
  logProfessionalDecision(p,cfg,'bullet_cap',Object.assign({attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),playerBullets:S.pb.length},harnessTargetDebug(target,p,cfg)));
  return;
 }
 const tol=target.t==='boss'?cfg.aimBoss:cfg.aimOther;
 const fireChance=S.challenge?cfg.challengeFireChance:cfg.fireChance;
 const dx=Math.abs(target.x-p.x);
 if(dx<=tol){
  if(randUnit()<=fireChance){
   shoot();
   p.hNoShotT=0;
   logProfessionalDecision(p,cfg,'shot',Object.assign({attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),tol},harnessTargetDebug(target,p,cfg)));
  }else{
   logProfessionalDecision(p,cfg,'fire_roll_miss',Object.assign({attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),tol,fireChance},harnessTargetDebug(target,p,cfg)));
  }
  return;
 }
 logProfessionalDecision(p,cfg,'not_aligned',Object.assign({attackables:attackables.length,targetId:target.id,targetX:+target.x.toFixed(2),targetDx:+(target.x-p.x).toFixed(2),tol,axis},harnessTargetDebug(target,p,cfg)));
}

function runAttractPlayer(dt,p){
 if(p.spawn>0||p.captured)return;
 p.demoTargetT=Math.max(0,(p.demoTargetT||0)-dt);
 const hw=typeof playerMovementHalfWidth==='function'?playerMovementHalfWidth(p):playerHitbox().w;
 const axis=attractMoveAxis(p);
 const targetVx=axis*p.s*.68;
 const blend=Math.min(1,p.accel*dt*.82);
 p.vx+=(targetVx-p.vx)*blend;
 if(!axis&&Math.abs(p.vx)<8)p.vx=0;
 p.x=cl(p.x+p.vx*dt,hw+2,PLAY_W-hw-2);
 if((p.x<=hw+2&&p.vx<0)||(p.x>=PLAY_W-hw-2&&p.vx>0))p.vx=0;
 const target=S.e.filter(e=>e.hp>0&&(!e.form||e.dive||e.y>72)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0]||S.e.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 if(target&&p.cd<=0&&Math.abs(target.x-p.x)<(target.t==='boss'?16:12)&&S.pb.length<bulletsMax())shoot();
}

function updatePlayerControl(dt,p){
 const harnessPersona=harnessPersonaCfg();
 const leftCodes=movementLeftCodes(),rightCodes=movementRightCodes();
 const manualAxis=(rightCodes.some(code=>!!keys[code])?1:0)-(leftCodes.some(code=>!!keys[code])?1:0);
 const manualFire=!!keys.Space;
 p.inputResetHoldT=Math.max(0,(+p.inputResetHoldT||0)-dt);
 logProfessionalHandoff(p,harnessPersona,manualAxis,manualFire);
 if(p.inputResetHoldT>0){
  p.vx=0;
  return;
 }
 if(p.spawn<=0&&!p.captured&&!p.returning){
  if(S.attract)runAttractPlayer(dt,p);
  else if(harnessPersona&&(S.watchMode||(!manualAxis&&!manualFire)))runHarnessPlayer(dt,p,harnessPersona);
  else{
   const hw=typeof playerMovementHalfWidth==='function'?playerMovementHalfWidth(p):playerHitbox().w;
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
   p.x=cl(p.x+p.vx*dt,hw+2,PLAY_W-hw-2);
   if((p.x<=hw+2&&p.vx<0)||(p.x>=PLAY_W-hw-2&&p.vx>0))p.vx=0;
  }
 }
 if(!S.attract&&!harnessPersona&&keys.Space)shoot();
 else if(!S.attract&&harnessPersona&&manualFire&&!S.watchMode)shoot();
}

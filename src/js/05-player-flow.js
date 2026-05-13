// Aurora-specific player lifecycle, harness control, and manual movement helpers.

function startAuroraGameplay(){
 if(typeof clearRuntimeLoopFault==='function')clearRuntimeLoopFault();
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
 const startStage=resolveGameplayStartStage(cfg);
 const extendRules=currentGamePack()?.scoring?.extends||{};
 const extendFirst=Math.max(0,Number.isFinite(+cfg.extendFirst)?(+cfg.extendFirst|0):(+extendRules.first||0));
 const extendRecurring=Math.max(0,Number.isFinite(+cfg.extendRecurring)?(+cfg.extendRecurring|0):(+extendRules.recurring||0));
 const nextExtendScore=extendFirst>0?extendFirst:(extendRecurring>0?extendRecurring:0);
 setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
 const pendingPlayerTwoTurn=resolvePendingPlayerTwoTurn();
 const watchPersona=pendingPlayerTwoTurn?'':resolveWatchModeStartPersona();
 const playerTwoRun=pendingPlayerTwoTurn||resolvePlayerTwoStartState();
 aud=1;AC().resume?.();
 gameOverHtml='';gameOverState=null;
started=1;paused=0;Object.assign(S,{score:0,lives:Math.max(0,cfg.ships-1),stage:startStage.stage,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,startCueT:0,formationCueT:0,audioPulseHoldT:0,rogue:0,alertT:0,forceChallenge:startStage.forceChallenge?1:0,liveCount:40,recoverT:0,attackGapT:0,nextStageT:0,postChallengeT:0,pendingStage:0,transitionMode:'',lastChallengeClearT:null,challengeTransitionStallLogged:0,transitionCueT:0,transitionCueKind:0,challengeResultCueT:0,challengeResultPerfect:0,sequenceT:0,sequenceMode:'',attract:0,simT:0,extendFirst,extendRecurring,nextExtendScore,extendAwards:0,extendFlashT:0,extendFlashShips:0,playerTwo:playerTwoRun,watchMode:watchPersona?1:0,watchPersona:watchPersona||'',commentaryT:0,commentaryCooldown:0,commentaryTitle:'',commentaryLines:[]});
 if(typeof resetHarnessFrameClock==='function')resetHarnessFrameClock();
 if(typeof syncPauseUi==='function')syncPauseUi();
 S.harnessPersona=(watchPersona||(playerTwoRun?.activeTurn==='p2'?playerTwoRun.personaKey:'')||window.__platinumHarnessPersona||window.__auroraHarnessPersona||'').toLowerCase();
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{x:PLAY_W/2,y:PLAY_H-VIS.playerBottom,inv:0,dual:0,captured:0,returning:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0,inputResetHoldT:0,vx:0});
 logEvent('game_start',{persona:S.harnessPersona||null,watchMode:!!S.watchMode,requestedStage:startStage.requestedStage,stage:startStage.stage,startStageMode:startStage.stageMode,forceChallenge:startStage.forceChallenge,playerTwo:playerTwoRun?.enabled?playerTwoSnapshot(playerTwoRun):null});
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
  S.alertTxt=`WATCH MODE\n${watchModePersonaLabel(S.watchPersona)} PILOT`;
  S.alertT=Math.max(S.alertT,1.8);
  if(typeof commentatorEvent==='function')commentatorEvent('watch_mode',{persona:S.watchPersona,label:watchModePersonaLabel(S.watchPersona)});
 }else if(playerTwoRun?.enabled&&playerTwoRun.activeTurn==='p2'){
  S.alertTxt=`2UP TURN\n${playerTwoRun.label||watchModePersonaLabel(playerTwoRun.personaKey)} PILOT`;
  S.alertT=Math.max(S.alertT,1.8);
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
 novice:{name:'novice',moveMul:.5,urgentDx:28,urgentLook:132,deadZone:10,aimBoss:11,aimOther:8,fireChance:.46,challengeFireChance:.42,openShotY:94,diveBias:260,carryBias:150,bossBias:80,activeBias:70,heightBias:.8,distanceBias:1.15},
 advanced:{name:'advanced',moveMul:.64,urgentDx:36,urgentLook:170,deadZone:9,aimBoss:15,aimOther:11,fireChance:.84,challengeFireChance:.82,openShotY:72,diveBias:360,carryBias:220,bossBias:135,activeBias:112,heightBias:1.02,distanceBias:.95},
 expert:{name:'expert',moveMul:.84,urgentDx:38,urgentLook:180,deadZone:7,aimBoss:18,aimOther:13,fireChance:.96,challengeFireChance:.97,openShotY:66,diveBias:470,carryBias:290,bossBias:150,activeBias:116,heightBias:1.05,distanceBias:.94,cautiousUntilStage:2,lowerDiveEvadeY:208,lowerDiveEvadeDx:40,lowerDiveEvadeLaneGap:1,diveEmergencyY:236,diveEmergencyDx:26},
 professional:{name:'professional',moveMul:.88,urgentDx:42,urgentLook:198,deadZone:5,aimBoss:22,aimOther:16,fireChance:.99,challengeFireChance:.995,openShotY:58,diveBias:600,carryBias:350,bossBias:175,activeBias:128,heightBias:1.12,distanceBias:.86}
};

const PLAYER_TWO_PERSONA_ORDER=Object.freeze(['novice','advanced','expert','professional']);
const PLAYER_TWO_PERSONA_PROFILES=Object.freeze({
 novice:Object.freeze({id:'novice',label:'BEGINNER',initials:'BEG',scorePerSecond:34,stageSeconds:126,variance:.14}),
 advanced:Object.freeze({id:'advanced',label:'INTERMEDIATE',initials:'INT',scorePerSecond:55,stageSeconds:98,variance:.12}),
 expert:Object.freeze({id:'expert',label:'EXPERT',initials:'EXP',scorePerSecond:78,stageSeconds:78,variance:.1}),
 professional:Object.freeze({id:'professional',label:'PROFESSIONAL',initials:'PRO',scorePerSecond:96,stageSeconds:66,variance:.08})
});

function normalizePlayerTwoPersona(value=''){
 const key=String(value||'').trim().toLowerCase();
 return PLAYER_TWO_PERSONA_PROFILES[key]?key:'advanced';
}
function currentGameSupportsPlayerTwo(){
 const pack=typeof currentGamePack==='function'?currentGamePack():null;
 const gameKey=pack?.metadata?.gameKey||'aurora-galactica';
 return gameKey==='aurora-galactica';
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
  personaInitials:profile.initials
 };
}
function selectedWatchPersona(){
 return normalizePlayerTwoPersona(readPref(WATCH_MODE_PERSONA_PREF_KEY)||selectedPlayerTwoPersona());
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
 setPlayerTwoPersona(next,Object.assign({},opts,{silent:1}));
 return setWatchPersona(next,opts);
}
function watchModePersonaLabel(key=selectedWatchPersona()){
 return (PLAYER_TWO_PERSONA_PROFILES[normalizePlayerTwoPersona(key)]||PLAYER_TWO_PERSONA_PROFILES.advanced).label;
}
function armWatchMode(personaKey=selectedWatchPersona(),opts={}){
 const key=setWatchPersona(personaKey,{silent:1,source:opts.source||'ui'});
 setPlayerTwoSelection(false,{silent:1,source:opts.source||'ui'});
 window.__platinumWatchModePersona=key;
 window.__auroraWatchModePersona=key;
 if(typeof logEvent==='function')logEvent('watch_mode_armed',{persona:key,source:opts.source||'ui'});
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
function resolvePendingPlayerTwoTurn(){
 const pending=window.__platinumPendingPlayerTwoTurn||window.__auroraPendingPlayerTwoTurn||null;
 delete window.__platinumPendingPlayerTwoTurn;
 delete window.__auroraPendingPlayerTwoTurn;
 if(!pending||!pending.enabled)return null;
 const personaKey=normalizePlayerTwoPersona(pending.personaKey||pending.persona||'advanced');
 const profile=PLAYER_TWO_PERSONA_PROFILES[personaKey]||PLAYER_TWO_PERSONA_PROFILES.advanced;
 return Object.assign({},pending,{
  enabled:true,
  eligibleForLeaderboard:false,
  mode:'persona-rival',
  turnModel:'galaga-inspired-alternating-turns',
  activeTurn:'p2',
  personaKey,
  label:profile.label,
  initials:profile.initials,
  score:0,
  scoreFloat:0,
  stage:1,
  lives:Math.max(1,+pending.lives||3),
  elapsed:0,
  nextLogT:8,
  lastStage:1
 });
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
 setAccountNotice('Sign in to choose 2 PLAYERS with a persona rival.');
 if(typeof openAccountPanel==='function')openAccountPanel();
 if(typeof showToast==='function')showToast('Sign in to choose 2 PLAYERS.');
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
function resolvePlayerTwoStartState(){
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
 return{
  enabled:true,
  eligibleForLeaderboard:false,
  mode:'persona-rival',
  turnModel:'galaga-inspired-alternating-turns',
  activeTurn:'queued',
  personaKey,
  label:profile.label,
  initials:profile.initials,
  score:0,
  scoreFloat:0,
  stage:1,
  lives:3,
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
 if(p2.activeTurn==='p2'){
  p2.score=S.score|0;
  p2.scoreFloat=Math.max(+p2.scoreFloat||0,p2.score);
  p2.stage=displayStageNumber(S.stage,!!S.challenge);
  p2.elapsed=+(+S.stageClock||0).toFixed(3);
  p2.finished=1;
  p2.activeTurn='done';
  if(typeof logEvent==='function')logEvent('player_two_turn_complete',playerTwoSnapshot(p2));
  return;
 }
 if(p2.activeTurn==='queued'){
  p2.activeTurn='ready';
  p2.humanScore=S.score|0;
  p2.humanStage=displayStageNumber(S.stage,!!S.challenge);
  p2.humanStats={shots:S.stats.shots|0,hits:S.stats.hits|0};
  if(typeof logEvent==='function')logEvent('player_two_turn_ready',playerTwoSnapshot(p2));
 }
}
function playerTwoTurnAvailable(){
 return !!(!started&&gameOverState&&!gameOverState.editing&&S.playerTwo?.enabled&&S.playerTwo.activeTurn==='ready');
}
function startPlayerTwoTurnFromGameOver(source='keyboard'){
 if(!playerTwoTurnAvailable())return false;
 if(gameOverState&&!gameOverState.editing&&!gameOverState.watchMode&&!gameOverState.playerTwoMode&&typeof submitGameOverScore==='function')submitGameOverScore();
 const p2=Object.assign({},S.playerTwo,{
  activeTurn:'p2',
  score:0,
  scoreFloat:0,
  stage:1,
  lives:3,
  elapsed:0,
  nextLogT:8,
  lastStage:1,
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
 if(p2.activeTurn==='p2'){
  p2.elapsed+=dt;
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
 return{
  enabled:true,
  mode:p2.mode||'persona-rival',
  turnModel:p2.turnModel||'galaga-inspired-alternating-turns',
  activeTurn:p2.activeTurn||'queued',
  personaKey:p2.personaKey||'',
  label:p2.label||'',
  initials:p2.initials||'',
  score:+(p2.score||0)|0,
  stage:+(p2.stage||1)|0,
  humanScore:+(p2.humanScore||0)|0,
  humanStage:+(p2.humanStage||0)|0,
  elapsed:+(+p2.elapsed||0).toFixed(3),
  variance:+(+p2.variance||1).toFixed(4),
  eligibleForLeaderboard:false
 };
}
function buildPlayerTwoStartHtml(){
 if(!currentGameSupportsPlayerTwo())return '';
 const state=playerTwoSelectionState();
 const watchPersona=selectedWatchPersona();
 const watchLabel=watchModePersonaLabel(watchPersona);
 const p2Locked=!state.signedIn;
 const mode1Class=`playerModeOption${state.selected?'':' isSelected'}`;
 const mode2Class=`playerModeOption${state.selected?' isSelected':''}${p2Locked?' isLocked':''}`;
 const status=p2Locked?'2 PLAYERS REQUIRES SIGN IN':`2UP ${state.personaLabel} QUEUED   HUMAN SCORE ONLY`;
 const personaHint='<span class="k">[</span>/<span class="k">]</span> CHANGE PERSONA';
 return `<span class="playerModeSelect" aria-label="Player mode selection"><span class="${mode1Class}" role="button" tabindex="0" data-player-mode="1"><span class="k">1</span> 1 PLAYER</span><span class="${mode2Class}" role="button" tabindex="0" data-player-mode="2"><span class="k">2</span> 2 PLAYERS</span><span class="playerModePersona" role="button" tabindex="0" data-player-two-persona="cycle">${status}</span><span class="playerModeWatch" role="button" tabindex="0" data-watch-mode="1"><span class="k">W</span> WATCH ${watchLabel}</span><span class="playerModeHint">${personaHint}</span></span>`;
}
function buildPlayerTwoResultsHtml(){
 const p2=S.playerTwo;
 if(!p2?.enabled)return '';
 const human=(p2.humanScore!=null?p2.humanScore:S.score)|0;
 const p2Score=p2.score|0;
 if(p2.activeTurn==='ready')return `<span class="playerTwoResult"><span>2UP ${p2.initials||'---'} READY   1UP ${formatScore(human)}</span><span><span class="k">2</span> START 2UP TURN   HUMAN SCORE ONLY</span></span>`;
 if(p2.activeTurn!=='p2'&&p2.activeTurn!=='done')return `<span class="playerTwoResult"><span>2UP ${p2.initials||'---'} ${formatScore(p2Score)}   READY</span><span>2UP HAS NOT PLAYED THIS TURN   1UP SCORE IS THE ONLY SCOREBOARD ENTRY</span></span>`;
 const outcome=human>=p2Score?'1UP LEADS':'2UP LEADS';
 return `<span class="playerTwoResult"><span>2UP ${p2.initials||'---'} ${formatScore(p2Score)}   STG ${String(p2.stage||1).padStart(2,'0')}</span><span>${outcome}   1UP SCORE IS THE ONLY SCOREBOARD ENTRY</span></span>`;
}
function playerTwoHudHtml(){
 const p2=S.playerTwo;
 if(!p2?.enabled)return '';
 return `<span class="hudLabel">2UP</span> <span class="hudValue">${formatScore(p2.score||0)}</span>`;
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
  armWatchMode(selectedWatchPersona(),{source:'keyboard'});
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
 if(target?.closest?.('[data-player-two-persona]')){
  const next=cycleWatchPersona(1,{source:'click'});
  setPlayerTwoPersona(next,{silent:1,source:'click'});
  if(typeof sfx!=='undefined')sfx.uiTick();
  return true;
 }
 if(target?.closest?.('[data-watch-mode]')){
  armWatchMode(selectedWatchPersona(),{source:'click'});
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
 logProfessionalDecision(p,cfg,'tick',{
  attackables:attackables.length,
  targetId:target?target.id:null,
  targetX:target?+target.x.toFixed(2):null,
  targetDx:target?+(target.x-p.x).toFixed(2):null,
  axis,
  cooldown:+p.cd.toFixed(3),
  playerBullets:S.pb.length
 });
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
 else if(!S.attract&&harnessPersona&&manualFire&&!S.watchMode)shoot();
}

// Harness hooks and startup loop.
window.__galagaHarness__={
 start(cfg={}){
  if(cfg.seed!==undefined)setSeed(cfg.seed);
 if(typeof cfg.autoVideo==='boolean'){
   VIDEO_REC.enabled=!!cfg.autoVideo;
   localStorage.setItem(RECORD_PREF_KEY,VIDEO_REC.enabled?'1':'0');
   syncRecordUi();
  }
  if(typeof cfg.debugCarry==='boolean')window.setCarryDebug(!!cfg.debugCarry,'harness-start');
 if(cfg.stage||cfg.ships||cfg.challenge!==undefined){
  testStage.value=cl(+cfg.stage||1,1,99)|0;
  testShips.value=cl(+cfg.ships||3,1,9)|0;
  testChallenge.checked=!!cfg.challenge;
  saveTestCfg();
 }
 window.__auroraHarnessPersona=(cfg.persona||'').toLowerCase();
 if(!started)start();
},
 setCarryDebug(cfg={}){
  const enabled=typeof cfg.enabled==='boolean'?cfg.enabled:!!cfg;
  window.setCarryDebug(enabled,'harness');
  return enabled;
 },
 startAttractDemo(cfg={}){
  if(typeof cfg.debugCarry==='boolean')window.setCarryDebug(!!cfg.debugCarry,'harness-attract');
  window.startAttractDemo({record:cfg.record!==false});
  return true;
 },
 exportAndReset(cfg={}){
  const label=typeof cfg==='string'?cfg:(cfg.label||'harness_export_reset');
  exportAndReturnToWaitMode(label);
  return true;
 },
 setupWaitModeCarriedBossTest(cfg={}){
  started=0;
  paused=0;
  ATTRACT.active=1;
  ATTRACT.phase='demo';
  ATTRACT.timer=Math.max(2,+cfg.timer||9);
  S.attract=1;
  S.challenge=0;
  S.cap=null;
  S.pb.length=0;
  S.eb.length=0;
  S.fx.length=0;
  S.att=0;
  S.recoverT=Math.max(S.recoverT,4);
  S.attackGapT=Math.max(S.attackGapT,4);
  const bosses=S.e.filter(e=>e.hp>0&&e.t==='boss');
  if(!bosses.length)return false;
  const boss=bosses.sort((a,b)=>Math.abs((a.tx||a.x)-PLAY_W/2)-Math.abs((b.tx||b.x)-PLAY_W/2))[0];
  for(const e of S.e){
   if(e.hp<=0)continue;
   e.form=1;
   e.dive=0;
   e.beam=0;
   e.beamT=0;
   e.low=0;
   e.esc=0;
   e.shot=0;
   e.carry=e.id===boss.id?1:0;
   e.x=e.tx;
   e.y=e.ty;
   e.vx=0;
   e.vy=0;
   e.cool=99;
  }
  Object.assign(S.p,{
   x:PLAY_W/2,
   y:PLAY_H-VIS.playerBottom,
   vx:0,
   cd:0,
   inv:0,
   dual:0,
   captured:0,
   returning:0,
   pending:0,
   spawn:0,
   capBoss:null,
   capT:0
  });
  logEvent('harness_wait_mode_carried_boss_setup',{
   boss:boss.id,
   bossX:+boss.x.toFixed(2),
   bossY:+boss.y.toFixed(2),
   stage:S.stage,
   attractPhase:ATTRACT.phase
  });
  if(window.__auroraCarryDebug)logCarryDebugState('wait-mode-setup');
  return true;
 },
 stop(label='harness'){
  logEvent('harness_stop',{label});
  logSnapshot('harness_stop');
  if(VIDEO_REC.enabled)exportSession({auto:1,silent:1});
  stopRunRecording();
  started=0;paused=0;
  msg.textContent='';
 },
 async seedLocalReplay(cfg={}){
  if(!window.AuroraReplayStore?.supported?.()) return false;
  if(cfg.clearExisting){
   const existing = await window.AuroraReplayStore.listReplays();
   for(const replay of existing) await window.AuroraReplayStore.deleteReplay(replay.id);
  }
  const bytes = Array.isArray(cfg.blobBytes) && cfg.blobBytes.length
   ? cfg.blobBytes
   : [0x1a,0x45,0xdf,0xa3,0x93,0x42,0x82,0x88];
  const blob = new Blob([new Uint8Array(bytes)], { type: cfg.type || 'video/webm' });
 await window.AuroraReplayStore.saveReplay({
   id: cfg.id || `harness-replay-${Date.now()}`,
   createdAt: cfg.createdAt || new Date().toISOString(),
   duration: +cfg.duration || 12,
   score: +cfg.score || 4321,
   stage: +cfg.stage || 2,
   challenge: !!cfg.challenge,
   build: (window.BUILD && window.BUILD.version) || '',
   stats: cfg.stats || { shots: 6, hits: 4 },
   source: cfg.source || 'local',
   pilotUserId: cfg.pilotUserId || '',
   pilotEmail: cfg.pilotEmail || '',
   pilotInitials: cfg.pilotInitials || '',
   blob
  });
  return true;
 },
 async setupPilotRecordsPanelTest(cfg={}){
  const replayCreatedAt=cfg.createdAt || new Date(Date.now()-18*60*1000).toISOString();
  if(window.AuroraReplayStore?.supported?.()){
   const existing=await window.AuroraReplayStore.listReplays();
   for(const replay of existing){
    if(replay.id=== (cfg.replayId || 'replay-stage7-local'))await window.AuroraReplayStore.deleteReplay(replay.id);
   }
   await window.AuroraReplayStore.saveReplay({
    id: cfg.replayId || 'replay-stage7-local',
    createdAt: replayCreatedAt,
    duration: +cfg.duration || 113,
    score: +cfg.score || 654321,
    stage: +cfg.stage || 7,
    challenge: !!cfg.challenge,
    build: (window.BUILD && window.BUILD.version) || '',
    stats: cfg.stats || { shots: 12, hits: 8 },
    source: 'local',
    pilotUserId: cfg.userId || 'pilot-swd',
    pilotEmail: cfg.email || 'sgwoods@gmail.com',
    pilotInitials: cfg.initials || 'SWD',
    blob: new Blob([new Uint8Array(cfg.blobBytes || [0x1a,0x45,0xdf,0xa3,0x93,0x42,0x82,0x88])], { type: cfg.type || 'video/webm' })
   });
  }
  window.__auroraReplayCatalog=[{
   id: cfg.replayId || 'replay-stage7-local',
   score: +cfg.score || 654321,
   stage: +cfg.stage || 7,
   createdAt: replayCreatedAt,
   duration: +cfg.duration || 113,
   pilotUserId: cfg.userId || 'pilot-swd',
   pilotEmail: cfg.email || 'sgwoods@gmail.com',
   pilotInitials: cfg.initials || 'SWD'
  }];
  LEADERBOARD.configured=1;
  LEADERBOARD.user={
   id: cfg.userId || 'pilot-swd',
   email: cfg.email || 'sgwoods@gmail.com',
   email_confirmed_at: new Date().toISOString(),
   user_metadata: { display_initials: cfg.initials || 'SWD' }
  };
  LEADERBOARD.profile={user_id:LEADERBOARD.user.id,display_initials:cfg.initials || 'SWD'};
  LEADERBOARD.remote.mine=[
   {
    id:'remote-top-run',
    initials:cfg.initials || 'SWD',
    score:+cfg.score || 654321,
    stage:+cfg.stage || 7,
    at:'',
    verified:true
   },
   {
    id:'remote-backup-run',
    initials:cfg.initials || 'SWD',
    score:100020,
    stage:4,
    at:'',
    verified:true
   }
  ];
  LEADERBOARD.cacheStamp.mine=Date.now();
  LEADERBOARD.accountPanelOpen=1;
  LEADERBOARD.panelOpen=0;
  syncLeaderboardPanelVisibility();
  syncAccountPanelVisibility();
  syncAccountUi();
  return true;
 },
 openMoviePanel(){
  if(typeof window.refreshMovieCatalog === 'function')window.refreshMovieCatalog({ silent: 1 });
  if(typeof movieDockBtn !== 'undefined' && movieDockBtn)movieDockBtn.click();
  return !!(typeof window.isMoviePanelOpen === 'function' && window.isMoviePanelOpen());
 },
 startSelectedMovieReplay(){
  if(typeof movieStartBtn !== 'undefined' && movieStartBtn)movieStartBtn.click();
  return true;
 },
 closeMoviePanel(){
  if(typeof window.closeMoviePanel === 'function')window.closeMoviePanel();
  return true;
 },
 openWaitLeaderboard(view='all'){
  startAttractDemo({ record: false });
  if(typeof openLeaderboardPanel === 'function')openLeaderboardPanel(view);
  return true;
 },
 restartCurrentConfig(){
  S.lives = -1;
  gameOver();
  start();
  return snapshot();
 },
 setBoardMessage(cfg={}){
  paused = !!cfg.paused;
  if(typeof syncPauseUi === 'function')syncPauseUi();
  if(cfg.mode === 'alert'){
   S.banner = 0;
   S.bannerTxt = '';
   S.bannerSub = '';
   S.bannerMode = '';
   S.alertTxt = String(cfg.text || '');
   S.alertT = Math.max(0.1, +cfg.duration || 1.2);
   return true;
  }
  if(cfg.mode === 'banner'){
   S.alertT = 0;
   S.alertTxt = '';
   S.bannerMode = String(cfg.bannerMode || '');
   S.bannerTxt = String(cfg.title || '');
   S.bannerSub = String(cfg.subtitle || '');
   S.banner = Math.max(0.1, +cfg.duration || 1.2);
   return true;
  }
  return false;
 },
 export(){exportSession({silent:1})},
 snapshot(){return snapshot()},
 state(){return{started,paused,stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1),challenge:!!S.challenge,recording:!!VIDEO_REC.active,seed:RNG_SEED,persona:(window.__auroraHarnessPersona||'').toLowerCase()||null}},
 uiState(){
  return {
   started: !!started,
   paused: !!paused,
   aud,
   attract: { active: !!ATTRACT.active, phase: ATTRACT.phase || '' },
   movieOpen: typeof window.isMoviePanelOpen === 'function' ? !!window.isMoviePanelOpen() : false,
   leaderboardOpen: typeof LEADERBOARD !== 'undefined' ? !!LEADERBOARD.panelOpen : false
  };
 },
 recentEvents(cfg={}){
  const count=Math.max(1,Math.min(200,+cfg.count||20));
  return REC ? REC.events.slice(-count) : [];
 },
 bannerState(){
  return {
   bannerTxt:S.bannerTxt||'',
   bannerSub:S.bannerSub||'',
   bannerMode:S.bannerMode||'',
   banner:+(+S.banner||0).toFixed(3),
   alertTxt:S.alertTxt||'',
   alertT:+(+S.alertT||0).toFixed(3)
  };
 },
 carryState(){
  const carry=typeof window.getCarryRelationState==='function' ? window.getCarryRelationState() : null;
  const rescue=typeof window.getRescuePodDebugState==='function' ? window.getRescuePodDebugState() : null;
  return { carry, rescue };
 },
 renderState(){
  return window.__auroraRenderDebug||{carryDraws:[]};
 },
 squadronState(){
  const boss=S.e.find(e=>e.hp>0&&e.squadId&&e.t==='boss');
  if(!boss)return null;
  const escorts=S.e
   .filter(e=>e.hp>0&&e.squadId===boss.squadId&&e.id!==boss.id)
   .map(e=>({
    id:e.id,
    x:+e.x.toFixed(2),
    y:+e.y.toFixed(2),
    off:+(+e.off||0).toFixed(2),
    lead:e.lead||null,
    dive:e.dive||0
   }));
  return {
   boss:{
    id:boss.id,
    x:+boss.x.toFixed(2),
    y:+boss.y.toFixed(2),
    squadId:boss.squadId,
    dive:boss.dive||0
   },
   escorts
  };
 },
 spawnPlayerBullet(cfg={}){
  const x=cl(+cfg.x||S.p.x,2,PLAY_W-2),y=+cfg.y||Math.max(20,S.p.y-40),v=+cfg.v||560;
  S.pb.push({x,y,v});
  logEvent('harness_spawn_player_bullet',{x:+x.toFixed(2),y:+y.toFixed(2),v:+v.toFixed(2)});
 },
 triggerCarriedFighterHit(){
  const boss=S.e.find(e=>e.hp>0&&e.carry);
  if(!boss)return false;
  const points=destroyCarriedFighter(boss);
  logEvent('harness_trigger_carried_fighter_hit',{boss:boss.id,points});
  return !!points;
 },
 triggerCarriedBossRescueKill(){
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss'&&e.carry&&e.dive);
  if(!boss)return false;
  boss.hp=0;
  awardKill(boss,boss.dive);
  ex(boss.x,boss.y,16,'#ff8cd7');
  logEvent('harness_trigger_carried_boss_rescue_kill',{boss:boss.id});
  return true;
 },
 triggerCarriedBossKill(){
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss'&&e.carry);
  if(!boss)return false;
  boss.hp=0;
  awardKill(boss,boss.dive);
  ex(boss.x,boss.y,16,'#ff8cd7');
  logEvent('harness_trigger_carried_boss_kill',{boss:boss.id,dive:boss.dive});
  return true;
 },
 clearNonCarryingEnemies(){
  const carryingBoss=S.e.find(e=>e.hp>0&&e.t==='boss'&&e.carry);
  if(!carryingBoss)return false;
  let cleared=0;
  for(const e of S.e){
   if(e.id===carryingBoss.id)continue;
   if(e.hp>0){
    e.hp=0;
    cleared++;
   }
  }
  logEvent('harness_clear_non_carrying_enemies',{boss:carryingBoss.id,cleared});
  return true;
 },
 triggerBossFirstHit(){
  const boss=S.e.find(e=>e.hp>1&&e.t==='boss');
  if(!boss)return false;
  const hpBefore=boss.hp;
  boss.hp--;
  boss.hitT=.34;
  logEvent('enemy_damaged',Object.assign({stage:S.stage,hpBefore,hpAfter:boss.hp,playerBullets:S.pb.length,enemyBullets:S.eb.length,harness:1},enemyRef(boss)));
  ex(boss.x,boss.y,8,'#fff4a8');
  sfx.bossHit();
  logEvent('harness_trigger_boss_first_hit',{boss:boss.id,hpBefore,hpAfter:boss.hp});
  return true;
 },
 triggerSquadronBossKill(){
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss'&&e.squadId);
  if(!boss)return false;
  boss.hp=0;
  awardKill(boss,boss.dive);
  ex(boss.x,boss.y,16,'#ff8cd7');
  logEvent('harness_trigger_squadron_boss_kill',{boss:boss.id,squadId:boss.squadId,dive:boss.dive});
  return true;
 },
 setupCloseShotTest(cfg={}){
  const p=S.p;
  const enemy=S.e.find(e=>e.hp>0&&e.t!=='boss')||S.e.find(e=>e.hp>0);
  if(!enemy)return false;
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);
  p.y=+cfg.playerY||PLAY_H-VIS.playerBottom;
  p.dual=0;
  p.captured=0;
  p.pending=0;
  p.spawn=0;
  p.capBoss=null;
  p.capT=0;
  p.inv=0;
  p.cd=0;
  p.returning=0;
  p.vx=0;
  S.cap=null;
  S.pb.length=0;
  S.eb.length=0;
  S.att=0;
  S.recoverT=0;
  S.attackGapT=0;
  S.stage=Math.max(1,+cfg.stage||1);
  S.stageClock=0;
  for(const e of S.e)if(e.id!==enemy.id)e.hp=0;
  enemy.hp=1;
  enemy.max=1;
  enemy.form=1;
  enemy.beam=0;
  enemy.beamT=0;
  enemy.carry=0;
  enemy.low=0;
  enemy.esc=0;
  enemy.shot=0;
  enemy.dive=1;
  enemy.x=cl(+cfg.enemyX||p.x,18,PLAY_W-18);
  enemy.y=+cfg.enemyY||(p.y-18);
  enemy.vx=+cfg.enemyVx||0;
  enemy.vy=+cfg.enemyVy||20;
  logEvent('harness_close_shot_setup',{
   stage:S.stage,
   enemyId:enemy.id,
   enemyType:enemy.t,
   playerX:+p.x.toFixed(2),
   playerY:+p.y.toFixed(2),
   enemyX:+enemy.x.toFixed(2),
   enemyY:+enemy.y.toFixed(2),
   enemyVy:+enemy.vy.toFixed(2)
  });
  return true;
 },
 forcePerfectChallengeClear(){
  if(!S.challenge)return false;
  let cleared=0;
  for(const e of S.e){
   if(e.hp<=0)continue;
   e.hp=0;
   awardKill(e,e.dive);
   ex(e.x,e.y,14,e.t==='boss'?'#ff8cd7':e.t==='but'?'#ffb55f':'#ffe563');
   cleared++;
  }
  logEvent('harness_force_perfect_challenge_clear',{stage:S.stage,cleared,hits:S.ch.hits,total:S.ch.total});
  return cleared>0;
 },
 setupChallengeCollisionTest(cfg={}){
  const p=S.p;
  const candidates=S.e.filter(e=>e.hp>0&&e.ch);
  const enemy=candidates.sort((a,b)=>Math.abs(a.x-PLAY_W/2)-Math.abs(b.x-PLAY_W/2))[0];
  if(!enemy)return false;
  for(const e of S.e)if(e.id!==enemy.id)e.hp=0;
  enemy.tm=+cfg.enemyTm||11.2;
  updateChallengeEnemy(enemy,0.016);
  p.x=cl(Number.isFinite(+cfg.playerX)?+cfg.playerX:enemy.x,18,PLAY_W-18);
  p.y=Number.isFinite(+cfg.playerY)?+cfg.playerY:enemy.y;
  p.dual=0;
  p.captured=0;
  p.pending=0;
  p.spawn=0;
  p.returning=0;
  p.capBoss=null;
  p.capT=0;
  p.inv=0;
  p.cd=0;
  p.vx=0;
  S.cap=null;
  S.pb.length=0;
  S.eb.length=0;
  S.fx.length=0;
  S.att=0;
  S.recoverT=0;
  S.attackGapT=0;
  logEvent('harness_challenge_collision_setup',{
   stage:S.stage,
   playerX:+p.x.toFixed(2),
   playerY:+p.y.toFixed(2),
   enemyId:enemy.id,
   enemyX:+enemy.x.toFixed(2),
   enemyY:+enemy.y.toFixed(2),
   enemyTm:+enemy.tm.toFixed(3)
  });
  return true;
 },
 setAutoVideo(v){
  VIDEO_REC.enabled=!!v;
  localStorage.setItem(RECORD_PREF_KEY,VIDEO_REC.enabled?'1':'0');
  syncRecordUi();
 },
 setTest(cfg={}){
  testStage.value=cl(+cfg.stage||1,1,99)|0;
  testShips.value=cl(+cfg.ships||3,1,9)|0;
  testChallenge.checked=!!cfg.challenge;
  saveTestCfg();
 },
 spawnRescuePod(cfg={}){
  const p=S.p;
  S.cap={x:cl(+cfg.x||p.x,18,PLAY_W-18),y:+cfg.y||Math.max(28,p.y-56),vy:+cfg.vy||78,t:+cfg.t||8};
  logEvent('harness_spawn_rescue',{x:+S.cap.x.toFixed(2),y:+S.cap.y.toFixed(2),vy:+S.cap.vy.toFixed(2)});
 },
 setupWaitModeDockingRescuePodTest(cfg={}){
  started=0;
  paused=0;
  ATTRACT.active=1;
  ATTRACT.phase='demo';
  ATTRACT.timer=Math.max(2,+cfg.timer||9);
  S.attract=1;
  const p=S.p;
  S.cap={
   mode:'dock',
   x:cl(+cfg.x||PLAY_W/2,18,PLAY_W-18),
   y:+cfg.y||112,
   vx:+cfg.vx||0,
   vy:+cfg.vy||0,
   t:+cfg.t||8,
   spin:+cfg.spin||0,
   side:+cfg.side||1
  };
  logEvent('harness_wait_mode_rescue_pod_setup',{
   x:+S.cap.x.toFixed(2),
   y:+S.cap.y.toFixed(2),
   side:S.cap.side,
   mode:S.cap.mode
  });
  if(window.__auroraCarryDebug)logCarryDebugState('wait-mode-rescue-setup');
  return true;
 },
 setupCaptureRescueDualTest(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  const spare=S.e.find(e=>e.hp>0&&e.t==='bee'&&e.id!==boss?.id);
  if(!boss||!spare)return false;
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=Math.max(1,+cfg.stage||2);S.stageClock=0;
  S.captureCountStage=1;S.lastCaptureStartT=0;S.lastFighterCapturedT=.5;
  for(const e of S.e)if(e.id!==boss.id&&e.id!==spare.id)e.hp=0;
  spare.hp=1;spare.max=1;spare.form=1;spare.dive=0;spare.carry=0;spare.beam=0;spare.beamT=0;spare.low=0;spare.x=spare.tx;spare.y=spare.ty;
  boss.hp=1;boss.max=2;boss.form=1;boss.carry=1;boss.beam=0;boss.beamT=0;boss.low=0;boss.esc=0;boss.squadId=0;boss.dive=1;boss.shot=0;
  boss.x=p.x;boss.y=132;boss.vx=0;boss.vy=22;
  logEvent('harness_capture_rescue_dual_setup',{boss:boss.id,spare:spare.id,playerX:+p.x.toFixed(2),stage:S.stage});
  logEnemyAttackStart(boss,'dive',{targetX:+p.x.toFixed(2),scripted:0,harness:1,carry:1,rescueFlow:1});
  return true;
 },
 setupNaturalCaptureCycleTest(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  const spare=S.e.find(e=>e.hp>0&&e.t==='bee'&&e.id!==boss?.id);
  if(!boss||!spare)return false;
  const keepAlive=Math.max(0,+cfg.keepAlive||0);
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=Math.max(1,+cfg.stage||2);S.stageClock=0;
  S.captureCountStage=0;S.lastCaptureStartT=null;S.lastFighterCapturedT=null;
  const extra=S.e.filter(e=>e.hp>0&&e.id!==boss.id&&e.id!==spare.id).slice(0,keepAlive);
  const keep=new Set([boss.id,spare.id,...extra.map(e=>e.id)]);
  for(const e of S.e)if(!keep.has(e.id))e.hp=0;
  for(const e of extra){e.form=1;e.dive=0;e.carry=0;e.beam=0;e.beamT=0;e.low=0;e.x=e.tx;e.y=e.ty;}
  spare.hp=1;spare.max=1;spare.form=1;spare.dive=0;spare.carry=0;spare.beam=0;spare.beamT=0;spare.low=0;spare.x=spare.tx;spare.y=spare.ty;
  boss.hp=1;boss.max=2;boss.form=1;boss.carry=0;boss.beam=0;boss.beamT=0;boss.low=0;boss.esc=0;boss.squadId=0;boss.dive=4;boss.shot=0;
  boss.targetX=p.x;boss.targetY=138;boss.vx=0;boss.vy=S.stage<=2?116:124;boss.x=cl(+cfg.bossX||p.x,26,PLAY_W-26);boss.y=+cfg.bossY||70;
 logEvent('harness_natural_capture_cycle_setup',{boss:boss.id,spare:spare.id,playerX:+p.x.toFixed(2),bossX:+boss.x.toFixed(2),bossY:+boss.y.toFixed(2),stage:S.stage,keepAlive:extra.length});
 logEnemyAttackStart(boss,'capture',{targetX:+boss.targetX.toFixed(2),targetY:boss.targetY,scripted:0,harness:1,naturalCapture:1});
 return true;
},
 setupCaptureEscapeTest(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  if(!boss)return false;
  const keepAlive=Math.max(0,+cfg.keepAlive||0);
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=+cfg.playerY||186;p.dual=0;p.captured=1;p.pending=0;p.spawn=0;p.capBoss=boss;p.capT=+cfg.capT||0.95;p.inv=0;p.cd=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=Math.max(1,+cfg.stage||4);S.stageClock=0;S.challenge=0;
  S.lastCaptureStartT=0;S.lastFighterCapturedT=null;
  const extra=S.e.filter(e=>e.hp>0&&e.id!==boss.id).slice(0,keepAlive);
  const keep=new Set([boss.id,...extra.map(e=>e.id)]);
  for(const e of S.e)if(!keep.has(e.id))e.hp=0;
  for(const e of extra){
   e.form=1;
   e.dive=0;
   e.carry=0;
   e.beam=0;
   e.beamT=0;
   e.low=0;
   e.x=e.tx;
   e.y=e.ty;
   e.vx=0;
   e.vy=0;
   e.cool=99;
  }
  boss.hp=1;boss.max=2;boss.form=1;boss.dive=2;boss.carry=0;boss.beam=1;boss.beamT=+cfg.beamT||1.4;boss.low=0;boss.esc=0;boss.squadId=0;boss.shot=0;
  boss.x=cl(+cfg.bossX||p.x,28,PLAY_W-28);boss.y=+cfg.bossY||110;boss.vx=0;boss.vy=0;
  logEvent('harness_capture_escape_setup',{boss:boss.id,playerX:+p.x.toFixed(2),playerY:+p.y.toFixed(2),bossX:+boss.x.toFixed(2),bossY:+boss.y.toFixed(2),capT:+p.capT.toFixed(2),stage:S.stage,keepAlive:extra.length});
  logEnemyAttackStart(boss,'capture',{targetX:+boss.x.toFixed(2),targetY:+(boss.y+26).toFixed(2),scripted:0,harness:1,captureEscape:1});
  return true;
 },
 setupCarriedBossFormationTest(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  if(!boss)return false;
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=Math.max(1,+cfg.stage||2);S.stageClock=0;
  for(const e of S.e)if(e.id!==boss.id)e.hp=0;
  boss.hp=1;boss.max=2;boss.form=1;boss.dive=0;boss.carry=1;boss.beam=0;boss.beamT=0;boss.low=0;boss.esc=0;boss.squadId=0;boss.shot=0;
  boss.x=cl(+cfg.bossX||boss.tx||PLAY_W/2,28,PLAY_W-28);boss.y=+cfg.bossY||112;boss.vx=0;boss.vy=0;
  logEvent('harness_carried_boss_formation_setup',{boss:boss.id,playerX:+p.x.toFixed(2),bossX:+boss.x.toFixed(2),bossY:+boss.y.toFixed(2),stage:S.stage});
  return true;
 },
 launchCarryingBossAttack(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss'&&e.carry);
  if(!boss)return false;
  if(cfg.playerX!==undefined)p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);
  boss.form=1;boss.dive=1;boss.beam=0;boss.beamT=0;boss.low=0;boss.shot=0;boss.esc=0;
  boss.x=cl(+cfg.bossX||p.x,26,PLAY_W-26);boss.y=+cfg.bossY||126;boss.vx=+cfg.vx||0;boss.vy=+cfg.vy||24;
  logEvent('harness_launch_carrying_boss_attack',{boss:boss.id,playerX:+p.x.toFixed(2),bossX:+boss.x.toFixed(2),bossY:+boss.y.toFixed(2)});
  logEnemyAttackStart(boss,'dive',{targetX:+p.x.toFixed(2),scripted:0,harness:1,carry:1,naturalCapture:1});
  return true;
 },
 setupSecondCaptureTest(cfg={}){
  const p=S.p;
  const bosses=S.e.filter(e=>e.hp>0&&e.t==='boss').slice(0,2);
  if(bosses.length<2)return false;
  const carryBoss=bosses[0],capBoss=bosses[1];
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;
  carryBoss.hp=Math.max(1,carryBoss.hp);carryBoss.carry=1;carryBoss.form=1;carryBoss.dive=0;carryBoss.beam=0;carryBoss.beamT=0;carryBoss.low=0;carryBoss.x=carryBoss.tx;carryBoss.y=carryBoss.ty;
  capBoss.hp=Math.max(1,capBoss.hp);capBoss.carry=0;capBoss.form=1;capBoss.dive=4;capBoss.targetX=p.x;capBoss.targetY=138;capBoss.vx=0;capBoss.vy=124;capBoss.shot=0;capBoss.beam=0;capBoss.beamT=0;capBoss.low=0;capBoss.x=capBoss.tx;capBoss.y=capBoss.ty;
  logEvent('harness_second_capture_setup',{carryBoss:carryBoss.id,captureBoss:capBoss.id,playerX:+p.x.toFixed(2)});
  logEnemyAttackStart(capBoss,'capture',{targetX:+capBoss.targetX.toFixed(2),targetY:capBoss.targetY,scripted:0,harness:1});
  return true;
 },
 setupRepeatCaptureAttemptTest(cfg={}){
  const p=S.p;
  const bosses=S.e.filter(e=>e.hp>0&&e.t==='boss').slice(0,2);
  if(bosses.length<2)return false;
  const priorBoss=bosses[0],capBoss=bosses[1];
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;
  S.captureCountStage=1;S.lastCaptureStartT=0;S.lastFighterCapturedT=.5;
  priorBoss.hp=Math.max(1,priorBoss.hp);priorBoss.carry=0;priorBoss.form=1;priorBoss.dive=0;priorBoss.beam=0;priorBoss.beamT=0;priorBoss.low=0;priorBoss.x=priorBoss.tx;priorBoss.y=priorBoss.ty;
  capBoss.hp=Math.max(1,capBoss.hp);capBoss.carry=0;capBoss.form=1;capBoss.dive=4;capBoss.targetX=p.x;capBoss.targetY=138;capBoss.vx=0;capBoss.vy=124;capBoss.shot=0;capBoss.beam=0;capBoss.beamT=0;capBoss.low=0;capBoss.x=capBoss.tx;capBoss.y=capBoss.ty;
  logEvent('harness_repeat_capture_setup',{priorBoss:priorBoss.id,captureBoss:capBoss.id,playerX:+p.x.toFixed(2),captureCountStage:S.captureCountStage});
  logEnemyAttackStart(capBoss,'capture',{targetX:+capBoss.targetX.toFixed(2),targetY:capBoss.targetY,scripted:0,harness:1,repeatCapture:1});
  return true;
 },
 setupSquadronBonusTest(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  if(!boss)return false;
  const escorts=S.e.filter(e=>e.hp>0&&e.t==='but'&&Math.abs(e.c-boss.c)<=2).sort((a,b)=>Math.abs(a.c-boss.c)-Math.abs(b.c-boss.c)).slice(0,2);
  if(escorts.length<2)return false;
  const stage=Math.max(4,+cfg.stage||4);
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=stage;S.stageClock=0;
 const keep=new Set([boss.id,...escorts.map(e=>e.id)]);
 for(const e of S.e)if(!keep.has(e.id))e.hp=0;
  const squadId=++S.squadSeq;
  const tuning=typeof specialSquadronTuning==='function' ? specialSquadronTuning(stage) : { escortOffset:18, escortLift:8 };
  boss.hp=2;boss.max=2;boss.form=1;boss.dive=1;boss.carry=0;boss.beam=0;boss.beamT=0;boss.low=0;boss.esc=2;boss.squadId=squadId;boss.x=p.x;boss.y=112;boss.vx=0;boss.vy=42;boss.shot=0;
  escorts.forEach((e,i)=>{e.hp=1;e.max=1;e.form=1;e.dive=5;e.lead=boss.id;e.off=i===0?-tuning.escortOffset:tuning.escortOffset;e.shot=0;e.carry=0;e.beam=0;e.beamT=0;e.low=0;e.squadId=squadId;e.x=boss.x+e.off;e.y=boss.y-tuning.escortLift;});
  logEvent('harness_squadron_bonus_setup',{boss:boss.id,escorts:escorts.map(e=>e.id),playerX:+p.x.toFixed(2),stage});
  logEnemyAttackStart(boss,'dive',{targetX:+p.x.toFixed(2),scripted:0,harness:1,squadron:1});
  for(const e of escorts)logEnemyAttackStart(e,'escort',{lead:boss.id,offset:e.off,harness:1,squadron:1});
  return true;
 },
 setupCarriedFighterScoringTest(cfg={}){
  // Harness-only deterministic setup for issue #20. This isolates the carried
  // fighter scoring branches without depending on a full capture/rescue play
  // sequence during the test run.
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  if(!boss)return false;
  const attacking=!!cfg.attacking;
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=4;S.stageClock=0;
  for(const e of S.e)if(e.id!==boss.id)e.hp=0;
  boss.hp=2;boss.max=2;boss.form=1;boss.carry=1;boss.beam=0;boss.beamT=0;boss.low=0;boss.esc=0;boss.squadId=0;boss.x=p.x;boss.shot=0;
  if(attacking){
   boss.dive=1;boss.y=132;boss.vx=0;boss.vy=24;
   logEnemyAttackStart(boss,'dive',{targetX:+p.x.toFixed(2),scripted:0,harness:1,carriedFighter:1});
  }else{
   boss.dive=0;boss.x=p.x;boss.y=186;
  }
  logEvent('harness_carried_fighter_setup',{boss:boss.id,attacking,playerX:+p.x.toFixed(2)});
  return true;
 },
 setupBossFirstHitTest(cfg={}){
  const p=S.p;
  const boss=S.e.find(e=>e.hp>0&&e.t==='boss');
  if(!boss)return false;
  p.x=cl(+cfg.playerX||PLAY_W/2,18,PLAY_W-18);p.y=PLAY_H-VIS.playerBottom;p.dual=0;p.captured=0;p.pending=0;p.spawn=0;p.capBoss=null;p.capT=0;p.inv=0;
  S.cap=null;S.pb.length=0;S.eb.length=0;S.att=0;S.recoverT=0;S.attackGapT=0;S.stage=Math.max(1,+cfg.stage||1);S.stageClock=0;
  for(const e of S.e)if(e.id!==boss.id)e.hp=0;
  boss.hp=2;boss.max=2;boss.form=1;boss.dive=0;boss.carry=0;boss.beam=0;boss.beamT=0;boss.low=0;boss.esc=0;boss.squadId=0;boss.x=cl(+cfg.bossX||p.x,28,PLAY_W-28);boss.y=+cfg.bossY||112;boss.vx=0;boss.vy=0;boss.hitT=0;
  logEvent('harness_boss_first_hit_setup',{boss:boss.id,playerX:+p.x.toFixed(2),bossX:+boss.x.toFixed(2),bossY:+boss.y.toFixed(2),stage:S.stage});
  return true;
 }
};

setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
function loop(ts){const dt=Math.min(.033,(ts-t0)/1000||0);t0=ts;update(dt);draw();requestAnimationFrame(loop)}
resetSession();
logEvent('boot');
logSnapshot('boot');
syncRecordUi();
syncTestUi();
rs();
startAttractDemo();
requestAnimationFrame(loop);

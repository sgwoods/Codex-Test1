// Harness hooks and startup loop.
window.__galagaHarness__={
 start(cfg={}){
  if(cfg.seed!==undefined)setSeed(cfg.seed);
  if(typeof cfg.autoVideo==='boolean'){
   VIDEO_REC.enabled=!!cfg.autoVideo;
   localStorage.setItem(RECORD_PREF_KEY,VIDEO_REC.enabled?'1':'0');
   syncRecordUi();
  }
  if(cfg.stage||cfg.ships||cfg.challenge!==undefined){
   testStage.value=cl(+cfg.stage||1,1,99)|0;
   testShips.value=cl(+cfg.ships||3,1,9)|0;
   testChallenge.checked=!!cfg.challenge;
   saveTestCfg();
  }
  if(!started)start();
 },
 stop(label='harness'){
  logEvent('harness_stop',{label});
  logSnapshot('harness_stop');
  if(VIDEO_REC.enabled)exportSession({auto:1,silent:1});
  stopRunRecording();
  started=0;paused=0;
  msg.textContent='';
 },
 export(){exportSession({silent:1})},
 snapshot(){return snapshot()},
 state(){return{started,paused,stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1),challenge:!!S.challenge,recording:!!VIDEO_REC.active,seed:RNG_SEED}},
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
 }
};

setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
function loop(ts){const dt=Math.min(.033,(ts-t0)/1000||0);t0=ts;update(dt);draw();requestAnimationFrame(loop)}
resetSession();
logEvent('boot');
logSnapshot('boot');
syncRecordUi();
syncTestUi();
rs();requestAnimationFrame(loop);

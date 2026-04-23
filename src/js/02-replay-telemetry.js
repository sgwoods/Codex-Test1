// Shared session logging, replay persistence, and recording helpers.

function runAfterRecordingStops(fn){
 if(typeof fn!=='function')return;
 if(!VIDEO_REC.rec&&!VIDEO_REC.active){fn();return;}
 VIDEO_REC.afterStop.push(fn);
}
function flushAfterRecordingStops(){
 const queued=VIDEO_REC.afterStop.splice(0,VIDEO_REC.afterStop.length);
 for(const fn of queued)try{fn();}catch{}
}
function resetSession(reason='boot'){
 sessionN++;
 REC={id:`ngt-${Date.now()}-${sessionN}`,build:BUILD,reason,createdAt:new Date().toISOString(),url:location.href,viewport:{w:innerWidth,h:innerHeight,dpr:window.devicePixelRatio||1},userAgent:navigator.userAgent,events:[],snapshots:[]};
 REC.t0=performance.now();
 recShotT=0;
 if(typeof sfx!=='undefined'&&sfx){
  if(typeof sfx.stopReferenceClips==='function')sfx.stopReferenceClips();
  if(sfx.referenceCooldowns)sfx.referenceCooldowns=Object.create(null);
 }
 if(RNG_SEED)REC.seed=RNG_SEED;
}
function logEvent(type,data={}){
 if(!REC)resetSession();
 REC.events.push(Object.assign({t:recTime(),type},data));
}
let carryDebugLastState='';
let rescueDebugLastState='';
function setCarryDebug(enabled,label='manual'){
 window.__platinumCarryDebug=enabled?1:0;
 window.__auroraCarryDebug=window.__platinumCarryDebug;
 carryDebugLastState='';
 rescueDebugLastState='';
 logEvent('carry_debug_toggle',{enabled:!!enabled,label});
}
function carryRelationState(){
 const p=S.p;
 if(p.captured&&p.capBoss&&p.capBoss.hp>0){
  return {
   mode:'captured',
   bossId:p.capBoss.id,
   bossX:+p.capBoss.x.toFixed(2),
   bossY:+p.capBoss.y.toFixed(2),
   fighterX:+p.x.toFixed(2),
   fighterY:+p.y.toFixed(2),
   relation:p.y>p.capBoss.y?'below':'above',
   dive:p.capBoss.dive||0
  };
 }
 const carryingBoss=S.e.find(e=>e.hp>0&&e.carry);
 if(carryingBoss){
  const target=typeof carriedFighterTarget==='function'?carriedFighterTarget(carryingBoss):null;
  return {
   mode:'carried',
   bossId:carryingBoss.id,
   bossX:+carryingBoss.x.toFixed(2),
   bossY:+carryingBoss.y.toFixed(2),
   fighterX:target?+target.x.toFixed(2):null,
   fighterY:target?+target.y.toFixed(2):null,
   relation:target&&target.y<carryingBoss.y?'above':'below',
   dive:carryingBoss.dive||0
  };
 }
 return null;
}
function rescuePodDebugState(){
 if(!S.cap)return null;
 return {
  mode:'rescue_pod',
  x:+S.cap.x.toFixed(2),
  y:+S.cap.y.toFixed(2),
  podMode:S.cap.mode||'fall',
  side:S.cap.side||0,
  playerX:+S.p.x.toFixed(2),
  playerY:+S.p.y.toFixed(2)
 };
}
function logCarryDebugState(reason='tick'){
 if(!(window.__platinumCarryDebug??window.__auroraCarryDebug))return;
 const state=carryRelationState();
 const key=state?`${state.mode}:${state.bossId}:${state.relation}:${state.dive}`:'none';
 if(key===carryDebugLastState&&reason==='tick')return;
 carryDebugLastState=key;
 logEvent('carry_relation_state',Object.assign({reason},state||{mode:'none'}));
 const rescueState=rescuePodDebugState();
 const rescueKey=rescueState?`${rescueState.podMode}:${rescueState.x}:${rescueState.y}`:'none';
 if(rescueKey!==rescueDebugLastState||reason!=='tick'){
  rescueDebugLastState=rescueKey;
  logEvent('rescue_pod_state',Object.assign({reason},rescueState||{mode:'none'}));
 }
}
window.setCarryDebug=setCarryDebug;
window.logCarryDebugState=logCarryDebugState;
window.getCarryRelationState=carryRelationState;
window.getRescuePodDebugState=rescuePodDebugState;
function logSnapshot(tag='tick'){
 if(!REC)resetSession();
 REC.snapshots.push(Object.assign({t:recTime(),tag},snapshot()));
}
function fireEnemyBullet(e,vx,vy,kind){
 S.eb.push({x:e.x,y:e.y+24,vx,vy,kind,sourceId:e.id,sourceType:e.t,sourceDive:e.dive});
 logEvent('enemy_bullet_fired',Object.assign({stage:S.stage,kind,x:+e.x.toFixed(2),y:+(e.y+24).toFixed(2),vx:+vx.toFixed(2),vy:+vy.toFixed(2),bulletLane:playLane(e.x),playerLane:playLane(S.p.x)},enemyRef(e)));
 sfx.enemyShot();
}
function logEnemyAttackStart(e,mode,extra={}){
 const targetLane=Number.isFinite(extra?.targetX)?playLane(extra.targetX):null;
 logEvent('enemy_attack_start',Object.assign({stage:S.stage,mode,x:+e.x.toFixed(2),y:+e.y.toFixed(2),originLane:playLane(e.x),targetLane,playerLane:playLane(S.p.x)},enemyRef(e),extra));
}
function exportSession(opts={}){
 if(!REC)resetSession();
 if(opts.auto&&autoExportedSessionId===REC.id)return;
 logSnapshot('export');
 const out=JSON.stringify({session:Object.assign({},REC,{duration:recTime(),eventCount:REC.events.length,snapshotCount:REC.snapshots.length})},null,2);
 const fileBase=`neo-galaga-session-${REC.id}`;
 downloadBlob(new Blob([out],{type:'application/json'}),`${fileBase}.json`);
 if(typeof getSystemStatusReport==='function'){
  const systemOut=JSON.stringify(getSystemStatusReport(40),null,2);
  downloadBlob(new Blob([systemOut],{type:'application/json'}),`${fileBase}-system-status.json`);
 }
 if(opts.auto)autoExportedSessionId=REC.id;
 if(!opts.silent)showToast('Session log and system status downloaded');
}
function downloadBlob(blob,file){
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=file;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function videoRecordSupported(){return !!(c.captureStream&&window.MediaRecorder);}
function localReplaySupported(){
 return !!(window.AuroraReplayStore&&typeof window.AuroraReplayStore.supported==='function'&&window.AuroraReplayStore.supported());
}
function shouldCaptureRunVideo(){
 if(window.__platinumHarnessDisableRecording||window.__auroraHarnessDisableRecording)return false;
 return videoRecordSupported()&&(VIDEO_REC.enabled||localReplaySupported());
}
function pickVideoMime(){
 const list=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
 for(const m of list)if(!window.MediaRecorder||!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(m))return m;
 return '';
}
function syncRecordUi(){
 const supported=videoRecordSupported();
 recordBtn.disabled=!supported;
 recordBtn.classList.toggle('active',VIDEO_REC.enabled||VIDEO_REC.active);
 recordBtn.textContent=supported?(VIDEO_REC.active?(VIDEO_REC.enabled?'Recording Video...':'Recording Replay...'):`Auto Video: ${VIDEO_REC.enabled?'On':'Off'}`):'Auto Video: Unsupported';
}
function currentReplayMeta(){
 const pilotUserId=typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.user?.id?String(LEADERBOARD.user.id):'';
 const pilotEmail=typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.user?.email?String(LEADERBOARD.user.email):'';
 const pilotInitials=typeof preferredInitialsFromUser==='function'?preferredInitialsFromUser():'';
 return {
  id:VIDEO_REC.sessionId||REC?.id||`replay-${Date.now()}`,
  source:'game_native',
  build:BUILD,
  createdAt:REC?.createdAt||new Date().toISOString(),
  duration:recTime(),
  score:S.score|0,
  stage:S.stage|0,
  challenge:!!S.challenge,
  attract:!!S.attract,
  reason:REC?.reason||'unknown',
  persona:S.harnessPersona||null,
  pilotUserId,
  pilotEmail,
  pilotInitials,
  stats:{shots:S.stats?.shots|0,hits:S.stats?.hits|0}
 };
}
async function persistLocalReplay(blob,meta){
 if(!blob||!meta||!localReplaySupported())return;
 if(meta.attract||meta.reason!=='game_start'||meta.duration<3)return;
 try{
  await window.AuroraReplayStore.saveReplay(Object.assign({},meta,{
   blob,
   mime:blob.type||VIDEO_REC.mime||'video/webm'
  }));
  if(typeof window.refreshMovieCatalog==='function')window.refreshMovieCatalog({silent:1});
 }catch(err){
  console.warn('local replay save failed',err);
 }
}
function stopRunRecording(){
 if(!VIDEO_REC.active||!VIDEO_REC.rec){flushAfterRecordingStops();return;}
 VIDEO_REC.active=0;
 VIDEO_REC.stopMeta=currentReplayMeta();
 if(sfx.recOsc){try{sfx.recOsc.stop();}catch{}try{sfx.recOsc.disconnect();}catch{}sfx.recOsc=null}
 if(sfx.recGain){try{sfx.recGain.disconnect();}catch{}sfx.recGain=null}
 const rec=VIDEO_REC.rec;
 VIDEO_REC.rec=null;
 try{rec.stop();}catch{}
 syncRecordUi();
}
function startRunRecording(){
 if(!shouldCaptureRunVideo())return;
 if(VIDEO_REC.active)stopRunRecording();
 const mime=pickVideoMime();
 VIDEO_REC.mime=mime;
 const videoStream=c.captureStream(60),stream=new MediaStream();
 for(const t of videoStream.getVideoTracks())stream.addTrack(t);
 if(VIDEO_REC_INCLUDE_AUDIO&&sfx.tap){
  const A=AC();A.resume?.();
  sfx.recGain=A.createGain();
  sfx.recGain.gain.value=.00035;
  sfx.recOsc=A.createOscillator();
  sfx.recOsc.type='sine';
  sfx.recOsc.frequency.value=23;
  sfx.recOsc.connect(sfx.recGain);
  sfx.recGain.connect(sfx.tap);
  sfx.recOsc.start();
  for(const t of sfx.tap.stream.getAudioTracks())stream.addTrack(t);
 }
 VIDEO_REC.stream=stream;
 const chunks=[];
 VIDEO_REC.chunks=chunks;
 VIDEO_REC.sessionId=REC?.id||`run-${Date.now()}`;
 VIDEO_REC.file=`neo-galaga-video-${VIDEO_REC.sessionId}.webm`;
 VIDEO_REC.stopMeta=null;
 const file=VIDEO_REC.file;
 const currentStream=VIDEO_REC.stream;
 const rec=mime?new MediaRecorder(currentStream,{mimeType:mime}):new MediaRecorder(currentStream);
 rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
 rec.onstop=()=>{
  const blob=new Blob(chunks,{type:mime||'video/webm'});
  const replayMeta=VIDEO_REC.stopMeta||currentReplayMeta();
  if(currentStream)for(const t of currentStream.getTracks())t.stop();
  if(VIDEO_REC.stream===currentStream)VIDEO_REC.stream=null;
  if(VIDEO_REC.chunks===chunks)VIDEO_REC.chunks=[];
  if(blob.size>0){
   persistLocalReplay(blob,replayMeta);
   if(VIDEO_REC.enabled){
    downloadBlob(blob,file);
    showToast('Run video downloaded');
   }
  }
  VIDEO_REC.stopMeta=null;
  flushAfterRecordingStops();
 };
 rec.start(1000);
 VIDEO_REC.rec=rec;
 VIDEO_REC.active=1;
 syncRecordUi();
}

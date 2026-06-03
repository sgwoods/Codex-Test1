// Shared runtime/shell helpers for input, build-stamp state, and core chrome UI.

function movementLeftCodes(){
 return ['ArrowLeft','KeyA','KeyZ'];
}
function movementRightCodes(){
 return ['ArrowRight','KeyD','KeyC'];
}
function movementControlCodes(){
 return [...movementLeftCodes(),...movementRightCodes()];
}
function controlMoveHelpHtml(){
 return `ARROWS OR <span class="k">A/Z</span> LEFT   <span class="k">D/C</span> RIGHT   <span class="k">SPACE</span> FIRE   <span class="k">P</span> PAUSE`;
}
function resetActiveInputState(reason='manual'){
 const hadKeys=Object.keys(keys).some(code=>!!keys[code]);
 const hadState=Object.keys(keyState).length>0;
 const hadMotion=!!(S?.p&&Math.abs(+S.p.vx||0)>0);
 keys={};
 keyState={};
 if(S?.p&&Number.isFinite(+S.p.vx)){
  S.p.vx=0;
  const recenterReason=/-recenter$/.test(String(reason||''));
  if(reason&&reason!=='manual'&&reason!=='game_start'&&reason!=='input-mapping-recenter'&&!recenterReason){
   S.p.inputResetHoldT=Math.max(+S.p.inputResetHoldT||0,.24);
  }
 }
 if(reason)logEvent('input_state_reset',{reason,hadKeys:!!hadKeys,hadState:!!hadState,hadMotion});
}
var platformMessagePanelOpen=0;
function closeDockOverlays(except=''){
 if(except!=='settings'&&typeof settingsOpen!=='undefined'&&settingsOpen&&typeof closeSettings==='function')closeSettings();
 if(except!=='help'&&typeof helpOpen!=='undefined'&&helpOpen&&typeof closeHelp==='function')closeHelp(1);
 if(except!=='feedback'&&typeof feedbackOpen!=='undefined'&&feedbackOpen&&typeof closeFeedback==='function')closeFeedback(1);
 if(except!=='platformSplash'&&typeof platformSplashOpen!=='undefined'&&platformSplashOpen&&typeof closePlatformSplash==='function')closePlatformSplash(1);
 if(except!=='gamePreview'&&typeof gamePreviewOpen!=='undefined'&&gamePreviewOpen&&typeof closeGamePreview==='function')closeGamePreview(1);
 if(except!=='gamePicker'&&typeof gamePickerOpen!=='undefined'&&gamePickerOpen&&typeof closeGamePicker==='function')closeGamePicker(1);
 if(except!=='leaderboard'&&typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.panelOpen&&typeof closeLeaderboardPanel==='function')closeLeaderboardPanel();
 if(except!=='account'&&typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.accountPanelOpen&&typeof closeAccountPanel==='function')closeAccountPanel();
 if(except!=='platformMessages'&&platformMessagePanelOpen&&typeof closePlatformMessagePanel==='function')closePlatformMessagePanel();
 if(except!=='movie'&&typeof isMoviePanelOpen==='function'&&isMoviePanelOpen()&&typeof closeMoviePanel==='function')closeMoviePanel(1);
}
function syncAudioUi(){
 if(!muteToggleBtn)return;
 muteToggleBtn.dataset.muted=audioMuted?'true':'false';
 muteToggleBtn.setAttribute('aria-pressed',audioMuted?'true':'false');
 muteToggleBtn.setAttribute('aria-label',audioMuted?'Unmute sound effects':'Mute sound effects');
 muteToggleBtn.title=audioMuted?'Unmute sound effects':'Mute sound effects';
 muteToggleBtn.dataset.actionTip=audioMuted?'Unmute sound effects':'Mute sound effects';
 const icon=muteToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=audioMuted?'🔇':'🔊';
 if(sfx.bus)sfx.bus.gain.value=audioMuted?0:gameSoundVolume;
 if(typeof syncAudioMixControls==='function')syncAudioMixControls();
}
function sanitizeArcadeMusicPlaylistId(value=''){
 const raw=String(value||'').trim();
 return /^[A-Za-z0-9_-]{8,160}$/.test(raw)?raw:'';
}
function arcadeMusicPlatformDefaultPlaylistId(){
 return sanitizeArcadeMusicPlaylistId(BUILD_INFO?.platform?.media?.arcadeMusicPlaylistId||ARCADE_MUSIC_PLAYLIST_ID);
}
function arcadeMusicHarnessOverrideAllowed(){
 try{
  const host=String(location?.hostname||'').toLowerCase();
  return host==='127.0.0.1'||host==='localhost'||host==='::1'||!!DOCS_PREVIEW_MODE;
 }catch{
  return false;
 }
}
function arcadeMusicResolvedConfig(){
 const pack=typeof window!=='undefined'&&typeof window.currentGamePack==='function'?window.currentGamePack():null;
 const gameKey=String(pack?.metadata?.gameKey||'').trim();
 const gameTitle=String(pack?.metadata?.title||'Current game').trim();
 const media=pack?.media||pack?.metadata?.media||{};
 const platformPlaylistId=arcadeMusicPlatformDefaultPlaylistId();
 const gamePlaylistId=sanitizeArcadeMusicPlaylistId(media.arcadeMusicPlaylistId);
 const selectionPlaylistId=typeof arcadeMusicPlaylistOverrideForGame==='function'?sanitizeArcadeMusicPlaylistId(arcadeMusicPlaylistOverrideForGame(gameKey)):'';
 const harnessPlaylistId=sanitizeArcadeMusicPlaylistId(ARCADE_MUSIC.playlistOverride);
 const base=Object.freeze({
  playlistId:selectionPlaylistId||gamePlaylistId||platformPlaylistId,
  playlistSource:selectionPlaylistId?'selection':(gamePlaylistId?'game':'platform'),
  playlistLabel:String(
   selectionPlaylistId
    ?'Developer-selected arcade music'
    :(media.arcadeMusicPlaylistLabel||(gamePlaylistId?`${gameTitle} arcade music`:BUILD_INFO?.platform?.media?.arcadeMusicPlaylistLabel||'Default Platinum Arcade Music'))
  ).trim(),
  gameKey,
  gameTitle,
  platformPlaylistId,
  gamePlaylistId,
  selectionPlaylistId,
  configured:!!(selectionPlaylistId||gamePlaylistId||platformPlaylistId),
  harnessOverrideActive:false
 });
 if(harnessPlaylistId&&arcadeMusicHarnessOverrideAllowed()){
  return Object.assign({},base,{
   playlistId:harnessPlaylistId,
   playlistSource:'harness',
   playlistLabel:'Harness arcade music',
   harnessOverrideActive:true
  });
 }
 return base;
}
function arcadeMusicPlaylistId(){
 return arcadeMusicResolvedConfig().playlistId;
}
function arcadeMusicEffectiveMuted(){
 return !!(arcadeMusicMuted||ARCADE_MUSIC.forceMuted);
}
function arcadeMusicState(){
 const config=arcadeMusicResolvedConfig();
 const effectiveMuted=arcadeMusicEffectiveMuted();
 return {
  state:ARCADE_MUSIC.state,
  requested:!!ARCADE_MUSIC.requested,
  configured:!!config.configured,
  hasFrame:!!(arcadeMusicFrameHost&&arcadeMusicFrameHost.querySelector('iframe')),
  playlistId:config.playlistId,
  playlistSource:config.playlistSource,
  fallbackMode:ARCADE_MUSIC.fallbackMode||'',
  warming:!!ARCADE_MUSIC.warming,
  warmReady:!!ARCADE_MUSIC.warmReady,
  forceMuted:!!ARCADE_MUSIC.forceMuted,
  playlistLabel:config.playlistLabel,
  platformPlaylistId:config.platformPlaylistId,
  gamePlaylistId:config.gamePlaylistId,
  selectionPlaylistId:config.selectionPlaylistId,
  gameKey:config.gameKey,
  gameTitle:config.gameTitle,
  activePlaylistId:ARCADE_MUSIC.activePlaylistId||'',
  activePlaylistSource:ARCADE_MUSIC.activePlaylistSource||'',
  arcadeMusicVolume:+arcadeMusicVolume.toFixed(3),
  arcadeMusicMuted:!!arcadeMusicMuted,
  effectiveMuted:!!effectiveMuted,
  audible:!!(ARCADE_MUSIC.state==='playing'&&!effectiveMuted&&arcadeMusicVolume>0),
  gameSoundVolume:+gameSoundVolume.toFixed(3),
  lastTrack:ARCADE_MUSIC.lastTrack||null
 };
}
function syncArcadeMusicUi(){
 if(!arcadeMusicToggleBtn)return;
 const active=ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading';
 const playing=ARCADE_MUSIC.state==='playing';
 const fallbackPlaying=playing&&ARCADE_MUSIC.fallbackMode==='iframe';
 const config=arcadeMusicResolvedConfig();
 const unavailable=ARCADE_MUSIC.state==='unavailable'||!config.playlistId;
 const warming=!!ARCADE_MUSIC.warming;
 const temporaryMuted=playing&&!!ARCADE_MUSIC.forceMuted;
 const muted=playing&&arcadeMusicEffectiveMuted();
 arcadeMusicToggleBtn.dataset.musicState=active?(warming?'warming':(muted?'muted':ARCADE_MUSIC.state)):(unavailable?'unavailable':'off');
 arcadeMusicToggleBtn.dataset.musicPlaying=playing?'true':'false';
 arcadeMusicToggleBtn.dataset.musicMuted=muted?'true':'false';
 arcadeMusicToggleBtn.dataset.musicTemporaryMuted=temporaryMuted?'true':'false';
 arcadeMusicToggleBtn.dataset.musicWarming=warming?'true':'false';
 arcadeMusicToggleBtn.dataset.configured=config.playlistId?'true':'false';
 arcadeMusicToggleBtn.dataset.playlistSource=config.playlistSource||'';
 arcadeMusicToggleBtn.disabled=warming;
 arcadeMusicToggleBtn.setAttribute('aria-disabled',warming?'true':'false');
 arcadeMusicToggleBtn.setAttribute('aria-pressed',playing&&!muted?'true':'false');
 const label=unavailable
  ?'Arcade Music unavailable'
  :(!active
   ?'Start Arcade Music'
   :(warming
    ?'Arcade Music warming until the opening ad finishes'
    :(ARCADE_MUSIC.state==='loading'
    ?'Starting Arcade Music'
    :(fallbackPlaying
      ?'Stop Arcade Music'
      :(temporaryMuted?'Enable Arcade Music':(muted?'Unmute Arcade Music':'Mute Arcade Music'))))));
 arcadeMusicToggleBtn.setAttribute('aria-label',label);
 arcadeMusicToggleBtn.title=label;
 arcadeMusicToggleBtn.dataset.actionTip=label;
 arcadeMusicToggleBtn.classList.toggle('active',playing&&!muted&&!warming);
 arcadeMusicToggleBtn.classList.toggle('muted',muted);
 const icon=arcadeMusicToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=playing&&!muted?'🎶':'🎵';
}
function arcadeMusicEmbedUrl(playlistId,opts={}){
 const origin=(location&&location.origin&&location.origin!=='null')?`&origin=${encodeURIComponent(location.origin)}`:'';
 const muted=opts.startMuted?'&mute=1':'';
 return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&listType=playlist&autoplay=1&playsinline=1&enablejsapi=1&rel=0${origin}${muted}`;
}
let arcadeMusicApiPromise=null;
function loadArcadeMusicApi(){
 if(window.YT&&typeof window.YT.Player==='function')return Promise.resolve(window.YT);
 if(arcadeMusicApiPromise)return arcadeMusicApiPromise;
 arcadeMusicApiPromise=new Promise((resolve,reject)=>{
  const priorReady=typeof window.onYouTubeIframeAPIReady==='function'?window.onYouTubeIframeAPIReady:null;
  const ready=()=>{
   try{
    if(priorReady)priorReady();
   }catch{}
   if(window.YT&&typeof window.YT.Player==='function')resolve(window.YT);
  };
  window.onYouTubeIframeAPIReady=ready;
  const existing=document.getElementById('youtubeIframeApiScript');
  if(existing){
   setTimeout(ready,0);
   return;
  }
  const script=document.createElement('script');
  script.id='youtubeIframeApiScript';
  script.src='https://www.youtube.com/iframe_api';
  script.async=true;
  script.onerror=()=>reject(new Error('YouTube iframe API failed to load'));
  document.head.appendChild(script);
  setTimeout(()=>{
   if(window.YT&&typeof window.YT.Player==='function')resolve(window.YT);
  },1200);
 });
 return arcadeMusicApiPromise;
}
function clearArcadeMusicStartupTimeout(){
 const timerId=+ARCADE_MUSIC.startupTimeoutId||0;
 if(timerId)clearTimeout(timerId);
 ARCADE_MUSIC.startupTimeoutId=0;
}
function clearArcadeMusicFallbackTimeout(){
 const timerId=+ARCADE_MUSIC.fallbackTimeoutId||0;
 if(timerId)clearTimeout(timerId);
 ARCADE_MUSIC.fallbackTimeoutId=0;
}
function clearArcadeMusicWarmProbe(){
 const timerId=+ARCADE_MUSIC.warmProbeTimeoutId||0;
 if(timerId)clearTimeout(timerId);
 ARCADE_MUSIC.warmProbeTimeoutId=0;
}
function resolveArcadeMusicIframe(frameRef=null){
 const candidateFrame=
  (frameRef&&typeof frameRef.tagName==='string'&&String(frameRef.tagName).toLowerCase()==='iframe'&&frameRef.isConnected)
   ?frameRef
   :(ARCADE_MUSIC.iframe&&ARCADE_MUSIC.iframe.isConnected?ARCADE_MUSIC.iframe:null);
 if(candidateFrame){
  ARCADE_MUSIC.iframe=candidateFrame;
  return candidateFrame;
 }
 noteArcadeMusicFrame();
 if(ARCADE_MUSIC.iframe)return ARCADE_MUSIC.iframe;
 const domFrame=
  (arcadeMusicFrameHost&&typeof arcadeMusicFrameHost.querySelector==='function'
   ?arcadeMusicFrameHost.querySelector('iframe#arcadeMusicFrame, iframe')
   :null)
   ||document.getElementById('arcadeMusicFrame');
 ARCADE_MUSIC.iframe=domFrame||null;
 return ARCADE_MUSIC.iframe;
}
function activateArcadeMusicIframeFallback(reason='api_attach_timeout',frameRef=null){
 const playlistId=ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId();
 if(!playlistId||playlistId==='PLarcadeMusicHarness01')return false;
 if(!resolveArcadeMusicIframe(frameRef))return false;
 if(ARCADE_MUSIC.fallbackMode==='iframe'&&ARCADE_MUSIC.state==='playing')return true;
 clearArcadeMusicStartupTimeout();
 clearArcadeMusicFallbackTimeout();
 ARCADE_MUSIC.requested=true;
 if(!ARCADE_MUSIC.activePlaylistId)ARCADE_MUSIC.activePlaylistId=playlistId;
 if(!ARCADE_MUSIC.activePlaylistSource)ARCADE_MUSIC.activePlaylistSource=arcadeMusicResolvedConfig().playlistSource;
 ARCADE_MUSIC.fallbackMode='iframe';
 ARCADE_MUSIC.state='playing';
 syncArcadeMusicUi();
 if(typeof console!=='undefined'&&typeof console.warn==='function'){
  console.warn('[Arcade Music] Falling back to iframe-only playlist playback; YouTube player API did not attach.', {
   playlistId,
   playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
   reason
  });
 }
 if(typeof logEvent==='function')logEvent('arcade_music_fallback_mode',{
  mode:'iframe',
  playlistId,
  playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
  reason
 });
 return true;
}
function scheduleArcadeMusicFallbackTimeout(frameRef=null){
 clearArcadeMusicFallbackTimeout();
 const mountToken=+ARCADE_MUSIC.mountToken||0;
 const playlistId=ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId();
 if(!playlistId||playlistId==='PLarcadeMusicHarness01')return;
 ARCADE_MUSIC.fallbackTimeoutId=setTimeout(()=>{
  if(!ARCADE_MUSIC.requested||(+ARCADE_MUSIC.mountToken||0)!==mountToken)return;
  if(ARCADE_MUSIC.warming){
   abortArcadeMusicWarmup('api_attach_timeout');
   return;
  }
  activateArcadeMusicIframeFallback('api_attach_timeout',frameRef);
 },2500);
}
function scheduleArcadeMusicStartupTimeout(frameRef=null){
 clearArcadeMusicStartupTimeout();
 const mountToken=+ARCADE_MUSIC.mountToken||0;
 const timeoutMs=ARCADE_MUSIC.warming?45000:18000;
 ARCADE_MUSIC.startupTimeoutId=setTimeout(()=>{
  if(!ARCADE_MUSIC.requested||(+ARCADE_MUSIC.mountToken||0)!==mountToken||(ARCADE_MUSIC.state==='playing'&&!ARCADE_MUSIC.warming))return;
  if(ARCADE_MUSIC.warming){
   abortArcadeMusicWarmup('startup_timeout');
   return;
  }
  if(activateArcadeMusicIframeFallback('startup_timeout',frameRef))return;
  ARCADE_MUSIC.state='unavailable';
  syncArcadeMusicUi();
  if(typeof console!=='undefined'&&typeof console.warn==='function'){
   console.warn('[Arcade Music] Timed out waiting for playable YouTube content.', {
    playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
    playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource
   });
  }
  if(typeof logEvent==='function')logEvent('arcade_music_error',{
   reason:'startup_timeout',
   playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
   playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
   blockedTrackAttempts:+ARCADE_MUSIC.blockedTrackSkipCount||0
  });
 },timeoutMs);
}
function mountArcadeMusicPlayer(mountToken,opts={},config=arcadeMusicResolvedConfig()){
 if(ARCADE_MUSIC.mountToken!==mountToken||!ARCADE_MUSIC.requested)return false;
 if(!window.YT||typeof window.YT.Player!=='function')throw new Error('YouTube iframe API unavailable');
 clearArcadeMusicFallbackTimeout();
 ARCADE_MUSIC.fallbackMode='';
 const playlistId=config.playlistId||ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId();
 const origin=(location&&location.origin&&location.origin!=='null')?location.origin:undefined;
 const useHarnessVideo=playlistId==='PLarcadeMusicHarness01';
 const playerVars=useHarnessVideo
  ?{
    autoplay:1,
    playsinline:1,
    rel:0,
    controls:0,
    modestbranding:1,
    iv_load_policy:3,
    origin
   }
  :{
    playsinline:1,
    rel:0,
    controls:0,
    modestbranding:1,
    iv_load_policy:3,
    origin
   };
 const playerConfig={
  host:'https://www.youtube.com',
  width:'240',
  height:'240',
  playerVars,
  events:{
   onReady:handleArcadeMusicPlayerReady,
   onStateChange:handleArcadeMusicPlayerStateChange,
   onError:handleArcadeMusicPlayerError
  }
 };
 if(useHarnessVideo)playerConfig.videoId='M7lc1UVf-VE';
 ARCADE_MUSIC.player=new window.YT.Player('arcadeMusicFrame',playerConfig);
 return true;
}
function destroyArcadeMusicPlayer(){
 clearArcadeMusicStartupTimeout();
 clearArcadeMusicFallbackTimeout();
 clearArcadeMusicWarmProbe();
 const player=ARCADE_MUSIC.player;
 if(player&&typeof player.destroy==='function'){
  try{player.destroy()}catch{}
 }
 ARCADE_MUSIC.player=null;
 if(arcadeMusicFrameHost)arcadeMusicFrameHost.innerHTML='';
 ARCADE_MUSIC.iframe=null;
 ARCADE_MUSIC.fallbackMode='';
}
function noteArcadeMusicFrame(){
 resolveArcadeMusicIframe();
}
function syncArcadeMusicTrackFromPlayer(source='youtube_player_api'){
 const player=ARCADE_MUSIC.player;
 if(!player||typeof player.getVideoData!=='function')return false;
 try{
  return acceptArcadeMusicTrack(player.getVideoData()||{},source);
 }catch{
  return false;
 }
}
function applyArcadeMusicVolume(){
 const pct=volumePercent(arcadeMusicVolume);
 const player=ARCADE_MUSIC.player;
 const effectiveMuted=arcadeMusicEffectiveMuted();
 if(player){
  try{player.setVolume(pct)}catch{}
  try{
   if(pct>0&&!effectiveMuted)player.unMute();
   else player.mute();
  }catch{}
 }
 return pct;
}
function currentArcadeMusicPlaylistIndex(player=ARCADE_MUSIC.player){
 if(!player||typeof player.getPlaylistIndex!=='function')return Math.max(0,+ARCADE_MUSIC.playlistIndex||0);
 try{
  const index=Number(player.getPlaylistIndex());
  if(Number.isFinite(index)&&index>=0)return index;
 }catch{}
 return Math.max(0,+ARCADE_MUSIC.playlistIndex||0);
}
function loadArcadeMusicPlaylistIndex(player=ARCADE_MUSIC.player,index=0){
 const playlistId=ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId();
 if(!player||!playlistId||playlistId==='PLarcadeMusicHarness01')return false;
 const nextIndex=Math.max(0,Math.floor(index||0));
 const playlistConfig={
  listType:'playlist',
  list:playlistId,
  index:nextIndex
 };
 ARCADE_MUSIC.playlistIndex=nextIndex;
 if(typeof player.loadPlaylist==='function'){
  try{
   player.loadPlaylist(playlistConfig);
   return true;
  }catch{}
 }
 if(typeof player.cuePlaylist==='function'){
  try{
   player.cuePlaylist(playlistConfig);
   try{player.playVideo?.()}catch{}
   return true;
  }catch{}
 }
 return false;
}
function handleArcadeMusicPlayerReady(event){
 const player=event?.target||null;
 if(player)ARCADE_MUSIC.player=player;
 noteArcadeMusicFrame();
 ARCADE_MUSIC.state='loading';
 syncArcadeMusicUi();
 applyArcadeMusicVolume();
 if(ARCADE_MUSIC.activePlaylistId==='PLarcadeMusicHarness01'){
  try{player?.playVideo?.()}catch{}
 }else{
  ARCADE_MUSIC.playlistIndex=0;
  try{player?.playVideo?.()}catch{}
 }
 scheduleArcadeMusicStartupTimeout();
}
function normalizeArcadeMusicTrack(videoData={}){
 const title=String(videoData.title||videoData.video_title||videoData.videoTitle||'').trim();
 const artist=String(videoData.author||videoData.ownerChannelName||videoData.channelTitle||videoData.channelName||'').trim();
 const videoId=String(videoData.video_id||videoData.videoId||videoData.id||'').trim();
 return title?{title,artist,videoId}:null;
}
function acceptArcadeMusicTrack(videoData={},source='youtube_player'){
 const track=normalizeArcadeMusicTrack(videoData);
 if(!track)return false;
 const signature=track.videoId||`${track.title}|${track.artist}`;
 if(signature&&signature===ARCADE_MUSIC.lastTrackSignature)return false;
 ARCADE_MUSIC.lastTrackSignature=signature;
 ARCADE_MUSIC.lastTrack=track;
 if(typeof showPlatformTrackMessage==='function')showPlatformTrackMessage(track.title,track.artist);
 if(typeof logEvent==='function')logEvent('arcade_music_track_change',{
  title:track.title,
  artist:track.artist,
  videoId:track.videoId,
  source,
  arcadeMusicVolume:+arcadeMusicVolume.toFixed(3),
  arcadeMusicMuted:!!arcadeMusicMuted
 });
 return true;
}
function currentArcadeMusicTrack(player=ARCADE_MUSIC.player){
 if(!player||typeof player.getVideoData!=='function')return null;
 try{
  return normalizeArcadeMusicTrack(player.getVideoData()||{});
 }catch{
  return null;
 }
}
function currentArcadeMusicPlaylistMembers(player=ARCADE_MUSIC.player){
 if(!player||typeof player.getPlaylist!=='function')return [];
 try{
  const list=player.getPlaylist();
  return Array.isArray(list)?list.filter(Boolean).map(item=>String(item).trim()).filter(Boolean):[];
 }catch{
  return [];
 }
}
function currentArcadeMusicTrackInPlaylist(player=ARCADE_MUSIC.player){
 const track=currentArcadeMusicTrack(player);
 const members=currentArcadeMusicPlaylistMembers(player);
 if(!track?.videoId||!members.length)return false;
 return members.includes(track.videoId);
}
function completeArcadeMusicWarmup(source='youtube_player_state'){
 if(!ARCADE_MUSIC.warming)return false;
 clearArcadeMusicWarmProbe();
 ARCADE_MUSIC.warming=false;
 ARCADE_MUSIC.warmReady=true;
 ARCADE_MUSIC.state='playing';
 syncArcadeMusicTrackFromPlayer(source);
 syncArcadeMusicUi();
 if(typeof syncAudioMixControls==='function')syncAudioMixControls();
 if(typeof logEvent==='function')logEvent('arcade_music_warmup_ready',{
  playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
  playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
  source
 });
 return true;
}
function scheduleArcadeMusicWarmProbe(delayMs=900){
 clearArcadeMusicWarmProbe();
 if(!ARCADE_MUSIC.warming||!ARCADE_MUSIC.requested)return;
 const mountToken=+ARCADE_MUSIC.mountToken||0;
 ARCADE_MUSIC.warmProbeTimeoutId=setTimeout(()=>{
  if(!ARCADE_MUSIC.warming||!ARCADE_MUSIC.requested||(+ARCADE_MUSIC.mountToken||0)!==mountToken)return;
  if(currentArcadeMusicTrackInPlaylist()){
   completeArcadeMusicWarmup('warm_probe');
   return;
  }
  scheduleArcadeMusicWarmProbe(delayMs);
 },Math.max(300,delayMs|0));
}
function abortArcadeMusicWarmup(reason='warmup_aborted'){
 if(!ARCADE_MUSIC.warming&&!ARCADE_MUSIC.forceMuted)return false;
 clearArcadeMusicWarmProbe();
 if(typeof console!=='undefined'&&typeof console.warn==='function'){
  console.warn('[Arcade Music] Auto warmup did not reach playable playlist content. Reverting to manual start.', {
   playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
   playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
   reason
  });
 }
 if(typeof logEvent==='function')logEvent('arcade_music_warmup_aborted',{
  playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
  playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
  reason
 });
 stopArcadeMusic({silent:true,persistRequest:false});
 if(typeof syncAudioMixControls==='function')syncAudioMixControls();
 return true;
}
function skipArcadeMusicBlockedTrack(code=0,eventTarget=null){
 const player=eventTarget||ARCADE_MUSIC.player;
 if(!player)return false;
 const skipCount=(+ARCADE_MUSIC.blockedTrackSkipCount||0)+1;
 ARCADE_MUSIC.blockedTrackSkipCount=skipCount;
 if(skipCount>40)return false;
 const currentIndex=currentArcadeMusicPlaylistIndex(player);
 const nextIndex=currentIndex+1;
 ARCADE_MUSIC.state='loading';
 syncArcadeMusicUi();
 if(typeof console!=='undefined'&&typeof console.warn==='function'){
  console.warn('[Arcade Music] Skipping blocked YouTube track.', {
   code,
   attempt:skipCount,
   playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
   playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource
  });
 }
 if(typeof logEvent==='function')logEvent('arcade_music_skip_blocked_video',{
  code,
  attempt:skipCount,
  fromIndex:currentIndex,
  nextIndex,
  playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
  playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource
 });
 if(typeof player.playVideoAt==='function'){
  ARCADE_MUSIC.playlistIndex=nextIndex;
  try{
   player.playVideoAt(nextIndex);
   scheduleArcadeMusicStartupTimeout();
   return true;
  }catch{}
 }
 if(loadArcadeMusicPlaylistIndex(player,nextIndex)){
  scheduleArcadeMusicStartupTimeout();
  return true;
 }
 if(typeof player.nextVideo!=='function')return false;
 try{
  player.nextVideo();
  scheduleArcadeMusicStartupTimeout();
  return true;
 }catch{
  return false;
 }
}
function handleArcadeMusicPlayerStateChange(event){
 const player=event?.target||ARCADE_MUSIC.player||null;
 const stateCode=Number(event?.data);
 if(player)ARCADE_MUSIC.player=player;
 noteArcadeMusicFrame();
 if(stateCode===1){
  clearArcadeMusicStartupTimeout();
  clearArcadeMusicFallbackTimeout();
  ARCADE_MUSIC.blockedTrackSkipCount=0;
  ARCADE_MUSIC.fallbackMode='';
  ARCADE_MUSIC.playlistIndex=currentArcadeMusicPlaylistIndex(player);
  if(ARCADE_MUSIC.warming){
   ARCADE_MUSIC.state='playing';
   if(currentArcadeMusicTrackInPlaylist()){
    completeArcadeMusicWarmup('youtube_player_state');
   }else{
    syncArcadeMusicUi();
    scheduleArcadeMusicWarmProbe();
    scheduleArcadeMusicStartupTimeout();
   }
   return;
  }
  syncArcadeMusicTrackFromPlayer('youtube_player_state');
  if(ARCADE_MUSIC.state!=='playing'){
   ARCADE_MUSIC.state='playing';
   syncArcadeMusicUi();
  }
  return;
 }
 if(stateCode===-1||stateCode===3||stateCode===5){
  if(ARCADE_MUSIC.requested){
   if(stateCode===5&&ARCADE_MUSIC.activePlaylistId!=='PLarcadeMusicHarness01'){
    ARCADE_MUSIC.playlistIndex=currentArcadeMusicPlaylistIndex(player);
    try{player?.playVideo?.()}catch{}
   }
   ARCADE_MUSIC.state='loading';
   syncArcadeMusicUi();
  }
  return;
 }
}
function handleArcadeMusicPlayerError(event){
 const code=Number(event?.data)||0;
 const player=event?.target||ARCADE_MUSIC.player||null;
 if(skipArcadeMusicBlockedTrack(code,player))return;
 clearArcadeMusicStartupTimeout();
 if(ARCADE_MUSIC.warming){
  abortArcadeMusicWarmup(`player_error_${code||'unknown'}`);
  return;
 }
 ARCADE_MUSIC.state='unavailable';
 syncArcadeMusicUi();
 if(typeof console!=='undefined'&&typeof console.warn==='function'){
  console.warn('[Arcade Music] YouTube player could not recover playlist playback.', {
   code,
   playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
   playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
   blockedTrackAttempts:+ARCADE_MUSIC.blockedTrackSkipCount||0
  });
 }
 if(typeof logEvent==='function')logEvent('arcade_music_error',{
  code,
  playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
  playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,
  blockedTrackAttempts:+ARCADE_MUSIC.blockedTrackSkipCount||0
 });
}
function startArcadeMusic(opts={}){
 const config=arcadeMusicResolvedConfig();
 const playlistId=config.playlistId;
 const preserveMute=!!opts.preserveMute;
 const autoWarm=!!opts.autoWarm;
 const persistRequest=opts.persistRequest!==undefined?!!opts.persistRequest:true;
 if(!playlistId){
  ARCADE_MUSIC.state='unavailable';
  ARCADE_MUSIC.requested=false;
  if(persistRequest)writePref(ARCADE_MUSIC_PREF_KEY,'0');
  syncArcadeMusicUi();
  showToast('Arcade Music playlist not configured');
  if(typeof logEvent==='function')logEvent('arcade_music_unavailable');
  return false;
 }
 if(!arcadeMusicFrameHost)return false;
 if(!preserveMute&&!autoWarm){
  arcadeMusicMuted=false;
  writePref(ARCADE_MUSIC_MUTED_PREF_KEY,'0');
 }
 const mountToken=(+ARCADE_MUSIC.mountToken||0)+1;
 ARCADE_MUSIC.mountToken=mountToken;
 destroyArcadeMusicPlayer();
 const useHarnessVideo=playlistId==='PLarcadeMusicHarness01';
 let bootstrapFrameRef=null;
 if(useHarnessVideo){
  const playerHost=document.createElement('div');
  playerHost.id='arcadeMusicFrame';
  playerHost.setAttribute('aria-hidden','true');
  arcadeMusicFrameHost.appendChild(playerHost);
  ARCADE_MUSIC.iframe=null;
 }else{
  const playerShell=document.createElement('div');
  playerShell.id='arcadeMusicFrameShell';
  playerShell.setAttribute('aria-hidden','true');
  const bootstrapFrame=document.createElement('iframe');
  bootstrapFrame.id='arcadeMusicFrame';
  bootstrapFrame.setAttribute('aria-hidden','true');
  bootstrapFrame.setAttribute('frameborder','0');
  bootstrapFrame.setAttribute('allowfullscreen','');
  bootstrapFrame.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  bootstrapFrame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  bootstrapFrame.width='240';
  bootstrapFrame.height='240';
  bootstrapFrame.src=arcadeMusicEmbedUrl(playlistId,{startMuted:autoWarm});
  playerShell.appendChild(bootstrapFrame);
  arcadeMusicFrameHost.appendChild(playerShell);
  ARCADE_MUSIC.iframe=bootstrapFrame;
  bootstrapFrameRef=bootstrapFrame;
 }
 ARCADE_MUSIC.activePlaylistId=playlistId;
 ARCADE_MUSIC.activePlaylistSource=config.playlistSource||'';
 ARCADE_MUSIC.fallbackMode='';
 ARCADE_MUSIC.lastTrackSignature='';
 ARCADE_MUSIC.lastTrack=null;
 ARCADE_MUSIC.blockedTrackSkipCount=0;
 ARCADE_MUSIC.playlistIndex=0;
 ARCADE_MUSIC.warming=autoWarm;
 ARCADE_MUSIC.warmReady=false;
 ARCADE_MUSIC.forceMuted=autoWarm;
 ARCADE_MUSIC.state='loading';
 ARCADE_MUSIC.requested=true;
 if(persistRequest)writePref(ARCADE_MUSIC_PREF_KEY,'1');
 syncArcadeMusicUi();
 if(!opts.silent&&!autoWarm)showToast('Arcade Music on');
 if(typeof logEvent==='function')logEvent('arcade_music_on',{playlistConfigured:true,playlistId,playlistSource:config.playlistSource,gameKey:config.gameKey,arcadeMusicVolume:+arcadeMusicVolume.toFixed(3),arcadeMusicMuted:!!arcadeMusicMuted,forceMuted:!!ARCADE_MUSIC.forceMuted,gameSoundVolume:+gameSoundVolume.toFixed(3),soundEffectsMuted:!!audioMuted,source:String(opts.source||'dock'),autoWarm,persistRequest});
 scheduleArcadeMusicFallbackTimeout(bootstrapFrameRef);
 scheduleArcadeMusicStartupTimeout(bootstrapFrameRef);
 try{
  if(window.YT&&typeof window.YT.Player==='function'){
   mountArcadeMusicPlayer(mountToken,opts,config);
   return true;
  }
 }catch(err){
  clearArcadeMusicStartupTimeout();
  ARCADE_MUSIC.state='unavailable';
  syncArcadeMusicUi();
  if(typeof logEvent==='function')logEvent('arcade_music_error',{message:String(err?.message||err||'Arcade Music init failed'),syncStart:1});
  return false;
 }
 loadArcadeMusicApi().then(()=>{
  mountArcadeMusicPlayer(mountToken,opts,config);
 }).catch(err=>{
  if(ARCADE_MUSIC.mountToken!==mountToken)return;
  if(ARCADE_MUSIC.warming){
   abortArcadeMusicWarmup('api_load_failed');
   return;
  }
  if(activateArcadeMusicIframeFallback('api_load_failed',bootstrapFrameRef))return;
  clearArcadeMusicStartupTimeout();
  ARCADE_MUSIC.state='unavailable';
  syncArcadeMusicUi();
  if(typeof logEvent==='function')logEvent('arcade_music_error',{message:String(err?.message||err||'Arcade Music init failed')});
 });
 return true;
}
function stopArcadeMusic(opts={}){
 const persistRequest=opts.persistRequest!==undefined?!!opts.persistRequest:true;
 ARCADE_MUSIC.mountToken=(+ARCADE_MUSIC.mountToken||0)+1;
 destroyArcadeMusicPlayer();
 ARCADE_MUSIC.state='off';
 ARCADE_MUSIC.requested=false;
 ARCADE_MUSIC.activePlaylistId='';
 ARCADE_MUSIC.activePlaylistSource='';
 ARCADE_MUSIC.fallbackMode='';
 ARCADE_MUSIC.lastTrackSignature='';
 ARCADE_MUSIC.lastTrack=null;
 ARCADE_MUSIC.forceMuted=false;
 ARCADE_MUSIC.warming=false;
 ARCADE_MUSIC.warmReady=false;
 if(persistRequest)writePref(ARCADE_MUSIC_PREF_KEY,'0');
 syncArcadeMusicUi();
 if(!opts.silent)showToast('Arcade Music off');
 if(typeof logEvent==='function')logEvent('arcade_music_off',{silent:!!opts.silent});
}
function setArcadeMusicMuted(next,opts={}){
 if(!next)ARCADE_MUSIC.forceMuted=false;
 arcadeMusicMuted=!!next;
 writePref(ARCADE_MUSIC_MUTED_PREF_KEY,arcadeMusicMuted?'1':'0');
 applyArcadeMusicVolume();
 syncArcadeMusicUi();
 if(typeof syncAudioMixControls==='function')syncAudioMixControls();
 if(!opts.silent)showToast(arcadeMusicMuted?'Arcade Music muted':'Arcade Music on');
 if((opts.log||!opts.silent)&&typeof logEvent==='function')logEvent('arcade_music_mute_changed',Object.assign(
  typeof audioMixTelemetryBase==='function'?audioMixTelemetryBase():{},
  {
  muted:!!arcadeMusicMuted,
   arcadeMusicMuted:!!arcadeMusicMuted,
   source:String(opts.source||'dock')
  }
 ));
}
function toggleArcadeMusicMute(){
 const active=ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading';
 if(!active){
  startArcadeMusic();
  return;
 }
 if(ARCADE_MUSIC.warming)return;
 if(ARCADE_MUSIC.forceMuted){
  ARCADE_MUSIC.forceMuted=false;
  applyArcadeMusicVolume();
  syncArcadeMusicUi();
  if(typeof syncAudioMixControls==='function')syncAudioMixControls();
  showToast('Arcade Music on');
  if(typeof logEvent==='function')logEvent('arcade_music_warmup_unmuted',{
   playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),
   playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource
  });
  return;
 }
 if(ARCADE_MUSIC.fallbackMode==='iframe'){
  stopArcadeMusic();
  return;
 }
 setArcadeMusicMuted(!arcadeMusicMuted,{silent:0,source:'dock'});
}
function toggleArcadeMusic(){
 toggleArcadeMusicMute();
}
function maybeAutoWarmArcadeMusic(opts={}){
 const active=ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading';
 if(active||ARCADE_MUSIC.autoWarmAttempted)return false;
 const config=arcadeMusicResolvedConfig();
 if(!config.playlistId||!arcadeMusicFrameHost||config.playlistId==='PLarcadeMusicHarness01')return false;
 ARCADE_MUSIC.autoWarmAttempted=true;
 return startArcadeMusic({
  silent:true,
  source:String(opts.source||'boot_prewarm'),
  preserveMute:true,
  autoWarm:true,
  persistRequest:false
 });
}
function maybeResumeRequestedArcadeMusic(opts={}){
 const active=ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading';
 if(active||!ARCADE_MUSIC.requested)return false;
 if(opts.requireInteraction!==false&&!aud)return false;
 const config=arcadeMusicResolvedConfig();
 if(!config.playlistId||!arcadeMusicFrameHost)return false;
 return startArcadeMusic({
  silent:opts.silent!==undefined?!!opts.silent:true,
  source:String(opts.source||'restore'),
  preserveMute:opts.preserveMute!==undefined?!!opts.preserveMute:true
 });
}
function syncArcadeMusicForGamePackChange(){
 const config=arcadeMusicResolvedConfig();
 if(typeof syncAudioMixControls==='function')syncAudioMixControls();
 syncArcadeMusicUi();
 const active=!!(ARCADE_MUSIC.requested&&(ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading'||ARCADE_MUSIC.state==='unavailable'));
 if(!active){
  maybeResumeRequestedArcadeMusic({silent:true,source:'pack_change'});
  return;
 }
 if(!config.playlistId||ARCADE_MUSIC.activePlaylistId===config.playlistId)return;
 startArcadeMusic({silent:true,source:'pack_change',preserveMute:true});
}
function syncPauseUi(){
 if(!pauseToggleBtn)return;
 const canPause=!!started;
 const active=!!(started&&paused&&!feedbackOpen&&!helpOpen&&!settingsOpen);
 pauseToggleBtn.disabled=!canPause;
 pauseToggleBtn.dataset.paused=active?'true':'false';
 pauseToggleBtn.setAttribute('aria-pressed',active?'true':'false');
 pauseToggleBtn.setAttribute('aria-label',active?'Resume game':'Pause game');
 pauseToggleBtn.title=!canPause?'Pause available during active play':(active?'Resume game':'Pause game');
 pauseToggleBtn.dataset.actionTip=!canPause?'Pause available during active play':(active?'Resume game':'Pause game');
 const icon=pauseToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=active?'▶':'⏸';
 pauseToggleBtn.classList.toggle('active',active);
}
function toggleGameplayPause(){
 if(!started)return;
 paused=!paused;
 try{
  const A=sfx?.a;
  if(A&&typeof A.suspend==='function'&&typeof A.resume==='function'){
   if(paused&&A.state==='running')A.suspend().catch(()=>{});
   else if(!paused&&A.state==='suspended')A.resume().catch(()=>{});
  }
 }catch{}
 if(!paused&&settingsOpen)closeSettings();
 syncPauseUi();
}
function setAudioMuted(next,opts={}){
 audioMuted=!!next;
 writePref(AUDIO_MUTED_PREF_KEY,audioMuted?'1':'0');
 if(typeof syncAudioDebugState==='function')syncAudioDebugState();
 syncAudioUi();
 if(!opts.silent)showToast(audioMuted?'Sound effects muted':'Sound effects on');
 if(!opts.silent&&typeof logEvent==='function')logEvent('audio_mute_changed',Object.assign({muted:!!audioMuted,soundEffectsMuted:!!audioMuted},typeof audioMixTelemetryBase==='function'?audioMixTelemetryBase():{}));
}
function splitBuildStampDateTime(value=''){
 const raw=String(value||'').trim().replace(/\s+/g,' ');
 if(!raw)return {date:'--',time:'--'};
 const month='Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
 const dateMatch=raw.match(new RegExp(`\\b(?:${month})\\.?\\s+\\d{1,2},?\\s+\\d{4}\\b`,'i'))||raw.match(/\b\d{4}-\d{2}-\d{2}\b/);
 const timeMatch=raw.match(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?(?:\s*(?:EDT|EST|UTC|GMT))?\b/i);
 const date=dateMatch?dateMatch[0].replace(/\s+,/,','):raw.split(',')[0]||raw;
 const time=timeMatch?timeMatch[0].replace(/\s+/g,' '):'';
 return {date,time};
}
function buildStampDateTimeText(){
 const parts=splitBuildStampDateTime(BUILD_INFO.released||'');
 return parts.time?`${parts.date} · ${parts.time}`:parts.date;
}
function shellBuildVersionLine(){
 return typeof buildVersionLine==='function'?buildVersionLine():String(BUILD_INFO.versionLine||BUILD_INFO.version||'--');
}
function shellEscapeHtml(value){
 return String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
 }[ch]));
}
function currentPlatformMessageRows(){
 const channel=String(BUILD_INFO.releaseChannel||'development').toUpperCase();
 const platform=typeof buildPlatformInfo==='function'?buildPlatformInfo():{name:PLATFORM_NAME,version:BUILD_INFO.version||'--'};
 const rows=[];
 if(BUILD_UPDATE.available){
  rows.push({
   kicker:'UPDATE',
   main:BUILD_UPDATE.mode==='seen'?'This build updated since your last visit.':'A newer build is available.',
   meta:'Use Refresh Now on the bottom message strip.'
  });
 }
 rows.push({
  kicker:'BUILD',
  main:`${channel} · ${shellBuildVersionLine()}`,
  meta:buildStampDateTimeText()
 });
 rows.push({
  kicker:'PLATFORM',
  main:`${platform.name||PLATFORM_NAME} ${platform.version||BUILD_INFO.version||'--'}`,
  meta:[humanizeReleaseTrack(platform.releaseTrack||''),platform.compatibility||''].filter(Boolean).join(' · ')||'Platform-owned shell, controls, score services, replay, and message delivery.'
 });
 if(typeof currentGamePack==='function'){
  const pack=currentGamePack();
  const title=pack?.metadata?.title||pack?.metadata?.gameKey||'Active game';
  const version=typeof gamePackVersionLine==='function'?gamePackVersionLine(pack):String(pack?.metadata?.versionLine||pack?.metadata?.version||'--');
  const state=[typeof gamePackReleaseTrackLine==='function'?gamePackReleaseTrackLine(pack):humanizeReleaseTrack(pack?.metadata?.releaseTrack||''),typeof gamePackRuntimeStatusLine==='function'?gamePackRuntimeStatusLine(pack):humanizeReleaseTrack(pack?.metadata?.runtimeStatus||'')].filter(Boolean).join(' · ')||(pack?.metadata?.previewOnly?'Preview pack':'Playable pack');
  rows.push({
   kicker:'GAME',
   main:`${title} ${version}`,
   meta:state
  });
 }
 rows.push({
  kicker:'MESSAGES',
  main:'Platform message channel ready.',
  meta:'Future game notices and quality prompts will appear here.'
 });
 return rows;
}
function renderPlatformMessagePanel(){
 if(!platformMessagePanel)return;
 const rows=currentPlatformMessageRows();
 if(platformMessagePanelStatus)platformMessagePanelStatus.textContent=`${rows.length} current platform notice${rows.length===1?'':'s'}.`;
 if(platformMessagePanelList){
  platformMessagePanelList.innerHTML=rows.map(row=>`
   <div class="platformMessageRow">
    <span class="platformMessageKicker">${shellEscapeHtml(row.kicker)}</span>
    <span class="platformMessageMain">${shellEscapeHtml(row.main)}</span>
    <span class="platformMessageMeta">${shellEscapeHtml(row.meta)}</span>
   </div>
  `).join('');
 }
}
function syncPlatformMessagePanelVisibility(){
 if(!platformMessagePanel)return;
 const show=!!platformMessagePanelOpen;
 platformMessagePanel.hidden=!show;
 platformMessagePanel.classList.toggle('visible',show);
}
function openPlatformMessagePanel(){
 if(!platformMessagePanel)return;
 closeDockOverlays('platformMessages');
 platformMessagePanelOpen=1;
 renderPlatformMessagePanel();
 syncPlatformMessagePanelVisibility();
 if(typeof syncOverlayPause==='function')syncOverlayPause();
 if(typeof syncPauseUi==='function')syncPauseUi();
}
function closePlatformMessagePanel(){
 platformMessagePanelOpen=0;
 syncPlatformMessagePanelVisibility();
 if(typeof syncOverlayPause==='function')syncOverlayPause();
 if(typeof syncPauseUi==='function')syncPauseUi();
}
function togglePlatformMessagePanel(){
 if(platformMessagePanelOpen)closePlatformMessagePanel();
 else openPlatformMessagePanel();
}
function syncBuildStampUi(){
 if(!buildStamp)return;
 const override=window.__platinumBuildStampOverride??window.__auroraBuildStampOverride;
 if(override){
  buildStamp.classList.remove('production');
  buildStamp.classList.remove('updateAvailable');
  buildStamp.classList.add('replay');
  if(buildStampChannel)buildStampChannel.textContent=override.channel||'';
  if(buildStampVersion)buildStampVersion.textContent=override.version||'';
  if(buildStampRelease)buildStampRelease.textContent=override.release||'';
  if(buildStampRefreshBtn)buildStampRefreshBtn.hidden=1;
  return;
 }
 buildStamp.classList.remove('replay');
 const channel=String(BUILD_INFO.releaseChannel||'').toLowerCase();
 const production=channel==='production';
 buildStamp.classList.toggle('updateAvailable',!!BUILD_UPDATE.available);
 buildStamp.classList.toggle('production',production);
 if(buildStampChannel)buildStampChannel.textContent=String(BUILD_INFO.releaseChannel||'development').toUpperCase();
 if(buildStampVersion)buildStampVersion.textContent=shellBuildVersionLine();
 if(buildStampRelease)buildStampRelease.textContent=buildStampDateTimeText();
 if(buildStampRefreshBtn)buildStampRefreshBtn.hidden=!BUILD_UPDATE.available;
 if(platformMessagePanelOpen)renderPlatformMessagePanel();
}
function markHostedBuildSeen(){
 writePref(BUILD_SEEN_KEY,BUILD_INFO.label);
}
function applySeenBuildReminder(){
  const channel=String(BUILD_INFO.releaseChannel||'').toLowerCase();
  const seenLabel=String(readPref(BUILD_SEEN_KEY)||'').trim();
  const testHint=BUILD_REFRESH_HINT&&channel==='production beta';
 if(testHint){
  BUILD_UPDATE.available=1;
  BUILD_UPDATE.label=BUILD_INFO.label;
  BUILD_UPDATE.mode='seen';
  BUILD_UPDATE.notified=1;
  syncBuildStampUi();
  showToast('Refresh reminder test active. Use Refresh Now below or refresh the tab.');
  return;
 }
 if(seenLabel&&seenLabel!==BUILD_INFO.label){
  BUILD_UPDATE.available=1;
  BUILD_UPDATE.label=BUILD_INFO.label;
  BUILD_UPDATE.mode='seen';
  BUILD_UPDATE.notified=1;
  syncBuildStampUi();
  showToast('This build updated since your last visit. Use Refresh Now below or refresh the tab.');
 }
}
async function checkForHostedBuildUpdate(){
 if(BUILD_UPDATE.checking||location.protocol==='file:')return;
 const channel=String(BUILD_INFO.releaseChannel||'').toLowerCase();
 if(BUILD_REFRESH_HINT&&channel==='production beta')return;
 BUILD_UPDATE.checking=1;
 try{
  const response=await fetch(`${BUILD_INFO_URL}?t=${Date.now()}`,{cache:'no-store'});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const live=await response.json();
  const nextLabel=String(live?.label||'').trim();
  const available=!!nextLabel&&nextLabel!==BUILD_INFO.label;
  BUILD_UPDATE.available=available?1:0;
  BUILD_UPDATE.label=available?nextLabel:'';
  BUILD_UPDATE.mode=available?'remote':'';
  syncBuildStampUi();
  if(available&&!BUILD_UPDATE.notified){
   BUILD_UPDATE.notified=1;
   showToast('New build available. Use Refresh Now below or refresh the tab.');
  }
 }catch(err){
  logEvent('build_update_check_failed',{message:String(err?.message||err||'build update check failed')});
 }finally{
  BUILD_UPDATE.checking=0;
 }
}
function startHostedBuildUpdateChecks(){
 const channel=String(BUILD_INFO.releaseChannel||'').toLowerCase();
 clearInterval(BUILD_UPDATE.timer);
 applySeenBuildReminder();
 markHostedBuildSeen();
 if(BUILD_REFRESH_HINT&&channel==='production beta'){
  clearBuildRefreshHintUrl();
  return;
 }
 checkForHostedBuildUpdate();
 BUILD_UPDATE.timer=setInterval(checkForHostedBuildUpdate,BUILD_REFRESH_CHECK_MS);
 addEventListener('focus',()=>{checkForHostedBuildUpdate();});
}

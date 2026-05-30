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
 const harnessPlaylistId=sanitizeArcadeMusicPlaylistId(ARCADE_MUSIC.playlistOverride);
 const base=Object.freeze({
  playlistId:gamePlaylistId||platformPlaylistId,
  playlistSource:gamePlaylistId?'game':'platform',
  playlistLabel:String(media.arcadeMusicPlaylistLabel||(gamePlaylistId?`${gameTitle} arcade music`:BUILD_INFO?.platform?.media?.arcadeMusicPlaylistLabel||'Default Platinum Arcade Music')).trim(),
  gameKey,
  gameTitle,
  platformPlaylistId,
  gamePlaylistId,
  configured:!!(gamePlaylistId||platformPlaylistId),
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
function arcadeMusicState(){
 const config=arcadeMusicResolvedConfig();
 return {
  state:ARCADE_MUSIC.state,
  requested:!!ARCADE_MUSIC.requested,
  configured:!!config.configured,
  hasFrame:!!(arcadeMusicFrameHost&&arcadeMusicFrameHost.querySelector('iframe')),
  playlistId:config.playlistId,
  playlistSource:config.playlistSource,
  playlistLabel:config.playlistLabel,
  platformPlaylistId:config.platformPlaylistId,
  gamePlaylistId:config.gamePlaylistId,
  gameKey:config.gameKey,
  gameTitle:config.gameTitle,
  activePlaylistId:ARCADE_MUSIC.activePlaylistId||'',
  activePlaylistSource:ARCADE_MUSIC.activePlaylistSource||'',
  arcadeMusicVolume:+arcadeMusicVolume.toFixed(3),
  arcadeMusicMuted:!!arcadeMusicMuted,
  audible:!!((ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading')&&!arcadeMusicMuted&&arcadeMusicVolume>0),
  gameSoundVolume:+gameSoundVolume.toFixed(3),
  lastTrack:ARCADE_MUSIC.lastTrack||null
 };
}
function syncArcadeMusicUi(){
 if(!arcadeMusicToggleBtn)return;
 const active=ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading';
 const config=arcadeMusicResolvedConfig();
 const unavailable=ARCADE_MUSIC.state==='unavailable'||!config.playlistId;
 const muted=active&&!!arcadeMusicMuted;
 arcadeMusicToggleBtn.dataset.musicState=active?(muted?'muted':ARCADE_MUSIC.state):(unavailable?'unavailable':'off');
 arcadeMusicToggleBtn.dataset.musicPlaying=active?'true':'false';
 arcadeMusicToggleBtn.dataset.musicMuted=muted?'true':'false';
 arcadeMusicToggleBtn.dataset.configured=config.playlistId?'true':'false';
 arcadeMusicToggleBtn.dataset.playlistSource=config.playlistSource||'';
 arcadeMusicToggleBtn.setAttribute('aria-pressed',muted?'true':'false');
 const label=unavailable?'Arcade Music unavailable':(!active?'Start Arcade Music':(muted?'Unmute Arcade Music':'Mute Arcade Music'));
 arcadeMusicToggleBtn.setAttribute('aria-label',label);
 arcadeMusicToggleBtn.title=label;
 arcadeMusicToggleBtn.dataset.actionTip=label;
 arcadeMusicToggleBtn.classList.toggle('active',active&&!muted);
 arcadeMusicToggleBtn.classList.toggle('muted',muted);
 const icon=arcadeMusicToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=active&&!muted?'🎶':'🎵';
}
function arcadeMusicEmbedUrl(playlistId){
 const origin=(location&&location.origin&&location.origin!=='null')?`&origin=${encodeURIComponent(location.origin)}`:'';
 return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&listType=playlist&autoplay=1&playsinline=1&enablejsapi=1&rel=0${origin}`;
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
function destroyArcadeMusicPlayer(){
 const player=ARCADE_MUSIC.player;
 if(player&&typeof player.destroy==='function'){
  try{player.destroy()}catch{}
 }
 const fallbackAudio=ARCADE_MUSIC.fallbackAudio;
 if(fallbackAudio){
  try{
   fallbackAudio.pause();
   fallbackAudio.currentTime=0;
   fallbackAudio.src='';
  }catch{}
 }
 ARCADE_MUSIC.player=null;
 ARCADE_MUSIC.playerReady=0;
 ARCADE_MUSIC.fallbackAudio=null;
 if(arcadeMusicFrameHost)arcadeMusicFrameHost.innerHTML='';
 ARCADE_MUSIC.iframe=null;
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
function arcadeMusicPostMessage(payload={}){
 const frame=ARCADE_MUSIC.iframe||(arcadeMusicFrameHost&&arcadeMusicFrameHost.querySelector('iframe'));
 if(!frame||!frame.contentWindow)return false;
 try{
  frame.contentWindow.postMessage(JSON.stringify(Object.assign({id:'arcadeMusicFrame'},payload)),'*');
  return true;
 }catch{
  return false;
 }
}
function arcadeMusicCommand(func='',args=[]){
 if(!func)return false;
 const player=ARCADE_MUSIC.player;
 if(player&&typeof player[func]==='function'){
  try{
   player[func](...(Array.isArray(args)?args:[]));
   return true;
  }catch{}
 }
 return arcadeMusicPostMessage({event:'command',func,args:Array.isArray(args)?args:[]});
}
function applyArcadeMusicVolume(){
 const pct=volumePercent(arcadeMusicVolume);
 const fallbackAudio=ARCADE_MUSIC.fallbackAudio;
 if(fallbackAudio){
  fallbackAudio.volume=clampVolumeValue(arcadeMusicVolume,DEFAULT_ARCADE_MUSIC_VOLUME);
  fallbackAudio.muted=!!arcadeMusicMuted||pct<=0;
  if(!fallbackAudio.muted&&fallbackAudio.paused&&ARCADE_MUSIC.requested)fallbackAudio.play().catch(()=>{});
 }
 arcadeMusicCommand('setVolume',[pct]);
 arcadeMusicCommand(pct>0&&!arcadeMusicMuted?'unMute':'mute',[]);
 return pct;
}
function resetArcadeMusicBlockedTrackState(){
 ARCADE_MUSIC.blockedTrackSkipCount=0;
}
function advanceArcadeMusicPlaylistAfterBlockedTrack(code=0){
 const player=ARCADE_MUSIC.player;
 const playlistId=ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId();
 if(!player||!playlistId)return false;
 const skipCount=(+ARCADE_MUSIC.blockedTrackSkipCount||0)+1;
 ARCADE_MUSIC.blockedTrackSkipCount=skipCount;
 if(skipCount>8)return false;
 ARCADE_MUSIC.state='loading';
 syncArcadeMusicUi();
 if(typeof logEvent==='function')logEvent('arcade_music_skip_blocked_video',{code,attempt:skipCount});
 try{
  if(typeof player.loadPlaylist==='function'){
   player.loadPlaylist({listType:'playlist',list:playlistId,index:skipCount});
  }else if(typeof player.nextVideo==='function'){
   player.nextVideo();
  }else{
   return false;
  }
  [180,650,1400].forEach(delay=>setTimeout(()=>{
   if(!ARCADE_MUSIC.requested||ARCADE_MUSIC.player!==player)return;
   primeArcadeMusicPlayerApi();
  },delay));
  return true;
 }catch{
  return false;
 }
}
function primeArcadeMusicPlayerApi(){
 arcadeMusicPostMessage({event:'listening'});
 arcadeMusicCommand('addEventListener',['onStateChange']);
 arcadeMusicCommand('addEventListener',['onReady']);
 arcadeMusicCommand('playVideo',[]);
 applyArcadeMusicVolume();
 syncArcadeMusicTrackFromPlayer();
 arcadeMusicCommand('getVideoData',[]);
}
function onArcadeMusicFrameLoaded(){
 ARCADE_MUSIC.state='loading';
 syncArcadeMusicUi();
 [80,350,1100,2600].forEach(delay=>setTimeout(primeArcadeMusicPlayerApi,delay));
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
function parseArcadeMusicMessage(data){
 if(!data)return null;
 if(typeof data==='object')return data;
 if(typeof data!=='string')return null;
 try{return JSON.parse(data)}catch{return null}
}
function handleArcadeMusicPlayerMessage(event){
 const origin=String(event?.origin||'').toLowerCase();
 let host='';
 try{host=origin?new URL(origin).hostname:''}catch{}
 if(origin&&!/(^|\.)youtube(?:-nocookie)?\.com$/.test(host))return;
 const data=parseArcadeMusicMessage(event?.data);
 if(!data||typeof data!=='object')return;
 if(data.id&&data.id!=='arcadeMusicFrame')return;
 if(data.event==='onReady')primeArcadeMusicPlayerApi();
 const info=data.info&&typeof data.info==='object'?data.info:null;
 const videoData=info?.videoData||data.videoData||null;
 if(videoData)acceptArcadeMusicTrack(videoData,'youtube_info_delivery');
 if(info&&Number.isFinite(+info.playerState)&&+info.playerState===1){
  if(ARCADE_MUSIC.state!=='playing'){
   ARCADE_MUSIC.state='playing';
   syncArcadeMusicUi();
  }
  arcadeMusicCommand('getVideoData',[]);
 }
}
if(typeof window!=='undefined'&&!window.__platinumArcadeMusicMessageListener){
 window.__platinumArcadeMusicMessageListener=1;
 window.addEventListener('message',handleArcadeMusicPlayerMessage);
}
function handleArcadeMusicPlayerReady(event){
 ARCADE_MUSIC.player=event?.target||ARCADE_MUSIC.player||null;
 ARCADE_MUSIC.playerReady=1;
 ARCADE_MUSIC.embedErrorCount=0;
 resetArcadeMusicBlockedTrackState();
 ARCADE_MUSIC.state='loading';
 syncArcadeMusicUi();
 primeArcadeMusicPlayerApi();
 [250,900].forEach(delay=>setTimeout(()=>{
  if(!ARCADE_MUSIC.requested||ARCADE_MUSIC.player!==event?.target)return;
  primeArcadeMusicPlayerApi();
 },delay));
}
function handleArcadeMusicPlayerStateChange(event){
 const player=event?.target||ARCADE_MUSIC.player||null;
 const stateCode=Number(event?.data);
 if(player)ARCADE_MUSIC.player=player;
 syncArcadeMusicTrackFromPlayer('youtube_player_state');
 if(stateCode===1){
  resetArcadeMusicBlockedTrackState();
  if(ARCADE_MUSIC.state!=='playing'){
   ARCADE_MUSIC.state='playing';
   syncArcadeMusicUi();
  }
  return;
 }
 if(stateCode===-1||stateCode===3||stateCode===5){
  if(ARCADE_MUSIC.state!=='playing'){
   ARCADE_MUSIC.state='loading';
   syncArcadeMusicUi();
  }
  return;
 }
 if(stateCode===0&&ARCADE_MUSIC.requested){
  primeArcadeMusicPlayerApi();
 }
}
function handleArcadeMusicPlayerError(event){
 const code=Number(event?.data)||0;
 const recoverable=code===150||code===101;
 if(recoverable&&advanceArcadeMusicPlaylistAfterBlockedTrack(code))return;
 ARCADE_MUSIC.state='unavailable';
 syncArcadeMusicUi();
 if(typeof logEvent==='function')logEvent('arcade_music_error',{code,playlistId:ARCADE_MUSIC.activePlaylistId||arcadeMusicPlaylistId(),playlistSource:ARCADE_MUSIC.activePlaylistSource||arcadeMusicResolvedConfig().playlistSource,blockedTrackAttempts:+ARCADE_MUSIC.blockedTrackSkipCount||0});
}
function startArcadeMusic(opts={}){
 const config=arcadeMusicResolvedConfig();
 const playlistId=config.playlistId;
 const preserveMute=!!opts.preserveMute;
 if(!playlistId){
  ARCADE_MUSIC.state='unavailable';
  ARCADE_MUSIC.requested=false;
  writePref(ARCADE_MUSIC_PREF_KEY,'0');
  syncArcadeMusicUi();
  showToast('Arcade Music playlist not configured');
  if(typeof logEvent==='function')logEvent('arcade_music_unavailable');
  return false;
 }
 if(!arcadeMusicFrameHost)return false;
 if(!preserveMute){
  arcadeMusicMuted=false;
  writePref(ARCADE_MUSIC_MUTED_PREF_KEY,'0');
 }
 const mountToken=(+ARCADE_MUSIC.mountToken||0)+1;
 ARCADE_MUSIC.mountToken=mountToken;
 destroyArcadeMusicPlayer();
 const playerHost=document.createElement('div');
 playerHost.id='arcadeMusicFrame';
 playerHost.setAttribute('aria-hidden','true');
 arcadeMusicFrameHost.appendChild(playerHost);
 ARCADE_MUSIC.activePlaylistId=playlistId;
 ARCADE_MUSIC.activePlaylistSource=config.playlistSource||'';
 ARCADE_MUSIC.lastTrackSignature='';
 ARCADE_MUSIC.lastTrack=null;
 ARCADE_MUSIC.embedErrorCount=0;
 resetArcadeMusicBlockedTrackState();
 ARCADE_MUSIC.state='loading';
 ARCADE_MUSIC.requested=true;
 writePref(ARCADE_MUSIC_PREF_KEY,'1');
 syncArcadeMusicUi();
 if(!opts.silent)showToast('Arcade Music on');
 if(typeof logEvent==='function')logEvent('arcade_music_on',{playlistConfigured:true,playlistId,playlistSource:config.playlistSource,gameKey:config.gameKey,arcadeMusicVolume:+arcadeMusicVolume.toFixed(3),arcadeMusicMuted:!!arcadeMusicMuted,gameSoundVolume:+gameSoundVolume.toFixed(3),soundEffectsMuted:!!audioMuted,source:String(opts.source||'dock')});
 loadArcadeMusicApi().then(()=>{
  if(ARCADE_MUSIC.mountToken!==mountToken||!ARCADE_MUSIC.requested)return;
  if(!window.YT||typeof window.YT.Player!=='function')throw new Error('YouTube iframe API unavailable');
  const origin=(location&&location.origin&&location.origin!=='null')?location.origin:undefined;
  ARCADE_MUSIC.player=new window.YT.Player('arcadeMusicFrame',{
   host:'https://www.youtube.com',
   width:'240',
   height:'240',
   playerVars:{
    listType:'playlist',
    list:playlistId,
    autoplay:1,
    playsinline:1,
    rel:0,
    controls:0,
    modestbranding:1,
    iv_load_policy:3,
    origin
   },
   events:{
    onReady:handleArcadeMusicPlayerReady,
    onStateChange:handleArcadeMusicPlayerStateChange,
    onError:handleArcadeMusicPlayerError
   }
 });
 }).catch(err=>{
  if(ARCADE_MUSIC.mountToken!==mountToken)return;
  ARCADE_MUSIC.state='unavailable';
  syncArcadeMusicUi();
  if(typeof logEvent==='function')logEvent('arcade_music_error',{message:String(err?.message||err||'Arcade Music init failed')});
 });
 return true;
}
function stopArcadeMusic(opts={}){
 ARCADE_MUSIC.mountToken=(+ARCADE_MUSIC.mountToken||0)+1;
 destroyArcadeMusicPlayer();
 ARCADE_MUSIC.state='off';
 ARCADE_MUSIC.requested=false;
 ARCADE_MUSIC.activePlaylistId='';
 ARCADE_MUSIC.activePlaylistSource='';
 ARCADE_MUSIC.lastTrackSignature='';
 ARCADE_MUSIC.lastTrack=null;
 writePref(ARCADE_MUSIC_PREF_KEY,'0');
 syncArcadeMusicUi();
 if(!opts.silent)showToast('Arcade Music off');
 if(typeof logEvent==='function')logEvent('arcade_music_off',{silent:!!opts.silent});
}
function setArcadeMusicMuted(next,opts={}){
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
 setArcadeMusicMuted(!arcadeMusicMuted,{silent:0,source:'dock'});
}
function toggleArcadeMusic(){
 toggleArcadeMusicMute();
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
 const frame=ARCADE_MUSIC.iframe||(arcadeMusicFrameHost&&arcadeMusicFrameHost.querySelector('iframe'));
 const active=!!(frame&&(ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading'));
 const fallbackActive=!!(ARCADE_MUSIC.fallbackAudio&&(ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading'));
 if(fallbackActive){
  startArcadeMusic({silent:true,source:'pack_change',preserveMute:true});
  return;
 }
 if(!active){
  maybeResumeRequestedArcadeMusic({silent:true,source:'pack_change'});
  return;
 }
 if(!config.playlistId||ARCADE_MUSIC.activePlaylistId===config.playlistId)return;
 ARCADE_MUSIC.activePlaylistId=config.playlistId;
 ARCADE_MUSIC.activePlaylistSource=config.playlistSource||'';
 ARCADE_MUSIC.lastTrackSignature='';
 ARCADE_MUSIC.lastTrack=null;
 ARCADE_MUSIC.state='loading';
 if(ARCADE_MUSIC.player&&typeof ARCADE_MUSIC.player.loadPlaylist==='function'){
  try{
   ARCADE_MUSIC.player.loadPlaylist({listType:'playlist',list:config.playlistId,index:0});
   primeArcadeMusicPlayerApi();
  }catch{
   startArcadeMusic({silent:true,source:'pack_change',preserveMute:true});
  }
 }else{
  startArcadeMusic({silent:true,source:'pack_change',preserveMute:true});
 }
 syncArcadeMusicUi();
 if(typeof logEvent==='function')logEvent('arcade_music_playlist_changed',{
  playlistId:config.playlistId,
  playlistSource:config.playlistSource,
  gameKey:config.gameKey,
  gameTitle:config.gameTitle,
  arcadeMusicMuted:!!arcadeMusicMuted,
  arcadeMusicVolume:+arcadeMusicVolume.toFixed(3)
 });
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

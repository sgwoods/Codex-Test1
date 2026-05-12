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
 muteToggleBtn.setAttribute('aria-label',audioMuted?'Unmute game audio':'Mute game audio');
 muteToggleBtn.title=audioMuted?'Unmute game audio':'Mute game audio';
 muteToggleBtn.dataset.actionTip=audioMuted?'Unmute game audio':'Mute game audio';
 const icon=muteToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=audioMuted?'🔇':'🔊';
 if(sfx.bus)sfx.bus.gain.value=audioMuted?0:.9;
}
function sanitizeArcadeMusicPlaylistId(value=''){
 const raw=String(value||'').trim();
 return /^[A-Za-z0-9_-]{8,160}$/.test(raw)?raw:'';
}
function arcadeMusicQueryPlaylistId(){
 try{
  const params=new URLSearchParams(location.search||'');
  return sanitizeArcadeMusicPlaylistId(params.get('arcadeMusicPlaylist')||params.get('musicPlaylist')||'');
 }catch{
  return '';
 }
}
function arcadeMusicPlaylistId(){
 return sanitizeArcadeMusicPlaylistId(ARCADE_MUSIC.playlistOverride)||arcadeMusicQueryPlaylistId()||sanitizeArcadeMusicPlaylistId(ARCADE_MUSIC_PLAYLIST_ID);
}
function arcadeMusicState(){
 return {
  state:ARCADE_MUSIC.state,
  requested:!!ARCADE_MUSIC.requested,
  configured:!!arcadeMusicPlaylistId(),
  hasFrame:!!(arcadeMusicFrameHost&&arcadeMusicFrameHost.querySelector('iframe')),
  playlistId:arcadeMusicPlaylistId()
 };
}
function syncArcadeMusicUi(){
 if(!arcadeMusicToggleBtn)return;
 const active=ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading';
 const unavailable=ARCADE_MUSIC.state==='unavailable'||!arcadeMusicPlaylistId();
 arcadeMusicToggleBtn.dataset.musicState=active?ARCADE_MUSIC.state:(unavailable?'unavailable':'off');
 arcadeMusicToggleBtn.dataset.configured=arcadeMusicPlaylistId()?'true':'false';
 arcadeMusicToggleBtn.setAttribute('aria-pressed',active?'true':'false');
 arcadeMusicToggleBtn.setAttribute('aria-label',active?'Turn off Arcade Music':'Arcade Music');
 arcadeMusicToggleBtn.title='Arcade Music';
 arcadeMusicToggleBtn.dataset.actionTip='Arcade Music';
 arcadeMusicToggleBtn.classList.toggle('active',active);
 const icon=arcadeMusicToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=active?'♫':'♪';
}
function arcadeMusicEmbedUrl(playlistId){
 const origin=(location&&location.origin&&location.origin!=='null')?`&origin=${encodeURIComponent(location.origin)}`:'';
 return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&listType=playlist&autoplay=1&playsinline=1&enablejsapi=1&rel=0${origin}`;
}
function startArcadeMusic(){
 const playlistId=arcadeMusicPlaylistId();
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
 arcadeMusicFrameHost.innerHTML='';
 const frame=document.createElement('iframe');
 frame.id='arcadeMusicFrame';
 frame.title='Arcade Music playlist';
 frame.tabIndex=-1;
 frame.allow='autoplay; encrypted-media; picture-in-picture';
 frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.src=arcadeMusicEmbedUrl(playlistId);
 arcadeMusicFrameHost.appendChild(frame);
 ARCADE_MUSIC.iframe=frame;
 ARCADE_MUSIC.state='playing';
 ARCADE_MUSIC.requested=true;
 writePref(ARCADE_MUSIC_PREF_KEY,'1');
 syncArcadeMusicUi();
 showToast('Arcade Music on');
 if(typeof logEvent==='function')logEvent('arcade_music_on',{playlistConfigured:true});
 return true;
}
function stopArcadeMusic(opts={}){
 if(arcadeMusicFrameHost)arcadeMusicFrameHost.innerHTML='';
 ARCADE_MUSIC.iframe=null;
 ARCADE_MUSIC.state='off';
 ARCADE_MUSIC.requested=false;
 writePref(ARCADE_MUSIC_PREF_KEY,'0');
 syncArcadeMusicUi();
 if(!opts.silent)showToast('Arcade Music off');
 if(typeof logEvent==='function')logEvent('arcade_music_off',{silent:!!opts.silent});
}
function toggleArcadeMusic(){
 if(ARCADE_MUSIC.state==='playing'||ARCADE_MUSIC.state==='loading')stopArcadeMusic();
 else startArcadeMusic();
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
 syncAudioUi();
 if(!opts.silent)showToast(audioMuted?'Game audio muted':'Game audio on');
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

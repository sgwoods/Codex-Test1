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
 if(S?.p&&Number.isFinite(+S.p.vx))S.p.vx=0;
 if(reason)logEvent('input_state_reset',{reason,hadKeys:!!hadKeys,hadState:!!hadState,hadMotion});
}
function syncAudioUi(){
 if(!muteToggleBtn)return;
 muteToggleBtn.dataset.muted=audioMuted?'true':'false';
 muteToggleBtn.setAttribute('aria-pressed',audioMuted?'true':'false');
 muteToggleBtn.setAttribute('aria-label',audioMuted?'Unmute game audio':'Mute game audio');
 muteToggleBtn.title=audioMuted?'Game audio muted':'Game audio on';
 const icon=muteToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=audioMuted?'🔇':'🔊';
 if(sfx.bus)sfx.bus.gain.value=audioMuted?0:.9;
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
 const icon=pauseToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=active?'▶':'⏸';
 pauseToggleBtn.classList.toggle('active',active);
}
function toggleGameplayPause(){
 if(!started)return;
 paused=!paused;
 if(!paused&&settingsOpen)closeSettings();
 syncPauseUi();
}
function setAudioMuted(next,opts={}){
 audioMuted=!!next;
 writePref(AUDIO_MUTED_PREF_KEY,audioMuted?'1':'0');
 syncAudioUi();
 if(!opts.silent)showToast(audioMuted?'Game audio muted':'Game audio on');
}
function syncBuildStampUi(){
 if(!buildStamp)return;
 const override=window.__auroraBuildStampOverride;
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
 if(buildStampChannel)buildStampChannel.textContent=`Lane ${BUILD_INFO.releaseChannel}`;
 if(buildStampVersion)buildStampVersion.textContent=production?`Version ${BUILD_INFO.version}`:`Version ${BUILD_INFO.label}`;
 if(buildStampRelease){
  buildStampRelease.textContent=BUILD_UPDATE.available
   ? (BUILD_UPDATE.mode==='seen'
     ? 'This build updated since your last visit. Refresh once if anything looks stale.'
     : 'New build available. Refresh this tab to get the latest fix.')
   : (production?'':BUILD_INFO.released);
 }
 if(buildStampRefreshBtn)buildStampRefreshBtn.hidden=!BUILD_UPDATE.available;
}
function markHostedBuildSeen(){
 writePref(BUILD_SEEN_KEY,BUILD_INFO.label);
}
function applySeenBuildReminder(){
 const channel=String(BUILD_INFO.releaseChannel||'').toLowerCase();
 if(!['production','production beta'].includes(channel))return;
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
 if(!['production','production beta'].includes(channel))return;
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
 if(!['production','production beta'].includes(channel))return;
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

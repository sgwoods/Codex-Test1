// Native local replay panel and browser-backed replay catalog.
const movieDockBtn=document.getElementById('movieDockBtn');
const movieModal=document.getElementById('movieModal');
const moviePanel=document.getElementById('moviePanel');
const moviePanelClose=document.getElementById('moviePanelClose');
const movieCloseToWaitBtn=document.getElementById('movieCloseToWaitBtn');
const moviePanelStatus=document.getElementById('moviePanelStatus');
const movieRunSelect=document.getElementById('movieRunSelect');
const movieStartBtn=document.getElementById('movieStartBtn');
const movieEmptyState=document.getElementById('movieEmptyState');
const movieVideo=document.getElementById('movieVideo');
const moviePlaybackMeta=document.getElementById('moviePlaybackMeta');
const movieBackBtn=document.getElementById('movieBackBtn');
const moviePlayPauseBtn=document.getElementById('moviePlayPauseBtn');
const movieForwardBtn=document.getElementById('movieForwardBtn');
const movieDeleteBtn=document.getElementById('movieDeleteBtn');
const movieTimeline=document.getElementById('movieTimeline');

const MOVIE={panelOpen:0,prevPaused:0,runs:[],selectedId:'',pendingId:'',current:null,loading:0,objectUrl:'',status:''};
window.__platinumReplayCatalog=window.__platinumReplayCatalog||window.__auroraReplayCatalog||[];
window.__auroraReplayCatalog=window.__platinumReplayCatalog;

function movieStoreAvailable(){
 return !!(window.AuroraReplayStore&&typeof window.AuroraReplayStore.supported==='function'&&window.AuroraReplayStore.supported());
}
function movieDurationLabel(seconds=0){
 const total=Math.max(0,Math.round(+seconds||0));
 const mins=Math.floor(total/60);
 const secs=String(total%60).padStart(2,'0');
 return `${mins}:${secs}`;
}
function movieAgeLabel(value=''){
 if(!value)return 'just now';
 const stamp=new Date(value).getTime();
 if(!Number.isFinite(stamp))return 'recent';
 const diff=Math.max(0,Date.now()-stamp);
 const mins=Math.round(diff/60000);
 if(mins<1)return 'just now';
 if(mins<60)return `${mins}m ago`;
 const hours=Math.round(mins/60);
 if(hours<24)return `${hours}h ago`;
 const days=Math.round(hours/24);
 return `${days}d ago`;
}
function revokeMovieObjectUrl(){
 if(MOVIE.objectUrl){
  try{URL.revokeObjectURL(MOVIE.objectUrl)}catch{}
  MOVIE.objectUrl='';
 }
}
async function tryMovieAutoplay(){
 if(!movieVideo)return 0;
 try{
  const maybe=movieVideo.play();
  if(maybe&&typeof maybe.then==='function')await maybe;
  return true;
 }catch{
  return false;
 }
}
function updateMovieControls(){
 const ready=!!MOVIE.current;
 moviePanel.classList.toggle('ready',ready);
 movieBackBtn.disabled=!ready;
 moviePlayPauseBtn.disabled=!ready;
 movieForwardBtn.disabled=!ready;
 movieDeleteBtn.disabled=!ready;
 movieTimeline.disabled=!ready;
 movieRunSelect.disabled=!MOVIE.runs.length;
 if(movieStartBtn)movieStartBtn.disabled=!MOVIE.runs.length||!MOVIE.pendingId;
 moviePlayPauseBtn.textContent=ready&&!movieVideo.paused?'Pause':'Play';
 syncMovieBuildStamp();
}
function syncMovieBuildStamp(){
 window.__platinumBuildStampOverride=MOVIE.panelOpen&&MOVIE.current?{
  channel:`Replay Stage ${String(MOVIE.current.stage||0).padStart(2,'0')}`,
  version:`Score ${formatScore(MOVIE.current.score||0)}   Length ${movieDurationLabel(MOVIE.current.duration||0)}`,
  release:`${movieDurationLabel(movieVideo.currentTime||0)} / ${movieDurationLabel(Number.isFinite(movieVideo.duration)?movieVideo.duration:(MOVIE.current.duration||0))}   •   ${movieAgeLabel(MOVIE.current.createdAt)}`
 }:null;
 window.__auroraBuildStampOverride=window.__platinumBuildStampOverride;
 if(typeof syncBuildStampUi==='function')syncBuildStampUi();
}
function updateMovieTimeline(){
 const duration=Number.isFinite(movieVideo.duration)?movieVideo.duration:(MOVIE.current?.duration||0);
 movieTimeline.max=duration||0;
 movieTimeline.value=movieVideo.currentTime||0;
  const meta=MOVIE.current
  ? `STG ${String(MOVIE.current.stage||0).padStart(2,'0')}   ${movieDurationLabel(movieVideo.currentTime||0)} / ${movieDurationLabel(duration)}`
  : '';
 moviePlaybackMeta.textContent=meta;
 syncMovieBuildStamp();
 updateMovieControls();
}
function renderMovieRuns(){
 if(!movieRunSelect)return;
 if(!MOVIE.runs.length){
 movieRunSelect.innerHTML='<option value="">No local replays yet</option>';
  movieRunSelect.value='';
  return;
 }
 movieRunSelect.innerHTML=MOVIE.runs.map(run=>`<option value="${run.id}">STG ${String(run.stage||0).padStart(2,'0')} · ${formatScore(run.score||0)} · ${movieDurationLabel(run.duration||0)} · ${movieAgeLabel(run.createdAt)}</option>`).join('');
 movieRunSelect.value=MOVIE.pendingId||MOVIE.selectedId||MOVIE.runs[0].id;
}
function publishReplayCatalog(){
 window.__platinumReplayCatalog=MOVIE.runs.slice();
 window.__auroraReplayCatalog=window.__platinumReplayCatalog;
 if(typeof syncAccountUi==='function')syncAccountUi();
}
function syncMoviePanelVisibility(){
 if(!moviePanel||!movieDockBtn)return;
 const show=!!MOVIE.panelOpen;
 if(movieModal){
  movieModal.classList.toggle('open',show);
  movieModal.setAttribute('aria-hidden',show?'false':'true');
 }
 moviePanel.hidden=!show;
 moviePanel.classList.toggle('visible',show);
 movieDockBtn.classList.toggle('active',show);
 movieDockBtn.classList.toggle('open',show);
 movieDockBtn.setAttribute('aria-expanded',show?'true':'false');
}
function setMovieStatus(text=''){
 MOVIE.status=String(text||'');
 if(moviePanelStatus)moviePanelStatus.textContent=MOVIE.status;
}
function clearMovieSelection(){
 MOVIE.current=null;
 MOVIE.selectedId='';
 MOVIE.pendingId=MOVIE.runs[0]?.id||'';
 revokeMovieObjectUrl();
 movieVideo.pause();
 movieVideo.removeAttribute('src');
 movieVideo.load();
 movieTimeline.value=0;
 moviePanel.classList.remove('ready');
 movieEmptyState.textContent='No replay selected yet.';
 moviePlaybackMeta.textContent='';
 renderMovieRuns();
 syncMovieBuildStamp();
 updateMovieControls();
}
async function loadMovieReplay(id,opts={}){
 if(!movieStoreAvailable())return;
 try{
  setMovieStatus('Loading replay...');
  const replay=await window.AuroraReplayStore.loadReplay(id);
  if(!replay||!replay.blob)throw new Error('Replay not found');
  MOVIE.selectedId=id;
  MOVIE.current=replay;
  revokeMovieObjectUrl();
  MOVIE.objectUrl=URL.createObjectURL(replay.blob);
  movieVideo.src=MOVIE.objectUrl;
  movieVideo.currentTime=0;
  movieEmptyState.textContent='Replay ready.';
  setMovieStatus(`Showing local replay from ${movieAgeLabel(replay.createdAt)}.`);
  renderMovieRuns();
  moviePanel.classList.add('ready');
  updateMovieTimeline();
  if(opts.autoplay){
   const playing=await tryMovieAutoplay();
   setMovieStatus(playing?`Playing local replay from ${movieAgeLabel(replay.createdAt)}.`:`Showing local replay from ${movieAgeLabel(replay.createdAt)}.`);
   updateMovieControls();
  }
 }catch(err){
  setMovieStatus(err.message||'Could not load replay');
  clearMovieSelection();
 }
}
async function refreshMovieCatalog(opts={}){
 if(!movieStoreAvailable()){
  MOVIE.runs=[];
  clearMovieSelection();
  publishReplayCatalog();
  setMovieStatus('Local replays need browser storage support.');
  return;
 }
 try{
  if(!opts.silent)setMovieStatus('Loading recent replays...');
  MOVIE.runs=await window.AuroraReplayStore.listReplays();
  publishReplayCatalog();
  renderMovieRuns();
  if(!MOVIE.runs.length){
    clearMovieSelection();
    setMovieStatus('Finish a few games and your recent runs will appear here.');
    return;
  }
  setMovieStatus(`${MOVIE.runs.length} recent replay${MOVIE.runs.length===1?'':'s'} stored on this device.`);
  MOVIE.pendingId=MOVIE.selectedId&&MOVIE.runs.some(run=>run.id===MOVIE.selectedId)?MOVIE.selectedId:MOVIE.runs[0].id;
  renderMovieRuns();
  updateMovieControls();
 }catch(err){
  MOVIE.runs=[];
  clearMovieSelection();
  publishReplayCatalog();
  setMovieStatus(err.message||'Could not load local replays');
 }
}
async function openMovieReplayById(id){
 if(!id)return;
 if(!MOVIE.panelOpen)openMoviePanel();
 await refreshMovieCatalog({silent:1});
 if(!MOVIE.runs.some(run=>run.id===id)){
  setMovieStatus('That replay is no longer available on this device.');
  return;
 }
 MOVIE.pendingId=id;
 renderMovieRuns();
 await loadMovieReplay(id,{autoplay:true});
}
function openMoviePanel(){
 if(MOVIE.panelOpen)return;
 closeDockOverlays('movie');
 MOVIE.prevPaused=paused;
 if(started&&!paused)paused=1;
 MOVIE.panelOpen=1;
 syncMoviePanelVisibility();
 if(typeof syncPauseUi==='function')syncPauseUi();
  refreshMovieCatalog();
}
function returnToWaitModeAfterReplay(){
 clearMovieSelection();
 MOVIE.panelOpen=0;
 syncMoviePanelVisibility();
 if(movieModal)movieModal.blur?.();
 if(typeof startAttractDemo==='function')startAttractDemo({record:false});
 else{
  started=0;
  paused=0;
  if(typeof syncPauseUi==='function')syncPauseUi();
 }
 syncMovieBuildStamp();
 showToast('Returned to wait mode');
}
function closeMoviePanel(force=0){
 if(!MOVIE.panelOpen&&!force)return;
 returnToWaitModeAfterReplay();
}
function isMoviePanelOpen(){return !!MOVIE.panelOpen}
window.refreshMovieCatalog=refreshMovieCatalog;
window.closeMoviePanel=closeMoviePanel;
window.isMoviePanelOpen=isMoviePanelOpen;
window.openMovieReplayById=openMovieReplayById;

if(movieDockBtn)movieDockBtn.addEventListener('click',e=>{e.stopPropagation();if(MOVIE.panelOpen)closeMoviePanel();else openMoviePanel();});
if(moviePanelClose)moviePanelClose.addEventListener('click',()=>closeMoviePanel());
if(movieCloseToWaitBtn)movieCloseToWaitBtn.addEventListener('click',()=>closeMoviePanel());
if(moviePanel)moviePanel.addEventListener('click',e=>e.stopPropagation());
if(movieRunSelect)movieRunSelect.addEventListener('change',()=>{MOVIE.pendingId=movieRunSelect.value||'';updateMovieControls();});
if(movieStartBtn)movieStartBtn.addEventListener('click',()=>{if(MOVIE.pendingId)loadMovieReplay(MOVIE.pendingId,{autoplay:true});});
if(movieBackBtn)movieBackBtn.addEventListener('click',()=>{if(MOVIE.current)movieVideo.currentTime=Math.max(0,(movieVideo.currentTime||0)-5);});
if(movieForwardBtn)movieForwardBtn.addEventListener('click',()=>{if(MOVIE.current)movieVideo.currentTime=Math.min(movieVideo.duration||MOVIE.current.duration||0,(movieVideo.currentTime||0)+5);});
if(moviePlayPauseBtn)moviePlayPauseBtn.addEventListener('click',()=>{if(!MOVIE.current)return;if(movieVideo.paused)movieVideo.play();else movieVideo.pause();});
if(movieTimeline)movieTimeline.addEventListener('input',()=>{if(MOVIE.current)movieVideo.currentTime=+movieTimeline.value||0;});
if(movieDeleteBtn)movieDeleteBtn.addEventListener('click',async()=>{
 if(!MOVIE.current||!movieStoreAvailable())return;
 const id=MOVIE.current.id;
 await window.AuroraReplayStore.deleteReplay(id);
 if(id===MOVIE.selectedId)clearMovieSelection();
 refreshMovieCatalog({silent:1});
});
if(movieVideo){
 movieVideo.addEventListener('loadedmetadata',updateMovieTimeline);
 movieVideo.addEventListener('timeupdate',updateMovieTimeline);
 movieVideo.addEventListener('play',updateMovieControls);
 movieVideo.addEventListener('pause',updateMovieControls);
 movieVideo.addEventListener('ended',updateMovieControls);
}
if(movieModal)movieModal.addEventListener('click',e=>{if(e.target===movieModal)closeMoviePanel();});
document.addEventListener('keydown',e=>{
 if(!MOVIE.panelOpen||keyboardTargetIsEditable(e.target))return;
 if(e.code==='Space'){e.preventDefault();moviePlayPauseBtn.click();return;}
 if(e.code==='ArrowLeft'){e.preventDefault();movieBackBtn.click();return;}
 if(e.code==='ArrowRight'){e.preventDefault();movieForwardBtn.click();return;}
});
if(movieStoreAvailable())setTimeout(()=>{refreshMovieCatalog({silent:1});},0);
updateMovieControls();

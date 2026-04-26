// Shared leaderboard and Supabase client integration.
const leaderboardPanel=document.getElementById('leaderboardPanel');
const leaderboardPanelTitle=document.getElementById('leaderboardPanelTitle');
const leaderboardPanelSub=document.getElementById('leaderboardPanelSub');
const leaderboardPanelStatus=document.getElementById('leaderboardPanelStatus');
const leaderboardPanelTable=document.getElementById('leaderboardPanelTable');
const leaderboardPanelClose=document.getElementById('leaderboardPanelClose');
const leaderboardViews=document.getElementById('leaderboardViews');
const leaderboardStatusEl=document.getElementById('leaderboardStatus');
const leaderboardFilterAfterInput=document.getElementById('leaderboardFilterAfter');
const leaderboardViewButtons=Array.from(document.querySelectorAll('#leaderboardViewButtons button'));
const leaderboardDockBtn=document.getElementById('leaderboardDockBtn');
const accountDockBtn=document.getElementById('accountDockBtn');
const accountPanel=document.getElementById('accountPanel');
const accountPanelClose=document.getElementById('accountPanelClose');
const accountCredentials=document.getElementById('accountCredentials');
const accountEmail=document.getElementById('accountEmail');
const accountEmailLabel=document.getElementById('accountEmailLabel');
const accountPassword=document.getElementById('accountPassword');
const accountPasswordToggle=document.getElementById('accountPasswordToggle');
const accountPasswordLabel=document.getElementById('accountPasswordLabel');
const accountRecoveryFields=document.getElementById('accountRecoveryFields');
const accountPasswordConfirm=document.getElementById('accountPasswordConfirm');
const accountPasswordConfirmToggle=document.getElementById('accountPasswordConfirmToggle');
const accountSignupBtn=document.getElementById('accountSignupBtn');
const accountLoginBtn=document.getElementById('accountLoginBtn');
const accountResetBtn=document.getElementById('accountResetBtn');
const accountApplyResetBtn=document.getElementById('accountApplyResetBtn');
const accountLogoutBtn=document.getElementById('accountLogoutBtn');
const accountInitialsSection=document.getElementById('accountInitialsSection');
const accountInitials=document.getElementById('accountInitials');
const accountSaveInitialsBtn=document.getElementById('accountSaveInitialsBtn');
const accountInitialsDisplay=document.getElementById('accountInitialsDisplay');
const accountSummary=document.getElementById('accountSummary');
const accountBest=document.getElementById('accountBest');
const accountRecent=document.getElementById('accountRecent');
const resetTestPilotScoresBtn=document.getElementById('resetTestPilotScoresBtn');
const pilotStamp=document.getElementById('pilotStamp');
const accountPanelTitle=document.getElementById('accountPanelTitle');
const accountPanelSub=document.getElementById('accountPanelSub');
const accountDockIcon=document.getElementById('accountDockIcon');
const accountDockLabel=document.getElementById('accountDockLabel');
const accountDockStatus=document.getElementById('accountDockStatus');
const accountPilotCallsign=document.getElementById('accountPilotCallsign');
const accountPilotStatus=document.getElementById('accountPilotStatus');
const accountIdentityEmail=document.getElementById('accountIdentityEmail');
const accountIdentityUserId=document.getElementById('accountIdentityUserId');
const accountFlightStats=document.getElementById('accountFlightStats');
const accountRecordsTop5=document.getElementById('accountRecordsTop5');
const SUPABASE_URL='{{SUPABASE_URL}}';
const SUPABASE_ANON_KEY='{{SUPABASE_ANON_KEY}}';
const TEST_ACCOUNT_EMAIL='{{TEST_ACCOUNT_EMAIL}}';
const TEST_ACCOUNT_USER_ID='{{TEST_ACCOUNT_USER_ID}}';
const TEST_ACCOUNT_EMAILS={{TEST_ACCOUNT_EMAILS_JSON}};
const TEST_ACCOUNT_USER_IDS={{TEST_ACCOUNT_USER_IDS_JSON}};
const HARNESS_SUPABASE_BYPASS=location.hostname==='127.0.0.1'&&!!readPref(SEED_PREF_KEY);
const RELEASE_CHANNEL=String(BUILD_INFO?.releaseChannel||'development').toLowerCase();
const NON_PRODUCTION_LANE=RELEASE_CHANNEL!=='production';
const LEADERBOARD_CACHE_PREFIX='auroraGalacticaLeaderboardCache.v1.';
const PLATFORM_LEADERBOARD_CACHE_PREFIX='platinumLeaderboardCache.v1.';
const LEGACY_LEADERBOARD_CACHE_PREFIX='neoGalagaLeaderboardCache.v1.';
const LEADERBOARD_STALE_MS=45000;
const LEADERBOARD_REFRESH_MS=120000;
const LEADERBOARD={
 client:null,
 configured:null,
 view:(()=>{
  try{
   const raw=String(readPref(LEADERBOARD_PREF_KEY)||'all').toLowerCase();
   return['all','validated','local','mine'].includes(raw)?raw:'all';
  }catch{return'all'}
 })(),
 status:'Connecting leaderboard...',
 remote:{all:[],validated:[],mine:[]},
 cacheStamp:{all:0,validated:0,mine:0},
 loading:{all:0,validated:0,mine:0},
 filterAfterDate:(()=>{
  try{
   const raw=String(readPref(LEADERBOARD_DATE_FILTER_KEY)||'').trim();
   return /^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:'';
  }catch{return''}
 })(),
 user:null,
 profile:null,
 accountNotice:'',
  lastRemoteOk:0,
 submitBusy:0,
 authBusy:0,
 recoveryMode:0,
 primed:0,
 refreshTimer:0,
 panelOpen:0,
 accountPanelOpen:0,
 overlayPauseApplied:0,
 overlayPausePrev:0
};

function replayMatchesActivePilot(run){
 const activePilotUserId=String(LEADERBOARD.user?.id||'');
 const activePilotEmail=String(LEADERBOARD.user?.email||'').trim().toLowerCase();
 const activePilotInitials=preferredInitialsFromUser();
 const runUserId=String(run?.pilotUserId||'');
 const runEmail=String(run?.pilotEmail||'').trim().toLowerCase();
 const runInitials=sanitizeInitials(run?.pilotInitials||'');
 if(activePilotUserId&&runUserId&&runUserId===activePilotUserId)return true;
 if(activePilotEmail&&runEmail&&runEmail===activePilotEmail)return true;
 return !!(activePilotInitials&&runInitials&&runInitials===activePilotInitials);
}
function pilotLocalReplayRows(){
 if(!LEADERBOARD.user)return [];
 return replayCatalogRows()
  .filter(replayMatchesActivePilot)
  .map(run=>({
   id:`local-replay:${run.id}`,
   initials:sanitizeInitials(run.pilotInitials||preferredInitialsFromUser()||'YOU').padEnd(3,'-').slice(0,3),
   score:+run.score||0,
   stage:+run.stage||0,
   at:String(run.createdAt||''),
   verified:0,
   replayId:String(run.id||''),
   localReplay:1
  }));
}
function pilotLocalScoreRows(){
 if(!LEADERBOARD.user)return [];
 const activePilotInitials=sanitizeInitials(preferredInitialsFromUser()||'');
 if(!activePilotInitials)return [];
 return loadScoreboard()
  .filter(row=>{
   const rowInitials=sanitizeInitials(row?.initials||'');
   if(rowInitials&&rowInitials===activePilotInitials)return true;
   return !!(gameOverState?.entryId&&String(row?.id||'')===String(gameOverState.entryId));
  })
  .map(row=>Object.assign({verified:0,localScore:1},row));
}
function mergePilotProfileRows(remoteRows,localRows){
 const merged=remoteRows.map(row=>Object.assign({},row));
 for(const localRow of localRows){
  const localStamp=Date.parse(localRow.at||'');
  const existing=merged.find(row=>{
   if((+row.score||0)!== (+localRow.score||0))return false;
   if((+row.stage||0)!== (+localRow.stage||0))return false;
   const rowStamp=Date.parse(resolveRowTimestamp(row)||row.at||'');
   if(Number.isFinite(localStamp)&&Number.isFinite(rowStamp))return Math.abs(localStamp-rowStamp)<=120000;
   return false;
  });
  if(existing){
   if(localRow.replayId)existing.replayId=localRow.replayId;
   if(localRow.at&&!existing.at)existing.at=localRow.at;
   continue;
  }
  merged.push(localRow);
 }
 return merged;
}
function rowsForPilotProfile(){
 if(LEADERBOARD.user){
  const remoteRows=remoteAuthEnabled()&&(LEADERBOARD.remote.mine?.length||LEADERBOARD.cacheStamp.mine)?LEADERBOARD.remote.mine.slice():[];
  const localRows=mergePilotProfileRows(pilotLocalScoreRows(),pilotLocalReplayRows());
  if(remoteRows.length||localRows.length)return mergePilotProfileRows(remoteRows,localRows);
 }
 return localLeaderboardRows();
}
function formatWhenShort(value=''){
 if(!value)return '--';
 const at=Date.parse(value);
 if(!Number.isFinite(at))return '--';
 const delta=Math.max(0,Date.now()-at);
 const minutes=Math.round(delta/60000);
 if(minutes<1)return 'just now';
 if(minutes<60)return `${minutes}m ago`;
 const hours=Math.round(minutes/60);
 if(hours<24)return `${hours}h ago`;
 const days=Math.round(hours/24);
 return `${days}d ago`;
}
function replayCatalogRows(){
 const rows=window.__platinumReplayCatalog||window.__auroraReplayCatalog;
 return Array.isArray(rows)?rows:[];
}
function resolveRowTimestamp(row){
 const direct=String(row?.at||'').trim();
 if(direct&&Number.isFinite(Date.parse(direct)))return direct;
 const score=+row?.score||0;
 const stage=+row?.stage||0;
 const localMatch=localLeaderboardRows().find(localRow=>{
  if((+localRow.score||0)!==score)return false;
  if((+localRow.stage||0)!==stage)return false;
  const stamp=String(localRow.at||'').trim();
  return !!stamp&&Number.isFinite(Date.parse(stamp));
 });
 if(localMatch)return localMatch.at;
 const replayMatch=replayCatalogRows().find(run=>{
  if((+run.score||0)!==score)return false;
  if((+run.stage||0)!==stage)return false;
  const stamp=String(run.createdAt||'').trim();
  return !!stamp&&Number.isFinite(Date.parse(stamp));
 });
 return replayMatch?.createdAt||'';
}

function localLeaderboardRows(){
 return loadScoreboard().map(row=>Object.assign({verified:0},row));
}
function leaderboardCacheKey(view,userId=LEADERBOARD.user?.id||'anon'){
 return `${LEADERBOARD_CACHE_PREFIX}${view}${view==='mine'?`.${userId}`:''}`;
}
function platformLeaderboardCacheKey(view,userId=LEADERBOARD.user?.id||'anon'){
 return `${PLATFORM_LEADERBOARD_CACHE_PREFIX}${view}${view==='mine'?`.${userId}`:''}`;
}
function legacyLeaderboardCacheKey(view,userId=LEADERBOARD.user?.id||'anon'){
 return `${LEGACY_LEADERBOARD_CACHE_PREFIX}${view}${view==='mine'?`.${userId}`:''}`;
}
function setLeaderboardView(view){
 const next=normalizeLeaderboardViewForLane(['all','validated','local','mine'].includes(view)?view:'all');
 LEADERBOARD.view=next;
 LEADERBOARD.panelOpen=1;
 writePref(LEADERBOARD_PREF_KEY,next);
 if(next==='mine'&&(!remoteAuthEnabled()||!LEADERBOARD.user))setLeaderboardStatus(leaderboardStatusLabel(next,'signed_out'));
 else if(next==='local')setLeaderboardStatus(leaderboardStatusLabel(next,'local'));
 else if((LEADERBOARD.remote[next]||[]).length||LEADERBOARD.cacheStamp[next])setLeaderboardStatus(leaderboardCacheFresh(next)?leaderboardStatusLabel(next,'ready'):leaderboardStatusLabel(next,'cached'));
 syncLeaderboardUi();
 refreshLeaderboard(next,{silent:((LEADERBOARD.remote[next]||[]).length||LEADERBOARD.cacheStamp[next])?1:0,force:!leaderboardCacheFresh(next)});
}

for(const btn of leaderboardViewButtons){
 btn.addEventListener('click',()=>openLeaderboardPanel(btn.dataset.view||'all'));
}
if(leaderboardFilterAfterInput)leaderboardFilterAfterInput.addEventListener('input',()=>{
 LEADERBOARD.filterAfterDate=String(leaderboardFilterAfterInput.value||'').trim();
 writePref(LEADERBOARD_DATE_FILTER_KEY,LEADERBOARD.filterAfterDate);
 if(typeof renderLeaderboardPanel==='function')renderLeaderboardPanel();
});
if(leaderboardPanelClose)leaderboardPanelClose.addEventListener('click',closeLeaderboardPanel);
if(leaderboardDockBtn)leaderboardDockBtn.addEventListener('click',e=>{e.stopPropagation();toggleLeaderboardPanel();syncOverlayPause();});
if(accountDockBtn)accountDockBtn.addEventListener('click',e=>{e.stopPropagation();toggleAccountPanel();});
if(accountPanelClose)accountPanelClose.addEventListener('click',closeAccountPanel);
if(accountPanel)accountPanel.addEventListener('click',e=>e.stopPropagation());
if(accountSignupBtn)accountSignupBtn.addEventListener('click',signUpAccount);
if(accountLoginBtn)accountLoginBtn.addEventListener('click',loginAccount);
if(accountResetBtn)accountResetBtn.addEventListener('click',resetAccountPassword);
if(accountApplyResetBtn)accountApplyResetBtn.addEventListener('click',applyRecoveredPassword);
if(accountLogoutBtn)accountLogoutBtn.addEventListener('click',logoutAccount);
if(accountSaveInitialsBtn)accountSaveInitialsBtn.addEventListener('click',saveAccountInitials);
if(accountPasswordToggle)accountPasswordToggle.addEventListener('click',()=>toggleAccountPasswordVisibility(accountPassword,accountPasswordToggle,'password'));
if(accountPasswordConfirmToggle)accountPasswordConfirmToggle.addEventListener('click',()=>toggleAccountPasswordVisibility(accountPasswordConfirm,accountPasswordConfirmToggle,'confirmation password'));
if(resetTestPilotScoresBtn)resetTestPilotScoresBtn.addEventListener('click',resetTestPilotScores);
async function openReplayFromPilotRecordsTarget(target){
 const replayId=target?.dataset?.replayId||target?.closest?.('[data-replay-id]')?.dataset?.replayId||'';
 if(replayId&&typeof window.openMovieReplayById==='function'){
  if(typeof closeAccountPanel==='function')closeAccountPanel();
  await window.openMovieReplayById(replayId);
  return true;
 }
 return false;
}
if(accountRecordsTop5)accountRecordsTop5.addEventListener('click',e=>{
 const btn=e.target.closest('.accountRecordReplayBtn,.accountRecordRow.hasReplay');
 if(!btn)return;
 e.preventDefault();
 e.stopPropagation();
 openReplayFromPilotRecordsTarget(btn);
});
if(accountRecordsTop5)accountRecordsTop5.addEventListener('pointerup',e=>{
 const btn=e.target.closest('.accountRecordReplayBtn,.accountRecordRow.hasReplay');
 if(!btn)return;
 if(typeof e.button==='number'&&e.button!==0)return;
 e.preventDefault();
 e.stopPropagation();
 openReplayFromPilotRecordsTarget(btn);
});
if(accountRecordsTop5)accountRecordsTop5.addEventListener('keydown',e=>{
 if(e.key!=='Enter'&&e.key!==' ')return;
 const row=e.target.closest('.accountRecordReplayBtn,.accountRecordRow.hasReplay');
 if(!row)return;
 e.preventDefault();
 e.stopPropagation();
 openReplayFromPilotRecordsTarget(row);
});
addEventListener('pointerdown',e=>{
 const inAccount=LEADERBOARD.accountPanelOpen&&accountPanel&&(e.target===accountDockBtn||accountPanel.contains(e.target));
 const inLeaderboard=LEADERBOARD.panelOpen&&leaderboardPanel&&(e.target===leaderboardDockBtn||leaderboardPanel.contains(e.target)||leaderboardViews.contains(e.target));
 if(inAccount||inLeaderboard)return;
 if(LEADERBOARD.accountPanelOpen)closeAccountPanel();
 if(LEADERBOARD.panelOpen)closeLeaderboardPanel();
});
syncLeaderboardUi();
initLeaderboard();

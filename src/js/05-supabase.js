// Shared leaderboard and Supabase client integration.
const leaderboardPanel=document.getElementById('leaderboardPanel');
const leaderboardPanelTitle=document.getElementById('leaderboardPanelTitle');
const leaderboardPanelSub=document.getElementById('leaderboardPanelSub');
const leaderboardPanelStatus=document.getElementById('leaderboardPanelStatus');
const leaderboardPanelTable=document.getElementById('leaderboardPanelTable');
const leaderboardPanelClose=document.getElementById('leaderboardPanelClose');
const leaderboardViews=document.getElementById('leaderboardViews');
const leaderboardStatusEl=document.getElementById('leaderboardStatus');
const leaderboardViewButtons=Array.from(document.querySelectorAll('#leaderboardViewButtons button'));
const leaderboardDockBtn=document.getElementById('leaderboardDockBtn');
const accountDockBtn=document.getElementById('accountDockBtn');
const accountPanel=document.getElementById('accountPanel');
const accountPanelClose=document.getElementById('accountPanelClose');
const accountCredentials=document.getElementById('accountCredentials');
const accountEmail=document.getElementById('accountEmail');
const accountEmailLabel=document.getElementById('accountEmailLabel');
const accountPassword=document.getElementById('accountPassword');
const accountPasswordLabel=document.getElementById('accountPasswordLabel');
const accountRecoveryFields=document.getElementById('accountRecoveryFields');
const accountPasswordConfirm=document.getElementById('accountPasswordConfirm');
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

function remoteLeaderboardPolicyLabel(){
 return remoteWriteEnabled()?'live':'read-only mirror';
}
function nonProductionAccountSummary(){
 if(testAccountEnabled())return `Test pilot lane active for ${configuredTestPilotLabel()}. Shared scores stay read-only unless one of those pilots is signed in.`;
 return 'Pilot account is disabled in this lane. Shared scores are read-only; your runs save locally on this device.';
}
function setAccountNotice(text=''){
 LEADERBOARD.accountNotice=String(text||'').trim();
}
function normalizeTestAccountEmail(value=''){
 return String(value||'').trim().toLowerCase();
}
function configuredTestAccountEmails(){
 const values=Array.isArray(TEST_ACCOUNT_EMAILS)?TEST_ACCOUNT_EMAILS:[];
 const normalized=values.map(normalizeTestAccountEmail).filter(Boolean);
 if(normalized.length)return Array.from(new Set(normalized));
 const single=normalizeTestAccountEmail(TEST_ACCOUNT_EMAIL);
 return single?[single]:[];
}
function configuredTestAccountUserIds(){
 const values=Array.isArray(TEST_ACCOUNT_USER_IDS)?TEST_ACCOUNT_USER_IDS:[];
 const normalized=values.map(value=>String(value||'').trim()).filter(Boolean);
 if(normalized.length)return Array.from(new Set(normalized));
 return TEST_ACCOUNT_USER_ID?[String(TEST_ACCOUNT_USER_ID).trim()]:[];
}
function primaryTestAccountEmail(){
 return configuredTestAccountEmails()[0]||'';
}
function configuredTestPilotLabel(){
 const emails=configuredTestAccountEmails();
 if(!emails.length)return 'configured test pilot';
 if(emails.length===1)return emails[0];
 if(emails.length===2)return `${emails[0]} or ${emails[1]}`;
 return `${emails[0]}, ${emails[1]}, +${emails.length-2} more`;
}
function deriveInitialsFromEmail(email=''){
 const local=String(email||'').split('@')[0]||'';
 return sanitizeInitials(local);
}
function testAccountEnabled(){
 return NON_PRODUCTION_LANE&&configuredTestAccountEmails().length>0;
}
function isConfiguredTestAccountEmail(value=''){
 return configuredTestAccountEmails().includes(normalizeTestAccountEmail(value));
}
function isSignedInAsTestAccount(){
 const email=normalizeTestAccountEmail(LEADERBOARD.user?.email||'');
 const userIds=configuredTestAccountUserIds();
 if(userIds.length&&LEADERBOARD.user?.id)return userIds.includes(LEADERBOARD.user.id);
 return !!email&&isConfiguredTestAccountEmail(email);
}
function remoteAuthEnabled(){
 return RELEASE_CHANNEL==='production'||testAccountEnabled();
}
function remoteWriteEnabled(){
 if(window.__auroraHarnessForceRemoteWrite)return true;
 if(RELEASE_CHANNEL==='production')return !isSignedInAsTestAccount();
 return isSignedInAsTestAccount();
}
function shouldHideTestAccountScores(){
 return configuredTestAccountUserIds().length>0;
}
function normalizeLeaderboardViewForLane(view){
 if(view==='mine'&&!remoteAuthEnabled())return 'local';
 return view;
}
function pilotDisplayId(){
 const initials=preferredInitialsFromUser();
 if(initials)return initials;
 const email=String(LEADERBOARD.user?.email||'').trim();
 if(email){
  const local=email.split('@')[0]||email;
  return sanitizeInitials(local).slice(0,3)||local.slice(0,10).toUpperCase();
 }
 return 'GUEST';
}
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
  const localRows=pilotLocalReplayRows();
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
 return Array.isArray(window.__auroraReplayCatalog)?window.__auroraReplayCatalog:[];
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
function renderPilotFlightStats(rows,signedIn){
 if(!accountFlightStats)return;
 if(!rows.length){
  accountFlightStats.innerHTML='<div class="accountRecordEmpty">No flight history yet. Finish a run to start building this pilot record.</div>';
  return;
 }
 const latest=[...rows]
  .map(row=>Object.assign({},row,{resolvedAt:resolveRowTimestamp(row)}))
  .sort((a,b)=>Date.parse(b.resolvedAt||0)-Date.parse(a.resolvedAt||0))[0]||rows[0];
 const bestScore=Math.max(...rows.map(row=>+row.score||0),0);
 const bestStage=Math.max(...rows.map(row=>+row.stage||0),0);
 const verifiedRuns=rows.filter(row=>row.verified).length;
 const cards=[
  ['Sorties Logged', String(rows.length)],
  ['Best Score', formatScore(bestScore)],
  ['Last Stage Reached', `STG ${String(+latest.stage||0).padStart(2,'0')}`],
  ['Latest Score', formatScore(+latest.score||0)],
  ['Latest Flight', formatWhenShort(latest.resolvedAt||latest.at)],
  ['Verified Runs', signedIn?String(verifiedRuns):'--']
 ];
 accountFlightStats.innerHTML=cards.map(([label,value])=>`<div class="accountStatCard"><span class="accountStatLabel">${label}</span><span class="accountStatValue">${value}</span></div>`).join('');
}
function renderPilotRecords(rows){
 if(!accountRecordsTop5)return;
 if(!rows.length){
  accountRecordsTop5.innerHTML='<div class="accountRecordEmpty">Top runs will appear here once this pilot has logged a game.</div>';
  return;
 }
 const topRows=[...rows]
  .map(row=>Object.assign({},row,{resolvedAt:resolveRowTimestamp(row)||row.at||''}))
  .sort((a,b)=>(Date.parse(b.resolvedAt||0)-Date.parse(a.resolvedAt||0))||(+b.score||0)-(+a.score||0)||(+b.stage||0)-(+a.stage||0))
  .slice(0,5);
 const replayForRow=(row)=>{
  const runs=replayCatalogRows();
  if(row?.replayId){
   const directRun=runs.find(run=>String(run.id||'')===String(row.replayId||''));
   if(directRun)return directRun;
  }
  const pilotMatchedRuns=runs.filter(run=>replayMatchesActivePilot(run));
  const runPool=pilotMatchedRuns.length?pilotMatchedRuns:runs;
  const rowScore=+row.score||0;
  const rowStage=+row.stage||0;
  const rowStamp=Date.parse(resolveRowTimestamp(row)||'');
  const byScoreStage=runPool.filter(run=>(+run.score||0)===rowScore&&(+run.stage||0)===rowStage);
  if(Number.isFinite(rowStamp)){
   const exactTimed=byScoreStage.find(run=>{
    const replayStamp=Date.parse(run.createdAt||'');
    return Number.isFinite(replayStamp)&&Math.abs(replayStamp-rowStamp)<=120000;
   });
   if(exactTimed)return exactTimed;
  }
  if(byScoreStage.length)return byScoreStage[0];
  if(Number.isFinite(rowStamp)){
   const sameStageTimed=runPool.find(run=>{
    if((+run.stage||0)!==rowStage)return false;
    const replayStamp=Date.parse(run.createdAt||'');
    return Number.isFinite(replayStamp)&&Math.abs(replayStamp-rowStamp)<=120000;
   });
   if(sameStageTimed)return sameStageTimed;
  }
  const sameStageRuns=runPool.filter(run=>(+run.stage||0)===rowStage);
  if(sameStageRuns.length===1)return sameStageRuns[0];
  if(pilotMatchedRuns.length===1)return pilotMatchedRuns[0];
  return null;
 };
 accountRecordsTop5.innerHTML=topRows.map((row,index)=>{
  const stage=`STG ${String(+row.stage||0).padStart(2,'0')}`;
  const stamp=formatWhenShort(row.resolvedAt||resolveRowTimestamp(row)||row.at);
  const replay=replayForRow(row);
  return `<div class="accountRecordRow${replay?' hasReplay':''}"${replay?` data-replay-id="${replay.id}" tabindex="0" role="button" aria-label="Replay this flight"`:''}><span class="accountRecordRank">#${index+1}</span><div class="accountRecordMain"><span class="accountRecordScore">${formatScore(+row.score||0)}</span><span class="accountRecordMeta">${stage}${row.verified?' · verified':''}</span></div><div class="accountRecordActions">${replay?`<button type="button" class="accountRecordReplayBtn" data-replay-id="${replay.id}" title="Replay this flight">Replay</button>`:''}<span class="accountRecordStamp">${stamp}</span></div></div>`;
 }).join('');
 const bindReplayAction=(node,opts={})=>{
  if(!node||node.__replayBound)return;
  node.__replayBound=1;
  const trigger=e=>{
   if(opts.row&&e.target.closest('.accountRecordReplayBtn'))return;
   e.preventDefault();
   e.stopPropagation();
   openReplayFromPilotRecordsTarget(node);
  };
  node.addEventListener('pointerdown',trigger);
  node.addEventListener('click',trigger);
  node.addEventListener('keydown',e=>{
   if(e.key!=='Enter'&&e.key!==' ')return;
   trigger(e);
  });
 };
 accountRecordsTop5.querySelectorAll('.accountRecordReplayBtn').forEach(node=>bindReplayAction(node));
 accountRecordsTop5.querySelectorAll('.accountRecordRow.hasReplay').forEach(node=>bindReplayAction(node,{row:true}));
}

function normalizeRemoteScoreRow(row){
 return{
  id:String(row?.id||''),
  initials:sanitizeInitials(row?.initials||'---').padEnd(3,'-').slice(0,3),
  score:+row?.score|0,
  stage:+row?.stage|0,
  at:String(row?.achieved_at||''),
  verified:!!row?.is_verified
 };
}
function preferredInitialsFromUser(user=LEADERBOARD.user){
 return sanitizeInitials(LEADERBOARD.profile?.display_initials||user?.user_metadata?.display_initials||deriveInitialsFromEmail(user?.email||'')||'').slice(0,3);
}
function localLeaderboardRows(){
 return loadScoreboard().map(row=>Object.assign({verified:0},row));
}
function currentLeaderboardTitle(){
 switch(LEADERBOARD.view){
  case 'validated': return 'VALIDATED PILOTS';
  case 'mine': return LEADERBOARD.user?'MY SCORES':'MY SCORES · LOCAL';
  case 'local': return 'LOCAL DEVICE SCORES';
  default: return 'TOP 10 PILOTS';
 }
}
function leaderboardRowsForView(view=LEADERBOARD.view){
 if(view==='local')return localLeaderboardRows();
 if(view==='mine'&&!remoteAuthEnabled())return localLeaderboardRows();
 if(view==='mine'&&!LEADERBOARD.user)return localLeaderboardRows();
 const rows=LEADERBOARD.remote[view]||[];
 if(rows.length)return rows;
 if((view==='validated'||view==='mine')&&(LEADERBOARD.lastRemoteOk||LEADERBOARD.cacheStamp[view]))return [];
 return localLeaderboardRows();
}
function leaderboardStatusLabel(view,mode='ready'){
 if(mode==='loading')return view==='validated'?'Loading validated scores...':view==='mine'?'Loading your scores...':'Loading shared scores...';
 if(mode==='fallback')return view==='mine'?'My Scores unavailable · showing local':'Remote unavailable · showing local';
 if(mode==='cached')return view==='validated'?'Validated scores cached · refreshing':view==='mine'?'My scores cached · refreshing':'Shared scores cached · refreshing';
 if(mode==='signed_out')return remoteAuthEnabled()?'Sign in required · showing local':'Pilot account disabled in this lane · showing local';
 if(mode==='local')return 'Local device scores';
 if(!remoteWriteEnabled())return view==='validated'?'Validated scores mirrored read-only':view==='mine'?'Pilot account disabled in this lane':'Production scores mirrored read-only';
 return view==='validated'?'Validated leaderboard live':view==='mine'?'My scores live':'Shared leaderboard live';
}
function leaderboardCacheKey(view,userId=LEADERBOARD.user?.id||'anon'){
 return `${LEADERBOARD_CACHE_PREFIX}${view}${view==='mine'?`.${userId}`:''}`;
}
function legacyLeaderboardCacheKey(view,userId=LEADERBOARD.user?.id||'anon'){
 return `${LEGACY_LEADERBOARD_CACHE_PREFIX}${view}${view==='mine'?`.${userId}`:''}`;
}
function persistLeaderboardCache(view){
 if(view==='local')return;
 try{
  localStorage.setItem(leaderboardCacheKey(view),JSON.stringify({fetchedAt:LEADERBOARD.cacheStamp[view]||Date.now(),rows:LEADERBOARD.remote[view]||[]}));
 }catch{}
}
function hydrateLeaderboardCache(view,userId=LEADERBOARD.user?.id||'anon'){
 if(view==='local')return 0;
 try{
  const raw=localStorage.getItem(leaderboardCacheKey(view,userId))||localStorage.getItem(legacyLeaderboardCacheKey(view,userId));
  if(!raw)return 0;
  const parsed=JSON.parse(raw);
  const rows=Array.isArray(parsed?.rows)?parsed.rows.map(normalizeRemoteScoreRow):[];
  const fetchedAt=+parsed?.fetchedAt||0;
  LEADERBOARD.remote[view]=rows;
  LEADERBOARD.cacheStamp[view]=fetchedAt;
  if(rows.length||fetchedAt)LEADERBOARD.lastRemoteOk=1;
  return rows.length||fetchedAt?1:0;
 }catch{
  return 0;
 }
}
function leaderboardCacheFresh(view){
 const stamp=LEADERBOARD.cacheStamp[view]||0;
 return !!stamp&&(Date.now()-stamp)<LEADERBOARD_STALE_MS;
}
function scheduleLeaderboardRefresh(){
 if(LEADERBOARD.refreshTimer)clearInterval(LEADERBOARD.refreshTimer);
 if(!LEADERBOARD.configured||!LEADERBOARD.client)return;
 LEADERBOARD.refreshTimer=setInterval(()=>{
  if(document.hidden)return;
  prefetchLeaderboards(1);
 },LEADERBOARD_REFRESH_MS);
}
function setLeaderboardStatus(text){
 LEADERBOARD.status=String(text||'');
 if(leaderboardStatusEl)leaderboardStatusEl.textContent=LEADERBOARD.status;
 if(leaderboardPanelStatus)leaderboardPanelStatus.textContent=LEADERBOARD.status;
}
function renderLeaderboardPanel(){
 if(!leaderboardPanel||!leaderboardPanelTable)return;
 if(leaderboardPanelTitle)leaderboardPanelTitle.textContent='HIGH SCORES';
 if(leaderboardPanelSub)leaderboardPanelSub.textContent=currentLeaderboardTitle();
 const rows=leaderboardRowsForView(LEADERBOARD.view);
 if(!rows.length){
  leaderboardPanelTable.innerHTML='<div id="leaderboardPanelEmpty">No scores loaded for this view yet.</div>';
  return;
 }
 const filled=rows.length?rows:Array.from({length:10},(_,i)=>({initials:'---',score:0,stage:0,idx:i+1,verified:0}));
 const limited=filled.slice(0,10);
 const body=[
  '<span class="scoreCellHead">NO</span>',
  '<span class="scoreCellHead">ID</span>',
  '<span class="scoreCellHead" style="text-align:right">SCORE</span>',
  '<span class="scoreCellHead" style="text-align:right">STG</span>'
 ];
 for(let i=0;i<10;i++){
  const row=limited[i]||{initials:'---',score:0,stage:0,idx:i+1,verified:0};
  body.push(`<span class="scoreCell rank">${String((row.idx||i+1)).padStart(2,'0')}</span>`);
  body.push(`<span class="scoreCell initials">${row.initials}${row.verified?'<span class="verifiedMark">🔒</span>':''}</span>`);
  body.push(`<span class="scoreCell score">${formatScore(row.score||0)}</span>`);
  body.push(`<span class="scoreCell stage">${String(row.stage||0).padStart(2,' ')}</span>`);
 }
 leaderboardPanelTable.innerHTML=body.join('');
}
function syncLeaderboardPanelVisibility(){
 if(!leaderboardPanel)return;
 const show=!!LEADERBOARD.panelOpen;
 leaderboardPanel.hidden=!show;
 leaderboardPanel.classList.toggle('visible',show);
 if(leaderboardViews)leaderboardViews.style.display=show?'flex':'none';
 if(leaderboardDockBtn){
  leaderboardDockBtn.classList.toggle('active',show);
  leaderboardDockBtn.setAttribute('aria-expanded',show?'true':'false');
 }
}
function syncOverlayPause(){
 const overlayOpen=!!(LEADERBOARD.panelOpen||LEADERBOARD.accountPanelOpen);
 if(overlayOpen){
  if(started&&!paused&&!LEADERBOARD.overlayPauseApplied){
   LEADERBOARD.overlayPausePrev=0;
   LEADERBOARD.overlayPauseApplied=1;
   paused=1;
  }
  return;
 }
 if(LEADERBOARD.overlayPauseApplied){
  paused=LEADERBOARD.overlayPausePrev;
  LEADERBOARD.overlayPauseApplied=0;
 }
}
function openLeaderboardPanel(view=LEADERBOARD.view){
 LEADERBOARD.panelOpen=1;
 LEADERBOARD.accountPanelOpen=0;
 if(view&&view!==LEADERBOARD.view)setLeaderboardView(view);
 else{
  renderLeaderboardPanel();
  syncLeaderboardPanelVisibility();
   syncAccountPanelVisibility();
   syncOverlayPause();
  }
}
function toggleLeaderboardPanel(view=LEADERBOARD.view){
 if(LEADERBOARD.panelOpen&&(!view||view===LEADERBOARD.view)){
  closeLeaderboardPanel();
  return;
 }
 openLeaderboardPanel(view);
}
function closeLeaderboardPanel(){
 LEADERBOARD.panelOpen=0;
 syncLeaderboardPanelVisibility();
 syncOverlayPause();
}
function syncAccountPanelVisibility(){
 if(!accountPanel)return;
 const show=!!LEADERBOARD.accountPanelOpen;
 accountPanel.hidden=!show;
 accountPanel.classList.toggle('visible',show);
 if(accountDockBtn){
  accountDockBtn.classList.toggle('active',show);
  accountDockBtn.setAttribute('aria-expanded',show?'true':'false');
 }
}
function openAccountPanel(){
 LEADERBOARD.accountPanelOpen=1;
 LEADERBOARD.panelOpen=0;
 syncLeaderboardPanelVisibility();
 syncAccountPanelVisibility();
 syncAccountUi();
 if(typeof window.refreshMovieCatalog==='function')window.refreshMovieCatalog({silent:1});
 syncOverlayPause();
}
function closeAccountPanel(){
 LEADERBOARD.accountPanelOpen=0;
 syncAccountPanelVisibility();
 syncOverlayPause();
}
function toggleAccountPanel(){
 LEADERBOARD.accountPanelOpen=!LEADERBOARD.accountPanelOpen;
 if(LEADERBOARD.accountPanelOpen)LEADERBOARD.panelOpen=0;
 syncLeaderboardPanelVisibility();
 syncAccountPanelVisibility();
 syncAccountUi();
 syncOverlayPause();
}
function buildStartAccountPrompt(){
 const configured=!!LEADERBOARD.configured;
 const pending=LEADERBOARD.configured===null;
  const signedIn=!!LEADERBOARD.user;
  const verified=!!LEADERBOARD.user?.email_confirmed_at;
  const initials=preferredInitialsFromUser();
  if(pending)return 'CONNECTING ONLINE LEADERBOARD...';
  if(!configured)return 'LOCAL SCORES ACTIVE   ONLINE LEADERBOARD UNAVAILABLE';
 if(!remoteAuthEnabled())return testAccountEnabled()?`TEST PILOT ${configuredTestPilotLabel().toUpperCase()} AVAILABLE IN THIS LANE`:'LOCAL SCORES ACTIVE   PRODUCTION SCORES READ ONLY';
 if(NON_PRODUCTION_LANE&&!signedIn)return `SIGN IN AS TEST PILOT <span class="k">${configuredTestPilotLabel()}</span>`;
  if(signedIn&&initials)return `SIGNED IN AS <span class="k">${initials}</span>${verified?' <span class="startBadge">🔒 VERIFIED</span>':''}`;
  if(signedIn)return `SIGNED IN${verified?' <span class="startBadge">🔒 VERIFIED</span>':''}`;
  return 'SIGN IN OR CREATE AN ACCOUNT FOR <span class="k">VALIDATED SCORES</span>';
}
function enterRecoveryMode(){
 LEADERBOARD.recoveryMode=1;
 LEADERBOARD.accountPanelOpen=1;
 LEADERBOARD.panelOpen=0;
 setAccountNotice('Choose a new password for your pilot account, then save it here.');
 syncLeaderboardPanelVisibility();
 syncAccountPanelVisibility();
 syncAccountUi();
 syncOverlayPause();
}
function exitRecoveryMode(){
 LEADERBOARD.recoveryMode=0;
 if(accountPassword)accountPassword.value='';
 if(accountPasswordConfirm)accountPasswordConfirm.value='';
 setAccountNotice('');
 syncAccountUi();
}
function syncAccountUi(){
  const configured=!!LEADERBOARD.configured;
 const signedIn=!!LEADERBOARD.user;
 const verified=!!LEADERBOARD.user?.email_confirmed_at;
  const pending=LEADERBOARD.configured===null;
 const recovering=!!LEADERBOARD.recoveryMode;
 const initials=preferredInitialsFromUser();
 const dockId=pilotDisplayId();
 const hasLockedInitials=!!signedIn;
 if(accountPanelTitle)accountPanelTitle.textContent=recovering?'RESET PASSWORD':'PILOT INFORMATION';
 if(accountPanelSub)accountPanelSub.textContent=recovering?'SAVE A NEW PASSWORD FOR THIS PILOT':'IDENTITY, RECORDS, AND FLIGHT HISTORY';
 if(accountRecoveryFields)accountRecoveryFields.hidden=!recovering;
 if(accountCredentials)accountCredentials.hidden=signedIn&&!recovering;
 if(accountEmailLabel)accountEmailLabel.hidden=signedIn&&!recovering;
 if(accountPasswordLabel)accountPasswordLabel.hidden=signedIn&&!recovering;
 if(accountSignupBtn){
  accountSignupBtn.hidden=recovering||signedIn;
  accountSignupBtn.disabled=!configured||!remoteAuthEnabled()||LEADERBOARD.authBusy||signedIn||recovering;
 }
 if(accountLoginBtn){
  accountLoginBtn.hidden=recovering||signedIn;
  accountLoginBtn.disabled=!configured||!remoteAuthEnabled()||LEADERBOARD.authBusy||signedIn||recovering;
 }
 if(accountResetBtn){
  accountResetBtn.hidden=recovering||signedIn;
  accountResetBtn.disabled=!configured||!remoteAuthEnabled()||LEADERBOARD.authBusy||signedIn||recovering;
 }
 if(accountApplyResetBtn){
  accountApplyResetBtn.hidden=!recovering;
  accountApplyResetBtn.disabled=!configured||!remoteAuthEnabled()||LEADERBOARD.authBusy||!recovering;
 }
 if(accountLogoutBtn){
  accountLogoutBtn.hidden=!signedIn;
  accountLogoutBtn.disabled=!configured||!remoteAuthEnabled()||LEADERBOARD.authBusy||!signedIn;
 }
 if(accountSaveInitialsBtn)accountSaveInitialsBtn.disabled=!configured||!remoteAuthEnabled()||LEADERBOARD.authBusy||!signedIn||hasLockedInitials;
 if(accountEmail)accountEmail.disabled=!configured||!remoteAuthEnabled()||pending||LEADERBOARD.authBusy||signedIn||recovering;
 if(accountPassword){
  accountPassword.disabled=!configured||!remoteAuthEnabled()||pending||LEADERBOARD.authBusy||(signedIn&&!recovering);
  accountPassword.placeholder=recovering?'New password':'Password';
  accountPassword.autocomplete=recovering?'new-password':'current-password';
 }
 if(accountPasswordConfirm)accountPasswordConfirm.disabled=!configured||!remoteAuthEnabled()||pending||LEADERBOARD.authBusy||!recovering;
 if(accountEmail&&testAccountEnabled()&&!signedIn&&document.activeElement!==accountEmail&&String(accountEmail.value||'').trim()===''){
  accountEmail.value=primaryTestAccountEmail();
 }
 if(accountInitialsSection)accountInitialsSection.hidden=!signedIn||hasLockedInitials;
 if(accountInitialsDisplay){
  accountInitialsDisplay.hidden=!(signedIn&&hasLockedInitials);
  if(hasLockedInitials)accountInitialsDisplay.textContent=`Pilot ID locked: ${dockId}`;
 }
 if(accountInitials){
  accountInitials.disabled=!configured||!remoteAuthEnabled()||pending||LEADERBOARD.authBusy||!signedIn||hasLockedInitials;
  if(document.activeElement!==accountInitials)accountInitials.value=signedIn?initials:'';
  }
  if(accountSummary){
   if(pending)accountSummary.textContent='Connecting leaderboard...';
   else if(!configured)accountSummary.textContent='Online leaderboard unavailable. Scores stay local.';
  else if(LEADERBOARD.accountNotice)accountSummary.textContent=LEADERBOARD.accountNotice;
  else if(!remoteAuthEnabled())accountSummary.textContent=nonProductionAccountSummary();
  else if(recovering)accountSummary.textContent='Recovery link accepted. Save a new password to finish signing back into this pilot account.';
   else if(!signedIn)accountSummary.textContent='Not signed in. Anonymous scores still work.';
   else accountSummary.textContent=`Signed in as ${LEADERBOARD.user.email}${verified?' · verified':' · email not yet verified'}`;
  }
 const rows=rowsForPilotProfile();
 if(accountDockBtn){
  accountDockBtn.dataset.signedIn=signedIn?'true':'false';
  accountDockBtn.classList.toggle('open',!!LEADERBOARD.accountPanelOpen);
  accountDockBtn.title=signedIn?`${dockId} onboard`:'Pilot Sign In';
 }
 if(accountDockLabel)accountDockLabel.textContent=signedIn?'ONBOARD':'SIGN IN';
 if(accountDockStatus)accountDockStatus.textContent=signedIn?dockId:'Pilot offline';
 if(accountPilotCallsign)accountPilotCallsign.textContent=signedIn?`${dockId} IS ONBOARD`:(recovering?'RESET IN PROGRESS':'PILOT OFFLINE');
 if(accountPilotStatus)accountPilotStatus.textContent=recovering?'Recovery link accepted. Save a new password below.':(signedIn?'Pilot identity active. Flight history and records are synced below.':'Sign in, create a pilot, or keep playing locally and track records on this device.');
 if(accountIdentityEmail)accountIdentityEmail.textContent=`Email: ${signedIn?(LEADERBOARD.user?.email||'--'):(testAccountEnabled()?primaryTestAccountEmail():'--')}`;
 if(accountIdentityUserId)accountIdentityUserId.textContent=`User ID: ${signedIn?(LEADERBOARD.user?.id||'--'):'--'}`;
 if(accountPanel){
  accountPanel.dataset.signedIn=signedIn?'true':'false';
 }
 renderPilotFlightStats(rows,signedIn);
 renderPilotRecords(rows);
 const hudInitials=signedIn?dockId:'---';
 window.__auroraPilotHudHtml=`<span class="hudLabel">PILOT</span> <span class="hudValue">${hudInitials}</span>`;
 if(resetTestPilotScoresBtn){
  const show=testAccountEnabled();
  resetTestPilotScoresBtn.hidden=!show;
  resetTestPilotScoresBtn.disabled=!show||LEADERBOARD.authBusy||!isSignedInAsTestAccount();
  resetTestPilotScoresBtn.textContent=isSignedInAsTestAccount()?'🧹 Reset Test Pilot Scores':'🧹 Reset Test Pilot Scores (Sign in required)';
 }
}
function syncLeaderboardUi(){
  const signedIn=!!LEADERBOARD.user;
  for(const btn of leaderboardViewButtons){
   const view=btn.dataset.view||'all';
   btn.classList.toggle('active',view===LEADERBOARD.view);
  btn.disabled=view==='mine'&&(!signedIn||!remoteAuthEnabled());
  }
 if(leaderboardStatusEl)leaderboardStatusEl.textContent=LEADERBOARD.status;
 renderLeaderboardPanel();
 syncLeaderboardPanelVisibility();
 syncAccountPanelVisibility();
 syncAccountUi();
}
function syncLeaderboardBest(){
 const localBest=localLeaderboardRows()[0]?.score||0;
 const remoteBest=LEADERBOARD.remote.all[0]?.score||0;
 S.best=Math.max(S.best||0,localBest,remoteBest);
 writePref(BEST_SCORE_KEY,String(S.best));
}
async function loadOwnProfile(){
 if(!LEADERBOARD.client||!LEADERBOARD.user){LEADERBOARD.profile=null;return null;}
 let {data}=await LEADERBOARD.client.from('profiles').select('user_id,display_initials,created_at').eq('user_id',LEADERBOARD.user.id).maybeSingle();
 if(!data){
  const initials=preferredInitialsFromUser(LEADERBOARD.user);
  if(initials){
   const seeded=await LEADERBOARD.client.from('profiles').upsert({user_id:LEADERBOARD.user.id,display_initials:initials}).select('user_id,display_initials,created_at').maybeSingle();
   if(!seeded.error)data=seeded.data||null;
  }
 }
 LEADERBOARD.profile=data||null;
 syncAccountUi();
 return LEADERBOARD.profile;
}
async function refreshLeaderboard(view=LEADERBOARD.view,{silent=0,force=0}={}){
 view=normalizeLeaderboardViewForLane(view);
 if(view==='local'){
  syncLeaderboardBest();
  if(!silent)setLeaderboardStatus(leaderboardStatusLabel('local','local'));
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 if(!LEADERBOARD.configured||!LEADERBOARD.client){
  if(!silent)setLeaderboardStatus('Local fallback');
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 if(view==='mine'&&(!remoteAuthEnabled()||!LEADERBOARD.user)){
  if(!silent)setLeaderboardStatus(leaderboardStatusLabel(view,'signed_out'));
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 if(!force&&leaderboardCacheFresh(view)&&((LEADERBOARD.remote[view]||[]).length||LEADERBOARD.cacheStamp[view])){
  syncLeaderboardBest();
  if(!silent)setLeaderboardStatus(leaderboardStatusLabel(view,'ready'));
  syncLeaderboardUi();
  return leaderboardRowsForView(view);
 }
 if(LEADERBOARD.loading[view])return leaderboardRowsForView(view);
 LEADERBOARD.loading[view]=1;
 if(!silent)setLeaderboardStatus(leaderboardStatusLabel(view,'loading'));
 syncLeaderboardUi();
 let query=LEADERBOARD.client.from('scores').select('id,initials,score,stage,achieved_at,is_verified').order('score',{ascending:false}).order('stage',{ascending:false}).limit(10);
 if(view==='validated')query=query.eq('is_verified',true);
 if(shouldHideTestAccountScores()&&view!=='mine'){
  const hiddenIds=configuredTestAccountUserIds();
  if(hiddenIds.length===1)query=query.neq('user_id',hiddenIds[0]);
  else query=query.not('user_id','in',`(${hiddenIds.join(',')})`);
 }
 if(view==='mine')query=query.eq('user_id',LEADERBOARD.user.id);
 const {data,error}=await query;
 LEADERBOARD.loading[view]=0;
 if(error){
  if(!silent)setLeaderboardStatus(leaderboardStatusLabel(view,'fallback'));
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 LEADERBOARD.lastRemoteOk=1;
 LEADERBOARD.remote[view]=(data||[]).map(normalizeRemoteScoreRow);
 LEADERBOARD.cacheStamp[view]=Date.now();
 persistLeaderboardCache(view);
 syncLeaderboardBest();
 if(!silent||view===LEADERBOARD.view)setLeaderboardStatus(leaderboardStatusLabel(view,'ready'));
 syncLeaderboardUi();
 return LEADERBOARD.remote[view];
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
async function prefetchLeaderboards(force=0){
 if(!LEADERBOARD.configured||!LEADERBOARD.client)return;
 const tasks=[refreshLeaderboard('all',{silent:1,force}),refreshLeaderboard('validated',{silent:1,force})];
 if(remoteAuthEnabled()&&LEADERBOARD.user)tasks.push(refreshLeaderboard('mine',{silent:1,force}));
 await Promise.all(tasks);
 if(['all','validated','mine'].includes(LEADERBOARD.view))setLeaderboardStatus(leaderboardStatusLabel(LEADERBOARD.view,'ready'));
 syncLeaderboardUi();
}
async function refreshSignedInPilotRecords(force=1){
 if(!remoteAuthEnabled()||!LEADERBOARD.user)return;
 await refreshLeaderboard('mine',{silent:1,force});
 syncAccountUi();
}
function primeLeaderboard(){
 if(!LEADERBOARD.configured||!LEADERBOARD.client)return;
 if(started&&!paused)return;
 if(!LEADERBOARD.primed){
  prefetchLeaderboards();
  LEADERBOARD.primed=1;
  return;
 }
 refreshLeaderboard(LEADERBOARD.view,{silent:((LEADERBOARD.remote[LEADERBOARD.view]||[]).length||LEADERBOARD.cacheStamp[LEADERBOARD.view])?1:0,force:!leaderboardCacheFresh(LEADERBOARD.view)});
 LEADERBOARD.primed=1;
}
function resolveGameOverScoreEntry(){
 if(!gameOverState)return null;
 const board=loadScoreboard();
 const localRow=board.find(row=>row.id===gameOverState.entryId);
 if(localRow)return Object.assign({},localRow);
 return{
  id:String(gameOverState.entryId||''),
  initials:sanitizeInitials(gameOverState.initials?.join('')||'YOU').padEnd(3,'-').slice(0,3),
  score:+gameOverState.score|0,
  stage:+gameOverState.stage|0,
  at:new Date().toISOString()
 };
}
async function submitScoreRemote(entry){
 if(!entry||!LEADERBOARD.configured||!LEADERBOARD.client)return 0;
 if(!remoteWriteEnabled()){
  setLeaderboardStatus('Saved locally · production submit disabled in this lane');
  syncLeaderboardUi();
  if(typeof recordSystemIssue==='function'){
   recordSystemIssue('score_submit_blocked','Remote score submit blocked by lane policy',{
    score:+entry.score|0,
    stage:+entry.stage|0,
    initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
    releaseChannel:RELEASE_CHANNEL
   },{level:'info'});
  }
  return 0;
 }
 const payload={
  initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
  score:+entry.score|0,
  stage:+entry.stage|0,
  build:BUILD
 };
 if(LEADERBOARD.user?.id){
  payload.user_id=LEADERBOARD.user.id;
  payload.is_verified=!!LEADERBOARD.user.email_confirmed_at;
 }
 if(typeof recordSystemIssue==='function'){
  recordSystemIssue('score_submit_attempt','Attempting remote score submit',{
   score:payload.score,
   stage:payload.stage,
   initials:payload.initials,
   verified:!!payload.is_verified,
   userId:payload.user_id||''
  },{level:'info'});
 }
 try{
  const {error}=await LEADERBOARD.client.from('scores').insert(payload);
  if(error){
   if(typeof recordSystemIssue==='function'){
    recordSystemIssue('score_submit_failed',String(error.message||error)||'Remote score insert failed',{
     score:payload.score,
     stage:payload.stage,
     initials:payload.initials,
     verified:!!payload.is_verified,
     userId:payload.user_id||''
    },{
     level:'error',
     suggestBugReport:1,
     summary:'Online score save failed',
     description:'A signed-in score was saved locally but could not be written to the online leaderboard.',
     prompt:'Online score save failed. Please submit a bug report.'
    });
   }
   setLeaderboardStatus('Saved locally only · online submit failed');
   syncLeaderboardUi();
   return 0;
  }
  if(typeof recordSystemIssue==='function'){
   recordSystemIssue('score_submit_ok','Remote score submit succeeded',{
    score:payload.score,
    stage:payload.stage,
    initials:payload.initials,
    verified:!!payload.is_verified,
    userId:payload.user_id||''
   },{level:'info'});
  }
 }catch(err){
  if(typeof recordSystemIssue==='function'){
   recordSystemIssue('score_submit_failed',String(err?.message||err||'Remote score submit threw unexpectedly'),{
    score:payload.score,
    stage:payload.stage,
    initials:payload.initials,
    verified:!!payload.is_verified,
    userId:payload.user_id||''
   },{
    level:'error',
    suggestBugReport:1,
    summary:'Online score save failed',
    description:'A signed-in score was saved locally but could not be written to the online leaderboard.',
    prompt:'Online score save failed. Please submit a bug report.'
   });
  }
  setLeaderboardStatus('Saved locally only · online submit failed');
  syncLeaderboardUi();
  return 0;
 }
 setLeaderboardStatus(payload.is_verified?'Verified score saved online':'Shared leaderboard updated');
 syncLeaderboardUi();
 refreshLeaderboard('all',{force:1});
 if(payload.is_verified)refreshLeaderboard('validated',{force:1});
 if(payload.user_id)refreshLeaderboard('mine',{force:1});
 return 1;
}
function submitGameOverScore(){
 if(!gameOverState||gameOverState.editing||gameOverState.remoteSubmitted||LEADERBOARD.submitBusy)return;
 const entry=resolveGameOverScoreEntry();
 if(!entry)return;
 gameOverState.remoteSubmitted='pending';
 LEADERBOARD.submitBusy=1;
 if(typeof recordSystemIssue==='function'){
  recordSystemIssue('score_submit_queued','Queued game-over score for remote submit',{
   score:+entry.score|0,
   stage:+entry.stage|0,
   initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3)
  },{level:'info'});
 }
 submitScoreRemote(entry)
  .then(ok=>{gameOverState.remoteSubmitted=ok?1:0;})
  .catch(err=>{
   gameOverState.remoteSubmitted=0;
   if(typeof recordSystemIssue==='function'){
    recordSystemIssue('score_submit_failed',String(err?.message||err||'Remote score submit promise rejected'),{
     score:+entry.score|0,
     stage:+entry.stage|0,
     initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3)
    },{
     level:'error',
     suggestBugReport:1,
     summary:'Online score save failed',
     description:'A signed-in score was saved locally but the online leaderboard submit rejected unexpectedly.',
     prompt:'Online score save failed. Please submit a bug report.'
    });
   }
  })
  .finally(()=>{LEADERBOARD.submitBusy=0;});
}
function authRedirectUrl(){
 return `${location.origin}${location.pathname}`;
}
function friendlyAuthError(action,error){
 const message=String(error?.message||'').trim();
 const lower=message.toLowerCase();
 if(lower.includes('email rate limit exceeded')){
  if(action==='reset'){
   return 'Too many reset emails were requested recently. Use the newest reset email you already received, or wait a bit before requesting another.';
  }
  if(action==='signup'){
   return 'Too many email actions were requested recently. Wait a bit, then try creating the account again.';
  }
 }
 if(lower.includes('invalid login credentials')){
  return 'Invalid email or password.';
 }
 if(lower.includes('email not confirmed')){
  return 'Your email is not verified yet. Use the newest verification email, then try logging in again.';
 }
 return message||'Unknown authentication error.';
}
async function signUpAccount(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy||!remoteAuthEnabled())return;
 const email=String(accountEmail?.value||'').trim();
 const password=String(accountPassword?.value||'');
 const initials=sanitizeInitials(accountInitials?.value||'').slice(0,3);
 if(!email||!password){
  setAccountNotice('Enter an email and password first.');
  syncAccountUi();
  return;
 }
 if(NON_PRODUCTION_LANE&&!isConfiguredTestAccountEmail(email)){
  setAccountNotice(`Only configured test pilots (${configuredTestPilotLabel()}) can create an account from this lane.`);
  syncAccountUi();
  return;
 }
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.signUp({
  email,
  password,
  options:{
   emailRedirectTo:authRedirectUrl(),
   data:initials?{display_initials:initials}:{}
  }
 });
 LEADERBOARD.authBusy=0;
 if(error){
  if(typeof recordSystemIssue==='function')recordSystemIssue('auth_signup_failed',friendlyAuthError('signup',error),{emailDomain:email.split('@')[1]||'', lane:RELEASE_CHANNEL},{level:'warn'});
  setAccountNotice(`Signup failed: ${friendlyAuthError('signup',error)}`);
  syncAccountUi();
  return;
 }
 setAccountNotice('Check your email to verify your account, then log in here.');
 syncAccountUi();
}
async function loginAccount(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy||!remoteAuthEnabled())return;
 const email=String(accountEmail?.value||'').trim();
 const password=String(accountPassword?.value||'');
 if(!email||!password){
  setAccountNotice('Enter your email and password first.');
  syncAccountUi();
  return;
 }
 if(NON_PRODUCTION_LANE&&!isConfiguredTestAccountEmail(email)){
  setAccountNotice(`Only configured test pilots (${configuredTestPilotLabel()}) can sign in from this lane.`);
  syncAccountUi();
  return;
 }
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.signInWithPassword({email,password});
 LEADERBOARD.authBusy=0;
 if(error){
  if(typeof recordSystemIssue==='function')recordSystemIssue('auth_login_failed',friendlyAuthError('login',error),{emailDomain:email.split('@')[1]||'', lane:RELEASE_CHANNEL},{level:'warn'});
  setAccountNotice(`Login failed: ${friendlyAuthError('login',error)}`);
  syncAccountUi();
  return;
 }
 if(accountPassword)accountPassword.value='';
 setAccountNotice('');
 await refreshSignedInPilotRecords(1);
 syncAccountUi();
}
async function resetAccountPassword(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy||!remoteAuthEnabled())return;
 const email=String(accountEmail?.value||'').trim();
 if(!email){
  setAccountNotice('Enter your email first so we know where to send the reset link.');
  syncAccountUi();
  return;
 }
 if(NON_PRODUCTION_LANE&&!isConfiguredTestAccountEmail(email)){
  setAccountNotice(`Only configured test pilots (${configuredTestPilotLabel()}) can reset a password from this lane.`);
  syncAccountUi();
  return;
 }
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.resetPasswordForEmail(email,{redirectTo:authRedirectUrl()});
 LEADERBOARD.authBusy=0;
 if(error){
  if(typeof recordSystemIssue==='function')recordSystemIssue('auth_reset_failed',friendlyAuthError('reset',error),{emailDomain:email.split('@')[1]||'', lane:RELEASE_CHANNEL},{level:'warn'});
  setAccountNotice(`Reset password failed: ${friendlyAuthError('reset',error)}`);
  syncAccountUi();
  return;
 }
 setAccountNotice(`Password reset email sent to ${email}. Check your inbox and spam folder.`);
 syncAccountUi();
}
async function applyRecoveredPassword(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy||!remoteAuthEnabled()||!LEADERBOARD.recoveryMode)return;
 const password=String(accountPassword?.value||'');
 const confirm=String(accountPasswordConfirm?.value||'');
 if(!password){
  setAccountNotice('Enter a new password first.');
  syncAccountUi();
  return;
 }
 if(password.length<6){
  setAccountNotice('Use a password with at least 6 characters.');
  syncAccountUi();
  return;
 }
 if(password!==confirm){
  setAccountNotice('New password and confirmation do not match.');
  syncAccountUi();
  return;
 }
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.updateUser({password});
 LEADERBOARD.authBusy=0;
 if(error){
  setAccountNotice(`Could not update password: ${error.message}`);
  syncAccountUi();
  return;
 }
 const {data:{session}}=await LEADERBOARD.client.auth.getSession();
 LEADERBOARD.user=session?.user||LEADERBOARD.user;
 if(LEADERBOARD.user)await loadOwnProfile();
 await refreshSignedInPilotRecords(1);
 setAccountNotice('Password updated. You can now keep using this pilot account.');
 LEADERBOARD.recoveryMode=0;
 if(accountPassword)accountPassword.value='';
 if(accountPasswordConfirm)accountPasswordConfirm.value='';
 syncLeaderboardBest();
 syncAccountUi();
 syncLeaderboardUi();
}
async function logoutAccount(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy||!remoteAuthEnabled())return;
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.signOut();
 LEADERBOARD.authBusy=0;
 if(error)setAccountNotice(`Logout failed: ${error.message}`);
 if(!error&&accountPassword)accountPassword.value='';
 if(!error)setAccountNotice('');
 syncAccountUi();
}
async function saveAccountInitials(){
 if(!LEADERBOARD.client||!LEADERBOARD.user||LEADERBOARD.authBusy||!remoteAuthEnabled())return;
 const initials=sanitizeInitials(accountInitials?.value||'').padEnd(3,'-').slice(0,3);
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const [{data,error},metaResult]=await Promise.all([
  LEADERBOARD.client.from('profiles').upsert({user_id:LEADERBOARD.user.id,display_initials:initials}).select('user_id,display_initials,created_at').maybeSingle(),
  LEADERBOARD.client.auth.updateUser({data:{display_initials:initials}})
 ]);
 LEADERBOARD.authBusy=0;
 if(error){
  setAccountNotice(`Could not save initials: ${error.message}`);
  syncAccountUi();
  return;
 }
 if(metaResult?.data?.user)LEADERBOARD.user=metaResult.data.user;
 LEADERBOARD.profile=data||{user_id:LEADERBOARD.user.id,display_initials:initials};
 setAccountNotice(`Saved display initials ${initials}.`);
 syncAccountUi();
}
async function resetTestPilotScores(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy||!isSignedInAsTestAccount())return;
 setAccountNotice('');
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.from('scores').delete().eq('user_id',LEADERBOARD.user.id);
 LEADERBOARD.authBusy=0;
 if(error){
  setAccountNotice(`Could not reset test pilot scores: ${error.message}`);
  syncAccountUi();
  return;
 }
 LEADERBOARD.remote.mine=[];
 LEADERBOARD.cacheStamp.mine=0;
 setLeaderboardStatus('Test pilot scores cleared');
 setAccountNotice('Cleared remote scores for the configured test pilot.');
 syncLeaderboardUi();
 refreshLeaderboard('all',{force:1});
 refreshLeaderboard('validated',{force:1});
 refreshLeaderboard('mine',{force:1});
}
async function initLeaderboard(){
 if(HARNESS_SUPABASE_BYPASS){
  LEADERBOARD.configured=0;
  setLeaderboardStatus('Harness mode · local scores only');
  syncLeaderboardBest();
  syncLeaderboardUi();
  return;
 }
 const supabaseFactory=window.supabase&&typeof window.supabase.createClient==='function'?window.supabase:null;
 LEADERBOARD.configured=!!(supabaseFactory&&SUPABASE_URL&&SUPABASE_ANON_KEY);
 if(!LEADERBOARD.configured){
  setLeaderboardStatus('Local fallback');
  syncLeaderboardBest();
  syncLeaderboardUi();
  return;
 }
 try{
  LEADERBOARD.client=supabaseFactory.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  hydrateLeaderboardCache('all');
  hydrateLeaderboardCache('validated');
  if(!remoteAuthEnabled()&&LEADERBOARD.view==='mine')LEADERBOARD.view='local';
  const hadAuthHash=remoteAuthEnabled()&&location.hash.includes('access_token=');
  const hadRecoveryHash=remoteAuthEnabled()&&location.hash.includes('type=recovery');
  if(remoteAuthEnabled()){
   const {data:{session}}=await LEADERBOARD.client.auth.getSession();
   LEADERBOARD.user=session?.user||null;
   if(RELEASE_CHANNEL==='production'&&isSignedInAsTestAccount()){
    await LEADERBOARD.client.auth.signOut();
    LEADERBOARD.user=null;
    setAccountNotice('The test pilot account is disabled in production.');
   }
   if(LEADERBOARD.user){
    hydrateLeaderboardCache('mine',LEADERBOARD.user.id);
    await loadOwnProfile();
    if(hadRecoveryHash)enterRecoveryMode();
   }
  }else{
   LEADERBOARD.user=null;
   LEADERBOARD.profile=null;
   LEADERBOARD.remote.mine=[];
   LEADERBOARD.cacheStamp.mine=0;
  }
  syncLeaderboardBest();
  if(hadAuthHash)history.replaceState({},document.title,location.pathname+location.search);
  if(!remoteWriteEnabled())setLeaderboardStatus(`Production scores ready · ${remoteLeaderboardPolicyLabel()}`);
  else setLeaderboardStatus(LEADERBOARD.user?'Shared leaderboard ready · signed in':'Shared leaderboard ready');
  syncLeaderboardUi();
  primeLeaderboard();
  scheduleLeaderboardRefresh();
  if(remoteAuthEnabled()){
  LEADERBOARD.client.auth.onAuthStateChange(async(event,sessionState)=>{
    LEADERBOARD.user=sessionState?.user||null;
    if(event==='PASSWORD_RECOVERY')LEADERBOARD.recoveryMode=1;
    else if(sessionState?.user)LEADERBOARD.recoveryMode=0;
    if(RELEASE_CHANNEL==='production'&&isSignedInAsTestAccount()){
     await LEADERBOARD.client.auth.signOut();
     LEADERBOARD.user=null;
     setAccountNotice('The test pilot account is disabled in production.');
    }
  if(LEADERBOARD.user){
    if(!LEADERBOARD.recoveryMode)setAccountNotice('');
    hydrateLeaderboardCache('mine',LEADERBOARD.user.id);
    await loadOwnProfile();
    await refreshSignedInPilotRecords(1);
   }
    else{
     LEADERBOARD.recoveryMode=0;
     setAccountNotice('');
     LEADERBOARD.profile=null;
     LEADERBOARD.remote.mine=[];
     LEADERBOARD.cacheStamp.mine=0;
     if(LEADERBOARD.view==='mine')LEADERBOARD.view='all';
    }
    syncLeaderboardBest();
    syncLeaderboardUi();
    primeLeaderboard();
    scheduleLeaderboardRefresh();
   });
  }
 }catch(err){
  LEADERBOARD.client=null;
  LEADERBOARD.configured=0;
  setLeaderboardStatus('Local fallback');
  syncLeaderboardBest();
  syncLeaderboardUi();
 }
}

for(const btn of leaderboardViewButtons){
 btn.addEventListener('click',()=>openLeaderboardPanel(btn.dataset.view||'all'));
}
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

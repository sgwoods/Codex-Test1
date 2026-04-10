// Shared leaderboard and pilot account UI/state helpers.

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
function currentLeaderboardTitle(view=LEADERBOARD.view){
 switch(view){
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
function attractLeaderboardViews(){
 return ['validated','local','all'];
}
function persistLeaderboardCache(view){
 if(view==='local')return;
 try{
  const payload=JSON.stringify({fetchedAt:LEADERBOARD.cacheStamp[view]||Date.now(),rows:LEADERBOARD.remote[view]||[]});
  localStorage.setItem(leaderboardCacheKey(view),payload);
  localStorage.setItem(platformLeaderboardCacheKey(view),payload);
 }catch{}
}
function hydrateLeaderboardCache(view,userId=LEADERBOARD.user?.id||'anon'){
 if(view==='local')return 0;
 try{
  const raw=localStorage.getItem(leaderboardCacheKey(view,userId))
   ||localStorage.getItem(platformLeaderboardCacheKey(view,userId))
   ||localStorage.getItem(legacyLeaderboardCacheKey(view,userId));
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
function leaderboardFilterTimestamp(){
 const raw=String(LEADERBOARD.filterAfterDate||'').trim();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return 0;
 const stamp=Date.parse(`${raw}T00:00:00`);
 return Number.isFinite(stamp)?stamp:0;
}
function leaderboardRowIncludedByDate(row){
 const threshold=leaderboardFilterTimestamp();
 if(!threshold)return true;
 const stamp=Date.parse(resolveRowTimestamp(row)||row?.at||'');
 return Number.isFinite(stamp)&&stamp>=threshold;
}
function formatLeaderboardRowMeta(row){
 const build=String(row?.build||'').trim()||'legacy';
 const stamp=resolveRowTimestamp(row)||row?.at||'';
 const parsed=Date.parse(stamp);
 const dateLabel=Number.isFinite(parsed)
  ? new Intl.DateTimeFormat(undefined,{month:'short',day:'2-digit',year:'2-digit'}).format(parsed)
  : '--';
 return { build, dateLabel };
}
function syncLeaderboardFilterUi(){
 if(leaderboardFilterAfterInput&&leaderboardFilterAfterInput.value!==String(LEADERBOARD.filterAfterDate||''))leaderboardFilterAfterInput.value=String(LEADERBOARD.filterAfterDate||'');
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
 syncLeaderboardFilterUi();
 const rows=leaderboardRowsForView(LEADERBOARD.view).filter(leaderboardRowIncludedByDate);
 if(!rows.length){
  leaderboardPanelTable.innerHTML=`<div id="leaderboardPanelEmpty">${LEADERBOARD.filterAfterDate?'No scores match the current date filter.':'No scores loaded for this view yet.'}</div>`;
  return;
 }
 const filled=rows.length?rows:Array.from({length:10},(_,i)=>({initials:'---',score:0,stage:0,idx:i+1,verified:0}));
 const limited=filled.slice(0,10);
 const body=[
  '<span class="scoreCellHead">NO</span>',
  '<span class="scoreCellHead">ID</span>',
  '<span class="scoreCellHead">BUILD/DATE</span>',
  '<span class="scoreCellHead" style="text-align:right">SCORE</span>',
  '<span class="scoreCellHead" style="text-align:right">STG</span>'
 ];
 for(let i=0;i<10;i++){
  const row=limited[i]||{initials:'---',score:0,stage:0,idx:i+1,verified:0};
  const meta=formatLeaderboardRowMeta(row);
  body.push(`<span class="scoreCell rank">${String((row.idx||i+1)).padStart(2,'0')}</span>`);
  body.push(`<span class="scoreCell initials">${row.initials}${row.verified?'<span class="verifiedMark">🔒</span>':''}</span>`);
  body.push(`<span class="scoreCell meta"><span class="scoreBuild">${meta.build}</span><span class="scoreDate">${meta.dateLabel}</span></span>`);
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
 closeDockOverlays('leaderboard');
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
 closeDockOverlays('account');
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
  else if(NON_PRODUCTION_LANE&&!signedIn)accountSummary.textContent=nonProductionAccountSummary();
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
 window.__platinumPilotHudHtml=`<span class="hudLabel">PILOT</span> <span class="hudValue">${hudInitials}</span>`;
 window.__auroraPilotHudHtml=window.__platinumPilotHudHtml;
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

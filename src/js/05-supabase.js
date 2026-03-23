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
const accountEmail=document.getElementById('accountEmail');
const accountPassword=document.getElementById('accountPassword');
const accountSignupBtn=document.getElementById('accountSignupBtn');
const accountLoginBtn=document.getElementById('accountLoginBtn');
const accountLogoutBtn=document.getElementById('accountLogoutBtn');
const accountInitials=document.getElementById('accountInitials');
const accountSaveInitialsBtn=document.getElementById('accountSaveInitialsBtn');
const accountSummary=document.getElementById('accountSummary');
const accountBest=document.getElementById('accountBest');
const accountRecent=document.getElementById('accountRecent');
const pilotStamp=document.getElementById('pilotStamp');
const SUPABASE_URL='{{SUPABASE_URL}}';
const SUPABASE_ANON_KEY='{{SUPABASE_ANON_KEY}}';
const HARNESS_SUPABASE_BYPASS=location.hostname==='127.0.0.1'&&!!readPref(SEED_PREF_KEY);
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
  lastRemoteOk:0,
  submitBusy:0,
 authBusy:0,
 primed:0,
 refreshTimer:0,
 panelOpen:0
};

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
 return sanitizeInitials(LEADERBOARD.profile?.display_initials||user?.user_metadata?.display_initials||'').slice(0,3);
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
 if(mode==='signed_out')return 'Sign in required · showing local';
 if(mode==='local')return 'Local device scores';
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
 const show=!!LEADERBOARD.panelOpen&&(!started||paused);
 leaderboardPanel.hidden=!show;
 leaderboardPanel.classList.toggle('visible',show);
}
function openLeaderboardPanel(view=LEADERBOARD.view){
 LEADERBOARD.panelOpen=1;
 if(view&&view!==LEADERBOARD.view)setLeaderboardView(view);
 else{
  renderLeaderboardPanel();
  syncLeaderboardPanelVisibility();
 }
}
function closeLeaderboardPanel(){
 LEADERBOARD.panelOpen=0;
 syncLeaderboardPanelVisibility();
}
function buildStartAccountPrompt(){
 const configured=!!LEADERBOARD.configured;
 const pending=LEADERBOARD.configured===null;
 const signedIn=!!LEADERBOARD.user;
 const verified=!!LEADERBOARD.user?.email_confirmed_at;
 const initials=preferredInitialsFromUser();
 if(pending)return 'CONNECTING ONLINE LEADERBOARD...';
 if(!configured)return 'LOCAL SCORES ACTIVE   ONLINE LEADERBOARD UNAVAILABLE';
 if(signedIn&&initials)return `SIGNED IN AS <span class="k">${initials}</span>${verified?' <span class="startBadge">🔒 VERIFIED</span>':''}`;
 if(signedIn)return `SIGNED IN${verified?' <span class="startBadge">🔒 VERIFIED</span>':''}`;
 return 'SIGN IN OR CREATE AN ACCOUNT FOR <span class="k">VALIDATED SCORES</span>';
}
function syncAccountUi(){
 const configured=!!LEADERBOARD.configured;
 const signedIn=!!LEADERBOARD.user;
 const verified=!!LEADERBOARD.user?.email_confirmed_at;
 const pending=LEADERBOARD.configured===null;
 if(accountSignupBtn)accountSignupBtn.disabled=!configured||LEADERBOARD.authBusy||signedIn;
 if(accountLoginBtn)accountLoginBtn.disabled=!configured||LEADERBOARD.authBusy||signedIn;
 if(accountLogoutBtn)accountLogoutBtn.disabled=!configured||LEADERBOARD.authBusy||!signedIn;
 if(accountSaveInitialsBtn)accountSaveInitialsBtn.disabled=!configured||LEADERBOARD.authBusy||!signedIn;
 if(accountEmail)accountEmail.disabled=!configured||pending||LEADERBOARD.authBusy||signedIn;
 if(accountPassword)accountPassword.disabled=!configured||pending||LEADERBOARD.authBusy||signedIn;
 if(accountInitials){
  accountInitials.disabled=!configured||pending||LEADERBOARD.authBusy||!signedIn;
  if(document.activeElement!==accountInitials)accountInitials.value=signedIn?preferredInitialsFromUser():'';
 }
 if(accountSummary){
  if(pending)accountSummary.textContent='Connecting leaderboard...';
  else if(!configured)accountSummary.textContent='Online leaderboard unavailable. Scores stay local.';
  else if(!signedIn)accountSummary.textContent='Not signed in. Anonymous scores still work.';
  else accountSummary.textContent=`Signed in as ${LEADERBOARD.user.email}${verified?' · verified':' · email not yet verified'}`;
 }
 const best=LEADERBOARD.remote.mine[0]?.score||0;
 if(accountBest)accountBest.textContent=signedIn?`Best: ${best?formatScore(best):'--'}`:'Best: --';
 if(accountRecent){
  if(!signedIn)accountRecent.textContent='Recent: --';
  else{
   const recent=LEADERBOARD.remote.mine.slice(0,3).map(row=>`${formatScore(row.score)} · STG ${String(row.stage).padStart(2,'0')}`).join('   /   ');
   accountRecent.textContent=`Recent: ${recent||'--'}`;
  }
 }
 if(pilotStamp){
  const initials=preferredInitialsFromUser();
  const show=signedIn&&initials;
  const verifiedClass=signedIn&&verified;
  pilotStamp.hidden=!show;
  pilotStamp.classList.toggle('verified',!!verifiedClass);
  pilotStamp.textContent=show?`Pilot ${initials}`:'Pilot ---';
 }
}
function syncLeaderboardUi(){
 const signedIn=!!LEADERBOARD.user;
 for(const btn of leaderboardViewButtons){
  const view=btn.dataset.view||'all';
  btn.classList.toggle('active',view===LEADERBOARD.view);
  btn.disabled=view==='mine'&&!signedIn;
 }
 if(leaderboardStatusEl)leaderboardStatusEl.textContent=LEADERBOARD.status;
 renderLeaderboardPanel();
 syncLeaderboardPanelVisibility();
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
 if(view==='mine'&&!LEADERBOARD.user){
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
 const next=['all','validated','local','mine'].includes(view)?view:'all';
 LEADERBOARD.view=next;
 LEADERBOARD.panelOpen=1;
 writePref(LEADERBOARD_PREF_KEY,next);
 if(next==='mine'&&!LEADERBOARD.user)setLeaderboardStatus(leaderboardStatusLabel(next,'signed_out'));
 else if(next==='local')setLeaderboardStatus(leaderboardStatusLabel(next,'local'));
 else if((LEADERBOARD.remote[next]||[]).length||LEADERBOARD.cacheStamp[next])setLeaderboardStatus(leaderboardCacheFresh(next)?leaderboardStatusLabel(next,'ready'):leaderboardStatusLabel(next,'cached'));
 syncLeaderboardUi();
 refreshLeaderboard(next,{silent:((LEADERBOARD.remote[next]||[]).length||LEADERBOARD.cacheStamp[next])?1:0,force:!leaderboardCacheFresh(next)});
}
async function prefetchLeaderboards(force=0){
 if(!LEADERBOARD.configured||!LEADERBOARD.client)return;
 const tasks=[refreshLeaderboard('all',{silent:1,force}),refreshLeaderboard('validated',{silent:1,force})];
 if(LEADERBOARD.user)tasks.push(refreshLeaderboard('mine',{silent:1,force}));
 await Promise.all(tasks);
 if(['all','validated','mine'].includes(LEADERBOARD.view))setLeaderboardStatus(leaderboardStatusLabel(LEADERBOARD.view,'ready'));
 syncLeaderboardUi();
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
 const {error}=await LEADERBOARD.client.from('scores').insert(payload);
 if(error){
  setLeaderboardStatus('Saved locally · online submit unavailable');
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
 submitScoreRemote(entry)
  .then(ok=>{gameOverState.remoteSubmitted=ok?1:0;})
  .catch(()=>{gameOverState.remoteSubmitted=0;})
  .finally(()=>{LEADERBOARD.submitBusy=0;});
}
function authRedirectUrl(){
 return `${location.origin}${location.pathname}`;
}
async function signUpAccount(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy)return;
 const email=String(accountEmail?.value||'').trim();
 const password=String(accountPassword?.value||'');
 const initials=sanitizeInitials(accountInitials?.value||'').slice(0,3);
 if(!email||!password){
  if(accountSummary)accountSummary.textContent='Enter an email and password first.';
  return;
 }
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
  if(accountSummary)accountSummary.textContent=`Signup failed: ${error.message}`;
  syncAccountUi();
  return;
 }
 if(accountSummary)accountSummary.textContent='Check your email to verify your account, then log in here.';
 syncAccountUi();
}
async function loginAccount(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy)return;
 const email=String(accountEmail?.value||'').trim();
 const password=String(accountPassword?.value||'');
 if(!email||!password){
  if(accountSummary)accountSummary.textContent='Enter your email and password first.';
  return;
 }
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.signInWithPassword({email,password});
 LEADERBOARD.authBusy=0;
 if(error){
  if(accountSummary)accountSummary.textContent=`Login failed: ${error.message}`;
  syncAccountUi();
  return;
 }
 if(accountPassword)accountPassword.value='';
 syncAccountUi();
}
async function logoutAccount(){
 if(!LEADERBOARD.client||LEADERBOARD.authBusy)return;
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.signOut();
 LEADERBOARD.authBusy=0;
 if(error&&accountSummary)accountSummary.textContent=`Logout failed: ${error.message}`;
 if(!error&&accountPassword)accountPassword.value='';
 syncAccountUi();
}
async function saveAccountInitials(){
 if(!LEADERBOARD.client||!LEADERBOARD.user||LEADERBOARD.authBusy)return;
 const initials=sanitizeInitials(accountInitials?.value||'').padEnd(3,'-').slice(0,3);
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const [{data,error},metaResult]=await Promise.all([
  LEADERBOARD.client.from('profiles').upsert({user_id:LEADERBOARD.user.id,display_initials:initials}).select('user_id,display_initials,created_at').maybeSingle(),
  LEADERBOARD.client.auth.updateUser({data:{display_initials:initials}})
 ]);
 LEADERBOARD.authBusy=0;
 if(error){
  if(accountSummary)accountSummary.textContent=`Could not save initials: ${error.message}`;
  syncAccountUi();
  return;
 }
 if(metaResult?.data?.user)LEADERBOARD.user=metaResult.data.user;
 LEADERBOARD.profile=data||{user_id:LEADERBOARD.user.id,display_initials:initials};
 if(accountSummary)accountSummary.textContent=`Saved display initials ${initials}.`;
 syncAccountUi();
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
  const hadAuthHash=location.hash.includes('access_token=');
  const {data:{session}}=await LEADERBOARD.client.auth.getSession();
  LEADERBOARD.user=session?.user||null;
  if(LEADERBOARD.user){
   hydrateLeaderboardCache('mine',LEADERBOARD.user.id);
   await loadOwnProfile();
  }
  syncLeaderboardBest();
  if(hadAuthHash)history.replaceState({},document.title,location.pathname+location.search);
  setLeaderboardStatus(LEADERBOARD.user?'Shared leaderboard ready · signed in':'Shared leaderboard ready');
  syncLeaderboardUi();
  primeLeaderboard();
  scheduleLeaderboardRefresh();
  LEADERBOARD.client.auth.onAuthStateChange(async(_event,sessionState)=>{
   LEADERBOARD.user=sessionState?.user||null;
   if(LEADERBOARD.user){
    hydrateLeaderboardCache('mine',LEADERBOARD.user.id);
    await loadOwnProfile();
   }
   else{
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
if(accountSignupBtn)accountSignupBtn.addEventListener('click',signUpAccount);
if(accountLoginBtn)accountLoginBtn.addEventListener('click',loginAccount);
if(accountLogoutBtn)accountLogoutBtn.addEventListener('click',logoutAccount);
if(accountSaveInitialsBtn)accountSaveInitialsBtn.addEventListener('click',saveAccountInitials);
syncLeaderboardUi();
initLeaderboard();

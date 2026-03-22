// Shared leaderboard and Supabase client integration.
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
const SUPABASE_URL='{{SUPABASE_URL}}';
const SUPABASE_ANON_KEY='{{SUPABASE_ANON_KEY}}';
const HARNESS_SUPABASE_BYPASS=location.hostname==='127.0.0.1'&&!!localStorage.getItem(SEED_PREF_KEY);
const LEADERBOARD={
 client:null,
 configured:null,
 view:(()=>{
  try{
   const raw=String(localStorage.getItem(LEADERBOARD_PREF_KEY)||'all').toLowerCase();
   return['all','validated','local','mine'].includes(raw)?raw:'all';
  }catch{return'all'}
 })(),
 status:'Connecting leaderboard...',
 remote:{all:[],validated:[],mine:[]},
 loading:{all:0,validated:0,mine:0},
 user:null,
 profile:null,
  lastRemoteOk:0,
  submitBusy:0,
 authBusy:0,
 primed:0
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
 if(view==='validated'&&LEADERBOARD.lastRemoteOk)return [];
 return localLeaderboardRows();
}
function setLeaderboardStatus(text){
 LEADERBOARD.status=String(text||'');
 if(leaderboardStatusEl)leaderboardStatusEl.textContent=LEADERBOARD.status;
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
  if(document.activeElement!==accountInitials)accountInitials.value=signedIn?sanitizeInitials(LEADERBOARD.profile?.display_initials||LEADERBOARD.user?.user_metadata?.display_initials||'').slice(0,3):'';
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
}
function syncLeaderboardUi(){
 const signedIn=!!LEADERBOARD.user;
 for(const btn of leaderboardViewButtons){
  const view=btn.dataset.view||'all';
  btn.classList.toggle('active',view===LEADERBOARD.view);
  btn.disabled=view==='mine'&&!signedIn;
 }
 if(leaderboardStatusEl)leaderboardStatusEl.textContent=LEADERBOARD.status;
 syncAccountUi();
}
function syncLeaderboardBest(){
 const localBest=localLeaderboardRows()[0]?.score||0;
 const remoteBest=LEADERBOARD.remote.all[0]?.score||0;
 S.best=Math.max(S.best||0,localBest,remoteBest);
 localStorage.galagaTribBest=S.best;
}
async function loadOwnProfile(){
 if(!LEADERBOARD.client||!LEADERBOARD.user){LEADERBOARD.profile=null;return null;}
 const {data}=await LEADERBOARD.client.from('profiles').select('user_id,display_initials,created_at').eq('user_id',LEADERBOARD.user.id).maybeSingle();
 LEADERBOARD.profile=data||null;
 syncAccountUi();
 return LEADERBOARD.profile;
}
async function refreshLeaderboard(view=LEADERBOARD.view){
 if(view==='local'){
  syncLeaderboardBest();
  setLeaderboardStatus('Local device scores');
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 if(!LEADERBOARD.configured||!LEADERBOARD.client){
  setLeaderboardStatus('Local fallback');
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 if(view==='mine'&&!LEADERBOARD.user){
  setLeaderboardStatus('Sign in required · showing local');
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 if(LEADERBOARD.loading[view])return leaderboardRowsForView(view);
 LEADERBOARD.loading[view]=1;
 setLeaderboardStatus(view==='validated'?'Loading validated scores...':view==='mine'?'Loading your scores...':'Loading shared scores...');
 syncLeaderboardUi();
 let query=LEADERBOARD.client.from('scores').select('id,initials,score,stage,achieved_at,is_verified').order('score',{ascending:false}).order('stage',{ascending:false}).limit(10);
 if(view==='validated')query=query.eq('is_verified',true);
 if(view==='mine')query=query.eq('user_id',LEADERBOARD.user.id);
 const {data,error}=await query;
 LEADERBOARD.loading[view]=0;
 if(error){
  setLeaderboardStatus(view==='mine'?'My Scores unavailable · showing local':'Remote unavailable · showing local');
  syncLeaderboardUi();
  return localLeaderboardRows();
 }
 LEADERBOARD.lastRemoteOk=1;
 LEADERBOARD.remote[view]=(data||[]).map(normalizeRemoteScoreRow);
 syncLeaderboardBest();
  setLeaderboardStatus(view==='validated'?'Validated leaderboard live':view==='mine'?'My scores live':view==='all'?'Shared leaderboard live':'Local device scores');
  syncLeaderboardUi();
  return LEADERBOARD.remote[view];
}
function setLeaderboardView(view){
 const next=['all','validated','local','mine'].includes(view)?view:'all';
 LEADERBOARD.view=next;
 localStorage.setItem(LEADERBOARD_PREF_KEY,next);
 if(next==='mine'&&!LEADERBOARD.user)setLeaderboardStatus('Sign in required · showing local');
 else if(next==='local')setLeaderboardStatus('Local device scores');
 syncLeaderboardUi();
 refreshLeaderboard(next);
}
function primeLeaderboard(){
 if(!LEADERBOARD.configured||!LEADERBOARD.client)return;
 if(started&&!paused)return;
 if(!LEADERBOARD.primed||LEADERBOARD.view==='all')refreshLeaderboard('all');
 if(!LEADERBOARD.primed||LEADERBOARD.view==='validated')refreshLeaderboard('validated');
 if(LEADERBOARD.user&&(!LEADERBOARD.primed||LEADERBOARD.view==='mine'))refreshLeaderboard('mine');
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
 refreshLeaderboard('all');
 if(payload.is_verified)refreshLeaderboard('validated');
 if(payload.user_id)refreshLeaderboard('mine');
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
 if(!email||!password){
  if(accountSummary)accountSummary.textContent='Enter an email and password first.';
  return;
 }
 LEADERBOARD.authBusy=1;
 syncAccountUi();
 const {error}=await LEADERBOARD.client.auth.signUp({email,password,options:{emailRedirectTo:authRedirectUrl()}});
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
 const {data,error}=await LEADERBOARD.client.from('profiles').upsert({user_id:LEADERBOARD.user.id,display_initials:initials}).select('user_id,display_initials,created_at').maybeSingle();
 LEADERBOARD.authBusy=0;
 if(error){
  if(accountSummary)accountSummary.textContent=`Could not save initials: ${error.message}`;
  syncAccountUi();
  return;
 }
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
  const hadAuthHash=location.hash.includes('access_token=');
  const {data:{session}}=await LEADERBOARD.client.auth.getSession();
  LEADERBOARD.user=session?.user||null;
  if(LEADERBOARD.user)await loadOwnProfile();
  if(hadAuthHash)history.replaceState({},document.title,location.pathname+location.search);
  setLeaderboardStatus(LEADERBOARD.user?'Shared leaderboard ready · signed in':'Shared leaderboard ready');
  syncLeaderboardUi();
  primeLeaderboard();
  LEADERBOARD.client.auth.onAuthStateChange(async(_event,sessionState)=>{
   LEADERBOARD.user=sessionState?.user||null;
   if(LEADERBOARD.user)await loadOwnProfile();
   else{
    LEADERBOARD.profile=null;
    LEADERBOARD.remote.mine=[];
    if(LEADERBOARD.view==='mine')LEADERBOARD.view='all';
   }
   syncLeaderboardUi();
   primeLeaderboard();
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
 btn.addEventListener('click',()=>setLeaderboardView(btn.dataset.view||'all'));
}
if(accountSignupBtn)accountSignupBtn.addEventListener('click',signUpAccount);
if(accountLoginBtn)accountLoginBtn.addEventListener('click',loginAccount);
if(accountLogoutBtn)accountLogoutBtn.addEventListener('click',logoutAccount);
if(accountSaveInitialsBtn)accountSaveInitialsBtn.addEventListener('click',saveAccountInitials);
syncLeaderboardUi();
initLeaderboard();

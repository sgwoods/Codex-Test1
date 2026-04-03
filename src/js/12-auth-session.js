// Shared account auth/session lifecycle and Supabase initialization helpers.
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
    }else{
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

// Shared platform service policy and transport helpers.

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
 if(window.__platinumHarnessForceRemoteWrite||window.__auroraHarnessForceRemoteWrite)return true;
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
function normalizeRemoteScoreRow(row){
 return{
  id:String(row?.id||''),
  initials:sanitizeInitials(row?.initials||'---').padEnd(3,'-').slice(0,3),
  score:+row?.score|0,
  stage:+row?.stage|0,
  at:String(row?.achieved_at||''),
  build:String(row?.build||''),
  verified:!!row?.is_verified
 };
}
function preferredInitialsFromUser(user=LEADERBOARD.user){
 return sanitizeInitials(LEADERBOARD.profile?.display_initials||user?.user_metadata?.display_initials||deriveInitialsFromEmail(user?.email||'')||'').slice(0,3);
}
function lockedPilotInitials(){
 if(!LEADERBOARD?.user)return '';
 return sanitizeInitials(pilotDisplayId()||'').slice(0,3);
}
function openMailFallback(subject,lines){
 const override=window.__platinumOpenMailFallbackOverride||window.__auroraOpenMailFallbackOverride;
 if(typeof override==='function'){
  override(subject,lines);
  return;
 }
 window.location.href=`mailto:${MODEM_FEATURE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
async function sendFeedbackDirect(fields){
 const response=await fetch(WEB3FORMS_ENDPOINT,{
  method:'POST',
  headers:{Accept:'application/json'},
  body:fields
 });
 const contentType=String(response.headers?.get?.('content-type')||'').toLowerCase();
 if(contentType.includes('application/json')){
  const data=await response.json().catch(()=>null);
  if(!response.ok||data?.success===false)throw new Error(data?.message||`HTTP ${response.status}`);
  return {ok:1,status:response.status,data};
 }
 const text=(await response.text().catch(()=>'' )).trim();
 if(!response.ok)throw new Error(text||`HTTP ${response.status}`);
 return {ok:1,status:response.status,data:null,text};
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

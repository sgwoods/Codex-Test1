// Shared remote leaderboard fetch, cache, and score-submit helpers.
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

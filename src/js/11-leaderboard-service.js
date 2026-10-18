// Shared remote leaderboard fetch, cache, and score-submit helpers.
async function loadOwnProfile(){
 if(!LEADERBOARD.client||!LEADERBOARD.user){LEADERBOARD.profile=null;return null;}
 const client=LEADERBOARD.client;
 const user=LEADERBOARD.user;
 const current=()=>LEADERBOARD.client===client&&LEADERBOARD.user?.id===user.id;
 let {data}=await client.from('profiles').select('user_id,display_initials,created_at').eq('user_id',user.id).maybeSingle();
 if(!current())return null;
 if(!data){
  const initials=preferredInitialsFromUser(user);
  if(initials){
   const seeded=await client.from('profiles').upsert({user_id:user.id,display_initials:initials}).select('user_id,display_initials,created_at').maybeSingle();
   if(!seeded.error)data=seeded.data||null;
  }
 }
 if(!current())return null;
 LEADERBOARD.profile=data||null;
 syncAccountUi();
 return LEADERBOARD.profile;
}
function scoreTableQuery(gameKey=currentScoreStorageGameKey()){
 if(gameKey==='aurora-galactica')return LEADERBOARD.client.from('scores');
 if(gameKey==='galaxy-guardians-preview')return LEADERBOARD.client.from('game_scores');
 throw new Error('Online scores are unavailable for this game.');
}
function ensureLeaderboardScope(){
 const scope=`${currentScoreStorageGameKey()}:${LEADERBOARD.user?.id||'anon'}`;
 if(LEADERBOARD.scope===scope&&LEADERBOARD.scopeClient===LEADERBOARD.client)return scope;
 LEADERBOARD.scopeClient=LEADERBOARD.client;
 LEADERBOARD.scope=scope;
 LEADERBOARD.remote={all:[],validated:[],mine:[]};
 LEADERBOARD.cacheStamp={all:0,validated:0,mine:0};
 LEADERBOARD.loading={all:0,validated:0,mine:0};
 LEADERBOARD.lastRemoteOk=0;
 return scope;
}
function buildLeaderboardScoresQuery(view='all',gameKey=currentScoreStorageGameKey()){
 const select='id,initials,score,stage,achieved_at,is_verified,build,game_key,game_title';
 let query=scoreTableQuery(gameKey).select(select).eq('game_key',gameKey).order('score',{ascending:false}).order('stage',{ascending:false}).limit(10);
 if(view==='validated')query=query.eq('is_verified',true);
 if(shouldHideTestAccountScores()&&view!=='mine'){
  const hiddenIds=configuredTestAccountUserIds();
  if(hiddenIds.length===1)query=query.neq('user_id',hiddenIds[0]);
  else query=query.not('user_id','in',`(${hiddenIds.join(',')})`);
 }
 if(view==='mine')query=query.eq('user_id',LEADERBOARD.user.id);
 return query;
}
async function fetchLeaderboardScores(view='all'){
 return buildLeaderboardScoresQuery(view);
}
async function refreshLeaderboard(view=LEADERBOARD.view,{silent=0,force=0}={}){
 const scope=ensureLeaderboardScope();
 const client=LEADERBOARD.client;
 const userId=LEADERBOARD.user?.id;
 const gameKey=currentScoreStorageGameKey();
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
 const request={};
 LEADERBOARD.loading[view]=request;
 if(!silent)setLeaderboardStatus(leaderboardStatusLabel(view,'loading'));
 syncLeaderboardUi();
 let result;
 try{result=await fetchLeaderboardScores(view);}
 catch(error){result={error};}
 if(client!==LEADERBOARD.client||userId!==LEADERBOARD.user?.id||gameKey!==currentScoreStorageGameKey()||scope!==LEADERBOARD.scope||LEADERBOARD.loading[view]!==request)return [];
 const {data,error}=result;
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
 const board=loadScoreboard(gameOverState.gameKey||currentScoreStorageGameKey());
 const localRow=board.find(row=>row.id===gameOverState.entryId);
 if(localRow)return Object.assign({},localRow);
 return{
  id:String(gameOverState.entryId||''),
  initials:sanitizeInitials(gameOverState.initials?.join('')||'YOU').padEnd(3,'-').slice(0,3),
  score:+gameOverState.score|0,
  stage:+gameOverState.stage|0,
  at:new Date().toISOString(),
  gameKey:typeof normalizeScoreRecordGameKey==='function'
   ? normalizeScoreRecordGameKey(gameOverState.gameKey||currentScoreStorageGameKey())
   : String(gameOverState.gameKey||'aurora-galactica').trim()||'aurora-galactica',
  gameTitle:typeof scoreGameTitleForKey==='function'
   ? scoreGameTitleForKey(gameOverState.gameKey||currentScoreStorageGameKey(),gameOverState.gameTitle||'')
   : String(gameOverState.gameTitle||'').trim()
 };
}
async function submitScoreRemote(entry){
 if(!entry||!LEADERBOARD.configured||!LEADERBOARD.client)return 0;
 const gameKey=typeof normalizeScoreRecordGameKey==='function'
  ? normalizeScoreRecordGameKey(entry.gameKey||currentScoreStorageGameKey())
  : String(entry.gameKey||'aurora-galactica').trim()||'aurora-galactica';
 const gameTitle=typeof scoreGameTitleForKey==='function'
  ? scoreGameTitleForKey(gameKey,entry.gameTitle||'')
  : String(entry.gameTitle||'').trim();
 if(!remoteWriteEnabled()){
  setLeaderboardStatus('Saved locally · production submit disabled in this lane');
  syncLeaderboardUi();
  if(typeof recordSystemIssue==='function'){
   recordSystemIssue('score_submit_blocked','Remote score submit blocked by lane policy',{
    score:+entry.score|0,
    stage:+entry.stage|0,
    initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
    releaseChannel:RELEASE_CHANNEL,
    gameKey,
    gameTitle
   },{level:'info'});
  }
  return 0;
 }
 if(typeof scoreGameSupportsSharedRemote==='function'&&!scoreGameSupportsSharedRemote(gameKey)){
  setLeaderboardStatus(`Saved locally · ${gameTitle} online scores stay local until the shared schema is game-owned`);
  syncLeaderboardUi();
  if(typeof recordSystemIssue==='function'){
   recordSystemIssue('score_submit_blocked','Remote score submit blocked until game-owned leaderboard schema exists',{
    score:+entry.score|0,
    stage:+entry.stage|0,
    initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
    releaseChannel:RELEASE_CHANNEL,
    gameKey,
    gameTitle
   },{level:'info'});
  }
  return 0;
 }
 const payload={
  game_key:gameKey,
  game_title:gameTitle,
  initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
  score:+entry.score|0,
  stage:+entry.stage|0,
  build:BUILD
 };
 if(LEADERBOARD.user?.id){
  payload.user_id=LEADERBOARD.user.id;
  // Account ownership does not establish gameplay validity.
  payload.is_verified=false;
 }
 if(typeof recordSystemIssue==='function'){
  recordSystemIssue('score_submit_attempt','Attempting remote score submit',{
   score:payload.score,
   stage:payload.stage,
   initials:payload.initials,
   verified:!!payload.is_verified,
   userId:payload.user_id||'',
   gameKey,
   gameTitle
  },{level:'info'});
 }
 try{
  const {error}=await scoreTableQuery(gameKey).insert(payload);
  if(error){
   const failureCopy=typeof remoteScoreFailureCopy==='function'
    ? remoteScoreFailureCopy(gameTitle)
    : {
      summary:'Online score save failed',
      description:'A signed-in score was saved locally but could not be written to the online leaderboard.',
      prompt:'Online score save failed. Please submit a bug report.'
     };
   if(typeof recordSystemIssue==='function'){
    recordSystemIssue('score_submit_failed',String(error.message||error)||'Remote score insert failed',{
     score:payload.score,
     stage:payload.stage,
     initials:payload.initials,
     verified:!!payload.is_verified,
     userId:payload.user_id||'',
     gameKey,
     gameTitle
    },{
     level:'error',
     suggestBugReport:1,
     summary:failureCopy.summary,
     description:failureCopy.description,
     prompt:failureCopy.prompt
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
    userId:payload.user_id||'',
    gameKey,
    gameTitle
   },{level:'info'});
 }
}catch(err){
  const failureCopy=typeof remoteScoreFailureCopy==='function'
   ? remoteScoreFailureCopy(gameTitle)
   : {
     summary:'Online score save failed',
     description:'A signed-in score was saved locally but could not be written to the online leaderboard.',
     prompt:'Online score save failed. Please submit a bug report.'
    };
  if(typeof recordSystemIssue==='function'){
    recordSystemIssue('score_submit_failed',String(err?.message||err||'Remote score submit threw unexpectedly'),{
     score:payload.score,
     stage:payload.stage,
     initials:payload.initials,
     verified:!!payload.is_verified,
     userId:payload.user_id||'',
     gameKey,
     gameTitle
    },{
    level:'error',
    suggestBugReport:1,
    summary:failureCopy.summary,
    description:failureCopy.description,
    prompt:failureCopy.prompt
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
 const targetState=gameOverState;
 const entry=resolveGameOverScoreEntry();
 if(!entry)return;
 targetState.remoteSubmitted='pending';
 LEADERBOARD.submitBusy=1;
 if(typeof recordSystemIssue==='function'){
  const gameKey=typeof normalizeScoreRecordGameKey==='function'
   ? normalizeScoreRecordGameKey(entry.gameKey||currentScoreStorageGameKey())
   : String(entry.gameKey||'aurora-galactica').trim()||'aurora-galactica';
  recordSystemIssue('score_submit_queued','Queued game-over score for remote submit',{
   score:+entry.score|0,
   stage:+entry.stage|0,
   initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
   gameKey,
   gameTitle:typeof scoreGameTitleForKey==='function'?scoreGameTitleForKey(gameKey,entry.gameTitle||''):String(entry.gameTitle||'').trim()
  },{level:'info'});
 }
 submitScoreRemote(entry)
  .then(ok=>{targetState.remoteSubmitted=ok?1:0;})
  .catch(err=>{
   targetState.remoteSubmitted=0;
   const gameKey=typeof normalizeScoreRecordGameKey==='function'
    ? normalizeScoreRecordGameKey(entry.gameKey||currentScoreStorageGameKey())
    : String(entry.gameKey||'aurora-galactica').trim()||'aurora-galactica';
   const gameTitle=typeof scoreGameTitleForKey==='function'
    ? scoreGameTitleForKey(gameKey,entry.gameTitle||'')
    : String(entry.gameTitle||'').trim();
   const failureCopy=typeof remoteScoreFailureCopy==='function'
    ? remoteScoreFailureCopy(gameTitle)
    : {
      summary:'Online score save failed',
      description:'A signed-in score was saved locally but the online leaderboard submit rejected unexpectedly.',
      prompt:'Online score save failed. Please submit a bug report.'
     };
   if(typeof recordSystemIssue==='function'){
    recordSystemIssue('score_submit_failed',String(err?.message||err||'Remote score submit promise rejected'),{
     score:+entry.score|0,
     stage:+entry.stage|0,
     initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
     gameKey,
     gameTitle
    },{
     level:'error',
     suggestBugReport:1,
     summary:failureCopy.summary,
     description:failureCopy.description,
     prompt:failureCopy.prompt
    });
   }
  })
  .finally(()=>{LEADERBOARD.submitBusy=0;});
}

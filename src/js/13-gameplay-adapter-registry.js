// Platinum gameplay adapter registry. Packs become playable only through an
// owned adapter or an explicitly non-production preview adapter.

let AURORA_GAMEPLAY_ADAPTER_STATE=null;

function auroraGameplayAdapterState(){
 return AURORA_GAMEPLAY_ADAPTER_STATE||currentAuroraRuntimeState();
}

function createAuroraGameplayAdapterState(opts={}){
 const previous=auroraGameplayAdapterState();
 const state=createAuroraRuntimeState(Object.assign({
  best:previous?.best
 },opts));
 AURORA_GAMEPLAY_ADAPTER_STATE=state;
 setActiveAuroraRuntimeState(state);
 return state;
}

function startAuroraGameplayAdapter(cfg={}){
 const trial=cfg.challengeScheduleTrial;
 if(trial!==undefined){
  const channel=typeof BUILD_INFO!=='undefined'?String(BUILD_INFO.releaseChannel||'').toLowerCase():'';
  const launch=window.__platinumHarnessLaunchCfg;
  const offsets=trial?.groupSpawnOffsets;
  if(channel!=='development'||launch?.challengeScheduleTrial!==trial||
   trial?.stage!==31||cfg.stage!==31||cfg.stageMode!=='display'||cfg.startKind!=='challenge'||cfg.challengeStage!==8||
   !Array.isArray(offsets)||offsets.length!==5||offsets.some(value=>!Number.isFinite(value)||value<0||value>30)){
   throw new Error('Challenge schedule trial requires a valid development harness Stage 31 launch.');
  }
 }
 const state=createAuroraGameplayAdapterState();
 if(trial)state.harnessChallengeLayoutOverride={stage:31,layout:{groupSpawnOffsets:[...trial.groupSpawnOffsets]}};
 try{
  const result=startAuroraGameplay(state);
  if(trial)state.harnessChallengeLayoutSnapshot=currentGamePackChallengeLayout(state.stage);
  return result;
 }
 finally{
  if(trial)state.harnessChallengeLayoutOverride=null;
 }
}

function updateAuroraGameplayAdapter(dt,input={}){
 let state=AURORA_GAMEPLAY_ADAPTER_STATE;
 if(!isAuroraRuntimeState(state)){
  state=isAuroraRuntimeState(currentAuroraRuntimeState())?currentAuroraRuntimeState():createAuroraGameplayAdapterState();
  AURORA_GAMEPLAY_ADAPTER_STATE=state;
 }
 return stepAuroraRuntime(state,dt,input);
}

function snapshotAuroraGameplayAdapter(){
 const state=auroraGameplayAdapterState();
 return isAuroraRuntimeState(state)?snapshot(state):null;
}

const AURORA_GAMEPLAY_ADAPTER=Object.freeze({
 gameKey:AURORA_GAME_PACK.metadata.gameKey,
 label:'Aurora Galactica gameplay',
 start:startAuroraGameplayAdapter,
 update:updateAuroraGameplayAdapter,
 snapshot:snapshotAuroraGameplayAdapter
});

const GAMEPLAY_ADAPTER_REGISTRY=Object.freeze({
 [AURORA_GAMEPLAY_ADAPTER.gameKey]:AURORA_GAMEPLAY_ADAPTER
});

const GAMEPLAY_ADAPTER_SKELETON_REGISTRY=Object.freeze({
 [GALAXY_GUARDIANS_GAMEPLAY_ADAPTER_SKELETON.gameKey]:GALAXY_GUARDIANS_GAMEPLAY_ADAPTER_SKELETON
});

const DEV_PREVIEW_GAMEPLAY_ADAPTER_REGISTRY=Object.freeze({
 [GALAXY_GUARDIANS_DEV_PREVIEW_ADAPTER.gameKey]:GALAXY_GUARDIANS_DEV_PREVIEW_ADAPTER
});

function gameplayAdapterKey(packOrKey=currentGamePack()){
 if(typeof packOrKey==='string')return packOrKey;
 return packOrKey?.metadata?.gameKey||DEFAULT_GAME_PACK_KEY;
}

function availableGameplayAdapters(){
 return GAMEPLAY_ADAPTER_REGISTRY;
}

function availableGameplayAdapterSkeletons(){
 return GAMEPLAY_ADAPTER_SKELETON_REGISTRY;
}

function availableDevPreviewGameplayAdapters(){
 return DEV_PREVIEW_GAMEPLAY_ADAPTER_REGISTRY;
}

function getGameplayAdapter(packOrKey=currentGamePack()){
 const key=gameplayAdapterKey(packOrKey);
 return GAMEPLAY_ADAPTER_REGISTRY[key]||null;
}

function getGameplayAdapterSkeleton(packOrKey=currentGamePack()){
 const key=gameplayAdapterKey(packOrKey);
 return GAMEPLAY_ADAPTER_SKELETON_REGISTRY[key]||null;
}

function getDevPreviewGameplayAdapter(packOrKey=currentGamePack()){
 const key=gameplayAdapterKey(packOrKey);
 const adapter=DEV_PREVIEW_GAMEPLAY_ADAPTER_REGISTRY[key]||null;
 if(!adapter||!adapter.enabled||typeof adapter.start!=='function')return null;
 if(!(adapter.previewOnly||adapter.devOnly))return null;
 const channel=typeof BUILD_INFO!=='undefined'
  ? String(BUILD_INFO.releaseChannel||'development').toLowerCase()
  : 'development';
 const allowedChannels=Array.isArray(adapter.allowedReleaseChannels)&&adapter.allowedReleaseChannels.length
  ? adapter.allowedReleaseChannels.map(value=>String(value).toLowerCase())
  : ['development'];
 return allowedChannels.includes(channel)?adapter:null;
}

function currentGameplayAdapter(){
 return getGameplayAdapter(currentGamePackKey());
}

function currentDevPreviewGameplayAdapter(){
 return getDevPreviewGameplayAdapter(currentGamePackKey());
}

function gamePackHasPlayableAdapter(packOrKey=currentGamePack()){
 const pack=typeof packOrKey==='string'?getGamePack(packOrKey):packOrKey;
 const adapter=getGameplayAdapter(pack);
 return !!(packIsPlayable(pack)&&adapter&&typeof adapter.start==='function');
}

function currentGamePackHasPlayableAdapter(){
 return gamePackHasPlayableAdapter(currentGamePack());
}

function gamePackHasDevPreviewAdapter(packOrKey=currentGamePack()){
 return !!getDevPreviewGameplayAdapter(packOrKey);
}

function currentGamePackHasDevPreviewAdapter(){
 return gamePackHasDevPreviewAdapter(currentGamePack());
}

function currentGamePackCanStart(){
 return currentGamePackHasPlayableAdapter()||currentGamePackHasDevPreviewAdapter();
}

function firstPlayableGamePackWithAdapter(){
 return Object.values(availableGamePacks()).find(pack=>gamePackHasPlayableAdapter(pack))||null;
}

function startActiveGamePack(cfg={}){
 const adapter=currentGameplayAdapter();
 const devPreviewAdapter=currentDevPreviewGameplayAdapter();
 if(currentGamePackHasPlayableAdapter()){
  return adapter.start(cfg);
 }
 if(devPreviewAdapter){
  return devPreviewAdapter.start(cfg);
 }
 if(!currentGamePackHasPlayableAdapter()){
  const preview=typeof currentGamePackPreview==='function'?currentGamePackPreview():null;
  const fallback=firstPlayableGamePackWithAdapter();
  if(fallback&&fallback.metadata?.gameKey!==currentGamePackKey()){
   installGamePack(fallback.metadata.gameKey,{persist:1});
  }
  if(typeof closeGamePreview==='function')closeGamePreview(1);
  if(typeof draw==='function')draw();
  showToast(preview?.launchFallbackToast||'Selected game does not have a playable adapter in this build.');
  return false;
 }
 return false;
}

function updateActiveGamePack(dt){
 const adapter=currentGameplayAdapter();
 const devPreviewAdapter=currentDevPreviewGameplayAdapter();
 if(currentGamePackHasPlayableAdapter()&&adapter&&typeof adapter.update==='function')return adapter.update(dt);
 if(devPreviewAdapter&&typeof devPreviewAdapter.update==='function')return devPreviewAdapter.update(dt);
 return null;
}

function start(cfg={}){
 return startActiveGamePack(cfg);
}

window.availableGameplayAdapters=availableGameplayAdapters;
window.availableGameplayAdapterSkeletons=availableGameplayAdapterSkeletons;
window.availableDevPreviewGameplayAdapters=availableDevPreviewGameplayAdapters;
window.getGameplayAdapter=getGameplayAdapter;
window.getGameplayAdapterSkeleton=getGameplayAdapterSkeleton;
window.getDevPreviewGameplayAdapter=getDevPreviewGameplayAdapter;
window.currentGameplayAdapter=currentGameplayAdapter;
window.currentDevPreviewGameplayAdapter=currentDevPreviewGameplayAdapter;
window.gamePackHasPlayableAdapter=gamePackHasPlayableAdapter;
window.currentGamePackHasPlayableAdapter=currentGamePackHasPlayableAdapter;
window.gamePackHasDevPreviewAdapter=gamePackHasDevPreviewAdapter;
window.currentGamePackHasDevPreviewAdapter=currentGamePackHasDevPreviewAdapter;
window.currentGamePackCanStart=currentGamePackCanStart;
window.firstPlayableGamePackWithAdapter=firstPlayableGamePackWithAdapter;
window.startActiveGamePack=startActiveGamePack;
window.updateActiveGamePack=updateActiveGamePack;
window.auroraGameplayAdapterState=auroraGameplayAdapterState;

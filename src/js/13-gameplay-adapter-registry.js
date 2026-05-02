// Platinum gameplay adapter registry. Packs become playable only through an owned adapter.

const AURORA_GAMEPLAY_ADAPTER=Object.freeze({
 gameKey:AURORA_GAME_PACK.metadata.gameKey,
 label:'Aurora Galactica gameplay',
 start:startAuroraGameplay
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

function developmentGameplayPreviewAllowed(){
 return typeof BUILD_INFO!=='undefined'
  && String(BUILD_INFO.releaseChannel||'development').toLowerCase()==='development';
}

function getDevPreviewGameplayAdapter(packOrKey=currentGamePack()){
 if(!developmentGameplayPreviewAllowed())return null;
 const key=gameplayAdapterKey(packOrKey);
 const adapter=DEV_PREVIEW_GAMEPLAY_ADAPTER_REGISTRY[key]||null;
 return adapter&&adapter.enabled&&adapter.devOnly&&typeof adapter.start==='function'?adapter:null;
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

function startActiveGamePack(){
 const adapter=currentGameplayAdapter();
 const devPreviewAdapter=currentDevPreviewGameplayAdapter();
 if(currentGamePackHasPlayableAdapter()){
  return adapter.start();
 }
 if(devPreviewAdapter){
  return devPreviewAdapter.start();
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

function start(){
 return startActiveGamePack();
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

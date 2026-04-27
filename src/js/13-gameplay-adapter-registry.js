// Platinum gameplay adapter registry. Packs become playable only through an owned adapter.

const AURORA_GAMEPLAY_ADAPTER=Object.freeze({
 gameKey:AURORA_GAME_PACK.metadata.gameKey,
 label:'Aurora Galactica gameplay',
 start:startAuroraGameplay
});

const GAMEPLAY_ADAPTER_REGISTRY=Object.freeze({
 [AURORA_GAMEPLAY_ADAPTER.gameKey]:AURORA_GAMEPLAY_ADAPTER
});

function gameplayAdapterKey(packOrKey=currentGamePack()){
 if(typeof packOrKey==='string')return packOrKey;
 return packOrKey?.metadata?.gameKey||DEFAULT_GAME_PACK_KEY;
}

function availableGameplayAdapters(){
 return GAMEPLAY_ADAPTER_REGISTRY;
}

function getGameplayAdapter(packOrKey=currentGamePack()){
 const key=gameplayAdapterKey(packOrKey);
 return GAMEPLAY_ADAPTER_REGISTRY[key]||null;
}

function currentGameplayAdapter(){
 return getGameplayAdapter(currentGamePackKey());
}

function gamePackHasPlayableAdapter(packOrKey=currentGamePack()){
 const pack=typeof packOrKey==='string'?getGamePack(packOrKey):packOrKey;
 const adapter=getGameplayAdapter(pack);
 return !!(packIsPlayable(pack)&&adapter&&typeof adapter.start==='function');
}

function currentGamePackHasPlayableAdapter(){
 return gamePackHasPlayableAdapter(currentGamePack());
}

function firstPlayableGamePackWithAdapter(){
 return Object.values(availableGamePacks()).find(pack=>gamePackHasPlayableAdapter(pack))||null;
}

function startActiveGamePack(){
 const adapter=currentGameplayAdapter();
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
 return adapter.start();
}

function start(){
 return startActiveGamePack();
}

window.availableGameplayAdapters=availableGameplayAdapters;
window.getGameplayAdapter=getGameplayAdapter;
window.currentGameplayAdapter=currentGameplayAdapter;
window.gamePackHasPlayableAdapter=gamePackHasPlayableAdapter;
window.currentGamePackHasPlayableAdapter=currentGamePackHasPlayableAdapter;
window.firstPlayableGamePackWithAdapter=firstPlayableGamePackWithAdapter;
window.startActiveGamePack=startActiveGamePack;

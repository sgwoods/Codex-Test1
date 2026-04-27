// Shared game-picker shell surface for selecting installed packs.

function describePackCaps(pack){
 const caps=pack?.capabilities||{};
 const labels=[];
 if(caps.usesFormationRack)labels.push('formation');
 if(caps.usesIndependentDiveAttacks)labels.push('dives');
 if(caps.usesEscortPatterns)labels.push('escort');
 if(caps.usesCaptureRescue)labels.push('capture');
 if(caps.usesChallengeStages)labels.push('challenge');
 if(caps.usesDualFighterMode)labels.push('dual');
 if(caps.usesStaticShields)labels.push('shields');
 return labels.slice(0,4);
}

function syncGamePickerDock(){
 if(!gamePickerDockBtn)return;
 const active=!!gamePickerOpen;
 gamePickerDockBtn.classList.toggle('open',active);
 gamePickerDockBtn.classList.toggle('active',active);
 gamePickerDockBtn.setAttribute('aria-expanded',active?'true':'false');
 if(gamePickerDockStatus){
  gamePickerDockStatus.textContent='';
 }
}

function renderShellThemeOptions(){
 if(typeof currentGamePackShellThemes!=='function'||typeof currentGamePackSelectedShellTheme!=='function')return '';
 const themes=currentGamePackShellThemes();
 const activeTheme=currentGamePackSelectedShellTheme();
 if(!themes.length)return '';
 return `<div class="gamePickerThemeGroup"><span class="gamePickerThemeLabel">Shell Theme</span><div class="gamePickerThemeOptions">${themes.map(theme=>`<button class="gamePickerThemeBtn${theme.id===activeTheme?.id?' isSelected':''}" data-theme-id="${theme.id}">${theme.label}</button>`).join('')}</div></div>`;
}

function renderGamePicker(){
 if(!gamePickerList||!gamePickerCurrent||!gamePickerStatus||typeof availableGamePacks!=='function')return;
 const packs=Object.values(availableGamePacks());
 const activeKey=typeof currentGamePackKey==='function'?currentGamePackKey():'';
  const activePack=typeof currentGamePack==='function'?currentGamePack():null;
  const activeTheme=typeof currentGamePackSelectedShellTheme==='function'?currentGamePackSelectedShellTheme():null;
 gamePickerCurrent.innerHTML=`<strong>Current Cabinet</strong><span>${activePack?.metadata?.title||'Platinum'}</span><span>Shell theme: ${activeTheme?.label||'Default'}${started?' • finish the current run before switching':''
 }</span>${renderShellThemeOptions()}`;
 gamePickerList.innerHTML=packs.map(pack=>{
  const isActive=pack.metadata?.gameKey===activeKey;
  const caps=describePackCaps(pack);
  const flagHtml=caps.length?`<div class="gamePickerCardFlags">${caps.map(label=>`<span class="gamePickerFlag">${label}</span>`).join('')}</div>`:'';
  const playable=pack.metadata?.playable!==0&&pack.metadata?.playable!==false;
  const actionLabel=isActive?'Selected':(playable?'Select Game':'Preview Sneak Peek');
  const previewLine=pack.preview?.cardLine||'Shell preview only while gameplay integration is still in progress';
  const disabled=isActive?' disabled':'';
  const selectedTheme=typeof selectedShellThemeForPack==='function'?selectedShellThemeForPack(pack,pack.metadata?.gameKey||''):null;
  return `<div class="gamePickerCard${isActive?' isActive':''}"><span class="gamePickerCardTitle">${pack.metadata?.title||pack.metadata?.gameKey||'Game Pack'}</span><span class="gamePickerCardMeta">${pack.frontDoor?.featureLine||'Platform pack preview'}</span><span class="gamePickerCardMeta">${playable?'Playable in the current runtime':previewLine}</span><span class="gamePickerCardMeta">Preferred shell theme: ${selectedTheme?.label||'Default'}</span>${flagHtml}<button class="gamePickerCardAction" data-pack-key="${pack.metadata?.gameKey||''}"${disabled}>${actionLabel}</button></div>`;
 }).join('');
 gamePickerStatus.textContent=started
  ? 'Finish the current run before switching to a different game pack.'
  : 'Selecting a pack updates the marquee, frame treatment, and front-door shell immediately.';
 syncGamePickerDock();
}

function openGamePicker(force=0){
 if(!gamePickerModal)return;
 if(gamePickerOpen&&!force)return;
 closeDockOverlays('gamePicker');
 gamePickerOpen=1;
 gamePickerPrevPaused=paused;
 if(started)paused=1;
 renderGamePicker();
 gamePickerModal.classList.add('open');
 gamePickerModal.setAttribute('aria-hidden','false');
 syncGamePickerDock();
 if(typeof syncPauseUi==='function')syncPauseUi();
}

function closeGamePicker(force=0){
 if(!gamePickerModal)return;
 if(!gamePickerOpen&&!force)return;
 gamePickerOpen=0;
 if(started)paused=gamePickerPrevPaused;
 gamePickerModal.classList.remove('open');
 gamePickerModal.setAttribute('aria-hidden','true');
 syncGamePickerDock();
 if(typeof syncPauseUi==='function')syncPauseUi();
}

function chooseGamePack(key=''){
 if(!key||typeof getGamePack!=='function')return;
 if(started&&key!==currentGamePackKey()){
  if(gamePickerStatus)gamePickerStatus.textContent='Finish the current run before switching games.';
  showToast('Finish the current run before switching games.');
  return;
 }
 const nextPack=getGamePack(key);
 const playable=typeof gamePackHasPlayableAdapter==='function'
  ? gamePackHasPlayableAdapter(nextPack)
  : (typeof packIsPlayable==='function'?packIsPlayable(nextPack):(nextPack?.metadata?.playable!==0&&nextPack?.metadata?.playable!==false));
 installGamePack(key,{persist:playable?1:0});
 if(!started&&typeof draw==='function')draw();
 renderGamePicker();
 const canStart=typeof currentGamePackHasPlayableAdapter==='function'?currentGamePackHasPlayableAdapter():currentGamePackPlayable();
 if(!canStart){
  closeGamePicker(1);
  if(typeof openGamePreview==='function')openGamePreview();
 }else{
  closeGamePicker(1);
  showToast(`${currentGamePack().metadata?.title||'Game pack'} selected.`);
 }
}

function chooseCurrentPackTheme(themeId=''){
 if(!themeId||typeof setCurrentGamePackShellTheme!=='function')return;
 const applied=setCurrentGamePackShellTheme(themeId);
 if(!applied)return;
 if(!started&&typeof draw==='function')draw();
 renderGamePicker();
 showToast(`Shell theme: ${applied.label}`);
}

if(gamePickerDockBtn)gamePickerDockBtn.addEventListener('click',e=>{
 e.stopPropagation();
 if(gamePickerOpen)closeGamePicker();
 else openGamePicker();
});
if(gamePickerClose)gamePickerClose.addEventListener('click',()=>closeGamePicker());
if(gamePickerModal)gamePickerModal.addEventListener('click',e=>{if(e.target===gamePickerModal)closeGamePicker();});
if(gamePickerPanel)gamePickerPanel.addEventListener('click',e=>e.stopPropagation());
if(gamePickerList)gamePickerList.addEventListener('click',e=>{
 const btn=e.target.closest('[data-pack-key]');
 if(!btn)return;
 chooseGamePack(btn.dataset.packKey||'');
});
if(gamePickerCurrent)gamePickerCurrent.addEventListener('click',e=>{
 const btn=e.target.closest('[data-theme-id]');
 if(!btn)return;
 chooseCurrentPackTheme(btn.dataset.themeId||'');
});
renderGamePicker();
window.openGamePicker=openGamePicker;
window.closeGamePicker=closeGamePicker;

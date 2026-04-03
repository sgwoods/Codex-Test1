// Shared cabinet shell layout, board messages, and overlay positioning.
const playfieldFrame=document.getElementById('playfieldFrame');
const renderHelpModal=document.getElementById('helpModal');
const renderHelpPanel=document.getElementById('helpPanel');
const renderFeedbackModal=document.getElementById('feedbackModal');
const renderFeedbackPanel=document.getElementById('feedbackPanel');
const renderSettingsPanel=document.getElementById('settingsPanel');

const DISPLAY_SHELL=Object.freeze({
 hudInsetX:12,
 hudInsetTop:6,
 hudInsetBottom:38,
 hudMinWidth:220,
 frameOuterInset:2,
 frameInnerInset:11,
 stageBadgeRight:12,
 stageBadgeBottom:12,
 stageBadgeGap:9,
 reserveLeft:12,
 reserveBottom:8,
 stageLabelGap:5
});

function applyStageChromeTheme(){
 const theme=currentGamePackFrameAccentTheme(S.stagePresentation);
 const root=document.documentElement;
 if(root){
  root.style.setProperty('--shell-line',theme.shellLine);
  root.style.setProperty('--shell-glow',theme.shellGlow);
  root.style.setProperty('--frame-line',theme.frameLine);
  root.style.setProperty('--frame-glow',theme.frameGlow);
  root.style.setProperty('--marquee-border',theme.marqueeBorder);
  root.style.setProperty('--marquee-glow',theme.marqueeGlow);
 }
}

function escapeMessageHtml(value=''){
 return String(value)
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;');
}

function collectMessageLines(...parts){
 const lines=[];
 for(const part of parts){
  if(part==null)continue;
  for(const line of String(part).split('\n')){
   const trimmed=line.trim();
   if(trimmed)lines.push(trimmed);
  }
 }
 return lines;
}

function buildBoardMessageHtml({title='',accent='',score='',lines=[]}={}){
 const body=[];
 if(title)body.push(`<span class="boardTitle">${escapeMessageHtml(title)}</span>`);
 if(accent)body.push(`<span class="boardAccent">${escapeMessageHtml(accent)}</span>`);
 if(score)body.push(`<span class="boardScore">${escapeMessageHtml(score)}</span>`);
 for(const line of collectMessageLines(...lines)){
  body.push(`<span class="boardLine">${escapeMessageHtml(line)}</span>`);
 }
 return body.join('');
}

function gameplayMessageState(){
 if(paused){
  return {mode:'board',html:buildBoardMessageHtml({title:'PAUSED',lines:['Press P to resume']}),topRatio:.48};
 }
 if(S.alertT>0){
  const lines=collectMessageLines(S.alertTxt);
  return {
   mode:'board',
   html:buildBoardMessageHtml({title:lines.shift()||'',lines}),
   topRatio:.48
  };
 }
 if(S.banner<=0)return null;
 switch(S.bannerMode){
  case 'challengeIntro':
   return {mode:'board',html:buildBoardMessageHtml({accent:S.bannerTxt,lines:[S.bannerSub]}),topRatio:.46};
  case 'stageTransition':
   return {mode:'board',html:buildBoardMessageHtml({title:'GET READY',score:S.bannerTxt,lines:[S.bannerSub]}),topRatio:.46};
  case 'captureBeat':
   return {mode:'board',html:buildBoardMessageHtml({title:'FIGHTER CAPTURED',lines:['BOSS RETREAT']}),topRatio:.48};
  case 'captureEscape':
   return {mode:'board',html:buildBoardMessageHtml({title:'CAPTURE BROKEN',lines:['FIGHTER ESCAPED']}),topRatio:.48};
  case 'captureLoss':
   return {mode:'board',html:buildBoardMessageHtml({title:'CAPTURED FIGHTER',lines:['DESTROYED']}),topRatio:.48};
  case 'rescueReturn':
   return {mode:'board',html:buildBoardMessageHtml({title:'FIGHTER RELEASED',lines:['RETURNING TO SHIP']}),topRatio:.48};
  case 'rescueBeat':
   return {mode:'board',html:buildBoardMessageHtml({title:'DUAL FIGHTER',lines:['JOINED']}),topRatio:.48};
  case 'challenge':
   return {mode:'board',html:buildBoardMessageHtml({accent:S.bannerTxt,lines:[S.bannerSub]}),topRatio:.46};
  case 'challengeResult':{
   const parts=collectMessageLines(S.bannerSub);
   return {mode:'board',html:buildBoardMessageHtml({title:S.bannerTxt,score:parts[0]||'',lines:parts.slice(1)}),topRatio:.46};
  }
  case 'stage':
   return {mode:'board',html:buildBoardMessageHtml({accent:S.bannerTxt}),topRatio:.46};
  default:{
   const lines=collectMessageLines(S.bannerTxt,S.bannerSub);
   return {mode:'board',html:buildBoardMessageHtml({title:lines.shift()||'',lines}),topRatio:.48};
  }
 }
}

function syncCabinetShellLayout({
 ox,
 oy,
 viewW,
 viewH,
 scale,
 shellX,
 shellY,
 shellW,
 shellH,
 shellPadL,
 shellPadT,
 shellPadR,
 shellPadB,
 railLeft,
 railTop,
 railW,
 railH,
 waitScoreOverlay,
 framedOverlayOpen
}){
 applyStageChromeTheme();
 if(hud){
  const hudLeft=ox+DISPLAY_SHELL.hudInsetX;
  const hudTop=oy+DISPLAY_SHELL.hudInsetTop;
  const hudWidth=Math.max(DISPLAY_SHELL.hudMinWidth,viewW-DISPLAY_SHELL.hudInsetX*2);
  hud.style.left=`${hudLeft}px`;
  hud.style.top=`${hudTop}px`;
  hud.style.width=`${hudWidth}px`;
  hud.style.setProperty('--hud-band-height',`${Math.max(28,Math.floor(scale*24))}px`);
  hud.style.setProperty('--hud-band-fade',`${Math.max(18,Math.floor(scale*30))}px`);
 }
 if(msg){
  msg.style.left=`${Math.floor(ox+viewW/2)}px`;
  msg.style.width=`${Math.max(220,viewW-36)}px`;
 }
 if(playfieldFrame){
  playfieldFrame.style.display='block';
  playfieldFrame.style.left=`${ox-DISPLAY_SHELL.frameOuterInset}px`;
  playfieldFrame.style.top=`${oy-DISPLAY_SHELL.frameOuterInset}px`;
  playfieldFrame.style.width=`${viewW+DISPLAY_SHELL.frameOuterInset*2}px`;
  playfieldFrame.style.height=`${viewH+DISPLAY_SHELL.frameOuterInset*2}px`;
  playfieldFrame.style.setProperty('--frame-inner-inset',`${Math.max(9,Math.floor(scale*DISPLAY_SHELL.frameInnerInset))}px`);
 }
 const movieOverlayPanel=document.getElementById('moviePanel');
 if(movieOverlayPanel){
  movieOverlayPanel.style.left=`${ox}px`;
  movieOverlayPanel.style.top=`${oy}px`;
  movieOverlayPanel.style.width=`${viewW}px`;
  movieOverlayPanel.style.height=`${viewH}px`;
 }
 if(cabinetShell){
  cabinetShell.style.display='block';
  cabinetShell.style.left=`${shellX}px`;
  cabinetShell.style.top=`${shellY}px`;
  cabinetShell.style.width=`${shellW}px`;
  cabinetShell.style.height=`${shellH}px`;
  cabinetShell.style.setProperty('--shell-left',`${shellPadL}px`);
  cabinetShell.style.setProperty('--shell-top',`${shellPadT}px`);
  cabinetShell.style.setProperty('--shell-right',`${shellPadR}px`);
  cabinetShell.style.setProperty('--shell-bottom',`${shellPadB}px`);
 }
 if(cabinetRightFrame){
  if(railW>0){
   cabinetRightFrame.style.display='block';
   cabinetRightFrame.style.left=`${railLeft}px`;
   cabinetRightFrame.style.top=`${railTop}px`;
   cabinetRightFrame.style.width=`${railW}px`;
   cabinetRightFrame.style.height=`${railH}px`;
  }else cabinetRightFrame.style.display='none';
 }
 if(statusPanels){
  statusPanels.classList.toggle('waitOverlay',waitScoreOverlay);
  statusPanels.style.setProperty('--overlay-max-height','none');
  if(waitScoreOverlay){
   const panelW=Math.min(Math.max(280,Math.floor(viewW*.48)),420);
   statusPanels.style.width=`${panelW}px`;
   statusPanels.style.left=`${Math.floor(ox+viewW/2-panelW/2)}px`;
   statusPanels.style.right='auto';
   statusPanels.style.top=`${Math.floor(oy+Math.max(56,viewH*.18))}px`;
   statusPanels.style.bottom='auto';
  }else if(framedOverlayOpen){
   const panelW=Math.min(Math.max(420,Math.floor(viewW*.84)),660);
   const top=Math.floor(oy+12);
   const maxHeight=Math.max(180,Math.floor(viewH-24));
   statusPanels.style.width=`${panelW}px`;
   statusPanels.style.left=`${Math.floor(ox+viewW/2-panelW/2)}px`;
   statusPanels.style.right='auto';
   statusPanels.style.top=`${top}px`;
   statusPanels.style.bottom='auto';
   statusPanels.style.setProperty('--overlay-max-height',`${maxHeight}px`);
  }else{
   statusPanels.style.width='';
   statusPanels.style.left='auto';
   statusPanels.style.right=`${Math.max(14,innerWidth-(shellX+shellW)+Math.max(12,Math.floor(shellPadR*.12)))}px`;
   statusPanels.style.top=`${Math.max(14,oy+14)}px`;
   statusPanels.style.bottom='auto';
  }
 }
 if(renderSettingsPanel){
  const settingsW=Math.min(Math.max(420,Math.floor(viewW*.58)),680);
  const top=Math.floor(oy+12);
  const maxHeight=Math.max(220,Math.floor(viewH-24));
  renderSettingsPanel.style.width=`${settingsW}px`;
  renderSettingsPanel.style.left=`${Math.floor(ox+viewW/2-settingsW/2)}px`;
  renderSettingsPanel.style.right='auto';
  renderSettingsPanel.style.top=`${top}px`;
  renderSettingsPanel.style.maxHeight=`${maxHeight}px`;
 }
 if(renderHelpModal){
  renderHelpModal.style.left=`${ox}px`;
  renderHelpModal.style.top=`${oy}px`;
  renderHelpModal.style.width=`${viewW}px`;
  renderHelpModal.style.height=`${viewH}px`;
 }
 if(renderHelpPanel){
  renderHelpPanel.style.width=`${Math.min(Math.max(340,Math.floor(viewW-24)),820)}px`;
  renderHelpPanel.style.height=`${Math.max(220,Math.min(Math.floor(viewH-24),720))}px`;
 }
 if(renderFeedbackModal){
  renderFeedbackModal.style.left=`${ox}px`;
  renderFeedbackModal.style.top=`${oy}px`;
  renderFeedbackModal.style.width=`${viewW}px`;
  renderFeedbackModal.style.height=`${viewH}px`;
 }
 if(renderFeedbackPanel){
  renderFeedbackPanel.style.width=`${Math.min(Math.max(420,Math.floor(viewW*.82)),720)}px`;
  renderFeedbackPanel.style.maxHeight=`${Math.max(220,Math.min(Math.floor(viewH-24),720))}px`;
 }
 if(buildStamp){
  const stampW=Math.min(320,Math.max(248,Math.floor(viewW*.32)));
  const compactStampH=56;
  const stampH=buildStamp.offsetHeight||compactStampH;
  const anchorTop=shellY+shellH-Math.max(66,Math.floor(shellPadB*.78));
  buildStamp.style.width=`${stampW}px`;
  buildStamp.style.left=`${Math.max(14,Math.floor(ox+viewW/2-stampW/2))}px`;
  buildStamp.style.top=`${anchorTop-Math.max(0,stampH-compactStampH)}px`;
  buildStamp.style.visibility=waitScoreOverlay?'hidden':'visible';
 }
}

function syncHudAndShellMessages({ox,oy,viewW,viewH}){
 left.innerHTML=`<span class="hudLabel">1UP</span> <span class="hudValue">${S.score.toString().padStart(6,'0')}</span>`;
 if(center)center.innerHTML=`<span class="hudLabel">HIGH SCORE</span> <span class="hudValue">${String(S.best).padStart(6,'0')}</span>`;
 const pilotHudHtml=(typeof pilotDisplayId==='function'&&typeof LEADERBOARD!=='undefined'&&LEADERBOARD?.user)
  ? `<span class="hudLabel">PILOT</span> <span class="hudValue">${pilotDisplayId()}</span>`
  : (window.__auroraPilotHudHtml||`<span class="hudLabel">PILOT</span> <span class="hudValue">---</span>`);
 right.innerHTML=pilotHudHtml;
 const toolsVisible=!started||paused||feedbackOpen;
 settingsBtn.style.display='block';
 if(typeof syncLeaderboardPanelVisibility==='function')syncLeaderboardPanelVisibility();
 if((!started||paused)&&typeof primeLeaderboard==='function')primeLeaderboard();
 if(!toolsVisible&&settingsOpen)closeSettings();
 else syncSettingsUi();
 const activeMessage=started?gameplayMessageState():null;
 msg.className=!started?(((gameOverState||gameOverHtml)||ATTRACT.phase==='scores')?'gameOverScreen':'startScreen'):(activeMessage?.mode==='board'?'boardMessage':'');
 if(!started&&msg.className==='startScreen')msg.style.top=`${Math.floor(oy+viewH*.72)}px`;
 else if(!started&&msg.className==='gameOverScreen')msg.style.top=`${Math.floor(oy+viewH*.54)}px`;
 else if(activeMessage?.mode==='board')msg.style.top=`${Math.floor(oy+viewH*(activeMessage.topRatio||.48))}px`;
 else msg.style.top='';
 if(!started){
  if(gameOverState)msg.innerHTML=buildGameOverHtmlFromState();
  else if(gameOverHtml)msg.innerHTML=gameOverHtml;
  else if(ATTRACT.active&&ATTRACT.phase==='scores')msg.innerHTML=buildAttractScoreboardHtml();
  else{
   const frontDoor=typeof currentGamePackFrontDoor==='function'
    ? currentGamePackFrontDoor()
    : {
      title:'AURORA GALACTICA',
      subtitle:'WAIT MODE',
      startPrompt:'PRESS <span class="k">ENTER</span> TO START',
      attractLine:'AUTO DEMO IN PROGRESS   HIGH SCORES NEXT',
      utilityLine:'<span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS'
     };
   const pickerHint=frontDoor.pickerHint?`<span class="startMeta">${frontDoor.pickerHint}</span>`:'';
   msg.innerHTML=`<span class="startTitle">${frontDoor.title}</span><span class="startSub">${frontDoor.subtitle}</span><span class="startHelp">${frontDoor.startPrompt}</span><span class="startMeta">${typeof buildStartAccountPrompt==='function'?buildStartAccountPrompt():'SIGN IN FOR VALIDATED SCORES'}</span><span class="startMeta">${frontDoor.attractLine}</span><span class="startMeta">${controlMoveHelpHtml()}</span><span class="startMeta">${frontDoor.utilityLine}</span>${pickerHint}`;
  }
 }
 else if(activeMessage)msg.innerHTML=activeMessage.html;
 else msg.textContent='';
}

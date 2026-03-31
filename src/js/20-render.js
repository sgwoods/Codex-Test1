// Hitboxes, sprite rendering, HUD, overlays, and frame drawing.
const playfieldFrame=document.getElementById('playfieldFrame');
const renderHelpModal=document.getElementById('helpModal');
const renderHelpPanel=document.getElementById('helpPanel');
const renderFeedbackModal=document.getElementById('feedbackModal');
const renderFeedbackPanel=document.getElementById('feedbackPanel');
const renderSettingsPanel=document.getElementById('settingsPanel');
window.__auroraRenderDebug=window.__auroraRenderDebug||{carryDraws:[]};
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
const FAMILY_PIXELS={
 scorpion:[[1,0],[5,0],[0,2],[6,2]],
 stingray:[[2,0],[3,0],[1,4],[4,4]],
 galboss:[[0,1],[6,1],[2,4],[4,4]],
 dragonfly:[[1,0],[5,0],[0,3],[6,3]],
 mosquito:[[2,0],[4,0],[1,4],[5,4]]
};

function enemyPalette(e,flap,hot){
 const damaged=e?.t==='boss'&&e?.max>1&&e?.hp===1;
 switch(e?.fam){
  case 'scorpion':
   if(e.t==='boss')return damaged?{a:flap?'#7cbcff':'#a8d9ff',b:hot?'#ff7d7d':'#ffd36a',c:'#ff4fa1',pat:FAMILY_PIXELS.scorpion}:{a:flap?'#67ffc1':'#8dffd5',b:hot?'#ff7d7d':'#ffb34d',c:'#a24fff',pat:FAMILY_PIXELS.scorpion};
   return{a:flap?'#7dff63':'#a2ff78',b:hot?'#ff8a4e':'#ffc04d',c:'#5f42ff',pat:FAMILY_PIXELS.scorpion};
  case 'stingray':
   return{a:flap?'#56efff':'#7fdfff',b:hot?'#4d92ff':'#86b0ff',c:'#ffe76f',pat:FAMILY_PIXELS.stingray};
  case 'galboss':
   return damaged?{a:flap?'#b4c9ff':'#d6e2ff',b:hot?'#ffd37a':'#ffe29a',c:'#ff5fb0',pat:FAMILY_PIXELS.galboss}:{a:flap?'#ff8be9':'#ffb0ef',b:hot?'#77ffd3':'#53e5b7',c:'#fff18f',pat:FAMILY_PIXELS.galboss};
  case 'dragonfly':
   return{a:flap?'#69ff8e':'#98ffab',b:hot?'#5ce1ff':'#94f0ff',c:'#ffe76f',pat:FAMILY_PIXELS.dragonfly};
  case 'mosquito':
   return{a:flap?'#ff8c70':'#ffab85',b:hot?'#ffd24c':'#ffe179',c:'#74f4ff',pat:FAMILY_PIXELS.mosquito};
  default:
   if(e.t==='bee')return{a:flap?'#2a75ff':'#4e95ff',b:hot?'#ffe470':'#ffd24a',c:'#f08f2e',pat:null};
   if(e.t==='but')return{a:flap?'#3c86ff':'#62a5ff',b:hot?'#ff6776':'#ff3d51',c:'#ffd25a',pat:null};
   if(e.t==='rogue')return{a:flap?'#78b6ff':'#a3cfff',b:hot?'#ff7bb2':'#ff5ea0',c:'#ffe36a',pat:null};
   return damaged?{a:flap?'#7ab5ff':'#add7ff',b:hot?'#ffe177':'#ffe89c',c:'#ff58b4',pat:null}:{a:e.hp>1?(flap?'#33d7b0':'#60f0cf'):(flap?'#5bc2ff':'#8fd7ff'),b:hot?'#7ef173':'#5fe85c',c:'#cc5fff',pat:null};
 }
}

function enemyDims(e){
 if(e.t==='boss')return{w:38,h:30};
 if(e.t==='but')return{w:34,h:27};
 if(e.t==='rogue')return{w:35,h:28};
 return{w:32,h:26};
}
function enemyHitbox(e){
 const d=enemyDims(e),stage1=e&&!S.challenge&&S.stage===1,scale=S.challenge?(S.stage===3?0.74:0.7):(stage1?(e&&!e.form?0.08:(S.scriptMode?0.18:0.22)):0.22);
 return{w:d.w*scale,h:d.h*scale};
}
function enemyCollisionHitbox(e){
 const d=enemyDims(e),scale=S.challenge?0.18:(S.stage===4?(e?.dive===1?0.11:0.095):S.stage>=5?(e?.dive===1?0.14:0.12):0.18);
 return{w:d.w*scale,h:d.h*scale};
}
function playerHitbox(){return{w:7,h:6};}
function drawMiniShip(s=1,colA='#9adfff',colB='#72c8ff'){
 const ps=2*s;drawPix(-ps*2.5,-ps*2.2,ps,P.ship.a,colA,colB,P.ship.b,'#ff4658',P.ship.c);
}
function drawEnemy(e){
 const ps=2;
 const flap=Math.sin(e.tm*11+e.ph)>.12,hot=e.dive===1||e.dive===4;
 const pal=enemyPalette(e,flap,hot);
 const carryTarget=e.carry?carriedFighterTarget(e):null;
 const carryOffset=e.carry?carriedFighterOffset(e):null;
 ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));if(e.dive===1||e.dive===4)ctx.rotate(Math.atan2(e.vy,e.vx||1)+1.57);
 if(e.t==='bee')drawPix(-ps*3,-ps*2.2,ps,P.bee.a,pal.a,pal.b,P.bee.b,pal.c,pal.pat||P.bee.c);
 else if(e.t==='but')drawPix(-ps*3,-ps*2.2,ps,P.but.a,pal.a,pal.b,P.but.b,pal.c,pal.pat||P.but.c);
 else if(e.t==='rogue')drawPix(-ps*3.2,-ps*2.2,ps,P.rogue.a,pal.a,pal.b,P.rogue.b,pal.c,pal.pat||P.rogue.c);
 else drawPix(-ps*3.5,-ps*2.2,ps,P.boss.a,pal.a,pal.b,P.boss.b,pal.c,pal.pat||P.boss.c);
 if(e.hitT>0){
  ctx.globalAlpha=Math.min(.9,e.hitT/.34);
  ctx.fillStyle=e.t==='boss'?'rgba(255,248,196,.86)':'rgba(255,255,255,.72)';
  ctx.fillRect(-12,-10,24,20);
  ctx.globalAlpha=1;
 }
 if(e.beam){
  const len=Math.max(24,Math.min(VIS.beamLen,PLAY_H-e.y-8)),bw=10;
  const g=ctx.createLinearGradient(0,14,0,len);g.addColorStop(0,'rgba(136,245,255,.98)');g.addColorStop(.55,'rgba(110,229,255,.32)');g.addColorStop(1,'rgba(136,245,255,.03)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-bw,12);ctx.lineTo(bw,12);ctx.lineTo(bw*2.35,len);ctx.lineTo(-bw*2.35,len);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(228,250,255,.32)';ctx.fillRect(-3,14,6,len-8);
  ctx.fillStyle='rgba(255,246,168,.18)';
  for(let i=0;i<4;i++){const yy=20+i*28+Math.sin((e.tm+i)*4)*3;ctx.fillRect(-bw*1.1,yy,bw*2.2,4)}
 }
 ctx.restore();
 if(e.carry&&carryTarget&&carryOffset){
  window.__auroraRenderDebug.carryDraws.push({
   bossId:e.id,
   bossX:+e.x.toFixed(2),
   bossY:+e.y.toFixed(2),
   fighterX:+carryTarget.x.toFixed(2),
   fighterY:+carryTarget.y.toFixed(2),
   relation:carryTarget.y<e.y?'above':'below',
   dive:e.dive||0
  });
  ctx.save();
  ctx.translate(Math.round(carryTarget.x),Math.round(carryTarget.y));
  ctx.globalAlpha=.92;
  drawMiniShip(1.02,'#d8f2ff','#ff3e4f');
  ctx.restore();
  if(e.dive){
   ctx.save();
   ctx.strokeStyle='rgba(228,250,255,.32)';
   ctx.lineWidth=1;
   ctx.beginPath();
   ctx.moveTo(Math.round(e.x),Math.round(e.y));
   ctx.lineTo(Math.round(carryTarget.x),Math.round(carryTarget.y));
   ctx.stroke();
   ctx.restore();
  }
 }
}
function drawPlayerBody(x,y,dual=0,ghost=0){
 const ps=2;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));if(ghost)ctx.globalAlpha=.52;
 drawPix(-ps*2.5,-ps*2.2,ps,P.ship.a,'#f4f8ff','#ff3347',P.ship.b,'#5ca8ff',P.ship.c);
 if(dual){drawPix(-ps*5.2,-ps*2,ps*0.82,P.ship.a,'#f4f8ff','#ff3347',P.ship.b,'#5ca8ff',P.ship.c);drawPix(ps*1.45,-ps*2,ps*0.82,P.ship.a,'#f4f8ff','#ff3347',P.ship.b,'#5ca8ff',P.ship.c);}
 ctx.restore();
}
function drawCaptureTether(){
 const p=S.p,b=p.capBoss;if(!p.captured||!b||b.hp<=0)return;
 const bx=Math.round(b.x),by=Math.round(b.y+12),px=Math.round(p.x),py=Math.round(p.y-8);
 const g=ctx.createLinearGradient(bx,by,px,py);
 g.addColorStop(0,'rgba(155,246,255,.78)');
 g.addColorStop(.65,'rgba(155,246,255,.18)');
 g.addColorStop(1,'rgba(155,246,255,.04)');
 ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(px,py);ctx.stroke();
 ctx.fillStyle='rgba(145,236,255,.09)';
 ctx.beginPath();ctx.moveTo(bx-7,by);ctx.lineTo(bx+7,by);ctx.lineTo(px+10,py);ctx.lineTo(px-10,py);ctx.closePath();ctx.fill();
}

function drawCarryDebugOverlay(){
 if(!window.__auroraCarryDebug)return;
 const p=S.p;
 ctx.save();
 ctx.font='10px monospace';
 ctx.textAlign='center';
 ctx.textBaseline='bottom';
 if(p.captured&&p.capBoss&&p.capBoss.hp>0){
  const relation=p.y>p.capBoss.y?'below':'above';
  ctx.strokeStyle=relation==='below'?'#ff5e5e':'#5ef0a4';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(Math.round(p.capBoss.x),Math.round(p.capBoss.y));
  ctx.lineTo(Math.round(p.x),Math.round(p.y));
  ctx.stroke();
  ctx.fillStyle=relation==='below'?'#ffb3b3':'#b8ffd8';
  ctx.fillText(`CAPTURE ${relation.toUpperCase()} d${p.capBoss.dive||0}`,Math.round(p.capBoss.x),Math.round(p.capBoss.y-24));
 }
 for(const e of S.e){
  if(e.hp<=0||!e.carry)continue;
  const target=carriedFighterTarget(e);
  if(!target)continue;
  const relation=target.y<e.y?'above':'below';
  ctx.strokeStyle=relation==='above'?'#5ef0a4':'#ff5e5e';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(Math.round(e.x),Math.round(e.y));
  ctx.lineTo(Math.round(target.x),Math.round(target.y));
  ctx.stroke();
  ctx.fillStyle=relation==='above'?'#b8ffd8':'#ffb3b3';
  ctx.fillText(`CARRY ${relation.toUpperCase()} d${e.dive||0}`,Math.round(e.x),Math.round(e.y-24));
 }
 if(S.cap){
  const label=S.cap.mode==='dock'?'RESCUE DOCK':'RESCUE FALL';
  ctx.strokeStyle='#ffd36a';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(Math.round(S.cap.x),Math.round(S.cap.y));
  ctx.lineTo(Math.round(S.p.x),Math.round(S.p.y));
  ctx.stroke();
  ctx.fillStyle='#ffe6a8';
  ctx.fillText(label,Math.round(S.cap.x),Math.round(S.cap.y-18));
 }
 ctx.restore();
}
function drawRescuePod(){
 if(!S.cap)return;
 ctx.save();
 ctx.translate(Math.round(S.cap.x),Math.round(S.cap.y));
 if(S.cap.mode==='dock'){
  const pulse=.68+Math.sin((S.cap.spin||0)*1.7)*.18;
  ctx.rotate(Math.sin((S.cap.spin||0)*0.7)*0.14);
  ctx.globalAlpha=.96;
  ctx.fillStyle=`rgba(210,248,255,${(0.08+pulse*0.12).toFixed(3)})`;
  ctx.beginPath();ctx.ellipse(0,0,18,12,0,0,7);ctx.fill();
  ctx.strokeStyle='rgba(255,242,184,.44)';
  ctx.lineWidth=1.1;
  ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();
  ctx.rotate(Math.sin((S.cap.spin||0))*0.2);
  drawMiniShip(1.18,'#f4f8ff','#ff4658');
 }else{
  ctx.globalAlpha=.94;
  const pulse=.75+Math.sin(performance.now()/120)*.25;
  ctx.fillStyle=`rgba(145,236,255,${(0.12+pulse*0.12).toFixed(3)})`;
  ctx.beginPath();ctx.ellipse(0,0,15,20,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(145,236,255,.16)';
  ctx.beginPath();ctx.ellipse(0,0,10,14,0,0,7);ctx.fill();
  ctx.strokeStyle='rgba(202,249,255,.42)';
  ctx.lineWidth=1.2;
  ctx.beginPath();ctx.ellipse(0,0,10,14,0,0,7);ctx.stroke();
  drawMiniShip(1.25,'#f4f8ff','#ff3347');
 }
 ctx.restore();
}

function drawBadges(stage){
 if(stage<=0)return;
 const bigCount=Math.floor(stage/5);
 const smallCount=stage%5;
 const badges=[];
 const rightEdge=PLAY_W-DISPLAY_SHELL.stageBadgeRight;
 const minX=PLAY_W-88;
 let x=rightEdge;
 let y=PLAY_H-DISPLAY_SHELL.stageBadgeBottom;
 const layout=[...Array(bigCount).fill('big'),...Array(smallCount).fill('small')];
 for(const size of layout){
  const w=size==='big'?11:8;
  const step=size==='big'?13:DISPLAY_SHELL.stageBadgeGap;
  badges.push({x,y,size});
  x-=step;
  if(x<minX){
   x=rightEdge;
   y-=14;
  }
 }
 const right=badges.reduce((m,b)=>Math.max(m,b.x+(b.size==='big'?5.5:4)),0);
 const bottom=badges.reduce((m,b)=>Math.max(m,b.y),0);
 ctx.save();
 for(const badge of badges){
  ctx.save();
  ctx.translate(badge.x,badge.y);
  const big=badge.size==='big';
  ctx.fillStyle=big?'#7ab7ff':'#e95b51';
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(big?-5.5:-4,big?-9:-6);
  ctx.lineTo(big?5.5:4,big?-9:-6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle=big?'rgba(222,240,255,.82)':'rgba(255,245,210,.78)';
  ctx.fillRect(-.5,big?-9:-6,1,big?8:5);
  ctx.fillStyle=big?'rgba(24,68,136,.5)':'rgba(120,36,24,.46)';
  ctx.fillRect(big?-4:-3,big?-6:-4,big?8:6,1);
  ctx.restore();
 }
 if(badges.length){
  ctx.textAlign='right';
  ctx.textBaseline='top';
  ctx.font='7px "Courier New",Consolas,monospace';
  ctx.fillStyle='rgba(169,216,255,.72)';
  ctx.fillText('STAGE',right,bottom+DISPLAY_SHELL.stageLabelGap);
 }
 ctx.restore();
}

function drawReserveShips(lives){
 let reserve=Math.max(0,lives|0);
 let x=DISPLAY_SHELL.reserveLeft,y=PLAY_H-DISPLAY_SHELL.reserveBottom;
 while(reserve>0){
  ctx.save();
  ctx.translate(x,y);
  drawMiniShip(.82,'#f4f8ff','#ff3347');
  ctx.restore();
  reserve--;
  x+=18;
 }
}

function drawPostFx(){}

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

function draw(){
 const sh=S.shake*8,dx=rnd(sh,-sh),dy=rnd(sh,-sh);
 const compactCabinet=innerWidth<1500||innerHeight<980;
 const outerPadX=Math.max(10,Math.floor(innerWidth*(compactCabinet?.012:.016)));
 const outerPadTop=Math.max(10,Math.floor(innerHeight*(compactCabinet?.01:.014)));
 const outerPadBottom=Math.max(10,Math.floor(innerHeight*(compactCabinet?.01:.014)));
 const shellPadL=Math.max(compactCabinet?84:92,Math.floor(innerWidth*(compactCabinet?.068:.075)));
 const shellPadT=Math.max(compactCabinet?90:98,Math.floor(innerHeight*(compactCabinet?.078:.088)));
 const shellPadB=Math.max(compactCabinet?68:76,Math.floor(innerHeight*(compactCabinet?.062:.07)));
 const shellPadR=shellPadL;
 const railInset=Math.max(12,Math.floor(shellPadR*.12));
 const railW=Math.max(compactCabinet?78:88,Math.min(compactCabinet?112:124,shellPadR-railInset*2));
 const availW=Math.max(PLAY_W,innerWidth-outerPadX*2-shellPadL-shellPadR);
 const availH=Math.max(PLAY_H,innerHeight-outerPadTop-outerPadBottom-shellPadT-shellPadB);
 const fit=Math.max(1,Math.min(availW/PLAY_W,availH/PLAY_H));
 const steppedFit=Math.max(1,Math.floor(fit*4)/4);
 const scale=S.ultra?steppedFit:Math.max(1,steppedFit-.25);
 const viewW=PLAY_W*scale,viewH=PLAY_H*scale;
 const shellW=viewW+shellPadL+shellPadR;
 const shellH=viewH+shellPadT+shellPadB;
 const shellX=Math.floor((innerWidth-shellW)/2);
 const shellY=Math.floor((innerHeight-shellH)/2);
 const ox=shellX+shellPadL;
 const oy=shellY+shellPadT;
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
 const railH=Math.max(220,viewH);
 const railLeft=shellX+shellW-shellPadR+Math.floor((shellPadR-railW)/2);
 const railTop=oy;
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
 const waitScoreOverlay=!started&&typeof LEADERBOARD!=='undefined'&&!!LEADERBOARD.panelOpen;
 const framedOverlayOpen=typeof LEADERBOARD!=='undefined'&&!waitScoreOverlay&&!!(LEADERBOARD.accountPanelOpen||LEADERBOARD.panelOpen);
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
   statusPanels.style.right=`${Math.max(14,innerWidth-(shellX+shellW)+railInset)}px`;
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
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);
 ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);
 ctx.setTransform(DPR*scale,0,0,DPR*scale,(ox+dx*.25)*DPR,(oy+dy*.25)*DPR);
 ctx.fillStyle='#000';ctx.fillRect(0,0,PLAY_W,PLAY_H);
 window.__auroraRenderDebug.carryDraws.length=0;
 ctx.save();ctx.beginPath();ctx.rect(0,0,PLAY_W,PLAY_H);ctx.clip();
 for(const s of S.st){ctx.globalAlpha=.04+s.z*.22*(.3+Math.sin(s.tw)*.58);ctx.fillStyle=s.c;ctx.fillRect(s.x,s.y,s.s,s.s)}ctx.globalAlpha=1;
 for(const f of S.fx){
  ctx.globalAlpha=Math.max(0,f.t*2.9);
  if(f.flash){
   ctx.fillStyle=f.c;
   ctx.fillRect(f.x-f.r*.6,f.y-1,f.r*1.2,2);
   ctx.fillRect(f.x-1,f.y-f.r*.6,2,f.r*1.2);
  }else if(f.sq){
   ctx.fillStyle=f.c;
   ctx.fillRect(f.x-f.r*.5,f.y-f.r*.5,f.r,f.r);
  }else{
   ctx.fillStyle=f.c;
   ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();
  }
 }ctx.globalAlpha=1;
 drawRescuePod();
 for(const b of S.pb){const x=Math.round(b.x),y=Math.round(b.y);ctx.fillStyle='#e9f8ff';ctx.fillRect(x,y-16,1,18)}
 for(const b of S.eb){const x=Math.round(b.x),y=Math.round(b.y);ctx.fillStyle='#ff5e5e';ctx.fillRect(x,y-10,1,13)}
 for(const e of S.e)if(e.hp>0)drawEnemy(e);
 drawCaptureTether();
 drawCarryDebugOverlay();
 const p=S.p;if((!p.pending||p.spawn<=.3)&&!p.spawn){if(!(p.inv>0&&Math.floor(p.inv*14)%2))drawPlayerBody(p.x,p.y,p.dual,0)}
 if(p.captured)drawPlayerBody(p.x,p.y,0,1);
 drawReserveShips(S.lives);
 drawBadges(S.stage);
 drawPostFx();
 ctx.restore();
 ctx.setTransform(1,0,0,1,0,0);
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
if(!toolsVisible)closeSettings();
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
  else msg.innerHTML=`<span class="startTitle">AURORA GALACTICA</span><span class="startSub">WAIT MODE</span><span class="startHelp">PRESS <span class="k">ENTER</span> TO START</span><span class="startMeta">${typeof buildStartAccountPrompt==='function'?buildStartAccountPrompt():'SIGN IN FOR VALIDATED SCORES'}</span><span class="startMeta">AUTO DEMO IN PROGRESS   HIGH SCORES NEXT</span><span class="startMeta">${controlMoveHelpHtml()}</span><span class="startMeta"><span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS</span>`;
 }
 else if(activeMessage)msg.innerHTML=activeMessage.html;
 else msg.textContent='';
}

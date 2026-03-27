// Hitboxes, sprite rendering, HUD, overlays, and frame drawing.
const playfieldFrame=document.getElementById('playfieldFrame');
window.__auroraRenderDebug=window.__auroraRenderDebug||{carryDraws:[]};
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
 const vals=[50,30,20,10,5,1],col=['#f3cf65','#f0b35e','#ef9559','#ec7755','#e95b51','#e53f4e'];
 let x=PLAY_W-10,y=PLAY_H-8;
 for(let i=0;i<vals.length;i++)while(stage>=vals[i]){
  stage-=vals[i];
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle=col[i];
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(-4,-6);
  ctx.lineTo(4,-6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle='rgba(255,245,210,.72)';
  ctx.fillRect(-.5,-6,1,5);
  ctx.fillStyle='rgba(120,36,24,.42)';
  ctx.fillRect(-3,-4,6,1);
  ctx.restore();
  x-=8;
  if(x<PLAY_W-72){x=PLAY_W-10;y-=9;}
 }
}

function drawReserveShips(lives){
 let reserve=Math.max(0,lives|0);
 let x=12,y=PLAY_H-8;
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

function draw(){
 const sh=S.shake*8,dx=rnd(sh,-sh),dy=rnd(sh,-sh);
 const fit=Math.max(1,Math.floor(Math.min(innerWidth/PLAY_W,innerHeight/PLAY_H)));
 const scale=S.ultra?fit:Math.max(1,fit-1);
 const viewW=PLAY_W*scale,viewH=PLAY_H*scale;
 const ox=Math.floor((innerWidth-viewW)/2),oy=Math.floor((innerHeight-viewH)/2);
 if(hud){
  hud.style.left=`${ox+2}px`;
  hud.style.top=`${Math.max(6,oy+4)}px`;
  hud.style.width=`${Math.max(220,viewW-4)}px`;
 }
 if(playfieldFrame){
  playfieldFrame.style.display='block';
  playfieldFrame.style.left=`${ox-2}px`;
  playfieldFrame.style.top=`${oy-2}px`;
  playfieldFrame.style.width=`${viewW+4}px`;
  playfieldFrame.style.height=`${viewH+4}px`;
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
 right.innerHTML='';
const toolsVisible=!started||paused||feedbackOpen;
settingsBtn.style.display='block';
if(typeof syncLeaderboardPanelVisibility==='function')syncLeaderboardPanelVisibility();
if((!started||paused)&&typeof primeLeaderboard==='function')primeLeaderboard();
if(!toolsVisible)closeSettings();
 else syncSettingsUi();
 msg.className=!started?(((gameOverState||gameOverHtml)||ATTRACT.phase==='scores')?'gameOverScreen':'startScreen'):'';
 if(!started){
  if(gameOverState)msg.innerHTML=buildGameOverHtmlFromState();
  else if(gameOverHtml)msg.innerHTML=gameOverHtml;
  else if(ATTRACT.active&&ATTRACT.phase==='scores')msg.innerHTML=buildAttractScoreboardHtml();
  else msg.innerHTML=`<span class="startTitle">AURORA GALACTICA</span><span class="startSub">WAIT MODE</span><span class="startHelp">PRESS <span class="k">ENTER</span> TO START</span><span class="startMeta">${typeof buildStartAccountPrompt==='function'?buildStartAccountPrompt():'SIGN IN FOR VALIDATED SCORES'}</span><span class="startMeta">AUTO DEMO IN PROGRESS   HIGH SCORES NEXT</span><span class="startMeta">${controlMoveHelpHtml()}</span><span class="startMeta"><span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS</span>`;
 }
 else if(paused)msg.innerHTML='PAUSED\n\nPress <span class="k">P</span> to resume';
 else if(S.alertT>0)msg.textContent=S.alertTxt;
 else if(S.banner>0){
 if(S.bannerMode==='challengeIntro')msg.innerHTML=`<span class="splashSub" style="color:#4fe4f4;font-size:1.06em;letter-spacing:.1em">${S.bannerTxt}</span><span class="splashSub" style="color:#7ef2ff">${S.bannerSub}</span>`;
 else if(S.bannerMode==='stageTransition')msg.innerHTML=`<span class="splashTitle">GET READY</span><span class="splashScore">${S.bannerTxt}</span><span class="splashSub">${S.bannerSub}</span>`;
 else if(S.bannerMode==='captureBeat')msg.innerHTML=`<span class="splashTitle">FIGHTER CAPTURED</span><span class="splashSub">BOSS RETREAT</span>`;
 else if(S.bannerMode==='captureEscape')msg.innerHTML=`<span class="splashTitle">CAPTURE BROKEN</span><span class="splashSub">FIGHTER ESCAPED</span>`;
 else if(S.bannerMode==='captureLoss')msg.innerHTML=`<span class="splashTitle">CAPTURED FIGHTER</span><span class="splashSub">DESTROYED</span>`;
 else if(S.bannerMode==='rescueReturn')msg.innerHTML=`<span class="splashTitle">FIGHTER RELEASED</span><span class="splashSub">RETURNING TO SHIP</span>`;
 else if(S.bannerMode==='rescueBeat')msg.innerHTML=`<span class="splashTitle">DUAL FIGHTER</span><span class="splashSub">JOINED</span>`;
 else if(S.bannerMode==='challenge')msg.innerHTML=`<span class="splashSub" style="color:#4fe4f4;font-size:1.06em;letter-spacing:.1em">${S.bannerTxt}</span><span class="splashSub" style="color:#7ef2ff">${S.bannerSub}</span>`;
  else if(S.bannerMode==='challengeResult'){
   const parts=String(S.bannerSub||'').split('\n');
   msg.innerHTML=`<span class="splashTitle">${S.bannerTxt}</span><span class="splashScore">${parts[0]||''}</span>${parts[1]?`<span class="splashSub">${parts[1]}</span>`:''}`;
  }else if(S.bannerMode==='stage')msg.innerHTML=`<span class="splashSub" style="color:#4fe4f4;font-size:1.02em;letter-spacing:.08em">${S.bannerTxt}</span>`;
  else msg.textContent=S.bannerTxt;
 }
 else msg.textContent='';
}

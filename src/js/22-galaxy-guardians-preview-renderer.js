// Dev-only Galaxy Guardians preview rendering. This is not a playable adapter.
window.__galaxyGuardiansPreviewRenderDebug=window.__galaxyGuardiansPreviewRenderDebug||{
 renderTick:0,
 renderMode:'',
 visualIds:[],
 audioCueIds:[],
 alienCount:0
};

let galaxyGuardiansPreviewState=null;
let galaxyGuardiansPreviewLastT=0;
let galaxyGuardiansPreviewFireT=0;

function shouldDrawGalaxyGuardiansPreviewBoard(){
 const activePreview=typeof currentGamePackKey==='function'
  && currentGamePackKey()==='galaxy-guardians-preview';
 const waitShowcase=typeof currentWaitModeShowcasePackKey==='function'
  && currentWaitModeShowcasePackKey()==='galaxy-guardians-preview';
 return (activePreview||waitShowcase)
  && typeof createGalaxyGuardiansRuntimeState==='function'
  && typeof stepGalaxyGuardiansRuntime==='function'
  && typeof summarizeGalaxyGuardiansRuntime==='function';
}

function resetGalaxyGuardiansPreviewRenderState(seed=1979){
 galaxyGuardiansPreviewState=shouldDrawGalaxyGuardiansPreviewBoard()
  ? createGalaxyGuardiansRuntimeState({stage:1,ships:3,seed})
  : null;
 galaxyGuardiansPreviewLastT=0;
 galaxyGuardiansPreviewFireT=.32;
 return galaxyGuardiansPreviewState;
}

function galaxyGuardiansPreviewVisual(id){
 const catalog=GALAXY_GUARDIANS_PACK?.alienVisualCatalog||{};
 return catalog[id]||null;
}

function drawGalaxyGuardiansPixelRows(visual,x,y,cell=2,opts={}){
 if(!visual?.pixelRows)return;
 const rows=visual.pixelRows;
 const width=Math.max(...rows.map(row=>row.length));
 const height=rows.length;
 const palette=visual.palette||{};
 const core=opts.core||palette.core||'#dff7ff';
 const wing=opts.wing||palette.wing||core;
 const accent=opts.accent||palette.accent||core;
 const eye=opts.eye||palette.eye||'#ffffff';
 const flare=opts.flare||palette.flare||accent;
 const colorForPixel=(ch,edge,center)=>{
  if(ch==='C')return core;
  if(ch==='W')return wing;
  if(ch==='A')return accent;
  if(ch==='E')return eye;
  if(ch==='F')return flare;
  return edge?wing:(center?accent:core);
 };
 ctx.save();
 ctx.translate(Math.round(x-width*cell/2),Math.round(y-height*cell/2));
 for(let row=0;row<rows.length;row++){
  for(let col=0;col<rows[row].length;col++){
   const pixel=rows[row][col];
   if(pixel==='.')continue;
   const edge=col===0||col===rows[row].length-1||row===0||row===rows.length-1;
   const center=Math.abs(col-(rows[row].length-1)/2)<1.1;
   ctx.fillStyle=colorForPixel(pixel,edge,center);
   ctx.fillRect(col*cell,row*cell,cell,cell);
  }
 }
 ctx.fillStyle=eye;
 if(width>=7){
  ctx.fillRect(Math.floor(width*.33)*cell,Math.floor(height*.38)*cell,cell,cell);
  ctx.fillRect(Math.ceil(width*.58)*cell,Math.floor(height*.38)*cell,cell,cell);
 }
 ctx.restore();
}

function syncGalaxyGuardiansPreviewStarfield(){
 const themeId=GALAXY_GUARDIANS_PACK?.frontDoor?.atmosphereTheme||'signal-rack';
 const profile=Object.assign({
  id:'guardians-signal-stars',
  count:96,
  sizeMin:.82,
  sizeMax:1.42,
  alphaMin:.38,
  alphaMax:.92,
  twinkleMin:.82,
  twinkleAmp:.18,
  speedMin:9,
  speedMax:24,
  palette:['#fffdf0','#ffe26a','#ff5b5b','#7bd6ff','#4af26d','#f6f0ff']
 }, GALAXY_GUARDIANS_PACK?.atmosphereThemes?.[themeId]?.starfield||{});
 const sig=JSON.stringify(profile);
 if(S.guardiansPreviewStarfieldSig===sig&&S.st.length===profile.count)return profile;
 S.guardiansPreviewStarfieldSig=sig;
 S.st.length=0;
 const rand=(max,min=0)=>typeof auxRnd==='function'?auxRnd(max,min):(Math.random()*((+max||0)-(+min||0)))+(+min||0);
 const randUnit=()=>typeof auxRandUnit==='function'?auxRandUnit():Math.random();
 for(let i=0;i<Math.max(24,+profile.count||96);i++){
  S.st.push({
   x:rand(PLAY_W),
   y:rand(PLAY_H),
   s:rand(profile.sizeMax,profile.sizeMin),
   c:profile.palette[(randUnit()*profile.palette.length)|0],
   tw:rand(6.28),
   alpha:rand(profile.alphaMax,profile.alphaMin),
   twMin:rand(Math.min(1,profile.twinkleMin+.04),Math.max(.18,profile.twinkleMin-.04)),
   twAmp:rand(Math.min(.4,profile.twinkleAmp+.04),Math.max(.04,profile.twinkleAmp-.04)),
   vy:rand(profile.speedMax,profile.speedMin)
  });
 }
 return profile;
}

function advanceGalaxyGuardiansPreviewStarfield(dt){
 for(const s of S.st){
  if(!s)continue;
  s.tw=(+s.tw||0)+dt*1.9;
  s.y+=(+s.vy||12)*dt*.62;
  if(s.y>PLAY_H+(+s.s||1)){
   s.y=-((+s.s||1)+((s.vy||12)%9));
   s.x=(s.x+37+((s.vy||12)*.45))%PLAY_W;
  }
 }
}

function drawGalaxyGuardiansPreviewBackdrop(t){
 ctx.fillStyle='#000';
 ctx.fillRect(0,0,PLAY_W,PLAY_H);
 for(const s of S.st){
  const pulse=(s.twMin||.88)+Math.sin(s.tw+t*.9)*(s.twAmp||.16);
  ctx.globalAlpha=Math.max(.08,Math.min(1,(s.alpha||.62)*pulse));
  ctx.fillStyle=s.c;
  ctx.fillRect(s.x,s.y,s.s,s.s);
 }
 ctx.globalAlpha=1;
 ctx.fillStyle='rgba(255,255,255,.04)';
 ctx.fillRect(0,18,PLAY_W,1);
 ctx.fillRect(0,PLAY_H-38,PLAY_W,1);
}

function drawGalaxyGuardiansPlayer(player){
 const visual=galaxyGuardiansPreviewVisual(GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId);
 ctx.save();
 ctx.shadowColor='#7bd6ff';
 ctx.shadowBlur=3;
 drawGalaxyGuardiansPixelRows(visual,player.x,player.y,1.8);
 ctx.restore();
 const readyMissileVisible=!player.shot;
 if(readyMissileVisible){
  ctx.fillStyle='#ffdf6f';
  ctx.fillRect(Math.round(player.x)-1,Math.round(player.y)-12,2,5);
  ctx.fillStyle='#dff7ff';
  ctx.fillRect(Math.round(player.x),Math.round(player.y)-15,1,3);
 }
 if(player.shot){
  ctx.fillStyle='#ffe06d';
  ctx.fillRect(Math.round(player.shot.x)-1,Math.round(player.shot.y)-10,2,11);
  ctx.fillStyle='#dff7ff';
  ctx.fillRect(Math.round(player.shot.x),Math.round(player.shot.y)-14,1,5);
 }
 return readyMissileVisible;
}

function drawGalaxyGuardiansHitFlashes(state){
 ctx.save();
 for(const flash of state.hitFlashes||[]){
   const life=Math.max(0,Math.min(1,(+flash.t||0)/Math.max(.001,+flash.duration||.2)));
  const r=flash.role==='flagship'?15:flash.role==='escort'?11:9;
  const burst=flash.role==='flagship'?8:6;
  ctx.globalAlpha=.22+.5*life;
  ctx.strokeStyle=flash.color||'#dff7ff';
  ctx.lineWidth=1.3;
  ctx.shadowColor=flash.color||'#dff7ff';
  ctx.shadowBlur=10*life;
  for(let i=0;i<burst;i++){
   const ang=(Math.PI*2*i)/burst+(1-life)*.18;
   const inner=r*.28;
   const outer=r*(1.2-life*.18);
   ctx.beginPath();
   ctx.moveTo(flash.x+Math.cos(ang)*inner,flash.y+Math.sin(ang)*inner);
   ctx.lineTo(flash.x+Math.cos(ang)*outer,flash.y+Math.sin(ang)*outer);
   ctx.stroke();
  }
  ctx.globalAlpha=.25+.35*life;
  ctx.beginPath();
  ctx.arc(flash.x,flash.y,Math.max(2,r*(.55-life*.18)),0,Math.PI*2);
  ctx.stroke();
  ctx.globalAlpha=.38+.4*life;
  ctx.fillStyle=flash.role==='flagship'?'#fff7c2':flash.role==='escort'?'#ffdf6f':'#dff7ff';
  ctx.fillRect(Math.round(flash.x)-1,Math.round(flash.y)-1,3,3);
 }
 ctx.restore();
}

function drawGalaxyGuardiansEnemyShots(state){
 ctx.save();
 ctx.lineWidth=1.2;
 ctx.strokeStyle='#ffdf6f';
 ctx.shadowColor='#ff5b5b';
 ctx.shadowBlur=7;
 for(const shot of state.enemyShots||[]){
  if(!shot||shot.active===0)continue;
  ctx.beginPath();
  ctx.moveTo(shot.x,shot.y-4);
  ctx.lineTo(shot.x,shot.y+5);
  ctx.stroke();
  ctx.fillStyle='#fff7c2';
  ctx.fillRect(shot.x-1,shot.y+4,2,2);
 }
 ctx.restore();
}

function drawGalaxyGuardiansAlien(alien,t){
 const visual=galaxyGuardiansPreviewVisual(alien.visualId);
 if(!visual)return;
 const cell=alien.role==='flagship'?1.65:alien.role==='escort'?1.45:1.4;
 ctx.save();
 ctx.translate(Math.round(alien.x),Math.round(alien.y));
 ctx.shadowColor=alien.role==='flagship'?'#ffdf6f':alien.role==='escort'?'#ff5b5b':'#42f285';
 ctx.shadowBlur=alien.mode==='diving'?4:1.5;
 if(alien.mode==='diving'){
  const lean=Math.sin(alien.diveT*5)*.18+alien.diveSide*.08;
  ctx.rotate(lean);
 }
 const bob=alien.mode==='formation'?Math.sin(t*3+alien.row)*1.1:0;
 drawGalaxyGuardiansPixelRows(visual,0,bob,cell);
 ctx.restore();
 if(alien.mode==='diving'){
  ctx.save();
  ctx.globalAlpha=.22;
  ctx.strokeStyle=alien.role==='flagship'?'#ffdf6f':'#7bd6ff';
  ctx.beginPath();
  ctx.moveTo(alien.x,alien.y-8);
  ctx.lineTo(alien.x-alien.diveSide*9,alien.y-22);
  ctx.stroke();
  ctx.restore();
 }
}

function drawGalaxyGuardiansPreviewReserveShips(lives){
 const reserve=Math.max(0,(lives|0)-1);
 const visual=galaxyGuardiansPreviewVisual(GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId);
 let x=16;
 const y=PLAY_H-9;
 for(let i=0;i<reserve;i++){
  drawGalaxyGuardiansPixelRows(visual,x,y,1.1,{ flare:'#ff5b5b' });
  x+=14;
 }
 return reserve;
}

function drawGalaxyGuardiansPreviewStageFlags(stage){
 const total=Math.max(0,stage|0);
 let x=PLAY_W-14;
 let y=PLAY_H-8;
 for(let i=0;i<total;i++){
  const big=(i%5)===4;
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle='rgba(228,242,255,.88)';
  ctx.fillRect(-.5,big?-9:-6,1,big?9:6);
  ctx.fillStyle=big?'#7bd6ff':'#ff5b5b';
  ctx.beginPath();
  ctx.moveTo(0,big?-9:-6);
  ctx.lineTo(big?6:4,big?-7:-4.5);
  ctx.lineTo(0,big?-4:-2.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  x-=big?11:8;
 }
 return total;
}

function drawGalaxyGuardiansPreviewHud(summary,state){
 ctx.save();
 ctx.font='7px "Courier New", Consolas, monospace';
 ctx.textBaseline='top';
 ctx.fillStyle='#ff5b73';
 ctx.fillText('1UP',18,16);
 ctx.fillStyle='#dff7ff';
 ctx.fillText(String(summary.score||0).padStart(6,'0'),48,16);
 ctx.fillStyle='#dff7ff';
 ctx.fillText('HIGH SCORE',104,16);
 ctx.fillStyle='#ffdf6f';
 ctx.fillText(String(Math.max(summary.score||0,+S.best||0)).padStart(6,'0'),170,16);
 ctx.fillStyle='#7bd6ff';
 ctx.fillText(`STAGE ${(summary.stage||1).toString().padStart(2,'0')}`,232,16);
 ctx.fillStyle='rgba(216,236,255,.82)';
 ctx.fillText('CREDIT 0',12,PLAY_H-20);
 ctx.fillStyle='#ffdf6f';
 ctx.fillText(summary.gameOver?'GUARDIANS GAME OVER':'WE ARE THE GALAXY GUARDIANS',48,PLAY_H-28);
 ctx.fillStyle='#7bd6ff';
 ctx.fillText(summary.gameOver?'PRESS CHOOSE GAME FOR CABINET SELECT':'SINGLE SHOT  FLAGSHIP ESCORTS  TOP REENTRY',26,PLAY_H-17);
 ctx.restore();
 return {
  reserveShipCount:drawGalaxyGuardiansPreviewReserveShips(state.lives||0),
  stageFlagCount:drawGalaxyGuardiansPreviewStageFlags(summary.stage||1)
 };
}

function stepGalaxyGuardiansPreviewState(now){
 if(!galaxyGuardiansPreviewState)resetGalaxyGuardiansPreviewRenderState();
 const last=galaxyGuardiansPreviewLastT||now;
 const dt=Math.max(1/60,Math.min(.05,(now-last)/1000||1/60));
 galaxyGuardiansPreviewLastT=now;
 galaxyGuardiansPreviewFireT=Math.max(0,galaxyGuardiansPreviewFireT-dt);
 advanceGalaxyGuardiansPreviewStarfield(dt);
 const state=galaxyGuardiansPreviewState;
 const target=state.aliens.filter(alien=>alien.hp>0).sort((a,b)=>b.y-a.y)[0];
 const input={
  left:target?state.player.x>target.x+8:Math.sin(state.t)>0,
  right:target?state.player.x<target.x-8:Math.sin(state.t)<=0,
  fire:galaxyGuardiansPreviewFireT<=0
 };
 if(input.fire)galaxyGuardiansPreviewFireT=.92;
 stepGalaxyGuardiansRuntime(state,dt,input);
 return state;
}

function drawGalaxyGuardiansPreviewBoard({ox,oy,scale,dx,dy}){
 const activeState=typeof currentGalaxyGuardiansDevPreviewState==='function'
  ? currentGalaxyGuardiansDevPreviewState()
  : null;
 const now=performance.now();
 const state=activeState||stepGalaxyGuardiansPreviewState(now);
 const summary=summarizeGalaxyGuardiansRuntime(state);
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,c.width,c.height);
 ctx.fillStyle='#000';
 ctx.fillRect(0,0,c.width,c.height);
 ctx.setTransform(DPR*scale,0,0,DPR*scale,(ox+dx*.25)*DPR,(oy+dy*.25)*DPR);
 ctx.save();
 ctx.beginPath();
 ctx.rect(0,0,PLAY_W,PLAY_H);
 ctx.clip();
 const t=state.t;
 const starfield=syncGalaxyGuardiansPreviewStarfield();
 drawGalaxyGuardiansPreviewBackdrop(t);
 for(const alien of state.aliens)if(alien.hp>0)drawGalaxyGuardiansAlien(alien,t);
  drawGalaxyGuardiansHitFlashes(state);
 drawGalaxyGuardiansEnemyShots(state);
 const readyMissileVisible=state.player.visible!==false?drawGalaxyGuardiansPlayer(state.player):false;
 const hud=drawGalaxyGuardiansPreviewHud(summary,state);
 ctx.restore();
 ctx.setTransform(1,0,0,1,0,0);
 window.__platinumRenderDebug.renderTick=(window.__platinumRenderDebug.renderTick||0)+1;
 window.__platinumRenderDebug.backgroundMode='guardians-dev-preview';
 window.__platinumRenderDebug.starfieldProfile=starfield?.id||'guardians-signal-stars';
 Object.assign(window.__galaxyGuardiansPreviewRenderDebug,{
  renderTick:(window.__galaxyGuardiansPreviewRenderDebug.renderTick||0)+1,
  renderMode:'galaxy-guardians-dev-preview',
  visualIds:summary.visualIds,
  audioCueIds:summary.audioCueIds,
  alienCount:summary.alienCount,
  enemyShotCount:summary.enemyShotCount,
  hitFlashCount:summary.hitFlashCount,
  score:summary.score,
  reserveShipCount:hud.reserveShipCount,
  stageFlagCount:hud.stageFlagCount,
  hudLabels:['1UP','HIGH SCORE'],
  readyMissileVisible:!!readyMissileVisible,
  wrappingCount:+(summary.wrappingCount||0),
  marchOffset:+guardiansMarchOffset(state,state.aliens.find(alien=>alien.hp>0&&alien.mode==='formation')||{ row:0,col:0 }).toFixed(3),
  starfieldCount:S.st.length,
  starfieldLeadSample:(S.st||[]).slice(0,4).map(star=>({
   x:+(+star.x||0).toFixed(2),
   y:+(+star.y||0).toFixed(2),
   vy:+(+star.vy||0).toFixed(2)
  }))
 });
}

window.shouldDrawGalaxyGuardiansPreviewBoard=shouldDrawGalaxyGuardiansPreviewBoard;
window.resetGalaxyGuardiansPreviewRenderState=resetGalaxyGuardiansPreviewRenderState;
window.drawGalaxyGuardiansPreviewBoard=drawGalaxyGuardiansPreviewBoard;

registerGameBoardRenderer(GALAXY_GUARDIANS_PACK.metadata.gameKey,{
 label:'Galaxy Guardians preview board renderer',
 previewOnly:true,
 canDraw(){
  const playable=typeof currentGamePackHasPlayableAdapter==='function'&&currentGamePackHasPlayableAdapter();
  const devPreview=typeof currentGalaxyGuardiansDevPreviewState==='function'
   && !!currentGalaxyGuardiansDevPreviewState();
  return shouldDrawGalaxyGuardiansPreviewBoard()&&(!started||!playable||devPreview);
 },
 draw:drawGalaxyGuardiansPreviewBoard
});

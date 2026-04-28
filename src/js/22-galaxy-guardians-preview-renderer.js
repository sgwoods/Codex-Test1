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
 return typeof currentGamePackKey==='function'
  && currentGamePackKey()==='galaxy-guardians-preview'
  && typeof createGalaxyGuardiansRuntimeState==='function'
  && typeof stepGalaxyGuardiansRuntime==='function'
  && typeof summarizeGalaxyGuardiansRuntime==='function';
}

function resetGalaxyGuardiansPreviewRenderState(seed=1979){
 galaxyGuardiansPreviewState=shouldDrawGalaxyGuardiansPreviewBoard()
  ? createGalaxyGuardiansRuntimeState({stage:1,ships:3,seed})
  : null;
 galaxyGuardiansPreviewLastT=0;
 galaxyGuardiansPreviewFireT=0;
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
 ctx.save();
 ctx.translate(Math.round(x-width*cell/2),Math.round(y-height*cell/2));
 for(let row=0;row<rows.length;row++){
  for(let col=0;col<rows[row].length;col++){
   if(rows[row][col]!== 'X')continue;
   const edge=col===0||col===rows[row].length-1||row===0||row===rows.length-1;
   const center=Math.abs(col-(rows[row].length-1)/2)<1.1;
   ctx.fillStyle=edge?wing:(center?accent:core);
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

function drawGalaxyGuardiansPreviewBackdrop(t){
 const g=ctx.createLinearGradient(0,0,0,PLAY_H);
 g.addColorStop(0,'#030610');
 g.addColorStop(.55,'#071025');
 g.addColorStop(1,'#02040a');
 ctx.fillStyle=g;
 ctx.fillRect(0,0,PLAY_W,PLAY_H);
 for(const s of S.st){
  const pulse=(s.twMin||.88)+Math.sin(s.tw+t*.9)*(s.twAmp||.16);
  ctx.globalAlpha=Math.max(.08,Math.min(1,(s.alpha||.62)*pulse));
  ctx.fillStyle=s.c;
  ctx.fillRect(s.x,s.y,s.s,s.s);
 }
 ctx.globalAlpha=1;
 ctx.strokeStyle='rgba(255,91,91,.24)';
 ctx.lineWidth=1;
 for(let i=0;i<5;i++){
  const y=46+i*28+Math.sin(t*.8+i)*2;
  ctx.beginPath();
  ctx.moveTo(24,y);
  ctx.lineTo(PLAY_W-24,y+Math.sin(t*.6+i)*4);
  ctx.stroke();
 }
 ctx.fillStyle='rgba(255,216,109,.08)';
 ctx.fillRect(0,PLAY_H-34,PLAY_W,1);
}

function drawGalaxyGuardiansPlayer(player){
 const visual=galaxyGuardiansPreviewVisual(GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId);
 drawGalaxyGuardiansPixelRows(visual,player.x,player.y,2.2);
 if(player.shot){
  ctx.fillStyle='#ffe06d';
  ctx.fillRect(Math.round(player.shot.x)-1,Math.round(player.shot.y)-10,2,11);
  ctx.fillStyle='#dff7ff';
  ctx.fillRect(Math.round(player.shot.x),Math.round(player.shot.y)-14,1,5);
 }
}

function drawGalaxyGuardiansAlien(alien,t){
 const visual=galaxyGuardiansPreviewVisual(alien.visualId);
 if(!visual)return;
 const cell=alien.role==='flagship'?2.25:alien.role==='escort'?2.05:1.95;
 ctx.save();
 ctx.translate(Math.round(alien.x),Math.round(alien.y));
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

function drawGalaxyGuardiansPreviewHud(summary){
 ctx.save();
 ctx.font='7px "Courier New", Consolas, monospace';
 ctx.textBaseline='top';
 ctx.fillStyle='#ff5b73';
 ctx.fillText('1UP',18,16);
 ctx.fillStyle='#dff7ff';
 ctx.fillText(String(summary.score||0).padStart(6,'0'),48,16);
 ctx.fillStyle='#ffdf6f';
 ctx.fillText('GUARDIANS DEV PREVIEW',76,PLAY_H-26);
 ctx.fillStyle='#7bd6ff';
 ctx.fillText('SINGLE SHOT  FLAGSHIP ESCORTS  WRAP THREAT',32,PLAY_H-15);
 ctx.restore();
}

function stepGalaxyGuardiansPreviewState(now){
 if(!galaxyGuardiansPreviewState)resetGalaxyGuardiansPreviewRenderState();
 const last=galaxyGuardiansPreviewLastT||now;
 const dt=Math.max(1/60,Math.min(.05,(now-last)/1000||1/60));
 galaxyGuardiansPreviewLastT=now;
 galaxyGuardiansPreviewFireT=Math.max(0,galaxyGuardiansPreviewFireT-dt);
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
 const now=performance.now();
 const state=stepGalaxyGuardiansPreviewState(now);
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
 const starfield=typeof syncStarfieldProfile==='function'?syncStarfieldProfile({frontDoor:1,attractPhase:'guardians-preview'}):null;
 drawGalaxyGuardiansPreviewBackdrop(t);
 for(const alien of state.aliens)if(alien.hp>0)drawGalaxyGuardiansAlien(alien,t);
 drawGalaxyGuardiansPlayer(state.player);
 drawGalaxyGuardiansPreviewHud(summary);
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
  score:summary.score
 });
}

window.shouldDrawGalaxyGuardiansPreviewBoard=shouldDrawGalaxyGuardiansPreviewBoard;
window.resetGalaxyGuardiansPreviewRenderState=resetGalaxyGuardiansPreviewRenderState;
window.drawGalaxyGuardiansPreviewBoard=drawGalaxyGuardiansPreviewBoard;

registerGameBoardRenderer(GALAXY_GUARDIANS_PACK.metadata.gameKey,{
 label:'Galaxy Guardians dev preview board renderer',
 previewOnly:true,
 canDraw(){
  const playable=typeof currentGamePackHasPlayableAdapter==='function'&&currentGamePackHasPlayableAdapter();
  return shouldDrawGalaxyGuardiansPreviewBoard()&&(!started||!playable);
 },
 draw:drawGalaxyGuardiansPreviewBoard
});

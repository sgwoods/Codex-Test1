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
 galaxyGuardiansPreviewFireT=.38;
 return galaxyGuardiansPreviewState;
}

function galaxyGuardiansPreviewVisual(id){
 const catalog=GALAXY_GUARDIANS_PACK?.alienVisualCatalog||{};
 return catalog[id]||null;
}

function resolveGalaxyGuardiansPreviewTheme(stage=1){
 const stagePresentation=typeof currentGamePackStagePresentation==='function'
  ? currentGamePackStagePresentation(Math.max(1,+stage||1),0)
  : null;
 const themeId=stagePresentation?.atmosphereTheme||GALAXY_GUARDIANS_PACK?.frontDoor?.atmosphereTheme||'signal-rack';
 return (GALAXY_GUARDIANS_PACK?.atmosphereThemes&&GALAXY_GUARDIANS_PACK.atmosphereThemes[themeId])
  || GALAXY_GUARDIANS_PACK?.atmosphereThemes?.['signal-rack']
  || null;
}

function resolveGalaxyGuardiansPreviewPalette(visual,theme){
 if(!visual)return {};
 const overrides=(theme&&theme.previewPalettes&&typeof theme.previewPalettes==='object')
  ? (theme.previewPalettes[visual.id]||theme.previewPalettes[visual.role]||null)
  : null;
 const base=Object.assign({},visual.palette||{});
 if(!overrides)return base;
 const merged=Object.assign({},base,overrides||{});
 if(base.core)merged.core=base.core;
 if(base.wing)merged.wing=base.wing;
 return merged;
}

function applyGalaxyGuardiansStageOneRowPalette(alien,palette){
 if(!alien||!palette)return palette;
 const row=Math.max(0,+alien.row||0);
 if(row===0){
  return Object.assign({},palette,{
   core:'#ffe26a',
   wing:'#ff5b5b',
   accent:'#7bd6ff',
   flare:'#fff2a4'
  });
 }
 if(row===1){
  return Object.assign({},palette,{
   core:'#ff7468',
   wing:'#f6f0ff',
   accent:'#ffd86d',
   flare:'#ffb38a'
  });
 }
 if(row===2){
  return Object.assign({},palette,{
   core:'#b68cff',
   wing:'#f2e6ff',
   accent:'#ffd86d',
   flare:'#7bd6ff'
  });
 }
 if(row===3){
  return Object.assign({},palette,{
   core:'#99beff',
   wing:'#6f78ff',
   accent:'#dff7ff',
   flare:'#ffd86d'
  });
 }
 return Object.assign({},palette,{
  core:'#7bc6ff',
  wing:'#4b7dff',
  accent:'#f4f8ff',
  flare:'#ff5b5b'
 });
}

function resolveGalaxyGuardiansPreviewStarfieldProfile(stage=1){
 const theme=resolveGalaxyGuardiansPreviewTheme(stage);
 const graphics=typeof currentGraphicsOverrides==='function'
  ? currentGraphicsOverrides()
  : { starfieldIntensity:1, starfieldSpeed:1 };
 const intensityScale=typeof sanitizeStarfieldMultiplier==='function'
  ? sanitizeStarfieldMultiplier(graphics.starfieldIntensity,1)
  : Math.max(.25,+graphics.starfieldIntensity||1);
 const speedScale=typeof sanitizeStarfieldMultiplier==='function'
  ? sanitizeStarfieldMultiplier(graphics.starfieldSpeed,1)
  : Math.max(.25,+graphics.starfieldSpeed||1);
 const profile=Object.assign({
  id:'guardians-signal-stars',
  count:116,
  sizeMin:.78,
  sizeMax:1.58,
  alphaMin:.34,
  alphaMax:.92,
  twinkleMin:.78,
  twinkleAmp:.22,
  speedMin:18,
  speedMax:38,
  driftMin:-9,
  driftMax:9,
  palette:['#fffdf0','#ffe26a','#ff5b5b','#7bd6ff','#4af26d','#f6f0ff','#ffd4a8','#59a8ff']
 }, theme?.starfield||{});
 profile.alphaMin=Math.min(1,Math.max(.08,profile.alphaMin*intensityScale));
 profile.alphaMax=Math.min(1,Math.max(profile.alphaMin,profile.alphaMax*intensityScale));
 profile.speedMin=Math.max(2,profile.speedMin*speedScale);
 profile.speedMax=Math.max(profile.speedMin,profile.speedMax*speedScale);
 profile.intensityScale=intensityScale;
 profile.speedScale=speedScale;
 return profile;
}

function blendGalaxyGuardiansStagePalette(alien,palette,theme,stage=1){
 if(!alien||!theme||!Array.isArray(theme.palette)||!theme.palette.length)return palette;
 const stageIndex=Math.max(1,+stage||1);
 const basePalette=stageIndex<=1
  ? applyGalaxyGuardiansStageOneRowPalette(alien,Object.assign({},palette))
  : Object.assign({},palette);
 if(stageIndex<=1)return basePalette;
 const source=theme.palette.filter(Boolean);
 if(!source.length)return basePalette;
 const roleOffset=alien.role==='flagship'?0:alien.role==='escort'?2:4;
 const idx=(stageIndex-1+roleOffset)%source.length;
 const pick=offset=>source[(idx+offset+source.length)%source.length];
 return Object.assign({},basePalette,{
  accent:pick(0),
  flare:pick(1),
  eye:palette.eye||'#ffffff'
 });
}

function drawGalaxyGuardiansPixelRows(visual,x,y,cell=2,opts={}){
 if(!visual?.pixelRows)return;
 const rows=visual.pixelRows;
 const width=Math.max(...rows.map(row=>row.length));
 const height=rows.length;
 const palette=(opts.palette&&typeof opts.palette==='object')?opts.palette:(visual.palette||{});
 const core=opts.core||palette.core||'#dff7ff';
 const wing=opts.wing||palette.wing||core;
 const accent=opts.accent||palette.accent||core;
 const eye=opts.eye||palette.eye||'#ffffff';
 const flare=opts.flare||palette.flare||accent;
 const pulseFrame=Math.max(0,Math.min(1,+opts.pulseFrame||0));
 const pulseX=Math.max(.2,+opts.pulseX||1);
 const pulseY=Math.max(.2,+opts.pulseY||1);
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
 if(pulseFrame>.08){
  const wingReach=Math.max(1,Math.round(pulseFrame*(1.8+pulseX*2.4)));
  const glowHeight=Math.max(1,Math.round(pulseFrame*(1.4+pulseY*1.85)));
  const midY=Math.round(height*.38)*cell;
  const centerX=Math.round((width-1)*.5)*cell;
  const outerPad=Math.max(1,Math.round(pulseFrame*1.6));
  ctx.globalAlpha=.18+.24*pulseFrame;
  ctx.fillStyle=flare;
  ctx.fillRect(-wingReach,midY-cell,wingReach,Math.max(cell+1,glowHeight+1));
  ctx.fillRect(width*cell,midY-cell,wingReach,Math.max(cell+1,glowHeight+1));
  ctx.globalAlpha=.26+.28*pulseFrame;
  ctx.fillStyle=accent;
  ctx.fillRect(centerX,Math.max(0,midY-cell-glowHeight-outerPad),Math.max(1,cell),glowHeight+outerPad+1);
  if(height>=6){
   const lowerY=Math.min((height-1)*cell,midY+cell);
   ctx.fillRect(centerX,lowerY,Math.max(1,cell),glowHeight+outerPad+1);
  }
  ctx.globalAlpha=.14+.12*pulseFrame;
  ctx.fillStyle=core;
  ctx.fillRect(Math.max(0,centerX-cell*2),Math.max(0,midY-glowHeight),Math.max(1,cell*4),Math.max(1,glowHeight*2));
  ctx.globalAlpha=1;
 }
 ctx.restore();
}

function syncGalaxyGuardiansPreviewStarfield(stage=1){
 const profile=resolveGalaxyGuardiansPreviewStarfieldProfile(stage);
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
   vy:rand(profile.speedMax,profile.speedMin),
   vx:rand(profile.driftMax||0,profile.driftMin||0),
   depth:rand(.94,1.28),
   glow:rand(1.2,.4),
   lead:randUnit()<.18,
   trailGain:rand(1.32,.9)
  });
 }
 return profile;
}

function advanceGalaxyGuardiansPreviewStarfield(dt){
 for(const s of S.st){
  if(!s)continue;
  s.tw=(+s.tw||0)+dt*1.9;
  const depth=+s.depth||1;
  s.y+=(+s.vy||12)*dt*.92*depth;
  s.x+=(+s.vx||0)*dt*.58*depth;
  if(s.x>PLAY_W+(+s.s||1))s.x=-((+s.s||1)+((s.vx||0)%5));
  else if(s.x<-(+s.s||1))s.x=PLAY_W+((+s.s||1)+Math.abs((s.vx||0)%5));
  if(s.y>PLAY_H+(+s.s||1)){
   s.y=-((+s.s||1)+((s.vy||12)%11));
   s.x=(s.x+41+((s.vy||12)*.48)+((s.vx||0)*2.1))%PLAY_W;
  }
 }
}

function drawGalaxyGuardiansPreviewBackdrop(t,theme){
 theme=theme||resolveGalaxyGuardiansPreviewTheme(1)||{};
 const backdrop=theme.backdrop||{};
 const top=backdrop.top||'#0e1836';
 const mid=backdrop.mid||'#030611';
 const bottom=backdrop.bottom||'#000000';
 const horizon=backdrop.horizon||'rgba(255,91,91,.16)';
 const lowerGlow=backdrop.lowerGlow||'rgba(123,214,255,.12)';
 const scan=backdrop.scan||'rgba(255,255,255,.05)';
 ctx.fillStyle='#000';
 ctx.fillRect(0,0,PLAY_W,PLAY_H);
 const sky=ctx.createLinearGradient(0,0,0,PLAY_H);
 sky.addColorStop(0,top);
 sky.addColorStop(.52,mid);
 sky.addColorStop(1,bottom);
 ctx.fillStyle=sky;
 ctx.fillRect(0,0,PLAY_W,PLAY_H);
 ctx.globalAlpha=.36+.08*Math.sin(t*.24);
 ctx.fillStyle=horizon;
 ctx.fillRect(0,PLAY_H-108,PLAY_W,58);
 ctx.globalAlpha=.24+.06*Math.cos(t*.31);
 ctx.fillStyle=lowerGlow;
 ctx.fillRect(0,PLAY_H-62,PLAY_W,26);
 for(const s of S.st){
  const pulse=(s.twMin||.88)+Math.sin(s.tw+t*.9)*(s.twAmp||.16);
  const alpha=Math.max(.12,Math.min(1,(s.alpha||.62)*pulse));
  const size=Math.max(1,Math.round(+s.s||1));
  const trail=Math.max(size,Math.min(6,Math.round((((+s.vy||12)/13)-.4)*(+s.trailGain||1))));
  const x=Math.round(s.x);
  const y=Math.round(s.y);
  const glowPad=size>1?1:0;
  ctx.globalAlpha=alpha*.1*(1+Math.min(.7,+s.glow||0));
  ctx.fillStyle=s.c;
  ctx.fillRect(x-glowPad,y-glowPad,size+glowPad*2,size+glowPad*2);
  ctx.globalAlpha=alpha;
  ctx.fillRect(x,y-trail,size,trail+size);
  if(s.lead){
   ctx.globalAlpha=Math.min(1,alpha*.82);
   ctx.fillRect(x-size,y,size*2+1,size);
   ctx.fillRect(x,y-size,size,size*2+1);
  }
 }
 ctx.globalAlpha=1;
 ctx.fillStyle=scan;
 ctx.fillRect(0,18,PLAY_W,1);
 ctx.fillRect(0,PLAY_H-38,PLAY_W,1);
}

function drawGalaxyGuardiansPlayer(player,theme){
 const visual=galaxyGuardiansPreviewVisual(GALAXY_GUARDIANS_RUNTIME_PROFILE.playerVisualId);
 const palette=resolveGalaxyGuardiansPreviewPalette(visual,theme);
 ctx.save();
 ctx.shadowColor='#7bd6ff';
 ctx.shadowBlur=3;
 drawGalaxyGuardiansPixelRows(visual,player.x,player.y,1.8,{ palette });
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

function drawGalaxyGuardiansHitFlashes(state,theme){
 const flashPalettes=(theme&&theme.previewPalettes&&typeof theme.previewPalettes==='object')?theme.previewPalettes:{};
 const roleVisualIdForFlash={flagship:'signal-flagship',escort:'signal-escort',scout:'signal-scout'};
 const burstVectors={
  scout:[[-4,0],[4,0],[0,-4],[0,4],[-3,-3],[3,-3],[-3,3],[3,3]],
  escort:[[-5,0],[5,0],[0,-5],[0,5],[-4,-3],[4,-3],[-4,3],[4,3],[-1,-6],[1,6]],
  flagship:[[-6,0],[6,0],[0,-6],[0,6],[-5,-4],[5,-4],[-5,4],[5,4],[-2,-7],[2,-7],[-2,7],[2,7]]
 };
 ctx.save();
 for(const flash of state.hitFlashes||[]){
  const life=Math.max(0,Math.min(1,(+flash.t||0)/Math.max(.001,+flash.duration||.2)));
  const visualId=roleVisualIdForFlash[flash.role]||'signal-scout';
  const palette=Object.assign(
   { core:'#dff7ff', wing:'#7bd6ff', accent:'#ffdf6f', eye:'#ffffff', flare:'#ff5b5b' },
   flashPalettes[visualId]||{}
  );
  const points=burstVectors[flash.role]||burstVectors.scout;
  const pixel=(flash.role==='flagship'?3.25:(flash.role==='escort'?2.65:2.3))*(+flash.burstScale||1);
  const ringRadius=(+flash.ringRadius||7)*(1-life*.25);
  const coreColor=flash.color||palette.core||'#dff7ff';
  const accentColor=flash.accentColor||palette.accent||'#7bd6ff';
  const flareColor=flash.flareColor||palette.flare||'#ffdf6f';
  const streaks=Math.max(6,+flash.streaks||8);
  const sparkInset=+flash.sparkInset||1.1;
  ctx.shadowColor=coreColor;
  ctx.shadowBlur=18*life;
  ctx.globalAlpha=.1+.18*life;
  ctx.fillStyle=flareColor;
  ctx.fillRect(Math.round(flash.x)-8,Math.round(flash.y)-8,16,16);
  ctx.globalAlpha=.18+.34*life;
  ctx.strokeStyle=accentColor;
  ctx.lineWidth=1.2;
  ctx.beginPath();
  ctx.arc(flash.x,flash.y,ringRadius,0,Math.PI*2);
  ctx.stroke();
  ctx.globalAlpha=.36+.34*life;
  ctx.fillStyle=flareColor;
  ctx.fillRect(Math.round(flash.x)-1,Math.round(flash.y)-Math.round(ringRadius),2,Math.round(ringRadius*2));
  ctx.fillRect(Math.round(flash.x)-Math.round(ringRadius),Math.round(flash.y)-1,Math.round(ringRadius*2),2);
  ctx.globalAlpha=.26+.4*life;
  for(let i=0;i<points.length;i++){
   const [dx,dy]=points[i];
   const drift=(1-life)*(flash.role==='flagship'?2.6:2.1);
   const px=Math.round(flash.x+dx*(.42+life*.74)+(dx===0?Math.sin(i+life)*drift:0));
   const py=Math.round(flash.y+dy*(.42+life*.74)+(dy===0?Math.cos(i+life)*drift:0));
   ctx.fillStyle=i%3===0?flareColor:(i%2===0?accentColor:(palette.wing||'#dff7ff'));
   ctx.fillRect(px,py,Math.ceil(pixel),Math.ceil(pixel));
  }
  ctx.globalAlpha=.32+.3*life;
  for(let i=0;i<streaks;i++){
   const theta=(Math.PI*2*i)/streaks+life*.22;
   const inner=ringRadius*sparkInset*.42;
   const outer=ringRadius*(1.28+(i%2)*.24);
   ctx.strokeStyle=i%2===0?accentColor:flareColor;
   ctx.beginPath();
   ctx.moveTo(flash.x+Math.cos(theta)*inner,flash.y+Math.sin(theta)*inner);
   ctx.lineTo(flash.x+Math.cos(theta)*outer,flash.y+Math.sin(theta)*outer);
   ctx.stroke();
  }
  ctx.globalAlpha=.44+.28*life;
  ctx.fillStyle=palette.eye||'#ffffff';
  ctx.fillRect(Math.round(flash.x)-2,Math.round(flash.y)-2,4,4);
  ctx.globalAlpha=.34+.22*life;
  ctx.fillStyle=palette.core||coreColor;
  ctx.fillRect(Math.round(flash.x)-1,Math.round(flash.y)-5,2,10);
  ctx.fillRect(Math.round(flash.x)-5,Math.round(flash.y)-1,10,2);
  ctx.globalAlpha=.18+.18*life;
  ctx.strokeStyle=accentColor;
  ctx.strokeRect(Math.round(flash.x)-4.5,Math.round(flash.y)-4.5,9,9);
  if(flash.showScore&&flash.points){
   const progress=1-life;
   ctx.globalAlpha=.24+.74*life;
   ctx.font=`${flash.role==='flagship'?9:8}px "Courier New", Consolas, monospace`;
   ctx.textAlign='center';
   ctx.textBaseline='bottom';
   ctx.fillStyle=flash.role==='flagship'?'#ffe39a':(flash.role==='escort'?'#ffd9a8':'#dff7ff');
   ctx.shadowColor=flareColor;
   ctx.shadowBlur=10*life;
   ctx.fillText(String(flash.points),Math.round(flash.x),Math.round(flash.y)-10-progress*(flash.role==='flagship'?18:12));
   ctx.textAlign='start';
   ctx.textBaseline='alphabetic';
  }
 }
 ctx.restore();
}

function drawGalaxyGuardiansClearTransition(state,theme){
 const clearT=+state.waveClearT||0;
 const flashT=+state.clearFlashT||0;
 if(clearT<=0&&flashT<=0)return;
 const backdrop=theme?.backdrop||{};
 const horizon=backdrop.horizon||'rgba(255,91,91,.18)';
 const lowerGlow=backdrop.lowerGlow||'rgba(123,214,255,.14)';
 const sweep=Math.max(clearT,flashT);
 ctx.save();
 ctx.globalAlpha=Math.min(.42,.16+sweep*.34);
 ctx.fillStyle=horizon;
 ctx.fillRect(0,PLAY_H-132,PLAY_W,18);
 ctx.globalAlpha=Math.min(.32,.08+sweep*.4);
 ctx.fillStyle=lowerGlow;
 ctx.fillRect(0,PLAY_H-86,PLAY_W,40);
 ctx.globalAlpha=Math.min(.5,.16+sweep*.52);
 ctx.fillStyle='rgba(255,242,164,.92)';
 ctx.fillRect(0,PLAY_H-40,PLAY_W,3);
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

function drawGalaxyGuardiansAlien(alien,t,theme,stage=1){
 const visual=galaxyGuardiansPreviewVisual(alien.visualId);
 if(!visual)return;
 const palette=blendGalaxyGuardiansStagePalette(
  alien,
  resolveGalaxyGuardiansPreviewPalette(visual,theme),
  theme,
  stage
 );
 const baseCell=alien.role==='flagship'?1.65:alien.role==='escort'?1.45:1.4;
 const pulseProfile=typeof stageBandProfile==='function'?stageBandProfile(stage,0):null;
 const pulsePhase=alien.mode==='formation'
  ? (Math.sin((t*(6.1+((+pulseProfile?.pulseX||1)*.28)))+alien.row*.82+alien.col*.34)+1)*.5
  : 0;
 const pulseScale=alien.mode==='formation'
  ? 1+(pulsePhase*(alien.role==='flagship'?.16:(alien.role==='escort'?.13:.11)))
  : 1;
 const cell=baseCell*pulseScale;
 ctx.save();
 ctx.translate(Math.round(alien.x),Math.round(alien.y));
 ctx.shadowColor=palette.flare||palette.accent||palette.core||'#7bd6ff';
 ctx.shadowBlur=alien.mode==='diving'?4:(2.4+pulsePhase*5.2);
 if(alien.mode==='diving'){
  const lean=Math.sin(alien.diveT*5)*.18+alien.diveSide*.08;
  ctx.rotate(lean);
 }
 const bob=alien.mode==='formation'?Math.sin(t*3.4+alien.row)*1.15:0;
 drawGalaxyGuardiansPixelRows(visual,0,bob,cell,{
  palette,
  pulseFrame:Math.min(1,pulsePhase*1.18),
  pulseX:pulseProfile?.pulseX||1,
  pulseY:pulseProfile?.pulseY||1
 });
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
 ctx.shadowBlur=4;
 ctx.fillStyle='#7bd6ff';
 ctx.shadowColor='rgba(123,214,255,.34)';
 ctx.fillText(`STAGE ${(summary.stage||1).toString().padStart(2,'0')}`,224,12);
 ctx.shadowBlur=0;
 ctx.fillStyle='rgba(216,236,255,.84)';
 ctx.fillText('CREDIT 0',12,PLAY_H-20);
 ctx.textAlign='center';
 ctx.fillStyle='#ffdf6f';
 ctx.shadowBlur=6;
 ctx.shadowColor='rgba(255,223,111,.32)';
 ctx.fillText(summary.gameOver?'GUARDIANS GAME OVER':'WE ARE THE GALAXY GUARDIANS',PLAY_W*.5,PLAY_H-29);
 ctx.font='6px "Courier New", Consolas, monospace';
 ctx.fillStyle=summary.gameOver?'#dff7ff':'#ffb997';
 ctx.shadowBlur=3;
 ctx.shadowColor='rgba(255,185,151,.28)';
 ctx.fillText(summary.gameOver?'PRESS CHOOSE GAME FOR CABINET SELECT':'SINGLE SHOT  FLAGSHIP ESCORTS  TOP REENTRY',PLAY_W*.5,PLAY_H-19);
 ctx.fillStyle='rgba(123,214,255,.96)';
 ctx.shadowColor='rgba(123,214,255,.26)';
 ctx.fillText(summary.gameOver?'RETURN TO PLATINUM SELECT':'MOVING STARFIELD  LIVE FORMATION PRESSURE',PLAY_W*.5,PLAY_H-11);
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
 const previewTheme=resolveGalaxyGuardiansPreviewTheme(summary.stage||state.stage||1);
 const starfield=syncGalaxyGuardiansPreviewStarfield(summary.stage||state.stage||1);
 drawGalaxyGuardiansPreviewBackdrop(t,previewTheme);
 for(const alien of state.aliens)if(alien.hp>0)drawGalaxyGuardiansAlien(alien,t,previewTheme,summary.stage||state.stage||1);
 drawGalaxyGuardiansHitFlashes(state,previewTheme);
 drawGalaxyGuardiansClearTransition(state,previewTheme);
 drawGalaxyGuardiansEnemyShots(state);
 const readyMissileVisible=state.player.visible!==false?drawGalaxyGuardiansPlayer(state.player,previewTheme):false;
 const hud=drawGalaxyGuardiansPreviewHud(summary,state);
 ctx.restore();
 ctx.setTransform(1,0,0,1,0,0);
 window.__platinumRenderDebug.renderTick=(window.__platinumRenderDebug.renderTick||0)+1;
 window.__platinumRenderDebug.backgroundMode='guardians-dev-preview';
 window.__platinumRenderDebug.starfieldProfile=starfield?.id||'guardians-signal-stars';
 window.__platinumRenderDebug.starfieldCount=S.st.length;
 window.__platinumRenderDebug.starfieldIntensityScale=+(starfield?.intensityScale||1);
 window.__platinumRenderDebug.starfieldSpeedScale=+(starfield?.speedScale||1);
 window.__platinumRenderDebug.starfieldLeadSample=(S.st||[]).slice(0,4).map(star=>({
  x:+(+star.x||0).toFixed(2),
  y:+(+star.y||0).toFixed(2),
  vy:+(+star.vy||0).toFixed(2),
  vx:+(+star.vx||0).toFixed(2)
 }));
 Object.assign(window.__galaxyGuardiansPreviewRenderDebug,{
 renderTick:(window.__galaxyGuardiansPreviewRenderDebug.renderTick||0)+1,
 renderMode:'galaxy-guardians-dev-preview',
  visualIds:summary.visualIds,
  audioCueIds:summary.audioCueIds,
  alienCount:summary.alienCount,
  enemyShotCount:summary.enemyShotCount,
  hitFlashCount:summary.hitFlashCount,
  score:summary.score,
  bestScore:+(+S.best||0),
  scoreStorageGameKey:typeof currentScoreStorageGameKey==='function'?currentScoreStorageGameKey():'',
  reserveShipCount:hud.reserveShipCount,
  stageFlagCount:hud.stageFlagCount,
  hudLabels:['STAGE'],
  readyMissileVisible:!!readyMissileVisible,
  wrappingCount:+(summary.wrappingCount||0),
  stageThemeId:previewTheme?.id||'signal-rack',
  paletteDiversityCount:new Set((state.aliens||[]).filter(alien=>alien.hp>0).map(alien=>blendGalaxyGuardiansStagePalette(
   alien,
   resolveGalaxyGuardiansPreviewPalette(galaxyGuardiansPreviewVisual(alien.visualId),previewTheme),
   previewTheme,
   summary.stage||state.stage||1
  ).core)).size,
  marchOffset:+guardiansMarchOffset(state,state.aliens.find(alien=>alien.hp>0&&alien.mode==='formation')||{ row:0,col:0 }).toFixed(3),
  starfieldCount:S.st.length,
  starfieldLeadSample:[...(window.__platinumRenderDebug.starfieldLeadSample||[])]
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

// Aurora-specific board rendering, sprites, and hitbox helpers.
window.__platinumRenderDebug=window.__platinumRenderDebug||window.__auroraRenderDebug||{carryDraws:[],captureTetherVisible:false,capturedGhostVisible:false,renderTick:0};
window.__auroraRenderDebug=window.__platinumRenderDebug;
const FAMILY_PIXELS={
 scorpion:[[1,0],[5,0],[0,2],[6,2]],
 stingray:[[2,0],[3,0],[1,4],[4,4]],
 galboss:[[0,1],[6,1],[2,4],[4,4]],
 crown:[[3,0],[1,1],[5,1],[0,4],[6,4]],
 dragonfly:[[1,0],[5,0],[0,3],[6,3]],
 mosquito:[[2,0],[4,0],[1,4],[5,4]]
};

const TARGET_SPRITE_ROWS=Object.freeze({
 ship:Object.freeze([
  '....W.......',
  '....W.......',
  '....W.......',
  '...WWW......',
  '...WWW......',
  'R..WWW..R...',
  'R..WWW..R...',
  'W.WWWWW.W...',
  'WBWWRWWBW...',
  'BWWRRRWWB...',
  'WWWRWRWWW...',
  'WWWWWWWWWW..',
  'WWRWWWRWWW..',
  '.RRWWWRR....',
  '.RR.W.RR....'
 ]),
 bee:Object.freeze([
  '.BB....Y....B..',
  '.BB..YYYRY.BB..',
  '..BBRRRYRYBB...',
  '...BBRRYRRB....',
  '....YYYYYY.....',
  '...BBBYYYBB....',
  '..BBBBRRRBBB...',
  '.BBBBRRRR.BBBB.',
  'BBBBBYYYY.BBBBB',
  'BBBBBRRRR.BBBBB',
  'BBBB..RRR..BBBB',
  'BBBB...R...BBB.'
 ]),
 beeOpen:Object.freeze([
  'BBBBR...........',
  'RWWWRRR.........',
  'RWWWWRR.........',
  'RRBBBRRR........',
  'RRBBB.RR........',
  'R..B............',
  'R...............',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '......B.........',
  '..Y...B.........',
  '.RYRYB..........'
 ]),
 but:Object.freeze([
  '.................',
  '.RR...........RR.',
  '.RR...BB.BB...RR.',
  '.RR...BB.BB...RR.',
  '.RR.WWRRWRRWW.RR.',
  '.RR.WWRRWRRWW.RR.',
  '.RR.WWWWWWWWW.RR.',
  '.RRRRRWWWWWRRRRR.',
  '.RRRRRWWWWWRRRRR.',
  '....RRBBBBBRR....',
  '.RRRRRBBBBBRRRRR.',
  '.RRRRRBBBBBRRRRR.',
  '.RRRRRWWWWWRRRRR.',
  '.RRRRRWWWWWRRRRR.',
  '.RRRR.BBBBB.RRRR.',
  '.RRRR.BBBBB.RRRR.',
  '.RRRR...B...RRRR.',
  '.................'
 ]),
 butOpen:Object.freeze([
  '.MM.M..BB......B',
  '..M.M.BBB.....BB',
  '.......BB.....BM',
  'BB....BB......BM',
  'BBB...B.......BM',
  '.BBB.B........BB',
  '...B...........B',
  '................',
  '................',
  '................',
  '................',
  '.....R..........',
  '.....R..........',
  '..B..R.........R',
  'BWRW..R........R',
  'RBBBBRR........R'
 ]),
 boss:Object.freeze([
  '.GGRRRGG.RRR.',
  '.GG.R.GG..RR.',
  '....R......R.',
  '.............',
  '.............',
  '....B.B......',
  '....B.B......',
  '.BBRRBRRBB...',
  '..BRRBRRB....',
  '...BBBBB.....',
  '..BYYBYYB....',
  'BBBYYYYYBBB..',
  'BBBYYYYYBBBB.',
  'BBBYYYYYBBB..',
  'RBB.R.R.BBR..',
  'RB..R.R..BR..'
 ]),
 bossOpen:Object.freeze([
  '.GG.R........RRR',
  '.............RR.',
  '.............R..',
  '................',
  '................',
  '................',
  '..B..B..........',
  'BBRRB...........',
  'RBRR............',
  'RBBBBBB.........',
  'BYBYYBBB.B......',
  'YYYYYBBBB.......',
  'YYYYYY.BB....BB.',
  'BYYYY..BB....B..',
  '.YR.R..BB....B..',
  '..R.R.BBB....BB.'
 ]),
 challengeGreen:Object.freeze([
  'R.R.C.C.........',
  'R.R.CCC........C',
  '.Y...CC........C',
  '.YYY.CC.........',
  '.YYYCC..........',
  'CYYYY...........',
  '..YYY...........',
  '..YY............',
  '...Y............',
  '...Y..Y.........',
  '....YY..........',
  '................',
  '................',
  '................',
  '................',
  '................'
 ]),
 challengeYellow:Object.freeze([
  '................',
  '.G..............',
  '.G..............',
  'MGMMM...........',
  'MGGGMM..........',
  'GGRGGGG.........',
  'GGRGGGGG........',
  'GRRRGGGGG.......',
  'GGGGG..GG......G',
  'G.GGG...G......G',
  '...G...........G',
  '...G...........G',
  '...G............',
  '................',
  '................',
  '................'
 ]),
 challengeMagenta:Object.freeze([
  '......RRR..GGG..',
  '......RRR...G...',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '........M..R.R..',
  '......MMM..R.R..',
  '......MMM.GMGMG.',
  '......MMM.GGGGG.',
  '.......MMMMGGGMM',
  '........MMMRRRMM'
 ]),
 challengeBlueYellow:Object.freeze([
  'OO..BBB.......BB',
  'O...BBB.......BB',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '.B..Y.........Y.',
  '.B..YYY.......Y.',
  'OYO.YYY.......Y.',
  'OOO.YYY.......Y.',
  'OOYYYY........YY',
  'BBYYY...........'
 ])
});

const TARGET_SPRITE_PALETTES=Object.freeze({
 ship:Object.freeze({W:'#f4f8ff',R:'#ff3347',B:'#5ca8ff'}),
 bee:Object.freeze({R:'#ff3038',W:'#f4f8ff',B:'#247cff',Y:'#ffe94d'}),
 but:Object.freeze({M:'#ff43e6',B:'#247cff',R:'#ff3038',W:'#f4f8ff'}),
 boss:Object.freeze({G:'#22c284',R:'#ff3038',B:'#247cff',Y:'#ffe94d'}),
 challengeGreen:Object.freeze({R:'#ff3038',C:'#00ffde',Y:'#ffb800'}),
 challengeYellow:Object.freeze({M:'#ff43e6',G:'#42e46e',R:'#ff3038'}),
 challengeMagenta:Object.freeze({R:'#ff3038',G:'#42e46e',M:'#ff43e6'}),
 challengeBlueYellow:Object.freeze({O:'#de4700',B:'#247cff',Y:'#ffe94d'})
});

const TARGET_EXPLOSION_ROWS=Object.freeze({
 small:Object.freeze([
  '................................',
  '................................',
  '................................',
  '...CC.........................CC',
  '.....C.......CC.CCC...C......CC.',
  '......CC....CCCCCCCC...R...CCC..',
  '.......C.R..CCCC.R.CC...CC.C....',
  '........C..CC.R.C.CCC.....W.....',
  '......CC...CCW.CCCCCCCCC..WWW...',
  '..........C.CCCCC.CC.CCCC.......',
  '.....R...CCC.CCCWCCCCCCCCCC.....',
  '...CC..CCCCCWWWWWW.WWWRC.CC..CCC',
  '......CCC.C.WW..WWWW.WCRC.CC..C.',
  '.....CCC.CCW.W.W.W..WWCCC.CC..CC',
  '.....CC.CCCWWWW.W.W.WWWC.CCC.W..',
  '.....CC.CCC.WWC..RW...WCCCC.....',
  '......CC.CCC....WWWWWW..CCC.....',
  '.....CC.CCRWWWW.WRW....WCCCC....',
  '.....CCC.CRWWW...WWR.WWWC.CCC...',
  '.....CCCCCWW.WW.W.W.WWWWCC.CC...',
  '......CCCC.CWW.W.....WWRW.CCC...',
  '......CCCC.CW...WW.WW.WWWC.CC.R.',
  '....C..CC.CCW.WWWW.WWWWC.CC.....',
  '.....C...CCCCCWRWCCCWRWC.CCC.C..',
  '..........CCCCCCCCCCCCC.CC......',
  '......CC..CC.CC.CCCC.CCC..WW....',
  '.....C..W..CC..CC.CCC.CC..W.....',
  '.......R.C..CCCCCC.CCCCC...C....',
  '......R..C...CC.CC...CC.....W...',
  '.....C..................C....C..',
  '....C........CCCC......C......CC',
  '.............C.C................'
 ]),
 large:Object.freeze([
  '................................',
  '...............CC..CCCCC.CCCC...',
  '.....C......CCCCCC.CCCCCCCCCCC..',
  '......C....CCCCCCC.CCCCC.C.WWCC.',
  '......CCC.CCWW..CCCCCWW.W.W.WWC.',
  '.......R..CCW.WW.CWWWW.WWWWW.WCC',
  '...........WRWWWW.WWCWWWWCWWW.CC',
  '........CCWWWWWCWWWRRWWWWWCWWW.C',
  '.......CWW.WCWWWCCCCW.WWWWWRWW.C',
  '......CCW.WWCWWWWWWWW.WCWWRCW.WW',
  '.....CCW.WWCWWWWW.WWW.WWWWWCWWWW',
  '.....CC.WWWCWW.WWW.WW.WWW.WWWWCW',
  '.....CC.WWWWWWW.WRWW.WWW.WW.WWCW',
  '.....CCW.WRWW..W.W...W...WCW.WCW',
  '......CWWCWWCW..W..W..W.WWWW.WWW',
  '......CCWCWWCWW..W.W.W..WWW.WWWW',
  '.......C.WCWCWC...WWWW...WWWWWW.',
  '......C.CWWWWW.WRWWWWRWW.WWWRW.C',
  '......CCWRWWW...W..WW.....WWWWCC',
  '......CCWWCWWWWW.W..WW..WWWWWWCC',
  '......CC.WWCWWW..W...W.WWWCWWRCC',
  '.......CCWWWWWW.W.......WWWWWWCC',
  '........C.WWCW...WW.WWW..WWWWC..',
  '.......CCWWW.WWWWWW.W.WW.WW..CC.',
  '.......CCWWWW.WWRWWWWW.WWWWW.CCC',
  '........CCCCC.WWWWRWWWWWWRWW.WCC',
  '......R..CCCCC.W.WW.WWWWWWW.WWWC',
  '.....C.....CCC.WW..WWWW.WCCCCCCC',
  '........R..CC.CCCWWWWWWWCC.CCCC.',
  '.......CCC....CCCCCCW.WWC.......',
  '......RR.......CC...CWWWCC.....R',
  '.....CC............CCCCCCC......'
 ])
});

const TARGET_EXPLOSION_PALETTE=Object.freeze({
 C:'#36f4ff',
 W:'#f4fbff',
 R:'#ff3448',
 Y:'#ffe35a',
 G:'#42e46e',
 B:'#247cff',
 M:'#ff43e6'
});

const AURORA_CONFORMANCE_PIXELS=Object.freeze({
 butterfly:Object.freeze({
  a:[[0,0],[7,0],[0,1],[1,1],[6,1],[7,1],[0,2],[1,2],[6,2],[7,2],[0,3],[1,3],[6,3],[7,3],[0,4],[1,4],[6,4],[7,4],[0,5],[1,5],[6,5],[7,5]],
  b:[[3,0],[4,0],[2,1],[3,1],[4,1],[5,1],[2,2],[3,2],[4,2],[5,2],[3,3],[4,3],[3,4],[4,4]],
  c:[[3,5],[4,5],[2,6],[3,6],[4,6],[5,6]]
 })
});

const TARGET_PIXEL_ASPECT_X=1.14;
const TARGET_REFERENCE_ENEMY_SCALE=0.84;
const TARGET_REFERENCE_BOSS_SCALE=0.88;

function drawTargetSpriteRows(rows,palette,scale=1,offsetX=0,offsetY=0,opts={}){
 if(!Array.isArray(rows)||!rows.length)return false;
 const cols=rows.reduce((max,row)=>Math.max(max,String(row||'').length),0);
 const height=rows.length;
 const sx=scale*(opts.xScale||TARGET_PIXEL_ASPECT_X);
 const sy=scale*(opts.yScale||1);
 const left=offsetX-cols*sx/2;
 const top=offsetY-height*sy/2;
 for(let y=0;y<rows.length;y++){
  const row=String(rows[y]||'');
  for(let x=0;x<row.length;x++){
   const token=row[x];
   if(token==='.'||token===' ')continue;
   const color=palette[token];
   if(!color)continue;
   ctx.fillStyle=color;
   ctx.fillRect(Math.round(left+x*sx),Math.round(top+y*sy),Math.max(1,Math.round(sx)),Math.max(1,Math.round(sy)));
  }
 }
 return true;
}

function currentSpriteRenderMode(){
 const graphics=typeof currentGraphicsOverrides==='function'?currentGraphicsOverrides():null;
 return graphics?.spriteRenderMode||'auto';
}

function referencePixelSpritesEnabled(){
 return currentSpriteRenderMode()==='reference-pixel-lab';
}

function drawTargetEnemySprite(e,flap){
 if(!referencePixelSpritesEnabled())return false;
 if(e?.fam==='dragonfly')return drawTargetSpriteRows(TARGET_SPRITE_ROWS.challengeGreen,TARGET_SPRITE_PALETTES.challengeGreen,TARGET_REFERENCE_ENEMY_SCALE);
 if(e?.fam==='mosquito')return drawTargetSpriteRows(TARGET_SPRITE_ROWS.challengeYellow,TARGET_SPRITE_PALETTES.challengeYellow,TARGET_REFERENCE_ENEMY_SCALE);
 if(e?.fam==='scorpion')return drawTargetSpriteRows(TARGET_SPRITE_ROWS.challengeMagenta,TARGET_SPRITE_PALETTES.challengeMagenta,TARGET_REFERENCE_ENEMY_SCALE);
 if(e?.fam==='stingray'||e?.fam==='crown')return drawTargetSpriteRows(TARGET_SPRITE_ROWS.challengeBlueYellow,TARGET_SPRITE_PALETTES.challengeBlueYellow,TARGET_REFERENCE_ENEMY_SCALE);
 if(e?.t==='bee')return drawTargetSpriteRows(flap?TARGET_SPRITE_ROWS.beeOpen:TARGET_SPRITE_ROWS.bee,TARGET_SPRITE_PALETTES.bee,TARGET_REFERENCE_ENEMY_SCALE);
 if(e?.t==='but')return drawTargetSpriteRows(flap?TARGET_SPRITE_ROWS.butOpen:TARGET_SPRITE_ROWS.but,TARGET_SPRITE_PALETTES.but,TARGET_REFERENCE_ENEMY_SCALE);
 if(e?.t==='boss')return drawTargetSpriteRows(flap?TARGET_SPRITE_ROWS.bossOpen:TARGET_SPRITE_ROWS.boss,TARGET_SPRITE_PALETTES.boss,TARGET_REFERENCE_BOSS_SCALE);
 if(e?.t==='rogue')return drawTargetSpriteRows(TARGET_SPRITE_ROWS.ship,TARGET_SPRITE_PALETTES.ship,TARGET_REFERENCE_ENEMY_SCALE);
 return false;
}

function drawTargetExplosionSprite(kind,scale=1){
 const rows=kind==='explosionLarge'?TARGET_EXPLOSION_ROWS.large:TARGET_EXPLOSION_ROWS.small;
 return drawTargetSpriteRows(rows,TARGET_EXPLOSION_PALETTE,scale,0,0,{xScale:1,yScale:1});
}

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
  case 'crown':
   return damaged?{a:flap?'#fff6b8':'#ffffff',b:hot?'#ff9fd8':'#d7a5ff',c:'#66ffe0',pat:FAMILY_PIXELS.crown}:{a:flap?'#aaffea':'#d8fff5',b:hot?'#ffd55a':'#ffe996',c:'#c58cff',pat:FAMILY_PIXELS.crown};
  case 'dragonfly':
   return{a:flap?'#69ff8e':'#98ffab',b:hot?'#5ce1ff':'#94f0ff',c:'#ffe76f',pat:FAMILY_PIXELS.dragonfly};
  case 'mosquito':
   return{a:flap?'#ff8c70':'#ffab85',b:hot?'#ffd24c':'#ffe179',c:'#74f4ff',pat:FAMILY_PIXELS.mosquito};
  default:
   if(e.t==='bee')return{a:flap?'#2f73ff':'#1f62de',b:hot?'#fff27d':'#ffd94e',c:'#ff3f4f',pat:null};
   if(e.t==='but')return{a:flap?'#ff4c4c':'#f02f34',b:hot?'#ffffff':'#e8f4ff',c:'#2f8cff',pat:null};
   if(e.t==='rogue')return{a:flap?'#ffffff':'#f4f8ff',b:hot?'#ff6a75':'#ff3347',c:'#5ca8ff',pat:null};
   return damaged?{a:flap?'#7ab5ff':'#add7ff',b:hot?'#ffe177':'#ffe89c',c:'#ff58b4',pat:null}:{a:e.hp>1?(flap?'#31c99d':'#12a987'):(flap?'#64ddc5':'#46c7b0'),b:hot?'#fff27a':'#ffd84c',c:'#f04c30',pat:null};
 }
}

function enemyDims(e){
 if(e.t==='boss')return{w:38,h:30};
 if(e.t==='but')return{w:34,h:27};
 if(e.t==='rogue')return{w:35,h:28};
 return{w:32,h:26};
}

function enemyHitbox(e){
 const d=enemyDims(e),stage1=e&&!S.challenge&&S.stage===1,scale=S.challenge?(S.stage===3?0.74:0.7):(stage1?(e&&!e.form?0.14:(e?.dive===1||e?.dive===4?0.28:(S.scriptMode?0.18:0.22))):0.22);
 return{w:d.w*scale,h:d.h*scale};
}

function enemyCollisionHitbox(e){
 const d=enemyDims(e),scale=S.challenge?0.18:(S.stage===4?(e?.dive===1?0.11:0.095):S.stage>=5?(e?.dive===1?0.14:0.12):0.18);
 return{w:d.w*scale,h:d.h*scale};
}

function playerHitbox(){return{w:7,h:6};}
function playerMovementHalfWidth(subject=null){
 const dual=subject===true||!!subject?.dual;
 return dual?18:11;
}

const AURORA_SHIP_GLYPH_BOUNDS=Object.freeze({
 left:-8,
 right:8,
 top:-7,
 bottom:7
});

function shipGlyphBoundsAt(x,y,s=1){
 return{
  left:x+AURORA_SHIP_GLYPH_BOUNDS.left*s,
  right:x+AURORA_SHIP_GLYPH_BOUNDS.right*s,
  top:y+AURORA_SHIP_GLYPH_BOUNDS.top*s,
  bottom:y+AURORA_SHIP_GLYPH_BOUNDS.bottom*s
 };
}

function mergeBounds(a,b){
 if(!a)return b;
 if(!b)return a;
 return{
  left:Math.min(a.left,b.left),
  right:Math.max(a.right,b.right),
  top:Math.min(a.top,b.top),
  bottom:Math.max(a.bottom,b.bottom)
 };
}

function drawMiniShip(s=1,colA='#9adfff',colB='#72c8ff'){
 const palette=Object.assign({},TARGET_SPRITE_PALETTES.ship,{W:colA,B:colB});
 if(referencePixelSpritesEnabled()){
  drawTargetSpriteRows(TARGET_SPRITE_ROWS.ship,palette,Math.max(1,Math.round(s)));
  return;
 }
 drawAuroraShipGlyph(0,0,Math.max(.5,s),colA,colB);
}

function drawAuroraShipGlyph(x=0,y=0,s=1,colA='#eaf7ff',colB='#78d8ff'){
 const ps=2*s;
 drawPix(x-ps*4,y-ps*3.5,ps,P.ship.a,colA,colB,P.ship.b,'#ff3448',P.ship.c);
}

function endOfRunOverlayActive(){
 return !started&&!!gameOverState;
}

function drawEnemyFlapAccent(e,ps,pal,flap){
 if(!flap||!pal?.a)return;
 ctx.fillStyle=pal.a;
 if(e.t==='bee'){
  ctx.fillRect(-ps*5,-ps*2.4,ps,ps);
  ctx.fillRect(ps*4,-ps*2.4,ps,ps);
 }else if(e.t==='but'){
  ctx.fillRect(-ps*5,-ps*3.7,ps,ps);
  ctx.fillRect(ps*4,-ps*3.7,ps,ps);
  ctx.fillRect(-ps*4.5,ps*2.2,ps,ps);
  ctx.fillRect(ps*3.5,ps*2.2,ps,ps);
 }else if(e.t==='boss'){
  ctx.fillRect(-ps*5.5,-ps*.4,ps,ps*2);
  ctx.fillRect(ps*4.5,-ps*.4,ps,ps*2);
 }else if(e.t==='rogue'){
  ctx.fillStyle=pal.c||pal.a;
  ctx.fillRect(-ps*4.8,ps*.5,ps,ps);
  ctx.fillRect(ps*3.8,ps*.5,ps,ps);
 }
}

function drawEnemy(e){
 const ps=2;
 const flap=Math.sin(e.tm*11+e.ph)>.12,hot=e.dive===1||e.dive===4;
 const pal=enemyPalette(e,flap,hot);
 const carryVisible=!endOfRunOverlayActive();
 const carrying=carryVisible&&enemyIsCarryingFighter(e);
 const carryTarget=carrying?carriedFighterTarget(e):null;
 const carryOffset=carrying?carriedFighterOffset(e):null;
 ctx.save();
 ctx.translate(Math.round(e.x),Math.round(e.y));
 if(e.dive===1||e.dive===4)ctx.rotate(Math.atan2(e.vy,e.vx||1)+1.57);
 const drewTarget=drawTargetEnemySprite(e,flap);
 if(!drewTarget){
  if(e.fam==='dragonfly')drawPix(-ps*4.5,-ps*3.5,ps,P.dragonfly.a,pal.a,pal.b,P.dragonfly.b,pal.c,P.dragonfly.c);
  else if(e.fam==='mosquito')drawPix(-ps*4.5,-ps*3.5,ps,P.mosquito.a,pal.a,pal.b,P.mosquito.b,pal.c,P.mosquito.c);
  else if(e.t==='bee')drawPix(-ps*4,-ps*3.5,ps,P.but.a,pal.a,pal.b,P.but.b,pal.c,pal.pat||P.but.c);
  else if(e.t==='but')drawPix(-ps*4,-ps*3.5,ps,AURORA_CONFORMANCE_PIXELS.butterfly.a,pal.a,pal.b,AURORA_CONFORMANCE_PIXELS.butterfly.b,pal.c,pal.pat||AURORA_CONFORMANCE_PIXELS.butterfly.c);
  else if(e.t==='rogue')drawPix(-ps*4,-ps*3.5,ps,P.rogue.a,pal.a,pal.b,P.rogue.b,pal.c,pal.pat||P.rogue.c);
  else drawPix(-ps*4.5,-ps*3.5,ps,P.boss.a,pal.a,pal.b,P.boss.b,pal.c,pal.pat||P.boss.c);
  drawEnemyFlapAccent(e,ps,pal,flap);
 }
 if(e.hitT>0){
  const hitAlpha=Math.min(.96,e.hitT/(e.t==='boss'?.46:.34));
  ctx.globalAlpha=e.t==='boss'?Math.max(.82,hitAlpha):hitAlpha;
  if(e.t==='boss'){
   ctx.fillStyle='#fff8c4';
   ctx.fillRect(-17,-13,34,26);
   ctx.fillStyle='#ffffff';
   ctx.fillRect(-12,-3,24,6);
   ctx.fillRect(-3,-10,6,20);
   ctx.fillStyle='#ff92d8';
   ctx.fillRect(-9,-1,18,2);
   ctx.fillRect(-1,-7,2,14);
   ctx.strokeStyle='#e2f7ff';
   ctx.lineWidth=1;
   ctx.strokeRect(-18.5,-14.5,37,29);
  }else{
   ctx.fillStyle='rgba(255,255,255,.72)';
   ctx.fillRect(-12,-10,24,20);
  }
  ctx.globalAlpha=1;
 }
 if(enemyHasActiveBeam(e)){
  const len=Math.max(24,Math.min(VIS.beamLen,PLAY_H-e.y-8)),bw=10;
  const g=ctx.createLinearGradient(0,14,0,len);g.addColorStop(0,'rgba(136,245,255,.98)');g.addColorStop(.55,'rgba(110,229,255,.32)');g.addColorStop(1,'rgba(136,245,255,.03)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-bw,12);ctx.lineTo(bw,12);ctx.lineTo(bw*2.35,len);ctx.lineTo(-bw*2.35,len);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(228,250,255,.32)';ctx.fillRect(-3,14,6,len-8);
  ctx.fillStyle='rgba(255,246,168,.18)';
  for(let i=0;i<4;i++){
   const yy=20+i*28+Math.sin((e.tm+i)*4)*3;
   ctx.fillRect(-bw*1.1,yy,bw*2.2,4);
  }
 }
 ctx.restore();
 if(carrying&&carryTarget&&carryOffset){
  window.__platinumRenderDebug.carryDraws.push({
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
 ctx.save();
 ctx.translate(Math.round(x),Math.round(y));
 if(ghost)ctx.globalAlpha=.52;
 let bounds=null;
 if(!referencePixelSpritesEnabled()){
  if(dual){
   drawAuroraShipGlyph(-9.5,0,1,'#eaf7ff','#ff4a5c');
   drawAuroraShipGlyph(9.5,0,1,'#eaf7ff','#78d8ff');
   bounds=mergeBounds(shipGlyphBoundsAt(x-9.5,y,1),shipGlyphBoundsAt(x+9.5,y,1));
  }else{
   drawAuroraShipGlyph(0,0,1);
   bounds=shipGlyphBoundsAt(x,y,1);
  }
 }else if(dual){
  drawTargetSpriteRows(TARGET_SPRITE_ROWS.ship,TARGET_SPRITE_PALETTES.ship,1,-10.5,0);
  drawTargetSpriteRows(TARGET_SPRITE_ROWS.ship,TARGET_SPRITE_PALETTES.ship,1,10.5,0);
  bounds=mergeBounds(shipGlyphBoundsAt(x-10.5,y,1),shipGlyphBoundsAt(x+10.5,y,1));
 }else{
  drawTargetSpriteRows(TARGET_SPRITE_ROWS.ship,TARGET_SPRITE_PALETTES.ship,1);
  bounds=shipGlyphBoundsAt(x,y,1);
 }
 if(!ghost)window.__platinumRenderDebug.playerBounds=bounds;
 ctx.restore();
}

function drawCaptureTether(){
 if(endOfRunOverlayActive()){
  window.__platinumRenderDebug.captureTetherVisible=false;
  return;
 }
 const p=S.p,b=p.capBoss;
 if(!p.captured||!b||b.hp<=0){
  window.__platinumRenderDebug.captureTetherVisible=false;
  return;
 }
 window.__platinumRenderDebug.captureTetherVisible=true;
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
 if(!(window.__platinumCarryDebug??window.__auroraCarryDebug))return;
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
  if(e.hp<=0||!enemyIsCarryingFighter(e))continue;
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
 let y=PLAY_H-DISPLAY_SHELL.reserveBottom;
 const layout=[...Array(bigCount).fill('big'),...Array(smallCount).fill('small')];
 for(const size of layout){
  const step=size==='big'?13:DISPLAY_SHELL.stageBadgeGap;
  badges.push({x,y,size});
  x-=step;
  if(x<minX){
   x=rightEdge;
   y-=12;
  }
 }
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
 ctx.restore();
}

function drawReserveShips(lives){
 let reserve=Math.max(0,lives|0);
 let x=DISPLAY_SHELL.reserveLeft,y=PLAY_H-DISPLAY_SHELL.reserveBottom;
 const flashActive=(+S.extendFlashT||0)>0;
 const highlightCount=flashActive?Math.max(0,+S.extendFlashShips||0):0;
 const totalReserve=reserve;
 const pulse=flashActive?.72+Math.sin((performance.now()/1000)*16)*.28:0;
 while(reserve>0){
  const idxFromRight=reserve-1;
  const highlight=flashActive&&idxFromRight<highlightCount&&idxFromRight<totalReserve;
  ctx.save();
  ctx.translate(x,y);
  if(highlight){
   ctx.globalAlpha=.78+.22*pulse;
   ctx.fillStyle=`rgba(255,229,122,${(0.12+.16*pulse).toFixed(3)})`;
   ctx.beginPath();
   ctx.ellipse(0,-1,10.5+2.5*pulse,7.5+1.6*pulse,0,0,7);
   ctx.fill();
   drawMiniShip(.88,'#fff6d2','#ffd34d');
   window.__platinumRenderDebug.reserveShipBounds.push(shipGlyphBoundsAt(x,y,.88));
  }else{
   drawMiniShip(.82,'#f4f8ff','#ff3347');
   window.__platinumRenderDebug.reserveShipBounds.push(shipGlyphBoundsAt(x,y,.82));
  }
  ctx.restore();
  reserve--;
  x+=18;
 }
}

function drawPostFx(){}

function resolvedBoardAtmosphere(){
 if(typeof resolvedVisualAtmosphere==='function'){
  return resolvedVisualAtmosphere({
   stagePresentation:S.stagePresentation,
   challenge:!!S.challenge,
   attractPhase:(typeof ATTRACT!=='undefined'&&ATTRACT.phase)||'',
   frontDoor:!started&&!S.attract
  });
 }
 return Object.freeze({backgroundMode:S.stagePresentation?.backgroundMode||'classic-stars'});
}

function drawStageBackdrop(){
 const mode=resolvedBoardAtmosphere().backgroundMode||S.stagePresentation?.backgroundMode||'classic-stars';
 if(mode==='classic-stars'||mode==='starfield')return;
 const time=performance.now()/1000;
 if(mode==='aurora-hint'||mode==='aurora-borealis'){
  const alpha=mode==='aurora-borealis'?.22:.12;
  const ribbons=mode==='aurora-borealis'?3:2;
  for(let i=0;i<ribbons;i++){
   const baseY=28+i*44+Math.sin(time*.38+i*.9)*10;
   const amp=10+i*3;
   const hueA=i===0?'rgba(116,230,255,ALPHA)':'rgba(142,255,190,ALPHA)';
   const hueB=i===2?'rgba(217,148,255,ALPHA)':'rgba(255,224,120,ALPHA)';
   const g=ctx.createLinearGradient(0,baseY-amp,0,baseY+amp*2.6);
   g.addColorStop(0,hueA.replace('ALPHA',(alpha*.18).toFixed(3)));
   g.addColorStop(.35,hueB.replace('ALPHA',(alpha*.72).toFixed(3)));
   g.addColorStop(1,hueA.replace('ALPHA','0'));
   ctx.fillStyle=g;
   ctx.beginPath();
   ctx.moveTo(0,baseY);
   for(let x=0;x<=PLAY_W;x+=18){
    const y=baseY+Math.sin(time*1.2+x*.028+i*.7)*amp+Math.cos(time*.7+x*.014+i)*amp*.35;
    ctx.lineTo(x,y);
   }
   ctx.lineTo(PLAY_W,0);
   ctx.lineTo(0,0);
   ctx.closePath();
   ctx.fill();
  }
 }
}

function drawAuroraBoard({ox,oy,scale,dx,dy}){
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,c.width,c.height);
 ctx.fillStyle='#000';
 ctx.fillRect(0,0,c.width,c.height);
 ctx.setTransform(DPR*scale,0,0,DPR*scale,(ox+dx*.25)*DPR,(oy+dy*.25)*DPR);
 ctx.fillStyle='#000';
 ctx.fillRect(0,0,PLAY_W,PLAY_H);
 window.__platinumRenderDebug.renderTick=(window.__platinumRenderDebug.renderTick||0)+1;
 window.__platinumRenderDebug.carryDraws.length=0;
 window.__platinumRenderDebug.captureTetherVisible=false;
 window.__platinumRenderDebug.capturedGhostVisible=false;
 window.__platinumRenderDebug.playerBounds=null;
 window.__platinumRenderDebug.reserveShipBounds=[];
 ctx.save();
 ctx.beginPath();
 ctx.rect(0,0,PLAY_W,PLAY_H);
 ctx.clip();
 const isolatedSpriteCapture=!!S.harnessSpriteRuntimeCapture;
 const starfield=!isolatedSpriteCapture&&typeof syncStarfieldProfile==='function'?syncStarfieldProfile({
  stagePresentation:S.stagePresentation,
  challenge:!!S.challenge,
  attractPhase:(typeof ATTRACT!=='undefined'&&ATTRACT.phase)||'',
  frontDoor:!started&&!S.attract
 }):null;
 if(!isolatedSpriteCapture){
  for(const s of S.st){
   const pulse=(s.twMin||.88)+Math.sin(s.tw)*(s.twAmp||.16);
   ctx.globalAlpha=Math.max(.08,Math.min(1,(s.alpha||.62)*pulse));
   ctx.fillStyle=s.c;
   ctx.fillRect(s.x,s.y,s.s,s.s);
  }
 }
 ctx.globalAlpha=1;
 if(!isolatedSpriteCapture)drawStageBackdrop();
 window.__platinumRenderDebug.backgroundMode=resolvedBoardAtmosphere().backgroundMode||'classic-stars';
 window.__platinumRenderDebug.spriteRenderMode=currentSpriteRenderMode();
 window.__platinumRenderDebug.referencePixelSprites=referencePixelSpritesEnabled();
 window.__platinumRenderDebug.starfieldProfile=starfield?.id||'classic-arcade-stars';
 window.__platinumRenderDebug.starfieldCount=S.st.length;
 window.__platinumRenderDebug.starfieldIntensityScale=+(starfield?.intensityScale||1);
 window.__platinumRenderDebug.starfieldSpeedScale=+(starfield?.speedScale||1);
 window.__platinumRenderDebug.starfieldLeadSample=(S.st||[]).slice(0,4).map(star=>({
  x:+(+star.x||0).toFixed(2),
  y:+(+star.y||0).toFixed(2),
  vy:+(+star.vy||0).toFixed(2),
  vx:+(+star.vx||0).toFixed(2)
 }));
 for(const f of S.fx){
  ctx.globalAlpha=Math.max(0,f.t*2.9);
  if(f.sprite==='explosionSmall'||f.sprite==='explosionLarge'){
   const life=Math.max(.001,+f.life||+f.t||.12);
   const age=1-Math.max(0,Math.min(1,f.t/life));
   const scale=(+f.scale||.6)*(1+(+f.grow||0)*age);
   ctx.save();
   ctx.translate(Math.round(f.x),Math.round(f.y));
   drawTargetExplosionSprite(f.sprite,scale);
   ctx.restore();
  }else if(f.ring){
   ctx.strokeStyle=f.c;
   ctx.lineWidth=Math.max(1,.8+f.t*2.5);
   ctx.beginPath();
   ctx.arc(f.x,f.y,Math.max(2,f.r*(1.12-f.t*.32)),0,7);
   ctx.stroke();
  }else if(f.burst){
   const life=Math.max(0,Math.min(1,f.t/.2));
   ctx.strokeStyle=f.c;
   ctx.lineWidth=1;
   for(let i=0;i<8;i++){
    const a=i*Math.PI/4+life*.18;
    const inner=Math.max(2,f.r*(.18+(1-life)*.12));
    const outer=Math.max(inner+2,f.r*(.62+(1-life)*.22));
    ctx.beginPath();
    ctx.moveTo(f.x+Math.cos(a)*inner,f.y+Math.sin(a)*inner);
    ctx.lineTo(f.x+Math.cos(a)*outer,f.y+Math.sin(a)*outer);
    ctx.stroke();
   }
   ctx.fillStyle='#ffffff';
   ctx.fillRect(Math.round(f.x)-1,Math.round(f.y)-1,2,2);
  }else if(f.flash){
   ctx.fillStyle=f.c;
   ctx.fillRect(f.x-f.r*.6,f.y-1,f.r*1.2,2);
   ctx.fillRect(f.x-1,f.y-f.r*.6,2,f.r*1.2);
  }else if(f.sq){
   ctx.fillStyle=f.c;
   ctx.fillRect(f.x-f.r*.5,f.y-f.r*.5,f.r,f.r);
  }else{
   ctx.fillStyle=f.c;
   ctx.beginPath();
   ctx.arc(f.x,f.y,f.r,0,7);
   ctx.fill();
  }
 }
 ctx.globalAlpha=1;
 drawRescuePod();
 for(const b of S.pb){
  const x=Math.round(b.x),y=Math.round(b.y);
  ctx.fillStyle='#e9f8ff';
  ctx.fillRect(x,y-16,1,18);
 }
 for(const b of S.eb){
  const x=Math.round(b.x),y=Math.round(b.y);
  ctx.fillStyle='#ff5e5e';
  ctx.fillRect(x,y-10,1,13);
 }
 for(const e of S.e)if(e.hp>0)drawEnemy(e);
 drawCaptureTether();
 drawCarryDebugOverlay();
 const p=S.p;
 const suppressCaptureOverlay=endOfRunOverlayActive();
 if((!p.pending||p.spawn<=.3)&&!p.spawn){
  if(!(p.inv>0&&Math.floor(p.inv*14)%2))drawPlayerBody(p.x,p.y,p.dual,0);
 }
 if(p.captured&&!suppressCaptureOverlay){
  window.__platinumRenderDebug.capturedGhostVisible=true;
  drawPlayerBody(p.x,p.y,0,1);
 }
 if(!isolatedSpriteCapture){
  drawReserveShips(S.lives);
  drawBadges(S.stage);
 }
 drawPostFx();
 ctx.restore();
 ctx.setTransform(1,0,0,1,0,0);
}

registerGameBoardRenderer(AURORA_GAME_PACK.metadata.gameKey,{
 label:'Aurora Galactica board renderer',
 draw:drawAuroraBoard
});

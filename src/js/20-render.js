// Platform render orchestration for the active game board.
const GAME_BOARD_RENDERERS=Object.create(null);

function registerGameBoardRenderer(gameKey,renderer){
 const key=String(gameKey||'').trim();
 if(!key||!renderer||typeof renderer.draw!=='function')return null;
 GAME_BOARD_RENDERERS[key]=Object.freeze({
  gameKey:key,
  label:renderer.label||key,
  previewOnly:!!renderer.previewOnly,
  canDraw:typeof renderer.canDraw==='function'?renderer.canDraw:()=>true,
  draw:renderer.draw
 });
 return GAME_BOARD_RENDERERS[key];
}

function availableGameBoardRenderers(){
 return GAME_BOARD_RENDERERS;
}

function currentGameBoardRenderer(){
 const key=typeof currentGamePackKey==='function'?currentGamePackKey():DEFAULT_GAME_PACK_KEY;
 const candidate=GAME_BOARD_RENDERERS[key];
 if(candidate&&candidate.canDraw())return candidate;
 return GAME_BOARD_RENDERERS[DEFAULT_GAME_PACK_KEY]||null;
}

function draw(){
 const sh=S.shake*8,dx=auxRnd(sh,-sh),dy=auxRnd(sh,-sh);
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
 const railH=Math.max(220,viewH);
 const railLeft=shellX+shellW-shellPadR+Math.floor((shellPadR-railW)/2);
 const railTop=oy;
 const waitScoreOverlay=0;
 const platformMessageOpen=typeof platformMessagePanelOpen!=='undefined'&&!!platformMessagePanelOpen;
 const framedOverlayOpen=!!((typeof LEADERBOARD!=='undefined'&&(LEADERBOARD.accountPanelOpen||LEADERBOARD.panelOpen))||platformMessageOpen);

 syncCabinetShellLayout({
  ox,oy,viewW,viewH,scale,shellX,shellY,shellW,shellH,
 shellPadL,shellPadT,shellPadR,shellPadB,railLeft,railTop,railW,railH,
  waitScoreOverlay,framedOverlayOpen
 });
 const boardRenderer=currentGameBoardRenderer();
 if(boardRenderer){
  if(window.__platinumRenderDebug)window.__platinumRenderDebug.boardRendererKey=boardRenderer.gameKey;
  boardRenderer.draw({ox,oy,scale,dx,dy});
 }else{
  throw new Error('No Platinum game board renderer is registered.');
 }
 syncHudAndShellMessages({ox,oy,viewW,viewH});
}

window.registerGameBoardRenderer=registerGameBoardRenderer;
window.availableGameBoardRenderers=availableGameBoardRenderers;
window.currentGameBoardRenderer=currentGameBoardRenderer;

// Enemy spawning, stage flow, combat, capture, and game-state updates.
function makeEnemy(t,r,c,tx,ty,profile=stageBandProfile(S.stage,S.challenge)){const boss=t==='boss';return{id:(randUnit()*1e9)|0,t,r,c,fam:enemyFamilyForType(profile,t),band:profile.name,hp:boss?2:1,max:boss?2:1,x:PLAY_W/2+rnd(180,-180),y:-80-r*16,tx,ty,form:0,dive:0,vx:0,vy:0,tm:rnd(6),ph:rnd(8),cool:rnd(2.3,.8),carry:0,beam:0,beamT:0,targetX:0,targetY:0,shot:0,spawn:r*.06+c*.02,en:0,lead:null,off:0,esc:0,squadId:0,ch:0,miss:0,low:0};}

function familyMotion(e){
 switch(e?.fam){
  case 'scorpion': return { pulseX:.95,pulseY:.8,entryX:.92,entryY:.9,weave:1.18,steer:.96,jitter:1.1,diveVy:.98,diveAccel:1,challengeSweep:1,challengeDrop:1 };
  case 'stingray': return { pulseX:1.08,pulseY:.78,entryX:1.06,entryY:.82,weave:1.28,steer:1.06,jitter:1.16,diveVy:1.04,diveAccel:1.03,challengeSweep:1.2,challengeDrop:1.05 };
  case 'galboss': return { pulseX:.9,pulseY:.72,entryX:.88,entryY:.76,weave:.9,steer:.9,jitter:.92,diveVy:1.02,diveAccel:.98,challengeSweep:.86,challengeDrop:.95 };
  case 'dragonfly': return { pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1.1,steer:1,jitter:1,diveVy:1,diveAccel:1,challengeSweep:1.14,challengeDrop:1 };
  case 'mosquito': return { pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1.22,steer:1,jitter:1,diveVy:1,diveAccel:1,challengeSweep:1.32,challengeDrop:1.08 };
  default: return { pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1,steer:1,jitter:1,diveVy:1,diveAccel:1,challengeSweep:1,challengeDrop:1 };
 }
}

function formationLayout(stage){
 if(stage>=8)return{gx:15.2,gy:12.4,oy:27};
 if(stage>=6)return{gx:15.8,gy:12.9,oy:27};
 if(stage>=4)return{gx:16.4,gy:13.4,oy:28};
 return{gx:VIS.gx,gy:VIS.gy,oy:VIS.formTop};
}

function spawnFormation(){
 const profile=stageBandProfile(S.stage,0);
 const cols=10,rows=4,{gx,gy,oy}=formationLayout(S.stage),ox=PLAY_W/2-(cols-1)*gx/2;
 const entry=[4,5,3,6,2,7,1,8,0,9];
 S.e.length=0;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  let t='bee';
  if(r===0)t=(c>=3&&c<=6)?'boss':'but';
  else if(r===1)t='but';
  const e=makeEnemy(t,r,c,ox+c*gx,oy+r*gy,profile);
  e.spawn=S.stage===1?(entry.indexOf(c)*.62+r*1.45+(r>1?1.45:0)+(t==='boss'?.18:0)):r*.08+c*.03;
  S.e.push(e);
 }
 for(let i=0;i<S.rogue;i++){
  const c=2+i%6,e=makeEnemy('rogue',1,c,ox+c*gx,oy+gy,profile);e.hp=1;e.max=1;S.e.push(e);
 }
 S.rogue=0;
}

function spawnChallenge(){
 const profile=stageBandProfile(S.stage,1);
 S.e.length=0;
 const total=40;
 const upperBandY=PLAY_H*.5;
 // Manual-backed structure: the first Galaga challenge stage is modeled as
 // 5 groups of 8 enemies. Motion fidelity is still being tuned in #9, but
 // the board structure and group bookkeeping are meant to stay stable.
 for(let i=0;i<total;i++){
  const t=i%8<2?'boss':i%3?'but':'bee';
  const wave=(i/8)|0,lane=i%8,side=lane<4?-1:1,slot=lane%4,row=slot<2?0:1;
  S.e.push({id:(randUnit()*1e9)|0,t,fam:profile.challengeFamily,band:profile.name,r:0,c:lane,hp:1,max:1,x:side>0?PLAY_W+44:-44,y:34+wave*13+row*8,tx:0,ty:0,form:1,dive:9,vx:0,vy:0,tm:0,ph:rnd(8),cool:99,carry:0,beam:0,beamT:0,targetX:0,targetY:0,shot:0,spawn:wave*1.52+slot*.18,en:0,lead:null,off:0,esc:0,ch:1,miss:0,wave,side,slot,row,group:wave,sweep:wave%2?-1:1,ub:0,upperBandY});
 }
 S.ch={hits:0,total:40,done:0,groups:Array.from({length:5},()=>0),bonus:0,perfect:0,upperBandY,upperBandTime:0,upperBandSamples:0};
}

function spawnStage(){
 S.pb.length=0;S.eb.length=0;S.cap=null;S.att=0;S.challenge=!!S.forceChallenge||isChallengeStage(S.stage);S.forceChallenge=0;S.profile=stageBandProfile(S.stage,S.challenge);S.t=stageTune(S.stage,S.challenge);S.fireCD=S.challenge?99:rnd(S.t.globalA,S.t.globalB);
 S.stageClock=0;S.recoverT=S.challenge?0:(S.stage>=6?1.18:S.stage===4?1.34:S.stage>=5?1.2:0);S.attackGapT=S.challenge?0:(S.stage>=6?1.02:S.stage===4?1.42:S.stage>=5?1.24:0);
 S.scriptMode=(!S.challenge&&S.stage===1)?1:0;S.scriptT=0;S.scriptI=0;S.scriptShotI=0;S.scriptShotT=3.2;
 logEvent('stage_spawn',{stage:S.stage,challenge:!!S.challenge});
 logEvent('stage_profile',{stage:S.stage,challenge:!!S.challenge,band:S.profile.name,challengeFamily:S.profile.challengeFamily,beeFamily:S.profile.beeFamily,butFamily:S.profile.butFamily,bossFamily:S.profile.bossFamily});
 if(S.challenge){spawnChallenge();S.bannerTxt='CHALLENGING STAGE';S.bannerSub=`STAGE ${S.stage}`;S.bannerMode='challenge';S.banner=2.6}
 else{spawnFormation();S.bannerTxt='STAGE '+S.stage;S.bannerSub='';S.bannerMode='stage';S.banner=1.6}
 logSnapshot('stage_spawn');
}

function start(){
 resetSession('game_start');
 autoExportedSessionId='';
 const cfg=saveTestCfg();
 setSeed(localStorage.getItem(SEED_PREF_KEY)||0);
 aud=1;AC().resume?.();
 gameOverHtml='';gameOverState=null;
 started=1;paused=0;Object.assign(S,{score:0,lives:Math.max(0,cfg.ships-1),stage:cfg.stage,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,rogue:0,alertT:0,forceChallenge:cfg.challenge?1:0,liveCount:40,recoverT:0,attackGapT:0,nextStageT:0});
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{inv:0,dual:0,captured:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0});
 logEvent('game_start');
 startRunRecording();
 spawnStage();msg.textContent='';sfx.start();
}

function fillPat(px,py,s,pat,col){if(!pat||!col)return;ctx.fillStyle=col;for(const p of pat)ctx.fillRect(px+p[0]*s,py+p[1]*s,s,s)}
function drawPix(px,py,s,pat,col,col2,pat2=null,col3='',pat3=null){fillPat(px,py,s,pat,col);if(pat2)fillPat(px,py,s,pat2,col2);else if(col2){ctx.fillStyle=col2;ctx.fillRect(px-s,py+s*2,s*2,s);ctx.fillRect(px+s*3,py+s*2,s*2,s)}if(pat3)fillPat(px,py,s,pat3,col3)}
function ex(x,y,n=10,col='#fff'){
 for(let i=0;i<n;i++)S.fx.push({x,y,vx:rnd(178,-178),vy:rnd(178,-178),t:rnd(.22,.08),r:rnd(n>14?2.1:1.5,.55),c:col,sq:randUnit()>.25});
 S.fx.push({x,y,vx:0,vy:0,t:n>14?.11:.08,r:n>14?10:7,c:'#fff',flash:1});
}

function loseShip(cause={}){
 const p=S.p;if(p.inv>0||p.spawn>0||p.captured)return;
 const hp=playerHitbox();
 logEvent('ship_lost',Object.assign({
  stage:S.stage,
  score:S.score,
  livesBefore:Math.max(0,S.lives+1),
  stageClock:+S.stageClock.toFixed(3),
  attackers:S.att,
  enemyBullets:S.eb.length,
  enemies:S.liveCount,
  playerX:+p.x.toFixed(2),
  playerY:+p.y.toFixed(2),
  playerHitbox:{w:hp.w,h:hp.h}
 },cause));
 S.shake=.55;S.recoverT=Math.max(S.recoverT,S.stage>=4?2.05:1.05);S.attackGapT=Math.max(S.attackGapT,S.stage>=4?1.28:.9);p.inv=2.1;ex(p.x,p.y,24,'#86c7ff');sfx.hit();
 if(p.dual)p.dual=0;
 S.lives--;p.spawn=.95;
 if(S.lives<0)gameOver();
}

function gameOver(){
 logEvent('game_over',{score:S.score,stage:S.stage});
 logSnapshot('game_over');
 started=0;
 if(VIDEO_REC.enabled)exportSession({auto:1,silent:1});
 stopRunRecording();
 gameOverState=buildGameOverState(S.score,S.stage);
 gameOverHtml=buildGameOverHtmlFromState();
 sfx.over();
}
function bulletsMax(){return S.p.dual?4:2}
function dualShotOffsets(){return S.p.dual?[-10,10]:[0]}
function scriptedDiveVy(stage){
 if(stage<=1)return 80;
 if(stage===2)return 86;
 return 92;
}
function randomDiveVy(stage){
 if(stage<=1)return 82;
 if(stage<=3)return 88;
 if(stage===4)return 88;
 return 94;
}
function diveAccel(stage){
 if(stage<=1)return 150;
 if(stage<=3)return 162;
 return 172;
}

function shoot(){
 const p=S.p;if(p.cd>0||p.spawn>0||p.captured)return;if(S.pb.length>=bulletsMax())return;
 p.cd=S.challenge?.095:.24;const y=p.y-40;
 const shotXs=dualShotOffsets().map(off=>p.x+off);
 S.stats.shots+=p.dual?2:1;
 if(p.dual)S.pb.push({x:shotXs[0],y,v:560},{x:shotXs[1],y,v:560});
 else S.pb.push({x:shotXs[0],y,v:560});
 logEvent('player_shot',{dual:!!p.dual,shots:p.dual?2:1,x:+p.x.toFixed(2),y:+y.toFixed(2),shotXs:shotXs.map(v=>+v.toFixed(2)),spread:p.dual?+(shotXs[1]-shotXs[0]).toFixed(2):0,activeBullets:S.pb.length});
 sfx.shot();
}

function hasCarriedFighter(){
 return S.e.some(e=>e.hp>0&&e.carry);
}
function canCapture(){const p=S.p;return !p.dual&&!p.captured&&!p.pending&&!hasCarriedFighter()&&p.spawn<=0&&S.lives>=0}
function capturePlayer(e){if(!canCapture())return;const p=S.p;p.captured=1;p.capBoss=e;p.capT=1.2;e.beam=1;e.beamT=Math.max(.5,e.beamT);logEvent('capture_started',Object.assign({stage:S.stage,playerX:+p.x.toFixed(2),playerY:+p.y.toFixed(2)},enemyRef(e)));sfx.beam()}
function finishCapture(){const p=S.p,e=p.capBoss;if(!e||e.hp<=0){p.captured=0;p.capBoss=null;p.inv=1.2;return;}e.carry=1;e.beam=0;e.dive=3;e.vx=0;e.vy=0;e.esc=0;p.captured=0;p.capBoss=null;p.pending=1;p.spawn=1;S.lives--;logEvent('fighter_captured',Object.assign({stage:S.stage,livesAfter:Math.max(0,S.lives+1)},enemyRef(e)));S.alertTxt='FIGHTER CAPTURED';S.alertT=1.55;if(S.lives<0)gameOver()}
function activeEscortCount(e){
 if(!e?.squadId)return Math.max(0,e?.esc|0);
 return S.e.filter(q=>q.hp>0&&q.squadId===e.squadId&&q.id!==e.id).length;
}

function carriedFighterTarget(e){
 if(!e?.carry)return null;
 return {x:e.x,y:e.y+18,w:6,h:6};
}

function destroyCarriedFighter(e){
 if(!e?.carry)return 0;
 // Manual-backed rule from the 1981 Namco manual:
 // - 500 for destroying a carried fighter in standby/formation
 // - 1000 when the carried fighter is attacking
 // The boss survives; only the carried fighter is lost.
 const attacking=!!e.dive;
 const points=attacking?1000:500;
 e.carry=0;
 S.score+=points;
 logEvent('captured_fighter_destroyed',Object.assign({stage:S.stage,points,attacking,playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
 S.alertTxt=`CAPTURED FIGHTER ${attacking?'ATTACK':'STANDBY'} ${points}`;
 S.alertT=Math.max(S.alertT,1.15);
 ex(e.x,e.y+18,10,'#d8f2ff');
 sfx.hit();
 return points;
}

function awardKill(e,mode){
 const dive=mode===1||mode===2||mode===4||mode===5;
 let pts=0;
 if(S.challenge){
  pts=100;
  S.score+=pts;
  S.ch.hits++;
  if(Number.isInteger(e.group)&&S.ch.groups){
   S.ch.groups[e.group]=(S.ch.groups[e.group]||0)+1;
   if(S.ch.groups[e.group]===8){
    const bonus=challengeGroupBonus(S.stage);
    S.ch.bonus=(S.ch.bonus||0)+bonus;
    S.score+=bonus;
    logEvent('challenge_group_bonus',{stage:S.stage,group:e.group,bonus,hits:S.ch.hits,total:S.ch.total});
   }
  }
  logEvent('enemy_killed',Object.assign({points:pts,dive,challenge:1,rescued:0,turnedHostile:0,playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
 return
 }
 if(e.t==='bee')pts=dive?100:50;
 else if(e.t==='but')pts=dive?160:80;
 else if(e.t==='rogue')pts=dive?1000:500;
 else if(e.t==='boss'){
  if(dive){
   const escorts=activeEscortCount(e);
   // Manual-backed Stage 4+ special attack squadron scoring:
   // 400 / 800 / 1600 depending on how many escorts are still attached.
   pts=escorts>=2?1600:escorts===1?800:400;
   if(S.stage>=4&&escorts>0){
    logEvent('special_attack_bonus',{stage:S.stage,bonus:pts,escorts});
    S.alertTxt=`SPECIAL BONUS ${pts}`;
    S.alertT=Math.max(S.alertT,1.1);
   }
  }else pts=150;
 }
 S.score+=pts;
 logEvent('enemy_killed',Object.assign({points:pts,dive,challenge:0,rescued:!!(e.carry&&dive),turnedHostile:!!(e.carry&&!dive),playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
 if(e.carry){
  if(dive){S.cap={x:e.x,y:e.y,vy:90,t:8};sfx.rescue();}
  else{S.rogue=Math.min(3,S.rogue+1);S.alertTxt='CAPTURED FIGHTER TURNED HOSTILE';S.alertT=2.2;}
 }
}

function assignEscorts(boss){
 if(boss.t!=='boss')return;
 const maxEscorts=S.stage===1&&S.scriptMode?1:2;
 const squadId=++S.squadSeq;
 const cand=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.t==='but'&&Math.abs(e.c-boss.c)<=2).sort((a,b)=>Math.abs(a.c-boss.c)-Math.abs(b.c-boss.c)).slice(0,maxEscorts);
 boss.esc=0;boss.squadId=cand.length?squadId:0;
 for(const [i,e] of cand.entries()){e.dive=5;e.lead=boss.id;e.off=(i?1:-1)*64;e.shot=1;e.squadId=squadId;boss.esc++;logEnemyAttackStart(e,'escort',{lead:boss.id,offset:e.off});}
}

function pickScriptEnemy(type,c){
 const set=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.t===type);
 if(!set.length)return null;
 return set.sort((a,b)=>Math.abs(a.c-c)-Math.abs(b.c-c))[0];
}

function startDive(e,p,opts={}){
 if(!e)return;
 e.low=0;
 if(opts.capture&&e.t==='boss'&&canCapture()){e.dive=4;e.targetX=cl(p.x+rnd(28,-28),24,PLAY_W-24);e.targetY=132;e.vx=0;e.vy=S.stage<=2?110:120;e.shot=0;e.esc=0;logEnemyAttackStart(e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:1});return;}
 e.dive=1;e.vx=(p.x-e.x)*.56+rnd(26,-26);e.vy=scriptedDiveVy(S.stage)+rnd(S.stage<=2?8:12);e.shot=e.t==='boss'?2:1;
 logEnemyAttackStart(e,'dive',{targetX:+p.x.toFixed(2),scripted:1});
 if(opts.escort&&e.t==='boss')assignEscorts(e);
}

function runStage1Script(dt,p,T){
 if(!S.scriptMode)return;
 S.scriptT+=dt;
 if(S.scriptT>52){S.scriptMode=0;return;}
 while(S.scriptI<STAGE1_SCRIPT.length&&S.scriptT>=STAGE1_SCRIPT[S.scriptI].t){
  if(S.stage===1&&S.att>=1)break;
  const s=STAGE1_SCRIPT[S.scriptI++],e=pickScriptEnemy(s.type,s.c);
  startDive(e,p,{capture:!!s.capture,escort:!!s.escort});
 }
 S.scriptShotT-=dt;
 if(S.scriptShotT<=0&&S.eb.length<shotCap()){
 const order=[1,7,3,8,0,9,2,6,4,5];
 const c=order[S.scriptShotI++%order.length];
 const cand=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.c===c).sort((a,b)=>b.y-a.y)[0];
 if(cand){const aim=cl((p.x-cand.x)*T.aimMul,-T.aimClamp,T.aimClamp);fireEnemyBullet(cand,aim,T.bulletVy+S.stage*T.bulletVyStage,'script');}
 S.scriptShotT=1.35;
}
}

function updateChallengeEnemy(e,dt){
 if(e.spawn>0){e.spawn-=dt;return}
 // Challenge-stage fidelity is intentionally isolated here so we can tune the
 // first challenge pattern against reference footage without disturbing the
 // normal stage attack logic.
 const fm=familyMotion(e);
 const classicStage3=S.stage===3&&e.fam==='classic';
 e.tm+=dt*((classicStage3?.345:.355)+(e.wave||0)*.007+Math.min(.012,S.stage*.0015));
 const u=e.tm,p=e.ph,wave=e.wave||0,side=e.side||1,slot=e.slot||0,row=e.row||0,sweep=e.sweep||1;
  const laneX=PLAY_W/2+side*(48+slot*16);
  const topY=38+wave*14+row*8;
 if(u<3.15){
  const q=u/3.15,startX=side>0?PLAY_W+44:-44,curve=1-Math.pow(1-q,2);
  e.x=startX+(laneX-startX)*curve;
  e.y=topY+Math.sin(q*3.14+p)*2*fm.challengeDrop;
 }else if(u<9.7){
  const q=(u-3.15)/6.55;
  e.x=laneX+sweep*Math.sin(q*Math.PI)*28*fm.challengeSweep;
  e.y=topY+q*(classicStage3?5.8:6.5)*fm.challengeDrop+Math.sin(q*5.5+p)*(classicStage3?.82:.95);
 }else{
  const q=(u-9.7)/3.35;
  e.x=laneX-sweep*(4+q*34*fm.challengeSweep)+Math.sin(q*5.1+p)*1.2;
  e.y=topY+8+q*(classicStage3?188:198)*fm.challengeDrop;
 }
 if(e.y<=(e.upperBandY||PLAY_H*.5)){e.ub+=dt;if(S.ch){S.ch.upperBandTime+=dt;S.ch.upperBandSamples++;}}
 if(e.y>PLAY_H+34||e.x<-54||e.x>PLAY_W+54){e.hp=0;e.miss=1;}
}

function updateEnemy(e,dt,t,T,p){
 if(e.hp<=0)return;
 const cleanup=S.stage===1&&!S.challenge&&S.liveCount<=6;
 const fm=familyMotion(e);
 const pulseX=(S.stage>=8?28:S.stage>=4?34:38)*fm.pulseX,pulseY=(S.stage>=8?1.9:S.stage>=4?2.6:3.4)*fm.pulseY;
 const tx=e.tx+Math.sin(t*.92+e.r*.45)*pulseX,ty=e.ty+Math.sin(t*1.35+e.c*.55)*pulseY;
 if(!e.form){
  if(e.spawn>0){e.spawn-=dt;return}
  const stage1=S.stage===1&&!S.challenge;
  e.en+=dt*(stage1?1.02:1.35);
  const k=Math.max(0,1-e.en*(stage1?0.35:0.42));
  const sx=tx+Math.sin(e.en*(stage1?5.6:5)+e.ph)*(stage1?170:(S.stage>=6?136:150))*fm.entryX*k;
  const sy=ty+Math.cos(e.en*(stage1?4.5:4)+e.ph)*(stage1?58:(S.stage>=6?42:48))*fm.entryY*k;
  e.x+=(sx-e.x)*Math.min(1,dt*(stage1?3.1:3.6));e.y+=(sy-e.y)*Math.min(1,dt*(stage1?3:3.4));if(e.en>(stage1?2.9:2.4))e.form=1;return;
 }
 if(e.dive===5){
  S.att++;const l=S.e.find(q=>q.id===e.lead&&q.hp>0&&(q.dive===1||q.dive===4||q.dive===2));
  if(!l){e.dive=1;e.low=0;e.lead=null;e.vx=rnd(26,-26);e.vy=S.stage<=2?96:104;return}
  e.x+=(l.x+e.off-e.x)*Math.min(1,dt*6.2);e.y+=(l.y-34-e.y)*Math.min(1,dt*6);
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap()&&randUnit()<dt*T.diveShotRate*.55){const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);fireEnemyBullet(e,aim,T.bulletVy+S.stage*T.bulletVyStage,'escort');e.shot--;}
  return;
 }
 if(e.dive===2){
  S.att++;e.x+=Math.sin(t*6.4+e.ph)*6*dt;e.beamT-=dt;
  if(e.beam&&canCapture()&&Math.abs(p.x-e.x)<8&&p.y>e.y+12&&p.y<e.y+VIS.beamLen)capturePlayer(e);
  if(e.beamT<=0){e.beam=0;e.dive=1;e.vx=rnd(28,-28);e.vy=S.stage<=2?102:112;e.shot=1;e.esc=0}
  return;
 }
 if(e.dive===4){
  S.att++;e.x+=(e.targetX-e.x)*Math.min(1,dt*3);e.y+=e.vy*dt;
  if(e.y>=e.targetY){e.y=e.targetY;e.vx=e.vy=0;e.dive=2;e.beam=1;e.beamT=2.05}
  return;
 }
 if(e.dive===1){
  S.att++;e.vy+=diveAccel(S.stage)*fm.diveAccel*dt;e.x+=e.vx*dt+Math.sin(e.tm*7+e.ph)*13*fm.weave*dt;e.y+=e.vy*dt;
  if(!e.low&&e.y>=PLAY_H*.62){e.low=1;logEvent('enemy_lower_field',Object.assign({stage:S.stage,y:+e.y.toFixed(2),stageClock:+S.stageClock.toFixed(3)},enemyRef(e)))}
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap()&&e.y>108&&e.y<p.y-88&&randUnit()<dt*T.diveShotRate){const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);fireEnemyBullet(e,aim,T.bulletVy+S.stage*T.bulletVyStage,'dive');e.shot--;}
  if(e.y>PLAY_H+30){e.x=tx;e.y=-26;e.vx=e.vy=0;e.dive=3;e.low=0;e.beam=0;e.esc=0}
  return;
 }
 if(e.dive===3){e.x+=(tx-e.x)*Math.min(1,dt*3.1);e.y+=(ty-e.y)*Math.min(1,dt*3.2);if(Math.hypot(tx-e.x,ty-e.y)<5){e.dive=0;e.vx=e.vy=0;e.esc=0}return}
 e.x+=(tx-e.x)*Math.min(1,dt*6);e.y+=(ty-e.y)*Math.min(1,dt*6);e.cool-=dt*(cleanup?1.8:1);
 if(S.scriptMode)return;
 const attackCap=cleanup?2:T.attackCap,diveRate=cleanup?T.diveRate*1.7:T.diveRate,stageAttackGap=!S.challenge&&S.stage>=4&&!cleanup;
 if(e.cool<=0&&randUnit()<dt*diveRate&&S.att<attackCap&&S.recoverT<=0&&(!stageAttackGap||S.attackGapT<=0)&&!(S.stage===4&&S.stageClock<3.7)&&!(S.stage===5&&S.stageClock<1.9)){
  e.cool=cleanup?rnd(1.4,.6):rnd(T.coolA,T.coolB)-S.stage*.02;
  if(e.t==='boss'&&canCapture()&&randUnit()<T.capChance){e.dive=4;e.targetX=cl(p.x+rnd(34,-34),26,PLAY_W-26);e.targetY=138;e.vx=0;e.vy=S.stage<=2?116:128;e.shot=0;e.esc=0;logEnemyAttackStart(e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:0});}
  else{const steer=(S.stage===4?.31:S.stage>=5?.48:.56)*fm.steer,jitter=(S.stage===4?20:S.stage>=5?32:38)*fm.jitter;e.dive=1;e.low=0;e.vx=(p.x-e.x)*steer+rnd(jitter,-jitter);e.vy=randomDiveVy(S.stage)*fm.diveVy+rnd(S.stage===4?14:S.stage>=5?20:12);e.shot=e.t==='boss'?2:1;logEnemyAttackStart(e,'dive',{targetX:+p.x.toFixed(2),scripted:0});if(e.t==='boss')assignEscorts(e)}
  if(stageAttackGap)S.attackGapT=(S.stage>=6?.82:S.stage===5?.88:1.18)+rnd(.12,.03);
 }
}

function update(dt){
 if(!started||paused)return;
 recShotT-=dt;
 if(recShotT<=0){logSnapshot('tick');recShotT=.5;}
 S.shake=Math.max(0,S.shake-dt);S.alertT=Math.max(0,S.alertT-dt);
 S.recoverT=Math.max(0,S.recoverT-dt);S.attackGapT=Math.max(0,S.attackGapT-dt);S.nextStageT=Math.max(0,S.nextStageT-dt);
 S.stageClock+=dt;
 const p=S.p;S.t=stageTune(S.stage,S.challenge);const T=S.t;
 if(S.nextStageT>0){if(S.nextStageT<=dt){S.nextStageT=0;spawnStage();sfx.start();}return}
 for(const s of S.st){s.tw+=dt*(1.6+s.z*.9);s.y+=(14+s.z*22+S.stage*.5)*dt;if(s.y>PLAY_H+4){s.y=-4;s.x=rnd(PLAY_W)}}
 p.cd=Math.max(0,p.cd-dt);p.inv=Math.max(0,p.inv-dt);p.spawn=Math.max(0,p.spawn-dt);S.banner=Math.max(0,S.banner-dt);S.fireCD=Math.max(0,S.fireCD-dt);
 if(p.captured&&p.capBoss&&p.capBoss.hp>0){const capY=p.capBoss.y+26+Math.sin(performance.now()/140)*2.5;p.capT-=dt;p.x+=(p.capBoss.x-p.x)*Math.min(1,dt*4.1);p.y+=(capY-p.y)*Math.min(1,dt*3.9);if(p.capT<=0||Math.hypot(p.x-p.capBoss.x,p.y-capY)<8)finishCapture();}
 else if(p.captured){p.captured=0;p.capBoss=null;p.inv=1.2;}
 if(p.spawn<=0&&p.pending){p.pending=0;p.x=PLAY_W/2;p.y=PLAY_H-VIS.playerBottom}
 if(p.spawn<=0&&!p.captured){const hp=playerHitbox();p.x=cl(p.x+(((keys.ArrowRight||keys.KeyD)?1:0)-((keys.ArrowLeft||keys.KeyA)?1:0))*p.s*dt,hp.w+2,PLAY_W-hp.w-2);}
 if(keys.Space)shoot();

 const alive=S.e.filter(e=>e.hp>0);
 S.liveCount=alive.length;
 if(!alive.length&&!S.challenge){
  logEvent('stage_clear',{stage:S.stage,score:S.score});
  S.stage++;
  if(isChallengeStage(S.stage)){
   S.pb.length=0;S.eb.length=0;S.cap=null;S.att=0;S.nextStageT=2.6;S.bannerTxt='CHALLENGING STAGE';S.bannerSub=`STAGE ${S.stage}`;S.bannerMode='challengeIntro';S.banner=2.6;
  }else{spawnStage();sfx.start();}
  return
 }
 if(S.challenge&&!alive.length&&!S.ch.done){
  logEvent('challenge_clear',{stage:S.stage,hits:S.ch.hits,total:S.ch.total,upperBandY:Math.round(S.ch.upperBandY||PLAY_H*.5),upperBandTime:+(S.ch.upperBandTime||0).toFixed(3),avgUpperBandTime:S.ch.total?+((S.ch.upperBandTime||0)/S.ch.total).toFixed(3):0});
  S.ch.done=1;
  const perfect=S.ch.hits===S.ch.total?10000:0;
  S.ch.perfect=perfect;
  S.score+=perfect;
  S.bannerTxt=perfect?'PERFECT BONUS':'CHALLENGE COMPLETE';
  S.bannerSub=`HITS ${S.ch.hits}/${S.ch.total}`;
  const bonusTotal=(S.ch.bonus||0)+perfect;
  if(bonusTotal)S.bannerSub+=`\nBONUS ${bonusTotal}`;
  S.bannerMode='challengeResult';
  S.banner=3.1;
  S.stage++;
  setTimeout(()=>{if(started)spawnStage()},1250);
 }

 const t=performance.now()/1000;S.seqT-=dt;if(S.seqT<=0&&!S.challenge){S.seqT=.38;sfx.march(S.seq++)}
 S.att=0;
 for(const e of S.e){e.tm+=dt;if(e.hp<=0)continue;if(S.challenge)updateChallengeEnemy(e,dt);else updateEnemy(e,dt,t,T,p)}
 runStage1Script(dt,p,T);

 const cleanup=!S.challenge&&S.stage===1&&alive.length<=6;
 if(!S.challenge&&!S.scriptMode&&S.fireCD<=0&&S.eb.length<shotCap()&&S.recoverT<=0&&!(S.stage>=4&&S.attackGapT>.18)&&!(S.stage===4&&S.stageClock<4.9)&&!(S.stage===5&&S.stageClock<2.8)){
  const bottoms={};for(const e of S.e)if(e.hp>0&&e.form&&!e.dive&&!e.ch){if(!bottoms[e.c]||e.y>bottoms[e.c].y)bottoms[e.c]=e}
  const list=Object.values(bottoms);
  if(list.length){
   let pool=list;
   let bulletVx=rnd(2,-2),bulletVy=154+S.stage*4;
   if(S.stage===4&&S.stageClock<8.2){
    // Early Stage 4 formation shots should pressure movement without coming
    // straight down the player's current lane.
    const offsetPool=list.filter(e=>Math.abs(e.x-p.x)>=26);
    if(offsetPool.length)pool=offsetPool;
    bulletVx=rnd(1.3,-1.3);
    bulletVy-=8;
   }
   const q=pool[(randUnit()*pool.length)|0];
   fireEnemyBullet(q,bulletVx,bulletVy,'formation');
   S.fireCD=(cleanup?rnd(.9,.45):rnd(T.globalA,T.globalB)-Math.min(.08,S.stage*.003))+(S.stage===4&&S.stageClock<8.2?.28:0);
  }else S.fireCD=.25;
 }

 for(let i=S.pb.length-1;i>=0;i--){const b=S.pb[i];b.y-=b.v*dt;if(b.y<-30){S.pb.splice(i,1);continue}
  for(const e of S.e){
   if(e.hp<=0)continue;
   const cf=carriedFighterTarget(e);
   // Check the carried fighter before the boss body so manual scoring can
   // distinguish "shot the rescued fighter" from "killed the boss."
   if(cf&&Math.abs(b.x-cf.x)<cf.w&&Math.abs(b.y-cf.y)<cf.h){
    S.stats.hits++;
    S.pb.splice(i,1);
    destroyCarriedFighter(e);
    break;
   }
   const h=enemyHitbox(e);
   if(e.carry&&b.y>=e.y+8)continue;
   if(Math.abs(b.x-e.x)<h.w&&Math.abs(b.y-e.y)<h.h){
    S.stats.hits++;
    S.pb.splice(i,1);
    e.hp--;
    if(e.hp<=0){awardKill(e,e.dive);ex(e.x,e.y,16,e.t==='boss'?'#ff8cd7':e.t==='but'?'#ffb55f':e.t==='rogue'?'#ffa4c0':'#ffe563');sfx.boom(e.t);}else sfx.hit();
    break;
   }
  }
 }

 for(let i=S.eb.length-1;i>=0;i--){const b=S.eb[i];b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>PLAY_H+30||b.x<-30||b.x>PLAY_W+30){S.eb.splice(i,1);continue}
  if(!S.challenge&&p.spawn<=0&&!p.captured){const h=playerHitbox();if(Math.abs(b.x-p.x)<h.w&&Math.abs(b.y-p.y)<h.h){S.eb.splice(i,1);loseShip({cause:'enemy_bullet',bulletKind:b.kind||'unknown',sourceId:b.sourceId||null,sourceType:b.sourceType||null,sourceDive:b.sourceDive??null,bulletX:+b.x.toFixed(2),bulletY:+b.y.toFixed(2),bulletVx:+b.vx.toFixed(2),bulletVy:+b.vy.toFixed(2)});}}}

 if(!S.challenge){for(const e of S.e){if(e.hp<=0||p.spawn>0||p.captured)continue;const he=enemyCollisionHitbox(e),hp=playerHitbox();if(Math.abs(e.x-p.x)<he.w+hp.w&&Math.abs(e.y-p.y)<he.h+hp.h){e.hp=0;ex(e.x,e.y,12,'#fff');loseShip({cause:'enemy_collision',enemyId:e.id,enemyType:e.t,enemyDive:e.dive,enemyX:+e.x.toFixed(2),enemyY:+e.y.toFixed(2),enemyForm:!!e.form});}}}

 if(S.cap){S.cap.y+=S.cap.vy*dt;S.cap.t-=dt;if(S.cap.t<=0||S.cap.y>PLAY_H+30)S.cap=null;else if(Math.abs(S.cap.x-p.x)<12&&Math.abs(S.cap.y-p.y)<10&&!p.captured&&p.spawn<=0){S.cap=null;p.dual=1;S.score+=1000;logEvent('fighter_rescued',{stage:S.stage,playerX:+p.x.toFixed(2),playerY:+p.y.toFixed(2)});S.alertTxt='DUAL FIGHTER READY';S.alertT=1.45;sfx.rescue()}}
 for(let i=S.fx.length-1;i>=0;i--){const f=S.fx[i];f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.985;f.vy*=.985;if(f.t<=0)S.fx.splice(i,1)}
}

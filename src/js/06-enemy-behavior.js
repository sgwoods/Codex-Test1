// Aurora-specific enemy dive, challenge motion, and attack helpers.

function scriptedDiveVy(stage){
 return stageFlightTune(stage).scriptedDiveVy;
}

function randomDiveVy(stage){
 return stageFlightTune(stage).randomDiveVy;
}

function diveAccel(stage){
 return stageFlightTune(stage).diveAccel;
}

function pickScriptEnemy(type,c){
 const set=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.t===type);
 if(!set.length)return null;
 return set.sort((a,b)=>Math.abs(a.c-c)-Math.abs(b.c-c))[0];
}

function startDive(e,p,opts={}){
 if(!e)return;
 e.low=0;
 if(opts.capture&&e.t==='boss'&&canCapture()){
  e.dive=4;
  e.targetX=cl(p.x+rnd(28,-28),24,PLAY_W-24);
  e.targetY=132;
  e.vx=0;
  e.vy=S.stage<=2?110:120;
  e.shot=0;
  e.esc=0;
  logEnemyAttackStart(e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:1});
  return;
 }
 const stage1Scripted=S.stage===1&&!S.challenge;
 const steer=stage1Scripted?.42:.56;
 const jitter=stage1Scripted?18:26;
 const vyRnd=stage1Scripted?5:(S.stage<=2?8:12);
 e.dive=1;
 e.vx=(p.x-e.x)*steer+rnd(jitter,-jitter);
 e.vy=scriptedDiveVy(S.stage)+rnd(vyRnd,-vyRnd);
 e.shot=e.t==='boss'?2:1;
 logEnemyAttackStart(e,'dive',{targetX:+p.x.toFixed(2),scripted:1});
 if(opts.escort&&e.t==='boss')assignEscorts(e);
}

function runStage1Script(dt,p,T){
 if(!S.scriptMode)return;
 S.scriptT+=dt;
 if(S.scriptT>52){
  S.scriptMode=0;
  return;
 }
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
  if(cand){
   const aim=cl((p.x-cand.x)*T.aimMul,-T.aimClamp,T.aimClamp);
   fireEnemyBullet(cand,aim,T.bulletVy+S.stage*T.bulletVyStage,'script');
  }
  S.scriptShotT=1.35;
 }
}

function updateChallengeEnemy(e,dt){
 if(e.spawn>0){
  e.spawn-=dt;
  return;
 }
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
 if(e.y<=(e.upperBandY||PLAY_H*.5)){
  e.ub+=dt;
  if(S.ch){
   S.ch.upperBandTime+=dt;
   S.ch.upperBandSamples++;
  }
 }
 if(e.y>PLAY_H+34||e.x<-54||e.x>PLAY_W+54){
  e.hp=0;
  e.miss=1;
 }
}

function updateEnemy(e,dt,t,T,p){
 if(e.hp<=0)return;
 e.hitT=Math.max(0,(e.hitT||0)-dt);
 const cleanup=S.stage===1&&!S.challenge&&S.liveCount<=6;
 const fm=familyMotion(e);
 const pulseX=(S.stage>=8?28:S.stage>=4?34:38)*fm.pulseX,pulseY=(S.stage>=8?1.9:S.stage>=4?2.6:3.4)*fm.pulseY;
 const tx=e.tx+Math.sin(t*.92+e.r*.45)*pulseX,ty=e.ty+Math.sin(t*1.35+e.c*.55)*pulseY;
 if(!e.form){
  if(e.spawn>0){
   e.spawn-=dt;
   return;
  }
  const stage1=S.stage===1&&!S.challenge;
  e.en+=dt*(stage1?1.02:1.35);
  const k=Math.max(0,1-e.en*(stage1?0.35:0.42));
  const sx=tx+Math.sin(e.en*(stage1?5.6:5)+e.ph)*(stage1?170:(S.stage>=6?136:150))*fm.entryX*k;
  const sy=ty+Math.cos(e.en*(stage1?4.5:4)+e.ph)*(stage1?58:(S.stage>=6?42:48))*fm.entryY*k;
  e.x+=(sx-e.x)*Math.min(1,dt*(stage1?3.1:3.6));
  e.y+=(sy-e.y)*Math.min(1,dt*(stage1?3:3.4));
  if(e.en>(stage1?2.9:2.4))e.form=1;
  return;
 }
 if(e.dive===5){
  S.att++;
  const l=S.e.find(q=>q.id===e.lead&&q.hp>0&&(q.dive===1||q.dive===4||q.dive===2));
  if(!l){
   e.dive=1;
   e.low=0;
   e.lead=null;
   e.vx=rnd(26,-26);
   e.vy=S.stage<=2?96:104;
   return;
  }
  const { escortTrackX, escortTrackY, escortLift }=specialSquadronTuning(S.stage);
  e.x+=(l.x+e.off-e.x)*Math.min(1,dt*escortTrackX);
  e.y+=(l.y-escortLift-e.y)*Math.min(1,dt*escortTrackY);
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap()&&randUnit()<dt*T.diveShotRate*.55){
   const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);
   fireEnemyBullet(e,aim,T.bulletVy+S.stage*T.bulletVyStage,'escort');
   e.shot--;
  }
  return;
 }
 if(e.dive===2){
  S.att++;
  e.x+=Math.sin(t*6.4+e.ph)*6*dt;
  e.beamT-=dt;
  if(e.beam&&canCapture()&&Math.abs(p.x-e.x)<8&&p.y>e.y+12&&p.y<e.y+VIS.beamLen)capturePlayer(e);
  if(e.beamT<=0){
   e.beam=0;
   e.dive=1;
   e.vx=rnd(28,-28);
   e.vy=S.stage<=2?102:112;
   e.shot=1;
   e.esc=0;
  }
  return;
 }
 if(e.dive===4){
  S.att++;
  e.x+=(e.targetX-e.x)*Math.min(1,dt*3);
  e.y+=e.vy*dt;
  if(e.y>=e.targetY){
   e.y=e.targetY;
   e.vx=e.vy=0;
   e.dive=2;
   e.beam=1;
   e.beamT=2.05;
  }
  return;
 }
 if(e.dive===1){
  S.att++;
  e.vy+=diveAccel(S.stage)*fm.diveAccel*dt;
  e.x+=e.vx*dt+Math.sin(e.tm*7+e.ph)*13*fm.weave*dt;
  e.y+=e.vy*dt;
  if(!e.low&&e.y>=PLAY_H*.62){
   e.low=1;
   logEvent('enemy_lower_field',Object.assign({stage:S.stage,y:+e.y.toFixed(2),stageClock:+S.stageClock.toFixed(3),playerLane:playLane(p.x)},enemyRef(e)));
  }
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap()&&e.y>108&&e.y<p.y-88&&randUnit()<dt*T.diveShotRate){
   const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);
   fireEnemyBullet(e,aim,T.bulletVy+S.stage*T.bulletVyStage,'dive');
   e.shot--;
  }
  if(e.y>PLAY_H+30){
   e.x=tx;
   e.y=-26;
   e.vx=e.vy=0;
   e.dive=3;
   e.low=0;
   e.beam=0;
   e.esc=0;
  }
  return;
 }
 if(e.dive===3){
  e.x+=(tx-e.x)*Math.min(1,dt*3.1);
  e.y+=(ty-e.y)*Math.min(1,dt*3.2);
  if(Math.hypot(tx-e.x,ty-e.y)<5){
   e.dive=0;
   e.vx=e.vy=0;
   e.esc=0;
  }
  return;
 }
 e.x+=(tx-e.x)*Math.min(1,dt*6);
 e.y+=(ty-e.y)*Math.min(1,dt*6);
 e.cool-=dt*(cleanup?1.8:1);
 if(S.scriptMode)return;
 const attackCap=cleanup?2:T.attackCap,diveRate=cleanup?T.diveRate*1.7:T.diveRate,stageAttackGap=!S.challenge&&(S.stage===2||S.stage>=4)&&!cleanup;
 if(e.cool<=0&&randUnit()<dt*diveRate&&S.att<attackCap&&S.recoverT<=0&&(!stageAttackGap||S.attackGapT<=0)&&!(S.stage===2&&S.stageClock<3.85)&&!(S.stage===4&&S.stageClock<3.7)&&!(S.stage===5&&S.stageClock<1.9)){
  e.cool=cleanup?rnd(1.4,.6):rnd(T.coolA,T.coolB)-S.stage*.02;
  if(e.t==='boss'&&canCapture()&&!(S.stage===2&&S.stageClock<8.2)&&randUnit()<T.capChance){
   e.dive=4;
   e.targetX=cl(p.x+rnd(34,-34),26,PLAY_W-26);
   e.targetY=138;
   e.vx=0;
   e.vy=S.stage<=2?116:128;
   e.shot=0;
   e.esc=0;
   logEnemyAttackStart(e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:0});
  }else{
   const steer=(S.stage===2?.42:S.stage===4?.31:S.stage>=5?.48:S.stage===1?.46:.56)*fm.steer;
   const jitter=(S.stage===2?22:S.stage===4?20:S.stage>=5?32:S.stage===1?24:38)*fm.jitter;
   const vyRnd=S.stage===4?14:S.stage>=5?20:S.stage===2?8:S.stage===1?6:12;
   e.dive=1;
   e.low=0;
   e.vx=(p.x-e.x)*steer+rnd(jitter,-jitter);
   e.vy=randomDiveVy(S.stage)*fm.diveVy+rnd(vyRnd,-vyRnd);
   e.shot=e.t==='boss'?2:1;
   logEnemyAttackStart(e,'dive',{targetX:+p.x.toFixed(2),scripted:0});
   if(e.t==='boss')assignEscorts(e);
  }
  if(stageAttackGap)S.attackGapT=(S.stage>=6?.82:S.stage===5?.88:S.stage===4?1.18:S.stage===2?1.08:1.18)+rnd(.12,.03);
 }
}

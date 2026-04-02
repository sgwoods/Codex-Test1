// Aurora-specific player combat, bullet resolution, and rescue-return helpers.

function bulletsMax(){return S.p.dual?4:2}
function dualShotOffsets(){return S.p.dual?[-10,10]:[0]}

function shoot(){
 const p=S.p;
 const captureWindow=!!(p.captured&&p.capBoss&&p.capBoss.hp>0&&p.capT>.55);
 if(p.cd>0||p.spawn>0||p.returning||(!captureWindow&&p.captured))return;
 if(S.pb.length>=bulletsMax())return;
 p.cd=S.challenge?.095:.24;const y=p.y-18;
 const shotXs=dualShotOffsets().map(off=>p.x+off);
 S.stats.shots+=p.dual?2:1;
 if(p.dual)S.pb.push({x:shotXs[0],y,v:560},{x:shotXs[1],y,v:560});
 else S.pb.push({x:shotXs[0],y,v:560});
 logEvent('player_shot',{dual:!!p.dual,shots:p.dual?2:1,x:+p.x.toFixed(2),y:+y.toFixed(2),shotXs:shotXs.map(v=>+v.toFixed(2)),spread:p.dual?+(shotXs[1]-shotXs[0]).toFixed(2):0,activeBullets:S.pb.length,captureWindow});
 sfx.shot();
}

function playerBulletSegment(b){
 const x=+b.x||0,y=+b.y||0;
 return {x,top:y-16,bottom:y+2};
}

function segmentHitsTarget(seg,targetX,targetY,targetW,targetH){
 return Math.abs(seg.x-targetX)<targetW && seg.bottom>targetY-targetH && seg.top<targetY+targetH;
}

function updatePlayerBullets(dt){
 for(let i=S.pb.length-1;i>=0;i--){const b=S.pb[i];b.y-=b.v*dt;if(b.y<-30){S.pb.splice(i,1);continue}
  const seg=playerBulletSegment(b);
  for(const e of S.e){
   if(e.hp<=0)continue;
   const cf=carriedFighterTarget(e);
   // Check the carried fighter before the boss body so manual scoring can
   // distinguish "shot the rescued fighter" from "killed the boss."
   if(cf&&segmentHitsTarget(seg,cf.x,cf.y,cf.w,cf.h)){
    S.stats.hits++;
    S.pb.splice(i,1);
    destroyCarriedFighter(e);
    break;
   }
   const h=enemyHitbox(e);
   if(e.carry&&seg.top>=e.y+8)continue;
   if(segmentHitsTarget(seg,e.x,e.y,h.w,h.h)){
    S.stats.hits++;
    S.pb.splice(i,1);
    const hpBefore=e.hp;
    e.hp--;
    e.hitT=.34;
    if(e.hp<=0){awardKill(e,e.dive);ex(e.x,e.y,16,e.t==='boss'?'#ff8cd7':e.t==='but'?'#ffb55f':e.t==='rogue'?'#ffa4c0':'#ffe563');sfx.boom(e.t);}
    else{
     logEvent('enemy_damaged',Object.assign({stage:S.stage,hpBefore,hpAfter:e.hp,playerBullets:S.pb.length,enemyBullets:S.eb.length},enemyRef(e)));
     if(e.t==='boss'&&hpBefore>e.hp){
      ex(e.x,e.y,8,'#fff4a8');
      sfx.bossHit();
     }else sfx.hit();
    }
    break;
   }
  }
 }
}

function updateEnemyBullets(dt,p){
 for(let i=S.eb.length-1;i>=0;i--){const b=S.eb[i];b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>PLAY_H+30||b.x<-30||b.x>PLAY_W+30){S.eb.splice(i,1);continue}
  // Reference note for #33: original Galaga challenge stages are treated as
  // non-attacking/non-lethal bonus rounds, so player deaths remain disabled
  // while S.challenge is active.
  if(!S.challenge&&p.spawn<=0&&!p.captured){const h=playerHitbox();if(Math.abs(b.x-p.x)<h.w&&Math.abs(b.y-p.y)<h.h){S.eb.splice(i,1);loseShip({cause:'enemy_bullet',bulletKind:b.kind||'unknown',sourceId:b.sourceId||null,sourceType:b.sourceType||null,sourceDive:b.sourceDive??null,bulletX:+b.x.toFixed(2),bulletY:+b.y.toFixed(2),bulletLane:playLane(b.x),bulletVx:+b.vx.toFixed(2),bulletVy:+b.vy.toFixed(2)});}}}
}

function updateEnemyBodyCollisions(p){
 for(const e of S.e){if(e.hp<=0||p.spawn>0||p.captured||p.returning)continue;const he=enemyCollisionHitbox(e),hp=playerHitbox();if(Math.abs(e.x-p.x)<he.w+hp.w&&Math.abs(e.y-p.y)<he.h+hp.h){e.hp=0;ex(e.x,e.y,12,'#fff');loseShip({cause:'enemy_collision',enemyId:e.id,enemyType:e.t,enemyDive:e.dive,enemyX:+e.x.toFixed(2),enemyY:+e.y.toFixed(2),enemyLane:playLane(e.x),enemyForm:!!e.form,challenge:!!S.challenge});}}
}

function updateReleasedCapture(dt,p){
 if(!S.cap)return;
 S.cap.t-=dt;
 if(S.cap.mode==='dock'){
  S.cap.spin=(S.cap.spin||0)+dt*8.8;
  const side=S.cap.side||1;
  const targetX=cl(p.x+side*(p.dual?14:10),14,PLAY_W-14);
  const targetY=p.y-2;
  S.cap.x+=(targetX-S.cap.x)*Math.min(1,dt*3.8)+(S.cap.vx||0)*dt;
  S.cap.y+=(targetY-S.cap.y)*Math.min(1,dt*2.8)+(S.cap.vy||0)*dt;
  S.cap.vy=Math.max(0,(S.cap.vy||0)-92*dt);
  if(S.cap.t<=0||S.cap.y>PLAY_H+32)S.cap=null;
  else if(!p.captured&&p.spawn<=0&&Math.abs(S.cap.x-targetX)<5&&Math.abs(S.cap.y-targetY)<5)awardRescueJoin(1);
 }else{
  S.cap.y+=S.cap.vy*dt;
  if(S.cap.t<=0||S.cap.y>PLAY_H+30)S.cap=null;
  else if(Math.abs(S.cap.x-p.x)<12&&Math.abs(S.cap.y-p.y)<10&&!p.captured&&p.spawn<=0)awardRescueJoin(0)
 }
}

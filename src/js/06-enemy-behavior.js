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

function pickScriptEnemy(state,type,c){
 if(!isAuroraRuntimeState(state)){c=type;type=state;state=currentAuroraRuntimeState();}
 const S=state;
 const set=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.t===type);
 if(!set.length)return null;
 return set.sort((a,b)=>Math.abs(a.c-c)-Math.abs(b.c-c))[0];
}

function startDive(state,e,p,opts={}){
 if(!isAuroraRuntimeState(state)){opts=p||{};p=e;e=state;state=currentAuroraRuntimeState();}
 const S=state;
 if(!e)return;
 const chargeTiming=usesRuntimeGalagaReferenceAudio()&&typeof currentGamePackReferenceTiming==='function'
  ? currentGamePackReferenceTiming('enemyDiveCharge')
  : null;
 e.low=0;
 if(opts.capture&&e.t==='boss'&&canCapture(S)){
  e.dive=4;
  e.targetX=cl(p.x+rnd(28,-28),24,PLAY_W-24);
  e.targetY=132;
  e.vx=0;
  e.vy=S.stage<=2?110:120;
  e.shot=0;
  e.esc=0;
  logEnemyAttackStart(S,e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:1});
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
  e.chargeCuePending=usesRuntimeGalagaReferenceAudio()?1:0;
  e.chargeCueT=chargeTiming?.cueDelay??0;
  e.chargeCueStartY=e.y;
  logEnemyAttackStart(S,e,'dive',{targetX:+p.x.toFixed(2),scripted:1});
  if(!e.chargeCuePending)sfx.attackCharge();
  if(opts.escort&&e.t==='boss')assignEscorts(S,e);
}

function runStage1Script(state,dt,p,T){
 if(!isAuroraRuntimeState(state)){T=p;p=dt;dt=state;state=currentAuroraRuntimeState();}
 const S=state;
 if(!S.scriptMode)return;
 S.scriptT+=dt;
 if(S.scriptT>52){
  S.scriptMode=0;
  return;
 }
 while(S.scriptI<STAGE1_SCRIPT.length&&S.scriptT>=STAGE1_SCRIPT[S.scriptI].t){
  if(S.stage===1&&S.att>=1)break;
  const s=STAGE1_SCRIPT[S.scriptI++],e=pickScriptEnemy(S,s.type,s.c);
  startDive(S,e,p,{capture:!!s.capture,escort:!!s.escort});
 }
 S.scriptShotT-=dt;
 if(S.scriptShotT<=0&&S.eb.length<shotCap(S)){
  const order=[1,7,3,8,0,9,2,6,4,5];
  const c=order[S.scriptShotI++%order.length];
  const cand=S.e.filter(e=>e.hp>0&&e.form&&!e.dive&&e.c===c).sort((a,b)=>b.y-a.y)[0];
  if(cand){
   const aim=cl((p.x-cand.x)*T.aimMul,-T.aimClamp,T.aimClamp);
   fireEnemyBullet(S,cand,aim,T.bulletVy+S.stage*T.bulletVyStage,'script');
  }
  S.scriptShotT=1.35;
 }
}

function challengePathSpeed(pathFamily,stage,classicStage3){
 switch(pathFamily){
  case 'first-challenge-peel': return .56;
  case 'classic-column-drop': return .6;
  case 'side-hook-return': return .61;
  case 'cross-sweep': return .64;
  case 'hook-arc': return .65;
  case 'boss-led-loop': return .62;
  case 'crown-split-cascade': return .66;
  case 'pink-serpentine': return .68;
  case 'pink-green-cascade': return .7;
  case 'pink-green-low-sweep': return .76;
  case 'pink-green-tall-drift': return .74;
  case 'pink-green-compact-exit': return .72;
  case 'green-ladder-split': return .72;
  case 'green-ladder-deep-drop': return .75;
  case 'green-ladder-center-fork': return .73;
  case 'green-ladder-high-exit': return .7;
  case 'yellow-diagonal-fan': return .76;
  case 'yellow-fan-low-drift': return .78;
  case 'yellow-fan-cross-cut': return .8;
  case 'yellow-fan-high-pop': return .72;
  case 'blue-purple-finale': return .74;
  default: return classicStage3 ? .56 : (stage >= 15 ? .68 : .62);
 }
}

function challengeReferenceLaneOffset(side,slot,row,laneSpread,arcAmp){
 const sideGap=(side||1)*(laneSpread*(1.16+slot*.18)+(row?laneSpread*.24:0));
 const slotGap=(slot-1.5)*laneSpread*.42;
 const rowGap=(row ? .34 : -.24)*laneSpread;
 return (sideGap+slotGap+rowGap)*arcAmp;
}

function challengeColumnX(side,slot,row){
 return PLAY_W/2+(side||1)*(28+slot*13+(row?4:0));
}

function applyReferenceChallengePath(e,u,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp){
 const ref=e.referencePath;
 const pts=Array.isArray(ref?.points)?ref.points:null;
 if(!pts||pts.length<2)return false;
 const motionSpec=e.motionSpecGroup;
 const first=pts[0],last=pts[pts.length-1];
 const duration=Math.max(.75,+motionSpec?.phaseDurations?.trackS||+ref.durationS||+last.t||8);
 const sourceCenterX=Number.isFinite(+ref.sourceCenterX)?+ref.sourceCenterX:.5;
 const sourceCenterY=Number.isFinite(+ref.sourceCenterY)?+ref.sourceCenterY:.5;
 const pathScaleX=Number.isFinite(+ref.pathScaleX)?+ref.pathScaleX:1;
 const pathScaleY=Number.isFinite(+ref.pathScaleY)?+ref.pathScaleY:1;
 const laneSpread=Number.isFinite(+ref.laneSpreadX)?+ref.laneSpreadX:9;
 const rowSpread=Number.isFinite(+ref.rowSpreadY)?+ref.rowSpreadY:7;
 const laneOffset=challengeReferenceLaneOffset(side,slot,row,laneSpread,arcAmp);
 const rowOffset=row*rowSpread*dropAmp;
 let point=last,prev=pts[Math.max(0,pts.length-2)];
 if(u<=first.t){
  point=first;prev=first;
 }else if(u<last.t){
  for(let i=1;i<pts.length;i++){
   if(u<=pts[i].t){
    const a=pts[i-1],b=pts[i],span=Math.max(.001,(+b.t||0)-(+a.t||0)),q=cl((u-(+a.t||0))/span,0,1);
    point={
     x:(+a.x||0)+((+b.x||0)-(+a.x||0))*q,
     y:(+a.y||0)+((+b.y||0)-(+a.y||0))*q,
     t:u
    };
    prev=a;
    break;
   }
  }
 }
 const over=Math.max(0,u-duration);
 const px=cl(sourceCenterX+((+point.x||sourceCenterX)-sourceCenterX)*pathScaleX,0,1);
 const py=cl(sourceCenterY+((+point.y||sourceCenterY)-sourceCenterY)*pathScaleY,0,1);
 const prevX=cl(sourceCenterX+((+prev.x||sourceCenterX)-sourceCenterX)*pathScaleX,0,1);
 const dx=point&&prev?cl((px-prevX)*PLAY_W,-42,42):0;
 const exitVy=Number.isFinite(+ref.exitVy)?+ref.exitVy:176;
 const exitSide=side||sweep||1;
 e.x=px*PLAY_W+laneOffset+Math.sin((u+slot*.21+wave*.37)*4.4)*2.2*arcAmp+over*(dx*.28+exitSide*18);
 e.y=py*PLAY_H+rowOffset+over*exitVy*dropAmp;
 if(over>.2)e.x+=sweep*Math.min(82,over*34)*arcAmp;
 return true;
}

function applyChallengeMotionSpecPath(e,u,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp){
 const spec=e.motionSpecGroup;
 if(!spec)return false;
 if(spec.evaluator!=='reference-spline-v1')return false;
 return applyReferenceChallengePath(e,u,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp);
}

function referenceChallengeFirstPosition(e,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp){
 const ref=e.referencePath;
 const pts=Array.isArray(ref?.points)?ref.points:null;
 if(!pts||pts.length<1)return null;
 const point=pts[0];
 const sourceCenterX=Number.isFinite(+ref.sourceCenterX)?+ref.sourceCenterX:.5;
 const sourceCenterY=Number.isFinite(+ref.sourceCenterY)?+ref.sourceCenterY:.5;
 const pathScaleX=Number.isFinite(+ref.pathScaleX)?+ref.pathScaleX:1;
 const pathScaleY=Number.isFinite(+ref.pathScaleY)?+ref.pathScaleY:1;
 const laneSpread=Number.isFinite(+ref.laneSpreadX)?+ref.laneSpreadX:9;
 const rowSpread=Number.isFinite(+ref.rowSpreadY)?+ref.rowSpreadY:7;
 const laneOffset=challengeReferenceLaneOffset(side,slot,row,laneSpread,arcAmp);
 const rowOffset=row*rowSpread*dropAmp;
 const px=cl(sourceCenterX+((+point.x||sourceCenterX)-sourceCenterX)*pathScaleX,0,1);
 const py=cl(sourceCenterY+((+point.y||sourceCenterY)-sourceCenterY)*pathScaleY,0,1);
 return {
  x:px*PLAY_W+laneOffset+Math.sin((slot*.21+wave*.37)*4.4)*2.2*arcAmp,
  y:py*PLAY_H+rowOffset
 };
}

function applyReferenceChallengeSpawnLeadIn(e,dt,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp){
 if(!e.referencePath)return false;
 e.tm=Math.max(0,(+e.tm||0)-dt);
 e.spawn=Math.max(0,(+e.spawn||0)-dt);
 const target=referenceChallengeFirstPosition(e,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp);
 if(!target)return true;
 const ref=e.referencePath;
 const specLead=e.motionSpecGroup?.phaseDurations?.leadInS;
 const lead=Math.max(.45,Math.min(1.15,Number.isFinite(+specLead)?+specLead:(Number.isFinite(+ref.entryLeadS)?+ref.entryLeadS:.78)));
 const q=cl(1-(+e.spawn||0)/lead,0,1);
 const startX=side>0?PLAY_W+46:-46;
 const startY=target.y-8-row*2-wave*.45;
 const ease=q*q;
 e.x=startX+(target.x-startX)*ease;
 e.y=startY+(target.y-startY)*ease+Math.sin(q*Math.PI+slot*.42+wave*.18)*2.4*dropAmp;
 e.referenceLeadIn=+q.toFixed(3);
 return true;
}

function updateChallengeEnemy(state,e,dt){
 if(!isAuroraRuntimeState(state)){dt=e;e=state;state=currentAuroraRuntimeState();}
 const S=state;
 const pathFamily=e.pathFamily||'classic-lane-wave';
 const fm=familyMotion(e);
 const classicStage3=S.stage===3&&e.fam==='classic';
 const baseChallengeSpeed=challengePathSpeed(pathFamily,S.stage,classicStage3);
 const wave=e.wave||0,side=e.side||1,slot=e.slot||0,row=e.row||0,sweep=e.sweep||1;
 const arcAmp=e.arcAmp||1,dropAmp=e.dropAmp||1;
 const laneX=PLAY_W/2+side*(48+slot*16);
 const yOffset=Number.isFinite(+e.yOffset)?+e.yOffset:0;
 const topY=38+wave*14+row*8+yOffset;
 if(e.spawn>0){
  if(applyReferenceChallengeSpawnLeadIn(e,dt,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp))return;
  e.tm=Math.max(0,(+e.tm||0)-dt);
  e.spawn-=dt;
  return;
 }
 // Challenge-stage fidelity is intentionally isolated here so we can tune the
 // first challenge pattern against reference footage without disturbing the
 // normal stage attack logic.
		 const referencePlaybackScale=e.referencePath
		  ? Math.max(.25,Math.min(1.4,Number.isFinite(+e.referencePath.playbackScale)?+e.referencePath.playbackScale:1))
		  : null;
		 // The shared enemy update loop already advances e.tm by real dt before
		 // challenge motion runs. Reference tracks store point times in seconds,
		 // so their local increment is only the delta above or below real time.
		 const pathTimeSpeed=referencePlaybackScale==null
		  ? (baseChallengeSpeed+(e.wave||0)*.007+Math.min(.012,S.stage*.0015))*(e.speedScale||1)
		  : referencePlaybackScale-1;
		 e.tm+=dt*pathTimeSpeed;
		 e.referenceLeadIn=0;
		 const u=e.tm,p=e.ph;
	 const entryDuration=pathFamily==='first-challenge-peel'?3.35:3.15;
	 if(!applyChallengeMotionSpecPath(e,u,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp)&&!applyReferenceChallengePath(e,u,laneX,topY,side,slot,row,wave,sweep,arcAmp,dropAmp)){
	 if(u<entryDuration){
	  const q=u/entryDuration,startX=side>0?PLAY_W+44:-44,curve=1-Math.pow(1-q,2);
	  if(pathFamily==='hook-arc'){
	   e.x=startX+(laneX-startX)*(q<.58?Math.sin(q/.58*Math.PI/2):.82+(q-.58)*.43);
	   e.y=topY+Math.sin(q*Math.PI*1.65+p)*7*arcAmp;
	  }else if(pathFamily==='first-challenge-peel'){
	   e.x=startX+(laneX-startX)*Math.sin(q*Math.PI/2);
	   e.y=topY+q*5.2*dropAmp;
	  }else if(pathFamily==='classic-column-drop'){
	   const columnX=challengeColumnX(side,slot,row);
	   e.x=columnX+Math.sin(q*Math.PI+p+wave*.35)*5*arcAmp;
	   e.y=-26+q*(topY+34);
	  }else if(pathFamily==='side-hook-return'){
	   e.x=startX+(laneX-startX)*Math.sin(q*Math.PI/2)+side*Math.sin(q*Math.PI*1.4+p)*12*arcAmp;
	   e.y=topY+Math.sin(q*Math.PI*.9+p)*12*dropAmp;
	  }else if(pathFamily==='crown-split-cascade'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*2.6+p+slot*.35)*22*arcAmp;
	   e.y=topY+Math.sin(q*Math.PI*1.8+p)*9*arcAmp+q*5*dropAmp;
	  }else if(pathFamily==='pink-serpentine'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*2.8+p+wave*.64)*20*arcAmp;
	   e.y=topY+q*8*dropAmp+Math.sin(q*Math.PI*3.4+p)*8*arcAmp;
	  }else if(pathFamily==='pink-green-cascade'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*(1.6+wave*.22)+p+slot*.3)*28*arcAmp;
	   e.y=topY+q*(10+wave*1.2)*dropAmp+Math.sin(q*Math.PI*2.4+p)*7*arcAmp;
	  }else if(pathFamily==='pink-green-low-sweep'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*1.4+p+slot*.2)*12*arcAmp;
	   e.y=topY+q*(132+slot*9)*dropAmp+Math.sin(q*Math.PI*1.7+p)*3;
	  }else if(pathFamily==='pink-green-tall-drift'){
	   const columnX=PLAY_W/2+side*(34+slot*10);
	   e.x=startX+(columnX-startX)*curve+sweep*Math.sin(q*Math.PI*1.1+p)*8*arcAmp;
	   e.y=topY+q*(188+slot*18)*dropAmp;
	  }else if(pathFamily==='pink-green-compact-exit'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*1.25+p)*10*arcAmp;
	   e.y=topY+q*(96+slot*7)*dropAmp+Math.sin(q*Math.PI*1.4+p)*2.5;
	  }else if(pathFamily==='green-ladder-split'){
	   const rung=slot%2?-1:1;
	   e.x=startX+(laneX-startX)*q+sweep*((q-.5)*12+rung*(9+q*5))*arcAmp;
	   e.y=topY+q*(38+slot*5)*dropAmp+row*5;
	  }else if(pathFamily==='green-ladder-deep-drop'){
	   const rung=slot%2?-1:1;
	   e.x=startX+(laneX-startX)*q+sweep*(rung*(12+q*6)+Math.sin(q*Math.PI*1.1+p)*8)*arcAmp;
	   e.y=topY+q*(86+slot*12)*dropAmp;
	  }else if(pathFamily==='green-ladder-center-fork'){
	   const centerX=PLAY_W/2+sweep*(slot-1.5)*8;
	   e.x=startX+(centerX-startX)*curve+sweep*Math.sin(q*Math.PI*1.25+p)*10*arcAmp;
	   e.y=topY+q*(58+slot*8)*dropAmp+Math.sin(q*Math.PI+p)*4;
	  }else if(pathFamily==='green-ladder-high-exit'){
	   const centerX=PLAY_W/2+sweep*(20+slot*7);
	   e.x=startX+(centerX-startX)*curve+sweep*Math.sin(q*Math.PI*1.4+p)*7*arcAmp;
	   e.y=topY+q*(28+slot*5)*dropAmp;
	  }else if(pathFamily==='yellow-diagonal-fan'){
	   const fanDir=wave%2?-1:1;
	   e.x=startX+(laneX-startX)*q+fanDir*(q*68+(slot-1.5)*14)*arcAmp;
	   e.y=topY+q*(48+slot*8)*dropAmp;
	  }else if(pathFamily==='yellow-fan-low-drift'){
	   const fanDir=wave%2?-1:1;
	   e.x=startX+(laneX-startX)*q+fanDir*(q*38+(slot-1.5)*10)*arcAmp;
	   e.y=topY+q*(112+slot*13)*dropAmp;
	  }else if(pathFamily==='yellow-fan-cross-cut'){
	   const fanDir=wave%2?-1:1;
	   e.x=startX+(laneX-startX)*curve+fanDir*(q*96+(slot-1.5)*18)*arcAmp;
	   e.y=topY+q*(74+slot*11)*dropAmp+Math.sin(q*Math.PI*1.7+p)*5;
	  }else if(pathFamily==='yellow-fan-high-pop'){
	   const fanDir=wave%2?-1:1;
	   e.x=startX+(laneX-startX)*curve+fanDir*(q*54+(slot-1.5)*12)*arcAmp;
	   e.y=topY+Math.sin(q*Math.PI+p)*22*dropAmp+q*(22+slot*5);
	  }else if(pathFamily==='blue-purple-finale'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*3.4+p+slot*.4)*24*arcAmp;
	   e.y=topY+q*6*dropAmp+Math.cos(q*Math.PI*2+p)*10*arcAmp;
	  }else if(pathFamily==='boss-led-loop'){
	   e.x=startX+(laneX-startX)*curve+sweep*Math.sin(q*Math.PI*2+p)*9*arcAmp;
	   e.y=topY+Math.sin(q*Math.PI*2.2+p)*6*arcAmp;
	  }else if(pathFamily==='cross-sweep'){
	   e.x=startX+(laneX-startX)*q+sweep*Math.sin(q*Math.PI+p)*18*arcAmp;
	   e.y=topY+Math.sin(q*Math.PI*1.25+p)*4*dropAmp;
	  }else{
	   e.x=startX+(laneX-startX)*curve;
	   e.y=topY+Math.sin(q*3.14+p)*2*fm.challengeDrop;
	  }
	 }else if(u<9.7){
	  const q=(u-entryDuration)/6.55;
	  if(pathFamily==='hook-arc'){
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*1.2)*42+Math.sin(q*Math.PI*3+p)*6)*fm.challengeSweep*arcAmp;
	   e.y=topY+q*12*dropAmp+Math.sin(q*7.2+p)*2.2;
	  }else if(pathFamily==='first-challenge-peel'){
	   const glide=22+slot*5;
	   e.x=laneX-side*(q*glide);
	   e.y=topY+q*9.5*dropAmp;
	  }else if(pathFamily==='classic-column-drop'){
	   const columnX=challengeColumnX(side,slot,row);
	   e.x=columnX+Math.sin(q*Math.PI*2.2+p+wave*.4)*7*arcAmp;
	   e.y=topY+q*(174+slot*7)*dropAmp;
	  }else if(pathFamily==='side-hook-return'){
	   const hook=Math.sin(q*Math.PI);
	   e.x=laneX-side*(hook*72+Math.sin(q*Math.PI*2.2+p)*9)*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(72+slot*9)*dropAmp+Math.cos(q*Math.PI*1.4+p)*5;
	  }else if(pathFamily==='crown-split-cascade'){
	   const cascade=slot%2?-1:1;
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*2.4+p*.4)*44+Math.sin(q*Math.PI)*28)*fm.challengeSweep*arcAmp*.82;
	   e.y=topY+q*(10+slot*1.5)*dropAmp+Math.sin(q*8.4+p+wave*.35)*3.4+Math.max(0,q-.42)*cascade*9;
	  }else if(pathFamily==='pink-serpentine'){
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*3.2+p)*50+Math.sin(q*Math.PI*.8)*32)*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(52+slot*8)*dropAmp+Math.sin(q*9.2+p+wave*.4)*6.5;
	  }else if(pathFamily==='pink-green-cascade'){
	   const cascade=slot%2?-1:1;
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*2.5+p)*42+Math.sin(q*Math.PI*(1.1+wave*.1))*25)*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(64+slot*10)*dropAmp+Math.sin(q*8.8+p)*4+Math.max(0,q-.45)*cascade*12;
	  }else if(pathFamily==='pink-green-low-sweep'){
	   const laneDrift=(slot-1.5)*6;
	   e.x=laneX+laneDrift+sweep*(Math.sin(q*Math.PI*1.6+p)*22+Math.sin(q*Math.PI*.75)*18)*fm.challengeSweep*arcAmp;
	   e.y=topY+118+q*(72+slot*8)*dropAmp+Math.sin(q*4.4+p)*3;
	  }else if(pathFamily==='pink-green-tall-drift'){
	   e.x=laneX+sweep*((slot-1.5)*10+Math.sin(q*Math.PI*1.8+p)*10)*arcAmp;
	   e.y=topY+82+q*(164+slot*14)*dropAmp+Math.sin(q*Math.PI*1.4+p)*5;
	  }else if(pathFamily==='pink-green-compact-exit'){
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*1.25+p)*18-q*48)*fm.challengeSweep*arcAmp;
	   e.y=topY+84+q*(84+slot*7)*dropAmp;
	  }else if(pathFamily==='green-ladder-split'){
	   const rung=slot%2?-1:1;
	   e.x=laneX+sweep*((q-.5)*44+rung*(18+q*13))*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(146+slot*14)*dropAmp+(wave%2?Math.sin(q*Math.PI)*7:0);
	  }else if(pathFamily==='green-ladder-deep-drop'){
	   const rung=slot%2?-1:1;
	   e.x=laneX+sweep*((q-.5)*30+rung*(14+q*10)+Math.sin(q*Math.PI*1.7+p)*8)*fm.challengeSweep*arcAmp;
	   e.y=topY+76+q*(178+slot*18)*dropAmp;
	  }else if(pathFamily==='green-ladder-center-fork'){
	   const fork=slot%2?-1:1;
	   e.x=PLAY_W/2+sweep*(Math.sin(q*Math.PI*1.35+p)*18+fork*q*(28+slot*6))*fm.challengeSweep*arcAmp;
	   e.y=topY+44+q*(144+slot*12)*dropAmp+Math.sin(q*Math.PI*2+p)*5;
	  }else if(pathFamily==='green-ladder-high-exit'){
	   const fork=slot%2?-1:1;
	   e.x=PLAY_W/2+sweep*(Math.sin(q*Math.PI*2.1+p)*18+fork*(16+q*48))*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(78+slot*8)*dropAmp+Math.sin(q*Math.PI*1.4+p)*6;
	  }else if(pathFamily==='yellow-diagonal-fan'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*(((q-.22)*202)+(slot-1.5)*32)*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(188+slot*27)*dropAmp;
	  }else if(pathFamily==='yellow-fan-low-drift'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*((q-.12)*116+(slot-1.5)*18)*fm.challengeSweep*arcAmp+Math.sin(q*Math.PI*1.6+p)*9;
	   e.y=topY+72+q*(176+slot*24)*dropAmp;
	  }else if(pathFamily==='yellow-fan-cross-cut'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*((q-.28)*236+(slot-1.5)*34)*fm.challengeSweep*arcAmp;
	   e.y=topY+30+q*(184+slot*24)*dropAmp+Math.sin(q*Math.PI*2.1+p)*7;
	  }else if(pathFamily==='yellow-fan-high-pop'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*((q-.45)*126+(slot-1.5)*18)*fm.challengeSweep*arcAmp+Math.sin(q*Math.PI*2.6+p)*12;
	   e.y=topY+q*(76+slot*9)*dropAmp-Math.sin(q*Math.PI)*28;
	  }else if(pathFamily==='blue-purple-finale'){
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*4+p)*42+Math.sin(q*Math.PI*1.5)*28)*fm.challengeSweep*arcAmp;
	   e.y=topY+q*(78+slot*12)*dropAmp+Math.cos(q*Math.PI*3+p)*10*arcAmp;
	  }else if(pathFamily==='boss-led-loop'){
	   const leader=e.t==='boss'?1:.72;
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*2.05+p*.35)*34+Math.sin(q*Math.PI)*18)*fm.challengeSweep*arcAmp*leader;
	   e.y=topY+q*9*dropAmp+Math.sin(q*Math.PI*2.6+p)*5*leader;
	  }else if(pathFamily==='cross-sweep'){
	   e.x=laneX-sweep*Math.sin(q*Math.PI)*54*fm.challengeSweep*arcAmp;
	   e.y=topY+q*7.5*dropAmp+Math.sin(q*6.8+p)*1.6;
	  }else{
	   e.x=laneX+sweep*Math.sin(q*Math.PI)*28*fm.challengeSweep;
	   e.y=topY+q*(classicStage3?5.8:6.5)*fm.challengeDrop+Math.sin(q*5.5+p)*(classicStage3?.82:.95);
	  }
	 }else{
	  const q=(u-9.7)/3.35;
	  if(pathFamily==='hook-arc'){
	   e.x=laneX+sweep*(36-q*78)*fm.challengeSweep*arcAmp+Math.sin(q*7.4+p)*2.4;
	   e.y=topY+10+q*205*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='first-challenge-peel'){
	   const glide=22+slot*5;
	   e.x=laneX-side*(glide+q*(56+slot*5));
	   e.y=topY+8+q*164*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='classic-column-drop'){
	   const columnX=challengeColumnX(side,slot,row);
	   e.x=columnX+side*(12+q*(54+slot*8))*arcAmp;
	   e.y=topY+160+q*188*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='side-hook-return'){
	   e.x=laneX-side*(46+q*(92+slot*9))*fm.challengeSweep*arcAmp+Math.sin(q*8+p)*4;
	   e.y=topY+70+q*216*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='crown-split-cascade'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=laneX+exit*(22+q*92)*fm.challengeSweep*arcAmp+Math.sin(q*11+p)*4.2;
	   e.y=topY+12+q*224*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='pink-serpentine'){
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*2.2+p)*26-q*92)*fm.challengeSweep*arcAmp;
	   e.y=topY+20+q*214*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='pink-green-cascade'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=laneX+exit*(26+q*104)*fm.challengeSweep*arcAmp+Math.sin(q*10.5+p+wave)*5;
	   e.y=topY+16+q*228*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='pink-green-low-sweep'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=laneX+exit*(18+q*72)*fm.challengeSweep*arcAmp+Math.sin(q*5.4+p)*3;
	   e.y=topY+126+q*156*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='pink-green-tall-drift'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=laneX+exit*(12+q*54)*fm.challengeSweep*arcAmp+Math.sin(q*4.8+p)*3;
	   e.y=topY+154+q*176*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='pink-green-compact-exit'){
	   e.x=laneX+sweep*(18-q*68)*fm.challengeSweep*arcAmp+Math.sin(q*5.8+p)*2.5;
	   e.y=topY+96+q*178*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='green-ladder-split'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=laneX+sweep*(28+q*72)*fm.challengeSweep*arcAmp+exit*(12+q*38)*arcAmp;
	   e.y=topY+24+q*258*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='green-ladder-deep-drop'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=laneX+exit*(22+q*64)*fm.challengeSweep*arcAmp+Math.sin(q*5.6+p)*3;
	   e.y=topY+156+q*188*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='green-ladder-center-fork'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=PLAY_W/2+exit*(20+q*(72+slot*10))*fm.challengeSweep*arcAmp;
	   e.y=topY+116+q*198*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='green-ladder-high-exit'){
	   const exit=sweep*(slot%2?-1:1);
	   e.x=PLAY_W/2+exit*(36+q*(106+slot*12))*fm.challengeSweep*arcAmp;
	   e.y=topY+36+q*176*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='yellow-diagonal-fan'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*(118+q*186+(slot-1.5)*20)*fm.challengeSweep*arcAmp;
	   e.y=topY+44+q*344*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='yellow-fan-low-drift'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*(68+q*142+(slot-1.5)*16)*fm.challengeSweep*arcAmp;
	   e.y=topY+152+q*214*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='yellow-fan-cross-cut'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*(96+q*224+(slot-1.5)*24)*fm.challengeSweep*arcAmp;
	   e.y=topY+86+q*264*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='yellow-fan-high-pop'){
	   const fanDir=wave%2?-1:1;
	   e.x=laneX+fanDir*(54+q*164+(slot-1.5)*18)*fm.challengeSweep*arcAmp;
	   e.y=topY+20+q*198*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='blue-purple-finale'){
	   e.x=laneX+sweep*(Math.sin(q*Math.PI*2.8+p)*34-q*76)*fm.challengeSweep*arcAmp;
	   e.y=topY+18+q*216*fm.challengeDrop*dropAmp+Math.cos(q*8+p)*4;
	  }else if(pathFamily==='boss-led-loop'){
	   e.x=laneX-sweep*(8+q*48*fm.challengeSweep)*arcAmp+Math.sin(q*10+p)*5;
	   e.y=topY+10+q*(e.t==='boss'?218:194)*fm.challengeDrop*dropAmp;
	  }else if(pathFamily==='cross-sweep'){
	   e.x=laneX+sweep*(20-q*70)*fm.challengeSweep*arcAmp+Math.sin(q*8.2+p)*3.2;
	   e.y=topY+7+q*202*fm.challengeDrop*dropAmp;
	  }else{
	   e.x=laneX-sweep*(4+q*34*fm.challengeSweep)+Math.sin(q*5.1+p)*1.2;
	   e.y=topY+8+q*(classicStage3?188:198)*fm.challengeDrop;
	  }
	 }
	 }
 const lowerFieldBias=Number.isFinite(+e.lowerFieldBias)?+e.lowerFieldBias:0;
 if(lowerFieldBias&&u>2.4){
  const lowerQ=cl((u-2.4)/8.8,0,1);
  e.y+=lowerFieldBias*lowerQ*lowerQ;
 }
 if(e.y<=enemyChallengeUpperBandY(e)){
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

function updateEnemy(state,e,dt,t,T,p){
 if(!isAuroraRuntimeState(state)){p=T;T=t;t=dt;dt=e;e=state;state=currentAuroraRuntimeState();}
 const S=state;
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
	  const entryFamily=e.pathFamily||'classic-center-arc-entry';
	  e.en+=dt*(stage1?1.02:1.35);
	  const k=Math.max(0,1-e.en*(stage1?0.35:0.42));
	  let sx=tx+Math.sin(e.en*(stage1?5.6:5)+e.ph)*(stage1?170:(S.stage>=6?136:150))*fm.entryX*k;
	  let sy=ty+Math.cos(e.en*(stage1?4.5:4)+e.ph)*(stage1?58:(S.stage>=6?42:48))*fm.entryY*k;
	  if(!stage1&&entryFamily==='scorpion-stagger-entry'){
	   sx=tx+Math.sin(e.en*6.2+e.ph+e.r*.7)*(128+e.r*9)*fm.entryX*k+(e.c%2?-10:10)*k;
	   sy=ty+Math.cos(e.en*3.5+e.ph)*(36+e.r*4)*fm.entryY*k+Math.sin(e.en*5+e.c)*5*k;
	  }else if(!stage1&&entryFamily==='scorpion-tandem-hook-entry'){
	   const side=e.c<5?-1:1;
	   sx=tx+side*(Math.sin(e.en*4.7+e.ph)*(112+e.r*11)+Math.sin(e.en*8.1+e.c)*18)*fm.entryX*k;
	   sy=ty+Math.cos(e.en*4.1+e.ph+e.r*.4)*(38+e.r*5)*fm.entryY*k+Math.sin(e.en*6.4+e.c)*8*k;
	  }else if(!stage1&&entryFamily==='stingray-wide-flank-entry'){
	   const mirror=e.entryMirror||1;
	   sx=tx+mirror*Math.sin(e.en*4.4+e.ph)*(164+e.r*8)*fm.entryX*k;
	   sy=ty+Math.cos(e.en*5.2+e.ph+e.c*.2)*(34+e.r*5)*fm.entryY*k;
	  }else if(!stage1&&entryFamily==='stingray-pincer-entry'){
	   const side=e.c<5?-1:1;
	   const fold=Math.sin(Math.min(1,e.en/2.05)*Math.PI);
	   const sweep=Math.cos(e.en*1.85+e.ph*.42);
	   sx=tx+side*(sweep*(184+e.r*18)*fm.entryX-fold*(92+e.r*8))*k+Math.sin(e.en*5.15+e.c)*8*k;
	   sy=ty+Math.sin(e.en*2.35+e.ph+e.c*.12)*(42+e.r*6)*fm.entryY*k+fold*(52+e.r*9)*k;
	  }else if(!stage1&&entryFamily==='galboss-low-hook-entry'){
	   const side=e.c<5?-1:1;
	   const hook=Math.sin(Math.min(1,e.en/2.05)*Math.PI);
	   const dip=Math.sin(Math.min(1,e.en/1.62)*Math.PI);
	   sx=tx+Math.sin(e.en*2.65+e.ph)*(62+e.r*5)*fm.entryX*k+side*hook*(22+e.r*3)*k;
	   sy=ty+Math.cos(e.en*3.35+e.ph)*(36+e.r*4)*fm.entryY*k+dip*(78+e.r*10)*k;
	  }else if(!stage1&&entryFamily==='late-boss-column-weave'){
	   sx=tx+Math.sin(e.en*6.8+e.c*.65)*(96+e.r*12)*fm.entryX*k;
	   sy=ty+Math.cos(e.en*3.2+e.ph)*(48+e.r*5)*fm.entryY*k+Math.sin(e.en*7.1+e.r)*7*k;
	  }else if(!stage1&&entryFamily==='late-boss-column-drop-weave'){
	   const side=e.c<5?-1:1;
	   const column=e.t==='boss'?1.6:(e.t==='but'?1.34:1.12);
	   const drop=Math.sin(Math.min(1,e.en/2.05)*Math.PI);
	   const funnel=Math.cos(e.en*2.05+e.r*.45);
	   const weave=Math.sin(e.en*5.85+e.c*.72);
	   sx=tx+side*funnel*(78+e.r*14)*fm.entryX*k+weave*(72+e.r*10)*fm.entryX*k;
	   sy=ty+Math.cos(e.en*2.75+e.ph)*(64+e.r*8)*fm.entryY*k+drop*(116+e.r*14)*column*k+Math.sin(e.en*8.15+e.c)*10*k;
	  }else if(!stage1&&entryFamily==='crown-split-weave-entry'){
	   const side=e.c<5?-1:1;
	   const crown=Math.sin(Math.min(1,e.en/2.35)*Math.PI);
	   sx=tx+side*(Math.sin(e.en*5.9+e.ph)*(166+e.r*14)+crown*(64+e.r*7))*fm.entryX*k+Math.sin(e.en*10.6+e.c)*16*k;
	   sy=ty+Math.cos(e.en*4.1+e.ph+e.r*.32)*(48+e.r*8)*fm.entryY*k+crown*(28+e.r*4)*k+crown*Math.sin(e.c*.9)*(18+e.r*3)*k;
	  }else if(!stage1&&entryFamily==='crown-looping-split-entry'){
	   const side=e.c<5?-1:1;
	   const crown=Math.sin(Math.min(1,e.en/2.15)*Math.PI);
	   const loop=Math.sin(e.en*7.4+e.ph+e.r*.42);
	   const split=Math.sin(e.en*3.15+e.c*.55);
	   sx=tx+side*(Math.sin(e.en*4.85+e.ph)*(142+e.r*18)+crown*(94+e.r*9))*fm.entryX*k+loop*(34+e.r*5)*k-side*split*(26+e.r*4)*k;
	   sy=ty+Math.cos(e.en*5.75+e.ph+e.r*.36)*(64+e.r*10)*fm.entryY*k+crown*(44+e.r*6)*k+Math.sin(e.en*10.9+e.c*.7)*(12+e.r*3)*k;
	  }
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
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap(S)&&randUnit()<dt*T.diveShotRate*.55){
   const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);
   fireEnemyBullet(S,e,aim,T.bulletVy+S.stage*T.bulletVyStage,'escort');
   e.shot--;
  }
  return;
 }
 if(e.dive===2){
  S.att++;
  e.x+=Math.sin(t*6.4+e.ph)*6*dt;
  e.beamT-=dt;
  if(enemyHasActiveBeam(e)&&canCapture(S)&&Math.abs(p.x-e.x)<8&&p.y>e.y+12&&p.y<e.y+VIS.beamLen)capturePlayer(S,e);
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
  if(e.chargeCuePending){
   e.chargeCueT=Math.max(0,(+e.chargeCueT||0)-dt);
   const chargeTiming=usesRuntimeGalagaReferenceAudio()&&typeof currentGamePackReferenceTiming==='function'
    ? currentGamePackReferenceTiming('enemyDiveCharge')
    : null;
   const minTravelY=chargeTiming?.minTravelY??0;
   if(e.chargeCueT<=0&&(e.y-(+e.chargeCueStartY||0))>=minTravelY){
    e.chargeCuePending=0;
    sfx.attackCharge();
   }
  }
  if(!e.low&&e.y>=PLAY_H*.62){
   e.low=1;
   logEvent('enemy_lower_field',Object.assign({stage:S.stage,y:+e.y.toFixed(2),stageClock:+S.stageClock.toFixed(3),playerLane:playLane(p.x)},enemyRef(e)));
  }
  if(!S.challenge&&e.shot>0&&S.eb.length<shotCap(S)&&e.y>108&&e.y<p.y-88&&randUnit()<dt*T.diveShotRate){
   const aim=cl((p.x-e.x)*T.aimMul,-T.aimClamp,T.aimClamp)+rnd(T.aimRnd,-T.aimRnd);
   fireEnemyBullet(S,e,aim,T.bulletVy+S.stage*T.bulletVyStage,'dive');
   e.shot--;
  }
  if(e.y>PLAY_H+30){
   e.x=tx;
   e.y=-26;
   e.vx=e.vy=0;
   e.dive=3;
   e.chargeCuePending=0;
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
 const stage4Lane2Priority=!S.challenge&&S.stage===4&&!S.stage4Lane2PriorityDive&&S.stageClock>=13.85&&S.stageClock<=14&&e.t==='but'&&e.c===5&&e.r===1;
 if(stage4Lane2Priority){
  S.stage4Lane2PriorityDive=1;
  startDive(S,e,p,{});
  return;
 }
 // Harness-only selection probes set this field to measure candidate Stage 4 scheduling strategies.
 const harnessDiveRateBoost=Math.max(1,+e.stage4Lane2ProbeDiveRateBoost||1);
 if(e.cool<=0&&randUnit()<dt*diveRate*harnessDiveRateBoost&&S.att<attackCap&&S.recoverT<=0&&(!stageAttackGap||S.attackGapT<=0)&&!(S.stage===2&&S.stageClock<3.85)&&!(S.stage===4&&S.stageClock<3.7)&&!(S.stage===5&&S.stageClock<1.9)){
  e.cool=cleanup?rnd(1.4,.6):rnd(T.coolA,T.coolB)-S.stage*.02;
  const chargeTiming=usesRuntimeGalagaReferenceAudio()&&typeof currentGamePackReferenceTiming==='function'
   ? currentGamePackReferenceTiming('enemyDiveCharge')
   : null;
  if(e.t==='boss'&&canCapture(S)&&!(S.stage===2&&S.stageClock<8.2)&&randUnit()<T.capChance){
   e.dive=4;
   e.targetX=cl(p.x+rnd(34,-34),26,PLAY_W-26);
   e.targetY=138;
   e.vx=0;
   e.vy=S.stage<=2?116:128;
   e.shot=0;
   e.esc=0;
   logEnemyAttackStart(S,e,'capture',{targetX:+e.targetX.toFixed(2),targetY:e.targetY,scripted:0});
  }else{
   const midRunFlank=S.stage>=8&&S.stage<12&&!S.challenge&&e.t==='but'&&(e.c<=1||e.c>=8);
   const steer=(S.stage===2?.42:S.stage===4?.31:S.stage>=5?.48:S.stage===1?.46:.56)*fm.steer;
   const jitter=(S.stage===2?22:S.stage===4?20:S.stage>=5?32:S.stage===1?24:38)*fm.jitter;
   const vyRnd=S.stage===4?14:S.stage>=5?20:S.stage===2?8:S.stage===1?6:12;
   e.dive=1;
   e.low=0;
   e.vx=(p.x-e.x)*steer+rnd(jitter,-jitter);
   e.vy=randomDiveVy(S.stage)*fm.diveVy+rnd(vyRnd,-vyRnd);
   if(midRunFlank){
    e.vx+=(e.c<5?1:-1)*(42+rnd(8,-8));
    e.vy*=.95;
   }
   e.shot=e.t==='boss'?2:1;
   e.chargeCuePending=usesRuntimeGalagaReferenceAudio()?1:0;
   e.chargeCueT=chargeTiming?.cueDelay??0;
   e.chargeCueStartY=e.y;
   logEnemyAttackStart(S,e,'dive',{targetX:+p.x.toFixed(2),scripted:0,pattern:midRunFlank?'mid-run-flank-dive':'standard-dive'});
   if(!e.chargeCuePending)sfx.attackCharge();
   if(e.t==='boss')assignEscorts(S,e);
  }
  if(stageAttackGap)S.attackGapT=(S.stage>=6?.82:S.stage===5?.88:S.stage===4?1.18:S.stage===2?1.08:1.18)+rnd(.12,.03);
 }
}

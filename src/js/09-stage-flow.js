// Aurora-specific stage setup, formation, and transition helpers.

function makeEnemy(t,r,c,tx,ty,profile=stageBandProfile(S.stage,S.challenge)){const boss=t==='boss';return{id:(randUnit()*1e9)|0,t,r,c,fam:enemyFamilyForType(profile,t),band:profile.name,hp:boss?2:1,max:boss?2:1,x:PLAY_W/2+rnd(180,-180),y:-80-r*16,tx,ty,form:0,dive:0,vx:0,vy:0,tm:rnd(6),ph:rnd(8),cool:rnd(2.3,.8),carry:0,beam:0,beamT:0,targetX:0,targetY:0,shot:0,spawn:r*.06+c*.02,en:0,lead:null,off:0,esc:0,squadId:0,ch:0,miss:0,low:0,hitT:0};}

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
 return auroraFormationLayout(stage);
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
 const layout=auroraChallengeLayout();
 S.e.length=0;
 const total=layout.groups*layout.enemiesPerGroup;
 const upperBandY=PLAY_H*layout.upperBandRatio;
 // Manual-backed structure: the first Galaga challenge stage is modeled as
 // 5 groups of 8 enemies. Motion fidelity is still being tuned in #9, but
 // the board structure and group bookkeeping are meant to stay stable.
 for(let i=0;i<total;i++){
  const lane=i%layout.enemiesPerGroup;
  const wave=(i/layout.enemiesPerGroup)|0;
  const t=layout.laneTypes[lane]||'bee';
  const side=lane<layout.enemiesPerGroup/2?-1:1,slot=lane%(layout.enemiesPerGroup/2),row=slot<2?0:1;
  S.e.push({id:(randUnit()*1e9)|0,t,fam:profile.challengeFamily,band:profile.name,r:0,c:lane,hp:1,max:1,x:side>0?PLAY_W+layout.spawnOffsetX:-layout.spawnOffsetX,y:34+wave*layout.waveSpacingY+row*layout.rowSpacingY,tx:0,ty:0,form:1,dive:9,vx:0,vy:0,tm:0,ph:rnd(8),cool:99,carry:0,beam:0,beamT:0,targetX:0,targetY:0,shot:0,spawn:wave*layout.waveDelay+slot*layout.slotDelay,en:0,lead:null,off:0,esc:0,ch:1,miss:0,wave,side,slot,row,group:wave,sweep:wave%2?-1:1,ub:0,upperBandY});
 }
 S.ch={hits:0,total,done:0,groups:Array.from({length:layout.groups},()=>0),bonus:0,perfect:0,upperBandY,upperBandTime:0,upperBandSamples:0};
}

function spawnStage(){
 S.pb.length=0;S.eb.length=0;S.cap=null;S.att=0;S.challenge=!!S.forceChallenge||isChallengeStage(S.stage);S.forceChallenge=0;S.profile=stageBandProfile(S.stage,S.challenge);S.t=stageTune(S.stage,S.challenge);S.fireCD=S.challenge?99:rnd(S.t.globalA,S.t.globalB);
 S.stagePresentation=auroraStagePresentation(S.stage,S.challenge);
 S.stageClock=0;S.captureCountStage=0;S.lastCaptureStartT=null;S.lastFighterCapturedT=null;S.sequenceT=0;S.sequenceMode='';S.recoverT=S.challenge?0:(S.stage>=6?1.18:S.stage===4?1.34:S.stage>=5?1.2:0);S.attackGapT=S.challenge?0:(S.stage>=6?1.02:S.stage===4?1.42:S.stage>=5?1.24:0);
 S.scriptMode=(!S.challenge&&S.stage===1)?1:0;S.scriptT=0;S.scriptI=0;S.scriptShotI=0;S.scriptShotT=3.2;
 logEvent('stage_spawn',{stage:S.stage,challenge:!!S.challenge,persona:S.harnessPersona||null});
 logEvent('stage_profile',{stage:S.stage,challenge:!!S.challenge,band:S.profile.name,challengeFamily:S.profile.challengeFamily,beeFamily:S.profile.beeFamily,butFamily:S.profile.butFamily,bossFamily:S.profile.bossFamily,themeId:S.stagePresentation?.id||'classic',backgroundMode:S.stagePresentation?.backgroundMode||'starfield',frameAccent:S.stagePresentation?.frameAccent||'classic-blue',bossArchetype:S.stagePresentation?.bossArchetype||'command-core'});
 if(S.challenge){spawnChallenge();S.bannerTxt=S.stagePresentation.challengeTitle;S.bannerSub=S.stagePresentation.stageLabel;S.bannerMode='challenge';S.banner=2.6}
 else{spawnFormation();S.bannerTxt=S.stagePresentation.stageLabel;S.bannerSub='';S.bannerMode='stage';S.banner=1.6}
 logSnapshot('stage_spawn');
}

function queueStageTransition(mode='normal'){
 const targetStage=S.pendingStage||S.stage;
 const nextIsChallenge=!!S.forceChallenge||isChallengeStage(targetStage);
 const nextStagePresentation=auroraStagePresentation(targetStage,nextIsChallenge);
 S.pb.length=0;S.eb.length=0;S.cap=null;S.att=0;
 S.nextStageT=mode==='challengeResult'?(nextIsChallenge?1.8:1.25):(nextIsChallenge?2.8:2.2);
 S.bannerTxt=nextStagePresentation.transitionTitle;
 S.bannerSub=nextStagePresentation.transitionSub;
 S.bannerMode='stageTransition';
 S.banner=S.nextStageT;
 logEvent('challenge_transition_started',{
  stage:S.stage,
  pendingStage:S.pendingStage||null,
  targetStage,
  mode,
  nextIsChallenge:!!nextIsChallenge,
  nextStageT:+S.nextStageT.toFixed(3),
  postChallengeT:+S.postChallengeT.toFixed(3),
  challenge:!!S.challenge,
  enemies:S.e.filter(e=>e.hp>0).length
 });
 sfx.transition(nextIsChallenge?1:0);
}

function startSequence(mode,duration,title,subtitle=''){
 S.sequenceMode=mode;
 S.sequenceT=Math.max(S.sequenceT,duration);
 S.bannerTxt=title;
 S.bannerSub=subtitle;
 S.bannerMode=mode;
 S.banner=Math.max(S.banner,duration);
}

// Aurora-specific stage setup, formation, and transition helpers.

function familyMotion(e){
 switch(e?.fam){
  case 'scorpion': return { pulseX:.95,pulseY:.8,entryX:.92,entryY:.9,weave:1.18,steer:.96,jitter:1.1,diveVy:.98,diveAccel:1,challengeSweep:1,challengeDrop:1 };
  case 'stingray': return { pulseX:1.08,pulseY:.78,entryX:1.06,entryY:.82,weave:1.28,steer:1.06,jitter:1.16,diveVy:1.04,diveAccel:1.03,challengeSweep:1.2,challengeDrop:1.05 };
  case 'galboss': return { pulseX:.9,pulseY:.72,entryX:.88,entryY:.76,weave:.9,steer:.9,jitter:.92,diveVy:1.02,diveAccel:.98,challengeSweep:.86,challengeDrop:.95 };
  case 'crown': return { pulseX:1.22,pulseY:.76,entryX:1.3,entryY:.94,weave:1.42,steer:1.1,jitter:1.28,diveVy:1.1,diveAccel:1.08,challengeSweep:1.46,challengeDrop:1.12 };
  case 'dragonfly': return { pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1.1,steer:1,jitter:1,diveVy:1,diveAccel:1,challengeSweep:1.14,challengeDrop:1 };
  case 'mosquito': return { pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1.22,steer:1,jitter:1,diveVy:1,diveAccel:1,challengeSweep:1.32,challengeDrop:1.08 };
  default: return { pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1,steer:1,jitter:1,diveVy:1,diveAccel:1,challengeSweep:1,challengeDrop:1 };
 }
}

function formationLayout(stage){
	 return currentGamePackFormationLayout(stage);
}

function regularEntryPathFamily(stage){
 if(stage>=16)return 'crown-looping-split-entry';
 if(stage>=14)return 'late-boss-column-drop-weave';
 if(stage>=12)return 'galboss-low-hook-entry';
 if(stage>=10)return 'stingray-pincer-entry';
 if(stage>=8)return 'stingray-wide-flank-entry';
 if(stage>=6)return 'scorpion-tandem-hook-entry';
 if(stage>=4)return 'scorpion-stagger-entry';
 return 'classic-center-arc-entry';
}

function spawnFormation(){
 const profile=stageBandProfile(S.stage,0);
 const cols=10,rows=4,{gx,gy,oy}=formationLayout(S.stage),ox=PLAY_W/2-(cols-1)*gx/2;
 const entry=[4,5,3,6,2,7,1,8,0,9];
 const usesReference=usesReferenceTimingModel()&&!S.attract;
 const openingTiming=usesReference&&S.stage===1?currentGamePackReferenceTiming('stage1Opening'):null;
 const transitionTiming=usesReference&&S.stage>1&&S.transitionMode==='challengeResult'
  ? currentGamePackReferenceTiming('postChallengeStageEntry')
  : null;
 const baseEntryDelay=transitionTiming?.firstEnemyArrivalDelay||0;
 S.e.length=0;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  let t='bee';
  if(r===0)t=(c>=3&&c<=6)?'boss':'but';
  else if(r===1)t='but';
	  const e=makePackEnemyState({
	   gamePack:currentGamePack(),
	   type:t,
   row:r,
   column:c,
   tx:ox+c*gx,
	   ty:oy+r*gy,
	   profile
	  });
	  e.pathFamily=regularEntryPathFamily(S.stage);
	  e.entryMirror=(S.stage>=8&&c>=cols/2)?-1:1;
	  const entryOrder=entry.indexOf(c);
	  const stage1Spawn=entryOrder*.62+r*1.45+(r>1 ? 1.45 : 0)+(t==='boss' ? .18 : 0);
	  const earlySpawn=r*.08+c*.03;
	  const laterSpawn=entryOrder*.18+r*.58+(r>1 ? .42 : 0)+(t==='boss' ? .08 : 0);
	  e.spawn=(S.stage===1?stage1Spawn:(S.stage>=4?laterSpawn:earlySpawn))+baseEntryDelay;
  if(S.stage>=8&&S.stage<12&&!S.challenge){
   if(t==='but'&&(c<=1||c>=8))e.cool=.16+(c<=1?c:9-c)*.12;
   else if(t==='but')e.cool+=.55;
   else if(t==='boss')e.cool+=2.2;
   else if(t==='bee'&&r>=2)e.cool+=1.35;
  }
  if(S.stage>=14&&!S.challenge){
   if(t==='boss')e.cool=.72+(c-3)*.16;
   else if(t==='but'&&r<=1)e.cool+=.55;
  }
  S.e.push(e);
 }
 for(let i=0;i<S.rogue;i++){
  const c=2+i%6;
  const e=makePackEnemyState({
   gamePack:currentGamePack(),
   type:'rogue',
   row:1,
   column:c,
   tx:ox+c*gx,
   ty:oy+gy,
   profile,
   hp:1,
   max:1
  });
  S.e.push(e);
 }
 S.rogue=0;
}

function spawnChallenge(){
 const profile=stageBandProfile(S.stage,1);
 const layout=currentGamePackChallengeLayout(S.stage);
 const challengeTiming=usesReferenceTimingModel()&&!S.attract
  ? currentGamePackReferenceTiming('challengeEntry')
  : null;
 const baseEntryDelay=challengeTiming?.firstEnemyArrivalDelay||0;
 S.e.length=0;
 const total=layout.groups*layout.enemiesPerGroup;
 const upperBandY=PLAY_H*layout.upperBandRatio;
 // Manual-backed structure: the first Galaga challenge stage is modeled as
 // 5 groups of 8 enemies. Motion fidelity is still being tuned in #9, but
 // the board structure and group bookkeeping are meant to stay stable.
 for(let i=0;i<total;i++){
  const lane=i%layout.enemiesPerGroup;
  const wave=(i/layout.enemiesPerGroup)|0;
  const waveLaneTypes=Array.isArray(layout.groupLaneTypes)&&layout.groupLaneTypes[wave]
   ? layout.groupLaneTypes[wave]
   : layout.laneTypes;
  const wavePathFamilies=Array.isArray(layout.groupPathFamilies)?layout.groupPathFamilies:null;
  const waveVisualFamilies=Array.isArray(layout.groupVisualFamilies)?layout.groupVisualFamilies:null;
  const waveSpawnOffsets=Array.isArray(layout.groupSpawnOffsets)?layout.groupSpawnOffsets:null;
  const waveArcAmps=Array.isArray(layout.groupArcAmps)?layout.groupArcAmps:null;
  const waveDropAmps=Array.isArray(layout.groupDropAmps)?layout.groupDropAmps:null;
  const waveSpeedScales=Array.isArray(layout.groupSpeedScales)?layout.groupSpeedScales:null;
  const waveLowerFieldBiases=Array.isArray(layout.groupLowerFieldBiases)?layout.groupLowerFieldBiases:null;
  const waveYOffsets=Array.isArray(layout.groupYOffsets)?layout.groupYOffsets:null;
  const waveReferencePaths=Array.isArray(layout.groupReferencePaths)?layout.groupReferencePaths:null;
  const t=waveLaneTypes[lane]||layout.laneTypes[lane]||'bee';
  const side=lane<layout.enemiesPerGroup/2?-1:1,slot=lane%(layout.enemiesPerGroup/2),row=slot<2?0:1;
  const pathFamily=wavePathFamilies?.[wave]||layout.pathFamily||'classic-lane-wave';
  const challengeFamily=waveVisualFamilies?.[wave]||layout.visualFamily||profile.challengeFamily;
  const waveProfile=challengeFamily===profile.challengeFamily?profile:Object.assign({},profile,{challengeFamily});
  S.e.push(makePackChallengeEnemyState({
   gamePack:currentGamePack(),
   type:t,
   lane,
   profile:waveProfile,
   x:side>0?PLAY_W+layout.spawnOffsetX:-layout.spawnOffsetX,
   y:34+wave*layout.waveSpacingY+row*layout.rowSpacingY,
   wave,
   side,
   slot,
   row,
   group:wave,
   sweep:wave%2?-1:1,
   upperBandY,
   pathFamily,
   arcAmp:waveArcAmps?.[wave]||layout.arcAmp||1,
   dropAmp:waveDropAmps?.[wave]||layout.dropAmp||1,
   speedScale:waveSpeedScales?.[wave]||layout.speedScale||1,
   lowerFieldBias:waveLowerFieldBiases?.[wave]??layout.lowerFieldBias??0,
   yOffset:waveYOffsets?.[wave]??layout.yOffset??0,
   referencePath:waveReferencePaths?.[wave]||null,
   spawn:baseEntryDelay+(waveSpawnOffsets?.[wave]??wave*layout.waveDelay)+slot*layout.slotDelay
  }));
 }
 S.ch={hits:0,total,done:0,groups:Array.from({length:layout.groups},()=>0),bonus:0,perfect:0,upperBandY,upperBandTime:0,upperBandSamples:0};
}

function spawnStage(){
 const transitionMode=S.transitionMode||'';
 S.pb.length=0;S.eb.length=0;S.cap=null;S.att=0;S.challenge=!!S.forceChallenge||isChallengeStage(S.stage);S.forceChallenge=0;S.profile=stageBandProfile(S.stage,S.challenge);S.t=stageTune(S.stage,S.challenge);S.fireCD=S.challenge?99:rnd(S.t.globalA,S.t.globalB);
 S.stagePresentation=currentGamePackStagePresentation(S.stage,S.challenge);
 const usesReference=usesReferenceTimingModel()&&!S.attract;
 const stageEntryTiming=usesReference&&!S.challenge&&S.stage>1&&transitionMode==='challengeResult'
  ? currentGamePackReferenceTiming('postChallengeStageEntry')
  : null;
 S.stageClock=0;S.captureCountStage=0;S.lastCaptureStartT=null;S.lastFighterCapturedT=null;S.stage4Lane2PriorityDive=0;S.sequenceT=0;S.sequenceMode='';S.seq=0;S.seqT=usesReference?(S.challenge?1.85:(stageEntryTiming?.firstPulseDelay||3.05)):.45;S.recoverT=S.challenge?0:(S.stage>=6?1.18:S.stage===4?1.34:S.stage>=5?1.2:0);S.attackGapT=S.challenge?0:(S.stage>=6?1.02:S.stage===4?1.42:S.stage>=5?1.24:0);
 if(stageEntryTiming)S.audioPulseHoldT=Math.max(+S.audioPulseHoldT||0,(stageEntryTiming.firstPulseDelay||0)+.15);
 S.transitionMode='';
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
 const nextStagePresentation=currentGamePackStagePresentation(targetStage,nextIsChallenge);
 const challengeEntryTiming=usesReferenceTimingModel()
  ? currentGamePackReferenceTiming('challengeEntry')
  : null;
 const challengeResultsTiming=usesReferenceTimingModel()
  ? currentGamePackReferenceTiming('challengeResults')
  : null;
 S.pb.length=0;S.eb.length=0;S.cap=null;S.att=0;
 S.transitionMode=mode;
 S.nextStageT=mode==='challengeResult'
  ? (nextIsChallenge?(challengeResultsTiming?.nextChallengeWindow||3.05):(challengeResultsTiming?.nextStageWindow||2.5))
  : (nextIsChallenge?(challengeEntryTiming?.transitionWindow||3.75):3.2);
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
 if(usesReferenceTimingModel()){
  clearReferenceTransitionCueWindow();
  S.transitionCueKind=nextIsChallenge?1:0;
  S.transitionCueT=mode==='challengeResult'
   ? (nextIsChallenge
      ? Math.max(.55,S.nextStageT-(challengeResultsTiming?.nextChallengeCueLeadBeforeSpawn||1.42))
      : Math.max(.45,S.nextStageT-(challengeResultsTiming?.nextCueLeadBeforeSpawn||1.1)))
   : (nextIsChallenge
      ? Math.max(.7,S.nextStageT-(challengeEntryTiming?.cueLeadBeforeSpawn||1.52))
      : Math.max(.55,S.nextStageT-1.18));
  holdReferenceGameplayCadence(S.nextStageT+(nextIsChallenge?(challengeEntryTiming?.cadenceHoldAfterSpawn||1.1):(challengeResultsTiming?.cadenceHoldAfterSpawn||.9)));
}else sfx.transition(nextIsChallenge?1:0);
}

function startSequence(mode,duration,title,subtitle=''){
 S.sequenceMode=mode;
 S.sequenceT=Math.max(S.sequenceT,duration);
 S.bannerTxt=title;
 S.bannerSub=subtitle;
 S.bannerMode=mode;
 S.banner=Math.max(S.banner,duration);
}

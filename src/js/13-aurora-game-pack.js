// Aurora game-pack metadata, capability flags, stage themes, and scoring rules.

const AURORA_STAGE_BAND_PROFILES=Object.freeze([
 {name:'classic',beeFamily:'classic',butFamily:'classic',bossFamily:'classic',challengeFamily:'classic',pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1,steer:1,jitter:1,diveVy:1,diveAccel:1},
 {name:'scorpion',beeFamily:'scorpion',butFamily:'scorpion',bossFamily:'classic',challengeFamily:'classic',pulseX:.95,pulseY:.8,entryX:.92,entryY:.9,weave:1.18,steer:.96,jitter:1.1,diveVy:.98,diveAccel:1},
 {name:'stingray',beeFamily:'stingray',butFamily:'stingray',bossFamily:'stingray',challengeFamily:'dragonfly',pulseX:1.08,pulseY:.78,entryX:1.06,entryY:.82,weave:1.28,steer:1.06,jitter:1.16,diveVy:1.04,diveAccel:1.03},
 {name:'galboss',beeFamily:'galboss',butFamily:'galboss',bossFamily:'galboss',challengeFamily:'mosquito',pulseX:.9,pulseY:.72,entryX:.88,entryY:.76,weave:.9,steer:.9,jitter:.92,diveVy:1.02,diveAccel:.98}
]);

const AURORA_STAGE_THEME_PROGRESSION=Object.freeze([
 {fromStage:1,id:'quiet-skies',frameAccent:'classic-blue',backgroundMode:'starfield',challengeBrand:'classic',bossArchetype:'command-core'},
 {fromStage:4,id:'scorpion-dawn',frameAccent:'amber-blue',backgroundMode:'aurora-hint',challengeBrand:'scorpion',bossArchetype:'super-boss-scorpion'},
 {fromStage:8,id:'stingray-surge',frameAccent:'teal-gold',backgroundMode:'aurora-borealis',challengeBrand:'stingray',bossArchetype:'partner-wing-stingray'},
 {fromStage:12,id:'galboss-veil',frameAccent:'violet-gold',backgroundMode:'aurora-borealis',challengeBrand:'galboss',bossArchetype:'council-boss'},
 {fromStage:16,id:'crown-aurora',frameAccent:'aurora-crown',backgroundMode:'aurora-borealis',challengeBrand:'crown',bossArchetype:'super-partner-pair'}
]);

const AURORA_FORMATION_LAYOUTS=Object.freeze([
 {fromStage:1,gx:VIS.gx,gy:VIS.gy,oy:VIS.formTop},
 {fromStage:4,gx:16.4,gy:13.4,oy:28},
 {fromStage:6,gx:15.8,gy:12.9,oy:27},
 {fromStage:8,gx:15.2,gy:12.4,oy:27}
]);

const AURORA_FRAME_ACCENTS=Object.freeze({
 'classic-blue':Object.freeze({
  frameLine:'rgba(171,214,255,.28)',
  frameGlow:'rgba(255,220,122,.08)',
  shellLine:'rgba(83,140,255,.32)',
  shellGlow:'rgba(255,222,134,.08)',
  marqueeBorder:'#f05e1d',
  marqueeGlow:'#38d6a0'
 }),
 'amber-blue':Object.freeze({
  frameLine:'rgba(255,203,123,.3)',
  frameGlow:'rgba(255,142,82,.12)',
  shellLine:'rgba(255,187,96,.34)',
  shellGlow:'rgba(255,224,154,.12)',
  marqueeBorder:'#ff7f2f',
  marqueeGlow:'#ffd15f'
 }),
 'teal-gold':Object.freeze({
  frameLine:'rgba(132,245,232,.32)',
  frameGlow:'rgba(255,228,117,.12)',
  shellLine:'rgba(94,232,214,.34)',
  shellGlow:'rgba(167,255,239,.12)',
  marqueeBorder:'#20d3b6',
  marqueeGlow:'#ffd15f'
 }),
 'violet-gold':Object.freeze({
  frameLine:'rgba(205,168,255,.32)',
  frameGlow:'rgba(255,210,129,.12)',
  shellLine:'rgba(176,120,255,.34)',
  shellGlow:'rgba(255,220,168,.12)',
  marqueeBorder:'#b86cff',
  marqueeGlow:'#ffd973'
 }),
 'aurora-crown':Object.freeze({
  frameLine:'rgba(143,255,220,.36)',
  frameGlow:'rgba(188,143,255,.16)',
  shellLine:'rgba(121,246,198,.36)',
  shellGlow:'rgba(255,227,138,.16)',
  marqueeBorder:'#48f0c3',
  marqueeGlow:'#c98cff'
 })
});

const AURORA_SCORING_RULES=Object.freeze({
 challengeEnemy:100,
 perfectChallengeClear:10000,
 rescueJoin:1000,
 carriedFighter:{standby:500,attacking:1000},
 enemyKills:Object.freeze({
  bee:Object.freeze({formation:50,dive:100}),
  but:Object.freeze({formation:80,dive:160}),
  rogue:Object.freeze({formation:500,dive:1000}),
  boss:Object.freeze({formation:150,dive:Object.freeze({solo:400,oneEscort:800,twoEscort:1600})})
 }),
 challengeGroupBonuses:Object.freeze([
  {fromStage:1,bonus:1000},
  {fromStage:8,bonus:2000},
  {fromStage:12,bonus:3000}
 ])
});

const AURORA_GAME_PACK=Object.freeze({
 metadata:Object.freeze({
  gameKey:'aurora-galactica',
  title:'Aurora Galactica',
  versionLine:'1.x'
 }),
 capabilities:Object.freeze({
  usesFormationRack:1,
  usesIndependentDiveAttacks:1,
  usesEscortPatterns:1,
  usesChallengeStages:1,
  usesCaptureRescue:1,
  usesDualFighterMode:1,
  usesStaticShields:0,
  usesStageThemeProgression:1,
  usesBossArchetypeVariants:1
 }),
 stageBandProfiles:AURORA_STAGE_BAND_PROFILES,
 formationLayouts:AURORA_FORMATION_LAYOUTS,
 stageThemeProgression:AURORA_STAGE_THEME_PROGRESSION,
 frameAccents:AURORA_FRAME_ACCENTS,
 scoring:AURORA_SCORING_RULES
});

function auroraGamePack(){
 return AURORA_GAME_PACK;
}

function stageBandIndex(stage){
 if(stage<4)return 0;
 return 1+(Math.floor((stage-4)/4)%3);
}

function stageBandProfile(stage,challenge){
 const pack=auroraGamePack();
 const base=pack.stageBandProfiles[stageBandIndex(stage)]||pack.stageBandProfiles[0];
 if(!challenge)return base;
 if(stage>=19)return Object.assign({},base,{challengeFamily:'mosquito'});
 if(stage>=11)return Object.assign({},base,{challengeFamily:'dragonfly'});
 return Object.assign({},base,{challengeFamily:'classic'});
}

function auroraStagePresentation(stage,challenge){
 const pack=auroraGamePack();
 let theme=pack.stageThemeProgression[0];
 for(const candidate of pack.stageThemeProgression){
  if(stage>=candidate.fromStage)theme=candidate;
  else break;
 }
 return Object.assign({},theme,{
  challengeTitle:challenge?'CHALLENGING STAGE':`STAGE ${stage}`,
  stageLabel:`STAGE ${stage}`
 });
}

function auroraFormationLayout(stage){
 const layouts=auroraGamePack().formationLayouts;
 let layout=layouts[0];
 for(const candidate of layouts){
  if(stage>=candidate.fromStage)layout=candidate;
  else break;
 }
 return layout;
}

function auroraFrameAccentTheme(stagePresentation){
 const frameAccent=stagePresentation?.frameAccent||'classic-blue';
 return auroraGamePack().frameAccents[frameAccent]||auroraGamePack().frameAccents['classic-blue'];
}

function auroraEnemyKillPoints(enemy,dive){
 const table=auroraGamePack().scoring.enemyKills;
 if(enemy?.t==='bee')return dive?table.bee.dive:table.bee.formation;
 if(enemy?.t==='but')return dive?table.but.dive:table.but.formation;
 if(enemy?.t==='rogue')return dive?table.rogue.dive:table.rogue.formation;
 if(enemy?.t==='boss'){
  if(!dive)return table.boss.formation;
  const escorts=activeEscortCount(enemy);
  return escorts>=2?table.boss.dive.twoEscort:escorts===1?table.boss.dive.oneEscort:table.boss.dive.solo;
 }
 return 0;
}

function challengeGroupBonus(stage){
 const tiers=auroraGamePack().scoring.challengeGroupBonuses;
 let bonus=tiers[0]?.bonus||1000;
 for(const tier of tiers){
  if(stage>=tier.fromStage)bonus=tier.bonus;
  else break;
 }
 return bonus;
}

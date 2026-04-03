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

const AURORA_STAGE_CADENCE=Object.freeze({
 challengeFirstStage:3,
 challengeEvery:4
});

const AURORA_CHALLENGE_LAYOUT=Object.freeze({
 groups:5,
 enemiesPerGroup:8,
 upperBandRatio:.5,
 spawnOffsetX:44,
 waveSpacingY:13,
 rowSpacingY:8,
 waveDelay:1.52,
 slotDelay:.18,
 laneTypes:Object.freeze(['boss','boss','but','bee','but','bee','but','bee'])
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
 frontDoor:Object.freeze({
  marqueeTitle:'Aurora Galactica',
  title:'AURORA GALACTICA',
  subtitle:'WAIT MODE',
  startPrompt:'PRESS <span class="k">ENTER</span> TO START',
  attractLine:'AUTO DEMO IN PROGRESS   HIGH SCORES NEXT',
  utilityLine:'<span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS',
  pickerHint:'',
  quoteSurface:'wait-mode'
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
 stageCadence:AURORA_STAGE_CADENCE,
 stageBandProfiles:AURORA_STAGE_BAND_PROFILES,
 formationLayouts:AURORA_FORMATION_LAYOUTS,
 challengeLayout:AURORA_CHALLENGE_LAYOUT,
 stageThemeProgression:AURORA_STAGE_THEME_PROGRESSION,
 frameAccents:AURORA_FRAME_ACCENTS,
 scoring:AURORA_SCORING_RULES
});

const GAME_PACK_REGISTRY=Object.freeze({
 [AURORA_GAME_PACK.metadata.gameKey]:AURORA_GAME_PACK
});

const DEFAULT_GAME_PACK_KEY=AURORA_GAME_PACK.metadata.gameKey;
let ACTIVE_GAME_PACK_KEY=DEFAULT_GAME_PACK_KEY;
let ACTIVE_GAME_PACK=AURORA_GAME_PACK;

function availableGamePacks(){
 return GAME_PACK_REGISTRY;
}

function getGamePack(key=DEFAULT_GAME_PACK_KEY){
 return GAME_PACK_REGISTRY[key]||GAME_PACK_REGISTRY[DEFAULT_GAME_PACK_KEY];
}

function currentGamePackKey(){
 return ACTIVE_GAME_PACK_KEY;
}

function currentGamePack(){
 return ACTIVE_GAME_PACK;
}

function installGamePack(key=DEFAULT_GAME_PACK_KEY,opts={}){
 const nextPack=getGamePack(key);
 ACTIVE_GAME_PACK_KEY=nextPack.metadata?.gameKey||DEFAULT_GAME_PACK_KEY;
 ACTIVE_GAME_PACK=nextPack;
 PRODUCT_NAME=nextPack.metadata?.title||PRODUCT_NAME;
 syncInstalledPackShellChrome();
 if(opts.persist)writePref(GAME_PACK_PREF_KEY,ACTIVE_GAME_PACK_KEY);
 return ACTIVE_GAME_PACK;
}

function auroraGamePack(){
 return currentGamePack();
}

function currentGamePackIsChallengeStage(stage){
 const cadence=currentGamePack().stageCadence;
 return stage===cadence.challengeFirstStage||((stage-cadence.challengeFirstStage)%cadence.challengeEvery===0&&stage>cadence.challengeFirstStage);
}

function stageBandIndex(stage){
 if(stage<4)return 0;
 return 1+(Math.floor((stage-4)/4)%3);
}

function stageBandProfile(stage,challenge){
 const pack=currentGamePack();
 const base=pack.stageBandProfiles[stageBandIndex(stage)]||pack.stageBandProfiles[0];
 if(!challenge)return base;
 if(stage>=19)return Object.assign({},base,{challengeFamily:'mosquito'});
 if(stage>=11)return Object.assign({},base,{challengeFamily:'dragonfly'});
 return Object.assign({},base,{challengeFamily:'classic'});
}

function currentGamePackStagePresentation(stage,challenge){
 const pack=currentGamePack();
 let theme=pack.stageThemeProgression[0];
 for(const candidate of pack.stageThemeProgression){
  if(stage>=candidate.fromStage)theme=candidate;
  else break;
 }
 return Object.assign({},theme,{
  challengeTitle:challenge?'CHALLENGING STAGE':`STAGE ${stage}`,
  stageLabel:`STAGE ${stage}`,
  transitionTitle:challenge?'CHALLENGING STAGE':`STAGE ${stage}`,
  transitionSub:challenge?`STAGE ${stage}`:'NEXT PHASE'
 });
}

function currentGamePackFormationLayout(stage){
 const layouts=currentGamePack().formationLayouts;
 let layout=layouts[0];
 for(const candidate of layouts){
  if(stage>=candidate.fromStage)layout=candidate;
  else break;
 }
 return layout;
}

function currentGamePackChallengeLayout(){
 return currentGamePack().challengeLayout;
}

function currentGamePackFrameAccentTheme(stagePresentation){
 const frameAccent=stagePresentation?.frameAccent||'classic-blue';
 return currentGamePack().frameAccents[frameAccent]||currentGamePack().frameAccents['classic-blue'];
}

function currentGamePackEnemyKillPoints(enemy,dive){
 const table=currentGamePack().scoring.enemyKills;
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

function currentGamePackChallengeGroupBonus(stage){
 const tiers=currentGamePack().scoring.challengeGroupBonuses;
 let bonus=tiers[0]?.bonus||1000;
 for(const tier of tiers){
  if(stage>=tier.fromStage)bonus=tier.bonus;
  else break;
 }
 return bonus;
}

function currentGamePackFrontDoor(){
 const pack=currentGamePack();
 const frontDoor=pack.frontDoor||{};
 return Object.freeze({
  marqueeTitle:frontDoor.marqueeTitle||pack.metadata?.title||PRODUCT_NAME||'Arcade Platform',
  title:frontDoor.title||String(pack.metadata?.title||PRODUCT_NAME||'Arcade Platform').toUpperCase(),
  subtitle:frontDoor.subtitle||'WAIT MODE',
  startPrompt:frontDoor.startPrompt||'PRESS <span class="k">ENTER</span> TO START',
  attractLine:frontDoor.attractLine||'AUTO DEMO IN PROGRESS   HIGH SCORES NEXT',
  utilityLine:frontDoor.utilityLine||'<span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS',
  pickerHint:frontDoor.pickerHint||'',
  quoteSurface:frontDoor.quoteSurface||'wait-mode'
 });
}

function syncInstalledPackShellChrome(){
 try{document.title=currentGamePack().metadata?.title||PRODUCT_NAME||document.title}catch{}
 const marquee=document.getElementById('cabinetMarqueeTitle');
 const frontDoor=currentGamePackFrontDoor();
 if(marquee)marquee.textContent=frontDoor.marqueeTitle;
}

function auroraIsChallengeStage(stage){
 return currentGamePackIsChallengeStage(stage);
}

function auroraStagePresentation(stage,challenge){
 return currentGamePackStagePresentation(stage,challenge);
}

function auroraFormationLayout(stage){
 return currentGamePackFormationLayout(stage);
}

function auroraChallengeLayout(){
 return currentGamePackChallengeLayout();
}

function auroraFrameAccentTheme(stagePresentation){
 return currentGamePackFrameAccentTheme(stagePresentation);
}

function auroraEnemyKillPoints(enemy,dive){
 return currentGamePackEnemyKillPoints(enemy,dive);
}

function challengeGroupBonus(stage){
 return currentGamePackChallengeGroupBonus(stage);
}

installGamePack(readPref(GAME_PACK_PREF_KEY)||DEFAULT_GAME_PACK_KEY);
window.availableGamePacks=availableGamePacks;
window.getGamePack=getGamePack;
window.currentGamePack=currentGamePack;
window.currentGamePackKey=currentGamePackKey;
window.currentGamePackFrontDoor=currentGamePackFrontDoor;
window.installGamePack=installGamePack;

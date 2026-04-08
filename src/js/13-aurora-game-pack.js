// Platinum pack registry with Aurora-owned metadata, capability flags, themes, and scoring rules.

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
 {fromStage:1,gx:17,gy:14,oy:28},
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
 }),
 'signal-crimson':Object.freeze({
  frameLine:'rgba(255,120,120,.34)',
  frameGlow:'rgba(255,214,115,.12)',
  shellLine:'rgba(255,112,94,.34)',
  shellGlow:'rgba(255,232,150,.12)',
  marqueeBorder:'#ff5b5b',
  marqueeGlow:'#ffd86d'
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
 laneTypes:Object.freeze(['boss','boss','but','bee','but','but','bee','but'])
});

const AURORA_SCORING_RULES=Object.freeze({
 challengeEnemy:100,
 perfectChallengeClear:10000,
 rescueJoin:1000,
 extends:Object.freeze({first:20000,recurring:70000}),
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
  versionLine:'1.x',
  playable:1
 }),
 frontDoor:Object.freeze({
  marqueeTitle:'Aurora Galactica',
  title:'AURORA GALACTICA',
  featureLine:'AURORA BOREALIS STAGES   SUPER BOSSES   PARTNER WINGS',
  shellFrameTheme:'platinum-release',
  frameAccent:'classic-blue'
 }),
 platformFrontDoor:Object.freeze({
  noticeHint:'PLATINUM RELEASE 1   GALAXY GUARDIANS PREVIEW AVAILABLE IN CHOOSE GAME'
 }),
 shellThemes:Object.freeze([
  Object.freeze({id:'platinum-release',label:'Platinum Release',shellFrameTheme:'platinum-release',frameAccent:'classic-blue',default:1}),
  Object.freeze({id:'aurora-crown',label:'Aurora Crown',shellFrameTheme:'aurora-crown',frameAccent:'aurora-crown'}),
  Object.freeze({id:'classic-blue',label:'Classic Blue',shellFrameTheme:'classic-blue',frameAccent:'classic-blue'})
 ]),
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

const GALAXY_GUARDIANS_PACK=Object.freeze({
 metadata:Object.freeze({
  gameKey:'galaxy-guardians-preview',
  title:'Galaxy Guardians',
  versionLine:'preview',
  playable:0
 }),
 frontDoor:Object.freeze({
  marqueeTitle:'Galaxy Guardians',
  title:'GALAXY GUARDIANS',
  featureLine:'FORMATION DIVES   FLAGSHIP ESCORTS   ARCADE PRESSURE',
  shellFrameTheme:'guardians-preview',
  frameAccent:'signal-crimson'
 }),
 platformFrontDoor:Object.freeze({
  noticeHint:'Galaxy Guardians is a shell preview for the next Platinum application.',
  pickerHint:'CHOOSE GAME TO SWITCH BACK TO AURORA'
 }),
 shellThemes:Object.freeze([
  Object.freeze({id:'guardians-preview',label:'Guardians Preview',shellFrameTheme:'guardians-preview',frameAccent:'signal-crimson',default:1}),
  Object.freeze({id:'platinum-release',label:'Platinum Release',shellFrameTheme:'platinum-release',frameAccent:'signal-crimson'}),
  Object.freeze({id:'classic-blue',label:'Classic Blue',shellFrameTheme:'classic-blue',frameAccent:'classic-blue'})
 ]),
 capabilities:Object.freeze({
  usesFormationRack:1,
  usesIndependentDiveAttacks:1,
  usesEscortPatterns:1,
  usesChallengeStages:0,
  usesCaptureRescue:0,
  usesDualFighterMode:0,
  usesStaticShields:0,
  usesStageThemeProgression:0,
  usesBossArchetypeVariants:0
 }),
 stageCadence:AURORA_STAGE_CADENCE,
 stageBandProfiles:AURORA_STAGE_BAND_PROFILES,
 formationLayouts:AURORA_FORMATION_LAYOUTS,
 challengeLayout:AURORA_CHALLENGE_LAYOUT,
 stageThemeProgression:Object.freeze([
  {fromStage:1,id:'signal-rack',frameAccent:'signal-crimson',backgroundMode:'starfield',challengeBrand:'signal',bossArchetype:'flagship'}
 ]),
 frameAccents:AURORA_FRAME_ACCENTS,
 scoring:AURORA_SCORING_RULES
});

const GAME_PACK_REGISTRY=Object.freeze({
 [AURORA_GAME_PACK.metadata.gameKey]:AURORA_GAME_PACK,
 [GALAXY_GUARDIANS_PACK.metadata.gameKey]:GALAXY_GUARDIANS_PACK
});

const DEFAULT_GAME_PACK_KEY=AURORA_GAME_PACK.metadata.gameKey;
let ACTIVE_GAME_PACK_KEY=DEFAULT_GAME_PACK_KEY;
let ACTIVE_GAME_PACK=AURORA_GAME_PACK;
const GAME_PACK_THEME_PREF_PREFIX=`${STORAGE_PREFIX}GamePackTheme:`;

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

function currentGamePackPlayable(){
 return currentGamePack().metadata?.playable!==0&&currentGamePack().metadata?.playable!==false;
}

function packIsPlayable(pack=null){
 return !!(pack&&pack.metadata?.playable!==0&&pack.metadata?.playable!==false);
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
 const shownStage=formatDisplayedStage(stage,challenge);
 return Object.assign({},theme,{
  challengeTitle:challenge?'CHALLENGING STAGE':`STAGE ${shownStage}`,
  stageLabel:challenge?'BONUS STAGE':`STAGE ${shownStage}`,
  transitionTitle:challenge?'CHALLENGING STAGE':`STAGE ${shownStage}`,
  transitionSub:challenge?'BONUS STAGE':'NEXT PHASE'
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
 const appFrontDoor=pack.frontDoor||{};
 const platformCopy=typeof platformFrontDoorCopyForPack==='function'
  ? platformFrontDoorCopyForPack(pack)
  : {};
 return Object.freeze({
  marqueeTitle:appFrontDoor.marqueeTitle||pack.metadata?.title||PRODUCT_NAME||'Platinum',
  title:appFrontDoor.title||String(pack.metadata?.title||PRODUCT_NAME||'Platinum').toUpperCase(),
  subtitle:appFrontDoor.subtitle||platformCopy.subtitle||'WAIT MODE',
  startPrompt:appFrontDoor.startPrompt||platformCopy.startPrompt||'PRESS <span class="k">ENTER</span> TO START',
  featureLine:appFrontDoor.featureLine||'',
  attractLine:appFrontDoor.attractLine||platformCopy.attractLine||'AUTO DEMO IN PROGRESS   HIGH SCORES NEXT',
  utilityLine:appFrontDoor.utilityLine||platformCopy.utilityLine||'<span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS',
  noticeHint:appFrontDoor.noticeHint||platformCopy.noticeHint||'',
  pickerHint:appFrontDoor.pickerHint||platformCopy.pickerHint||'',
  shellFrameTheme:appFrontDoor.shellFrameTheme||'platinum-release',
  frameAccent:appFrontDoor.frameAccent||'classic-blue',
  quotePlaceholder:Object.freeze({
   kicker:appFrontDoor.quotePlaceholder?.kicker||platformCopy.quotePlaceholder?.kicker||'',
   text:appFrontDoor.quotePlaceholder?.text||platformCopy.quotePlaceholder?.text||'',
   attribution:appFrontDoor.quotePlaceholder?.attribution||platformCopy.quotePlaceholder?.attribution||''
  }),
  quoteSurface:appFrontDoor.quoteSurface||platformCopy.quoteSurface||'wait-mode'
 });
}

function currentPlatformPackLabel(){
 const pack=currentGamePack();
 return `${PLATFORM_NAME} · ${pack.metadata?.title||'No Pack'}`;
}

function currentGamePackShellThemes(){
 const themes=Array.isArray(currentGamePack().shellThemes)&&currentGamePack().shellThemes.length
  ? currentGamePack().shellThemes
  : [Object.freeze({
   id:currentGamePackFrontDoor().shellFrameTheme||currentGamePackFrontDoor().frameAccent,
   label:'Default',
   shellFrameTheme:currentGamePackFrontDoor().shellFrameTheme||'platinum-release',
   frameAccent:currentGamePackFrontDoor().frameAccent,
   default:1
  })];
 return themes;
}

function currentGamePackShellThemePrefKey(gameKey=currentGamePackKey()){
 return `${GAME_PACK_THEME_PREF_PREFIX}${gameKey}`;
}

function selectedShellThemeForPack(pack=currentGamePack(),gameKey=currentGamePackKey()){
 const themes=Array.isArray(pack?.shellThemes)&&pack.shellThemes.length
  ? pack.shellThemes
  : [Object.freeze({
   id:pack?.frontDoor?.shellFrameTheme||pack?.frontDoor?.frameAccent||'classic-blue',
   label:'Default',
   shellFrameTheme:pack?.frontDoor?.shellFrameTheme||'platinum-release',
   frameAccent:pack?.frontDoor?.frameAccent||'classic-blue',
   default:1
  })];
 const prefId=String(readPref(currentGamePackShellThemePrefKey(gameKey))||'').trim();
 return themes.find(theme=>theme.id===prefId)
  || themes.find(theme=>theme.default)
  || themes[0];
}

function currentGamePackSelectedShellTheme(){
 return selectedShellThemeForPack(currentGamePack(),currentGamePackKey());
}

function currentGamePackFrontDoorFrameAccent(){
 const selected=currentGamePackSelectedShellTheme();
 return selected?.frameAccent||currentGamePackFrontDoor().frameAccent||'classic-blue';
}

function currentGamePackFrontDoorShellFrameTheme(){
 const selected=currentGamePackSelectedShellTheme();
 return selected?.shellFrameTheme||currentGamePackFrontDoor().shellFrameTheme||'platinum-release';
}

function setCurrentGamePackShellTheme(themeId=''){
 const themes=currentGamePackShellThemes();
 const next=themes.find(theme=>theme.id===themeId)||themes.find(theme=>theme.default)||themes[0];
 if(!next)return null;
 writePref(currentGamePackShellThemePrefKey(),next.id);
 syncInstalledPackShellChrome();
 return next;
}

function syncInstalledPackShellChrome(){
 const pack=currentGamePack();
 const frontDoor=currentGamePackFrontDoor();
 const frameTheme=currentGamePack().frameAccents[currentGamePackFrontDoorFrameAccent()]||currentGamePack().frameAccents['classic-blue'];
 const shellTheme=platinumShellFrameTheme(currentGamePackFrontDoorShellFrameTheme());
 try{document.title=pack.metadata?.title||PRODUCT_NAME||document.title}catch{}
 const marquee=document.getElementById('cabinetMarqueeTitle');
  if(marquee)marquee.textContent=frontDoor.marqueeTitle;
 if(settingsRuntime)settingsRuntime.textContent=`Platform ${currentPlatformPackLabel()}`;
 const root=document.documentElement;
 if(root&&frameTheme&&shellTheme){
  root.style.setProperty('--shell-line',shellTheme.shellLine);
  root.style.setProperty('--shell-glow',shellTheme.shellGlow);
  root.style.setProperty('--frame-line',frameTheme.frameLine);
  root.style.setProperty('--frame-glow',frameTheme.frameGlow);
  root.style.setProperty('--marquee-border',shellTheme.marqueeBorder);
  root.style.setProperty('--marquee-glow',shellTheme.marqueeGlow);
  root.style.setProperty('--marquee-bg',shellTheme.marqueeBackground);
  root.style.setProperty('--shell-top-bg',shellTheme.shellTopBackground);
  root.style.setProperty('--shell-side-bg',shellTheme.shellSideBackground);
  root.style.setProperty('--shell-bottom-bg',shellTheme.shellBottomBackground);
  root.style.setProperty('--shell-panel-border',shellTheme.shellPanelBorder);
  root.style.setProperty('--shell-panel-shadow',shellTheme.shellPanelShadow);
  root.style.setProperty('--left-rail-border',shellTheme.leftRailBorder);
  root.style.setProperty('--left-rail-bg',shellTheme.leftRailBackground);
  root.style.setProperty('--right-rail-border',shellTheme.rightRailBorder);
  root.style.setProperty('--right-rail-bg',shellTheme.rightRailBackground);
  root.style.setProperty('--rail-inner-border',shellTheme.railInnerBorder);
  root.style.setProperty('--rail-inner-glow',shellTheme.railInnerGlow);
 }
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

{
 const savedGamePackKey=readPref(GAME_PACK_PREF_KEY)||DEFAULT_GAME_PACK_KEY;
 const savedPack=getGamePack(savedGamePackKey);
 if(packIsPlayable(savedPack)){
  installGamePack(savedGamePackKey);
 }else{
  removePref(GAME_PACK_PREF_KEY);
  installGamePack(DEFAULT_GAME_PACK_KEY,{persist:1});
 }
}
window.availableGamePacks=availableGamePacks;
window.getGamePack=getGamePack;
window.currentGamePack=currentGamePack;
window.currentGamePackKey=currentGamePackKey;
window.currentGamePackPlayable=currentGamePackPlayable;
window.packIsPlayable=packIsPlayable;
window.currentGamePackFrontDoor=currentGamePackFrontDoor;
window.currentPlatformPackLabel=currentPlatformPackLabel;
window.currentGamePackShellThemes=currentGamePackShellThemes;
window.selectedShellThemeForPack=selectedShellThemeForPack;
window.currentGamePackSelectedShellTheme=currentGamePackSelectedShellTheme;
window.setCurrentGamePackShellTheme=setCurrentGamePackShellTheme;
window.installGamePack=installGamePack;

// Platinum game-pack registry and active-pack runtime helpers.

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
 const atmosphereTheme=theme?.atmosphereTheme||theme?.backgroundMode||pack.frontDoor?.atmosphereTheme||'classic-arcade';
 return Object.assign({},theme,{
  atmosphereTheme,
  backgroundMode:resolvePackAtmosphereBackground({pack,atmosphereTheme,phase:challenge?'challenge':'stage'}),
  challengeTitle:challenge?'CHALLENGING STAGE':`STAGE ${shownStage}`,
  stageLabel:challenge?'BONUS STAGE':`STAGE ${shownStage}`,
  transitionTitle:challenge?'CHALLENGING STAGE':`STAGE ${shownStage}`,
  transitionSub:challenge?'BONUS STAGE':'NEXT PHASE'
 });
}

function currentGamePackAtmosphereTheme(id=''){
 const themes=currentGamePack().atmosphereThemes||{};
 const nextId=String(id||'').trim()||currentGamePack().frontDoor?.atmosphereTheme||'classic-arcade';
 return themes[nextId]||themes['classic-arcade']||Object.values(themes)[0]||Object.freeze({
  id:'classic-arcade',
  label:'Classic Arcade',
  group:'default',
  backgrounds:Object.freeze({frontDoor:'classic-stars',wait:'classic-stars',demo:'classic-stars',stage:'classic-stars',challenge:'classic-stars'}),
  audioTheme:'classic-arcade'
 });
}

function resolvePackAtmosphereBackground({pack=currentGamePack(),atmosphereTheme='',phase='stage'}={}){
 const theme=(pack?.atmosphereThemes&&pack.atmosphereThemes[atmosphereTheme])||currentGamePackAtmosphereTheme(atmosphereTheme);
 return theme?.backgrounds?.[phase]
  || theme?.backgrounds?.stage
  || theme?.backgrounds?.demo
  || 'classic-stars';
}

function currentGamePackResolvedAtmosphere(opts={}){
 const pack=currentGamePack();
 const attractPhase=opts.attractPhase||((typeof ATTRACT!=='undefined'&&ATTRACT.phase)||'');
 const phase=String(opts.phase||'').trim()||(
  opts.frontDoor?'frontDoor'
   : attractPhase==='scores'?'wait'
   : attractPhase==='demo'?'demo'
   : opts.challenge?'challenge'
   : 'stage'
 );
 const atmosphereThemeId=String(
  opts.atmosphereTheme
  || ((phase==='frontDoor'||phase==='wait')?pack.frontDoor?.atmosphereTheme:'')
  || ((phase==='demo'||phase==='stage'||phase==='challenge')?opts.stagePresentation?.atmosphereTheme:'')
  || pack.frontDoor?.atmosphereTheme
  || 'classic-arcade'
 );
 const theme=currentGamePackAtmosphereTheme(atmosphereThemeId);
 return Object.freeze({
  id:theme.id,
  label:theme.label||theme.id,
  group:theme.group||'default',
  phase,
  backgroundMode:resolvePackAtmosphereBackground({pack,atmosphereTheme:theme.id,phase}),
  audioTheme:theme.audioTheme||'classic-arcade',
  starfield:theme.starfield||null
 });
}

function currentGamePackAudioTheme(id=''){
 const themes=currentGamePack().audioThemes||{};
 const nextId=String(id||'').trim()||'classic-arcade';
 return themes[nextId]||themes['classic-arcade']||Object.values(themes)[0]||Object.freeze({id:'classic-arcade',cues:Object.freeze({})});
}

function currentGamePackAudioCue(cueName,opts={}){
 const atmosphere=opts.resolvedAtmosphere||currentGamePackResolvedAtmosphere(opts);
 const phase=String(atmosphere?.phase||opts.phase||'stage').trim()||'stage';
 const theme=currentGamePackAudioTheme(atmosphere.audioTheme);
 const fallback=currentGamePackAudioTheme('classic-arcade');
 const resolveCue=(sourceTheme)=>{
  const base=sourceTheme?.cues?.[cueName];
  if(!base)return null;
  if(base.byPhase){
   return base.byPhase[phase]
    || base.byPhase.stage
    || base.byPhase.demo
    || base.byPhase.wait
    || null;
  }
  return base;
 };
 return resolveCue(theme)
  || resolveCue(fallback)
  || null;
}

function currentGamePackReferenceTiming(key=''){
 const timings=currentGamePack().referenceTimings||{};
 return timings[String(key||'').trim()]||null;
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
  atmosphereTheme:appFrontDoor.atmosphereTheme||'classic-arcade',
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

function currentGamePackPreview(pack=currentGamePack()){
 const preview=pack?.preview||{};
 return Object.freeze({
  banner:preview.banner||'PREVIEW',
  title:preview.title||pack?.metadata?.title||'Game Preview',
  subtitle:preview.subtitle||'PACK PREVIEW ON PLATINUM',
  image:preview.image||'',
  imageAlt:preview.imageAlt||`${preview.title||pack?.metadata?.title||'Game'} preview art`,
  cardLine:preview.cardLine||'Preview shell while gameplay integration is still in progress.',
  summary:preview.summary||`${pack?.metadata?.title||'This game'} is a preview-only Platinum application right now.`,
  detail:preview.detail||'Aurora Galactica remains the current playable cabinet while this pack is being prepared.',
  highlights:Array.isArray(preview.highlights)?preview.highlights:[],
  milestones:Array.isArray(preview.milestones)?preview.milestones:[],
  launchFallbackToast:preview.launchFallbackToast||`${pack?.metadata?.title||'This pack'} is preview-only. Launching Aurora Galactica.`
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
window.currentGamePackPreview=currentGamePackPreview;
window.currentGamePackAtmosphereTheme=currentGamePackAtmosphereTheme;
window.currentGamePackResolvedAtmosphere=currentGamePackResolvedAtmosphere;
window.currentGamePackAudioTheme=currentGamePackAudioTheme;
window.currentGamePackAudioCue=currentGamePackAudioCue;
window.currentGamePackReferenceTiming=currentGamePackReferenceTiming;
window.currentPlatformPackLabel=currentPlatformPackLabel;
window.currentGamePackShellThemes=currentGamePackShellThemes;
window.selectedShellThemeForPack=selectedShellThemeForPack;
window.currentGamePackSelectedShellTheme=currentGamePackSelectedShellTheme;
window.setCurrentGamePackShellTheme=setCurrentGamePackShellTheme;
window.installGamePack=installGamePack;

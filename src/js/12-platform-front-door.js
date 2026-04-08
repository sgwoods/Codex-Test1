// Platform-owned front-door, shell, and release-cycle copy.

const PLATINUM_FRONT_DOOR_BASE=Object.freeze({
 subtitle:'WAIT MODE',
 startPrompt:'PRESS <span class="k">ENTER</span> TO START',
 attractLine:'AUTO DEMO IN PROGRESS   HIGH SCORES NEXT',
 utilityLine:'<span class="k">F</span> FULLSCREEN   <span class="k">U</span> ULTRA SCALE   <span class="k">⚙</span> DEV TOOLS',
 noticeHint:'PLATINUM SHELL ONLINE   HOSTED DOCS AND PACK SURFACES LIVE',
 pickerHint:'CHOOSE GAME TO SWITCH CABINETS',
 quotePlaceholder:Object.freeze({
  kicker:'',
  text:'',
  attribution:''
 }),
 quoteSurface:'wait-mode'
});

const PLATINUM_PREVIEW_FRONT_DOOR=Object.freeze({
 subtitle:'PREVIEW SHELL',
 startPrompt:'PRESS <span class="k">ENTER</span> TO RETURN TO AURORA',
 attractLine:'PREVIEW SHELL ACTIVE   AURORA REMAINS PLAYABLE',
 utilityLine:'<span class="k">CHOOSE GAME</span> TO SWITCH CABINETS   <span class="k">PLAY</span> COMES LATER',
 noticeHint:'This cabinet is a shell-and-identity preview while gameplay integration is still in progress.',
 pickerHint:'AURORA REMAINS THE CURRENT PLAYABLE CABINET',
 quotePlaceholder:Object.freeze({
  kicker:'',
  text:'',
  attribution:''
 }),
 quoteSurface:'wait-mode'
});

const PLATINUM_SPLASH_CONTENT=Object.freeze({
 title:'PLATINUM',
 subtitle:'ARCADE GAME PLATFORM',
 eyebrow:'HOST PLATFORM',
 image:'assets/platinum-platform-mark.png',
 imageAlt:'Platinum platform mark',
 paragraphs:Object.freeze([
  'Platinum is the shared cabinet shell, runtime, services, and release surface that now hosts Aurora Galactica as its first shipped application.',
  'It owns the shell, hosted lanes, documentation, and pack-selection path so future games can live on the same platform without inheriting Aurora-specific rules.'
 ])
});

function platformFrontDoorCopyForPack(pack=currentGamePack?.()){
 const preview=pack&&pack.metadata?.playable===0;
 const base=preview?PLATINUM_PREVIEW_FRONT_DOOR:PLATINUM_FRONT_DOOR_BASE;
 const overrides=pack?.platformFrontDoor||{};
 return Object.freeze({
  subtitle:overrides.subtitle||base.subtitle,
  startPrompt:overrides.startPrompt||base.startPrompt,
  attractLine:overrides.attractLine||base.attractLine,
  utilityLine:overrides.utilityLine||base.utilityLine,
  noticeHint:overrides.noticeHint||base.noticeHint,
  pickerHint:overrides.pickerHint||base.pickerHint,
  quotePlaceholder:Object.freeze({
   kicker:overrides.quotePlaceholder?.kicker||base.quotePlaceholder.kicker||'',
   text:overrides.quotePlaceholder?.text||base.quotePlaceholder.text||'',
   attribution:overrides.quotePlaceholder?.attribution||base.quotePlaceholder.attribution||''
  }),
  quoteSurface:overrides.quoteSurface||base.quoteSurface||'wait-mode'
 });
}

function currentPlatformSplashContent(){
 return PLATINUM_SPLASH_CONTENT;
}

function syncPlatformSplashContent(){
 const splash=currentPlatformSplashContent();
 const title=document.getElementById('platformSplashTitle');
 const subtitle=document.getElementById('platformSplashSubtitle');
 const image=document.getElementById('platformSplashImage');
 const copy=document.getElementById('platformSplashCopy');
 if(title)title.textContent=splash.title;
 if(subtitle)subtitle.textContent=splash.subtitle;
 if(image){
  image.src=splash.image;
  image.alt=splash.imageAlt;
 }
 if(copy){
  copy.innerHTML=`<span class="platformSplashEyebrow">${splash.eyebrow}</span>${splash.paragraphs.map(text=>`<p>${text}</p>`).join('')}`;
 }
}

window.platformFrontDoorCopyForPack=platformFrontDoorCopyForPack;
window.currentPlatformSplashContent=currentPlatformSplashContent;
window.syncPlatformSplashContent=syncPlatformSplashContent;
syncPlatformSplashContent();

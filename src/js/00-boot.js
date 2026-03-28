// Boot, constants, audio, logging, UI, and input handling.
const c=document.getElementById('c'),ctx=c.getContext('2d'),msg=document.getElementById('msg'),hud=document.getElementById('hud'),left=document.getElementById('left'),center=document.getElementById('center'),right=document.getElementById('right');
const settingsBtn=document.getElementById('settingsBtn'),settingsPanel=document.getElementById('settingsPanel');
const cabinetShell=document.getElementById('cabinetShell');
const cabinetRightFrame=document.getElementById('cabinetRightFrame');
const openViewerBtn=document.getElementById('openViewerBtn');
const openProjectGuideBtn=document.getElementById('openProjectGuideBtn');
const guideDockBtn=document.getElementById('guideDockBtn');
const controlsDockBtn=document.getElementById('controlsDockBtn');
const feedbackDockBtn=document.getElementById('feedbackDockBtn');
const helpModal=document.getElementById('helpModal'),helpClose=document.getElementById('helpClose'),helpGuideFrame=document.getElementById('helpGuideFrame'),helpOpenWindowBtn=document.getElementById('helpOpenWindowBtn');
const helpTabButtons=Array.from(document.querySelectorAll('[data-help-tab]')),helpPanels=Array.from(document.querySelectorAll('[data-help-panel]'));
const feedbackModal=document.getElementById('feedbackModal'),feedbackForm=document.getElementById('feedbackForm');
const fbType=document.getElementById('fbType'),fbSummary=document.getElementById('fbSummary'),fbDescription=document.getElementById('fbDescription'),fbCancel=document.getElementById('fbCancel');
const feedbackStatus=document.getElementById('feedbackStatus'),feedbackToast=document.getElementById('feedbackToast'),exportBtn=document.getElementById('exportBtn'),recordBtn=document.getElementById('recordBtn');
const testPanel=document.getElementById('testPanel'),testStage=document.getElementById('testStage'),testShips=document.getElementById('testShips'),testChallenge=document.getElementById('testChallenge');
const muteToggleBtn=document.getElementById('muteToggleBtn');
const pauseToggleBtn=document.getElementById('pauseToggleBtn');
const statusPanels=document.getElementById('statusPanels');
const buildStamp=document.getElementById('buildStamp'),buildStampChannel=document.getElementById('buildStampChannel'),buildStampVersion=document.getElementById('buildStampVersion'),buildStampRelease=document.getElementById('buildStampRelease');
let t0=0,started=0,paused=0,aud=0,keys={},keyState={};
let RNG_SEED=0,RNG_STATE=0;
window.__auroraCarryDebug=window.__auroraCarryDebug||0;
const PRODUCT_NAME='Aurora Galactica';
const STORAGE_PREFIX='auroraGalactica';
const LEGACY_STORAGE_PREFIX='galagaTrib';
const RECORD_PREF_KEY=`${STORAGE_PREFIX}AutoVideo`;
const TEST_PREF_KEY=`${STORAGE_PREFIX}TestCfg`;
const SEED_PREF_KEY=`${STORAGE_PREFIX}HarnessSeed`;
const SCOREBOARD_KEY=`${STORAGE_PREFIX}Top10`;
const LEADERBOARD_PREF_KEY=`${STORAGE_PREFIX}LeaderboardView`;
const AUDIO_MUTED_PREF_KEY=`${STORAGE_PREFIX}AudioMuted`;
const BEST_SCORE_KEY=`${STORAGE_PREFIX}Best`;
const LEGACY_STORAGE_KEYS={
 [RECORD_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}AutoVideo`,
 [TEST_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}TestCfg`,
 [SEED_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}HarnessSeed`,
 [SCOREBOARD_KEY]:`${LEGACY_STORAGE_PREFIX}Top10`,
 [LEADERBOARD_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}LeaderboardView`,
 [AUDIO_MUTED_PREF_KEY]:`${LEGACY_STORAGE_PREFIX}AudioMuted`,
 [BEST_SCORE_KEY]:`${LEGACY_STORAGE_PREFIX}Best`
};
let audioMuted=readPref(AUDIO_MUTED_PREF_KEY)==='1';
function readPref(key){
 try{
  const current=localStorage.getItem(key);
  if(current!=null)return current;
  const legacy=LEGACY_STORAGE_KEYS[key];
  if(!legacy)return null;
  const fallback=localStorage.getItem(legacy);
  if(fallback!=null)localStorage.setItem(key,fallback);
  return fallback;
 }catch{
  return null;
 }
}
function writePref(key,value){
 try{localStorage.setItem(key,value)}catch{}
}
function removePref(key){
 try{localStorage.removeItem(key)}catch{}
}
function randUnit(){
 if(!RNG_SEED)return Math.random();
 RNG_STATE=(RNG_STATE+0x6D2B79F5)|0;
 let t=Math.imul(RNG_STATE^RNG_STATE>>>15,1|RNG_STATE);
 t^=t+Math.imul(t^t>>>7,61|t);
 return((t^t>>>14)>>>0)/4294967296;
}
function setSeed(seed=0){
 RNG_SEED=(+seed>>>0)||0;
 RNG_STATE=RNG_SEED||0;
 if(RNG_SEED)writePref(SEED_PREF_KEY,String(RNG_SEED));
 else removePref(SEED_PREF_KEY);
 return RNG_SEED;
}
const rnd=(a=1,b=0)=>randUnit()*(a-b)+b,cl=(v,a,b)=>v<a?a:v>b?b:v;
let DPR=1;
const BUILD_INFO={version:'{{BUILD_VERSION}}',label:'{{BUILD_LABEL}}',commit:'{{BUILD_COMMIT}}',branch:'{{BUILD_BRANCH}}',dirty:{{BUILD_DIRTY}},released:'{{BUILD_RELEASE_ET}}',state:'{{BUILD_STATE}}',releaseChannel:'{{BUILD_CHANNEL}}'};
const BUILD=BUILD_INFO.label;
const FEEDBACK_RATE_MS=30000;
const MODEM_FEATURE_EMAIL='default-dimiglyd88@inbox.modem.dev';
const FORMSUBMIT_ENDPOINT=`https://formsubmit.co/ajax/${MODEM_FEATURE_EMAIL}`;
let feedbackOpen=0,feedbackBusy=0,feedbackPrevPaused=0,feedbackLastSubmit=0,toastTimer=0;
let helpOpen=0,helpPrevPaused=0,helpMode='controls';
let settingsOpen=0,settingsPrevPaused=0;
let REC=null,recShotT=0,sessionN=0;
let autoExportedSessionId='';
let gameOverHtml='';
let gameOverState=null;
const ATTRACT={active:0,phase:'',timer:0,cycle:0};
const CHALLENGE_GROUP_BONUS=[1000,1000,1000,2000,2000,2000,3000,3000,3000];
const VIDEO_REC={enabled:readPref(RECORD_PREF_KEY)!=='0',active:0,rec:null,stream:null,chunks:[],mime:'',sessionId:'',file:'',afterStop:[],stopMeta:null};
const VIDEO_REC_INCLUDE_AUDIO=1;
const PLAY_W=280,PLAY_H=360;
const VIS={shipW:36,shipH:28,enemyW:36,enemyH:28,gx:118,gy:66,playerBottom:92,beamLen:380,formTop:28};
const STAGE1_SCRIPT=[
 {t:4.6,type:'bee',c:1},{t:6.1,type:'bee',c:8},
 {t:8.2,type:'but',c:2},{t:9.8,type:'but',c:7},
 {t:12.4,type:'bee',c:0},{t:14.2,type:'bee',c:9},
 {t:17.3,type:'but',c:4},{t:20.4,type:'boss',c:3,escort:1},
 {t:24.1,type:'bee',c:5},{t:26.0,type:'but',c:6},
 {t:29.6,type:'boss',c:6,capture:1},
 {t:34.0,type:'bee',c:2},{t:37.2,type:'but',c:8},
 {t:41.0,type:'boss',c:4,escort:1}
];
const STAGE_BAND_PROFILES=[
 {name:'classic',beeFamily:'classic',butFamily:'classic',bossFamily:'classic',challengeFamily:'classic',pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1,steer:1,jitter:1,diveVy:1,diveAccel:1},
 {name:'scorpion',beeFamily:'scorpion',butFamily:'scorpion',bossFamily:'classic',challengeFamily:'classic',pulseX:.95,pulseY:.8,entryX:.92,entryY:.9,weave:1.18,steer:.96,jitter:1.1,diveVy:.98,diveAccel:1},
 {name:'stingray',beeFamily:'stingray',butFamily:'stingray',bossFamily:'stingray',challengeFamily:'dragonfly',pulseX:1.08,pulseY:.78,entryX:1.06,entryY:.82,weave:1.28,steer:1.06,jitter:1.16,diveVy:1.04,diveAccel:1.03},
 {name:'galboss',beeFamily:'galboss',butFamily:'galboss',bossFamily:'galboss',challengeFamily:'mosquito',pulseX:.9,pulseY:.72,entryX:.88,entryY:.76,weave:.9,steer:.9,jitter:.92,diveVy:1.02,diveAccel:.98}
];

function stageBandIndex(stage){
 if(stage < 4) return 0;
 return 1 + (Math.floor((stage - 4) / 4) % 3);
}

function stageBandProfile(stage, challenge){
 const base = STAGE_BAND_PROFILES[stageBandIndex(stage)] || STAGE_BAND_PROFILES[0];
 if(!challenge) return base;
 if(stage >= 19) return Object.assign({}, base, { challengeFamily: 'mosquito' });
 if(stage >= 11) return Object.assign({}, base, { challengeFamily: 'dragonfly' });
 return Object.assign({}, base, { challengeFamily: 'classic' });
}

function enemyFamilyForType(profile, type){
 if(type === 'bee') return profile.beeFamily;
 if(type === 'but') return profile.butFamily;
 if(type === 'boss') return profile.bossFamily;
 if(type === 'rogue') return 'rogue';
 return 'classic';
}

const AC=()=>{
 if(sfx.a)return sfx.a;
 const A=new (window.AudioContext||webkitAudioContext)();
 sfx.a=A;
 sfx.bus=A.createGain();
 sfx.bus.gain.value=audioMuted?0:.9;
 sfx.tap=A.createMediaStreamDestination();
 sfx.keep=A.createConstantSource();
 sfx.keep.offset.value=0;
 sfx.keep.connect(sfx.bus);
 sfx.keep.start();
 sfx.bus.connect(A.destination);
 sfx.bus.connect(sfx.tap);
 return A;
};
const sfx={
 a:null,n:null,bus:null,tap:null,keep:null,recOsc:null,recGain:null,
 play(f=440,d=.08,t='square',v=.03,sl=0,det=0,lpHz=4200,at=0){if(!aud)return;const A=AC(),tm=A.currentTime+at,o=A.createOscillator(),o2=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=lpHz;g.gain.setValueAtTime(.0001,tm);g.gain.exponentialRampToValueAtTime(v,tm+.008);g.gain.exponentialRampToValueAtTime(.0001,tm+d);
  o.type=t;o.frequency.setValueAtTime(f,tm);o.frequency.linearRampToValueAtTime(Math.max(25,f+sl),tm+d);
  o2.type=t==='square'?'triangle':'square';o2.frequency.setValueAtTime(f*(1+det),tm);o2.frequency.linearRampToValueAtTime(Math.max(25,(f+sl)*(1+det)),tm+d);
  o.connect(lp);o2.connect(lp);lp.connect(g);g.connect(this.bus);o.start(tm);o2.start(tm);o.stop(tm+d+.03);o2.stop(tm+d+.03);
 },
 noise(d=.08,v=.02,hp=900,at=0){if(!aud)return;const A=AC(),tm=A.currentTime+at,b=this.n||(this.n=(()=>{const n=A.sampleRate*.35,buf=A.createBuffer(1,n,A.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=randUnit()*2-1;return buf})()),src=A.createBufferSource(),g=A.createGain(),f=A.createBiquadFilter();
  src.buffer=b;src.loop=true;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,tm);g.gain.exponentialRampToValueAtTime(.0001,tm+d);src.connect(f);f.connect(g);g.connect(this.bus);src.start(tm);src.stop(tm+d+.01);
 },
 seq(ns=[],step=.05,t='square',v=.02,sl=0,lpHz=3600){for(let i=0;i<ns.length;i++)if(ns[i]>0)this.play(ns[i],step,t,v,sl,0,lpHz,i*step*.92)},
 start(){this.seq([523,659,784],.055,'square',.02,24,3600);this.play(392,.18,'triangle',.018,110,.005,2500,.02)},
 shot(){this.play(1140,.028,'square',.006,-620,.006,6200);this.play(1520,.018,'square',.003,-480,-.004,6800,.006)},
 enemyShot(){this.play(338,.075,'triangle',.009,-130,.002,3000);this.play(258,.05,'square',.004,-90,.002,2600,.012)},
 hit(){this.play(228,.05,'square',.013,-180,.008,3200);this.play(146,.1,'sawtooth',.015,-220,.012,2300,.02);this.noise(.05,.006,1600,.012)},
 bossHit(){this.play(312,.06,'square',.015,-120,.004,3600);this.play(202,.12,'triangle',.012,-80,.003,2500,.014);this.noise(.04,.004,1900,.01)},
 shipHit(){this.play(228,.11,'square',.022,-300,.012,2600);this.play(176,.19,'sawtooth',.024,-320,.016,2100,.016);this.play(124,.28,'triangle',.022,-150,.009,1600,.028);this.noise(.16,.016,1120,.012);this.noise(.08,.01,760,.03)},
 boom(k='bee'){const boss=k==='boss'||k==='rogue';this.play(boss?420:520,.026,'square',boss?.011:.008,-340,.004,4200);this.play(boss?280:360,.04,'square',boss?.008:.006,-280,-.003,3600,.012);this.play(boss?180:240,boss?.11:.075,'triangle',boss?.011:.006,-90,-.004,2100,.018);if(boss)this.noise(.045,.004,1400,.016)},
 beam(){this.play(92,.34,'sawtooth',.018,48,.018,3000);this.play(138,.28,'triangle',.009,30,.01,2400,.04);this.noise(.11,.004,1900,.03)},
 rescue(){this.seq([660,880,990,1320],.05,'triangle',.016,70,4300);this.play(1760,.08,'square',.007,-90,.003,5200,.08)},
 over(){this.seq([294,262,220,196],.11,'triangle',.017,-45,2300);this.play(147,.32,'sawtooth',.016,-120,.01,1900,.018);this.noise(.09,.004,1100,.1)},
 march(i=0){const p=[[392,523,659],[330,440,523],[440,587,698],[294,392,523]][i%4];this.play(p[0],.055,'triangle',.009,-16,.002,2800);this.play(p[1],.04,'square',.004,-12,-.002,4000,.016);this.play(p[2],.03,'square',.0024,-18,.002,4600,.032)},
 uiTick(){this.play(920,.024,'square',.004,-110,.001,5400);this.play(1320,.016,'triangle',.0025,-70,.001,5200,.004)},
 uiConfirm(){this.seq([660,880],.04,'triangle',.008,30,4200)},
 captureRetreat(){
  this.seq([247,294,370,494],.06,'triangle',.012,18,2600);
  this.play(620,.18,'square',.006,-70,.08,3400);
 },
 join(){
  this.seq([523,659,784,1047],.05,'triangle',.013,42,4200);
  this.play(1318,.09,'square',.006,-80,.08,5000);
 },
 transition(challenge=0){
  if(challenge){
   this.seq([392,523,659,784],.055,'triangle',.012,40,3600);
   this.play(988,.12,'square',.006,-70,.12,4600);
  }else{
   this.seq([440,554,659],.06,'triangle',.011,24,3400);
   this.play(880,.09,'square',.005,-80,.1,4300);
  }
 }
};

const P={
 ship:{
  a:[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[1,3],[2,3],[3,3],[4,3],[2,4],[3,4]],
  b:[[2,1],[3,1],[2,2],[3,2],[2,3],[3,3]],
  c:[[0,2],[5,2],[1,1],[4,1]]
 },
 bee:{
  a:[[0,1],[6,1],[-1,2],[0,2],[6,2],[7,2],[0,3],[6,3],[1,4],[5,4]],
  b:[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[4,2],[2,3],[3,3],[2,4],[3,4]],
  c:[[2,1],[3,1],[2,4],[3,4]]
 },
 but:{
  a:[[0,1],[6,1],[-1,2],[0,2],[6,2],[7,2],[0,3],[6,3],[1,4],[5,4]],
  b:[[2,0],[3,0],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[4,3],[2,4],[3,4]],
  c:[[2,1],[3,1],[2,3],[3,3]]
 },
 boss:{
  a:[[0,1],[1,1],[6,1],[7,1],[-1,2],[0,2],[1,2],[6,2],[7,2],[8,2],[0,3],[1,3],[6,3],[7,3],[1,4],[6,4]],
  b:[[2,0],[3,0],[4,0],[5,0],[2,1],[3,1],[4,1],[5,1],[2,2],[3,2],[4,2],[5,2],[2,3],[3,3],[4,3],[5,3],[3,4],[4,4]],
  c:[[2,0],[5,0],[3,2],[4,2]]
 },
 rogue:{
  a:[[0,1],[1,1],[6,1],[7,1],[-1,2],[0,2],[1,2],[6,2],[7,2],[8,2],[0,3],[1,3],[6,3],[7,3],[1,4],[6,4]],
  b:[[2,0],[3,0],[4,0],[5,0],[2,1],[3,1],[4,1],[5,1],[2,2],[3,2],[4,2],[5,2],[2,3],[3,3],[4,3],[5,3],[3,4],[4,4]],
  c:[[2,0],[5,0],[3,2],[4,2]]
 }
};

const S={score:0,best:+readPref(BEST_SCORE_KEY)||0,lives:2,stage:1,shake:0,st:[],neb:[],e:[],pb:[],eb:[],fx:[],cap:null,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',fireCD:0,t:null,rogue:0,attract:0,
 p:{x:0,y:0,vx:0,s:440,accel:12,decel:18,manualTapSpeed:248,manualTapWindow:.072,manualReverseWindow:.11,cd:0,inv:0,dual:0,captured:0,returning:0,pending:0,spawn:0,capBoss:null,capT:0,hNoShotT:0,hDebugT:0,demoTargetId:null,demoTargetT:0},att:0,challenge:0,ch:{hits:0,total:0,done:0},seq:0,seqT:0,alertT:0,alertTxt:'',ultra:1,recoverT:0,attackGapT:0,nextStageT:0,postChallengeT:0,pendingStage:0,lastChallengeClearT:null,challengeTransitionStallLogged:0,profile:STAGE_BAND_PROFILES[0],
 scriptMode:0,scriptT:0,scriptI:0,scriptShotI:0,scriptShotT:1.4,forceChallenge:0,liveCount:40,stageClock:0,squadSeq:0,captureCountStage:0,lastCaptureStartT:null,lastFighterCapturedT:null,sequenceT:0,sequenceMode:'',stats:{shots:0,hits:0}};

const isChallengeStage=s=>s===3||((s-3)%4===0&&s>3);
const CHALLENGE_STAGE_TUNE={shotCap:0,attackCap:0,diveRate:0,coolA:99,coolB:99,globalA:99,globalB:99,capChance:0,diveShotRate:0,aimMul:.08,aimClamp:10,aimRnd:1,bulletVy:170,bulletVyStage:2};
const STAGE_RULES={
 opening:{maxStage:1,tune:{shotCap:1,attackCap:1,diveRate:.34,coolA:7.6,coolB:5.7,globalA:3.4,globalB:2.65,capChance:.11,diveShotRate:.24,aimMul:.08,aimClamp:11,aimRnd:1.4,bulletVy:154,bulletVyStage:2},flight:{scriptedDiveVy:80,randomDiveVy:82,diveAccel:150}},
 stage2:{maxStage:2,tune:{shotCap:1,attackCap:1,diveRate:.56,coolA:6.2,coolB:4.2,globalA:2.2,globalB:1.62,capChance:.12,diveShotRate:.46,aimMul:.1,aimClamp:14,aimRnd:1.8,bulletVy:169,bulletVyStage:3},flight:{scriptedDiveVy:86,randomDiveVy:88,diveAccel:162}},
 stage3:{maxStage:3,tune:{shotCap:2,attackCap:2,diveRate:.82,coolA:5.3,coolB:3.2,globalA:1.8,globalB:1.28,capChance:.2,diveShotRate:.58,aimMul:.11,aimClamp:15,aimRnd:2.2,bulletVy:174,bulletVyStage:3},flight:{scriptedDiveVy:92,randomDiveVy:88,diveAccel:162}},
 stage4:{maxStage:4,tune:{shotCap:1,attackCap:1,diveRate:.49,coolA:7.2,coolB:4.9,globalA:2.82,globalB:1.98,capChance:.14,diveShotRate:.28,aimMul:.11,aimClamp:15,aimRnd:2,bulletVy:166,bulletVyStage:3},flight:{scriptedDiveVy:92,randomDiveVy:88,diveAccel:172}},
 stage5:{maxStage:5,tune:{shotCap:1,attackCap:2,diveRate:.67,coolA:6.5,coolB:4.2,globalA:2.24,globalB:1.56,capChance:.17,diveShotRate:.42,aimMul:.12,aimClamp:16,aimRnd:2.2,bulletVy:171,bulletVyStage:3},flight:{scriptedDiveVy:92,randomDiveVy:94,diveAccel:172}},
 endless:{maxStage:Infinity,tune:s=>({shotCap:2+(s>8),attackCap:2+(s>8)+(s>12),diveRate:.9+s*.035,coolA:4.8,coolB:2.5,globalA:1.34,globalB:.96,capChance:.24,diveShotRate:.66,aimMul:.16,aimClamp:20,aimRnd:3.3,bulletVy:181,bulletVyStage:4}),flight:{scriptedDiveVy:92,randomDiveVy:94,diveAccel:172}}
};
function stageRuleSet(stage){
 for(const key of Object.keys(STAGE_RULES)){
  const rule=STAGE_RULES[key];
  if(stage<=rule.maxStage)return rule;
 }
 return STAGE_RULES.endless;
}
const stageTune=(s,ch)=>{
 if(ch)return CHALLENGE_STAGE_TUNE;
 const tune=stageRuleSet(s).tune;
 return typeof tune==='function'?tune(s):tune;
};
const stageFlightTune=s=>stageRuleSet(s).flight;
const shotCap=()=>S.t?S.t.shotCap:0;
const recTime=()=>REC?+((performance.now()-REC.t0)/1000).toFixed(3):0;
const playLane=x=>cl(Math.round((cl(+x||0,0,PLAY_W)/(PLAY_W||1))*9),0,9);
const snapshot=()=>({started:!!started,paused:!!paused,attract:{active:!!ATTRACT.active,phase:ATTRACT.phase||''},stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1),challenge:!!S.challenge,scriptMode:!!S.scriptMode,profile:S.profile?.name||'classic',player:{x:+S.p.x.toFixed(2),y:+S.p.y.toFixed(2),dual:!!S.p.dual,captured:!!S.p.captured,pending:!!S.p.pending},counts:{enemies:S.e.filter(e=>e.hp>0).length,playerBullets:S.pb.length,enemyBullets:S.eb.length,effects:S.fx.length,attackers:S.att}});
const enemyRef=e=>e?{id:e.id,enemyType:e.t,enemyFamily:e.fam||'classic',column:e.c,row:e.r,lane:playLane(e.x),dive:e.dive,carry:!!e.carry}:null;
function loadScoreboard(){
 try{
  return JSON.parse(readPref(SCOREBOARD_KEY)||'[]').filter(x=>x&&Number.isFinite(+x.score)).map(x=>({id:String(x.id||''),initials:String(x.initials||'---').toUpperCase().replace(/[^A-Z]/g,'').padEnd(3,'-').slice(0,3),score:+x.score|0,stage:+x.stage|0,at:String(x.at||'')})).sort((a,b)=>b.score-a.score).slice(0,10);
 }catch{return[]}
}
function saveScoreboard(list){
 writePref(SCOREBOARD_KEY,JSON.stringify(list.slice(0,10)));
}
function formatScore(v){return String(Math.max(0,v|0)).padStart(6,'0')}
function sanitizeInitials(txt=''){return String(txt).toUpperCase().replace(/[^A-Z]/g,'').slice(0,3)}
function cycleInitial(ch='A',dir=1){
 const code=((String(ch||'A').charCodeAt(0)-65+dir+26)%26)+65;
 return String.fromCharCode(code);
}
function challengeGroupBonus(stage){
 if(stage>=12)return 3000;
 if(stage>=8)return 2000;
 return 1000;
}
function hitMissRatio(stats){
 if(!stats?.shots)return 0;
 return Math.round((stats.hits/stats.shots)*100);
}
function buildResultsHtml(stats,score,stage){
 const shots=Math.max(0,stats?.shots|0),hits=Math.max(0,stats?.hits|0),ratio=hitMissRatio(stats);
 return `<span class="gameOverTitle">GAME OVER</span><span class="gameOverSub">RESULTS</span><span class="resultsTable"><span class="resultsLabel">SHOTS FIRED</span><span class="resultsValue">${shots}</span><span class="resultsLabel">NUMBER OF HITS</span><span class="resultsValue">${hits}</span><span class="resultsLabel">HIT-MISS RATIO</span><span class="resultsValue">${ratio}%</span><span class="resultsLabel">SCORE</span><span class="resultsValue">${formatScore(score)}</span><span class="resultsLabel">STAGE</span><span class="resultsValue">${String(stage).padStart(2,'0')}</span></span><span class="gameOverFoot blinkPrompt"><span class="k">Enter</span> to continue</span>`;
}
function recordScore(score,stage){
 const entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,initials:'YOU',score:score|0,stage:stage|0,at:new Date().toISOString()};
 const board=loadScoreboard();
 board.push(entry);
 board.sort((a,b)=>b.score-a.score||b.stage-a.stage||a.at.localeCompare(b.at));
 const top=board.slice(0,10);
 saveScoreboard(top);
 S.best=top[0]?.score||0;
 writePref(BEST_SCORE_KEY,String(S.best));
 return{entry,board:top,rank:top.findIndex(x=>x.id===entry.id)+1};
}
function saveGameOverInitials(){
 if(!gameOverState?.entryId)return;
 const board=loadScoreboard();
 const row=board.find(x=>x.id===gameOverState.entryId);
  if(row){
  row.initials=sanitizeInitials(gameOverState.initials.join('')).padEnd(3,'-');
  saveScoreboard(board);
 }
}
function buildGameOverHtmlFromState(){
 if(!gameOverState)return '';
 if(gameOverState.phase==='results')return buildResultsHtml(gameOverState.stats,gameOverState.score,gameOverState.stage);
 const board=leaderboardRowsForView();
 const filled=(board.length?board:Array.from({length:10},(_,i)=>({initials:'---',score:0,stage:0,idx:i+1})));
 const rows=filled.map((row,i)=>`<span class="scoreRank${row.id===gameOverState.entryId?' scoreHot':''}">${String((row.idx||i+1)).padStart(2,'0')}</span><span class="scoreName${row.id===gameOverState.entryId?' scoreHot':''}">${row.initials}</span><span class="scoreValue${row.id===gameOverState.entryId?' scoreHot':''}">${formatScore(row.score)}</span><span class="scoreStage${row.id===gameOverState.entryId?' scoreHot':''}">${String(row.stage).padStart(2,' ')}</span>`).join('');
 const rankTxt=gameOverState.rank?`YOUR RANK ${String(gameOverState.rank).padStart(2,'0')}`:'SCORE NOT IN TOP 10';
 const boardTitle=currentLeaderboardTitle();
 let entryHtml='';
 let footHtml='<span class="gameOverFoot blinkPrompt"><span class="k">Enter</span> to play again</span>';
 if(gameOverState.editing){
  const shown=gameOverState.initials.map((ch,i)=>`<span class="entrySlot${i===gameOverState.cursor?' entryCursor':''}">${ch||'_'}</span>`).join('');
  entryHtml=`<span class="gameOverEntry"><span class="entryLabel">ENTER INITIALS</span><span class="entrySlots">${shown}</span></span>`;
  footHtml='<span class="gameOverFoot"><span class="gameOverFootLine"><span class="k">Left/Right</span> select, <span class="k">Up/Down</span> change</span><span class="gameOverFootLine">type letters or press <span class="k">Enter</span> to save</span></span>';
 }
 return `<span class="gameOverTitle">GAME OVER</span><span class="gameOverSub">${boardTitle}</span><span class="gameOverMeta">${rankTxt}</span>${entryHtml}<span class="scoreTable"><span class="scoreHead scoreRank">NO</span><span class="scoreHead scoreName">ID</span><span class="scoreHead scoreValue">SCORE</span><span class="scoreHead scoreStage">STG</span>${rows}</span>${footHtml}`;
}
function buildAttractScoreboardHtml(){
 const board=leaderboardRowsForView();
 const boardTitle=currentLeaderboardTitle();
 const rows=(board.length?board:Array.from({length:10},(_,i)=>({initials:'---',score:0,stage:0,idx:i+1}))).map((row,i)=>`<span class="scoreRank">${String((row.idx||i+1)).padStart(2,'0')}</span><span class="scoreName">${row.initials}</span><span class="scoreValue">${formatScore(row.score)}</span><span class="scoreStage">${String(row.stage).padStart(2,' ')}</span>`).join('');
 return `<span class="gameOverTitle">HIGH SCORES</span><span class="gameOverSub">${boardTitle}</span><span class="scoreTable"><span class="scoreHead scoreRank">NO</span><span class="scoreHead scoreName">ID</span><span class="scoreHead scoreValue">SCORE</span><span class="scoreHead scoreStage">STG</span>${rows}</span><span class="gameOverFoot blinkPrompt"><span class="k">Enter</span> to start</span>`;
}
function buildGameOverState(score,stage){
 const res=recordScore(score,stage);
 const editing=!!res.rank;
 return{
  entryId:res.entry.id,
  rank:res.rank,
  phase:'results',
  score:score|0,
  stage:stage|0,
  stats:{shots:S.stats.shots|0,hits:S.stats.hits|0},
  initials:['Y','O','U'],
  cursor:0,
  editing,
  remoteSubmitted:0
 };
}
function resetAttractBackdrop(){
 S.pb.length=0;S.eb.length=0;S.fx.length=0;S.cap=null;S.alertT=0;S.alertTxt='';S.banner=0;S.bannerTxt='';S.bannerMode='';S.bannerSub='';
 for(const e of S.e)e.hp=0;
 S.p.x=PLAY_W/2;S.p.y=PLAY_H-VIS.playerBottom;S.p.vx=0;S.p.cd=0;S.p.inv=0;S.p.dual=0;S.p.captured=0;S.p.returning=0;S.p.pending=0;S.p.spawn=0;S.p.capBoss=null;S.p.capT=0;S.p.hNoShotT=0;S.p.hDebugT=0;S.p.demoTargetId=null;S.p.demoTargetT=0;
}
function enterAttractScores(){
 ATTRACT.active=1;
 ATTRACT.phase='scores';
 ATTRACT.timer=7.5;
 S.attract=1;
 resetAttractBackdrop();
 logEvent('attract_scores',{cycle:ATTRACT.cycle});
}
function runAfterRecordingStops(fn){
 if(typeof fn!=='function')return;
 if(!VIDEO_REC.rec&&!VIDEO_REC.active){fn();return;}
 VIDEO_REC.afterStop.push(fn);
}
function flushAfterRecordingStops(){
 const queued=VIDEO_REC.afterStop.splice(0,VIDEO_REC.afterStop.length);
 for(const fn of queued)try{fn();}catch{}
}
function startAttractDemo(opts={}){
 const record=opts.record!==false;
 stopRunRecording();
 autoExportedSessionId='';
 resetSession('attract_demo');
 gameOverHtml='';gameOverState=null;
 aud=0;
 started=0;paused=0;
 syncPauseUi();
 ATTRACT.active=1;
 ATTRACT.phase='demo';
 ATTRACT.timer=11.5;
 ATTRACT.cycle++;
 Object.assign(S,{score:0,lives:2,stage:1,shake:0,banner:0,bannerTxt:'',bannerMode:'',bannerSub:'',seq:0,seqT:.45,rogue:0,alertT:0,alertTxt:'',forceChallenge:0,liveCount:40,recoverT:0,attackGapT:0,nextStageT:0,sequenceT:0,sequenceMode:'',attract:1});
 S.stats={shots:0,hits:0};
 Object.assign(S.p,{dual:0,captured:0,returning:0,pending:0,spawn:0,cd:0,capBoss:null,capT:0,inv:0,vx:0,hNoShotT:0,hDebugT:0,demoTargetId:null,demoTargetT:0});
 logEvent('attract_demo_start',{cycle:ATTRACT.cycle,record});
 if(record)startRunRecording();
 spawnStage();
}
window.startAttractDemo=startAttractDemo;
function stopAttractLoop(){
 ATTRACT.active=0;
 ATTRACT.phase='';
 ATTRACT.timer=0;
 S.attract=0;
 syncPauseUi();
}
const initialBoard=loadScoreboard();
if((initialBoard[0]?.score||0)>S.best){
 S.best=initialBoard[0].score;
 writePref(BEST_SCORE_KEY,String(S.best));
}
function resetSession(reason='boot'){
 sessionN++;
 REC={id:`ngt-${Date.now()}-${sessionN}`,build:BUILD,reason,createdAt:new Date().toISOString(),url:location.href,viewport:{w:innerWidth,h:innerHeight,dpr:window.devicePixelRatio||1},userAgent:navigator.userAgent,events:[],snapshots:[]};
 REC.t0=performance.now();
 recShotT=0;
 if(RNG_SEED)REC.seed=RNG_SEED;
}
function logEvent(type,data={}){
 if(!REC)resetSession();
 REC.events.push(Object.assign({t:recTime(),type},data));
}
let carryDebugLastState='';
let rescueDebugLastState='';
function setCarryDebug(enabled,label='manual'){
 window.__auroraCarryDebug=enabled?1:0;
 carryDebugLastState='';
 rescueDebugLastState='';
 logEvent('carry_debug_toggle',{enabled:!!enabled,label});
}
function carryRelationState(){
 const p=S.p;
 if(p.captured&&p.capBoss&&p.capBoss.hp>0){
  return {
   mode:'captured',
   bossId:p.capBoss.id,
   bossX:+p.capBoss.x.toFixed(2),
   bossY:+p.capBoss.y.toFixed(2),
   fighterX:+p.x.toFixed(2),
   fighterY:+p.y.toFixed(2),
   relation:p.y>p.capBoss.y?'below':'above',
   dive:p.capBoss.dive||0
  };
 }
 const carryingBoss=S.e.find(e=>e.hp>0&&e.carry);
 if(carryingBoss){
  const target=typeof carriedFighterTarget==='function'?carriedFighterTarget(carryingBoss):null;
  return {
   mode:'carried',
   bossId:carryingBoss.id,
   bossX:+carryingBoss.x.toFixed(2),
   bossY:+carryingBoss.y.toFixed(2),
   fighterX:target?+target.x.toFixed(2):null,
   fighterY:target?+target.y.toFixed(2):null,
   relation:target&&target.y<carryingBoss.y?'above':'below',
   dive:carryingBoss.dive||0
  };
 }
 return null;
}
function rescuePodDebugState(){
 if(!S.cap)return null;
 return {
  mode:'rescue_pod',
  x:+S.cap.x.toFixed(2),
  y:+S.cap.y.toFixed(2),
  podMode:S.cap.mode||'fall',
  side:S.cap.side||0,
  playerX:+S.p.x.toFixed(2),
  playerY:+S.p.y.toFixed(2)
 };
}
function logCarryDebugState(reason='tick'){
 if(!window.__auroraCarryDebug)return;
 const state=carryRelationState();
 const key=state?`${state.mode}:${state.bossId}:${state.relation}:${state.dive}`:'none';
 if(key===carryDebugLastState&&reason==='tick')return;
 carryDebugLastState=key;
 logEvent('carry_relation_state',Object.assign({reason},state||{mode:'none'}));
 const rescueState=rescuePodDebugState();
 const rescueKey=rescueState?`${rescueState.podMode}:${rescueState.x}:${rescueState.y}`:'none';
 if(rescueKey!==rescueDebugLastState||reason!=='tick'){
  rescueDebugLastState=rescueKey;
  logEvent('rescue_pod_state',Object.assign({reason},rescueState||{mode:'none'}));
 }
}
window.setCarryDebug=setCarryDebug;
window.logCarryDebugState=logCarryDebugState;
window.getCarryRelationState=carryRelationState;
window.getRescuePodDebugState=rescuePodDebugState;
function logSnapshot(tag='tick'){
 if(!REC)resetSession();
 REC.snapshots.push(Object.assign({t:recTime(),tag},snapshot()));
}
function fireEnemyBullet(e,vx,vy,kind){
 S.eb.push({x:e.x,y:e.y+24,vx,vy,kind,sourceId:e.id,sourceType:e.t,sourceDive:e.dive});
 logEvent('enemy_bullet_fired',Object.assign({stage:S.stage,kind,x:+e.x.toFixed(2),y:+(e.y+24).toFixed(2),vx:+vx.toFixed(2),vy:+vy.toFixed(2),bulletLane:playLane(e.x),playerLane:playLane(S.p.x)},enemyRef(e)));
 sfx.enemyShot();
}
function logEnemyAttackStart(e,mode,extra={}){
 const targetLane=Number.isFinite(extra?.targetX)?playLane(extra.targetX):null;
 logEvent('enemy_attack_start',Object.assign({stage:S.stage,mode,x:+e.x.toFixed(2),y:+e.y.toFixed(2),originLane:playLane(e.x),targetLane,playerLane:playLane(S.p.x)},enemyRef(e),extra));
}
function exportSession(opts={}){
 if(!REC)resetSession();
 if(opts.auto&&autoExportedSessionId===REC.id)return;
 logSnapshot('export');
 const out=JSON.stringify({session:Object.assign({},REC,{duration:recTime(),eventCount:REC.events.length,snapshotCount:REC.snapshots.length})},null,2);
 const file=`neo-galaga-session-${REC.id}.json`;
 downloadBlob(new Blob([out],{type:'application/json'}),file);
 if(opts.auto)autoExportedSessionId=REC.id;
 if(!opts.silent)showToast('Session log downloaded');
}
function loadTestCfg(){
 try{
  const raw=JSON.parse(readPref(TEST_PREF_KEY)||'{}');
  return{stage:cl(+raw.stage||1,1,99)|0,ships:cl(+raw.ships||3,1,9)|0,challenge:!!raw.challenge};
 }catch{return{stage:1,ships:3,challenge:0}}
}
function movementLeftCodes(){
 return ['ArrowLeft','KeyA','ControlLeft'];
}
function movementRightCodes(){
 return ['ArrowRight','KeyD','MetaLeft'];
}
function movementControlCodes(){
 return [...movementLeftCodes(),...movementRightCodes()];
}
function controlMoveHelpHtml(){
 return `ARROWS OR <span class="k">A/D</span> MOVE   <span class="k">CTRL</span> LEFT   <span class="k">COMMAND</span> RIGHT   <span class="k">SPACE</span> FIRE   <span class="k">P</span> PAUSE`;
}
function syncAudioUi(){
 if(!muteToggleBtn)return;
 muteToggleBtn.dataset.muted=audioMuted?'true':'false';
 muteToggleBtn.setAttribute('aria-pressed',audioMuted?'true':'false');
 muteToggleBtn.setAttribute('aria-label',audioMuted?'Unmute game audio':'Mute game audio');
 muteToggleBtn.title=audioMuted?'Game audio muted':'Game audio on';
 const icon=muteToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=audioMuted?'🔇':'🔊';
 if(sfx.bus)sfx.bus.gain.value=audioMuted?0:.9;
}
function syncPauseUi(){
 if(!pauseToggleBtn)return;
 const canPause=!!started;
 const active=!!(started&&paused&&!feedbackOpen&&!helpOpen&&!settingsOpen);
 pauseToggleBtn.disabled=!canPause;
 pauseToggleBtn.dataset.paused=active?'true':'false';
 pauseToggleBtn.setAttribute('aria-pressed',active?'true':'false');
 pauseToggleBtn.setAttribute('aria-label',active?'Resume game':'Pause game');
 pauseToggleBtn.title=!canPause?'Pause available during active play':(active?'Resume game':'Pause game');
 const icon=pauseToggleBtn.querySelector('.dockIcon');
 if(icon)icon.textContent=active?'▶':'⏸';
 pauseToggleBtn.classList.toggle('active',active);
}
function toggleGameplayPause(){
 if(!started)return;
 paused=!paused;
 if(!paused&&settingsOpen)closeSettings();
 syncPauseUi();
}
function setAudioMuted(next,opts={}){
 audioMuted=!!next;
 writePref(AUDIO_MUTED_PREF_KEY,audioMuted?'1':'0');
 syncAudioUi();
 if(!opts.silent)showToast(audioMuted?'Game audio muted':'Game audio on');
}
function syncBuildStampUi(){
 if(!buildStamp)return;
 const override=window.__auroraBuildStampOverride;
 if(override){
  buildStamp.classList.remove('production');
  buildStamp.classList.add('replay');
  if(buildStampChannel)buildStampChannel.textContent=override.channel||'';
  if(buildStampVersion)buildStampVersion.textContent=override.version||'';
  if(buildStampRelease)buildStampRelease.textContent=override.release||'';
  return;
 }
 buildStamp.classList.remove('replay');
 const channel=String(BUILD_INFO.releaseChannel||'').toLowerCase();
 const production=channel==='production';
 buildStamp.classList.toggle('production',production);
 if(buildStampChannel)buildStampChannel.textContent=`Lane ${BUILD_INFO.releaseChannel}`;
 if(buildStampVersion)buildStampVersion.textContent=production?`Version ${BUILD_INFO.version}`:`Version ${BUILD_INFO.label}`;
 if(buildStampRelease)buildStampRelease.textContent=production?'':BUILD_INFO.released;
}
function saveTestCfg(){
 const cfg={stage:cl(+testStage.value||1,1,99)|0,ships:cl(+testShips.value||3,1,9)|0,challenge:!!testChallenge.checked};
 testStage.value=cfg.stage;testShips.value=cfg.ships;testChallenge.checked=cfg.challenge;
 writePref(TEST_PREF_KEY,JSON.stringify(cfg));
 return cfg;
}
function syncSettingsUi(){
 settingsPanel.classList.toggle('open',settingsOpen);
 settingsPanel.setAttribute('aria-hidden',settingsOpen?'false':'true');
 settingsBtn.classList.toggle('open',settingsOpen);
 settingsBtn.setAttribute('aria-expanded',settingsOpen?'true':'false');
}
function syncHelpUi(){
 if(!helpModal)return;
 helpModal.classList.toggle('open',helpOpen);
 helpModal.setAttribute('aria-hidden',helpOpen?'false':'true');
 if(guideDockBtn){
  const open=helpOpen&&helpMode==='guide';
  guideDockBtn.classList.toggle('open',open);
  guideDockBtn.setAttribute('aria-expanded',open?'true':'false');
 }
 if(controlsDockBtn){
  const open=helpOpen&&helpMode==='controls';
  controlsDockBtn.classList.toggle('open',open);
  controlsDockBtn.setAttribute('aria-expanded',open?'true':'false');
 }
 helpTabButtons.forEach(btn=>{
  const active=btn.dataset.helpTab===helpMode;
  btn.setAttribute('aria-selected',active?'true':'false');
  btn.classList.toggle('active',active);
 });
 helpPanels.forEach(panel=>{
  const active=panel.dataset.helpPanel===helpMode;
  panel.hidden=!active;
  panel.classList.toggle('visible',active);
 });
 if(helpGuideFrame&&helpMode==='guide'&&!helpGuideFrame.src)helpGuideFrame.src=playersGuideUrl();
}
function syncTestUi(){
 const cfg=loadTestCfg();
 testStage.value=cfg.stage;testShips.value=cfg.ships;testChallenge.checked=cfg.challenge;
 syncAudioUi();
 syncPauseUi();
 syncSettingsUi();
 syncHelpUi();
}
function closeSettings(){
 if(settingsOpen&&started)paused=settingsPrevPaused;
 settingsOpen=0;
 syncSettingsUi();
 syncPauseUi();
}
function openSettings(){
 settingsPrevPaused=paused;
 if(started&&!paused)paused=1;
 settingsOpen=1;
 syncSettingsUi();
 syncPauseUi();
}
function logViewerUrl(){
 return 'http://127.0.0.1:4311/';
}
function projectGuideUrl(){
 return `${location.origin}${location.pathname.replace(/[^/]*$/,'')}project-guide.html`;
}
function playersGuideUrl(){
 return `${location.origin}${location.pathname.replace(/[^/]*$/,'')}player-guide.html`;
}
function openProjectGuide(){
 const win=window.open(projectGuideUrl(), '_blank', 'noopener');
 if(win){
  try{win.focus();}catch{}
  showToast('Opened project guide');
 }else showToast('Allow popups to open the project guide');
}
function openPlayersGuideWindow(){
 const win=window.open(playersGuideUrl(), '_blank', 'noopener');
 if(win){
  try{win.focus();}catch{}
  showToast('Opened players guide');
 }else showToast('Allow popups to open the players guide');
}
function openHelp(mode='controls'){
 if(helpOpen&&helpMode===mode)return;
 closeSettings();
 if(feedbackOpen)closeFeedback(1);
 helpPrevPaused=paused;
 if(started&&!paused)paused=1;
 helpMode=mode==='guide'?'guide':'controls';
 helpOpen=1;
 keys={};keyState={};
 logEvent('help_open',{mode:helpMode});
 syncHelpUi();
 syncPauseUi();
 setTimeout(()=>{
  const target=helpMode==='guide'?helpOpenWindowBtn:helpTabButtons.find(btn=>btn.dataset.helpTab===helpMode);
  target?.focus?.();
 },0);
}
function closeHelp(force=0){
 if(!helpOpen&&!force)return;
 helpOpen=0;
 if(started)paused=helpPrevPaused;
 logEvent('help_close',{force:!!force,mode:helpMode});
 syncHelpUi();
 syncPauseUi();
}
function setHelpMode(mode='controls'){
 helpMode=mode==='guide'?'guide':'controls';
 if(helpOpen)logEvent('help_tab',{mode:helpMode});
 syncHelpUi();
}
function openLogViewer(){
 const win=window.open(logViewerUrl(), '_blank', 'noopener');
 if(win){
  try{win.focus();}catch{}
  showToast('Opened log viewer');
 }else showToast('Allow popups to open the log viewer');
}
function downloadBlob(blob,file){
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=file;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function videoRecordSupported(){return !!(c.captureStream&&window.MediaRecorder);}
function localReplaySupported(){
 return !!(window.AuroraReplayStore&&typeof window.AuroraReplayStore.supported==='function'&&window.AuroraReplayStore.supported());
}
function shouldCaptureRunVideo(){
 return videoRecordSupported()&&(VIDEO_REC.enabled||localReplaySupported());
}
function pickVideoMime(){
 const list=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
 for(const m of list)if(!window.MediaRecorder||!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(m))return m;
 return '';
}
function syncRecordUi(){
 const supported=videoRecordSupported();
 recordBtn.disabled=!supported;
 recordBtn.classList.toggle('active',VIDEO_REC.enabled||VIDEO_REC.active);
 recordBtn.textContent=supported?(VIDEO_REC.active?(VIDEO_REC.enabled?'Recording Video...':'Recording Replay...'):`Auto Video: ${VIDEO_REC.enabled?'On':'Off'}`):'Auto Video: Unsupported';
}
function currentReplayMeta(){
 return {
  id:VIDEO_REC.sessionId||REC?.id||`replay-${Date.now()}`,
  source:'game_native',
  build:BUILD,
  createdAt:REC?.createdAt||new Date().toISOString(),
  duration:recTime(),
  score:S.score|0,
  stage:S.stage|0,
  challenge:!!S.challenge,
  attract:!!S.attract,
  reason:REC?.reason||'unknown',
  persona:S.harnessPersona||null,
  stats:{shots:S.stats?.shots|0,hits:S.stats?.hits|0}
 };
}
async function persistLocalReplay(blob,meta){
 if(!blob||!meta||!localReplaySupported())return;
 if(meta.attract||meta.reason!=='game_start'||meta.duration<3)return;
 try{
  await window.AuroraReplayStore.saveReplay(Object.assign({},meta,{
   blob,
   mime:blob.type||VIDEO_REC.mime||'video/webm'
  }));
  if(typeof window.refreshMovieCatalog==='function')window.refreshMovieCatalog({silent:1});
 }catch(err){
  console.warn('local replay save failed',err);
 }
}
function stopRunRecording(){
 if(!VIDEO_REC.active||!VIDEO_REC.rec){flushAfterRecordingStops();return;}
 VIDEO_REC.active=0;
 VIDEO_REC.stopMeta=currentReplayMeta();
 if(sfx.recOsc){try{sfx.recOsc.stop();}catch{}try{sfx.recOsc.disconnect();}catch{}sfx.recOsc=null}
 if(sfx.recGain){try{sfx.recGain.disconnect();}catch{}sfx.recGain=null}
 const rec=VIDEO_REC.rec;
 VIDEO_REC.rec=null;
 try{rec.stop();}catch{}
 syncRecordUi();
}
function startRunRecording(){
 if(!shouldCaptureRunVideo())return;
 if(VIDEO_REC.active)stopRunRecording();
 const mime=pickVideoMime();
 VIDEO_REC.mime=mime;
 const videoStream=c.captureStream(60),stream=new MediaStream();
 for(const t of videoStream.getVideoTracks())stream.addTrack(t);
 if(VIDEO_REC_INCLUDE_AUDIO&&sfx.tap){
  const A=AC();A.resume?.();
  sfx.recGain=A.createGain();
  sfx.recGain.gain.value=.00035;
  sfx.recOsc=A.createOscillator();
  sfx.recOsc.type='sine';
  sfx.recOsc.frequency.value=23;
  sfx.recOsc.connect(sfx.recGain);
  sfx.recGain.connect(sfx.tap);
  sfx.recOsc.start();
  for(const t of sfx.tap.stream.getAudioTracks())stream.addTrack(t);
 }
 VIDEO_REC.stream=stream;
 const chunks=[];
 VIDEO_REC.chunks=chunks;
 VIDEO_REC.sessionId=REC?.id||`run-${Date.now()}`;
 VIDEO_REC.file=`neo-galaga-video-${VIDEO_REC.sessionId}.webm`;
 VIDEO_REC.stopMeta=null;
 const file=VIDEO_REC.file;
 const currentStream=VIDEO_REC.stream;
 const rec=mime?new MediaRecorder(currentStream,{mimeType:mime}):new MediaRecorder(currentStream);
 rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
 rec.onstop=()=>{
  const blob=new Blob(chunks,{type:mime||'video/webm'});
  const replayMeta=VIDEO_REC.stopMeta||currentReplayMeta();
  if(currentStream)for(const t of currentStream.getTracks())t.stop();
  if(VIDEO_REC.stream===currentStream)VIDEO_REC.stream=null;
  if(VIDEO_REC.chunks===chunks)VIDEO_REC.chunks=[];
  if(blob.size>0){
   persistLocalReplay(blob,replayMeta);
   if(VIDEO_REC.enabled){
    downloadBlob(blob,file);
    showToast('Run video downloaded');
   }
  }
  VIDEO_REC.stopMeta=null;
  flushAfterRecordingStops();
 };
 rec.start(1000);
 VIDEO_REC.rec=rec;
 VIDEO_REC.active=1;
 syncRecordUi();
}
function exportAndReturnToWaitMode(reason='manual_capture_reset'){
 if(!REC)resetSession();
 logEvent('capture_export_reset',{reason,started:!!started,attract:!!ATTRACT.active,stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1)});
 exportSession({silent:1});
 const finish=()=>{
  if(feedbackOpen)closeFeedback();
  if(settingsOpen)closeSettings();
  gameOverHtml='';gameOverState=null;
  startAttractDemo({record:false});
  showToast('Run exported, returned to wait mode');
 };
 if(VIDEO_REC.rec||VIDEO_REC.active){
  runAfterRecordingStops(finish);
  stopRunRecording();
 }else finish();
}

function setFeedbackStatus(t='',err=0){
 feedbackStatus.textContent=t;
 feedbackStatus.className=err?'err':'';
}
function showToast(t){
 feedbackToast.textContent=t;
 feedbackToast.classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>feedbackToast.classList.remove('show'),1700);
}
function openFeedback(){
 if(feedbackOpen)return;
 closeSettings();
 if(helpOpen)closeHelp(1);
 feedbackPrevPaused=paused;paused=1;feedbackOpen=1;keys={};keyState={};
 logEvent('feedback_open');
 feedbackModal.classList.add('open');
 feedbackModal.setAttribute('aria-hidden','false');
 if(feedbackDockBtn){
  feedbackDockBtn.classList.add('open');
  feedbackDockBtn.setAttribute('aria-expanded','true');
 }
 setFeedbackStatus('');
 syncPauseUi();
 setTimeout(()=>fbSummary.focus(),0);
}
function closeFeedback(force=0){
 if(!feedbackOpen||(!force&&feedbackBusy))return;
 feedbackOpen=0;paused=feedbackPrevPaused;
 logEvent('feedback_close',{force:!!force});
 feedbackModal.classList.remove('open');
 feedbackModal.setAttribute('aria-hidden','true');
 if(feedbackDockBtn){
  feedbackDockBtn.classList.remove('open');
  feedbackDockBtn.setAttribute('aria-expanded','false');
 }
 syncPauseUi();
}
function openMailFallback(subject,lines){
 window.location.href=`mailto:${MODEM_FEATURE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
async function submitFeedback(ev){
 ev.preventDefault();
 if(feedbackBusy)return;
 const now=Date.now(),wait=FEEDBACK_RATE_MS-(now-feedbackLastSubmit);
 if(wait>0){setFeedbackStatus(`Please wait ${Math.ceil(wait/1000)}s before sending another report.`,1);return;}
 const type=fbType.value==='feature_request'?'feature_request':'bug_report';
 const title=fbSummary.value.trim().replace(/\s+/g,' ');
 const description=fbDescription.value.trim();
 if(title.length<4){setFeedbackStatus('Title must be at least 4 characters.',1);return;}
 if(description.length<10){setFeedbackStatus('Description must be at least 10 characters.',1);return;}
 feedbackBusy=1;
 setFeedbackStatus('Sending feedback...');
  const payload={
  type,title,description,
  timestamp:new Date(now).toISOString(),
  game:{name:PRODUCT_NAME,version:BUILD,url:location.href,user_agent:navigator.userAgent,language:navigator.language},
  game_state:{stage:S.stage,score:S.score,lives:Math.max(0,S.lives+1),started:!!started,paused:!!paused,challenge:!!S.challenge,attract:!!ATTRACT.active}
 };
 const kind=type==='feature_request'?'Feature Request':'Bug Report';
 const subject=`[${kind}] ${title}`;
 const lines=[
  description,'',
  '---',
  `Type: ${kind}`,
  `Build: ${BUILD}`,
  `Timestamp: ${payload.timestamp}`,
  `URL: ${location.href}`,
  `Stage: ${S.stage}`,
  `Score: ${S.score}`,
  `Lives: ${Math.max(0,S.lives+1)}`,
  `Started: ${started?1:0}`,
  `Paused: ${paused?1:0}`,
  `Challenge: ${S.challenge?1:0}`,
  `User-Agent: ${navigator.userAgent}`
 ];
 try{
  const r=await fetch(FORMSUBMIT_ENDPOINT,{
   method:'POST',
   headers:{'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify({
    _subject:subject,
    _template:'table',
    product:PRODUCT_NAME,
    type:kind,
    title,
    description,
    build:BUILD,
    timestamp:payload.timestamp,
    url:location.href,
    stage:S.stage,
    score:S.score,
    lives:Math.max(0,S.lives+1),
    started:started?1:0,
    paused:paused?1:0,
    challenge:S.challenge?1:0,
    user_agent:navigator.userAgent,
    message:lines.join('\n')
   })
  });
  const data=await r.json().catch(()=>null);
  if(!r.ok||data?.success===false)throw new Error(data?.message||`HTTP ${r.status}`);
  feedbackLastSubmit=now;
  fbType.value='bug_report';fbSummary.value='';fbDescription.value='';
  setFeedbackStatus('Sent to Modem inbox.');
  showToast('Feedback sent');
  setTimeout(()=>closeFeedback(),220);
 }catch(err){
  openMailFallback(subject,lines);
  setFeedbackStatus('FormSubmit could not send directly. Opened mail draft fallback.',1);
  showToast('Mail fallback opened');
 }
 feedbackBusy=0;
 return;
}

function rs(){
 DPR=window.devicePixelRatio||1;
 c.width=innerWidth*DPR;c.height=innerHeight*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
 ctx.imageSmoothingEnabled=false;
 if(!S.st.length){
  const cols=['#f7f9ff','#8bb8ff','#72e18c','#f0c766','#d27cff','#ff8b7a'];
  for(let i=0;i<156;i++)S.st.push({x:rnd(PLAY_W),y:rnd(PLAY_H),z:rnd(.88,.16),s:rnd(1.05,.45),c:cols[(randUnit()*cols.length)|0],tw:rnd(6.28)});
 }
 VIS.gx=17;VIS.gy=14;VIS.playerBottom=20;VIS.beamLen=300;VIS.formTop=28;
 S.p.x=PLAY_W/2;S.p.y=PLAY_H-VIS.playerBottom;
}
addEventListener('resize',rs);
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}
settingsBtn.addEventListener('click',()=>{settingsOpen=!settingsOpen;syncSettingsUi();});
if(openViewerBtn)openViewerBtn.addEventListener('click',()=>{openLogViewer();closeSettings();});
if(openProjectGuideBtn)openProjectGuideBtn.addEventListener('click',()=>{openProjectGuide();closeSettings();});
if(guideDockBtn)guideDockBtn.addEventListener('click',()=>openHelp('guide'));
if(controlsDockBtn)controlsDockBtn.addEventListener('click',()=>openHelp('controls'));
if(feedbackDockBtn)feedbackDockBtn.addEventListener('click',openFeedback);
if(helpClose)helpClose.addEventListener('click',()=>closeHelp());
if(helpOpenWindowBtn)helpOpenWindowBtn.addEventListener('click',openPlayersGuideWindow);
helpTabButtons.forEach(btn=>btn.addEventListener('click',()=>setHelpMode(btn.dataset.helpTab)));
exportBtn.addEventListener('click',exportSession);
recordBtn.addEventListener('click',()=>{
 if(VIDEO_REC.active)return;
 VIDEO_REC.enabled=!VIDEO_REC.enabled;
 writePref(RECORD_PREF_KEY,VIDEO_REC.enabled?'1':'0');
 showToast(VIDEO_REC.enabled?'Auto video enabled':'Auto video disabled');
 syncRecordUi();
});
for(const el of [testStage,testShips,testChallenge])el.addEventListener('change',saveTestCfg);
for(const el of [testStage,testShips])el.addEventListener('input',saveTestCfg);
if(muteToggleBtn)muteToggleBtn.addEventListener('click',()=>setAudioMuted(!audioMuted,{silent:0}));
if(pauseToggleBtn)pauseToggleBtn.addEventListener('click',toggleGameplayPause);
fbCancel.addEventListener('click',()=>closeFeedback());
if(helpModal)helpModal.addEventListener('click',e=>{if(e.target===helpModal)closeHelp();});
feedbackModal.addEventListener('click',e=>{if(e.target===feedbackModal)closeFeedback();});
settingsPanel.addEventListener('click',e=>e.stopPropagation());
feedbackForm.addEventListener('submit',submitFeedback);
function keyboardTargetIsEditable(target){
 if(!target||typeof target.closest!=='function')return false;
 return !!target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}
addEventListener('keydown',e=>{
 const typingTarget=keyboardTargetIsEditable(e.target);
 const wasDown=!!keys[e.code];
 const now=performance.now();
 logEvent('key_down',{code:e.code,key:e.key,repeat:!!e.repeat,alreadyDown:wasDown});
 if(e.code==='F1'||e.key==='?'){e.preventDefault();openFeedback();return;}
 if(helpOpen){if(e.code==='Escape'){e.preventDefault();closeHelp();}return;}
 if(feedbackOpen){if(e.code==='Escape'){e.preventDefault();closeFeedback();}return;}
 if(typeof isMoviePanelOpen==='function'&&isMoviePanelOpen()){if(e.code==='Escape'){e.preventDefault();closeMoviePanel();}return;}
 if(settingsOpen&&e.code==='Escape'){e.preventDefault();closeSettings();return;}
 if(typeof closeAccountPanel==='function'&&e.code==='Escape')closeAccountPanel();
 if(!typingTarget&&e.code==='KeyL'){e.preventDefault();exportSession();return;}
 if(!typingTarget&&e.code==='KeyX'&&(started||ATTRACT.active)){e.preventDefault();exportAndReturnToWaitMode('manual_hotkey');return;}
 if(typingTarget){
  if(e.code==='Escape'&&settingsOpen){e.preventDefault();closeSettings();}
  return;
 }
 keys[e.code]=1;
 if(!wasDown)keyState[e.code]={downAt:now,upAt:0};
 if([...movementControlCodes(),'Space'].includes(e.code))e.preventDefault();
 if(e.code==='KeyF')toggleFullscreen();
 if(e.code==='KeyU')S.ultra=S.ultra?0:1;
 if(e.code==='KeyT'){
  e.preventDefault();
  if(settingsOpen)closeSettings();
  else openSettings();
  return;
 }
 if(!started&&gameOverState){
  if(gameOverState.phase==='results'){
   if(e.code==='Enter'){
    e.preventDefault();
    gameOverState.phase='scoreboard';
    if(!gameOverState.editing)submitGameOverScore();
    gameOverHtml=buildGameOverHtmlFromState();
   }
   return;
  }
 }
 if(!started&&gameOverState?.editing){
  if(e.code==='Enter'){
   e.preventDefault();
   saveGameOverInitials();
   gameOverState.editing=0;
   submitGameOverScore();
   sfx.uiConfirm();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='ArrowLeft'){
   e.preventDefault();
   gameOverState.cursor=Math.max(0,gameOverState.cursor-1);
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='ArrowRight'){
   e.preventDefault();
   gameOverState.cursor=Math.min(2,gameOverState.cursor+1);
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='ArrowUp'||e.code==='ArrowDown'){
   e.preventDefault();
   gameOverState.initials[gameOverState.cursor]=cycleInitial(gameOverState.initials[gameOverState.cursor],e.code==='ArrowUp'?1:-1);
   saveGameOverInitials();
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  if(e.code==='Backspace'){
   e.preventDefault();
   gameOverState.cursor=Math.max(0,gameOverState.cursor-1);
    gameOverState.initials[gameOverState.cursor]='A';
   saveGameOverInitials();
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
  const m=e.code.match(/^Key([A-Z])$/);
  if(m){
   e.preventDefault();
   gameOverState.initials[gameOverState.cursor]=m[1];
   gameOverState.cursor=Math.min(2,gameOverState.cursor+1);
   saveGameOverInitials();
   sfx.uiTick();
   gameOverHtml=buildGameOverHtmlFromState();
   return;
  }
 }
 if(!started&&e.code==='Enter'){
  if(gameOverState&&!gameOverState.editing)submitGameOverScore();
  stopAttractLoop();start();
 }
 if(started&&e.code==='KeyP'){
  toggleGameplayPause();
 }
 if((!aud||sfx.a?.state==='suspended')&&['Enter','Space'].includes(e.code)){aud=1;AC().resume?.();}
});
addEventListener('keyup',e=>{
 keys[e.code]=0;
 if(!keyState[e.code])keyState[e.code]={downAt:0,upAt:performance.now()};
 else keyState[e.code].upAt=performance.now();
 logEvent('key_up',{code:e.code,key:e.key});
});
addEventListener('pointerdown',e=>{
 if(!settingsOpen)return;
 if(e.target===settingsBtn||settingsPanel.contains(e.target))return;
 closeSettings();
});
syncTestUi();
syncBuildStampUi();

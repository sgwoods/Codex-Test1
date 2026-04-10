// Platinum pack registry with Aurora-owned metadata, capability flags, themes, and scoring rules.

const AURORA_STAGE_BAND_PROFILES=Object.freeze([
 {name:'classic',beeFamily:'classic',butFamily:'classic',bossFamily:'classic',challengeFamily:'classic',pulseX:1,pulseY:1,entryX:1,entryY:1,weave:1,steer:1,jitter:1,diveVy:1,diveAccel:1},
 {name:'scorpion',beeFamily:'scorpion',butFamily:'scorpion',bossFamily:'classic',challengeFamily:'classic',pulseX:.95,pulseY:.8,entryX:.92,entryY:.9,weave:1.18,steer:.96,jitter:1.1,diveVy:.98,diveAccel:1},
 {name:'stingray',beeFamily:'stingray',butFamily:'stingray',bossFamily:'stingray',challengeFamily:'dragonfly',pulseX:1.08,pulseY:.78,entryX:1.06,entryY:.82,weave:1.28,steer:1.06,jitter:1.16,diveVy:1.04,diveAccel:1.03},
 {name:'galboss',beeFamily:'galboss',butFamily:'galboss',bossFamily:'galboss',challengeFamily:'mosquito',pulseX:.9,pulseY:.72,entryX:.88,entryY:.76,weave:.9,steer:.9,jitter:.92,diveVy:1.02,diveAccel:.98}
]);

const AURORA_ATMOSPHERE_THEMES=Object.freeze({
 'classic-arcade':Object.freeze({
  id:'classic-arcade',
  label:'Classic Arcade',
  group:'classic',
  starfield:Object.freeze({
   id:'classic-arcade-stars',
   count:108,
   sizeMin:.95,
   sizeMax:1.55,
   alphaMin:.52,
   alphaMax:.96,
   twinkleMin:.88,
   twinkleAmp:.2,
   speedMin:11,
   speedMax:27,
   palette:Object.freeze(['#ffffff','#d8ecff','#8bb8ff','#1e52ff','#fff36a','#ffb21f','#9cff71','#ff3b33','#db38ff','#3fe7ff','#d7a4ff'])
  }),
  backgrounds:Object.freeze({
   frontDoor:'classic-stars',
   wait:'classic-stars',
   demo:'classic-stars',
   stage:'classic-stars',
   challenge:'classic-stars'
  }),
  audioTheme:'classic-arcade'
 }),
 'aurora-hint':Object.freeze({
  id:'aurora-hint',
  label:'Aurora Hint',
  group:'aurora',
  starfield:Object.freeze({
   id:'aurora-hint-stars',
   count:92,
   sizeMin:.88,
   sizeMax:1.35,
   alphaMin:.34,
   alphaMax:.7,
   twinkleMin:.84,
   twinkleAmp:.16,
   speedMin:8,
   speedMax:20,
   palette:Object.freeze(['#f7f9ff','#8fd7ff','#72e18c','#f0c766','#d27cff','#ff8b7a','#3fe7ff','#c8ffcf'])
  }),
  backgrounds:Object.freeze({
   frontDoor:'aurora-borealis',
   wait:'aurora-borealis',
   demo:'aurora-hint',
   stage:'aurora-hint',
   challenge:'aurora-hint'
  }),
  audioTheme:'aurora-rise'
 }),
 'aurora-borealis':Object.freeze({
  id:'aurora-borealis',
  label:'Aurora Borealis',
  group:'aurora',
  starfield:Object.freeze({
   id:'aurora-borealis-stars',
   count:88,
   sizeMin:.88,
   sizeMax:1.28,
   alphaMin:.28,
   alphaMax:.64,
   twinkleMin:.82,
   twinkleAmp:.14,
   speedMin:8,
   speedMax:18,
   palette:Object.freeze(['#f7fbff','#9edfff','#6bf5bf','#ffe27a','#cf92ff','#38dfff','#ffb5cf'])
  }),
  backgrounds:Object.freeze({
   frontDoor:'aurora-borealis',
   wait:'aurora-borealis',
   demo:'aurora-borealis',
   stage:'aurora-borealis',
   challenge:'aurora-borealis'
  }),
  audioTheme:'aurora-surge'
 }),
 'aurora-crown':Object.freeze({
  id:'aurora-crown',
  label:'Aurora Crown',
  group:'aurora',
  starfield:Object.freeze({
   id:'aurora-crown-stars',
   count:84,
   sizeMin:.9,
   sizeMax:1.26,
   alphaMin:.3,
   alphaMax:.68,
   twinkleMin:.84,
   twinkleAmp:.15,
   speedMin:8,
   speedMax:18,
   palette:Object.freeze(['#ffffff','#aef1ff','#8dffd5','#ffe38f','#d5a0ff','#3fe7ff','#ffc7d8'])
  }),
  backgrounds:Object.freeze({
   frontDoor:'aurora-borealis',
   wait:'aurora-borealis',
   demo:'aurora-borealis',
   stage:'aurora-borealis',
   challenge:'aurora-borealis'
  }),
  audioTheme:'aurora-crown'
 })
});

const AURORA_AUDIO_THEMES=Object.freeze({
 'classic-arcade':Object.freeze({
  id:'classic-arcade',
  label:'Classic Arcade',
  cues:Object.freeze({
   gameStart:Object.freeze({seq:[523,659,784],step:.055,wave:'square',volume:.02,slide:24,lpHz:3600,tones:Object.freeze([{freq:392,duration:.18,wave:'triangle',volume:.018,slide:110,detune:.005,lpHz:2500,delay:.02}])}),
   playerShot:Object.freeze({tones:Object.freeze([{freq:1140,duration:.028,wave:'square',volume:.006,slide:-620,detune:.006,lpHz:6200},{freq:1520,duration:.018,wave:'square',volume:.003,slide:-480,detune:-.004,lpHz:6800,delay:.006}])}),
   enemyShot:Object.freeze({tones:Object.freeze([{freq:338,duration:.075,wave:'triangle',volume:.009,slide:-130,detune:.002,lpHz:3000},{freq:258,duration:.05,wave:'square',volume:.004,slide:-90,detune:.002,lpHz:2600,delay:.012}])}),
   playerHit:Object.freeze({tones:Object.freeze([{freq:228,duration:.11,wave:'square',volume:.022,slide:-300,detune:.012,lpHz:2600},{freq:176,duration:.19,wave:'sawtooth',volume:.024,slide:-320,detune:.016,lpHz:2100,delay:.016},{freq:124,duration:.28,wave:'triangle',volume:.022,slide:-150,detune:.009,lpHz:1600,delay:.028}]),noise:Object.freeze([{duration:.16,volume:.016,hp:1120,delay:.012},{duration:.08,volume:.01,hp:760,delay:.03}])}),
   enemyHit:Object.freeze({tones:Object.freeze([{freq:228,duration:.05,wave:'square',volume:.013,slide:-180,detune:.008,lpHz:3200},{freq:146,duration:.1,wave:'sawtooth',volume:.015,slide:-220,detune:.012,lpHz:2300,delay:.02}]),noise:Object.freeze([{duration:.05,volume:.006,hp:1600,delay:.012}])}),
   bossHit:Object.freeze({tones:Object.freeze([{freq:312,duration:.06,wave:'square',volume:.015,slide:-120,detune:.004,lpHz:3600},{freq:202,duration:.12,wave:'triangle',volume:.012,slide:-80,detune:.003,lpHz:2500,delay:.014}]),noise:Object.freeze([{duration:.04,volume:.004,hp:1900,delay:.01}])}),
   enemyBoom:Object.freeze({tones:Object.freeze([{freq:520,duration:.026,wave:'square',volume:.008,slide:-340,detune:.004,lpHz:4200},{freq:360,duration:.04,wave:'square',volume:.006,slide:-280,detune:-.003,lpHz:3600,delay:.012},{freq:240,duration:.075,wave:'triangle',volume:.006,slide:-90,detune:-.004,lpHz:2100,delay:.018}])}),
   bossBoom:Object.freeze({tones:Object.freeze([{freq:420,duration:.026,wave:'square',volume:.011,slide:-340,detune:.004,lpHz:4200},{freq:280,duration:.04,wave:'square',volume:.008,slide:-280,detune:-.003,lpHz:3600,delay:.012},{freq:180,duration:.11,wave:'triangle',volume:.011,slide:-90,detune:-.004,lpHz:2100,delay:.018}]),noise:Object.freeze([{duration:.045,volume:.004,hp:1400,delay:.016}])}),
   captureBeam:Object.freeze({tones:Object.freeze([{freq:92,duration:.34,wave:'sawtooth',volume:.018,slide:48,detune:.018,lpHz:3000},{freq:138,duration:.28,wave:'triangle',volume:.009,slide:30,detune:.01,lpHz:2400,delay:.04}]),noise:Object.freeze([{duration:.11,volume:.004,hp:1900,delay:.03}])}),
   captureRetreat:Object.freeze({seq:[247,294,370,494],step:.06,wave:'triangle',volume:.012,slide:18,lpHz:2600,tones:Object.freeze([{freq:620,duration:.18,wave:'square',volume:.006,slide:-70,detune:.08,lpHz:3400,delay:.06}])}),
   rescueJoin:Object.freeze({seq:[523,659,784,1047],step:.05,wave:'triangle',volume:.013,slide:42,lpHz:4200,tones:Object.freeze([{freq:1318,duration:.09,wave:'square',volume:.006,slide:-80,detune:.08,lpHz:5000,delay:.08}])}),
   extendAward:Object.freeze({seq:[659,880,1175],step:.055,wave:'triangle',volume:.014,slide:55,lpHz:4300,tones:Object.freeze([{freq:1568,duration:.11,wave:'square',volume:.008,slide:-60,detune:.004,lpHz:5200,delay:.05},{freq:2093,duration:.08,wave:'triangle',volume:.006,slide:-40,detune:.003,lpHz:5600,delay:.11}])}),
   gameOver:Object.freeze({seq:[294,262,220,196],step:.11,wave:'triangle',volume:.017,slide:-45,lpHz:2300,tones:Object.freeze([{freq:147,duration:.32,wave:'sawtooth',volume:.016,slide:-120,detune:.01,lpHz:1900,delay:.018}]),noise:Object.freeze([{duration:.09,volume:.004,hp:1100,delay:.1}])}),
   stagePulse:Object.freeze({
    variants:Object.freeze([
     Object.freeze({tones:Object.freeze([{freq:392,duration:.055,wave:'triangle',volume:.009,slide:-16,detune:.002,lpHz:2800},{freq:523,duration:.04,wave:'square',volume:.004,slide:-12,detune:-.002,lpHz:4000,delay:.016},{freq:659,duration:.03,wave:'square',volume:.0024,slide:-18,detune:.002,lpHz:4600,delay:.032}])}),
     Object.freeze({tones:Object.freeze([{freq:330,duration:.055,wave:'triangle',volume:.009,slide:-16,detune:.002,lpHz:2800},{freq:440,duration:.04,wave:'square',volume:.004,slide:-12,detune:-.002,lpHz:4000,delay:.016},{freq:523,duration:.03,wave:'square',volume:.0024,slide:-18,detune:.002,lpHz:4600,delay:.032}])}),
     Object.freeze({tones:Object.freeze([{freq:440,duration:.055,wave:'triangle',volume:.009,slide:-16,detune:.002,lpHz:2800},{freq:587,duration:.04,wave:'square',volume:.004,slide:-12,detune:-.002,lpHz:4000,delay:.016},{freq:698,duration:.03,wave:'square',volume:.0024,slide:-18,detune:.002,lpHz:4600,delay:.032}])}),
     Object.freeze({tones:Object.freeze([{freq:294,duration:.055,wave:'triangle',volume:.009,slide:-16,detune:.002,lpHz:2800},{freq:392,duration:.04,wave:'square',volume:.004,slide:-12,detune:-.002,lpHz:4000,delay:.016},{freq:523,duration:.03,wave:'square',volume:.0024,slide:-18,detune:.002,lpHz:4600,delay:.032}])})
    ])
   }),
   stageTransition:Object.freeze({seq:[440,554,659],step:.06,wave:'triangle',volume:.011,slide:24,lpHz:3400,tones:Object.freeze([{freq:880,duration:.09,wave:'square',volume:.005,slide:-80,lpHz:4300,delay:.1}])}),
   challengeTransition:Object.freeze({seq:[392,523,659,784],step:.055,wave:'triangle',volume:.012,slide:40,lpHz:3600,tones:Object.freeze([{freq:988,duration:.12,wave:'square',volume:.006,slide:-70,lpHz:4600,delay:.12}])}),
   attractEnter:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({seq:[392,523,659],step:.065,wave:'triangle',volume:.01,slide:18,lpHz:3200,allowIdle:1}),
     demo:Object.freeze({seq:[330,440,523],step:.072,wave:'triangle',volume:.009,slide:14,lpHz:3000,allowIdle:1})
    })
   }),
   attractPulse:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:330,duration:.055,wave:'triangle',volume:.006,slide:8,lpHz:2600},{freq:494,duration:.036,wave:'square',volume:.0028,slide:-10,lpHz:3800,delay:.018}])}),
       Object.freeze({tones:Object.freeze([{freq:392,duration:.055,wave:'triangle',volume:.006,slide:8,lpHz:2600},{freq:523,duration:.036,wave:'square',volume:.0028,slide:-10,lpHz:3800,delay:.018}])})
      ])
     }),
     demo:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:294,duration:.06,wave:'triangle',volume:.0055,slide:10,lpHz:2400},{freq:440,duration:.038,wave:'square',volume:.0026,slide:-12,lpHz:3600,delay:.018}])}),
       Object.freeze({tones:Object.freeze([{freq:330,duration:.06,wave:'triangle',volume:.0055,slide:10,lpHz:2400},{freq:494,duration:.038,wave:'square',volume:.0026,slide:-12,lpHz:3600,delay:.018}])})
      ])
     })
    })
   }),
   uiTick:Object.freeze({tones:Object.freeze([{freq:920,duration:.024,wave:'square',volume:.004,slide:-110,detune:.001,lpHz:5400},{freq:1320,duration:.016,wave:'triangle',volume:.0025,slide:-70,detune:.001,lpHz:5200,delay:.004}])}),
   uiConfirm:Object.freeze({seq:[660,880],step:.04,wave:'triangle',volume:.008,slide:30,lpHz:4200})
  })
 }),
 'aurora-rise':Object.freeze({
 id:'aurora-rise',
  label:'Aurora Rise',
  cues:Object.freeze({
   gameStart:Object.freeze({seq:[440,587,784],step:.07,wave:'triangle',volume:.018,slide:68,lpHz:3200,tones:Object.freeze([{freq:988,duration:.16,wave:'sine',volume:.008,slide:40,lpHz:3800,delay:.06}])}),
   playerShot:Object.freeze({tones:Object.freeze([{freq:980,duration:.03,wave:'triangle',volume:.006,slide:-520,lpHz:5200},{freq:1468,duration:.018,wave:'sine',volume:.003,slide:-260,lpHz:5600,delay:.005}])}),
   enemyShot:Object.freeze({tones:Object.freeze([{freq:298,duration:.08,wave:'triangle',volume:.008,slide:-110,lpHz:2600},{freq:220,duration:.055,wave:'sine',volume:.0038,slide:-70,lpHz:2300,delay:.014}])}),
   enemyHit:Object.freeze({tones:Object.freeze([{freq:202,duration:.055,wave:'triangle',volume:.012,slide:-150,lpHz:2800},{freq:138,duration:.11,wave:'sawtooth',volume:.012,slide:-170,lpHz:2100,delay:.018}]),noise:Object.freeze([{duration:.045,volume:.005,hp:1500,delay:.012}])}),
   bossHit:Object.freeze({tones:Object.freeze([{freq:288,duration:.065,wave:'triangle',volume:.014,slide:-108,lpHz:3200},{freq:196,duration:.13,wave:'sine',volume:.009,slide:-74,lpHz:2500,delay:.016}]),noise:Object.freeze([{duration:.04,volume:.004,hp:1800,delay:.01}])}),
   enemyBoom:Object.freeze({tones:Object.freeze([{freq:466,duration:.03,wave:'triangle',volume:.008,slide:-280,lpHz:3600},{freq:320,duration:.05,wave:'triangle',volume:.005,slide:-160,lpHz:3000,delay:.014},{freq:220,duration:.085,wave:'sine',volume:.005,slide:-60,lpHz:1900,delay:.024}])}),
   bossBoom:Object.freeze({tones:Object.freeze([{freq:392,duration:.03,wave:'triangle',volume:.01,slide:-260,lpHz:3900},{freq:262,duration:.052,wave:'triangle',volume:.007,slide:-170,lpHz:3200,delay:.014},{freq:176,duration:.11,wave:'sine',volume:.008,slide:-70,lpHz:2100,delay:.024}]),noise:Object.freeze([{duration:.05,volume:.004,hp:1300,delay:.016}])}),
   captureBeam:Object.freeze({tones:Object.freeze([{freq:110,duration:.34,wave:'sawtooth',volume:.016,slide:52,detune:.014,lpHz:2600},{freq:165,duration:.28,wave:'sine',volume:.007,slide:32,detune:.01,lpHz:2200,delay:.04}]),noise:Object.freeze([{duration:.1,volume:.004,hp:1800,delay:.03}])}),
   stagePulse:Object.freeze({
    variants:Object.freeze([
     Object.freeze({tones:Object.freeze([{freq:330,duration:.065,wave:'sine',volume:.008,slide:18,lpHz:2400},{freq:494,duration:.06,wave:'triangle',volume:.006,slide:24,lpHz:3200,delay:.02},{freq:659,duration:.045,wave:'triangle',volume:.0035,slide:16,lpHz:4200,delay:.04}])}),
     Object.freeze({tones:Object.freeze([{freq:349,duration:.065,wave:'sine',volume:.008,slide:18,lpHz:2400},{freq:523,duration:.06,wave:'triangle',volume:.006,slide:24,lpHz:3200,delay:.02},{freq:698,duration:.045,wave:'triangle',volume:.0035,slide:16,lpHz:4200,delay:.04}])}),
     Object.freeze({tones:Object.freeze([{freq:392,duration:.065,wave:'sine',volume:.008,slide:18,lpHz:2400},{freq:587,duration:.06,wave:'triangle',volume:.006,slide:24,lpHz:3200,delay:.02},{freq:784,duration:.045,wave:'triangle',volume:.0035,slide:16,lpHz:4200,delay:.04}])}),
     Object.freeze({tones:Object.freeze([{freq:330,duration:.065,wave:'sine',volume:.008,slide:18,lpHz:2400},{freq:523,duration:.06,wave:'triangle',volume:.006,slide:24,lpHz:3200,delay:.02},{freq:880,duration:.045,wave:'triangle',volume:.0035,slide:16,lpHz:4200,delay:.04}])})
    ])
   }),
   stageTransition:Object.freeze({seq:[494,659,880],step:.065,wave:'triangle',volume:.012,slide:42,lpHz:3600,tones:Object.freeze([{freq:1175,duration:.1,wave:'sine',volume:.006,slide:35,lpHz:4400,delay:.1}])}),
   challengeTransition:Object.freeze({seq:[523,659,880,1175],step:.06,wave:'triangle',volume:.013,slide:52,lpHz:3800,tones:Object.freeze([{freq:1397,duration:.12,wave:'sine',volume:.006,slide:28,lpHz:4700,delay:.12}])}),
   extendAward:Object.freeze({seq:[784,1047,1318],step:.06,wave:'triangle',volume:.014,slide:48,lpHz:4600,tones:Object.freeze([{freq:1760,duration:.1,wave:'sine',volume:.006,slide:22,lpHz:5200,delay:.08}])}),
   rescueJoin:Object.freeze({seq:[523,659,880,1175],step:.052,wave:'triangle',volume:.013,slide:46,lpHz:4300,tones:Object.freeze([{freq:1568,duration:.1,wave:'sine',volume:.006,slide:28,lpHz:5000,delay:.08}])}),
   captureRetreat:Object.freeze({seq:[262,330,415,523],step:.062,wave:'triangle',volume:.011,slide:14,lpHz:2400,tones:Object.freeze([{freq:698,duration:.16,wave:'sawtooth',volume:.005,slide:-60,lpHz:3000,delay:.08}])}),
   attractEnter:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({seq:[523,698,932],step:.075,wave:'triangle',volume:.011,slide:26,lpHz:3600,tones:Object.freeze([{freq:1245,duration:.09,wave:'sine',volume:.0045,slide:18,lpHz:4200,delay:.12}]),allowIdle:1}),
     demo:Object.freeze({seq:[392,523,698],step:.08,wave:'triangle',volume:.01,slide:20,lpHz:3200,tones:Object.freeze([{freq:988,duration:.085,wave:'sine',volume:.0042,slide:16,lpHz:3800,delay:.11}]),allowIdle:1})
    })
   }),
   attractPulse:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:349,duration:.06,wave:'sine',volume:.0058,slide:10,lpHz:2300},{freq:523,duration:.042,wave:'triangle',volume:.0031,slide:14,lpHz:3200,delay:.022}])}),
       Object.freeze({tones:Object.freeze([{freq:392,duration:.06,wave:'sine',volume:.0058,slide:10,lpHz:2300},{freq:587,duration:.042,wave:'triangle',volume:.0031,slide:14,lpHz:3200,delay:.022}])})
      ])
     }),
     demo:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:330,duration:.062,wave:'sine',volume:.0054,slide:8,lpHz:2200},{freq:494,duration:.04,wave:'triangle',volume:.0028,slide:12,lpHz:3000,delay:.022}])}),
       Object.freeze({tones:Object.freeze([{freq:294,duration:.062,wave:'sine',volume:.0054,slide:8,lpHz:2200},{freq:440,duration:.04,wave:'triangle',volume:.0028,slide:12,lpHz:3000,delay:.022}])})
      ])
     })
    })
   }),
   uiTick:Object.freeze({
    byPhase:Object.freeze({
     frontDoor:Object.freeze({tones:Object.freeze([{freq:860,duration:.024,wave:'triangle',volume:.0038,slide:-80,lpHz:4600},{freq:1180,duration:.016,wave:'sine',volume:.0024,slide:-50,lpHz:5200,delay:.004}])}),
     wait:Object.freeze({tones:Object.freeze([{freq:760,duration:.026,wave:'triangle',volume:.0038,slide:-70,lpHz:4300},{freq:1047,duration:.016,wave:'sine',volume:.0022,slide:-40,lpHz:4800,delay:.005}])}),
     stage:Object.freeze({tones:Object.freeze([{freq:900,duration:.024,wave:'triangle',volume:.0042,slide:-90,lpHz:5000},{freq:1260,duration:.016,wave:'sine',volume:.0026,slide:-55,lpHz:5400,delay:.004}])})
    })
   }),
   uiConfirm:Object.freeze({
    byPhase:Object.freeze({
     frontDoor:Object.freeze({seq:[784,1047],step:.045,wave:'triangle',volume:.008,slide:24,lpHz:4300}),
     wait:Object.freeze({seq:[698,932],step:.045,wave:'triangle',volume:.008,slide:22,lpHz:4200}),
     stage:Object.freeze({seq:[784,1175],step:.042,wave:'triangle',volume:.0085,slide:26,lpHz:4500})
    })
   }),
   playerHit:Object.freeze({tones:Object.freeze([{freq:220,duration:.13,wave:'triangle',volume:.02,slide:-220,lpHz:2200},{freq:165,duration:.22,wave:'sawtooth',volume:.018,slide:-240,lpHz:1800,delay:.018}]),noise:Object.freeze([{duration:.12,volume:.012,hp:980,delay:.02}])}),
   gameOver:Object.freeze({seq:[262,220,196,165],step:.115,wave:'triangle',volume:.016,slide:-55,lpHz:2100,tones:Object.freeze([{freq:131,duration:.34,wave:'sawtooth',volume:.015,slide:-100,lpHz:1700,delay:.024}]),noise:Object.freeze([{duration:.1,volume:.004,hp:1000,delay:.1}])})
  })
 }),
 'aurora-surge':Object.freeze({
 id:'aurora-surge',
  label:'Aurora Surge',
  cues:Object.freeze({
   gameStart:Object.freeze({seq:[523,659,880],step:.065,wave:'triangle',volume:.019,slide:62,lpHz:3600,tones:Object.freeze([{freq:1318,duration:.15,wave:'sine',volume:.008,slide:34,lpHz:4300,delay:.06}])}),
   playerShot:Object.freeze({tones:Object.freeze([{freq:1080,duration:.028,wave:'triangle',volume:.0064,slide:-560,lpHz:5600},{freq:1610,duration:.017,wave:'sine',volume:.0032,slide:-240,lpHz:6200,delay:.005}])}),
   enemyShot:Object.freeze({tones:Object.freeze([{freq:320,duration:.078,wave:'triangle',volume:.0086,slide:-118,lpHz:2800},{freq:236,duration:.054,wave:'sine',volume:.0038,slide:-72,lpHz:2400,delay:.014}])}),
   enemyHit:Object.freeze({tones:Object.freeze([{freq:220,duration:.055,wave:'triangle',volume:.0125,slide:-160,lpHz:3000},{freq:148,duration:.105,wave:'sawtooth',volume:.0125,slide:-184,lpHz:2200,delay:.018}]),noise:Object.freeze([{duration:.045,volume:.005,hp:1560,delay:.012}])}),
   bossHit:Object.freeze({tones:Object.freeze([{freq:300,duration:.064,wave:'triangle',volume:.0145,slide:-112,lpHz:3400},{freq:208,duration:.126,wave:'sine',volume:.0095,slide:-76,lpHz:2600,delay:.016}]),noise:Object.freeze([{duration:.04,volume:.004,hp:1840,delay:.01}])}),
   enemyBoom:Object.freeze({tones:Object.freeze([{freq:494,duration:.03,wave:'triangle',volume:.0088,slide:-290,lpHz:3900},{freq:340,duration:.05,wave:'triangle',volume:.0054,slide:-170,lpHz:3200,delay:.014},{freq:228,duration:.085,wave:'sine',volume:.0052,slide:-62,lpHz:2000,delay:.024}])}),
   bossBoom:Object.freeze({tones:Object.freeze([{freq:410,duration:.03,wave:'triangle',volume:.0105,slide:-270,lpHz:4100},{freq:276,duration:.054,wave:'triangle',volume:.0072,slide:-176,lpHz:3400,delay:.014},{freq:184,duration:.112,wave:'sine',volume:.0082,slide:-72,lpHz:2200,delay:.024}]),noise:Object.freeze([{duration:.05,volume:.004,hp:1320,delay:.016}])}),
   captureBeam:Object.freeze({tones:Object.freeze([{freq:118,duration:.34,wave:'sawtooth',volume:.0165,slide:54,detune:.014,lpHz:2750},{freq:176,duration:.28,wave:'sine',volume:.0074,slide:34,detune:.01,lpHz:2300,delay:.04}]),noise:Object.freeze([{duration:.1,volume:.004,hp:1820,delay:.03}])}),
   stagePulse:Object.freeze({
    variants:Object.freeze([
     Object.freeze({tones:Object.freeze([{freq:392,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:2800},{freq:587,duration:.048,wave:'sine',volume:.0042,slide:22,lpHz:3600,delay:.018},{freq:880,duration:.04,wave:'triangle',volume:.0032,slide:20,lpHz:4700,delay:.036}])}),
     Object.freeze({tones:Object.freeze([{freq:440,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:2800},{freq:659,duration:.048,wave:'sine',volume:.0042,slide:22,lpHz:3600,delay:.018},{freq:988,duration:.04,wave:'triangle',volume:.0032,slide:20,lpHz:4700,delay:.036}])}),
     Object.freeze({tones:Object.freeze([{freq:392,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:2800},{freq:659,duration:.048,wave:'sine',volume:.0042,slide:22,lpHz:3600,delay:.018},{freq:1047,duration:.04,wave:'triangle',volume:.0032,slide:20,lpHz:4700,delay:.036}])}),
     Object.freeze({tones:Object.freeze([{freq:440,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:2800},{freq:698,duration:.048,wave:'sine',volume:.0042,slide:22,lpHz:3600,delay:.018},{freq:1175,duration:.04,wave:'triangle',volume:.0032,slide:20,lpHz:4700,delay:.036}])})
    ])
   }),
   stageTransition:Object.freeze({seq:[587,784,1047],step:.06,wave:'triangle',volume:.013,slide:52,lpHz:4000,tones:Object.freeze([{freq:1397,duration:.11,wave:'sine',volume:.006,slide:26,lpHz:4900,delay:.1}])}),
   challengeTransition:Object.freeze({seq:[659,880,1175,1568],step:.055,wave:'triangle',volume:.013,slide:56,lpHz:4200,tones:Object.freeze([{freq:1760,duration:.12,wave:'sine',volume:.007,slide:24,lpHz:5100,delay:.12}])}),
   extendAward:Object.freeze({seq:[880,1175,1568],step:.058,wave:'triangle',volume:.015,slide:54,lpHz:4700,tones:Object.freeze([{freq:2093,duration:.1,wave:'sine',volume:.007,slide:18,lpHz:5600,delay:.08}])}),
   rescueJoin:Object.freeze({seq:[659,784,1047,1397],step:.05,wave:'triangle',volume:.014,slide:48,lpHz:4500,tones:Object.freeze([{freq:1760,duration:.1,wave:'sine',volume:.006,slide:20,lpHz:5200,delay:.08}])}),
   captureRetreat:Object.freeze({seq:[330,392,494,587],step:.06,wave:'triangle',volume:.012,slide:18,lpHz:2600,tones:Object.freeze([{freq:784,duration:.18,wave:'sawtooth',volume:.005,slide:-70,lpHz:3200,delay:.08}])}),
   attractEnter:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({seq:[659,880,1175],step:.072,wave:'triangle',volume:.0115,slide:28,lpHz:3900,tones:Object.freeze([{freq:1568,duration:.09,wave:'sine',volume:.0048,slide:18,lpHz:4600,delay:.12}]),allowIdle:1}),
     demo:Object.freeze({seq:[494,659,880],step:.078,wave:'triangle',volume:.0104,slide:22,lpHz:3500,tones:Object.freeze([{freq:1175,duration:.085,wave:'sine',volume:.0044,slide:14,lpHz:4100,delay:.11}]),allowIdle:1})
    })
   }),
   attractPulse:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:392,duration:.06,wave:'sine',volume:.006,slide:10,lpHz:2400},{freq:659,duration:.042,wave:'triangle',volume:.0032,slide:15,lpHz:3400,delay:.022}])}),
       Object.freeze({tones:Object.freeze([{freq:440,duration:.06,wave:'sine',volume:.006,slide:10,lpHz:2400},{freq:698,duration:.042,wave:'triangle',volume:.0032,slide:15,lpHz:3400,delay:.022}])})
      ])
     }),
     demo:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:349,duration:.062,wave:'sine',volume:.0056,slide:9,lpHz:2300},{freq:587,duration:.04,wave:'triangle',volume:.003,slide:13,lpHz:3200,delay:.022}])}),
       Object.freeze({tones:Object.freeze([{freq:330,duration:.062,wave:'sine',volume:.0056,slide:9,lpHz:2300},{freq:523,duration:.04,wave:'triangle',volume:.003,slide:13,lpHz:3200,delay:.022}])})
      ])
     })
    })
   }),
   uiTick:Object.freeze({
    byPhase:Object.freeze({
     frontDoor:Object.freeze({tones:Object.freeze([{freq:920,duration:.024,wave:'triangle',volume:.004,slide:-84,lpHz:4900},{freq:1320,duration:.016,wave:'sine',volume:.0025,slide:-48,lpHz:5600,delay:.004}])}),
     wait:Object.freeze({tones:Object.freeze([{freq:820,duration:.026,wave:'triangle',volume:.004,slide:-76,lpHz:4700},{freq:1175,duration:.016,wave:'sine',volume:.0024,slide:-44,lpHz:5400,delay:.005}])}),
     stage:Object.freeze({tones:Object.freeze([{freq:980,duration:.024,wave:'triangle',volume:.0044,slide:-96,lpHz:5300},{freq:1468,duration:.016,wave:'sine',volume:.0027,slide:-56,lpHz:5900,delay:.004}])})
    })
   }),
   uiConfirm:Object.freeze({
    byPhase:Object.freeze({
     frontDoor:Object.freeze({seq:[880,1175],step:.044,wave:'triangle',volume:.0084,slide:26,lpHz:4500}),
     wait:Object.freeze({seq:[784,1047],step:.044,wave:'triangle',volume:.0084,slide:24,lpHz:4400}),
     stage:Object.freeze({seq:[880,1318],step:.042,wave:'triangle',volume:.009,slide:28,lpHz:4700})
    })
   }),
   playerHit:Object.freeze({tones:Object.freeze([{freq:247,duration:.12,wave:'triangle',volume:.02,slide:-230,lpHz:2400},{freq:185,duration:.22,wave:'sawtooth',volume:.018,slide:-240,lpHz:1900,delay:.018}]),noise:Object.freeze([{duration:.12,volume:.012,hp:1020,delay:.02}])}),
   gameOver:Object.freeze({seq:[330,262,220,175],step:.11,wave:'triangle',volume:.016,slide:-60,lpHz:2200,tones:Object.freeze([{freq:139,duration:.34,wave:'sawtooth',volume:.014,slide:-100,lpHz:1750,delay:.024}]),noise:Object.freeze([{duration:.1,volume:.004,hp:1000,delay:.1}])})
  })
 }),
 'aurora-crown':Object.freeze({
 id:'aurora-crown',
  label:'Aurora Crown',
  cues:Object.freeze({
   gameStart:Object.freeze({seq:[587,784,1047],step:.06,wave:'triangle',volume:.02,slide:56,lpHz:3900,tones:Object.freeze([{freq:1568,duration:.16,wave:'sine',volume:.008,slide:24,lpHz:4600,delay:.06}])}),
   playerShot:Object.freeze({tones:Object.freeze([{freq:1160,duration:.028,wave:'triangle',volume:.0066,slide:-590,lpHz:5900},{freq:1720,duration:.017,wave:'sine',volume:.0033,slide:-250,lpHz:6400,delay:.005}])}),
   enemyShot:Object.freeze({tones:Object.freeze([{freq:338,duration:.078,wave:'triangle',volume:.0088,slide:-120,lpHz:2900},{freq:250,duration:.054,wave:'sine',volume:.0039,slide:-74,lpHz:2500,delay:.014}])}),
   enemyHit:Object.freeze({tones:Object.freeze([{freq:234,duration:.055,wave:'triangle',volume:.0128,slide:-165,lpHz:3100},{freq:156,duration:.105,wave:'sawtooth',volume:.0128,slide:-188,lpHz:2250,delay:.018}]),noise:Object.freeze([{duration:.045,volume:.005,hp:1580,delay:.012}])}),
   bossHit:Object.freeze({tones:Object.freeze([{freq:320,duration:.064,wave:'triangle',volume:.0148,slide:-114,lpHz:3500},{freq:220,duration:.128,wave:'sine',volume:.0096,slide:-76,lpHz:2680,delay:.016}]),noise:Object.freeze([{duration:.04,volume:.004,hp:1860,delay:.01}])}),
   enemyBoom:Object.freeze({tones:Object.freeze([{freq:520,duration:.03,wave:'triangle',volume:.009,slide:-300,lpHz:4100},{freq:356,duration:.05,wave:'triangle',volume:.0055,slide:-176,lpHz:3300,delay:.014},{freq:240,duration:.086,wave:'sine',volume:.0054,slide:-64,lpHz:2060,delay:.024}])}),
   bossBoom:Object.freeze({tones:Object.freeze([{freq:432,duration:.03,wave:'triangle',volume:.0108,slide:-278,lpHz:4300},{freq:290,duration:.054,wave:'triangle',volume:.0074,slide:-178,lpHz:3500,delay:.014},{freq:196,duration:.114,wave:'sine',volume:.0084,slide:-74,lpHz:2260,delay:.024}]),noise:Object.freeze([{duration:.05,volume:.004,hp:1340,delay:.016}])}),
   captureBeam:Object.freeze({tones:Object.freeze([{freq:126,duration:.34,wave:'sawtooth',volume:.0168,slide:56,detune:.014,lpHz:2850},{freq:188,duration:.28,wave:'sine',volume:.0076,slide:34,detune:.01,lpHz:2380,delay:.04}]),noise:Object.freeze([{duration:.1,volume:.004,hp:1840,delay:.03}])}),
   stagePulse:Object.freeze({
    variants:Object.freeze([
     Object.freeze({tones:Object.freeze([{freq:440,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:3000},{freq:698,duration:.05,wave:'sine',volume:.0045,slide:22,lpHz:3800,delay:.018},{freq:1047,duration:.04,wave:'triangle',volume:.0035,slide:16,lpHz:4900,delay:.036}])}),
     Object.freeze({tones:Object.freeze([{freq:494,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:3000},{freq:740,duration:.05,wave:'sine',volume:.0045,slide:22,lpHz:3800,delay:.018},{freq:1175,duration:.04,wave:'triangle',volume:.0035,slide:16,lpHz:4900,delay:.036}])}),
     Object.freeze({tones:Object.freeze([{freq:523,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:3000},{freq:784,duration:.05,wave:'sine',volume:.0045,slide:22,lpHz:3800,delay:.018},{freq:1318,duration:.04,wave:'triangle',volume:.0035,slide:16,lpHz:4900,delay:.036}])}),
     Object.freeze({tones:Object.freeze([{freq:587,duration:.06,wave:'triangle',volume:.01,slide:24,lpHz:3000},{freq:880,duration:.05,wave:'sine',volume:.0045,slide:22,lpHz:3800,delay:.018},{freq:1397,duration:.04,wave:'triangle',volume:.0035,slide:16,lpHz:4900,delay:.036}])})
    ])
   }),
   stageTransition:Object.freeze({seq:[698,932,1245],step:.058,wave:'triangle',volume:.014,slide:52,lpHz:4300,tones:Object.freeze([{freq:1661,duration:.11,wave:'sine',volume:.006,slide:24,lpHz:5200,delay:.1}])}),
   challengeTransition:Object.freeze({seq:[740,988,1318,1760],step:.055,wave:'triangle',volume:.014,slide:54,lpHz:4500,tones:Object.freeze([{freq:2093,duration:.12,wave:'sine',volume:.007,slide:20,lpHz:5600,delay:.12}])}),
   extendAward:Object.freeze({seq:[988,1318,1760],step:.055,wave:'triangle',volume:.015,slide:52,lpHz:5000,tones:Object.freeze([{freq:2349,duration:.1,wave:'sine',volume:.007,slide:14,lpHz:5800,delay:.08}])}),
   rescueJoin:Object.freeze({seq:[784,988,1318,1760],step:.05,wave:'triangle',volume:.014,slide:46,lpHz:4700,tones:Object.freeze([{freq:2093,duration:.1,wave:'sine',volume:.006,slide:18,lpHz:5400,delay:.08}])}),
   captureRetreat:Object.freeze({seq:[392,466,587,698],step:.058,wave:'triangle',volume:.012,slide:16,lpHz:2800,tones:Object.freeze([{freq:932,duration:.18,wave:'sawtooth',volume:.005,slide:-65,lpHz:3400,delay:.08}])}),
   attractEnter:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({seq:[784,1047,1397],step:.07,wave:'triangle',volume:.012,slide:30,lpHz:4200,tones:Object.freeze([{freq:1865,duration:.09,wave:'sine',volume:.0049,slide:18,lpHz:4900,delay:.12}]),allowIdle:1}),
     demo:Object.freeze({seq:[587,784,1047],step:.076,wave:'triangle',volume:.0108,slide:24,lpHz:3700,tones:Object.freeze([{freq:1397,duration:.085,wave:'sine',volume:.0045,slide:14,lpHz:4300,delay:.11}]),allowIdle:1})
    })
   }),
   attractPulse:Object.freeze({
    byPhase:Object.freeze({
     wait:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:440,duration:.06,wave:'sine',volume:.0062,slide:10,lpHz:2500},{freq:740,duration:.042,wave:'triangle',volume:.0033,slide:15,lpHz:3500,delay:.022}])}),
       Object.freeze({tones:Object.freeze([{freq:494,duration:.06,wave:'sine',volume:.0062,slide:10,lpHz:2500},{freq:784,duration:.042,wave:'triangle',volume:.0033,slide:15,lpHz:3500,delay:.022}])})
      ])
     }),
     demo:Object.freeze({
      allowIdle:1,
      variants:Object.freeze([
       Object.freeze({tones:Object.freeze([{freq:392,duration:.062,wave:'sine',volume:.0058,slide:9,lpHz:2400},{freq:659,duration:.04,wave:'triangle',volume:.0031,slide:13,lpHz:3300,delay:.022}])}),
       Object.freeze({tones:Object.freeze([{freq:349,duration:.062,wave:'sine',volume:.0058,slide:9,lpHz:2400},{freq:587,duration:.04,wave:'triangle',volume:.0031,slide:13,lpHz:3300,delay:.022}])})
      ])
     })
    })
   }),
   uiTick:Object.freeze({
    byPhase:Object.freeze({
     frontDoor:Object.freeze({tones:Object.freeze([{freq:980,duration:.024,wave:'triangle',volume:.0041,slide:-88,lpHz:5100},{freq:1397,duration:.016,wave:'sine',volume:.0025,slide:-52,lpHz:5800,delay:.004}])}),
     wait:Object.freeze({tones:Object.freeze([{freq:880,duration:.026,wave:'triangle',volume:.0041,slide:-80,lpHz:4900},{freq:1245,duration:.016,wave:'sine',volume:.0024,slide:-46,lpHz:5600,delay:.005}])}),
     stage:Object.freeze({tones:Object.freeze([{freq:1047,duration:.024,wave:'triangle',volume:.0045,slide:-98,lpHz:5500},{freq:1568,duration:.016,wave:'sine',volume:.0028,slide:-58,lpHz:6100,delay:.004}])})
    })
   }),
   uiConfirm:Object.freeze({
    byPhase:Object.freeze({
     frontDoor:Object.freeze({seq:[988,1318],step:.044,wave:'triangle',volume:.0086,slide:26,lpHz:4700}),
     wait:Object.freeze({seq:[880,1175],step:.044,wave:'triangle',volume:.0086,slide:24,lpHz:4600}),
     stage:Object.freeze({seq:[988,1480],step:.042,wave:'triangle',volume:.0092,slide:28,lpHz:4900})
    })
   }),
   playerHit:Object.freeze({tones:Object.freeze([{freq:262,duration:.12,wave:'triangle',volume:.02,slide:-220,lpHz:2500},{freq:196,duration:.22,wave:'sawtooth',volume:.018,slide:-235,lpHz:1950,delay:.018}]),noise:Object.freeze([{duration:.12,volume:.012,hp:1020,delay:.02}])}),
   gameOver:Object.freeze({seq:[349,294,247,196],step:.11,wave:'triangle',volume:.016,slide:-58,lpHz:2300,tones:Object.freeze([{freq:156,duration:.34,wave:'sawtooth',volume:.014,slide:-96,lpHz:1820,delay:.024}]),noise:Object.freeze([{duration:.1,volume:.004,hp:1000,delay:.1}])})
  })
 })
});

const AURORA_STAGE_THEME_PROGRESSION=Object.freeze([
 {fromStage:1,id:'quiet-skies',frameAccent:'classic-blue',atmosphereTheme:'classic-arcade',challengeBrand:'classic',bossArchetype:'command-core'},
 {fromStage:4,id:'scorpion-dawn',frameAccent:'amber-blue',atmosphereTheme:'aurora-hint',challengeBrand:'scorpion',bossArchetype:'super-boss-scorpion'},
 {fromStage:8,id:'stingray-surge',frameAccent:'teal-gold',atmosphereTheme:'aurora-borealis',challengeBrand:'stingray',bossArchetype:'partner-wing-stingray'},
 {fromStage:12,id:'galboss-veil',frameAccent:'violet-gold',atmosphereTheme:'aurora-borealis',challengeBrand:'galboss',bossArchetype:'council-boss'},
 {fromStage:16,id:'crown-aurora',frameAccent:'aurora-crown',atmosphereTheme:'aurora-crown',challengeBrand:'crown',bossArchetype:'super-partner-pair'}
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
  frameAccent:'classic-blue',
  atmosphereTheme:'aurora-crown'
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
 atmosphereThemes:AURORA_ATMOSPHERE_THEMES,
 audioThemes:AURORA_AUDIO_THEMES,
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
  frameAccent:'signal-crimson',
  atmosphereTheme:'classic-arcade'
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
 atmosphereThemes:AURORA_ATMOSPHERE_THEMES,
 audioThemes:AURORA_AUDIO_THEMES,
 stageCadence:AURORA_STAGE_CADENCE,
 stageBandProfiles:AURORA_STAGE_BAND_PROFILES,
 formationLayouts:AURORA_FORMATION_LAYOUTS,
 challengeLayout:AURORA_CHALLENGE_LAYOUT,
 stageThemeProgression:Object.freeze([
  {fromStage:1,id:'signal-rack',frameAccent:'signal-crimson',atmosphereTheme:'classic-arcade',challengeBrand:'signal',bossArchetype:'flagship'}
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
 const atmosphere=currentGamePackResolvedAtmosphere(opts);
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
window.currentGamePackAtmosphereTheme=currentGamePackAtmosphereTheme;
window.currentGamePackResolvedAtmosphere=currentGamePackResolvedAtmosphere;
window.currentGamePackAudioTheme=currentGamePackAudioTheme;
window.currentGamePackAudioCue=currentGamePackAudioCue;
window.currentPlatformPackLabel=currentPlatformPackLabel;
window.currentGamePackShellThemes=currentGamePackShellThemes;
window.selectedShellThemeForPack=selectedShellThemeForPack;
window.currentGamePackSelectedShellTheme=currentGamePackSelectedShellTheme;
window.setCurrentGamePackShellTheme=setCurrentGamePackShellTheme;
window.installGamePack=installGamePack;

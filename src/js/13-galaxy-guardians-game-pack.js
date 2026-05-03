// Galaxy Guardians preview pack-owned metadata, placeholder rules, timings, visuals, and audio identity.

const GUARDIANS_STAGE_BAND_PROFILES=Object.freeze([
 {name:'signal-scouts',beeFamily:'signal-scout',butFamily:'signal-escort',bossFamily:'signal-flagship',challengeFamily:'none',scoutFamily:'signal-scout',flagshipFamily:'signal-flagship',escortFamily:'signal-escort',pulseX:.72,pulseY:.62,entryX:.78,entryY:.7,weave:1.34,steer:.82,jitter:.72,diveVy:1.18,diveAccel:1.08}
]);

const GUARDIANS_ATMOSPHERE_THEMES=Object.freeze({
 'signal-rack':Object.freeze({
  id:'signal-rack',
  label:'Signal Rack',
  group:'guardians-preview',
  starfield:Object.freeze({
   id:'guardians-signal-stars',
   count:96,
   sizeMin:.82,
   sizeMax:1.42,
   alphaMin:.38,
   alphaMax:.92,
   twinkleMin:.82,
   twinkleAmp:.18,
   speedMin:9,
   speedMax:24,
   palette:Object.freeze(['#fffdf0','#ffe26a','#ff5b5b','#7bd6ff','#4af26d','#f6f0ff'])
  }),
  backgrounds:Object.freeze({
   frontDoor:'classic-stars',
   wait:'classic-stars',
   demo:'classic-stars',
   stage:'classic-stars',
   challenge:'classic-stars'
  }),
  audioTheme:'guardians-signal'
 })
});

const GUARDIANS_REFERENCE_TIMINGS=Object.freeze({
 previewEntry:Object.freeze({
  firstScoutDiveDelay:2.55,
  flagshipEscortDelay:6.65,
  singleShotCooldown:.72
 })
});

const GUARDIANS_ALIEN_VISUAL_CATALOG=Object.freeze({
 'signal-flagship':Object.freeze({
  id:'signal-flagship',
  label:'Signal Flagship',
  role:'flagship',
  silhouette:'crowned-command-ship',
  palette:Object.freeze({core:'#ffdf6f',wing:'#ff5b5b',accent:'#7bd6ff',eye:'#fff7c2',flare:'#ff9f43'}),
  pixelRows:Object.freeze([
   '....A....',
   '...ACA...',
   '..WCCCW..',
   '.WCECEW.',
   'WWCCCCCWW',
   '.WCCCCCW.',
   '..AACAA..',
   '.A.....A.'
  ]),
  notes:'Small crowned command silhouette tuned from Galaxian contact-sheet proportions for flagship-with-escort dives.'
 }),
 'signal-escort':Object.freeze({
  id:'signal-escort',
  label:'Signal Escort',
  role:'escort',
  silhouette:'red-arrow-escort',
  palette:Object.freeze({core:'#ff5b5b',wing:'#35b9ff',accent:'#ffe06d',eye:'#ffffff',flare:'#ff9f43'}),
  pixelRows:Object.freeze([
   '..A.A..',
   '.ACCCA.',
   'WCECECW',
   '.CCCCC.',
   '..W.W..',
   'A.....A'
  ]),
  notes:'Compact red/magenta escort marker tuned toward the charger rows visible in the Galaxian reference sheets.'
 }),
 'signal-scout':Object.freeze({
  id:'signal-scout',
  label:'Signal Scout',
  role:'scout',
  silhouette:'cyan-wing-scout',
  palette:Object.freeze({core:'#42f285',wing:'#4b7dff',accent:'#ffdf6f',eye:'#f8fbff',flare:'#ff5b5b'}),
  pixelRows:Object.freeze([
   '..A.A..',
   '.WACAW.',
   'WWCCCWW',
   '.WECEW.',
   '..CCC..',
   '.A...A.'
  ]),
  notes:'Small blue/cyan convoy scout shaped for a tighter Galaxian-like rack.'
 }),
 'player-interceptor':Object.freeze({
  id:'player-interceptor',
  label:'Guardian Interceptor',
  role:'player',
  silhouette:'single-shot-interceptor',
  palette:Object.freeze({core:'#dff7ff',wing:'#7bd6ff',accent:'#ffdf6f',eye:'#ffffff',flare:'#ff5b5b'}),
  pixelRows:Object.freeze([
   '...A...',
   '..ACA..',
   '.WCCCW.',
   'WCCCCCW',
   '.WCFW.',
   '..FFF..',
   '.A...A.'
  ]),
  notes:'Compact single fighter tuned toward the cyan/red Galaxian player ship proportions.'
 })
});

const GUARDIANS_AUDIO_CUE_CATALOG=Object.freeze({
 gameStart:Object.freeze({id:'guardians-start-rise',event:'game_start',profile:'ascending-square-signal',referenceIntent:'brief cabinet start chirp, not Aurora opening theme'}),
 formationPulse:Object.freeze({id:'guardians-formation-pulse',event:'formation_entry_start',profile:'thin-rack-pulse',referenceIntent:'sparse Galaxian rack energy'}),
 playerShot:Object.freeze({id:'guardians-player-single-shot',event:'player_shot_fired',profile:'short-high-square-zap',referenceIntent:'single-shot precision cue'}),
 enemyShot:Object.freeze({id:'guardians-enemy-shot',event:'enemy_shot',profile:'low-descending-square',referenceIntent:'separate alien shot tick'}),
 scoutDive:Object.freeze({id:'guardians-scout-dive',event:'alien_dive_start',profile:'two-step-siren-dip',referenceIntent:'solo scout dive pressure'}),
 flagshipDive:Object.freeze({id:'guardians-flagship-dive',event:'flagship_dive_start',profile:'longer-command-siren',referenceIntent:'flagship dive with escort warning'}),
 escortJoin:Object.freeze({id:'guardians-escort-join',event:'escort_join',profile:'paired-red-escort-clicks',referenceIntent:'escort attachment cue'}),
 scoutHit:Object.freeze({id:'guardians-scout-hit',event:'player_shot_resolved',profile:'tight-green-pop',referenceIntent:'small alien hit'}),
 escortHit:Object.freeze({id:'guardians-escort-hit',event:'player_shot_resolved',profile:'red-blue-snap',referenceIntent:'escort hit'}),
 flagshipHit:Object.freeze({id:'guardians-flagship-hit',event:'player_shot_resolved',profile:'gold-command-break',referenceIntent:'flagship hit / score moment'}),
 wrapReturn:Object.freeze({id:'guardians-wrap-return',event:'enemy_wrap_or_return',profile:'soft-bottom-return-sweep',referenceIntent:'bottom-exit or return warning'}),
 playerLoss:Object.freeze({id:'guardians-player-loss',event:'player_lost',profile:'falling-square-burst',referenceIntent:'life-loss cue for the dev playable preview'}),
 gameOver:Object.freeze({id:'guardians-game-over-fall',event:'game_over',profile:'low-falling-square-stair',referenceIntent:'short game-over descent distinct from Aurora'})
});

const GUARDIANS_AUDIO_THEMES=Object.freeze({
 'guardians-signal':Object.freeze({
  id:'guardians-signal',
  label:'Guardians Signal',
  cues:Object.freeze({
   gameStart:Object.freeze({seq:[520,420,320,240],step:.035,wave:'square',volume:.011,slide:-42,lpHz:2500}),
   formationPulse:Object.freeze({tones:Object.freeze([{freq:122,duration:.08,wave:'square',volume:.006,slide:18,lpHz:1400},{freq:244,duration:.05,wave:'square',volume:.007,slide:-28,lpHz:2200,delay:.018},{freq:366,duration:.032,wave:'square',volume:.0045,slide:-44,lpHz:2800,delay:.05}])}),
   playerShot:Object.freeze({tones:Object.freeze([{freq:2480,duration:.01,wave:'square',volume:.007,slide:-980,detune:.008,lpHz:7800},{freq:1510,duration:.024,wave:'square',volume:.011,slide:-1180,detune:-.006,lpHz:6800,delay:.004}]),noise:Object.freeze([{duration:.014,volume:.0024,hp:4200,delay:0}])}),
   enemyShot:Object.freeze({tones:Object.freeze([{freq:246,duration:.088,wave:'square',volume:.0115,slide:-225,detune:.006,lpHz:1800},{freq:116,duration:.064,wave:'square',volume:.0062,slide:-88,detune:-.004,lpHz:1150,delay:.036}]),noise:Object.freeze([{duration:.046,volume:.0042,hp:880,delay:.006}])}),
   scoutDive:Object.freeze({tones:Object.freeze([{freq:660,duration:.11,wave:'square',volume:.0082,slide:-285,detune:.01,lpHz:3100},{freq:330,duration:.15,wave:'sawtooth',volume:.0064,slide:-218,detune:-.008,lpHz:1850,delay:.048},{freq:165,duration:.09,wave:'square',volume:.0038,slide:-70,detune:.006,lpHz:1250,delay:.17}]),noise:Object.freeze([{duration:.052,volume:.0032,hp:720,delay:.035}])}),
   flagshipDive:Object.freeze({tones:Object.freeze([{freq:420,duration:.17,wave:'square',volume:.0094,slide:-190,detune:.01,lpHz:2450},{freq:210,duration:.3,wave:'sawtooth',volume:.0078,slide:-140,detune:-.008,lpHz:1600,delay:.056},{freq:96,duration:.19,wave:'square',volume:.0054,slide:-48,detune:.006,lpHz:1000,delay:.25}]),noise:Object.freeze([{duration:.085,volume:.0038,hp:640,delay:.022}])}),
   escortJoin:Object.freeze({seq:[880,660,880,520],step:.024,wave:'square',volume:.0072,slide:-58,lpHz:4200}),
   wrapReturn:Object.freeze({tones:Object.freeze([{freq:150,duration:.18,wave:'triangle',volume:.0065,slide:210,lpHz:2100},{freq:360,duration:.10,wave:'square',volume:.0045,slide:120,lpHz:3000,delay:.08}])}),
   playerLoss:Object.freeze({tones:Object.freeze([{freq:260,duration:.12,wave:'square',volume:.019,slide:-260,lpHz:1900},{freq:150,duration:.24,wave:'square',volume:.016,slide:-190,detune:-.006,lpHz:1300,delay:.036},{freq:76,duration:.18,wave:'triangle',volume:.007,slide:-52,lpHz:900,delay:.18}]),noise:Object.freeze([{duration:.14,volume:.01,hp:800,delay:.01}])}),
   scoutHit:Object.freeze({tones:Object.freeze([{freq:390,duration:.034,wave:'square',volume:.0125,slide:-360,detune:.006,lpHz:3800}]),noise:Object.freeze([{duration:.026,volume:.0025,hp:1800,delay:.004}])}),
   escortHit:Object.freeze({tones:Object.freeze([{freq:510,duration:.052,wave:'square',volume:.0135,slide:-320,detune:.006,lpHz:4100},{freq:230,duration:.056,wave:'square',volume:.0062,slide:-170,detune:-.005,lpHz:2200,delay:.01}]),noise:Object.freeze([{duration:.032,volume:.003,hp:1550,delay:.006}])}),
   flagshipHit:Object.freeze({tones:Object.freeze([{freq:650,duration:.07,wave:'square',volume:.0145,slide:-250,detune:.006,lpHz:4500},{freq:320,duration:.09,wave:'square',volume:.0074,slide:-160,detune:-.004,lpHz:2500,delay:.018},{freq:156,duration:.07,wave:'triangle',volume:.005,slide:-92,detune:.004,lpHz:1700,delay:.058}]),noise:Object.freeze([{duration:.05,volume:.0038,hp:1300,delay:.008}])}),
   enemyHit:Object.freeze({tones:Object.freeze([{freq:246,duration:.055,wave:'square',volume:.012,slide:-210,lpHz:3300}])}),
   bossHit:Object.freeze({tones:Object.freeze([{freq:320,duration:.068,wave:'square',volume:.013,slide:-120,lpHz:3600}])}),
   enemyBoom:Object.freeze({tones:Object.freeze([{freq:420,duration:.04,wave:'square',volume:.009,slide:-320,lpHz:3900},{freq:220,duration:.08,wave:'triangle',volume:.006,slide:-110,lpHz:2100,delay:.014}])}),
   bossBoom:Object.freeze({tones:Object.freeze([{freq:360,duration:.05,wave:'square',volume:.011,slide:-300,lpHz:3900},{freq:180,duration:.12,wave:'triangle',volume:.009,slide:-90,lpHz:2000,delay:.018}])}),
   stagePulse:Object.freeze({variants:Object.freeze([Object.freeze({tones:Object.freeze([{freq:196,duration:.08,wave:'square',volume:.003,slide:4,lpHz:1700},{freq:392,duration:.058,wave:'square',volume:.008,slide:-10,lpHz:3000,delay:.012}])})])}),
   stageTransition:Object.freeze({seq:[294,392,523,784],step:.052,wave:'square',volume:.012,slide:22,lpHz:3600}),
   attractEnter:Object.freeze({byPhase:Object.freeze({wait:Object.freeze({seq:[294,392,494,659],step:.06,wave:'square',volume:.009,slide:12,lpHz:3100,allowIdle:1}),demo:Object.freeze({seq:[247,330,440,587],step:.066,wave:'square',volume:.008,slide:10,lpHz:2900,allowIdle:1})})}),
   attractPulse:Object.freeze({byPhase:Object.freeze({wait:Object.freeze({allowIdle:1,variants:Object.freeze([Object.freeze({tones:Object.freeze([{freq:330,duration:.06,wave:'square',volume:.005,slide:6,lpHz:2500}])})])}),demo:Object.freeze({allowIdle:1,variants:Object.freeze([Object.freeze({tones:Object.freeze([{freq:294,duration:.065,wave:'square',volume:.0048,slide:5,lpHz:2300}])})])})})}),
   uiTick:Object.freeze({tones:Object.freeze([{freq:920,duration:.024,wave:'square',volume:.004,slide:-110,lpHz:5400}])}),
   uiConfirm:Object.freeze({seq:[660,880],step:.04,wave:'square',volume:.008,slide:30,lpHz:4200}),
   playerHit:Object.freeze({tones:Object.freeze([{freq:210,duration:.13,wave:'square',volume:.018,slide:-220,lpHz:2200}])}),
   gameOver:Object.freeze({seq:[392,294,247,196,147],step:.086,wave:'square',volume:.014,slide:-72,lpHz:2200})
  })
 })
});

const GUARDIANS_STAGE_THEME_PROGRESSION=Object.freeze([
 {fromStage:1,id:'signal-rack',frameAccent:'signal-crimson',atmosphereTheme:'signal-rack',challengeBrand:'none',bossArchetype:'flagship'}
]);

const GUARDIANS_FORMATION_LAYOUTS=Object.freeze([
 {fromStage:1,gx:18.5,gy:15.6,oy:30}
]);

const GUARDIANS_FRAME_ACCENTS=Object.freeze({
 'signal-crimson':Object.freeze({
  frameLine:'rgba(255,120,120,.34)',
  frameGlow:'rgba(255,214,115,.12)',
  shellLine:'rgba(255,112,94,.34)',
  shellGlow:'rgba(255,232,150,.12)',
  marqueeBorder:'#ff5b5b',
  marqueeGlow:'#ffd86d'
 }),
 'classic-blue':Object.freeze({
  frameLine:'rgba(171,214,255,.28)',
  frameGlow:'rgba(255,220,122,.08)',
  shellLine:'rgba(83,140,255,.32)',
  shellGlow:'rgba(255,222,134,.08)',
  marqueeBorder:'#f05e1d',
  marqueeGlow:'#38d6a0'
 })
});

const GUARDIANS_STAGE_CADENCE=Object.freeze({
 challengeFirstStage:9999,
 challengeEvery:9999
});

const GUARDIANS_CHALLENGE_LAYOUT=Object.freeze({
 groups:0,
 enemiesPerGroup:0,
 upperBandRatio:0,
 spawnOffsetX:0,
 waveSpacingY:0,
 rowSpacingY:0,
 waveDelay:0,
 slotDelay:0,
 laneTypes:Object.freeze([])
});

const GUARDIANS_SCORING_RULES=Object.freeze({
 challengeEnemy:0,
 perfectChallengeClear:0,
 rescueJoin:0,
 extends:Object.freeze({first:30000,recurring:70000}),
 carriedFighter:Object.freeze({standby:0,attacking:0}),
 enemyKills:Object.freeze({
  bee:Object.freeze({formation:30,dive:60}),
  but:Object.freeze({formation:40,dive:80}),
  rogue:Object.freeze({formation:120,dive:240}),
  boss:Object.freeze({formation:150,dive:Object.freeze({solo:300,oneEscort:500,twoEscort:800})})
 }),
 challengeGroupBonuses:Object.freeze([])
});

const GUARDIANS_SCORE_ADVANCE_TABLE=Object.freeze([
 Object.freeze({
  id:'signal-scout',
  role:'scout',
  label:'Signal Scout',
  formationPoints:30,
  divePoints:60,
  referenceIntent:'lowest rank, repeated lower rows, higher value when diving'
 }),
 Object.freeze({
  id:'signal-escort',
  role:'escort',
  label:'Signal Escort',
  formationPoints:50,
  divePoints:100,
  referenceIntent:'red escort/charger rank with doubled attack value'
 }),
 Object.freeze({
  id:'signal-flagship',
  role:'flagship',
  label:'Signal Flagship',
  formationPoints:150,
  divePoints:300,
  oneEscortDivePoints:500,
  twoEscortDivePoints:800,
  referenceIntent:'top command ship with escalating escorted-dive value'
 }),
 Object.freeze({
  id:'player-interceptor',
  role:'player',
  label:'Guardian Interceptor',
  fireMode:'single-shot',
  referenceIntent:'single in-flight shot; no Aurora dual-fighter scoring branch'
 })
]);

const GUARDIANS_ATTRACT_MISSION=Object.freeze({
 id:'guardians-attract-mission-0.1',
 title:'WE ARE THE GALAXY GUARDIANS',
 lines:Object.freeze([
  'MISSION: BREAK THE SIGNAL RACK',
  'WATCH FOR FLAGSHIP ESCORT DIVES',
  'SINGLE SHOT ONLY - MAKE IT COUNT'
 ]),
 scoreAdvanceTableId:'guardians-score-advance-table-0.1',
 referenceIntent:'Guardians-owned mission and score-table language derived from Galaxian attract/score-table promoted windows, not Aurora wait-mode copy.'
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
  atmosphereTheme:'signal-rack'
 }),
 platformFrontDoor:Object.freeze({
  noticeHint:'Galaxy Guardians is a shell preview for the next Platinum application.',
  pickerHint:'CHOOSE GAME TO SWITCH BACK TO AURORA'
 }),
 preview:Object.freeze({
  banner:'SNEAK PEEK',
  title:'Galaxy Guardians',
  subtitle:'SECOND GAME PREVIEW ON PLATINUM',
  image:'assets/galaxy-guardians-coming-soon.svg',
  imageAlt:'Galaxy Guardians sneak peek splash art',
  cardLine:'Sneak peek shell with pack-owned preview identity and a dev-only scout-wave slice.',
  summary:'Galaxy Guardians is the planned Galaxian-inspired sibling title for Platinum. This preview now lives as pack-owned content instead of one-off shell copy.',
  detail:'Today it proves the second-game identity, shell theme, picker flow, preview modal, safe launch behavior, and dev-only scout-wave runtime while Aurora remains the primary public cabinet.',
  highlights:Object.freeze([
   'Scout-wave formation pressure with flagship escorts',
   'Single-shot arcade pacing and wrap-around threat planning',
   'Shared Platinum controls, services, replay, and release shell'
  ]),
  milestones:Object.freeze([
   Object.freeze({label:'Pack identity and shell preview',state:'online'}),
   Object.freeze({label:'Reference footage and movement map',state:'next'}),
   Object.freeze({label:'Visual and audio identity catalog',state:'online'}),
   Object.freeze({label:'Minimal scout-wave playable slice',state:'online'}),
   Object.freeze({label:'Application-owned scoring harness',state:'online'})
  ]),
  launchFallbackToast:'Galaxy Guardians sneak peek is preview-only. Launching Aurora Galactica.'
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
 atmosphereThemes:GUARDIANS_ATMOSPHERE_THEMES,
 audioThemes:GUARDIANS_AUDIO_THEMES,
 alienVisualCatalog:GUARDIANS_ALIEN_VISUAL_CATALOG,
 audioCueCatalog:GUARDIANS_AUDIO_CUE_CATALOG,
 attractMission:GUARDIANS_ATTRACT_MISSION,
 scoreAdvanceTable:GUARDIANS_SCORE_ADVANCE_TABLE,
 referenceTimings:GUARDIANS_REFERENCE_TIMINGS,
 stageCadence:GUARDIANS_STAGE_CADENCE,
 stageBandProfiles:GUARDIANS_STAGE_BAND_PROFILES,
 formationLayouts:GUARDIANS_FORMATION_LAYOUTS,
 challengeLayout:GUARDIANS_CHALLENGE_LAYOUT,
 stageThemeProgression:GUARDIANS_STAGE_THEME_PROGRESSION,
 frameAccents:GUARDIANS_FRAME_ACCENTS,
 scoring:GUARDIANS_SCORING_RULES
});

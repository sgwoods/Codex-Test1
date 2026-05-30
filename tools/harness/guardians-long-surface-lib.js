const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const ADAPTER_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-gameplay-adapter.js');
const RUNTIME_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-runtime.js');

function round(value, places = 1){
 const scale = 10 ** places;
 return Math.round((+value || 0) * scale) / scale;
}

function clamp01(value){
 return Math.max(0, Math.min(1, +value || 0));
}

function average(values = []){
 const list = values.filter(Number.isFinite);
 return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
}

function loadGuardiansVm(){
 const sandbox = {
  window: null,
  buildPlatformInfo: () => ({ compatibility: '' }),
  applicationReleaseRecord: (_gameKey, fallback = {}) => Object.assign({}, fallback || {}),
  BUILD_INFO: { releaseChannel: 'development' },
  GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES: Object.freeze({
   usesCaptureRescue: 0,
   usesDualFighterMode: 0,
   usesChallengeStages: 0,
   usesAuroraScoring: 0,
   usesAuroraEnemyFamilies: 0
  })
 };
 sandbox.window = sandbox;
 vm.createContext(sandbox);
 vm.runInContext(
  `${fs.readFileSync(PACK_SOURCE, 'utf8')}\n${fs.readFileSync(ADAPTER_SOURCE, 'utf8')}\n${fs.readFileSync(RUNTIME_SOURCE, 'utf8')}`,
  sandbox,
  { filename: 'galaxy-guardians-long-surface-vm.js' }
 );
 vm.runInContext(`
  this.GALAXY_GUARDIANS_PACK = GALAXY_GUARDIANS_PACK;
  this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
  this.createGalaxyGuardiansRuntimeState = createGalaxyGuardiansRuntimeState;
  this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
  this.summarizeGalaxyGuardiansRuntime = summarizeGalaxyGuardiansRuntime;
  this.guardiansStageRank = guardiansStageRank;
  this.guardiansRuntimeRules = guardiansRuntimeRules;
  this.galaxyGuardiansHarnessPersonaInput = galaxyGuardiansHarnessPersonaInput;
  this.guardiansHarnessPersonaCfgForKey = guardiansHarnessPersonaCfgForKey;
 `, sandbox);
 return sandbox;
}

function pickStageTheme(pack, stage){
 let theme = pack.stageThemeProgression[0] || {};
 for(const candidate of pack.stageThemeProgression || []){
  if(stage >= candidate.fromStage) theme = candidate;
  else break;
 }
 return theme;
}

function eventCounts(events = []){
 const counts = {};
 for(const event of events){
  const key = String(event?.type || '').trim();
  if(!key) continue;
  counts[key] = (counts[key] || 0) + 1;
 }
 return counts;
}

function simulatePersona(ctx, persona, {
 stage = 1,
 ships = 3,
 seed = 1,
 maxPlayableStage = 6,
 durationSeconds = 180
} = {}){
 const state = ctx.createGalaxyGuardiansRuntimeState({
  stage,
  ships,
  seed,
  maxPlayableStage
 });
 const frames = Math.round(durationSeconds * 60);
 for(let i = 0; i < frames && !state.gameOver; i++){
  const input = ctx.galaxyGuardiansHarnessPersonaInput(state, persona);
  ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, input);
 }
 const summary = ctx.summarizeGalaxyGuardiansRuntime(state);
 const events = summary.events || [];
 const counts = eventCounts(events);
 return {
  persona,
  stageStart: stage,
  ships,
  maxPlayableStage,
  durationSeconds,
  simT: round(summary.events?.length ? summary.events[summary.events.length - 1]?.t || 0 : 0, 3),
  finalStage: summary.stage || stage,
  stageRank: summary.stageRank || 0,
  score: summary.score || 0,
  lives: summary.lives || 0,
  completed: !!summary.completed,
  gameOver: !!summary.gameOver,
  gameOverReason: summary.gameOverReason || '',
  eventCounts: counts,
  stageAdvances: counts.stage_advance || 0,
  waveClears: counts.wave_clear || 0,
  playerLosses: counts.player_lost || 0,
  progression: events
   .filter(event => event.type === 'stage_advance')
   .map(event => ({ stage: event.stage, t: round(event.t, 3), score: event.score || 0 })),
  lossReasons: events
   .filter(event => event.type === 'player_lost')
   .map(event => String(event.cause || ''))
 };
}

function buildRuntimeBands(ctx){
 const stages = [1, 3, 5, 7, 9, 11];
 const pack = ctx.GALAXY_GUARDIANS_PACK;
 return stages.map(stage => {
  const rules = ctx.guardiansRuntimeRules(stage);
  const theme = pickStageTheme(pack, stage);
  return {
   stage,
   rank: ctx.guardiansStageRank(stage),
   themeId: theme.id || '',
   frameAccent: theme.frameAccent || '',
   atmosphereTheme: theme.atmosphereTheme || '',
   firstScoutDiveDelay: rules.firstScoutDiveDelay,
   flagshipEscortDelay: rules.flagshipEscortDelay,
   scoutDiveIntervalBase: rules.scoutDiveIntervalBase,
   firstEnemyShotDelay: rules.firstEnemyShotDelay,
   enemyShotIntervalBase: rules.enemyShotIntervalBase,
   enemyShotVy: rules.enemyShotVy,
   diveBaseVy: rules.diveBaseVy,
   diveAccel: rules.diveAccel,
   enemyShotMaxLive: rules.enemyShotMaxLive
  };
 });
}

function stageBandPressureSample(ctx, {
 stage = 1,
 ships = 5,
 seed = 1,
 seconds = 14
} = {}){
 const state = ctx.createGalaxyGuardiansRuntimeState({
  stage,
  ships,
  seed,
  maxPlayableStage: Math.max(stage + 2, 6)
 });
 state.player.inv = 999;
 const rules = ctx.guardiansRuntimeRules(stage);
 const totalFrames = Math.max(1, Math.round(seconds * 60));
 let lowerFieldThreatFrames = 0;
 let lowerFieldMultiThreatFrames = 0;
 let maxConcurrentThreats = 0;
 let maxHorizontalOvershootPx = 0;
 for(let i = 0; i < totalFrames && !state.gameOver; i++){
  ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  const summary = ctx.summarizeGalaxyGuardiansRuntime(state);
  const activeDives = (summary.activeDives || []).filter(dive => dive.mode === 'diving' || dive.mode === 'wrapping');
  const lowerFieldThreats = activeDives.filter(dive => dive.y >= rules.playfieldHeight * 0.42);
  const concurrentThreats = lowerFieldThreats.length + (summary.enemyShotCount || 0);
  if(lowerFieldThreats.length > 0) lowerFieldThreatFrames++;
  if(concurrentThreats >= 2) lowerFieldMultiThreatFrames++;
  if(concurrentThreats > maxConcurrentThreats) maxConcurrentThreats = concurrentThreats;
  for(const dive of activeDives){
   const x = +dive.x || 0;
   const overshoot = x < 0 ? Math.abs(x) : x > rules.playfieldWidth ? x - rules.playfieldWidth : 0;
   if(overshoot > maxHorizontalOvershootPx) maxHorizontalOvershootPx = overshoot;
  }
 }
 const events = state.events || [];
 return {
  stage,
  stageRank: ctx.guardiansStageRank(stage),
  seconds,
  firstScoutDiveT: events.find(event => event.type === 'alien_dive_start')?.t ?? null,
  firstFlagshipDiveT: events.find(event => event.type === 'flagship_dive_start')?.t ?? null,
  firstWrapT: events.find(event => event.type === 'enemy_wrap_or_return')?.t ?? null,
  enemyShotCountByWindow: events.filter(event => event.type === 'enemy_shot').length,
  wrapCountByWindow: events.filter(event => event.type === 'enemy_wrap_or_return').length,
  lowerFieldThreatShare: round(lowerFieldThreatFrames / totalFrames, 3),
  lowerFieldMultiThreatShare: round(lowerFieldMultiThreatFrames / totalFrames, 3),
  maxConcurrentThreats,
  maxHorizontalOvershootPx: round(maxHorizontalOvershootPx, 2)
 };
}

function monotonicPairs(values = [], fn = (a, b) => a > b){
 let ok = 0;
 for(let i = 1; i < values.length; i++){
  if(fn(values[i - 1], values[i])) ok++;
 }
 return values.length > 1 ? ok / (values.length - 1) : 0;
}

function buildGuardiansLongSurfaceArtifact({ createdOn = new Date().toISOString().slice(0, 10) } = {}){
 const ctx = loadGuardiansVm();
 const pack = ctx.GALAXY_GUARDIANS_PACK;
 const runtimeBands = buildRuntimeBands(ctx);
 const competitiveRuns = ['novice', 'advanced', 'expert', 'professional'].map((persona, index) =>
  simulatePersona(ctx, persona, {
   stage: 1,
   ships: 3,
   seed: 5101 + index * 37,
   maxPlayableStage: 6,
   durationSeconds: 180
  })
 );
 const reviewSeeds = {
  advanced: 9013,
  expert: 9011,
  professional: 9017
 };
 const reviewRuns = ['advanced', 'expert', 'professional'].map((persona, index) =>
  simulatePersona(ctx, persona, {
   stage: 1,
   ships: 5,
   seed: reviewSeeds[persona] || (7101 + index * 41),
   maxPlayableStage: 6,
   durationSeconds: 240
  })
 );
 const midrunStressRuns = ['advanced', 'expert', 'professional'].map((persona, index) =>
  simulatePersona(ctx, persona, {
   stage: 5,
   ships: 5,
   seed: 9101 + index * 43,
   maxPlayableStage: 9,
   durationSeconds: 120
  })
 );
 const stageBandAuthoritySamples = {
  stage3: stageBandPressureSample(ctx, { stage: 3, ships: 5, seed: 12031, seconds: 14 }),
  stage5: stageBandPressureSample(ctx, { stage: 5, ships: 5, seed: 12053, seconds: 14 }),
  stage7: stageBandPressureSample(ctx, { stage: 7, ships: 5, seed: 12071, seconds: 14 }),
  stage9: stageBandPressureSample(ctx, { stage: 9, ships: 5, seed: 12091, seconds: 14 })
 };
 const stageBandPersonaRuns = [3, 5, 7, 9].map((stage, index) =>
  simulatePersona(ctx, 'professional', {
   stage,
   ships: 5,
   seed: 13001 + index * 29,
   maxPlayableStage: Math.max(stage + 1, 6),
   durationSeconds: 150
  })
 );

 const distinctThemes = new Set(runtimeBands.map(band => band.themeId).filter(Boolean)).size;
 const distinctAccents = new Set(runtimeBands.map(band => band.frameAccent).filter(Boolean)).size;
 const firstScoutMonotonic = monotonicPairs(runtimeBands.map(band => band.firstScoutDiveDelay), (a, b) => a > b);
 const firstEnemyShotMonotonic = monotonicPairs(runtimeBands.map(band => band.firstEnemyShotDelay), (a, b) => a > b);
 const shotVelocityMonotonic = monotonicPairs(runtimeBands.map(band => band.enemyShotVy), (a, b) => a < b);
 const capMonotonic = monotonicPairs(runtimeBands.map(band => band.enemyShotMaxLive), (a, b) => a <= b);
 const lateBandCapStable = runtimeBands[runtimeBands.length - 1].enemyShotMaxLive === runtimeBands[runtimeBands.length - 2].enemyShotMaxLive ? 1 : 0;
 const pressureSpan = clamp01((runtimeBands[runtimeBands.length - 1].enemyShotVy - runtimeBands[0].enemyShotVy) / 60);
 const timingSpan = clamp01((runtimeBands[0].firstEnemyShotDelay - runtimeBands[runtimeBands.length - 1].firstEnemyShotDelay) / 2.4);
 const diveSpan = clamp01((runtimeBands[0].firstScoutDiveDelay - runtimeBands[runtimeBands.length - 1].firstScoutDiveDelay) / 0.7);

 const stageArcPressureScore10 = round(
  5
  + ((firstScoutMonotonic + firstEnemyShotMonotonic + shotVelocityMonotonic + capMonotonic) / 4) * 1.1
  + pressureSpan * 0.7
  + timingSpan * 0.6
  + diveSpan * 0.5
  + lateBandCapStable * 0.3
 );

 const stagePresentationScore10 = round(
  5.5
  + clamp01((distinctThemes - 1) / 3) * 1.1
  + clamp01((distinctAccents - 1) / 3) * 0.8
 );

 const competitiveScoreOrder = (
  competitiveRuns[0].score < competitiveRuns[1].score
  && competitiveRuns[1].score < competitiveRuns[2].score
 ) ? 1 : 0;
 const reviewLongHold = reviewRuns.some(run => !run.gameOver || run.simT >= 180) ? 1 : 0;
 const midrunLongHold = midrunStressRuns.some(run => !run.gameOver) ? 1 : 0;
 const uniqueCompetitiveScores = new Set(competitiveRuns.map(run => run.score)).size;
 const personaReviewUtilityScore10 = round(
  5.1
  + clamp01(uniqueCompetitiveScores / competitiveRuns.length) * 0.7
  + competitiveScoreOrder * 0.4
  + reviewLongHold * 0.4
  + midrunLongHold * 0.3
 );

 const bestMidrun = midrunStressRuns.slice().sort((a, b) => b.score - a.score)[0];
 const longestMidrun = midrunStressRuns.slice().sort((a, b) => b.simT - a.simT)[0];
 const midrunAnyAdvance = midrunStressRuns.some(run => run.stageAdvances > 0) ? 1 : 0;
 const midrunSurvivabilityScore10 = round(
  4.8
  + clamp01((longestMidrun?.simT || 0) / 120) * 0.7
  + clamp01((bestMidrun?.score || 0) / 2400) * 0.6
  + midrunAnyAdvance * 0.5
 );
 const stageBandSamples = Object.values(stageBandAuthoritySamples);
 const earlyBands = [stageBandAuthoritySamples.stage3, stageBandAuthoritySamples.stage5];
 const sustainedBands = [stageBandAuthoritySamples.stage7, stageBandAuthoritySamples.stage9];
 const stageBandMonotonic = (
  earlyBands[0].enemyShotCountByWindow < earlyBands[1].enemyShotCountByWindow
  && sustainedBands[0].enemyShotCountByWindow <= sustainedBands[1].enemyShotCountByWindow
  && earlyBands[0].lowerFieldThreatShare <= earlyBands[1].lowerFieldThreatShare
  && sustainedBands[0].lowerFieldThreatShare <= sustainedBands[1].lowerFieldThreatShare
 ) ? 1 : 0;
 const earlyEscalationScore10 = round(
  5
  + clamp01((earlyBands[1].enemyShotCountByWindow - earlyBands[0].enemyShotCountByWindow) / 5) * 1.1
  + clamp01((earlyBands[1].lowerFieldThreatShare - earlyBands[0].lowerFieldThreatShare) / .12) * 0.9
  + clamp01((earlyBands[1].wrapCountByWindow - earlyBands[0].wrapCountByWindow) / 2) * 0.5
  + stageBandMonotonic * 0.6
 );
 const sustainedPressureScore10 = round(
  5.1
  + clamp01((sustainedBands[1].enemyShotCountByWindow - sustainedBands[0].enemyShotCountByWindow) / 4) * 0.9
  + clamp01((sustainedBands[1].maxConcurrentThreats - sustainedBands[0].maxConcurrentThreats) / 3) * 0.9
  + clamp01((sustainedBands[1].lowerFieldMultiThreatShare - sustainedBands[0].lowerFieldMultiThreatShare) / .12) * 0.8
  + clamp01(average(sustainedBands.map(band => band.wrapCountByWindow)) / 4) * 0.5
 );
 const wrapContinuityScore10 = round(
  5.2
  + clamp01(average(stageBandSamples.map(band => band.wrapCountByWindow)) / 4) * 1.2
  + clamp01(1 - average(stageBandSamples.map(band => band.maxHorizontalOvershootPx)) / 8) * 1.3
  + clamp01(average(stageBandSamples.map(band => band.lowerFieldThreatShare)) / .28) * 0.7
 );
 const laterBandAdvances = stageBandPersonaRuns.filter(run => run.stageAdvances > 0).length;
 const clearPotentialScore10 = round(
  4.9
  + clamp01(laterBandAdvances / stageBandPersonaRuns.length) * 1.3
  + clamp01(average(stageBandPersonaRuns.map(run => run.simT)) / 150) * 0.9
  + clamp01(average(stageBandPersonaRuns.map(run => run.score)) / 3500) * 0.8
 );
 const stageBandAuthorityScore10 = round(
  (earlyEscalationScore10 * 0.28)
  + (sustainedPressureScore10 * 0.3)
  + (wrapContinuityScore10 * 0.22)
  + (clearPotentialScore10 * 0.2)
 );

 const categories = [
  {
   id: 'stage-band-pressure-grammar',
   label: 'Stage-band pressure grammar',
   weight: 28,
   score10: stageArcPressureScore10,
   currentRead: 'The longer surface now escalates in readable stage bands instead of capping meaningfully after stage five. Stage one stays anchored, stages three/five/seven tighten first-dive and enemy-shot timing, and stages nine/eleven define a bounded later-session pressure loop.',
   remainingGap: 'The later bands are still proxy-tuned from promoted timing evidence rather than frame-verified late-session reference tracks.'
  },
  {
   id: 'stage-presentation-progression',
   label: 'Stage presentation progression',
   weight: 22,
   score10: stagePresentationScore10,
   currentRead: 'Guardians now uses pack-owned stage themes, accents, and atmosphere shifts across the longer run, so later levels can look like a deepening game instead of one static preview rack.',
   remainingGap: 'The backgrounds are still starfield-family variations rather than fully reference-approved stage-specific presentation surfaces.'
  },
  {
   id: 'persona-review-utility',
   label: 'Persona review utility',
   weight: 28,
   score10: personaReviewUtilityScore10,
   currentRead: 'The new novice/advanced/expert/professional personas now produce different survivability and scoring shapes, and the longer-review harnesses can keep at least one stronger persona alive long enough to expose where the current stage arc starts to fail.',
   remainingGap: 'The personas still need better stage-clear consistency before they can be treated as authoritative late-session critics.'
  },
  {
   id: 'midrun-survivability-and-clear-potential',
   label: 'Midrun survivability and clear potential',
   weight: 22,
   score10: midrunSurvivabilityScore10,
   currentRead: 'Stage-five stress is now measurable as its own band, which makes it much easier to see that lower-field dive collisions and sustained shot pressure are still the weakest part of the current longer-run feel.',
   remainingGap: 'No current persona cleanly converts the stage-five stress band into a consistent clear, so this remains the main long-surface tuning target.'
  }
 ];

 const overallLongSurfaceScore10 = round(
  categories.reduce((sum, category) => sum + category.weight * category.score10, 0)
  / categories.reduce((sum, category) => sum + category.weight, 0)
 );

 return {
  gameKey: 'galaxy-guardians-preview',
  artifactType: 'long-surface-and-persona-conformance-review',
  version: '0.1-dev-preview',
  createdOn,
  status: 'dev-preview-long-surface-and-persona-review-not-public-release',
  purpose: 'Extend Galaxy Guardians conformance beyond the one-level public preview by scoring the real longer-run shape the game currently supports: repeated rack pressure, stage-band escalation, staged shell presentation, and persona-guided review runs.',
  sourceEvidence: {
   packSource: 'src/js/13-galaxy-guardians-game-pack.js',
   gameplayAdapter: 'src/js/13-galaxy-guardians-gameplay-adapter.js',
   runtimeSource: 'src/js/13-galaxy-guardians-runtime.js',
   referenceConformance: 'reference-artifacts/analyses/galaxy-guardians-identity/reference-conformance-0.1.json',
   playtestConformanceReview: 'reference-artifacts/analyses/galaxy-guardians-identity/playtest-conformance-review-0.1.json',
   stageRankPressure: 'reference-artifacts/analyses/galaxy-guardians-identity/stage-rank-pressure-0.1.json',
   referenceProfile: 'reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json',
   promotedEventLog: 'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json'
  },
  summary: {
   overallLongSurfaceScore10,
   stageArcPressureScore10,
   stagePresentationScore10,
   personaReviewUtilityScore10,
    midrunSurvivabilityScore10,
    stageBandAuthorityScore10,
    releaseRead: 'Guardians now has a real longer-surface review contract: stage-band pressure continues into later bands, stage presentation changes across the run, and personas can stress the game in differentiated ways. The main remaining weakness is still stage-five-and-beyond survivability and clean-clear consistency.'
  },
  stageBandModel: [
   {
    label: 'Opening establish',
    stages: '1-2',
    targetRead: 'Measured stage-one scout-wave contract with readable single-shot pressure and recoverable lower-field dives.'
   },
   {
    label: 'Early escalation',
    stages: '3-5',
    targetRead: 'Earlier dives, faster shots, and the first clear visual shift without pretending to be a wholly different ruleset.'
   },
   {
    label: 'Sustained pressure',
    stages: '7-9',
    targetRead: 'Later-session urgency where enemy-shot density and dive velocity rise again while the rules stay recognizably Galaxian-family.'
   },
   {
    label: 'Bounded late loop',
    stages: '11+',
    targetRead: 'A clamped high-pressure band suitable for long-session review, not an infinite exponential difficulty ramp.'
   }
  ],
  runtimeBands,
  stageBandAuthority: {
   sourceWindows: {
    stages3to5: [
     'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/frames/contact-sheet-reference-window.jpg',
     'reference-artifacts/analyses/galaxian-frame-reference/nenriki-15-wave-session/wrap-return-pressure/contact-sheet.jpg'
    ],
    stages7to9: [
     'reference-artifacts/analyses/galaxian-frame-reference/nenriki-15-wave-session/flagship-escort-pressure/contact-sheet.jpg',
     'reference-artifacts/analyses/galaxian-frame-reference/nenriki-15-wave-session/wrap-return-pressure/contact-sheet.jpg'
    ]
   },
   summary: {
    earlyEscalationScore10,
    sustainedPressureScore10,
    wrapContinuityScore10,
    clearPotentialScore10,
    stageBandAuthorityScore10,
    releaseRead: 'Stage 3-5 and 6-9 now have a saved runtime-review authority layer instead of only plan prose. The main remaining late-band weakness is no longer “unknown shape”; it is the still-limited ability of a strong persona to convert that pressure into reliable clears.'
   },
   runtimeReviewBands: stageBandAuthoritySamples,
   personaBandRuns: stageBandPersonaRuns
  },
  personaRuns: {
   competitiveThreeShip: competitiveRuns,
   reviewFiveShip: reviewRuns,
   midrunStageFiveStress: midrunStressRuns
  },
  categories,
  resolvedInThisPass: [
   'Life loss no longer rebuilds the entire rack, so longer-surface review can preserve stage progress.',
   'Stage themes, accents, and atmosphere now progress across the Guardians run instead of staying visually flat.',
   'The persona layer is now game-owned, deterministic, and differentiated enough to stress the game in repeatable longer-surface review runs.',
   'Stage 3-5 and 6-9 behavior authority now lives in the maintained long-surface artifact instead of only in plan text.'
  ],
  remainingPriorityIssues: [
   'Stage-five-and-beyond dive collision fairness still needs the next motion-pressure pass.',
   'Professional/expert personas need more reliable later-band clear potential before they become authoritative tuning baselines.',
   'Audio still needs another human-reviewed pass after the stronger recurring rack pulse and combat-presence cleanup, especially around the remaining weakest live-play cues.'
  ]
 };
}

module.exports = {
 ROOT,
 buildGuardiansLongSurfaceArtifact
};

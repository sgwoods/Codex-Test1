// Disabled Galaxy Guardians gameplay adapter skeleton for the first owned 0.1 slice.

const GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES=Object.freeze({
 usesCaptureRescue:0,
 usesDualFighterMode:0,
 usesChallengeStages:0,
 usesAuroraScoring:0,
 usesAuroraEnemyFamilies:0
});

const GALAXY_GUARDIANS_REFERENCE_PROFILE=Object.freeze({
 profile:'reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json',
 manifest:'reference-artifacts/analyses/galaxian-reference/source-manifest.json',
 promotedEventLog:'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json',
 status:'source-manifested-contact-sheets-and-waveforms',
 promotedEventStatus:'promoted-reviewed-event-windows',
 promotedEventCount:11,
 sourceCount:3,
 sources:Object.freeze([
  Object.freeze({
   id:'matt-hawkins-arcade-intro',
   role:'arcade_intro_attract_and_opening',
   durationSeconds:59.267,
   frameRate:'30/1',
   dimensions:'560x720',
   contactSheet:'reference-artifacts/analyses/galaxian-reference/matt-hawkins-arcade-intro/frames/contact-sheet-reference-window.jpg',
   waveform:'reference-artifacts/analyses/galaxian-reference/matt-hawkins-arcade-intro/audio/waveform-reference-window.png'
  }),
  Object.freeze({
   id:'arcades-lounge-level-5',
   role:'mid_wave_pressure_and_level_5_clear',
   durationSeconds:58.322,
   frameRate:'25/1',
   dimensions:'1080x1920',
   contactSheet:'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/frames/contact-sheet-reference-window.jpg',
   waveform:'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/audio/waveform-reference-window.png'
  }),
  Object.freeze({
   id:'nenriki-15-wave-session',
   role:'long_session_wave_progression',
   durationSeconds:944.094,
   frameRate:'60/1',
   dimensions:'1080x1234',
   contactSheet:'reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/frames/contact-sheet-reference-window.jpg',
   waveform:'reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/audio/waveform-reference-window.png'
  })
 ]),
 nextPromotionTargets:Object.freeze([
  'formation_entry_start',
  'formation_entry_settle',
  'formation_rack_complete',
  'alien_dive_start',
  'flagship_dive_start',
  'escort_join',
  'player_shot_fired',
  'player_shot_resolved',
  'enemy_wrap_or_return'
 ])
});

const GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE=Object.freeze({
 id:'scout-wave-preview',
 evidenceState:'promoted-event-log-awaiting-runtime-implementation',
 referenceProfile:GALAXY_GUARDIANS_REFERENCE_PROFILE,
 playerFireMode:'single-shot',
 formationModel:'rack-with-independent-dives',
 flagshipModel:'flagship-with-escort-pressure',
 wrapThreatModel:'bottom-exit-or-return-explicit-preview-rule',
 firstWave:Object.freeze({
  formationRows:5,
  flagshipSlots:2,
  escortSlots:6,
  scoutSlots:30,
  entryStyle:'galaxian-rack-entry-awaiting-frame-timing',
  diveStyle:'solo-dive-and-flagship-escort-pressure'
 })
});

function createGalaxyGuardiansInitialState(opts={}){
 return Object.freeze({
  gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
  adapterState:'disabled-skeleton',
  stage:Math.max(1,+opts.stage||1),
  score:0,
  lives:Math.max(1,Math.min(9,+opts.ships||3)),
  fireMode:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.playerFireMode,
  formationModel:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.formationModel,
  flagshipModel:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.flagshipModel,
  wrapThreatModel:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.wrapThreatModel,
  evidenceState:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE.evidenceState,
  sourceProfile:GALAXY_GUARDIANS_REFERENCE_PROFILE.profile,
  promotedEventLog:GALAXY_GUARDIANS_REFERENCE_PROFILE.promotedEventLog,
  eventVocabulary:GALAXY_GUARDIANS_REFERENCE_PROFILE.nextPromotionTargets,
  captureRescue:null,
  dualFighter:null,
  challengeStage:null,
  auroraScoring:null,
  entities:Object.freeze([]),
  bullets:Object.freeze([]),
  events:Object.freeze([])
 });
}

const GALAXY_GUARDIANS_GAMEPLAY_ADAPTER_SKELETON=Object.freeze({
 gameKey:GALAXY_GUARDIANS_PACK.metadata.gameKey,
 label:'Galaxy Guardians disabled gameplay skeleton',
 enabled:0,
 publicPlayable:0,
 evidenceRequired:1,
 referenceProfile:GALAXY_GUARDIANS_REFERENCE_PROFILE,
 profile:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE,
 forbiddenAuroraCapabilities:GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES,
 createInitialState:createGalaxyGuardiansInitialState,
 start(){
  throw new Error('Galaxy Guardians gameplay adapter is disabled until measured 0.1 scout-wave evidence exists.');
 }
});

// Disabled Galaxy Guardians gameplay adapter skeleton for the first owned 0.1 slice.

const GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES=Object.freeze({
 usesCaptureRescue:0,
 usesDualFighterMode:0,
 usesChallengeStages:0,
 usesAuroraScoring:0,
 usesAuroraEnemyFamilies:0
});

const GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE=Object.freeze({
 id:'scout-wave-preview',
 evidenceState:'placeholder-awaiting-measured-galaxian-reference',
 playerFireMode:'single-shot',
 formationModel:'rack-with-independent-dives',
 flagshipModel:'flagship-with-escort-pressure',
 wrapThreatModel:'planned',
 firstWave:Object.freeze({
  formationRows:5,
  flagshipSlots:2,
  escortSlots:6,
  scoutSlots:30,
  entryStyle:'staggered-top-entry-placeholder',
  diveStyle:'curving-independent-dive-placeholder'
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
 profile:GALAXY_GUARDIANS_SCOUT_WAVE_PROFILE,
 forbiddenAuroraCapabilities:GALAXY_GUARDIANS_ADAPTER_FORBIDDEN_AURORA_CAPABILITIES,
 createInitialState:createGalaxyGuardiansInitialState,
 start(){
  throw new Error('Galaxy Guardians gameplay adapter is disabled until measured 0.1 scout-wave evidence exists.');
 }
});

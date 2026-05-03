#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCES = [
  'src/js/13-galaxy-guardians-game-pack.js',
  'src/js/13-galaxy-guardians-gameplay-adapter.js',
  'src/js/13-galaxy-guardians-runtime.js'
];
const IDENTITY_ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/identity-baseline-0.1.json';
const CANDIDATE_ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/candidate-0.1.json';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function loadGuardiansContext(){
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for(const relPath of SOURCES){
    const source = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    vm.runInContext(source, sandbox, { filename: path.join(ROOT, relPath) });
  }
  vm.runInContext(`
    this.GALAXY_GUARDIANS_PACK = GALAXY_GUARDIANS_PACK;
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
    this.createGalaxyGuardiansRuntimeState = createGalaxyGuardiansRuntimeState;
    this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
    this.summarizeGalaxyGuardiansRuntime = summarizeGalaxyGuardiansRuntime;
    this.startGuardiansDive = startGuardiansDive;
    this.loseGalaxyGuardiansPlayer = loseGalaxyGuardiansPlayer;
    this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
  `, sandbox);
  return sandbox;
}

function unique(values){
  return Array.from(new Set(values.filter(Boolean)));
}

function forceHit(ctx, role){
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  state.player.inv = 999;
  const alien = state.aliens.find(candidate => candidate.role === role);
  if(!alien) fail(`No Galaxy Guardians alien found for role ${role}`);
  state.player.x = alien.x;
  state.player.shot = { x: alien.x, y: alien.y + 3, vy: -4, active: 1 };
  ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  return ctx.summarizeGalaxyGuardiansRuntime(state);
}

function forceWrap(ctx){
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  state.player.inv = 999;
  const scout = state.aliens.find(candidate => candidate.role === 'scout');
  ctx.startGuardiansDive(state, scout, 0);
  scout.y = ctx.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.playfieldHeight
    + ctx.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.bottomExitPadding + 1;
  ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  return ctx.summarizeGalaxyGuardiansRuntime(state);
}

function forceLossAndGameOver(ctx){
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 1, seed: 1979 });
  state.player.inv = 0;
  ctx.loseGalaxyGuardiansPlayer(state, 'candidate_gate');
  return ctx.summarizeGalaxyGuardiansRuntime(state);
}

function forceWaveAdvance(ctx){
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  state.player.inv = 999;
  state.score = 1230;
  for(const alien of state.aliens) alien.hp = 0;
  ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  for(let i = 0; i < Math.ceil((ctx.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules.waveClearDelay + .1) * 60); i++){
    ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  }
  return ctx.summarizeGalaxyGuardiansRuntime(state);
}

function simulateRuntime(ctx){
  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 42719 });
  state.player.inv = 999;
  for(let i = 0; i < 520; i++){
    ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, {
      left: i % 160 < 80,
      right: i % 160 >= 80,
      fire: i % 54 === 0
    });
  }
  return ctx.summarizeGalaxyGuardiansRuntime(state);
}

function main(){
  const identity = readJson(IDENTITY_ARTIFACT);
  const candidate = readJson(CANDIDATE_ARTIFACT);
  const ctx = loadGuardiansContext();
  const pack = ctx.GALAXY_GUARDIANS_PACK;
  const profile = ctx.GALAXY_GUARDIANS_RUNTIME_PROFILE;
  const visualCatalog = pack.alienVisualCatalog || {};
  const cueCatalog = pack.audioCueCatalog || {};
  const audioTheme = pack.audioThemes?.['guardians-signal'] || {};
  const themeCueNames = Object.keys(audioTheme.cues || {});
  const candidateCueIds = new Set(candidate.candidateGate.requiredRuntimeCueIds || []);
  const forbidden = candidate.candidateGate.forbiddenPublicCapabilities || {};
  const requiredVisualIds = candidate.candidateGate.requiredVisualIds || [];
  const runtime = simulateRuntime(ctx);
  const forced = {
    flagshipHit: forceHit(ctx, 'flagship'),
    escortHit: forceHit(ctx, 'escort'),
    scoutHit: forceHit(ctx, 'scout'),
    wrap: forceWrap(ctx),
    loss: forceLossAndGameOver(ctx),
    waveAdvance: forceWaveAdvance(ctx)
  };
  const allAudioCueIds = unique([
    ...runtime.audioCueIds,
    ...Object.values(forced).flatMap(summary => summary.audioCueIds || [])
  ]);
  const payload = {
    gameKey: pack.metadata?.gameKey || '',
    candidateStatus: candidate.status,
    publicPlayable: pack.metadata?.playable,
    runtimePublicPlayable: profile.publicPlayable,
    runtimeDevPlayable: profile.devPlayable,
    requiredVisualIds,
    runtimeVisualIds: unique([profile.playerVisualId, ...Object.values(profile.alienCatalog || {}).map(entry => entry.visualId)]),
    visualCatalogKeys: Object.keys(visualCatalog),
    cueCatalogIds: Object.values(cueCatalog).map(entry => entry.id),
    themeCueNames,
    allAudioCueIds,
    runtimeEventTypes: runtime.eventTypes,
    forced: Object.fromEntries(Object.entries(forced).map(([key, summary]) => [key, {
      eventTypes: summary.eventTypes,
      audioCueIds: summary.audioCueIds,
      gameOver: summary.gameOver,
      score: summary.score
    }])),
    forbidden,
    packCapabilities: pack.capabilities,
    runtimeForbidden: profile.forbiddenAuroraCapabilities
  };

  if(payload.gameKey !== 'galaxy-guardians-preview' || identity.gameKey !== payload.gameKey || candidate.gameKey !== payload.gameKey){
    fail('Galaxy Guardians 0.1 candidate artifacts are not linked to the preview pack', payload);
  }
  if(candidate.status !== 'candidate-gate-dev-only-not-public-release'){
    fail('Galaxy Guardians 0.1 candidate artifact is not marked as dev-only candidate evidence', payload);
  }
  if(pack.metadata?.playable !== 0 || profile.publicPlayable !== 0 || profile.devPlayable !== 1){
    fail('Galaxy Guardians 0.1 candidate crossed the public playable boundary', payload);
  }
  for(const visualId of requiredVisualIds){
    if(!payload.visualCatalogKeys.includes(visualId) || !payload.runtimeVisualIds.includes(visualId)){
      fail(`Galaxy Guardians 0.1 candidate is missing runtime-owned visual ${visualId}`, payload);
    }
  }
  for(const sprite of identity.visualLanguage?.sprites || []){
    const runtimeRows = Array.from(visualCatalog[sprite.id]?.pixelRows || []);
    if(JSON.stringify(runtimeRows) !== JSON.stringify(sprite.rows)){
      fail(`Galaxy Guardians 0.1 candidate visual ${sprite.id} drifted from the identity artifact`, { sprite, runtimeRows });
    }
  }
  for(const cueName of identity.audioLanguage?.requiredCueNames || []){
    if(!themeCueNames.includes(cueName)){
      fail(`Galaxy Guardians 0.1 candidate theme is missing cue ${cueName}`, payload);
    }
  }
  for(const cueId of candidateCueIds){
    if(!allAudioCueIds.includes(cueId)){
      fail(`Galaxy Guardians 0.1 candidate runtime did not emit required cue id ${cueId}`, payload);
    }
    if(!payload.cueCatalogIds.includes(cueId)){
      fail(`Galaxy Guardians 0.1 candidate cue id ${cueId} is not in the pack audio catalog`, payload);
    }
  }
  for(const eventType of candidate.candidateGate.requiredRuntimeEvents || []){
    const seen = runtime.eventTypes.includes(eventType)
      || Object.values(forced).some(summary => summary.eventTypes.includes(eventType));
    if(!seen) fail(`Galaxy Guardians 0.1 candidate did not emit required event ${eventType}`, payload);
  }
  for(const [capability, expected] of Object.entries(forbidden)){
    if(pack.capabilities?.[capability] !== expected && profile.forbiddenAuroraCapabilities?.[capability] !== expected){
      fail(`Galaxy Guardians 0.1 candidate did not preserve forbidden capability ${capability}`, payload);
    }
  }
  for(const forbiddenName of ['bee', 'butterfly', 'boss', 'capture', 'dual', 'challenge']){
    if(requiredVisualIds.some(id => String(id).toLowerCase().includes(forbiddenName))){
      fail(`Galaxy Guardians 0.1 candidate visual id leaks Aurora-oriented naming: ${forbiddenName}`, payload);
    }
  }
  if(!forced.loss.gameOver || !forced.loss.eventTypes.includes('game_over')){
    fail('Galaxy Guardians 0.1 candidate did not prove the dev-preview game-over flow', payload);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: CANDIDATE_ARTIFACT,
    gameKey: payload.gameKey,
    visualIds: requiredVisualIds,
    runtimeCueIds: allAudioCueIds.filter(id => candidateCueIds.has(id)),
    runtimeEventTypes: unique([
      ...runtime.eventTypes,
      ...Object.values(forced).flatMap(summary => summary.eventTypes)
    ]),
    publicPlayable: profile.publicPlayable,
    devPlayable: profile.devPlayable
  }, null, 2));
}

main();

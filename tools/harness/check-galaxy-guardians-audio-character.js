#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'audio-character-0.1.json');
const SOURCES = [
  'src/js/13-galaxy-guardians-game-pack.js',
  'src/js/13-galaxy-guardians-gameplay-adapter.js',
  'src/js/13-galaxy-guardians-runtime.js'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function loadRuntime(){
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for(const relPath of SOURCES){
    vm.runInContext(fs.readFileSync(path.join(ROOT, relPath), 'utf8'), sandbox, {
      filename: path.join(ROOT, relPath)
    });
  }
  vm.runInContext(`
    this.GALAXY_GUARDIANS_PACK = GALAXY_GUARDIANS_PACK;
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
    this.createGalaxyGuardiansRuntimeState = createGalaxyGuardiansRuntimeState;
    this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
    this.summarizeGalaxyGuardiansRuntime = summarizeGalaxyGuardiansRuntime;
    this.loseGalaxyGuardiansPlayer = loseGalaxyGuardiansPlayer;
  `, sandbox);
  return sandbox;
}

function flattenTones(cue){
  const tones = [];
  if(Array.isArray(cue.tones)) tones.push(...cue.tones);
  if(Array.isArray(cue.seq)){
    cue.seq.forEach((freq, index) => tones.push({
      freq,
      duration: cue.step || 0,
      delay: index * (cue.step || 0),
      wave: cue.wave,
      slide: cue.slide || 0
    }));
  }
  if(cue.variants?.[0]) tones.push(...flattenTones(cue.variants[0]));
  return tones;
}

function cueMetrics(cue){
  const tones = flattenTones(cue || {});
  const freqs = tones.map(tone => +tone.freq || 0).filter(Boolean);
  const endTimes = tones.map(tone => (+tone.delay || 0) + (+tone.duration || 0));
  const peak = freqs.length ? Math.max(...freqs) : 0;
  const min = freqs.length ? Math.min(...freqs) : 0;
  const first = freqs[0] || 0;
  const last = freqs.at(-1) || 0;
  return {
    toneCount: tones.length,
    sequenceLength: Array.isArray(cue?.seq) ? cue.seq.length : 0,
    noiseCount: Array.isArray(cue?.noise) ? cue.noise.length : 0,
    peakFrequencyHz: peak,
    minFrequencyHz: min,
    firstFrequencyHz: first,
    lastFrequencyHz: last,
    totalDurationSeconds: +(endTimes.length ? Math.max(...endTimes) : 0).toFixed(3),
    waveFamilies: Array.from(new Set(tones.map(tone => tone.wave).filter(Boolean))).sort(),
    slideSigns: Array.from(new Set(tones.map(tone => Math.sign(+tone.slide || 0)))).sort(),
    maxStepSeconds: +(cue?.step || 0).toFixed(3)
  };
}

function forceHit(runtime, role){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  for(let i = 0; i < 90; i++) runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  const alien = state.aliens.find(entry => entry.role === role && entry.hp > 0);
  state.player.shot = { x: alien.x, y: alien.y + 3, vy: -5, active: 1 };
  runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  return runtime.summarizeGalaxyGuardiansRuntime(state);
}

function collectRuntimeCueIds(runtime){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 42719 });
  state.player.inv = 999;
  for(let i = 0; i < 520; i++){
    runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {
      left: i % 160 < 80,
      right: i % 160 >= 80,
      fire: i % 54 === 0
    });
  }
  const lossState = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 1, seed: 1979 });
  lossState.player.inv = 0;
  runtime.loseGalaxyGuardiansPlayer(lossState, 'audio_character_loss');
  const hitSummaries = [forceHit(runtime, 'flagship'), forceHit(runtime, 'escort'), forceHit(runtime, 'scout')];
  return Array.from(new Set([
    ...runtime.summarizeGalaxyGuardiansRuntime(state).audioCueIds,
    ...runtime.summarizeGalaxyGuardiansRuntime(lossState).audioCueIds,
    ...hitSummaries.flatMap(summary => summary.audioCueIds)
  ].filter(Boolean)));
}

function assertCueShape(name, metrics, req, allMetrics, payload){
  if(req.minPeakFrequencyHz && metrics.peakFrequencyHz < req.minPeakFrequencyHz) fail(`Cue ${name} peak frequency is too low`, payload);
  if(req.maxPeakFrequencyHz && metrics.peakFrequencyHz > req.maxPeakFrequencyHz) fail(`Cue ${name} peak frequency is too high`, payload);
  if(req.maxTotalDurationSeconds && metrics.totalDurationSeconds > req.maxTotalDurationSeconds) fail(`Cue ${name} is too long`, payload);
  if(req.minTotalDurationSeconds && metrics.totalDurationSeconds < req.minTotalDurationSeconds) fail(`Cue ${name} is too short`, payload);
  if(req.minToneCount && metrics.toneCount < req.minToneCount) fail(`Cue ${name} has too few tones`, payload);
  if(req.minSequenceLength && metrics.sequenceLength < req.minSequenceLength) fail(`Cue ${name} sequence is too short`, payload);
  if(req.maxStepSeconds && metrics.maxStepSeconds > req.maxStepSeconds) fail(`Cue ${name} sequence step is too slow`, payload);
  if(req.requiresNoise && metrics.noiseCount < 1) fail(`Cue ${name} is missing required noise`, payload);
  if(req.mustDescend && metrics.lastFrequencyHz >= metrics.firstFrequencyHz) fail(`Cue ${name} should descend`, payload);
  if(req.mustAscend && metrics.lastFrequencyHz <= metrics.firstFrequencyHz) fail(`Cue ${name} should ascend`, payload);
  if(req.mustBeLongerThan && metrics.totalDurationSeconds <= allMetrics[req.mustBeLongerThan].totalDurationSeconds){
    fail(`Cue ${name} should be longer than ${req.mustBeLongerThan}`, payload);
  }
}

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadRuntime();
  const pack = runtime.GALAXY_GUARDIANS_PACK;
  const theme = pack.audioThemes?.[artifact.themeId] || {};
  const cueCatalog = pack.audioCueCatalog || {};
  const cues = theme.cues || {};
  const metrics = Object.fromEntries(Object.keys(cues).map(name => [name, cueMetrics(cues[name])]));
  const runtimeCueIds = collectRuntimeCueIds(runtime);
  const payload = {
    artifactStatus: artifact.status,
    themeId: theme.id,
    requiredCueNames: artifact.requiredCueNames,
    cueCatalogKeys: Object.keys(cueCatalog),
    themeCueKeys: Object.keys(cues),
    metrics,
    runtimeCueIds
  };

  if(pack.metadata?.gameKey !== artifact.gameKey || artifact.status !== 'dev-preview-audio-character-contract-not-public-release-mix'){
    fail('Galaxy Guardians audio character artifact is not linked to the preview pack', payload);
  }
  for(const cueName of artifact.requiredCueNames || []){
    if(!cueCatalog[cueName]) fail(`Audio cue catalog is missing ${cueName}`, payload);
    if(!cues[cueName]) fail(`Guardians signal theme is missing ${cueName}`, payload);
  }
  for(const [name, req] of Object.entries(artifact.cueCharacter || {})){
    assertCueShape(name, metrics[name], req, metrics, payload);
  }
  const hitReq = artifact.roleHitSeparation || {};
  const hitNames = hitReq.requiredCueNames || [];
  for(let i = 0; i < hitNames.length; i++){
    for(let j = i + 1; j < hitNames.length; j++){
      const a = metrics[hitNames[i]], b = metrics[hitNames[j]];
      if(Math.abs(a.peakFrequencyHz - b.peakFrequencyHz) < hitReq.minimumPairwisePeakDeltaHz){
        fail(`Hit cues ${hitNames[i]} and ${hitNames[j]} are too close in peak frequency`, payload);
      }
      if(Math.abs(a.totalDurationSeconds - b.totalDurationSeconds) < hitReq.minimumPairwiseDurationDeltaSeconds){
        fail(`Hit cues ${hitNames[i]} and ${hitNames[j]} are too close in duration`, payload);
      }
    }
  }
  for(const cueId of artifact.runtimeCoverage?.requiredRuntimeCueIds || []){
    if(!runtimeCueIds.includes(cueId)) fail(`Runtime did not emit required cue id ${cueId}`, payload);
    for(const forbidden of artifact.runtimeCoverage?.forbiddenCueIdFragments || []){
      if(String(cueId).includes(forbidden)) fail(`Runtime cue id ${cueId} leaks forbidden fragment ${forbidden}`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    themeId: theme.id,
    cueMetrics: Object.fromEntries((artifact.requiredCueNames || []).map(name => [name, metrics[name]])),
    runtimeCueIds
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

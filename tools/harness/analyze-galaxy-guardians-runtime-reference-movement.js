#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const ADAPTER_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-gameplay-adapter.js');
const RUNTIME_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-runtime.js');
const OBJECT_TRACK = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'object-track-conformance-0.1.json');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'runtime-reference-movement-0.1.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function rounded(value, places = 3){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function mean(values){
  const list = values.filter(Number.isFinite);
  return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
}

function median(values){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
}

function closeness(value, target, tolerance){
  if(!Number.isFinite(+value) || !Number.isFinite(+target) || !Number.isFinite(+tolerance) || tolerance <= 0) return 0;
  return Math.max(0, 1 - Math.abs(value - target) / tolerance);
}

function loadRuntime(){
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for(const file of [PACK_SOURCE, ADAPTER_SOURCE, RUNTIME_SOURCE]){
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  vm.runInContext(`
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
    this.createGalaxyGuardiansRuntimeState = createGalaxyGuardiansRuntimeState;
    this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
    this.summarizeGalaxyGuardiansRuntime = summarizeGalaxyGuardiansRuntime;
  `, sandbox);
  return sandbox;
}

function summarizeTrack(points){
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const first = points[0];
  const last = points[points.length - 1];
  return {
    id: first.id,
    role: first.role,
    linkedTo: first.linkedTo || '',
    sampleCount: points.length,
    startSeconds: rounded(first.t),
    endSeconds: rounded(last.t),
    durationSeconds: rounded(last.t - first.t),
    xSpan: rounded(Math.max(...xs) - Math.min(...xs)),
    ySpan: rounded(Math.max(...ys) - Math.min(...ys)),
    descent: rounded(last.y - first.y),
    first: { x: rounded(first.x), y: rounded(first.y) },
    last: { x: rounded(last.x), y: rounded(last.y) },
    sampledPoints: points.filter((_, index) => index % Math.max(1, Math.floor(points.length / 8)) === 0).slice(0, 8)
  };
}

function simulateRuntime(runtime, seconds = 14){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 42719 });
  state.player.inv = 999;
  const rules = runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE.rules;
  const tracks = new Map();
  for(let frame = 0; frame < Math.ceil(seconds * 60); frame++){
    runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
    const summary = runtime.summarizeGalaxyGuardiansRuntime(state);
    for(const dive of summary.activeDives || []){
      const nx = dive.x / rules.playfieldWidth;
      const ny = dive.y / rules.playfieldHeight;
      if(ny < .42 || ny > .88) continue;
      if(!tracks.has(dive.id)) tracks.set(dive.id, []);
      tracks.get(dive.id).push({
        id: dive.id,
        role: dive.role,
        linkedTo: dive.linkedTo || '',
        t: rounded(state.t),
        x: rounded(nx),
        y: rounded(ny)
      });
    }
  }
  const tracklets = Array.from(tracks.values())
    .filter(points => points.length >= 3)
    .map(summarizeTrack);
  const descending = tracklets.filter(track => track.descent > .05 || track.ySpan > .12);
  const events = state.events || [];
  return {
    rules,
    events,
    summary: runtime.summarizeGalaxyGuardiansRuntime(state),
    tracklets,
    descending
  };
}

function main(){
  if(!fs.existsSync(OBJECT_TRACK)) fail('Missing object-track conformance artifact. Run npm run harness:analyze:galaxy-guardians-object-track-conformance first.');
  const objectTrack = readJson(OBJECT_TRACK);
  const runtime = loadRuntime();
  const sim = simulateRuntime(runtime, 14);
  const target = objectTrack.targetBands?.lowerFieldDivePressure || {};
  const runtimeStats = {
    trackletCount: sim.tracklets.length,
    descendingTrackletCount: sim.descending.length,
    medianCandidateDurationSeconds: rounded(median(sim.descending.map(track => track.durationSeconds))),
    medianCandidateXSpan: rounded(median(sim.descending.map(track => track.xSpan))),
    medianCandidateYSpan: rounded(median(sim.descending.map(track => track.ySpan))),
    firstScoutDiveT: sim.events.find(event => event.type === 'alien_dive_start')?.t ?? null,
    firstFlagshipDiveT: sim.events.find(event => event.type === 'flagship_dive_start')?.t ?? null,
    firstWrapT: sim.events.find(event => event.type === 'enemy_wrap_or_return')?.t ?? null,
    wrapCountByFourteenSeconds: sim.events.filter(event => event.type === 'enemy_wrap_or_return').length
  };
  const comparison = {
    referenceMedianDurationSeconds: target.medianCandidateDurationSeconds || 0,
    referenceMedianXSpan: target.medianCandidateXSpan || 0,
    referenceMedianYSpan: target.medianCandidateYSpan || 0,
    runtimeMedianDurationSeconds: runtimeStats.medianCandidateDurationSeconds,
    runtimeMedianXSpan: runtimeStats.medianCandidateXSpan,
    runtimeMedianYSpan: runtimeStats.medianCandidateYSpan,
    durationRatio: rounded(runtimeStats.medianCandidateDurationSeconds / Math.max(.001, target.medianCandidateDurationSeconds || 1)),
    xSpanRatio: rounded(runtimeStats.medianCandidateXSpan / Math.max(.001, target.medianCandidateXSpan || 1)),
    ySpanRatio: rounded(runtimeStats.medianCandidateYSpan / Math.max(.001, target.medianCandidateYSpan || 1))
  };
  const scoreParts = {
    durationFit: closeness(comparison.durationRatio, .7, .45),
    xSpanFit: closeness(comparison.xSpanRatio, .85, .45),
    ySpanFit: closeness(comparison.ySpanRatio, .95, .4),
    pressureAvailability: Math.min(1, sim.descending.length / Math.max(1, target.minimumDescendingTrackletsPerPressureWindow || 3)),
    eventCoverage: ['alien_dive_start', 'flagship_dive_start', 'escort_join', 'enemy_wrap_or_return'].filter(type => sim.events.some(event => event.type === type)).length / 4
  };
  const score10 = rounded(mean(Object.values(scoreParts)) * 10, 1);
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'runtime-reference-movement-comparison',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'runtime-vs-reference-track-comparison-not-public-release',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-runtime-reference-movement.js',
    sourceEvidence: {
      objectTrackConformance: rel(OBJECT_TRACK),
      movementPacing: 'reference-artifacts/analyses/galaxy-guardians-identity/movement-pacing-0.1.json'
    },
    referenceTargetBands: target,
    runtimeRules: {
      firstScoutDiveDelay: sim.rules.firstScoutDiveDelay,
      flagshipEscortDelay: sim.rules.flagshipEscortDelay,
      scoutDiveIntervalBase: sim.rules.scoutDiveIntervalBase,
      flagshipDiveIntervalBase: sim.rules.flagshipDiveIntervalBase,
      diveSwayAmplitude: sim.rules.diveSwayAmplitude,
      diveSwayHz: sim.rules.diveSwayHz,
      diveSideDrift: sim.rules.diveSideDrift,
      diveBaseVy: sim.rules.diveBaseVy,
      diveAccel: sim.rules.diveAccel,
      bottomExitPadding: sim.rules.bottomExitPadding
    },
    runtimeStats,
    comparison,
    scoreParts: Object.fromEntries(Object.entries(scoreParts).map(([key, value]) => [key, rounded(value * 10, 1)])),
    runtimeReferenceMovementScore10: score10,
    tuningRead: {
      constantsTunedFromReferenceProxy: true,
      remainingGap: 'Comparison uses connected-component target bands and runtime entity tracks. The next improvement should use final sprite recognition from extracted Galaxian assets.'
    },
    tracklets: sim.tracklets.slice(0, 18)
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    runtimeReferenceMovementScore10: score10,
    runtimeStats,
    comparison
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

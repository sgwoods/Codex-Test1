#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxy-guardians-identity',
  'opening-rack-motion-0.1.json'
);
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const RUNTIME_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-runtime.js');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rounded(value, places = 3){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function loadRuntime(){
  const packSource = fs.readFileSync(PACK_SOURCE, 'utf8');
  const runtimeSource = fs.readFileSync(RUNTIME_SOURCE, 'utf8');
  const sandbox = {
    window: null,
    buildPlatformInfo: () => ({ compatibility: '' }),
    applicationReleaseRecord: (_gameKey, fallback = {}) => Object.assign({}, fallback || {}),
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
  vm.runInContext(`${packSource}\n${runtimeSource}
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
    this.guardiansMarchOffset = guardiansMarchOffset;
  `, sandbox, { filename: 'galaxy-guardians-opening-rack-motion-vm.js' });
  return sandbox;
}

function countDirectionChanges(values){
  let lastSign = 0;
  let changes = 0;
  for(let i = 1; i < values.length; i++){
    const delta = (+values[i] || 0) - (+values[i - 1] || 0);
    const sign = Math.abs(delta) < 0.02 ? 0 : (delta > 0 ? 1 : -1);
    if(!sign) continue;
    if(lastSign && sign !== lastSign) changes++;
    lastSign = sign;
  }
  return changes;
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail(`Missing Guardians opening-rack artifact: ${path.relative(ROOT, ARTIFACT)}`);
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadRuntime();
  const rules = runtime.GALAXY_GUARDIANS_RUNTIME_PROFILE?.rules || {};
  const width = Math.max(1, +rules.playfieldWidth || 280);
  const cfg = artifact.runtimeExpectations || {};
  const representative = cfg.representativeAlien || { row: 0, col: 5 };
  const cohesionAliens = Array.isArray(cfg.cohesionAliens) && cfg.cohesionAliens.length
    ? cfg.cohesionAliens
    : [representative];
  const duration = Math.max(1, +cfg.sampledDurationSeconds || 17.833);
  const frames = Math.max(2, Math.ceil(duration * 60));

  const repOffsets = [];
  let minOffset = Infinity;
  let maxOffset = -Infinity;
  let maxSpread = 0;
  for(let frame = 0; frame <= frames; frame++){
    const t = (frame / frames) * duration;
    const sampleState = { t, stage: 1 };
    const repOffset = +runtime.guardiansMarchOffset(sampleState, representative) || 0;
    const offsets = cohesionAliens.map(alien => +runtime.guardiansMarchOffset(sampleState, alien) || 0);
    const spread = Math.max(...offsets) - Math.min(...offsets);
    repOffsets.push(repOffset);
    minOffset = Math.min(minOffset, repOffset);
    maxOffset = Math.max(maxOffset, repOffset);
    maxSpread = Math.max(maxSpread, spread);
  }

  const distinctOffsetLevels = new Set(repOffsets.map(offset => Math.round(offset / 4))).size;
  const result = {
    artifact: path.relative(ROOT, ARTIFACT),
    status: artifact.status,
    representative,
    sampledDurationSeconds: rounded(duration),
    xSpanPx: rounded(maxOffset - minOffset),
    normalizedXSpan: rounded((maxOffset - minOffset) / width),
    directionChanges: countDirectionChanges(repOffsets),
    maximumCohesionSpreadPx: rounded(maxSpread),
    distinctOffsetLevels,
    sampleOffsets: repOffsets
      .filter((_, index) => index % Math.max(1, Math.floor(repOffsets.length / 8)) === 0)
      .slice(0, 8)
      .map((offset, index) => ({
        t: rounded((index * duration) / 8),
        offset: rounded(offset)
      }))
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'opening-rack-motion-contract-object-track-derived'){
    fail('Guardians opening-rack artifact is not linked to the preview pack', result);
  }
  const spanBand = cfg.normalizedXSpanBand || [];
  if(!(result.normalizedXSpan >= (+spanBand[0] || 0) && result.normalizedXSpan <= (+spanBand[1] || Infinity))){
    fail('Guardians opening-rack sweep no longer matches the measured lateral span band', result);
  }
  const directionBand = cfg.directionChangeBand || [];
  if(!(result.directionChanges >= (+directionBand[0] || 0) && result.directionChanges <= (+directionBand[1] || Infinity))){
    fail('Guardians opening-rack direction changes drifted outside the measured cadence band', result);
  }
  if(result.maximumCohesionSpreadPx > (+cfg.maximumCohesionSpreadPx || 0.35)){
    fail('Guardians rack no longer moves as one cohesive sweep', result);
  }
  if(result.distinctOffsetLevels < (+cfg.minimumDistinctOffsetLevels || 0)){
    fail('Guardians rack offset levels are no longer stepped enough to read as a march', result);
  }

  console.log(JSON.stringify(Object.assign({ ok: true }, result), null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

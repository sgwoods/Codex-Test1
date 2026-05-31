#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const MAP = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-challenge-movement-grammar-map', 'latest.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'movement-grammar-compiler-bridge');
const OUT = path.join(OUT_DIR, 'latest.json');

const REQUIRED_ROUND_TRIP_FIELDS = [
  'fromStage',
  'groups',
  'enemiesPerGroup',
  'groupPathFamilies',
  'groupVisualFamilies',
  'groupLaneTypes',
  'groupSpawnOffsets'
];

const OPTIONAL_ROUND_TRIP_FIELDS = [
  'groupSpeedScales',
  'groupArcAmps',
  'groupDropAmps',
  'groupLowerFieldBiases',
  'groupYOffsets'
];

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    fail('required JSON artifact could not be read', { file: rel(file), error: err.message });
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function compactArray(values){
  return (values || []).filter(value => value !== undefined);
}

function runtimeAuthoredArray(runtime, field, compiledValues){
  if(Array.isArray(runtime[field]) && runtime[field].length) return compactArray(compiledValues);
  return [];
}

function round(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function serialize(value){
  return JSON.stringify(value === undefined ? null : value);
}

function valuesEqual(left, right){
  return serialize(left) === serialize(right);
}

function compileRuntimeLayout(pattern){
  const runtime = pattern.runtimeLayout || {};
  const roleBindings = pattern.roleBindings || [];
  const phaseTimeline = pattern.phaseTimeline || [];
  const variationControls = pattern.variationControls || [];
  return {
    fromStage: pattern.gameScope?.stage ?? runtime.fromStage,
    id: runtime.id,
    pathFamily: runtime.pathFamily,
    groups: roleBindings.length || runtime.groups,
    enemiesPerGroup: runtime.enemiesPerGroup,
    upperBandRatio: runtime.upperBandRatio,
    spawnOffsetX: runtime.spawnOffsetX,
    waveSpacingY: runtime.waveSpacingY,
    rowSpacingY: runtime.rowSpacingY,
    waveDelay: runtime.waveDelay,
    slotDelay: runtime.slotDelay,
    arcAmp: runtime.arcAmp,
    dropAmp: runtime.dropAmp,
    lowerFieldBias: runtime.lowerFieldBias,
    laneTypes: runtime.laneTypes || [],
    groupPathFamilies: compactArray(variationControls.map(group => group.pathFamily)),
    groupVisualFamilies: compactArray(variationControls.map(group => group.visualFamily)),
    groupLaneTypes: roleBindings.map(group => group.laneTypes || []),
    groupSpawnOffsets: runtimeAuthoredArray(runtime, 'groupSpawnOffsets', phaseTimeline.map(group => group.authoredSpawnOffsetS)),
    groupSpeedScales: runtimeAuthoredArray(runtime, 'groupSpeedScales', variationControls.map(group => group.speedScale)),
    groupArcAmps: runtimeAuthoredArray(runtime, 'groupArcAmps', variationControls.map(group => group.arcAmp)),
    groupDropAmps: runtimeAuthoredArray(runtime, 'groupDropAmps', variationControls.map(group => group.dropAmp)),
    groupLowerFieldBiases: runtimeAuthoredArray(runtime, 'groupLowerFieldBiases', variationControls.map(group => group.lowerFieldBias)),
    groupYOffsets: runtimeAuthoredArray(runtime, 'groupYOffsets', variationControls.map(group => group.yOffset))
  };
}

function compareField(pattern, compiled, field, required){
  const runtime = pattern.runtimeLayout || {};
  const runtimeValue = runtime[field];
  const compiledValue = compiled[field];
  if(!required && (!Array.isArray(runtimeValue) || !runtimeValue.length)){
    return {
      field,
      status: 'not-authored-in-runtime',
      required,
      runtimeValue: runtimeValue ?? null,
      compiledValue: compiledValue ?? null
    };
  }
  const exact = valuesEqual(runtimeValue, compiledValue);
  return {
    field,
    status: exact ? 'exact' : 'drift',
    required,
    runtimeValue: runtimeValue ?? null,
    compiledValue: compiledValue ?? null
  };
}

function main(){
  const map = readJson(MAP);
  if(map.artifactType !== 'aurora-challenge-movement-grammar-map'){
    fail('unexpected movement map artifact type', { artifactType: map.artifactType });
  }
  const rows = (map.patterns || []).map(pattern => {
    const compiled = compileRuntimeLayout(pattern);
    const comparisons = [
      ...REQUIRED_ROUND_TRIP_FIELDS.map(field => compareField(pattern, compiled, field, true)),
      ...OPTIONAL_ROUND_TRIP_FIELDS.map(field => compareField(pattern, compiled, field, false))
    ];
    const requiredDrift = comparisons.filter(row => row.required && row.status === 'drift');
    const optionalDrift = comparisons.filter(row => !row.required && row.status === 'drift');
    return {
      id: pattern.id,
      stage: pattern.gameScope?.stage ?? null,
      challengeNumber: pattern.gameScope?.challengeNumber ?? null,
      status: requiredDrift.length ? 'drift' : optionalDrift.length ? 'optional-drift' : 'round-trip-exact',
      compiledRuntimeLayout: compiled,
      comparisons,
      requiredDrift,
      optionalDrift,
      read: requiredDrift.length
        ? `Required compiler fields drifted: ${requiredDrift.map(row => row.field).join(', ')}.`
        : 'Required grammar fields round-trip to current Aurora challenge layout fields.'
    };
  });
  const requiredDriftRows = rows.filter(row => row.requiredDrift.length);
  const exactRequiredCount = rows.length - requiredDriftRows.length;
  const report = {
    schemaVersion: 1,
    artifactType: 'movement-grammar-compiler-bridge',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    gameKey: 'aurora-galactica',
    sourceArtifacts: {
      movementGrammarMap: rel(MAP)
    },
    summary: {
      patternCount: rows.length,
      exactRequiredCount,
      requiredDriftCount: requiredDriftRows.length,
      requiredRoundTripScore10: round(10 * exactRequiredCount / Math.max(rows.length, 1), 1),
      compilerBridgeReady: requiredDriftRows.length === 0,
      nextStep: requiredDriftRows.length
        ? 'fix-round-trip-drift'
        : 'add-per-group-movement-scoring-after-stage7-pilot',
      read: requiredDriftRows.length
        ? 'The grammar compiler bridge found required field drift. Gameplay edits should wait until this is fixed.'
        : 'The grammar compiler bridge can round-trip required Aurora challenge layout fields. The Stage 7 pilot now needs per-group movement scoring before the next gameplay edit.'
    },
    measurementLimits: [
      'This bridge proves source-field round-tripping only; it does not prove browser-rendered movement conformance.',
      'Optional fields may be absent in older runtime layouts, so only authored optional arrays count as drift.',
      'After any compiler-driven gameplay change, run challenge-stage conformance and visual timing alignment before promotion.'
    ],
    requiredRoundTripFields: REQUIRED_ROUND_TRIP_FIELDS,
    optionalRoundTripFields: OPTIONAL_ROUND_TRIP_FIELDS,
    rows
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(path.join(OUT_DIR, stamp, 'report.json'), report);
  writeJson(OUT, report);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    patternCount: report.summary.patternCount,
    requiredRoundTripScore10: report.summary.requiredRoundTripScore10,
    compilerBridgeReady: report.summary.compilerBridgeReady,
    nextStep: report.summary.nextStep
  }, null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/aurora-sprite-motion-correspondence/latest.json';
const REQUIRED_ROWS = [
  'boss-galaga-pulse-pair',
  'bee-zako-pulse-pair',
  'butterfly-escort-pulse-pair'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

if(!exists(ARTIFACT)){
  fail(`Missing Aurora sprite motion correspondence artifact: ${ARTIFACT}`);
}

const artifact = readJson(ARTIFACT);
if(artifact.artifactType !== 'aurora-sprite-motion-correspondence'){
  fail('Aurora sprite motion correspondence artifact has the wrong type', { artifactType: artifact.artifactType });
}
const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
for(const id of REQUIRED_ROWS){
  const row = rows.find(item => item.id === id);
  if(!row) fail(`Aurora sprite motion correspondence is missing ${id}`, { rows: rows.map(item => item.id) });
  if(!Number.isFinite(+row.score10) || +row.score10 < 1 || +row.score10 > 10){
    fail(`Aurora sprite motion correspondence row ${id} has an invalid score`, row);
  }
  if(!Number.isFinite(+row.target?.targetReadinessScore10) || !Number.isFinite(+row.runtime?.twoPhaseVisibilityScore10) || !Number.isFinite(+row.runtime?.cadenceVisibilityScore10)){
    fail(`Aurora sprite motion correspondence row ${id} is missing target/runtime component scores`, row);
  }
  if(!row.runtime?.temporalSample || !row.runtime?.cadenceSample || !row.runtime?.staticCrop){
    fail(`Aurora sprite motion correspondence row ${id} is missing runtime evidence links`, row);
  }
  if(!Number.isFinite(+row.runtime?.phaseOrderScore10) || !row.runtime?.phaseOrder?.read){
    fail(`Aurora sprite motion correspondence row ${id} is missing runtime-vs-target phase order scoring`, row);
  }
  if(!Array.isArray(row.runtime?.seedCoverageAxes) || row.runtime.seedCoverageAxes.length < 3){
    fail(`Aurora sprite motion correspondence row ${id} is missing seed coverage axes`, row);
  }
  if(!row.capReason || !Number.isFinite(+row.capScore10)){
    fail(`Aurora sprite motion correspondence row ${id} is missing its cap explanation`, row);
  }
  const hasAcceptedFrameCadence = !!row.target?.frameCadenceTarget?.acceptedForScoring;
  if((+row.target?.provisionalCropCount || 0) > 0 && !hasAcceptedFrameCadence && +row.score10 > 6.0){
    fail(`Aurora sprite motion correspondence row ${id} overclaims despite provisional target crops`, row);
  }
}

if(!Number.isFinite(+artifact.summary?.averageScore10)){
  fail('Aurora sprite motion correspondence summary is missing averageScore10', artifact.summary);
}
if(!Number.isFinite(+artifact.summary?.averagePhaseOrderScore10)){
  fail('Aurora sprite motion correspondence summary is missing averagePhaseOrderScore10', artifact.summary);
}
if(!['pose-sequence-targets-only', 'frame-timed-targets-present', 'frame-labeled-segmented-reference-windows'].includes(artifact.summary?.targetTimingStatus)){
  fail('Aurora sprite motion correspondence summary has an unknown target timing status', artifact.summary);
}
if((+artifact.summary?.finalFrameTimedRows || 0) <= 0 && +artifact.summary.averageScore10 > 6.5){
  fail('Aurora sprite motion correspondence overclaims without frame-timed target rows', artifact.summary);
}
if(!Array.isArray(artifact.measurementLimits) || !artifact.measurementLimits.some(item => String(item).includes('frame timing'))){
  fail('Aurora sprite motion correspondence artifact does not document frame-timing limits', artifact.measurementLimits);
}

console.log(JSON.stringify({
  ok: true,
  artifact: ARTIFACT,
  averageScore10: artifact.summary.averageScore10,
  weakestRowId: artifact.summary.weakestRowId,
  targetTimingStatus: artifact.summary.targetTimingStatus
}, null, 2));

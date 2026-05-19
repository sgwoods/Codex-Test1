#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest.json';
const REPORT = 'GALAGA_ALIEN_FRAME_CADENCE_TARGETS.md';
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

function abs(relPath){
  return path.join(ROOT, relPath);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(abs(relPath), 'utf8'));
}

function exists(relPath){
  return !!relPath && fs.existsSync(abs(relPath));
}

if(!exists(ARTIFACT)) fail(`Missing Galaga alien frame cadence artifact: ${ARTIFACT}`);
if(!exists(REPORT)) fail(`Missing Galaga alien frame cadence report: ${REPORT}`);

const artifact = readJson(ARTIFACT);
if(artifact.artifactType !== 'galaga-alien-frame-cadence-targets'){
  fail('Galaga alien frame cadence artifact has the wrong type.', { artifactType: artifact.artifactType });
}
if(artifact.status !== 'frame-labeled-segmented-reference-cadence'){
  fail('Galaga alien frame cadence artifact has the wrong status.', { status: artifact.status });
}
if(artifact.summary?.targetTimingStatus !== 'frame-labeled-segmented-reference-windows'){
  fail('Galaga alien frame cadence artifact has the wrong timing status.', artifact.summary);
}

const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
for(const id of REQUIRED_ROWS){
  const row = rows.find(item => item.id === id);
  if(!row) fail(`Missing required frame cadence row ${id}`, { rows: rows.map(item => item.id) });
  if(row.status !== 'frame-labeled-segmented-reference-window' || !row.acceptedForScoring){
    fail(`Frame cadence row ${id} is not accepted for scoring.`, row);
  }
  if(!Array.isArray(row.frames) || row.frames.length < 12){
    fail(`Frame cadence row ${id} has too few labeled frames.`, row);
  }
  if(!Array.isArray(row.phaseLabels) || row.phaseLabels.length < 2){
    fail(`Frame cadence row ${id} does not expose two or more phase labels.`, row);
  }
  if(!Number.isFinite(+row.cadenceSecondsPerCycle) || +row.cadenceSecondsPerCycle <= 0){
    fail(`Frame cadence row ${id} has no cadence duration.`, row);
  }
  if(!Number.isFinite(+row.averageAdjacentDelta) || +row.averageAdjacentDelta <= 0){
    fail(`Frame cadence row ${id} has no visible adjacent delta.`, row);
  }
  for(const frame of row.frames){
    if(!Number.isFinite(+frame.timeSeconds) || !frame.phaseLabel || !frame.cropImage){
      fail(`Frame cadence row ${id} has an invalid frame label.`, frame);
    }
    if(!exists(frame.cropImage)) fail(`Frame crop missing for ${id}`, frame);
    if(!frame.metrics || !Number.isFinite(+frame.metrics.litPixels) || +frame.metrics.litPixels <= 0){
      fail(`Frame cadence row ${id} has invalid frame metrics.`, frame);
    }
  }
}

if((+artifact.summary?.acceptedForScoringRows || 0) !== REQUIRED_ROWS.length){
  fail('Frame cadence artifact should accept all required rows for scoring.', artifact.summary);
}
if(!Array.isArray(artifact.measurementLimits) || !artifact.measurementLimits.some(item => String(item).includes('segmented'))){
  fail('Frame cadence artifact must document segmented-reference limits.', artifact.measurementLimits);
}

console.log(JSON.stringify({
  ok: true,
  artifact: ARTIFACT,
  rowCount: rows.length,
  totalFrameCount: artifact.summary.totalFrameCount,
  targetTimingStatus: artifact.summary.targetTimingStatus
}, null, 2));

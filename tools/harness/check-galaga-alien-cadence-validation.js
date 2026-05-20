#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaga-alien-cadence-validation/latest.json';
const REPORT = 'GALAGA_ALIEN_CADENCE_VALIDATION.md';
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

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

if(!exists(ARTIFACT)) fail(`Missing cadence validation artifact: ${ARTIFACT}`);
if(!exists(REPORT)) fail(`Missing cadence validation report: ${REPORT}`);

const artifact = readJson(ARTIFACT);
if(artifact.artifactType !== 'galaga-alien-cadence-validation'){
  fail('Cadence validation artifact has the wrong type.', { artifactType: artifact.artifactType });
}
const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
for(const id of REQUIRED_ROWS){
  const row = rows.find(item => item.id === id);
  if(!row) fail(`Missing raw cadence validation row ${id}`, { rows: rows.map(item => item.id) });
  if(!row.segmentedReference?.acceptedForScoring){
    fail(`Cadence validation row ${id} is not linked to an accepted segmented-reference row.`, row);
  }
  if(!Number.isFinite(+row.score10) || +row.score10 < 1 || +row.score10 > 10){
    fail(`Cadence validation row ${id} has an invalid score.`, row);
  }
  if(!Array.isArray(row.previewFrames) || row.previewFrames.length < 2){
    fail(`Cadence validation row ${id} is missing raw preview frames.`, row);
  }
  for(const frame of row.previewFrames){
    if(!exists(frame.cropImage)) fail(`Cadence validation preview crop is missing for ${id}`, frame);
  }
}

if(!String(artifact.summary?.remainingTimingConfidence || '').includes('medium')){
  fail('Cadence validation must keep the remaining timing confidence explicit.', artifact.summary);
}
if(!Array.isArray(artifact.measurementLimits) || !artifact.measurementLimits.some(item => String(item).includes('low-resolution'))){
  fail('Cadence validation must document low-resolution raw gameplay limits.', artifact.measurementLimits);
}

console.log(JSON.stringify({
  ok: true,
  artifact: ARTIFACT,
  averageRawValidationScore10: artifact.summary.averageRawValidationScore10,
  validationStatus: artifact.summary.validationStatus
}, null, 2));

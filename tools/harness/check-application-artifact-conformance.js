#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/application-artifact-conformance/latest.json';
const REQUIRED_ROWS = [
  'sprite-model-current-vs-target',
  'sprite-runtime-canvas-vs-target',
  'sprite-runtime-vs-promoted-target-crops',
  'sprite-motion-animation-coverage',
  'source-frame-pixel-targets',
  'sprite-sheet-target-pose-crops',
  'audio-cue-assets',
  'audio-event-alignment',
  'backgrounds-starfield-atmosphere',
  'frame-popup-icon-shell',
  'fonts-text-containment',
  'level-background-encounter-shape',
  'boss-formation-choreography'
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

function evidencePaths(value){
  return String(value || '')
    .split(/\s*;\s*/)
    .map(item => item.trim())
    .filter(Boolean);
}

function main(){
  if(!exists(ARTIFACT)) fail(`Missing application artifact conformance status: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
  const payload = {
    artifact: ARTIFACT,
    summary: artifact.summary,
    rowIds: rows.map(row => row.id)
  };
  if(artifact.artifactType !== 'application-artifact-conformance-status'){
    fail('Application artifact conformance status has the wrong artifact type', payload);
  }
  if(!Number.isFinite(Date.parse(artifact.generatedAt))){
    fail('Application artifact conformance status is missing a valid generatedAt timestamp', payload);
  }
  for(const rowId of REQUIRED_ROWS){
    if(!rows.some(row => row.id === rowId)){
      fail(`Application artifact conformance status is missing row ${rowId}`, payload);
    }
  }
  for(const row of rows){
    for(const key of ['id', 'surface', 'current', 'target', 'status', 'measurement', 'evidence', 'next']){
      if(!String(row[key] || '').trim()){
        fail(`Application artifact conformance row ${row.id || '(missing id)'} is missing ${key}`, { row, payload });
      }
    }
    if(row.score10 !== null && (!Number.isFinite(+row.score10) || row.score10 < 0 || row.score10 > 10)){
      fail(`Application artifact conformance row ${row.id} has an invalid score`, { row, payload });
    }
    for(const evidence of evidencePaths(row.evidence)){
      if(!exists(evidence)){
        fail(`Application artifact conformance row ${row.id} references missing evidence ${evidence}`, { row, payload });
      }
    }
  }
  const spriteComparisons = Array.isArray(artifact.spriteComparisons) ? artifact.spriteComparisons : [];
  if(spriteComparisons.length < 7){
    fail('Application artifact conformance status does not include enough sprite comparisons', payload);
  }
  for(const comparison of spriteComparisons){
    if(!Number.isFinite(+comparison.score10) || comparison.score10 <= 0 || comparison.score10 > 10){
      fail('Application artifact conformance sprite comparison has an invalid score', { comparison, payload });
    }
    if(!exists(comparison.modelImage) || !exists(comparison.sourcePixelTarget)){
      fail('Application artifact conformance sprite comparison is missing image evidence', { comparison, payload });
    }
  }
  const runtimeSpriteComparisons = Array.isArray(artifact.runtimeSpriteComparisons) ? artifact.runtimeSpriteComparisons : [];
  if(runtimeSpriteComparisons.length < 7){
    fail('Application artifact conformance status does not include enough runtime sprite comparisons', payload);
  }
  for(const comparison of runtimeSpriteComparisons){
    if(!Number.isFinite(+comparison.score10) || comparison.score10 <= 0 || comparison.score10 > 10){
      fail('Application artifact conformance runtime sprite comparison has an invalid score', { comparison, payload });
    }
    if(!exists(comparison.cropImage) || !exists(comparison.modelImage) || !exists(comparison.sourcePixelTarget)){
      fail('Application artifact conformance runtime sprite comparison is missing image evidence', { comparison, payload });
    }
  }
  const runtimeVsTargetCropComparisons = Array.isArray(artifact.runtimeVsTargetCropComparisons) ? artifact.runtimeVsTargetCropComparisons : [];
  if(runtimeVsTargetCropComparisons.length < 7){
    fail('Application artifact conformance status does not include enough runtime-vs-target crop comparisons', payload);
  }
  for(const comparison of runtimeVsTargetCropComparisons){
    if(!Number.isFinite(+comparison.bestScore10) || comparison.bestScore10 <= 0 || comparison.bestScore10 > 10){
      fail('Application artifact conformance runtime-vs-target crop comparison has an invalid score', { comparison, payload });
    }
    if(!exists(comparison.runtimeCrop) || !exists(comparison.bestTargetCrop)){
      fail('Application artifact conformance runtime-vs-target crop comparison is missing image evidence', { comparison, payload });
    }
  }
  const requiredNumeric = [
    'sprite-model-current-vs-target',
    'sprite-runtime-canvas-vs-target',
    'sprite-runtime-vs-promoted-target-crops',
    'source-frame-pixel-targets',
    'audio-cue-assets',
    'backgrounds-starfield-atmosphere',
    'fonts-text-containment'
  ];
  for(const rowId of requiredNumeric){
    const row = rows.find(item => item.id === rowId);
    if(!row || !Number.isFinite(+row.score10)){
      fail(`Application artifact conformance row ${rowId} must have a numeric score`, payload);
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    rowCount: rows.length,
    averageScore10: artifact.summary?.averageScore10,
    weakestRow: artifact.summary?.weakestRow,
    spriteComparisons: spriteComparisons.length,
    runtimeSpriteComparisons: runtimeSpriteComparisons.length,
    runtimeVsTargetCropComparisons: runtimeVsTargetCropComparisons.length
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

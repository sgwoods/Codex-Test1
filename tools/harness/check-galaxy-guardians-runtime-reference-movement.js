#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/runtime-reference-movement-0.1.json';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Guardians runtime-reference movement artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    score: artifact.runtimeReferenceMovementScore10,
    runtimeStats: artifact.runtimeStats,
    comparison: artifact.comparison,
    scoreParts: artifact.scoreParts
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'runtime-vs-reference-track-comparison-not-public-release'){
    fail('Guardians runtime-reference movement artifact is not linked to the preview pack', payload);
  }
  if(!exists(artifact.sourceEvidence?.objectTrackConformance || '')){
    fail('Runtime-reference movement artifact does not cite object-track evidence', payload);
  }
  if((artifact.runtimeStats?.descendingTrackletCount || 0) < 3){
    fail('Runtime-reference movement comparison needs at least three descending runtime tracklets', payload);
  }
  if((artifact.runtimeStats?.wrapCountByFourteenSeconds || 0) < 1){
    fail('Runtime-reference movement comparison needs wrap/return pressure by fourteen seconds', payload);
  }
  if((artifact.runtimeReferenceMovementScore10 || 0) < 7.2){
    fail('Runtime-reference movement score is below the 0.1 tuning floor', payload);
  }
  for(const [name, floor] of Object.entries({
    durationFit: 4.0,
    xSpanFit: 6.0,
    ySpanFit: 6.0,
    pressureAvailability: 10.0,
    eventCoverage: 10.0
  })){
    if((artifact.scoreParts?.[name] || 0) < floor){
      fail(`Runtime-reference movement score part ${name} below floor ${floor}`, payload);
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    runtimeReferenceMovementScore10: artifact.runtimeReferenceMovementScore10,
    runtimeStats: artifact.runtimeStats,
    comparison: artifact.comparison
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

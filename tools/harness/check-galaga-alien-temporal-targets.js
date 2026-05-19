#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-temporal-targets', 'latest.json');
const REQUIRED = ['boss-line', 'bee-line', 'but-line'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing Galaga alien temporal targets artifact.');
  if(!fs.existsSync(path.join(ROOT, 'GALAGA_ALIEN_TEMPORAL_TARGETS.md'))) fail('Missing Galaga alien temporal targets report.');
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
  if(artifact.artifactType !== 'galaga-alien-temporal-targets' || artifact.status !== 'mixed-confidence-temporal-target-sequences'){
    fail('Galaga alien temporal target artifact has the wrong type or status.', { type: artifact.artifactType, status: artifact.status });
  }
  for(const key of REQUIRED){
    const row = rows.find(item => item.runtimeSpriteKey === key);
    if(!row) fail(`Missing temporal target row for ${key}`, { rows: rows.map(item => item.runtimeSpriteKey) });
    if(!Array.isArray(row.poseSequence) || row.poseSequence.length < 3) fail(`Temporal target row ${key} has no usable pose sequence.`, row);
    if(!Array.isArray(row.targetCrops) || row.targetCrops.length < 3) fail(`Temporal target row ${key} has insufficient crop evidence.`, row);
  }
  const boss = rows.find(item => item.runtimeSpriteKey === 'boss-line');
  if((boss?.trustedCropCount || 0) < 2) fail('Boss temporal target should include trusted motion-reference crop evidence.', boss);
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    rowCount: rows.length,
    trustedCropLinks: artifact.summary?.trustedCropLinks,
    provisionalCropLinks: artifact.summary?.provisionalCropLinks
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

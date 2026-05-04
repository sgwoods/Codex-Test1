#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/sprite-grid-targets-0.1.json';

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
  if(!exists(ARTIFACT)) fail(`Missing Guardians sprite-grid target artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const targets = artifact.targets || [];
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    targetCount: targets.length,
    averageSilhouetteSimilarity: artifact.summary?.averageSilhouetteSimilarity,
    weakestTarget: artifact.summary?.weakestTarget
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'reference-crop-grid-targets-not-final-pixel-copy'){
    fail('Guardians sprite-grid targets are not linked to the preview pack', payload);
  }
  if(!exists(artifact.sourceEvidence?.spriteReferenceExtraction || '')){
    fail('Guardians sprite-grid targets are missing sprite extraction lineage', payload);
  }
  for(const id of ['signal-flagship', 'signal-escort', 'signal-scout', 'player-interceptor']){
    const target = targets.find(entry => entry.id === id);
    if(!target) fail(`Guardians sprite-grid target missing ${id}`, payload);
    if(!exists(target.sourceCrop || '')) fail(`Guardians sprite-grid target ${id} source crop is missing`, { target, payload });
    if((target.extractedRows || []).length !== target.rows || (target.runtimeRows || []).length !== target.rows){
      fail(`Guardians sprite-grid target ${id} row count does not match`, { target, payload });
    }
    if((target.extractedMetrics?.filledPixels || 0) < 6 || (target.runtimeMetrics?.filledPixels || 0) < 18){
      fail(`Guardians sprite-grid target ${id} does not expose enough lit sprite pixels`, { target, payload });
    }
    if((target.silhouetteSimilarity || 0) < target.minSimilarity){
      fail(`Guardians sprite-grid target ${id} is too far from the extracted crop scaffold`, { target, payload });
    }
  }
  if((artifact.summary?.averageSilhouetteSimilarity || 0) < .42){
    fail('Guardians sprite-grid target average similarity is too low for a 0.1 scaffold', payload);
  }
  if(!artifact.nextAuthoringStep || !String(artifact.nextAuthoringStep).includes('tighter manually reviewed component crops')){
    fail('Guardians sprite-grid targets must preserve the tighter-crop next promotion warning', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    targetCount: targets.length,
    averageSilhouetteSimilarity: artifact.summary.averageSilhouetteSimilarity,
    weakestTarget: artifact.summary.weakestTarget
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/sprite-component-targets-0.1.json';

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
  if(!exists(ARTIFACT)) fail(`Missing Guardians sprite component target artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const targets = artifact.targets || [];
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    targetIds: targets.map(target => target.id)
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'component-crop-targets-not-final-pixel-copy'){
    fail('Guardians sprite component targets are not linked to the preview pack', payload);
  }
  if(!exists(artifact.sourceEvidence?.spriteReferenceExtraction || '')){
    fail('Guardians sprite component targets are missing sprite extraction lineage', payload);
  }
  for(const id of ['signal-flagship', 'signal-escort', 'signal-scout', 'player-interceptor']){
    const target = targets.find(entry => entry.id === id);
    if(!target) fail(`Guardians sprite component target missing ${id}`, payload);
    if(!exists(target.sourceCrop || '') || !exists(target.componentCrop || '')){
      fail(`Guardians sprite component target ${id} is missing source or component crop`, { target, payload });
    }
    if((target.extractedRows || []).length !== target.rows || (target.runtimeRows || []).length !== target.rows){
      fail(`Guardians sprite component target ${id} row count does not match`, { target, payload });
    }
    if((target.extractedMetrics?.filledPixels || 0) < 4 || (target.runtimeMetrics?.filledPixels || 0) < 18){
      fail(`Guardians sprite component target ${id} does not expose enough lit sprite pixels`, { target, payload });
    }
    if((target.componentBox?.pixels || 0) < 10 || (target.silhouetteSimilarity || 0) < .28){
      fail(`Guardians sprite component target ${id} is too weak for authoring`, { target, payload });
    }
  }
  if((artifact.summary?.averageSilhouetteSimilarity || 0) < .42){
    fail('Guardians sprite component target average similarity is too low for a 0.1 target pass', payload);
  }
  if(!String(artifact.nextAuthoringStep || '').includes('Human-review')){
    fail('Guardians sprite component targets must preserve the human-review warning', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    targetCount: artifact.summary.targetCount,
    averageSilhouetteSimilarity: artifact.summary.averageSilhouetteSimilarity,
    weakestTarget: artifact.summary.weakestTarget
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json';
const REQUIRED_KEYS = [
  'player-fighter',
  'dual-fighter',
  'bee-line',
  'but-line',
  'boss-line',
  'rogue-fighter',
  'challenge-dragonfly',
  'challenge-mosquito'
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

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Aurora runtime vs Galaga target crop artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const comparisons = Array.isArray(artifact.comparisons) ? artifact.comparisons : [];
  const payload = {
    artifact: ARTIFACT,
    summary: artifact.summary,
    spriteKeys: comparisons.map(item => item.spriteKey)
  };
  if(artifact.artifactType !== 'aurora-runtime-vs-galaga-target-crops'){
    fail('Runtime-vs-target crop artifact has the wrong type.', payload);
  }
  if(!exists(artifact.sources?.runtimeSprite) || !exists(artifact.sources?.targetCrops)){
    fail('Runtime-vs-target crop artifact references missing source artifacts.', payload);
  }
  for(const key of REQUIRED_KEYS){
    if(!comparisons.some(item => item.spriteKey === key)){
      fail(`Runtime-vs-target crop artifact is missing sprite key ${key}`, payload);
    }
  }
  for(const comparison of comparisons){
    if(!exists(comparison.runtimeCrop) || !exists(comparison.bestTargetCrop)){
      fail('Runtime-vs-target crop comparison is missing image evidence.', { comparison, payload });
    }
    if(!Number.isFinite(+comparison.bestScore10) || comparison.bestScore10 <= 0 || comparison.bestScore10 > 10){
      fail('Runtime-vs-target crop comparison has an invalid score.', { comparison, payload });
    }
    if(!Array.isArray(comparison.topCandidates) || !comparison.topCandidates.length){
      fail('Runtime-vs-target crop comparison should expose top candidates for review.', { comparison, payload });
    }
  }
  if(!Number.isFinite(+artifact.summary?.averageScore10) || artifact.summary.averageScore10 <= 0 || artifact.summary.averageScore10 > 10){
    fail('Runtime-vs-target crop summary has an invalid average score.', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    sampleCount: comparisons.length,
    targetCropCount: artifact.summary?.targetCropCount,
    averageScore10: artifact.summary?.averageScore10,
    weakestSpriteKey: artifact.summary?.weakestSpriteKey,
    weakestScore10: artifact.summary?.weakestScore10
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

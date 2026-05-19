#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json';
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
const SINGLE_ENEMY_KEYS = [
  'bee-line',
  'but-line',
  'boss-line',
  'challenge-dragonfly',
  'challenge-mosquito'
];
const MAX_SINGLE_ENEMY_BBOX = { width: 84, height: 72 };

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

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Aurora runtime sprite conformance artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const samples = Array.isArray(artifact.samples) ? artifact.samples : [];
  const payload = {
    artifact: ARTIFACT,
    summary: artifact.summary,
    sampleKeys: samples.map(sample => sample.spriteKey)
  };
  if(artifact.artifactType !== 'aurora-runtime-sprite-conformance'){
    fail('Aurora runtime sprite conformance artifact has the wrong artifact type', payload);
  }
  if(artifact.summary?.captureMode !== 'isolated-live-canvas-sprite-crops'){
    fail('Aurora runtime sprite conformance artifact is not marked as live isolated canvas capture', payload);
  }
  for(const key of REQUIRED_KEYS){
    if(!samples.some(sample => sample.spriteKey === key)){
      fail(`Aurora runtime sprite conformance artifact is missing ${key}`, payload);
    }
  }
  for(const sample of samples){
    if(!Number.isFinite(+sample.score10) || sample.score10 <= 0 || sample.score10 > 10){
      fail(`Aurora runtime sprite sample ${sample.spriteKey} has an invalid score`, { sample, payload });
    }
    for(const field of ['cropImage', 'modelImage', 'sourcePixelTarget']){
      if(!exists(sample[field])){
        fail(`Aurora runtime sprite sample ${sample.spriteKey} is missing ${field}`, { sample, payload });
      }
    }
    if((sample.litPixels || 0) < 10 || !sample.canvasClip?.bbox){
      fail(`Aurora runtime sprite sample ${sample.spriteKey} did not capture enough visible pixels`, { sample, payload });
    }
  }
  for(const key of SINGLE_ENEMY_KEYS){
    const sample = samples.find(item => item.spriteKey === key);
    const bbox = sample?.canvasClip?.bbox;
    if(!bbox) continue;
    if(bbox.width > MAX_SINGLE_ENEMY_BBOX.width || bbox.height > MAX_SINGLE_ENEMY_BBOX.height){
      fail(`Aurora runtime sprite sample ${key} is too large for formation play`, {
        key,
        bbox,
        maxAllowed: MAX_SINGLE_ENEMY_BBOX,
        read: 'This guard catches renderer changes that improve isolated crop similarity while making dense Galaga-style 40-enemy formation play visually oversized or overlapping.',
        payload
      });
    }
  }
  if(!Number.isFinite(+artifact.summary?.averageScore10)){
    fail('Aurora runtime sprite conformance artifact is missing an average score', payload);
  }
  const cadenceSamples = Array.isArray(artifact.cadenceSamples) ? artifact.cadenceSamples : [];
  if(cadenceSamples.length < 3){
    fail('Aurora runtime sprite conformance artifact is missing full cadence samples for bee, butterfly, and boss families', payload);
  }
  for(const cadence of cadenceSamples){
    if(!Array.isArray(cadence.frames) || cadence.frames.length < 6){
      fail(`Aurora runtime sprite cadence sample ${cadence.spriteKey || '(missing key)'} does not include enough frames`, { cadence, payload });
    }
    for(const frame of cadence.frames){
      if(!exists(frame.cropImage)){
        fail(`Aurora runtime sprite cadence sample ${cadence.spriteKey || '(missing key)'} is missing frame crop ${frame.cropImage}`, { cadence, frame, payload });
      }
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    sampleCount: samples.length,
    averageScore10: artifact.summary.averageScore10,
    weakestSpriteKey: artifact.summary.weakestSpriteKey,
    weakestScore10: artifact.summary.weakestScore10
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

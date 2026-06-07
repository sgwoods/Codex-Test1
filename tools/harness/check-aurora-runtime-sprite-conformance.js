#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json';
const PIXEL_TARGET_ARTIFACT = 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1.json';
const MODEL_ARTIFACT = 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1.json';
const PRIVATE_STORAGE_ARTIFACT = 'reference-artifacts/analyses/galaga-reference-sprites/private-storage.json';
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
const CAPTURE_PLAYFIELD = {
  'player-fighter': { width: 42, height: 38 },
  'dual-fighter': { width: 74, height: 38 },
  'bee-line': { width: 50, height: 44 },
  'but-line': { width: 54, height: 46 },
  'boss-line': { width: 62, height: 52 },
  'rogue-fighter': { width: 56, height: 48 },
  'challenge-dragonfly': { width: 50, height: 44 },
  'challenge-mosquito': { width: 50, height: 44 }
};
const SINGLE_ENEMY_KEYS = [
  'bee-line',
  'but-line',
  'boss-line',
  'challenge-dragonfly',
  'challenge-mosquito'
];
const REQUIRED_TEMPORAL_KEYS = [
  'bee-line',
  'but-line',
  'boss-line',
  'challenge-dragonfly',
  'challenge-mosquito'
];
const REQUIRED_CADENCE_KEYS = REQUIRED_TEMPORAL_KEYS;
const MAX_SINGLE_ENEMY_BBOX = { width: 84, height: 72 };
const MAX_PROPORTION_OVERSHOOT = { width: .35, height: .40 };
const MIN_PROPORTION_UNDERSHOOT = { width: .28, height: .34 };

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

function normalizeRepoPath(relPath){
  return String(relPath || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function privateStoragePaths(){
  if(!exists(PRIVATE_STORAGE_ARTIFACT)) return new Set();
  const storage = readJson(PRIVATE_STORAGE_ARTIFACT);
  const movedFiles = Array.isArray(storage?.moved_files) ? storage.moved_files : [];
  const paths = new Set();
  for(const file of movedFiles){
    if(file?.publicRepoPath) paths.add(normalizeRepoPath(file.publicRepoPath));
    if(file?.privateStorePath) paths.add(normalizeRepoPath(file.privateStorePath));
  }
  return paths;
}

function existsOrPrivatePointer(relPath, privatePaths){
  const normalized = normalizeRepoPath(relPath);
  return !!normalized && (exists(normalized) || privatePaths.has(normalized));
}

function runtimeUnitBox(sample){
  const clip = sample?.canvasClip;
  const bbox = clip?.bbox;
  const spec = CAPTURE_PLAYFIELD[sample?.spriteKey];
  if(!clip || !bbox || !spec) return null;
  return {
    width: bbox.width / (clip.width / spec.width),
    height: bbox.height / (clip.height / spec.height)
  };
}

function pixelTargetForKey(pixelTargets, key){
  const targets = Array.isArray(pixelTargets?.targets) ? pixelTargets.targets : [];
  return targets.find(target => Array.isArray(target.catalogKeys) && target.catalogKeys.includes(key)) || null;
}

function modelTargetForKey(modelArtifact, key){
  const targets = Array.isArray(modelArtifact?.targets) ? modelArtifact.targets : [];
  return targets.find(target => Array.isArray(target.catalogKeys) && target.catalogKeys.includes(key)) || null;
}

function litBoxFromRows(rows){
  if(!Array.isArray(rows) || !rows.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;
  for(let y = 0; y < rows.length; y++){
    const row = String(rows[y] || '');
    for(let x = 0; x < row.length; x++){
      const token = row[x];
      if(token === '.' || token === ' ') continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if(maxX < 0) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Aurora runtime sprite conformance artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const pixelTargets = exists(PIXEL_TARGET_ARTIFACT) ? readJson(PIXEL_TARGET_ARTIFACT) : null;
  const modelArtifact = exists(MODEL_ARTIFACT) ? readJson(MODEL_ARTIFACT) : null;
  const privatePaths = privateStoragePaths();
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
    if(!exists(sample.cropImage)){
      fail(`Aurora runtime sprite sample ${sample.spriteKey} is missing cropImage`, { sample, payload });
    }
    for(const field of ['modelImage', 'sourcePixelTarget']){
      if(!existsOrPrivatePointer(sample[field], privatePaths)){
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
  const playerSample = samples.find(item => item.spriteKey === 'player-fighter');
  const playerBox = runtimeUnitBox(playerSample);
  const playerTarget = pixelTargetForKey(pixelTargets, 'player-fighter');
  const playerTargetBox = playerTarget?.metrics?.litBox;
  const playerModelTarget = modelTargetForKey(modelArtifact, 'player-fighter');
  const playerModelBox = litBoxFromRows(playerModelTarget?.rows);
  if(!playerBox || !playerTargetBox || !playerModelBox){
    fail('Aurora runtime sprite conformance cannot evaluate player-to-alien proportions', { playerSample, playerTarget, playerModelTarget, payload });
  }
  const proportionReads = [];
  for(const key of SINGLE_ENEMY_KEYS){
    const sample = samples.find(item => item.spriteKey === key);
    const target = pixelTargetForKey(pixelTargets, key);
    const modelTarget = modelTargetForKey(modelArtifact, key);
    const box = runtimeUnitBox(sample);
    const targetBox = target?.metrics?.litBox;
    const modelBox = litBoxFromRows(modelTarget?.rows);
    if(!box || !targetBox || !modelBox) continue;
    const sourceWidthVsPlayer = targetBox.width / playerTargetBox.width;
    const sourceHeightVsPlayer = targetBox.height / playerTargetBox.height;
    const modelWidthVsPlayer = modelBox.width / playerModelBox.width;
    const modelHeightVsPlayer = modelBox.height / playerModelBox.height;
    const read = {
      key,
      runtimeWidthVsPlayer: +(box.width / playerBox.width).toFixed(3),
      runtimeHeightVsPlayer: +(box.height / playerBox.height).toFixed(3),
      sourceWidthVsPlayer: +sourceWidthVsPlayer.toFixed(3),
      sourceHeightVsPlayer: +sourceHeightVsPlayer.toFixed(3),
      modelWidthVsPlayer: +modelWidthVsPlayer.toFixed(3),
      modelHeightVsPlayer: +modelHeightVsPlayer.toFixed(3),
      targetWidthVsPlayer: +Math.max(sourceWidthVsPlayer, modelWidthVsPlayer).toFixed(3),
      targetHeightVsPlayer: +Math.max(sourceHeightVsPlayer, modelHeightVsPlayer).toFixed(3)
    };
    read.maxWidthVsPlayer = +(read.targetWidthVsPlayer + MAX_PROPORTION_OVERSHOOT.width).toFixed(3);
    read.maxHeightVsPlayer = +(read.targetHeightVsPlayer + MAX_PROPORTION_OVERSHOOT.height).toFixed(3);
    read.minWidthVsPlayer = +Math.max(.35, read.targetWidthVsPlayer - MIN_PROPORTION_UNDERSHOOT.width).toFixed(3);
    read.minHeightVsPlayer = +Math.max(.35, read.targetHeightVsPlayer - MIN_PROPORTION_UNDERSHOOT.height).toFixed(3);
    proportionReads.push(read);
    if(read.runtimeWidthVsPlayer > read.maxWidthVsPlayer || read.runtimeHeightVsPlayer > read.maxHeightVsPlayer){
      fail(`Aurora runtime sprite sample ${key} is too large relative to the player fighter and Galaga source target`, {
        read,
        source: PIXEL_TARGET_ARTIFACT,
        note: 'This guard compares live rendered bounding boxes against source-frame Galaga target lit-box proportions so local sprite tuning cannot make aliens look oversized versus the fighter.',
        payload
      });
    }
    if(read.runtimeWidthVsPlayer < read.minWidthVsPlayer || read.runtimeHeightVsPlayer < read.minHeightVsPlayer){
      fail(`Aurora runtime sprite sample ${key} is too small relative to the player fighter and Galaga source target`, {
        read,
        source: PIXEL_TARGET_ARTIFACT,
        note: 'This guard keeps proportion fixes from shrinking arcade targets below readable Galaga-style playfield proportions.',
        payload
      });
    }
  }
  if(!Number.isFinite(+artifact.summary?.averageScore10)){
    fail('Aurora runtime sprite conformance artifact is missing an average score', payload);
  }
  const temporalSamples = Array.isArray(artifact.temporalSamples) ? artifact.temporalSamples : [];
  for(const key of REQUIRED_TEMPORAL_KEYS){
    const temporal = temporalSamples.find(sample => sample.spriteKey === key);
    if(!temporal){
      fail(`Aurora runtime sprite conformance artifact is missing closed/open temporal sample for ${key}`, payload);
    }
    if(['challenge-dragonfly', 'challenge-mosquito'].includes(key) && (temporal.litPixelDelta || 0) < 4 && (temporal.filledCellDelta || 0) < 1){
      fail(`Aurora runtime sprite temporal sample ${key} did not show visible challenge-specialty flap motion`, {
        temporal,
        payload,
        read: 'Challenge-specialty sprites must expose measurable active motion so challenge-stage visual novelty is based on rendered evidence, not only family labels.'
      });
    }
  }
  const cadenceSamples = Array.isArray(artifact.cadenceSamples) ? artifact.cadenceSamples : [];
  for(const key of REQUIRED_CADENCE_KEYS){
    if(!cadenceSamples.some(sample => sample.spriteKey === key)){
      fail(`Aurora runtime sprite conformance artifact is missing full cadence sample for ${key}`, payload);
    }
  }
  if(cadenceSamples.length < REQUIRED_CADENCE_KEYS.length){
    fail('Aurora runtime sprite conformance artifact is missing full cadence samples for required classic and challenge-specialty families', payload);
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
    weakestScore10: artifact.summary.weakestScore10,
    proportionReads
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

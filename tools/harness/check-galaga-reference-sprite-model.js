#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1.json';
const REQUIRED_KEYS = ['player-fighter', 'dual-fighter', 'bee-line', 'but-line', 'boss-line', 'rogue-fighter', 'challenge-dragonfly'];

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

function run(cmd, args){
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
    timeout: 1000 * 60
  });
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function probeImage(relPath){
  const raw = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'json', relPath]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return { width: stream.width || 0, height: stream.height || 0 };
}

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Galaga reference sprite model artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const targets = Array.isArray(artifact.targets) ? artifact.targets : [];
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    targetIds: targets.map(target => target.id)
  };
  if(artifact.gameKey !== 'aurora-galaga-reference' || artifact.status !== 'consensus-source-frame-pixel-model'){
    fail('Galaga reference sprite model is not marked as a consensus source-frame pixel model', payload);
  }
  if(!exists(artifact.sourceEvidence?.pixelTargets || '')){
    fail('Galaga reference sprite model is missing pixel-target lineage', payload);
  }
  for(const key of REQUIRED_KEYS){
    if(!targets.some(target => (target.catalogKeys || []).includes(key))){
      fail(`Galaga reference sprite model is missing catalog key ${key}`, payload);
    }
  }
  for(const target of targets){
    if(!exists(target.modelImage) || !exists(target.sourcePixelTarget)){
      fail(`Galaga reference sprite model ${target.id} is missing image lineage`, { target, payload });
    }
    if(target.modelKind !== 'consensus-from-source-frame-components'){
      fail(`Galaga reference sprite model ${target.id} has the wrong model kind`, { target, payload });
    }
    const rows = target.rows || [];
    const grid = target.logicalGrid || {};
    if(rows.length !== grid.rows || rows.some(row => row.length !== grid.cols)){
      fail(`Galaga reference sprite model ${target.id} row grid does not match metadata`, { target, payload });
    }
    const imageSize = probeImage(target.modelImage);
    if(imageSize.width !== grid.cols * target.displayScale || imageSize.height !== grid.rows * target.displayScale){
      fail(`Galaga reference sprite model ${target.id} image dimensions do not match display scale`, { target, imageSize, payload });
    }
    if((target.sampleCount || 0) < 1 || (target.metrics?.filledPixels || 0) < 8){
      fail(`Galaga reference sprite model ${target.id} does not contain enough evidence`, { target, payload });
    }
    if((target.averageConfidence || 0) < .45){
      fail(`Galaga reference sprite model ${target.id} confidence is too low`, { target, payload });
    }
  }
  if((artifact.summary?.totalSamples || 0) <= targets.length){
    fail('Galaga reference sprite model did not harvest any extra frame evidence beyond seed targets', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    targetCount: artifact.summary.targetCount,
    totalSamples: artifact.summary.totalSamples,
    averageConfidence: artifact.summary.averageConfidence,
    weakestModel: artifact.summary.weakestModel
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1.json';
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
  if(!exists(ARTIFACT)) fail(`Missing Galaga reference sprite target artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const targets = Array.isArray(artifact.targets) ? artifact.targets : [];
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    targetIds: targets.map(target => target.id)
  };
  if(artifact.gameKey !== 'aurora-galaga-reference' || artifact.status !== 'source-frame-pixel-targets'){
    fail('Galaga reference sprite targets are not marked as source-frame pixel targets', payload);
  }
  if(!String(artifact.sourceEvidence?.note || '').includes('exact unscaled source-frame pixel crops')){
    fail('Galaga reference sprite targets are missing source-pixel lineage notes', payload);
  }
  for(const key of REQUIRED_KEYS){
    if(!targets.some(target => (target.catalogKeys || []).includes(key))){
      fail(`Galaga reference sprite targets are missing catalog key ${key}`, payload);
    }
  }
  for(const target of targets){
    if(!exists(target.sourceFrame) || !exists(target.pixelTarget)){
      fail(`Galaga reference sprite target ${target.id} is missing source or output PNG`, { target, payload });
    }
    if(target.pixelScale !== 1 || target.sourcePixelExact !== true){
      fail(`Galaga reference sprite target ${target.id} is not an exact source-pixel target`, { target, payload });
    }
    const dimensions = probeImage(target.pixelTarget);
    if(dimensions.width !== target.crop?.width || dimensions.height !== target.crop?.height){
      fail(`Galaga reference sprite target ${target.id} dimensions do not match crop metadata`, { target, dimensions, payload });
    }
    if((target.metrics?.litPixels || 0) < 8 || (target.metrics?.litRatio || 0) <= 0){
      fail(`Galaga reference sprite target ${target.id} does not contain enough visible sprite pixels`, { target, payload });
    }
  }
  if((artifact.summary?.targetCount || 0) < 6){
    fail('Galaga reference sprite target artifact does not expose enough role targets', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    targetCount: artifact.summary.targetCount,
    catalogKeys: artifact.summary.catalogKeys
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaga-alien-target-crops/latest.json';
const REQUIRED_ROLES = [
  'player-fighter',
  'bee-zako',
  'butterfly-escort',
  'boss-galaga',
  'challenge-specialty-aliens',
  'projectiles-and-impacts',
  'tractor-beam'
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

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Galaga alien target crop artifact: ${ARTIFACT}`);
  if(!exists('GALAGA_ALIEN_TARGET_CROPS.md')) fail('Missing human-readable Galaga alien target crop report.');
  const artifact = readJson(ARTIFACT);
  const targetCrops = Array.isArray(artifact.targetCrops) ? artifact.targetCrops : [];
  const roleSets = Array.isArray(artifact.roleSets) ? artifact.roleSets : [];
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    targetCropIds: targetCrops.map(crop => crop.id),
    roleKeys: roleSets.map(role => role.roleKey)
  };
  if(artifact.artifactType !== 'galaga-alien-target-crops' || artifact.status !== 'accepted-first-pass-target-crops'){
    fail('Galaga alien target crop artifact has the wrong type or status.', payload);
  }
  if(!artifact.summary?.sourcePixelExact){
    fail('Galaga alien target crop artifact should preserve exact source pixels.', payload);
  }
  for(const role of REQUIRED_ROLES){
    const row = roleSets.find(item => item.roleKey === role);
    if(!row) fail(`Missing target crop role set ${role}`, payload);
    if((row.promotedPoseCount || 0) < 1 || !Array.isArray(row.targetCrops) || !row.targetCrops.length){
      fail(`Target crop role set ${role} does not expose promoted crops`, { row, payload });
    }
  }
  if(targetCrops.length < 29){
    fail('Expected at least 29 promoted target crops for this first-pass sprite sheet library, including the dual-fighter composite.', payload);
  }
  for(const crop of targetCrops){
    if(!crop.id || !crop.roleKey || !crop.poseKey || !crop.sourceRegion){
      fail('A promoted target crop is missing identity metadata.', { crop, payload });
    }
    if(!exists(crop.targetCrop)){
      fail(`Promoted target crop ${crop.id} points at a missing image`, { crop, payload });
    }
    if(crop.pixelScale !== 1 || (crop.sourcePixelExact !== true && crop.exactComposite !== true)){
      fail(`Promoted target crop ${crop.id} should be exact 1x source pixels or an exact 1x composite`, { crop, payload });
    }
    if(crop.compositeTarget && (!Array.isArray(crop.componentCrops) || crop.componentCrops.length < 2)){
      fail(`Promoted target crop ${crop.id} is marked composite but does not list component crops`, { crop, payload });
    }
    if(!crop.crop || !Number.isFinite(+crop.crop.x) || !Number.isFinite(+crop.crop.y) || +crop.crop.width <= 0 || +crop.crop.height <= 0){
      fail(`Promoted target crop ${crop.id} has invalid crop metadata`, { crop, payload });
    }
    if((crop.metrics?.litPixels || 0) < 3 || !Array.isArray(crop.metrics?.tokenChannels) || !crop.metrics.tokenChannels.length){
      fail(`Promoted target crop ${crop.id} does not contain enough visible sprite pixels`, { crop, payload });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    targetCropCount: targetCrops.length,
    roleSetCount: roleSets.length,
    promotedRoles: roleSets.map(role => role.roleKey)
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

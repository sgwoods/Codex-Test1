#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-target-crops', 'latest.json');

const TRUSTED_PRIMARY = [
  { id: 'player-fighter-single-front', minAspect: 0.7, maxAspect: 1.35 },
  { id: 'bee-zako-formation-front', minAspect: 0.85, maxAspect: 1.5 },
  { id: 'butterfly-escort-formation-front', minAspect: 0.7, maxAspect: 1.25 },
  { id: 'boss-galaga-formation-front', minAspect: 0.75, maxAspect: 1.25 },
  { id: 'boss-galaga-flap-a', minAspect: 0.75, maxAspect: 1.25 },
  { id: 'boss-galaga-flap-b', minAspect: 0.75, maxAspect: 1.25 }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing Galaga alien target crop artifact.');
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const crops = new Map((artifact.targetCrops || []).map(crop => [crop.id, crop]));
  for(const spec of TRUSTED_PRIMARY){
    const crop = crops.get(spec.id);
    if(!crop) fail(`Missing trusted primary crop ${spec.id}`, { available: [...crops.keys()] });
    if(!crop.videoDerivedCleanCrop || crop.reviewStatus !== 'accepted-trusted-motion-reference'){
      fail(`Primary target ${spec.id} must be a trusted cleaned motion-reference crop, not provisional evidence.`, crop);
    }
    const metrics = crop.metrics || {};
    const width = +metrics.width || 0;
    const height = +metrics.height || 0;
    const aspect = height ? width / height : 0;
    if(width < 10 || height < 10 || !Number.isFinite(aspect)){
      fail(`Primary target ${spec.id} is too small or has invalid image metrics.`, { crop, metrics });
    }
    if(aspect < spec.minAspect || aspect > spec.maxAspect){
      fail(`Primary target ${spec.id} has suspicious aspect ratio and may be polluted or cropped across multiple sprites.`, { aspect, expected: spec, crop });
    }
    if((metrics.litPixels || 0) < 40 || (metrics.litRatio || 0) < 0.08){
      fail(`Primary target ${spec.id} has too little sprite mass for a trusted target.`, { crop, metrics });
    }
    if(!crop.cleanedCrop || !Number.isFinite(+crop.cleanedCrop.width) || !Number.isFinite(+crop.cleanedCrop.height)){
      fail(`Primary target ${spec.id} must preserve cleaned-crop bounds for review.`, crop);
    }
  }
  if((artifact.summary?.trustedMotionReferenceCount || 0) < TRUSTED_PRIMARY.length){
    fail('Target crop artifact summary undercounts trusted motion-reference crops.', artifact.summary);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    trustedPrimaryCount: TRUSTED_PRIMARY.length,
    trustedMotionReferenceCount: artifact.summary?.trustedMotionReferenceCount
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

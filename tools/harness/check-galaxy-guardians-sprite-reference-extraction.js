#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/sprite-reference-extraction-0.1.json';

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
  if(!exists(ARTIFACT)) fail(`Missing Guardians sprite extraction artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    cropFamilies: Object.keys(artifact.cropSummaries || {}),
    runtimeFit: artifact.runtimeFit,
    extractedCropCount: artifact.sourceEvidence?.extractedCropCount
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'sprite-reference-extraction-not-final-pixel-art'){
    fail('Guardians sprite extraction artifact is not linked to the preview pack', payload);
  }
  for(const key of ['rack-upper-aliens', 'lower-field-divers', 'player-and-shot']){
    const summary = artifact.cropSummaries?.[key];
    if(!summary || summary.cropCount < 3){
      fail(`Sprite extraction is missing enough reference crops for ${key}`, payload);
    }
    if((summary.medianLitRatio || 0) <= 0 || (summary.medianLitBoxAspect || 0) <= 0){
      fail(`Sprite extraction crop ${key} does not expose usable lit geometry`, { summary, payload });
    }
  }
  for(const id of ['signal-flagship', 'signal-escort', 'signal-scout', 'player-interceptor']){
    const sprite = artifact.runtimeSprites?.[id];
    if(!sprite) fail(`Runtime authored sprite ${id} is missing from sprite extraction artifact`, payload);
    if((sprite.filledPixels || 0) < 18 || (sprite.tokenChannels || []).length < 4){
      fail(`Runtime authored sprite ${id} is too weak for the extracted-reference baseline`, { sprite, payload });
    }
  }
  if((artifact.runtimeFit?.familyCoverageScore10 || 0) < 6){
    fail('Sprite extraction does not cover enough Galaxian color families', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    extractedCropCount: artifact.sourceEvidence.extractedCropCount,
    cropFamilies: payload.cropFamilies,
    runtimeSpriteCount: artifact.runtimeFit.runtimeSpriteCount,
    familyCoverageScore10: artifact.runtimeFit.familyCoverageScore10
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

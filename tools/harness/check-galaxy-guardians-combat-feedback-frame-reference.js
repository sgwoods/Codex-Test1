#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'combat-feedback-frame-reference-0.1.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureExists(relPath){
  const full = path.join(ROOT, relPath);
  if(!fs.existsSync(full)) fail(`Missing referenced artifact: ${relPath}`);
}

function main(){
  const artifact = readJson(ARTIFACT);
  const payload = {
    artifact: path.relative(ROOT, ARTIFACT),
    status: artifact.status,
    sourceWindows: artifact.sourceWindows
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Combat-feedback frame reference is not linked to the Guardians preview.', payload);
  }
  if(artifact.status !== 'promoted-frame-window-combat-feedback-authority'){
    fail('Combat-feedback frame reference has the wrong status.', payload);
  }

  for(const key of ['playerSingleShotPressure','lowerFieldDiveCurves','levelClearTransition']){
    const windowRef = artifact.sourceWindows?.[key];
    if(!windowRef) fail(`Combat-feedback frame reference is missing source window ${key}.`, payload);
    for(const relPath of [windowRef.frameIndex, windowRef.contactSheet, windowRef.motionDifferenceSheet]){
      ensureExists(relPath);
    }
    if((windowRef.sampleReadPoints || []).length < 2){
      fail(`Combat-feedback frame reference needs at least two read points for ${key}.`, payload);
    }
  }

  const requiredReads = [
    'player single shot stays thin and dry while the hit break remains readable',
    'lower-field dive and impact moments stay legible at live board scale',
    'destroy-state and rack-clear breakups should read as source-family flashes, not generic particles'
  ];
  for(const phrase of requiredReads){
    if(!(artifact.expectedRuntimeRead || []).includes(phrase)){
      fail(`Combat-feedback frame reference lost required runtime-read phrase: ${phrase}`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    windows: Object.fromEntries(Object.entries(artifact.sourceWindows || {}).map(([key, value]) => [key, {
      sourceId: value.sourceId,
      windowId: value.windowId,
      sampleReadPoints: value.sampleReadPoints
    }]))
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

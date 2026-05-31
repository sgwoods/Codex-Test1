#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { gameConfig } = require('./audio-conformance-games');
const { readJson } = require('./lib/platinum-audio-conformance');

const ROOT = path.resolve(__dirname, '..', '..');

function argValue(name, fallback){
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function main(){
  const config = gameConfig(argValue('--game', 'galaxy-guardians-preview'));
  const sceneConfig = config.audioSceneReview || {};
  if(!exists(sceneConfig.artifactPath)) fail(`Missing audio scene review artifact: ${sceneConfig.artifactPath}`);
  const artifact = readJson(path.join(ROOT, sceneConfig.artifactPath));
  const payload = {
    gameKey: config.gameKey,
    artifact: sceneConfig.artifactPath,
    report: sceneConfig.reportPath,
    sceneCount: artifact.summary?.sceneCount
  };
  if(artifact.gameKey !== config.gameKey || artifact.artifactType !== 'platinum-audio-scene-review'){
    fail('Audio scene review artifact is for the wrong game or type', payload);
  }
  if(artifact.status !== 'runtime-scene-audio-review'){
    fail('Audio scene review artifact has the wrong status', payload);
  }
  if((artifact.summary?.sceneCount || 0) < (sceneConfig.minimumSceneCount || 1)){
    fail('Audio scene review did not resolve enough scenes', payload);
  }
  if(!exists(sceneConfig.reportPath)) fail(`Missing audio scene review report: ${sceneConfig.reportPath}`, payload);
  for(const scene of artifact.scenes || []){
    if(!scene.captureLabel || !scene.targetRead) fail('Audio scene review scene is missing key fields', { scene, payload });
    if((scene.runtime?.durationSeconds || 0) < 0.08) fail('Audio scene review scene window is too short', { scene, payload });
    if((scene.runtime?.eventSummary?.cueEventCount || 0) < 1) fail('Audio scene review scene has no cue events inside the runtime window', { scene, payload });
    for(const relPath of [scene.captureReport, scene.runtime?.waveform, scene.runtime?.spectrogram]){
      if(!relPath || !exists(relPath)) fail(`Audio scene review scene references a missing file: ${relPath}`, { scene, payload });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: sceneConfig.artifactPath,
    report: sceneConfig.reportPath,
    sceneCount: artifact.summary.sceneCount,
    weakestByCueDensity: artifact.summary.weakestByCueDensity
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

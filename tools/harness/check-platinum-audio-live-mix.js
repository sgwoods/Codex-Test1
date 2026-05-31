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
  const mixConfig = config.audioLiveMix || {};
  if(!exists(mixConfig.artifactPath)) fail(`Missing audio live-mix artifact: ${mixConfig.artifactPath}`);
  const artifact = readJson(path.join(ROOT, mixConfig.artifactPath));
  const payload = {
    gameKey: config.gameKey,
    artifact: mixConfig.artifactPath,
    report: mixConfig.reportPath,
    overallLiveMixScore10: artifact.summary?.overallLiveMixScore10
  };
  if(artifact.gameKey !== config.gameKey || artifact.artifactType !== 'platinum-audio-live-mix'){
    fail('Audio live-mix artifact is for the wrong game or type', payload);
  }
  if(artifact.status !== 'captured-gameplay-live-mix-review'){
    fail('Audio live-mix artifact has the wrong status', payload);
  }
  if((artifact.summary?.captureCount || 0) < (mixConfig.captureSets || []).length){
    fail('Audio live-mix artifact did not score every configured capture set', payload);
  }
  if((artifact.summary?.overallLiveMixScore10 || 0) < (mixConfig.minimumOverallScore10 || 0)){
    fail('Audio live-mix score is below the configured floor', payload);
  }
  if(!exists(mixConfig.reportPath)) fail(`Missing audio live-mix report: ${mixConfig.reportPath}`, payload);
  for(const capture of artifact.captures || []){
    if((capture.metrics?.cueEventCount || 0) < 1) fail('Audio live-mix capture has no cue events', { capture, payload });
    if((capture.metrics?.longestQuietGapSeconds || 0) > (capture.thresholds?.maxQuietGapSeconds || Number.POSITIVE_INFINITY) * 1.45){
      fail('Audio live-mix capture exceeds the tolerated quiet-gap envelope by too much', { capture, payload });
    }
    for(const relPath of [capture.captureReport, capture.audioPreview?.waveform, capture.audioPreview?.spectrogram]){
      if(!relPath || !exists(relPath)) fail(`Audio live-mix capture references a missing file: ${relPath}`, { capture, payload });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: mixConfig.artifactPath,
    report: mixConfig.reportPath,
    overallLiveMixScore10: artifact.summary.overallLiveMixScore10,
    weakestCapture: artifact.summary.weakestCapture
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

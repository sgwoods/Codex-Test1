#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { readJson } = require('./lib/platinum-audio-conformance');
const { gameConfig } = require('./audio-conformance-games');

const ROOT = path.resolve(__dirname, '..', '..');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function argValue(name, fallback){
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function main(){
  const gameKey = argValue('--game', 'galaxy-guardians-preview');
  const config = gameConfig(gameKey);
  if(!exists(config.artifactPath)) fail(`Missing audio conformance lab artifact: ${config.artifactPath}`);
  const artifact = readJson(path.join(ROOT, config.artifactPath));
  const payload = {
    gameKey,
    artifact: config.artifactPath,
    score: artifact.summary?.overallAudioConformanceScore10,
    cueCount: artifact.summary?.cueCount,
    weakestCue: artifact.summary?.weakestCue
  };
  if(artifact.gameKey !== config.gameKey || artifact.artifactType !== 'platinum-audio-conformance-lab'){
    fail('Audio conformance lab artifact is for the wrong game or type', payload);
  }
  if(artifact.status !== 'runtime-cue-to-promoted-reference-window-comparison'){
    fail('Audio conformance lab artifact has the wrong status', payload);
  }
  if((artifact.summary?.cueCount || 0) < config.runtimeCueNames.length){
    fail('Audio conformance lab did not score every required runtime cue', payload);
  }
  if((artifact.summary?.overallAudioConformanceScore10 || 0) < config.scoring.minimumOverallScore10){
    fail('Audio conformance lab score is below the configured floor', payload);
  }
  for(const relPath of [
    artifact.sourceEvidence?.labeledCueArtifact,
    artifact.sourceEvidence?.cueTargetArtifact,
    artifact.sourceEvidence?.cueCandidateArtifact,
    config.reportPath
  ]){
    if(!relPath || !exists(relPath)) fail(`Audio conformance lab references missing file: ${relPath}`, payload);
  }
  for(const cue of artifact.cues || []){
    if(!config.runtimeCueNames.includes(cue.cueName)) fail('Audio conformance lab includes an unregistered cue', { cue, payload });
    if((cue.score10 || 0) < config.scoring.cuePassFloor10){
      fail('Audio conformance lab cue is below the cue floor', { cueName: cue.cueName, score10: cue.score10, payload });
    }
    for(const relPath of [cue.reference?.waveform, cue.reference?.spectrogram, cue.runtime?.waveform, cue.runtime?.spectrogram]){
      if(!relPath || !exists(relPath)) fail(`Audio conformance lab cue is missing preview: ${relPath}`, { cueName: cue.cueName, payload });
    }
    if(!cue.recommendation || !cue.reference?.pcm || !cue.runtime?.pcm || !cue.runtime?.static){
      fail('Audio conformance lab cue is missing comparison details', { cueName: cue.cueName, payload });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: config.artifactPath,
    report: config.reportPath,
    score: artifact.summary.overallAudioConformanceScore10,
    cueCount: artifact.summary.cueCount,
    weakestCue: artifact.summary.weakestCue
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

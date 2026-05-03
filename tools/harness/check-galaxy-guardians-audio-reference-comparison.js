#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/audio-reference-comparison-0.1.json';

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
  if(!exists(ARTIFACT)) fail(`Missing Guardians audio comparison artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    score: artifact.audioReferenceComparisonScore10,
    analyzedWindowCount: artifact.sourceEvidence?.analyzedWindowCount,
    scoreParts: artifact.scoreParts,
    cueCount: artifact.guardiansCueSummary?.cueCount
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'waveform-spectrogram-proxy-not-final-acoustic-match'){
    fail('Guardians audio comparison artifact is not linked to the preview pack', payload);
  }
  if((artifact.sourceEvidence?.analyzedWindowCount || 0) < 6){
    fail('Audio comparison needs at least six waveform/spectrogram windows', payload);
  }
  let nonSilentWindows = 0;
  for(const window of artifact.referenceAudioSummary?.windows || []){
    if(!window.waveform || !exists(window.waveform) || !window.spectrogram || !exists(window.spectrogram)){
      fail('Audio reference window is missing waveform or spectrogram evidence', { window, payload });
    }
    if(!window.metrics || (window.metrics.durationSeconds || 0) <= 0){
      fail('Audio reference window does not expose usable PCM metrics', { window, payload });
    }
    if((window.metrics.peak || 0) > 0) nonSilentWindows++;
  }
  if(nonSilentWindows < 3){
    fail('Audio reference comparison needs at least three non-silent PCM windows', Object.assign({ nonSilentWindows }, payload));
  }
  for(const cue of ['playerShot', 'enemyShot', 'scoutDive', 'flagshipDive', 'wrapReturn', 'playerLoss', 'gameOver']){
    if(!artifact.guardiansCueSummary?.cues?.[cue]){
      fail(`Guardians audio comparison is missing cue ${cue}`, payload);
    }
  }
  if((artifact.audioReferenceComparisonScore10 || 0) < 6.0){
    fail('Guardians audio reference comparison score is below the 0.1 floor', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    analyzedWindowCount: artifact.sourceEvidence.analyzedWindowCount,
    audioReferenceComparisonScore10: artifact.audioReferenceComparisonScore10,
    scoreParts: artifact.scoreParts
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

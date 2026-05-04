#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/audio-labeled-cue-targets-0.1.json';

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
  if(!exists(ARTIFACT)) fail(`Missing Guardians labeled cue target artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const windows = artifact.promotedCueWindows || [];
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    cueNames: windows.map(cue => cue.cueName)
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'labeled-cue-windows-not-raw-audio-export'){
    fail('Guardians labeled cue targets are not linked to the preview pack', payload);
  }
  if(!exists(artifact.sourceEvidence?.cueCandidates || '')){
    fail('Guardians labeled cue targets are missing candidate lineage', payload);
  }
  for(const cueName of ['playerShot','enemyShot','scoutDive','flagshipDive','scoutHit','escortHit','flagshipHit','playerLoss']){
    const cue = windows.find(entry => entry.cueName === cueName);
    if(!cue) fail(`Guardians labeled cue targets missing ${cueName}`, payload);
    if(!cue.candidateId || !cue.sourceId || !cue.windowId || !cue.semanticLabel){
      fail(`Guardians labeled cue target ${cueName} is missing source identity`, { cue, payload });
    }
    if((cue.durationSeconds || 0) <= 0 || (cue.measuredPeak || 0) <= 0){
      fail(`Guardians labeled cue target ${cueName} is silent or durationless`, { cue, payload });
    }
    if(!exists(cue.previews?.waveform || '') || !exists(cue.previews?.spectrogram || '')){
      fail(`Guardians labeled cue target ${cueName} is missing waveform/spectrogram previews`, { cue, payload });
    }
    if(!Array.isArray(cue.suggestedDurationBandSeconds) || !Array.isArray(cue.suggestedFrequencyProxyBandHz)){
      fail(`Guardians labeled cue target ${cueName} needs measured target bands`, { cue, payload });
    }
  }
  if((artifact.summary?.promotedCueCount || 0) < 8 || (artifact.summary?.sourceCount || 0) < 2 || (artifact.summary?.familyCount || 0) < 3){
    fail('Guardians labeled cue targets do not cover enough cues/sources/families', payload);
  }
  if(!String(artifact.nextPromotion || '').includes('Human-listen')){
    fail('Guardians labeled cue targets must preserve the human-listen warning', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    promotedCueCount: artifact.summary.promotedCueCount,
    sourceCount: artifact.summary.sourceCount,
    familyCount: artifact.summary.familyCount,
    weakestPromotion: artifact.summary.weakestPromotion
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

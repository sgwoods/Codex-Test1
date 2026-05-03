#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/object-track-conformance-0.1.json';
const REQUIRED_WINDOWS = [
  'matt-hawkins-arcade-intro/opening-rack-entry',
  'nenriki-15-wave-session/complete-rack-reference',
  'arcades-lounge-level-5/lower-field-dive-curves',
  'nenriki-15-wave-session/flagship-escort-pressure',
  'nenriki-15-wave-session/wrap-return-pressure'
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
  return fs.existsSync(path.join(ROOT, relPath));
}

function main(){
  if(!exists(ARTIFACT)){
    fail(`Missing Guardians object-track conformance artifact: ${ARTIFACT}`);
  }
  const artifact = readJson(ARTIFACT);
  const windows = artifact.windows || [];
  const byKey = Object.fromEntries(windows.map(window => [window.windowKey, window]));
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    gameKey: artifact.gameKey,
    objectProxyScores: artifact.objectProxyScores,
    selectedWindows: windows.map(window => window.windowKey)
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'object-track-proxy-not-final-sprite-recognition'){
    fail('Guardians object-track conformance artifact is not linked to the preview pack', payload);
  }
  for(const key of REQUIRED_WINDOWS){
    const window = byKey[key];
    if(!window) fail(`Missing object-track window: ${key}`, payload);
    if(!window.evidence?.frameIndex || !exists(window.evidence.frameIndex)){
      fail(`Object-track window is missing frame-index evidence: ${key}`, { window, payload });
    }
    if((window.componentProxy?.lowerComponentFrameShare || 0) <= 0){
      fail(`Object-track window has no lower-field component signal: ${key}`, { window, payload });
    }
  }
  const pressureWindows = [
    byKey['arcades-lounge-level-5/lower-field-dive-curves'],
    byKey['nenriki-15-wave-session/flagship-escort-pressure'],
    byKey['nenriki-15-wave-session/wrap-return-pressure']
  ];
  for(const window of pressureWindows){
    if((window.trackProxy?.trackletCount || 0) < 4){
      fail('Pressure window needs enough lower-field tracklets to be useful', { window, payload });
    }
    if((window.trackProxy?.descendingTrackletCount || 0) < 2){
      fail('Pressure window needs descending candidate tracks before runtime tuning can use it', { window, payload });
    }
  }
  const completeRack = byKey['nenriki-15-wave-session/complete-rack-reference'];
  if((completeRack.componentProxy?.rackComponentFrameShare || 0) < .85){
    fail('Complete-rack reference does not preserve stable rack object signal', { completeRack, payload });
  }
  for(const [scoreName, floor] of Object.entries({
    objectTrackCoverage: 8.5,
    rackObjectStability: 7.0,
    divePathEvidence: 6.8,
    tuningActionability: 6.1,
    evidenceDurability: 9.0
  })){
    if((artifact.objectProxyScores?.[scoreName] || 0) < floor){
      fail(`Guardians object-track score ${scoreName} below floor ${floor}`, payload);
    }
  }
  if(artifact.runtimeTuningRead?.immediateConstantChangeRecommended !== false){
    fail('Object-track proxy must not directly authorize runtime constant changes yet', payload);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    objectProxyScores: artifact.objectProxyScores,
    selectedWindowCount: windows.length,
    pressureTracklets: pressureWindows.map(window => ({
      windowKey: window.windowKey,
      tracklets: window.trackProxy.trackletCount,
      descending: window.trackProxy.descendingTrackletCount,
      lowerComponentFrameShare: window.componentProxy.lowerComponentFrameShare
    }))
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

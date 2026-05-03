#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'frame-motion-conformance-0.1.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians frame-motion conformance artifact. Run npm run harness:analyze:galaxy-guardians-frame-motion-conformance first.');
  }
  const artifact = readJson(ARTIFACT);
  const windows = artifact.windows || [];
  const byKey = Object.fromEntries(windows.map(win => [win.windowKey, win]));
  const required = [
    'matt-hawkins-arcade-intro/opening-rack-entry',
    'nenriki-15-wave-session/complete-rack-reference',
    'arcades-lounge-level-5/lower-field-dive-curves',
    'nenriki-15-wave-session/flagship-escort-pressure',
    'nenriki-15-wave-session/wrap-return-pressure'
  ];
  const payload = {
    artifact: path.relative(ROOT, ARTIFACT),
    status: artifact.status,
    frameProxyScores: artifact.frameProxyScores,
    windowKeys: windows.map(win => win.windowKey),
    runtimeTuningRead: artifact.runtimeTuningRead
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians frame-motion conformance artifact is not linked to the preview game', payload);
  }
  if(artifact.status !== 'frame-derived-reference-proxy-not-final-tracking'){
    fail('Guardians frame-motion conformance artifact has the wrong status', payload);
  }
  if(artifact.runtimeTuningRead?.immediateConstantChangeRecommended !== false){
    fail('Frame-motion proxy should not directly authorize runtime constant changes yet', payload);
  }
  for(const key of required){
    const win = byKey[key];
    if(!win) fail(`Missing required Guardians frame-motion window: ${key}`, payload);
    if((win.decodedFrameCount || 0) < 40) fail(`Frame-motion window has too few decoded frames: ${key}`, { win, payload });
    for(const artifactPath of [
      win.evidence?.frameIndex,
      win.evidence?.contactSheet,
      win.evidence?.motionDifferenceSheet,
      win.evidence?.waveform,
      win.evidence?.spectrogram
    ]){
      if(!artifactPath || !exists(artifactPath)) fail(`Frame-motion evidence artifact is missing for ${key}: ${artifactPath}`, { win, payload });
    }
    if((win.motion?.activeMotionShare || 0) <= 0 || (win.brightness?.medianBrightRatio || 0) <= 0){
      fail(`Frame-motion window did not produce usable motion/brightness proxy metrics: ${key}`, { win, payload });
    }
  }
  if((byKey['nenriki-15-wave-session/complete-rack-reference'].brightness?.upperCenterYStdev || 99) > .08){
    fail('Complete rack reference is too unstable for the rack-timing proxy', payload);
  }
  for(const key of [
    'arcades-lounge-level-5/lower-field-dive-curves',
    'nenriki-15-wave-session/flagship-escort-pressure',
    'nenriki-15-wave-session/wrap-return-pressure'
  ]){
    if((byKey[key].motion?.lowerMotionShareOfActive || 0) < .2){
      fail(`Lower-field motion proxy is too weak for dive/wrap conformance use: ${key}`, payload);
    }
  }
  for(const [scoreKey, minimum] of Object.entries({
    referenceSourceCoverage: 8.8,
    formationRackTiming: 6.0,
    movementPressure: 6.0,
    visualAlienIdentity: 6.4,
    audioReferenceCharacter: 4.8,
    evidenceDurability: 9.0
  })){
    if((artifact.frameProxyScores?.[scoreKey] || 0) < minimum){
      fail(`Guardians frame proxy score ${scoreKey} is below the expected floor`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    frameProxyScores: artifact.frameProxyScores,
    selectedWindowCount: windows.length,
    lowerMotionWindows: [
      byKey['arcades-lounge-level-5/lower-field-dive-curves'].motion.lowerMotionShareOfActive,
      byKey['nenriki-15-wave-session/flagship-escort-pressure'].motion.lowerMotionShareOfActive,
      byKey['nenriki-15-wave-session/wrap-return-pressure'].motion.lowerMotionShareOfActive
    ]
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'opening-slice-motion-targets-0.1.json');
const FRAME_REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'opening-slice-frame-reference-0.1.json');
const RENDER_SURFACE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'opening-slice-render-surface-0.1.json');
const RUNTIME_REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'runtime-reference-movement-0.1.json');

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

function inBand(value, band){
  return Array.isArray(band) && Number.isFinite(+value) && +value >= +band[0] && +value <= +band[1];
}

function main(){
  const artifact = readJson(ARTIFACT);
  const frameReference = readJson(FRAME_REFERENCE);
  const renderSurface = readJson(RENDER_SURFACE);
  const runtimeReference = readJson(RUNTIME_REFERENCE);
  const payload = {
    artifact: path.relative(ROOT, ARTIFACT),
    status: artifact.status,
    renderExpectations: renderSurface.renderExpectations,
    runtimeStats: runtimeReference.runtimeStats,
    comparison: runtimeReference.comparison
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Opening-slice motion target artifact is not linked to the Guardians preview.', payload);
  }
  if(artifact.status !== 'source-window-backed-opening-motion-targets'){
    fail('Opening-slice motion target artifact has the wrong status.', payload);
  }

  for(const relPath of [
    artifact.sourceEvidence?.frameReferenceArtifact,
    artifact.sourceEvidence?.renderSurfaceArtifact,
    artifact.sourceEvidence?.runtimeReferenceMovementArtifact,
    frameReference.sourceWindows?.wrapReturnPressure?.frameIndex,
    frameReference.sourceWindows?.wrapReturnPressure?.contactSheet,
    frameReference.sourceWindows?.wrapReturnPressure?.motionDifferenceSheet
  ]){
    if(relPath) ensureExists(relPath);
  }

  const wrapWindow = frameReference.sourceWindows?.wrapReturnPressure || {};
  if(wrapWindow.sourceId !== 'nenriki-15-wave-session' || wrapWindow.windowId !== 'wrap-return-pressure'){
    fail('Opening-slice motion target artifact lost the promoted Nenriki wrap-return authority window.', {
      wrapWindow,
      payload
    });
  }
  if((wrapWindow.sampleReadPoints || []).length < 3){
    fail('Opening-slice motion target artifact needs at least three wrap-return read points.', {
      wrapWindow,
      payload
    });
  }

  const renderTargets = artifact.renderContract || {};
  const renderExpectations = renderSurface.renderExpectations || {};
  if((renderExpectations.minimumStarfieldCount || 0) < (renderTargets.minimumStarfieldCount || 0)){
    fail('Opening-slice render contract fell below the promoted starfield-count target.', payload);
  }
  if((renderExpectations.minimumStarfieldLeadTravelPxBetweenSamples || 0) < (renderTargets.minimumStarfieldLeadTravelPxBetweenSamples || 0)){
    fail('Opening-slice render contract fell below the promoted starfield-travel target.', payload);
  }
  if((renderExpectations.maximumTopReentryLeadY || 0) > (renderTargets.maximumTopReentryLeadY || 0)){
    fail('Opening-slice render contract no longer starts top re-entry high enough above the board.', payload);
  }

  const runtimeTargets = artifact.runtimeMovementContract || {};
  const runtimeStats = runtimeReference.runtimeStats || {};
  if((runtimeReference.runtimeReferenceMovementScore10 || 0) < (runtimeTargets.minimumRuntimeReferenceMovementScore10 || 0)){
    fail('Guardians runtime-reference movement score fell below the promoted opening-motion floor.', payload);
  }
  if((runtimeStats.firstWrapT || Number.POSITIVE_INFINITY) > (runtimeTargets.maximumFirstWrapTSeconds || Number.POSITIVE_INFINITY)){
    fail('Guardians first wrap/return pressure now arrives later than the promoted opening-motion target.', payload);
  }
  if((runtimeStats.wrapCountByFourteenSeconds || 0) < (runtimeTargets.minimumWrapCountByFourteenSeconds || 0)){
    fail('Guardians wrap-return pressure count fell below the promoted opening-motion target.', payload);
  }
  if(!inBand(runtimeStats.medianCandidateXSpan, runtimeTargets.medianCandidateXSpanBand)){
    fail('Guardians runtime x-span drifted outside the promoted opening-motion band.', payload);
  }
  if(!inBand(runtimeStats.medianCandidateYSpan, runtimeTargets.medianCandidateYSpanBand)){
    fail('Guardians runtime y-span drifted outside the promoted opening-motion band.', payload);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    wrapWindow: {
      sourceId: wrapWindow.sourceId,
      windowId: wrapWindow.windowId,
      sampleReadPoints: wrapWindow.sampleReadPoints
    },
    renderContract: renderTargets,
    runtimeMovementContract: runtimeTargets,
    runtimeStats,
    runtimeReferenceMovementScore10: runtimeReference.runtimeReferenceMovementScore10
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

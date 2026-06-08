#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-calibrations', 'stage7-challenge2', 'latest-semantic-runtime-calibration.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 7 semantic runtime calibration report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage7-semantic-runtime-calibration'){
    fail('Unexpected calibration artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 7 || +report.scope?.challengeNumber !== 2){
    fail('Calibration report must stay scoped to Stage 7 / Challenge 2.', { scope: report.scope });
  }
  if(report.candidateId !== 'stage7-semantic-phase-align-protect-0.1'){
    fail('Calibration report must cover the rejected semantic runtime candidate.', { candidateId: report.candidateId });
  }
  const metrics = report.predictedVsActual?.metrics || [];
  for(const metric of ['totalObjectTrackScore10', 'totalObjectTrackCoverage', 'group1', 'group4', 'group5', 'canonicalPathFamilyStatus']){
    if(!metrics.some(row => row.metric === metric)) fail('Calibration report is missing a required predicted-vs-actual metric.', { metric });
  }
  const truth = report.truthAlignment || {};
  if(!Array.isArray(truth.liveGateOrder) || truth.liveGateOrder.length !== 5){
    fail('Calibration report must include a five-group live gate order.', { truthAlignment: truth });
  }
  if(!Array.isArray(truth.measuredIntentOrder) || truth.measuredIntentOrder.length !== 5){
    fail('Calibration report must include a five-group measured intent order.', { truthAlignment: truth });
  }
  if(typeof truth.candidateMatchesLiveGate !== 'boolean' || typeof truth.measuredIntentMatchesLiveGate !== 'boolean'){
    fail('Calibration report must state live-gate truth alignment booleans.', { truthAlignment: truth });
  }
  const mappings = report.runtimeExpressibility || [];
  if(!mappings.length) fail('Calibration report must include runtime expressibility mappings.');
  const phase = mappings.find(row => row.classId === 'phase-duration-rebalance');
  if(!phase || phase.sourceReadySupported !== true){
    fail('phase-duration-rebalance must declare its runtime-consumed control contract.', { phase });
  }
  if(!phase.requiresCompiledRuntimeControls || !phase.requiresProofArtifact){
    fail('phase-duration-rebalance must remain candidate-blocked unless compiled controls and proof are present.', { phase });
  }
  if(report.decision?.runtimeCandidateAllowed !== false || report.decision?.sourceReadyGatePass !== false){
    fail('Rejected calibration must not allow another runtime candidate.', { decision: report.decision });
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidateId: report.candidateId,
    runtimeCandidateAllowed: report.decision.runtimeCandidateAllowed,
    measuredIntentMatchesLiveGate: truth.measuredIntentMatchesLiveGate,
    candidateMatchesLiveGate: truth.candidateMatchesLiveGate,
    remainingCompilerGap: report.decision.remainingCompilerGap
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}

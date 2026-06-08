#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage7-challenge2', 'latest-phase-duration-proof.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 7 phase-duration expressibility proof report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage7-phase-duration-runtime-expressibility-proof'){
    fail('Unexpected phase-duration proof artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 7 || +report.scope?.challengeNumber !== 2){
    fail('Phase-duration proof must stay scoped to Stage 7 / Challenge 2.', { scope: report.scope });
  }
  const controls = report.compilerContract?.controls || [];
  for(const field of ['groupSpawnOffsets[groupIndex-1] or motionSpecGroups[groupIndex-1].spawnOffsetS', 'motionSpecGroups[groupIndex-1].phaseDurations.trackS', 'groupReferencePaths[groupIndex-1].playbackScale']){
    const row = controls.find(control => control.generatedRuntimeField === field);
    if(!row || row.runtimeCurrentlyConsumes !== true || row.proofStatus !== 'browser-proof-pass'){
      fail('A required runtime-consumed phase-duration control did not pass browser proof.', { field, row });
    }
  }
  const exit = controls.find(control => control.generatedRuntimeField === 'motionSpecGroups[groupIndex-1].phaseDurations.exitS');
  if(!exit || exit.runtimeCurrentlyConsumes !== false){
    fail('exitS must remain marked unconsumed until runtime implements it.', { exit });
  }
  if(report.summary?.browserVisibleEffectConfirmed !== true){
    fail('Phase-duration proof must confirm browser-visible effect for generated consumed controls.', { summary: report.summary });
  }
  if(typeof report.summary?.motionProfileGateProxyPass !== 'boolean'){
    fail('Phase-duration proof must report whether proof variants preserve the motion/profile proxy gate.', { summary: report.summary });
  }
  if(report.summary?.group45Preserved !== true){
    fail('Phase-duration proof variants must preserve group 4/group 5 timing windows.', { summary: report.summary });
  }
  if(report.decision?.sourceReadyForCandidates !== false){
    fail('Proof artifact alone must not allow source-ready semantic candidates.', { decision: report.decision });
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    browserVisibleEffectConfirmed: report.summary.browserVisibleEffectConfirmed,
    motionProfileGateProxyPass: report.summary.motionProfileGateProxyPass,
    group45Preserved: report.summary.group45Preserved,
    sourceReadyForCandidates: report.decision.sourceReadyForCandidates
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}

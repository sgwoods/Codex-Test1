#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-candidate-before-after', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function finite(value){
  return Number.isFinite(+value);
}

function frameCount(run){
  return Array.isArray(run && run.frames) ? run.frames.length : 0;
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing challenge candidate before/after artifact. Run npm run harness:analyze:challenge-candidate-before-after first.', { artifact: rel(ARTIFACT) });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'challenge-candidate-before-after'){
    fail('Challenge candidate before/after artifact has the wrong type.', artifact);
  }
  if(!artifact.candidateId || !finite(artifact.stage)){
    fail('Challenge candidate before/after artifact is missing stage or candidate id.', artifact);
  }
  const latest = artifact.media && artifact.media.latestContactSheet
    ? path.join(ROOT, artifact.media.latestContactSheet)
    : null;
  if(!latest || !fs.existsSync(latest)){
    fail('Challenge candidate before/after artifact is missing the stable latest SVG contact sheet.', artifact.media);
  }
  const baselineFrames = frameCount(artifact.baseline);
  const candidateFrames = frameCount(artifact.candidate);
  if(baselineFrames < 8 || baselineFrames !== candidateFrames){
    fail('Challenge candidate before/after artifact must compare equal baseline and candidate frame counts.', { baselineFrames, candidateFrames });
  }
  const selected = artifact.selectedCandidate || {};
  for(const key of ['expectedLift10', 'targetVideoObjectFitLift10', 'humanPerfectPotentialLift10']){
    if(!finite(selected[key])) fail('Challenge candidate before/after selected candidate is missing numeric lift metrics.', { key, selected });
  }
  if(!selected.humanPerfectGuard || !finite(selected.humanPerfectGuard.candidateScore10)){
    fail('Challenge candidate before/after selected candidate is missing the human-perfect guard result.', selected);
  }
  if(!String(artifact.read || '').includes('human-perfect')){
    fail('Challenge candidate before/after read must explain human-perfect review context.', artifact.read);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    latestContactSheet: rel(latest),
    stage: artifact.stage,
    candidateId: artifact.candidateId,
    frameCount: baselineFrames,
    expectedLift10: selected.expectedLift10,
    targetVideoObjectFitLift10: selected.targetVideoObjectFitLift10,
    humanPerfectPotentialLift10: selected.humanPerfectPotentialLift10,
    humanPerfectGuardPass: selected.humanPerfectGuard.pass
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

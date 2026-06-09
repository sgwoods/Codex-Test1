#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-gameplay-candidates-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-gameplay-candidates-0.1.md');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function finite(value){
  return Number.isFinite(+value);
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians Expert gameplay candidate sweep. Run npm run harness:analyze:galaxy-guardians-expert-gameplay-candidates first.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(MARKDOWN)){
    fail('Missing Guardians Expert gameplay candidate sweep markdown.', { markdown: rel(MARKDOWN) });
  }
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.artifactType !== 'galaxy-guardians-expert-gameplay-candidates'){
    fail('Guardians Expert gameplay candidate sweep is attached to the wrong game or artifact type.', artifact);
  }
  if(!String(artifact.status || '').includes('candidate-sweep')){
    fail('Guardians Expert gameplay candidate sweep status must identify the candidate-sweep role.', artifact);
  }
  if(!artifact.baseline || !Array.isArray(artifact.baseline.rows) || artifact.baseline.rows.length < 4){
    fail('Guardians Expert gameplay candidate sweep must include baseline scenario rows.', artifact.baseline);
  }
  if(!Array.isArray(artifact.candidates) || artifact.candidates.length < 4){
    fail('Guardians Expert gameplay candidate sweep must preserve multiple candidate rows.', artifact);
  }
  for(const candidate of artifact.candidates){
    if(!candidate.id || !candidate.summary || !candidate.deltas || !candidate.promotionGate){
      fail('Guardians Expert gameplay candidate is missing summary, deltas, or gate.', candidate);
    }
    if(!finite(candidate.summary.score10) || !finite(candidate.deltas.expertLift)){
      fail('Guardians Expert gameplay candidate has invalid score metrics.', candidate);
    }
  }
  if(!artifact.promotionPolicy || !artifact.promotionPolicy.includes('Survival time alone is not enough')){
    fail('Guardians Expert gameplay candidate sweep must include the gameplay promotion policy.', artifact);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    baselineScore10: artifact.summary?.baselineScore10,
    candidateCount: artifact.summary?.candidateCount,
    passingCandidateCount: artifact.summary?.passingCandidateCount,
    bestCandidateId: artifact.summary?.bestCandidateId
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

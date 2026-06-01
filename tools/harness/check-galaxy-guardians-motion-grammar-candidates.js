#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'motion-grammar-candidates-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'motion-grammar-candidates-0.1.md');

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

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians motion grammar candidate queue. Run npm run harness:analyze:galaxy-guardians-motion-grammar-candidates first.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(MARKDOWN)){
    fail('Missing Guardians motion grammar candidate markdown report.', { markdown: rel(MARKDOWN) });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians motion grammar candidate queue is linked to the wrong game.', artifact);
  }
  if(artifact.artifactType !== 'galaxy-guardians-motion-grammar-candidate-queue'){
    fail('Guardians motion grammar candidate queue has the wrong artifact type.', artifact);
  }
  if(artifact.status !== 'candidate-queue-analysis-only-no-runtime-change'){
    fail('Guardians motion grammar candidate queue must remain analysis-only until a runtime candidate is measured.', artifact);
  }
  const candidates = artifact.candidates || [];
  if(candidates.length < 6){
    fail('Guardians motion grammar candidate queue must preserve the full first-pass candidate set.', { count: candidates.length });
  }
  const requiredPrimitives = new Set(['scoring-routeability-window', 'dive-attack', 'escort-linked-dive', 'bottom-wrap-return', 'rack-drift']);
  for(const primitiveId of requiredPrimitives){
    if(!candidates.some(candidate => candidate.primitiveId === primitiveId)){
      fail('Guardians motion grammar candidate queue is missing a required primitive.', { primitiveId });
    }
  }
  const top = candidates[0];
  if(!top || top.id !== artifact.summary?.topCandidateId || top.primitiveId !== 'scoring-routeability-window'){
    fail('Guardians motion grammar top priority should remain stage-five routeability until measured improvement lands.', { top, summary: artifact.summary });
  }
  for(const candidate of candidates){
    if(!candidate.id || !candidate.title || !candidate.primitiveId || !Array.isArray(candidate.axesTouched) || !candidate.axesTouched.length){
      fail('Guardians motion grammar candidate is missing identity, primitive, or axes.', candidate);
    }
    if(!candidate.problem || !candidate.proposedCandidate || !candidate.playerMeaning || !candidate.promotionGate){
      fail('Guardians motion grammar candidate is missing human-readable decision context.', candidate);
    }
    if(!candidate.routeabilityGate || candidate.routeabilityGate.required !== true || !finite(candidate.routeabilityGate.baselineScore10)){
      fail('Guardians motion grammar candidate is missing routeability gate context.', candidate);
    }
  }
  if(!finite(artifact.summary.routeabilityScore10) || artifact.summary.routeabilityScore10 < 5){
    fail('Guardians motion grammar summary routeability baseline is missing or unexpectedly weak.', artifact.summary);
  }
  const markdown = fs.readFileSync(MARKDOWN, 'utf8');
  if(!markdown.includes('Stage-five stress routeability relief') || !markdown.includes('Promotion gate')){
    fail('Guardians motion grammar markdown report is missing key readable sections.', { markdown: rel(MARKDOWN) });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    candidateCount: candidates.length,
    topCandidateId: artifact.summary.topCandidateId,
    routeabilityScore10: artifact.summary.routeabilityScore10,
    weakestRouteabilityGroupScore10: artifact.summary.weakestRouteabilityGroupScore10
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'game-spec-execution-pattern-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'game-spec-execution-pattern-0.1.md');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing Guardians game-spec execution pattern artifact.', { artifact: rel(ARTIFACT) });
  if(!fs.existsSync(MARKDOWN)) fail('Missing Guardians game-spec execution pattern markdown.', { markdown: rel(MARKDOWN) });
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.artifactType !== 'game-spec-execution-pattern'){
    fail('Guardians game-spec execution pattern is linked incorrectly.', artifact);
  }
  for(const source of Object.values(artifact.sourceEvidence || {})){
    if(!source || !fs.existsSync(path.join(ROOT, source))) fail('Guardians game-spec execution pattern cites missing evidence.', { source });
  }
  for(const field of ['runtimeScope', 'patch', 'promotionGate', 'rollbackSignal']){
    if(!(artifact.candidateProfileContract?.requiredFields || []).includes(field)){
      fail(`Guardians game-spec execution pattern candidate contract is missing ${field}.`, artifact.candidateProfileContract);
    }
  }
  for(const phrase of ['Aurora', 'video-ingestion', 'candidate profiles']){
    if(!fs.readFileSync(MARKDOWN, 'utf8').includes(phrase)){
      fail('Guardians game-spec execution pattern markdown is missing strategic context.', { phrase });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    reusablePatternCount: artifact.reusablePattern.length,
    platformExtractionStepCount: artifact.platformExtractionPlan.length,
    auroraSharedLayerCount: artifact.auroraReadiness.expectedSharedLayers.length
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'shared-motion-grammar', 'vocabulary-0.1.json');
const DOC = path.join(ROOT, 'MOTION_GRAMMAR_VOCABULARY.md');

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

function ids(rows){
  return new Set((Array.isArray(rows) ? rows : []).map(row => row && row.id).filter(Boolean));
}

function requireIds(label, actual, required){
  const missing = required.filter(id => !actual.has(id));
  if(missing.length) fail(`Shared motion grammar is missing ${label}.`, { missing });
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing shared motion grammar vocabulary artifact.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(DOC)){
    fail('Missing shared motion grammar vocabulary documentation.', { doc: rel(DOC) });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'shared-motion-grammar-vocabulary'){
    fail('Shared motion grammar artifact type is wrong.', artifact);
  }
  if(artifact.status !== 'planning-contract-active'){
    fail('Shared motion grammar status must remain explicit.', artifact);
  }
  requireIds('axes', ids(artifact.axes), [
    'temporal-cadence',
    'path-topology',
    'object-grouping',
    'role-family',
    'player-routeability',
    'collision-safety',
    'shot-window',
    'visual-readability',
    'audio-cue-hooks'
  ]);
  requireIds('primitives', ids(artifact.primitives), [
    'formation-entry',
    'rack-drift',
    'dive-attack',
    'escort-linked-dive',
    'bottom-wrap-return',
    'challenge-setpiece-group',
    'pulse-flap-cadence',
    'capture-tractor',
    'scoring-routeability-window'
  ]);
  const gameKeys = new Set((artifact.gameMappings || []).map(row => row.gameKey));
  for(const gameKey of ['aurora-galactica', 'galaxy-guardians-preview', 'windigo-invaders-candidate']){
    if(!gameKeys.has(gameKey)) fail('Shared motion grammar is missing a game mapping.', { gameKey });
  }
  const policy = String(artifact.promotionPolicy || '').toLowerCase();
  if(!policy.includes('routeability') || !policy.includes('visual') || !policy.includes('collision safety')){
    fail('Shared motion grammar promotion policy must cover visual fit, routeability, and collision safety.', artifact.promotionPolicy);
  }
  const doc = fs.readFileSync(DOC, 'utf8');
  for(const phrase of ['Challenging Stage 2-3', 'No movement candidate should ship', 'Galaxy Guardians']){
    if(!doc.includes(phrase)) fail('Shared motion grammar documentation is missing required explanatory text.', { phrase });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    doc: rel(DOC),
    axisCount: artifact.axes.length,
    primitiveCount: artifact.primitives.length,
    gameMappingCount: artifact.gameMappings.length
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

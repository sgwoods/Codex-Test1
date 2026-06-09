#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-opening-failure-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-opening-failure-0.1.md');

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
    fail('Missing Guardians Expert opening diagnostic. Run npm run harness:analyze:galaxy-guardians-expert-opening-failure first.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(MARKDOWN)){
    fail('Missing Guardians Expert opening diagnostic markdown.', { markdown: rel(MARKDOWN) });
  }
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.artifactType !== 'galaxy-guardians-expert-opening-failure'){
    fail('Guardians Expert opening diagnostic is attached to the wrong game or artifact type.', artifact);
  }
  if(!String(artifact.status || '').includes('routeability-diagnostic')){
    fail('Guardians Expert opening diagnostic status must remain diagnostic-only.', artifact);
  }
  const summary = artifact.summary || {};
  if(summary.persona !== 'expert' || +summary.seed !== 5175){
    fail('Guardians Expert opening diagnostic must track the maintained weak Expert seed.', summary);
  }
  if(!finite(summary.simT) || !finite(summary.score) || !finite(summary.lossCount)){
    fail('Guardians Expert opening diagnostic summary is missing core metrics.', summary);
  }
  const losses = artifact.trace?.losses || [];
  if(!Array.isArray(losses)){
    fail('Guardians Expert opening diagnostic losses must be an array.', artifact.trace);
  }
  if(!losses.length && (!finite(summary.simT) || summary.simT < 170 || artifact.trace?.gameOver)){
    fail('Guardians Expert opening diagnostic without losses must prove a durable active run.', artifact.trace);
  }
  for(const loss of losses){
    if(!finite(loss.t) || !loss.cause || !loss.frameBefore || !Array.isArray(loss.recentEvents)){
      fail('Guardians Expert loss window is missing timing, cause, frame-before, or recent events.', loss);
    }
  }
  if(!artifact.promotionPolicy || !artifact.promotionPolicy.includes('preserve Advanced three-ship routeability')){
    fail('Guardians Expert opening diagnostic must include the safe promotion policy.', artifact);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    persona: summary.persona,
    seed: summary.seed,
    simT: summary.simT,
    score: summary.score,
    lossCount: summary.lossCount,
    enemyShotLosses: summary.enemyShotLosses,
    collisionLosses: summary.collisionLosses
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

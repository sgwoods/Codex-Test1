#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'routeability-review-0.1.json');

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
    fail('Missing Guardians routeability review. Run npm run harness:analyze:galaxy-guardians-routeability-review first.', { artifact: rel(ARTIFACT) });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians routeability review is linked to the wrong game.', artifact);
  }
  if(artifact.artifactType !== 'galaxy-guardians-routeability-review'){
    fail('Guardians routeability review has the wrong artifact type.', artifact);
  }
  if(!String(artifact.status || '').includes('routeability-gate')){
    fail('Guardians routeability review status does not identify the gate policy.', artifact);
  }
  const summary = artifact.summary || {};
  if(!finite(summary.routeabilityScore10) || summary.routeabilityScore10 < 4.8){
    fail('Guardians routeability review fell below the maintained planning floor.', summary);
  }
  if(summary.routeabilityScore10 < 5.8 && !summary.weakestGroup){
    fail('Guardians routeability review must name the weakest group while the score is below the next improvement target.', summary);
  }
  if(!Array.isArray(artifact.groups) || artifact.groups.length < 3){
    fail('Guardians routeability review must preserve competitive, review, and midrun groups.', artifact);
  }
  for(const group of artifact.groups){
    if(!finite(group.score10) || !Array.isArray(group.rows) || !group.rows.length){
      fail('Guardians routeability group is missing score or persona rows.', group);
    }
    for(const row of group.rows){
      if(!finite(row.score10) || !row.components || !finite(row.components.survivalShare)){
        fail('Guardians routeability row is missing component scores.', row);
      }
    }
  }
  const midrun = artifact.groups.find(group => group.label === 'midrun-stage-five-stress');
  if(!midrun || !finite(midrun.score10)){
    fail('Guardians routeability review is missing the stage-five stress group.', artifact);
  }
  if(midrun.score10 < 4.2){
    fail('Guardians stage-five routeability has dropped below the minimum baseline needed for review usefulness.', midrun);
  }
  if(!artifact.promotionPolicy || !artifact.promotionPolicy.includes('preserve or improve routeability')){
    fail('Guardians routeability review is missing the durable promotion policy.', artifact);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    routeabilityScore10: summary.routeabilityScore10,
    weakestGroup: summary.weakestGroup,
    weakestGroupScore10: summary.weakestGroupScore10,
    midrunScore10: midrun.score10
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

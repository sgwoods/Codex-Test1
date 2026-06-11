#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-galaxian-closeness-0.1.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function finite(value){
  return Number.isFinite(+value);
}

function mustExist(relPath, payload){
  if(!relPath || !fs.existsSync(path.join(ROOT, relPath))){
    fail(`Missing cited Guardians stage-five source evidence: ${relPath || '(empty)'}`, payload);
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians stage-five Galaxian closeness artifact. Run npm run harness:analyze:galaxy-guardians-stage-five-closeness first.', {
      artifact: rel(ARTIFACT)
    });
  }
  const artifact = readJson(ARTIFACT);
  const summary = artifact.summary || {};
  const paceFocus = artifact.paceFocus || {};
  const payload = {
    artifact: rel(ARTIFACT),
    status: artifact.status,
    summary,
    paceFocus
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Stage-five closeness artifact is linked to the wrong game.', payload);
  }
  if(artifact.artifactType !== 'stage-five-galaxian-closeness'){
    fail('Stage-five closeness artifact has the wrong artifact type.', payload);
  }
  if(!String(artifact.status || '').includes('stage-five-galaxian-closeness')){
    fail('Stage-five closeness artifact status does not identify the planning gate.', payload);
  }
  for(const source of Object.values(artifact.sourceEvidence || {})){
    mustExist(source, payload);
  }
  for(const [key, floor] of Object.entries({
    stageFiveClosenessScore10: 6.0,
    stageFiveRouteabilityScore10: 6.0,
    alienShipPaceConformanceScore10: 5.5,
    missilePaceConformanceScore10: 6.5,
    lowerFieldReadabilityScore10: 4.8
  })){
    if(!finite(summary[key]) || summary[key] < floor){
      fail(`Stage-five closeness summary ${key} is below floor ${floor}.`, payload);
    }
  }
  for(const key of ['alienShipMovement', 'missileMovement', 'lowerFieldReadability']){
    const lane = paceFocus[key];
    if(!lane || !finite(lane.score10) || !lane.currentRead){
      fail(`Stage-five closeness artifact is missing pace lane ${key}.`, payload);
    }
  }
  const policy = String(artifact.promotionPolicy || '');
  for(const phrase of ['alien ship pace', 'missile pace', 'enemy missile velocity', 'player missile velocity', 'single-shot cooldown']){
    if(!policy.includes(phrase)){
      fail(`Stage-five closeness promotion policy must name ${phrase}.`, payload);
    }
  }
  const window = artifact.stageFiveWindow || {};
  if(!finite(window.pace?.medianAlienShipSpeedPxPerSecond) || window.pace.medianAlienShipSpeedPxPerSecond <= 0){
    fail('Stage-five closeness artifact did not measure alien ship pace.', payload);
  }
  if(!finite(window.pace?.medianEnemyMissileSpeedPxPerSecond) || window.pace.medianEnemyMissileSpeedPxPerSecond <= 0){
    fail('Stage-five closeness artifact did not measure enemy missile pace.', payload);
  }
  if(!finite(window.pace?.medianPlayerMissileYSpeedPxPerSecond) || window.pace.medianPlayerMissileYSpeedPxPerSecond <= 0){
    fail('Stage-five closeness artifact did not measure player missile pace.', payload);
  }
  if((window.events?.enemyShot || 0) < 6 || (window.events?.alienDiveStart || 0) < 6){
    fail('Stage-five closeness window is not dense enough to review pressure pace.', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    stageFiveClosenessScore10: summary.stageFiveClosenessScore10,
    stageFiveRouteabilityScore10: summary.stageFiveRouteabilityScore10,
    alienShipPaceConformanceScore10: summary.alienShipPaceConformanceScore10,
    missilePaceConformanceScore10: summary.missilePaceConformanceScore10,
    weakestFocus: summary.weakestFocus
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

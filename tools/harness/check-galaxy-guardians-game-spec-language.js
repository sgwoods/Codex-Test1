#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'game-spec-language-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'game-spec-language-0.1.md');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function ids(rows){
  return new Set((Array.isArray(rows) ? rows : []).map(row => row && row.id).filter(Boolean));
}

function requireIds(label, actual, required){
  const missing = required.filter(id => !actual.has(id));
  if(missing.length) fail(`Guardians game spec language is missing ${label}.`, { missing });
}

function mustExist(relPath, payload){
  if(!relPath || !fs.existsSync(path.join(ROOT, relPath))){
    fail(`Guardians game spec language cites missing evidence: ${relPath || '(empty)'}`, payload);
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians game spec language artifact.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(MARKDOWN)){
    fail('Missing Guardians game spec language markdown companion.', { markdown: rel(MARKDOWN) });
  }
  const artifact = readJson(ARTIFACT);
  const packageJson = readJson(PACKAGE_JSON);
  const scripts = packageJson.scripts || {};
  const payload = {
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    gameKey: artifact.gameKey,
    artifactType: artifact.artifactType,
    status: artifact.status
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians game spec language is linked to the wrong game.', payload);
  }
  if(artifact.artifactType !== 'galaxy-guardians-game-spec-language'){
    fail('Guardians game spec language has the wrong artifact type.', payload);
  }
  if(artifact.status !== 'planning-contract-active-not-runtime-promotion'){
    fail('Guardians game spec language must stay explicit that it is not runtime promotion.', payload);
  }
  for(const source of Object.values(artifact.sourceEvidence || {})){
    mustExist(source, payload);
  }

  const layerIds = ids(artifact.specLayers);
  requireIds('spec layers', layerIds, [
    'application-identity',
    'stage-band-arc',
    'role-family-model',
    'movement-language',
    'scoring-progression-results',
    'audio-visual-hooks',
    'promotion-gates'
  ]);

  const stageBand = (artifact.specLayers || []).find(layer => layer.id === 'stage-band-arc');
  requireIds('stage bands', ids(stageBand?.bands), [
    'attract-and-ready',
    'opening-establish',
    'early-escalation',
    'sustained-pressure',
    'bounded-late-loop'
  ]);

  const roles = (artifact.specLayers || []).find(layer => layer.id === 'role-family-model');
  requireIds('role families', ids(roles?.roles), [
    'signal-scout',
    'signal-escort',
    'signal-flagship',
    'player-interceptor'
  ]);

  const movement = (artifact.specLayers || []).find(layer => layer.id === 'movement-language') || {};
  for(const primitiveId of ['formation-entry', 'rack-drift', 'dive-attack', 'escort-linked-dive', 'bottom-wrap-return', 'scoring-routeability-window']){
    if(!(movement.requiredPrimitiveIds || []).includes(primitiveId)){
      fail('Guardians game spec language is missing a required motion primitive.', { primitiveId, movement });
    }
  }
  for(const axisId of ['player-routeability', 'collision-safety', 'shot-window', 'visual-readability', 'audio-cue-hooks']){
    if(!(movement.requiredAxes || []).includes(axisId)){
      fail('Guardians game spec language is missing a required grammar axis.', { axisId, movement });
    }
  }
  const promotionRule = String(movement.promotionRule || '').toLowerCase();
  for(const phrase of ['routeability', 'collision safety', 'shot windows', 'visual readability']){
    if(!promotionRule.includes(phrase)){
      fail('Guardians movement promotion rule is missing required language.', { phrase, promotionRule: movement.promotionRule });
    }
  }

  const templateFields = new Set(artifact.futureAdjustmentTemplate?.requiredFields || []);
  for(const field of ['candidateId', 'affectedSpecLayers', 'stageBand', 'roleFamilies', 'movementPrimitives', 'axesTouched', 'routeabilityExpectation', 'collisionSafetyExpectation', 'promotionGates', 'rollbackSignal']){
    if(!templateFields.has(field)){
      fail('Guardians future adjustment template is missing a required field.', { field });
    }
  }

  for(const scriptName of ['harness:check:galaxy-guardians-game-spec-language', 'harness:check:galaxy-guardians-first-class-conformance']){
    if(!scripts[scriptName]){
      fail('Guardians game spec language is missing an npm gate script.', { scriptName });
    }
  }

  const markdown = read(MARKDOWN);
  for(const phrase of ['Adjustment Template', 'Promotion Rule', 'stage-five lower-field readability']){
    if(!markdown.includes(phrase)){
      fail('Guardians game spec language markdown is missing required explanatory text.', { phrase });
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    specLayerCount: artifact.specLayers.length,
    stageBandCount: stageBand.bands.length,
    roleCount: roles.roles.length,
    requiredTemplateFieldCount: artifact.futureAdjustmentTemplate.requiredFields.length
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

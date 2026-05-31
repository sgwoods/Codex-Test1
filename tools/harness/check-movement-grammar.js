#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'ingestion', 'movement-grammar', 'movement-grammar-0.1.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    fail('movement grammar artifact could not be read', { file, error: err.message });
  }
}

function assertArray(value, label, min = 1){
  if(!Array.isArray(value) || value.length < min){
    fail(`${label} must contain at least ${min} item(s)`, { label, count: Array.isArray(value) ? value.length : null });
  }
}

function inUnit(value){
  return Number.isFinite(+value) && +value >= 0 && +value <= 1;
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('movement grammar artifact is missing', { file: ARTIFACT });
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'platinum-movement-grammar-plan'){
    fail('unexpected artifactType', { artifactType: artifact.artifactType });
  }

  assertArray(artifact.motionSurfaces, 'motionSurfaces', 6);
  assertArray(artifact.compilerTargets, 'compilerTargets', 2);
  assertArray(artifact.samplePatterns, 'samplePatterns', 3);
  assertArray(artifact.migrationPlan, 'migrationPlan', 5);
  assertArray(artifact.successCriteria, 'successCriteria', 4);

  const requiredSurfaces = [
    'regular-formation-entry',
    'challenge-stage-set-piece',
    'dive-attack',
    'boss-escort-squadron',
    'capture-rescue-return',
    'theme-variant-motion'
  ];
  const surfaceIds = new Set(artifact.motionSurfaces.map(surface => surface.id));
  for(const id of requiredSurfaces){
    if(!surfaceIds.has(id)) fail('required motion surface is missing', { id });
  }

  const requiredFields = artifact.patternSchema?.requiredFields || [];
  for(const field of ['id', 'appliesTo', 'gameScope', 'roleBindings', 'phaseTimeline', 'controlPoints', 'scoreWindows', 'eventAnchors', 'variationControls', 'measurement']){
    if(!requiredFields.includes(field)) fail('required pattern schema field is missing', { field });
  }

  const compilerIds = new Set(artifact.compilerTargets.map(target => target.id));
  for(const id of ['aurora-current-runtime', 'future-pattern-runtime', 'documentation-and-dashboard']){
    if(!compilerIds.has(id)) fail('compiler target is missing', { id });
  }

  for(const pattern of artifact.samplePatterns){
    for(const field of requiredFields){
      if(pattern[field] === undefined || pattern[field] === null){
        fail('sample pattern is missing required field', { pattern: pattern.id, field });
      }
    }
    if(!surfaceIds.has(pattern.appliesTo)){
      fail('sample pattern appliesTo does not match a declared motion surface', { pattern: pattern.id, appliesTo: pattern.appliesTo });
    }
    assertArray(pattern.phaseTimeline, `phaseTimeline for ${pattern.id}`, 2);
    assertArray(pattern.controlPoints, `controlPoints for ${pattern.id}`, 2);
    assertArray(pattern.eventAnchors, `eventAnchors for ${pattern.id}`, 1);
    for(const point of pattern.controlPoints){
      if(!Number.isFinite(+point.t) || !inUnit(point.x) || !Number.isFinite(+point.y)){
        fail('control point must include finite t, unit-space x, and finite y', { pattern: pattern.id, point });
      }
      if(+point.y < -0.2 || +point.y > 1.25){
        fail('control point y is outside accepted overscan bounds', { pattern: pattern.id, point });
      }
    }
  }

  const next = artifact.migrationPlan.find(step => step.status === 'next');
  if(!next) fail('migration plan must identify the next step');

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    surfaces: artifact.motionSurfaces.length,
    samplePatterns: artifact.samplePatterns.length,
    nextStep: next.label,
    summary: artifact.summary
  }, null, 2));
}

main();

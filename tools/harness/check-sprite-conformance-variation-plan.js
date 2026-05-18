#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PLAN = path.join(ROOT, 'reference-artifacts', 'ingestion', 'sprite-conformance-variation-plan', 'plan-0.1.json');
const CROP_MANIFEST = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-alien-visual-reference', 'crop-box-manifest-0.1.json');
const CROP_PREVIEW = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-crop-previews', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

if(!fs.existsSync(PLAN)) fail(`Missing sprite conformance variation plan: ${rel(PLAN)}`);
if(!fs.existsSync(CROP_MANIFEST)) fail(`Missing Galaga alien visual crop-box manifest: ${rel(CROP_MANIFEST)}`);

let plan;
let cropManifest;
try{
  plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
}catch(err){
  fail(`Could not parse ${rel(PLAN)}: ${err.message}`);
}
try{
  cropManifest = JSON.parse(fs.readFileSync(CROP_MANIFEST, 'utf8'));
}catch(err){
  fail(`Could not parse ${rel(CROP_MANIFEST)}: ${err.message}`);
}

const requiredLanes = [
  'reference-conformance-lane',
  'aurora-production-theme-lane',
  'future-game-ingestion-lane'
];
const requiredSteps = [
  'source-manifest',
  'crop-box-manifest',
  'pose-and-motion-targets',
  'runtime-renderer-path',
  'scoring-and-gates',
  'variation-generation',
  'developer-controls'
];

const lanes = new Set((plan.lanes || []).map(item => item.id));
const steps = new Set((plan.pipelineSteps || []).map(item => item.id));
const missingLanes = requiredLanes.filter(id => !lanes.has(id));
const missingSteps = requiredSteps.filter(id => !steps.has(id));
if(missingLanes.length) fail('Sprite plan is missing required lanes.', { missingLanes });
if(missingSteps.length) fail('Sprite plan is missing required pipeline steps.', { missingSteps });

if(!/crop-box[- ]manifest/i.test(String(plan.nextBestStep || ''))){
  fail('Sprite plan nextBestStep should keep the crop-box manifest as the immediate implementation focus.', {
    nextBestStep: plan.nextBestStep || ''
  });
}

const missingArtifacts = (plan.artifacts || [])
  .filter(item => item.path && !fs.existsSync(path.join(ROOT, item.path)))
  .map(item => item.path);
if(missingArtifacts.length){
  fail('Sprite plan references missing artifacts.', { missingArtifacts });
}
const artifactPaths = new Set((plan.artifacts || []).map(item => item.path));
for(const expected of [
  'GALAGA_ALIEN_CROP_PREVIEW.md',
  'reference-artifacts/analyses/galaga-alien-visual-crop-previews/latest.json'
]){
  if(!artifactPaths.has(expected)){
    fail('Sprite plan should include the generated crop-preview artifact.', { expected });
  }
}
if(!fs.existsSync(CROP_PREVIEW)){
  fail(`Missing generated Galaga alien crop preview report: ${rel(CROP_PREVIEW)}`);
}

const requiredRoles = [
  'player-fighter',
  'bee-zako',
  'butterfly-escort',
  'boss-galaga',
  'challenge-specialty-aliens',
  'projectiles-and-impacts',
  'tractor-beam'
];
const cropRoles = new Set((cropManifest.targetRolePlan || []).map(item => item.roleKey));
const missingRoles = requiredRoles.filter(role => !cropRoles.has(role));
if(missingRoles.length) fail('Crop-box manifest is missing required target roles.', { missingRoles });
if(!Array.isArray(cropManifest.regions) || cropManifest.regions.length < 4){
  fail('Crop-box manifest should expose the first-pass source-sheet regions.', {
    regionCount: Array.isArray(cropManifest.regions) ? cropManifest.regions.length : 0
  });
}

console.log(JSON.stringify({
  ok: true,
  artifact: rel(PLAN),
  cropManifest: rel(CROP_MANIFEST),
  laneCount: (plan.lanes || []).length,
  pipelineStepCount: (plan.pipelineSteps || []).length,
  successCriteriaCount: (plan.successCriteria || []).length,
  cropRegionCount: (cropManifest.regions || []).length,
  targetRoleCount: (cropManifest.targetRolePlan || []).length,
  cropPreview: rel(CROP_PREVIEW),
  nextBestStep: plan.nextBestStep || ''
}, null, 2));

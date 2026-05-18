#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-reference', 'latest.json');
const REQUIRED_ROLES = [
  'player-fighter',
  'bee-line',
  'but-line',
  'boss-line',
  'challenge-dragonfly',
  'challenge-mosquito',
  'tractor-beam',
  'projectiles'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if(!fs.existsSync(REPORT)){
  fail('Galaga alien visual reference report is missing; run npm run harness:analyze:galaga-alien-visual-reference first', { report: REPORT });
}

const report = readJson(REPORT);
if(report.artifactType !== 'galaga-alien-visual-reference-pack'){
  fail('unexpected artifact type', { artifactType: report.artifactType });
}

const entries = Array.isArray(report.entries) ? report.entries : [];
if(entries.length < 11) fail('visual reference pack should account for all supplied images', { count: entries.length });

for(const entry of entries){
  if(!entry.id || !entry.path || !entry.sourceClass || !entry.targetUse || !Array.isArray(entry.roleKeys) || !entry.roleKeys.length){
    fail('visual reference entry is missing required index fields', entry);
  }
  if(!entry.exists || !fs.existsSync(path.join(ROOT, entry.path))){
    fail('visual reference entry points at a missing committed source image', entry);
  }
  if(!Number.isFinite(+entry.width) || !Number.isFinite(+entry.height) || +entry.width <= 0 || +entry.height <= 0){
    fail('visual reference entry has invalid image dimensions', entry);
  }
}

const coverage = Array.isArray(report.roleCoverage) ? report.roleCoverage : [];
for(const roleKey of REQUIRED_ROLES){
  const row = coverage.find(item => item.roleKey === roleKey);
  if(!row) fail(`visual reference pack is missing role coverage for ${roleKey}`, { coverage });
  if(!row.imageCount || row.imageCount < 1) fail(`visual reference role ${roleKey} has no images`, row);
}

const canonical = entries.find(entry => entry.id === 'general-sprites-sheet');
if(!canonical || canonical.targetCandidateScore < 10 || !String(canonical.sourceClass).includes('sprite-sheet')){
  fail('general sprite sheet should remain the strongest target candidate', canonical);
}

const duplicates = entries.filter(entry => entry.duplicateOf);
if(!duplicates.length || !duplicates.some(entry => entry.id === 'tractor-beam-poster-b-duplicate')){
  fail('duplicate supplied tractor-beam poster should be explicitly accounted for', { duplicates });
}

if(!Array.isArray(report.targetPromotionPlan) || report.targetPromotionPlan.length < 5){
  fail('visual reference report is missing the target promotion plan', report);
}

console.log(JSON.stringify({
  ok: true,
  imageCount: entries.length,
  uniqueImageHashCount: report.summary?.uniqueImageHashCount,
  targetCandidateCount: report.summary?.targetCandidateCount,
  roleCoverageCount: coverage.length
}, null, 2));

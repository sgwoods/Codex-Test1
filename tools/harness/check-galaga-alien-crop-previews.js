#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-crop-previews', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

if(!fs.existsSync(REPORT)) fail(`Missing crop preview report: ${rel(REPORT)}`);

let report;
try{
  report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
}catch(err){
  fail(`Could not parse ${rel(REPORT)}: ${err.message}`);
}

const regions = Array.isArray(report.regions) ? report.regions : [];
const roles = Array.isArray(report.targetRolePlan) ? report.targetRolePlan : [];
if(regions.length < 4) fail('Expected at least four crop preview regions.', { regionCount: regions.length });
if(roles.length < 7) fail('Expected at least seven target role plans.', { targetRoleCount: roles.length });

const missingPreviews = regions
  .flatMap(region => [region.previewImage, region.gridPreviewImage].filter(Boolean))
  .filter(src => !fs.existsSync(path.join(ROOT, src)));
if(missingPreviews.length) fail('Crop preview report references missing preview images.', { missingPreviews });

const truncatedCells = regions.filter(region => {
  const interestingCells = Array.isArray(region.interestingCells) ? region.interestingCells : [];
  return (+region.interestingCellCount || 0) > 0 && interestingCells.length !== +region.interestingCellCount;
});
if(truncatedCells.length){
  fail('Crop preview report should persist every interesting cell box for downstream target promotion.', {
    truncatedCells: truncatedCells.map(region => ({
      id: region.id,
      interestingCellCount: region.interestingCellCount,
      persistedCellCount: Array.isArray(region.interestingCells) ? region.interestingCells.length : 0
    }))
  });
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
const roleKeys = new Set(roles.map(role => role.roleKey));
const missingRoles = requiredRoles.filter(role => !roleKeys.has(role));
if(missingRoles.length) fail('Crop preview report is missing required target roles.', { missingRoles });

const summary = report.summary || {};
if((+summary.gridCellCount || 0) < 120){
  fail('Crop preview report scanned too few grid cells for this source sheet.', { gridCellCount: summary.gridCellCount });
}
if((+summary.interestingCellCount || 0) < 24){
  fail('Crop preview report found too few lit candidate cells for useful review.', { interestingCellCount: summary.interestingCellCount });
}
if((+summary.persistedInterestingCellCount || 0) !== (+summary.interestingCellCount || 0)){
  fail('Crop preview report summary should show that all interesting cells are persisted.', summary);
}

console.log(JSON.stringify({
  ok: true,
  artifact: rel(REPORT),
  regionCount: regions.length,
  targetRoleCount: roles.length,
  gridCellCount: summary.gridCellCount,
  interestingCellCount: summary.interestingCellCount,
  persistedInterestingCellCount: summary.persistedInterestingCellCount
}, null, 2));

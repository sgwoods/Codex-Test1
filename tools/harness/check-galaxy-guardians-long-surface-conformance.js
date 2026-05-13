#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, buildGuardiansLongSurfaceArtifact } = require('./guardians-long-surface-lib');

const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'long-surface-conformance-0.1.json');

function fail(message, payload){
 console.error(message);
 if(payload) console.error(JSON.stringify(payload, null, 2));
 process.exit(1);
}

function readJson(file){
 return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function comparable(artifact){
 const copy = JSON.parse(JSON.stringify(artifact));
 delete copy.createdOn;
 return copy;
}

function main(){
 if(!fs.existsSync(ARTIFACT)) fail(`Missing Galaxy Guardians long-surface artifact: ${path.relative(ROOT, ARTIFACT)}`);
 const artifact = readJson(ARTIFACT);
 const expected = buildGuardiansLongSurfaceArtifact({ createdOn: artifact.createdOn || '2026-05-13' });
 const payload = {
  artifact: path.relative(ROOT, ARTIFACT),
  status: artifact.status,
  summary: artifact.summary,
  runtimeBands: artifact.runtimeBands,
  categories: artifact.categories
 };

 if(artifact.gameKey !== 'galaxy-guardians-preview'){
  fail('Galaxy Guardians long-surface artifact is not linked to the preview pack.', payload);
 }
 if(artifact.status !== 'dev-preview-long-surface-and-persona-review-not-public-release'){
  fail('Galaxy Guardians long-surface artifact has the wrong status.', payload);
 }
 if(JSON.stringify(comparable(artifact)) !== JSON.stringify(comparable(expected))){
  fail('Galaxy Guardians long-surface artifact drifted from the current source-derived review.', {
   artifact: comparable(artifact),
   expected: comparable(expected)
  });
 }
 const categories = artifact.categories || [];
 const weightTotal = categories.reduce((sum, category) => sum + (+category.weight || 0), 0);
 if(weightTotal !== 100){
  fail('Galaxy Guardians long-surface category weights must sum to 100.', payload);
 }
 if((artifact.summary?.overallLongSurfaceScore10 || 0) < 6.8){
  fail('Galaxy Guardians long-surface review regressed below the maintained floor.', payload);
 }
 if((artifact.summary?.personaReviewUtilityScore10 || 0) < 6.5){
  fail('Galaxy Guardians persona review utility regressed below the maintained floor.', payload);
 }
 if((artifact.summary?.midrunSurvivabilityScore10 || 0) < 5.5){
  fail('Galaxy Guardians midrun survivability read regressed below the maintained floor.', payload);
 }
 const competitive = artifact.personaRuns?.competitiveThreeShip || [];
 const review = artifact.personaRuns?.reviewFiveShip || [];
 if(competitive.length !== 4 || review.length < 3){
  fail('Galaxy Guardians long-surface review must preserve the four competitive personas and three review personas.', payload);
 }
 const themeIds = new Set((artifact.runtimeBands || []).map(band => band.themeId).filter(Boolean));
 if(themeIds.size < 4){
  fail('Galaxy Guardians long-surface review requires at least four distinct stage themes across the later surface.', payload);
 }
 if(!review.some(run => !run.gameOver || run.simT >= 180)){
  fail('Galaxy Guardians review personas no longer survive long enough to support a longer-surface tuning pass.', payload);
 }

 console.log(JSON.stringify({
  ok: true,
  artifact: path.relative(ROOT, ARTIFACT),
  overallLongSurfaceScore10: artifact.summary.overallLongSurfaceScore10,
  stageArcPressureScore10: artifact.summary.stageArcPressureScore10,
  stagePresentationScore10: artifact.summary.stagePresentationScore10,
  personaReviewUtilityScore10: artifact.summary.personaReviewUtilityScore10,
  midrunSurvivabilityScore10: artifact.summary.midrunSurvivabilityScore10,
  reviewSurvivorPersonas: review.filter(run => !run.gameOver || run.simT >= 180).map(run => run.persona)
 }, null, 2));
}

try{
 main();
}catch(err){
 fail(err && err.stack || String(err));
}

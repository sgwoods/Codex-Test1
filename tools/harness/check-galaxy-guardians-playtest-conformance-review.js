#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/playtest-conformance-review-0.1.json';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function rounded(value, places = 1){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function main(){
  const artifact = readJson(ARTIFACT);
  const categories = artifact.categories || [];
  const weightTotal = categories.reduce((sum, category) => sum + (+category.weight || 0), 0);
  const weightedScore = weightTotal
    ? rounded(categories.reduce((sum, category) => sum + (+category.weight || 0) * (+category.playtestWeightedScore10 || 0), 0) / weightTotal)
    : 0;
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    weightTotal,
    weightedScore,
    categories: categories.map(category => ({
      id: category.id,
      weight: category.weight,
      previousOfficialScore10: category.previousOfficialScore10,
      playtestAdjustedBeforePass10: category.playtestAdjustedBeforePass10,
      playtestWeightedScore10: category.playtestWeightedScore10,
      compellingPreviewTarget10: category.compellingPreviewTarget10
    }))
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Guardians playtest conformance review is not linked to the preview pack', payload);
  }
  if(artifact.status !== 'playtest-weighted-preview-gap-review'){
    fail('Guardians playtest conformance review has the wrong status', payload);
  }
  if(weightTotal !== 100){
    fail('Guardians playtest conformance category weights must sum to 100', payload);
  }
  if(Math.abs(weightedScore - artifact.summary.playtestWeightedConformanceScore10) > 0.05){
    fail('Guardians playtest-weighted score does not match weighted categories', payload);
  }
  if(artifact.summary.playtestWeightedConformanceScore10 >= artifact.summary.evidenceWeightedReferenceScore10){
    fail('Playtest-weighted score should remain lower than evidence-weighted reference score until the preview feels convincing', payload);
  }
  if(artifact.summary.playtestWeightedConformanceScore10 >= artifact.summary.compellingPreviewTargetScore10){
    fail('Guardians playtest review should not mark the preview compelling until the beta-facing bar is reached', payload);
  }
  for(const relPath of artifact.sourceEvidence?.referenceEvidence || []){
    if(!exists(relPath)) fail(`Guardians playtest review references a missing artifact: ${relPath}`, payload);
  }
  for(const finding of ['Sound is nothing like the original Galaxians.', 'Pace feels off and slow in various ways.', 'Graphics still feel pretty far from the original.']){
    if(!(artifact.sourceEvidence?.playtestFindings || []).includes(finding)){
      fail(`Guardians playtest review is missing feedback finding: ${finding}`, payload);
    }
  }
  for(const requiredId of ['audio-character', 'motion-pressure', 'visual-identity', 'platform-boundary-readiness']){
    const category = categories.find(entry => entry.id === requiredId);
    if(!category) fail(`Guardians playtest review missing category ${requiredId}`, payload);
    if(!Array.isArray(category.metricSet) || category.metricSet.length < 4){
      fail(`Guardians playtest category ${requiredId} needs a metric set`, { category, payload });
    }
    if(!category.currentRead || !category.nextEvidenceNeeded){
      fail(`Guardians playtest category ${requiredId} must preserve current read and next evidence`, { category, payload });
    }
    if((+category.playtestWeightedScore10 || 0) > (+category.compellingPreviewTarget10 || 0) && requiredId !== 'platform-boundary-readiness'){
      fail(`Guardians playtest category ${requiredId} should not exceed its compelling-preview target yet`, { category, payload });
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    playtestWeightedConformanceScore10: artifact.summary.playtestWeightedConformanceScore10,
    computedWeightedScore10: weightedScore,
    evidenceWeightedReferenceScore10: artifact.summary.evidenceWeightedReferenceScore10,
    compellingPreviewTargetScore10: artifact.summary.compellingPreviewTargetScore10,
    weakestCategory: categories.slice().sort((a, b) => a.playtestWeightedScore10 - b.playtestWeightedScore10)[0]?.id || ''
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

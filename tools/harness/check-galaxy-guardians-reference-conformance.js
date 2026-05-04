#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/reference-conformance-0.1.json';
const CANDIDATE = 'reference-artifacts/analyses/galaxy-guardians-identity/candidate-0.1.json';
const REFERENCE_PROFILE = 'reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json';
const PROMOTED_LOG = 'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json';
const PACKAGE_JSON = 'package.json';

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

function scriptName(command){
  const match = String(command || '').match(/^npm run ([\w:.-]+)/);
  return match ? match[1] : '';
}

function main(){
  const artifact = readJson(ARTIFACT);
  const candidate = readJson(CANDIDATE);
  const referenceProfile = readJson(REFERENCE_PROFILE);
  const promotedLog = readJson(PROMOTED_LOG);
  const packageJson = readJson(PACKAGE_JSON);
  const categories = artifact.categories || [];
  const weightTotal = categories.reduce((sum, category) => sum + (+category.weight || 0), 0);
  const weightedScore = weightTotal
    ? rounded(categories.reduce((sum, category) => sum + (+category.weight || 0) * (+category.score10 || 0), 0) / weightTotal)
    : 0;
  const scripts = packageJson.scripts || {};
  const requiredScripts = (artifact.requiredHarnesses || []).map(scriptName).filter(Boolean);
  const promotedTargets = new Set(promotedLog.promoted_targets || []);
  const candidateEvents = new Set(candidate.candidateGate?.requiredRuntimeEvents || []);
  const candidateSurfaces = new Set(candidate.candidateGate?.requiredRuntimeSurfaces || []);
  const runtimePromotedTargets = Array.from(promotedTargets).filter(target => candidateEvents.has(target));
  const requiredInputs = artifact.requiredInputArtifacts || [];
  const hasScoreProgressionArtifact = requiredInputs.includes('reference-artifacts/analyses/galaxy-guardians-identity/score-progression-0.1.json');
  const implementedPromotedTargets = new Set(runtimePromotedTargets);
  if(hasScoreProgressionArtifact) implementedPromotedTargets.add('score_advance_table');
  for(const surface of candidateSurfaces) implementedPromotedTargets.add(surface);
  const missingRuntimePromotions = Array.from(promotedTargets).filter(target => !implementedPromotedTargets.has(target));
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    summary: artifact.summary,
    weightTotal,
    weightedScore,
    sourceCount: referenceProfile.source_count,
    eventCount: promotedLog.event_count,
    promotedTargets: Array.from(promotedTargets),
    runtimePromotedTargets,
    candidateSurfaces: Array.from(candidateSurfaces),
    implementedPromotedTargets: Array.from(implementedPromotedTargets),
    missingRuntimePromotions,
    hasScoreProgressionArtifact,
    requiredScripts
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview' || candidate.gameKey !== artifact.gameKey){
    fail('Guardians reference conformance artifact is not linked to the preview candidate', payload);
  }
  if(artifact.status !== 'dev-preview-reference-conformance-model-not-public-release-score'){
    fail('Guardians reference conformance artifact has the wrong status', payload);
  }
  if(referenceProfile.application_target !== artifact.gameKey || promotedLog.application_target !== artifact.gameKey){
    fail('Galaxian reference artifacts are not linked to Galaxy Guardians', payload);
  }
  if(referenceProfile.source_count < 3 || promotedLog.event_count < 11){
    fail('Guardians reference conformance requires the three-source Galaxian profile and 11 promoted events', payload);
  }
  if(weightTotal !== 100){
    fail('Guardians reference conformance category weights must sum to 100', payload);
  }
  if(Math.abs(weightedScore - artifact.summary.referenceConformanceScore10) > 0.05){
    fail('Guardians reference conformance summary score does not match weighted category scores', payload);
  }
  for(const category of categories){
    if(!category.id || !category.label) fail('Every Guardians reference conformance category needs an id and label', { category, payload });
    if((+category.score10 || 0) < 0 || (+category.score10 || 0) > 10) fail('Guardians category score is outside 0-10', { category, payload });
    if((+category.weight || 0) <= 0) fail('Guardians category weight must be positive', { category, payload });
    if(!category.evidenceLevel || !category.currentRead || !category.remainingGap){
      fail('Every Guardians category must explain evidence, current read, and remaining gap', { category, payload });
    }
  }
  for(const relPath of requiredInputs){
    if(!exists(relPath)) fail(`Required Guardians reference input artifact is missing: ${relPath}`, payload);
  }
  for(const script of requiredScripts){
    if(!scripts[script]) fail(`Required Guardians reference harness script is missing from package.json: ${script}`, payload);
  }
  for(const eventName of [
    'formation_entry_start',
    'formation_entry_settle',
    'formation_rack_complete',
    'alien_dive_start',
    'flagship_dive_start',
    'escort_join',
    'player_shot_fired',
    'player_shot_resolved',
    'enemy_wrap_or_return'
  ]){
    if(!runtimePromotedTargets.includes(eventName)){
      fail(`Guardians reference conformance is missing promoted runtime event coverage: ${eventName}`, payload);
    }
  }
  if(!candidateSurfaces.has('attract_mission_text') || !candidateSurfaces.has('score_advance_table')){
    fail('Guardians reference conformance requires visible attract mission and score-table surfaces', payload);
  }
  if(missingRuntimePromotions.length){
    fail('Guardians reference conformance still has unimplemented promoted targets', payload);
  }
  if(!hasScoreProgressionArtifact){
    fail('Guardians reference conformance must include the score/progression artifact now that the score table is implemented', payload);
  }
  if(artifact.summary.publicReleaseReadinessScore10 >= 5){
    fail('Guardians reference conformance must not imply public-release readiness yet', payload);
  }
  if(artifact.summary.referenceMaturityScore10 >= artifact.summary.implementationGateCoverageScore10){
    fail('Reference maturity should remain lower than implementation gate coverage until frame-level extraction exists', payload);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    referenceConformanceScore10: artifact.summary.referenceConformanceScore10,
    computedWeightedScore10: weightedScore,
    referenceMaturityScore10: artifact.summary.referenceMaturityScore10,
    implementationGateCoverageScore10: artifact.summary.implementationGateCoverageScore10,
    publicReleaseReadinessScore10: artifact.summary.publicReleaseReadinessScore10,
    sourceCount: referenceProfile.source_count,
    promotedEventCount: promotedLog.event_count,
    promotedCoverage: `${implementedPromotedTargets.size}/${promotedTargets.size}`,
    runtimePromotedCoverage: `${runtimePromotedTargets.length}/${promotedTargets.size}`,
    missingRuntimePromotions
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

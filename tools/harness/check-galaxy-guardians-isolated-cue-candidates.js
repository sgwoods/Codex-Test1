#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/audio-isolated-cue-candidates-0.1.json';

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

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Guardians isolated cue candidate artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const families = artifact.familySummary || {};
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    candidateCount: artifact.candidateCount,
    families: Object.fromEntries(Object.entries(families).map(([key, value]) => [key, value.count])),
    sourceReads: artifact.sourceEvidence?.sourceReads || []
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.status !== 'mixed-source-cue-candidates-not-final-isolated-hardware-cues'){
    fail('Guardians isolated cue candidate artifact is not linked to the preview pack', payload);
  }
  if(!exists(artifact.sourceEvidence?.frameReferenceSummary || '')){
    fail('Guardians isolated cue candidate artifact is missing frame-reference lineage', payload);
  }
  if((artifact.sourceEvidence?.sourceReads || []).length < 3){
    fail('Guardians isolated cue candidate pass must cover all three Galaxian sources', payload);
  }
  if((artifact.candidateCount || 0) < 24){
    fail('Guardians isolated cue candidate pass found too few candidates', payload);
  }
  for(const family of ['short-hit-or-enemy-shot', 'dive-or-loss-sweep', 'dive-pressure-mix']){
    if((families[family]?.count || 0) < 2){
      fail(`Guardians isolated cue candidate pass needs more ${family} candidates`, payload);
    }
  }
  const candidates = artifact.candidates || [];
  if(candidates.some(candidate => !candidate.candidateId || !candidate.sourceId || !candidate.windowId || !candidate.family)){
    fail('Every Guardians isolated cue candidate needs stable source/window/family IDs', payload);
  }
  if(candidates.some(candidate => (candidate.durationSeconds || 0) <= 0 || (candidate.peak || 0) <= 0)){
    fail('Every Guardians isolated cue candidate needs non-silent duration and peak metrics', payload);
  }
  if(!artifact.nextPromotion || !String(artifact.nextPromotion).includes('manually label')){
    fail('Guardians isolated cue candidates must preserve the manual-label next promotion warning', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    candidateCount: artifact.candidateCount,
    families: payload.families,
    sourceCount: payload.sourceReads.length
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaga-alien-target-quality-audit/latest.json';
const CONTACT_SHEET = 'reference-artifacts/analyses/galaga-alien-target-quality-audit/latest-contact-sheet.svg';
const REPORT = 'reference-artifacts/analyses/galaga-alien-target-quality-audit/latest.md';
const REQUIRED_ROLES = ['boss-galaga', 'bee-zako', 'butterfly-escort', 'challenge-specialty-aliens'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function main(){
  if(!exists(ARTIFACT)) fail(`Missing Galaga alien target quality audit artifact: ${ARTIFACT}`);
  if(!exists(CONTACT_SHEET)) fail(`Missing Galaga alien target quality contact sheet: ${CONTACT_SHEET}`);
  if(!exists(REPORT)) fail(`Missing Galaga alien target quality report: ${REPORT}`);
  const artifact = readJson(ARTIFACT);
  const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
  if(artifact.artifactType !== 'galaga-alien-target-quality-audit'){
    fail('Galaga alien target quality audit has the wrong artifact type.', { artifactType: artifact.artifactType });
  }
  for(const roleKey of REQUIRED_ROLES){
    const row = rows.find(item => item.roleKey === roleKey);
    if(!row) fail(`Missing target quality role ${roleKey}`, { roles: rows.map(item => item.roleKey) });
    if(!Number.isFinite(+row.qualityScore10) || row.qualityScore10 < 0 || row.qualityScore10 > 10){
      fail(`Target quality row ${roleKey} has invalid quality score.`, row);
    }
    if(!Array.isArray(row.issues)) fail(`Target quality row ${roleKey} is missing issues list.`, row);
    if(!Array.isArray(row.targetCrops) || !row.targetCrops.length) fail(`Target quality row ${roleKey} has no target crop metadata.`, row);
    if(!Array.isArray(row.runtimeVsTarget) || !row.runtimeVsTarget.length) fail(`Target quality row ${roleKey} has no runtime-vs-target evidence.`, row);
  }
  for(const roleKey of ['boss-galaga', 'bee-zako', 'butterfly-escort']){
    const row = rows.find(item => item.roleKey === roleKey);
    if(!row || row.status === 'target-quality-blocked' || +row.bestAuthorityScore10 < 7){
      fail(`Core formation role ${roleKey} should remain usable as a target-quality source, even if caveated.`, row);
    }
  }
  const challenge = rows.find(item => item.roleKey === 'challenge-specialty-aliens');
  if(!challenge || challenge.status !== 'target-quality-blocked' || !challenge.issues.includes('no release-grade target authority')){
    fail('Challenge specialty target quality must remain explicitly blocked until clean challenge-stage windows replace sheet cells.', challenge);
  }
  if(artifact.summary?.challengeSpecialtyBlocked !== true){
    fail('Target quality summary should explicitly mark challenge specialty targets blocked.', artifact.summary);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    contactSheet: CONTACT_SHEET,
    report: REPORT,
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack ? err.stack : String(err));
}

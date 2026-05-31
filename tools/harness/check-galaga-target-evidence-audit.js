#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-evidence-audit', 'latest.json');
const REQUIRED = ['boss-galaga', 'bee-zako', 'butterfly-escort', 'player-fighter', 'challenge-specialty-aliens'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing Galaga target evidence audit artifact.');
  if(!fs.existsSync(path.join(ROOT, 'GALAGA_TARGET_EVIDENCE_AUDIT.md'))) fail('Missing Galaga target evidence audit report.');
  const artifact = readJson(ARTIFACT);
  const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
  if(artifact.artifactType !== 'galaga-target-evidence-audit' || artifact.status !== 'trusted-target-manifest-active'){
    fail('Galaga target evidence audit has the wrong type or status.', { type: artifact.artifactType, status: artifact.status });
  }
  for(const roleKey of REQUIRED){
    const row = rows.find(item => item.roleKey === roleKey);
    if(!row) fail(`Missing audited role ${roleKey}`, { roles: rows.map(item => item.roleKey) });
    if(!Array.isArray(row.linkedCrops) || !row.linkedCrops.length) fail(`Audited role ${roleKey} has no linked target crops.`, row);
    if(!Number.isFinite(+row.averageAuthorityScore10) || +row.averageAuthorityScore10 < 1 || +row.averageAuthorityScore10 > 10){
      fail(`Audited role ${roleKey} is missing average authority metadata.`, row);
    }
  }
  for(const roleKey of ['boss-galaga', 'bee-zako', 'butterfly-escort']){
    const row = rows.find(item => item.roleKey === roleKey);
    if(!row || row.status !== 'trusted-primary-target-available' || (row.trustedCropCount || 0) < 1){
      fail(`Audited role ${roleKey} does not have a trusted primary target.`, row);
    }
  }
  const challenge = rows.find(item => item.roleKey === 'challenge-specialty-aliens');
  if(!challenge || challenge.status !== 'provisional-target-only' || +challenge.averageAuthorityScore10 > 4){
    fail('Challenge specialty aliens must remain explicitly provisional until better reference windows are ingested.', challenge);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    rows: rows.length,
    trustedPrimaryRoleCount: artifact.summary?.trustedPrimaryRoleCount
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

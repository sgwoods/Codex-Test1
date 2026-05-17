#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-artifact-coverage', 'latest.json');

const REQUIRED_SOURCES = [
  'bandai-namco-official-galaga-history',
  'galaga-1981-namco-manual',
  'snake-latino-galaga-gameplay-video',
  'gamesdatabase-galaga-screens-and-rules',
  'arcade-game-series-late-perfect-guides',
  'controlled-emulation-capture',
  'galaga-reference-sprite-models',
  'galaga-reference-audio-cues'
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
  fail('Galaga target artifact coverage report is missing; run npm run harness:analyze:galaga-target-artifact-coverage first', { report: REPORT });
}

const report = readJson(REPORT);
if(report.artifactType !== 'galaga-target-artifact-coverage'){
  fail('unexpected artifact type', { artifactType: report.artifactType });
}

const rows = Array.isArray(report.rows) ? report.rows : [];
for(const id of REQUIRED_SOURCES){
  const row = rows.find(item => item.id === id);
  if(!row) fail(`missing required target artifact source ${id}`, { ids: rows.map(item => item.id) });
  if(!row.targetUse || !row.missingWork || !Array.isArray(row.coverageAxes) || !row.coverageAxes.length){
    fail(`target artifact source ${id} is missing required explanatory fields`, row);
  }
  if((row.ingestionStatus === 'ingested' || row.ingestionStatus === 'partial') && row.evidenceExistingCount < 1){
    fail(`target artifact source ${id} claims ${row.ingestionStatus} but has no existing evidence`, row);
  }
}

const challengeRows = Array.isArray(report.challengeStageCoverage) ? report.challengeStageCoverage : [];
for(const challengeNumber of [1, 2, 3, 4, 5, 6, 7, 8]){
  const row = challengeRows.find(item => +item.challengeNumber === challengeNumber);
  if(!row) fail(`missing challenge-stage priority target ${challengeNumber}`, { challengeRows });
  if(!row.nextNeed){
    fail(`challenge-stage priority target ${challengeNumber} is missing nextNeed`, row);
  }
}

const lateMissing = challengeRows.filter(row => +row.challengeNumber >= 4 && row.status === 'not-ingested');
const latePartial = challengeRows.filter(row => +row.challengeNumber >= 4 && row.status === 'partially-ingested');
if(lateMissing.length > 0 && lateMissing.length < 3){
  fail('late challenge-stage gap is inconsistent: either keep missing late windows explicit or promote enough media-backed evidence to partial', { lateMissing });
}
if(lateMissing.length === 0 && latePartial.length < 5){
  fail('late challenge-stage windows are marked non-missing but are not all represented as partially ingested media-backed targets', { latePartial });
}
if(lateMissing.length === 0 && !String(report.summary?.interpretation || '').includes('five-group frame labels')){
  fail('late challenge acquisition is no longer the bottleneck, but the report does not name five-group frame labels as the next gap', report.summary);
}

if(!Number.isFinite(+report.summary?.coverageScore10) || +report.summary.coverageScore10 <= 0 || +report.summary.coverageScore10 > 10){
  fail('coverage summary score is invalid', report.summary);
}
if(!Number.isFinite(+report.summary?.challengeStageReadiness10) || +report.summary.challengeStageReadiness10 <= 0 || +report.summary.challengeStageReadiness10 > 10){
  fail('challenge-stage readiness score is invalid', report.summary);
}
if(!Array.isArray(report.nextBestSteps) || report.nextBestSteps.length < 5){
  fail('target artifact report is missing next-best steps', report);
}

console.log(JSON.stringify({
  ok: true,
  coverageScore10: report.summary.coverageScore10,
  challengeStageReadiness10: report.summary.challengeStageReadiness10,
  criticalOpenCount: report.summary.criticalOpenCount,
  lateChallengeGapCount: report.summary.lateChallengeGapCount,
  sourceCount: rows.length
}, null, 2));

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-video-reference', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function existsRel(relativePath){
  return fs.existsSync(path.join(ROOT, relativePath));
}

if(!fs.existsSync(REPORT)){
  fail('Galaga challenge video reference report missing; run npm run harness:analyze:galaga-challenge-video-reference first', { report: REPORT });
}

const report = readJson(REPORT);
if(report.artifactType !== 'galaga-challenge-video-reference-analysis'){
  fail('unexpected artifact type', { artifactType: report.artifactType });
}

const windows = Array.isArray(report.primaryWindows) ? report.primaryWindows : [];
for(const challengeNumber of [1, 2, 3, 4, 5, 6, 7, 8]){
  const row = windows.find(item => +item.challengeNumber === challengeNumber);
  if(!row) fail(`missing challenge window ${challengeNumber}`, { windows });
  for(const field of ['contactSheet', 'denseContactSheet', 'focusedSheet', 'frameIndex']){
    if(!row[field] || !existsRel(row[field])){
      fail(`challenge window ${challengeNumber} is missing derived ${field}`, row);
    }
  }
  if(!row.auroraContract || !row.motionRead || !row.family){
    fail(`challenge window ${challengeNumber} is missing human-readable conformance interpretation`, row);
  }
}

const lateWindows = windows.filter(row => +row.challengeNumber >= 4 && +row.challengeNumber <= 8);
if(lateWindows.length < 5){
  fail('late challenge windows are incomplete', { lateWindows });
}

if(+report.summary?.challengeStageReadiness10 < 4){
  fail('challenge-stage readiness did not improve enough to justify this artifact', report.summary);
}

if(!Array.isArray(report.stageImprovementPlan) || report.stageImprovementPlan.length < 8){
  fail('stage improvement plan missing challenge-by-challenge rows', report.stageImprovementPlan);
}

console.log(JSON.stringify({
  ok: true,
  challengeWindowCount: windows.length,
  mediaBackedLateChallengeCount: report.summary.mediaBackedLateChallengeCount,
  challengeStageReadiness10: report.summary.challengeStageReadiness10,
  status: report.summary.status
}, null, 2));

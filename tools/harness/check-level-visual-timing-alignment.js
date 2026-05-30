#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'level-visual-timing-alignment', 'latest.json');

function fail(message, details = {}){
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

if(!fs.existsSync(REPORT)){
  fail('Missing level visual timing alignment artifact.', { expected: rel(REPORT) });
}

let report;
try {
  report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
} catch (err) {
  fail('Could not parse level visual timing alignment artifact.', { error: String(err?.message || err) });
}

if(report.artifactType !== 'level-visual-timing-alignment'){
  fail('Unexpected timing alignment artifact type.', { artifactType: report.artifactType });
}

const rows = Array.isArray(report.rows) ? report.rows : [];
if(rows.length < 1) fail('Timing alignment artifact has no rows.');

const failures = Array.isArray(report.failures) ? report.failures : [];
if(failures.length){
  fail('Timing alignment artifact contains failed challenge captures.', {
    failedChallengeNumbers: failures.map(row => row.challengeNumber),
    failures
  });
}

const requestedChallengeNumbers = Array.isArray(report.summary?.requestedChallengeNumbers)
  ? report.summary.requestedChallengeNumbers.map(Number).filter(Number.isFinite)
  : [];
const completedChallengeNumbers = Array.isArray(report.summary?.completedChallengeNumbers)
  ? report.summary.completedChallengeNumbers.map(Number).filter(Number.isFinite)
  : rows.map(row => +row.challengeNumber).filter(Number.isFinite);
if(requestedChallengeNumbers.length && completedChallengeNumbers.length !== requestedChallengeNumbers.length){
  fail('Timing alignment artifact completed challenge count does not match requested count.', {
    requestedChallengeNumbers,
    completedChallengeNumbers
  });
}

for(const row of rows){
  if(!Number.isFinite(+row.challengeNumber)) fail('Timing row missing challenge number.', { row });
  if(!row.pairedVideo) fail('Timing row missing paired target/current video.', { challengeNumber: row.challengeNumber });
  if(!fs.existsSync(path.join(ROOT, row.pairedVideo))) fail('Timing paired video does not exist.', { challengeNumber: row.challengeNumber, pairedVideo: row.pairedVideo });
  if(!row.contactSheet) fail('Timing row missing contact sheet.', { challengeNumber: row.challengeNumber });
  if(!fs.existsSync(path.join(ROOT, row.contactSheet))) fail('Timing contact sheet does not exist.', { challengeNumber: row.challengeNumber, contactSheet: row.contactSheet });
  if(!row.targetVideo || !fs.existsSync(path.join(ROOT, row.targetVideo))) fail('Timing row missing target video.', { challengeNumber: row.challengeNumber, targetVideo: row.targetVideo });
  if(!row.currentVideo || !fs.existsSync(path.join(ROOT, row.currentVideo))) fail('Timing row missing current video.', { challengeNumber: row.challengeNumber, currentVideo: row.currentVideo });
  if(!Array.isArray(row.currentTimelineSamples) || row.currentTimelineSamples.length < 3){
    fail('Timing row needs sampled current timeline data.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentLastVisibleEnemySecond)){
    fail('Timing row missing last visible challenge enemy timing.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentVisibleMotionEndDriftSeconds)){
    fail('Timing row missing visible-motion end drift.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.targetLastVisibleEnemySecond)){
    fail('Timing row missing target last-visible enemy timing.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentVsTargetVisibleMotionEndDriftSeconds)){
    fail('Timing row missing current-vs-target visible-motion end drift.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentLastChallengeEnemySecond)){
    fail('Timing row missing last challenge enemy presence timing.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentChallengeEnemyEndDriftSeconds)){
    fail('Timing row missing challenge enemy-presence end drift.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentResultCeremonyHoldSeconds)){
    fail('Timing row missing result ceremony hold measurement.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.targetResultCeremonyHoldSeconds)){
    fail('Timing row missing target result ceremony hold measurement.', { challengeNumber: row.challengeNumber });
  }
  if(!Number.isFinite(+row.currentResultCeremonyHoldDriftSeconds)){
    fail('Timing row missing result ceremony hold drift measurement.', { challengeNumber: row.challengeNumber });
  }
}

console.log(JSON.stringify({
  ok: true,
  rows: rows.length,
  requestedChallengeNumbers,
  completedChallengeNumbers,
  pairedVideoCount: rows.filter(row => row.pairedVideo).length,
  averageAbsEndDriftSeconds: report.summary?.averageAbsEndDriftSeconds ?? null,
  averageAbsVisibleMotionEndDriftSeconds: report.summary?.averageAbsVisibleMotionEndDriftSeconds ?? null,
  averageAbsTargetVisibleMotionEndDriftSeconds: report.summary?.averageAbsTargetVisibleMotionEndDriftSeconds ?? null,
  averageAbsChallengeEnemyEndDriftSeconds: report.summary?.averageAbsChallengeEnemyEndDriftSeconds ?? null,
  averageResultCeremonyHoldSeconds: report.summary?.averageResultCeremonyHoldSeconds ?? null,
  averageAbsResultCeremonyHoldDriftSeconds: report.summary?.averageAbsResultCeremonyHoldDriftSeconds ?? null,
  report: rel(REPORT)
}, null, 2));

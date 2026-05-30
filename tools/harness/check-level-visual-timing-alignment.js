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
}

console.log(JSON.stringify({
  ok: true,
  rows: rows.length,
  pairedVideoCount: rows.filter(row => row.pairedVideo).length,
  averageAbsEndDriftSeconds: report.summary?.averageAbsEndDriftSeconds ?? null,
  report: rel(REPORT)
}, null, 2));

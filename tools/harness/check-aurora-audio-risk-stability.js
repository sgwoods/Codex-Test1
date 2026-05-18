#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-risk-stability', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if(!fs.existsSync(REPORT)) fail('Audio risk stability report is missing. Run npm run harness:analyze:aurora-audio-risk-stability.');

const report = readJson(REPORT);
if(report.artifactType !== 'aurora-audio-risk-stability') fail('Unexpected audio risk stability artifact type.', { artifactType: report.artifactType });
if((report.summary?.reportCount || 0) < 2) fail('Audio risk stability needs at least two event-gap reports.', report.summary);
if(!Array.isArray(report.cues) || report.cues.length < 8) fail('Audio risk stability did not analyze enough cue rows.', report.summary);

const requiredCues = ['challengePerfect', 'gameOver', 'challengeTransition', 'rescueJoin'];
const missing = requiredCues.filter(cue => !(report.cues || []).some(row => row.cue === cue));
if(missing.length) fail('Audio risk stability is missing required high-value cues.', { missing });

const badRows = (report.cues || []).filter(row => !Number.isFinite(+row.medianGapRisk10) || !Number.isFinite(+row.stabilityScore10));
if(badRows.length) fail('Audio risk stability has rows without median/stability scores.', { badRows: badRows.slice(0, 5) });

console.log(JSON.stringify({
  ok: true,
  report: path.relative(ROOT, REPORT).split(path.sep).join('/'),
  summary: report.summary,
  recommendation: report.recommendation
}, null, 2));

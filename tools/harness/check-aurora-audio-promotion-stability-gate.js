#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-promotion-stability-gate', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if(!fs.existsSync(REPORT)) fail('Audio promotion stability gate is missing. Run npm run harness:analyze:aurora-audio-promotion-stability-gate.');

const report = readJson(REPORT);
if(report.artifactType !== 'aurora-audio-promotion-stability-gate') fail('Unexpected audio promotion stability artifact.', { artifactType: report.artifactType });
if(!Array.isArray(report.cues) || report.cues.length < 3) fail('Promotion stability gate did not evaluate enough cues.', report.summary);

const required = ['challengePerfect', 'gameOver', 'challengeTransition'];
const missing = required.filter(cue => !report.cues.some(row => row.cue === cue));
if(missing.length) fail('Promotion stability gate is missing required cues.', { missing });

const badRows = report.cues.filter(row =>
  !row.status
  || !row.noiseFloor
  || !Array.isArray(row.blockers)
  || !Number.isFinite(+row.noiseFloor.requiredCueGapWin10)
);
if(badRows.length) fail('Promotion stability gate has incomplete rows.', { badRows: badRows.slice(0, 5) });

const accidentalPromotion = report.cues.filter(row => row.promoteRuntime === true);
if(accidentalPromotion.length) fail('Promotion stability gate must not directly promote runtime audio.', { accidentalPromotion });

console.log(JSON.stringify({
  ok: true,
  report: path.relative(ROOT, REPORT).split(path.sep).join('/'),
  summary: report.summary,
  nextStep: report.nextStep
}, null, 2));

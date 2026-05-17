#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-strategy-review', 'latest.json');
const DOC = path.join(ROOT, 'AUDIO_CONFORMANCE_STRATEGY_REVIEW.md');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if(!fs.existsSync(REPORT)) fail('Audio strategy review report is missing. Run npm run harness:analyze:aurora-audio-strategy-review.');
if(!fs.existsSync(DOC)) fail('Audio strategy review markdown is missing.');

const report = readJson(REPORT);
if(report.artifactType !== 'aurora-audio-strategy-review') fail('Unexpected audio strategy review artifact.', { artifactType: report.artifactType });
if((report.diagnosis || []).length < 5) fail('Audio strategy review needs at least five diagnosis rows.', report);
if((report.revisedStrategy || []).length < 5) fail('Audio strategy review needs at least five revised strategy rows.', report);
if(!/reference-vs-reference/i.test(report.nextExperiment || '')) fail('Audio strategy review must recommend the next calibration experiment.', { nextExperiment: report.nextExperiment });

const markdown = fs.readFileSync(DOC, 'utf8');
if(!markdown.includes('Why Accurate References Are Not Enough')) fail('Audio strategy review markdown is missing the core explanation section.');

console.log(JSON.stringify({
  ok: true,
  report: path.relative(ROOT, REPORT).split(path.sep).join('/'),
  markdown: path.relative(ROOT, DOC).split(path.sep).join('/'),
  nextExperiment: report.nextExperiment
}, null, 2));

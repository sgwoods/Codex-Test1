#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'conformance-investment-retrospective', 'latest.json');
const DOC = path.join(ROOT, 'CONFORMANCE_INVESTMENT_RETROSPECTIVE.md');

function fail(message, details = {}){
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if(!fs.existsSync(REPORT)){
  fail('missing conformance investment retrospective; run npm run harness:analyze:conformance-investment-retrospective first', { report: REPORT });
}
if(!fs.existsSync(DOC)){
  fail('missing top-level retrospective document', { doc: DOC });
}

const report = readJson(REPORT);
if(report.artifactType !== 'conformance-investment-retrospective'){
  fail('unexpected retrospective artifact type', { artifactType: report.artifactType });
}
if(!/human-level Galaga conformance/i.test(report.executiveRead || '')){
  fail('retrospective executive read must explicitly discuss human-level conformance', { executiveRead: report.executiveRead });
}

const movements = Array.isArray(report.metricMovements) ? report.metricMovements : [];
const required = [
  'challenge-set-piece',
  'challenge-movement',
  'challenge-graphics',
  'challenge-alien-novelty',
  'challenge-progression',
  'audio-runtime-promotion'
];
const ids = new Set(movements.map(item => item.id));
for(const id of required){
  if(!ids.has(id)) fail(`retrospective is missing required metric movement ${id}`, { ids: [...ids] });
}

const movement = movements.find(item => item.id === 'challenge-movement');
const novelty = movements.find(item => item.id === 'challenge-alien-novelty');
const progression = movements.find(item => item.id === 'challenge-progression');
if(+movement.currentScore10 > 5 || +novelty.currentScore10 > 5 || +progression.currentScore10 > 5){
  fail('retrospective should keep the critical challenge-stage gaps visible rather than over-crediting them', { movement, novelty, progression });
}

if(!Array.isArray(report.failurePatterns) || report.failurePatterns.length < 4){
  fail('retrospective must include multiple failure-pattern diagnoses', { failurePatterns: report.failurePatterns });
}
if(!String(report.resourceRead?.accountingDebt || '').match(/undercounts|lower bound|not fully represented/i)){
  fail('retrospective must explain compute/accounting debt', { resourceRead: report.resourceRead });
}
if(!Array.isArray(report.deepLinks) || !report.deepLinks.some(link => /#cost/.test(link.href || ''))){
  fail('retrospective must expose a Cost / Value dashboard deep link', { deepLinks: report.deepLinks });
}

const doc = fs.readFileSync(DOC, 'utf8');
for(const text of [
  'Metric Movement',
  'Where We Are Consistently Failing',
  'Resource Accounting Read',
  'largest-human-conformance-gaps.svg',
  'Local Cost / Value dashboard'
]){
  if(!doc.includes(text)) fail('retrospective document is missing expected public-review text', { text });
}

console.log(JSON.stringify({
  ok: true,
  metricMovements: movements.length,
  challengeMovement: movement.currentScore10,
  challengeNovelty: novelty.currentScore10,
  doc: path.relative(ROOT, DOC)
}, null, 2));

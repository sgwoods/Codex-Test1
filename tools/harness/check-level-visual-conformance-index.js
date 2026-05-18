#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'level-visual-conformance-index', 'latest.json');
const MARKDOWN = path.join(ROOT, 'LEVEL_VISUAL_CONFORMANCE_INDEX.md');
const EXPECTED_REGULAR = 31;
const EXPECTED_CHALLENGES = 8;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

if(!fs.existsSync(REPORT)) fail('level visual conformance index missing; run npm run harness:analyze:level-visual-conformance-index');

let report;
try {
  report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
} catch (err) {
  fail('level visual conformance index is not valid JSON', { error: err.message });
}

const rows = Array.isArray(report.rows) ? report.rows : [];
if(report.artifactType !== 'level-visual-conformance-index') fail('unexpected artifact type', { artifactType: report.artifactType });
if(rows.length !== EXPECTED_REGULAR + EXPECTED_CHALLENGES) fail('unexpected row count', { rows: rows.length });

const regularRows = rows.filter(row => row.kind === 'regular');
const challengeRows = rows.filter(row => row.kind === 'challenge');
if(regularRows.length !== EXPECTED_REGULAR) fail('unexpected regular row count', { regularRows: regularRows.length });
if(challengeRows.length !== EXPECTED_CHALLENGES) fail('unexpected challenge row count', { challengeRows: challengeRows.length });

for(const level of Array.from({ length: EXPECTED_REGULAR }, (_, index) => index + 1)){
  if(!regularRows.find(row => +row.displayLevel === level)) fail('missing regular level row', { level });
}
for(const challengeNumber of Array.from({ length: EXPECTED_CHALLENGES }, (_, index) => index + 1)){
  if(!challengeRows.find(row => +row.challengeNumber === challengeNumber)) fail('missing challenge stage row', { challengeNumber });
}

const missingScreenshots = rows.filter(row => !exists(row.currentScreenshot) || !exists(row.targetScreenshot));
if(missingScreenshots.length) fail('rows are missing current or target screenshots', missingScreenshots.map(row => ({
  id: row.id,
  currentScreenshot: row.currentScreenshot,
  targetScreenshot: row.targetScreenshot
})));

const missingRoles = rows.filter(row => !Array.isArray(row.roles) || !row.roles.length || row.roles.some(role => !exists(role.current) || !exists(role.target)));
if(missingRoles.length) fail('rows are missing current/target role bitmap evidence', missingRoles.map(row => row.id));

const exactChallengeTargets = challengeRows.filter(row => row.targetWindow?.exact && row.targetScreenshotStatus === 'extracted-target-frame');
if(exactChallengeTargets.length !== EXPECTED_CHALLENGES){
  fail('challenge rows must have exact extracted target frames', exactChallengeTargets.map(row => row.id));
}

const representativeRegular = regularRows.filter(row => !row.targetWindow?.exact);
if(!representativeRegular.length){
  fail('expected regular target debt to be explicitly represented; all rows are marked exact unexpectedly');
}

if(!fs.existsSync(MARKDOWN)) fail('top-level markdown report missing', { markdown: 'LEVEL_VISUAL_CONFORMANCE_INDEX.md' });
const md = fs.readFileSync(MARKDOWN, 'utf8');
for(const required of ['Level Visual Conformance Index', 'Challenging Stage 1', 'Aurora current', 'Galaga target', 'Critical gap']){
  if(!md.includes(required)) fail('markdown report missing required text', { required });
}

console.log(JSON.stringify({
  ok: true,
  rows: rows.length,
  regularRows: regularRows.length,
  challengeRows: challengeRows.length,
  representativeRegularRows: representativeRegular.length,
  exactChallengeTargets: exactChallengeTargets.length
}, null, 2));

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const REQUIRED_STAGES = [3, 7, 11, 15, 19];
const EXPECTED_REFERENCE_HITS = new Map([
  [3, 'challenge-1-arrival-group-1'],
  [7, 'challenge-2-arrival-group-1'],
  [11, 'challenge-3-arrival-group-1'],
  [15, 'challenge-3-arrival-group-1']
]);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

if(!fs.existsSync(REPORT)){
  fail('challenge-stage conformance artifact is missing; run npm run harness:analyze:challenge-stage-conformance first', { report: REPORT });
}

const report = readJson(REPORT);
if(report.artifactType !== 'challenge-stage-conformance'){
  fail('unexpected challenge-stage conformance artifact type', { artifactType: report.artifactType });
}

const rows = Array.isArray(report.stageRows) ? report.stageRows : [];
for(const stage of REQUIRED_STAGES){
  const row = rows.find(item => +item.stage === stage);
  if(!row) fail(`missing challenge-stage conformance row for stage ${stage}`, { rows: rows.map(item => item.stage) });
  if(!Number.isFinite(+row.interestingFactor10) || +row.interestingFactor10 < 1 || +row.interestingFactor10 > 10){
    fail(`stage ${stage} interesting factor is invalid`, row);
  }
  if(!Number.isFinite(+row.conformanceScore10) || +row.conformanceScore10 < 0 || +row.conformanceScore10 > 10){
    fail(`stage ${stage} conformance score is invalid`, row);
  }
  if(!row.currentRead || !row.graphicsRead || !row.movementRead || !row.alienVariationRead){
    fail(`stage ${stage} is missing critical narrative fields`, row);
  }
  if(!Array.isArray(row.criticalGaps)){
    fail(`stage ${stage} is missing critical gaps`, row);
  }
  if(!row.criticalGaps.length && !row.expectedReferenceHit){
    fail(`stage ${stage} has no critical gaps without an expected reference hit`, row);
  }
  if(!Array.isArray(row.nextActions) || !row.nextActions.length){
    fail(`stage ${stage} is missing next actions`, row);
  }
  if(!row.safetyProbe){
    fail(`stage ${stage} is missing the challenge safety probe`, row);
  }
  const expectedReference = EXPECTED_REFERENCE_HITS.get(stage);
  if(expectedReference){
    if(!row.expectedReferenceHit){
      fail(`stage ${stage} no longer hits its expected challenge reference`, { expectedReference, row });
    }
    if(row.bestReferenceMatch?.labelId !== expectedReference){
      fail(`stage ${stage} best challenge reference drifted`, { expectedReference, bestReferenceMatch: row.bestReferenceMatch, row });
    }
  }
}

if(!Number.isFinite(+report.summary?.interestingFactorScore10) || +report.summary.interestingFactorScore10 < 1){
  fail('summary interesting factor is invalid', report.summary);
}

console.log(JSON.stringify({
  ok: true,
  score10: report.summary.score10,
  interestingFactorScore10: report.summary.interestingFactorScore10,
  rows: rows.length
}, null, 2));

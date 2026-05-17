#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const REQUIRED_STAGES = [3, 7, 11, 15, 19, 23, 27, 31];
const REQUIRED_REFERENCE_HITS = new Map([
  [3, ['challenge-1-arrival-group-1', 'challenge-1-late-wave-group-4']]
]);
const TRACKED_REFERENCE_TARGETS = new Map([
  [7, 'challenge-2-arrival-group-1'],
  [11, 'challenge-3-arrival-group-1'],
  [15, 'challenge-4-pink-serpentine-group-1'],
  [19, 'challenge-5-pink-green-cascade-group-1'],
  [23, 'challenge-6-green-ladder-split-group-1'],
  [27, 'challenge-7-yellow-diagonal-fan-group-1'],
  [31, 'challenge-8-blue-purple-finale-group-1']
]);
const STRICT_SCORE_FIELDS = [
  'interestingFactor10',
  'conformanceScore10',
  'movementConformanceScore10',
  'graphicalConformanceScore10',
  'alienNoveltyScore10',
  'progressionConformanceScore10',
  'safetyRuleScore10'
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
  fail('challenge-stage conformance artifact is missing; run npm run harness:analyze:challenge-stage-conformance first', { report: REPORT });
}

const report = readJson(REPORT);
if(report.artifactType !== 'challenge-stage-conformance'){
  fail('unexpected challenge-stage conformance artifact type', { artifactType: report.artifactType });
}

const rows = Array.isArray(report.stageRows) ? report.stageRows : [];
const warnings = [];
for(const stage of REQUIRED_STAGES){
  const row = rows.find(item => +item.stage === stage);
  if(!row) fail(`missing challenge-stage conformance row for stage ${stage}`, { rows: rows.map(item => item.stage) });
  for(const field of STRICT_SCORE_FIELDS){
    if(!Number.isFinite(+row[field]) || +row[field] < 1 || +row[field] > 10){
      fail(`stage ${stage} strict score field ${field} is invalid`, row);
    }
  }
  if(!row.currentRead || !row.graphicsRead || !row.movementRead || !row.alienVariationRead){
    fail(`stage ${stage} is missing critical narrative fields`, row);
  }
  if(!row.strictAxisReads?.movement?.read || !row.strictAxisReads?.graphics?.read || !row.strictAxisReads?.alienNovelty?.read){
    fail(`stage ${stage} is missing strict axis reads`, row);
  }
  if(!Number.isFinite(+row.groupIdentityScore10) || !row.groupIdentityRead){
    fail(`stage ${stage} is missing measured challenge group identity`, row);
  }
  if(!Array.isArray(row.criticalGaps)){
    fail(`stage ${stage} is missing critical gaps`, row);
  }
  if(!row.criticalGaps.length){
    fail(`stage ${stage} has no critical gaps; strict scoring should keep the remaining movement/graphics/novelty gap explicit`, row);
  }
  if(!Array.isArray(row.nextActions) || !row.nextActions.length){
    fail(`stage ${stage} is missing next actions`, row);
  }
  if(!row.safetyProbe){
    fail(`stage ${stage} is missing the challenge safety probe`, row);
  }
  const expectedReference = REQUIRED_REFERENCE_HITS.get(stage);
  if(expectedReference){
    const expectedReferences = Array.isArray(expectedReference) ? expectedReference : [expectedReference];
    if(!row.expectedReferenceHit){
      fail(`stage ${stage} no longer hits its expected challenge reference`, { expectedReference: expectedReferences, row });
    }
    if(!expectedReferences.includes(row.bestReferenceMatch?.labelId)){
      fail(`stage ${stage} best challenge reference drifted`, { expectedReference: expectedReferences, bestReferenceMatch: row.bestReferenceMatch, row });
    }
  }
  const trackedReference = TRACKED_REFERENCE_TARGETS.get(stage);
  if(trackedReference && row.bestReferenceMatch?.labelId !== trackedReference){
    if(!row.criticalGaps.some(gap => String(gap).includes(trackedReference) || String(gap).includes('Best reference match'))){
      fail(`stage ${stage} reference miss is not represented as a critical gap`, { trackedReference, row });
    }
    warnings.push({
      stage,
      trackedReference,
      bestReferenceMatch: row.bestReferenceMatch?.labelId || null,
      message: 'tracked conformance gap; not a release-blocking harness failure at current scorer resolution'
    });
  }
}

if(report.summary?.scoringModel !== 'strict-v2-user-baseline'){
  fail('challenge-stage conformance is not using the strict scorer baseline', report.summary);
}
if(!report.targetArtifactCoverage?.summary || !Number.isFinite(+report.targetArtifactCoverage.summary.challengeStageReadiness10)){
  fail('challenge-stage conformance is missing Galaga target-artifact coverage context; run npm run harness:analyze:galaga-target-artifact-coverage first', report.targetArtifactCoverage);
}
if(!Array.isArray(report.targetArtifactCoverage.challengeStageCoverage) || report.targetArtifactCoverage.challengeStageCoverage.length < 8){
  fail('challenge-stage conformance is missing complete challenge target coverage rows', report.targetArtifactCoverage);
}
for(const field of [
  'score10',
  'interestingFactorScore10',
  'movementConformanceScore10',
  'graphicalConformanceScore10',
  'alienNoveltyScore10',
  'progressionConformanceScore10',
  'safetyRuleScore10'
]){
  if(!Number.isFinite(+report.summary?.[field]) || +report.summary[field] < 1 || +report.summary[field] > 10){
    fail(`summary strict score field ${field} is invalid`, report.summary);
  }
}
if(!Number.isFinite(+report.summary?.interestingFactorScore10) || +report.summary.interestingFactorScore10 < 1){
  fail('summary interesting factor is invalid', report.summary);
}

console.log(JSON.stringify({
  ok: true,
  score10: report.summary.score10,
  interestingFactorScore10: report.summary.interestingFactorScore10,
  movementConformanceScore10: report.summary.movementConformanceScore10,
  graphicalConformanceScore10: report.summary.graphicalConformanceScore10,
  alienNoveltyScore10: report.summary.alienNoveltyScore10,
  rows: rows.length,
  warnings
}, null, 2));

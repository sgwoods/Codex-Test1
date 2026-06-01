#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
const REQUIRED_CHALLENGES = [1, 2, 3, 4, 5, 6, 7, 8];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

if(!fs.existsSync(REPORT)){
  fail('Galaga challenge object-track artifact is missing; run npm run harness:analyze:galaga-challenge-object-tracks first.', { report: rel(REPORT) });
}

const report = readJson(REPORT);
if(report.artifactType !== 'galaga-challenge-object-tracks'){
  fail('Unexpected Galaga challenge object-track artifact type.', { artifactType: report.artifactType });
}

const challenges = Array.isArray(report.challenges) ? report.challenges : [];
for(const challengeNumber of REQUIRED_CHALLENGES){
  const row = challenges.find(item => +item.challengeNumber === challengeNumber);
  if(!row) fail(`Missing Galaga object-track row for challenge ${challengeNumber}.`, { challenges: challenges.map(item => item.challengeNumber) });
  if(!row.sourceVideo && !row.sourceWindow){
    fail(`Challenge ${challengeNumber} source video reference is missing.`, row);
  }
  if(!Number.isFinite(+row.trackRead?.trackCount) || +row.trackRead.trackCount < 6){
    fail(`Challenge ${challengeNumber} has too few target object tracks for useful comparison.`, row.trackRead);
  }
  if(!Number.isFinite(+row.trackRead?.groupCount) || +row.trackRead.groupCount < 3){
    fail(`Challenge ${challengeNumber} has too few grouped target waves.`, row.trackRead);
  }
  if(!Array.isArray(row.targetGroups) || row.targetGroups.length < 3){
    fail(`Challenge ${challengeNumber} is missing target group vectors.`, row);
  }
  for(const group of row.targetGroups){
    const target = group.objectTrackTarget || {};
    for(const field of ['visibleStartS', 'visibleEndS', 'xRange', 'yRange', 'pathLength', 'turnCount', 'lowerFieldShare', 'centerSampleCount', 'individualTrackPathLengthMean']){
      if(!Number.isFinite(+target[field])){
        fail(`Challenge ${challengeNumber} group ${group.groupIndex} target field ${field} is invalid.`, group);
      }
    }
    if(target.pathLengthMode !== 'group-envelope-centerline'){
      fail(`Challenge ${challengeNumber} group ${group.groupIndex} target path length is not a group-envelope centerline measurement.`, group);
    }
    if(+target.visibleEndS <= +target.visibleStartS){
      fail(`Challenge ${challengeNumber} group ${group.groupIndex} target timing is invalid.`, group);
    }
    if(+target.centerSampleCount < 3){
      fail(`Challenge ${challengeNumber} group ${group.groupIndex} has too few centerline samples for object-track comparison.`, group);
    }
    if(!Number.isFinite(+group.confidence) || +group.confidence < .3){
      fail(`Challenge ${challengeNumber} group ${group.groupIndex} confidence is too low.`, group);
    }
  }
  for(const evidenceField of ['overlaySvg', 'contactSheetSvg', 'perChallengeJson']){
    const evidencePath = row.evidence?.[evidenceField];
    if(!evidencePath || !fs.existsSync(path.join(ROOT, evidencePath))){
      fail(`Challenge ${challengeNumber} evidence file ${evidenceField} is missing.`, row.evidence);
    }
  }
}

for(const field of ['challengeCount', 'trackedChallengeCount', 'averageTrackCount', 'averageGroupCount', 'averageGroupConfidence', 'targetTrackReadinessScore10']){
  if(!Number.isFinite(+report.summary?.[field])){
    fail(`Summary field ${field} is invalid.`, report.summary);
  }
}
if(+report.summary.targetTrackReadinessScore10 < 6.5){
  fail('Target object-track readiness is too low for strict challenge scoring.', report.summary);
}

console.log(JSON.stringify({
  ok: true,
  artifact: rel(REPORT),
  challengeCount: challenges.length,
  averageTrackCount: report.summary.averageTrackCount,
  averageGroupCount: report.summary.averageGroupCount,
  targetTrackReadinessScore10: report.summary.targetTrackReadinessScore10
}, null, 2));

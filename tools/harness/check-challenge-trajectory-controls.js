#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-trajectory-controls', 'latest.json');
const REQUIRED_STAGES = [3, 7, 11, 15, 19, 23, 27, 31];

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
  fail('Challenge trajectory controls artifact is missing; run npm run harness:analyze:challenge-trajectory-controls first.', { report: rel(REPORT) });
}

const report = readJson(REPORT);
if(report.artifactType !== 'challenge-trajectory-controls'){
  fail('Unexpected challenge trajectory controls artifact type.', { artifactType: report.artifactType });
}

const challenges = Array.isArray(report.challenges) ? report.challenges : [];
for(const stage of REQUIRED_STAGES){
  const row = challenges.find(item => +item.stage === stage);
  if(!row) fail(`Missing trajectory controls for challenge stage ${stage}.`, { stages: challenges.map(item => item.stage) });
  if(!Array.isArray(row.groups) || row.groups.length < 3){
    fail(`Challenge stage ${stage} has too few group controls.`, row);
  }
  const seed = row.runtimeLayoutSeed || {};
  for(const field of ['groupSpawnOffsets', 'groupSpeedScales', 'groupSoftSpeedScales', 'groupArcAmps', 'groupDropAmps', 'groupLowerFieldBiases', 'groupYOffsets', 'groupPathFamilies']){
    if(!Array.isArray(seed[field]) || seed[field].length !== row.groups.length){
      fail(`Challenge stage ${stage} runtime seed field ${field} is invalid.`, seed);
    }
  }
  for(const group of row.groups){
    const control = group.runtimeControl || {};
    for(const field of ['spawnOffsetS', 'durationS', 'speedScale', 'softSpeedScale', 'arcAmp', 'dropAmp', 'lowerFieldBias', 'yOffset']){
      if(!Number.isFinite(+control[field])){
        fail(`Challenge stage ${stage} group ${group.groupIndex} control field ${field} is invalid.`, group);
      }
    }
    if(!group.runtimePathFamilyHint || !group.controlIntent){
      fail(`Challenge stage ${stage} group ${group.groupIndex} is missing motion intent/path hint.`, group);
    }
    if(+control.durationS <= 0){
      fail(`Challenge stage ${stage} group ${group.groupIndex} has invalid duration.`, group);
    }
  }
}

if(+report.summary?.controlReadinessScore10 < 6.5){
  fail('Challenge trajectory controls readiness is too low for candidate generation.', report.summary);
}

console.log(JSON.stringify({
  ok: true,
  artifact: rel(REPORT),
  challengeCount: report.summary.challengeCount,
  groupCount: report.summary.groupCount,
  controlReadinessScore10: report.summary.controlReadinessScore10
}, null, 2));

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSIS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-motion-spec', 'latest.json');
const INGESTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-motion-spec', 'aurora-challenge-2-0.1.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing challenge motion spec artifact.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function check(file){
  const report = readJson(file);
  if(report.artifactType !== 'aurora-challenge-motion-spec'){
    fail('Unexpected challenge motion spec artifact type.', { file: rel(file), artifactType: report.artifactType });
  }
  const spec = report.spec || {};
  if(+spec.stage !== 7 || +spec.challengeNumber !== 2){
    fail('Challenge motion spec should currently be scoped to Challenge 2 / internal stage 7.', {
      file: rel(file),
      stage: spec.stage,
      challengeNumber: spec.challengeNumber
    });
  }
  if(spec.evaluator !== 'reference-spline-v1'){
    fail('Challenge motion spec must declare the reference-spline-v1 evaluator.', { file: rel(file), evaluator: spec.evaluator });
  }
  const groups = Array.isArray(spec.groups) ? spec.groups : [];
  if(groups.length !== 5){
    fail('Challenge 2 motion spec must contain exactly five groups.', { file: rel(file), groupCount: groups.length });
  }
  const issues = [];
  for(const group of groups){
    const prefix = `group ${group.groupIndex}`;
    if(group.evaluator !== 'reference-spline-v1') issues.push(`${prefix}: missing evaluator`);
    if(!group.intent) issues.push(`${prefix}: missing intent`);
    if(!group.pathFamilyHint) issues.push(`${prefix}: missing pathFamilyHint`);
    if(!Number.isFinite(+group.spawnOffsetS)) issues.push(`${prefix}: missing spawnOffsetS`);
    if(+group.entityCount !== 8) issues.push(`${prefix}: expected 8 entities`);
    if(!group.phaseDurations || +group.phaseDurations.leadInS <= 0 || +group.phaseDurations.trackS <= 0 || +group.phaseDurations.exitS <= 0){
      issues.push(`${prefix}: invalid phase durations`);
    }
    if(!group.referencePath?.sourceTrackId || +group.referencePath.pointCount < 3){
      issues.push(`${prefix}: missing reference path evidence`);
    }
    const gates = Array.isArray(group.promotionGates) ? group.promotionGates : [];
    for(const gate of ['target-video-object-track-fit-must-not-regress', 'human-visible-readability-must-not-regress', 'human-perfect-routeability-must-not-regress', 'spacing-and-bunching-risk-must-pass']){
      if(!gates.includes(gate)) issues.push(`${prefix}: missing promotion gate ${gate}`);
    }
  }
  if(issues.length) fail('Challenge motion spec failed validation.', { file: rel(file), issues });
  return report;
}

const analysis = check(ANALYSIS);
check(INGESTION);

console.log(JSON.stringify({
  ok: true,
  analysis: rel(ANALYSIS),
  ingestion: rel(INGESTION),
  scope: analysis.scope,
  groupCount: analysis.summary?.groupCount,
  referenceBackedGroupCount: analysis.summary?.referenceBackedGroupCount,
  averageTrackDurationS: analysis.summary?.averageTrackDurationS
}, null, 2));

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage7-challenge2-0.1.json');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-description', 'stage7-challenge2', 'latest.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing reference execution artifact.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  const description = readJson(DESCRIPTION);
  const report = readJson(REPORT);
  if(description.artifactType !== 'reference-execution-description'){
    fail('Unexpected reference execution description artifact type.', { artifactType: description.artifactType });
  }
  if(report.artifactType !== 'reference-execution-description-analysis'){
    fail('Unexpected reference execution analysis artifact type.', { artifactType: report.artifactType });
  }
  if(+description.scope?.stage !== 7 || +description.scope?.challengeNumber !== 2){
    fail('Reference execution description must stay scoped to Stage 7 / Challenge 2.', { scope: description.scope });
  }
  const groups = Array.isArray(description.groups) ? description.groups : [];
  if(groups.length !== 5) fail('Stage 7 reference execution description must contain five groups.', { groupCount: groups.length });
  const issues = [];
  for(const group of groups){
    const prefix = `group ${group.groupIndex}`;
    if(!group.semanticPathFamily) issues.push(`${prefix}: missing semantic path family`);
    if(!group.objectTrackExecutionFamily) issues.push(`${prefix}: missing object-track execution family`);
    if(!group.canonicalComparisonPathFamily) issues.push(`${prefix}: missing canonical comparison path family`);
    if(!group.pathFamilyDecision?.canonicalSource) issues.push(`${prefix}: missing path-family decision`);
    if(!group.primaryTargetTrackId) issues.push(`${prefix}: missing primary target track`);
    if(!Array.isArray(group.primaryTrackRelativePoints) || group.primaryTrackRelativePoints.length < 3) issues.push(`${prefix}: missing primary track points`);
    if(!group.aggregateObjectTrackTarget?.pathLength) issues.push(`${prefix}: missing aggregate object-track target`);
    if(!group.candidateComparisonGate?.primaryObjectTrackFitFloorScore10) issues.push(`${prefix}: missing candidate comparison gate`);
    if(!Array.isArray(group.comparisonAxes) || !group.comparisonAxes.includes('canonical-comparison-path-family')) issues.push(`${prefix}: missing canonical path-family comparison axis`);
    if(!Array.isArray(group.comparisonAxes) || !group.comparisonAxes.includes('primary-object-track-fit')) issues.push(`${prefix}: missing primary object-track comparison axis`);
  }
  if(issues.length) fail('Reference execution description failed validation.', { issues });
  if(report.summary?.measurementKeeperRecommendation !== 'accept-measurement-keeper'){
    fail('Reference execution analysis must make an explicit measurement-keeper recommendation.', { summary: report.summary });
  }
  if(typeof report.summary?.runtimeCandidateReady !== 'boolean'){
    fail('Reference execution analysis must state runtime candidate readiness.', { summary: report.summary });
  }
  if(typeof report.summary?.runtimePromotionReady !== 'boolean'){
    fail('Reference execution analysis must distinguish candidate readiness from runtime promotion readiness.', { summary: report.summary });
  }
  if(!Array.isArray(report.summary?.pathFamilyResolutions)){
    fail('Reference execution analysis must report path-family resolutions.', { summary: report.summary });
  }
  if(!Array.isArray(report.summary?.primaryTrackGateResolutions)){
    fail('Reference execution analysis must report primary-track gate resolutions.', { summary: report.summary });
  }
  if(!Array.isArray(report.groupReads) || report.groupReads.length !== 5){
    fail('Reference execution analysis must report all five group deviations.', { groupReadCount: report.groupReads?.length });
  }
  const readIssues = report.groupReads
    .filter(read => !read.canonicalComparisonPathFamily || !Array.isArray(read.candidateFocus))
    .map(read => `group ${read.groupIndex}: missing canonical comparison read or candidate focus`);
  if(readIssues.length) fail('Reference execution group reads failed validation.', { issues: readIssues });
  console.log(JSON.stringify({
    ok: true,
    description: rel(DESCRIPTION),
    report: rel(REPORT),
    measurementKeeperRecommendation: report.summary.measurementKeeperRecommendation,
    runtimeCandidateRecommendation: report.summary.runtimeCandidateRecommendation,
    runtimeCandidateReady: report.summary.runtimeCandidateReady,
    runtimePromotionReady: report.summary.runtimePromotionReady,
    precisionBlockerCount: report.summary.precisionBlockerCount,
    candidateReadinessBlockerCount: report.summary.candidateReadinessBlockerCount,
    runtimePromotionBlockerCount: report.summary.runtimePromotionBlockerCount
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}

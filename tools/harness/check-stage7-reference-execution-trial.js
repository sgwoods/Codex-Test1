#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage7-challenge2', 'latest.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 7 reference execution trial report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage7-reference-execution-candidate-trial'){
    fail('Unexpected Stage 7 reference execution trial artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 7 || +report.scope?.challengeNumber !== 2){
    fail('Stage 7 trial report must stay scoped to Stage 7 / Challenge 2.', { scope: report.scope });
  }
  const groups = report.trial?.groupResults || [];
  if(!Array.isArray(groups) || groups.length !== 5){
    fail('Stage 7 trial report must contain all five group results.', { groupCount: groups.length });
  }
  const missing = [];
  for(const group of groups){
    const prefix = `group ${group.groupIndex}`;
    if(!group.canonicalComparisonPathFamily) missing.push(`${prefix}: canonical family`);
    if(!group.candidatePathFamily) missing.push(`${prefix}: candidate family`);
    if(!Number.isFinite(+group.aggregateObjectTrackScore10)) missing.push(`${prefix}: aggregate score`);
    if(!Number.isFinite(+group.aggregateObjectTrackCoverage)) missing.push(`${prefix}: aggregate coverage`);
    if(!Number.isFinite(+group.primaryObjectTrackScore10)) missing.push(`${prefix}: primary score`);
    if(!group.candidateVector || typeof group.candidateVector !== 'object') missing.push(`${prefix}: candidate vector`);
    if(!Array.isArray(group.blockers) || !Array.isArray(group.warnings)) missing.push(`${prefix}: blockers/warnings`);
  }
  if(missing.length) fail('Stage 7 trial group rows are incomplete.', { missing });
  const guardrails = report.trial || {};
  for(const key of ['spacingReadability', 'scoreableRoutes', 'safety']){
    if(!guardrails[key] || typeof guardrails[key].pass !== 'boolean'){
      fail(`Stage 7 trial report must include ${key} pass/fail guardrail.`, { guardrail: guardrails[key] });
    }
  }
  if(report.summary?.measurementKeeperRecommendation !== 'accept-trial-mechanism'){
    fail('Stage 7 trial report must mark the mechanism as a measurement keeper.', { summary: report.summary });
  }
  if(report.summary?.runtimeKeeperRecommendation !== 'not-a-runtime-keeper'){
    fail('Stage 7 trial report must not claim a runtime keeper.', { summary: report.summary });
  }
  if(typeof report.summary?.readyForRuntimeSourceCandidate !== 'boolean'){
    fail('Stage 7 trial report must state runtime source candidate readiness.', { summary: report.summary });
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidate: report.candidate?.candidateId || null,
    totalObjectTrackScore10: report.trial.totalObjectTrackScore10,
    totalObjectTrackCoverage: report.trial.totalObjectTrackCoverage,
    readyForRuntimeSourceCandidate: report.summary.readyForRuntimeSourceCandidate,
    blockerCount: report.summary.blockerCount,
    runtimeKeeperRecommendation: report.summary.runtimeKeeperRecommendation
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}

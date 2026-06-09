#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-source-attempts', 'stage3-challenge1', 'group2-fast-lane', 'latest-group2-fast-lane.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail(`Missing report: ${path.relative(ROOT, file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const report = readJson(REPORT);

if(report.artifactType !== 'stage3-group2-fast-lane-report'){
  fail('Unexpected Stage 3 group 2 fast-lane artifact type.', { artifactType: report.artifactType });
}
if(report.scope?.touchedGroup !== 2){
  fail('Stage 3 group 2 fast-lane report must touch only group 2.', { scope: report.scope });
}
if(!Array.isArray(report.scope?.protectedGroups) || !report.scope.protectedGroups.includes(4)){
  fail('Stage 3 group 2 fast-lane report must protect the accepted group 4 keeper.', { scope: report.scope });
}
if(!Array.isArray(report.scope?.protectedGroups) || !report.scope.protectedGroups.includes(5)){
  fail('Stage 3 group 2 fast-lane report must protect the accepted group 5 keeper.', { scope: report.scope });
}
if(!['non-overwriting-proof', 'source-attempt'].includes(report.mode)){
  fail('Unexpected Stage 3 group 2 fast-lane mode.', { mode: report.mode });
}
if(!['transfer-proof-ready', 'dev-visible-gameplay-keeper', 'rejected', 'blocked', 'blocked-runtime-control-isolation'].includes(report.verdict)){
  fail('Unexpected Stage 3 group 2 fast-lane verdict.', { verdict: report.verdict });
}
if(report.verdict === 'dev-visible-gameplay-keeper'){
  if(report.mode !== 'source-attempt') fail('A dev-visible keeper must come from source-attempt mode.', { mode: report.mode });
  if(report.summary?.group4KeeperPreserved !== true) fail('Accepted group 4 keeper was not preserved.', { summary: report.summary });
  if(report.summary?.group5KeeperPreserved !== true) fail('Accepted group 5 keeper was not preserved.', { summary: report.summary });
  if(report.summary?.guardrailsPass !== true) fail('Accepted group 2 keeper must preserve guardrails.', { summary: report.summary });
  if(report.betaJustification !== false) fail('Group 2 fast-lane keeper must not claim beta justification.', { betaJustification: report.betaJustification });
}
if(report.verdict === 'transfer-proof-ready'){
  if(report.mode !== 'non-overwriting-proof') fail('Transfer-proof-ready verdict should be non-overwriting proof mode.', { mode: report.mode });
  if(report.summary?.passingProofCount !== 1) fail('Transfer-proof-ready report must have exactly one passing proof.', { summary: report.summary });
  if(!report.selectedCandidateId) fail('Transfer-proof-ready report must select a candidate.');
}
if(report.verdict === 'blocked' && report.mode === 'non-overwriting-proof' && report.summary?.passingProofCount === 1){
  fail('A non-overwriting proof with exactly one passing candidate should be transfer-proof-ready.', { summary: report.summary });
}
if(report.verdict === 'blocked-runtime-control-isolation'){
  if(report.mode !== 'non-overwriting-proof') fail('Runtime-control isolation blocks should be non-overwriting proof mode.', { mode: report.mode });
  if(report.summary?.blockerClassification !== 'runtime-control-isolation'){
    fail('Blocked isolation report must classify runtime-control isolation.', { summary: report.summary });
  }
  if(!report.isolation || !Array.isArray(report.isolation.perGroupTimingDrift)){
    fail('Blocked isolation report must include per-group timing drift.', { isolation: report.isolation });
  }
  if(!report.summary?.missingRuntimeControl){
    fail('Blocked isolation report must name the missing runtime control capability.', { summary: report.summary });
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: report.mode,
  verdict: report.verdict,
  selectedCandidateId: report.selectedCandidateId,
  group4KeeperPreserved: report.summary?.group4KeeperPreserved,
  blockerTypes: report.summary?.blockerTypes || []
}, null, 2));

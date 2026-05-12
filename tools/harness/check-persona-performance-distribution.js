#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'persona-performance-distribution', 'latest.json');
const CHART = path.join(ROOT, 'reference-artifacts', 'analyses', 'persona-performance-distribution', 'performance-lines.svg');
const REQUIRED = ['novice', 'advanced', 'expert', 'professional'];

function fail(message, extra = {}){
  console.error(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if(!fs.existsSync(ARTIFACT)){
  fail('Missing persona performance distribution artifact.', {
    expected: path.relative(ROOT, ARTIFACT)
  });
}
if(!fs.existsSync(CHART)){
  fail('Missing persona performance distribution chart.', {
    expected: path.relative(ROOT, CHART)
  });
}

const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
if(artifact.artifactType !== 'persona-performance-distribution'){
  fail('Persona performance distribution artifact has wrong artifactType.', {
    actual: artifact.artifactType
  });
}
const rows = Array.isArray(artifact.summaryRows) ? artifact.summaryRows : [];
const missing = REQUIRED.filter(persona => !rows.some(row => row.persona === persona));
if(missing.length){
  fail('Persona performance distribution is missing required personas.', { missing });
}
const underSampled = rows
  .filter(row => REQUIRED.includes(row.persona))
  .filter(row => (+row.runCount || 0) < 30)
  .map(row => ({ persona: row.persona, runCount: row.runCount }));
if(underSampled.length){
  fail('Persona performance distribution needs at least 30 runs per persona for the current documentation claim.', {
    underSampled
  });
}
if(!Array.isArray(artifact.runs) || artifact.runs.length < 120){
  fail('Persona performance distribution is missing per-run rows.', {
    runCount: Array.isArray(artifact.runs) ? artifact.runs.length : 0
  });
}
const svg = fs.readFileSync(CHART, 'utf8');
for(const label of ['Beginner', 'Intermediate', 'Expert', 'Professional']){
  if(!svg.includes(label)){
    fail('Persona chart is missing a persona label.', { label });
  }
}

console.log(JSON.stringify({
  ok: true,
  artifact: path.relative(ROOT, ARTIFACT),
  chart: path.relative(ROOT, CHART),
  runCount: artifact.runs.length,
  runsPerPersona: artifact.runsPerPersona
}, null, 2));

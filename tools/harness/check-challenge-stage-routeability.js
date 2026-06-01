#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-routeability', 'latest.json');
const REQUIRED_STAGE_MARKERS = [3, 7, 11, 15, 19];

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    fail('challenge-stage routeability artifact could not be read', { file, error: err.message });
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('challenge-stage routeability artifact is missing', {
      file: path.relative(ROOT, ARTIFACT),
      fix: 'Run npm run harness:analyze:challenge-stage-routeability -- --stages=3,7,11,15,19'
    });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'challenge-stage-routeability'){
    fail('unexpected artifactType', { artifactType: artifact.artifactType });
  }
  const rows = Array.isArray(artifact.stageRows) ? artifact.stageRows : [];
  if(rows.length < REQUIRED_STAGE_MARKERS.length){
    fail('routeability artifact should cover the first five challenging stages', { count: rows.length });
  }
  const byStage = new Map(rows.map(row => [Number(row.summary?.stage || 0), row.summary || {}]));
  const missing = REQUIRED_STAGE_MARKERS.filter(stage => !byStage.has(stage));
  if(missing.length){
    fail('routeability artifact is missing required stage markers', { missing });
  }
  const weak = [];
  for(const stage of REQUIRED_STAGE_MARKERS){
    const row = byStage.get(stage);
    const target = Number(row.targetCount || 40);
    if(Number(row.trackedRows || 0) < target) weak.push({ stage, issue: 'not-all-targets-tracked', trackedRows: row.trackedRows, target });
    if(Number(row.scoreableRows || 0) < Math.max(38, target - 2)) weak.push({ stage, issue: 'too-few-scoreable-targets', scoreableRows: row.scoreableRows, target });
    if(Number(row.greedyRouteKills || 0) < Math.max(38, target - 2)) weak.push({ stage, issue: 'too-few-routeable-targets', greedyRouteKills: row.greedyRouteKills, target });
  }
  if(weak.length){
    fail('routeability guardrail failed', { weak });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    stageCount: rows.length,
    stages: REQUIRED_STAGE_MARKERS,
    totalTrackedRows: artifact.summary?.totalTrackedRows,
    totalRouteKills: artifact.summary?.totalRouteKills,
    averageGreedyRouteScore10: artifact.summary?.averageGreedyRouteScore10
  }, null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/aurora-impact-explosion-conformance/latest.json';
const REQUIRED_KEYS = ['enemy-hit', 'enemy-boom', 'boss-first-hit', 'boss-boom'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

function main(){
  if(!exists(ARTIFACT)) fail(`Missing impact/explosion conformance artifact: ${ARTIFACT}`);
  const artifact = readJson(ARTIFACT);
  const samples = Array.isArray(artifact.samples) ? artifact.samples : [];
  const payload = {
    artifact: ARTIFACT,
    summary: artifact.summary,
    sampleKeys: samples.map(sample => sample.key)
  };
  if(artifact.artifactType !== 'aurora-impact-explosion-conformance'){
    fail('Impact/explosion conformance artifact has the wrong artifact type', payload);
  }
  for(const key of REQUIRED_KEYS){
    if(!samples.some(sample => sample.key === key)){
      fail(`Impact/explosion conformance artifact is missing ${key}`, payload);
    }
  }
  for(const sample of samples){
    if(!Number.isFinite(+sample.score10) || sample.score10 <= 0 || sample.score10 > 10){
      fail(`Impact/explosion sample ${sample.key} has an invalid score`, { sample, payload });
    }
    for(const field of ['runtimeCrop', 'bestTargetCrop']){
      if(!exists(sample[field])){
        fail(`Impact/explosion sample ${sample.key} is missing ${field}`, { sample, payload });
      }
    }
  }
  if(!Number.isFinite(+artifact.summary?.averageScore10)){
    fail('Impact/explosion conformance artifact is missing an average score', payload);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    sampleCount: samples.length,
    averageScore10: artifact.summary.averageScore10,
    weakestKey: artifact.summary.weakestKey,
    weakestScore10: artifact.summary.weakestScore10
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

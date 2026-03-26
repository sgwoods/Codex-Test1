#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { assessVideoArtifact } = require('./video-artifact-util');

const ROOT = path.resolve(__dirname, '..', '..');
const RUN = path.join(__dirname, 'run-gameplay.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'video-artifact');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(){
  const res = spawnSync(process.execPath, [
    RUN,
    '--scenario', 'stage4-five-ships',
    '--seed', '4201',
    '--persona', 'advanced',
    '--out', OUT
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 120000
  });
  if(res.status !== 0){
    fail('video artifact harness run failed', {
      stdout: res.stdout,
      stderr: res.stderr,
      status: res.status,
      signal: res.signal
    });
  }
  try{
    return JSON.parse(res.stdout.trim());
  }catch(err){
    fail('could not parse video artifact harness output', {
      stdout: res.stdout,
      stderr: res.stderr
    });
  }
}

function main(){
  const result = runScenario();
  const videoFile = (result.files || []).find(f => f.endsWith('.review.mkv')) || (result.files || []).find(f => f.endsWith('.webm'));
  if(!videoFile || !fs.existsSync(videoFile)){
    fail('recorded video file was not produced', result);
  }
  const assessed = assessVideoArtifact(videoFile, +(result.analysis?.duration || 0));
  const formatDuration = assessed.formatDuration;
  const summaryDuration = +(result.analysis?.duration || 0);
  if(!assessed.ok){
    fail('recorded video artifact quality deviated from expected; file an immediate bug and repair by remuxing the raw .webm to .review.mkv', {
      videoFile,
      summaryDuration,
      assessed,
      result
    });
  }
  console.log(JSON.stringify({
    ok: true,
    videoFile,
    formatDuration,
    summaryDuration,
    assessed
  }, null, 2));
}

main();

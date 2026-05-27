#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { assessVideoArtifact } = require('./video-artifact-util');

const ROOT = path.resolve(__dirname, '..', '..');
const CAPTURE = path.join(__dirname, 'capture-gameplay-segment.js');
const OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'video-artifact');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function runScenario(){
  const res = spawnSync(process.execPath, [
    CAPTURE,
    '--start-kind', 'level',
    '--stage', '4',
    '--seed', '4201',
    '--seconds', '8',
    '--warmup', '0.1',
    '--pre-roll', '0',
    '--wait-for-active', '0',
    '--audio', '0',
    '--fps', '30',
    '--width', '640',
    '--height', '900',
    '--label', 'video-artifact-check',
    '--out-dir', OUT
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
  const videoFile = path.resolve(ROOT, result.video || result.latestVideo || '');
  if(!videoFile || !fs.existsSync(videoFile)){
    fail('recorded video file was not produced', result);
  }
  const assessed = assessVideoArtifact(videoFile, +(result.capture?.seconds || 0));
  const formatDuration = assessed.formatDuration;
  const summaryDuration = +(result.capture?.seconds || 0);
  if(!assessed.ok){
    fail('recorded video artifact quality deviated from expected; file an immediate bug and repair by remuxing the raw .webm to a .review.webm', {
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
    assessed,
    latestVideo: result.latestVideo || null,
    poster: result.latestPoster || result.poster || null
  }, null, 2));
}

main();

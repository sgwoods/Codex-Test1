#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_INTERVAL_SECONDS = 120;

function argValue(name){
  const index = process.argv.indexOf(name);
  if(index < 0) return null;
  return process.argv[index + 1] || null;
}

function parseInterval(){
  const raw = argValue('--interval') || argValue('-i') || process.env.CONFORMANCE_DASHBOARD_INTERVAL || DEFAULT_INTERVAL_SECONDS;
  const value = Number(raw);
  if(!Number.isFinite(value) || value < 10){
    throw new Error(`Invalid interval "${raw}". Use at least 10 seconds.`);
  }
  return Math.round(value);
}

function runNode(script){
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  if(result.status !== 0){
    throw new Error(`${script} failed after ${seconds}s`);
  }
  return seconds;
}

function cycle(){
  const stamp = new Date().toISOString();
  console.log(`[${stamp}] refreshing conformance dashboard artifacts`);
  const reportSeconds = runNode('tools/harness/build-release-conformance-dashboard.js');
  const pageSeconds = runNode('tools/harness/build-dev-conformance-dashboard-page.js');
  console.log(`[${new Date().toISOString()}] refresh complete: report ${reportSeconds}s, page ${pageSeconds}s`);
}

function main(){
  const interval = parseInterval();
  cycle();
  console.log(`Watching dashboard inputs every ${interval}s. Press Ctrl-C to stop.`);
  setInterval(() => {
    try{
      cycle();
    }catch(err){
      console.error(`[${new Date().toISOString()}] dashboard refresh failed: ${err.message}`);
    }
  }, interval * 1000);
}

main();

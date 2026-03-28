#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const {
  BETA_BUILD_INFO,
  PRODUCTION_BUILD_INFO
} = require('./paths');

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function laneConfig(lane){
  if(lane === 'beta'){
    return {
      buildInfo: BETA_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json'
    };
  }
  if(lane === 'production'){
    return {
      buildInfo: PRODUCTION_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/build-info.json'
    };
  }
  throw new Error('Use --lane beta or --lane production.');
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function fetchJson(url){
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if(res.statusCode !== 200){
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try{
          resolve(JSON.parse(body));
        }catch(err){
          reject(new Error(`Could not parse JSON from ${url}: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || '').toLowerCase();
  const cfg = laneConfig(lane);
  const timeoutMs = Math.max(10_000, +args.timeoutMs || 180_000);
  const intervalMs = Math.max(2_000, +args.intervalMs || 8_000);
  const expected = loadJson(cfg.buildInfo);
  const deadline = Date.now() + timeoutMs;
  let lastSeen = null;
  let lastError = null;

  while(Date.now() < deadline){
    try{
      const live = await fetchJson(cfg.url);
      lastSeen = live;
      if(
        live.label === expected.label &&
        live.commit === expected.commit &&
        live.releaseChannel === expected.releaseChannel
      ){
        console.log(JSON.stringify({
          ok: true,
          lane,
          url: cfg.url,
          label: live.label,
          commit: live.shortCommit || String(live.commit || '').slice(0, 7),
          releaseChannel: live.releaseChannel
        }, null, 2));
        return;
      }
      lastError = `live ${lane} build-info does not match expected artifact yet`;
    }catch(err){
      lastError = err.message || String(err);
    }
    await sleep(intervalMs);
  }

  throw new Error(JSON.stringify({
    ok: false,
    lane,
    url: cfg.url,
    expected: {
      label: expected.label,
      commit: expected.shortCommit || String(expected.commit || '').slice(0, 7),
      releaseChannel: expected.releaseChannel
    },
    lastSeen: lastSeen ? {
      label: lastSeen.label,
      commit: lastSeen.shortCommit || String(lastSeen.commit || '').slice(0, 7),
      releaseChannel: lastSeen.releaseChannel
    } : null,
    lastError
  }, null, 2));
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

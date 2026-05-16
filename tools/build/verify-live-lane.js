#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const {
  DEV_BUILD_INFO,
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
  if(lane === 'dev'){
    return {
      buildInfo: DEV_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/dev/build-info.json',
      assetUrls: [
        'https://sgwoods.github.io/Aurora-Galactica/dev/conformance-dashboard.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/conformance-dashboard-data.json',
        'https://sgwoods.github.io/Aurora-Galactica/dev/application-guide.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/white-paper.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/public-project-page.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/assets/platinum-platform-mark.png',
        'https://sgwoods.github.io/Aurora-Galactica/dev/assets/reference-audio/galaga3-start.m4a'
      ]
    };
  }
  if(lane === 'beta'){
    return {
      buildInfo: BETA_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json',
      assetUrls: [
        'https://sgwoods.github.io/Aurora-Galactica/beta/conformance-dashboard.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/conformance-dashboard-data.json',
        'https://sgwoods.github.io/Aurora-Galactica/beta/application-guide.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/white-paper.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/public-project-page.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/assets/platinum-platform-mark.png',
        'https://sgwoods.github.io/Aurora-Galactica/beta/assets/reference-audio/galaga3-start.m4a'
      ]
    };
  }
  if(lane === 'production'){
    return {
      buildInfo: PRODUCTION_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/build-info.json',
      assetUrls: [
        'https://sgwoods.github.io/Aurora-Galactica/conformance-dashboard.html',
        'https://sgwoods.github.io/Aurora-Galactica/conformance-dashboard-data.json',
        'https://sgwoods.github.io/Aurora-Galactica/application-guide.html',
        'https://sgwoods.github.io/Aurora-Galactica/white-paper.html',
        'https://sgwoods.github.io/Aurora-Galactica/public-project-page.html',
        'https://sgwoods.github.io/Aurora-Galactica/assets/platinum-platform-mark.png',
        'https://sgwoods.github.io/Aurora-Galactica/assets/reference-audio/galaga3-start.m4a'
      ]
    };
  }
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function logProgress(message){
  console.error(`[verify-live-lane] ${message}`);
}

function armRequestTimeout(req, res, url, timeoutMs){
  const fail = () => req.destroy(new Error(`Request timeout after ${timeoutMs}ms for ${url}`));
  req.setTimeout(timeoutMs, fail);
  if(res && typeof res.setTimeout === 'function'){
    res.setTimeout(timeoutMs, fail);
  }
}

function fetchJson(url, requestTimeoutMs){
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      armRequestTimeout(req, res, url, requestTimeoutMs);
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
    });
    armRequestTimeout(req, null, url, requestTimeoutMs);
    req.on('error', reject);
  });
}

function fetchOk(url, requestTimeoutMs){
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      armRequestTimeout(req, res, url, requestTimeoutMs);
      const status = res.statusCode || 0;
      res.resume();
      if(status === 200){
        resolve(true);
        return;
      }
      reject(new Error(`HTTP ${status} from ${url}`));
    });
    armRequestTimeout(req, null, url, requestTimeoutMs);
    req.on('error', reject);
  });
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || '').toLowerCase();
  const cfg = laneConfig(lane);
  const timeoutMs = Math.max(10_000, +args.timeoutMs || 180_000);
  const requestTimeoutMs = Math.min(timeoutMs, Math.max(5_000, +args.requestTimeoutMs || 15_000));
  const intervalMs = Math.max(2_000, +args.intervalMs || 8_000);
  const expected = loadJson(cfg.buildInfo);
  const deadline = Date.now() + timeoutMs;
  let lastSeen = null;
  let lastError = null;

  while(Date.now() < deadline){
    try{
      logProgress(`checking ${lane} build-info: ${cfg.url}`);
      const live = await fetchJson(cfg.url, requestTimeoutMs);
      lastSeen = live;
      if(
        live.label === expected.label &&
        live.commit === expected.commit &&
        live.releaseChannel === expected.releaseChannel
      ){
        const assetUrls = cfg.assetUrls || [];
        for(const [index, assetUrl] of assetUrls.entries()){
          logProgress(`checking ${lane} asset ${index + 1}/${assetUrls.length}: ${assetUrl}`);
          try{
            await fetchOk(assetUrl, requestTimeoutMs);
          }catch(err){
            throw new Error(`Asset verification failed for ${assetUrl}: ${err.message || String(err)}`);
          }
        }
        console.log(JSON.stringify({
          ok: true,
          lane,
          url: cfg.url,
          assetUrls: cfg.assetUrls || [],
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
    requestTimeoutMs,
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

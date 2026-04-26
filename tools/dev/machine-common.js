#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFileSync, spawnSync } = require('child_process');
const { ROOT } = require('../build/paths');

const MACHINE_PROFILE_FILE = path.join(ROOT, '.machine-profile.json');
const RELEASE_AUTHORITY_FILE = path.join(ROOT, 'release-authority.json');
const LOCAL_SERVICES_DIR = path.join(ROOT, '.local-services');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const LIVE_LANE_URLS = {
  dev: 'https://sgwoods.github.io/Aurora-Galactica/dev/build-info.json',
  beta: 'https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json',
  production: 'https://sgwoods.github.io/Aurora-Galactica/build-info.json'
};

const PUBLIC_URLS = {
  rawProject: 'https://raw.githubusercontent.com/sgwoods/public/main/aurora-galactica.html',
  rawManifest: 'https://raw.githubusercontent.com/sgwoods/public/main/data/projects/aurora-galactica.json',
  renderedProject: 'https://sgwoods.github.io/public/aurora-galactica.html',
  renderedRoot: 'https://sgwoods.github.io/public/'
};

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i += 1){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function slugify(value){
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'machine';
}

function readJsonIfExists(file){
  if(!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, payload){
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
}

function git(args){
  return execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function gitOrNull(args){
  try{
    return git(args);
  }catch{
    return null;
  }
}

function currentIdentity(){
  const profile = readJsonIfExists(MACHINE_PROFILE_FILE);
  const hostname = os.hostname();
  const machineId = process.env.AURORA_MACHINE_ID
    || (profile && profile.machine_id)
    || slugify(hostname);
  const machineLabel = process.env.AURORA_MACHINE_LABEL
    || (profile && profile.machine_label)
    || hostname;
  return {
    machine_id: machineId,
    machine_label: machineLabel,
    hostname,
    repo_path: ROOT
  };
}

function readReleaseAuthority(){
  return readJsonIfExists(RELEASE_AUTHORITY_FILE);
}

function machineIsAuthority(identity = currentIdentity(), authority = readReleaseAuthority()){
  if(!authority) return false;
  return authority.machine_id === identity.machine_id;
}

function gitStatusSummary(){
  const branch = gitOrNull(['rev-parse', '--abbrev-ref', 'HEAD']) || 'unknown';
  const dirty = Boolean(gitOrNull(['status', '--short']));
  const upstream = gitOrNull(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);
  let ahead = 0;
  let behind = 0;
  if(upstream){
    const counts = gitOrNull(['rev-list', '--left-right', '--count', `${upstream}...HEAD`]);
    if(counts){
      const [behindRaw, aheadRaw] = counts.split(/\s+/);
      behind = +(behindRaw || 0);
      ahead = +(aheadRaw || 0);
    }
  }
  return {
    branch,
    dirty,
    upstream: upstream || null,
    ahead,
    behind
  };
}

function commandVersion(command, args = ['--version']){
  try{
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim().split('\n')[0];
  }catch{
    return null;
  }
}

function toolChecks(){
  const checks = {
    node: { ok: true, version: process.version },
    npm: { ok: false, version: null },
    python3: { ok: false, version: null },
    gh: { ok: false, version: null, authenticated: false },
    ffmpeg: { ok: false, version: null },
    ffprobe: { ok: false, version: null },
    chrome: { ok: false, version: null, path: CHROME_PATH }
  };

  checks.npm.version = commandVersion('npm', ['-v']);
  checks.npm.ok = Boolean(checks.npm.version);

  checks.python3.version = commandVersion('python3', ['--version']);
  checks.python3.ok = Boolean(checks.python3.version);

  checks.gh.version = commandVersion('gh', ['--version']);
  checks.gh.ok = Boolean(checks.gh.version);
  if(checks.gh.ok){
    const auth = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
    checks.gh.authenticated = auth.status === 0;
  }

  checks.ffmpeg.version = commandVersion('ffmpeg', ['-version']);
  checks.ffmpeg.ok = Boolean(checks.ffmpeg.version);

  checks.ffprobe.version = commandVersion('ffprobe', ['-version']);
  checks.ffprobe.ok = Boolean(checks.ffprobe.version);

  if(fs.existsSync(CHROME_PATH)){
    checks.chrome.version = commandVersion(CHROME_PATH, ['--version']);
    checks.chrome.ok = Boolean(checks.chrome.version);
  }

  return checks;
}

function buildMachineProfile(identity, checks, lastSuccessfulBootstrapAt = null){
  return {
    machine_id: identity.machine_id,
    machine_label: identity.machine_label,
    hostname: identity.hostname,
    repo_path: identity.repo_path,
    tool_versions: {
      node: checks.node.version,
      npm: checks.npm.version,
      python3: checks.python3.version,
      gh: checks.gh.version,
      ffmpeg: checks.ffmpeg.version,
      ffprobe: checks.ffprobe.version,
      chrome: checks.chrome.version
    },
    gh_auth: checks.gh.authenticated,
    last_successful_bootstrap_at: lastSuccessfulBootstrapAt
  };
}

function checkRepoRemote(){
  const remotes = gitOrNull(['remote', '-v']) || '';
  return {
    ok: remotes.includes('sgwoods/Codex-Test1'),
    remotes
  };
}

function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probeOnce(url){
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function probe(url, attempts = 4, pauseMs = 750){
  for(let i = 0; i < attempts; i += 1){
    if(await probeOnce(url)) return true;
    if(i < attempts - 1){
      await sleep(pauseMs);
    }
  }
  return false;
}

async function localServiceStatus(){
  const game = await probe('http://127.0.0.1:8000/');
  const viewer = await probe('http://127.0.0.1:4311/api/runs');
  return {
    game: { ok: game, url: 'http://127.0.0.1:8000/' },
    viewer: { ok: viewer, url: 'http://127.0.0.1:4311/' },
    state_dir: LOCAL_SERVICES_DIR
  };
}

function fetchText(url){
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Aurora-machine-check'
      }
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if(res.statusCode >= 200 && res.statusCode < 300){
          resolve(body);
        } else {
          reject(new Error(`${url} -> ${res.statusCode}`));
        }
      });
    });
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error(`timeout fetching ${url}`));
    });
  });
}

async function fetchJson(url){
  return JSON.parse(await fetchText(url));
}

async function liveLaneStatus(){
  const out = {};
  for(const [lane, url] of Object.entries(LIVE_LANE_URLS)){
    try{
      const payload = await fetchJson(url);
      out[lane] = {
        ok: true,
        version: payload.version,
        label: payload.label,
        commit: payload.shortCommit || String(payload.commit || '').slice(0, 7),
        releaseChannel: payload.releaseChannel
      };
    }catch(err){
      out[lane] = {
        ok: false,
        error: err.message
      };
    }
  }
  return out;
}

async function publicStatusChecks(expectedFocus = null, expectedRelease = null){
  const result = {
    raw_project_current: false,
    raw_manifest_current: false,
    rendered_project_current: false,
    rendered_root_current: false,
    details: {}
  };
  try{
    const rawProject = await fetchText(PUBLIC_URLS.rawProject);
    result.raw_project_current = (!expectedFocus || rawProject.includes(expectedFocus))
      && (!expectedRelease || rawProject.includes(expectedRelease));
    result.details.raw_project = result.raw_project_current ? 'ok' : 'missing expected release/focus';
  }catch(err){
    result.details.raw_project = err.message;
  }
  try{
    const manifest = await fetchJson(PUBLIC_URLS.rawManifest);
    result.raw_manifest_current = (!expectedFocus || manifest.focus_value === expectedFocus)
      && (!expectedRelease || manifest.status_value === expectedRelease);
    result.details.raw_manifest = result.raw_manifest_current ? 'ok' : 'manifest stale';
  }catch(err){
    result.details.raw_manifest = err.message;
  }
  try{
    const renderedProject = await fetchText(PUBLIC_URLS.renderedProject);
    result.rendered_project_current = (!expectedFocus || renderedProject.includes(expectedFocus))
      && (!expectedRelease || renderedProject.includes(expectedRelease));
    result.details.rendered_project = result.rendered_project_current ? 'ok' : 'missing expected release/focus';
  }catch(err){
    result.details.rendered_project = err.message;
  }
  try{
    const renderedRoot = await fetchText(PUBLIC_URLS.renderedRoot);
    result.rendered_root_current = renderedRoot.includes('Aurora Galactica')
      && (!expectedFocus || renderedRoot.includes(expectedFocus))
      && (!expectedRelease || renderedRoot.includes(`<strong>Current release</strong> ${expectedRelease}`));
    result.details.rendered_root = result.rendered_root_current ? 'ok' : 'root card stale';
  }catch(err){
    result.details.rendered_root = err.message;
  }
  return result;
}

function runCommandOrThrow(command, args, label){
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    encoding: 'utf8'
  });
  if(result.status !== 0){
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function nextCommands(identity, authorityMatch){
  const machineTopic = `git switch -c codex/${identity.machine_id}-your-topic`;
  const authorityClaim = `npm run release:claim-authority -- --machine-id ${identity.machine_id} --label "${identity.machine_label}"`;
  return authorityMatch
    ? [
        machineTopic,
        'npm run machine:status',
        'npm run harness:score:quality-conformance'
      ]
    : [
        machineTopic,
        'npm run release:show-authority',
        authorityClaim
      ];
}

module.exports = {
  ROOT,
  MACHINE_PROFILE_FILE,
  RELEASE_AUTHORITY_FILE,
  LIVE_LANE_URLS,
  PUBLIC_URLS,
  parseArgs,
  slugify,
  readJsonIfExists,
  writeJson,
  git,
  gitOrNull,
  currentIdentity,
  readReleaseAuthority,
  machineIsAuthority,
  gitStatusSummary,
  toolChecks,
  buildMachineProfile,
  checkRepoRemote,
  localServiceStatus,
  fetchText,
  fetchJson,
  liveLaneStatus,
  publicStatusChecks,
  runCommandOrThrow,
  nextCommands
};

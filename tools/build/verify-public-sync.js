#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BUILD_INFO = path.join(ROOT, 'build-info.json');
const OWNER = process.env.PUBLIC_REPO_OWNER || 'sgwoods';
const REPO = process.env.PUBLIC_REPO_NAME || 'public';
const TOKEN = process.env.PUBLIC_REPO_SYNC_TOKEN || process.env.GH_TOKEN || loadGhToken();
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

function loadGhToken(){
  try{
    return execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return '';
  }
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function publicDateLong(buildInfo){
  const source = buildInfo.builtAtUtc || new Date().toISOString();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(source));
}

async function request(url){
  if(!TOKEN){
    throw new Error('Missing PUBLIC_REPO_SYNC_TOKEN or gh auth token for verification.');
  }
  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Codex-Test1-public-verify'
    }
  });
}

async function getContent(filePath){
  const res = await request(`${API_ROOT}/${filePath}`);
  if(!res.ok) throw new Error(`Failed to fetch ${filePath}: ${res.status} ${res.statusText}`);
  const body = await res.json();
  return Buffer.from(body.content, 'base64').toString('utf8');
}

function ensureIncludes(haystack, needle, context){
  if(!haystack.includes(needle)){
    throw new Error(`Public sync verification failed for ${context}: missing "${needle}"`);
  }
}

async function main(){
  const buildInfo = readJson(BUILD_INFO);
  const dateLong = publicDateLong(buildInfo);
  const expectedShaFragment = `sha.${buildInfo.shortCommit}`;
  const indexHtml = await getContent('index.html');
  const projectHtml = await getContent('codex-test1.html');

  ensureIncludes(indexHtml, `Repository work last updated: ${dateLong}.`, 'public/index.html date');
  ensureIncludes(indexHtml, `Current release: ${buildInfo.version}.`, 'public/index.html release');

  ensureIncludes(projectHtml, `<span class="metaValue">${dateLong}</span>`, 'public/codex-test1.html date');
  ensureIncludes(projectHtml, expectedShaFragment, 'public/codex-test1.html build sha');
  ensureIncludes(projectHtml, 'release-dashboard.html', 'public/codex-test1.html dashboard link');

  console.log(`Verified public repo pages match ${buildInfo.version} ${expectedShaFragment}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

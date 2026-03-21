#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BUILD_INFO = path.join(ROOT, 'build-info.json');
const RELEASE_DASHBOARD = path.join(ROOT, 'release-dashboard.json');
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

function repoPushedAt(buildInfo){
  const ref = buildInfo.commit || 'HEAD';
  try{
    return execSync(`git -C ${JSON.stringify(ROOT)} show -s --format=%cI ${ref}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  }catch{
    return buildInfo.builtAtUtc || new Date().toISOString();
  }
}

function publicDateLong(source){
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
  const dashboard = readJson(RELEASE_DASHBOARD);
  const pushedAt = repoPushedAt(buildInfo);
  const dateLong = publicDateLong(pushedAt);
  const expectedShaFragment = `sha.${buildInfo.shortCommit}`;
  const projectHtml = await getContent('codex-test1.html');
  const manifestRaw = await getContent('data/projects/codex-test1.json');
  const manifest = JSON.parse(manifestRaw);

  ensureIncludes(projectHtml, `<span class="metaValue">${dateLong}</span>`, 'public/codex-test1.html date');
  ensureIncludes(projectHtml, expectedShaFragment, 'public/codex-test1.html build sha');
  ensureIncludes(projectHtml, 'release-dashboard.html', 'public/codex-test1.html dashboard link');
  ensureIncludes(projectHtml, 'project-guide.html', 'public/codex-test1.html project guide link');
  if(manifest.schema_version !== '1.0') throw new Error(`Public sync verification failed for data/projects/codex-test1.json schema_version: expected "1.0" got "${manifest.schema_version}"`);
  if(manifest.project_id !== 'codex-test1') throw new Error(`Public sync verification failed for data/projects/codex-test1.json project_id: expected "codex-test1" got "${manifest.project_id}"`);
  if(manifest.status_value !== buildInfo.version) throw new Error(`Public sync verification failed for data/projects/codex-test1.json status_value: expected "${buildInfo.version}" got "${manifest.status_value}"`);
  if(manifest.focus_value !== (dashboard.currentFocus || '')) throw new Error(`Public sync verification failed for data/projects/codex-test1.json focus_value: expected "${dashboard.currentFocus}" got "${manifest.focus_value}"`);
  if(manifest.repo_pushed_at !== pushedAt) throw new Error(`Public sync verification failed for data/projects/codex-test1.json repo_pushed_at: expected "${pushedAt}" got "${manifest.repo_pushed_at}"`);
  if(manifest.project_page_path !== 'codex-test1.html') throw new Error(`Public sync verification failed for data/projects/codex-test1.json project_page_path`);
  if(manifest.dashboard_url !== 'https://sgwoods.github.io/Codex-Test1/release-dashboard.html') throw new Error(`Public sync verification failed for data/projects/codex-test1.json dashboard_url`);
  if(manifest.experience_url !== 'https://sgwoods.github.io/Codex-Test1/') throw new Error(`Public sync verification failed for data/projects/codex-test1.json experience_url`);

  console.log(`Verified public project page and status manifest match ${buildInfo.version} ${expectedShaFragment}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

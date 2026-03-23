#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BUILD_INFO = path.join(ROOT, 'build-info.json');
const RELEASE_DASHBOARD = path.join(ROOT, 'release-dashboard.json');
const CANONICAL_PROJECT_SLUG = 'aurora-galactica';
const LEGACY_PROJECT_SLUG = 'codex-test1';
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
      'User-Agent': 'Aurora-Galactica-public-verify'
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
  const expectedFocus = dashboard.currentFocus || '';
  const projectHtml = await getContent(`${CANONICAL_PROJECT_SLUG}.html`);
  const legacyProjectHtml = await getContent(`${LEGACY_PROJECT_SLUG}.html`);
  const manifest = JSON.parse(await getContent(`data/projects/${CANONICAL_PROJECT_SLUG}.json`));
  const legacyManifest = JSON.parse(await getContent(`data/projects/${LEGACY_PROJECT_SLUG}.json`));

  ensureIncludes(projectHtml, `<span class="metaValue">${dateLong}</span>`, `public/${CANONICAL_PROJECT_SLUG}.html date`);
  ensureIncludes(projectHtml, expectedShaFragment, `public/${CANONICAL_PROJECT_SLUG}.html build sha`);
  ensureIncludes(projectHtml, 'release-dashboard.html', `public/${CANONICAL_PROJECT_SLUG}.html dashboard link`);
  ensureIncludes(projectHtml, 'project-guide.html', `public/${CANONICAL_PROJECT_SLUG}.html project guide link`);
  ensureIncludes(legacyProjectHtml, expectedShaFragment, `public/${LEGACY_PROJECT_SLUG}.html build sha`);

  if(manifest.schema_version !== '1.0') throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json schema_version: expected "1.0" got "${manifest.schema_version}"`);
  if(manifest.project_id !== CANONICAL_PROJECT_SLUG) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json project_id: expected "${CANONICAL_PROJECT_SLUG}" got "${manifest.project_id}"`);
  if(manifest.status_value !== buildInfo.version) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json status_value: expected "${buildInfo.version}" got "${manifest.status_value}"`);
  if(manifest.focus_value !== expectedFocus) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json focus_value: expected "${expectedFocus}" got "${manifest.focus_value}"`);
  if(manifest.repo_pushed_at !== pushedAt) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json repo_pushed_at: expected "${pushedAt}" got "${manifest.repo_pushed_at}"`);
  if(manifest.project_page_path !== `${CANONICAL_PROJECT_SLUG}.html`) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json project_page_path`);
  if(manifest.dashboard_url !== 'https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html') throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json dashboard_url`);
  if(manifest.experience_url !== 'https://sgwoods.github.io/Aurora-Galactica/') throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json experience_url`);

  if(legacyManifest.schema_version !== '1.0') throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json schema_version: expected "1.0" got "${legacyManifest.schema_version}"`);
  if(legacyManifest.project_id !== LEGACY_PROJECT_SLUG) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json project_id: expected "${LEGACY_PROJECT_SLUG}" got "${legacyManifest.project_id}"`);
  if(legacyManifest.status_value !== buildInfo.version) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json status_value: expected "${buildInfo.version}" got "${legacyManifest.status_value}"`);
  if(legacyManifest.focus_value !== expectedFocus) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json focus_value: expected "${expectedFocus}" got "${legacyManifest.focus_value}"`);
  if(legacyManifest.repo_pushed_at !== pushedAt) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json repo_pushed_at: expected "${pushedAt}" got "${legacyManifest.repo_pushed_at}"`);
  if(legacyManifest.project_page_path !== `${LEGACY_PROJECT_SLUG}.html`) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json project_page_path`);
  if(legacyManifest.dashboard_url !== 'https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html') throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json dashboard_url`);
  if(legacyManifest.experience_url !== 'https://sgwoods.github.io/Aurora-Galactica/') throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json experience_url`);

  console.log(`Verified Aurora canonical and legacy public assets match ${buildInfo.version} ${expectedShaFragment}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

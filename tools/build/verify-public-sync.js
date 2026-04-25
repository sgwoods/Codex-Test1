#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT, PRODUCTION_BUILD_INFO } = require('./paths');

const BUILD_INFO = PRODUCTION_BUILD_INFO;
const RELEASE_DASHBOARD = path.join(ROOT, 'release-dashboard.json');
const CANONICAL_PROJECT_SLUG = 'aurora-galactica';
const LEGACY_PROJECT_SLUG = 'codex-test1';
const OWNER = process.env.PUBLIC_REPO_OWNER || 'sgwoods';
const REPO = process.env.PUBLIC_REPO_NAME || 'public';
const TOKEN = process.env.PUBLIC_REPO_SYNC_TOKEN || process.env.GH_TOKEN || loadGhToken();
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const RAW_ROOT = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main`;
const RENDERED_ROOT = `https://${OWNER}.github.io/${REPO}`;

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

async function fetchText(url){
  const res = await fetch(url, {
    headers: {
      'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8',
      'User-Agent': 'Aurora-Galactica-public-verify'
    }
  });
  if(!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextEventually(url, requiredBits, context, attempts = 10, delayMs = 3000){
  let last = '';
  for(let attempt = 0; attempt < attempts; attempt += 1){
    last = await fetchText(url);
    if(requiredBits.every((needle) => last.includes(needle))){
      return last;
    }
    if(attempt < attempts - 1){
      await sleep(delayMs);
    }
  }
  throw new Error(`Public sync verification failed for ${context}: missing ${requiredBits.map((needle) => `"${needle}"`).join(', ')}`);
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
  const releaseStamp = buildInfo.builtAtEt || buildInfo.released || publicDateLong(pushedAt);
  const expectedFocus = dashboard.currentFocus || '';
  const expectedMarker = `public-sync: release=${buildInfo.version} label=${buildInfo.label} commit=${buildInfo.commit}`;
  const expectedRootRelease = `<strong>Current release</strong> ${buildInfo.version}`;
  const expectedRootFocus = `<strong>Current focus</strong> ${expectedFocus}`;
  const projectHtml = await getContent(`${CANONICAL_PROJECT_SLUG}.html`);
  const legacyProjectHtml = await getContent(`${LEGACY_PROJECT_SLUG}.html`);
  const rawProjectHtml = await fetchText(`${RAW_ROOT}/${CANONICAL_PROJECT_SLUG}.html?cb=${Date.now()}`);
  const rawLegacyProjectHtml = await fetchText(`${RAW_ROOT}/${LEGACY_PROJECT_SLUG}.html?cb=${Date.now()}`);
  const renderedProjectHtml = await fetchTextEventually(
    `${RENDERED_ROOT}/${CANONICAL_PROJECT_SLUG}.html?cb=${Date.now()}`,
    [`<span class="metaValue">${buildInfo.version}</span>`, expectedFocus, expectedMarker],
    `rendered ${CANONICAL_PROJECT_SLUG}.html`
  );
  const renderedLegacyProjectHtml = await fetchTextEventually(
    `${RENDERED_ROOT}/${LEGACY_PROJECT_SLUG}.html?cb=${Date.now()}`,
    [`<span class="metaValue">${buildInfo.version}</span>`, expectedMarker],
    `rendered ${LEGACY_PROJECT_SLUG}.html`
  );
  const rawRootHtml = await fetchText(`${RAW_ROOT}/index.html?cb=${Date.now()}`);
  const renderedRootHtml = await fetchTextEventually(
    `${RENDERED_ROOT}/?cb=${Date.now()}`,
    ['Aurora Galactica', expectedRootRelease, expectedRootFocus],
    'rendered public index'
  );
  const manifest = JSON.parse(await getContent(`data/projects/${CANONICAL_PROJECT_SLUG}.json`));
  const legacyManifest = JSON.parse(await getContent(`data/projects/${LEGACY_PROJECT_SLUG}.json`));

  ensureIncludes(projectHtml, `<span class="metaValue">${releaseStamp}</span>`, `public/${CANONICAL_PROJECT_SLUG}.html release stamp`);
  ensureIncludes(projectHtml, `<span class="metaValue">${buildInfo.version}</span>`, `public/${CANONICAL_PROJECT_SLUG}.html release version`);
  ensureIncludes(projectHtml, expectedFocus, `public/${CANONICAL_PROJECT_SLUG}.html current focus`);
  ensureIncludes(projectHtml, 'release-dashboard.html', `public/${CANONICAL_PROJECT_SLUG}.html dashboard link`);
  ensureIncludes(projectHtml, 'project-guide.html', `public/${CANONICAL_PROJECT_SLUG}.html project guide link`);
  ensureIncludes(projectHtml, expectedMarker, `public/${CANONICAL_PROJECT_SLUG}.html provenance marker`);
  ensureIncludes(legacyProjectHtml, `<span class="metaValue">${buildInfo.version}</span>`, `public/${LEGACY_PROJECT_SLUG}.html release version`);
  ensureIncludes(legacyProjectHtml, expectedFocus, `public/${LEGACY_PROJECT_SLUG}.html current focus`);
  ensureIncludes(legacyProjectHtml, expectedMarker, `public/${LEGACY_PROJECT_SLUG}.html provenance marker`);
  ensureIncludes(rawProjectHtml, `<span class="metaValue">${buildInfo.version}</span>`, `raw ${CANONICAL_PROJECT_SLUG}.html release version`);
  ensureIncludes(rawProjectHtml, expectedMarker, `raw ${CANONICAL_PROJECT_SLUG}.html provenance marker`);
  ensureIncludes(rawLegacyProjectHtml, `<span class="metaValue">${buildInfo.version}</span>`, `raw ${LEGACY_PROJECT_SLUG}.html release version`);
  ensureIncludes(rawLegacyProjectHtml, expectedMarker, `raw ${LEGACY_PROJECT_SLUG}.html provenance marker`);
  ensureIncludes(rawRootHtml, 'Aurora Galactica', 'raw public index aurora card');
  ensureIncludes(rawRootHtml, expectedRootRelease, 'raw public index release');
  ensureIncludes(rawRootHtml, expectedRootFocus, 'raw public index current focus');
  ensureIncludes(renderedProjectHtml, `<span class="metaValue">${buildInfo.version}</span>`, `rendered ${CANONICAL_PROJECT_SLUG}.html release version`);
  ensureIncludes(renderedProjectHtml, expectedFocus, `rendered ${CANONICAL_PROJECT_SLUG}.html current focus`);
  ensureIncludes(renderedProjectHtml, expectedMarker, `rendered ${CANONICAL_PROJECT_SLUG}.html provenance marker`);
  ensureIncludes(renderedLegacyProjectHtml, `<span class="metaValue">${buildInfo.version}</span>`, `rendered ${LEGACY_PROJECT_SLUG}.html release version`);
  ensureIncludes(renderedLegacyProjectHtml, expectedMarker, `rendered ${LEGACY_PROJECT_SLUG}.html provenance marker`);
  ensureIncludes(renderedRootHtml, expectedRootRelease, 'rendered public index release');
  ensureIncludes(renderedRootHtml, expectedRootFocus, 'rendered public index current focus');

  if(manifest.schema_version !== '1.0') throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json schema_version: expected "1.0" got "${manifest.schema_version}"`);
  if(manifest.project_id !== CANONICAL_PROJECT_SLUG) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json project_id: expected "${CANONICAL_PROJECT_SLUG}" got "${manifest.project_id}"`);
  if(manifest.active !== true) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json active: expected true got "${manifest.active}"`);
  if(manifest.status_value !== buildInfo.version) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json status_value: expected "${buildInfo.version}" got "${manifest.status_value}"`);
  if(manifest.focus_value !== expectedFocus) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json focus_value: expected "${expectedFocus}" got "${manifest.focus_value}"`);
  if(manifest.repo_pushed_at !== pushedAt) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json repo_pushed_at: expected "${pushedAt}" got "${manifest.repo_pushed_at}"`);
  if(manifest.source_build_label !== buildInfo.label) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json source_build_label: expected "${buildInfo.label}" got "${manifest.source_build_label}"`);
  if(manifest.source_commit !== buildInfo.commit) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json source_commit: expected "${buildInfo.commit}" got "${manifest.source_commit}"`);
  if(manifest.project_page_path !== `${CANONICAL_PROJECT_SLUG}.html`) throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json project_page_path`);
  if(manifest.dashboard_url !== 'https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html') throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json dashboard_url`);
  if(manifest.experience_url !== 'https://sgwoods.github.io/Aurora-Galactica/') throw new Error(`Public sync verification failed for data/projects/${CANONICAL_PROJECT_SLUG}.json experience_url`);

  if(legacyManifest.schema_version !== '1.0') throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json schema_version: expected "1.0" got "${legacyManifest.schema_version}"`);
  if(legacyManifest.project_id !== LEGACY_PROJECT_SLUG) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json project_id: expected "${LEGACY_PROJECT_SLUG}" got "${legacyManifest.project_id}"`);
  if(legacyManifest.active !== false) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json active: expected false got "${legacyManifest.active}"`);
  if(legacyManifest.status_value !== buildInfo.version) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json status_value: expected "${buildInfo.version}" got "${legacyManifest.status_value}"`);
  if(legacyManifest.focus_value !== expectedFocus) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json focus_value: expected "${expectedFocus}" got "${legacyManifest.focus_value}"`);
  if(legacyManifest.repo_pushed_at !== pushedAt) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json repo_pushed_at: expected "${pushedAt}" got "${legacyManifest.repo_pushed_at}"`);
  if(legacyManifest.source_build_label !== buildInfo.label) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json source_build_label: expected "${buildInfo.label}" got "${legacyManifest.source_build_label}"`);
  if(legacyManifest.source_commit !== buildInfo.commit) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json source_commit: expected "${buildInfo.commit}" got "${legacyManifest.source_commit}"`);
  if(legacyManifest.project_page_path !== `${LEGACY_PROJECT_SLUG}.html`) throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json project_page_path`);
  if(legacyManifest.dashboard_url !== 'https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html') throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json dashboard_url`);
  if(legacyManifest.experience_url !== 'https://sgwoods.github.io/Aurora-Galactica/') throw new Error(`Public sync verification failed for data/projects/${LEGACY_PROJECT_SLUG}.json experience_url`);

  console.log(`Verified Aurora canonical and legacy public assets match release ${buildInfo.version} stamped ${releaseStamp}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

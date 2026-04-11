#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { ROOT, PRODUCTION_BUILD_INFO } = require('./paths');
const {
  checkGitClean,
  checkProductionCheckoutCurrent,
  checkPublicProjectTemplate
} = require('./check-publish-ready');

const BUILD_INFO = PRODUCTION_BUILD_INFO;
const RELEASE_NOTES = path.join(ROOT, 'release-notes.json');
const RELEASE_DASHBOARD = path.join(ROOT, 'release-dashboard.json');
const PROJECT_TEMPLATE = path.join(ROOT, 'src', 'public', 'aurora-galactica.template.html');
const CANONICAL_PROJECT_SLUG = 'aurora-galactica';
const LEGACY_PROJECT_SLUG = 'codex-test1';

const OWNER = process.env.PUBLIC_REPO_OWNER || 'sgwoods';
const REPO = process.env.PUBLIC_REPO_NAME || 'public';
const TOKEN = process.env.PUBLIC_REPO_SYNC_TOKEN || process.env.GH_TOKEN || loadGhToken();
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const LIVE_PRODUCTION_BUILD_INFO_URL = 'https://sgwoods.github.io/Aurora-Galactica/build-info.json';

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

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

async function fetchJson(url){
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Aurora-Galactica-public-sync'
    }
  });
  if(!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.json();
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

function fill(template, tokens){
  return Object.entries(tokens).reduce(
    (out, [key, value]) => out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    template
  );
}

function sha256(text){
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function publicDateLong(source){
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(source));
}

function request(url, options = {}){
  if(!TOKEN){
    console.log('Skipping public-pages sync: no PUBLIC_REPO_SYNC_TOKEN or gh auth token available.');
    process.exit(0);
  }
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Aurora-Galactica-public-sync',
      ...(options.headers || {})
    }
  });
}

async function getContent(filePath){
  const res = await request(`${API_ROOT}/${filePath}`);
  if(res.status === 404) return null;
  if(!res.ok)throw new Error(`Failed to fetch ${filePath}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function putContent(filePath, content, sha, message){
  const res = await request(`${API_ROOT}/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha
    })
  });
  if(!res.ok){
    const body = await res.text();
    throw new Error(`Failed to update ${filePath}: ${res.status} ${res.statusText} ${body}`);
  }
  return res.json();
}

function buildProjectPage(buildInfo, latestNote, dashboard, pushedAt){
  const template = read(PROJECT_TEMPLATE);
  const syncedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const templateSha = sha256(template).slice(0, 12);
  return fill(template, {
    PUBLIC_DATE_LONG: publicDateLong(pushedAt),
    BUILD_VERSION: buildInfo.version,
    BUILD_RELEASE_ET: buildInfo.builtAtEt || buildInfo.released || '',
    BUILD_LABEL: buildInfo.label,
    PUBLIC_SOURCE_COMMIT: buildInfo.commit,
    PUBLIC_TEMPLATE_SHA: templateSha,
    PUBLIC_SYNCED_AT: syncedAt,
    PUBLIC_CURRENT_FOCUS: dashboard.currentFocus || latestNote.title || 'Active development',
    LATEST_RELEASE_TITLE: latestNote.title,
    LATEST_RELEASE_BODY: latestNote.summary
  }).trimEnd() + '\n';
}

function buildStatusManifest(buildInfo, dashboard, pushedAt, { projectId, projectPagePath, active }, syncedAt, templateSha){
  const latestNote = (readJson(RELEASE_NOTES).notes || [])[0] || buildInfo.latestReleaseNote || {};
  const status = {
    schema_version: '1.0',
    project_id: projectId,
    active,
    display_name: 'Aurora Galactica',
    project_page_path: projectPagePath,
    repo_url: 'https://github.com/sgwoods/Codex-Test1',
    dashboard_url: 'https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html',
    experience_url: 'https://sgwoods.github.io/Aurora-Galactica/',
    repo_pushed_at: pushedAt,
    status_generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    source_build_label: buildInfo.label,
    source_commit: buildInfo.commit,
    source_template_sha: templateSha,
    public_sync_generated_at: syncedAt,
    status_label: 'Current release',
    status_value: buildInfo.version,
    focus_label: 'Current focus',
    focus_value: dashboard.currentFocus || latestNote.title || 'Active development'
  };
  return `${JSON.stringify(status, null, 2)}\n`;
}

async function syncFile(filePath, content, message){
  const remote = await getContent(filePath);
  const current = remote ? Buffer.from(remote.content, 'base64').toString('utf8') : null;
  if(current === content) return false;
  await putContent(filePath, content, remote?.sha, message);
  return true;
}

function ensureGeneratedProjectPageLooksCurrent(projectHtml, buildInfo, dashboard){
  const expectedFocus = dashboard.currentFocus || '';
  const requiredBits = [
    `public-sync: release=${buildInfo.version}`,
    `label=${buildInfo.label}`,
    `commit=${buildInfo.commit}`,
    `<span class="metaValue">${buildInfo.version}</span>`,
    expectedFocus
  ];
  for(const needle of requiredBits){
    if(!needle) continue;
    if(!projectHtml.includes(needle)){
      throw new Error(`Refusing to sync public pages: generated project HTML is missing "${needle}" and does not look current.`);
    }
  }
}

async function main(){
  checkGitClean();
  checkProductionCheckoutCurrent();
  checkPublicProjectTemplate();
  const buildInfo = readJson(BUILD_INFO);
  if(buildInfo.dirty && process.env.ALLOW_DIRTY_PUBLIC_SYNC !== '1'){
    throw new Error('Refusing to sync public pages from a dirty local build. Commit or rebuild from a clean tree first, or set ALLOW_DIRTY_PUBLIC_SYNC=1 to override.');
  }
  const liveProduction = await fetchJson(LIVE_PRODUCTION_BUILD_INFO_URL);
  if(
    liveProduction.label !== buildInfo.label ||
    liveProduction.commit !== buildInfo.commit ||
    liveProduction.releaseChannel !== buildInfo.releaseChannel
  ){
    throw new Error(
      `Refusing to sync public pages from local dist/production ${buildInfo.label}; ` +
      `live production is ${liveProduction.label}. Refresh local production so it matches the live production lane, ` +
      'or complete a new production publish before syncing public.'
    );
  }
  const releaseNotes = readJson(RELEASE_NOTES);
  const dashboard = readJson(RELEASE_DASHBOARD);
  const latestNote = (releaseNotes.notes && releaseNotes.notes[0]) || buildInfo.latestReleaseNote || {
    title: 'No release note yet',
    summary: 'No release summary available for this build.'
  };
  const pushedAt = repoPushedAt(buildInfo);
  const syncedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const templateSha = sha256(read(PROJECT_TEMPLATE)).slice(0, 12);
  const projectHtml = buildProjectPage(buildInfo, latestNote, dashboard, pushedAt);
  ensureGeneratedProjectPageLooksCurrent(projectHtml, buildInfo, dashboard);
  const canonicalStatusManifest = buildStatusManifest(buildInfo, dashboard, pushedAt, {
    projectId: CANONICAL_PROJECT_SLUG,
    projectPagePath: `${CANONICAL_PROJECT_SLUG}.html`,
    active: true
  }, syncedAt, templateSha);
  const legacyStatusManifest = buildStatusManifest(buildInfo, dashboard, pushedAt, {
    projectId: LEGACY_PROJECT_SLUG,
    projectPagePath: `${LEGACY_PROJECT_SLUG}.html`,
    active: false
  }, syncedAt, templateSha);

  const changedCanonicalProject = await syncFile(
    `${CANONICAL_PROJECT_SLUG}.html`,
    projectHtml,
    `Sync Aurora Galactica public page from ${buildInfo.label}`
  );
  const changedLegacyProject = await syncFile(
    `${LEGACY_PROJECT_SLUG}.html`,
    projectHtml,
    `Keep legacy public page alias current for Aurora Galactica from ${buildInfo.label}`
  );
  const changedCanonicalManifest = await syncFile(
    `data/projects/${CANONICAL_PROJECT_SLUG}.json`,
    canonicalStatusManifest,
    'Update public status manifest for Aurora Galactica'
  );
  const changedLegacyManifest = await syncFile(
    `data/projects/${LEGACY_PROJECT_SLUG}.json`,
    legacyStatusManifest,
    'Keep legacy public status alias current for Aurora Galactica'
  );

  if(!changedCanonicalProject && !changedLegacyProject && !changedCanonicalManifest && !changedLegacyManifest){
    console.log(`Public Aurora canonical and legacy alias assets already match ${buildInfo.label}`);
    return;
  }
  console.log(`Synced Aurora Galactica canonical and legacy public assets to ${OWNER}/${REPO} from ${buildInfo.label}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

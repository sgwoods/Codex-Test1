#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BUILD_INFO = path.join(ROOT, 'build-info.json');
const RELEASE_NOTES = path.join(ROOT, 'release-notes.json');
const PROJECT_TEMPLATE = path.join(ROOT, 'src', 'public', 'codex-test1.template.html');

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

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function fill(template, tokens){
  return Object.entries(tokens).reduce(
    (out, [key, value]) => out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    template
  );
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
      'User-Agent': 'Codex-Test1-public-sync',
      ...(options.headers || {})
    }
  });
}

async function getContent(filePath){
  const res = await request(`${API_ROOT}/${filePath}`);
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

function buildProjectPage(buildInfo, latestNote){
  const template = read(PROJECT_TEMPLATE);
  return fill(template, {
    PUBLIC_DATE_LONG: publicDateLong(buildInfo),
    BUILD_VERSION: buildInfo.version,
    BUILD_LABEL: buildInfo.label,
    LATEST_RELEASE_TITLE: latestNote.title,
    LATEST_RELEASE_BODY: latestNote.summary
  }).trimEnd() + '\n';
}

function updateIndexHtml(indexHtml, buildInfo){
  const dateLong = publicDateLong(buildInfo);
  const releaseLine = `Public project page for the Neo Galaga Tribute web application. Last repo update: ${dateLong}. Current release: ${buildInfo.version}. Live experience: https://sgwoods.github.io/Codex-Test1/`;
  let out = indexHtml;
  out = out.replace(
    /<p class="note">\s*Repository work last updated:[\s\S]*?<\/p>/,
    `<p class="note">\n        Repository work last updated: ${dateLong}.\n    </p>`
  );
  out = out.replace(
    /<a href="codex-test1\.html">Codex-Test1 game project<\/a>\s*<span class="label">[\s\S]*?<\/span>/,
    `<a href="codex-test1.html">Codex-Test1 game project</a>\n            <span class="label">${releaseLine}</span>`
  );
  return out.endsWith('\n') ? out : `${out}\n`;
}

async function main(){
  const buildInfo = readJson(BUILD_INFO);
  const releaseNotes = readJson(RELEASE_NOTES);
  const latestNote = (releaseNotes.notes && releaseNotes.notes[0]) || buildInfo.latestReleaseNote || {
    title: 'No release note yet',
    summary: 'No release summary available for this build.'
  };

  const projectRemote = await getContent('codex-test1.html');
  const indexRemote = await getContent('index.html');

  const projectHtml = buildProjectPage(buildInfo, latestNote);
  const indexHtml = updateIndexHtml(Buffer.from(indexRemote.content, 'base64').toString('utf8'), buildInfo);

  await putContent(
    'codex-test1.html',
    projectHtml,
    projectRemote.sha,
    `Sync Codex-Test1 public page from ${buildInfo.label}`
  );
  await putContent(
    'index.html',
    indexHtml,
    indexRemote.sha,
    `Sync Codex-Test1 index metadata from ${buildInfo.label}`
  );

  console.log(`Synced public pages to ${OWNER}/${REPO} from ${buildInfo.label}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

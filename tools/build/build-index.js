#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'));

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const SCRIPT_DIR = path.join(SRC, 'js');
const TEMPLATE = path.join(SRC, 'index.template.html');
const STYLES = path.join(SRC, 'styles.css');
const RELEASE_NOTES = path.join(ROOT, 'release-notes.json');
const OUT = path.join(ROOT, 'index.html');
const BUILD_INFO_OUT = path.join(ROOT, 'build-info.json');

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function fillBuildTokens(input, tokens){
  return Object.entries(tokens).reduce(
    (out, [key, value]) => out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    input
  );
}

function loadReleaseNotes(){
  try{
    const raw = JSON.parse(read(RELEASE_NOTES));
    return Array.isArray(raw.notes) ? raw.notes : [];
  }catch{
    return [];
  }
}

function git(args, fallback = ''){
  try{
    return execSync(`git -C "${ROOT}" ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function build(){
  const template = read(TEMPLATE);
  const styles = read(STYLES).trimEnd();
  const buildVersion = pkg.version;
  const buildCommit = git('rev-parse HEAD', 'unknown');
  const buildShortCommit = git('rev-parse --short HEAD', 'unknown');
  const buildBranch = git('branch --show-current', 'detached');
  const buildDirtyFiles = git('status --porcelain', '').split('\n').map(s => s.trim()).filter(Boolean);
  const buildDirty = buildDirtyFiles.length > 0;
  const buildNumber = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || git('rev-list --count HEAD', '0');
  const buildLabel = `${buildVersion}+build.${buildNumber}.sha.${buildShortCommit}${buildDirty ? '.dirty' : ''}`;
  const buildState = `${buildBranch}@${buildShortCommit}${buildDirty ? ' dirty' : ' clean'}`;
  const buildUtc = new Date().toISOString();
  const buildReleaseEt = new Intl.DateTimeFormat('en-US',{
    timeZone:'America/New_York',
    year:'numeric',
    month:'short',
    day:'2-digit',
    hour:'numeric',
    minute:'2-digit',
    hour12:true,
    timeZoneName:'short'
  }).format(new Date()).replace(',', '');
  const releaseNotes = loadReleaseNotes();
  const latestNote = releaseNotes[0] || {
    title: 'No release notes yet',
    summary: 'This build has stamped identity, but no human-written note has been added yet.'
  };
  const tokens = {
    BUILD_VERSION: buildVersion,
    BUILD_LABEL: buildLabel,
    BUILD_COMMIT: buildCommit,
    BUILD_BRANCH: buildBranch,
    BUILD_DIRTY: buildDirty ? 'true' : 'false',
    BUILD_RELEASE_ET: buildReleaseEt,
    BUILD_STATE: buildState,
    LATEST_RELEASE_TITLE: latestNote.title,
    LATEST_RELEASE_BODY: latestNote.summary
  };
  const script = fs.readdirSync(SCRIPT_DIR)
    .filter(file => file.endsWith('.js'))
    .sort()
    .map(file => `// Source: src/js/${file}\n${read(path.join(SCRIPT_DIR, file)).trimEnd()}`)
    .join('\n\n')
    .replace(/\r\n/g, '\n');
  const builtScript = fillBuildTokens(script, tokens)
    .trimEnd();

  const html = fillBuildTokens(template, tokens)
    .replace('{{INLINE_STYLES}}', `/* Generated from src/styles.css */\n${styles}`)
    .replace('{{INLINE_SCRIPT}}', `// Generated from src/js/*.js\n${builtScript}`);

  const buildInfo = {
    version: buildVersion,
    label: buildLabel,
    buildNumber,
    commit: buildCommit,
    shortCommit: buildShortCommit,
    branch: buildBranch,
    dirty: buildDirty,
    dirtyFiles: buildDirtyFiles,
    builtAtUtc: buildUtc,
    builtAtEt: buildReleaseEt,
    latestReleaseNote: latestNote
  };

  fs.writeFileSync(OUT, html.endsWith('\n') ? html : `${html}\n`);
  fs.writeFileSync(BUILD_INFO_OUT, JSON.stringify(buildInfo, null, 2) + '\n');
  return OUT;
}

const out = build();
console.log(`Built ${out}`);

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  DIST_BETA,
  DIST_PRODUCTION,
  BETA_BUILD_INFO,
  BETA_APPROVED_BUILD_INFO,
  PRODUCTION_BUILD_INFO
} = require('./paths');
const { checkGitClean } = require('./check-publish-ready');
const { assertReleaseAuthority, assertReleaseMainCurrent } = require('./release-authority');
const { productionFiles } = require('./lane-files');
const { selectReleaseNoteForBuild } = require('./release-note-selection');

const FILES = productionFiles(DIST_BETA);
const RELEASE_NOTES = path.join(ROOT, 'release-notes.json');

function normalizeProductionVersion(version){
  return String(version || '').replace(/-(alpha|beta|rc)(\.[0-9]+)?$/, '');
}

function slugify(value=''){
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96) || 'release-note';
}

function releaseNoteAnchor(note, index = 0){
  const stem = [note?.date, note?.version, note?.title].filter(Boolean).join('-');
  return `release-note-${slugify(stem || `item-${index + 1}`)}`;
}

function releaseNoteGitHubHref(commit, note){
  const sourceDoc = String(note?.sourceDoc || '').trim();
  if(!sourceDoc) return '';
  return `https://github.com/sgwoods/Codex-Test1/blob/${commit}/${sourceDoc}`;
}

function loadReleaseNotes(){
  if(!fs.existsSync(RELEASE_NOTES)) return [];
  try{
    const payload = JSON.parse(fs.readFileSync(RELEASE_NOTES, 'utf8'));
    return Array.isArray(payload.notes) ? payload.notes : [];
  }catch(err){
    return [];
  }
}

function buildProductionInfo(sourceInfo, releaseNote){
  const version = normalizeProductionVersion(sourceInfo.version);
  const sourceState = sourceInfo.state || `${sourceInfo.branch || 'main'}@${sourceInfo.shortCommit}${sourceInfo.dirty ? ' dirty' : ' clean'}`;
  const productionBranch = 'main';
  return {
    ...sourceInfo,
    version,
    versionLine: version,
    versionScheme: 'semver',
    label: `${version}+build.${sourceInfo.buildNumber}.sha.${sourceInfo.shortCommit}`,
    branch: productionBranch,
    state: `${productionBranch}@${sourceInfo.shortCommit} clean`,
    releaseChannel: 'production',
    dirty: false,
    dirtyFiles: [],
    promotedFromState: sourceState,
    latestReleaseNote: releaseNote || sourceInfo.latestReleaseNote || null
  };
}

function escapeRegex(value){
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteProductionText(filePath, sourceInfo, productionInfo, releaseNote){
  if(!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  const sourceNote = sourceInfo.latestReleaseNote || {};
  const productionReleaseNotesHref = 'public-project-page.html#latest-release-note';
  const replacements = [
    [new RegExp(escapeRegex(sourceInfo.label), 'g'), productionInfo.label],
    [new RegExp(`version:'${escapeRegex(sourceInfo.version)}'`, 'g'), `version:'${productionInfo.version}'`],
    [new RegExp(`versionLine:'${escapeRegex(sourceInfo.versionLine || sourceInfo.version)}'`, 'g'), `versionLine:'${productionInfo.versionLine}'`],
    [new RegExp(`branch:'${escapeRegex(sourceInfo.branch || '')}'`, 'g'), `branch:'${productionInfo.branch}'`],
    [/branch:'[^']*'/g, `branch:'${productionInfo.branch}'`],
    [new RegExp(`state:'${escapeRegex(sourceInfo.state || '')}'`, 'g'), `state:'${productionInfo.state}'`],
    [/state:'[^']*'/g, `state:'${productionInfo.state}'`],
    [new RegExp(`releaseChannel:'${escapeRegex(sourceInfo.releaseChannel)}'`, 'g'), `releaseChannel:'${productionInfo.releaseChannel}'`],
    [new RegExp(`dirty:${sourceInfo.dirty ? 'true' : 'false'}`, 'g'), 'dirty:false'],
    [new RegExp(`Version ${escapeRegex(sourceInfo.label)}`, 'g'), `Version ${productionInfo.label}`],
    [new RegExp(`Lane ${escapeRegex(sourceInfo.releaseChannel)}`, 'g'), `Lane ${productionInfo.releaseChannel}`],
    [/Beta lane Project Page/g, 'Production lane Project Page'],
    [/Beta lane<\/span>/g, 'Production lane</span>'],
    [/Generated from the beta lane artifacts promoted from the reviewed development build\./g, 'Generated from the production lane artifacts that feed the public release path.'],
    [/Beta lane project-page summary generated from promoted lane artifacts\./g, 'Production lane project-page summary generated from approved release artifacts.'],
    [/releases\.html(?=["'])/g, productionReleaseNotesHref]
  ];
  if(releaseNote && releaseNote.title && sourceNote.title){
    replacements.push([new RegExp(escapeRegex(sourceNote.title), 'g'), releaseNote.title]);
  }
  if(releaseNote && releaseNote.summary && sourceNote.summary){
    replacements.push([new RegExp(escapeRegex(sourceNote.summary), 'g'), releaseNote.summary]);
  }
  if(releaseNote && releaseNote.sourceDoc && sourceNote.sourceDoc){
    replacements.push([new RegExp(escapeRegex(sourceNote.sourceDoc), 'g'), releaseNote.sourceDoc]);
  }
  if(sourceNote && sourceNote.sourceDoc){
    replacements.push([
      new RegExp(escapeRegex(`releases.html#${releaseNoteAnchor(sourceNote)}`), 'g'),
      productionReleaseNotesHref
    ]);
  }
  if(releaseNote && releaseNote.sourceDoc){
    replacements.push([
      new RegExp(escapeRegex(`releases.html#${releaseNoteAnchor(releaseNote)}`), 'g'),
      productionReleaseNotesHref
    ]);
  }
  for(const [pattern, replacement] of replacements){
    text = text.replace(pattern, replacement);
  }
  const releaseNotes = loadReleaseNotes();
  for(const [index, note] of releaseNotes.entries()){
    const legacyHref = `releases.html#${releaseNoteAnchor(note, index)}`;
    const sourceHref = releaseNoteGitHubHref(productionInfo.commit, note);
    if(!sourceHref) continue;
    text = text.replace(new RegExp(escapeRegex(legacyHref), 'g'), sourceHref);
  }
  fs.writeFileSync(filePath, text);
}

fs.rmSync(DIST_PRODUCTION, { recursive: true, force: true });
fs.mkdirSync(DIST_PRODUCTION, { recursive: true });

assertReleaseAuthority('promote:production');
assertReleaseMainCurrent('Production promotion');
checkGitClean();

if(!fs.existsSync(BETA_BUILD_INFO)){
  throw new Error('Missing dist/beta/build-info.json. Promote and approve a beta candidate first.');
}
if(!fs.existsSync(BETA_APPROVED_BUILD_INFO)){
  throw new Error('Missing dist/beta/approved-build-info.json. Run "npm run approve:beta" after reviewing the beta candidate.');
}

const betaInfo = JSON.parse(fs.readFileSync(BETA_BUILD_INFO, 'utf8'));
const approvedInfo = JSON.parse(fs.readFileSync(BETA_APPROVED_BUILD_INFO, 'utf8'));
if(betaInfo.label !== approvedInfo.label || betaInfo.commit !== approvedInfo.commit){
  throw new Error(`Approved beta candidate mismatch. Current beta is ${betaInfo.label}, but approved beta is ${approvedInfo.label}. Re-approve the current beta candidate before promoting production.`);
}
if(/\bdirty\b/i.test(betaInfo.promotedFromState || '') || /\bdirty\b/i.test(approvedInfo.promotedFromState || '')){
  throw new Error('Approved beta candidate was promoted from a dirty source state. Rebuild from a clean tree, re-promote beta, and re-approve it before promoting production.');
}

for(const file of FILES){
  const src = file === 'README.md'
    ? path.join(ROOT, file)
    : path.join(DIST_BETA, file);
  if(!fs.existsSync(src)) continue;
  const dest = path.join(DIST_PRODUCTION, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if(fs.existsSync(BETA_BUILD_INFO)){
  const sourceInfo = betaInfo;
  const releaseNotes = loadReleaseNotes();
  const productionPreview = buildProductionInfo(sourceInfo, null);
  const selectedReleaseNote = selectReleaseNoteForBuild(releaseNotes, productionPreview, { lane: 'production' });
  const productionInfo = buildProductionInfo(sourceInfo, selectedReleaseNote);
  productionInfo.promotedFromApprovedBeta = approvedInfo.label;
  productionInfo.promotedFromApprovedAt = approvedInfo.approvedAt || '';
  fs.writeFileSync(PRODUCTION_BUILD_INFO, JSON.stringify(productionInfo, null, 2) + '\n');
  rewriteProductionText(path.join(DIST_PRODUCTION, 'index.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'project-guide.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'release-notes.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'white-paper.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'application-guide.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'platinum-guide.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'player-guide.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'ingestion-dashboard.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'ingestion-dashboard-data.json'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'release-dashboard.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'conformance-dashboard.html'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'conformance-dashboard-data.json'), sourceInfo, productionInfo, selectedReleaseNote);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'public-project-page.html'), sourceInfo, productionInfo, selectedReleaseNote);
}

console.log(`Promoted approved beta artifacts to ${DIST_PRODUCTION}`);

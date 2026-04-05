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

const FILES = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'player-guide.html',
  'build-info.json',
  'release-notes.json',
  'README.md',
  'export.mov.png',
  'assets/platinum-platform-mark.png',
  'assets/galaxy-guardians-coming-soon.png'
];

function normalizeProductionVersion(version){
  return String(version || '').replace(/-(alpha|beta|rc)(\.[0-9]+)?$/, '');
}

function buildProductionInfo(sourceInfo){
  const version = normalizeProductionVersion(sourceInfo.version);
  const sourceState = sourceInfo.state || `${sourceInfo.branch || 'main'}@${sourceInfo.shortCommit}${sourceInfo.dirty ? ' dirty' : ' clean'}`;
  return {
    ...sourceInfo,
    version,
    label: `${version}+build.${sourceInfo.buildNumber}.sha.${sourceInfo.shortCommit}`,
    state: `${sourceInfo.branch || 'main'}@${sourceInfo.shortCommit} clean`,
    releaseChannel: 'production',
    dirty: false,
    dirtyFiles: [],
    promotedFromState: sourceState
  };
}

function escapeRegex(value){
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteProductionText(filePath, sourceInfo, productionInfo){
  if(!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  const replacements = [
    [new RegExp(escapeRegex(sourceInfo.label), 'g'), productionInfo.label],
    [new RegExp(`version:'${escapeRegex(sourceInfo.version)}'`, 'g'), `version:'${productionInfo.version}'`],
    [new RegExp(`state:'${escapeRegex(sourceInfo.state || '')}'`, 'g'), `state:'${productionInfo.state}'`],
    [new RegExp(`releaseChannel:'${escapeRegex(sourceInfo.releaseChannel)}'`, 'g'), `releaseChannel:'${productionInfo.releaseChannel}'`],
    [new RegExp(`dirty:${sourceInfo.dirty ? 'true' : 'false'}`, 'g'), 'dirty:false'],
    [new RegExp(`Version ${escapeRegex(sourceInfo.label)}`, 'g'), `Version ${productionInfo.label}`],
    [new RegExp(`Lane ${escapeRegex(sourceInfo.releaseChannel)}`, 'g'), `Lane ${productionInfo.releaseChannel}`]
  ];
  for(const [pattern, replacement] of replacements){
    text = text.replace(pattern, replacement);
  }
  fs.writeFileSync(filePath, text);
}

fs.rmSync(DIST_PRODUCTION, { recursive: true, force: true });
fs.mkdirSync(DIST_PRODUCTION, { recursive: true });

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

for(const file of FILES){
  const src = file === 'release-notes.json' || file === 'README.md'
    ? path.join(ROOT, file)
    : path.join(DIST_BETA, file);
  if(!fs.existsSync(src)) continue;
  const dest = path.join(DIST_PRODUCTION, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if(fs.existsSync(BETA_BUILD_INFO)){
  const sourceInfo = betaInfo;
  const productionInfo = buildProductionInfo(sourceInfo);
  productionInfo.promotedFromApprovedBeta = approvedInfo.label;
  productionInfo.promotedFromApprovedAt = approvedInfo.approvedAt || '';
  fs.writeFileSync(PRODUCTION_BUILD_INFO, JSON.stringify(productionInfo, null, 2) + '\n');
  rewriteProductionText(path.join(DIST_PRODUCTION, 'index.html'), sourceInfo, productionInfo);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'project-guide.html'), sourceInfo, productionInfo);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'player-guide.html'), sourceInfo, productionInfo);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'release-dashboard.html'), sourceInfo, productionInfo);
}

console.log(`Promoted approved beta artifacts to ${DIST_PRODUCTION}`);

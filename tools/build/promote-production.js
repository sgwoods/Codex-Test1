#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  DIST_DEV,
  DIST_PRODUCTION,
  DEV_BUILD_INFO,
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
  'export.mov.png'
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

for(const file of FILES){
  const src = file === 'release-notes.json' || file === 'README.md'
    ? path.join(ROOT, file)
    : path.join(DIST_DEV, file);
  if(!fs.existsSync(src)) continue;
  fs.copyFileSync(src, path.join(DIST_PRODUCTION, path.basename(file)));
}

if(fs.existsSync(DEV_BUILD_INFO) && fs.existsSync(PRODUCTION_BUILD_INFO)){
  const sourceInfo = JSON.parse(fs.readFileSync(DEV_BUILD_INFO, 'utf8'));
  const productionInfo = buildProductionInfo(sourceInfo);
  fs.writeFileSync(PRODUCTION_BUILD_INFO, JSON.stringify(productionInfo, null, 2) + '\n');
  rewriteProductionText(path.join(DIST_PRODUCTION, 'index.html'), sourceInfo, productionInfo);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'project-guide.html'), sourceInfo, productionInfo);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'player-guide.html'), sourceInfo, productionInfo);
  rewriteProductionText(path.join(DIST_PRODUCTION, 'release-dashboard.html'), sourceInfo, productionInfo);
}

console.log(`Promoted current dev artifacts to ${DIST_PRODUCTION}`);

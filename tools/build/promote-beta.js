#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BETA_DIR = path.join(ROOT, 'beta');
const ROOT_BUILD_INFO = path.join(ROOT, 'build-info.json');
const BETA_BUILD_INFO = path.join(BETA_DIR, 'build-info.json');
const FILES = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'build-info.json',
  'release-notes.json',
  'export.mov.png',
  'README.md'
];

function toBetaVersion(version){
  if(/-beta(?:\.\d+)?$/.test(version)) return version;
  if(/-alpha(?:\.\d+)?$/.test(version)){
    return version.replace(/-alpha((?:\.\d+)?)$/, '-beta$1');
  }
  return `${version}-beta.1`;
}

function escapeRegex(value){
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBetaInfo(sourceInfo){
  const betaVersion = toBetaVersion(sourceInfo.version);
  const betaLabel = `${betaVersion}+build.${sourceInfo.buildNumber}.sha.${sourceInfo.shortCommit}.beta`;
  const sourceState = sourceInfo.state || `${sourceInfo.branch || 'main'}@${sourceInfo.shortCommit}${sourceInfo.dirty ? ' dirty' : ' clean'}`;
  return {
    ...sourceInfo,
    version: betaVersion,
    label: betaLabel,
    branch: 'beta',
    state: `beta@${sourceInfo.shortCommit} clean`,
    releaseChannel: 'production beta',
    promotedFromState: sourceState,
    dirty: false,
    dirtyFiles: []
  };
}

function rewriteBetaText(filePath, sourceInfo, betaInfo){
  if(!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  const sourceState = sourceInfo.state || `${sourceInfo.branch || 'main'}@${sourceInfo.shortCommit}${sourceInfo.dirty ? ' dirty' : ' clean'}`;
  const sourceChannel = sourceInfo.releaseChannel || 'pre-production';
  const replacements = [
    [new RegExp(escapeRegex(sourceInfo.label), 'g'), betaInfo.label],
    [new RegExp(`version:'${escapeRegex(sourceInfo.version)}'`, 'g'), `version:'${betaInfo.version}'`],
    [new RegExp(`branch:'${escapeRegex(sourceInfo.branch)}'`, 'g'), `branch:'${betaInfo.branch}'`],
    [new RegExp(`state:'${escapeRegex(sourceState)}'`, 'g'), `state:'${betaInfo.state}'`],
    [new RegExp(escapeRegex(sourceState), 'g'), betaInfo.state],
    [new RegExp(`releaseChannel:'${escapeRegex(sourceChannel)}'`, 'g'), `releaseChannel:'${betaInfo.releaseChannel}'`],
    [new RegExp(`dirty:${sourceInfo.dirty ? 'true' : 'false'}`, 'g'), `dirty:${betaInfo.dirty ? 'true' : 'false'}`],
    [new RegExp(`Version ${escapeRegex(sourceInfo.label)}`, 'g'), `Version ${betaInfo.label}`],
    [new RegExp(`Lane ${escapeRegex(sourceChannel)}`, 'g'), `Lane ${betaInfo.releaseChannel}`]
  ];
  for(const [pattern, replacement] of replacements){
    text = text.replace(pattern, replacement);
  }
  fs.writeFileSync(filePath, text);
}

fs.mkdirSync(BETA_DIR, { recursive: true });

for(const file of FILES){
  const src = path.join(ROOT, file);
  if(!fs.existsSync(src)) continue;
  const dest = path.join(BETA_DIR, file === 'index.html' ? 'index.html' : path.basename(file));
  fs.copyFileSync(src, dest);
}

if(fs.existsSync(ROOT_BUILD_INFO) && fs.existsSync(BETA_BUILD_INFO)){
  const sourceInfo = JSON.parse(fs.readFileSync(ROOT_BUILD_INFO, 'utf8'));
  const betaInfo = buildBetaInfo(sourceInfo);
  fs.writeFileSync(BETA_BUILD_INFO, JSON.stringify(betaInfo, null, 2) + '\n');
  rewriteBetaText(path.join(BETA_DIR, 'index.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'project-guide.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'release-dashboard.html'), sourceInfo, betaInfo);
}

const betaReadme = [
  '# Aurora Galactica Beta',
  '',
  'This directory is the manually promoted beta lane.',
  'It is intentionally updated less often than the continuously published alpha build at the repository root.',
  '',
  'Promoted from the current built artifacts with `npm run promote:beta`.'
].join('\n') + '\n';

fs.writeFileSync(path.join(BETA_DIR, 'README.txt'), betaReadme);
console.log(`Promoted current build artifacts to ${BETA_DIR}`);

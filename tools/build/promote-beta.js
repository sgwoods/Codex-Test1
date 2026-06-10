#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  DIST_DEV,
  DIST_BETA,
  DEV_BUILD_INFO,
  BETA_BUILD_INFO
} = require('./paths');
const { betaFiles } = require('./lane-files');

const BETA_DIR = DIST_BETA;
const FILES = betaFiles(DIST_DEV).filter(file => file !== 'README.txt');
const PUBLIC_SECURITY_META = [
  '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; base-uri \'self\'; object-src \'none\'; script-src \'self\' \'unsafe-inline\' https://www.youtube.com https://s.ytimg.com; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob: https:; media-src \'self\' blob: https:; connect-src \'self\' https://*.supabase.co wss://*.supabase.co https://api.web3forms.com; frame-src \'self\' https://www.youtube.com https://www.youtube-nocookie.com; worker-src \'self\' blob:; form-action \'self\' https://api.web3forms.com; upgrade-insecure-requests">',
  '<meta name="referrer" content="strict-origin-when-cross-origin" />'
].join('\n');

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

function stripPublicPrivateReferenceAudioPaths(text){
  const source = String(text || '');
  return source.replace(
    /assets\/reference-audio\/[^\s"'&<>)\\]+\.(?:m4a|mp3|wav|ogg)/g,
    (match, offset) => source.slice(Math.max(0, offset - 4), offset) === 'src/' ? match : ''
  );
}

function stripPublicHarnessDebugSurface(text){
  let source = String(text || '');
  const startNeedle = 'window.__galagaHarness__={';
  const endNeedle = 'window.__platinumHarness__=window.__galagaHarness__;';
  const start = source.indexOf(startNeedle);
  const end = start >= 0 ? source.indexOf(endNeedle, start) : -1;
  if(start >= 0 && end >= 0){
    const endIndex = end + endNeedle.length;
    source = `${source.slice(0, start)}// Browser harness exports omitted from public lanes.\n${source.slice(endIndex).replace(/^\s*\n/, '')}`;
  }
  return source
    .replace(/\n?window\.clearRuntimeLoopFault=clearRuntimeLoopFault;\n/g, '\n')
    .replace(/\n?window\.armRuntimeLoopCrash=armRuntimeLoopCrash;\n/g, '\n');
}

function stripPublicClientScoreWriteSurface(text){
  const source = String(text || '');
  const startNeedle = 'async function submitScoreRemote(entry){';
  const endNeedle = 'function submitGameOverScore(){';
  const start = source.indexOf(startNeedle);
  const end = start >= 0 ? source.indexOf(endNeedle, start) : -1;
  if(start < 0 || end < 0) return source;
  const replacement = `async function submitScoreRemote(entry){
 if(entry&&typeof recordSystemIssue==='function'){
  recordSystemIssue('score_submit_blocked','Remote score submit disabled in public lanes pending server-side validation',{
   score:+entry.score|0,
   stage:+entry.stage|0,
   initials:sanitizeInitials(entry.initials||'YOU').padEnd(3,'-').slice(0,3),
   releaseChannel:RELEASE_CHANNEL
  },{level:'info'});
 }
 setLeaderboardStatus('Saved locally · online submit disabled pending server validation');
 syncLeaderboardUi();
 return 0;
}
`;
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function stripPublicAccountReviewSurface(text){
  return String(text || '')
    .replace(/"auth"\s*:\s*\{\s*"nonProductionTestPilotEmails"\s*:\s*\[[\s\S]*?\]\s*,\s*"nonProductionTestPilotUserIds"\s*:\s*\[[\s\S]*?\]\s*\}/g, '"auth":{"nonProductionTestPilotEmails":[],"nonProductionTestPilotUserIds":[]}')
    .replace(/const TEST_ACCOUNT_EMAIL='[^']*';/g, "const TEST_ACCOUNT_EMAIL='';")
    .replace(/const TEST_ACCOUNT_USER_ID='[^']*';/g, "const TEST_ACCOUNT_USER_ID='';")
    .replace(/const TEST_ACCOUNT_EMAILS=\[[^\]]*\];/g, 'const TEST_ACCOUNT_EMAILS=[];')
    .replace(/const TEST_ACCOUNT_USER_IDS=\[[^\]]*\];/g, 'const TEST_ACCOUNT_USER_IDS=[];')
    .replace(/const NON_PRODUCTION_LANE=RELEASE_CHANNEL!=='production';/g, 'const NON_PRODUCTION_LANE=false;');
}

function publicSafeBetaInfo(info){
  const platform = info.platform && typeof info.platform === 'object'
    ? { ...info.platform }
    : {};
  platform.auth = {
    nonProductionTestPilotEmails: [],
    nonProductionTestPilotUserIds: []
  };
  return {
    ...info,
    platform
  };
}

function addPublicSecurityMeta(html){
  const source = String(html || '');
  if(source.includes('http-equiv="Content-Security-Policy"')) return source;
  return source.replace(/<head>/i, `<head>\n${PUBLIC_SECURITY_META}`);
}

function buildBetaInfo(sourceInfo){
  sourceInfo = publicSafeBetaInfo(sourceInfo);
  const betaVersion = toBetaVersion(sourceInfo.version);
  const betaLabel = `${betaVersion}+build.${sourceInfo.buildNumber}.sha.${sourceInfo.shortCommit}.beta`;
  const sourceState = sourceInfo.state || `${sourceInfo.branch || 'main'}@${sourceInfo.shortCommit}${sourceInfo.dirty ? ' dirty' : ' clean'}`;
  return {
    ...sourceInfo,
    version: betaVersion,
    versionLine: betaVersion,
    versionScheme: 'semver-prerelease',
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
    [new RegExp(`versionLine:'${escapeRegex(sourceInfo.versionLine || sourceInfo.version)}'`, 'g'), `versionLine:'${betaInfo.versionLine}'`],
    [new RegExp(`branch:'${escapeRegex(sourceInfo.branch)}'`, 'g'), `branch:'${betaInfo.branch}'`],
    [new RegExp(`state:'${escapeRegex(sourceState)}'`, 'g'), `state:'${betaInfo.state}'`],
    [new RegExp(escapeRegex(sourceState), 'g'), betaInfo.state],
    [new RegExp(`releaseChannel:'${escapeRegex(sourceChannel)}'`, 'g'), `releaseChannel:'${betaInfo.releaseChannel}'`],
    [new RegExp(`dirty:${sourceInfo.dirty ? 'true' : 'false'}`, 'g'), `dirty:${betaInfo.dirty ? 'true' : 'false'}`],
    [new RegExp(`Version ${escapeRegex(sourceInfo.label)}`, 'g'), `Version ${betaInfo.label}`],
    [new RegExp(`Lane ${escapeRegex(sourceChannel)}`, 'g'), `Lane ${betaInfo.releaseChannel}`],
    [/Development lane Project Page/g, 'Beta lane Project Page'],
    [/Development lane<\/span>/g, 'Beta lane</span>'],
    [/Generated from the development lane artifacts served locally and on hosted \/dev\./g, 'Generated from the beta lane artifacts promoted from the reviewed development build.'],
    [/Development lane project-page summary generated from lane build artifacts\./g, 'Beta lane project-page summary generated from promoted lane artifacts.']
  ];
  for(const [pattern, replacement] of replacements){
    text = text.replace(pattern, replacement);
  }
  text = stripPublicAccountReviewSurface(stripPublicClientScoreWriteSurface(stripPublicHarnessDebugSurface(stripPublicPrivateReferenceAudioPaths(text))));
  if(/\.html$/i.test(filePath)) text = addPublicSecurityMeta(text);
  fs.writeFileSync(filePath, text);
}

fs.rmSync(BETA_DIR, { recursive: true, force: true });
fs.mkdirSync(BETA_DIR, { recursive: true });

for(const file of FILES){
  const src = file === 'README.md'
    ? path.join(ROOT, file)
    : path.join(DIST_DEV, file);
  if(!fs.existsSync(src)) continue;
  const dest = path.join(BETA_DIR, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if(fs.existsSync(DEV_BUILD_INFO)){
  const sourceInfo = JSON.parse(fs.readFileSync(DEV_BUILD_INFO, 'utf8'));
  const betaInfo = buildBetaInfo(sourceInfo);
  fs.writeFileSync(BETA_BUILD_INFO, JSON.stringify(betaInfo, null, 2) + '\n');
  rewriteBetaText(path.join(BETA_DIR, 'index.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'project-guide.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'release-notes.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'white-paper.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'application-guide.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'platinum-guide.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'player-guide.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'ingestion-dashboard.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'ingestion-dashboard-data.json'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'release-notes.json'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'release-dashboard.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'conformance-dashboard.html'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'conformance-dashboard-data.json'), sourceInfo, betaInfo);
  rewriteBetaText(path.join(BETA_DIR, 'public-project-page.html'), sourceInfo, betaInfo);
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

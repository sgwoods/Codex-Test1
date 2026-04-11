#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  ROOT,
  DIST_DEV,
  DIST_PRODUCTION,
  DIST_BETA,
  DEV_BUILD_INFO,
  PRODUCTION_BUILD_INFO,
  BETA_BUILD_INFO,
  BETA_APPROVED_BUILD_INFO
} = require('./paths');
const { devFiles, betaFiles, productionFiles } = require('./lane-files');

const REQUIRED_SOURCE_DOCS = [
  'README.md',
  'PLAN.md',
  'PRODUCT_ROADMAP.md',
  'PLATINUM.md',
  'PLATINUM_ARCHITECTURE_OVERVIEW.md',
  'APPLICATIONS_ON_PLATINUM.md',
  'ARCHITECTURE.md',
  'TESTING_AND_RELEASE_GATES.md',
  'RELEASE_POLICY.md',
  'RELEASE_READINESS_REVIEW.md',
  'PLATINUM_LAUNCH_ART_DIRECTION.md',
  'PLATINUM_LUECK_REVIEW.md',
  'project-guide.json',
  'application-guide.json',
  'platinum-guide.json',
  'player-guide.json',
  'release-dashboard.json',
  'release-notes.json'
];

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function git(args){
  const out = execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return typeof out === 'string' ? out.trim() : '';
}

function checkProductionCheckoutCurrent(){
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if(branch !== 'main'){
    throw new Error(`Publish preflight failed: production release must run from the main branch. Current branch is "${branch}".`);
  }
  try{
    execFileSync('git', ['-C', ROOT, 'fetch', 'origin'], {
      stdio: ['ignore', 'ignore', 'ignore']
    });
  }catch(err){
    throw new Error('Publish preflight failed: unable to fetch origin before production release. Pull/fetch the latest Aurora main on this machine and try again.');
  }
  const head = git(['rev-parse', 'HEAD']);
  const originMain = git(['rev-parse', 'origin/main']);
  if(head !== originMain){
    throw new Error(
      `Publish preflight failed: local main (${head.slice(0, 7)}) is not current with origin/main (${originMain.slice(0, 7)}). ` +
      'Pull the latest Aurora main on this machine, rebuild, and rerun the production release.'
    );
  }
}

function checkPublicProjectTemplate(){
  const templatePath = path.join(ROOT, 'src', 'public', 'aurora-galactica.template.html');
  const template = loadText(templatePath);
  const requiredTokens = ['{{BUILD_VERSION}}', '{{BUILD_RELEASE_ET}}', '{{PUBLIC_CURRENT_FOCUS}}', '{{LATEST_RELEASE_TITLE}}'];
  for(const token of requiredTokens){
    if(!template.includes(token)){
      throw new Error(`Publish preflight failed: ${templatePath} is missing required token ${token}. Restore the current public template before publishing production.`);
    }
  }
  if(/\b0\.5\.0\b/.test(template)){
    throw new Error(`Publish preflight failed: ${templatePath} still contains stale hardcoded release content. Refresh the public template before publishing production.`);
  }
}

function laneConfig(lane){
  if(lane === 'dev'){
    return {
      lane,
      dir: DIST_DEV,
      buildInfo: DEV_BUILD_INFO,
      required: devFiles(DIST_DEV),
      nextStep: 'Run "npm run build" first.'
    };
  }
  if(lane === 'beta'){
    return {
      lane,
      dir: DIST_BETA,
      buildInfo: BETA_BUILD_INFO,
      required: betaFiles(DIST_BETA),
      nextStep: 'Run "npm run build && npm run promote:beta" first.'
    };
  }
  if(lane === 'production'){
    return {
      lane,
      dir: DIST_PRODUCTION,
      buildInfo: PRODUCTION_BUILD_INFO,
      required: productionFiles(DIST_PRODUCTION),
      nextStep: 'Run "npm run build && npm run promote:production" first.'
    };
  }
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseListEnv(value){
  return String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function loadText(file){
  return fs.readFileSync(file, 'utf8');
}

function extractBuiltJsonConstant(html, name){
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`const ${escaped}=([^;]+);`));
  if(!match) return undefined;
  try{
    return JSON.parse(match[1]);
  }catch{
    return undefined;
  }
}

function checkGitClean(){
  const status = git(['status', '--short']);
  if(status){
    throw new Error(`Publish preflight failed: repo is not clean.\n${status}\nCommit or stash changes before publishing.`);
  }
}

function checkArtifacts(cfg){
  if(!fs.existsSync(cfg.dir)){
    throw new Error(`Publish preflight failed: missing ${cfg.dir}. ${cfg.nextStep}`);
  }
  for(const file of cfg.required){
    const full = require('path').join(cfg.dir, file);
    if(!fs.existsSync(full)){
      throw new Error(`Publish preflight failed: missing ${full}. ${cfg.nextStep}`);
    }
  }
  if(!fs.existsSync(cfg.buildInfo)){
    throw new Error(`Publish preflight failed: missing ${cfg.buildInfo}. ${cfg.nextStep}`);
  }
}

function checkSourceDocs(){
  for(const file of REQUIRED_SOURCE_DOCS){
    const full = require('path').join(ROOT, file);
    if(!fs.existsSync(full)){
      throw new Error(`Publish preflight failed: missing required maintained doc ${full}. Restore the source doc before publishing.`);
    }
  }
}

function checkBuildInfo(cfg){
  const info = loadJson(cfg.buildInfo);
  const head = git(['rev-parse', 'HEAD']);
  if(info.dirty){
    throw new Error(`Publish preflight failed: ${cfg.buildInfo} is marked dirty. Rebuild from a clean tree first.`);
  }
  if(info.commit !== head){
    throw new Error(`Publish preflight failed: ${cfg.buildInfo} was built from ${info.shortCommit || info.commit}, but HEAD is ${head.slice(0, 7)}. ${cfg.nextStep}`);
  }
  return info;
}

function checkBetaTestPilotConfig(cfg){
  if(cfg.lane !== 'beta') return;
  const expectedEmails = Array.from(new Set([
    ...parseListEnv(process.env.TEST_ACCOUNT_EMAILS),
    ...parseListEnv(process.env.TEST_ACCOUNT_EMAIL)
  ]));
  if(!expectedEmails.length) return;
  const html = loadText(require('path').join(cfg.dir, 'index.html'));
  const builtEmails = Array.isArray(extractBuiltJsonConstant(html, 'TEST_ACCOUNT_EMAILS'))
    ? extractBuiltJsonConstant(html, 'TEST_ACCOUNT_EMAILS').map((email) => String(email || '').trim().toLowerCase()).filter(Boolean)
    : [];
  const missing = expectedEmails.filter((email) => !builtEmails.includes(email));
  if(missing.length){
    throw new Error(
      `Publish preflight failed: beta artifact is missing expected test pilot config (${missing.join(', ')}). ` +
      `Rebuild with TEST_ACCOUNT_EMAILS set before publishing beta.`
    );
  }
}

function checkApprovedBetaForProduction(productionInfo){
  if(!fs.existsSync(BETA_BUILD_INFO)){
    throw new Error('Publish preflight failed: missing dist/beta/build-info.json. Promote and review beta first.');
  }
  if(!fs.existsSync(BETA_APPROVED_BUILD_INFO)){
    throw new Error('Publish preflight failed: missing dist/beta/approved-build-info.json. Run "npm run approve:beta" after approving the beta candidate.');
  }
  const betaInfo = loadJson(BETA_BUILD_INFO);
  const approvedInfo = loadJson(BETA_APPROVED_BUILD_INFO);
  if(betaInfo.label !== approvedInfo.label || betaInfo.commit !== approvedInfo.commit){
    throw new Error(`Publish preflight failed: approved beta candidate (${approvedInfo.label}) does not match current beta artifacts (${betaInfo.label}). Re-approve the current beta candidate first.`);
  }
  if(/\bdirty\b/i.test(betaInfo.promotedFromState || '') || /\bdirty\b/i.test(approvedInfo.promotedFromState || '')){
    throw new Error('Publish preflight failed: approved beta candidate was promoted from a dirty source state. Rebuild from a clean tree, re-promote beta, and re-approve it before publishing production.');
  }
  if(productionInfo.promotedFromApprovedBeta !== approvedInfo.label){
    throw new Error(`Publish preflight failed: production artifacts were not promoted from the approved beta candidate (${approvedInfo.label}). Run "npm run promote:production" again.`);
  }
}

function checkProductionReleaseDocs(productionInfo){
  const dashboard = loadJson(path.join(ROOT, 'release-dashboard.json'));
  const readiness = loadText(path.join(ROOT, 'RELEASE_READINESS_REVIEW.md'));
  const version = String(productionInfo.version || '');
  const versionStep = Array.isArray(dashboard.timeline)
    ? dashboard.timeline.find((step) => String(step.title || '').includes(version))
    : null;

  if(!versionStep){
    throw new Error(`Publish preflight failed: release-dashboard.json is missing a timeline entry for ${version}. Update the release dashboard before publishing production.`);
  }
  if(versionStep.status !== 'done'){
    throw new Error(`Publish preflight failed: release-dashboard.json still marks ${version} as "${versionStep.status}". Mark the shipped release as done before publishing production.`);
  }
  if(/is the current hosted `\/beta` candidate under review/i.test(readiness)){
    throw new Error('Publish preflight failed: RELEASE_READINESS_REVIEW.md still says a beta candidate is under review. Update the readiness review to reflect the shipped production state before publishing production.');
  }
  if(/Review the hosted `\/beta`/i.test(String(dashboard.currentFocus || ''))){
    throw new Error('Publish preflight failed: release-dashboard.json currentFocus still describes beta review. Update the release dashboard to the shipped production posture before publishing production.');
  }
  if(!readiness.includes(`\`${version}`) || !readiness.includes('currently live on hosted `/production`')){
    throw new Error(`Publish preflight failed: RELEASE_READINESS_REVIEW.md does not clearly describe ${version} as the live hosted /production release. Update it before publishing production.`);
  }
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const cfg = laneConfig(String(args.lane || '').toLowerCase());
  checkGitClean();
  checkSourceDocs();
  checkArtifacts(cfg);
  const info = checkBuildInfo(cfg);
  checkBetaTestPilotConfig(cfg);
  if(cfg.lane === 'production'){
    checkProductionCheckoutCurrent();
    checkPublicProjectTemplate();
    checkApprovedBetaForProduction(info);
    checkProductionReleaseDocs(info);
  }
  console.log(JSON.stringify({
    ok: true,
    lane: cfg.lane,
    dir: cfg.dir,
    label: info.label,
    commit: info.shortCommit || String(info.commit || '').slice(0, 7)
  }, null, 2));
}

if(require.main === module){
  try{
    main();
  } catch(err){
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = {
  laneConfig,
  checkGitClean,
  checkSourceDocs,
  checkArtifacts,
  checkBuildInfo,
  checkProductionReleaseDocs,
  checkProductionCheckoutCurrent,
  checkPublicProjectTemplate
};

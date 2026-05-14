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
const { assertReleaseAuthority, assertReleaseMainCurrent } = require('./release-authority');

const REQUIRED_SOURCE_DOCS = [
  'README.md',
  'PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md',
  'PLAN.md',
  'PRODUCT_ROADMAP.md',
  'PLATINUM.md',
  'PLATINUM_ARCHITECTURE_OVERVIEW.md',
  'APPLICATIONS_ON_PLATINUM.md',
  'ARCHITECTURE.md',
  'TESTING_AND_RELEASE_GATES.md',
  'RELEASE_POLICY.md',
  'CODE_REVIEW_MODEL.md',
  'REVIEW_LEARNING_LEDGER.md',
  'ARCHITECT_REVIEW_RESPONSE.md',
  'review-dispositions.json',
  'RELEASE_READINESS_REVIEW.md',
  'STRATEGIC_BETA_REVIEW.md',
  'RELEASE_CONFORMANCE_DASHBOARD.md',
  'CONFORMANCE_METRICS_OVERVIEW.md',
  'CONFORMANCE_ECONOMICS.md',
  'CLASSIC_ARCADE_INGESTION_FRAMEWORK.md',
  'GAME_CONFORMANCE_CATALOG.md',
  'REFERENCE_MEDIA_INVENTORY.md',
  'ARTIFACT_POLICY.md',
  'AUDIO_CONFORMANCE_LAB.md',
  'QUALITY_RELEASE_SCORECARD.md',
  'PLATINUM_LAUNCH_ART_DIRECTION.md',
  'PLATINUM_LUECK_REVIEW.md',
  'SUPABASE_DATA_API_ACCESS.md',
  'supabase/data-api-access-contract.sql',
  'project-guide.json',
  'application-guide.json',
  'platinum-guide.json',
  'player-guide.json',
  'documentation-provenance.json',
  'release-dashboard.json',
  'release-manifest.json',
  'release-notes.json'
];

const USER_VISIBLE_DOC_FILES = [
  'public-project-page.html',
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'conformance-dashboard.html',
  'conformance-dashboard-data.json',
  'release-dashboard.html'
];

const USER_VISIBLE_SECTIONS = [
  {
    id: 'public-conformance-catalog',
    file: 'public-project-page.html',
    requiredText: [
      'Game conformance catalog',
      'live conformance dashboard game profiles',
      'Open generated game conformance catalog',
      'Open Aurora catalog tables'
    ]
  },
  {
    id: 'public-documentation-provenance',
    file: 'public-project-page.html',
    requiredText: [
      'Documentation provenance',
      'documentation-provenance.json',
      'Persistent Inputs',
      'release-conformance-dashboard/latest.json'
    ]
  },
  {
    id: 'generated-game-catalog',
    file: 'project-guide.html',
    requiredText: [
      'Game Conformance Catalog',
      'Alien And Enemy Index',
      'Audio Cue Index',
      'Stage Index',
      'Persona Index',
      'Documentation Provenance'
    ]
  },
  {
    id: 'aurora-application-catalog',
    file: 'application-guide.html',
    requiredText: [
      'Alien Conformance Index',
      'Audio Conformance Index',
      'Stage Conformance Summary',
      'Testing Personas',
      'Persona Performance Distribution',
      'persona-performance-distribution/latest.json'
    ]
  },
  {
    id: 'platform-persona-contract',
    file: 'platinum-guide.html',
    requiredText: [
      'Platform Persona Contract',
      'What Platinum Owns',
      'What Each Game Owns',
      'Distribution Evidence'
    ]
  }
];

const REQUIRED_VISIBLE_ARTIFACT_FAMILIES = [
  {
    id: 'quality-conformance',
    path: 'reference-artifacts/analyses/quality-conformance',
    meaning: 'quality score rollups that feed release gates'
  },
  {
    id: 'conformance-economics',
    path: 'reference-artifacts/analyses/conformance-economics',
    meaning: 'value-versus-compute charts and resource accounting'
  },
  {
    id: 'aurora-audio-theme-comparison',
    path: 'reference-artifacts/analyses/aurora-audio-theme-comparison',
    meaning: 'audio cue identity and waveform/spectral comparison evidence'
  },
  {
    id: 'aurora-audio-cue-candidates',
    path: 'reference-artifacts/analyses/aurora-audio-cue-candidates',
    meaning: 'candidate cue extraction and segment-selection evidence'
  },
  {
    id: 'aurora-audio-event-gap',
    path: 'reference-artifacts/analyses/aurora-audio-event-gap',
    meaning: 'audio/event feedback gap analysis'
  },
  {
    id: 'alien-entry-challenge-variation',
    path: 'reference-artifacts/analyses/alien-entry-challenge-variation',
    meaning: 'alien entry, challenge-stage novelty, and path-family scoring'
  },
  {
    id: 'formation-boss-grammar-conformance',
    path: 'reference-artifacts/analyses/formation-boss-grammar-conformance',
    meaning: 'boss entry and formation grammar scoring'
  },
  {
    id: 'level-arc-conformance',
    path: 'reference-artifacts/analyses/level-arc-conformance',
    meaning: 'long-play stage shape and encounter progression scoring'
  },
  {
    id: 'persona-performance-distribution',
    path: 'reference-artifacts/analyses/persona-performance-distribution',
    meaning: 'persona distribution score, stage-depth, time, and challenge-hit evidence'
  },
  {
    id: 'aurora-visual-look-conformance',
    path: 'reference-artifacts/analyses/aurora-visual-look-conformance',
    meaning: 'visual look-and-feel conformance scoring'
  },
  {
    id: 'galaxy-guardians-identity',
    path: 'reference-artifacts/analyses/galaxy-guardians-identity',
    meaning: 'second-game ingestion identity, sprite, audio, and movement evidence'
  }
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
  try{
    assertReleaseMainCurrent('Production release');
  }catch(err){
    throw new Error(`Publish preflight failed: ${err.message}`);
  }
}

function checkBetaCheckoutCurrent(){
  try{
    assertReleaseMainCurrent('Beta release');
  }catch(err){
    throw new Error(`Publish preflight failed: ${err.message}`);
  }
}

function checkPublicProjectTemplate(){
  const templatePath = path.join(ROOT, 'src', 'public', 'aurora-galactica.template.html');
  const template = loadText(templatePath);
  const requiredTokens = [
    '{{PUBLIC_PAGE_EYEBROW}}',
    '{{PUBLIC_RELEASE_CONTEXT_VALUE}}',
    '{{PUBLIC_RELEASE_CONTEXT_NOTE}}',
    '{{BUILD_VERSION}}',
    '{{BUILD_RELEASE_ET}}',
    '{{BUILD_LABEL}}',
    '{{PUBLIC_CURRENT_FOCUS}}',
    '{{LATEST_RELEASE_TITLE}}',
    '{{PUBLIC_SOURCE_COMMIT}}',
    '{{PUBLIC_TEMPLATE_SHA}}',
    '{{PUBLIC_SYNCED_AT}}',
    '{{LANE_GAME_HREF}}',
    '{{BETA_BUILD_HREF}}',
    '{{LANE_RELEASE_DASHBOARD_HREF}}',
    '{{LANE_CONFORMANCE_DASHBOARD_HREF}}',
    '{{LANE_CONFORMANCE_DATA_HREF}}',
    '{{LANE_PROJECT_GUIDE_HREF}}',
    '{{LANE_APPLICATION_GUIDE_HREF}}',
    '{{LANE_PLATINUM_GUIDE_HREF}}',
    '{{PUBLIC_FOOTER_NOTE}}',
    '{{PUBLIC_RELEASE_GATE_CARDS}}',
    '{{PUBLIC_CONFORMANCE_SCORE_CHART}}',
    '{{PUBLIC_RESOURCE_SUMMARY_CARDS}}',
    '{{PUBLIC_INVESTMENT_QUEUE}}',
    '{{PUBLIC_INGESTION_OVERVIEW_CARDS}}',
    '{{PUBLIC_GAME_CATALOG_CARDS}}',
    '{{PUBLIC_REVIEW_LEARNING_SUMMARY}}',
    '{{PUBLIC_REVIEW_LEARNING_ISSUES}}',
    '{{PUBLIC_REVIEW_LEARNING_PATTERNS}}',
    '{{PUBLIC_DOCUMENTATION_PROVENANCE}}'
  ];
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

function checkSupabaseDataApiContract(){
  try{
    execFileSync(process.execPath, [path.join(ROOT, 'tools', 'harness', 'check-supabase-data-api-contract.js')], {
      cwd: ROOT,
      stdio: 'pipe'
    });
  }catch(err){
    const stderr = err.stderr ? String(err.stderr).trim() : '';
    const stdout = err.stdout ? String(err.stdout).trim() : '';
    throw new Error(`Publish preflight failed: Supabase Data API access contract check failed.\n${stderr || stdout || err.message}`);
  }
}

function checkReleaseConformanceDocs(){
  const dashboardPath = path.join(ROOT, 'RELEASE_CONFORMANCE_DASHBOARD.md');
  const economicsPath = path.join(ROOT, 'CONFORMANCE_ECONOMICS.md');
  const dashboard = loadText(dashboardPath);
  const economics = loadText(economicsPath);
  const requiredDashboardText = [
    '## Current Release Gate',
    '## Priority Table',
    '## Conformance Analysis And Economics',
    '### Resource And Time Usage',
    '### Past Goal Spend By Axis',
    '### Next Goal Estimates',
    '## Ingestion Framework View',
    '### Charts',
    'compute-minutes-by-resource.svg'
  ];
  for(const text of requiredDashboardText){
    if(!dashboard.includes(text)){
      throw new Error(`Publish preflight failed: ${dashboardPath} is missing "${text}". Run npm run harness:analyze:conformance-economics and npm run harness:build:release-conformance-dashboard before publishing.`);
    }
  }
  if(!economics.includes('## Release Documentation Rule')){
    throw new Error(`Publish preflight failed: ${economicsPath} is missing the release documentation rule for conformance economics.`);
  }
}

function checkStrategicBetaReviewDoc(){
  const reviewPath = path.join(ROOT, 'STRATEGIC_BETA_REVIEW.md');
  const review = loadText(reviewPath);
  const requiredText = [
    '# Strategic Beta Review',
    '## Trigger',
    '## Current Assessment',
    '## Beta-Readiness Standard',
    '## Review Log',
    'after every major hosted `/beta` push'
  ];
  for(const text of requiredText){
    if(!review.includes(text)){
      throw new Error(`Publish preflight failed: ${reviewPath} is missing "${text}". Refresh the strategic beta review before publishing.`);
    }
  }
}

function checkDocumentationFreshness(){
  try{
    execFileSync('node', [path.join(ROOT, 'tools', 'harness', 'check-documentation-freshness.js')], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }catch(err){
    const stderr = err.stderr ? String(err.stderr).trim() : '';
    const stdout = err.stdout ? String(err.stdout).trim() : '';
    throw new Error(`Publish preflight failed: documentation freshness check failed.\n${stderr || stdout || err.message}`);
  }
}

function checkConformanceDashboardArtifacts(cfg){
  const htmlPath = path.join(cfg.dir, 'conformance-dashboard.html');
  const dataPath = path.join(cfg.dir, 'conformance-dashboard-data.json');
  const assetHtmlPath = path.join(cfg.dir, 'assets', 'conformance-dashboard.html');
  const assetDataPath = path.join(cfg.dir, 'assets', 'conformance-dashboard-data.json');
  const html = loadText(htmlPath);
  const data = loadJson(dataPath);
  const requiredHtml = [
    'Aurora Conformance Dashboard',
    'id="gameSelector"',
    'Select game conformance profile',
    'data-tab="ingestion"',
    'Ingestion Framework',
    'Priority Investment Queue',
    'conformance-dashboard-data.json'
  ];
  for(const text of requiredHtml){
    if(!html.includes(text)){
      throw new Error(`Publish preflight failed: ${htmlPath} is missing "${text}". Run npm run build after refreshing the conformance dashboard.`);
    }
  }
  if(!Array.isArray(data.priorityRows) || !data.priorityRows.length){
    throw new Error(`Publish preflight failed: ${dataPath} is missing priorityRows. Refresh the release conformance dashboard before publishing.`);
  }
  if(!Array.isArray(data.games) || data.games.length < 2){
    throw new Error(`Publish preflight failed: ${dataPath} is missing game-selectable conformance profiles. Refresh the release conformance dashboard before publishing.`);
  }
  if(!Array.isArray(data.ingestionRows) || !data.ingestionRows.length){
    throw new Error(`Publish preflight failed: ${dataPath} is missing ingestionRows. Refresh the release conformance dashboard before publishing.`);
  }
  if(!fs.existsSync(assetHtmlPath) || !fs.existsSync(assetDataPath)){
    throw new Error(`Publish preflight failed: missing assets/conformance-dashboard.html or assets/conformance-dashboard-data.json. These asset copies are required because the public Pages workflow publishes the assets tree.`);
  }
  const assetHtml = loadText(assetHtmlPath);
  if(!assetHtml.includes('data-tab="ingestion"') || !assetHtml.includes('../release-dashboard.html')){
    throw new Error(`Publish preflight failed: ${assetHtmlPath} does not look like the release-lane conformance dashboard asset.`);
  }
}

function loadUserVisibleDocs(cfg){
  const docs = new Map();
  for(const file of USER_VISIBLE_DOC_FILES){
    const full = path.join(cfg.dir, file);
    if(fs.existsSync(full)){
      docs.set(file, loadText(full));
    }
  }
  return docs;
}

function checkDocumentationVisibility(cfg){
  const docs = loadUserVisibleDocs(cfg);
  for(const item of USER_VISIBLE_SECTIONS){
    const html = docs.get(item.file);
    if(!html){
      throw new Error(`Publish preflight failed: missing user-visible documentation surface ${path.join(cfg.dir, item.file)}. ${cfg.nextStep}`);
    }
    for(const text of item.requiredText){
      if(!html.includes(text)){
        throw new Error(`Publish preflight failed: ${path.join(cfg.dir, item.file)} is missing the user-visible documentation section "${text}". Run npm run build after refreshing the generated documentation manifests.`);
      }
    }
  }

  const visibleCorpus = Array.from(docs.values()).join('\n');
  for(const family of REQUIRED_VISIBLE_ARTIFACT_FAMILIES){
    const full = path.join(ROOT, family.path);
    if(!fs.existsSync(full)) continue;
    if(!visibleCorpus.includes(family.path)){
      throw new Error(
        `Publish preflight failed: ${family.path} exists but is not referenced in the generated user-visible docs. ` +
        `This artifact family represents ${family.meaning}; add it to the project/application guide, conformance dashboard, release dashboard, or public project page before publishing.`
      );
    }
  }
}

function checkPublicProjectPageArtifact(cfg){
  const htmlPath = path.join(cfg.dir, 'public-project-page.html');
  const buildInfo = loadJson(cfg.buildInfo);
  const html = loadText(htmlPath);
  const required = [
    'Aurora Galactica on Platinum',
    'Conformance system',
    'Open conformance dashboard',
    'Project state and conformance program',
    'Classic arcade ingestion framework',
    'Open generated release conformance report',
    'Open generated reference media inventory',
    'Release Location',
    'Build Timestamp',
    'Conformance readout',
    'Value versus compute',
    'Reference ingestion',
    'Documentation provenance',
    'documentation-provenance.json',
    'live conformance dashboard game profiles',
    'Strategic beta review',
    buildInfo.label,
    buildInfo.commit
  ];
  for(const text of required){
    if(!html.includes(text)){
      throw new Error(`Publish preflight failed: ${htmlPath} is missing "${text}". Run npm run build or re-promote the lane after refreshing the public project page template.`);
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
  if(!info.platform || !String(info.platform.version || '').trim()){
    throw new Error(`Publish preflight failed: ${cfg.buildInfo} is missing platform version metadata. Rebuild after restoring release-manifest.json.`);
  }
  if(!Array.isArray(info.applications) || !info.applications.length){
    throw new Error(`Publish preflight failed: ${cfg.buildInfo} is missing application version metadata. Rebuild after restoring release-manifest.json.`);
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

function checkProductionReviewDispositions(){
  const script = path.join(ROOT, 'tools', 'review', 'check-review-dispositions.js');
  try{
    execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }catch(err){
    const stderr = err.stderr ? String(err.stderr).trim() : '';
    const stdout = err.stdout ? String(err.stdout).trim() : '';
    throw new Error(`Publish preflight failed: production review dispositions are incomplete.\n${stderr || stdout || err.message}`);
  }
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const cfg = laneConfig(String(args.lane || '').toLowerCase());
  if(cfg.lane === 'beta'){
    try{
      assertReleaseAuthority('publish:beta');
    }catch(err){
      throw new Error(`Publish preflight failed: ${err.message}`);
    }
    checkBetaCheckoutCurrent();
  }
  if(cfg.lane === 'production'){
    try{
      assertReleaseAuthority('publish:production');
    }catch(err){
      throw new Error(`Publish preflight failed: ${err.message}`);
    }
    checkProductionCheckoutCurrent();
  }
  checkGitClean();
  checkSourceDocs();
  checkSupabaseDataApiContract();
  checkReleaseConformanceDocs();
  checkStrategicBetaReviewDoc();
  checkDocumentationFreshness();
  checkArtifacts(cfg);
  checkConformanceDashboardArtifacts(cfg);
  checkDocumentationVisibility(cfg);
  checkPublicProjectPageArtifact(cfg);
  const info = checkBuildInfo(cfg);
  checkBetaTestPilotConfig(cfg);
  if(cfg.lane === 'production'){
    checkPublicProjectTemplate();
    checkApprovedBetaForProduction(info);
    checkProductionReleaseDocs(info);
    checkProductionReviewDispositions();
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
  checkReleaseConformanceDocs,
  checkSupabaseDataApiContract,
  checkArtifacts,
  checkBuildInfo,
  checkProductionReleaseDocs,
  checkProductionCheckoutCurrent,
  checkBetaCheckoutCurrent,
  checkPublicProjectTemplate,
  checkPublicProjectPageArtifact,
  checkDocumentationVisibility,
  checkStrategicBetaReviewDoc,
  checkDocumentationFreshness
};

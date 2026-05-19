#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const {
  ROOT,
  DIST_DEV,
  DIST_PRODUCTION,
  DEV_INDEX,
  DEV_DASHBOARD,
  DEV_CONFORMANCE_DASHBOARD,
  DEV_CONFORMANCE_DASHBOARD_DATA,
  DEV_PUBLIC_PROJECT_PAGE,
  DEV_RELEASE_NOTES_PAGE,
  DEV_WHITE_PAPER,
  DEV_PROJECT_GUIDE,
  DEV_APPLICATION_GUIDE,
  DEV_PLATINUM_GUIDE,
  DEV_PLAYER_GUIDE,
  DEV_BUILD_INFO,
  DEV_RELEASE_NOTES,
  DEV_SCREENSHOT,
  PRODUCTION_INDEX,
  PRODUCTION_DASHBOARD,
  PRODUCTION_CONFORMANCE_DASHBOARD,
  PRODUCTION_CONFORMANCE_DASHBOARD_DATA,
  PRODUCTION_PUBLIC_PROJECT_PAGE,
  PRODUCTION_RELEASE_NOTES_PAGE,
  PRODUCTION_WHITE_PAPER,
  PRODUCTION_PROJECT_GUIDE,
  PRODUCTION_APPLICATION_GUIDE,
  PRODUCTION_PLATINUM_GUIDE,
  PRODUCTION_PLAYER_GUIDE,
  PRODUCTION_BUILD_INFO,
  PRODUCTION_RELEASE_NOTES,
  PRODUCTION_SCREENSHOT
} = require('./paths');
const { html: buildConformanceDashboardHtml } = require('../harness/build-dev-conformance-dashboard-page');
const { buildPublicProjectSections } = require('./public-project-page-sections');
const pkg = require(path.resolve(ROOT, 'package.json'));

const SRC = path.join(ROOT, 'src');
const SCRIPT_DIR = path.join(SRC, 'js');
const TEMPLATE = path.join(SRC, 'index.template.html');
const DASHBOARD_TEMPLATE = path.join(SRC, 'release-dashboard.template.html');
const PUBLIC_PROJECT_PAGE_TEMPLATE = path.join(SRC, 'public', 'aurora-galactica.template.html');
const PROJECT_GUIDE_TEMPLATE = path.join(SRC, 'project-guide.template.html');
const APPLICATION_GUIDE_TEMPLATE = path.join(SRC, 'application-guide.template.html');
const PLATINUM_GUIDE_TEMPLATE = path.join(SRC, 'platinum-guide.template.html');
const PLAYER_GUIDE_TEMPLATE = path.join(SRC, 'player-guide.template.html');
const STYLES = path.join(SRC, 'styles.css');
const ASSETS_DIR = path.join(SRC, 'assets');
const SHARED_REPLAY_STORE = path.join(ROOT, 'shared', 'replay-store.js');
const SUPABASE_UMD = path.join(ROOT, 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js');
const RELEASE_NOTES = path.join(ROOT, 'release-notes.json');
const RELEASE_DASHBOARD = path.join(ROOT, 'release-dashboard.json');
const CONFORMANCE_DASHBOARD_LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'release-conformance-dashboard', 'latest.json');
const RELEASE_MANIFEST = path.join(ROOT, 'release-manifest.json');
const PROJECT_GUIDE = path.join(ROOT, 'project-guide.json');
const WHITE_PAPER_GUIDE = path.join(ROOT, 'white-paper.json');
const APPLICATION_GUIDE = path.join(ROOT, 'application-guide.json');
const PLATINUM_GUIDE = path.join(ROOT, 'platinum-guide.json');
const PLAYER_GUIDE = path.join(ROOT, 'player-guide.json');
const DOCUMENTATION_PROVENANCE = path.join(ROOT, 'documentation-provenance.json');
const LOCAL_DEV_PUBLIC_PROJECT_PREVIEW = path.join(ROOT, 'local-dev', 'public-aurora-galactica-preview.html');
const GALAGA_REFERENCE_SPRITE_TARGETS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'pixel-targets-0.1.json');
const GALAGA_REFERENCE_SPRITE_MODEL = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'model-0.1.json');
const APPLICATION_ARTIFACT_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'application-artifact-conformance', 'latest.json');
const CHALLENGE_STAGE_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const LEVEL_VISUAL_CONFORMANCE_INDEX = path.join(ROOT, 'reference-artifacts', 'analyses', 'level-visual-conformance-index', 'latest.json');
const GALAGA_TARGET_ARTIFACT_COVERAGE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-artifact-coverage', 'latest.json');
const GALAGA_ALIEN_VISUAL_REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-reference', 'latest.json');
const GALAGA_ALIEN_MOTION_REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-motion-reference', 'latest.json');
const GALAGA_ALIEN_CROP_PREVIEWS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-crop-previews', 'latest.json');
const GALAGA_ALIEN_TARGET_CROPS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-target-crops', 'latest.json');
const GALAGA_TARGET_EVIDENCE_AUDIT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-evidence-audit', 'latest.json');
const GALAGA_ALIEN_TEMPORAL_TARGETS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-temporal-targets', 'latest.json');
const AURORA_RUNTIME_SPRITE_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-runtime-sprite-conformance', 'latest.json');
const AURORA_SPRITE_MOTION_CORRESPONDENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-sprite-motion-correspondence', 'latest.json');
const AURORA_RUNTIME_VS_GALAGA_TARGET_CROPS = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-runtime-vs-galaga-target-crops', 'latest.json');
const AURORA_IMPACT_EXPLOSION_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-impact-explosion-conformance', 'latest.json');
const SPRITE_CONFORMANCE_VARIATION_PLAN = path.join(ROOT, 'reference-artifacts', 'ingestion', 'sprite-conformance-variation-plan', 'plan-0.1.json');
const PERSONA_PERFORMANCE_DISTRIBUTION = path.join(ROOT, 'reference-artifacts', 'analyses', 'persona-performance-distribution', 'latest.json');
const CATALOG_MEDIA_SOURCE_PATHS = new Set();
let ACTIVE_SOURCE_BLOB_BASE = 'https://github.com/sgwoods/Codex-Test1/blob/main/';
const GENERATED_BUILD_PATHS = new Set([
  'dist/dev/index.html',
  'dist/dev/release-dashboard.html',
  'dist/dev/conformance-dashboard.html',
  'dist/dev/conformance-dashboard-data.json',
  'dist/dev/public-project-page.html',
  'dist/dev/release-notes.html',
  'dist/dev/white-paper.html',
  'dist/dev/project-guide.html',
  'dist/dev/application-guide.html',
  'dist/dev/platinum-guide.html',
  'dist/dev/player-guide.html',
  'dist/dev/build-info.json',
  'dist/dev/release-notes.json',
  'dist/dev/export.mov.png',
  'dist/dev/assets/platinum-platform-mark.png',
  'dist/dev/assets/galaxy-guardians-coming-soon.png',
  'dist/dev/assets/galaxy-guardians-coming-soon.svg',
  'dist/production/index.html',
  'dist/production/release-dashboard.html',
  'dist/production/conformance-dashboard.html',
  'dist/production/conformance-dashboard-data.json',
  'dist/production/public-project-page.html',
  'dist/production/release-notes.html',
  'dist/production/white-paper.html',
  'dist/production/project-guide.html',
  'dist/production/application-guide.html',
  'dist/production/platinum-guide.html',
  'dist/production/player-guide.html',
  'dist/production/build-info.json',
  'dist/production/export.mov.png',
  'dist/production/assets/platinum-platform-mark.png',
  'dist/production/assets/galaxy-guardians-coming-soon.png',
  'dist/production/assets/galaxy-guardians-coming-soon.svg',
  'dist/beta/index.html',
  'dist/beta/release-dashboard.html',
  'dist/beta/conformance-dashboard.html',
  'dist/beta/conformance-dashboard-data.json',
  'dist/beta/public-project-page.html',
  'dist/beta/release-notes.html',
  'dist/beta/white-paper.html',
  'dist/beta/project-guide.html',
  'dist/beta/application-guide.html',
  'dist/beta/platinum-guide.html',
  'dist/beta/player-guide.html',
  'dist/beta/build-info.json',
  'dist/beta/export.mov.png',
  'dist/beta/assets/platinum-platform-mark.png',
  'dist/beta/assets/galaxy-guardians-coming-soon.png',
  'dist/beta/assets/galaxy-guardians-coming-soon.svg',
  'dist/beta/README.md',
  'dist/beta/README.txt',
  'index.html',
  'release-dashboard.html',
  'conformance-dashboard.html',
  'conformance-dashboard-data.json',
  'public-project-page.html',
  'release-notes.html',
  'white-paper.html',
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'player-guide.html',
  'build-info.json',
  'dev/index.html',
  'dev/release-dashboard.html',
  'dev/conformance-dashboard.html',
  'dev/conformance-dashboard-data.json',
  'dev/public-project-page.html',
  'dev/release-notes.html',
  'dev/white-paper.html',
  'dev/project-guide.html',
  'dev/application-guide.html',
  'dev/platinum-guide.html',
  'dev/player-guide.html',
  'dev/build-info.json',
  'dev/README.txt',
  'beta/index.html',
  'beta/release-dashboard.html',
  'beta/conformance-dashboard.html',
  'beta/conformance-dashboard-data.json',
  'beta/public-project-page.html',
  'beta/release-notes.html',
  'beta/white-paper.html',
  'beta/project-guide.html',
  'beta/application-guide.html',
  'beta/platinum-guide.html',
  'beta/player-guide.html',
  'beta/build-info.json',
  'beta/README.txt',
  'beta/README.md',
  'local-dev/public-aurora-galactica-preview.html'
]);

function loadEnvFile(file){
  if(!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for(const rawLine of lines){
    const line = rawLine.trim();
    if(!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if(!match) continue;
    const [, key, rawValue] = match;
    if(Object.prototype.hasOwnProperty.call(process.env, key)) continue;
    let value = rawValue.trim();
    if((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))){
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, '.env.local'));

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function copyAssetTree(srcDir, destDir){
  if(!fs.existsSync(srcDir)) return [];
  fs.mkdirSync(destDir, { recursive: true });
  const copied = [];
  for(const entry of fs.readdirSync(srcDir, { withFileTypes: true })){
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if(entry.isDirectory()){
      copied.push(...copyAssetTree(src, dest));
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied.push(dest);
  }
  return copied;
}

function normalizeAssetSourcePath(sourcePath){
  return String(sourcePath || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .trim();
}

function catalogMediaHref(sourcePath){
  const normalized = normalizeAssetSourcePath(sourcePath);
  if(!normalized) return '';
  if(/^(?:https?:|data:|assets\/)/.test(normalized)) return normalized;
  CATALOG_MEDIA_SOURCE_PATHS.add(normalized);
  const ext = path.extname(normalized);
  const rawBase = path.basename(normalized, ext) || 'media';
  const base = rawBase.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 72) || 'media';
  const hash = crypto.createHash('sha1').update(normalized).digest('hex').slice(0, 10);
  return `assets/catalog-media/${hash}-${base}${ext}`;
}

function copyCatalogMediaAssets(destAssetsDir){
  if(!CATALOG_MEDIA_SOURCE_PATHS.size) return [];
  const copied = [];
  const catalogDir = path.join(destAssetsDir, 'catalog-media');
  fs.mkdirSync(catalogDir, { recursive: true });
  for(const sourcePath of CATALOG_MEDIA_SOURCE_PATHS){
    const source = path.join(ROOT, sourcePath);
    if(!fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
    const href = catalogMediaHref(sourcePath);
    const dest = path.join(path.dirname(destAssetsDir), href);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(source, dest);
    copied.push(dest);
  }
  return copied;
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

function loadReleaseDashboard(){
  try{
    return JSON.parse(read(RELEASE_DASHBOARD));
  }catch{
    return {
      targetVersion: '1.0.0',
      currentFocus: 'Release dashboard unavailable',
      strapline: 'Add release-dashboard.json to restore the public roadmap view.',
      timeline: [],
      legend: []
    };
  }
}

function loadConformanceDashboardSummary(){
  try{
    const raw = JSON.parse(read(CONFORMANCE_DASHBOARD_LATEST));
    const gates = Array.isArray(raw.releaseGate) ? raw.releaseGate : [];
    const rows = Array.isArray(raw.priorityRows) ? raw.priorityRows : [];
    const gate = (name) => gates.find(item => String(item.Gate || '').toLowerCase() === name.toLowerCase()) || null;
    const row = (pattern) => rows.find(item => pattern.test(String(item.metric || ''))) || null;
    const weakest = rows
      .filter(item => Number.isFinite(+item.score10))
      .sort((a, b) => (+a.score10) - (+b.score10))[0] || null;
    return {
      available: true,
      generatedAt: raw.generatedAt || '',
      commit: raw.commit || '',
      branch: raw.branch || '',
      overallCurrent: gate('Overall quality')?.Current || '',
      audioCurrent: row(/audio identity/i)?.current || '',
      levelArcCurrent: row(/level arc/i)?.current || '',
      visualCurrent: row(/visual look/i)?.current || '',
      weakestMetric: weakest?.metric || '',
      weakestCurrent: weakest?.current || '',
      dashboardUrl: 'http://127.0.0.1:4312/local-dev/conformance-dashboard.html'
    };
  }catch{
    return {
      available: false,
      generatedAt: '',
      commit: '',
      branch: '',
      overallCurrent: '',
      audioCurrent: '',
      levelArcCurrent: '',
      visualCurrent: '',
      weakestMetric: '',
      weakestCurrent: '',
      dashboardUrl: 'http://127.0.0.1:4312/local-dev/conformance-dashboard.html'
    };
  }
}

function loadConformanceDashboardData(){
  try{
    return JSON.parse(read(CONFORMANCE_DASHBOARD_LATEST));
  }catch{
    return {
      schemaVersion: 1,
      artifactType: 'release-conformance-dashboard',
      generatedAt: '',
      commit: '',
      branch: '',
      dirty: false,
      sourceReports: {},
      scoreSemantics: {
        headline: 'Conformance dashboard data unavailable for this build.',
        tenOutOfTen: '',
        confidence: '',
        resolution: ''
      },
      releaseGate: [],
      priorityRows: [],
      economicsSummary: {},
      ingestionSummary: {
        sourceFamilyCount: 0,
        highConfidenceCount: 0,
        mixedOrLowConfidenceCount: 0,
        scoredOrPromotedCount: 0,
        nextBestUpgrade: 'Regenerate the release conformance dashboard before using this build for release review.',
        framing: 'Conformance dashboard data was not available when this build was generated.'
      },
      ingestionRows: [],
      newFirstClassAxes: []
    };
  }
}

function loadDocumentationProvenance(){
  try{
    const raw = JSON.parse(read(DOCUMENTATION_PROVENANCE));
    return Object.assign({}, raw, {
      surfaces: Array.isArray(raw.surfaces) ? raw.surfaces : []
    });
  }catch{
    return {
      schemaVersion: 0,
      artifactType: 'documentation-provenance',
      purpose: 'Documentation provenance unavailable for this build.',
      rules: [],
      surfaces: []
    };
  }
}

function loadReleaseManifest(buildVersion = pkg.version){
  let raw;
  try{
    raw = JSON.parse(read(RELEASE_MANIFEST));
  }catch(err){
    throw new Error(`Could not load ${path.relative(ROOT, RELEASE_MANIFEST)}: ${err.message}`);
  }

  const product = String(raw.product || 'Aurora Galactica').trim() || 'Aurora Galactica';
  const rawPlatform = raw.platform && typeof raw.platform === 'object' ? raw.platform : {};
  const parseManifestList = (value) => {
    if(Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean);
    return String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  };
  const rawPlatformAuth = rawPlatform.auth && typeof rawPlatform.auth === 'object' ? rawPlatform.auth : {};
  const platform = {
    key: String(rawPlatform.key || 'platinum').trim() || 'platinum',
    name: String(rawPlatform.name || 'Platinum').trim() || 'Platinum',
    version: String(rawPlatform.version || buildVersion).trim() || buildVersion,
    releaseTrack: String(rawPlatform.releaseTrack || 'bundle-aligned').trim() || 'bundle-aligned',
    compatibility: String(rawPlatform.compatibility || '').trim(),
    notes: String(rawPlatform.notes || '').trim(),
    media: rawPlatform.media && typeof rawPlatform.media === 'object'
      ? {
          arcadeMusicPlaylistId: String(rawPlatform.media.arcadeMusicPlaylistId || '').trim()
        }
      : {},
    auth: {
      nonProductionTestPilotEmails: Array.from(new Set(parseManifestList(rawPlatformAuth.nonProductionTestPilotEmails)
        .map(email => email.toLowerCase()))),
      nonProductionTestPilotUserIds: Array.from(new Set(parseManifestList(rawPlatformAuth.nonProductionTestPilotUserIds)))
    }
  };

  const applications = Array.isArray(raw.applications) ? raw.applications : [];
  const seenGameKeys = new Set();
  const normalizedApplications = applications
    .map((entry) => {
      const gameKey = String(entry && entry.gameKey || '').trim();
      if(!gameKey || seenGameKeys.has(gameKey)) return null;
      seenGameKeys.add(gameKey);
      const version = String(entry.version || '').trim() || '0.0.0';
      return {
        gameKey,
        title: String(entry.title || gameKey).trim() || gameKey,
        version,
        versionLine: String(entry.versionLine || version).trim() || version,
        releaseTrack: String(entry.releaseTrack || 'application-track').trim() || 'application-track',
        runtimeStatus: String(entry.runtimeStatus || '').trim(),
        platformCompatibility: String(entry.platformCompatibility || platform.compatibility || '').trim(),
        launchPolicy: String(entry.launchPolicy || '').trim()
      };
    })
    .filter(Boolean);

  return {
    product,
    platform,
    applications: normalizedApplications,
    development: normalizeDevelopmentVersion(raw.development, buildVersion)
  };
}

function normalizeDevelopmentVersion(rawDevelopment, buildVersion){
  const raw = rawDevelopment && typeof rawDevelopment === 'object' ? rawDevelopment : {};
  const baseVersion = String(raw.baseVersion || buildVersion).trim() || buildVersion;
  const iteration = Number.parseInt(raw.iteration, 10);
  const computedLine = Number.isFinite(iteration) && iteration >= 0
    ? `${baseVersion}.${iteration}`
    : baseVersion;
  const versionLine = String(raw.versionLine || computedLine).trim() || computedLine;
  return {
    baseVersion,
    iteration: Number.isFinite(iteration) && iteration >= 0 ? iteration : null,
    versionLine,
    releaseTrack: String(raw.releaseTrack || 'hosted-dev-increment').trim() || 'hosted-dev-increment',
    notes: String(raw.notes || '').trim()
  };
}

function loadGuide(filePath, fallbackTitle, fallbackStrapline, includeSourceDocs = true){
  try{
    const raw = JSON.parse(read(filePath));
    return {
      title: raw.title || fallbackTitle,
      strapline: raw.strapline || '',
      currentGoal: raw.currentGoal || '',
      sections: Array.isArray(raw.sections) ? raw.sections : [],
      sourceDocs: includeSourceDocs && Array.isArray(raw.sourceDocs) ? raw.sourceDocs : []
    };
  }catch{
    return {
      title: fallbackTitle,
      strapline: fallbackStrapline,
      currentGoal: '',
      sections: [],
      sourceDocs: []
    };
  }
}

function loadProjectGuide(){
  return loadGuide(
    PROJECT_GUIDE,
    'Project Guide',
    'Add project-guide.json to restore the generated documentation guide.'
  );
}

function loadWhitePaperGuide(){
  return loadGuide(
    WHITE_PAPER_GUIDE,
    'Aurora / Platinum White Paper',
    'Add white-paper.json to restore the generated hosted white paper.'
  );
}

function extractWhitePaperMeta(source=''){
  return {
    version: (String(source || '').match(/^Current draft:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown',
    updatedDate: (String(source || '').match(/^Date:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown',
    status: (String(source || '').match(/^Status:\s*(.+)$/m) || [])[1] || 'unknown'
  };
}

function loadPlatinumGuide(){
  return loadGuide(
    PLATINUM_GUIDE,
    'Platinum Guide',
    'Add platinum-guide.json to restore the generated Platinum platform guide.'
  );
}

function loadApplicationGuide(){
  try{
    const raw = JSON.parse(read(APPLICATION_GUIDE));
    return {
      title: raw.title || 'Aurora Application Guide',
      strapline: raw.strapline || '',
      currentGoal: raw.currentGoal || '',
      audioContexts: Array.isArray(raw.audioContexts) ? raw.audioContexts : [],
      audioEventMatrix: Array.isArray(raw.audioEventMatrix) ? raw.audioEventMatrix : [],
      comparisonSets: Array.isArray(raw.comparisonSets) ? raw.comparisonSets : [],
      graphicsThemes: Array.isArray(raw.graphicsThemes) ? raw.graphicsThemes : [],
      graphicsContexts: Array.isArray(raw.graphicsContexts) ? raw.graphicsContexts : [],
      shipCatalog: Array.isArray(raw.shipCatalog) ? raw.shipCatalog : [],
      stageFamilies: Array.isArray(raw.stageFamilies) ? raw.stageFamilies : [],
      conformanceAlienRows: Array.isArray(raw.conformanceAlienRows) ? raw.conformanceAlienRows : [],
      conformanceAudioRows: Array.isArray(raw.conformanceAudioRows) ? raw.conformanceAudioRows : [],
      stageConformanceRows: Array.isArray(raw.stageConformanceRows) ? raw.stageConformanceRows : [],
      personaRows: Array.isArray(raw.personaRows) ? raw.personaRows : [],
      graphicsControls: Array.isArray(raw.graphicsControls) ? raw.graphicsControls : [],
      links: Array.isArray(raw.links) ? raw.links : []
    };
  }catch{
    return {
      title: 'Aurora Application Guide',
      strapline: 'Add application-guide.json to restore the generated application catalog.',
      currentGoal: '',
      audioContexts: [],
      audioEventMatrix: [],
      comparisonSets: [],
      graphicsThemes: [],
      graphicsContexts: [],
      shipCatalog: [],
      stageFamilies: [],
      conformanceAlienRows: [],
      conformanceAudioRows: [],
      stageConformanceRows: [],
      personaRows: [],
      graphicsControls: [],
      links: []
    };
  }
}

function loadPlayerGuide(){
  try{
    const raw = JSON.parse(read(PLAYER_GUIDE));
    return {
      title: raw.title || 'Player Guide',
      strapline: raw.strapline || '',
      currentGoal: raw.currentGoal || '',
      sections: Array.isArray(raw.sections) ? raw.sections : []
    };
  }catch{
    return {
      title: 'Player Guide Unavailable',
      strapline: 'Add player-guide.json to restore the generated player guide.',
      currentGoal: '',
      sections: []
    };
  }
}

function escJsonForScript(value){
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function git(args, fallback = ''){
  try{
    return execSync(`git -C "${ROOT}" ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function parsePorcelainPath(entry=''){
  const trimmed = String(entry || '').trim();
  if(!trimmed) return '';
  const body = trimmed.slice(3);
  if(!body) return '';
  if(body.includes(' -> ')) return body.split(' -> ').pop().trim();
  return body.trim();
}

function isGeneratedBuildPath(filePath=''){
  const normalized = String(filePath || '').replace(/\\/g, '/');
  return GENERATED_BUILD_PATHS.has(normalized);
}

function detectRepoRef(){
  return process.env.GITHUB_REPOSITORY
    || git('config --get remote.origin.url', '')
    || '';
}

function detectReleaseChannel(repoRef){
  if(/Aurora-Galactica/i.test(repoRef)) return 'production';
  if(/Codex-Test1/i.test(repoRef)) return 'pre-production';
  return 'development';
}

function esc(value=''){
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function publicPageDateLong(source){
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(source || new Date().toISOString()));
}

function humanizeReleaseLabel(value = ''){
  return String(value || '')
    .trim()
    .replace(/-/g, ' ');
}

function dashboardStyles(){
  return `
    :root{
      --bg:#07131f;
      --bg2:#10253b;
      --card:rgba(7,19,31,0.72);
      --line:rgba(135,197,255,0.26);
      --text:#eff7ff;
      --muted:#9cc4df;
      --done:#67e6a8;
      --doing:#ffd66b;
      --next:#79b8ff;
      --shadow:0 18px 40px rgba(0,0,0,0.28);
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      color:var(--text);
      font-family:"Avenir Next","Segoe UI",sans-serif;
      background:
        radial-gradient(circle at top left, rgba(103,230,168,0.18), transparent 26%),
        radial-gradient(circle at top right, rgba(121,184,255,0.22), transparent 32%),
        linear-gradient(160deg, var(--bg), var(--bg2));
      min-height:100vh;
    }
    a{color:#d9f7ff}
    .shell{
      max-width:1100px;
      margin:0 auto;
      padding:40px 20px 72px;
    }
    .hero{
      position:relative;
      overflow:hidden;
      padding:36px 34px 32px;
      border:1px solid rgba(177,222,255,0.18);
      border-radius:28px;
      background:
        linear-gradient(160deg, rgba(12,34,54,0.88), rgba(7,19,31,0.72)),
        radial-gradient(circle at 20% 0%, rgba(103,230,168,0.14), transparent 32%);
      box-shadow:var(--shadow);
    }
    .heroTop{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      flex-wrap:wrap;
    }
    .eyebrow{
      display:inline-flex;
      align-items:center;
      gap:10px;
      padding:7px 12px;
      border-radius:999px;
      background:rgba(255,255,255,0.08);
      color:#d7ecff;
      font-size:12px;
      letter-spacing:.14em;
      text-transform:uppercase;
    }
    .homeLink{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:8px 14px;
      border-radius:999px;
      border:1px solid rgba(122,195,255,0.28);
      background:rgba(122,195,255,0.12);
      color:#eff7ff;
      text-decoration:none;
      font-size:13px;
      letter-spacing:.04em;
    }
    h1{
      margin:18px 0 10px;
      font-size:clamp(34px,5vw,58px);
      line-height:.95;
      letter-spacing:-0.04em;
    }
    .hero p{
      max-width:760px;
      font-size:18px;
      line-height:1.6;
      color:var(--muted);
    }
    .meta{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
      gap:14px;
      margin-top:28px;
    }
    .metaCard{
      padding:16px 18px;
      border-radius:18px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
    }
    .metaLabel{
      display:block;
      color:#8fb3cc;
      font-size:12px;
      letter-spacing:.12em;
      text-transform:uppercase;
      margin-bottom:6px;
    }
    .metaValue{
      font-size:18px;
      font-weight:600;
    }
    .timeline{
      position:relative;
      margin:44px 0 34px;
      display:grid;
      gap:18px;
    }
    .versionDomains{
      margin-top:24px;
      padding:28px;
      border-radius:24px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
      box-shadow:var(--shadow);
    }
    .versionDomains h2{
      margin:0 0 8px;
      font-size:24px;
      letter-spacing:-0.02em;
    }
    .versionDomains p{
      margin:0;
      color:var(--muted);
      line-height:1.6;
    }
    .versionGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:14px;
      margin-top:20px;
    }
    .versionCard{
      padding:16px 18px;
      border-radius:18px;
      background:rgba(7,19,31,0.52);
      border:1px solid rgba(255,255,255,0.08);
    }
    .versionCard strong{
      display:block;
      margin-bottom:8px;
      font-size:13px;
      letter-spacing:.12em;
      text-transform:uppercase;
      color:#cfe8fb;
    }
    .versionCard span{
      display:block;
      font-size:22px;
      font-weight:600;
    }
    .versionCard small{
      display:block;
      margin-top:8px;
      color:#8db0c8;
      line-height:1.5;
      font-size:13px;
    }
    .tableWrap{
      margin-top:18px;
      overflow:auto;
      border-radius:18px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(7,19,31,0.46);
    }
    .dataTable{
      width:100%;
      border-collapse:collapse;
      min-width:760px;
    }
    .dataTable th,
    .dataTable td{
      padding:14px 16px;
      border-bottom:1px solid rgba(255,255,255,0.08);
      text-align:left;
      vertical-align:top;
    }
    .dataTable th{
      font-size:12px;
      letter-spacing:.12em;
      text-transform:uppercase;
      color:#9fc8e3;
      background:rgba(255,255,255,0.03);
    }
    .dataTable td{
      color:var(--muted);
      line-height:1.5;
      font-size:14px;
    }
    .dataTable tr:last-child td{
      border-bottom:none;
    }
    .timeline::before{
      content:"";
      position:absolute;
      left:18px;
      top:16px;
      bottom:16px;
      width:2px;
      background:linear-gradient(to bottom, rgba(103,230,168,0.7), rgba(121,184,255,0.22));
    }
    .step{
      position:relative;
      margin-left:44px;
      padding:18px 20px 18px 22px;
      border-radius:20px;
      border:1px solid rgba(255,255,255,0.08);
      background:var(--card);
      box-shadow:var(--shadow);
    }
    .step::before{
      content:"";
      position:absolute;
      left:-36px;
      top:24px;
      width:18px;
      height:18px;
      border-radius:50%;
      border:3px solid currentColor;
      background:#091520;
      box-shadow:0 0 0 7px rgba(9,21,32,0.95);
    }
    .step.done{color:var(--done)}
    .step.in_progress{color:var(--doing)}
    .step.up_next{color:var(--next)}
    .stepHeader{
      display:flex;
      justify-content:space-between;
      gap:16px;
      align-items:flex-start;
      margin-bottom:8px;
    }
    .stepTitle{
      margin:0;
      color:var(--text);
      font-size:22px;
      line-height:1.1;
    }
    .stepTitle a{
      color:inherit;
      text-decoration:none;
      border-bottom:1px solid transparent;
    }
    .stepTitle a:hover{
      border-bottom-color:currentColor;
    }
    .badge{
      flex:0 0 auto;
      padding:7px 11px;
      border-radius:999px;
      font-size:11px;
      letter-spacing:.14em;
      text-transform:uppercase;
      background:rgba(255,255,255,0.08);
      color:inherit;
    }
    .step p{
      margin:0;
      color:var(--muted);
      line-height:1.55;
    }
    .stepActions{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin-top:14px;
    }
    .stepLink{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:8px 12px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,0.12);
      background:rgba(255,255,255,0.05);
      color:#edf7ff;
      text-decoration:none;
      font-size:13px;
      line-height:1.2;
    }
    .stepLink:hover{
      background:rgba(255,255,255,0.09);
    }
    .legend{
      margin-top:42px;
      padding:28px 28px 18px;
      border-radius:24px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
      box-shadow:var(--shadow);
    }
    .legend h2{
      margin:0 0 16px;
      font-size:22px;
      letter-spacing:-0.02em;
    }
    .legendGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:14px;
    }
    .legendItem{
      padding:14px 16px;
      border-radius:16px;
      background:rgba(7,19,31,0.52);
      border:1px solid rgba(255,255,255,0.06);
    }
    .legendItem strong{
      display:block;
      margin-bottom:6px;
      font-size:14px;
      letter-spacing:.08em;
      text-transform:uppercase;
      color:#dbf3ff;
    }
    .legendItem span{
      color:var(--muted);
      line-height:1.5;
      font-size:14px;
    }
    .footer{
      margin-top:22px;
      font-size:13px;
      color:#8db0c8;
    }
    @media (max-width: 720px){
      .shell{padding:20px 14px 54px}
      .hero{padding:26px 22px 24px}
      .versionDomains{padding:22px 20px}
      .step{margin-left:34px}
      .timeline::before{left:12px}
      .step::before{left:-28px}
      .stepHeader{flex-direction:column}
    }
  `.trim();
}

function renderReleaseVersionDomains(buildInfo){
  const platform = buildInfo.platform || {};
  const applications = Array.isArray(buildInfo.applications) ? buildInfo.applications : [];
  const versionCards = [
    {
      label: 'Integrated Release',
      value: buildInfo.versionLine || buildInfo.version || '--',
      detail: [`Lane ${buildInfo.releaseChannel || 'development'}`, buildInfo.versionLine && buildInfo.versionLine !== buildInfo.version ? `Base ${buildInfo.version}` : '', buildInfo.label || ''].filter(Boolean).join(' · ')
    },
    {
      label: 'Platinum Platform',
      value: platform.version || '--',
      detail: [platform.name || 'Platinum', humanizeReleaseLabel(platform.releaseTrack), platform.compatibility].filter(Boolean).join(' · ')
    },
    {
      label: 'Application Tracks',
      value: String(applications.length || 0),
      detail: 'Game-owned version records carried inside this bundle.'
    }
  ].map((card) => `
    <article class="versionCard">
      <strong>${esc(card.label)}</strong>
      <span>${esc(card.value)}</span>
      <small>${esc(card.detail)}</small>
    </article>
  `).join('\n');
  const applicationRows = applications.length
    ? applications.map((app) => `
        <tr>
          <td>${esc(app.title || app.gameKey || 'Application')}</td>
          <td>${esc(app.versionLine || app.version || '--')}</td>
          <td>${esc(humanizeReleaseLabel(app.releaseTrack || ''))}</td>
          <td>${esc(humanizeReleaseLabel(app.runtimeStatus || ''))}</td>
          <td>${esc(humanizeReleaseLabel(app.launchPolicy || ''))}</td>
          <td>${esc(app.platformCompatibility || platform.compatibility || '')}</td>
        </tr>
      `).join('\n')
    : `
        <tr>
          <td colspan="6">No applications are currently declared in <code>release-manifest.json</code>.</td>
        </tr>
      `;
  return `
    <section class="versionDomains">
      <h2>Version Domains</h2>
      <p>The integrated release, the Platinum host, and each application now travel as separate version records so we can advance or verify them independently over time.</p>
      <div class="versionGrid">
        ${versionCards}
      </div>
      <div class="tableWrap">
        <table class="dataTable">
          <thead>
            <tr>
              <th>Application</th>
              <th>Version</th>
              <th>Track</th>
              <th>Runtime Status</th>
              <th>Launch Policy</th>
              <th>Compatibility</th>
            </tr>
          </thead>
          <tbody>
            ${applicationRows}
          </tbody>
        </table>
      </div>
    </section>
  `.trim();
}

function displayBuildVersion(buildInfo){
  return buildInfo.versionLine || buildInfo.version || '--';
}

function projectGuideStyles(){
  return `
    :root{
      --bg:#06111b;
      --bg2:#10253b;
      --bg3:#14354f;
      --card:rgba(7,19,31,0.78);
      --card2:rgba(255,255,255,0.05);
      --line:rgba(144,210,255,0.18);
      --text:#eef8ff;
      --muted:#a1c7e0;
      --soft:#84adc9;
      --accent:#69e2a7;
      --accent2:#7ac3ff;
      --shadow:0 18px 40px rgba(0,0,0,0.28);
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{
      margin:0;
      color:var(--text);
      font-family:"Avenir Next","Segoe UI",sans-serif;
      background:
        radial-gradient(circle at top left, rgba(105,226,167,0.16), transparent 24%),
        radial-gradient(circle at 100% 10%, rgba(122,195,255,0.2), transparent 28%),
        linear-gradient(160deg,var(--bg),var(--bg2) 55%,var(--bg3));
      min-height:100vh;
    }
    a{color:#d8f7ff}
    .shell{
      max-width:1280px;
      margin:0 auto;
      padding:34px 18px 72px;
      display:grid;
      grid-template-columns:minmax(0,1fr) 280px;
      gap:24px;
      align-items:start;
    }
    .main{min-width:0}
    .hero,.section,.toc{
      border:1px solid rgba(177,222,255,0.16);
      border-radius:28px;
      background:
        linear-gradient(160deg, rgba(12,34,54,0.88), rgba(7,19,31,0.72)),
        radial-gradient(circle at 20% 0%, rgba(103,230,168,0.12), transparent 32%);
      box-shadow:var(--shadow);
    }
    .hero{
      padding:34px 32px 28px;
      overflow:hidden;
      position:relative;
    }
    .heroTop{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      flex-wrap:wrap;
    }
    .eyebrow{
      display:inline-flex;
      align-items:center;
      gap:10px;
      padding:7px 12px;
      border-radius:999px;
      background:rgba(255,255,255,0.08);
      color:#d7ecff;
      font-size:12px;
      letter-spacing:.14em;
      text-transform:uppercase;
    }
    .homeLink{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:8px 14px;
      border-radius:999px;
      border:1px solid rgba(122,195,255,0.28);
      background:rgba(122,195,255,0.12);
      color:#eff7ff;
      text-decoration:none;
      font-size:13px;
      letter-spacing:.04em;
    }
    h1{
      margin:18px 0 10px;
      font-size:clamp(34px,5vw,58px);
      line-height:.95;
      letter-spacing:-0.04em;
    }
    .hero p{
      max-width:900px;
      color:var(--muted);
      font-size:18px;
      line-height:1.65;
      margin:0 0 16px;
    }
    .goal{
      margin-top:16px;
      padding:16px 18px;
      border-radius:18px;
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.08);
      color:#e7f6ff;
      font-size:16px;
      line-height:1.55;
    }
    .meta{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
      gap:14px;
      margin-top:22px;
    }
    .metaCard{
      padding:16px 18px;
      border-radius:18px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
    }
    .metaLabel{
      display:block;
      color:#8fb3cc;
      font-size:12px;
      letter-spacing:.12em;
      text-transform:uppercase;
      margin-bottom:6px;
    }
    .metaValue{
      font-size:18px;
      font-weight:600;
    }
    .heroLinks{
      display:flex;
      flex-wrap:wrap;
      gap:12px;
      margin-top:20px;
    }
    .button{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:11px 16px;
      border-radius:999px;
      background:rgba(122,195,255,0.16);
      border:1px solid rgba(122,195,255,0.3);
      color:#eff7ff;
      text-decoration:none;
      font-size:14px;
      letter-spacing:.04em;
    }
    .section{
      margin-top:20px;
      padding:28px 26px 24px;
    }
    .sectionHeader{
      margin-bottom:18px;
      padding-bottom:14px;
      border-bottom:1px solid var(--line);
    }
    .sectionHeader h2{
      margin:0 0 8px;
      font-size:28px;
      letter-spacing:-0.03em;
    }
    .sectionHeader p{
      margin:0;
      color:var(--muted);
      line-height:1.6;
    }
    .cardGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:16px;
    }
    .card,.linkCard{
      padding:18px;
      border-radius:20px;
      background:var(--card2);
      border:1px solid rgba(255,255,255,0.08);
    }
    .card h3,.linkCard h3{
      margin:0 0 10px;
      font-size:18px;
      line-height:1.25;
    }
    .card p,.linkCard p{
      margin:0;
      color:var(--muted);
      line-height:1.6;
    }
    .bulletList{
      margin:0;
      padding:0;
      list-style:none;
      display:grid;
      gap:12px;
    }
    .bulletList li{
      position:relative;
      padding:14px 16px 14px 42px;
      border-radius:18px;
      background:var(--card2);
      border:1px solid rgba(255,255,255,0.08);
      color:var(--muted);
      line-height:1.6;
    }
    .bulletList li::before{
      content:"";
      position:absolute;
      left:16px;
      top:18px;
      width:12px;
      height:12px;
      border-radius:50%;
      background:linear-gradient(135deg,var(--accent),var(--accent2));
      box-shadow:0 0 0 6px rgba(122,195,255,0.08);
    }
    .linkGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
      gap:16px;
    }
    .linkCard a{
      display:inline-flex;
      align-items:center;
      gap:8px;
      font-weight:600;
      margin-bottom:10px;
      text-decoration:none;
    }
    .tableWrap{
      overflow:auto;
      border-radius:20px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(255,255,255,0.04);
    }
    .dataTable{
      width:100%;
      border-collapse:collapse;
      min-width:820px;
    }
    .dataTable th,
    .dataTable td{
      padding:12px 14px;
      border-bottom:1px solid rgba(255,255,255,0.08);
      text-align:left;
      vertical-align:top;
      font-size:14px;
      line-height:1.45;
    }
    .dataTable th{
      position:sticky;
      top:0;
      background:rgba(7,19,31,0.96);
      color:#e8f7ff;
      font-size:12px;
      letter-spacing:.12em;
      text-transform:uppercase;
      z-index:1;
    }
    .dataTable td{
      color:var(--muted);
      background:rgba(255,255,255,0.02);
    }
    .dataTable tbody tr:last-child td{
      border-bottom:none;
    }
    .dataTable code{
      color:#f1fbff;
      font-size:12px;
      background:rgba(255,255,255,0.06);
      padding:2px 6px;
      border-radius:999px;
    }
    .docWrap{
      padding:20px 22px;
      border-radius:22px;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08);
    }
    .docMeta{
      margin:0 0 14px;
      color:var(--soft);
      font-size:13px;
      line-height:1.55;
    }
    .inlineDocShelf{
      display:grid;
      gap:10px;
      margin-top:14px;
    }
    .inlineDocPreview,
    .challengeStageDetail,
    .levelVisualDetail{
      border:1px solid rgba(255,255,255,0.10);
      background:rgba(7,19,31,0.72);
      border-radius:18px;
      overflow:hidden;
    }
    .inlineDocPreview summary,
    .challengeStageDetail summary,
    .levelVisualDetail summary{
      cursor:pointer;
      list-style:none;
    }
    .inlineDocPreview summary::-webkit-details-marker,
    .challengeStageDetail summary::-webkit-details-marker,
    .levelVisualDetail summary::-webkit-details-marker{
      display:none;
    }
    .inlineDocPreview summary{
      padding:12px 14px;
      color:#f2fbff;
      font-weight:800;
    }
    .inlineDocPreview summary::after,
    .challengeStageDetail summary::after,
    .levelVisualDetail summary::after{
      content:"+";
      float:right;
      color:var(--accent);
      font-weight:900;
    }
    .inlineDocPreview[open] summary::after,
    .challengeStageDetail[open] summary::after,
    .levelVisualDetail[open] summary::after{
      content:"-";
    }
    .inlineDocPreviewBody{
      padding:0 14px 14px;
      color:var(--muted);
      font-size:14px;
      line-height:1.6;
    }
    .challengeStageList,
    .levelVisualList{
      display:grid;
      gap:12px;
    }
    .challengeStageSummary,
    .levelVisualSummary{
      display:grid;
      grid-template-columns:minmax(220px,1fr) auto auto;
      gap:12px;
      align-items:center;
      padding:14px 16px;
      color:#f2fbff;
    }
    .levelVisualSummary{
      grid-template-columns:minmax(260px,1.2fr) minmax(150px,.7fr) minmax(150px,.7fr) minmax(220px,1fr) auto;
    }
    .challengeStageTitle,
    .levelVisualTitle{
      display:flex;
      flex-direction:column;
      gap:3px;
      font-weight:900;
    }
    .challengeStageTitle small,
    .levelVisualTitle small{
      color:var(--soft);
      font-weight:600;
      line-height:1.35;
    }
    .levelVisualSummaryCell{
      color:var(--soft);
      font-size:12px;
      line-height:1.35;
      min-width:0;
    }
    .levelVisualSummaryCell strong{
      display:block;
      color:#eaf8ff;
      font-size:13px;
      line-height:1.35;
    }
    .scorePill{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-width:92px;
      padding:7px 10px;
      border-radius:999px;
      border:1px solid rgba(126,242,255,0.22);
      background:rgba(126,242,255,0.08);
      color:#e8fbff;
      font-size:12px;
      font-weight:900;
      white-space:nowrap;
    }
    .challengeStageDetailBody,
    .levelVisualDetailBody{
      display:grid;
      gap:14px;
      padding:0 16px 16px;
    }
    .challengeCompareGrid,
    .challengeAxisGrid,
    .levelVisualCompareGrid{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px;
    }
    .challengeAxisGrid{
      grid-template-columns:repeat(4,minmax(0,1fr));
    }
    .levelVisualRoleGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:12px;
    }
    .levelVisualVideoGrid{
      display:grid;
      grid-template-columns:repeat(2,minmax(320px,1fr));
      gap:12px;
      align-items:start;
    }
    .catalogMediaVideo{
      display:block;
      width:100%;
      min-height:260px;
      max-height:430px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,0.10);
      background:#020712;
      object-fit:contain;
    }
    .levelRoleCard{
      min-width:0;
      padding:12px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(255,255,255,0.035);
    }
    .levelRoleCard h4{
      margin:0 0 8px;
      color:#f2fbff;
      font-size:13px;
      letter-spacing:.02em;
    }
    .levelRoleImages{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:8px;
      align-items:start;
    }
    .levelVisualMetricGrid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:8px;
      margin-top:8px;
      font-size:12px;
      color:var(--soft);
    }
    .levelVisualMetricGrid span{
      padding:7px 8px;
      border-radius:10px;
      background:rgba(255,255,255,0.04);
    }
    .challengeEvidenceCard{
      min-width:0;
      padding:14px;
      border-radius:16px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(255,255,255,0.04);
    }
    .challengeEvidenceCard h3{
      margin:0 0 8px;
      color:#f2fbff;
      font-size:15px;
      letter-spacing:.02em;
    }
    .challengeEvidenceCard p,
    .challengeEvidenceCard li{
      color:var(--muted);
      font-size:13px;
      line-height:1.55;
    }
    .challengeEvidenceCard ul{
      margin:8px 0 0;
      padding-left:18px;
    }
    .challengeComponentGrid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:6px;
      margin-top:8px;
      font-size:12px;
      color:var(--soft);
    }
    .challengeComponentGrid span{
      padding:6px 8px;
      border-radius:10px;
      background:rgba(255,255,255,0.04);
    }
    @media (max-width: 980px){
      .challengeStageSummary,
      .challengeCompareGrid,
      .challengeAxisGrid,
      .levelVisualSummary,
      .levelVisualCompareGrid,
      .levelVisualVideoGrid{
        grid-template-columns:1fr;
      }
      .levelRoleImages{
        grid-template-columns:1fr;
      }
      .scorePill{
        justify-content:flex-start;
      }
    }
    .markdown h3,.markdown h4,.markdown h5{
      margin:24px 0 10px;
      letter-spacing:-0.02em;
      color:#f2fbff;
    }
    .markdown h3{font-size:24px}
    .markdown h4{font-size:20px}
    .markdown h5{font-size:17px}
    .markdown p{
      margin:0 0 14px;
      color:var(--muted);
      line-height:1.7;
    }
    .markdown ul,.markdown ol{
      margin:0 0 16px 0;
      color:var(--muted);
      padding-left:22px;
    }
    .markdown li{
      margin:0 0 8px;
      line-height:1.65;
    }
    .markdown pre{
      margin:0 0 16px;
      padding:14px 16px;
      overflow:auto;
      border-radius:16px;
      background:rgba(3,10,16,0.9);
      border:1px solid rgba(255,255,255,0.08);
      color:#e8f6ff;
    }
    .markdown pre code{
      color:inherit;
      font-size:13px;
    }
    .markdown img{
      display:block;
      max-width:100%;
      margin:0 0 16px;
      border-radius:18px;
      border:1px solid rgba(255,255,255,0.08);
      box-shadow:var(--shadow);
    }
    .toc{
      position:sticky;
      top:20px;
      padding:22px 20px 18px;
    }
    .toc h2{
      margin:0 0 12px;
      font-size:20px;
      letter-spacing:-0.02em;
    }
    .toc p{
      margin:0 0 14px;
      color:var(--soft);
      line-height:1.55;
      font-size:14px;
    }
    .toc ul{
      list-style:none;
      margin:0;
      padding:0;
      display:grid;
      gap:10px;
    }
    .toc li a{
      display:block;
      padding:10px 12px;
      border-radius:14px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.06);
      text-decoration:none;
      color:#e9f7ff;
      font-size:14px;
      line-height:1.4;
    }
    .footer{
      margin-top:18px;
      color:#8db0c8;
      font-size:13px;
      line-height:1.6;
    }
    code{
      font-family:"SFMono-Regular",Consolas,monospace;
      color:#edf7ff;
      font-size:.95em;
    }
    .markdown blockquote{
      margin:0 0 16px;
      padding:14px 16px 14px 18px;
      border-left:4px solid rgba(122,195,255,0.55);
      border-radius:18px;
      background:rgba(122,195,255,0.08);
    }
    .markdown blockquote p:last-child{
      margin-bottom:0;
    }
    @media (max-width: 980px){
      .shell{grid-template-columns:1fr}
      .toc{position:static; order:0}
    }
    @media (max-width: 720px){
      .shell{padding:20px 14px 54px}
      .hero,.section,.toc{padding:22px 20px}
      .hero p{font-size:17px}
    }
  `.trim();
}

function whitePaperGuideStyles(){
  return `
    @page{
      size:Letter;
      margin:0.55in;
    }
    .whitePaperMetaCard{
      border-color:rgba(105,226,167,0.22);
      background:rgba(105,226,167,0.08);
    }
    .whitePaperMetaCard .metaLabel{
      color:#bcefd4;
    }
    .whitePaperDocAction{
      border-color:rgba(105,226,167,0.34);
      background:rgba(105,226,167,0.14);
    }
    .markdown .mermaid{
      display:block;
      margin:0 0 18px;
      padding:12px 0;
      overflow:auto;
    }
    .markdown .mermaid svg{
      max-width:100%;
      height:auto;
    }
    @media print{
      html,body{
        background:#fff !important;
        color:#161616 !important;
        overflow:visible;
      }
      body{
        font-family:Georgia,"Times New Roman",serif;
      }
      .shell{
        display:block;
        max-width:none;
        padding:0;
      }
      .hero,
      .section,
      .docWrap,
      .card,
      .linkCard,
      .bulletList li,
      .tableWrap{
        background:#fff !important;
        box-shadow:none !important;
        border-color:#d7d7d7 !important;
      }
      .hero,
      .section{
        margin:0 0 0.24in;
        padding:0 0 0.12in;
        break-inside:auto;
      }
      .heroTop .homeLink,
      .heroLinks,
      .toc{
        display:none !important;
      }
      .hero h1,
      .sectionHeader h2,
      .markdown h3,
      .markdown h4,
      .markdown h5,
      .card h3,
      .linkCard h3{
        color:#111 !important;
      }
      .hero p,
      .goal,
      .metaCard,
      .sectionHeader p,
      .card p,
      .linkCard p,
      .bulletList li,
      .markdown p,
      .markdown li,
      .markdown blockquote,
      .docMeta,
      .footer{
        color:#2b2b2b !important;
      }
      .metaCard,
      .whitePaperMetaCard{
        background:#f5f7f9 !important;
        border-color:#d7d7d7 !important;
      }
      .goal{
        background:#f5f7f9 !important;
        border-color:#d7d7d7 !important;
      }
      .markdown img,
      .markdown .mermaid,
      .markdown blockquote,
      .markdown pre,
      .tableWrap{
        break-inside:avoid-page;
        page-break-inside:avoid;
      }
      .markdown img{
        max-height:8.4in;
        border-color:#d7d7d7;
        box-shadow:none;
      }
      .markdown pre{
        background:#f5f7f9;
        color:#111;
        border-color:#d7d7d7;
      }
      .markdown blockquote{
        background:#f5f7f9;
        border-left-color:#4f88b4;
      }
      .tableWrap{
        overflow:visible;
        background:#fff;
      }
      .dataTable{
        min-width:0;
      }
      .dataTable th{
        position:static;
        background:#eef3f7;
        color:#111;
      }
      .dataTable td{
        color:#222;
        background:#fff;
      }
      code,
      .dataTable code{
        color:#111 !important;
        background:#f0f0f0 !important;
      }
      a{
        color:#0c5b91 !important;
        text-decoration:underline;
      }
    }
  `.trim();
}

function whitePaperMermaidScript(){
  return `
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
      mermaid.initialize({
        startOnLoad: true,
        securityLevel: 'loose',
        theme: 'dark'
      });
    </script>
  `.trim();
}

function releaseNotesStyles(){
  return `
${projectGuideStyles()}
    .releaseNoteMeta{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
      gap:12px;
      margin:0 0 18px;
    }
    .releaseNoteCard{
      padding:14px 16px;
      border-radius:16px;
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
    }
    .releaseNoteCard strong{
      display:block;
      margin-bottom:6px;
      color:#eef8ff;
      font-size:12px;
      letter-spacing:.12em;
      text-transform:uppercase;
    }
    .releaseNoteCard span{
      display:block;
      color:var(--muted);
      line-height:1.5;
    }
    .releaseNoteSummary{
      margin:0 0 16px;
      color:var(--muted);
      line-height:1.7;
      font-size:15px;
    }
    .releaseNoteActions{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin:0 0 18px;
    }
  `.trim();
}

function applicationGuideStyles(){
  return `
    .previewNote{
      margin-top:16px;
      padding:14px 16px;
      border-radius:18px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(255,255,255,0.04);
      color:var(--soft);
      line-height:1.6;
      font-size:14px;
    }
    .audioAction{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-width:106px;
      padding:9px 14px;
      border-radius:999px;
      border:1px solid rgba(105,226,167,0.34);
      background:rgba(105,226,167,0.14);
      color:var(--text);
      font:inherit;
      font-size:13px;
      letter-spacing:.04em;
      cursor:pointer;
    }
    .audioAction:hover{
      background:rgba(105,226,167,0.2);
    }
    .audioAction.isCompact{
      min-width:0;
      padding:7px 10px;
      font-size:12px;
      letter-spacing:.02em;
    }
    .audioStatus{
      margin-top:16px;
      padding:12px 14px;
      border-radius:16px;
      background:rgba(6,15,24,0.72);
      border:1px solid rgba(122,195,255,0.18);
      color:#d9f6ff;
      font-size:14px;
      line-height:1.55;
    }
    .audioStatus.error{
      border-color:rgba(255,128,128,0.3);
      color:#ffd8d8;
    }
    .toneTag,.swatchTag{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:4px 8px;
      border-radius:999px;
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.08);
      font-size:12px;
      color:#eef8ff;
      margin:0 8px 8px 0;
    }
    .toneTag code,.swatchTag code{
      background:none;
      padding:0;
      color:inherit;
    }
    .swatch{
      width:12px;
      height:12px;
      border-radius:50%;
      border:1px solid rgba(255,255,255,0.35);
      box-shadow:0 0 0 4px rgba(255,255,255,0.04);
    }
    .visualGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
      gap:16px;
    }
    .visualCard{
      padding:18px;
      border-radius:20px;
      background:var(--card2);
      border:1px solid rgba(255,255,255,0.08);
    }
    .visualCard h3{
      margin:0 0 10px;
      font-size:18px;
    }
    .visualCard p{
      margin:0 0 14px;
      color:var(--muted);
      line-height:1.6;
    }
    .visualMeta{
      display:grid;
      gap:8px;
      font-size:13px;
      color:var(--soft);
    }
    .visualMeta strong{
      color:#eff7ff;
      font-weight:600;
    }
    .catalogMedia{
      display:grid;
      gap:10px;
      min-width:190px;
    }
    .catalogMediaGrid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(108px,1fr));
      gap:10px;
      align-items:stretch;
    }
    .catalogMediaItem{
      min-width:0;
      padding:8px;
      border-radius:14px;
      background:rgba(6,15,24,0.66);
      border:1px solid rgba(255,255,255,0.08);
    }
    .catalogMediaLabel{
      display:block;
      margin:0 0 6px;
      color:#dff7ff;
      font-size:11px;
      line-height:1.35;
      letter-spacing:.02em;
      text-transform:uppercase;
    }
    .catalogMediaNote{
      display:block;
      margin-top:6px;
      color:var(--soft);
      font-size:11px;
      line-height:1.35;
    }
    .catalogMediaImg{
      display:block;
      width:100%;
      max-height:126px;
      object-fit:contain;
      image-rendering:auto;
      border-radius:8px;
      background:#02070d;
      border:1px solid rgba(255,255,255,0.08);
    }
    .catalogMediaImg.isPixelated{
      image-rendering:pixelated;
    }
    .catalogMediaExpand{
      margin-top:8px;
      border-radius:10px;
      background:rgba(126,242,255,0.045);
      border:1px solid rgba(126,242,255,0.12);
      overflow:hidden;
    }
    .catalogMediaExpand summary{
      cursor:pointer;
      list-style:none;
      padding:7px 9px;
      color:#dff7ff;
      font-size:11px;
      font-weight:800;
      letter-spacing:.04em;
      text-transform:uppercase;
    }
    .catalogMediaExpand summary::-webkit-details-marker{
      display:none;
    }
    .catalogMediaExpand summary::after{
      content:"";
      display:none;
    }
    .catalogMediaExpand .mediaSummaryOpen{
      display:none;
    }
    .catalogMediaExpand[open] summary::after{
      content:"";
    }
    .catalogMediaExpand[open] .mediaSummaryClosed{
      display:none;
    }
    .catalogMediaExpand[open] .mediaSummaryOpen{
      display:inline;
    }
    .catalogMediaExpand[open] summary{
      position:fixed;
      z-index:1002;
      top:18px;
      right:22px;
      min-width:168px;
      border-radius:12px;
      border:1px solid rgba(126,242,255,0.34);
      background:#061320;
      box-shadow:0 12px 34px rgba(0,0,0,0.44);
    }
    .catalogMediaExpanded{
      padding:10px;
      border-top:1px solid rgba(126,242,255,0.10);
      background:rgba(1,6,12,0.82);
    }
    .catalogMediaExpand[open] .catalogMediaExpanded{
      position:fixed;
      inset:0;
      z-index:1001;
      display:grid;
      grid-template-rows:auto minmax(0,1fr);
      gap:14px;
      padding:74px 24px 24px;
      overflow:hidden;
      background:rgba(1,6,12,0.96);
      border:0;
    }
    .catalogMediaExpandedHeader{
      max-width:1440px;
      margin:0 auto;
      color:#dff7ff;
    }
    .catalogMediaExpandedHeader strong{
      display:block;
      color:#f2fbff;
      font-size:18px;
      line-height:1.25;
    }
    .catalogMediaExpandedHeader p{
      margin:6px 0 0;
      color:var(--muted);
      font-size:13px;
      line-height:1.45;
    }
    .catalogMediaExpandedScroll{
      min-width:0;
      min-height:0;
      max-width:1440px;
      width:100%;
      margin:0 auto;
      overflow:auto;
      border-radius:16px;
      border:1px solid rgba(126,242,255,0.16);
      background:#02070d;
      box-shadow:0 18px 60px rgba(0,0,0,0.42);
    }
    .catalogMediaExpanded img{
      display:block;
      width:auto;
      max-width:100%;
      max-height:min(70vh,760px);
      margin:0 auto;
      object-fit:contain;
      border-radius:8px;
      background:#02070d;
      border:1px solid rgba(255,255,255,0.10);
    }
    .catalogMediaExpand[open] .catalogMediaExpandedScroll img{
      max-width:100%;
      max-height:none;
      border:0;
      border-radius:0;
    }
    .catalogMediaExpand[open].isContactSheet .catalogMediaExpandedScroll img{
      max-width:none;
      max-height:none;
      margin:0 auto;
    }
    .catalogMediaExpanded img.isPixelated{
      image-rendering:pixelated;
    }
    .mediaCropExpanded{
      max-width:100%;
      margin:0 auto;
    }
    .mediaCrop{
      position:relative;
      overflow:hidden;
      max-width:100%;
      margin:0 auto;
      border-radius:8px;
      background:#02070d;
      border:1px solid rgba(255,255,255,0.08);
    }
    .mediaCrop img{
      display:block;
      max-width:none;
      transform-origin:top left;
      image-rendering:pixelated;
    }
    .pixelSprite{
      display:grid;
      grid-template-columns:repeat(var(--pixel-cols), 8px);
      gap:1px;
      justify-content:center;
      align-content:center;
      min-height:58px;
      padding:10px 8px;
      border-radius:8px;
      background:#02070d;
      border:1px solid rgba(255,255,255,0.08);
    }
    .pixelSprite span{
      width:8px;
      height:8px;
      background:transparent;
    }
    .pixelSprite span.isFilled{
      background:var(--pixel-color);
      box-shadow:0 0 10px color-mix(in srgb, var(--pixel-color), transparent 55%);
    }
    .mediaPlaceholder{
      padding:10px;
      border-radius:12px;
      background:rgba(255,255,255,0.045);
      border:1px dashed rgba(255,255,255,0.16);
      color:var(--soft);
      font-size:12px;
      line-height:1.45;
    }
    .conformanceActions{
      display:flex;
      flex-wrap:wrap;
      gap:8px;
    }
    .waveformStrip{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(132px,1fr));
      gap:8px;
    }
    .waveformStrip .catalogMediaImg{
      max-height:86px;
    }
    .distributionChartWrap{
      margin:0 0 16px;
      border-radius:20px;
      border:1px solid rgba(255,255,255,0.08);
      background:rgba(6,15,24,0.66);
      overflow:auto;
    }
    .distributionChart{
      display:block;
      width:100%;
      min-width:0;
      height:auto;
    }
    .personaReadout{
      margin-top:16px;
    }
    .personaReadout .bulletList{
      margin-top:12px;
    }
    .previewFrame{
      position:absolute;
      width:1px;
      height:1px;
      opacity:0;
      pointer-events:none;
      border:0;
      inset:auto auto 0 0;
    }
  `.trim();
}

function statusLabel(status){
  if(status === 'done') return 'Completed';
  if(status === 'in_progress') return 'In Progress';
  return 'Up Next';
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

function releaseNoteDateLong(value){
  if(!value) return '--';
  const date = new Date(`${value}T12:00:00Z`);
  if(Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function resolveReleaseNoteSource(note){
  const file = String(note?.sourceDoc || '').trim();
  if(!file) return '';
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? file : '';
}

function releaseNoteGitHubHref(commit, sourceDoc){
  if(!sourceDoc) return '';
  return `https://github.com/sgwoods/Codex-Test1/blob/${commit}/${sourceDoc}`;
}

function findReleaseNote(notes, ref = {}){
  if(!Array.isArray(notes) || !notes.length) return null;
  const version = String(ref.releaseNoteVersion || ref.version || '').trim();
  const date = String(ref.releaseNoteDate || ref.date || '').trim();
  const title = String(ref.releaseNoteTitle || '').trim().toLowerCase();
  return notes.find(note => {
    if(version && String(note.version || '').trim() !== version) return false;
    if(date && String(note.date || '').trim() !== date) return false;
    if(title && String(note.title || '').trim().toLowerCase() !== title) return false;
    return version || date || title;
  }) || null;
}

function buildReleaseDashboard(buildInfo, latestNote, dashboard, releaseNotes){
  const template = read(DASHBOARD_TEMPLATE);
  const conformanceSummary = loadConformanceDashboardSummary();
  const latestNoteLink = latestNote ? `release-notes.html#${releaseNoteAnchor(latestNote)}` : 'release-notes.html';
  const timeline = (dashboard.timeline || []).map((step, index) => {
    const note = findReleaseNote(releaseNotes, step);
    const noteHref = note ? `release-notes.html#${releaseNoteAnchor(note, index)}` : '';
    const titleHtml = noteHref
      ? `<a href="${esc(noteHref)}">${esc(step.title)}</a>`
      : esc(step.title);
    return `
    <article class="step ${esc(step.status)}">
      <div class="stepHeader">
        <h2 class="stepTitle">${titleHtml}</h2>
        <span class="badge">${esc(statusLabel(step.status))}</span>
      </div>
      <p>${esc(step.summary)}</p>
      ${noteHref ? `<div class="stepActions"><a class="stepLink" href="${esc(noteHref)}">Read detailed release note</a></div>` : ''}
    </article>
  `;
  }).join('\n');
  const legend = (dashboard.legend || []).map(item => `
    <div class="legendItem">
      <strong>${esc(item.label)}</strong>
      <span>${esc(item.detail)}</span>
    </div>
  `).join('\n');
  const body = `
    <main class="shell">
      <section class="hero">
        <div class="heroTop">
          <span class="eyebrow">Release Dashboard</span>
          <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/">Game Home</a>
        </div>
        <h1>${esc(buildInfo.product || 'Aurora Galactica')}</h1>
        <p>${esc(dashboard.strapline || '')}</p>
        <div class="meta">
          <div class="metaCard">
            <span class="metaLabel">Target</span>
            <span class="metaValue">${esc(dashboard.targetVersion || displayBuildVersion(buildInfo))}</span>
          </div>
          <div class="metaCard">
            <span class="metaLabel">Current Focus</span>
            <span class="metaValue">${esc(dashboard.currentFocus || 'Release planning')}</span>
          </div>
          <div class="metaCard">
            <span class="metaLabel">Current Release</span>
            <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
          </div>
          <div class="metaCard">
            <span class="metaLabel">Updated</span>
            <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
          </div>
        </div>
      </section>
      ${renderReleaseVersionDomains(buildInfo)}
      <section class="versionDomains">
        <h2>Conformance Dashboard</h2>
        <p>The current release path carries a read-only conformance dashboard alongside the game, platform guides, and release dashboard. It summarizes scores, confidence, evidence, ingestion coverage, and compute spend without publishing the raw ingestion workspace.</p>
        <div class="versionGrid">
          <article class="versionCard">
            <strong>Overall</strong>
            <span>${esc(conformanceSummary.overallCurrent || '--')}</span>
            <small>Current measured release conformance rollup.</small>
          </article>
          <article class="versionCard">
            <strong>Weakest Metric</strong>
            <span>${esc(conformanceSummary.weakestCurrent || '--')}</span>
            <small>${esc(conformanceSummary.weakestMetric || 'No measured metric available.')}</small>
          </article>
          <article class="versionCard">
            <strong>Generated</strong>
            <span>${esc(conformanceSummary.generatedAt ? conformanceSummary.generatedAt.slice(0, 10) : '--')}</span>
            <small>${esc(conformanceSummary.commit ? `source ${conformanceSummary.commit}` : 'Run the conformance dashboard builder before release review.')}</small>
          </article>
        </div>
        <div class="heroLinks">
          <a class="button" href="assets/conformance-dashboard.html">Open conformance dashboard</a>
          <a class="button" href="public-project-page.html">Open lane project page</a>
          <a class="button" href="release-notes.html">Open release notes</a>
        </div>
      </section>
      <section class="timeline">
        ${timeline}
      </section>
      <section class="legend">
        <h2>Legend</h2>
        <div class="legendGrid">
          ${legend}
        </div>
        <p class="footer">
          Latest release note: <a href="${esc(latestNoteLink)}"><strong>${esc(latestNote.title)}</strong></a>. Live game:
          <a href="https://sgwoods.github.io/Aurora-Galactica/">sgwoods.github.io/Aurora-Galactica/</a>
        </p>
      </section>
    </main>
  `.trim();
  return template
    .replace('{{RELEASE_DASHBOARD_STYLES}}', dashboardStyles())
    .replace('{{RELEASE_DASHBOARD_BODY}}', body)
    .trimEnd() + '\n';
}

function buildReleaseNotesPage(buildInfo, latestNote, releaseNotes){
  const template = read(PROJECT_GUIDE_TEMPLATE);
  const notes = Array.isArray(releaseNotes) ? releaseNotes : [];
  const toc = notes.map((note, index) => `
    <li><a href="#${esc(releaseNoteAnchor(note, index))}">${esc(`${note.version || 'Unversioned'} · ${note.title || 'Release note'}`)}</a></li>
  `).join('\n');
  const sections = notes.map((note, index) => {
    const anchor = releaseNoteAnchor(note, index);
    const sourceDoc = resolveReleaseNoteSource(note);
    const sourceHref = releaseNoteGitHubHref(buildInfo.commit, sourceDoc);
    const sourceBody = sourceDoc
      ? `<div class="markdown">${renderMarkdown(read(path.join(ROOT, sourceDoc)))}</div>`
      : `<div class="markdown"><p>${esc(note.summary || 'Detailed release-note source document not yet attached for this milestone. The summary in release-notes.json is the current visible note.')}</p></div>`;
    return `
      <section class="section" id="${esc(anchor)}">
        <div class="sectionHeader">
          <h2>${esc(note.title || 'Release note')}</h2>
          <p>${esc(note.summary || '')}</p>
        </div>
        <div class="docWrap">
          <div class="releaseNoteMeta">
            <div class="releaseNoteCard">
              <strong>Version</strong>
              <span>${esc(note.version || '--')}</span>
            </div>
            <div class="releaseNoteCard">
              <strong>Date</strong>
              <span>${esc(releaseNoteDateLong(note.date))}</span>
            </div>
            <div class="releaseNoteCard">
              <strong>Source</strong>
              <span>${esc(sourceDoc || 'release-notes.json summary')}</span>
            </div>
          </div>
          <p class="releaseNoteSummary">${esc(note.summary || '')}</p>
          <div class="releaseNoteActions">
            ${sourceHref ? `<a class="button" href="${esc(sourceHref)}">Open source markdown</a>` : ''}
            <a class="button" href="release-dashboard.html">Back to release dashboard</a>
          </div>
          ${sourceBody}
        </div>
      </section>
    `.trim();
  }).join('\n');
  const body = `
    <main class="shell">
      <div class="main">
        <section class="hero">
          <div class="heroTop">
            <span class="eyebrow">Release Notes</span>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/">Game Home</a>
            <a class="homeLink" href="release-dashboard.html">Release Dashboard</a>
          </div>
          <h1>Aurora / Platinum Release Notes</h1>
          <p>Readable hosted release notes for the public Aurora / Platinum milestones. Use this page from the release dashboard timeline when you want the fuller release story instead of the short milestone summary.</p>
          <div class="goal"><strong>Latest note:</strong> ${esc(latestNote?.title || 'No release note yet')}</div>
          <div class="meta">
            <div class="metaCard">
              <span class="metaLabel">Current Release</span>
              <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Lane</span>
              <span class="metaValue">${esc(buildInfo.releaseChannel)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Entries</span>
              <span class="metaValue">${esc(String(notes.length))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Updated</span>
              <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
            </div>
          </div>
          <div class="heroLinks">
            <a class="button" href="index.html">Open current lane build</a>
            <a class="button" href="release-dashboard.html">Open release dashboard</a>
            <a class="button" href="public-project-page.html">Open lane project page</a>
            <a class="button" href="project-guide.html">Open project guide</a>
          </div>
        </section>
        ${sections}
      </div>
      <aside class="toc">
        <h2>Release Index</h2>
        <p>This page is generated from <code>release-notes.json</code> plus any linked detailed release-note Markdown documents committed in the repo.</p>
        <ul>
          ${toc}
        </ul>
        <p class="footer">
          Latest release note: <strong>${esc(latestNote?.title || 'No release note yet')}</strong><br>
          Release ${esc(displayBuildVersion(buildInfo))} · Updated ${esc(publicDateLong(buildInfo))}
        </p>
      </aside>
    </main>
  `.trim();
  return template
    .replace('{{PROJECT_GUIDE_TITLE}}', 'Aurora Release Notes')
    .replace('{{PROJECT_GUIDE_STYLES}}', releaseNotesStyles())
    .replace('{{PROJECT_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function renderGuideSection(section){
  const cards = (section.cards || []).map(card => `
    <article class="card">
      <h3>${esc(card.title)}</h3>
      <p>${esc(card.body)}</p>
    </article>
  `).join('\n');
  const bullets = (section.bullets || []).map(item => `
    <li>${esc(item)}</li>
  `).join('\n');
  const links = (section.links || []).map(item => `
    <article class="linkCard">
      <a href="${esc(item.href)}">${esc(item.label)}</a>
      <p>${esc(item.detail)}</p>
    </article>
  `).join('\n');
  const table = section.table && Array.isArray(section.table.columns) && Array.isArray(section.table.rows)
    ? `
      <div class="tableWrap">
        <table class="dataTable">
          <thead>
            <tr>${section.table.columns.map(column => `<th>${esc(column)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${section.table.rows.map(row => `
              <tr>${row.map(cell => `<td>${renderInlineMarkdown(String(cell ?? ''))}</td>`).join('')}</tr>
            `).join('\n')}
          </tbody>
        </table>
      </div>
    `.trim()
    : '';
  let body = '';
  if(cards) body += `<div class="cardGrid">\n${cards}\n</div>`;
  if(bullets) body += `${body ? '\n' : ''}<ul class="bulletList">\n${bullets}\n</ul>`;
  if(links) body += `${body ? '\n' : ''}<div class="linkGrid">\n${links}\n</div>`;
  if(table) body += `${body ? '\n' : ''}${table}`;
  return `
    <section class="section" id="${esc(section.id)}">
      <div class="sectionHeader">
        <h2>${esc(section.title)}</h2>
        <p>${esc(section.summary || '')}</p>
      </div>
      ${body}
    </section>
  `;
}

function renderInlineMarkdown(text=''){
  function rewriteInlineHref(rawHref=''){
    const href = String(rawHref || '').trim();
    if(!href) return href;
    if(/^(?:https?:|mailto:|data:|#|\/)/i.test(href)) return href;
    if(/\.(?:md|json|sql|toml|txt)$/i.test(href)){
      return `${ACTIVE_SOURCE_BLOB_BASE}${href.replace(/^\.\//, '')}`;
    }
    return href;
  }

  function rewriteInlineImageSrc(rawSrc=''){
    const src = String(rawSrc || '').trim();
    if(!src) return src;
    if(/^(?:https?:|data:|assets\/)/i.test(src)) return src;
    return catalogMediaHref(src);
  }

  let out = esc(text);
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img alt="${alt}" src="${esc(rewriteInlineImageSrc(src))}">`);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${esc(rewriteInlineHref(href))}">${label}</a>`);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function renderMarkdown(md='', options = {}){
  const allowMermaid = !!options.mermaid;
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  if(lines[0] && /^#\s+/.test(lines[0])) lines.shift();
  const out = [];
  let i = 0;

  function splitTableRow(line){
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
  }

  function isTableDelimiter(line){
    return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*(?:\s*:?-{3,}:?\s*)?\|?\s*$/.test(line);
  }

  function renderList(start, ordered){
    const pattern = ordered ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
    const stack = [];
    let html = '';
    let j = start;
    const tag = ordered ? 'ol' : 'ul';
    while(j < lines.length){
      const m = lines[j].match(pattern);
      if(!m) break;
      const indent = m[1].length;
      const text = m[2];
      while(stack.length && indent < stack[stack.length - 1]){
        html += `</li></${tag}>`;
        stack.pop();
      }
      if(!stack.length || indent > stack[stack.length - 1]){
        html += `<${tag}>`;
        stack.push(indent);
      }else if(indent === stack[stack.length - 1]){
        html += '</li>';
      }
      html += `<li>${renderInlineMarkdown(text)}`;
      j++;
    }
    while(stack.length){
      html += `</li></${tag}>`;
      stack.pop();
    }
    return { html, next: j };
  }

  while(i < lines.length){
    const line = lines[i];
    if(!line.trim()){ i++; continue; }
    if(line.includes('|') && i + 1 < lines.length && isTableDelimiter(lines[i + 1])){
      const headers = splitTableRow(line);
      const rows = [];
      i += 2;
      while(i < lines.length && lines[i].trim() && lines[i].includes('|')){
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      out.push(`
        <div class="tableWrap">
          <table class="dataTable">
            <thead>
              <tr>${headers.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      `.trim());
      continue;
    }
    if(/^\s*```/.test(line)){
      const lang = line.replace(/^\s*```/, '').trim();
      const block = [];
      i++;
    while(i < lines.length && !/^\s*```/.test(lines[i])){
      block.push(lines[i]);
      i++;
    }
    i++;
    if(allowMermaid && String(lang || '').toLowerCase() === 'mermaid'){
      out.push(`<div class="mermaid">${esc(block.join('\n'))}</div>`);
    }else{
      out.push(`<pre><code${lang ? ` data-lang="${esc(lang)}"` : ''}>${esc(block.join('\n'))}</code></pre>`);
    }
    continue;
  }
    const heading = line.match(/^\s*(#{2,5})\s+(.*)$/);
    if(heading){
      const level = Math.min(6, heading[1].length + 1);
      out.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      i++;
      continue;
    }
    if(/^(\s*)[-*]\s+/.test(line)){
      const list = renderList(i, false);
      out.push(list.html);
      i = list.next;
      continue;
    }
    if(/^(\s*)\d+\.\s+/.test(line)){
      const list = renderList(i, true);
      out.push(list.html);
      i = list.next;
      continue;
    }
    if(/^\s*>\s?/.test(line)){
      const quote = [];
      while(i < lines.length && /^\s*>\s?/.test(lines[i])){
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${renderMarkdown(quote.join('\n'), options)}</blockquote>`);
      continue;
    }
    const para = [line.trim()];
    i++;
    while(i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^\s*(#{2,5})\s+/.test(lines[i]) && !/^(\s*)[-*]\s+/.test(lines[i]) && !/^(\s*)\d+\.\s+/.test(lines[i]) && !/^\s*>\s?/.test(lines[i])){
      para.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${renderInlineMarkdown(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

function renderSourceDocSection(section){
  const file = path.join(ROOT, section.file);
  const source = read(file);
  const body = renderMarkdown(source, {
    mermaid: section.renderMode === 'mermaid-markdown'
  });
  return `
    <section class="section" id="${esc(section.id)}">
      <div class="sectionHeader">
        <h2>${esc(section.title)}</h2>
        <p>${esc(section.summary || '')}</p>
      </div>
      <div class="docWrap">
        <p class="docMeta">Generated from <code>${esc(section.file)}</code> during build.</p>
        <div class="markdown">
          ${body}
        </div>
      </div>
    </section>
  `;
}

function buildDocumentationProvenanceGuideSection(provenance){
  const surfaces = Array.isArray(provenance?.surfaces) ? provenance.surfaces : [];
  return {
    id: 'documentation-provenance',
    title: 'Documentation Provenance',
    summary: provenance?.purpose || 'Build-time map from hosted documentation sections back to persistent source artifacts.',
    table: {
      columns: ['Visible Surface', 'Generated From', 'Persistent Inputs', 'Freshness Rule'],
      rows: surfaces.map(surface => {
        const sections = Array.isArray(surface.sections) ? surface.sections : [];
        const sourceArtifacts = Array.from(new Set(sections.flatMap(section => Array.isArray(section.sourceArtifacts) ? section.sourceArtifacts : [])));
        const freshness = sections.map(section => `${section.label || section.id}: ${section.currentness || 'declared in manifest'}`).join(' ');
        return [
          `${surface.title || surface.id}\n\n\`${surface.visiblePath || ''}\``,
          `\`${surface.builder || 'build pipeline'}\`\n\nTemplate: \`${surface.template || 'n/a'}\``,
          sourceArtifacts.map(item => `\`${item}\``).join(', '),
          freshness
        ];
      })
    }
  };
}

function buildChallengeStageEffortGuideSection(){
  const artifact = loadChallengeStageConformance();
  const summary = artifact.summary || {};
  const rows = (artifact.stageRows || []).map(row => [
    `Stage ${row.stage || ''} / Challenge ${row.challengeNumber || ''}`,
    `Interest: **${row.interestingFactor10 ?? 'n/a'}/10**\n\nConformance: **${row.conformanceScore10 ?? 'n/a'}/10**\n\nBest ref: \`${row.bestReferenceMatch?.labelId || 'pending'}\` (${row.referenceMatchScore10 ?? 'n/a'}/10)`,
    row.currentRead || 'Current read pending.',
    (row.criticalGaps || [])[0] || 'Critical gap pending.',
    (row.nextActions || [])[0] || 'Next action pending.'
  ]);
  return {
    id: 'challenge-stage-conformance-effort',
    title: 'Challenge Stage Conformance Effort',
    summary: `Living sub-effort for Galaga-like challenge stages. Current strict read: ${summary.interestingFactorScore10 ?? 'n/a'}/10 interesting factor, ${summary.movementConformanceScore10 ?? 'n/a'}/10 movement, ${summary.graphicalConformanceScore10 ?? 'n/a'}/10 graphics, ${summary.alienNoveltyScore10 ?? 'n/a'}/10 alien novelty, ${summary.playerShotOpportunityScore10 ?? 'n/a'}/10 shot opportunity, and ${summary.score10 ?? 'n/a'}/10 challenge-stage conformance. ${summary.weakestFinding || 'Run the challenge-stage analyzer to refresh the report.'}`,
    cards: [
      {
        title: 'Problem',
        body: summary.playerMeaning || 'Challenge stages must be safe bonus-stage exhibitions and also memorable authored visual set pieces with readable alien movement and novelty.'
      },
      {
        title: 'Measurement',
        body: 'Generated from `reference-artifacts/analyses/challenge-stage-conformance/latest.json`, Galaga path-reference labels, Aurora browser runtime probes, and challenge timing/collision guardrails. Safety is a guardrail; broad legacy coverage is diagnostic only.'
      },
      {
        title: 'Next Best Step',
        body: (artifact.improvementPlan || [])[2] || 'Attack Stage 3 first: rebuild it against the Galaga challenge-1 arrival and late-wave references while preserving 0 enemy shots, 0 attack starts, and 0 ship losses.'
      }
    ],
    links: [
      {
        label: 'Open Challenge Deep Dive',
        href: 'application-guide.html#challenge-stage-conformance',
        detail: 'Generated Application Guide table with per-stage graphics, movement, critical gaps, and next actions.'
      },
      {
        label: 'Open Rendered Effort Report',
        href: 'project-guide.html#challenge-stage-conformance-analysis-doc',
        detail: 'Human-readable generated report with executive summary, stage-by-stage critique, plan, measurements, and success criteria.'
      },
      {
        label: 'Open Conformance Dashboard',
        href: 'conformance-dashboard.html?game=aurora-galactica#conformance',
        detail: 'Dashboard context for comparing this sub-effort against other conformance priorities and costs.'
      }
    ],
    table: {
      columns: ['Stage', 'Measurement', 'Aurora Current', 'Current Gap', 'Recommended Next Step'],
      rows
    }
  };
}

function buildProjectGuide(buildInfo, latestNote, guide){
  const template = read(PROJECT_GUIDE_TEMPLATE);
  const provenanceSection = buildDocumentationProvenanceGuideSection(loadDocumentationProvenance());
  const guideSections = [...(guide.sections || []), buildChallengeStageEffortGuideSection(), provenanceSection];
  const orderedSections = [...guideSections, ...(guide.sourceDocs || [])];
  const toc = orderedSections.map(section => `
    <li><a href="#${esc(section.id)}">${esc(section.title)}</a></li>
  `).join('\n');
  const sections = guideSections.map(renderGuideSection).join('\n');
  const sourceDocs = (guide.sourceDocs || []).map(renderSourceDocSection).join('\n');
  const body = `
    <main class="shell">
      <div class="main">
        <section class="hero">
          <div class="heroTop">
            <span class="eyebrow">Project Guide</span>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/">Game Home</a>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/beta/">Beta Build</a>
          </div>
          <h1>${esc(guide.title || 'Project Guide')}</h1>
          <p>${esc(guide.strapline || '')}</p>
          <div class="goal"><strong>Current goal:</strong> ${esc(guide.currentGoal || '')}</div>
          <div class="meta">
            <div class="metaCard">
              <span class="metaLabel">Current Release</span>
              <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Lane</span>
              <span class="metaValue">${esc(buildInfo.releaseChannel)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Updated</span>
              <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Latest Note</span>
              <span class="metaValue">${esc(latestNote.title)}</span>
            </div>
          </div>
          <div class="heroLinks">
            <a class="button" href="index.html">Open current lane build</a>
            <a class="button" href="public-project-page.html">Open lane project page</a>
            <a class="button" href="white-paper.html">Open white paper</a>
            <a class="button" href="application-guide.html">Open Aurora application guide</a>
            <a class="button" href="platinum-guide.html">Open Platinum guide</a>
            <a class="button" href="player-guide.html">Open player guide</a>
            <a class="button" href="release-notes.html">Open release notes</a>
            <a class="button" href="release-dashboard.html">Open release dashboard</a>
            <a class="button" href="conformance-dashboard.html">Open conformance dashboard</a>
            <a class="button" href="https://github.com/sgwoods/Codex-Test1">Open repository</a>
          </div>
        </section>
        ${sections}
        ${sourceDocs}
      </div>
      <aside class="toc">
        <h2>Guide Index</h2>
        <p>This page is generated during the normal build so the hosted guide can stay aligned with the current repo state and release focus.</p>
        <ul>
          ${toc}
        </ul>
        <p class="footer">
          Latest release note: <strong>${esc(latestNote.title)}</strong><br>
          Release ${esc(displayBuildVersion(buildInfo))} · Updated ${esc(publicDateLong(buildInfo))}
        </p>
      </aside>
    </main>
  `.trim();
  return template
    .replace('{{PROJECT_GUIDE_TITLE}}', esc(guide.title || 'Project Guide'))
    .replace('{{PROJECT_GUIDE_STYLES}}', projectGuideStyles())
    .replace('{{PROJECT_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function buildWhitePaperGuide(buildInfo, latestNote, guide){
  const template = read(PROJECT_GUIDE_TEMPLATE);
  const whitePaperMeta = extractWhitePaperMeta(read(path.join(ROOT, 'WHITE_PAPER.md')));
  const orderedSections = [...(guide.sections || []), ...(guide.sourceDocs || [])];
  const toc = orderedSections.map(section => `
    <li><a href="#${esc(section.id)}">${esc(section.title)}</a></li>
  `).join('\n');
  const sections = (guide.sections || []).map(renderGuideSection).join('\n');
  const sourceDocs = (guide.sourceDocs || []).map(renderSourceDocSection).join('\n');
  const hasMermaid = (guide.sourceDocs || []).some(section => section.renderMode === 'mermaid-markdown');
  const body = `
    <main class="shell">
      <div class="main">
        <section class="hero">
          <div class="heroTop">
            <span class="eyebrow">White Paper</span>
            <a class="homeLink" href="project-guide.html">Project Guide</a>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/">Game Home</a>
          </div>
          <h1>${esc(guide.title || 'Aurora / Platinum White Paper')}</h1>
          <p>${esc(guide.strapline || '')}</p>
          <div class="goal"><strong>Current goal:</strong> ${esc(guide.currentGoal || '')}</div>
          <div class="meta">
            <div class="metaCard">
              <span class="metaLabel">White Paper Version</span>
              <span class="metaValue">${esc(whitePaperMeta.version)}</span>
            </div>
            <div class="metaCard whitePaperMetaCard">
              <span class="metaLabel">Updated</span>
              <span class="metaValue">${esc(whitePaperMeta.updatedDate)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Current Release</span>
              <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Lane</span>
              <span class="metaValue">${esc(buildInfo.releaseChannel)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">White Paper Status</span>
              <span class="metaValue">${esc(whitePaperMeta.status)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Built</span>
              <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Latest Note</span>
              <span class="metaValue">${esc(latestNote.title)}</span>
            </div>
          </div>
          <div class="heroLinks">
            <a class="button" href="index.html">Open current lane build</a>
            <a class="button whitePaperDocAction" href="white-paper.pdf">Open current lane PDF</a>
            <a class="button whitePaperDocAction" href="white-paper-pdf.json">Open PDF metadata</a>
            <a class="button" href="public-project-page.html">Open lane project page</a>
            <a class="button" href="project-guide.html">Open project guide</a>
            <a class="button" href="conformance-dashboard.html">Open conformance dashboard</a>
            <a class="button" href="#white-paper-related-work-doc">Open related work log</a>
            <a class="button" href="#white-paper-reviewer-checklist-doc">Open reviewer checklist</a>
            <a class="button" href="https://github.com/sgwoods/Codex-Test1/tree/main/white-paper">Open white-paper project area</a>
            <a class="button" href="https://github.com/sgwoods/Codex-Test1/blob/main/WHITE_PAPER.md">Open Markdown source</a>
          </div>
        </section>
        ${sections}
        ${sourceDocs}
      </div>
      <aside class="toc">
        <h2>White Paper Index</h2>
        <p>This page is generated during the normal build so the hosted white paper stays aligned with the repo-owned project area, release posture, and current narrative draft.</p>
        <ul>
          ${toc}
        </ul>
        <p class="footer">
          Latest release note: <strong>${esc(latestNote.title)}</strong><br>
          Release ${esc(displayBuildVersion(buildInfo))} · Updated ${esc(publicDateLong(buildInfo))}
        </p>
      </aside>
    </main>
    ${hasMermaid ? whitePaperMermaidScript() : ''}
  `.trim();
  return template
    .replace('{{PROJECT_GUIDE_TITLE}}', esc(guide.title || 'Aurora / Platinum White Paper'))
    .replace('{{PROJECT_GUIDE_STYLES}}', `${projectGuideStyles()}\n${whitePaperGuideStyles()}`)
    .replace('{{PROJECT_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function buildPublicProjectPage(buildInfo, latestNote, dashboard){
  const template = read(PUBLIC_PROJECT_PAGE_TEMPLATE);
  const templateSha = crypto.createHash('sha256').update(template).digest('hex').slice(0, 12);
  const syncedAt = buildInfo.builtAtUtc || new Date().toISOString();
  const conformanceData = loadConformanceDashboardData();
  const publicSections = buildPublicProjectSections(conformanceData, loadDocumentationProvenance());
  const releaseChannel = String(buildInfo.releaseChannel || '').toLowerCase();
  const isProduction = releaseChannel === 'production';
  const contextValue = isProduction ? 'Production lane' : 'Development lane';
  const contextNote = isProduction
    ? 'Generated from the production lane artifacts that feed the public release path.'
    : 'Generated from the development lane artifacts served locally and on hosted /dev.';
  const tokens = {
    PUBLIC_PAGE_EYEBROW: `${contextValue} Project Page`,
    PUBLIC_RELEASE_CONTEXT_VALUE: contextValue,
    PUBLIC_RELEASE_CONTEXT_NOTE: contextNote,
    PUBLIC_DATE_LONG: publicPageDateLong(buildInfo.builtAtUtc),
    BUILD_VERSION: displayBuildVersion(buildInfo),
    BUILD_RELEASE_ET: buildInfo.builtAtEt || buildInfo.released || '',
    BUILD_LABEL: buildInfo.label,
    PUBLIC_SOURCE_COMMIT: buildInfo.commit,
    PUBLIC_TEMPLATE_SHA: templateSha,
    PUBLIC_SYNCED_AT: String(syncedAt).replace(/\.\d{3}Z$/, 'Z'),
    PUBLIC_CURRENT_FOCUS: dashboard.currentFocus || latestNote.title || 'Active development',
    LATEST_RELEASE_TITLE: latestNote.title,
    LATEST_RELEASE_BODY: latestNote.summary,
    LANE_GAME_HREF: 'index.html',
    BETA_BUILD_HREF: 'https://sgwoods.github.io/Aurora-Galactica/beta/',
    LANE_RELEASE_DASHBOARD_HREF: 'release-dashboard.html',
    LANE_CONFORMANCE_DASHBOARD_HREF: 'conformance-dashboard.html',
    LANE_CONFORMANCE_DATA_HREF: 'conformance-dashboard-data.json',
    LANE_RELEASE_NOTES_HREF: 'release-notes.html',
    LANE_WHITE_PAPER_HREF: 'white-paper.html',
    LANE_PROJECT_GUIDE_HREF: 'project-guide.html',
    LANE_APPLICATION_GUIDE_HREF: 'application-guide.html',
    LANE_PLATINUM_GUIDE_HREF: 'platinum-guide.html',
    PUBLIC_FOOTER_NOTE: `${contextValue} project-page summary generated from lane build artifacts.`,
    ...publicSections
  };
  return fillBuildTokens(template, tokens).trimEnd() + '\n';
}

const AURORA_PIXEL_SPRITES = {
  'player-fighter': {
    label: 'Current Aurora player sprite',
    rows: ['..AA..', '.CBBC.', 'CABBAC', '.ABBA.', '..AA..'],
    colors: { A: '#9adfff', B: '#72c8ff', C: '#ff4658' }
  },
  'dual-fighter': {
    label: 'Current dual-fighter state',
    rows: ['..AA....AA..', '.CBBC..CBBC.', 'CABBACCABBAC', '.ABBA..ABBA.', '..AA....AA..'],
    colors: { A: '#9adfff', B: '#72c8ff', C: '#ff4658' }
  },
  'bee-line': {
    label: 'Current Aurora bee sprite',
    rows: ['...BB....', '.ABCCB.A.', 'AABBBB.AA', '.A.BB..A.', '..ACCBA..'],
    colors: { A: '#4e95ff', B: '#ffd24a', C: '#f08f2e' }
  },
  'but-line': {
    label: 'Current Aurora butterfly sprite',
    rows: ['...BB....', '.ABCCB.A.', 'AABBBB.AA', '.ABCCB.A.', '..ABBA..'],
    colors: { A: '#62a5ff', B: '#ff3d51', C: '#ffd25a' }
  },
  'boss-line': {
    label: 'Current Aurora boss sprite',
    rows: ['...CAAC..', '.AABBAA.', 'AABCCBAA', '.AABBAA.', '..ABBBA..'],
    colors: { A: '#60f0cf', B: '#5fe85c', C: '#cc5fff' }
  },
  'rogue-fighter': {
    label: 'Current Aurora rogue/captured-fighter sprite',
    rows: ['...CAAC..', '.AABBAA.', 'AABCCBAA', '.AABBAA.', '..ABBBA..'],
    colors: { A: '#a3cfff', B: '#ff5ea0', C: '#ffe36a' }
  },
  'challenge-dragonfly': {
    label: 'Current challenge dragonfly family',
    rows: ['.A...A.', '..BBB..', 'ABBCBBA', 'B.BBB.B', '..ACA..'],
    colors: { A: '#98ffab', B: '#94f0ff', C: '#ffe76f' }
  },
  'challenge-mosquito': {
    label: 'Current challenge mosquito family',
    rows: ['..A.A..', '.B.B.B.', 'BBCCBBB', '.ABCCA.', '..B.B..'],
    colors: { A: '#ffab85', B: '#ffe179', C: '#74f4ff' }
  }
};

const ALIEN_ROW_SPRITES = [
  [/bee|zako/i, 'bee-line'],
  [/butterfly|escort/i, 'but-line'],
  [/captured/i, 'rogue-fighter'],
  [/boss|command/i, 'boss-line'],
  [/challenge|specialty/i, 'challenge-dragonfly']
];

const ALIEN_REFERENCE_CONTEXT = {
  'bee-line': [{
    label: 'Galaga reference context',
    src: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-00m12s.png',
    note: 'Score-table context for role and color family.'
  }],
  'but-line': [{
    label: 'Galaga reference context',
    src: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-00m12s.png',
    note: 'Score-table context for role and color family.'
  }],
  'boss-line': [{
    label: 'Galaga boss context',
    src: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-00m12s.png',
    note: 'Score-table context for boss role and points.'
  }],
  'rogue-fighter': [{
    label: 'Capture/rescue context',
    src: 'reference-artifacts/analyses/galaga-audio-reference-video/contact-03.png',
    note: 'Reference-media context for capture and rescue flow.'
  }],
  'challenge-dragonfly': [{
    label: 'Challenge window context',
    src: 'reference-artifacts/analyses/aurora-level-expansion-cycle/challenge-stage-candidate/frames/contact-sheet-1s.png',
    note: 'Runtime evidence window for current challenge presentation.'
  }]
};

let galagaReferenceSpriteTargetsCache = null;
let galagaReferenceSpriteModelCache = null;
let applicationArtifactConformanceCache = null;
let challengeStageConformanceCache = null;
let levelVisualConformanceIndexCache = null;
let galagaTargetArtifactCoverageCache = null;
let galagaAlienVisualReferenceCache = null;
let galagaAlienMotionReferenceCache = null;
let galagaAlienCropPreviewsCache = null;
let galagaAlienTargetCropsCache = null;
let galagaTargetEvidenceAuditCache = null;
let galagaAlienTemporalTargetsCache = null;
let auroraRuntimeSpriteConformanceCache = null;
let auroraSpriteMotionCorrespondenceCache = null;
let auroraRuntimeVsGalagaTargetCropsCache = null;
let auroraImpactExplosionConformanceCache = null;
let spriteConformanceVariationPlanCache = null;

function loadGalagaReferenceSpriteTargets(){
  if(galagaReferenceSpriteTargetsCache) return galagaReferenceSpriteTargetsCache;
  if(!fs.existsSync(GALAGA_REFERENCE_SPRITE_TARGETS)){
    galagaReferenceSpriteTargetsCache = [];
    return galagaReferenceSpriteTargetsCache;
  }
  try {
    const artifact = readJson(GALAGA_REFERENCE_SPRITE_TARGETS);
    galagaReferenceSpriteTargetsCache = Array.isArray(artifact.targets) ? artifact.targets : [];
  } catch (err) {
    galagaReferenceSpriteTargetsCache = [];
  }
  return galagaReferenceSpriteTargetsCache;
}

function loadGalagaReferenceSpriteModels(){
  if(galagaReferenceSpriteModelCache) return galagaReferenceSpriteModelCache;
  if(!fs.existsSync(GALAGA_REFERENCE_SPRITE_MODEL)){
    galagaReferenceSpriteModelCache = [];
    return galagaReferenceSpriteModelCache;
  }
  try {
    const artifact = readJson(GALAGA_REFERENCE_SPRITE_MODEL);
    galagaReferenceSpriteModelCache = Array.isArray(artifact.targets) ? artifact.targets : [];
  } catch (err) {
    galagaReferenceSpriteModelCache = [];
  }
  return galagaReferenceSpriteModelCache;
}

function loadGalagaAlienVisualReference(){
  if(galagaAlienVisualReferenceCache) return galagaAlienVisualReferenceCache;
  if(!fs.existsSync(GALAGA_ALIEN_VISUAL_REFERENCE)){
    galagaAlienVisualReferenceCache = { entries: [], roleCoverage: [], summary: {} };
    return galagaAlienVisualReferenceCache;
  }
  try {
    const artifact = readJson(GALAGA_ALIEN_VISUAL_REFERENCE);
    galagaAlienVisualReferenceCache = Object.assign({}, artifact, {
      entries: Array.isArray(artifact.entries) ? artifact.entries : [],
      roleCoverage: Array.isArray(artifact.roleCoverage) ? artifact.roleCoverage : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    galagaAlienVisualReferenceCache = { entries: [], roleCoverage: [], summary: {} };
  }
  return galagaAlienVisualReferenceCache;
}

function loadGalagaAlienMotionReference(){
  if(galagaAlienMotionReferenceCache) return galagaAlienMotionReferenceCache;
  if(!fs.existsSync(GALAGA_ALIEN_MOTION_REFERENCE)){
    galagaAlienMotionReferenceCache = { roleTaxonomy: [], media: {}, summary: '' };
    return galagaAlienMotionReferenceCache;
  }
  try {
    const artifact = readJson(GALAGA_ALIEN_MOTION_REFERENCE);
    galagaAlienMotionReferenceCache = Object.assign({}, artifact, {
      roleTaxonomy: Array.isArray(artifact.roleTaxonomy) ? artifact.roleTaxonomy : [],
      media: artifact.media || {}
    });
  } catch (err) {
    galagaAlienMotionReferenceCache = { roleTaxonomy: [], media: {}, summary: '' };
  }
  return galagaAlienMotionReferenceCache;
}

function loadGalagaAlienCropPreviews(){
  if(galagaAlienCropPreviewsCache) return galagaAlienCropPreviewsCache;
  if(!fs.existsSync(GALAGA_ALIEN_CROP_PREVIEWS)){
    galagaAlienCropPreviewsCache = { regions: [], targetRolePlan: [], summary: {} };
    return galagaAlienCropPreviewsCache;
  }
  try {
    const artifact = readJson(GALAGA_ALIEN_CROP_PREVIEWS);
    galagaAlienCropPreviewsCache = Object.assign({}, artifact, {
      regions: Array.isArray(artifact.regions) ? artifact.regions : [],
      targetRolePlan: Array.isArray(artifact.targetRolePlan) ? artifact.targetRolePlan : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    galagaAlienCropPreviewsCache = { regions: [], targetRolePlan: [], summary: {} };
  }
  return galagaAlienCropPreviewsCache;
}

function loadGalagaAlienTargetCrops(){
  if(galagaAlienTargetCropsCache) return galagaAlienTargetCropsCache;
  if(!fs.existsSync(GALAGA_ALIEN_TARGET_CROPS)){
    galagaAlienTargetCropsCache = { targetCrops: [], roleSets: [], summary: {} };
    return galagaAlienTargetCropsCache;
  }
  try {
    const artifact = readJson(GALAGA_ALIEN_TARGET_CROPS);
    galagaAlienTargetCropsCache = Object.assign({}, artifact, {
      targetCrops: Array.isArray(artifact.targetCrops) ? artifact.targetCrops : [],
      roleSets: Array.isArray(artifact.roleSets) ? artifact.roleSets : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    galagaAlienTargetCropsCache = { targetCrops: [], roleSets: [], summary: {} };
  }
  return galagaAlienTargetCropsCache;
}

function loadGalagaTargetEvidenceAudit(){
  if(galagaTargetEvidenceAuditCache) return galagaTargetEvidenceAuditCache;
  if(!fs.existsSync(GALAGA_TARGET_EVIDENCE_AUDIT)){
    galagaTargetEvidenceAuditCache = { rows: [], summary: {} };
    return galagaTargetEvidenceAuditCache;
  }
  try {
    const artifact = readJson(GALAGA_TARGET_EVIDENCE_AUDIT);
    galagaTargetEvidenceAuditCache = Object.assign({}, artifact, {
      rows: Array.isArray(artifact.rows) ? artifact.rows : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    galagaTargetEvidenceAuditCache = { rows: [], summary: {} };
  }
  return galagaTargetEvidenceAuditCache;
}

function loadGalagaAlienTemporalTargets(){
  if(galagaAlienTemporalTargetsCache) return galagaAlienTemporalTargetsCache;
  if(!fs.existsSync(GALAGA_ALIEN_TEMPORAL_TARGETS)){
    galagaAlienTemporalTargetsCache = { rows: [], summary: {} };
    return galagaAlienTemporalTargetsCache;
  }
  try {
    const artifact = readJson(GALAGA_ALIEN_TEMPORAL_TARGETS);
    galagaAlienTemporalTargetsCache = Object.assign({}, artifact, {
      rows: Array.isArray(artifact.rows) ? artifact.rows : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    galagaAlienTemporalTargetsCache = { rows: [], summary: {} };
  }
  return galagaAlienTemporalTargetsCache;
}

function loadAuroraRuntimeSpriteConformance(){
  if(auroraRuntimeSpriteConformanceCache) return auroraRuntimeSpriteConformanceCache;
  if(!fs.existsSync(AURORA_RUNTIME_SPRITE_CONFORMANCE)){
    auroraRuntimeSpriteConformanceCache = { samples: [], temporalSamples: [], cadenceSamples: [], divePoseSamples: [], transitionPoseSamples: [], summary: {} };
    return auroraRuntimeSpriteConformanceCache;
  }
  try {
    const artifact = readJson(AURORA_RUNTIME_SPRITE_CONFORMANCE);
    auroraRuntimeSpriteConformanceCache = Object.assign({}, artifact, {
      samples: Array.isArray(artifact.samples) ? artifact.samples : [],
      temporalSamples: Array.isArray(artifact.temporalSamples) ? artifact.temporalSamples : [],
      cadenceSamples: Array.isArray(artifact.cadenceSamples) ? artifact.cadenceSamples : [],
      divePoseSamples: Array.isArray(artifact.divePoseSamples) ? artifact.divePoseSamples : [],
      transitionPoseSamples: Array.isArray(artifact.transitionPoseSamples) ? artifact.transitionPoseSamples : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    auroraRuntimeSpriteConformanceCache = { samples: [], temporalSamples: [], cadenceSamples: [], divePoseSamples: [], transitionPoseSamples: [], summary: {} };
  }
  return auroraRuntimeSpriteConformanceCache;
}

function loadAuroraSpriteMotionCorrespondence(){
  if(auroraSpriteMotionCorrespondenceCache) return auroraSpriteMotionCorrespondenceCache;
  if(!fs.existsSync(AURORA_SPRITE_MOTION_CORRESPONDENCE)){
    auroraSpriteMotionCorrespondenceCache = { rows: [], summary: {} };
    return auroraSpriteMotionCorrespondenceCache;
  }
  try {
    const artifact = readJson(AURORA_SPRITE_MOTION_CORRESPONDENCE);
    auroraSpriteMotionCorrespondenceCache = Object.assign({}, artifact, {
      rows: Array.isArray(artifact.rows) ? artifact.rows : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    auroraSpriteMotionCorrespondenceCache = { rows: [], summary: {} };
  }
  return auroraSpriteMotionCorrespondenceCache;
}

function loadAuroraRuntimeVsGalagaTargetCrops(){
  if(auroraRuntimeVsGalagaTargetCropsCache) return auroraRuntimeVsGalagaTargetCropsCache;
  if(!fs.existsSync(AURORA_RUNTIME_VS_GALAGA_TARGET_CROPS)){
    auroraRuntimeVsGalagaTargetCropsCache = { comparisons: [], summary: {} };
    return auroraRuntimeVsGalagaTargetCropsCache;
  }
  try {
    const artifact = readJson(AURORA_RUNTIME_VS_GALAGA_TARGET_CROPS);
    auroraRuntimeVsGalagaTargetCropsCache = Object.assign({}, artifact, {
      comparisons: Array.isArray(artifact.comparisons) ? artifact.comparisons : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    auroraRuntimeVsGalagaTargetCropsCache = { comparisons: [], summary: {} };
  }
  return auroraRuntimeVsGalagaTargetCropsCache;
}

function loadAuroraImpactExplosionConformance(){
  if(auroraImpactExplosionConformanceCache) return auroraImpactExplosionConformanceCache;
  if(!fs.existsSync(AURORA_IMPACT_EXPLOSION_CONFORMANCE)){
    auroraImpactExplosionConformanceCache = { samples: [], summary: {} };
    return auroraImpactExplosionConformanceCache;
  }
  try {
    const artifact = readJson(AURORA_IMPACT_EXPLOSION_CONFORMANCE);
    auroraImpactExplosionConformanceCache = Object.assign({}, artifact, {
      samples: Array.isArray(artifact.samples) ? artifact.samples : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    auroraImpactExplosionConformanceCache = { samples: [], summary: {} };
  }
  return auroraImpactExplosionConformanceCache;
}

function loadSpriteConformanceVariationPlan(){
  if(spriteConformanceVariationPlanCache) return spriteConformanceVariationPlanCache;
  if(!fs.existsSync(SPRITE_CONFORMANCE_VARIATION_PLAN)){
    spriteConformanceVariationPlanCache = { lanes: [], pipelineSteps: [], successCriteria: [], artifacts: [], principles: [] };
    return spriteConformanceVariationPlanCache;
  }
  try {
    const artifact = readJson(SPRITE_CONFORMANCE_VARIATION_PLAN);
    spriteConformanceVariationPlanCache = Object.assign({}, artifact, {
      lanes: Array.isArray(artifact.lanes) ? artifact.lanes : [],
      pipelineSteps: Array.isArray(artifact.pipelineSteps) ? artifact.pipelineSteps : [],
      successCriteria: Array.isArray(artifact.successCriteria) ? artifact.successCriteria : [],
      artifacts: Array.isArray(artifact.artifacts) ? artifact.artifacts : [],
      principles: Array.isArray(artifact.principles) ? artifact.principles : []
    });
  } catch (err) {
    spriteConformanceVariationPlanCache = { lanes: [], pipelineSteps: [], successCriteria: [], artifacts: [], principles: [] };
  }
  return spriteConformanceVariationPlanCache;
}

function loadApplicationArtifactConformance(){
  if(applicationArtifactConformanceCache) return applicationArtifactConformanceCache;
  if(!fs.existsSync(APPLICATION_ARTIFACT_CONFORMANCE)){
    applicationArtifactConformanceCache = { rows: [] };
    return applicationArtifactConformanceCache;
  }
  try {
    const artifact = readJson(APPLICATION_ARTIFACT_CONFORMANCE);
    applicationArtifactConformanceCache = Object.assign({}, artifact, {
      rows: Array.isArray(artifact.rows) ? artifact.rows : []
    });
  } catch (err) {
    applicationArtifactConformanceCache = { rows: [] };
  }
  return applicationArtifactConformanceCache;
}

function loadChallengeStageConformance(){
  if(challengeStageConformanceCache) return challengeStageConformanceCache;
  if(!fs.existsSync(CHALLENGE_STAGE_CONFORMANCE)){
    challengeStageConformanceCache = { stageRows: [], summary: {} };
    return challengeStageConformanceCache;
  }
  try {
    const artifact = readJson(CHALLENGE_STAGE_CONFORMANCE);
    challengeStageConformanceCache = Object.assign({}, artifact, {
      stageRows: Array.isArray(artifact.stageRows) ? artifact.stageRows : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    challengeStageConformanceCache = { stageRows: [], summary: {} };
  }
  return challengeStageConformanceCache;
}

function loadLevelVisualConformanceIndex(){
  if(levelVisualConformanceIndexCache) return levelVisualConformanceIndexCache;
  if(!fs.existsSync(LEVEL_VISUAL_CONFORMANCE_INDEX)){
    levelVisualConformanceIndexCache = { rows: [], summary: {} };
    return levelVisualConformanceIndexCache;
  }
  try {
    const artifact = readJson(LEVEL_VISUAL_CONFORMANCE_INDEX);
    levelVisualConformanceIndexCache = Object.assign({}, artifact, {
      rows: Array.isArray(artifact.rows) ? artifact.rows : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    levelVisualConformanceIndexCache = { rows: [], summary: {} };
  }
  return levelVisualConformanceIndexCache;
}

function loadGalagaTargetArtifactCoverage(){
  if(galagaTargetArtifactCoverageCache) return galagaTargetArtifactCoverageCache;
  if(!fs.existsSync(GALAGA_TARGET_ARTIFACT_COVERAGE)){
    galagaTargetArtifactCoverageCache = { rows: [], challengeStageCoverage: [], summary: {} };
    return galagaTargetArtifactCoverageCache;
  }
  try {
    const artifact = readJson(GALAGA_TARGET_ARTIFACT_COVERAGE);
    galagaTargetArtifactCoverageCache = Object.assign({}, artifact, {
      rows: Array.isArray(artifact.rows) ? artifact.rows : [],
      challengeStageCoverage: Array.isArray(artifact.challengeStageCoverage) ? artifact.challengeStageCoverage : [],
      summary: artifact.summary || {}
    });
  } catch (err) {
    galagaTargetArtifactCoverageCache = { rows: [], challengeStageCoverage: [], summary: {} };
  }
  return galagaTargetArtifactCoverageCache;
}

function challengeStageDisplayLabel(row = {}){
  const number = Number.isFinite(+row.challengeNumber) ? +row.challengeNumber : '';
  const marker = Number.isFinite(+row.stage) ? +row.stage : '';
  const between = marker ? `Levels ${marker}-${marker + 1}` : 'level bracket pending';
  return `Challenging Stage ${number || ''} (${between})`.trim();
}

function challengeStageInternalLabel(row = {}){
  const marker = Number.isFinite(+row.stage) ? `Internal challenge marker ${row.stage}` : 'Internal marker pending';
  const layout = row.auroraLayoutId || row.pathFamily || 'layout pending';
  return `${marker}; runtime layout ${layout}`;
}

function challengeRuntimeArtifactDir(row = {}){
  const candidates = [
    row.auroraWindowId,
    row.auroraLayoutId,
    row.pathFamily
  ].map(value => String(value || '').toLowerCase());
  if(candidates.some(value => value.includes('candidate') || value.includes('first-challenge') || value.includes('peel'))) return 'challenge-stage-candidate';
  if(candidates.some(value => value.includes('scorpion') || value.includes('cross'))) return 'challenge-stage-scorpion-cross';
  if(candidates.some(value => value.includes('stingray') || value.includes('hook'))) return 'challenge-stage-stingray-hook';
  if(candidates.some(value => value.includes('boss-led') || value.includes('loop'))) return 'challenge-stage-boss-led-loop';
  if(candidates.some(value => value.includes('crown') || value.includes('cascade'))) return 'challenge-stage-crown-split-cascade';
  return '';
}

function challengeRuntimeMedia(row = {}){
  const dir = challengeRuntimeArtifactDir(row);
  if(!dir) return '<div class="mediaPlaceholder">Aurora runtime contact sheet pending for this challenge stage.</div>';
  const src = `reference-artifacts/analyses/aurora-level-expansion-cycle/${dir}/frames/contact-sheet-1s.png`;
  if(!fs.existsSync(path.join(ROOT, src))){
    return '<div class="mediaPlaceholder">Aurora runtime contact sheet pending for this challenge stage.</div>';
  }
  return renderMediaImage({
    src,
    label: 'Aurora current contact sheet',
    alt: `${challengeStageDisplayLabel(row)} Aurora current state contact sheet`,
    note: row.pathFamily ? `Runtime path family: ${row.pathFamily}` : ''
  });
}

function challengeReferenceMedia(row = {}){
  const src = row.galagaReferenceAnchor || row.bestReferenceMatch?.sourceAnchor || '';
  if(!src || !fs.existsSync(path.join(ROOT, normalizeAssetSourcePath(src)))){
    return '<div class="mediaPlaceholder">Reference contact sheet pending for this challenge stage.</div>';
  }
  return renderMediaImage({
    src,
    label: 'Galaga target contact sheet',
    alt: `${challengeStageDisplayLabel(row)} Galaga target contact sheet`,
    note: row.bestReferenceMatch?.labelId ? `Best current reference label: ${row.bestReferenceMatch.labelId}` : ''
  });
}

function challengeList(items = []){
  const rows = Array.isArray(items) ? items.filter(Boolean) : [];
  if(!rows.length) return '<span class="docMeta">No items recorded.</span>';
  return `<ul>${rows.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function challengeScoreComponents(row = {}){
  const entries = Object.entries(row.scoreComponents || {});
  if(!entries.length) return '<span class="docMeta">Score component detail pending.</span>';
  return `<div class="challengeComponentGrid">${entries.map(([key, value]) => `<span>${esc(key)}: ${esc(value)}</span>`).join('')}</div>`;
}

function challengeSafetySummary(row = {}){
  const safety = row.safetyProbe || {};
  const counts = safety.eventCounts || {};
  return [
    `Enemy shots: ${counts.enemyShots ?? 'n/a'}`,
    `Attack starts: ${counts.enemyAttackStarts ?? 'n/a'}`,
    `Ship losses: ${counts.shipLosses ?? 'n/a'}`,
    `Challenge contacts: ${counts.challengeContacts ?? 'n/a'}`
  ];
}

function challengeMotionSummary(row = {}){
  const motion = row.motionProbe || {};
  return [
    `Samples: ${motion.activeSamples ?? motion.sampleCount ?? 'n/a'}/${motion.sampleCount ?? 'n/a'}`,
    `Active enemies: ${motion.minActive ?? 'n/a'}-${motion.maxActive ?? 'n/a'}`,
    `X range: ${motion.xRange ?? 'n/a'}`,
    `Y range: ${motion.yRange ?? 'n/a'}`,
    `Lower-field share: ${motion.lowerFieldShare ?? 'n/a'}`
  ];
}

function challengeTrajectoryDiagramMedia(row = {}){
  const src = row.trajectoryDiagram || '';
  if(!src || !fs.existsSync(path.join(ROOT, normalizeAssetSourcePath(src)))){
    return '<div class="mediaPlaceholder">Readable trajectory diagram pending for this challenge stage.</div>';
  }
  return renderMediaImage({
    src,
    label: 'Readable trajectory diagram',
    alt: `${challengeStageDisplayLabel(row)} reference-versus-current trajectory sketch`,
    note: 'Generated from the challenge-stage metric artifact. This is a human-review sketch of target/current motion vectors, not raw optical tracking.'
  });
}

function challengeObjectTrackDiagramMedia(row = {}){
  const src = row.objectTrackDiagram || '';
  if(!src || !fs.existsSync(path.join(ROOT, normalizeAssetSourcePath(src)))){
    return '<div class="mediaPlaceholder">Object-track and shot-opportunity diagram pending for this challenge stage.</div>';
  }
  return renderMediaImage({
    src,
    label: 'Object-track / shot-opportunity diagram',
    alt: `${challengeStageDisplayLabel(row)} object-track and shot-opportunity sketch`,
    note: 'Generated from runtime challenge sprite silhouettes and sampled player shot lanes. This is a readable probe of visible motion and scoreability, not yet Galaga target-crop optical matching.'
  });
}

function levelVisualScore(value, label = ''){
  if(value === null || value === undefined || !Number.isFinite(+value)){
    return label ? `${label}: pending` : 'pending';
  }
  return label ? `${label}: ${Number(value).toFixed(1)}/10` : `${Number(value).toFixed(1)}/10`;
}

function levelVisualStatus(row = {}){
  const analysis = row.analysis || {};
  if(row.kind === 'challenge') return 'Exact challenge target';
  if(row.targetWindow?.exact) return 'Exact regular target';
  if(analysis.status) return analysis.status;
  return row.targetScreenshotStatus || 'target status pending';
}

function levelVisualMedia(row = {}, side = 'current'){
  const isTarget = side === 'target';
  const src = isTarget ? row.targetScreenshot : row.currentScreenshot;
  if(!src || !fs.existsSync(path.join(ROOT, normalizeAssetSourcePath(src)))){
    return `<div class="mediaPlaceholder">${isTarget ? 'Target Galaga gameplay screenshot' : 'Current Aurora gameplay screenshot'} pending.</div>`;
  }
  const label = isTarget ? 'Actual Galaga target gameplay' : 'Current Aurora runtime capture';
  const note = isTarget
    ? `${levelVisualStatus(row)}; ${row.targetSourceTimeSeconds !== undefined ? `source time ${row.targetSourceTimeSeconds}s.` : 'source time pending.'}`
    : `Captured from the current Aurora build at ${row.sampleSeconds ?? 'n/a'}s into this displayed row.`;
  return renderMediaImage({
    src,
    label,
    alt: `${row.label || 'Level'} ${label}`,
    note
  });
}

function levelVisualVideo(row = {}, side = 'current'){
  const isTarget = side === 'target';
  const src = isTarget ? row.targetVideo : row.currentVideo;
  if(!src || !fs.existsSync(path.join(ROOT, normalizeAssetSourcePath(src)))){
    return `<div class="mediaPlaceholder">${isTarget ? 'Target Galaga 10s gameplay clip' : 'Current Aurora 10s gameplay clip'} pending.</div>`;
  }
  return renderMediaVideo({
    src,
    poster: isTarget ? row.targetScreenshot : row.currentScreenshot,
    label: isTarget ? 'Target Galaga 10s gameplay' : 'Aurora current 10s gameplay',
    alt: `${row.label || 'Level'} ${isTarget ? 'target Galaga gameplay clip' : 'Aurora current gameplay clip'}`,
    note: isTarget
      ? `${row.targetVideoStatus || 'target clip'}; starts at ${row.targetSourceTimeSeconds ?? 'n/a'}s in the source video.`
      : `${row.currentVideoStatus || 'current clip'}; starts at the row's ${row.sampleSeconds ?? 'n/a'}s Aurora sample point.`
  });
}

function levelVisualReferenceEvidence(row = {}){
  const target = row.targetWindow || {};
  const items = [
    target.contactSheet ? { src: target.contactSheet, label: 'Target contact sheet', alt: `${row.label || 'Level'} target contact sheet`, note: target.motionRead || 'Target contact-sheet evidence.' } : null,
    target.denseContactSheet ? { src: target.denseContactSheet, label: 'Target dense contact sheet', alt: `${row.label || 'Level'} target dense contact sheet`, note: 'Denser target-stage contact sheet for frame-by-frame visual review.' } : null,
    target.motionSheet ? { src: target.motionSheet, label: 'Target motion sheet', alt: `${row.label || 'Level'} target motion sheet`, note: 'Motion-difference or motion-review sheet from the target-gameplay evidence.' } : null
  ].filter(Boolean);
  if(!items.length) return '<span class="docMeta">No supplemental target contact sheet is linked for this row yet.</span>';
  return `<div class="levelRoleImages">${items.map(renderMediaImage).join('')}</div>`;
}

function levelVisualRoleGrid(row = {}){
  const roles = Array.isArray(row.roles) ? row.roles : [];
  if(!roles.length) return '<div class="mediaPlaceholder">Ship and alien bitmap evidence pending for this row.</div>';
  return roles.map(role => {
    const media = [
      role.current ? { src: role.current, label: 'Aurora current bitmap', alt: `${role.label || role.key || 'role'} Aurora current bitmap`, pixelated: true, note: 'Captured from the current Aurora runtime sprite-conformance harness.' } : null,
      role.target ? { src: role.target, label: 'Galaga target bitmap', alt: `${role.label || role.key || 'role'} Galaga target bitmap`, pixelated: true, note: 'Exact source-frame target crop when available.' } : null,
      role.targetModel ? { src: role.targetModel, label: 'Galaga target model', alt: `${role.label || role.key || 'role'} Galaga target model`, pixelated: true, note: 'Inferred consensus model from the sprite-reference corpus.' } : null
    ].filter(item => item && item.src && fs.existsSync(path.join(ROOT, normalizeAssetSourcePath(item.src))));
    return `
      <article class="levelRoleCard">
        <h4>${esc(role.label || role.key || 'Role')}</h4>
        ${media.length ? `<div class="levelRoleImages">${media.map(renderMediaImage).join('')}</div>` : '<div class="mediaPlaceholder">Bitmap pair pending.</div>'}
      </article>
    `;
  }).join('\n');
}

function levelVisualMetrics(row = {}){
  const metrics = row.conformanceMetrics || row.analysis || {};
  const entries = [
    ['Overall', metrics.score10],
    ['Movement', metrics.movementScore10],
    ['Graphics', metrics.graphicsScore10],
    ['Alien novelty', metrics.noveltyScore10],
    ['Progression', metrics.progressionScore10]
  ];
  return `<div class="levelVisualMetricGrid">${entries.map(([label, value]) => `<span>${esc(levelVisualScore(value, label))}</span>`).join('')}</div>`;
}

function renderLevelVisualDetail(row = {}){
  const analysis = row.analysis || {};
  const metrics = row.conformanceMetrics || {};
  const score = metrics.score10 ?? analysis.score10;
  const movement = metrics.movementScore10 ?? analysis.movementScore10;
  const graphics = metrics.graphicsScore10 ?? analysis.graphicsScore10;
  const novelty = metrics.noveltyScore10 ?? analysis.noveltyScore10;
  const orderLabel = row.kind === 'challenge'
    ? `Challenge ${row.challengeNumber || ''}`
    : `Level ${row.displayLevel || ''}`;
  const targetStatus = levelVisualStatus(row);
  const scoreLabel = score !== null && score !== undefined && Number.isFinite(+score)
    ? `${Number(score).toFixed(1)}/10`
    : 'unscored';
  const targetRead = row.targetWindow?.motionRead || analysis.variationRead || 'Target read pending.';
  const currentRead = analysis.currentRead || row.currentRoleRead || 'Current scene read pending.';
  return `
    <details class="levelVisualDetail" id="level-visual-${esc(row.id || row.displayOrder || '')}">
      <summary class="levelVisualSummary">
        <span class="levelVisualTitle">
          <span>${esc(row.label || orderLabel)}</span>
          <small>${esc(orderLabel)} · ${esc(row.kind === 'challenge' ? 'Challenging Stage' : 'Regular Level')} · ${esc(targetStatus)}</small>
        </span>
        <span class="levelVisualSummaryCell"><strong>${esc(scoreLabel)}</strong>${esc(analysis.status || targetStatus)}</span>
        <span class="levelVisualSummaryCell"><strong>${esc(levelVisualScore(movement))} movement</strong>${esc(levelVisualScore(graphics))} graphics; ${esc(levelVisualScore(novelty))} novelty</span>
        <span class="levelVisualSummaryCell"><strong>Scene roles</strong>${esc(row.currentRoleRead || (row.targetWindow?.targetFamilies || []).join(', ') || 'role read pending')}</span>
        <span class="scorePill">${row.targetWindow?.exact ? 'exact target' : 'representative target'}</span>
      </summary>
      <div class="levelVisualDetailBody">
        <div class="levelVisualCompareGrid">
          <article class="challengeEvidenceCard">
            <h3>Reference Target</h3>
            ${levelVisualMedia(row, 'target')}
            <p>${esc(targetRead)}</p>
            <p class="docMeta">Target families: ${esc((row.targetWindow?.targetFamilies || []).join(', ') || 'pending')}.</p>
          </article>
          <article class="challengeEvidenceCard">
            <h3>Aurora Current</h3>
            ${levelVisualMedia(row, 'current')}
            <p>${esc(currentRead)}</p>
            <p class="docMeta">Captured from the current local/runtime build. Enemy count ${esc(row.currentEnemyCount ?? 'n/a')}; challenge enemies ${esc(row.challengeEnemyCount ?? 'n/a')}.</p>
          </article>
          <article class="challengeEvidenceCard">
            <h3>Conformance Read</h3>
            <p>${esc(analysis.playerFacingRead || 'Player-facing conformance read pending.')}</p>
            <p><strong>Critical gap:</strong> ${esc(analysis.criticalGap || 'Gap pending.')}</p>
            <p><strong>Next:</strong> ${esc(analysis.next || 'Next measurement/action pending.')}</p>
            ${levelVisualMetrics(row)}
          </article>
        </div>
        <div class="challengeEvidenceCard">
          <h3>10s Motion Review Clips</h3>
          <p class="docMeta">These clips are intentionally large enough to compare side by side in-page. They are the first human-readable motion layer for this index: the still frame anchors the moment, while the clip exposes entry route, pacing, turn shape, density, and whether the level feels authored or merely populated.</p>
          <div class="levelVisualVideoGrid">
            ${levelVisualVideo(row, 'target')}
            ${levelVisualVideo(row, 'current')}
          </div>
        </div>
        <div class="challengeEvidenceCard">
          <h3>Aliens, Ships, And Bitmaps</h3>
          <p class="docMeta">The cards below pair current Aurora runtime bitmaps with Galaga target crops/models for each ship or alien family visible or expected in this scene. Static bitmap similarity is not the whole conformance story; live motion, entry route, flapping/pulsing, capture/rescue, and formation context still require temporal scoring.</p>
          <div class="levelVisualRoleGrid">
            ${levelVisualRoleGrid(row)}
          </div>
        </div>
        <details class="inlineDocPreview">
          <summary>Open supporting target sheets and measurement notes</summary>
          <div class="inlineDocPreviewBody">
            <p><strong>Target grounding:</strong> ${esc(targetStatus)}. ${row.targetWindow?.exact ? 'This row has an exact ingested target window.' : 'This row uses an actual Galaga gameplay frame as a representative target until exact per-level normal-stage windows are ingested.'}</p>
            <p><strong>Variation read:</strong> ${esc(analysis.variationRead || 'Variation read pending.')}</p>
            <p><strong>Aurora contract:</strong> ${esc(row.targetWindow?.auroraContract || 'Contract pending.')}</p>
            ${levelVisualReferenceEvidence(row)}
          </div>
        </details>
      </div>
    </details>
  `;
}

function renderChallengeStageDetail(row = {}){
  const label = challengeStageDisplayLabel(row);
  const score = row.conformanceScore10 ?? 'n/a';
  const interest = row.interestingFactor10 ?? 'n/a';
  const movement = row.movementConformanceScore10 ?? 'n/a';
  const graphics = row.graphicalConformanceScore10 ?? 'n/a';
  const novelty = row.alienNoveltyScore10 ?? 'n/a';
  const bestRef = row.bestReferenceMatch?.labelId || 'pending';
  const targetText = row.galagaTarget || 'Target pending.';
  const currentText = row.currentRead || 'Current read pending.';
  const gaps = row.criticalGaps || [];
  const actions = row.nextActions || [];
  return `
    <details class="challengeStageDetail" id="challenge-stage-${esc(row.challengeNumber || row.stage || '')}">
      <summary class="challengeStageSummary">
        <span class="challengeStageTitle">
          <span>${esc(label)}</span>
          <small>${esc(challengeStageInternalLabel(row))}</small>
        </span>
        <span class="scorePill">${esc(interest)}/10 interest</span>
        <span class="scorePill">${esc(movement)}/10 movement</span>
        <span class="scorePill">${esc(graphics)}/10 graphics</span>
        <span class="scorePill">${esc(novelty)}/10 alien novelty</span>
        <span class="scorePill">${esc(score)}/10 conform</span>
      </summary>
      <div class="challengeStageDetailBody">
        <div class="challengeCompareGrid">
          <article class="challengeEvidenceCard">
            <h3>Reference Target</h3>
            ${challengeReferenceMedia(row)}
            <p>${esc(targetText)}</p>
            <p class="docMeta">${esc(row.galagaReferenceMeaning || 'Reference meaning pending.')}</p>
          </article>
          <article class="challengeEvidenceCard">
            <h3>Aurora Current</h3>
            ${challengeRuntimeMedia(row)}
            <p>${esc(currentText)}</p>
            <p class="docMeta">${esc(row.movementRead || '')}</p>
          </article>
          <article class="challengeEvidenceCard">
            <h3>Conformance Read</h3>
            ${challengeTrajectoryDiagramMedia(row)}
            <p><strong>Strict read:</strong> movement ${esc(movement)}/10, graphics ${esc(graphics)}/10, alien novelty ${esc(novelty)}/10, progression ${esc(row.progressionConformanceScore10 ?? 'n/a')}/10.</p>
            <p><strong>Diagnostic best reference:</strong> <code>${esc(bestRef)}</code> (${esc(row.referenceMatchScore10 ?? 'n/a')}/10 legacy broad coverage).</p>
            <p><strong>Target contract:</strong> ${esc(row.targetContractFitScore10 ?? 'pending')}/10. ${esc(row.targetContractRead || 'No explicit contract yet.')}</p>
            <p>${esc(row.criticalExpectation || 'Critical expectation pending.')}</p>
            ${challengeScoreComponents(row)}
          </article>
        </div>
        <div class="challengeAxisGrid">
          <article class="challengeEvidenceCard">
            <h3>Aliens</h3>
            <p>${esc(row.alienVariationRead || 'Alien variation read pending.')}</p>
            <p class="docMeta">Group identity: ${esc(row.groupIdentityScore10 ?? 'n/a')}/10. ${esc(row.groupIdentityRead || 'Wave/group identity read pending.')}</p>
            <p class="docMeta">Lane types: ${esc((row.laneTypes || []).join(', ') || 'pending')}</p>
          </article>
          <article class="challengeEvidenceCard">
            <h3>Movement</h3>
            <p>${esc(row.movementRead || 'Movement read pending.')}</p>
            <p class="docMeta">${esc(row.strictAxisReads?.movement?.read || '')}</p>
            ${challengeList(challengeMotionSummary(row))}
          </article>
          <article class="challengeEvidenceCard">
            <h3>Sprite Motion / Shot Route</h3>
            ${challengeObjectTrackDiagramMedia(row)}
            <p>${esc(row.spriteMotionRead || 'Sprite-motion read pending.')}</p>
            <p>${esc(row.shotOpportunityRead || 'Shot-opportunity read pending.')}</p>
            <p class="docMeta">Object silhouettes: ${esc(row.objectTrackProbe?.score10 ?? 'n/a')}/10; player shot opportunity: ${esc(row.playerShotOpportunityScore10 ?? 'n/a')}/10.</p>
          </article>
          <article class="challengeEvidenceCard">
            <h3>Safety / Rules</h3>
            <p>Challenging stages are evaluated separately from normal levels: they should preserve the no-shooting, no-ship-loss bonus-stage rule before they earn interest/conformance credit.</p>
            ${challengeList(challengeSafetySummary(row))}
          </article>
          <article class="challengeEvidenceCard">
            <h3>Gaps / Next</h3>
            ${challengeList(gaps.length ? gaps : ['No critical gap recorded for this row yet; continue improving scorer resolution.'])}
            ${challengeList(actions)}
          </article>
        </div>
      </div>
    </details>
  `;
}

function loadPersonaPerformanceDistribution(){
  if(!fs.existsSync(PERSONA_PERFORMANCE_DISTRIBUTION)){
    return { summaryRows: [], findings: [], runs: [] };
  }
  try {
    const artifact = readJson(PERSONA_PERFORMANCE_DISTRIBUTION);
    return Object.assign({}, artifact, {
      summaryRows: Array.isArray(artifact.summaryRows) ? artifact.summaryRows : [],
      findings: Array.isArray(artifact.findings) ? artifact.findings : [],
      runs: Array.isArray(artifact.runs) ? artifact.runs : []
    });
  } catch (err) {
    return { summaryRows: [], findings: [], runs: [] };
  }
}

function pct(value, digits = 1){
  return `${(Number(value || 0) * 100).toFixed(digits)}%`;
}

function personaStatCell(stat, suffix = ''){
  if(!stat || !Number.isFinite(+stat.avg)) return '<span class="docMeta">pending</span>';
  const range = Number.isFinite(+stat.min) && Number.isFinite(+stat.max)
    ? `<span class="docMeta">range ${esc(stat.min)}-${esc(stat.max)}${esc(suffix)}</span>`
    : '';
  return `<strong>${esc(stat.avg)}${esc(suffix)}</strong><br><span class="docMeta">median ${esc(stat.median)}${esc(suffix)}</span>${range ? `<br>${range}` : ''}`;
}

function personaPerformanceChartHtml(artifact){
  const chartPath = 'reference-artifacts/analyses/persona-performance-distribution/performance-lines.svg';
  const full = path.join(ROOT, chartPath);
  if(!fs.existsSync(full)){
    return '<div class="mediaPlaceholder">Persona performance line chart pending. Run <code>npm run harness:analyze:persona-performance-distribution</code> after a distribution batch.</div>';
  }
  const href = catalogMediaHref(chartPath);
  return `<img class="distributionChart" src="${esc(href)}" alt="Line chart of persona score and stage reached across repeated seeded full-run games" loading="lazy">`;
}

function referenceSpriteModelMediaForKey(spriteKey){
  if(!spriteKey) return [];
  return loadGalagaReferenceSpriteModels()
    .filter(target => Array.isArray(target.catalogKeys) && target.catalogKeys.includes(spriteKey) && target.modelImage)
    .map(target => ({
      label: target.label || target.id || 'Inferred Galaga sprite model',
      src: target.modelImage,
      pixelated: true,
      kind: 'referenceSpriteModel',
      note: `Consensus model; ${target.sampleCount || 0} sample${target.sampleCount === 1 ? '' : 's'}, ${Math.round((target.averageConfidence || 0) * 100)}% average confidence.`
    }));
}

function referenceSpriteMediaForKey(spriteKey){
  if(!spriteKey) return [];
  return [
    ...referenceSpriteModelMediaForKey(spriteKey),
    ...loadGalagaReferenceSpriteTargets()
    .filter(target => Array.isArray(target.catalogKeys) && target.catalogKeys.includes(spriteKey) && target.pixelTarget)
    .map(target => ({
      label: target.label || target.id || 'Galaga sprite target',
      src: target.pixelTarget,
      pixelated: true,
      kind: 'referenceSpriteTarget',
      note: target.note || 'Exact source-frame pixel target.'
    }))
  ];
}

function alienVisualReferenceMediaForKey(spriteKey){
  if(!spriteKey) return [];
  const aliases = {
    'rogue-fighter': ['rogue-fighter', 'player-fighter', 'tractor-beam'],
    'challenge-dragonfly': ['challenge-dragonfly', 'challenge-mosquito'],
    'challenge-mosquito': ['challenge-mosquito', 'challenge-dragonfly']
  };
  const keys = new Set([spriteKey, ...(aliases[spriteKey] || [])]);
  return (loadGalagaAlienVisualReference().entries || [])
    .filter(entry => entry.exists && Array.isArray(entry.roleKeys) && entry.roleKeys.some(key => keys.has(key)) && entry.path)
    .sort((a, b) => (Number(b.targetCandidateScore || 0) - Number(a.targetCandidateScore || 0)) || String(a.id).localeCompare(String(b.id)))
    .slice(0, 3)
    .map(entry => ({
      label: entry.label || entry.id || 'Galaga close-up reference',
      src: entry.path,
      pixelated: /sprite|pixel|lineup|grid/i.test(`${entry.sourceClass || ''} ${entry.label || ''}`),
      kind: 'alienVisualReference',
      note: `${entry.sourceClass || 'reference image'}; ${entry.targetUse || 'visual context'}. ${entry.notes || ''}`.trim()
    }));
}

const AUDIO_PLOT_STEMS = {
  gameStart: 'stage-start',
  formationArrival: 'formation-pulse',
  stageTransition: 'stage-start',
  stagePulse: 'formation-pulse',
  playerShot: 'player-shot',
  enemyShot: 'enemy-shot',
  enemyHit: 'enemy-hit',
  enemyBoom: 'enemy-boom',
  bossHit: 'boss-hit',
  bossBoom: 'boss-boom',
  captureBeam: 'capture-beam',
  captureSuccess: 'fighter-captured',
  captureRetreat: 'capture-retreat',
  rescueJoin: 'rescue-join',
  capturedFighterDestroyed: 'captured-fighter-destroyed',
  challengeTransition: 'challenge-transition',
  challengeResults: 'challenge-results',
  challengePerfect: 'challenge-perfect',
  gameOver: 'game-over',
  highScoreFirst: 'high-score-1st',
  highScoreOther: 'high-score-2nd-10th',
  playerHit: 'ship-loss'
};

function catalogSpriteForEntry(entry){
  const explicit = entry?.media?.spriteKey || entry?.spriteKey || entry?.id || '';
  if(AURORA_PIXEL_SPRITES[explicit]) return AURORA_PIXEL_SPRITES[explicit];
  const text = `${entry?.name || ''} ${entry?.runtime || ''}`;
  const match = ALIEN_ROW_SPRITES.find(([pattern]) => pattern.test(text));
  return match ? AURORA_PIXEL_SPRITES[match[1]] : null;
}

function spriteKeyForEntry(entry){
  const explicit = entry?.media?.spriteKey || entry?.spriteKey || entry?.id || '';
  if(AURORA_PIXEL_SPRITES[explicit]) return explicit;
  const text = `${entry?.name || ''} ${entry?.runtime || ''}`;
  const match = ALIEN_ROW_SPRITES.find(([pattern]) => pattern.test(text));
  return match ? match[1] : '';
}

function renderPixelSprite(sprite){
  if(!sprite || !Array.isArray(sprite.rows) || !sprite.rows.length) return '';
  const cols = Math.max(...sprite.rows.map(row => String(row).length));
  const colors = sprite.colors || {};
  const cells = [];
  for(const row of sprite.rows){
    const padded = String(row).padEnd(cols, '.');
    for(const token of padded){
      const color = colors[token] || '';
      cells.push(color
        ? `<span class="isFilled" style="--pixel-color:${esc(color)}"></span>`
        : '<span></span>');
    }
  }
  return `
    <div class="catalogMediaItem">
      <span class="catalogMediaLabel">${esc(sprite.label || 'Runtime sprite')}</span>
      <div class="pixelSprite" style="--pixel-cols:${cols}" aria-hidden="true">${cells.join('')}</div>
    </div>
  `;
}

function renderMediaImage(item){
  if(!item || !item.src) return '';
  const href = catalogMediaHref(item.src);
  const label = item.label || 'Evidence image';
  const crop = item.crop || {};
  const cropWidth = Number(crop.width || crop.w);
  const cropHeight = Number(crop.height || crop.h);
  const sourceWidth = Number(crop.sourceWidth || crop.srcWidth);
  const sourceHeight = Number(crop.sourceHeight || crop.srcHeight);
  const cropX = Number(crop.x || 0);
  const cropY = Number(crop.y || 0);
  const scale = Number(crop.scale || 4);
  const hasCrop = [cropWidth, cropHeight, sourceWidth, sourceHeight, cropX, cropY, scale]
    .every(Number.isFinite) && cropWidth > 0 && cropHeight > 0 && sourceWidth > 0 && sourceHeight > 0 && scale > 0;
  const alt = item.alt || item.label || 'Evidence image';
  const isContactSheet = /contact[- ]sheet/i.test(`${item.src || ''} ${label}`);
  const panelNote = isContactSheet
    ? 'Contact sheets are supporting visual evidence for scanning motion shape, frame progression, and density. They are not the primary score explanation; use the surrounding target/current/conformance text for the human-readable judgment, and scroll this panel at native scale when the pixels matter.'
    : (item.note || 'Expanded evidence view.');
  const expandedScale = hasCrop ? Math.min(12, Math.max(scale, 6, scale * 2)) : scale;
  const media = hasCrop
    ? `<div class="mediaCrop" style="width:${Math.round(cropWidth * scale)}px;height:${Math.round(cropHeight * scale)}px">
        <img src="${esc(href)}" alt="${esc(alt)}" loading="lazy" style="width:${Math.round(sourceWidth * scale)}px;height:${Math.round(sourceHeight * scale)}px;transform:translate(-${Math.round(cropX * scale)}px,-${Math.round(cropY * scale)}px)">
      </div>`
    : `<img class="catalogMediaImg${item.pixelated ? ' isPixelated' : ''}" src="${esc(href)}" alt="${esc(alt)}" loading="lazy">`;
  const expandedMedia = hasCrop
    ? `<div class="mediaCrop mediaCropExpanded" style="width:${Math.round(cropWidth * expandedScale)}px;height:${Math.round(cropHeight * expandedScale)}px">
        <img src="${esc(href)}" alt="${esc(`${alt} expanded crop`)}" loading="lazy" style="width:${Math.round(sourceWidth * expandedScale)}px;height:${Math.round(sourceHeight * expandedScale)}px;transform:translate(-${Math.round(cropX * expandedScale)}px,-${Math.round(cropY * expandedScale)}px)">
      </div>`
    : `<img class="${item.pixelated ? 'isPixelated' : ''}" src="${esc(href)}" alt="${esc(`${alt} expanded`)}" loading="lazy">`;
  return `
    <div class="catalogMediaItem">
      <span class="catalogMediaLabel">${esc(label)}</span>
      ${media}
      <details class="catalogMediaExpand${isContactSheet ? ' isContactSheet' : ''}">
        <summary><span class="mediaSummaryClosed">Open evidence panel</span><span class="mediaSummaryOpen">Close evidence panel</span></summary>
        <div class="catalogMediaExpanded">
          <div class="catalogMediaExpandedHeader">
            <strong>${esc(label)}</strong>
            <p>${esc(panelNote)}</p>
          </div>
          <div class="catalogMediaExpandedScroll">${expandedMedia}</div>
        </div>
      </details>
      ${item.note ? `<span class="catalogMediaNote">${esc(item.note)}</span>` : ''}
    </div>
  `;
}

function renderMediaVideo(item){
  if(!item || !item.src) return '';
  const href = catalogMediaHref(item.src);
  const poster = item.poster ? catalogMediaHref(item.poster) : '';
  const label = item.label || 'Evidence video';
  const alt = item.alt || label;
  const note = item.note || '10-second evidence clip for inline motion review.';
  const ext = path.extname(String(item.src || '')).toLowerCase();
  const type = ext === '.mp4' || ext === '.m4v'
    ? 'video/mp4'
    : ext === '.mov'
      ? 'video/quicktime'
      : 'video/webm';
  return `
    <div class="catalogMediaItem">
      <span class="catalogMediaLabel">${esc(label)}</span>
      <video class="catalogMediaVideo" controls preload="metadata"${poster ? ` poster="${esc(poster)}"` : ''} aria-label="${esc(alt)}">
        <source src="${esc(href)}" type="${esc(type)}">
        Your browser cannot play this evidence video. Open <a href="${esc(href)}">the clip</a> directly.
      </video>
      <span class="catalogMediaNote">${esc(note)}</span>
    </div>
  `;
}

function renderCatalogVisualMedia(entry, options = {}){
  const sprite = catalogSpriteForEntry(entry);
  const spriteKey = spriteKeyForEntry(entry);
  const media = entry?.media || {};
  const wantsReferenceTargets = options.includeReferenceTargets || options.includeReferenceContext;
  const images = [
    ...(Array.isArray(media.images) ? media.images : []),
    ...(wantsReferenceTargets ? referenceSpriteMediaForKey(spriteKey) : []),
    ...(options.includeReferenceContext ? alienVisualReferenceMediaForKey(spriteKey) : []),
    ...(options.includeReferenceContext ? (ALIEN_REFERENCE_CONTEXT[spriteKey] || []) : [])
  ];
  const items = [
    renderPixelSprite(sprite),
    ...images.map(renderMediaImage)
  ].filter(Boolean);
  if(!items.length){
    return '<div class="mediaPlaceholder">Inline visual evidence pending.</div>';
  }
  const hasCropTarget = images.some(item => item?.crop || item?.kind === 'referenceSpriteTarget' || item?.kind === 'referenceSpriteModel');
  const pending = options.showPendingTarget && !hasCropTarget
    ? '<div class="mediaPlaceholder">Direct extracted crop comparison pending promotion into this row.</div>'
    : '';
  return `<div class="catalogMedia"><div class="catalogMediaGrid">${items.join('')}</div>${pending}</div>`;
}

function parseCueNames(cues){
  return String(cues || '')
    .split(',')
    .map(cue => cue.trim())
    .filter(Boolean);
}

function audioEntriesForConformanceRow(entry, guide){
  const cues = new Set(parseCueNames(entry.cues));
  if(!cues.size) return [];
  return (guide.audioContexts || []).filter(item => cues.has(item.cue));
}

function referenceClipsForEntries(entries, guide){
  const ids = new Set(entries.map(entry => entry.id).filter(Boolean));
  const clips = [];
  for(const source of [...(guide.comparisonSets || []), ...(guide.audioEventMatrix || [])]){
    if(!ids.has(source.entryId) || !source.referenceClip) continue;
    if(clips.some(item => item.referenceClip === source.referenceClip)) continue;
    clips.push({
      label: source.referenceLabel || source.label || source.event || 'Reference',
      referenceClip: source.referenceClip
    });
  }
  return clips;
}

function audioPlotDirs(){
  const root = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-theme-comparison');
  if(!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(root, entry.name))
    .sort()
    .reverse();
}

function findAudioPlot(stem, variant, kind){
  if(!stem) return '';
  const filename = `${stem}-${variant}-${kind}.png`;
  for(const dir of audioPlotDirs()){
    const full = path.join(dir, 'plots', filename);
    if(fs.existsSync(full)) return rel(full);
  }
  return '';
}

function renderAudioEvidenceImages(entries){
  const stems = Array.from(new Set(entries.map(entry => AUDIO_PLOT_STEMS[entry.cue]).filter(Boolean))).slice(0, 2);
  const images = [];
  for(const stem of stems){
    const auroraWaveform = findAudioPlot(stem, 'aurora', 'waveform');
    const referenceSpectrogram = findAudioPlot(stem, 'reference', 'spectrogram') || findAudioPlot(stem, 'galaga', 'spectrogram');
    if(auroraWaveform) images.push({ label: `${stem} Aurora waveform`, src: auroraWaveform });
    if(referenceSpectrogram) images.push({ label: `${stem} reference spectrogram`, src: referenceSpectrogram });
  }
  if(!images.length) return '<div class="mediaPlaceholder">Waveform or spectrogram preview pending for this row.</div>';
  return `<div class="waveformStrip">${images.map(renderMediaImage).join('')}</div>`;
}

function renderConformanceAudioReview(entry, guide){
  const entries = audioEntriesForConformanceRow(entry, guide);
  const runtimeButtons = entries.map(item => {
    const index = (guide.audioContexts || []).indexOf(item);
    return `<button class="audioAction isCompact" type="button" data-audio-index="${index}">Play ${esc(item.label || item.cue || 'Cue')}</button>`;
  });
  const references = referenceClipsForEntries(entries, guide).map(item => (
    `<button class="audioAction isCompact" type="button" data-event-reference="${esc(item.referenceClip)}" data-event-label="${esc(item.label)}">Ref ${esc(item.label)}</button>`
  ));
  const compare = entries.find(item => (guide.comparisonSets || []).some(row => row.entryId === item.id));
  const compareButton = compare
    ? `<button class="audioAction isCompact" type="button" data-compare-entry-id="${esc(compare.id)}" data-theme-play="triple">Compare ${esc(compare.label || compare.cue)}</button>`
    : '';
  const actions = [...runtimeButtons, ...references, compareButton].filter(Boolean);
  return `
    <div class="catalogMedia">
      ${actions.length ? `<div class="conformanceActions">${actions.join('')}</div>` : '<div class="mediaPlaceholder">Playable cue mapping pending.</div>'}
      ${renderAudioEvidenceImages(entries)}
    </div>
  `;
}

function renderArtifactEvidenceList(evidence){
  const items = String(evidence || '')
    .split(/\s*;\s*/)
    .map(item => item.trim())
    .filter(Boolean);
  if(!items.length) return '<span class="docMeta">Evidence pending</span>';
  return items.map(item => `<code>${esc(item)}</code>`).join('<br>');
}

function renderSourceLinks(links){
  const items = (Array.isArray(links) ? links : [])
    .filter(Boolean)
    .slice(0, 3)
    .map((href, index) => `<a href="${esc(href)}">source ${index + 1}</a>`);
  return items.length ? items.join('<br>') : '<span class="docMeta">Local or derived source</span>';
}

function renderTargetArtifactCoverageRows(report){
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="7"><span class="docMeta">Galaga target artifact coverage pending. Run <code>npm run harness:analyze:galaga-target-artifact-coverage</code>.</span></td>
    </tr>`;
  }
  return rows.map((entry) => `
    <tr>
      <td><strong>${esc(entry.title || entry.id || '')}</strong><br><span class="docMeta"><code>${esc(entry.id || '')}</code><br>${renderSourceLinks(entry.sourceUrls)}</span></td>
      <td><strong>${esc(entry.ingestionStatus || 'pending')}</strong><br><span class="docMeta">${esc(entry.priority || 'priority pending')} priority; confidence ${esc(entry.confidence || 'unknown')}</span></td>
      <td><strong>${esc(entry.coverage10 ?? 'n/a')}/10</strong><br><span class="docMeta">axes: ${esc((entry.coverageAxes || []).slice(0, 4).join(', ') || 'pending')}</span></td>
      <td>${esc(entry.targetUse || '')}</td>
      <td>${esc(entry.currentUse || '')}</td>
      <td>${esc(entry.missingWork || '')}</td>
      <td>${esc(entry.evidenceExistingCount ?? 0)}/${esc((entry.localEvidence || []).length)} local anchors</td>
    </tr>
  `).join('\n');
}

function renderAlienVisualReferenceRows(artifact){
  const entries = Array.isArray(artifact?.entries) ? artifact.entries : [];
  if(!entries.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Alien visual reference pack pending. Run <code>npm run harness:analyze:galaga-alien-visual-reference</code>.</span></td>
    </tr>`;
  }
  return entries.map((entry) => `
    <tr>
      <td><strong>${esc(entry.label || entry.id || '')}</strong><br><span class="docMeta"><code>${esc(entry.id || '')}</code><br>${esc(entry.sourceClass || '')}</span></td>
      <td>${renderMediaImage({
        label: 'Supplied reference image',
        src: entry.path,
        pixelated: /sprite|pixel|lineup|grid/i.test(`${entry.sourceClass || ''} ${entry.label || ''}`),
        note: entry.notes || entry.targetUse || ''
      })}</td>
      <td>${(entry.roleKeys || []).map(role => `<code>${esc(role)}</code>`).join('<br>')}</td>
      <td><strong>${esc(entry.targetUse || '')}</strong><br><span class="docMeta">${esc(entry.authority || '')}</span></td>
      <td>${esc(entry.notes || '')}</td>
    </tr>
  `).join('\n');
}

function renderGalagaAlienMotionRoleRows(report){
  const roles = Array.isArray(report?.roleTaxonomy) ? report.roleTaxonomy : [];
  if(!roles.length){
    return `
    <tr>
      <td colspan="4"><span class="docMeta">Alien motion reference pending. Run <code>npm run harness:analyze:galaga-alien-motion-reference</code>.</span></td>
    </tr>`;
  }
  return roles.map((role) => `
    <tr>
      <td><strong>${esc(role.label || role.roleKey || '')}</strong><br><span class="docMeta"><code>${esc(role.roleKey || '')}</code><br>${esc((role.aliases || []).join(', '))}</span></td>
      <td>${esc(role.referenceUse || '')}</td>
      <td>${esc(role.nextExtraction || '')}</td>
      <td>${role.roleKey === 'boss-galaga'
        ? 'Highest priority: current target evidence has visible crop pollution.'
        : role.roleKey === 'bee-zako' || role.roleKey === 'butterfly-escort'
          ? 'High priority: core formation aliens need clean pulse pairs.'
          : 'Use after core formation roles are corrected.'}</td>
    </tr>
  `).join('\n');
}

function renderSpriteConformanceLaneRows(plan){
  const lanes = Array.isArray(plan?.lanes) ? plan.lanes : [];
  if(!lanes.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Sprite conformance and variation plan pending.</span></td>
    </tr>`;
  }
  return lanes.map((lane) => `
    <tr>
      <td><strong>${esc(lane.label || lane.id || '')}</strong><br><span class="docMeta"><code>${esc(lane.id || '')}</code><br>${esc(lane.releaseUse || '')}</span></td>
      <td>${esc(lane.purpose || '')}</td>
      <td>${esc(lane.rendererExpectation || '')}</td>
      <td>${(lane.metrics || []).map(metric => `<code>${esc(metric)}</code>`).join('<br>')}</td>
      <td>${lane.id === 'reference-conformance-lane'
        ? 'Use for internal target comparison and measurement.'
        : lane.id === 'aurora-production-theme-lane'
          ? 'Use for public Aurora originality and era-faithful presentation.'
          : 'Use to onboard future games through the same artifact loop.'}</td>
    </tr>
  `).join('\n');
}

function renderSpriteConformancePipelineRows(plan){
  const steps = Array.isArray(plan?.pipelineSteps) ? plan.pipelineSteps : [];
  if(!steps.length){
    return `
    <tr>
      <td colspan="4"><span class="docMeta">Sprite pipeline steps pending.</span></td>
    </tr>`;
  }
  return steps.map((step, index) => `
    <tr>
      <td><strong>${esc(index + 1)}. ${esc(step.label || step.id || '')}</strong><br><span class="docMeta"><code>${esc(step.id || '')}</code></span></td>
      <td>${esc(step.goal || '')}</td>
      <td>${esc(step.currentStatus || '')}</td>
      <td>${esc(step.nextAction || '')}</td>
    </tr>
  `).join('\n');
}

function renderSpriteConformanceSuccessRows(plan){
  const rows = Array.isArray(plan?.successCriteria) ? plan.successCriteria : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="3"><span class="docMeta">Sprite success criteria pending.</span></td>
    </tr>`;
  }
  return rows.map((row) => `
    <tr>
      <td><strong>${esc(row.label || row.id || '')}</strong><br><span class="docMeta"><code>${esc(row.id || '')}</code></span></td>
      <td>${esc(row.target || '')}</td>
      <td>${row.id === 'short-term'
        ? 'Next practical implementation target.'
        : row.id === 'release-gate'
          ? 'Required before broad public claims.'
          : 'Tracked as the sprite pipeline matures.'}</td>
    </tr>
  `).join('\n');
}

function renderGalagaAlienCropPreviewRows(report){
  const regions = Array.isArray(report?.regions) ? report.regions : [];
  if(!regions.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Crop previews pending. Run <code>npm run harness:analyze:galaga-alien-crop-previews</code>.</span></td>
    </tr>`;
  }
  return regions.map((region) => {
    const hasGrid = Number.isFinite(+region.gridCellCount) && +region.gridCellCount > 0;
    const candidateRead = hasGrid
      ? `<strong>${esc(region.interestingCellCount ?? 0)}/${esc(region.gridCellCount ?? 0)}</strong> lit candidate cells<br><span class="docMeta">channels: ${esc((region.tokenChannels || []).join(', ') || 'none')}</span>`
      : `<strong>Region-level review</strong><br><span class="docMeta">${esc(region.litPixels ?? 0)} lit pixels; channels: ${esc((region.tokenChannels || []).join(', ') || 'none')}</span>`;
    return `
    <tr>
      <td><strong>${esc(region.label || region.id || '')}</strong><br><span class="docMeta"><code>${esc(region.id || '')}</code><br>${esc(region.promotionStatus || '')}</span></td>
      <td>${renderMediaImage({
        label: 'Region preview',
        src: region.previewImage,
        pixelated: true,
        note: 'Source-sheet region crop generated from the crop-box manifest.'
      })}</td>
      <td>${region.gridPreviewImage ? renderMediaImage({
        label: 'Grid review overlay',
        src: region.gridPreviewImage,
        pixelated: true,
        note: 'Grid overlay for reviewing exact candidate cells before promotion.'
      }) : '<span class="docMeta">No grid overlay for this region.</span>'}</td>
      <td>${candidateRead}</td>
      <td>${esc(region.nextReview || '')}</td>
    </tr>
  `;
  }).join('\n');
}

function renderGalagaAlienCropRoleRows(report){
  const roles = Array.isArray(report?.targetRolePlan) ? report.targetRolePlan : [];
  if(!roles.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Target role crop review pending.</span></td>
    </tr>`;
  }
  return roles.map((role) => `
    <tr>
      <td><strong>${esc(role.roleKey || '')}</strong><br><span class="docMeta">${esc(role.promotionStatus || '')}</span></td>
      <td>${(role.requiredPoses || []).map(pose => `<code>${esc(pose)}</code>`).join('<br>')}</td>
      <td>${(role.candidateRegions || []).map(region => `<code>${esc(region)}</code>`).join('<br>')}</td>
      <td><strong>${esc(role.interestingCellCount ?? 0)}/${esc(role.candidateCellCount ?? 0)}</strong> candidate cells<br><span class="docMeta">${esc(role.candidateRegionCount ?? 0)} source region(s)</span></td>
      <td>${esc(role.nextAction || '')}</td>
    </tr>
  `).join('\n');
}

function renderGalagaAlienTargetRoleRows(report){
  const roles = Array.isArray(report?.roleSets) ? report.roleSets : [];
  if(!roles.length){
    return `
    <tr>
      <td colspan="4"><span class="docMeta">Promoted target crop role sets pending. Run <code>npm run harness:promote:galaga-alien-target-crops</code>.</span></td>
    </tr>`;
  }
  return roles.map((role) => `
    <tr>
      <td><strong>${esc(role.label || role.roleKey || '')}</strong><br><span class="docMeta"><code>${esc(role.roleKey || '')}</code></span></td>
      <td>${(role.promotedPoses || []).map(pose => `<code>${esc(pose)}</code>`).join('<br>')}</td>
      <td><strong>${esc(role.promotedPoseCount ?? (role.targetCrops || []).length ?? 0)}</strong> promoted crop(s)<br><span class="docMeta">${esc(role.status || '')}</span></td>
      <td>${esc(role.coverageRead || '')}</td>
    </tr>
  `).join('\n');
}

function renderGalagaAlienTargetCropRows(report){
  const crops = Array.isArray(report?.targetCrops) ? report.targetCrops : [];
  if(!crops.length){
    return `
    <tr>
      <td colspan="6"><span class="docMeta">Promoted target crops pending. Run <code>npm run harness:promote:galaga-alien-target-crops</code>.</span></td>
    </tr>`;
  }
  return crops.map((crop) => {
    const source = crop.sourceCell
      ? `${crop.sourceRegion || ''} r${crop.sourceCell.row} c${crop.sourceCell.column}`
      : (crop.sourceRegion || 'custom crop');
    const box = crop.crop || {};
    const metricText = `${crop.metrics?.litPixels ?? 0} lit px; ${esc((crop.metrics?.tokenChannels || []).join(', ') || 'no channels')}`;
    return `
    <tr>
      <td><strong>${esc(crop.roleKey || '')}</strong><br><span class="docMeta">${esc(crop.reviewStatus || '')}</span></td>
      <td><code>${esc(crop.poseKey || '')}</code></td>
      <td>${renderMediaImage({
        label: crop.poseKey || crop.id || 'Target crop',
        src: crop.targetCrop,
        pixelated: true,
        note: crop.videoDerivedCleanCrop ? 'Trusted cleaned target crop promoted from the segmented Galaga alien motion reference.' : 'Target crop promoted from the supplied Galaga general sprite sheet.'
      })}</td>
      <td>${esc(source)}<br><span class="docMeta"><code>${esc(`${box.x ?? '?'}:${box.y ?? '?'} ${box.width ?? '?'}x${box.height ?? '?'}`)}</code></span></td>
      <td>${metricText}</td>
      <td>${esc(crop.note || '')}</td>
    </tr>
  `;
  }).join('\n');
}

function renderGalagaTargetEvidenceAuditRows(report){
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="6"><span class="docMeta">Trusted target evidence audit pending. Run <code>npm run harness:analyze:galaga-target-evidence-audit</code>.</span></td>
    </tr>`;
  }
  return rows.map((row) => {
    const crops = Array.isArray(row.linkedCrops) ? row.linkedCrops : [];
    const cropMedia = crops.slice(0, 4).map((crop) => crop.targetCrop ? renderMediaImage({
      label: crop.id || 'Target crop',
      src: crop.targetCrop,
      pixelated: true,
      note: `${crop.reviewStatus || 'review pending'}${crop.sourceFrameSeconds !== undefined ? `; frame ${crop.sourceFrameSeconds}s` : ''}`
    }) : '').join('');
    return `
    <tr>
      <td><strong>${esc(row.label || row.roleKey || '')}</strong><br><span class="docMeta"><code>${esc(row.roleKey || '')}</code><br>${esc(row.status || '')}<br>confidence: ${esc(row.confidence || 'pending')}</span></td>
      <td>${cropMedia || '<span class="docMeta">No linked crop media.</span>'}</td>
      <td>${esc(row.previousRisk || '')}</td>
      <td>${esc(row.scoringUse || '')}</td>
      <td>${esc(row.playerMeaning || '')}</td>
      <td>${esc(row.nextGap || '')}</td>
    </tr>
  `;
  }).join('\n');
}

function renderGalagaAlienTemporalTargetRows(report){
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="6"><span class="docMeta">Alien temporal targets pending. Run <code>npm run harness:analyze:galaga-alien-temporal-targets</code>.</span></td>
    </tr>`;
  }
  return rows.map((row) => {
    const crops = Array.isArray(row.targetCrops) ? row.targetCrops : [];
    const cropMedia = crops.slice(0, 4).map((crop) => crop.targetCrop ? renderMediaImage({
      label: crop.id || 'Temporal target crop',
      src: crop.targetCrop,
      pixelated: true,
      note: crop.reviewStatus || 'review pending'
    }) : '').join('');
    const cadenceFrames = Array.isArray(row.frameCadenceTarget?.previewFrames) ? row.frameCadenceTarget.previewFrames : [];
    const cadenceMedia = cadenceFrames.map((frame) => frame.cropImage ? renderMediaImage({
      label: `${row.runtimeSpriteKey || 'target'} ${frame.phaseLabel || 'phase'}`,
      src: frame.cropImage,
      pixelated: true,
      note: `frame-labeled ${frame.timeSeconds}s; ${frame.phaseLabel || 'phase'}`
    }) : '').join('');
    const cadenceRead = row.frameCadenceTarget
      ? `<br><span class="docMeta">Cadence: ${esc(row.frameCadenceTarget.sampleCount || 0)} frames at ${esc(row.frameCadenceTarget.sampleFps || 'n/a')} fps; cycle ${esc(row.frameCadenceTarget.cadenceSecondsPerCycle || 'n/a')}s; phases ${(row.frameCadenceTarget.phaseLabels || []).map(label => `<code>${esc(label)}</code>`).join(' ')}.</span>`
      : '';
    return `
    <tr>
      <td><strong>${esc(row.label || row.id || '')}</strong><br><span class="docMeta"><code>${esc(row.runtimeSpriteKey || '')}</code><br>${esc(row.status || '')}<br>${esc(row.timingStatus || 'pose-sequence-only')}<br>confidence: ${esc(row.confidence || 'pending')}</span></td>
      <td>${(row.poseSequence || []).map(pose => `<code>${esc(pose)}</code>`).join('<br>')}</td>
      <td><div class="catalogMedia"><div class="catalogMediaGrid">${[cropMedia, cadenceMedia].filter(Boolean).join('')}</div></div>${cadenceRead || (!cropMedia ? '<span class="docMeta">No temporal crop media.</span>' : '')}</td>
      <td>${esc(row.sourceRead || '')}</td>
      <td>${esc(row.scoringUse || '')}</td>
      <td>${esc(row.nextGap || '')}</td>
    </tr>
  `;
  }).join('\n');
}

function renderAuroraRuntimeVsTargetRows(report){
  const rows = Array.isArray(report?.comparisons) ? report.comparisons : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Runtime-vs-target sprite comparisons pending. Run <code>npm run harness:analyze:aurora-runtime-vs-galaga-target-crops</code>.</span></td>
    </tr>`;
  }
  return rows.map((row) => `
    <tr>
      <td><strong>${esc(row.spriteKey || '')}</strong><br><span class="docMeta">runtime model ${Number.isFinite(+row.runtimeModelScore10) ? `${Number(row.runtimeModelScore10).toFixed(1)}/10` : 'n/a'}</span></td>
      <td>${renderMediaImage({
        label: 'Aurora runtime crop',
        src: row.runtimeCrop,
        pixelated: true,
        note: 'Isolated live canvas crop from the current Aurora renderer.'
      })}</td>
      <td>${renderMediaImage({
        label: row.bestTargetCropId || 'Best Galaga target crop',
        src: row.bestTargetCrop,
        pixelated: true,
        note: `${row.bestTargetRoleKey || 'target role'} / ${row.bestTargetPoseKey || 'target pose'}`
      })}</td>
      <td><strong>${Number.isFinite(+row.bestScore10) ? `${Number(row.bestScore10).toFixed(1)}/10` : 'pending'}</strong><br><span class="docMeta">candidates: ${esc(row.candidateCount ?? 0)}; role filter: ${(row.candidateRoleKeys || []).map(key => `<code>${esc(key)}</code>`).join(' ')}</span></td>
      <td>${row.bestComponents ? `Jaccard ${esc(row.bestComponents.jaccard ?? 'n/a')}; silhouette ${esc(row.bestComponents.silhouetteAgreement ?? 'n/a')}; color ${esc(row.bestComponents.colorSimilarity ?? 'n/a')}.` : 'Component scoring pending.'}</td>
    </tr>
  `).join('\n');
}

function renderAuroraSpriteTemporalRows(report){
  const rows = Array.isArray(report?.temporalSamples) ? report.temporalSamples : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Temporal sprite phase windows pending.</span></td>
    </tr>`;
  }
  return rows.map((row) => `
    <tr>
      <td><strong>${esc(row.spriteKey || '')}</strong><br><span class="docMeta">${esc(row.motionAxis || '')}</span></td>
      <td>${renderMediaImage({
        label: 'Closed phase',
        src: row.phaseClosedCrop,
        pixelated: true,
        note: 'Harness-captured closed/static flap phase.'
      })}</td>
      <td>${renderMediaImage({
        label: 'Open phase',
        src: row.phaseOpenCrop,
        pixelated: true,
        note: 'Harness-captured open flap phase.'
      })}</td>
      <td><strong>${esc(row.filledCellDelta ?? 0)}</strong> filled-cell delta<br><span class="docMeta">${esc(row.litPixelDelta ?? 0)} lit-pixel delta; score delta ${esc(row.scoreDelta ?? 0)}</span></td>
      <td>${esc(row.read || '')}</td>
    </tr>
  `).join('\n');
}

function renderAuroraSpriteCadenceRows(report){
  const rows = Array.isArray(report?.cadenceSamples) ? report.cadenceSamples : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Full flap-cadence windows pending.</span></td>
    </tr>`;
  }
  return rows.map((row) => {
    const frames = Array.isArray(row.frames) ? row.frames : [];
    const previewFrames = frames.filter((_, index) => index === 0 || index === Math.floor(frames.length / 2) || index === frames.length - 1);
    return `
    <tr>
      <td><strong>${esc(row.spriteKey || '')}</strong><br><span class="docMeta">${esc(row.motionAxis || '')}; ${esc(row.frameCount || 0)} frame(s)</span></td>
      <td><div class="catalogMedia"><div class="catalogMediaGrid">${previewFrames.map(frame => renderMediaImage({
        label: `Frame ${frame.frameIndex}`,
        src: frame.cropImage,
        pixelated: true,
        note: `tm ${frame.enemyTm}; score ${Number.isFinite(+frame.score10) ? `${Number(frame.score10).toFixed(1)}/10` : 'n/a'}`
      })).join('')}</div></div></td>
      <td><strong>${esc(row.scoreRange10 ?? 'n/a')}</strong> score range<br><span class="docMeta">${esc(row.averageAdjacentLitPixelDelta ?? 'n/a')} avg adjacent lit-pixel delta</span></td>
      <td>${esc(row.averageAdjacentFilledCellDelta ?? 'n/a')} avg adjacent filled-cell delta</td>
      <td>${esc(row.read || '')}</td>
    </tr>
  `;
  }).join('\n');
}

function renderAuroraSpriteMotionCorrespondenceRows(report){
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="6"><span class="docMeta">Sprite-motion correspondence pending. Run <code>npm run harness:analyze:aurora-sprite-motion-correspondence</code>.</span></td>
    </tr>`;
  }
  return rows.map((row) => {
    const previewFrames = row.runtime?.cadenceSample?.previewFrames || [];
    return `
    <tr>
      <td><strong>${esc(row.label || row.id || '')}</strong><br><span class="docMeta"><code>${esc(row.runtimeSpriteKey || '')}</code><br>${esc(row.status || '')}</span></td>
      <td><strong>${Number.isFinite(+row.score10) ? `${Number(row.score10).toFixed(1)}/10` : 'pending'}</strong><br><span class="docMeta">raw ${Number.isFinite(+row.rawScore10) ? `${Number(row.rawScore10).toFixed(1)}/10` : 'n/a'}; cap ${Number.isFinite(+row.capScore10) ? `${Number(row.capScore10).toFixed(1)}/10` : 'n/a'}</span></td>
      <td>target ${Number.isFinite(+row.target?.targetReadinessScore10) ? `${Number(row.target.targetReadinessScore10).toFixed(1)}/10` : 'n/a'}<br><span class="docMeta">trusted ${esc(row.target?.trustedCropCount ?? 0)}; provisional ${esc(row.target?.provisionalCropCount ?? 0)}</span></td>
      <td>phase ${Number.isFinite(+row.runtime?.twoPhaseVisibilityScore10) ? `${Number(row.runtime.twoPhaseVisibilityScore10).toFixed(1)}/10` : 'n/a'}<br>cadence ${Number.isFinite(+row.runtime?.cadenceVisibilityScore10) ? `${Number(row.runtime.cadenceVisibilityScore10).toFixed(1)}/10` : 'n/a'}<br><span class="docMeta">static ${Number.isFinite(+row.runtime?.staticLikenessScore10) ? `${Number(row.runtime.staticLikenessScore10).toFixed(1)}/10` : 'n/a'}</span></td>
      <td><div class="catalogMedia"><div class="catalogMediaGrid">${[
        row.runtime?.temporalSample?.phaseClosedCrop ? renderMediaImage({ label: 'Closed phase', src: row.runtime.temporalSample.phaseClosedCrop, pixelated: true, note: 'Runtime closed/pulse phase.' }) : '',
        row.runtime?.temporalSample?.phaseOpenCrop ? renderMediaImage({ label: 'Open phase', src: row.runtime.temporalSample.phaseOpenCrop, pixelated: true, note: 'Runtime open/pulse phase.' }) : '',
        ...previewFrames.slice(0, 2).map(frame => renderMediaImage({ label: `Cadence ${frame.frameIndex}`, src: frame.cropImage, pixelated: true, note: `Runtime cadence frame; score ${Number.isFinite(+frame.score10) ? `${Number(frame.score10).toFixed(1)}/10` : 'n/a'}` }))
      ].filter(Boolean).join('')}</div></div></td>
      <td>${esc(row.capReason || '')}<br><span class="docMeta">${esc(row.nextGap || '')}</span></td>
    </tr>
  `;
  }).join('\n');
}

function renderAuroraRuntimeVsTargetTemporalRows(report){
  const rows = Array.isArray(report?.temporalSequenceComparisons) ? report.temporalSequenceComparisons : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Target-relative temporal sprite sequence scoring pending. Run <code>npm run harness:analyze:aurora-runtime-vs-galaga-target-crops</code> after runtime cadence windows exist.</span></td>
    </tr>`;
  }
  return rows.map((row) => {
    const frames = Array.isArray(row.frames) ? row.frames : [];
    const previewFrames = frames.filter((_, index) => index === 0 || index === Math.floor(frames.length / 2) || index === frames.length - 1);
    return `
    <tr>
      <td><strong>${esc(row.spriteKey || '')}</strong><br><span class="docMeta">${esc(row.motionAxis || '')}; ${esc(row.frameCount || 0)} frame(s)</span></td>
      <td>${esc((row.expectedPoseSequence || []).join(' -> ') || 'pending')}</td>
      <td><div class="catalogMedia"><div class="catalogMediaGrid">${previewFrames.map(frame => renderMediaImage({
        label: `Frame ${frame.frameIndex}`,
        src: frame.runtimeCrop,
        pixelated: true,
        note: `expected ${frame.expectedPoseKey || 'pose'}; best target ${frame.bestTargetPoseKey || 'n/a'}`
      })).join('')}</div></div></td>
      <td><strong>${Number.isFinite(+row.sequenceScore10) ? `${Number(row.sequenceScore10).toFixed(1)}/10` : 'pending'}</strong><br><span class="docMeta">avg frame ${Number.isFinite(+row.averageFrameScore10) ? `${Number(row.averageFrameScore10).toFixed(1)}/10` : 'n/a'}; pose coverage ${Number.isFinite(+row.expectedPoseCoverage) ? `${Math.round(+row.expectedPoseCoverage * 100)}%` : 'n/a'}</span></td>
      <td>${esc(row.read || '')}</td>
    </tr>
  `;
  }).join('\n');
}

function renderAuroraSpritePoseRows(report){
  const rows = [
    ...(Array.isArray(report?.divePoseSamples) ? report.divePoseSamples : []),
    ...(Array.isArray(report?.transitionPoseSamples) ? report.transitionPoseSamples : [])
  ];
  if(!rows.length){
    return `
    <tr>
      <td colspan="4"><span class="docMeta">Dive and transition pose windows pending.</span></td>
    </tr>`;
  }
  return rows.map((row) => `
    <tr>
      <td><strong>${esc(row.spriteKey || '')}</strong><br><span class="docMeta">${esc(row.motionAxis || '')}</span></td>
      <td>${renderMediaImage({
        label: row.spriteKey || 'Runtime pose',
        src: row.cropImage,
        pixelated: true,
        note: 'Harness-captured runtime pose seed for active sprite-motion conformance.'
      })}</td>
      <td><strong>${Number.isFinite(+row.score10) ? `${Number(row.score10).toFixed(1)}/10` : 'unscored'}</strong><br><span class="docMeta">filled ${esc(row.filledCells ?? 'n/a')}; lit ${esc(row.litPixels ?? 'n/a')}</span></td>
      <td>${esc(row.read || '')}</td>
    </tr>
  `).join('\n');
}

function renderAuroraImpactExplosionRows(report){
  const rows = Array.isArray(report?.samples) ? report.samples : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="5"><span class="docMeta">Impact/explosion comparison pending. Run <code>npm run harness:analyze:aurora-impact-explosion-conformance</code>.</span></td>
    </tr>`;
  }
  return rows.map(row => `
    <tr>
      <td><strong>${esc(row.key || '')}</strong><br><span class="docMeta">${esc(row.decision || '')}</span></td>
      <td>${renderMediaImage({
        label: 'Aurora runtime event',
        src: row.runtimeCrop,
        pixelated: true,
        note: row.playerMeaning || 'Runtime impact/explosion crop from the current Aurora renderer.'
      })}</td>
      <td>${renderMediaImage({
        label: row.bestTargetCropId || 'Best Galaga target',
        src: row.bestTargetCrop,
        pixelated: true,
        note: 'Promoted Galaga target-crop candidate for this event family.'
      })}</td>
      <td><strong>${Number.isFinite(+row.score10) ? `${Number(row.score10).toFixed(1)}/10` : 'pending'}</strong><br><span class="docMeta">${row.bestComponents ? `Jaccard ${esc(row.bestComponents.jaccard ?? 'n/a')}; silhouette ${esc(row.bestComponents.silhouetteAgreement ?? 'n/a')}; color ${esc(row.bestComponents.colorSimilarity ?? 'n/a')}` : 'component scoring pending'}</span><br><span class="docMeta">lifecycle ${Number.isFinite(+row.lifecycle?.lifecycleScore10) ? `${Number(row.lifecycle.lifecycleScore10).toFixed(1)}/10` : 'pending'}; audio ${Number.isFinite(+row.audioCouplingScore10) ? `${Number(row.audioCouplingScore10).toFixed(1)}/10` : 'pending'}</span></td>
      <td>${esc(row.playerMeaning || '')}<br><span class="docMeta">${esc(row.lifecycle?.read || '')}</span><br><span class="docMeta">${esc(row.audioCouplingRead || '')}</span></td>
    </tr>
  `).join('\n');
}

function renderChallengeTargetCoverageRows(report){
  const rows = Array.isArray(report?.challengeStageCoverage) ? report.challengeStageCoverage : [];
  if(!rows.length){
    return `
    <tr>
      <td colspan="6"><span class="docMeta">Challenge-stage target window coverage pending.</span></td>
    </tr>`;
  }
  return rows.map((entry) => `
    <tr>
      <td><strong>Challenging Stage ${esc(entry.challengeNumber || '')}</strong><br><span class="docMeta">marker ${esc(entry.stageMarker || '')}</span></td>
      <td>${esc(entry.status || '')}</td>
      <td><strong>${esc(entry.coverage10 ?? 'n/a')}/10</strong></td>
      <td>${esc((entry.currentEvidence || []).join(', ') || 'No committed media-backed challenge window yet.')}</td>
      <td>${esc(entry.nextNeed || '')}</td>
    </tr>
  `).join('\n');
}

function buildApplicationGuide(buildInfo, latestNote, guide){
  const template = read(APPLICATION_GUIDE_TEMPLATE);
  const tocItems = [
    { id: 'audio-event-matrix', title: 'Audio Event Matrix' },
    { id: 'audio-catalog', title: 'Audio Catalog' },
    { id: 'theme-comparison', title: 'Theme Comparison' },
    { id: 'visual-themes', title: 'Visual Themes' },
    { id: 'visual-contexts', title: 'Graphics Contexts' },
    { id: 'ship-catalog', title: 'Ship And Enemy Catalog' },
    { id: 'stage-families', title: 'Stage Family Progression' },
    { id: 'artifact-conformance-status', title: 'Artifact Conformance Status' },
    { id: 'target-artifact-coverage', title: 'Target Artifact Coverage' },
    { id: 'alien-visual-reference-pack', title: 'Alien Visual References' },
    { id: 'galaga-alien-motion-reference', title: 'Alien Motion Reference' },
    { id: 'galaga-target-evidence-audit', title: 'Trusted Target Audit' },
    { id: 'galaga-alien-temporal-targets', title: 'Alien Temporal Targets' },
    { id: 'aurora-sprite-motion-correspondence', title: 'Sprite Motion Correspondence' },
    { id: 'sprite-conformance-variation-plan', title: 'Sprite Conformance Plan' },
    { id: 'conformance-alien-index', title: 'Alien Conformance Index' },
    { id: 'conformance-audio-index', title: 'Audio Conformance Index' },
    { id: 'stage-conformance-summary', title: 'Stage Conformance Summary' },
    { id: 'level-visual-conformance-index', title: 'Level Visual Index' },
    { id: 'challenge-stage-conformance', title: 'Challenge Stage Deep Dive' },
    { id: 'persona-catalog', title: 'Testing Personas' },
    { id: 'persona-performance-distribution', title: 'Persona Performance Distribution' },
    { id: 'graphics-controls', title: 'Presentation Controls' },
    { id: 'guide-links', title: 'Related Guides' }
  ];
  const toc = tocItems.map(section => `
    <li><a href="#${esc(section.id)}">${esc(section.title)}</a></li>
  `).join('\n');
  const eventRows = (guide.audioEventMatrix || []).map((entry) => {
    const actions = [];
    if(entry.entryId){
      actions.push(`<button class="audioAction" type="button" data-event-entry-id="${esc(entry.entryId)}" data-event-mode="current">Play Current</button>`);
      actions.push(`<button class="audioAction" type="button" data-event-entry-id="${esc(entry.entryId)}" data-event-mode="aurora">Play Aurora</button>`);
    }
    if(entry.referenceClip){
      actions.push(`<button class="audioAction" type="button" data-event-reference="${esc(entry.referenceClip)}" data-event-label="${esc(entry.event || entry.id || 'reference')}">Play Reference</button>`);
    }
    if(entry.entryId && entry.referenceClip){
      actions.push(`<button class="audioAction" type="button" data-event-entry-id="${esc(entry.entryId)}" data-event-reference="${esc(entry.referenceClip)}" data-event-mode="compare">Compare</button>`);
    }
    return `
    <tr>
      <td><strong>${esc(entry.event || '')}</strong><br><span class="docMeta">${esc(entry.phase || '')}</span></td>
      <td>${esc(entry.timing || '')}</td>
      <td><code>${esc(entry.audioName || '')}</code><br><span class="docMeta">${esc(entry.status || '')}</span></td>
      <td><strong>Start:</strong> ${esc(entry.trigger || '')}<br><strong>Stop:</strong> ${esc(entry.stop || '')}</td>
      <td>${esc(entry.note || '')}</td>
      <td>${actions.length ? `<div class="buttonRow">${actions.join('')}</div>` : '<span class="docMeta">No preview wired yet</span>'}</td>
    </tr>
  `;
  }).join('\n');
  const audioRows = (guide.audioContexts || []).map((entry, index) => `
    <tr>
      <td><strong>${esc(entry.context || '')}</strong><br><span class="docMeta">${esc(entry.label || '')}</span></td>
      <td><code>${esc(entry.cue || '')}</code></td>
      <td><code>${esc(entry.phase || '')}</code></td>
      <td><code>${esc(entry.audioTheme || '')}</code></td>
      <td>${esc(entry.listenFor || '')}</td>
      <td>${esc(entry.description || '')}</td>
      <td><button class="audioAction" type="button" data-audio-index="${index}">Play Sound</button></td>
    </tr>
  `).join('\n');
  const comparisonRows = (guide.comparisonSets || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.label || '')}</strong></td>
      <td>
        <div>${esc(entry.focus || '')}</div>
        ${entry.mappingStatus ? `<div class="docMeta" style="margin-top:8px;"><strong>Mapping status:</strong> ${esc(entry.mappingStatus)}</div>` : ''}
        ${entry.mappingConfidence ? `<div class="docMeta"><strong>Confidence:</strong> ${esc(entry.mappingConfidence)}</div>` : ''}
      </td>
      <td>
        <div class="buttonRow">
          <button class="audioAction" type="button" data-compare-entry-id="${esc(entry.entryId || '')}" data-theme-play="aurora">Play Aurora</button>
          <button class="audioAction" type="button" data-compare-entry-id="${esc(entry.entryId || '')}" data-theme-play="galaga">Play Galaga Synth</button>
          <button class="audioAction" type="button" data-compare-entry-id="${esc(entry.entryId || '')}" data-theme-play="galaga-assets">Play Runtime Ref</button>
          <button class="audioAction" type="button" data-compare-entry-id="${esc(entry.entryId || '')}" data-theme-play="reference">Play Reference</button>
          <button class="audioAction" type="button" data-compare-entry-id="${esc(entry.entryId || '')}" data-theme-play="ab">Compare A/B</button>
          <button class="audioAction" type="button" data-compare-entry-id="${esc(entry.entryId || '')}" data-theme-play="triple">Compare All Three</button>
        </div>
        <div class="docMeta">${esc(entry.referenceLabel || '')}</div>
      </td>
    </tr>
  `).join('\n');
  const themeCards = (guide.graphicsThemes || []).map((entry) => `
    <article class="visualCard">
      <h3>${esc(entry.label || entry.id || '')}</h3>
      <p>${esc(entry.description || '')}</p>
      <div>
        ${(entry.swatches || []).map(color => `
          <span class="swatchTag"><span class="swatch" style="background:${esc(color)}"></span><code>${esc(color)}</code></span>
        `).join('')}
      </div>
      <div class="visualMeta">
        <div><strong>Theme Id:</strong> <code>${esc(entry.id || '')}</code></div>
        <div><strong>Group:</strong> ${esc(entry.group || '')}</div>
        <div><strong>Audio Theme:</strong> <code>${esc(entry.audioTheme || '')}</code></div>
        <div><strong>Backgrounds:</strong> ${esc(entry.backgrounds || '')}</div>
        <div><strong>Starfield:</strong> <code>${esc(entry.starfieldProfile || '')}</code> · ${esc(String(entry.starfieldCount || ''))} stars</div>
        <div><strong>Alpha:</strong> ${esc(entry.alpha || '')}</div>
        <div><strong>Speed:</strong> ${esc(entry.speed || '')}</div>
      </div>
    </article>
  `).join('\n');
  const contextCards = (guide.graphicsContexts || []).map((entry) => `
    <article class="visualCard">
      <h3>${esc(entry.label || '')}</h3>
      <p>${esc(entry.description || '')}</p>
      <div class="visualMeta">
        <div><strong>Phase:</strong> <code>${esc(entry.phase || '')}</code></div>
        <div><strong>Theme:</strong> <code>${esc(entry.theme || '')}</code></div>
        <div><strong>Background Mode:</strong> <code>${esc(entry.backgroundMode || '')}</code></div>
        <div><strong>Frame Accent:</strong> <code>${esc(entry.frameAccent || '')}</code></div>
      </div>
    </article>
  `).join('\n');
  const shipRows = (guide.shipCatalog || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.name || '')}</strong><br><span class="docMeta">${esc(entry.type || '')}</span></td>
      <td>${renderCatalogVisualMedia(entry, { includeReferenceTargets: true })}</td>
      <td>${esc(entry.families || '')}</td>
      <td>${esc(entry.appears || '')}</td>
      <td>${esc(entry.context || '')}</td>
      <td>${esc(entry.notes || '')}</td>
    </tr>
  `).join('\n');
  const stageFamilyRows = (guide.stageFamilies || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.band || '')}</strong><br><span class="docMeta">from stage ${esc(entry.fromStage || '')}</span></td>
      <td>${esc(entry.families || '')}</td>
      <td><code>${esc(entry.bossArchetype || '')}</code></td>
      <td>${esc(entry.description || '')}</td>
    </tr>
  `).join('\n');
  const artifactConformance = loadApplicationArtifactConformance();
  const artifactConformanceRows = (artifactConformance.rows || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.surface || '')}</strong><br><span class="docMeta">${esc(entry.status || '')}</span></td>
      <td><strong>${esc(entry.current || '')}</strong><br><span class="docMeta">Target: ${esc(entry.target || '')}</span></td>
      <td>${esc(entry.measurement || '')}</td>
      <td>${renderArtifactEvidenceList(entry.evidence)}</td>
      <td>${esc(entry.next || '')}</td>
    </tr>
  `).join('\n') || `
    <tr>
      <td colspan="5"><span class="docMeta">Artifact conformance status pending. Run <code>npm run harness:analyze:application-artifact-conformance</code> to generate this table.</span></td>
    </tr>
  `;
  const galagaTargetArtifactCoverage = loadGalagaTargetArtifactCoverage();
  const targetArtifactSummary = galagaTargetArtifactCoverage.summary || {};
  const targetArtifactRows = renderTargetArtifactCoverageRows(galagaTargetArtifactCoverage);
  const challengeTargetRows = renderChallengeTargetCoverageRows(galagaTargetArtifactCoverage);
  const galagaAlienVisualReference = loadGalagaAlienVisualReference();
  const alienVisualReferenceSummary = galagaAlienVisualReference.summary || {};
  const alienVisualReferenceRows = renderAlienVisualReferenceRows(galagaAlienVisualReference);
  const galagaAlienMotionReference = loadGalagaAlienMotionReference();
  const galagaAlienMotionRoleRows = renderGalagaAlienMotionRoleRows(galagaAlienMotionReference);
  const spriteConformanceVariationPlan = loadSpriteConformanceVariationPlan();
  const spriteConformanceLaneRows = renderSpriteConformanceLaneRows(spriteConformanceVariationPlan);
  const spriteConformancePipelineRows = renderSpriteConformancePipelineRows(spriteConformanceVariationPlan);
  const spriteConformanceSuccessRows = renderSpriteConformanceSuccessRows(spriteConformanceVariationPlan);
  const galagaAlienCropPreviews = loadGalagaAlienCropPreviews();
  const galagaAlienCropPreviewSummary = galagaAlienCropPreviews.summary || {};
  const galagaAlienCropPreviewRows = renderGalagaAlienCropPreviewRows(galagaAlienCropPreviews);
  const galagaAlienCropRoleRows = renderGalagaAlienCropRoleRows(galagaAlienCropPreviews);
  const galagaAlienTargetCrops = loadGalagaAlienTargetCrops();
  const galagaAlienTargetCropSummary = galagaAlienTargetCrops.summary || {};
  const galagaAlienTargetRoleRows = renderGalagaAlienTargetRoleRows(galagaAlienTargetCrops);
  const galagaAlienTargetCropRows = renderGalagaAlienTargetCropRows(galagaAlienTargetCrops);
  const galagaTargetEvidenceAudit = loadGalagaTargetEvidenceAudit();
  const galagaTargetEvidenceAuditSummary = galagaTargetEvidenceAudit.summary || {};
  const galagaTargetEvidenceAuditRows = renderGalagaTargetEvidenceAuditRows(galagaTargetEvidenceAudit);
  const galagaAlienTemporalTargets = loadGalagaAlienTemporalTargets();
  const galagaAlienTemporalTargetSummary = galagaAlienTemporalTargets.summary || {};
  const galagaAlienTemporalTargetRows = renderGalagaAlienTemporalTargetRows(galagaAlienTemporalTargets);
  const auroraRuntimeSpriteConformance = loadAuroraRuntimeSpriteConformance();
  const auroraRuntimeSpriteSummary = auroraRuntimeSpriteConformance.summary || {};
  const auroraSpriteMotionCorrespondence = loadAuroraSpriteMotionCorrespondence();
  const auroraSpriteMotionCorrespondenceSummary = auroraSpriteMotionCorrespondence.summary || {};
  const auroraSpriteMotionCorrespondenceRows = renderAuroraSpriteMotionCorrespondenceRows(auroraSpriteMotionCorrespondence);
  const auroraRuntimeVsGalagaTargetCrops = loadAuroraRuntimeVsGalagaTargetCrops();
  const auroraRuntimeVsGalagaTargetSummary = auroraRuntimeVsGalagaTargetCrops.summary || {};
  const auroraRuntimeVsTargetRows = renderAuroraRuntimeVsTargetRows(auroraRuntimeVsGalagaTargetCrops);
  const auroraSpriteTemporalRows = renderAuroraSpriteTemporalRows(auroraRuntimeSpriteConformance);
  const auroraSpriteCadenceRows = renderAuroraSpriteCadenceRows(auroraRuntimeSpriteConformance);
  const auroraRuntimeVsTargetTemporalRows = renderAuroraRuntimeVsTargetTemporalRows(auroraRuntimeVsGalagaTargetCrops);
  const auroraSpritePoseRows = renderAuroraSpritePoseRows(auroraRuntimeSpriteConformance);
  const auroraImpactExplosionConformance = loadAuroraImpactExplosionConformance();
  const auroraImpactExplosionSummary = auroraImpactExplosionConformance.summary || {};
  const auroraImpactExplosionRows = renderAuroraImpactExplosionRows(auroraImpactExplosionConformance);
  const conformanceAlienRows = (guide.conformanceAlienRows || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.name || '')}</strong><br><span class="docMeta">${esc(entry.runtime || '')}</span></td>
      <td>${renderCatalogVisualMedia(entry, { includeReferenceContext: true, showPendingTarget: true })}</td>
      <td>${esc(entry.activity || '')}</td>
      <td>${esc(entry.presence || '')}</td>
      <td>${esc(entry.reference || '')}</td>
      <td><strong>${esc(entry.score || '')}</strong><br><span class="docMeta">${esc(entry.confidence || '')}</span></td>
      <td>${esc(entry.next || '')}</td>
    </tr>
  `).join('\n');
  const conformanceAudioRows = (guide.conformanceAudioRows || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.family || '')}</strong><br><span class="docMeta"><code>${esc(entry.cues || '')}</code></span></td>
      <td>${esc(entry.meaning || '')}</td>
      <td>${renderConformanceAudioReview(entry, guide)}</td>
      <td>${esc(entry.reference || '')}</td>
      <td><strong>${esc(entry.score || '')}</strong><br><span class="docMeta">${esc(entry.confidence || '')}</span></td>
      <td>${esc(entry.next || '')}</td>
    </tr>
  `).join('\n');
  const stageConformanceRows = (guide.stageConformanceRows || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.stage || '')}</strong></td>
      <td>${esc(entry.summary || '')}</td>
      <td>${esc(entry.aspects || '')}</td>
      <td>${esc(entry.evidence || '')}</td>
      <td>${esc(entry.gap || '')}</td>
    </tr>
  `).join('\n');
  const challengeStageConformance = loadChallengeStageConformance();
  const challengeSummary = challengeStageConformance.summary || {};
  const challengeStageRows = (challengeStageConformance.stageRows || []).map(renderChallengeStageDetail).join('\n') || `
    <div class="docWrap"><span class="docMeta">Challenge-stage conformance analysis pending. Run <code>npm run harness:analyze:challenge-stage-conformance</code>.</span></div>
  `;
  const levelVisualIndex = loadLevelVisualConformanceIndex();
  const levelVisualSummary = levelVisualIndex.summary || {};
  const levelVisualRows = (levelVisualIndex.rows || []).map(renderLevelVisualDetail).join('\n') || `
    <div class="docWrap"><span class="docMeta">Level visual conformance index pending. Run <code>npm run harness:analyze:level-visual-conformance-index</code>.</span></div>
  `;
  const personaRows = (guide.personaRows || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.label || '')}</strong><br><span class="docMeta">${esc(entry.harnessId || '')}</span></td>
      <td>${esc(entry.role || '')}</td>
      <td>${esc(entry.expected || '')}</td>
      <td>${esc(entry.checks || '')}</td>
    </tr>
  `).join('\n');
  const personaDistribution = loadPersonaPerformanceDistribution();
  const personaDistributionRows = (personaDistribution.summaryRows || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.label || '')}</strong><br><span class="docMeta"><code>${esc(entry.persona || '')}</code><br>${esc(entry.seedRange || '')}</span></td>
      <td><strong>${esc(entry.runCount || 0)}</strong><br><span class="docMeta">Seeded full-run games</span></td>
      <td>${personaStatCell(entry.score)}</td>
      <td>${personaStatCell(entry.stageReached)}</td>
      <td>${personaStatCell(entry.durationMin, ' min')}</td>
      <td>${personaStatCell(entry.scorePerMinute)}</td>
      <td>${personaStatCell(entry.shipLosses)}</td>
      <td><strong>${esc(pct(entry.challengeHitRate?.avg || 0))}</strong><br><span class="docMeta">median ${esc(pct(entry.challengeHitRate?.median || 0))}</span></td>
    </tr>
  `).join('\n') || `
    <tr>
      <td colspan="8"><span class="docMeta">Persona distribution pending. Run <code>npm run harness:batch -- --profile distribution --repeats 30</code>, then <code>npm run harness:analyze:persona-performance-distribution</code>.</span></td>
    </tr>
  `;
  const personaFindingRows = (personaDistribution.findings || []).map((finding) => `
    <li><strong>P${esc(finding.priority || '')}: ${esc(finding.title || '')}</strong> ${esc(finding.detail || '')}</li>
  `).join('\n');
  const controlRows = (guide.graphicsControls || []).map((entry) => `
    <tr>
      <td><strong>${esc(entry.label || '')}</strong></td>
      <td>${esc(entry.values || '')}</td>
      <td>${esc(entry.description || '')}</td>
    </tr>
  `).join('\n');
  const linkCards = (guide.links || []).map((link) => `
    <article class="linkCard">
      <h3><a href="${esc(link.href || '#')}">${esc(link.label || '')}</a></h3>
      <p>${esc(link.detail || '')}</p>
    </article>
  `).join('\n');
  const guideDataJson = escJsonForScript({
    audioContexts: guide.audioContexts || [],
    comparisonSets: guide.comparisonSets || []
  });
  const body = `
    <main class="shell">
      <div class="main">
        <section class="hero">
          <div class="heroTop">
            <span class="eyebrow">Aurora Application Guide</span>
            <a class="homeLink" href="index.html">Open current lane build</a>
            <a class="homeLink" href="project-guide.html">Project guide</a>
          </div>
          <h1>${esc(guide.title || 'Aurora Application Guide')}</h1>
          <p>${esc(guide.strapline || '')}</p>
          <div class="goal"><strong>Guide focus:</strong> ${esc(guide.currentGoal || '')}</div>
          <div class="meta">
            <div class="metaCard">
              <span class="metaLabel">Current Release</span>
              <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Lane</span>
              <span class="metaValue">${esc(buildInfo.releaseChannel)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Updated</span>
              <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Latest Note</span>
              <span class="metaValue">${esc(latestNote.title)}</span>
            </div>
          </div>
          <div class="heroLinks">
            <a class="button" href="index.html">Open current lane build</a>
            <a class="button" href="project-guide.html">Open project guide</a>
            <a class="button" href="white-paper.html">Open white paper</a>
            <a class="button" href="platinum-guide.html">Open Platinum guide</a>
            <a class="button" href="player-guide.html">Open player guide</a>
          </div>
        <div class="previewNote">
            Sound buttons use a hidden same-origin preview frame running the current lane build, so the page plays Aurora, Galaga synth, and Galaga reference-runtime cues through the real in-game audio engine instead of a separate mock player. Reference buttons play extracted Galaga clips from the curated artifact library. If a button seems silent, check browser audio permission and the game's mute preference in the current lane build.
          </div>
          <div id="audioPreviewStatus" class="audioStatus" aria-live="polite">Preview frame loading. Audio buttons will use the current lane build as soon as it is ready.</div>
        </section>

        <section class="section" id="audio-event-matrix">
          <div class="sectionHeader">
            <h2>Audio Event Matrix</h2>
            <p>A refreshed event-by-event timing map for Aurora against the current Galaga alignment work. Use this to review what each event is, when the sound should land, which cue or reference excerpt we use, and what should interrupt or protect it.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Game Event</th>
                  <th>Timing Of Activity</th>
                  <th>Audio Name / Status</th>
                  <th>How It Starts / Stops</th>
                  <th>Comment / Gap</th>
                  <th>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                ${eventRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="audio-catalog">
          <div class="sectionHeader">
            <h2>Audio Catalog</h2>
            <p>Every currently documented Aurora sound context, grouped by where it appears in the application and playable directly from this page.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Context</th>
                  <th>Cue</th>
                  <th>Phase</th>
                  <th>Theme</th>
                  <th>Listen For</th>
                  <th>Description</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                ${audioRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="theme-comparison">
          <div class="sectionHeader">
            <h2>Theme Comparison</h2>
            <p>Compare the same gameplay moments side by side. Aurora uses the application-owned mix, Galaga uses the current synthetic classic-leaning runtime family for the same cue and phase, and Reference plays the actual extracted Galaga clip we currently treat as the best mapping target.</p>
          </div>
          <div class="buttonRow" style="margin-bottom:16px;">
            <button class="audioAction" type="button" data-compare-set="aurora">Play Aurora Set</button>
            <button class="audioAction" type="button" data-compare-set="galaga">Play Galaga Synth Set</button>
            <button class="audioAction" type="button" data-compare-set="galaga-assets">Play Runtime Ref Set</button>
            <button class="audioAction" type="button" data-compare-set="reference">Play Reference Set</button>
            <button class="audioAction" type="button" data-compare-set="ab">Compare Full Set</button>
            <button class="audioAction" type="button" data-compare-set="triple">Compare All Three</button>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Gameplay Element</th>
                  <th>What To Compare</th>
                  <th>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                ${comparisonRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="visual-themes">
          <div class="sectionHeader">
            <h2>Visual Themes</h2>
            <p>The main atmosphere families that Aurora currently uses for front-door identity, classic play, and later-stage Aurora presentation.</p>
          </div>
          <div class="visualGrid">
            ${themeCards}
          </div>
        </section>

        <section class="section" id="visual-contexts">
          <div class="sectionHeader">
            <h2>Graphics Contexts</h2>
            <p>How the visual themes are actually applied across front door, wait mode, standard stages, and challenge stages.</p>
          </div>
          <div class="visualGrid">
            ${contextCards}
          </div>
        </section>

        <section class="section" id="ship-catalog">
          <div class="sectionHeader">
            <h2>Ship And Enemy Catalog</h2>
            <p>The player ship, dual-fighter state, base enemy types, and challenge-family presentations that currently make up Aurora's live board.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Ship / Type</th>
                  <th>Visual</th>
                  <th>Families / Presentation</th>
                  <th>Where It Appears</th>
                  <th>Gameplay Context</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${shipRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="stage-families">
          <div class="sectionHeader">
            <h2>Stage Family Progression</h2>
            <p>How Aurora changes the visible enemy families and named boss archetypes as stage bands advance.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Stage Band</th>
                  <th>Families In Use</th>
                  <th>Boss Archetype</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${stageFamilyRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="artifact-conformance-status">
          <div class="sectionHeader">
            <h2>Artifact Conformance Status</h2>
            <p>Target-versus-current conformance across the application artifacts that shape the game: sprite targets, sprite motion, audio cues, backgrounds, shell/icon surfaces, fonts, stage feel, and boss choreography. Rows are generated from the current analysis artifacts so the scorecard stays tied to measured evidence.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Artifact Surface</th>
                  <th>Current / Target</th>
                  <th>Measurement</th>
                  <th>Evidence</th>
                  <th>Next Gap</th>
                </tr>
              </thead>
              <tbody>
                ${artifactConformanceRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="target-artifact-coverage">
          <div class="sectionHeader">
            <h2>Target Artifact Coverage</h2>
            <p>The online and local Galaga artifacts that best illustrate Aurora's target, with explicit status for what has actually been ingested. This keeps challenge-stage, sprite, audio, rules, and screen-surface work tied to visible evidence instead of loose memory.</p>
          </div>
          <div class="docWrap">
            <p><strong>Coverage read:</strong> ${esc(targetArtifactSummary.coverageScore10 ?? 'n/a')}/10 overall target-artifact ingestion; ${esc(targetArtifactSummary.challengeStageReadiness10 ?? 'n/a')}/10 challenge-stage target readiness; ${esc(targetArtifactSummary.lateChallengeGapCount ?? 'n/a')} late challenge windows still missing.</p>
            <p>${esc(targetArtifactSummary.interpretation || 'Run the Galaga target artifact coverage analyzer to refresh this readout.')}</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json</code>. <strong>Report:</strong> <code>GALAGA_TARGET_ARTIFACT_COVERAGE.md</code>.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Target Artifact</th>
                  <th>Status</th>
                  <th>Coverage</th>
                  <th>Why It Matters</th>
                  <th>Current Use</th>
                  <th>Missing Work</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                ${targetArtifactRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Challenge Target</th>
                  <th>Status</th>
                  <th>Coverage</th>
                  <th>Current Evidence</th>
                  <th>Next Need</th>
                </tr>
              </thead>
              <tbody>
                ${challengeTargetRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="alien-visual-reference-pack">
          <div class="sectionHeader">
            <h2>Alien Visual References</h2>
            <p>Close-up Galaga alien and player-fighter references supplied for sprite analysis, role indexing, target-crop planning, and future graphical conformance scoring. The guide intentionally separates target candidates from fan/product/context images so automated scoring stays grounded.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current read:</strong> ${esc(alienVisualReferenceSummary.existingImageCount || 0)} committed images, ${esc(alienVisualReferenceSummary.uniqueImageHashCount || 0)} unique hashes, ${esc(alienVisualReferenceSummary.targetCandidateCount || 0)} target candidates, and ${esc(alienVisualReferenceSummary.roleCoverageCount || 0)} covered role families.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-alien-visual-reference/latest.json</code>. <strong>Report:</strong> <code>GALAGA_ALIEN_VISUAL_REFERENCE.md</code>. Strongest current source: <code>${esc(alienVisualReferenceSummary.strongestTargetSource || 'pending')}</code>.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Preview</th>
                  <th>Role Coverage</th>
                  <th>Target Use</th>
                  <th>Promotion Note</th>
                </tr>
              </thead>
              <tbody>
                ${alienVisualReferenceRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="galaga-alien-motion-reference">
          <div class="sectionHeader">
            <h2>Alien Motion Reference</h2>
            <p>Segmented Galaga alien video reference for pulse cadence, role taxonomy, and clean human-readable sprite identity. This sits between static crop extraction and gameplay trajectory scoring: it helps us see whether the sprite identities move and pulse like the target before we promote a conformance claim.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current read:</strong> ${esc(galagaAlienMotionReference.status || 'pending')}. ${esc(galagaAlienMotionReference.summary || 'Motion reference analysis pending.')}</p>
            <p><strong>Conformance use:</strong> ${esc(galagaAlienMotionReference.conformanceRead || 'Use this reference to validate crop boxes and seed temporal sprite scoring.')}</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-alien-motion-reference/latest.json</code>. <strong>Readable report:</strong> <code>GALAGA_ALIEN_MOTION_REFERENCE.md</code>. <strong>Generated:</strong> ${esc(galagaAlienMotionReference.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Duration</span><strong>${esc(galagaAlienMotionReference.video?.durationSeconds ?? 'n/a')}s</strong><span>${esc(galagaAlienMotionReference.video?.frameRate || 'frame rate pending')}</span></div>
              <div class="metricCard"><span class="metricLabel">Frame Size</span><strong>${esc(galagaAlienMotionReference.video?.width || 0)}x${esc(galagaAlienMotionReference.video?.height || 0)}</strong><span>source video pixels</span></div>
              <div class="metricCard"><span class="metricLabel">Role Families</span><strong>${esc((galagaAlienMotionReference.roleTaxonomy || []).length)}</strong><span>taxonomy rows</span></div>
              <div class="metricCard"><span class="metricLabel">Next Fix</span><strong>clean crops</strong><span>boss, bee, butterfly first</span></div>
            </div>
          </div>
          <div class="catalogMedia" style="margin-top:16px;">
            <div class="catalogMediaGrid">
              ${renderMediaVideo({
                label: 'Segmented alien pulse reference video',
                src: galagaAlienMotionReference.media?.inlineVideo,
                poster: galagaAlienMotionReference.media?.contactSheet,
                note: 'User-supplied segmented Galaga alien reference showing named roles and pulse/motion phases.'
              })}
              ${renderMediaImage({
                label: 'Alien pulse contact sheet',
                src: galagaAlienMotionReference.media?.contactSheet,
                note: '1 fps review sheet for quickly scanning the whole segmented video.'
              })}
              ${renderMediaImage({
                label: 'Alien pulse motion sheet',
                src: galagaAlienMotionReference.media?.motionSheet,
                note: '2 fps review sheet for inspecting pulse cadence and transition frames.'
              })}
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Reference Use</th>
                  <th>Next Extraction</th>
                  <th>Priority Read</th>
                </tr>
              </thead>
              <tbody>
                ${galagaAlienMotionRoleRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="galaga-target-evidence-audit">
          <div class="sectionHeader">
            <h2>Trusted Target Evidence Audit</h2>
            <p>Human review found that some visually precise target crops were precise about the wrong thing: polluted sheet cells, partial neighboring sprites, or ambiguous evidence. This audit separates trusted target evidence from provisional planning evidence before scores drive more runtime sprite work.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current read:</strong> ${esc(galagaTargetEvidenceAudit.status || 'pending')}. <strong>Next best step:</strong> ${esc(galagaTargetEvidenceAudit.nextBestStep || 'Regenerate target evidence audit after crop promotion.')}</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-target-evidence-audit/latest.json</code>. <strong>Readable report:</strong> <code>GALAGA_TARGET_EVIDENCE_AUDIT.md</code>. <strong>Generated:</strong> ${esc(galagaTargetEvidenceAudit.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Audited Roles</span><strong>${esc(galagaTargetEvidenceAuditSummary.auditedRoleCount ?? 0)}</strong><span>Boss, Bee, Butterfly, Fighter first</span></div>
              <div class="metricCard"><span class="metricLabel">Trusted Primaries</span><strong>${esc(galagaTargetEvidenceAuditSummary.trustedPrimaryRoleCount ?? 0)}</strong><span>usable for scoring now</span></div>
              <div class="metricCard"><span class="metricLabel">Motion Crops</span><strong>${esc(galagaTargetEvidenceAuditSummary.trustedMotionReferenceCount ?? 0)}</strong><span>cleaned from segmented video</span></div>
              <div class="metricCard"><span class="metricLabel">Provisional Cells</span><strong>${esc(galagaTargetEvidenceAuditSummary.provisionalSourceSheetCount ?? 0)}</strong><span>do not overclaim</span></div>
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Evidence</th>
                  <th>Previous Risk</th>
                  <th>Scoring Use</th>
                  <th>Player Meaning</th>
                  <th>Next Gap</th>
                </tr>
              </thead>
              <tbody>
                ${galagaTargetEvidenceAuditRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="galaga-alien-temporal-targets">
          <div class="sectionHeader">
            <h2>Alien Temporal Targets</h2>
            <p>Temporal sprite identity is now treated separately from static sprite identity. These rows define the pose sequences the runtime cadence scorer uses for Boss, Bee, and Butterfly, while clearly marking which parts are trusted motion-reference evidence and which parts are still provisional.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current read:</strong> ${esc(galagaAlienTemporalTargets.status || 'pending')}. <strong>Next best step:</strong> ${esc(galagaAlienTemporalTargets.nextBestStep || 'Generate temporal target rows before claiming animation conformance.')}</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-alien-temporal-targets/latest.json</code>. <strong>Cadence artifact:</strong> <code>reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest.json</code>. <strong>Readable reports:</strong> <code>GALAGA_ALIEN_TEMPORAL_TARGETS.md</code>, <code>GALAGA_ALIEN_FRAME_CADENCE_TARGETS.md</code>. <strong>Generated:</strong> ${esc(galagaAlienTemporalTargets.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Temporal Rows</span><strong>${esc(galagaAlienTemporalTargetSummary.temporalRowCount ?? 0)}</strong><span>Boss, Bee, Butterfly</span></div>
              <div class="metricCard"><span class="metricLabel">Trusted Links</span><strong>${esc(galagaAlienTemporalTargetSummary.trustedCropLinks ?? 0)}</strong><span>motion-reference crops</span></div>
              <div class="metricCard"><span class="metricLabel">Provisional Links</span><strong>${esc(galagaAlienTemporalTargetSummary.provisionalCropLinks ?? 0)}</strong><span>need better windows</span></div>
              <div class="metricCard"><span class="metricLabel">Frame-Labeled Rows</span><strong>${esc(galagaAlienTemporalTargetSummary.finalFrameTimedRows ?? 0)}</strong><span>${esc(galagaAlienTemporalTargetSummary.frameLabeledSegmentedReferenceRows ?? 0)} segmented reference</span></div>
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Temporal Target</th>
                  <th>Pose Sequence</th>
                  <th>Evidence</th>
                  <th>Source Read</th>
                  <th>Scoring Use</th>
                  <th>Next Gap</th>
                </tr>
              </thead>
              <tbody>
                ${galagaAlienTemporalTargetRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="aurora-sprite-motion-correspondence">
          <div class="sectionHeader">
            <h2>Sprite Motion Correspondence</h2>
            <p>This is the bridge between Galaga temporal target evidence and Aurora runtime motion captures. It answers whether current sprites merely look acceptable in still crops or actually move with enough flap, pulse, cadence, dive, and transition evidence to support challenge-stage conformance claims.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current read:</strong> ${Number.isFinite(+auroraSpriteMotionCorrespondenceSummary.averageScore10) ? `${Number(auroraSpriteMotionCorrespondenceSummary.averageScore10).toFixed(1)}/10` : 'pending'}. <strong>Timing status:</strong> ${esc(auroraSpriteMotionCorrespondenceSummary.targetTimingStatus || 'pending')}. <strong>Next best step:</strong> ${esc(auroraSpriteMotionCorrespondence.nextBestStep || 'Promote frame-labeled target cadence windows before raising animation conformance claims.')}</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/aurora-sprite-motion-correspondence/latest.json</code>. <strong>Readable report:</strong> <code>AURORA_SPRITE_MOTION_CORRESPONDENCE.md</code>. <strong>Generated:</strong> ${esc(auroraSpriteMotionCorrespondence.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Rows</span><strong>${esc(auroraSpriteMotionCorrespondenceSummary.rowCount ?? 0)}</strong><span>Boss, Bee, Butterfly</span></div>
              <div class="metricCard"><span class="metricLabel">Weakest</span><strong>${esc(auroraSpriteMotionCorrespondenceSummary.weakestRuntimeSpriteKey || 'n/a')}</strong><span>${Number.isFinite(+auroraSpriteMotionCorrespondenceSummary.weakestScore10) ? `${Number(auroraSpriteMotionCorrespondenceSummary.weakestScore10).toFixed(1)}/10` : 'pending'}</span></div>
              <div class="metricCard"><span class="metricLabel">Frame Timed</span><strong>${esc(auroraSpriteMotionCorrespondenceSummary.finalFrameTimedRows ?? 0)}</strong><span>target cadence rows</span></div>
              <div class="metricCard"><span class="metricLabel">Provisional</span><strong>${esc(auroraSpriteMotionCorrespondenceSummary.provisionalTargetRows ?? 0)}</strong><span>target rows capped</span></div>
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Motion Row</th>
                  <th>Score</th>
                  <th>Target Readiness</th>
                  <th>Runtime Readiness</th>
                  <th>Evidence</th>
                  <th>Cap / Next Gap</th>
                </tr>
              </thead>
              <tbody>
                ${auroraSpriteMotionCorrespondenceRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="sprite-conformance-variation-plan">
          <div class="sectionHeader">
            <h2>Sprite Conformance Plan</h2>
            <p>${esc(spriteConformanceVariationPlan.summary || 'Plan the sprite path from source-grounded conformance to production-safe themed variation.')}</p>
          </div>
          <div class="docWrap">
            <p><strong>Plan status:</strong> ${esc(spriteConformanceVariationPlan.status || 'pending')}. <strong>Next best step:</strong> ${esc(spriteConformanceVariationPlan.nextBestStep || 'Create target crop manifests before raising sprite conformance claims.')}</p>
            <p>This plan separates the internal reference-conformance lane from the Aurora production theme lane. The goal is to ingest and measure toward a conforming experience, then let Aurora and later Platinum games ship distinctive original visual styles that preserve era, motion, role readability, and gameplay meaning.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/ingestion/sprite-conformance-variation-plan/plan-0.1.json</code>. <strong>Readable plan:</strong> <code>SPRITE_CONFORMANCE_VARIATION_STRATEGY.md</code>.</p>
          </div>
          <div class="docWrap" style="margin-top:16px;">
            <h3>Galaga Sprite Crop Preview</h3>
            <p>The supplied Galaga general sprite sheet now has generated region previews and grid overlays. These are review artifacts, not promoted canonical targets yet: the next conformance step is to choose exact per-role and per-pose boxes, then score Aurora runtime sprites against those accepted targets.</p>
            <p><strong>Preview status:</strong> ${esc(galagaAlienCropPreviews.status || 'pending')}. <strong>Scoring status:</strong> ${esc(galagaAlienCropPreviewSummary.scoredStatus || 'unscored-preview-only')}.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-alien-visual-crop-previews/latest.json</code>. <strong>Readable report:</strong> <code>GALAGA_ALIEN_CROP_PREVIEW.md</code>. <strong>Generated:</strong> ${esc(galagaAlienCropPreviews.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Preview Regions</span><strong>${esc(galagaAlienCropPreviewSummary.regionCount ?? 0)}</strong><span>source-sheet sections</span></div>
              <div class="metricCard"><span class="metricLabel">Grid Cells</span><strong>${esc(galagaAlienCropPreviewSummary.gridCellCount ?? 0)}</strong><span>candidate cells scanned</span></div>
              <div class="metricCard"><span class="metricLabel">Lit Candidates</span><strong>${esc(galagaAlienCropPreviewSummary.interestingCellCount ?? 0)}</strong><span>persisted for crop promotion</span></div>
              <div class="metricCard"><span class="metricLabel">Target Roles</span><strong>${esc(galagaAlienCropPreviewSummary.targetRoleCount ?? 0)}</strong><span>planned for crop promotion</span></div>
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Source Region</th>
                  <th>Preview</th>
                  <th>Grid Review</th>
                  <th>Candidate Read</th>
                  <th>Next Review</th>
                </tr>
              </thead>
              <tbody>
                ${galagaAlienCropPreviewRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Target Role</th>
                  <th>Required Poses</th>
                  <th>Candidate Regions</th>
                  <th>Candidate Cells</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                ${galagaAlienCropRoleRows}
              </tbody>
            </table>
          </div>
          <div class="docWrap" style="margin-top:16px;">
            <h3>Promoted Galaga Target Crops</h3>
            <p>The target crop library now combines trusted cleaned motion-reference crops for the core Boss, Bee, and Butterfly formation targets with provisional source-sheet pose crops for broader planning coverage. These crops are target-lane evidence for measurement and review; they are not public production art. Aurora live runtime sprites are compared against this multi-pose library, and the next lift is deeper temporal windows for flap cadence, dive rotation, beam, explosion, capture, and challenge-stage motion.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/galaga-alien-target-crops/latest.json</code>. <strong>Readable report:</strong> <code>GALAGA_ALIEN_TARGET_CROPS.md</code>. <strong>Generated:</strong> ${esc(galagaAlienTargetCrops.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Target Crops</span><strong>${esc(galagaAlienTargetCropSummary.targetCropCount ?? 0)}</strong><span>trusted plus provisional images</span></div>
              <div class="metricCard"><span class="metricLabel">Role Sets</span><strong>${esc(galagaAlienTargetCropSummary.roleSetCount ?? 0)}</strong><span>player, aliens, effects, beam</span></div>
              <div class="metricCard"><span class="metricLabel">Trusted Motion Crops</span><strong>${esc(galagaAlienTargetCropSummary.trustedMotionReferenceCount ?? 0)}</strong><span>cleaned from video reference</span></div>
              <div class="metricCard"><span class="metricLabel">Scoring Status</span><strong>${esc(galagaAlienTargetCropSummary.scoringStatus || 'pending')}</strong><span>runtime comparison next</span></div>
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Promoted Poses</th>
                  <th>Promotion</th>
                  <th>Coverage Read</th>
                </tr>
              </thead>
              <tbody>
                ${galagaAlienTargetRoleRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Pose</th>
                  <th>Crop</th>
                  <th>Source</th>
                  <th>Metrics</th>
                  <th>Conformance Use</th>
                </tr>
              </thead>
              <tbody>
                ${galagaAlienTargetCropRows}
              </tbody>
            </table>
          </div>
          <div class="docWrap" style="margin-top:16px;">
            <h3>Aurora Runtime Versus Target Crops</h3>
            <p>This is the stricter live-rendered sprite read: each Aurora canvas crop is compared against accepted Galaga target crops after semantic role filtering. Low values here are not failures of the plan; they are the exact gaps the next sprite passes should attack.</p>
            <p class="docMeta"><strong>Runtime artifact:</strong> <code>reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json</code>. <strong>Direct target artifact:</strong> <code>reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json</code>. <strong>Generated:</strong> ${esc(auroraRuntimeVsGalagaTargetCrops.generatedAt || 'pending')}.</p>
            <div class="metricGrid">
              <div class="metricCard"><span class="metricLabel">Runtime Static Score</span><strong>${Number.isFinite(+auroraRuntimeSpriteSummary.averageScore10) ? Number(auroraRuntimeSpriteSummary.averageScore10).toFixed(1) : 'n/a'}/10</strong><span>${esc(auroraRuntimeSpriteSummary.sampleCount ?? 0)} live canvas crop(s)</span></div>
              <div class="metricCard"><span class="metricLabel">Direct Target Score</span><strong>${Number.isFinite(+auroraRuntimeVsGalagaTargetSummary.averageScore10) ? Number(auroraRuntimeVsGalagaTargetSummary.averageScore10).toFixed(1) : 'n/a'}/10</strong><span>${esc(auroraRuntimeVsGalagaTargetSummary.targetCropCount ?? 0)} target crop(s)</span></div>
              <div class="metricCard"><span class="metricLabel">Target Sequence Score</span><strong>${Number.isFinite(+auroraRuntimeVsGalagaTargetSummary.averageTemporalSequenceScore10) ? Number(auroraRuntimeVsGalagaTargetSummary.averageTemporalSequenceScore10).toFixed(1) : 'n/a'}/10</strong><span>${esc(auroraRuntimeVsGalagaTargetSummary.temporalSequenceSampleCount ?? 0)} cadence sequence(s)</span></div>
              <div class="metricCard"><span class="metricLabel">Weakest Direct Match</span><strong>${esc(auroraRuntimeVsGalagaTargetSummary.weakestSpriteKey || 'pending')}</strong><span>${Number.isFinite(+auroraRuntimeVsGalagaTargetSummary.weakestScore10) ? `${Number(auroraRuntimeVsGalagaTargetSummary.weakestScore10).toFixed(1)}/10` : 'pending'}</span></div>
              <div class="metricCard"><span class="metricLabel">Motion Axes Covered</span><strong>${esc(auroraRuntimeSpriteSummary.motionCoverageAxesCovered ?? 0)}/${esc(auroraRuntimeSpriteSummary.motionCoverageAxesPlanned ?? 4)}</strong><span>${esc(auroraRuntimeSpriteSummary.temporalSampleCount ?? 0)} phase pair(s); ${esc(auroraRuntimeSpriteSummary.cadenceSampleCount ?? 0)} cadence window(s)</span></div>
            </div>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Runtime Sprite</th>
                  <th>Aurora Current</th>
                  <th>Best Galaga Target</th>
                  <th>Score</th>
                  <th>Component Read</th>
                </tr>
              </thead>
              <tbody>
                ${auroraRuntimeVsTargetRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Motion Subject</th>
                  <th>Closed Phase</th>
                  <th>Open Phase</th>
                  <th>Delta</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                ${auroraSpriteTemporalRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Cadence Subject</th>
                  <th>Runtime Window Frames</th>
                  <th>Score Motion</th>
                  <th>Pixel Motion</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                ${auroraSpriteCadenceRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Target Sequence</th>
                  <th>Expected Poses</th>
                  <th>Runtime Frames</th>
                  <th>Sequence Score</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                ${auroraRuntimeVsTargetTemporalRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Active Pose</th>
                  <th>Runtime Crop</th>
                  <th>Model Score</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                ${auroraSpritePoseRows}
              </tbody>
            </table>
          </div>
          <div class="docWrap" style="margin-top:16px;">
            <h3>Impact And Explosion Feedback</h3>
            <p>The first impact/explosion comparator captures event visuals from the current runtime and compares them against promoted Galaga target explosion crops. This is the start of making missile impacts, boss damage, kills, and death rewards measurable instead of relying on subjective review.</p>
            <p><strong>Current read:</strong> ${Number.isFinite(+auroraImpactExplosionSummary.averageScore10) ? `${Number(auroraImpactExplosionSummary.averageScore10).toFixed(1)}/10` : 'pending'} average static event score; ${Number.isFinite(+auroraImpactExplosionSummary.averageLifecycleScore10) ? `${Number(auroraImpactExplosionSummary.averageLifecycleScore10).toFixed(1)}/10 lifecycle score` : 'lifecycle pending'}; weakest ${esc(auroraImpactExplosionSummary.weakestKey || 'pending')} ${Number.isFinite(+auroraImpactExplosionSummary.weakestScore10) ? `${Number(auroraImpactExplosionSummary.weakestScore10).toFixed(1)}/10` : ''}.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/aurora-impact-explosion-conformance/latest.json</code>. The scorer now captures onset/expansion/decay and expected audio cue coupling, but still needs exact target-video frame labels.</p>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Aurora Current</th>
                  <th>Galaga Target</th>
                  <th>Score</th>
                  <th>Player Meaning</th>
                </tr>
              </thead>
              <tbody>
                ${auroraImpactExplosionRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Lane</th>
                  <th>Purpose</th>
                  <th>Renderer Expectation</th>
                  <th>Metrics</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody>
                ${spriteConformanceLaneRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Pipeline Step</th>
                  <th>Goal</th>
                  <th>Current Status</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                ${spriteConformancePipelineRows}
              </tbody>
            </table>
          </div>
          <div class="tableWrap" style="margin-top:16px;">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Gate</th>
                  <th>Target</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                ${spriteConformanceSuccessRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="conformance-alien-index">
          <div class="sectionHeader">
            <h2>Alien Conformance Index</h2>
            <p>Current game-visible alien and enemy roles with activity, presence, evidence anchors, confidence, and the next conformance gap. This is the generated-guide view of the maintained game conformance catalog.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Alien / Role</th>
                  <th>Visual Evidence</th>
                  <th>Activity</th>
                  <th>Presence</th>
                  <th>Reference</th>
                  <th>Score / Confidence</th>
                  <th>Next Gap</th>
                </tr>
              </thead>
              <tbody>
                ${conformanceAlienRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="conformance-audio-index">
          <div class="sectionHeader">
            <h2>Audio Conformance Index</h2>
            <p>The major event-audio families, what they mean to the player, which Galaga-family references currently ground them, and where measurement still needs to improve.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Cue Family</th>
                  <th>Gameplay Meaning</th>
                  <th>Human Review</th>
                  <th>Reference</th>
                  <th>Score / Confidence</th>
                  <th>Next Gap</th>
                </tr>
              </thead>
              <tbody>
                ${conformanceAudioRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="stage-conformance-summary">
          <div class="sectionHeader">
            <h2>Stage Conformance Summary</h2>
            <p>Stage-by-stage and stage-band summary of difficulty, maneuvers, trajectory identity, gameplay description, current evidence, and the main conformance gap.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Stage / Band</th>
                  <th>Gameplay Summary</th>
                  <th>Key Aspects</th>
                  <th>Evidence</th>
                  <th>Gap</th>
                </tr>
              </thead>
              <tbody>
                ${stageConformanceRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="level-visual-conformance-index">
          <div class="sectionHeader">
            <h2>Level Visual Conformance Index</h2>
            <p>Ordered current-versus-target visual evidence for every Aurora level and each Challenging Stage. Each row keeps the current runtime screenshot beside an actual Galaga gameplay target frame, then expands into scene roles, bitmap pairs, conformance metrics, and the next gap.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current read:</strong> ${esc(levelVisualSummary.rowCount || 0)} ordered rows; ${esc(levelVisualSummary.regularLevelCount || 0)} regular levels; ${esc(levelVisualSummary.challengeStageCount || 0)} challenging stages; ${esc(levelVisualSummary.currentScreenshotCount || 0)} Aurora screenshots; ${esc(levelVisualSummary.targetScreenshotCount || 0)} target gameplay screenshots; ${esc(levelVisualSummary.currentVideoCount || 0)} Aurora 10s clips; ${esc(levelVisualSummary.targetVideoCount || 0)} target 10s clips.</p>
            <p><strong>Conformance pressure:</strong> ${esc(levelVisualSummary.challengeScore10 ?? 'n/a')}/10 challenge visual conformance and ${esc(levelVisualSummary.targetGroundingScore10 ?? 'n/a')}/10 target grounding. ${esc(levelVisualSummary.read || 'Run the level visual index analyzer to refresh this readout.')}</p>
            <p class="docMeta"><strong>Target-grounding caveat:</strong> ${esc(levelVisualSummary.exactTargetRows || 0)}/${esc(levelVisualSummary.rowCount || 0)} rows currently use exact ingested target windows. ${esc(levelVisualSummary.representativeTargetRows || 0)} regular-level rows use representative actual Galaga gameplay frames until the normal-stage corpus is extended. That means the section is excellent for seeing the shape of the gap, but it is not yet a complete per-level proof of conformance.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/level-visual-conformance-index/latest.json</code>. <strong>Report:</strong> <code>LEVEL_VISUAL_CONFORMANCE_INDEX.md</code>.</p>
          </div>
          <div class="levelVisualList">
            ${levelVisualRows}
          </div>
        </section>

        <section class="section" id="challenge-stage-conformance">
          <div class="sectionHeader">
            <h2>Challenge Stage Deep Dive</h2>
            <p>A deliberately critical stage-by-stage comparison of Aurora challenging stages against Galaga-style bonus-stage behavior. This separates rule conformance from interesting visual conformance: no enemy shooting and no ship loss are necessary, but the higher-value gap is authored alien movement, alien-family variation, and learnable set-piece novelty.</p>
          </div>
          <div class="docWrap">
            <p><strong>Current strict read:</strong> ${esc(challengeSummary.interestingFactorScore10 || 'n/a')}/10 interesting factor; ${esc(challengeSummary.movementConformanceScore10 || 'n/a')}/10 movement; ${esc(challengeSummary.graphicalConformanceScore10 || 'n/a')}/10 graphics; ${esc(challengeSummary.alienNoveltyScore10 || 'n/a')}/10 alien novelty; ${esc(challengeSummary.playerShotOpportunityScore10 || 'n/a')}/10 shot opportunity; ${esc(challengeSummary.score10 || 'n/a')}/10 challenge-stage conformance.</p>
            <p>${esc(challengeSummary.weakestFinding || 'Run the challenge-stage conformance analyzer to refresh this readout.')}</p>
            <p class="docMeta"><strong>Scoring model:</strong> ${esc(challengeSummary.scoringModel || 'strict-v2')}. Each challenge starts at 1/10 for interest, movement, and graphics; no-shot/no-kill safety is a required guardrail, not a score booster. Legacy broad coverage is diagnostic only.</p>
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/challenge-stage-conformance/latest.json</code>. <strong>Report:</strong> <code>CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md</code>.</p>
            <p class="docMeta"><strong>Naming rule:</strong> normal Levels and Challenging Stages are separate. The challenge rows below use labels like <strong>Challenging Stage 1 (Levels 3-4)</strong> instead of calling that set piece Level 4.</p>
            <p class="docMeta"><strong>Evidence-image rule:</strong> contact sheets are supporting artifacts for visual inspection, not the main human-readable conformance explanation. Use each row's target/current/conformance text for the judgment; open the evidence panel only when you need to inspect the underlying frames at native scale.</p>
            <div class="inlineDocShelf">
              <details class="inlineDocPreview">
                <summary>Peek at the living effort summary</summary>
                <div class="inlineDocPreviewBody">
                  <p>${esc(challengeSummary.playerMeaning || 'Challenge stages should be safe but tense score exhibitions with memorable entry routes and alien novelty.')}</p>
                  <p><a class="button" href="project-guide.html#challenge-stage-conformance-effort">Open full effort summary</a></p>
                </div>
              </details>
              <details class="inlineDocPreview">
                <summary>Peek at related report and measurements</summary>
                <div class="inlineDocPreviewBody">
                  <p>${esc(challengeSummary.designerMeaning || 'Design work should move from broad path-family labels to explicit per-challenge contracts.')}</p>
                  <p><strong>Improvement plan:</strong></p>
                  ${challengeList(challengeStageConformance.improvementPlan || [])}
                  <p><a class="button" href="project-guide.html#challenge-stage-conformance-analysis-doc">Open rendered effort report</a></p>
                </div>
              </details>
            </div>
          </div>
          <div class="challengeStageList">
            ${challengeStageRows}
          </div>
        </section>

        <section class="section" id="persona-catalog">
          <div class="sectionHeader">
            <h2>Testing Personas</h2>
            <p>The platform-level persona vocabulary as applied to Aurora. Platinum owns the generic persona IDs, aliases, seeded execution, and comparison substrate; Aurora owns which scenarios matter and what each persona should prove for this game.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Testing Role</th>
                  <th>Expected Behavior</th>
                  <th>Game-Specific Checks</th>
                </tr>
              </thead>
              <tbody>
                ${personaRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="persona-performance-distribution">
          <div class="sectionHeader">
            <h2>Persona Performance Distribution</h2>
            <p>Repeated seeded full-run gameplay for the generic Platinum personas. This measures score, stage depth, time alive, losses, and challenge performance as a distribution rather than treating one seeded route as the whole truth.</p>
          </div>
          <div class="distributionChartWrap">
            ${personaPerformanceChartHtml(personaDistribution)}
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Runs</th>
                  <th>Score</th>
                  <th>Stage Reached</th>
                  <th>Time Alive</th>
                  <th>Score / Min</th>
                  <th>Ship Losses</th>
                  <th>Challenge Hit Rate</th>
                </tr>
              </thead>
              <tbody>
                ${personaDistributionRows}
              </tbody>
            </table>
          </div>
          <div class="docWrap personaReadout">
            <p class="docMeta"><strong>Source artifact:</strong> <code>reference-artifacts/analyses/persona-performance-distribution/latest.json</code>. Raw run directories stay in <code>harness-artifacts/</code>; the published docs use the promoted summary and chart.</p>
            <p class="docMeta"><strong>Measurement limits:</strong> Seeded persona runs are not human playtest proof. They are repeatable skill-profile probes that help us find unfairness, progression order breaks, and whether higher-skill play actually unlocks more of the game.</p>
            ${personaFindingRows ? `<ul class="bulletList">${personaFindingRows}</ul>` : '<p class="docMeta"><strong>Findings:</strong> no current distribution findings.</p>'}
          </div>
        </section>

        <section class="section" id="graphics-controls">
          <div class="sectionHeader">
            <h2>Developer Presentation Controls</h2>
            <p>The current developer-facing audio and graphics controls that let us tune and compare Aurora presentation while keeping the application-owned theme model explicit.</p>
          </div>
          <div class="tableWrap">
            <table class="dataTable">
              <thead>
                <tr>
                  <th>Control</th>
                  <th>Values</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                ${controlRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" id="guide-links">
          <div class="sectionHeader">
            <h2>Related Guides</h2>
            <p>Cross-links to the rest of the generated documentation and the maintained reference baseline.</p>
          </div>
          <div class="linkGrid">
            ${linkCards}
          </div>
        </section>
      </div>
      <aside class="toc">
        <h2>Application Index</h2>
        <p>This page is generated during the normal build so the Aurora application guide stays aligned with the current lane build and the maintained application documentation manifest.</p>
        <ul>
          ${toc}
        </ul>
        <p class="footer">
          Latest release note: <strong>${esc(latestNote.title)}</strong><br>
          Release ${esc(displayBuildVersion(buildInfo))} · Updated ${esc(publicDateLong(buildInfo))}
        </p>
      </aside>
    </main>
    <iframe id="audioPreviewFrame" class="previewFrame" title="Aurora audio preview frame" src="index.html?docsPreview=1"></iframe>
    <script id="applicationGuideData" type="application/json">${guideDataJson}</script>
    <script>
      (function(){
        const data = JSON.parse(document.getElementById('applicationGuideData').textContent || '{}');
        const frame = document.getElementById('audioPreviewFrame');
        const status = document.getElementById('audioPreviewStatus');
        let ready = false;
        let pendingTimers = [];
        let referenceAudio = null;
        function setStatus(text, isError){
          status.textContent = text;
          status.classList.toggle('error', !!isError);
        }
        function clearQueue(){
          pendingTimers.forEach(id => clearTimeout(id));
          pendingTimers = [];
          if(referenceAudio){
            referenceAudio.pause();
            referenceAudio.currentTime = 0;
          }
        }
        function previewApi(){
          const win = frame && frame.contentWindow;
          return win && win.__auroraDocsPreview ? win.__auroraDocsPreview : null;
        }
        function payloadForTheme(entry, themeKey){
          const payload = Object.assign({}, entry.preview || {});
          if(themeKey === 'galaga') payload.audioTheme = 'galaga-original-reference';
          if(themeKey === 'galaga-assets') payload.audioTheme = 'galaga-reference-assets';
          return payload;
        }
        function playEntry(entry, themeKey){
          const api = previewApi();
          if(!api || typeof api.playCue !== 'function'){
            setStatus('Preview frame is not ready yet. Let the page finish loading and try again.', true);
            return false;
          }
          api.playCue(payloadForTheme(entry, themeKey));
          return true;
        }
        function playReferenceClip(item){
          if(!item || !item.referenceClip){
            setStatus('No reference clip is configured for this comparison yet.', true);
            return false;
          }
          try{
            if(!referenceAudio) referenceAudio = new Audio();
            referenceAudio.pause();
            referenceAudio.src = item.referenceClip;
            referenceAudio.currentTime = 0;
            referenceAudio.play();
            return true;
          }catch(err){
            setStatus('Reference clip failed: ' + (err && err.message ? err.message : String(err)), true);
            return false;
          }
        }
        function playCompareEntry(entry){
          clearQueue();
          if(!playEntry(entry, 'aurora')) return;
          pendingTimers.push(setTimeout(function(){ playEntry(entry, 'galaga'); }, 1100));
          setStatus('Playing Aurora then Galaga for ' + (entry.label || entry.cue || 'comparison') + '.');
        }
        function playTripleCompare(entry, item){
          clearQueue();
          if(!playEntry(entry, 'aurora')) return;
          pendingTimers.push(setTimeout(function(){ playEntry(entry, 'galaga'); }, 1100));
          pendingTimers.push(setTimeout(function(){ playReferenceClip(item); }, 2200));
          setStatus('Playing Aurora, then Galaga, then the labeled reference clip for ' + (entry.label || entry.cue || 'comparison') + '.');
        }
        const entryById = new Map((data.audioContexts || []).map(entry => [entry.id, entry]));
        function playSet(mode){
          const api = previewApi();
          if(!api || typeof api.playCue !== 'function'){
            setStatus('Preview frame is not ready yet. Let the page finish loading and try again.', true);
            return;
          }
          const setEntries = (data.comparisonSets || []).map(item => ({ item, entry: entryById.get(item.entryId) })).filter(row => row.entry);
          clearQueue();
          if(!setEntries.length){
            setStatus('No comparison set entries are configured yet.', true);
            return;
          }
          let delay = 0;
          const gap = 1250;
          setEntries.forEach(function(row){
            const entry = row.entry;
            const item = row.item;
            if(mode === 'ab'){
              pendingTimers.push(setTimeout(function(){ playEntry(entry, 'aurora'); }, delay));
              delay += gap;
              pendingTimers.push(setTimeout(function(){ playEntry(entry, 'galaga'); }, delay));
              delay += gap;
            }else if(mode === 'reference'){
              pendingTimers.push(setTimeout(function(){ playReferenceClip(item); }, delay));
              delay += gap + 250;
            }else if(mode === 'triple'){
              pendingTimers.push(setTimeout(function(){ playEntry(entry, 'aurora'); }, delay));
              delay += gap;
              pendingTimers.push(setTimeout(function(){ playEntry(entry, 'galaga'); }, delay));
              delay += gap;
              pendingTimers.push(setTimeout(function(){ playReferenceClip(item); }, delay));
              delay += gap + 250;
            }else{
              pendingTimers.push(setTimeout(function(){ playEntry(entry, mode); }, delay));
              delay += gap;
            }
          });
          setStatus(
            mode === 'ab'
              ? 'Playing full Aurora vs Galaga comparison set.'
              : mode === 'reference'
                ? 'Playing full labeled reference clip set.'
                : mode === 'triple'
                  ? 'Playing Aurora, Galaga, and labeled reference clips for the full set.'
                  : 'Playing ' + (mode === 'aurora' ? 'Aurora' : mode === 'galaga-assets' ? 'Galaga runtime reference' : 'Galaga synth') + ' comparison set.'
          );
        }
        function markReady(){
          ready = !!previewApi();
          if(ready) setStatus('Preview frame ready. Sound buttons will play Aurora cues through the current lane build.');
          else setStatus('Preview frame loaded, but the audio preview bridge is not ready yet.', true);
        }
        frame.addEventListener('load', markReady);
        window.addEventListener('load', function(){ setTimeout(markReady, 300); });
        document.addEventListener('click', function(event){
          const button = event.target.closest('[data-audio-index]');
          if(button){
            const index = Number(button.getAttribute('data-audio-index'));
            const entry = (data.audioContexts || [])[index];
            if(!entry) return;
            if(!playEntry(entry, 'aurora')){
              return;
            }
            setStatus('Played ' + (entry.label || entry.cue || 'preview') + ' from the Aurora application guide.');
            return;
          }
          const compareButton = event.target.closest('[data-compare-entry-id]');
          if(compareButton){
            const entryId = compareButton.getAttribute('data-compare-entry-id');
            const mode = compareButton.getAttribute('data-theme-play');
            const entry = (data.audioContexts || []).find(item => item.id === entryId);
            const item = (data.comparisonSets || []).find(row => row.entryId === entryId);
            if(!entry) return;
            if(mode === 'ab'){
              playCompareEntry(entry);
              return;
            }
            if(mode === 'triple'){
              playTripleCompare(entry, item);
              return;
            }
            if(mode === 'reference'){
              if(playReferenceClip(item)){
                setStatus('Played labeled reference clip for ' + (item?.label || entry.label || entry.cue || 'comparison') + '.');
              }
              return;
            }
            const playMode = mode === 'galaga'
              ? 'galaga'
              : mode === 'galaga-assets'
                ? 'galaga-assets'
                : 'aurora';
            if(!playEntry(entry, playMode)){
              return;
            }
            setStatus('Played ' + (playMode === 'galaga' ? 'Galaga' : playMode === 'galaga-assets' ? 'Galaga runtime reference' : 'Aurora') + ' version of ' + (entry.label || entry.cue || 'comparison') + '.');
            return;
          }
          const compareSetButton = event.target.closest('[data-compare-set]');
          if(compareSetButton){
            const mode = compareSetButton.getAttribute('data-compare-set');
            playSet(
              mode === 'galaga' ? 'galaga'
              : mode === 'galaga-assets' ? 'galaga-assets'
              : mode === 'ab' ? 'ab'
              : mode === 'reference' ? 'reference'
              : mode === 'triple' ? 'triple'
              : 'aurora'
            );
            return;
          }
          const eventButton = event.target.closest('[data-event-entry-id], [data-event-reference]');
          if(eventButton){
            const entryId = eventButton.getAttribute('data-event-entry-id');
            const mode = eventButton.getAttribute('data-event-mode') || 'current';
            const refClip = eventButton.getAttribute('data-event-reference');
            const label = eventButton.getAttribute('data-event-label') || entryId || 'event';
            const entry = entryId ? entryById.get(entryId) : null;
            if(mode === 'compare'){
              if(!entry || !refClip){
                setStatus('This event does not have both a runtime cue and a reference clip yet.', true);
                return;
              }
              clearQueue();
              if(!playEntry(entry, 'galaga-assets')) return;
              pendingTimers.push(setTimeout(function(){ playReferenceClip({ referenceClip: refClip }); }, 1500));
              setStatus('Playing runtime reference cue and then the raw reference clip for ' + label + '.');
              return;
            }
            if(mode === 'aurora'){
              if(!entry || !playEntry(entry, 'aurora')) return;
              setStatus('Played Aurora cue for ' + label + '.');
              return;
            }
            if(mode === 'current'){
              if(!entry || !playEntry(entry, 'galaga-assets')) return;
              setStatus('Played current runtime reference cue for ' + label + '.');
              return;
            }
            if(refClip){
              if(playReferenceClip({ referenceClip: refClip })){
                setStatus('Played reference clip for ' + label + '.');
              }
              return;
            }
          }
        });
      })();
    </script>
  `.trim();
  return template
    .replace('{{APPLICATION_GUIDE_STYLES}}', `${projectGuideStyles()}\n${applicationGuideStyles()}`)
    .replace('{{APPLICATION_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function buildPlatinumGuide(buildInfo, latestNote, guide){
  const template = read(PLATINUM_GUIDE_TEMPLATE);
  const orderedSections = [...(guide.sections || []), ...(guide.sourceDocs || [])];
  const toc = orderedSections.map(section => `
    <li><a href="#${esc(section.id)}">${esc(section.title)}</a></li>
  `).join('\n');
  const sections = (guide.sections || []).map(renderGuideSection).join('\n');
  const sourceDocs = (guide.sourceDocs || []).map(renderSourceDocSection).join('\n');
  const body = `
    <main class="shell">
      <div class="main">
        <section class="hero">
          <div class="heroTop">
            <span class="eyebrow">Platinum Guide</span>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/">Production Build</a>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/dev/">Hosted Dev</a>
          </div>
          <h1>${esc(guide.title || 'Platinum Guide')}</h1>
          <p>${esc(guide.strapline || '')}</p>
          <div class="goal"><strong>Guide focus:</strong> ${esc(guide.currentGoal || '')}</div>
          <div class="meta">
            <div class="metaCard">
              <span class="metaLabel">Current Release</span>
              <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Lane</span>
              <span class="metaValue">${esc(buildInfo.releaseChannel)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Updated</span>
              <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Latest Note</span>
              <span class="metaValue">${esc(latestNote.title)}</span>
            </div>
          </div>
          <div class="heroLinks">
            <a class="button" href="index.html">Open current lane build</a>
            <a class="button" href="project-guide.html">Open project guide</a>
            <a class="button" href="white-paper.html">Open white paper</a>
            <a class="button" href="application-guide.html">Open Aurora application guide</a>
            <a class="button" href="player-guide.html">Open player guide</a>
            <a class="button" href="release-dashboard.html">Open release dashboard</a>
            <a class="button" href="https://github.com/sgwoods/Codex-Test1">Open repository</a>
          </div>
        </section>
        ${sections}
        ${sourceDocs}
      </div>
      <aside class="toc">
        <h2>Platinum Index</h2>
        <p>This page is generated during the normal build so the hosted platform guide stays aligned with the maintained platform docs and release posture.</p>
        <ul>
          ${toc}
        </ul>
        <p class="footer">
          Latest release note: <strong>${esc(latestNote.title)}</strong><br>
          Release ${esc(displayBuildVersion(buildInfo))} · Updated ${esc(publicDateLong(buildInfo))}
        </p>
      </aside>
    </main>
  `.trim();
  return template
    .replace('{{PLATINUM_GUIDE_STYLES}}', projectGuideStyles())
    .replace('{{PLATINUM_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function buildPlayerGuide(buildInfo, latestNote, guide){
  const template = read(PLAYER_GUIDE_TEMPLATE);
  const toc = (guide.sections || []).map(section => `
    <li><a href="#${esc(section.id)}">${esc(section.title)}</a></li>
  `).join('\n');
  const sections = (guide.sections || []).map(renderGuideSection).join('\n');
  const body = `
    <main class="shell">
      <div class="main">
        <section class="hero">
          <div class="heroTop">
            <span class="eyebrow">Player Guide</span>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/">Game Home</a>
            <a class="homeLink" href="https://sgwoods.github.io/Aurora-Galactica/beta/">Beta Build</a>
          </div>
          <h1>${esc(guide.title || 'Player Guide')}</h1>
          <p>${esc(guide.strapline || '')}</p>
          <div class="goal"><strong>Guide focus:</strong> ${esc(guide.currentGoal || '')}</div>
          <div class="meta">
            <div class="metaCard">
              <span class="metaLabel">Current Release</span>
              <span class="metaValue">${esc(displayBuildVersion(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Lane</span>
              <span class="metaValue">${esc(buildInfo.releaseChannel)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Updated</span>
              <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Latest Note</span>
              <span class="metaValue">${esc(latestNote.title)}</span>
            </div>
          </div>
          <div class="heroLinks">
            <a class="button" href="https://sgwoods.github.io/Aurora-Galactica/">Play production build</a>
            <a class="button" href="https://sgwoods.github.io/Aurora-Galactica/beta/">Play beta build</a>
            <a class="button" href="project-guide.html">Open project guide</a>
            <a class="button" href="white-paper.html">Open white paper</a>
            <a class="button" href="application-guide.html">Open Aurora application guide</a>
            <a class="button" href="platinum-guide.html">Open Platinum guide</a>
            <a class="button" href="https://github.com/sgwoods/Codex-Test1/issues">Report or track issues</a>
          </div>
        </section>
        ${sections}
      </div>
      <aside class="toc">
        <h2>Player Index</h2>
        <p>This guide is generated during the normal build so the in-game manual stays aligned with the current shipped controls and UI.</p>
        <ul>
          ${toc}
        </ul>
        <p class="footer">
          Latest release note: <strong>${esc(latestNote.title)}</strong><br>
          Release ${esc(displayBuildVersion(buildInfo))} · Updated ${esc(publicDateLong(buildInfo))}
        </p>
      </aside>
    </main>
  `.trim();
  return template
    .replace('{{PLAYER_GUIDE_STYLES}}', projectGuideStyles())
    .replace('{{PLAYER_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function normalizeVersionForChannel(version, releaseChannel){
  if(releaseChannel === 'production'){
    return String(version).replace(/-(alpha|beta|rc)(\.[0-9]+)?$/, '');
  }
  return version;
}

function versionLineForChannel(version, releaseChannel, releaseManifest){
  if(releaseChannel !== 'development') return version;
  const dev = releaseManifest && releaseManifest.development && typeof releaseManifest.development === 'object'
    ? releaseManifest.development
    : {};
  return String(dev.versionLine || version).trim() || version;
}

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function lanePaths(lane){
  if(lane === 'production'){
    return {
      distDir: DIST_PRODUCTION,
      index: PRODUCTION_INDEX,
      dashboard: PRODUCTION_DASHBOARD,
      conformanceDashboard: PRODUCTION_CONFORMANCE_DASHBOARD,
      conformanceDashboardData: PRODUCTION_CONFORMANCE_DASHBOARD_DATA,
      publicProjectPage: PRODUCTION_PUBLIC_PROJECT_PAGE,
      releaseNotesPage: PRODUCTION_RELEASE_NOTES_PAGE,
      whitePaper: PRODUCTION_WHITE_PAPER,
      projectGuide: PRODUCTION_PROJECT_GUIDE,
      applicationGuide: PRODUCTION_APPLICATION_GUIDE,
      platinumGuide: PRODUCTION_PLATINUM_GUIDE,
      playerGuide: PRODUCTION_PLAYER_GUIDE,
      buildInfo: PRODUCTION_BUILD_INFO,
      releaseNotes: PRODUCTION_RELEASE_NOTES,
      screenshot: PRODUCTION_SCREENSHOT
    };
  }
  return {
    distDir: DIST_DEV,
    index: DEV_INDEX,
    dashboard: DEV_DASHBOARD,
    conformanceDashboard: DEV_CONFORMANCE_DASHBOARD,
    conformanceDashboardData: DEV_CONFORMANCE_DASHBOARD_DATA,
    publicProjectPage: DEV_PUBLIC_PROJECT_PAGE,
    releaseNotesPage: DEV_RELEASE_NOTES_PAGE,
    whitePaper: DEV_WHITE_PAPER,
    projectGuide: DEV_PROJECT_GUIDE,
    applicationGuide: DEV_APPLICATION_GUIDE,
    platinumGuide: DEV_PLATINUM_GUIDE,
    playerGuide: DEV_PLAYER_GUIDE,
    buildInfo: DEV_BUILD_INFO,
    releaseNotes: DEV_RELEASE_NOTES,
    screenshot: DEV_SCREENSHOT
  };
}

function build(options = {}){
  const buildLane = String(options.lane || 'dev').toLowerCase() === 'production' ? 'production' : 'dev';
  const out = lanePaths(buildLane);
  fs.mkdirSync(out.distDir, { recursive: true });
  const template = read(TEMPLATE);
  const styles = read(STYLES).trimEnd();
  const buildCommit = git('rev-parse HEAD', 'unknown');
  ACTIVE_SOURCE_BLOB_BASE = `https://github.com/sgwoods/Codex-Test1/blob/${buildCommit}/`;
  const buildShortCommit = git('rev-parse --short HEAD', 'unknown');
  const buildBranch = git('branch --show-current', 'detached');
  const buildRepoRef = detectRepoRef();
  const buildReleaseChannel = buildLane === 'production' ? 'production' : 'development';
  const buildVersion = normalizeVersionForChannel(pkg.version, buildReleaseChannel);
  const releaseManifest = loadReleaseManifest(buildVersion);
  const buildVersionLine = versionLineForChannel(buildVersion, buildReleaseChannel, releaseManifest);
  const buildDirtyFiles = git('status --porcelain', '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(entry => !isGeneratedBuildPath(parsePorcelainPath(entry)));
  const buildDirty = buildDirtyFiles.length > 0;
  const buildNumber = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || git('rev-list --count HEAD', '0');
  const buildLabel = `${buildVersionLine}+build.${buildNumber}.sha.${buildShortCommit}${buildDirty ? '.dirty' : ''}`;
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
  const releaseDashboard = loadReleaseDashboard();
  const conformanceDashboardSummary = loadConformanceDashboardSummary();
  const conformanceDashboardData = loadConformanceDashboardData();
  const projectGuide = loadProjectGuide();
  const whitePaperGuide = loadWhitePaperGuide();
  const applicationGuide = loadApplicationGuide();
  const platinumGuide = loadPlatinumGuide();
  const playerGuide = loadPlayerGuide();
  const latestNote = releaseNotes[0] || {
    title: 'No release notes yet',
    summary: 'This build has stamped identity, but no human-written note has been added yet.'
  };
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iddyodcknmxupavnuuwg.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_306xKY5fuS0jVwkm2bxaog_OU5uFoy7';
  const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY || '';
  const arcadeMusicPlaylistId = process.env.ARCADE_MUSIC_PLAYLIST_ID || process.env.NEXT_PUBLIC_ARCADE_MUSIC_PLAYLIST_ID || releaseManifest.platform?.media?.arcadeMusicPlaylistId || '';
  const parseListEnv = (value) => String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const testAccountEmails = Array.from(new Set([
    ...parseListEnv(process.env.TEST_ACCOUNT_EMAILS).map((email) => email.toLowerCase()),
    ...parseListEnv(process.env.TEST_ACCOUNT_EMAIL).map((email) => email.toLowerCase()),
    ...(Array.isArray(releaseManifest.platform?.auth?.nonProductionTestPilotEmails)
      ? releaseManifest.platform.auth.nonProductionTestPilotEmails.map((email) => String(email || '').trim().toLowerCase()).filter(Boolean)
      : [])
  ]));
  const testAccountUserIds = Array.from(new Set([
    ...parseListEnv(process.env.TEST_ACCOUNT_USER_IDS),
    ...parseListEnv(process.env.TEST_ACCOUNT_USER_ID),
    ...(Array.isArray(releaseManifest.platform?.auth?.nonProductionTestPilotUserIds)
      ? releaseManifest.platform.auth.nonProductionTestPilotUserIds.map((id) => String(id || '').trim()).filter(Boolean)
      : [])
  ]));
  const testAccountEmail = testAccountEmails[0] || '';
  const testAccountUserId = testAccountUserIds[0] || '';
  const tokens = {
    BUILD_VERSION: buildVersion,
    BUILD_VERSION_LINE: buildVersionLine,
    BUILD_LABEL: buildLabel,
    BUILD_CHANNEL: buildReleaseChannel,
    BUILD_COMMIT: buildCommit,
    BUILD_BRANCH: buildBranch,
    BUILD_DIRTY: buildDirty ? 'true' : 'false',
    BUILD_RELEASE_ET: buildReleaseEt,
    BUILD_STATE: buildState,
    BUILD_PRODUCT_NAME_JSON: JSON.stringify(releaseManifest.product),
    BUILD_PLATFORM_INFO_JSON: JSON.stringify(releaseManifest.platform),
    BUILD_APPLICATIONS_INFO_JSON: JSON.stringify(releaseManifest.applications),
    CONFORMANCE_DASHBOARD_SUMMARY_ENCODED: encodeURIComponent(JSON.stringify(conformanceDashboardSummary)),
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    WEB3FORMS_ACCESS_KEY: web3FormsAccessKey,
    ARCADE_MUSIC_PLAYLIST_ID_JSON: JSON.stringify(arcadeMusicPlaylistId),
    TEST_ACCOUNT_EMAIL: testAccountEmail,
    TEST_ACCOUNT_USER_ID: testAccountUserId,
    TEST_ACCOUNT_EMAILS_JSON: JSON.stringify(testAccountEmails),
    TEST_ACCOUNT_USER_IDS_JSON: JSON.stringify(testAccountUserIds),
    LATEST_RELEASE_TITLE: latestNote.title,
    LATEST_RELEASE_BODY: latestNote.summary
  };
  const vendorScript = fs.existsSync(SUPABASE_UMD)
    ? read(SUPABASE_UMD)
    : 'window.supabase = window.supabase || null;';
  const sharedReplayStore = fs.existsSync(SHARED_REPLAY_STORE)
    ? read(SHARED_REPLAY_STORE)
    : '';
  const script = fs.readdirSync(SCRIPT_DIR)
    .filter(file => file.endsWith('.js'))
    .sort()
    .map(file => `// Source: src/js/${file}\n${read(path.join(SCRIPT_DIR, file)).trimEnd()}`)
    .join('\n\n')
    .replace(/\r\n/g, '\n');
  const builtScript = fillBuildTokens(`${sharedReplayStore}\n\n${script}`, tokens)
    .trimEnd();

  const html = fillBuildTokens(template, tokens)
    .replace('{{INLINE_STYLES}}', `/* Generated from src/styles.css */\n${styles}`)
    .replace('{{INLINE_VENDOR_SCRIPT}}', `/* Generated from @supabase/supabase-js */\n${vendorScript}`)
    .replace('{{INLINE_SCRIPT}}', `// Generated from src/js/*.js\n${builtScript}`);

  const buildInfo = {
    product: releaseManifest.product,
    version: buildVersion,
    versionLine: buildVersionLine,
    versionScheme: buildVersionLine !== buildVersion ? 'hosted-dev-increment' : 'semver',
    label: buildLabel,
    buildNumber,
    commit: buildCommit,
    shortCommit: buildShortCommit,
    branch: buildBranch,
    state: buildState,
    releaseChannel: buildReleaseChannel,
    dirty: buildDirty,
    dirtyFiles: buildDirtyFiles,
    builtAtUtc: buildUtc,
    builtAtEt: buildReleaseEt,
    platform: releaseManifest.platform,
    applications: releaseManifest.applications,
    development: releaseManifest.development,
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
    latestReleaseNote: latestNote
  };

  fs.writeFileSync(out.index, html.endsWith('\n') ? html : `${html}\n`);
  fs.writeFileSync(out.dashboard, buildReleaseDashboard(buildInfo, latestNote, releaseDashboard, releaseNotes));
  fs.writeFileSync(out.conformanceDashboard, buildConformanceDashboardHtml(conformanceDashboardData, {
    title: 'Aurora Conformance Dashboard',
    subtitle: 'Read-only release view of the current conformance plan, release gates, ingestion evidence, measurement debt, and highest-value next investments.',
    gameHref: 'index.html',
    releaseHref: 'release-dashboard.html',
    markdownHref: `https://github.com/sgwoods/Codex-Test1/blob/${buildCommit}/RELEASE_CONFORMANCE_DASHBOARD.md`,
    markdownLabel: 'Markdown',
    dataHref: 'conformance-dashboard-data.json',
    releasePathLabel: buildLane === 'production' ? 'Production lane dashboard' : 'Development lane dashboard',
    releasePath: buildLane === 'production' ? '/Aurora-Galactica/conformance-dashboard.html' : '/Aurora-Galactica/dev/conformance-dashboard.html',
    releaseLane: buildReleaseChannel,
    buildLabel,
    pageBuiltAt: buildUtc,
    buildCommit,
    buildBranch,
    sourceArtifact: 'reference-artifacts/analyses/release-conformance-dashboard/latest.json',
    artifactBase: `https://github.com/sgwoods/Codex-Test1/blob/${buildCommit}/`,
    rawArtifactBase: `https://raw.githubusercontent.com/sgwoods/Codex-Test1/${buildCommit}/`
  }));
  fs.writeFileSync(out.conformanceDashboardData, JSON.stringify(conformanceDashboardData, null, 2) + '\n');
  const publicProjectPageHtml = buildPublicProjectPage(buildInfo, latestNote, releaseDashboard);
  fs.writeFileSync(out.publicProjectPage, publicProjectPageHtml);
  fs.writeFileSync(out.releaseNotesPage, buildReleaseNotesPage(buildInfo, latestNote, releaseNotes));
  fs.writeFileSync(out.whitePaper, buildWhitePaperGuide(buildInfo, latestNote, whitePaperGuide));
  if(buildLane === 'dev'){
    fs.mkdirSync(path.dirname(LOCAL_DEV_PUBLIC_PROJECT_PREVIEW), { recursive: true });
    fs.writeFileSync(LOCAL_DEV_PUBLIC_PROJECT_PREVIEW, publicProjectPageHtml);
  }
  fs.writeFileSync(out.projectGuide, buildProjectGuide(buildInfo, latestNote, projectGuide));
  fs.writeFileSync(out.applicationGuide, buildApplicationGuide(buildInfo, latestNote, applicationGuide));
  fs.writeFileSync(out.platinumGuide, buildPlatinumGuide(buildInfo, latestNote, platinumGuide));
  fs.writeFileSync(out.playerGuide, buildPlayerGuide(buildInfo, latestNote, playerGuide));
  fs.writeFileSync(out.buildInfo, JSON.stringify(buildInfo, null, 2) + '\n');
  fs.writeFileSync(out.releaseNotes, JSON.stringify({
    product: releaseManifest.product,
    platform: releaseManifest.platform,
    applications: releaseManifest.applications,
    notes: releaseNotes
  }, null, 2) + '\n');
  if(fs.existsSync(path.join(ROOT, 'export.mov.png'))){
    fs.copyFileSync(path.join(ROOT, 'export.mov.png'), out.screenshot);
  }
  const assetsOut = path.join(path.dirname(out.index), 'assets');
  const copiedAssets = copyAssetTree(ASSETS_DIR, assetsOut);
  const copiedCatalogMedia = copyCatalogMediaAssets(assetsOut);
  const assetConformanceDashboard = path.join(assetsOut, 'conformance-dashboard.html');
  const assetConformanceDashboardData = path.join(assetsOut, 'conformance-dashboard-data.json');
  fs.writeFileSync(assetConformanceDashboard, buildConformanceDashboardHtml(conformanceDashboardData, {
    title: 'Aurora Conformance Dashboard',
    subtitle: 'Read-only release view of the current conformance plan, release gates, ingestion evidence, measurement debt, and highest-value next investments.',
    gameHref: '../index.html',
    releaseHref: '../release-dashboard.html',
    markdownHref: `https://github.com/sgwoods/Codex-Test1/blob/${buildCommit}/RELEASE_CONFORMANCE_DASHBOARD.md`,
    markdownLabel: 'Markdown',
    dataHref: 'conformance-dashboard-data.json',
    releasePathLabel: buildLane === 'production' ? 'Production bundled asset dashboard' : 'Development bundled asset dashboard',
    releasePath: buildLane === 'production' ? '/Aurora-Galactica/assets/conformance-dashboard.html' : '/Aurora-Galactica/dev/assets/conformance-dashboard.html',
    releaseLane: buildReleaseChannel,
    buildLabel,
    pageBuiltAt: buildUtc,
    buildCommit,
    buildBranch,
    sourceArtifact: 'reference-artifacts/analyses/release-conformance-dashboard/latest.json',
    artifactBase: `https://github.com/sgwoods/Codex-Test1/blob/${buildCommit}/`,
    rawArtifactBase: `https://raw.githubusercontent.com/sgwoods/Codex-Test1/${buildCommit}/`
  }));
  fs.writeFileSync(assetConformanceDashboardData, JSON.stringify(conformanceDashboardData, null, 2) + '\n');
  return [
    out.index,
    out.dashboard,
    out.conformanceDashboard,
    out.conformanceDashboardData,
    out.publicProjectPage,
    out.releaseNotesPage,
    out.whitePaper,
    ...(buildLane === 'dev' ? [LOCAL_DEV_PUBLIC_PROJECT_PREVIEW] : []),
    out.projectGuide,
    out.applicationGuide,
    out.platinumGuide,
    out.playerGuide,
    out.buildInfo,
    out.releaseNotes,
    out.screenshot,
    assetConformanceDashboard,
    assetConformanceDashboardData,
    ...copiedAssets,
    ...copiedCatalogMedia
  ];
}

const args = parseArgs(process.argv.slice(2));
const outputs = build({ lane: args.lane });
for(const out of outputs)console.log(`Built ${out}`);

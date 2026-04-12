#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  ROOT,
  DIST_DEV,
  DIST_PRODUCTION,
  DEV_INDEX,
  DEV_DASHBOARD,
  DEV_PROJECT_GUIDE,
  DEV_APPLICATION_GUIDE,
  DEV_PLATINUM_GUIDE,
  DEV_PLAYER_GUIDE,
  DEV_BUILD_INFO,
  DEV_RELEASE_NOTES,
  DEV_SCREENSHOT,
  PRODUCTION_INDEX,
  PRODUCTION_DASHBOARD,
  PRODUCTION_PROJECT_GUIDE,
  PRODUCTION_APPLICATION_GUIDE,
  PRODUCTION_PLATINUM_GUIDE,
  PRODUCTION_PLAYER_GUIDE,
  PRODUCTION_BUILD_INFO,
  PRODUCTION_RELEASE_NOTES,
  PRODUCTION_SCREENSHOT
} = require('./paths');
const pkg = require(path.resolve(ROOT, 'package.json'));

const SRC = path.join(ROOT, 'src');
const SCRIPT_DIR = path.join(SRC, 'js');
const TEMPLATE = path.join(SRC, 'index.template.html');
const DASHBOARD_TEMPLATE = path.join(SRC, 'release-dashboard.template.html');
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
const PROJECT_GUIDE = path.join(ROOT, 'project-guide.json');
const APPLICATION_GUIDE = path.join(ROOT, 'application-guide.json');
const PLATINUM_GUIDE = path.join(ROOT, 'platinum-guide.json');
const PLAYER_GUIDE = path.join(ROOT, 'player-guide.json');
const GENERATED_BUILD_PATHS = new Set([
  'dist/dev/index.html',
  'dist/dev/release-dashboard.html',
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
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'player-guide.html',
  'build-info.json',
  'dev/index.html',
  'dev/release-dashboard.html',
  'dev/project-guide.html',
  'dev/application-guide.html',
  'dev/platinum-guide.html',
  'dev/player-guide.html',
  'dev/build-info.json',
  'dev/README.txt',
  'beta/index.html',
  'beta/release-dashboard.html',
  'beta/project-guide.html',
  'beta/application-guide.html',
  'beta/platinum-guide.html',
  'beta/player-guide.html',
  'beta/build-info.json',
  'beta/README.txt',
  'beta/README.md'
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
      .step{margin-left:34px}
      .timeline::before{left:12px}
      .step::before{left:-28px}
      .stepHeader{flex-direction:column}
    }
  `.trim();
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
    @media (max-width: 980px){
      .shell{grid-template-columns:1fr}
      .toc{position:static; order:-1}
    }
    @media (max-width: 720px){
      .shell{padding:20px 14px 54px}
      .hero,.section,.toc{padding:22px 20px}
      .hero p{font-size:17px}
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

function buildReleaseDashboard(buildInfo, latestNote, dashboard){
  const template = read(DASHBOARD_TEMPLATE);
  const timeline = (dashboard.timeline || []).map(step => `
    <article class="step ${esc(step.status)}">
      <div class="stepHeader">
        <h2 class="stepTitle">${esc(step.title)}</h2>
        <span class="badge">${esc(statusLabel(step.status))}</span>
      </div>
      <p>${esc(step.summary)}</p>
    </article>
  `).join('\n');
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
        <h1>Aurora Galactica</h1>
        <p>${esc(dashboard.strapline || '')}</p>
        <div class="meta">
          <div class="metaCard">
            <span class="metaLabel">Target</span>
            <span class="metaValue">${esc(dashboard.targetVersion || buildInfo.version)}</span>
          </div>
          <div class="metaCard">
            <span class="metaLabel">Current Focus</span>
            <span class="metaValue">${esc(dashboard.currentFocus || 'Release planning')}</span>
          </div>
          <div class="metaCard">
            <span class="metaLabel">Current Release</span>
            <span class="metaValue">${esc(buildInfo.version)}</span>
          </div>
          <div class="metaCard">
            <span class="metaLabel">Updated</span>
            <span class="metaValue">${esc(publicDateLong(buildInfo))}</span>
          </div>
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
          Latest release note: <strong>${esc(latestNote.title)}</strong>. Live game:
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
  let out = esc(text);
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function renderMarkdown(md=''){
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
      out.push(`<pre><code${lang ? ` data-lang="${esc(lang)}"` : ''}>${esc(block.join('\n'))}</code></pre>`);
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
    const para = [line.trim()];
    i++;
    while(i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^\s*(#{2,5})\s+/.test(lines[i]) && !/^(\s*)[-*]\s+/.test(lines[i]) && !/^(\s*)\d+\.\s+/.test(lines[i])){
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
  const body = renderMarkdown(source);
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

function buildProjectGuide(buildInfo, latestNote, guide){
  const template = read(PROJECT_GUIDE_TEMPLATE);
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
              <span class="metaValue">${esc(buildInfo.version)}</span>
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
            <a class="button" href="application-guide.html">Open Aurora application guide</a>
            <a class="button" href="platinum-guide.html">Open Platinum guide</a>
            <a class="button" href="player-guide.html">Open player guide</a>
            <a class="button" href="release-dashboard.html">Open release dashboard</a>
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
          Release ${esc(buildInfo.version)} · Updated ${esc(publicDateLong(buildInfo))}
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
              <span class="metaValue">${esc(buildInfo.version)}</span>
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
          Release ${esc(buildInfo.version)} · Updated ${esc(publicDateLong(buildInfo))}
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
            if(!playEntry(entry, mode === 'galaga' ? 'galaga' : 'aurora')){
              return;
            }
            setStatus('Played ' + (mode === 'galaga' ? 'Galaga' : 'Aurora') + ' version of ' + (entry.label || entry.cue || 'comparison') + '.');
            return;
          }
          const compareSetButton = event.target.closest('[data-compare-set]');
          if(compareSetButton){
            const mode = compareSetButton.getAttribute('data-compare-set');
            playSet(
              mode === 'galaga' ? 'galaga'
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
              <span class="metaValue">${esc(buildInfo.version)}</span>
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
          Release ${esc(buildInfo.version)} · Updated ${esc(publicDateLong(buildInfo))}
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
              <span class="metaValue">${esc(buildInfo.version)}</span>
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
          Release ${esc(buildInfo.version)} · Updated ${esc(publicDateLong(buildInfo))}
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
  const buildShortCommit = git('rev-parse --short HEAD', 'unknown');
  const buildBranch = git('branch --show-current', 'detached');
  const buildRepoRef = detectRepoRef();
  const buildReleaseChannel = buildLane === 'production' ? 'production' : 'development';
  const buildVersion = normalizeVersionForChannel(pkg.version, buildReleaseChannel);
  const buildDirtyFiles = git('status --porcelain', '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(entry => !isGeneratedBuildPath(parsePorcelainPath(entry)));
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
  const releaseDashboard = loadReleaseDashboard();
  const projectGuide = loadProjectGuide();
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
  const parseListEnv = (value) => String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const testAccountEmails = Array.from(new Set([
    ...parseListEnv(process.env.TEST_ACCOUNT_EMAILS).map((email) => email.toLowerCase()),
    ...parseListEnv(process.env.TEST_ACCOUNT_EMAIL).map((email) => email.toLowerCase())
  ]));
  const testAccountUserIds = Array.from(new Set([
    ...parseListEnv(process.env.TEST_ACCOUNT_USER_IDS),
    ...parseListEnv(process.env.TEST_ACCOUNT_USER_ID)
  ]));
  const testAccountEmail = testAccountEmails[0] || '';
  const testAccountUserId = testAccountUserIds[0] || '';
  const tokens = {
    BUILD_VERSION: buildVersion,
    BUILD_LABEL: buildLabel,
    BUILD_CHANNEL: buildReleaseChannel,
    BUILD_COMMIT: buildCommit,
    BUILD_BRANCH: buildBranch,
    BUILD_DIRTY: buildDirty ? 'true' : 'false',
    BUILD_RELEASE_ET: buildReleaseEt,
    BUILD_STATE: buildState,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    WEB3FORMS_ACCESS_KEY: web3FormsAccessKey,
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
    version: buildVersion,
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
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
    latestReleaseNote: latestNote
  };

  fs.writeFileSync(out.index, html.endsWith('\n') ? html : `${html}\n`);
  fs.writeFileSync(out.dashboard, buildReleaseDashboard(buildInfo, latestNote, releaseDashboard));
  fs.writeFileSync(out.projectGuide, buildProjectGuide(buildInfo, latestNote, projectGuide));
  fs.writeFileSync(out.applicationGuide, buildApplicationGuide(buildInfo, latestNote, applicationGuide));
  fs.writeFileSync(out.platinumGuide, buildPlatinumGuide(buildInfo, latestNote, platinumGuide));
  fs.writeFileSync(out.playerGuide, buildPlayerGuide(buildInfo, latestNote, playerGuide));
  fs.writeFileSync(out.buildInfo, JSON.stringify(buildInfo, null, 2) + '\n');
  fs.writeFileSync(out.releaseNotes, JSON.stringify({ notes: releaseNotes }, null, 2) + '\n');
  if(fs.existsSync(path.join(ROOT, 'export.mov.png'))){
    fs.copyFileSync(path.join(ROOT, 'export.mov.png'), out.screenshot);
  }
  const copiedAssets = copyAssetTree(ASSETS_DIR, path.join(path.dirname(out.index), 'assets'));
  return [
    out.index,
    out.dashboard,
    out.projectGuide,
    out.applicationGuide,
    out.platinumGuide,
    out.playerGuide,
    out.buildInfo,
    out.releaseNotes,
    out.screenshot,
    ...copiedAssets
  ];
}

const args = parseArgs(process.argv.slice(2));
const outputs = build({ lane: args.lane });
for(const out of outputs)console.log(`Built ${out}`);

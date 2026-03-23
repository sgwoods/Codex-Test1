#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'));

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const SCRIPT_DIR = path.join(SRC, 'js');
const TEMPLATE = path.join(SRC, 'index.template.html');
const DASHBOARD_TEMPLATE = path.join(SRC, 'release-dashboard.template.html');
const PROJECT_GUIDE_TEMPLATE = path.join(SRC, 'project-guide.template.html');
const STYLES = path.join(SRC, 'styles.css');
const SUPABASE_UMD = path.join(ROOT, 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js');
const RELEASE_NOTES = path.join(ROOT, 'release-notes.json');
const RELEASE_DASHBOARD = path.join(ROOT, 'release-dashboard.json');
const PROJECT_GUIDE = path.join(ROOT, 'project-guide.json');
const OUT = path.join(ROOT, 'index.html');
const DASHBOARD_OUT = path.join(ROOT, 'release-dashboard.html');
const PROJECT_GUIDE_OUT = path.join(ROOT, 'project-guide.html');
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

function loadProjectGuide(){
  try{
    const raw = JSON.parse(read(PROJECT_GUIDE));
    return {
      title: raw.title || 'Project Guide',
      strapline: raw.strapline || '',
      currentGoal: raw.currentGoal || '',
      sections: Array.isArray(raw.sections) ? raw.sections : [],
      sourceDocs: Array.isArray(raw.sourceDocs) ? raw.sourceDocs : []
    };
  }catch{
    return {
      title: 'Project Guide Unavailable',
      strapline: 'Add project-guide.json to restore the generated documentation guide.',
      currentGoal: '',
      sections: [],
      sourceDocs: []
    };
  }
}

function git(args, fallback = ''){
  try{
    return execSync(`git -C "${ROOT}" ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
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
            <span class="metaLabel">Current Build</span>
            <span class="metaValue">${esc(buildInfo.label)}</span>
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
              <span class="metaLabel">Current Build</span>
              <span class="metaValue">${esc(buildInfo.label)}</span>
            </div>
            <div class="metaCard">
              <span class="metaLabel">Release Line</span>
              <span class="metaValue">${esc(buildInfo.version)}</span>
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
            <a class="button" href="https://sgwoods.github.io/Aurora-Galactica/">Open production build</a>
            <a class="button" href="https://sgwoods.github.io/Aurora-Galactica/beta/">Open beta build</a>
            <a class="button" href="https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html">Open release dashboard</a>
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
          Build: ${esc(buildInfo.label)}
        </p>
      </aside>
    </main>
  `.trim();
  return template
    .replace('{{PROJECT_GUIDE_STYLES}}', projectGuideStyles())
    .replace('{{PROJECT_GUIDE_BODY}}', body)
    .trimEnd() + '\n';
}

function normalizeVersionForChannel(version, releaseChannel){
  if(releaseChannel === 'production'){
    return String(version).replace(/-(alpha|beta|rc)(\.[0-9]+)?$/, '');
  }
  return version;
}

function build(){
  const template = read(TEMPLATE);
  const styles = read(STYLES).trimEnd();
  const buildCommit = git('rev-parse HEAD', 'unknown');
  const buildShortCommit = git('rev-parse --short HEAD', 'unknown');
  const buildBranch = git('branch --show-current', 'detached');
  const buildRepoRef = detectRepoRef();
  const buildReleaseChannel = detectReleaseChannel(buildRepoRef);
  const buildVersion = normalizeVersionForChannel(pkg.version, buildReleaseChannel);
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
  const releaseDashboard = loadReleaseDashboard();
  const projectGuide = loadProjectGuide();
  const latestNote = releaseNotes[0] || {
    title: 'No release notes yet',
    summary: 'This build has stamped identity, but no human-written note has been added yet.'
  };
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iddyodcknmxupavnuuwg.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_306xKY5fuS0jVwkm2bxaog_OU5uFoy7';
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
    LATEST_RELEASE_TITLE: latestNote.title,
    LATEST_RELEASE_BODY: latestNote.summary
  };
  const vendorScript = fs.existsSync(SUPABASE_UMD)
    ? read(SUPABASE_UMD)
    : 'window.supabase = window.supabase || null;';
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

  fs.writeFileSync(OUT, html.endsWith('\n') ? html : `${html}\n`);
  fs.writeFileSync(DASHBOARD_OUT, buildReleaseDashboard(buildInfo, latestNote, releaseDashboard));
  fs.writeFileSync(PROJECT_GUIDE_OUT, buildProjectGuide(buildInfo, latestNote, projectGuide));
  fs.writeFileSync(BUILD_INFO_OUT, JSON.stringify(buildInfo, null, 2) + '\n');
  return [OUT, DASHBOARD_OUT, PROJECT_GUIDE_OUT, BUILD_INFO_OUT];
}

const outputs = build();
for(const out of outputs)console.log(`Built ${out}`);

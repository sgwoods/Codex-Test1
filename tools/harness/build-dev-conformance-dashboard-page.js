#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_DATA = path.join(ROOT, 'reference-artifacts', 'analyses', 'release-conformance-dashboard', 'latest.json');
const LOCAL_DEV = path.join(ROOT, 'local-dev');
const OUT_HTML = [
  path.join(LOCAL_DEV, 'conformance-dashboard.html')
];
const OUT_DATA = [
  path.join(LOCAL_DEV, 'conformance-dashboard-data.json')
];

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function escScriptJson(value){
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[char]));
}

function normalizeArtifactBase(value){
  const text = String(value || '').trim();
  if(!text) return '../';
  return text.endsWith('/') ? text : `${text}/`;
}

function html(data, options = {}){
  const title = options.title || 'Aurora Conformance Dashboard';
  const subtitle = options.subtitle || 'Internal localhost view of the current conformance plan, release gates, measurement debt, and highest-value next investments. This page reads generated artifacts and refreshes without exposing anything publicly.';
  const gameHref = options.gameHref || 'http://127.0.0.1:8000/';
  const releaseHref = options.releaseHref || 'http://127.0.0.1:8000/release-dashboard.html';
  const markdownHref = options.markdownHref || '/RELEASE_CONFORMANCE_DASHBOARD.md';
  const markdownLabel = options.markdownLabel || 'Markdown';
  const dataHref = options.dataHref || 'conformance-dashboard-data.json';
  const artifactBase = normalizeArtifactBase(options.artifactBase || '../');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root{
      color-scheme:light;
      --page:#f5f3ee;
      --ink:#191714;
      --muted:#69645d;
      --panel:#ffffff;
      --line:#d8d2c7;
      --rail:#24221f;
      --green:#16784f;
      --yellow:#9c6f0a;
      --red:#b03a2e;
      --blue:#285e8e;
      --shadow:0 16px 36px rgba(27,24,19,.10);
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      background:var(--page);
      color:var(--ink);
      font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size:15px;
      line-height:1.45;
    }
    a{color:var(--blue)}
    .shell{max-width:1440px;margin:0 auto;padding:24px}
    header{
      display:grid;
      grid-template-columns:minmax(0,1fr) auto;
      gap:18px;
      align-items:end;
      padding:22px 0 18px;
      border-bottom:3px solid var(--rail);
    }
    h1{margin:0;font-size:32px;line-height:1.05;letter-spacing:0}
    .subtitle{margin:8px 0 0;color:var(--muted);max-width:920px}
    .controls{display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap}
    .gameSelectGroup{
      display:grid;
      gap:3px;
      color:var(--muted);
      font-size:10px;
      text-transform:uppercase;
      font-weight:850;
      letter-spacing:.08em;
    }
    .gameSelectGroup select{
      min-width:220px;
      border:1px solid var(--line);
      background:var(--panel);
      color:var(--ink);
      border-radius:6px;
      padding:8px 10px;
      font-size:13px;
      font-weight:800;
      text-transform:none;
      letter-spacing:0;
    }
    .pill,.button{
      border:1px solid var(--line);
      background:var(--panel);
      color:var(--ink);
      border-radius:6px;
      padding:8px 10px;
      text-decoration:none;
      font-weight:700;
      font-size:13px;
      white-space:nowrap;
    }
    .pill{cursor:pointer}
    .pill:disabled{cursor:wait;opacity:.75}
    .button{box-shadow:0 2px 0 rgba(0,0,0,.12)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin:18px 0}
    .tabs{
      display:flex;
      gap:8px;
      margin:4px 0 16px;
      border-bottom:1px solid var(--line);
    }
    .tab{
      border:1px solid var(--line);
      border-bottom:0;
      background:#ede8df;
      color:var(--ink);
      border-radius:7px 7px 0 0;
      padding:9px 13px;
      font-weight:850;
      cursor:pointer;
    }
    .tab.active{
      background:var(--panel);
      box-shadow:0 -1px 0 var(--panel) inset;
    }
    .card{
      background:var(--panel);
      border:1px solid var(--line);
      border-radius:8px;
      padding:14px;
      box-shadow:var(--shadow);
      min-width:0;
    }
    .label{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:800;letter-spacing:.08em;margin-bottom:5px}
    .value{font-size:22px;font-weight:850;letter-spacing:0}
    .split{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;align-items:start}
    section{margin-top:14px}
    h2{margin:0 0 10px;font-size:18px;letter-spacing:0}
    table{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:8px;overflow:hidden;box-shadow:var(--shadow)}
    th,td{padding:10px 11px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}
    th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#4e4a43;background:#ece6db}
    tr:last-child td{border-bottom:0}
    .priority{font-weight:850;text-align:center;width:56px}
    .metric{font-weight:800;min-width:230px}
    .metricDetails summary{
      cursor:pointer;
      list-style-position:outside;
      padding:0 0 0 2px;
    }
    .metricDetails summary span{
      display:inline;
      text-decoration:underline;
      text-decoration-style:dotted;
      text-underline-offset:3px;
    }
    .metricExplanation{
      display:grid;
      grid-template-columns:repeat(3,minmax(170px,1fr));
      gap:10px;
      margin-top:10px;
      padding:10px;
      border:1px solid var(--line);
      border-radius:7px;
      background:#fbfaf7;
      font-weight:500;
    }
    .metricExplanationHeader{
      grid-column:1/-1;
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      padding-bottom:8px;
      border-bottom:1px solid var(--line);
    }
    .metricExplanationTitle{font-weight:850}
    .closeDetails{
      border:1px solid var(--line);
      background:var(--panel);
      border-radius:6px;
      padding:4px 8px;
      font-size:12px;
      font-weight:850;
      cursor:pointer;
      white-space:nowrap;
    }
    .explainBlock{
      min-width:0;
      padding:8px;
      border:1px solid #ebe5da;
      border-radius:6px;
      background:#fffefa;
      font-size:13px;
      line-height:1.35;
    }
    .explainLabel{
      display:block;
      color:var(--muted);
      font-size:10px;
      text-transform:uppercase;
      font-weight:850;
      letter-spacing:.08em;
      margin-bottom:2px;
    }
    .badge{
      display:inline-block;
      border:1px solid var(--line);
      border-radius:999px;
      padding:3px 7px;
      background:#fbfaf7;
      font-size:12px;
      font-weight:800;
      color:#4e4a43;
      white-space:nowrap;
    }
    .score{font-weight:850;white-space:nowrap}
    .costCell{min-width:150px}
    .good{color:var(--green)} .watch{color:var(--yellow)} .gap{color:var(--red)}
    .small{font-size:13px;color:var(--muted)}
    .axisList{display:grid;gap:8px;margin:0;padding:0;list-style:none}
    .axisList li{padding:10px;border:1px solid var(--line);border-radius:7px;background:#fbfaf7}
    .evidence{display:grid;gap:8px}
    .evidence a{word-break:break-word}
    .ingestionGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
    .ingestionLead{max-width:980px;margin:0 0 14px;color:var(--muted)}
    .anchorCell{max-width:260px;word-break:break-word}
    .statusLine{margin-top:10px;color:var(--muted);font-size:13px}
    .dirty{color:var(--red)}
    .clean{color:var(--green)}
    @media (max-width:980px){
      header{grid-template-columns:1fr}
      .controls{justify-content:flex-start}
      .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .ingestionGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .split{grid-template-columns:1fr}
    }
    @media (max-width:640px){
      .shell{padding:16px}
      .grid{grid-template-columns:1fr}
      .ingestionGrid{grid-template-columns:1fr}
      table{display:block;overflow-x:auto}
      .metricExplanation{grid-template-columns:1fr}
      h1{font-size:26px}
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(subtitle)}</p>
      </div>
      <nav class="controls" aria-label="Dashboard links">
        <label class="gameSelectGroup" for="gameSelector">Game
          <select id="gameSelector" aria-label="Select game conformance profile"></select>
        </label>
        <button class="pill" id="refreshState" type="button" aria-label="Refresh conformance dashboard data now">loading</button>
        <a class="button" href="${escapeHtml(gameHref)}">Game</a>
        <a class="button" href="${escapeHtml(releaseHref)}">Release</a>
        <a class="button" href="${escapeHtml(markdownHref)}">${escapeHtml(markdownLabel)}</a>
      </nav>
    </header>
    <main id="app"></main>
    <p class="statusLine" id="statusLine"></p>
  </div>
  <script id="initial-data" type="application/json">${escScriptJson(data)}</script>
  <script>
    const app = document.getElementById('app');
    const refreshState = document.getElementById('refreshState');
    const gameSelector = document.getElementById('gameSelector');
    const statusLine = document.getElementById('statusLine');
    let dashboard = JSON.parse(document.getElementById('initial-data').textContent);
    let lastRefresh = Date.now();
    let activeTab = 'conformance';
    let activeGameKey = localStorage.getItem('platinumConformanceDashboardGame') || dashboard.activeGameKey || 'aurora-galactica';
    const refreshMs = 30000;
    const dataHref = ${JSON.stringify(dataHref)};
    const artifactBase = ${JSON.stringify(artifactBase)};

    function esc(value){
      return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
      }[char]));
    }

    function scoreClass(score){
      if(!Number.isFinite(Number(score))) return 'watch';
      if(Number(score) >= 9) return 'good';
      if(Number(score) >= 8) return 'watch';
      return 'gap';
    }

    function ageText(iso){
      const then = new Date(iso).getTime();
      if(!Number.isFinite(then)) return 'unknown age';
      const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
      if(seconds < 90) return seconds + 's old';
      const minutes = Math.round(seconds / 60);
      if(minutes < 90) return minutes + 'm old';
      return Math.round(minutes / 60) + 'h old';
    }

    function evidenceLinks(reports){
      return Object.entries(reports || {})
        .filter(([, value]) => value)
        .map(([key, value]) => '<a href="' + artifactHref(value) + '">' + esc(key) + ': ' + esc(value) + '</a>')
        .join('');
    }

    function artifactHref(value){
      if(!value) return '#';
      if(/^https?:/i.test(value)) return value;
      return artifactBase + encodeURI(value);
    }

    function gameProfiles(){
      const games = Array.isArray(dashboard.games) ? dashboard.games : [];
      if(games.length) return games;
      return [{
        gameKey: dashboard.activeGameKey || 'aurora-galactica',
        gameName: 'Aurora Galactica',
        gameStatus: 'Active conformance investment',
        currentInvestment: 'Current focus: raise Aurora conformance toward the next major release gate.',
        releaseRead: 'Aurora is the current dashboard subject.',
        releaseGate: dashboard.releaseGate || [],
        priorityRows: dashboard.priorityRows || [],
        ingestionSummary: dashboard.ingestionSummary || {},
        ingestionRows: dashboard.ingestionRows || [],
        economicsSummary: dashboard.economicsSummary || {},
        scoreSemantics: dashboard.scoreSemantics || {},
        sourceReports: dashboard.sourceReports || {},
        newFirstClassAxes: dashboard.newFirstClassAxes || []
      }];
    }

    function selectedGame(){
      const games = gameProfiles();
      const selected = games.find(game => game.gameKey === activeGameKey) || games[0] || {};
      activeGameKey = selected.gameKey || activeGameKey;
      return Object.assign({}, dashboard, selected, {
        releaseGate: selected.releaseGate || dashboard.releaseGate || [],
        priorityRows: selected.priorityRows || dashboard.priorityRows || [],
        ingestionSummary: selected.ingestionSummary || dashboard.ingestionSummary || {},
        ingestionRows: selected.ingestionRows || dashboard.ingestionRows || [],
        economicsSummary: selected.economicsSummary || dashboard.economicsSummary || {},
        scoreSemantics: selected.scoreSemantics || dashboard.scoreSemantics || {},
        sourceReports: selected.sourceReports || dashboard.sourceReports || {},
        newFirstClassAxes: selected.newFirstClassAxes || dashboard.newFirstClassAxes || []
      });
    }

    function syncGameSelector(){
      const games = gameProfiles();
      gameSelector.innerHTML = games.map(game => {
        const selected = game.gameKey === activeGameKey ? ' selected' : '';
        const label = (game.gameName || game.gameKey || 'Unknown game') + (game.gameStatus ? ' - ' + game.gameStatus : '');
        return '<option value="' + esc(game.gameKey || '') + '"' + selected + '>' + esc(label) + '</option>';
      }).join('');
      if(!games.some(game => game.gameKey === activeGameKey) && games[0]){
        activeGameKey = games[0].gameKey;
        gameSelector.value = activeGameKey;
      }
    }

    function explanationBlock(label, value){
      return '<div class="explainBlock"><span class="explainLabel">' + esc(label) + '</span>' + esc(value || 'Not yet documented for this metric.') + '</div>';
    }

    function metricCell(row){
      const explanation = row.explanation || {};
      const scoreContext = row.scoreContext || {};
      const costContext = row.costContext || {};
      return '<details class="metricDetails">'
        + '<summary><span>' + esc(row.metric) + '</span></summary>'
        + '<div class="metricExplanation">'
        + '<div class="metricExplanationHeader"><span class="metricExplanationTitle">' + esc(row.metric) + '</span><button class="closeDetails" type="button">Close</button></div>'
        + explanationBlock('Score meaning', scoreContext.scoreMeaning)
        + explanationBlock('Confidence', scoreContext.confidence)
        + explanationBlock('Resolution', scoreContext.resolution)
        + explanationBlock('Tracked spend', costContext.trackedSpend)
        + explanationBlock('Expected resources', costContext.expectedResources)
        + explanationBlock('Value / cost read', costContext.valueCostRead)
        + explanationBlock('Calculation', explanation.calculation)
        + explanationBlock('Grounding best case', explanation.grounding)
        + explanationBlock('Player / designer meaning', explanation.meaning)
        + '</div>'
        + '</details>';
    }

    function anchorLink(value){
      if(!value) return '--';
      const text = esc(value);
      const href = artifactHref(value);
      return '<a href="' + esc(href) + '">' + text + '</a>';
    }

    function dashboardTabs(){
      return '<div class="tabs" role="tablist" aria-label="Dashboard views">'
        + '<button class="tab ' + (activeTab === 'conformance' ? 'active' : '') + '" type="button" data-tab="conformance" role="tab" aria-selected="' + (activeTab === 'conformance') + '">Conformance</button>'
        + '<button class="tab ' + (activeTab === 'ingestion' ? 'active' : '') + '" type="button" data-tab="ingestion" role="tab" aria-selected="' + (activeTab === 'ingestion') + '">Ingestion</button>'
        + '</div>';
    }

    function conformanceView(data, rows, gates, semantics){
      return \`
        <div class="split">
          <section>
            <h2>Priority Investment Queue</h2>
            <table>
              <thead><tr><th>Rank</th><th>Metric</th><th>Current</th><th>Confidence</th><th>Resolution</th><th>Cost / resources</th><th>Tracked spend</th><th>Target</th><th>Status</th><th>Recommended next step</th><th>Evidence</th></tr></thead>
              <tbody>\${rows.map(row => \`
                <tr>
                  <td class="priority">\${esc(row.rank)}</td>
                  <td class="metric">\${metricCell(row)}</td>
                  <td class="score \${scoreClass(row.score10)}">\${esc(row.current)}</td>
                  <td><span class="badge">\${esc(row.scoreContext?.confidence || '--')}</span></td>
                  <td class="small">\${esc(row.scoreContext?.resolution || '--')}</td>
                  <td class="costCell"><span class="badge">\${esc(row.costContext?.costClass || '--')}</span><div class="small">\${esc(row.costContext?.expectedResources || '--')}</div></td>
                  <td class="small">\${esc(row.costContext?.trackedSpend || '--')}</td>
                  <td>\${esc(row.target)}</td>
                  <td>\${esc(row.status)}<div class="small">\${esc(row.effort)}</div></td>
                  <td>\${esc(row.next)}</td>
                  <td class="small">\${esc(row.evidence)}</td>
                </tr>\`).join('')}</tbody>
            </table>
          </section>
          <div>
            <section class="card">
              <h2>Score Semantics</h2>
              <p><strong>\${esc(semantics.headline || 'Scores are current measured rollups, not perfection claims.')}</strong></p>
              <p class="small">\${esc(semantics.tenOutOfTen || '10/10 means no known measured gap at the current scorer resolution.')}</p>
              <p class="small"><strong>Confidence:</strong> \${esc(semantics.confidence || 'Trust level for the score as a release signal.')}</p>
              <p class="small"><strong>Resolution:</strong> \${esc(semantics.resolution || 'How fine-grained the scorer is today.')}</p>
            </section>
            <section class="card">
              <h2>Release Gates</h2>
              <table>
                <thead><tr><th>Gate</th><th>Current</th><th>Target</th></tr></thead>
                <tbody>\${gates.map(gate => \`
                  <tr><td class="metric">\${esc(gate.Gate)}</td><td class="score">\${esc(gate.Current)}</td><td>\${esc(gate.Target)}<div class="small">\${esc(gate.Notes)}</div></td></tr>\`).join('')}</tbody>
              </table>
            </section>
            <section class="card">
              <h2>First-Class Axes</h2>
              <ul class="axisList">\${(data.newFirstClassAxes || []).map(axis => '<li>' + esc(axis) + '</li>').join('')}</ul>
            </section>
            <section class="card">
              <h2>Artifact State</h2>
              <p><span class="label">Generated</span><strong>\${esc(data.generatedAt || '--')}</strong> <span class="small">(\${esc(ageText(data.generatedAt))})</span></p>
              <p><span class="label">Branch</span><strong>\${esc(data.branch || '--')}</strong> at <strong>\${esc(data.commit || '--')}</strong> <span class="\${data.dirty ? 'dirty' : 'clean'}">\${data.dirty ? 'dirty' : 'clean'}</span></p>
              <div class="evidence">\${evidenceLinks(data.sourceReports)}</div>
            </section>
          </div>
        </div>
      \`;
    }

    function ingestionView(data){
      const rows = Array.isArray(data.ingestionRows) ? data.ingestionRows : [];
      const summary = data.ingestionSummary || {};
      return \`
        <section>
          <h2>Ingestion Framework</h2>
          <p class="ingestionLead">\${esc(summary.framing || 'Ingestion turns reference media and Aurora runtime captures into repeatable conformance evidence: clips, contact sheets, traces, event logs, labels, scores, confidence, and next missing annotations.')}</p>
          <div class="ingestionGrid">
            <div class="card"><span class="label">Evidence Families</span><span class="value">\${esc(summary.sourceFamilyCount || rows.length || 0)}</span></div>
            <div class="card"><span class="label">Scored / Promoted</span><span class="value">\${esc(summary.scoredOrPromotedCount || 0)}</span></div>
            <div class="card"><span class="label">High Confidence</span><span class="value">\${esc(summary.highConfidenceCount || 0)}</span></div>
            <div class="card"><span class="label">Mixed / Low Confidence</span><span class="value">\${esc(summary.mixedOrLowConfidenceCount || 0)}</span></div>
          </div>
          <section class="card">
            <h2>Next Best Ingestion Upgrade</h2>
            <p>\${esc(summary.nextBestUpgrade || 'Promote the next evidence family into a scorer-backed artifact.')}</p>
          </section>
          <section>
            <h2>Evidence Pipeline Queue</h2>
            <table>
              <thead><tr><th>Priority</th><th>Source / evidence family</th><th>Axis</th><th>Artifact type</th><th>Coverage</th><th>Annotation status</th><th>Confidence</th><th>Linked metric</th><th>Anchor</th><th>Missing next</th></tr></thead>
              <tbody>\${rows.map(row => \`
                <tr>
                  <td class="priority">\${esc(row.rank)}</td>
                  <td class="metric">\${esc(row.source)}</td>
                  <td>\${esc(row.axis)}</td>
                  <td>\${esc(row.artifactType)}</td>
                  <td>\${esc(row.coverage)}</td>
                  <td><span class="badge">\${esc(row.annotationStatus)}</span></td>
                  <td><span class="badge">\${esc(row.confidence)}</span></td>
                  <td>\${esc(row.linkedMetric)}</td>
                  <td class="anchorCell">\${anchorLink(row.anchor)}</td>
                  <td>\${esc(row.next)}</td>
                </tr>\`).join('')}</tbody>
            </table>
          </section>
        </section>
      \`;
    }

    function render(rootData){
      syncGameSelector();
      const data = selectedGame();
      const rows = Array.isArray(data.priorityRows) ? data.priorityRows : [];
      const gates = Array.isArray(data.releaseGate) ? data.releaseGate : [];
      const overall = gates.find(gate => gate.Gate === 'Overall quality');
      const previewOverall = gates.find(gate => /reference conformance|playtest-weighted/i.test(gate.Gate || ''));
      const audio = rows.find(row => /Audio identity/.test(row.metric || ''));
      const level = rows.find(row => /Level arc/.test(row.metric || ''));
      const weakest = rows
        .filter(row => Number.isFinite(Number(row.score10)))
        .sort((a, b) => Number(a.score10) - Number(b.score10))[0] || null;
      const primaryGap = audio || weakest;
      const semantics = data.scoreSemantics || {};
      const economics = data.economicsSummary || {};
      app.innerHTML = \`
        <div class="grid">
          <div class="card"><span class="label">Selected Game</span><span class="value">\${esc(data.gameName || 'Current game')}</span><div class="small">\${esc(data.gameStatus || 'Conformance profile')}</div></div>
          <div class="card"><span class="label">Overall / Status</span><span class="value">\${esc(overall?.Current || previewOverall?.Current || '--')}</span><div class="small">\${esc(data.currentInvestment || data.releaseRead || 'No game status summary yet.')}</div></div>
          <div class="card"><span class="label">Weakest Major Gap</span><span class="value \${scoreClass(primaryGap?.score10)}">\${esc(primaryGap?.current || '--')}</span><div class="small">\${esc(primaryGap?.metric || 'No scored gap yet')}</div></div>
          <div class="card"><span class="label">Level / Primary Arc</span><span class="value \${scoreClass(level?.score10 || weakest?.score10)}">\${esc(level?.current || weakest?.current || '--')}</span><div class="small">\${esc(level ? 'Encounter shape and escalation' : (weakest?.metric || 'Awaiting scored metric'))}</div></div>
          <div class="card"><span class="label">Tracked Compute</span><span class="value">\${esc(economics.measuredRuns || 0)} runs</span><div class="small">\${esc(Math.round((economics.wallSeconds || 0) / 60))} min wall / \${esc(Math.round((economics.cpuSeconds || 0) / 60))} min CPU</div></div>
        </div>
        \${dashboardTabs()}
        \${activeTab === 'ingestion' ? ingestionView(data) : conformanceView(data, rows, gates, semantics)}
      \`;
      statusLine.textContent = 'Dashboard data: ' + (rootData.generatedAt || data.generatedAt || 'unknown') + '. Selected game: ' + (data.gameName || activeGameKey) + '. Page refreshes conformance-dashboard-data.json every 30 seconds.';
    }

    app.addEventListener('click', event => {
      const tab = event.target.closest('[data-tab]');
      if(tab){
        activeTab = tab.dataset.tab || 'conformance';
        render(dashboard);
        return;
      }
      const button = event.target.closest('.closeDetails');
      if(!button) return;
      const details = button.closest('details');
      if(details) details.open = false;
    });

    gameSelector.addEventListener('change', () => {
      activeGameKey = gameSelector.value || activeGameKey;
      localStorage.setItem('platinumConformanceDashboardGame', activeGameKey);
      render(dashboard);
    });

    async function refresh(){
      try{
        refreshState.disabled = true;
        refreshState.textContent = 'refreshing';
        const response = await fetch(dataHref + '?ts=' + Date.now(), { cache:'no-store' });
        if(!response.ok) throw new Error('HTTP ' + response.status);
        dashboard = await response.json();
        lastRefresh = Date.now();
        render(dashboard);
      }catch(err){
        refreshState.textContent = 'refresh failed';
        statusLine.textContent = 'Could not refresh dashboard data: ' + err.message;
      }finally{
        refreshState.disabled = false;
        tick();
      }
    }

    function tick(){
      const next = Math.max(0, Math.ceil((refreshMs - (Date.now() - lastRefresh)) / 1000));
      refreshState.textContent = 'refresh in ' + next + 's';
    }

    render(dashboard);
    tick();
    refreshState.addEventListener('click', refresh);
    setInterval(tick, 1000);
    setInterval(refresh, refreshMs);
  </script>
</body>
</html>`;
}

function buildDashboardPage({ sourceData = SOURCE_DATA, outHtml = OUT_HTML, outData = OUT_DATA, htmlOptions = {} } = {}){
  const htmlFiles = Array.isArray(outHtml) ? outHtml : [outHtml];
  const dataFiles = Array.isArray(outData) ? outData : [outData];
  if(!fs.existsSync(sourceData)){
    throw new Error(`Missing ${rel(sourceData)}. Run npm run harness:build:release-conformance-dashboard first.`);
  }
  const data = readJson(sourceData);
  const markup = html(data, htmlOptions);
  for(const file of htmlFiles) write(file, markup);
  for(const file of dataFiles) write(file, JSON.stringify(data, null, 2));
  return { sourceData, htmlFiles, dataFiles };
}

function main(){
  const result = buildDashboardPage();
  console.log(JSON.stringify({
    ok: true,
    source: rel(result.sourceData),
    html: result.htmlFiles.map(rel),
    data: result.dataFiles.map(rel)
  }, null, 2));
}

if(require.main === module) main();

module.exports = {
  html,
  buildDashboardPage
};

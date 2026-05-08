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

function html(data){
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Aurora Conformance Dashboard</title>
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
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0}
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
      gap:8px;
      margin-top:10px;
      padding:10px;
      border:1px solid var(--line);
      border-radius:7px;
      background:#fbfaf7;
      font-weight:500;
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
    .statusLine{margin-top:10px;color:var(--muted);font-size:13px}
    .dirty{color:var(--red)}
    .clean{color:var(--green)}
    @media (max-width:980px){
      header{grid-template-columns:1fr}
      .controls{justify-content:flex-start}
      .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .split{grid-template-columns:1fr}
    }
    @media (max-width:640px){
      .shell{padding:16px}
      .grid{grid-template-columns:1fr}
      table{display:block;overflow-x:auto}
      h1{font-size:26px}
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>Aurora Conformance Dashboard</h1>
        <p class="subtitle">Internal localhost view of the current conformance plan, release gates, measurement debt, and highest-value next investments. This page reads generated artifacts and refreshes without exposing anything publicly.</p>
      </div>
      <nav class="controls" aria-label="Dashboard links">
        <button class="pill" id="refreshState" type="button" aria-label="Refresh conformance dashboard data now">loading</button>
        <a class="button" href="http://127.0.0.1:8000/">Game</a>
        <a class="button" href="http://127.0.0.1:8000/release-dashboard.html">Release</a>
        <a class="button" href="/RELEASE_CONFORMANCE_DASHBOARD.md">Markdown</a>
      </nav>
    </header>
    <main id="app"></main>
    <p class="statusLine" id="statusLine"></p>
  </div>
  <script id="initial-data" type="application/json">${escScriptJson(data)}</script>
  <script>
    const app = document.getElementById('app');
    const refreshState = document.getElementById('refreshState');
    const statusLine = document.getElementById('statusLine');
    let dashboard = JSON.parse(document.getElementById('initial-data').textContent);
    let lastRefresh = Date.now();
    const refreshMs = 30000;

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
        .map(([key, value]) => '<a href="../' + encodeURI(value) + '">' + esc(key) + ': ' + esc(value) + '</a>')
        .join('');
    }

    function explanationBlock(label, value){
      return '<div><span class="explainLabel">' + esc(label) + '</span>' + esc(value || 'Not yet documented for this metric.') + '</div>';
    }

    function metricCell(row){
      const explanation = row.explanation || {};
      const scoreContext = row.scoreContext || {};
      const costContext = row.costContext || {};
      return '<details class="metricDetails">'
        + '<summary><span>' + esc(row.metric) + '</span></summary>'
        + '<div class="metricExplanation">'
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

    function render(data){
      const rows = Array.isArray(data.priorityRows) ? data.priorityRows : [];
      const gates = Array.isArray(data.releaseGate) ? data.releaseGate : [];
      const overall = gates.find(gate => gate.Gate === 'Overall quality');
      const audio = rows.find(row => /Audio identity/.test(row.metric || ''));
      const level = rows.find(row => /Level arc/.test(row.metric || ''));
      const semantics = data.scoreSemantics || {};
      const economics = data.economicsSummary || {};
      app.innerHTML = \`
        <div class="grid">
          <div class="card"><span class="label">Overall Quality</span><span class="value">\${esc(overall?.Current || '--')}</span></div>
          <div class="card"><span class="label">Weakest Major Gap</span><span class="value \${scoreClass(audio?.score10)}">\${esc(audio?.current || '--')}</span><div class="small">Audio identity and event feedback</div></div>
          <div class="card"><span class="label">Level Arc</span><span class="value \${scoreClass(level?.score10)}">\${esc(level?.current || '--')}</span><div class="small">Encounter shape and escalation</div></div>
          <div class="card"><span class="label">Tracked Compute</span><span class="value">\${esc(economics.measuredRuns || 0)} runs</span><div class="small">\${esc(Math.round((economics.wallSeconds || 0) / 60))} min wall / \${esc(Math.round((economics.cpuSeconds || 0) / 60))} min CPU</div></div>
        </div>
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
      statusLine.textContent = 'Dashboard data: ' + (data.generatedAt || 'unknown') + '. Page refreshes conformance-dashboard-data.json every 30 seconds.';
    }

    async function refresh(){
      try{
        refreshState.disabled = true;
        refreshState.textContent = 'refreshing';
        const response = await fetch('conformance-dashboard-data.json?ts=' + Date.now(), { cache:'no-store' });
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

function main(){
  if(!fs.existsSync(SOURCE_DATA)){
    throw new Error(`Missing ${rel(SOURCE_DATA)}. Run npm run harness:build:release-conformance-dashboard first.`);
  }
  const data = readJson(SOURCE_DATA);
  const markup = html(data);
  for(const file of OUT_HTML) write(file, markup);
  for(const file of OUT_DATA) write(file, JSON.stringify(data, null, 2));
  console.log(JSON.stringify({
    ok: true,
    source: rel(SOURCE_DATA),
    html: OUT_HTML.map(rel),
    data: OUT_DATA.map(rel)
  }, null, 2));
}

main();

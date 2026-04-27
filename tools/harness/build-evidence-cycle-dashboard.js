#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const AURORA_PLAN_PATH = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'aurora-level-expansion-cycle',
  'aurora-four-window-cycle.plan.json'
);
const GALAXIAN_MANIFEST_PATH = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxian-reference',
  'manifest.json'
);
const GALAXIAN_PROMOTED_WINDOWS_PATH = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxian-reference',
  'nenriki-15-wave-session',
  'promoted-windows',
  'reference-windows.json'
);
const DASHBOARD_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'evidence-cycle-dashboard');
const DASHBOARD_JSON_PATH = path.join(DASHBOARD_ROOT, 'evidence-cycle-dashboard.json');
const DASHBOARD_README_PATH = path.join(DASHBOARD_ROOT, 'README.md');
const DIST_DEV = path.join(ROOT, 'dist', 'dev');
const DIST_JSON_PATH = path.join(DIST_DEV, 'evidence-dashboard.json');
const DIST_HTML_PATH = path.join(DIST_DEV, 'evidence-dashboard.html');

const GALAXY_GUARDIANS_EVENTS = [
  'game_start',
  'wave_setup',
  'player_move',
  'player_shot',
  'regular_dive_start',
  'enemy_projectile',
  'enemy_hit',
  'player_hit',
  'wave_clear'
];

const REQUIRED_ARTIFACTS = [
  'source_or_run_manifest',
  'contact_sheet',
  'notable_stills',
  'motion_pressure_trace',
  'semantic_event_scaffold',
  'promoted_event_log',
  'playable_slice_note',
  'harness_target_list'
];

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function repoPath(file){
  return rel(file);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readOptionalJson(file, fallback){
  if(!fs.existsSync(file)) return fallback;
  return readJson(file);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value);
}

function fileExists(repoRelativePath){
  return fs.existsSync(path.join(ROOT, repoRelativePath));
}

function escapeHtml(value){
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gitValue(command, fallback){
  try{
    return execSync(command, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  }catch(_err){
    return fallback;
  }
}

function eventScaffoldForWindow(plan, win){
  const families = Array.isArray(win.event_families) ? win.event_families : [];
  return {
    schema_version: 1,
    status: 'planned-event-scaffold',
    generated_by: 'tools/harness/build-evidence-cycle-dashboard.js',
    game_lineage: plan.game_lineage || plan.target_game || 'aurora-galactica',
    target_game: plan.target_game || 'aurora-galactica',
    window_id: win.window_id,
    window_role: win.role,
    source_kind: win.source_kind,
    needs_waveform: Boolean(win.needs_waveform),
    note: 'Source-pending scaffold. Replace null timestamps with reviewed observations after the window is recorded or ingested.',
    events: families.map((family, index) => ({
      event_id: `${win.window_id}-${String(index + 1).padStart(2, '0')}-${family}`,
      event_family: family,
      time_s: null,
      duration_s: null,
      entity_family: null,
      entity_id: null,
      position_hint: null,
      motion_hint: null,
      audio_hint: win.needs_waveform ? null : 'not-required-for-first-pass',
      confidence: 'unknown',
      source_note: 'planned from aurora-four-window-cycle.plan.json'
    }))
  };
}

function windowReadme(plan, win, eventPath){
  const artifacts = [
    'source or generated run manifest',
    'contact sheet',
    'notable still frames',
    win.needs_waveform ? 'waveform' : 'waveform only if audio timing becomes relevant',
    'motion / pressure trace',
    'semantic event scaffold',
    'promoted reviewed event log',
    'playable-slice note',
    'harness target list'
  ];
  return `# ${win.window_id}\n\n`
    + `Status: source-pending evidence window\n\n`
    + `Role: ${win.role}\n\n`
    + `Source kind: ${win.source_kind}\n\n`
    + `This folder is the planned artifact target for the Aurora level-by-level expansion cycle. It is generated from \`${repoPath(AURORA_PLAN_PATH)}\` so the same review loop can be reused for Aurora, Galaxy Guardians, and later Platinum packs.\n\n`
    + `## Event Families\n\n`
    + `${(win.event_families || []).map(family => `- \`${family}\``).join('\n')}\n\n`
    + `## Required Artifacts\n\n`
    + `${artifacts.map(item => `- ${item}`).join('\n')}\n\n`
    + `## Scaffold\n\n`
    + `- \`${repoPath(eventPath)}\`\n\n`
    + `## Next Review Step\n\n`
    + `Record or ingest the source window, generate contact sheets/stills/trace${win.needs_waveform ? '/waveform' : ''}, then promote visually confirmed events from null timestamps into reviewed observations.\n`;
}

function buildAuroraWindowState(plan){
  const outputRoot = path.join(ROOT, plan.output_root);
  return (plan.windows || []).map(win => {
    const windowRoot = path.join(outputRoot, win.window_id);
    const eventsPath = path.join(windowRoot, 'events', 'reference-events.json');
    const readmePath = path.join(windowRoot, 'README.md');
    let eventStatus = 'planned-event-scaffold';
    if(fs.existsSync(eventsPath)){
      try{
        const existing = readJson(eventsPath);
        eventStatus = existing.status || eventStatus;
        if(existing.status === 'planned-event-scaffold'){
          writeJson(eventsPath, eventScaffoldForWindow(plan, win));
        }
      }catch(_err){
        writeJson(eventsPath, eventScaffoldForWindow(plan, win));
      }
    }else{
      writeJson(eventsPath, eventScaffoldForWindow(plan, win));
    }
    writeText(readmePath, windowReadme(plan, win, eventsPath));

    const artifactPaths = {
      source_manifest: path.join(windowRoot, 'source-manifest.json'),
      contact_sheet_1s: path.join(windowRoot, 'frames', 'contact-sheet-1s.png'),
      still_start: path.join(windowRoot, 'frames', 'still-start.png'),
      still_mid: path.join(windowRoot, 'frames', 'still-mid.png'),
      still_end: path.join(windowRoot, 'frames', 'still-end.png'),
      trace_json: path.join(windowRoot, 'trace', 'trace.json'),
      trace_svg: path.join(windowRoot, 'trace', 'player-pressure.svg'),
      audio_timeline: path.join(windowRoot, 'audio', 'audio-cue-timeline.svg'),
      playable_slice_note: path.join(windowRoot, 'PLAYABLE_SLICE_NOTE.md'),
      harness_targets: path.join(windowRoot, 'HARNESS_TARGETS.md')
    };
    const requiredArtifacts = REQUIRED_ARTIFACTS.concat(win.needs_waveform ? ['waveform'] : []);
    return {
      window_id: win.window_id,
      role: win.role,
      source_kind: win.source_kind,
      needs_waveform: Boolean(win.needs_waveform),
      event_families: win.event_families || [],
      artifact_targets: requiredArtifacts.map(name => ({
        name,
        status: name === 'semantic_event_scaffold'
          ? eventStatus
          : artifactStatus(name, artifactPaths, win)
      })),
      generated_paths: {
        readme: repoPath(readmePath),
        event_scaffold: repoPath(eventsPath)
      },
      artifacts: Object.fromEntries(Object.entries(artifactPaths)
        .filter(([, file]) => fs.existsSync(file))
        .map(([key, file]) => [key, repoPath(file)])),
      event_status: eventStatus
    };
  });
}

function artifactStatus(name, paths, win){
  if(name === 'source_or_run_manifest') return fs.existsSync(paths.source_manifest) ? 'generated' : 'source-pending';
  if(name === 'contact_sheet') return fs.existsSync(paths.contact_sheet_1s) ? 'generated' : 'source-pending';
  if(name === 'notable_stills') return fs.existsSync(paths.still_start) && fs.existsSync(paths.still_mid) && fs.existsSync(paths.still_end) ? 'generated' : 'source-pending';
  if(name === 'motion_pressure_trace') return fs.existsSync(paths.trace_json) && fs.existsSync(paths.trace_svg) ? 'generated' : 'source-pending';
  if(name === 'promoted_event_log') return fs.existsSync(paths.trace_json) ? 'generated' : 'source-pending';
  if(name === 'playable_slice_note') return fs.existsSync(paths.playable_slice_note) ? 'generated' : 'source-pending';
  if(name === 'harness_target_list') return fs.existsSync(paths.harness_targets) ? 'generated' : 'source-pending';
  if(name === 'waveform'){
    if(fs.existsSync(paths.audio_timeline)) return 'audio-cue-timeline';
    return win.needs_waveform ? 'capture-audio-pending' : 'not-required';
  }
  return 'source-pending';
}

function renderAuroraMedia(win){
  const image = win.artifacts && (win.artifacts.contact_sheet_1s || win.artifacts.trace_svg || win.artifacts.audio_timeline);
  if(!image) return '';
  return `<div class="media-grid"><a href="../../${escapeHtml(image)}"><img src="../../${escapeHtml(image)}" alt="${escapeHtml(win.window_id)} evidence image"></a></div>`;
}

function renderAuroraArtifactLinks(win){
  const artifacts = win.artifacts || {};
  const links = [
    ['manifest', artifacts.source_manifest],
    ['trace', artifacts.trace_json],
    ['audio timeline', artifacts.audio_timeline],
    ['playable note', artifacts.playable_slice_note],
    ['harness targets', artifacts.harness_targets]
  ].filter(([, target]) => target);
  if(!links.length) return '';
  return links.map(([label, target]) => `<a href="../../${escapeHtml(target)}">${escapeHtml(label)}</a>`).join(' ');
}

function summarizeGalaxianReference(manifest, promotedWindows){
  const available = fs.existsSync(GALAXIAN_MANIFEST_PATH) && fs.existsSync(GALAXIAN_PROMOTED_WINDOWS_PATH);
  const localSources = (manifest.candidate_sources || []).filter(source =>
    String(source.url_or_local_anchor || '').startsWith('/')
  );
  const supportingSources = (manifest.candidate_sources || []).filter(source =>
    ['supporting-source', 'discovery-index'].includes(source.analysis_status)
  );
  return {
    available,
    manifest_path: repoPath(GALAXIAN_MANIFEST_PATH),
    promoted_windows_path: repoPath(GALAXIAN_PROMOTED_WINDOWS_PATH),
    candidate_source_count: (manifest.candidate_sources || []).length,
    local_media_source_count: localSources.length,
    selected_window_count: (manifest.selected_windows || []).length,
    supporting_source_count: supportingSources.length,
    promoted_window_count: (promotedWindows.windows || []).length,
    promoted_windows: (promotedWindows.windows || []).map(win => ({
      window_id: win.window_id,
      window_family: win.window_family,
      start_time_s: win.start_time_s,
      end_time_s: win.end_time_s,
      duration_s: win.duration_s,
      pressure_score: win.pressure_score,
      player_detection_rate: win.trace_summary && win.trace_summary.player_detection_rate,
      mean_abs_player_delta_per_sample: win.trace_summary && win.trace_summary.mean_abs_player_delta_per_sample,
      artifacts: win.artifacts || {}
    }))
  };
}

function buildDashboardModel(){
  const auroraPlan = readJson(AURORA_PLAN_PATH);
  const galaxianManifest = readOptionalJson(GALAXIAN_MANIFEST_PATH, {
    candidate_sources: [],
    selected_windows: []
  });
  const galaxianPromotedWindows = readOptionalJson(GALAXIAN_PROMOTED_WINDOWS_PATH, {
    windows: []
  });
  const auroraWindows = buildAuroraWindowState(auroraPlan);
  const generatedAt = new Date().toISOString();

  return {
    schema_version: 1,
    generated_by: 'tools/harness/build-evidence-cycle-dashboard.js',
    generated_at: generatedAt,
    git: {
      branch: gitValue('git rev-parse --abbrev-ref HEAD', 'unknown')
    },
    status: 'cross-game-evidence-cycle-v1',
    purpose: 'Give Aurora level expansion, Galaxy Guardians preview work, and future Platinum game ingestion one inspectable evidence surface.',
    local_inspection: {
      serve_from_repo_root: 'python3 -m http.server 8000 --bind 127.0.0.1',
      dashboard_url: 'http://127.0.0.1:8000/dist/dev/evidence-dashboard.html',
      game_url: 'http://127.0.0.1:8000/dist/dev/index.html'
    },
    aurora_level_expansion: {
      plan_path: repoPath(AURORA_PLAN_PATH),
      status: auroraPlan.status,
      plan_kind: auroraPlan.plan_kind || 'source-pending-evidence-cycle',
      output_root: auroraPlan.output_root,
      preferred_first_slice: auroraPlan.implementation_candidate && auroraPlan.implementation_candidate.preferred_first_slice,
      candidate_branch: auroraPlan.implementation_candidate && auroraPlan.implementation_candidate.branch,
      harness_expectation: auroraPlan.implementation_candidate && auroraPlan.implementation_candidate.first_harness_expectation,
      window_count: auroraWindows.length,
      waveform_window_count: auroraWindows.filter(win => win.needs_waveform).length,
      windows: auroraWindows
    },
    galaxy_guardians_preview: {
      contract_doc: 'GALAXY_GUARDIANS_PACK_CONTRACT.md',
      event_schema_doc: 'GALAXY_GUARDIANS_EVENT_SCHEMA_PLAN.md',
      semantic_events: GALAXY_GUARDIANS_EVENTS,
      pack_harnesses: [
        'npm run harness:check:platinum-pack-boot',
        'npm run harness:check:game-picker-shell',
        'npm run harness:check:galaxy-guardians-playable-preview',
        'npm run harness:check:galaxy-guardians-event-log',
        'npm run harness:check:platinum-pack-rule-adapters',
        'npm run harness:check:galaxian-preview-evidence'
      ],
      explicit_preview_exclusions: [
        'Aurora capture/rescue',
        'dual fighter mode',
        'challenge stages',
        'full 15-wave progression',
        'exact flagship/escort score reproduction'
      ]
    },
    galaxian_reference: summarizeGalaxianReference(galaxianManifest, galaxianPromotedWindows),
    reusable_ingestion_loop: [
      'discover and register source media',
      'select time-bounded windows',
      'generate contact sheets, stills, waveform, and trace artifacts',
      'scaffold semantic events',
      'promote visually confirmed observations',
      'convert observations into pack/runtime harnesses',
      'inspect the result on the evidence dashboard'
    ],
    next_actions: [
      'Record or ingest Aurora stage-1 baseline and challenge-stage candidate windows.',
      'Promote the planned Aurora event scaffolds from null timestamps to reviewed events.',
      'Use Galaxian promoted-window pressure scores to tune the Galaxy Guardians scout-wave pressure bands.',
      'Add one Aurora challenge-stage-depth harness after the first measured challenge window exists.',
      'Keep this branch isolated until the other workstation finishes the current beta/production repair cycle.'
    ],
    generated_files: {
      dashboard_json: repoPath(DASHBOARD_JSON_PATH),
      dashboard_readme: repoPath(DASHBOARD_README_PATH),
      dist_json: repoPath(DIST_JSON_PATH),
      dist_html: repoPath(DIST_HTML_PATH)
    }
  };
}

function artifactLink(pathValue){
  if(!pathValue) return '';
  return `../../${pathValue}`;
}

function renderPromotedWindow(win){
  const contactSheet = win.artifacts && win.artifacts.contact_sheet_5s || win.artifacts && win.artifacts.contact_sheet_1s;
  const waveform = win.artifacts && win.artifacts.waveform;
  return `<article class="panel window-panel">
    <div class="panel-heading">
      <div>
        <h3>${escapeHtml(win.window_id)}</h3>
        <p>${escapeHtml(win.window_family)} | ${escapeHtml(win.start_time_s)}-${escapeHtml(win.end_time_s)}s</p>
      </div>
      <span class="metric">${escapeHtml(win.pressure_score)}</span>
    </div>
    <div class="media-grid">
      ${contactSheet ? `<a href="${escapeHtml(artifactLink(contactSheet))}"><img src="${escapeHtml(artifactLink(contactSheet))}" alt="${escapeHtml(win.window_id)} contact sheet"></a>` : ''}
      ${waveform ? `<a href="${escapeHtml(artifactLink(waveform))}"><img src="${escapeHtml(artifactLink(waveform))}" alt="${escapeHtml(win.window_id)} waveform"></a>` : ''}
    </div>
    <dl class="facts">
      <div><dt>Player detection</dt><dd>${escapeHtml(win.player_detection_rate)}</dd></div>
      <div><dt>Movement delta</dt><dd>${escapeHtml(win.mean_abs_player_delta_per_sample)}</dd></div>
    </dl>
  </article>`;
}

function renderAuroraWindow(win){
  return `<article class="panel">
    <div class="panel-heading">
      <div>
        <h3>${escapeHtml(win.window_id)}</h3>
        <p>${escapeHtml(win.role)} | ${escapeHtml(win.source_kind)}</p>
      </div>
      <span class="state">${win.needs_waveform ? 'waveform' : 'visual'}</span>
    </div>
    ${renderAuroraMedia(win)}
    <div class="chips">${win.event_families.map(family => `<span>${escapeHtml(family)}</span>`).join('')}</div>
    <ul class="artifact-list">
      ${win.artifact_targets.map(target => `<li><span>${escapeHtml(target.name)}</span><strong>${escapeHtml(target.status)}</strong></li>`).join('')}
    </ul>
    <p class="links"><a href="../../${escapeHtml(win.generated_paths.readme)}">window folder</a> <a href="../../${escapeHtml(win.generated_paths.event_scaffold)}">event log</a> ${renderAuroraArtifactLinks(win)}</p>
  </article>`;
}

function renderDashboardHtml(model){
  const promoted = model.galaxian_reference.promoted_windows;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Aurora Evidence Cycle Dashboard</title>
  <style>
    :root{
      color-scheme: dark;
      --bg:#111316;
      --surface:#1a1f24;
      --surface-2:#20272d;
      --line:#34404a;
      --text:#eef3f6;
      --muted:#a9b7c0;
      --green:#60d394;
      --gold:#f4c95d;
      --blue:#73c2fb;
      --red:#ff6b6b;
    }
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:var(--blue);text-decoration:none}
    a:hover{text-decoration:underline}
    header{padding:24px 28px;border-bottom:1px solid var(--line);background:#161a1e}
    header h1{margin:0 0 8px;font-size:28px;letter-spacing:0}
    header p{max-width:980px;margin:0;color:var(--muted)}
    main{padding:22px 28px 36px;display:grid;gap:22px}
    section{display:grid;gap:14px}
    h2{margin:0;font-size:18px;letter-spacing:0}
    h3{margin:0;font-size:15px;letter-spacing:0}
    p{margin:0}
    .topline{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
    .badge{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--surface);border-radius:6px;padding:7px 10px;color:var(--muted)}
    .badge strong{color:var(--text)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px}
    .wide-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:14px}
    .panel{border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:14px;min-width:0}
    .panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
    .panel-heading p{color:var(--muted);font-size:12px;margin-top:3px}
    .metric,.state{border:1px solid var(--line);background:var(--surface-2);border-radius:6px;padding:5px 8px;color:var(--gold);font-weight:700;white-space:nowrap}
    .state{color:var(--green)}
    .chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
    .chips span{border:1px solid #3c4a55;border-radius:5px;padding:4px 7px;background:var(--surface-2);color:#dce6eb;font-size:12px}
    .artifact-list{list-style:none;margin:0;padding:0;display:grid;gap:5px}
    .artifact-list li{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #2c363f;padding-top:5px;color:var(--muted)}
    .artifact-list strong{color:var(--green);font-size:12px}
    .links{display:flex;gap:12px;margin-top:12px;font-size:12px}
    .media-grid{display:grid;grid-template-columns:1fr;gap:8px}
    .media-grid img{display:block;width:100%;max-height:260px;object-fit:contain;background:#08090a;border:1px solid #2c363f;border-radius:6px}
    .facts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 0}
    .facts div{border-top:1px solid #2c363f;padding-top:7px}
    dt{color:var(--muted);font-size:12px}
    dd{margin:2px 0 0;font-weight:700}
    .command{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:#0b0d0f;border:1px solid var(--line);border-radius:6px;padding:10px;overflow:auto;white-space:pre-wrap}
    .next-list{margin:0;padding-left:18px;color:#dce6eb}
    .next-list li{margin:5px 0}
    .status-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
    .status-row .panel strong{display:block;font-size:22px;color:var(--text)}
    .status-row .panel span{color:var(--muted)}
  </style>
</head>
<body>
  <header>
    <h1>Aurora Evidence Cycle Dashboard</h1>
    <p>${escapeHtml(model.purpose)}</p>
    <div class="topline">
      <span class="badge">Branch <strong>${escapeHtml(model.git.branch)}</strong></span>
      <span class="badge">Generated <strong>${escapeHtml(model.generated_at)}</strong></span>
      <span class="badge">Status <strong>${escapeHtml(model.status)}</strong></span>
    </div>
  </header>
  <main>
    <section>
      <h2>Cross-Game Readiness</h2>
      <div class="status-row">
        <div class="panel"><strong>${escapeHtml(model.aurora_level_expansion.window_count)}</strong><span>Aurora planned windows</span></div>
        <div class="panel"><strong>${escapeHtml(model.aurora_level_expansion.waveform_window_count)}</strong><span>Aurora waveform windows</span></div>
        <div class="panel"><strong>${escapeHtml(model.galaxian_reference.promoted_window_count)}</strong><span>Galaxian promoted windows</span></div>
        <div class="panel"><strong>${escapeHtml(model.galaxy_guardians_preview.semantic_events.length)}</strong><span>Galaxy semantic events</span></div>
      </div>
    </section>
    <section>
      <h2>Aurora Level Expansion Windows</h2>
      <div class="grid">${model.aurora_level_expansion.windows.map(renderAuroraWindow).join('\n')}</div>
    </section>
    <section>
      <h2>Galaxian Promoted Evidence</h2>
      <div class="wide-grid">${promoted.map(renderPromotedWindow).join('\n')}</div>
    </section>
    <section>
      <h2>Galaxy Guardians Preview Contract</h2>
      <div class="grid">
        <article class="panel">
          <h3>Semantic events</h3>
          <div class="chips">${model.galaxy_guardians_preview.semantic_events.map(event => `<span>${escapeHtml(event)}</span>`).join('')}</div>
          <p class="links"><a href="../../GALAXY_GUARDIANS_EVENT_SCHEMA_PLAN.md">event schema</a> <a href="../../GALAXY_GUARDIANS_PACK_CONTRACT.md">pack contract</a></p>
        </article>
        <article class="panel">
          <h3>Harnesses</h3>
          <ul class="next-list">${model.galaxy_guardians_preview.pack_harnesses.map(cmd => `<li><code>${escapeHtml(cmd)}</code></li>`).join('')}</ul>
        </article>
      </div>
    </section>
    <section>
      <h2>Reusable Ingestion Loop</h2>
      <div class="grid">
        <article class="panel">
          <ul class="next-list">${model.reusable_ingestion_loop.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
        </article>
        <article class="panel">
          <h3>Local commands</h3>
          <p class="command">npm run build
npm run harness:build:evidence-cycle-dashboard
npm run harness:check:evidence-cycle-dashboard
python3 -m http.server 8000 --bind 127.0.0.1</p>
        </article>
      </div>
    </section>
    <section>
      <h2>Next Actions</h2>
      <article class="panel">
        <ul class="next-list">${model.next_actions.map(action => `<li>${escapeHtml(action)}</li>`).join('')}</ul>
      </article>
    </section>
  </main>
</body>
</html>
`;
}

function renderReadme(model){
  return `# Evidence Cycle Dashboard\n\n`
    + `Status: \`${model.status}\`\n\n`
    + `Generated: \`${model.generated_at}\`\n\n`
    + `Branch: \`${model.git.branch}\`\n\n`
    + `This dashboard is the inspectable local surface for the shared Aurora / Galaxy Guardians / future Platinum ingestion loop.\n\n`
    + `## Local Inspection\n\n`
    + `Run:\n\n`
    + `\`\`\`sh\n`
    + `npm run build\n`
    + `npm run harness:build:evidence-cycle-dashboard\n`
    + `npm run harness:check:evidence-cycle-dashboard\n`
    + `python3 -m http.server 8000 --bind 127.0.0.1\n`
    + `\`\`\`\n\n`
    + `Open:\n\n`
    + `- ${model.local_inspection.dashboard_url}\n`
    + `- ${model.local_inspection.game_url}\n\n`
    + `## Current Counts\n\n`
    + `- Aurora planned windows: ${model.aurora_level_expansion.window_count}\n`
    + `- Aurora waveform windows: ${model.aurora_level_expansion.waveform_window_count}\n`
    + `- Galaxian promoted windows: ${model.galaxian_reference.promoted_window_count}\n`
    + `- Galaxy Guardians semantic events: ${model.galaxy_guardians_preview.semantic_events.length}\n\n`
    + `## Generated Files\n\n`
    + `- \`${model.generated_files.dashboard_json}\`\n`
    + `- \`${model.generated_files.dist_json}\`\n`
    + `- \`${model.generated_files.dist_html}\`\n`;
}

function main(){
  const model = buildDashboardModel();
  writeJson(DASHBOARD_JSON_PATH, model);
  writeText(DASHBOARD_README_PATH, renderReadme(model));
  writeJson(DIST_JSON_PATH, model);
  writeText(DIST_HTML_PATH, renderDashboardHtml(model));
  console.log(JSON.stringify({
    ok: true,
    dashboard: repoPath(DASHBOARD_JSON_PATH),
    localPage: repoPath(DIST_HTML_PATH),
    auroraWindows: model.aurora_level_expansion.window_count,
    promotedGalaxianWindows: model.galaxian_reference.promoted_window_count
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err.stack || err.message);
  process.exit(1);
}

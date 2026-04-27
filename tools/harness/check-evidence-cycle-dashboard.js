#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DASHBOARD_JSON_PATH = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'evidence-cycle-dashboard',
  'evidence-cycle-dashboard.json'
);
const DASHBOARD_HTML_PATH = path.join(ROOT, 'dist', 'dev', 'evidence-dashboard.html');

const REQUIRED_AURORA_WINDOWS = [
  'stage-1-baseline',
  'challenge-stage-candidate',
  'mid-run-pressure',
  'late-run-cleanup-or-failure'
];

const REQUIRED_GALAXY_EVENTS = [
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

const REQUIRED_ARTIFACT_TARGETS = [
  'source_or_run_manifest',
  'contact_sheet',
  'notable_stills',
  'motion_pressure_trace',
  'semantic_event_scaffold',
  'promoted_event_log',
  'playable_slice_note',
  'harness_target_list'
];
const ALLOWED_EVENT_STATUSES = new Set(['planned-event-scaffold', 'events-observed']);

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    throw new Error(`${rel(file)} is not valid JSON: ${err.message}`);
  }
}

function existsRepoPath(repoPath){
  return fs.existsSync(path.join(ROOT, repoPath));
}

function addIssue(issues, severity, message){
  issues.push({ severity, message });
}

function validateAurora(model, issues){
  const windows = model.aurora_level_expansion && model.aurora_level_expansion.windows;
  if(!Array.isArray(windows)) {
    addIssue(issues, 'error', 'aurora_level_expansion.windows must be an array');
    return;
  }
  if(windows.length !== 4) addIssue(issues, 'error', `expected 4 Aurora windows, found ${windows.length}`);
  const ids = new Set(windows.map(win => win.window_id));
  for(const id of REQUIRED_AURORA_WINDOWS){
    if(!ids.has(id)) addIssue(issues, 'error', `missing Aurora window ${id}`);
  }
  for(const win of windows){
    const targets = new Set((win.artifact_targets || []).map(target => target.name));
    for(const target of REQUIRED_ARTIFACT_TARGETS){
      if(!targets.has(target)) addIssue(issues, 'error', `${win.window_id} missing artifact target ${target}`);
    }
    if(win.needs_waveform && !targets.has('waveform')){
      addIssue(issues, 'error', `${win.window_id} needs waveform but has no waveform artifact target`);
    }
    if(!Array.isArray(win.event_families) || win.event_families.length < 2){
      addIssue(issues, 'error', `${win.window_id} has too few event families`);
    }
    const scaffold = win.generated_paths && win.generated_paths.event_scaffold;
    if(!scaffold || !existsRepoPath(scaffold)){
      addIssue(issues, 'error', `${win.window_id} missing generated event scaffold`);
    }else{
      const eventLog = readJson(path.join(ROOT, scaffold));
      if(eventLog.window_id !== win.window_id) addIssue(issues, 'error', `${win.window_id} scaffold window_id mismatch`);
      if(!ALLOWED_EVENT_STATUSES.has(eventLog.status)) addIssue(issues, 'error', `${win.window_id} event log status mismatch`);
      if(!Array.isArray(eventLog.events) || eventLog.events.length < win.event_families.length){
        addIssue(issues, 'error', `${win.window_id} event log has too few events`);
      }
      if(eventLog.status === 'events-observed' && (!Array.isArray(eventLog.event_family_coverage) || !eventLog.event_family_coverage.length)){
        addIssue(issues, 'error', `${win.window_id} observed event log missing event_family_coverage`);
      }
    }
    if(win.artifacts){
      for(const key of ['source_manifest', 'contact_sheet_1s', 'still_start', 'still_mid', 'still_end', 'trace_json', 'trace_svg', 'audio_timeline', 'playable_slice_note', 'harness_targets']){
        if(!win.artifacts[key]) addIssue(issues, 'error', `${win.window_id} missing generated artifact ${key}`);
        else if(!existsRepoPath(win.artifacts[key])) addIssue(issues, 'error', `${win.window_id} generated artifact path missing on disk: ${win.artifacts[key]}`);
      }
    }
  }
}

function validateGalaxy(model, issues){
  const events = new Set((model.galaxy_guardians_preview && model.galaxy_guardians_preview.semantic_events) || []);
  for(const event of REQUIRED_GALAXY_EVENTS){
    if(!events.has(event)) addIssue(issues, 'error', `missing Galaxy Guardians semantic event ${event}`);
  }
  const harnesses = (model.galaxy_guardians_preview && model.galaxy_guardians_preview.pack_harnesses) || [];
  for(const expected of [
    'npm run harness:check:galaxy-guardians-event-log',
    'npm run harness:check:platinum-pack-rule-adapters',
    'npm run harness:check:galaxian-preview-evidence'
  ]){
    if(!harnesses.includes(expected)) addIssue(issues, 'error', `missing harness ${expected}`);
  }
}

function validateGalaxian(model, issues){
  const reference = model.galaxian_reference || {};
  if(reference.candidate_source_count < 3) addIssue(issues, 'error', 'expected at least 3 Galaxian candidate sources');
  if(reference.promoted_window_count < 6) addIssue(issues, 'error', 'expected at least 6 promoted Galaxian windows');
  for(const win of reference.promoted_windows || []){
    if(typeof win.pressure_score !== 'number') addIssue(issues, 'error', `${win.window_id} missing pressure_score`);
    if(!win.artifacts || !win.artifacts.contact_sheet_1s) addIssue(issues, 'error', `${win.window_id} missing contact sheet artifact`);
    if(!win.artifacts || !win.artifacts.waveform) addIssue(issues, 'error', `${win.window_id} missing waveform artifact`);
  }
}

function validateHtml(model, issues){
  if(!fs.existsSync(DASHBOARD_HTML_PATH)){
    addIssue(issues, 'error', `missing local dashboard HTML ${rel(DASHBOARD_HTML_PATH)}`);
    return;
  }
  const html = fs.readFileSync(DASHBOARD_HTML_PATH, 'utf8');
  for(const needle of [
    'Aurora Evidence Cycle Dashboard',
    'Aurora Level Expansion Windows',
    'Galaxian Promoted Evidence',
    'Galaxy Guardians Preview Contract',
    'Reusable Ingestion Loop'
  ]){
    if(!html.includes(needle)) addIssue(issues, 'error', `local dashboard HTML missing "${needle}"`);
  }
  for(const win of (model.aurora_level_expansion && model.aurora_level_expansion.windows) || []){
    if(!html.includes(win.window_id)) addIssue(issues, 'error', `local dashboard HTML missing window ${win.window_id}`);
  }
}

function main(){
  const issues = [];
  if(!fs.existsSync(DASHBOARD_JSON_PATH)){
    throw new Error(`Missing dashboard JSON: ${rel(DASHBOARD_JSON_PATH)}. Run npm run harness:build:evidence-cycle-dashboard first.`);
  }
  const model = readJson(DASHBOARD_JSON_PATH);
  if(model.schema_version !== 1) addIssue(issues, 'error', 'dashboard schema_version must be 1');
  if(model.status !== 'cross-game-evidence-cycle-v1') addIssue(issues, 'error', `unexpected dashboard status ${model.status}`);
  validateAurora(model, issues);
  validateGalaxy(model, issues);
  validateGalaxian(model, issues);
  validateHtml(model, issues);

  const errors = issues.filter(issue => issue.severity === 'error');
  const summary = {
    ok: errors.length === 0,
    dashboard: rel(DASHBOARD_JSON_PATH),
    localPage: rel(DASHBOARD_HTML_PATH),
    auroraWindows: model.aurora_level_expansion && model.aurora_level_expansion.window_count,
    galaxianPromotedWindows: model.galaxian_reference && model.galaxian_reference.promoted_window_count,
    errors: errors.length,
    warnings: issues.length - errors.length,
    issues
  };
  console.log(JSON.stringify(summary, null, 2));
  if(errors.length) process.exit(1);
}

try{
  main();
}catch(err){
  console.error(err.stack || err.message);
  process.exit(1);
}

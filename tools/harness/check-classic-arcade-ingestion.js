#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_INGESTION_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference');
const ALLOWED_CONFIDENCE = new Set(['high', 'medium', 'low', 'unknown']);
const ALLOWED_SOURCE_STATUS = new Set([
  'candidate',
  'confirmed-candidate',
  'supporting-source',
  'discovery-index',
  'rejected',
  'canonical'
]);
const ALLOWED_WINDOW_STATUS = new Set([
  'planned',
  'source-selected',
  'clipped',
  'event-skeleton',
  'events-observed',
  'semantic-profiled',
  'canonical'
]);
const REQUIRED_SOURCE_FIELDS = [
  'source_id',
  'game_lineage',
  'title',
  'url_or_local_anchor',
  'creator_or_archive',
  'capture_type',
  'video_quality',
  'audio_quality',
  'license_or_usage_note',
  'analysis_status',
  'confidence',
  'notes'
];
const REQUIRED_EVENT_FIELDS = [
  'event_id',
  'event_family',
  'time_s',
  'duration_s',
  'entity_family',
  'entity_id',
  'position_hint',
  'motion_hint',
  'audio_hint',
  'confidence',
  'source_note'
];

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    throw new Error(`${path.relative(ROOT, file)} is not valid JSON: ${err.message}`);
  }
}

function exists(relOrAbs){
  return fs.existsSync(path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs));
}

function isWebOrLocalAnchor(value){
  if(typeof value !== 'string' || !value.trim()) return false;
  if(/^https?:\/\//.test(value)) return true;
  return value.startsWith('reference-artifacts/') || value.startsWith('/') || value.startsWith('./');
}

function addIssue(list, severity, message, details = {}){
  list.push({ severity, message, ...details });
}

function validateManifest(ingestionRoot, issues){
  const manifestPath = path.join(ingestionRoot, 'manifest.json');
  if(!fs.existsSync(manifestPath)) throw new Error(`Missing manifest: ${path.relative(ROOT, manifestPath)}`);
  const manifest = readJson(manifestPath);
  if(manifest.schema_version !== 1) addIssue(issues, 'error', 'manifest.schema_version must be 1');
  if(!manifest.game_lineage) addIssue(issues, 'error', 'manifest.game_lineage is required');
  if(!manifest.platinum_target_pack) addIssue(issues, 'error', 'manifest.platinum_target_pack is required');
  if(!Array.isArray(manifest.candidate_sources) || !manifest.candidate_sources.length){
    addIssue(issues, 'error', 'manifest.candidate_sources must contain at least one source');
  }
  if(!Array.isArray(manifest.selected_windows) || !manifest.selected_windows.length){
    addIssue(issues, 'error', 'manifest.selected_windows must contain at least one window');
  }

  const sourceIds = new Set();
  for(const [index, source] of (manifest.candidate_sources || []).entries()){
    for(const field of REQUIRED_SOURCE_FIELDS){
      if(source[field] === undefined || source[field] === '') addIssue(issues, 'error', `source ${index} missing ${field}`);
    }
    if(source.source_id){
      if(sourceIds.has(source.source_id)) addIssue(issues, 'error', `duplicate source_id ${source.source_id}`);
      sourceIds.add(source.source_id);
    }
    if(source.game_lineage && source.game_lineage !== manifest.game_lineage){
      addIssue(issues, 'warning', `source ${source.source_id} lineage differs from manifest`, {
        source_lineage: source.game_lineage,
        manifest_lineage: manifest.game_lineage
      });
    }
    if(source.analysis_status && !ALLOWED_SOURCE_STATUS.has(source.analysis_status)){
      addIssue(issues, 'error', `source ${source.source_id} has unsupported analysis_status ${source.analysis_status}`);
    }
    if(source.confidence && !ALLOWED_CONFIDENCE.has(source.confidence)){
      addIssue(issues, 'error', `source ${source.source_id} has unsupported confidence ${source.confidence}`);
    }
    if(!isWebOrLocalAnchor(source.url_or_local_anchor)){
      addIssue(issues, 'error', `source ${source.source_id} has invalid url_or_local_anchor`);
    }
    if(String(source.license_or_usage_note || '').length < 12){
      addIssue(issues, 'warning', `source ${source.source_id} has a thin license_or_usage_note`);
    }
  }

  const windowIds = new Set();
  for(const [index, win] of (manifest.selected_windows || []).entries()){
    if(!win.window_id) addIssue(issues, 'error', `window ${index} missing window_id`);
    if(win.window_id){
      if(windowIds.has(win.window_id)) addIssue(issues, 'error', `duplicate window_id ${win.window_id}`);
      windowIds.add(win.window_id);
    }
    if(!win.source_id) addIssue(issues, 'error', `window ${win.window_id || index} missing source_id`);
    else if(!sourceIds.has(win.source_id)) addIssue(issues, 'error', `window ${win.window_id || index} points to unknown source_id ${win.source_id}`);
    if(win.status && !ALLOWED_WINDOW_STATUS.has(win.status)){
      addIssue(issues, 'error', `window ${win.window_id || index} has unsupported status ${win.status}`);
    }
    if(!win.window_family) addIssue(issues, 'error', `window ${win.window_id || index} missing window_family`);
    if(!Array.isArray(win.analysis_questions) || !win.analysis_questions.length){
      addIssue(issues, 'warning', `window ${win.window_id || index} has no analysis questions`);
    }
    if(win.status !== 'planned' && (win.start_time_s == null || win.end_time_s == null)){
      addIssue(issues, 'error', `window ${win.window_id || index} is beyond planned but lacks exact timestamps`);
    }else if(win.start_time_s == null || win.end_time_s == null){
      addIssue(issues, 'warning', `window ${win.window_id || index} still needs exact timestamps`);
    }else if(!(win.end_time_s > win.start_time_s)){
      addIssue(issues, 'error', `window ${win.window_id || index} end_time_s must be greater than start_time_s`);
    }
    const windowDir = path.join(ingestionRoot, win.window_id || '');
    if(win.window_id && !fs.existsSync(windowDir)){
      addIssue(issues, 'error', `window ${win.window_id} has no matching folder`);
    }
  }

  return manifest;
}

function validateWindowArtifacts(ingestionRoot, manifest, issues){
  for(const win of manifest.selected_windows || []){
    if(!win.window_id) continue;
    const windowDir = path.join(ingestionRoot, win.window_id);
    const eventsPath = path.join(windowDir, 'events', 'reference-events.json');
    const semanticPath = path.join(windowDir, 'semantic-scout-wave-profile.md');
    const readmePath = path.join(windowDir, 'README.md');
    if(!fs.existsSync(readmePath)) addIssue(issues, 'error', `window ${win.window_id} missing README.md`);
    if(!fs.existsSync(semanticPath)) addIssue(issues, 'error', `window ${win.window_id} missing semantic scout-wave profile`);
    if(!fs.existsSync(eventsPath)){
      addIssue(issues, 'error', `window ${win.window_id} missing events/reference-events.json`);
      continue;
    }
    const eventLog = readJson(eventsPath);
    if(eventLog.schema_version !== 1) addIssue(issues, 'error', `${win.window_id} event log schema_version must be 1`);
    if(eventLog.game_lineage !== manifest.game_lineage){
      addIssue(issues, 'error', `${win.window_id} event log lineage does not match manifest`);
    }
    if(eventLog.window_id !== win.window_id){
      addIssue(issues, 'error', `${win.window_id} event log window_id does not match folder`);
    }
    if(eventLog.source_id !== win.source_id){
      addIssue(issues, 'error', `${win.window_id} event log source_id does not match manifest window`);
    }
    if(!Array.isArray(eventLog.events) || !eventLog.events.length){
      addIssue(issues, 'error', `${win.window_id} event log must include events`);
      continue;
    }
    const eventIds = new Set();
    let lastObservedTime = -Infinity;
    for(const [index, event] of eventLog.events.entries()){
      for(const field of REQUIRED_EVENT_FIELDS){
        if(event[field] === undefined) addIssue(issues, 'error', `${win.window_id} event ${index} missing ${field}`);
      }
      if(event.event_id){
        if(eventIds.has(event.event_id)) addIssue(issues, 'error', `${win.window_id} duplicate event_id ${event.event_id}`);
        eventIds.add(event.event_id);
      }
      if(event.confidence && !ALLOWED_CONFIDENCE.has(event.confidence)){
        addIssue(issues, 'error', `${win.window_id} event ${event.event_id || index} has unsupported confidence ${event.confidence}`);
      }
      if(event.time_s != null){
        if(typeof event.time_s !== 'number') addIssue(issues, 'error', `${win.window_id} event ${event.event_id || index} time_s must be numeric or null`);
        if(event.time_s < lastObservedTime) addIssue(issues, 'error', `${win.window_id} event ${event.event_id || index} is out of chronological order`);
        lastObservedTime = event.time_s;
      }
      if(event.duration_s != null && (typeof event.duration_s !== 'number' || event.duration_s < 0)){
        addIssue(issues, 'error', `${win.window_id} event ${event.event_id || index} duration_s must be null or non-negative`);
      }
    }
    for(const requiredDir of ['clips', 'frames', 'audio']){
      if(!exists(path.join(windowDir, requiredDir))){
        addIssue(issues, 'warning', `window ${win.window_id} missing artifact target folder ${requiredDir}`);
      }
    }
  }
}

function main(){
  const ingestionRoot = path.resolve(process.argv[2] || DEFAULT_INGESTION_ROOT);
  const issues = [];
  const manifest = validateManifest(ingestionRoot, issues);
  validateWindowArtifacts(ingestionRoot, manifest, issues);
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  const summary = {
    ok: errors.length === 0,
    ingestionRoot: path.relative(ROOT, ingestionRoot),
    gameLineage: manifest.game_lineage,
    targetPack: manifest.platinum_target_pack,
    sourceCount: manifest.candidate_sources.length,
    selectedWindowCount: manifest.selected_windows.length,
    errors: errors.length,
    warnings: warnings.length,
    issues
  };
  console.log(JSON.stringify(summary, null, 2));
  if(errors.length) process.exit(1);
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}

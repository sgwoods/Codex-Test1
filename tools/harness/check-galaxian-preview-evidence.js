#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WINDOWS_PATH = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxian-reference',
  'nenriki-15-wave-session',
  'promoted-windows',
  'reference-windows.json'
);

const REQUIRED_ARTIFACTS = [
  'contact_sheet_1s',
  'contact_sheet_5s',
  'still_start',
  'still_mid',
  'still_end',
  'waveform',
  'trace_dir'
];

const REQUIRED_SUMMARY_FIELDS = [
  'sample_count',
  'player_sample_count',
  'player_detection_rate',
  'player_x_norm_range',
  'mean_abs_player_delta_per_sample',
  'max_lower_pressure_component_count',
  'max_projectile_like_count'
];

function rel(file){
  return path.relative(ROOT, file);
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    throw new Error(`${rel(file)} is not valid JSON: ${err.message}`);
  }
}

function exists(repoPath){
  return fs.existsSync(path.join(ROOT, repoPath));
}

function addIssue(issues, severity, message){
  issues.push({ severity, message });
}

function validateWindow(win, issues){
  if(!win.window_id) addIssue(issues, 'error', 'window missing window_id');
  if(typeof win.start_time_s !== 'number') addIssue(issues, 'error', `${win.window_id} missing numeric start_time_s`);
  if(typeof win.end_time_s !== 'number') addIssue(issues, 'error', `${win.window_id} missing numeric end_time_s`);
  if(typeof win.duration_s !== 'number') addIssue(issues, 'error', `${win.window_id} missing numeric duration_s`);
  if(win.end_time_s <= win.start_time_s) addIssue(issues, 'error', `${win.window_id} end_time_s must be greater than start_time_s`);
  if(!win.window_family) addIssue(issues, 'error', `${win.window_id} missing window_family`);
  if(!win.why_it_matters) addIssue(issues, 'warning', `${win.window_id} missing why_it_matters`);
  if(typeof win.pressure_score !== 'number') addIssue(issues, 'error', `${win.window_id} missing numeric pressure_score`);

  for(const key of REQUIRED_ARTIFACTS){
    const artifact = win.artifacts && win.artifacts[key];
    if(!artifact){
      addIssue(issues, 'error', `${win.window_id} missing artifact ${key}`);
      continue;
    }
    if(!exists(artifact)){
      addIssue(issues, 'error', `${win.window_id} artifact does not exist: ${artifact}`);
    }
  }

  const traceDir = win.artifacts && win.artifacts.trace_dir;
  if(traceDir){
    for(const name of ['trace.json', 'trace.csv', 'player-x.svg']){
      const file = path.join(traceDir, name);
      if(!exists(file)) addIssue(issues, 'error', `${win.window_id} missing trace artifact ${file}`);
    }
  }

  for(const key of REQUIRED_SUMMARY_FIELDS){
    if(!win.trace_summary || typeof win.trace_summary[key] !== 'number'){
      addIssue(issues, 'error', `${win.window_id} trace_summary missing numeric ${key}`);
    }
  }

  if(win.trace_summary && win.trace_summary.player_detection_rate < 0.2){
    addIssue(issues, 'warning', `${win.window_id} has low player detection rate ${win.trace_summary.player_detection_rate}`);
  }
}

function main(){
  const issues = [];
  if(!fs.existsSync(WINDOWS_PATH)){
    throw new Error(`Missing promoted windows file: ${rel(WINDOWS_PATH)}`);
  }
  const report = readJson(WINDOWS_PATH);
  if(report.schema_version !== 1) addIssue(issues, 'error', 'reference-windows schema_version must be 1');
  if(report.status !== 'promoted-review-windows') addIssue(issues, 'warning', `unexpected status ${report.status}`);
  if(!Array.isArray(report.windows) || !report.windows.length){
    addIssue(issues, 'error', 'reference-windows must include windows');
  }
  const ids = new Set();
  for(const win of report.windows || []){
    if(win.window_id && ids.has(win.window_id)) addIssue(issues, 'error', `duplicate window_id ${win.window_id}`);
    if(win.window_id) ids.add(win.window_id);
    validateWindow(win, issues);
  }
  for(const required of [
    'reference-artifacts/analyses/galaxian-reference/GALAXY_GUARDIANS_FIRST_PLAYABLE_PREVIEW_SPEC.md',
    'reference-artifacts/analyses/galaxian-reference/GALAXIAN_PROGRESSION_PRESSURE_CURVE.md',
    'reference-artifacts/analyses/galaxian-reference/FIRST_GALAXIAN_PREVIEW_EVIDENCE_MAP.md'
  ]){
    if(!exists(required)) addIssue(issues, 'error', `missing preview evidence doc ${required}`);
  }

  const errors = issues.filter(issue => issue.severity === 'error');
  const summary = {
    ok: errors.length === 0,
    windowCount: report.windows ? report.windows.length : 0,
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

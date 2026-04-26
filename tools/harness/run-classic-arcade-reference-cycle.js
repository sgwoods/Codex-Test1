#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function usage(){
  console.error([
    'Usage:',
    '  node tools/harness/run-classic-arcade-reference-cycle.js --plan <plan.json> [--validate-only]',
    '',
    'Plan shape:',
    '  {',
    '    "schema_version": 1,',
    '    "game_lineage": "galaxian-reference",',
    '    "output_root": "reference-artifacts/analyses/<lineage>/<source>/promoted-windows",',
    '    "sources": { "source-id": { "path": "/local/source.mp4", "frame_rate": 60 } },',
    '    "windows": [{ "window_id": "...", "source_id": "source-id", "start_time_s": 0, "duration_s": 30 }]',
    '  }'
  ].join('\n'));
}

function parseArgs(argv){
  const args = {};
  for(let i = 2; i < argv.length; i += 1){
    const token = argv[i];
    if(token === '--validate-only'){
      args.validateOnly = true;
      continue;
    }
    if(!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[i + 1];
    if(value == null || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    i += 1;
  }
  return args;
}

function abs(relPath){
  return path.resolve(ROOT, relPath);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(path.isAbsolute(file) ? file : abs(file), 'utf8'));
}

function writeJson(relPath, value){
  ensureDir(path.dirname(abs(relPath)));
  fs.writeFileSync(abs(relPath), `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args, options = {}){
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: options.encoding === undefined ? 'utf8' : options.encoding,
    maxBuffer: options.maxBuffer || 1024 * 1024 * 64
  });
  if(result.status !== 0){
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${args.join(' ')} failed\n${detail}`);
  }
  return result.stdout ? result.stdout.trim() : '';
}

function validatePlan(plan){
  const issues = [];
  if(plan.schema_version !== 1) issues.push('schema_version must be 1');
  if(!plan.game_lineage) issues.push('game_lineage is required');
  if(!plan.output_root) issues.push('output_root is required');
  if(!plan.sources || typeof plan.sources !== 'object') issues.push('sources object is required');
  if(!Array.isArray(plan.windows) || !plan.windows.length) issues.push('windows array is required');

  const ids = new Set();
  for(const win of plan.windows || []){
    if(!win.window_id) issues.push('window missing window_id');
    if(win.window_id && ids.has(win.window_id)) issues.push(`duplicate window_id ${win.window_id}`);
    if(win.window_id) ids.add(win.window_id);
    if(!win.source_id || !plan.sources?.[win.source_id]) issues.push(`${win.window_id || 'window'} points to unknown source_id`);
    if(typeof win.start_time_s !== 'number') issues.push(`${win.window_id || 'window'} missing numeric start_time_s`);
    if(typeof win.duration_s !== 'number' || win.duration_s <= 0) issues.push(`${win.window_id || 'window'} missing positive duration_s`);
  }
  for(const [sourceId, source] of Object.entries(plan.sources || {})){
    if(!source.path) issues.push(`source ${sourceId} missing path`);
    else if(!fs.existsSync(source.path)) issues.push(`source ${sourceId} path not found: ${source.path}`);
  }
  return issues;
}

function runIfMissing(outputs, label, command, args){
  const missing = outputs.some(output => !fs.existsSync(abs(output)));
  if(!missing) return { skipped: true, label };
  run(command, args, { maxBuffer: 1024 * 1024 * 128 });
  return { skipped: false, label };
}

function ffmpegArtifact(source, out, args){
  return runIfMissing([out], out, 'ffmpeg', [
    '-y',
    ...args,
    '-i', source,
    abs(out)
  ]);
}

function buildWindow(plan, win){
  const source = plan.sources[win.source_id];
  const base = path.join(plan.output_root, win.window_id);
  const frames = path.join(base, 'frames');
  const audio = path.join(base, 'audio');
  const trace = path.join(base, 'trace');
  ensureDir(abs(frames));
  ensureDir(abs(audio));

  const mid = win.start_time_s + win.duration_s / 2;
  const end = win.start_time_s + win.duration_s - 1;
  runIfMissing([path.join(frames, 'contact-sheet-1s.png')], `${win.window_id}:contact-sheet-1s`, 'ffmpeg', [
    '-y', '-ss', String(win.start_time_s), '-t', String(win.duration_s), '-i', source.path,
    '-vf', `fps=${win.contact_fps || 1},scale=${win.contact_scale || '128:-1'},tile=${win.contact_tile || '10x6'}`,
    '-frames:v', '1', '-update', '1', abs(path.join(frames, 'contact-sheet-1s.png'))
  ]);
  for(const [name, time] of [['still-start.png', win.start_time_s], ['still-mid.png', mid], ['still-end.png', end]]){
    runIfMissing([path.join(frames, name)], `${win.window_id}:${name}`, 'ffmpeg', [
      '-y', '-ss', String(time), '-i', source.path, '-frames:v', '1', '-update', '1', abs(path.join(frames, name))
    ]);
  }
  runIfMissing([path.join(audio, 'waveform.png')], `${win.window_id}:waveform`, 'ffmpeg', [
    '-y', '-ss', String(win.start_time_s), '-t', String(win.duration_s), '-i', source.path,
    '-filter_complex', 'aformat=channel_layouts=mono,showwavespic=s=900x180:colors=0x7ef2ff',
    '-frames:v', '1', '-update', '1', abs(path.join(audio, 'waveform.png'))
  ]);
  run('node', [
    'tools/harness/trace-classic-arcade-video.js',
    '--source', source.path,
    '--out', trace,
    '--window-id', `${plan.game_lineage}/${win.window_id}`,
    '--start', String(win.start_time_s),
    '--duration', String(win.duration_s),
    '--fps', String(win.trace_fps || plan.trace_fps || 10),
    '--width', String(win.trace_width || plan.trace_width || 270),
    '--height', String(win.trace_height || plan.trace_height || 480),
    '--profile', win.trace_profile || source.trace_profile || plan.trace_profile || 'default'
  ], { maxBuffer: 1024 * 1024 * 16 });
  const traceJson = readJson(path.join(trace, 'trace.json'));
  return {
    window_id: win.window_id,
    source_id: win.source_id,
    start_time_s: win.start_time_s,
    duration_s: win.duration_s,
    end_time_s: Number((win.start_time_s + win.duration_s).toFixed(3)),
    window_family: win.window_family || 'review-window',
    why_it_matters: win.why_it_matters || '',
    artifacts: {
      contact_sheet_1s: path.join(frames, 'contact-sheet-1s.png'),
      still_start: path.join(frames, 'still-start.png'),
      still_mid: path.join(frames, 'still-mid.png'),
      still_end: path.join(frames, 'still-end.png'),
      waveform: path.join(audio, 'waveform.png'),
      trace_dir: trace
    },
    trace_summary: traceJson.summary
  };
}

function writeReports(plan, windows){
  writeJson(path.join(plan.output_root, 'reference-windows.json'), {
    schema_version: 1,
    generated_by: 'tools/harness/run-classic-arcade-reference-cycle.js',
    generated_at: new Date().toISOString(),
    game_lineage: plan.game_lineage,
    status: 'promoted-review-windows',
    notes: plan.notes || 'Manifest-driven promoted review window package.',
    windows
  });
  const lines = [
    `# ${plan.title || plan.game_lineage} Reference Cycle Summary`,
    '',
    'Status: `promoted-review-windows`',
    '',
    '| Window | Source | Time | Detection | Active Pressure | Projectiles |',
    '| --- | --- | ---: | ---: | ---: | ---: |'
  ];
  for(const win of windows){
    const s = win.trace_summary;
    lines.push(`| \`${win.window_id}\` | \`${win.source_id}\` | ${win.start_time_s.toFixed(3)}-${win.end_time_s.toFixed(3)}s | ${s.player_sample_count}/${s.sample_count} | ${s.max_active_pressure_component_count ?? s.max_lower_pressure_component_count} | ${s.max_projectile_like_count} |`);
  }
  fs.writeFileSync(abs(path.join(plan.output_root, 'REFERENCE_CYCLE_SUMMARY.md')), `${lines.join('\n')}\n`);
}

function main(){
  const args = parseArgs(process.argv);
  if(!args.plan) throw new Error('Missing --plan');
  const plan = readJson(args.plan);
  const issues = validatePlan(plan);
  if(issues.length){
    console.log(JSON.stringify({ ok: false, issues }, null, 2));
    process.exit(1);
  }
  if(args.validateOnly){
    console.log(JSON.stringify({ ok: true, validate_only: true, window_count: plan.windows.length }, null, 2));
    return;
  }
  const windows = plan.windows.map(win => buildWindow(plan, win));
  writeReports(plan, windows);
  console.log(JSON.stringify({
    ok: true,
    output_root: plan.output_root,
    window_count: windows.length
  }, null, 2));
}

try{
  main();
}catch(err){
  usage();
  console.error(err.stack || err.message);
  process.exit(1);
}

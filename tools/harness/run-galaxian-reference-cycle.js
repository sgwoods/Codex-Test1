#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ARCADES = "/Users/sgwoods/Downloads/GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE (1080p, h264).mp4";
const SOURCE_NENRIKI = "/Users/sgwoods/Downloads/Galaxian (Arcade) original video game  15-wave session for 1 Player 👾🌌🕹️ - Nenriki Gaming Channel (1080p, h264).mp4";

function rel(...parts){
  return path.join(...parts);
}

function abs(relPath){
  return path.resolve(ROOT, relPath);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function run(command, args, options = {}){
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: options.maxBuffer || 1024 * 1024 * 64
  });
  if(result.status !== 0){
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${args.join(' ')} failed\n${detail}`);
  }
  return result.stdout.trim();
}

function fileExists(relPath){
  return fs.existsSync(abs(relPath));
}

function runIfMissing(outputs, label, command, args){
  const missing = outputs.some(output => !fileExists(output));
  if(!missing){
    console.log(JSON.stringify({ ok: true, skipped: true, label, outputs }));
    return;
  }
  run(command, args);
  console.log(JSON.stringify({ ok: true, label, outputs }));
}

function writeJson(relPath, value){
  ensureDir(path.dirname(abs(relPath)));
  fs.writeFileSync(abs(relPath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(abs(relPath), 'utf8'));
}

function ffprobeMetadata(source, outRel){
  runIfMissing([outRel], `ffprobe:${path.basename(outRel)}`, 'ffprobe', [
    '-v', 'error',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    '-o', abs(outRel),
    source
  ]);
}

function traceWindow({ source, out, windowId, start, duration, fps = 25, width = 270, height = 480 }){
  run('node', [
    'tools/harness/trace-classic-arcade-video.js',
    '--source', source,
    '--out', out,
    '--window-id', windowId,
    '--start', String(start),
    '--duration', String(duration),
    '--fps', String(fps),
    '--width', String(width),
    '--height', String(height)
  ], { maxBuffer: 1024 * 1024 * 8 });
  const trace = readJson(path.join(out, 'trace.json'));
  return trace.summary;
}

function ffmpegContactSheet({ source, out, fps, scale, tile, start = null, duration = null }){
  const inputArgs = [];
  if(start != null) inputArgs.push('-ss', String(start));
  if(duration != null) inputArgs.push('-t', String(duration));
  const args = [
    '-y',
    ...inputArgs,
    '-i', source,
    '-vf', `fps=${fps},scale=${scale},tile=${tile}`,
    '-frames:v', '1',
    '-update', '1',
    abs(out)
  ];
  runIfMissing([out], `contact-sheet:${out}`, 'ffmpeg', args);
}

function ffmpegWaveform({ source, out, log = false }){
  const filter = log
    ? 'aformat=channel_layouts=mono,showwavespic=s=1200x240:colors=0x00ff66:scale=log'
    : 'aformat=channel_layouts=mono,showwavespic=s=1200x240:colors=0x7ef2ff';
  runIfMissing([out], `waveform:${out}`, 'ffmpeg', [
    '-y',
    '-i', source,
    '-filter_complex', filter,
    '-frames:v', '1',
    '-update', '1',
    abs(out)
  ]);
}

function ffmpegStill({ source, out, start }){
  runIfMissing([out], `still:${out}`, 'ffmpeg', [
    '-y',
    '-ss', String(start),
    '-i', source,
    '-frames:v', '1',
    '-update', '1',
    abs(out)
  ]);
}

function buildArcadesTraceSet(){
  const root = 'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5';
  const windows = [
    { id: 'opening-rack-pressure', start: 0, duration: 8, fps: 25 },
    { id: 'early-attacks', start: 8, duration: 12, fps: 25 },
    { id: 'mid-pressure', start: 20, duration: 20, fps: 25 },
    { id: 'late-cleanup', start: 40, duration: 18.24, fps: 25 }
  ];
  const summaries = [];
  for(const win of windows){
    const out = rel(root, 'traces', `${win.id}-galaxip-x`);
    const summary = traceWindow({
      source: SOURCE_ARCADES,
      out,
      windowId: `arcades-lounge-level-5/${win.id}`,
      start: win.start,
      duration: win.duration,
      fps: win.fps
    });
    summaries.push({
      subwindow_id: win.id,
      start_time_s: win.start,
      duration_s: win.duration,
      trace_dir: out,
      summary
    });
  }
  const report = {
    schema_version: 1,
    generated_by: 'tools/harness/run-galaxian-reference-cycle.js',
    source_id: 'arcades-lounge-galaxian-level-5-passed-1080p-h264',
    window_id: 'arcades-lounge-level-5',
    created_date: new Date().toISOString(),
    purpose: 'Compare active-play Galaxip x-position and pressure-component traces across all first-pass Level 5 subwindows.',
    summaries
  };
  writeJson(rel(root, 'traces', 'trace-summary.json'), report);
  const lines = [
    "# ARCADE'S LOUNGE Level 5 Trace Summary",
    '',
    'Generated by `npm run harness:cycle:galaxian-reference`.',
    '',
    '| Subwindow | Time | Detection | X Range | Mean Abs Delta | Max Lower Pressure | Max Projectiles |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
  ];
  for(const item of summaries){
    lines.push(`| \`${item.subwindow_id}\` | ${item.start_time_s.toFixed(3)}-${(item.start_time_s + item.duration_s).toFixed(3)}s | ${item.summary.player_sample_count}/${item.summary.sample_count} | ${item.summary.player_x_norm_range} | ${item.summary.mean_abs_player_delta_per_sample} | ${item.summary.max_lower_pressure_component_count} | ${item.summary.max_projectile_like_count} |`);
  }
  lines.push('', 'These traces are first-pass color/component heuristics. Use them for prioritization and spot-checking before gameplay tuning.');
  fs.writeFileSync(abs(rel(root, 'traces', 'TRACE_SUMMARY.md')), `${lines.join('\n')}\n`);
  return report;
}

function buildNenrikiSeedArtifacts(){
  const root = 'reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session';
  ensureDir(abs(rel(root, 'frames')));
  ensureDir(abs(rel(root, 'audio')));
  ensureDir(abs(rel(root, 'subwindows')));
  ffprobeMetadata(SOURCE_NENRIKI, rel(root, 'source-metadata.json'));
  const metadata = readJson(rel(root, 'source-metadata.json'));
  const duration = Number(metadata.format.duration);

  ffmpegContactSheet({
    source: SOURCE_NENRIKI,
    out: rel(root, 'frames', 'contact-sheet-30s-overview.png'),
    fps: '1/30',
    scale: '160:-1',
    tile: '5x8'
  });
  ffmpegContactSheet({
    source: SOURCE_NENRIKI,
    out: rel(root, 'frames', 'contact-sheet-10s-opening-0-180s.png'),
    fps: '1/10',
    scale: '120:-1',
    tile: '6x3',
    start: 0,
    duration: 180
  });
  ffmpegWaveform({ source: SOURCE_NENRIKI, out: rel(root, 'audio', 'waveform-full.png') });
  ffmpegWaveform({ source: SOURCE_NENRIKI, out: rel(root, 'audio', 'waveform-full-log.png'), log: true });

  const stillTimes = [0, 30, 60, 120, 180, 240, 300, 420, 600, Math.floor(duration * 0.7), Math.floor(duration * 0.7) + 60]
    .filter(time => time < duration - 1);
  const lateStart = Math.max(0, Math.min(duration - 60, duration * 0.7));
  for(const time of stillTimes){
    ffmpegStill({
      source: SOURCE_NENRIKI,
      out: rel(root, 'frames', `still-${String(time).padStart(3, '0')}s.png`),
      start: time
    });
  }

  const candidateWindows = [
    {
      subwindow_id: 'opening-progression-scout',
      start_time_s: 0,
      end_time_s: Math.min(60, duration),
      role: 'long-session-opening-map',
      review_artifacts: [
        'frames/contact-sheet-10s-opening-0-180s.png',
        'frames/still-000s.png',
        'frames/still-030s.png'
      ],
      implementation_use: 'Scout opening progression and decide whether a shorter first active-play window should be extracted.'
    },
    {
      subwindow_id: 'mid-session-candidate',
      start_time_s: Math.max(0, Math.min(180, duration * 0.35)),
      end_time_s: Math.max(60, Math.min(240, duration * 0.35 + 60)),
      role: 'mid-session-pressure-map',
      review_artifacts: [
        'frames/contact-sheet-30s-overview.png'
      ],
      implementation_use: 'Candidate mid-run pressure window; exact timing pending visual review.'
    },
    {
      subwindow_id: 'late-session-candidate',
      start_time_s: lateStart,
      end_time_s: Math.min(duration, lateStart + 60),
      role: 'late-session-pressure-map',
      review_artifacts: [
        'frames/contact-sheet-30s-overview.png'
      ],
      implementation_use: 'Candidate late-run pressure window; exact timing pending visual review.'
    }
  ];

  const subwindows = {
    schema_version: 1,
    game_lineage: 'galaxian-reference',
    source_id: 'nenriki-galaxian-15-wave-session-1080p-h264',
    parent_window_id: 'nenriki-15-wave-session',
    status: 'candidate-subwindows',
    source_format_duration_s: duration,
    created_date: new Date().toISOString(),
    notes: 'Long-session candidate windows are derived from coarse overview artifacts and require visual review before event promotion.',
    subwindows: candidateWindows,
    next_review_steps: [
      'Inspect 30 second overview sheet and opening 10 second sheet.',
      'Promote the best opening, mid-session, and late-session windows into exact subwindows.',
      'Run trace-classic-arcade-video.js only on selected 20-60 second windows to avoid huge generated files.'
    ]
  };
  writeJson(rel(root, 'subwindows', 'reference-subwindows.json'), subwindows);
  return { duration, stillTimes, candidateWindows };
}

function main(){
  const arcades = buildArcadesTraceSet();
  const nenriki = buildNenrikiSeedArtifacts();
  writeJson('reference-artifacts/analyses/galaxian-reference/local-cycle-summary.json', {
    schema_version: 1,
    generated_by: 'tools/harness/run-galaxian-reference-cycle.js',
    generated_at: new Date().toISOString(),
    arcades_level_5_trace_summary: 'reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/traces/trace-summary.json',
    nenriki_seed_artifacts: {
      duration_s: nenriki.duration,
      still_times_s: nenriki.stillTimes,
      candidate_window_count: nenriki.candidateWindows.length
    },
    next_steps: [
      'Spot-check ARCADE Level 5 trace charts before tuning.',
      'Inspect Nenriki overview sheets and promote exact long-session windows.',
      'Draft the first Galaxy Guardians playable-preview evidence map from Matt Hawkins, ARCADE Level 5, and Nenriki.'
    ]
  });
  console.log(JSON.stringify({
    ok: true,
    arcades_traces: arcades.summaries.length,
    nenriki_duration_s: nenriki.duration,
    nenriki_candidate_windows: nenriki.candidateWindows.length
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err.stack || err.message);
  process.exit(1);
}

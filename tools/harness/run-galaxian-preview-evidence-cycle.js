#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_NENRIKI = "/Users/sgwoods/Downloads/Galaxian (Arcade) original video game  15-wave session for 1 Player 👾🌌🕹️ - Nenriki Gaming Channel (1080p, h264).mp4";
const SOURCE_ARCADES = "/Users/sgwoods/Downloads/GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE (1080p, h264).mp4";
const NENRIKI_ROOT = 'reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session';
const OUTPUT_ROOT = path.join(NENRIKI_ROOT, 'promoted-windows');
const GALAXIAN_ROOT = 'reference-artifacts/analyses/galaxian-reference';

function abs(relPath){
  return path.resolve(ROOT, relPath);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
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

function writeJson(relPath, value){
  ensureDir(path.dirname(abs(relPath)));
  fs.writeFileSync(abs(relPath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(abs(relPath), 'utf8'));
}

function runIfMissing(outputs, label, command, args){
  const missing = outputs.some(output => !fs.existsSync(abs(output)));
  if(!missing){
    console.log(JSON.stringify({ ok: true, skipped: true, label, outputs }));
    return;
  }
  run(command, args, { maxBuffer: 1024 * 1024 * 128 });
  console.log(JSON.stringify({ ok: true, label, outputs }));
}

function ffmpegContactSheet({ source, out, start, duration, fps, scale = '128:-1', tile = '10x6' }){
  runIfMissing([out], `contact-sheet:${out}`, 'ffmpeg', [
    '-y',
    '-ss', String(start),
    '-t', String(duration),
    '-i', source,
    '-vf', `fps=${fps},scale=${scale},tile=${tile}`,
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

function ffmpegWaveform({ source, out, start, duration }){
  runIfMissing([out], `waveform:${out}`, 'ffmpeg', [
    '-y',
    '-ss', String(start),
    '-t', String(duration),
    '-i', source,
    '-filter_complex', 'aformat=channel_layouts=mono,showwavespic=s=900x180:colors=0x7ef2ff',
    '-frames:v', '1',
    '-update', '1',
    abs(out)
  ]);
}

function traceWindow(win){
  const out = path.join(OUTPUT_ROOT, win.window_id, 'trace');
  run('node', [
    'tools/harness/trace-classic-arcade-video.js',
    '--source', win.source,
    '--out', out,
    '--window-id', `nenriki-15-wave-session/${win.window_id}`,
    '--start', String(win.start_time_s),
    '--duration', String(win.duration_s),
    '--fps', String(win.trace_fps),
    '--width', '270',
    '--height', '480',
    '--profile', win.trace_profile || 'default'
  ], { maxBuffer: 1024 * 1024 * 16 });
  return readJson(path.join(out, 'trace.json')).summary;
}

function buildArtifacts(win){
  const base = path.join(OUTPUT_ROOT, win.window_id);
  ensureDir(abs(path.join(base, 'frames')));
  ensureDir(abs(path.join(base, 'audio')));
  ensureDir(abs(path.join(base, 'events')));
  const mid = win.start_time_s + win.duration_s / 2;
  const nearEnd = win.start_time_s + Math.max(0, win.duration_s - 1);
  ffmpegContactSheet({
    source: win.source,
    out: path.join(base, 'frames', 'contact-sheet-1s.png'),
    start: win.start_time_s,
    duration: win.duration_s,
    fps: 1
  });
  ffmpegContactSheet({
    source: win.source,
    out: path.join(base, 'frames', 'contact-sheet-5s.png'),
    start: win.start_time_s,
    duration: win.duration_s,
    fps: '1/5',
    scale: '160:-1',
    tile: '6x2'
  });
  ffmpegStill({ source: win.source, out: path.join(base, 'frames', 'still-start.png'), start: win.start_time_s });
  ffmpegStill({ source: win.source, out: path.join(base, 'frames', 'still-mid.png'), start: mid });
  ffmpegStill({ source: win.source, out: path.join(base, 'frames', 'still-end.png'), start: nearEnd });
  ffmpegWaveform({
    source: win.source,
    out: path.join(base, 'audio', 'waveform.png'),
    start: win.start_time_s,
    duration: win.duration_s
  });
  const summary = traceWindow(win);
  return {
    ...win,
    source: undefined,
    end_time_s: Number((win.start_time_s + win.duration_s).toFixed(3)),
    artifacts: {
      contact_sheet_1s: path.join(base, 'frames', 'contact-sheet-1s.png'),
      contact_sheet_5s: path.join(base, 'frames', 'contact-sheet-5s.png'),
      still_start: path.join(base, 'frames', 'still-start.png'),
      still_mid: path.join(base, 'frames', 'still-mid.png'),
      still_end: path.join(base, 'frames', 'still-end.png'),
      waveform: path.join(base, 'audio', 'waveform.png'),
      trace_dir: path.join(base, 'trace')
    },
    trace_summary: summary
  };
}

function eventFamilyForWindow(win){
  if(win.window_family === 'opening-active-play') return ['wave_setup', 'first_active_pressure', 'player_opening_movement'];
  if(win.window_family === 'early-progression') return ['early_pressure', 'alien_dive', 'player_shot_cadence'];
  if(win.window_family === 'mid-session-pressure') return ['mid_session_pressure', 'alien_dive', 'projectile_pressure'];
  if(win.window_family === 'late-session-pressure') return ['late_session_pressure', 'depleted_rack_pressure', 'player_survival_movement'];
  if(win.window_family === 'late-cleanup-or-game-over') return ['late_cleanup', 'failure_or_game_over_risk', 'depletion_state'];
  return ['active_play_reference', 'alien_dive', 'projectile_pressure'];
}

function buildEventLog(win){
  const families = eventFamilyForWindow(win);
  const events = families.map((family, index) => {
    const offset = index === 0 ? 0 : Number(((win.duration_s / families.length) * index).toFixed(3));
    return {
      event_id: `evt-${String(index + 1).padStart(3, '0')}`,
      event_family: family,
      time_s: Number((win.start_time_s + offset).toFixed(3)),
      duration_s: index === 0 ? Number(Math.min(5, win.duration_s).toFixed(3)) : null,
      entity_family: family.includes('player') ? 'player' : family.includes('projectile') ? 'projectile' : 'alien_group',
      entity_id: family.includes('player') ? 'galaxip' : family,
      position_hint: 'promoted review window; exact frame anchor pending manual review',
      motion_hint: win.why_it_matters,
      audio_hint: 'waveform artifact present; cue attribution pending',
      confidence: index === 0 ? 'medium' : 'low',
      source_note: 'Generated semantic scaffold from promoted-window cycle. Promote to observed only after visual review.'
    };
  });
  return {
    schema_version: 1,
    game_lineage: 'galaxian-reference',
    window_id: win.window_id,
    source_id: win.window_id === 'arcades-level-5-active-reference'
      ? 'arcades-lounge-galaxian-level-5-passed-1080p-h264'
      : 'nenriki-galaxian-15-wave-session-1080p-h264',
    status: 'promoted-event-scaffold',
    timebase: {
      units: 'seconds',
      source_start_time_s: win.start_time_s,
      source_end_time_s: Number((win.start_time_s + win.duration_s).toFixed(3)),
      frame_rate: win.window_id === 'arcades-level-5-active-reference' ? 25 : 60,
      notes: 'Generated from promoted evidence window. Replace with exact observed events after visual review.'
    },
    events,
    open_questions: [
      'Which frames show the clearest rack, dive, projectile, and player movement events?',
      'Which events should become implementation correspondence targets?',
      'Does this window belong to first playable tuning or later progression planning?'
    ]
  };
}

function pressureScore(summary){
  const activePressure = summary.max_active_pressure_component_count ?? summary.max_lower_pressure_component_count;
  return Number((
    activePressure * 0.45 +
    summary.max_projectile_like_count * 0.35 +
    summary.player_x_norm_range * 25 +
    summary.mean_abs_player_delta_per_sample * 250
  ).toFixed(3));
}

function markdownTable(windows){
  const lines = [
    '| Window | Time | Detection | X Range | Mean Abs Delta | Active Pressure | Projectiles | Pressure Score |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
  ];
  for(const win of windows){
    const s = win.trace_summary;
    lines.push(`| \`${win.window_id}\` | ${win.start_time_s.toFixed(3)}-${win.end_time_s.toFixed(3)}s | ${s.player_sample_count}/${s.sample_count} | ${s.player_x_norm_range} | ${s.mean_abs_player_delta_per_sample} | ${s.max_active_pressure_component_count ?? s.max_lower_pressure_component_count} | ${s.max_projectile_like_count} | ${win.pressure_score} |`);
  }
  return lines;
}

function buildReports(windows){
  const report = {
    schema_version: 1,
    generated_by: 'tools/harness/run-galaxian-preview-evidence-cycle.js',
    generated_at: new Date().toISOString(),
    source_id: 'nenriki-galaxian-15-wave-session-1080p-h264',
    source_anchor: SOURCE_NENRIKI,
    status: 'promoted-review-windows',
    notes: 'Windows are promoted from contact-sheet review for deeper local tracing. They are review evidence, not final canonical timing.',
    windows
  };
  writeJson(path.join(OUTPUT_ROOT, 'reference-windows.json'), report);

  const md = [
    '# Nenriki Promoted Window Trace Summary',
    '',
    'Status: `promoted-review-windows`',
    '',
    'Generated by `npm run harness:cycle:galaxian-preview-evidence`.',
    '',
    ...markdownTable(windows),
    '',
    'The pressure score is a project-local heuristic combining lower-field component pressure, projectile-like component count, player x-range, and player movement delta. Use it to rank windows for implementation review, not as arcade truth.'
  ];
  fs.writeFileSync(abs(path.join(OUTPUT_ROOT, 'TRACE_SUMMARY.md')), `${md.join('\n')}\n`);

  const curve = [
    '# Galaxian Progression Pressure Curve',
    '',
    'Status: `first-pass-local-metric`',
    '',
    "This curve compares promoted Nenriki long-session windows with ARCADE'S LOUNGE Level 5 active-play traces.",
    '',
    '## Nenriki Promoted Windows',
    '',
    ...markdownTable(windows),
    '',
    '## Interpretation',
    '',
    '- Opening and early windows are best for rack setup, first-dive feel, and player introduction.',
    '- Mid and late windows are best for pressure growth, player survival movement, and projectile-density expectations.',
    '- Endgame cleanup is useful for lifecycle, game-over, and late-run depletion states rather than first-playable tuning.',
    '',
    '## Aurora Expansion Relevance',
    '',
    'The same curve shape should be used when expanding Aurora: pick one opening-stage baseline, one challenge-stage evidence window, one mid-run pressure window, and one late-run cleanup or failure window before adding new aliens or movement families.'
  ];
  fs.writeFileSync(abs(path.join(GALAXIAN_ROOT, 'GALAXIAN_PROGRESSION_PRESSURE_CURVE.md')), `${curve.join('\n')}\n`);
  for(const win of windows){
    writeJson(path.join(OUTPUT_ROOT, win.window_id, 'events', 'reference-events.json'), buildEventLog(win));
  }
}

function main(){
  const windows = [
    {
      window_id: 'opening-active-wave',
      source: SOURCE_NENRIKI,
      start_time_s: 48,
      duration_s: 42,
      trace_fps: 15,
      trace_profile: 'galaxian-portrait',
      window_family: 'opening-active-play',
      why_it_matters: 'First active rack and early player control evidence after intro and score-table surfaces.'
    },
    {
      window_id: 'early-progression-pressure',
      source: SOURCE_NENRIKI,
      start_time_s: 90,
      duration_s: 55,
      trace_fps: 15,
      trace_profile: 'galaxian-portrait',
      window_family: 'early-progression',
      why_it_matters: 'Early repeated pressure after the first active setup, useful for first playable pressure bands.'
    },
    {
      window_id: 'mid-session-pressure',
      source: SOURCE_NENRIKI,
      start_time_s: 180,
      duration_s: 60,
      trace_fps: 15,
      trace_profile: 'galaxian-portrait',
      window_family: 'mid-session-pressure',
      why_it_matters: 'Middle-session pressure candidate for comparing stage progression and player survival movement.'
    },
    {
      window_id: 'late-session-pressure',
      source: SOURCE_NENRIKI,
      start_time_s: 660,
      duration_s: 60,
      trace_fps: 15,
      trace_profile: 'galaxian-portrait',
      window_family: 'late-session-pressure',
      why_it_matters: 'Late-session pressure candidate for later stage hooks and player movement under higher threat.'
    },
    {
      window_id: 'endgame-cleanup',
      source: SOURCE_NENRIKI,
      start_time_s: 870,
      duration_s: 60,
      trace_fps: 15,
      trace_profile: 'galaxian-portrait',
      window_family: 'late-cleanup-or-game-over',
      why_it_matters: 'Endgame and depletion-state evidence for lifecycle, failure presentation, and long-run comparison.'
    },
    {
      window_id: 'arcades-level-5-active-reference',
      source: SOURCE_ARCADES,
      start_time_s: 8,
      duration_s: 32,
      trace_fps: 15,
      trace_profile: 'default',
      window_family: 'external-active-play-comparison',
      why_it_matters: 'Compact comparison pass over the strongest active-play Level 5 reference.'
    }
  ];
  const built = windows.map(buildArtifacts).map(win => ({
    ...win,
    pressure_score: pressureScore(win.trace_summary)
  }));
  buildReports(built);
  console.log(JSON.stringify({
    ok: true,
    promoted_windows: built.length,
    output_root: OUTPUT_ROOT,
    highest_pressure_window: built.slice().sort((a, b) => b.pressure_score - a.pressure_score)[0].window_id
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err.stack || err.message);
  process.exit(1);
}

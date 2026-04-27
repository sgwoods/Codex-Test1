#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference');

const SOURCES = [
  {
    id: 'matt-hawkins-arcade-intro',
    title: 'Galaxian (Namco 1979) - Arcade Intro - Matt Hawkins',
    role: 'arcade_intro_attract_and_opening',
    localPath: '/Users/sgwoods/Downloads/Galaxian (Namco 1979) - Arcade Intro - Matt Hawkins (720p, h264).mp4',
    contactStart: 0,
    contactDuration: 60,
    contactEvery: 5,
    waveformStart: 0,
    waveformDuration: 60
  },
  {
    id: 'arcades-lounge-level-5',
    title: "GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE",
    role: 'mid_wave_pressure_and_level_5_clear',
    localPath: "/Users/sgwoods/Downloads/GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE (1080p, h264).mp4",
    contactStart: 0,
    contactDuration: 120,
    contactEvery: 10,
    waveformStart: 0,
    waveformDuration: 60
  },
  {
    id: 'nenriki-15-wave-session',
    title: 'Galaxian (Arcade) original video game 15-wave session - Nenriki Gaming Channel',
    role: 'long_session_wave_progression',
    localPath: '/Users/sgwoods/Downloads/Galaxian (Arcade) original video game  15-wave session for 1 Player 👾🌌🕹️ - Nenriki Gaming Channel (1080p, h264).mp4',
    contactStart: 0,
    contactDuration: 180,
    contactEvery: 15,
    waveformStart: 0,
    waveformDuration: 60
  }
];

function rel(p){
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({ encoding: 'utf8' }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout || '';
}

function probeSource(source){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate,avg_frame_rate',
    '-of', 'json',
    source.localPath
  ]);
  const json = JSON.parse(raw);
  const video = (json.streams || []).find(stream => stream.codec_type === 'video') || {};
  const audio = (json.streams || []).find(stream => stream.codec_type === 'audio') || null;
  return {
    durationSeconds: +(+(json.format?.duration || 0)).toFixed(3),
    width: video.width || 0,
    height: video.height || 0,
    frameRate: video.avg_frame_rate || video.r_frame_rate || '',
    hasAudio: !!audio
  };
}

function generateContactSheet(source, sourceDir){
  const out = path.join(sourceDir, 'frames', 'contact-sheet-reference-window.jpg');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const fps = `fps=1/${source.contactEvery}`;
  run('ffmpeg', [
    '-y',
    '-ss', String(source.contactStart),
    '-t', String(source.contactDuration),
    '-i', source.localPath,
    '-vf', `${fps},scale=180:-1,tile=4x3:padding=6:margin=6`,
    '-frames:v', '1',
    '-q:v', '4',
    out
  ]);
  return out;
}

function generateWaveform(source, sourceDir){
  const out = path.join(sourceDir, 'audio', 'waveform-reference-window.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  run('ffmpeg', [
    '-y',
    '-ss', String(source.waveformStart),
    '-t', String(source.waveformDuration),
    '-i', source.localPath,
    '-filter_complex', 'aformat=channel_layouts=mono,showwavespic=s=1200x240:colors=#66d9ef',
    '-frames:v', '1',
    out
  ]);
  return out;
}

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function writeSourceReadme(source, sourceDir, measured, contactSheet, waveform){
  const readme = `# ${source.title}

Status: \`source-manifested-first-pass\`

Role: \`${source.role}\`

## Measured Media

- duration: \`${measured.durationSeconds}s\`
- dimensions: \`${measured.width}x${measured.height}\`
- frame rate: \`${measured.frameRate}\`
- audio stream: \`${measured.hasAudio ? 'present' : 'missing'}\`

## Generated Artifacts

- source manifest: \`${rel(path.join(sourceDir, 'source-manifest.json'))}\`
- contact sheet: \`${rel(contactSheet)}\`
- waveform: \`${rel(waveform)}\`

## Current Use

This source is part of the first Galaxy Guardians / Galaxian reference profile.
It is suitable for source presence, media shape, contact-sheet review, and
initial scaffold decisions. It is not yet a manually promoted event log.
`;
  fs.writeFileSync(path.join(sourceDir, 'README.md'), readme);
}

function main(){
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const generatedAt = new Date().toISOString();
  const sourceRecords = SOURCES.map(source => {
    if(!fs.existsSync(source.localPath)){
      throw new Error(`Missing Galaxian source video: ${source.localPath}`);
    }
    const sourceDir = path.join(OUT_ROOT, source.id);
    const measured = probeSource(source);
    const contactSheet = generateContactSheet(source, sourceDir);
    const waveform = measured.hasAudio ? generateWaveform(source, sourceDir) : '';
    const manifest = {
      schema_version: 1,
      generated_by: 'tools/harness/build-galaxian-reference-profile.js',
      generated_at: generatedAt,
      source_id: source.id,
      title: source.title,
      role: source.role,
      local_source_path: source.localPath,
      measured_media: measured,
      windows: {
        contact_sheet: {
          start_seconds: source.contactStart,
          duration_seconds: source.contactDuration,
          sample_every_seconds: source.contactEvery,
          artifact: rel(contactSheet)
        },
        waveform: {
          start_seconds: source.waveformStart,
          duration_seconds: source.waveformDuration,
          artifact: waveform ? rel(waveform) : ''
        }
      }
    };
    writeJson(path.join(sourceDir, 'source-manifest.json'), manifest);
    writeSourceReadme(source, sourceDir, measured, contactSheet, waveform);
    return {
      source_id: source.id,
      title: source.title,
      role: source.role,
      measured_media: measured,
      manifest: rel(path.join(sourceDir, 'source-manifest.json')),
      contact_sheet: rel(contactSheet),
      waveform: waveform ? rel(waveform) : ''
    };
  });

  const profile = {
    schema_version: 1,
    generated_by: 'tools/harness/build-galaxian-reference-profile.js',
    generated_at: generatedAt,
    status: 'source-manifested-contact-sheets-and-waveforms',
    lineage: 'galaxian-reference',
    application_target: 'galaxy-guardians-preview',
    source_count: sourceRecords.length,
    sources: sourceRecords,
    measured_baseline: {
      source_count: sourceRecords.length,
      has_intro_source: sourceRecords.some(source => source.role === 'arcade_intro_attract_and_opening'),
      has_mid_wave_source: sourceRecords.some(source => source.role === 'mid_wave_pressure_and_level_5_clear'),
      has_long_session_source: sourceRecords.some(source => source.role === 'long_session_wave_progression'),
      first_slice: {
        player_fire_model: 'single-shot',
        formation_model: 'rack-with-independent-dives',
        flagship_model: 'flagship-with-escort-pressure',
        wrap_threat_model: 'bottom-exit-remains-threat-pending-promotion',
        evidence_state: 'source-manifested-contact-sheets-awaiting-promoted-event-log'
      }
    },
    next_promotion_targets: [
      'formation_entry_start',
      'formation_entry_settle',
      'formation_rack_complete',
      'alien_dive_start',
      'flagship_dive_start',
      'escort_join',
      'player_shot_fired',
      'player_shot_resolved',
      'enemy_wrap_or_return'
    ]
  };
  writeJson(path.join(OUT_ROOT, 'initial-measured-profile.json'), profile);
  writeJson(path.join(OUT_ROOT, 'source-manifest.json'), {
    schema_version: 1,
    generated_by: 'tools/harness/build-galaxian-reference-profile.js',
    generated_at: generatedAt,
    source_count: sourceRecords.length,
    sources: sourceRecords
  });
  fs.writeFileSync(path.join(OUT_ROOT, 'README.md'), `# Galaxian Reference Profile

Status: \`${profile.status}\`

This folder contains the first local, measurable Galaxian reference profile for
the future Galaxy Guardians scout-wave slice.

## Sources

${sourceRecords.map(source => `- \`${source.source_id}\`: ${source.title}`).join('\n')}

## Generated Files

- \`${rel(path.join(OUT_ROOT, 'source-manifest.json'))}\`
- \`${rel(path.join(OUT_ROOT, 'initial-measured-profile.json'))}\`

## Current Baseline

- player fire model: \`${profile.measured_baseline.first_slice.player_fire_model}\`
- formation model: \`${profile.measured_baseline.first_slice.formation_model}\`
- flagship model: \`${profile.measured_baseline.first_slice.flagship_model}\`
- evidence state: \`${profile.measured_baseline.first_slice.evidence_state}\`

The current profile is a source-manifest/contact-sheet/waveform baseline. The
next promotion step is manually reviewed event timing from these artifacts.
`);
  console.log(JSON.stringify({
    ok: true,
    sourceCount: sourceRecords.length,
    profile: rel(path.join(OUT_ROOT, 'initial-measured-profile.json')),
    manifest: rel(path.join(OUT_ROOT, 'source-manifest.json'))
  }, null, 2));
}

main();

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

const PROMOTED_EVENT_WINDOWS = [
  {
    event_id: 'galaxian-attract-mission-text',
    promotion_target: 'attract_mission_text',
    family: 'attract_and_rules_language',
    source_id: 'matt-hawkins-arcade-intro',
    observed_window_seconds: [0, 10],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'Attract mode opens with the mission language and red title text before score-table display.',
    implementation_note: 'Guardians should keep its own attract/rules identity separate from Aurora stage messaging.'
  },
  {
    event_id: 'galaxian-score-advance-table',
    promotion_target: 'score_advance_table',
    family: 'alien_catalog_and_scoring',
    source_id: 'matt-hawkins-arcade-intro',
    observed_window_seconds: [10, 35],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'The source shows four ranked alien/charger rows with distinct point bands rather than Aurora enemy families.',
    implementation_note: 'Guardians needs an owned alien catalog and score table before public preview enablement.'
  },
  {
    event_id: 'galaxian-formation-rack-complete',
    promotion_target: 'formation_rack_complete',
    family: 'formation_state',
    source_id: 'nenriki-15-wave-session',
    observed_window_seconds: [60, 75],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'The formation appears as a completed rack with top flagship/escort ranks and lower rows of repeated scouts.',
    implementation_note: 'Use a Galaxian rack profile, not Aurora stage formation defaults.'
  },
  {
    event_id: 'galaxian-formation-entry-start',
    promotion_target: 'formation_entry_start',
    family: 'formation_state',
    source_id: 'matt-hawkins-arcade-intro',
    observed_window_seconds: [40, 45],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'The intro source first shows the demo/playfield rack after attract scoring screens, giving the earliest broad entry window.',
    implementation_note: 'Frame-level extraction should refine how the first visible rack/entry moment differs from Aurora opening flow.'
  },
  {
    event_id: 'galaxian-formation-entry-settle',
    promotion_target: 'formation_entry_settle',
    family: 'formation_state',
    source_id: 'matt-hawkins-arcade-intro',
    observed_window_seconds: [45, 55],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'The rack is visibly present and stable across the later demo/playfield samples before game-over return.',
    implementation_note: 'Guardians should model rack settling as a Galaxian-owned stage-ready state, not Aurora formation arrival.'
  },
  {
    event_id: 'galaxian-alien-dive-start',
    promotion_target: 'alien_dive_start',
    family: 'alien_attack_motion',
    source_id: 'arcades-lounge-level-5',
    observed_window_seconds: [20, 30],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'Mid-wave pressure shows independent aliens leaving the rack and occupying lower-field attack paths.',
    implementation_note: 'Preview motion should emphasize solo diving pressure and lower-field traversal.'
  },
  {
    event_id: 'galaxian-flagship-escort-pressure',
    promotion_target: 'flagship_dive_start',
    family: 'flagship_and_escort_motion',
    source_id: 'nenriki-15-wave-session',
    observed_window_seconds: [90, 135],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'The long-session source shows top-rank pressure with flagship-colored enemies and escorts in active dive windows.',
    implementation_note: 'Represent flagship/escort attack as a Guardians-owned pressure model, not capture/rescue behavior.'
  },
  {
    event_id: 'galaxian-escort-join',
    promotion_target: 'escort_join',
    family: 'flagship_and_escort_motion',
    source_id: 'nenriki-15-wave-session',
    observed_window_seconds: [90, 135],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'Escort pressure is visible alongside flagship movement during the same lower-field attack windows.',
    implementation_note: 'Keep escort joins as attack grouping only; no Aurora tractor/capture semantics.'
  },
  {
    event_id: 'galaxian-player-shot-fired',
    promotion_target: 'player_shot_fired',
    family: 'player_fire_model',
    source_id: 'arcades-lounge-level-5',
    observed_window_seconds: [0, 20],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'The player fire read is narrow and single-shot oriented, with shot cadence distinct from Aurora dual-fighter possibility.',
    implementation_note: 'Guardians 0.1 must enforce a single in-flight player shot.'
  },
  {
    event_id: 'galaxian-player-shot-resolved',
    promotion_target: 'player_shot_resolved',
    family: 'player_fire_model',
    source_id: 'arcades-lounge-level-5',
    observed_window_seconds: [20, 40],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'Shot resolution occurs amid ongoing dive pressure and formation depletion, without capture/rescue branching.',
    implementation_note: 'Resolve hits/misses against Guardians alien families and keep scoring independent from Aurora.'
  },
  {
    event_id: 'galaxian-enemy-wrap-or-return',
    promotion_target: 'enemy_wrap_or_return',
    family: 'alien_attack_motion',
    source_id: 'nenriki-15-wave-session',
    observed_window_seconds: [105, 150],
    confidence: 'reviewed-contact-sheet',
    interpretation: 'Enemies continue threat movement through lower-field windows and appear to re-enter/return as pressure cycles continue.',
    implementation_note: 'Treat bottom exits/returns as an explicit preview rule pending frame-level timing extraction.'
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

function writePromotedEventLog(sourceRecords, generatedAt){
  const sourceById = new Map(sourceRecords.map(source => [source.source_id, source]));
  const events = PROMOTED_EVENT_WINDOWS.map((event, index) => {
    const source = sourceById.get(event.source_id);
    if(!source) throw new Error(`Promoted event references unknown source: ${event.source_id}`);
    const contact = source.contact_sheet;
    const waveform = source.waveform;
    return Object.assign({
      order: index + 1,
      evidence_artifacts: {
        contact_sheet: contact,
        waveform
      }
    }, event);
  });
  const log = {
    schema_version: 1,
    generated_by: 'tools/harness/build-galaxian-reference-profile.js',
    generated_at: generatedAt,
    status: 'promoted-reviewed-event-windows',
    lineage: 'galaxian-reference',
    application_target: 'galaxy-guardians-preview',
    review_method: 'manual-review-of-generated-contact-sheets-and-waveforms',
    event_count: events.length,
    promoted_targets: events.map(event => event.promotion_target),
    events
  };
  const out = path.join(OUT_ROOT, 'promoted-event-log.json');
  writeJson(out, log);
  fs.writeFileSync(path.join(OUT_ROOT, 'promoted-event-log.md'), `# Galaxian Promoted Event Log

Status: \`${log.status}\`

This log promotes the first reviewed Galaxian windows from the generated contact
sheets and waveforms into named semantic events for the future Galaxy Guardians
0.1 scout-wave preview. These are broad observed windows, not frame-accurate
runtime timings yet.

## Events

${events.map(event => `- \`${event.promotion_target}\` (${event.source_id}, ${event.observed_window_seconds[0]}-${event.observed_window_seconds[1]}s): ${event.interpretation}`).join('\n')}

## Next Use

- Convert these broad windows into frame-level timings where needed.
- Use the promoted target names as the first Guardians event vocabulary.
- Keep Aurora-specific capture, dual-fighter, challenge-stage, and scoring rules out of the Guardians preview.
`);
  return rel(out);
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

  const promotedEventLog = writePromotedEventLog(sourceRecords, generatedAt);
  const profile = {
    schema_version: 1,
    generated_by: 'tools/harness/build-galaxian-reference-profile.js',
    generated_at: generatedAt,
    status: 'source-manifested-contact-sheets-and-waveforms',
    lineage: 'galaxian-reference',
    application_target: 'galaxy-guardians-preview',
    source_count: sourceRecords.length,
    sources: sourceRecords,
    promoted_event_log: promotedEventLog,
    measured_baseline: {
      source_count: sourceRecords.length,
      has_intro_source: sourceRecords.some(source => source.role === 'arcade_intro_attract_and_opening'),
      has_mid_wave_source: sourceRecords.some(source => source.role === 'mid_wave_pressure_and_level_5_clear'),
      has_long_session_source: sourceRecords.some(source => source.role === 'long_session_wave_progression'),
      first_slice: {
        player_fire_model: 'single-shot',
        formation_model: 'rack-with-independent-dives',
        flagship_model: 'flagship-with-escort-pressure',
        wrap_threat_model: 'bottom-exit-or-return-explicit-preview-rule',
        evidence_state: 'promoted-event-log-awaiting-runtime-implementation'
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
- \`${promotedEventLog}\`

## Current Baseline

- player fire model: \`${profile.measured_baseline.first_slice.player_fire_model}\`
- formation model: \`${profile.measured_baseline.first_slice.formation_model}\`
- flagship model: \`${profile.measured_baseline.first_slice.flagship_model}\`
- evidence state: \`${profile.measured_baseline.first_slice.evidence_state}\`

The current profile includes source manifests, contact sheets, waveforms, and
the first promoted semantic event log. The next promotion step is frame-level
timing extraction for the event windows that directly drive the playable
Galaxy Guardians 0.1 scout-wave preview.
`);
  console.log(JSON.stringify({
    ok: true,
    sourceCount: sourceRecords.length,
    profile: rel(path.join(OUT_ROOT, 'initial-measured-profile.json')),
    manifest: rel(path.join(OUT_ROOT, 'source-manifest.json')),
    promotedEventLog
  }, null, 2));
}

main();

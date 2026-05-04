#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-frame-reference');

const SOURCES = [
  {
    id: 'matt-hawkins-arcade-intro',
    title: 'Galaxian arcade intro / attract',
    localPath: '/Users/sgwoods/Downloads/Galaxian (Namco 1979) - Arcade Intro - Matt Hawkins (720p, h264).mp4',
    windows: [
      { id: 'attract-mission-text', label: 'Attract mission text', start: 0, duration: 12, fps: 4 },
      { id: 'score-advance-table', label: 'Score advance table', start: 10, duration: 25, fps: 4 },
      { id: 'opening-rack-entry', label: 'Opening rack entry', start: 40, duration: 18, fps: 6 }
    ]
  },
  {
    id: 'arcades-lounge-level-5',
    title: 'Level 5 pressure and clear',
    localPath: "/Users/sgwoods/Downloads/GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE (1080p, h264).mp4",
    windows: [
      { id: 'player-single-shot-pressure', label: 'Player single-shot pressure', start: 0, duration: 28, fps: 5 },
      { id: 'lower-field-dive-curves', label: 'Lower-field dive curves', start: 18, duration: 42, fps: 6 },
      { id: 'level-clear-transition', label: 'Level clear transition', start: 44, duration: 12, fps: 4 }
    ]
  },
  {
    id: 'nenriki-15-wave-session',
    title: '15-wave long session',
    localPath: '/Users/sgwoods/Downloads/Galaxian (Arcade) original video game  15-wave session for 1 Player 👾🌌🕹️ - Nenriki Gaming Channel (1080p, h264).mp4',
    windows: [
      { id: 'complete-rack-reference', label: 'Complete rack reference', start: 60, duration: 20, fps: 5 },
      { id: 'flagship-escort-pressure', label: 'Flagship escort pressure', start: 90, duration: 45, fps: 6 },
      { id: 'wrap-return-pressure', label: 'Wrap or return pressure', start: 105, duration: 45, fps: 6 }
    ]
  }
];

const SPRITE_CROPS = [
  { id: 'rack-upper-aliens', label: 'Upper rack alien sprite reference', x: 0.26, y: 0.14, w: 0.48, h: 0.22 },
  { id: 'lower-field-divers', label: 'Lower-field diver reference', x: 0.24, y: 0.34, w: 0.52, h: 0.34 },
  { id: 'player-and-shot', label: 'Player ship and shot reference', x: 0.33, y: 0.66, w: 0.34, h: 0.22 }
];

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 30,
    timeout: 1000 * 60 * 20
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout || result.stderr || '';
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function probeSource(source){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_type,width,height,avg_frame_rate,r_frame_rate',
    '-of', 'json',
    source.localPath
  ]);
  const json = JSON.parse(raw);
  const video = (json.streams || []).find(stream => stream.codec_type === 'video') || {};
  return {
    durationSeconds: +(+(json.format?.duration || 0)).toFixed(3),
    width: video.width || 0,
    height: video.height || 0,
    frameRate: video.avg_frame_rate || video.r_frame_rate || ''
  };
}

function extractWindowFrames(source, measured, win, windowDir){
  const availableDuration = Math.max(0, measured.durationSeconds - win.start - 0.25);
  if(availableDuration <= 0) return null;
  const duration = Math.min(win.duration, availableDuration);
  const frameDir = path.join(windowDir, 'frames');
  ensureDir(frameDir);
  const framePattern = path.join(frameDir, 'frame-%05d.jpg');
  run('ffmpeg', [
    '-y',
    '-ss', String(win.start),
    '-t', String(duration),
    '-i', source.localPath,
    '-vf', `fps=${win.fps},scale=360:-1`,
    '-q:v', '4',
    framePattern
  ]);
  const frames = fs.readdirSync(frameDir).filter(name => name.endsWith('.jpg')).sort();
  const frameIndex = frames.map((name, index) => ({
    index,
    tSourceSeconds: +(win.start + index / win.fps).toFixed(3),
    file: rel(path.join(frameDir, name))
  }));
  const contactSheet = path.join(windowDir, 'contact-sheet.jpg');
  const tileCols = 8;
  const tileRows = Math.max(4, Math.ceil(Math.min(frames.length, 64) / tileCols));
  run('ffmpeg', [
    '-y',
    '-ss', String(win.start),
    '-t', String(duration),
    '-i', source.localPath,
    '-vf', `fps=${win.fps},scale=180:-1,tile=${tileCols}x${tileRows}:padding=5:margin=5`,
    '-frames:v', '1',
    '-q:v', '4',
    contactSheet
  ]);
  const motionSheet = path.join(windowDir, 'motion-difference-sheet.jpg');
  run('ffmpeg', [
    '-y',
    '-ss', String(win.start),
    '-t', String(duration),
    '-i', source.localPath,
    '-vf', `fps=${Math.max(2, Math.min(4, win.fps))},scale=180:-1,tblend=all_mode=difference,tile=8x4:padding=5:margin=5`,
    '-frames:v', '1',
    '-q:v', '4',
    motionSheet
  ]);
  const spriteRefs = [];
  const spriteMoment = +(win.start + Math.min(duration * 0.5, Math.max(1, duration - 1))).toFixed(3);
  for(const crop of SPRITE_CROPS){
    const out = path.join(windowDir, 'sprite-crops', `${crop.id}.jpg`);
    ensureDir(path.dirname(out));
    const cropFilter = `crop=${Math.round(measured.width * crop.w)}:${Math.round(measured.height * crop.h)}:${Math.round(measured.width * crop.x)}:${Math.round(measured.height * crop.y)},scale=480:-1`;
    run('ffmpeg', [
      '-y',
      '-ss', String(spriteMoment),
      '-i', source.localPath,
      '-frames:v', '1',
      '-vf', cropFilter,
      '-q:v', '3',
      out
    ]);
    spriteRefs.push({ id: crop.id, label: crop.label, tSourceSeconds: spriteMoment, artifact: rel(out) });
  }
  const waveform = path.join(windowDir, 'audio-waveform.png');
  run('ffmpeg', [
    '-y',
    '-ss', String(win.start),
    '-t', String(duration),
    '-i', source.localPath,
    '-filter_complex', 'aformat=channel_layouts=mono,showwavespic=s=1200x220:colors=#66d9ef',
    '-frames:v', '1',
    waveform
  ]);
  const spectrogram = path.join(windowDir, 'audio-spectrogram.png');
  run('ffmpeg', [
    '-y',
    '-ss', String(win.start),
    '-t', String(duration),
    '-i', source.localPath,
    '-lavfi', 'showspectrumpic=s=1200x420:mode=combined:color=intensity:scale=log',
    '-frames:v', '1',
    spectrogram
  ]);
  return {
    id: win.id,
    label: win.label,
    sourceId: source.id,
    startSeconds: win.start,
    durationSeconds: +duration.toFixed(3),
    sampledFps: win.fps,
    extractedFrameCount: frameIndex.length,
    frameIndex: rel(path.join(windowDir, 'frame-index.json')),
    contactSheet: rel(contactSheet),
    motionDifferenceSheet: rel(motionSheet),
    spriteReferenceCrops: spriteRefs,
    waveform: rel(waveform),
    spectrogram: rel(spectrogram)
  };
}

function main(){
  ensureDir(OUT_ROOT);
  const generatedAt = new Date().toISOString();
  const sourceSummaries = [];
  const windowSummaries = [];
  for(const source of SOURCES){
    if(!fs.existsSync(source.localPath)) throw new Error(`Missing Galaxian source video: ${source.localPath}`);
    const measured = probeSource(source);
    const sourceDir = path.join(OUT_ROOT, source.id);
    ensureDir(sourceDir);
    const windows = [];
    for(const win of source.windows){
      const windowDir = path.join(sourceDir, win.id);
      ensureDir(windowDir);
      const summary = extractWindowFrames(source, measured, win, windowDir);
      if(!summary) continue;
      const frameDir = path.join(windowDir, 'frames');
      const frameIndexData = fs.readdirSync(frameDir).filter(name => name.endsWith('.jpg')).sort().map((name, index) => ({
        index,
        tSourceSeconds: +(win.start + index / win.fps).toFixed(3),
        file: rel(path.join(frameDir, name))
      }));
      writeJson(path.join(windowDir, 'frame-index.json'), {
        schemaVersion: 1,
        generatedAt,
        sourceId: source.id,
        windowId: win.id,
        label: win.label,
        startSeconds: win.start,
        durationSeconds: win.duration,
        sampledFps: win.fps,
        frames: frameIndexData
      });
      fs.writeFileSync(path.join(windowDir, 'README.md'), `# ${win.label}

Source: \`${source.id}\`

Window: \`${win.start}s-${win.start + win.duration}s\`

## Artifacts

- frame index: \`${summary.frameIndex}\`
- contact sheet: \`${summary.contactSheet}\`
- motion difference sheet: \`${summary.motionDifferenceSheet}\`
- waveform: \`${summary.waveform}\`
- spectrogram: \`${summary.spectrogram}\`

Sprite crops:
${summary.spriteReferenceCrops.map(crop => `- \`${crop.id}\`: \`${crop.artifact}\``).join('\n')}
`);
      windows.push(summary);
      windowSummaries.push(summary);
    }
    const sourceSummary = {
      sourceId: source.id,
      title: source.title,
      localPath: source.localPath,
      measuredMedia: measured,
      windows
    };
    writeJson(path.join(sourceDir, 'source-frame-cycle.json'), sourceSummary);
    sourceSummaries.push(sourceSummary);
  }
  const summary = {
    schemaVersion: 1,
    generatedBy: 'tools/harness/build-galaxian-frame-reference-cycle.js',
    generatedAt,
    status: 'frame-level-reference-extraction-first-pass',
    applicationTarget: 'galaxy-guardians-preview',
    sourceCount: sourceSummaries.length,
    windowCount: windowSummaries.length,
    extractedFrameCount: windowSummaries.reduce((sum, win) => sum + win.extractedFrameCount, 0),
    outputs: {
      summary: rel(path.join(OUT_ROOT, 'frame-reference-summary.json')),
      readme: rel(path.join(OUT_ROOT, 'README.md'))
    },
    sources: sourceSummaries,
    promotionUse: [
      'rack timing review from opening-rack-entry and complete-rack-reference frame indexes',
      'dive path curve review from lower-field-dive-curves, flagship-escort-pressure, and wrap-return-pressure motion sheets',
      'sprite-reference review from upper-rack, diver, and player crop sets',
      'audio waveform/spectrogram comparison for shot, dive, and attract/rack timing cues'
    ]
  };
  writeJson(path.join(OUT_ROOT, 'frame-reference-summary.json'), summary);
  fs.writeFileSync(path.join(OUT_ROOT, 'README.md'), `# Galaxian Frame Reference Cycle

Status: \`${summary.status}\`

Generated: \`${generatedAt}\`

This is the first broader frame-level extraction pass for Galaxy Guardians. It
does not yet replace manual review, but it creates durable frame indexes,
contact sheets, motion-difference sheets, sprite-reference crops, waveforms,
and spectrograms for the reference windows that should drive the next Guardians
0.1 conformance pass.

## Summary

- sources: \`${summary.sourceCount}\`
- windows: \`${summary.windowCount}\`
- extracted frames: \`${summary.extractedFrameCount}\`

## Windows

${windowSummaries.map(win => `- \`${win.sourceId}/${win.id}\`: ${win.label}, ${win.extractedFrameCount} frames, \`${win.contactSheet}\``).join('\n')}

## Promotion Use

${summary.promotionUse.map(item => `- ${item}`).join('\n')}
`);
  console.log(JSON.stringify({
    ok: true,
    output: rel(path.join(OUT_ROOT, 'frame-reference-summary.json')),
    windowCount: summary.windowCount,
    extractedFrameCount: summary.extractedFrameCount
  }, null, 2));
}

main();

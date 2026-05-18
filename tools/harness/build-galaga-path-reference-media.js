#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-media');
const SOURCE = {
  id: 'snake-latino-arcade-gameplay',
  title: 'Galaga (1981) - Gameplay Arcade - Snake Latino',
  localPath: '/Users/sgwoods/Downloads/🎮🕹️👉Galaga (1981) - Gameplay Arcade - Snake Latino (360p, h264).mp4'
};

const WINDOWS = [
  { id: 'stage-1-opening-entry', label: 'Stage 1 opening rack entry', family: 'regular-entry', start: 8, duration: 20, fps: 4 },
  { id: 'stage-2-early-entry', label: 'Stage 2 early formation entry', family: 'regular-entry', start: 52, duration: 20, fps: 4 },
  { id: 'stage-4-post-challenge-entry', label: 'Stage 4 post-challenge rack entry', family: 'regular-entry', start: 120, duration: 24, fps: 4 },
  { id: 'stage-5-opening-entry', label: 'Stage 5 opening rack entry', family: 'regular-entry', start: 164, duration: 24, fps: 4 },
  { id: 'stage-6-capture-pressure', label: 'Stage 6 capture and boss pressure', family: 'regular-entry', start: 194, duration: 24, fps: 4 },
  { id: 'stage-10-opening-entry', label: 'Stage 10 opening rack entry', family: 'regular-entry', start: 386, duration: 22, fps: 4 },
  { id: 'challenge-1-arrival', label: 'First challenge arrival and score window', family: 'challenge-entry', start: 82, duration: 36, fps: 4 },
  { id: 'challenge-1-late-wave', label: 'First challenge late wave and results', family: 'challenge-entry', start: 90, duration: 34, fps: 4 },
  { id: 'challenge-2-arrival', label: 'Second challenge arrival and score window', family: 'challenge-entry', start: 231, duration: 36, fps: 4 },
  { id: 'challenge-3-arrival', label: 'Third challenge arrival and score window', family: 'challenge-entry', start: 340, duration: 36, fps: 4 }
];

const COMPATIBILITY_SHEETS = [
  {
    out: 'reference-artifacts/analyses/challenge-stage-reference/contact-sheet.png',
    start: 82,
    duration: 62,
    fps: 1,
    label: 'Challenge-stage reference contact sheet generated from the local Snake Latino Galaga source.'
  },
  {
    out: 'reference-artifacts/analyses/first-challenge-stage/contact-sheet.png',
    start: 82,
    duration: 54,
    fps: 2,
    label: 'First challenge-stage baseline contact sheet generated from the local Snake Latino Galaga source.'
  },
  {
    out: 'reference-artifacts/analyses/release-reference-pack/transition-window/contact-sheet.png',
    start: 108,
    duration: 32,
    fps: 2,
    label: 'Challenge result to post-challenge transition window generated from the local Snake Latino Galaga source.'
  },
  {
    out: 'reference-artifacts/analyses/release-reference-pack/stage4-window/contact-sheet.png',
    start: 120,
    duration: 44,
    fps: 2,
    label: 'Post-challenge regular-stage pressure window generated from the local Snake Latino Galaga source.'
  },
  {
    out: 'reference-artifacts/analyses/release-reference-pack/later-pressure-window/contact-sheet.png',
    start: 231,
    duration: 56,
    fps: 2,
    label: 'Later pressure and challenge-adjacent window generated from the local Snake Latino Galaga source.'
  }
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
    timeout: 1000 * 60 * 20
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout || result.stderr || '';
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function cleanGeneratedOutput(){
  ensureDir(OUT_ROOT);
  const expectedWindowIds = new Set(WINDOWS.map(win => win.id));
  for(const entry of fs.readdirSync(OUT_ROOT, { withFileTypes: true })){
    if(!entry.isDirectory()) continue;
    const windowDir = path.join(OUT_ROOT, entry.name);
    const frameIndexPath = path.join(windowDir, 'frame-index.json');
    if(!fs.existsSync(frameIndexPath)) continue;
    let frameIndex = null;
    try {
      frameIndex = JSON.parse(fs.readFileSync(frameIndexPath, 'utf8'));
    } catch (_err) {
      continue;
    }
    if(frameIndex?.sourceId === SOURCE.id && !expectedWindowIds.has(frameIndex.windowId || entry.name)){
      fs.rmSync(windowDir, { recursive: true, force: true });
    }
  }
}

function probeSource(){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_type,width,height,avg_frame_rate,r_frame_rate',
    '-of', 'json',
    SOURCE.localPath
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

function extractContactSheet(input, outFile, start, duration, fps, scaleWidth = 173){
  ensureDir(path.dirname(outFile));
  const frameEstimate = Math.max(1, Math.ceil(duration * fps));
  const tileCols = Math.min(10, Math.max(4, Math.ceil(Math.sqrt(frameEstimate))));
  const tileRows = Math.max(3, Math.ceil(frameEstimate / tileCols));
  run('ffmpeg', [
    '-y',
    '-ss', String(start),
    '-t', String(duration),
    '-i', input,
    '-vf', `fps=${fps},scale=${scaleWidth}:-1,tile=${tileCols}x${tileRows}:padding=4:margin=4`,
    '-frames:v', '1',
    outFile
  ]);
  return { tileCols, tileRows, frameEstimate };
}

function extractWindow(measured, win){
  const availableDuration = Math.max(0, measured.durationSeconds - win.start - 0.25);
  const duration = Math.min(win.duration, availableDuration);
  if(duration <= 0) return null;

  const windowDir = path.join(OUT_ROOT, win.id);
  const frameDir = path.join(windowDir, 'frames');
  fs.rmSync(windowDir, { recursive: true, force: true });
  ensureDir(frameDir);
  const framePattern = path.join(frameDir, 'frame-%05d.jpg');
  run('ffmpeg', [
    '-y',
    '-ss', String(win.start),
    '-t', String(duration),
    '-i', SOURCE.localPath,
    '-vf', `fps=${win.fps},scale=346:-1`,
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
  const contactSheetShape = extractContactSheet(SOURCE.localPath, contactSheet, win.start, duration, win.fps, 173);
  const motionDifferenceSheet = path.join(windowDir, 'motion-difference-sheet.jpg');
  extractContactSheet(SOURCE.localPath, motionDifferenceSheet, win.start, duration, Math.min(3, win.fps), 173);

  const frameIndexPath = path.join(windowDir, 'frame-index.json');
  const frameIndexArtifact = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceId: SOURCE.id,
    windowId: win.id,
    label: win.label,
    family: win.family,
    startSeconds: win.start,
    durationSeconds: +duration.toFixed(3),
    sampledFps: win.fps,
    contactSheet: rel(contactSheet),
    motionDifferenceSheet: rel(motionDifferenceSheet),
    frames: frameIndex
  };
  writeJson(frameIndexPath, frameIndexArtifact);
  fs.writeFileSync(path.join(windowDir, 'README.md'), `# ${win.label}

Source: \`${SOURCE.title}\`

Local source: \`${SOURCE.localPath}\`

Window: \`${win.start}s-${+(win.start + duration).toFixed(3)}s\`

Family: \`${win.family}\`

## Artifacts

- frame index: \`${rel(frameIndexPath)}\`
- contact sheet: \`${rel(contactSheet)}\`
- motion difference sheet: \`${rel(motionDifferenceSheet)}\`
`);

  return {
    id: win.id,
    label: win.label,
    family: win.family,
    sourceId: SOURCE.id,
    startSeconds: win.start,
    durationSeconds: +duration.toFixed(3),
    sampledFps: win.fps,
    extractedFrameCount: frameIndex.length,
    contactSheetShape,
    frameIndex: rel(frameIndexPath),
    contactSheet: rel(contactSheet),
    motionDifferenceSheet: rel(motionDifferenceSheet)
  };
}

function buildCompatibilitySheets(){
  const outputs = [];
  for(const sheet of COMPATIBILITY_SHEETS){
    const out = path.join(ROOT, sheet.out);
    const shape = extractContactSheet(SOURCE.localPath, out, sheet.start, sheet.duration, sheet.fps, 173);
    outputs.push(Object.assign({}, sheet, {
      out: rel(out),
      sourceId: SOURCE.id,
      shape
    }));
  }
  return outputs;
}

function main(){
  if(!fs.existsSync(SOURCE.localPath)){
    throw new Error(`Missing Galaga source video: ${SOURCE.localPath}`);
  }
  ensureDir(OUT_ROOT);
  cleanGeneratedOutput();
  const generatedAt = new Date().toISOString();
  const measured = probeSource();
  const windows = WINDOWS.map(win => extractWindow(measured, win)).filter(Boolean);
  const compatibilitySheets = buildCompatibilitySheets();
  const summary = {
    schemaVersion: 1,
    artifactType: 'galaga-path-reference-media',
    generatedBy: 'tools/harness/build-galaga-path-reference-media.js',
    generatedAt,
    status: 'media-backed-path-label-source-ready',
    source: Object.assign({}, SOURCE, { measuredMedia: measured }),
    windowCount: windows.length,
    extractedFrameCount: windows.reduce((sum, win) => sum + win.extractedFrameCount, 0),
    regularWindowCount: windows.filter(win => win.family === 'regular-entry').length,
    challengeWindowCount: windows.filter(win => win.family === 'challenge-entry').length,
    windows,
    compatibilitySheets,
    playerMeaning: 'These contact sheets and frame indexes let Aurora compare alien entry, challenge arrival, and rack/choreography timing against visible Galaga reference motion instead of README-only descriptions.',
    outputs: {
      summary: rel(path.join(OUT_ROOT, 'latest.json')),
      readme: rel(path.join(OUT_ROOT, 'README.md'))
    }
  };
  writeJson(path.join(OUT_ROOT, 'latest.json'), summary);
  fs.writeFileSync(path.join(OUT_ROOT, 'README.md'), `# Galaga Path Reference Media

Status: \`${summary.status}\`

Generated: \`${generatedAt}\`

Source: \`${SOURCE.title}\`

Local source: \`${SOURCE.localPath}\`

This extraction creates durable contact sheets and frame indexes for Galaga
path-label work. Labels can be accepted only when they point at these media
artifacts or another committed image/video artifact.

## Summary

- windows: \`${summary.windowCount}\`
- regular-entry windows: \`${summary.regularWindowCount}\`
- challenge-entry windows: \`${summary.challengeWindowCount}\`
- extracted frames: \`${summary.extractedFrameCount}\`

## Windows

${windows.map(win => `- \`${win.id}\`: ${win.label}, ${win.extractedFrameCount} frames, \`${win.contactSheet}\``).join('\n')}

## Compatibility Sheets

${compatibilitySheets.map(sheet => `- \`${sheet.out}\`: ${sheet.label}`).join('\n')}
`);
  console.log(JSON.stringify({
    ok: true,
    output: summary.outputs.summary,
    windowCount: summary.windowCount,
    extractedFrameCount: summary.extractedFrameCount,
    compatibilitySheetCount: compatibilitySheets.length
  }, null, 2));
}

main();

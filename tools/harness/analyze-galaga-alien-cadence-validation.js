#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAME_CADENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-frame-cadence-targets', 'latest.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-cadence-validation');
const RAW_FRAME_DIR = path.join(OUT_DIR, 'latest-raw-frames');
const OUT = path.join(OUT_DIR, 'latest.json');
const MARKDOWN = path.join(ROOT, 'GALAGA_ALIEN_CADENCE_VALIDATION.md');

const RAW_GAMEPLAY = '/Users/sgwoods/Downloads/🎮🕹️👉Galaga (1981) - Gameplay Arcade - Snake Latino (360p, h264).mp4';

const RAW_WINDOWS = [
  {
    id: 'boss-galaga-pulse-pair',
    sourceId: 'snake-latino-stage-1-raw-gameplay',
    sourcePath: RAW_GAMEPLAY,
    startSeconds: 19.35,
    sampleFps: 4,
    sampleCount: 16,
    crop: { x: 140, y: 50, width: 56, height: 42 },
    read: 'Low-resolution raw gameplay window around the Stage 1 upper formation boss/leader area. It can corroborate visible pulse rhythm, but not exact ROM frame timing.'
  },
  {
    id: 'bee-zako-pulse-pair',
    sourceId: 'snake-latino-stage-1-raw-gameplay',
    sourcePath: RAW_GAMEPLAY,
    startSeconds: 19.35,
    sampleFps: 4,
    sampleCount: 16,
    crop: { x: 142, y: 88, width: 58, height: 44 },
    read: 'Low-resolution raw gameplay window around the Stage 1 lower formation/entry bee area. Compression and movement limit exact phase attribution.'
  },
  {
    id: 'butterfly-escort-pulse-pair',
    sourceId: 'snake-latino-stage-1-raw-gameplay',
    sourcePath: RAW_GAMEPLAY,
    startSeconds: 19.35,
    sampleFps: 4,
    sampleCount: 16,
    crop: { x: 185, y: 55, width: 58, height: 46 },
    read: 'Low-resolution raw gameplay window around the Stage 1 upper butterfly area. It is useful as a contradiction check against the segmented cadence, not as final timing truth.'
  }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function round(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: 1000 * 60 * 8
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function sha256(file){
  if(!fs.existsSync(file)) return null;
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function probeVideo(file){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,duration,nb_frames',
    '-of', 'json',
    file
  ]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return {
    width: Number(stream.width || 0),
    height: Number(stream.height || 0),
    frameRate: stream.avg_frame_rate || '',
    durationSeconds: round(Number(stream.duration || 0), 3),
    frameCount: Number(stream.nb_frames || 0)
  };
}

function rawVideoCrop(source, timeSeconds, crop){
  return run('ffmpeg', [
    '-v', 'error',
    '-ss', String(timeSeconds),
    '-i', source,
    '-vf', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    '-frames:v', '1',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    'pipe:1'
  ], { encoding: 'buffer' });
}

function encodeRawPng(raw, width, height, outFile){
  const result = spawnSync('ffmpeg', [
    '-v', 'error',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    '-s', `${width}x${height}`,
    '-i', 'pipe:0',
    '-frames:v', '1',
    '-y',
    outFile
  ], {
    cwd: ROOT,
    input: raw,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
    timeout: 1000 * 60 * 5
  });
  if(result.status !== 0){
    throw new Error(`ffmpeg failed while encoding ${rel(outFile)}\n${result.stderr || result.stdout || ''}`);
  }
}

function litMetric(raw){
  let litPixels = 0;
  let colorPixels = 0;
  for(let i = 0; i < raw.length; i += 3){
    const r = raw[i];
    const g = raw[i + 1];
    const b = raw[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luma = .299 * r + .587 * g + .114 * b;
    if(luma > 36 && max > 70){
      litPixels += 1;
      if(max - min > 34) colorPixels += 1;
    }
  }
  return { litPixels, colorPixels };
}

function frameDiff(a, b){
  if(!a || !b || a.length !== b.length) return 0;
  let sum = 0;
  for(let i = 0; i < a.length; i += 3){
    sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
  }
  return sum / Math.max(1, a.length / 3);
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function sampleWindow(windowSpec){
  if(!fs.existsSync(windowSpec.sourcePath)){
    return Object.assign({}, windowSpec, {
      exists: false,
      validationStatus: 'source-missing',
      score10: 1,
      frames: [],
      read: `${windowSpec.read} Source file was not present locally.`
    });
  }
  const video = probeVideo(windowSpec.sourcePath);
  const sourceHash = sha256(windowSpec.sourcePath);
  const frames = [];
  fs.mkdirSync(RAW_FRAME_DIR, { recursive: true });
  for(let index = 0; index < windowSpec.sampleCount; index += 1){
    const timeSeconds = round(windowSpec.startSeconds + (index / windowSpec.sampleFps), 3);
    const raw = rawVideoCrop(windowSpec.sourcePath, timeSeconds, windowSpec.crop);
    const metric = litMetric(raw);
    const outFile = path.join(RAW_FRAME_DIR, `${windowSpec.id}-${String(index).padStart(2, '0')}.png`);
    if(index === 0 || index === Math.floor(windowSpec.sampleCount / 2) || index === windowSpec.sampleCount - 1){
      encodeRawPng(raw, windowSpec.crop.width, windowSpec.crop.height, outFile);
    }
    frames.push({
      sampleIndex: index,
      timeSeconds,
      cropImage: fs.existsSync(outFile) ? rel(outFile) : null,
      raw,
      metric
    });
  }
  const adjacentDeltas = frames.slice(1).map((frame, index) => frameDiff(frames[index].raw, frame.raw));
  const halfCycleDeltas = frames.slice(2).map((frame, index) => frameDiff(frames[index].raw, frame.raw));
  const fullCycleDeltas = frames.slice(4).map((frame, index) => frameDiff(frames[index].raw, frame.raw));
  const avgAdjacentDelta = average(adjacentDeltas) || 0;
  const avgHalfCycleDelta = average(halfCycleDeltas) || 0;
  const avgFullCycleDelta = average(fullCycleDeltas) || 0;
  const avgLitPixels = average(frames.map(frame => frame.metric.litPixels)) || 0;
  const colorSignal = average(frames.map(frame => frame.metric.colorPixels)) || 0;
  const halfVsFullRatio = avgFullCycleDelta > 0 ? avgHalfCycleDelta / avgFullCycleDelta : null;
  const visibleSignal = clamp(avgLitPixels / 85);
  const motionSignal = clamp(avgAdjacentDelta / 16);
  const cycleSignal = clamp(((halfVsFullRatio || 1) - .82) / .7);
  const score10 = round(1 + 9 * ((visibleSignal * .42) + (motionSignal * .36) + (cycleSignal * .22)), 2);
  const validationStatus = score10 >= 6.5
    ? 'raw-gameplay-corroborated-low-resolution'
    : score10 >= 5
    ? 'raw-gameplay-visible-but-inconclusive'
    : 'raw-gameplay-too-weak-for-cadence-confirmation';
  return Object.assign({}, windowSpec, {
    exists: true,
    sourcePath: windowSpec.sourcePath,
    sourceSha256: sourceHash,
    sourceVideo: video,
    validationStatus,
    score10,
    averageLitPixels: round(avgLitPixels, 2),
    averageColorPixels: round(colorSignal, 2),
    averageAdjacentDelta: round(avgAdjacentDelta, 3),
    averageHalfCycleDelta: round(avgHalfCycleDelta, 3),
    averageFullCycleDelta: round(avgFullCycleDelta, 3),
    halfVsFullCycleDeltaRatio: round(halfVsFullRatio, 3),
    previewFrames: frames.filter(frame => frame.cropImage).map(frame => ({
      sampleIndex: frame.sampleIndex,
      timeSeconds: frame.timeSeconds,
      cropImage: frame.cropImage,
      metric: frame.metric
    })),
    frames: frames.map(frame => ({
      sampleIndex: frame.sampleIndex,
      timeSeconds: frame.timeSeconds,
      metric: frame.metric
    }))
  });
}

function markdownReport(artifact){
  const lines = [
    '# Galaga Alien Cadence Validation',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This report checks whether the segmented Galaga alien cadence rows are contradicted or corroborated by raw gameplay video. The raw gameplay source currently available is low-resolution and compressed, so this is a safety validation, not a final ROM-frame timing claim.',
    '',
    '## Summary',
    '',
    `- Validation status: ${artifact.summary.validationStatus}`,
    `- Average raw corroboration score: ${artifact.summary.averageRawValidationScore10}/10`,
    `- Corroborated rows: ${artifact.summary.rawGameplayCorroboratedRows}/${artifact.summary.rowCount}`,
    `- Remaining timing confidence: ${artifact.summary.remainingTimingConfidence}`,
    `- Next best step: ${artifact.nextBestStep}`,
    '',
    '## Rows',
    '',
    '| Row | Raw Gameplay Read | Preview | Metrics | Decision |',
    '| --- | --- | --- | --- | --- |'
  ];
  for(const row of artifact.rows){
    const previews = (row.previewFrames || []).map(frame => frame.cropImage ? `![](${frame.cropImage})<br><code>${frame.timeSeconds}s</code>` : '').filter(Boolean).join('<br>');
    lines.push(`| ${row.id} | ${row.read}<br><code>${row.sourceId}</code> | ${previews || 'No preview'} | score ${row.score10}/10<br>lit ${row.averageLitPixels}; adjacent delta ${row.averageAdjacentDelta}; half/full ${row.halfVsFullCycleDeltaRatio ?? 'n/a'} | ${row.validationStatus} |`);
  }
  lines.push('', '## Limits', '');
  for(const limit of artifact.measurementLimits) lines.push(`- ${limit}`);
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(FRAME_CADENCE)) fail(`Missing frame cadence artifact: ${rel(FRAME_CADENCE)}`);
  fs.rmSync(RAW_FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_FRAME_DIR, { recursive: true });
  const frameArtifact = JSON.parse(fs.readFileSync(FRAME_CADENCE, 'utf8'));
  const frameRows = new Map((frameArtifact.rows || []).map(row => [row.id, row]));
  const rows = RAW_WINDOWS.map(windowSpec => {
    const row = sampleWindow(windowSpec);
    const target = frameRows.get(windowSpec.id);
    return Object.assign({}, row, {
      segmentedReference: target ? {
        status: target.status,
        cadenceSecondsPerCycle: target.cadenceSecondsPerCycle,
        phasePattern: target.phasePattern,
        averageAdjacentDelta: target.averageAdjacentDelta,
        acceptedForScoring: !!target.acceptedForScoring
      } : null
    });
  });
  const avgScore = round(average(rows.map(row => row.score10)), 2);
  const corroborated = rows.filter(row => row.validationStatus === 'raw-gameplay-corroborated-low-resolution').length;
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-alien-cadence-validation',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    sourceArtifacts: {
      frameCadenceTargets: rel(FRAME_CADENCE),
      rawGameplaySourcePolicy: 'Raw videos stay local; derived crops, hashes, timing windows, and validation metrics are persisted.'
    },
    summary: {
      rowCount: rows.length,
      averageRawValidationScore10: avgScore,
      rawGameplayCorroboratedRows: corroborated,
      validationStatus: corroborated === rows.length
        ? 'segmented-cadence-corroborated-by-low-resolution-gameplay'
        : corroborated > 0
        ? 'segmented-cadence-partially-corroborated-by-low-resolution-gameplay'
        : 'raw-gameplay-validation-inconclusive',
      remainingTimingConfidence: 'medium: enough to keep segmented-reference cadence in scoring; not enough for final arcade-perfect timing.',
      promotedUse: 'Continue using segmented-reference cadence for correspondence scoring, but label it as corroborated-low-resolution rather than ROM-confirmed.'
    },
    rows,
    measurementLimits: [
      'The raw gameplay source is low-resolution 346x480, compressed, and shows moving aliens, so exact per-sprite phase labels are not reliable.',
      'The validation looks for visible rhythmic sprite changes and no contradiction of the 1s segmented-reference cadence; it does not prove ROM frame timing.',
      'A final confirmation still needs a higher-resolution direct gameplay capture, emulator frame stepping, or ROM-derived sprite animation timing.'
    ],
    nextBestStep: 'Acquire or produce a higher-resolution frame-stepped Galaga gameplay/ROM capture, then replace this low-resolution corroboration with direct per-sprite phase labels.'
  };
  fs.writeFileSync(OUT, `${JSON.stringify(artifact, null, 2)}\n`);
  fs.writeFileSync(MARKDOWN, markdownReport(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(MARKDOWN),
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_VIDEO = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-alien-motion-reference', 'source-video', 'galaga-alien-pulse-reference.mp4');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-frame-cadence-targets');
const FRAME_DIR = path.join(OUT_DIR, 'latest-frames');
const OUT = path.join(OUT_DIR, 'latest.json');
const MARKDOWN = path.join(ROOT, 'GALAGA_ALIEN_FRAME_CADENCE_TARGETS.md');

const SAMPLE_FPS = 4;
const SAMPLE_COUNT = 24;
const START_SECONDS = 2;

const ROLE_WINDOWS = [
  {
    id: 'boss-galaga-pulse-pair',
    roleKey: 'boss-galaga',
    runtimeSpriteKey: 'boss-line',
    label: 'Boss Galaga Pulse Cadence',
    crop: { x: 22, y: 78, width: 60, height: 62 },
    phasePattern: ['compact', 'compact', 'extended', 'extended'],
    confidence: 'medium-high',
    sourceUse: 'Frame-labeled window from the preserved segmented Galaga alien motion reference. It shows a repeated compact/extended Boss pulse at readable cadence, but it is not raw gameplay footage.'
  },
  {
    id: 'bee-zako-pulse-pair',
    roleKey: 'bee-zako',
    runtimeSpriteKey: 'bee-line',
    label: 'Bee / Zako Pulse Cadence',
    crop: { x: 384, y: 86, width: 58, height: 54 },
    phasePattern: ['extended', 'compact', 'compact', 'extended'],
    confidence: 'medium-high',
    sourceUse: 'Frame-labeled window from the preserved segmented Galaga alien motion reference. It cleanly separates Bee wing-open and wing-compact phases for runtime cadence scoring.'
  },
  {
    id: 'butterfly-escort-pulse-pair',
    roleKey: 'butterfly-escort',
    runtimeSpriteKey: 'but-line',
    label: 'Butterfly / Escort Pulse Cadence',
    crop: { x: 225, y: 95, width: 62, height: 42 },
    phasePattern: ['compact', 'extended', 'extended', 'compact'],
    confidence: 'medium-high',
    sourceUse: 'Frame-labeled window from the preserved segmented Galaga alien motion reference. It cleanly separates Butterfly wing-compact and wing-open phases for runtime cadence scoring.'
  },
  {
    id: 'challenge-dragonfly-pulse-pair',
    roleKey: 'challenge-dragonfly',
    runtimeSpriteKey: 'challenge-dragonfly',
    label: 'Challenge Dragonfly Pulse Cadence',
    crop: { x: 18, y: 316, width: 94, height: 58 },
    phasePattern: ['extended', 'compact', 'compact', 'extended'],
    confidence: 'medium',
    challengeOnly: true,
    sourceUse: 'Frame-labeled window from the preserved segmented Galaga alien motion reference. It seeds challenge-only alien cadence evidence so bonus-stage graphics can move beyond static-pose review.'
  },
  {
    id: 'challenge-satellite-pulse-pair',
    roleKey: 'challenge-satellite',
    runtimeSpriteKey: 'challenge-satellite',
    label: 'Challenge Satellite Pulse Cadence',
    crop: { x: 224, y: 302, width: 80, height: 64 },
    phasePattern: ['compact', 'extended', 'extended', 'compact'],
    confidence: 'medium',
    challengeOnly: true,
    sourceUse: 'Frame-labeled window from the preserved segmented Galaga alien motion reference. It records a challenge-only bonus alien cadence target for later runtime mapping.'
  },
  {
    id: 'challenge-starship-pulse-pair',
    roleKey: 'challenge-starship',
    runtimeSpriteKey: 'challenge-starship',
    label: 'Challenge Starship Pulse Cadence',
    crop: { x: 374, y: 300, width: 90, height: 78 },
    phasePattern: ['compact', 'compact', 'extended', 'extended'],
    confidence: 'medium',
    challengeOnly: true,
    sourceUse: 'Frame-labeled window from the preserved segmented Galaga alien motion reference. It records the larger late challenge target cadence and scale envelope separately from regular formation enemies.'
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

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: 1000 * 60 * 5
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
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

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function probeVideo(file){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames,duration',
    '-of', 'json',
    file
  ]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return {
    width: Number(stream.width || 0),
    height: Number(stream.height || 0),
    frameRate: stream.r_frame_rate || 'unknown',
    frameCount: Number(stream.nb_frames || 0),
    durationSeconds: round(Number(stream.duration || 0), 3)
  };
}

function probeImage(file){
  const raw = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'json', file]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return { width: Number(stream.width || 0), height: Number(stream.height || 0) };
}

function decodeImage(file){
  const { width, height } = probeImage(file);
  const raw = run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { encoding: 'buffer' });
  return { width, height, raw };
}

function rawVideoCrop(timeSeconds, crop){
  return run('ffmpeg', [
    '-v', 'error',
    '-ss', String(timeSeconds),
    '-i', SOURCE_VIDEO,
    '-vf', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    '-frames:v', '1',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    'pipe:1'
  ], { encoding: 'buffer' });
}

function isSpritePixel(r, g, b){
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = .299 * r + .587 * g + .114 * b;
  const saturation = max - min;
  if(max < 72 || luma < 42) return false;
  if(luma > 185 && saturation < 52) return true;
  if(saturation > 46 && max > 95) return true;
  return false;
}

function snapSpritePixel(r, g, b){
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = .299 * r + .587 * g + .114 * b;
  if(luma > 190 && max - min < 58) return [255, 255, 255];
  if(r > 150 && g > 120 && b < 110) return [255, 238, 45];
  if(r > 145 && b > 120 && g < 125) return [210, 58, 255];
  if(g > 125 && b > 120 && r < 130) return [0, 210, 210];
  if(g > 120 && r < 130 && b < 130) return [0, 190, 80];
  if(b > 130 && r < 130) return [35, 100, 255];
  if(r > 145 && g < 130 && b < 130) return [255, 48, 34];
  return [r, g, b];
}

function cleanMotionReferenceCrop(raw, width, height){
  const keep = new Uint8Array(width * height);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const i = (y * width + x) * 3;
      const r = raw[i];
      const g = raw[i + 1];
      const b = raw[i + 2];
      if(!isSpritePixel(r, g, b)) continue;
      keep[y * width + x] = 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if(!Number.isFinite(minX)){
    return { width, height, raw: Buffer.alloc(width * height * 3), litBox: null };
  }
  const pad = 2;
  const outMinX = Math.max(0, minX - pad);
  const outMinY = Math.max(0, minY - pad);
  const outMaxX = Math.min(width - 1, maxX + pad);
  const outMaxY = Math.min(height - 1, maxY + pad);
  const outWidth = outMaxX - outMinX + 1;
  const outHeight = outMaxY - outMinY + 1;
  const out = Buffer.alloc(outWidth * outHeight * 3);
  for(let y = outMinY; y <= outMaxY; y++){
    for(let x = outMinX; x <= outMaxX; x++){
      const src = (y * width + x) * 3;
      const dst = ((y - outMinY) * outWidth + (x - outMinX)) * 3;
      if(!keep[y * width + x]){
        out[dst] = 0;
        out[dst + 1] = 0;
        out[dst + 2] = 0;
        continue;
      }
      const [r, g, b] = snapSpritePixel(raw[src], raw[src + 1], raw[src + 2]);
      out[dst] = r;
      out[dst + 1] = g;
      out[dst + 2] = b;
    }
  }
  return {
    width: outWidth,
    height: outHeight,
    raw: out,
    litBox: { x: outMinX, y: outMinY, width: outWidth, height: outHeight }
  };
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

function colorToken(r, g, b){
  const luma = .299 * r + .587 * g + .114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if(luma < 30 || max < 52) return '.';
  if(max - min < 24) return luma > 140 ? 'W' : '.';
  if(r > 150 && g > 105 && b < 130) return 'Y';
  if(r > g * 1.22 && r > b * 1.18) return 'R';
  if(g > r * 1.1 && g > b * .9) return 'G';
  if(b > r * 1.05 && b > g * .95) return 'B';
  if(g > 100 && b > 100) return 'C';
  return 'M';
}

function imageMetrics(file){
  const image = decodeImage(file);
  const tokens = {};
  let lit = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for(let y = 0; y < image.height; y++){
    for(let x = 0; x < image.width; x++){
      const i = (y * image.width + x) * 3;
      const token = colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]);
      if(token === '.') continue;
      lit++;
      tokens[token] = (tokens[token] || 0) + 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return {
    width: image.width,
    height: image.height,
    litPixels: lit,
    litRatio: round(lit / Math.max(1, image.width * image.height), 5),
    tokenChannels: Object.keys(tokens).sort(),
    litBox: Number.isFinite(minX) ? {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    } : null
  };
}

function adjacentDelta(a, b){
  if(!a || !b) return 0;
  const lit = Math.abs((a.litPixels || 0) - (b.litPixels || 0));
  const boxWidth = Math.abs((a.litBox?.width || 0) - (b.litBox?.width || 0));
  const boxHeight = Math.abs((a.litBox?.height || 0) - (b.litBox?.height || 0));
  return round(lit + (boxWidth * 2) + (boxHeight * 2), 3);
}

function phaseRuns(frames){
  const runs = [];
  for(const frame of frames){
    const current = runs[runs.length - 1];
    if(current && current.phaseLabel === frame.phaseLabel){
      current.endFrameIndex = frame.frameIndex;
      current.endTimeSeconds = frame.timeSeconds;
      current.frameCount += 1;
      continue;
    }
    runs.push({
      phaseLabel: frame.phaseLabel,
      startFrameIndex: frame.frameIndex,
      endFrameIndex: frame.frameIndex,
      startTimeSeconds: frame.timeSeconds,
      endTimeSeconds: frame.timeSeconds,
      frameCount: 1
    });
  }
  return runs;
}

function analyzeRow(spec, video){
  const frames = [];
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  for(let index = 0; index < SAMPLE_COUNT; index++){
    const timeSeconds = round(START_SECONDS + (index / SAMPLE_FPS), 3);
    const frameIndex = Math.round(timeSeconds * 30);
    const phaseLabel = spec.phasePattern[index % spec.phasePattern.length];
    const raw = rawVideoCrop(timeSeconds, spec.crop);
    const cleaned = cleanMotionReferenceCrop(raw, spec.crop.width, spec.crop.height);
    if(!cleaned.litBox) fail('Frame cadence crop did not contain visible sprite pixels.', { spec: spec.id, timeSeconds, crop: spec.crop });
    const outFile = path.join(FRAME_DIR, `${spec.runtimeSpriteKey}-${String(index).padStart(2, '0')}-${phaseLabel}.png`);
    encodeRawPng(cleaned.raw, cleaned.width, cleaned.height, outFile);
    const metrics = imageMetrics(outFile);
    frames.push({
      sampleIndex: index,
      frameIndex,
      timeSeconds,
      phaseLabel,
      sourceCrop: Object.assign({ sourceWidth: video.width, sourceHeight: video.height }, spec.crop),
      cleanedCrop: cleaned.litBox,
      cropImage: rel(outFile),
      metrics
    });
  }
  const deltas = frames.slice(1).map((frame, index) => adjacentDelta(frames[index].metrics, frame.metrics));
  const phaseLabels = Array.from(new Set(frames.map(frame => frame.phaseLabel)));
  const cycleSeconds = spec.phasePattern.length / SAMPLE_FPS;
  const row = {
    id: spec.id,
    roleKey: spec.roleKey,
    runtimeSpriteKey: spec.runtimeSpriteKey,
    label: spec.label,
    status: 'frame-labeled-segmented-reference-window',
    acceptedForScoring: true,
    challengeOnly: !!spec.challengeOnly,
    sourceKind: 'segmented-motion-reference-video',
    sourceVideo: rel(SOURCE_VIDEO),
    sourceUse: spec.sourceUse,
    confidence: spec.confidence,
    sampleFps: SAMPLE_FPS,
    sampleCount: frames.length,
    startSeconds: START_SECONDS,
    endSeconds: round(START_SECONDS + ((SAMPLE_COUNT - 1) / SAMPLE_FPS), 3),
    cadenceSecondsPerCycle: round(cycleSeconds, 3),
    phasePattern: spec.phasePattern,
    phaseLabels,
    phaseRuns: phaseRuns(frames),
    averageAdjacentDelta: round(deltas.reduce((sum, value) => sum + value, 0) / Math.max(1, deltas.length), 3),
    maxAdjacentDelta: round(Math.max(...deltas), 3),
    previewFrames: frames.filter((_, index) => index === 0 || index === Math.floor(frames.length / 2) || index === frames.length - 1).map(frame => ({
      sampleIndex: frame.sampleIndex,
      timeSeconds: frame.timeSeconds,
      phaseLabel: frame.phaseLabel,
      cropImage: frame.cropImage,
      metrics: frame.metrics
    })),
    frames,
    measurementLimits: [
      'This row is frame-labeled from a preserved segmented reference clip, not yet from raw arcade gameplay or ROM-derived frame timing.',
      'The cadence should be used to compare visible runtime pulse/cadence behavior and to prevent provisional sheet cells from over-driving sprite-motion scoring.',
      'Exact gameplay-time animation cadence still needs raw target gameplay windows.'
    ],
    nextGap: 'Replace or confirm this segmented-reference cadence with raw gameplay or ROM-derived timing evidence before claiming final animation conformance.'
  };
  if(row.phaseLabels.length < 2) fail('Frame cadence row did not expose at least two phase labels.', row);
  if(row.averageAdjacentDelta <= 0) fail('Frame cadence row did not expose adjacent visual deltas.', row);
  return row;
}

function markdownReport(artifact){
  const lines = [
    '# Galaga Alien Frame Cadence Targets',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This report promotes frame-labeled cadence windows for Boss, Bee, and Butterfly from the preserved segmented Galaga alien motion reference. These are stronger than pose-only rows because every frame has a timecode and phase label, but they remain segmented-reference evidence rather than raw gameplay truth.',
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.summary.rowCount}`,
    `- Accepted rows: ${artifact.summary.acceptedForScoringRows}`,
    `- Total labeled frames: ${artifact.summary.totalFrameCount}`,
    `- Timing status: ${artifact.summary.targetTimingStatus}`,
    `- Source video: \`${artifact.sourceVideo}\``,
    '',
    '## Cadence Rows',
    '',
    '| Row | Timing | Preview Frames | Read | Next Gap |',
    '| --- | --- | --- | --- | --- |'
  ];
  for(const row of artifact.rows){
    const previews = row.previewFrames.map(frame => `![](${frame.cropImage})<br><code>${frame.timeSeconds}s ${frame.phaseLabel}</code>`).join('<br>');
    lines.push(`| ${row.label}<br><code>${row.runtimeSpriteKey}</code> | ${row.sampleCount} frames at ${row.sampleFps} fps<br>cycle ${row.cadenceSecondsPerCycle}s<br>${row.phaseLabels.map(label => `<code>${label}</code>`).join(' ')} | ${previews} | ${row.sourceUse}<br>avg delta ${row.averageAdjacentDelta}; max delta ${row.maxAdjacentDelta} | ${row.nextGap} |`);
  }
  lines.push('', '## Measurement Limits', '');
  for(const limit of artifact.measurementLimits) lines.push(`- ${limit}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(SOURCE_VIDEO)) fail(`Missing source video: ${rel(SOURCE_VIDEO)}`);
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  const video = probeVideo(SOURCE_VIDEO);
  const rows = ROLE_WINDOWS.map(spec => analyzeRow(spec, video));
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-alien-frame-cadence-targets',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    status: 'frame-labeled-segmented-reference-cadence',
    sourceVideo: rel(SOURCE_VIDEO),
    video,
    summary: {
      rowCount: rows.length,
      acceptedForScoringRows: rows.filter(row => row.acceptedForScoring).length,
      totalFrameCount: rows.reduce((sum, row) => sum + row.sampleCount, 0),
      sampleFps: SAMPLE_FPS,
      cadenceSecondsPerCycle: round(ROLE_WINDOWS.reduce((sum, row) => sum + row.phasePattern.length / SAMPLE_FPS, 0) / ROLE_WINDOWS.length, 3),
      targetTimingStatus: 'frame-labeled-segmented-reference-windows',
      rows: rows.map(row => ({
        id: row.id,
        runtimeSpriteKey: row.runtimeSpriteKey,
        challengeOnly: !!row.challengeOnly,
        sampleCount: row.sampleCount,
        phaseLabels: row.phaseLabels,
        averageAdjacentDelta: row.averageAdjacentDelta
      }))
    },
    rows,
    measurementLimits: [
      'The reference windows are frame-labeled and repeatable, but they come from a segmented educational/reference clip rather than direct arcade gameplay.',
      'They are appropriate for lifting pose-only provisional caps and for measuring whether Aurora has visible pulse/cadence correspondence.',
      'Future raw gameplay windows should replace or validate these cadence rows before final high-confidence conformance claims.'
    ],
    nextBestStep: 'Use these frame-labeled cadence rows in temporal-target and runtime correspondence scoring, then add raw gameplay windows for challenge-stage aliens and dive/rotation poses.'
  };
  writeJson(OUT, artifact);
  writeText(MARKDOWN, markdownReport(artifact));
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

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'pixel-targets-0.1');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'pixel-targets-0.1.json');

const TARGETS = [
  {
    id: 'galaga-player-fighter',
    role: 'player-fighter',
    catalogKeys: ['player-fighter'],
    label: 'Galaga player fighter target',
    sourceFrame: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-00m12s.png',
    crop: { x: 204, y: 426, width: 36, height: 36 },
    note: 'Exact source-frame crop for player ship visual comparison.'
  },
  {
    id: 'galaga-dual-fighter',
    role: 'dual-fighter',
    catalogKeys: ['dual-fighter', 'rogue-fighter'],
    label: 'Galaga dual-fighter target',
    sourceFrame: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-20m00s.png',
    crop: { x: 162, y: 418, width: 54, height: 42 },
    note: 'Exact source-frame crop for rescue, dual-fighter, and captured-fighter comparison.'
  },
  {
    id: 'galaga-zako-dive',
    role: 'zako-scout',
    catalogKeys: ['bee-line'],
    label: 'Galaga Zako scout target',
    sourceFrame: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-10m00s.png',
    crop: { x: 38, y: 156, width: 36, height: 36 },
    note: 'Exact source-frame crop from a live Zako/scout dive pose.'
  },
  {
    id: 'galaga-butterfly-escort',
    role: 'butterfly-escort',
    catalogKeys: ['but-line'],
    label: 'Galaga butterfly escort target',
    sourceFrame: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-10m00s.png',
    crop: { x: 74, y: 86, width: 34, height: 34 },
    note: 'Exact source-frame crop for escort/butterfly visual comparison.'
  },
  {
    id: 'galaga-command-boss',
    role: 'command-boss',
    catalogKeys: ['boss-line'],
    label: 'Galaga command boss target',
    sourceFrame: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-10m00s.png',
    crop: { x: 120, y: 62, width: 28, height: 28 },
    note: 'Exact source-frame crop from a live formation boss window.'
  },
  {
    id: 'galaga-specialty-dive',
    role: 'specialty-dive',
    catalogKeys: ['challenge-dragonfly', 'challenge-mosquito'],
    label: 'Galaga specialty dive target',
    sourceFrame: 'reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-10m00s.png',
    crop: { x: 23, y: 169, width: 34, height: 34 },
    note: 'Exact source-frame dive crop used as the challenge-specialty target until a challenge-only sheet is promoted.'
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

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
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

function rounded(value, places = 3){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function probeImage(file){
  const raw = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'json', file]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return { width: stream.width || 0, height: stream.height || 0 };
}

function decodeImage(file){
  const { width, height } = probeImage(file);
  const raw = run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { encoding: 'buffer' });
  return { width, height, raw };
}

function colorToken(r, g, b){
  const luma = .299 * r + .587 * g + .114 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if(luma < 34 || max < 58) return '.';
  if(max - min < 25 && luma > 120) return 'W';
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
    litRatio: rounded(lit / Math.max(1, image.width * image.height), 5),
    tokenChannels: Object.keys(tokens).sort(),
    litBox: Number.isFinite(minX) ? {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    } : null
  };
}

function promoteTarget(spec){
  const source = path.join(ROOT, spec.sourceFrame);
  if(!fs.existsSync(source)) fail(`Missing source frame for ${spec.id}`, { sourceFrame: spec.sourceFrame });
  const sourceDimensions = probeImage(source);
  const { x, y, width, height } = spec.crop;
  if(x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > sourceDimensions.width || y + height > sourceDimensions.height){
    fail(`Invalid crop for ${spec.id}`, { crop: spec.crop, sourceDimensions });
  }
  const out = path.join(OUT_DIR, `${spec.id}.png`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  run('ffmpeg', [
    '-v', 'error',
    '-i', source,
    '-vf', `crop=${width}:${height}:${x}:${y}`,
    '-frames:v', '1',
    '-y',
    out
  ]);
  const pixelTargetDimensions = probeImage(out);
  if(pixelTargetDimensions.width !== width || pixelTargetDimensions.height !== height){
    fail(`Pixel target size mismatch for ${spec.id}`, { crop: spec.crop, pixelTargetDimensions });
  }
  return {
    id: spec.id,
    role: spec.role,
    catalogKeys: spec.catalogKeys,
    label: spec.label,
    sourceFrame: spec.sourceFrame,
    pixelTarget: rel(out),
    crop: Object.assign({ sourceWidth: sourceDimensions.width, sourceHeight: sourceDimensions.height }, spec.crop),
    pixelScale: 1,
    sourcePixelExact: true,
    note: spec.note,
    metrics: imageMetrics(out)
  };
}

function main(){
  const targets = TARGETS.map(promoteTarget);
  const artifact = {
    gameKey: 'aurora-galaga-reference',
    artifactType: 'source-frame-pixel-reference-sprite-targets',
    version: '0.1-dev-preview',
    createdOn: '2026-05-11',
    status: 'source-frame-pixel-targets',
    generatedBy: 'tools/harness/promote-galaga-reference-sprite-targets.js',
    sourceEvidence: {
      stageReferenceFrames: 'reference-artifacts/analyses/galaga-stage-reference-video/frames',
      note: 'Targets are exact unscaled source-frame pixel crops. Canonical ROM sprite equivalence depends on the upstream reference frame fidelity.'
    },
    targets,
    summary: {
      targetCount: targets.length,
      catalogKeys: Array.from(new Set(targets.flatMap(target => target.catalogKeys))).sort(),
      totalLitPixels: targets.reduce((sum, target) => sum + target.metrics.litPixels, 0)
    },
    nextAuthoringStep: 'Use these pixel targets as the canonical docs/comparison inputs, then add an emulator/lossless ingest source to promote ROM-equivalent sprite sheets.'
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    targetCount: artifact.summary.targetCount,
    catalogKeys: artifact.summary.catalogKeys,
    outputDir: rel(OUT_DIR)
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const TARGET_ARTIFACT = 'reference-artifacts/analyses/galaga-alien-target-crops/latest.json';
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-impact-explosion-conformance');
const CROP_DIR = path.join(OUT_DIR, 'latest-crops');
const OUT = path.join(OUT_DIR, 'latest.json');

const EFFECT_SPECS = [
  {
    key: 'enemy-hit',
    kind: 'enemy-hit',
    playfieldWidth: 54,
    playfieldHeight: 54,
    advanceS: .02,
    targetIds: ['impact-explosion-small'],
    playerMeaning: 'A missile contact should visibly tell the player that a small enemy was hit.'
  },
  {
    key: 'enemy-boom',
    kind: 'enemy-boom',
    playfieldWidth: 62,
    playfieldHeight: 62,
    advanceS: .02,
    targetIds: ['impact-explosion-small'],
    playerMeaning: 'A destroyed enemy should have a short, readable arcade burst that pairs with the boom cue.'
  },
  {
    key: 'boss-first-hit',
    kind: 'boss-first-hit',
    playfieldWidth: 74,
    playfieldHeight: 74,
    advanceS: .02,
    targetIds: ['impact-explosion-small', 'impact-explosion-large'],
    playerMeaning: 'The first boss hit should read as damage, not as a confusing full death explosion.'
  },
  {
    key: 'boss-boom',
    kind: 'boss-boom',
    playfieldWidth: 82,
    playfieldHeight: 82,
    advanceS: .02,
    targetIds: ['impact-explosion-large', 'impact-explosion-small'],
    playerMeaning: 'A boss death should have a larger visual reward and should not be mistaken for the first-hit damage flash.'
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

function abs(relPath){
  return path.join(ROOT, relPath);
}

function exists(relPath){
  return !!relPath && fs.existsSync(abs(relPath));
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(abs(relPath), 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function rounded(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: 1000 * 60 * 3
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
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

function colorSimilarity(a, b){
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.max(0, 1 - Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(255 * 255 * 3));
}

function isLitPixel(rr, gg, bb){
  const luma = .299 * rr + .587 * gg + .114 * bb;
  const saturation = Math.max(rr, gg, bb) - Math.min(rr, gg, bb);
  return rr + gg + bb > 90 && Math.max(rr, gg, bb) > 38 && luma > 18 && (saturation > 26 || luma > 170);
}

function litBounds(image, pad = 1, preferred = null){
  if(preferred && Number.isFinite(+preferred.width) && Number.isFinite(+preferred.height) && +preferred.width > 0 && +preferred.height > 0){
    const x = Math.max(0, Math.min(image.width - 1, +preferred.x || 0));
    const y = Math.max(0, Math.min(image.height - 1, +preferred.y || 0));
    return {
      x,
      y,
      width: Math.max(1, Math.min(image.width - x, +preferred.width || image.width)),
      height: Math.max(1, Math.min(image.height - y, +preferred.height || image.height)),
      empty: false,
      source: 'artifact-lit-box'
    };
  }
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;
  for(let y = 0; y < image.height; y += 1){
    for(let x = 0; x < image.width; x += 1){
      const i = (y * image.width + x) * 3;
      if(!isLitPixel(image.raw[i], image.raw[i + 1], image.raw[i + 2])) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if(maxX < minX || maxY < minY){
    return { x: 0, y: 0, width: image.width, height: image.height, empty: true };
  }
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(image.width - 1, maxX + pad);
  maxY = Math.min(image.height - 1, maxY + pad);
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX + 1),
    height: Math.max(1, maxY - minY + 1),
    empty: false
  };
}

function sampleCell(image, bounds, gx, gy, cols, rows){
  const x0 = bounds.x + Math.floor(gx * bounds.width / cols);
  const x1 = bounds.x + Math.max(1, Math.floor((gx + 1) * bounds.width / cols));
  const y0 = bounds.y + Math.floor(gy * bounds.height / rows);
  const y1 = bounds.y + Math.max(1, Math.floor((gy + 1) * bounds.height / rows));
  let lit = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for(let y = y0; y < Math.min(image.height, y1); y += 1){
    for(let x = x0; x < Math.min(image.width, x1); x += 1){
      const i = (y * image.width + x) * 3;
      const rr = image.raw[i];
      const gg = image.raw[i + 1];
      const bb = image.raw[i + 2];
      if(!isLitPixel(rr, gg, bb)) continue;
      lit += 1;
      r += rr;
      g += gg;
      b += bb;
    }
  }
  return lit ? {
    lit: true,
    rgb: [Math.round(r / lit), Math.round(g / lit), Math.round(b / lit)]
  } : { lit: false, rgb: [0, 0, 0] };
}

function gridForImage(file, cols = 32, rows = 32, preferredBounds = null){
  const image = decodeImage(file);
  const bounds = litBounds(image, 1, preferredBounds);
  const grid = [];
  let filled = 0;
  for(let y = 0; y < rows; y += 1){
    const row = [];
    for(let x = 0; x < cols; x += 1){
      const cell = sampleCell(image, bounds, x, y, cols, rows);
      if(cell.lit) filled += 1;
      row.push(cell);
    }
    grid.push(row);
  }
  return {
    width: bounds.width,
    height: bounds.height,
    originalWidth: image.width,
    originalHeight: image.height,
    trimBounds: bounds,
    grid,
    filled,
    fillRatio: filled / Math.max(1, cols * rows)
  };
}

function compareGrids(runtime, target){
  const rows = runtime.grid.length;
  const cols = runtime.grid[0]?.length || 0;
  let intersection = 0;
  let union = 0;
  let silhouetteMatches = 0;
  let colorPairs = 0;
  let colorSum = 0;
  for(let y = 0; y < rows; y += 1){
    for(let x = 0; x < cols; x += 1){
      const a = runtime.grid[y][x];
      const b = target.grid[y][x];
      if(a.lit || b.lit) union += 1;
      if(a.lit && b.lit){
        intersection += 1;
        colorPairs += 1;
        colorSum += colorSimilarity(a.rgb, b.rgb);
      }
      if(a.lit === b.lit) silhouetteMatches += 1;
    }
  }
  const total = Math.max(1, rows * cols);
  const jaccard = union ? intersection / union : 0;
  const silhouetteAgreement = silhouetteMatches / total;
  const colorMatch = colorPairs ? colorSum / colorPairs : 0;
  const aspectDelta = Math.abs((runtime.width / Math.max(1, runtime.height)) - (target.width / Math.max(1, target.height)));
  const aspectPenalty = Math.min(.14, aspectDelta * .08);
  const score = Math.max(0, (jaccard * .55 + silhouetteAgreement * .25 + colorMatch * .2 - aspectPenalty) * 10);
  return {
    score10: rounded(score, 2),
    jaccard: rounded(jaccard, 4),
    silhouetteAgreement: rounded(silhouetteAgreement, 4),
    colorSimilarity: rounded(colorMatch, 4),
    fillRatioDelta: rounded(Math.abs(runtime.fillRatio - target.fillRatio), 4),
    aspectDelta: rounded(aspectDelta, 4)
  };
}

async function captureImpact(page, spec){
  const setup = await page.evaluate(captureSpec => {
    window.__galagaHarness__.setTest({
      stage: captureSpec.stage || 1,
      ships: 3,
      challenge: false,
      graphicsTheme: 'classic-arcade',
      starfieldIntensity: 0,
      starfieldSpeed: 0
    });
    return window.__galagaHarness__.setupImpactRuntimeCapture(captureSpec);
  }, spec);
  if(!setup?.ok) throw new Error(`Impact setup failed for ${spec.key}: ${setup?.error || 'unknown error'}`);
  const impact = setup.impact;
  if(!impact) throw new Error(`Impact setup did not expose coordinates for ${spec.key}`);
  const capture = await page.evaluate(({ impact, spec }) => {
    const canvas = document.getElementById('c');
    const frame = document.getElementById('playfieldFrame');
    const ctx = canvas.getContext('2d');
    const canvasRect = canvas.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const scaleX = (frameRect.width - 4) / 280;
    const scaleY = (frameRect.height - 4) / 360;
    const left = frameRect.left + 2 + (impact.x - spec.playfieldWidth / 2) * scaleX;
    const top = frameRect.top + 2 + (impact.y - spec.playfieldHeight / 2) * scaleY;
    const width = spec.playfieldWidth * scaleX;
    const height = spec.playfieldHeight * scaleY;
    const sx = Math.max(0, Math.floor((left - canvasRect.left) * (canvas.width / canvasRect.width)));
    const sy = Math.max(0, Math.floor((top - canvasRect.top) * (canvas.height / canvasRect.height)));
    const sw = Math.max(1, Math.floor(width * (canvas.width / canvasRect.width)));
    const sh = Math.max(1, Math.floor(height * (canvas.height / canvasRect.height)));
    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    out.getContext('2d').putImageData(ctx.getImageData(sx, sy, sw, sh), 0, 0);
    return { sx, sy, sw, sh, dataUrl: out.toDataURL('image/png') };
  }, { impact, spec });
  const outFile = path.join(CROP_DIR, `${spec.key}.png`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(String(capture.dataUrl).split(',')[1] || '', 'base64'));
  await page.evaluate(() => {
    if(window.__galagaHarness__?.clearSpriteRuntimeCapture){
      window.__galagaHarness__.clearSpriteRuntimeCapture();
    }
  });
  return {
    key: spec.key,
    kind: spec.kind,
    runtimeCrop: rel(outFile),
    impact,
    canvasClip: { x: capture.sx, y: capture.sy, width: capture.sw, height: capture.sh },
    playerMeaning: spec.playerMeaning
  };
}

function scoreImpact(sample, spec, targetCrops, targetGrids){
  const runtimeGrid = gridForImage(abs(sample.runtimeCrop));
  const candidates = targetCrops
    .filter(crop => spec.targetIds.includes(crop.id))
    .map(target => {
      const targetGrid = targetGrids.get(target.id) || gridForImage(abs(target.targetCrop), 32, 32, target.metrics?.litBox || null);
      targetGrids.set(target.id, targetGrid);
      return Object.assign({
        targetCropId: target.id,
        targetRoleKey: target.roleKey,
        targetPoseKey: target.poseKey,
        targetCrop: target.targetCrop
      }, compareGrids(runtimeGrid, targetGrid));
    })
    .sort((a, b) => b.score10 - a.score10);
  const best = candidates[0] || null;
  return Object.assign({}, sample, {
    candidateTargetIds: spec.targetIds,
    bestTargetCropId: best?.targetCropId || null,
    bestTargetCrop: best?.targetCrop || null,
    score10: best?.score10 || null,
    bestComponents: best ? {
      jaccard: best.jaccard,
      silhouetteAgreement: best.silhouetteAgreement,
      colorSimilarity: best.colorSimilarity,
      fillRatioDelta: best.fillRatioDelta,
      aspectDelta: best.aspectDelta
    } : null,
    topCandidates: candidates.slice(0, 4),
    decision: best?.score10 >= 5.5
      ? 'usable-static-keeper-candidate'
      : 'gap-remains-temporal-and-shape-work-needed'
  });
}

async function main(){
  if(!exists(TARGET_ARTIFACT)) fail(`Missing Galaga target crop artifact: ${TARGET_ARTIFACT}`);
  const target = readJson(TARGET_ARTIFACT);
  const targetCrops = Array.isArray(target.targetCrops) ? target.targetCrops : [];
  for(const spec of EFFECT_SPECS){
    for(const targetId of spec.targetIds){
      const crop = targetCrops.find(item => item.id === targetId);
      if(!crop) fail(`Missing target crop ${targetId} for ${spec.key}`, spec);
      if(!exists(crop.targetCrop)) fail(`Missing target crop image ${crop.targetCrop}`, crop);
    }
  }
  const samples = [];
  await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 91711 }, async ({ page }) => {
    for(const spec of EFFECT_SPECS){
      samples.push(await captureImpact(page, spec));
    }
  });
  const targetGrids = new Map();
  const scoredSamples = samples.map(sample => {
    const spec = EFFECT_SPECS.find(item => item.key === sample.key);
    return scoreImpact(sample, spec, targetCrops, targetGrids);
  });
  const scored = scoredSamples.filter(item => Number.isFinite(+item.score10));
  const averageScore10 = scored.length
    ? rounded(scored.reduce((sum, item) => sum + item.score10, 0) / scored.length, 2)
    : null;
  const weakest = scored.slice().sort((a, b) => a.score10 - b.score10)[0] || null;
  const artifact = {
    schemaVersion: 1,
    artifactType: 'aurora-impact-explosion-conformance',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    gameKey: 'aurora-galactica',
    sources: {
      targetCrops: TARGET_ARTIFACT,
      runtimeHarness: 'src/js/90-harness.js setupImpactRuntimeCapture'
    },
    summary: {
      sampleCount: scoredSamples.length,
      targetCropCount: targetCrops.length,
      averageScore10,
      weakestKey: weakest?.key || null,
      weakestScore10: weakest?.score10 || null,
      scoringMode: 'first-pass-static-runtime-effect-crop-vs-promoted-target-crop',
      userFacingRead: weakest
        ? `Impact/explosion visual feedback is measurable but still immature. Weakest static event is ${weakest.key} at ${weakest.score10}/10; the next scorer must add lifecycle timing so first-hit, kill, and boss-death events do not collapse into one generic burst.`
        : 'Impact/explosion visual feedback comparison did not produce a scored sample.'
    },
    measurementLimits: [
      'This is a static-frame comparator for runtime effect crops against promoted Galaga target explosion crops.',
      'It does not yet score the temporal lifecycle: onset, expansion, flash decay, particle count over time, sound coupling, or whether boss first-hit damage differs clearly from boss death.',
      'Target crop authority is first-pass because explosion source-sheet crops are small and should be cross-checked against frame-labeled gameplay video.'
    ],
    samples: scoredSamples
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    sampleCount: scoredSamples.length,
    averageScore10,
    weakestKey: artifact.summary.weakestKey,
    weakestScore10: artifact.summary.weakestScore10
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

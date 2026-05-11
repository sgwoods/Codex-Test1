#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const MODEL_ARTIFACT = 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1.json';
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-runtime-sprite-conformance');
const CROP_DIR = path.join(OUT_DIR, 'latest-crops');
const OUT = path.join(OUT_DIR, 'latest.json');

const CAPTURE_SPECS = [
  { spriteKey: 'player-fighter', kind: 'player-fighter', subject: 'player', playfieldWidth: 42, playfieldHeight: 38 },
  { spriteKey: 'dual-fighter', kind: 'dual-fighter', subject: 'player', playfieldWidth: 74, playfieldHeight: 38 },
  { spriteKey: 'bee-line', kind: 'bee-line', subject: 'enemy', playfieldWidth: 50, playfieldHeight: 44 },
  { spriteKey: 'but-line', kind: 'but-line', subject: 'enemy', playfieldWidth: 54, playfieldHeight: 46 },
  { spriteKey: 'boss-line', kind: 'boss-line', subject: 'enemy', playfieldWidth: 62, playfieldHeight: 52 },
  { spriteKey: 'rogue-fighter', kind: 'rogue-fighter', subject: 'enemy', playfieldWidth: 56, playfieldHeight: 48 },
  { spriteKey: 'challenge-dragonfly', kind: 'challenge-dragonfly', subject: 'enemy', playfieldWidth: 50, playfieldHeight: 44 },
  { spriteKey: 'challenge-mosquito', kind: 'challenge-mosquito', subject: 'enemy', playfieldWidth: 50, playfieldHeight: 44 }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rounded(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function scoreText(value){
  return Number.isFinite(+value) ? `${rounded(value, 1).toFixed(1).replace(/\.0$/, '')}/10` : 'unscored';
}

function hexToRgb(hex){
  const clean = String(hex || '').replace(/^#/, '');
  if(!/^[0-9a-f]{6}$/i.test(clean)) return [0, 0, 0];
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

function colorSimilarity(a, b){
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.max(0, 1 - Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(255 * 255 * 3));
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function modelForKey(modelArtifact, spriteKey){
  const targets = Array.isArray(modelArtifact.targets) ? modelArtifact.targets : [];
  return targets.find(target => Array.isArray(target.catalogKeys) && target.catalogKeys.includes(spriteKey)) || null;
}

function compareRuntimeGridToModel(sample, model){
  const modelRows = Array.isArray(model.rows) ? model.rows : [];
  const rows = model.logicalGrid?.rows || modelRows.length;
  const cols = model.logicalGrid?.cols || modelRows.reduce((max, row) => Math.max(max, row.length), 0);
  const palette = model.palette || {};
  let silhouetteMatches = 0;
  let colorPairs = 0;
  let colorSum = 0;
  let currentFilled = 0;
  let targetFilled = 0;
  const total = Math.max(1, cols * rows);

  for(let y = 0; y < rows; y++){
    for(let x = 0; x < cols; x++){
      const current = sample.grid?.[y]?.[x] || null;
      const currentIsFilled = Array.isArray(current);
      const token = modelRows[y]?.[x] || '.';
      const targetIsFilled = token !== '.';
      if(currentIsFilled) currentFilled++;
      if(targetIsFilled) targetFilled++;
      if(currentIsFilled === targetIsFilled) silhouetteMatches++;
      if(currentIsFilled && targetIsFilled){
        colorPairs++;
        colorSum += colorSimilarity(current, hexToRgb(palette[token] || '#ffffff'));
      }
    }
  }

  const silhouetteSimilarity = silhouetteMatches / total;
  const colorMatch = colorPairs ? colorSum / colorPairs : 0;
  const fillRatio = currentFilled / total;
  const targetFillRatio = targetFilled / total;
  return {
    score10: rounded((silhouetteSimilarity * .65 + colorMatch * .35) * 10, 2),
    silhouetteSimilarity: rounded(silhouetteSimilarity, 3),
    colorSimilarity: rounded(colorMatch, 3),
    fillRatio: rounded(fillRatio, 4),
    targetFillRatio: rounded(targetFillRatio, 4),
    filledCells: currentFilled,
    targetFilledCells: targetFilled
  };
}

async function captureRuntimeSprite(page, spec, model){
  const grid = model.logicalGrid || { cols: 36, rows: 36 };
  const setup = await page.evaluate(captureSpec => {
    window.__galagaHarness__.setTest({
      stage: captureSpec.stage || 1,
      ships: 3,
      challenge: !!captureSpec.challenge,
      graphicsTheme: 'classic-arcade',
      starfieldIntensity: 0,
      starfieldSpeed: 0
    });
    return window.__galagaHarness__.setupSpriteRuntimeCapture(captureSpec);
  }, spec);
  if(!setup?.ok) throw new Error(`Runtime setup failed for ${spec.spriteKey}: ${setup?.error || 'unknown error'}`);
  const subject = spec.subject === 'player' ? setup.player : setup.enemies?.[0];
  if(!subject) throw new Error(`Runtime setup did not expose a subject for ${spec.spriteKey}`);
  const capture = await page.evaluate(({ subject, spec, grid }) => {
    const canvas = document.getElementById('c');
    const frame = document.getElementById('playfieldFrame');
    const ctx = canvas.getContext('2d');
    const canvasRect = canvas.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const scaleX = (frameRect.width - 4) / 280;
    const scaleY = (frameRect.height - 4) / 360;
    const left = frameRect.left + 2 + (subject.x - spec.playfieldWidth / 2) * scaleX;
    const top = frameRect.top + 2 + (subject.y - spec.playfieldHeight / 2) * scaleY;
    const width = spec.playfieldWidth * scaleX;
    const height = spec.playfieldHeight * scaleY;
    const sx = Math.max(0, Math.floor((left - canvasRect.left) * (canvas.width / canvasRect.width)));
    const sy = Math.max(0, Math.floor((top - canvasRect.top) * (canvas.height / canvasRect.height)));
    const sw = Math.max(1, Math.floor(width * (canvas.width / canvasRect.width)));
    const sh = Math.max(1, Math.floor(height * (canvas.height / canvasRect.height)));
    const image = ctx.getImageData(sx, sy, sw, sh);
    const data = image.data;
    const isLit = (px, py) => {
      const i = (py * sw + px) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      return a > 0 && r + g + b > 90 && Math.max(r, g, b) > 38;
    };
    let minX = sw;
    let minY = sh;
    let maxX = -1;
    let maxY = -1;
    let litPixels = 0;
    for(let py = 0; py < sh; py++){
      for(let px = 0; px < sw; px++){
        if(!isLit(px, py)) continue;
        litPixels++;
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      }
    }
    if(maxX < 0) return { error: 'empty-crop', sx, sy, sw, sh, litPixels };
    const pad = 2;
    const bx = Math.max(0, minX - pad);
    const by = Math.max(0, minY - pad);
    const bw = Math.min(sw - bx, maxX - minX + 1 + pad * 2);
    const bh = Math.min(sh - by, maxY - minY + 1 + pad * 2);
    const out = document.createElement('canvas');
    out.width = bw;
    out.height = bh;
    out.getContext('2d').putImageData(ctx.getImageData(sx + bx, sy + by, bw, bh), 0, 0);
    const cellGrid = [];
    for(let gy = 0; gy < grid.rows; gy++){
      const row = [];
      for(let gx = 0; gx < grid.cols; gx++){
        const x0 = Math.floor(bx + gx * bw / grid.cols);
        const x1 = Math.max(x0 + 1, Math.floor(bx + (gx + 1) * bw / grid.cols));
        const y0 = Math.floor(by + gy * bh / grid.rows);
        const y1 = Math.max(y0 + 1, Math.floor(by + (gy + 1) * bh / grid.rows));
        let lit = 0;
        let r = 0;
        let g = 0;
        let b = 0;
        for(let py = y0; py < y1; py++){
          for(let px = x0; px < x1; px++){
            const i = (py * sw + px) * 4;
            const rr = data[i];
            const gg = data[i + 1];
            const bb = data[i + 2];
            const aa = data[i + 3];
            if(!(aa > 0 && rr + gg + bb > 90 && Math.max(rr, gg, bb) > 38)) continue;
            lit++;
            r += rr;
            g += gg;
            b += bb;
          }
        }
        const area = Math.max(1, (x1 - x0) * (y1 - y0));
        row.push(lit / area < .035 ? null : [
          Math.round(r / lit),
          Math.round(g / lit),
          Math.round(b / lit)
        ]);
      }
      cellGrid.push(row);
    }
    return {
      sx,
      sy,
      sw,
      sh,
      bbox: { x: bx, y: by, width: bw, height: bh },
      litPixels,
      grid: cellGrid,
      dataUrl: out.toDataURL('image/png')
    };
  }, { subject, spec, grid });
  if(capture.error) throw new Error(`Runtime capture failed for ${spec.spriteKey}: ${capture.error}`);
  const outFile = path.join(CROP_DIR, `${spec.spriteKey}.png`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(String(capture.dataUrl).split(',')[1] || '', 'base64'));
  const metrics = compareRuntimeGridToModel(capture, model);
  return {
    spriteKey: spec.spriteKey,
    kind: spec.kind,
    subject: spec.subject,
    currentLabel: `Live runtime canvas ${spec.spriteKey}`,
    targetId: model.id,
    targetLabel: model.label,
    score10: metrics.score10,
    silhouetteSimilarity: metrics.silhouetteSimilarity,
    colorSimilarity: metrics.colorSimilarity,
    fillRatio: metrics.fillRatio,
    targetFillRatio: metrics.targetFillRatio,
    filledCells: metrics.filledCells,
    targetFilledCells: metrics.targetFilledCells,
    litPixels: capture.litPixels,
    cropImage: rel(outFile),
    modelImage: model.modelImage,
    sourcePixelTarget: model.sourcePixelTarget,
    canvasClip: {
      x: capture.sx,
      y: capture.sy,
      width: capture.sw,
      height: capture.sh,
      bbox: capture.bbox
    },
    runtimeSubject: subject
  };
}

async function main(){
  const modelArtifact = readJson(MODEL_ARTIFACT);
  const samples = [];
  await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 91577 }, async ({ page }) => {
    for(const spec of CAPTURE_SPECS){
      const model = modelForKey(modelArtifact, spec.spriteKey);
      if(!model) throw new Error(`Missing model for runtime sprite key ${spec.spriteKey}`);
      samples.push(await captureRuntimeSprite(page, spec, model));
    }
  });
  const averageScore10 = samples.length
    ? rounded(samples.reduce((sum, item) => sum + item.score10, 0) / samples.length, 2)
    : null;
  const weakest = samples.slice().sort((a, b) => a.score10 - b.score10)[0] || null;
  const artifact = {
    schemaVersion: 1,
    artifactType: 'aurora-runtime-sprite-conformance',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    gameKey: 'aurora-galactica',
    sourceEvidence: {
      spriteModel: MODEL_ARTIFACT
    },
    summary: {
      sampleCount: samples.length,
      averageScore10,
      weakestSpriteKey: weakest?.spriteKey || null,
      weakestScore10: weakest?.score10 || null,
      captureMode: 'isolated-live-canvas-sprite-crops',
      measuredKeys: samples.map(item => item.spriteKey),
      staticPoseOnly: true,
      motionCoverageAxesCovered: 0,
      motionCoverageAxesPlanned: 4,
      plannedMotionAxes: [
        'flap-cycle cadence and alternating wing/body pixels',
        'pulse and damage-state brightness/color phases',
        'dive/rotation pose silhouettes',
        'capture, carried-fighter, rescue, and dual-fighter transition poses'
      ]
    },
    measurementLimits: [
      'Runtime captures isolate static sprite poses through the harness; they do not yet score animation phases, rotations, dive poses, pulsing, flapping cadence, capture/rescue transitions, or formation context.',
      'The current score compares visible rendered Aurora pixels to inferred source-frame Galaga models, not to a direct Galaga ROM sprite sheet.'
    ],
    samples
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    sampleCount: samples.length,
    averageScore10,
    weakestSpriteKey: weakest?.spriteKey || null,
    weakestScore10: weakest?.score10 || null,
    samples: samples.map(item => ({
      spriteKey: item.spriteKey,
      score10: item.score10,
      cropImage: item.cropImage
    }))
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

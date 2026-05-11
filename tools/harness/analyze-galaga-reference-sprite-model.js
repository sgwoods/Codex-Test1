#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PIXEL_TARGETS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'pixel-targets-0.1.json');
const FRAME_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-stage-reference-video', 'frames');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'model-0.1');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-sprites', 'model-0.1.json');
const MODEL_SCALE = 4;

const PALETTE = {
  '.': [0, 0, 0],
  B: [56, 132, 255],
  C: [38, 228, 232],
  G: [64, 222, 103],
  M: [198, 92, 255],
  R: [255, 58, 48],
  W: [244, 248, 255],
  Y: [255, 218, 60]
};

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    input: opts.input,
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
  return { file, width, height, raw };
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

function tokenAt(image, x, y){
  const i = (y * image.width + x) * 3;
  return colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]);
}

function litAt(image, x, y){
  return tokenAt(image, x, y) !== '.';
}

function connectedComponents(image){
  const seen = new Uint8Array(image.width * image.height);
  const comps = [];
  for(let y = 0; y < image.height; y++){
    for(let x = 0; x < image.width; x++){
      const start = y * image.width + x;
      if(seen[start] || !litAt(image, x, y)) continue;
      const queue = [[x, y]];
      seen[start] = 1;
      let q = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let pixels = 0;
      const tokens = {};
      while(q < queue.length){
        const [cx, cy] = queue[q++];
        pixels++;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
        const token = tokenAt(image, cx, cy);
        tokens[token] = (tokens[token] || 0) + 1;
        for(let dy = -1; dy <= 1; dy++){
          for(let dx = -1; dx <= 1; dx++){
            if(!dx && !dy) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if(nx < 0 || ny < 0 || nx >= image.width || ny >= image.height) continue;
            const ni = ny * image.width + nx;
            if(seen[ni] || !litAt(image, nx, ny)) continue;
            seen[ni] = 1;
            queue.push([nx, ny]);
          }
        }
      }
      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      comps.push({
        x: minX,
        y: minY,
        width: w,
        height: h,
        pixels,
        aspect: rounded(w / Math.max(1, h)),
        fill: rounded(pixels / Math.max(1, w * h)),
        tokens
      });
    }
  }
  return comps;
}

function litBox(image, box = { x:0, y:0, width:image.width, height:image.height }){
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let pixels = 0;
  for(let y = box.y; y < box.y + box.height; y++){
    for(let x = box.x; x < box.x + box.width; x++){
      if(!litAt(image, x, y)) continue;
      pixels++;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if(!Number.isFinite(minX)) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    pixels
  };
}

function paddedBox(image, box, pad){
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  const width = Math.min(image.width - x, box.width + pad * 2);
  const height = Math.min(image.height - y, box.height + pad * 2);
  return { x, y, width, height };
}

function gridFromBox(image, box, cols, rows){
  const grid = [];
  for(let gy = 0; gy < rows; gy++){
    let row = '';
    for(let gx = 0; gx < cols; gx++){
      const x0 = Math.floor(box.x + gx * box.width / cols);
      const x1 = Math.max(x0 + 1, Math.floor(box.x + (gx + 1) * box.width / cols));
      const y0 = Math.floor(box.y + gy * box.height / rows);
      const y1 = Math.max(y0 + 1, Math.floor(box.y + (gy + 1) * box.height / rows));
      const counts = {};
      let lit = 0;
      for(let py = y0; py < y1; py++){
        for(let px = x0; px < x1; px++){
          const token = tokenAt(image, px, py);
          if(token === '.') continue;
          lit++;
          counts[token] = (counts[token] || 0) + 1;
        }
      }
      const area = Math.max(1, (x1 - x0) * (y1 - y0));
      row += lit / area < .065 ? '.' : Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '.';
    }
    grid.push(row);
  }
  return grid;
}

function gridFromImage(image, cols, rows){
  const box = litBox(image);
  const usable = box ? paddedBox(image, box, 2) : { x:0, y:0, width:image.width, height:image.height };
  return { rows: gridFromBox(image, usable, cols, rows), box: usable };
}

function silhouetteSimilarity(aRows, bRows){
  const rows = Math.min(aRows.length, bRows.length);
  const cols = Math.min(...aRows.concat(bRows).map(row => row.length));
  let same = 0;
  let total = 0;
  for(let y = 0; y < rows; y++){
    for(let x = 0; x < cols; x++){
      const a = aRows[y][x] === '.' ? '.' : '#';
      const b = bRows[y][x] === '.' ? '.' : '#';
      if(a === b) same++;
      total++;
    }
  }
  return total ? rounded(same / total, 4) : 0;
}

function tokenSimilarity(aRows, bRows){
  const rows = Math.min(aRows.length, bRows.length);
  const cols = Math.min(...aRows.concat(bRows).map(row => row.length));
  let score = 0;
  let total = 0;
  for(let y = 0; y < rows; y++){
    for(let x = 0; x < cols; x++){
      const a = aRows[y][x] || '.';
      const b = bRows[y][x] || '.';
      if(a === b){
        score += 1;
      } else if(a !== '.' && b !== '.'){
        score += .22;
      }
      total++;
    }
  }
  return total ? rounded(score / total, 4) : 0;
}

function modelGridSize(target){
  return { cols: target.crop.width, rows: target.crop.height };
}

function candidateFitsTarget(comp, target){
  const box = target.metrics?.litBox || { width: target.crop.width, height: target.crop.height };
  const minW = Math.max(4, box.width * .45);
  const maxW = Math.max(minW, box.width * 2.35);
  const minH = Math.max(4, box.height * .45);
  const maxH = Math.max(minH, box.height * 2.35);
  return comp.width >= minW && comp.width <= maxW && comp.height >= minH && comp.height <= maxH && comp.pixels >= 8;
}

function sourceFrames(targets){
  const frames = new Set(targets.map(target => target.sourceFrame).filter(Boolean));
  if(fs.existsSync(FRAME_DIR)){
    for(const entry of fs.readdirSync(FRAME_DIR)){
      if(/\.(png|jpe?g)$/i.test(entry)) frames.add(rel(path.join(FRAME_DIR, entry)));
    }
  }
  return Array.from(frames).filter(frame => fs.existsSync(path.join(ROOT, frame))).sort();
}

function collectSamples(target, frameImages, primaryRows, cols, rows){
  const samples = [];
  const primaryImage = decodeImage(path.join(ROOT, target.pixelTarget));
  const primary = gridFromImage(primaryImage, cols, rows);
  samples.push({
    kind: 'seed-pixel-target',
    sourceFrame: target.sourceFrame,
    crop: target.crop,
    rows: primary.rows,
    similarityToSeed: 1,
    tokenSimilarityToSeed: 1,
    weight: 1.5,
    score: 10
  });
  const minSilhouette = target.role === 'dual-fighter' ? .7 : .76;
  const minCombined = target.role === 'dual-fighter' ? .7 : .74;
  for(const image of frameImages){
    const comps = connectedComponents(image).filter(comp => candidateFitsTarget(comp, target));
    for(const comp of comps){
      const sampleBox = paddedBox(image, comp, 2);
      const sampleRows = gridFromBox(image, sampleBox, cols, rows);
      const similarity = silhouetteSimilarity(sampleRows, primaryRows);
      if(similarity < minSilhouette) continue;
      const tokenMatch = tokenSimilarity(sampleRows, primaryRows);
      const combined = similarity * .55 + tokenMatch * .45;
      if(combined < minCombined) continue;
      const aspect = comp.width / Math.max(1, comp.height);
      const targetAspect = (target.metrics?.litBox?.width || target.crop.width) / Math.max(1, target.metrics?.litBox?.height || target.crop.height);
      const aspectPenalty = Math.abs(aspect - targetAspect) * .18;
      const sourceBonus = image.file.endsWith(target.sourceFrame) ? .18 : 0;
      const score = combined + sourceBonus - aspectPenalty + Math.min(.08, comp.pixels / 1800);
      samples.push({
        kind: 'frame-component',
        sourceFrame: rel(image.file),
        crop: sampleBox,
        component: comp,
        rows: sampleRows,
        similarityToSeed: similarity,
        tokenSimilarityToSeed: tokenMatch,
        weight: rounded(Math.max(.25, Math.min(1.2, score)), 4),
        score: rounded(score, 4)
      });
    }
  }
  const unique = [];
  const seen = new Set();
  for(const sample of samples.sort((a, b) => b.score - a.score)){
    const key = `${sample.sourceFrame}:${sample.crop.x}:${sample.crop.y}:${sample.crop.width}:${sample.crop.height}`;
    if(seen.has(key)) continue;
    seen.add(key);
    unique.push(sample);
    if(unique.length >= 8) break;
  }
  return unique.sort((a, b) => b.score - a.score);
}

function consensusRows(samples, cols, rows){
  const modelRows = [];
  const confidenceRows = [];
  const confidenceValues = [];
  for(let y = 0; y < rows; y++){
    let row = '';
    let confidenceRow = '';
    for(let x = 0; x < cols; x++){
      const counts = {};
      let lit = 0;
      let totalWeight = 0;
      for(const sample of samples){
        const weight = Number.isFinite(sample.weight) ? sample.weight : 1;
        const token = sample.rows[y]?.[x] || '.';
        counts[token] = (counts[token] || 0) + weight;
        totalWeight += weight;
        if(token !== '.') lit += weight;
      }
      const total = Math.max(.001, totalWeight);
      const litProbability = lit / total;
      if(litProbability < .42){
        row += '.';
        const confidence = Math.max(counts['.'] || 0, total - lit) / total;
        confidenceValues.push(confidence);
        confidenceRow += confidence >= .8 ? 'H' : confidence >= .58 ? 'M' : 'L';
        continue;
      }
      const [token, count] = Object.entries(counts)
        .filter(([candidate]) => candidate !== '.')
        .sort((a, b) => b[1] - a[1])[0] || ['M', 1];
      row += token;
      const confidence = count / total;
      confidenceValues.push(confidence);
      confidenceRow += confidence >= .8 ? 'H' : confidence >= .58 ? 'M' : 'L';
    }
    modelRows.push(row);
    confidenceRows.push(confidenceRow);
  }
  return {
    rows: modelRows,
    confidenceRows,
    averageConfidence: rounded(confidenceValues.reduce((sum, value) => sum + value, 0) / Math.max(1, confidenceValues.length), 4)
  };
}

function spriteMetrics(rows){
  const text = rows.join('');
  const filled = text.split('').filter(ch => ch !== '.');
  return {
    width: Math.max(...rows.map(row => row.length)),
    height: rows.length,
    filledPixels: filled.length,
    fillRatio: rounded(filled.length / Math.max(1, text.length), 4),
    tokenChannels: Array.from(new Set(filled)).sort()
  };
}

function writeModelPng(rows, out){
  const sourceHeight = rows.length;
  const sourceWidth = Math.max(...rows.map(row => row.length));
  const width = sourceWidth * MODEL_SCALE;
  const height = sourceHeight * MODEL_SCALE;
  const buffer = Buffer.alloc(width * height * 3);
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const token = rows[Math.floor(y / MODEL_SCALE)]?.[Math.floor(x / MODEL_SCALE)] || '.';
      const color = PALETTE[token] || PALETTE.M;
      const i = (y * width + x) * 3;
      buffer[i] = color[0];
      buffer[i + 1] = color[1];
      buffer[i + 2] = color[2];
    }
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  run('ffmpeg', [
    '-v', 'error',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    '-s', `${width}x${height}`,
    '-i', 'pipe:0',
    '-frames:v', '1',
    '-y',
    out
  ], { encoding: 'buffer', input: buffer });
}

function labelFor(target){
  return `Inferred ${target.label.replace(/^Galaga /, 'Galaga ').replace(/ target$/, ' model')}`;
}

function main(){
  if(!fs.existsSync(PIXEL_TARGETS)) fail('Missing Galaga source-frame pixel target artifact. Run npm run harness:promote:galaga-reference-sprite-targets first.');
  const pixelTargets = readJson(PIXEL_TARGETS);
  const targets = Array.isArray(pixelTargets.targets) ? pixelTargets.targets : [];
  if(!targets.length) fail('Galaga source-frame pixel target artifact has no targets.');
  const frames = sourceFrames(targets);
  const frameImages = frames.map(frame => decodeImage(path.join(ROOT, frame)));
  const modelTargets = [];
  for(const target of targets){
    const { cols, rows } = modelGridSize(target);
    const primaryImage = decodeImage(path.join(ROOT, target.pixelTarget));
    const primary = gridFromImage(primaryImage, cols, rows);
    const samples = collectSamples(target, frameImages, primary.rows, cols, rows);
    const consensus = consensusRows(samples, cols, rows);
    const modelImage = path.join(OUT_DIR, `${target.id}-model.png`);
    writeModelPng(consensus.rows, modelImage);
    modelTargets.push({
      id: `${target.id}-model`,
      sourceTargetId: target.id,
      role: target.role,
      catalogKeys: target.catalogKeys,
      label: labelFor(target),
      modelImage: rel(modelImage),
      sourcePixelTarget: target.pixelTarget,
      logicalGrid: { cols, rows },
      displayScale: MODEL_SCALE,
      modelKind: 'consensus-from-source-frame-components',
      sampleCount: samples.length,
      averageConfidence: consensus.averageConfidence,
      rows: consensus.rows,
      confidenceRows: consensus.confidenceRows,
      palette: Object.fromEntries(Object.entries(PALETTE).filter(([token]) => token !== '.').map(([token, rgb]) => [token, `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`])),
      metrics: spriteMetrics(consensus.rows),
      samples: samples.map(sample => ({
        kind: sample.kind,
        sourceFrame: sample.sourceFrame,
        crop: sample.crop,
        similarityToSeed: sample.similarityToSeed,
        score: sample.score
      })),
      note: 'Consensus model inferred from aligned source-frame component candidates; use confidence rows before treating any cell as canonical.'
    });
  }
  const artifact = {
    gameKey: 'aurora-galaga-reference',
    artifactType: 'consensus-reference-sprite-pixel-model',
    version: '0.1-dev-preview',
    createdOn: '2026-05-11',
    status: 'consensus-source-frame-pixel-model',
    generatedBy: 'tools/harness/analyze-galaga-reference-sprite-model.js',
    sourceEvidence: {
      pixelTargets: rel(PIXEL_TARGETS),
      sourceFrameCount: frames.length,
      sourceFrames: frames,
      note: 'Models are inferred from exact source-frame targets plus similar lit components harvested from the ingested reference frame set.'
    },
    targets: modelTargets,
    summary: {
      targetCount: modelTargets.length,
      catalogKeys: Array.from(new Set(modelTargets.flatMap(target => target.catalogKeys))).sort(),
      totalSamples: modelTargets.reduce((sum, target) => sum + target.sampleCount, 0),
      averageConfidence: rounded(modelTargets.reduce((sum, target) => sum + target.averageConfidence, 0) / Math.max(1, modelTargets.length), 4),
      weakestModel: modelTargets.slice().sort((a, b) => a.averageConfidence - b.averageConfidence)[0]?.id || ''
    },
    nextAuthoringStep: 'Compare runtime sprites against these inferred consensus models, then replace or strengthen low-confidence cells with lossless/emulator-derived evidence.'
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    targetCount: artifact.summary.targetCount,
    totalSamples: artifact.summary.totalSamples,
    averageConfidence: artifact.summary.averageConfidence,
    weakestModel: artifact.summary.weakestModel,
    outputDir: rel(OUT_DIR)
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

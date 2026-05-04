#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const SPRITE_EXTRACTION = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'sprite-reference-extraction-0.1.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'sprite-component-targets-0.1');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'sprite-component-targets-0.1.json');

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

function loadPack(){
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(PACK_SOURCE, 'utf8')}\nthis.GALAXY_GUARDIANS_PACK=GALAXY_GUARDIANS_PACK;`, sandbox, { filename: PACK_SOURCE });
  return sandbox.GALAXY_GUARDIANS_PACK;
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
  if(luma < 54 || Math.max(r, g, b) < 75) return '.';
  if(r > 150 && g > 105 && b < 130) return 'A';
  if(r > g * 1.22 && r > b * 1.18) return 'C';
  if(b > r * 1.05 && b > g * .98) return 'W';
  if(g > r * 1.08 && g > b * .82) return 'C';
  if(luma > 145) return 'E';
  return 'C';
}

function litAt(image, x, y){
  const i = (y * image.width + x) * 3;
  return colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]) !== '.';
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
      let minX = x, maxX = x, minY = y, maxY = y, pixels = 0;
      const tokens = {};
      while(q < queue.length){
        const [cx, cy] = queue[q++];
        pixels++;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
        const i = (cy * image.width + cx) * 3;
        const token = colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]);
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
      comps.push({ x:minX, y:minY, w, h, pixels, aspect: rounded(w / Math.max(1, h)), fill: rounded(pixels / Math.max(1, w * h)), tokens });
    }
  }
  return comps;
}

function componentGrid(image, comp, cols, rows){
  const pad = 2;
  const x = Math.max(0, comp.x - pad);
  const y = Math.max(0, comp.y - pad);
  const w = Math.min(image.width - x, comp.w + pad * 2);
  const h = Math.min(image.height - y, comp.h + pad * 2);
  const grid = [];
  for(let gy = 0; gy < rows; gy++){
    let row = '';
    for(let gx = 0; gx < cols; gx++){
      const x0 = Math.floor(x + gx * w / cols);
      const x1 = Math.max(x0 + 1, Math.floor(x + (gx + 1) * w / cols));
      const y0 = Math.floor(y + gy * h / rows);
      const y1 = Math.max(y0 + 1, Math.floor(y + (gy + 1) * h / rows));
      const counts = {};
      let lit = 0;
      for(let py = y0; py < y1; py++){
        for(let px = x0; px < x1; px++){
          const i = (py * image.width + px) * 3;
          const token = colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]);
          if(token === '.') continue;
          lit++;
          counts[token] = (counts[token] || 0) + 1;
        }
      }
      const area = Math.max(1, (x1 - x0) * (y1 - y0));
      row += lit / area < .035 ? '.' : Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '.';
    }
    grid.push(row);
  }
  return grid;
}

function spriteMetrics(rows){
  const text = rows.join('');
  const filled = text.split('').filter(ch => ch !== '.');
  return {
    width: Math.max(...rows.map(row => row.length)),
    height: rows.length,
    filledPixels: filled.length,
    fillRatio: rounded(filled.length / Math.max(1, text.length)),
    tokenChannels: Array.from(new Set(filled)).sort()
  };
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
  return total ? rounded(same / total) : 0;
}

function candidateComponents(extraction, family){
  const samples = Array.from(extraction.cropSummaries?.[family]?.samples || []);
  const candidates = [];
  for(const sample of samples){
    const file = sample.file ? path.join(ROOT, sample.file) : '';
    if(!file || !fs.existsSync(file)) continue;
    const image = decodeImage(file);
    const comps = connectedComponents(image)
      .filter(comp => comp.pixels >= 10 && comp.w >= 4 && comp.h >= 4 && comp.w <= image.width * .45 && comp.h <= image.height * .55);
    for(const comp of comps) candidates.push({ sample, file, image, comp });
  }
  return candidates;
}

function exportComponentPng(file, comp, id){
  const pad = 3;
  const image = probeImage(file);
  const x = Math.max(0, comp.x - pad);
  const y = Math.max(0, comp.y - pad);
  const w = Math.min(image.width - x, comp.w + pad * 2);
  const h = Math.min(image.height - y, comp.h + pad * 2);
  const out = path.join(OUT_DIR, `${id}.png`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  run('ffmpeg', ['-v', 'error', '-i', file, '-vf', `crop=${w}:${h}:${x}:${y}`, '-frames:v', '1', '-y', out]);
  return rel(out);
}

function pickTarget(extraction, pack, spec){
  const runtimeRows = Array.from(pack.alienVisualCatalog?.[spec.id]?.pixelRows || []);
  const candidates = candidateComponents(extraction, spec.sourceCropFamily).map(candidate => {
    const rows = componentGrid(candidate.image, candidate.comp, spec.cols, spec.rows);
    const sim = silhouetteSimilarity(rows, runtimeRows);
    const aspectPenalty = Math.abs(candidate.comp.aspect - spec.aspectTarget);
    const fill = candidate.comp.fill;
    const areaNorm = candidate.comp.pixels / Math.max(1, candidate.image.width * candidate.image.height);
    let score = sim * 4 - aspectPenalty;
    score += Math.min(1.5, areaNorm * 120);
    score += fill > .16 && fill < .82 ? .8 : -.6;
    if(String(candidate.sample.windowId || '').includes(spec.windowHint)) score += 1.2;
    return Object.assign({}, candidate, { rows, sim, score });
  }).sort((a, b) => b.score - a.score);
  const selected = candidates[0];
  if(!selected) fail(`No component target found for ${spec.id}`, { spec });
  const componentCrop = exportComponentPng(selected.file, selected.comp, spec.id);
  return {
    id: spec.id,
    role: spec.role,
    sourceCropFamily: spec.sourceCropFamily,
    sourceCrop: rel(selected.file),
    componentCrop,
    sourceId: selected.sample.sourceId,
    windowId: selected.sample.windowId,
    cols: spec.cols,
    rows: spec.rows,
    componentBox: selected.comp,
    extractedRows: selected.rows,
    runtimeRows,
    extractedMetrics: spriteMetrics(selected.rows),
    runtimeMetrics: spriteMetrics(runtimeRows),
    silhouetteSimilarity: selected.sim,
    reviewStatus: 'component-crop-target-needs-human-sprite-review'
  };
}

function main(){
  if(!fs.existsSync(SPRITE_EXTRACTION)) fail('Missing Guardians sprite extraction artifact.');
  const extraction = readJson(SPRITE_EXTRACTION);
  const pack = loadPack();
  const specs = [
    { id:'signal-flagship', role:'flagship', sourceCropFamily:'rack-upper-aliens', windowHint:'opening-rack', cols:9, rows:8, aspectTarget:1.12 },
    { id:'signal-escort', role:'escort', sourceCropFamily:'lower-field-divers', windowHint:'lower-field', cols:7, rows:6, aspectTarget:1.15 },
    { id:'signal-scout', role:'scout', sourceCropFamily:'rack-upper-aliens', windowHint:'complete-rack', cols:7, rows:6, aspectTarget:1.05 },
    { id:'player-interceptor', role:'player', sourceCropFamily:'player-and-shot', windowHint:'player-single-shot', cols:7, rows:7, aspectTarget:.9 }
  ];
  const targets = specs.map(spec => pickTarget(extraction, pack, spec));
  const output = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'sprite-component-targets',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'component-crop-targets-not-final-pixel-copy',
    generatedBy: 'tools/harness/promote-galaxy-guardians-sprite-component-targets.js',
    sourceEvidence: {
      spriteReferenceExtraction: rel(SPRITE_EXTRACTION),
      note: 'These are tighter component-crop targets derived from source review crops. They are scaffolds for pack-owned sprite authoring, not exact sprite copies.'
    },
    targets,
    summary: {
      targetCount: targets.length,
      averageSilhouetteSimilarity: rounded(targets.reduce((sum, target) => sum + target.silhouetteSimilarity, 0) / Math.max(1, targets.length)),
      weakestTarget: targets.slice().sort((a, b) => a.silhouetteSimilarity - b.silhouetteSimilarity)[0]?.id || ''
    },
    nextAuthoringStep: 'Human-review the component crop PNGs, then tune pack-owned sprite rows against the accepted silhouette targets.'
  };
  writeJson(OUT, output);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    targetCount: output.summary.targetCount,
    averageSilhouetteSimilarity: output.summary.averageSilhouetteSimilarity,
    weakestTarget: output.summary.weakestTarget,
    outputDir: rel(OUT_DIR)
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

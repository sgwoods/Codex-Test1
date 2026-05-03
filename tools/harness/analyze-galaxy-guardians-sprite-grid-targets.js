#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const SPRITE_EXTRACTION = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'sprite-reference-extraction-0.1.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'sprite-grid-targets-0.1.json');

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
  if(luma < 42 || Math.max(r, g, b) < 66) return '.';
  if(r > 150 && g > 110 && b < 125) return 'A';
  if(r > g * 1.25 && r > b * 1.25) return 'C';
  if(b > r * 1.1 && b > g * 1.02) return 'W';
  if(g > r * 1.1 && g > b * .82) return 'C';
  if(luma > 140) return 'E';
  return 'C';
}

function downsampleGrid(file, cols, rows){
  const image = decodeImage(file);
  const grid = [];
  for(let gy = 0; gy < rows; gy++){
    let row = '';
    for(let gx = 0; gx < cols; gx++){
      const x0 = Math.floor(gx * image.width / cols);
      const x1 = Math.max(x0 + 1, Math.floor((gx + 1) * image.width / cols));
      const y0 = Math.floor(gy * image.height / rows);
      const y1 = Math.max(y0 + 1, Math.floor((gy + 1) * image.height / rows));
      const tokens = {};
      let lit = 0;
      for(let y = y0; y < y1; y++){
        for(let x = x0; x < x1; x++){
          const i = (y * image.width + x) * 3;
          const token = colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]);
          if(token === '.') continue;
          lit++;
          tokens[token] = (tokens[token] || 0) + 1;
        }
      }
      const cellArea = Math.max(1, (x1 - x0) * (y1 - y0));
      const token = lit / cellArea < .018 ? '.' : Object.entries(tokens).sort((a, b) => b[1] - a[1])[0]?.[0] || '.';
      row += token;
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

function hamming(aRows, bRows){
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

function cropFor(summary, key){
  const samples = Array.from(summary.cropSummaries?.[key]?.samples || []);
  if(key === 'player-and-shot'){
    const playerLike = samples
      .filter(sample => sample.file && (sample.litRatio || 0) > .01)
      .sort((a, b) => Math.abs((a.litBoxAspect || 0) - 1.2) - Math.abs((b.litBoxAspect || 0) - 1.2))[0];
    if(playerLike?.file) return path.join(ROOT, playerLike.file);
  }
  const strongest = samples
    .filter(sample => sample.file && (sample.litRatio || 0) > .01)
    .sort((a, b) => (b.litRatio || 0) - (a.litRatio || 0))[0];
  const file = strongest?.file || summary.cropSummaries?.[key]?.representative || samples[0]?.file || '';
  return file ? path.join(ROOT, file) : '';
}

function main(){
  if(!fs.existsSync(SPRITE_EXTRACTION)) fail('Missing Guardians sprite extraction artifact.');
  const extraction = readJson(SPRITE_EXTRACTION);
  const pack = loadPack();
  const visualCatalog = pack.alienVisualCatalog || {};
  const targetSpecs = [
    { id: 'signal-flagship', role: 'flagship', sourceCropFamily: 'rack-upper-aliens', cols: 9, rows: 8, minSimilarity: .38 },
    { id: 'signal-escort', role: 'escort', sourceCropFamily: 'lower-field-divers', cols: 7, rows: 6, minSimilarity: .34 },
    { id: 'signal-scout', role: 'scout', sourceCropFamily: 'rack-upper-aliens', cols: 7, rows: 6, minSimilarity: .34 },
    { id: 'player-interceptor', role: 'player', sourceCropFamily: 'player-and-shot', cols: 7, rows: 7, minSimilarity: .34 }
  ];
  const targets = targetSpecs.map(spec => {
    const crop = cropFor(extraction, spec.sourceCropFamily);
    const extractedRows = crop && fs.existsSync(crop) ? downsampleGrid(crop, spec.cols, spec.rows) : [];
    const runtimeRows = Array.from(visualCatalog[spec.id]?.pixelRows || []);
    return Object.assign({}, spec, {
      sourceCrop: crop ? rel(crop) : '',
      extractedRows,
      runtimeRows,
      extractedMetrics: spriteMetrics(extractedRows),
      runtimeMetrics: spriteMetrics(runtimeRows),
      silhouetteSimilarity: hamming(extractedRows, runtimeRows)
    });
  });
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'sprite-grid-targets',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'reference-crop-grid-targets-not-final-pixel-copy',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-sprite-grid-targets.js',
    sourceEvidence: {
      spriteReferenceExtraction: rel(SPRITE_EXTRACTION),
      note: 'These grids are downsampled from broad crop regions and are target scaffolding, not copyright-sensitive exact sprite copies.'
    },
    targets,
    summary: {
      targetCount: targets.length,
      averageSilhouetteSimilarity: rounded(targets.reduce((sum, target) => sum + target.silhouetteSimilarity, 0) / Math.max(1, targets.length)),
      weakestTarget: targets.slice().sort((a, b) => a.silhouetteSimilarity - b.silhouetteSimilarity)[0]?.id || ''
    },
    nextAuthoringStep: 'Use tighter manually reviewed component crops to replace these broad downsampled grids, then tune pack-owned sprites against the checked target metrics.'
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    targetCount: artifact.summary.targetCount,
    averageSilhouetteSimilarity: artifact.summary.averageSilhouetteSimilarity,
    weakestTarget: artifact.summary.weakestTarget
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

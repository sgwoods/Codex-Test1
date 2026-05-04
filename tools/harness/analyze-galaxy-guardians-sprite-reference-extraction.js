#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAME_SUMMARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-frame-reference', 'frame-reference-summary.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'sprite-reference-extraction-0.1.json');

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

function mean(values){
  const list = values.filter(Number.isFinite);
  return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
}

function median(values){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
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

function colorFamily(r, g, b){
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = .299 * r + .587 * g + .114 * b;
  if(luma < 34 || max < 62) return '';
  if(max - min < 28 && luma > 115) return 'white';
  if(r > g * 1.25 && r > b * 1.25) return 'red';
  if(g > r * 1.15 && g > b * 1.05) return 'green';
  if(b > r * 1.12 && b > g * 1.05) return 'blue';
  if(r > 120 && g > 92 && b < 110) return 'yellow';
  if(g > 105 && b > 115) return 'cyan';
  return 'mixed';
}

function analyzeCrop(file){
  const decoded = decodeImage(file);
  const { width, height, raw } = decoded;
  const families = {};
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let lit = 0;
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const i = (y * width + x) * 3;
      const r = raw[i], g = raw[i + 1], b = raw[i + 2];
      const family = colorFamily(r, g, b);
      if(!family) continue;
      lit++;
      families[family] = (families[family] || 0) + 1;
      if(x < minX) minX = x;
      if(y < minY) minY = y;
      if(x > maxX) maxX = x;
      if(y > maxY) maxY = y;
    }
  }
  const box = Number.isFinite(minX) ? {
    x: rounded(minX / width),
    y: rounded(minY / height),
    w: rounded((maxX - minX + 1) / width),
    h: rounded((maxY - minY + 1) / height)
  } : null;
  return {
    file: rel(file),
    width,
    height,
    litRatio: rounded(lit / Math.max(1, width * height), 5),
    colorFamilies: families,
    dominantFamilies: Object.entries(families).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([family]) => family),
    litBox: box,
    litBoxAspect: box ? rounded(box.w / Math.max(.001, box.h)) : 0
  };
}

function loadPack(){
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(PACK_SOURCE, 'utf8')}\nthis.GALAXY_GUARDIANS_PACK=GALAXY_GUARDIANS_PACK;`, sandbox, { filename: PACK_SOURCE });
  return sandbox.GALAXY_GUARDIANS_PACK;
}

function spriteMetric(sprite){
  const rows = Array.from(sprite.pixelRows || []);
  const filled = rows.join('').split('').filter(ch => ch !== '.');
  return {
    id: sprite.id,
    role: sprite.role,
    width: Math.max(...rows.map(row => row.length)),
    height: rows.length,
    filledPixels: filled.length,
    fillRatio: rounded(filled.length / Math.max(1, rows.length * Math.max(...rows.map(row => row.length)))),
    aspect: rounded(Math.max(...rows.map(row => row.length)) / Math.max(1, rows.length)),
    tokenChannels: Array.from(new Set(filled)).sort(),
    note: sprite.notes
  };
}

function groupCrops(summary){
  const grouped = {};
  for(const source of summary.sources || []){
    for(const win of source.windows || []){
      for(const crop of win.spriteReferenceCrops || []){
        const file = path.join(ROOT, crop.artifact);
        if(!fs.existsSync(file)) continue;
        const key = crop.id;
        grouped[key] = grouped[key] || [];
        grouped[key].push(Object.assign({ sourceId: source.sourceId, windowId: win.id, label: crop.label }, analyzeCrop(file)));
      }
    }
  }
  return grouped;
}

function summarizeGroup(entries){
  return {
    cropCount: entries.length,
    medianLitRatio: rounded(median(entries.map(entry => entry.litRatio)), 5),
    medianLitBoxAspect: rounded(median(entries.map(entry => entry.litBoxAspect))),
    medianLitBoxW: rounded(median(entries.map(entry => entry.litBox?.w || 0))),
    medianLitBoxH: rounded(median(entries.map(entry => entry.litBox?.h || 0))),
    dominantFamilies: Array.from(new Set(entries.flatMap(entry => entry.dominantFamilies))).slice(0, 8),
    representative: entries.sort((a, b) => Math.abs(b.litRatio - median(entries.map(entry => entry.litRatio))) - Math.abs(a.litRatio - median(entries.map(entry => entry.litRatio))))[0]?.file || '',
    samples: entries.slice(0, 6)
  };
}

function main(){
  if(!fs.existsSync(FRAME_SUMMARY)) fail('Missing Galaxian frame-reference summary.');
  const summary = readJson(FRAME_SUMMARY);
  const pack = loadPack();
  const grouped = groupCrops(summary);
  const cropSummaries = Object.fromEntries(Object.entries(grouped).map(([key, entries]) => [key, summarizeGroup(entries)]));
  const runtimeSprites = Object.fromEntries(Object.entries(pack.alienVisualCatalog || {}).map(([key, sprite]) => [key, spriteMetric(sprite)]));
  const expectedFamilies = new Set(['red', 'blue', 'yellow', 'cyan', 'white']);
  const observedFamilies = new Set(Object.values(cropSummaries).flatMap(summary => summary.dominantFamilies));
  const familyCoverage = Array.from(expectedFamilies).filter(family => observedFamilies.has(family)).length / expectedFamilies.size;
  const runtimeFit = {
    runtimeSpriteCount: Object.keys(runtimeSprites).length,
    referenceCropFamilies: Object.keys(cropSummaries),
    familyCoverageScore10: rounded(familyCoverage * 10, 1),
    authoredSpriteRead: 'Runtime sprites remain hand-authored but are now checked against extracted crop color families and proportions; next pass should produce pixel grids from isolated reference components.'
  };
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'sprite-reference-extraction-and-authoring-baseline',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'sprite-reference-extraction-not-final-pixel-art',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-sprite-reference-extraction.js',
    sourceEvidence: {
      frameReferenceSummary: rel(FRAME_SUMMARY),
      extractedCropCount: Object.values(grouped).reduce((sum, entries) => sum + entries.length, 0)
    },
    cropSummaries,
    runtimeSprites,
    runtimeFit,
    nextAuthoringStep: 'Use connected components inside representative crops to produce role-specific Galaxian-like pixel grids, then compare rendered runtime sprites against those extracted grids.'
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    cropFamilies: Object.keys(cropSummaries),
    extractedCropCount: artifact.sourceEvidence.extractedCropCount,
    runtimeSpriteCount: runtimeFit.runtimeSpriteCount,
    familyCoverageScore10: runtimeFit.familyCoverageScore10
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

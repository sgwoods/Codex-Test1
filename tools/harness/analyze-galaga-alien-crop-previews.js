#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const MANIFEST = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-alien-visual-reference', 'crop-box-manifest-0.1.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-crop-previews');
const PREVIEW_DIR = path.join(OUT_DIR, 'latest-previews');
const OUT = path.join(OUT_DIR, 'latest.json');
const MARKDOWN = path.join(ROOT, 'GALAGA_ALIEN_CROP_PREVIEW.md');

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

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
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

function rounded(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
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
  if(luma < 30 || max < 52) return '.';
  if(max - min < 24) return luma > 140 ? 'W' : '.';
  if(r > 150 && g > 105 && b < 130) return 'Y';
  if(r > g * 1.22 && r > b * 1.18) return 'R';
  if(g > r * 1.1 && g > b * .9) return 'G';
  if(b > r * 1.05 && b > g * .95) return 'B';
  if(g > 100 && b > 100) return 'C';
  return 'M';
}

function cropBounds(crop, image){
  const x = Math.max(0, Math.floor(+crop.x || 0));
  const y = Math.max(0, Math.floor(+crop.y || 0));
  const width = Math.max(1, Math.floor(+crop.width || +crop.w || 1));
  const height = Math.max(1, Math.floor(+crop.height || +crop.h || 1));
  if(x + width > image.width || y + height > image.height){
    fail('Crop exceeds source image bounds.', { crop, sourceDimensions: { width: image.width, height: image.height } });
  }
  return { x, y, width, height };
}

function metricsForCrop(image, crop){
  const box = cropBounds(crop, image);
  const tokens = {};
  let lit = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for(let yy = box.y; yy < box.y + box.height; yy++){
    for(let xx = box.x; xx < box.x + box.width; xx++){
      const i = (yy * image.width + xx) * 3;
      const token = colorToken(image.raw[i], image.raw[i + 1], image.raw[i + 2]);
      if(token === '.') continue;
      lit++;
      tokens[token] = (tokens[token] || 0) + 1;
      minX = Math.min(minX, xx);
      minY = Math.min(minY, yy);
      maxX = Math.max(maxX, xx);
      maxY = Math.max(maxY, yy);
    }
  }
  const area = Math.max(1, box.width * box.height);
  return {
    crop: box,
    litPixels: lit,
    litRatio: rounded(lit / area, 5),
    tokenChannels: Object.keys(tokens).sort(),
    litBox: Number.isFinite(minX)
      ? { x: minX - box.x, y: minY - box.y, width: maxX - minX + 1, height: maxY - minY + 1 }
      : null
  };
}

function writePreview(source, crop, outFile, options = {}){
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const scale = Math.max(1, +options.scale || 3);
  const box = cropBounds(crop, probeImage(source));
  const filters = [`crop=${box.width}:${box.height}:${box.x}:${box.y}`, `scale=iw*${scale}:ih*${scale}:flags=neighbor`];
  if(options.gridHint){
    const cellW = Math.max(1, Math.floor((+options.gridHint.cellWidth || 16) * scale));
    const cellH = Math.max(1, Math.floor((+options.gridHint.cellHeight || 16) * scale));
    filters.push(`drawgrid=w=${cellW}:h=${cellH}:t=2:c=yellow@0.72`);
  }
  run('ffmpeg', ['-v', 'error', '-i', source, '-vf', filters.join(','), '-frames:v', '1', '-y', outFile]);
  return rel(outFile);
}

function gridCellsForRegion(region, image){
  const hint = region.gridHint || null;
  if(!hint) return [];
  const cells = [];
  const cellWidth = Math.max(1, Math.floor(+hint.cellWidth || 16));
  const cellHeight = Math.max(1, Math.floor(+hint.cellHeight || 16));
  const columns = Math.max(1, Math.floor(+hint.columns || Math.floor(region.crop.width / cellWidth)));
  const rows = Math.max(1, Math.floor(+hint.rows || Math.floor(region.crop.height / cellHeight)));
  for(let row = 0; row < rows; row++){
    for(let col = 0; col < columns; col++){
      const crop = {
        x: Math.floor(region.crop.x + col * cellWidth),
        y: Math.floor(region.crop.y + row * cellHeight),
        width: Math.min(cellWidth, image.width - Math.floor(region.crop.x + col * cellWidth)),
        height: Math.min(cellHeight, image.height - Math.floor(region.crop.y + row * cellHeight))
      };
      if(crop.width <= 0 || crop.height <= 0) continue;
      const metrics = metricsForCrop(image, crop);
      const interesting = metrics.litPixels >= 8 && metrics.litRatio >= .018;
      cells.push({
        cellKey: `${region.id}-r${String(row + 1).padStart(2, '0')}-c${String(col + 1).padStart(2, '0')}`,
        regionId: region.id,
        row: row + 1,
        column: col + 1,
        crop,
        interesting,
        litPixels: metrics.litPixels,
        litRatio: metrics.litRatio,
        tokenChannels: metrics.tokenChannels,
        litBox: metrics.litBox
      });
    }
  }
  return cells;
}

function markdownReport(artifact){
  const lines = [
    '# Galaga Alien Crop Preview',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This report turns the supplied Galaga general sprite sheet into reviewable region previews and candidate cells. It is not yet a canonical promoted target-crop set; exact per-role and per-pose boxes still need review.',
    '',
    '## Summary',
    '',
    `- Source image: \`${artifact.sourceImage}\``,
    `- Regions: ${artifact.summary.regionCount}`,
    `- Grid cells scanned: ${artifact.summary.gridCellCount}`,
    `- Interesting lit cells: ${artifact.summary.interestingCellCount}`,
    `- Persisted interesting cell boxes: ${artifact.summary.persistedInterestingCellCount}`,
    `- Target role plans: ${artifact.summary.targetRoleCount}`,
    '',
    '## Region Previews',
    '',
    '| Region | Preview | Grid Preview | Candidate Read |',
    '| --- | --- | --- | --- |'
  ];
  for(const region of artifact.regions){
    const candidateRead = region.gridCellCount
      ? `${region.interestingCellCount}/${region.gridCellCount} lit candidate cells; channels ${region.tokenChannels.join(', ') || 'none'}`
      : `region-level review; ${region.litPixels} lit pixels; channels ${region.tokenChannels.join(', ') || 'none'}`;
    lines.push(`| ${region.label}<br>\`${region.id}\` | ![](${region.previewImage}) | ${region.gridPreviewImage ? `![](${region.gridPreviewImage})` : 'n/a'} | ${candidateRead} |`);
  }
  lines.push('', '## Role Review Plan', '', '| Role | Required Poses | Candidate Regions | Next Action |', '| --- | --- | --- | --- |');
  for(const role of artifact.targetRolePlan){
    lines.push(`| \`${role.roleKey}\` | ${(role.requiredPoses || []).join(', ')} | ${(role.candidateRegions || []).join(', ')} | ${role.nextAction || ''} |`);
  }
  lines.push('', `Next best step: ${artifact.nextBestStep}`, '');
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(MANIFEST)) fail(`Missing crop-box manifest: ${rel(MANIFEST)}`);
  const manifest = readJson(MANIFEST);
  const source = path.join(ROOT, manifest.sourceImage || '');
  if(!fs.existsSync(source)) fail('Missing crop source image.', { sourceImage: manifest.sourceImage });
  const image = decodeImage(source);
  const expected = manifest.sourceDimensions || {};
  if((expected.width && expected.width !== image.width) || (expected.height && expected.height !== image.height)){
    fail('Source image dimensions do not match crop manifest.', { expected, actual: { width: image.width, height: image.height } });
  }
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const regions = (manifest.regions || []).map(region => {
    const previewImage = writePreview(source, region.crop, path.join(PREVIEW_DIR, `${region.id}.png`), { scale: 3 });
    const gridPreviewImage = region.gridHint
      ? writePreview(source, region.crop, path.join(PREVIEW_DIR, `${region.id}-grid.png`), { scale: 3, gridHint: region.gridHint })
      : '';
    const metrics = metricsForCrop(image, region.crop);
    const gridCells = gridCellsForRegion(region, image);
    const interesting = gridCells.filter(cell => cell.interesting);
    return {
      id: region.id,
      label: region.label,
      crop: Object.assign({ sourceWidth: image.width, sourceHeight: image.height }, region.crop),
      previewImage,
      gridPreviewImage,
      gridHint: region.gridHint || null,
      expectedContents: region.expectedContents || [],
      promotionStatus: region.promotionStatus || '',
      litPixels: metrics.litPixels,
      litRatio: metrics.litRatio,
      tokenChannels: metrics.tokenChannels,
      litBox: metrics.litBox,
      gridCellCount: gridCells.length,
      interestingCellCount: interesting.length,
      interestingCells: interesting,
      nextReview: region.gridHint
        ? 'Review grid overlay, then promote exact role/pose cells into target crops.'
        : 'Review region contents and add exact crop boxes for effects or beam phases.'
    };
  });
  const gridCellCount = regions.reduce((sum, region) => sum + region.gridCellCount, 0);
  const interestingCellCount = regions.reduce((sum, region) => sum + region.interestingCellCount, 0);
  const targetRolePlan = (manifest.targetRolePlan || []).map(role => {
    const candidateRegions = regions.filter(region => (role.candidateRegions || []).includes(region.id));
    return Object.assign({}, role, {
      candidateRegionPreviewImages: candidateRegions.map(region => region.gridPreviewImage || region.previewImage).filter(Boolean),
      candidateRegionCount: candidateRegions.length,
      candidateCellCount: candidateRegions.reduce((sum, region) => sum + region.gridCellCount, 0),
      interestingCellCount: candidateRegions.reduce((sum, region) => sum + region.interestingCellCount, 0),
      promotionStatus: 'preview-generated-review-required'
    });
  });
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-alien-visual-crop-previews',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    status: 'preview-generated-review-required',
    sourceManifest: rel(MANIFEST),
    sourceImage: manifest.sourceImage,
    sourceDimensions: { width: image.width, height: image.height },
    summary: {
      regionCount: regions.length,
      gridCellCount,
      interestingCellCount,
      targetRoleCount: targetRolePlan.length,
      persistedInterestingCellCount: interestingCellCount,
      scoredStatus: 'unscored-preview-only'
    },
    measurementLimits: [
      'Region and grid previews are for crop review; they are not promoted canonical sprite targets yet.',
      'Interesting cells are detected by lit-pixel density and still require human review for exact role and pose assignment.',
      'All interesting cell boxes are persisted in this artifact so later promotion tools can select exact target crops without re-scanning the source sheet.',
      'Motion conformance will remain capped until accepted crops are grouped into temporal pose sets.'
    ],
    regions,
    targetRolePlan,
    nextBestStep: 'Review the generated grid overlays and interesting cells, then promote exact accepted per-role and per-pose crops into a scored target-pose artifact.'
  };
  writeJson(OUT, artifact);
  writeText(MARKDOWN, markdownReport(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(MARKDOWN),
    previewDir: rel(PREVIEW_DIR),
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

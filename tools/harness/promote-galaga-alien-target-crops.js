#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const MANIFEST = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-alien-visual-reference', 'crop-box-manifest-0.1.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-target-crops');
const CROP_DIR = path.join(OUT_DIR, 'latest-crops');
const OUT = path.join(OUT_DIR, 'latest.json');
const MARKDOWN = path.join(ROOT, 'GALAGA_ALIEN_TARGET_CROPS.md');
const MOTION_REFERENCE_VIDEO = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-alien-motion-reference', 'source-video', 'galaga-alien-pulse-reference.mp4');

const CROP_SPECS = [
  cellSpec('player-fighter-single-front', 'player-fighter', 'single-ship-front', 'left-primary-sprite-grid', 1, 8, 'Best first-pass front-facing fighter cell in the supplied sheet. Dual-fighter remains a composite scoring target.'),
  cellSpec('player-fighter-turn-left', 'player-fighter', 'turn-left', 'left-primary-sprite-grid', 1, 6, 'Rotation/turn pose for future motion and capture/rescue scoring.'),
  cellSpec('player-fighter-turn-right', 'player-fighter', 'turn-right', 'left-primary-sprite-grid', 1, 7, 'Rotation/turn pose for future motion and capture/rescue scoring.'),

  motionSpec('bee-zako-formation-front', 'bee-zako', 'formation-front', 10.0, { x: 384, y: 86, width: 58, height: 54 }, 'Trusted clean bee/Zako formation crop from the segmented alien motion reference; replaces the polluted sheet-cell primary target.'),
  cellSpec('bee-zako-flap-a', 'bee-zako', 'flap-a', 'left-primary-sprite-grid', 6, 6, 'Wing/pose phase candidate for future flap cadence scoring.'),
  cellSpec('bee-zako-flap-b', 'bee-zako', 'flap-b', 'left-primary-sprite-grid', 6, 7, 'Alternating wing/pose phase candidate for future flap cadence scoring.'),
  cellSpec('bee-zako-dive-left', 'bee-zako', 'dive-left', 'left-primary-sprite-grid', 6, 1, 'Dive/rotation silhouette candidate for approach-path scoring.'),
  cellSpec('bee-zako-dive-right', 'bee-zako', 'dive-right', 'left-primary-sprite-grid', 6, 2, 'Mirrored dive/rotation silhouette candidate for approach-path scoring.'),

  motionSpec('butterfly-escort-formation-front', 'butterfly-escort', 'formation-front', 10.0, { x: 225, y: 95, width: 62, height: 42 }, 'Trusted clean butterfly/escort formation crop from the segmented alien motion reference; replaces the polluted sheet-cell primary target.'),
  cellSpec('butterfly-escort-flap-a', 'butterfly-escort', 'flap-a', 'left-primary-sprite-grid', 5, 6, 'Wing/pose phase candidate for future flap cadence scoring.'),
  cellSpec('butterfly-escort-flap-b', 'butterfly-escort', 'flap-b', 'left-primary-sprite-grid', 5, 7, 'Alternating wing/pose phase candidate for future flap cadence scoring.'),
  cellSpec('butterfly-escort-dive-left', 'butterfly-escort', 'dive-left', 'left-primary-sprite-grid', 5, 1, 'Dive/rotation silhouette candidate for escort path scoring.'),
  cellSpec('butterfly-escort-dive-right', 'butterfly-escort', 'dive-right', 'left-primary-sprite-grid', 5, 2, 'Mirrored dive/rotation silhouette candidate for escort path scoring.'),

  motionSpec('boss-galaga-formation-front', 'boss-galaga', 'formation-front', 10.0, { x: 22, y: 78, width: 60, height: 62 }, 'Trusted clean teal boss formation crop from the segmented alien motion reference; replaces the polluted sheet-cell primary target.'),
  motionSpec('boss-galaga-flap-a', 'boss-galaga', 'flap-a', 10.0, { x: 22, y: 78, width: 60, height: 62 }, 'Trusted clean boss pulse/pose phase A from the segmented alien motion reference.'),
  motionSpec('boss-galaga-flap-b', 'boss-galaga', 'flap-b', 10.0, { x: 86, y: 78, width: 60, height: 62 }, 'Trusted clean purple boss pulse/pose phase B from the segmented alien motion reference.'),
  cellSpec('boss-galaga-dive-left', 'boss-galaga', 'dive-left', 'left-primary-sprite-grid', 3, 1, 'Boss dive/rotation silhouette candidate.'),
  cellSpec('boss-galaga-dive-right', 'boss-galaga', 'dive-right', 'left-primary-sprite-grid', 3, 2, 'Mirrored boss dive/rotation silhouette candidate.'),

  cellSpec('challenge-green-family-front', 'challenge-specialty-aliens', 'green-family-front', 'left-primary-sprite-grid', 8, 7, 'Green specialty/challenge-family pose; first-pass target for late challenge novelty.'),
  cellSpec('challenge-green-family-dive', 'challenge-specialty-aliens', 'green-family-dive', 'left-primary-sprite-grid', 8, 1, 'Green specialty/challenge-family dive silhouette.'),
  cellSpec('challenge-yellow-family-front', 'challenge-specialty-aliens', 'yellow-family-front', 'left-primary-sprite-grid', 9, 7, 'Yellow specialty/challenge-family pose; first-pass target for late challenge novelty.'),
  cellSpec('challenge-yellow-family-dive', 'challenge-specialty-aliens', 'yellow-family-dive', 'left-primary-sprite-grid', 9, 1, 'Yellow specialty/challenge-family dive silhouette.'),
  cellSpec('challenge-magenta-family-front', 'challenge-specialty-aliens', 'magenta-family-front', 'center-alien-pose-grid', 10, 3, 'Magenta late-family cell for challenge-stage alien variety.'),
  cellSpec('challenge-blue-yellow-family-front', 'challenge-specialty-aliens', 'blue-yellow-family-front', 'center-alien-pose-grid', 10, 6, 'Blue/yellow late-family cell for challenge-stage alien variety.'),

  cropSpec('impact-explosion-small', 'projectiles-and-impacts', 'enemy-explosion-small', 'top-effects-and-capture-icons', { x: 177, y: 0, width: 32, height: 32 }, 'Small-to-medium explosion/impact phase candidate.'),
  cropSpec('impact-explosion-large', 'projectiles-and-impacts', 'boss-explosion-large', 'top-effects-and-capture-icons', { x: 209, y: 0, width: 32, height: 32 }, 'Large explosion/impact phase candidate for boss and ship-loss feedback.'),
  cropSpec('projectile-player-shot', 'projectiles-and-impacts', 'player-shot', 'right-tractor-beam-and-scoring', { x: 304, y: 120, width: 16, height: 16 }, 'Vertical projectile candidate for player-shot scale and palette.'),
  cropSpec('projectile-enemy-shot', 'projectiles-and-impacts', 'enemy-shot', 'right-tractor-beam-and-scoring', { x: 304, y: 136, width: 16, height: 16 }, 'Enemy projectile candidate for shot feedback and avoidance readability.'),
  cropSpec('projectile-diagonal-shot', 'projectiles-and-impacts', 'diagonal-shot', 'right-tractor-beam-and-scoring', { x: 320, y: 120, width: 16, height: 16 }, 'Diagonal projectile candidate for enemy-shot vocabulary.'),

  cropSpec('tractor-beam-wide', 'tractor-beam', 'beam-wide', 'right-tractor-beam-and-scoring', { x: 288, y: 34, width: 50, height: 84 }, 'Wide tractor-beam band candidate for capture-state width and color rhythm.'),
  cropSpec('tractor-beam-mid', 'tractor-beam', 'beam-mid', 'right-tractor-beam-and-scoring', { x: 342, y: 34, width: 50, height: 84 }, 'Mid-width tractor-beam band candidate.'),
  cropSpec('tractor-beam-narrow', 'tractor-beam', 'beam-narrow', 'right-tractor-beam-and-scoring', { x: 396, y: 34, width: 50, height: 84 }, 'Narrow tractor-beam band candidate.')
];

function cellSpec(id, roleKey, poseKey, sourceRegion, row, column, note){
  return {
    id,
    roleKey,
    poseKey,
    sourceKind: 'sheet-cell',
    sourceRegion,
    sourceCell: { row, column },
    note,
    reviewStatus: 'provisional-source-sheet-cell'
  };
}

function cropSpec(id, roleKey, poseKey, sourceRegion, crop, note){
  return {
    id,
    roleKey,
    poseKey,
    sourceKind: 'sheet-crop',
    sourceRegion,
    crop,
    note,
    reviewStatus: 'accepted-source-sheet-crop'
  };
}

function motionSpec(id, roleKey, poseKey, timeSeconds, frameCrop, note){
  return {
    id,
    roleKey,
    poseKey,
    sourceKind: 'motion-reference-video',
    sourceRegion: 'segmented-alien-motion-reference',
    sourceVideo: rel(MOTION_REFERENCE_VIDEO),
    timeSeconds,
    frameCrop,
    note,
    reviewStatus: 'accepted-trusted-motion-reference'
  };
}

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
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
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
  const streams = JSON.parse(raw).streams || [];
  const stream = streams.find(item => item.width && item.height) || streams[0] || {};
  return { width: stream.width || 0, height: stream.height || 0 };
}

function decodeImage(file){
  const { width, height } = probeImage(file);
  const raw = run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { encoding: 'buffer' });
  return { width, height, raw };
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

function rawVideoCrop(video, timeSeconds, crop){
  if(!fs.existsSync(video)) fail('Missing segmented alien motion reference video.', { sourceVideo: rel(video) });
  return run('ffmpeg', [
    '-v', 'error',
    '-ss', String(timeSeconds),
    '-i', video,
    '-vf', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    '-frames:v', '1',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    'pipe:1'
  ], { encoding: 'buffer' });
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

function regionMap(manifest){
  const map = new Map();
  for(const region of manifest.regions || []) map.set(region.id, region);
  return map;
}

function resolvedCrop(spec, regions){
  if(spec.crop) return spec.crop;
  const region = regions.get(spec.sourceRegion);
  if(!region) fail('Target crop references an unknown source region.', spec);
  const hint = region.gridHint;
  if(!hint) fail('Target crop source cell requires a gridHint.', spec);
  const row = Math.max(1, +spec.sourceCell?.row || 1);
  const column = Math.max(1, +spec.sourceCell?.column || 1);
  return {
    x: Math.floor(region.crop.x + (column - 1) * hint.cellWidth),
    y: Math.floor(region.crop.y + (row - 1) * hint.cellHeight),
    width: Math.floor(hint.cellWidth),
    height: Math.floor(hint.cellHeight)
  };
}

function promoteCrop(spec, source, sourceDimensions, regions){
  if(spec.sourceKind === 'motion-reference-video'){
    return promoteMotionCrop(spec);
  }
  const crop = resolvedCrop(spec, regions);
  if(crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > sourceDimensions.width || crop.y + crop.height > sourceDimensions.height){
    fail('Target crop exceeds source sheet bounds.', { spec, crop, sourceDimensions });
  }
  fs.mkdirSync(CROP_DIR, { recursive: true });
  const outFile = path.join(CROP_DIR, `${spec.id}.png`);
  run('ffmpeg', [
    '-v', 'error',
    '-i', source,
    '-vf', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    '-frames:v', '1',
    '-y',
    outFile
  ]);
  const metrics = imageMetrics(outFile);
  if(metrics.litPixels < 3) fail('Target crop has too few visible pixels.', { spec, crop, metrics });
  return Object.assign({}, spec, {
    label: `${roleLabel(spec.roleKey)} ${spec.poseKey}`,
    sourceImage: rel(source),
    crop: Object.assign({ sourceWidth: sourceDimensions.width, sourceHeight: sourceDimensions.height }, crop),
    targetCrop: rel(outFile),
    sourcePixelExact: true,
    pixelScale: 1,
    metrics
  });
}

function promoteMotionCrop(spec){
  const sourceDimensions = probeImage(MOTION_REFERENCE_VIDEO);
  const crop = spec.frameCrop;
  if(crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > sourceDimensions.width || crop.y + crop.height > sourceDimensions.height){
    fail('Motion-reference crop exceeds source video frame bounds.', { spec, crop, sourceDimensions });
  }
  fs.mkdirSync(CROP_DIR, { recursive: true });
  const outFile = path.join(CROP_DIR, `${spec.id}.png`);
  const raw = rawVideoCrop(MOTION_REFERENCE_VIDEO, spec.timeSeconds, crop);
  const cleaned = cleanMotionReferenceCrop(raw, crop.width, crop.height);
  if(!cleaned.litBox) fail('Motion-reference crop did not contain visible sprite pixels.', { spec, crop });
  encodeRawPng(cleaned.raw, cleaned.width, cleaned.height, outFile);
  const metrics = imageMetrics(outFile);
  if(metrics.litPixels < 3) fail('Motion-reference target crop has too few visible pixels.', { spec, crop, metrics });
  return Object.assign({}, spec, {
    label: `${roleLabel(spec.roleKey)} ${spec.poseKey}`,
    sourceImage: rel(MOTION_REFERENCE_VIDEO),
    sourceVideo: rel(MOTION_REFERENCE_VIDEO),
    sourceFrameSeconds: spec.timeSeconds,
    crop: Object.assign({ sourceWidth: sourceDimensions.width, sourceHeight: sourceDimensions.height }, crop),
    cleanedCrop: cleaned.litBox,
    targetCrop: rel(outFile),
    sourcePixelExact: false,
    videoDerivedCleanCrop: true,
    pixelScale: 1,
    metrics
  });
}

function promoteDualFighterComposite(targetCrops){
  const component = targetCrops.find(crop => crop.id === 'player-fighter-single-front');
  if(!component) fail('Cannot build dual-fighter composite without player-fighter-single-front.');
  const componentFile = path.join(ROOT, component.targetCrop);
  const outFile = path.join(CROP_DIR, 'player-fighter-dual-front.png');
  run('ffmpeg', [
    '-v', 'error',
    '-f', 'lavfi',
    '-i', 'color=c=black:s=38x16',
    '-i', componentFile,
    '-i', componentFile,
    '-filter_complex', '[0:v][1:v]overlay=0:0[tmp];[tmp][2:v]overlay=22:0',
    '-frames:v', '1',
    '-y',
    outFile
  ]);
  const metrics = imageMetrics(outFile);
  return {
    id: 'player-fighter-dual-front',
    roleKey: 'player-fighter',
    poseKey: 'dual-fighter-front',
    label: 'Player Fighter dual-fighter-front',
    sourceImage: component.sourceImage,
    sourceRegion: 'derived-composite',
    sourceCell: null,
    crop: { x: 0, y: 0, width: 38, height: 16 },
    targetCrop: rel(outFile),
    sourcePixelExact: false,
    exactComposite: true,
    pixelScale: 1,
    compositeTarget: true,
    componentCrops: [
      { id: component.id, x: 0, y: 0 },
      { id: component.id, x: 22, y: 0 }
    ],
    reviewStatus: 'accepted-first-pass-composite',
    note: 'Derived dual-fighter target composed from two exact source-sheet player-fighter crops. This prevents the dual runtime state from being scored against a single fighter while preserving the source crop pixels.',
    metrics
  };
}

function roleLabel(roleKey){
  return String(roleKey || '')
    .split('-')
    .map(part => part ? part[0].toUpperCase() + part.slice(1) : '')
    .join(' ');
}

function roleSets(targetCrops, manifest){
  const requiredByRole = new Map((manifest.targetRolePlan || []).map(role => [role.roleKey, role.requiredPoses || []]));
  const map = new Map();
  for(const crop of targetCrops){
    const current = map.get(crop.roleKey) || {
      roleKey: crop.roleKey,
      label: roleLabel(crop.roleKey),
      requiredPoses: requiredByRole.get(crop.roleKey) || [],
      promotedPoseCount: 0,
      promotedPoses: [],
      targetCrops: [],
      status: 'accepted-first-pass'
    };
    current.promotedPoseCount += 1;
    current.promotedPoses.push(crop.poseKey);
    current.targetCrops.push(crop.id);
    map.set(crop.roleKey, current);
  }
  return Array.from(map.values()).map(role => Object.assign(role, {
    coverageRead: `${role.promotedPoseCount} promoted crop(s); required pose contract: ${role.requiredPoses.join(', ') || 'none recorded'}`
  })).sort((a, b) => a.roleKey.localeCompare(b.roleKey));
}

function markdownReport(artifact){
  const lines = [
    '# Galaga Alien Target Crops',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This report promotes target crops from two evidence classes: trusted cleaned crops from the segmented Galaga alien motion reference, and provisional/exact crops from the supplied Galaga general sprite sheet. The trusted motion crops now anchor the primary Boss, Bee, and Butterfly formation targets after human review found polluted sheet-cell evidence. These are conformance targets for measurement, not production art, and they do not yet score temporal motion by themselves.',
    '',
    '## Summary',
    '',
    `- Source image: \`${artifact.sourceImage}\``,
    `- Promoted target crops: ${artifact.summary.targetCropCount}`,
    `- Role sets: ${artifact.summary.roleSetCount}`,
    `- Review status: ${artifact.status}`,
    '',
    '## Role Sets',
    '',
    '| Role | Promoted Poses | Coverage Read |',
    '| --- | --- | --- |'
  ];
  for(const role of artifact.roleSets){
    lines.push(`| \`${role.roleKey}\` | ${role.promotedPoses.map(pose => `\`${pose}\``).join(', ')} | ${role.coverageRead} |`);
  }
  lines.push('', '## Target Crops', '', '| Role | Pose | Crop | Source | Metrics | Note |', '| --- | --- | --- | --- | --- | --- |');
  for(const crop of artifact.targetCrops){
    const cell = crop.sourceCell ? `${crop.sourceRegion} r${crop.sourceCell.row} c${crop.sourceCell.column}` : crop.sourceRegion;
    lines.push(`| \`${crop.roleKey}\` | \`${crop.poseKey}\` | ![](${crop.targetCrop}) | ${cell}<br>\`${crop.crop.x},${crop.crop.y} ${crop.crop.width}x${crop.crop.height}\` | ${crop.metrics.litPixels} lit px; channels ${(crop.metrics.tokenChannels || []).join(', ') || 'none'} | ${crop.note || ''} |`);
  }
  lines.push('', `Next best step: ${artifact.nextBestStep}`, '');
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(MANIFEST)) fail(`Missing crop-box manifest: ${rel(MANIFEST)}`);
  const manifest = readJson(MANIFEST);
  const source = path.join(ROOT, manifest.sourceImage || '');
  if(!fs.existsSync(source)) fail('Missing target source image.', { sourceImage: manifest.sourceImage });
  const sourceDimensions = probeImage(source);
  const expected = manifest.sourceDimensions || {};
  if((expected.width && expected.width !== sourceDimensions.width) || (expected.height && expected.height !== sourceDimensions.height)){
    fail('Source image dimensions do not match crop manifest.', { expected, sourceDimensions });
  }
  const regions = regionMap(manifest);
  const targetCrops = CROP_SPECS.map(spec => promoteCrop(spec, source, sourceDimensions, regions));
  targetCrops.push(promoteDualFighterComposite(targetCrops));
  const roleSetRows = roleSets(targetCrops, manifest);
  const trustedMotionCount = targetCrops.filter(crop => crop.videoDerivedCleanCrop).length;
  const provisionalSheetCount = targetCrops.filter(crop => crop.reviewStatus === 'provisional-source-sheet-cell').length;
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-alien-target-crops',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    status: 'trusted-motion-overrides-plus-provisional-sheet-crops',
    sourceManifest: rel(MANIFEST),
    sourceImage: manifest.sourceImage,
    sourceDimensions,
    sourceAuthority: manifest.authority,
    summary: {
      targetCropCount: targetCrops.length,
      roleSetCount: roleSetRows.length,
      promotedRoles: roleSetRows.map(role => role.roleKey),
      sourcePixelExact: false,
      trustedMotionReferenceCount: trustedMotionCount,
      provisionalSourceSheetCount: provisionalSheetCount,
      compositeTargetCount: targetCrops.filter(crop => crop.compositeTarget).length,
      scoringStatus: 'trusted-core-formation-targets-ready-runtime-comparison-pending'
    },
    measurementLimits: [
      'Trusted motion-reference crops are cleaned from a compressed segmented reference video; they are better human-readable targets than polluted sheet cells, but not ROM-perfect final truth.',
      'Remaining source-sheet cell crops are useful provisional pose evidence and should not be treated as final canonical target pixels without human review.',
      'The crops improve role, pose, projectile, explosion, and tractor-beam grounding but do not yet score temporal animation cadence.',
      'Dual-fighter, carried-fighter, boss damage, and capture/rescue transition targets still need composite or temporal promotion.'
    ],
    roleSets: roleSetRows,
    targetCrops,
    nextBestStep: 'Regenerate Aurora live runtime comparisons against the corrected Boss, Bee, and Butterfly targets, then promote clean player-fighter and temporal pulse/cadence targets before tuning more runtime sprites.'
  };
  writeJson(OUT, artifact);
  writeText(MARKDOWN, markdownReport(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(MARKDOWN),
    cropDir: rel(CROP_DIR),
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

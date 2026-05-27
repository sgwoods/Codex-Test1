#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const RUNTIME_ARTIFACT = 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json';
const TARGET_ARTIFACT = 'reference-artifacts/analyses/galaga-alien-target-crops/latest.json';
const TEMPORAL_TARGET_ARTIFACT = 'reference-artifacts/analyses/galaga-alien-temporal-targets/latest.json';
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-runtime-vs-galaga-target-crops');
const OUT = path.join(OUT_DIR, 'latest.json');

const ROLE_CANDIDATES = {
  'player-fighter': ['player-fighter'],
  'dual-fighter': ['player-fighter'],
  'bee-line': ['bee-zako'],
  'but-line': ['butterfly-escort'],
  'boss-line': ['boss-galaga'],
  'rogue-fighter': ['player-fighter', 'boss-galaga'],
  'challenge-dragonfly': ['challenge-specialty-aliens'],
  'challenge-mosquito': ['challenge-specialty-aliens']
};

const POSE_CANDIDATES = {
  'player-fighter': ['single-ship-front'],
  'dual-fighter': ['dual-fighter-front'],
  'bee-line': ['formation-front', 'flap-a', 'flap-b'],
  'but-line': ['formation-front', 'flap-a', 'flap-b'],
  'boss-line': ['formation-front', 'flap-a', 'flap-b'],
  'rogue-fighter': ['single-ship-front', 'turn-left', 'turn-right'],
  'challenge-dragonfly': ['green-family-front', 'yellow-family-front', 'magenta-family-front', 'blue-yellow-family-front'],
  'challenge-mosquito': ['green-family-front', 'yellow-family-front', 'magenta-family-front', 'blue-yellow-family-front']
};

const TEMPORAL_POSE_SEQUENCES = {
  'bee-line': ['formation-front', 'flap-a', 'flap-b', 'flap-b', 'flap-a', 'formation-front'],
  'but-line': ['formation-front', 'flap-a', 'flap-b', 'flap-b', 'flap-a', 'formation-front'],
  'boss-line': ['formation-front', 'flap-a', 'flap-b', 'flap-b', 'flap-a', 'formation-front']
};

function temporalPoseSequences(){
  if(!exists(TEMPORAL_TARGET_ARTIFACT)) return TEMPORAL_POSE_SEQUENCES;
  try{
    const artifact = readJson(TEMPORAL_TARGET_ARTIFACT);
    const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
    const map = {};
    for(const row of rows){
      if(!row.runtimeSpriteKey || !Array.isArray(row.poseSequence) || row.poseSequence.length < 1) continue;
      map[row.runtimeSpriteKey] = row.poseSequence;
    }
    return Object.keys(map).length ? map : TEMPORAL_POSE_SEQUENCES;
  }catch{
    return TEMPORAL_POSE_SEQUENCES;
  }
}

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

function rounded(value, places = 3){
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
  for(let y = 0; y < image.height; y++){
    for(let x = 0; x < image.width; x++){
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
  for(let y = y0; y < Math.min(image.height, y1); y++){
    for(let x = x0; x < Math.min(image.width, x1); x++){
      const i = (y * image.width + x) * 3;
      const rr = image.raw[i];
      const gg = image.raw[i + 1];
      const bb = image.raw[i + 2];
      if(!isLitPixel(rr, gg, bb)) continue;
      lit++;
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
  for(let y = 0; y < rows; y++){
    const row = [];
    for(let x = 0; x < cols; x++){
      const cell = sampleCell(image, bounds, x, y, cols, rows);
      if(cell.lit) filled++;
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

function emptyCell(){
  return { lit: false, rgb: [0, 0, 0] };
}

function shiftedCell(grid, x, y){
  if(y < 0 || y >= grid.length) return emptyCell();
  const row = grid[y] || [];
  if(x < 0 || x >= row.length) return emptyCell();
  return row[x] || emptyCell();
}

function compareGridsAtShift(runtime, target, shiftX = 0, shiftY = 0){
  const rows = runtime.grid.length;
  const cols = runtime.grid[0]?.length || 0;
  let intersection = 0;
  let union = 0;
  let silhouetteMatches = 0;
  let colorPairs = 0;
  let colorSum = 0;
  for(let y = 0; y < rows; y++){
    for(let x = 0; x < cols; x++){
      const a = runtime.grid[y][x];
      const b = shiftedCell(target.grid, x - shiftX, y - shiftY);
      if(a.lit || b.lit) union++;
      if(a.lit && b.lit){
        intersection++;
        colorPairs++;
        colorSum += colorSimilarity(a.rgb, b.rgb);
      }
      if(a.lit === b.lit) silhouetteMatches++;
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
    aspectDelta: rounded(aspectDelta, 4),
    alignmentShift: { x: shiftX, y: shiftY }
  };
}

function compareGrids(runtime, target){
  const candidates = [];
  for(let shiftY = -2; shiftY <= 2; shiftY++){
    for(let shiftX = -2; shiftX <= 2; shiftX++){
      candidates.push(compareGridsAtShift(runtime, target, shiftX, shiftY));
    }
  }
  return candidates.sort((a, b) => b.score10 - a.score10)[0] || compareGridsAtShift(runtime, target, 0, 0);
}

function targetCandidatesForSample(sample, targetCrops){
  const roles = ROLE_CANDIDATES[sample.spriteKey] || [];
  const poses = POSE_CANDIDATES[sample.spriteKey] || [];
  const roleCandidates = targetCrops.filter(crop => roles.includes(crop.roleKey));
  const poseCandidates = roleCandidates.filter(crop => poses.includes(crop.poseKey));
  if(poseCandidates.length) return poseCandidates;
  return roleCandidates.length ? roleCandidates : targetCrops;
}

function targetCandidatesForRolePose(spriteKey, poseKey, targetCrops){
  const roles = ROLE_CANDIDATES[spriteKey] || [];
  const roleCandidates = targetCrops.filter(crop => roles.includes(crop.roleKey));
  const poseCandidates = roleCandidates.filter(crop => crop.poseKey === poseKey);
  if(poseCandidates.length) return poseCandidates;
  return roleCandidates.length ? roleCandidates : targetCrops;
}

function compareSample(sample, targetCrops, targetGrids){
  if(!exists(sample.cropImage)) fail(`Runtime crop image is missing for ${sample.spriteKey}`, sample);
  const runtimeFile = abs(sample.cropImage);
  const runtimeGrid = gridForImage(runtimeFile);
  const candidateResults = targetCandidatesForSample(sample, targetCrops)
    .map(target => {
      const targetGrid = targetGrids.get(target.id) || gridForImage(abs(target.targetCrop), 32, 32, target.metrics?.litBox || null);
      targetGrids.set(target.id, targetGrid);
      const comparison = compareGrids(runtimeGrid, targetGrid);
      return Object.assign({
        targetCropId: target.id,
        targetRoleKey: target.roleKey,
        targetPoseKey: target.poseKey,
        targetCrop: target.targetCrop,
        targetAuthorityScore10: target.authorityScore10 ?? null,
        targetAuthorityStatus: target.authorityStatus || '',
        targetScoringUse: target.scoringUse || ''
      }, comparison);
    })
    .sort((a, b) => b.score10 - a.score10);
  const best = candidateResults[0] || null;
  const authorityMultiplier = best && Number.isFinite(+best.targetAuthorityScore10)
    ? Math.max(.1, Math.min(1, +best.targetAuthorityScore10 / 10))
    : .2;
  return {
    spriteKey: sample.spriteKey,
    runtimeCrop: sample.cropImage,
    runtimeModelScore10: sample.score10,
    candidateRoleKeys: ROLE_CANDIDATES[sample.spriteKey] || [],
    candidatePoseKeys: POSE_CANDIDATES[sample.spriteKey] || [],
    candidateCount: candidateResults.length,
    bestTargetCropId: best?.targetCropId || null,
    bestTargetRoleKey: best?.targetRoleKey || null,
    bestTargetPoseKey: best?.targetPoseKey || null,
    bestTargetCrop: best?.targetCrop || null,
    bestTargetAuthorityScore10: best?.targetAuthorityScore10 ?? null,
    bestTargetAuthorityStatus: best?.targetAuthorityStatus || null,
    bestTargetScoringUse: best?.targetScoringUse || null,
    bestScore10: best?.score10 || null,
    authorityAdjustedScore10: best ? rounded(best.score10 * authorityMultiplier, 2) : null,
    bestComponents: best ? {
      jaccard: best.jaccard,
      silhouetteAgreement: best.silhouetteAgreement,
      colorSimilarity: best.colorSimilarity,
      fillRatioDelta: best.fillRatioDelta,
      aspectDelta: best.aspectDelta
    } : null,
    topCandidates: candidateResults.slice(0, 4)
  };
}

function bestFrameTargetComparison(frame, spriteKey, poseKey, targetCrops, targetGrids){
  if(!exists(frame.cropImage)) fail(`Runtime cadence crop image is missing for ${spriteKey} frame ${frame.frameIndex}`, frame);
  const runtimeGrid = gridForImage(abs(frame.cropImage));
  const candidates = targetCandidatesForRolePose(spriteKey, poseKey, targetCrops)
    .map(target => {
      const targetGrid = targetGrids.get(target.id) || gridForImage(abs(target.targetCrop), 32, 32, target.metrics?.litBox || null);
      targetGrids.set(target.id, targetGrid);
      return Object.assign({
        targetCropId: target.id,
        targetRoleKey: target.roleKey,
        targetPoseKey: target.poseKey,
        targetCrop: target.targetCrop,
        targetAuthorityScore10: target.authorityScore10 ?? null,
        targetAuthorityStatus: target.authorityStatus || '',
        targetScoringUse: target.scoringUse || ''
      }, compareGrids(runtimeGrid, targetGrid));
    })
    .sort((a, b) => b.score10 - a.score10);
  const best = candidates[0] || null;
  return {
    frameIndex: frame.frameIndex,
    enemyTm: frame.enemyTm,
    runtimeCrop: frame.cropImage,
    expectedPoseKey: poseKey,
    bestTargetCropId: best?.targetCropId || null,
    bestTargetPoseKey: best?.targetPoseKey || null,
    bestTargetCrop: best?.targetCrop || null,
    bestTargetAuthorityScore10: best?.targetAuthorityScore10 ?? null,
    bestTargetAuthorityStatus: best?.targetAuthorityStatus || null,
    bestScore10: best?.score10 || null,
    authorityAdjustedScore10: best && Number.isFinite(+best.targetAuthorityScore10)
      ? rounded(best.score10 * Math.max(.1, Math.min(1, +best.targetAuthorityScore10 / 10)), 2)
      : null,
    bestComponents: best ? {
      jaccard: best.jaccard,
      silhouetteAgreement: best.silhouetteAgreement,
      colorSimilarity: best.colorSimilarity,
      fillRatioDelta: best.fillRatioDelta,
      aspectDelta: best.aspectDelta
    } : null
  };
}

function poseTransitionCount(frames){
  let transitions = 0;
  let last = null;
  for(const frame of frames){
    const pose = frame.bestTargetPoseKey || frame.expectedPoseKey || '';
    if(last !== null && pose && pose !== last) transitions += 1;
    if(pose) last = pose;
  }
  return transitions;
}

function compareTemporalSequence(sample, targetCrops, targetGrids, poseSequences){
  const frames = Array.isArray(sample.frames) ? sample.frames : [];
  const expected = poseSequences[sample.spriteKey] || [];
  if(!frames.length || !expected.length) return null;
  const frameComparisons = frames.map((frame, index) => {
    const poseKey = expected[Math.min(expected.length - 1, Math.floor(index * expected.length / Math.max(1, frames.length)))] || expected[0];
    return bestFrameTargetComparison(frame, sample.spriteKey, poseKey, targetCrops, targetGrids);
  });
  const scored = frameComparisons.filter(frame => Number.isFinite(+frame.bestScore10));
  const averageFrameScore10 = scored.length
    ? rounded(scored.reduce((sum, frame) => sum + frame.bestScore10, 0) / scored.length, 2)
    : null;
  const expectedPoseSet = new Set(expected);
  const matchedPoseSet = new Set(frameComparisons.map(frame => frame.bestTargetPoseKey).filter(Boolean));
  const expectedPoseCoverage = expectedPoseSet.size
    ? [...expectedPoseSet].filter(pose => matchedPoseSet.has(pose)).length / expectedPoseSet.size
    : 0;
  const transitions = poseTransitionCount(frameComparisons);
  const transitionScore = Math.min(1, transitions / Math.max(1, expectedPoseSet.size - 1));
  const sequenceScore10 = Number.isFinite(+averageFrameScore10)
    ? rounded(averageFrameScore10 * .78 + expectedPoseCoverage * 1.4 + transitionScore * .8, 2)
    : null;
  return {
    spriteKey: sample.spriteKey,
    motionAxis: sample.motionAxis || 'full-flap-cadence-window',
    frameCount: frames.length,
    expectedPoseSequence: expected,
    expectedPoseCoverage: rounded(expectedPoseCoverage, 3),
    observedTargetPoseTransitions: transitions,
    averageFrameScore10,
    sequenceScore10,
    weakestFrameScore10: scored.length ? Math.min(...scored.map(frame => frame.bestScore10)) : null,
    strongestFrameScore10: scored.length ? Math.max(...scored.map(frame => frame.bestScore10)) : null,
    read: Number.isFinite(+sequenceScore10)
      ? `${sample.spriteKey} cadence now scores each runtime frame against an expected Galaga pose sequence; this is a target-relative animation read, not merely local motion delta.`
      : `${sample.spriteKey} cadence could not be target-scored from the current crop set.`,
    frames: frameComparisons
  };
}

function main(){
  if(!exists(RUNTIME_ARTIFACT)) fail(`Missing runtime sprite conformance artifact: ${RUNTIME_ARTIFACT}`);
  if(!exists(TARGET_ARTIFACT)) fail(`Missing Galaga target crop artifact: ${TARGET_ARTIFACT}`);
  const runtime = readJson(RUNTIME_ARTIFACT);
  const target = readJson(TARGET_ARTIFACT);
  const samples = Array.isArray(runtime.samples) ? runtime.samples : [];
  const targetCrops = Array.isArray(target.targetCrops) ? target.targetCrops : [];
  if(samples.length < 1) fail('Runtime sprite artifact has no samples.', runtime.summary);
  if(targetCrops.length < 1) fail('Target crop artifact has no target crops.', target.summary);
  for(const crop of targetCrops){
    if(!exists(crop.targetCrop)) fail(`Promoted target crop image is missing: ${crop.targetCrop}`, crop);
  }
  const targetGrids = new Map();
  const poseSequences = temporalPoseSequences();
  const comparisons = samples.map(sample => compareSample(sample, targetCrops, targetGrids));
  const temporalSequenceComparisons = (Array.isArray(runtime.cadenceSamples) ? runtime.cadenceSamples : [])
    .map(sample => compareTemporalSequence(sample, targetCrops, targetGrids, poseSequences))
    .filter(Boolean);
  const scored = comparisons.filter(item => Number.isFinite(+item.bestScore10));
  const temporalScored = temporalSequenceComparisons.filter(item => Number.isFinite(+item.sequenceScore10));
  const averageScore10 = scored.length
    ? rounded(scored.reduce((sum, item) => sum + item.bestScore10, 0) / scored.length, 2)
    : null;
  const authorityAdjusted = comparisons.filter(item => Number.isFinite(+item.authorityAdjustedScore10));
  const authorityAdjustedAverageScore10 = authorityAdjusted.length
    ? rounded(authorityAdjusted.reduce((sum, item) => sum + item.authorityAdjustedScore10, 0) / authorityAdjusted.length, 2)
    : null;
  const averageTemporalSequenceScore10 = temporalScored.length
    ? rounded(temporalScored.reduce((sum, item) => sum + item.sequenceScore10, 0) / temporalScored.length, 2)
    : null;
  const weakest = scored.slice().sort((a, b) => a.bestScore10 - b.bestScore10)[0] || null;
  const strongest = scored.slice().sort((a, b) => b.bestScore10 - a.bestScore10)[0] || null;
  const weakestTemporal = temporalScored.slice().sort((a, b) => a.sequenceScore10 - b.sequenceScore10)[0] || null;
  const artifact = {
    schemaVersion: 1,
    artifactType: 'aurora-runtime-vs-galaga-target-crops',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    gameKey: 'aurora-galactica',
    sources: {
      runtimeSprite: RUNTIME_ARTIFACT,
      targetCrops: TARGET_ARTIFACT,
      temporalTargets: exists(TEMPORAL_TARGET_ARTIFACT) ? TEMPORAL_TARGET_ARTIFACT : null
    },
    summary: {
      sampleCount: comparisons.length,
      targetCropCount: targetCrops.length,
      roleSetCount: target.summary?.roleSetCount || 0,
      averageScore10,
      authorityAdjustedAverageScore10,
      lowAuthorityComparisonCount: comparisons.filter(item => Number.isFinite(+item.bestTargetAuthorityScore10) && +item.bestTargetAuthorityScore10 < 5).length,
      weakestSpriteKey: weakest?.spriteKey || null,
      weakestScore10: weakest?.bestScore10 || null,
      weakestBestTarget: weakest?.bestTargetCropId || null,
      strongestSpriteKey: strongest?.spriteKey || null,
      strongestScore10: strongest?.bestScore10 || null,
      temporalSequenceSampleCount: temporalSequenceComparisons.length,
      averageTemporalSequenceScore10,
      weakestTemporalSpriteKey: weakestTemporal?.spriteKey || null,
      weakestTemporalSequenceScore10: weakestTemporal?.sequenceScore10 || null,
      scoringMode: 'first-pass-normalized-image-grid-comparison'
    },
    measurementLimits: [
      'This is a first-pass static-image comparator using already-captured Aurora runtime crop PNGs and promoted source-sheet target crop PNGs.',
      'Images are normalized to a shared grid, so this is useful for role/pose target triage but not yet a final pixel-perfect conformance score.',
      'Static sprite comparisons do not by themselves score gameplay timing, dive rotation, formation context, capture/rescue transitions, or target-crop authority disputes.',
      'Authority-adjusted scores are planning signals: they prevent provisional challenge-specialty cells from looking as release-trustworthy as cleaned motion-reference targets.',
      'Temporal sequence comparisons now score full flap-cadence runtime frames against expected Galaga target pose sequences, but do not yet assert exact frame timing against target video.',
      'Images are trimmed to their lit sprite bounds before scoring so large runtime crop padding does not dominate the comparison.',
      'Promoted target crops now prefer their accepted artifact litBox and ignore low-saturation source-sheet guide pixels, so gray sheet borders do not masquerade as sprite mass.',
      'The static grid comparator allows a bounded plus/minus two-cell alignment search so browser scaling and crop phase do not overwhelm otherwise target-like pixel art.',
      'Dual fighter now uses a derived two-fighter composite target, but carried/captured fighter targets still need promotion before those states should be treated as mature.'
    ],
    comparisons,
    temporalSequenceComparisons
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    sampleCount: comparisons.length,
    targetCropCount: targetCrops.length,
    averageScore10,
    weakestSpriteKey: artifact.summary.weakestSpriteKey,
    weakestScore10: artifact.summary.weakestScore10,
    weakestBestTarget: artifact.summary.weakestBestTarget,
    averageTemporalSequenceScore10,
    weakestTemporalSpriteKey: artifact.summary.weakestTemporalSpriteKey
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_DIR = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-alien-visual-reference', 'source-images');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-visual-reference');
const LATEST_JSON = path.join(OUT_DIR, 'latest.json');
const REPORT_MD = path.join(ROOT, 'GALAGA_ALIEN_VISUAL_REFERENCE.md');

const SOURCES = [
  {
    id: 'general-sprites-sheet',
    file: 'general-sprites-sheet.png',
    originalName: 'Arcade - Galaga - Miscellaneous - General Sprites.png',
    label: 'General sprite sheet',
    sourceClass: 'ripped-sprite-sheet',
    authority: 'strongest supplied static target; still secondary to controlled emulator/lossless extraction',
    targetUse: 'direct crop target candidate',
    roleKeys: ['player-fighter', 'dual-fighter', 'rogue-fighter', 'bee-line', 'but-line', 'boss-line', 'challenge-dragonfly', 'challenge-mosquito', 'tractor-beam', 'projectiles', 'explosions'],
    coverageAxes: ['sprites', 'alien taxonomy', 'tractor beam', 'projectiles', 'explosions'],
    notes: 'Best close-up artifact in this pack. Use for crop-box authoring and pose taxonomy before promotion into pixel target scoring.'
  },
  {
    id: 'closeup-alien-lineup-black',
    file: 'closeup-alien-lineup-black.jpg',
    originalName: '3d5114e715baffb1fe3c6e821516a612.jpg',
    label: 'Close-up alien and fighter lineup on black',
    sourceClass: 'assembled-pixel-reference',
    authority: 'human-readable role reference, not pixel-exact source',
    targetUse: 'human review and role-shape target context',
    roleKeys: ['player-fighter', 'rogue-fighter', 'bee-line', 'but-line', 'boss-line', 'challenge-dragonfly', 'challenge-mosquito', 'projectiles'],
    coverageAxes: ['sprites', 'alien taxonomy', 'projectiles'],
    notes: 'Good for visual vocabulary: boss wings, butterfly/bee silhouettes, challenge alien color families, projectile scale.'
  },
  {
    id: 'pixel-cutout-lineup',
    file: 'pixel-cutout-lineup.jpg',
    originalName: '459144ad6991bbad361f2d1fbd6ab453.jpg',
    label: 'Physical pixel cutout lineup',
    sourceClass: 'fan-product-reference',
    authority: 'low for pixel measurement; useful for coarse silhouette recognition',
    targetUse: 'human review only',
    roleKeys: ['player-fighter', 'bee-line', 'but-line', 'boss-line'],
    coverageAxes: ['sprites', 'alien taxonomy'],
    notes: 'Useful as a quick visual teaching aid; do not use for automated conformance scoring.'
  },
  {
    id: 'player-fighter-grid',
    file: 'player-fighter-grid.jpg',
    originalName: '1077486279580289864.jpeg',
    label: 'Player fighter pixel grid',
    sourceClass: 'pixel-grid-reference',
    authority: 'medium static player-fighter target context',
    targetUse: 'player fighter crop-grid candidate',
    roleKeys: ['player-fighter'],
    coverageAxes: ['sprites', 'player ship'],
    notes: 'Good for the player-fighter silhouette, color placement, and centerline proportions.'
  },
  {
    id: 'formation-lineup-black',
    file: 'formation-lineup-black.jpg',
    originalName: 'spaceship destroyers.jpeg',
    label: 'Fighter and four-alien lineup',
    sourceClass: 'assembled-pixel-reference',
    authority: 'medium human-reference context',
    targetUse: 'role proportion context',
    roleKeys: ['player-fighter', 'bee-line', 'but-line', 'boss-line', 'projectiles'],
    coverageAxes: ['sprites', 'alien taxonomy', 'projectiles'],
    notes: 'Useful for relative scale and the simple early-game family palette.'
  },
  {
    id: 'mobile-title-formation-reference',
    file: 'mobile-title-formation-reference.jpg',
    originalName: 'Galaga (2).jpeg',
    label: 'Mobile title and formation reference',
    sourceClass: 'screen-context-reference',
    authority: 'context only; likely modern/mobile presentation',
    targetUse: 'start-screen and formation composition context',
    roleKeys: ['player-fighter', 'rogue-fighter', 'bee-line', 'but-line', 'boss-line', 'tractor-beam'],
    coverageAxes: ['screen surfaces', 'sprites', 'formation composition', 'tractor beam'],
    notes: 'Useful for title/wait-mode messiness review and screen composition, not source-accurate sprite measurement.'
  },
  {
    id: 'vertical-formation-art',
    file: 'vertical-formation-art.jpg',
    originalName: '476537204326624455.jpeg',
    label: 'Vertical formation art',
    sourceClass: 'fan-art-reference',
    authority: 'low for scoring; useful for role recognition',
    targetUse: 'human review only',
    roleKeys: ['player-fighter', 'bee-line', 'but-line', 'boss-line'],
    coverageAxes: ['sprites', 'formation composition'],
    notes: 'Good for explaining the role stack to a human reviewer; not a crop target.'
  },
  {
    id: 'tractor-beam-poster-a',
    file: 'tractor-beam-poster-a.jpg',
    originalName: 'Galaga (1).jpeg',
    label: 'Tractor beam poster A',
    sourceClass: 'fan-art-reference',
    authority: 'context only',
    targetUse: 'capture/tractor-beam context',
    roleKeys: ['player-fighter', 'rogue-fighter', 'boss-line', 'tractor-beam'],
    coverageAxes: ['tractor beam', 'capture state', 'screen surfaces'],
    notes: 'Human-readable capture-beam staging reference. Treat as composition context, not gameplay-source evidence.'
  },
  {
    id: 'compact-player-alien-lineup',
    file: 'compact-player-alien-lineup.jpg',
    originalName: '756886281095110972.jpeg',
    label: 'Compact player and alien lineup',
    sourceClass: 'assembled-pixel-reference',
    authority: 'medium human-reference context',
    targetUse: 'role proportion context',
    roleKeys: ['player-fighter', 'bee-line', 'but-line', 'boss-line', 'projectiles'],
    coverageAxes: ['sprites', 'projectiles'],
    notes: 'Compact reference for projectile scale and core role silhouettes.'
  },
  {
    id: 'player-fighter-sticker',
    file: 'player-fighter-sticker.jpg',
    originalName: 'Decorate laptops, Hydro Flasks, cars and more with….jpeg',
    label: 'Player fighter sticker',
    sourceClass: 'fan-product-reference',
    authority: 'low for scoring; useful for player-fighter silhouette review',
    targetUse: 'human review only',
    roleKeys: ['player-fighter'],
    coverageAxes: ['sprites', 'player ship'],
    notes: 'Readable but product-stylized. Do not use as a numeric pixel target.'
  },
  {
    id: 'tractor-beam-poster-b-duplicate',
    file: 'tractor-beam-poster-b-duplicate.jpg',
    originalName: 'Galaga.jpeg',
    label: 'Tractor beam poster B duplicate',
    sourceClass: 'fan-art-reference',
    authority: 'duplicate context only',
    targetUse: 'duplicate of tractor-beam-poster-a',
    roleKeys: ['player-fighter', 'rogue-fighter', 'boss-line', 'tractor-beam'],
    coverageAxes: ['tractor beam', 'capture state', 'screen surfaces'],
    duplicateOf: 'tractor-beam-poster-a',
    notes: 'Byte-identical duplicate of the supplied tractor-beam poster; retained so the ingestion manifest accounts for every supplied file.'
  }
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function sha256(file){
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function imageDimensions(file){
  const result = spawnSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  if(result.status !== 0) return { width: null, height: null };
  const width = +(String(result.stdout).match(/pixelWidth:\s*(\d+)/) || [])[1] || null;
  const height = +(String(result.stdout).match(/pixelHeight:\s*(\d+)/) || [])[1] || null;
  return { width, height };
}

function targetCandidateScore(entry){
  const targetUse = String(entry.targetUse || '').toLowerCase();
  const sourceClass = String(entry.sourceClass || '').toLowerCase();
  if(sourceClass.includes('ripped-sprite-sheet')) return 10;
  if(targetUse.includes('crop-grid')) return 7;
  if(sourceClass.includes('assembled-pixel')) return 5;
  if(sourceClass.includes('screen-context')) return 3;
  return 1;
}

function roleCoverage(entries){
  const map = new Map();
  for(const entry of entries){
    for(const role of entry.roleKeys || []){
      const current = map.get(role) || { roleKey: role, imageCount: 0, targetCandidateCount: 0, strongestScore: 0, images: [] };
      current.imageCount += 1;
      const score = targetCandidateScore(entry);
      if(score >= 7) current.targetCandidateCount += 1;
      current.strongestScore = Math.max(current.strongestScore, score);
      current.images.push(entry.id);
      map.set(role, current);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.roleKey.localeCompare(b.roleKey));
}

function main(){
  ensureDir(OUT_DIR);
  const entries = SOURCES.map(source => {
    const absolute = path.join(SOURCE_DIR, source.file);
    if(!fs.existsSync(absolute)){
      return Object.assign({}, source, {
        path: rel(absolute),
        exists: false,
        sha256: null,
        width: null,
        height: null,
        bytes: null,
        targetCandidateScore: targetCandidateScore(source)
      });
    }
    const dimensions = imageDimensions(absolute);
    return Object.assign({}, source, {
      path: rel(absolute),
      exists: true,
      sha256: sha256(absolute),
      width: dimensions.width,
      height: dimensions.height,
      bytes: fs.statSync(absolute).size,
      targetCandidateScore: targetCandidateScore(source)
    });
  });
  const uniqueHashes = new Set(entries.filter(entry => entry.sha256).map(entry => entry.sha256));
  const coverage = roleCoverage(entries.filter(entry => entry.exists));
  const report = {
    artifactType: 'galaga-alien-visual-reference-pack',
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current'], 'unknown'),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    source: 'user-supplied close-up Galaga alien reference images copied from local Downloads on 2026-05-18',
    sourceDirectory: rel(SOURCE_DIR),
    policy: 'Only the ripped sprite sheet and explicit pixel-grid references are target candidates. Fan art, stickers, posters, and product images are retained as human-review context and must not drive numeric pixel conformance scores.',
    summary: {
      suppliedImageCount: SOURCES.length,
      existingImageCount: entries.filter(entry => entry.exists).length,
      uniqueImageHashCount: uniqueHashes.size,
      duplicateImageCount: entries.filter(entry => entry.duplicateOf || (entry.sha256 && entries.some(other => other.id !== entry.id && other.sha256 === entry.sha256))).length,
      targetCandidateCount: entries.filter(entry => entry.targetCandidateScore >= 7).length,
      roleCoverageCount: coverage.length,
      strongestTargetSource: 'general-sprites-sheet',
      currentUse: 'Close-up visual reference for alien role indexing, sprite crop target planning, challenge-stage graphical novelty, and future pixel-pose atlas extraction.'
    },
    roleCoverage: coverage,
    entries,
    targetPromotionPlan: [
      'Crop the general sprite sheet into per-role, per-pose target candidates for player, dual fighter, bee/Zako, butterfly, Boss Galaga, challenge aliens, projectiles, tractor beam, and explosions.',
      'Label each crop as source-sheet, gameplay-frame, fan-context, or poster-context so automated scoring never treats fan/product art as exact Galaga pixels.',
      'Replace the current one specialty-dive proxy with challenge-specific target families once clean crop boxes are accepted.',
      'Use the target atlas in runtime sprite scoring: static pose first, then flap/pulse/dive/capture/rescue animation phases.',
      'Attach challenge-stage object tracks to target role families so alien novelty and graphical conformance can score against actual Galaga visual vocabulary.'
    ],
    nextBestSteps: [
      'Add a crop-box manifest for general-sprites-sheet and promote exact role/pose crops.',
      'Update the runtime sprite scorer to compare Aurora live crops against multiple target poses per role, not one proxy pose.',
      'Add challenge-stage target-family expectations: which alien families appear in each challenge stage and how novelty increases over time.',
      'Add projectile, tractor-beam, and explosion visual-event targets so impact/capture feedback can be assessed with the same artifact strategy.',
      'Keep the assembled/poster/product images visible in docs as human-review context but exclude them from numeric pixel conformance.'
    ]
  };
  writeJson(LATEST_JSON, report);
  writeText(REPORT_MD, `# Galaga Alien Visual Reference Pack

Generated: ${report.generatedAt}

This report indexes the close-up Galaga alien reference images supplied on
2026-05-18. The pack is useful because Aurora's current sprite/alien
conformance has been too dependent on a small set of gameplay-frame crops. The
new evidence improves role vocabulary and target planning, especially for
Boss Galaga, bee/Zako, butterfly, challenge aliens, the player fighter,
projectiles, tractor beam, and explosion/capture-event surfaces.

## Policy

${report.policy}

## Summary

- Supplied images: ${report.summary.suppliedImageCount}
- Existing committed images: ${report.summary.existingImageCount}
- Unique hashes: ${report.summary.uniqueImageHashCount}
- Target candidate images: ${report.summary.targetCandidateCount}
- Role coverage rows: ${report.summary.roleCoverageCount}
- Strongest target source: \`${report.summary.strongestTargetSource}\`

## Role Coverage

| Role | Images | Target candidates | Strongest score |
|---|---:|---:|---:|
${coverage.map(row => `| \`${row.roleKey}\` | ${row.imageCount} | ${row.targetCandidateCount} | ${row.strongestScore}/10 |`).join('\n')}

## Indexed Images

| Id | Class | Dimensions | Target Use | Roles |
|---|---|---:|---|---|
${entries.map(entry => `| \`${entry.id}\` | ${entry.sourceClass} | ${entry.width || '?'}x${entry.height || '?'} | ${entry.targetUse} | ${(entry.roleKeys || []).map(role => `\`${role}\``).join(', ')} |`).join('\n')}

## Next Best Steps

${report.nextBestSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
`);
  console.log(JSON.stringify({
    ok: true,
    output: rel(LATEST_JSON),
    report: rel(REPORT_MD),
    existingImageCount: report.summary.existingImageCount,
    targetCandidateCount: report.summary.targetCandidateCount,
    roleCoverageCount: report.summary.roleCoverageCount
  }, null, 2));
}

main();

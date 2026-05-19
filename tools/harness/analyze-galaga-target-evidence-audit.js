#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const TARGET_CROPS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-target-crops', 'latest.json');
const MOTION_REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-motion-reference', 'latest.json');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-evidence-audit', 'latest.json');
const MARKDOWN = path.join(ROOT, 'GALAGA_TARGET_EVIDENCE_AUDIT.md');

const ROLE_AUDIT = [
  {
    roleKey: 'boss-galaga',
    label: 'Boss Galaga',
    previousRisk: 'The prior sheet-cell primary crop visibly included neighboring/polluted pixels and was misleading in the Application Guide.',
    trustedUse: 'Use cleaned motion-reference crops for formation-front and the two boss pulse/color phases.',
    cropIds: ['boss-galaga-formation-front', 'boss-galaga-flap-a', 'boss-galaga-flap-b'],
    confidence: 'medium-high',
    scoringUse: 'Primary target for boss-line runtime comparison; sheet dive cells remain provisional until recropped from gameplay/motion windows.',
    playerMeaning: 'Boss identity needs to read as the capture-beam host and high-value threat before motion and damage states are tuned.',
    nextGap: 'Promote clean boss dive, damage, tractor-beam host, and captured-fighter paired frames.'
  },
  {
    roleKey: 'bee-zako',
    label: 'Bee / Zako',
    previousRisk: 'The prior sheet-cell crop was usable as a source-sheet hint but too small and ambiguous as a primary visible target.',
    trustedUse: 'Use cleaned motion-reference crop for formation-front identity.',
    cropIds: ['bee-zako-formation-front'],
    confidence: 'medium',
    scoringUse: 'Primary formation target for bee-line; flap and dive sheet cells remain provisional evidence.',
    playerMeaning: 'Bee sprites set the baseline fleet texture and need to stay readable during formation rows and fast challenge-stage entries.',
    nextGap: 'Extract target pulse pairs and dive silhouettes from clean temporal windows.'
  },
  {
    roleKey: 'butterfly-escort',
    label: 'Butterfly / Escort',
    previousRisk: 'The prior sheet-cell crop was not reliable enough for a human-readable target row.',
    trustedUse: 'Use cleaned motion-reference crop for formation-front identity.',
    cropIds: ['butterfly-escort-formation-front'],
    confidence: 'medium',
    scoringUse: 'Primary formation target for but-line; flap and dive sheet cells remain provisional evidence.',
    playerMeaning: 'Butterflies are the player’s main convoy-shape cue; their red/white/blue block silhouette must be recognizable at speed.',
    nextGap: 'Extract target pulse pairs and dive/escort turns from gameplay/motion windows.'
  },
  {
    roleKey: 'player-fighter',
    label: 'Player Fighter',
    previousRisk: 'Player ship proportions have been corrected in runtime, but the target crop lane still needs a clean trusted crop from the user-supplied close-up examples or a stronger source window.',
    trustedUse: 'Keep current source-sheet player crop as provisional until a dedicated clean player target is promoted.',
    cropIds: ['player-fighter-single-front', 'player-fighter-dual-front'],
    confidence: 'medium',
    scoringUse: 'Provisional for player-fighter runtime comparison; not yet a final target claim.',
    playerMeaning: 'The fighter must feel smaller, crisp, and separate from reserve icons while preserving shot alignment and dual-fighter readability.',
    nextGap: 'Promote a clean player-fighter target and add dual-fighter spacing/scale target evidence.'
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

function readJson(file, fallback){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
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

function cropMap(artifact){
  const map = new Map();
  for(const crop of artifact.targetCrops || []) map.set(crop.id, crop);
  return map;
}

function rows(targetCrops){
  const crops = cropMap(targetCrops);
  return ROLE_AUDIT.map(row => {
    const linked = row.cropIds
      .map(id => crops.get(id))
      .filter(Boolean)
      .map(crop => ({
        id: crop.id,
        targetCrop: crop.targetCrop,
        reviewStatus: crop.reviewStatus,
        sourceKind: crop.sourceKind,
        sourceImage: crop.sourceImage,
        sourceFrameSeconds: crop.sourceFrameSeconds,
        videoDerivedCleanCrop: !!crop.videoDerivedCleanCrop,
        sourcePixelExact: !!crop.sourcePixelExact
      }));
    const trustedCount = linked.filter(crop => crop.videoDerivedCleanCrop).length;
    const provisionalCount = linked.filter(crop => crop.reviewStatus && String(crop.reviewStatus).includes('provisional')).length;
    return Object.assign({}, row, {
      trustedCropCount: trustedCount,
      provisionalCropCount: provisionalCount,
      linkedCrops: linked,
      status: trustedCount > 0 ? 'trusted-primary-target-available' : 'provisional-target-only'
    });
  });
}

function markdownReport(artifact){
  const lines = [
    '# Galaga Target Evidence Audit',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This audit records which visual targets are trusted enough to drive conformance scoring, which rows are still provisional, and why human review rejected the earlier polluted target evidence. The aim is to prevent a bad crop from becoming an apparently precise metric.',
    '',
    '## Summary',
    '',
    `- Status: ${artifact.status}`,
    `- Trusted motion-reference crops: ${artifact.summary.trustedMotionReferenceCount}`,
    `- Provisional source-sheet crops: ${artifact.summary.provisionalSourceSheetCount}`,
    `- Next best step: ${artifact.nextBestStep}`,
    '',
    '## Role Evidence',
    '',
    '| Role | Status | Trusted / Provisional | Scoring Use | Next Gap |',
    '| --- | --- | --- | --- | --- |'
  ];
  for(const row of artifact.rows){
    const cropRead = row.linkedCrops.map(crop => `\`${crop.id}\` (${crop.reviewStatus})`).join('<br>') || 'none';
    lines.push(`| ${row.label} | ${row.status}<br>${row.previousRisk} | ${cropRead} | ${row.scoringUse}<br><br>${row.playerMeaning} | ${row.nextGap} |`);
  }
  lines.push('', '## Measurement Rule', '', 'Runtime sprite scores may use trusted motion-reference crops as primary formation targets. Provisional source-sheet cells remain useful evidence, but their scores must be interpreted as planning signals until a clean crop or temporal target window supersedes them.', '');
  return `${lines.join('\n')}\n`;
}

function main(){
  const targetCrops = readJson(TARGET_CROPS, null);
  if(!targetCrops) fail(`Missing target crop artifact: ${rel(TARGET_CROPS)}`);
  const motion = readJson(MOTION_REFERENCE, {});
  const auditRows = rows(targetCrops);
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-target-evidence-audit',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    status: 'trusted-target-manifest-active',
    sourceArtifacts: {
      targetCrops: rel(TARGET_CROPS),
      motionReference: rel(MOTION_REFERENCE),
      motionReferenceVideo: motion.media?.inlineVideo || targetCrops.targetCrops?.find(crop => crop.videoDerivedCleanCrop)?.sourceVideo || ''
    },
    summary: {
      auditedRoleCount: auditRows.length,
      trustedPrimaryRoleCount: auditRows.filter(row => row.status === 'trusted-primary-target-available').length,
      provisionalOnlyRoleCount: auditRows.filter(row => row.status === 'provisional-target-only').length,
      trustedMotionReferenceCount: targetCrops.summary?.trustedMotionReferenceCount || 0,
      provisionalSourceSheetCount: targetCrops.summary?.provisionalSourceSheetCount || 0
    },
    rows: auditRows,
    nextBestStep: 'Regenerate runtime-vs-target scoring against the trusted Boss, Bee, and Butterfly primary targets, then promote player-fighter and temporal pulse-pair targets.'
  };
  writeJson(OUT, artifact);
  writeText(MARKDOWN, markdownReport(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(MARKDOWN),
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

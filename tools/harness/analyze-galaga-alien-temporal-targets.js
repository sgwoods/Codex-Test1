#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const TARGET_CROPS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-target-crops', 'latest.json');
const FRAME_CADENCE_TARGETS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-frame-cadence-targets', 'latest.json');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-temporal-targets', 'latest.json');
const MARKDOWN = path.join(ROOT, 'GALAGA_ALIEN_TEMPORAL_TARGETS.md');

const TEMPORAL_ROWS = [
  {
    id: 'boss-galaga-pulse-pair',
    roleKey: 'boss-galaga',
    runtimeSpriteKey: 'boss-line',
    label: 'Boss Galaga Pulse Pair',
    targetCropIds: ['boss-galaga-formation-front', 'boss-galaga-flap-a', 'boss-galaga-flap-b'],
    poseSequence: ['formation-front', 'flap-a', 'flap-b', 'flap-b', 'flap-a', 'formation-front'],
    confidence: 'medium-high',
    status: 'trusted-color-pulse-pair-not-frame-timed',
    sourceRead: 'Uses two cleaned boss identities visible in the segmented alien motion reference as a trusted color/pulse target pair.',
    scoringUse: 'Good enough to score role/color pulse and broad cadence transitions; not yet exact frame timing.',
    nextGap: 'Extract a true frame-labeled boss animation window from gameplay or ROM-derived frame evidence.'
  },
  {
    id: 'bee-zako-pulse-pair',
    roleKey: 'bee-zako',
    runtimeSpriteKey: 'bee-line',
    label: 'Bee / Zako Pulse Pair',
    targetCropIds: ['bee-zako-formation-front', 'bee-zako-flap-a', 'bee-zako-flap-b'],
    poseSequence: ['formation-front', 'flap-a', 'flap-b', 'flap-b', 'flap-a', 'formation-front'],
    confidence: 'medium-low',
    status: 'mixed-trusted-formation-plus-provisional-flap-pair',
    sourceRead: 'Formation identity is trusted from the segmented alien motion reference; flap pair still comes from provisional source-sheet cells.',
    scoringUse: 'Useful for exposing Aurora Bee geometry and cadence gaps, but not sufficient for a final temporal conformance claim.',
    nextGap: 'Promote clean Bee flap frames from a true animated target window.'
  },
  {
    id: 'butterfly-escort-pulse-pair',
    roleKey: 'butterfly-escort',
    runtimeSpriteKey: 'but-line',
    label: 'Butterfly / Escort Pulse Pair',
    targetCropIds: ['butterfly-escort-formation-front', 'butterfly-escort-flap-a', 'butterfly-escort-flap-b'],
    poseSequence: ['formation-front', 'flap-a', 'flap-b', 'flap-b', 'flap-a', 'formation-front'],
    confidence: 'medium-low',
    status: 'mixed-trusted-formation-plus-provisional-flap-pair',
    sourceRead: 'Formation identity is trusted from the segmented alien motion reference; flap pair still comes from provisional source-sheet cells.',
    scoringUse: 'Useful for exposing Aurora Butterfly geometry and cadence gaps, but not sufficient for a final temporal conformance claim.',
    nextGap: 'Promote clean Butterfly flap frames from a true animated target window.'
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

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readOptionalJson(file){
  if(!fs.existsSync(file)) return null;
  try{
    return readJson(file);
  }catch{
    return null;
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

function enrichRows(targetArtifact, frameCadenceArtifact){
  const crops = new Map((targetArtifact.targetCrops || []).map(crop => [crop.id, crop]));
  const cadenceRows = new Map((frameCadenceArtifact?.rows || []).map(row => [row.id, row]));
  return TEMPORAL_ROWS.map(row => {
    const targetCrops = row.targetCropIds.map(id => crops.get(id)).filter(Boolean).map(crop => ({
      id: crop.id,
      poseKey: crop.poseKey,
      targetCrop: crop.targetCrop,
      reviewStatus: crop.reviewStatus,
      sourceKind: crop.sourceKind,
      videoDerivedCleanCrop: !!crop.videoDerivedCleanCrop,
      sourcePixelExact: !!crop.sourcePixelExact,
      metrics: crop.metrics || {}
    }));
    const frameCadenceTarget = cadenceRows.get(row.id) || null;
    const trustedCount = targetCrops.filter(crop => crop.videoDerivedCleanCrop || crop.reviewStatus === 'accepted-trusted-motion-reference').length;
    const provisionalCount = targetCrops.filter(crop => String(crop.reviewStatus || '').includes('provisional')).length;
    return Object.assign({}, row, {
      status: frameCadenceTarget?.acceptedForScoring ? 'frame-timed-target-window' : row.status,
      timingStatus: frameCadenceTarget?.acceptedForScoring ? frameCadenceTarget.status : 'pose-sequence-only',
      confidence: frameCadenceTarget?.confidence || row.confidence,
      sourceRead: frameCadenceTarget?.acceptedForScoring
        ? `${row.sourceRead} Frame-labeled cadence now comes from ${frameCadenceTarget.sourceKind}: ${frameCadenceTarget.sourceUse}`
        : row.sourceRead,
      scoringUse: frameCadenceTarget?.acceptedForScoring
        ? 'Used for runtime cadence comparison with explicit timecodes and phase labels. Still treated as segmented-reference evidence, not final raw gameplay timing.'
        : row.scoringUse,
      nextGap: frameCadenceTarget?.acceptedForScoring
        ? 'Confirm this segmented-reference cadence against raw gameplay or ROM-derived timing, then extend the same target method to dive/rotation and challenge-only aliens.'
        : row.nextGap,
      trustedCropCount: trustedCount,
      provisionalCropCount: provisionalCount,
      frameCadenceTarget: frameCadenceTarget ? {
        id: frameCadenceTarget.id,
        status: frameCadenceTarget.status,
        acceptedForScoring: !!frameCadenceTarget.acceptedForScoring,
        sourceKind: frameCadenceTarget.sourceKind,
        sampleFps: frameCadenceTarget.sampleFps,
        sampleCount: frameCadenceTarget.sampleCount,
        cadenceSecondsPerCycle: frameCadenceTarget.cadenceSecondsPerCycle,
        phasePattern: frameCadenceTarget.phasePattern || [],
        phaseLabels: frameCadenceTarget.phaseLabels || [],
        averageAdjacentDelta: frameCadenceTarget.averageAdjacentDelta,
        maxAdjacentDelta: frameCadenceTarget.maxAdjacentDelta,
        previewFrames: frameCadenceTarget.previewFrames || [],
        measurementLimits: frameCadenceTarget.measurementLimits || []
      } : null,
      targetCrops
    });
  });
}

function markdownReport(artifact){
  const lines = [
    '# Galaga Alien Temporal Targets',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This report promotes target pose sequences for Boss, Bee, and Butterfly runtime cadence scoring. It deliberately distinguishes trusted motion-reference crops from provisional source-sheet flaps so the metric can improve without pretending we have final frame-timed animation truth.',
    '',
    '## Summary',
    '',
    `- Temporal rows: ${artifact.summary.temporalRowCount}`,
    `- Trusted crop links: ${artifact.summary.trustedCropLinks}`,
    `- Provisional crop links: ${artifact.summary.provisionalCropLinks}`,
    `- Next best step: ${artifact.nextBestStep}`,
    '',
    '## Temporal Rows',
    '',
    '| Row | Status | Pose Sequence | Evidence | Next Gap |',
    '| --- | --- | --- | --- | --- |'
  ];
  for(const row of artifact.rows){
    const evidence = row.targetCrops.map(crop => `\`${crop.id}\` (${crop.reviewStatus})`).join('<br>');
    const frameCadence = row.frameCadenceTarget
      ? `<br><br>Frame-labeled cadence: ${row.frameCadenceTarget.sampleCount} frames at ${row.frameCadenceTarget.sampleFps} fps; cycle ${row.frameCadenceTarget.cadenceSecondsPerCycle}s; phases ${(row.frameCadenceTarget.phaseLabels || []).map(label => `\`${label}\``).join(', ')}.`
      : '';
    lines.push(`| ${row.label}<br><code>${row.runtimeSpriteKey}</code> | ${row.status}<br>timing: ${row.timingStatus || 'pending'}<br>confidence: ${row.confidence} | ${row.poseSequence.map(pose => `\`${pose}\``).join(' -> ')} | ${row.sourceRead}${frameCadence}<br><br>${evidence} | ${row.nextGap} |`);
  }
  lines.push('', '## Measurement Rule', '', 'The runtime-vs-target cadence scorer may consume frame-labeled cadence rows when present. These segmented-reference rows lift the old pose-only cap, but final arcade-perfect timing still needs raw gameplay or ROM-derived windows.', '');
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(TARGET_CROPS)) fail(`Missing Galaga target crop artifact: ${rel(TARGET_CROPS)}`);
  const targetArtifact = readJson(TARGET_CROPS);
  const frameCadenceArtifact = readOptionalJson(FRAME_CADENCE_TARGETS);
  const rows = enrichRows(targetArtifact, frameCadenceArtifact);
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-alien-temporal-targets',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    status: 'mixed-confidence-temporal-target-sequences',
    sourceArtifacts: {
      targetCrops: rel(TARGET_CROPS),
      frameCadenceTargets: frameCadenceArtifact ? rel(FRAME_CADENCE_TARGETS) : null
    },
    summary: {
      temporalRowCount: rows.length,
      trustedCropLinks: rows.reduce((sum, row) => sum + (row.trustedCropCount || 0), 0),
      provisionalCropLinks: rows.reduce((sum, row) => sum + (row.provisionalCropCount || 0), 0),
      finalFrameTimedRows: rows.filter(row => row.status === 'frame-timed-target-window').length,
      frameLabeledSegmentedReferenceRows: rows.filter(row => row.frameCadenceTarget?.acceptedForScoring).length,
      usableForRuntimeCadenceScoring: rows.length
    },
    rows,
    nextBestStep: rows.some(row => !row.frameCadenceTarget?.acceptedForScoring)
      ? 'Promote frame-labeled cadence windows for every temporal row, then extend the method to challenge-only aliens.'
      : 'Confirm segmented-reference cadence against raw gameplay or ROM-derived timing, then extend the method to dive/rotation and challenge-only aliens.'
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

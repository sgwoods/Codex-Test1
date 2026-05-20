#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPORAL_TARGETS = 'reference-artifacts/analyses/galaga-alien-temporal-targets/latest.json';
const RUNTIME_SPRITES = 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json';
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-sprite-motion-correspondence');
const OUT = path.join(OUT_DIR, 'latest.json');
const MARKDOWN = path.join(ROOT, 'AURORA_SPRITE_MOTION_CORRESPONDENCE.md');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function round(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function scoreText(value){
  return Number.isFinite(+value) ? `${round(value, 1).toFixed(1).replace(/\.0$/, '')}/10` : 'unscored';
}

function targetReadinessScore(row, finalFrameTimedRows){
  const trusted = +row.trustedCropCount || 0;
  const provisional = +row.provisionalCropCount || 0;
  const status = String(row.status || '');
  const hasAcceptedFrameCadence = !!row.frameCadenceTarget?.acceptedForScoring;
  let score = 4.2;
  if(hasAcceptedFrameCadence) score = 8.4;
  else if(status === 'frame-timed-target-window') score = 9.2;
  else if(trusted >= 3 && provisional === 0) score = 7.2;
  else if(trusted > 0 && provisional > 0) score = 5.6;
  else if(trusted > 0) score = 5.2;

  if(String(row.confidence || '').includes('medium-high')) score += 0.4;
  if(String(row.confidence || '').includes('medium-low')) score -= 0.2;
  if(finalFrameTimedRows <= 0) score = Math.min(score, 6.5);
  if(provisional > 0 && !hasAcceptedFrameCadence) score = Math.min(score, 5.8);
  return round(score, 2);
}

function twoPhaseVisibilityScore(temporal){
  if(!temporal) return 1;
  const litDelta = clamp((+temporal.litPixelDelta || 0) / 260);
  const filledDelta = clamp((+temporal.filledCellDelta || 0) / 80);
  const scoreDelta = clamp((+temporal.scoreDelta || 0) / 1.0);
  return round(1 + 9 * ((0.45 * litDelta) + (0.35 * filledDelta) + (0.2 * scoreDelta)), 2);
}

function cadenceVisibilityScore(cadence){
  if(!cadence) return 1;
  const frameCoverage = clamp((+cadence.frameCount || (cadence.frames || []).length || 0) / 8);
  const litChange = clamp((+cadence.averageAdjacentLitPixelDelta || 0) / 80);
  const filledChange = clamp((+cadence.averageAdjacentFilledCellDelta || 0) / 24);
  const scoreRange = clamp((+cadence.scoreRange10 || 0) / 1.0);
  return round(1 + 9 * ((0.25 * frameCoverage) + (0.34 * litChange) + (0.26 * filledChange) + (0.15 * scoreRange)), 2);
}

function transitionCount(sequence){
  if(!Array.isArray(sequence) || sequence.length < 2) return 0;
  let count = 0;
  for(let index = 1; index < sequence.length; index += 1){
    if(sequence[index] !== sequence[index - 1]) count += 1;
  }
  return count;
}

function deriveRuntimePhaseSequence(cadence, targetLabels){
  const frames = Array.isArray(cadence?.frames) ? cadence.frames : [];
  if(!frames.length) return [];
  const labels = Array.isArray(targetLabels) && targetLabels.length >= 2 ? targetLabels : ['compact', 'extended'];
  const lowLabel = labels.includes('compact') ? 'compact' : labels[0];
  const highLabel = labels.includes('extended') ? 'extended' : labels[labels.length - 1];
  const values = frames.map(frame => Number.isFinite(+frame.filledCells) ? +frame.filledCells : +frame.litPixels || 0);
  const sorted = values.slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  return values.map(value => value >= median ? highLabel : lowLabel);
}

function targetPhaseSequence(frameCadenceTarget, frameCount){
  const pattern = Array.isArray(frameCadenceTarget?.phasePattern) && frameCadenceTarget.phasePattern.length
    ? frameCadenceTarget.phasePattern
    : Array.isArray(frameCadenceTarget?.phaseLabels) && frameCadenceTarget.phaseLabels.length
    ? frameCadenceTarget.phaseLabels
    : [];
  if(!pattern.length || frameCount <= 0) return [];
  return Array.from({ length: frameCount }, (_, index) => pattern[index % pattern.length]);
}

function invertedPhaseSequence(sequence){
  if(!Array.isArray(sequence)) return [];
  return sequence.map(label => label === 'compact' ? 'extended' : label === 'extended' ? 'compact' : label);
}

function phaseOrderScore(cadence, frameCadenceTarget){
  const frames = Array.isArray(cadence?.frames) ? cadence.frames : [];
  if(!frames.length || !frameCadenceTarget?.acceptedForScoring){
    return {
      score10: 1,
      runtimePhaseSequence: [],
      targetPhaseSequence: [],
      bestOrientation: 'unavailable',
      directMatchRatio: 0,
      invertedMatchRatio: 0,
      transitionFit: 0,
      read: 'Phase-order scoring is unavailable because runtime cadence or target frame cadence is missing.'
    };
  }
  const runtimeSequence = deriveRuntimePhaseSequence(cadence, frameCadenceTarget.phaseLabels);
  const expectedSequence = targetPhaseSequence(frameCadenceTarget, runtimeSequence.length);
  const inverted = invertedPhaseSequence(runtimeSequence);
  const directMatches = runtimeSequence.filter((label, index) => label === expectedSequence[index]).length;
  const invertedMatches = inverted.filter((label, index) => label === expectedSequence[index]).length;
  const directMatchRatio = directMatches / Math.max(1, expectedSequence.length);
  const invertedMatchRatio = invertedMatches / Math.max(1, expectedSequence.length);
  const bestMatchRatio = Math.max(directMatchRatio, invertedMatchRatio);
  const bestOrientation = invertedMatchRatio > directMatchRatio ? 'phase-inverted' : 'direct';
  const runtimeTransitions = transitionCount(bestOrientation === 'phase-inverted' ? inverted : runtimeSequence);
  const expectedTransitions = transitionCount(expectedSequence);
  const transitionFit = 1 - Math.min(1, Math.abs(runtimeTransitions - expectedTransitions) / Math.max(1, expectedTransitions));
  const score10 = round(1 + 9 * ((0.72 * bestMatchRatio) + (0.28 * transitionFit)), 2);
  return {
    score10,
    runtimePhaseSequence: runtimeSequence,
    targetPhaseSequence: expectedSequence,
    bestOrientation,
    directMatchRatio: round(directMatchRatio, 3),
    invertedMatchRatio: round(invertedMatchRatio, 3),
    runtimeTransitionCount: runtimeTransitions,
    targetTransitionCount: expectedTransitions,
    transitionFit: round(transitionFit, 3),
    read: `Runtime cadence phase order ${bestOrientation === 'phase-inverted' ? 'matches after compact/extended inversion' : 'matches directly'} at ${round(bestMatchRatio * 100, 1)}% frame-label agreement with transition fit ${round(transitionFit * 100, 1)}%.`
  };
}

function seedCoverageScore(spriteKey, runtime){
  const hasTemporal = (runtime.temporalSamples || []).some(item => item.spriteKey === spriteKey);
  const hasCadence = (runtime.cadenceSamples || []).some(item => item.spriteKey === spriteKey);
  const hasDive = (runtime.divePoseSamples || []).some(item => item.modelKey === spriteKey || String(item.spriteKey || '').startsWith(spriteKey));
  const hasTransition = spriteKey === 'boss-line'
    ? (runtime.transitionPoseSamples || []).some(item => item.modelKey === spriteKey || String(item.spriteKey || '').startsWith('boss-'))
    : true;
  const axes = [
    { axis: 'two-phase flap/pulse', covered: hasTemporal },
    { axis: 'cadence window', covered: hasCadence },
    { axis: 'dive/rotation pose', covered: hasDive },
    { axis: spriteKey === 'boss-line' ? 'capture/transition seed' : 'transition seed not required for this row', covered: hasTransition }
  ];
  const covered = axes.filter(axis => axis.covered).length;
  return {
    score10: round(1 + 9 * (covered / axes.length), 2),
    covered,
    total: axes.length,
    axes
  };
}

function rowCap(row, finalFrameTimedRows){
  const hasAcceptedFrameCadence = !!row.frameCadenceTarget?.acceptedForScoring;
  let cap = finalFrameTimedRows > 0 ? 8.5 : 6.5;
  let reason = finalFrameTimedRows > 0
    ? 'Frame-labeled target rows exist, so the correspondence score may move beyond pose-only planning evidence.'
    : 'Capped because the Galaga target rows are pose sequences without final frame-timed cadence windows.';
  if((+row.provisionalCropCount || 0) > 0 && !hasAcceptedFrameCadence){
    cap = Math.min(cap, 5.8);
    reason = 'Capped because this row still uses provisional target flap crops; it can guide work but cannot claim mature animation conformance.';
  }else if((+row.provisionalCropCount || 0) > 0 && hasAcceptedFrameCadence){
    reason = 'Frame-labeled segmented-reference cadence replaces provisional flap-cell timing for this row; final raw gameplay timing is still needed before high-confidence conformance claims.';
  }
  return { cap, reason };
}

function buildRows(temporalTargets, runtime){
  const finalFrameTimedRows = +temporalTargets.summary?.finalFrameTimedRows || 0;
  const staticSamples = new Map((runtime.samples || []).map(sample => [sample.spriteKey, sample]));
  const temporalSamples = new Map((runtime.temporalSamples || []).map(sample => [sample.spriteKey, sample]));
  const cadenceSamples = new Map((runtime.cadenceSamples || []).map(sample => [sample.spriteKey, sample]));
  return (temporalTargets.rows || []).map(target => {
    const spriteKey = target.runtimeSpriteKey;
    const staticSample = staticSamples.get(spriteKey) || null;
    const temporalSample = temporalSamples.get(spriteKey) || null;
    const cadenceSample = cadenceSamples.get(spriteKey) || null;
    const targetReadinessScore10 = targetReadinessScore(target, finalFrameTimedRows);
    const twoPhaseVisibilityScore10 = twoPhaseVisibilityScore(temporalSample);
    const cadenceVisibilityScore10 = cadenceVisibilityScore(cadenceSample);
    const phaseOrder = phaseOrderScore(cadenceSample, target.frameCadenceTarget);
    const staticLikenessScore10 = Number.isFinite(+staticSample?.score10) ? round(staticSample.score10, 2) : 1;
    const seedCoverage = seedCoverageScore(spriteKey, runtime);
    const rawScore10 = round(
      (0.22 * targetReadinessScore10)
      + (0.2 * twoPhaseVisibilityScore10)
      + (0.17 * cadenceVisibilityScore10)
      + (0.16 * phaseOrder.score10)
      + (0.1 * staticLikenessScore10)
      + (0.15 * seedCoverage.score10),
      2
    );
    const cap = rowCap(target, finalFrameTimedRows);
    const score10 = round(Math.min(rawScore10, cap.cap), 2);
    const hasAcceptedFrameCadence = !!target.frameCadenceTarget?.acceptedForScoring;
    const nextGap = hasAcceptedFrameCadence
      ? `Confirm ${target.label || spriteKey} cadence against raw gameplay or ROM-derived timing, then tune Aurora runtime cadence toward that target.`
      : (+target.provisionalCropCount || 0) > 0
      ? `Promote frame-clean ${target.label || spriteKey} target flaps from source gameplay/video before raising this above planning confidence.`
      : 'Promote a true frame-labeled target cadence window so runtime cadence can be compared to target timing, not only visible runtime change.';
    return {
      id: target.id,
      label: target.label,
      roleKey: target.roleKey,
      runtimeSpriteKey: spriteKey,
      score10,
      rawScore10,
      capScore10: cap.cap,
      capReason: cap.reason,
      confidence: target.confidence,
      status: target.status,
      target: {
        targetReadinessScore10,
        trustedCropCount: target.trustedCropCount || 0,
        provisionalCropCount: target.provisionalCropCount || 0,
        frameCadenceTarget: target.frameCadenceTarget || null,
        poseSequence: target.poseSequence || [],
        cropIds: target.targetCropIds || []
      },
      runtime: {
        staticLikenessScore10,
        twoPhaseVisibilityScore10,
        cadenceVisibilityScore10,
        seedCoverageScore10: seedCoverage.score10,
        seedCoverageAxes: seedCoverage.axes,
        temporalSample: temporalSample ? {
          litPixelDelta: temporalSample.litPixelDelta,
          filledCellDelta: temporalSample.filledCellDelta,
          scoreDelta: temporalSample.scoreDelta,
          phaseClosedCrop: temporalSample.phaseClosedCrop,
          phaseOpenCrop: temporalSample.phaseOpenCrop
        } : null,
        cadenceSample: cadenceSample ? {
          frameCount: cadenceSample.frameCount || (cadenceSample.frames || []).length,
          scoreRange10: cadenceSample.scoreRange10,
          averageAdjacentLitPixelDelta: cadenceSample.averageAdjacentLitPixelDelta,
          averageAdjacentFilledCellDelta: cadenceSample.averageAdjacentFilledCellDelta,
          previewFrames: (cadenceSample.frames || []).filter((_, index) => index === 0 || index === Math.floor((cadenceSample.frames || []).length / 2) || index === (cadenceSample.frames || []).length - 1).map(frame => ({
            frameIndex: frame.frameIndex,
            cropImage: frame.cropImage,
            score10: frame.score10
          }))
        } : null,
        phaseOrderScore10: phaseOrder.score10,
        phaseOrder,
        staticCrop: staticSample?.cropImage || null
      },
      playerMeaning: 'This measures whether the alien appears alive: flap/pulse phases, a readable cadence, and enough pose coverage to make movement feel authored rather than static.',
      designerMeaning: 'This is a bridge score. It should guide sprite-motion tuning and challenge-stage scoring; segmented-reference cadence can lift pose-only caps, while exact arcade timing still needs raw target gameplay windows.',
      nextGap
    };
  });
}

function markdownReport(artifact){
  const lines = [
    '# Aurora Sprite Motion Correspondence',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'This report joins Galaga temporal target rows to Aurora runtime sprite-motion captures. It is intentionally conservative: visible runtime animation gets credit, but scores are capped until the target side has frame-labeled cadence windows rather than only pose sequences.',
    '',
    '## Summary',
    '',
    `- Score: ${scoreText(artifact.summary.averageScore10)}`,
    `- Phase-order score: ${scoreText(artifact.summary.averagePhaseOrderScore10)}`,
    `- Rows: ${artifact.summary.rowCount}`,
    `- Frame-timed target rows: ${artifact.summary.finalFrameTimedRows}`,
    `- Weakest row: ${artifact.summary.weakestRowId || 'n/a'} (${scoreText(artifact.summary.weakestScore10)})`,
    `- Next best step: ${artifact.nextBestStep}`,
    '',
    '## Rows',
    '',
    '| Row | Score | Target Readiness | Runtime Motion | Cap | Next Gap |',
    '| --- | ---: | --- | --- | --- | --- |'
  ];
  for(const row of artifact.rows){
    lines.push(`| ${row.label}<br><code>${row.runtimeSpriteKey}</code> | ${scoreText(row.score10)} | ${scoreText(row.target.targetReadinessScore10)}; trusted ${row.target.trustedCropCount}, provisional ${row.target.provisionalCropCount} | phase ${scoreText(row.runtime.twoPhaseVisibilityScore10)}; cadence ${scoreText(row.runtime.cadenceVisibilityScore10)}; phase-order ${scoreText(row.runtime.phaseOrderScore10)}; static ${scoreText(row.runtime.staticLikenessScore10)}; seeds ${row.runtime.seedCoverageAxes.filter(axis => axis.covered).length}/${row.runtime.seedCoverageAxes.length} | ${scoreText(row.capScore10)}<br>${row.capReason} | ${row.nextGap} |`);
  }
  lines.push('', '## Measurement Limits', '');
  for(const item of artifact.measurementLimits) lines.push(`- ${item}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(path.join(ROOT, TEMPORAL_TARGETS))) fail(`Missing temporal target artifact: ${TEMPORAL_TARGETS}`);
  if(!fs.existsSync(path.join(ROOT, RUNTIME_SPRITES))) fail(`Missing runtime sprite artifact: ${RUNTIME_SPRITES}`);
  const temporalTargets = readJson(TEMPORAL_TARGETS);
  const runtime = readJson(RUNTIME_SPRITES);
  const rows = buildRows(temporalTargets, runtime);
  const scored = rows.filter(row => Number.isFinite(+row.score10));
  const weakest = scored.slice().sort((a, b) => a.score10 - b.score10)[0] || null;
  const finalFrameTimedRows = +temporalTargets.summary?.finalFrameTimedRows || 0;
  const artifact = {
    schemaVersion: 1,
    artifactType: 'aurora-sprite-motion-correspondence',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    sourceArtifacts: {
      galagaAlienTemporalTargets: TEMPORAL_TARGETS,
      auroraRuntimeSpriteConformance: RUNTIME_SPRITES
    },
    summary: {
      rowCount: rows.length,
      averageScore10: round(average(scored.map(row => row.score10)), 2),
      rawAverageScore10: round(average(scored.map(row => row.rawScore10)), 2),
      averagePhaseOrderScore10: round(average(scored.map(row => row.runtime?.phaseOrderScore10)), 2),
      weakestRowId: weakest?.id || null,
      weakestRuntimeSpriteKey: weakest?.runtimeSpriteKey || null,
      weakestScore10: weakest?.score10 || null,
      finalFrameTimedRows,
      provisionalTargetRows: rows.filter(row => (+row.target.provisionalCropCount || 0) > 0).length,
      frameLabeledSegmentedReferenceRows: rows.filter(row => row.target.frameCadenceTarget?.acceptedForScoring).length,
      runtimeMotionAxesCovered: runtime.summary?.motionCoverageAxesCovered ?? null,
      runtimeMotionAxesPlanned: runtime.summary?.motionCoverageAxesPlanned ?? null,
      targetTimingStatus: finalFrameTimedRows > 0 ? 'frame-labeled-segmented-reference-windows' : 'pose-sequence-targets-only',
      read: finalFrameTimedRows > 0
        ? `Aurora runtime motion corresponds to ${rows.length} frame-labeled segmented-reference target row(s), average ${scoreText(average(scored.map(row => row.score10)))}; phase-order average is ${scoreText(average(scored.map(row => row.runtime?.phaseOrderScore10)))}.`
        : `Aurora runtime motion is visible but still target-capped: ${rows.length} sprite families score ${scoreText(average(scored.map(row => row.score10)))}, with ${rows.filter(row => (+row.target.provisionalCropCount || 0) > 0).length} provisional target row(s) and no final frame-timed target cadence rows.`
    },
    rows,
    measurementLimits: [
      'This score joins target pose rows to runtime motion samples; it is not a final arcade-perfect animation score.',
      'Rows remain capped when Galaga target evidence is pose-sequence only and lacks frame timing with frame-labeled windows.',
      'Frame-labeled segmented-reference rows are stronger than provisional source-sheet cells, but still lower-confidence than raw gameplay or ROM-derived frame windows.',
      'Phase-order scoring compares compact/extended runtime cadence labels against target phase labels, allowing inversion when the runtime metric polarity is reversed.',
      'Bee and Butterfly rows should no longer be capped solely by provisional flap cells once segmented-reference cadence is present.',
      'This artifact should influence challenge-stage graphical scoring as a measured signal, but gameplay challenge conformance still depends on path choreography, group timing, alien novelty, and shot opportunity.'
    ],
    nextBestStep: finalFrameTimedRows > 0
      ? 'Confirm segmented-reference cadence against raw gameplay or ROM-derived timing, then tune Aurora runtime cadence and challenge-stage alien motion against the accepted target rows.'
      : 'Promote true frame-labeled Boss, Bee, and Butterfly target cadence windows, then compare Aurora runtime cadence frames directly against those target windows.'
  };
  writeJson(OUT, artifact);
  writeText(MARKDOWN, markdownReport(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(MARKDOWN),
    averageScore10: artifact.summary.averageScore10,
    weakestRowId: artifact.summary.weakestRowId,
    targetTimingStatus: artifact.summary.targetTimingStatus
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

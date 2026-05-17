#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-strategy-review');
const DOC = path.join(ROOT, 'AUDIO_CONFORMANCE_STRATEGY_REVIEW.md');

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function latestJson(artifact){
  const file = path.join(ANALYSES, artifact, 'latest.json');
  return fs.existsSync(file) ? { file, report: readJson(file) } : null;
}

function latestRuntimeTrial(){
  const pointer = latestJson('aurora-audio-runtime-trials');
  if(!pointer) return null;
  if(pointer.report.latest){
    const file = path.join(ROOT, pointer.report.latest);
    return fs.existsSync(file) ? { file, report: readJson(file) } : pointer;
  }
  return pointer;
}

function cue(report, cueName){
  return (report?.cues || []).find(row => row.cue === cueName) || null;
}

function eventCue(report, cueName){
  return (report?.comparedCueRisks || []).find(row => row.cue === cueName) || null;
}

function markdown(report){
  const lines = [
    '# Aurora Audio Conformance Strategy Review',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Commit: \`${report.commit}${report.dirty ? ' (dirty)' : ''}\``,
    '',
    '## Executive Read',
    '',
    report.executiveRead,
    '',
    '## Current Evidence',
    '',
    `- Latest audio event-gap highest risk: \`${report.currentEvidence.highestRiskCue}\` ${report.currentEvidence.highestRisk10}/10.`,
    `- Latest average worst-segment risk: ${report.currentEvidence.averageWorstSegmentRisk10}/10.`,
    `- Risk stability: ${report.currentEvidence.volatileCueCount}/${report.currentEvidence.cueCount} cues volatile; most volatile \`${report.currentEvidence.mostVolatileCue}\` (${report.currentEvidence.mostVolatileRange10}/10 range).`,
    `- Promotion stability gate: ${report.currentEvidence.runtimeTrialAllowedCount} runtime trials allowed; global block ${report.currentEvidence.globalPromotionBlocked ? 'on' : 'off'}.`,
    `- Latest runtime trial: \`${report.currentEvidence.latestRuntimeTrialCue || 'none'}\` ${report.currentEvidence.latestRuntimeTrialStatus || 'n/a'}.`,
    '',
    '## Why Accurate References Are Not Enough',
    '',
    ...report.diagnosis.map(item => `- **${item.name}:** ${item.read}`),
    '',
    '## Revised Strategy',
    '',
    '| Priority | Strategy | Success Measure |',
    '| ---: | --- | --- |',
    ...report.revisedStrategy.map((item, index) => `| ${index + 1} | ${item.strategy} | ${item.successMeasure} |`),
    '',
    '## Next Experiment',
    '',
    report.nextExperiment,
    '',
    '## Source Artifacts',
    '',
    ...Object.entries(report.sources).map(([key, value]) => `- ${key}: \`${value || 'missing'}\``),
    ''
  ];
  return `${lines.join('\n')}\n`;
}

function main(){
  const eventGap = latestJson('aurora-audio-event-gap');
  const riskStability = latestJson('aurora-audio-risk-stability');
  const promotionGate = latestJson('aurora-audio-promotion-stability-gate');
  const runtimeTrial = latestRuntimeTrial();
  const challengePerfectStability = cue(riskStability?.report, 'challengePerfect');
  const challengePerfectEvent = eventCue(eventGap?.report, 'challengePerfect');
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;

  const globalVolatileShare = promotionGate?.report?.summary?.globalVolatileCueShare
    ?? ((riskStability?.report?.summary?.volatileCueCount || 0) / Math.max(1, riskStability?.report?.summary?.cueCount || 1));

  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-strategy-review',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    executiveRead: 'Aurora audio is not failing because the reference clips are bad. It is failing because the current loop overweights isolated waveform wins while the live full-theme capture, segmentation, and event-in-context scoring are unstable enough to reverse those wins. The next audio investment should stabilize the measurement harness before more runtime cue promotion.',
    currentEvidence: {
      highestRiskCue: eventGap?.report?.summary?.highestRiskCue || '',
      highestRisk10: round(eventGap?.report?.summary?.highestRisk10, 2),
      averageWorstSegmentRisk10: round(eventGap?.report?.summary?.averageWorstSegmentRisk10, 2),
      challengePerfectGapRisk10: round(challengePerfectEvent?.gapRisk10, 2),
      challengePerfectMedianGapRisk10: challengePerfectStability?.medianGapRisk10 ?? null,
      challengePerfectRange10: Math.max(challengePerfectStability?.gapRiskRange10 || 0, challengePerfectStability?.worstSegmentRange10 || 0),
      cueCount: riskStability?.report?.summary?.cueCount || 0,
      volatileCueCount: riskStability?.report?.summary?.volatileCueCount || 0,
      volatileCueShare: round(globalVolatileShare, 3),
      mostVolatileCue: riskStability?.report?.summary?.mostVolatileCue || '',
      mostVolatileRange10: riskStability?.report?.summary?.mostVolatileRange10 ?? null,
      globalPromotionBlocked: promotionGate?.report?.summary?.globalPromotionBlocked === true,
      runtimeTrialAllowedCount: promotionGate?.report?.summary?.runtimeTrialAllowedCount || 0,
      latestRuntimeTrialCue: runtimeTrial?.report?.cue || '',
      latestRuntimeTrialStatus: runtimeTrial?.report?.decision?.status || ''
    },
    diagnosis: [
      {
        name: 'The target clip is accurate, but the measured event is not the same object',
        read: 'A Galaga reference phrase can be exact while Aurora plays it through a different event contract: different ceremony length, stop-cue behavior, background cadence, player state, and score handoff. Isolated cue similarity cannot guarantee player-facing conformance.'
      },
      {
        name: 'Full-theme capture and segmentation are currently too volatile',
        read: `The latest stability run marks ${riskStability?.report?.summary?.volatileCueCount || 0}/${riskStability?.report?.summary?.cueCount || 0} cues volatile. That means a single full-theme comparison can move more than a candidate change, so promotion based on one run is not trustworthy.`
      },
      {
        name: 'Onset scoring dominates musical/semantic quality',
        read: 'Challenge Perfect can improve average risk while still worsening as the highest-risk cue because a small onset or segment-boundary shift dominates the score. The scorer needs canonical self-similarity controls and confidence intervals before it should drive runtime edits.'
      },
      {
        name: 'The current candidate loop optimizes subwindows before context',
        read: 'The loop is good at finding plausible reference subclips, but weak at proving that the chosen clip survives live game timing, overlap, cooldown, stop-cue interactions, and score/transition pacing.'
      },
      {
        name: 'Theme latitude and strict conformance are mixed together',
        read: 'Aurora needs both a conformant reference lane and expressive theme lanes. The current score sometimes punishes a theme for being thematic while also not being stable enough to prove strict reference improvement.'
      }
    ],
    revisedStrategy: [
      {
        strategy: 'Add reference-vs-reference and current-vs-current calibration controls to every full-theme audio report.',
        successMeasure: 'Known identical captures score near zero gap with cue risk range <= 0.4/10 before runtime promotion gates are allowed.'
      },
      {
        strategy: 'Move promotion decisions to repeated median and confidence-bound scoring.',
        successMeasure: 'A candidate clears only when the 3-run median improves and the lower-confidence improvement exceeds max(0.5/10, 2x measured standard deviation).'
      },
      {
        strategy: 'Score in-context event scenarios in addition to isolated cue captures.',
        successMeasure: 'Challenge Perfect, challengeTransition, and gameOver are replayed inside their actual transition windows with stop-cue, cadence, and handoff timing active.'
      },
      {
        strategy: 'Promote event contracts before waveform candidates.',
        successMeasure: 'Each cue has explicit onset/body/tail meaning, expected duration, masking tolerance, semantic role, and player-facing read before candidate generation starts.'
      },
      {
        strategy: 'Separate strict Galaga conformance mode from Aurora theme-expression mode.',
        successMeasure: 'Dashboard shows two audio reads: reference-conformant lane and themed-latitude lane, with promotion gates tied to the intended lane.'
      },
      {
        strategy: 'Use local CPU sweeps for candidate generation, and reserve model/Codex time for strategy, failure classification, and harness design.',
        successMeasure: 'Economics reports show more local CPU candidate attempts per accepted harness improvement, while Codex/GPU-equivalent time is tied to durable algorithm changes.'
      }
    ],
    nextExperiment: 'Before any more runtime audio promotion, build a calibration pass that captures Galaga reference cues through the same browser path twice and measures reference-vs-reference, current-vs-current, and current-vs-reference variance for challengePerfect, challengeTransition, gameOver, captureBeam, and stagePulse.',
    sources: {
      audioEventGap: eventGap ? rel(eventGap.file) : '',
      audioRiskStability: riskStability ? rel(riskStability.file) : '',
      promotionStabilityGate: promotionGate ? rel(promotionGate.file) : '',
      runtimeTrial: runtimeTrial ? rel(runtimeTrial.file) : ''
    }
  };

  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}-${generatedAt.slice(11, 19).replace(/:/g, '')}`);
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  fs.writeFileSync(DOC, markdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    markdown: rel(DOC),
    currentEvidence: report.currentEvidence,
    nextExperiment: report.nextExperiment
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || err);
  process.exit(1);
}

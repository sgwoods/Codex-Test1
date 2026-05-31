#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { gameConfig } = require('./audio-conformance-games');
const {
  activeSliceShare,
  audioCueEvents,
  captureDurationSeconds,
  countMatchingCueEvents,
  intervalStats,
  longestGapSeconds,
  perSliceCueDensity,
  readCaptureReport,
  scoreThresholdCeiling,
  scoreThresholdFloor,
  waveformSlices
} = require('./lib/platinum-audio-scene-live-mix');
const { DEFAULT_SAMPLE_RATE, analyzeSamples, bufferToSamples, extractPcmFromVideo, readJson, rel, renderAudioPreviewFromPcm, rounded, writeJson } = require('./lib/platinum-audio-conformance');

const ROOT = path.resolve(__dirname, '..', '..');

function argValue(name, fallback){
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function captureAudioSamples(captureReport, videoFile){
  const durationSeconds = captureDurationSeconds(captureReport);
  const pcm = extractPcmFromVideo(videoFile, 0, durationSeconds, DEFAULT_SAMPLE_RATE);
  const samples = bufferToSamples(pcm);
  return { durationSeconds, pcm, samples, metrics: analyzeSamples(samples, DEFAULT_SAMPLE_RATE) };
}

function markdown(config, artifact){
  const lines = [
    `# ${config.gameLabel} Audio Live Mix`,
    '',
    'This report is generated from the reusable Platinum audio live-mix layer. It measures actual captured gameplay soundscape, not only synthetic cue correctness.',
    '',
    `Overall score: **${artifact.summary.overallLiveMixScore10}/10**`,
    '',
    '| Capture | Score | Longest quiet gap | Cue events / 10s | Pressure share | Active slice share |',
    '| --- | ---: | ---: | ---: | ---: | ---: |'
  ];
  for(const capture of artifact.captures){
    lines.push(`| ${capture.id} | ${capture.score10}/10 | ${capture.metrics.longestQuietGapSeconds}s | ${capture.metrics.cueEventsPer10s} | ${capture.metrics.pressureCueShare} | ${capture.metrics.activeSliceShare} |`);
  }
  if(artifact.escalation){
    lines.push('', '## Opening To Midrun Escalation', '', `Pressure cue ratio: **${artifact.escalation.pressureCueRatio}x**`, '', artifact.escalation.read, '');
  }
  lines.push('## Next Use', '', artifact.nextUse, '');
  return `${lines.join('\n')}\n`;
}

function scoreCapture(metrics, thresholds){
  const quietGap = scoreThresholdCeiling(metrics.longestQuietGapSeconds, thresholds.maxQuietGapSeconds, 0.6);
  const cueDensity = scoreThresholdFloor(metrics.cueEventsPer10s, thresholds.minCueEventsPer10s, 0.5);
  const pressureShare = scoreThresholdFloor(metrics.pressureCueShare, thresholds.minPressureCueShare, 0.65);
  const pulseCount = scoreThresholdFloor(metrics.pulseCount, thresholds.minPulseCount, 0.5);
  const activeSlices = scoreThresholdFloor(metrics.activeSliceShare, thresholds.minActiveSliceShare, 0.55);
  return {
    parts: {
      quietGap,
      cueDensity,
      pressureShare,
      pulseCount,
      activeSlices
    },
    score10: rounded(
      quietGap * 0.24 +
      cueDensity * 0.24 +
      pressureShare * 0.22 +
      pulseCount * 0.12 +
      activeSlices * 0.18,
      1
    )
  };
}

function previewFiles(root, previewDir, captureId, audio){
  const waveform = path.join(root, previewDir, `${captureId}-mix-waveform.png`);
  const spectrogram = path.join(root, previewDir, `${captureId}-mix-spectrogram.png`);
  renderAudioPreviewFromPcm({
    pcm: audio.pcm,
    sampleRate: DEFAULT_SAMPLE_RATE,
    waveform,
    spectrogram
  });
  return {
    waveform: rel(root, waveform),
    spectrogram: rel(root, spectrogram)
  };
}

function main(){
  const config = gameConfig(argValue('--game', 'galaxy-guardians-preview'));
  const mixConfig = config.audioLiveMix || {};
  const captures = [];
  for(const definition of mixConfig.captureSets || []){
    const { file, report } = readCaptureReport(ROOT, config, definition.label);
    const videoFile = path.join(ROOT, report.video);
    const audio = captureAudioSamples(report, videoFile);
    const cueEvents = audioCueEvents(report);
    const sliceSeconds = Math.max(1, +mixConfig.sliceSeconds || 5);
    const cueDensitySlices = perSliceCueDensity(cueEvents, audio.durationSeconds, sliceSeconds);
    const rmsSlices = waveformSlices(audio.samples, DEFAULT_SAMPLE_RATE, 1);
    const pulseStats = intervalStats(cueEvents, 'stagePulse');
    const pressureCueCount = countMatchingCueEvents(cueEvents, mixConfig.pressureCues);
    const rewardCueCount = countMatchingCueEvents(cueEvents, mixConfig.rewardCues);
    const criticalCueCount = countMatchingCueEvents(cueEvents, mixConfig.criticalCues);
    const metrics = {
      cueEventCount: cueEvents.length,
      cueEventsPer10s: rounded(cueEvents.length / Math.max(0.001, audio.durationSeconds) * 10, 2),
      pressureCueCount,
      rewardCueCount,
      criticalCueCount,
      pressureCueShare: rounded(pressureCueCount / Math.max(1, cueEvents.length), 3),
      longestQuietGapSeconds: longestGapSeconds(cueEvents, audio.durationSeconds),
      pulseCount: pulseStats.count,
      pulseMedianSeconds: pulseStats.medianSeconds,
      activeSliceShare: activeSliceShare(rmsSlices),
      integratedRms: audio.metrics.rms,
      envelopeContrast: audio.metrics.envelopeContrast,
      sliceSeconds,
      cueDensitySlices,
      rmsSlices: rmsSlices.map(slice => ({
        startSeconds: slice.startSeconds,
        endSeconds: slice.endSeconds,
        rms: slice.rms,
        peak: slice.peak
      }))
    };
    const scoring = scoreCapture(metrics, definition.thresholds);
    const previews = previewFiles(ROOT, mixConfig.previewDir, definition.id, audio);
    captures.push({
      id: definition.id,
      label: definition.label,
      captureReport: rel(ROOT, file),
      targetRead: definition.targetRead,
      expectedStage: definition.expectedStage,
      persona: definition.persona,
      thresholds: definition.thresholds,
      score10: scoring.score10,
      scoreParts: scoring.parts,
      audioPreview: previews,
      metrics
    });
  }

  const opening = captures[0] || null;
  const midrun = captures[1] || null;
  const escalation = opening && midrun ? {
    pressureCueRatio: rounded(midrun.metrics.pressureCueCount / Math.max(1, opening.metrics.pressureCueCount), 2),
    cueDensityRatio: rounded(midrun.metrics.cueEventsPer10s / Math.max(0.001, opening.metrics.cueEventsPer10s), 2),
    read: midrun.metrics.pressureCueCount > opening.metrics.pressureCueCount
      ? 'Midrun capture is denser than opening, which is the intended direction. Use this read alongside headed listening to judge whether the added pressure stays legible.'
      : 'Midrun capture is not yet denser than opening in pressure-cue count, which keeps later-band audio escalation suspect.'
  } : null;

  const overall = rounded(captures.reduce((sum, capture) => sum + capture.score10, 0) / Math.max(1, captures.length), 1);
  const artifact = {
    gameKey: config.gameKey,
    gameLabel: config.gameLabel,
    artifactType: 'platinum-audio-live-mix',
    version: '0.1-dev-preview',
    createdOn: '2026-05-31',
    status: 'captured-gameplay-live-mix-review',
    generatedBy: 'tools/harness/analyze-platinum-audio-live-mix.js',
    sourceEvidence: {
      gameplayCaptureDir: config.captureDir,
      cueLabArtifact: config.artifactPath,
      sceneReviewArtifact: mixConfig.artifactPath?.replace('audio-live-mix-0.1.json', 'audio-scene-review-0.1.json') || '',
      note: 'This live-mix artifact uses captured gameplay audio plus in-run cue-event history so audio acceptance can follow actual play experience.'
    },
    summary: {
      captureCount: captures.length,
      overallLiveMixScore10: overall,
      minimumOverallScore10: mixConfig.minimumOverallScore10,
      weakestCapture: captures.slice().sort((a, b) => a.score10 - b.score10)[0]?.id || '',
      strongestCapture: captures.slice().sort((a, b) => b.score10 - a.score10)[0]?.id || '',
      reusablePlatformRead: 'The live-mix layer is game-configured and future games can register their own capture sets, cue families, and thresholds without rewriting the analyzer.'
    },
    captures,
    escalation,
    nextUse: 'Use this artifact with scene review and headed listening. Retune recurring pressure, shot, dive, hit, and loss families only after the lived gameplay mix says where the dead air or crowding really is.'
  };

  writeJson(path.join(ROOT, mixConfig.artifactPath), artifact);
  fs.writeFileSync(path.join(ROOT, mixConfig.reportPath), markdown(config, artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: mixConfig.artifactPath,
    report: mixConfig.reportPath,
    overallLiveMixScore10: overall,
    weakestCapture: artifact.summary.weakestCapture
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  if(err?.payload) console.error(JSON.stringify(err.payload, null, 2));
  process.exit(1);
}

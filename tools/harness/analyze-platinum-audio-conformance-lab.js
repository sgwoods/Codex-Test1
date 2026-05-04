#!/usr/bin/env node
const path = require('path');
const {
  DEFAULT_SAMPLE_RATE,
  analyzeSamples,
  bufferToSamples,
  cueStaticMetrics,
  extractPcmFromVideo,
  loadPack,
  readJson,
  rel,
  renderAudioPreviewFromPcm,
  renderCueSamples,
  rounded,
  samplesToS16le,
  writeJson
} = require('./lib/platinum-audio-conformance');
const { gameConfig } = require('./audio-conformance-games');

const ROOT = path.resolve(__dirname, '..', '..');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function argValue(name, fallback){
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function bandScore(value, band){
  if(!Array.isArray(band) || band.length !== 2) return 5;
  if(value >= band[0] && value <= band[1]) return 10;
  const width = Math.max(.0001, band[1] - band[0]);
  const distance = value < band[0] ? band[0] - value : value - band[1];
  return rounded(Math.max(0, 10 - (distance / width) * 5), 1);
}

function ratioScore(actual, target, toleranceRatio){
  if(!Number.isFinite(actual) || !Number.isFinite(target) || target <= 0) return 5;
  const ratio = Math.abs(actual - target) / target;
  return rounded(Math.max(0, 10 - (ratio / toleranceRatio) * 5), 1);
}

function scoreCue({ runtimeStatic, runtimePcmMetrics, referenceMetrics, cueTarget }){
  const targetFreq = cueTarget?.peakFrequencyBandHz
    ? (cueTarget.peakFrequencyBandHz[0] + cueTarget.peakFrequencyBandHz[1]) / 2
    : referenceMetrics.zeroCrossingFrequencyProxyHz;
  const parts = {
    duration: bandScore(runtimeStatic.totalDurationSeconds, cueTarget?.durationBandSeconds),
    frequencyProxy: ratioScore(runtimePcmMetrics.zeroCrossingFrequencyProxyHz, targetFreq, .42),
    envelopeShape: ratioScore(runtimePcmMetrics.envelopeContrast, referenceMetrics.envelopeContrast || 1, .75),
    decayShape: ratioScore(runtimePcmMetrics.decayRatio, referenceMetrics.decayRatio || .75, .9),
    hardwareCharacter: Math.min(10,
      (runtimeStatic.waveFamilies.includes('square') ? 4 : 0) +
      (runtimeStatic.noiseCount > 0 ? 3 : 0) +
      (runtimeStatic.hasSlide ? 2 : 0) +
      (runtimeStatic.squareToneShare >= .8 ? 1 : 0)
    ),
    descent: cueTarget?.mustDescend
      ? (runtimeStatic.frequencyDropHz >= (cueTarget.minimumFrequencyDropHz || 1) ? 10 : Math.max(0, rounded(runtimeStatic.frequencyDropHz / Math.max(1, cueTarget.minimumFrequencyDropHz) * 10, 1)))
      : 8
  };
  return {
    parts,
    score10: rounded(
      parts.duration * .10 +
      parts.frequencyProxy * .34 +
      parts.envelopeShape * .20 +
      parts.decayShape * .16 +
      parts.hardwareCharacter * .10 +
      parts.descent * .10,
      1
    )
  };
}

function recommendation(cueName, runtimeStatic, runtimePcmMetrics, referenceMetrics, cueTarget, score){
  const notes = [];
  if(score.parts.duration < 8) notes.push('move runtime duration inside the measured cue band');
  if(score.parts.frequencyProxy < 7){
    const targetFreq = cueTarget?.peakFrequencyBandHz ? (cueTarget.peakFrequencyBandHz[0] + cueTarget.peakFrequencyBandHz[1]) / 2 : referenceMetrics.zeroCrossingFrequencyProxyHz;
    notes.push(runtimePcmMetrics.zeroCrossingFrequencyProxyHz < targetFreq ? 'raise the square/noise frequency proxy' : 'lower the square/noise frequency proxy');
  }
  if(score.parts.envelopeShape < 7) notes.push('sharpen the transient/envelope shape');
  if(score.parts.decayShape < 7) notes.push('adjust decay so the cue reads less sustained');
  if(score.parts.hardwareCharacter < 8) notes.push('increase square/noise hardware character');
  if(score.parts.descent < 8) notes.push('increase descending sweep/drop');
  return notes.length ? notes.join('; ') : `${cueName} is close enough for the next human-listening pass`;
}

function sourceMapFromCandidates(root, config){
  const candidates = readJson(path.join(root, config.cueCandidateArtifact));
  return Object.fromEntries((candidates.sourceEvidence?.sourceReads || []).map(source => [source.sourceId, source.localPath]));
}

function reportMarkdown(config, artifact){
  const lines = [];
  lines.push(`# ${config.gameLabel} Audio Conformance Lab`);
  lines.push('');
  lines.push('This report is generated from the reusable Platinum audio conformance lab. It compares runtime cue synthesis against promoted reference cue windows without committing raw copyrighted audio snippets.');
  lines.push('');
  lines.push(`Overall score: **${artifact.summary.overallAudioConformanceScore10}/10**`);
  lines.push('');
  lines.push('| Cue | Score | Runtime duration | Runtime freq proxy | Reference freq proxy | Main recommendation |');
  lines.push('|---|---:|---:|---:|---:|---|');
  for(const cue of artifact.cues){
    lines.push(`| ${cue.cueName} | ${cue.score10}/10 | ${cue.runtime.static.totalDurationSeconds}s | ${cue.runtime.pcm.zeroCrossingFrequencyProxyHz} Hz | ${cue.reference.pcm.zeroCrossingFrequencyProxyHz} Hz | ${cue.recommendation} |`);
  }
  lines.push('');
  lines.push('## Next Promotion');
  lines.push('');
  lines.push(artifact.nextPromotion);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const gameKey = argValue('--game', 'galaxy-guardians-preview');
  const config = gameConfig(gameKey);
  const pack = loadPack(ROOT, config);
  const theme = pack.audioThemes?.[config.themeId];
  if(!theme) fail(`Missing audio theme ${config.themeId}`, { gameKey, themeIds: Object.keys(pack.audioThemes || {}) });
  const labeled = readJson(path.join(ROOT, config.labeledCueArtifact));
  const cueTargets = readJson(path.join(ROOT, config.cueTargetArtifact)).cueTargets || {};
  const sources = sourceMapFromCandidates(ROOT, config);
  const outputDir = path.join(ROOT, config.artifactDir);
  const cues = [];

  for(const cueName of config.runtimeCueNames){
    const targetWindow = (labeled.promotedCueWindows || []).find(cue => cue.cueName === cueName);
    const runtimeCue = theme.cues?.[cueName];
    if(!targetWindow || !runtimeCue) fail(`Missing audio lab cue ${cueName}`, { hasTarget: !!targetWindow, hasRuntimeCue: !!runtimeCue });
    const sourcePath = sources[targetWindow.sourceId];
    if(!sourcePath) fail(`Missing source map entry for ${cueName}`, { sourceId: targetWindow.sourceId });

    const runtimeSamples = renderCueSamples(runtimeCue, { sampleRate: DEFAULT_SAMPLE_RATE });
    const runtimePcm = samplesToS16le(runtimeSamples);
    const runtimeWaveform = path.join(outputDir, `${cueName}-runtime-waveform.png`);
    const runtimeSpectrogram = path.join(outputDir, `${cueName}-runtime-spectrogram.png`);
    renderAudioPreviewFromPcm({
      pcm: runtimePcm,
      sampleRate: DEFAULT_SAMPLE_RATE,
      waveform: runtimeWaveform,
      spectrogram: runtimeSpectrogram
    });

    const referencePcm = extractPcmFromVideo(sourcePath, targetWindow.absoluteStartSeconds, targetWindow.measuredDurationSeconds || targetWindow.durationSeconds, DEFAULT_SAMPLE_RATE);
    const referenceWaveform = path.join(outputDir, `${cueName}-reference-waveform.png`);
    const referenceSpectrogram = path.join(outputDir, `${cueName}-reference-spectrogram.png`);
    renderAudioPreviewFromPcm({
      pcm: referencePcm,
      sampleRate: DEFAULT_SAMPLE_RATE,
      waveform: referenceWaveform,
      spectrogram: referenceSpectrogram
    });

    const runtimeStatic = cueStaticMetrics(runtimeCue);
    const runtimePcmMetrics = analyzeSamples(runtimeSamples, DEFAULT_SAMPLE_RATE);
    const referenceMetrics = analyzeSamples(bufferToSamples(referencePcm), DEFAULT_SAMPLE_RATE);
    const score = scoreCue({
      runtimeStatic,
      runtimePcmMetrics,
      referenceMetrics,
      cueTarget: cueTargets[cueName] || {}
    });
    cues.push({
      cueName,
      semanticLabel: targetWindow.semanticLabel,
      sourceId: targetWindow.sourceId,
      windowId: targetWindow.windowId,
      score10: score.score10,
      scoreParts: score.parts,
      recommendation: recommendation(cueName, runtimeStatic, runtimePcmMetrics, referenceMetrics, cueTargets[cueName] || {}, score),
      reference: {
        startSeconds: targetWindow.absoluteStartSeconds,
        durationSeconds: targetWindow.measuredDurationSeconds || targetWindow.durationSeconds,
        waveform: rel(ROOT, referenceWaveform),
        spectrogram: rel(ROOT, referenceSpectrogram),
        pcm: referenceMetrics
      },
      runtime: {
        waveform: rel(ROOT, runtimeWaveform),
        spectrogram: rel(ROOT, runtimeSpectrogram),
        static: runtimeStatic,
        pcm: runtimePcmMetrics
      }
    });
  }

  const overall = rounded(cues.reduce((sum, cue) => sum + cue.score10, 0) / Math.max(1, cues.length), 1);
  const artifact = {
    gameKey: config.gameKey,
    gameLabel: config.gameLabel,
    artifactType: 'platinum-audio-conformance-lab',
    version: '0.1-dev-preview',
    createdOn: '2026-05-04',
    status: 'runtime-cue-to-promoted-reference-window-comparison',
    generatedBy: 'tools/harness/analyze-platinum-audio-conformance-lab.js',
    sourceEvidence: {
      labeledCueArtifact: config.labeledCueArtifact,
      cueTargetArtifact: config.cueTargetArtifact,
      cueCandidateArtifact: config.cueCandidateArtifact,
      sampleRateHz: DEFAULT_SAMPLE_RATE,
      note: 'The lab stores JSON metrics and waveform/spectrogram PNG previews. It does not commit raw reference audio snippets.'
    },
    summary: {
      cueCount: cues.length,
      overallAudioConformanceScore10: overall,
      compellingPreviewTarget10: config.scoring.compellingPreviewTarget10,
      weakestCue: cues.slice().sort((a, b) => a.score10 - b.score10)[0]?.cueName || '',
      strongestCue: cues.slice().sort((a, b) => b.score10 - a.score10)[0]?.cueName || '',
      reusablePlatformRead: 'This lab is game-configured and can be registered for Aurora or future Platinum game packs.'
    },
    cues,
    nextPromotion: 'Human-listen the generated runtime/reference preview pairs, mark dirty reference windows, then replace weak cue recipes or target windows before beta-facing audio claims.'
  };
  writeJson(path.join(ROOT, config.artifactPath), artifact);
  const reportPath = path.join(ROOT, config.reportPath);
  require('fs').writeFileSync(reportPath, reportMarkdown(config, artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: config.artifactPath,
    report: config.reportPath,
    overallAudioConformanceScore10: overall,
    weakestCue: artifact.summary.weakestCue,
    strongestCue: artifact.summary.strongestCue
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

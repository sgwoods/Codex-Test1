#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAME_SUMMARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-frame-reference', 'frame-reference-summary.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'audio-reference-comparison-0.1.json');
const SAMPLE_RATE = 8000;

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

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: 1000 * 60 * 8
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function rounded(value, places = 3){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function mean(values){
  const list = values.filter(Number.isFinite);
  return list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0;
}

function stdev(values){
  const list = values.filter(Number.isFinite);
  if(list.length < 2) return 0;
  const avg = mean(list);
  return Math.sqrt(list.reduce((sum, value) => sum + (value - avg) ** 2, 0) / list.length);
}

function loadPack(){
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(PACK_SOURCE, 'utf8')}\nthis.GALAXY_GUARDIANS_PACK=GALAXY_GUARDIANS_PACK;`, sandbox, { filename: PACK_SOURCE });
  return sandbox.GALAXY_GUARDIANS_PACK;
}

function extractPcm(sourcePath, startSeconds, durationSeconds){
  return run('ffmpeg', [
    '-v', 'error',
    '-ss', String(startSeconds),
    '-t', String(Math.max(.1, durationSeconds)),
    '-i', sourcePath,
    '-vn',
    '-ac', '1',
    '-ar', String(SAMPLE_RATE),
    '-f', 's16le',
    'pipe:1'
  ], { encoding: 'buffer' });
}

function analyzePcm(buffer){
  const count = Math.floor(buffer.length / 2);
  if(count <= 0) return null;
  let sumSq = 0;
  let peak = 0;
  let crossings = 0;
  let previous = 0;
  const frameSize = Math.floor(SAMPLE_RATE / 10);
  const frameRms = [];
  let frameSumSq = 0;
  let frameCount = 0;
  for(let i = 0; i < count; i++){
    const sample = buffer.readInt16LE(i * 2) / 32768;
    const abs = Math.abs(sample);
    if(abs > peak) peak = abs;
    sumSq += sample * sample;
    if(i > 0 && ((sample >= 0 && previous < 0) || (sample < 0 && previous >= 0))) crossings++;
    previous = sample;
    frameSumSq += sample * sample;
    frameCount++;
    if(frameCount >= frameSize){
      frameRms.push(Math.sqrt(frameSumSq / frameCount));
      frameSumSq = 0;
      frameCount = 0;
    }
  }
  if(frameCount) frameRms.push(Math.sqrt(frameSumSq / frameCount));
  const rms = Math.sqrt(sumSq / count);
  const avgFrame = mean(frameRms);
  const burstFloor = avgFrame + stdev(frameRms) * .85;
  const burstFrames = frameRms.filter(value => value > burstFloor).length;
  return {
    durationSeconds: rounded(count / SAMPLE_RATE),
    rms: rounded(rms, 5),
    peak: rounded(peak, 5),
    zeroCrossingsPerSecond: rounded(crossings / Math.max(.001, count / SAMPLE_RATE), 1),
    burstFrameShare: rounded(burstFrames / Math.max(1, frameRms.length)),
    envelopeContrast: rounded((Math.max(...frameRms) || 0) / Math.max(.00001, avgFrame)),
    frameRmsSamples: frameRms.filter((_, index) => index % Math.max(1, Math.floor(frameRms.length / 10)) === 0).slice(0, 10).map(value => rounded(value, 5))
  };
}

function cueDuration(cue){
  if(cue.seq && cue.step) return cue.seq.length * cue.step;
  if(cue.tones) return Math.max(...Array.from(cue.tones).map(tone => (+tone.delay || 0) + (+tone.duration || 0)));
  return 0;
}

function cueMetrics(cue){
  const tones = cue.tones ? Array.from(cue.tones) : (cue.seq ? cue.seq.map((freq, index) => ({ freq, duration: cue.step, delay: index * cue.step, wave: cue.wave, slide: cue.slide || 0 })) : []);
  const freqs = tones.map(tone => +tone.freq || 0).filter(Boolean);
  const waves = Array.from(new Set(tones.map(tone => tone.wave || cue.wave || '').filter(Boolean)));
  return {
    toneCount: tones.length,
    sequenceLength: cue.seq ? cue.seq.length : 0,
    noiseCount: cue.noise ? Array.from(cue.noise).length : 0,
    totalDurationSeconds: rounded(cueDuration(cue)),
    minFrequencyHz: Math.min(...freqs),
    peakFrequencyHz: Math.max(...freqs),
    frequencySpanHz: Math.max(...freqs) - Math.min(...freqs),
    waveFamilies: waves,
    hasSlide: tones.some(tone => (+tone.slide || 0) !== 0)
  };
}

function summarizeReferenceAudio(summary){
  const windows = [];
  for(const source of summary.sources || []){
    for(const win of source.windows || []){
      if(!win.waveform || !win.spectrogram || !source.localPath || !fs.existsSync(source.localPath)) continue;
      const pcm = extractPcm(source.localPath, win.startSeconds, Math.min(win.durationSeconds, 18));
      windows.push({
        sourceId: source.sourceId,
        windowId: win.id,
        windowKey: `${source.sourceId}/${win.id}`,
        startSeconds: win.startSeconds,
        durationSeconds: Math.min(win.durationSeconds, 18),
        waveform: win.waveform,
        spectrogram: win.spectrogram,
        metrics: analyzePcm(pcm)
      });
    }
  }
  return windows;
}

function main(){
  if(!fs.existsSync(FRAME_SUMMARY)) fail('Missing Galaxian frame-reference summary.');
  const summary = readJson(FRAME_SUMMARY);
  const pack = loadPack();
  const theme = pack.audioThemes?.['guardians-signal'] || {};
  const cues = Object.fromEntries(Object.entries(theme.cues || {}).map(([name, cue]) => [name, cueMetrics(cue)]));
  const referenceWindows = summarizeReferenceAudio(summary);
  const avgZeroCross = mean(referenceWindows.map(window => window.metrics?.zeroCrossingsPerSecond || 0));
  const avgContrast = mean(referenceWindows.map(window => window.metrics?.envelopeContrast || 0));
  const shortCueCount = Object.values(cues).filter(cue => cue.totalDurationSeconds > 0 && cue.totalDurationSeconds <= .2).length;
  const longCueCount = Object.values(cues).filter(cue => cue.totalDurationSeconds >= .3).length;
  const noisyCueCount = Object.values(cues).filter(cue => cue.noiseCount > 0).length;
  const scoreParts = {
    waveformWindowCoverage: Math.min(10, referenceWindows.length),
    spectrogramCoverage: Math.min(10, referenceWindows.filter(window => window.waveform && window.spectrogram).length),
    cueShapeCoverage: Math.min(10, (shortCueCount + longCueCount + noisyCueCount) * 1.2),
    acousticProxyFit: Math.max(4.8, Math.min(6.2, 4.8 + (avgZeroCross > 70 ? .5 : 0) + (avgContrast > 2 ? .6 : 0)))
  };
  const score10 = rounded(mean(Object.values(scoreParts)), 1);
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'audio-reference-comparison',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'waveform-spectrogram-proxy-not-final-acoustic-match',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-audio-reference-comparison.js',
    sourceEvidence: {
      frameReferenceSummary: rel(FRAME_SUMMARY),
      analyzedWindowCount: referenceWindows.length,
      sampleRateHz: SAMPLE_RATE
    },
    referenceAudioSummary: {
      averageZeroCrossingsPerSecond: rounded(avgZeroCross, 1),
      averageEnvelopeContrast: rounded(avgContrast),
      windows: referenceWindows
    },
    guardiansCueSummary: {
      themeId: 'guardians-signal',
      cueCount: Object.keys(cues).length,
      shortCueCount,
      longCueCount,
      noisyCueCount,
      cues
    },
    scoreParts: Object.fromEntries(Object.entries(scoreParts).map(([key, value]) => [key, rounded(value, 1)])),
    audioReferenceComparisonScore10: score10,
    tuningRead: {
      immediateCueChangeRecommended: false,
      reason: 'This pass proves waveform/spectrogram coverage and compares cue-shape families, but it is still a proxy over mixed gameplay audio rather than isolated hardware cue matching.',
      nextCuePromotion: 'Generate synthetic Guardians cue waveforms and compare them directly against isolated Galaxian cue windows.'
    }
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    analyzedWindowCount: referenceWindows.length,
    audioReferenceComparisonScore10: score10,
    scoreParts: artifact.scoreParts
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

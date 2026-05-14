const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

const DEFAULT_SAMPLE_RATE = 22050;
const DEFAULT_FRAME_MS = 8;

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

function percentile(values, q){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const index = Math.max(0, Math.min(list.length - 1, Math.round((list.length - 1) * q)));
  return list[index];
}

function ensureDir(fileOrDir){
  const dir = path.extname(fileOrDir) ? path.dirname(fileOrDir) : fileOrDir;
  fs.mkdirSync(dir, { recursive: true });
}

function rel(root, file){
  return path.relative(root, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  ensureDir(file);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: opts.timeout || 1000 * 60 * 6
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function loadPack(root, config){
  const source = path.join(root, config.packSource);
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.buildPlatformInfo = () => ({ compatibility: '' });
  sandbox.applicationReleaseRecord = (_gameKey, fallback = {}) => Object.assign({}, fallback || {});
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(source, 'utf8')}\nthis.__PACK__=${config.packGlobal};`, sandbox, { filename: source });
  return sandbox.__PACK__;
}

function flattenTones(cue){
  const tones = [];
  if(Array.isArray(cue?.tones)) tones.push(...cue.tones);
  if(Array.isArray(cue?.seq)){
    const step = +cue.step || 0;
    cue.seq.forEach((freq, index) => tones.push({
      freq,
      duration: step,
      delay: index * step,
      wave: cue.wave,
      volume: cue.volume,
      slide: cue.slide || 0,
      lpHz: cue.lpHz
    }));
  }
  if(cue?.variants?.[0]) tones.push(...flattenTones(cue.variants[0]));
  return tones;
}

function flattenNoise(cue){
  return Array.isArray(cue?.noise) ? cue.noise.slice() : [];
}

function cueDuration(cue){
  const tones = flattenTones(cue);
  const toneEnds = tones.map(tone => (+tone.delay || 0) + (+tone.duration || 0));
  const noiseEnds = flattenNoise(cue).map(noise => (+noise.delay || 0) + (+noise.duration || 0));
  return Math.max(0, ...toneEnds, ...noiseEnds);
}

function seededNoise(seed){
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return (value / 0xffffffff) * 2 - 1;
  };
}

function waveSample(wave, phase){
  const p = phase - Math.floor(phase);
  if(wave === 'triangle') return 1 - 4 * Math.abs(Math.round(p - .25) - (p - .25));
  if(wave === 'sawtooth') return p * 2 - 1;
  if(wave === 'sine') return Math.sin(p * Math.PI * 2);
  return p < .5 ? 1 : -1;
}

function renderCueSamples(cue, options = {}){
  const sampleRate = options.sampleRate || DEFAULT_SAMPLE_RATE;
  const duration = Math.max(.02, cueDuration(cue));
  const sampleCount = Math.max(1, Math.ceil(duration * sampleRate));
  const samples = new Float32Array(sampleCount);
  const tones = flattenTones(cue);
  const noiseLayers = flattenNoise(cue);
  tones.forEach((tone, toneIndex) => {
    const start = Math.max(0, Math.floor((+tone.delay || 0) * sampleRate));
    const toneDuration = Math.max(.001, +tone.duration || 0);
    const end = Math.min(sampleCount, start + Math.ceil(toneDuration * sampleRate));
    const baseFreq = Math.max(1, +tone.freq || 1);
    const slide = +tone.slide || 0;
    const detune = +tone.detune || 0;
    const volume = +tone.volume || +cue.volume || .01;
    let phase = 0;
    for(let i = start; i < end; i++){
      const t = (i - start) / Math.max(1, end - start);
      const freq = Math.max(30, baseFreq + slide * t + baseFreq * detune);
      phase += freq / sampleRate;
      const attack = Math.min(1, t / .08);
      const decay = Math.pow(1 - t, .7);
      samples[i] += waveSample(tone.wave || cue.wave || 'square', phase) * volume * attack * decay;
    }
    if(toneIndex > 8) return;
  });
  noiseLayers.forEach((noise, noiseIndex) => {
    const start = Math.max(0, Math.floor((+noise.delay || 0) * sampleRate));
    const durationSeconds = Math.max(.001, +noise.duration || 0);
    const end = Math.min(sampleCount, start + Math.ceil(durationSeconds * sampleRate));
    const volume = +noise.volume || .003;
    const random = seededNoise(0xACED + noiseIndex * 997 + sampleCount);
    let previous = 0;
    for(let i = start; i < end; i++){
      const t = (i - start) / Math.max(1, end - start);
      const raw = random();
      const hp = raw - previous * .68;
      previous = raw;
      samples[i] += hp * volume * Math.pow(1 - t, .55);
    }
  });
  return samples;
}

function samplesToS16le(samples){
  const buffer = Buffer.alloc(samples.length * 2);
  for(let i = 0; i < samples.length; i++){
    const clamped = Math.max(-1, Math.min(1, samples[i] || 0));
    buffer.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  return buffer;
}

function bufferToSamples(buffer){
  const count = Math.floor(buffer.length / 2);
  const samples = new Float32Array(count);
  for(let i = 0; i < count; i++) samples[i] = buffer.readInt16LE(i * 2) / 32768;
  return samples;
}

function frameRms(samples, sampleRate, frameMs = DEFAULT_FRAME_MS){
  const size = Math.max(1, Math.round(sampleRate * frameMs / 1000));
  const frames = [];
  for(let start = 0; start < samples.length; start += size){
    const end = Math.min(samples.length, start + size);
    let sumSq = 0;
    let peak = 0;
    let crossings = 0;
    let previous = samples[start] || 0;
    for(let i = start; i < end; i++){
      const sample = samples[i] || 0;
      const abs = Math.abs(sample);
      peak = Math.max(peak, abs);
      sumSq += sample * sample;
      if(i > start && ((sample >= 0 && previous < 0) || (sample < 0 && previous >= 0))) crossings++;
      previous = sample;
    }
    frames.push({
      rms: Math.sqrt(sumSq / Math.max(1, end - start)),
      peak,
      zeroCrossingsPerSecond: crossings / Math.max(.001, (end - start) / sampleRate)
    });
  }
  return frames;
}

function analyzeSamples(samples, sampleRate = DEFAULT_SAMPLE_RATE){
  let sumSq = 0;
  let peak = 0;
  let crossings = 0;
  let previous = samples[0] || 0;
  for(let i = 0; i < samples.length; i++){
    const sample = samples[i] || 0;
    const abs = Math.abs(sample);
    peak = Math.max(peak, abs);
    sumSq += sample * sample;
    if(i > 0 && ((sample >= 0 && previous < 0) || (sample < 0 && previous >= 0))) crossings++;
    previous = sample;
  }
  const frames = frameRms(samples, sampleRate);
  const rmsValues = frames.map(frame => frame.rms);
  const avgFrame = mean(rmsValues);
  const peakFrame = Math.max(0, ...rmsValues);
  const peakFrameIndex = rmsValues.indexOf(peakFrame);
  const split = Math.max(1, Math.floor(rmsValues.length / 2));
  const burstFloor = avgFrame + stdev(rmsValues) * .85;
  const burstFrames = rmsValues.filter(value => value > burstFloor).length;
  const duration = samples.length / sampleRate;
  return {
    durationSeconds: rounded(duration),
    rms: rounded(Math.sqrt(sumSq / Math.max(1, samples.length)), 5),
    peak: rounded(peak, 5),
    zeroCrossingsPerSecond: rounded(crossings / Math.max(.001, duration), 1),
    zeroCrossingFrequencyProxyHz: rounded(crossings / Math.max(.001, duration) / 2, 1),
    burstFrameShare: rounded(burstFrames / Math.max(1, frames.length)),
    envelopeContrast: rounded(peakFrame / Math.max(.00001, avgFrame)),
    decayRatio: rounded(mean(rmsValues.slice(split)) / Math.max(.00001, mean(rmsValues.slice(0, split)))),
    attackPeakPosition: rounded(peakFrameIndex / Math.max(1, frames.length - 1)),
    frameRmsP10: rounded(percentile(rmsValues, .1), 5),
    frameRmsP50: rounded(percentile(rmsValues, .5), 5),
    frameRmsP90: rounded(percentile(rmsValues, .9), 5)
  };
}

function extractPcmFromVideo(sourcePath, startSeconds, durationSeconds, sampleRate = DEFAULT_SAMPLE_RATE){
  return run('ffmpeg', [
    '-v', 'error',
    '-ss', String(Math.max(0, startSeconds)),
    '-t', String(Math.max(.02, durationSeconds)),
    '-i', sourcePath,
    '-vn',
    '-ac', '1',
    '-ar', String(sampleRate),
    '-f', 's16le',
    'pipe:1'
  ], { encoding: 'buffer' });
}

function renderAudioPreviewFromPcm({ pcm, sampleRate, waveform, spectrogram }){
  ensureDir(waveform);
  const minPreviewBytes = Math.ceil(sampleRate * .08) * 2;
  const previewPcm = pcm.length >= minPreviewBytes
    ? pcm
    : Buffer.concat([pcm, Buffer.alloc(minPreviewBytes - pcm.length)]);
  run('ffmpeg', [
    '-v', 'error',
    '-f', 's16le',
    '-ac', '1',
    '-ar', String(sampleRate),
    '-i', 'pipe:0',
    '-filter_complex', 'showwavespic=s=720x150:colors=cyan',
    '-frames:v', '1',
    '-y',
    waveform
  ], { input: previewPcm });
  run('ffmpeg', [
    '-v', 'error',
    '-f', 's16le',
    '-ac', '1',
    '-ar', String(sampleRate),
    '-i', 'pipe:0',
    '-lavfi', 'showspectrumpic=s=720x280:legend=0:color=intensity',
    '-frames:v', '1',
    '-y',
    spectrogram
  ], { input: previewPcm });
}

function cueStaticMetrics(cue){
  const tones = flattenTones(cue);
  const freqs = tones.map(tone => +tone.freq || 0).filter(Boolean);
  const first = freqs[0] || 0;
  const last = freqs.at(-1) || 0;
  return {
    toneCount: tones.length,
    noiseCount: flattenNoise(cue).length,
    totalDurationSeconds: rounded(cueDuration(cue)),
    firstFrequencyHz: first,
    lastFrequencyHz: last,
    peakFrequencyHz: freqs.length ? Math.max(...freqs) : 0,
    minFrequencyHz: freqs.length ? Math.min(...freqs) : 0,
    frequencyDropHz: rounded(first - last, 1),
    waveFamilies: Array.from(new Set(tones.map(tone => tone.wave || cue.wave || '').filter(Boolean))).sort(),
    squareToneShare: tones.length ? rounded(tones.filter(tone => (tone.wave || cue.wave) === 'square').length / tones.length) : 0,
    hasSlide: tones.some(tone => Math.abs(+tone.slide || 0) > 0)
  };
}

module.exports = {
  DEFAULT_SAMPLE_RATE,
  analyzeSamples,
  bufferToSamples,
  cueDuration,
  cueStaticMetrics,
  ensureDir,
  extractPcmFromVideo,
  flattenNoise,
  flattenTones,
  loadPack,
  mean,
  readJson,
  rel,
  renderAudioPreviewFromPcm,
  renderCueSamples,
  rounded,
  samplesToS16le,
  writeJson
};

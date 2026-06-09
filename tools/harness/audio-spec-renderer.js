const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, DIST_DEV } = require('../build/paths');

const OFFLINE_SAMPLE_RATE = 22050;

function writeWavMono(outPath, data, sampleRate = OFFLINE_SAMPLE_RATE){
  const pcm = Buffer.alloc(data.length * 2);
  for(let i = 0; i < data.length; i += 1){
    const value = Math.max(-1, Math.min(1, Number(data[i]) || 0));
    pcm.writeInt16LE(Math.round(value * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(outPath, Buffer.concat([header, pcm]));
}

function waveAt(wave, phase){
  const p = phase - Math.floor(phase);
  if(wave === 'sine') return Math.sin(p * Math.PI * 2);
  if(wave === 'triangle') return 1 - (4 * Math.abs(Math.round(p - .25) - (p - .25)));
  if(wave === 'sawtooth') return (p * 2) - 1;
  return p < .5 ? 1 : -1;
}

function mixTone(buffer, tone = {}, offsetSeconds = 0, sampleRate = OFFLINE_SAMPLE_RATE){
  const start = Math.max(0, Math.floor(offsetSeconds * sampleRate));
  const duration = Math.max(.01, +tone.duration || .08);
  const samples = Math.max(1, Math.floor(duration * sampleRate));
  const freq = Math.max(20, +tone.freq || 440);
  const slide = Number.isFinite(+tone.slide) ? +tone.slide : 0;
  const volume = Math.max(0, Math.min(1, +tone.volume || .02));
  const attack = Math.max(.001, Math.min(duration * .8, Number.isFinite(+tone.attack) ? +tone.attack : .008));
  const wave = String(tone.wave || 'square');
  let phase = 0;
  for(let i = 0; i < samples && start + i < buffer.length; i += 1){
    const t = i / sampleRate;
    const f = Math.max(20, freq + (slide * (t / duration)));
    phase += f / sampleRate;
    const releaseStart = duration * .72;
    const env = t < attack
      ? Math.max(.0001, t / attack)
      : t > releaseStart
        ? Math.max(.0001, 1 - ((t - releaseStart) / Math.max(.001, duration - releaseStart)))
        : 1;
    buffer[start + i] += waveAt(wave, phase) * volume * env;
  }
}

function mixNoise(buffer, burst = {}, offsetSeconds = 0, sampleRate = OFFLINE_SAMPLE_RATE){
  const start = Math.max(0, Math.floor(offsetSeconds * sampleRate));
  const duration = Math.max(.01, +burst.duration || .08);
  const samples = Math.max(1, Math.floor(duration * sampleRate));
  const volume = Math.max(0, Math.min(1, +burst.volume || .02));
  let seed = 2166136261 >>> 0;
  for(let i = 0; i < samples && start + i < buffer.length; i += 1){
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const t = i / sampleRate;
    const env = Math.max(.0001, 1 - (t / duration));
    buffer[start + i] += (((seed / 0xffffffff) * 2) - 1) * volume * env;
  }
}

function referencePcm(clip, clipStart = 0, clipDuration = 0){
  const normalized = String(clip || '').replace(/^assets\//, 'assets/');
  const source = [
    path.join(ROOT, 'src', normalized),
    path.join(DIST_DEV, normalized)
  ].find(candidate => fs.existsSync(candidate));
  if(!source) return new Float32Array();
  const args = ['-v', 'error', '-ss', String(Math.max(0, +clipStart || 0))];
  if(Number.isFinite(+clipDuration) && +clipDuration > 0) args.push('-t', String(+clipDuration));
  args.push('-i', source, '-ac', '1', '-ar', String(OFFLINE_SAMPLE_RATE), '-f', 'f32le', 'pipe:1');
  const res = spawnSync('ffmpeg', args, { cwd: ROOT, encoding: null, maxBuffer: 1024 * 1024 * 24 });
  if(res.status !== 0 || !res.stdout?.length) return new Float32Array();
  const samples = Math.floor(res.stdout.byteLength / 4);
  const pcm = new Float32Array(samples);
  for(let i = 0; i < samples; i += 1) pcm[i] = res.stdout.readFloatLE(i * 4);
  return pcm;
}

function mixReference(buffer, layer = {}, offsetSeconds = 0, sampleRate = OFFLINE_SAMPLE_RATE){
  const pcm = referencePcm(layer.referenceClip, layer.clipStart, layer.clipDuration);
  const start = Math.max(0, Math.floor(offsetSeconds * sampleRate));
  const volume = Math.max(0, Math.min(1, Number.isFinite(+layer.referenceVolume) ? +layer.referenceVolume : 1));
  for(let i = 0; i < pcm.length && start + i < buffer.length; i += 1){
    buffer[start + i] += pcm[i] * volume;
  }
}

function mixSpecLayer(buffer, layer = {}, baseDelay = 0, sampleRate = OFFLINE_SAMPLE_RATE){
  const delay = baseDelay + Math.max(0, +layer.delay || 0);
  if(layer.referenceClip) mixReference(buffer, layer, delay, sampleRate);
  if(Array.isArray(layer.seq) && layer.seq.length){
    const step = Math.max(.01, +layer.step || .05);
    for(let i = 0; i < layer.seq.length; i += 1){
      if(+layer.seq[i] > 0){
        mixTone(buffer, {
          freq: +layer.seq[i],
          duration: step,
          wave: layer.wave || 'square',
          volume: layer.volume || .02,
          slide: layer.slide || 0,
          lpHz: layer.lpHz
        }, delay + (i * step * .92), sampleRate);
      }
    }
  }
  if(Array.isArray(layer.tones))for(const tone of layer.tones){
    mixTone(buffer, tone, delay + Math.max(0, +tone.delay || 0), sampleRate);
  }
  if(Array.isArray(layer.noise))for(const burst of layer.noise){
    mixNoise(buffer, burst, delay + Math.max(0, +burst.delay || 0), sampleRate);
  }
}

function cueLayerDuration(layer = {}){
  const delay = Math.max(0, +layer.delay || 0);
  if(layer.referenceClip){
    const clipped = Math.max(0, +layer.clipDuration || 0);
    return delay + (clipped > 0 ? clipped : 4);
  }
  let endT = .12;
  if(Array.isArray(layer.seq) && layer.seq.length){
    const step = Math.max(.01, +layer.step || .05);
    endT = Math.max(endT, ((layer.seq.length - 1) * step * .92) + step + .06);
  }
  if(Array.isArray(layer.tones))for(const tone of layer.tones){
    endT = Math.max(endT, Math.max(0, +tone.delay || 0) + Math.max(.01, +tone.duration || .08) + .06);
  }
  if(Array.isArray(layer.noise))for(const burst of layer.noise){
    endT = Math.max(endT, Math.max(0, +burst.delay || 0) + Math.max(.01, +burst.duration || .08) + .04);
  }
  return delay + endT;
}

function specScheduledDurationSeconds(spec = {}){
  if(!spec || !Object.keys(spec).length) return null;
  if(Number.isFinite(+spec.scheduledDuration) && +spec.scheduledDuration > 0) return +(+spec.scheduledDuration).toFixed(3);
  if(Number.isFinite(+spec.clipDuration) && +spec.clipDuration > 0) return +(+spec.clipDuration).toFixed(3);
  if(Array.isArray(spec.layers) && spec.layers.length){
    return +Math.max(...spec.layers.map(layer => cueLayerDuration(layer))).toFixed(3);
  }
  return +cueLayerDuration(spec).toFixed(3);
}

function renderSpecToWav(spec = {}, outPath, capturePrerollMs = 80){
  const preroll = Math.max(0, (+capturePrerollMs || 0) / 1000);
  const scheduled = specScheduledDurationSeconds(spec) || .7;
  const duration = Math.max(.25, Math.min(12, preroll + scheduled + .2));
  const buffer = new Float32Array(Math.ceil(duration * OFFLINE_SAMPLE_RATE));
  const layers = Array.isArray(spec.layers) && spec.layers.length ? spec.layers : [spec];
  for(const layer of layers) mixSpecLayer(buffer, layer, preroll, OFFLINE_SAMPLE_RATE);
  let peak = 0;
  for(const value of buffer) peak = Math.max(peak, Math.abs(value));
  if(peak > .98){
    const scale = .98 / peak;
    for(let i = 0; i < buffer.length; i += 1) buffer[i] *= scale;
  }
  writeWavMono(outPath, buffer, OFFLINE_SAMPLE_RATE);
}

module.exports = {
  OFFLINE_SAMPLE_RATE,
  renderSpecToWav,
  specScheduledDurationSeconds
};

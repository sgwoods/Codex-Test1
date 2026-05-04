#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAME_SUMMARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-frame-reference', 'frame-reference-summary.json');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'audio-isolated-cue-candidates-0.1.json');
const SAMPLE_RATE = 11025;
const FRAME_MS = 10;

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
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 512,
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

function median(values){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
}

function percentile(values, q){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const index = Math.max(0, Math.min(list.length - 1, Math.round((list.length - 1) * q)));
  return list[index];
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

function readSamples(buffer){
  const count = Math.floor(buffer.length / 2);
  const samples = new Float32Array(count);
  for(let i = 0; i < count; i++) samples[i] = buffer.readInt16LE(i * 2) / 32768;
  return samples;
}

function frameMetrics(samples){
  const size = Math.max(1, Math.round(SAMPLE_RATE * FRAME_MS / 1000));
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
    const duration = (end - start) / SAMPLE_RATE;
    frames.push({
      index: frames.length,
      startSample: start,
      endSample: end,
      t: start / SAMPLE_RATE,
      duration,
      rms: Math.sqrt(sumSq / Math.max(1, end - start)),
      peak,
      zeroCrossingsPerSecond: crossings / Math.max(.001, duration)
    });
  }
  return frames;
}

function mergeActiveFrames(frames){
  const rmsValues = frames.map(frame => frame.rms);
  const floor = Math.max(.004, percentile(rmsValues, .55));
  const burst = Math.max(floor * 1.75, percentile(rmsValues, .82));
  const segments = [];
  let open = null;
  for(const frame of frames){
    const active = frame.rms >= burst || (open && frame.rms >= floor * 1.18);
    if(active && !open) open = { startIndex: frame.index, endIndex: frame.index };
    else if(active) open.endIndex = frame.index;
    else if(open){
      segments.push(open);
      open = null;
    }
  }
  if(open) segments.push(open);
  const merged = [];
  for(const segment of segments){
    const previous = merged[merged.length - 1];
    if(previous && (segment.startIndex - previous.endIndex) * FRAME_MS <= 35) previous.endIndex = segment.endIndex;
    else merged.push(segment);
  }
  const peakSeedFrames = frames
    .filter(frame => frame.rms >= Math.max(floor * 1.18, percentile(rmsValues, .68)))
    .sort((a, b) => b.rms - a.rms)
    .slice(0, 12);
  for(const frame of peakSeedFrames){
    if(merged.some(segment => frame.index >= segment.startIndex - 4 && frame.index <= segment.endIndex + 4)) continue;
    const startIndex = Math.max(0, frame.index - 2);
    const endIndex = Math.min(frames.length - 1, frame.index + 5);
    merged.push({ startIndex, endIndex });
  }
  return merged
    .sort((a, b) => a.startIndex - b.startIndex)
    .map(segment => ({ startIndex: segment.startIndex, endIndex: segment.endIndex, thresholdFloor: floor, thresholdBurst: burst }))
    .filter(segment => (segment.endIndex - segment.startIndex + 1) * FRAME_MS >= 20);
}

function analyzeSegment(samples, frames, segment){
  const startFrame = frames[segment.startIndex];
  const endFrame = frames[segment.endIndex];
  const start = startFrame.startSample;
  const end = endFrame.endSample;
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
  const duration = Math.max(.001, (end - start) / SAMPLE_RATE);
  const localFrames = frames.slice(segment.startIndex, segment.endIndex + 1);
  const frameRms = localFrames.map(frame => frame.rms);
  const split = Math.max(1, Math.floor(frameRms.length / 2));
  return {
    startSeconds: rounded(start / SAMPLE_RATE),
    durationSeconds: rounded(duration),
    rms: rounded(Math.sqrt(sumSq / Math.max(1, end - start)), 5),
    peak: rounded(peak, 5),
    zeroCrossingsPerSecond: rounded(crossings / duration, 1),
    envelopeContrast: rounded((Math.max(...frameRms) || 0) / Math.max(.00001, mean(frameRms))),
    decayRatio: rounded(mean(frameRms.slice(split)) / Math.max(.00001, mean(frameRms.slice(0, split)))),
    frameCount: localFrames.length
  };
}

function classifyCandidate(metric, windowId){
  const id = String(windowId || '');
  if((id.includes('dive') || id.includes('flagship')) && metric.durationSeconds >= .08) return 'dive-pressure-mix';
  if(id.includes('wrap') && metric.durationSeconds >= .08) return 'dive-or-loss-sweep';
  if(metric.durationSeconds <= .07 && metric.zeroCrossingsPerSecond >= 240) return 'shot-or-hit-click';
  if(metric.durationSeconds <= .14 && metric.zeroCrossingsPerSecond >= 180) return 'short-hit-or-enemy-shot';
  if(metric.durationSeconds >= .18 && metric.durationSeconds <= .75 && metric.decayRatio < 1.15) return 'dive-or-loss-sweep';
  if(id.includes('dive') || id.includes('flagship')) return 'dive-pressure-mix';
  if(id.includes('player-single-shot')) return 'shot-pressure-mix';
  return 'mixed-gameplay-cue';
}

function analyzeWindow(source, win){
  const pcm = extractPcm(source.localPath, win.startSeconds, Math.min(win.durationSeconds, 24));
  const samples = readSamples(pcm);
  const frames = frameMetrics(samples);
  return mergeActiveFrames(frames).slice(0, 24).map((segment, index) => {
    const metric = analyzeSegment(samples, frames, segment);
    return Object.assign({
      candidateId: `${source.sourceId}-${win.id}-${String(index + 1).padStart(2, '0')}`,
      sourceId: source.sourceId,
      windowId: win.id,
      absoluteStartSeconds: rounded(win.startSeconds + metric.startSeconds),
      family: classifyCandidate(metric, win.id)
    }, metric);
  });
}

function summarizeFamily(candidates){
  const byFamily = {};
  for(const candidate of candidates){
    byFamily[candidate.family] = byFamily[candidate.family] || [];
    byFamily[candidate.family].push(candidate);
  }
  return Object.fromEntries(Object.entries(byFamily).map(([family, entries]) => [family, {
    count: entries.length,
    medianDurationSeconds: rounded(median(entries.map(entry => entry.durationSeconds))),
    medianZeroCrossingsPerSecond: rounded(median(entries.map(entry => entry.zeroCrossingsPerSecond)), 1),
    medianEnvelopeContrast: rounded(median(entries.map(entry => entry.envelopeContrast))),
    medianDecayRatio: rounded(median(entries.map(entry => entry.decayRatio))),
    representativeCandidateIds: entries.slice().sort((a, b) => b.peak - a.peak).slice(0, 6).map(entry => entry.candidateId)
  }]));
}

function main(){
  if(!fs.existsSync(FRAME_SUMMARY)) fail('Missing Galaxian frame-reference summary.');
  const summary = readJson(FRAME_SUMMARY);
  const candidates = [];
  const sourceReads = [];
  for(const source of summary.sources || []){
    if(!source.localPath || !fs.existsSync(source.localPath)) continue;
    const before = candidates.length;
    for(const win of source.windows || []) candidates.push(...analyzeWindow(source, win));
    sourceReads.push({
      sourceId: source.sourceId,
      localPath: source.localPath,
      analyzedWindows: source.windows.length,
      candidateCount: candidates.length - before
    });
  }
  const familySummary = summarizeFamily(candidates);
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'isolated-audio-cue-candidate-analysis',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'mixed-source-cue-candidates-not-final-isolated-hardware-cues',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-isolated-cue-candidates.js',
    sourceEvidence: {
      frameReferenceSummary: rel(FRAME_SUMMARY),
      sampleRateHz: SAMPLE_RATE,
      frameMs: FRAME_MS,
      sourceReads
    },
    purpose: 'Detect short, high-energy cue candidates inside the Galaxian source windows so Guardians audio tuning can graduate from whole-window waveform proxies toward isolated shot, hit, dive, and loss cue evidence.',
    familySummary,
    candidateCount: candidates.length,
    candidates: candidates
      .sort((a, b) => a.sourceId.localeCompare(b.sourceId) || a.absoluteStartSeconds - b.absoluteStartSeconds)
      .slice(0, 120),
    tuningTargets: {
      shotOrHitClick: familySummary['shot-or-hit-click'] || null,
      shortHitOrEnemyShot: familySummary['short-hit-or-enemy-shot'] || null,
      diveOrLossSweep: familySummary['dive-or-loss-sweep'] || null
    },
    nextPromotion: 'Export candidate audio snippets and manually label shot, enemy-shot, hit, dive, life-loss, and start/game-over cues before replacing synthetic cue bands.'
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    candidateCount: artifact.candidateCount,
    families: Object.fromEntries(Object.entries(familySummary).map(([key, value]) => [key, value.count])),
    sourceReads
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

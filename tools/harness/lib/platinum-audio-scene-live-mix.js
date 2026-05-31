const fs = require('fs');
const path = require('path');
const {
  DEFAULT_SAMPLE_RATE,
  analyzeSamples,
  bufferToSamples,
  ensureDir,
  extractPcmFromVideo,
  readJson,
  rel,
  renderAudioPreviewFromPcm,
  rounded
} = require('./platinum-audio-conformance');

function fail(message, payload){
  const err = new Error(message);
  err.payload = payload;
  throw err;
}

function captureReportPath(root, config, label){
  const file = path.join(root, config.captureDir, `latest-${label}.json`);
  if(!fs.existsSync(file)){
    fail(`Missing gameplay capture report for label "${label}"`, { label, expected: rel(root, file) });
  }
  return file;
}

function readCaptureReport(root, config, label){
  const file = captureReportPath(root, config, label);
  const report = readJson(file);
  if(report.artifactType !== 'gameplay-segment-capture'){
    fail(`Capture report for "${label}" has wrong type`, { label, artifactType: report.artifactType, file: rel(root, file) });
  }
  return { file, report };
}

function captureVideoPath(root, captureReport){
  const videoPath = captureReport.video || captureReport.rawVideo;
  if(!videoPath) fail('Capture report is missing video path', { captureReport });
  const file = path.join(root, videoPath);
  if(!fs.existsSync(file)) fail('Capture video is missing on disk', { file: rel(root, file) });
  return file;
}

function captureDurationSeconds(captureReport){
  return Math.max(
    0.25,
    +(captureReport.videoAssessment?.formatDuration || 0)
    || +(captureReport.capture?.seconds || 0)
    || +(captureReport.finalState?.stageClock || 0)
    || 0.25
  );
}

function sessionEvents(captureReport){
  const events = Array.isArray(captureReport.sessionEvents) ? captureReport.sessionEvents.slice() : [];
  if(events.length) return events;
  const audioHistory = Array.isArray(captureReport.audioHistory) ? captureReport.audioHistory : [];
  return audioHistory.map(entry => Object.assign({
    type: 'audio_cue',
    t: Number.isFinite(+entry.recAt) ? +entry.recAt : (+entry.at || 0)
  }, entry));
}

function audioCueEvents(captureReport){
  return sessionEvents(captureReport).filter(event => event && event.type === 'audio_cue' && event.cue);
}

function eventMatches(event, anchor){
  if(!event || !anchor) return false;
  if(anchor.eventType && String(event.type || '') !== String(anchor.eventType)) return false;
  if(anchor.cue && String(event.cue || '') !== String(anchor.cue)) return false;
  if(Array.isArray(anchor.cueAny) && anchor.cueAny.length && !anchor.cueAny.includes(String(event.cue || ''))) return false;
  if(anchor.phase && String(event.phase || '') !== String(anchor.phase)) return false;
  if(anchor.stage !== undefined && +event.stage !== +anchor.stage) return false;
  if(anchor.challenge !== undefined && !!event.challenge !== !!anchor.challenge) return false;
  return true;
}

function resolveAnchorTime(captureReport, anchor, fallbackSeconds, options = {}){
  if(!anchor) return Math.max(0, fallbackSeconds || 0);
  if(Number.isFinite(+anchor.seconds)) return Math.max(0, +anchor.seconds);
  const minSeconds = Number.isFinite(+options.minSeconds)
    ? +options.minSeconds
    : (Number.isFinite(+anchor.minSeconds) ? +anchor.minSeconds : null);
  const events = sessionEvents(captureReport).filter(event => {
    if(!eventMatches(event, anchor)) return false;
    if(minSeconds !== null && (+event?.t || 0) < minSeconds) return false;
    return true;
  });
  const occurrence = Math.max(1, Math.floor(+anchor.occurrence || 1));
  const event = events[occurrence - 1] || null;
  const base = event ? +event.t || 0 : (Number.isFinite(+anchor.fallbackSeconds) ? +anchor.fallbackSeconds : fallbackSeconds || 0);
  return Math.max(0, rounded(base + (+anchor.offsetSeconds || 0), 3));
}

function extractRuntimeSceneAudio(root, captureReport, startSeconds, endSeconds){
  const duration = Math.max(0.08, endSeconds - startSeconds);
  const pcm = extractPcmFromVideo(captureVideoPath(root, captureReport), startSeconds, duration, DEFAULT_SAMPLE_RATE);
  const samples = bufferToSamples(pcm);
  return {
    durationSeconds: duration,
    pcm,
    samples,
    metrics: analyzeSamples(samples, DEFAULT_SAMPLE_RATE)
  };
}

function renderRuntimePreview(root, previewDir, sceneId, runtimeAudio){
  const waveform = path.join(root, previewDir, `${sceneId}-runtime-waveform.png`);
  const spectrogram = path.join(root, previewDir, `${sceneId}-runtime-spectrogram.png`);
  ensureDir(waveform);
  renderAudioPreviewFromPcm({
    pcm: runtimeAudio.pcm,
    sampleRate: DEFAULT_SAMPLE_RATE,
    waveform,
    spectrogram
  });
  return {
    waveform: rel(root, waveform),
    spectrogram: rel(root, spectrogram)
  };
}

function sceneEventSummary(captureReport, startSeconds, endSeconds){
  const events = sessionEvents(captureReport).filter(event => {
    const t = +event?.t || 0;
    return t >= startSeconds && t <= endSeconds;
  });
  const cueEvents = events.filter(event => event.type === 'audio_cue' && event.cue);
  return {
    eventCount: events.length,
    cueEventCount: cueEvents.length,
    eventTypes: Array.from(new Set(events.map(event => String(event.type || '')).filter(Boolean))).sort(),
    cues: Array.from(new Set(cueEvents.map(event => String(event.cue || '')).filter(Boolean))).sort(),
    firstEvents: events.slice(0, 10)
  };
}

function waveformSlices(samples, sampleRate, sliceSeconds){
  const size = Math.max(1, Math.round(sampleRate * sliceSeconds));
  const slices = [];
  for(let start = 0, index = 0; start < samples.length; start += size, index += 1){
    const end = Math.min(samples.length, start + size);
    const slice = samples.subarray(start, end);
    const metrics = analyzeSamples(slice, sampleRate);
    slices.push(Object.assign({
      index,
      startSeconds: rounded(start / sampleRate),
      endSeconds: rounded(end / sampleRate)
    }, metrics));
  }
  return slices;
}

function countMatchingCueEvents(events, cues){
  const wanted = new Set((cues || []).map(String));
  return events.filter(event => wanted.has(String(event.cue || ''))).length;
}

function longestGapSeconds(events, durationSeconds){
  const times = events
    .map(event => +event?.t || 0)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if(!times.length) return rounded(durationSeconds, 3);
  let longest = Math.max(0, times[0]);
  for(let index = 1; index < times.length; index += 1){
    longest = Math.max(longest, times[index] - times[index - 1]);
  }
  longest = Math.max(longest, Math.max(0, durationSeconds - times[times.length - 1]));
  return rounded(longest, 3);
}

function intervalStats(events, cueName){
  const times = events
    .filter(event => String(event.cue || '') === String(cueName))
    .map(event => +event.t || 0)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const intervals = [];
  for(let index = 1; index < times.length; index += 1){
    intervals.push(rounded(times[index] - times[index - 1], 3));
  }
  const median = intervals.length
    ? intervals.slice().sort((a, b) => a - b)[Math.floor(intervals.length / 2)]
    : null;
  return {
    count: times.length,
    intervals,
    medianSeconds: median
  };
}

function perSliceCueDensity(events, durationSeconds, sliceSeconds){
  const count = Math.max(1, Math.ceil(durationSeconds / sliceSeconds));
  const slices = [];
  for(let index = 0; index < count; index += 1){
    const startSeconds = index * sliceSeconds;
    const endSeconds = Math.min(durationSeconds, startSeconds + sliceSeconds);
    const cueEvents = events.filter(event => {
      const t = +event?.t || 0;
      return t >= startSeconds && t < endSeconds;
    });
    slices.push({
      index,
      startSeconds: rounded(startSeconds),
      endSeconds: rounded(endSeconds),
      cueEventCount: cueEvents.length,
      cueEventsPer10s: rounded(cueEvents.length / Math.max(0.001, endSeconds - startSeconds) * 10, 2),
      cues: Array.from(new Set(cueEvents.map(event => String(event.cue || '')).filter(Boolean))).sort()
    });
  }
  return slices;
}

function scoreThresholdFloor(actual, target, softness = 0.35){
  if(target <= 0) return 10;
  if(actual >= target) return 10;
  const floor = Math.max(0.001, target * softness);
  return rounded(Math.max(0, Math.min(10, (actual / floor) * 5)));
}

function scoreThresholdCeiling(actual, target, softness = 0.4){
  if(target <= 0) return 10;
  if(actual <= target) return 10;
  const ceiling = target * (1 + softness);
  const over = Math.max(0, actual - target);
  const span = Math.max(0.001, ceiling - target);
  return rounded(Math.max(0, 10 - (over / span) * 10));
}

function activeSliceShare(rmsSlices){
  const rmsValues = rmsSlices.map(slice => +slice.rms || 0).filter(Number.isFinite);
  if(!rmsValues.length) return 0;
  const sorted = rmsValues.slice().sort((a, b) => a - b);
  const percentile = ratio => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)))];
  const quietFloor = percentile(0.2);
  const busyBand = percentile(0.8);
  const floor = quietFloor + Math.max(0.000001, busyBand - quietFloor) * 0.22;
  return rounded(rmsValues.filter(value => value >= floor).length / rmsValues.length, 3);
}

module.exports = {
  activeSliceShare,
  audioCueEvents,
  captureDurationSeconds,
  captureReportPath,
  countMatchingCueEvents,
  extractRuntimeSceneAudio,
  intervalStats,
  longestGapSeconds,
  perSliceCueDensity,
  readCaptureReport,
  renderRuntimePreview,
  resolveAnchorTime,
  sceneEventSummary,
  scoreThresholdCeiling,
  scoreThresholdFloor,
  sessionEvents,
  waveformSlices
};

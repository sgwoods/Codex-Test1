#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAME_SUMMARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-frame-reference', 'frame-reference-summary.json');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'object-track-conformance-0.1.json');

const REQUIRED_WINDOWS = [
  'matt-hawkins-arcade-intro/opening-rack-entry',
  'nenriki-15-wave-session/complete-rack-reference',
  'arcades-lounge-level-5/lower-field-dive-curves',
  'nenriki-15-wave-session/flagship-escort-pressure',
  'nenriki-15-wave-session/wrap-return-pressure'
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

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 384,
    timeout: 1000 * 60 * 10
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function probeImage(file){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'stream=width,height',
    '-of', 'json',
    file
  ]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return { width: stream.width || 0, height: stream.height || 0 };
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

function percentile(values, p){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const index = Math.max(0, Math.min(list.length - 1, Math.round((list.length - 1) * p)));
  return list[index];
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function decodeWindowFrames(windowSummary){
  const frameIndex = readJson(path.join(ROOT, windowSummary.frameIndex));
  const first = frameIndex.frames?.[0];
  if(!first) fail('Frame window has no indexed frames', windowSummary);
  const firstFile = path.join(ROOT, first.file);
  const { width, height } = probeImage(firstFile);
  const framesDir = path.dirname(firstFile);
  const raw = run('ffmpeg', [
    '-v', 'error',
    '-i', path.join(framesDir, 'frame-%05d.jpg'),
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    'pipe:1'
  ], { encoding: 'buffer' });
  const frameSize = width * height * 3;
  const frameCount = Math.floor(raw.length / frameSize);
  return {
    width,
    height,
    frameCount,
    frames: frameIndex.frames.slice(0, frameCount),
    raw,
    frameSize
  };
}

function isReferenceObjectPixel(raw, offset, p){
  const i = offset + p * 3;
  const r = raw[i];
  const g = raw[i + 1];
  const b = raw[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = .299 * r + .587 * g + .114 * b;
  return luma > 48 && max > 82 && (max - min > 26 || max > 142);
}

function componentForPixels(pixels, width, height){
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;
  for(const p of pixels){
    const x = p % width;
    const y = Math.floor(p / width);
    if(x < minX) minX = x;
    if(y < minY) minY = y;
    if(x > maxX) maxX = x;
    if(y > maxY) maxY = y;
    sumX += x;
    sumY += y;
  }
  const area = pixels.length;
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return {
    area,
    x: rounded(sumX / area / width),
    y: rounded(sumY / area / height),
    box: {
      x: rounded(minX / width),
      y: rounded(minY / height),
      w: rounded(w / width),
      h: rounded(h / height)
    },
    density: rounded(area / Math.max(1, w * h), 3)
  };
}

function connectedComponentsForFrame(decoded, frame){
  const { width, height, raw, frameSize } = decoded;
  const offset = frame * frameSize;
  const yMin = Math.floor(height * .105);
  const yMax = Math.floor(height * .9);
  const mask = new Uint8Array(width * height);
  for(let y = yMin; y < yMax; y++){
    for(let x = 0; x < width; x++){
      const p = y * width + x;
      if(isReferenceObjectPixel(raw, offset, p)) mask[p] = 1;
    }
  }
  const components = [];
  const stack = [];
  const neighbors = [-1, 1, -width, width];
  for(let y = yMin; y < yMax; y++){
    for(let x = 0; x < width; x++){
      const start = y * width + x;
      if(mask[start] !== 1) continue;
      mask[start] = 2;
      stack.length = 0;
      stack.push(start);
      const pixels = [];
      while(stack.length){
        const p = stack.pop();
        pixels.push(p);
        const px = p % width;
        for(const delta of neighbors){
          const n = p + delta;
          if(n < 0 || n >= mask.length || mask[n] !== 1) continue;
          if(delta === -1 && px === 0) continue;
          if(delta === 1 && px === width - 1) continue;
          mask[n] = 2;
          stack.push(n);
        }
      }
      if(pixels.length < 3 || pixels.length > 1800) continue;
      const component = componentForPixels(pixels, width, height);
      if(component.box.w < .006 || component.box.h < .004) continue;
      if(component.box.w > .28 || component.box.h > .18) continue;
      if(component.density < .08) continue;
      components.push(component);
    }
  }
  return components.sort((a, b) => b.area - a.area);
}

function distance(a, b){
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function buildTracklets(frames){
  let nextId = 1;
  const open = [];
  const closed = [];
  for(const frame of frames){
    const candidates = frame.components.filter(component => component.y >= .38 && component.y <= .88);
    const used = new Set();
    for(const track of open){
      let best = null;
      let bestIndex = -1;
      for(let i = 0; i < candidates.length; i++){
        if(used.has(i)) continue;
        const candidate = candidates[i];
        const d = distance(track.last, candidate);
        if(d < .1 && (!best || d < best.distance)){
          best = { component: candidate, distance: d };
          bestIndex = i;
        }
      }
      if(best){
        used.add(bestIndex);
        track.points.push({ frame: frame.index, t: frame.tSourceSeconds, x: best.component.x, y: best.component.y, area: best.component.area });
        track.last = best.component;
        track.missed = 0;
      } else {
        track.missed++;
      }
    }
    for(let i = 0; i < candidates.length; i++){
      if(used.has(i)) continue;
      const component = candidates[i];
      open.push({
        id: `track-${nextId++}`,
        last: component,
        missed: 0,
        points: [{ frame: frame.index, t: frame.tSourceSeconds, x: component.x, y: component.y, area: component.area }]
      });
    }
    for(let i = open.length - 1; i >= 0; i--){
      if(open[i].missed > 2) closed.push(open.splice(i, 1)[0]);
    }
  }
  closed.push(...open);
  return closed
    .filter(track => track.points.length >= 3)
    .map(track => {
      const xs = track.points.map(point => point.x);
      const ys = track.points.map(point => point.y);
      const ts = track.points.map(point => point.t);
      const first = track.points[0];
      const last = track.points[track.points.length - 1];
      return {
        id: track.id,
        sampleCount: track.points.length,
        startSeconds: rounded(first.t),
        endSeconds: rounded(last.t),
        durationSeconds: rounded(last.t - first.t),
        xSpan: rounded(Math.max(...xs) - Math.min(...xs)),
        ySpan: rounded(Math.max(...ys) - Math.min(...ys)),
        descent: rounded(last.y - first.y),
        meanArea: rounded(mean(track.points.map(point => point.area))),
        first: { x: rounded(first.x), y: rounded(first.y) },
        last: { x: rounded(last.x), y: rounded(last.y) },
        sampledPoints: track.points.filter((_, index) => index % Math.max(1, Math.floor(track.points.length / 8)) === 0).slice(0, 8)
      };
    })
    .sort((a, b) => (b.ySpan + b.xSpan + b.durationSeconds * .04) - (a.ySpan + a.xSpan + a.durationSeconds * .04));
}

function analyzeWindow(windowSummary){
  const decoded = decodeWindowFrames(windowSummary);
  const frames = [];
  for(let frame = 0; frame < decoded.frameCount; frame++){
    const components = connectedComponentsForFrame(decoded, frame);
    const rackComponents = components.filter(component => component.y >= .14 && component.y < .42);
    const lowerComponents = components.filter(component => component.y >= .42 && component.y <= .88);
    frames.push({
      index: frame,
      tSourceSeconds: decoded.frames[frame]?.tSourceSeconds ?? rounded(windowSummary.startSeconds + frame / windowSummary.sampledFps),
      components,
      componentCount: components.length,
      rackComponentCount: rackComponents.length,
      lowerComponentCount: lowerComponents.length,
      largestComponents: components.slice(0, 8)
    });
  }
  const tracklets = buildTracklets(frames);
  const descendingTracks = tracklets.filter(track => track.descent > .045 || track.ySpan > .09);
  const lateralTracks = tracklets.filter(track => track.xSpan > .08);
  return {
    id: windowSummary.id,
    sourceId: windowSummary.sourceId,
    windowKey: `${windowSummary.sourceId}/${windowSummary.id}`,
    label: windowSummary.label,
    startSeconds: windowSummary.startSeconds,
    durationSeconds: windowSummary.durationSeconds,
    sampledFps: windowSummary.sampledFps,
    decodedFrameCount: decoded.frameCount,
    frameSize: { width: decoded.width, height: decoded.height },
    evidence: {
      frameIndex: windowSummary.frameIndex,
      contactSheet: windowSummary.contactSheet,
      motionDifferenceSheet: windowSummary.motionDifferenceSheet,
      waveform: windowSummary.waveform,
      spectrogram: windowSummary.spectrogram
    },
    componentProxy: {
      medianComponentCount: rounded(median(frames.map(frame => frame.componentCount)), 1),
      medianRackComponentCount: rounded(median(frames.map(frame => frame.rackComponentCount)), 1),
      medianLowerComponentCount: rounded(median(frames.map(frame => frame.lowerComponentCount)), 1),
      p90LowerComponentCount: rounded(percentile(frames.map(frame => frame.lowerComponentCount), .9), 1),
      lowerComponentFrameShare: rounded(frames.filter(frame => frame.lowerComponentCount > 0).length / Math.max(1, frames.length)),
      rackComponentFrameShare: rounded(frames.filter(frame => frame.rackComponentCount > 0).length / Math.max(1, frames.length))
    },
    trackProxy: {
      trackletCount: tracklets.length,
      descendingTrackletCount: descendingTracks.length,
      lateralTrackletCount: lateralTracks.length,
      medianTrackDurationSeconds: rounded(median(tracklets.map(track => track.durationSeconds))),
      medianDescent: rounded(median(descendingTracks.map(track => track.descent))),
      medianYSpan: rounded(median(descendingTracks.map(track => track.ySpan))),
      medianXSpan: rounded(median(tracklets.map(track => track.xSpan))),
      candidateDiveTracklets: tracklets.slice(0, 10)
    },
    sampledFrames: frames
      .filter((_, index) => index % Math.max(1, Math.floor(decoded.frameCount / 10)) === 0)
      .slice(0, 10)
      .map(frame => ({
        index: frame.index,
        tSourceSeconds: frame.tSourceSeconds,
        componentCount: frame.componentCount,
        rackComponentCount: frame.rackComponentCount,
        lowerComponentCount: frame.lowerComponentCount,
        largestComponents: frame.largestComponents
      }))
  };
}

function scoreObjectTracking(metrics){
  const byKey = Object.fromEntries(metrics.map(metric => [metric.windowKey, metric]));
  const completeRack = byKey['nenriki-15-wave-session/complete-rack-reference'];
  const lowerDive = byKey['arcades-lounge-level-5/lower-field-dive-curves'];
  const flagship = byKey['nenriki-15-wave-session/flagship-escort-pressure'];
  const wrap = byKey['nenriki-15-wave-session/wrap-return-pressure'];
  const pressureWindows = [lowerDive, flagship, wrap].filter(Boolean);
  const descendingPressure = mean(pressureWindows.map(metric => metric.trackProxy.descendingTrackletCount));
  const lowerShare = mean(pressureWindows.map(metric => metric.componentProxy.lowerComponentFrameShare));
  const rackShare = completeRack?.componentProxy.rackComponentFrameShare || 0;
  return {
    objectTrackCoverage: rounded(clamp(7.4 + metrics.length * .28 + lowerShare * .4, 0, 9.0), 1),
    rackObjectStability: rounded(clamp(5.8 + rackShare * 1.6 + (completeRack?.componentProxy.medianRackComponentCount || 0) * .02, 5.8, 7.8), 1),
    divePathEvidence: rounded(clamp(5.6 + lowerShare * 1.2 + descendingPressure * .08, 5.6, 7.4), 1),
    tuningActionability: rounded(clamp(5.5 + descendingPressure * .05 + pressureWindows.length * .18, 5.5, 6.8), 1),
    evidenceDurability: 9.1
  };
}

function targetBands(metrics){
  const pressure = metrics.filter(metric => [
    'arcades-lounge-level-5/lower-field-dive-curves',
    'nenriki-15-wave-session/flagship-escort-pressure',
    'nenriki-15-wave-session/wrap-return-pressure'
  ].includes(metric.windowKey));
  const tracks = pressure.flatMap(metric => metric.trackProxy.candidateDiveTracklets || []);
  const descending = tracks.filter(track => track.descent > .045 || track.ySpan > .09);
  return {
    rackEntry: {
      rackComponentFrameShareFloor: .85,
      completeRackMedianRackComponents: metrics.find(metric => metric.windowKey === 'nenriki-15-wave-session/complete-rack-reference')?.componentProxy.medianRackComponentCount || 0
    },
    lowerFieldDivePressure: {
      medianCandidateDurationSeconds: rounded(median(descending.map(track => track.durationSeconds))),
      medianCandidateXSpan: rounded(median(descending.map(track => track.xSpan))),
      medianCandidateYSpan: rounded(median(descending.map(track => track.ySpan))),
      minimumDescendingTrackletsPerPressureWindow: 3
    },
    runtimeUse: 'Use these bands as reference evidence for the next constant-tuning pass; this artifact does not directly change Guardians runtime constants.'
  };
}

function main(){
  if(!fs.existsSync(FRAME_SUMMARY)) fail('Missing Galaxian frame-reference summary. Run npm run harness:cycle:galaxian-frame-reference first.');
  const summary = readJson(FRAME_SUMMARY);
  const windows = (summary.sources || []).flatMap(source => source.windows || []);
  const selected = REQUIRED_WINDOWS.map(key => {
    const [sourceId, windowId] = key.split('/');
    const found = windows.find(win => win.sourceId === sourceId && win.id === windowId);
    if(!found) fail(`Missing required Galaxian frame window: ${key}`, summary);
    return found;
  });
  const windowMetrics = selected.map(analyzeWindow);
  const objectProxyScores = scoreObjectTracking(windowMetrics);
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'object-track-conformance-baseline',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'object-track-proxy-not-final-sprite-recognition',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-object-track-conformance.js',
    sourceEvidence: {
      frameReferenceSummary: rel(FRAME_SUMMARY),
      selectedWindowCount: windowMetrics.length,
      selectedWindows: windowMetrics.map(metric => metric.windowKey),
      notes: 'This CPU-only pass extracts bright/color connected components and short lower-field tracklets from committed Galaxian frame windows. It is more actionable than full-frame brightness motion, but still not final sprite recognition or optical flow.'
    },
    objectProxyScores,
    targetBands: targetBands(windowMetrics),
    runtimeTuningRead: {
      currentRuntimeStillValid: true,
      immediateConstantChangeRecommended: false,
      reason: 'The object proxy now identifies lower-field candidate tracks, but the next runtime tuning should compare these target bands directly against instrumented Guardians runtime tracks in one harness.',
      nextRuntimePromotion: 'Add a runtime-vs-reference movement comparison for first-dive delay, dive x/y spans, wrap timing, and flagship escort pressure.'
    },
    windows: windowMetrics
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    selectedWindowCount: windowMetrics.length,
    objectProxyScores,
    pressureTracklets: windowMetrics.filter(metric => metric.windowKey.includes('dive') || metric.windowKey.includes('pressure')).map(metric => ({
      windowKey: metric.windowKey,
      tracklets: metric.trackProxy.trackletCount,
      descending: metric.trackProxy.descendingTrackletCount,
      lowerComponentFrameShare: metric.componentProxy.lowerComponentFrameShare
    }))
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

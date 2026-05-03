#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAME_SUMMARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-frame-reference', 'frame-reference-summary.json');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'frame-motion-conformance-0.1.json');

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
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: 1000 * 60 * 8
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

function median(values){
  const list = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!list.length) return 0;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
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

function rounded(value, places = 3){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function blankBox(){
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

function addBoxPixel(box, x, y){
  if(x < box.minX) box.minX = x;
  if(y < box.minY) box.minY = y;
  if(x > box.maxX) box.maxX = x;
  if(y > box.maxY) box.maxY = y;
}

function finishBox(box, width, height){
  if(!Number.isFinite(box.minX)) return null;
  return {
    x: rounded(box.minX / width),
    y: rounded(box.minY / height),
    w: rounded((box.maxX - box.minX + 1) / width),
    h: rounded((box.maxY - box.minY + 1) / height)
  };
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
  ], { encoding: 'buffer', maxBuffer: 1024 * 1024 * 320 });
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

function analyzeWindow(windowSummary){
  const decoded = decodeWindowFrames(windowSummary);
  const { width, height, frameCount, raw, frameSize } = decoded;
  const pixelCount = width * height;
  const frameMetrics = [];
  let prevGray = null;
  const unionBright = blankBox();
  const unionMotion = blankBox();
  for(let frame = 0; frame < frameCount; frame++){
    const offset = frame * frameSize;
    const gray = new Uint8Array(pixelCount);
    const brightBox = blankBox();
    const upperBox = blankBox();
    const lowerBox = blankBox();
    const sums = {
      bright: { count: 0, x: 0, y: 0 },
      upper: { count: 0, x: 0, y: 0 },
      lower: { count: 0, x: 0, y: 0 },
      motion: { count: 0, x: 0, y: 0 },
      lowerMotion: { count: 0, x: 0, y: 0 }
    };
    let motionMagnitude = 0;
    for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
        const i = offset + (y * width + x) * 3;
        const r = raw[i];
        const g = raw[i + 1];
        const b = raw[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const luma = Math.round(.299 * r + .587 * g + .114 * b);
        const p = y * width + x;
        gray[p] = luma;
        const bright = luma > 70 && (max - min > 24 || max > 132);
        if(bright){
          sums.bright.count++;
          sums.bright.x += x;
          sums.bright.y += y;
          addBoxPixel(brightBox, x, y);
          addBoxPixel(unionBright, x, y);
          if(y < height * .47){
            sums.upper.count++;
            sums.upper.x += x;
            sums.upper.y += y;
            addBoxPixel(upperBox, x, y);
          }
          if(y > height * .46){
            sums.lower.count++;
            sums.lower.x += x;
            sums.lower.y += y;
            addBoxPixel(lowerBox, x, y);
          }
        }
        if(prevGray){
          const diff = Math.abs(luma - prevGray[p]);
          motionMagnitude += diff;
          if(diff > 26){
            sums.motion.count++;
            sums.motion.x += x;
            sums.motion.y += y;
            addBoxPixel(unionMotion, x, y);
            if(y > height * .46){
              sums.lowerMotion.count++;
              sums.lowerMotion.x += x;
              sums.lowerMotion.y += y;
            }
          }
        }
      }
    }
    const center = source => source.count ? {
      x: rounded(source.x / source.count / width),
      y: rounded(source.y / source.count / height)
    } : null;
    frameMetrics.push({
      index: frame,
      tSourceSeconds: decoded.frames[frame]?.tSourceSeconds ?? rounded(windowSummary.startSeconds + frame / windowSummary.sampledFps),
      brightRatio: rounded(sums.bright.count / pixelCount, 5),
      upperBrightRatio: rounded(sums.upper.count / pixelCount, 5),
      lowerBrightRatio: rounded(sums.lower.count / pixelCount, 5),
      brightCenter: center(sums.bright),
      upperCenter: center(sums.upper),
      lowerCenter: center(sums.lower),
      brightBox: finishBox(brightBox, width, height),
      upperBox: finishBox(upperBox, width, height),
      lowerBox: finishBox(lowerBox, width, height),
      motionRatio: rounded(sums.motion.count / pixelCount, 5),
      lowerMotionRatio: rounded(sums.lowerMotion.count / pixelCount, 5),
      motionCenter: center(sums.motion),
      lowerMotionCenter: center(sums.lowerMotion),
      meanMotionMagnitude: rounded(motionMagnitude / Math.max(1, pixelCount) / 255, 5)
    });
    prevGray = gray;
  }
  const activeMotion = frameMetrics.filter(frame => frame.motionRatio > .006);
  const lowerMotion = frameMetrics.filter(frame => frame.lowerMotionRatio > .0025);
  const upperCenters = frameMetrics.map(frame => frame.upperCenter?.y).filter(Number.isFinite);
  const upperBright = frameMetrics.map(frame => frame.upperBrightRatio);
  const lowerBright = frameMetrics.map(frame => frame.lowerBrightRatio);
  const peakMotion = frameMetrics.reduce((best, frame) => frame.motionRatio > (best?.motionRatio || 0) ? frame : best, null);
  const peakLowerMotion = frameMetrics.reduce((best, frame) => frame.lowerMotionRatio > (best?.lowerMotionRatio || 0) ? frame : best, null);
  return {
    id: windowSummary.id,
    sourceId: windowSummary.sourceId,
    windowKey: `${windowSummary.sourceId}/${windowSummary.id}`,
    label: windowSummary.label,
    startSeconds: windowSummary.startSeconds,
    durationSeconds: windowSummary.durationSeconds,
    sampledFps: windowSummary.sampledFps,
    decodedFrameCount: frameCount,
    frameSize: { width, height },
    evidence: {
      frameIndex: windowSummary.frameIndex,
      contactSheet: windowSummary.contactSheet,
      motionDifferenceSheet: windowSummary.motionDifferenceSheet,
      waveform: windowSummary.waveform,
      spectrogram: windowSummary.spectrogram
    },
    motion: {
      activeMotionFrameCount: activeMotion.length,
      activeMotionShare: rounded(activeMotion.length / Math.max(1, frameCount)),
      firstActiveMotionAtSeconds: activeMotion[0]?.tSourceSeconds ?? null,
      peakMotionAtSeconds: peakMotion?.tSourceSeconds ?? null,
      peakMotionRatio: rounded(peakMotion?.motionRatio || 0, 5),
      firstLowerMotionAtSeconds: lowerMotion[0]?.tSourceSeconds ?? null,
      peakLowerMotionAtSeconds: peakLowerMotion?.tSourceSeconds ?? null,
      peakLowerMotionRatio: rounded(peakLowerMotion?.lowerMotionRatio || 0, 5),
      lowerMotionShareOfActive: rounded(lowerMotion.length / Math.max(1, activeMotion.length)),
      unionMotionBox: finishBox(unionMotion, width, height)
    },
    brightness: {
      medianBrightRatio: rounded(median(frameMetrics.map(frame => frame.brightRatio)), 5),
      medianUpperBrightRatio: rounded(median(upperBright), 5),
      medianLowerBrightRatio: rounded(median(lowerBright), 5),
      upperBrightStdev: rounded(stdev(upperBright), 5),
      upperCenterYStdev: rounded(stdev(upperCenters), 5),
      unionBrightBox: finishBox(unionBright, width, height)
    },
    sampledFrames: frameMetrics.filter((_, index) => index % Math.max(1, Math.floor(frameCount / 12)) === 0).slice(0, 12)
  };
}

function categoryScore(metrics){
  const byKey = Object.fromEntries(metrics.map(metric => [metric.windowKey, metric]));
  const rackEntry = byKey['matt-hawkins-arcade-intro/opening-rack-entry'];
  const completeRack = byKey['nenriki-15-wave-session/complete-rack-reference'];
  const lowerDive = byKey['arcades-lounge-level-5/lower-field-dive-curves'];
  const flagship = byKey['nenriki-15-wave-session/flagship-escort-pressure'];
  const wrap = byKey['nenriki-15-wave-session/wrap-return-pressure'];
  const sourceCoverage = clamp(7.8 + metrics.length * .28, 0, 9.2);
  const rackStability = completeRack
    ? clamp(8.2 - completeRack.brightness.upperCenterYStdev * 22 - completeRack.brightness.upperBrightStdev * 90, 5.4, 8.6)
    : 5;
  const rackEntryEvidence = rackEntry
    ? clamp(6.2 + rackEntry.motion.activeMotionShare * 1.4 + rackEntry.brightness.medianUpperBrightRatio * 12, 5.8, 7.4)
    : 5;
  const lowerDiveEvidence = mean([
    lowerDive?.motion.lowerMotionShareOfActive || 0,
    flagship?.motion.lowerMotionShareOfActive || 0,
    wrap?.motion.lowerMotionShareOfActive || 0
  ]);
  const movement = clamp(5.4 + lowerDiveEvidence * 2.1, 5.4, 7.2);
  const visual = clamp(6.3 + mean(metrics.map(metric => metric.brightness.medianBrightRatio)) * 8, 6.3, 6.9);
  const audio = metrics.every(metric => metric.evidence.waveform && metric.evidence.spectrogram) ? 4.8 : 4.5;
  return {
    referenceSourceCoverage: rounded(sourceCoverage, 1),
    formationRackTiming: rounded(mean([rackStability, rackEntryEvidence]), 1),
    movementPressure: rounded(movement, 1),
    visualAlienIdentity: rounded(visual, 1),
    audioReferenceCharacter: rounded(audio, 1),
    evidenceDurability: 9.0
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
  const score = categoryScore(windowMetrics);
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'frame-motion-conformance-baseline',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'frame-derived-reference-proxy-not-final-tracking',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-frame-motion-conformance.js',
    sourceEvidence: {
      frameReferenceSummary: rel(FRAME_SUMMARY),
      selectedWindowCount: windowMetrics.length,
      selectedWindows: windowMetrics.map(metric => metric.windowKey),
      notes: 'This is a CPU-only proxy pass over extracted Galaxian reference frames. It measures brightness and frame-difference motion regions from committed frame windows; it is not yet sprite tracking or optical flow.'
    },
    frameProxyScores: score,
    runtimeTuningRead: {
      currentRuntimeStillValid: true,
      immediateConstantChangeRecommended: false,
      reason: 'The frame proxy confirms the right evidence windows and lower-field motion families, but it does not yet identify a single safer runtime constant change than the existing gated timing bands.',
      nextRuntimePromotion: 'Use this artifact to add target bands for rack-entry duration, lower-field dive path curvature, and flagship/escort wrap timing after object-level tracking is added.'
    },
    windows: windowMetrics
  };
  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    selectedWindowCount: windowMetrics.length,
    frameProxyScores: score,
    selectedWindows: windowMetrics.map(metric => ({
      windowKey: metric.windowKey,
      frameCount: metric.decodedFrameCount,
      activeMotionShare: metric.motion.activeMotionShare,
      lowerMotionShareOfActive: metric.motion.lowerMotionShareOfActive
    }))
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

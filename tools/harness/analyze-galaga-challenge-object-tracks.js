#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SOURCE_DIR = path.join(ANALYSES, 'level-visual-conformance-index', 'latest-target-videos');
const CHALLENGE_VIDEO_REFERENCE = path.join(ANALYSES, 'galaga-challenge-video-reference', 'latest.json');
const OUT_ROOT = path.join(ANALYSES, 'galaga-challenge-object-tracks');
const LATEST = path.join(OUT_ROOT, 'latest.json');
const CHALLENGE_COUNT = 8;
const SAMPLE_FPS = 8;
const ACTIVE_WINDOW_SECONDS = 16;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function median(values){
  const list = values.filter(value => Number.isFinite(+value)).map(Number).sort((a, b) => a - b);
  if(!list.length) return 0;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
}

function percentile(values, p){
  const list = values.filter(value => Number.isFinite(+value)).map(Number).sort((a, b) => a - b);
  if(!list.length) return 0;
  const index = Math.max(0, Math.min(list.length - 1, Math.round((list.length - 1) * p)));
  return list[index];
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 1024,
    timeout: opts.timeout || 1000 * 60 * 10
  });
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function probeVideo(file){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
    '-of', 'json',
    file
  ]);
  const data = JSON.parse(raw);
  const stream = data.streams?.[0] || {};
  const [num, den] = String(stream.r_frame_rate || '0/1').split('/').map(Number);
  return {
    width: +stream.width || 0,
    height: +stream.height || 0,
    durationSeconds: Number.isFinite(+data.format?.duration) ? +data.format.duration : 0,
    sourceFps: den ? num / den : 0
  };
}

function decodeVideoFrames(file, fps = SAMPLE_FPS, window = {}){
  const info = probeVideo(file);
  if(!info.width || !info.height) fail('Unable to probe target challenge video', { file: rel(file), info });
  const args = ['-v', 'error'];
  if(Number.isFinite(+window.startSeconds) && +window.startSeconds > 0){
    args.push('-ss', String(+window.startSeconds));
  }
  args.push('-i', file);
  if(Number.isFinite(+window.durationSeconds) && +window.durationSeconds > 0){
    args.push('-t', String(+window.durationSeconds));
  }
  args.push(
    '-vf', `fps=${fps}`,
    '-f', 'rawvideo',
    '-pix_fmt', 'rgb24',
    'pipe:1'
  );
  const raw = run('ffmpeg', args, { encoding: 'buffer', timeout: 1000 * 60 * 15 });
  const frameSize = info.width * info.height * 3;
  const frameCount = Math.floor(raw.length / frameSize);
  return {
    file,
    width: info.width,
    height: info.height,
    durationSeconds: Number.isFinite(+window.durationSeconds) && +window.durationSeconds > 0
      ? Math.min(+window.durationSeconds, frameCount / fps || +window.durationSeconds)
      : (info.durationSeconds || frameCount / fps),
    sourceWindowStartSeconds: Number.isFinite(+window.startSeconds) ? +window.startSeconds : 0,
    sourceFps: info.sourceFps,
    sampleFps: fps,
    frameCount,
    frameSize,
    raw
  };
}

function pixelAt(decoded, offset, x, y){
  const p = offset + ((y * decoded.width + x) * 3);
  return [decoded.raw[p], decoded.raw[p + 1], decoded.raw[p + 2]];
}

function luma(r, g, b){
  return .299 * r + .587 * g + .114 * b;
}

function detectPlayfield(decoded){
  const samples = Math.min(decoded.frameCount, Math.max(1, Math.floor(decoded.sampleFps * 2)));
  const yStart = Math.floor(decoded.height * .04);
  const yEnd = Math.floor(decoded.height * .96);
  const darkness = new Array(decoded.width).fill(0);
  for(let frame = 0; frame < samples; frame += 1){
    const offset = frame * decoded.frameSize;
    for(let x = 0; x < decoded.width; x += 1){
      let dark = 0;
      let count = 0;
      for(let y = yStart; y < yEnd; y += 6){
        const [r, g, b] = pixelAt(decoded, offset, x, y);
        if(luma(r, g, b) < 48) dark += 1;
        count += 1;
      }
      darkness[x] += dark / Math.max(1, count);
    }
  }
  const darkCols = darkness.map(value => value / samples > .62);
  const runs = [];
  let start = null;
  for(let x = 0; x <= darkCols.length; x += 1){
    if(darkCols[x] && start === null) start = x;
    if((!darkCols[x] || x === darkCols.length) && start !== null){
      runs.push({ x: start, w: x - start });
      start = null;
    }
  }
  const best = runs
    .filter(run => run.w > decoded.width * .28)
    .sort((a, b) => b.w - a.w)[0];
  const fallback = {
    x: Math.floor(decoded.width * .205),
    y: 0,
    w: Math.floor(decoded.width * .59),
    h: Math.floor(decoded.height * .965)
  };
  if(!best) return fallback;
  const margin = Math.max(2, Math.round(decoded.width * .006));
  return {
    x: Math.max(0, best.x + margin),
    y: 0,
    w: Math.min(decoded.width - best.x - margin, best.w - margin * 2),
    h: Math.floor(decoded.height * .965)
  };
}

function isObjectPixel(decoded, offset, x, y, roi){
  if(x < roi.x || x >= roi.x + roi.w || y < roi.y || y >= roi.y + roi.h) return false;
  const localY = (y - roi.y) / roi.h;
  if(localY < .105 || localY > .875) return false;
  const [r, g, b] = pixelAt(decoded, offset, x, y);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = luma(r, g, b);
  const saturation = max - min;
  if(lum > 52 && max > 88 && (saturation > 28 || max > 154)){
    const nearBottomCenter = localY > .76 && Math.abs(((x - roi.x) / roi.w) - .5) < .18 && r > 150 && g > 150 && b > 150;
    return !nearBottomCenter;
  }
  return false;
}

function componentForPixels(pixels, decoded, roi, offset){
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;
  let red = 0;
  let green = 0;
  let blue = 0;
  for(const p of pixels){
    const x = p % decoded.width;
    const y = Math.floor(p / decoded.width);
    if(x < minX) minX = x;
    if(y < minY) minY = y;
    if(x > maxX) maxX = x;
    if(y > maxY) maxY = y;
    sumX += x;
    sumY += y;
    const [r, g, b] = pixelAt(decoded, offset, x, y);
    red += r;
    green += g;
    blue += b;
  }
  const area = pixels.length;
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  return {
    area,
    x: round((sumX / area - roi.x) / roi.w, 4),
    y: round((sumY / area - roi.y) / roi.h, 4),
    box: {
      x: round((minX - roi.x) / roi.w, 4),
      y: round((minY - roi.y) / roi.h, 4),
      w: round(w / roi.w, 4),
      h: round(h / roi.h, 4)
    },
    density: round(area / Math.max(1, w * h), 3),
    meanColor: {
      r: round(red / area, 1),
      g: round(green / area, 1),
      b: round(blue / area, 1)
    }
  };
}

function connectedComponentsForFrame(decoded, frame, roi){
  const offset = frame * decoded.frameSize;
  const mask = new Uint8Array(decoded.width * decoded.height);
  const yMin = Math.floor(roi.y + roi.h * .105);
  const yMax = Math.floor(roi.y + roi.h * .875);
  const xMin = roi.x;
  const xMax = roi.x + roi.w;
  for(let y = yMin; y < yMax; y += 1){
    for(let x = xMin; x < xMax; x += 1){
      const p = y * decoded.width + x;
      if(isObjectPixel(decoded, offset, x, y, roi)) mask[p] = 1;
    }
  }
  const components = [];
  const stack = [];
  const neighbors = [-1, 1, -decoded.width, decoded.width, -decoded.width - 1, -decoded.width + 1, decoded.width - 1, decoded.width + 1];
  for(let y = yMin; y < yMax; y += 1){
    for(let x = xMin; x < xMax; x += 1){
      const start = y * decoded.width + x;
      if(mask[start] !== 1) continue;
      mask[start] = 2;
      stack.length = 0;
      stack.push(start);
      const pixels = [];
      while(stack.length){
        const p = stack.pop();
        pixels.push(p);
        const px = p % decoded.width;
        for(const delta of neighbors){
          const n = p + delta;
          if(n < 0 || n >= mask.length || mask[n] !== 1) continue;
          if((delta === -1 || delta === -decoded.width - 1 || delta === decoded.width - 1) && px === 0) continue;
          if((delta === 1 || delta === -decoded.width + 1 || delta === decoded.width + 1) && px === decoded.width - 1) continue;
          mask[n] = 2;
          stack.push(n);
        }
      }
      if(pixels.length < 8 || pixels.length > 5200) continue;
      const component = componentForPixels(pixels, decoded, roi, offset);
      if(component.box.w < .006 || component.box.h < .006) continue;
      if(component.box.w > .34 || component.box.h > .22) continue;
      if(component.density < .05) continue;
      const scoreboardLike = component.y < .15 && component.box.w > .08 && component.box.h < .04;
      const shipLike = component.y > .75 && Math.abs(component.x - .5) < .18 && component.meanColor.r > 160 && component.meanColor.g > 150 && component.meanColor.b > 150;
      const lifeIconLike = component.y > .82 && (component.x < .16 || component.x > .84);
      if(scoreboardLike || shipLike || lifeIconLike) continue;
      components.push(component);
    }
  }
  return components.sort((a, b) => b.area - a.area);
}

function distance(a, b){
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function buildTracklets(frames){
  let nextId = 1;
  const open = [];
  const closed = [];
  for(const frame of frames){
    const candidates = frame.components
      .filter(component => component.y >= .13 && component.y <= .86)
      .sort((a, b) => b.area - a.area);
    const used = new Set();
    for(const track of open){
      let best = null;
      let bestIndex = -1;
      for(let i = 0; i < candidates.length; i += 1){
        if(used.has(i)) continue;
        const candidate = candidates[i];
        const maxDistance = track.missed ? .105 : .075;
        const d = distance(track.last, candidate);
        if(d < maxDistance && (!best || d < best.distance)){
          best = { component: candidate, distance: d };
          bestIndex = i;
        }
      }
      if(best){
        used.add(bestIndex);
        track.points.push({
          frame: frame.index,
          t: frame.t,
          x: best.component.x,
          y: best.component.y,
          area: best.component.area,
          box: best.component.box
        });
        track.last = best.component;
        track.missed = 0;
      } else {
        track.missed += 1;
      }
    }
    for(let i = 0; i < candidates.length; i += 1){
      if(used.has(i)) continue;
      const component = candidates[i];
      open.push({
        id: `target-track-${nextId++}`,
        last: component,
        missed: 0,
        points: [{
          frame: frame.index,
          t: frame.t,
          x: component.x,
          y: component.y,
          area: component.area,
          box: component.box
        }]
      });
    }
    for(let i = open.length - 1; i >= 0; i -= 1){
      if(open[i].missed > 3) closed.push(open.splice(i, 1)[0]);
    }
  }
  closed.push(...open);
  return closed
    .filter(track => track.points.length >= 3)
    .map(trackSummary)
    .filter(track => track.durationSeconds >= .18 || track.pathLength >= .04 || track.yRange >= .035)
    .sort((a, b) => (b.pathLength + b.yRange + b.xRange + b.durationSeconds * .04) - (a.pathLength + a.yRange + a.xRange + a.durationSeconds * .04));
}

function sideForX(x){
  if(x < .34) return 'left';
  if(x > .66) return 'right';
  return 'center';
}

function trackSummary(track){
  const points = track.points;
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const areas = points.map(point => point.area);
  let pathLength = 0;
  let turnCount = 0;
  let reversalCount = 0;
  let previousHeading = null;
  let previousDxSign = 0;
  for(let i = 1; i < points.length; i += 1){
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    pathLength += Math.hypot(dx, dy);
    const heading = Math.atan2(dy, dx);
    if(previousHeading !== null){
      const delta = Math.abs(Math.atan2(Math.sin(heading - previousHeading), Math.cos(heading - previousHeading)));
      if(delta > .65) turnCount += 1;
    }
    const dxSign = Math.sign(dx);
    if(dxSign && previousDxSign && dxSign !== previousDxSign) reversalCount += 1;
    if(dxSign) previousDxSign = dxSign;
    previousHeading = heading;
  }
  const first = points[0];
  const last = points[points.length - 1];
  return {
    id: track.id,
    sampleCount: points.length,
    visibleStartS: round(first.t, 2),
    visibleEndS: round(last.t, 2),
    durationSeconds: round(last.t - first.t, 2),
    entrySide: sideForX(first.x),
    exitSide: sideForX(last.x),
    xRange: round(Math.max(...xs) - Math.min(...xs), 4),
    yRange: round(Math.max(...ys) - Math.min(...ys), 4),
    pathLength: round(pathLength, 4),
    turnCount,
    reversalCount,
    lowerFieldShare: round(ys.filter(y => y > .52).length / Math.max(1, ys.length), 4),
    meanArea: round(average(areas), 1),
    areaStability: round(1 - (percentile(areas, .9) - percentile(areas, .1)) / Math.max(1, median(areas) * 3), 3),
    first: { x: round(first.x, 4), y: round(first.y, 4) },
    last: { x: round(last.x, 4), y: round(last.y, 4) },
    sampledPoints: samplePoints(points, 10)
  };
}

function samplePoints(points, count){
  if(points.length <= count){
    return points.map(point => ({ t: round(point.t, 2), x: round(point.x, 4), y: round(point.y, 4) }));
  }
  const sampled = [];
  for(let i = 0; i < count; i += 1){
    const index = Math.round(i * (points.length - 1) / Math.max(1, count - 1));
    const point = points[index];
    sampled.push({ t: round(point.t, 2), x: round(point.x, 4), y: round(point.y, 4) });
  }
  return sampled;
}

function clusterByStart(tracks, expectedGroups = 5){
  const eligible = tracks.filter(track => track.pathLength >= .035 || track.yRange >= .03 || track.durationSeconds >= .2);
  if(!eligible.length) return [];
  const k = Math.max(1, Math.min(expectedGroups, eligible.length));
  const starts = eligible.map(track => track.visibleStartS).sort((a, b) => a - b);
  let centers = Array.from({ length: k }, (_, index) => starts[Math.round(index * (starts.length - 1) / Math.max(1, k - 1))]);
  for(let pass = 0; pass < 12; pass += 1){
    const groups = Array.from({ length: k }, () => []);
    for(const track of eligible){
      let best = 0;
      let bestDistance = Infinity;
      centers.forEach((center, index) => {
        const d = Math.abs(track.visibleStartS - center);
        if(d < bestDistance){
          best = index;
          bestDistance = d;
        }
      });
      groups[best].push(track);
    }
    centers = groups.map((group, index) => group.length ? average(group.map(track => track.visibleStartS)) : centers[index]);
  }
  const rawGroups = Array.from({ length: k }, () => []);
  for(const track of eligible){
    let best = 0;
    let bestDistance = Infinity;
    centers.forEach((center, index) => {
      const d = Math.abs(track.visibleStartS - center);
      if(d < bestDistance){
        best = index;
        bestDistance = d;
      }
    });
    rawGroups[best].push(track);
  }
  return rawGroups
    .filter(group => group.length)
    .sort((a, b) => average(a.map(track => track.visibleStartS)) - average(b.map(track => track.visibleStartS)))
    .map((group, index) => groupVector(group, index + 1));
}

function groupVector(tracks, groupIndex){
  const points = tracks.flatMap(track => track.sampledPoints.map(point => ({
    trackId: track.id,
    t: point.t,
    x: point.x,
    y: point.y
  }))).sort((a, b) => a.t - b.t);
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const first = points[0] || {};
  const last = points[points.length - 1] || {};
  return {
    groupIndex,
    trackCount: tracks.length,
    sampleCount: points.length,
    objectTrackTarget: {
      visibleStartS: round(Math.min(...tracks.map(track => track.visibleStartS)), 2),
      visibleEndS: round(Math.max(...tracks.map(track => track.visibleEndS)), 2),
      entrySide: sideForX(first.x),
      exitSide: sideForX(last.x),
      xRange: round(Math.max(...xs) - Math.min(...xs), 4),
      yRange: round(Math.max(...ys) - Math.min(...ys), 4),
      pathLength: round(average(tracks.map(track => track.pathLength)), 4),
      turnCount: round(average(tracks.map(track => track.turnCount)), 2),
      reversalCount: round(average(tracks.map(track => track.reversalCount)), 2),
      lowerFieldShare: round(average(tracks.map(track => track.lowerFieldShare)), 4)
    },
    confidence: round(clamp(.34 + Math.min(.34, tracks.length * .035) + Math.min(.18, average(tracks.map(track => track.durationSeconds)) * .04) + Math.min(.14, average(tracks.map(track => track.pathLength)) * .08)), 3),
    trackIds: tracks.slice(0, 16).map(track => track.id),
    read: `Target group ${groupIndex} tracks ${tracks.length} object trace(s), visible ${round(Math.min(...tracks.map(track => track.visibleStartS)), 2)}-${round(Math.max(...tracks.map(track => track.visibleEndS)), 2)}s, path ${round(average(tracks.map(track => track.pathLength)), 2)}, x/y range ${round(Math.max(...xs) - Math.min(...xs), 2)}/${round(Math.max(...ys) - Math.min(...ys), 2)}.`
  };
}

function safeSourceLabel(file){
  const resolved = path.resolve(file);
  return resolved.startsWith(ROOT) ? rel(resolved) : path.basename(resolved);
}

function analyzeChallenge(input, outputDirs){
  const challengeNumber = input.challengeNumber;
  const file = input.file;
  const decoded = decodeVideoFrames(file, SAMPLE_FPS, {
    startSeconds: input.startSeconds || 0,
    durationSeconds: input.durationSeconds || ACTIVE_WINDOW_SECONDS
  });
  const roi = detectPlayfield(decoded);
  const frames = [];
  for(let frame = 0; frame < decoded.frameCount; frame += 1){
    const components = connectedComponentsForFrame(decoded, frame, roi);
    frames.push({
      index: frame,
      t: round(frame / decoded.sampleFps, 2),
      componentCount: components.length,
      largestComponents: components.slice(0, 12),
      components
    });
  }
  const tracks = buildTracklets(frames);
  const groups = clusterByStart(tracks, 5);
  const overlayFile = path.join(outputDirs.overlays, `challenge-${String(challengeNumber).padStart(2, '0')}-target-tracks.svg`);
  const contactSheetFile = path.join(outputDirs.contactSheets, `challenge-${String(challengeNumber).padStart(2, '0')}-target-samples.svg`);
  const challengeJsonFile = path.join(outputDirs.tracks, `challenge-${String(challengeNumber).padStart(2, '0')}.json`);
  const result = {
    challengeNumber,
    sourceVideo: safeSourceLabel(file),
    sourceWindow: input.sourceWindow || null,
    sourceStartSeconds: input.startSeconds || 0,
    frameSize: { width: decoded.width, height: decoded.height },
    sampleFps: decoded.sampleFps,
    sampledFrameCount: decoded.frameCount,
    durationSeconds: round(decoded.durationSeconds, 2),
    playfieldRoi: {
      x: roi.x,
      y: roi.y,
      w: roi.w,
      h: roi.h,
      normalized: {
        x: round(roi.x / decoded.width, 4),
        y: round(roi.y / decoded.height, 4),
        w: round(roi.w / decoded.width, 4),
        h: round(roi.h / decoded.height, 4)
      }
    },
    componentRead: {
      medianComponentCount: round(median(frames.map(frame => frame.componentCount)), 1),
      p90ComponentCount: round(percentile(frames.map(frame => frame.componentCount), .9), 1),
      activeFrameShare: round(frames.filter(frame => frame.componentCount > 0).length / Math.max(1, frames.length), 3)
    },
    trackRead: {
      trackCount: tracks.length,
      groupCount: groups.length,
      medianTrackDurationSeconds: round(median(tracks.map(track => track.durationSeconds)), 2),
      medianPathLength: round(median(tracks.map(track => track.pathLength)), 4),
      medianYRange: round(median(tracks.map(track => track.yRange)), 4),
      medianXRange: round(median(tracks.map(track => track.xRange)), 4),
      lowerFieldShare: round(average(tracks.map(track => track.lowerFieldShare)), 4)
    },
    targetGroups: groups,
    candidateTracks: tracks.slice(0, 32),
    sampledFrames: frames
      .filter((_, index) => index % Math.max(1, Math.floor(frames.length / 12)) === 0)
      .slice(0, 12)
      .map(frame => ({
        index: frame.index,
        t: frame.t,
        componentCount: frame.componentCount,
        largestComponents: frame.largestComponents
      })),
    evidence: {
      overlaySvg: rel(overlayFile),
      contactSheetSvg: rel(contactSheetFile),
      perChallengeJson: rel(challengeJsonFile)
    },
    measurementLimits: [
      'CPU connected-component target tracking is not final sprite identity recognition.',
      'The tracker intentionally ignores score text, player ship, lives, and most stars so it can focus on challenge-stage alien/object movement.',
      'Groups are clustered from object-track start times; they are useful target vectors for movement comparison but still need human-readable review for exact wave identity.'
    ]
  };
  writeText(overlayFile, renderTrackOverlay(result));
  writeText(contactSheetFile, renderContactSheet(result));
  writeJson(challengeJsonFile, result);
  return result;
}

function colorForIndex(index){
  const colors = ['#74f7ff', '#ff5cf3', '#ffe76a', '#65ff9a', '#ff766a', '#a98bff', '#ffffff'];
  return colors[index % colors.length];
}

function renderTrackOverlay(result){
  const width = 560;
  const height = 720;
  const groupsByTrack = new Map();
  result.targetGroups.forEach((group, index) => {
    for(const id of group.trackIds || []) groupsByTrack.set(id, index);
  });
  const tracks = result.candidateTracks || [];
  const lines = tracks.map((track, index) => {
    const groupIndex = groupsByTrack.has(track.id) ? groupsByTrack.get(track.id) : index;
    const color = colorForIndex(groupIndex);
    const points = (track.sampledPoints || []).map(point => `${round(point.x * width, 1)},${round(point.y * height, 1)}`).join(' ');
    if(!points) return '';
    const first = track.sampledPoints?.[0];
    const labelX = first ? round(first.x * width, 1) : 12;
    const labelY = first ? round(first.y * height, 1) : 20;
    return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.74"/><circle cx="${labelX}" cy="${labelY}" r="4" fill="${color}"/><text x="${labelX + 6}" y="${labelY + 4}" fill="${color}" font-size="14">${track.id.replace('target-track-', '')}</text>`;
  }).join('\n');
  const groupLegend = result.targetGroups.map((group, index) => {
    const y = 28 + index * 24;
    const color = colorForIndex(index);
    return `<rect x="18" y="${y - 14}" width="16" height="16" fill="${color}" opacity="0.8"/><text x="42" y="${y}" fill="#dff7ff" font-size="15">Group ${group.groupIndex}: ${group.trackCount} tracks, ${group.objectTrackTarget.visibleStartS}-${group.objectTrackTarget.visibleEndS}s</text>`;
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#03070b"/>
  <g opacity="0.28">
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${i * width / 10}" y1="0" x2="${i * width / 10}" y2="${height}" stroke="#214a5a" stroke-width="1"/>`).join('\n')}
    ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * height / 12}" x2="${width}" y2="${i * height / 12}" stroke="#214a5a" stroke-width="1"/>`).join('\n')}
  </g>
  <text x="18" y="22" fill="#ffffff" font-size="18" font-weight="700">Galaga Challenge ${result.challengeNumber} Target Object Tracks</text>
  <g>${groupLegend}</g>
  <g transform="translate(0,0)">${lines}</g>
  <text x="18" y="${height - 22}" fill="#9fc5d6" font-size="15">CPU object-track proxy: ${result.trackRead.trackCount} tracks, ${result.trackRead.groupCount} grouped target waves. Not sprite identity recognition.</text>
</svg>`;
}

function renderContactSheet(result){
  const cellW = 210;
  const cellH = 150;
  const cols = 3;
  const rows = Math.ceil(result.sampledFrames.length / cols);
  const width = cols * cellW;
  const height = rows * cellH + 48;
  const cells = result.sampledFrames.map((frame, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x0 = col * cellW;
    const y0 = 40 + row * cellH;
    const dots = (frame.largestComponents || []).slice(0, 20).map((component, dotIndex) => {
      const color = colorForIndex(dotIndex);
      const cx = x0 + round(component.x * (cellW - 20) + 10, 1);
      const cy = y0 + round(component.y * (cellH - 34) + 18, 1);
      const r = Math.max(2, Math.min(7, Math.sqrt(component.area) / 5));
      return `<circle cx="${cx}" cy="${cy}" r="${round(r, 1)}" fill="${color}" opacity="0.78"/>`;
    }).join('\n');
    return `<g>
      <rect x="${x0 + 6}" y="${y0 + 6}" width="${cellW - 12}" height="${cellH - 12}" fill="#050a0f" stroke="#23495b"/>
      <text x="${x0 + 12}" y="${y0 + 24}" fill="#dff7ff" font-size="13">t=${frame.t}s components=${frame.componentCount}</text>
      ${dots}
    </g>`;
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#08111a"/>
  <text x="14" y="26" fill="#ffffff" font-size="18" font-weight="700">Challenge ${result.challengeNumber} Target Component Contact Sheet</text>
  ${cells}
</svg>`;
}

function scoreReadiness(challenges){
  const challengeCountFit = clamp(challenges.length / CHALLENGE_COUNT);
  const groupFit = clamp(average(challenges.map(item => Math.min(1, item.trackRead.groupCount / 5))));
  const trackFit = clamp(average(challenges.map(item => Math.min(1, item.trackRead.trackCount / 24))));
  const confidenceFit = clamp(average(challenges.flatMap(item => item.targetGroups.map(group => group.confidence))));
  const activeFit = clamp(average(challenges.map(item => item.componentRead.activeFrameShare)));
  return round(1 + ((.22 * challengeCountFit) + (.24 * groupFit) + (.24 * trackFit) + (.18 * confidenceFit) + (.12 * activeFit)) * 8.2, 1);
}

function challengeInputs(){
  const reference = readJson(CHALLENGE_VIDEO_REFERENCE, {});
  const sources = Array.isArray(reference.sources) ? reference.sources : [];
  const windows = Array.isArray(reference.primaryWindows) ? reference.primaryWindows : [];
  const sourceById = new Map(sources.map(source => [source.id, source]));
  const fromReference = windows
    .filter(window => Number.isFinite(+window.challengeNumber))
    .map(window => {
      const source = sourceById.get(window.sourceId) || sources[0] || {};
      const localPath = source.localPath || '';
      const exists = localPath && fs.existsSync(localPath);
      return exists ? {
        sourceMode: 'galaga-challenge-reference-source-window',
        challengeNumber: +window.challengeNumber,
        file: localPath,
        startSeconds: +window.start || +window.startSeconds || 0,
        durationSeconds: Math.min(ACTIVE_WINDOW_SECONDS, +window.duration || +window.durationSeconds || ACTIVE_WINDOW_SECONDS),
        sourceWindow: {
          id: window.id,
          sourceId: window.sourceId,
          stageMarker: window.stageMarker,
          family: window.family,
          motionRead: window.motionRead,
          contactSheet: window.contactSheet,
          denseContactSheet: window.denseContactSheet,
          focusedSheet: window.focusedSheet,
          frameIndex: window.frameIndex
        }
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.challengeNumber - b.challengeNumber);
  if(fromReference.length >= CHALLENGE_COUNT) return fromReference.slice(0, CHALLENGE_COUNT);
  if(!fs.existsSync(SOURCE_DIR)) return [];
  const fallback = [];
  for(let challenge = 1; challenge <= CHALLENGE_COUNT; challenge += 1){
    const file = path.join(SOURCE_DIR, `challenge-${String(challenge).padStart(2, '0')}.webm`);
    if(fs.existsSync(file)){
      fallback.push({
        sourceMode: 'level-visual-index-target-video-fallback',
        challengeNumber: challenge,
        file,
        startSeconds: 0,
        durationSeconds: ACTIVE_WINDOW_SECONDS,
        sourceWindow: null
      });
    }
  }
  return fallback;
}

function main(){
  const inputs = challengeInputs();
  if(!inputs.length) fail('Missing challenge target video inputs.', {
    sourceDir: rel(SOURCE_DIR),
    challengeVideoReference: rel(CHALLENGE_VIDEO_REFERENCE)
  });
  const stamp = `${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)}-${gitShortCommit()}`;
  const runDir = path.join(OUT_ROOT, stamp);
  const outputDirs = {
    tracks: path.join(runDir, 'tracks'),
    overlays: path.join(runDir, 'overlays'),
    contactSheets: path.join(runDir, 'contact-sheets')
  };
  Object.values(outputDirs).forEach(ensureDir);
  const latestDirs = {
    tracks: path.join(OUT_ROOT, 'latest-tracks'),
    overlays: path.join(OUT_ROOT, 'latest-overlays'),
    contactSheets: path.join(OUT_ROOT, 'latest-contact-sheets')
  };
  Object.values(latestDirs).forEach(ensureDir);
  const challenges = [];
  for(const input of inputs){
    const result = analyzeChallenge(input, outputDirs);
    challenges.push(result);
    writeJson(path.join(latestDirs.tracks, `challenge-${String(input.challengeNumber).padStart(2, '0')}.json`), result);
    writeText(path.join(latestDirs.overlays, `challenge-${String(input.challengeNumber).padStart(2, '0')}-target-tracks.svg`), renderTrackOverlay(result));
    writeText(path.join(latestDirs.contactSheets, `challenge-${String(input.challengeNumber).padStart(2, '0')}-target-samples.svg`), renderContactSheet(result));
  }
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-challenge-object-tracks',
    gameKey: 'aurora-galactica',
    targetGame: 'galaga',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-galaga-challenge-object-tracks.js',
    branch: gitBranch(),
    commit: gitShortCommit(),
    sourceEvidence: {
      targetVideoDirectory: fs.existsSync(SOURCE_DIR) ? rel(SOURCE_DIR) : null,
      challengeVideoReference: fs.existsSync(CHALLENGE_VIDEO_REFERENCE) ? rel(CHALLENGE_VIDEO_REFERENCE) : null,
      sourceMode: inputs[0]?.sourceMode || 'unknown',
      challengeCount: challenges.length,
      sampleFps: SAMPLE_FPS,
      activeWindowSeconds: ACTIVE_WINDOW_SECONDS
    },
    summary: {
      challengeCount: challenges.length,
      trackedChallengeCount: challenges.filter(item => item.trackRead.trackCount > 0).length,
      averageTrackCount: round(average(challenges.map(item => item.trackRead.trackCount)), 1),
      averageGroupCount: round(average(challenges.map(item => item.trackRead.groupCount)), 1),
      averageGroupConfidence: round(average(challenges.flatMap(item => item.targetGroups.map(group => group.confidence))), 3),
      targetTrackReadinessScore10: scoreReadiness(challenges),
      weakestChallengeNumber: challenges.slice().sort((a, b) => a.targetGroups.length - b.targetGroups.length || a.trackRead.trackCount - b.trackRead.trackCount)[0]?.challengeNumber || null,
      read: 'CPU object tracking now converts ingested Galaga challenge reference clips into per-challenge group target vectors. This makes challenge movement conformance comparable against source video instead of relying only on first-pass descriptive contracts.'
    },
    measurementLimits: [
      'This is connected-component object tracking, not perfect sprite identity segmentation.',
      'The output is strongest for movement envelope, timing, lower-field share, and group count; it is weaker for exact alien type identity.',
      'Use these vectors to guide challenge-stage authoring and scoring, then review generated overlays/contact sheets for human-facing documentation.'
    ],
    challenges
  };
  writeJson(path.join(runDir, 'report.json'), artifact);
  writeJson(LATEST, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(LATEST),
    runArtifact: rel(path.join(runDir, 'report.json')),
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

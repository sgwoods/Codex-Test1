#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function usage(){
  console.error([
    'Usage:',
    '  node tools/harness/trace-classic-arcade-video.js --source <video> --out <dir> --window-id <id> --start <seconds> --duration <seconds> [--fps 5] [--width 270] [--height 480] [--profile default|galaxian-portrait]',
    '',
    'Outputs:',
    '  trace.json',
    '  trace.csv',
    '  player-x.svg'
  ].join('\n'));
}

function parseArgs(argv){
  const args = {};
  for(let i = 2; i < argv.length; i += 1){
    const token = argv[i];
    if(!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[i + 1];
    if(value == null || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    i += 1;
  }
  return args;
}

function numberArg(args, key, fallback = null){
  if(args[key] == null){
    if(fallback == null) throw new Error(`Missing --${key}`);
    return fallback;
  }
  const value = Number(args[key]);
  if(!Number.isFinite(value)) throw new Error(`--${key} must be numeric`);
  return value;
}

function requireArg(args, key){
  if(!args[key]) throw new Error(`Missing --${key}`);
  return args[key];
}

function optionalNumberArg(args, key, fallback){
  if(args[key] == null) return fallback;
  const value = Number(args[key]);
  if(!Number.isFinite(value)) throw new Error(`--${key} must be numeric`);
  return value;
}

function profileConfig(args){
  const profile = args.profile || 'default';
  const base = {
    profile,
    playerColorMode: 'cyan',
    playerTop: 0.68,
    playerBottom: 0.86,
    playerLeft: 0.22,
    playerRight: 0.78,
    playerTargetY: 0.79,
    playerTargetX: 0.5,
    objectTop: 0.05,
    objectBottom: 0.86,
    minPlayerPixels: 4,
    maxPlayerPixels: 180,
    maxPlayerWidth: 28,
    maxPlayerHeight: 24
  };
  if(profile === 'galaxian-portrait'){
    Object.assign(base, {
      playerColorMode: 'galaxian',
      playerTop: 0.58,
      playerBottom: 0.9,
      playerLeft: 0.08,
      playerRight: 0.92,
      playerTargetY: 0.75,
      objectTop: 0.04,
      objectBottom: 0.9,
      minPlayerPixels: 3,
      maxPlayerPixels: 240,
      maxPlayerWidth: 36,
      maxPlayerHeight: 30
    });
  }else if(profile !== 'default'){
    throw new Error(`Unsupported --profile ${profile}`);
  }
  return {
    ...base,
    playerColorMode: args['player-color-mode'] || base.playerColorMode,
    playerTop: optionalNumberArg(args, 'player-top', base.playerTop),
    playerBottom: optionalNumberArg(args, 'player-bottom', base.playerBottom),
    playerLeft: optionalNumberArg(args, 'player-left', base.playerLeft),
    playerRight: optionalNumberArg(args, 'player-right', base.playerRight),
    playerTargetY: optionalNumberArg(args, 'player-target-y', base.playerTargetY),
    playerTargetX: optionalNumberArg(args, 'player-target-x', base.playerTargetX),
    objectTop: optionalNumberArg(args, 'object-top', base.objectTop),
    objectBottom: optionalNumberArg(args, 'object-bottom', base.objectBottom),
    minPlayerPixels: optionalNumberArg(args, 'min-player-pixels', base.minPlayerPixels),
    maxPlayerPixels: optionalNumberArg(args, 'max-player-pixels', base.maxPlayerPixels),
    maxPlayerWidth: optionalNumberArg(args, 'max-player-width', base.maxPlayerWidth),
    maxPlayerHeight: optionalNumberArg(args, 'max-player-height', base.maxPlayerHeight)
  };
}

function pixelOffset(width, x, y){
  return (y * width + x) * 3;
}

function isBrightColored(r, g, b){
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max >= 80 && (max - min) >= 35;
}

function isPlayerCyan(r, g, b){
  return b >= 105 && g >= 80 && r <= 95 && (b - r) >= 40;
}

function isPlayerRedOrOrange(r, g, b){
  return r >= 120 && g <= 120 && b <= 110 && (r - b) >= 40;
}

function isPlayerWhite(r, g, b){
  return r >= 140 && g >= 140 && b >= 140 && Math.max(r, g, b) - Math.min(r, g, b) <= 55;
}

function isPlayerPixel(r, g, b, mode){
  if(mode === 'cyan') return isPlayerCyan(r, g, b);
  if(mode === 'bright-lower') return isBrightColored(r, g, b);
  if(mode === 'galaxian'){
    return isPlayerCyan(r, g, b) || isPlayerRedOrOrange(r, g, b) || isPlayerWhite(r, g, b);
  }
  throw new Error(`Unsupported player color mode ${mode}`);
}

function classifyColor(sumR, sumG, sumB, count){
  const r = sumR / count;
  const g = sumG / count;
  const b = sumB / count;
  if(r > 150 && g > 100 && b < 120) return 'yellow-orange';
  if(r > 130 && g < 100 && b < 120) return 'red';
  if(r > 120 && b > 120 && g < 110) return 'magenta';
  if(b > 120 && g > 90 && r < 110) return 'cyan-blue';
  if(b > 120 && r > 90) return 'purple';
  return 'colored';
}

function connectedComponents(mask, width, height){
  const seen = new Uint8Array(width * height);
  const components = [];
  const queue = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for(let index = 0; index < mask.length; index += 1){
    if(!mask[index] || seen[index]) continue;
    seen[index] = 1;
    queue.length = 0;
    queue.push(index);
    let head = 0;
    let count = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let sumX = 0;
    let sumY = 0;

    while(head < queue.length){
      const next = queue[head];
      head += 1;
      const x = next % width;
      const y = Math.floor(next / width);
      count += 1;
      sumX += x;
      sumY += y;
      if(x < minX) minX = x;
      if(y < minY) minY = y;
      if(x > maxX) maxX = x;
      if(y > maxY) maxY = y;

      for(const [dx, dy] of dirs){
        const nx = x + dx;
        const ny = y + dy;
        if(nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = ny * width + nx;
        if(mask[ni] && !seen[ni]){
          seen[ni] = 1;
          queue.push(ni);
        }
      }
    }

    components.push({
      count,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      cx: sumX / count,
      cy: sumY / count
    });
  }

  return components;
}

function analyzeFrame(frame, width, height, frameIndex, start, fps, config){
  const playerMask = new Uint8Array(width * height);
  const coloredMask = new Uint8Array(width * height);
  const playerTop = Math.floor(height * config.playerTop);
  const playerBottom = Math.floor(height * config.playerBottom);
  const playerLeft = Math.floor(width * config.playerLeft);
  const playerRight = Math.floor(width * config.playerRight);
  const objectTop = Math.floor(height * config.objectTop);
  const objectBottom = Math.floor(height * config.objectBottom);

  for(let y = 0; y < height; y += 1){
    for(let x = 0; x < width; x += 1){
      const offset = pixelOffset(width, x, y);
      const r = frame[offset];
      const g = frame[offset + 1];
      const b = frame[offset + 2];
      const index = y * width + x;
      if(
        x >= playerLeft &&
        x <= playerRight &&
        y >= playerTop &&
        y <= playerBottom &&
        isPlayerPixel(r, g, b, config.playerColorMode)
      ){
        playerMask[index] = 1;
      }
      if(y >= objectTop && y <= objectBottom && isBrightColored(r, g, b)){
        coloredMask[index] = 1;
      }
    }
  }

  const playerComponents = connectedComponents(playerMask, width, height)
    .filter(component => (
      component.count >= config.minPlayerPixels &&
      component.count <= config.maxPlayerPixels &&
      component.width <= config.maxPlayerWidth &&
      component.height <= config.maxPlayerHeight
    ))
    .sort((a, b) => {
      const targetY = height * config.playerTargetY;
      const targetX = width * config.playerTargetX;
      const scoreA = a.count * 2 - Math.abs(a.cy - targetY) * 0.35 - Math.abs(a.cx - targetX) * 0.04;
      const scoreB = b.count * 2 - Math.abs(b.cy - targetY) * 0.35 - Math.abs(b.cx - targetX) * 0.04;
      return scoreB - scoreA;
    });
  const player = playerComponents[0] || null;

  const coloredComponents = connectedComponents(coloredMask, width, height)
    .filter(component => component.count >= 3 && component.width <= 55 && component.height <= 45);

  let projectileLikeCount = 0;
  let attackerLikeCount = 0;
  let lowerPressureCount = 0;
  let rackRegionCount = 0;
  let activePressureCount = 0;
  const colorFamilies = {};

  for(const component of coloredComponents){
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    for(let y = component.minY; y <= component.maxY; y += 1){
      for(let x = component.minX; x <= component.maxX; x += 1){
        const index = y * width + x;
        if(!coloredMask[index]) continue;
        const offset = pixelOffset(width, x, y);
        sumR += frame[offset];
        sumG += frame[offset + 1];
        sumB += frame[offset + 2];
      }
    }
    const family = classifyColor(sumR, sumG, sumB, component.count);
    colorFamilies[family] = (colorFamilies[family] || 0) + 1;
    const small = component.count <= 18 && component.width <= 8 && component.height <= 18;
    if(small) projectileLikeCount += 1;
    else attackerLikeCount += 1;
    if(component.cy < height * 0.42) rackRegionCount += 1;
    if(component.cy >= height * 0.45) lowerPressureCount += 1;
    if(component.cy >= height * 0.45 && component.cy <= height * 0.9 && component.width <= 24 && component.height <= 32){
      activePressureCount += 1;
    }
  }

  return {
    frame_index: frameIndex,
    time_s: Number((start + frameIndex / fps).toFixed(3)),
    player: player ? {
      x_px: Number(player.cx.toFixed(2)),
      y_px: Number(player.cy.toFixed(2)),
      x_norm: Number((player.cx / width).toFixed(4)),
      y_norm: Number((player.cy / height).toFixed(4)),
      pixel_count: player.count,
      bbox: [player.minX, player.minY, player.maxX, player.maxY]
    } : null,
    colored_component_count: coloredComponents.length,
    lower_pressure_component_count: lowerPressureCount,
    rack_region_component_count: rackRegionCount,
    active_pressure_component_count: activePressureCount,
    projectile_like_count: projectileLikeCount,
    attacker_like_count: attackerLikeCount,
    color_families: colorFamilies
  };
}

function summarize(samples){
  const playerSamples = samples.filter(sample => sample.player);
  const xs = playerSamples.map(sample => sample.player.x_norm);
  const dxs = [];
  for(let i = 1; i < playerSamples.length; i += 1){
    dxs.push(Math.abs(playerSamples[i].player.x_norm - playerSamples[i - 1].player.x_norm));
  }
  return {
    sample_count: samples.length,
    player_sample_count: playerSamples.length,
    player_detection_rate: Number((playerSamples.length / Math.max(1, samples.length)).toFixed(3)),
    player_x_norm_min: xs.length ? Number(Math.min(...xs).toFixed(4)) : null,
    player_x_norm_max: xs.length ? Number(Math.max(...xs).toFixed(4)) : null,
    player_x_norm_range: xs.length ? Number((Math.max(...xs) - Math.min(...xs)).toFixed(4)) : null,
    mean_abs_player_delta_per_sample: dxs.length ? Number((dxs.reduce((a, b) => a + b, 0) / dxs.length).toFixed(4)) : null,
    max_colored_component_count: Math.max(...samples.map(sample => sample.colored_component_count)),
    max_lower_pressure_component_count: Math.max(...samples.map(sample => sample.lower_pressure_component_count)),
    max_projectile_like_count: Math.max(...samples.map(sample => sample.projectile_like_count)),
    max_attacker_like_count: Math.max(...samples.map(sample => sample.attacker_like_count)),
    max_rack_region_component_count: Math.max(...samples.map(sample => sample.rack_region_component_count || 0)),
    max_active_pressure_component_count: Math.max(...samples.map(sample => sample.active_pressure_component_count || 0))
  };
}

function toCsv(samples){
  const header = [
    'frame_index',
    'time_s',
    'player_x_norm',
    'player_y_norm',
    'player_x_px',
    'player_y_px',
    'colored_component_count',
    'lower_pressure_component_count',
    'rack_region_component_count',
    'active_pressure_component_count',
    'projectile_like_count',
    'attacker_like_count'
  ];
  const lines = [header.join(',')];
  for(const sample of samples){
    lines.push([
      sample.frame_index,
      sample.time_s,
      sample.player ? sample.player.x_norm : '',
      sample.player ? sample.player.y_norm : '',
      sample.player ? sample.player.x_px : '',
      sample.player ? sample.player.y_px : '',
      sample.colored_component_count,
      sample.lower_pressure_component_count,
      sample.rack_region_component_count,
      sample.active_pressure_component_count,
      sample.projectile_like_count,
      sample.attacker_like_count
    ].join(','));
  }
  return `${lines.join('\n')}\n`;
}

function svgChart(samples, summary, width = 900, height = 320){
  const margin = { left: 48, right: 24, top: 28, bottom: 42 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const playerSamples = samples.filter(sample => sample.player);
  const start = samples[0]?.time_s || 0;
  const end = samples[samples.length - 1]?.time_s || start + 1;
  const points = playerSamples.map(sample => {
    const x = margin.left + ((sample.time_s - start) / Math.max(0.001, end - start)) * chartW;
    const y = margin.top + (1 - sample.player.x_norm) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const pressureBars = samples.map(sample => {
    const x = margin.left + ((sample.time_s - start) / Math.max(0.001, end - start)) * chartW;
    const barH = Math.min(chartH, sample.lower_pressure_component_count * 4);
    const y = margin.top + chartH - barH;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5" height="${barH.toFixed(1)}" fill="#7c3aed" opacity="0.28" />`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#08090b" />
  <text x="${margin.left}" y="18" fill="#e6edf3" font-family="monospace" font-size="14">Galaxip x-position trace (${summary.player_sample_count}/${summary.sample_count} detections)</text>
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartH}" stroke="#6b7280" />
  <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${margin.left + chartW}" y2="${margin.top + chartH}" stroke="#6b7280" />
  ${pressureBars}
  <polyline points="${points}" fill="none" stroke="#7ef2ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
  <text x="${margin.left}" y="${height - 16}" fill="#9ca3af" font-family="monospace" font-size="12">time ${start.toFixed(1)}s to ${end.toFixed(1)}s; purple bars = lower pressure components</text>
  <text x="${width - 250}" y="${height - 16}" fill="#9ca3af" font-family="monospace" font-size="12">left/right is normalized playfield x</text>
</svg>
`;
}

function main(){
  const args = parseArgs(process.argv);
  const source = requireArg(args, 'source');
  const outDir = path.resolve(ROOT, requireArg(args, 'out'));
  const windowId = requireArg(args, 'window-id');
  const start = numberArg(args, 'start');
  const duration = numberArg(args, 'duration');
  const fps = numberArg(args, 'fps', 5);
  const width = numberArg(args, 'width', 270);
  const height = numberArg(args, 'height', 480);
  const config = profileConfig(args);
  const frameSize = width * height * 3;

  fs.mkdirSync(outDir, { recursive: true });
  const ffmpeg = spawnSync('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    '-ss', String(start),
    '-t', String(duration),
    '-i', source,
    '-vf', `fps=${fps},scale=${width}:${height}`,
    '-pix_fmt', 'rgb24',
    '-f', 'rawvideo',
    '-'
  ], {
    encoding: null,
    maxBuffer: 1024 * 1024 * 512
  });

  if(ffmpeg.status !== 0){
    throw new Error(`ffmpeg failed: ${ffmpeg.stderr ? ffmpeg.stderr.toString('utf8') : 'unknown error'}`);
  }

  const buffer = ffmpeg.stdout;
  const frameCount = Math.floor(buffer.length / frameSize);
  if(frameCount <= 0) throw new Error('No frames decoded');

  const samples = [];
  for(let index = 0; index < frameCount; index += 1){
    const frame = buffer.subarray(index * frameSize, (index + 1) * frameSize);
    samples.push(analyzeFrame(frame, width, height, index, start, fps, config));
  }

  const summary = summarize(samples);
  const output = {
    schema_version: 1,
    generated_by: 'tools/harness/trace-classic-arcade-video.js',
    source,
    window_id: windowId,
    start_time_s: start,
    duration_s: duration,
    sample_fps: fps,
    analysis_resolution: { width, height },
    analysis_profile: config,
    confidence_note: 'First-pass color/component heuristic. Use for review prioritization, not final implementation tuning until manually spot-checked.',
    summary,
    samples
  };

  fs.writeFileSync(path.join(outDir, 'trace.json'), `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(path.join(outDir, 'trace.csv'), toCsv(samples));
  fs.writeFileSync(path.join(outDir, 'player-x.svg'), svgChart(samples, summary));
  console.log(JSON.stringify({
    ok: true,
    outDir: path.relative(ROOT, outDir),
    window_id: windowId,
    summary
  }, null, 2));
}

try{
  main();
}catch(err){
  usage();
  console.error(err.message);
  process.exit(1);
}

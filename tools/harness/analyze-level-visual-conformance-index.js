#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'level-visual-conformance-index');
const CURRENT_DIR = path.join(OUT_ROOT, 'latest-current-screenshots');
const TARGET_DIR = path.join(OUT_ROOT, 'latest-target-screenshots');
const CURRENT_VIDEO_DIR = path.join(OUT_ROOT, 'latest-current-videos');
const TARGET_VIDEO_DIR = path.join(OUT_ROOT, 'latest-target-videos');
const TEMP_FRAME_DIR = path.join(OUT_ROOT, '.tmp-current-video-frames');
const LATEST_JSON = path.join(OUT_ROOT, 'latest.json');
const TOP_LEVEL_MD = path.join(ROOT, 'LEVEL_VISUAL_CONFORMANCE_INDEX.md');

const REGULAR_LEVEL_COUNT = 31;
const CHALLENGE_COUNT = 8;
const CHALLENGE_MARKERS = [3, 7, 11, 15, 19, 23, 27, 31];
const VIDEO_SECONDS = 10;
const CURRENT_VIDEO_FPS = 10;
const SNAKE_LATINO_SOURCE = '/Users/sgwoods/Downloads/🎮🕹️👉Galaga (1981) - Gameplay Arcade - Snake Latino (360p, h264).mp4';
const CHALLENGE_ALL_SOURCE = '/Users/sgwoods/Downloads/challenge-all2.mp4';

const REGULAR_TARGET_WINDOWS = [
  {
    stage: 1,
    id: 'stage-1-opening-entry',
    title: 'Stage 1 opening rack entry',
    source: SNAKE_LATINO_SOURCE,
    start: 8,
    duration: 20,
    frameSource: 'reference-artifacts/analyses/galaga-path-reference-media/stage-1-opening-entry/frame-index.json',
    contactSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-1-opening-entry/contact-sheet.jpg',
    motionSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-1-opening-entry/motion-difference-sheet.jpg'
  },
  {
    stage: 2,
    id: 'stage-2-early-entry',
    title: 'Stage 2 early formation entry',
    source: SNAKE_LATINO_SOURCE,
    start: 52,
    duration: 20,
    frameSource: 'reference-artifacts/analyses/galaga-path-reference-media/stage-2-early-entry/frame-index.json',
    contactSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-2-early-entry/contact-sheet.jpg',
    motionSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-2-early-entry/motion-difference-sheet.jpg'
  },
  {
    stage: 4,
    id: 'stage-4-post-challenge-entry',
    title: 'Stage 4 post-challenge rack entry',
    source: SNAKE_LATINO_SOURCE,
    start: 120,
    duration: 24,
    frameSource: 'reference-artifacts/analyses/galaga-path-reference-media/stage-4-post-challenge-entry/frame-index.json',
    contactSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-4-post-challenge-entry/contact-sheet.jpg',
    motionSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-4-post-challenge-entry/motion-difference-sheet.jpg'
  },
  {
    stage: 5,
    id: 'stage-5-opening-entry',
    title: 'Stage 5 opening rack entry',
    source: SNAKE_LATINO_SOURCE,
    start: 164,
    duration: 24,
    frameSource: 'reference-artifacts/analyses/galaga-path-reference-media/stage-5-opening-entry/frame-index.json',
    contactSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-5-opening-entry/contact-sheet.jpg',
    motionSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-5-opening-entry/motion-difference-sheet.jpg'
  },
  {
    stage: 6,
    id: 'stage-6-capture-pressure',
    title: 'Stage 6 capture and boss pressure',
    source: SNAKE_LATINO_SOURCE,
    start: 194,
    duration: 24,
    frameSource: 'reference-artifacts/analyses/galaga-path-reference-media/stage-6-capture-pressure/frame-index.json',
    contactSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-6-capture-pressure/contact-sheet.jpg',
    motionSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-6-capture-pressure/motion-difference-sheet.jpg'
  },
  {
    stage: 10,
    id: 'stage-10-opening-entry',
    title: 'Stage 10 opening rack entry',
    source: SNAKE_LATINO_SOURCE,
    start: 386,
    duration: 22,
    frameSource: 'reference-artifacts/analyses/galaga-path-reference-media/stage-10-opening-entry/frame-index.json',
    contactSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-10-opening-entry/contact-sheet.jpg',
    motionSheet: 'reference-artifacts/analyses/galaga-path-reference-media/stage-10-opening-entry/motion-difference-sheet.jpg'
  }
];

const ROLE_MEDIA = {
  player: {
    label: 'Player fighter',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-player-fighter-model.png'
  },
  dual: {
    label: 'Dual fighter',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/dual-fighter.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-dual-fighter.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-dual-fighter-model.png'
  },
  bee: {
    label: 'Bee / Zako',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-zako-dive-model.png'
  },
  but: {
    label: 'Butterfly / escort',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-butterfly-escort-model.png'
  },
  boss: {
    label: 'Boss Galaga',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-command-boss-model.png'
  },
  rogue: {
    label: 'Captured / rogue fighter',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-player-fighter-model.png'
  },
  dragonfly: {
    label: 'Challenge dragonfly family',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-specialty-dive-model.png'
  },
  mosquito: {
    label: 'Challenge mosquito family',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-mosquito.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-specialty-dive-model.png'
  },
  specialty: {
    label: 'Specialty challenge alien',
    current: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png',
    target: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png',
    targetModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1/galaga-specialty-dive-model.png'
  }
};

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file, fallback = null){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, String(value).replace(/\r\n/g, '\n').trimEnd() + '\n');
}

function safeRemove(dir){
  if(!dir || !dir.startsWith(OUT_ROOT)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function git(args, fallback = ''){
  try {
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
}

function slug(value){
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'row';
}

function round(value, digits = 1){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function existingRel(pathName){
  return pathName && fs.existsSync(path.join(ROOT, pathName)) ? pathName : null;
}

function challengeLabel(challengeNumber){
  const marker = CHALLENGE_MARKERS[challengeNumber - 1] || (3 + (challengeNumber - 1) * 4);
  return `Challenging Stage ${challengeNumber} (Levels ${marker}-${marker + 1})`;
}

function levelRows(){
  const rows = [];
  for(let level = 1; level <= REGULAR_LEVEL_COUNT; level += 1){
    rows.push({
      id: `level-${String(level).padStart(2, '0')}`,
      kind: 'regular',
      displayOrder: rows.length + 1,
      displayLevel: level,
      label: `Level ${level}`,
      sampleSeconds: level <= 2 ? 5.2 : level <= 6 ? 6.2 : 7.4
    });
    const challengeIndex = CHALLENGE_MARKERS.indexOf(level);
    if(challengeIndex >= 0){
      const challengeNumber = challengeIndex + 1;
      rows.push({
        id: `challenge-${String(challengeNumber).padStart(2, '0')}`,
        kind: 'challenge',
        displayOrder: rows.length + 1,
        displayLevel: level,
        challengeNumber,
        challengeMarker: level,
        label: challengeLabel(challengeNumber),
        sampleSeconds: challengeNumber <= 3 ? 8.2 : 9.4
      });
    }
  }
  return rows;
}

function nearestRegularTarget(level){
  const exact = REGULAR_TARGET_WINDOWS.find(item => item.stage === level);
  if(exact) return Object.assign({ exact: true }, exact);
  const nearest = REGULAR_TARGET_WINDOWS
    .slice()
    .sort((a, b) => Math.abs(a.stage - level) - Math.abs(b.stage - level) || b.stage - a.stage)[0];
  return Object.assign({ exact: false }, nearest);
}

function challengeTargetWindow(challengeNumber){
  const ref = readJson(path.join(ANALYSES, 'galaga-challenge-video-reference', 'latest.json'), {});
  const windows = Array.isArray(ref.primaryWindows) ? ref.primaryWindows : [];
  const found = windows.find(item => +item.challengeNumber === +challengeNumber);
  if(!found) return null;
  return Object.assign({
    source: CHALLENGE_ALL_SOURCE,
    exact: true
  }, found);
}

function targetWindowForRow(row){
  if(row.kind === 'challenge'){
    const target = challengeTargetWindow(row.challengeNumber);
    if(!target) return null;
    return {
      id: target.id,
      title: `Galaga ${challengeLabel(row.challengeNumber)}`,
      source: target.source,
      start: +target.start || 0,
      duration: +target.duration || 0,
      exact: true,
      contactSheet: target.contactSheet || null,
      denseContactSheet: target.denseContactSheet || null,
      motionSheet: target.focusedSheet || null,
      family: target.family || '',
      motionRead: target.motionRead || '',
      targetFamilies: target.targetFamilies || [],
      auroraContract: target.auroraContract || '',
      evidenceStatus: target.evidenceStatus || ''
    };
  }
  const target = nearestRegularTarget(row.displayLevel);
  return {
    id: target.id,
    title: target.exact ? `Galaga ${target.title}` : `Representative Galaga target: ${target.title}`,
    source: target.source,
    start: target.start,
    duration: target.duration,
    exact: target.exact,
    contactSheet: target.contactSheet,
    denseContactSheet: null,
    motionSheet: target.motionSheet,
    family: 'regular-stage-entry',
    motionRead: target.exact
      ? 'Exact ingested regular-stage reference window for this displayed level.'
      : `No exact ingested Galaga Level ${row.displayLevel} target window yet; this uses actual Galaga gameplay from the nearest available stage-${target.stage} reference window.`,
    targetFamilies: ['player fighter', 'bee/zako', 'butterfly', 'boss galaga'],
    auroraContract: 'Regular levels should form racks through visible arrival waves, then create readable boss/escort, capture, dive, and pressure opportunities.',
    evidenceStatus: target.exact ? 'exact-target-frame' : 'representative-target-frame'
  };
}

function targetFrameSeconds(target){
  return Math.max(0, (+target?.start || 0) + Math.max(1.0, (+target?.duration || 0) * 0.46));
}

function extractFrame(row, target){
  const source = target?.source || '';
  const output = path.join(TARGET_DIR, `${row.id}.jpg`);
  if(!source || !fs.existsSync(source)){
    return {
      ok: false,
      image: target?.contactSheet || null,
      status: 'source-missing',
      error: source ? `missing source ${source}` : 'target source missing'
    };
  }
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  const seconds = targetFrameSeconds(target);
  ensureDir(path.dirname(output));
  const result = spawnSync(ffmpeg, [
    '-hide_banner',
    '-loglevel', 'error',
    '-y',
    '-ss', String(round(seconds, 3)),
    '-i', source,
    '-frames:v', '1',
    '-vf', 'scale=560:-1',
    output
  ], { encoding: 'utf8' });
  if(result.status !== 0 || !fs.existsSync(output)){
    return {
      ok: false,
      image: target?.contactSheet || null,
      status: 'ffmpeg-extract-failed',
      error: `${result.stderr || result.stdout || 'ffmpeg failed'}`.trim()
    };
  }
  return {
    ok: true,
    image: rel(output),
    status: 'extracted-target-frame',
    tSourceSeconds: round(seconds, 3)
  };
}

function extractTargetClip(row, target, frameSeconds){
  const source = target?.source || '';
  const output = path.join(TARGET_VIDEO_DIR, `${row.id}.webm`);
  if(!source || !fs.existsSync(source)){
    return {
      ok: false,
      video: null,
      status: 'source-missing',
      error: source ? `missing source ${source}` : 'target source missing'
    };
  }
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  const seconds = Math.max(0, Number.isFinite(+frameSeconds) ? +frameSeconds : targetFrameSeconds(target));
  ensureDir(path.dirname(output));
  const result = spawnSync(ffmpeg, [
    '-hide_banner',
    '-loglevel', 'error',
    '-y',
    '-ss', String(round(seconds, 3)),
    '-i', source,
    '-t', String(VIDEO_SECONDS),
    '-an',
    '-vf', 'scale=720:-2,fps=24',
    '-c:v', 'libvpx-vp9',
    '-b:v', '0',
    '-crf', '38',
    '-row-mt', '1',
    output
  ], { encoding: 'utf8' });
  if(result.status !== 0 || !fs.existsSync(output)){
    return {
      ok: false,
      video: null,
      status: 'ffmpeg-target-clip-failed',
      error: `${result.stderr || result.stdout || 'ffmpeg failed'}`.trim()
    };
  }
  return {
    ok: true,
    video: rel(output),
    status: 'extracted-target-10s-video',
    tSourceSeconds: round(seconds, 3),
    durationSeconds: VIDEO_SECONDS
  };
}

function normalizeRoleKey(enemy){
  const t = String(enemy?.t || enemy?.type || '').toLowerCase();
  const family = String(enemy?.fam || enemy?.family || '').toLowerCase();
  if(t === 'boss') return 'boss';
  if(t === 'but') return 'but';
  if(t === 'rogue') return 'rogue';
  if(family === 'dragonfly') return 'dragonfly';
  if(family === 'mosquito') return 'mosquito';
  if(family && family !== 'classic') return 'specialty';
  if(t === 'bee') return 'bee';
  return null;
}

function roleMediaForKeys(keys){
  return Array.from(new Set(['player', ...keys].filter(Boolean)))
    .map(key => Object.assign({ key }, ROLE_MEDIA[key] || ROLE_MEDIA.specialty))
    .filter(item => item.label)
    .map(item => Object.assign({}, item, {
      currentExists: !!existingRel(item.current),
      targetExists: !!existingRel(item.target)
    }));
}

function targetRolesForRow(row, target){
  const text = [
    target?.family,
    target?.motionRead,
    target?.auroraContract,
    ...(target?.targetFamilies || [])
  ].join(' ').toLowerCase();
  const keys = [];
  if(/player|fighter/.test(text)) keys.push('player');
  if(/bee|zako|classic/.test(text)) keys.push('bee');
  if(/butterfly|escort/.test(text)) keys.push('but');
  if(/boss/.test(text)) keys.push('boss');
  if(/dragonfly|blue|green|yellow|pink|purple|specialty|serpentine|cascade|ladder|fan/.test(text)) keys.push('specialty');
  if(row.kind === 'regular') keys.push('bee', 'but', 'boss');
  return Array.from(new Set(keys));
}

async function captureCurrentRow(row){
  const output = path.join(CURRENT_DIR, `${row.id}.png`);
  const videoOutput = path.join(CURRENT_VIDEO_DIR, `${row.id}.webm`);
  ensureDir(path.dirname(output));
  ensureDir(path.dirname(videoOutput));
  return withHarnessPage({
    skipStart: true,
    seed: 57000 + row.displayOrder,
    viewport: { width: 960, height: 860 }
  }, async ({ page }) => {
    await page.evaluate(cfg => {
      localStorage.setItem('auroraGalacticaAutoVideo', '0');
      localStorage.setItem('platinumAutoVideo', '0');
      try {
        localStorage.setItem('auroraGameSoundVolume', '0');
        localStorage.setItem('platinumGameSoundVolume', '0');
        localStorage.setItem('auroraArcadeMusicMuted', '1');
        localStorage.setItem('platinumArcadeMusicMuted', '1');
      } catch {}
      const h = window.__galagaHarness__;
      if(cfg.kind === 'challenge'){
        h.start({
          autoVideo: false,
          stageMode: 'display',
          startKind: 'challenge',
          challengeStage: cfg.challengeNumber,
          stage: cfg.displayLevel,
          ships: 3,
          seed: cfg.seed,
          graphicsTheme: 'classic-arcade',
          starfieldIntensity: 0,
          starfieldSpeed: 0
        });
      } else {
        h.start({
          autoVideo: false,
          stageMode: 'display',
          startKind: 'level',
          stage: cfg.displayLevel,
          challenge: false,
          ships: 3,
          seed: cfg.seed,
          graphicsTheme: 'classic-arcade',
          starfieldIntensity: 0,
          starfieldSpeed: 0
        });
      }
      h.setControlledClock(true);
      h.advanceFor(cfg.sampleSeconds, { step: 1 / 60, stopOnGameOver: false });
      h.redraw();
    }, Object.assign({}, row, { seed: 57000 + row.displayOrder }));
    const state = await page.evaluate(() => {
      const h = window.__galagaHarness__;
      const runtime = h.spriteRuntimeState();
      const state = h.state();
      const challenge = h.challengeFormationState();
      const events = h.recentEvents({ count: 250 }) || [];
      return {
        state,
        runtime,
        challenge,
        eventCounts: {
          enemyShots: events.filter(e => e.type === 'enemy_shot' || e.type === 'enemy_bullet').length,
          enemyAttackStarts: events.filter(e => e.type === 'enemy_attack_start').length,
          shipLosses: events.filter(e => e.type === 'ship_loss' || e.type === 'player_loss').length,
          challengeContacts: events.filter(e => e.type === 'challenge_enemy_contact').length
        }
      };
    });
    await page.locator('#c').screenshot({ path: output });
    const video = await captureCurrentClip(page, row, videoOutput);
    return {
      ok: true,
      image: rel(output),
      video: video.video,
      videoStatus: video.status,
      videoError: video.error || null,
      videoDurationSeconds: video.durationSeconds || VIDEO_SECONDS,
      videoFps: video.fps || CURRENT_VIDEO_FPS,
      state,
      sampleSeconds: row.sampleSeconds
    };
  });
}

async function captureCurrentClip(page, row, output){
  const frameDir = path.join(TEMP_FRAME_DIR, row.id);
  safeRemove(frameDir);
  ensureDir(frameDir);
  const frameCount = Math.max(1, Math.round(VIDEO_SECONDS * CURRENT_VIDEO_FPS));
  try {
    for(let index = 0; index < frameCount; index += 1){
      const framePath = path.join(frameDir, `frame-${String(index).padStart(4, '0')}.png`);
      await page.locator('#c').screenshot({ path: framePath });
      await page.evaluate(stepSeconds => {
        const h = window.__galagaHarness__;
        h.advanceFor(stepSeconds, { step: 1 / 60, stopOnGameOver: false });
        h.redraw();
      }, 1 / CURRENT_VIDEO_FPS);
    }
    const ffmpeg = process.env.FFMPEG || 'ffmpeg';
    const result = spawnSync(ffmpeg, [
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      '-framerate', String(CURRENT_VIDEO_FPS),
      '-i', path.join(frameDir, 'frame-%04d.png'),
      '-t', String(VIDEO_SECONDS),
      '-an',
      '-vf', 'scale=720:-2',
      '-c:v', 'libvpx-vp9',
      '-b:v', '0',
      '-crf', '36',
      '-row-mt', '1',
      output
    ], { encoding: 'utf8' });
    if(result.status !== 0 || !fs.existsSync(output)){
      return {
        ok: false,
        video: null,
        status: 'ffmpeg-current-clip-failed',
        error: `${result.stderr || result.stdout || 'ffmpeg failed'}`.trim()
      };
    }
    return {
      ok: true,
      video: rel(output),
      status: 'rendered-current-10s-video',
      durationSeconds: VIDEO_SECONDS,
      fps: CURRENT_VIDEO_FPS
    };
  } finally {
    safeRemove(frameDir);
  }
}

function loadChallengeConformance(){
  return readJson(path.join(ANALYSES, 'challenge-stage-conformance', 'latest.json'), { stageRows: [], summary: {} });
}

function loadLevelArc(){
  return readJson(path.join(ANALYSES, 'level-arc-conformance', 'latest.json'), { summary: {}, metrics: [] });
}

function challengeMetricsFor(row, challengeArtifact){
  const stageRows = Array.isArray(challengeArtifact.stageRows) ? challengeArtifact.stageRows : [];
  return stageRows.find(item => +item.challengeNumber === +row.challengeNumber || +item.stage === +row.challengeMarker) || null;
}

function levelBand(level){
  if(level <= 2) return 'opening';
  if(level <= 6) return 'early-pressure';
  if(level <= 10) return 'capture-pressure';
  if(level <= 18) return 'mid-loop';
  return 'late-loop';
}

function scoreForRegularLevel(levelArc, level){
  const broad = Number(levelArc?.summary?.score10);
  const challenge = Number(levelArc?.summary?.challengeIdentityScore10);
  const later = Number(levelArc?.summary?.laterVariationScore10);
  const pressure = Number(levelArc?.summary?.pressureScore10);
  if(level <= 6 && Number.isFinite(pressure)) return round(pressure, 1);
  if(level >= 11 && Number.isFinite(later)) return round(later, 1);
  if(Number.isFinite(challenge) && level >= 7) return round((challenge + (Number.isFinite(broad) ? broad : challenge)) / 2, 1);
  return Number.isFinite(broad) ? round(broad, 1) : null;
}

function currentRoleKeys(capture){
  const enemies = Array.isArray(capture?.state?.runtime?.enemies) ? capture.state.runtime.enemies : [];
  return Array.from(new Set(enemies.map(normalizeRoleKey).filter(Boolean)));
}

function currentRoleRead(capture){
  const enemies = Array.isArray(capture?.state?.runtime?.enemies) ? capture.state.runtime.enemies : [];
  const counts = new Map();
  for(const enemy of enemies){
    const key = normalizeRoleKey(enemy) || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${ROLE_MEDIA[key]?.label || key}: ${count}`)
    .join(', ') || 'No active enemy roles visible in this sampled current frame.';
}

function analysisForRow(row, target, capture, challengeArtifact, levelArc){
  if(row.kind === 'challenge'){
    const metrics = challengeMetricsFor(row, challengeArtifact) || {};
    const gaps = Array.isArray(metrics.criticalGaps) ? metrics.criticalGaps : [];
    return {
      score10: metrics.conformanceScore10 ?? null,
      movementScore10: metrics.movementConformanceScore10 ?? null,
      graphicsScore10: metrics.graphicalConformanceScore10 ?? null,
      noveltyScore10: metrics.alienNoveltyScore10 ?? null,
      progressionScore10: metrics.progressionConformanceScore10 ?? null,
      status: 'strict challenge-stage scorer',
      playerFacingRead: `This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.`,
      variationRead: target?.motionRead || 'Challenge reference motion read pending.',
      currentRead: metrics.currentRead || currentRoleRead(capture),
      criticalGap: gaps[0] || 'Critical gap pending; run challenge-stage conformance before using this row as release evidence.',
      next: (metrics.nextActions || [])[0] || target?.auroraContract || 'Promote group labels and compare target/current path families.'
    };
  }
  const score = scoreForRegularLevel(levelArc, row.displayLevel);
  const exactText = target?.exact
    ? 'This row has an exact ingested Galaga regular-stage target frame.'
    : `This row is honest about target debt: it uses actual Galaga gameplay from ${target?.title || 'a nearby ingested window'}, but not an exact per-level target capture.`;
  const band = levelBand(row.displayLevel);
  return {
    score10: score,
    movementScore10: null,
    graphicsScore10: null,
    noveltyScore10: null,
    progressionScore10: null,
    status: target?.exact ? 'exact regular-stage target' : 'representative regular-stage target',
    playerFacingRead: `${exactText} The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.`,
    variationRead: `Regular level band ${band}; target family ${target?.family || 'regular-entry'}.`,
    currentRead: currentRoleRead(capture),
    criticalGap: target?.exact
      ? 'Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.'
      : `Exact target frame for Level ${row.displayLevel} is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.`,
    next: target?.exact
      ? 'Add target/current motion overlays for the first two entry groups and boss/capture windows.'
      : `Ingest or extract a precise Galaga Level ${row.displayLevel} window, then replace this representative target row.`
  };
}

function rowSummary(row, target, targetFrame, targetClip, capture, challengeArtifact, levelArc){
  const roleKeys = Array.from(new Set([
    ...targetRolesForRow(row, target),
    ...currentRoleKeys(capture)
  ]));
  const roleMedia = roleMediaForKeys(roleKeys);
  const analysis = analysisForRow(row, target, capture, challengeArtifact, levelArc);
  const state = capture?.state?.state || {};
  const challengeState = capture?.state?.challenge || {};
  return {
    id: row.id,
    displayOrder: row.displayOrder,
    kind: row.kind,
    label: row.label,
    displayLevel: row.displayLevel,
    challengeNumber: row.challengeNumber || null,
    challengeMarker: row.challengeMarker || null,
    runtimeInternalStage: state.stage ?? null,
    runtimeChallenge: !!state.challenge,
    sampleSeconds: capture.sampleSeconds,
    currentScreenshot: capture.image,
    targetScreenshot: targetFrame.image,
    targetScreenshotStatus: targetFrame.status,
    targetSourceTimeSeconds: targetFrame.tSourceSeconds ?? null,
    currentVideo: capture.video || null,
    targetVideo: targetClip.video || null,
    currentVideoStatus: capture.videoStatus || 'missing-current-video',
    targetVideoStatus: targetClip.status || 'missing-target-video',
    videoDurationSeconds: VIDEO_SECONDS,
    videoFrameRate: {
      current: capture.videoFps || CURRENT_VIDEO_FPS,
      target: 24
    },
    targetWindow: {
      id: target?.id || '',
      title: target?.title || '',
      exact: !!target?.exact,
      evidenceStatus: target?.evidenceStatus || '',
      contactSheet: target?.contactSheet || null,
      denseContactSheet: target?.denseContactSheet || null,
      motionSheet: target?.motionSheet || null,
      motionRead: target?.motionRead || '',
      targetFamilies: target?.targetFamilies || [],
      auroraContract: target?.auroraContract || ''
    },
    roles: roleMedia,
    currentRoleRead: currentRoleRead(capture),
    currentEnemyCount: Array.isArray(capture?.state?.runtime?.enemies) ? capture.state.runtime.enemies.length : 0,
    challengeEnemyCount: Array.isArray(challengeState.enemies) ? challengeState.enemies.length : 0,
    eventCounts: capture?.state?.eventCounts || {},
    analysis,
    conformanceMetrics: {
      score10: analysis.score10,
      movementScore10: analysis.movementScore10,
      graphicsScore10: analysis.graphicsScore10,
      noveltyScore10: analysis.noveltyScore10,
      progressionScore10: analysis.progressionScore10
    },
    evidence: [
      capture.image,
      targetFrame.image,
      capture.video,
      targetClip.video,
      target?.contactSheet,
      target?.denseContactSheet,
      target?.motionSheet,
      ...roleMedia.flatMap(role => [role.current, role.target, role.targetModel])
    ].filter(Boolean)
  };
}

function buildMarkdown(report){
  const rows = report.rows || [];
  const table = rows.map(row => `| ${row.displayOrder} | ${row.label} | ${row.kind} | ${row.analysis.status} | ${row.conformanceMetrics.score10 ?? 'n/a'}/10 | ${row.targetWindow.exact ? 'exact' : 'representative'} | ${row.analysis.criticalGap} |`).join('\n');
  const sections = rows.map(row => {
    const roles = (row.roles || []).map(role => `- ${role.label}: current \`${role.current}\`; target \`${role.target}\``).join('\n');
    return `## ${row.label}

![Aurora current](${row.currentScreenshot})

![Galaga target](${row.targetScreenshot})

**Aurora 10s video:** ${row.currentVideo ? `\`${row.currentVideo}\`` : 'pending'}

**Galaga target 10s video:** ${row.targetVideo ? `\`${row.targetVideo}\`` : 'pending'}

**Target source:** ${row.targetWindow.title || 'target pending'}; ${row.targetWindow.exact ? 'exact target row' : 'representative actual target gameplay row'}.

**Current roles:** ${row.currentRoleRead}

**Conformance read:** ${row.analysis.playerFacingRead}

**Variation read:** ${row.analysis.variationRead}

**Current read:** ${row.analysis.currentRead}

**Critical gap:** ${row.analysis.criticalGap}

**Next:** ${row.analysis.next}

**Sprite / alien bitmap references:**
${roles || '- Role bitmap references pending.'}
`;
  }).join('\n');
  return `# Level Visual Conformance Index

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Summary

${report.summary.read}

| Order | Row | Kind | Status | Score | Target Grounding | Critical Gap |
| ---: | --- | --- | --- | ---: | --- | --- |
${table}

${sections}
`;
}

async function buildReport(){
  ensureDir(CURRENT_DIR);
  ensureDir(TARGET_DIR);
  ensureDir(CURRENT_VIDEO_DIR);
  ensureDir(TARGET_VIDEO_DIR);
  safeRemove(TEMP_FRAME_DIR);
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const branch = git(['branch', '--show-current'], 'unknown');
  const challengeArtifact = loadChallengeConformance();
  const levelArc = loadLevelArc();
  const rows = [];
  for(const row of levelRows()){
    const target = targetWindowForRow(row);
    const targetFrame = extractFrame(row, target);
    const targetClip = extractTargetClip(row, target, targetFrame.tSourceSeconds);
    const capture = await captureCurrentRow(row);
    rows.push(rowSummary(row, target, targetFrame, targetClip, capture, challengeArtifact, levelArc));
  }
  const exactTargets = rows.filter(row => row.targetWindow.exact).length;
  const challengeRows = rows.filter(row => row.kind === 'challenge');
  const regularRows = rows.filter(row => row.kind === 'regular');
  const numericScores = rows.map(row => row.conformanceMetrics.score10).filter(Number.isFinite);
  const challengeScores = challengeRows.map(row => row.conformanceMetrics.score10).filter(Number.isFinite);
  const summary = {
    rowCount: rows.length,
    regularLevelCount: regularRows.length,
    challengeStageCount: challengeRows.length,
    currentScreenshotCount: rows.filter(row => row.currentScreenshot && fs.existsSync(path.join(ROOT, row.currentScreenshot))).length,
    targetScreenshotCount: rows.filter(row => row.targetScreenshot && fs.existsSync(path.join(ROOT, row.targetScreenshot))).length,
    currentVideoCount: rows.filter(row => row.currentVideo && fs.existsSync(path.join(ROOT, row.currentVideo))).length,
    targetVideoCount: rows.filter(row => row.targetVideo && fs.existsSync(path.join(ROOT, row.targetVideo))).length,
    exactTargetRows: exactTargets,
    representativeTargetRows: rows.length - exactTargets,
    score10: round(average(numericScores), 1),
    challengeScore10: round(average(challengeScores), 1),
    targetGroundingScore10: round(10 * (exactTargets / Math.max(1, rows.length)), 1),
    weakestRows: rows
      .slice()
      .sort((a, b) => (a.conformanceMetrics.score10 ?? 99) - (b.conformanceMetrics.score10 ?? 99) || a.displayOrder - b.displayOrder)
      .slice(0, 5)
      .map(row => ({ label: row.label, score10: row.conformanceMetrics.score10, criticalGap: row.analysis.criticalGap })),
    read: `The generated index now contains ${rows.length} ordered rows: ${regularRows.length} regular levels and ${challengeRows.length} challenging stages. Every row has a current Aurora runtime screenshot, an actual Galaga target-gameplay frame, and paired 10-second current/target gameplay clips for inline motion review. The important caveat is grounding quality: ${exactTargets}/${rows.length} target rows are exact ingested windows, while ${rows.length - exactTargets} regular-level rows use representative actual Galaga gameplay until a full per-level normal-stage corpus is ingested. Challenge-stage visual conformance remains the most human-visible failure: exact challenge target screenshots exist, but the strict challenge score is only ${round(average(challengeScores), 1) ?? 'n/a'}/10.`
  };
  return {
    schemaVersion: 1,
    artifactType: 'level-visual-conformance-index',
    generatedAt,
    commit,
    branch,
    summary,
    rows,
    sourceArtifacts: {
      challengeStageConformance: 'reference-artifacts/analyses/challenge-stage-conformance/latest.json',
      galagaChallengeVideoReference: 'reference-artifacts/analyses/galaga-challenge-video-reference/latest.json',
      galagaPathReferenceMedia: 'reference-artifacts/analyses/galaga-path-reference-media/README.md',
      auroraRuntimeSpriteConformance: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json'
    },
    measurementLimits: [
      'Current Aurora screenshots are deterministic browser harness samples from a single mid-level timestamp, not full temporal proof.',
      'Current Aurora 10-second clips are deterministic controlled-clock canvas renders at 10fps, intended for human motion review rather than audio/video performance benchmarking.',
      'Challenge target screenshots are exact frames extracted from the user-supplied all-challenge Galaga video.',
      'Target 10-second clips begin at the same source timestamp as the target screenshot. Exactness follows the row target window: all challenge rows are exact; many regular rows are representative until a fuller normal-stage corpus is ingested.',
      'Regular target screenshots are exact only for ingested regular-stage windows. Other regular levels use the nearest actual Galaga reference window and are explicitly marked as representative.',
      'Sprite bitmap rows show current and target static sprites; active motion, rotation, flapping, and capture/rescue transitions remain separate motion-scoring work.'
    ],
    nextBestSteps: [
      'Ingest exact Galaga normal-stage windows for missing regular levels or stage bands, especially Levels 3, 7-9, and later loop bands.',
      'Promote challenge-stage target frames into per-group labels so the current/target screenshots can be scored by arrival side, path length, turn shape, alien family, and scoreable firing lane.',
      'Replace single-frame rows with small temporal strips for weak challenge rows once the per-stage group labels exist.',
      'Use this visual index as the release-facing human review map: if a row looks embarrassing side by side, prioritize its path grammar before broad score tuning.'
    ]
  };
}

async function main(){
  const report = await buildReport();
  const stamp = `${report.generatedAt.slice(0, 10)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  const reportPath = path.join(outDir, 'report.json');
  const readmePath = path.join(outDir, 'README.md');
  writeJson(reportPath, report);
  writeText(readmePath, buildMarkdown(report));
  writeJson(LATEST_JSON, report);
  writeText(TOP_LEVEL_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    rows: report.summary.rowCount,
    currentScreenshots: report.summary.currentScreenshotCount,
    targetScreenshots: report.summary.targetScreenshotCount,
    currentVideos: report.summary.currentVideoCount,
    targetVideos: report.summary.targetVideoCount,
    exactTargetRows: report.summary.exactTargetRows,
    representativeTargetRows: report.summary.representativeTargetRows,
    latest: rel(LATEST_JSON),
    markdown: rel(TOP_LEVEL_MD)
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

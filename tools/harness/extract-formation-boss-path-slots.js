#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFileSync } = require('child_process');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_DEV } = require('../build/paths');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_ROOT = DIST_DEV;
const SCENARIO_ROOT = path.join(ROOT, 'tools', 'harness', 'scenarios');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-boss-path-slot-extraction');

const WINDOW_SCENARIOS = {
	  'stage-1-baseline': 'stage1-descent',
	  'challenge-stage-candidate': 'stage3-challenge',
	  'challenge-stage-scorpion-cross': 'stage7-challenge-cross-sweep',
	  'challenge-stage-stingray-hook': 'stage11-challenge-hook-arc',
	  'challenge-stage-boss-led-loop': 'stage15-challenge-boss-led-loop',
	  'challenge-stage-crown-split-cascade': 'stage19-challenge-crown-split-cascade',
	  'mid-run-pressure': 'stage6-regular',
  'mid-run-entry-variant': 'stage8-entry-variant',
  'mid-run-pincer-variant': 'stage10-pincer-entry',
  'late-run-cleanup-or-failure': 'stage12-variety',
  'late-run-escort-variant': 'stage14-escort-variant',
  'late-run-crown-entry': 'stage16-crown-entry'
};

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function keyName(code){
  if(code === 'Space') return ' ';
  if(code.startsWith('Key')) return code.slice(3).toLowerCase();
  if(code.startsWith('Digit')) return code.slice(5);
  return code;
}

function scenarioPath(name){
  return path.join(SCENARIO_ROOT, `${name}.json`);
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function serve(root){
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    const relPath = clean === '/' ? '/index.html' : clean;
    const file = path.resolve(root, `.${relPath}`);
    if(!file.startsWith(root)) return res.writeHead(403).end('forbidden');
    fs.readFile(file, (err, data) => {
      if(err) return res.writeHead(404).end('not found');
      res.writeHead(200, { 'content-type': mime(file), 'cache-control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function advance(page, seconds){
  if(seconds <= 0) return;
  await page.evaluate(duration => {
    window.__galagaHarness__.advanceFor(duration, { step: 1 / 60, stopOnGameOver: false });
  }, seconds);
}

function normalizeTarget(target, kind){
  const id = `${kind}:${target.id}`;
  return {
    id,
    rawId: target.id,
    kind,
    type: target.type,
    family: target.family || null,
    pathFamily: target.pathFamily || null,
    row: Number.isFinite(+target.row) ? +target.row : null,
    column: Number.isFinite(+target.column) ? +target.column : null,
    lane: Number.isFinite(+target.lane) ? +target.lane : null,
    wave: Number.isFinite(+target.wave) ? +target.wave : null,
    targetX: Number.isFinite(+target.tx) ? +target.tx : (Number.isFinite(+target.targetX) ? +target.targetX : null),
    targetY: Number.isFinite(+target.ty) ? +target.ty : (Number.isFinite(+target.targetY) ? +target.targetY : null),
    x: Number.isFinite(+target.x) ? +target.x : null,
    y: Number.isFinite(+target.y) ? +target.y : null,
    spawn: Number.isFinite(+target.spawn) ? +target.spawn : null,
    spawnPlan: Number.isFinite(+target.spawnPlan) ? +target.spawnPlan : null,
    tm: Number.isFinite(+target.tm) ? +target.tm : null,
    ph: Number.isFinite(+target.ph) ? +target.ph : null,
    dive: Number.isFinite(+target.dive) ? +target.dive : null,
    form: !!target.form,
    low: !!target.low,
    carry: !!target.carry,
    beam: !!target.beam,
    lead: target.lead || null,
    off: Number.isFinite(+target.off) ? +target.off : null,
    esc: Number.isFinite(+target.esc) ? +target.esc : null,
    squadId: Number.isFinite(+target.squadId) ? +target.squadId : null,
    side: target.side || null
  };
}

async function captureSample(page, t){
  return page.evaluate(sampleT => {
    const api = window.__galagaHarness__;
    const snap = api.snapshot();
    const formation = api.formationState();
    const challenge = api.challengeFormationState();
    return {
      t: +sampleT.toFixed(3),
      stage: snap.stage,
      challenge: !!snap.challenge,
      player: snap.player,
      counts: snap.counts,
      formation: formation.targets,
      challengeFormation: challenge.enemies
    };
  }, t);
}

function pathExtractionActions(scenario){
  const actions = [...(scenario.actions || [])].sort((a, b) => a.t - b.t);
  if(!scenario.config?.challenge) return actions;
  return actions.filter(action => {
    const code = action.code || action.key || '';
    return code !== 'Space' && code !== ' ';
  });
}

function measurementMode(scenario){
  return scenario.config?.challenge
    ? 'challenge-reference-motion-no-player-fire'
    : 'scripted-gameplay-window';
}

async function runScenarioActions(page, scenario, sampleInterval){
  const actions = pathExtractionActions(scenario);
  const samples = [];
  const sampleTimes = [];
  for(let t = 0; t <= scenario.duration + 0.001; t += sampleInterval) sampleTimes.push(+t.toFixed(3));
  if(sampleTimes.at(-1) !== scenario.duration) sampleTimes.push(scenario.duration);
  sampleTimes.sort((a, b) => a - b);
  let current = 0;
  let actionIndex = 0;
  let sampleIndex = 0;
  const down = new Set();
  while(sampleIndex < sampleTimes.length || actionIndex < actions.length){
    const nextSample = sampleIndex < sampleTimes.length ? sampleTimes[sampleIndex] : Infinity;
    const nextAction = actionIndex < actions.length ? actions[actionIndex].t : Infinity;
    const next = Math.min(nextSample, nextAction, scenario.duration);
    await advance(page, next - current);
    current = next;
    if(nextSample <= nextAction && nextSample <= scenario.duration){
      samples.push(await captureSample(page, current));
      sampleIndex += 1;
    }else if(nextAction < Infinity && nextAction <= scenario.duration){
      const action = actions[actionIndex++];
      const key = keyName(action.code || action.key || 'Space');
      if(action.action === 'down' && !down.has(key)){
        await page.keyboard.down(key);
        down.add(key);
      }else if(action.action === 'up' && down.has(key)){
        await page.keyboard.up(key);
        down.delete(key);
      }else if(action.action === 'press'){
        await page.keyboard.down(key);
        await advance(page, action.hold || 0.08);
        current += action.hold || 0.08;
        await page.keyboard.up(key);
      }
    }else{
      break;
    }
  }
  for(const key of down) await page.keyboard.up(key);
  return samples;
}

function trackTargets(samples){
  const tracks = new Map();
  for(const sample of samples){
    for(const raw of sample.formation || []){
      const target = normalizeTarget(raw, 'regular');
      if(!tracks.has(target.id)) tracks.set(target.id, []);
      tracks.get(target.id).push(Object.assign({ t: sample.t }, target));
    }
    for(const raw of sample.challengeFormation || []){
      const target = normalizeTarget(raw, 'challenge');
      if(!tracks.has(target.id)) tracks.set(target.id, []);
      tracks.get(target.id).push(Object.assign({ t: sample.t }, target));
    }
  }
  return [...tracks.entries()].map(([id, points]) => summarizeTrack(id, points));
}

function summarizeTrack(id, points){
  const xs = points.map(point => point.x).filter(Number.isFinite);
  const ys = points.map(point => point.y).filter(Number.isFinite);
  const first = points[0] || {};
  const last = points.at(-1) || {};
  let pathLength = 0;
  for(let i = 1; i < points.length; i += 1){
    const a = points[i - 1];
    const b = points[i];
    if(Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(b.x) && Number.isFinite(b.y)){
      pathLength += Math.hypot(b.x - a.x, b.y - a.y);
    }
  }
  const xRange = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
  const yRange = ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
  const slotObserved = first.kind === 'regular'
    && Number.isFinite(first.row)
    && Number.isFinite(first.column)
    && Number.isFinite(first.targetX)
    && Number.isFinite(first.targetY);
  const challengeSlotObserved = first.kind === 'challenge'
    && Number.isFinite(first.wave)
    && Number.isFinite(first.lane);
  return {
    id,
    kind: first.kind,
    type: first.type,
    family: first.family,
    pathFamily: first.pathFamily,
    row: first.row,
    column: first.column,
    lane: first.lane,
    wave: first.wave,
    targetX: first.targetX,
    targetY: first.targetY,
    lead: first.lead,
    pointCount: points.length,
    firstT: first.t,
    lastT: last.t,
    xRange: round(xRange),
    yRange: round(yRange),
    pathLength: round(pathLength),
    moving: pathLength > 12 || xRange > 8 || yRange > 8,
    diving: points.some(point => +point.dive > 0),
    escort: !!first.lead || points.some(point => !!point.lead),
    slotObserved,
    challengeSlotObserved,
    points: points.map(point => ({
      t: point.t,
      x: point.x,
      y: point.y,
      row: point.row,
      column: point.column,
      lane: point.lane,
      wave: point.wave,
      targetX: point.targetX,
      targetY: point.targetY,
      dive: point.dive,
      lead: point.lead
    }))
  };
}

function stageBand(stage, challenge){
  if(challenge) return 'challenge';
  if(stage <= 2) return 'early';
  if(stage < 10) return 'mid';
  return 'late';
}

function summarizeWindow(windowId, scenario, samples){
  const tracks = trackTargets(samples);
  const regularTracks = tracks.filter(track => track.kind === 'regular');
  const challengeTracks = tracks.filter(track => track.kind === 'challenge');
  const movingTracks = tracks.filter(track => track.moving);
  const bossTracks = tracks.filter(track => track.type === 'boss');
  const bossMovingTracks = bossTracks.filter(track => track.moving);
  const escortTracks = tracks.filter(track => track.escort);
  const regularSlotTracks = regularTracks.filter(track => track.slotObserved);
  const challengeSlotTracks = challengeTracks.filter(track => track.challengeSlotObserved);
  const stage = scenario.config?.stage || samples[0]?.stage || null;
  const challenge = Boolean(scenario.config?.challenge || samples[0]?.challenge);
  return {
    windowId,
    scenario: scenario.name,
    measurementMode: measurementMode(scenario),
    seed: scenario.seed,
    stage,
    band: stageBand(stage || 1, challenge),
    challenge,
    sampleCount: samples.length,
    trackCount: tracks.length,
    regularTrackCount: regularTracks.length,
    challengeTrackCount: challengeTracks.length,
    movingTrackCount: movingTracks.length,
    bossTrackCount: bossTracks.length,
    bossMovingTrackCount: bossMovingTracks.length,
    escortTrackCount: escortTracks.length,
    regularSlotTrackCount: regularSlotTracks.length,
    challengeSlotTrackCount: challengeSlotTracks.length,
    averageMovingPathLength: round(average(movingTracks.map(track => track.pathLength))),
    maxMovingPathLength: round(Math.max(0, ...movingTracks.map(track => track.pathLength))),
    tracks
  };
}

function windowSvg(windowReport){
  const width = 640;
  const height = 520;
  const pad = 24;
  const tracks = windowReport.tracks
    .filter(track => track.moving || track.type === 'boss' || track.escort)
    .slice(0, 48);
  const colorFor = track => {
    if(track.type === 'boss') return '#ff6b6b';
    if(track.escort) return '#ffd166';
    if(track.kind === 'challenge') return '#8dd3ff';
    return '#9be564';
  };
  const lines = tracks.map(track => {
    const points = track.points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
    if(points.length < 2) return '';
    const d = points.map((point, index) => `${index ? 'L' : 'M'}${(pad + point.x * 2).toFixed(1)},${(pad + point.y * 2).toFixed(1)}`).join(' ');
    return `<path d="${d}" fill="none" stroke="${colorFor(track)}" stroke-width="${track.type === 'boss' ? 2.2 : 1.3}" opacity="0.82"><title>${track.id} ${track.type}</title></path>`;
  }).filter(Boolean);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#091018"/>
  <text x="${pad}" y="18" fill="#eef3f6" font-family="monospace" font-size="13">${windowReport.windowId} path/slot extraction</text>
  <rect x="${pad}" y="${pad}" width="560" height="448" fill="none" stroke="#31404d"/>
  ${lines.join('\n  ')}
  <text x="${pad}" y="${height - 16}" fill="#a9b7c0" font-family="monospace" font-size="11">red boss, gold escort, blue challenge, green other moving paths</text>
</svg>
`;
}

async function runWindow({ browser, port, windowId, scenarioName, sampleInterval }){
  const scenario = readJson(scenarioPath(scenarioName));
  scenario.name = scenario.name || scenarioName;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
  const page = await context.newPage();
  await page.addInitScript(cfg => {
    localStorage.setItem('auroraGalacticaAutoVideo', '0');
    localStorage.setItem('auroraGalacticaTestCfg', JSON.stringify(cfg));
    localStorage.setItem('auroraGalacticaHarnessSeed', String(cfg.seed >>> 0));
    localStorage.setItem('platinumAutoVideo', '0');
    localStorage.setItem('platinumTestCfg', JSON.stringify(cfg));
    localStorage.setItem('platinumHarnessSeed', String(cfg.seed >>> 0));
  }, Object.assign({}, scenario.config, { seed: scenario.seed }));
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__galagaHarness__);
  await page.evaluate(cfg => window.__galagaHarness__.start(Object.assign({}, cfg.config, {
    seed: cfg.seed,
    autoVideo: false,
    controlledClock: true
  })), scenario);
  const rawSamples = await runScenarioActions(page, scenario, sampleInterval);
  await context.close();
  const samples = rawSamples.map(sample => ({
    t: sample.t,
    stage: sample.stage,
    challenge: sample.challenge,
    player: sample.player,
    counts: sample.counts,
    formation: (sample.formation || []).map(item => normalizeTarget(item, 'regular')),
    challengeFormation: (sample.challengeFormation || []).map(item => normalizeTarget(item, 'challenge'))
  }));
  return summarizeWindow(windowId, scenario, samples);
}

function selectedWindows(argv){
  const selected = new Set();
  for(let i = 0; i < argv.length; i += 1){
    const arg = argv[i];
    if(arg === '--window' && argv[i + 1]){
      selected.add(argv[i + 1]);
      i += 1;
    }else if(arg.startsWith('--window=')){
      selected.add(arg.slice('--window='.length));
    }
  }
  return selected;
}

function sampleInterval(argv){
  const arg = argv.find(item => item.startsWith('--sample-interval='));
  if(!arg) return 0.25;
  const value = +arg.slice('--sample-interval='.length);
  return Number.isFinite(value) && value > 0 ? value : 0.25;
}

function buildSummary(windows){
  const totalTracks = windows.reduce((sum, win) => sum + win.trackCount, 0);
  const movingTracks = windows.reduce((sum, win) => sum + win.movingTrackCount, 0);
  const bossMovingTracks = windows.reduce((sum, win) => sum + win.bossMovingTrackCount, 0);
  const escortTracks = windows.reduce((sum, win) => sum + win.escortTrackCount, 0);
  const regularSlotTracks = windows.reduce((sum, win) => sum + win.regularSlotTrackCount, 0);
  const challengeSlotTracks = windows.reduce((sum, win) => sum + win.challengeSlotTrackCount, 0);
  const challengeWindows = windows.filter(win => win.challenge);
  const regularWindows = windows.filter(win => !win.challenge);
  const extractionCoverage = windows.length ? windows.filter(win => win.trackCount > 0).length / windows.length : 0;
  const bossCoverage = regularWindows.length ? regularWindows.filter(win => win.bossTrackCount > 0).length / regularWindows.length : 0;
  const movingCoverage = totalTracks ? movingTracks / totalTracks : 0;
  const slotCoverage = totalTracks ? (regularSlotTracks + challengeSlotTracks) / totalTracks : 0;
  const escortCoverage = regularWindows.length ? regularWindows.filter(win => win.escortTrackCount > 0).length / regularWindows.length : 0;
  const challengeCoverage = challengeWindows.length ? challengeWindows.filter(win => win.challengeTrackCount > 0).length / challengeWindows.length : 0;
  const extractionScore10 = round(10 * (
    (0.22 * extractionCoverage)
    + (0.18 * bossCoverage)
    + (0.18 * movingCoverage)
    + (0.2 * slotCoverage)
    + (0.12 * escortCoverage)
    + (0.1 * challengeCoverage)
  ), 1);
  const referenceComparisonCap10 = 5.5;
  return {
    windowCount: windows.length,
    regularWindowCount: regularWindows.length,
    challengeWindowCount: challengeWindows.length,
    totalTracks,
    movingTracks,
    bossMovingTracks,
    escortTracks,
    regularSlotTracks,
    challengeSlotTracks,
    extractionCoverage: round(extractionCoverage),
    bossCoverage: round(bossCoverage),
    movingCoverage: round(movingCoverage),
    slotCoverage: round(slotCoverage),
    escortCoverage: round(escortCoverage),
    challengeCoverage: round(challengeCoverage),
    extractionScore10,
    referenceComparisonCap10,
    cappedPathSlotScore10: round(Math.min(extractionScore10, referenceComparisonCap10), 1),
    topProblem: extractionScore10 >= referenceComparisonCap10
      ? 'Runtime path and slot extraction is now available; the remaining conformance gap is reference comparison, not raw data capture.'
      : 'Runtime path and slot extraction is incomplete for at least one boss, escort, challenge, or formation-slot family.',
    strategy: 'Use this extraction artifact as the data source for boss/formation grammar scoring, then add reference-video path labels for direct Galaga comparison.'
  };
}

async function main(){
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))) throw new Error('Built app missing. Run npm run build first.');
  ensureDir(OUT_ROOT);
  const argv = process.argv.slice(2);
  const selected = selectedWindows(argv);
  const interval = sampleInterval(argv);
  const commit = gitShortCommit();
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);
  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();
  try{
    const windows = [];
    for(const [windowId, scenarioName] of Object.entries(WINDOW_SCENARIOS)){
      if(selected.size && !selected.has(windowId)) continue;
      const result = await runWindow({ browser, port, windowId, scenarioName, sampleInterval: interval });
      windows.push(result);
      fs.writeFileSync(path.join(outDir, `${windowId}.svg`), windowSvg(result));
    }
    const summary = buildSummary(windows);
    const report = {
      generatedAt: new Date().toISOString(),
      commit,
      artifactType: 'formation-boss-path-slot-extraction',
      sampleIntervalS: interval,
      measurementPolicy: {
        regularWindows: 'Use scripted gameplay inputs so rack-settle, boss, escort, and pressure paths are sampled in plausible play.',
        challengeWindows: 'Suppress player fire during trajectory extraction so challenge-stage path comparison measures authored alien motion instead of bullet-truncated tracks.',
        gameplayMeaning: 'This is a measurement-only policy; it does not alter runtime challenge gameplay or separate challenge-perfect/player-score probes.'
      },
      summary,
      windows,
      problem: 'Boss entry and formation grammar needs frame-level path and rack-slot evidence before gameplay changes can be ranked precisely.',
      plan: 'Extract runtime boss, escort, formation, and challenge trajectories first; then compare those trajectories to reference path families and use the scorer to select gameplay changes.',
      successMeasure: 'Runtime extraction should hit the capped path/slot score, then reference-comparison work should lift the cap by adding Galaga-derived path/slot targets.'
    };
    writeJson(path.join(outDir, 'report.json'), report);
    const lines = [
      '# Formation Boss Path Slot Extraction',
      '',
      'This artifact samples Aurora runtime formation, boss, escort, and challenge-stage trajectories without changing gameplay.',
      '',
      'Challenge windows are captured as no-fire reference-motion passes so killed enemies do not shorten the measured alien trajectories. Gameplay scoring and challenge-perfect probes remain separate.',
      '',
      `- Score before reference cap: ${summary.extractionScore10}/10`,
      `- Capped path/slot score: ${summary.cappedPathSlotScore10}/10`,
      `- Total tracks: ${summary.totalTracks}`,
      `- Moving tracks: ${summary.movingTracks}`,
      `- Boss moving tracks: ${summary.bossMovingTracks}`,
      `- Escort tracks: ${summary.escortTracks}`,
      `- Slot coverage: ${summary.slotCoverage}`,
      '',
      `Problem: ${report.problem}`,
      '',
      `Plan: ${report.plan}`,
      '',
      `Success: ${report.successMeasure}`,
      '',
      '## Windows',
      '',
      '| Window | Stage | Measurement | Tracks | Moving | Boss moving | Escorts | Slot tracks | SVG |',
      '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |'
    ];
    for(const win of windows){
      lines.push(`| ${win.windowId} | ${win.stage} | ${win.measurementMode} | ${win.trackCount} | ${win.movingTrackCount} | ${win.bossMovingTrackCount} | ${win.escortTrackCount} | ${win.regularSlotTrackCount + win.challengeSlotTrackCount} | ${win.windowId}.svg |`);
    }
    fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
    console.log(JSON.stringify({ ok: true, outDir, summary }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});

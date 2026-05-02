#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_DEV } = require('../build/paths');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_ROOT = DIST_DEV;
const PLAN_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-level-expansion-cycle', 'aurora-four-window-cycle.plan.json');
const SCENARIO_ROOT = path.join(ROOT, 'tools', 'harness', 'scenarios');

const WINDOW_SCENARIOS = {
  'stage-1-baseline': 'stage1-descent',
  'challenge-stage-candidate': 'stage3-challenge',
  'mid-run-pressure': 'stage6-regular',
  'late-run-cleanup-or-failure': 'stage12-variety'
};

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function copyFile(from, to){
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.svg')) return 'image/svg+xml';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
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

function keyName(code){
  if(code === 'Space') return ' ';
  if(code.startsWith('Key')) return code.slice(3).toLowerCase();
  if(code.startsWith('Digit')) return code.slice(5);
  return code;
}

async function advance(page, seconds){
  if(seconds <= 0) return;
  await page.evaluate(duration => {
    const api = window.__galagaHarness__;
    api.advanceFor(duration, { step: 1 / 60, stopOnGameOver: false });
  }, seconds);
}

function scenarioPath(name){
  return path.join(SCENARIO_ROOT, `${name}.json`);
}

function eventFamilyForRuntimeEvent(event, scenario, sampleEvents){
  if(event.type === 'stage_spawn') return scenario.config.challenge ? 'challenge_wave_start' : 'formation_entry';
  if(event.type === 'key_down' && ['ArrowLeft', 'ArrowRight'].includes(event.code)) return 'player_move';
  if(event.type === 'player_shot') return scenario.config.challenge ? 'challenge_enemy_path' : 'player_shot';
  if(event.type === 'enemy_attack_start') return event.escort || event.attackMode === 'escort' ? 'escort_dive_start' : 'enemy_dive_start';
  if(event.type === 'enemy_bullet_fired') return 'enemy_projectile';
  if(event.type === 'enemy_killed') return scenario.config.challenge ? 'challenge_enemy_hit' : null;
  if(event.type === 'ship_lost') return 'player_hit';
  if(event.type === 'stage_clear') return 'wave_clear';
  if(event.type === 'challenge_clear') return 'challenge_result';
  if(event.type === 'game_start') return 'stage_start';
  return sampleEvents.has(event.type) ? event.type : null;
}

function promoteEvents({ win, scenario, events, samples }){
  const allowed = new Set(win.event_families || []);
  const promoted = [];
  for(const event of events){
    const family = eventFamilyForRuntimeEvent(event, scenario, allowed);
    if(!family || !allowed.has(family)) continue;
    promoted.push({
      event_id: `${win.window_id}-${String(promoted.length + 1).padStart(3, '0')}-${family}`,
      event_family: family,
      runtime_type: event.type,
      time_s: typeof event.t === 'number' ? +event.t.toFixed(3) : null,
      duration_s: null,
      entity_family: event.sourceType || event.enemyType || event.type || null,
      entity_id: event.sourceDive ?? event.enemyId ?? null,
      position_hint: event.playerLane != null || event.sourceLane != null ? {
        player_lane: event.playerLane ?? null,
        source_lane: event.sourceLane ?? null,
        source_column: event.sourceColumn ?? null
      } : null,
      motion_hint: event.sourceAttackMode || event.attackMode || null,
      audio_hint: null,
      confidence: 'medium',
      source_note: `promoted from Aurora harness runtime event ${event.type}`
    });
  }

  if(allowed.has('challenge_enemy_path') && !promoted.some(event => event.event_family === 'challenge_enemy_path')){
    const sample = samples.find(next => next.challengeEnemyCount > 0);
    if(sample){
      promoted.push({
        event_id: `${win.window_id}-${String(promoted.length + 1).padStart(3, '0')}-challenge_enemy_path`,
        event_family: 'challenge_enemy_path',
        runtime_type: 'challenge_formation_sample',
        time_s: sample.t,
        duration_s: null,
        entity_family: 'challenge_enemy',
        entity_id: null,
        position_hint: { challenge_enemy_count: sample.challengeEnemyCount },
        motion_hint: 'sampled challenge formation path evidence',
        audio_hint: null,
        confidence: 'medium',
        source_note: 'promoted from deterministic challengeFormationState sample'
      });
    }
  }

  const byTime = promoted.sort((a, b) => (a.time_s ?? 999999) - (b.time_s ?? 999999));
  return {
    schema_version: 1,
    status: 'events-observed',
    generated_by: 'tools/harness/run-aurora-evidence-window-cycle.js',
    game_lineage: 'aurora-galactica',
    target_game: 'aurora-galactica',
    window_id: win.window_id,
    scenario: scenario.name,
    seed: scenario.seed,
    duration_s: scenario.duration,
    source_kind: win.source_kind,
    needs_waveform: Boolean(win.needs_waveform),
    event_family_coverage: (win.event_families || []).map(family => ({
      family,
      observed: byTime.some(event => event.event_family === family)
    })),
    events: byTime
  };
}

function traceCsv(samples){
  const cols = ['t', 'stage', 'challenge', 'score', 'lives', 'player_x', 'player_vx', 'enemies', 'attackers', 'enemy_bullets', 'player_bullets', 'challenge_enemies'];
  return `${cols.join(',')}\n${samples.map(sample => cols.map(col => sample[col]).join(',')).join('\n')}\n`;
}

function scale(value, min, max, height){
  if(max <= min) return height / 2;
  return height - ((value - min) / (max - min)) * height;
}

function pathFor(samples, getX, getY){
  return samples.map((sample, index) => `${index ? 'L' : 'M'}${getX(sample).toFixed(1)},${getY(sample).toFixed(1)}`).join(' ');
}

function traceSvg(samples, title){
  const width = 900;
  const height = 320;
  const pad = 44;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  const maxT = Math.max(1, ...samples.map(s => s.t));
  const maxPressure = Math.max(1, ...samples.map(s => Math.max(s.attackers, s.enemy_bullets, s.player_bullets, s.challenge_enemies)));
  const x = sample => pad + (sample.t / maxT) * plotW;
  const yPlayer = sample => pad + scale(sample.player_x, 0, 280, plotH);
  const yPressure = sample => pad + scale(Math.max(sample.attackers, sample.enemy_bullets, sample.challenge_enemies), 0, maxPressure, plotH);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#101418"/>
  <text x="${pad}" y="24" fill="#eef3f6" font-family="monospace" font-size="15">${title}</text>
  <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#34404a"/>
  <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="#34404a"/>
  <path d="${pathFor(samples, x, yPlayer)}" fill="none" stroke="#73c2fb" stroke-width="2"/>
  <path d="${pathFor(samples, x, yPressure)}" fill="none" stroke="#f4c95d" stroke-width="2"/>
  <text x="${pad}" y="${height - 14}" fill="#a9b7c0" font-family="monospace" font-size="12">blue: player x, gold: pressure max</text>
</svg>
`;
}

function audioTimelineSvg(audioCues, title){
  const width = 900;
  const height = 150;
  const pad = 36;
  const maxT = Math.max(1, ...audioCues.map(cue => cue.t || 0));
  const x = time => pad + (time / maxT) * (width - pad * 2);
  const rows = ['stageStart', 'stagePulse', 'shipLost', 'challengeClear', 'stageClear', 'other'];
  const yFor = cue => {
    const key = rows.includes(cue.cue) ? cue.cue : 'other';
    return pad + rows.indexOf(key) * 16;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#101418"/>
  <text x="${pad}" y="22" fill="#eef3f6" font-family="monospace" font-size="14">${title}</text>
  <line x1="${pad}" y1="${height - 24}" x2="${width - pad}" y2="${height - 24}" stroke="#34404a"/>
  ${rows.map((row, index) => `<text x="6" y="${pad + index * 16 + 4}" fill="#a9b7c0" font-family="monospace" font-size="10">${row}</text>`).join('\n  ')}
  ${audioCues.map(cue => `<circle cx="${x(cue.t || 0).toFixed(1)}" cy="${yFor(cue)}" r="4" fill="#60d394"><title>${cue.cue || 'audio'} ${cue.t}</title></circle>`).join('\n  ')}
</svg>
`;
}

function runFfmpeg(args, label){
  const result = spawnSync('ffmpeg', ['-y', ...args], { cwd: ROOT, encoding: 'utf8' });
  if(result.status !== 0){
    throw new Error(`${label} failed: ${result.stderr || result.stdout}`);
  }
}

function makeContactSheet(framesDir, outFile){
  runFfmpeg([
    '-pattern_type', 'glob',
    '-i', path.join(framesDir, 'sample-*.png'),
    '-vf', 'scale=220:-1,tile=5x4:padding=8:margin=8:color=0x101418',
    '-frames:v', '1',
    outFile
  ], `contact sheet ${rel(outFile)}`);
}

async function captureSample(page, outFile, t){
  await page.locator('#playfieldFrame').screenshot({ path: outFile });
  return page.evaluate(sampleT => {
    const api = window.__galagaHarness__;
    const snap = api.snapshot();
    const formation = api.formationState();
    const challenge = api.challengeFormationState();
    const state = api.state();
    return {
      t: +sampleT.toFixed(3),
      stage: snap.stage,
      challenge: snap.challenge ? 1 : 0,
      score: snap.score,
      lives: snap.lives,
      player_x: snap.player.x,
      player_vx: snap.player.vx,
      enemies: snap.counts.enemies,
      attackers: snap.counts.attackers,
      enemy_bullets: snap.counts.enemyBullets,
      player_bullets: snap.counts.playerBullets,
      challenge_enemies: challenge.enemies.length,
      formation_active: formation.targets.length,
      audioCue: state.audioCue || null,
      stagePresentation: state.stagePresentation || null,
      visualAtmosphere: state.visualAtmosphere || null,
      challengeEnemyCount: challenge.enemies.length
    };
  }, t);
}

async function runWindow({ browser, serverPort, plan, win, scenarioName }){
  const scenario = readJson(scenarioPath(scenarioName));
  scenario.name = scenario.name || scenarioName;
  const windowRoot = path.join(ROOT, plan.output_root, win.window_id);
  const framesDir = path.join(windowRoot, 'frames');
  const traceDir = path.join(windowRoot, 'trace');
  const audioDir = path.join(windowRoot, 'audio');
  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(traceDir, { recursive: true });
  fs.mkdirSync(audioDir, { recursive: true });

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
  await page.goto(`http://127.0.0.1:${serverPort}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__galagaHarness__);
  await page.evaluate(cfg => window.__galagaHarness__.start(Object.assign({}, cfg.config, {
    seed: cfg.seed,
    autoVideo: false,
    controlledClock: true
  })), scenario);

  const samples = [];
  const captures = [];
  const actions = [...(scenario.actions || [])].sort((a, b) => a.t - b.t);
  const captureTimes = [];
  for(let t = 0; t <= scenario.duration + 0.001; t += 1) captureTimes.push(+t.toFixed(3));
  if(!captureTimes.includes(scenario.duration)) captureTimes.push(scenario.duration);
  captureTimes.sort((a, b) => a - b);

  let current = 0;
  let actionIndex = 0;
  let captureIndex = 0;
  const down = new Set();
  while(captureIndex < captureTimes.length || actionIndex < actions.length){
    const nextCapture = captureIndex < captureTimes.length ? captureTimes[captureIndex] : Infinity;
    const nextAction = actionIndex < actions.length ? actions[actionIndex].t : Infinity;
    const next = Math.min(nextCapture, nextAction, scenario.duration);
    await advance(page, next - current);
    current = next;
    if(nextCapture <= nextAction && nextCapture <= scenario.duration){
      const file = path.join(framesDir, `sample-${String(captureIndex).padStart(3, '0')}.png`);
      samples.push(await captureSample(page, file, current));
      captures.push({ t: current, file: rel(file) });
      captureIndex++;
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
  const finalState = await page.evaluate(() => window.__galagaHarness__.state());
  const events = await page.evaluate(() => window.__galagaHarness__.recentEvents({ count: 200 }));
  await context.close();

  const firstFrame = path.join(framesDir, 'sample-000.png');
  const midFrame = path.join(framesDir, `sample-${String(Math.floor((captures.length - 1) / 2)).padStart(3, '0')}.png`);
  const endFrame = path.join(framesDir, `sample-${String(captures.length - 1).padStart(3, '0')}.png`);
  copyFile(firstFrame, path.join(framesDir, 'still-start.png'));
  copyFile(midFrame, path.join(framesDir, 'still-mid.png'));
  copyFile(endFrame, path.join(framesDir, 'still-end.png'));
  makeContactSheet(framesDir, path.join(framesDir, 'contact-sheet-1s.png'));

  const audioCues = events
    .filter(event => event.type === 'audio_cue')
    .map(event => ({ t: event.t, cue: event.cue, referenceClip: event.referenceClip || null }));
  writeText(path.join(audioDir, 'audio-cue-timeline.svg'), audioTimelineSvg(audioCues, `${win.window_id} audio cue timeline`));
  writeJson(path.join(audioDir, 'audio-cue-timeline.json'), {
    schema_version: 1,
    status: 'audio-cue-event-timeline',
    note: 'The deterministic evidence cycle captures audio cue timing from runtime events. Browser video capture did not provide a reliable audio stream on this MacBook cycle.',
    audio_cues: audioCues
  });
  writeText(path.join(audioDir, 'WAVEFORM_CAPTURE_NOTE.md'), `# Waveform Capture Note\n\nBrowser MediaRecorder video captures on this MacBook did not include a reliable audio stream for this cycle. The evidence window therefore preserves runtime audio-cue timing as \`audio-cue-timeline.svg\` and \`audio-cue-timeline.json\` until a source with captured audio is available.\n`);

  const traceSummary = {
    sample_count: samples.length,
    player_x_min: Math.min(...samples.map(sample => sample.player_x)),
    player_x_max: Math.max(...samples.map(sample => sample.player_x)),
    player_x_range: +(Math.max(...samples.map(sample => sample.player_x)) - Math.min(...samples.map(sample => sample.player_x))).toFixed(3),
    max_attackers: Math.max(...samples.map(sample => sample.attackers)),
    max_enemy_bullets: Math.max(...samples.map(sample => sample.enemy_bullets)),
    max_player_bullets: Math.max(...samples.map(sample => sample.player_bullets)),
    max_challenge_enemies: Math.max(...samples.map(sample => sample.challenge_enemies)),
    final_score: finalState.score,
    final_lives: finalState.lives,
    final_stage: finalState.stage,
    final_challenge: finalState.challenge
  };
  writeJson(path.join(traceDir, 'trace.json'), {
    schema_version: 1,
    generated_by: 'tools/harness/run-aurora-evidence-window-cycle.js',
    window_id: win.window_id,
    scenario: scenario.name,
    seed: scenario.seed,
    duration_s: scenario.duration,
    summary: traceSummary,
    captures,
    samples
  });
  writeText(path.join(traceDir, 'trace.csv'), traceCsv(samples));
  writeText(path.join(traceDir, 'player-pressure.svg'), traceSvg(samples, `${win.window_id} player and pressure trace`));

  const eventLog = promoteEvents({ win, scenario, events, samples });
  writeJson(path.join(windowRoot, 'events', 'reference-events.json'), eventLog);
  writeJson(path.join(windowRoot, 'source-manifest.json'), {
    schema_version: 1,
    status: 'deterministic-harness-capture',
    generated_by: 'tools/harness/run-aurora-evidence-window-cycle.js',
    window_id: win.window_id,
    scenario: scenario.name,
    scenario_path: rel(scenarioPath(scenarioName)),
    seed: scenario.seed,
    duration_s: scenario.duration,
    config: scenario.config,
    output_root: rel(windowRoot),
    final_state: finalState,
    trace_summary: traceSummary,
    event_count: events.length,
    promoted_event_count: eventLog.events.length,
    artifacts: {
      contact_sheet_1s: rel(path.join(framesDir, 'contact-sheet-1s.png')),
      still_start: rel(path.join(framesDir, 'still-start.png')),
      still_mid: rel(path.join(framesDir, 'still-mid.png')),
      still_end: rel(path.join(framesDir, 'still-end.png')),
      trace_json: rel(path.join(traceDir, 'trace.json')),
      trace_csv: rel(path.join(traceDir, 'trace.csv')),
      trace_svg: rel(path.join(traceDir, 'player-pressure.svg')),
      audio_timeline_svg: rel(path.join(audioDir, 'audio-cue-timeline.svg')),
      audio_timeline_json: rel(path.join(audioDir, 'audio-cue-timeline.json'))
    }
  });
  writeText(path.join(windowRoot, 'PLAYABLE_SLICE_NOTE.md'), playableNote(win, scenario, traceSummary, eventLog));
  writeText(path.join(windowRoot, 'HARNESS_TARGETS.md'), harnessTargets(win, eventLog));

  return {
    window_id: win.window_id,
    scenario: scenario.name,
    seed: scenario.seed,
    sample_count: samples.length,
    event_count: events.length,
    promoted_event_count: eventLog.events.length,
    trace_summary: traceSummary
  };
}

function playableNote(win, scenario, traceSummary, eventLog){
  const coverage = eventLog.event_family_coverage
    .map(item => `- \`${item.family}\`: ${item.observed ? 'observed' : 'not observed in this run'}`)
    .join('\n');
  return `# ${win.window_id} Playable Slice Note\n\n`
    + `Status: deterministic harness evidence captured\n\n`
    + `Scenario: \`${scenario.name}\`\n\n`
    + `Seed: \`${scenario.seed}\`\n\n`
    + `Duration: ${scenario.duration}s\n\n`
    + `## Trace Summary\n\n`
    + `- samples: ${traceSummary.sample_count}\n`
    + `- player x range: ${traceSummary.player_x_range}\n`
    + `- max attackers: ${traceSummary.max_attackers}\n`
    + `- max enemy bullets: ${traceSummary.max_enemy_bullets}\n`
    + `- max challenge enemies: ${traceSummary.max_challenge_enemies}\n`
    + `- final stage: ${traceSummary.final_stage}\n`
    + `- final score: ${traceSummary.final_score}\n\n`
    + `## Event Coverage\n\n${coverage}\n\n`
    + `## Implementation Use\n\n`
    + `Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.\n`;
}

function harnessTargets(win, eventLog){
  const missing = eventLog.event_family_coverage.filter(item => !item.observed).map(item => item.family);
  const observed = eventLog.event_family_coverage.filter(item => item.observed).map(item => item.family);
  return `# ${win.window_id} Harness Targets\n\n`
    + `## Observed Targets\n\n`
    + `${observed.map(item => `- assert \`${item}\` appears in the window event log`).join('\n') || '- none yet'}\n\n`
    + `## Missing Or Follow-Up Targets\n\n`
    + `${missing.map(item => `- create a scenario or source window that observes \`${item}\``).join('\n') || '- all planned event families observed in this pass'}\n\n`
    + `## First Candidate Check\n\n`
    + `A future harness should load the same scenario seed, run the deterministic window, and compare player range, max pressure, and event-family coverage against \`trace/trace.json\` and \`events/reference-events.json\`.\n`;
}

async function main(){
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))) throw new Error('Built app missing. Run npm run build first.');
  const plan = readJson(PLAN_PATH);
  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();
  try{
    const results = [];
    for(const win of plan.windows || []){
      const scenarioName = WINDOW_SCENARIOS[win.window_id];
      if(!scenarioName) continue;
      results.push(await runWindow({ browser, serverPort: port, plan, win, scenarioName }));
    }
    const summary = {
      schema_version: 1,
      status: 'aurora-evidence-windows-captured',
      generated_by: 'tools/harness/run-aurora-evidence-window-cycle.js',
      generated_at: new Date().toISOString(),
      window_count: results.length,
      results
    };
    writeJson(path.join(ROOT, plan.output_root, 'aurora-evidence-window-cycle-summary.json'), summary);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});

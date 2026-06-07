#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { analyze } = require('./analyze-run');
const { writePortableSummary, portablePath } = require('./summary-path-util');
const { ensureUsableVideoArtifact } = require('./video-artifact-util');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_DEV } = require('../build/paths');
const { LOCAL_BIND_HOST, localUrl } = require('../dev/local-host-config');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_ROOT = DIST_DEV;
const DEFAULT_OUT = path.join(ROOT, 'harness-artifacts');
const SCENARIOS = path.join(__dirname, 'scenarios');

function parseArgs(argv){
  const args = {};
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i+1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.mp4')) return 'video/mp4';
  if(file.endsWith('.mov')) return 'video/quicktime';
  if(file.endsWith('.webm')) return 'video/webm';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}

function serve(root){
  const server = http.createServer((req,res)=>{
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = clean === '/' ? '/index.html' : clean;
    const file = path.resolve(root, '.' + rel);
    if(!file.startsWith(root)) return res.writeHead(403).end('forbidden');
    fs.readFile(file,(err,data)=>{
      if(err) return res.writeHead(404).end('not found');
      res.writeHead(200, {'content-type': mime(file), 'cache-control': 'no-store'});
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(0, LOCAL_BIND_HOST, () => resolve({server, port: server.address().port}));
  });
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function rel(file){
  return file ? portablePath(path.resolve(file)) : null;
}

function personaDisplayName(key=''){
  switch(String(key || '').toLowerCase()){
    case 'advanced': return 'Intermediate';
    case 'novice': return 'Novice';
    case 'expert': return 'Expert';
    case 'professional': return 'Professional';
    default: return key || null;
  }
}

function latestFileStem(summary){
  const persona = String(summary.persona || '').trim().toLowerCase();
  return persona ? `${summary.name}-${persona}` : summary.name;
}

function personaAliasStem(summary){
  const label = personaDisplayName(summary.persona || '');
  if(!label) return null;
  const slug = String(label).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if(!slug || slug === String(summary.persona || '').trim().toLowerCase()) return null;
  return `${summary.name}-${slug}`;
}

function pickFile(files, predicate){
  return (files || []).find(predicate) || null;
}

function maxStageFromAnalysis(analysis){
  const stageKeys = Object.keys(analysis?.stageMetrics || {})
    .map(value => +value)
    .filter(value => Number.isFinite(value) && value > 0);
  return stageKeys.length ? Math.max(...stageKeys) : (+analysis?.stageClears?.slice(-1)?.[0]?.stage || 0);
}

function topLossCause(analysis){
  const entries = Object.entries(analysis?.lossCauseCounts || {});
  if(!entries.length) return null;
  entries.sort((a,b) => b[1] - a[1]);
  return { cause: entries[0][0], count: entries[0][1] };
}

function buildLatestRunDigest(outDir, summary){
  const files = summary.files || [];
  const state = summary.state || {};
  const analysis = summary.analysis || {};
  const personaKey = String(summary.persona || '').trim().toLowerCase() || null;
  const personaLabel = personaDisplayName(personaKey);
  const topCause = topLossCause(analysis);
  const endedByGameOver = +((analysis?.eventCounts || {}).game_over || 0) > 0;
  const missionComplete = +((analysis?.eventCounts || {}).mission_complete || 0) > 0;
  const maxStageReached = maxStageFromAnalysis(analysis);
  const shipLosses = Array.isArray(analysis.shipLost) ? analysis.shipLost.length : 0;
  const stageClears = Array.isArray(analysis.stageClears) ? analysis.stageClears.length : 0;
  const challengeClears = Array.isArray(analysis.challengeClears) ? analysis.challengeClears.length : 0;
  const stageAdvances = +((analysis?.eventCounts || {}).stage_advance || 0);
  const score = +state.score || 0;
  const lives = +state.lives || 0;
  const simT = +state.simT || 0;
  const watchMode = !!state.watchMode;
  const watchPersona = state.watchPersona || null;
  const watchScope = state.watchScope || null;
  const gameOver = endedByGameOver || (!!state.gameOver && !missionComplete);
  return {
    name: summary.name,
    personaKey,
    personaLabel,
    updatedAt: new Date().toISOString(),
    runDir: rel(outDir),
    summaryFile: rel(path.join(outDir, 'summary.json')),
    source: summary.source,
    duration: summary.duration,
    seed: summary.seed,
    sessionFile: rel(pickFile(files, file => file.endsWith('.json') && !file.endsWith('-system-status.json'))),
    systemStatusFile: rel(pickFile(files, file => file.endsWith('-system-status.json'))),
    videoFile: rel(pickFile(files, file => file.endsWith('.webm') && !file.endsWith('.review.webm'))),
    reviewVideoFile: rel(pickFile(files, file => file.endsWith('.review.webm'))),
    artifactQuality: summary.artifactQuality || null,
    maxStageReached,
    score,
    lives,
    simTime: simT,
    shipLosses,
    stageClears,
    challengeClears,
    stageAdvances,
    topLossCause: topCause,
    gameOver,
    missionComplete,
    watchMode,
    watchPersona,
    watchScope,
    state: {
      stage: +state.stage || 0,
      score,
      lives,
      simT,
      started: !!state.started,
      watchMode,
      watchPersona,
      watchScope,
      gameOver,
      missionComplete
    },
    metrics: {
      maxStageReached,
      shipLosses,
      stageClears,
      challengeClears,
      stageAdvances,
      topLossCause: topCause,
      bulletPressureOverall: analysis.bulletPressure?.overall || null,
      lossCauseCounts: analysis.lossCauseCounts || {},
      eventCounts: analysis.eventCounts || {}
    }
  };
}

function latestRunMarkdown(digest){
  const topCause = digest.metrics?.topLossCause;
  const lines = [
    `# Latest Guardians Full-Run Review`,
    ``,
    `- Persona: ${digest.personaLabel || 'Unknown'}${digest.personaKey ? ` (\`${digest.personaKey}\`)` : ''}`,
    `- Stage reached: ${digest.metrics?.maxStageReached || digest.state?.stage || 0}`,
    `- Final score: ${digest.state?.score || 0}`,
    `- Final lives field: ${digest.state?.lives || 0}`,
    `- Sim time: ${digest.state?.simT || 0}s`,
    `- Ship losses: ${digest.metrics?.shipLosses || 0}`,
    `- Stage clears: ${digest.metrics?.stageClears || 0}`,
    `- Challenge clears: ${digest.metrics?.challengeClears || 0}`,
    `- Top loss cause: ${topCause ? `${topCause.cause} (${topCause.count})` : 'n/a'}`,
    `- Ended by game over: ${digest.state?.gameOver ? 'yes' : 'no'}`,
    `- Mission complete: ${digest.state?.missionComplete ? 'yes' : 'no'}`,
    `- Watch mode: ${digest.state?.watchMode ? 'on' : 'off'}`,
    `- Watch scope: ${digest.state?.watchScope || 'n/a'}`,
    `- Run folder: \`${digest.runDir || ''}\``,
    `- Summary file: \`${digest.summaryFile || ''}\``,
    `- Session file: \`${digest.sessionFile || ''}\``,
    `- Review video: \`${digest.reviewVideoFile || digest.videoFile || ''}\``
  ];
  return `${lines.join('\n')}\n`;
}

function writeLatestRunArtifacts(outBase, outDir, summary){
  const digest = buildLatestRunDigest(outDir, summary);
  const stem = latestFileStem(summary);
  const aliasStem = personaAliasStem(summary);
  writePortableSummary(path.join(outBase, 'latest.json'), digest);
  writePortableSummary(path.join(outBase, `${stem}-latest.json`), digest);
  fs.writeFileSync(path.join(outBase, 'latest.md'), latestRunMarkdown(digest));
  fs.writeFileSync(path.join(outBase, `${stem}-latest.md`), latestRunMarkdown(digest));
  if(aliasStem){
    writePortableSummary(path.join(outBase, `${aliasStem}-latest.json`), digest);
    fs.writeFileSync(path.join(outBase, `${aliasStem}-latest.md`), latestRunMarkdown(digest));
  }
  return digest;
}

function keyName(code){
  if(code === 'Space') return ' ';
  if(code.startsWith('Key')) return code.slice(3).toLowerCase();
  if(code.startsWith('Digit')) return code.slice(5);
  return code;
}

function pickPrimaryVideoFile(files, session){
  const videos = files.filter(file => file.endsWith('.webm'));
  if(!videos.length) return null;
  if(session?.id){
    const exact = videos.find(file => path.basename(file).includes(session.id));
    if(exact) return exact;
  }
  return videos.sort((a,b) => fs.statSync(b).size - fs.statSync(a).size)[0];
}

function inferConfig(session){
  const spawn = session.events.find(e => e.type === 'stage_spawn') || {};
  const snap = session.snapshots.find(s => s.tag === 'stage_spawn') || session.snapshots[0] || {};
  return {
    stage: Math.max(1, spawn.stage || snap.stage || 1),
    ships: Math.max(1, Math.min(9, snap.lives || 3)),
    challenge: !!spawn.challenge
  };
}

function hashString(input=''){
  let h = 2166136261;
  for(const ch of input){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function specFromSession(file){
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')).session;
  return {
    name: path.basename(file, '.json'),
    source: file,
    duration: Math.max(8, Math.ceil((raw.duration || 15) + 1)),
    config: inferConfig(raw),
    seed: raw.seed || hashString(raw.id || path.basename(file)),
    actions: raw.events
      .filter(e => e.type === 'key_down' || e.type === 'key_up')
      .map(e => ({ t: e.t || 0, action: e.type === 'key_down' ? 'down' : 'up', code: e.code }))
  };
}

function specFromScenario(file){
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cfg = raw.config || {};
  const config = Object.assign({}, cfg, {
    stage: Math.max(1, cfg.stage || 1),
    ships: Math.max(1, Math.min(9, cfg.ships || 3)),
    challenge: !!cfg.challenge,
    persona: cfg.persona || null,
    extendFirst: cfg.extendFirst,
    extendRecurring: cfg.extendRecurring,
    audioTheme: cfg.audioTheme,
    graphicsTheme: cfg.graphicsTheme,
    starfieldIntensity: cfg.starfieldIntensity,
    starfieldSpeed: cfg.starfieldSpeed
  });
  return {
    name: raw.name || path.basename(file, path.extname(file)),
    source: file,
    duration: Math.max(5, raw.duration || 20),
    stopOnGameOver: !!raw.stopOnGameOver,
    config,
    seed: (raw.seed >>> 0) || hashString(raw.name || path.basename(file)),
    actions: (raw.actions || []).map(a => ({
      t: a.t || 0,
      action: a.action || 'press',
      code: a.code || a.key || 'Space',
      hold: a.hold || 0.1,
      method: a.method || null,
      args: a.args || null
    }))
  };
}

async function replay(page, spec){
  const down = new Set();
  let at = 0;
  for(const action of spec.actions){
    const wait = Math.max(0, (action.t - at) * 1000);
    if(wait) await sleep(wait);
    if(action.action === 'harness'){
      await page.evaluate(({ method, args }) => {
        const api = window.__galagaHarness__;
        if(!api || typeof api[method] !== 'function') throw new Error(`Harness method not found: ${method}`);
        return api[method](args || {});
      }, { method: action.method, args: action.args || {} });
    }else{
      const key = keyName(action.code);
      if(action.action === 'down'){
      if(!down.has(key)){ await page.keyboard.down(key); down.add(key); }
      }else if(action.action === 'up'){
      if(down.has(key)){ await page.keyboard.up(key); down.delete(key); }
      }else{
      await page.keyboard.down(key);
      await sleep((action.hold || 0.08) * 1000);
      await page.keyboard.up(key);
      }
    }
    at = action.t;
  }
  for(const key of down) await page.keyboard.up(key);
  return at;
}

async function advanceDeterministically(page, seconds){
  const total = Math.max(0, +seconds || 0);
  if(!total) return await page.evaluate(() => window.__galagaHarness__.state());
  return page.evaluate(duration => {
    const api = window.__galagaHarness__;
    return api.advanceFor(duration, { step: 1 / 60, stopOnGameOver: true });
  }, total);
}

async function replayDeterministic(page, spec){
  const down = new Set();
  let at = 0;
  for(const action of spec.actions){
    const wait = Math.max(0, (action.t - at));
    if(wait) await advanceDeterministically(page, wait);
    if(action.action === 'harness'){
      await page.evaluate(({ method, args }) => {
        const api = window.__galagaHarness__;
        if(!api || typeof api[method] !== 'function') throw new Error(`Harness method not found: ${method}`);
        return api[method](args || {});
      }, { method: action.method, args: action.args || {} });
      at = action.t;
      continue;
    }

    const key = keyName(action.code);
    if(action.action === 'down'){
      if(!down.has(key)){
        await page.keyboard.down(key);
        down.add(key);
      }
    }else if(action.action === 'up'){
      if(down.has(key)){
        await page.keyboard.up(key);
        down.delete(key);
      }
    }else{
      await page.keyboard.down(key);
      await advanceDeterministically(page, action.hold || 0.08);
      await page.keyboard.up(key);
    }
    at = action.t;
  }
  for(const key of down) await page.keyboard.up(key);
  return at;
}

async function deterministicAdvance(page, spec){
  return page.evaluate(({ duration, stopOnGameOver }) => {
    const api = window.__galagaHarness__;
    if(!api || typeof api.advanceFor !== 'function') return null;
    return api.advanceFor(duration, { stopOnGameOver, step: 1/60 });
  }, { duration: spec.duration, stopOnGameOver: !!spec.stopOnGameOver });
}

async function waitForDownloads(list, count, timeoutMs){
  const until = Date.now() + timeoutMs;
  while(Date.now() < until){
    if(list.length >= count) return true;
    await sleep(200);
  }
  return false;
}

async function waitForRun(page, spec, replayTime){
  const finishAt = Date.now() + Math.max(15000, Math.max(0, spec.duration) * 3000);
  const targetSimT = Math.max(0, spec.duration);
  let state = await page.evaluate(() => window.__galagaHarness__.state());
  if(!spec.stopOnGameOver){
    while(Date.now() < finishAt){
      if(!state.started) return state;
      if((state.simT || 0) >= targetSimT) return state;
      await sleep(100);
      state = await page.evaluate(() => window.__galagaHarness__.state());
    }
    return page.evaluate(() => window.__galagaHarness__.state());
  }
  while(Date.now() < finishAt){
    await sleep(250);
    state = await page.evaluate(() => window.__galagaHarness__.state());
    if(!state.started) return state;
    if((state.simT || 0) >= targetSimT) return state;
  }
  return page.evaluate(() => window.__galagaHarness__.state());
}

async function finalizeArtifacts(page, downloads, spec, state){
  const wanted = spec.autoVideo === false ? 1 : 2;
  if(state.started || state.recording){
    await page.evaluate(name => window.__galagaHarness__.stop(name), spec.name);
    if(spec.autoVideo === false){
      await page.evaluate(() => window.__galagaHarness__.export());
    }
  }
  if(await waitForDownloads(downloads, wanted, 15000)) return;

  await page.evaluate(label => window.__galagaHarness__.exportAndReset({ label }), `${spec.name}_forced_export`);
  if(await waitForDownloads(downloads, wanted, 15000)) return;

  throw new Error(`Timed out waiting for ${wanted} downloads after forced export/reset, saw ${downloads.length}`);
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  if(args.help || (!args.session && !args.scenario)){
    console.log('Usage: npm run harness -- --session /absolute/path/to/session.json');
    console.log('   or: npm run harness -- --scenario /absolute/path/to/scenario.json');
    console.log('   or: npm run harness -- --scenario stage3-challenge');
    console.log('Optional: --persona novice|advanced|expert');
    console.log('Optional: --auto-video 0|1');
    process.exit(args.help ? 0 : 1);
  }
  const appRoot = args.root ? path.resolve(String(args.root)) : APP_ROOT;
  if(!fs.existsSync(path.join(appRoot, 'index.html'))){
    throw new Error(`Built app not found at ${appRoot}. Run "npm run build" first.`);
  }

  const scenarioPath = args.scenario && !String(args.scenario).includes(path.sep) ? path.join(SCENARIOS, `${args.scenario}.json`) : args.scenario;
  const spec = args.session ? specFromSession(path.resolve(args.session)) : specFromScenario(path.resolve(scenarioPath));
  if(args.seed) spec.seed = (+args.seed >>> 0) || spec.seed;
  if(args.persona) spec.config.persona = String(args.persona).toLowerCase();
  if(args['auto-video'] !== undefined) spec.autoVideo = !['0','false','no'].includes(String(args['auto-video']).toLowerCase());
  const deterministicReplay = !args.session && ['1','true','yes'].includes(String(args['deterministic-replay'] || '').toLowerCase());
  const outBase = path.resolve(args.out || DEFAULT_OUT);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runTag = `${process.pid}-${Math.random().toString(36).slice(2,8)}`;
  const personaTag = spec.config?.persona ? `-${String(spec.config.persona).toLowerCase()}` : '';
  const seedTag = spec.seed ? `-seed${spec.seed}` : '';
  const outDir = path.join(outBase, `${spec.name}${personaTag}${seedTag}-${stamp}-${runTag}`);
  fs.mkdirSync(outDir, { recursive: true });
  const initAutoVideo = spec.autoVideo === false ? '0' : '1';

  const { server, port } = await serve(appRoot);
  const browser = await launchHarnessBrowser({ headed: !!args.headed });

  try{
    const context = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1440, height: 1800 }
    });
    const page = await context.newPage();
    const downloads = [];
    page.on('download', d => downloads.push(d));

    await page.addInitScript(cfg => {
      localStorage.setItem('auroraGalacticaAutoVideo', cfg.autoVideo);
      localStorage.setItem('auroraGalacticaTestCfg', JSON.stringify(cfg));
      localStorage.setItem('auroraGalacticaHarnessSeed', String(cfg.seed >>> 0));
      localStorage.setItem('platinumAutoVideo', cfg.autoVideo);
      localStorage.setItem('platinumTestCfg', JSON.stringify(cfg));
      localStorage.setItem('platinumHarnessSeed', String(cfg.seed >>> 0));
    }, Object.assign({}, spec.config, { seed: spec.seed, autoVideo: initAutoVideo }));

    await page.goto(localUrl(port, '/index.html', { browser: true }), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__galagaHarness__);
    const autoVideo = spec.autoVideo !== false;
    const deterministicFastPath = !autoVideo && !!spec.config?.persona && (!spec.actions || spec.actions.length === 0);
    const startConfig = Object.assign({}, spec.config, {
      seed: spec.seed,
      autoVideo,
      controlledClock: deterministicFastPath || deterministicReplay
    });
    const initialSimTArg = args['initial-sim-t'];
    if(initialSimTArg !== undefined && Number.isFinite(+initialSimTArg)){
      startConfig.initialSimT = +initialSimTArg;
    }
    await page.evaluate(cfg => window.__galagaHarness__.start(cfg), startConfig);

    let state;
    if(deterministicFastPath){
      state = await deterministicAdvance(page, spec);
      if(!state){
        state = await waitForRun(page, spec, 0);
      }
    }else if(deterministicReplay){
      const replayTime = await replayDeterministic(page, spec);
      const remaining = Math.max(0, spec.duration - replayTime);
      state = await advanceDeterministically(page, remaining);
      if(!state){
        state = await page.evaluate(() => window.__galagaHarness__.state());
      }
    }else{
      const replayTime = await replay(page, spec);
      state = await waitForRun(page, spec, replayTime);
    }
    await finalizeArtifacts(page, downloads, spec, state);
    const saved = [];
    for(const download of downloads){
      const file = path.join(outDir, download.suggestedFilename());
      await download.saveAs(file);
      saved.push(file);
    }
    const sessionFile = saved.find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
    const session = sessionFile ? JSON.parse(fs.readFileSync(sessionFile, 'utf8')).session : null;
    const rawVideoFile = pickPrimaryVideoFile(saved, session);
    let artifactQuality = null;
    if(rawVideoFile){
      artifactQuality = ensureUsableVideoArtifact(rawVideoFile, session?.duration || 0);
      if(artifactQuality.repaired && artifactQuality.file && !saved.includes(artifactQuality.file)){
        saved.unshift(artifactQuality.file);
      }
    }
    await context.close();

    const summary = {
      name: spec.name,
      persona: spec.config?.persona || null,
      source: spec.source,
      duration: spec.duration,
      config: spec.config,
      seed: spec.seed,
      state,
      files: saved,
      artifactQuality
    };
    writePortableSummary(path.join(outDir, 'summary.json'), summary);
    summary.analysis = analyze(outDir);
    writePortableSummary(path.join(outDir, 'summary.json'), summary);
    summary.latest = writeLatestRunArtifacts(outBase, outDir, summary);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

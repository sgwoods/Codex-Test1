#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright-core');
const { analyze } = require('./analyze-run');

const ROOT = path.resolve(__dirname, '..', '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
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
    server.listen(0, '127.0.0.1', () => resolve({server, port: server.address().port}));
  });
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function keyName(code){
  if(code === 'Space') return ' ';
  if(code.startsWith('Key')) return code.slice(3).toLowerCase();
  if(code.startsWith('Digit')) return code.slice(5);
  return code;
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
  return {
    name: raw.name || path.basename(file, path.extname(file)),
    source: file,
    duration: Math.max(5, raw.duration || 20),
    config: {
      stage: Math.max(1, raw.config?.stage || 1),
      ships: Math.max(1, Math.min(9, raw.config?.ships || 3)),
      challenge: !!raw.config?.challenge
    },
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

async function waitForDownloads(list, count, timeoutMs){
  const until = Date.now() + timeoutMs;
  while(Date.now() < until){
    if(list.length >= count) return;
    await sleep(200);
  }
  throw new Error(`Timed out waiting for ${count} downloads, saw ${list.length}`);
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  if(args.help || (!args.session && !args.scenario)){
    console.log('Usage: npm run harness -- --session /absolute/path/to/session.json');
    console.log('   or: npm run harness -- --scenario /absolute/path/to/scenario.json');
    console.log('   or: npm run harness -- --scenario stage3-challenge');
    process.exit(args.help ? 0 : 1);
  }
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);

  const scenarioPath = args.scenario && !String(args.scenario).includes(path.sep) ? path.join(SCENARIOS, `${args.scenario}.json`) : args.scenario;
  const spec = args.session ? specFromSession(path.resolve(args.session)) : specFromScenario(path.resolve(scenarioPath));
  if(args.seed) spec.seed = (+args.seed >>> 0) || spec.seed;
  const outBase = path.resolve(args.out || DEFAULT_OUT);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(outBase, `${spec.name}-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  const { server, port } = await serve(ROOT);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: args.headed ? false : true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });

  try{
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();
    const downloads = [];
    page.on('download', d => downloads.push(d));

    await page.addInitScript(cfg => {
      localStorage.setItem('auroraGalacticaAutoVideo', '1');
      localStorage.setItem('auroraGalacticaTestCfg', JSON.stringify(cfg));
      localStorage.setItem('auroraGalacticaHarnessSeed', String(cfg.seed >>> 0));
    }, Object.assign({}, spec.config, { seed: spec.seed }));

    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__galagaHarness__);
    await page.evaluate(cfg => window.__galagaHarness__.start(Object.assign({ autoVideo: true }, cfg)), Object.assign({}, spec.config, { seed: spec.seed }));

    const replayTime = await replay(page, spec);
    const remain = Math.max(0, spec.duration - replayTime);
    if(remain) await sleep(remain * 1000);

    const state = await page.evaluate(() => window.__galagaHarness__.state());
    if(state.started) await page.evaluate(name => window.__galagaHarness__.stop(name), spec.name);

    await waitForDownloads(downloads, 2, 15000);
    const saved = [];
    for(const download of downloads.slice(0, 2)){
      const file = path.join(outDir, download.suggestedFilename());
      await download.saveAs(file);
      saved.push(file);
    }

    const summary = {
      name: spec.name,
      source: spec.source,
      duration: spec.duration,
      config: spec.config,
      seed: spec.seed,
      state,
      files: saved
    };
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
    summary.analysis = analyze(outDir);
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

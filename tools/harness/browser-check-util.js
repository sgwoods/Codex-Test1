const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright-core');
const { DIST_DEV } = require('../build/paths');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_ROOT = DIST_DEV;
const DEFAULT_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHROME = process.env.AURORA_CHROME_PATH || DEFAULT_CHROME;

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.webm')) return 'video/webm';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}

function serve(root = APP_ROOT){
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = clean === '/' ? '/index.html' : clean;
    const file = path.resolve(root, '.' + rel);
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

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withHarnessPage(cfg, fn){
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  const appRoot = cfg.root ? path.resolve(cfg.root) : APP_ROOT;
  if(!fs.existsSync(path.join(appRoot, 'index.html'))){
    throw new Error(`Built app not found at ${appRoot}. Run "npm run build" first.`);
  }
  const { server, port } = await serve(appRoot);
  let browser;
  try{
    browser = await chromium.launch({
      executablePath: CHROME,
      headless: cfg.headed ? false : true,
      args: ['--autoplay-policy=no-user-gesture-required']
    });
  }catch(err){
    const message = [
      'Aurora browser harness could not launch Google Chrome.',
      `Chrome path: ${CHROME}`,
      'Run "npm run harness:doctor:browser" from a normal local shell to isolate Chrome launch health.',
      'If this is running inside Codex and the doctor only fails there, rerun the browser harness with elevated/local execution.'
    ].join('\n');
    const wrapped = new Error(`${message}\n\n${err && err.stack ? err.stack : String(err)}`);
    wrapped.cause = err;
    throw wrapped;
  }
  try{
    const context = await browser.newContext({
      acceptDownloads: true,
      viewport: cfg.viewport || { width: 1440, height: 1800 }
    });
    const page = await context.newPage();
    const seed = (+cfg.seed >>> 0) || 1;
    const testCfg = {
      stage: Math.max(1, cfg.stage || 1),
      ships: Math.max(1, Math.min(9, cfg.ships || 3)),
      challenge: !!cfg.challenge,
      seed
    };
    if(cfg.extendFirst !== undefined) testCfg.extendFirst = Math.max(0, cfg.extendFirst || 0);
    if(cfg.extendRecurring !== undefined) testCfg.extendRecurring = Math.max(0, cfg.extendRecurring || 0);
    await page.addInitScript(local => {
      localStorage.setItem('auroraGalacticaAutoVideo', '0');
      localStorage.setItem('auroraGalacticaTestCfg', JSON.stringify(local.testCfg));
      localStorage.setItem('auroraGalacticaHarnessSeed', String(local.seed >>> 0));
      localStorage.setItem('platinumAutoVideo', '0');
      localStorage.setItem('platinumTestCfg', JSON.stringify(local.testCfg));
      localStorage.setItem('platinumHarnessSeed', String(local.seed >>> 0));
    }, { testCfg, seed });
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__galagaHarness__);
    if(!cfg.skipStart){
      await page.evaluate(startCfg => window.__galagaHarness__.start(Object.assign({ autoVideo: false }, startCfg)), Object.assign({
        stage: testCfg.stage,
        ships: testCfg.ships,
        challenge: testCfg.challenge,
        seed,
        persona: cfg.persona || null
      }, testCfg.extendFirst !== undefined ? { extendFirst: testCfg.extendFirst } : {}, testCfg.extendRecurring !== undefined ? { extendRecurring: testCfg.extendRecurring } : {}));
    }
    const result = await fn({ page, context, browser, port, root: appRoot });
    await context.close();
    return result;
  } finally {
    await browser.close();
    server.close();
  }
}

async function waitForHarness(page, predicate, timeoutMs = 4000, intervalMs = 50){
  const start = Date.now();
  while(Date.now() - start < timeoutMs){
    const value = await page.evaluate(predicate);
    if(value) return value;
    await sleep(intervalMs);
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for harness condition`);
}

async function capturePlayfieldRegion(page, clip){
  return page.evaluate(({ x, y, w, h }) => {
    const canvas = document.getElementById('c');
    const frame = document.getElementById('playfieldFrame');
    const ctx = canvas.getContext('2d');
    const canvasRect = canvas.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const scaleX = (frameRect.width - 4) / 280;
    const scaleY = (frameRect.height - 4) / 360;
    const screenX = frameRect.left + 2 + x * scaleX;
    const screenY = frameRect.top + 2 + y * scaleY;
    const screenW = w * scaleX;
    const screenH = h * scaleY;
    const sx = Math.max(0, Math.floor((screenX - canvasRect.left) * (canvas.width / canvasRect.width)));
    const sy = Math.max(0, Math.floor((screenY - canvasRect.top) * (canvas.height / canvasRect.height)));
    const sw = Math.max(1, Math.floor(screenW * (canvas.width / canvasRect.width)));
    const sh = Math.max(1, Math.floor(screenH * (canvas.height / canvasRect.height)));
    const data = ctx.getImageData(sx, sy, sw, sh).data;
    let count = 0;
    let minX = sw, minY = sh, maxX = -1, maxY = -1;
    for(let py = 0; py < sh; py++){
      for(let px = 0; px < sw; px++){
        const i = (py * sw + px) * 4;
        const a = data[i + 3];
        const sum = data[i] + data[i + 1] + data[i + 2];
        if(a > 0 && sum > 70){
          count++;
          if(px < minX) minX = px;
          if(py < minY) minY = py;
          if(px > maxX) maxX = px;
          if(py > maxY) maxY = py;
        }
      }
    }
    return {
      count,
      bbox: maxX >= 0 ? {
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1
      } : null
    };
  }, clip);
}

module.exports = {
  ROOT,
  APP_ROOT,
  CHROME,
  sleep,
  withHarnessPage,
  waitForHarness,
  capturePlayfieldRegion
};

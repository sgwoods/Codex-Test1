const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..', '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.webm')) return 'video/webm';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}

function serve(root = ROOT){
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
  const { server, port } = await serve(ROOT);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: cfg.headed ? false : true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
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
    await page.addInitScript(local => {
      localStorage.setItem('auroraGalacticaAutoVideo', '0');
      localStorage.setItem('auroraGalacticaTestCfg', JSON.stringify(local.testCfg));
      localStorage.setItem('auroraGalacticaHarnessSeed', String(local.seed >>> 0));
    }, { testCfg, seed });
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__galagaHarness__);
    await page.evaluate(startCfg => window.__galagaHarness__.start(Object.assign({ autoVideo: false }, startCfg)), {
      stage: testCfg.stage,
      ships: testCfg.ships,
      challenge: testCfg.challenge,
      seed,
      persona: cfg.persona || null
    });
    const result = await fn({ page, context, browser, port, root: ROOT });
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
  CHROME,
  sleep,
  withHarnessPage,
  waitForHarness,
  capturePlayfieldRegion
};

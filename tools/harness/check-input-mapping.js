#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright-core');
const { DIST_DEV } = require('../build/paths');

const APP_ROOT = DIST_DEV;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

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

async function open(page, port){
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__galagaHarness__.start({ stage: 1, ships: 3 }));
  await page.waitForFunction(() => {
    const state = window.__galagaHarness__.inputState();
    return state.started && state.spawn <= 0;
  }, null, { timeout: 5000 });
  await page.locator('#c').focus();
  await page.waitForTimeout(80);
}

async function moveWithKey(page, key){
  await page.evaluate(() => {
    if(window.__galagaHarness__?.resetInputState) window.__galagaHarness__.resetInputState('input-mapping-recenter');
    if(window.S?.p){
      window.S.p.x = window.PLAY_W / 2;
      window.S.p.vx = 0;
    }
  });
  await page.waitForTimeout(50);
  const before = await page.evaluate(() => window.__galagaHarness__.inputState());
  await page.keyboard.down(key);
  await page.waitForTimeout(140);
  await page.keyboard.up(key);
  await page.waitForTimeout(80);
  const after = await page.evaluate(() => window.__galagaHarness__.inputState());
  return {
    key,
    beforeX: before.playerX,
    afterX: after.playerX,
    delta: +(after.playerX - before.playerX).toFixed(2)
  };
}

async function main(){
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))){
    throw new Error(`Built dev app not found at ${APP_ROOT}. Run "npm run build" first.`);
  }

  const { server, port } = await serve(APP_ROOT);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
    const page = await context.newPage();
    await open(page, port);

    const mapping = await page.evaluate(() => window.__galagaHarness__.inputState());
    const expectedLeft = ['ArrowLeft', 'KeyA', 'KeyZ'];
    const expectedRight = ['ArrowRight', 'KeyD', 'KeyC'];
    if(JSON.stringify(mapping.leftCodes) !== JSON.stringify(expectedLeft)){
      fail('left movement mapping drifted from the hotfix contract', mapping);
    }
    if(JSON.stringify(mapping.rightCodes) !== JSON.stringify(expectedRight)){
      fail('right movement mapping drifted from the hotfix contract', mapping);
    }

    const keyMoves = [
      await moveWithKey(page, 'a'),
      await moveWithKey(page, 'z'),
      await moveWithKey(page, 'ArrowLeft'),
      await moveWithKey(page, 'd'),
      await moveWithKey(page, 'c'),
      await moveWithKey(page, 'ArrowRight')
    ];

    for(const result of keyMoves.slice(0, 3)){
      if(!(result.delta < -0.05)){
        fail('left-side key should move the ship left', { result, keyMoves });
      }
    }
    for(const result of keyMoves.slice(3)){
      if(!(result.delta > 0.05)){
        fail('right-side key should move the ship right', { result, keyMoves });
      }
    }

    await page.keyboard.down('d');
    await page.waitForTimeout(140);
    const beforeBlur = await page.evaluate(() => window.__galagaHarness__.inputState());
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.waitForTimeout(180);
    const afterBlur = await page.evaluate(() => window.__galagaHarness__.inputState());
    await page.keyboard.up('d');

    if(afterBlur.keys.length){
      fail('blur should clear active movement keys so they cannot latch', { beforeBlur, afterBlur });
    }
    if(Math.abs(afterBlur.playerVx) > 0.01){
      fail('blur should clear horizontal motion during the hotfix input reset', { beforeBlur, afterBlur });
    }
    if((afterBlur.playerX - beforeBlur.playerX) > 2){
      fail('ship should not keep driving right after blur clears input', { beforeBlur, afterBlur });
    }

    console.log(JSON.stringify({
      ok: true,
      mapping: { left: mapping.leftCodes, right: mapping.rightCodes },
      keyMoves,
      blurReset: {
        beforeX: beforeBlur.playerX,
        afterX: afterBlur.playerX,
        afterVx: afterBlur.playerVx,
        keysAfter: afterBlur.keys
      }
    }, null, 2));

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

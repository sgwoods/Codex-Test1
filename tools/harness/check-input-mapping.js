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
  const before = await page.evaluate(() => window.__galagaHarness__.inputState());
  const startEvents = await page.evaluate(() => window.__galagaHarness__.recentEvents({ count: 200 }).length);
  await page.keyboard.down(key);
  await page.waitForTimeout(140);
  const mid = await page.evaluate(() => window.__galagaHarness__.inputState());
  await page.keyboard.up(key);
  await page.waitForTimeout(80);
  const after = await page.evaluate(() => window.__galagaHarness__.inputState());
  const recentEvents = await page.evaluate((startIndex) => {
    return window.__galagaHarness__
      .recentEvents({ count: 200 })
      .slice(startIndex)
      .filter(evt => evt.type === 'input_state_reset')
      .slice(-20);
  }, startEvents);
  return {
    key,
    beforeX: before.playerX,
    midX: mid.playerX,
    afterX: after.playerX,
    delta: +(after.playerX - before.playerX).toFixed(2),
    recentResetEvents: recentEvents
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
      if(!(result.delta <= -8)){
        fail('left-side key should move the ship left', { result, keyMoves });
      }
      if(result.recentResetEvents.length){
        fail('movement should not be interrupted by input resets during active play', { result, keyMoves });
      }
    }
    for(const result of keyMoves.slice(3)){
      if(result.key === ' ') continue;
      if(!(result.delta >= 8)){
        fail('right-side key should move the ship right', { result, keyMoves });
      }
      if(result.recentResetEvents.length){
        fail('movement should not be interrupted by input resets during active play', { result, keyMoves });
      }
    }

    await page.keyboard.down('d');
    await page.waitForTimeout(140);
    const beforeReset = await page.evaluate(() => window.__galagaHarness__.inputState());
    const afterReset = await page.evaluate(() => window.__galagaHarness__.resetInputState('harness_reset_check'));
    await page.keyboard.up('d');

    if(afterReset.keys.length){
      fail('input reset helper should clear active movement keys so they cannot latch', { beforeReset, afterReset });
    }
    if(Math.abs(afterReset.playerVx) > 0.01){
      fail('input reset helper should clear horizontal motion during the hotfix reset contract', { beforeReset, afterReset });
    }
    if((afterReset.playerX - beforeReset.playerX) > 2){
      fail('ship should not keep driving right after input reset clears movement', { beforeReset, afterReset });
    }

    console.log(JSON.stringify({
      ok: true,
      mapping: { left: mapping.leftCodes, right: mapping.rightCodes },
      keyMoves,
      inputReset: {
        beforeX: beforeReset.playerX,
        afterX: afterReset.playerX,
        afterVx: afterReset.playerVx,
        keysAfter: afterReset.keys
      }
    }, null, 2));

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

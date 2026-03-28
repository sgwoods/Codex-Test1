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

async function main(){
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))){
    throw new Error(`Built app not found at ${APP_ROOT}. Run "npm run build" first.`);
  }

  const { server, port } = await serve(APP_ROOT);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });

  try{
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => {
      const status = document.getElementById('leaderboardStatus')?.textContent || '';
      const summary = document.getElementById('accountSummary')?.textContent || '';
      return /read-only|fallback|local/i.test(status) && !!summary;
    }, { timeout: 4000 });

    const result = await page.evaluate(() => {
      const mineBtn = document.querySelector('#leaderboardViewButtons button[data-view="mine"]');
      return {
        releaseChannel: document.getElementById('buildStampChannel')?.textContent || '',
        status: document.getElementById('leaderboardStatus')?.textContent || '',
        accountSummary: document.getElementById('accountSummary')?.textContent || '',
        signupDisabled: !!document.getElementById('accountSignupBtn')?.disabled,
        loginDisabled: !!document.getElementById('accountLoginBtn')?.disabled,
        mineDisabled: !!mineBtn?.disabled,
        buildContainsSubmitBlockText: document.documentElement.innerHTML.includes('production submit disabled in this lane'),
        buildContainsReadOnlyText: document.documentElement.innerHTML.includes('Production scores mirrored read-only')
      };
    });

    if(/production$/i.test(String(result.releaseChannel || '').trim())){
      fail('non-production score-path check ran against a production lane', result);
    }
    if(!/read-only/i.test(result.status)){
      fail('non-production leaderboard did not advertise a read-only data path', result);
    }
    if(!/disabled in this lane/i.test(result.accountSummary)){
      fail('account panel did not explain the non-production account restriction', result);
    }
    if(!result.signupDisabled || !result.loginDisabled || !result.mineDisabled){
      fail('non-production lane still exposes account or personal-score actions that should be disabled', result);
    }
    if(!result.buildContainsSubmitBlockText || !result.buildContainsReadOnlyText){
      fail('built non-production lane no longer contains the expected submit-block or read-only messaging', result);
    }

    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

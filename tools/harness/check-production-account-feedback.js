#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_PRODUCTION } = require('../build/paths');

const APP_ROOT = DIST_PRODUCTION;

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
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))){
    throw new Error(`Built production app not found at ${APP_ROOT}. Run "npm run promote:production" first.`);
  }

  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.click('#accountDockBtn');
    await page.waitForTimeout(250);

    await page.click('#accountLoginBtn');
    await page.waitForTimeout(250);
    const emptySummary = await page.locator('#accountSummary').textContent();

    await page.fill('#accountEmail', 'invalid-email');
    await page.fill('#accountPassword', 'badpass123');
    await page.click('#accountLoginBtn');
    await page.waitForTimeout(1200);
    const invalidSummary = await page.locator('#accountSummary').textContent();

    const result = await page.evaluate(({ emptySummary, invalidSummary }) => ({
      channel: document.getElementById('buildStampChannel')?.textContent || '',
      signupDisabled: !!document.getElementById('accountSignupBtn')?.disabled,
      loginDisabled: !!document.getElementById('accountLoginBtn')?.disabled,
      emptySummary,
      invalidSummary
    }), { emptySummary, invalidSummary });

    if(!/production$/i.test(String(result.channel || '').trim())){
      fail('production account feedback check did not run against a production lane', result);
    }
    if(result.signupDisabled || result.loginDisabled){
      fail('production account actions should remain enabled', result);
    }
    if(!/enter (an|your) email and password first/i.test(result.emptySummary || '')){
      fail('production account panel no longer surfaces the missing-credentials message', result);
    }
    if(!/login failed/i.test(result.invalidSummary || '')){
      fail('production account panel no longer surfaces login failure feedback', result);
    }

    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

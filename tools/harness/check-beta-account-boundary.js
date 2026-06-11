#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_BETA } = require('../build/paths');
const { LOCAL_BIND_HOST, localUrl } = require('../dev/local-host-config');
const { ensureLaneBuildFresh } = require('./browser-check-util');

const APP_ROOT = DIST_BETA;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json';
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
    server.listen(0, LOCAL_BIND_HOST, () => resolve({ server, port: server.address().port }));
  });
}

async function main(){
  ensureLaneBuildFresh(APP_ROOT, { lane: 'beta', releaseChannel: 'production beta' });
  const indexPath = path.join(APP_ROOT, 'index.html');
  if(!fs.existsSync(indexPath)){
    throw new Error(`Built beta app not found at ${APP_ROOT}. Run "npm run promote:beta" first.`);
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();
    await page.goto(localUrl(port, '/index.html', { browser: true }), { waitUntil: 'networkidle' });
    await page.click('#accountDockBtn');
    await page.waitForTimeout(250);

    const result = await page.evaluate(() => ({
      channel: document.getElementById('buildStampChannel')?.textContent || '',
      dockLabel: document.getElementById('accountDockLabel')?.textContent || '',
      dockStatus: document.getElementById('accountDockStatus')?.textContent || '',
      pilotStatus: document.getElementById('accountPilotStatus')?.textContent || '',
      accountSummary: document.getElementById('accountSummary')?.textContent || '',
      signupDisabled: !!document.getElementById('accountSignupBtn')?.disabled,
      loginDisabled: !!document.getElementById('accountLoginBtn')?.disabled,
      resetDisabled: !!document.getElementById('accountResetBtn')?.disabled,
      emailDisabled: !!document.getElementById('accountEmail')?.disabled,
      passwordDisabled: !!document.getElementById('accountPassword')?.disabled
    }));

    if(!/production beta/i.test(String(result.channel || '').trim())){
      fail('beta account boundary check did not run against a beta lane', result);
    }
    if(!result.signupDisabled || !result.loginDisabled || !result.resetDisabled || !result.emailDisabled || !result.passwordDisabled){
      fail('beta account controls should remain disabled while public score writes await server-side validation', result);
    }
    if(!/sign-in is disabled|pilot sign-in disabled|keeps pilot sign-in disabled/i.test(`${result.pilotStatus} ${result.accountSummary}`)){
      fail('beta account panel should explain why pilot sign-in fields are disabled', result);
    }
    if(/Sign in when you want|Sign in for synced/i.test(`${result.pilotStatus} ${result.accountSummary}`)){
      fail('beta account panel still invites sign-in even though beta auth is disabled', result);
    }
    if(!/const TEST_ACCOUNT_EMAILS=\[\];/.test(html)){
      fail('beta artifact should not expose non-production test pilot emails', result);
    }

    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

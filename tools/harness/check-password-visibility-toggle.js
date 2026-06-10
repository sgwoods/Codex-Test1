#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_DEV } = require('../build/paths');
const { LOCAL_BIND_HOST, localUrl } = require('../dev/local-host-config');

const APP_ROOT = DIST_DEV;

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
    server.listen(0, LOCAL_BIND_HOST, () => resolve({ server, port: server.address().port }));
  });
}

async function main(){
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))){
    throw new Error(`Built app not found at ${APP_ROOT}. Run "npm run build" first.`);
  }

  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();

  try{
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 720, height: 820 } });
    const page = await context.newPage();
    await page.goto(localUrl(port, '/index.html', { browser: true }), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => {
      const status = document.getElementById('leaderboardStatus')?.textContent || '';
      const summary = document.getElementById('accountSummary')?.textContent || '';
      return /read-only|fallback|local/i.test(status) && !!summary;
    }, { timeout: 5000 });

    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(150);

    const initial = await page.evaluate(() => {
      const input = document.getElementById('accountPassword');
      const toggle = document.getElementById('accountPasswordToggle');
      const r = input?.getBoundingClientRect();
      const centerTarget = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
      return {
        accountSummary: document.getElementById('accountSummary')?.textContent || '',
        emailValue: document.getElementById('accountEmail')?.value || '',
        passwordDisabled: !!input?.disabled,
        passwordVisible: !!(input && input.offsetParent !== null),
        passwordType: input?.type || '',
        passwordWidth: r?.width || 0,
        centerTargetId: centerTarget?.id || '',
        centerTargetTag: centerTarget?.tagName || '',
        toggleDisabled: !!toggle?.disabled,
        toggleText: toggle?.textContent || '',
        toggleTitle: toggle?.title || ''
      };
    });

    await page.locator('#accountPassword').fill('codexProbe123');
    await page.locator('#accountPasswordToggle').click();
    await page.waitForTimeout(100);
    const afterShow = await page.evaluate(() => ({
      passwordType: document.getElementById('accountPassword')?.type || '',
      passwordValueLength: String(document.getElementById('accountPassword')?.value || '').length,
      toggleText: document.getElementById('accountPasswordToggle')?.textContent || '',
      toggleTitle: document.getElementById('accountPasswordToggle')?.title || ''
    }));

    await page.locator('#accountPasswordToggle').click();
    await page.waitForTimeout(100);
    const afterHide = await page.evaluate(() => ({
      passwordType: document.getElementById('accountPassword')?.type || '',
      passwordValueLength: String(document.getElementById('accountPassword')?.value || '').length,
      toggleText: document.getElementById('accountPasswordToggle')?.textContent || '',
      toggleTitle: document.getElementById('accountPasswordToggle')?.title || ''
    }));

    const result = { initial, afterShow, afterHide };

    if(!/test pilot lane active|local aurora galactica score path is available now/i.test(result.initial.accountSummary)){
      fail('pilot panel did not expose the non-production account lane', result);
    }
    if(result.initial.passwordDisabled || result.initial.toggleDisabled){
      fail('pilot password field or visibility toggle is disabled in the non-production account lane', result);
    }
    if(!result.initial.passwordVisible || result.initial.passwordWidth < 120){
      fail('pilot password field is not visibly accessible in the account panel', result);
    }
    if(result.initial.centerTargetId !== 'accountPassword'){
      fail('pilot password field center is not the active click target', result);
    }
    if(result.initial.passwordType !== 'password'){
      fail('password field did not start masked', result);
    }
    if(result.afterShow.passwordType !== 'text' || result.afterShow.passwordValueLength <= 0){
      fail('password field did not become visible and fillable after clicking the eye toggle', result);
    }
    if(result.afterHide.passwordType !== 'password' || result.afterHide.passwordValueLength <= 0){
      fail('password field did not re-mask after clicking the eye toggle again', result);
    }

    console.log(JSON.stringify({ ok:true, result }, null, 2));
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

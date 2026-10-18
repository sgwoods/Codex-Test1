#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const assert = require('assert/strict');
const { createHash } = require('crypto');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_BETA } = require('../build/paths');
const { LOCAL_BIND_HOST, localUrl } = require('../dev/local-host-config');
const { ensureLaneBuildFresh } = require('./browser-check-util');

const args = process.argv.slice(2);
const exactPackage = args.includes('--root') || args.includes('--expected-sha');
const rootIndex = args.indexOf('--root');
const shaIndex = args.indexOf('--expected-sha');
if(exactPackage){
  assert(rootIndex >= 0 && shaIndex >= 0, 'Exact package requires --root and --expected-sha');
  assert(args[rootIndex + 1] && !args[rootIndex + 1].startsWith('--'), 'Missing package root');
  assert(/^[a-f0-9]{40}$/.test(args[shaIndex + 1] || ''), 'Expected SHA must be a full source commit');
}
const APP_ROOT = exactPackage ? fs.realpathSync(args[rootIndex + 1]) : DIST_BETA;

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
  if(!exactPackage) ensureLaneBuildFresh(APP_ROOT, { lane: 'beta', releaseChannel: 'production beta' });
  else{
    const info = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'build-info.json'), 'utf8'));
    assert.equal(info.commit, args[shaIndex + 1], 'Exact-package source mismatch');
    assert.equal(info.releaseChannel, 'production beta', 'Exact package must be beta');
    assert.equal(info.dirty, false, 'Exact package must come from a clean source');
  }
  const indexPath = path.join(APP_ROOT, 'index.html');
  if(!fs.existsSync(indexPath)){
    throw new Error(`Built beta app not found at ${APP_ROOT}. Run "npm run promote:beta" first.`);
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const bundleHash = createHash('sha256').update(html).digest('hex');
  const remoteSubmitBlocked = html.includes('Remote score submit disabled in public lanes pending server-side validation');
  const checkedScoreRpc = html.includes("LEADERBOARD.client.rpc('submit_platform_score',")
    && !html.includes('scoreTableQuery(gameKey).insert(payload)')
    && html.includes("return !!LEADERBOARD.user?.id;");
  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();
    await page.goto(localUrl(port, '/index.html', { browser: true }), { waitUntil: 'networkidle' });
    await page.click('#accountDockBtn');
    await page.waitForTimeout(250);

    await page.fill('#accountEmail', 'pilot@example.com');
    await page.fill('#accountPassword', 'betaProbe123');

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
      passwordDisabled: !!document.getElementById('accountPassword')?.disabled,
      emailValue: document.getElementById('accountEmail')?.value || '',
      passwordValueLength: String(document.getElementById('accountPassword')?.value || '').length
    }));
    result.remoteSubmitBlocked = remoteSubmitBlocked;
    result.checkedScoreRpc = checkedScoreRpc;

    if(!/production beta/i.test(String(result.channel || '').trim())){
      fail('beta account boundary check did not run against a beta lane', result);
    }
    if(result.signupDisabled || result.loginDisabled || result.resetDisabled || result.emailDisabled || result.passwordDisabled){
      fail('beta account controls should remain enabled for normal pilot sign-in', result);
    }
    if(result.emailValue !== 'pilot@example.com' || result.passwordValueLength !== 'betaProbe123'.length){
      fail('beta account fields should be visible and fillable', result);
    }
    if(!/Sign in for synced|Sign in when you want/i.test(`${result.pilotStatus} ${result.accountSummary}`)){
      fail('beta account panel should invite normal pilot sign-in', result);
    }
    if(!/const TEST_ACCOUNT_EMAILS=\[\];/.test(html)){
      fail('beta artifact should not expose non-production test pilot emails', result);
    }
    if(!result.remoteSubmitBlocked&&!result.checkedScoreRpc){
      fail('beta artifact must block writes or use the signed-in checked score RPC; pair with the executable public scoring test', result);
    }

    assert.equal(createHash('sha256').update(fs.readFileSync(indexPath)).digest('hex'), bundleHash,
      'Account check changed the package');
    console.log(JSON.stringify({ ok: true, exactPackage, bundleHash, ...result }, null, 2));
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

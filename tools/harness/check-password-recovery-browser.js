#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { launchHarnessBrowser } = require('./browser-launch');
const { LOCAL_BIND_HOST, localOrigin } = require('../dev/local-host-config');
const rootAt = process.argv.indexOf('--root');
const root = path.resolve(rootAt >= 0 ? process.argv[rootAt + 1] : 'dist/dev');
const out = path.resolve('private-artifacts/password-recovery-oct17/browser', rootAt >= 0 ? 'explicit' : 'dev');

function providerFixture(){
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'pilot@example.invalid',
    email_confirmed_at: '2026-01-01T00:00:00Z', user_metadata: { display_initials: 'TST' } };
  let listener; let release; let session = null;
  const initial = new Promise(resolve => { release = resolve; });
  const fixture = { creates: 0, updates: 0, signouts: 0, events: [], unexpected: [], mode: 'error',
    emit(event, signedIn = true){
      if(!listener)throw Error('Auth listener not ready');
      session = signedIn ? { user } : null;
      this.events.push(event);
      const result = listener(event, session);
      if(result?.then)throw Error('Auth listener held the provider lock');
    },
    releaseSession(){ release({ data: { session: null } }); }
  };
  function query(table){
    const result = { data: table === 'profiles' ? { user_id: user.id, display_initials: 'TST' } : [], error: null };
    const chain = new Proxy({}, { get(target, name){
      if(name === 'then')return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      if(name === 'maybeSingle' || name === 'single')return async () => result;
      if(['select','eq','neq','not','order','limit','gte','gt','lte','lt','range','in'].includes(name))return () => chain;
      fixture.unexpected.push(`${table}.${String(name)}`);
      throw Error(`Unexpected provider query ${table}.${String(name)}`);
    } });
    return chain;
  }
  const fake = { createClient(){
    fixture.creates++;
    return { from: query, auth: {
      onAuthStateChange(callback){ listener = callback; return { data: { subscription: { unsubscribe(){} } } }; },
      getSession: () => initial,
      async updateUser(value){
        if(typeof value.password !== 'string' || Object.keys(value).length !== 1)throw Error('Unexpected auth mutation');
        fixture.updates++;
        if(fixture.mode === 'throw')throw Error('Fixture connection failure');
        if(fixture.mode === 'error')return { error: { message: 'Fixture rejected update' } };
        fixture.emit('USER_UPDATED'); return { data: { user }, error: null };
      },
      async signOut(){ fixture.signouts++; fixture.emit('SIGNED_OUT', false); return { error: null }; }
    } };
  } };
  Object.defineProperty(window, 'supabase', { configurable: true, get: () => fake, set(){} });
  window.__authFixture = fixture;
}

(async () => {
  fs.mkdirSync(out, { recursive: true, mode: 0o700 });
  const info = JSON.parse(fs.readFileSync(path.join(root, 'build-info.json')));
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if(!file.startsWith(root + path.sep)){ res.writeHead(403).end(); return; }
    fs.readFile(file, (error, bytes) => {
      if(error){ res.writeHead(404).end(); return; }
      const ext = path.extname(file);
      res.writeHead(200, { 'content-type': ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' })[ext] || 'application/octet-stream' });
      res.end(bytes);
    });
  });
  await new Promise(resolve => server.listen(0, LOCAL_BIND_HOST, resolve));
  const origin = localOrigin(server.address().port, { browser: true });
  let browser;
  const errors = [];
  const report = { build: info.label, channel: info.releaseChannel, source: info.commit,
    bundleHash: createHash('sha256').update(fs.readFileSync(path.join(root, 'index.html'))).digest('hex'),
    methodHash: createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
    limitations: ['Synthetic Supabase factory; no credentials, email tokens or real account mutation.',
      'Proves built UI/event handling, not live emailed-link or provider acceptance.'] };
  try{
    browser = await launchHarnessBrowser();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, serviceWorkers: 'block' });
    await context.addInitScript(providerFixture);
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort('blockedbyclient'));
    await context.routeWebSocket('**/*', socket => socket.close());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__authFixture?.creates === 1);
    await page.evaluate(() => window.__authFixture.emit('PASSWORD_RECOVERY'));
    await page.locator('#accountRecoveryFields').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#accountPanelTitle').textContent(), 'RESET PASSWORD');
    assert.equal(await page.locator('#accountApplyResetBtn').isEnabled(), true);
    await page.evaluate(() => window.__authFixture.releaseSession());
    for(const event of ['SIGNED_IN', 'TOKEN_REFRESHED'])await page.evaluate(event => window.__authFixture.emit(event), event);
    assert.equal(await page.locator('#accountRecoveryFields').isVisible(), true);
    await page.locator('#accountPanelClose').click();
    await page.locator('#accountDockBtn').click();
    assert.equal(await page.locator('#accountRecoveryFields').isVisible(), true);
    for(const [password, confirm] of [['', ''], ['short', 'short'], ['fixture-password', 'mismatch']]){
      await page.locator('#accountPassword').fill(password);
      await page.locator('#accountPasswordConfirm').fill(confirm);
      await page.locator('#accountApplyResetBtn').click();
      assert.equal(await page.evaluate(() => window.__authFixture.updates), 0);
    }
    await page.locator('#accountPassword').fill('fixture-password');
    await page.locator('#accountPasswordConfirm').fill('fixture-password');
    for(const mode of ['error', 'throw']){
      await page.evaluate(mode => { window.__authFixture.mode = mode; }, mode);
      await page.locator('#accountApplyResetBtn').click();
      await page.waitForFunction(() => document.querySelector('#accountSummary').textContent.includes('Could not update password'));
      assert.equal(await page.locator('#accountRecoveryFields').isVisible(), true);
      assert.equal(await page.locator('#accountApplyResetBtn').isEnabled(), true);
    }
    await page.screenshot({ path: path.join(out, 'recovery-form.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#accountApplyResetBtn').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'recovery-form-mobile.png'), fullPage: true });
    assert.equal(await page.locator('#accountCancelResetBtn').isVisible(), true);
    const buttons = await page.locator('#accountActions').boundingBox();
    const panel = await page.locator('#accountPanel').boundingBox();
    assert(buttons && panel && buttons.x >= panel.x && buttons.x + buttons.width <= panel.x + panel.width + 1);
    for(const id of ['accountApplyResetBtn', 'accountCancelResetBtn']){
      assert(await page.locator('#' + id).evaluate(button => {
        const r = button.getBoundingClientRect();
        return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('button') === button;
      }), `Mobile recovery action is covered: ${id}`);
    }
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.evaluate(() => { window.__authFixture.mode = 'success'; });
    await page.locator('#accountApplyResetBtn').click();
    await page.waitForFunction(() => document.querySelector('#accountSummary').textContent.includes('Password updated'));
    assert.equal(await page.locator('#accountRecoveryFields').isVisible(), false);
    assert.equal(await page.locator('#accountPassword').inputValue(), '');
    assert.equal(await page.locator('#accountPasswordConfirm').inputValue(), '');
    await page.evaluate(() => window.__authFixture.emit('TOKEN_REFRESHED'));
    assert.match(await page.locator('#accountSummary').textContent(), /Password updated/);
    await page.evaluate(() => window.__authFixture.emit('PASSWORD_RECOVERY'));
    await page.locator('#accountPassword').fill('discard-this');
    await page.locator('#accountCancelResetBtn').click();
    assert.equal(await page.locator('#accountRecoveryFields').isVisible(), false);
    assert.equal(await page.locator('#accountPassword').inputValue(), '');
    await page.evaluate(() => window.__authFixture.emit('TOKEN_REFRESHED'));
    assert.equal(await page.locator('#accountRecoveryFields').isVisible(), false);
    await page.evaluate(() => window.__authFixture.emit('PASSWORD_RECOVERY'));
    await page.locator('#accountLogoutBtn').click();
    await page.waitForFunction(() => window.__authFixture.signouts === 1);
    assert.equal(await page.locator('#accountRecoveryFields').isVisible(), false);
    const fixture = await page.evaluate(() => ({ creates: window.__authFixture.creates,
      updates: window.__authFixture.updates, signouts: window.__authFixture.signouts,
      events: window.__authFixture.events, unexpected: window.__authFixture.unexpected }));
    assert.equal(fixture.updates, 3); assert.equal(fixture.creates, 1); assert.deepEqual(errors, []);
    assert.deepEqual(fixture.unexpected, []);
    Object.assign(report, { ok: true, fixture, errors });
  }catch(error){ report.ok = false; report.failure = String(error.stack); process.exitCode = 1; }
  finally{
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
    if(browser)await browser.close(); await new Promise(resolve => server.close(resolve));
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });

#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { createHash } = require('crypto');
const { launchHarnessBrowser } = require('./browser-launch');
const { LOCAL_BIND_HOST, localOrigin } = require('../dev/local-host-config');

async function clickLiveControl(page, selector){
  const target = page.locator(selector);
  assert(await target.isVisible(), 'Control not visible: ' + selector);
  const box = await target.boundingBox();
  assert(box, 'Control has no bounds: ' + selector);
  // The front door redraws each frame; use real pointer coordinates, not DOM stability waits.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function audioSettings(page, setValues = false){
  if(await page.locator('#settingsBtn').isVisible())await page.locator('#settingsBtn').click();
  else await page.keyboard.press('KeyT');
  if(setValues){
    for(const [id, value] of [['musicVolume', '37'], ['gameSoundVolume', '46']]){
      await page.locator('#' + id).evaluate((input, value) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }
  }
  const values = await page.evaluate(() => Object.fromEntries(['musicVolume', 'gameSoundVolume'].map(id =>
    [id, { value: document.getElementById(id).value, label: document.getElementById(id + 'Value').textContent }])));
  assert.equal(values.musicVolume.value, '37');
  assert.equal(values.gameSoundVolume.value, '46');
  assert.match(values.musicVolume.label, /37/);
  assert.match(values.gameSoundVolume.label, /46/);
  await page.locator('#settingsPanelClose').click();
  return values;
}

async function normalFlows(page, game){
  // Advance ordinary RAF/timer callbacks, never assign gameplay state or invoke a harness.
  const guardians = game === 'galaxy-guardians-preview';
  if(guardians)await page.keyboard.down('Space');
  let elapsed = 0;
  for(; elapsed < 180; elapsed++){
    if(guardians){
      await page.keyboard.up(elapsed % 2 ? 'ArrowLeft' : 'ArrowRight');
      await page.keyboard.down(elapsed % 2 ? 'ArrowRight' : 'ArrowLeft');
    }
    await page.clock.runFor(1000);
    if(await page.locator('#msg.gameOverScreen').count())break;
  }
  if(guardians){
    await page.keyboard.up('Space');
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('ArrowRight');
  }
  assert(elapsed < 180, `${game}: ordinary end state not reached within 180 browser seconds`);
  const over = await page.locator('#msg').textContent();
  const overClock = await page.evaluate(game => game === 'galaxy-guardians-preview'
    ? currentGalaxyGuardiansDevPreviewState().t : currentAuroraRuntimeState().simT, game);
  const outcome = await page.evaluate(game => game === 'galaxy-guardians-preview'
    ? currentGalaxyGuardiansDevPreviewState().gameOverReason : 'ship-loss', game);
  const prompts = [];
  for(let attempt = 0; attempt < 4 && await page.locator('#msg.gameOverScreen').count(); attempt++){
    prompts.push(await page.locator('#msg').textContent());
    assert.match(prompts.at(-1), /Enter/i, 'End-state screen has no continue prompt');
    await page.keyboard.press('Enter');
    await page.clock.runFor(100);
  }
  assert.equal(await page.locator('#msg.gameOverScreen').count(), 0, 'Old game-over overlay retained');
  const restarted = await page.evaluate(game => ({ key: currentGamePackKey(),
    shell: getGameplayAdapter('aurora-galactica').snapshot(),
    owned: game === 'galaxy-guardians-preview' ? summarizeGalaxyGuardiansDevPreview() : null }), game);
  assert.equal(restarted.key, game);
  assert.equal(restarted.shell.started, true);
  if(game === 'galaxy-guardians-preview')assert(restarted.owned, 'Restart lost owned Guardians runtime');
  assert.equal((restarted.owned || restarted.shell).stage, 1);
  assert.equal((restarted.owned || restarted.shell).score, 0);
  const clock = () => page.evaluate(game => game === 'galaxy-guardians-preview'
    ? currentGalaxyGuardiansDevPreviewState().t : currentAuroraRuntimeState().simT, game);
  const resetTime = await clock();
  assert(resetTime >= 0 && resetTime < 2, 'Restart did not reset game clock');
  await page.clock.runFor(500);
  assert((await clock()) > resetTime + .1, 'Restarted runtime did not advance');
  await audioSettings(page);
  const flow = { endState: { reached: true, outcome, browserSeconds: elapsed + 1, simulationSeconds: overClock,
    input: guardians ? 'held fire with one-second alternating arrows' : 'idle human', text: over },
    restart: { passed: true, stage: 1, score: 0, resetTime, advancedTime: await clock(), prompts }, settingsPersisted: true };
  if(game !== 'aurora-galactica')return flow;
  // A new front door reached by normal navigation, with preferences retained.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.clock.runFor(100);
  await audioSettings(page);
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
  const watchLabels = page.locator('[data-watch-mode="1"] strong');
  for(let tries = 0; tries < 6; tries++){
    if(/professional/i.test(await watchLabels.nth(0).textContent()))break;
    await page.keyboard.press('BracketRight');
    await page.clock.runFor(20);
  }
  assert.match(await watchLabels.nth(0).textContent(), /professional/i);
  if(!/CHALLENGE TOUR/.test(await watchLabels.nth(1).textContent())){
    await clickLiveControl(page, '[data-watch-scope="next"]');
    await page.clock.runFor(20);
  }
  await page.keyboard.press('KeyW');
  await page.clock.runFor(100);
  const watchStart = await page.evaluate(() => {
    const s = currentAuroraRuntimeState();
    return { started: getGameplayAdapter('aurora-galactica').snapshot().started, stage: s.stage, watchMode: !!s.watchMode,
      persona: s.watchPersona, scope: s.watchScope, pilotMode: document.getElementById('accountDockBtn').dataset.pilotMode };
  });
  assert.deepEqual(watchStart, { started: true, stage: 3, watchMode: true,
    persona: 'professional', scope: 'challenges', pilotMode: 'watch' });
  let resultSeen = false, visibleResultSeen = false, nextSeen = false;
  const transitions = [];
  for(let second = 0; second < 45; second++){
    await page.clock.runFor(1000);
    const s = await page.evaluate(() => {
      const s = currentAuroraRuntimeState();
      return { stage: s.stage, mode: s.transitionMode, result: s.postChallengeT > 0,
        pendingStage: s.pendingStage, time: s.simT, watchMode: !!s.watchMode,
        persona: s.watchPersona, scope: s.watchScope, started: getGameplayAdapter('aurora-galactica').snapshot().started,
        resultText: document.getElementById('msg').textContent,
        resultVisible: !document.getElementById('msg').hidden &&
          getComputedStyle(document.getElementById('msg')).display !== 'none' &&
          getComputedStyle(document.getElementById('msg')).visibility !== 'hidden' };
    });
    transitions.push(s);
    resultSeen ||= s.result || s.mode === 'challengeResult';
    visibleResultSeen ||= s.resultVisible && /CHALLENGE COMPLETE|PERFECT BONUS/.test(s.resultText);
    if(s.stage === 7){ nextSeen = true; break; }
  }
  assert(resultSeen, 'Ordinary challenge result not observed');
  assert(visibleResultSeen, 'Ordinary challenge result was not displayed');
  assert(nextSeen, 'Ordinary Challenge Tour did not advance to Stage 7 within 45 browser seconds');
  const end = transitions.at(-1);
  assert.equal(end.started, true);
  assert.equal(end.watchMode, true);
  assert.equal(end.persona, 'professional');
  assert.equal(end.scope, 'challenges');
  await page.clock.runFor(500);
  assert((await clock()) > end.time + .1, 'Next challenge runtime did not advance');
  assert.equal(await page.evaluate(() => typeof window.__galagaHarness__), 'undefined');
  flow.watch = { start: watchStart, resultSeen, visibleResultSeen, nextSeen, transitions };
  return flow;
}

async function main(){
  const args = process.argv.slice(2);
  const rootArg = args[args.indexOf('--root') + 1];
  const expected = args[args.indexOf('--expected-sha') + 1];
  assert(args.includes('--root') && args.includes('--expected-sha'), 'Explicit package root and expected SHA required');
  const root = fs.realpathSync(rootArg);
  const flows = args.includes('--flows');
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const bundleHash = hash(path.join(root, 'index.html'));
  const info = JSON.parse(fs.readFileSync(path.join(root, 'build-info.json')));
  assert.equal(info.commit, expected);
  assert(['production', 'production beta'].includes(info.releaseChannel), 'Public package required');
  assert.equal(info.publicArtifactBoundaryEnabled, true);
  const server = http.createServer((req, res) => {
    try{
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = fs.realpathSync(path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname)));
      if(!file.startsWith(root + path.sep)) return res.writeHead(403).end();
      const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.png') ? 'image/png'
        : file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.json') ? 'application/json' : 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(fs.readFileSync(file));
    }catch{ res.writeHead(404).end(); }
  });
  let browser;
  const errors = [], missing = [], privateRequests = [], blocked = [], results = [], securityPages = [];
  try{
    await new Promise(resolve => server.listen(0, LOCAL_BIND_HOST, resolve));
    const origin = localOrigin(server.address().port, { browser: true });
    browser = await launchHarnessBrowser();
    const policyContext = await browser.newContext({ serviceWorkers: 'block' });
    try{
      await policyContext.route('**/*', route => new URL(route.request().url()).origin === origin
        ? route.continue() : route.abort('blockedbyclient'));
      await policyContext.routeWebSocket('**/*', socket => socket.close());
      const policyPage = await policyContext.newPage();
      for(const name of fs.readdirSync(root).filter(name => /\.html$/i.test(name))){
        const response = await policyPage.goto(`${origin}/${name}`, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, `${name}: HTML unavailable`);
        const policies = await policyPage.evaluate(() => ({
          csp: document.head.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || '',
          referrer: document.head.querySelector('meta[name="referrer"]')?.content || ''
        }));
        assert.match(policies.csp, /default-src 'self'/, `${name}: missing generated CSP`);
        assert.equal(policies.referrer, 'strict-origin-when-cross-origin', `${name}: missing referrer policy`);
        securityPages.push({ file: name, ...policies });
      }
      assert(securityPages.length > 0, 'No top-level HTML pages checked');
    }finally{ await policyContext.close(); }
    for(const game of ['galaxy-guardians-preview', 'aurora-galactica']){
      const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
      try{
        await context.route('**/*', route => {
          const url = new URL(route.request().url());
          if(url.origin === origin) return route.continue();
          blocked.push(url.origin);
          return route.abort('blockedbyclient');
        });
        assert.equal(typeof context.routeWebSocket, 'function', 'WebSocket interception required');
        await context.routeWebSocket('**/*', socket => socket.close());
        context.on('page', page => {
          page.on('pageerror', err => errors.push(String(err)));
          page.on('response', response => {
            if(response.url().startsWith(origin) && response.status() >= 400) missing.push(response.url());
          });
          page.on('requestfailed', request => {
            if(request.url().startsWith(origin)) missing.push(request.url());
          });
          page.on('request', request => {
            if(request.url().includes('/assets/reference-audio/')) privateRequests.push(request.url());
          });
        });
        const page = await context.newPage();
        if(flows)await page.clock.install();
        await page.goto(origin, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof currentGamePackKey === 'function' && currentGamePackKey() === 'aurora-galactica');
        assert(await page.locator('#c').isVisible());
        if(game === 'galaxy-guardians-preview'){
          for(const key of ['galaxy-guardians-preview', 'aurora-galactica', 'galaxy-guardians-preview']){
            await page.locator('#gamePickerDockBtn').click();
            await page.locator(`#gamePickerList [data-pack-key="${key}"]`).click();
            await page.waitForFunction(key => currentGamePackKey() === key, key);
          }
        }
        await page.locator('#settingsBtn').click();
        const gates = await page.evaluate(() => {
          // Dispatch reaches the bound listener even though the public control is disabled.
          const launch = document.getElementById('guardiansStageFiveLaunch');
          launch.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return {
            harnessAbsent: typeof window.__galagaHarness__ === 'undefined' && typeof window.__platinumHarness__ === 'undefined',
            reviewHidden: document.getElementById('guardiansStageFiveReview').hidden,
            reviewDisabled: launch.disabled,
            referenceDisabled: document.querySelector('#audioTheme option[value="galaga-reference-assets"]').disabled,
            started: getGameplayAdapter('aurora-galactica').snapshot().started,
            guardiansRuntimeAbsent: summarizeGalaxyGuardiansDevPreview() === null
          };
        });
        assert.deepEqual(gates, { harnessAbsent: true, reviewHidden: true, reviewDisabled: true,
          referenceDisabled: true, started: false, guardiansRuntimeAbsent: true });
        if(game === 'aurora-galactica') assert(await page.evaluate(() =>
          document.querySelector('#themeSetSelect option[value="aurora-local-reference"]').disabled));
        await page.locator('#settingsPanelClose').click();
        if(game === 'aurora-galactica'){
          const trialGate = await page.evaluate(() => {
            const adapter = getGameplayAdapter('aurora-galactica');
            const state = currentAuroraRuntimeState();
            const before = adapter.snapshot();
            let message = null;
            try{
              window.startActiveGamePack({
                stage: 31, stageMode: 'display', startKind: 'challenge',
                challengeStage: 8, ships: 3, expertPlays: 'human',
                challengeScheduleTrial: {
                  stage: 31, groupSpawnOffsets: [0, 3.593, 7.137, 9.997, 13.79]
                }
              });
            }catch(error){
              message = String(error.message || error);
            }
            return {
              message,
              sameState: currentAuroraRuntimeState() === state,
              startedBefore: before.started,
              startedAfter: adapter.snapshot().started,
              overrideAbsent: currentAuroraRuntimeState().harnessChallengeLayoutOverride == null
            };
          });
          assert.deepEqual(trialGate, {
            message: 'Challenge schedule trial requires a valid development harness Stage 31 launch.',
            sameState: true, startedBefore: false, startedAfter: false, overrideAbsent: true
          });
        }
        if(flows){
          await audioSettings(page, true);
          await audioSettings(page);
        }
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => getGameplayAdapter('aurora-galactica').snapshot().started);
        const runtime = await page.evaluate(() => ({ key: currentGamePackKey(),
          shell: getGameplayAdapter('aurora-galactica').snapshot(),
          guardians: currentGamePackKey() === 'galaxy-guardians-preview' ? summarizeGalaxyGuardiansDevPreview() : null }));
        assert.equal(runtime.key, game);
        assert.equal(runtime.shell.started, true);
        if(game === 'galaxy-guardians-preview'){
          assert(runtime.guardians, 'Normal Guardians launch must create owned runtime');
          assert.equal(runtime.guardians.stage, 1);
          assert(!runtime.guardians.reviewConfig);
        }else assert.equal(runtime.shell.stage, 1);
        const firstClock = await page.evaluate(game => game === 'galaxy-guardians-preview'
          ? currentGalaxyGuardiansDevPreviewState().t : currentAuroraRuntimeState().simT, game);
        await page.waitForFunction(({ game, firstClock }) => (game === 'galaxy-guardians-preview'
          ? currentGalaxyGuardiansDevPreviewState().t : currentAuroraRuntimeState().simT) > firstClock + .1,
        { game, firstClock });
        const pixels = await page.evaluate(() => {
          const c = document.getElementById('c');
          const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          let colored = 0;
          for(let i = 0; i < data.length; i += 4) if(data[i] > 24 || data[i + 1] > 24 || data[i + 2] > 24) colored++;
          return { width: c.width, height: c.height, colored };
        });
        assert(pixels.width > 0 && pixels.height > 0 && pixels.colored > 100, 'Blank canvas');
        const flow = flows ? await normalFlows(page, game) : null;
        results.push({ game, gates, stage: runtime.guardians?.stage || runtime.shell.stage,
          clockAdvanced: true, pixels, flow });
      }finally{ await context.close(); }
    }
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert.equal(missing.length, 0, JSON.stringify(missing));
    assert.equal(privateRequests.length, 0, JSON.stringify(privateRequests));
    assert.equal(hash(path.join(root, 'index.html')), bundleHash, 'Package changed during test');
    console.log(JSON.stringify({ ok: true, build: info.label, commit: info.commit,
      bundleHash, methodHash: hash(__filename), flows,
      results, securityPages, externalOriginsBlocked: [...new Set(blocked)], errors, missing, privateRequests,
      limitations: ['Local public-package smoke only; not hosted auth, audible audio, playlist availability, beta promotion or long-run gameplay.',
        'Nonblank canvas is a weak rendering check, not identified enemy pixels or visual conformance.',
        'Pair runtime checks with static package-byte exclusion; unused private files are not detected by request monitoring.',
        'Optional flows use browser-clock RAF/timer advancement and ordinary UI; not real-time audio audibility, late-stage or perfect-route acceptance.'] }, null, 2));
  }finally{
    try{ if(browser) await browser.close(); }
    finally{ await new Promise(resolve => server.close(resolve)); }
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });

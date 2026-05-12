#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { withHarnessPage } = require('./browser-check-util');
const { ROOT } = require('./browser-check-util');
const { launchHarnessBrowser } = require('./browser-launch');

function fail(message, details = {}){
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function checkGeneratedDashboardPage(){
  const htmlPath = path.join(ROOT, 'local-dev', 'conformance-dashboard.html');
  const dataPath = path.join(ROOT, 'local-dev', 'conformance-dashboard-data.json');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const expected = [
    'id="refreshState" type="button"',
    'id="gameSelector"',
    'Select game conformance profile',
    'Selected Game',
    'data-tab="cost"',
    'Cost / Value',
    'href="http://127.0.0.1:8000/"',
    'href="http://127.0.0.1:8000/release-dashboard.html"',
    'href="/RELEASE_CONFORMANCE_DASHBOARD.md"',
    'class="metricDetails"',
    'Grounding best case',
    'Player / designer meaning',
    'Score Semantics',
    'Confidence',
    'Resolution',
    'Cost / resources',
    'Tracked spend',
    'Value / cost read',
    'class="closeDetails"',
    'data-detail-back="1"',
    'Close details',
    'data-detail-row=',
    'aria-expanded=',
    'data-tab="ingestion"',
    'Ingestion Framework',
    'Source / evidence family',
    'Next Best Ingestion Upgrade',
    'Missing next',
    'platinumConformanceDashboardGame',
    "app.addEventListener('click', event =>",
    "gameSelector.addEventListener('change'",
    "refreshState.addEventListener('click', refresh)"
  ];
  const missing = expected.filter(item => !html.includes(item));
  if(missing.length) fail('generated conformance dashboard page is missing live controls', { htmlPath, missing });
  const horizontalOverflowPatterns = [
    'overflow-x:auto',
    'overflow-x: auto',
    'table{display:block',
    'display:block;overflow-x'
  ];
  const overflowMatches = horizontalOverflowPatterns.filter(item => html.includes(item));
  if(overflowMatches.length){
    fail('generated conformance dashboard reintroduced horizontal-scroll layout patterns', { htmlPath, overflowMatches });
  }
  const games = Array.isArray(data.games) ? data.games : [];
  const gameKeys = games.map(game => game.gameKey);
  if(!gameKeys.includes('aurora-galactica') || !gameKeys.includes('galaxy-guardians-preview')){
    fail('generated conformance dashboard data is missing selectable game profiles', { dataPath, gameKeys });
  }
  const guardians = games.find(game => game.gameKey === 'galaxy-guardians-preview') || {};
  if(!Array.isArray(guardians.priorityRows) || !guardians.priorityRows.length){
    fail('Galaxy Guardians profile is missing conformance status rows', { dataPath, guardians });
  }
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  return 'application/octet-stream';
}

function serveLocalDev(){
  const root = path.join(ROOT, 'local-dev');
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = clean === '/' ? '/conformance-dashboard.html' : clean;
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

async function checkDashboardViewportFit(){
  const { server, port } = await serveLocalDev();
  const browser = await launchHarnessBrowser({});
  try{
    for(const viewport of [{ width: 1280, height: 820 }, { width: 1024, height: 760 }, { width: 390, height: 820 }]){
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/conformance-dashboard.html`, { waitUntil: 'networkidle' });
      const before = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        tabs: [...document.querySelectorAll('[data-tab]')].map(tab => tab.textContent.trim()),
        cards: document.querySelectorAll('.grid .card').length
      }));
      if(before.scrollWidth > before.clientWidth + 1 || before.bodyScrollWidth > before.bodyClientWidth + 1){
        fail('conformance dashboard overflows horizontally before interaction', { viewport, before });
      }
      if(before.cards < 4) fail('conformance dashboard lost above-fold rollup cards', { viewport, before });
      if(!before.tabs.includes('Cost / Value') || !before.tabs.includes('Ingestion')){
        fail('conformance dashboard lost tabbed drill-down sections', { viewport, before });
      }

      await page.click('[data-detail]');
      const detailOpen = await page.evaluate(() => ({
        panel: !!document.querySelector('.detailPanel'),
        inlinePanel: !!document.querySelector('.metricRow.expanded .detailPanel'),
        expandedButton: document.querySelector('[data-detail]')?.getAttribute('aria-expanded') || '',
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      if(!detailOpen.panel) fail('conformance dashboard detail panel did not open inline', { viewport, detailOpen });
      if(!detailOpen.inlinePanel || detailOpen.expandedButton !== 'true'){
        fail('conformance dashboard detail panel did not stay attached to the selected row', { viewport, detailOpen });
      }
      if(detailOpen.scrollWidth > detailOpen.clientWidth + 1){
        fail('conformance dashboard overflows horizontally in metric detail view', { viewport, detailOpen });
      }
      await page.click('[data-detail-back]');
      const detailClosed = await page.evaluate(() => !!document.querySelector('.detailPanel'));
      if(detailClosed) fail('conformance dashboard inline detail panel did not close', { viewport });

      await page.click('[data-tab="ingestion"]');
      const ingestion = await page.evaluate(() => ({
        cards: document.querySelectorAll('.ingestionItem').length,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      if(!ingestion.cards) fail('conformance dashboard ingestion tab has no evidence cards', { viewport, ingestion });
      if(ingestion.scrollWidth > ingestion.clientWidth + 1){
        fail('conformance dashboard overflows horizontally in ingestion view', { viewport, ingestion });
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

(async () => {
  checkGeneratedDashboardPage();
  await checkDashboardViewportFit();
  await withHarnessPage({ skipStart: true, seed: 9412, viewport: { width: 1280, height: 1000 } }, async ({ page }) => {
    await page.click('#settingsBtn');
    const local = await page.evaluate(() => ({
      score: document.getElementById('conformanceRollupScore')?.textContent || '',
      body: document.getElementById('conformanceRollupBody')?.textContent || '',
      hint: document.getElementById('conformanceDashboardHint')?.textContent || '',
      disabled: !!document.getElementById('openConformanceDashboardBtn')?.disabled,
      buttonText: document.getElementById('openConformanceDashboardBtn')?.textContent || '',
      panelDisabled: document.getElementById('conformanceToolsPanel')?.classList.contains('disabled') || false
    }));
    if(local.disabled) fail('localhost conformance dashboard launcher is disabled', local);
    if(local.panelDisabled) fail('localhost conformance dashboard panel is greyed out', local);
    if(!/\d/.test(local.score)) fail('conformance rollup score is not populated', local);
    if(!/Weakest:/.test(local.body)) fail('conformance rollup body does not summarize weakest metric', local);
    if(!/port 4312/.test(local.hint)) fail('conformance dashboard hint does not name the local dashboard service', local);
    if(!/Conformance Dashboard/.test(local.buttonText)) fail('conformance dashboard launcher label missing', local);
    const popupPromise = page.waitForEvent('popup');
    await page.click('#openConformanceDashboardBtn');
    const popup = await popupPromise;
    const popupUrl = popup.url();
    await popup.close();
    if(popupUrl !== 'http://127.0.0.1:4312/local-dev/conformance-dashboard.html'){
      fail('conformance dashboard launcher opened unexpected URL', { popupUrl });
    }

    await page.evaluate(() => {
      window.__platinumForceExternalConformanceDashboard = 1;
      window.__platinumSyncConformanceDashboardUi();
    });
    const external = await page.evaluate(() => ({
      disabled: !!document.getElementById('openConformanceDashboardBtn')?.disabled,
      panelDisabled: document.getElementById('conformanceToolsPanel')?.classList.contains('disabled') || false,
      hint: document.getElementById('conformanceDashboardHint')?.textContent || '',
      body: document.getElementById('conformanceRollupBody')?.textContent || '',
      url: typeof window.__platinumConformanceDashboardUrl === 'function' ? window.__platinumConformanceDashboardUrl() : ''
    }));
    if(external.disabled) fail('external conformance dashboard launcher should remain enabled for release-lane builds', external);
    if(external.panelDisabled) fail('external conformance dashboard panel should remain visible for release-lane builds', external);
    if(!/read-only dashboard/.test(external.hint)) fail('external hint should describe bundled read-only dashboard access', external);
    if(!/Weakest:/.test(external.body)) fail('external rollup body should keep the release conformance summary visible', external);
    if(!/\/conformance-dashboard\.html$/.test(external.url)){
      fail('external conformance dashboard launcher should resolve to the release-lane dashboard URL', external);
    }
    await page.evaluate(() => {
      window.__platinumForceExternalConformanceDashboard = 0;
      window.__platinumSyncConformanceDashboardUi();
    });
  });
  console.log(JSON.stringify({ ok: true, check: 'developer-conformance-dashboard' }, null, 2));
})().catch(err => fail(err.message || String(err), { stack: err.stack }));

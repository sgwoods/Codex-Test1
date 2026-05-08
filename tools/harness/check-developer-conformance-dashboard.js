#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, details = {}){
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

(async () => {
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
      body: document.getElementById('conformanceRollupBody')?.textContent || ''
    }));
    if(!external.disabled) fail('external conformance dashboard launcher should be disabled', external);
    if(!external.panelDisabled) fail('external conformance dashboard panel should be greyed out', external);
    if(!/Root login password/.test(external.hint)) fail('external hint should point to future Root-gated access', external);
    if(!/Local-only/.test(external.body)) fail('external rollup body should explain local-only state', external);
    await page.evaluate(() => {
      window.__platinumForceExternalConformanceDashboard = 0;
      window.__platinumSyncConformanceDashboardUi();
    });
  });
  console.log(JSON.stringify({ ok: true, check: 'developer-conformance-dashboard' }, null, 2));
})().catch(err => fail(err.message || String(err), { stack: err.stack }));

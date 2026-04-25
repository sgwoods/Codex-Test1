#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 51321 }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.setupPilotRecordsPanelTest({
        replayId: 'replay-stage7-local',
        clearExisting: true,
        email: 'sgwoods@gmail.com',
        userId: 'pilot-swd',
        initials: 'SWD',
        score: 654321,
        stage: 7,
        duration: 113,
        createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
      });
    });
    await page.evaluate(() => {
      window.__platinumReplayCatalog = [];
      window.__auroraReplayCatalog = [];
      window.__galagaHarness__.seedLocalLeaderboard([{
        id: 'local-fresh-run',
        initials: 'SWD',
        score: 970,
        stage: 1,
        at: new Date(Date.now() - 60 * 1000).toISOString(),
        build: (window.BUILD && window.BUILD.version) || ''
      }]);
    });
    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(120);
    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(200);
    return page.evaluate(() => {
      const stats = Array.from(document.querySelectorAll('#accountFlightStats .accountStatCard')).map(card => ({
        label: card.querySelector('.accountStatLabel')?.textContent?.trim() || '',
        value: card.querySelector('.accountStatValue')?.textContent?.trim() || ''
      }));
      const rows = Array.from(document.querySelectorAll('#accountRecordsTop5 .accountRecordRow')).map(row => ({
        score: row.querySelector('.accountRecordScore')?.textContent?.trim() || '',
        stage: row.querySelector('.accountRecordMeta')?.textContent?.trim() || '',
        stamp: row.querySelector('.accountRecordStamp')?.textContent?.trim() || '',
        replayId: row.getAttribute('data-replay-id') || ''
      }));
      return { stats, rows };
    });
  });

  const latestScore = result.stats.find(card => card.label === 'Latest Score')?.value || '';
  const latestFlight = result.stats.find(card => card.label === 'Latest Flight')?.value || '';
  const firstRow = result.rows[0] || {};

  if(latestScore !== '000970'){
    fail('pilot recent scores did not surface the freshest local score for the signed-in pilot', result);
  }
  if(latestFlight !== '1m ago' && latestFlight !== 'just now'){
    fail('pilot recent scores did not surface the freshest local flight time for the signed-in pilot', result);
  }
  if(firstRow.score !== '000970'){
    fail('pilot records list did not put the freshest local pilot score first', result);
  }
  if(firstRow.stamp !== '1m ago' && firstRow.stamp !== 'just now'){
    fail('pilot records list did not show the freshest local pilot score timestamp first', result);
  }

  console.log(JSON.stringify({
    ok: true,
    latestScore,
    latestFlight,
    firstRow
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

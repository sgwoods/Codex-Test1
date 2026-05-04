#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 9071 }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.seedLocalLeaderboard([
        { initials: 'AAA', score: 45670, stage: 8, at: '2026-04-08T18:00:00.000Z', build: '1.2.2+build.382.sha.ce59bb0' },
        { initials: 'BBB', score: 34560, stage: 6, at: '2026-04-02T18:00:00.000Z', build: '1.2.1+build.373.sha.a019a96' }
      ]);
      window.__galagaHarness__.setLeaderboardDateFilter('');
      window.__galagaHarness__.openWaitLeaderboard('local');
    });
    const before = await page.evaluate(() => window.__galagaHarness__.leaderboardPanelState());
    await page.evaluate(() => window.__galagaHarness__.setLeaderboardDateFilter('2026-04-05'));
    const after = await page.evaluate(() => window.__galagaHarness__.leaderboardPanelState());
    return { before, after };
  });

  if(!result.before.open) fail('leaderboard panel did not open for local score metadata check', result);
  if(result.before.activeView !== 'local') fail('leaderboard panel did not open on the local score view', result);
  if(!result.before.metadata?.some(meta => String(meta.build).includes('1.2.2+build.382.sha.ce59bb0'))) fail('leaderboard panel did not expose full build metadata for seeded local score rows', result);
  if(!result.before.cells.some(cell => String(cell).includes('Apr'))) fail('leaderboard panel did not show a readable date label', result);
  if(result.after.filterAfter !== '2026-04-05') fail('leaderboard date filter did not persist in the panel control', result);
  if(result.after.metadata?.some(meta => String(meta.build).includes('1.2.1+build.373.sha.a019a96'))) fail('leaderboard date filter did not hide older score rows', result);
  if(!result.after.metadata?.some(meta => String(meta.build).includes('1.2.2+build.382.sha.ce59bb0'))) fail('leaderboard date filter removed the newer score row unexpectedly', result);

  console.log(JSON.stringify({ ok: true, before: result.before, after: result.after }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

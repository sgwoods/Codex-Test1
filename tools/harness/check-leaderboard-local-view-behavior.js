#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 62814 }, async ({ page }) => {
    await page.evaluate(() => {
      const seededTop10 = [
        { id: 'seed-01', initials: 'AAA', score: 20300, stage: 5, at: '2026-03-23T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-02', initials: 'BBB', score: 17160, stage: 3, at: '2026-04-24T12:00:00.000Z', build: '1.2.3' },
        { id: 'seed-03', initials: 'CCC', score: 16290, stage: 4, at: '2026-03-28T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-04', initials: 'DDD', score: 6260, stage: 2, at: '2026-03-23T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-05', initials: 'EEE', score: 4180, stage: 1, at: '2026-03-23T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-06', initials: 'FFF', score: 3250, stage: 1, at: '2026-03-23T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-07', initials: 'GGG', score: 2300, stage: 1, at: '2026-03-23T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-08', initials: 'HHH', score: 2050, stage: 1, at: '2026-03-27T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-09', initials: 'III', score: 1750, stage: 1, at: '2026-03-23T12:00:00.000Z', build: 'legacy' },
        { id: 'seed-10', initials: 'JJJ', score: 1270, stage: 1, at: '2026-04-26T12:00:00.000Z', build: '1.2.3' }
      ];
      const latestCompleted = { id: 'latest-low', initials: 'YOU', score: 970, stage: 1, at: new Date(Date.now() - 60 * 1000).toISOString(), build: '1.2.3' };
      saveScoreboard(seededTop10);
      saveScoreHistory([latestCompleted, ...seededTop10]);
      LEADERBOARD.view = 'all';
      writePref(LEADERBOARD_PREF_KEY, 'all');
      if(typeof syncLeaderboardUi === 'function') syncLeaderboardUi();
    });

    await page.locator('#leaderboardDockBtn').click();
    await page.waitForTimeout(150);
    await page.locator('#leaderboardViewButtons button[data-view="local"]').click();
    await page.waitForTimeout(150);
    const localOpen = await page.evaluate(() => window.__galagaHarness__.leaderboardPanelState());

    await page.evaluate(() => {
      const panel = document.getElementById('leaderboardPanel');
      if(panel) panel.scrollTop = 9999;
    });
    await page.locator('#leaderboardPanelClose').click();
    await page.waitForTimeout(100);
    await page.locator('#leaderboardDockBtn').click();
    await page.waitForTimeout(150);
    const reopened = await page.evaluate(() => window.__galagaHarness__.leaderboardPanelState());

    return { localOpen, reopened };
  });

  if(result.localOpen.activeView !== 'local'){
    fail('leaderboard did not keep the local score view active', result);
  }
  if(result.localOpen.sub !== 'LOCAL TOP 10 DEVICE SCORES'){
    fail('leaderboard local subtitle did not clarify the top-10 scope', result);
  }
  if(result.localOpen.status !== 'Local top 10 on this device · completed runs only'){
    fail('leaderboard local status did not clarify completed-run behavior', result);
  }
  if(!/Latest completed run/i.test(result.localOpen.latestBanner) || !/000970/.test(result.localOpen.latestBanner)){
    fail('leaderboard local view did not surface the latest completed run when it was outside the top 10', result);
  }
  if(result.reopened.activeView !== 'local'){
    fail('leaderboard did not reopen on the previously selected local view', result);
  }
  if(result.reopened.scrollTop !== 0){
    fail('leaderboard did not reset scroll position when reopened', result);
  }
  if(!/Latest completed run/i.test(result.reopened.latestBanner)){
    fail('leaderboard latest-run banner disappeared after reopening the panel', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 49033 }, async ({ page }) => {
    await page.evaluate(() => {
      LEADERBOARD.view='all';
      LEADERBOARD.remote.all=[{
        idx:1,
        initials:'DKA',
        score:1470,
        stage:1,
        verified:1,
        build:'1.2.3+build.489.sha.f6ba6c2',
        timestamp:'2026-04-25T16:49:32.760Z'
      }];
      LEADERBOARD.cacheStamp.all=Date.now();
      LEADERBOARD.status='Shared leaderboard live';
      renderLeaderboardPanel();
      openLeaderboardPanel('all');
    });
    await page.waitForTimeout(150);
    return await page.evaluate(() => window.__galagaHarness__.leaderboardPanelState());
  });

  const metaCells = result.cells.filter((_, index) => index >= 7 && index % 5 === 2);
  if(!metaCells.length){
    fail('leaderboard build/date metadata did not render', result);
  }
  const firstMeta = String(metaCells[0] || '');
  if(!/Build 1\.2\.3/.test(firstMeta)){
    fail('leaderboard build info did not keep the simplified version identifier', result);
  }
  if(/\+build|sha\./i.test(firstMeta)){
    fail('leaderboard build info is still showing verbose build metadata', result);
  }
  if(!/Apr|25|26/.test(firstMeta)){
    fail('leaderboard build info did not keep the score date visible', result);
  }

  console.log(JSON.stringify({ ok:true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

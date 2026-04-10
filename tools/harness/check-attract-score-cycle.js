#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 9063, skipStart: true }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.enterAttractScores();
    });
    await page.evaluate(() => window.__galagaHarness__.advanceFor(0, { step: 1 / 60 }));
    const first = await page.evaluate(() => window.__galagaHarness__.attractScoreState());
    await page.evaluate(() => window.__galagaHarness__.advanceFor(4.7, { step: 1 / 60 }));
    const second = await page.evaluate(() => window.__galagaHarness__.attractScoreState());
    await page.evaluate(() => window.__galagaHarness__.advanceFor(4.7, { step: 1 / 60 }));
    const third = await page.evaluate(() => window.__galagaHarness__.attractScoreState());
    await page.evaluate(() => window.__galagaHarness__.advanceFor(4.4, { step: 1 / 60 }));
    const fourth = await page.evaluate(() => window.__galagaHarness__.attractScoreState());
    return { first, second, third, fourth };
  });

  if(result.first.phase !== 'scores') fail('attract score cycle did not enter score phase', result);
  if(!Array.isArray(result.first.views) || result.first.views.length !== 3) fail('attract score cycle did not expose the expected three-board rotation', result);
  if(JSON.stringify(result.first.views) !== JSON.stringify(['validated', 'local', 'all'])) fail('attract score cycle order drifted from validated -> local -> all', result);
  if(result.first.view !== 'validated') fail('attract score cycle should start on Validated', result);
  if(result.second.view !== 'local') fail('attract score cycle did not rotate to Local', result);
  if(result.third.phase !== 'scores' || result.third.view !== 'all') fail('attract score cycle did not rotate to All before returning to demo mode', result);
  if(result.fourth.phase !== 'demo') fail('attract score cycle did not return to demo after showing the three boards', result);
  if(!String(result.first.title||'').includes('VALIDATED PILOTS')) fail('validated attract title did not render first', result);
  if(!String(result.second.title||'').includes('LOCAL DEVICE SCORES')) fail('local attract title did not render during rotation', result);
  if(!String(result.third.title||'').includes('TOP 10 PILOTS')) fail('all-scores attract title did not render during rotation', result);

  console.log(JSON.stringify({
    ok: true,
    first: result.first,
    second: result.second,
    third: result.third,
    fourth: result.fourth
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

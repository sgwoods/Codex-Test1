#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

(async()=>{
  const pageErrors=[];
  const result = await withHarnessPage({ stage: 1, ships: 3, seed: 24601 }, async ({ page }) => {
    page.on('pageerror', err => pageErrors.push(String(err && err.stack || err)));
    return page.evaluate(async () => {
      window.__galagaHarness__.setupRemoteScoreSubmitTest({
        mode: 'failure',
        initials: 'YOU',
        errorMessage: 'expected submit failure'
      });
      window.__galagaHarness__.triggerRemoteScoreGameOver({
        score: 12345,
        stage: 7,
        reserveLives: 0,
        shots: 10,
        hits: 8
      });
      window.__galagaHarness__.restartCurrentConfig();
      await Promise.resolve();
      await Promise.resolve();
      return window.__galagaHarness__.remoteScoreSubmitState();
    });
  });

  if(pageErrors.length) fail('game-over submit restart safety threw a page error', { pageErrors, result });
  if(result.remoteSubmitted === 'pending') fail('game-over submit restart safety left remoteSubmitted pending after restart', result);

  console.log(JSON.stringify({ ok: true, result }, null, 2));
})().catch(err=>{
  console.error(err && err.stack || String(err));
  process.exit(1);
});

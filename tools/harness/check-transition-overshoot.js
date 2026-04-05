#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 51201 }, async ({ page }) => {
    return page.evaluate(() => window.__galagaHarness__.setupTransitionOvershootTest({ stage: 3, overshoot: 0.05 }));
  });

  if(result.after.stage !== 3) fail('overshoot transition should keep the challenge stage number until the challenge clears', result);
  if(!result.after.challenge) fail('overshoot transition failed to spawn the challenge stage', result);
  if(result.after.enemies !== 40 || result.after.challengeEnemies !== 40){
    fail('overshoot transition did not populate the expected challenge enemy set', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

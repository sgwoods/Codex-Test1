#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 1, challenge: false, seed: 45192 }, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(String(err && err.stack || err)));

    const setup = await page.evaluate(() => {
      const ok = window.__galagaHarness__.setupCarriedBossFormationTest({
        stage: 2,
        playerX: 140,
        bossX: 140,
        bossY: 120
      });
      if(!ok) return { error: 'carry_boss_setup_failed' };
      const damaged = window.__galagaHarness__.triggerBossFirstHit();
      const launched = window.__galagaHarness__.launchCarryingBossAttack({
        playerX: 140,
        bossX: 140,
        bossY: 210,
        vx: 0,
        vy: 18
      });
      return {
        damaged,
        launched,
        state: window.__galagaHarness__.state(),
        carry: window.__galagaHarness__.carryState()
      };
    });
    if(setup.error) return setup;

    const loss = await page.evaluate(() => {
      return window.__galagaHarness__.triggerShipLoss({
        reserveLives: 0,
        cause: 'harness_last_life_carry_boss_collision'
      });
    });

    const settled = await waitForHarness(page, () => {
      const gameOver = window.__galagaHarness__.gameOverView();
      const systemLog = typeof window.recentSystemLogEntries === 'function' ? window.recentSystemLogEntries(20) : [];
      const crash = systemLog.find(entry => entry.action === 'runtime_loop_crash') || null;
      if(crash) return { crash, gameOver, systemLog };
      if(gameOver?.phase) return { crash: null, gameOver, systemLog };
      return null;
    }, 1800, 50);

    return {
      pageErrors,
      setup,
      loss,
      settled,
      finalState: await page.evaluate(() => window.__galagaHarness__.state())
    };
  });

  if(result.pageErrors.length) fail('last-life carry-boss collision bubbled a page error', result);
  if(result.settled?.crash) fail('last-life carry-boss collision triggered a runtime loop crash', result);
  if(!result.settled?.gameOver?.phase) fail('last-life carry-boss collision did not settle into game over', result);

  console.log(JSON.stringify({
    ok: true,
    phase: result.settled.gameOver.phase,
    loss: result.loss,
    finalState: result.finalState
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

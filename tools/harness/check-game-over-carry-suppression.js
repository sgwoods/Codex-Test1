#!/usr/bin/env node
const { withHarnessPage, waitForHarness, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 1, challenge: false, seed: 9171 }, async ({ page }) => {
    const ready = await page.evaluate(() => {
      if(!window.__galagaHarness__) return { error: 'harness_unavailable' };
      const ok = window.__galagaHarness__.setupCarriedBossFormationTest({
        stage: 2,
        playerX: 140,
        bossX: 140,
        bossY: 120
      });
      if(!ok) return { error: 'carried_boss_setup_failed' };
      return {
        carry: window.__galagaHarness__.carryState().carry,
        render: window.__galagaHarness__.renderState()
      };
    });
    if(ready.error) return ready;

    const before = await waitForHarness(page, () => {
      const render = window.__galagaHarness__.renderState();
      const carry = (render.carryDraws || [])[0] || null;
      return carry ? { carry, render } : null;
    }, 1200, 50);
    const beforeRenderTick = before.render?.renderTick || 0;

    const loss = await page.evaluate(() => {
      return window.__galagaHarness__.triggerShipLoss({
        reserveLives: 0,
        cause: 'harness_game_over_carry_suppression'
      });
    });

    let after = null;
    const deadline = Date.now() + 1800;
    while(Date.now() < deadline){
      const sample = await page.evaluate(() => {
        const gameOver = window.__galagaHarness__.gameOverView();
        const render = window.__galagaHarness__.renderState();
        return {
          carry: window.__galagaHarness__.carryState().carry,
          render,
          gameOver
        };
      });
      if(sample.gameOver?.phase && (sample.render?.renderTick || 0) > beforeRenderTick){
        after = sample;
        break;
      }
      await sleep(50);
    }
    if(!after) return { error: 'post_game_over_render_not_observed', before, loss };

    after.loss = loss;

    return { before, after };
  });

  if(result.error) fail('game-over carry suppression harness could not set up the carried boss state', result);
  if(!result.before?.carry) fail('expected a visible carried-fighter render before game over', result);
  if(result.after?.loss?.started) fail('game-over suppression check did not end the run as expected', result);
  if(!result.after?.gameOver?.phase) fail('game-over state was not entered during carry suppression check', result);
  if((result.after?.render?.carryDraws || []).length) fail('carried fighter should not keep rendering once the game-over/results overlay is active', result);
  if(result.after?.render?.captureTetherVisible) fail('capture tether should not render once the game-over/results overlay is active', result);
  if(result.after?.render?.capturedGhostVisible) fail('captured fighter ghost should not render once the game-over/results overlay is active', result);

  console.log(JSON.stringify({
    ok: true,
    beforeCarry: result.before.carry,
    afterPhase: result.after.gameOver.phase,
    afterCarryDraws: (result.after.render.carryDraws || []).length,
    afterCaptureTetherVisible: !!result.after.render.captureTetherVisible,
    afterCapturedGhostVisible: !!result.after.render.capturedGhostVisible
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

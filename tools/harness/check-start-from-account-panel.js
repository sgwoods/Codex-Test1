#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

const ARTIFACT = '/tmp/aurora-start-from-account-panel.png';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 49031 }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.startAttractDemo({ record: false });
    });
    await page.waitForTimeout(200);
    const waitState = await page.evaluate(() => window.__galagaHarness__.state());
    if(waitState.started){
      throw new Error(`Did not enter wait mode before account-panel start check: ${JSON.stringify(waitState)}`);
    }
    await page.evaluate(() => {
      if(typeof openAccountPanel === 'function') openAccountPanel();
      const email = document.getElementById('accountEmail');
      if(email) email.focus();
    });
    await page.waitForTimeout(150);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await waitForHarness(page, () => window.__galagaHarness__.state().started, 3000);
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => ({
      panelHidden: !!document.getElementById('accountPanel')?.hidden,
      activeId: document.activeElement?.id || document.activeElement?.tagName || '',
      playerX: window.__galagaHarness__.snapshot().player.x
    }));
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(180);
    await page.keyboard.up('ArrowLeft');
    const after = await page.evaluate(() => ({
      panelHidden: !!document.getElementById('accountPanel')?.hidden,
      activeId: document.activeElement?.id || document.activeElement?.tagName || '',
      playerX: window.__galagaHarness__.snapshot().player.x,
      started: window.__galagaHarness__.state().started
    }));
    await page.screenshot({ path: ARTIFACT });
    return { before, after, movedLeft: after.playerX < before.playerX };
  });

  if(!result.after.started){
    fail('game did not start from account panel flow', result);
  }
  if(!result.after.panelHidden){
    fail('account panel did not close when starting a run', result);
  }
  if(result.after.activeId !== 'c'){
    fail('focus did not return to the playfield canvas after starting a run', result);
  }
  if(!result.movedLeft){
    fail('player did not respond to left input after starting from account panel', result);
  }

  console.log(JSON.stringify({
    ok: true,
    focus: result.after.activeId,
    movedLeft: result.movedLeft,
    screenshot: ARTIFACT
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

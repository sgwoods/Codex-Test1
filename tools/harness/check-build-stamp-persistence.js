#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 49032 }, async ({ page }) => {
    await page.evaluate(() => {
      window.__buildStampOpenCalls = [];
      window.open = (url, target, features) => {
        window.__buildStampOpenCalls.push({ url, target, features });
        return { focus(){} };
      };
    });

    const before = await page.evaluate(() => {
      const stamp = document.getElementById('buildStamp');
      const refreshBtn = document.getElementById('buildStampRefreshBtn');
      const style = stamp ? getComputedStyle(stamp) : null;
      return {
        exists: !!stamp,
        visible: !!stamp && style.display !== 'none' && style.visibility !== 'hidden',
        hasDismissBtn: !!document.getElementById('buildStampDismissBtn'),
        role: stamp?.getAttribute('role') || '',
        tabIndex: stamp?.tabIndex ?? null,
        title: stamp?.getAttribute('title') || '',
        refreshHidden: !!refreshBtn?.hidden
      };
    });

    await page.locator('#buildStamp').click();
    await page.waitForTimeout(150);
    const afterClick = await page.evaluate(() => ({
      openCalls: window.__buildStampOpenCalls.slice()
    }));

    await page.locator('#buildStamp').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    const afterKeyboard = await page.evaluate(() => ({
      openCalls: window.__buildStampOpenCalls.slice()
    }));

    return { before, afterClick, afterKeyboard };
  });

  if(!result.before.exists || !result.before.visible){
    fail('build stamp is not present and visible on the main screen', result);
  }
  if(result.before.hasDismissBtn){
    fail('build stamp still exposes a dismiss button instead of staying persistent', result);
  }
  if(result.before.role !== 'button' || result.before.tabIndex !== 0){
    fail('build stamp is not keyboard-accessible as a clickable guide entry point', result);
  }
  if(result.afterClick.openCalls.length < 1){
    fail('clicking the build stamp did not open the project guide', result);
  }
  if(result.afterKeyboard.openCalls.length < 2){
    fail('keyboard activation did not open the project guide from the build stamp', result);
  }
  const firstUrl = result.afterClick.openCalls[0]?.url || '';
  if(!/project-guide\.html$/i.test(firstUrl)){
    fail('build stamp click did not target the project guide surface', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

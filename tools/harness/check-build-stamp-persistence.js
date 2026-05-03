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
      openCalls: window.__buildStampOpenCalls.slice(),
      panelVisible: !!document.getElementById('platformMessagePanel')?.classList.contains('visible'),
      panelHidden: !!document.getElementById('platformMessagePanel')?.hidden,
      panelRows: document.querySelectorAll('#platformMessagePanelList .platformMessageRow').length
    }));

    await page.locator('#platformMessagePanelClose').click();
    await page.waitForTimeout(150);
    await page.locator('#buildStamp').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    const afterKeyboard = await page.evaluate(() => ({
      openCalls: window.__buildStampOpenCalls.slice(),
      panelVisible: !!document.getElementById('platformMessagePanel')?.classList.contains('visible'),
      panelHidden: !!document.getElementById('platformMessagePanel')?.hidden,
      panelRows: document.querySelectorAll('#platformMessagePanelList .platformMessageRow').length
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
  if(result.afterClick.openCalls.length > 0){
    fail('clicking the build stamp still opens a popup instead of the platform message panel', result);
  }
  if(!result.afterClick.panelVisible || result.afterClick.panelHidden || result.afterClick.panelRows < 1){
    fail('clicking the build stamp did not open the platform message panel', result);
  }
  if(result.afterKeyboard.openCalls.length > 0){
    fail('keyboard activation still opens a popup instead of the platform message panel', result);
  }
  if(!result.afterKeyboard.panelVisible || result.afterKeyboard.panelHidden || result.afterKeyboard.panelRows < 1){
    fail('keyboard activation did not open the platform message panel from the build stamp', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

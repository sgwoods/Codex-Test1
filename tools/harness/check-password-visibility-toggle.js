#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 49034 }, async ({ page }) => {
    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(150);

    const initial = await page.evaluate(() => ({
      passwordType: document.getElementById('accountPassword')?.type || '',
      toggleText: document.getElementById('accountPasswordToggle')?.textContent || '',
      toggleTitle: document.getElementById('accountPasswordToggle')?.title || ''
    }));

    await page.locator('#accountPasswordToggle').click();
    await page.waitForTimeout(100);
    const afterShow = await page.evaluate(() => ({
      passwordType: document.getElementById('accountPassword')?.type || '',
      toggleText: document.getElementById('accountPasswordToggle')?.textContent || '',
      toggleTitle: document.getElementById('accountPasswordToggle')?.title || ''
    }));

    await page.locator('#accountPasswordToggle').click();
    await page.waitForTimeout(100);
    const afterHide = await page.evaluate(() => ({
      passwordType: document.getElementById('accountPassword')?.type || '',
      toggleText: document.getElementById('accountPasswordToggle')?.textContent || '',
      toggleTitle: document.getElementById('accountPasswordToggle')?.title || ''
    }));

    return { initial, afterShow, afterHide };
  });

  if(result.initial.passwordType !== 'password'){
    fail('password field did not start masked', result);
  }
  if(result.afterShow.passwordType !== 'text'){
    fail('password field did not become visible after clicking the eye toggle', result);
  }
  if(result.afterHide.passwordType !== 'password'){
    fail('password field did not re-mask after clicking the eye toggle again', result);
  }

  console.log(JSON.stringify({ ok:true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { withHarnessPage } = require('./browser-check-util');
const { inventory, digest, sourceIdentity } = require('../testing/run-evidence');
const { createFrozenOutput } = require('./frozen-output');

const [bundle, output] = process.argv.slice(2);
assert(bundle && output, 'Usage: node check-guest-input-lifecycle.js FROZEN_BUNDLE NEW_OUTPUT');
const {root, out} = createFrozenOutput(bundle, output);
const before = inventory(root);
const report = { source: sourceIdentity(), build: JSON.parse(fs.readFileSync(path.join(root, 'build-info.json'))),
  bundleHash: before.sha256, methodHash: digest(fs.readFileSync(__filename)),
  helperHash: digest(fs.readFileSync(require.resolve('./browser-check-util'))), cases: [],
  outputGuardHash: digest(fs.readFileSync(require.resolve('./frozen-output'))),
  limitations: ['Synthetic window blur checks handler semantics, not OS focus switching.',
    'Account field is enabled as a DOM focus fixture when offline auth is unavailable; no auth client is simulated.',
    'Disposable signed-out browser contexts; no hosted, touch, or real authentication transitions.'] };

async function main(){
  try {
    for(const width of [1100, 390]) for(const mode of ['fresh', 'account-focus', 'settings', 'blur']){
      const row = { width, mode, moves: [], passed: false };
      report.cases.push(row);
      await withHarnessPage({ root, offline: true, skipStart: true, viewport: { width, height: 1000 } }, async ({ page, browser }) => {
        row.browser = browser.version();
        page.setDefaultTimeout(8000);
        row.pageErrors = [];
        page.on('pageerror', e => row.pageErrors.push(String(e)));
        assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(k => /auth-token/.test(k))), []);
        assert.notEqual(await page.locator('#accountDockBtn').getAttribute('data-signed-in'), 'true');
        if(mode === 'account-focus'){
          if(!await page.locator('#accountDockBtn').isVisible()){
            row.blocked = 'Pilot control hidden at this viewport; account-focus path is inaccessible.';
            await page.screenshot({path:path.join(out,`${width}-${mode}-blocked.png`)});
            return;
          }
          await page.locator('#accountDockBtn').click();
          row.accountFieldOriginallyDisabled = await page.locator('#accountEmail').isDisabled();
          await page.locator('#accountEmail').evaluate(el => { el.disabled = false; });
          await page.locator('#accountEmail').fill('guest-probe@example.invalid');
          await page.keyboard.press('ArrowLeft');
          assert(!(await page.evaluate(() => window.__galagaHarness__.inputState())).started, 'Typing launched game');
          // Leave the editable field without activating any authentication command.
          await page.locator('#accountPanelClose').focus();
        }
        await page.keyboard.press('Enter');
        if(mode === 'account-focus') await page.keyboard.press('Enter');
        await page.waitForFunction(() => { const s=window.__galagaHarness__.inputState(); return s.started && s.spawn <= 0; });
        if(mode === 'settings'){
          await page.keyboard.press('KeyT');
          await page.locator('#settingsPanel').waitFor({state:'visible'});
          await page.keyboard.press('Escape');
          await page.locator('#settingsPanel').waitFor({state:'hidden'});
        }
        if(mode === 'blur'){
          await page.keyboard.down('ArrowLeft');
          await page.waitForTimeout(150);
          await page.evaluate(() => window.dispatchEvent(new Event('blur')));
          row.blur = await page.evaluate(() => window.__galagaHarness__.inputState());
          assert.deepEqual(row.blur.keys, []);
          assert.equal(row.blur.playerVx, 0);
          await page.keyboard.up('ArrowLeft');
          await page.locator('#c').focus();
          await page.waitForTimeout(180);
        }
        row.recovery = await page.evaluate(() => window.__galagaHarness__.inputState());
        await page.waitForFunction(() => window.__galagaHarness__.inputState().inputResetHoldT <= 0, null, {timeout:1000});
        for(const key of ['ArrowLeft', 'ArrowRight', 'a', 'd', 'z', 'c']){
          const initial = await page.evaluate(() => window.__galagaHarness__.inputState());
          await page.keyboard.down(key);
          await page.waitForTimeout(180);
          await page.keyboard.up(key);
          await page.waitForTimeout(80);
          const final = await page.evaluate(() => window.__galagaHarness__.inputState());
          const delta = final.playerX-initial.playerX;
          row.moves.push({ key, delta, initial, final });
          assert(['ArrowLeft','a','z'].includes(key) ? delta < -8 : delta > 8, `${mode}/${width}/${key}: delta ${delta}`);
          assert.deepEqual(final.keys, []);
        }
        const shotCount=()=>page.evaluate(()=>window.__galagaHarness__.sessionEvents(256)
          .filter(event=>event.type==='player_shot').length);
        const shotsBefore=await shotCount();
        await page.keyboard.down('Space');
        await page.waitForTimeout(260);
        await page.keyboard.up('Space');
        await page.waitForTimeout(80);
        const shotsReleased=await shotCount();
        await page.waitForTimeout(400);
        row.fire={shotsBefore,shotsReleased,shotsAfterRelease:await shotCount()};
        assert(shotsReleased>shotsBefore,'Guest fire key produced no shot');
        assert.equal(row.fire.shotsAfterRelease,shotsReleased,'Fire continued after key release');
        assert.deepEqual((await page.evaluate(()=>window.__galagaHarness__.inputState())).keys,[]);
        assert.deepEqual(row.pageErrors, []);
        row.events = await page.evaluate(() => window.__galagaHarness__.sessionEvents(256));
        await page.screenshot({ path: path.join(out, `${width}-${mode}.png`) });
        row.passed = true;
      });
    }
    assert.equal(inventory(root).sha256, before.sha256);
    report.passed = report.cases.every(row => row.passed);
    report.executedPassed = report.cases.filter(row => !row.blocked).every(row => row.passed);
    if(!report.passed)process.exitCode=1;
  } catch(error){ report.error=String(error.stack || error); process.exitCode=1; }
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({passed:!!report.passed,out,error:report.error}));
}
main();

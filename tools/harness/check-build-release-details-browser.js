const assert = require('node:assert/strict');
const fs = require('node:fs');
const { withHarnessPage } = require('./browser-check-util');

(async()=>{
  for(const viewport of [{width:1440,height:1800},{width:390,height:844}]){
    await withHarnessPage({viewport}, async({page, context})=>{
      // Exclude optional external media from this offline panel regression.
      await page.evaluate(()=>document.querySelectorAll('iframe').forEach(frame=>frame.remove()));
      await page.waitForTimeout(1000);
      await context.setOffline(true);
      const errors=[];
      page.on('pageerror', error=>errors.push(String(error)));
      await page.locator('#buildStamp').click();
      await page.getByRole('button',{name:'Show build release details'}).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('button',{name:'Back to platform messages'}).waitFor();
      const before=await page.evaluate(()=>window.__galagaHarness__.inputState());
      const text=await page.locator('#platformMessagePanelList').innerText();
      const details=await page.locator('#buildReleaseDetails').textContent().then(JSON.parse);
      assert(text.includes(details.label));
      assert(text.includes(details.note.summary));
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Back to platform messages');
      const after=await page.evaluate(()=>window.__galagaHarness__.inputState());
      assert.equal(after.playerX,before.playerX);
      assert.equal(after.started,before.started);
      const overflow=await page.locator('#platformMessagePanelList').evaluate(el=>el.scrollWidth>el.clientWidth+1);
      assert.equal(overflow,false);
      fs.mkdirSync('harness-artifacts/build-release-details',{recursive:true});
      await page.screenshot({path:`harness-artifacts/build-release-details/${viewport.width}.png`});
      await page.locator('.platformBuildFields dd').last().scrollIntoViewIfNeeded();
      await page.screenshot({path:`harness-artifacts/build-release-details/${viewport.width}-fields.png`});
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Show build release details');
      await page.keyboard.press('Space');
      await page.getByRole('button',{name:'Back to platform messages'}).waitFor();
      await page.getByRole('button',{name:'Back to platform messages'}).click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#platformMessagePanel').isVisible(),false);
      assert.equal(await page.evaluate(()=>window.__galagaHarness__.inputState().started),true);
      await page.locator('#buildStamp').click();
      await page.locator('#platformMessagePanelClose').click();
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'buildStamp');
      const unexpected=errors.filter(error=>!error.startsWith('NetworkError:'));
      assert.deepEqual(unexpected,[]);
    });
  }
  console.log('Build details desktop/mobile offline keyboard, focus, game preservation PASS');
})().catch(error=>{console.error(error);process.exitCode=1;});

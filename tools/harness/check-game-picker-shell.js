#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 49027 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.exportAndReset({ label: 'picker_wait_mode' }));
    await page.waitForTimeout(220);
    await page.evaluate(() => {
      const btn = document.getElementById('gamePickerDockBtn');
      if(!btn) throw new Error('missing game picker dock button');
      btn.click();
    });
    await page.waitForTimeout(220);

    const opened = await page.evaluate(() => {
      const rail = document.getElementById('cabinetLeftFrame');
      const btn = document.getElementById('gamePickerDockBtn');
      const modal = document.getElementById('gamePickerModal');
      const list = document.getElementById('gamePickerList');
      return {
        railVisible: !!rail && getComputedStyle(rail).display !== 'none',
        buttonExpanded: btn?.getAttribute('aria-expanded') === 'true',
        modalOpen: !!modal && modal.classList.contains('open'),
        packCount: list?.querySelectorAll('[data-pack-key]').length || 0
      };
    });

    if(!opened.railVisible || !opened.buttonExpanded || !opened.modalOpen || opened.packCount < 2){
      return { opened };
    }

    await page.evaluate(() => {
      const btn = document.querySelector('[data-pack-key="galaxian-signal-preview"]');
      if(!btn) throw new Error('missing preview pack entry');
      btn.click();
    });

    const preview = await waitForHarness(page, () => {
      const title = document.title;
      const marquee = document.getElementById('cabinetMarqueeTitle')?.textContent || '';
      const msg = document.getElementById('msg')?.innerText || '';
      return title.includes('Galaxian Signal') && marquee.includes('Galaxian Signal') && msg.includes('GALAXIAN SIGNAL')
        ? { title, marquee, msg: msg.replace(/\s+/g, ' ').trim() }
        : null;
    }, 1200, 40);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(180);

    const blocked = await page.evaluate(() => ({
      started: !!window.__galagaHarness__.snapshot().started,
      toast: document.getElementById('feedbackToast')?.innerText || ''
    }));

    return { opened, preview, blocked };
  });

  if(!result.opened?.railVisible) fail('left-side game picker rail did not render', result);
  if(!result.opened?.buttonExpanded || !result.opened?.modalOpen) fail('game picker did not open from the left rail control', result);
  if((result.opened?.packCount || 0) < 2) fail('game picker did not list both the live pack and the preview pack', result);
  if(!result.preview?.title.includes('Galaxian Signal') || !result.preview?.marquee.includes('Galaxian Signal')){
    fail('preview pack selection did not update the shell title and marquee', result);
  }
  if(!result.preview?.msg.includes('GALAXIAN SIGNAL') || !result.preview?.msg.includes('PACK PREVIEW')){
    fail('preview pack selection did not update the wait-mode shell copy', result);
  }
  if(result.blocked?.started) fail('preview-only pack should not be startable yet', result);
  if(!String(result.blocked?.toast || '').toLowerCase().includes('shell preview only')){
    fail('preview-only pack did not explain why gameplay is blocked', result);
  }

  console.log(JSON.stringify({
    ok: true,
    packCount: result.opened.packCount,
    previewTitle: result.preview.title,
    previewMarquee: result.preview.marquee,
    blockedToast: result.blocked.toast
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

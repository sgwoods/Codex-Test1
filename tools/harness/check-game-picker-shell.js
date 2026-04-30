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
      const btn = document.querySelector('[data-pack-key="galaxy-guardians-preview"]');
      if(!btn) throw new Error('missing preview pack entry');
      btn.click();
    });

    const preview = await waitForHarness(page, () => {
      const title = document.title;
      const marquee = document.getElementById('cabinetMarqueeTitle')?.textContent || '';
      const msg = document.getElementById('msg')?.innerText || '';
      const modalOpen = document.getElementById('gamePreviewModal')?.classList.contains('open');
      const packKey = typeof window.currentGamePackKey === 'function' ? window.currentGamePackKey() : '';
      const hasPlayableAdapter = typeof window.currentGamePackHasPlayableAdapter === 'function' ? window.currentGamePackHasPlayableAdapter() : null;
      const hasDevPreviewAdapter = typeof window.currentGamePackHasDevPreviewAdapter === 'function' ? window.currentGamePackHasDevPreviewAdapter() : null;
      const canStart = typeof window.currentGamePackCanStart === 'function' ? window.currentGamePackCanStart() : null;
      return title.includes('Galaxy Guardians') && marquee.includes('Galaxy Guardians') && msg.includes('GALAXY GUARDIANS') && packKey === 'galaxy-guardians-preview'
        ? { title, marquee, msg: msg.replace(/\s+/g, ' ').trim(), modalOpen, packKey, hasPlayableAdapter, hasDevPreviewAdapter, canStart }
        : null;
    }, 1200, 40);

    const beforeTheme = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--marquee-border').trim()
    );

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#gamePickerCurrent [data-theme-id]'));
      const classic = btns.find(btn => btn.dataset.themeId === 'classic-blue');
      if(!classic) throw new Error('missing classic-blue theme button');
      classic.click();
    });

    const themed = await waitForHarness(page, () => {
      const themeLine = document.getElementById('gamePickerCurrent')?.innerText || '';
      const border = getComputedStyle(document.documentElement).getPropertyValue('--marquee-border').trim();
      return themeLine.includes('Classic Blue') && border
        ? { themeLine: themeLine.replace(/\s+/g, ' ').trim(), border }
        : null;
    }, 1200, 40);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    await page.keyboard.press('Enter');
    const launched = await waitForHarness(page, () => {
      const started = !!window.__galagaHarness__.snapshot().started;
      const modalOpen = !!document.getElementById('gamePreviewModal')?.classList.contains('open');
      const marquee = document.getElementById('cabinetMarqueeTitle')?.textContent || '';
      const packKey = typeof window.currentGamePackKey === 'function' ? window.currentGamePackKey() : '';
      const guardians = typeof window.__galagaHarness__.guardiansState === 'function' ? window.__galagaHarness__.guardiansState() : null;
      return started && packKey === 'galaxy-guardians-preview'
        ? { started, modalOpen, marquee, packKey, guardians }
        : null;
    }, 1200, 40);

    return { opened, preview, beforeTheme, themed, launched };
  });

  if(!result.opened?.railVisible) fail('left-side game picker rail did not render', result);
  if(!result.opened?.buttonExpanded || !result.opened?.modalOpen) fail('game picker did not open from the left rail control', result);
  if((result.opened?.packCount || 0) < 2) fail('game picker did not list both the live pack and the preview pack', result);
  if(!result.preview?.title.includes('Galaxy Guardians') || !result.preview?.marquee.includes('Galaxy Guardians')){
    fail('preview pack selection did not update the shell title and marquee', result);
  }
  if(
    !result.preview?.msg.includes('GALAXY GUARDIANS')
    || result.preview?.hasPlayableAdapter !== false
    || result.preview?.hasDevPreviewAdapter !== true
    || result.preview?.canStart !== true
  ){
    fail('preview pack selection did not update the split app/platform wait-mode copy and dev-preview boundary', result);
  }
  if(result.preview?.modalOpen){
    fail('dev-preview pack selection opened the sneak-peek splash instead of leaving Enter available for the dev playable preview', result);
  }
  if(result.beforeTheme === result.themed?.border){
    fail('switching shell theme did not change the cabinet chrome treatment', result);
  }
  if(!result.themed?.themeLine.includes('Classic Blue')){
    fail('shell theme picker did not update the current theme label', result);
  }
  if(!result.launched?.started){
    fail('launching from the preview shell did not start the Guardians dev playable preview', result);
  }
  if(result.launched?.modalOpen){
    fail('preview modal opened during Guardians dev playable launch', result);
  }
  if(result.launched?.packKey !== 'galaxy-guardians-preview' || !result.launched?.marquee.includes('Galaxy Guardians') || result.launched?.guardians?.gameKey !== 'galaxy-guardians-preview'){
    fail('launch did not stay inside the Galaxy Guardians dev-preview pack', result);
  }

  console.log(JSON.stringify({
    ok: true,
    packCount: result.opened.packCount,
    previewTitle: result.preview.title,
    previewMarquee: result.preview.marquee,
    themedBorder: result.themed.border,
    launchPackKey: result.launched.packKey
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

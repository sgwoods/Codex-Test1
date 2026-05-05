#!/usr/bin/env node
const { DIST_PRODUCTION } = require('../build/paths');
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({
    root: DIST_PRODUCTION,
    skipStart: true,
    stage: 1,
    ships: 2,
    seed: 1979
  }, async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.getElementById('gamePickerDockBtn');
      if(!btn) throw new Error('missing game picker dock button');
      btn.click();
    });
    await page.waitForTimeout(220);

    await page.evaluate(() => {
      const btn = document.querySelector('[data-pack-key="galaxy-guardians-preview"]');
      if(!btn) throw new Error('missing preview pack entry');
      btn.click();
    });

    const previewWait = await waitForHarness(page, () => {
      const packKey = typeof currentGamePackKey === 'function' ? currentGamePackKey() : '';
      if(packKey !== 'galaxy-guardians-preview') return null;
      return {
        packKey,
        buildChannel: document.getElementById('buildStampChannel')?.textContent || '',
        docTitle: document.title || '',
        marquee: document.getElementById('cabinetMarqueeTitle')?.textContent || '',
        modalOpen: !!document.getElementById('gamePreviewModal')?.classList.contains('open'),
        canStart: typeof currentGamePackCanStart === 'function' ? currentGamePackCanStart() : null,
        hasPlayableAdapter: typeof currentGamePackHasPlayableAdapter === 'function' ? currentGamePackHasPlayableAdapter() : null,
        hasDevPreviewAdapter: typeof currentGamePackHasDevPreviewAdapter === 'function' ? currentGamePackHasDevPreviewAdapter() : null,
        waitText: (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim()
      };
    }, 1800, 40);

    await page.keyboard.press('Enter');
    const launched = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      const guardians = typeof window.__galagaHarness__.guardiansState === 'function' ? window.__galagaHarness__.guardiansState() : null;
      if(!state.started || !guardians) return null;
      return {
        started: !!state.started,
        buildChannel: document.getElementById('buildStampChannel')?.textContent || '',
        packKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        guardians
      };
    }, 2200, 40);

    return { previewWait, launched };
  });

  if(result.previewWait.buildChannel !== 'PRODUCTION'){
    fail('Production preview check did not run against a promoted production build artifact', result);
  }
  if(!result.previewWait.docTitle.includes('Galaxy Guardians') || !result.previewWait.marquee.includes('Galaxy Guardians')){
    fail('Production preview pack selection did not update the shell identity', result);
  }
  if(result.previewWait.modalOpen){
    fail('Production preview pack selection still opened the sneak-peek modal instead of exposing the playable preview path', result);
  }
  if(result.previewWait.hasPlayableAdapter !== false || result.previewWait.hasDevPreviewAdapter !== true || result.previewWait.canStart !== true){
    fail('Production preview pack did not expose the expected hosted playable-preview boundary', result);
  }
  if(!result.previewWait.waitText.includes('GALAXY GUARDIANS')){
    fail('Production preview pack did not replace the wait-mode front-door copy', result);
  }
  if(result.launched.buildChannel !== 'PRODUCTION' || result.launched.packKey !== 'galaxy-guardians-preview'){
    fail('Production preview launch did not stay inside the promoted production build and Guardians pack', result);
  }
  if(result.launched.guardians.publicPlayable !== 0 || result.launched.guardians.previewPlayable !== 1 || result.launched.guardians.devPlayable !== 1){
    fail('Production preview launch did not preserve the expected hosted-preview runtime identity', result);
  }
  if(JSON.stringify(result.launched.guardians.playablePreviewReleaseChannels || []) !== JSON.stringify(['development','production beta','production'])){
    fail('Production preview launch did not preserve the expected hosted preview channel contract', result);
  }

  console.log(JSON.stringify({
    ok: true,
    buildChannel: result.previewWait.buildChannel,
    packKey: result.launched.packKey,
    eventTypes: result.launched.guardians.eventTypes,
    liveRoles: result.launched.guardians.liveRoles
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const releaseManifest = require('../../release-manifest.json');
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

const PLATFORM_ARCADE_MUSIC_PLAYLIST = String(releaseManifest.platform?.media?.arcadeMusicPlaylistId || '').trim();

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3 }, async ({ page }) => {
    const before = await page.evaluate(() => window.__platinumArcadeMusic?.state?.());

    await page.locator('#arcadeMusicToggleBtn').click();
    const requested = await waitForHarness(page, () => {
      const state = window.__platinumArcadeMusic?.state?.();
      const frame = document.querySelector('#arcadeMusicFrame');
      return state?.requested
        && state?.playlistSource === 'platform'
        && state?.activePlaylistId === state?.playlistId
        && frame
        ? {
            title: document.querySelector('#arcadeMusicToggleBtn')?.getAttribute('title') || '',
            state,
            src: frame.getAttribute('src') || '',
            events: window.__galagaHarness__?.recentEvents?.({ count: 40 }) || []
          }
        : null;
    }, 6000, 50);

    await page.reload();
    await page.waitForLoadState('load');
    await page.locator('body').click({ position: { x: 40, y: 40 } });

    const restored = await waitForHarness(page, () => {
      const state = window.__platinumArcadeMusic?.state?.();
      const frame = document.querySelector('#arcadeMusicFrame');
      return state?.requested
        && state?.playlistSource === 'platform'
        && state?.activePlaylistId === state?.playlistId
        && frame
        ? {
            title: document.querySelector('#arcadeMusicToggleBtn')?.getAttribute('title') || '',
            state,
            src: frame.getAttribute('src') || '',
            events: window.__galagaHarness__?.recentEvents?.({ count: 40 }) || []
          }
        : null;
    }, 6000, 50);

    return { before, requested, restored };
  });

  if(!result.before?.configured){
    fail('Arcade Music is not configured before product-playback verification', result);
  }
  if(result.before.playlistId !== PLATFORM_ARCADE_MUSIC_PLAYLIST || result.before.playlistSource !== 'platform'){
    fail('Arcade Music did not resolve to the configured platform playlist before playback', result);
  }
  if(!result.requested.src.includes(`list=${PLATFORM_ARCADE_MUSIC_PLAYLIST}`)){
    fail('Arcade Music did not mount the configured platform playlist on initial start', result);
  }
  if(!result.restored.src.includes(`list=${PLATFORM_ARCADE_MUSIC_PLAYLIST}`)){
    fail('Arcade Music did not remount the configured platform playlist after reload and interaction', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage, waitForHarness, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function openPicker(page){
  await page.evaluate(() => {
    const btn = document.getElementById('gamePickerDockBtn');
    if(!btn) throw new Error('missing game picker dock button');
    btn.click();
  });
  await page.waitForTimeout(180);
}

async function choosePack(page, key){
  await page.evaluate(packKey => {
    const btn = document.querySelector(`[data-pack-key="${packKey}"]`);
    if(!btn) throw new Error(`missing pack entry: ${packKey}`);
    btn.click();
  }, key);
}

async function readShellState(page){
  return page.evaluate(() => {
    const state = window.__galagaHarness__.state();
    const snap = window.__galagaHarness__.snapshot();
    return {
      started: !!state.started,
      stage: state.stage,
      packKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
      frontDoorTitle: typeof currentGamePackFrontDoor === 'function' ? (currentGamePackFrontDoor().title || '') : '',
      docTitle: document.title || '',
      marquee: document.getElementById('cabinetMarqueeTitle')?.textContent || '',
      settingsRuntime: document.getElementById('settingsRuntime')?.textContent || '',
      buildStampChannel: document.getElementById('buildStampChannel')?.textContent || '',
      waitText: (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim(),
      snapshotGameKey: snap.gameKey || ''
    };
  });
}

async function main(){
  const WAIT_TIMEOUT_MS = 2200;
  const result = await withHarnessPage({ stage: 2, ships: 2, challenge: false, seed: 52114 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.exportAndReset({ label: 'platinum_pack_boot_wait' }));
    await sleep(220);

    const auroraWait = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      if(state.started) return null;
      const snap = window.__galagaHarness__.snapshot();
      return {
        packKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        frontDoorTitle: typeof currentGamePackFrontDoor === 'function' ? (currentGamePackFrontDoor().title || '') : '',
        docTitle: document.title || '',
        marquee: document.getElementById('cabinetMarqueeTitle')?.textContent || '',
        settingsRuntime: document.getElementById('settingsRuntime')?.textContent || '',
        buildStampChannel: document.getElementById('buildStampChannel')?.textContent || '',
        waitText: (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim(),
        snapshotGameKey: snap.gameKey || ''
      };
    }, WAIT_TIMEOUT_MS, 40);

    await openPicker(page);
    await choosePack(page, 'galaxy-guardians-preview');

    const previewWait = await waitForHarness(page, () => {
      if(typeof currentGamePackKey !== 'function' || currentGamePackKey() !== 'galaxy-guardians-preview') return null;
      return {
        packKey: currentGamePackKey(),
        frontDoorTitle: typeof currentGamePackFrontDoor === 'function' ? (currentGamePackFrontDoor().title || '') : '',
        docTitle: document.title || '',
        marquee: document.getElementById('cabinetMarqueeTitle')?.textContent || '',
        settingsRuntime: document.getElementById('settingsRuntime')?.textContent || '',
        buildStampChannel: document.getElementById('buildStampChannel')?.textContent || '',
        waitText: (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim(),
        previewOpen: !!document.getElementById('gamePreviewModal')?.classList.contains('open')
      };
    }, WAIT_TIMEOUT_MS, 40);

    await page.locator('#gamePreviewClose').click();
    await page.waitForTimeout(120);

    await openPicker(page);
    await choosePack(page, 'aurora-galactica');

    const restoredWait = await waitForHarness(page, () => {
      if(typeof currentGamePackKey !== 'function' || currentGamePackKey() !== 'aurora-galactica') return null;
      const state = window.__galagaHarness__.state();
      if(state.started) return null;
      return {
        packKey: currentGamePackKey(),
        frontDoorTitle: typeof currentGamePackFrontDoor === 'function' ? (currentGamePackFrontDoor().title || '') : '',
        docTitle: document.title || '',
        marquee: document.getElementById('cabinetMarqueeTitle')?.textContent || '',
        settingsRuntime: document.getElementById('settingsRuntime')?.textContent || '',
        buildStampChannel: document.getElementById('buildStampChannel')?.textContent || '',
        waitText: (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim()
      };
    }, WAIT_TIMEOUT_MS, 40);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    await page.keyboard.press('Enter');

    const launched = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      if(!state.started) return null;
      const snap = window.__galagaHarness__.snapshot();
      return {
        state,
        packKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        frontDoorTitle: typeof currentGamePackFrontDoor === 'function' ? (currentGamePackFrontDoor().title || '') : '',
        docTitle: document.title || '',
        marquee: document.getElementById('cabinetMarqueeTitle')?.textContent || '',
        settingsRuntime: document.getElementById('settingsRuntime')?.textContent || '',
        buildStampChannel: document.getElementById('buildStampChannel')?.textContent || '',
        snapshotGameKey: snap.gameKey || '',
        player: snap.player || {}
      };
    }, WAIT_TIMEOUT_MS, 40);

    const finalShell = await readShellState(page);
    return { auroraWait, previewWait, restoredWait, launched, finalShell };
  });

  if(result.auroraWait.packKey !== 'aurora-galactica') fail('Aurora was not the active installed pack in initial wait mode', result);
  if(!result.auroraWait.docTitle.includes('Aurora Galactica') || !result.auroraWait.marquee.includes('Aurora Galactica')){
    fail('Aurora wait mode was not rendering the selected pack shell identity', result);
  }
  if(!result.auroraWait.settingsRuntime.includes('Platinum · Aurora Galactica')){
    fail('Aurora wait mode was not visibly labelled as running on Platinum', result);
  }
  if(!result.auroraWait.buildStampChannel.includes('Platinum · Aurora Galactica')){
    fail('build stamp was not visibly labelled with the Platinum runtime and active pack', result);
  }
  if(!result.auroraWait.waitText.includes('AURORA GALACTICA')) fail('Aurora wait mode was not using pack-owned front-door copy', result);
  if(result.auroraWait.snapshotGameKey !== 'aurora-galactica') fail('Wait-mode snapshot did not preserve the active pack game key', result);

  if(result.previewWait.packKey !== 'galaxy-guardians-preview') fail('Preview pack did not become the active installed pack', result);
  if(!result.previewWait.docTitle.includes('Galaxy Guardians') || !result.previewWait.marquee.includes('Galaxy Guardians')){
    fail('Preview pack did not update the Platinum shell identity', result);
  }
  if(!result.previewWait.settingsRuntime.includes('Platinum · Galaxy Guardians')){
    fail('Preview pack did not update the visible Platinum runtime label', result);
  }
  if(!result.previewWait.waitText.includes('GALAXY GUARDIANS')) fail('Preview pack did not replace the wait-mode front-door copy', result);
  if(!result.previewWait.previewOpen) fail('Preview pack did not open the coming-soon splash', result);

  if(result.restoredWait.packKey !== 'aurora-galactica') fail('Aurora was not restorable through the selected-pack path', result);
  if(!result.restoredWait.settingsRuntime.includes('Platinum · Aurora Galactica')){
    fail('Restoring Aurora did not restore the visible Platinum runtime label', result);
  }
  if(!result.restoredWait.waitText.includes('AURORA GALACTICA')) fail('Aurora front door did not return after restoring the pack', result);

  if(result.launched.packKey !== 'aurora-galactica') fail('Aurora did not launch through the active installed pack path', result);
  if(result.launched.snapshotGameKey !== 'aurora-galactica') fail('Launched snapshot did not preserve the active pack game key', result);
  if((result.launched.state.stage || 0) !== 2) fail('Aurora did not preserve the configured stage when launched through Platinum', result);
  if(Math.abs((result.launched.player.x || 0) - 140) > 3) fail('Aurora did not start the player in the expected lane through Platinum', result);

  console.log(JSON.stringify({
    ok: true,
    initialPack: result.auroraWait.packKey,
    initialRuntime: result.auroraWait.settingsRuntime,
    previewPack: result.previewWait.packKey,
    previewRuntime: result.previewWait.settingsRuntime,
    restoredPack: result.restoredWait.packKey,
    launchedPack: result.launched.packKey,
    launchedStage: result.launched.state.stage
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

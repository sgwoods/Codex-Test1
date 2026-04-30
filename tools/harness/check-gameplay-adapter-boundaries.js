#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, stage: 2, ships: 2, seed: 91827 }, async ({ page }) => {
    const initial = await page.evaluate(() => {
      const adapters = typeof availableGameplayAdapters === 'function' ? availableGameplayAdapters() : {};
      const devAdapters = typeof availableDevPreviewGameplayAdapters === 'function' ? availableDevPreviewGameplayAdapters() : {};
      const packs = typeof availableGamePacks === 'function' ? availableGamePacks() : {};
      return {
        adapterKeys: Object.keys(adapters),
        devAdapterKeys: Object.keys(devAdapters),
        auroraPackPlayable: typeof packIsPlayable === 'function' ? packIsPlayable(packs['aurora-galactica']) : null,
        guardiansPackPlayable: typeof packIsPlayable === 'function' ? packIsPlayable(packs['galaxy-guardians-preview']) : null,
        auroraHasAdapter: typeof gamePackHasPlayableAdapter === 'function' ? gamePackHasPlayableAdapter('aurora-galactica') : null,
        guardiansHasAdapter: typeof gamePackHasPlayableAdapter === 'function' ? gamePackHasPlayableAdapter('galaxy-guardians-preview') : null,
        guardiansHasDevAdapter: typeof gamePackHasDevPreviewAdapter === 'function' ? gamePackHasDevPreviewAdapter('galaxy-guardians-preview') : null,
        currentKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        currentHasAdapter: typeof currentGamePackHasPlayableAdapter === 'function' ? currentGamePackHasPlayableAdapter() : null
      };
    });

    await page.evaluate(() => {
      installGamePack('galaxy-guardians-preview');
      if(typeof draw === 'function')draw();
    });
    const previewInstalled = await page.evaluate(() => ({
      key: currentGamePackKey(),
      playable: currentGamePackPlayable(),
      hasAdapter: currentGamePackHasPlayableAdapter(),
      hasDevAdapter: currentGamePackHasDevPreviewAdapter(),
      canStart: currentGamePackCanStart(),
      started: window.__galagaHarness__.state().started
    }));

    await page.keyboard.press('Enter');
    const launchDevPreview = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      if(!state.started) return null;
      return {
        key: currentGamePackKey(),
        hasAdapter: currentGamePackHasPlayableAdapter(),
        hasDevAdapter: currentGamePackHasDevPreviewAdapter(),
        started: !!state.started,
        stage: state.stage,
        snapshotGameKey: window.__galagaHarness__.snapshot().gameKey || '',
        guardians: window.__galagaHarness__.guardiansState()
      };
    }, 2600, 40);

    return { initial, previewInstalled, launchDevPreview };
  });

  if(!result.initial.adapterKeys.includes('aurora-galactica')){
    fail('Aurora gameplay adapter was not registered', result);
  }
  if(result.initial.adapterKeys.includes('galaxy-guardians-preview')){
    fail('Galaxy Guardians registered a gameplay adapter before its owned gameplay slice exists', result);
  }
  if(!result.initial.devAdapterKeys.includes('galaxy-guardians-preview') || result.initial.devAdapterKeys.includes('aurora-galactica')){
    fail('Galaxy Guardians dev-only preview adapter registry is not isolated from the public gameplay registry', result);
  }
  if(result.initial.auroraPackPlayable !== true || result.initial.auroraHasAdapter !== true){
    fail('Aurora is not both metadata-playable and adapter-playable', result);
  }
  if(result.initial.guardiansPackPlayable !== false || result.initial.guardiansHasAdapter !== false || result.initial.guardiansHasDevAdapter !== true){
    fail('Galaxy Guardians preview is not correctly split between public adapter blocking and dev-only preview routing', result);
  }
  if(result.previewInstalled.key !== 'galaxy-guardians-preview' || result.previewInstalled.hasAdapter !== false || result.previewInstalled.hasDevAdapter !== true || result.previewInstalled.canStart !== true){
    fail('Galaxy Guardians preview did not enter the expected dev-preview adapter state before launch', result);
  }
  if(result.previewInstalled.started){
    fail('Galaxy Guardians preview started gameplay before explicit launch', result);
  }
  if(result.launchDevPreview.key !== 'galaxy-guardians-preview' || result.launchDevPreview.snapshotGameKey !== 'galaxy-guardians-preview'){
    fail('Galaxy Guardians dev-preview launch did not stay inside the Guardians pack boundary', result);
  }
  if(result.launchDevPreview.hasAdapter !== false || result.launchDevPreview.hasDevAdapter !== true || !result.launchDevPreview.started){
    fail('Galaxy Guardians dev-preview did not start through the dev-only adapter path', result);
  }
  if(!result.launchDevPreview.guardians || result.launchDevPreview.guardians.publicPlayable !== 0 || result.launchDevPreview.guardians.devPlayable !== 1){
    fail('Galaxy Guardians dev-preview launch did not expose the expected runtime summary', result);
  }

  console.log(JSON.stringify({
    ok: true,
    adapterKeys: result.initial.adapterKeys,
    devAdapterKeys: result.initial.devAdapterKeys,
    guardiansHasAdapter: result.initial.guardiansHasAdapter,
    guardiansHasDevAdapter: result.initial.guardiansHasDevAdapter,
    launchedPack: result.launchDevPreview.key,
    launchedStage: result.launchDevPreview.stage
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

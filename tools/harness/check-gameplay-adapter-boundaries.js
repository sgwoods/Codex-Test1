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
      const packs = typeof availableGamePacks === 'function' ? availableGamePacks() : {};
      return {
        adapterKeys: Object.keys(adapters),
        auroraPackPlayable: typeof packIsPlayable === 'function' ? packIsPlayable(packs['aurora-galactica']) : null,
        guardiansPackPlayable: typeof packIsPlayable === 'function' ? packIsPlayable(packs['galaxy-guardians-preview']) : null,
        auroraHasAdapter: typeof gamePackHasPlayableAdapter === 'function' ? gamePackHasPlayableAdapter('aurora-galactica') : null,
        guardiansHasAdapter: typeof gamePackHasPlayableAdapter === 'function' ? gamePackHasPlayableAdapter('galaxy-guardians-preview') : null,
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
      started: window.__galagaHarness__.state().started
    }));

    await page.keyboard.press('Enter');
    const launchFallback = await waitForHarness(page, () => {
      const state = window.__galagaHarness__.state();
      if(!state.started) return null;
      return {
        key: currentGamePackKey(),
        hasAdapter: currentGamePackHasPlayableAdapter(),
        started: !!state.started,
        stage: state.stage,
        snapshotGameKey: window.__galagaHarness__.snapshot().gameKey || ''
      };
    }, 2600, 40);

    return { initial, previewInstalled, launchFallback };
  });

  if(!result.initial.adapterKeys.includes('aurora-galactica')){
    fail('Aurora gameplay adapter was not registered', result);
  }
  if(result.initial.adapterKeys.includes('galaxy-guardians-preview')){
    fail('Galaxy Guardians registered a gameplay adapter before its owned gameplay slice exists', result);
  }
  if(result.initial.auroraPackPlayable !== true || result.initial.auroraHasAdapter !== true){
    fail('Aurora is not both metadata-playable and adapter-playable', result);
  }
  if(result.initial.guardiansPackPlayable !== false || result.initial.guardiansHasAdapter !== false){
    fail('Galaxy Guardians preview is not blocked by the gameplay adapter boundary', result);
  }
  if(result.previewInstalled.key !== 'galaxy-guardians-preview' || result.previewInstalled.hasAdapter !== false){
    fail('Galaxy Guardians preview did not enter the expected non-adapter state before launch', result);
  }
  if(result.previewInstalled.started){
    fail('Galaxy Guardians preview started gameplay before launch fallback', result);
  }
  if(result.launchFallback.key !== 'aurora-galactica' || result.launchFallback.snapshotGameKey !== 'aurora-galactica'){
    fail('Preview launch did not fall back to the Aurora gameplay adapter', result);
  }
  if(result.launchFallback.hasAdapter !== true || !result.launchFallback.started){
    fail('Fallback did not start through a playable gameplay adapter', result);
  }

  console.log(JSON.stringify({
    ok: true,
    adapterKeys: result.initial.adapterKeys,
    guardiansHasAdapter: result.initial.guardiansHasAdapter,
    fallbackPack: result.launchFallback.key,
    fallbackStage: result.launchFallback.stage
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

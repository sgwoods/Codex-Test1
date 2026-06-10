#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 62291 }, async ({ page }) => {
    return page.evaluate(() => {
      const stateForPack = (gameKey) => {
        if(typeof installGamePack === 'function') installGamePack(gameKey, { persist: false });
        if(typeof syncAudioMixControls === 'function') syncAudioMixControls();
        return window.__platinumAudioMix?.state?.() || null;
      };
      return {
        aurora: stateForPack('aurora-galactica'),
        guardians: stateForPack('galaxy-guardians-preview')
      };
    });
  });

  for(const [name, state] of Object.entries(result)){
    if(!state) fail(`${name} did not expose audio mix state`, result);
    if(state.gameSoundPercent !== 40 || state.arcadeMusicPercent !== 60){
      fail(`${name} audio mix default no longer matches 40 percent game sounds / 60 percent music`, result);
    }
    if(Math.abs((+state.gameSoundVolume || 0) - 0.4) > 0.001 || Math.abs((+state.arcadeMusicVolume || 0) - 0.6) > 0.001){
      fail(`${name} audio mix baseline volumes drifted from Aurora/Guardians parity`, result);
    }
  }
  if(result.aurora.gameSoundPercent !== result.guardians.gameSoundPercent || result.aurora.arcadeMusicPercent !== result.guardians.arcadeMusicPercent){
    fail('Guardians audio mix defaults no longer match Aurora', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

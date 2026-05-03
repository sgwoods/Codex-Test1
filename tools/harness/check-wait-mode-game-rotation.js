#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 1979, skipStart: true }, async ({ page }) => {
    const showcase = await waitForHarness(page, () => {
      window.__platinumWaitModeShowcaseForce = 'galaxy-guardians-preview';
      if(typeof draw === 'function') draw();
      const text = (document.getElementById('msg')?.innerText || '').replace(/\s+/g, ' ').trim();
      const renderer = window.__galaxyGuardiansPreviewRenderDebug || {};
      const renderDebug = window.__platinumRenderDebug || {};
      if(!text.includes('GALAXY GUARDIANS') || renderer.renderMode !== 'galaxy-guardians-dev-preview') return null;
      return {
        activePack: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        showcaseKey: typeof currentWaitModeShowcasePackKey === 'function' ? currentWaitModeShowcasePackKey() : '',
        waitText: text,
        boardRenderer: renderDebug.boardRendererKey || '',
        previewRenderMode: renderer.renderMode || '',
        alienCount: renderer.alienCount || 0
      };
    }, 2400, 40);

    await page.keyboard.press('Enter');
    const launched = await waitForHarness(page, () => {
      const state = window.__galagaHarness__?.state?.();
      if(!state?.started) return null;
      const snap = window.__galagaHarness__.snapshot();
      return {
        activePack: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        snapshotGameKey: snap.gameKey || '',
        started: !!state.started,
        stage: state.stage
      };
    }, 2400, 40);

    return { showcase, launched };
  });

  if(result.showcase.activePack !== 'aurora-galactica'){
    fail('Wait-mode showcase switched the active playable pack instead of keeping Aurora primary', result);
  }
  if(result.showcase.showcaseKey !== 'galaxy-guardians-preview'){
    fail('Wait-mode showcase did not expose Galaxy Guardians as the rotating preview pack', result);
  }
  if(result.showcase.boardRenderer !== 'galaxy-guardians-preview' || result.showcase.previewRenderMode !== 'galaxy-guardians-dev-preview'){
    fail('Wait-mode showcase did not render the Guardians preview board', result);
  }
  if(!result.showcase.waitText.includes('PRESS ENTER TO START AURORA')){
    fail('Wait-mode showcase did not make Aurora launch behavior clear', result);
  }
  if(result.launched.activePack !== 'aurora-galactica' || result.launched.snapshotGameKey !== 'aurora-galactica'){
    fail('Pressing Enter from the Guardians showcase did not launch Aurora as the primary playable game', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function sample(mode){
  return withHarnessPage({
    stage: 1,
    ships: 3,
    challenge: false,
    seed: 514223,
    skipStart: true
  }, async ({ page }) => {
    await page.evaluate(spriteRenderMode => {
      window.__galagaHarness__.start({
        stage: 1,
        ships: 3,
        challenge: false,
        seed: 514223,
        autoVideo: false,
        spriteRenderMode
      });
    }, mode);
    return waitForHarness(page, () => {
      const state = window.__galagaHarness__?.state?.();
      const render = window.__galagaHarness__?.renderState?.();
      if(!state?.started || !render?.spriteRenderMode) return null;
      return {
        requestedMode: state.graphics?.spriteRenderMode || '',
        renderMode: render.spriteRenderMode || '',
        referencePixelSprites: !!render.referencePixelSprites,
        backgroundMode: render.backgroundMode || '',
        boardRendererKey: render.boardRendererKey || ''
      };
    }, 2400, 40);
  });
}

async function main(){
  const results = {
    auto: await sample('auto'),
    aurora: await sample('aurora-themed'),
    reference: await sample('reference-pixel-lab'),
    staleReferenceAlias: await sample('reference-pixel')
  };

  if(results.auto.referencePixelSprites){
    fail('Auto sprite rendering leaked reference-pixel lab sprites into normal gameplay', results);
  }
  if(results.aurora.referencePixelSprites){
    fail('Aurora themed sprite rendering leaked reference-pixel lab sprites into normal gameplay', results);
  }
  if(!results.reference.referencePixelSprites){
    fail('Reference Pixel Lab mode did not enable reference-pixel sprites for measurement work', results);
  }
  if(results.staleReferenceAlias.referencePixelSprites){
    fail('Stale pre-lab reference-pixel setting still enables experimental sprites', results);
  }
  if(results.auto.boardRendererKey !== 'aurora-galactica'){
    fail('Auto sprite rendering guard did not boot the Aurora board renderer', results);
  }

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

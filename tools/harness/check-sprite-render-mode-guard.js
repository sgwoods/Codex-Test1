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
      window.__galagaHarness__.setTest({
        stage: 1,
        ships: 3,
        challenge: false,
        seed: 514223,
        graphicsTheme: 'classic-arcade',
        spriteRenderMode
      });
      window.__galagaHarness__.start({
        seed: 514223,
        autoVideo: false
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

const FORMATION_SCALE_SPECS = [
  { spriteKey: 'bee-line', kind: 'bee-line', challenge: false },
  { spriteKey: 'but-line', kind: 'but-line', challenge: false },
  { spriteKey: 'boss-line', kind: 'boss-line', challenge: false },
  { spriteKey: 'rogue-fighter', kind: 'rogue-fighter', challenge: false },
  { spriteKey: 'challenge-dragonfly', kind: 'challenge-dragonfly', challenge: true },
  { spriteKey: 'challenge-mosquito', kind: 'challenge-mosquito', challenge: true }
];
const REFERENCE_PIXEL_LAB_MAX_LOGICAL_BBOX = { width: 18.5, height: 14.8 };

async function referencePixelLabScaleSamples(){
  return withHarnessPage({
    stage: 1,
    ships: 3,
    challenge: false,
    seed: 514223,
    skipStart: true
  }, async ({ page }) => {
    const samples = [];
    for(const spec of FORMATION_SCALE_SPECS){
      samples.push(await page.evaluate(({ spec, maxBbox }) => {
        window.__galagaHarness__.setTest({
          stage: spec.challenge ? 3 : 1,
          ships: 3,
          challenge: !!spec.challenge,
          seed: 514223,
          graphicsTheme: 'classic-arcade',
          spriteRenderMode: 'reference-pixel-lab',
          starfieldIntensity: 0,
          starfieldSpeed: 0
        });
        const captureSpec = {
          kind: spec.kind,
          challenge: !!spec.challenge,
          playfieldWidth: spec.spriteKey === 'boss-line' ? 62 : 54,
          playfieldHeight: spec.spriteKey === 'boss-line' ? 52 : 48
        };
        const setup = window.__galagaHarness__.setupSpriteRuntimeCapture(captureSpec);
        const subject = setup.enemies && setup.enemies[0];
        const canvas = document.getElementById('c');
        const frame = document.getElementById('playfieldFrame');
        const ctx = canvas.getContext('2d');
        const canvasRect = canvas.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const canvasScaleX = canvas.width / canvasRect.width;
        const canvasScaleY = canvas.height / canvasRect.height;
        const scaleX = (frameRect.width - 4) / 280;
        const scaleY = (frameRect.height - 4) / 360;
        const left = frameRect.left + 2 + (subject.x - captureSpec.playfieldWidth / 2) * scaleX;
        const top = frameRect.top + 2 + (subject.y - captureSpec.playfieldHeight / 2) * scaleY;
        const width = captureSpec.playfieldWidth * scaleX;
        const height = captureSpec.playfieldHeight * scaleY;
        const sx = Math.max(0, Math.floor((left - canvasRect.left) * canvasScaleX));
        const sy = Math.max(0, Math.floor((top - canvasRect.top) * canvasScaleY));
        const sw = Math.max(1, Math.floor(width * canvasScaleX));
        const sh = Math.max(1, Math.floor(height * canvasScaleY));
        const data = ctx.getImageData(sx, sy, sw, sh).data;
        let minX = sw, minY = sh, maxX = -1, maxY = -1, litPixels = 0;
        for(let y = 0; y < sh; y++){
          for(let x = 0; x < sw; x++){
            const i = (y * sw + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if(a > 0 && r + g + b > 90 && Math.max(r, g, b) > 38){
              litPixels++;
              if(x < minX) minX = x;
              if(y < minY) minY = y;
              if(x > maxX) maxX = x;
              if(y > maxY) maxY = y;
            }
          }
        }
        const bbox = maxX >= 0 ? {
          width: +(maxX - minX + 1).toFixed(2),
          height: +(maxY - minY + 1).toFixed(2)
        } : null;
        const logicalBbox = bbox ? {
          width: +((bbox.width / canvasScaleX) / scaleX).toFixed(2),
          height: +((bbox.height / canvasScaleY) / scaleY).toFixed(2)
        } : null;
        return {
          spriteKey: spec.spriteKey,
          renderMode: window.__galagaHarness__.renderState().spriteRenderMode,
          bbox,
          logicalBbox,
          litPixels,
          maxBbox
        };
      }, { spec, maxBbox: REFERENCE_PIXEL_LAB_MAX_LOGICAL_BBOX }));
    }
    return samples;
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
  results.referencePixelLabScaleSamples = await referencePixelLabScaleSamples();
  for(const item of results.referencePixelLabScaleSamples){
    if(!item.logicalBbox){
      fail('Reference Pixel Lab sprite scale guard could not find visible enemy pixels', results);
    }
    if(item.logicalBbox.width > REFERENCE_PIXEL_LAB_MAX_LOGICAL_BBOX.width || item.logicalBbox.height > REFERENCE_PIXEL_LAB_MAX_LOGICAL_BBOX.height){
      fail('Reference Pixel Lab sprite is too large for the 40-enemy formation rack', results);
    }
  }

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

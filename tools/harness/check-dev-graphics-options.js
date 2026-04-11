#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 24138, skipStart: true }, async ({ page }) => {
    const defaults = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 1, ships: 3, challenge: false, audioTheme: 'auto', graphicsTheme: 'auto', starfieldIntensity: 1, starfieldSpeed: 1 });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    const vividAurora = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 1, ships: 3, challenge: false, graphicsTheme: 'aurora-borealis', starfieldIntensity: 1.5, starfieldSpeed: 1.3 });
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    const forcedClassic = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 3, challenge: false, audioTheme: 'auto', graphicsTheme: 'classic-arcade', starfieldIntensity: 1, starfieldSpeed: 1 });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    const galagaReference = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 3, challenge: false, audioTheme: 'galaga-original-reference', graphicsTheme: 'auto', starfieldIntensity: 1, starfieldSpeed: 1 });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    const galagaReferenceAssets = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 3, challenge: false, audioTheme: 'galaga-reference-assets', graphicsTheme: 'auto', starfieldIntensity: 1, starfieldSpeed: 1 });
      window.__galagaHarness__.restartCurrentConfig();
      const state = window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
      const cue = window.__galagaHarness__.triggerAudioCue('gameStart', { phase: 'stage', atmosphereTheme: 'aurora-borealis' });
      return { state, cue };
    });
    return { defaults, vividAurora, forcedClassic, galagaReference, galagaReferenceAssets };
  });

  if(result.defaults.visualAtmosphere?.backgroundMode !== 'classic-stars') fail('default graphics settings no longer preserve the stage 1 classic stars background', result);
  if(result.defaults.renderDebug?.starfieldIntensityScale !== 1) fail('default graphics settings no longer resolve the reference starfield intensity', result);
  if(result.defaults.renderDebug?.starfieldSpeedScale !== 1) fail('default graphics settings no longer resolve the reference starfield speed', result);

  if(result.vividAurora.visualAtmosphere?.id !== 'aurora-borealis') fail('graphics theme override did not switch the live visual atmosphere to Aurora Borealis', result);
  if(result.vividAurora.renderDebug?.backgroundMode !== 'aurora-borealis') fail('graphics theme override did not switch the rendered background mode', result);
  if(result.vividAurora.renderDebug?.starfieldIntensityScale !== 1.5) fail('starfield intensity override did not reach the render path', result);
  if(result.vividAurora.renderDebug?.starfieldSpeedScale !== 1.3) fail('starfield speed override did not reach the render path', result);

  if(result.forcedClassic.atmosphere?.audioTheme !== 'aurora-surge') fail('graphics override changed the stage audio atmosphere; it should stay visual-only', result);
  if(result.forcedClassic.visualAtmosphere?.id !== 'classic-arcade') fail('forced classic graphics theme did not switch the visual atmosphere', result);
  if(result.forcedClassic.renderDebug?.backgroundMode !== 'classic-stars') fail('forced classic graphics theme did not switch the rendered background back to classic stars', result);

  if(result.galagaReference.audio?.audioTheme !== 'galaga-original-reference') fail('audio theme override did not persist into developer settings state', result);
  if(result.galagaReference.atmosphere?.audioTheme !== 'galaga-original-reference') fail('Galaga original reference audio theme did not force the dedicated Galaga gameplay audio resolution', result);
  if(result.galagaReference.visualAtmosphere?.id !== 'aurora-borealis') fail('audio theme override leaked into visual atmosphere selection; it should stay audio-only', result);
  if(result.galagaReferenceAssets.state?.audio?.audioTheme !== 'galaga-reference-assets') fail('Galaga reference assets override did not persist into developer settings state', result);
  if(result.galagaReferenceAssets.state?.atmosphere?.audioTheme !== 'galaga-reference-assets') fail('Galaga reference assets audio theme did not force the dedicated reference-audio gameplay resolution', result);
  if(!result.galagaReferenceAssets.cue?.referenceClip) fail('Galaga reference assets mode did not resolve an actual reference clip through the live audio system', result);
  if(result.galagaReferenceAssets.state?.visualAtmosphere?.id !== 'aurora-borealis') fail('Galaga reference assets override leaked into visual atmosphere selection; it should stay audio-only', result);

  console.log(JSON.stringify({
    ok: true,
    defaults: result.defaults.graphics,
    vividAurora: {
      graphics: result.vividAurora.graphics,
      visualAtmosphere: result.vividAurora.visualAtmosphere,
      renderDebug: result.vividAurora.renderDebug
    },
    forcedClassic: {
      stageAtmosphere: result.forcedClassic.atmosphere,
      visualAtmosphere: result.forcedClassic.visualAtmosphere,
      renderDebug: result.forcedClassic.renderDebug
    },
    galagaReference: {
      audio: result.galagaReference.audio,
      stageAtmosphere: result.galagaReference.atmosphere,
      visualAtmosphere: result.galagaReference.visualAtmosphere
    },
    galagaReferenceAssets: {
      audio: result.galagaReferenceAssets.state.audio,
      stageAtmosphere: result.galagaReferenceAssets.state.atmosphere,
      visualAtmosphere: result.galagaReferenceAssets.state.visualAtmosphere,
      cue: result.galagaReferenceAssets.cue
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

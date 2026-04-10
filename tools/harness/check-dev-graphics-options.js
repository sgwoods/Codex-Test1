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
      window.__galagaHarness__.setTest({ stage: 1, ships: 3, challenge: false, graphicsTheme: 'auto', starfieldIntensity: 1, starfieldSpeed: 1 });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    const vividAurora = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 1, ships: 3, challenge: false, graphicsTheme: 'aurora-borealis', starfieldIntensity: 1.5, starfieldSpeed: 1.3 });
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    const forcedClassic = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 3, challenge: false, graphicsTheme: 'classic-arcade', starfieldIntensity: 1, starfieldSpeed: 1 });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.advanceFor(0.1, { step: 1 / 60 });
    });
    return { defaults, vividAurora, forcedClassic };
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
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

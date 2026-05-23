#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxy-guardians-identity',
  'opening-slice-render-surface-0.1.json'
);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function loadArtifact(){
  return JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
}

async function main(){
  const artifact = loadArtifact();
  const cfg = artifact.renderExpectations || {};
  const result = await withHarnessPage({
    skipStart: true,
    stage: Math.max(1, +cfg.stage || 1),
    ships: Math.max(1, +cfg.ships || 3),
    seed: (+cfg.seed >>> 0) || 1979
  }, async ({ page }) => {
    await page.evaluate(seed => {
      window.__platinumWaitModeShowcaseForce = 'galaxy-guardians-preview';
      if(typeof resetGalaxyGuardiansPreviewRenderState === 'function'){
        resetGalaxyGuardiansPreviewRenderState(seed >>> 0);
      }
      if(typeof draw === 'function') draw();
    }, (+cfg.seed >>> 0) || 1979);

    const first = await waitForHarness(page, () => {
      const debug = window.__galaxyGuardiansPreviewRenderDebug || {};
      if(debug.renderMode !== 'galaxy-guardians-dev-preview') return null;
      if(!Array.isArray(debug.starfieldLeadSample) || debug.starfieldLeadSample.length < 3) return null;
      if(!debug.stageFlagCount || debug.reserveShipCount == null) return null;
      return JSON.parse(JSON.stringify(debug));
    }, 3200, 40);

    await page.waitForTimeout(650);
    const second = await page.evaluate(() => JSON.parse(JSON.stringify(window.__galaxyGuardiansPreviewRenderDebug || {})));

    await page.waitForTimeout(1400);
    const third = await page.evaluate(() => JSON.parse(JSON.stringify(window.__galaxyGuardiansPreviewRenderDebug || {})));
    const runtimeWrap = await page.evaluate(() => {
      const state = window.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
      state.player.inv = 999;
      let firstWrappingSample = null;
      for(let i = 0; i < 760; i++){
        window.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
        if(!firstWrappingSample){
          const summary = window.summarizeGalaxyGuardiansRuntime(state);
          const wrapping = (summary.activeDives || []).filter(alien => alien.mode === 'wrapping');
          if(wrapping.length){
            firstWrappingSample = {
              t: +(state.t || 0).toFixed(3),
              wrapping
            };
          }
        }
      }
      return {
        summary: window.summarizeGalaxyGuardiansRuntime(state),
        wrapEvents: state.events.filter(event => event.type === 'enemy_wrap_or_return'),
        firstWrappingSample
      };
    });

    return { first, second, third, runtimeWrap };
  });

  if(artifact.status !== 'opening-slice-render-contract-not-frame-extracted'){
    fail('Opening-slice render artifact has the wrong status', result);
  }

  for(const field of cfg.requiredDebugFields || []){
    if(!(field in (result.first || {}))){
      fail(`Opening-slice render debug is missing required field ${field}`, result);
    }
  }

  if(result.first.renderMode !== 'galaxy-guardians-dev-preview'){
    fail('Opening-slice board did not use the Guardians preview renderer', result);
  }
  if((result.first.starfieldCount || 0) < (+cfg.minimumStarfieldCount || 0)){
    fail('Opening-slice board did not keep the expected moving starfield density', result);
  }
  if((result.first.reserveShipCount || 0) !== (+cfg.reserveShipCount || 0)){
    fail('Opening-slice board reserve-ship count drifted from the baseline expectation', result);
  }
  if((result.first.stageFlagCount || 0) < (+cfg.minimumStageFlagCount || 0)){
    fail('Opening-slice board did not render the expected stage-flag count', result);
  }
  if(!result.first.readyMissileVisible){
    fail('Opening-slice board did not expose the ready-to-fire missile indicator', result);
  }

  const labels = Array.isArray(result.first.hudLabels) ? result.first.hudLabels : [];
  for(const label of cfg.requiredHudLabels || []){
    if(!labels.includes(label)){
      fail(`Opening-slice HUD is missing required label ${label}`, result);
    }
  }

  const firstStars = Array.isArray(result.first.starfieldLeadSample) ? result.first.starfieldLeadSample : [];
  const secondStars = Array.isArray(result.second.starfieldLeadSample) ? result.second.starfieldLeadSample : [];
  const starfieldTravel = firstStars.length === secondStars.length ? firstStars.map((star, index) => {
    const later = secondStars[index] || {};
    return Math.max(
      Math.abs((+later.y || 0) - (+star.y || 0)),
      Math.abs((+later.x || 0) - (+star.x || 0))
    );
  }) : [];
  const requiredTravel = +cfg.minimumStarfieldLeadTravelPxBetweenSamples || 0.5;
  if(!starfieldTravel.some(distance => distance >= requiredTravel)){
    fail('Opening-slice board starfield did not visibly move between samples', result);
  }
  const marchOffsets = [result.first, result.second, result.third]
    .map(sample => +sample?.marchOffset || 0);
  const marchSpan = Math.max(...marchOffsets) - Math.min(...marchOffsets);
  if(marchSpan < 8){
    fail('Opening-slice rack march offset did not progress enough across the stepped sample window', Object.assign({
      marchOffsets,
      marchSpan
    }, result));
  }

  if(!result.runtimeWrap.firstWrappingSample || !result.runtimeWrap.firstWrappingSample.wrapping.length){
    fail('Runtime did not produce a visible top re-entry sample after bottom pass-through', result);
  }
  const maximumTopReentryLeadY = Number.isFinite(+cfg.maximumTopReentryLeadY) ? +cfg.maximumTopReentryLeadY : -1;
  if(!(result.runtimeWrap.firstWrappingSample.wrapping.some(alien => +alien.y <= maximumTopReentryLeadY))){
    fail('Top re-entry sample did not begin far enough above the board to read as a continuous return', result);
  }
  if(!result.runtimeWrap.firstWrappingSample.wrapping.some(alien => +alien.y < 0)){
    fail('Top re-entry sample did not place a wrapping alien back above the top of the board', result);
  }
  if(!Array.isArray(result.runtimeWrap.wrapEvents) || !result.runtimeWrap.wrapEvents.some(event => event.reentry === 'top')){
    fail('Wrap/return events no longer mark the top re-entry path', result);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    renderMode: result.first.renderMode,
    reserveShipCount: result.first.reserveShipCount,
    stageFlagCount: result.first.stageFlagCount,
    readyMissileVisible: result.first.readyMissileVisible,
    starfieldCount: result.first.starfieldCount,
    firstMarchOffset: result.first.marchOffset,
    secondMarchOffset: result.second.marchOffset,
    thirdMarchOffset: result.third.marchOffset,
    wrapEvents: result.runtimeWrap.wrapEvents.length,
    firstWrappingSample: result.runtimeWrap.firstWrappingSample
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

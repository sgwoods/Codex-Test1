#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 3, ships: 3, challenge: true, seed: 9052 }, async ({ page }) => {
    return page.evaluate(() => window.__galagaHarness__.challengeFormationState());
  });

  if(!result || !result.challenge){
    fail('expected a challenge-stage formation state for stage 3', result);
  }
  if(!result.layout){
    fail('challenge layout was not exposed through the harness', result);
  }
  if(result.enemies.length !== 40){
    fail('challenge stage did not produce the expected 40 enemies', result);
  }

  const firstWave = result.enemies.filter(e => e.wave === 0).sort((a, b) => a.lane - b.lane);
  const expectedTypes = ['bee', 'bee', 'bee', 'bee', 'but', 'but', 'but', 'but'];
  const actualTypes = firstWave.map(e => e.type);
  const baseSpawn = +Math.min(...firstWave.map(e => e.spawnPlan)).toFixed(2);
  const slotDelay = +(result.layout.slotDelay || 0.18).toFixed(2);
  const expectedSpawnPlan = [0, slotDelay, slotDelay * 2, slotDelay * 3, 0, slotDelay, slotDelay * 2, slotDelay * 3]
    .map(offset => +(baseSpawn + offset).toFixed(2));
  const actualSpawnPlan = firstWave.map(e => +e.spawnPlan.toFixed(2));
  if(baseSpawn < 0.85 || baseSpawn > 1.05){
    fail('first challenge wave base spawn timing drifted away from the reference entry window', {
      expectedBaseSpawnRange: [0.85, 1.05],
      baseSpawn,
      result
    });
  }

  if(JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)){
    fail('first challenge wave enemy family sequence drifted away from the reference-backed first challenge contract', {
      expectedTypes,
      actualTypes,
      result
    });
  }
  if(JSON.stringify(actualSpawnPlan) !== JSON.stringify(expectedSpawnPlan)){
    fail('first challenge wave spawn timing drifted away from the production baseline', {
      expectedSpawnPlan,
      actualSpawnPlan,
      result
    });
  }

  console.log(JSON.stringify({
    ok: true,
    layout: result.layout,
    firstWave: {
      types: actualTypes,
      spawnPlan: actualSpawnPlan
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

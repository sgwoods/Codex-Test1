#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

// The first 350ms sits directly on top of staggered spawn thresholds and is
// too frame-sensitive to be a trustworthy regression gate. We sample once the
// reference-backed first-challenge peel lanes are visibly underway.
const SAMPLE_TIMES = [0.7, 1.05, 1.4, 1.75, 2.1];
const BASELINE = Object.freeze({
  0.7: Object.freeze({ avgX: 140, minY: 39.8, maxY: 47.65, lane0X: 30.37, lane7X: 286.31 }),
  1.05: Object.freeze({ avgX: 140, minY: 40.74, maxY: 48.59, lane0X: 58.93, lane7X: 265.81 }),
  1.4: Object.freeze({ avgX: 140, minY: 41.66, maxY: 49.51, lane0X: 78.99, lane7X: 250.24 }),
  1.75: Object.freeze({ avgX: 140, minY: 42.6, maxY: 50.46, lane0X: 90.26, lane7X: 239.83 }),
  2.1: Object.freeze({ avgX: 140, minY: 38.22, maxY: 51.25, lane0X: 92.8, lane7X: 236.01 })
});

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function approxEqual(actual, expected, tolerance){
  return Math.abs(actual - expected) <= tolerance;
}

async function sampleChallengeMotion(page){
  const samples = [];
  for(const t of SAMPLE_TIMES){
    const previous = samples[samples.length - 1]?.t || 0;
    await sleep(Math.round((t - previous) * 1000));
    const formation = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
    const firstWave = (formation.enemies || []).filter(e => e.wave === 0).sort((a, b) => a.lane - b.lane);
    const xs = firstWave.map(e => e.x);
    const ys = firstWave.map(e => e.y);
    samples.push({
      t,
      firstWave,
      stats: {
        avgX: +(xs.reduce((sum, value) => sum + value, 0) / xs.length).toFixed(2),
        minY: +Math.min(...ys).toFixed(2),
        maxY: +Math.max(...ys).toFixed(2),
        lane0X: firstWave[0]?.x ?? null,
        lane7X: firstWave[7]?.x ?? null
      }
    });
  }
  return samples;
}

function validateStage7ReferencePathSetup(state){
  const layout = state?.layout || {};
  const referencePaths = Array.isArray(layout.groupReferencePaths) ? layout.groupReferencePaths : [];
  if(layout.id !== 'scorpion-cross-sweep'){
    fail('stage 7 challenge layout no longer resolves to the expected promoted layout', {
      layoutId: layout.id,
      stage: state?.stage
    });
  }
  if(referencePaths.length < 5){
    fail('stage 7 challenge layout lost its promoted reference path groups', {
      layoutId: layout.id,
      referencePathGroups: referencePaths.length
    });
  }
  const enemies = Array.isArray(state?.enemies) ? state.enemies : [];
  const tracked = enemies.filter(e => e?.referencePath && e.referencePath.pointCount >= 3 && e.referencePath.durationS > 0);
  const trackIds = [...new Set(tracked.map(e => e.referencePath.sourceTrackId).filter(Boolean))];
  if(enemies.length < 30 || tracked.length !== enemies.length || trackIds.length < 5){
    fail('stage 7 challenge enemies are not all carrying valid reference path metadata', {
      enemyCount: enemies.length,
      referenceTrackedCount: tracked.length,
      trackIds
    });
  }
}

async function main(){
  const result = await withHarnessPage({ stage: 3, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.setupChallengeMotionProfileTest({ stage: 3 }));
    return sampleChallengeMotion(page);
  });

  for(const sample of result){
    const expected = BASELINE[sample.t];
    if(!expected) fail('missing challenge motion baseline sample', { sample });
    const checks = {
      avgX: approxEqual(sample.stats.avgX, expected.avgX, 2),
      minY: approxEqual(sample.stats.minY, expected.minY, 4),
      maxY: approxEqual(sample.stats.maxY, expected.maxY, 4),
      lane0X: approxEqual(sample.stats.lane0X, expected.lane0X, 10),
      lane7X: approxEqual(sample.stats.lane7X, expected.lane7X, 10)
    };
    if(Object.values(checks).some(v => !v)){
      fail('challenge motion profile drifted away from the measured branch baseline', {
        sampleTime: sample.t,
        expected,
        actual: sample.stats,
        checks,
        firstWave: sample.firstWave,
        allSamples: result.map(item => ({ t: item.t, stats: item.stats }))
      });
    }
  }

  const stage7 = await withHarnessPage({ stage: 7, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    const initial = await page.evaluate(() => window.__galagaHarness__.setupChallengeMotionProfileTest({ stage: 7 }));
    await sleep(700);
    const underway = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
    return { initial, underway };
  });
  validateStage7ReferencePathSetup(stage7.initial);
  validateStage7ReferencePathSetup(stage7.underway);

  console.log(JSON.stringify({ ok: true, samples: result, stage7ReferencePath: {
    enemyCount: stage7.initial.enemies.length,
    referencePathGroups: stage7.initial.layout.groupReferencePaths.length,
    sourceTrackIds: [...new Set(stage7.initial.enemies.map(e => e.referencePath?.sourceTrackId).filter(Boolean))]
  } }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

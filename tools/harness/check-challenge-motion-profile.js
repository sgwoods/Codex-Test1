#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

// The first 350ms sits directly on top of staggered spawn thresholds and is
// too frame-sensitive to be a trustworthy regression gate. We sample once the
// reference-backed first-challenge peel lanes are visibly underway.
const SAMPLE_TIMES = [0.7, 1.05, 1.4, 1.75, 2.1];
const BASELINE = Object.freeze({
  0.7: Object.freeze({ avgX: 140, minY: 38.54, maxY: 46.51, lane0X: 18.4, lane7X: 290.35 }),
  1.05: Object.freeze({ avgX: 140, minY: 38.83, maxY: 46.8, lane0X: 45.45, lane7X: 271.9 }),
  1.4: Object.freeze({ avgX: 140, minY: 39.12, maxY: 47.09, lane0X: 66.86, lane7X: 256.81 }),
  1.75: Object.freeze({ avgX: 140, minY: 39.41, maxY: 47.38, lane0X: 82.47, lane7X: 245.18 }),
  2.1: Object.freeze({ avgX: 140, minY: 39.7, maxY: 47.66, lane0X: 90.65, lane7X: 238.22 })
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
      fail('challenge motion profile drifted away from the shipped production baseline', {
        sampleTime: sample.t,
        expected,
        actual: sample.stats,
        checks,
        firstWave: sample.firstWave
      });
    }
  }

  console.log(JSON.stringify({ ok: true, samples: result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

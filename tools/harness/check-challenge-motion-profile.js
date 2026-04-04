#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

const SAMPLE_TIMES = [0.35, 0.7, 1.05, 1.4, 1.75, 2.1];
const BASELINE = Object.freeze({
  0.35: Object.freeze({ avgX: 140, minY: 39.8, maxY: 47.36, lane0X: 2.55, lane7X: 324 }),
  0.7: Object.freeze({ avgX: 140, minY: 39.44, maxY: 47.94, lane0X: 33.22, lane7X: 281.3 }),
  1.05: Object.freeze({ avgX: 140, minY: 38.65, maxY: 47.98, lane0X: 56.91, lane7X: 264.39 }),
  1.4: Object.freeze({ avgX: 140, minY: 37.7, maxY: 47.88, lane0X: 74.96, lane7X: 251.09 }),
  1.75: Object.freeze({ avgX: 140, minY: 36.84, maxY: 47.36, lane0X: 86.33, lane7X: 242.14 }),
  2.1: Object.freeze({ avgX: 140, minY: 36.21, maxY: 46.53, lane0X: 91.65, lane7X: 237.08 })
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
  const result = await withHarnessPage({ stage: 3, ships: 3, challenge: true, seed: 9052 }, async ({ page }) => {
    return sampleChallengeMotion(page);
  });

  for(const sample of result){
    const expected = BASELINE[sample.t];
    if(!expected) fail('missing challenge motion baseline sample', { sample });
    const checks = {
      avgX: approxEqual(sample.stats.avgX, expected.avgX, 2),
      minY: approxEqual(sample.stats.minY, expected.minY, 1.25),
      maxY: approxEqual(sample.stats.maxY, expected.maxY, 1.25),
      lane0X: approxEqual(sample.stats.lane0X, expected.lane0X, 6),
      lane7X: approxEqual(sample.stats.lane7X, expected.lane7X, 6)
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

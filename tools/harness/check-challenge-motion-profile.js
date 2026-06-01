#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

// The first 350ms sits directly on top of staggered spawn thresholds and is
// too frame-sensitive to be a trustworthy regression gate. We sample once the
// reference-backed first-challenge peel lanes are visibly underway.
const SAMPLE_TIMES = [0.7, 1.05, 1.4, 1.75, 2.1];
const BASELINE = Object.freeze({
  0.7: Object.freeze({ avgX: 140, minY: 39.64, maxY: 47.51, lane0X: 25.04, lane7X: 289.56 }),
  1.05: Object.freeze({ avgX: 140, minY: 40.51, maxY: 48.37, lane0X: 52.53, lane7X: 270.13 }),
  1.4: Object.freeze({ avgX: 140, minY: 41.37, maxY: 49.24, lane0X: 73.69, lane7X: 254.22 }),
  1.75: Object.freeze({ avgX: 140, minY: 42.24, maxY: 50.11, lane0X: 87.14, lane7X: 242.89 }),
  2.1: Object.freeze({ avgX: 140, minY: 43.11, maxY: 50.97, lane0X: 91.99, lane7X: 236.88 })
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
    await page.evaluate(seconds => window.__galagaHarness__.advanceFor(seconds, {
      step: 1 / 60,
      stopOnGameOver: false
    }), Math.max(0, t - previous));
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

function validateReferencePathSetup(state, expected){
  const layout = state?.layout || {};
  const referencePaths = Array.isArray(layout.groupReferencePaths) ? layout.groupReferencePaths : [];
  if(layout.id !== expected.layoutId){
    fail(`stage ${expected.stage} challenge layout no longer resolves to the expected promoted layout`, {
      layoutId: layout.id,
      stage: state?.stage
    });
  }
  if(referencePaths.length < 5){
    fail(`stage ${expected.stage} challenge layout lost its promoted reference path groups`, {
      layoutId: layout.id,
      referencePathGroups: referencePaths.length
    });
  }
  const enemies = Array.isArray(state?.enemies) ? state.enemies : [];
  const tracked = enemies.filter(e => e?.referencePath && e.referencePath.pointCount >= 3 && e.referencePath.durationS > 0);
  const trackIds = [...new Set(tracked.map(e => e.referencePath.sourceTrackId).filter(Boolean))];
  if(enemies.length < 30 || tracked.length !== enemies.length || trackIds.length < 5){
    fail(`stage ${expected.stage} challenge enemies are not all carrying valid reference path metadata`, {
      enemyCount: enemies.length,
      referenceTrackedCount: tracked.length,
      trackIds
    });
  }
}

function validateReferencePlaybackClock(state, elapsedSeconds){
  const enemies = Array.isArray(state?.enemies) ? state.enemies : [];
  const spawnBase = enemies.reduce((min, enemy) => Math.min(min, +enemy.spawnPlan || 0), Infinity);
  const tracked = enemies.filter(enemy => enemy?.referencePath && enemy.spawn <= 0);
  const drifts = tracked.map(enemy => {
    const expectedTm = Math.max(0, elapsedSeconds - ((+enemy.spawnPlan || 0) - spawnBase));
    const drift = +((+enemy.tm || 0) - expectedTm).toFixed(3);
    return {
      id: enemy.id,
      pathFamily: enemy.pathFamily,
      sourceTrackId: enemy.referencePath.sourceTrackId,
      spawnPlan: enemy.spawnPlan,
      tm: enemy.tm,
      expectedTm: +expectedTm.toFixed(3),
      drift
    };
  });
  const bad = drifts.filter(entry => Math.abs(entry.drift) > 0.08);
  if(bad.length){
    fail('reference-backed challenge paths must advance in real elapsed seconds, not synthetic path-speed multipliers', {
      stage: state?.stage,
      elapsedSeconds,
      bad,
      drifts
    });
  }
  return drifts;
}

function validateStage7ReferencePathSetup(state){
  validateReferencePathSetup(state, { stage: 7, layoutId: 'scorpion-cross-sweep' });
}

function validateStage11ReferencePathSetup(state){
  validateReferencePathSetup(state, { stage: 11, layoutId: 'stingray-crown-hook-hybrid' });
}

function validateReferenceLeadIn(state, sampleAt){
  const leadIns = (state?.enemies || []).filter(enemy =>
    enemy?.referencePath
    && enemy.spawn > 0
    && enemy.referenceLeadIn > 0.05
    && enemy.referenceLeadIn < 1
  );
  if(leadIns.length < 4){
    fail('reference-backed challenge waves should visibly lead in from the side before the recorded track begins', {
      stage: state?.stage,
      sampleAt,
      leadIns,
      enemies: state?.enemies
    });
  }
  const magic = leadIns.filter(enemy => enemy.x > 20 && enemy.x < 260 && enemy.referenceLeadIn < 0.35);
  if(magic.length){
    fail('reference-backed challenge lead-in moved too deep into the playfield too early', {
      stage: state?.stage,
      sampleAt,
      magic,
      leadIns
    });
  }
  return leadIns;
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, stage: 3, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.setupChallengeMotionProfileTest({ stage: 3 }));
    return sampleChallengeMotion(page);
  });

  for(const sample of result){
    const expected = BASELINE[sample.t];
    if(!expected) fail('missing challenge motion baseline sample', { sample });
    const verticalTolerance = sample.t === 2.1 ? 6 : 4;
    const checks = {
      avgX: approxEqual(sample.stats.avgX, expected.avgX, 2),
      minY: approxEqual(sample.stats.minY, expected.minY, verticalTolerance),
      maxY: approxEqual(sample.stats.maxY, expected.maxY, verticalTolerance),
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

  const stage7 = await withHarnessPage({ skipStart: true, stage: 7, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    const initial = await page.evaluate(() => window.__galagaHarness__.setupChallengeMotionProfileTest({ stage: 7 }));
    await page.evaluate(() => window.__galagaHarness__.advanceFor(1, { step: 1 / 60, stopOnGameOver: false }));
    const underway = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
    return { initial, underway, clockDrifts: validateReferencePlaybackClock(underway, 1) };
  });
  validateStage7ReferencePathSetup(stage7.initial);
  validateStage7ReferencePathSetup(stage7.underway);

  const stage11 = await withHarnessPage({ skipStart: true, stage: 11, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    const initial = await page.evaluate(() => window.__galagaHarness__.setupChallengeMotionProfileTest({ stage: 11 }));
    await page.evaluate(() => window.__galagaHarness__.advanceFor(1, { step: 1 / 60, stopOnGameOver: false }));
    const underway = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
    return { initial, underway, clockDrifts: validateReferencePlaybackClock(underway, 1) };
  });
  validateStage11ReferencePathSetup(stage11.initial);
  validateStage11ReferencePathSetup(stage11.underway);

  const stage7LeadIn = await withHarnessPage({ stage: 7, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    const initial = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
    const referenceEnemies = (initial.enemies || []).filter(enemy => enemy.referencePath);
    const earliestSpawn = Math.min(...referenceEnemies.map(enemy => +enemy.spawn || 0));
    const sampleAt = Math.max(0.05, earliestSpawn - 0.34);
    await page.evaluate(seconds => window.__galagaHarness__.advanceFor(seconds, {
      step: 1 / 60,
      stopOnGameOver: false
    }), sampleAt);
    const underway = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
    return { sampleAt, initial, underway, leadIns: validateReferenceLeadIn(underway, sampleAt) };
  });

  console.log(JSON.stringify({ ok: true, samples: result, stage7ReferencePath: {
    enemyCount: stage7.initial.enemies.length,
    referencePathGroups: stage7.initial.layout.groupReferencePaths.length,
    sourceTrackIds: [...new Set(stage7.initial.enemies.map(e => e.referencePath?.sourceTrackId).filter(Boolean))],
    leadInCount: stage7LeadIn.leadIns.length,
    leadInSampleAt: +stage7LeadIn.sampleAt.toFixed(3)
  }, stage11ReferencePath: {
    enemyCount: stage11.initial.enemies.length,
    referencePathGroups: stage11.initial.layout.groupReferencePaths.length,
    sourceTrackIds: [...new Set(stage11.initial.enemies.map(e => e.referencePath?.sourceTrackId).filter(Boolean))]
  } }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

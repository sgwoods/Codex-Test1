#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const PROFILE = path.join(__dirname, 'reference-profiles', 'player-movement-conformance.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'player-movement');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function argValue(flag, fallback = ''){
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && idx + 1 < process.argv.length ? process.argv[idx + 1] : fallback;
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 3){
  if(value == null || Number.isNaN(value)) return null;
  return +value.toFixed(digits);
}

async function wait(page, ms){
  await page.waitForTimeout(ms);
}

async function sampleState(page){
  return page.evaluate(() => {
    const h = window.__galagaHarness__;
    const snap = h ? h.snapshot() : null;
    const p = snap?.player || null;
    return {
      t: snap ? +(snap.simT || 0).toFixed(3) : 0,
      playerX: p ? +p.x.toFixed(3) : null,
      playerVx: p ? +p.vx.toFixed(3) : null,
      eventCount: h ? h.recentEvents({ count: 300 }).length : 0
    };
  });
}

function maxFrameStep(samples){
  let max = 0;
  for(let i = 1; i < samples.length; i++){
    if(samples[i].playerX == null || samples[i - 1].playerX == null) continue;
    const step = Math.abs(samples[i].playerX - samples[i - 1].playerX);
    if(step > max) max = step;
  }
  return round(max, 3);
}

function settleMs(samples, releaseAt){
  if(releaseAt == null) return null;
  const settled = samples.find(sample => sample.t >= releaseAt && Math.abs(sample.playerVx || 0) <= 0.05);
  if(!settled) return null;
  return round((settled.t - releaseAt) * 1000, 1);
}

function crossMs(samples, pivotAt, centerX){
  if(pivotAt == null) return null;
  const crossed = samples.find(sample => sample.t >= pivotAt && sample.playerX <= centerX);
  if(!crossed) return null;
  return round((crossed.t - pivotAt) * 1000, 1);
}

function eventDeltaMs(events, startCount, type, afterT){
  const evt = events.slice(startCount).find(item => item.type === type);
  if(!evt || afterT == null || evt.t == null) return null;
  return round((evt.t - afterT) * 1000, 1);
}

function metricBandScore(value, target){
  if(value == null) return 0;
  if(target.min != null && value < target.min){
    return clamp(value / target.min, 0, 1);
  }
  if(target.max != null && value > target.max){
    return clamp(1 - ((value - target.max) / Math.max(target.max, 1)), 0, 1);
  }
  return 1;
}

function summariseRoot(result, targets){
  const tapScore = metricBandScore(result.tapLeft.absDelta, targets.tapAbsDelta);
  const holdScore = metricBandScore(result.holdRight.delta, targets.holdDelta);
  const releaseScore = metricBandScore(result.holdRight.settleMsAfterRelease, { max: targets.settleMsAfterRelease.max });
  const reversalScore = metricBandScore(result.reversal.reversalCrossMs, { max: targets.reversalCrossMs.max });
  const shotDelayScore = metricBandScore(result.moveFire.shotDelayMs, { max: targets.shotDelayMsWhileMoving.max });
  const postShotTravelScore = metricBandScore(result.moveFire.postShotTravel, { min: targets.postShotTravel.min });
  const frameStepScore = metricBandScore(result.global.maxFrameStep, { max: targets.maxFrameStep.max });
  const raw = (tapScore + holdScore + releaseScore + reversalScore + shotDelayScore + postShotTravelScore + frameStepScore) / 7;
  return {
    subScores: {
      tapScore: round(tapScore, 3),
      holdScore: round(holdScore, 3),
      releaseScore: round(releaseScore, 3),
      reversalScore: round(reversalScore, 3),
      shotDelayScore: round(shotDelayScore, 3),
      postShotTravelScore: round(postShotTravelScore, 3),
      frameStepScore: round(frameStepScore, 3)
    },
    score10: round(clamp(raw * 10, 1, 10), 1)
  };
}

async function runSequence(page, cfg){
  const intervalMs = cfg.intervalMs;

  async function recenter(tag){
    await page.evaluate(reason => {
      if(window.__galagaHarness__?.resetInputState) window.__galagaHarness__.resetInputState(reason);
      if(window.S?.p){
        window.S.p.x = window.PLAY_W / 2;
        window.S.p.vx = 0;
        window.S.p.cd = 0;
      }
    }, `movement-${tag}-recenter`);
    await wait(page, 80);
    await page.locator('#c').focus();
  }

  async function captureSamples(totalMs){
    const start = await sampleState(page);
    const samples = [start];
    let elapsed = 0;
    while(elapsed < totalMs){
      await wait(page, intervalMs);
      elapsed += intervalMs;
      samples.push(await sampleState(page));
    }
    return samples;
  }

  await recenter('tap-left');
  const tapStart = await sampleState(page);
  await page.keyboard.down('ArrowLeft');
  const tapDownAt = await sampleState(page);
  const tapSamples = [tapStart, tapDownAt];
  tapSamples.push(...await captureSamples(cfg.tapHoldMs));
  await page.keyboard.up('ArrowLeft');
  const tapReleaseAt = await sampleState(page);
  tapSamples.push(tapReleaseAt);
  tapSamples.push(...await captureSamples(cfg.tapReleaseMs));
  const tapEnd = tapSamples[tapSamples.length - 1];

  await recenter('hold-right');
  const holdStart = await sampleState(page);
  await page.keyboard.down('ArrowRight');
  const holdDownAt = await sampleState(page);
  const holdSamples = [holdStart, holdDownAt];
  holdSamples.push(...await captureSamples(cfg.holdMs));
  await page.keyboard.up('ArrowRight');
  const holdReleaseAt = await sampleState(page);
  holdSamples.push(holdReleaseAt);
  holdSamples.push(...await captureSamples(cfg.holdReleaseMs));
  const holdEnd = holdSamples[holdSamples.length - 1];

  await recenter('reversal');
  const reversalStart = await sampleState(page);
  const centerX = reversalStart.playerX;
  await page.keyboard.down('ArrowRight');
  const reversalSamples = [reversalStart, await sampleState(page)];
  reversalSamples.push(...await captureSamples(cfg.reversalFirstMs));
  await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowLeft');
  const reversalPivot = await sampleState(page);
  reversalSamples.push(reversalPivot);
  reversalSamples.push(...await captureSamples(cfg.reversalSecondMs));
  await page.keyboard.up('ArrowLeft');
  const reversalReleaseAt = await sampleState(page);
  reversalSamples.push(reversalReleaseAt);
  reversalSamples.push(...await captureSamples(cfg.reversalReleaseMs));

  await recenter('move-fire');
  const fireStart = await sampleState(page);
  const startEventCount = fireStart.eventCount || 0;
  await page.keyboard.down('ArrowRight');
  const fireSamples = [fireStart, await sampleState(page)];
  fireSamples.push(...await captureSamples(cfg.moveFireLeadMs));
  const fireAt = await sampleState(page);
  await page.keyboard.down('Space');
  await wait(page, 30);
  await page.keyboard.up('Space');
  fireSamples.push(await sampleState(page));
  fireSamples.push(...await captureSamples(cfg.moveFirePostMs));
  await page.keyboard.up('ArrowRight');
  const fireReleaseAt = await sampleState(page);
  fireSamples.push(fireReleaseAt);
  fireSamples.push(...await captureSamples(cfg.moveFireReleaseMs));
  const recentEvents = await page.evaluate(() => window.__galagaHarness__.recentEvents({ count: 300 }));
  const shotDelayMs = eventDeltaMs(recentEvents, startEventCount, 'player_shot', fireAt.t);
  const postShotTravel = round((fireSamples[fireSamples.length - 1].playerX || 0) - (fireAt.playerX || 0), 3);

  const allSamples = tapSamples.concat(holdSamples, reversalSamples, fireSamples);
  return {
    tapLeft: {
      startX: tapStart.playerX,
      endX: tapEnd.playerX,
      absDelta: round(Math.abs((tapEnd.playerX || 0) - (tapStart.playerX || 0)), 3),
      maxFrameStep: maxFrameStep(tapSamples)
    },
    holdRight: {
      startX: holdStart.playerX,
      endX: holdEnd.playerX,
      delta: round((holdEnd.playerX || 0) - (holdStart.playerX || 0), 3),
      maxFrameStep: maxFrameStep(holdSamples),
      settleMsAfterRelease: settleMs(holdSamples, holdReleaseAt.t)
    },
    reversal: {
      centerX,
      reversalCrossMs: crossMs(reversalSamples, reversalPivot.t, centerX),
      maxFrameStep: maxFrameStep(reversalSamples),
      settleMsAfterRelease: settleMs(reversalSamples, reversalReleaseAt.t)
    },
    moveFire: {
      shotDelayMs,
      postShotTravel,
      maxFrameStep: maxFrameStep(fireSamples)
    },
    global: {
      maxFrameStep: maxFrameStep(allSamples)
    }
  };
}

async function captureRoot(root, profile){
  return withHarnessPage({
    root,
    stage: profile.capture.stage,
    ships: profile.capture.ships,
    seed: profile.capture.seed,
    headed: false
  }, async ({ page }) => {
    await page.waitForFunction(() => {
      const state = window.__galagaHarness__.inputState();
      return state.started && state.spawn <= 0;
    }, null, { timeout: 8000 });
    await page.locator('#c').focus();
    await wait(page, 120);
    const result = await runSequence(page, profile.capture);
    return Object.assign(result, summariseRoot(result, profile.targets));
  });
}

function buildReadme(report){
  const lines = [
    '# Player Movement Conformance',
    '',
    'This artifact measures player movement against the documented control principles for Aurora:',
    '',
    '- tap should support fine correction',
    '- hold should support meaningful lane travel',
    '- reversal should settle quickly enough for evasive play',
    '- firing while moving should not stall the ship or suppress the shot window',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    '',
    '## Summary',
    '',
    `- Baseline score: ${report.summary.baselineScore10}/10`,
    `- Current score: ${report.summary.currentScore10}/10`,
    `- Delta: ${report.summary.scoreDelta}`,
    '',
    '## Current build',
    '',
    `- Tap correction abs delta: ${report.current.tapLeft.absDelta}`,
    `- Hold travel delta: ${report.current.holdRight.delta}`,
    `- Hold settle after release (ms): ${String(report.current.holdRight.settleMsAfterRelease)}`,
    `- Reversal cross ms: ${String(report.current.reversal.reversalCrossMs)}`,
    `- Shot delay while moving (ms): ${String(report.current.moveFire.shotDelayMs)}`,
    `- Post-shot travel: ${String(report.current.moveFire.postShotTravel)}`,
    `- Max frame step: ${String(report.current.global.maxFrameStep)}`,
    '',
    '## Read',
    '',
    '- This is a first-phase movement conformance check based on the documented control principles and not yet a direct trace extraction from reference footage.',
    '- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.',
    '- Tighten the targets later once we extract direct movement traces from the preserved Galaga gameplay footage.',
    ''
  ];
  return `${lines.join('\n')}\n`;
}

async function main(){
  const profile = readJson(PROFILE);
  const baselineRoot = path.resolve(ROOT, argValue('--baseline-root', profile.candidateRoots.baseline));
  const currentRoot = path.resolve(ROOT, argValue('--current-root', profile.candidateRoots.current));
  ensureDir(OUT_ROOT);
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${gitShortCommit()}`);
  ensureDir(outDir);

  const [baseline, current] = await Promise.all([
    captureRoot(baselineRoot, profile),
    captureRoot(currentRoot, profile)
  ]);

  const report = {
    generatedAt: new Date().toISOString(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    baseline,
    current,
    summary: {
      baselineScore10: baseline.score10,
      currentScore10: current.score10,
      scoreDelta: round(current.score10 - baseline.score10, 1)
    }
  };

  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    baselineScore10: baseline.score10,
    currentScore10: current.score10
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

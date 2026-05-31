#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'stage7-reference-path-before-after');
const FRAMES_ROOT = path.join(OUT_ROOT, 'latest-frames');
const STAGE = 7;
const CHALLENGE_NUMBER = 2;
const SAMPLE_TIMES = [0.6, 2.4, 4.2, 6.0, 7.8, 9.6, 11.4, 13.2, 15.0, 16.8];

const BEFORE_LAYOUT = Object.freeze({
  id: 'scorpion-cross-sweep-before-reference-path-promotion',
  groupArcAmps: [1.34, 1.28, 1.46, 1.38, 1.18],
  groupDropAmps: [0.86, 0.94, 1.08, 1.12, 1.02],
  groupSpeedScales: [1.34, 1.28, 1.22, 1.18, 1.16],
  groupPathFamilies: ['hook-arc', 'cross-sweep', 'hook-arc', 'cross-sweep', 'boss-led-loop'],
  groupSpawnOffsets: [],
  groupReferencePaths: []
});

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function gitShortCommit(){
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (err) {
    return 'unknown';
  }
}

function gitBranch(){
  try {
    return execFileSync('git', ['branch', '--show-current'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (err) {
    return 'unknown';
  }
}

function summarizeFormation(state = {}){
  const enemies = Array.isArray(state.enemies) ? state.enemies : [];
  const live = enemies.filter(enemy => enemy && enemy.hp !== 0);
  const xs = live.map(enemy => +enemy.x).filter(Number.isFinite);
  const ys = live.map(enemy => +enemy.y).filter(Number.isFinite);
  const refTracked = live.filter(enemy => enemy.referencePath && Number(enemy.referencePath.pointCount) >= 3);
  const unique = key => [...new Set(live.map(enemy => enemy[key]).filter(Boolean))].sort();
  const trackIds = [...new Set(refTracked.map(enemy => enemy.referencePath.sourceTrackId).filter(Boolean))].sort();
  return {
    enemyCount: live.length,
    referenceTrackedCount: refTracked.length,
    typeKeys: unique('type'),
    families: unique('family'),
    pathFamilies: unique('pathFamily'),
    referenceTrackIds: trackIds,
    xRange: xs.length ? +(Math.max(...xs) - Math.min(...xs)).toFixed(2) : 0,
    yRange: ys.length ? +(Math.max(...ys) - Math.min(...ys)).toFixed(2) : 0,
    minY: ys.length ? +Math.min(...ys).toFixed(2) : null,
    maxY: ys.length ? +Math.max(...ys).toFixed(2) : null
  };
}

function aggregateSamples(samples = []){
  const summaries = samples.map(sample => sample.summary || {});
  const referenceTrackedCounts = summaries.map(summary => +summary.referenceTrackedCount || 0);
  const enemyCounts = summaries.map(summary => +summary.enemyCount || 0);
  const xRanges = summaries.map(summary => +summary.xRange || 0);
  const yRanges = summaries.map(summary => +summary.yRange || 0);
  const all = key => [...new Set(summaries.flatMap(summary => summary[key] || []))].sort();
  const avg = values => values.length ? +(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2) : 0;
  return {
    sampleCount: samples.length,
    averageEnemyCount: avg(enemyCounts),
    averageReferenceTrackedCount: avg(referenceTrackedCounts),
    referenceCoverage: avg(enemyCounts.map((count, idx) => count ? referenceTrackedCounts[idx] / count : 0)),
    maxXRange: xRanges.length ? +Math.max(...xRanges).toFixed(2) : 0,
    maxYRange: yRanges.length ? +Math.max(...yRanges).toFixed(2) : 0,
    typeKeys: all('typeKeys'),
    families: all('families'),
    pathFamilies: all('pathFamilies'),
    referenceTrackIds: all('referenceTrackIds')
  };
}

function imageDimensions(file){
  const data = fs.readFileSync(file);
  if(data.readUInt32BE(0) !== 0x89504e47) return { width: 0, height: 0 };
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
}

function imageTag(file, x, y, width, height){
  const data = fs.readFileSync(file).toString('base64');
  return `<image href="data:image/png;base64,${data}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
}

function svgText(text, x, y, size = 18, fill = '#eaf8ff', weight = 700){
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${String(text).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]))}</text>`;
}

function writeContactSheet({ before, after }){
  const beforeFrames = before.frames || [];
  const afterFrames = after.frames || [];
  const first = beforeFrames[0]?.path ? path.join(ROOT, beforeFrames[0].path) : '';
  const dims = first && fs.existsSync(first) ? imageDimensions(first) : { width: 900, height: 1200 };
  const thumbW = 260;
  const thumbH = Math.round(thumbW * (dims.height / Math.max(1, dims.width)));
  const gutter = 18;
  const labelH = 38;
  const columns = SAMPLE_TIMES.length;
  const sheetW = 52 + columns * thumbW + (columns - 1) * gutter;
  const sheetH = 112 + labelH + (thumbH * 2) + gutter + 62;
  const children = [
    `<rect width="100%" height="100%" fill="#06101a"/>`,
    svgText('Challenging Stage 6-7 before-after visual evidence', 26, 36, 22, '#f2fbff', 800),
    svgText('Before = heuristic path-family layout. After = current reference-path promoted runtime.', 26, 66, 15, '#9fc8e8', 500),
    svgText('Before', 26, 104, 18, '#ffb0a8', 800),
    svgText('After', 26, 104 + labelH + thumbH + gutter, 18, '#8effd2', 800)
  ];
  beforeFrames.forEach((frame, index) => {
    const x = 26 + index * (thumbW + gutter);
    const y = 120;
    children.push(svgText(`${frame.t.toFixed(1)}s`, x + 8, y - 8, 12, '#c7dff3', 700));
    children.push(`<rect x="${x}" y="${y}" width="${thumbW}" height="${thumbH}" rx="8" fill="#000" stroke="#244863"/>`);
    children.push(imageTag(path.join(ROOT, frame.path), x, y, thumbW, thumbH));
  });
  afterFrames.forEach((frame, index) => {
    const x = 26 + index * (thumbW + gutter);
    const y = 120 + labelH + thumbH + gutter;
    children.push(svgText(`${frame.t.toFixed(1)}s`, x + 8, y - 8, 12, '#c7dff3', 700));
    children.push(`<rect x="${x}" y="${y}" width="${thumbW}" height="${thumbH}" rx="8" fill="#000" stroke="#244863"/>`);
    children.push(imageTag(path.join(ROOT, frame.path), x, y, thumbW, thumbH));
  });
  children.push(svgText('Read: the promoted path keeps a five-track reference identity attached to every challenge enemy; this is visible evidence, not a score gate by itself.', 26, sheetH - 28, 14, '#9fc8e8', 500));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}" viewBox="0 0 ${sheetW} ${sheetH}" role="img" aria-labelledby="title desc">
  <title id="title">Stage 7 challenge before-after contact sheet</title>
  <desc id="desc">Ten time samples comparing the previous heuristic Stage 7 challenge layout to the current reference-path promoted layout.</desc>
  ${children.join('\n  ')}
</svg>
`;
  const out = path.join(OUT_ROOT, 'latest-stage7-before-after.svg');
  writeText(out, svg);
  return rel(out);
}

async function captureRun(label, layoutOverride){
  const dir = path.join(FRAMES_ROOT, label);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  return withHarnessPage({ stage: STAGE, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    const initial = await page.evaluate(cfg => window.__galagaHarness__.setupChallengeMotionProfileTest(cfg), {
      stage: STAGE,
      layoutOverride
    });
    const frames = [];
    const samples = [];
    let previous = 0;
    for(const t of SAMPLE_TIMES){
      const delta = Math.max(0, t - previous);
      if(delta > 0){
        await page.evaluate(seconds => window.__galagaHarness__.advanceFor(seconds, {
          step: 1 / 60,
          stopOnGameOver: false
        }), delta);
      }
      previous = t;
      const state = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
      const file = path.join(dir, `${label}-${String(frames.length + 1).padStart(2, '0')}-${String(Math.round(t * 10)).padStart(3, '0')}ds.png`);
      await page.locator('#playfieldFrame').screenshot({ path: file });
      const summary = summarizeFormation(state);
      samples.push({ t, summary });
      frames.push({ t, path: rel(file), summary });
    }
    return {
      label,
      initialSummary: summarizeFormation(initial),
      aggregate: aggregateSamples(samples),
      frames,
      samples
    };
  });
}

function readme(report){
  return `# Stage 7 Reference-Path Before/After Evidence

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

This artifact gives a human-visible before/after read for the Challenging Stage 6-7 runtime promotion.

- Before: pre-promotion heuristic path-family layout.
- After: current promoted reference-path layout.
- Evidence sheet: \`${report.media.comparisonSheet}\`
- Source metric: \`reference-artifacts/analyses/challenge-stage-conformance/latest.json\`

## Read

${report.summary.read}

## Measurement Limits

This contact sheet is visual evidence and metadata preservation. It does not by itself prove arcade-level challenge-stage conformance. The stricter gate remains the challenge-stage analyzer: target-video object fit, expected-label identity, safety, shot opportunity, alien novelty, and the full Application Guide evidence row.
`;
}

async function main(){
  fs.rmSync(FRAMES_ROOT, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_ROOT, { recursive: true });
  const before = await captureRun('before', BEFORE_LAYOUT);
  const after = await captureRun('after', null);
  const comparisonSheet = writeContactSheet({ before, after });
  const referenceCoverageLift = +(after.aggregate.referenceCoverage - before.aggregate.referenceCoverage).toFixed(2);
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-reference-path-before-after',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage7-reference-path-before-after.js',
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage: STAGE,
    challengeNumber: CHALLENGE_NUMBER,
    sampleTimes: SAMPLE_TIMES,
    media: {
      comparisonSheet,
      beforeFramesDir: rel(path.join(FRAMES_ROOT, 'before')),
      afterFramesDir: rel(path.join(FRAMES_ROOT, 'after'))
    },
    summary: {
      beforeLabel: 'pre-promotion heuristic path-family layout',
      afterLabel: 'current reference-path promoted runtime',
      beforeReferenceCoverage: before.aggregate.referenceCoverage,
      afterReferenceCoverage: after.aggregate.referenceCoverage,
      referenceCoverageLift,
      beforePathFamilies: before.aggregate.pathFamilies,
      afterPathFamilies: after.aggregate.pathFamilies,
      afterReferenceTrackIds: after.aggregate.referenceTrackIds,
      read: `Stage 7 now preserves reference-path metadata across ${after.aggregate.referenceTrackIds.length} target tracks and ${Math.round(after.aggregate.referenceCoverage * 100)}% of sampled challenge enemies, compared with ${Math.round(before.aggregate.referenceCoverage * 100)}% in the pre-promotion control. Use the contact sheet to review whether that metadata lift is visible as better authored motion; do not treat it as a solved challenge-stage conformance score.`,
      playerMeaning: 'The visible aim is a safer, more learnable bonus-stage route: enemies should feel like authored groups sweeping in, not appearing or bunching unpredictably.',
      processMeaning: 'This artifact keeps the before/after proof close to the metric so future challenge promotions must show visible evidence, not only numerical candidate fit.'
    },
    before,
    after,
    nextSteps: [
      'Improve late-challenge reference identity scoring for Stages 19 and 27 so the sweep can distinguish true late-stage novelty from early-stage lookalikes.',
      'Attack sprite and alien graphical conformance against the cleaned target crop atlas and runtime sprite sizing checks.',
      'Promote the next challenge only after target-video object fit, expected-label identity, safety, shot opportunity, and visible contact-sheet review all clear.',
      'Prepare a release-authority handoff prompt with this evidence, the exact verification commands, and beta push constraints.'
    ]
  };
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'README.md'), readme(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(path.join(OUT_ROOT, 'latest.json')),
    comparisonSheet,
    beforeReferenceCoverage: before.aggregate.referenceCoverage,
    afterReferenceCoverage: after.aggregate.referenceCoverage,
    afterReferenceTrackIds: after.aggregate.referenceTrackIds
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

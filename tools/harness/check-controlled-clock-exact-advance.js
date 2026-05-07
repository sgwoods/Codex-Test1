#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'controlled-clock-exact-advance');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function git(args){
  const run = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : '';
}

function shortCommit(){
  return git(['rev-parse', '--short', 'HEAD']) || 'unknown';
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function buildReadme(report){
  const lines = [
    '# Controlled Clock Exact Advance',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'Controlled-clock replay was sensitive to how action intervals were segmented because `advanceFor(seconds)` could advance one full frame beyond the requested duration.',
    '',
    '## Strategy',
    '',
    'Advance a deterministic harness run through fractional intervals and compare `simT` and `stageClock` against the exact accumulated requested duration after each step.',
    '',
    '## Success Measure',
    '',
    'The worst absolute clock delta must be <= 0.001 seconds.',
    '',
    '## Result',
    '',
    `- Outcome: ${report.ok ? 'pass' : 'fail'}`,
    `- Worst delta: ${report.worstDelta}`,
    ''
  ];
  return `${lines.join('\n')}\n`;
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 1979 }, async ({ page }) => {
    await page.evaluate(() => {
      if(typeof installGamePack === 'function') installGamePack('aurora-galactica');
      window.__galagaHarness__.start({
        stage: 4,
        ships: 5,
        challenge: false,
        persona: 'advanced',
        seed: 1979,
        autoVideo: false,
        controlledClock: true
      });
    });
    const durations = [0.517, 0.1, 0.083, 0.317, 1.133, 0.011, 2.801, 0.005, 4.333];
    const samples = [];
    let expected = 0;
    for(const duration of durations){
      expected += duration;
      const state = await page.evaluate(seconds => window.__galagaHarness__.advanceFor(seconds, {
        step: 1 / 60,
        stopOnGameOver: false
      }), duration);
      samples.push({
        duration,
        expected: +expected.toFixed(6),
        simT: +(state.simT || 0).toFixed(6),
        stageClock: +(state.stageClock || 0).toFixed(6),
        simDelta: +((state.simT || 0) - expected).toFixed(6),
        stageClockDelta: +((state.stageClock || 0) - expected).toFixed(6)
      });
    }
    return samples;
  });
  const worst = result.reduce((acc, sample) => Math.max(acc, Math.abs(sample.simDelta), Math.abs(sample.stageClockDelta)), 0);
  const ok = worst <= 0.001;
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`);
  const report = {
    schema_version: 1,
    artifact_type: 'controlled-clock-exact-advance',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    problem: 'Controlled-clock replay should not drift depending on action interval segmentation.',
    strategy: 'Compare simT and stageClock against accumulated fractional advanceFor durations.',
    successMeasure: 'Worst absolute clock delta <= 0.001 seconds.',
    ok,
    worstDelta: worst,
    samples: result
  };
  ensureDir(outDir);
  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));
  console.log(JSON.stringify({ ok, report: reportFile, readme: readmeFile, worstDelta: worst, samples: result }, null, 2));
  if(!ok) fail('controlled clock advance drifted from requested durations', { worstDelta: worst, samples: result });
}

main().catch(err => fail(err && err.stack || String(err)));

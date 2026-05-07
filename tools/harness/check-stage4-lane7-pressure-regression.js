#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENARIO_FILE = path.join(__dirname, 'scenarios', 'stage4-survival-lane7-input-sensitive-pressure.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-lane7-pressure-regression');
const EXPECTED_WINDOW = [13.65, 14.05];
const SAMPLE_WINDOW = [12.95, 14.65];
const SAMPLE_STEP = 1 / 60;

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

function rel(file){
  return path.relative(ROOT, file);
}

function git(args){
  const run = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : '';
}

function shortCommit(){
  return git(['rev-parse', '--short', 'HEAD']) || 'unknown';
}

function compact(value){
  return Number.isFinite(+value) ? +(+value).toFixed(3) : null;
}

function keyName(code){
  if(code === 'Space') return ' ';
  if(String(code || '').startsWith('Key')) return code.slice(3).toLowerCase();
  if(String(code || '').startsWith('Digit')) return code.slice(5);
  return code;
}

function loadScenario(){
  const raw = readJson(SCENARIO_FILE);
  return {
    name: raw.name || path.basename(SCENARIO_FILE, '.json'),
    seed: (raw.seed >>> 0) || 4301,
    duration: Math.max(5, +raw.duration || 14.8),
    config: Object.assign({}, raw.config || {}),
    actions: (raw.actions || [])
      .map((action, index) => ({
        t: Math.max(0, +action.t || 0),
        action: action.action || 'press',
        code: action.code || action.key || 'Space',
        hold: Math.max(0, +action.hold || 0.08),
        index
      }))
      .sort((a, b) => a.t - b.t || a.index - b.index)
  };
}

async function advance(page, seconds){
  if(seconds <= 0) return null;
  return page.evaluate(delta => window.__galagaHarness__.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false }), seconds);
}

async function applyAction(page, action, down){
  const key = keyName(action.code);
  if(action.action === 'down'){
    if(!down.has(key)){
      await page.keyboard.down(key);
      down.add(key);
    }
    return;
  }
  if(action.action === 'up'){
    if(down.has(key)){
      await page.keyboard.up(key);
      down.delete(key);
    }
    return;
  }
  await page.keyboard.down(key);
  await advance(page, action.hold);
  await page.keyboard.up(key);
}

async function sample(page){
  return page.evaluate(() => {
    const api = window.__galagaHarness__;
    const state = api.state();
    const snap = api.snapshot();
    const compact = value => Number.isFinite(+value) ? +(+value).toFixed(3) : null;
    return {
      simT: compact(state.simT),
      stageClock: compact(state.stageClock),
      score: state.score,
      lives: state.lives,
      player: {
        x: compact(snap.player?.x),
        y: compact(snap.player?.y),
        vx: compact(snap.player?.vx),
        spawn: compact(snap.player?.spawn)
      },
      losses: api.recentEvents({ count: 500 })
        .filter(event => event.type === 'ship_lost')
        .map(event => ({
          t: compact(event.t),
          stageClock: compact(event.stageClock ?? event.t),
          cause: event.cause || null,
          sourceType: event.sourceType || event.enemyType || null,
          sourceLane: event.sourceLane ?? event.enemyLane ?? null,
          sourceColumn: event.sourceColumn ?? event.column ?? null,
          playerLane: event.playerLane ?? null,
          playerX: compact(event.playerX),
          enemyX: compact(event.enemyX),
          enemyY: compact(event.enemyY)
        }))
    };
  });
}

function dedupeLosses(samples){
  return samples.flatMap(entry => entry.losses || [])
    .filter((loss, index, all) => all.findIndex(candidate => Math.abs((candidate.t || 0) - (loss.t || 0)) < 0.002) === index);
}

function inWindow(value, range){
  return Number.isFinite(+value) && value >= range[0] && value <= range[1];
}

async function runScenario(scenario){
  return withHarnessPage({ skipStart: true, seed: scenario.seed }, async ({ page }) => {
    await page.evaluate(({ config, seed }) => {
      if(typeof installGamePack === 'function') installGamePack('aurora-galactica');
      window.__galagaHarness__.start(Object.assign({}, config, {
        seed,
        autoVideo: false,
        controlledClock: true
      }));
    }, { config: scenario.config, seed: scenario.seed });

    const down = new Set();
    const samples = [];
    let t = 0;
    let i = 0;
    while(t < scenario.duration - 0.000001){
      while(i < scenario.actions.length && scenario.actions[i].t <= t + 0.000001){
        await applyAction(page, scenario.actions[i], down);
        i++;
      }
      const nextActionT = i < scenario.actions.length ? scenario.actions[i].t : Infinity;
      const inSampleWindow = t >= SAMPLE_WINDOW[0] && t <= SAMPLE_WINDOW[1];
      let nextT;
      if(!inSampleWindow) nextT = Math.min(SAMPLE_WINDOW[0], nextActionT, scenario.duration);
      else nextT = Math.min(t + SAMPLE_STEP, nextActionT, SAMPLE_WINDOW[1], scenario.duration);
      if(nextT <= t + 0.000001){
        if(i < scenario.actions.length){
          await applyAction(page, scenario.actions[i], down);
          i++;
          continue;
        }
        break;
      }
      await advance(page, nextT - t);
      t = nextT;
      if(t >= SAMPLE_WINDOW[0] && t <= SAMPLE_WINDOW[1]){
        samples.push(await sample(page));
      }
      if(t >= SAMPLE_WINDOW[1] && nextActionT === Infinity) break;
    }
    for(const key of down) await page.keyboard.up(key);
    const state = await page.evaluate(() => window.__galagaHarness__.state());
    return { samples, finalState: state };
  });
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Lane7 Pressure Regression',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'The archived Stage 4 lane7 pressure loss is input-sensitive. A conformance improvement is only useful if the platform can keep measuring the recovered pressure window automatically.',
    '',
    '## Strategy',
    '',
    'Promote the best input-sensitivity sweep variant into a controlled-clock sampler scenario and assert that it still produces an enemy-body-contact loss inside the source danger window.',
    '',
    '## Success Measure',
    '',
    `The scenario produces at least one \`enemy_collision\` ship loss between stage clocks ${EXPECTED_WINDOW[0]} and ${EXPECTED_WINDOW[1]}.`,
    '',
    '## Result',
    '',
    `- Outcome: ${report.ok ? 'pass' : 'fail'}`,
    `- Matching loss: ${report.match ? JSON.stringify(report.match) : 'none'}`,
    `- Losses: ${JSON.stringify(report.losses)}`,
    '',
    '## Note',
    '',
    'A first attempt to assert this through `run-gameplay --deterministic-replay` did not reproduce the recovered loss, so the next harness-quality target is aligning that path with the controlled sampler.',
    ''
  ];
  return `${lines.join('\n')}\n`;
}

async function main(){
  const scenario = loadScenario();
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`);
  const run = await runScenario(scenario);
  const losses = dedupeLosses(run.samples);
  const match = losses.find(loss =>
    loss.cause === 'enemy_collision' &&
    inWindow(loss.stageClock ?? loss.t, EXPECTED_WINDOW) &&
    [7, 8].includes(loss.playerLane)
  ) || null;
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-lane7-pressure-regression',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    scenario: scenario.name,
    scenarioFile: rel(SCENARIO_FILE),
    expectedWindow: EXPECTED_WINDOW,
    sampleWindow: SAMPLE_WINDOW,
    sampleCount: run.samples.length,
    finalState: run.finalState,
    losses,
    match,
    samples: run.samples,
    ok: !!match,
    problem: 'The lane7 pressure source loss is input-sensitive and needs an automated regression target before gameplay constants are changed.',
    strategy: 'Run the promoted controlled-clock sampler scenario and assert a body-contact loss in the recovered source danger window.',
    successMeasure: 'At least one enemy_collision loss occurs between stage clocks 13.65 and 14.05 on player lane 7 or 8.'
  };
  ensureDir(outDir);
  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));
  console.log(JSON.stringify({
    ok: report.ok,
    report: reportFile,
    readme: readmeFile,
    sampleCount: report.sampleCount,
    match: report.match,
    losses: report.losses
  }, null, 2));
  if(!report.ok) process.exit(1);
}

main().catch(err => fail(err && err.stack || String(err)));

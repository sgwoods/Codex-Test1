#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-pressure-geometry');
const SCENARIO_ROOT = path.join(__dirname, 'scenarios');
const STEP = 1 / 60;

const WINDOWS = [
  {
    id: 'stage4-survival-boss-lane7',
    scenario: 'stage4-survival-boss-lane7-loss-window',
    expected: {
      sourceType: 'boss',
      playerLane: 7,
      sourceLane: 7,
      sourceColumn: 5,
      stageClock: [13.65, 14.05]
    }
  },
  {
    id: 'stage4-five-ships-but-lane2',
    scenario: 'stage4-five-ships-but-lane2-loss-window',
    expected: {
      sourceType: 'but',
      playerLane: 2,
      sourceLane: 2,
      sourceColumn: 5,
      stageClock: [15.05, 15.45]
    }
  },
  {
    id: 'stage4-five-ships-boss-lane6',
    scenario: 'stage4-five-ships-boss-lane6-loss-window',
    expected: {
      sourceType: 'boss',
      playerLane: 6,
      sourceLane: 6,
      sourceColumn: 5,
      stageClock: [18.3, 18.75]
    }
  }
];

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

function keyName(code){
  if(code === 'Space') return ' ';
  if(String(code || '').startsWith('Key')) return code.slice(3).toLowerCase();
  if(String(code || '').startsWith('Digit')) return code.slice(5);
  return code;
}

function loadScenario(name){
  const file = path.join(SCENARIO_ROOT, `${name}.json`);
  const raw = readJson(file);
  return {
    name: raw.name || name,
    file,
    duration: Math.max(5, +raw.duration || 20),
    seed: (raw.seed >>> 0) || 1,
    config: Object.assign({}, raw.config || {}),
    actions: (raw.actions || [])
      .map(action => ({
        t: Math.max(0, +action.t || 0),
        action: action.action || 'press',
        code: action.code || action.key || 'Space',
        hold: Math.max(0, +action.hold || 0.08)
      }))
      .sort((a, b) => a.t - b.t)
  };
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
  await page.evaluate(seconds => window.__galagaHarness__.advanceFor(seconds, { step: 1 / 60, stopOnGameOver: false }), action.hold);
  await page.keyboard.up(key);
}

async function advance(page, seconds){
  if(seconds <= 0) return null;
  return page.evaluate(delta => window.__galagaHarness__.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false }), seconds);
}

async function sampleGeometry(page, expected){
  return page.evaluate(spec => {
    const api = window.__galagaHarness__;
    const state = api.state();
    const snap = api.snapshot();
    const formation = api.formationState();
    const recentEvents = api.recentEvents({ count: 80 });
    const compact = value => Number.isFinite(+value) ? +(+value).toFixed(3) : null;
    const playWidth = 280;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const laneFor = x => clamp(Math.round((clamp(+x || 0, 0, playWidth) / playWidth) * 9), 0, 9);
    const enemyDimsFor = e => {
      if(e.type === 'boss') return { w: 38, h: 30 };
      if(e.type === 'but') return { w: 34, h: 27 };
      if(e.type === 'rogue') return { w: 35, h: 28 };
      return { w: 32, h: 26 };
    };
    const enemyCollisionHitboxFor = e => {
      const d = enemyDimsFor(e);
      const scale = state.challenge ? 0.18 : (state.stage === 4 ? (e?.dive === 1 ? 0.11 : 0.095) : state.stage >= 5 ? (e?.dive === 1 ? 0.14 : 0.12) : 0.18);
      return { w: d.w * scale, h: d.h * scale };
    };
    const hp = { w: 7, h: 6 };
    const rawPlayer = snap.player || {};
    const player = {
      x: compact(rawPlayer.x),
      y: compact(rawPlayer.y),
      lane: laneFor(rawPlayer.x),
      vx: compact(rawPlayer.vx),
      cd: compact(rawPlayer.cd),
      captured: !!rawPlayer.captured,
      pending: !!rawPlayer.pending,
      spawn: compact(rawPlayer.spawn)
    };
    function enemySample(e){
      const he = enemyCollisionHitboxFor(e);
      const dx = Math.abs(e.x - rawPlayer.x);
      const dy = Math.abs(e.y - rawPlayer.y);
      const marginX = dx - (he.w + hp.w);
      const marginY = dy - (he.h + hp.h);
      return {
        id: e.id,
        type: e.type,
        column: e.column,
        row: e.row,
        lane: laneFor(e.x),
        dive: e.dive,
        form: !!e.form,
        low: !!e.low,
        x: compact(e.x),
        y: compact(e.y),
        vx: compact(e.vx),
        vy: compact(e.vy),
        dx: compact(dx),
        dy: compact(dy),
        marginX: compact(marginX),
        marginY: compact(marginY),
        contactScore: compact(Math.max(marginX, marginY)),
        colliding: marginX < 0 && marginY < 0
      };
    }
    const active = formation.targets || [];
    const expectedTargets = active
      .filter(e => e.type === spec.sourceType && e.column === spec.sourceColumn)
      .map(enemySample)
      .sort((a, b) => a.contactScore - b.contactScore);
    const laneTargets = active
      .filter(e => e.dive && Math.abs(laneFor(e.x) - spec.sourceLane) <= 1)
      .map(enemySample)
      .sort((a, b) => a.contactScore - b.contactScore)
      .slice(0, 5);
    const recentShots = recentEvents
      .filter(event => event.type === 'player_shot')
      .slice(-5)
      .map(event => ({ t: compact(event.t), x: compact(event.x), y: compact(event.y), lane: laneFor(event.x) }));
    return {
      simT: compact(state.simT),
      stageClock: compact(state.stageClock),
      stage: state.stage,
      challenge: !!state.challenge,
      score: state.score,
      lives: state.lives,
      player,
      attackCount: snap.counts?.attackers || 0,
      enemyBulletCount: snap.counts?.enemyBullets || 0,
      recentShots,
      expectedTargets,
      laneTargets
    };
  }, expected);
}

function summarizeSamples(samples){
  const expectedTargets = samples.flatMap(sample =>
    (sample.expectedTargets || []).map(target => Object.assign({ stageClock: sample.stageClock, player: sample.player }, target))
  );
  const laneTargets = samples.flatMap(sample =>
    (sample.laneTargets || []).map(target => Object.assign({ stageClock: sample.stageClock, player: sample.player }, target))
  );
  const byContact = (a, b) => a.contactScore - b.contactScore;
  const bestExpected = expectedTargets.length ? expectedTargets.sort(byContact)[0] : null;
  const bestLane = laneTargets.length ? laneTargets.sort(byContact)[0] : null;
  const playerLaneCounts = samples.reduce((acc, sample) => {
    const lane = String(sample.player?.lane ?? 'unknown');
    acc[lane] = (acc[lane] || 0) + 1;
    return acc;
  }, {});
  return {
    sampleCount: samples.length,
    expectedTargetFrames: expectedTargets.length,
    laneThreatFrames: laneTargets.length,
    bestExpectedContact: bestExpected,
    bestLaneThreatContact: bestLane,
    playerLaneCounts,
    observedCollision: expectedTargets.some(target => target.colliding) || laneTargets.some(target => target.colliding)
  };
}

function diagnose(summary){
  const candidates = [summary.bestExpectedContact, summary.bestLaneThreatContact].filter(Boolean);
  const best = candidates.sort((a, b) => a.contactScore - b.contactScore)[0] || null;
  if(!best) return 'expected attacker path was not observed in the sampled replay window';
  if(best.colliding) return 'sampled replay reached collision geometry, but no matching loss signature was exported';
  if(best.contactScore <= 4) return 'sampled replay produced a near-contact window; tiny player/path drift can decide the loss';
  if(best.contactScore <= 12) return 'sampled replay kept the threat close but outside collision bounds';
  return 'sampled replay path stayed well outside collision bounds';
}

async function runWindow(windowSpec){
  const scenario = loadScenario(windowSpec.scenario);
  const sampleStart = Math.max(0, windowSpec.expected.stageClock[0] - 0.75);
  const sampleEnd = Math.min(scenario.duration, windowSpec.expected.stageClock[1] + 0.75);
  const samples = await withHarnessPage({ skipStart: true, seed: scenario.seed }, async ({ page }) => {
    await page.evaluate(({ config, seed }) => {
      if(typeof installGamePack === 'function') installGamePack('aurora-galactica');
      window.__galagaHarness__.start(Object.assign({}, config, {
        seed,
        autoVideo: false,
        controlledClock: true
      }));
    }, { config: scenario.config, seed: scenario.seed });

    const down = new Set();
    const result = [];
    let t = 0;
    let i = 0;
    while(t < scenario.duration - 0.000001){
      while(i < scenario.actions.length && scenario.actions[i].t <= t + 0.000001){
        await applyAction(page, scenario.actions[i], down);
        i++;
      }
      const nextActionT = i < scenario.actions.length ? scenario.actions[i].t : Infinity;
      let nextT;
      if(t < sampleStart) nextT = Math.min(sampleStart, nextActionT, scenario.duration);
      else if(t <= sampleEnd) nextT = Math.min(t + STEP, nextActionT, sampleEnd, scenario.duration);
      else nextT = Math.min(nextActionT, scenario.duration);
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
      if(t >= sampleStart - 0.000001 && t <= sampleEnd + 0.000001){
        result.push(await sampleGeometry(page, windowSpec.expected));
      }
      if(t >= sampleEnd && nextActionT === Infinity) break;
    }
    for(const key of down) await page.keyboard.up(key);
    return result;
  });
  const summary = summarizeSamples(samples);
  return {
    id: windowSpec.id,
    scenario: windowSpec.scenario,
    scenarioFile: rel(scenario.file),
    expected: windowSpec.expected,
    sampleWindow: [sampleStart, sampleEnd].map(value => +value.toFixed(3)),
    summary: Object.assign({}, summary, { diagnosis: diagnose(summary) }),
    samples
  };
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Pressure Geometry',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'Stage 4 pressure windows are mined from real body-contact losses, but short replay probes can miss the loss. Without frame-level geometry, a miss could be player path drift, attacker path drift, shot timing, or collision tolerance.',
    '',
    '## Strategy',
    '',
    'Replay each promoted pressure window with controlled-clock sampling and record player lane, expected attacker path, nearby lane threats, bullets, and collision margins frame by frame around the expected loss interval.',
    '',
    '## Success Measure',
    '',
    'Each promoted pressure window produces geometry samples and a diagnosis that can guide the next tuning or harness-precision step.',
    '',
    '## Results',
    ''
  ];
  for(const result of report.results){
    const summary = result.summary;
    const best = [summary.bestExpectedContact, summary.bestLaneThreatContact]
      .filter(Boolean)
      .sort((a, b) => a.contactScore - b.contactScore)[0] || null;
    lines.push(`### ${result.id}`);
    lines.push(`- Samples: ${summary.sampleCount}`);
    lines.push(`- Expected-target frames: ${summary.expectedTargetFrames}`);
    lines.push(`- Lane-threat frames: ${summary.laneThreatFrames}`);
    lines.push(`- Observed collision geometry: ${summary.observedCollision ? 'yes' : 'no'}`);
    lines.push(`- Best contact score: ${best ? best.contactScore : 'n/a'} at t=${best ? best.stageClock : 'n/a'}`);
    lines.push(`- Diagnosis: ${summary.diagnosis}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

async function main(){
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`);
  const results = [];
  for(const spec of WINDOWS){
    results.push(await runWindow(spec));
  }
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-pressure-geometry',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    problem: 'Stage 4 pressure replay misses need frame-level player/attacker geometry before gameplay constants are changed.',
    strategy: 'Sample promoted pressure windows at 60 Hz under controlled-clock replay and summarize collision margins for expected attackers and nearby lane threats.',
    successMeasure: 'All promoted windows emit non-empty sample sets with geometry diagnoses.',
    results
  };
  report.summary = {
    totalWindows: results.length,
    sampledWindows: results.filter(result => result.summary.sampleCount > 0).length,
    observedCollisionWindows: results.filter(result => result.summary.observedCollision).length,
    expectedTargetWindows: results.filter(result => result.summary.expectedTargetFrames > 0).length
  };
  report.ok = report.summary.sampledWindows === report.summary.totalWindows;

  ensureDir(outDir);
  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));

  console.log(JSON.stringify({
    ok: report.ok,
    report: reportFile,
    readme: readmeFile,
    summary: report.summary,
    results: results.map(result => ({
      id: result.id,
      samples: result.summary.sampleCount,
      expectedTargetFrames: result.summary.expectedTargetFrames,
      laneThreatFrames: result.summary.laneThreatFrames,
      observedCollision: result.summary.observedCollision,
      bestExpectedContactScore: result.summary.bestExpectedContact?.contactScore ?? null,
      bestLaneThreatContactScore: result.summary.bestLaneThreatContact?.contactScore ?? null,
      diagnosis: result.summary.diagnosis
    }))
  }, null, 2));

  if(!report.ok) process.exit(1);
}

main().catch(err => fail(err && err.stack || String(err)));

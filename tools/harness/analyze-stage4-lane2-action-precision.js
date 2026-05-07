#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-lane2-action-precision');
const SCENARIO = path.join(__dirname, 'scenarios', 'stage4-five-ships-but-lane2-loss-window.json');
const STEP = 1 / 60;
const PLAY_W = 280;
const PLAY_H = 360;
const SOURCE_LOSS_T = 15.25;
const SAMPLE_WINDOW = [14.3, 15.7];
const EXPECTED = {
  sourceType: 'but',
  sourceColumn: 5,
  sourceLane: 2,
  playerLane: 2,
  stageClock: [15.05, 15.45]
};
const SOURCE_EXACT_ACTIONS = [
  { t: 0.367, action: 'down', code: 'Space' },
  { t: 0.617, action: 'down', code: 'ArrowLeft' },
  { t: 2.217, action: 'up', code: 'ArrowLeft' },
  { t: 2.233, action: 'down', code: 'ArrowRight' },
  { t: 5.417, action: 'up', code: 'ArrowRight' },
  { t: 5.433, action: 'down', code: 'ArrowLeft' },
  { t: 8.617, action: 'up', code: 'ArrowLeft' },
  { t: 8.633, action: 'down', code: 'ArrowRight' },
  { t: 11.717, action: 'up', code: 'ArrowRight' },
  { t: 11.733, action: 'down', code: 'ArrowLeft' },
  { t: 15.017, action: 'up', code: 'ArrowLeft' },
  { t: 15.033, action: 'down', code: 'ArrowRight' }
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
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args){
  const run = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : '';
}

function shortCommit(){
  return git(['rev-parse', '--short', 'HEAD']) || 'unknown';
}

function uniqueOutDir(dir){
  if(!fs.existsSync(dir)) return dir;
  for(let i = 2; i < 100; i++){
    const candidate = `${dir}-${i}`;
    if(!fs.existsSync(candidate)) return candidate;
  }
  return `${dir}-${Date.now()}`;
}

function compact(value){
  return Number.isFinite(+value) ? +(+value).toFixed(3) : null;
}

function laneFor(x){
  const clamped = Math.max(0, Math.min(PLAY_W, +x || 0));
  return Math.max(0, Math.min(9, Math.round((clamped / PLAY_W) * 9)));
}

function keyName(code){
  if(code === 'Space') return ' ';
  if(String(code || '').startsWith('Key')) return code.slice(3).toLowerCase();
  if(String(code || '').startsWith('Digit')) return code.slice(5);
  return code;
}

function enemyDims(type){
  if(type === 'boss') return { w: 38, h: 30 };
  if(type === 'but') return { w: 34, h: 27 };
  if(type === 'rogue') return { w: 35, h: 28 };
  return { w: 32, h: 26 };
}

function contactScore(enemy, player, stage = 4, challenge = false){
  const dims = enemyDims(enemy.type);
  const scale = challenge ? 0.18 : (stage === 4 ? (enemy.dive === 1 ? 0.11 : 0.095) : stage >= 5 ? (enemy.dive === 1 ? 0.14 : 0.12) : 0.18);
  const he = { w: dims.w * scale, h: dims.h * scale };
  const hp = { w: 7, h: 6 };
  const dx = Math.abs((+enemy.x || 0) - (+player.x || 0));
  const dy = Math.abs((+enemy.y || 0) - (+player.y || 0));
  const marginX = dx - (he.w + hp.w);
  const marginY = dy - (he.h + hp.h);
  return {
    dx: compact(dx),
    dy: compact(dy),
    marginX: compact(marginX),
    marginY: compact(marginY),
    contactScore: compact(Math.max(marginX, marginY)),
    colliding: marginX < 0 && marginY < 0
  };
}

function actionDeltas(actions){
  return SOURCE_EXACT_ACTIONS.map((expected, i) => {
    const actual = actions[i] || {};
    return {
      index: i,
      code: expected.code,
      action: expected.action,
      sourceT: compact(expected.t),
      actualT: compact(actual.t),
      delta: compact((+actual.t || 0) - expected.t)
    };
  });
}

function shiftedFinalTurn(actions, shift){
  return actions.map(action => {
    if(action.t >= 15) return Object.assign({}, action, { t: +(action.t + shift).toFixed(3) });
    return Object.assign({}, action);
  });
}

function loadVariants(){
  const raw = readJson(SCENARIO);
  const baseActions = (raw.actions || []).map(action => Object.assign({}, action));
  const variants = [
    {
      id: 'current-scenario',
      description: 'Committed loss-window scenario timing.',
      actions: baseActions,
      actionDeltasFromSource: actionDeltas(baseActions)
    },
    {
      id: 'source-exact-events',
      description: 'Key event timings copied from the archived source loss session.',
      actions: SOURCE_EXACT_ACTIONS.map(action => Object.assign({}, action)),
      actionDeltasFromSource: actionDeltas(SOURCE_EXACT_ACTIONS)
    },
    {
      id: 'source-exact-final-turn-minus-one-frame',
      description: 'Source-exact actions with only the final lane turn one 60 Hz frame earlier.',
      actions: shiftedFinalTurn(SOURCE_EXACT_ACTIONS, -STEP),
      actionDeltasFromSource: actionDeltas(shiftedFinalTurn(SOURCE_EXACT_ACTIONS, -STEP))
    },
    {
      id: 'source-exact-final-turn-plus-one-frame',
      description: 'Source-exact actions with only the final lane turn one 60 Hz frame later.',
      actions: shiftedFinalTurn(SOURCE_EXACT_ACTIONS, STEP),
      actionDeltasFromSource: actionDeltas(shiftedFinalTurn(SOURCE_EXACT_ACTIONS, STEP))
    }
  ];
  for(const frames of [-2, -3, -3.5, -4, -4.25, -4.5, -4.75, -5, -5.5, -6]){
    const shift = frames * STEP;
    const actions = shiftedFinalTurn(SOURCE_EXACT_ACTIONS, shift);
    const label = String(Math.abs(frames)).replace('.', 'p');
    variants.push({
      id: `source-exact-final-turn-${label}-frames-earlier`,
      description: `Source-exact actions with only the final lane turn ${Math.abs(frames)} 60 Hz frames earlier.`,
      actions,
      actionDeltasFromSource: actionDeltas(actions)
    });
  }
  return {
    scenario: raw,
    variants
  };
}

async function advance(page, seconds){
  if(seconds <= 0) return null;
  return page.evaluate(({ delta, step }) => window.__galagaHarness__.advanceFor(delta, { step, stopOnGameOver: false }), { delta: seconds, step: STEP });
}

async function applyAction(page, action, down){
  const key = keyName(action.code || action.key || 'Space');
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
  await advance(page, Math.max(0, +action.hold || 0.08));
  await page.keyboard.up(key);
}

async function sample(page){
  return page.evaluate(({ expected, sourceLossT, lowerFieldY }) => {
    const api = window.__galagaHarness__;
    const state = api.state();
    const snap = api.snapshot();
    const formation = api.formationState();
    const compact = value => Number.isFinite(+value) ? +(+value).toFixed(3) : null;
    const laneFor = x => {
      const clamped = Math.max(0, Math.min(280, +x || 0));
      return Math.max(0, Math.min(9, Math.round((clamped / 280) * 9)));
    };
    const playerRaw = snap.player || {};
    const player = {
      x: compact(playerRaw.x),
      y: compact(playerRaw.y),
      vx: compact(playerRaw.vx),
      lane: laneFor(playerRaw.x)
    };
    const enemies = (formation.targets || []).map(e => ({
      id: e.id,
      type: e.type,
      row: e.row,
      column: e.column,
      lane: laneFor(e.x),
      x: compact(e.x),
      y: compact(e.y),
      vx: compact(e.vx),
      vy: compact(e.vy),
      dive: e.dive,
      form: !!e.form,
      low: !!e.low,
      cool: compact(e.cool)
    }));
    const sourceColumn = enemies.filter(e => e.type === expected.sourceType && e.column === expected.sourceColumn);
    const laneThreats = enemies.filter(e => e.dive && Math.abs(e.lane - expected.sourceLane) <= 1);
    const events = api.recentEvents({ count: 200 })
      .filter(event => event.type === 'enemy_attack_start' || event.type === 'enemy_lower_field' || event.type === 'ship_lost' || event.type === 'player_shot')
      .map(event => ({
        t: compact(event.t),
        type: event.type,
        id: event.id ?? event.enemyId ?? null,
        enemyType: event.enemyType || event.sourceType || null,
        column: event.column ?? event.sourceColumn ?? null,
        playerLane: event.playerLane ?? null,
        originLane: event.originLane ?? null,
        targetLane: event.targetLane ?? null,
        mode: event.mode || null,
        x: compact(event.x ?? event.playerX),
        enemyX: compact(event.enemyX),
        enemyY: compact(event.enemyY)
      }));
    return {
      stageClock: compact(state.stageClock),
      simT: compact(state.simT),
      stage: state.stage,
      lives: state.lives,
      player,
      attackCount: snap.counts?.attackers || 0,
      enemyBulletCount: snap.counts?.enemyBullets || 0,
      sourceColumn,
      laneThreats,
      sourceColumnDiveCount: sourceColumn.filter(e => e.dive).length,
      sourceColumnLowerFieldCount: sourceColumn.filter(e => e.y >= lowerFieldY).length,
      atSourceLoss: Math.abs((state.stageClock || 0) - sourceLossT) <= 1 / 120,
      events
    };
  }, { expected: EXPECTED, sourceLossT: SOURCE_LOSS_T, lowerFieldY: PLAY_H * 0.62 });
}

function withScores(sample){
  const player = sample.player || {};
  const scoreEnemy = e => Object.assign({}, e, contactScore(e, player, sample.stage, false));
  return Object.assign({}, sample, {
    sourceColumn: (sample.sourceColumn || []).map(scoreEnemy).sort((a, b) => a.contactScore - b.contactScore),
    laneThreats: (sample.laneThreats || []).map(scoreEnemy).sort((a, b) => a.contactScore - b.contactScore)
  });
}

function uniqueEvents(samples){
  const seen = new Set();
  const out = [];
  for(const sample of samples){
    for(const event of sample.events || []){
      const key = `${event.t}|${event.type}|${event.id}|${event.column}|${event.mode}`;
      if(seen.has(key)) continue;
      seen.add(key);
      out.push(event);
    }
  }
  return out.sort((a, b) => (+a.t || 0) - (+b.t || 0));
}

function bestOf(samples, key){
  const candidates = samples.flatMap(sample =>
    (sample[key] || []).map(enemy => Object.assign({ stageClock: sample.stageClock, player: sample.player }, enemy))
  );
  return candidates.length ? candidates.sort((a, b) => a.contactScore - b.contactScore)[0] : null;
}

function nearestSample(samples, t){
  return samples.slice().sort((a, b) => Math.abs(a.stageClock - t) - Math.abs(b.stageClock - t))[0] || null;
}

function diagnose(summary){
  if(summary.sourceColumnLowerFieldFrames > 0){
    return 'source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next';
  }
  if(summary.sourceColumnDiveFrames > 0){
    return 'source column-5 butterfly started a dive but never reached the player band; dive velocity/timing is the next likely gap';
  }
  if(summary.bestLaneThreatContact?.contactScore <= 12){
    return 'input timing preserves nearby Stage 4 pressure, but the archived source attacker is not scheduled to dive';
  }
  return 'source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap';
}

async function runVariant(scenario, variant){
  const actions = variant.actions.slice().sort((a, b) => a.t - b.t);
  const duration = Math.max(+scenario.duration || 0, SAMPLE_WINDOW[1]);
  const samples = await withHarnessPage({ skipStart: true, seed: scenario.seed }, async ({ page }) => {
    await page.evaluate(({ config, seed }) => {
      if(typeof installGamePack === 'function') installGamePack('aurora-galactica');
      window.__galagaHarness__.start(Object.assign({}, config, {
        seed,
        autoVideo: false,
        controlledClock: true
      }));
    }, { config: scenario.config || {}, seed: scenario.seed });
    const result = [];
    const down = new Set();
    let t = 0;
    let i = 0;
    while(t < duration - 0.000001){
      while(i < actions.length && actions[i].t <= t + 0.000001){
        await applyAction(page, actions[i], down);
        i++;
      }
      const nextActionT = i < actions.length ? actions[i].t : Infinity;
      let nextT;
      if(t < SAMPLE_WINDOW[0]) nextT = Math.min(SAMPLE_WINDOW[0], nextActionT, duration);
      else if(t <= SAMPLE_WINDOW[1]) nextT = Math.min(t + STEP, nextActionT, SAMPLE_WINDOW[1], duration);
      else nextT = Math.min(nextActionT, duration);
      if(nextT <= t + 0.000001){
        if(i < actions.length){
          await applyAction(page, actions[i], down);
          i++;
          continue;
        }
        break;
      }
      await advance(page, nextT - t);
      t = nextT;
      if(t >= SAMPLE_WINDOW[0] - 0.000001 && t <= SAMPLE_WINDOW[1] + 0.000001){
        result.push(withScores(await sample(page)));
      }
      if(t >= SAMPLE_WINDOW[1] && nextActionT === Infinity) break;
    }
    for(const key of down) await page.keyboard.up(key);
    return result;
  });
  const atLoss = nearestSample(samples, SOURCE_LOSS_T);
  const summary = {
    sampleCount: samples.length,
    sourceColumnDiveFrames: samples.filter(s => s.sourceColumnDiveCount > 0).length,
    sourceColumnLowerFieldFrames: samples.filter(s => s.sourceColumnLowerFieldCount > 0).length,
    playerLaneCounts: samples.reduce((acc, sample) => {
      const lane = String(sample.player?.lane ?? 'unknown');
      acc[lane] = (acc[lane] || 0) + 1;
      return acc;
    }, {}),
    bestSourceColumnContact: bestOf(samples, 'sourceColumn'),
    bestLaneThreatContact: bestOf(samples, 'laneThreats'),
    nearestAtSourceLoss: atLoss ? {
      stageClock: atLoss.stageClock,
      player: atLoss.player,
      sourceColumn: atLoss.sourceColumn,
      laneThreats: atLoss.laneThreats
    } : null,
    events: uniqueEvents(samples)
  };
  summary.diagnosis = diagnose(summary);
  return Object.assign({}, variant, {
    sampleWindow: SAMPLE_WINDOW,
    sourceLossT: SOURCE_LOSS_T,
    summary
  });
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Lane-2 Action Precision',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'The archived Stage 4 lane-2 butterfly body-contact loss has a known source attacker and key-event timing, but the committed fresh replay keeps that attacker high in formation.',
    '',
    '## Strategy',
    '',
    'Replay the committed scenario, source-exact key timings, and final-turn timing variants under controlled clock. For each run, sample player lane, column-5 butterfly state, nearby lane threats, attack events, and collision margins around the source loss window.',
    '',
    '## Success Measure',
    '',
    'If source-exact timing makes the column-5 butterfly dive into the player band, harness scenario precision is the first fix. If not, the next gameplay change should be a bounded Stage 4 attacker-scheduling adjustment.',
    '',
    '## Results',
    ''
  ];
  for(const result of report.results){
    const summary = result.summary;
    lines.push(`### ${result.id}`);
    lines.push(`- Source-column dive frames: ${summary.sourceColumnDiveFrames}/${summary.sampleCount}`);
    lines.push(`- Source-column lower-field frames: ${summary.sourceColumnLowerFieldFrames}/${summary.sampleCount}`);
    lines.push(`- Best source-column contact: ${summary.bestSourceColumnContact?.contactScore ?? 'n/a'} at t=${summary.bestSourceColumnContact?.stageClock ?? 'n/a'}`);
    lines.push(`- Best lane-threat contact: ${summary.bestLaneThreatContact?.contactScore ?? 'n/a'} at t=${summary.bestLaneThreatContact?.stageClock ?? 'n/a'}`);
    lines.push(`- Diagnosis: ${summary.diagnosis}`);
    lines.push('');
  }
  lines.push('## Recommended Next Step');
  lines.push('');
  lines.push(report.recommendation);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function recommendation(results){
  const best = results
    .filter(result => result.summary.bestSourceColumnContact)
    .sort((a, b) => a.summary.bestSourceColumnContact.contactScore - b.summary.bestSourceColumnContact.contactScore)[0] || null;
  if(best?.summary.bestSourceColumnContact?.contactScore <= 0){
    return `- Promote calibrated timing variant \`${best.id}\` into the lane-2 scenario, then rerun loss-window, geometry, and source/replay comparison gates.`;
  }
  if(best?.summary.bestSourceColumnContact?.contactScore <= 4){
    return `- Test calibrated timing variant \`${best.id}\` in the committed lane-2 scenario; it is the closest measured geometry but still needs replay-loss confirmation.`;
  }
  const exact = results.find(result => result.id === 'source-exact-events');
  if(exact?.summary.sourceColumnLowerFieldFrames > 0){
    return '- Promote source-exact timings into the committed lane-2 scenario, then rerun loss-window, geometry, and source/replay comparison gates.';
  }
  if(exact?.summary.sourceColumnDiveFrames > 0){
    return '- Preserve source-exact timings, then tune a narrow Stage 4 butterfly descent/timing lever and measure whether column 5 reaches the player band.';
  }
  return '- Add a bounded Stage 4 column-5 butterfly scheduling cue or cool-down bias, then rerun this action-precision artifact before claiming gameplay conformance gain.';
}

async function main(){
  const loaded = loadVariants();
  const results = [];
  for(const variant of loaded.variants){
    results.push(await runVariant(loaded.scenario, variant));
  }
  const outDir = uniqueOutDir(path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`));
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-lane2-action-precision',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    scenario: rel(SCENARIO),
    problem: 'Stage 4 lane-2 source replay miss could be caused by key-event precision, player lane drift, or attacker scheduling.',
    strategy: 'Controlled-clock replay compares committed and source-exact action timings while sampling source attacker path and lane-threat geometry.',
    successMeasure: 'Identify whether source-exact inputs are sufficient to make the archived column-5 butterfly reach the player band.',
    expected: EXPECTED,
    summary: {
      variants: results.length,
      variantsWithSourceColumnDive: results.filter(result => result.summary.sourceColumnDiveFrames > 0).length,
      variantsWithSourceColumnLowerField: results.filter(result => result.summary.sourceColumnLowerFieldFrames > 0).length,
      variantsWithCloseLaneThreat: results.filter(result => result.summary.bestLaneThreatContact && result.summary.bestLaneThreatContact.contactScore <= 12).length,
      bestSourceColumnVariant: results
        .filter(result => result.summary.bestSourceColumnContact)
        .sort((a, b) => a.summary.bestSourceColumnContact.contactScore - b.summary.bestSourceColumnContact.contactScore)
        .map(result => ({
          id: result.id,
          contactScore: result.summary.bestSourceColumnContact.contactScore,
          stageClock: result.summary.bestSourceColumnContact.stageClock
        }))[0] || null
    },
    results
  };
  report.recommendation = recommendation(results);
  report.ok = results.every(result => result.summary.sampleCount > 0);

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
    recommendation: report.recommendation,
    results: results.map(result => ({
      id: result.id,
      sourceColumnDiveFrames: result.summary.sourceColumnDiveFrames,
      sourceColumnLowerFieldFrames: result.summary.sourceColumnLowerFieldFrames,
      bestSourceColumnContactScore: result.summary.bestSourceColumnContact?.contactScore ?? null,
      bestLaneThreatContactScore: result.summary.bestLaneThreatContact?.contactScore ?? null,
      diagnosis: result.summary.diagnosis
    }))
  }, null, 2));
  if(!report.ok) process.exit(1);
}

main().catch(err => fail(err && err.stack || String(err)));

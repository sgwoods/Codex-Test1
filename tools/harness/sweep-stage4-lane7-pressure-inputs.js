#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENARIO_ROOT = path.join(__dirname, 'scenarios');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-lane7-input-sensitivity');
const SOURCE_SESSION = path.join(
  ROOT,
  'harness-artifacts',
  'checks',
  'stage-pressure-balance',
  'stage4-survival-advanced-seed4301-2026-05-06T12-52-06-101Z-60521-ectnu9',
  'neo-galaga-session-ngt-1778071927525-3.json'
);
const HAND_SCENARIO = path.join(SCENARIO_ROOT, 'stage4-survival-boss-lane7-loss-window.json');
const STEP = 1 / 60;
const SOURCE_LOSS = {
  stageClock: 13.85,
  playerX: 202.98,
  playerLane: 7,
  sourceType: 'boss',
  sourceColumn: 5,
  sourceLane: 7,
  sourceContactScore: -2.43
};
const SAMPLE_START = 12.95;
const SAMPLE_END = 14.65;
const DURATION = 14.8;
const EXPECTED_LOSS_WINDOW = [13.65, 14.05];

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

function compact(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function keyName(code){
  if(code === 'Space') return ' ';
  if(String(code || '').startsWith('Key')) return code.slice(3).toLowerCase();
  if(String(code || '').startsWith('Digit')) return code.slice(5);
  return code;
}

function normalizeActions(actions){
  return (actions || [])
    .map((action, index) => ({
      t: Math.max(0, +action.t || 0),
      action: action.action || (action.type === 'key_down' ? 'down' : action.type === 'key_up' ? 'up' : 'press'),
      code: action.code || action.key || 'Space',
      hold: Math.max(0, +action.hold || 0.08),
      index
    }))
    .filter(action => action.t <= DURATION)
    .sort((a, b) => a.t - b.t || a.index - b.index)
    .map(({ index, ...action }) => action);
}

function loadHandScenario(){
  const raw = readJson(HAND_SCENARIO);
  return {
    id: 'hand-scenario',
    sourceKind: 'loss-window-scenario',
    seed: (raw.seed >>> 0) || 4301,
    config: Object.assign({}, raw.config || {}),
    actions: normalizeActions(raw.actions || [])
  };
}

function loadSourceSession(){
  if(!fs.existsSync(SOURCE_SESSION)){
    fail('Missing source session for lane7 input sweep', { expected: SOURCE_SESSION });
  }
  const session = readJson(SOURCE_SESSION).session;
  const spawn = (session.events || []).find(event => event.type === 'stage_spawn') || {};
  const firstSnap = (session.snapshots || []).find(snap => snap.tag === 'stage_spawn') || (session.snapshots || [])[0] || {};
  return {
    id: 'source-exact',
    sourceKind: 'archived-session-key-events',
    seed: (session.seed >>> 0) || 4301,
    config: {
      stage: Math.max(1, spawn.stage || firstSnap.stage || 4),
      ships: Math.max(1, Math.min(9, firstSnap.lives || 5)),
      challenge: !!spawn.challenge,
      persona: spawn.persona || 'advanced'
    },
    actions: normalizeActions((session.events || [])
      .filter(event => event.type === 'key_down' || event.type === 'key_up')
      .map(event => ({
        t: event.t || 0,
        action: event.type === 'key_down' ? 'down' : 'up',
        code: event.code
      })))
  };
}

function shiftedAction(action, shift){
  return Object.assign({}, action, { t: Math.max(0, compact(action.t + shift, 4)) });
}

function shiftMatching(base, match, shift){
  return Object.assign({}, base, {
    actions: normalizeActions(base.actions.map(action => match(action) ? shiftedAction(action, shift) : action))
  });
}

function buildVariants(){
  const hand = loadHandScenario();
  const source = loadSourceSession();
  const coarseShifts = [-0.75, -0.6, -0.45, -0.3, -0.15, 0.15, 0.3];
  const fineTurnShifts = [-0.4, -0.35, -0.25, -0.2, -0.1, -0.05, 0.05, 0.1, 0.2, 0.25];
  const post10Shifts = [-0.45, -0.4, -0.35, -0.3, -0.25, -0.2, -0.15, -0.1, -0.05, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.45];
  const variants = [
    hand,
    source
  ];
  for(const shift of coarseShifts){
    variants.push(Object.assign(
      shiftMatching(source, action => action.action === 'down' && action.code === 'ArrowLeft' && Math.abs(action.t - 13.817) < 0.04, shift),
      {
        id: `source-final-left-${shift < 0 ? 'early' : 'late'}-${Math.abs(shift).toFixed(2)}`,
        sourceKind: 'source-final-left-shift',
        shift: compact(shift, 3)
      }
    ));
  }
  for(const shift of Array.from(new Set(coarseShifts.concat(fineTurnShifts))).sort((a, b) => a - b)){
    variants.push(Object.assign(
      shiftMatching(source, action => (
        (action.code === 'ArrowRight' && action.action === 'up' && Math.abs(action.t - 13.417) < 0.04) ||
        (action.code === 'Space' && action.action === 'up' && Math.abs(action.t - 13.433) < 0.04) ||
        (action.code === 'ArrowLeft' && action.action === 'down' && Math.abs(action.t - 13.817) < 0.04)
      ), shift),
      {
        id: `source-turn-pair-${shift < 0 ? 'early' : 'late'}-${Math.abs(shift).toFixed(2)}`,
        sourceKind: 'source-danger-turn-shift',
        shift: compact(shift, 3)
      }
    ));
  }
  for(const shift of post10Shifts){
    variants.push(Object.assign(
      shiftMatching(source, action => action.t >= 10.0, shift),
      {
        id: `source-after-10s-${shift < 0 ? 'early' : 'late'}-${Math.abs(shift).toFixed(2)}`,
        sourceKind: 'source-post-10s-shift',
        shift: compact(shift, 3)
      }
    ));
  }
  return variants;
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

async function advance(page, seconds){
  if(seconds <= 0) return null;
  return page.evaluate(delta => window.__galagaHarness__.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false }), seconds);
}

async function sampleGeometry(page){
  return page.evaluate(spec => {
    const api = window.__galagaHarness__;
    const state = api.state();
    const snap = api.snapshot();
    const formation = api.formationState();
    const recentEvents = api.recentEvents({ count: 500 });
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
    const losses = recentEvents
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
      }));
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
      expectedTargets,
      laneTargets,
      losses
    };
  }, SOURCE_LOSS);
}

function bestByContact(values){
  return values.filter(Boolean).sort((a, b) => a.contactScore - b.contactScore)[0] || null;
}

function nearestSample(samples, targetT){
  return samples
    .map(sample => Object.assign({ delta: Math.abs((sample.stageClock || 0) - targetT) }, sample))
    .sort((a, b) => a.delta - b.delta)[0] || null;
}

function summarizeSamples(samples){
  const expectedTargets = samples.flatMap(sample =>
    (sample.expectedTargets || []).map(target => Object.assign({ stageClock: sample.stageClock, player: sample.player }, target))
  );
  const laneTargets = samples.flatMap(sample =>
    (sample.laneTargets || []).map(target => Object.assign({ stageClock: sample.stageClock, player: sample.player }, target))
  );
  const allThreats = expectedTargets.concat(laneTargets);
  const bestExpected = bestByContact(expectedTargets);
  const bestLane = bestByContact(laneTargets);
  const bestOverall = bestByContact(allThreats);
  const atSourceLoss = nearestSample(samples, SOURCE_LOSS.stageClock);
  const losses = samples.flatMap(sample => sample.losses || [])
    .filter((loss, index, all) => all.findIndex(candidate => Math.abs((candidate.t || 0) - (loss.t || 0)) < 0.002) === index);
  const lossesInWindow = losses.filter(loss => loss.stageClock >= SAMPLE_START && loss.stageClock <= SAMPLE_END);
  const lossesInExpectedWindow = losses.filter(loss => loss.stageClock >= EXPECTED_LOSS_WINDOW[0] && loss.stageClock <= EXPECTED_LOSS_WINDOW[1]);
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
    bestOverallContact: bestOverall,
    observedCollisionGeometry: allThreats.some(target => target.colliding),
    shipLossesInSampleWindow: lossesInWindow,
    shipLossesInExpectedWindow: lossesInExpectedWindow,
    playerLaneCounts,
    atSourceLossTime: atSourceLoss ? {
      stageClock: atSourceLoss.stageClock,
      player: atSourceLoss.player,
      bestExpectedContact: bestByContact(atSourceLoss.expectedTargets || []),
      bestLaneThreatContact: bestByContact(atSourceLoss.laneTargets || []),
      playerXDeltaFromSourceLoss: compact((atSourceLoss.player?.x ?? 0) - SOURCE_LOSS.playerX),
      playerLaneDeltaFromSourceLoss: (atSourceLoss.player?.lane ?? 0) - SOURCE_LOSS.playerLane
    } : null
  };
}

function diagnose(summary){
  const best = summary.bestOverallContact;
  if(summary.shipLossesInExpectedWindow.length){
    return 'controlled sweep reproduced a ship-loss event inside the expected source loss window';
  }
  if(summary.shipLossesInSampleWindow.length){
    return 'controlled sweep reproduced a ship-loss event near but outside the expected source loss window';
  }
  if(best?.colliding || summary.observedCollisionGeometry){
    return 'controlled sweep reached collision geometry without a matching exported loss event';
  }
  if(best && best.contactScore <= 4){
    return 'controlled sweep reached near-contact geometry; one-frame/input rounding can decide this pressure window';
  }
  if(best && best.contactScore <= 12){
    return 'controlled sweep kept the threat close but outside collision bounds';
  }
  return 'controlled sweep stayed outside the source collision geometry';
}

async function runVariant(variant){
  const samples = await withHarnessPage({ skipStart: true, seed: variant.seed }, async ({ page }) => {
    await page.evaluate(({ config, seed }) => {
      if(typeof installGamePack === 'function') installGamePack('aurora-galactica');
      window.__galagaHarness__.start(Object.assign({}, config, {
        seed,
        autoVideo: false,
        controlledClock: true
      }));
    }, { config: variant.config, seed: variant.seed });

    const down = new Set();
    const result = [];
    let t = 0;
    let i = 0;
    while(t < DURATION - 0.000001){
      while(i < variant.actions.length && variant.actions[i].t <= t + 0.000001){
        await applyAction(page, variant.actions[i], down);
        i++;
      }
      const nextActionT = i < variant.actions.length ? variant.actions[i].t : Infinity;
      let nextT;
      if(t < SAMPLE_START) nextT = Math.min(SAMPLE_START, nextActionT, DURATION);
      else if(t <= SAMPLE_END) nextT = Math.min(t + STEP, nextActionT, SAMPLE_END, DURATION);
      else nextT = Math.min(nextActionT, DURATION);
      if(nextT <= t + 0.000001){
        if(i < variant.actions.length){
          await applyAction(page, variant.actions[i], down);
          i++;
          continue;
        }
        break;
      }
      await advance(page, nextT - t);
      t = nextT;
      if(t >= SAMPLE_START - 0.000001 && t <= SAMPLE_END + 0.000001){
        result.push(await sampleGeometry(page));
      }
      if(t >= SAMPLE_END && nextActionT === Infinity) break;
    }
    for(const key of down) await page.keyboard.up(key);
    return result;
  });
  const summary = summarizeSamples(samples);
  return {
    id: variant.id,
    sourceKind: variant.sourceKind,
    shift: variant.shift ?? null,
    seed: variant.seed,
    config: variant.config,
    actionCount: variant.actions.length,
    actions: variant.actions.map(action => Object.assign({}, action, { t: compact(action.t, 4) })),
    sampleWindow: [SAMPLE_START, SAMPLE_END],
    summary: Object.assign({}, summary, { diagnosis: diagnose(summary) }),
    samples
  };
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Lane7 Input Sensitivity Sweep',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'A real Stage 4 lane7 boss-contact loss exists in the pressure archive, but exact key-event replay did not reproduce that specific loss. This makes subjective tuning risky: the gap may be replay/input precision instead of missing gameplay pressure.',
    '',
    '## Strategy',
    '',
    'Replay the archived lane7 source session under controlled clock and sweep small key-event timing shifts around the danger turn. Sample player/attacker geometry at 60 Hz and compare each variant to the source loss position, expected loss window, and contact score.',
    '',
    '## Success Measure',
    '',
    'The sweep identifies whether small timing shifts can reproduce collision geometry or near-contact geometry, and records the player-position delta at the source loss time for future replay precision work.',
    '',
    '## Results',
    ''
  ];
  for(const result of report.rankings.bestContact.slice(0, 10)){
    lines.push(`- \`${result.id}\`: best=${result.bestContactScore}, source-time player x delta=${result.sourceTimePlayerXDelta}, diagnosis=${result.diagnosis}`);
  }
  lines.push('');
  lines.push('## Recommendation');
  lines.push('');
  lines.push(report.recommendation);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function rankingFor(result){
  const summary = result.summary;
  return {
    id: result.id,
    sourceKind: result.sourceKind,
    shift: result.shift,
    bestContactScore: summary.bestOverallContact?.contactScore ?? null,
    bestContactTime: summary.bestOverallContact?.stageClock ?? null,
    bestContactType: summary.bestOverallContact?.type ?? null,
    bestContactLane: summary.bestOverallContact?.lane ?? null,
    sourceTimePlayerX: summary.atSourceLossTime?.player?.x ?? null,
    sourceTimePlayerLane: summary.atSourceLossTime?.player?.lane ?? null,
    sourceTimePlayerXDelta: summary.atSourceLossTime?.playerXDeltaFromSourceLoss ?? null,
    sourceTimePlayerLaneDelta: summary.atSourceLossTime?.playerLaneDeltaFromSourceLoss ?? null,
    collisionGeometry: !!summary.observedCollisionGeometry,
    shipLossesInWindow: summary.shipLossesInSampleWindow.length,
    shipLossesInExpectedWindow: summary.shipLossesInExpectedWindow.length,
    firstExpectedWindowLoss: summary.shipLossesInExpectedWindow[0] || null,
    firstSampleWindowLoss: summary.shipLossesInSampleWindow[0] || null,
    diagnosis: summary.diagnosis
  };
}

function buildRecommendation(rankings){
  const expectedLoss = rankings.find(entry => entry.shipLossesInExpectedWindow > 0);
  if(expectedLoss){
    return `Promote \`${expectedLoss.id}\` into a deterministic regression scenario before changing gameplay constants; it reproduces a ship-loss event inside the expected source danger window.`;
  }
  const collision = rankings.find(entry => entry.collisionGeometry || entry.shipLossesInWindow > 0);
  if(collision){
    return `Do not promote \`${collision.id}\` as conformant yet: it recovers a nearby pressure loss, but outside the expected source danger window. Use it to tune replay/input precision.`;
  }
  const near = rankings.find(entry => Number.isFinite(entry.bestContactScore) && entry.bestContactScore <= 4);
  if(near){
    return `Use \`${near.id}\` as the next precision target. It reaches near-contact geometry, so improve replay/input time alignment before tuning collision or attack constants.`;
  }
  const close = rankings.find(entry => Number.isFinite(entry.bestContactScore) && entry.bestContactScore <= 12);
  if(close){
    return `Use \`${close.id}\` as the next probe, then add finer-grained input shifts around its best-contact time before gameplay tuning.`;
  }
  return 'Do not tune gameplay constants from this lane7 window yet. The sweep stayed outside collision geometry, so the next investment should improve replay precision and source/session clock alignment.';
}

async function main(){
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`);
  const variants = buildVariants();
  const results = [];
  for(const variant of variants){
    process.stderr.write(`sweeping ${variant.id}\n`);
    results.push(await runVariant(variant));
  }
  const bestContact = results
    .map(rankingFor)
    .sort((a, b) => {
      if(a.shipLossesInExpectedWindow !== b.shipLossesInExpectedWindow) return b.shipLossesInExpectedWindow - a.shipLossesInExpectedWindow;
      const av = Number.isFinite(a.bestContactScore) ? a.bestContactScore : Infinity;
      const bv = Number.isFinite(b.bestContactScore) ? b.bestContactScore : Infinity;
      return av - bv;
    });
  const sourceTimeAlignment = [...bestContact]
    .sort((a, b) => Math.abs(a.sourceTimePlayerXDelta ?? Infinity) - Math.abs(b.sourceTimePlayerXDelta ?? Infinity));
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-lane7-input-sensitivity',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    sourceSession: rel(SOURCE_SESSION),
    handScenario: rel(HAND_SCENARIO),
    sourceLoss: SOURCE_LOSS,
    expectedLossWindow: EXPECTED_LOSS_WINDOW,
    problem: 'The archived Stage 4 lane7 boss-contact pressure loss does not reproduce reliably through exact key-event replay.',
    strategy: 'Sweep controlled-clock variants around the danger turn and compare 60 Hz geometry against the source loss position and contact score.',
    successMeasure: 'Recover collision geometry or identify the closest input timing variant for replay precision and conformance scoring.',
    results,
    rankings: {
      bestContact,
      sourceTimeAlignment
    }
  };
  report.summary = {
    totalVariants: results.length,
    sampledVariants: results.filter(result => result.summary.sampleCount > 0).length,
    collisionGeometryVariants: results.filter(result => result.summary.observedCollisionGeometry).length,
    shipLossVariantsInWindow: results.filter(result => result.summary.shipLossesInSampleWindow.length > 0).length,
    shipLossVariantsInExpectedWindow: results.filter(result => result.summary.shipLossesInExpectedWindow.length > 0).length,
    nearContactVariants: bestContact.filter(entry => Number.isFinite(entry.bestContactScore) && entry.bestContactScore <= 4).length,
    closeContactVariants: bestContact.filter(entry => Number.isFinite(entry.bestContactScore) && entry.bestContactScore <= 12).length,
    bestVariant: bestContact[0] || null,
    bestSourceTimeAlignment: sourceTimeAlignment[0] || null
  };
  report.recommendation = buildRecommendation(bestContact);
  report.ok = report.summary.sampledVariants === report.summary.totalVariants;

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
    recommendation: report.recommendation
  }, null, 2));

  if(!report.ok) process.exit(1);
}

main().catch(err => fail(err && err.stack || String(err), err?.payload));

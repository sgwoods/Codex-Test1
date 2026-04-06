const path = require('path');
const { withHarnessPage } = require('./browser-check-util');

function argValue(flag, fallback = '') {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && idx + 1 < process.argv.length ? process.argv[idx + 1] : fallback;
}

function numberArg(flag, fallback) {
  const raw = argValue(flag, '');
  const value = raw === '' ? fallback : Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

async function capture(root, cfg) {
  return withHarnessPage({
    root,
    stage: cfg.stage,
    ships: cfg.ships,
    challenge: false,
    seed: cfg.seed,
    persona: cfg.persona,
    headed: false,
    skipStart: true
  }, async ({ page }) => {
    return page.evaluate(async options => {
      const h = window.__galagaHarness__;
      h.stop('stage-opening-compare');
      h.start({
        stage: options.stage,
        ships: options.ships,
        challenge: false,
        seed: options.seed,
        persona: options.persona,
        autoVideo: false,
        controlledClock: true,
        initialSimT: options.initialSimT
      });
      h.setControlledClock(1);
      h.advanceFor(options.time, { step: options.step, stopOnGameOver: true });
      const snapshot = h.snapshot();
      const formation = h.formationState();
      const input = h.inputState();
      const events = h.recentEvents({ count: options.eventCount });
      return {
        snapshot,
        input,
        events,
        targets: formation.targets
          .map(e => ({
            id: e.id,
            type: e.type,
            row: e.row,
            column: e.column,
            x: e.x,
            y: e.y,
            tx: e.tx,
            ty: e.ty,
            dive: e.dive,
            form: e.form,
            spawn: e.spawn,
            tm: e.tm,
            ph: e.ph,
            cool: e.cool,
            en: e.en,
            esc: e.esc,
            lead: e.lead
          }))
          .sort((a, b) => (a.row - b.row) || (a.column - b.column) || (a.id - b.id))
      };
    }, cfg);
  });
}

function mapById(targets) {
  const map = new Map();
  for (const t of targets) map.set(t.id, t);
  return map;
}

function diffTargets(baseTargets, currentTargets) {
  const baseMap = mapById(baseTargets);
  const currentMap = mapById(currentTargets);
  const diffs = [];
  for (const [id, base] of baseMap.entries()) {
    const current = currentMap.get(id);
    if (!current) {
      diffs.push({ id, kind: 'missing_in_current', base });
      continue;
    }
    const delta = {
      x: +(current.x - base.x).toFixed(2),
      y: +(current.y - base.y).toFixed(2),
      tx: +(current.tx - base.tx).toFixed(2),
      ty: +(current.ty - base.ty).toFixed(2),
      tm: +(current.tm - base.tm).toFixed(3),
      en: +(current.en - base.en).toFixed(3),
      cool: +(current.cool - base.cool).toFixed(3),
      ph: +(current.ph - base.ph).toFixed(3),
      spawn: +(current.spawn - base.spawn).toFixed(2),
      dive: +(current.dive - base.dive).toFixed(2),
      esc: +(current.esc - base.esc).toFixed(2)
    };
    const changed = Object.values(delta).some(v => Math.abs(v) > 0.001) || current.form !== base.form || current.lead !== base.lead;
    if (changed) diffs.push({ id, kind: 'changed', type: base.type, row: base.row, column: base.column, base, current, delta });
  }
  for (const [id, current] of currentMap.entries()) {
    if (!baseMap.has(id)) diffs.push({ id, kind: 'missing_in_baseline', current });
  }
  diffs.sort((a, b) => {
    const ar = a.base?.row ?? a.current?.row ?? 99;
    const br = b.base?.row ?? b.current?.row ?? 99;
    const ac = a.base?.column ?? a.current?.column ?? 99;
    const bc = b.base?.column ?? b.current?.column ?? 99;
    return ar - br || ac - bc || a.id - b.id;
  });
  return diffs;
}

function printSummary(label, data) {
  console.log(`\n[${label}]`);
  console.log(JSON.stringify({
    snapshot: data.snapshot,
    input: data.input,
    recentEvents: data.events.slice(-6)
  }, null, 2));
}

async function main() {
  const baselineRoot = path.resolve(argValue('--baseline-root', '/private/tmp/codex-baseline-clean/dist/dev'));
  const currentRoot = path.resolve(argValue('--current-root', path.resolve(__dirname, '..', '..', 'dist', 'dev')));
  const stage = numberArg('--stage', 1);
  const ships = numberArg('--ships', 4);
  const seed = numberArg('--seed', 51301);
  const time = numberArg('--time', 0.517);
  const step = numberArg('--step', 1 / 60);
  const persona = argValue('--persona', 'professional');
  const eventCount = numberArg('--event-count', 16);
  const initialSimT = numberArg('--initial-sim-t', NaN);

  const cfg = { stage, ships, seed, time, step, persona, eventCount, initialSimT };
  const [baseline, current] = await Promise.all([
    capture(baselineRoot, cfg),
    capture(currentRoot, cfg)
  ]);

  printSummary('baseline', baseline);
  printSummary('current', current);

  const summaryDiff = {
    playerX: +(current.snapshot.player.x - baseline.snapshot.player.x).toFixed(2),
    playerVx: +(current.snapshot.player.vx - baseline.snapshot.player.vx).toFixed(2),
    score: current.snapshot.score - baseline.snapshot.score,
    rngStateEqual: current.snapshot.rngState === baseline.snapshot.rngState,
    simT: +(current.snapshot.simT - baseline.snapshot.simT).toFixed(3),
    stageClock: +(current.snapshot.stageClock - baseline.snapshot.stageClock).toFixed(3)
  };

  console.log('\n[summary-diff]');
  console.log(JSON.stringify(summaryDiff, null, 2));

  const targetDiffs = diffTargets(baseline.targets, current.targets);
  console.log('\n[target-diffs]');
  console.log(JSON.stringify(targetDiffs.slice(0, 20), null, 2));
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

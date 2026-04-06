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
    stage: 1,
    ships: cfg.ships,
    challenge: false,
    seed: cfg.seed,
    persona: cfg.persona,
    headed: false,
    skipStart: true
  }, async ({ page }) => {
    return page.evaluate(async options => {
      const h = window.__galagaHarness__;
      h.stop('carryover-compare');
      h.start({
        stage: 1,
        ships: options.ships,
        challenge: false,
        seed: options.seed,
        persona: options.persona,
        autoVideo: false,
        controlledClock: true
      });
      h.setControlledClock(1);
      for (let i = 0; i < 30000; i++) {
        const snap = h.snapshot();
        if (!snap.started) break;
        const formation = h.formationState();
        const ready = snap.stage === options.stage && !snap.challenge && snap.timers?.nextStageT === 0 && formation.targets?.length === 40;
        if (ready && snap.stageClock >= options.time) {
          const input = h.inputState();
          const events = h.recentEvents({ count: options.eventCount });
          return {
            snapshot: snap,
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
                spawn: e.spawn,
                spawnPlan: e.spawnPlan,
                tm: e.tm,
                ph: e.ph,
                cool: e.cool,
                en: e.en,
                dive: e.dive,
                form: e.form,
                lead: e.lead,
                esc: e.esc
              }))
              .sort((a, b) => (a.row - b.row) || (a.column - b.column) || (a.id - b.id))
          };
        }
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: true });
      }
      return {
        error: 'failed to reach requested carryover snapshot window',
        snapshot: h.snapshot(),
        events: h.recentEvents({ count: options.eventCount })
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
    recentEvents: data.events.slice(-10)
  }, null, 2));
}

async function main() {
  const baselineRoot = path.resolve(argValue('--baseline-root', '/private/tmp/codex-baseline-831a2c6/dist/dev'));
  const currentRoot = path.resolve(argValue('--current-root', path.resolve(__dirname, '..', '..', 'dist', 'dev')));
  const stage = numberArg('--stage', 2);
  const ships = numberArg('--ships', 3);
  const seed = numberArg('--seed', 51301);
  const time = numberArg('--time', 7.883);
  const persona = argValue('--persona', 'professional');
  const eventCount = numberArg('--event-count', 24);

  const cfg = { stage, ships, seed, time, persona, eventCount };
  const [baseline, current] = await Promise.all([
    capture(baselineRoot, cfg),
    capture(currentRoot, cfg)
  ]);

  printSummary('baseline', baseline);
  printSummary('current', current);

  const summaryDiff = {
    playerX: +((current.snapshot?.player?.x || 0) - (baseline.snapshot?.player?.x || 0)).toFixed(2),
    playerVx: +((current.snapshot?.player?.vx || 0) - (baseline.snapshot?.player?.vx || 0)).toFixed(2),
    score: (current.snapshot?.score || 0) - (baseline.snapshot?.score || 0),
    rngStateEqual: current.snapshot?.rngState === baseline.snapshot?.rngState,
    simT: +((current.snapshot?.simT || 0) - (baseline.snapshot?.simT || 0)).toFixed(3),
    stageClock: +((current.snapshot?.stageClock || 0) - (baseline.snapshot?.stageClock || 0)).toFixed(3)
  };

  console.log('\n[summary-diff]');
  console.log(JSON.stringify(summaryDiff, null, 2));

  if (baseline.error || current.error) {
    return;
  }

  const targetDiffs = diffTargets(baseline.targets, current.targets);
  console.log('\n[target-diffs]');
  console.log(JSON.stringify(targetDiffs.slice(0, 30), null, 2));
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

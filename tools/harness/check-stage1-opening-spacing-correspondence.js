#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const PROFILE = path.join(__dirname, 'reference-profiles', 'stage1-opening-spacing.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'stage1-opening-spacing');

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
    const { execFileSync } = require('child_process');
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function argValue(flag, fallback = ''){
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && idx + 1 < process.argv.length ? process.argv[idx + 1] : fallback;
}

async function capture(root, cfg){
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
      h.stop('stage-opening-spacing-correspondence');
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
      return {
        snapshot,
        layout: formation.layout || null,
        targets: (formation.targets || [])
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
            spawn: e.spawn
          }))
          .sort((a, b) => (a.row - b.row) || (a.column - b.column) || (a.id - b.id))
      };
    }, cfg);
  });
}

function mapById(targets){
  const map = new Map();
  for(const t of targets) map.set(t.id, t);
  return map;
}

function summarizeTargets(targets){
  const txs = targets.map(t => t.tx);
  const tys = targets.map(t => t.ty);
  return {
    count: targets.length,
    minTx: Math.min(...txs),
    maxTx: Math.max(...txs),
    minTy: Math.min(...tys),
    maxTy: Math.max(...tys)
  };
}

function diffTargets(baselineTargets, currentTargets){
  const baselineMap = mapById(baselineTargets);
  const diffs = [];
  for(const current of currentTargets){
    const baseline = baselineMap.get(current.id);
    if(!baseline){
      diffs.push({ id: current.id, kind: 'missing_in_baseline', current });
      continue;
    }
    const dx = +(current.tx - baseline.tx).toFixed(2);
    const dy = +(current.ty - baseline.ty).toFixed(2);
    const distance = +Math.sqrt(dx * dx + dy * dy).toFixed(3);
    if(distance > 0.001 || current.form !== baseline.form || current.dive !== baseline.dive){
      diffs.push({
        id: current.id,
        kind: 'changed',
        type: current.type,
        row: current.row,
        column: current.column,
        baseline: { tx: baseline.tx, ty: baseline.ty, form: baseline.form, dive: baseline.dive },
        current: { tx: current.tx, ty: current.ty, form: current.form, dive: current.dive },
        delta: { dx, dy, distance }
      });
    }
  }
  return diffs.sort((a, b) => (a.row ?? 99) - (b.row ?? 99) || (a.column ?? 99) - (b.column ?? 99) || a.id - b.id);
}

function layoutDrift(layout, targets){
  return {
    gx: layout?.gx ?? null,
    gy: layout?.gy ?? null,
    bounds: summarizeTargets(targets)
  };
}

function buildReadme(report){
  const lines = [
    '# Stage 1 Opening Spacing Correspondence',
    '',
    'This artifact compares the current stage-1 opening geometry against the shipped local baseline and the expected rack-layout constraints.',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    '',
    '## Summary',
    '',
    `- Within geometry tolerances: ${report.summary.ok ? 'yes' : 'no'}`,
    `- Changed targets: ${report.summary.changedTargets}`,
    `- Max target drift: ${report.summary.maxTargetDrift}`,
    `- Average target drift: ${report.summary.averageTargetDrift}`,
    '',
    '## Layout',
    '',
    `- Baseline gx/gy: ${String(report.baseline.layout?.gx)} / ${String(report.baseline.layout?.gy)}`,
    `- Current gx/gy: ${String(report.current.layout?.gx)} / ${String(report.current.layout?.gy)}`,
    `- Baseline bounds: ${JSON.stringify(report.baseline.summary)}`,
    `- Current bounds: ${JSON.stringify(report.current.summary)}`,
    '',
    '## Read',
    '',
    '- This is a correspondence report, not a hard claim that the current geometry is correct or incorrect in isolation.',
    '- Use it to see whether the current candidate stayed close to the shipped local baseline while also respecting the expected rack layout constraints.',
    '- Expand this same pattern later into more explicit historical formation references if we add stronger preserved Galaga spatial baselines.',
    ''
  ];
  return `${lines.join('\n')}\n`;
}

async function main(){
  const profile = readJson(PROFILE);
  const baselineRoot = path.resolve(ROOT, argValue('--baseline-root', profile.candidateRoots.baseline));
  const currentRoot = path.resolve(ROOT, argValue('--current-root', profile.candidateRoots.current));
  const cfg = profile.capture;
  const [baseline, current] = await Promise.all([
    capture(baselineRoot, cfg),
    capture(currentRoot, cfg)
  ]);

  if(!baseline.layout || !current.layout){
    fail('missing formation layout in opening spacing correspondence run', { baseline: !!baseline.layout, current: !!current.layout });
  }

  const diffs = diffTargets(baseline.targets, current.targets);
  const changedTargetDistances = diffs.filter(d => d.kind === 'changed').map(d => d.delta.distance);
  const maxTargetDrift = changedTargetDistances.length ? +Math.max(...changedTargetDistances).toFixed(3) : 0;
  const averageTargetDrift = changedTargetDistances.length ? +(changedTargetDistances.reduce((sum, value) => sum + value, 0) / changedTargetDistances.length).toFixed(3) : 0;
  const layoutTargets = profile.layoutTargets;
  const tolerances = profile.tolerances;
  const currentSummary = summarizeTargets(current.targets);
  const currentLayoutDrift = {
    gx: +(Math.abs((current.layout.gx || 0) - layoutTargets.gx)).toFixed(3),
    gy: +(Math.abs((current.layout.gy || 0) - layoutTargets.gy)).toFixed(3)
  };
  const layoutWithinBounds =
    currentSummary.minTx >= layoutTargets.minTx &&
    currentSummary.maxTx <= layoutTargets.maxTx &&
    currentSummary.minTy >= layoutTargets.minTy &&
    currentSummary.maxTy <= layoutTargets.maxTy;
  const ok =
    maxTargetDrift <= tolerances.maxTargetPositionDrift &&
    averageTargetDrift <= tolerances.maxAverageTargetPositionDrift &&
    diffs.filter(d => d.kind === 'changed').length <= tolerances.maxChangedTargets &&
    currentLayoutDrift.gx <= tolerances.maxLayoutDrift &&
    currentLayoutDrift.gy <= tolerances.maxLayoutDrift &&
    layoutWithinBounds;

  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${gitShortCommit()}`);
  ensureDir(outDir);
  const report = {
    generatedAt: new Date().toISOString(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    baseline: {
      snapshot: baseline.snapshot,
      layout: baseline.layout,
      summary: summarizeTargets(baseline.targets)
    },
    current: {
      snapshot: current.snapshot,
      layout: current.layout,
      summary: currentSummary
    },
    changedTargets: diffs.slice(0, 20),
    summary: {
      ok,
      changedTargets: diffs.filter(d => d.kind === 'changed').length,
      maxTargetDrift,
      averageTargetDrift,
      currentLayoutDrift,
      layoutWithinBounds
    }
  };
  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));
  console.log(JSON.stringify({
    ok,
    outDir,
    report: reportFile,
    readme: readmeFile,
    summary: report.summary
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

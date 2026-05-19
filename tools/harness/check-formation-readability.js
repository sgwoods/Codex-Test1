#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-readability');
const OUT = path.join(OUT_DIR, 'latest.json');

const MODES = ['auto', 'reference-pixel-lab'];
const STAGES = [1, 4, 8];
const SAMPLE_TIMES = [0.65, 4.8, 6.2, 7.6, 9.0];
const MIN_SETTLED_HORIZONTAL_GAP = 1.8;
const MIN_SETTLED_VERTICAL_GAP = 2.8;
const MAX_ACTIVE_OVERLAP_PAIRS = 8;
const STAGE1_ACTIVE_OVERLAP_ADVISORY_PAIRS = 8;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rounded(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function boxFor(enemy, mode){
  const type = String(enemy?.type || enemy?.t || '');
  const family = String(enemy?.family || enemy?.fam || '');
  if(mode === 'reference-pixel-lab'){
    if(family === 'dragonfly' || family === 'mosquito') return { width: 16, height: 10 };
    if(type === 'boss') return { width: 13, height: 14 };
    if(type === 'rogue') return { width: 10, height: 12 };
    return { width: 11, height: 14 };
  }
  if(type === 'boss') return { width: 18, height: 14 };
  if(family === 'dragonfly' || family === 'mosquito') return { width: 18, height: 14 };
  return { width: 16, height: 14 };
}

function rectFor(enemy, mode, useTarget = false){
  const box = boxFor(enemy, mode);
  const cx = useTarget ? +enemy.tx : +enemy.x;
  const cy = useTarget ? +enemy.ty : +enemy.y;
  return {
    id: enemy.id,
    type: enemy.type,
    family: enemy.family,
    row: enemy.row,
    column: enemy.column,
    x: rounded(cx),
    y: rounded(cy),
    left: cx - box.width / 2,
    right: cx + box.width / 2,
    top: cy - box.height / 2,
    bottom: cy + box.height / 2,
    width: box.width,
    height: box.height
  };
}

function pairGap(a, b){
  const horizontal = Math.max(a.left, b.left) - Math.min(a.right, b.right);
  const vertical = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom);
  return { horizontal, vertical };
}

function overlapArea(a, b){
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function settledMetrics(targets, mode){
  const rects = targets.map(target => rectFor(target, mode, true));
  let minHorizontalGap = Infinity;
  let minVerticalGap = Infinity;
  const compressedHorizontal = [];
  const compressedVertical = [];

  for(const a of rects){
    for(const b of rects){
      if(a.id >= b.id) continue;
      if(a.row === b.row && Math.abs(a.column - b.column) === 1){
        const gap = b.left > a.left ? b.left - a.right : a.left - b.right;
        minHorizontalGap = Math.min(minHorizontalGap, gap);
        if(gap < MIN_SETTLED_HORIZONTAL_GAP) compressedHorizontal.push({ a: a.id, b: b.id, row: a.row, gap: rounded(gap) });
      }
      if(a.column === b.column && Math.abs(a.row - b.row) === 1){
        const gap = b.top > a.top ? b.top - a.bottom : a.top - b.bottom;
        minVerticalGap = Math.min(minVerticalGap, gap);
        if(gap < MIN_SETTLED_VERTICAL_GAP) compressedVertical.push({ a: a.id, b: b.id, column: a.column, gap: rounded(gap) });
      }
    }
  }
  return {
    minHorizontalGap: rounded(minHorizontalGap),
    minVerticalGap: rounded(minVerticalGap),
    compressedHorizontalCount: compressedHorizontal.length,
    compressedVerticalCount: compressedVertical.length,
    compressedHorizontal: compressedHorizontal.slice(0, 12),
    compressedVertical: compressedVertical.slice(0, 12)
  };
}

function activeMetrics(targets, mode){
  const visible = targets
    .filter(item => item.spawn <= 0 && item.x >= -12 && item.x <= 292 && item.y >= -16 && item.y <= 140)
    .map(item => rectFor(item, mode, false));
  const overlaps = [];
  for(let i = 0; i < visible.length; i++){
    for(let j = i + 1; j < visible.length; j++){
      const area = overlapArea(visible[i], visible[j]);
      if(area > 0.2) overlaps.push({
        a: visible[i].id,
        b: visible[j].id,
        area: rounded(area),
        aType: visible[i].type,
        bType: visible[j].type
      });
    }
  }
  return {
    visibleCount: visible.length,
    overlapPairs: overlaps.length,
    largestOverlapArea: rounded(Math.max(0, ...overlaps.map(item => item.area || 0))),
    overlaps: overlaps.slice(0, 12)
  };
}

async function sampleStageMode(stage, mode){
  return withHarnessPage({
    stage,
    ships: 3,
    challenge: false,
    seed: 7719 + stage,
    skipStart: true
  }, async ({ page }) => {
    return page.evaluate(async ({ stage, mode, sampleTimes }) => {
      const h = window.__galagaHarness__;
      h.stop('formation-readability');
      h.start({
        stage,
        ships: 3,
        challenge: false,
        seed: 7719 + stage,
        autoVideo: false,
        controlledClock: true,
        initialSimT: 0,
        graphicsTheme: 'classic-arcade',
        spriteRenderMode: mode,
        starfieldIntensity: 0,
        starfieldSpeed: 0
      });
      h.setControlledClock(1);
      const samples = [];
      let elapsed = 0;
      for(const targetTime of sampleTimes){
        h.advanceFor(Math.max(0, targetTime - elapsed), { step: 1 / 60, stopOnGameOver: true });
        elapsed = targetTime;
        samples.push({
          time: targetTime,
          state: h.state(),
          formation: h.formationState()
        });
      }
      return samples;
    }, { stage, mode, sampleTimes: SAMPLE_TIMES });
  });
}

async function main(){
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const checks = [];
  for(const stage of STAGES){
    for(const mode of MODES){
      const samples = await sampleStageMode(stage, mode);
      const sampleReads = samples.map(sample => ({
        time: sample.time,
        stageClock: sample.state?.stageClock,
        settled: settledMetrics(sample.formation.targets || [], mode),
        active: activeMetrics(sample.formation.targets || [], mode)
      }));
      const worstActiveOverlapPairs = Math.max(...sampleReads.map(item => item.active.overlapPairs));
      const worstActiveOverlapArea = Math.max(...sampleReads.map(item => item.active.largestOverlapArea || 0));
      const firstSettled = sampleReads[0].settled;
      checks.push({
        stage,
        mode,
        layout: samples[0]?.formation?.layout || null,
        settled: firstSettled,
        activeWindow: {
          worstOverlapPairs: worstActiveOverlapPairs,
          worstOverlapArea: rounded(worstActiveOverlapArea)
        },
        samples: sampleReads
      });
    }
  }

  const failures = [];
  const warnings = [];
  for(const check of checks){
    if(check.settled.minHorizontalGap < MIN_SETTLED_HORIZONTAL_GAP){
      failures.push({ stage: check.stage, mode: check.mode, kind: 'settled-horizontal-gap', value: check.settled.minHorizontalGap });
    }
    if(check.settled.minVerticalGap < MIN_SETTLED_VERTICAL_GAP){
      failures.push({ stage: check.stage, mode: check.mode, kind: 'settled-vertical-gap', value: check.settled.minVerticalGap });
    }
    if(check.stage === 1 && check.activeWindow.worstOverlapPairs > STAGE1_ACTIVE_OVERLAP_ADVISORY_PAIRS){
      warnings.push({ stage: check.stage, mode: check.mode, kind: 'stage1-active-entry-overlap-advisory', value: check.activeWindow.worstOverlapPairs });
    }else if(check.activeWindow.worstOverlapPairs > MAX_ACTIVE_OVERLAP_PAIRS){
      failures.push({ stage: check.stage, mode: check.mode, kind: 'active-entry-overlap-pairs', value: check.activeWindow.worstOverlapPairs });
    }
  }

  const artifact = {
    schemaVersion: 1,
    artifactType: 'formation-readability',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current'], 'unknown'),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    dirty: !!git(['status', '--short'], ''),
    problem: 'Galaga-style 40-enemy racks require enough air between sprites that formation rows and entry waves remain readable after moving toward more authentic pixel silhouettes.',
    strategy: 'Measure settled target rectangle gaps and active entry overlap windows in both normal Aurora rendering and Reference Pixel Lab mode.',
    successMeasure: `Settled adjacent gaps stay above ${MIN_SETTLED_HORIZONTAL_GAP} horizontal and ${MIN_SETTLED_VERTICAL_GAP} vertical logical units, while non-stage-1 active entry overlap stays within ${MAX_ACTIVE_OVERLAP_PAIRS} pair(s) per sampled window. Stage 1 opening overlap is reported as advisory choreography debt until a reference-timed opening-path scorer exists.`,
    thresholds: {
      minSettledHorizontalGap: MIN_SETTLED_HORIZONTAL_GAP,
      minSettledVerticalGap: MIN_SETTLED_VERTICAL_GAP,
      maxActiveOverlapPairs: MAX_ACTIVE_OVERLAP_PAIRS,
      stage1ActiveOverlapAdvisoryPairs: STAGE1_ACTIVE_OVERLAP_ADVISORY_PAIRS
    },
    summary: {
      ok: failures.length === 0,
      stageCount: STAGES.length,
      modeCount: MODES.length,
      failureCount: failures.length,
      warningCount: warnings.length,
      worstSettledHorizontalGap: rounded(Math.min(...checks.map(item => item.settled.minHorizontalGap))),
      worstSettledVerticalGap: rounded(Math.min(...checks.map(item => item.settled.minVerticalGap))),
      worstActiveOverlapPairs: Math.max(...checks.map(item => item.activeWindow.worstOverlapPairs))
    },
    warnings,
    failures,
    checks
  };
  fs.writeFileSync(OUT, `${JSON.stringify(artifact, null, 2)}\n`);
  if(failures.length){
    fail('Formation readability guard failed', artifact);
  }
  console.log(JSON.stringify({ ok: true, artifact: path.relative(ROOT, OUT), summary: artifact.summary }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-routeability');
const OUT_JSON = path.join(OUT_ROOT, 'latest.json');
const OUT_MD = path.join(ROOT, 'CHALLENGE_STAGE_ROUTEABILITY_REVIEW.md');
const SAMPLE_TIMES = Array.from({ length: 121 }, (_, index) => +(index * 0.2).toFixed(2));
const PLAYER_X = 140;
const PLAYER_Y = 338;
const BULLET_SPEED = 560;
const PLAYER_SPEED = 440;
const SHOT_COOLDOWN = 0.095;

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function round(value, digits = 2){
  const factor = 10 ** digits;
  return Math.round((+value || 0) * factor) / factor;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function stageLabel(stage){
  const marker = +stage || 3;
  const n = Math.max(1, Math.round((marker - 3) / 4) + 1);
  return `Challenging Stage ${Math.max(1, marker - 1)}-${marker} (#${n})`;
}

function parseStages(){
  const rawStages = argValue('stages', '');
  if(rawStages){
    return rawStages
      .split(',')
      .map(value => Math.max(1, +value.trim() || 0))
      .filter(Boolean);
  }
  return [Math.max(1, +argValue('stage', '19') || 19)];
}

function markdown(report){
  const rows = (report.stageRows || []).map(row => {
    const s = row.summary || {};
    return `| ${s.label || stageLabel(s.stage)} | ${s.layoutId || ''} | ${s.trackedRows}/${s.targetCount} | ${s.scoreableRows}/${s.targetCount} | ${s.greedyRouteKills}/${s.targetCount} | ${s.greedyRouteScore10}/10 | ${(s.weakestRows || []).slice(0, 2).join('; ') || 'No routeability blocker isolated.'} |`;
  }).join('\n');
  const details = (report.stageRows || []).map(row => {
    const s = row.summary || {};
    return `
## ${s.label || stageLabel(s.stage)}
- Layout: ${s.layoutId || 'pending'}
- Visibility: ${s.inBoundsRows}/${s.targetCount} targets enter the readable playfield; ${s.readableRows}/${s.targetCount} have readable altitude samples.
- Scoreability: ${s.scoreableRows}/${s.targetCount} targets expose at least one measured score window.
- Greedy route: ${s.greedyRouteKills}/${s.targetCount} targets, ${s.greedyRouteScore10}/10, first shot window ${s.firstRouteT ?? 'n/a'}s, last shot window ${s.lastRouteT ?? 'n/a'}s.
- Weakest rows: ${(s.weakestRows || []).slice(0, 5).join('; ') || 'None in this probe.'}
`;
  }).join('\n');
  return `# Challenge Stage Routeability Review

Generated: ${report.generatedAt}

This report measures whether Aurora's challenging-stage targets are visible, scoreable, and plausibly routeable by a human player using a simple deterministic firing-route probe. It complements the stricter conformance analyzer: routeability can improve the user experience even when target-video choreography and visual novelty remain low.

| Challenging Stage | Layout | Tracked | Scoreable | Greedy Route | Route Score | Main Blocker |
| --- | --- | ---: | ---: | ---: | ---: | --- |
${rows}

${details}

## Use In The Conformance Loop
1. Keep routeability high before accepting more spectacular movement.
2. Treat this as a player-experience guardrail, not as proof of Galaga visual conformance.
3. Pair this artifact with target-video object-track fit before promoting any challenge-stage rewrite.
`;
}

async function analyzeStage(stage){
  const report = await withHarnessPage({ stage, ships: 3, challenge: false, seed: 9500 + stage }, async ({ page }) => {
    return page.evaluate(({ stage, sampleTimes, playerY, bulletSpeed }) => {
      const h = window.__galagaHarness__;
      h.setupChallengeMotionProfileTest({ stage });
      const layout = h.challengeFormationState().layout;
      const rows = {};
      let previous = 0;
      for(const t of sampleTimes){
        const delta = Math.max(0, t - previous);
        if(delta) h.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false });
        previous = t;
        const formation = h.challengeFormationState();
        for(const e of formation.enemies || []){
          const key = `${e.wave}:${e.lane}`;
          if(!rows[key]){
            rows[key] = {
              wave: e.wave,
              lane: e.lane,
              type: e.type,
              family: e.family,
              pathFamily: e.pathFamily,
              samples: 0,
              spawnedSamples: 0,
              inBoundsSamples: 0,
              scoreableSamples: 0,
              readableSamples: 0,
              firstInBoundsT: null,
              lastInBoundsT: null,
              firstScoreableT: null,
              lastScoreableT: null,
              minX: Infinity,
              maxX: -Infinity,
              minY: Infinity,
              maxY: -Infinity,
              opportunities: []
            };
          }
          const row = rows[key];
          row.samples += 1;
          if(Number.isFinite(+e.spawn) && +e.spawn > 0.03) continue;
          row.spawnedSamples += 1;
          const x = +e.x;
          const y = +e.y;
          if(!Number.isFinite(x) || !Number.isFinite(y)) continue;
          row.minX = Math.min(row.minX, x);
          row.maxX = Math.max(row.maxX, x);
          row.minY = Math.min(row.minY, y);
          row.maxY = Math.max(row.maxY, y);
          const inBounds = x >= -12 && x <= 292 && y >= -24 && y <= 384;
          if(!inBounds) continue;
          row.inBoundsSamples += 1;
          row.firstInBoundsT = row.firstInBoundsT === null ? t : row.firstInBoundsT;
          row.lastInBoundsT = t;
          if(y >= 76 && y <= 270) row.readableSamples += 1;
          const travelT = Math.max(0.02, (playerY - y) / bulletSpeed);
          const tolerance = e.type === 'boss' ? 18 : 13;
          const scoreable = y >= 58 && y <= 298 && travelT <= 0.62 && x >= -4 && x <= 284;
          if(scoreable){
            row.scoreableSamples += 1;
            row.firstScoreableT = row.firstScoreableT === null ? t : row.firstScoreableT;
            row.lastScoreableT = t;
            row.tolerance = tolerance;
            row.opportunities.push({
              t,
              x,
              y,
              tolerance,
              id: key
            });
          }
        }
      }
      return {
        stage,
        layout,
        rows: Object.values(rows).sort((a, b) => (a.wave - b.wave) || (a.lane - b.lane))
      };
    }, { stage, sampleTimes: SAMPLE_TIMES, playerY: PLAYER_Y, bulletSpeed: BULLET_SPEED });
  });

  const expected = 40;
  const rows = report.rows.map(row => {
    const inBounds = row.inBoundsSamples > 0;
    const scoreable = row.scoreableSamples > 0;
    const readable = row.readableSamples > 1;
    return Object.assign({}, row, {
      inBounds,
      scoreable,
      readable,
      minX: Number.isFinite(row.minX) ? round(row.minX) : null,
      maxX: Number.isFinite(row.maxX) ? round(row.maxX) : null,
      minY: Number.isFinite(row.minY) ? round(row.minY) : null,
      maxY: Number.isFinite(row.maxY) ? round(row.maxY) : null
    });
  });
  const opportunities = rows
    .flatMap(row => (row.opportunities || []).map(item => Object.assign({}, item, {
      wave: row.wave,
      lane: row.lane,
      type: row.type,
      pathFamily: row.pathFamily
    })))
    .sort((a, b) => a.t - b.t || a.x - b.x);
  const killed = new Set();
  const route = [];
  let playerX = PLAYER_X;
  let availableAt = 0;
  for(const opportunity of opportunities){
    if(killed.has(opportunity.id)) continue;
    const dt = Math.max(0, opportunity.t - availableAt);
    const reachableDx = (PLAYER_SPEED * dt) + opportunity.tolerance + 8;
    if(Math.abs(opportunity.x - playerX) > reachableDx) continue;
    killed.add(opportunity.id);
    route.push(opportunity);
    playerX = opportunity.x;
    availableAt = Math.max(availableAt, opportunity.t + SHOT_COOLDOWN);
  }
  const missedRows = rows
    .filter(row => !killed.has(`${row.wave}:${row.lane}`))
    .map(row => `${row.wave}:${row.lane} ${row.type}/${row.pathFamily} scoreable=${row.scoreableSamples} first=${row.firstScoreableT ?? 'n/a'} last=${row.lastScoreableT ?? 'n/a'}`);
  const summary = {
    stage,
    label: stageLabel(stage),
    layoutId: report.layout?.id || '',
    targetCount: expected,
    trackedRows: rows.length,
    inBoundsRows: rows.filter(row => row.inBounds).length,
    scoreableRows: rows.filter(row => row.scoreable).length,
    readableRows: rows.filter(row => row.readable).length,
    greedyRouteKills: killed.size,
    greedyRouteScore10: round(1 + (clamp(killed.size / expected) * 9), 1),
    firstRouteT: route.length ? route[0].t : null,
    lastRouteT: route.length ? route[route.length - 1].t : null,
    scoreableScore10: round(1 + (clamp(rows.filter(row => row.scoreable).length / expected) * 9), 1),
    missedRows,
    weakestRows: rows
      .filter(row => !row.scoreable || row.scoreableSamples < 2)
      .map(row => `${row.wave}:${row.lane} ${row.type}/${row.pathFamily} scoreable=${row.scoreableSamples} y=${row.minY ?? 'n/a'}..${row.maxY ?? 'n/a'}`)
      .slice(0, 12)
  };
  return { summary, layout: report.layout, rows };
}

async function run(){
  const stages = parseStages();
  const stageRows = [];
  for(const stage of stages){
    stageRows.push(await analyzeStage(stage));
  }
  const summary = {
    stageCount: stageRows.length,
    stages: stageRows.map(row => row.summary.stage),
    weakestStage: stageRows.slice().sort((a, b) => (a.summary.greedyRouteScore10 || 0) - (b.summary.greedyRouteScore10 || 0))[0]?.summary.label || '',
    averageGreedyRouteScore10: round(stageRows.reduce((sum, row) => sum + (+row.summary.greedyRouteScore10 || 0), 0) / Math.max(1, stageRows.length), 1),
    averageScoreableScore10: round(stageRows.reduce((sum, row) => sum + (+row.summary.scoreableScore10 || 0), 0) / Math.max(1, stageRows.length), 1),
    totalTrackedRows: stageRows.reduce((sum, row) => sum + (+row.summary.trackedRows || 0), 0),
    totalRouteKills: stageRows.reduce((sum, row) => sum + (+row.summary.greedyRouteKills || 0), 0),
    read: 'Routeability is a player-experience guardrail: every target should be visible, scoreable, and plausibly reachable before we add more spectacle or stricter target-video choreography.'
  };
  const out = {
    schemaVersion: 2,
    artifactType: 'challenge-stage-routeability',
    generatedAt: new Date().toISOString(),
    summary,
    stageRows,
    latestStage: stageRows[stageRows.length - 1] || null
  };
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(out, null, 2)}\n`);
  fs.writeFileSync(OUT_MD, `${markdown(out).trimEnd()}\n`);
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, OUT_JSON),
    report: path.relative(ROOT, OUT_MD),
    summary
  }, null, 2));
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});

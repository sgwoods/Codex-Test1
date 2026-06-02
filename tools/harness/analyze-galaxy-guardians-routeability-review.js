#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const IDENTITY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity');
const OUT = path.join(IDENTITY_ROOT, 'routeability-review-0.1.json');
const OUT_MD = path.join(IDENTITY_ROOT, 'routeability-review-0.1.md');
const LONG_SURFACE = path.join(IDENTITY_ROOT, 'long-surface-conformance-0.1.json');
const PLAYTEST = path.join(IDENTITY_ROOT, 'playtest-conformance-review-0.1.json');
const MOVEMENT = path.join(IDENTITY_ROOT, 'movement-pacing-0.1.json');

function readJson(file, fallback = null){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function eventCount(run, key){
  return +(run.eventCounts?.[key] || 0);
}

function collisionLossShare(run){
  const reasons = Array.isArray(run.lossReasons) ? run.lossReasons : [];
  if(!reasons.length) return 0;
  return reasons.filter(reason => String(reason || '').includes('collision')).length / reasons.length;
}

function scoreRun(run = {}){
  const duration = Math.max(1, +run.durationSeconds || +run.simT || 1);
  const survivalShare = clamp((+run.simT || 0) / duration);
  const stageSpan = Math.max(1, ((+run.maxPlayableStage || +run.stageStart || 1) - (+run.stageStart || 1)) + 1);
  const progressionShare = clamp(((+run.stageAdvances || 0) + (+run.waveClears || 0)) / stageSpan);
  const lossBudgetShare = clamp(1 - ((+run.playerLosses || 0) / Math.max(1, +run.ships || 3)));
  const shotResolutionShare = eventCount(run, 'player_shot_fired')
    ? clamp(eventCount(run, 'player_shot_resolved') / Math.max(1, eventCount(run, 'player_shot_fired')))
    : 0;
  const collisionSafetyShare = clamp(1 - collisionLossShare(run));
  const divePressurePerMinute = eventCount(run, 'alien_dive_start') / Math.max(1, duration / 60);
  const shotPressurePerMinute = eventCount(run, 'enemy_shot') / Math.max(1, duration / 60);
  const pressureSurvivability = clamp(1 - Math.max(0, ((divePressurePerMinute + (shotPressurePerMinute * 0.55)) - 42) / 52));
  const routeability = clamp(
    (0.24 * survivalShare)
    + (0.18 * progressionShare)
    + (0.16 * lossBudgetShare)
    + (0.17 * collisionSafetyShare)
    + (0.12 * shotResolutionShare)
    + (0.13 * pressureSurvivability)
  );
  return {
    persona: run.persona || 'unknown',
    stageStart: run.stageStart ?? null,
    finalStage: run.finalStage ?? null,
    score: run.score ?? null,
    durationSeconds: run.durationSeconds ?? null,
    simT: run.simT ?? null,
    gameOver: !!run.gameOver,
    gameOverReason: run.gameOverReason || '',
    stageAdvances: +run.stageAdvances || 0,
    waveClears: +run.waveClears || 0,
    playerLosses: +run.playerLosses || 0,
    score10: round(1 + routeability * 8.4, 1),
    components: {
      survivalShare: round(survivalShare, 3),
      progressionShare: round(progressionShare, 3),
      lossBudgetShare: round(lossBudgetShare, 3),
      collisionSafetyShare: round(collisionSafetyShare, 3),
      shotResolutionShare: round(shotResolutionShare, 3),
      pressureSurvivability: round(pressureSurvivability, 3),
      divePressurePerMinute: round(divePressurePerMinute, 2),
      shotPressurePerMinute: round(shotPressurePerMinute, 2)
    },
    read: `${run.persona || 'unknown'} ${run.stageStart >= 5 ? 'midrun' : 'opening'} routeability ${round(1 + routeability * 8.4, 1)}/10: survived ${round((+run.simT || 0), 1)}s, reached stage ${run.finalStage ?? 'n/a'}, cleared ${+run.waveClears || 0} wave(s), and lost ${+run.playerLosses || 0}/${+run.ships || '?'} ships.`
  };
}

function scoreGroup(label, runs = []){
  const rows = runs.map(scoreRun);
  const score10 = round(average(rows.map(row => row.score10)), 1);
  const collisionRisk = round(average(rows.map(row => 1 - row.components.collisionSafetyShare)), 3);
  const survival = round(average(rows.map(row => row.components.survivalShare)), 3);
  const progression = round(average(rows.map(row => row.components.progressionShare)), 3);
  return {
    label,
    score10,
    runCount: rows.length,
    survivalShare: survival,
    progressionShare: progression,
    collisionLossShare: collisionRisk,
    rows,
    read: `${label} averages ${score10}/10 routeability, ${round(survival * 100, 0)}% survival share, ${round(progression * 100, 0)}% progression share, and ${round(collisionRisk * 100, 0)}% collision-loss share.`
  };
}

function buildMarkdown(report){
  const groupRows = report.groups.map(group => `| ${group.label} | ${group.score10}/10 | ${group.runCount} | ${round(group.survivalShare * 100, 0)}% | ${round(group.progressionShare * 100, 0)}% | ${round(group.collisionLossShare * 100, 0)}% | ${group.read} |`).join('\n');
  const runRows = report.groups.flatMap(group => group.rows.map(row => `| ${group.label} | ${row.persona} | ${row.stageStart} | ${row.finalStage} | ${row.score10}/10 | ${row.score ?? 'n/a'} | ${row.simT ?? 'n/a'}s | ${row.gameOverReason || 'active'} |`)).join('\n');
  return `# Galaxy Guardians Routeability Review

Generated: ${report.createdOn}
Status: ${report.status}

## Summary

${report.summary.releaseRead}

## Group Scores

| Group | Routeability | Runs | Survival | Progression | Collision Losses | Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${groupRows}

## Persona Runs

| Group | Persona | Start Stage | Final Stage | Routeability | Score | Sim Time | End |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
${runRows}

## Promotion Policy

${report.promotionPolicy}
`;
}

function main(){
  const longSurface = readJson(LONG_SURFACE, {});
  const playtest = readJson(PLAYTEST, {});
  const movement = readJson(MOVEMENT, {});
  const personaRuns = longSurface.personaRuns || {};
  const groups = [
    scoreGroup('competitive-three-ship', personaRuns.competitiveThreeShip || []),
    scoreGroup('review-five-ship', personaRuns.reviewFiveShip || []),
    scoreGroup('midrun-stage-five-stress', personaRuns.midrunStageFiveStress || [])
  ];
  const byLabel = Object.fromEntries(groups.map(group => [group.label, group]));
  const overall = round(
    (0.24 * (byLabel['competitive-three-ship']?.score10 || 0))
    + (0.26 * (byLabel['review-five-ship']?.score10 || 0))
    + (0.38 * (byLabel['midrun-stage-five-stress']?.score10 || 0))
    + (0.12 * (longSurface.summary?.midrunSurvivabilityScore10 || 0)),
    1
  );
  const weakest = groups.slice().sort((a, b) => a.score10 - b.score10)[0] || {};
  const report = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-routeability-review',
    version: '0.1',
    createdOn: new Date().toISOString(),
    status: 'dev-preview-routeability-gate-planning-not-runtime-promotion',
    sourceEvidence: [
      rel(LONG_SURFACE),
      rel(PLAYTEST),
      rel(MOVEMENT)
    ],
    summary: {
      routeabilityScore10: overall,
      weakestGroup: weakest.label || null,
      weakestGroupScore10: weakest.score10 ?? null,
      midrunSurvivabilityScore10: longSurface.summary?.midrunSurvivabilityScore10 ?? null,
      playtestMotionPressureScore10: (playtest.categories || []).find(category => category.id === 'motion-pressure')?.playtestWeightedScore10 ?? null,
      releaseRead: `Guardians routeability is ${overall}/10. The weakest route is ${weakest.label || 'pending'} at ${weakest.score10 ?? 'n/a'}/10, which keeps stage-five-and-beyond movement work behind a player-routeability gate before any pressure or movement candidate should be promoted.`
    },
    groups,
    promotionPolicy: 'Future Guardians movement candidates should not be promoted only because dive cadence, object tracks, or pressure metrics become more reference-like. They should also preserve or improve routeability: stronger personas must retain learnable survival/scoring windows, midrun stage-five stress must not become collision-dominated, and shot/dive pressure must remain readable enough for persona review to convert pressure into clears.',
    nextSteps: [
      'Add a browser-backed before/after routeability capture once Guardians has a concrete movement candidate loop.',
      'Record candidate-vs-baseline routeability deltas beside audio, object-track, and frame-motion conformance deltas.',
      'Treat stage-five collision-dominated failures as a high-value Guardians quality target before broader public release positioning.'
    ]
  };
  writeJson(OUT, report);
  writeText(OUT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    routeabilityScore10: report.summary.routeabilityScore10,
    weakestGroup: report.summary.weakestGroup,
    weakestGroupScore10: report.summary.weakestGroupScore10
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.stack || String(err));
  process.exit(1);
}

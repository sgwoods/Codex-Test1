#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  loadGuardiansVm,
  simulatePersona,
  installGuardiansRuntimeRulePatch
} = require('./guardians-long-surface-lib');

const IDENTITY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity');
const CANDIDATE_QUEUE = path.join(IDENTITY_ROOT, 'motion-grammar-candidates-0.1.json');
const OUT = path.join(IDENTITY_ROOT, 'routeability-before-after-0.1.json');
const OUT_MD = path.join(IDENTITY_ROOT, 'routeability-before-after-0.1.md');
const OUT_SVG = path.join(IDENTITY_ROOT, 'routeability-before-after-0.1.svg');

const PERSONAS = ['advanced', 'expert', 'professional'];
const SEEDS = {
  advanced: 9101,
  expert: 9144,
  professional: 9187
};

const CANDIDATES = [
  {
    id: 'stage5-routeability-relief-balanced-v0',
    label: 'Balanced stage-five routeability relief',
    patch: {
      minRank: 3,
      scales: {
        scoutDiveIntervalBase: 1.1,
        flagshipDiveIntervalBase: 1.08,
        enemyShotIntervalBase: 1.12,
        enemyShotVy: 0.96,
        diveBaseVy: 0.96,
        diveAccel: 0.94,
        diveSideDrift: 0.9
      },
      overrides: {
        enemyShotMaxLive: 4
      }
    },
    intent: 'Reduce the most collision-heavy stage-five pressure while keeping the same basic Galaxian-style dive/shot grammar.'
  },
  {
    id: 'stage5-routeability-lane-relief-v1',
    label: 'Lane readability relief',
    patch: {
      minRank: 3,
      scales: {
        scoutDiveIntervalBase: 1.06,
        flagshipDiveIntervalBase: 1.04,
        enemyShotIntervalBase: 1.08,
        diveBaseVy: 0.94,
        diveAccel: 0.93,
        diveSideDrift: 0.82,
        diveSwayAmplitude: 0.85
      },
      overrides: {
        enemyShotMaxLive: 4
      }
    },
    intent: 'Keep pressure cadence close while reducing lateral crowding and unpredictable lower-field overlap.'
  },
  {
    id: 'stage5-routeability-shot-relief-v2',
    label: 'Shot density relief',
    patch: {
      minRank: 3,
      scales: {
        enemyShotIntervalBase: 1.22,
        enemyShotVy: 0.92,
        diveBaseVy: 0.98,
        diveAccel: 0.97
      },
      overrides: {
        enemyShotMaxLive: 4
      }
    },
    intent: 'Preserve dive movement while making stage-five bullet pressure less collision-dominated.'
  }
];

function readJson(file, fallback = {}){
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

function esc(text){
  return String(text ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
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
  const survivalShare = Math.max(0, Math.min(1, (+run.simT || 0) / duration));
  const stageSpan = Math.max(1, ((+run.maxPlayableStage || +run.stageStart || 1) - (+run.stageStart || 1)) + 1);
  const progressionShare = Math.max(0, Math.min(1, ((+run.stageAdvances || 0) + (+run.waveClears || 0)) / stageSpan));
  const lossBudgetShare = Math.max(0, Math.min(1, 1 - ((+run.playerLosses || 0) / Math.max(1, +run.ships || 3))));
  const shotResolutionShare = eventCount(run, 'player_shot_fired')
    ? Math.max(0, Math.min(1, eventCount(run, 'player_shot_resolved') / Math.max(1, eventCount(run, 'player_shot_fired'))))
    : 0;
  const collisionSafetyShare = Math.max(0, Math.min(1, 1 - collisionLossShare(run)));
  const divePressurePerMinute = eventCount(run, 'alien_dive_start') / Math.max(1, duration / 60);
  const shotPressurePerMinute = eventCount(run, 'enemy_shot') / Math.max(1, duration / 60);
  const pressureSurvivability = Math.max(0, Math.min(1, 1 - Math.max(0, ((divePressurePerMinute + (shotPressurePerMinute * 0.55)) - 42) / 52)));
  const routeability = Math.max(0, Math.min(1,
    (0.24 * survivalShare)
    + (0.18 * progressionShare)
    + (0.16 * lossBudgetShare)
    + (0.17 * collisionSafetyShare)
    + (0.12 * shotResolutionShare)
    + (0.13 * pressureSurvivability)
  ));
  return Object.assign({}, run, {
    score10: round(1 + routeability * 8.4, 1),
    components: {
      survivalShare: round(survivalShare, 3),
      progressionShare: round(progressionShare, 3),
      lossBudgetShare: round(lossBudgetShare, 3),
      collisionSafetyShare: round(collisionSafetyShare, 3),
      shotResolutionShare: round(shotResolutionShare, 3),
      pressureSurvivability: round(pressureSurvivability, 3),
      divePressurePerMinute: round(divePressurePerMinute, 2),
      shotPressurePerMinute: round(shotPressurePerMinute, 2),
      collisionLossShare: round(collisionLossShare(run), 3)
    }
  });
}

function summarizeRuns(label, runs){
  const rows = runs.map(scoreRun);
  return {
    label,
    score10: round(average(rows.map(row => row.score10)), 1),
    survivalShare: round(average(rows.map(row => row.components.survivalShare)), 3),
    collisionLossShare: round(average(rows.map(row => row.components.collisionLossShare)), 3),
    playerLosses: round(average(rows.map(row => row.playerLosses)), 2),
    waveClears: round(average(rows.map(row => row.waveClears)), 2),
    divePressurePerMinute: round(average(rows.map(row => row.components.divePressurePerMinute)), 2),
    shotPressurePerMinute: round(average(rows.map(row => row.components.shotPressurePerMinute)), 2),
    rows
  };
}

function runScenario(ctx){
  return PERSONAS.map(persona => simulatePersona(ctx, persona, {
    stage: 5,
    ships: 5,
    seed: SEEDS[persona],
    maxPlayableStage: 9,
    durationSeconds: 120
  }));
}

function compareCandidate(candidate, baselineSummary){
  const ctx = loadGuardiansVm();
  installGuardiansRuntimeRulePatch(ctx, candidate.patch);
  const candidateSummary = summarizeRuns(candidate.id, runScenario(ctx));
  const pressureRetention = baselineSummary.divePressurePerMinute + baselineSummary.shotPressurePerMinute
    ? (candidateSummary.divePressurePerMinute + candidateSummary.shotPressurePerMinute) / Math.max(0.1, baselineSummary.divePressurePerMinute + baselineSummary.shotPressurePerMinute)
    : 1;
  const routeabilityLift10 = round(candidateSummary.score10 - baselineSummary.score10, 1);
  const collisionLossDelta = round(candidateSummary.collisionLossShare - baselineSummary.collisionLossShare, 3);
  const pass = routeabilityLift10 >= 0.2
    && collisionLossDelta <= 0
    && pressureRetention >= 0.82;
  return {
    id: candidate.id,
    label: candidate.label,
    intent: candidate.intent,
    patch: candidate.patch,
    baseline: baselineSummary,
    candidate: candidateSummary,
    routeabilityLift10,
    collisionLossDelta,
    pressureRetention: round(pressureRetention, 3),
    promotionGate: {
      pass,
      requiredRouteabilityLift10: 0.2,
      maxCollisionLossDelta: 0,
      minPressureRetention: 0.82,
      read: pass
        ? 'Candidate clears the planning gate for a full browser-backed before/after review, but it still does not change runtime constants.'
        : 'Candidate does not clear enough gate evidence for runtime promotion; keep it as measurement evidence.'
    }
  };
}

function buildMarkdown(report){
  const rows = report.candidates.map(candidate => `| ${candidate.label} | ${candidate.baseline.score10}/10 | ${candidate.candidate.score10}/10 | ${candidate.routeabilityLift10}/10 | ${round(candidate.baseline.collisionLossShare * 100, 0)}% -> ${round(candidate.candidate.collisionLossShare * 100, 0)}% | ${round(candidate.pressureRetention * 100, 0)}% | ${candidate.promotionGate.pass ? 'passes planning gate' : 'blocked'} |`).join('\n');
  return `# Galaxy Guardians Routeability Before/After

Generated: ${report.createdOn}
Status: ${report.status}

## Summary

${report.summary.releaseRead}

| Candidate | Baseline Routeability | Candidate Routeability | Lift | Collision Losses | Pressure Retention | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Best Candidate

${report.summary.bestCandidateId || 'No candidate'} is the current best measured planning candidate.
${report.summary.bestCandidateRead}

This artifact is analysis-only. It does not change shipped Guardians runtime
constants.
`;
}

function svgText(text, x, y, size = 16, fill = '#eaf8ff', weight = 700){
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(text)}</text>`;
}

function bar({ x, y, width, height, value, max, fill, label }){
  const ratio = Math.max(0, Math.min(1, (+value || 0) / Math.max(0.001, +max || 1)));
  const w = Math.max(2, width * ratio);
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="7" fill="#102237" stroke="#244863"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${height}" rx="7" fill="${fill}"/>`,
    svgText(label, x + 12, y + height - 10, 13, '#06101a', 800)
  ].join('\n');
}

function writeChart(report){
  const width = 1120;
  const rowH = 96;
  const top = 118;
  const height = top + report.candidates.length * rowH + 92;
  const children = [
    `<rect width="100%" height="100%" fill="#06101a"/>`,
    svgText('Galaxy Guardians Stage 5 Routeability Before/After', 32, 42, 28, '#f2fbff', 900),
    svgText('Analysis-only candidate review: no runtime constants changed', 32, 72, 15, '#9fc8e8', 600),
    svgText('Routeability', 404, 104, 13, '#9fc8e8', 800),
    svgText('Collision Loss', 650, 104, 13, '#9fc8e8', 800),
    svgText('Pressure Retention', 854, 104, 13, '#9fc8e8', 800)
  ];
  report.candidates.forEach((candidate, index) => {
    const y = top + index * rowH;
    const passFill = candidate.promotionGate.pass ? '#8effd2' : '#ffb0a8';
    children.push(`<rect x="24" y="${y - 24}" width="${width - 48}" height="${rowH - 12}" rx="12" fill="#0b1725" stroke="#193b55"/>`);
    children.push(svgText(candidate.label, 42, y + 2, 16, '#f2fbff', 800));
    children.push(svgText(candidate.id, 42, y + 26, 12, '#9fc8e8', 600));
    children.push(svgText(candidate.promotionGate.pass ? 'planning gate pass' : 'blocked', 42, y + 52, 13, passFill, 800));
    children.push(bar({
      x: 380,
      y: y + 4,
      width: 210,
      height: 30,
      value: candidate.candidate.score10,
      max: 10,
      fill: '#8effd2',
      label: `${candidate.baseline.score10} -> ${candidate.candidate.score10}`
    }));
    children.push(bar({
      x: 626,
      y: y + 4,
      width: 156,
      height: 30,
      value: 1 - candidate.candidate.collisionLossShare,
      max: 1,
      fill: '#ffd36e',
      label: `${round(candidate.baseline.collisionLossShare * 100, 0)}% -> ${round(candidate.candidate.collisionLossShare * 100, 0)}%`
    }));
    children.push(bar({
      x: 840,
      y: y + 4,
      width: 210,
      height: 30,
      value: Math.min(1.6, candidate.pressureRetention),
      max: 1.6,
      fill: '#7bd6ff',
      label: `${round(candidate.pressureRetention * 100, 0)}%`
    }));
  });
  children.push(svgText(report.summary.bestCandidateRead, 32, height - 40, 15, '#c7dff3', 600));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  ${children.join('\n  ')}
</svg>
`;
  writeText(OUT_SVG, svg);
  return rel(OUT_SVG);
}

function main(){
  const queue = readJson(CANDIDATE_QUEUE);
  const baselineCtx = loadGuardiansVm();
  const baselineSummary = summarizeRuns('baseline-current', runScenario(baselineCtx));
  const candidates = CANDIDATES.map(candidate => compareCandidate(candidate, baselineSummary));
  const best = candidates.slice().sort((a, b) => {
    if(b.promotionGate.pass !== a.promotionGate.pass) return b.promotionGate.pass ? 1 : -1;
    return b.routeabilityLift10 - a.routeabilityLift10;
  })[0] || null;
  const report = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-routeability-before-after',
    version: '0.1',
    createdOn: new Date().toISOString(),
    status: 'analysis-only-no-runtime-change',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-routeability-before-after.js',
    sourceEvidence: {
      motionGrammarCandidateQueue: rel(CANDIDATE_QUEUE),
      topQueueCandidate: queue.summary?.topCandidateId || null
    },
    scenario: {
      stage: 5,
      stageMeaning: 'Stage-five stress routeability',
      personas: PERSONAS,
      seeds: SEEDS,
      ships: 5,
      maxPlayableStage: 9,
      durationSeconds: 120
    },
    baseline: baselineSummary,
    candidates,
    summary: {
      candidateCount: candidates.length,
      bestCandidateId: best?.id || null,
      bestCandidateRouteabilityLift10: best?.routeabilityLift10 ?? null,
      bestCandidatePass: !!best?.promotionGate?.pass,
      baselineScore10: baselineSummary.score10,
      bestCandidateScore10: best?.candidate?.score10 ?? null,
      bestCandidateRead: best
        ? `${best.label} changes stage-five routeability by ${best.routeabilityLift10}/10, collision-loss share by ${round(best.collisionLossDelta * 100, 0)} points, and retains ${round(best.pressureRetention * 100, 0)}% of measured pressure.`
        : 'No candidate was measured.',
      releaseRead: best
        ? `Measured ${candidates.length} stage-five relief candidates. ${best.label} is best so far: ${best.routeabilityLift10}/10 routeability lift, ${round(best.collisionLossDelta * 100, 0)} collision-loss point delta, ${round(best.pressureRetention * 100, 0)}% pressure retention.`
        : 'No stage-five relief candidates were measured.'
    },
    nextSteps: [
      'If a candidate passes this planning gate, create a browser-visible before/after capture for human review.',
      'Do not edit Guardians runtime constants until a candidate preserves routeability, collision safety, pressure, and visual readability.',
      'If all candidates fail, expand the candidate family toward persona aim behavior and visual threat spacing rather than only pressure scaling.'
    ]
  };
  report.media = {
    summaryChart: writeChart(report)
  };
  writeJson(OUT, report);
  writeText(OUT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    baselineScore10: report.summary.baselineScore10,
    bestCandidateId: report.summary.bestCandidateId,
    bestCandidateScore10: report.summary.bestCandidateScore10,
    bestCandidateRouteabilityLift10: report.summary.bestCandidateRouteabilityLift10,
    bestCandidatePass: report.summary.bestCandidatePass
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.stack || String(err));
  process.exit(1);
}

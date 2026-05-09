#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'alien-entry-challenge-variation');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectReports(root){
  const out = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(artifact){
  const reports = collectReports(path.join(ANALYSES, artifact));
  return reports.length ? reports[reports.length - 1] : null;
}

function familySignature(families = []){
  return families
    .filter(family => family !== 'rack-slot-settle')
    .sort()
    .join('|') || 'none';
}

function entityFamilies(window){
  return Object.keys(window.familyCounts || {})
    .filter(key => !['stage_spawn', 'player_shot', 'challenge_clear', 'unknown'].includes(key))
    .sort();
}

function scoreMetric(id, label, score10, currentRead, calculation, strategy){
  return {
    id,
    label,
    score10: round(score10, 1),
    currentRead,
    calculation,
    strategy
  };
}

function buildReport(){
  const formationPath = latestReport('formation-boss-grammar-conformance');
  const pathFamilyPath = latestReport('formation-boss-path-family-comparison');
  const stageSignaturePath = latestReport('stage-signature-distance');
  const pathSlotPath = latestReport('formation-boss-path-slot-extraction');
  if(!formationPath) throw new Error('Missing formation-boss-grammar-conformance report. Run npm run harness:analyze:formation-boss-grammar first.');

  const formation = readJson(formationPath);
  const pathFamily = pathFamilyPath ? readJson(pathFamilyPath) : { summary: {}, windows: [] };
  const stageSignature = stageSignaturePath ? readJson(stageSignaturePath) : { summary: {} };
  const pathSlot = pathSlotPath ? readJson(pathSlotPath) : { summary: {}, windows: [] };
  const formationWindows = formation.windows || [];
  const pathWindows = pathFamily.windows || [];
  const regularFormation = formationWindows.filter(window => !window.challenge);
  const challengeFormation = formationWindows.filter(window => window.challenge);
  const regularPath = pathWindows.filter(window => !window.challenge);
  const challengePath = pathWindows.filter(window => window.challenge);

  const minRegularDistance = +(stageSignature.summary?.minRegularDistance || stageSignature.summary?.closestRegularPair?.distance || 0);
  const meanRegularDistance = +(stageSignature.summary?.meanRegularDistance || 0);
  const distinctPairRatio = +(stageSignature.summary?.distinctPairRatio || 0);
  const repetitionRisk = +(stageSignature.summary?.repetitionRisk || 1);
  const regularSignatureCount = new Set(regularPath.map(window => familySignature(window.families))).size;
  const challengeSignatureCount = new Set(challengePath.map(window => familySignature(window.families))).size;
  const regularSignatureRatio = regularPath.length ? regularSignatureCount / regularPath.length : 0;
  const challengeSignatureRatio = challengePath.length ? challengeSignatureCount / Math.max(challengePath.length, 4) : 0;
  const regularEntitySets = regularFormation.map(window => entityFamilies(window).join('|'));
  const challengeEntitySets = challengeFormation.map(window => entityFamilies(window).join('|'));
  const regularEntityNoveltyRatio = regularEntitySets.length ? new Set(regularEntitySets).size / regularEntitySets.length : 0;
  const challengeEntityNoveltyRatio = challengeEntitySets.length ? new Set(challengeEntitySets).size / Math.max(challengeEntitySets.length, 4) : 0;
  const challengeCoverage = clamp(challengeFormation.length / 4);
  const challengePathCoverage = clamp(challengePath.length / 4);
  const referenceConfidence = +(pathFamily.summary?.comparisonConfidence || 0);
  const referenceCap = +(pathFamily.summary?.referenceComparisonCap10 || 0);
  const pathFamilyScore = +(pathFamily.summary?.score10 || 0);
  const directReferenceReady = referenceCap > 7.5 ? 1 : 0;

  const metrics = [
    scoreMetric(
      'regular-stage-entry-variation',
      'Regular-stage alien entry variation',
      10 * ((0.48 * clamp(minRegularDistance / 0.22)) + (0.32 * distinctPairRatio) + (0.2 * clamp(meanRegularDistance / 0.3))),
      `Minimum regular-stage distance ${round(minRegularDistance)}; mean regular distance ${round(meanRegularDistance)}; distinct-pair ratio ${round(distinctPairRatio)}.`,
      'Measures whether nearby regular stages have meaningfully different entry/rack/attack signatures instead of repeated mid-stage patterns.',
      'Increase stage-specific entry scripts and rack/formation differences, then rerun stage-signature distance and path-family comparison.'
    ),
    scoreMetric(
      'entry-path-family-specificity',
      'Entry trajectory and path-family specificity by stage',
      10 * ((0.42 * regularSignatureRatio) + (0.28 * clamp(pathFamilyScore / 10)) + (0.2 * clamp(1 - repetitionRisk)) + (0.1 * regularEntityNoveltyRatio)),
      `${regularSignatureCount}/${regularPath.length || 0} regular path-family signatures are distinct; repetition risk ${round(repetitionRisk)}; path-family score ${round(pathFamilyScore, 1)}/10.`,
      'Measures whether stages use recognizably different entry trajectories and path families, not only the same broad family names with changed pressure.',
      'Promote per-stage path family labels and add authored route variants for early/mid/late stages before retuning score targets.'
    ),
    scoreMetric(
      'challenge-trajectory-variation',
      'Challenging-stage trajectory variation',
      10 * ((0.45 * challengePathCoverage) + (0.35 * challengeSignatureRatio) + (0.2 * clamp((challengePath[0]?.familyCount || 0) / 5))),
      `${challengePath.length}/4 challenge path windows; ${challengeSignatureCount} distinct challenge path-family signatures; first challenge family count ${challengePath[0]?.familyCount || 0}.`,
      'Measures whether challenge stages introduce multiple learnable trajectory set pieces rather than one repeated challenge vocabulary.',
      'Capture and compare challenge stages across several challenge numbers, then add trajectory families for sweeps, arcs, lane waves, boss-led waves, and late-stage specialty entries.'
    ),
    scoreMetric(
      'challenge-alien-novelty',
      'Challenging-stage alien novelty and introduction',
      10 * ((0.45 * challengeCoverage) + (0.25 * challengeEntityNoveltyRatio) + (0.2 * average(challengeFormation.map(window => clamp(entityFamilies(window).length / 5)))) + (0.1 * clamp(challengeFormation.length / 6))),
      `${challengeFormation.length}/4 challenge evidence windows; challenge entity signatures ${challengeEntitySets.join(', ') || 'none'}.`,
      'Measures whether challenge stages use alien introductions and enemy composition as a teaching/reward device.',
      'Add evidence windows for successive challenge stages and score new-alien introduction, path novelty, bonus opportunity clarity, and result feedback as separate signals.'
    ),
    scoreMetric(
      'reference-grounded-path-precision',
      'Reference-grounded path precision readiness',
      10 * ((0.45 * referenceConfidence) + (0.35 * clamp(referenceCap / 10)) + (0.2 * directReferenceReady)),
      `Path comparison confidence ${round(referenceConfidence)}; current heuristic cap ${round(referenceCap, 1)}/10; path-slot extraction score ${round(pathSlot.summary?.extractionScore10, 1)}/10.`,
      'Measures whether the harness is ready to compare Aurora trajectories to frame-labeled Galaga reference paths instead of heuristic runtime families.',
      'Create Galaga reference contact sheets/path labels, then lift the heuristic cap only when direct visual path comparison exists.'
    )
  ];

  const weights = {
    'regular-stage-entry-variation': 0.25,
    'entry-path-family-specificity': 0.22,
    'challenge-trajectory-variation': 0.23,
    'challenge-alien-novelty': 0.18,
    'reference-grounded-path-precision': 0.12
  };
  const score10 = round(metrics.reduce((sum, metric) => sum + (metric.score10 * (weights[metric.id] || 0)), 0), 1);
  const weakestMetric = metrics.reduce((worst, metric) => metric.score10 < worst.score10 ? metric : worst, metrics[0]);
  const generatedAt = new Date().toISOString();
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}`);
  const report = {
    generatedAt,
    commit,
    artifactType: 'alien-entry-challenge-variation',
    score10,
    summary: {
      score10,
      confidence: 'medium',
      resolution: 'Dedicated planning scorer using stage-signature distance, runtime path-family signatures, challenge-window coverage, alien-family novelty, and reference-comparison readiness.',
      problem: 'Aurora still reads too repetitive for alien entry and challenge-stage invention: regular stages are not distinct enough, challenge-stage trajectory evidence is too sparse, and alien novelty is not yet scored against multiple reference-like challenge set pieces.',
      strategy: 'Run a long-cycle evidence pass before gameplay tuning: capture early/mid/late regular entries and several challenge stages, label alien families and path families, promote reference contact sheets, then tune stage scripts and challenge waves against the resulting gaps.',
      successMeasure: 'Raise this score above 7.5 with at least four challenge evidence windows, regular-stage minimum signature distance above 0.22, two or more distinct challenge trajectory signatures, and reference-grounded path precision readiness above 7.0.',
      weakestMetric
    },
    metrics,
    observed: {
      regularWindowCount: regularFormation.length,
      challengeWindowCount: challengeFormation.length,
      regularPathWindowCount: regularPath.length,
      challengePathWindowCount: challengePath.length,
      minRegularDistance: round(minRegularDistance),
      meanRegularDistance: round(meanRegularDistance),
      distinctPairRatio: round(distinctPairRatio),
      repetitionRisk: round(repetitionRisk),
      regularSignatureCount,
      challengeSignatureCount,
      regularEntitySignatures: [...new Set(regularEntitySets)].filter(Boolean),
      challengeEntitySignatures: [...new Set(challengeEntitySets)].filter(Boolean)
    },
    sourceReports: {
      formationBossGrammar: rel(formationPath),
      pathFamilyComparison: pathFamilyPath ? rel(pathFamilyPath) : null,
      stageSignatureDistance: stageSignaturePath ? rel(stageSignaturePath) : null,
      pathSlotExtraction: pathSlotPath ? rel(pathSlotPath) : null
    },
    longCyclePlan: [
      'Refresh runtime extraction across stage 1, 2, 4, 6, 8, 10, 12, 14 and challenge stages 3, 7, 11, 15.',
      'Generate contact sheets and path SVGs for each window, then label alien family, entry side, path family, rack target, novelty role, and bonus opportunity.',
      'Add Galaga-family reference contact sheets for regular entries and challenging stages so path precision can move from heuristic coverage to direct comparison.',
      'Rank gameplay changes by measured gap: regular-stage signature distance first, challenge trajectory family count second, alien novelty and reward clarity third.',
      'After each candidate change, rerun path-slot extraction, path-family comparison, this scorer, level-arc scoring, and quality conformance.'
    ]
  };
  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  const lines = [
    '# Alien Entry And Challenge Variation',
    '',
    'This artifact makes regular-stage alien entry variation and challenging-stage novelty a first-class conformance gap instead of hiding it inside broad level-arc or formation scores.',
    '',
    `- Score: ${score10}/10`,
    `- Confidence: ${report.summary.confidence}`,
    `- Weakest metric: ${weakestMetric.label} (${weakestMetric.score10}/10)`,
    '',
    '## Problem / Strategy / Success',
    '',
    `- Problem: ${report.summary.problem}`,
    `- Strategy: ${report.summary.strategy}`,
    `- Success: ${report.summary.successMeasure}`,
    '',
    '## Metrics',
    '',
    '| Metric | Score | Current Read | Strategy |',
    '| --- | ---: | --- | --- |'
  ];
  for(const metric of metrics){
    lines.push(`| ${metric.label} | ${metric.score10}/10 | ${metric.currentRead} | ${metric.strategy} |`);
  }
  lines.push('');
  lines.push('## Long-Cycle Plan');
  lines.push('');
  for(const step of report.longCyclePlan) lines.push(`- ${step}`);
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  return { ok: true, score10, weakestMetric: weakestMetric.id, report: rel(path.join(outDir, 'report.json')), latest: rel(path.join(OUT_ROOT, 'latest.json')) };
}

if(require.main === module){
  console.log(JSON.stringify(buildReport(), null, 2));
}

module.exports = { buildReport };

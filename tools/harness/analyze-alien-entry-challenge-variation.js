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
    .flatMap(key => String(key).split('|'))
    .map(key => key.trim())
    .filter(Boolean)
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

function meanFeature(window, key){
  return average((window.classifications || [])
    .map(item => +(item.features?.[key] ?? NaN))
    .filter(Number.isFinite));
}

function geometryVector(window){
  return [
    clamp(meanFeature(window, 'xRange') / 280),
    clamp(meanFeature(window, 'yRange') / 430),
    clamp(meanFeature(window, 'pathLength') / 1250),
    clamp(meanFeature(window, 'turnCount') / 14),
    clamp(meanFeature(window, 'reversalCount') / 10),
    clamp(meanFeature(window, 'lowerFieldShare'))
  ];
}

function geometryVectorObject(window){
  return {
    xRange: round(meanFeature(window, 'xRange')),
    yRange: round(meanFeature(window, 'yRange')),
    pathLength: round(meanFeature(window, 'pathLength')),
    turnCount: round(meanFeature(window, 'turnCount')),
    reversalCount: round(meanFeature(window, 'reversalCount')),
    lowerFieldShare: round(meanFeature(window, 'lowerFieldShare'))
  };
}

function vectorDistance(a, b){
  const av = geometryVector(a);
  const bv = geometryVector(b);
  const sum = av.reduce((total, value, index) => total + ((value - bv[index]) ** 2), 0);
  return Math.sqrt(sum / Math.max(av.length, 1));
}

function geometryPairs(windows){
  const pairs = [];
  for(let i = 0; i < windows.length; i += 1){
    for(let j = i + 1; j < windows.length; j += 1){
      pairs.push({
        a: windows[i].windowId,
        b: windows[j].windowId,
        distance: round(vectorDistance(windows[i], windows[j]))
      });
    }
  }
  return pairs.sort((a, b) => a.distance - b.distance || a.a.localeCompare(b.a) || a.b.localeCompare(b.b));
}

function geometryPairDetails(pair, windows){
  if(!pair) return null;
  const a = windows.find(window => window.windowId === pair.a);
  const b = windows.find(window => window.windowId === pair.b);
  if(!a || !b) return pair;
  const aVector = geometryVectorObject(a);
  const bVector = geometryVectorObject(b);
  const delta = Object.fromEntries(Object.keys(aVector).map(key => [key, round((bVector[key] || 0) - (aVector[key] || 0))]));
  return Object.assign({}, pair, { aVector, bVector, delta });
}

function buildReport(){
  const formationPath = latestReport('formation-boss-grammar-conformance');
  const pathFamilyPath = latestReport('formation-boss-path-family-comparison');
  const stageSignaturePath = latestReport('stage-signature-distance');
  const pathSlotPath = latestReport('formation-boss-path-slot-extraction');
  const referenceLabelPath = latestReport('galaga-path-reference-labels');
  if(!formationPath) throw new Error('Missing formation-boss-grammar-conformance report. Run npm run harness:analyze:formation-boss-grammar first.');

  const formation = readJson(formationPath);
  const pathFamily = pathFamilyPath ? readJson(pathFamilyPath) : { summary: {}, windows: [] };
  const stageSignature = stageSignaturePath ? readJson(stageSignaturePath) : { summary: {} };
  const pathSlot = pathSlotPath ? readJson(pathSlotPath) : { summary: {}, windows: [] };
  const referenceLabels = referenceLabelPath ? readJson(referenceLabelPath) : { summary: {} };
  const formationWindows = formation.windows || [];
  const pathWindows = pathFamily.windows || [];
  const regularFormation = formationWindows.filter(window => !window.challenge);
  const challengeFormation = formationWindows.filter(window => window.challenge);
  const regularPath = pathWindows.filter(window => !window.challenge);
  const challengePath = pathWindows.filter(window => window.challenge);

	  const minRegularDistance = +(stageSignature.summary?.minRegularDistance || stageSignature.summary?.closestRegularPair?.distance || 0);
	  const meanRegularDistance = +(stageSignature.summary?.meanRegularDistance || 0);
	  const distinctPairRatio = +(stageSignature.summary?.distinctPairRatio || 0);
	  const repetitionRisk = clamp(1 - (minRegularDistance / 0.22));
  const regularSignatureCount = new Set(regularPath.map(window => familySignature(window.families))).size;
  const challengeSignatureCount = new Set(challengePath.map(window => familySignature(window.families))).size;
  const regularSignatureRatio = regularPath.length ? regularSignatureCount / regularPath.length : 0;
  const challengeSignatureRatio = challengePath.length ? challengeSignatureCount / Math.max(challengePath.length, 4) : 0;
  const regularGeometryPairs = geometryPairs(regularPath);
  const challengeGeometryPairs = geometryPairs(challengePath);
  const minRegularGeometryDistance = regularGeometryPairs[0]?.distance || 0;
  const meanRegularGeometryDistance = average(regularGeometryPairs.map(pair => pair.distance));
  const minChallengeGeometryDistance = challengeGeometryPairs[0]?.distance || 0;
  const meanChallengeGeometryDistance = average(challengeGeometryPairs.map(pair => pair.distance));
  const regularEntitySets = regularFormation.map(window => entityFamilies(window).join('|'));
  const challengeEntitySets = challengeFormation.map(window => entityFamilies(window).join('|'));
  const regularEntityNoveltyRatio = regularEntitySets.length ? new Set(regularEntitySets).size / regularEntitySets.length : 0;
  const challengeEntityNoveltyRatio = challengeEntitySets.length ? new Set(challengeEntitySets).size / Math.max(challengeEntitySets.length, 4) : 0;
  const challengeCoverage = clamp(challengeFormation.length / 4);
  const challengePathCoverage = clamp(challengePath.length / 4);
  const referenceConfidence = +(pathFamily.summary?.comparisonConfidence || 0);
  const referenceCap = +(pathFamily.summary?.referenceComparisonCap10 || 0);
  const referenceCapReason = pathFamily.summary?.referenceComparisonCapReason || null;
  const labelBackedComparisonReady = !!pathFamily.summary?.referenceLabelSupport?.labelBackedComparisonReady;
  const pathFamilyScore = +(pathFamily.summary?.score10 || 0);
  const acceptedRegularLabels = +(referenceLabels.summary?.acceptedRegularEntryCount || 0);
  const acceptedChallengeLabels = +(referenceLabels.summary?.acceptedChallengeEntryCount || 0);
  const labelCoverageScore = +(referenceLabels.summary?.coverageScore10 || 0);
  const labelDirectReady = referenceLabels.summary?.directReferenceReady ? 1 : 0;
  const directReferenceReady = referenceCap > 7.5 && labelDirectReady ? 1 : 0;
  const challengeArrivalRuntimeScore = 10 * (
    (0.28 * challengePathCoverage)
    + (0.26 * clamp(average(challengePath.map(window => meanFeature(window, 'xRange'))) / 165))
    + (0.22 * clamp(average(challengePath.map(window => meanFeature(window, 'pathLength'))) / 950))
    + (0.14 * clamp(average(challengePath.map(window => meanFeature(window, 'turnCount'))) / 8))
    + (0.1 * clamp(meanChallengeGeometryDistance / 0.18))
  );
  const challengeReferenceCap = directReferenceReady ? 10 : 6.8;
  const challengePatternDepthRaw = 10 * (
    (0.24 * challengePathCoverage)
    + (0.24 * clamp(challengeSignatureCount / 5))
    + (0.18 * challengeEntityNoveltyRatio)
    + (0.18 * average(challengeFormation.map(window => clamp(entityFamilies(window).length / 5))))
    + (0.16 * clamp(meanChallengeGeometryDistance / 0.18))
  );

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
      'regular-entry-geometry-separation',
      'Regular-entry geometry separation',
      10 * ((0.55 * clamp(minRegularGeometryDistance / 0.14)) + (0.45 * clamp(meanRegularGeometryDistance / 0.22))),
      `Minimum regular geometry distance ${round(minRegularGeometryDistance)}; mean regular geometry distance ${round(meanRegularGeometryDistance)}; closest pair ${regularGeometryPairs[0] ? `${regularGeometryPairs[0].a} / ${regularGeometryPairs[0].b}` : 'n/a'}.`,
      'Measures whether regular stages differ in actual trajectory geometry, using mean x/y range, path length, turns, reversals, and lower-field share instead of accepting a path-family label alone.',
      'Tune the weakest close pair with a visibly different entry route, then rerun path-slot extraction and this scorer.'
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
      'challenge-arrival-vs-appearance',
      'Challenging-stage arrival versus appearance',
      Math.min(challengeArrivalRuntimeScore, challengeReferenceCap),
      `Runtime arrival evidence score ${round(challengeArrivalRuntimeScore, 1)}/10; reference cap ${round(challengeReferenceCap, 1)}/10; challenge geometry mean distance ${round(meanChallengeGeometryDistance)}.`,
      'Measures whether challenge-stage aliens visibly arrive through readable paths rather than feeling like they simply appear in place. This is capped until contact-sheet or frame-labeled Galaga challenge references prove the arrival grammar.',
      'Add challenge-stage contact sheets with first-visible, entry-side, path-commit, target-group, and exit labels; then tune challenge spawns and paths against the weakest arrival/readability delta.'
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
      'challenge-pattern-novelty-depth',
      'Challenging-stage pattern novelty depth',
      Math.min(challengePatternDepthRaw, directReferenceReady ? 10 : 7.2),
      `Pattern-depth raw score ${round(challengePatternDepthRaw, 1)}/10; ${challengeSignatureCount} challenge path signatures; challenge entity novelty ratio ${round(challengeEntityNoveltyRatio)}.`,
      'Measures whether later challenge stages create genuinely new learnable set pieces by combining path family, alien composition, group timing, and bonus opportunity instead of reskinning the same wave.',
      'Split challenge stages into named pattern contracts, then run long-cycle persona and path extraction to verify each challenge stage teaches a distinct bonus-stage skill.'
    ),
    scoreMetric(
      'reference-grounded-path-precision',
      'Reference-grounded path precision readiness',
      labelCoverageScore > 0
        ? 10 * ((0.36 * referenceConfidence) + (0.28 * clamp(referenceCap / 10)) + (0.24 * clamp(labelCoverageScore / 10)) + (0.12 * directReferenceReady))
        : 10 * ((0.45 * referenceConfidence) + (0.35 * clamp(referenceCap / 10)) + (0.2 * (referenceCap > 7.5 ? 1 : 0))),
      `Path comparison confidence ${round(referenceConfidence)}; accepted reference labels ${acceptedRegularLabels} regular / ${acceptedChallengeLabels} challenge; label coverage ${round(labelCoverageScore, 1)}/10; current cap ${round(referenceCap, 1)}/10 (${referenceCapReason || 'unknown'}); path-slot extraction score ${round(pathSlot.summary?.extractionScore10, 1)}/10.`,
      'Measures whether the harness is ready to compare Aurora trajectories to frame-labeled Galaga reference paths instead of heuristic runtime families.',
      labelBackedComparisonReady
        ? 'Move from media-backed path-family labels to tracked reference trajectories and rack-slot coordinate comparison before making gameplay changes against this metric.'
        : 'Create and validate Galaga reference contact sheets/path labels, then lift the heuristic cap only when accepted regular and challenge labels pass the direct-reference gate.'
    )
  ];

  const weights = {
    'regular-stage-entry-variation': 0.16,
    'entry-path-family-specificity': 0.14,
    'regular-entry-geometry-separation': 0.15,
    'challenge-trajectory-variation': 0.13,
    'challenge-arrival-vs-appearance': 0.14,
    'challenge-alien-novelty': 0.12,
    'challenge-pattern-novelty-depth': 0.11,
    'reference-grounded-path-precision': 0.05
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
      problem: 'Aurora still reads too repetitive for alien entry and challenge-stage invention: regular stages are not distinct enough, challenge stages need stronger arrival-versus-appearance evidence, and alien novelty is not yet scored against multiple reference-like challenge set pieces.',
      strategy: 'Run a long-cycle evidence pass before gameplay tuning: capture early/mid/late regular entries and several challenge stages, label first-visible arrival, alien families, path families, target groups, exits, and bonus opportunities, promote reference contact sheets, then tune stage scripts and challenge waves against the resulting gaps.',
      successMeasure: 'Raise this score above 7.5 with at least four challenge evidence windows, regular-stage minimum signature distance above 0.22, two or more distinct challenge trajectory signatures, challenge arrival/readability above 7.2, and reference-grounded path precision readiness above 7.0.',
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
      minRegularGeometryDistance: round(minRegularGeometryDistance),
      meanRegularGeometryDistance: round(meanRegularGeometryDistance),
      closestRegularGeometryPair: geometryPairDetails(regularGeometryPairs[0], regularPath),
      minChallengeGeometryDistance: round(minChallengeGeometryDistance),
      meanChallengeGeometryDistance: round(meanChallengeGeometryDistance),
      closestChallengeGeometryPair: geometryPairDetails(challengeGeometryPairs[0], challengePath),
      distinctPairRatio: round(distinctPairRatio),
      repetitionRisk: round(repetitionRisk),
      regularSignatureCount,
      challengeSignatureCount,
      regularEntitySignatures: [...new Set(regularEntitySets)].filter(Boolean),
      challengeEntitySignatures: [...new Set(challengeEntitySets)].filter(Boolean),
      acceptedReferenceLabelCounts: {
        regularEntry: acceptedRegularLabels,
        challengeEntry: acceptedChallengeLabels,
        coverageScore10: round(labelCoverageScore, 1),
        directReferenceReady: !!labelDirectReady,
        labelBackedComparisonReady,
        referenceCapReason
      }
    },
    sourceReports: {
      formationBossGrammar: rel(formationPath),
      pathFamilyComparison: pathFamilyPath ? rel(pathFamilyPath) : null,
      stageSignatureDistance: stageSignaturePath ? rel(stageSignaturePath) : null,
      pathSlotExtraction: pathSlotPath ? rel(pathSlotPath) : null,
      galagaPathReferenceLabels: referenceLabelPath ? rel(referenceLabelPath) : null
    },
    longCyclePlan: [
      'Refresh runtime extraction across stage 1, 2, 4, 6, 8, 10, 12, 14 and challenge stages 3, 7, 11, 15.',
      'Generate contact sheets and path SVGs for each window, then label alien family, first visible frame, entry side, arrival path, target group, exit path, rack target, novelty role, and bonus opportunity.',
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

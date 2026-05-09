#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'level-arc-conformance');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2){
  return +value.toFixed(digits);
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectFiles(root, targetName){
  const fullRoot = path.join(ROOT, root);
  if(!fs.existsSync(fullRoot)) return [];
  const found = [];
  function walk(dir){
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === targetName) found.push(full);
    }
  }
  walk(fullRoot);
  return found.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(dir){
  const found = collectFiles(dir, 'report.json');
  return found.length ? found[found.length - 1] : null;
}

function scoreParts(parts){
  return round(clamp(parts.reduce((sum, part) => sum + (part.weight * clamp(part.value)), 0)) * 10, 1);
}

function fileExists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function countEvidenceWindows(){
  const root = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-level-expansion-cycle');
  if(!fs.existsSync(root)) return 0;
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => fs.existsSync(path.join(root, entry.name, 'source-manifest.json')))
    .length;
}

function countStageFamilies(planText){
  const match = planText.match(/### Stage Family Map([\s\S]*?)### Challenge Stage Model/);
  if(!match) return 0;
  return (match[1].match(/^- /gm) || []).length;
}

function countChallengeLayers(planText){
  const match = planText.match(/### Challenge Stage Model([\s\S]*?)### Later-Level Variation Model/);
  if(!match) return 0;
  return (match[1].match(/^- (visual identity|movement identity|result identity):/gm) || []).length;
}

function main(){
  ensureDir(OUT_ROOT);

  const planPath = path.join(ROOT, 'LEVEL_BY_LEVEL_EXPANSION_PLAN.md');
  const planText = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : '';
  const stageFamilyBlueprintCount = countStageFamilies(planText);
  const challengeLayerBlueprintCount = countChallengeLayers(planText);
  const evidenceWindowCount = countEvidenceWindows();

  const challengeReportPath = latestReport('reference-artifacts/analyses/correspondence/challenge-stage-timing');
  const progressionReportPath = latestReport('reference-artifacts/analyses/correspondence/persona-progression');
  const captureReportPath = latestReport('reference-artifacts/analyses/correspondence/capture-rescue');
  const pressureGeometryPath = latestReport('reference-artifacts/analyses/aurora-stage4-pressure-geometry');
  const pressureLossPath = latestReport('reference-artifacts/analyses/aurora-stage4-loss-windows');
  const stageSignaturePath = latestReport('reference-artifacts/analyses/stage-signature-distance');
  const opportunityPath = latestReport('reference-artifacts/analyses/level-arc-opportunity-windows');
  const formationBossPath = latestReport('reference-artifacts/analyses/formation-boss-grammar-conformance');

  const challenge = challengeReportPath ? readJson(challengeReportPath) : { summary: {} };
  const progression = progressionReportPath ? readJson(progressionReportPath) : { summary: {} };
  const capture = captureReportPath ? readJson(captureReportPath) : { summary: {} };
  const pressureGeometry = pressureGeometryPath ? readJson(pressureGeometryPath) : { summary: {} };
  const pressureLoss = pressureLossPath ? readJson(pressureLossPath) : { summary: {} };
  const stageSignature = stageSignaturePath ? readJson(stageSignaturePath) : { summary: {} };
  const opportunity = opportunityPath ? readJson(opportunityPath) : { summary: {}, opportunities: [] };
  const formationBoss = formationBossPath ? readJson(formationBossPath) : { summary: {}, metrics: [] };

  const challengeTiming = challenge.summary.total ? challenge.summary.passed / challenge.summary.total : 0;
  const progressionChecks = progression.summary.totalPersonaChecks
    ? progression.summary.passedPersonaChecks / progression.summary.totalPersonaChecks
    : 0;
  const progressionOrdering = progression.summary.currentProgressionOrderPreserved ? 1 : 0.6;
  const captureCoverage = capture.summary.total ? capture.summary.passed / capture.summary.total : 0;
  const pressureGeometryCoverage = pressureGeometry.summary.expectedTargetWindows
    ? pressureGeometry.summary.sampledWindows / pressureGeometry.summary.expectedTargetWindows
    : 0;
  const pressureSourceCoverage = pressureLoss.summary.totalWindows
    ? pressureLoss.summary.sourceWindowsFound / pressureLoss.summary.totalWindows
    : 0;
  const pressureReplayCoverage = pressureLoss.summary.sourceWindowsFound
    ? pressureLoss.summary.replayReproducedWindows / pressureLoss.summary.sourceWindowsFound
    : 0;
  const pressureCollisionReplayCoverage = pressureLoss.summary.sourceWindowsFound
    ? (pressureLoss.summary.pressureCollisionReproducedWindows || 0) / pressureLoss.summary.sourceWindowsFound
    : 0;
  const stageSignatureScore = (stageSignature.summary.signatureScore10 || 0) / 10;
  const stageSignatureDistinctPairRatio = stageSignature.summary.distinctPairRatio || 0;
  const stageSignatureRepetitionSafety = 1 - (stageSignature.summary.repetitionRisk || 1);
  const opportunityMeanReward = clamp((opportunity.summary.meanRewardIndex || 0) / 10);
  const opportunityReadiness = clamp((opportunity.summary.score10 || 0) / 10);
  const formationBossScore = clamp((formationBoss.summary.score10 || formationBoss.score10 || 0) / 10);
  const topOpportunity = opportunity.summary.highestPriorityOpportunity || opportunity.opportunities?.[0] || null;

  const submetrics = [
    {
      id: 'stage-distinctiveness',
      label: 'Stage distinctiveness',
      score10: scoreParts([
        { value: stageFamilyBlueprintCount / 6, weight: 0.35 },
        { value: evidenceWindowCount / 6, weight: 0.35 },
        { value: stageSignatureDistinctPairRatio, weight: 0.3 }
      ]),
      read: `${stageFamilyBlueprintCount}/6 stage families are blueprinted and ${evidenceWindowCount}/6 target evidence windows are present; stage-signature distinct pair ratio is ${stageSignature.summary.distinctPairRatio || 0}.`
    },
    {
      id: 'challenge-stage-identity',
      label: 'Challenge-stage identity',
      score10: scoreParts([
        { value: challengeTiming, weight: 0.25 },
        { value: challengeLayerBlueprintCount / 3, weight: 0.25 },
        { value: fileExists('reference-artifacts/analyses/aurora-galaga-long-cycle/challenge-stage-safety-2026-05-06.json') ? 1 : 0, weight: 0.2 },
        { value: Math.max(0.45, opportunityReadiness), weight: 0.3 }
      ]),
      read: `${challenge.summary?.passed || 0}/${challenge.summary?.total || 0} challenge timing checks pass and ${challengeLayerBlueprintCount}/3 content layers are blueprinted; opportunity-window readiness is ${opportunity.summary.score10 || 0}/10.`
    },
    {
      id: 'movement-grammar-expansion',
      label: 'Movement grammar expansion',
      score10: scoreParts([
        { value: evidenceWindowCount / 6, weight: 0.35 },
        { value: stageFamilyBlueprintCount / 6, weight: 0.25 },
        { value: stageSignatureScore, weight: 0.4 }
      ]),
      read: `Later-level entry, escort, regrouping, and challenge-path grammar is planned; the stage-signature distance score is ${stageSignature.summary.signatureScore10 || 0}/10.`
    },
    {
      id: 'pressure-curve-over-time',
      label: 'Pressure curve over time',
      score10: scoreParts([
        { value: pressureGeometryCoverage, weight: 0.35 },
        { value: pressureSourceCoverage, weight: 0.25 },
        { value: pressureReplayCoverage, weight: 0.25 },
        { value: evidenceWindowCount / 6, weight: 0.15 }
      ]),
      read: `${pressureLoss.summary?.sourceWindowsFound || 0}/${pressureLoss.summary?.totalWindows || 0} source pressure/loss windows are found, but ${pressureLoss.summary?.replayReproducedWindows || 0} reproduce as exact losses under replay.`
        + ` Pressure-collision replay diagnostics classify ${pressureLoss.summary?.pressureCollisionReproducedWindows || 0} as same-window or exact collision pressure.`
    },
    {
      id: 'boss-reward-opportunity',
      label: 'Boss and reward opportunity design',
      score10: scoreParts([
        { value: captureCoverage, weight: 0.45 },
        { value: Math.max(0.45, opportunityMeanReward), weight: 0.35 },
        { value: challengeLayerBlueprintCount / 3, weight: 0.2 }
      ]),
      read: `${capture.summary?.passed || 0}/${capture.summary?.total || 0} capture/rescue scenarios match; level-arc opportunity windows show mean reward/opportunity signal ${opportunity.summary.meanRewardIndex || 0}/10.`
    },
    {
      id: 'boss-entry-formation-grammar',
      label: 'Boss entry and formation grammar',
      score10: scoreParts([
        { value: formationBossScore, weight: 0.7 },
        { value: stageSignatureScore, weight: 0.15 },
        { value: opportunityReadiness, weight: 0.15 }
      ]),
      read: formationBossPath
        ? `Boss/formation grammar scores ${formationBoss.summary.score10 || formationBoss.score10}/10; weakest metric is ${formationBoss.summary.weakestMetric?.label || 'not reported'} (${formationBoss.summary.weakestMetric?.score10 ?? 'n/a'}/10).`
        : 'Boss/formation grammar has not been measured yet; run npm run harness:analyze:formation-boss-grammar.'
    },
    {
      id: 'learning-mastery-windows',
      label: 'Learning and mastery windows',
      score10: scoreParts([
        { value: progressionChecks, weight: 0.45 },
        { value: progressionOrdering, weight: 0.25 },
        { value: challengeLayerBlueprintCount / 3, weight: 0.15 },
        { value: evidenceWindowCount / 6, weight: 0.15 }
      ]),
      read: `${progression.summary?.passedPersonaChecks || 0}/${progression.summary?.totalPersonaChecks || 0} persona checks pass; progression ordering is ${progression.summary?.currentProgressionOrderPreserved ? 'preserved' : 'not fully preserved'}.`
    },
    {
      id: 'long-run-non-repetition',
      label: 'Long-run non-repetition',
      score10: scoreParts([
        { value: stageFamilyBlueprintCount / 6, weight: 0.35 },
        { value: evidenceWindowCount / 6, weight: 0.25 },
        { value: stageSignatureRepetitionSafety, weight: 0.4 }
      ]),
      read: `Stage-signature repetition risk is ${stageSignature.summary.repetitionRisk || 0}; closest pair is ${stageSignature.summary.closestPair ? `${stageSignature.summary.closestPair.a} / ${stageSignature.summary.closestPair.b}` : 'not measured'}.`
    }
  ];

  const weights = {
    'stage-distinctiveness': 0.16,
    'challenge-stage-identity': 0.14,
    'movement-grammar-expansion': 0.12,
    'pressure-curve-over-time': 0.12,
    'boss-reward-opportunity': 0.1,
    'boss-entry-formation-grammar': 0.14,
    'learning-mastery-windows': 0.12,
    'long-run-non-repetition': 0.1
  };
  const score10 = round(submetrics.reduce((sum, metric) => sum + (metric.score10 * weights[metric.id]), 0), 1);
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);

  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    score10,
    summary: {
      score10,
      stageFamilyBlueprintCount,
      challengeLayerBlueprintCount,
      evidenceWindowCount,
      pressureReplayCoverage: round(pressureReplayCoverage, 3),
      pressureCollisionReplayCoverage: round(pressureCollisionReplayCoverage, 3),
      formationBossGrammarScore10: formationBoss.summary?.score10 || formationBoss.score10 || null,
      formationBossGrammarWindowCount: formationBoss.summary?.windowCount || 0,
      priority: 'high',
      strongestSubmetric: submetrics.reduce((best, metric) => metric.score10 > best.score10 ? metric : best, submetrics[0]),
      weakestSubmetric: submetrics.reduce((worst, metric) => metric.score10 < worst.score10 ? metric : worst, submetrics[0]),
      nextRecommendedWork: [
        pressureReplayCoverage < 1
          ? 'improve Stage 4 pressure replay precision so source loss windows reproduce as exact deterministic windows'
          : 'keep pressure replay exactness as a release guardrail while expanding later-stage variation',
        stageSignature.summary?.signatureScore10 >= 6.4
          ? 'preserve stage-8 flank and stage-14 escort grammar while adding the next measured challenge/reward slice'
          : 'implement one mid-run or later-level variation and require improved regular-stage signature separation',
        formationBoss.summary?.weakestMetric
          ? `advance boss/formation grammar by targeting ${formationBoss.summary.weakestMetric.label}: ${formationBoss.summary.weakestMetric.currentRead}`
          : 'run formation/boss grammar scoring so boss entry and set-formation work is no longer hidden inside broad level-arc scoring',
        topOpportunity
          ? `${topOpportunity.problem} Strategy: ${topOpportunity.strategy}`
          : 'run level-arc opportunity windows so the next gameplay slice is ranked from evidence',
        'implement one challenge-stage movement and reward slice with clear perfect/near-perfect feedback'
      ]
    },
    evidence: {
      levelExpansionPlan: 'LEVEL_BY_LEVEL_EXPANSION_PLAN.md',
      challengeReport: challengeReportPath ? path.relative(ROOT, challengeReportPath) : null,
      progressionReport: progressionReportPath ? path.relative(ROOT, progressionReportPath) : null,
      captureReport: captureReportPath ? path.relative(ROOT, captureReportPath) : null,
      pressureGeometryReport: pressureGeometryPath ? path.relative(ROOT, pressureGeometryPath) : null,
      pressureLossReport: pressureLossPath ? path.relative(ROOT, pressureLossPath) : null,
      stageSignatureReport: stageSignaturePath ? path.relative(ROOT, stageSignaturePath) : null,
      opportunityReport: opportunityPath ? path.relative(ROOT, opportunityPath) : null,
      formationBossGrammarReport: formationBossPath ? path.relative(ROOT, formationBossPath) : null,
      levelExpansionCycle: 'reference-artifacts/analyses/aurora-level-expansion-cycle'
    },
    submetrics
  };

  writeJson(path.join(outDir, 'report.json'), report);
  const lines = [
    '# Level Arc And Encounter Shape Conformance',
    '',
    'This artifact scores whether Aurora changes shape over a long run in a Galaga-like way, instead of merely repeating a strong early-stage loop.',
    '',
    `- Score: ${score10}/10`,
    `- Priority: ${report.summary.priority}`,
    `- Stage families blueprinted: ${stageFamilyBlueprintCount}/6`,
    `- Challenge-stage content layers blueprinted: ${challengeLayerBlueprintCount}/3`,
    `- Evidence windows present: ${evidenceWindowCount}/6`,
    `- Strongest submetric: ${report.summary.strongestSubmetric.label} (${report.summary.strongestSubmetric.score10}/10)`,
    `- Weakest submetric: ${report.summary.weakestSubmetric.label} (${report.summary.weakestSubmetric.score10}/10)`,
    '',
    '## Submetrics',
    ''
  ];
  for(const metric of submetrics){
    lines.push(`### ${metric.label}`);
    lines.push(`- Score: ${metric.score10}/10`);
    lines.push(`- Read: ${metric.read}`);
    lines.push('');
  }
  lines.push('## Next Recommended Work');
  lines.push('');
  for(const item of report.summary.nextRecommendedWork){
    lines.push(`- ${item}`);
  }
  lines.push('');
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  console.log(JSON.stringify({ ok: true, outDir, score10 }, null, 2));
}

main();

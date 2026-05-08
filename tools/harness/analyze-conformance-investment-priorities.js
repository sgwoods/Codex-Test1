#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'conformance-investment-priorities');
const LEDGER = path.join(ANALYSES, 'conformance-economics', 'run-ledger.jsonl');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
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

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function walkReports(dir){
  const out = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(dir);
  return out.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(artifact){
  const reports = walkReports(path.join(ANALYSES, artifact));
  return reports.length ? reports[reports.length - 1] : null;
}

function loadLedger(){
  if(!fs.existsSync(LEDGER)) return [];
  return fs.readFileSync(LEDGER, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map(line => {
      try{ return JSON.parse(line); }
      catch{ return null; }
    })
    .filter(Boolean);
}

function secondsForAxis(ledger, axis){
  const runs = ledger.filter(entry => (entry.axes || []).includes(axis));
  const wallSeconds = runs.reduce((sum, entry) => sum + (+entry.measurement?.wallSeconds || 0), 0);
  const cpuSeconds = runs.reduce((sum, entry) => sum + (+entry.measurement?.cpuSeconds || 0), 0);
  return { runs: runs.length, wallSeconds: round(wallSeconds), cpuSeconds: round(cpuSeconds) };
}

function categoryById(quality, id){
  return (quality.categories || []).find(category => category.id === id) || { id, label: id, score10: 0 };
}

function buildCandidate({ id, label, category, quality, economics, expectedLift10, confidence, reuse, risk, costClass, computeAxis, rationale, nextAction }){
  const categoryCount = Math.max((quality.categories || []).length, 1);
  const categoryWeight = 1 / categoryCount;
  const score10 = +category.score10 || 0;
  const gap10 = Math.max(0, 10 - score10);
  const compute = computeAxis ? secondsForAxis(economics, computeAxis) : { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
  const costPenalty = ({ low: 0.72, medium: 1, high: 1.35, veryHigh: 1.7 })[costClass] || 1;
  const expectedOverallLift10 = expectedLift10 * categoryWeight;
  const valueScore = expectedOverallLift10 * (0.55 + 0.45 * clamp(gap10 / 4));
  const readinessScore = (0.45 * confidence) + (0.35 * reuse) + (0.2 * (1 - risk));
  const investmentScore = round(100 * valueScore * readinessScore / costPenalty, 2);
  return {
    id,
    label,
    category: {
      id: category.id,
      label: category.label,
      score10,
      gap10: round(gap10, 1),
      equalOverallWeight: round(categoryWeight, 3)
    },
    expectedLift10,
    expectedOverallLift10: round(expectedOverallLift10, 3),
    confidence,
    reuse,
    risk,
    costClass,
    investmentScore,
    measuredComputeHistory: compute,
    rationale,
    nextAction
  };
}

function buildReadme(report){
  const lines = [
    '# Conformance Investment Priorities',
    '',
    'This artifact ranks candidate work by expected contribution to the overall quality/conformance score, current gap size, measurement confidence, platform reuse, risk, and expected compute cost.',
    '',
    `- Overall score: ${report.summary.overallScore10}/10`,
    `- Top candidate: ${report.summary.topCandidate?.label || 'none'}`,
    `- Top investment score: ${report.summary.topCandidate?.investmentScore || 0}`,
    '',
    '## Selection Criteria',
    '',
    '- Overall-score leverage: equal category weight multiplied by expected category lift.',
    '- Gap urgency: lower current category scores get more priority.',
    '- Confidence: prefer candidates with frozen harnesses and clear pass/fail metrics.',
    '- Reuse: prefer work that improves ingestion/platform logic as well as gameplay.',
    '- Risk/cost: discount broad, fragile, or expensive cycles until their evaluators are tighter.',
    '',
    '## Ranked Candidates',
    '',
    '| Rank | Candidate | Category | Gap | Expected Overall Lift | Score | Next Action |',
    '| ---: | --- | --- | ---: | ---: | ---: | --- |'
  ];
  report.candidates.forEach((candidate, index) => {
    lines.push(`| ${index + 1} | ${candidate.label} | ${candidate.category.id} | ${candidate.category.gap10} | ${candidate.expectedOverallLift10} | ${candidate.investmentScore} | ${candidate.nextAction} |`);
  });
  lines.push('');
  lines.push('## Interpretation');
  lines.push('');
  lines.push(report.interpretation);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const qualityPath = latestReport('quality-conformance');
  if(!qualityPath) throw new Error('Missing quality-conformance report; run npm run harness:score:quality-conformance first.');
  const opportunityPath = latestReport('level-arc-opportunity-windows');
  const stage14SweepPath = latestReport('stage14-escort-reward-input-sweep');
  const economicsPath = latestReport('conformance-economics');
  const quality = readJson(qualityPath);
  const opportunity = opportunityPath ? readJson(opportunityPath) : { summary: {} };
  const stage14Sweep = stage14SweepPath ? readJson(stage14SweepPath) : { summary: {} };
  const ledger = loadLedger();
  const stage14SpecialRoutes = stage14Sweep.summary?.specialBonusCandidates || 0;
  const nextOpportunityId = opportunity.summary?.highestPriorityOpportunity?.id || 'missing level-arc opportunity coverage';

  const audio = categoryById(quality, 'audio');
  const levelArc = categoryById(quality, 'level-arc');
  const stage1Timing = categoryById(quality, 'stage1-timing');
  const uiShell = categoryById(quality, 'ui-shell');
  const candidates = [
    buildCandidate({
      id: 'audio-reference-segmentation',
      label: 'Tighten audio reference segmentation and cue matching',
      category: audio,
      quality,
      economics: ledger,
      expectedLift10: 0.7,
      confidence: 0.72,
      reuse: 0.9,
      risk: 0.28,
      costClass: 'high',
      computeAxis: 'quality-score',
      rationale: 'Audio is the weakest quality category. The semantic event-gap scorer now shows coverage is strong, while shared shot/impact/explosion mappings remain the next clarity gap.',
      nextAction: 'Split or further label shared shot/impact/explosion reference mappings, especially playerShot/enemyShot/bossHit and enemyHit/enemyBoom, then rerun audio comparison and semantic event-gap analysis.'
    }),
    buildCandidate({
      id: 'level-arc-opportunity-coverage',
      label: 'Tighten level-arc opportunity coverage and late reward reads',
      category: levelArc,
      quality,
      economics: ledger,
      expectedLift10: 0.24,
      confidence: 0.86,
      reuse: 0.95,
      risk: 0.18,
      costClass: 'low',
      computeAxis: 'conformance-loop',
      rationale: stage14SpecialRoutes
        ? `The Stage 12 and Stage 14 learned reward routes are now credited; the Stage 14 sweep found ${stage14SpecialRoutes} natural special-bonus routes, opportunity readiness is ${opportunity.summary?.score10 || 0}/10, and the next gap is ${nextOpportunityId}.`
        : `The Stage 12 learned reward route is now credited; opportunity readiness is ${opportunity.summary?.score10 || 0}/10, and the next gaps are ${nextOpportunityId} plus late reward thinness outside the Stage 12 route.`,
      nextAction: stage14SpecialRoutes
        ? 'Promote mid-run pressure event coverage by widening the Stage 6 evidence window for flank-dive and wave-clear semantics before changing gameplay tuning.'
        : 'Widen mid-run/late-run evidence coverage and add a Stage 14 reward-route probe before changing gameplay tuning.'
    }),
    buildCandidate({
      id: 'stage4-pressure-exact-replay',
      label: 'Improve Stage 4 pressure exact replay',
      category: levelArc,
      quality,
      economics: ledger,
      expectedLift10: 0.35,
      confidence: 0.74,
      reuse: 0.82,
      risk: 0.32,
      costClass: 'medium',
      computeAxis: 'stage4-pressure',
      rationale: 'Level-arc pressure replay coverage remains a weak submetric, but prior cycles were more compute-heavy than the Stage 12 loop.',
      nextAction: 'Run focused source-window replay matching after the Stage 12 loop validates candidate mechanics.'
    }),
    buildCandidate({
      id: 'stage1-timing-polish',
      label: 'Stage 1 opening timing polish',
      category: stage1Timing,
      quality,
      economics: ledger,
      expectedLift10: 0.18,
      confidence: 0.8,
      reuse: 0.62,
      risk: 0.22,
      costClass: 'medium',
      computeAxis: 'quality-score',
      rationale: 'Stage 1 timing is a visible gap, but its current score is already reasonably high and the likely overall-score lift is smaller.',
      nextAction: 'Defer until higher-gap audio and level-arc candidates have been exercised.'
    }),
    buildCandidate({
      id: 'ui-graphics-polish',
      label: 'UI/graphics shell polish',
      category: uiShell,
      quality,
      economics: ledger,
      expectedLift10: 0.12,
      confidence: 0.68,
      reuse: 0.54,
      risk: 0.24,
      costClass: 'medium',
      computeAxis: 'quality-score',
      rationale: 'Graphics integrity is important, but the current shell score is high; visual reference work should be planned after higher-gap axes.',
      nextAction: 'Defer unless new ingestion evidence reveals a larger graphics-conformance gap.'
    })
  ].sort((a, b) => b.investmentScore - a.investmentScore || b.expectedOverallLift10 - a.expectedOverallLift10);

  const commit = gitShortCommit();
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);
  const report = {
    schema_version: 1,
    artifact_type: 'conformance-investment-priorities',
    generatedAt: new Date().toISOString(),
    commit,
    evidence: {
      qualityReport: rel(qualityPath),
      opportunityReport: opportunityPath ? rel(opportunityPath) : null,
      stage14SweepReport: stage14SweepPath ? rel(stage14SweepPath) : null,
      economicsReport: economicsPath ? rel(economicsPath) : null,
      ledger: rel(LEDGER)
    },
    problem: 'Next work should be chosen by expected impact on the whole-game conformance score, not only by whichever local metric was most recently inspected.',
    strategy: 'Rank candidates by weighted overall-score lift, current gap, confidence, reuse, risk, and measured compute history.',
    successMeasure: 'Before long compute cycles, the selected work should have an explicit investment score and a measurable target/guardrail profile.',
    summary: {
      overallScore10: quality.summary?.overallScore10 || null,
      weakestCategory: quality.summary?.weakestCategory?.id || null,
      topCandidate: candidates[0] || null
    },
    candidates,
    interpretation: stage14SpecialRoutes
      ? 'Audio remains the largest raw gap. Level-arc work remains the best lower-cost gameplay-adjacent investment; Stage 12 and Stage 14 reward-route uncertainty has been reduced, so the immediate level-arc task is now mid-run pressure event coverage.'
      : 'Audio remains the largest raw gap. Level-arc work remains the best lower-cost gameplay-adjacent investment, but the immediate level-arc task has shifted from Stage 12 reward discovery to better opportunity coverage and Stage 14 reward-route evidence.'
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    topCandidate: candidates[0]?.id || null,
    topInvestmentScore: candidates[0]?.investmentScore || 0
  }, null, 2));
}

main();

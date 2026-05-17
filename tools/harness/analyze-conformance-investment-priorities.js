#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'conformance-investment-priorities');
const LEDGER = path.join(ANALYSES, 'conformance-economics', 'run-ledger.jsonl');
const CHALLENGE_STAGE_CONFORMANCE = path.join(ANALYSES, 'challenge-stage-conformance', 'latest.json');

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

function latestCueRuntimeTrial(cue){
  const reports = walkReports(path.join(ANALYSES, 'aurora-audio-runtime-trials'))
    .map(file => {
      try{
        const report = readJson(file);
        return report.cue === cue ? { file, report } : null;
      }catch{
        return null;
      }
    })
    .filter(Boolean);
  reports.sort((a, b) => fs.statSync(a.file).mtimeMs - fs.statSync(b.file).mtimeMs || a.file.localeCompare(b.file));
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

function latestLevelArcCategory(quality, levelArcReport){
  const base = categoryById(quality, 'level-arc');
  if(!Number.isFinite(+levelArcReport?.summary?.score10)) return base;
  return Object.assign({}, base, {
    score10: +levelArcReport.summary.score10
  });
}

function nextAudioAction(audioEventGap, audioCueCandidate, audioContract, audioRuntimeTrial){
  if(audioRuntimeTrial?.report?.decision?.status === 'runtime-trial-rejected'){
    const candidate = audioRuntimeTrial.report.candidate || audioCueCandidate?.decision?.best || 'candidate';
    return `Challenge Perfect runtime trial rejected ${candidate}; do not directly promote the focused keeper. ${audioRuntimeTrial.report.nextStep || 'Generate a safer candidate that addresses the failed live/full-theme gates before another runtime trial.'}`;
  }
  if(audioCueCandidate?.cue === 'challengePerfect'){
    const decision = audioCueCandidate.decision || {};
    if(decision.keep && decision.best){
      const currentHighest = audioEventGap?.summary?.highestRiskCue || '';
      if(currentHighest === 'challengePerfect'){
        return `Challenge Perfect has a measured keeper candidate (${decision.best}), but the current runtime still shows Challenge Perfect as the top audio risk. Do not directly promote it; use the trial evidence to design a safer ceremony-tail candidate or run a guarded runtime trial that must preserve or improve the audio score, event-gap rollup, cue alignment, and overall quality.`;
      }
      return `Run a guarded runtime trial for the measured Challenge Perfect candidate ${decision.best}, then accept it only if full audio comparison, event-gap analysis, cue alignment, and quality scoring hold or improve.`;
    }
    if(decision.keep === false && audioCueCandidate.nextStep){
      return `Challenge Perfect: ${audioCueCandidate.nextStep}`;
    }
    if(decision.measuredBest){
      return `Continue Challenge Perfect candidate generation around ${decision.measuredBest}; the latest sweep found no safe keeper, so do not promote a runtime cue yet.`;
    }
  }
  const segmentCue = audioEventGap?.summary?.highestSegmentRiskCue || '';
  const segmentRole = audioEventGap?.summary?.highestSegmentRiskRole || '';
  if(segmentCue && segmentRole){
    return `Tune the highest segment-level audio gap next: ${segmentCue} ${segmentRole}. Rerun audio comparison, event-gap analysis, and quality scoring after the change.`;
  }
  if(audioContract?.nextStep) return audioContract.nextStep;
  const nextStep = audioEventGap?.nextStep;
  if(nextStep) return nextStep;
  const highest = audioEventGap?.summary?.highestRiskLabel || audioEventGap?.summary?.highestRiskCue || '';
  if(highest) return `Tune the highest-risk runtime cue next: ${highest}. Rerun audio comparison and event-gap analysis after the change.`;
  return 'Rerun audio comparison and semantic event-gap analysis, then tune the highest-risk runtime cue.';
}

function audioRationale(audioEventGap, audioCueCandidate, audioContract, audioRuntimeTrial){
  const summary = audioEventGap?.summary || {};
  const decision = audioCueCandidate?.decision || null;
  if(audioRuntimeTrial?.report?.decision?.status === 'runtime-trial-rejected'){
    return `Audio is still the weakest runtime quality category, and the latest Challenge Perfect trial is now preserved as a rejected runtime decision: focused candidate ${audioRuntimeTrial.report.candidate || decision?.best || 'candidate'} was useful generator evidence, but live/full-theme gates did not make it release-safe. Cue-contract readiness is ${audioContract?.summary?.averageReadinessScore10 ?? 'unknown'}/10; the next audio value is a safer candidate family, not direct promotion.`;
  }
  if(audioContract?.summary?.averageReadinessScore10){
    return `Audio is still the weakest runtime quality category, but the process is now more repeatable: cue-contract readiness is ${audioContract.summary.averageReadinessScore10}/10, semantic event score is ${summary.semanticAverageScore10 ?? 'unknown'}/10, acoustic event score remains the key gap, and the highest actionable cue is ${summary.highestSegmentRiskCue || summary.highestRiskCue} ${summary.highestSegmentRiskRole || ''}.`;
  }
  if(summary.highestSegmentRiskCue && summary.highestSegmentRiskRole){
    return `Audio is still the weakest quality category, and the evaluator now has ${summary.segmentRoleComparisonCount || 0} segment-role comparisons. The current highest actionable segment gap is ${summary.highestSegmentRiskCue} ${summary.highestSegmentRiskRole}, with average worst segment risk ${summary.averageWorstSegmentRisk10 ?? 'unknown'}/10.`;
  }
  if(audioCueCandidate?.cue === 'challengePerfect' && decision && decision.keep === false){
    return `Audio is still the weakest quality category. Semantic measurement debt is reduced, and the Challenge Perfect candidate loop now shows no safe keeper yet; measured-best ${decision.measuredBest || 'candidate'} should guide the next generator pass.`;
  }
  if(Number.isFinite(+summary.semanticAverageScore10) && +summary.semanticAttentionCueCount === 0){
    return `Audio is still the weakest quality category, but semantic measurement debt is now reduced: semantic event score is ${summary.semanticAverageScore10}/10, semantic attention rows are ${summary.semanticAttentionCueCount}, and the highest runtime cue risk is ${summary.highestRiskLabel || summary.highestRiskCue}.`;
  }
  return 'Audio is the weakest quality category. The semantic event-gap scorer now shows coverage is strong, while shared shot/impact/explosion mappings remain the next clarity gap.';
}

function nextLevelArcAction(nextOpportunityId){
  if(nextOpportunityId === 'stage-1-baseline-missing-event-coverage'){
    return 'Widen the Stage 1 baseline evidence window for player-shot and endpoint semantics before gameplay tuning.';
  }
  if(String(nextOpportunityId || '').includes('stage-1-baseline')){
    return 'Resolve the Stage 1 baseline opportunity coverage gap with a longer deterministic opening route before gameplay tuning.';
  }
  if(String(nextOpportunityId || '').includes('mid-run-pressure')){
    return 'Promote mid-run pressure event coverage by widening the Stage 6 evidence window for flank-dive and wave-clear semantics before changing gameplay tuning.';
  }
  return 'Use the top-ranked opportunity window to add or widen deterministic evidence before changing gameplay tuning.';
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
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const qualityPath = latestReport('quality-conformance');
  if(!qualityPath) throw new Error('Missing quality-conformance report; run npm run harness:score:quality-conformance first.');
  const opportunityPath = latestReport('level-arc-opportunity-windows');
  const levelArcPath = latestReport('level-arc-conformance');
  const formationPathSlotPath = latestReport('formation-boss-path-slot-extraction');
  const formationPathFamilyPath = latestReport('formation-boss-path-family-comparison');
  const audioEventGapPath = latestReport('aurora-audio-event-gap');
  const audioCueCandidatePath = latestReport('aurora-audio-cue-candidates');
  const audioContractPath = latestReport('aurora-audio-cue-contracts');
  const audioRuntimeTrial = latestCueRuntimeTrial('challengePerfect');
  const stage14SweepPath = latestReport('stage14-escort-reward-input-sweep');
  const economicsPath = latestReport('conformance-economics');
  const quality = readJson(qualityPath);
  const opportunity = opportunityPath ? readJson(opportunityPath) : { summary: {} };
  const levelArcReport = levelArcPath ? readJson(levelArcPath) : { summary: {} };
  const formationPathSlot = formationPathSlotPath ? readJson(formationPathSlotPath) : { summary: {} };
  const formationPathFamily = formationPathFamilyPath ? readJson(formationPathFamilyPath) : { summary: {} };
  const audioEventGap = audioEventGapPath ? readJson(audioEventGapPath) : { summary: {} };
  const audioCueCandidate = audioCueCandidatePath ? readJson(audioCueCandidatePath) : null;
  const audioContract = audioContractPath ? readJson(audioContractPath) : null;
  const challengeStage = fs.existsSync(CHALLENGE_STAGE_CONFORMANCE) ? readJson(CHALLENGE_STAGE_CONFORMANCE) : null;
  const stage14Sweep = stage14SweepPath ? readJson(stage14SweepPath) : { summary: {} };
  const ledger = loadLedger();
  const stage14SpecialRoutes = stage14Sweep.summary?.specialBonusCandidates || 0;
  const nextOpportunityId = opportunity.summary?.highestPriorityOpportunity?.id || 'missing level-arc opportunity coverage';
  const pathSlotAtRuntimeCap = Number.isFinite(+formationPathSlot.summary?.cappedPathSlotScore10)
    && +formationPathSlot.summary.cappedPathSlotScore10 >= +formationPathSlot.summary.referenceComparisonCap10;
  const pathFamilyAtHeuristicCap = Number.isFinite(+formationPathFamily.summary?.score10)
    && +formationPathFamily.summary.score10 >= +formationPathFamily.summary.referenceComparisonCap10;
  const formationPathCandidateId = pathFamilyAtHeuristicCap
    ? 'formation-boss-frame-labeled-reference-paths'
    : pathSlotAtRuntimeCap
    ? 'formation-boss-reference-path-comparison'
    : 'formation-boss-path-slot-extraction';

  const audio = categoryById(quality, 'audio');
  const challengeSetPiece = categoryById(quality, 'challenge-set-piece');
  const levelArc = latestLevelArcCategory(quality, levelArcReport);
  const formationBoss = categoryById(quality, 'formation-boss-grammar');
  const stage1Timing = categoryById(quality, 'stage1-timing');
  const uiShell = categoryById(quality, 'ui-shell');
  const candidates = [
    buildCandidate({
      id: 'audio-reference-segmentation',
      label: 'Advance audio cue contracts, reference segmentation, and cue matching',
      category: audio,
      quality,
      economics: ledger,
      expectedLift10: 0.7,
      confidence: 0.72,
      reuse: 0.9,
      risk: 0.28,
      costClass: 'high',
      computeAxis: 'quality-score',
      rationale: audioRationale(audioEventGap, audioCueCandidate, audioContract, audioRuntimeTrial),
      nextAction: nextAudioAction(audioEventGap, audioCueCandidate, audioContract, audioRuntimeTrial)
    }),
    buildCandidate({
      id: 'challenge-stage-set-piece-authorship',
      label: 'Rebuild challenging stages as authored Galaga-like bonus set pieces',
      category: challengeSetPiece,
      quality,
      economics: ledger,
      expectedLift10: 1.8,
      confidence: 0.78,
      reuse: 0.96,
      risk: 0.34,
      costClass: 'high',
      computeAxis: 'conformance-loop',
      rationale: challengeStage
        ? `Strict challenge scoring now exposes the real user-experience gap: overall ${challengeStage.summary.score10}/10, movement ${challengeStage.summary.movementConformanceScore10}/10, graphics ${challengeStage.summary.graphicalConformanceScore10}/10, alien novelty ${challengeStage.summary.alienNoveltyScore10}/10, while safety is ${challengeStage.summary.safetyRuleScore10}/10. This is the highest gameplay-authenticity opportunity and the same target grammar will be reusable for future game ingestion.`
        : 'Strict challenge scoring is missing; run the analyzer, then rebuild the first challenge stage against a real target contract.',
      nextAction: challengeStage?.improvementPlan?.[2] || 'Run strict challenge-stage conformance, then rebuild Stage 3 / Challenging Stage 1 against the Galaga challenge-1 arrival and late-wave references.'
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
      nextAction: nextLevelArcAction(nextOpportunityId)
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
      id: formationPathCandidateId,
      label: pathFamilyAtHeuristicCap
        ? 'Add frame-labeled Galaga boss and formation path references'
        : pathSlotAtRuntimeCap
        ? 'Compare boss and formation paths against reference families'
        : 'Promote boss entry and formation path/slot extraction',
      category: formationBoss,
      quality,
      economics: ledger,
      expectedLift10: pathFamilyAtHeuristicCap ? 0.28 : pathSlotAtRuntimeCap ? 0.42 : 0.75,
      confidence: pathFamilyAtHeuristicCap ? 0.58 : pathSlotAtRuntimeCap ? 0.62 : 0.7,
      reuse: 0.96,
      risk: pathFamilyAtHeuristicCap ? 0.42 : pathSlotAtRuntimeCap ? 0.38 : 0.3,
      costClass: pathFamilyAtHeuristicCap ? 'high' : pathSlotAtRuntimeCap ? 'high' : 'medium',
      computeAxis: 'conformance-loop',
      rationale: pathFamilyAtHeuristicCap
        ? `Heuristic path-family comparison is now available and capped at ${formationPathFamily.summary.score10}/10 with confidence ${formationPathFamily.summary.comparisonConfidence}. The remaining path-shape gap is labeled Galaga reference path data, not runtime extraction.`
        : pathSlotAtRuntimeCap
        ? `Runtime path extraction is now available and capped at ${formationPathSlot.summary.cappedPathSlotScore10}/10 until reference comparison lands. The latest extraction found ${formationPathSlot.summary.bossMovingTracks} moving boss tracks, ${formationPathSlot.summary.escortTracks} escort tracks, and ${formationPathSlot.summary.regularSlotTracks + formationPathSlot.summary.challengeSlotTracks} slot tracks.`
        : 'Boss entry and formation grammar is now a first-class scorer. Its current highest measurement debt is path-shape and set-formation precision, which affects Galaga-like stage choreography and is reusable for future game ingestion.',
      nextAction: pathFamilyAtHeuristicCap
        ? 'Label boss, escort, rack-settle, and challenge path families from Galaga reference contact sheets or video traces, then replace heuristic coverage with direct shape-distance scoring.'
        : pathSlotAtRuntimeCap
        ? 'Add Galaga reference path-family labels and compare extracted Aurora boss/escort/challenge trajectories against those targets before tuning stage scripts.'
        : 'Extract frame-level boss/escort/challenge paths and formation slot coordinates for the current evidence windows, then rerun formation-boss grammar, level-arc, and quality scoring.'
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
      audioEventGapReport: audioEventGapPath ? rel(audioEventGapPath) : null,
      audioCueCandidateReport: audioCueCandidatePath ? rel(audioCueCandidatePath) : null,
      audioRuntimeTrialReport: audioRuntimeTrial ? rel(audioRuntimeTrial.file) : null,
      opportunityReport: opportunityPath ? rel(opportunityPath) : null,
      levelArcReport: levelArcPath ? rel(levelArcPath) : null,
      formationPathSlotReport: formationPathSlotPath ? rel(formationPathSlotPath) : null,
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
    interpretation: `The strict challenge-stage set-piece scorer is now allowed to outrank broader coverage metrics when it exposes a larger player-facing gap. Audio remains a major raw gap, but challenge-stage authorship now competes directly because its strict score is ${challengeStage?.summary?.score10 ?? 'unknown'}/10 and its remediation creates reusable ingestion grammar. Semantic audio measurement debt is now ${audioEventGap.summary?.semanticAttentionCueCount ?? 'unknown'} attention rows, segment-role comparisons are ${audioEventGap.summary?.segmentRoleComparisonCount ?? 'unknown'}, the latest Challenge Perfect candidate decision is ${audioCueCandidate?.decision?.status || 'not yet run'}, and the runtime-trial status is ${audioRuntimeTrial?.report?.decision?.status || 'not yet recorded'}. If the next cycle stays in level-arc instead, the immediate level-arc task is ${nextOpportunityId}.`
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

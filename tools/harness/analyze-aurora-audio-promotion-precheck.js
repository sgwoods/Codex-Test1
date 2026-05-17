#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const THEME_ROOT = path.join(ANALYSES, 'aurora-audio-theme-comparison');
const CANDIDATE_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const EVENT_GAP_LATEST = path.join(ANALYSES, 'aurora-audio-event-gap', 'latest.json');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-promotion-precheck');

const DEFAULT_REPORTS = Object.freeze({
  stagePulse: 'latest-formation-pulse.json',
  rescueJoin: 'latest-rescue-join.json',
  playerHit: 'latest-player-hit-focus.json',
  challengePerfect: 'latest-challenge-perfect.json',
  enemyBoom: 'latest-enemy-boom.json',
  bossHit: 'latest-boss-hit.json',
  bossBoom: 'latest-boss-boom.json'
});

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function walkFiles(root, fileName){
  const found = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === fileName) found.push(full);
    }
  }
  walk(root);
  return found;
}

function latestThemeMetrics(){
  const metrics = walkFiles(THEME_ROOT, 'metrics.json')
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs || a.localeCompare(b));
  if(!metrics.length) throw new Error(`No audio theme metrics found under ${rel(THEME_ROOT)}.`);
  return metrics[0];
}

function candidateReportPath(cue){
  const override = argValue('candidate-report');
  if(override) return path.resolve(ROOT, override);
  const fileName = DEFAULT_REPORTS[cue];
  if(!fileName) throw new Error(`No default candidate report is known for cue ${cue}. Pass --candidate-report.`);
  return path.join(CANDIDATE_ROOT, fileName);
}

function chooseCandidate(report){
  const candidateId = argValue('candidate-id', report.decision?.best || report.decision?.measuredBest || '');
  if(!candidateId) return null;
  return (report.candidates || []).find(candidate => candidate.id === candidateId)
    || (report.candidates || []).find(candidate => (candidate.samples || []).some(sample => sample.id === candidateId))
    || null;
}

function representativeCandidateItem(candidate, focusMetrics){
  const samples = (candidate.samples || []).slice();
  const wanted = samples
    .sort((a, b) => (+b.risk10 || 0) - (+a.risk10 || 0) || (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0];
  const sampleId = wanted?.id || candidate.id;
  const items = (focusMetrics.items || []).filter(item => item.id === sampleId || item.id.startsWith(`${sampleId}-r`));
  if(!items.length) return null;
  return items
    .slice()
    .sort((a, b) => {
      const ar = +(a.segmentRoleComparisons || []).reduce((max, row) => Math.max(max, +row.auroraSegmentRisk10 || 0), 0);
      const br = +(b.segmentRoleComparisons || []).reduce((max, row) => Math.max(max, +row.auroraSegmentRisk10 || 0), 0);
      return br - ar || String(a.id).localeCompare(String(b.id));
    })[0];
}

function replaceCueItem(themeItem, candidateItem, candidate){
  return {
    ...themeItem,
    label: `${themeItem.label} (promotion precheck)`,
    variants: {
      ...themeItem.variants,
      aurora: candidateItem.variants?.aurora || themeItem.variants?.aurora
    },
    comparisons: {
      ...themeItem.comparisons,
      ...candidateItem.comparisons,
      auroraVsReferenceActive: candidateItem.comparisons?.auroraVsReferenceActive || themeItem.comparisons?.auroraVsReferenceActive
    },
    referenceSegmentCandidates: candidateItem.referenceSegmentCandidates || themeItem.referenceSegmentCandidates,
    referenceSegmentation: candidateItem.referenceSegmentation || themeItem.referenceSegmentation,
    segmentRoleComparisons: candidateItem.segmentRoleComparisons || themeItem.segmentRoleComparisons,
    cadencePressureAnalysis: candidateItem.cadencePressureAnalysis || themeItem.cadencePressureAnalysis,
    promotionPrecheck: {
      candidateId: candidate.id,
      representativeSampleId: candidateItem.id,
      keeperRead: candidate.keeperRead || '',
      risk10: candidate.risk10 ?? null,
      worstSegmentRisk10: candidate.worstSegmentRisk10 ?? null,
      stability: candidate.stability || null
    }
  };
}

function runEventGap(metricsPath, outDir){
  const result = spawnSync(process.execPath, [
    path.join(ROOT, 'tools', 'harness', 'analyze-aurora-audio-event-gap.js'),
    '--metrics', metricsPath,
    '--out-root', outDir
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      AURORA_AUDIO_EVENT_GAP_BASELINE: EVENT_GAP_LATEST
    }
  });
  if(result.status !== 0){
    throw new Error(`Event-gap precheck failed:\n${result.stdout}\n${result.stderr}`);
  }
  return readJson(path.join(outDir, 'latest.json'));
}

function rowFor(report, cue){
  return (report.comparedCueRisks || []).find(row => row.cue === cue) || null;
}

function decide({ candidateReport, candidate, currentEventGap, precheckEventGap, cue }){
  const current = rowFor(currentEventGap, cue);
  const simulated = rowFor(precheckEventGap, cue);
  const blockers = [];
  const warnings = [];
  const wins = [];
  const calibratedKeeper = !!candidateReport.decision?.keep && !!candidate?.lossComposite?.calibration;
  if(!candidateReport.decision?.keep) blockers.push(candidateReport.decision?.reason || 'Focused candidate report did not clear keeper gates.');
  if(!candidate) blockers.push('No candidate row was available for the requested cue.');
  if(current && simulated){
    const gapDelta = round((+simulated.gapRisk10 || 0) - (+current.gapRisk10 || 0), 2);
    const segmentDelta = Number.isFinite(+simulated.worstSegmentRisk10) && Number.isFinite(+current.worstSegmentRisk10)
      ? round(+simulated.worstSegmentRisk10 - +current.worstSegmentRisk10, 2)
      : null;
    if(gapDelta > .05) blockers.push(`Full-theme cue gap worsens by ${gapDelta}/10.`);
    else if(gapDelta < -.05) wins.push(`Full-theme cue gap improves by ${Math.abs(gapDelta)}/10.`);
    if(Number.isFinite(+segmentDelta)){
      const calibratedTrialTolerance10 = calibratedKeeper && gapDelta < -.5 ? .12 : .05;
      if(segmentDelta > .05 && segmentDelta <= calibratedTrialTolerance10){
        warnings.push(`Worst segment risk worsens by ${segmentDelta}/10, inside calibrated trial tolerance ${calibratedTrialTolerance10}/10 after a ${Math.abs(gapDelta)}/10 cue-gap win.`);
      }else if(segmentDelta > .05) blockers.push(`Worst segment risk worsens by ${segmentDelta}/10.`);
      else if(segmentDelta < -.05) wins.push(`Worst segment risk improves by ${Math.abs(segmentDelta)}/10.`);
    }
  }else{
    blockers.push('Could not compare current and simulated cue rows.');
  }
  const currentSummary = currentEventGap.summary || {};
  const simulatedSummary = precheckEventGap.summary || {};
  const averageDelta = Number.isFinite(+simulatedSummary.averageWorstSegmentRisk10) && Number.isFinite(+currentSummary.averageWorstSegmentRisk10)
    ? round(+simulatedSummary.averageWorstSegmentRisk10 - +currentSummary.averageWorstSegmentRisk10, 2)
    : null;
  if(Number.isFinite(+averageDelta)){
    if(averageDelta > .03) blockers.push(`Theme average worst-segment risk worsens by ${averageDelta}/10.`);
    else if(averageDelta < -.03) wins.push(`Theme average worst-segment risk improves by ${Math.abs(averageDelta)}/10.`);
  }
  if(+simulatedSummary.semanticAverageScore10 < +currentSummary.semanticAverageScore10){
    blockers.push(`Semantic audio score regresses from ${currentSummary.semanticAverageScore10} to ${simulatedSummary.semanticAverageScore10}.`);
  }
  return {
    status: blockers.length ? 'precheck-reject' : 'precheck-trial-allowed',
    allowRuntimeTrial: blockers.length === 0,
    promoteRuntime: false,
    runtimeValidationRequired: true,
    blockers,
    warnings,
    wins,
    currentCueRow: current,
    simulatedCueRow: simulated,
    summaryDelta: {
      averageWorstSegmentRisk10: averageDelta,
      highestRiskCue: `${currentSummary.highestRiskCue || ''} -> ${simulatedSummary.highestRiskCue || ''}`,
      highestRisk10: Number.isFinite(+simulatedSummary.highestRisk10) && Number.isFinite(+currentSummary.highestRisk10)
        ? round(+simulatedSummary.highestRisk10 - +currentSummary.highestRisk10, 2)
        : null,
      semanticAverageScore10: Number.isFinite(+simulatedSummary.semanticAverageScore10) && Number.isFinite(+currentSummary.semanticAverageScore10)
        ? round(+simulatedSummary.semanticAverageScore10 - +currentSummary.semanticAverageScore10, 2)
        : null
    }
  };
}

function markdown(report){
  const lines = [
    '# Aurora Audio Promotion Precheck',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Strategy',
    '',
    report.strategy,
    '',
    '## Decision',
    '',
    `- Cue: \`${report.cue}\``,
    `- Candidate: \`${report.candidate?.id || 'none'}\``,
    `- Status: \`${report.decision.status}\``,
    `- Runtime trial allowed: ${report.decision.allowRuntimeTrial ? 'yes' : 'no'}`,
    `- Promote runtime from precheck alone: no`,
    `- Current cue gap: ${report.decision.currentCueRow?.gapRisk10 ?? 'n/a'}/10`,
    `- Simulated cue gap: ${report.decision.simulatedCueRow?.gapRisk10 ?? 'n/a'}/10`,
    `- Current worst segment: ${report.decision.currentCueRow?.worstSegmentRisk10 ?? 'n/a'}/10`,
    `- Simulated worst segment: ${report.decision.simulatedCueRow?.worstSegmentRisk10 ?? 'n/a'}/10`,
    '',
    '## Blockers',
    ''
  ];
  if(report.decision.blockers.length) report.decision.blockers.forEach(item => lines.push(`- ${item}`));
  else lines.push('- None.');
  lines.push('', '## Warnings', '');
  if(report.decision.warnings?.length) report.decision.warnings.forEach(item => lines.push(`- ${item}`));
  else lines.push('- None.');
  lines.push('', '## Wins', '');
  if(report.decision.wins.length) report.decision.wins.forEach(item => lines.push(`- ${item}`));
  else lines.push('- None measured.');
  lines.push(
    '',
    '## Source Artifacts',
    '',
    `- Candidate report: \`${report.source.candidateReport}\``,
    `- Candidate focus metrics: \`${report.source.candidateFocusMetrics}\``,
    `- Theme metrics: \`${report.source.themeMetrics}\``,
    `- Synthetic theme metrics: \`${report.source.syntheticThemeMetrics}\``,
    `- Simulated event gap: \`${report.source.simulatedEventGap}\``,
    '',
    '## Next Step',
    '',
    report.nextStep,
    ''
  );
  return `${lines.join('\n')}\n`;
}

function main(){
  const cue = argValue('cue', 'rescueJoin');
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const runClock = generatedAt.slice(11, 19).replace(/:/g, '');
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}-${runClock}-${cue}`);
  const candidatePath = candidateReportPath(cue);
  if(!fs.existsSync(candidatePath)) throw new Error(`Candidate report not found: ${rel(candidatePath)}`);
  const candidateReport = readJson(candidatePath);
  const candidate = chooseCandidate(candidateReport);
  const themePath = latestThemeMetrics();
  const theme = readJson(themePath);
  const focusMetricsPath = candidateReport.source?.metrics ? path.resolve(ROOT, candidateReport.source.metrics) : '';
  if(!focusMetricsPath || !fs.existsSync(focusMetricsPath)) throw new Error(`Candidate focus metrics missing for ${rel(candidatePath)}`);
  const focusMetrics = readJson(focusMetricsPath);
  const candidateItem = candidate ? representativeCandidateItem(candidate, focusMetrics) : null;
  const themeItemIndex = (theme.items || []).findIndex(item => item.cue === cue);
  if(themeItemIndex < 0) throw new Error(`Latest theme metrics do not contain cue ${cue}.`);
  if(!candidateItem) throw new Error(`No representative metrics item found for cue ${cue} candidate ${candidate?.id || 'none'}.`);
  const syntheticTheme = {
    ...theme,
    generatedAt,
    sourcePrecheck: {
      cue,
      candidateReport: rel(candidatePath),
      candidateId: candidate.id,
      representativeSampleId: candidateItem.id,
      themeMetrics: rel(themePath)
    },
    items: (theme.items || []).map((item, index) => index === themeItemIndex ? replaceCueItem(item, candidateItem, candidate) : item)
  };
  const syntheticMetricsPath = path.join(outDir, 'candidate-theme-metrics.json');
  writeJson(syntheticMetricsPath, syntheticTheme);
  const simulatedEventGap = runEventGap(syntheticMetricsPath, path.join(outDir, 'event-gap'));
  const currentEventGap = fs.existsSync(EVENT_GAP_LATEST) ? readJson(EVENT_GAP_LATEST) : simulatedEventGap;
  const decision = decide({ candidateReport, candidate, currentEventGap, precheckEventGap: simulatedEventGap, cue });
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-promotion-precheck',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    cue,
    problem: 'Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.',
    strategy: 'Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.',
    successMeasure: 'A candidate may be promoted only when focused keeper gates, full-theme cue gap, worst-segment risk, theme average risk, and semantic score all hold or improve.',
    candidate: candidate ? {
      id: candidate.id,
      risk10: candidate.risk10 ?? null,
      worstSegmentRisk10: candidate.worstSegmentRisk10 ?? null,
      lossComposite: candidate.lossComposite || null,
      keeperRead: candidate.keeperRead || '',
      stability: candidate.stability || null,
      spec: candidate.spec || null
    } : null,
    decision,
    source: {
      candidateReport: rel(candidatePath),
      candidateFocusMetrics: rel(focusMetricsPath),
      themeMetrics: rel(themePath),
      syntheticThemeMetrics: rel(syntheticMetricsPath),
      simulatedEventGap: rel(path.join(outDir, 'event-gap', 'latest.json')),
      currentEventGap: rel(EVENT_GAP_LATEST)
    },
    nextStep: decision.allowRuntimeTrial
      ? `Try ${cue} in the Aurora audio theme only as a measured runtime trial, then accept it only if full audio comparison, event gap, cue alignment, and quality scoring all hold or improve.`
      : `Do not promote ${cue}; use this precheck evidence to pivot toward a stronger candidate family or the current highest-risk cue (${currentEventGap.summary?.highestRiskCue || 'unknown'}).`
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    cue,
    candidate: candidate?.id || null,
    decision: report.decision.status,
    allowRuntimeTrial: report.decision.allowRuntimeTrial,
    promoteRuntime: report.decision.promoteRuntime,
    blockers: report.decision.blockers,
    warnings: report.decision.warnings,
    wins: report.decision.wins,
    nextStep: report.nextStep
  }, null, 2));
}

main();

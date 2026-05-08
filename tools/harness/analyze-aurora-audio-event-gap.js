#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SOURCE_ROOT = path.join(ANALYSES, 'aurora-audio-theme-comparison');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-event-gap');
const GUIDE = path.join(ROOT, 'application-guide.json');

const CRITICAL_CUES = new Set([
  'playerShot',
  'enemyShot',
  'enemyHit',
  'bossHit',
  'enemyBoom',
  'bossBoom',
  'captureBeam',
  'captureSuccess',
  'captureRetreat',
  'capturedFighterDestroyed',
  'rescueJoin',
  'playerHit',
  'challengeTransition',
  'challengeResults',
  'challengePerfect'
]);

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

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function latestMetrics(){
  const candidates = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'metrics.json') candidates.push(full);
    }
  }
  walk(SOURCE_ROOT);
  candidates.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
  if(!candidates.length) throw new Error(`No Aurora audio theme comparison metrics found under ${rel(SOURCE_ROOT)}.`);
  return candidates[candidates.length - 1];
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function cuePriority(cueName){
  if(['playerShot', 'enemyShot', 'enemyHit', 'bossHit', 'enemyBoom', 'bossBoom'].includes(cueName)) return 1.2;
  if(['captureBeam', 'captureSuccess', 'captureRetreat', 'capturedFighterDestroyed', 'rescueJoin', 'playerHit'].includes(cueName)) return 1.15;
  if(['challengeTransition', 'challengeResults', 'challengePerfect'].includes(cueName)) return 1.05;
  return .82;
}

function eventGapScore(item){
  const comparison = item.comparisons?.auroraVsReferenceActive || {};
  const durationGap = +comparison.duration_s || 0;
  const centroidGap = +comparison.spectral_centroid_hz || 0;
  const zcrGap = +comparison.zero_crossings_per_s || 0;
  const rmsGap = +comparison.rms || 0;
  const broadPenalty = /broad-reference-window/.test(item.comparisons?.referenceWindowStatus || '') ? 1.3 : 0;
  const segmentScore = (item.referenceSegmentCandidates || [])[0]?.score;
  const segmentPenalty = Number.isFinite(+segmentScore) ? clamp((.8 - +segmentScore) * 3, 0, 1.4) : .45;
  const raw =
    clamp(durationGap / 3, 0, 3.4) +
    clamp(centroidGap / 500, 0, 2.5) +
    clamp(zcrGap / 1200, 0, 2.1) +
    clamp(rmsGap / .13, 0, 1.5) +
    broadPenalty +
    segmentPenalty;
  return round(clamp(raw * cuePriority(item.cue), 0, 10), 2);
}

function recommendation(item){
  const status = item.comparisons?.referenceWindowStatus || '';
  const cue = item.cue || '';
  const comparison = item.comparisons?.auroraVsReferenceActive || {};
  const segmentScore = (item.referenceSegmentCandidates || [])[0]?.score;
  if(/broad-reference-window/.test(status)){
    return 'Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring.';
  }
  if((+comparison.duration_s || 0) > 2){
    return 'Shorten or split the runtime cue to match the active reference phrase before timbre tuning.';
  }
  if((+comparison.spectral_centroid_hz || 0) > 500){
    return 'Tune timbre/centroid after confirming event timing; current cue character is far from reference.';
  }
  if(Number.isFinite(+segmentScore) && +segmentScore < .6){
    return 'Revisit reference segment choice; best candidate match is weak.';
  }
  if(['enemyHit', 'bossHit', 'enemyBoom', 'bossBoom'].includes(cue)){
    return 'Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state.';
  }
  return 'Keep as secondary pass after higher-risk audio gaps are narrowed.';
}

function rowForItem(item){
  const comparison = item.comparisons?.auroraVsReferenceActive || {};
  const bestSegment = (item.referenceSegmentCandidates || [])[0] || null;
  return {
    id: item.id,
    label: item.label,
    cue: item.cue,
    focus: item.focus,
    status: item.comparisons?.referenceWindowStatus || '',
    eventCritical: CRITICAL_CUES.has(item.cue),
    gapRisk10: eventGapScore(item),
    durationGapSeconds: round(comparison.duration_s, 3),
    centroidGapHz: round(comparison.spectral_centroid_hz, 1),
    zeroCrossingGapPerSecond: round(comparison.zero_crossings_per_s, 1),
    rmsGap: round(comparison.rms, 4),
    bestReferenceSegmentScore: bestSegment ? round(bestSegment.score, 3) : null,
    bestReferenceSegment: bestSegment ? {
      startSeconds: bestSegment.start_s,
      endSeconds: bestSegment.end_s,
      score: round(bestSegment.score, 3)
    } : null,
    recommendation: recommendation(item)
  };
}

function markdown(report){
  const lines = [
    '# Aurora Audio Event Gap Analysis',
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
    '## Success Measure',
    '',
    report.successMeasure,
    '',
    '## Current Read',
    '',
    `- Source metrics: \`${report.source.metrics}\``,
    `- Compared cues: ${report.summary.comparedCueCount}`,
    `- Critical cues with comparison coverage: ${report.summary.criticalComparedCueCount}`,
    `- Missing critical comparison cues: ${report.summary.missingCriticalComparisonCueCount}`,
    `- Broad reference windows needing segmentation: ${report.summary.broadReferenceWindowCount}`,
    `- Highest event-gap risk: ${report.summary.highestRiskCue} (${report.summary.highestRisk10}/10 risk)`,
    '',
    '## Highest-Risk Compared Cues',
    '',
    '| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Best segment | Recommended action |',
    '| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | --- |'
  ];
  report.comparedCueRisks.slice(0, 12).forEach((item, index) => {
    lines.push(`| ${index + 1} | ${item.cue} | ${item.label} | ${item.gapRisk10} | ${item.status} | ${item.durationGapSeconds}s | ${item.centroidGapHz} Hz | ${item.bestReferenceSegmentScore ?? 'n/a'} | ${item.recommendation} |`);
  });
  lines.push('', '## Missing Critical Comparison Coverage', '');
  if(report.missingCriticalComparisonCues.length){
    lines.push('| Cue | Labels in guide | Why this matters |');
    lines.push('| --- | --- | --- |');
    for(const item of report.missingCriticalComparisonCues){
      lines.push(`| ${item.cue} | ${item.labels.join(', ')} | ${item.reason} |`);
    }
  }else{
    lines.push('All critical cues have comparison coverage.');
  }
  lines.push('', '## Recommended Next Step', '');
  lines.push(report.nextStep);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const metricsPath = latestMetrics();
  const metrics = readJson(metricsPath);
  const guide = readJson(GUIDE);
  const comparedCueSet = new Set((metrics.items || []).map(item => item.cue));
  const guideByCue = new Map();
  for(const ctx of guide.audioContexts || []){
    const cue = ctx.preview?.cue;
    if(!cue) continue;
    if(!guideByCue.has(cue)) guideByCue.set(cue, []);
    guideByCue.get(cue).push(ctx.label || ctx.id);
  }
  const comparedCueRisks = (metrics.items || []).map(rowForItem)
    .sort((a, b) => b.gapRisk10 - a.gapRisk10 || String(a.cue).localeCompare(String(b.cue)));
  const missingCriticalComparisonCues = Array.from(CRITICAL_CUES)
    .filter(cue => !comparedCueSet.has(cue))
    .map(cue => ({
      cue,
      labels: guideByCue.get(cue) || [],
      reason: ['enemyHit', 'bossHit', 'enemyBoom', 'bossBoom'].includes(cue)
        ? 'Impact/explosion clarity is core gameplay feedback and was explicitly identified as future polish debt.'
        : 'Critical gameplay cue lacks a measured reference-comparison row.'
    }))
    .sort((a, b) => String(a.cue).localeCompare(String(b.cue)));
  const broadReferenceWindowCount = comparedCueRisks.filter(item => /broad-reference-window/.test(item.status)).length;
  const highest = comparedCueRisks[0] || {};
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}`);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-event-gap',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    problem: 'Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.',
    strategy: 'Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.',
    successMeasure: 'The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.',
    source: {
      metrics: rel(metricsPath),
      guide: rel(GUIDE),
      metricsSummary: metrics.summary || {}
    },
    summary: {
      comparedCueCount: comparedCueRisks.length,
      criticalComparedCueCount: comparedCueRisks.filter(item => item.eventCritical).length,
      missingCriticalComparisonCueCount: missingCriticalComparisonCues.length,
      broadReferenceWindowCount,
      highestRiskCue: highest.cue || '',
      highestRiskLabel: highest.label || '',
      highestRisk10: highest.gapRisk10 ?? null
    },
    comparedCueRisks,
    missingCriticalComparisonCues,
    nextStep: missingCriticalComparisonCues.length
      ? 'Add measured comparison coverage for impact/explosion cues first: enemyHit, bossHit, enemyBoom, and bossBoom. Then rerun the audio theme comparison and this event-gap analysis.'
      : broadReferenceWindowCount
        ? 'Promote narrower reference subwindows for the broadest remaining cues, then tune the highest-risk runtime cue.'
        : `Tune the highest-risk runtime cue next: ${highest.label || highest.cue || 'unknown cue'}. Rerun audio comparison and event-gap analysis after the change.`
  };
  fs.mkdirSync(outDir, { recursive: true });
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    readme: rel(path.join(outDir, 'README.md')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    summary: report.summary,
    nextStep: report.nextStep
  }, null, 2));
}

main();

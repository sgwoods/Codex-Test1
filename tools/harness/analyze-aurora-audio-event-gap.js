#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SOURCE_ROOT = path.join(ANALYSES, 'aurora-audio-theme-comparison');
const GUIDE = path.join(ROOT, 'application-guide.json');

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

const OUT_ROOT = path.resolve(ROOT, argValue('out-root', path.join('reference-artifacts', 'analyses', 'aurora-audio-event-gap')));

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

const EVENT_SEMANTICS = Object.freeze({
  playerShot: {
    class: 'projectile-fired',
    playerMeaning: 'The player acted; the shot should be quick, crisp, and distinct from impacts.',
    distinctFrom: ['enemyShot', 'enemyHit', 'bossHit']
  },
  enemyShot: {
    class: 'threat-fired',
    playerMeaning: 'An enemy threat entered play; the cue should not collapse into the player shot sound.',
    distinctFrom: ['playerShot', 'attackCharge', 'enemyHit']
  },
  enemyHit: {
    class: 'impact-confirmation',
    playerMeaning: 'A hit connected; the player should hear immediate damage feedback before destruction hierarchy.',
    distinctFrom: ['enemyBoom', 'bossHit', 'playerShot']
  },
  bossHit: {
    class: 'boss-damage-confirmation',
    playerMeaning: 'A multi-hit boss was damaged but not necessarily destroyed.',
    distinctFrom: ['bossBoom', 'enemyHit', 'playerShot']
  },
  enemyBoom: {
    class: 'enemy-destroyed',
    playerMeaning: 'A normal enemy was destroyed; the cue should feel more final than a hit.',
    distinctFrom: ['enemyHit', 'bossBoom']
  },
  bossBoom: {
    class: 'boss-destroyed',
    playerMeaning: 'A boss was destroyed; the cue should feel larger and more final than normal enemy destruction.',
    distinctFrom: ['bossHit', 'enemyBoom']
  },
  captureBeam: {
    class: 'capture-danger',
    playerMeaning: 'A tractor-beam threat is active and demands immediate player attention.',
    distinctFrom: ['captureSuccess', 'captureRetreat']
  },
  captureSuccess: {
    class: 'capture-state-change',
    playerMeaning: 'The fighter has been captured; the player should understand the risk/reward state changed.',
    distinctFrom: ['captureBeam', 'captureRetreat', 'playerHit']
  },
  captureRetreat: {
    class: 'capture-retreat-state',
    playerMeaning: 'The boss is leaving with the captured fighter; the captured state should remain legible.',
    distinctFrom: ['captureBeam', 'captureSuccess']
  },
  capturedFighterDestroyed: {
    class: 'captured-fighter-penalty',
    playerMeaning: 'The carried fighter was destroyed; this should read as a penalty/regret event.',
    distinctFrom: ['enemyBoom', 'rescueJoin']
  },
  rescueJoin: {
    class: 'rescue-reward',
    playerMeaning: 'The rescued fighter rejoined; the cue should clearly reward the player.',
    distinctFrom: ['capturedFighterDestroyed', 'challengePerfect']
  },
  playerHit: {
    class: 'player-ship-lost',
    playerMeaning: 'The player lost a ship; the cue should be unmistakable and synchronized with death feedback.',
    distinctFrom: ['enemyBoom', 'bossBoom']
  },
  challengeTransition: {
    class: 'challenge-entry',
    playerMeaning: 'A bonus/challenge set piece is starting; the cue should feel ceremonial.',
    distinctFrom: ['stageTransition', 'challengeResults']
  },
  challengeResults: {
    class: 'challenge-result',
    playerMeaning: 'The challenge result is being scored; the phrase should feel like a result, not a generic transition.',
    distinctFrom: ['challengeTransition', 'challengePerfect']
  },
  challengePerfect: {
    class: 'perfect-challenge-result',
    playerMeaning: 'A perfect challenge clear occurred; this should be more celebratory than the standard result.',
    distinctFrom: ['challengeResults', 'rescueJoin']
  },
  gameOver: {
    class: 'run-ended',
    playerMeaning: 'The run is over; the ending cue should feel final and emotionally complete.',
    distinctFrom: ['playerHit', 'highScoreFirst']
  }
});

function confidenceValue(value){
  const text = String(value || '').toLowerCase();
  if(text.includes('high')) return 1;
  if(text.includes('medium')) return .78;
  if(text.includes('low')) return .48;
  return .62;
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

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function latestMetrics(){
  const override = argValue('metrics');
  if(override){
    const file = path.resolve(ROOT, override);
    if(!fs.existsSync(file)) throw new Error(`Audio event gap metrics override not found: ${override}`);
    return file;
  }
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

function baselineReport(){
  const candidates = [
    process.env.AURORA_AUDIO_EVENT_GAP_BASELINE || '',
    path.join(OUT_ROOT, 'latest.json')
  ].filter(Boolean);
  for(const file of candidates){
    if(!fs.existsSync(file)) continue;
    try{
      return { path: file, report: readJson(file) };
    }catch{
      continue;
    }
  }
  return null;
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
  const worstSegmentRisk = worstSegment(item)?.auroraSegmentRisk10 || 0;
  const broadPenalty = /broad-reference-window/.test(item.comparisons?.referenceWindowStatus || '') ? 1.3 : 0;
  const segmentScore = (item.referenceSegmentCandidates || [])[0]?.score;
  const segmentPenalty = Number.isFinite(+segmentScore) ? clamp((.8 - +segmentScore) * 3, 0, 1.4) : .45;
  const raw =
    clamp(durationGap / 3, 0, 3.4) +
    clamp(centroidGap / 500, 0, 2.5) +
    clamp(zcrGap / 1200, 0, 2.1) +
    clamp(rmsGap / .13, 0, 1.5) +
    clamp(worstSegmentRisk / 10, 0, 1.25) +
    broadPenalty +
    segmentPenalty;
  return round(clamp(raw * cuePriority(item.cue), 0, 10), 2);
}

function worstSegment(item){
  return (item.segmentRoleComparisons || [])
    .slice()
    .sort((a, b) => (+b.auroraSegmentRisk10 || 0) - (+a.auroraSegmentRisk10 || 0) || String(a.role).localeCompare(String(b.role)))[0] || null;
}

function recommendation(item){
  const status = item.comparisons?.referenceWindowStatus || '';
  const cue = item.cue || '';
  const comparison = item.comparisons?.auroraVsReferenceActive || {};
  const segment = worstSegment(item);
  const segmentScore = (item.referenceSegmentCandidates || [])[0]?.score;
  if(/broad-reference-window/.test(status)){
    return 'Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring.';
  }
  if(segment && +segment.auroraSegmentRisk10 >= 4.5){
    return `Tune the ${segment.role} segment first: ${segment.interpretation}`;
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

function referenceWindowKey(set){
  if(!set?.referenceClip) return '';
  const win = set.referenceWindow || null;
  if(!win) return `${set.referenceClip}::full`;
  const start = Number.isFinite(+win.startSeconds) ? (+win.startSeconds).toFixed(3) : 'na';
  const end = Number.isFinite(+win.endSeconds) ? (+win.endSeconds).toFixed(3) : 'na';
  return `${set.referenceClip}::${start}-${end}`;
}

function hasDistinctReferenceWindow(set){
  const win = set?.referenceWindow;
  return Number.isFinite(+win?.startSeconds) && Number.isFinite(+win?.endSeconds) && +win.endSeconds > +win.startSeconds;
}

function sharedReferenceRiskCount(set, context){
  const clipCount = context.referenceClipCounts?.get(set?.referenceClip || '') || 0;
  if(clipCount <= 1) return 0;
  const windowCount = context.referenceWindowCounts?.get(referenceWindowKey(set)) || 0;
  return hasDistinctReferenceWindow(set) && windowCount <= 1 ? 1 : clipCount;
}

function semanticCueScore({ item, guideContext, comparisonSet, eventMatrix, sharedReferenceClipCount }){
  const semantic = EVENT_SEMANTICS[item.cue] || {
    class: item.focus ? 'documented-cue' : 'uncategorized-cue',
    playerMeaning: item.focus || 'Cue is compared acoustically, but no explicit player/designer meaning has been promoted yet.',
    distinctFrom: []
  };
  const statusText = [
    item.comparisons?.referenceWindowStatus,
    comparisonSet?.mappingStatus,
    eventMatrix?.status,
    eventMatrix?.note
  ].filter(Boolean).join(' ').toLowerCase();
  const baseCoverage = CRITICAL_CUES.has(item.cue) ? 1 : .85;
  const confidence = confidenceValue(comparisonSet?.mappingConfidence);
  const dedicatedSlot = guideContext?.preview?.cue === item.cue ? 1 : .65;
  const referenceWindow = comparisonSet?.referenceWindow ? 1 : (/direct-cue-comparison/.test(item.comparisons?.referenceWindowStatus || '') ? .82 : .72);
  const sharedReferencePenalty = Math.min(.28, Math.max(0, sharedReferenceClipCount - 1) * .1);
  const languagePenalty = [
    /shared/.test(statusText) ? .12 : 0,
    /too broad/.test(statusText) ? .12 : 0,
    /fuzzy/.test(statusText) ? .1 : 0,
    /compressed/.test(statusText) ? .1 : 0,
    /under review/.test(statusText) ? .07 : 0
  ].reduce((sum, value) => sum + value, 0);
  const raw = (
    .28 * baseCoverage
    + .24 * confidence
    + .2 * dedicatedSlot
    + .18 * referenceWindow
    + .1 * clamp(1 - sharedReferencePenalty - languagePenalty, 0, 1)
  );
  return {
    semanticClass: semantic.class,
    playerMeaning: semantic.playerMeaning,
    distinctFrom: semantic.distinctFrom,
    mappingStatus: comparisonSet?.mappingStatus || eventMatrix?.status || 'no mapping status documented',
    mappingConfidence: comparisonSet?.mappingConfidence || 'unknown',
    sharedReferenceClipCount,
    semanticScore10: round(clamp(raw * 10, 1, 10), 1),
    semanticRecommendation: semanticRecommendation(item, semantic, comparisonSet, eventMatrix, sharedReferenceClipCount)
  };
}

function semanticRecommendation(item, semantic, comparisonSet, eventMatrix, sharedReferenceClipCount){
  const statusText = [comparisonSet?.mappingStatus, eventMatrix?.note].filter(Boolean).join(' ').toLowerCase();
  if(sharedReferenceClipCount > 1 && /hit|boom|shot/i.test(item.cue || '')){
    return `Split or label the shared reference source so ${item.cue} remains distinct from ${semantic.distinctFrom.join(', ') || 'adjacent cues'}.`;
  }
  if(/too broad|shared|fuzzy|compressed/.test(statusText)){
    return 'Promote a narrower or cleaner semantic mapping before judging runtime synthesis quality.';
  }
  if(!comparisonSet?.referenceWindow && /direct-cue-comparison/.test(item.comparisons?.referenceWindowStatus || '')){
    return 'Add a candidate reference subwindow so this direct comparison can be scored at finer resolution.';
  }
  return 'Keep semantic mapping as a guardrail while acoustic/timing gaps are tuned.';
}

function rowForItem(item, context = {}){
  const comparison = item.comparisons?.auroraVsReferenceActive || {};
  const bestSegment = (item.referenceSegmentCandidates || [])[0] || null;
  const segment = worstSegment(item);
  const segmentationSummary = item.referenceSegmentation?.summary || {};
  const comparisonSet = context.comparisonByCue?.get(item.cue) || null;
  const sharedReferenceClipCount = context.referenceClipCounts?.get(comparisonSet?.referenceClip || '') || 0;
  const sharedReferenceWindowCount = context.referenceWindowCounts?.get(referenceWindowKey(comparisonSet)) || 0;
  const semanticSharedReferenceCount = sharedReferenceRiskCount(comparisonSet, context);
  const semantics = semanticCueScore({
    item,
    guideContext: context.guideByCue?.get(item.cue)?.[0] || null,
    comparisonSet,
    eventMatrix: context.eventByEntryId?.get(comparisonSet?.entryId) || null,
    sharedReferenceClipCount: semanticSharedReferenceCount
  });
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
    segmentRoleComparisonCount: (item.segmentRoleComparisons || []).length,
    worstSegmentRole: segment?.role || null,
    worstSegmentRisk10: segment ? round(segment.auroraSegmentRisk10, 2) : null,
    worstSegmentInterpretation: segment?.interpretation || null,
    worstSegmentDelta: segment?.auroraVsReference || null,
    referenceSegmentationStatus: segmentationSummary.status || null,
    referenceSegmentationConfidence: segmentationSummary.confidence || comparisonSet?.mappingConfidence || 'unknown',
    referenceSegmentationResolution: segmentationSummary.resolution || (
      (item.segmentRoleComparisons || []).length
        ? 'auto energy segmentation with role-by-role comparison'
        : 'whole-active-window comparison'
    ),
    referenceSegmentationSource: segmentationSummary.source || null,
    ...semantics,
    sourceReferenceClipCount: sharedReferenceClipCount,
    sourceReferenceWindowCount: sharedReferenceWindowCount,
    hasDistinctReferenceWindow: hasDistinctReferenceWindow(comparisonSet),
    recommendation: recommendation(item)
  };
}

function weightedAverage(rows, valueKey){
  let sum = 0;
  let weight = 0;
  for(const row of rows){
    const value = +row[valueKey];
    if(!Number.isFinite(value)) continue;
    const rowWeight = CRITICAL_CUES.has(row.cue) ? 1.3 : .85;
    sum += value * rowWeight;
    weight += rowWeight;
  }
  return weight ? round(sum / weight, 2) : null;
}

function candidateComparison(rows, baseline){
  if(!baseline?.report?.comparedCueRisks?.length) return null;
  const previousByCue = new Map(baseline.report.comparedCueRisks.map(row => [row.cue, row]));
  const cueDeltas = rows
    .map(row => {
      const previous = previousByCue.get(row.cue);
      if(!previous) return null;
      return {
        cue: row.cue,
        label: row.label,
        gapRiskDelta10: round((+row.gapRisk10 || 0) - (+previous.gapRisk10 || 0), 2),
        worstSegmentRiskDelta10: Number.isFinite(+row.worstSegmentRisk10) && Number.isFinite(+previous.worstSegmentRisk10)
          ? round(+row.worstSegmentRisk10 - +previous.worstSegmentRisk10, 2)
          : null,
        durationGapDeltaSeconds: Number.isFinite(+row.durationGapSeconds) && Number.isFinite(+previous.durationGapSeconds)
          ? round(+row.durationGapSeconds - +previous.durationGapSeconds, 3)
          : null,
        centroidGapDeltaHz: Number.isFinite(+row.centroidGapHz) && Number.isFinite(+previous.centroidGapHz)
          ? round(+row.centroidGapHz - +previous.centroidGapHz, 1)
          : null,
        currentGapRisk10: row.gapRisk10,
        previousGapRisk10: previous.gapRisk10,
        currentWorstSegmentRisk10: row.worstSegmentRisk10,
        previousWorstSegmentRisk10: previous.worstSegmentRisk10
      };
    })
    .filter(Boolean);
  const bySegmentMagnitude = cueDeltas
    .filter(row => Number.isFinite(+row.worstSegmentRiskDelta10))
    .slice()
    .sort((a, b) => Math.abs(+b.worstSegmentRiskDelta10) - Math.abs(+a.worstSegmentRiskDelta10));
  const improvements = cueDeltas
    .filter(row => (+row.gapRiskDelta10 < 0) || (+row.worstSegmentRiskDelta10 < 0))
    .sort((a, b) => (+a.worstSegmentRiskDelta10 || +a.gapRiskDelta10 || 0) - (+b.worstSegmentRiskDelta10 || +b.gapRiskDelta10 || 0));
  const regressions = cueDeltas
    .filter(row => (+row.gapRiskDelta10 > 0) || (+row.worstSegmentRiskDelta10 > 0))
    .sort((a, b) => (+b.worstSegmentRiskDelta10 || +b.gapRiskDelta10 || 0) - (+a.worstSegmentRiskDelta10 || +a.gapRiskDelta10 || 0));
  const currentAverageWorst = rows.filter(row => Number.isFinite(+row.worstSegmentRisk10));
  const previousAverageWorst = (baseline.report.comparedCueRisks || []).filter(row => Number.isFinite(+row.worstSegmentRisk10));
  const currentAverageWorstSegmentRisk10 = currentAverageWorst.length
    ? round(currentAverageWorst.reduce((sum, row) => sum + +row.worstSegmentRisk10, 0) / currentAverageWorst.length, 2)
    : null;
  const previousAverageWorstSegmentRisk10 = previousAverageWorst.length
    ? round(previousAverageWorst.reduce((sum, row) => sum + +row.worstSegmentRisk10, 0) / previousAverageWorst.length, 2)
    : null;
  return {
    baseline: rel(baseline.path),
    baselineGeneratedAt: baseline.report.generatedAt || '',
    cueDeltaCount: cueDeltas.length,
    averageWorstSegmentRiskDelta10: Number.isFinite(+currentAverageWorstSegmentRisk10) && Number.isFinite(+previousAverageWorstSegmentRisk10)
      ? round(currentAverageWorstSegmentRisk10 - previousAverageWorstSegmentRisk10, 2)
      : null,
    highestRiskCueChanged: (baseline.report.summary?.highestRiskCue || '') !== (rows[0]?.cue || ''),
    previousHighestRiskCue: baseline.report.summary?.highestRiskCue || '',
    currentHighestRiskCue: rows[0]?.cue || '',
    strongestImprovement: improvements[0] || null,
    strongestRegression: regressions[0] || null,
    largestSegmentMovement: bySegmentMagnitude[0] || null,
    cueDeltas
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
    `- Segment role comparisons: ${report.summary.segmentRoleComparisonCount}`,
    `- Average worst segment risk: ${report.summary.averageWorstSegmentRisk10}/10`,
    `- Semantic event score: ${report.summary.semanticAverageScore10}/10`,
    `- Low semantic cue rows: ${report.summary.lowSemanticCueCount}`,
    `- Semantic attention rows: ${report.summary.semanticAttentionCueCount}`,
    `- Shared-reference clip risks: ${report.summary.sharedReferenceClipRiskCount}`,
    `- Highest event-gap risk: ${report.summary.highestRiskCue} (${report.summary.highestRisk10}/10 risk)`,
    '',
    '## Candidate Value Read',
    ''
  ];
  if(report.previousComparison){
    const comparison = report.previousComparison;
    lines.push(
      `- Baseline report: \`${comparison.baseline}\``,
      `- Average worst segment risk delta: ${comparison.averageWorstSegmentRiskDelta10}/10`,
      `- Highest-risk cue changed: ${comparison.highestRiskCueChanged ? 'yes' : 'no'} (${comparison.previousHighestRiskCue || 'none'} -> ${comparison.currentHighestRiskCue || 'none'})`,
      `- Strongest improvement: ${comparison.strongestImprovement ? `${comparison.strongestImprovement.cue} (${comparison.strongestImprovement.worstSegmentRiskDelta10 ?? comparison.strongestImprovement.gapRiskDelta10})` : 'none'}`,
      `- Strongest regression: ${comparison.strongestRegression ? `${comparison.strongestRegression.cue} (+${comparison.strongestRegression.worstSegmentRiskDelta10 ?? comparison.strongestRegression.gapRiskDelta10})` : 'none'}`,
      '',
      '| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |',
      '| --- | ---: | ---: | ---: | ---: |'
    );
    comparison.cueDeltas
      .slice()
      .sort((a, b) => Math.abs(+b.worstSegmentRiskDelta10 || +b.gapRiskDelta10 || 0) - Math.abs(+a.worstSegmentRiskDelta10 || +a.gapRiskDelta10 || 0))
      .slice(0, 10)
      .forEach(item => {
        lines.push(`| ${item.cue} | ${item.gapRiskDelta10} | ${item.worstSegmentRiskDelta10 ?? 'n/a'} | ${item.durationGapDeltaSeconds ?? 'n/a'}s | ${item.centroidGapDeltaHz ?? 'n/a'} Hz |`);
      });
  }else{
    lines.push('No baseline report was available. Set `AURORA_AUDIO_EVENT_GAP_BASELINE` to compare a candidate run against a known target.');
  }
  lines.push(
    '',
    '## Semantic Event Read',
    '',
    'This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.',
    '',
    '| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |',
    '| ---: | --- | --- | ---: | --- | ---: | --- | --- |'
  );
  report.semanticAttentionRows.slice(0, 12).forEach((item, index) => {
    lines.push(`| ${index + 1} | ${item.cue} | ${item.semanticClass} | ${item.semanticScore10} | ${item.mappingConfidence} | ${item.sharedReferenceClipCount} | ${item.playerMeaning} | ${item.semanticRecommendation} |`);
  });
  if(!report.semanticAttentionRows.length) lines.push('| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |');
  lines.push(
    '',
    '## Highest-Risk Compared Cues',
    '',
    '| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |',
    '| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |'
  );
  report.comparedCueRisks.slice(0, 12).forEach((item, index) => {
    lines.push(`| ${index + 1} | ${item.cue} | ${item.label} | ${item.gapRisk10} | ${item.referenceSegmentationConfidence || 'unknown'} | ${item.referenceSegmentationStatus || item.status} | ${item.durationGapSeconds}s | ${item.centroidGapHz} Hz | ${item.worstSegmentRole || 'n/a'} | ${item.worstSegmentRisk10 ?? 'n/a'} | ${item.recommendation} |`);
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
  const audioContextById = new Map((guide.audioContexts || []).map(entry => [entry.id, entry]));
  const comparisonByCue = new Map();
  const referenceClipCounts = new Map();
  const referenceWindowCounts = new Map();
  for(const set of guide.comparisonSets || []){
    const ctx = audioContextById.get(set.entryId);
    const cue = ctx?.preview?.cue || ctx?.cue;
    if(cue) comparisonByCue.set(cue, set);
    if(set.referenceClip) referenceClipCounts.set(set.referenceClip, (referenceClipCounts.get(set.referenceClip) || 0) + 1);
    const windowKey = referenceWindowKey(set);
    if(windowKey) referenceWindowCounts.set(windowKey, (referenceWindowCounts.get(windowKey) || 0) + 1);
  }
  const eventByEntryId = new Map((guide.audioEventMatrix || []).filter(entry => entry.entryId).map(entry => [entry.entryId, entry]));
  const rowContext = {
    guideByCue: new Map((guide.audioContexts || []).reduce((pairs, ctx) => {
      const cue = ctx.preview?.cue || ctx.cue;
      if(cue) pairs.push([cue, [ctx]]);
      return pairs;
    }, [])),
    comparisonByCue,
    eventByEntryId,
    referenceClipCounts,
    referenceWindowCounts
  };
  const comparedCueRisks = (metrics.items || []).map(item => rowForItem(item, rowContext))
    .sort((a, b) => b.gapRisk10 - a.gapRisk10 || String(a.cue).localeCompare(String(b.cue)));
  const previousComparison = candidateComparison(comparedCueRisks, baselineReport());
  const segmentComparedRows = comparedCueRisks.filter(item => Number.isFinite(+item.worstSegmentRisk10));
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
  const semanticAverageScore10 = weightedAverage(comparedCueRisks, 'semanticScore10');
  const lowSemanticRows = comparedCueRisks
    .filter(item => item.semanticScore10 < 8)
    .sort((a, b) => a.semanticScore10 - b.semanticScore10 || b.gapRisk10 - a.gapRisk10);
  const semanticAttentionRows = comparedCueRisks
    .filter(item => item.semanticScore10 < 8.8 || item.sharedReferenceClipCount > 1)
    .sort((a, b) => {
      const sharedDelta = (b.sharedReferenceClipCount > 1 ? 1 : 0) - (a.sharedReferenceClipCount > 1 ? 1 : 0);
      return sharedDelta || a.semanticScore10 - b.semanticScore10 || b.gapRisk10 - a.gapRisk10;
    });
  const highest = comparedCueRisks[0] || {};
  const lowestSemantic = lowSemanticRows[0] || {};
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const runClock = generatedAt.slice(11, 19).replace(/:/g, '');
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}-${runClock}`);
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
      segmentRoleComparisonCount: comparedCueRisks.reduce((sum, item) => sum + (+item.segmentRoleComparisonCount || 0), 0),
      averageWorstSegmentRisk10: segmentComparedRows.length
        ? round(segmentComparedRows.reduce((sum, item) => sum + (+item.worstSegmentRisk10 || 0), 0) / segmentComparedRows.length, 2)
        : null,
      highestSegmentRiskCue: segmentComparedRows.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.cue || '',
      highestSegmentRiskRole: segmentComparedRows.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentRole || '',
      semanticAverageScore10,
      lowSemanticCueCount: lowSemanticRows.length,
      semanticAttentionCueCount: semanticAttentionRows.length,
      distinctReferenceWindowCueCount: comparedCueRisks.filter(item => item.hasDistinctReferenceWindow).length,
      lowestSemanticCue: lowestSemantic.cue || '',
      lowestSemanticLabel: lowestSemantic.label || '',
      lowestSemanticScore10: lowestSemantic.semanticScore10 ?? null,
      sharedReferenceClipRiskCount: comparedCueRisks.filter(item => item.sharedReferenceClipCount > 1).length,
      sharedSourceClipCueCount: comparedCueRisks.filter(item => item.sourceReferenceClipCount > 1).length,
      highestRiskCue: highest.cue || '',
      highestRiskLabel: highest.label || '',
      highestRisk10: highest.gapRisk10 ?? null
    },
    comparedCueRisks,
    previousComparison,
    lowSemanticCueRows: lowSemanticRows,
    semanticAttentionRows,
    missingCriticalComparisonCues,
    nextStep: semanticAttentionRows.some(item => item.sharedReferenceClipCount > 1 && /hit|boom|shot/i.test(item.cue || ''))
      ? 'Split or further label the shared shot/impact/explosion reference mappings first, especially playerShot/enemyShot/bossHit and enemyHit/enemyBoom, then rerun the audio comparison and semantic event-gap analysis.'
      : missingCriticalComparisonCues.length
      ? 'Add measured comparison coverage for impact/explosion cues first: enemyHit, bossHit, enemyBoom, and bossBoom. Then rerun the audio theme comparison and this event-gap analysis.'
      : broadReferenceWindowCount
        ? 'Promote narrower reference subwindows for the broadest remaining cues, then tune the highest-risk runtime cue.'
        : segmentComparedRows.some(item => +item.worstSegmentRisk10 >= 4.5)
          ? `Tune the highest segment-level gap next: ${segmentComparedRows.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0].cue} ${segmentComparedRows.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0].worstSegmentRole}. Rerun audio comparison and event-gap analysis after the change.`
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

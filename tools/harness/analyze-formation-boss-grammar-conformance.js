#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-level-expansion-cycle');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-boss-grammar-conformance');
const PROFILE_PATH = path.join(ROOT, 'tools', 'harness', 'reference-profiles', 'formation-boss-grammar-conformance.json');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
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

function collectReports(root, name = 'report.json'){
  const out = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === name) out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(relRoot){
  const reports = collectReports(path.join(ROOT, relRoot));
  return reports.length ? reports[reports.length - 1] : null;
}

function stageBand(stage, challenge){
  if(challenge) return 'challenge';
  if(stage <= 2) return 'early';
  if(stage < 10) return 'mid';
  return 'late';
}

function eventTime(event){
  return Number.isFinite(+event.time_s) ? +event.time_s : null;
}

function firstTime(events, predicate){
  const event = events.find(predicate);
  return event ? eventTime(event) : null;
}

function timingBandScore(firstBossTime, band, profile){
  if(firstBossTime == null) return 0;
  const bounds = profile.thresholds.bossTimingBandsSeconds[band] || profile.thresholds.bossTimingBandsSeconds.mid;
  const [min, max] = bounds;
  if(firstBossTime >= min && firstBossTime <= max) return 1;
  const tolerance = Math.max(3, (max - min) * 0.35);
  if(firstBossTime < min) return clamp(1 - ((min - firstBossTime) / tolerance));
  return clamp(1 - ((firstBossTime - max) / tolerance));
}

function loadWindow(dir){
  const id = path.basename(dir);
  const manifest = readJson(path.join(dir, 'source-manifest.json'));
  const trace = readJson(path.join(dir, 'trace', 'trace.json'));
  const eventLog = readJson(path.join(dir, 'events', 'reference-events.json'));
  const events = eventLog.events || [];
  const samples = trace.samples || [];
  const stage = manifest.config?.stage || trace.summary?.final_stage || null;
  const challenge = Boolean(manifest.config?.challenge || trace.summary?.final_challenge);
  const band = stageBand(stage || 1, challenge);
  const attacks = events.filter(event => event.runtime_type === 'enemy_attack_start');
  const bossEvents = events.filter(event => event.entity_family === 'boss');
  const bossAttacks = attacks.filter(event => event.entity_family === 'boss');
  const escortStarts = events.filter(event => event.event_family === 'escort_dive_start');
  const familyCounts = {};
  for(const event of events){
    const key = event.entity_family || event.event_family || 'unknown';
    familyCounts[key] = (familyCounts[key] || 0) + 1;
  }
  const formationCounts = samples.map(sample => +sample.formation_active).filter(Number.isFinite);
  const challengeCounts = samples.map(sample => +(sample.challenge_enemies ?? sample.challengeEnemyCount)).filter(Number.isFinite);
  const laneSet = new Set(events.map(event => event.position_hint?.player_lane).filter(Number.isFinite));
  const firstBossAttackTime = firstTime(events, event => event.runtime_type === 'enemy_attack_start' && event.entity_family === 'boss');
  const firstBossPresenceTime = firstTime(events, event => event.entity_family === 'boss');
  const firstEscortTime = firstTime(events, event => event.event_family === 'escort_dive_start');
  const firstChallengePathTime = firstTime(events, event => event.event_family === 'challenge_enemy_path');
  const firstChallengeHitTime = firstTime(events, event => event.event_family === 'challenge_enemy_hit');
  const eventFamilies = new Set([
    ...(eventLog.event_family_coverage || []).filter(entry => entry.observed).map(entry => entry.family),
    ...events.map(event => event.event_family).filter(Boolean)
  ]);
  return {
    id,
    scenario: manifest.scenario,
    stage,
    band,
    challenge,
    durationS: trace.duration_s || manifest.duration_s || samples.at(-1)?.t || 0,
    eventCount: events.length,
    attackCount: attacks.length,
    bossEventCount: bossEvents.length,
    bossAttackCount: bossAttacks.length,
    escortStartCount: escortStarts.length,
    bossAndEscortWindow: bossEvents.length > 0 && escortStarts.length > 0,
    firstBossAttackTime,
    firstBossPresenceTime,
    firstEscortTime,
    firstChallengePathTime,
    firstChallengeHitTime,
    lanesTouched: laneSet.size,
    familyCounts,
    eventFamilies: [...eventFamilies].sort(),
    formation: {
      observed: formationCounts.length > 0,
      start: formationCounts.length ? formationCounts[0] : null,
      end: formationCounts.length ? formationCounts.at(-1) : null,
      min: formationCounts.length ? Math.min(...formationCounts) : null,
      max: formationCounts.length ? Math.max(...formationCounts) : null,
      mean: round(average(formationCounts)),
      hasSettleProxy: formationCounts.length > 1 && Math.max(...formationCounts) > 0
    },
    challengePattern: {
      maxEnemies: challengeCounts.length ? Math.max(...challengeCounts) : 0,
      familyVariety: Object.keys(familyCounts).filter(key => !['player_shot', 'stage_spawn'].includes(key)).length,
      requiredFamiliesPresent: ['challenge_wave_start', 'challenge_enemy_path', 'challenge_enemy_hit', 'challenge_result']
        .filter(family => eventFamilies.has(family)).length
    },
    measurementDebt: {
      pathShapeMotionHints: events.filter(event => event.motion_hint).length,
      formationSlotCoordinates: events.filter(event => Number.isFinite(event.position_hint?.source_column) || Number.isFinite(event.position_hint?.source_lane)).length
    }
  };
}

function weightedScore(metrics, profile){
  const weights = Object.fromEntries(profile.metrics.map(metric => [metric.id, metric.weight]));
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const score = Object.entries(metrics).reduce((sum, [id, metric]) => {
    return sum + ((weights[id] || 0) * clamp((metric.score10 || 0) / 10));
  }, 0) / totalWeight;
  return round(score * 10, 1);
}

function buildReport(){
  const profile = readJson(PROFILE_PATH);
  ensureDir(OUT_ROOT);
  const windowDirs = fs.existsSync(SOURCE_ROOT)
    ? fs.readdirSync(SOURCE_ROOT, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(SOURCE_ROOT, entry.name))
      .filter(dir => fs.existsSync(path.join(dir, 'source-manifest.json')))
      .filter(dir => fs.existsSync(path.join(dir, 'trace', 'trace.json')))
      .filter(dir => fs.existsSync(path.join(dir, 'events', 'reference-events.json')))
      .sort()
    : [];
  const windows = windowDirs.map(loadWindow);
  const regular = windows.filter(window => !window.challenge);
  const challenge = windows.filter(window => window.challenge);
  const bossRegular = regular.filter(window => window.bossEventCount > 0 || window.bossAttackCount > 0);
  const bossTimingScores = bossRegular.map(window => timingBandScore(window.firstBossAttackTime ?? window.firstBossPresenceTime, window.band, profile));
  const bossEscortWindows = regular.filter(window => window.bossAndEscortWindow);
  const formationWindows = regular.filter(window => window.formation.hasSettleProxy);
  const pathHintCount = windows.reduce((sum, window) => sum + window.measurementDebt.pathShapeMotionHints, 0);
  const formationSlotHintCount = windows.reduce((sum, window) => sum + window.measurementDebt.formationSlotCoordinates, 0);
  const challengeRequiredAverage = average(challenge.map(window => window.challengePattern.requiredFamiliesPresent / 4));
  const challengeVarietyAverage = average(challenge.map(window => clamp(window.challengePattern.familyVariety / 4)));
  const challengeBossSignal = challenge.length ? challenge.filter(window => window.bossEventCount > 0).length / challenge.length : 0;
  const stageSignaturePath = latestReport('reference-artifacts/analyses/stage-signature-distance');
  const stageSignature = stageSignaturePath ? readJson(stageSignaturePath) : { summary: {} };
  const pathSlotPath = latestReport('reference-artifacts/analyses/formation-boss-path-slot-extraction');
  const pathSlot = pathSlotPath ? readJson(pathSlotPath) : { summary: {} };
  const pathFamilyPath = latestReport('reference-artifacts/analyses/formation-boss-path-family-comparison');
  const pathFamily = pathFamilyPath ? readJson(pathFamilyPath) : { summary: {} };
  const minRegularDistance = stageSignature.summary?.minRegularDistance || stageSignature.summary?.closestRegularPair?.distance || 0;
  const distinctPairRatio = stageSignature.summary?.distinctPairRatio || 0;
  const regularDistanceScore = 0.55 * clamp(minRegularDistance / profile.thresholds.targetMinimumRegularDistance)
    + 0.45 * clamp(distinctPairRatio);
  const pathSlotScore = Number.isFinite(+pathSlot.summary?.cappedPathSlotScore10)
    ? +pathSlot.summary.cappedPathSlotScore10
    : null;
  const pathFamilyScore = Number.isFinite(+pathFamily.summary?.score10)
    ? +pathFamily.summary.score10
    : null;
  const pathFamilyCapReason = pathFamily.summary?.referenceComparisonCapReason || null;
  const pathFamilyLabelSupport = pathFamily.summary?.referenceLabelSupport || {};
  const pathFamilyTrajectoryComparison = pathFamily.summary?.referenceTrajectoryComparison || {};
  const labelBackedPathFamilyReady = !!pathFamilyLabelSupport.labelBackedComparisonReady;
  const runtimeSlotTrackCount = (pathSlot.summary?.regularSlotTracks || 0) + (pathSlot.summary?.challengeSlotTracks || 0);
  const runtimePathTrackCount = pathSlot.summary?.movingTracks || 0;
  const runtimeBossMovingTrackCount = pathSlot.summary?.bossMovingTracks || 0;
  const classifiedPathFamilyCount = pathFamily.summary?.classifiedTrackCount || 0;
  const expectedPathFamilyCoverage = pathFamily.summary?.expectedFamilyCoverage || 0;

  const metrics = {
    'boss-entry-timing': {
      id: 'boss-entry-timing',
      label: 'Boss entry timing',
      score10: round(10 * ((0.35 * clamp(bossRegular.length / Math.max(regular.length, 1))) + (0.65 * average(bossTimingScores))), 1),
      calculation: '35% regular-window boss presence plus 65% first boss timing fit against early/mid/late stage-band timing windows.',
      currentRead: `${bossRegular.length}/${regular.length} regular windows expose boss presence; mean timing fit ${round(average(bossTimingScores), 3)}.`,
      success: profile.metrics.find(metric => metric.id === 'boss-entry-timing').success
    },
    'boss-escort-composition': {
      id: 'boss-escort-composition',
      label: 'Boss escort composition',
      score10: round(10 * ((0.6 * clamp(bossEscortWindows.length / profile.thresholds.targetEscortBossWindows)) + (0.4 * clamp(regular.filter(window => window.escortStartCount > 0).length / Math.max(regular.length, 1)))) , 1),
      calculation: '60% boss-plus-escort windows versus target count plus 40% regular-window escort-start coverage.',
      currentRead: `${bossEscortWindows.length} regular windows contain both boss and escort signals; ${regular.filter(window => window.escortStartCount > 0).length}/${regular.length} regular windows have escort starts.`,
      success: profile.metrics.find(metric => metric.id === 'boss-escort-composition').success
    },
    'formation-settle-evidence': {
      id: 'formation-settle-evidence',
      label: 'Formation settle evidence',
      score10: round(10 * ((0.55 * clamp(formationWindows.length / Math.max(regular.length, 1))) + (0.45 * clamp(runtimeSlotTrackCount / Math.max(regular.length * 20, 1)))) , 1),
      calculation: '55% regular-window formation-active settle proxy plus 45% runtime rack/challenge slot-coordinate extraction coverage.',
      currentRead: `${formationWindows.length}/${regular.length} regular windows expose formation-active counts; path-slot extraction found ${runtimeSlotTrackCount} slot tracks.`,
      success: profile.metrics.find(metric => metric.id === 'formation-settle-evidence').success
    },
    'challenge-pattern-identity': {
      id: 'challenge-pattern-identity',
      label: 'Challenge-stage pattern identity',
      score10: round(10 * ((0.3 * clamp(challenge.length / profile.thresholds.targetChallengeWindows)) + (0.35 * challengeRequiredAverage) + (0.2 * challengeVarietyAverage) + (0.15 * challengeBossSignal)), 1),
      calculation: 'Challenge window coverage, required challenge event-family presence, enemy-family variety, and boss signal.',
      currentRead: `${challenge.length}/${profile.thresholds.targetChallengeWindows} challenge windows; required-family average ${round(challengeRequiredAverage, 3)}; boss signal ${round(challengeBossSignal, 3)}.`,
      success: profile.metrics.find(metric => metric.id === 'challenge-pattern-identity').success
    },
    'stage-variation': {
      id: 'stage-variation',
      label: 'Stage-to-stage formation variation',
      score10: round(10 * regularDistanceScore, 1),
      calculation: '55% closest regular-stage signature distance against minimum target plus 45% distinct-pair ratio.',
      currentRead: `Minimum regular distance ${round(minRegularDistance)}; distinct pair ratio ${round(distinctPairRatio)}.`,
      success: profile.metrics.find(metric => metric.id === 'stage-variation').success
    },
    'path-shape-precision': {
      id: 'path-shape-precision',
      label: 'Path shape and set-formation precision',
      score10: pathFamilyScore != null
        ? round(pathFamilyScore, 1)
        : pathSlotScore == null
        ? round(10 * ((0.55 * clamp(pathHintCount / Math.max(windows.length, 1))) + (0.45 * clamp(formationSlotHintCount / Math.max(windows.length, 1)))) , 1)
        : round(pathSlotScore, 1),
      calculation: pathFamilyScore != null
        ? (labelBackedPathFamilyReady
          ? 'Media-backed path-family comparison score from extracted runtime trajectories and accepted Galaga contact-sheet labels, capped below future tracked reference-trajectory comparison.'
          : 'Heuristic path-family comparison score from extracted runtime trajectories, capped until frame-labeled Galaga reference path families are available.')
        : pathSlotScore == null
        ? 'Direct motion-hint and formation slot-coordinate evidence coverage. This intentionally remains low until frame-level path extraction is promoted.'
        : 'Runtime path/slot extraction score, capped at the current no-reference-comparison ceiling so extraction coverage does not masquerade as arcade-perfect path fidelity.',
      currentRead: pathFamilyScore != null
        ? (labelBackedPathFamilyReady
          ? `${classifiedPathFamilyCount} tracks classified into path families; expected family coverage ${round(expectedPathFamilyCoverage)}; accepted Galaga labels ${pathFamilyLabelSupport.acceptedRegularEntryCount || 0} regular / ${pathFamilyLabelSupport.acceptedChallengeEntryCount || 0} challenge; trajectory-vector/rack score ${round(pathFamilyTrajectoryComparison.score10, 1)}/10 (${pathFamilyTrajectoryComparison.status || 'not-run'}); cap ${pathFamilyScore}/10 (${pathFamilyCapReason}).`
          : `${classifiedPathFamilyCount} tracks classified into path families; expected family coverage ${round(expectedPathFamilyCoverage)}; capped score ${pathFamilyScore}/10 until direct reference labels land.`)
        : pathSlotScore == null
        ? `${pathHintCount} motion hints and ${formationSlotHintCount} formation slot hints across ${windows.length} windows.`
        : `${runtimePathTrackCount} moving tracks, ${runtimeBossMovingTrackCount} moving boss tracks, and ${runtimeSlotTrackCount} slot tracks; capped score ${pathSlotScore}/10 until reference path comparison lands.`,
      success: profile.metrics.find(metric => metric.id === 'path-shape-precision').success
    }
  };
  const score10 = weightedScore(metrics, profile);
  const weakestMetric = Object.values(metrics).reduce((worst, metric) => metric.score10 < worst.score10 ? metric : worst, Object.values(metrics)[0]);
  const strongestMetric = Object.values(metrics).reduce((best, metric) => metric.score10 > best.score10 ? metric : best, Object.values(metrics)[0]);
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    artifactType: 'formation-boss-grammar-conformance',
    profile: path.relative(ROOT, PROFILE_PATH),
    sourceRoot: path.relative(ROOT, SOURCE_ROOT),
    score10,
    summary: {
      score10,
      windowCount: windows.length,
      regularWindowCount: regular.length,
      challengeWindowCount: challenge.length,
      bossRegularWindowCount: bossRegular.length,
      bossEscortWindowCount: bossEscortWindows.length,
      formationSettleProxyWindowCount: formationWindows.length,
      pathHintCount,
      formationSlotHintCount,
      pathSlotExtractionScore10: pathSlot.summary?.extractionScore10 ?? null,
      cappedPathSlotScore10: pathSlot.summary?.cappedPathSlotScore10 ?? null,
      runtimePathTrackCount,
      runtimeSlotTrackCount,
      runtimeBossMovingTrackCount,
      pathFamilyScore10: pathFamily.summary?.score10 ?? null,
      pathFamilyComparisonConfidence: pathFamily.summary?.comparisonConfidence ?? null,
      pathFamilyReferenceCapReason: pathFamilyCapReason,
      pathFamilyReferenceLabelSupport: pathFamilyLabelSupport,
      pathFamilyReferenceTrajectoryComparison: pathFamilyTrajectoryComparison,
      classifiedPathFamilyCount,
      expectedPathFamilyCoverage,
      weakestMetric,
      strongestMetric,
      topProblem: weakestMetric.id === 'path-shape-precision'
        ? (labelBackedPathFamilyReady
          ? 'Boss/escort path-shape precision now has media-backed Galaga path-family labels; the next cap is tracked reference trajectory and rack-slot comparison.'
          : 'Boss/escort path-shape precision is still capped because the scorer has heuristic runtime path families before it has frame-labeled Galaga reference-family comparison.')
        : `${weakestMetric.label} is the largest measured gap in the current evidence set.`,
      strategy: 'Promote boss/escort/challenge path traces, formation slot coordinates, and stage-family entry labels into the ingestion corpus, then use this scorer to rank stage scripts and runtime changes.',
      successMeasure: 'Raise this family above 8.0/10 with path-shape precision above 5.0/10, minimum regular-stage signature distance above 0.16, and at least two challenge windows with distinct pattern identity.'
    },
    metrics: Object.values(metrics),
    windows,
    sourceReports: {
      stageSignature: stageSignaturePath ? path.relative(ROOT, stageSignaturePath) : null,
      pathSlotExtraction: pathSlotPath ? path.relative(ROOT, pathSlotPath) : null,
      pathFamilyComparison: pathFamilyPath ? path.relative(ROOT, pathFamilyPath) : null
    }
  };
  writeJson(path.join(outDir, 'report.json'), report);
  const lines = [
    '# Boss Entry And Formation Grammar Conformance',
    '',
    'This artifact promotes boss entry, escort composition, set-formation evidence, and challenge-stage pattern identity into a measured conformance family.',
    '',
    `- Score: ${score10}/10`,
    `- Windows: ${windows.length}`,
    `- Regular windows: ${regular.length}`,
    `- Challenge windows: ${challenge.length}`,
    `- Boss regular windows: ${bossRegular.length}`,
    `- Boss + escort windows: ${bossEscortWindows.length}`,
    `- Weakest metric: ${weakestMetric.label} (${weakestMetric.score10}/10)`,
    `- Strongest metric: ${strongestMetric.label} (${strongestMetric.score10}/10)`,
    '',
    '## Problem / Strategy / Success',
    '',
    `- Problem: ${report.summary.topProblem}`,
    `- Strategy: ${report.summary.strategy}`,
    `- Success: ${report.summary.successMeasure}`,
    '',
    '## Metrics',
    '',
    '| Metric | Score | Current Read | Calculation |',
    '| --- | ---: | --- | --- |'
  ];
  for(const metric of report.metrics){
    lines.push(`| ${metric.label} | ${metric.score10}/10 | ${metric.currentRead} | ${metric.calculation} |`);
  }
  lines.push('');
  lines.push('## Windows');
  lines.push('');
  lines.push('| Window | Stage | Band | Challenge | Boss events | Escorts | First boss | Formation proxy |');
  lines.push('| --- | ---: | --- | --- | ---: | ---: | ---: | --- |');
  for(const window of windows){
    lines.push(`| ${window.id} | ${window.stage ?? ''} | ${window.band} | ${window.challenge ? 'yes' : 'no'} | ${window.bossEventCount} | ${window.escortStartCount} | ${window.firstBossAttackTime ?? window.firstBossPresenceTime ?? ''} | ${window.formation.hasSettleProxy ? 'yes' : 'no'} |`);
  }
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  return { ok: true, outDir, score10, weakestMetric: weakestMetric.id };
}

if(require.main === module){
  console.log(JSON.stringify(buildReport(), null, 2));
}

module.exports = { buildReport };

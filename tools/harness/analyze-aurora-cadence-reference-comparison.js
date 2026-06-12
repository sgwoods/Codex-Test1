#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-cadence-reference-comparison');
const RISK_REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-cadence-perfect-route-risk', 'latest.json');
const TIMING_LIBRARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-reference-timing-library', 'event-families.json');
const GALAGA_CHALLENGE_TRACKS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
const GALAGA_CHALLENGE_VIDEO = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-video-reference', 'latest.json');
const GALAGA_PATH_LABELS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-path-reference-labels', 'latest.json');
const AURORA_GAME_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');

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

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
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

function round(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function sum(values){
  return values.reduce((total, value) => total + (+value || 0), 0);
}

function average(values){
  const nums = values.filter(value => Number.isFinite(+value));
  return nums.length ? nums.reduce((total, value) => total + value, 0) / nums.length : null;
}

function getAtPath(obj, parts){
  return parts.reduce((acc, part) => (acc == null ? null : acc[part]), obj);
}

function parseNumberList(raw){
  return String(raw || '')
    .split(',')
    .map(part => +part.trim())
    .filter(value => Number.isFinite(value));
}

function extractNumber(source, pattern, fallback = null){
  const match = source.match(pattern);
  return match ? +match[1] : fallback;
}

function extractConfiguredChallengeResults(){
  const source = fs.readFileSync(AURORA_GAME_PACK, 'utf8');
  const holdMatch = source.match(/resultHoldWindowByChallenge:Object\.freeze\(\[([^\]]+)\]\)/);
  const bannerMatch = source.match(/resultBannerWindowByChallenge:Object\.freeze\(\[([^\]]+)\]\)/);
  const blame = git(['blame', '-L', '141,146', '--', rel(AURORA_GAME_PACK)], '');
  const resultHoldWindowByChallenge = parseNumberList(holdMatch?.[1] || '');
  const resultBannerWindowByChallenge = parseNumberList(bannerMatch?.[1] || '');
  const nextStageWindow = extractNumber(source, /nextStageWindow:([0-9.]+)/);
  const resultHoldWindow = extractNumber(source, /resultHoldWindow:([0-9.]+)/);
  const resultBannerWindow = extractNumber(source, /resultBannerWindow:([0-9.]+)/);
  const resultCueDelay = extractNumber(source, /resultCueDelay:([0-9.]+)/);
  const nextCueLeadBeforeSpawn = extractNumber(source, /nextCueLeadBeforeSpawn:([0-9.]+)/);
  return {
    source: rel(AURORA_GAME_PACK),
    resultCueDelayS: resultCueDelay,
    resultHoldWindowS: resultHoldWindow,
    resultHoldWindowByChallengeS: resultHoldWindowByChallenge,
    resultBannerWindowS: resultBannerWindow,
    resultBannerWindowByChallengeS: resultBannerWindowByChallenge,
    nextStageWindowS: nextStageWindow,
    nextCueLeadBeforeSpawnS: nextCueLeadBeforeSpawn,
    challenge1ConfiguredClearToSpawnS: round((resultHoldWindowByChallenge[0] ?? resultHoldWindow ?? 0) + (nextStageWindow ?? 0), 3),
    lineage: blame
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
  };
}

function referenceTimingTargets(timingLibrary){
  const family = (timingLibrary.eventFamilies || [])
    .find(entry => entry.id === 'challenge-entry-results-perfect') || {};
  return {
    familyId: family.id || null,
    label: family.label || null,
    source: rel(TIMING_LIBRARY),
    resultCueAfterClearS: getAtPath(family, ['auroraCurrent', 'challengePerfect', 'resultCueAfterClear']),
    nextCueAfterClearS: getAtPath(family, ['auroraCurrent', 'challengePerfect', 'nextCueAfterClear']),
    spawnAfterClearS: getAtPath(family, ['auroraCurrent', 'challengePerfect', 'spawnAfterClear']),
    read: 'Preserved Galaga-aligned Aurora timing target from the reference timing library; it is the current durable timing baseline until superseded by a newer measured reference decision.'
  };
}

function summarizeChallengeTracks(trackReport){
  const challenges = trackReport.challenges || [];
  const rows = challenges.map(challenge => {
    const groups = challenge.targetGroups || [];
    const durations = groups.map(group => {
      const target = group.objectTrackTarget || {};
      return round((target.visibleEndS ?? 0) - (target.visibleStartS ?? 0), 3);
    }).filter(value => value != null);
    return {
      challengeNumber: challenge.challengeNumber,
      durationSeconds: challenge.durationSeconds,
      sampleFps: challenge.sampleFps,
      trackCount: challenge.trackRead?.trackCount ?? null,
      groupCount: challenge.trackRead?.groupCount ?? groups.length,
      averageGroupDurationS: round(average(durations), 3),
      groupStartS: groups.map(group => group.objectTrackTarget?.visibleStartS ?? null),
      groupEndS: groups.map(group => group.objectTrackTarget?.visibleEndS ?? null),
      averageConfidence: round(average(groups.map(group => group.confidence)), 3),
      families: challenge.sourceWindow?.family ? [challenge.sourceWindow.family] : [],
      read: `Reference Challenge ${challenge.challengeNumber} carries ${groups.length} tracked target group(s), which is the expected readable route unit for Aurora comparison.`
    };
  });
  return {
    source: rel(GALAGA_CHALLENGE_TRACKS),
    summary: trackReport.summary || {},
    challengeRows: rows,
    allChallengesHaveFiveGroups: rows.every(row => row.groupCount === 5),
    averageGroupCount: round(average(rows.map(row => row.groupCount)), 3),
    averageTrackCount: round(average(rows.map(row => row.trackCount)), 3),
    averageGroupConfidence: round(average(rows.map(row => row.averageConfidence)), 3),
    read: 'The Galaga reference side is already machine-readable enough to require five grouped, visible, routeable challenge arrivals before runtime tuning is trusted.'
  };
}

function summarizeChallengeVideo(videoReport){
  return {
    source: rel(GALAGA_CHALLENGE_VIDEO),
    commit: videoReport.commit || null,
    status: videoReport.summary?.status || null,
    primarySourceId: videoReport.summary?.primarySourceId || null,
    challengeWindowCount: videoReport.summary?.challengeWindowCount || 0,
    windows: (videoReport.primaryWindows || []).map(window => ({
      challengeNumber: window.challengeNumber,
      stageMarker: window.stageMarker,
      family: window.family,
      startS: window.start,
      durationS: window.duration,
      contactSheet: window.contactSheet,
      frameIndex: window.frameIndex,
      auroraContract: window.auroraContract
    })),
    read: 'The primary Galaga challenge reference is an all-perfect single-ship source with committed derived windows and contact sheets; raw video remains outside the repo.'
  };
}

function summarizePathLabels(labelReport){
  const accepted = labelReport.acceptedLabels || [];
  const challengeLabels = accepted.filter(label => label.kind === 'challengeEntry');
  return {
    source: rel(GALAGA_PATH_LABELS),
    summary: labelReport.summary || {},
    acceptedLabelCount: accepted.length,
    acceptedChallengeEntryCount: challengeLabels.length,
    directReferenceReady: !!labelReport.summary?.directReferenceReady,
    challengeCoverage: labelReport.summary?.challengeCoverage ?? null,
    confidenceScore: labelReport.summary?.confidenceScore ?? null,
    exampleChallengeLabels: challengeLabels.slice(0, 8).map(label => ({
      labelId: label.labelId,
      challengeNumber: label.challengeNumber,
      groupIndex: label.groupIndex,
      entrySide: label.entrySide,
      exitSide: label.exitSide,
      entityFamily: label.entityFamily,
      confidenceScore: label.confidenceScore,
      bonusOpportunity: label.bonusOpportunity
    })),
    read: 'Direct labels are available as source-backed comparison vectors, but the object-track artifact is the stronger current machine-readable source for all eight challenges.'
  };
}

function summarizeRisk(risk){
  const visibilityRows = risk.visibility?.summary || [];
  const persona = risk.personaTrajectory?.summary?.personas || {};
  const professional = persona.professional || {};
  const professionalRows = (risk.personaTrajectory?.rows || []).filter(row => row.persona === 'professional');
  const missingSpriteTotal = sum(visibilityRows.map(row => row.missingSpriteFullInside?.length || 0));
  const missingScoreWindowTotal = sum(visibilityRows.map(row => row.missingScoreWindowFullInside?.length || 0));
  const visibilityRiskRows = visibilityRows.filter(row => (row.missingSpriteFullInside?.length || 0) > 0);
  const worstVisibility = visibilityRows.slice().sort((a, b) => {
    return (a.spriteFullInsideCoverage ?? 1) - (b.spriteFullInsideCoverage ?? 1);
  })[0] || null;
  return {
    source: rel(RISK_REPORT),
    commit: risk.commit || null,
    generatedAt: risk.generatedAt || null,
    verdict: risk.verdict || {},
    transitionCadence: risk.transitionCadence || {},
    visibility: {
      stageCount: visibilityRows.length,
      riskStageCount: visibilityRiskRows.length,
      riskStages: visibilityRiskRows.map(row => row.stage),
      missingSpriteFullInsideTotal: missingSpriteTotal,
      missingScoreWindowFullInsideTotal: missingScoreWindowTotal,
      worstCoverage: worstVisibility ? {
        challengeNumber: worstVisibility.challengeNumber,
        stage: worstVisibility.stage,
        layoutId: worstVisibility.layoutId,
        spriteFullInsideCoverage: worstVisibility.spriteFullInsideCoverage,
        missingSpriteFullInside: worstVisibility.missingSpriteFullInside?.length || 0
      } : null,
      rows: visibilityRows.map(row => ({
        challengeNumber: row.challengeNumber,
        stage: row.stage,
        layoutId: row.layoutId,
        spriteFullInsideCoverage: row.spriteFullInsideCoverage,
        scoreWindowFullInsideCoverage: row.scoreWindowFullInsideCoverage,
        missingSpriteFullInside: row.missingSpriteFullInside?.length || 0,
        missingScoreWindowFullInside: row.missingScoreWindowFullInside?.length || 0,
        firstSpriteFullInsideP90S: row.firstSpriteFullInsideP90S,
        risk: row.risk
      }))
    },
    personaTrajectory: {
      professionalSummary: professional,
      professionalRows: professionalRows.map(row => ({
        challengeNumber: row.challengeNumber,
        stage: row.stage,
        seed: row.seed,
        cleared: row.cleared,
        hits: row.hits,
        total: row.total,
        hitRate: row.hitRate,
        targetRate: row.targetRate,
        perfect: row.perfect,
        noCombatGrammarPass: row.noCombatGrammarPass
      })),
      allPersonaNoCombatGrammarPass: risk.personaTrajectory?.summary?.noCombatGrammarPass ?? null
    }
  };
}

function buildCadenceComparison({ risk, configured, referenceTargets }){
  const measured = risk.transitionCadence?.challengeResult || {};
  const measuredClearToSpawn = measured.totalClearToSpawnS;
  const targetClearToSpawn = referenceTargets.spawnAfterClearS;
  const delta = measuredClearToSpawn != null && targetClearToSpawn != null
    ? round(measuredClearToSpawn - targetClearToSpawn, 3)
    : null;
  const ratio = measuredClearToSpawn != null && targetClearToSpawn
    ? round(measuredClearToSpawn / targetClearToSpawn, 3)
    : null;
  return {
    status: delta != null && delta > 0.8 ? 'challenge-result-cadence-regression-suspected' : 'challenge-result-cadence-needs-refresh',
    currentMeasured: {
      source: rel(RISK_REPORT),
      clearToSpawnS: measuredClearToSpawn ?? null,
      resultHoldWindowS: measured.resultHoldWindowS ?? null,
      challengeResultTransitionWindowS: measured.configuredWaitS ?? null,
      read: measured.read || null
    },
    currentConfigured: configured,
    preservedReferenceTarget: referenceTargets,
    deltas: {
      measuredMinusTargetS: delta,
      measuredOverTargetRatio: ratio,
      configuredMinusTargetS: configured.challenge1ConfiguredClearToSpawnS != null && targetClearToSpawn != null
        ? round(configured.challenge1ConfiguredClearToSpawnS - targetClearToSpawn, 3)
        : null
    },
    interpretation: [
      'Ordinary regular-stage handoff remains near the historical 3.2s window; the user-visible wait concern concentrates in challenge-result-to-next-regular-stage cadence.',
      'The long current behavior is configured in source as a result hold plus next-stage transition window, not a rendering/performance stall.',
      'The long timing predates the Stage 3 group 1 keeper and appears to come from May 30-31 challenge ceremony/timing work.',
      'Unless a newer measured audio-conformance decision intentionally superseded the 4.401s target, treat the 15.15s clear-to-spawn as release-cadence debt.'
    ],
    nextProofNeeded: 'Refresh challenge-stage timing correspondence against the current built /dev source and, if it fails, adjust ceremony timing to preserve full canonical audio only within a Galaga-conformant gameplay window.'
  };
}

function buildRouteabilityComparison({ riskSummary, referenceTracks, pathLabels, challengeVideo }){
  const professional = riskSummary.personaTrajectory.professionalSummary || {};
  return {
    status: (professional.perfects || 0) === 0 ? 'professional-perfect-routeability-regression-risk' : 'professional-perfect-routeability-needs-probability-sweep',
    reference: {
      allPerfectSource: challengeVideo.primarySourceId,
      trackedChallengeCount: referenceTracks.summary.trackedChallengeCount || referenceTracks.challengeRows.length,
      allChallengesHaveFiveGroups: referenceTracks.allChallengesHaveFiveGroups,
      averageGroupCount: referenceTracks.averageGroupCount,
      targetTrackReadinessScore10: referenceTracks.summary.targetTrackReadinessScore10 ?? null,
      acceptedChallengeEntryLabels: pathLabels.acceptedChallengeEntryCount,
      directReferenceReady: pathLabels.directReferenceReady,
      read: 'Reference evidence says perfect routes exist and are organized as five readable groups per challenge.'
    },
    current: {
      professionalAttempts: professional.attempts ?? null,
      professionalCleared: professional.cleared ?? null,
      professionalPerfects: professional.perfects ?? null,
      professionalAverageHitRate: professional.averageHitRate ?? null,
      professionalAverageTargetRate: professional.averageTargetRate ?? null,
      belowTrajectory: professional.belowTrajectory || [],
      professionalRows: riskSummary.personaTrajectory.professionalRows
    },
    interpretation: [
      'The current one-seed professional probe has zero perfects across eight challenge rows and clears only two rows.',
      'That is not probabilistic proof, but it is incompatible with the design intent that professional should have visible perfect-score opportunity in many challenging stages.',
      'Do not tune hit rates from one seed; first repair full-target visibility and reconcile route timing, then run a multi-seed persona sweep.'
    ]
  };
}

function buildVisibilityComparison({ riskSummary, referenceTracks }){
  return {
    status: riskSummary.visibility.riskStageCount ? 'full-target-visibility-regression-risk' : 'full-target-visibility-initial-pass',
    reference: {
      trackedChallenges: referenceTracks.challengeRows.length,
      allChallengesHaveFiveGroups: referenceTracks.allChallengesHaveFiveGroups,
      groupReadiness: referenceTracks.summary.targetTrackReadinessScore10 ?? null,
      read: referenceTracks.read
    },
    current: riskSummary.visibility,
    interpretation: [
      'Seven of eight sampled Aurora challenge stages have at least one target that never fully enters by the runtime proxy.',
      'The worst sampled row is Challenge 7 / Stage 27 with 37.5% full-sprite coverage and 25 missing targets.',
      'This supports the user concern that later challenge progression may be too fast, too offscreen, or both; final speed changes should use frame/contact-sheet comparison before runtime tuning.'
    ]
  };
}

function buildVerdict({ cadence, routeability, visibility }){
  const concerns = [];
  if(cadence.status === 'challenge-result-cadence-regression-suspected') concerns.push('challenge-result-cadence-regression-suspected');
  if(routeability.status === 'professional-perfect-routeability-regression-risk') concerns.push('professional-perfect-routeability-regression-risk');
  if(visibility.status === 'full-target-visibility-regression-risk') concerns.push('full-target-visibility-regression-risk');
  return {
    status: concerns.length ? 'reference-comparison-regression-risks-found' : 'reference-comparison-initial-pass',
    concerns,
    releaseImplication: concerns.length
      ? 'Treat as cleanup/fidelity debt before another gameplay tuning or promotion cycle; do not publish beta/production on the assumption that the waits are benign.'
      : 'No immediate cadence/routeability blocker found by this comparison artifact.',
    recommendedNextSteps: [
      'Refresh `npm run harness:check:challenge-stage-correspondence` against the current build so the 15.15s challenge-result path is reconciled with the preserved 4.401s target.',
      'If the timing correspondence fails, reduce challenge-result ceremony timing using the smallest source timing change that preserves the canonical result/perfect cue without holding next-stage spawn for the full phrase plus an extra transition.',
      'Add a multi-seed professional challenge routeability sweep after visibility is repaired; one deterministic row is risk evidence, not probability evidence.',
      'Use Galaga object-track/contact-sheet vectors to repair target full-entry and late-stage speed/readability before subjective tuning.'
    ]
  };
}

function markdown(report){
  const cadence = report.cadence;
  const route = report.routeability;
  const visibility = report.visibility;
  const rows = visibility.current.rows
    .map(row => `| ${row.challengeNumber} | ${row.stage} | ${row.layoutId} | ${row.spriteFullInsideCoverage} | ${row.missingSpriteFullInside} | ${row.firstSpriteFullInsideP90S} |`)
    .join('\n');
  const proRows = route.current.professionalRows
    .map(row => `| ${row.challengeNumber} | ${row.stage} | ${row.cleared ? 'yes' : 'no'} | ${row.hits ?? 'n/a'}/${row.total ?? 'n/a'} | ${row.hitRate} | ${row.targetRate} | ${row.perfect ? 'yes' : 'no'} |`)
    .join('\n');
  return `# Aurora Cadence Reference Comparison

Generated: ${report.generatedAt}
Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}
Branch: ${report.branch}

## Verdict

- Status: \`${report.verdict.status}\`
- Concerns: ${report.verdict.concerns.length ? report.verdict.concerns.map(item => `\`${item}\``).join(', ') : 'none'}
- Release implication: ${report.verdict.releaseImplication}

## Cadence

- Current measured Challenge 1 clear-to-spawn: ${cadence.currentMeasured.clearToSpawnS}s
- Current configured Challenge 1 clear-to-spawn: ${cadence.currentConfigured.challenge1ConfiguredClearToSpawnS}s
- Preserved Galaga-aligned target: ${cadence.preservedReferenceTarget.spawnAfterClearS}s
- Delta: ${cadence.deltas.measuredMinusTargetS}s (${cadence.deltas.measuredOverTargetRatio}x target)
- Status: \`${cadence.status}\`

This is not a generic performance wait. Current source config combines a
${cadence.currentConfigured.resultHoldWindowByChallengeS[0]}s Challenge 1 result hold with a
${cadence.currentConfigured.nextStageWindowS}s next-stage transition window.

## Routeability

- Reference tracked challenge count: ${route.reference.trackedChallengeCount}
- Reference all challenges have five groups: ${route.reference.allChallengesHaveFiveGroups ? 'yes' : 'no'}
- Reference target-track readiness: ${route.reference.targetTrackReadinessScore10}/10
- Current professional perfects: ${route.current.professionalPerfects}/${route.current.professionalAttempts}
- Current professional cleared rows: ${route.current.professionalCleared}/${route.current.professionalAttempts}
- Status: \`${route.status}\`

| Challenge | Stage | Cleared | Hits | Hit Rate | Target Rate | Perfect |
| ---: | ---: | --- | ---: | ---: | ---: | --- |
${proRows}

## Visibility

- Current risk stages: ${visibility.current.riskStageCount}/${visibility.current.stageCount}
- Missing full-sprite target proxies: ${visibility.current.missingSpriteFullInsideTotal}
- Worst row: Challenge ${visibility.current.worstCoverage?.challengeNumber}, Stage ${visibility.current.worstCoverage?.stage}, ${visibility.current.worstCoverage?.spriteFullInsideCoverage} coverage
- Status: \`${visibility.status}\`

| Challenge | Stage | Layout | Full-Sprite Coverage | Missing Targets | P90 First Full Entry |
| ---: | ---: | --- | ---: | ---: | ---: |
${rows}

## Next Steps

${report.verdict.recommendedNextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
`;
}

function main(){
  ensureDir(OUT_ROOT);
  const risk = readJson(RISK_REPORT);
  const timingLibrary = readJson(TIMING_LIBRARY);
  const trackReport = readJson(GALAGA_CHALLENGE_TRACKS);
  const videoReport = readJson(GALAGA_CHALLENGE_VIDEO);
  const labelReport = readJson(GALAGA_PATH_LABELS);
  const configured = extractConfiguredChallengeResults();
  const referenceTargets = referenceTimingTargets(timingLibrary);
  const riskSummary = summarizeRisk(risk);
  const referenceTracks = summarizeChallengeTracks(trackReport);
  const challengeVideo = summarizeChallengeVideo(videoReport);
  const pathLabels = summarizePathLabels(labelReport);
  const cadence = buildCadenceComparison({ risk, configured, referenceTargets });
  const routeability = buildRouteabilityComparison({ riskSummary, referenceTracks, pathLabels, challengeVideo });
  const visibility = buildVisibilityComparison({ riskSummary, referenceTracks });
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-cadence-reference-comparison',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: git(['status', '--short'], '').trim().length > 0,
    sources: {
      riskReport: rel(RISK_REPORT),
      timingLibrary: rel(TIMING_LIBRARY),
      galagaChallengeTracks: rel(GALAGA_CHALLENGE_TRACKS),
      galagaChallengeVideo: rel(GALAGA_CHALLENGE_VIDEO),
      galagaPathLabels: rel(GALAGA_PATH_LABELS),
      auroraGamePack: rel(AURORA_GAME_PACK)
    },
    cadence,
    referenceTracks,
    challengeVideo,
    pathLabels,
    routeability,
    visibility
  };
  report.verdict = buildVerdict({ cadence, routeability, visibility });
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}${report.dirty ? '-dirty' : ''}`;
  const outDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    verdict: report.verdict.status,
    concerns: report.verdict.concerns,
    challenge1ClearToSpawnS: report.cadence.currentMeasured.clearToSpawnS,
    targetClearToSpawnS: report.cadence.preservedReferenceTarget.spawnAfterClearS,
    professionalPerfects: report.routeability.current.professionalPerfects,
    visibilityRiskStages: report.visibility.current.riskStageCount,
    report: rel(path.join(OUT_ROOT, 'latest.json')),
    readme: rel(path.join(outDir, 'README.md'))
  }, null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SOURCE_PATH = path.join(ANALYSES, 'galaga-challenge-object-tracks', 'latest.json');
const SWEEP_INDEX_PATH = path.join(ANALYSES, 'challenge-stage-candidate-sweep-index', 'latest.json');
const OUT_ROOT = path.join(ANALYSES, 'challenge-trajectory-controls');
const CHALLENGE_STAGES = [3, 7, 11, 15, 19, 23, 27, 31];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
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

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function stageForChallenge(challengeNumber){
  return 3 + ((+challengeNumber || 1) - 1) * 4;
}

function intentForTarget(challengeNumber, target = {}){
  const entry = String(target.entrySide || '');
  const exit = String(target.exitSide || '');
  const xRange = +target.xRange || 0;
  const yRange = +target.yRange || 0;
  const lower = +target.lowerFieldShare || 0;
  const turns = +target.turnCount || 0;
  const reversals = +target.reversalCount || 0;
  const wide = xRange >= 0.52;
  const tall = yRange >= 0.55;
  const lowerBand = lower >= 0.72;
  const busy = turns >= 4.4 || reversals >= 2.6;
  if(challengeNumber === 1){
    if(tall && busy) return 'classic-tall-bonus-column';
    if(wide || entry !== exit) return 'first-challenge-peel-or-hook';
    return 'upper-band-bonus-line';
  }
  if(challengeNumber === 2) return wide || entry !== exit ? 'mixed-crossing-sweep' : 'mixed-hook-arrival';
  if(challengeNumber === 3) return tall ? 'boss-led-tall-hook' : 'boss-led-upper-loop';
  if(challengeNumber === 4) return lowerBand || busy ? 'pink-serpentine-lower-sweep' : 'pink-serpentine-compact';
  if(challengeNumber === 5) return lowerBand ? 'pink-green-low-cascade' : 'pink-green-tall-cascade';
  if(challengeNumber === 6) return tall ? 'green-ladder-deep-split' : 'green-ladder-upper-fork';
  if(challengeNumber === 7) return wide || entry !== exit ? 'yellow-fan-cross-cut' : 'yellow-fan-pop';
  if(challengeNumber === 8) return tall || busy ? 'blue-purple-finale-weave' : 'blue-purple-compact-capstone';
  return 'challenge-target-motion';
}

function pathFamilyForIntent(challengeNumber, intent, target = {}){
  if(challengeNumber === 1){
    if(intent === 'classic-tall-bonus-column') return 'classic-column-drop';
    if(intent === 'first-challenge-peel-or-hook') return 'first-challenge-peel';
    return 'side-hook-return';
  }
  if(challengeNumber === 2) return intent === 'mixed-crossing-sweep' ? 'cross-sweep' : 'hook-arc';
  if(challengeNumber === 3) return intent === 'boss-led-tall-hook' ? 'hook-arc' : 'boss-led-loop';
  if(challengeNumber === 4) return 'pink-serpentine';
  if(challengeNumber === 5){
    return (+target.lowerFieldShare || 0) >= 0.72 ? 'pink-green-low-sweep' : 'pink-green-cascade';
  }
  if(challengeNumber === 6){
    if(intent === 'green-ladder-deep-split') return 'green-ladder-deep-drop';
    return (+target.yRange || 0) <= 0.42 ? 'green-ladder-high-exit' : 'green-ladder-center-fork';
  }
  if(challengeNumber === 7){
    if(intent === 'yellow-fan-cross-cut') return 'yellow-fan-cross-cut';
    return (+target.lowerFieldShare || 0) >= 0.65 ? 'yellow-fan-low-drift' : 'yellow-fan-high-pop';
  }
  if(challengeNumber === 8) return 'blue-purple-finale';
  return 'hook-arc';
}

function controlForGroup(challengeNumber, group){
  const target = group.objectTrackTarget || {};
  const durationS = Math.max(0.75, (+target.visibleEndS || 0) - (+target.visibleStartS || 0));
  const intent = intentForTarget(challengeNumber, target);
  const pathFamily = pathFamilyForIntent(challengeNumber, intent, target);
  const xRange = +target.xRange || 0;
  const yRange = +target.yRange || 0;
  const lower = +target.lowerFieldShare || 0;
  const turns = +target.turnCount || 0;
  const reversals = +target.reversalCount || 0;
  const lowerFieldBias = Math.round(clamp((lower - 0.34) / 0.58) * 188);
  const yOffset = Math.round(clamp(lower - 0.45) * 156);
  const arcAmp = round(clamp(0.88 + xRange * 1.42 + Math.min(0.32, reversals * 0.045), 0.85, 2.35), 2);
  const dropAmp = round(clamp(0.76 + yRange * 1.08 + lower * 0.22, 0.72, 1.85), 2);
  const speedScale = round(clamp(8.2 / durationS, 0.72, 3.4), 2);
  const softSpeedScale = round(clamp(6.9 / durationS, 0.72, 2.65), 2);
  return {
    groupIndex: group.groupIndex,
    confidence: round(group.confidence, 3),
    trackCount: group.trackCount || null,
    target,
    controlIntent: intent,
    runtimePathFamilyHint: pathFamily,
    runtimeControl: {
      spawnOffsetS: round(target.visibleStartS || 0, 2),
      durationS: round(durationS, 2),
      speedScale,
      softSpeedScale,
      arcAmp,
      dropAmp,
      lowerFieldBias,
      yOffset
    },
    comparisonTargets: {
      xRange: round(xRange, 4),
      yRange: round(yRange, 4),
      pathLength: round(target.pathLength, 4),
      turnCount: round(turns, 2),
      reversalCount: round(reversals, 2),
      lowerFieldShare: round(lower, 4),
      entrySide: target.entrySide || null,
      exitSide: target.exitSide || null
    }
  };
}

function challengeControlRow(challenge, sweepRow){
  const challengeNumber = +challenge.challengeNumber;
  const stage = stageForChallenge(challengeNumber);
  const groups = (challenge.targetGroups || []).map(group => controlForGroup(challengeNumber, group));
  const runtimeLayoutSeed = {
    groupSpawnOffsets: groups.map(group => group.runtimeControl.spawnOffsetS),
    groupSpeedScales: groups.map(group => group.runtimeControl.speedScale),
    groupSoftSpeedScales: groups.map(group => group.runtimeControl.softSpeedScale),
    groupArcAmps: groups.map(group => group.runtimeControl.arcAmp),
    groupDropAmps: groups.map(group => group.runtimeControl.dropAmp),
    groupLowerFieldBiases: groups.map(group => group.runtimeControl.lowerFieldBias),
    groupYOffsets: groups.map(group => group.runtimeControl.yOffset),
    groupPathFamilies: groups.map(group => group.runtimePathFamilyHint)
  };
  const averageConfidence = average(groups.map(group => group.confidence));
  const targetYRange = average(groups.map(group => group.comparisonTargets.yRange));
  const targetXRange = average(groups.map(group => group.comparisonTargets.xRange));
  const lowerFieldShare = average(groups.map(group => group.comparisonTargets.lowerFieldShare));
  const controlReadiness10 = round(
    (clamp((groups.length || 0) / 5) * 2.2)
    + (clamp((averageConfidence || 0) / 0.72) * 3.1)
    + (clamp((challenge.trackRead?.trackCount || 0) / 45) * 2.1)
    + (groups.every(group => group.runtimePathFamilyHint) ? 1.3 : 0)
    + (sweepRow?.runtimeReadyUnderCurrentPolicy ? 1.3 : 0),
    1
  );
  return {
    challengeNumber,
    stage,
    label: `Challenging Stage ${challengeNumber} (Levels ${stage}-${stage + 1})`,
    sourceVideo: challenge.sourceVideo || null,
    sourceWindow: challenge.sourceWindow || null,
    groupCount: groups.length,
    averageConfidence: round(averageConfidence, 3),
    averageTargetXRange: round(targetXRange, 4),
    averageTargetYRange: round(targetYRange, 4),
    averageLowerFieldShare: round(lowerFieldShare, 4),
    controlReadiness10,
    currentSweepDecision: sweepRow?.keeperDecision || 'not-swept',
    currentSweepBestExpectedScore10: sweepRow?.bestExpectedScore10 ?? null,
    currentSweepBestTargetVideoObjectFitScore10: sweepRow?.bestTargetVideoObjectFitScore10 ?? null,
    runtimeLayoutSeed,
    groups,
    read: `Target-derived controls preserve ${groups.length} group schedule(s), path-family hint(s), speed scale(s), arc/drop scale(s), and lower-field bias(es) for stage ${stage}. These are candidate inputs only until a sweep and full analyzer promote them.`
  };
}

function buildMarkdown(report){
  const rows = report.challenges.map(row => `| ${row.challengeNumber} | ${row.stage} | ${row.groupCount} | ${row.averageConfidence ?? 'n/a'} | ${row.controlReadiness10}/10 | ${row.currentSweepDecision} | ${(row.runtimeLayoutSeed.groupPathFamilies || []).join(', ')} |`).join('\n');
  return `# Challenge Trajectory Controls

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

This artifact turns Galaga challenge-stage object tracks into reusable runtime candidate controls. It is intentionally between ingestion and gameplay: the controls guide sweeps, but they do not change Aurora unless a later candidate clears strict identity, target-video, and safety gates.

## Summary

- Challenges covered: ${report.summary.challengeCount}.
- Groups covered: ${report.summary.groupCount}.
- Average source-track confidence: ${report.summary.averageConfidence}.
- Control readiness: ${report.summary.controlReadinessScore10}/10.
- Runtime-ready candidates in current sweep index: ${report.summary.runtimeReadyCount}.

${report.summary.read}

## Controls

| Challenge | Stage | Groups | Avg Confidence | Readiness | Current Sweep | Path Hints |
| ---: | ---: | ---: | ---: | ---: | --- | --- |
${rows}
`;
}

function main(){
  const tracks = readJson(SOURCE_PATH, {});
  if(tracks.artifactType !== 'galaga-challenge-object-tracks'){
    throw new Error(`Missing Galaga challenge object-track source at ${rel(SOURCE_PATH)}`);
  }
  const sweepIndex = readJson(SWEEP_INDEX_PATH, { rows: [], summary: {} });
  const sweepByStage = new Map((sweepIndex.rows || []).map(row => [+row.stage, row]));
  const challenges = (tracks.challenges || [])
    .filter(challenge => CHALLENGE_STAGES.includes(stageForChallenge(challenge.challengeNumber)))
    .map(challenge => challengeControlRow(challenge, sweepByStage.get(stageForChallenge(challenge.challengeNumber))))
    .sort((a, b) => a.stage - b.stage);
  const groupCount = challenges.reduce((sum, row) => sum + row.groupCount, 0);
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-trajectory-controls',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    sourceArtifacts: {
      galagaChallengeObjectTracks: rel(SOURCE_PATH),
      challengeStageCandidateSweepIndex: fs.existsSync(SWEEP_INDEX_PATH) ? rel(SWEEP_INDEX_PATH) : null
    },
    summary: {
      challengeCount: challenges.length,
      stages: challenges.map(row => row.stage),
      groupCount,
      averageConfidence: round(average(challenges.map(row => row.averageConfidence)), 3),
      averageTargetXRange: round(average(challenges.map(row => row.averageTargetXRange)), 4),
      averageTargetYRange: round(average(challenges.map(row => row.averageTargetYRange)), 4),
      averageLowerFieldShare: round(average(challenges.map(row => row.averageLowerFieldShare)), 4),
      controlReadinessScore10: round(average(challenges.map(row => row.controlReadiness10)), 1),
      runtimeReadyCount: sweepIndex.summary?.runtimeReadyCount || 0,
      weakestStage: challenges.slice().sort((a, b) => (a.controlReadiness10 || 0) - (b.controlReadiness10 || 0))[0]?.stage || null,
      read: 'Reference video object tracks now produce explicit candidate controls for challenge-stage group timing, speed, arc/drop scale, lower-field travel, y-offset, and path-family hints. This should reduce blind CPU sweeps and make failed candidates easier to diagnose.'
    },
    measurementLimits: [
      'Controls are derived from object-track summary vectors, not frame-perfect spline paths.',
      'Path-family hints map target motion intent onto Aurora runtime primitives and must be swept before promotion.',
      'Current object tracking does not yet assign exact Galaga alien identity to every target group.',
      'No player-visible runtime behavior changes from this artifact alone.'
    ],
    challenges
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    challengeCount: report.summary.challengeCount,
    groupCount: report.summary.groupCount,
    controlReadinessScore10: report.summary.controlReadinessScore10,
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main();

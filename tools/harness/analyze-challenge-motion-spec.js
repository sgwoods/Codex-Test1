#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const GRAMMAR_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-movement-grammar', 'latest.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-motion-spec');
const INGESTION_ROOT = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-motion-spec');
const CHALLENGE_STAGE = 7;

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

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function phaseDurations(group){
  const runtime = group.runtimeControl || {};
  const refDuration = +group.referencePath?.durationS || +runtime.durationS || 2;
  return {
    leadInS: 0.78,
    trackS: round(refDuration, 3),
    exitS: round(Math.max(1.2, Math.min(3.4, refDuration * 0.72 + 0.8)), 3)
  };
}

function groupSpec(row, group){
  const runtime = group.runtimeControl || {};
  const referencePath = group.referencePath || {};
  const durations = phaseDurations(group);
  const laneSpreadScale = round(clamp((+referencePath.laneSpreadX || 9) / 9, 0.78, 1.55), 3);
  const rowSpreadScale = round(clamp((+referencePath.rowSpreadY || 7) / 7, 0.75, 1.65), 3);
  return {
    groupIndex: group.groupIndex,
    entityCount: 8,
    evaluator: 'reference-spline-v1',
    intent: group.controlIntent,
    pathFamilyHint: group.runtimePathFamilyHint,
    spawnOffsetS: round(runtime.spawnOffsetS || 0, 3),
    phaseDurations: durations,
    visualFamilyPolicy: 'use-runtime-layout-family',
    lanePolicy: {
      entityCount: 8,
      sideSplit: 'four-left-four-right',
      laneSpreadMode: 'reference-lane-offset',
      laneOrder: [0, 1, 2, 3, 4, 5, 6, 7],
      laneSpreadScale: 1,
      rowSpreadScale: 1,
      referenceLaneSpreadScale: laneSpreadScale,
      referenceRowSpreadScale: rowSpreadScale
    },
    controls: {
      arcAmp: round(runtime.arcAmp ?? 1, 3),
      dropAmp: round(runtime.dropAmp ?? 1, 3),
      speedScale: round(runtime.speedScale ?? 1, 3),
      softSpeedScale: round(runtime.softSpeedScale ?? runtime.speedScale ?? 1, 3),
      lowerFieldBias: round(runtime.lowerFieldBias ?? 0, 3),
      yOffset: round(runtime.yOffset ?? 0, 3),
      laneSpreadScale: 1,
      rowSpreadScale: 1,
      laneStaggerS: 0,
      phaseOffsetS: 0,
      slotDelayS: 0.14,
      slotXOffset: 0,
      slotYOffset: 0,
      laneOrder: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    comparisonTargets: group.comparisonTargets || {},
    referencePath: {
      sourceTrackId: group.referencePath?.sourceTrackId || '',
      sourceSampleCount: group.referencePath?.sourceSampleCount || 0,
      durationS: round(group.referencePath?.durationS || durations.trackS, 3),
      pointCount: group.referencePath?.pointCount || 0
    },
    promotionGates: [
      'target-video-object-track-fit-must-not-regress',
      'human-visible-readability-must-not-regress',
      'human-perfect-routeability-must-not-regress',
      'spacing-and-bunching-risk-must-pass',
      'challenge-identity-must-match-intended-baseline'
    ]
  };
}

function buildMarkdown(report){
  const rows = report.spec.groups.map(group => `| ${group.groupIndex} | ${group.intent} | ${group.pathFamilyHint} | ${group.spawnOffsetS}s | ${group.phaseDurations.trackS}s | ${group.controls.arcAmp} | ${group.controls.dropAmp} | ${group.controls.lowerFieldBias} | ${group.referencePath.sourceTrackId} |`).join('\n');
  return `# Aurora Challenge Motion Spec

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Scope

This is the first narrow runtime-facing movement grammar artifact. It converts Challenge 2 / internal stage marker 7 from the broader movement grammar into an explicit phase-based motion spec.

The spec is not a runtime promotion by itself. It is the contract that runtime code, candidate sweeps, and documentation should converge on.

| Group | Intent | Path Hint | Spawn | Track | Arc | Drop | Lower Bias | Reference |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
${rows}
`;
}

function main(){
  const grammar = readJson(GRAMMAR_PATH);
  if(grammar.artifactType !== 'aurora-challenge-movement-grammar'){
    throw new Error(`Unexpected grammar artifact type in ${rel(GRAMMAR_PATH)}`);
  }
  const row = (grammar.grammar || []).find(item => +item.stage === CHALLENGE_STAGE);
  if(!row) throw new Error(`Missing challenge movement grammar row for internal stage ${CHALLENGE_STAGE}`);
  const groups = (row.groupContracts || []).map(group => groupSpec(row, group));
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-challenge-motion-spec',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    gameKey: 'aurora-galactica',
    scope: 'challenge-2-internal-stage-7',
    sourceArtifacts: {
      movementGrammar: rel(GRAMMAR_PATH),
      challengeConformance: 'reference-artifacts/analyses/challenge-stage-conformance/latest.json',
      candidateSweepIndex: 'reference-artifacts/analyses/challenge-stage-candidate-sweep-index/latest.json'
    },
    spec: {
      stage: row.stage,
      challengeNumber: row.challengeNumber,
      label: row.label,
      role: row.role,
      playerMeaning: row.playerMeaning,
      targetFeel: row.targetFeel,
      sourceControlReadiness10: row.sourceControlReadiness10,
      evaluator: 'reference-spline-v1',
      phaseModel: ['lead-in', 'reference-track', 'exit'],
      groups
    },
    summary: {
      groupCount: groups.length,
      referenceBackedGroupCount: groups.filter(group => group.referencePath.sourceTrackId && group.referencePath.pointCount >= 3).length,
      averageTrackDurationS: round(groups.reduce((sum, group) => sum + (+group.phaseDurations.trackS || 0), 0) / Math.max(1, groups.length), 3),
      averageLowerFieldBias: round(groups.reduce((sum, group) => sum + (+group.controls.lowerFieldBias || 0), 0) / Math.max(1, groups.length), 2),
      read: 'Challenge 2 now has a runtime-facing motion spec: five reference-backed groups, phase durations, controls, reference path IDs, and promotion gates.'
    },
    nextBestStep: 'Wire Challenge 2 to a generic reference-spline evaluator and compare old/current runtime behavior before promoting the spec to additional stages.'
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeJson(path.join(INGESTION_ROOT, 'aurora-challenge-2-0.1.json'), report);
  console.log(JSON.stringify({
    ok: true,
    scope: report.scope,
    groupCount: report.summary.groupCount,
    referenceBackedGroupCount: report.summary.referenceBackedGroupCount,
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    ingestion: rel(path.join(INGESTION_ROOT, 'aurora-challenge-2-0.1.json'))
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

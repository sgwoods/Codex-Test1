#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const INGESTION = path.join(ROOT, 'reference-artifacts', 'ingestion');
const CONTROLS_PATH = path.join(ANALYSES, 'challenge-trajectory-controls', 'latest.json');
const OUT_ROOT = path.join(ANALYSES, 'challenge-movement-grammar');
const INGESTION_ROOT = path.join(INGESTION, 'challenge-stage-movement-grammar');
const INGESTION_OUT = path.join(INGESTION_ROOT, 'aurora-first-five-0.1.json');
const FIRST_FIVE_STAGES = [3, 7, 11, 15, 19];

const STAGE_MEANING = {
  3: {
    role: 'introductory bonus lesson',
    playerMeaning: 'Teach that a challenging stage is safe, scoreable, and learnable rather than a combat wave.',
    targetFeel: 'clean bee/butterfly arrivals, readable upper-band lanes, and visible peel/drop exits.'
  },
  7: {
    role: 'mixed crossing escalation',
    playerMeaning: 'Show that the second challenge has a new route vocabulary and not just faster copies of the first.',
    targetFeel: 'wider crossing sweeps, hook returns, and specialty-family novelty.'
  },
  11: {
    role: 'boss-led and specialty hook lesson',
    playerMeaning: 'Make the player read larger boss-led and specialty shapes while still preserving a perfect-score route.',
    targetFeel: 'boss-led loops, hook arcs, and clear dragonfly/specialty visual identity.'
  },
  15: {
    role: 'late serpentine set piece',
    playerMeaning: 'Introduce a late-stage spectacle that feels authored and memorable, not a remix of early challenge stages.',
    targetFeel: 'pink serpentine motion, longer lower-field travel, and readable score lanes.'
  },
  19: {
    role: 'pink/green cascade variation',
    playerMeaning: 'Prove later challenge stages have distinct progression and can be learned as separate bonus patterns.',
    targetFeel: 'alternating pink/green cascade groups, lower-field pass timing, and stronger family alternation.'
  }
};

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

function round(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function challengeLabel(row){
  return `Challenging Stage ${row.stage}-${row.stage + 1}`;
}

function grammarRow(row){
  const seed = row.runtimeLayoutSeed || {};
  const groups = Array.isArray(row.groups) ? row.groups : [];
  const meaning = STAGE_MEANING[row.stage] || {};
  return {
    stage: row.stage,
    challengeNumber: row.challengeNumber,
    label: challengeLabel(row),
    role: meaning.role || 'challenge set piece',
    playerMeaning: meaning.playerMeaning || 'Safe bonus-stage choreography with a learnable perfect-score route.',
    targetFeel: meaning.targetFeel || row.read || '',
    sourceControlReadiness10: row.controlReadiness10,
    targetSummary: {
      averageConfidence: row.averageConfidence,
      averageTargetXRange: row.averageTargetXRange,
      averageTargetYRange: row.averageTargetYRange,
      averageLowerFieldShare: row.averageLowerFieldShare
    },
    runtimeSeed: {
      groupSpawnOffsets: seed.groupSpawnOffsets || [],
      groupSoftSpeedScales: seed.groupSoftSpeedScales || seed.groupSpeedScales || [],
      groupSpeedScales: seed.groupSpeedScales || [],
      groupArcAmps: seed.groupArcAmps || [],
      groupDropAmps: seed.groupDropAmps || [],
      groupLowerFieldBiases: seed.groupLowerFieldBiases || [],
      groupYOffsets: seed.groupYOffsets || [],
      groupPathFamilies: seed.groupPathFamilies || [],
      groupReferencePaths: seed.groupReferencePaths || []
    },
    groupContracts: groups.map(group => ({
      groupIndex: group.groupIndex,
      controlIntent: group.controlIntent,
      runtimePathFamilyHint: group.runtimePathFamilyHint,
      confidence: group.confidence,
      trackCount: group.trackCount,
      runtimeControl: group.runtimeControl,
      comparisonTargets: group.comparisonTargets,
      referencePath: group.referencePath ? {
        sourceTrackId: group.referencePath.sourceTrackId,
        sourceSampleCount: group.referencePath.sourceSampleCount,
        durationS: group.referencePath.durationS,
        pointCount: Array.isArray(group.referencePath.points) ? group.referencePath.points.length : 0
      } : null
    })),
    humanVisibleGuardrails: [
      'Every group must visibly arrive through a path; do not promote candidates that appear in-place inside the playfield.',
      'Groups must preserve readable spacing; do not promote candidates that bunch multiple enemies into ambiguous blobs.',
      'The stage must remain a safe no-shot/no-ship-loss bonus exhibition.',
      'A professional persona should retain a plausible perfect-clear route.',
      'The best-matching reference identity must belong to the intended challenge, not only a nearby generic challenge vector.'
    ],
    nextImplementationUse: 'Use this row as the baseline candidate seed for sweeps; promote runtime constants only after full challenge-stage conformance and human-visible guardrails pass.'
  };
}

function buildMarkdown(report){
  const rows = report.grammar.map(row => `| ${row.challengeNumber} | ${row.label} | ${row.sourceControlReadiness10}/10 | ${row.groupContracts.length} | ${row.runtimeSeed.groupReferencePaths.filter(Boolean).length} | ${row.runtimeSeed.groupPathFamilies.join(', ')} | ${row.targetFeel} |`).join('\n');
  return `# Aurora Challenge Movement Grammar: First Five

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

This artifact promotes the first five Aurora challenge-stage movement targets from object-track analysis into a reusable movement grammar. It is not a runtime promotion by itself. It is the contract input for candidate sweeps, human-visible guardrails, and later full-stage conformance checks.

## Summary

- Challenge rows: ${report.summary.challengeCount}
- Group contracts: ${report.summary.groupContractCount}
- Reference-backed groups: ${report.summary.referenceBackedGroupCount}
- Average control readiness: ${report.summary.averageControlReadiness10}/10

| Challenge | Label | Readiness | Groups | Ref Paths | Path Families | Target Feel |
| ---: | --- | ---: | ---: | ---: | --- | --- |
${rows}
`;
}

function main(){
  const controls = readJson(CONTROLS_PATH);
  if(controls.artifactType !== 'challenge-trajectory-controls'){
    throw new Error(`Unexpected controls artifact at ${rel(CONTROLS_PATH)}`);
  }
  const grammar = (controls.challenges || [])
    .filter(row => FIRST_FIVE_STAGES.includes(+row.stage))
    .sort((a, b) => a.stage - b.stage)
    .map(grammarRow);
  const groupContractCount = grammar.reduce((sum, row) => sum + row.groupContracts.length, 0);
  const referenceBackedGroupCount = grammar.reduce((sum, row) => sum + row.runtimeSeed.groupReferencePaths.filter(Boolean).length, 0);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-challenge-movement-grammar',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    gameKey: 'aurora-galactica',
    scope: 'first-five-challenge-stages',
    sourceArtifacts: {
      challengeTrajectoryControls: rel(CONTROLS_PATH),
      galagaChallengeObjectTracks: 'reference-artifacts/analyses/galaga-challenge-object-tracks/latest.json',
      galagaChallengeVideoReference: 'reference-artifacts/analyses/galaga-challenge-video-reference/latest.json'
    },
    summary: {
      challengeCount: grammar.length,
      stages: grammar.map(row => row.stage),
      groupContractCount,
      referenceBackedGroupCount,
      averageControlReadiness10: round(grammar.reduce((sum, row) => sum + (+row.sourceControlReadiness10 || 0), 0) / Math.max(1, grammar.length), 1),
      read: 'The first five challenge stages now have explicit movement-grammar rows: group schedule, path family, reference path, arc/drop controls, lower-field bias, and human-visible promotion guardrails.'
    },
    measurementLimits: [
      'Reference paths are object-track summaries from ingested video, not frame-perfect authoritative splines.',
      'This artifact is a candidate-generation contract; runtime changes must still pass browser-backed conformance checks.',
      'Challenge alien sprite identity remains authority-limited until clean target sprite windows are promoted.'
    ],
    grammar,
    nextBestStep: 'Run focused candidate sweeps for stages 3, 7, 11, 15, and 19 using this grammar; promote only candidates that pass full-stage conformance and human-visible guardrails.'
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeJson(INGESTION_OUT, report);
  console.log(JSON.stringify({
    ok: true,
    challengeCount: report.summary.challengeCount,
    groupContractCount,
    referenceBackedGroupCount,
    averageControlReadiness10: report.summary.averageControlReadiness10,
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    ingestion: rel(INGESTION_OUT)
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}

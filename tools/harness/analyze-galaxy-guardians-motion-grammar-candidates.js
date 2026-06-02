#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const IDENTITY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity');
const VOCABULARY = path.join(ROOT, 'reference-artifacts', 'analyses', 'shared-motion-grammar', 'vocabulary-0.1.json');
const ROUTEABILITY = path.join(IDENTITY_ROOT, 'routeability-review-0.1.json');
const MOVEMENT = path.join(IDENTITY_ROOT, 'movement-pacing-0.1.json');
const RUNTIME_REFERENCE = path.join(IDENTITY_ROOT, 'runtime-reference-movement-0.1.json');
const OBJECT_TRACK = path.join(IDENTITY_ROOT, 'object-track-conformance-0.1.json');
const FRAME_MOTION = path.join(IDENTITY_ROOT, 'frame-motion-conformance-0.1.json');
const LONG_SURFACE = path.join(IDENTITY_ROOT, 'long-surface-conformance-0.1.json');
const PLAYTEST = path.join(IDENTITY_ROOT, 'playtest-conformance-review-0.1.json');
const VISUAL_READABILITY = path.join(IDENTITY_ROOT, 'visual-readability-0.1.json');
const OUT = path.join(IDENTITY_ROOT, 'motion-grammar-candidates-0.1.json');
const OUT_MD = path.join(IDENTITY_ROOT, 'motion-grammar-candidates-0.1.md');

function readJson(file, fallback = {}){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 1){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function findCategory(artifact, id){
  return (artifact.categories || []).find(category => category.id === id) || {};
}

function findWindow(artifact, id){
  return (artifact.windows || []).find(window => window.id === id || window.windowKey === id || String(window.windowKey || '').endsWith(`/${id}`)) || {};
}

function score(value, fallback = null){
  return Number.isFinite(+value) ? +value : fallback;
}

function riskLabel(score10){
  if(!Number.isFinite(+score10)) return 'unknown';
  if(score10 < 5) return 'high';
  if(score10 < 6.5) return 'medium';
  return 'watch';
}

function candidateScore(parts){
  return round(average(parts.filter(value => Number.isFinite(+value))), 1);
}

function buildCandidates({ vocabulary, routeability, runtimeReference, objectTrack, frameMotion, longSurface, playtest }){
  const motionPressure = findCategory(playtest, 'motion-pressure');
  const longMidrun = findCategory(longSurface, 'midrun-survivability-and-clear-potential');
  const stagePressure = findCategory(longSurface, 'stage-band-pressure-grammar');
  const visualIdentity = findCategory(playtest, 'visual-identity');
  const runtimeScore = score(runtimeReference.runtimeReferenceMovementScore10, 0);
  const routeScore = score(routeability.summary?.routeabilityScore10, 0);
  const midrunScore = score(routeability.summary?.weakestGroupScore10, 0);
  const objectScores = objectTrack.objectProxyScores || {};
  const frameScores = frameMotion.frameProxyScores || {};
  const runtimeStats = runtimeReference.runtimeStats || {};
  const comparison = runtimeReference.comparison || {};
  const objectDive = findWindow(objectTrack, 'lower-field-dive-curves');
  const objectEscort = findWindow(objectTrack, 'flagship-escort-pressure');
  const objectWrap = findWindow(objectTrack, 'wrap-return-pressure');

  return [
    {
      id: 'guardians-stage-five-routeability-relief',
      primitiveId: 'scoring-routeability-window',
      title: 'Stage-five stress routeability relief',
      priority: 1,
      candidateType: 'runtime-candidate-needed',
      axesTouched: ['player-routeability', 'collision-safety', 'shot-window', 'visual-readability'],
      currentScores: {
        routeabilityScore10: round(routeScore),
        weakestRouteabilityGroupScore10: round(midrunScore),
        longSurfaceMidrunScore10: round(longMidrun.score10)
      },
      evidence: [
        rel(ROUTEABILITY),
        rel(LONG_SURFACE),
        rel(PLAYTEST)
      ],
      problem: 'The weakest player-facing movement problem is not missing pressure; it is that stage-five stress is collision-dominated and does not convert into clean-clear routeability.',
      proposedCandidate: 'Create a bounded stage-five movement candidate that slightly widens lower-field escape/read lanes and preserves shot pressure while reducing collision-loss share.',
      playerMeaning: 'A strong player should feel pressure and still see a route, rather than feeling that lower-field movement simply crowds them out.',
      promotionGate: 'Accept only if midrun-stage-five-stress routeability improves and object-track/pressure scores do not materially regress.',
      status: 'planned-no-runtime-change',
      score10: candidateScore([midrunScore, longMidrun.score10, motionPressure.playtestWeightedScore10]),
      risk: riskLabel(midrunScore),
      nextMeasurement: 'Browser-backed persona before/after run at stage five with score, survival, collision-loss share, and object-track summary.'
    },
    {
      id: 'guardians-scout-dive-duration-shape',
      primitiveId: 'dive-attack',
      title: 'Scout dive duration and shape fit',
      priority: 2,
      candidateType: 'runtime-candidate-needed',
      axesTouched: ['temporal-cadence', 'path-topology', 'collision-safety', 'shot-window'],
      currentScores: {
        runtimeReferenceMovementScore10: round(runtimeScore),
        durationFit10: round(runtimeReference.scoreParts?.durationFit),
        xSpanFit10: round(runtimeReference.scoreParts?.xSpanFit),
        ySpanFit10: round(runtimeReference.scoreParts?.ySpanFit)
      },
      evidence: [
        rel(RUNTIME_REFERENCE),
        rel(OBJECT_TRACK),
        objectDive.evidence?.contactSheet || null
      ].filter(Boolean),
      problem: `Runtime dives are much shorter than the reference proxy median (${round(comparison.runtimeMedianDurationSeconds, 2)}s vs ${round(comparison.referenceMedianDurationSeconds, 2)}s), even though x/y span and event coverage are strong.`,
      proposedCandidate: 'Try a slower, longer scout-dive profile in a controlled candidate while preserving current first-dive timing and stage-one readability.',
      playerMeaning: 'Dives should read as graceful arcade pressure with time to aim, not as abrupt short hops.',
      promotionGate: 'Accept only if duration fit improves and routeability does not fall below the current baseline.',
      status: 'planned-no-runtime-change',
      score10: candidateScore([runtimeReference.scoreParts?.durationFit, runtimeScore, routeScore]),
      risk: riskLabel(Math.min(routeScore, runtimeReference.scoreParts?.durationFit || routeScore)),
      nextMeasurement: 'Runtime-vs-reference movement comparison plus routeability review for baseline and candidate profiles.'
    },
    {
      id: 'guardians-flagship-escort-readable-pressure',
      primitiveId: 'escort-linked-dive',
      title: 'Flagship escort readable pressure',
      priority: 3,
      candidateType: 'analysis-first-candidate',
      axesTouched: ['object-grouping', 'role-family', 'path-topology', 'player-routeability', 'audio-cue-hooks'],
      currentScores: {
        objectDivePathEvidence10: round(objectScores.divePathEvidence),
        frameMovementPressure10: round(frameScores.movementPressure),
        playtestMotionPressure10: round(motionPressure.playtestWeightedScore10)
      },
      evidence: [
        rel(OBJECT_TRACK),
        rel(FRAME_MOTION),
        objectEscort.evidence?.contactSheet || null
      ].filter(Boolean),
      problem: 'Guardians has reference-backed escort pressure evidence, but the candidate loop has not yet isolated whether escort-linked dives are readable scoring opportunities or only extra density.',
      proposedCandidate: 'Create a named escort-linked-dive candidate with explicit escort spacing/lag variants and before/after routeability deltas.',
      playerMeaning: 'The flagship should feel like a special coordinated threat, not just another object in the lower-field crowd.',
      promotionGate: 'Accept only if escort grouping remains visible and persona routeability is preserved or improved.',
      status: 'planned-analysis-before-runtime',
      score10: candidateScore([objectScores.divePathEvidence, frameScores.movementPressure, motionPressure.playtestWeightedScore10]),
      risk: riskLabel(motionPressure.playtestWeightedScore10),
      nextMeasurement: 'Contact-sheet and runtime tracklet before/after focused on linked flagship/escort path overlap.'
    },
    {
      id: 'guardians-bottom-wrap-return-readability',
      primitiveId: 'bottom-wrap-return',
      title: 'Bottom wrap and return readability',
      priority: 4,
      candidateType: 'analysis-first-candidate',
      axesTouched: ['path-topology', 'temporal-cadence', 'collision-safety', 'visual-readability'],
      currentScores: {
        runtimeReferenceMovementScore10: round(runtimeScore),
        wrapCountByFourteenSeconds: runtimeStats.wrapCountByFourteenSeconds ?? null,
        objectTrackCoverage10: round(objectScores.objectTrackCoverage)
      },
      evidence: [
        rel(RUNTIME_REFERENCE),
        rel(OBJECT_TRACK),
        objectWrap.evidence?.contactSheet || null
      ].filter(Boolean),
      problem: 'Runtime wrap coverage exists, but the next quality question is whether wrap/return behavior is visually readable and fair when pressure increases.',
      proposedCandidate: 'Instrument wrap/return path variants with explicit lower-field routeability and visual-overlap checks before changing runtime constants.',
      playerMeaning: 'The player should understand where a returning enemy will go and why a collision happened.',
      promotionGate: 'Accept only if wrap count/coverage remains healthy and collision-loss share does not rise.',
      status: 'planned-analysis-before-runtime',
      score10: candidateScore([runtimeScore, objectScores.objectTrackCoverage, routeScore]),
      risk: riskLabel(routeScore),
      nextMeasurement: 'Before/after visual sheet with wrap path overlays and persona collision-loss deltas.'
    },
    {
      id: 'guardians-rack-drift-and-opening-cadence',
      primitiveId: 'rack-drift',
      title: 'Rack drift and opening cadence',
      priority: 5,
      candidateType: 'guardrail-currently-valid',
      axesTouched: ['temporal-cadence', 'path-topology', 'visual-readability', 'player-routeability'],
      currentScores: {
        formationRackTiming10: round(frameScores.formationRackTiming),
        rackObjectStability10: round(objectScores.rackObjectStability),
        stageBandPressureGrammar10: round(stagePressure.score10)
      },
      evidence: [
        rel(FRAME_MOTION),
        rel(OBJECT_TRACK),
        rel(MOVEMENT)
      ],
      problem: 'Opening/rack motion is useful enough to guard, but future theming and variant work could accidentally break the stable rack read.',
      proposedCandidate: 'Keep rack drift as a guardrail row and require future visual/theme variants to preserve rack stability and opening cadence before promotion.',
      playerMeaning: 'The first screen should read like a coherent arcade formation before individual threats peel away.',
      promotionGate: 'Accept only if rack stability, opening cadence, and visual-role separation remain above current floors.',
      status: 'guardrail-not-change-target',
      score10: candidateScore([frameScores.formationRackTiming, objectScores.rackObjectStability, stagePressure.score10]),
      risk: 'watch',
      nextMeasurement: 'Run frame-motion/object-track checks after any theme or sprite-scale change.'
    },
    {
      id: 'guardians-movement-audio-cue-hooks',
      primitiveId: 'dive-attack',
      title: 'Movement-linked audio cue hooks',
      priority: 6,
      candidateType: 'semantic-candidate-needed',
      axesTouched: ['audio-cue-hooks', 'temporal-cadence', 'player-routeability'],
      currentScores: {
        playtestAudioScore10: round(findCategory(playtest, 'audio-character').playtestWeightedScore10),
        motionPressureScore10: round(motionPressure.playtestWeightedScore10),
        routeabilityScore10: round(routeScore)
      },
      evidence: [
        rel(PLAYTEST),
        rel(ROUTEABILITY)
      ],
      problem: 'Movement candidates currently track visual/routeability risk better than audio meaning; dive and escort changes should also say when audio needs to warn, reward, or clarify.',
      proposedCandidate: 'Add audio cue-hook fields to movement candidate reports before tuning dive/escort/wrap behavior further.',
      playerMeaning: 'Sound should help the player understand threat and reward timing rather than simply decorating the scene.',
      promotionGate: 'Accept only if movement candidates declare whether audio hooks are unchanged, required, or intentionally deferred.',
      status: 'planned-process-candidate',
      score10: candidateScore([findCategory(playtest, 'audio-character').playtestWeightedScore10, motionPressure.playtestWeightedScore10, routeScore]),
      risk: riskLabel(findCategory(playtest, 'audio-character').playtestWeightedScore10),
      nextMeasurement: 'Add cue-hook fields to the next before/after candidate artifact and rerun audio-scene review where hooks change.'
    }
  ].map(candidate => Object.assign({}, candidate, {
    grammarPrimitive: (vocabulary.primitives || []).find(primitive => primitive.id === candidate.primitiveId) || null,
    routeabilityGate: {
      baselineScore10: round(routeScore),
      weakestGroup: routeability.summary?.weakestGroup || null,
      weakestGroupScore10: round(midrunScore),
      required: true
    }
  }));
}

function buildMarkdown(report){
  const rows = report.candidates.map(candidate => `| ${candidate.priority} | ${candidate.title} | \`${candidate.primitiveId}\` | ${candidate.score10}/10 | ${candidate.risk} | ${candidate.status} | ${candidate.nextMeasurement} |`).join('\n');
  const detail = report.candidates.map(candidate => `### ${candidate.priority}. ${candidate.title}

- Candidate id: \`${candidate.id}\`
- Primitive: \`${candidate.primitiveId}\`
- Axes: ${candidate.axesTouched.map(axis => `\`${axis}\``).join(', ')}
- Problem: ${candidate.problem}
- Proposed candidate: ${candidate.proposedCandidate}
- Player meaning: ${candidate.playerMeaning}
- Promotion gate: ${candidate.promotionGate}
`).join('\n');
  return `# Galaxy Guardians Motion Grammar Candidate Queue

Generated: ${report.createdOn}
Status: ${report.status}

## Summary

${report.summary.releaseRead}

| Priority | Candidate | Primitive | Score | Risk | Status | Next Measurement |
| ---: | --- | --- | ---: | --- | --- | --- |
${rows}

## Candidate Details

${detail}
`;
}

function main(){
  const vocabulary = readJson(VOCABULARY);
  const routeability = readJson(ROUTEABILITY);
  const movement = readJson(MOVEMENT);
  const runtimeReference = readJson(RUNTIME_REFERENCE);
  const objectTrack = readJson(OBJECT_TRACK);
  const frameMotion = readJson(FRAME_MOTION);
  const longSurface = readJson(LONG_SURFACE);
  const playtest = readJson(PLAYTEST);
  const visualReadability = readJson(VISUAL_READABILITY);
  const mapping = (vocabulary.gameMappings || []).find(row => row.gameKey === 'galaxy-guardians-preview') || {};
  const candidates = buildCandidates({ vocabulary, routeability, runtimeReference, objectTrack, frameMotion, longSurface, playtest, visualReadability });
  const sorted = candidates.slice().sort((a, b) => a.priority - b.priority);
  const top = sorted[0] || {};
  const report = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-motion-grammar-candidate-queue',
    version: '0.1',
    createdOn: new Date().toISOString(),
    status: 'candidate-queue-analysis-only-no-runtime-change',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-motion-grammar-candidates.js',
    sourceEvidence: {
      motionGrammarVocabulary: rel(VOCABULARY),
      routeabilityReview: rel(ROUTEABILITY),
      movementPacing: rel(MOVEMENT),
      runtimeReferenceMovement: rel(RUNTIME_REFERENCE),
      objectTrackConformance: rel(OBJECT_TRACK),
      frameMotionConformance: rel(FRAME_MOTION),
      longSurfaceConformance: rel(LONG_SURFACE),
      playtestConformanceReview: rel(PLAYTEST),
      visualReadability: rel(VISUAL_READABILITY)
    },
    grammarMapping: mapping,
    summary: {
      candidateCount: sorted.length,
      topCandidateId: top.id || null,
      topPrimitiveId: top.primitiveId || null,
      routeabilityScore10: round(routeability.summary?.routeabilityScore10),
      weakestRouteabilityGroup: routeability.summary?.weakestGroup || null,
      weakestRouteabilityGroupScore10: round(routeability.summary?.weakestGroupScore10),
      runtimeReferenceMovementScore10: round(runtimeReference.runtimeReferenceMovementScore10),
      playtestMotionPressureScore10: round(findCategory(playtest, 'motion-pressure').playtestWeightedScore10),
      promotionRule: mapping.promotionGate || vocabulary.promotionPolicy,
      releaseRead: `Guardians now has ${sorted.length} grammar-backed movement candidate rows. The first priority is ${top.title || 'pending'} because routeability is ${round(routeability.summary?.routeabilityScore10)}/10 overall and ${round(routeability.summary?.weakestGroupScore10)}/10 in the weakest stage-five stress group.`
    },
    candidates: sorted,
    nextSteps: [
      'Build a browser-backed before/after routeability capture for the top candidate.',
      'Keep all movement candidates linked to primitive ids and axes before runtime promotion.',
      'Only tune runtime constants after routeability, collision-safety, shot-window, and visual-readability gates are present.'
    ]
  };
  writeJson(OUT, report);
  writeText(OUT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    candidateCount: report.summary.candidateCount,
    topCandidateId: report.summary.topCandidateId,
    routeabilityScore10: report.summary.routeabilityScore10,
    weakestRouteabilityGroupScore10: report.summary.weakestRouteabilityGroupScore10
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.stack || String(err));
  process.exit(1);
}

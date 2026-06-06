#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const INGESTION = path.join(ROOT, 'reference-artifacts', 'ingestion');
const MOVEMENT_GRAMMAR = path.join(ANALYSES, 'challenge-movement-grammar', 'latest.json');
const SWEEP_INDEX = path.join(ANALYSES, 'challenge-stage-candidate-sweep-index', 'latest.json');
const LATEST_SWEEP = path.join(ANALYSES, 'challenge-stage-candidate-sweep', 'latest.json');
const SETPIECE_CONTRACTS = path.join(ANALYSES, 'challenge-setpiece-contracts', 'latest.json');
const OUT_ROOT = path.join(ANALYSES, 'challenge-motion-primitives');
const INGESTION_OUT = path.join(INGESTION, 'challenge-motion-primitives', 'aurora-0.1.json');

const FIRST_FIVE_STAGES = [3, 7, 11, 15, 19];
const BUILD_ORDER = [
  'lead-in-continuity',
  'group-spacing-field',
  'reference-spline-fit',
  'phase-order-scheduler',
  'lower-field-scoreable-pass',
  'hook-return-arc',
  'exit-continuity',
  'serpentine-cascade',
  'novelty-family-cascade',
  'persona-perfect-route-probe'
];

const PRIMITIVE_CATALOG = [
  {
    id: 'lead-in-continuity',
    name: 'Visible Lead-In Continuity',
    category: 'arrival',
    playerMeaning: 'Aliens should enter as readable groups from offscreen or the playfield edge, not appear suddenly in the middle of the board.',
    sourceStageHint: 'all-first-five',
    successCriteria: [
      'Each group has a visible pre-contact path segment before entering the scoreable band.',
      'No group starts with more than 20% of members already inside the central playfield without prior lead-in frames.',
      'Human-visible arrival-continuity guardrail is >= 0.8 for any promoted candidate.'
    ],
    candidateGeneratorKnobs: [
      'leadInS',
      'spawnEdge',
      'preEntryControlPoint',
      'groupSpawnOffsets',
      'phaseStaggerS'
    ],
    implementationPlan: 'Add a reusable lead-in phase before challenge group path playback; keep it data-driven so main-level entry groups can reuse it.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/09-stage-flow.js',
      'src/js/13-aurora-game-pack.js'
    ]
  },
  {
    id: 'group-spacing-field',
    name: 'Group Spacing Field',
    category: 'readability',
    playerMeaning: 'A challenge group should read as a flock, not a smeared pile of sprites or overlapping pairs.',
    sourceStageHint: 'all-first-five',
    successCriteria: [
      'Human-visible spacing score is >= 0.35 and bunching risk is <= 0.55 for promoted candidates.',
      'Group envelopes preserve enough separation to identify alien families during the pass.',
      'Formation member offsets are stable across the path and do not collapse at high speed.'
    ],
    candidateGeneratorKnobs: [
      'laneSpacing',
      'rowSpacing',
      'formationSpreadScale',
      'phaseSeparation',
      'maxMemberOverlap'
    ],
    implementationPlan: 'Represent each group path as a centerline plus stable member offsets; clamp speed/path parameters that collapse the offsets.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/09-stage-flow.js'
    ]
  },
  {
    id: 'reference-spline-fit',
    name: 'Reference Spline Fit',
    category: 'path-shape',
    playerMeaning: 'The motion should look authored from the target examples rather than a generic sine-wave remix.',
    sourceStageHint: 'all-first-five',
    successCriteria: [
      'Target-video object fit improves without expected-label or human-visible regression.',
      'Each group path can replay normalized reference points with bounded smoothing.',
      'Best reference identity remains the intended challenge family.'
    ],
    candidateGeneratorKnobs: [
      'referencePathId',
      'splineTension',
      'timeWarp',
      'xScale',
      'yScale',
      'lowerFieldBias'
    ],
    implementationPlan: 'Introduce a normalized path-player primitive that samples ingested reference points and composes scale/time/offset per group.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/13-aurora-game-pack.js'
    ]
  },
  {
    id: 'phase-order-scheduler',
    name: 'Phase-Order Scheduler',
    category: 'timing',
    playerMeaning: 'Challenge waves should have a coherent order and rhythm so the player can learn a perfect route.',
    sourceStageHint: 'all-first-five',
    successCriteria: [
      'Stage contact sheets show ordered group arrivals rather than simultaneous clutter.',
      'Professional persona perfect potential does not regress after timing changes.',
      'Group overlap windows are explicit and capped by stage contract.'
    ],
    candidateGeneratorKnobs: [
      'groupSpawnOffsets',
      'groupDurationS',
      'phaseOverlapLimit',
      'scoreableWindowS'
    ],
    implementationPlan: 'Make challenge timing a first-class schedule independent of path shape so future games can vary rhythm without rewriting movement logic.',
    runtimeTouchpoints: [
      'src/js/09-stage-flow.js',
      'src/js/13-aurora-game-pack.js'
    ]
  },
  {
    id: 'lower-field-scoreable-pass',
    name: 'Lower-Field Scoreable Pass',
    category: 'scoreability',
    playerMeaning: 'The player should get memorable shot windows that are possible to perfect, not just watch aliens pass out of reach.',
    sourceStageHint: 'stages-with-lower-field-share',
    successCriteria: [
      'Reference-backed lower-field share is preserved within stage tolerance.',
      'Human-perfect potential is >= baseline and professional watch mode can route the pass.',
      'The pass is visible long enough for a human to aim while staying safe.'
    ],
    candidateGeneratorKnobs: [
      'lowerFieldBias',
      'dropAmp',
      'scoreableBandY',
      'minDwellS',
      'exitVy'
    ],
    implementationPlan: 'Add a stage-contract field for scoreable lower-band dwell and teach persona scoring probes to value it.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/12-persona-player.js',
      'src/js/13-aurora-game-pack.js'
    ]
  },
  {
    id: 'hook-return-arc',
    name: 'Hook Return Arc',
    category: 'path-shape',
    playerMeaning: 'Hooking return arcs create the classic learnable flourish that separates later challenges from straight-line entries.',
    sourceStageHint: 'side-hook-return',
    successCriteria: [
      'Path reversal count and turn count match the target-control band.',
      'Hook returns do not bunch groups at the apex.',
      'Exit continuity keeps the group visible through the return.'
    ],
    candidateGeneratorKnobs: [
      'arcAmp',
      'turnRadius',
      'returnBiasX',
      'speedEase',
      'exitSide'
    ],
    implementationPlan: 'Convert current side-hook variants into a parameterized arc primitive with spacing-aware apex handling.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/13-aurora-game-pack.js'
    ]
  },
  {
    id: 'serpentine-cascade',
    name: 'Serpentine Cascade',
    category: 'late-stage-identity',
    playerMeaning: 'A later challenge should introduce a new spectacle, not feel like a faster early challenge.',
    sourceStageHint: 'stage-15',
    successCriteria: [
      'Stage 15 gains a distinct serpentine multi-group path family.',
      'Target-video object fit improves without wrong-reference identity drift.',
      'Alien family novelty and visual readability both improve.'
    ],
    candidateGeneratorKnobs: [
      'waveAmplitude',
      'waveFrequency',
      'cascadeOffsetS',
      'familyAlternation',
      'pathLengthScale'
    ],
    implementationPlan: 'Add a late-stage cascade primitive with group-level phase offsets and visual-family contracts.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/13-aurora-game-pack.js'
    ]
  },
  {
    id: 'novelty-family-cascade',
    name: 'Novelty Family Cascade',
    category: 'alien-novelty',
    playerMeaning: 'Challenge stages should teach the player that new alien families and bonus targets matter.',
    sourceStageHint: 'stage-19',
    successCriteria: [
      'Stage 19 presents alternating specialty families clearly enough to identify.',
      'Challenge-specialty sprite authority improves from the current weak baseline.',
      'Family changes are scheduled and not merely random recolors.'
    ],
    candidateGeneratorKnobs: [
      'visualFamilySequence',
      'familyPhaseOffset',
      'spritePulseMode',
      'groupRole'
    ],
    implementationPlan: 'Tie movement groups to explicit visual-family contracts so Aurora themes can vary aliens while keeping target-era grammar.',
    runtimeTouchpoints: [
      'src/js/13-aurora-game-pack.js',
      'src/js/04-rendering.js'
    ]
  },
  {
    id: 'exit-continuity',
    name: 'Exit Continuity',
    category: 'departure',
    playerMeaning: 'Aliens should leave as part of the choreography, not vanish once the scoring opportunity ends.',
    sourceStageHint: 'all-first-five',
    successCriteria: [
      'Groups remain visible until they exit the playfield or settle into a documented transition.',
      'No disappearance occurs before the path reaches its exit condition.',
      'End-of-group timing remains compatible with the next wave.'
    ],
    candidateGeneratorKnobs: [
      'exitSide',
      'exitVy',
      'fadeSuppression',
      'postScoreablePathS',
      'groupRetirePolicy'
    ],
    implementationPlan: 'Replace challenge retire-on-window behavior with data-driven path completion and explicit offscreen exits.',
    runtimeTouchpoints: [
      'src/js/06-enemy-behavior.js',
      'src/js/09-stage-flow.js'
    ]
  },
  {
    id: 'persona-perfect-route-probe',
    name: 'Persona Perfect-Route Probe',
    category: 'assessment',
    playerMeaning: 'A professional watch run should prove the stage is learnable and scoreable before we ship it.',
    sourceStageHint: 'all-first-five',
    successCriteria: [
      'Professional persona can attempt every group in the challenge-stage tour.',
      'Perfect-potential score does not regress when path readability improves.',
      'Capture/rescue behavior remains irrelevant during safe challenge stages.'
    ],
    candidateGeneratorKnobs: [
      'aimLeadS',
      'groupPriority',
      'routeCommitment',
      'missRecovery'
    ],
    implementationPlan: 'Add per-primitive route probes so candidate sweeps score player opportunity, not only visual similarity.',
    runtimeTouchpoints: [
      'src/js/12-persona-player.js',
      'tools/harness/sweep-stage11-challenge-candidates.js'
    ]
  }
];

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

function round(value, digits = 2){
  if(!Number.isFinite(+value)) return null;
  return +(+value).toFixed(digits);
}

function unique(values){
  return [...new Set(values.filter(value => value !== null && value !== undefined && String(value).trim() !== ''))];
}

function pathsForPrimitive(id, grammarRows){
  const pathFamilies = [];
  for(const row of grammarRows){
    for(const family of row.runtimeSeed?.groupPathFamilies || []){
      if(id === 'hook-return-arc' && String(family).includes('hook')) pathFamilies.push(family);
      if(id === 'serpentine-cascade' && +row.stage === 15) pathFamilies.push(family);
      if(id === 'novelty-family-cascade' && +row.stage === 19) pathFamilies.push(family);
      if(id === 'reference-spline-fit') pathFamilies.push(family);
    }
  }
  return unique(pathFamilies);
}

function sourceStagesForPrimitive(primitive, grammarRows){
  if(primitive.sourceStageHint === 'all-first-five') return FIRST_FIVE_STAGES.slice();
  if(primitive.sourceStageHint === 'stages-with-lower-field-share'){
    return grammarRows
      .filter(row => (row.groupContracts || []).some(group => +group.comparisonTargets?.lowerFieldShare > 0.4))
      .map(row => +row.stage);
  }
  if(primitive.sourceStageHint === 'side-hook-return'){
    return grammarRows
      .filter(row => (row.runtimeSeed?.groupPathFamilies || []).some(family => String(family).includes('hook')))
      .map(row => +row.stage);
  }
  if(primitive.sourceStageHint === 'stage-15') return [15];
  if(primitive.sourceStageHint === 'stage-19') return [19];
  return [];
}

function sweepFailureSignals(stage, sweepRows){
  const row = sweepRows.find(item => +item.stage === +stage) || {};
  return {
    stage: +stage,
    decision: row.keeperDecision || 'not-swept',
    bestCandidateId: row.bestCandidateId || null,
    expectedLift10: round(row.expectedLift10, 2),
    targetVideoObjectFitLift10: round(row.targetVideoObjectFitLift10, 2),
    humanPerfectPotentialLift10: round(row.humanPerfectPotentialLift10, 2),
    humanVisibleLift10: round(row.humanVisibleLift10, 2),
    humanVisiblePass: row.humanVisiblePass === true,
    spacingScore: round(row.humanVisibleSpacingScore, 3),
    bunchingRisk: round(row.humanVisibleBunchingRisk, 3),
    arrivalContinuity: round(row.humanVisibleArrivalContinuity, 3),
    read: row.read || row.nextStep || 'No sweep read available.'
  };
}

function leadInPrototypeEvidence(latestSweep){
  const rows = Array.isArray(latestSweep?.diagnostics?.leadInTop) ? latestSweep.diagnostics.leadInTop : [];
  if(!rows.length) return null;
  const best = rows
    .filter(row => row?.humanVisibleGuardrails)
    .sort((a, b) => (+a.humanVisibleGuardrails.magicAppearanceRisk || 1) - (+b.humanVisibleGuardrails.magicAppearanceRisk || 1)
      || (+a.humanVisibleGuardrails.bunchingRisk || 1) - (+b.humanVisibleGuardrails.bunchingRisk || 1)
      || (+(b.targetVideoObjectFitScore10 || 0)) - (+(a.targetVideoObjectFitScore10 || 0)))[0] || null;
  if(!best) return null;
  const guard = best.humanVisibleGuardrails || {};
  return {
    stage: latestSweep.stage,
    candidateId: best.candidateId,
    expectedScore10: round(best.expectedScore10, 1),
    targetVideoObjectFitScore10: round(best.targetVideoObjectFitScore10, 1),
    humanPerfectPotentialScore10: round(best.humanPerfectPotentialScore10, 1),
    arrivalContinuity: round(guard.arrivalContinuity, 3),
    magicAppearanceRisk: round(guard.magicAppearanceRisk, 3),
    spacingScore: round(guard.spacingScore, 3),
    bunchingRisk: round(guard.bunchingRisk, 3),
    visualPresencePass: best.visualPresenceRegressionGuard?.pass === true,
    promotionReady: best.humanVisibleGuardrails?.pass === true && best.humanPerfectGuard?.pass === true,
    read: `Latest lead-in prototype ${best.candidateId} reduced magic appearance risk to ${round(guard.magicAppearanceRisk, 3)} with arrival continuity ${round(guard.arrivalContinuity, 3)}, but bunching remains ${round(guard.bunchingRisk, 3)} and blocks promotion.`
  };
}

function spacingFieldPrototypeEvidence(latestSweep){
  const rows = Array.isArray(latestSweep?.diagnostics?.spacingFieldTop) ? latestSweep.diagnostics.spacingFieldTop : [];
  if(!rows.length) return null;
  const best = rows
    .filter(row => row?.humanVisibleGuardrails)
    .sort((a, b) => (+a.humanVisibleGuardrails.bunchingRisk || 1) - (+b.humanVisibleGuardrails.bunchingRisk || 1)
      || (+(b.humanVisibleGuardrails.spacingScore || 0)) - (+(a.humanVisibleGuardrails.spacingScore || 0))
      || (+(b.humanVisibleGuardrails.score10 || 0)) - (+(a.humanVisibleGuardrails.score10 || 0))
      || (+(b.targetVideoObjectFitScore10 || 0)) - (+(a.targetVideoObjectFitScore10 || 0)))[0] || null;
  if(!best) return null;
  const guard = best.humanVisibleGuardrails || {};
  const processWin = +guard.magicAppearanceRisk <= 0.12
    && +guard.spacingScore >= 0.45
    && +guard.bunchingRisk <= 0.62
    && best.visualPresenceRegressionGuard?.pass === true;
  return {
    stage: latestSweep.stage,
    candidateId: best.candidateId,
    expectedScore10: round(best.expectedScore10, 1),
    targetVideoObjectFitScore10: round(best.targetVideoObjectFitScore10, 1),
    humanPerfectPotentialScore10: round(best.humanPerfectPotentialScore10, 1),
    humanVisibleScore10: round(guard.score10, 1),
    arrivalContinuity: round(guard.arrivalContinuity, 3),
    magicAppearanceRisk: round(guard.magicAppearanceRisk, 3),
    spacingScore: round(guard.spacingScore, 3),
    bunchingRisk: round(guard.bunchingRisk, 3),
    visualPresencePass: best.visualPresenceRegressionGuard?.pass === true,
    promotionReady: best.humanVisibleGuardrails?.pass === true && best.humanPerfectGuard?.pass === true,
    processWin,
    read: processWin
      ? `Latest centerline spacing prototype ${best.candidateId} improved human-visible readability to ${round(guard.score10, 1)}/10 with bunching risk ${round(guard.bunchingRisk, 3)}, spacing ${round(guard.spacingScore, 3)}, and magic risk ${round(guard.magicAppearanceRisk, 3)}. It is still not runtime-ready because target-video fit is ${round(best.targetVideoObjectFitScore10, 1)}/10 and expected-label lift is not material.`
      : `Latest centerline spacing prototype ${best.candidateId} did not yet produce a reliable process win; bunching ${round(guard.bunchingRisk, 3)}, spacing ${round(guard.spacingScore, 3)}, magic ${round(guard.magicAppearanceRisk, 3)}.`
  };
}

function priorityForPrimitive(primitive, stages, sweepRows, setpiece){
  const relatedSweeps = stages.map(stage => sweepFailureSignals(stage, sweepRows));
  const blockedVisible = relatedSweeps.filter(row => row.humanVisiblePass === false).length;
  const highBunching = relatedSweeps.filter(row => Number.isFinite(+row.bunchingRisk) && +row.bunchingRisk > 0.55).length;
  const currentMovement = +setpiece.summary?.averageMovementScore10 || 0;
  let score = 5;
  if(['lead-in-continuity', 'group-spacing-field', 'reference-spline-fit', 'phase-order-scheduler'].includes(primitive.id)) score += 3;
  if(['serpentine-cascade', 'novelty-family-cascade'].includes(primitive.id)) score += 1.5;
  score += Math.min(1.5, blockedVisible * 0.25 + highBunching * 0.35);
  if(currentMovement < 5) score += 0.75;
  return round(Math.min(10, score), 1);
}

function buildPrimitive(primitive, grammarRows, sweepRows, setpiece){
  const sourceStages = sourceStagesForPrimitive(primitive, grammarRows);
  const stageSignals = sourceStages.map(stage => sweepFailureSignals(stage, sweepRows));
  const referencePathCount = grammarRows
    .filter(row => sourceStages.includes(+row.stage))
    .reduce((sum, row) => sum + (row.runtimeSeed?.groupReferencePaths || []).filter(Boolean).length, 0);
  const groupContractCount = grammarRows
    .filter(row => sourceStages.includes(+row.stage))
    .reduce((sum, row) => sum + (row.groupContracts || []).length, 0);
  const blockedStages = stageSignals
    .filter(row => row.humanVisiblePass === false || row.decision !== 'candidate-ready-for-full-analyzer-review')
    .map(row => row.stage);
  const priority10 = priorityForPrimitive(primitive, sourceStages, sweepRows, setpiece);
  return {
    ...primitive,
    priority10,
    sourceStages,
    reusableAcrossGames: true,
    evidenceSummary: {
      referencePathCount,
      groupContractCount,
      pathFamilies: pathsForPrimitive(primitive.id, grammarRows),
      blockedStages,
      bestHumanVisibleLift10: round(Math.max(...stageSignals.map(row => Number.isFinite(+row.humanVisibleLift10) ? +row.humanVisibleLift10 : -99)), 2),
      worstBunchingRisk: round(Math.max(...stageSignals.map(row => Number.isFinite(+row.bunchingRisk) ? +row.bunchingRisk : 0)), 3),
      read: `${primitive.name} is backed by ${groupContractCount} group contract(s) and ${referencePathCount} reference path(s); blocked stages: ${blockedStages.length ? blockedStages.join(', ') : 'none recorded'}.`
    },
    failureSignals: stageSignals,
    measurementPlan: [
      'Run the browser-backed candidate sweep for the affected stage.',
      'Require expected-reference, target-video fit, human-perfect potential, and human-visible guardrails to all hold.',
      'Regenerate challenge-stage conformance, candidate sweep index, release conformance dashboard, and Application Guide sections.',
      'Promote runtime constants only when the primitive improves the user-visible stage read, not just one isolated score.'
    ],
    releaseGate: priority10 >= 8
      ? 'Must be addressed before claiming a major challenge-stage quality lift.'
      : 'Can follow after the arrival/readability primitives produce stable keepers.'
  };
}

function stageRoadmapRow(row, sweepRows){
  const stage = +row.stage;
  const sweep = sweepFailureSignals(stage, sweepRows);
  const families = row.runtimeSeed?.groupPathFamilies || [];
  const primaryPrimitives = ['lead-in-continuity', 'group-spacing-field', 'reference-spline-fit', 'phase-order-scheduler'];
  if(families.some(family => String(family).includes('hook'))) primaryPrimitives.push('hook-return-arc');
  if(stage === 15) primaryPrimitives.push('serpentine-cascade');
  if(stage === 19) primaryPrimitives.push('novelty-family-cascade');
  if((row.groupContracts || []).some(group => +group.comparisonTargets?.lowerFieldShare > 0.4)){
    primaryPrimitives.push('lower-field-scoreable-pass');
  }
  return {
    stage,
    label: row.label,
    playerMeaning: row.playerMeaning,
    currentBlocker: sweep.read,
    bestCandidateId: sweep.bestCandidateId,
    scoreSignals: {
      expectedLift10: sweep.expectedLift10,
      targetVideoObjectFitLift10: sweep.targetVideoObjectFitLift10,
      humanPerfectPotentialLift10: sweep.humanPerfectPotentialLift10,
      humanVisibleLift10: sweep.humanVisibleLift10,
      bunchingRisk: sweep.bunchingRisk,
      spacingScore: sweep.spacingScore
    },
    primaryPrimitives: unique(primaryPrimitives),
    desiredOutcome: `Make ${row.label} visibly arrive, spread, score, and exit as a coherent Galaga-like set piece while preserving perfect-score potential.`,
    nextAction: stage === 3
      ? 'Prototype lead-in continuity plus group-spacing field on the first challenge before broadening runtime promotion.'
      : 'Wait for the Stage 3 primitive prototype, then retune this stage using the same primitive vocabulary.'
  };
}

function buildMarkdown(report){
  const primitiveRows = report.primitives.map(item => `| ${item.priority10}/10 | ${item.id} | ${item.category} | ${item.sourceStages.join(', ')} | ${item.evidenceSummary.read} | ${item.implementationPlan} |`).join('\n');
  const stageRows = report.stageRoadmap.map(item => `| ${item.label} | ${item.primaryPrimitives.join(', ')} | ${item.scoreSignals.humanVisibleLift10 ?? 'n/a'} | ${item.scoreSignals.bunchingRisk ?? 'n/a'} | ${item.nextAction} |`).join('\n');
  return `# Challenge Motion Primitive Catalog

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

This artifact turns the current no-keeper challenge-stage sweep evidence into reusable movement primitives. The intent is to stop treating each candidate sweep as a one-off tuning exercise and instead define path grammar that Aurora, Galaxy Guardians, and future games can ingest, vary, and test.

## Summary

- Primitives: ${report.summary.primitiveCount}
- First-five stage rows: ${report.summary.stageRoadmapCount}
- High-priority primitives: ${report.summary.highPriorityPrimitiveCount}
- First build target: ${report.summary.firstBuildTarget}

${report.summary.read}

${report.leadInPrototypeEvidence ? `Lead-in prototype evidence: ${report.leadInPrototypeEvidence.read}` : 'Lead-in prototype evidence: none recorded in the latest sweep.'}

${report.spacingFieldPrototypeEvidence ? `Spacing-field prototype evidence: ${report.spacingFieldPrototypeEvidence.read}` : 'Spacing-field prototype evidence: none recorded in the latest sweep.'}

## Primitive Backlog

| Priority | Primitive | Category | Source Stages | Evidence | Implementation Plan |
| ---: | --- | --- | --- | --- | --- |
${primitiveRows}

## First-Five Stage Roadmap

| Challenge Stage | Primary Primitives | Human-Visible Lift | Bunching Risk | Next Action |
| --- | --- | ---: | ---: | --- |
${stageRows}
`;
}

function main(){
  const movementGrammar = readJson(MOVEMENT_GRAMMAR);
  const sweepIndex = readJson(SWEEP_INDEX);
  const latestSweep = readJson(LATEST_SWEEP);
  const setpieceContracts = readJson(SETPIECE_CONTRACTS);
  const grammarRows = (movementGrammar.grammar || []).filter(row => FIRST_FIVE_STAGES.includes(+row.stage));
  const sweepRows = Array.isArray(sweepIndex.rows) ? sweepIndex.rows : [];
  const primitives = PRIMITIVE_CATALOG
    .map(primitive => buildPrimitive(primitive, grammarRows, sweepRows, setpieceContracts))
    .sort((a, b) => b.priority10 - a.priority10 || BUILD_ORDER.indexOf(a.id) - BUILD_ORDER.indexOf(b.id) || a.id.localeCompare(b.id));
  const stageRoadmap = grammarRows
    .sort((a, b) => +a.stage - +b.stage)
    .map(row => stageRoadmapRow(row, sweepRows));
  const highPriority = primitives.filter(item => +item.priority10 >= 8);
  const leadInEvidence = leadInPrototypeEvidence(latestSweep);
  const spacingFieldEvidence = spacingFieldPrototypeEvidence(latestSweep);
  const leadInPrototypeSucceeded = !!(leadInEvidence
    && Number.isFinite(+leadInEvidence.magicAppearanceRisk)
    && +leadInEvidence.magicAppearanceRisk <= 0.12
    && leadInEvidence.visualPresencePass);
  const spacingFieldPrototypeSucceeded = !!(spacingFieldEvidence?.processWin);
  const firstBuildTarget = spacingFieldPrototypeSucceeded
    ? 'reference-spline-fit'
    : leadInPrototypeSucceeded
    ? 'group-spacing-field'
    : (highPriority[0]?.id || primitives[0]?.id || 'pending');
  const firstBuildTargetRead = spacingFieldPrototypeSucceeded
    ? 'Centerline spacing now has a measured process win, but target identity/path fit still blocks promotion. Combine the spacing field with stronger reference-spline fit and phase scheduling next.'
    : leadInPrototypeSucceeded
    ? 'Lead-in continuity now has a measured prototype that reduces magic appearance, but it still bunches. Build a true centerline-plus-member-offset group-spacing field next.'
    : (highPriority[0]?.implementationPlan || primitives[0]?.implementationPlan || 'Run the primitive analyzer after movement grammar is available.');
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-motion-primitives',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    gameKey: 'aurora-galactica',
    sourceArtifacts: {
      challengeMovementGrammar: rel(MOVEMENT_GRAMMAR),
      challengeStageCandidateSweepIndex: rel(SWEEP_INDEX),
      latestChallengeStageCandidateSweep: rel(LATEST_SWEEP),
      challengeSetpieceContracts: rel(SETPIECE_CONTRACTS)
    },
    summary: {
      primitiveCount: primitives.length,
      stageRoadmapCount: stageRoadmap.length,
      highPriorityPrimitiveCount: highPriority.length,
      firstBuildTarget,
      firstBuildTargetRead,
      firstFiveStages: stageRoadmap.map(row => row.stage),
      releaseReadiness: 'planning-only',
      read: spacingFieldPrototypeSucceeded
        ? 'The latest sweep shows lead-in continuity and centerline spacing both produce measured readability gains. Runtime promotion is still blocked because target-video object fit and expected-label identity do not improve enough; the next grammar pass should compose spacing with stronger reference-spline/path-fit and phase-order controls.'
        : leadInPrototypeSucceeded
        ? 'The latest sweep shows lead-in continuity can materially improve magic-appearance readability, but group bunching still blocks runtime promotion. The next runtime improvement should shift from lead-in experiments to a centerline-plus-member-offset spacing primitive, then rerun the sweep and full visual presence guards.'
        : 'The next runtime improvement should target visible lead-in, spacing/readability, reference spline playback, and phase scheduling before another broad sweep. These primitives attack the failures that blocked every current candidate keeper.'
    },
    measurementLimits: [
      'This is a design-and-measurement backlog, not a runtime promotion.',
      'Priority is derived from existing sweep blockers and target contracts; it should be recalculated after each candidate implementation.',
      'The primitive vocabulary is intentionally game-generic so it can support Galaxy Guardians and future games as ingestion improves.'
    ],
    primitives,
    stageRoadmap,
    leadInPrototypeEvidence: leadInEvidence,
    spacingFieldPrototypeEvidence: spacingFieldEvidence,
    nextBestStep: spacingFieldPrototypeSucceeded
      ? 'Compose the centerline spacing field with reference-spline fit and phase-order scheduling on Challenging Stage 7, then accept only if target-video lift clears the recorded full-analyzer calibration without losing human-visible readability.'
      : leadInPrototypeSucceeded
      ? 'Build a true group-spacing-field primitive that represents each group as a centerline plus stable member offsets, then test it first on Challenging Stage 7 before broadening to the first five challenge stages.'
      : 'Prototype lead-in-continuity and group-spacing-field for Challenging Stage 3-4, then rerun the candidate sweep and human-visible guardrails.'
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeJson(INGESTION_OUT, report);
  console.log(JSON.stringify({
    ok: true,
    primitiveCount: report.summary.primitiveCount,
    highPriorityPrimitiveCount: report.summary.highPriorityPrimitiveCount,
    firstBuildTarget: report.summary.firstBuildTarget,
    leadInPrototypeEvidence: report.leadInPrototypeEvidence,
    spacingFieldPrototypeEvidence: report.spacingFieldPrototypeEvidence,
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

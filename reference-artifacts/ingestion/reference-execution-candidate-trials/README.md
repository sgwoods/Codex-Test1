# Reference Execution Candidate Trials

This folder stores external candidate inputs for non-overwriting reference
execution trials. The first pilot is Stage 7 / Challenge 2 for Aurora
Galactica.

Trial inputs are measurement artifacts, not runtime changes. They let a worker
describe a small executable-intent variant before editing source code, then run:

```sh
npm run harness:analyze:stage7-reference-execution-trial -- --candidate=reference-artifacts/ingestion/reference-execution-candidate-trials/stage7-baseline-control-0.1.json
npm run harness:check:stage7-reference-execution-trial
```

The analyzer writes only to:

`reference-artifacts/analyses/reference-execution-candidate-trials/stage7-challenge2/`

It does not overwrite challenge-stage conformance, the reference execution
description, or runtime source.

## Semantic Batch Pilot

The semantic batch layer treats the Stage 7 trial gate as the first
compiler/evaluator for a tiny executable-intent language. Run:

```sh
npm run harness:analyze:stage7-reference-execution-batch
npm run harness:check:stage7-reference-execution-batch
```

The vocabulary is declared in:

`reference-artifacts/ingestion/reference-execution-candidate-trials/stage7-semantic-vocabulary-0.1.json`

The batch analyzer generates candidate JSON inputs from named transformation
classes, evaluates each through the single-candidate trial gate, and writes a
ranked report to:

`reference-artifacts/analyses/reference-execution-candidate-trials/stage7-challenge2/latest-batch.json`

Generated candidates remain measurement artifacts. A passing batch candidate
can only be recommended as exactly one runtime source attempt, not as a runtime
keeper.

The Stage 7 semantic batch source-ready gate is subordinate to the current
path-family authority decision and runtime-expressibility proof artifacts:

```sh
npm run harness:analyze:stage7-path-family-authority
npm run harness:check:stage7-path-family-authority
npm run harness:analyze:stage7-phase-duration-expressibility
npm run harness:check:stage7-phase-duration-expressibility
npm run harness:analyze:stage7-lower-field-expressibility
npm run harness:check:stage7-lower-field-expressibility
```

For `phase-duration-rebalance`, raw `visibleStartS` / `visibleEndS` trial
vectors are analysis-only. The semantic compiler now emits
`compiledRuntimeControls` mapped to `groupSpawnOffsets` /
`motionSpecGroup.spawnOffsetS`, `phaseDurations.trackS`, and
`referencePath.playbackScale`, but a source-ready candidate still requires the
phase-duration proof to pass the motion/profile proxy, preserve the live
path-family gate, and keep the protected group 4/group 5 timing windows.
The current protected Stage 7 proof preserves group 4/group 5 timing, but is
still source-ready-blocked by the spacing/readability guard, so do not promote
or keep searching phase-duration candidates from this batch alone.

For `group1-path-length-compression`, the batch may record
`analysisCompilerMappings` that point at consumed runtime fields such as
`referencePath.playbackScale`. These are not source-ready compiled controls
until a focused browser proof verifies that the mapping transfers to actual
Stage 7 object-track movement without spacing, scoreable-route, or safety
regression.

For `lower-field-overstay-reduction`, the focused browser proof confirms that
`lowerFieldBias` and `yOffset` are consumed, but the current generated controls
do not produce enough browser-visible lower-field movement or reduce group 2
lower-field overstay in the intended direction. Keep this transform
analysis-only under current controls and do not promote Stage 7 source edits
from it.

## Stage 3 RED Trial Generalization

Stage 3 / Challenge 1 uses the same non-overwriting pattern, but the gate is
RED-driven and semantic-first. Run:

```sh
npm run harness:analyze:stage3-reference-execution-trial -- --candidate=reference-artifacts/ingestion/reference-execution-candidate-trials/stage3-baseline-control-0.1.json
npm run harness:check:stage3-reference-execution-trial
```

The analyzer writes only to:

`reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/`

It reports reusable RED/trial mechanics separately from temporary Stage
3-specific expectations: the top-right bee line, late top-left butterfly line,
upper-band scoreability, peel-off exits, route learnability, no-combat grammar,
and human-visible-vs-CPU field-occupancy tension. Lower-field geometry is
reported beside player-visible scoreability; it is not allowed to dominate the
decision when those reads conflict.

## Stage 3 Input Shape

- `candidateId`: stable candidate id.
- `scope`: must remain Stage 3 / Challenge 1 for this pilot.
- `authorityLayerInputs`: declares RED target-conformance authority, current
  live runtime evidence, and any artifact caveats.
- `groups`: optional per-group semantic or predicted-vector controls.
  - `groupIndex`: 1-5.
  - `semanticExecution`: optional `lineRole`, `entryCue`, `exitGesture`, and
    `scoreableBand` overrides.
  - `pathFamily`: candidate path-family intent.
  - `predictedRuntimeVector`: optional full vector for a non-overwriting
    trial prediction.
  - `timing`: optional `phaseOffsetS`, `visibleStartS`, or `visibleEndS`.
  - `fieldOccupancy`: optional `lowerFieldShare` or `lowerFieldDelta`.
- `guardrails.spacingReadability`: pass/fail, spacing score, bunching risk,
  and min-distance read.
- `guardrails.scoreableRoutes`: scoreable-window and routeability preservation.
- `guardrails.safety`: no-shot/no-attack/no-loss/no-contact read.

The Stage 3 baseline-control trial is a process keeper only if it evaluates the
RED cleanly, preserves semantic and safety guardrails, exposes strict weak
rows, and keeps runtime source promotion disabled. It is not a runtime keeper
and does not justify beta.

## Stage 3 Semantic Batch

The first Stage 3 semantic batch generates named, non-overwriting candidate
inputs against the Stage 3 trial gate. Run:

```sh
npm run harness:analyze:stage3-reference-execution-batch
npm run harness:analyze:stage3-reference-execution-batch:calibrate
npm run harness:check:stage3-reference-execution-batch
```

The vocabulary is declared in:

`reference-artifacts/ingestion/reference-execution-candidate-trials/stage3-semantic-vocabulary-0.1.json`

The batch writes generated candidates and a ranked report to:

`reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-batch.json`

The ranking calibration report is:

`reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-ranking-calibration.json`

Current calibration read: the gate is responsive to group 1/group 4
object-track/path-length and peel-off readability transforms, and the calibrated
ranker now requires player-visible multi-axis lift before a candidate can be
trial-promising. The old geometry-heavy RED-target probe is classified as a
`metric-only-probe`; the direct-line shape+peel candidate is the current
`player-visible-semantic-lift` exemplar. The next allowed Stage 3 step is one
more small semantic batch using this calibrated ranker. Runtime source remains
unauthorized.

## Stage 7 Input Shape

- `candidateId`: stable candidate id.
- `scope`: must remain Stage 7 / Challenge 2 for this pilot.
- `groups`: optional per-group intent controls.
  - `groupIndex`: 1-5.
  - `pathFamily`: candidate path-family intent.
  - `timing`: optional `playbackScale`, `durationScale`, `phaseOffsetS`,
    `spawnOffsetS`, `visibleStartS`, or `visibleEndS`.
  - `controls`: optional `xRangeScale`, `yRangeScale`, `pathLengthScale`,
    direct `pathLength`, turn/reversal scales, or lower-field controls.
  - `lowerField`: optional `lowerFieldShare`, `lowerFieldDelta`,
    `lowerFieldDeltaFromAggregate`, `lowerFieldDeltaFromPrimary`, or
    `targetBlend`.
  - `predictedRuntimeVector`: optional full vector for a candidate already
    measured elsewhere.
- `guardrails.spacingReadability`: pass/fail, spacing score, bunching risk,
  and min-distance read.
- `guardrails.scoreableRoutes`: scoreable-window preservation read.
- `guardrails.safety`: no-shot/no-attack/no-loss read.

A trial can recommend one runtime source candidate only when it predicts a
focused strict object-track improvement, improves group 1, preserves groups 4
and 5, preserves coverage, and has passing spacing/readability,
scoreable-route, and safety guardrails. The semantic batch gate adds stricter
requirements: live path-family authority alignment, runtime-expressibility
mapping, proof artifacts for phase-duration controls, and compiled controls
instead of optimistic trial vectors. The batch report also records compiler
coverage, predicted-vs-proof-backed improvement, source-ready blocker taxonomy,
and the distinction between "blocked by promotion authority" and target
conformance debt. Even then, it is not a runtime keeper; the runtime keeper
still requires source edit, rebuild, before/after visual evidence, focused
strict checks, motion/profile checks, scoreable-route checks, and
no-shot/no-loss safety evidence.

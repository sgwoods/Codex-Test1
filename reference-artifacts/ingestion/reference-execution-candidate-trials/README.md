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
```

For `phase-duration-rebalance`, raw `visibleStartS` / `visibleEndS` trial
vectors are analysis-only. The semantic compiler now emits
`compiledRuntimeControls` mapped to `groupSpawnOffsets` /
`motionSpecGroup.spawnOffsetS`, `phaseDurations.trackS`, and
`referencePath.playbackScale`, but a source-ready candidate still requires the
phase-duration proof to pass the motion/profile proxy, preserve the live
path-family gate, and keep the protected group 4/group 5 timing windows.

For `group1-path-length-compression` and `lower-field-overstay-reduction`, the
batch may record `analysisCompilerMappings` that point at consumed runtime
fields (`referencePath.playbackScale`, `lowerFieldBias`, and `yOffset`). These
are not source-ready compiled controls until a focused browser proof verifies
that the mapping transfers to actual Stage 7 object-track movement without
spacing, scoreable-route, or safety regression.

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

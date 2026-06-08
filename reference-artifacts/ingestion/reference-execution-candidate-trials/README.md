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
scoreable-route, and safety guardrails. Even then, it is not a runtime keeper;
the runtime keeper still requires source edit, rebuild, before/after visual
evidence, focused strict checks, motion/profile checks, scoreable-route checks,
and no-shot/no-loss safety evidence.

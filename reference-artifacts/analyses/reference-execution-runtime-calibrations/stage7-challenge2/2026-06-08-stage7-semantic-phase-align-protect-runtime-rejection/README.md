# Stage 7 Semantic Runtime Calibration Rejection

Generated: 2026-06-08
Branch: `codex/macbook-pro-1.4.1-stage7-object-track-keeper`
Candidate: `stage7-semantic-phase-align-protect-0.1`
Decision: rejected runtime source change

This calibration tried exactly one runtime source projection from the Stage 7 semantic candidate-batch gate. The runtime edit was intentionally narrow: align Stage 7 / Challenge 2 group path-family declarations to the generated semantic candidate while leaving timings, movement controls, reference paths, score windows, and safety behavior untouched.

The source change was not kept. It produced no actual browser-runtime object-track lift and tripped the challenge motion/profile path-order guard while applied. Runtime source and target-contract source were restored to baseline after evidence capture.

## Predicted Vs Actual

| Metric | Batch prediction | Actual browser runtime | Decision read |
| --- | ---: | ---: | --- |
| Total object-track score | 5.0/10 | 4.7/10 | no lift over 4.7/10 baseline |
| Object-track coverage | 0.541 | 0.503 | no lift over 0.503 baseline |
| Group 1 score | 4.0/10 | 3.5/10 | predicted lift did not transfer |
| Group 4 score | 5.3/10 | 5.0/10 | protected floor held, but no predicted lift |
| Group 5 score | 4.9/10 | 4.9/10 | preserved only |
| Canonical path-family match | pass | pass while applied | label projection worked |
| Spacing/readability | predicted pass | failed motion/profile target-order guard while applied | guardrail blocks promotion |
| Scoreable routes | predicted pass | 47 active windows, 0.745 multi-target share | preserved |
| Challenge safety | predicted pass | 0 enemy shots, 0 attack starts, 0 ship losses | preserved |

## Evidence

- Candidate input: `reference-artifacts/analyses/reference-execution-candidate-trials/stage7-challenge2/semantic-batches/2026-06-08T14-13-02-1bea9b6cd/candidates/stage7-semantic-phase-align-protect-0.1.json`
- Candidate trial prediction: `reference-artifacts/analyses/reference-execution-candidate-trials/stage7-challenge2/semantic-batches/2026-06-08T14-13-02-1bea9b6cd/trials/stage7-semantic-phase-align-protect-0.1.json`
- Actual runtime conformance report while the candidate was applied: `reference-artifacts/analyses/challenge-stage-conformance/2026-06-08-42bae02e1/report.json`
- Stage 7 object-track diagram while applied: `reference-artifacts/analyses/challenge-stage-conformance/2026-06-08-42bae02e1/challenge-stage-07-object-track.svg`
- Stage 7 trajectory diagram while applied: `reference-artifacts/analyses/challenge-stage-conformance/2026-06-08-42bae02e1/challenge-stage-07-trajectory.svg`
- Visual review sheet: `stage7-before-after.svg`
- Visual review frames: `frames/`
- Resource log: `reference-artifacts/analyses/conformance-economics/latest-run.json`

## Calibration Read

The semantic language was able to describe the candidate intent and the runtime source could express its canonical path-family labels. The failed transfer came from the candidate-to-runtime projection: the predicted score lift depended on semantic phase-window changes that were not represented by the minimal runtime edit. Path-family label alignment alone did not move actual object tracks.

The motion/profile guard also exposed a target-artifact conflict: the candidate's canonical reference-execution path order differs from the older motion-profile expected path order. That is useful process evidence, not a reason to hand-tune around the guard.

## Next Recommendation

Do not try a second Stage 7 numeric variant from this candidate. Improve the semantic executable-intent layer so `phase-duration-rebalance` compiles to explicit runtime-expressible controls before another runtime source attempt. The next batch should separate:

- label-only canonical-family alignment,
- runtime-expressible timing controls,
- reference-description timing intent that has no current runtime projection,
- guardrail target-artifact conflicts that require source-of-truth reconciliation before promotion.

Until that exists, Stage 7 remains at baseline with no player-facing runtime keeper from this candidate.

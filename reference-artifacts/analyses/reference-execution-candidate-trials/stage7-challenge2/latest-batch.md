# Stage 7 Semantic Candidate Batch

Generated: 2026-06-08T14:13:02.070Z
Commit: 1bea9b6cd
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Recommendation: exactly-one-runtime-source-candidate-to-try

Runtime source candidate: stage7-semantic-phase-align-protect-0.1

Candidate stage7-semantic-phase-align-protect-0.1 is ready for exactly one runtime source attempt, not a runtime keeper.

## Post-Runtime Calibration

Runtime attempt completed on 2026-06-08 and was rejected. The candidate did not
transfer to actual browser runtime: object-track stayed at 4.7/10, coverage
stayed at 0.503, group 1 stayed at 3.5/10, group 4 stayed at 5.0/10, and group
5 stayed at 4.9/10. The applied source projection also failed
`npm run harness:check:challenge-motion-profile` because the generated path
order drifted from the older motion-profile target artifact. Do not retry this
candidate as-is; use the calibration evidence to improve how
`phase-duration-rebalance` compiles to runtime-expressible controls.

Evidence:
`reference-artifacts/analyses/reference-execution-runtime-calibrations/stage7-challenge2/2026-06-08-stage7-semantic-phase-align-protect-runtime-rejection/`

## Candidates

| Candidate | Transformations | Score | Delta | Coverage | G1 | G4 | G5 | Canonical families | Semantic valid | Source-ready | First blockers |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| stage7-semantic-phase-align-protect-0.1 | canonical-family-alignment, phase-duration-rebalance, preserve-scoreable-window, protect-group4-group5 | 5 | 0.3 | 0.541 | 4 | 5.3 | 4.9 | true | true | true | none |
| stage7-semantic-phase-duration-rebalance-0.1 | phase-duration-rebalance | 5 | 0.3 | 0.541 | 4 | 5.3 | 4.9 | false | true | false | group 5: path family boss-led-loop does not match canonical hook-arc |
| stage7-semantic-opener-align-protect-0.1 | canonical-family-alignment, group1-path-length-compression, lower-field-overstay-reduction, preserve-scoreable-window, protect-group4-group5 | 4.8 | 0.1 | 0.507 | 3.5 | 5 | 4.9 | true | true | false | group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-lower-field-overstay-reduction-0.1 | lower-field-overstay-reduction | 4.8 | 0.1 | 0.507 | 3.5 | 5 | 4.9 | false | true | false | group 1 does not improve over baseline 3.5/10<br>group 4: path family hook-arc does not match canonical cross-sweep<br>group 5: path family boss-led-loop does not match canonical hook-arc |
| stage7-semantic-canonical-family-alignment-0.1 | canonical-family-alignment | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | true | true | false | total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-group1-path-compression-0.1 | group1-path-length-compression | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10<br>group 2: path family cross-sweep does not match canonical hook-arc |
| stage7-semantic-preserve-scoreable-window-0.1 | preserve-scoreable-window | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10<br>group 2: path family cross-sweep does not match canonical hook-arc |
| stage7-semantic-protect-group4-group5-0.1 | protect-group4-group5 | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | false | false | group 4 touched but does not match canonical family<br>group 5 touched but does not match canonical family<br>total object-track score lift 0/10 does not exceed 0.05/10 |

## Class Summary

| Class | Candidates | Best candidate | Best delta | Promise kind | Rejection examples |
| --- | ---: | --- | ---: | --- | --- |
| canonical-family-alignment | 3 | stage7-semantic-phase-align-protect-0.1 | 0.3 | runtime-source-candidate-component | stage7-semantic-opener-align-protect-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-canonical-family-alignment-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-canonical-family-alignment-0.1: group 1 does not improve over baseline 3.5/10 |
| group1-path-length-compression | 2 | stage7-semantic-opener-align-protect-0.1 | 0.1 | no-current-promise | stage7-semantic-opener-align-protect-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-group1-path-compression-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-group1-path-compression-0.1: group 1 does not improve over baseline 3.5/10 |
| lower-field-overstay-reduction | 2 | stage7-semantic-opener-align-protect-0.1 | 0.1 | standalone-object-track-signal | stage7-semantic-opener-align-protect-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-lower-field-overstay-reduction-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-lower-field-overstay-reduction-0.1: group 4: path family hook-arc does not match canonical cross-sweep |
| phase-duration-rebalance | 2 | stage7-semantic-phase-align-protect-0.1 | 0.3 | runtime-source-candidate-component | stage7-semantic-phase-duration-rebalance-0.1: group 5: path family boss-led-loop does not match canonical hook-arc |
| preserve-scoreable-window | 3 | stage7-semantic-phase-align-protect-0.1 | 0.3 | runtime-source-candidate-component | stage7-semantic-opener-align-protect-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-preserve-scoreable-window-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-preserve-scoreable-window-0.1: group 1 does not improve over baseline 3.5/10 |
| protect-group4-group5 | 3 | stage7-semantic-phase-align-protect-0.1 | 0.3 | runtime-source-candidate-component | stage7-semantic-opener-align-protect-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-protect-group4-group5-0.1: group 4 touched but does not match canonical family<br>stage7-semantic-protect-group4-group5-0.1: group 5 touched but does not match canonical family |

## Next Step

Improve the semantic compiler/evaluator before another runtime source attempt.
In particular, separate label-only canonical family alignment from
runtime-expressible timing controls, and reconcile reference-execution path
order against the motion-profile target artifact before promotion.

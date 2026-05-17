# Aurora Audio Runtime Trial: challengePerfect rejected

Generated: `2026-05-17T02:18:12.632Z`
Commit: `612f086f (dirty)`

## Decision

`challengePerfect` candidate `perfect-onset-body-separated-soft-tail` is `runtime-trial-rejected`.

Runtime Challenge Perfect candidates remain rejected after confirmation: focused keepers and prechecks can look promising, but repeated live full-theme captures are volatile; runtime was reverted to the stable reference phrase while activity-span and calibrated segment gates remain in the harness.

## Gate Evidence

| Gate | Artifact / Read |
| --- | --- |
| Focused candidate loop | `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-challenge-perfect.json`; candidate-recommended |
| Promotion precheck | `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-17-612f086f-dirty-020503-challengePerfect/report.json`; precheck-trial-allowed |
| Full audio comparison | `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-17-main-612f086f-021222/metrics.json`; latest cue risk 2.51/10 |
| Event-gap rollup | `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`; current highest challengeTransition 4.28/10 |
| Quality score | `reference-artifacts/analyses/quality-conformance/2026-05-17-612f086f/report.json`; audio 7.2/10, overall 9.2/10 |

## Learning

- Focused cue similarity and promotion precheck are necessary but not sufficient for release-safe runtime promotion.
- Runtime audio candidates must be validated through the same full-theme live capture and quality gates that drive release scoring.
- challengePerfect candidate history should guide the next generator pass, but rejected runtime decisions must block direct promotion until the failed gate is specifically addressed.

## Next Step

Do not promote Challenge Perfect runtime audio yet. Keep the new harness evidence, stabilize repeated full-theme capture, then compare bossHit, challengeTransition, and gameOver for the next best audio return.


# Aurora Audio Runtime Trial: challengePerfect rejected

Generated: `2026-05-17T02:07:22.535Z`
Commit: `612f086f (dirty)`

## Decision

`challengePerfect` candidate `perfect-onset-body-separated-brief-medium-tail` is `runtime-trial-rejected`.

Guarded runtime trial rejected: brief-medium-tail improved the focused candidate read but live full-theme event-gap worsened average worst-segment risk to 3.93/10 and moved highest risk to challengeTransition, so it did not beat the accepted soft-tail runtime state.

## Gate Evidence

| Gate | Artifact / Read |
| --- | --- |
| Focused candidate loop | `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-challenge-perfect.json`; candidate-recommended |
| Promotion precheck | `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-17-612f086f-dirty-020503-challengePerfect/report.json`; precheck-trial-allowed |
| Full audio comparison | `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-17-main-612f086f-020525/metrics.json`; latest cue risk 2.65/10 |
| Event-gap rollup | `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`; current highest challengeTransition 4.28/10 |
| Quality score | `reference-artifacts/analyses/quality-conformance/2026-05-17-612f086f/report.json`; audio 7/10, overall 9.2/10 |

## Learning

- Focused cue similarity and promotion precheck are necessary but not sufficient for release-safe runtime promotion.
- Runtime audio candidates must be validated through the same full-theme live capture and quality gates that drive release scoring.
- challengePerfect candidate history should guide the next generator pass, but rejected runtime decisions must block direct promotion until the failed gate is specifically addressed.

## Next Step

Keep the accepted separated-soft-tail runtime cue. Use brief-medium only as candidate-history evidence and tune bossHit or challengeTransition next.

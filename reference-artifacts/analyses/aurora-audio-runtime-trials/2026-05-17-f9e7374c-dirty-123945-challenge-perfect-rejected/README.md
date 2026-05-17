# Aurora Audio Runtime Trial: challengePerfect rejected

Generated: `2026-05-17T12:39:45.699Z`
Commit: `f9e7374c (dirty)`

## Decision

`challengePerfect` candidate `perfect-clean-onset-soft-tail` is `runtime-trial-rejected`.

Challenge Perfect runtime trial rejected: the focused/stability-gated candidate improved the average worst-segment rollup, but live full-theme recapture worsened Challenge Perfect itself to 7.7/10 as the highest audio risk, so this is preserved as generator evidence and not promoted.

## Gate Evidence

| Gate | Artifact / Read |
| --- | --- |
| Focused candidate loop | `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-challenge-perfect.json`; candidate-recommended |
| Promotion precheck | `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-17-f9e7374c-dirty-121214-challengePerfect/report.json`; precheck-trial-allowed |
| Full audio comparison | `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-17-main-f9e7374c-123530/metrics.json`; latest cue risk 7.7/10 |
| Event-gap rollup | `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`; current highest challengePerfect 7.7/10 |
| Quality score | `reference-artifacts/analyses/quality-conformance/2026-05-17-ab80e4c7/report.json`; audio 7.2/10, overall 9.2/10 |

## Learning

- Focused cue similarity and promotion precheck are necessary but not sufficient for release-safe runtime promotion.
- Runtime audio candidates must be validated through the same full-theme live capture and quality gates that drive release scoring.
- challengePerfect candidate history should guide the next generator pass, but rejected runtime decisions must block direct promotion until the failed gate is specifically addressed.

## Next Step

Do not promote Challenge Perfect from isolated onset/body candidates. Replace the next audio strategy with full-phrase/segment-boundary work: stabilize the scorer on canonical reference-vs-reference capture, then generate candidates that optimize onset, body, tail, and live capture segmentation together.


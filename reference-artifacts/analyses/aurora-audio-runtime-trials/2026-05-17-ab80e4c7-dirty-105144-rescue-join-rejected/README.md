# Aurora Audio Runtime Trial: rescueJoin rejected

Generated: `2026-05-17T10:51:44.162Z`
Commit: `ab80e4c7 (dirty)`

## Decision

`rescueJoin` candidate `refclip-s2399-d300-v116` is `runtime-trial-rejected`.

Focused and precheck evidence looked strong, but the measured runtime trial did not improve rescueJoin in the live full-theme event-gap report and worsened aggregate/highest audio risk; runtime cue was reverted.

## Gate Evidence

| Gate | Artifact / Read |
| --- | --- |
| Focused candidate loop | `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-rescue-join.json`; candidate-recommended |
| Promotion precheck | `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-17-ab80e4c7-dirty-104323-rescueJoin/report.json`; precheck-trial-allowed |
| Full audio comparison | `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-17-main-ab80e4c7-104719/metrics.json`; latest cue risk 3.57/10 |
| Event-gap rollup | `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`; current highest challengePerfect 7.07/10 |
| Quality score | `reference-artifacts/analyses/quality-conformance/2026-05-17-ab80e4c7/report.json`; audio 7.3/10, overall 9.2/10 |

## Learning

- Focused cue similarity and promotion precheck are necessary but not sufficient for release-safe runtime promotion.
- Runtime audio candidates must be validated through the same full-theme live capture and quality gates that drive release scoring.
- rescueJoin candidate history should guide the next generator pass, but rejected runtime decisions must block direct promotion until the failed gate is specifically addressed.

## Next Step

Do not retry this rescueJoin subwindow directly. Use the audio risk stability report to require repeated or median full-theme confirmation before runtime promotion, then return to challengePerfect/gameOver only after capture volatility is controlled.

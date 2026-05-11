# Aurora Audio Runtime Trial: playerHit Rejected

Generated: `2026-05-11T13:31:00.000Z`

## Decision

`playerHit` candidate `promoted-active-window` was rejected for runtime
promotion.

The focused candidate loop was strong, and the promotion precheck correctly
allowed a runtime trial. The real full-theme trial did not hold: audio category
score fell to `7.2/10`, and the full event-gap rollup still reported
`playerHit` body as the highest active segment risk.

## Evidence

| Step | Artifact | Read |
| --- | --- | --- |
| Focused candidate loop | `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-11-44ac29aa-dirty-audio-focus-131800/ship-loss/report.json` | Candidate cleared focused keeper gates; loss composite `8.82/10`. |
| Promotion precheck | `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-132309-playerHit/report.json` | Runtime trial allowed, not automatic promotion. |
| Runtime trial | `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-44ac29aa-132328/metrics.json` | Full-theme active body/tail segmentation still failed. |
| Post-revert score | `reference-artifacts/analyses/quality-conformance/2026-05-11-44ac29aa/report.json` | Overall `9.2/10`; audio `7.3/10`; highest risk still `playerHit` body. |

## Learning

Focused cue similarity is not enough for composite death/loss phrases. The next
playerHit pass should either split onset/body/tail into runtime cue phases or
make the analyzer explicitly evaluate scheduled composite coverage against the
intended reference sub-events.

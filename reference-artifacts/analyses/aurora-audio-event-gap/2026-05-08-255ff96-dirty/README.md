# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T11:44:36.840Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-255ff96/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 7
- Highest event-gap risk: challengePerfect (7.35/10 risk)

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Best segment | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| 1 | challengePerfect | Challenge Perfect | 7.35 | broad-reference-window-needs-segmentation | 2.3s | 1163.3 Hz | 0.496 | Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring. |
| 2 | challengeResults | Challenge Results | 5.51 | broad-reference-window-needs-segmentation | 2.461s | 621.5 Hz | 0.649 | Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring. |
| 3 | stagePulse | Formation Pulse | 5.19 | broad-reference-window-needs-segmentation | 5.955s | 21.7 Hz | 0.592 | Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring. |
| 4 | highScoreOther | High Score 2nd-10th | 5 | broad-reference-window-needs-segmentation | 10.416s | 416.9 Hz | 0.783 | Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring. |
| 5 | attractPulse | Demo Pulse | 4.9 | broad-reference-window-needs-segmentation | 3.103s | 113.6 Hz | 0.546 | Promote a narrower reference subwindow before runtime tuning; the current reference window is too broad for confident scoring. |
| 6 | enemyShot | Enemy Shot | 4.31 | active-segment-detected | 2.405s | 598.6 Hz | n/a | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 7 | playerShot | Player Shot | 4.3 | active-segment-detected | 2.395s | 605.7 Hz | n/a | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 8 | bossHit | Boss Hit | 4.27 | active-segment-detected | 2.395s | 601 Hz | n/a | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 9 | gameStart | Stage Start | 4.26 | direct-cue-comparison | 3.812s | 212.7 Hz | 0.589 | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 10 | captureSuccess | Fighter Captured | 4.15 | direct-cue-comparison | 2.186s | 672.3 Hz | 0.642 | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 11 | playerHit | Ship Loss | 3.83 | active-segment-detected | 2.714s | 333 Hz | n/a | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 12 | rescueJoin | Rescue Join | 3.82 | direct-cue-comparison | 0.339s | 244.4 Hz | 0.531 | Revisit reference segment choice; best candidate match is weak. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Promote narrower reference subwindows for the broadest remaining cues, then tune the highest-risk runtime cue.

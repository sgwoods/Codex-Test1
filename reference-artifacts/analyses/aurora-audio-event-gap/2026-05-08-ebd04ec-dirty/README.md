# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T12:17:52.609Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-ebd04ec/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Highest event-gap risk: gameOver (3.82/10 risk)

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Best segment | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| 1 | gameOver | Game Over | 3.82 | direct-cue-comparison | 9.39s | 96.7 Hz | 0.902 | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 2 | attractPulse | Demo Pulse | 3.61 | active-segment-detected | 2.075s | 290.9 Hz | 0.582 | Shorten or split the runtime cue to match the active reference phrase before timbre tuning. |
| 3 | challengePerfect | Challenge Perfect | 3.47 | direct-cue-comparison | 0s | 879.7 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 4 | captureBeam | Capture Beam | 3.36 | direct-cue-comparison | 0.141s | 630.2 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 5 | challengeResults | Challenge Results | 3.23 | direct-cue-comparison | 0.06s | 644.4 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | captureSuccess | Fighter Captured | 2.91 | direct-cue-comparison | 0.021s | 670.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 7 | enemyShot | Enemy Shot | 2.78 | active-segment-detected | 1.037s | 526.4 Hz | 0.914 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 8 | playerShot | Player Shot | 2.78 | active-segment-detected | 1.037s | 526.4 Hz | 0.914 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 9 | bossHit | Boss Hit | 2.75 | active-segment-detected | 0.987s | 539.5 Hz | 0.843 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 10 | rescueJoin | Rescue Join | 2.55 | direct-cue-comparison | 0s | 245.6 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | stagePulse | Formation Pulse | 2.55 | direct-cue-comparison | 0.03s | 48.2 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | highScoreFirst | High Score 1st | 2.14 | direct-cue-comparison | 0s | 702.9 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest-risk runtime cue next: Game Over. Rerun audio comparison and event-gap analysis after the change.

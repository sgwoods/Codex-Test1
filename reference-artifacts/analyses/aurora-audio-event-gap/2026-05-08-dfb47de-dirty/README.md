# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T13:04:14.170Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-dfb47de/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Highest event-gap risk: challengePerfect (3.5/10 risk)

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Best segment | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| 1 | challengePerfect | Challenge Perfect | 3.5 | direct-cue-comparison | 0.06s | 817 Hz | 0.581 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 2 | captureBeam | Capture Beam | 3.36 | direct-cue-comparison | 0.141s | 632.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 3 | challengeResults | Challenge Results | 2.96 | direct-cue-comparison | 0s | 563.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 4 | captureSuccess | Fighter Captured | 2.89 | direct-cue-comparison | 0.021s | 657.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 5 | enemyShot | Enemy Shot | 2.78 | active-segment-detected | 1.037s | 526.4 Hz | 0.914 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | playerShot | Player Shot | 2.78 | active-segment-detected | 1.037s | 526.4 Hz | 0.914 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 7 | attractPulse | Demo Pulse | 2.77 | direct-cue-comparison | 0.03s | 105.7 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 8 | bossHit | Boss Hit | 2.76 | active-segment-detected | 0.977s | 541.2 Hz | 0.859 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 9 | rescueJoin | Rescue Join | 2.61 | direct-cue-comparison | 0s | 272.5 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | stagePulse | Formation Pulse | 2.53 | direct-cue-comparison | 0.03s | 53.1 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | playerHit | Ship Loss | 2.46 | active-segment-detected | 0.608s | 280 Hz | 0.69 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | highScoreFirst | High Score 1st | 2.15 | direct-cue-comparison | 0s | 712.8 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest-risk runtime cue next: Challenge Perfect. Rerun audio comparison and event-gap analysis after the change.

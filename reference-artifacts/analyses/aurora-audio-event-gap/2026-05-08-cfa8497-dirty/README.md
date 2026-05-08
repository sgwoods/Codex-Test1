# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T17:06:31.338Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-cfa8497/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: challengePerfect (3.5/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Best segment | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| 1 | challengePerfect | Challenge Perfect | 3.5 | direct-cue-comparison | 0.06s | 817 Hz | 0.581 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 2 | captureBeam | Capture Beam | 3.38 | direct-cue-comparison | 0.141s | 632.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 3 | challengeResults | Challenge Results | 2.95 | direct-cue-comparison | 0s | 559.1 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 4 | playerShot | Player Shot | 2.93 | direct-cue-comparison | 0.04s | 749.6 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 5 | captureSuccess | Fighter Captured | 2.89 | direct-cue-comparison | 0.021s | 665.4 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | rescueJoin | Rescue Join | 2.7 | direct-cue-comparison | 0s | 316.5 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 7 | attractPulse | Demo Pulse | 2.66 | direct-cue-comparison | 0.03s | 37.5 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 8 | stagePulse | Formation Pulse | 2.55 | direct-cue-comparison | 0.03s | 48.2 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | enemyShot | Enemy Shot | 2.41 | direct-cue-comparison | 0.02s | 590.1 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 10 | playerHit | Ship Loss | 2.28 | active-segment-detected | 0.548s | 259.1 Hz | 0.713 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | highScoreFirst | High Score 1st | 2.18 | direct-cue-comparison | 0s | 736.4 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 12 | challengeTransition | Challenge Transition | 1.96 | direct-cue-comparison | 0s | 467.9 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest-risk runtime cue next: Challenge Perfect. Rerun audio comparison and event-gap analysis after the change.


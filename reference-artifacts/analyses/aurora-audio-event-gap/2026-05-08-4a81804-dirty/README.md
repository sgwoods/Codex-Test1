# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T19:46:56.315Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-4a81804/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 37
- Average worst segment risk: 4.63/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: captureBeam (4.14/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | captureBeam | Capture Beam | 4.14 | direct-cue-comparison | 0.141s | 709.4 Hz | onset | 5.77 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 2 | challengePerfect | Challenge Perfect | 4.01 | direct-cue-comparison | 0.06s | 795.9 Hz | body | 7.38 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 3 | playerShot | Player Shot | 4 | direct-cue-comparison | 0.04s | 797.5 Hz | onset | 6.69 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | captureSuccess | Fighter Captured | 3.93 | direct-cue-comparison | 0.021s | 749.5 Hz | onset | 7.03 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 5 | challengeResults | Challenge Results | 3.36 | direct-cue-comparison | 0.06s | 575.8 Hz | onset | 3.63 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | enemyShot | Enemy Shot | 3.13 | direct-cue-comparison | 0.02s | 699.6 Hz | onset | 4.25 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 7 | attractPulse | Demo Pulse | 3.11 | direct-cue-comparison | 0.03s | 105.7 Hz | onset | 4.04 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 8 | rescueJoin | Rescue Join | 3.1 | direct-cue-comparison | 0s | 273.4 Hz | body | 3.91 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | stagePulse | Formation Pulse | 2.9 | direct-cue-comparison | 0.03s | 53.1 Hz | onset | 4.59 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | playerHit | Ship Loss | 2.85 | active-segment-detected | 0.608s | 280 Hz | tail | 4.54 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 11 | highScoreFirst | High Score 1st | 2.62 | direct-cue-comparison | 0s | 716.8 Hz | onset | 5.69 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 12 | challengeTransition | Challenge Transition | 2.59 | direct-cue-comparison | 0s | 470.2 Hz | onset | 5.74 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: challengePerfect body. Rerun audio comparison and event-gap analysis after the change.


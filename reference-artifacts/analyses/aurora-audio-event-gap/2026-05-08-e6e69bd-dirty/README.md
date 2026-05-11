# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T20:37:20.653Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-e6e69bd/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 37
- Average worst segment risk: 4.73/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: challengePerfect (4.43/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | challengePerfect | Challenge Perfect | 4.43 | direct-cue-comparison | 0.06s | 859.1 Hz | body | 8.37 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | captureSuccess | Fighter Captured | 3.87 | direct-cue-comparison | 0.021s | 746.1 Hz | onset | 6.5 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 3 | playerShot | Player Shot | 3.87 | direct-cue-comparison | 0.04s | 810.4 Hz | onset | 5.48 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | challengeResults | Challenge Results | 3.72 | direct-cue-comparison | 0.06s | 685.8 Hz | onset | 4.09 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 5 | captureBeam | Capture Beam | 3.7 | direct-cue-comparison | 0.021s | 607.4 Hz | onset | 5.08 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | enemyShot | Enemy Shot | 3.53 | direct-cue-comparison | 0.02s | 754.4 Hz | onset | 6.14 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | rescueJoin | Rescue Join | 3.19 | direct-cue-comparison | 0s | 298.7 Hz | body | 4.7 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | attractPulse | Demo Pulse | 3.11 | direct-cue-comparison | 0.03s | 116 Hz | onset | 4.05 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | stagePulse | Formation Pulse | 2.84 | direct-cue-comparison | 0.03s | 7.7 Hz | onset | 4.85 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | highScoreFirst | High Score 1st | 2.65 | direct-cue-comparison | 0s | 685.6 Hz | body | 6.21 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 11 | challengeTransition | Challenge Transition | 2.55 | direct-cue-comparison | 0s | 490.5 Hz | onset | 5.01 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 12 | highScoreOther | High Score 2nd-10th | 2.51 | direct-cue-comparison | 0.05s | 638.1 Hz | tail | 5.09 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: challengePerfect body. Rerun audio comparison and event-gap analysis after the change.


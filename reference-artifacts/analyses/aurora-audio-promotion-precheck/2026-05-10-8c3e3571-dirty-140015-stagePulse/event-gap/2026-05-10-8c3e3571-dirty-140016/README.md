# Aurora Audio Event Gap Analysis

Generated: `2026-05-10T14:00:16.009Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-10-8c3e3571-dirty-140015-stagePulse/candidate-theme-metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.65/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: captureBeam (4.82/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: -0.22/10
- Highest-risk cue changed: yes (stagePulse -> captureBeam)
- Strongest improvement: stagePulse (-4.77)
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | -4.53 | -4.77 | 0.18s | -806.7 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| playerShot | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| challengePerfect | 0 | 0 | 0s | 0 Hz |
| gameStart | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | captureBeam | Capture Beam | 4.82 | medium-high | curated-reference-segmentation | 0.048s | 182 Hz | tail | 5.56 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | attractPulse | Demo Pulse | 4.24 | high | single-reference-body | 0.029s | 564.7 Hz | onset | 6.17 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | challengeTransition | Challenge Transition | 3.77 | high | single-reference-body | 0.019s | 451.6 Hz | onset | 4.61 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 4 | playerShot | Player Shot | 3.63 | high | curated-reference-segmentation | 0.101s | 136.2 Hz | onset | 2.12 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 5 | challengeResults | Challenge Results | 3.53 | medium-high | curated-reference-segmentation | 0.041s | 404.1 Hz | onset | 5.53 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | rescueJoin | Rescue Join | 3.05 | high | single-reference-body | 0.031s | 397.6 Hz | onset | 5.78 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | challengePerfect | Challenge Perfect | 2.05 | high | single-reference-body | 0.131s | 157.8 Hz | onset | 4.87 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | gameStart | Stage Start | 1.95 | medium | single-reference-body | 0.01s | 342.9 Hz | onset | 5.55 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.94 | high | curated-reference-segmentation | 0.089s | 24.4 Hz | onset | 2.19 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | highScoreOther | High Score 2nd-10th | 1.9 | high | single-reference-body | 0.089s | 341.1 Hz | onset | 3.1 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | highScoreFirst | High Score 1st | 1.72 | high | single-reference-body | 0.04s | 211.6 Hz | onset | 2.83 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | captureRetreat | Capture Retreat | 1.7 | medium | single-reference-body | 0.05s | 183.6 Hz | onset | 3.57 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: attractPulse onset. Rerun audio comparison and event-gap analysis after the change.

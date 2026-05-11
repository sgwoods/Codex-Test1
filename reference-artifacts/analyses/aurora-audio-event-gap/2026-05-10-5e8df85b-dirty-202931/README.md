# Aurora Audio Event Gap Analysis

Generated: `2026-05-10T20:29:31.477Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-5e8df85b-202651/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.7/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.14/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| highScoreFirst | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |
| enemyHit | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.14 | high | single-reference-body | 0.019s | 783.8 Hz | onset | 7.17 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.28 | high | single-reference-body | 0.021s | 543.6 Hz | onset | 5.52 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | captureBeam | Capture Beam | 3.19 | medium-high | curated-reference-segmentation | 0.118s | 265.5 Hz | tail | 5.57 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 4 | rescueJoin | Rescue Join | 3.05 | high | single-reference-body | 0.031s | 422 Hz | onset | 5.14 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | highScoreFirst | High Score 1st | 2.83 | high | single-reference-body | 0.07s | 210.2 Hz | onset | 2.44 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 6 | challengeResults | Challenge Results | 2.81 | medium-high | curated-reference-segmentation | 0.079s | 282.9 Hz | body | 5.99 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 7 | challengeTransition | Challenge Transition | 2.43 | high | single-reference-body | 0.129s | 525.1 Hz | onset | 4.87 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 8 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.89 | high | curated-reference-segmentation | 0.079s | 33.2 Hz | onset | 2.02 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | highScoreOther | High Score 2nd-10th | 1.78 | high | single-reference-body | 0.049s | 344.4 Hz | onset | 2.6 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | enemyHit | Enemy Hit | 1.77 | high | curated-reference-segmentation | 0.04s | 11.8 Hz | onset | 2.09 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 11 | captureSuccess | Fighter Captured | 1.64 | high | segmented-reference | 0.029s | 211.4 Hz | body | 4.45 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | captureRetreat | Capture Retreat | 1.62 | medium | single-reference-body | 0.05s | 142.7 Hz | onset | 3.48 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

# Aurora Audio Event Gap Analysis

Generated: `2026-05-10T13:07:00.854Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-41f7caa8-130410/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.19/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.18/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| playerHit | 0 | 0 | 0s | 0 Hz |
| highScoreFirst | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.18 | high | single-reference-body | 0.009s | 779.7 Hz | onset | 7.04 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | playerHit | Ship Loss | 5.1 | medium-high | curated-reference-segmentation | 0.568s | 818.6 Hz | body | 7.27 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 3 | highScoreFirst | High Score 1st | 4.71 | high | single-reference-body | 0.11s | 384 Hz | onset | 5.6 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | attractPulse | Demo Pulse | 4.34 | high | single-reference-body | 0.009s | 551.6 Hz | onset | 5.55 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | rescueJoin | Rescue Join | 3.28 | high | single-reference-body | 0.051s | 394.1 Hz | onset | 5.37 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | captureBeam | Capture Beam | 3.06 | medium-high | curated-reference-segmentation | 0.148s | 221.2 Hz | tail | 5.22 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 7 | challengeResults | Challenge Results | 2.79 | medium-high | curated-reference-segmentation | 0.079s | 264.1 Hz | onset | 5.87 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | challengeTransition | Challenge Transition | 2.36 | high | single-reference-body | 0.129s | 494.4 Hz | onset | 4.71 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 9 | highScoreOther | High Score 2nd-10th | 2.35 | high | single-reference-body | 0.109s | 390.9 Hz | onset | 3.84 | Revisit reference segment choice; best candidate match is weak. |
| 10 | capturedFighterDestroyed | Captured Fighter Destroyed | 2.08 | high | curated-reference-segmentation | 0.069s | 140.6 Hz | onset | 2.04 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | enemyHit | Enemy Hit | 1.85 | high | curated-reference-segmentation | 0.04s | 63.2 Hz | onset | 1.99 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | captureRetreat | Capture Retreat | 1.7 | medium | single-reference-body | 0.05s | 183.6 Hz | onset | 3.57 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit body. Rerun audio comparison and event-gap analysis after the change.


# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T21:38:29.496Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-09-bbcc8df1-dirty-playerHit/candidate-theme-metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.32/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.15/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: -0.17/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: playerHit (-3.65)
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| playerHit | -4.14 | -3.65 | -0.179s | -822.4 Hz |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.15 | high | single-reference-body | 0.019s | 786.2 Hz | onset | 7.22 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.38 | high | single-reference-body | 0.019s | 587.7 Hz | onset | 5.42 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | enemyBoom | Enemy Boom | 3.66 | high | curated-reference-segmentation | 0.059s | 659.4 Hz | onset | 4.66 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | challengeTransition | Challenge Transition | 3.57 | high | single-reference-body | 0.039s | 475 Hz | onset | 5.12 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 5 | rescueJoin | Rescue Join | 3.28 | high | single-reference-body | 0.051s | 394 Hz | onset | 5.37 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | bossHit | Boss Hit | 3.24 | high | curated-reference-segmentation | 0.029s | 572.4 Hz | onset | 5.59 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | captureBeam | Capture Beam | 3.19 | medium-high | curated-reference-segmentation | 0.148s | 228.7 Hz | tail | 5.04 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | challengeResults | Challenge Results | 3.01 | medium-high | curated-reference-segmentation | 0.069s | 319.5 Hz | onset | 6.28 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | bossBoom | Boss Boom | 2.11 | medium-high | curated-reference-segmentation | 0.129s | 309.8 Hz | body | 4.26 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 10 | highScoreOther | High Score 2nd-10th | 2.1 | high | single-reference-body | 0.099s | 334.6 Hz | onset | 3.02 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.89 | high | curated-reference-segmentation | 0.079s | 33.2 Hz | onset | 2.02 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | playerShot | Player Shot | 1.84 | high | curated-reference-segmentation | 0.019s | 137.6 Hz | onset | 2.49 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


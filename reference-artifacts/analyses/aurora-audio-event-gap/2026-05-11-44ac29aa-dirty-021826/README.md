# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T02:18:26.809Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-44ac29aa-021631/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.92/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.02/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: -0.01/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: rescueJoin (-1.38)
- Strongest regression: capturedFighterDestroyed (+2.22)

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| capturedFighterDestroyed | 0.86 | 2.22 | 0.009s | 231.1 Hz |
| rescueJoin | -1.55 | -1.38 | -0.139s | -18.4 Hz |
| highScoreOther | 0.47 | 1.02 | 0.01s | 32.7 Hz |
| enemyBoom | 0.04 | -0.85 | 0.01s | 34.8 Hz |
| bossBoom | -1.9 | -0.75 | -0.089s | -301.2 Hz |
| playerShot | -0.23 | -0.65 | -0.018s | 33.3 Hz |
| attractPulse | 0.05 | -0.58 | -0.129s | -14 Hz |
| enemyShot | 0.07 | 0.42 | 0.02s | -43.5 Hz |
| enemyHit | 0.31 | 0.24 | 0s | 178.7 Hz |
| stagePulse | -0.32 | 0.23 | 0.018s | -17.2 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.02 | high | single-reference-body | 0.029s | 797.4 Hz | onset | 7.18 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.19 | high | single-reference-body | 0.001s | 549.1 Hz | onset | 5.42 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | rescueJoin | Rescue Join | 3.27 | high | single-reference-body | 0.051s | 398.6 Hz | onset | 4.69 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | captureBeam | Capture Beam | 3.18 | medium-high | curated-reference-segmentation | 0.148s | 233.1 Hz | tail | 5.05 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 5 | capturedFighterDestroyed | Captured Fighter Destroyed | 2.81 | high | curated-reference-segmentation | 0.069s | 372.5 Hz | onset | 3.82 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 6 | challengeResults | Challenge Results | 2.72 | medium-high | curated-reference-segmentation | 0.079s | 258.8 Hz | onset | 5.66 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | challengeTransition | Challenge Transition | 2.4 | high | single-reference-body | 0.139s | 475.5 Hz | onset | 4.92 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 8 | highScoreOther | High Score 2nd-10th | 2.35 | high | single-reference-body | 0.099s | 363.6 Hz | onset | 4.29 | Revisit reference segment choice; best candidate match is weak. |
| 9 | enemyHit | Enemy Hit | 2.08 | high | curated-reference-segmentation | 0.04s | 190.5 Hz | onset | 2.33 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 10 | gameOver | Game Over | 1.8 | medium | single-reference-body | 0.302s | 531 Hz | onset | 5.41 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 11 | highScoreFirst | High Score 1st | 1.77 | high | single-reference-body | 0.04s | 211.8 Hz | onset | 2.88 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | captureRetreat | Capture Retreat | 1.69 | medium | single-reference-body | 0.05s | 157.1 Hz | onset | 3.48 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

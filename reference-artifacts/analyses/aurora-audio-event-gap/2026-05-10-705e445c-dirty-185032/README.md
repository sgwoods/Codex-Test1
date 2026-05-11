# Aurora Audio Event Gap Analysis

Generated: `2026-05-10T18:50:32.882Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-705e445c-183519/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.9/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.23/10 risk)

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
| challengeResults | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| enemyShot | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| gameStart | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.23 | high | single-reference-body | 0.029s | 825.1 Hz | onset | 7.25 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.29 | high | single-reference-body | 0.011s | 610.5 Hz | onset | 5.24 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | challengeResults | Challenge Results | 3.53 | medium-high | curated-reference-segmentation | 0.041s | 404.1 Hz | onset | 5.53 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | rescueJoin | Rescue Join | 3.44 | high | single-reference-body | 0.141s | 393.9 Hz | onset | 5.13 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | bossBoom | Boss Boom | 3.15 | medium-high | curated-reference-segmentation | 0.039s | 197.7 Hz | onset | 5.07 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | enemyShot | Enemy Shot | 2.78 | high | curated-reference-segmentation | 0.071s | 65.6 Hz | onset | 1.78 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 7 | captureBeam | Capture Beam | 2.67 | medium-high | curated-reference-segmentation | 0.001s | 220.8 Hz | tail | 5.07 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | gameStart | Stage Start | 2.38 | medium | single-reference-body | 0.158s | 285.5 Hz | onset | 5.38 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | highScoreOther | High Score 2nd-10th | 2.33 | high | single-reference-body | 0.099s | 375.6 Hz | onset | 4.23 | Revisit reference segment choice; best candidate match is weak. |
| 10 | challengeTransition | Challenge Transition | 1.92 | high | single-reference-body | 0.029s | 439.3 Hz | onset | 4.11 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.88 | high | curated-reference-segmentation | 0.079s | 28.8 Hz | onset | 2.19 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | enemyHit | Enemy Hit | 1.8 | high | curated-reference-segmentation | 0.05s | 61.9 Hz | onset | 1.86 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

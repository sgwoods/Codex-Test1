# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T18:01:16.554Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-23c856ad-175746/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.8/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerHit (6.19/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (playerHit -> playerHit)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| playerHit | 0 | 0 | 0s | 0 Hz |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| enemyShot | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| playerShot | 0 | 0 | 0s | 0 Hz |
| gameStart | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | playerHit | Ship Loss | 6.19 | medium-high | curated-reference-segmentation | 0.572s | 763.2 Hz | tail | 7.37 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | stagePulse | Formation Pulse | 4.75 | high | single-reference-body | 0.04s | 774.8 Hz | onset | 6.63 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | attractPulse | Demo Pulse | 3.81 | high | single-reference-body | 0.191s | 532.9 Hz | onset | 5.81 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | captureBeam | Capture Beam | 3.17 | medium-high | curated-reference-segmentation | 0.04s | 156.8 Hz | tail | 6.16 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 5 | enemyShot | Enemy Shot | 2.97 | high | curated-reference-segmentation | 0.199s | 224.1 Hz | onset | 2.25 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 6 | challengeResults | Challenge Results | 2.94 | medium-high | curated-reference-segmentation | 0.051s | 217.9 Hz | onset | 4.76 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | rescueJoin | Rescue Join | 2.93 | high | single-reference-body | 0.19s | 335.6 Hz | onset | 5.08 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | bossBoom | Boss Boom | 2.72 | medium-high | curated-reference-segmentation | 0.051s | 263.6 Hz | body | 4.34 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 9 | playerShot | Player Shot | 2.63 | high | curated-reference-segmentation | 0.131s | 207.2 Hz | onset | 2.21 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | gameStart | Stage Start | 2.51 | medium | single-reference-body | 0.158s | 318.4 Hz | onset | 5.18 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 11 | challengeTransition | Challenge Transition | 2.1 | high | single-reference-body | 0.019s | 417.8 Hz | onset | 3.85 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | highScoreOther | High Score 2nd-10th | 1.91 | high | single-reference-body | 0.051s | 289.7 Hz | onset | 2.78 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit tail. Rerun audio comparison and event-gap analysis after the change.


# Aurora Audio Event Gap Analysis

Generated: `2026-05-10T17:58:07.340Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-9ddc6104-174910/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.07/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerHit (6.74/10 risk)

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
| playerShot | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| enemyShot | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| enemyHit | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | playerHit | Ship Loss | 6.74 | medium-high | curated-reference-segmentation | 0.465s | 960.3 Hz | body | 8.54 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | stagePulse | Formation Pulse | 5.21 | high | single-reference-body | 0.001s | 851.5 Hz | onset | 6.7 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | attractPulse | Demo Pulse | 3.44 | high | single-reference-body | 0.13s | 513.9 Hz | onset | 5.8 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | playerShot | Player Shot | 3.24 | high | curated-reference-segmentation | 0.091s | 107.8 Hz | onset | 1.66 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 5 | rescueJoin | Rescue Join | 3.12 | high | single-reference-body | 0.031s | 442.3 Hz | onset | 4.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | enemyShot | Enemy Shot | 3.03 | high | curated-reference-segmentation | 0.081s | 61.7 Hz | onset | 2.67 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 7 | challengeResults | Challenge Results | 2.98 | medium-high | curated-reference-segmentation | 0.069s | 314.1 Hz | onset | 6.26 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | enemyHit | Enemy Hit | 2.88 | high | curated-reference-segmentation | 0.209s | 540.2 Hz | onset | 1.6 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 9 | captureBeam | Capture Beam | 2.86 | medium-high | curated-reference-segmentation | 0.108s | 241.7 Hz | tail | 5.34 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 10 | highScoreOther | High Score 2nd-10th | 2.52 | high | single-reference-body | 0.109s | 408.7 Hz | onset | 3.17 | Revisit reference segment choice; best candidate match is weak. |
| 11 | enemyBoom | Enemy Boom | 2.44 | high | curated-reference-segmentation | 0.1s | 493 Hz | onset | 3.3 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | bossBoom | Boss Boom | 2.27 | medium-high | curated-reference-segmentation | 0.109s | 129.8 Hz | body | 3.47 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit body. Rerun audio comparison and event-gap analysis after the change.

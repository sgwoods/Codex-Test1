# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T19:01:30.417Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-d3306518/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.12/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.11/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| playerShot | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengePerfect | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.11 | high | single-reference-body | 0.009s | 765.8 Hz | onset | 7.14 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | captureBeam | Capture Beam | 4.82 | medium-high | curated-reference-segmentation | 0.058s | 252.6 Hz | tail | 5.32 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 3 | enemyBoom | Enemy Boom | 4.28 | high | curated-reference-segmentation | 0.061s | 574 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | attractPulse | Demo Pulse | 4.23 | high | single-reference-body | 0.001s | 548.8 Hz | onset | 5.58 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | bossBoom | Boss Boom | 3.57 | medium-high | curated-reference-segmentation | 0.029s | 309.4 Hz | onset | 4.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | playerShot | Player Shot | 3.19 | high | curated-reference-segmentation | 0.091s | 124.2 Hz | onset | 1.16 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 7 | challengeResults | Challenge Results | 3.15 | medium-high | curated-reference-segmentation | 0.031s | 293.6 Hz | onset | 4.93 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | challengePerfect | Challenge Perfect | 3.13 | high | single-reference-body | 0.17s | 107 Hz | onset | 4.92 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | rescueJoin | Rescue Join | 3.12 | high | single-reference-body | 0.031s | 442.3 Hz | onset | 4.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | bossHit | Boss Hit | 2.83 | high | curated-reference-segmentation | 0.129s | 550.2 Hz | onset | 4.84 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 11 | gameStart | Stage Start | 2.46 | medium | single-reference-body | 0.158s | 280.3 Hz | onset | 5.19 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 12 | challengeTransition | Challenge Transition | 2.38 | high | single-reference-body | 0.139s | 481.6 Hz | onset | 4.74 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


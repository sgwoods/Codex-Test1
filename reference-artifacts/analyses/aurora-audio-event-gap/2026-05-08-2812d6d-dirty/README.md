# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T21:26:41.060Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-2812d6d/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 35
- Average worst segment risk: 5.22/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerHit (5.8/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | playerHit | Ship Loss | 5.8 | active-segment-detected | 0.767s | 1049.7 Hz | onset | 7.99 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 2 | bossHit | Boss Hit | 5.05 | direct-cue-comparison | 0.44s | 489.9 Hz | onset | 5.18 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 3 | captureRetreat | Capture Retreat | 4.92 | direct-cue-comparison | 0.24s | 852.5 Hz | onset | 6.32 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 4 | stagePulse | Formation Pulse | 4.42 | direct-cue-comparison | 0.001s | 676 Hz | onset | 6.98 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | playerShot | Player Shot | 4.31 | direct-cue-comparison | 0.46s | 162.7 Hz | onset | 2.25 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 6 | attractPulse | Demo Pulse | 4.23 | direct-cue-comparison | 0.011s | 565.7 Hz | onset | 5.29 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | enemyBoom | Enemy Boom | 3.7 | direct-cue-comparison | 0.039s | 626.3 Hz | onset | 5.34 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | rescueJoin | Rescue Join | 3.55 | direct-cue-comparison | 0.169s | 482.7 Hz | tail | 6.61 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.42 | direct-cue-comparison | 0.049s | 801.5 Hz | onset | 7.08 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | enemyHit | Enemy Hit | 3.4 | direct-cue-comparison | 0.059s | 809.7 Hz | onset | 4.93 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 11 | bossBoom | Boss Boom | 3.24 | active-segment-detected | 0.109s | 189.2 Hz | onset | 4.82 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 12 | captureBeam | Capture Beam | 3.19 | direct-cue-comparison | 0.158s | 195.7 Hz | onset | 4.52 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit onset. Rerun audio comparison and event-gap analysis after the change.


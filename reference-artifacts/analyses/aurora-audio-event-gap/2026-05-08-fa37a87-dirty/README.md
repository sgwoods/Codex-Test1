# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T22:01:20.414Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-fa37a87/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 35
- Average worst segment risk: 5.49/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: enemyHit (5.27/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | enemyHit | Enemy Hit | 5.27 | direct-cue-comparison | 0.42s | 694.1 Hz | onset | 5.14 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | enemyBoom | Enemy Boom | 5.04 | direct-cue-comparison | 0.42s | 573.2 Hz | onset | 5.8 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 3 | playerShot | Player Shot | 4.98 | direct-cue-comparison | 0.46s | 87.8 Hz | onset | 6.71 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 4 | captureRetreat | Capture Retreat | 4.6 | direct-cue-comparison | 0.13s | 907.1 Hz | tail | 6.95 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | bossBoom | Boss Boom | 4.46 | active-segment-detected | 0.109s | 269.7 Hz | onset | 5.23 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | captureBeam | Capture Beam | 4.22 | direct-cue-comparison | 0.321s | 109.8 Hz | onset | 5.72 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 7 | playerHit | Ship Loss | 3.72 | active-segment-detected | 0.058s | 603.7 Hz | body | 6.45 | Tune the body segment first: body timing/duration differs enough to tune event pacing before timbre. |
| 8 | rescueJoin | Rescue Join | 3.57 | direct-cue-comparison | 0.159s | 486 Hz | tail | 6.81 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.34 | direct-cue-comparison | 0.059s | 750 Hz | onset | 6.08 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | bossHit | Boss Hit | 3.21 | direct-cue-comparison | 0.029s | 567.3 Hz | onset | 5.61 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 11 | highScoreOther | High Score 2nd-10th | 2.68 | direct-cue-comparison | 0.29s | 181.1 Hz | onset | 2.91 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | stagePulse | Formation Pulse | 2.58 | direct-cue-comparison | 0.45s | 644.3 Hz | onset | 7.03 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

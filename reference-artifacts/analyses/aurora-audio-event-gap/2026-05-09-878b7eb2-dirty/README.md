# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T18:17:38.963Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-878b7eb2/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 42
- Average worst segment risk: 4.89/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: enemyBoom (5.04/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (enemyBoom -> enemyBoom)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| playerHit | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureRetreat | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| gameStart | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| enemyHit | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | enemyBoom | Enemy Boom | 5.04 | high | curated-reference-segmentation | 0.42s | 568.5 Hz | onset | 5.78 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | captureBeam | Capture Beam | 4.58 | medium-high | curated-reference-segmentation | 0.321s | 187.7 Hz | tail | 7.13 | Tune the tail segment first: tail timing/duration differs enough to tune event pacing before timbre. |
| 3 | attractPulse | Demo Pulse | 4.16 | high | single-reference-body | 0.029s | 551.4 Hz | onset | 6.26 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | playerHit | Ship Loss | 3.89 | medium-high | curated-reference-segmentation | 0.048s | 610.2 Hz | tail | 7.18 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | rescueJoin | Rescue Join | 3.52 | high | segmented-reference | 0.119s | 466.3 Hz | tail | 6.32 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | captureRetreat | Capture Retreat | 3.34 | medium | segmented-reference | 0.24s | 683 Hz | tail | 6.23 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.28 | high | curated-reference-segmentation | 0.42s | 509.5 Hz | onset | 2.42 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 8 | gameStart | Stage Start | 3.26 | medium | segmented-reference | 0.27s | 740.1 Hz | tail | 5.64 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | bossHit | Boss Hit | 3.04 | high | curated-reference-segmentation | 0.039s | 534.3 Hz | onset | 5.45 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | enemyHit | Enemy Hit | 2.97 | high | curated-reference-segmentation | 0.42s | 426.6 Hz | onset | 2.09 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 11 | bossBoom | Boss Boom | 2.76 | medium-high | curated-reference-segmentation | 0.538s | 305.6 Hz | body | 4.54 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 12 | challengeResults | Challenge Results | 2.63 | medium-high | curated-reference-segmentation | 0.219s | 202.4 Hz | onset | 5.58 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit tail. Rerun audio comparison and event-gap analysis after the change.


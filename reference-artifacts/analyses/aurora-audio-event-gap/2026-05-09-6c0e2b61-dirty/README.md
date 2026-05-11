# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T16:12:52.821Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-6c0e2b61/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 40
- Average worst segment risk: 4.75/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerShot (5.05/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (playerShot -> playerShot)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| playerShot | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| playerHit | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| captureRetreat | 0 | 0 | 0s | 0 Hz |
| enemyHit | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | playerShot | Player Shot | 5.05 | medium-high | single-reference-body | 0.46s | 233.4 Hz | onset | 3.72 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 2 | enemyBoom | Enemy Boom | 3.9 | medium-high | single-reference-body | 0.049s | 666.6 Hz | onset | 5.67 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | playerHit | Ship Loss | 3.87 | medium-high | curated-reference-segmentation | 0.048s | 622.5 Hz | body | 7.55 | Tune the body segment first: body timing/duration differs enough to tune event pacing before timbre. |
| 4 | rescueJoin | Rescue Join | 3.52 | high | segmented-reference | 0.169s | 509.5 Hz | tail | 6.53 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 5 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.41 | high | single-reference-body | 0.42s | 566 Hz | onset | 3.08 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | captureBeam | Capture Beam | 3.21 | medium-high | curated-reference-segmentation | 0.148s | 245.3 Hz | tail | 5.11 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 7 | captureRetreat | Capture Retreat | 3.15 | medium | segmented-reference | 0.24s | 680.3 Hz | tail | 6.79 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | enemyHit | Enemy Hit | 3.1 | medium-high | single-reference-body | 0.42s | 391.2 Hz | onset | 1.63 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 9 | bossHit | Boss Hit | 2.99 | medium-high | single-reference-body | 0.28s | 490.3 Hz | onset | 3.76 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 10 | bossBoom | Boss Boom | 2.76 | high | single-reference-body | 0.588s | 333.3 Hz | onset | 4.83 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 11 | stagePulse | Formation Pulse | 2.73 | high | single-reference-body | 0.45s | 636.7 Hz | onset | 6.9 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 12 | challengeResults | Challenge Results | 2.56 | medium-high | curated-reference-segmentation | 0.219s | 220.8 Hz | tail | 5.25 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit body. Rerun audio comparison and event-gap analysis after the change.


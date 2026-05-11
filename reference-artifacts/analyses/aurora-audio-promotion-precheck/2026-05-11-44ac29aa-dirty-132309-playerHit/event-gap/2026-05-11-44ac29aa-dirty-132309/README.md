# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T13:23:09.591Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-132309-playerHit/candidate-theme-metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.36/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (4.45/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: -0.27/10
- Highest-risk cue changed: yes (playerHit -> stagePulse)
- Strongest improvement: playerHit (-5.77)
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| playerHit | -6.57 | -5.77 | -0.116s | -893.5 Hz |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| captureRetreat | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 4.45 | high | single-reference-body | 0.051s | 732.6 Hz | onset | 7.05 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 3.37 | high | single-reference-body | 0.121s | 498.7 Hz | onset | 5.87 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | captureRetreat | Capture Retreat | 3.26 | medium | single-reference-body | 0.061s | 776.2 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.2 | high | curated-reference-segmentation | 0.061s | 708.4 Hz | onset | 5.04 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | bossHit | Boss Hit | 3.09 | high | curated-reference-segmentation | 0.12s | 502.2 Hz | onset | 4.18 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | rescueJoin | Rescue Join | 3.01 | high | single-reference-body | 0.151s | 332 Hz | onset | 4.98 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | captureBeam | Capture Beam | 2.99 | medium-high | curated-reference-segmentation | 0.018s | 159.5 Hz | tail | 6.28 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | challengeResults | Challenge Results | 2.94 | medium-high | curated-reference-segmentation | 0.051s | 222.5 Hz | onset | 4.77 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | enemyBoom | Enemy Boom | 2.83 | high | curated-reference-segmentation | 0.081s | 560.5 Hz | onset | 4.43 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 10 | enemyHit | Enemy Hit | 2.75 | high | curated-reference-segmentation | 0.081s | 680.9 Hz | onset | 4 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 11 | challengeTransition | Challenge Transition | 2.28 | high | single-reference-body | 0.001s | 429.5 Hz | onset | 4.11 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | bossBoom | Boss Boom | 2.18 | medium-high | curated-reference-segmentation | 0.141s | 211 Hz | body | 4.2 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

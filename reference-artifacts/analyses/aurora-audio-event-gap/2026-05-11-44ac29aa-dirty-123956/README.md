# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T12:39:56.504Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-44ac29aa-123708/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.63/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerHit (7.31/10 risk)

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
| 1 | playerHit | Ship Loss | 7.31 | medium-high | curated-reference-segmentation | 0.605s | 896.6 Hz | body | 7.97 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | stagePulse | Formation Pulse | 4.45 | high | single-reference-body | 0.051s | 732.6 Hz | onset | 7.05 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | attractPulse | Demo Pulse | 3.37 | high | single-reference-body | 0.121s | 498.7 Hz | onset | 5.87 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | captureRetreat | Capture Retreat | 3.26 | medium | single-reference-body | 0.061s | 776.2 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.2 | high | curated-reference-segmentation | 0.061s | 708.4 Hz | onset | 5.04 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | bossHit | Boss Hit | 3.09 | high | curated-reference-segmentation | 0.12s | 502.2 Hz | onset | 4.18 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 7 | rescueJoin | Rescue Join | 3.01 | high | single-reference-body | 0.151s | 332 Hz | onset | 4.98 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | captureBeam | Capture Beam | 2.99 | medium-high | curated-reference-segmentation | 0.018s | 159.5 Hz | tail | 6.28 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | challengeResults | Challenge Results | 2.94 | medium-high | curated-reference-segmentation | 0.051s | 222.5 Hz | onset | 4.77 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | enemyBoom | Enemy Boom | 2.83 | high | curated-reference-segmentation | 0.081s | 560.5 Hz | onset | 4.43 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 11 | enemyHit | Enemy Hit | 2.75 | high | curated-reference-segmentation | 0.081s | 680.9 Hz | onset | 4 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 12 | challengeTransition | Challenge Transition | 2.28 | high | single-reference-body | 0.001s | 429.5 Hz | onset | 4.11 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit body. Rerun audio comparison and event-gap analysis after the change.

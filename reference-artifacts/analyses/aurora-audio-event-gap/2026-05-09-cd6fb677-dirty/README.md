# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T20:16:29.296Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-6584ce5b/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.32/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.14/10 risk)

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
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
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
| 1 | stagePulse | Formation Pulse | 5.14 | high | single-reference-body | 0.029s | 801.1 Hz | onset | 6.51 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.32 | high | single-reference-body | 0.019s | 605.6 Hz | onset | 5.88 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | enemyBoom | Enemy Boom | 3.6 | high | curated-reference-segmentation | 0.059s | 663.2 Hz | onset | 5.47 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | bossBoom | Boss Boom | 3.57 | medium-high | curated-reference-segmentation | 0.029s | 309.4 Hz | onset | 4.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | rescueJoin | Rescue Join | 3.37 | high | single-reference-body | 0.041s | 434 Hz | onset | 6.09 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | bossHit | Boss Hit | 3.26 | high | curated-reference-segmentation | 0.029s | 582.4 Hz | onset | 5.88 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | captureBeam | Capture Beam | 3.2 | medium-high | curated-reference-segmentation | 0.148s | 244.1 Hz | tail | 5.11 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | challengeResults | Challenge Results | 2.87 | medium-high | curated-reference-segmentation | 0.079s | 316.3 Hz | onset | 5.88 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | highScoreOther | High Score 2nd-10th | 2.59 | high | single-reference-body | 0.109s | 422.5 Hz | onset | 4.18 | Revisit reference segment choice; best candidate match is weak. |
| 10 | challengeTransition | Challenge Transition | 2.32 | high | single-reference-body | 0.139s | 522.4 Hz | onset | 3.88 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 11 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.8 | high | curated-reference-segmentation | 0.069s | 24.5 Hz | onset | 2.02 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | gameOver | Game Over | 1.72 | medium | single-reference-body | 0.311s | 497.4 Hz | onset | 5.29 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


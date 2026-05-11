# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T18:34:21.993Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-c3f4e668/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.29/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (4.99/10 risk)

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
| bossBoom | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| captureRetreat | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 4.99 | high | single-reference-body | 0.029s | 816.1 Hz | onset | 7.13 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.44 | high | single-reference-body | 0.009s | 570.5 Hz | onset | 5.87 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | bossBoom | Boss Boom | 3.56 | medium-high | curated-reference-segmentation | 0.029s | 303.1 Hz | body | 4.31 | Revisit reference segment choice; best candidate match is weak. |
| 4 | enemyBoom | Enemy Boom | 3.41 | high | curated-reference-segmentation | 0.029s | 618.1 Hz | onset | 4.93 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | captureRetreat | Capture Retreat | 3.16 | medium | single-reference-body | 0.09s | 700.5 Hz | onset | 5.28 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | rescueJoin | Rescue Join | 3.14 | high | single-reference-body | 0.061s | 397.4 Hz | onset | 4.68 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | captureBeam | Capture Beam | 2.96 | medium-high | curated-reference-segmentation | 0.138s | 210.7 Hz | tail | 5.12 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | bossHit | Boss Hit | 2.93 | high | curated-reference-segmentation | 0.029s | 544.4 Hz | onset | 5.29 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | challengeResults | Challenge Results | 2.69 | medium-high | curated-reference-segmentation | 0.049s | 269.3 Hz | tail | 4.93 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 10 | challengeTransition | Challenge Transition | 2.4 | high | single-reference-body | 0.139s | 475.5 Hz | onset | 4.92 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 11 | highScoreOther | High Score 2nd-10th | 2.13 | high | single-reference-body | 0.089s | 365 Hz | onset | 3.36 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.97 | high | curated-reference-segmentation | 0.079s | 33.9 Hz | onset | 2.15 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


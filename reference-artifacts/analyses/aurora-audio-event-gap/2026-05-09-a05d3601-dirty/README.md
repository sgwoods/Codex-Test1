# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T18:53:25.110Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-a05d3601/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.19/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.29/10 risk)

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
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.29 | high | single-reference-body | 0.019s | 824.8 Hz | onset | 7.24 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.34 | high | single-reference-body | 0.009s | 565.4 Hz | onset | 5.39 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | challengeTransition | Challenge Transition | 4.09 | high | single-reference-body | 0.019s | 559 Hz | onset | 5.3 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 4 | bossBoom | Boss Boom | 3.63 | medium-high | curated-reference-segmentation | 0.019s | 262.4 Hz | body | 4.5 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 5 | enemyBoom | Enemy Boom | 3.57 | high | curated-reference-segmentation | 0.059s | 639.7 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | bossHit | Boss Hit | 3.03 | high | curated-reference-segmentation | 0.039s | 540.1 Hz | onset | 5.34 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | rescueJoin | Rescue Join | 2.95 | high | single-reference-body | 0.031s | 378.7 Hz | onset | 4.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | captureBeam | Capture Beam | 2.9 | medium-high | curated-reference-segmentation | 0.128s | 209 Hz | tail | 4.84 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | challengeResults | Challenge Results | 2.84 | medium-high | curated-reference-segmentation | 0.07s | 223.7 Hz | onset | 4.62 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | highScoreOther | High Score 2nd-10th | 2.29 | high | single-reference-body | 0.099s | 377.9 Hz | onset | 3.56 | Revisit reference segment choice; best candidate match is weak. |
| 11 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.94 | high | curated-reference-segmentation | 0.089s | 24.4 Hz | onset | 2.19 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | playerShot | Player Shot | 1.84 | high | curated-reference-segmentation | 0.019s | 137.6 Hz | onset | 2.49 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


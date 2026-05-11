# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T01:09:49.324Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-eedc85ba-204924/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.93/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.34/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| challengePerfect | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.34 | high | single-reference-body | 0.011s | 814.6 Hz | onset | 6.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | rescueJoin | Rescue Join | 4.82 | high | single-reference-body | 0.19s | 417 Hz | onset | 6.07 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 3 | attractPulse | Demo Pulse | 4.14 | high | single-reference-body | 0.13s | 563.1 Hz | onset | 6 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | captureBeam | Capture Beam | 3.21 | medium-high | curated-reference-segmentation | 0.148s | 245.3 Hz | tail | 5.11 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 5 | challengePerfect | Challenge Perfect | 2.98 | high | single-reference-body | 0.179s | 81.5 Hz | onset | 5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | bossBoom | Boss Boom | 2.96 | medium-high | curated-reference-segmentation | 0.109s | 341.2 Hz | body | 4.17 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 7 | challengeResults | Challenge Results | 2.81 | medium-high | curated-reference-segmentation | 0.079s | 270.7 Hz | body | 5.87 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | challengeTransition | Challenge Transition | 2.21 | high | single-reference-body | 0.129s | 489.6 Hz | onset | 4.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.95 | high | curated-reference-segmentation | 0.06s | 141.4 Hz | onset | 1.6 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | highScoreOther | High Score 2nd-10th | 1.88 | high | single-reference-body | 0.089s | 330.9 Hz | onset | 3.27 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | enemyHit | Enemy Hit | 1.77 | high | curated-reference-segmentation | 0.04s | 11.8 Hz | onset | 2.09 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | gameStart | Stage Start | 1.75 | medium | single-reference-body | 0s | 303.6 Hz | onset | 5.69 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

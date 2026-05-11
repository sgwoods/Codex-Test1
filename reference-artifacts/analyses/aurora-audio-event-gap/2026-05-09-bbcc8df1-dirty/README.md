# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T21:38:13.849Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-bbcc8df1/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.49/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.15/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: -0.2/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: capturedFighterDestroyed (-4.1)
- Strongest regression: playerShot (+0.92)

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| capturedFighterDestroyed | -1.4 | -4.1 | 0.04s | -721.8 Hz |
| enemyBoom | -0.46 | -1.45 | 0.008s | 39.6 Hz |
| playerShot | 0.51 | 0.92 | 0.018s | 7.6 Hz |
| highScoreOther | -0.18 | -0.69 | 0s | -10.6 Hz |
| challengeResults | -0.15 | 0.6 | 0.028s | 59.4 Hz |
| highScoreFirst | 0.22 | 0.59 | 0.02s | 53.4 Hz |
| bossHit | 0.19 | 0.54 | -0.01s | -9.1 Hz |
| attractPulse | 0.37 | -0.49 | -0.111s | 13.4 Hz |
| challengePerfect | 0.23 | 0.48 | 0.02s | 21.6 Hz |
| captureSuccess | 0.01 | -0.46 | 0.02s | 47 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.15 | high | single-reference-body | 0.019s | 786.2 Hz | onset | 7.22 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | playerHit | Ship Loss | 4.91 | medium-high | curated-reference-segmentation | 0.568s | 824.8 Hz | body | 7.2 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 3 | attractPulse | Demo Pulse | 4.38 | high | single-reference-body | 0.019s | 587.7 Hz | onset | 5.42 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | enemyBoom | Enemy Boom | 3.66 | high | curated-reference-segmentation | 0.059s | 659.4 Hz | onset | 4.66 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | challengeTransition | Challenge Transition | 3.57 | high | single-reference-body | 0.039s | 475 Hz | onset | 5.12 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 6 | rescueJoin | Rescue Join | 3.28 | high | single-reference-body | 0.051s | 394 Hz | onset | 5.37 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | bossHit | Boss Hit | 3.24 | high | curated-reference-segmentation | 0.029s | 572.4 Hz | onset | 5.59 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | captureBeam | Capture Beam | 3.19 | medium-high | curated-reference-segmentation | 0.148s | 228.7 Hz | tail | 5.04 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | challengeResults | Challenge Results | 3.01 | medium-high | curated-reference-segmentation | 0.069s | 319.5 Hz | onset | 6.28 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | bossBoom | Boss Boom | 2.11 | medium-high | curated-reference-segmentation | 0.129s | 309.8 Hz | body | 4.26 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 11 | highScoreOther | High Score 2nd-10th | 2.1 | high | single-reference-body | 0.099s | 334.6 Hz | onset | 3.02 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.89 | high | curated-reference-segmentation | 0.079s | 33.2 Hz | onset | 2.02 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


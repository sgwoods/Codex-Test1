# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T13:26:26.085Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-44ac29aa-132328/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.64/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerHit (7.25/10 risk)

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
| captureRetreat | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
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
| 1 | playerHit | Ship Loss | 7.25 | medium-high | curated-reference-segmentation | 0.605s | 905.4 Hz | body | 7.87 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | stagePulse | Formation Pulse | 4.45 | high | single-reference-body | 0.091s | 723.7 Hz | onset | 6.96 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | captureRetreat | Capture Retreat | 3.8 | medium | single-reference-body | 0.001s | 795.6 Hz | onset | 5.64 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | attractPulse | Demo Pulse | 3.47 | high | single-reference-body | 0.121s | 514.7 Hz | onset | 5.69 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.16 | high | curated-reference-segmentation | 0.011s | 711.6 Hz | onset | 5.25 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | rescueJoin | Rescue Join | 3.08 | high | single-reference-body | 0.131s | 342.9 Hz | onset | 5.13 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | captureBeam | Capture Beam | 2.93 | medium-high | curated-reference-segmentation | 0.028s | 141.7 Hz | tail | 6.27 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | enemyBoom | Enemy Boom | 2.91 | high | curated-reference-segmentation | 0.061s | 576.1 Hz | onset | 4.35 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 9 | bossHit | Boss Hit | 2.88 | high | curated-reference-segmentation | 0.081s | 482.3 Hz | onset | 3.9 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 10 | enemyHit | Enemy Hit | 2.79 | high | curated-reference-segmentation | 0.081s | 691 Hz | onset | 3.89 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 11 | playerShot | Player Shot | 2.56 | high | curated-reference-segmentation | 0.121s | 180.7 Hz | onset | 2.68 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | challengeResults | Challenge Results | 2.37 | medium-high | curated-reference-segmentation | 0.089s | 280 Hz | onset | 5.45 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit body. Rerun audio comparison and event-gap analysis after the change.

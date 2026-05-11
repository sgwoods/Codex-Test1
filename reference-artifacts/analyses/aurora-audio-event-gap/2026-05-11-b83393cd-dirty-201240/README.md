# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T20:12:40.092Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-b83393cd-200917/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.69/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: playerHit (3.61/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (playerHit -> playerHit)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| playerHit | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| enemyShot | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| bossBoom | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| playerShot | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| captureSuccess | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | playerHit | Ship Loss | 3.61 | medium-high | curated-reference-segmentation | 0s | 603.2 Hz | tail | 7.08 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 3.44 | high | single-reference-body | 0.111s | 514.2 Hz | onset | 5.74 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | rescueJoin | Rescue Join | 3.33 | high | single-reference-body | 0.081s | 370.9 Hz | onset | 5.46 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | enemyShot | Enemy Shot | 3.24 | high | curated-reference-segmentation | 0.171s | 231.5 Hz | onset | 2.5 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 5 | captureBeam | Capture Beam | 3.14 | medium-high | curated-reference-segmentation | 0.002s | 149.8 Hz | tail | 6.24 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | bossBoom | Boss Boom | 3.12 | medium-high | curated-reference-segmentation | 0.001s | 276.8 Hz | body | 4.23 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 7 | challengeResults | Challenge Results | 2.98 | medium-high | curated-reference-segmentation | 0.071s | 237.7 Hz | onset | 4.6 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | playerShot | Player Shot | 2.92 | high | curated-reference-segmentation | 0.171s | 251 Hz | onset | 2.9 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | challengeTransition | Challenge Transition | 2.11 | high | single-reference-body | 0.019s | 425.5 Hz | onset | 3.64 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | captureSuccess | Fighter Captured | 1.87 | high | segmented-reference | 0.111s | 114.1 Hz | tail | 4.34 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | highScoreOther | High Score 2nd-10th | 1.83 | high | single-reference-body | 0.001s | 274 Hz | onset | 2.54 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | gameOver | Game Over | 1.71 | medium | single-reference-body | 0.23s | 471.9 Hz | onset | 5.02 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit tail. Rerun audio comparison and event-gap analysis after the change.

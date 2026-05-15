# Aurora Audio Event Gap Analysis

Generated: `2026-05-15T20:19:45.638Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-15-main-c8c7246f-201649/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.47/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: challengePerfect (6.95/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (challengePerfect -> challengePerfect)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| challengePerfect | 0 | 0 | 0s | 0 Hz |
| highScoreFirst | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| gameStart | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |
| gameOver | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| playerHit | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | challengePerfect | Challenge Perfect | 6.95 | high | single-reference-body | 0.069s | 727.6 Hz | onset | 6.85 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | highScoreFirst | High Score 1st | 3.97 | high | single-reference-body | 0.088s | 537.9 Hz | onset | 6.25 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | challengeTransition | Challenge Transition | 3.71 | high | single-reference-body | 0.171s | 147.1 Hz | onset | 5.71 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 4 | rescueJoin | Rescue Join | 3.19 | high | single-reference-body | 0.098s | 328.6 Hz | onset | 4.74 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | captureBeam | Capture Beam | 3.11 | medium-high | curated-reference-segmentation | 0.025s | 218.7 Hz | tail | 5.33 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | gameStart | Stage Start | 2.67 | medium | single-reference-body | 0.016s | 324.3 Hz | onset | 6.67 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | highScoreOther | High Score 2nd-10th | 2.56 | high | single-reference-body | 0.038s | 4.2 Hz | onset | 4.53 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | gameOver | Game Over | 2.43 | medium | single-reference-body | 0.331s | 441.3 Hz | onset | 6.36 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 9 | enemyBoom | Enemy Boom | 2.19 | high | curated-reference-segmentation | 0.06s | 0.9 Hz | onset | 0.86 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 10 | playerHit | Ship Loss | 2.05 | medium-high | curated-reference-segmentation | 0s | 537.8 Hz | body | 0 | Keep playerHit as a calibrated guardrail for now: raw body/tail risk matches synthetic Galaga browser-capture behavior, so the next runtime work should target a non-calibrated cue gap. |
| 11 | bossBoom | Boss Boom | 2.02 | medium-high | curated-reference-segmentation | 0.099s | 196.8 Hz | onset | 3.54 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | challengeResults | Challenge Results | 2.01 | medium-high | curated-reference-segmentation | 0.022s | 234.6 Hz | tail | 5.09 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: challengePerfect onset. Rerun audio comparison and event-gap analysis after the change.

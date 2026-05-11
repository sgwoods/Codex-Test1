# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T20:42:46.169Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-e8d1c7ef/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.18/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.04/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| enemyShot | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.04 | high | single-reference-body | 0.029s | 810.7 Hz | onset | 7.33 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | bossHit | Boss Hit | 4.68 | high | curated-reference-segmentation | 0.061s | 517.9 Hz | onset | 5.08 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | enemyBoom | Enemy Boom | 4.38 | high | curated-reference-segmentation | 0.071s | 583.8 Hz | onset | 5.83 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | attractPulse | Demo Pulse | 4.09 | high | single-reference-body | 0.029s | 544.7 Hz | onset | 6.33 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | rescueJoin | Rescue Join | 3.28 | high | single-reference-body | 0.051s | 386.3 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | captureBeam | Capture Beam | 3.26 | medium-high | curated-reference-segmentation | 0.158s | 201.5 Hz | tail | 5.16 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 7 | highScoreOther | High Score 2nd-10th | 3.09 | high | single-reference-body | 0.001s | 335.4 Hz | onset | 2.74 | Revisit reference segment choice; best candidate match is weak. |
| 8 | challengeResults | Challenge Results | 3.03 | medium-high | curated-reference-segmentation | 0.08s | 281.2 Hz | onset | 5.62 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | challengeTransition | Challenge Transition | 2.83 | high | single-reference-body | 0.139s | 557.9 Hz | onset | 4.85 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 10 | enemyShot | Enemy Shot | 2.71 | high | curated-reference-segmentation | 0.061s | 82.3 Hz | onset | 1.78 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | bossBoom | Boss Boom | 2.41 | medium-high | curated-reference-segmentation | 0.029s | 307 Hz | body | 4.46 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | capturedFighterDestroyed | Captured Fighter Destroyed | 2.02 | high | curated-reference-segmentation | 0.069s | 97.7 Hz | onset | 1.73 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


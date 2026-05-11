# Aurora Audio Event Gap Analysis

Generated: `2026-05-11T12:36:14.951Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-123614-rescueJoin/candidate-theme-metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 3.95/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.02/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0.03/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: rescueJoin (+0.69)

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| rescueJoin | 0.33 | 0.69 | -0.01s | -2.2 Hz |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |
| enemyHit | 0 | 0 | 0s | 0 Hz |
| gameOver | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.02 | high | single-reference-body | 0.029s | 797.4 Hz | onset | 7.18 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.19 | high | single-reference-body | 0.001s | 549.1 Hz | onset | 5.42 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | rescueJoin | Rescue Join (promotion precheck) | 3.6 | high | single-reference-body | 0.041s | 396.4 Hz | onset | 5.38 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | captureBeam | Capture Beam | 3.18 | medium-high | curated-reference-segmentation | 0.148s | 233.1 Hz | tail | 5.05 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 5 | capturedFighterDestroyed | Captured Fighter Destroyed | 2.81 | high | curated-reference-segmentation | 0.069s | 372.5 Hz | onset | 3.82 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 6 | challengeResults | Challenge Results | 2.72 | medium-high | curated-reference-segmentation | 0.079s | 258.8 Hz | onset | 5.66 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | challengeTransition | Challenge Transition | 2.4 | high | single-reference-body | 0.139s | 475.5 Hz | onset | 4.92 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 8 | highScoreOther | High Score 2nd-10th | 2.35 | high | single-reference-body | 0.099s | 363.6 Hz | onset | 4.29 | Revisit reference segment choice; best candidate match is weak. |
| 9 | enemyHit | Enemy Hit | 2.08 | high | curated-reference-segmentation | 0.04s | 190.5 Hz | onset | 2.33 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 10 | gameOver | Game Over | 1.8 | medium | single-reference-body | 0.302s | 531 Hz | onset | 5.41 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 11 | highScoreFirst | High Score 1st | 1.77 | high | single-reference-body | 0.04s | 211.8 Hz | onset | 2.88 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | captureRetreat | Capture Retreat | 1.69 | medium | single-reference-body | 0.05s | 157.1 Hz | onset | 3.48 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.

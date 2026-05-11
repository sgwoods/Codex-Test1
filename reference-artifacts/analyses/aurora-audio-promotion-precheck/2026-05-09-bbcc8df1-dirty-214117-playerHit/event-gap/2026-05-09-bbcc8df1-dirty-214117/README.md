# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T21:41:17.983Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-09-bbcc8df1-dirty-214117-playerHit/candidate-theme-metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.43/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.11/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0.03/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: playerHit (0.57)
- Strongest regression: playerHit (+0.57)

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| playerHit | -0.18 | 0.57 | -0.14s | -30.4 Hz |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
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
| 1 | stagePulse | Formation Pulse | 5.11 | high | single-reference-body | 0.009s | 765.8 Hz | onset | 7.14 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 4.31 | high | single-reference-body | 0.009s | 550.7 Hz | onset | 5.37 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | enemyBoom | Enemy Boom | 3.99 | high | curated-reference-segmentation | 0.049s | 661.7 Hz | onset | 5.74 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | rescueJoin | Rescue Join | 3.3 | high | single-reference-body | 0.051s | 399.4 Hz | onset | 5.75 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | challengeResults | Challenge Results | 3.11 | medium-high | curated-reference-segmentation | 0.079s | 322.6 Hz | body | 5.88 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | bossHit | Boss Hit | 2.97 | high | curated-reference-segmentation | 0.029s | 547.6 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | captureBeam | Capture Beam | 2.82 | medium-high | curated-reference-segmentation | 0.138s | 197.6 Hz | tail | 5.14 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 8 | capturedFighterDestroyed | Captured Fighter Destroyed | 2.81 | high | curated-reference-segmentation | 0.069s | 372.5 Hz | onset | 3.82 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | highScoreOther | High Score 2nd-10th | 2.33 | high | single-reference-body | 0.099s | 375.9 Hz | onset | 3.88 | Revisit reference segment choice; best candidate match is weak. |
| 10 | challengeTransition | Challenge Transition | 2.32 | high | single-reference-body | 0.139s | 522.4 Hz | onset | 3.88 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 11 | bossBoom | Boss Boom | 2.22 | medium-high | curated-reference-segmentation | 0.129s | 343.9 Hz | body | 4.53 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 12 | enemyHit | Enemy Hit | 2.08 | high | curated-reference-segmentation | 0.04s | 190.5 Hz | onset | 2.33 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


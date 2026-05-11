# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T21:09:11.807Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-5eb9b0b1/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 31
- Average worst segment risk: 4.56/10
- Semantic event score: 9.78/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: stagePulse (5.23/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (stagePulse -> stagePulse)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| stagePulse | 0 | 0 | 0s | 0 Hz |
| playerHit | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |
| challengeResults | 0 | 0 | 0s | 0 Hz |
| challengeTransition | 0 | 0 | 0s | 0 Hz |
| highScoreOther | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Confidence | Resolution | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | --- | ---: | ---: | --- | ---: | --- |
| 1 | stagePulse | Formation Pulse | 5.23 | high | single-reference-body | 0.029s | 825.1 Hz | onset | 7.25 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | playerHit | Ship Loss | 4.73 | medium-high | curated-reference-segmentation | 0.568s | 800.4 Hz | onset | 6.49 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 3 | attractPulse | Demo Pulse | 4.38 | high | single-reference-body | 0.009s | 552.2 Hz | onset | 5.72 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 4 | enemyBoom | Enemy Boom | 3.62 | high | curated-reference-segmentation | 0.049s | 622.3 Hz | onset | 5.16 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | captureBeam | Capture Beam | 3.37 | medium-high | curated-reference-segmentation | 0.001s | 166.2 Hz | tail | 6.24 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | rescueJoin | Rescue Join | 3.12 | high | single-reference-body | 0.031s | 442.3 Hz | onset | 4.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | bossHit | Boss Hit | 2.94 | high | curated-reference-segmentation | 0.029s | 536.8 Hz | onset | 5.28 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 8 | challengeResults | Challenge Results | 2.85 | medium-high | curated-reference-segmentation | 0.069s | 272.9 Hz | body | 5.78 | Tune the body segment first: body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | challengeTransition | Challenge Transition | 2.83 | high | single-reference-body | 0.139s | 557.8 Hz | onset | 4.85 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 10 | highScoreOther | High Score 2nd-10th | 2.37 | high | single-reference-body | 0.109s | 373.2 Hz | onset | 4.08 | Revisit reference segment choice; best candidate match is weak. |
| 11 | bossBoom | Boss Boom | 2.19 | medium-high | curated-reference-segmentation | 0.139s | 313.1 Hz | body | 4.24 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | capturedFighterDestroyed | Captured Fighter Destroyed | 1.94 | high | curated-reference-segmentation | 0.06s | 95.3 Hz | onset | 1.73 | Keep as secondary pass after higher-risk audio gaps are narrowed. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: stagePulse onset. Rerun audio comparison and event-gap analysis after the change.


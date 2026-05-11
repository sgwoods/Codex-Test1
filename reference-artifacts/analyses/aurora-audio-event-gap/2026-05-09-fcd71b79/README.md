# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T15:32:14.977Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-5da7d96/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 35
- Average worst segment risk: 4.55/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: attractPulse (4.15/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | attractPulse | Demo Pulse | 4.15 | direct-cue-comparison | 0.011s | 523.9 Hz | onset | 5.79 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | playerHit | Ship Loss | 3.88 | active-segment-detected | 0.048s | 622.6 Hz | body | 6.58 | Tune the body segment first: body timing/duration differs enough to tune event pacing before timbre. |
| 3 | rescueJoin | Rescue Join | 3.59 | direct-cue-comparison | 0.159s | 482 Hz | tail | 6.73 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 4 | enemyBoom | Enemy Boom | 3.53 | direct-cue-comparison | 0.029s | 608.3 Hz | onset | 5.22 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.36 | direct-cue-comparison | 0.42s | 598.8 Hz | onset | 1.99 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | captureRetreat | Capture Retreat | 3.17 | direct-cue-comparison | 0.24s | 575.3 Hz | tail | 5.89 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | enemyHit | Enemy Hit | 3.1 | direct-cue-comparison | 0.42s | 488.1 Hz | onset | 2.09 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 8 | bossHit | Boss Hit | 3.03 | direct-cue-comparison | 0.039s | 534.3 Hz | onset | 5.4 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 9 | captureBeam | Capture Beam | 2.82 | direct-cue-comparison | 0.138s | 209.6 Hz | onset | 4.1 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | challengeResults | Challenge Results | 2.81 | direct-cue-comparison | 0.229s | 210 Hz | onset | 6.98 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 11 | stagePulse | Formation Pulse | 2.36 | direct-cue-comparison | 0.45s | 691.2 Hz | onset | 2.82 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 12 | gameStart | Stage Start | 2.3 | direct-cue-comparison | 0.189s | 722.7 Hz | onset | 5.27 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: challengeResults onset. Rerun audio comparison and event-gap analysis after the change.


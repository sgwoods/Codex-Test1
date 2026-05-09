# Aurora Audio Event Gap Analysis

Generated: `2026-05-09T15:49:41.348Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-fcd71b79/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 35
- Average worst segment risk: 4.86/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: captureBeam (4.83/10 risk)

## Candidate Value Read

- Baseline report: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- Average worst segment risk delta: 0/10
- Highest-risk cue changed: no (captureBeam -> captureBeam)
- Strongest improvement: none
- Strongest regression: none

| Cue | Gap delta | Segment delta | Duration delta | Centroid delta |
| --- | ---: | ---: | ---: | ---: |
| captureBeam | 0 | 0 | 0s | 0 Hz |
| attractPulse | 0 | 0 | 0s | 0 Hz |
| enemyShot | 0 | 0 | 0s | 0 Hz |
| playerHit | 0 | 0 | 0s | 0 Hz |
| enemyBoom | 0 | 0 | 0s | 0 Hz |
| captureRetreat | 0 | 0 | 0s | 0 Hz |
| capturedFighterDestroyed | 0 | 0 | 0s | 0 Hz |
| rescueJoin | 0 | 0 | 0s | 0 Hz |
| gameStart | 0 | 0 | 0s | 0 Hz |
| bossHit | 0 | 0 | 0s | 0 Hz |

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | captureBeam | Capture Beam | 4.83 | direct-cue-comparison | 0.321s | 300.6 Hz | onset | 6.96 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 2 | attractPulse | Demo Pulse | 4.24 | direct-cue-comparison | 0.001s | 548.1 Hz | onset | 5.87 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | enemyShot | Enemy Shot | 3.89 | direct-cue-comparison | 0.44s | 103.9 Hz | onset | 2.32 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 4 | playerHit | Ship Loss | 3.84 | active-segment-detected | 0.038s | 606.7 Hz | body | 7.08 | Tune the body segment first: body timing/duration differs enough to tune event pacing before timbre. |
| 5 | enemyBoom | Enemy Boom | 3.8 | direct-cue-comparison | 0.039s | 631.8 Hz | onset | 5.5 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 6 | captureRetreat | Capture Retreat | 3.35 | direct-cue-comparison | 0.24s | 729.6 Hz | tail | 6.8 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.31 | direct-cue-comparison | 0.42s | 595.6 Hz | onset | 1.96 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 8 | rescueJoin | Rescue Join | 3.31 | direct-cue-comparison | 0.149s | 463.2 Hz | tail | 5.67 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 9 | gameStart | Stage Start | 3.27 | direct-cue-comparison | 0.27s | 706.3 Hz | tail | 5.77 | Tune the tail segment first: tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 10 | bossHit | Boss Hit | 3.03 | direct-cue-comparison | 0.039s | 534.3 Hz | onset | 5.4 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 11 | enemyHit | Enemy Hit | 2.98 | direct-cue-comparison | 0.42s | 422.6 Hz | onset | 1.72 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 12 | stagePulse | Formation Pulse | 2.89 | direct-cue-comparison | 0.45s | 656.9 Hz | onset | 6.91 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: playerHit body. Rerun audio comparison and event-gap analysis after the change.


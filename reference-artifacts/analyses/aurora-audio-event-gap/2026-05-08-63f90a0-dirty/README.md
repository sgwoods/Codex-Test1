# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T22:54:19.076Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-63f90a0/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Segment role comparisons: 35
- Average worst segment risk: 4.97/10
- Semantic event score: 9.76/10
- Low semantic cue rows: 0
- Semantic attention rows: 0
- Shared-reference clip risks: 0
- Highest event-gap risk: captureRetreat (4.51/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | none | -- | -- | -- | -- | No semantic attention rows under current scorer. | Keep as guardrail. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Worst segment | Segment risk | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | --- | ---: | --- |
| 1 | captureRetreat | Capture Retreat | 4.51 | direct-cue-comparison | 0.219s | 903.2 Hz | onset | 6.27 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 2 | attractPulse | Demo Pulse | 3.8 | direct-cue-comparison | 0.041s | 562.4 Hz | onset | 5.33 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 3 | playerHit | Ship Loss | 3.53 | active-segment-detected | 0.012s | 604.3 Hz | body | 5.84 | Tune the body segment first: body timing/duration differs enough to tune event pacing before timbre. |
| 4 | enemyBoom | Enemy Boom | 3.49 | direct-cue-comparison | 0.029s | 603.3 Hz | onset | 5.34 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 5 | rescueJoin | Rescue Join | 3.49 | direct-cue-comparison | 0.149s | 474.5 Hz | tail | 6.64 | Tune the tail segment first: tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 6 | capturedFighterDestroyed | Captured Fighter Destroyed | 3.48 | direct-cue-comparison | 0.039s | 774.9 Hz | onset | 7.37 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 7 | enemyHit | Enemy Hit | 3.12 | direct-cue-comparison | 0.42s | 464.1 Hz | onset | 2.09 | Prioritize impact/explosion event clarity so the player understands damage, kill, and boss multi-hit state. |
| 8 | captureBeam | Capture Beam | 3.09 | direct-cue-comparison | 0.148s | 213 Hz | onset | 4.17 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 9 | challengeResults | Challenge Results | 2.97 | direct-cue-comparison | 0.229s | 252.5 Hz | onset | 6.9 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |
| 10 | bossHit | Boss Hit | 2.81 | direct-cue-comparison | 0.019s | 536.3 Hz | onset | 4.95 | Tune the onset segment first: onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| 11 | stagePulse | Formation Pulse | 2.81 | direct-cue-comparison | 0.45s | 651.8 Hz | onset | 7.18 | Tune the onset segment first: onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| 12 | bossBoom | Boss Boom | 2.52 | active-segment-detected | 0.578s | 298.8 Hz | onset | 4.98 | Tune the onset segment first: onset timing/duration differs enough to tune event pacing before timbre. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Tune the highest segment-level gap next: capturedFighterDestroyed onset. Rerun audio comparison and event-gap analysis after the change.

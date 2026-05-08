# Aurora Audio Event Gap Analysis

Generated: `2026-05-08T14:15:15.039Z`

## Problem

Aurora audio conformance is the weakest current release axis, but the next work must distinguish true runtime cue gaps from broad or missing reference measurements.

## Strategy

Reuse the latest captured Aurora audio comparison metrics, rank event cues by active-duration/timbre/reference-window risk, and expose missing critical cue coverage before tuning.

## Success Measure

The next audio cycle should reduce missing critical comparison coverage, narrow broad reference windows, and lower the highest-risk event cue gaps without regressing gameplay guardrails.

## Current Read

- Source metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-08-main-dfb47de/metrics.json`
- Compared cues: 21
- Critical cues with comparison coverage: 15
- Missing critical comparison cues: 0
- Broad reference windows needing segmentation: 0
- Semantic event score: 9.43/10
- Low semantic cue rows: 0
- Semantic attention rows: 7
- Shared-reference clip risks: 7
- Highest event-gap risk: challengePerfect (3.5/10 risk)

## Semantic Event Read

This layer asks whether the cue is mapped to the right gameplay meaning, not only whether the waveform is close. A low row usually means the cue has a shared reference source, fuzzy mapping, missing subwindow, or weak distinction from adjacent events.

| Rank | Cue | Event class | Semantic /10 | Confidence | Shared refs | Player/designer meaning | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | enemyShot | threat-fired | 8.5 | medium | 3 | An enemy threat entered play; the cue should not collapse into the player shot sound. | Split or label the shared reference source so enemyShot remains distinct from playerShot, attackCharge, enemyHit. |
| 2 | playerShot | projectile-fired | 8.5 | medium | 3 | The player acted; the shot should be quick, crisp, and distinct from impacts. | Split or label the shared reference source so playerShot remains distinct from enemyShot, enemyHit, bossHit. |
| 3 | bossHit | boss-damage-confirmation | 8.7 | medium | 3 | A multi-hit boss was damaged but not necessarily destroyed. | Split or label the shared reference source so bossHit remains distinct from bossBoom, enemyHit, playerShot. |
| 4 | enemyHit | impact-confirmation | 8.8 | medium | 2 | A hit connected; the player should hear immediate damage feedback before destruction hierarchy. | Split or label the shared reference source so enemyHit remains distinct from enemyBoom, bossHit, playerShot. |
| 5 | enemyBoom | enemy-destroyed | 8.9 | medium | 2 | A normal enemy was destroyed; the cue should feel more final than a hit. | Split or label the shared reference source so enemyBoom remains distinct from enemyHit, bossBoom. |
| 6 | attractPulse | documented-cue | 9.5 | high | 2 | Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins. | Keep semantic mapping as a guardrail while acoustic/timing gaps are tuned. |
| 7 | stagePulse | documented-cue | 9.5 | high | 2 | Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure. | Keep semantic mapping as a guardrail while acoustic/timing gaps are tuned. |

## Highest-Risk Compared Cues

| Rank | Cue | Label | Risk /10 | Status | Duration gap | Centroid gap | Best segment | Recommended action |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | --- |
| 1 | challengePerfect | Challenge Perfect | 3.5 | direct-cue-comparison | 0.06s | 817 Hz | 0.581 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 2 | captureBeam | Capture Beam | 3.36 | direct-cue-comparison | 0.141s | 632.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 3 | challengeResults | Challenge Results | 2.96 | direct-cue-comparison | 0s | 563.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 4 | captureSuccess | Fighter Captured | 2.89 | direct-cue-comparison | 0.021s | 657.5 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 5 | enemyShot | Enemy Shot | 2.78 | active-segment-detected | 1.037s | 526.4 Hz | 0.914 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 6 | playerShot | Player Shot | 2.78 | active-segment-detected | 1.037s | 526.4 Hz | 0.914 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 7 | attractPulse | Demo Pulse | 2.77 | direct-cue-comparison | 0.03s | 105.7 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 8 | bossHit | Boss Hit | 2.76 | active-segment-detected | 0.977s | 541.2 Hz | 0.859 | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |
| 9 | rescueJoin | Rescue Join | 2.61 | direct-cue-comparison | 0s | 272.5 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 10 | stagePulse | Formation Pulse | 2.53 | direct-cue-comparison | 0.03s | 53.1 Hz | n/a | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 11 | playerHit | Ship Loss | 2.46 | active-segment-detected | 0.608s | 280 Hz | 0.69 | Keep as secondary pass after higher-risk audio gaps are narrowed. |
| 12 | highScoreFirst | High Score 1st | 2.15 | direct-cue-comparison | 0s | 712.8 Hz | n/a | Tune timbre/centroid after confirming event timing; current cue character is far from reference. |

## Missing Critical Comparison Coverage

All critical cues have comparison coverage.

## Recommended Next Step

Split or further label the shared shot/impact/explosion reference mappings first, especially playerShot/enemyShot/bossHit and enemyHit/enemyBoom, then rerun the audio comparison and semantic event-gap analysis.


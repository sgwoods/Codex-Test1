# Aurora Audio Risk Stability

Generated: `2026-05-17T12:44:19.036Z`
Reports analyzed: 8

## Why This Exists

Repeated full-theme audio captures can move cue risk even when runtime cue definitions are unchanged. This report turns that movement into a first-class promotion guardrail so candidate loops do not mistake capture/scoring volatility for conformance gain.

## Summary

- Volatile cues: 19
- Most volatile cue: `captureBeam` (3.89/10 range)
- Highest median gap cue: `challengePerfect` (7.07/10 median risk)
- Recommendation: Use median/repeated confirmation before promoting audio changes. Start by stabilizing captureBeam scoring, then retest challengePerfect.

## Cue Stability

| Cue | Median Gap | Gap Range | Median Worst Segment | Segment Range | Stability | Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `captureBeam` | 3.3 | 3.89 | 5.71 | 1.14 | 1.38 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `attractPulse` | 1.63 | 2.14 | 2.6 | 3.48 | 2.3 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `gameStart` | 2.47 | 2.63 | 6 | 2.3 | 4.19 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `playerHit` | 2.11 | 2.61 | 0 | 0 | 4.34 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `challengeResults` | 1.41 | 1.29 | 4.37 | 2.58 | 4.39 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `captureSuccess` | 1.08 | 1.23 | 1.91 | 2.5 | 4.61 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `challengePerfect` | 7.07 | 2.25 | 7.38 | 2.49 | 4.64 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `captureRetreat` | 1.83 | 0.81 | 2.55 | 1.79 | 6.02 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `highScoreFirst` | 4.21 | 1.6 | 5.18 | 1.44 | 6.51 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `rescueJoin` | 3.11 | 1 | 4.69 | 1.53 | 6.59 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `enemyShot` | 1.63 | 1.47 | 1.48 | 1.1 | 6.84 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `enemyBoom` | 2.19 | 1.43 | 0.92 | 0.48 | 6.85 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `highScoreOther` | 2.54 | 1.31 | 3.79 | 1.39 | 7.1 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `gameOver` | 2.45 | 1.34 | 6.19 | 0.74 | 7.03 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `bossBoom` | 2.18 | 1.24 | 3.48 | 0.98 | 7.25 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `challengeTransition` | 4.16 | 0.97 | 5.69 | 1.12 | 7.58 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |

## Source Reports

- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104529/report.json` (2026-05-17T10:45:29.049Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104637/report.json` (2026-05-17T10:46:37.123Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104848/report.json` (2026-05-17T10:48:48.324Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-105537/report.json` (2026-05-17T10:55:37.135Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-110019/report.json` (2026-05-17T11:00:19.669Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-f9e7374c-dirty-115825/report.json` (2026-05-17T11:58:25.007Z, f9e7374c, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-f9e7374c-dirty-123933/report.json` (2026-05-17T12:39:33.130Z, f9e7374c, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-f9e7374c-dirty-124404/report.json` (2026-05-17T12:44:04.983Z, f9e7374c, dirty)


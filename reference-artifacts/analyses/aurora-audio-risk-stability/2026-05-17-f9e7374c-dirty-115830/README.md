# Aurora Audio Risk Stability

Generated: `2026-05-17T11:58:30.123Z`
Reports analyzed: 8

## Why This Exists

Repeated full-theme audio captures can move cue risk even when runtime cue definitions are unchanged. This report turns that movement into a first-class promotion guardrail so candidate loops do not mistake capture/scoring volatility for conformance gain.

## Summary

- Volatile cues: 7
- Most volatile cue: `challengePerfect` (1.96/10 range)
- Highest median gap cue: `challengePerfect` (6.24/10 median risk)
- Recommendation: Use median/repeated confirmation before promoting audio changes. Start by stabilizing challengePerfect scoring, then retest challengePerfect.

## Cue Stability

| Cue | Median Gap | Gap Range | Median Worst Segment | Segment Range | Stability | Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `challengePerfect` | 6.24 | 1.96 | 6.62 | 1.93 | 5.59 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `rescueJoin` | 3.11 | 0.48 | 4.69 | 1.47 | 6.71 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `highScoreOther` | 2.54 | 1.31 | 3.79 | 1.39 | 7.08 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `capturedFighterDestroyed` | 1.46 | 0.37 | 2.1 | 1.22 | 7.27 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `captureRetreat` | 1.83 | 0.07 | 2.55 | 1.1 | 7.65 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `challengeTransition` | 4.16 | 1.07 | 5.71 | 0.3 | 7.7 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `stagePulse` | 0.39 | 0.51 | 2.04 | 0.97 | 7.99 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `highScoreFirst` | 4.21 | 0.95 | 5.26 | 0.56 | 8.02 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `playerHit` | 2.11 | 0.86 | 0 | 0 | 8.06 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `playerShot` | 1.91 | 0.22 | 1.92 | 0.81 | 8.3 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `enemyBoom` | 2.22 | 0.7 | 0.95 | 0.09 | 8.55 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `gameStart` | 2.39 | 0.09 | 6 | 0.63 | 8.6 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `captureBeam` | 3.29 | 0.07 | 5.64 | 0.6 | 8.71 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `captureSuccess` | 1.21 | 0.15 | 2.31 | 0.6 | 8.66 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `enemyShot` | 1.63 | 0.36 | 1.48 | 0.59 | 8.75 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `challengeResults` | 1.58 | 0.39 | 4.59 | 0.43 | 9.06 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |

## Source Reports

- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-103817/report.json` (2026-05-17T10:38:17.204Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-103931/report.json` (2026-05-17T10:39:31.151Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104529/report.json` (2026-05-17T10:45:29.049Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104637/report.json` (2026-05-17T10:46:37.123Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104848/report.json` (2026-05-17T10:48:48.324Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-105537/report.json` (2026-05-17T10:55:37.135Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-110019/report.json` (2026-05-17T11:00:19.669Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-f9e7374c-dirty-115825/report.json` (2026-05-17T11:58:25.007Z, f9e7374c, dirty)


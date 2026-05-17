# Aurora Audio Risk Stability

Generated: `2026-05-17T10:51:32.349Z`
Reports analyzed: 8

## Why This Exists

Repeated full-theme audio captures can move cue risk even when runtime cue definitions are unchanged. This report turns that movement into a first-class promotion guardrail so candidate loops do not mistake capture/scoring volatility for conformance gain.

## Summary

- Volatile cues: 11
- Most volatile cue: `challengePerfect` (4.56/10 range)
- Highest median gap cue: `challengePerfect` (5.11/10 median risk)
- Recommendation: Use median/repeated confirmation before promoting audio changes. Start by stabilizing challengePerfect scoring, then retest challengePerfect.

## Cue Stability

| Cue | Median Gap | Gap Range | Median Worst Segment | Segment Range | Stability | Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `challengePerfect` | 5.11 | 4.56 | 5.47 | 2.82 | 0.3 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `capturedFighterDestroyed` | 1.69 | 2.55 | 3.14 | 3.46 | 2.33 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `enemyBoom` | 2.3 | 0.44 | 0.98 | 2.63 | 4.02 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `highScoreFirst` | 4.19 | 2.62 | 5.22 | 1.4 | 4.21 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `captureSuccess` | 1.23 | 0.77 | 2.51 | 2.1 | 5.42 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `rescueJoin` | 3.34 | 0.48 | 5.15 | 1.47 | 6.82 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `challengeTransition` | 4.28 | 1.07 | 5.91 | 0.26 | 7.72 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `captureRetreat` | 1.86 | 0.38 | 1.95 | 1.04 | 7.69 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `playerHit` | 2.49 | 0.85 | 0 | 0 | 8.08 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `highScoreOther` | 2.58 | 0.57 | 4.39 | 0.82 | 8.17 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `enemyShot` | 1.63 | 0.18 | 1.48 | 0.77 | 8.26 | Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes. |
| `playerShot` | 1.91 | 0.64 | 1.92 | 0.48 | 8.55 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `gameStart` | 2.38 | 0.12 | 5.9 | 0.63 | 8.63 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `captureBeam` | 3.29 | 0.05 | 5.76 | 0.6 | 8.68 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `stagePulse` | 0.84 | 0.46 | 2.56 | 0.58 | 8.72 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |
| `challengeResults` | 1.67 | 0.31 | 4.62 | 0.43 | 9.11 | Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change. |

## Source Reports

- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-612f086f-dirty-021357/report.json` (2026-05-17T02:13:57.445Z, 612f086f, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-612f086f-dirty-021525/report.json` (2026-05-17T02:15:25.741Z, 612f086f, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-612f086f-dirty-022308/report.json` (2026-05-17T02:23:08.705Z, 612f086f, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-103817/report.json` (2026-05-17T10:38:17.204Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-103931/report.json` (2026-05-17T10:39:31.151Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104529/report.json` (2026-05-17T10:45:29.049Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104637/report.json` (2026-05-17T10:46:37.123Z, ab80e4c7, dirty)
- `reference-artifacts/analyses/aurora-audio-event-gap/2026-05-17-ab80e4c7-dirty-104848/report.json` (2026-05-17T10:48:48.324Z, ab80e4c7, dirty)


# Aurora Foreground Audio Balance

This report compares local/private reference-audio cue behavior against a public-safe host simulation, then measures whether foreground combat cues separate from the stagePulse bed in a short offline cue-probe window.

Generated: 2026-06-10T03:30:46.589Z
Commit: `69ebd6e75f7079345eb095d00506d9afbd84b07a`

## Summary

- Dev reference available: true
- Public-safe private clip leak guard: true
- Weak foreground rows: none
- Minimum foreground RMS over pulse: 5.38 dB

## Scenario Resolution

| Scenario | Host | Default theme | Reference available | Stage pulse clip |
| --- | --- | --- | --- | --- |
| localhost dev reference lane | localhost | galaga-reference-assets | true | assets/reference-audio/galaga3-ambience-convoy.m4a |
| public-safe production-host simulation | aurora-public.localhost | aurora-application | false | synthetic |

## Foreground Over Pulse

| Cue | Dev duration | Dev RMS dB over pulse | Dev composite lift | Public-safe RMS dB over pulse | Pass | Read |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| attackCharge | 1.55s | 5.38 | 6.49 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| enemyShot | 4s | 7.56 | 8.2 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| enemyHit | 0.2s | 10.03 | 10.43 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| enemyBoom | 0.24s | 10.96 | 11.31 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| bossHit | 0.29s | 8.24 | 8.84 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| bossBoom | 0.64s | 10.66 | 11.02 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| playerShot | 0.24s | 9.33 | 9.83 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |

## Decision

Foreground/pulse balance and cue-role duration pass for the measured local reference lane; preserve the current cue windows while keeping public-safe cue resolution synthetic/no-reference.

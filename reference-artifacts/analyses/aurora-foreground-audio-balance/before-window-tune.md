# Aurora Foreground Audio Balance

This report compares local/private reference-audio cue behavior against a public-safe host simulation, then measures whether foreground combat cues separate from the stagePulse bed in a short offline cue-probe window.

Generated: 2026-06-09T18:34:09.396Z
Commit: `ecff2f1fdc9bad54702145a947bf59cae2f5c172`

## Summary

- Dev reference available: true
- Public-safe private clip leak guard: true
- Weak foreground rows: attackCharge, enemyHit, enemyBoom, bossBoom
- Minimum foreground RMS over pulse: -83.21 dB

## Scenario Resolution

| Scenario | Host | Default theme | Reference available | Stage pulse clip |
| --- | --- | --- | --- | --- |
| localhost dev reference lane | localhost |  | true | assets/reference-audio/galaga3-ambience-convoy.m4a |
| public-safe production-host simulation | aurora-public.localhost |  | false | synthetic |

## Foreground Over Pulse

| Cue | Dev RMS dB over pulse | Dev composite lift | Public-safe RMS dB over pulse | Pass | Read |
| --- | ---: | ---: | ---: | --- | --- |
| attackCharge | -83.21 | 0 | null | false | Foreground cue risks being masked by the stagePulse bed in the cue-probe window. |
| enemyShot | 7.56 | 8.2 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| enemyHit | null | 0 | null | false | No measurable foreground/pulse RMS ratio. |
| enemyBoom | null | 0 | null | false | No measurable foreground/pulse RMS ratio. |
| bossHit | 8.24 | 8.84 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |
| bossBoom | -36.5 | 0 | null | false | Foreground cue risks being masked by the stagePulse bed in the cue-probe window. |
| playerShot | 9.33 | 9.83 | null | true | Foreground cue has measurable level separation over the stagePulse bed. |

## Decision

Target the weakest foreground/pulse row(s) only: attackCharge, enemyHit, enemyBoom, bossBoom. Keep public-safe cue resolution synthetic/no-reference.

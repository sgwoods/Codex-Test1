# Galaxian Progression Pressure Curve

Status: `first-pass-local-metric`

This curve compares promoted Nenriki long-session windows with ARCADE'S LOUNGE Level 5 active-play traces.

## Nenriki Promoted Windows

| Window | Time | Detection | X Range | Mean Abs Delta | Active Pressure | Projectiles | Pressure Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `opening-active-wave` | 48.000-90.000s | 626/630 | 0.7633 | 0.0158 | 55 | 52 | 65.983 |
| `early-progression-pressure` | 90.000-145.000s | 824/825 | 0.8255 | 0.0204 | 29 | 53 | 57.337 |
| `mid-session-pressure` | 180.000-240.000s | 900/900 | 0.8005 | 0.0165 | 22 | 51 | 51.888 |
| `late-session-pressure` | 660.000-720.000s | 876/900 | 0.7264 | 0.0192 | 33 | 50 | 55.31 |
| `endgame-cleanup` | 870.000-930.000s | 781/900 | 0.7541 | 0.0195 | 28 | 47 | 52.777 |
| `arcades-level-5-active-reference` | 8.000-40.000s | 471/480 | 0.5434 | 0.0147 | 19 | 68 | 49.61 |

## Interpretation

- Opening and early windows are best for rack setup, first-dive feel, and player introduction.
- Mid and late windows are best for pressure growth, player survival movement, and projectile-density expectations.
- Endgame cleanup is useful for lifecycle, game-over, and late-run depletion states rather than first-playable tuning.

## Aurora Expansion Relevance

The same curve shape should be used when expanding Aurora: pick one opening-stage baseline, one challenge-stage evidence window, one mid-run pressure window, and one late-run cleanup or failure window before adding new aliens or movement families.

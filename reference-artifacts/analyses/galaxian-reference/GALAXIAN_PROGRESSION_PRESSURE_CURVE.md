# Galaxian Progression Pressure Curve

Status: `first-pass-local-metric`

This curve compares promoted Nenriki long-session windows with ARCADE'S LOUNGE Level 5 active-play traces.

## Nenriki Promoted Windows

| Window | Time | Detection | X Range | Mean Abs Delta | Lower Pressure | Projectiles | Pressure Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `opening-active-wave` | 48.000-90.000s | 107/630 | 0.4977 | 0.0383 | 50 | 51 | 62.367 |
| `early-progression-pressure` | 90.000-145.000s | 75/825 | 0.4796 | 0.0429 | 26 | 51 | 52.265 |
| `mid-session-pressure` | 180.000-240.000s | 69/900 | 0.5205 | 0.0605 | 20 | 48 | 53.938 |
| `late-session-pressure` | 660.000-720.000s | 103/900 | 0.5208 | 0.0622 | 30 | 47 | 58.52 |
| `endgame-cleanup` | 870.000-930.000s | 79/900 | 0.5486 | 0.0601 | 29 | 46 | 57.89 |
| `arcades-level-5-active-reference` | 8.000-40.000s | 471/480 | 0.5434 | 0.0148 | 20 | 68 | 50.085 |

## Interpretation

- Opening and early windows are best for rack setup, first-dive feel, and player introduction.
- Mid and late windows are best for pressure growth, player survival movement, and projectile-density expectations.
- Endgame cleanup is useful for lifecycle, game-over, and late-run depletion states rather than first-playable tuning.

## Aurora Expansion Relevance

The same curve shape should be used when expanding Aurora: pick one opening-stage baseline, one challenge-stage evidence window, one mid-run pressure window, and one late-run cleanup or failure window before adding new aliens or movement families.

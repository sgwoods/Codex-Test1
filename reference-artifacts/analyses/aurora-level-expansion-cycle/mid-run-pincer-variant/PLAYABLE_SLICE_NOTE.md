# mid-run-pincer-variant Playable Slice Note

Status: deterministic harness evidence captured

Scenario: `stage10-pincer-entry`

Seed: `10010`

Duration: 16s

## Trace Summary

- samples: 17
- player x range: 262
- max attackers: 4
- max enemy bullets: 3
- max challenge enemies: 0
- final stage: 10
- final score: 780

## Event Coverage

- `formation_entry`: observed
- `enemy_dive_start`: observed
- `flank_dive_start`: observed
- `escort_dive_start`: observed
- `enemy_projectile`: observed
- `player_hit`: not observed in this run
- `wave_clear`: not observed in this run

## Implementation Use

Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.

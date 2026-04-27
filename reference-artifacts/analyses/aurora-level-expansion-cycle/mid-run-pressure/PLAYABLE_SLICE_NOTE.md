# mid-run-pressure Playable Slice Note

Status: deterministic harness evidence captured

Scenario: `stage6-regular`

Seed: `6006`

Duration: 8s

## Trace Summary

- samples: 9
- player x range: 262
- max attackers: 3
- max enemy bullets: 2
- max challenge enemies: 0
- final stage: 6
- final score: 250

## Event Coverage

- `formation_entry`: observed
- `enemy_dive_start`: observed
- `escort_dive_start`: not observed in this run
- `enemy_projectile`: observed
- `player_hit`: observed
- `wave_clear`: not observed in this run

## Implementation Use

Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.

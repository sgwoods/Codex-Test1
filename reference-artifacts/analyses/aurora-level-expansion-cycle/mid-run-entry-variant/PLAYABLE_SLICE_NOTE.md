# mid-run-entry-variant Playable Slice Note

Status: deterministic harness evidence captured

Scenario: `stage8-entry-variant`

Seed: `8008`

Duration: 10s

## Trace Summary

- samples: 11
- player x range: 262
- max attackers: 2
- max enemy bullets: 2
- max challenge enemies: 0
- final stage: 8
- final score: 590

## Event Coverage

- `formation_entry`: observed
- `enemy_dive_start`: observed
- `escort_dive_start`: not observed in this run
- `enemy_projectile`: observed
- `player_hit`: observed
- `wave_clear`: not observed in this run

## Implementation Use

Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.

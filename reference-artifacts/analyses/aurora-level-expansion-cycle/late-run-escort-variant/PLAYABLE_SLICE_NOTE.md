# late-run-escort-variant Playable Slice Note

Status: deterministic harness evidence captured

Scenario: `stage14-escort-variant`

Seed: `14014`

Duration: 12s

## Trace Summary

- samples: 13
- player x range: 262
- max attackers: 9
- max enemy bullets: 3
- max challenge enemies: 0
- final stage: 14
- final score: 720

## Event Coverage

- `formation_entry`: observed
- `enemy_dive_start`: observed
- `escort_dive_start`: observed
- `enemy_projectile`: observed
- `player_hit`: observed
- `wave_clear`: not observed in this run
- `game_over`: not observed in this run

## Implementation Use

Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.

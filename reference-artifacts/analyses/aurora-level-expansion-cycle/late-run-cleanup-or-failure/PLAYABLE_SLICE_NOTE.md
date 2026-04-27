# late-run-cleanup-or-failure Playable Slice Note

Status: deterministic harness evidence captured

Scenario: `stage12-variety`

Seed: `12003`

Duration: 10s

## Trace Summary

- samples: 11
- player x range: 262
- max attackers: 3
- max enemy bullets: 3
- max challenge enemies: 0
- final stage: 12
- final score: 840

## Event Coverage

- `enemy_dive_start`: observed
- `enemy_projectile`: observed
- `player_hit`: not observed in this run
- `wave_clear`: not observed in this run
- `game_over`: not observed in this run

## Implementation Use

Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.

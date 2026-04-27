# stage-1-baseline Playable Slice Note

Status: deterministic harness evidence captured

Scenario: `stage1-descent`

Seed: `2003`

Duration: 24s

## Trace Summary

- samples: 25
- player x range: 262
- max attackers: 2
- max enemy bullets: 1
- max challenge enemies: 0
- final stage: 1
- final score: 0

## Event Coverage

- `stage_start`: observed
- `formation_entry`: observed
- `player_move`: observed
- `player_shot`: not observed in this run
- `enemy_dive_start`: observed
- `enemy_projectile`: observed
- `wave_clear`: not observed in this run

## Implementation Use

Use this as first local Aurora runtime evidence, not final arcade correspondence. The next step is to compare this captured slice against archived reference footage before changing gameplay tuning.

# Aurora Stage 4 Lane7 Pressure Regression

Generated: `2026-05-07T11:41:31.072Z`

## Problem

The archived Stage 4 lane7 pressure loss is input-sensitive. A conformance improvement is only useful if the platform can keep measuring the recovered pressure window automatically.

## Strategy

Promote the best input-sensitivity sweep variant into a controlled-clock sampler scenario and assert that it still produces an enemy-body-contact loss inside the source danger window.

## Success Measure

The scenario produces at least one `enemy_collision` ship loss between stage clocks 13.65 and 14.05.

## Result

- Outcome: pass
- Matching loss: {"t":13.867,"stageClock":13.867,"cause":"enemy_collision","sourceType":"but","sourceLane":8,"sourceColumn":null,"playerLane":8,"playerX":238.15,"enemyX":234.3,"enemyY":335.84}
- Losses: [{"t":13.867,"stageClock":13.867,"cause":"enemy_collision","sourceType":"but","sourceLane":8,"sourceColumn":null,"playerLane":8,"playerX":238.15,"enemyX":234.3,"enemyY":335.84}]

## Note

A first attempt to assert this through `run-gameplay --deterministic-replay` did not reproduce the recovered loss, so the next harness-quality target is aligning that path with the controlled sampler.

# Aurora Stage 4 Pressure Risk

Generated: `2026-05-06T15:42:23.932Z`

## Problem

Stage 4 pressure still fails independently of challenge-stage safety. This report mines recent pressure artifacts to make collision and bullet-loss patterns measurable before another gameplay tuning pass.

## Sources

- Input root: `harness-artifacts/checks/stage-pressure-balance`
- Runs scanned: 15
- Usable video-backed runs: 11
- Unusable video-backed runs: 4

## Risk Summary

- Total losses: 19
- Collision losses: 17
- Bullet losses: 2
- Hit-before-collision cases: 5
- Avg recent attack starts at loss: 2.842
- Avg recent enemy bullets at loss: 1.053

## Scenario Breakdown

### stage4-five-ships
- Runs: 6
- Usable runs: 6
- Losses: 6
- Avg losses per usable run: 1
- Causes: `{"enemy_collision":5,"enemy_bullet":1}`
- Source roles: `{"boss":2,"but":3,"bee":1}`
- Hit-before-collision: 0

### stage4-survival
- Runs: 9
- Usable runs: 5
- Losses: 13
- Avg losses per usable run: 1.2
- Causes: `{"enemy_collision":12,"enemy_bullet":1}`
- Source roles: `{"boss":5,"bee":4,"but":4}`
- Hit-before-collision: 5

## Top Loss Signatures

- 4x `stage4-survival|enemy_collision|boss|playerLane:7|sourceLane:7|sourceColumn:5|recentAttacks:3|hit-before-loss`
- 2x `stage4-five-ships|enemy_collision|boss|playerLane:6|sourceLane:6|sourceColumn:5|recentAttacks:3|no-hit-before-loss`
- 2x `stage4-five-ships|enemy_collision|but|playerLane:2|sourceLane:2|sourceColumn:5|recentAttacks:4|no-hit-before-loss`
- 1x `stage4-five-ships|enemy_bullet|bee|playerLane:3|sourceLane:2|sourceColumn:na|recentAttacks:3|no-hit-before-loss`
- 1x `stage4-five-ships|enemy_collision|but|playerLane:1|sourceLane:1|sourceColumn:2|recentAttacks:2|no-hit-before-loss`
- 1x `stage4-survival|enemy_bullet|bee|playerLane:3|sourceLane:3|sourceColumn:2|recentAttacks:2|no-hit-before-loss`
- 1x `stage4-survival|enemy_collision|bee|playerLane:0|sourceLane:1|sourceColumn:0|recentAttacks:4|no-hit-before-loss`
- 1x `stage4-survival|enemy_collision|bee|playerLane:8|sourceLane:8|sourceColumn:7|recentAttacks:2|no-hit-before-loss`
- 1x `stage4-survival|enemy_collision|bee|playerLane:8|sourceLane:8|sourceColumn:8|recentAttacks:1|no-hit-before-loss`
- 1x `stage4-survival|enemy_collision|boss|playerLane:5|sourceLane:6|sourceColumn:5|recentAttacks:3|hit-before-loss`
- 1x `stage4-survival|enemy_collision|but|playerLane:2|sourceLane:2|sourceColumn:3|recentAttacks:3|no-hit-before-loss`
- 1x `stage4-survival|enemy_collision|but|playerLane:4|sourceLane:4|sourceColumn:9|recentAttacks:1|no-hit-before-loss`

## Recommended Next Step

- Promote the top loss signatures into deterministic loss-window scenarios before changing regular-stage collision or dive semantics.
- Add path-trace/contact-sheet extraction for boss and but dive losses around 12-19 seconds in Stage 4.
- Treat video-quality failures as harness evidence debt; usable-run thresholds should report artifact-quality reasons separately from gameplay failures.
- Tune only one lever at a time after the risk report identifies whether the dominant gap is boss dive path, but dive path, bullet timing, or player automation crossing behavior.

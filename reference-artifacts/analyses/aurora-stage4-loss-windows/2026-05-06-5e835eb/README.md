# Aurora Stage 4 Loss Windows

Generated: `2026-05-06T19:38:30.841Z`

## Problem

The Stage 4 pressure gap is currently dominated by body-contact deaths during scoreable dive pressure, especially boss and butterfly paths that reach the player lane immediately after or near player shots.

## Strategy

This artifact promotes the highest-value Stage 4 pressure-risk signatures into short harness windows and records whether fresh replay probes reproduce the archived loss signatures. The source-window extraction is the current authority; replay mismatch is treated as a harness precision finding, not as proof that the pressure problem disappeared.

## Success Criteria For This Phase

- Source windows found: 3/3
- Fresh replay probes reproduced: 0/3
- Overall assessment gate: PASS

A pass here means the measurement problem improved and the replay reproducibility gap is measured. It does not mean gameplay conformance improved yet.

## Window Results

### stage4-survival-boss-lane7
- Scenario: `stage4-survival-boss-lane7-loss-window`
- Archived source matches: 4
- Fresh replay reproduced expected signature: no
- Fresh replay loss count: 0
- Source loss: `enemy_collision|boss|playerLane:7|sourceLane:7|sourceColumn:5|t:13.85|hitBefore:true`

### stage4-five-ships-but-lane2
- Scenario: `stage4-five-ships-but-lane2-loss-window`
- Archived source matches: 2
- Fresh replay reproduced expected signature: no
- Fresh replay loss count: 0
- Source loss: `enemy_collision|but|playerLane:2|sourceLane:2|sourceColumn:5|t:15.25|hitBefore:false`

### stage4-five-ships-boss-lane6
- Scenario: `stage4-five-ships-boss-lane6-loss-window`
- Archived source matches: 2
- Fresh replay reproduced expected signature: no
- Fresh replay loss count: 0
- Source loss: `enemy_collision|boss|playerLane:6|sourceLane:6|sourceColumn:5|t:18.517|hitBefore:false`

## Recommended Next Step

- Add per-frame attacker path sampling for these promoted windows so the boss/butterfly path, player lane, and shot timing can be scored frame-by-frame before changing gameplay constants.
- Then tune one pressure lever at a time and compare these windows plus the aggregate Stage 4 pressure gate.


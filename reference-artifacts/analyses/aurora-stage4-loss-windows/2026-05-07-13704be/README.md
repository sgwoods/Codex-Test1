# Aurora Stage 4 Loss Windows

Generated: `2026-05-07T20:22:46.860Z`

## Problem

The Stage 4 pressure gap is currently dominated by body-contact deaths during scoreable dive pressure, especially boss and butterfly paths that reach the player lane immediately after or near player shots.

## Strategy

This artifact promotes the highest-value Stage 4 pressure-risk signatures into short harness windows and records whether fresh replay probes reproduce the archived loss signatures. The source-window extraction is the current authority; replay mismatch is treated as a harness precision finding, not as proof that the pressure problem disappeared.

## Success Criteria For This Phase

- Source windows found: 3/3
- Fresh replay probes reproduced exact source losses: 0/3
- Fresh replay probes reproduced same-window collision pressure: 1/3
- Video-backed probes blocked before the target source window: 1/3
- Overall assessment gate: PASS

A pass here means the measurement problem improved and the replay reproducibility gap is measured. It does not mean gameplay conformance improved yet.

## Window Results

### stage4-survival-boss-lane7
- Scenario: `stage4-survival-boss-lane7-loss-window`
- Archived source matches: 4
- No-video replay classification: same-window-alternate-collision
- Video-backed replay classification: same-window-alternate-collision
- No-video replay reproduced expected signature: no
- Video-backed replay reproduced expected signature: no
- No-video replay loss count: 1
- Video-backed replay loss count: 1
- Source loss: `enemy_collision|boss|playerLane:7|sourceLane:7|sourceColumn:5|t:13.85|hitBefore:true`
- No-video replay nearest loss: `enemy_collision|bee|playerLane:8|sourceLane:8|sourceColumn:8|t:13.683|hitBefore:false`
- Video-backed replay nearest loss: `enemy_collision|bee|playerLane:8|sourceLane:8|sourceColumn:8|t:13.683|hitBefore:false`

### stage4-five-ships-but-lane2
- Scenario: `stage4-five-ships-but-lane2-loss-window`
- Archived source matches: 2
- No-video replay classification: no-loss-near-window
- Video-backed replay classification: no-loss-near-window
- No-video replay reproduced expected signature: no
- Video-backed replay reproduced expected signature: no
- No-video replay loss count: 1
- Video-backed replay loss count: 1
- Source loss: `enemy_collision|but|playerLane:2|sourceLane:2|sourceColumn:5|t:15.25|hitBefore:false`
- No-video replay nearest loss: `enemy_collision|boss|playerLane:4|sourceLane:4|sourceColumn:5|t:15.55|hitBefore:false`
- Video-backed replay nearest loss: `enemy_collision|bee|playerLane:4|sourceLane:4|sourceColumn:4|t:15.5|hitBefore:false`

### stage4-five-ships-boss-lane6
- Scenario: `stage4-five-ships-boss-lane6-loss-window`
- Archived source matches: 2
- No-video replay classification: no-loss-near-window
- Video-backed replay classification: blocked-before-source-window
- No-video replay reproduced expected signature: no
- Video-backed replay reproduced expected signature: no
- No-video replay loss count: 0
- Video-backed replay loss count: 1
- Source loss: `enemy_collision|boss|playerLane:6|sourceLane:6|sourceColumn:5|t:18.517|hitBefore:false`
- Video-backed replay nearest loss: `enemy_collision|but|playerLane:9|sourceLane:8|sourceColumn:7|t:17.933|hitBefore:false`

## Recommended Next Step

- Add per-frame attacker path sampling for these promoted windows so the boss/butterfly path, player lane, and shot timing can be scored frame-by-frame before changing gameplay constants.
- Then tune one pressure lever at a time and compare these windows plus the aggregate Stage 4 pressure gate.


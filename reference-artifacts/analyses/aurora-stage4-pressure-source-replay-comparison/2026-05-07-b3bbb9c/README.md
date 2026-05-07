# Aurora Stage 4 Source vs Replay Geometry

Generated: `2026-05-07T13:15:08.946Z`

## Problem

Archived Stage 4 pressure losses are real, but current fresh replay probes often miss the loss. We need to know whether the miss comes from attacker phase, player lane drift, or preserved-but-nonlethal near pressure.

## Strategy

Compare each representative source loss geometry against the nearest and strongest sampled fresh-replay geometry from the promoted Stage 4 pressure windows.

## Success Measure

Every promoted window receives a source/replay delta and a divergence diagnosis before gameplay constants are tuned.

## Results

### stage4-survival-boss-lane7
- Source contact score: -2.43 at t=13.85
- Replay best contact score: 9.935 at t=13.677 (laneThreat)
- Replay best timing delta: -0.173
- Replay player lane delta at source loss time: -1
- Diagnosis: fresh replay preserved close pressure but stayed outside collision bounds

### stage4-five-ships-but-lane2
- Source contact score: -5.78 at t=15.25
- Replay best contact score: 10.85 at t=14.583 (laneThreat)
- Replay best timing delta: -0.667
- Replay player lane delta at source loss time: 0
- Diagnosis: fresh replay preserved close pressure but stayed outside collision bounds

### stage4-five-ships-boss-lane6
- Source contact score: -2.97 at t=18.517
- Replay best contact score: 13.83 at t=18.81 (laneThreat)
- Replay best timing delta: 0.293
- Replay player lane delta at source loss time: 1
- Diagnosis: expected source attacker is phase-diverged in fresh replay, staying high while source was in the player band

## Recommended Next Step

- Preserve and refine close-pressure windows first: `stage4-survival-boss-lane7`, `stage4-five-ships-but-lane2`.
- Improve deterministic replay/action sampling before treating high-divergence windows as gameplay tuning targets: `stage4-five-ships-boss-lane6`.

# Aurora Stage 4 Source vs Replay Geometry

Generated: `2026-05-06T22:04:18.968Z`

## Problem

Archived Stage 4 pressure losses are real, but current fresh replay probes often miss the loss. We need to know whether the miss comes from attacker phase, player lane drift, or preserved-but-nonlethal near pressure.

## Strategy

Compare each representative source loss geometry against the nearest and strongest sampled fresh-replay geometry from the promoted Stage 4 pressure windows.

## Success Measure

Every promoted window receives a source/replay delta and a divergence diagnosis before gameplay constants are tuned.

## Results

### stage4-survival-boss-lane7
- Source contact score: -2.43 at t=13.85
- Replay best contact score: 4.65 at t=14.15 (laneThreat)
- Replay best timing delta: 0.3
- Replay player lane delta at source loss time: 2
- Diagnosis: fresh replay preserved close pressure but stayed outside collision bounds

### stage4-five-ships-but-lane2
- Source contact score: -5.78 at t=15.25
- Replay best contact score: 19.12 at t=16.033 (expectedTarget)
- Replay best timing delta: 0.783
- Replay player lane delta at source loss time: -2
- Diagnosis: fresh replay path geometry diverged enough to remove the source collision

### stage4-five-ships-boss-lane6
- Source contact score: -2.97 at t=18.517
- Replay best contact score: 33.14 at t=17.667 (laneThreat)
- Replay best timing delta: -0.85
- Replay player lane delta at source loss time: 2
- Diagnosis: expected source attacker is phase-diverged in fresh replay, staying high while source was in the player band

## Recommended Next Step

- Tune or probe `stage4-survival-boss-lane7` first: it preserved close replay pressure while the other two windows diverged much farther.
- For the two high-divergence windows, improve deterministic replay/action sampling before treating them as gameplay tuning targets.


# Aurora Stage 4 Pressure Geometry

Generated: `2026-05-07T21:38:29.957Z`

## Problem

Stage 4 pressure windows are mined from real body-contact losses, but short replay probes can miss the loss. Without frame-level geometry, a miss could be player path drift, attacker path drift, shot timing, or collision tolerance.

## Strategy

Replay each promoted pressure window with controlled-clock sampling and record player lane, expected attacker path, nearby lane threats, bullets, and collision margins frame by frame around the expected loss interval.

## Success Measure

Each promoted pressure window produces geometry samples and a diagnosis that can guide the next tuning or harness-precision step.

## Results

### stage4-survival-boss-lane7
- Samples: 92
- Expected-target frames: 92
- Lane-threat frames: 32
- Observed collision geometry: no
- Best contact score: 9.935 at t=13.677
- Diagnosis: sampled replay kept the threat close but outside collision bounds

### stage4-five-ships-but-lane2
- Samples: 87
- Expected-target frames: 87
- Lane-threat frames: 147
- Observed collision geometry: no
- Best contact score: 1.97 at t=15.283
- Diagnosis: sampled replay produced a near-contact window; tiny player/path drift can decide the loss

### stage4-five-ships-boss-lane6
- Samples: 95
- Expected-target frames: 95
- Lane-threat frames: 42
- Observed collision geometry: no
- Best contact score: 174.04 at t=18.743
- Diagnosis: sampled replay path stayed well outside collision bounds


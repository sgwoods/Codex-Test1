# Aurora Stage 4 Pressure Geometry

Generated: `2026-05-06T21:17:56.493Z`

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
- Lane-threat frames: 166
- Observed collision geometry: no
- Best contact score: 4.65 at t=14.15
- Diagnosis: sampled replay kept the threat close but outside collision bounds

### stage4-five-ships-but-lane2
- Samples: 86
- Expected-target frames: 86
- Lane-threat frames: 40
- Observed collision geometry: no
- Best contact score: 19.12 at t=16.033
- Diagnosis: sampled replay path stayed well outside collision bounds

### stage4-five-ships-boss-lane6
- Samples: 95
- Expected-target frames: 95
- Lane-threat frames: 74
- Observed collision geometry: no
- Best contact score: 33.14 at t=17.667
- Diagnosis: sampled replay path stayed well outside collision bounds


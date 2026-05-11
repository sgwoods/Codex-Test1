# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:07:50.760Z`
Commit: `38bcac0`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift.

## Success Measure

A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS gap, and keep active duration within 0.08s of the reference.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `thin-bright-square-top`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 3

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | ZCR Gap | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Current Aurora baseline | 3.17 | centroid | 0.06s | 774.9 Hz | 244.3 | 0.1039 | 3x, risk sd 0 | baseline |
| Thin bright square top | 3.29 | centroid | 0.047s | 708 Hz | 271.9 | 0.1334 | 3x, risk sd 0.284 | risk improvement -0.12 < 0.25; RMS worsened by 0.0295 |
| Grid triangle step 0.055 volume 0.005 tone 0.00085/0.21 | 3.38 | centroid | 0.087s | 755.3 Hz | 693.6 | 0.0842 | 3x, risk sd 0.441 | duration gap 0.087s > 0.08s; risk improvement -0.21 < 0.25 |
| Grid sine step 0.049 volume 0.005 tone 0.00145/0.21 | 3.54 | centroid | 0.08s | 860.7 Hz | 1362.7 | 0.0047 | 3x, risk sd 0.114 | risk improvement -0.37 < 0.25; centroid did not improve (-85.8 Hz) |
| Grid triangle step 0.051 volume 0.0046 tone 0.00145/0.21 | 3.62 | centroid | 0.05s | 889.8 Hz | 1404.6 | 0.0044 | 3x, risk sd 0.109 | risk improvement -0.45 < 0.25; centroid did not improve (-114.9 Hz) |
| Grid triangle step 0.055 volume 0.0046 tone 0.00105/0.21 | 3.66 | centroid | 0.05s | 831 Hz | 1440.2 | 0.021 | 3x, risk sd 0.041 | risk improvement -0.49 < 0.25; centroid did not improve (-56.1 Hz) |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

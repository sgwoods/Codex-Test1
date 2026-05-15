# Aurora Rescue Join Audio Candidate Analysis

Generated: 2026-05-15T20:23:30.858Z
Commit: c8c7246f (dirty)
Repetitions per candidate: 3
Capture preroll: 80ms

## Problem

Rescue Join is semantically correct but its tail remains a high segment risk, weakening the reward moment after saving a captured fighter.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s2399-d180-v86`
- Measured best: `refclip-s2399-d180-v86`
- Reason: Rescue Join candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Composite | Cadence | Masking | Duration Gap | Band Gap | Stability | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Rescue Join reference 2.399s/0.18s v0.86 | 0.48 | onset 0.77 | n/a | n/a | n/a | 0s | 0.0228 | 3x, risk sd 0 | clears keeper gates |
| Current Aurora baseline | 3.14 | onset 4.5 | n/a | n/a | n/a | 0.1767s | 0.2383 | 3x, risk sd 0.021 | baseline |

## Next Step

Promote refclip-s2399-d180-v86 for Rescue Join, then rerun the full audio comparison and event-gap rollup.

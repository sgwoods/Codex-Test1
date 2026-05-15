# Aurora Challenge Perfect Audio Candidate Analysis

Generated: 2026-05-15T21:30:47.214Z
Commit: eb6d951f (dirty)
Repetitions per candidate: 3
Capture preroll: 80ms

## Problem

Challenge Perfect is the highest current segment-level audio gap: the cue is semantically correct and celebratory, but the measured onset is too peaky, too high-crossing, and too collapsed versus the Galaga perfect-clear reference phrase.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `perfect-measured-onset-quiet-ceremony-tail`
- Reason: No Challenge Perfect candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Composite | Cadence | Masking | Duration Gap | Band Gap | Stability | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Perfect measured onset with quiet ceremony tail | 2.96 | onset 4.17 | n/a | n/a | n/a | 0.1273s | 0.2534 | 3x, risk sd 0.213 | segment risk improved only -0.12; duration gap improved only 0.023s |
| Perfect measured onset with soft ceremony tail | 3.03 | onset 4.41 | n/a | n/a | n/a | 0.14s | 0.2526 | 3x, risk sd 0.012 | whole-cue risk improved only 0.22; segment risk improved only -0.36; duration gap improved only 0.01s |
| Perfect measured onset with air tail | 3.19 | onset 4.16 | n/a | n/a | n/a | 0.1267s | 0.2622 | 3x, risk sd 0.061 | whole-cue risk improved only 0.06; segment risk improved only -0.11; duration gap improved only 0.023s |
| Current Aurora baseline | 3.25 | onset 4.05 | n/a | n/a | n/a | 0.15s | 0.2665 | 3x, risk sd 0.024 | baseline |

## Next Step

Do not promote Challenge Perfect yet; use the measured best candidate to refine the generator or scoring gates.

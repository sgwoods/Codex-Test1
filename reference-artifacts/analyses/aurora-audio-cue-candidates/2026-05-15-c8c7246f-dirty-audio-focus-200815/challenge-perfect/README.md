# Aurora Challenge Perfect Audio Candidate Analysis

Generated: 2026-05-15T20:08:15.525Z
Commit: c8c7246f (dirty)
Repetitions per candidate: 3
Capture preroll: 80ms

## Problem

Challenge Perfect is the highest current segment-level audio gap: the cue is semantically correct and celebratory, but the measured onset is too peaky, too high-crossing, and too collapsed versus the Galaga perfect-clear reference phrase.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `perfect-bright-onset-quiet-ceremony-tail`
- Reason: No Challenge Perfect candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Composite | Cadence | Masking | Duration Gap | Band Gap | Stability | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Perfect bright onset with quiet ceremony tail | 3.16 | onset 4.39 | n/a | n/a | n/a | 0.14s | 0.2551 | 3x, risk sd 0.029 | whole-cue risk improved only 0.05; segment risk improved only -0.17; duration gap improved only 0.013s |
| Perfect onset/body with soft tail | 3.19 | onset 4.49 | n/a | n/a | n/a | 0.14s | 0.2479 | 3x, risk sd 0.042 | whole-cue risk improved only 0.02; segment risk improved only -0.27; duration gap improved only 0.013s |
| Perfect onset/body with ceremony tail | 3.2 | onset 4.28 | n/a | n/a | n/a | 0.14s | 0.2403 | 3x, risk sd 0.07 | whole-cue risk improved only 0.01; segment risk improved only -0.06; duration gap improved only 0.013s |
| Current Aurora baseline | 3.21 | onset 4.22 | n/a | n/a | n/a | 0.1533s | 0.2662 | 3x, risk sd 0.052 | baseline |

## Next Step

Do not promote Challenge Perfect yet; use the measured best candidate to refine the generator or scoring gates.

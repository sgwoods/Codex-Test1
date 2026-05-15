# Aurora Challenge Perfect Audio Candidate Analysis

Generated: 2026-05-15T21:31:49.256Z
Commit: eb6d951f (dirty)
Repetitions per candidate: 3
Capture preroll: 80ms

## Problem

Challenge Perfect is the highest current segment-level audio gap: the cue is semantically correct and celebratory, but the measured onset is too peaky, too high-crossing, and too collapsed versus the Galaga perfect-clear reference phrase.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `perfect-clean-onset-whisper-tail`
- Reason: No Challenge Perfect candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Composite | Cadence | Masking | Duration Gap | Band Gap | Stability | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Perfect clean onset with whisper tail | 3.17 | onset 4.13 | n/a | n/a | n/a | 0.1407s | 0.2634 | 3x, risk sd 0.029 | whole-cue risk improved only 0.08; segment risk improved only 0.11; duration gap improved only 0.016s |
| Perfect clean onset with soft tail | 3.18 | onset 4.1 | n/a | n/a | n/a | 0.1467s | 0.2641 | 3x, risk sd 0.033 | whole-cue risk improved only 0.07; segment risk improved only 0.14; duration gap improved only 0.01s |
| Current Aurora baseline | 3.25 | onset 4.24 | n/a | n/a | n/a | 0.1567s | 0.2643 | 3x, risk sd 0.022 | baseline |
| Perfect clean onset scheduled pad | 3.27 | onset 4.17 | n/a | n/a | n/a | 0.1467s | 0.2669 | 3x, risk sd 0.025 | whole-cue risk improved only -0.02; segment risk improved only 0.07; duration gap improved only 0.01s |

## Next Step

Do not promote Challenge Perfect yet; use the measured best candidate to refine the generator or scoring gates.

# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:28:44.341Z`
Commit: `17ce604`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift. The comparison now includes spectral band-shape, rolloff, and envelope segmentation so future searches can target timbre instead of only duration and centroid.

## Success Measure

A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS or band-shape gap, and keep active duration within 0.08s of the reference.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `thin-bright-triangle`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 3

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright triangle ladder | 4.56 | centroid | 0.037s | 689.8 Hz | 0.1356 | 0.356 | 0.1317 | 3x, risk sd 0.278 | RMS worsened by 0.0257 |
| Current Aurora baseline | 4.87 | centroid | 0.06s | 896.1 Hz | 0.1544 | 0.359 | 0.106 | 3x, risk sd 0 | baseline |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:19:24.878Z`
Commit: `f46b630`

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
- Measured best: `thin-bright-square-balanced-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Staccato bright | 4.15 | centroid | 0.18s | 753 Hz | 0.1334 | 0.116 | 0.1116 | 1x, risk sd 0 | duration gap 0.18s > 0.08s |
| Current Aurora baseline | 4.79 | centroid | 0.06s | 858.8 Hz | 0.1482 | 0.393 | 0.1067 | 1x, risk sd 0 | baseline |
| Thin bright square balanced held | 4.85 | centroid | 0s | 855.3 Hz | 0.1368 | 0.379 | 0.1162 | 1x, risk sd 0 | risk improvement -0.06 < 0.25 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

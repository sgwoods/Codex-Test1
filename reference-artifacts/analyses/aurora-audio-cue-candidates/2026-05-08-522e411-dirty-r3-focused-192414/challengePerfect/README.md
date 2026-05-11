# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:24:14.804Z`
Commit: `522e411`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift. The comparison now includes spectral band-shape, rolloff, envelope segmentation, and optional tone high-pass shaping so future searches can target measured timbre instead of only duration and centroid.

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
| Current Aurora baseline | 4.37 | centroid | 0.06s | 804 Hz | 0.1326 | 0.136 | 0.1053 | 3x, risk sd 0 | baseline |
| Thin bright triangle ladder | 4.7 | centroid | 0.07s | 681.1 Hz | 0.1426 | 0.406 | 0.1366 | 3x, risk sd 0.241 | risk improvement -0.33 < 0.25; RMS worsened by 0.0313 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

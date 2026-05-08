# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T17:35:26.198Z`
Commit: `7342ecb`

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
- Measured best: `thin-bright-square-quiet-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 3

## Candidates

| Candidate | Risk /10 | Duration Gap | Centroid Gap | ZCR Gap | RMS Gap | Stability |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Thin bright square quiet held | 3.28 | 0.057s | 689.9 Hz | 272.9 | 0.1356 | 3x, risk sd 0.26 |
| Thin bright square micro held | 3.51 | 0.127s | 818.3 Hz | 696.2 | 0.0819 | 3x, risk sd 0.363 |
| Thin bright square quiet tail | 3.57 | 0.037s | 791 Hz | 1435.6 | 0.0208 | 3x, risk sd 0.156 |
| Current Aurora baseline | 3.57 | 0.06s | 916.4 Hz | 325.2 | 0.1077 | 3x, risk sd 0 |
| Sparkle low RMS | 3.6 | 0.08s | 881 Hz | 1362.2 | 0.0071 | 3x, risk sd 0.185 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

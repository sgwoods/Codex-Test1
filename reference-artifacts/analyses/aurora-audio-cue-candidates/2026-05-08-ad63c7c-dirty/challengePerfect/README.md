# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T17:44:25.274Z`
Commit: `ad63c7c`

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
| Thin bright square quiet held | 3.33 | 0.077s | 700.9 Hz | 268.1 | 0.1392 | 3x, risk sd 0.226 |
| Thin bright square quiet tail | 3.46 | 0.023s | 808.8 Hz | 1388.6 | 0.0086 | 3x, risk sd 0.118 |
| Thin bright square balanced held | 3.48 | 0.133s | 792.1 Hz | 712.7 | 0.0832 | 3x, risk sd 0.391 |
| Current Aurora baseline | 3.51 | 0.06s | 903.4 Hz | 289.5 | 0.1071 | 3x, risk sd 0 |
| Thin bright square soft attack held | 3.55 | 0.024s | 854.5 Hz | 1381.9 | 0.0086 | 3x, risk sd 0.151 |
| Thin bright square split low held | 3.58 | 0.047s | 826.4 Hz | 1451.6 | 0.011 | 3x, risk sd 0.141 |
| Thin bright square micro held | 3.59 | 0.024s | 868.5 Hz | 1425.1 | 0.005 | 3x, risk sd 0.085 |
| Thin bright square long low held | 3.59 | 0.04s | 804.9 Hz | 1403.9 | 0.0232 | 3x, risk sd 0.14 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

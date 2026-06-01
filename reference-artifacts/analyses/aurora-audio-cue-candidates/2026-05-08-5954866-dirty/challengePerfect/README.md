# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T17:29:29.051Z`
Commit: `5954866`

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
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.

## Candidates

| Candidate | Risk /10 | Duration Gap | Centroid Gap | ZCR Gap | RMS Gap |
| --- | ---: | ---: | ---: | ---: | ---: |
| Thin bright square quiet held | 2.98 | 0.06s | 684.4 Hz | 23.5 | 0.1274 |
| Thin bright square quiet tail | 3.12 | 0.3s | 715.2 Hz | 682 | 0.0547 |
| Thin bright square held | 3.19 | 0s | 689.5 Hz | 129.2 | 0.1427 |
| Thin bright square top | 3.19 | 0.161s | 778.9 Hz | 111.9 | 0.1143 |
| Thin bright triangle ladder | 3.37 | 0s | 785.9 Hz | 354.1 | 0.1159 |
| Low RMS harmonic | 3.41 | 0s | 777 Hz | 1472.9 | 0.0015 |
| Thin bright square soft held | 3.41 | 0.031s | 754 Hz | 321.5 | 0.1316 |
| Thin bright square micro held | 3.42 | 0.11s | 793.3 Hz | 177 | 0.1348 |
| Current Aurora baseline | 3.47 | 0.06s | 885.5 Hz | 308.6 | 0.1049 |
| Sparkle low RMS | 3.49 | 0.06s | 775.4 Hz | 1349.1 | 0.0233 |
| Octave chime thin | 3.49 | 0.2s | 756.5 Hz | 1468.1 | 0.0097 |
| Sparkle short tail | 3.5 | 0.06s | 824.6 Hz | 1432.4 | 0.0026 |
| Staccato bright | 3.53 | 0.06s | 787 Hz | 1339.5 | 0.0257 |
| Sparkle with light noise | 3.62 | 0.06s | 807.2 Hz | 1396.7 | 0.0257 |
| Sparkle low RMS square edge | 3.66 | 0.06s | 899.9 Hz | 1391.9 | 0.0078 |
| Low RMS square edge | 3.68 | 0.15s | 882.4 Hz | 1475.1 | 0.002 |
| Low RMS brighter | 3.72 | 0.06s | 904 Hz | 1413.3 | 0.0109 |
| Sparkle low RMS centered ZCR | 3.74 | 0.101s | 879.6 Hz | 1439.1 | 0.0154 |
| High square stair | 3.95 | 0.131s | 887.8 Hz | 1495.1 | 0.0322 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

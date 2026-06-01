# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T13:05:36.258Z`
Commit: `dfb47de`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift.

## Success Measure

A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS gap, and keep active duration within 0.08s of the reference.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `sparkle-noise-light`
- Reason: The best candidate did not clear the minimum risk and centroid improvement gate.

## Candidates

| Candidate | Risk /10 | Duration Gap | Centroid Gap | ZCR Gap | RMS Gap |
| --- | ---: | ---: | ---: | ---: | ---: |
| Staccato bright | 2.74 | 0.21s | 427.3 Hz | 321.2 | 0.1257 |
| Thin bright square top | 2.85 | 0.141s | 624.2 Hz | 126 | 0.1123 |
| Sparkle with light noise | 2.95 | 0.06s | 690.4 Hz | 50.9 | 0.1196 |
| High square stair | 3.06 | 0.1s | 620.9 Hz | 126.9 | 0.1403 |
| Low RMS harmonic | 3.16 | 0.051s | 752.8 Hz | 322.4 | 0.1004 |
| Current Aurora baseline | 3.28 | 0.06s | 809.1 Hz | 263.3 | 0.1058 |
| Thin bright triangle ladder | 3.31 | 0s | 744 Hz | 383.3 | 0.1158 |
| Octave chime thin | 4.01 | 0.13s | 850.8 Hz | 540.3 | 0.1525 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

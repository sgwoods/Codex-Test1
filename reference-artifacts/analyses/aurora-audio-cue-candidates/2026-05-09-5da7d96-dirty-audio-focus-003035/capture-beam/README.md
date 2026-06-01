# Aurora Capture Beam Audio Candidate Analysis

Generated: 2026-05-09T00:30:35.802Z
Commit: 5da7d96 (dirty)

## Problem

Capture Beam is the highest runtime whole-cue audio gap after capture-lifecycle promotion: the danger cue is semantically correct, but its captured active window is too short and too spectrally distant from the tractor-beam reference.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s3500-d480-v74`
- Measured best: `refclip-s2900-d480-v105`
- Reason: Capture Beam candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Capture Beam reference 2.9s/0.48s v1.05 | 1.63 | onset 2.13 | 0.32s | 50.2Hz | 0.0993 | duration gap improved only -0.172s |
| Capture Beam reference 3.04s/0.48s v1.16 | 1.95 | onset 1.99 | 0.321s | 23Hz | 0.096 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.4s v1.05 | 2.04 | onset 1.84 | 0.321s | 46.1Hz | 0.0979 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.48s v1.05 | 2.06 | onset 2.04 | 0.321s | 27.6Hz | 0.1041 | duration gap improved only -0.173s |
| Capture Beam reference 2.9s/0.48s v1.16 | 2.1 | onset 2.91 | 0.321s | 27.8Hz | 0.0992 | duration gap improved only -0.173s |
| Capture Beam reference 2.9s/0.48s v0.74 | 2.36 | onset 3.07 | 0.211s | 91.9Hz | 0.1314 | duration gap improved only -0.063s |
| Tractor long danger | 2.62 | onset 2.15 | 0.381s | 20.3Hz | 0.1033 | duration gap improved only -0.233s |
| Capture Beam reference 3.199s/0.32s v1.16 | 2.69 | onset 0.55 | 0.321s | 36.7Hz | 0.1256 | duration gap improved only -0.173s |
| Capture Beam reference 3.199s/0.4s v1.05 | 2.71 | onset 0.55 | 0.321s | 21Hz | 0.1259 | duration gap improved only -0.173s |
| Capture Beam reference 3.199s/0.6s v1.16 | 2.75 | onset 0.58 | 0.321s | 37.3Hz | 0.1323 | duration gap improved only -0.173s |
| Capture Beam reference 2.9s/0.48s v0.95 | 2.8 | onset 2.97 | 0.321s | 53.9Hz | 0.1084 | duration gap improved only -0.173s |
| Capture Beam reference 3.199s/0.4s v0.74 | 2.81 | onset 3.35 | 0.321s | 102.2Hz | 0.1459 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.4s v1.16 | 2.86 | onset 1.87 | 0.321s | 45Hz | 0.1051 | duration gap improved only -0.173s |
| Capture Beam reference 3.34s/0.48s v0.62 | 2.91 | onset 2.65 | 0.3s | 106.8Hz | 0.0865 | duration gap improved only -0.152s |
| Capture Beam reference 3.199s/0.32s v0.86 | 2.94 | onset 3.75 | 0.321s | 115.7Hz | 0.1392 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.48s v0.86 | 2.95 | onset 3.15 | 0.321s | 73.9Hz | 0.1166 | duration gap improved only -0.173s |
| Capture Beam reference 2.9s/0.48s v0.86 | 3 | onset 2.42 | 0.321s | 25.5Hz | 0.1185 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.4s v0.95 | 3.01 | onset 1.86 | 0.321s | 30.5Hz | 0.1044 | duration gap improved only -0.173s |
| Capture Beam reference 3.199s/0.6s v0.95 | 3.01 | onset 3.34 | 0.321s | 76.2Hz | 0.1388 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.48s v0.95 | 3.04 | onset 2.27 | 0.321s | 63.4Hz | 0.1147 | duration gap improved only -0.173s |
| Capture Beam reference 3.199s/0.48s v1.05 | 3.09 | onset 1.42 | 0.321s | 28Hz | 0.1317 | duration gap improved only -0.173s |
| Capture Beam reference 3.199s/0.32s v0.62 | 3.12 | onset 3.8 | 0.321s | 129Hz | 0.1652 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.6s v0.95 | 3.14 | onset 2.12 | 0.321s | 70.4Hz | 0.1153 | duration gap improved only -0.173s |
| Capture Beam reference 3.04s/0.6s v0.86 | 3.19 | onset 2.32 | 0.321s | 40.9Hz | 0.1249 | duration gap improved only -0.173s |

## Next Step

Promote refclip-s3500-d480-v74 for Capture Beam, then rerun the full audio comparison and event-gap rollup.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

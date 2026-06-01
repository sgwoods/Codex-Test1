# Aurora Formation Pulse Audio Candidate Analysis

Generated: 2026-05-08T22:43:24.758Z
Commit: 63f90a0 (dirty)

## Problem

Formation Pulse has the highest segment-level onset risk: the current classic pulse is a bright synthetic stab while the Galaga cadence reference has more low-frequency body and softer attack.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s660-d240-v105`
- Measured best: `refclip-s660-d240-v105`
- Reason: Formation Pulse candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Formation Pulse reference 0.66s/0.24s v1.05 | 2.55 | onset 2.73 | 0.139s | 204.4Hz | 0.0954 | clears keeper gates |
| Formation Pulse reference 0.6s/0.24s v1.05 | 3.38 | onset 2.43 | 0.45s | 591.9Hz | 0.2497 | duration gap improved only -0.441s |
| Formation Pulse reference 0.6s/0.2s v1.05 | 3.5 | onset 2.34 | 0.45s | 636.6Hz | 0.2598 | duration gap improved only -0.441s |
| Formation Pulse reference 0.66s/0.24s v0.95 | 3.54 | onset 2.56 | 0.45s | 595.1Hz | 0.2571 | duration gap improved only -0.441s |
| Formation Pulse reference 0.6s/0.3s v0.95 | 3.72 | onset 1.53 | 0.45s | 698Hz | 0.2619 | duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.54s/0.24s v0.95 | 3.79 | onset 7.12 | 0.45s | 636.4Hz | 0.2629 | segment risk improved only -1.04; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.2s v0.95 | 3.84 | onset 7.12 | 0.45s | 651Hz | 0.2699 | segment risk improved only -1.04; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.24s v0.95 | 3.85 | onset 7.23 | 0.45s | 624.2Hz | 0.2734 | segment risk improved only -1.15; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.2s v0.86 | 4.1 | onset 7.08 | 0.45s | 636.6Hz | 0.307 | segment risk improved only -1; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Low soft march | 4.12 | onset 5.37 | 0.45s | 631.8Hz | 0.2676 | duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Current Aurora baseline | 4.86 | onset 6.08 | 0.009s | 684.9Hz | 0.3067 | baseline |
| Formation Pulse reference 0.66s/0.24s v0.74 | 4.9 | onset 6.58 | 0.039s | 795.2Hz | 0.3336 | whole-cue risk improved only -0.04; segment risk improved only -0.5 |
| Formation Pulse reference 0.6s/0.24s v0.86 | 4.99 | onset 6.87 | 0.001s | 768.8Hz | 0.3519 | whole-cue risk improved only -0.13; segment risk improved only -0.79 |
| Formation Pulse reference 0.54s/0.24s v0.74 | 5.02 | onset 6.97 | 0.081s | 727.5Hz | 0.3768 | whole-cue risk improved only -0.16; segment risk improved only -0.89; band shape worsened by 0.0701 |
| Formation Pulse reference 0.66s/0.24s v0.86 | 5.02 | onset 7.13 | 0.029s | 816.1Hz | 0.3323 | whole-cue risk improved only -0.16; segment risk improved only -1.05; centroid worsened by 131.2 Hz |
| Formation Pulse reference 0.6s/0.2s v0.62 | 5.03 | onset 6.49 | 0.029s | 807.6Hz | 0.3286 | whole-cue risk improved only -0.17; segment risk improved only -0.41; centroid worsened by 122.7 Hz |
| Formation Pulse reference 0.54s/0.24s v0.62 | 5.03 | onset 6.49 | 0.029s | 807.6Hz | 0.3286 | whole-cue risk improved only -0.17; segment risk improved only -0.41; centroid worsened by 122.7 Hz |
| Formation Pulse reference 0.6s/0.24s v0.62 | 5.06 | onset 7.15 | 0.019s | 789.4Hz | 0.3422 | whole-cue risk improved only -0.2; segment risk improved only -1.07 |
| Formation Pulse reference 0.6s/0.3s v0.74 | 5.07 | onset 7.17 | 0.019s | 783.7Hz | 0.3337 | whole-cue risk improved only -0.21; segment risk improved only -1.09 |
| Formation Pulse reference 0.6s/0.3s v1.05 | 5.07 | onset 7.17 | 0.019s | 783.7Hz | 0.3337 | whole-cue risk improved only -0.21; segment risk improved only -1.09 |
| Formation Pulse reference 0.54s/0.24s v1.05 | 5.1 | onset 7.14 | 0.009s | 772.8Hz | 0.3466 | whole-cue risk improved only -0.24; segment risk improved only -1.06 |
| Formation Pulse reference 0.6s/0.24s v0.74 | 5.14 | onset 7.22 | 0.019s | 786.2Hz | 0.3392 | whole-cue risk improved only -0.28; segment risk improved only -1.14 |
| Formation Pulse reference 0.54s/0.24s v0.86 | 5.14 | onset 7.22 | 0.019s | 786.2Hz | 0.3392 | whole-cue risk improved only -0.28; segment risk improved only -1.14 |
| Formation Pulse reference 0.6s/0.2s v0.74 | 5.14 | onset 7.22 | 0.019s | 788Hz | 0.3391 | whole-cue risk improved only -0.28; segment risk improved only -1.14 |

## Next Step

Promote refclip-s660-d240-v105 for Formation Pulse, then rerun the full audio comparison and event-gap rollup.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

# Aurora Rescue Join Audio Candidate Analysis

Generated: 2026-05-09T00:24:15.006Z
Commit: 5da7d96 (dirty)

## Problem

Rescue Join is semantically correct but its tail remains a high segment risk, weakening the reward moment after saving a captured fighter.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s2320-d360-v74`
- Measured best: `refclip-s2399-d440-v86`
- Reason: Rescue Join candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Rescue Join reference 2.399s/0.44s v0.86 | 1.22 | tail 2.33 | 0.189s | 81.8Hz | 0.0444 | duration gap improved only -0.03s |
| Rescue Join reference 2.32s/0.3s v0.86 | 3.15 | body 5.38 | 0.14s | 433.7Hz | 0.2156 | duration gap improved only 0.019s |
| Rescue Join reference 2.32s/0.36s v1.05 | 3.38 | onset 5.38 | 0.14s | 419.1Hz | 0.2156 | duration gap improved only 0.019s |
| Rescue Join reference 2.48s/0.3s v0.95 | 3.49 | body 6.1 | 0.14s | 449.4Hz | 0.2182 | segment risk improved only 0.22; duration gap improved only 0.019s |
| Rescue Join reference 2.32s/0.36s v0.62 | 3.55 | body 5.87 | 0.18s | 459.8Hz | 0.221 | duration gap improved only -0.021s |
| Rescue Join reference 2.399s/0.36s v0.95 | 3.6 | body 5.66 | 0.19s | 466Hz | 0.2168 | duration gap improved only -0.031s |
| Rescue Join reference 2.399s/0.44s v1.16 | 3.6 | body 5.68 | 0.19s | 450.6Hz | 0.2064 | duration gap improved only -0.031s |
| Rescue Join reference 2.399s/0.24s v0.95 | 3.64 | body 6.18 | 0.18s | 455.7Hz | 0.2172 | segment risk improved only 0.14; duration gap improved only -0.021s |
| Rescue Join reference 2.399s/0.3s v0.62 | 3.77 | body 5.77 | 0.101s | 483.1Hz | 0.2225 | duration gap improved only 0.058s |
| Rescue Join reference 2.32s/0.3s v0.95 | 3.91 | tail 6.5 | 0.18s | 495.8Hz | 0.2215 | segment risk improved only -0.18; duration gap improved only -0.021s |
| Rescue Join reference 2.399s/0.44s v0.74 | 3.96 | tail 6.44 | 0.3s | 338.8Hz | 0.1862 | segment risk improved only -0.12; duration gap improved only -0.141s |
| Rescue Join reference 2.32s/0.36s v1.16 | 4.04 | tail 6.2 | 0.3s | 330.4Hz | 0.1811 | segment risk improved only 0.12; duration gap improved only -0.141s |
| Rescue Join reference 2.32s/0.36s v0.74 | 4.05 | tail 5.41 | 0.059s | 437.4Hz | 0.2314 | clears keeper gates |
| Rescue Join reference 2.399s/0.24s v0.86 | 4.18 | tail 6.64 | 0.159s | 475Hz | 0.245 | segment risk improved only -0.32; duration gap improved only 0s |
| Rescue Join reference 2.32s/0.36s v0.95 | 4.44 | tail 6.24 | 0.159s | 486.4Hz | 0.2492 | segment risk improved only 0.08; duration gap improved only 0s |
| Rescue Join reference 2.399s/0.3s v1.16 | 4.44 | tail 6.24 | 0.159s | 486.3Hz | 0.2492 | segment risk improved only 0.08; duration gap improved only 0s |
| Rescue Join reference 2.399s/0.44s v0.95 | 4.53 | tail 6.21 | 0.119s | 441.3Hz | 0.2151 | whole-cue risk improved only 0.23; segment risk improved only 0.11; duration gap improved only 0.04s |
| Rescue Join reference 2.48s/0.36s v1.16 | 4.56 | tail 5.63 | 0.149s | 454.8Hz | 0.2381 | whole-cue risk improved only 0.2; duration gap improved only 0.01s |
| Rescue Join reference 2.399s/0.36s v0.62 | 4.56 | tail 6.63 | 0.179s | 518.4Hz | 0.2511 | whole-cue risk improved only 0.2; segment risk improved only -0.31; duration gap improved only -0.02s |
| Rescue Join reference 2.399s/0.3s v0.95 | 4.59 | tail 6.74 | 0.169s | 484Hz | 0.2469 | whole-cue risk improved only 0.17; segment risk improved only -0.42; duration gap improved only -0.01s |
| Rescue Join reference 2.48s/0.36s v0.95 | 4.65 | tail 6.27 | 0.189s | 475.7Hz | 0.2533 | whole-cue risk improved only 0.11; segment risk improved only 0.05; duration gap improved only -0.03s |
| Rescue Join reference 2.399s/0.36s v1.05 | 4.65 | tail 6.29 | 0.189s | 475.6Hz | 0.2533 | whole-cue risk improved only 0.11; segment risk improved only 0.03; duration gap improved only -0.03s |
| Rescue Join reference 2.399s/0.36s v0.74 | 4.71 | tail 6.32 | 0.159s | 485.4Hz | 0.2456 | whole-cue risk improved only 0.05; segment risk improved only 0; duration gap improved only 0s |
| Rescue Join reference 2.399s/0.44s v1.05 | 4.72 | tail 6.15 | 0.119s | 531.4Hz | 0.218 | whole-cue risk improved only 0.04; segment risk improved only 0.17; duration gap improved only 0.04s |

## Next Step

Promote refclip-s2320-d360-v74 for Rescue Join, then rerun the full audio comparison and event-gap rollup.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

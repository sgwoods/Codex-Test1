# Aurora Rescue Join Audio Candidate Analysis

Generated: 2026-05-09T00:30:35.802Z
Commit: 5da7d96 (dirty)

## Problem

Rescue Join is semantically correct but its tail remains a high segment risk, weakening the reward moment after saving a captured fighter.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s2399-d440-v86`
- Reason: No Rescue Join candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Rescue Join reference 2.399s/0.44s v0.86 | 1.81 | tail 2.31 | 0.179s | 109.5Hz | 0.0273 | duration gap improved only -0.14s |
| Rescue Join reference 2.32s/0.3s v0.86 | 3.1 | body 5.94 | 0.15s | 424.9Hz | 0.2082 | segment risk improved only -0.48; duration gap improved only -0.111s |
| Rescue Join reference 2.32s/0.36s v1.05 | 3.16 | tail 5.56 | 0.15s | 409.5Hz | 0.2069 | segment risk improved only -0.1; duration gap improved only -0.111s |
| Rescue Join reference 2.48s/0.3s v0.95 | 3.4 | tail 5.44 | 0.18s | 465.4Hz | 0.212 | segment risk improved only 0.02; duration gap improved only -0.141s |
| Current Aurora baseline | 3.82 | tail 5.46 | 0.039s | 431.6Hz | 0.2244 | baseline |
| Rescue Join reference 2.399s/0.3s v0.62 | 3.88 | tail 6.31 | 0.13s | 492.3Hz | 0.2208 | whole-cue risk improved only -0.06; segment risk improved only -0.85; duration gap improved only -0.091s |
| Rescue Join reference 2.32s/0.36s v0.74 | 3.93 | tail 5.77 | 0.049s | 432.8Hz | 0.2289 | whole-cue risk improved only -0.11; segment risk improved only -0.31 |
| Rescue Join reference 2.58s/0.36s v0.62 | 3.97 | tail 5.6 | 0.049s | 430.1Hz | 0.227 | whole-cue risk improved only -0.15; segment risk improved only -0.14 |
| Rescue Join reference 2.58s/0.36s v0.74 | 4.28 | tail 6.5 | 0.159s | 488.7Hz | 0.253 | whole-cue risk improved only -0.46; segment risk improved only -1.04; duration gap improved only -0.12s |
| Rescue Join reference 2.58s/0.36s v1.05 | 4.28 | tail 6.5 | 0.159s | 488.2Hz | 0.2529 | whole-cue risk improved only -0.46; segment risk improved only -1.04; duration gap improved only -0.12s |
| Rescue Join reference 2.32s/0.44s v0.95 | 4.32 | tail 5.46 | 0.099s | 443Hz | 0.225 | whole-cue risk improved only -0.5; segment risk improved only 0 |
| Rescue Join reference 2.399s/0.24s v0.95 | 4.39 | tail 5.23 | 0.149s | 468.4Hz | 0.2385 | whole-cue risk improved only -0.57; segment risk improved only 0.23; duration gap improved only -0.11s |
| Rescue Join reference 2.399s/0.44s v1.05 | 4.39 | tail 5.54 | 0.109s | 433.8Hz | 0.2265 | whole-cue risk improved only -0.57; segment risk improved only -0.08; duration gap improved only -0.07s |
| Rescue Join reference 2.399s/0.36s v0.74 | 4.44 | tail 6.24 | 0.159s | 486.2Hz | 0.2492 | whole-cue risk improved only -0.62; segment risk improved only -0.78; duration gap improved only -0.12s |
| Rescue Join reference 2.48s/0.44s v0.74 | 4.53 | tail 6.52 | 0.169s | 492.6Hz | 0.2525 | whole-cue risk improved only -0.71; segment risk improved only -1.06; duration gap improved only -0.13s |
| Rescue Join reference 2.58s/0.36s v0.86 | 4.57 | tail 6.63 | 0.179s | 518.2Hz | 0.2511 | whole-cue risk improved only -0.75; segment risk improved only -1.17; duration gap improved only -0.14s |
| Rescue Join reference 2.48s/0.44s v0.86 | 4.57 | tail 6.74 | 0.169s | 484.3Hz | 0.2468 | whole-cue risk improved only -0.75; segment risk improved only -1.28; duration gap improved only -0.13s |
| Rescue Join reference 2.32s/0.3s v0.95 | 4.59 | tail 6.07 | 0.119s | 471.2Hz | 0.2287 | whole-cue risk improved only -0.77; segment risk improved only -0.61; duration gap improved only -0.08s |
| Rescue Join reference 2.32s/0.3s v1.16 | 4.59 | tail 6.74 | 0.169s | 484Hz | 0.2469 | whole-cue risk improved only -0.77; segment risk improved only -1.28; duration gap improved only -0.13s |
| Rescue Join reference 2.48s/0.3s v0.62 | 4.6 | tail 6.2 | 0.109s | 502.1Hz | 0.2275 | whole-cue risk improved only -0.78; segment risk improved only -0.74; duration gap improved only -0.07s |
| Rescue Join reference 2.399s/0.44s v1.16 | 4.61 | tail 6.68 | 0.179s | 471.5Hz | 0.2537 | whole-cue risk improved only -0.79; segment risk improved only -1.22; duration gap improved only -0.14s |
| Rescue Join reference 2.399s/0.36s v0.86 | 4.61 | tail 6.74 | 0.169s | 485.1Hz | 0.2471 | whole-cue risk improved only -0.79; segment risk improved only -1.28; duration gap improved only -0.13s |
| Rescue Join reference 2.32s/0.3s v0.74 | 4.66 | tail 6.19 | 0.159s | 476Hz | 0.2438 | whole-cue risk improved only -0.84; segment risk improved only -0.73; duration gap improved only -0.12s |
| Rescue Join reference 2.48s/0.44s v1.16 | 4.66 | tail 6.3 | 0.179s | 499.9Hz | 0.2505 | whole-cue risk improved only -0.84; segment risk improved only -0.84; duration gap improved only -0.14s |

## Next Step

Do not promote Rescue Join yet; use the measured best candidate to refine the generator or scoring gates.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

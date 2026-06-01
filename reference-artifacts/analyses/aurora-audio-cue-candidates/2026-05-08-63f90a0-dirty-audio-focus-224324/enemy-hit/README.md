# Aurora Enemy Hit Audio Candidate Analysis

Generated: 2026-05-08T22:43:24.758Z
Commit: 63f90a0 (dirty)

## Problem

Enemy Hit is the highest whole-cue audio risk: Aurora gives hit confirmation, but the measured cue is too long, too bright, and spectrally far from the Zako impact reference window.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s750-d200-v100`
- Measured best: `refclip-s750-d200-v100`
- Reason: Enemy Hit candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Enemy Hit reference 0.75s/0.2s v1 | 0.71 | onset 1.72 | 0.04s | 28.6Hz | 0.0128 | clears keeper gates |
| Enemy Hit reference 0.72s/0.24s v0.58 | 3.46 | onset 3.8 | 0.38s | 623.6Hz | 0.2333 | duration gap improved only -0.331s |
| Enemy Hit reference 0.75s/0.2s v0.94 | 3.67 | onset 4.8 | 0.42s | 570Hz | 0.21 | segment risk improved only 0.07; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v0.82 | 3.84 | onset 4.91 | 0.42s | 645.8Hz | 0.2186 | segment risk improved only -0.04; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.2s v0.7 | 4.1 | onset 4.76 | 0.42s | 652.5Hz | 0.2207 | segment risk improved only 0.11; duration gap improved only -0.371s; fewer exact segment-role matches than baseline |
| Short low-mid snap | 4.13 | onset 5.51 | 0.029s | 734.9Hz | 0.2994 | segment risk improved only -0.64 |
| Enemy Hit reference 0.75s/0.28s v1 | 4.22 | onset 2.07 | 0.42s | 473.4Hz | 0.1904 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v1 | 4.26 | onset 1.99 | 0.42s | 390.5Hz | 0.1805 | duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v1 | 4.32 | onset 1.46 | 0.42s | 403.6Hz | 0.1851 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.18s v0.82 | 4.32 | onset 2.07 | 0.42s | 457.5Hz | 0.2051 | duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.94 | 4.37 | onset 1.72 | 0.42s | 445.6Hz | 0.1953 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.28s v0.82 | 4.39 | onset 1.86 | 0.42s | 473Hz | 0.2063 | whole-cue risk improved only 0.28; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.2s v0.82 | 4.4 | onset 2.59 | 0.42s | 588.4Hz | 0.1952 | whole-cue risk improved only 0.27; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.28s v0.94 | 4.41 | onset 1.75 | 0.42s | 472.4Hz | 0.1922 | whole-cue risk improved only 0.26; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v0.94 | 4.47 | onset 1.56 | 0.42s | 458.6Hz | 0.1972 | whole-cue risk improved only 0.2; duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.82 | 4.49 | onset 2.68 | 0.42s | 514.7Hz | 0.2016 | whole-cue risk improved only 0.18; duration gap improved only -0.371s |
| Enemy Hit reference 0.79s/0.24s v0.94 | 4.52 | onset 2.14 | 0.42s | 470.7Hz | 0.2072 | whole-cue risk improved only 0.15; duration gap improved only -0.371s |
| Zako current guide window | 4.57 | onset 2.19 | 0.42s | 491.7Hz | 0.2123 | whole-cue risk improved only 0.1; duration gap improved only -0.371s |
| Enemy Hit reference 0.79s/0.24s v0.82 | 4.63 | onset 2.39 | 0.42s | 505.5Hz | 0.2204 | whole-cue risk improved only 0.04; duration gap improved only -0.371s |
| Enemy Hit reference 0.79s/0.24s v1 | 4.64 | onset 2.52 | 0.42s | 556.2Hz | 0.2059 | whole-cue risk improved only 0.03; duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.7 | 4.66 | onset 2.73 | 0.42s | 493.9Hz | 0.2248 | whole-cue risk improved only 0.01; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v0.7 | 4.67 | onset 2.25 | 0.42s | 503Hz | 0.2292 | whole-cue risk improved only 0; duration gap improved only -0.371s |
| Current Aurora baseline | 4.67 | onset 4.87 | 0.049s | 755.2Hz | 0.3052 | baseline |
| Enemy Hit reference 0.75s/0.28s v0.7 | 4.74 | onset 2.4 | 0.42s | 527.2Hz | 0.2228 | whole-cue risk improved only -0.07; duration gap improved only -0.371s |

## Next Step

Promote refclip-s750-d200-v100 for Enemy Hit, then rerun the full audio comparison and event-gap rollup.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

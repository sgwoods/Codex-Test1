# Aurora Enemy Hit Audio Candidate Analysis

Generated: 2026-05-08T22:40:35.466Z
Commit: 63f90a0 (dirty)

## Problem

Enemy Hit is the highest whole-cue audio risk: Aurora gives hit confirmation, but the measured cue is too long, too bright, and spectrally far from the Zako impact reference window.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s750-d200-v100`
- Reason: No Enemy Hit candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Enemy Hit reference 0.75s/0.2s v1 | 0.65 | onset 1.65 | 0.05s | 12.2Hz | 0.0033 | duration gap improved only -0.001s |
| Enemy Hit reference 0.72s/0.24s v1 | 3.38 | onset 4.99 | 0.42s | 590.6Hz | 0.2021 | segment risk improved only 0.13; duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.94 | 3.44 | onset 5.24 | 0.42s | 575.8Hz | 0.2012 | segment risk improved only -0.12; duration gap improved only -0.371s; fewer exact segment-role matches than baseline |
| Enemy Hit reference 0.75s/0.28s v0.94 | 3.68 | onset 4.8 | 0.42s | 569.4Hz | 0.2094 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.28s v0.82 | 3.79 | onset 5.04 | 0.42s | 605.1Hz | 0.2143 | segment risk improved only 0.08; duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.58 | 3.83 | onset 3.88 | 0.39s | 644.9Hz | 0.2254 | duration gap improved only -0.341s |
| Enemy Hit reference 0.75s/0.2s v0.7 | 4.02 | onset 2.23 | 0.42s | 618.4Hz | 0.2223 | duration gap improved only -0.371s |
| Short low-mid snap | 4.02 | onset 5.86 | 0.039s | 741.5Hz | 0.2992 | segment risk improved only -0.74; duration gap improved only 0.01s |
| Enemy Hit reference 0.75s/0.24s v1 | 4.25 | onset 1.86 | 0.42s | 334.3Hz | 0.1795 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.28s v1 | 4.27 | onset 1.62 | 0.42s | 434.5Hz | 0.1873 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.2s v0.82 | 4.34 | onset 2.1 | 0.42s | 558.4Hz | 0.1946 | duration gap improved only -0.371s |
| Zako current guide window | 4.37 | onset 1.71 | 0.42s | 455.6Hz | 0.2065 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v0.94 | 4.38 | onset 1.72 | 0.42s | 448.1Hz | 0.1954 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.2s v0.94 | 4.39 | onset 1.73 | 0.42s | 421.5Hz | 0.1857 | duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v0.82 | 4.49 | onset 2.64 | 0.42s | 513.6Hz | 0.2024 | whole-cue risk improved only 0.2; duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.82 | 4.52 | onset 2.68 | 0.42s | 533.6Hz | 0.2057 | whole-cue risk improved only 0.17; duration gap improved only -0.371s |
| Enemy Hit reference 0.72s/0.24s v0.7 | 4.57 | onset 2.39 | 0.42s | 491.9Hz | 0.2228 | whole-cue risk improved only 0.12; duration gap improved only -0.371s |
| Enemy Hit reference 0.79s/0.24s v0.94 | 4.58 | onset 1.45 | 0.42s | 487.6Hz | 0.2064 | whole-cue risk improved only 0.11; duration gap improved only -0.371s |
| Enemy Hit reference 0.79s/0.24s v1 | 4.58 | onset 2.47 | 0.42s | 516.5Hz | 0.2061 | whole-cue risk improved only 0.11; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.18s v0.82 | 4.59 | onset 1.78 | 0.42s | 472.7Hz | 0.2109 | whole-cue risk improved only 0.1; duration gap improved only -0.371s |
| Enemy Hit reference 0.79s/0.24s v0.82 | 4.62 | onset 2.22 | 0.42s | 468Hz | 0.2205 | whole-cue risk improved only 0.07; duration gap improved only -0.371s |
| Enemy Hit reference 0.75s/0.24s v0.7 | 4.69 | onset 2.26 | 0.42s | 466.1Hz | 0.2259 | whole-cue risk improved only 0; duration gap improved only -0.371s |
| Current Aurora baseline | 4.69 | onset 5.12 | 0.049s | 788.8Hz | 0.3236 | baseline |
| Enemy Hit reference 0.75s/0.28s v0.7 | 4.7 | onset 2.28 | 0.42s | 479.1Hz | 0.2224 | whole-cue risk improved only -0.01; duration gap improved only -0.371s |

## Next Step

Do not promote Enemy Hit yet; use the measured best candidate to refine the generator or scoring gates.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

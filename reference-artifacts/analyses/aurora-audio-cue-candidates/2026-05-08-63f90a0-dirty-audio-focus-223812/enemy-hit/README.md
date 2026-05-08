# Aurora Enemy Hit Audio Candidate Analysis

Generated: 2026-05-08T22:38:12.644Z
Commit: 63f90a0 (dirty)

## Problem

Enemy Hit is the highest whole-cue audio risk: Aurora gives hit confirmation, but the measured cue is too long, too bright, and spectrally far from the Zako impact reference window.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s720-d240-v94`
- Reason: No Enemy Hit candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Enemy Hit reference 0.72s/0.24s v0.94 | 3.38 | onset 4.67 | 0.42s | 571.9Hz | 0.2026 | duration gap improved only 0s |
| Enemy Hit reference 0.75s/0.24s v1 | 4.26 | onset 2 | 0.42s | 410.6Hz | 0.1843 | duration gap improved only 0s |
| Enemy Hit reference 0.72s/0.24s v1 | 4.3 | onset 1.65 | 0.42s | 431.9Hz | 0.1871 | duration gap improved only 0s |
| Enemy Hit reference 0.79s/0.24s v1 | 4.4 | onset 1.64 | 0.42s | 462Hz | 0.1993 | duration gap improved only 0s |
| Enemy Hit reference 0.75s/0.24s v0.94 | 4.4 | onset 1.72 | 0.42s | 402.3Hz | 0.1927 | duration gap improved only 0s |
| Enemy Hit reference 0.72s/0.24s v0.82 | 4.43 | onset 1.74 | 0.42s | 484.2Hz | 0.2023 | duration gap improved only 0s |
| Zako current guide window | 4.47 | onset 1.94 | 0.42s | 477.2Hz | 0.2049 | duration gap improved only 0s |
| Enemy Hit reference 0.75s/0.24s v0.82 | 4.49 | onset 2.12 | 0.42s | 425.1Hz | 0.2055 | duration gap improved only 0s |
| Enemy Hit reference 0.79s/0.24s v0.94 | 4.57 | onset 1.62 | 0.42s | 461.7Hz | 0.2076 | duration gap improved only 0s |
| Enemy Hit reference 0.75s/0.24s v0.7 | 4.65 | onset 2.28 | 0.42s | 516.3Hz | 0.2232 | duration gap improved only 0s |
| Enemy Hit reference 0.72s/0.24s v0.7 | 4.68 | onset 2.6 | 0.42s | 464.1Hz | 0.2238 | duration gap improved only 0s |
| Enemy Hit reference 0.79s/0.24s v0.82 | 4.73 | onset 2.22 | 0.42s | 506.7Hz | 0.2209 | duration gap improved only 0s |
| Enemy Hit reference 0.75s/0.24s v0.58 | 4.86 | onset 3.17 | 0.42s | 603.4Hz | 0.2407 | duration gap improved only 0s |
| Current Aurora baseline | 5.96 | onset 5.1 | 0.42s | 681Hz | 0.2968 | baseline |
| Short low-mid snap | 6.01 | onset 5.74 | 0.42s | 702.1Hz | 0.3164 | whole-cue risk improved only -0.05; segment risk improved only -0.64; duration gap improved only 0s |

## Next Step

Do not promote Enemy Hit yet; use the measured best candidate to refine the generator or scoring gates.

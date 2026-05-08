# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:30:47.648Z`
Commit: `17ce604`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift. The comparison now includes spectral band-shape, rolloff, and envelope segmentation so future searches can target timbre instead of only duration and centroid.

## Success Measure

A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS or band-shape gap, and keep active duration within 0.08s of the reference.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `thin-bright-square-soft-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square top | 4.15 | centroid | 0.18s | 753 Hz | 0.1334 | 0.116 | 0.1116 | 1x, risk sd 0 | duration gap 0.18s > 0.08s |
| Thin bright square soft held | 4.31 | centroid | 0.041s | 630.6 Hz | 0.1197 | 0.19 | 0.1328 | 1x, risk sd 0 | RMS worsened by 0.0273 |
| Thin bright square held | 4.36 | centroid | 0.01s | 602.3 Hz | 0.1318 | 0.367 | 0.1451 | 1x, risk sd 0 | RMS worsened by 0.0396 |
| Thin bright square balanced held | 4.38 | centroid | 0.06s | 686.3 Hz | 0.139 | 0.331 | 0.1211 | 1x, risk sd 0 | RMS worsened by 0.0156 |
| Thin bright square long low held | 4.48 | centroid | 0.32s | 680.5 Hz | 0.1395 | 0.335 | 0.0434 | 1x, risk sd 0 | duration gap 0.32s > 0.08s |
| Triangle neighborhood 0.046/0.0088/0.003/0.16/3136 | 4.56 | centroid | 0.06s | 740.7 Hz | 0.2111 | 0.108 | 0.0086 | 1x, risk sd 0 | spectral band shape worsened by 0.0618 |
| Thin bright square quiet held | 4.59 | centroid | 0.17s | 674.6 Hz | 0.1434 | 0.367 | 0.1309 | 1x, risk sd 0 | duration gap 0.17s > 0.08s; risk improvement 0.24 < 0.25; RMS worsened by 0.0254 |
| Triangle neighborhood 0.048/0.0082/0.0034/0.16/3136 | 4.62 | centroid | 0.06s | 768.1 Hz | 0.2057 | 0.143 | 0.012 | 1x, risk sd 0 | risk improvement 0.21 < 0.25; spectral band shape worsened by 0.0564 |
| Triangle neighborhood 0.052/0.0082/0.003/0.16/3136 | 4.66 | centroid | 0.06s | 766.8 Hz | 0.2097 | 0.128 | 0.01 | 1x, risk sd 0 | risk improvement 0.17 < 0.25; spectral band shape worsened by 0.0604 |
| Triangle neighborhood 0.052/0.0082/0.0026/0.16/2794 | 4.79 | centroid | 0.06s | 770.4 Hz | 0.2132 | 0.252 | 0.0094 | 1x, risk sd 0 | risk improvement 0.04 < 0.25; spectral band shape worsened by 0.0639 |
| Thin bright triangle ladder | 4.82 | centroid | 0.021s | 858.7 Hz | 0.1373 | 0.368 | 0.1156 | 1x, risk sd 0 | risk improvement 0.01 < 0.25; RMS worsened by 0.0101 |
| Triangle neighborhood 0.046/0.0088/0.0034/0.16/3136 | 4.82 | centroid | 0.06s | 811.6 Hz | 0.2263 | 0.18 | 0.0047 | 1x, risk sd 0 | risk improvement 0.01 < 0.25; spectral band shape worsened by 0.077 |
| Current Aurora baseline | 4.83 | centroid | 0.06s | 869.1 Hz | 0.1493 | 0.383 | 0.1055 | 1x, risk sd 0 | baseline |
| Triangle neighborhood 0.048/0.0088/0.0026/0.16/2794 | 4.83 | centroid | 0.06s | 864.3 Hz | 0.2372 | 0.089 | 0.0018 | 1x, risk sd 0 | risk improvement 0 < 0.25; spectral band shape worsened by 0.0879 |
| Low RMS harmonic | 4.84 | centroid | 0.04s | 798.6 Hz | 0.2112 | 0.199 | 0.0108 | 1x, risk sd 0 | risk improvement -0.01 < 0.25; spectral band shape worsened by 0.0619 |
| Triangle neighborhood 0.048/0.0088/0.0026/0.16/3136 | 4.86 | centroid | 0.06s | 766.7 Hz | 0.2299 | 0.358 | 0.0055 | 1x, risk sd 0 | risk improvement -0.03 < 0.25; spectral band shape worsened by 0.0806 |
| Low RMS square edge | 4.86 | centroid | 0.21s | 656.6 Hz | 0.2182 | 0.422 | 0.0161 | 1x, risk sd 0 | duration gap 0.21s > 0.08s; risk improvement -0.03 < 0.25; spectral band shape worsened by 0.0689 |
| Sparkle low RMS | 4.9 | centroid | 0.06s | 854.1 Hz | 0.2394 | 0.105 | 0.0125 | 1x, risk sd 0 | risk improvement -0.07 < 0.25; spectral band shape worsened by 0.0901 |
| Triangle neighborhood 0.05/0.0082/0.0034/0.16/3136 | 4.92 | centroid | 0.06s | 767.7 Hz | 0.2092 | 0.429 | 0.0104 | 1x, risk sd 0 | risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0599 |
| Sparkle low RMS centered ZCR | 4.92 | centroid | 0.161s | 870.7 Hz | 0.2388 | 0.109 | 0.0147 | 1x, risk sd 0 | duration gap 0.161s > 0.08s; risk improvement -0.09 < 0.25; centroid did not improve (-1.6 Hz); spectral band shape worsened by 0.0895 |
| Thin bright square micro held | 4.98 | centroid | 0.01s | 828.9 Hz | 0.2351 | 0.143 | 0.026 | 1x, risk sd 0 | risk improvement -0.15 < 0.25; spectral band shape worsened by 0.0858 |
| Triangle neighborhood 0.052/0.0076/0.0034/0.16/3136 | 4.99 | centroid | 0.06s | 866.4 Hz | 0.2408 | 0.18 | 0.0016 | 1x, risk sd 0 | risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0915 |
| Triangle neighborhood 0.046/0.0088/0.0034/0.16/3520 | 4.99 | centroid | 0.06s | 787 Hz | 0.2227 | 0.385 | 0.0001 | 1x, risk sd 0 | risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0734 |
| Triangle neighborhood 0.048/0.0088/0.0026/0.16/3520 | 5 | centroid | 0.06s | 761 Hz | 0.2063 | 0.472 | 0.0003 | 1x, risk sd 0 | risk improvement -0.17 < 0.25; spectral band shape worsened by 0.057 |
| Triangle neighborhood 0.048/0.0088/0.003/0.16/2794 | 5.04 | centroid | 0.06s | 793 Hz | 0.2128 | 0.432 | 0.0034 | 1x, risk sd 0 | risk improvement -0.21 < 0.25; spectral band shape worsened by 0.0635 |
| High square stair | 5.06 | centroid | 0s | 875.4 Hz | 0.2557 | 0.216 | 0.0092 | 1x, risk sd 0 | risk improvement -0.23 < 0.25; centroid did not improve (-6.3 Hz); spectral band shape worsened by 0.1064 |
| Triangle neighborhood 0.052/0.0076/0.0034/0.16/2794 | 5.07 | centroid | 0.06s | 843.6 Hz | 0.2276 | 0.328 | 0.003 | 1x, risk sd 0 | risk improvement -0.24 < 0.25; spectral band shape worsened by 0.0783 |
| Sparkle with light noise | 5.08 | centroid | 0.06s | 803.5 Hz | 0.2185 | 0.427 | 0.0003 | 1x, risk sd 0 | risk improvement -0.25 < 0.25; spectral band shape worsened by 0.0692 |
| Triangle neighborhood 0.048/0.0082/0.0038/0.16/2794 | 5.08 | centroid | 0.06s | 865.9 Hz | 0.2392 | 0.395 | 0.0008 | 1x, risk sd 0 | risk improvement -0.25 < 0.25; spectral band shape worsened by 0.0899 |
| Thin bright square quiet tail | 5.1 | centroid | 0.03s | 785.2 Hz | 0.217 | 0.361 | 0.0156 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0677 |
| Triangle neighborhood 0.046/0.0094/0.0026/0.16/3136 | 5.1 | centroid | 0.06s | 789.8 Hz | 0.2162 | 0.417 | 0.0074 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0669 |
| Staccato bright | 5.11 | centroid | 0.06s | 824.3 Hz | 0.244 | 0.389 | 0.0046 | 1x, risk sd 0 | risk improvement -0.28 < 0.25; spectral band shape worsened by 0.0947 |
| Triangle neighborhood 0.052/0.0082/0.0026/0.16/3136 | 5.11 | centroid | 0.06s | 873.3 Hz | 0.2466 | 0.369 | 0.0002 | 1x, risk sd 0 | risk improvement -0.28 < 0.25; centroid did not improve (-4.2 Hz); spectral band shape worsened by 0.0973 |
| Triangle neighborhood 0.046/0.0088/0.003/0.16/3520 | 5.12 | centroid | 0.06s | 830.3 Hz | 0.2381 | 0.411 | 0.0015 | 1x, risk sd 0 | risk improvement -0.29 < 0.25; spectral band shape worsened by 0.0888 |
| Sparkle short tail | 5.12 | centroid | 0.1s | 866.6 Hz | 0.2357 | 0.372 | 0.0004 | 1x, risk sd 0 | duration gap 0.1s > 0.08s; risk improvement -0.29 < 0.25; spectral band shape worsened by 0.0864 |
| Triangle neighborhood 0.046/0.0094/0.0026/0.16/2794 | 5.13 | centroid | 0.02s | 843.8 Hz | 0.2259 | 0.422 | 0.0025 | 1x, risk sd 0 | risk improvement -0.3 < 0.25; spectral band shape worsened by 0.0766 |
| Triangle neighborhood 0.052/0.0082/0.0026/0.16/3520 | 5.18 | centroid | 0.01s | 853.5 Hz | 0.2368 | 0.439 | 0.0057 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0875 |
| Sparkle low RMS square edge | 5.18 | centroid | 0.06s | 825.3 Hz | 0.2424 | 0.409 | 0.0088 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0931 |
| Triangle neighborhood 0.052/0.0076/0.0038/0.16/3136 | 5.2 | centroid | 0.179s | 871.5 Hz | 0.2325 | 0.256 | 0.0217 | 1x, risk sd 0 | duration gap 0.179s > 0.08s; risk improvement -0.37 < 0.25; centroid did not improve (-2.4 Hz); spectral band shape worsened by 0.0832 |
| Thin bright square split low held | 5.21 | centroid | 0.06s | 849.4 Hz | 0.229 | 0.354 | 0.0162 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; spectral band shape worsened by 0.0797 |
| Triangle neighborhood 0.046/0.0088/0.0034/0.16/2794 | 5.22 | centroid | 0.06s | 853.4 Hz | 0.2386 | 0.393 | 0.0027 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; spectral band shape worsened by 0.0893 |
| Octave chime thin | 5.23 | centroid | 0.11s | 868 Hz | 0.2402 | 0.356 | 0.0157 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.4 < 0.25; spectral band shape worsened by 0.0909 |
| Triangle neighborhood 0.048/0.0088/0.003/0.16/3520 | 5.28 | centroid | 0.06s | 877.9 Hz | 0.2512 | 0.396 | 0.0101 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; centroid did not improve (-8.8 Hz); spectral band shape worsened by 0.1019 |
| Triangle neighborhood 0.048/0.0082/0.0038/0.16/3136 | 5.28 | centroid | 0.159s | 858.9 Hz | 0.2284 | 0.361 | 0.0194 | 1x, risk sd 0 | duration gap 0.159s > 0.08s; risk improvement -0.45 < 0.25; spectral band shape worsened by 0.0791 |
| Triangle neighborhood 0.05/0.0088/0.0026/0.16/3136 | 5.29 | centroid | 0s | 920.8 Hz | 0.2587 | 0.377 | 0.0066 | 1x, risk sd 0 | risk improvement -0.46 < 0.25; centroid did not improve (-51.7 Hz); spectral band shape worsened by 0.1094 |
| Triangle neighborhood 0.05/0.0082/0.003/0.16/2794 | 5.31 | centroid | 0.06s | 895.7 Hz | 0.2595 | 0.41 | 0.0077 | 1x, risk sd 0 | risk improvement -0.48 < 0.25; centroid did not improve (-26.6 Hz); spectral band shape worsened by 0.1102 |
| Triangle neighborhood 0.05/0.0082/0.003/0.16/3136 | 5.32 | centroid | 0.06s | 883.7 Hz | 0.2508 | 0.418 | 0.0072 | 1x, risk sd 0 | risk improvement -0.49 < 0.25; centroid did not improve (-14.6 Hz); spectral band shape worsened by 0.1015 |
| Triangle neighborhood 0.046/0.0094/0.0026/0.16/3520 | 5.33 | centroid | 0.06s | 891.9 Hz | 0.252 | 0.399 | 0.011 | 1x, risk sd 0 | risk improvement -0.5 < 0.25; centroid did not improve (-22.8 Hz); spectral band shape worsened by 0.1027 |
| Triangle neighborhood 0.05/0.0076/0.0038/0.16/3136 | 5.34 | centroid | 0.139s | 883.9 Hz | 0.237 | 0.343 | 0.0217 | 1x, risk sd 0 | duration gap 0.139s > 0.08s; risk improvement -0.51 < 0.25; centroid did not improve (-14.8 Hz); spectral band shape worsened by 0.0877 |
| Triangle neighborhood 0.048/0.0082/0.0038/0.16/3520 | 5.37 | centroid | 0.019s | 940.1 Hz | 0.2553 | 0.408 | 0.008 | 1x, risk sd 0 | risk improvement -0.54 < 0.25; centroid did not improve (-71 Hz); spectral band shape worsened by 0.106 |
| Low RMS brighter | 5.39 | centroid | 0.17s | 943.6 Hz | 0.2578 | 0.372 | 0.0006 | 1x, risk sd 0 | duration gap 0.17s > 0.08s; risk improvement -0.56 < 0.25; centroid did not improve (-74.5 Hz); spectral band shape worsened by 0.1085 |
| Triangle neighborhood 0.046/0.0088/0.003/0.16/2794 | 5.4 | centroid | 0.059s | 922.6 Hz | 0.2601 | 0.402 | 0.0087 | 1x, risk sd 0 | risk improvement -0.57 < 0.25; centroid did not improve (-53.5 Hz); spectral band shape worsened by 0.1108 |
| Triangle neighborhood 0.048/0.0088/0.003/0.16/3136 | 5.42 | centroid | 0.06s | 929.7 Hz | 0.2576 | 0.419 | 0.0081 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; centroid did not improve (-60.6 Hz); spectral band shape worsened by 0.1083 |
| Triangle neighborhood 0.05/0.0082/0.003/0.16/3520 | 5.44 | centroid | 0.279s | 853.3 Hz | 0.2313 | 0.425 | 0.0233 | 1x, risk sd 0 | duration gap 0.279s > 0.08s; risk improvement -0.61 < 0.25; spectral band shape worsened by 0.082 |
| Thin bright square soft attack held | 5.45 | centroid | 0.101s | 879.8 Hz | 0.2574 | 0.319 | 0.035 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement -0.62 < 0.25; centroid did not improve (-10.7 Hz); spectral band shape worsened by 0.1081 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

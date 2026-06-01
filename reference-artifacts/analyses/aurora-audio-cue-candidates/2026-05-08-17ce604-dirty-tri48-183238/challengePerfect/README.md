# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:32:38.237Z`
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
- Measured best: `thin-bright-triangle`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square quiet held | 4.13 | rolloff | 0.14s | 504.2 Hz | 0.1263 | 0.298 | 0.1288 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; RMS worsened by 0.0236 |
| Thin bright square top | 4.39 | centroid | 0.151s | 686.2 Hz | 0.1235 | 0.457 | 0.1117 | 1x, risk sd 0 | duration gap 0.151s > 0.08s |
| Thin bright triangle ladder | 4.54 | centroid | 0s | 779.6 Hz | 0.1266 | 0.268 | 0.1162 | 1x, risk sd 0 | risk improvement 0.14 < 0.25; RMS worsened by 0.011 |
| Thin bright square balanced held | 4.61 | centroid | 0s | 778.7 Hz | 0.1484 | 0.417 | 0.123 | 1x, risk sd 0 | risk improvement 0.07 < 0.25; RMS worsened by 0.0178 |
| Thin bright square soft held | 4.61 | centroid | 0.011s | 777.5 Hz | 0.1331 | 0.178 | 0.1325 | 1x, risk sd 0 | risk improvement 0.07 < 0.25; RMS worsened by 0.0273 |
| Thin bright square held | 4.62 | centroid | 0.04s | 683.1 Hz | 0.1439 | 0.421 | 0.145 | 1x, risk sd 0 | risk improvement 0.06 < 0.25; RMS worsened by 0.0398 |
| Thin bright square long low held | 4.65 | centroid | 0.3s | 760 Hz | 0.1505 | 0.378 | 0.0606 | 1x, risk sd 0 | duration gap 0.3s > 0.08s; risk improvement 0.03 < 0.25 |
| Current Aurora baseline | 4.68 | centroid | 0.06s | 822.1 Hz | 0.1436 | 0.36 | 0.1052 | 1x, risk sd 0 | baseline |
| Low RMS harmonic | 4.74 | centroid | 0.061s | 777.3 Hz | 0.2139 | 0.18 | 0.006 | 1x, risk sd 0 | risk improvement -0.06 < 0.25; spectral band shape worsened by 0.0703 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3136/0.00025 | 4.77 | centroid | 0.039s | 730.7 Hz | 0.2007 | 0.372 | 0.0126 | 1x, risk sd 0 | risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0571 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/3136/0.00045 | 4.79 | centroid | 0.06s | 776.4 Hz | 0.2125 | 0.367 | 0.0085 | 1x, risk sd 0 | risk improvement -0.11 < 0.25; spectral band shape worsened by 0.0689 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/3520/0.00045 | 4.79 | centroid | 0.06s | 784 Hz | 0.2072 | 0.249 | 0.008 | 1x, risk sd 0 | risk improvement -0.11 < 0.25; spectral band shape worsened by 0.0636 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3520/0.00045 | 4.8 | centroid | 0.06s | 838.8 Hz | 0.2335 | 0.137 | 0.0011 | 1x, risk sd 0 | risk improvement -0.12 < 0.25; centroid did not improve (-16.7 Hz); spectral band shape worsened by 0.0899 |
| Sparkle low RMS square edge | 4.83 | centroid | 0.06s | 828.8 Hz | 0.2408 | 0.052 | 0.0141 | 1x, risk sd 0 | risk improvement -0.15 < 0.25; centroid did not improve (-6.7 Hz); spectral band shape worsened by 0.0972 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/3520/0.00045 | 4.84 | centroid | 0.06s | 737.2 Hz | 0.2073 | 0.37 | 0.0096 | 1x, risk sd 0 | risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0637 |
| Triangle air neighborhood 0.048/0.0082/0.0038/0.16/3136/0.00045 | 4.85 | centroid | 0.06s | 812 Hz | 0.2369 | 0.185 | 0.002 | 1x, risk sd 0 | risk improvement -0.17 < 0.25; spectral band shape worsened by 0.0933 |
| Sparkle with light noise | 4.86 | centroid | 0.06s | 739.3 Hz | 0.2069 | 0.373 | 0.0158 | 1x, risk sd 0 | risk improvement -0.18 < 0.25; spectral band shape worsened by 0.0633 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/3136/0.00045 | 4.86 | centroid | 0.06s | 829.4 Hz | 0.2288 | 0.358 | 0.0037 | 1x, risk sd 0 | risk improvement -0.18 < 0.25; centroid did not improve (-7.3 Hz); spectral band shape worsened by 0.0852 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/2794/0.00045 | 4.87 | centroid | 0.049s | 749.6 Hz | 0.2185 | 0.412 | 0.0092 | 1x, risk sd 0 | risk improvement -0.19 < 0.25; spectral band shape worsened by 0.0749 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3520/0.00045 | 4.89 | centroid | 0.06s | 737.7 Hz | 0.2155 | 0.447 | 0.0103 | 1x, risk sd 0 | risk improvement -0.21 < 0.25; spectral band shape worsened by 0.0719 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3136/0.00045 | 4.91 | centroid | 0.06s | 841.9 Hz | 0.2448 | 0.109 | 0.0096 | 1x, risk sd 0 | risk improvement -0.23 < 0.25; centroid did not improve (-19.8 Hz); spectral band shape worsened by 0.1012 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/2794/0.00045 | 4.92 | centroid | 0.06s | 879.9 Hz | 0.2416 | 0.131 | 0.0002 | 1x, risk sd 0 | risk improvement -0.24 < 0.25; centroid did not improve (-57.8 Hz); spectral band shape worsened by 0.098 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/2794/0.00045 | 4.95 | centroid | 0.059s | 857.8 Hz | 0.2355 | 0.247 | 0.0002 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; centroid did not improve (-35.7 Hz); spectral band shape worsened by 0.0919 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/2794/0.00045 | 4.95 | centroid | 0.06s | 853.1 Hz | 0.2354 | 0.179 | 0.0054 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; centroid did not improve (-31 Hz); spectral band shape worsened by 0.0918 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/3136/0.00045 | 4.96 | centroid | 0.06s | 801.2 Hz | 0.2226 | 0.246 | 0.0055 | 1x, risk sd 0 | risk improvement -0.28 < 0.25; spectral band shape worsened by 0.079 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/2794/0.00045 | 4.97 | centroid | 0s | 808.8 Hz | 0.2175 | 0.376 | 0.004 | 1x, risk sd 0 | risk improvement -0.29 < 0.25; spectral band shape worsened by 0.0739 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/2794/0.00045 | 4.98 | centroid | 0.06s | 816.4 Hz | 0.2306 | 0.362 | 0.0052 | 1x, risk sd 0 | risk improvement -0.3 < 0.25; spectral band shape worsened by 0.087 |
| Triangle air neighborhood 0.052/0.0082/0.0026/0.16/3136/0.00045 | 4.98 | centroid | 0.06s | 857.1 Hz | 0.2377 | 0.281 | 0.0038 | 1x, risk sd 0 | risk improvement -0.3 < 0.25; centroid did not improve (-35 Hz); spectral band shape worsened by 0.0941 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/3520/0.00045 | 4.99 | centroid | 0.06s | 845.7 Hz | 0.234 | 0.333 | 0.0005 | 1x, risk sd 0 | risk improvement -0.31 < 0.25; centroid did not improve (-23.6 Hz); spectral band shape worsened by 0.0904 |
| Triangle air neighborhood 0.052/0.0076/0.0038/0.16/3136/0.00045 | 4.99 | centroid | 0.06s | 819.6 Hz | 0.234 | 0.399 | 0.0017 | 1x, risk sd 0 | risk improvement -0.31 < 0.25; spectral band shape worsened by 0.0904 |
| Thin bright square quiet tail | 5.01 | centroid | 0s | 754.3 Hz | 0.2143 | 0.35 | 0.022 | 1x, risk sd 0 | risk improvement -0.33 < 0.25; spectral band shape worsened by 0.0707 |
| Sparkle low RMS | 5.02 | centroid | 0.06s | 860.1 Hz | 0.2447 | 0.131 | 0.0174 | 1x, risk sd 0 | risk improvement -0.34 < 0.25; centroid did not improve (-38 Hz); spectral band shape worsened by 0.1011 |
| Triangle air neighborhood 0.048/0.0082/0.0038/0.16/3136/0.00045 | 5.02 | centroid | 0.06s | 795.1 Hz | 0.2117 | 0.407 | 0.0036 | 1x, risk sd 0 | risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0681 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/3136/0.00025 | 5.02 | centroid | 0.06s | 812.4 Hz | 0.22 | 0.428 | 0.0062 | 1x, risk sd 0 | risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0764 |
| Octave chime thin | 5.03 | centroid | 0.07s | 791.3 Hz | 0.2175 | 0.372 | 0.0085 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0739 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/3136/0.00045 | 5.05 | centroid | 0.06s | 813 Hz | 0.231 | 0.379 | 0.0034 | 1x, risk sd 0 | risk improvement -0.37 < 0.25; spectral band shape worsened by 0.0874 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/3136/0.00025 | 5.06 | centroid | 0.059s | 841.7 Hz | 0.2296 | 0.395 | 0.0013 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; centroid did not improve (-19.6 Hz); spectral band shape worsened by 0.086 |
| Thin bright square split low held | 5.07 | centroid | 0.029s | 855.3 Hz | 0.2306 | 0.213 | 0.0145 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; centroid did not improve (-33.2 Hz); spectral band shape worsened by 0.087 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3136/0.00025 | 5.08 | centroid | 0.06s | 918.1 Hz | 0.2532 | 0.133 | 0.0127 | 1x, risk sd 0 | risk improvement -0.4 < 0.25; centroid did not improve (-96 Hz); spectral band shape worsened by 0.1096 |
| Triangle air neighborhood 0.052/0.0076/0.0038/0.16/3136/0.00045 | 5.09 | centroid | 0.02s | 857.2 Hz | 0.2313 | 0.293 | 0.0057 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; centroid did not improve (-35.1 Hz); spectral band shape worsened by 0.0877 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3520/0.00045 | 5.09 | centroid | 0.08s | 848.2 Hz | 0.2337 | 0.252 | 0.0136 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; centroid did not improve (-26.1 Hz); spectral band shape worsened by 0.0901 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/3520/0.00045 | 5.12 | centroid | 0.169s | 763.5 Hz | 0.2152 | 0.41 | 0.0207 | 1x, risk sd 0 | duration gap 0.169s > 0.08s; risk improvement -0.44 < 0.25; spectral band shape worsened by 0.0716 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/2794/0.00045 | 5.13 | centroid | 0.06s | 820.9 Hz | 0.2261 | 0.429 | 0.0041 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; spectral band shape worsened by 0.0825 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3136/0.00045 | 5.15 | centroid | 0.06s | 847.4 Hz | 0.2273 | 0.418 | 0.005 | 1x, risk sd 0 | risk improvement -0.47 < 0.25; centroid did not improve (-25.3 Hz); spectral band shape worsened by 0.0837 |
| Triangle air neighborhood 0.052/0.0082/0.0026/0.16/3136/0.00045 | 5.15 | centroid | 0.06s | 796 Hz | 0.2133 | 0.443 | 0.006 | 1x, risk sd 0 | risk improvement -0.47 < 0.25; spectral band shape worsened by 0.0697 |
| Triangle air neighborhood 0.052/0.0082/0.0026/0.16/3136/0.00045 | 5.17 | centroid | 0.06s | 913.7 Hz | 0.2598 | 0.224 | 0.0106 | 1x, risk sd 0 | risk improvement -0.49 < 0.25; centroid did not improve (-91.6 Hz); spectral band shape worsened by 0.1162 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/3136/0.00045 | 5.22 | centroid | 0.01s | 880.4 Hz | 0.2385 | 0.435 | 0.0002 | 1x, risk sd 0 | risk improvement -0.54 < 0.25; centroid did not improve (-58.3 Hz); spectral band shape worsened by 0.0949 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/3136/0.00045 | 5.22 | centroid | 0.06s | 856.3 Hz | 0.2385 | 0.405 | 0.0026 | 1x, risk sd 0 | risk improvement -0.54 < 0.25; centroid did not improve (-34.2 Hz); spectral band shape worsened by 0.0949 |
| High square stair | 5.22 | centroid | 0.121s | 880.3 Hz | 0.2446 | 0.327 | 0.0057 | 1x, risk sd 0 | duration gap 0.121s > 0.08s; risk improvement -0.54 < 0.25; centroid did not improve (-58.2 Hz); spectral band shape worsened by 0.101 |
| Staccato bright | 5.24 | centroid | 0.06s | 877 Hz | 0.2318 | 0.445 | 0.007 | 1x, risk sd 0 | risk improvement -0.56 < 0.25; centroid did not improve (-54.9 Hz); spectral band shape worsened by 0.0882 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3136/0.00025 | 5.24 | centroid | 0.091s | 845.9 Hz | 0.2356 | 0.341 | 0.0219 | 1x, risk sd 0 | duration gap 0.091s > 0.08s; risk improvement -0.56 < 0.25; centroid did not improve (-23.8 Hz); spectral band shape worsened by 0.092 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/3136/0.00045 | 5.26 | centroid | 0s | 902.1 Hz | 0.2452 | 0.405 | 0.0086 | 1x, risk sd 0 | risk improvement -0.58 < 0.25; centroid did not improve (-80 Hz); spectral band shape worsened by 0.1016 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/2794/0.00045 | 5.27 | centroid | 0.04s | 858.7 Hz | 0.2594 | 0.423 | 0.0073 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; centroid did not improve (-36.6 Hz); spectral band shape worsened by 0.1158 |
| Low RMS brighter | 5.27 | centroid | 0.06s | 887.1 Hz | 0.2552 | 0.404 | 0.0034 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; centroid did not improve (-65 Hz); spectral band shape worsened by 0.1116 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/2794/0.00045 | 5.3 | centroid | 0.129s | 853.4 Hz | 0.2352 | 0.409 | 0.018 | 1x, risk sd 0 | duration gap 0.129s > 0.08s; risk improvement -0.62 < 0.25; centroid did not improve (-31.3 Hz); spectral band shape worsened by 0.0916 |
| Triangle air neighborhood 0.052/0.0076/0.0038/0.16/3136/0.00045 | 5.31 | centroid | 0.02s | 879.7 Hz | 0.2467 | 0.373 | 0.0138 | 1x, risk sd 0 | risk improvement -0.63 < 0.25; centroid did not improve (-57.6 Hz); spectral band shape worsened by 0.1031 |
| Sparkle short tail | 5.31 | centroid | 0.08s | 907.2 Hz | 0.2471 | 0.433 | 0.0014 | 1x, risk sd 0 | risk improvement -0.63 < 0.25; centroid did not improve (-85.1 Hz); spectral band shape worsened by 0.1035 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/3520/0.00045 | 5.31 | centroid | 0.199s | 852.3 Hz | 0.224 | 0.384 | 0.0195 | 1x, risk sd 0 | duration gap 0.199s > 0.08s; risk improvement -0.63 < 0.25; centroid did not improve (-30.2 Hz); spectral band shape worsened by 0.0804 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/2794/0.00045 | 5.32 | centroid | 0.01s | 917.7 Hz | 0.2506 | 0.394 | 0.0112 | 1x, risk sd 0 | risk improvement -0.64 < 0.25; centroid did not improve (-95.6 Hz); spectral band shape worsened by 0.107 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/3136/0.00045 | 5.32 | centroid | 0.04s | 868.1 Hz | 0.2414 | 0.453 | 0.0049 | 1x, risk sd 0 | risk improvement -0.64 < 0.25; centroid did not improve (-46 Hz); spectral band shape worsened by 0.0978 |
| Triangle air neighborhood 0.046/0.0094/0.0026/0.16/3136/0.00045 | 5.33 | centroid | 0.06s | 904.9 Hz | 0.2478 | 0.418 | 0.015 | 1x, risk sd 0 | risk improvement -0.65 < 0.25; centroid did not improve (-82.8 Hz); spectral band shape worsened by 0.1042 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/3520/0.00045 | 5.33 | centroid | 0.06s | 896.6 Hz | 0.2515 | 0.397 | 0.0098 | 1x, risk sd 0 | risk improvement -0.65 < 0.25; centroid did not improve (-74.5 Hz); spectral band shape worsened by 0.1079 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/3136/0.00025 | 5.34 | centroid | 0.021s | 942.6 Hz | 0.2613 | 0.394 | 0.0079 | 1x, risk sd 0 | risk improvement -0.66 < 0.25; centroid did not improve (-120.5 Hz); spectral band shape worsened by 0.1177 |
| Thin bright square micro held | 5.34 | centroid | 0.04s | 878.5 Hz | 0.2389 | 0.358 | 0.0218 | 1x, risk sd 0 | risk improvement -0.66 < 0.25; centroid did not improve (-56.4 Hz); spectral band shape worsened by 0.0953 |
| Triangle air neighborhood 0.048/0.0088/0.003/0.16/2794/0.00045 | 5.35 | centroid | 0.049s | 929 Hz | 0.2572 | 0.387 | 0.0079 | 1x, risk sd 0 | risk improvement -0.67 < 0.25; centroid did not improve (-106.9 Hz); spectral band shape worsened by 0.1136 |
| Sparkle low RMS centered ZCR | 5.35 | centroid | 0.06s | 908.4 Hz | 0.2498 | 0.373 | 0.0182 | 1x, risk sd 0 | risk improvement -0.67 < 0.25; centroid did not improve (-86.3 Hz); spectral band shape worsened by 0.1062 |
| Triangle air neighborhood 0.046/0.0088/0.0034/0.16/2794/0.00045 | 5.39 | centroid | 0.06s | 944.4 Hz | 0.2624 | 0.399 | 0.0074 | 1x, risk sd 0 | risk improvement -0.71 < 0.25; centroid did not improve (-122.3 Hz); spectral band shape worsened by 0.1188 |
| Triangle air neighborhood 0.05/0.0082/0.0034/0.16/3136/0.00045 | 5.4 | centroid | 0.06s | 919.1 Hz | 0.2616 | 0.4 | 0.0084 | 1x, risk sd 0 | risk improvement -0.72 < 0.25; centroid did not improve (-97 Hz); spectral band shape worsened by 0.118 |
| Triangle air neighborhood 0.048/0.0082/0.0038/0.16/3136/0.00045 | 5.4 | centroid | 0.169s | 896.1 Hz | 0.2387 | 0.345 | 0.022 | 1x, risk sd 0 | duration gap 0.169s > 0.08s; risk improvement -0.72 < 0.25; centroid did not improve (-74 Hz); spectral band shape worsened by 0.0951 |
| Thin bright square soft attack held | 5.53 | centroid | 0s | 933.7 Hz | 0.2574 | 0.343 | 0.0351 | 1x, risk sd 0 | risk improvement -0.85 < 0.25; centroid did not improve (-111.6 Hz); spectral band shape worsened by 0.1138 |
| Low RMS square edge | 5.65 | centroid | 0.08s | 947.6 Hz | 0.2598 | 0.533 | 0.0151 | 1x, risk sd 0 | risk improvement -0.97 < 0.25; centroid did not improve (-125.5 Hz); spectral band shape worsened by 0.1162 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

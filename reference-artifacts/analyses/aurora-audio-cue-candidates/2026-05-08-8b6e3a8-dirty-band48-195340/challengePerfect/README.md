# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:53:40.444Z`
Commit: `8b6e3a8`

## Problem

Challenge Perfect is now the highest Aurora audio segment-level event-gap risk: duration is broadly aligned, but the reference onset/body/tail sub-events are collapsing into a single runtime segment.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured segment risk drops without whole-cue or duration regressions. The comparison now includes role-by-role onset/body/tail segmentation, spectral band-shape, rolloff, envelope segmentation, and optional tone high-pass shaping so future searches can target measured sub-event structure instead of only duration and centroid.

## Success Measure

A keeper must reduce worst segment risk by at least 0.35, avoid materially worsening whole-cue risk, reduce centroid gap, avoid materially increasing RMS or band-shape gap, preserve exact segment-role matches, and keep active duration within 0.08s of the reference.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `staccato-bright`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Worst segment | Exact roles | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square top | 4.24 | body 7.01 | 1/3 | centroid | 0.161s | 630.4 Hz | 0.1159 | 0.441 | 0.112 | 1x, risk sd 0 | duration gap 0.161s > 0.08s |
| Thin bright square quiet held | 4.43 | body 6.68 | 1/3 | centroid | 0.14s | 619.9 Hz | 0.1589 | 0.319 | 0.1312 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; RMS worsened by 0.0249 |
| Thin bright square soft held | 4.47 | body 6.95 | 1/3 | centroid | 0.031s | 724.3 Hz | 0.1281 | 0.171 | 0.1361 | 1x, risk sd 0 | RMS worsened by 0.0298 |
| Thin bright square balanced held | 4.51 | tail 6.35 | 3/3 | centroid | 0.039s | 770.4 Hz | 0.1489 | 0.316 | 0.1219 | 1x, risk sd 0 | RMS worsened by 0.0156 |
| Thin bright square long low held | 4.56 | body 6.25 | 1/3 | centroid | 0.32s | 713.1 Hz | 0.1429 | 0.326 | 0.0431 | 1x, risk sd 0 | duration gap 0.32s > 0.08s |
| Thin bright triangle ladder | 4.61 | body 7.89 | 2/3 | centroid | 0s | 759.6 Hz | 0.1247 | 0.379 | 0.1146 | 1x, risk sd 0 | segment risk improvement 0.09 < 0.35 |
| Current Aurora baseline | 4.67 | body 7.98 | 1/3 | centroid | 0.06s | 820.2 Hz | 0.143 | 0.359 | 0.1063 | 1x, risk sd 0 | baseline |
| Thin bright square held | 4.68 | body 6.8 | 1/3 | centroid | 0.02s | 713.6 Hz | 0.1481 | 0.373 | 0.1426 | 1x, risk sd 0 | RMS worsened by 0.0363 |
| Band targeted soft-square-presence 0.0078/0.0032/0.0009 | 4.7 | tail 6.28 | 3/3 | centroid | 0.12s | 790.2 Hz | 0.2256 | 0.097 | 0.0081 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0826 |
| Sparkle with light noise | 4.74 | body 5.79 | 2/3 | centroid | 0.06s | 761.5 Hz | 0.2007 | 0.268 | 0.0148 | 1x, risk sd 0 | spectral band shape worsened by 0.0577 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 4.74 | onset 5.24 | 3/3 | centroid | 0.12s | 837.6 Hz | 0.2306 | 0.118 | 0.002 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-17.4 Hz); spectral band shape worsened by 0.0876 |
| Low RMS harmonic | 4.76 | body 6.06 | 3/3 | centroid | 0.06s | 735.4 Hz | 0.2084 | 0.212 | 0.0119 | 1x, risk sd 0 | spectral band shape worsened by 0.0654 |
| Band targeted soft-square-presence 0.0078/0.002/0.0024 | 4.76 | body 6.92 | 2/3 | centroid | 0.089s | 755.3 Hz | 0.2079 | 0.227 | 0.01 | 1x, risk sd 0 | duration gap 0.089s > 0.08s; spectral band shape worsened by 0.0649 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0018 | 4.77 | body 7.28 | 2/3 | centroid | 0.12s | 774.6 Hz | 0.2212 | 0.249 | 0.0044 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0782 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 4.84 | body 6.96 | 2/3 | centroid | 0.12s | 790.7 Hz | 0.2218 | 0.136 | 0.0078 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0788 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 4.84 | body 6.6 | 3/3 | centroid | 0.12s | 770.4 Hz | 0.2102 | 0.284 | 0.011 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0672 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0018 | 4.86 | body 7.93 | 1/3 | centroid | 0s | 832.8 Hz | 0.2257 | 0.19 | 0.0044 | 1x, risk sd 0 | segment risk improvement 0.05 < 0.35; centroid did not improve (-12.6 Hz); spectral band shape worsened by 0.0827 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 4.87 | body 7.09 | 1/3 | centroid | 0.059s | 820.1 Hz | 0.2278 | 0.208 | 0.0009 | 1x, risk sd 0 | spectral band shape worsened by 0.0848 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0018 | 4.9 | body 6.26 | 3/3 | centroid | 0.12s | 867.9 Hz | 0.2365 | 0.112 | 0.0034 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-47.7 Hz); spectral band shape worsened by 0.0935 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 4.95 | body 6.54 | 3/3 | centroid | 0.12s | 909.1 Hz | 0.2505 | 0.05 | 0.004 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-88.9 Hz); spectral band shape worsened by 0.1075 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 4.96 | body 7.42 | 2/3 | centroid | 0.08s | 839.3 Hz | 0.2336 | 0.239 | 0.0103 | 1x, risk sd 0 | centroid did not improve (-19.1 Hz); spectral band shape worsened by 0.0906 |
| Band targeted sine-presence-air 0.0078/0.0032/0.0013 | 4.96 | body 7.32 | 1/3 | centroid | 0.12s | 775.1 Hz | 0.2215 | 0.367 | 0.0025 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0785 |
| Band targeted sine-balanced-air 0.0078/0.002/0.0024 | 4.97 | body 7.7 | 2/3 | centroid | 0.089s | 834.4 Hz | 0.233 | 0.279 | 0.0052 | 1x, risk sd 0 | duration gap 0.089s > 0.08s; segment risk improvement 0.28 < 0.35; centroid did not improve (-14.2 Hz); spectral band shape worsened by 0.09 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 4.97 | body 6.82 | 2/3 | centroid | 0.12s | 824.6 Hz | 0.2271 | 0.351 | 0.0039 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-4.4 Hz); spectral band shape worsened by 0.0841 |
| Thin bright square micro held | 4.98 | body 6.99 | 2/3 | centroid | 0.03s | 840.5 Hz | 0.2288 | 0.129 | 0.0249 | 1x, risk sd 0 | centroid did not improve (-20.3 Hz); spectral band shape worsened by 0.0858 |
| Band targeted sine-presence-air 0.0078/0.0032/0.0009 | 4.99 | onset 6.04 | 3/3 | centroid | 0.089s | 784.6 Hz | 0.2143 | 0.343 | 0.0123 | 1x, risk sd 0 | duration gap 0.089s > 0.08s; spectral band shape worsened by 0.0713 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5 | body 7.37 | 2/3 | centroid | 0.12s | 846.6 Hz | 0.2315 | 0.357 | 0.0022 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-26.4 Hz); spectral band shape worsened by 0.0885 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5 | body 6.79 | 3/3 | centroid | 0.12s | 788.7 Hz | 0.2183 | 0.384 | 0.0143 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0753 |
| Band targeted soft-square-presence 0.0078/0.0032/0.0009 | 5.02 | body 6.27 | 3/3 | centroid | 0.12s | 810 Hz | 0.2258 | 0.388 | 0.0066 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0828 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.03 | body 6.94 | 3/3 | centroid | 0.12s | 802.1 Hz | 0.2159 | 0.382 | 0.009 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0729 |
| Thin bright square quiet tail | 5.05 | body 6.93 | 2/3 | centroid | 0s | 760 Hz | 0.2078 | 0.4 | 0.0269 | 1x, risk sd 0 | spectral band shape worsened by 0.0648 |
| Band targeted soft-square-presence 0.0078/0.002/0.0024 | 5.05 | body 8.18 | 1/3 | centroid | 0.11s | 809.5 Hz | 0.2236 | 0.406 | 0.0017 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; segment risk improvement -0.2 < 0.35; spectral band shape worsened by 0.0806 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.05 | body 6.75 | 2/3 | centroid | 0.12s | 846.9 Hz | 0.2324 | 0.363 | 0.0013 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-26.7 Hz); spectral band shape worsened by 0.0894 |
| Band targeted sine-presence-air 0.0078/0.0032/0.0009 | 5.05 | body 7.04 | 2/3 | centroid | 0.12s | 903.7 Hz | 0.2545 | 0.116 | 0.0066 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-83.5 Hz); spectral band shape worsened by 0.1115 |
| Band targeted soft-square-presence 0.0078/0.0032/0.0009 | 5.07 | body 7.74 | 2/3 | centroid | 0.079s | 834.9 Hz | 0.236 | 0.355 | 0.0033 | 1x, risk sd 0 | segment risk improvement 0.24 < 0.35; centroid did not improve (-14.7 Hz); spectral band shape worsened by 0.093 |
| Staccato bright | 5.09 | tail 5.73 | 3/3 | centroid | 0.06s | 860.2 Hz | 0.2488 | 0.365 | 0.0038 | 1x, risk sd 0 | centroid did not improve (-40 Hz); spectral band shape worsened by 0.1058 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 5.09 | body 7.3 | 1/3 | centroid | 0.109s | 851.2 Hz | 0.2329 | 0.279 | 0.0154 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; centroid did not improve (-31 Hz); spectral band shape worsened by 0.0899 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0018 | 5.09 | body 5.54 | 3/3 | centroid | 0.12s | 868.9 Hz | 0.2389 | 0.34 | 0.0009 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-48.7 Hz); spectral band shape worsened by 0.0959 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 5.1 | body 8.24 | 2/3 | centroid | 0.02s | 852.5 Hz | 0.2278 | 0.416 | 0.0007 | 1x, risk sd 0 | segment risk improvement -0.26 < 0.35; centroid did not improve (-32.3 Hz); spectral band shape worsened by 0.0848 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.1 | body 7.44 | 1/3 | centroid | 0.029s | 862.8 Hz | 0.235 | 0.366 | 0.0117 | 1x, risk sd 0 | centroid did not improve (-42.6 Hz); spectral band shape worsened by 0.092 |
| Octave chime thin | 5.1 | body 7.17 | 1/3 | centroid | 0.09s | 834.7 Hz | 0.2282 | 0.351 | 0.0134 | 1x, risk sd 0 | duration gap 0.09s > 0.08s; centroid did not improve (-14.5 Hz); spectral band shape worsened by 0.0852 |
| Sparkle short tail | 5.1 | body 7.32 | 2/3 | centroid | 0.11s | 840.6 Hz | 0.2453 | 0.375 | 0.0041 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; centroid did not improve (-20.4 Hz); spectral band shape worsened by 0.1023 |
| Sparkle low RMS square edge | 5.12 | body 7.19 | 2/3 | centroid | 0.06s | 808.7 Hz | 0.2387 | 0.4 | 0.0132 | 1x, risk sd 0 | spectral band shape worsened by 0.0957 |
| Sparkle low RMS centered ZCR | 5.13 | body 7.16 | 1/3 | centroid | 0.19s | 896.4 Hz | 0.246 | 0.186 | 0.0193 | 1x, risk sd 0 | duration gap 0.19s > 0.08s; centroid did not improve (-76.2 Hz); spectral band shape worsened by 0.103 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0009 | 5.15 | body 7.39 | 3/3 | centroid | 0s | 873.2 Hz | 0.2319 | 0.353 | 0.0086 | 1x, risk sd 0 | centroid did not improve (-53 Hz); spectral band shape worsened by 0.0889 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 5.15 | body 7.7 | 2/3 | centroid | 0.12s | 837.9 Hz | 0.2324 | 0.372 | 0.0046 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.28 < 0.35; centroid did not improve (-17.7 Hz); spectral band shape worsened by 0.0894 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5.16 | tail 6.29 | 3/3 | centroid | 0.11s | 848 Hz | 0.2404 | 0.402 | 0.0048 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; centroid did not improve (-27.8 Hz); spectral band shape worsened by 0.0974 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.17 | body 7.89 | 2/3 | centroid | 0.099s | 902.8 Hz | 0.2547 | 0.234 | 0.0059 | 1x, risk sd 0 | duration gap 0.099s > 0.08s; segment risk improvement 0.09 < 0.35; centroid did not improve (-82.6 Hz); spectral band shape worsened by 0.1117 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5.17 | body 7.71 | 2/3 | centroid | 0.12s | 848.8 Hz | 0.2363 | 0.361 | 0.0039 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.27 < 0.35; centroid did not improve (-28.6 Hz); spectral band shape worsened by 0.0933 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 5.18 | body 7.45 | 2/3 | centroid | 0.079s | 905.2 Hz | 0.2551 | 0.243 | 0.0107 | 1x, risk sd 0 | centroid did not improve (-85 Hz); spectral band shape worsened by 0.1121 |
| Thin bright square split low held | 5.19 | body 7.34 | 2/3 | centroid | 0.029s | 847.3 Hz | 0.2296 | 0.36 | 0.016 | 1x, risk sd 0 | centroid did not improve (-27.1 Hz); spectral band shape worsened by 0.0866 |
| Sparkle low RMS | 5.2 | body 7.4 | 2/3 | centroid | 0.06s | 850 Hz | 0.2381 | 0.359 | 0.0107 | 1x, risk sd 0 | centroid did not improve (-29.8 Hz); spectral band shape worsened by 0.0951 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 5.22 | body 6.44 | 2/3 | centroid | 0.09s | 857.2 Hz | 0.2424 | 0.412 | 0.0011 | 1x, risk sd 0 | duration gap 0.09s > 0.08s; centroid did not improve (-37 Hz); spectral band shape worsened by 0.0994 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0009 | 5.22 | body 7.66 | 2/3 | centroid | 0.12s | 865 Hz | 0.2451 | 0.408 | 0.0013 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.32 < 0.35; centroid did not improve (-44.8 Hz); spectral band shape worsened by 0.1021 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5.24 | body 7 | 2/3 | centroid | 0.059s | 875.5 Hz | 0.239 | 0.372 | 0.0105 | 1x, risk sd 0 | centroid did not improve (-55.3 Hz); spectral band shape worsened by 0.096 |
| Band targeted sine-presence-air 0.0078/0.0032/0.0009 | 5.24 | body 7.06 | 2/3 | centroid | 0.12s | 892.1 Hz | 0.251 | 0.369 | 0.0057 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-71.9 Hz); spectral band shape worsened by 0.108 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5.25 | body 8.32 | 2/3 | centroid | 0.109s | 891 Hz | 0.2479 | 0.344 | 0.0117 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; segment risk improvement -0.34 < 0.35; centroid did not improve (-70.8 Hz); spectral band shape worsened by 0.1049 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.25 | tail 7.39 | 2/3 | centroid | 0.12s | 879.7 Hz | 0.2406 | 0.4 | 0.004 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-59.5 Hz); spectral band shape worsened by 0.0976 |
| Low RMS brighter | 5.3 | body 7.69 | 2/3 | centroid | 0.15s | 883.4 Hz | 0.2572 | 0.417 | 0.0011 | 1x, risk sd 0 | duration gap 0.15s > 0.08s; segment risk improvement 0.29 < 0.35; centroid did not improve (-63.2 Hz); spectral band shape worsened by 0.1142 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0013 | 5.33 | tail 7.27 | 2/3 | centroid | 0.12s | 903 Hz | 0.2514 | 0.424 | 0.0001 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-82.8 Hz); spectral band shape worsened by 0.1084 |
| Low RMS square edge | 5.33 | body 7.76 | 1/3 | centroid | 0.279s | 790.1 Hz | 0.2364 | 0.464 | 0.0232 | 1x, risk sd 0 | duration gap 0.279s > 0.08s; segment risk improvement 0.22 < 0.35; spectral band shape worsened by 0.0934 |
| Band targeted soft-square-presence 0.0078/0.002/0.0024 | 5.34 | tail 6.98 | 2/3 | centroid | 0.12s | 889.8 Hz | 0.2509 | 0.436 | 0.0109 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-69.6 Hz); spectral band shape worsened by 0.1079 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 5.35 | body 7.96 | 2/3 | centroid | 0.129s | 875.2 Hz | 0.2314 | 0.43 | 0.0122 | 1x, risk sd 0 | duration gap 0.129s > 0.08s; segment risk improvement 0.02 < 0.35; centroid did not improve (-55 Hz); spectral band shape worsened by 0.0884 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 5.37 | body 8.19 | 2/3 | centroid | 0.06s | 940.6 Hz | 0.2533 | 0.362 | 0.0085 | 1x, risk sd 0 | segment risk improvement -0.21 < 0.35; centroid did not improve (-120.4 Hz); spectral band shape worsened by 0.1103 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 5.37 | body 8.46 | 2/3 | centroid | 0.07s | 900 Hz | 0.2599 | 0.427 | 0.0085 | 1x, risk sd 0 | segment risk improvement -0.48 < 0.35; centroid did not improve (-79.8 Hz); spectral band shape worsened by 0.1169 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 5.37 | tail 6.73 | 3/3 | centroid | 0.12s | 911.3 Hz | 0.2542 | 0.387 | 0.0106 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-91.1 Hz); spectral band shape worsened by 0.1112 |
| High square stair | 5.37 | body 7.76 | 2/3 | centroid | 0.131s | 939 Hz | 0.2591 | 0.345 | 0.0063 | 1x, risk sd 0 | duration gap 0.131s > 0.08s; segment risk improvement 0.22 < 0.35; centroid did not improve (-118.8 Hz); spectral band shape worsened by 0.1161 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0013 | 5.38 | body 8.31 | 2/3 | centroid | 0.12s | 920.3 Hz | 0.2601 | 0.38 | 0.0104 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.33 < 0.35; centroid did not improve (-100.1 Hz); spectral band shape worsened by 0.1171 |
| Band targeted sine-balanced-air 0.0078/0.0032/0.0009 | 5.38 | tail 6.6 | 2/3 | centroid | 0.12s | 931.9 Hz | 0.2571 | 0.41 | 0.0015 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-111.7 Hz); spectral band shape worsened by 0.1141 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0018 | 5.39 | body 8.18 | 3/3 | centroid | 0.12s | 916.1 Hz | 0.2574 | 0.409 | 0.0115 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.2 < 0.35; centroid did not improve (-95.9 Hz); spectral band shape worsened by 0.1144 |
| Thin bright square soft attack held | 5.47 | body 7.31 | 1/3 | centroid | 0.141s | 893.1 Hz | 0.2423 | 0.348 | 0.032 | 1x, risk sd 0 | duration gap 0.141s > 0.08s; centroid did not improve (-72.9 Hz); spectral band shape worsened by 0.0993 |

## Next Step

Use the band-family result to decide whether tone filtering is enough or whether the next audio platform investment should be envelope shaping or reference-clip playback for this event.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

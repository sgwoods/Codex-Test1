# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:23:18.680Z`
Commit: `522e411`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift. The comparison now includes spectral band-shape, rolloff, envelope segmentation, and optional tone high-pass shaping so future searches can target measured timbre instead of only duration and centroid.

## Success Measure

A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS or band-shape gap, and keep active duration within 0.08s of the reference.

## Decision

- Status: `candidate-recommended`
- Keep candidate: yes
- Best candidate: `thin-bright-triangle`
- Measured best: `thin-bright-triangle`
- Reason: Selected candidate clears risk, centroid, RMS, band-shape, and duration gates. The measured-lowest-risk candidate is tracked separately so the next sweep can still learn from it.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright triangle ladder | 4.36 | centroid | 0.021s | 695.5 Hz | 0.1216 | 0.218 | 0.1152 | 1x, risk sd 0 | clears keeper gates |
| Thin bright square top | 4.56 | centroid | 0.2s | 754.9 Hz | 0.1364 | 0.434 | 0.1117 | 1x, risk sd 0 | duration gap 0.2s > 0.08s |
| Thin bright square soft held | 4.59 | centroid | 0.061s | 733 Hz | 0.1335 | 0.195 | 0.1389 | 1x, risk sd 0 | risk improvement 0.24 < 0.25; RMS worsened by 0.0303 |
| Thin bright square quiet held | 4.67 | centroid | 0.18s | 689.3 Hz | 0.1556 | 0.379 | 0.1315 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement 0.16 < 0.25; RMS worsened by 0.0229 |
| Thin bright square balanced held | 4.7 | centroid | 0.051s | 788.6 Hz | 0.1492 | 0.353 | 0.1304 | 1x, risk sd 0 | risk improvement 0.13 < 0.25; RMS worsened by 0.0218 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 4.72 | centroid | 0.12s | 810.3 Hz | 0.2268 | 0.071 | 0.0018 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.11 < 0.25; spectral band shape worsened by 0.0853 |
| Thin bright square held | 4.73 | centroid | 0s | 764.3 Hz | 0.1514 | 0.378 | 0.1452 | 1x, risk sd 0 | risk improvement 0.1 < 0.25; RMS worsened by 0.0366 |
| Thin bright square split low held | 4.81 | centroid | 0.029s | 818.6 Hz | 0.2245 | 0.058 | 0.0182 | 1x, risk sd 0 | risk improvement 0.02 < 0.25; spectral band shape worsened by 0.083 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 4.81 | centroid | 0.12s | 806.4 Hz | 0.2306 | 0.177 | 0.0024 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.02 < 0.25; spectral band shape worsened by 0.0891 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 4.82 | centroid | 0.001s | 754.1 Hz | 0.2119 | 0.345 | 0.0025 | 1x, risk sd 0 | risk improvement 0.01 < 0.25; spectral band shape worsened by 0.0704 |
| Current Aurora baseline | 4.83 | centroid | 0.06s | 852.8 Hz | 0.1415 | 0.367 | 0.1086 | 1x, risk sd 0 | baseline |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 4.84 | centroid | 0.109s | 731.4 Hz | 0.2029 | 0.349 | 0.0148 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; risk improvement -0.01 < 0.25; spectral band shape worsened by 0.0614 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 4.91 | centroid | 0.12s | 837.4 Hz | 0.2212 | 0.102 | 0.014 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.08 < 0.25; spectral band shape worsened by 0.0797 |
| Band targeted sine-balanced-air 0.0078/0.002/0.0024 | 4.92 | centroid | 0.079s | 737.9 Hz | 0.2101 | 0.331 | 0.008 | 1x, risk sd 0 | risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0686 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 4.92 | centroid | 0.12s | 817 Hz | 0.2248 | 0.321 | 0.0033 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0833 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 4.93 | centroid | 0.12s | 771.7 Hz | 0.2124 | 0.38 | 0.0102 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.1 < 0.25; spectral band shape worsened by 0.0709 |
| High square stair | 4.94 | centroid | 0s | 882.7 Hz | 0.2525 | 0.085 | 0.0111 | 1x, risk sd 0 | risk improvement -0.11 < 0.25; centroid did not improve (-29.9 Hz); spectral band shape worsened by 0.111 |
| Band targeted sine-presence-air 0.0078/0.0032/0.0009 | 4.94 | centroid | 0.039s | 837.5 Hz | 0.2307 | 0.151 | 0.0095 | 1x, risk sd 0 | risk improvement -0.11 < 0.25; spectral band shape worsened by 0.0892 |
| Low RMS harmonic | 4.96 | centroid | 0s | 773.6 Hz | 0.2182 | 0.348 | 0.0105 | 1x, risk sd 0 | risk improvement -0.13 < 0.25; spectral band shape worsened by 0.0767 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0018 | 4.98 | centroid | 0.12s | 881.5 Hz | 0.2465 | 0.134 | 0.0056 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.15 < 0.25; centroid did not improve (-28.7 Hz); spectral band shape worsened by 0.105 |
| Sparkle low RMS centered ZCR | 4.99 | centroid | 0.101s | 815.8 Hz | 0.2237 | 0.355 | 0.0032 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0822 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 4.99 | centroid | 0.12s | 780.9 Hz | 0.2116 | 0.37 | 0.0154 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0701 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 5 | centroid | 0.079s | 824.1 Hz | 0.2351 | 0.354 | 0.0057 | 1x, risk sd 0 | risk improvement -0.17 < 0.25; spectral band shape worsened by 0.0936 |
| Band targeted sine-balanced-air 0.0078/0.0032/0.0009 | 5 | centroid | 0.12s | 838.6 Hz | 0.2314 | 0.31 | 0.0064 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.17 < 0.25; spectral band shape worsened by 0.0899 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.01 | centroid | 0.12s | 760.1 Hz | 0.2143 | 0.391 | 0.0029 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.18 < 0.25; spectral band shape worsened by 0.0728 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.02 | centroid | 0.12s | 800.5 Hz | 0.2122 | 0.38 | 0.002 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.19 < 0.25; spectral band shape worsened by 0.0707 |
| Sparkle low RMS square edge | 5.03 | centroid | 0.11s | 789.9 Hz | 0.2316 | 0.406 | 0.0016 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.2 < 0.25; spectral band shape worsened by 0.0901 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0018 | 5.07 | centroid | 0.12s | 832.6 Hz | 0.2314 | 0.321 | 0.002 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.24 < 0.25; spectral band shape worsened by 0.0899 |
| Sparkle short tail | 5.09 | centroid | 0.101s | 867.6 Hz | 0.2458 | 0.396 | 0.0039 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement -0.26 < 0.25; centroid did not improve (-14.8 Hz); spectral band shape worsened by 0.1043 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5.09 | centroid | 0.12s | 820.4 Hz | 0.2316 | 0.412 | 0.0011 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.26 < 0.25; spectral band shape worsened by 0.0901 |
| Sparkle with light noise | 5.09 | centroid | 0.14s | 759.5 Hz | 0.2036 | 0.446 | 0.0031 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; risk improvement -0.26 < 0.25; spectral band shape worsened by 0.0621 |
| Thin bright square quiet tail | 5.1 | centroid | 0s | 806.7 Hz | 0.2128 | 0.39 | 0.0231 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0713 |
| Band targeted soft-square-presence 0.0078/0.0032/0.0009 | 5.1 | centroid | 0.12s | 926.2 Hz | 0.2626 | 0.086 | 0.0064 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.27 < 0.25; centroid did not improve (-73.4 Hz); spectral band shape worsened by 0.1211 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 5.11 | centroid | 0.12s | 850.2 Hz | 0.232 | 0.362 | 0.0018 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.28 < 0.25; spectral band shape worsened by 0.0905 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.12 | centroid | 0.01s | 856.3 Hz | 0.2268 | 0.328 | 0.0086 | 1x, risk sd 0 | risk improvement -0.29 < 0.25; centroid did not improve (-3.5 Hz); spectral band shape worsened by 0.0853 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 5.13 | centroid | 0.12s | 849.8 Hz | 0.241 | 0.334 | 0.0034 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.3 < 0.25; spectral band shape worsened by 0.0995 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0013 | 5.15 | centroid | 0.1s | 846.2 Hz | 0.2302 | 0.406 | 0.0025 | 1x, risk sd 0 | duration gap 0.1s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0887 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 5.17 | centroid | 0.089s | 876.6 Hz | 0.2404 | 0.376 | 0.0068 | 1x, risk sd 0 | duration gap 0.089s > 0.08s; risk improvement -0.34 < 0.25; centroid did not improve (-23.8 Hz); spectral band shape worsened by 0.0989 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5.17 | centroid | 0.12s | 863.1 Hz | 0.2357 | 0.356 | 0.0024 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.34 < 0.25; centroid did not improve (-10.3 Hz); spectral band shape worsened by 0.0942 |
| Thin bright square micro held | 5.2 | centroid | 0s | 844.6 Hz | 0.2386 | 0.356 | 0.0233 | 1x, risk sd 0 | risk improvement -0.37 < 0.25; spectral band shape worsened by 0.0971 |
| Staccato bright | 5.21 | centroid | 0.06s | 874.2 Hz | 0.2419 | 0.431 | 0.0012 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; centroid did not improve (-21.4 Hz); spectral band shape worsened by 0.1004 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 5.21 | centroid | 0.069s | 888.7 Hz | 0.2498 | 0.313 | 0.0114 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; centroid did not improve (-35.9 Hz); spectral band shape worsened by 0.1083 |
| Band targeted soft-square-presence 0.0078/0.002/0.0024 | 5.22 | centroid | 0.039s | 927.4 Hz | 0.2512 | 0.252 | 0.0093 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; centroid did not improve (-74.6 Hz); spectral band shape worsened by 0.1097 |
| Low RMS square edge | 5.23 | centroid | 0.11s | 861.8 Hz | 0.2351 | 0.383 | 0.0113 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.4 < 0.25; centroid did not improve (-9 Hz); spectral band shape worsened by 0.0936 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5.25 | centroid | 0.12s | 874 Hz | 0.2414 | 0.379 | 0.0074 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.42 < 0.25; centroid did not improve (-21.2 Hz); spectral band shape worsened by 0.0999 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.25 | centroid | 0.12s | 876.1 Hz | 0.2472 | 0.402 | 0.0092 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.42 < 0.25; centroid did not improve (-23.3 Hz); spectral band shape worsened by 0.1057 |
| Octave chime thin | 5.26 | centroid | 0.06s | 886.7 Hz | 0.2382 | 0.36 | 0.0126 | 1x, risk sd 0 | risk improvement -0.43 < 0.25; centroid did not improve (-33.9 Hz); spectral band shape worsened by 0.0967 |
| Sparkle low RMS | 5.27 | centroid | 0.06s | 874.3 Hz | 0.2513 | 0.42 | 0.0042 | 1x, risk sd 0 | risk improvement -0.44 < 0.25; centroid did not improve (-21.5 Hz); spectral band shape worsened by 0.1098 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0018 | 5.27 | centroid | 0.12s | 881 Hz | 0.2424 | 0.402 | 0.0005 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.44 < 0.25; centroid did not improve (-28.2 Hz); spectral band shape worsened by 0.1009 |
| Thin bright square long low held | 5.28 | centroid | 0.06s | 834.5 Hz | 0.2189 | 0.277 | 0.0431 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; spectral band shape worsened by 0.0774 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 5.28 | centroid | 0.06s | 893.5 Hz | 0.2356 | 0.339 | 0.0115 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; centroid did not improve (-40.7 Hz); spectral band shape worsened by 0.0941 |
| Low RMS brighter | 5.3 | centroid | 0.06s | 932 Hz | 0.2653 | 0.283 | 0.0055 | 1x, risk sd 0 | risk improvement -0.47 < 0.25; centroid did not improve (-79.2 Hz); spectral band shape worsened by 0.1238 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 5.33 | centroid | 0.12s | 912.1 Hz | 0.2462 | 0.404 | 0.0037 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.5 < 0.25; centroid did not improve (-59.3 Hz); spectral band shape worsened by 0.1047 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5.34 | centroid | 0.12s | 915.8 Hz | 0.2532 | 0.406 | 0.0016 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.51 < 0.25; centroid did not improve (-63 Hz); spectral band shape worsened by 0.1117 |
| Thin bright square soft attack held | 5.35 | centroid | 0.101s | 935.3 Hz | 0.2553 | 0.125 | 0.0345 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement -0.52 < 0.25; centroid did not improve (-82.5 Hz); spectral band shape worsened by 0.1138 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.37 | centroid | 0.039s | 908.7 Hz | 0.2603 | 0.406 | 0.0059 | 1x, risk sd 0 | risk improvement -0.54 < 0.25; centroid did not improve (-55.9 Hz); spectral band shape worsened by 0.1188 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5.37 | centroid | 0.099s | 913.5 Hz | 0.2563 | 0.395 | 0.011 | 1x, risk sd 0 | duration gap 0.099s > 0.08s; risk improvement -0.54 < 0.25; centroid did not improve (-60.7 Hz); spectral band shape worsened by 0.1148 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 5.38 | centroid | 0.08s | 926 Hz | 0.2596 | 0.382 | 0.0097 | 1x, risk sd 0 | risk improvement -0.55 < 0.25; centroid did not improve (-73.2 Hz); spectral band shape worsened by 0.1181 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 5.38 | centroid | 0.12s | 932.8 Hz | 0.2607 | 0.379 | 0.0025 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.55 < 0.25; centroid did not improve (-80 Hz); spectral band shape worsened by 0.1192 |

## Next Step

Promote the recommended cue spec into the Aurora application audio theme, then run the full audio theme comparison and event-gap analysis.

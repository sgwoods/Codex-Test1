# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:52:29.771Z`
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
- Measured best: `sparkle-noise-light`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Worst segment | Exact roles | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square top | 4.24 | body 6.69 | 1/3 | centroid | 0.121s | 672.3 Hz | 0.1217 | 0.387 | 0.1113 | 1x, risk sd 0 | duration gap 0.121s > 0.08s |
| Thin bright square held | 4.39 | body 6.81 | 1/3 | centroid | 0.05s | 613.2 Hz | 0.1342 | 0.367 | 0.1437 | 1x, risk sd 0 | RMS worsened by 0.0365 |
| Thin bright square quiet held | 4.43 | body 6.41 | 1/3 | rolloff | 0.121s | 573 Hz | 0.1303 | 0.463 | 0.1299 | 1x, risk sd 0 | duration gap 0.121s > 0.08s; RMS worsened by 0.0227 |
| Thin bright square balanced held | 4.44 | body 6.85 | 2/3 | centroid | 0.06s | 724.8 Hz | 0.1377 | 0.362 | 0.1211 | 1x, risk sd 0 | RMS worsened by 0.0139 |
| Thin bright square long low held | 4.57 | body 6.28 | 1/3 | centroid | 0.28s | 669.1 Hz | 0.1334 | 0.453 | 0.0661 | 1x, risk sd 0 | duration gap 0.28s > 0.08s |
| Thin bright triangle ladder | 4.68 | body 7.87 | 1/3 | centroid | 0.001s | 838.1 Hz | 0.1334 | 0.296 | 0.1157 | 1x, risk sd 0 | segment risk improvement 0.21 < 0.35 |
| Sparkle short tail | 4.68 | body 7.08 | 1/3 | centroid | 0.06s | 769.9 Hz | 0.2278 | 0.154 | 0.0029 | 1x, risk sd 0 | spectral band shape worsened by 0.079 |
| Segmented 784/1047/2637 0.18/0.26/0.09 | 4.68 | body 7.08 | 3/3 | centroid | 0.12s | 769.7 Hz | 0.2119 | 0.091 | 0.0113 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0631 |
| Thin bright square soft held | 4.69 | body 7.2 | 1/3 | centroid | 0.05s | 744.6 Hz | 0.1274 | 0.292 | 0.1435 | 1x, risk sd 0 | RMS worsened by 0.0363 |
| Sparkle with light noise | 4.71 | body 5.59 | 3/3 | centroid | 0.06s | 742.2 Hz | 0.2097 | 0.28 | 0.0104 | 1x, risk sd 0 | spectral band shape worsened by 0.0609 |
| Sparkle low RMS | 4.8 | body 7.61 | 2/3 | centroid | 0.06s | 788 Hz | 0.2261 | 0.1 | 0.0113 | 1x, risk sd 0 | spectral band shape worsened by 0.0773 |
| Current Aurora baseline | 4.82 | body 8.08 | 1/3 | centroid | 0.06s | 862.6 Hz | 0.1488 | 0.406 | 0.1072 | 1x, risk sd 0 | baseline |
| Segmented 520/1047/2349 0.14/0.22/0.13 | 4.87 | body 6.54 | 2/3 | centroid | 0.079s | 756 Hz | 0.2056 | 0.391 | 0.0092 | 1x, risk sd 0 | spectral band shape worsened by 0.0568 |
| Segmented 660/1047/2637 0.18/0.26/0.09 | 4.87 | tail 6.17 | 3/3 | centroid | 0.12s | 889.6 Hz | 0.2474 | 0.04 | 0.0031 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-27 Hz); spectral band shape worsened by 0.0986 |
| Thin bright square micro held | 4.88 | body 7.07 | 3/3 | centroid | 0s | 835.2 Hz | 0.2331 | 0.034 | 0.02 | 1x, risk sd 0 | spectral band shape worsened by 0.0843 |
| Segmented 660/1047/2637 0.18/0.26/0.09 | 4.93 | tail 6.38 | 2/3 | centroid | 0.12s | 813.6 Hz | 0.2238 | 0.24 | 0.0084 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.075 |
| Segmented 520/1047/2637 0.16/0.24/0.11 | 4.99 | body 6.59 | 2/3 | centroid | 0.12s | 794.1 Hz | 0.2122 | 0.394 | 0.0064 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0634 |
| Segmented 520/1047/2637 0.16/0.24/0.11 | 4.99 | body 6.49 | 3/3 | centroid | 0.12s | 782 Hz | 0.2135 | 0.39 | 0.0049 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0647 |
| Segmented 660/1047/2637 0.16/0.24/0.11 | 5 | body 7.72 | 2/3 | centroid | 0.069s | 842.6 Hz | 0.2373 | 0.356 | 0.0038 | 1x, risk sd 0 | spectral band shape worsened by 0.0885 |
| Segmented 520/1047/2637 0.14/0.22/0.13 | 5 | body 6.48 | 3/3 | centroid | 0.12s | 782.4 Hz | 0.2268 | 0.39 | 0.0024 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.078 |
| Segmented 520/1047/2637 0.14/0.22/0.13 | 5.02 | body 6.07 | 3/3 | centroid | 0.12s | 859.6 Hz | 0.2336 | 0.222 | 0.0029 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0848 |
| Sparkle low RMS square edge | 5.03 | tail 6.16 | 2/3 | centroid | 0.091s | 918.7 Hz | 0.2571 | 0.066 | 0.0121 | 1x, risk sd 0 | duration gap 0.091s > 0.08s; centroid did not improve (-56.1 Hz); spectral band shape worsened by 0.1083 |
| Segmented 520/1047/2637 0.14/0.26/0.09 | 5.03 | tail 6.74 | 3/3 | centroid | 0.12s | 922.6 Hz | 0.252 | 0.139 | 0.0031 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-60 Hz); spectral band shape worsened by 0.1032 |
| Low RMS harmonic | 5.05 | body 7.32 | 2/3 | centroid | 0s | 776.5 Hz | 0.2103 | 0.404 | 0.0123 | 1x, risk sd 0 | spectral band shape worsened by 0.0615 |
| Segmented 660/1047/2637 0.14/0.22/0.13 | 5.05 | body 8.21 | 1/3 | centroid | 0s | 877.4 Hz | 0.2399 | 0.237 | 0.0138 | 1x, risk sd 0 | segment risk improvement -0.13 < 0.35; centroid did not improve (-14.8 Hz); spectral band shape worsened by 0.0911 |
| Thin bright square quiet tail | 5.06 | body 7.1 | 2/3 | centroid | 0s | 763.2 Hz | 0.2079 | 0.395 | 0.0265 | 1x, risk sd 0 | spectral band shape worsened by 0.0591 |
| Segmented 520/1047/2349 0.18/0.26/0.09 | 5.06 | body 7.29 | 2/3 | centroid | 0.06s | 767.1 Hz | 0.2288 | 0.379 | 0.012 | 1x, risk sd 0 | spectral band shape worsened by 0.08 |
| Segmented 784/1047/2637 0.16/0.24/0.11 | 5.07 | tail 6.64 | 3/3 | centroid | 0.12s | 825.4 Hz | 0.2272 | 0.316 | 0.0031 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0784 |
| Segmented 660/1047/2637 0.14/0.26/0.09 | 5.09 | tail 5.51 | 3/3 | centroid | 0.12s | 839.2 Hz | 0.2268 | 0.36 | 0.0018 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.078 |
| Thin bright square split low held | 5.12 | body 8.24 | 1/3 | centroid | 0.049s | 813.2 Hz | 0.2251 | 0.376 | 0.0176 | 1x, risk sd 0 | segment risk improvement -0.16 < 0.35; spectral band shape worsened by 0.0763 |
| Segmented 520/1047/2349 0.14/0.26/0.09 | 5.12 | body 7.41 | 2/3 | centroid | 0.07s | 883.9 Hz | 0.2446 | 0.25 | 0.0047 | 1x, risk sd 0 | centroid did not improve (-21.3 Hz); spectral band shape worsened by 0.0958 |
| Staccato bright | 5.15 | body 6.9 | 2/3 | centroid | 0.06s | 872.5 Hz | 0.253 | 0.385 | 0.0038 | 1x, risk sd 0 | centroid did not improve (-9.9 Hz); spectral band shape worsened by 0.1042 |
| Sparkle low RMS centered ZCR | 5.19 | body 6.16 | 2/3 | centroid | 0.121s | 856.6 Hz | 0.2398 | 0.278 | 0.0192 | 1x, risk sd 0 | duration gap 0.121s > 0.08s; spectral band shape worsened by 0.091 |
| Low RMS brighter | 5.2 | tail 6.95 | 3/3 | centroid | 0.06s | 842.3 Hz | 0.2516 | 0.425 | 0.0079 | 1x, risk sd 0 | spectral band shape worsened by 0.1028 |
| Low RMS square edge | 5.24 | body 7.12 | 2/3 | centroid | 0.07s | 876.2 Hz | 0.2423 | 0.403 | 0.0079 | 1x, risk sd 0 | centroid did not improve (-13.6 Hz); spectral band shape worsened by 0.0935 |
| Segmented 660/1047/2637 0.16/0.24/0.11 | 5.24 | body 7.09 | 2/3 | centroid | 0.09s | 877.7 Hz | 0.2383 | 0.365 | 0.0046 | 1x, risk sd 0 | duration gap 0.09s > 0.08s; centroid did not improve (-15.1 Hz); spectral band shape worsened by 0.0895 |
| Segmented 520/1047/2637 0.14/0.26/0.09 | 5.26 | body 8.22 | 2/3 | centroid | 0.12s | 908.2 Hz | 0.2485 | 0.385 | 0.0014 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.14 < 0.35; centroid did not improve (-45.6 Hz); spectral band shape worsened by 0.0997 |
| Octave chime thin | 5.27 | body 7.28 | 1/3 | centroid | 0.12s | 838.2 Hz | 0.231 | 0.449 | 0.017 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0822 |
| Segmented 520/1047/2637 0.18/0.26/0.09 | 5.28 | body 7.77 | 2/3 | centroid | 0.119s | 914.7 Hz | 0.2485 | 0.32 | 0.0112 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; segment risk improvement 0.31 < 0.35; centroid did not improve (-52.1 Hz); spectral band shape worsened by 0.0997 |
| High square stair | 5.29 | body 6.7 | 2/3 | centroid | 0.091s | 894.4 Hz | 0.2524 | 0.383 | 0.0078 | 1x, risk sd 0 | duration gap 0.091s > 0.08s; centroid did not improve (-31.8 Hz); spectral band shape worsened by 0.1036 |
| Segmented 520/1320/2637 0.14/0.22/0.13 | 5.3 | body 7.76 | 3/3 | centroid | 0.12s | 898.1 Hz | 0.2518 | 0.34 | 0.0081 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.32 < 0.35; centroid did not improve (-35.5 Hz); spectral band shape worsened by 0.103 |
| Segmented 784/1047/2637 0.14/0.22/0.13 | 5.31 | body 8.17 | 2/3 | centroid | 0.12s | 917.8 Hz | 0.2467 | 0.417 | 0.0021 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.09 < 0.35; centroid did not improve (-55.2 Hz); spectral band shape worsened by 0.0979 |
| Segmented 520/1047/2349 0.16/0.24/0.11 | 5.32 | body 7.8 | 3/3 | centroid | 0.12s | 902.5 Hz | 0.2472 | 0.404 | 0.011 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.28 < 0.35; centroid did not improve (-39.9 Hz); spectral band shape worsened by 0.0984 |
| Segmented 660/1047/2637 0.14/0.26/0.09 | 5.33 | tail 6.95 | 3/3 | centroid | 0.12s | 907.8 Hz | 0.2502 | 0.435 | 0.0014 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-45.2 Hz); spectral band shape worsened by 0.1014 |
| Segmented 660/1047/2637 0.14/0.22/0.13 | 5.34 | body 7.35 | 2/3 | centroid | 0.069s | 893.9 Hz | 0.2442 | 0.352 | 0.0114 | 1x, risk sd 0 | centroid did not improve (-31.3 Hz); spectral band shape worsened by 0.0954 |
| Segmented 520/1047/2637 0.18/0.26/0.09 | 5.35 | body 7.6 | 3/3 | centroid | 0.12s | 903.3 Hz | 0.2574 | 0.384 | 0.0094 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-40.7 Hz); spectral band shape worsened by 0.1086 |
| Thin bright square soft attack held | 5.6 | body 7.17 | 2/3 | centroid | 0.131s | 943 Hz | 0.2505 | 0.367 | 0.0311 | 1x, risk sd 0 | duration gap 0.131s > 0.08s; centroid did not improve (-80.4 Hz); spectral band shape worsened by 0.1017 |

## Next Step

Use the segmented-family result to retune onset/body/tail synthesis parameters, then run another bounded segmented sweep before changing runtime audio.

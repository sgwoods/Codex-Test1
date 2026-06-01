# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:56:14.641Z`
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
| Segment-air 988/2093/2349 0.238/0.318 | 4.74 | tail 5.36 | 3/3 | centroid | 0.12s | 796.4 Hz | 0.216 | 0.14 | 0.0121 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0631 |
| Sparkle with light noise | 4.81 | body 5.56 | 3/3 | centroid | 0.06s | 774.1 Hz | 0.2103 | 0.307 | 0.0123 | 1x, risk sd 0 | spectral band shape worsened by 0.0574 |
| Segment-air 1175/2093/3136 0.238/0.318 | 4.91 | tail 5.83 | 3/3 | centroid | 0.11s | 792.8 Hz | 0.2148 | 0.335 | 0.0106 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; spectral band shape worsened by 0.0619 |
| Thin bright square long low held | 4.59 | body 5.84 | 1/3 | centroid | 0.27s | 762.1 Hz | 0.1479 | 0.22 | 0.0719 | 1x, risk sd 0 | duration gap 0.27s > 0.08s |
| Segment-air 1175/2637/2349 0.238/0.318 | 4.88 | onset 5.88 | 3/3 | centroid | 0.12s | 761.9 Hz | 0.2167 | 0.26 | 0.0116 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0638 |
| High square stair | 5.27 | onset 5.95 | 3/3 | centroid | 0s | 932.8 Hz | 0.2587 | 0.285 | 0.0086 | 1x, risk sd 0 | centroid did not improve (-39.9 Hz); spectral band shape worsened by 0.1058 |
| Segment-air 1175/2093/2349 0.238/0.318 | 4.77 | tail 6.04 | 3/3 | centroid | 0.12s | 808.7 Hz | 0.2222 | 0.117 | 0.0041 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0693 |
| Segment-air 1175/2637/3136 0.238/0.318 | 4.84 | onset 6.07 | 3/3 | centroid | 0.001s | 760.1 Hz | 0.2151 | 0.286 | 0.0001 | 1x, risk sd 0 | spectral band shape worsened by 0.0622 |
| Segment-air 1175/2093/3136 0.238/0.318 | 5.03 | onset 6.12 | 2/3 | centroid | 0.059s | 855.9 Hz | 0.2336 | 0.263 | 0.0009 | 1x, risk sd 0 | spectral band shape worsened by 0.0807 |
| Staccato bright | 5.07 | tail 6.28 | 3/3 | centroid | 0.06s | 887.3 Hz | 0.2505 | 0.288 | 0.0028 | 1x, risk sd 0 | spectral band shape worsened by 0.0976 |
| Segment-air 1175/3136/3136 0.238/0.318 | 4.93 | body 6.3 | 2/3 | centroid | 0.12s | 811.9 Hz | 0.2268 | 0.297 | 0.0032 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0739 |
| Segment-air 1175/2093/2349 0.238/0.318 | 4.92 | tail 6.33 | 3/3 | centroid | 0.12s | 802.4 Hz | 0.2366 | 0.347 | 0.0005 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0837 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.05 | body 6.33 | 3/3 | centroid | 0.12s | 836.8 Hz | 0.2283 | 0.367 | 0.002 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0754 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.09 | tail 6.4 | 2/3 | centroid | 0.12s | 835.1 Hz | 0.2369 | 0.309 | 0.0003 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.084 |
| Low RMS harmonic | 4.56 | body 6.43 | 2/3 | centroid | 0.07s | 640.3 Hz | 0.1968 | 0.218 | 0.0128 | 1x, risk sd 0 | spectral band shape worsened by 0.0439 |
| Segment-air 1175/2637/3136 0.238/0.318 | 5.17 | tail 6.44 | 3/3 | centroid | 0.12s | 868.3 Hz | 0.2481 | 0.391 | 0.0016 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0952 |
| Segment-air 1175/2637/3136 0.238/0.318 | 4.83 | tail 6.45 | 3/3 | centroid | 0.12s | 843 Hz | 0.2344 | 0.158 | 0.0008 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0815 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.04 | body 6.45 | 2/3 | centroid | 0.12s | 810.6 Hz | 0.2211 | 0.378 | 0.0034 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0682 |
| Thin bright square balanced held | 4.28 | tail 6.48 | 2/3 | centroid | 0.06s | 722.5 Hz | 0.1375 | 0.217 | 0.1207 | 1x, risk sd 0 | RMS worsened by 0.0137 |
| Segment-air 988/2093/2349 0.238/0.318 | 5.2 | tail 6.49 | 3/3 | centroid | 0.12s | 851 Hz | 0.252 | 0.393 | 0.0042 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0991 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.04 | body 6.51 | 2/3 | centroid | 0.031s | 805.7 Hz | 0.2257 | 0.394 | 0.0022 | 1x, risk sd 0 | spectral band shape worsened by 0.0728 |
| Thin bright square split low held | 5.16 | onset 6.55 | 2/3 | centroid | 0.039s | 835 Hz | 0.2243 | 0.381 | 0.0173 | 1x, risk sd 0 | spectral band shape worsened by 0.0714 |
| Sparkle low RMS square edge | 5.21 | body 6.55 | 2/3 | centroid | 0.06s | 867.1 Hz | 0.2508 | 0.361 | 0.0105 | 1x, risk sd 0 | spectral band shape worsened by 0.0979 |
| Segment-air 988/2093/2349 0.238/0.318 | 5.31 | tail 6.65 | 3/3 | centroid | 0.12s | 932.1 Hz | 0.2558 | 0.358 | 0.0051 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-39.2 Hz); spectral band shape worsened by 0.1029 |
| Segment-air 1175/2637/2349 0.238/0.318 | 5.25 | tail 6.7 | 2/3 | centroid | 0.12s | 881 Hz | 0.25 | 0.366 | 0.0069 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0971 |
| Thin bright square top | 4.25 | body 6.84 | 1/3 | centroid | 0.111s | 666.7 Hz | 0.1214 | 0.368 | 0.1132 | 1x, risk sd 0 | duration gap 0.111s > 0.08s |
| Segment-air 1175/2637/2349 0.238/0.318 | 4.64 | body 6.87 | 2/3 | centroid | 0.119s | 775.4 Hz | 0.2122 | 0.071 | 0.0077 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; spectral band shape worsened by 0.0593 |
| Segment-air 988/2637/2349 0.238/0.318 | 5.13 | body 6.92 | 2/3 | centroid | 0.069s | 880.7 Hz | 0.2382 | 0.222 | 0.0092 | 1x, risk sd 0 | spectral band shape worsened by 0.0853 |
| Segment-air 1175/2093/2349 0.238/0.318 | 4.99 | body 6.97 | 2/3 | centroid | 0.06s | 807.9 Hz | 0.2244 | 0.292 | 0.0051 | 1x, risk sd 0 | spectral band shape worsened by 0.0715 |
| Segment-air 1175/2093/4186 0.238/0.318 | 4.8 | body 6.98 | 1/3 | centroid | 0.06s | 751.3 Hz | 0.2133 | 0.232 | 0.0043 | 1x, risk sd 0 | spectral band shape worsened by 0.0604 |
| Sparkle low RMS | 5.05 | body 7.02 | 2/3 | centroid | 0.06s | 818.6 Hz | 0.2263 | 0.279 | 0.0112 | 1x, risk sd 0 | spectral band shape worsened by 0.0734 |
| Thin bright square quiet tail | 4.81 | body 7.04 | 2/3 | centroid | 0s | 769.7 Hz | 0.2079 | 0.165 | 0.0266 | 1x, risk sd 0 | spectral band shape worsened by 0.055 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.01 | body 7.04 | 2/3 | centroid | 0.069s | 829.8 Hz | 0.2301 | 0.344 | 0.0058 | 1x, risk sd 0 | spectral band shape worsened by 0.0772 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.45 | tail 7.1 | 3/3 | centroid | 0.12s | 925 Hz | 0.2576 | 0.418 | 0.0076 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; centroid did not improve (-32.1 Hz); spectral band shape worsened by 0.1047 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.01 | body 7.18 | 2/3 | centroid | 0.12s | 821.2 Hz | 0.2254 | 0.282 | 0.011 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.28 < 0.35; spectral band shape worsened by 0.0725 |
| Segment-air 1175/2637/2349 0.238/0.318 | 5.07 | body 7.2 | 1/3 | centroid | 0.06s | 849.1 Hz | 0.2288 | 0.346 | 0.0056 | 1x, risk sd 0 | segment risk improvement 0.26 < 0.35; spectral band shape worsened by 0.0759 |
| Sparkle low RMS centered ZCR | 5.01 | body 7.22 | 1/3 | centroid | 0.18s | 852.9 Hz | 0.2331 | 0.196 | 0.0171 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; segment risk improvement 0.24 < 0.35; spectral band shape worsened by 0.0802 |
| Octave chime thin | 5.19 | body 7.24 | 1/3 | centroid | 0.12s | 845.9 Hz | 0.2262 | 0.351 | 0.0166 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.22 < 0.35; spectral band shape worsened by 0.0733 |
| Thin bright square quiet held | 4.46 | body 7.25 | 1/3 | centroid | 0.11s | 683.1 Hz | 0.1427 | 0.296 | 0.1311 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; segment risk improvement 0.21 < 0.35; RMS worsened by 0.0241 |
| Segment-air 1175/3136/3136 0.238/0.318 | 5.1 | tail 7.25 | 2/3 | centroid | 0.12s | 885.9 Hz | 0.2485 | 0.182 | 0.006 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.21 < 0.35; spectral band shape worsened by 0.0956 |
| Segment-air 988/2093/2349 0.238/0.318 | 4.82 | body 7.26 | 3/3 | centroid | 0.12s | 702.2 Hz | 0.2039 | 0.364 | 0.0107 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.2 < 0.35; spectral band shape worsened by 0.051 |
| Segment-air 1175/2637/2349 0.238/0.318 | 4.93 | body 7.32 | 2/3 | centroid | 0.12s | 844.7 Hz | 0.2283 | 0.235 | 0.0036 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.14 < 0.35; spectral band shape worsened by 0.0754 |
| Segment-air 988/2093/2349 0.238/0.318 | 5.08 | body 7.33 | 2/3 | centroid | 0.119s | 880.2 Hz | 0.2479 | 0.299 | 0.0012 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; segment risk improvement 0.13 < 0.35; spectral band shape worsened by 0.095 |
| Sparkle short tail | 5.06 | body 7.35 | 1/3 | centroid | 0.12s | 875.9 Hz | 0.2428 | 0.34 | 0.0004 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.11 < 0.35; spectral band shape worsened by 0.0899 |
| Segment-air 1175/2093/3136 0.238/0.318 | 4.93 | body 7.39 | 2/3 | centroid | 0.12s | 876.8 Hz | 0.2424 | 0.114 | 0.0003 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.07 < 0.35; spectral band shape worsened by 0.0895 |
| Segment-air 1175/2093/4186 0.238/0.318 | 5.24 | tail 7.42 | 3/3 | centroid | 0.12s | 874.6 Hz | 0.245 | 0.419 | 0.0013 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement 0.04 < 0.35; spectral band shape worsened by 0.0921 |
| Current Aurora baseline | 4.88 | body 7.46 | 1/3 | centroid | 0.06s | 892.9 Hz | 0.1529 | 0.371 | 0.107 | 1x, risk sd 0 | baseline |
| Thin bright square micro held | 5.29 | body 7.46 | 3/3 | centroid | 0.05s | 862.4 Hz | 0.2326 | 0.359 | 0.0228 | 1x, risk sd 0 | segment risk improvement 0 < 0.35; spectral band shape worsened by 0.0797 |
| Thin bright square held | 4.72 | body 7.47 | 1/3 | centroid | 0.05s | 725.9 Hz | 0.1505 | 0.392 | 0.1429 | 1x, risk sd 0 | segment risk improvement -0.01 < 0.35; RMS worsened by 0.0359 |
| Segment-air 1175/2637/3136 0.238/0.318 | 5.25 | tail 7.47 | 2/3 | centroid | 0.119s | 852.5 Hz | 0.2515 | 0.402 | 0.0128 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; segment risk improvement -0.01 < 0.35; spectral band shape worsened by 0.0986 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.02 | body 7.5 | 2/3 | centroid | 0.12s | 811 Hz | 0.2243 | 0.362 | 0.001 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.04 < 0.35; spectral band shape worsened by 0.0714 |
| Thin bright square soft attack held | 5.57 | body 7.52 | 2/3 | centroid | 0.14s | 927 Hz | 0.247 | 0.34 | 0.0307 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; segment risk improvement -0.06 < 0.35; centroid did not improve (-34.1 Hz); spectral band shape worsened by 0.0941 |
| Thin bright square soft held | 4.49 | body 7.6 | 2/3 | centroid | 0.04s | 705.7 Hz | 0.1264 | 0.164 | 0.1344 | 1x, risk sd 0 | segment risk improvement -0.14 < 0.35; RMS worsened by 0.0274 |
| Low RMS square edge | 5.48 | body 7.61 | 1/3 | centroid | 0.22s | 920.9 Hz | 0.2545 | 0.45 | 0.0147 | 1x, risk sd 0 | duration gap 0.22s > 0.08s; segment risk improvement -0.15 < 0.35; centroid did not improve (-28 Hz); spectral band shape worsened by 0.1016 |
| Segment-air 1175/2637/2349 0.238/0.318 | 5.13 | body 7.62 | 1/3 | centroid | 0.089s | 888.6 Hz | 0.2501 | 0.252 | 0.0107 | 1x, risk sd 0 | duration gap 0.089s > 0.08s; segment risk improvement -0.16 < 0.35; spectral band shape worsened by 0.0972 |
| Segment-air 1175/2637/2349 0.238/0.318 | 4.92 | body 7.66 | 2/3 | centroid | 0.12s | 793.9 Hz | 0.2295 | 0.348 | 0.0045 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.2 < 0.35; spectral band shape worsened by 0.0766 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.16 | body 7.67 | 2/3 | centroid | 0.12s | 864.8 Hz | 0.2397 | 0.395 | 0 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.21 < 0.35; spectral band shape worsened by 0.0868 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.12 | body 7.69 | 2/3 | centroid | 0.099s | 834.1 Hz | 0.2362 | 0.423 | 0.0044 | 1x, risk sd 0 | duration gap 0.099s > 0.08s; segment risk improvement -0.23 < 0.35; spectral band shape worsened by 0.0833 |
| Segment-air 1175/2637/3136 0.238/0.318 | 4.99 | body 7.71 | 1/3 | centroid | 0.01s | 832.2 Hz | 0.2321 | 0.282 | 0.0119 | 1x, risk sd 0 | segment risk improvement -0.25 < 0.35; spectral band shape worsened by 0.0792 |
| Segment-air 1175/2093/3136 0.238/0.318 | 5.24 | body 7.73 | 2/3 | centroid | 0.04s | 927 Hz | 0.2612 | 0.24 | 0.0067 | 1x, risk sd 0 | segment risk improvement -0.27 < 0.35; centroid did not improve (-34.1 Hz); spectral band shape worsened by 0.1083 |
| Segment-air 988/2637/2349 0.238/0.318 | 5.1 | body 7.78 | 3/3 | centroid | 0.12s | 923.2 Hz | 0.2535 | 0.135 | 0.0122 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.32 < 0.35; centroid did not improve (-30.3 Hz); spectral band shape worsened by 0.1006 |
| Segment-air 1175/2093/3136 0.238/0.318 | 5.07 | body 7.82 | 2/3 | centroid | 0.051s | 825.9 Hz | 0.2288 | 0.332 | 0.0121 | 1x, risk sd 0 | segment risk improvement -0.36 < 0.35; spectral band shape worsened by 0.0759 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.1 | body 7.83 | 2/3 | centroid | 0.12s | 869 Hz | 0.2374 | 0.383 | 0.0072 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.37 < 0.35; spectral band shape worsened by 0.0845 |
| Low RMS brighter | 5.38 | body 7.83 | 1/3 | centroid | 0.17s | 918.3 Hz | 0.2587 | 0.399 | 0.0011 | 1x, risk sd 0 | duration gap 0.17s > 0.08s; segment risk improvement -0.37 < 0.35; centroid did not improve (-25.4 Hz); spectral band shape worsened by 0.1058 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.39 | body 7.84 | 3/3 | centroid | 0.12s | 911.6 Hz | 0.261 | 0.403 | 0.0132 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.38 < 0.35; centroid did not improve (-18.7 Hz); spectral band shape worsened by 0.1081 |
| Segment-air 1175/2093/3136 0.238/0.318 | 5.19 | body 7.93 | 1/3 | centroid | 0.199s | 839.5 Hz | 0.2155 | 0.295 | 0.0207 | 1x, risk sd 0 | duration gap 0.199s > 0.08s; segment risk improvement -0.47 < 0.35; spectral band shape worsened by 0.0626 |
| Thin bright triangle ladder | 4.55 | body 7.98 | 1/3 | centroid | 0s | 805.9 Hz | 0.1301 | 0.183 | 0.1156 | 1x, risk sd 0 | segment risk improvement -0.52 < 0.35 |
| Segment-air 988/2093/3136 0.238/0.318 | 5.19 | body 8.19 | 2/3 | centroid | 0.08s | 879.3 Hz | 0.238 | 0.35 | 0.0108 | 1x, risk sd 0 | segment risk improvement -0.73 < 0.35; spectral band shape worsened by 0.0851 |
| Segment-air 988/2093/2349 0.238/0.318 | 5.24 | body 8.24 | 1/3 | centroid | 0.051s | 854.2 Hz | 0.2402 | 0.381 | 0.0136 | 1x, risk sd 0 | segment risk improvement -0.78 < 0.35; spectral band shape worsened by 0.0873 |
| Segment-air 1175/3136/2349 0.238/0.318 | 5.29 | body 8.4 | 2/3 | centroid | 0.12s | 898.9 Hz | 0.2513 | 0.388 | 0.0055 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; segment risk improvement -0.94 < 0.35; centroid did not improve (-6 Hz); spectral band shape worsened by 0.0984 |
| Segment-air 1175/2093/2349 0.238/0.318 | 5.28 | body 8.44 | 2/3 | centroid | 0.039s | 890.3 Hz | 0.254 | 0.367 | 0.0092 | 1x, risk sd 0 | segment risk improvement -0.98 < 0.35; spectral band shape worsened by 0.1011 |

## Next Step

Use the compact high-pass segment-air result to decide whether synthesized cue roles can satisfy both segmentation and band-shape gates, or whether this event needs a reference-clip/subclip playback strategy.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

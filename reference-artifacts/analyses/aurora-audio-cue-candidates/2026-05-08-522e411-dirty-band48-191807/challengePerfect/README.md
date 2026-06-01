# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:18:07.170Z`
Commit: `522e411`

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
- Measured best: `thin-bright-square-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square held | 4.41 | centroid | 0s | 619.5 Hz | 0.133 | 0.41 | 0.1435 | 1x, risk sd 0 | RMS worsened by 0.0376 |
| Thin bright square long low held | 4.43 | centroid | 0.32s | 672.3 Hz | 0.1397 | 0.324 | 0.0441 | 1x, risk sd 0 | duration gap 0.32s > 0.08s |
| Thin bright square top | 4.52 | centroid | 0.161s | 775.8 Hz | 0.1383 | 0.372 | 0.1137 | 1x, risk sd 0 | duration gap 0.161s > 0.08s |
| Thin bright square quiet held | 4.65 | centroid | 0.18s | 703.4 Hz | 0.1425 | 0.374 | 0.1322 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement 0.12 < 0.25; RMS worsened by 0.0263 |
| Thin bright square soft held | 4.69 | centroid | 0.041s | 776.8 Hz | 0.1321 | 0.244 | 0.1401 | 1x, risk sd 0 | risk improvement 0.08 < 0.25; RMS worsened by 0.0342 |
| Thin bright triangle ladder | 4.71 | centroid | 0.021s | 832.8 Hz | 0.1315 | 0.368 | 0.1153 | 1x, risk sd 0 | risk improvement 0.06 < 0.25 |
| Current Aurora baseline | 4.77 | centroid | 0.06s | 881 Hz | 0.1505 | 0.282 | 0.1059 | 1x, risk sd 0 | baseline |
| Thin bright square balanced held | 4.78 | centroid | 0.051s | 779.5 Hz | 0.1512 | 0.33 | 0.1338 | 1x, risk sd 0 | risk improvement -0.01 < 0.25; RMS worsened by 0.0279 |
| Low RMS harmonic | 4.79 | centroid | 0.05s | 719.8 Hz | 0.2107 | 0.375 | 0.0079 | 1x, risk sd 0 | risk improvement -0.02 < 0.25; spectral band shape worsened by 0.0602 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 4.79 | centroid | 0.18s | 773.2 Hz | 0.2098 | 0.089 | 0.0117 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.02 < 0.25; spectral band shape worsened by 0.0593 |
| Band targeted triangle-ladder-tail 5274/square/0.0016 | 4.8 | centroid | 0.18s | 764.9 Hz | 0.2094 | 0.206 | 0.0113 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.03 < 0.25; spectral band shape worsened by 0.0589 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 4.84 | centroid | 0.119s | 742.6 Hz | 0.2215 | 0.218 | 0.0181 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; risk improvement -0.07 < 0.25; spectral band shape worsened by 0.071 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0016 | 4.86 | centroid | 0.179s | 821.2 Hz | 0.2329 | 0.112 | 0.0065 | 1x, risk sd 0 | duration gap 0.179s > 0.08s; risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0824 |
| Sparkle with light noise | 4.87 | centroid | 0s | 725.8 Hz | 0.2064 | 0.41 | 0.0001 | 1x, risk sd 0 | risk improvement -0.1 < 0.25; spectral band shape worsened by 0.0559 |
| Sparkle low RMS centered ZCR | 4.87 | centroid | 0.06s | 859.9 Hz | 0.2327 | 0.193 | 0.0004 | 1x, risk sd 0 | risk improvement -0.1 < 0.25; spectral band shape worsened by 0.0822 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 4.87 | centroid | 0.18s | 852.5 Hz | 0.237 | 0.104 | 0.0004 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.1 < 0.25; spectral band shape worsened by 0.0865 |
| Thin bright square quiet tail | 4.9 | centroid | 0s | 736.1 Hz | 0.2051 | 0.324 | 0.0257 | 1x, risk sd 0 | risk improvement -0.13 < 0.25; spectral band shape worsened by 0.0546 |
| Band targeted triangle-ladder-tail 4699/square/0.0016 | 4.92 | centroid | 0.149s | 827.2 Hz | 0.2214 | 0.248 | 0.005 | 1x, risk sd 0 | duration gap 0.149s > 0.08s; risk improvement -0.15 < 0.25; spectral band shape worsened by 0.0709 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0016 | 4.92 | centroid | 0.18s | 884.8 Hz | 0.2387 | 0.081 | 0.0071 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.15 < 0.25; centroid did not improve (-3.8 Hz); spectral band shape worsened by 0.0882 |
| Staccato bright | 4.94 | centroid | 0.06s | 823.2 Hz | 0.2382 | 0.271 | 0.001 | 1x, risk sd 0 | risk improvement -0.17 < 0.25; spectral band shape worsened by 0.0877 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 4.96 | centroid | 0.16s | 855.6 Hz | 0.2314 | 0.173 | 0.0071 | 1x, risk sd 0 | duration gap 0.16s > 0.08s; risk improvement -0.19 < 0.25; spectral band shape worsened by 0.0809 |
| Band targeted triangle-ladder-tail 3520/triangle/0.0021 | 4.97 | centroid | 0.15s | 834.7 Hz | 0.2409 | 0.215 | 0.0064 | 1x, risk sd 0 | duration gap 0.15s > 0.08s; risk improvement -0.2 < 0.25; spectral band shape worsened by 0.0904 |
| Band targeted triangle-ladder-tail 4699/square/0.0016 | 4.99 | centroid | 0.179s | 803.5 Hz | 0.2212 | 0.373 | 0.0052 | 1x, risk sd 0 | duration gap 0.179s > 0.08s; risk improvement -0.22 < 0.25; spectral band shape worsened by 0.0707 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 5.01 | centroid | 0.18s | 815.4 Hz | 0.2245 | 0.359 | 0.0064 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.24 < 0.25; spectral band shape worsened by 0.074 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.02 | centroid | 0.18s | 869.6 Hz | 0.2382 | 0.16 | 0.0044 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.25 < 0.25; spectral band shape worsened by 0.0877 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 5.03 | centroid | 0.18s | 789.3 Hz | 0.2094 | 0.341 | 0.0057 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.26 < 0.25; spectral band shape worsened by 0.0589 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5.03 | centroid | 0.18s | 834.5 Hz | 0.2281 | 0.336 | 0.0047 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.26 < 0.25; spectral band shape worsened by 0.0776 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 5.04 | centroid | 0.09s | 850.4 Hz | 0.2367 | 0.252 | 0.0097 | 1x, risk sd 0 | duration gap 0.09s > 0.08s; risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0862 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 5.04 | centroid | 0.17s | 823 Hz | 0.2307 | 0.348 | 0.0022 | 1x, risk sd 0 | duration gap 0.17s > 0.08s; risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0802 |
| Band targeted triangle-ladder-tail 3520/triangle/0.0021 | 5.04 | centroid | 0.18s | 837.1 Hz | 0.2291 | 0.209 | 0.0124 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0786 |
| Band targeted triangle-ladder-tail 5274/square/0.0016 | 5.05 | centroid | 0s | 867.9 Hz | 0.2315 | 0.285 | 0.0042 | 1x, risk sd 0 | risk improvement -0.28 < 0.25; spectral band shape worsened by 0.081 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.05 | centroid | 0.16s | 830.9 Hz | 0.2269 | 0.345 | 0.0035 | 1x, risk sd 0 | duration gap 0.16s > 0.08s; risk improvement -0.28 < 0.25; spectral band shape worsened by 0.0764 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 5.05 | centroid | 0.18s | 893.8 Hz | 0.2535 | 0.096 | 0.0038 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.28 < 0.25; centroid did not improve (-12.8 Hz); spectral band shape worsened by 0.103 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.06 | centroid | 0.18s | 836 Hz | 0.2371 | 0.331 | 0.0002 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.29 < 0.25; spectral band shape worsened by 0.0866 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 5.06 | centroid | 0.18s | 922.1 Hz | 0.2562 | 0.055 | 0.0047 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.29 < 0.25; centroid did not improve (-41.1 Hz); spectral band shape worsened by 0.1057 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.07 | centroid | 0.149s | 857.1 Hz | 0.2254 | 0.247 | 0.005 | 1x, risk sd 0 | duration gap 0.149s > 0.08s; risk improvement -0.3 < 0.25; spectral band shape worsened by 0.0749 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.07 | centroid | 0.18s | 879.2 Hz | 0.2505 | 0.135 | 0.0098 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.3 < 0.25; spectral band shape worsened by 0.1 |
| Band targeted triangle-ladder-tail 3520/triangle/0.0021 | 5.08 | centroid | 0.059s | 813.5 Hz | 0.2221 | 0.384 | 0.0021 | 1x, risk sd 0 | risk improvement -0.31 < 0.25; spectral band shape worsened by 0.0716 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 5.08 | centroid | 0.18s | 777 Hz | 0.224 | 0.358 | 0.0108 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.31 < 0.25; spectral band shape worsened by 0.0735 |
| Band targeted triangle-ladder-tail 5274/square/0.0016 | 5.09 | centroid | 0.15s | 866.3 Hz | 0.2331 | 0.253 | 0.0067 | 1x, risk sd 0 | duration gap 0.15s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0826 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.09 | centroid | 0.18s | 838.4 Hz | 0.2301 | 0.35 | 0.0002 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0796 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0016 | 5.1 | centroid | 0.12s | 805.7 Hz | 0.2135 | 0.389 | 0.0037 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.33 < 0.25; spectral band shape worsened by 0.063 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.1 | centroid | 0.18s | 914.3 Hz | 0.2516 | 0.147 | 0.0072 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.33 < 0.25; centroid did not improve (-33.3 Hz); spectral band shape worsened by 0.1011 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.1 | centroid | 0.18s | 811.1 Hz | 0.2342 | 0.418 | 0.0008 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.33 < 0.25; spectral band shape worsened by 0.0837 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 5.11 | centroid | 0.18s | 854.1 Hz | 0.2338 | 0.25 | 0.0106 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0833 |
| Low RMS square edge | 5.11 | centroid | 0.21s | 797.9 Hz | 0.2336 | 0.447 | 0.0027 | 1x, risk sd 0 | duration gap 0.21s > 0.08s; risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0831 |
| Thin bright square split low held | 5.12 | centroid | 0.06s | 836.9 Hz | 0.2239 | 0.362 | 0.0168 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0734 |
| Sparkle low RMS square edge | 5.12 | centroid | 0.06s | 871.6 Hz | 0.2458 | 0.278 | 0.0105 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0953 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5.12 | centroid | 0.159s | 839.3 Hz | 0.2354 | 0.417 | 0.0034 | 1x, risk sd 0 | duration gap 0.159s > 0.08s; risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0849 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.12 | centroid | 0.18s | 887.8 Hz | 0.2513 | 0.194 | 0.0081 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.35 < 0.25; centroid did not improve (-6.8 Hz); spectral band shape worsened by 0.1008 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 5.14 | centroid | 0.019s | 859.1 Hz | 0.2275 | 0.354 | 0.0067 | 1x, risk sd 0 | risk improvement -0.37 < 0.25; spectral band shape worsened by 0.077 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.14 | centroid | 0.13s | 921.1 Hz | 0.2526 | 0.204 | 0.0069 | 1x, risk sd 0 | duration gap 0.13s > 0.08s; risk improvement -0.37 < 0.25; centroid did not improve (-40.1 Hz); spectral band shape worsened by 0.1021 |
| Octave chime thin | 5.14 | centroid | 0.14s | 788.8 Hz | 0.2265 | 0.354 | 0.0188 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; risk improvement -0.37 < 0.25; spectral band shape worsened by 0.076 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.14 | centroid | 0.18s | 847.2 Hz | 0.2286 | 0.372 | 0.0005 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.37 < 0.25; spectral band shape worsened by 0.0781 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 5.15 | centroid | 0.13s | 849.3 Hz | 0.2351 | 0.348 | 0.0071 | 1x, risk sd 0 | duration gap 0.13s > 0.08s; risk improvement -0.38 < 0.25; spectral band shape worsened by 0.0846 |
| High square stair | 5.16 | centroid | 0.001s | 900.1 Hz | 0.2575 | 0.229 | 0.0093 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; centroid did not improve (-19.1 Hz); spectral band shape worsened by 0.107 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 5.16 | centroid | 0.109s | 894 Hz | 0.2501 | 0.24 | 0.0088 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; risk improvement -0.39 < 0.25; centroid did not improve (-13 Hz); spectral band shape worsened by 0.0996 |
| Sparkle short tail | 5.2 | centroid | 0.1s | 880.3 Hz | 0.2415 | 0.398 | 0.0006 | 1x, risk sd 0 | duration gap 0.1s > 0.08s; risk improvement -0.43 < 0.25; spectral band shape worsened by 0.091 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5.2 | centroid | 0.18s | 849.2 Hz | 0.2316 | 0.389 | 0.0052 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.43 < 0.25; spectral band shape worsened by 0.0811 |
| Thin bright square micro held | 5.21 | centroid | 0.011s | 856.8 Hz | 0.2358 | 0.342 | 0.0237 | 1x, risk sd 0 | risk improvement -0.44 < 0.25; spectral band shape worsened by 0.0853 |
| Sparkle low RMS | 5.23 | centroid | 0.06s | 862.8 Hz | 0.2445 | 0.388 | 0.0135 | 1x, risk sd 0 | risk improvement -0.46 < 0.25; spectral band shape worsened by 0.094 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.23 | centroid | 0.18s | 884.8 Hz | 0.245 | 0.378 | 0.0066 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.46 < 0.25; centroid did not improve (-3.8 Hz); spectral band shape worsened by 0.0945 |
| Band targeted triangle-ladder-tail 4186/square/0.0016 | 5.33 | centroid | 0.18s | 914 Hz | 0.2498 | 0.415 | 0 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.56 < 0.25; centroid did not improve (-33 Hz); spectral band shape worsened by 0.0993 |
| Band targeted triangle-ladder-tail 5274/square/0.0016 | 5.35 | centroid | 0.179s | 890.1 Hz | 0.2511 | 0.396 | 0.0107 | 1x, risk sd 0 | duration gap 0.179s > 0.08s; risk improvement -0.58 < 0.25; centroid did not improve (-9.1 Hz); spectral band shape worsened by 0.1006 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.36 | centroid | 0.18s | 916.5 Hz | 0.2548 | 0.368 | 0.0117 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.59 < 0.25; centroid did not improve (-35.5 Hz); spectral band shape worsened by 0.1043 |
| Thin bright square soft attack held | 5.37 | centroid | 0.021s | 937.6 Hz | 0.2565 | 0.192 | 0.0342 | 1x, risk sd 0 | risk improvement -0.6 < 0.25; centroid did not improve (-56.6 Hz); spectral band shape worsened by 0.106 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5.37 | centroid | 0.18s | 919.7 Hz | 0.2519 | 0.377 | 0.0117 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.6 < 0.25; centroid did not improve (-38.7 Hz); spectral band shape worsened by 0.1014 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.37 | centroid | 0.18s | 912.8 Hz | 0.255 | 0.438 | 0.0003 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.6 < 0.25; centroid did not improve (-31.8 Hz); spectral band shape worsened by 0.1045 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.37 | centroid | 0.18s | 912.6 Hz | 0.2525 | 0.374 | 0.0111 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.6 < 0.25; centroid did not improve (-31.6 Hz); spectral band shape worsened by 0.102 |
| Low RMS brighter | 5.43 | centroid | 0.11s | 914.9 Hz | 0.2486 | 0.429 | 0.0043 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.66 < 0.25; centroid did not improve (-33.9 Hz); spectral band shape worsened by 0.0981 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.43 | centroid | 0.18s | 935.1 Hz | 0.2578 | 0.407 | 0.0019 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.66 < 0.25; centroid did not improve (-54.1 Hz); spectral band shape worsened by 0.1073 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

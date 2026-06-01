# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:16:26.231Z`
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
- Measured best: `thin-bright-square-balanced-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square top | 4.24 | centroid | 0.121s | 672.3 Hz | 0.1217 | 0.387 | 0.1113 | 1x, risk sd 0 | duration gap 0.121s > 0.08s |
| Thin bright square balanced held | 4.36 | centroid | 0.06s | 693.2 Hz | 0.1361 | 0.366 | 0.1211 | 1x, risk sd 0 | RMS worsened by 0.0139 |
| Thin bright square held | 4.45 | centroid | 0.06s | 629.4 Hz | 0.1377 | 0.382 | 0.1427 | 1x, risk sd 0 | RMS worsened by 0.0355 |
| Thin bright square quiet held | 4.48 | centroid | 0.08s | 680.5 Hz | 0.1444 | 0.354 | 0.1262 | 1x, risk sd 0 | RMS worsened by 0.019 |
| Low RMS harmonic | 4.62 | centroid | 0.06s | 773.9 Hz | 0.2111 | 0.106 | 0.0024 | 1x, risk sd 0 | risk improvement 0.2 < 0.25; spectral band shape worsened by 0.0623 |
| Thin bright square soft held | 4.69 | centroid | 0.05s | 744.6 Hz | 0.1274 | 0.292 | 0.1435 | 1x, risk sd 0 | risk improvement 0.13 < 0.25; RMS worsened by 0.0363 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0016 | 4.69 | centroid | 0.18s | 733 Hz | 0.2078 | 0.152 | 0.0079 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement 0.13 < 0.25; spectral band shape worsened by 0.059 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 4.7 | centroid | 0.18s | 768 Hz | 0.2146 | 0.145 | 0.0071 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement 0.12 < 0.25; spectral band shape worsened by 0.0658 |
| Thin bright square long low held | 4.7 | centroid | 0.27s | 743.1 Hz | 0.1457 | 0.445 | 0.0708 | 1x, risk sd 0 | duration gap 0.27s > 0.08s; risk improvement 0.12 < 0.25 |
| Sparkle short tail | 4.78 | centroid | 0.06s | 856.8 Hz | 0.249 | 0.161 | 0.0016 | 1x, risk sd 0 | risk improvement 0.04 < 0.25; spectral band shape worsened by 0.1002 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 4.81 | centroid | 0.18s | 834.8 Hz | 0.2288 | 0.122 | 0.0003 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement 0.01 < 0.25; spectral band shape worsened by 0.08 |
| Thin bright triangle ladder | 4.82 | centroid | 0s | 863.5 Hz | 0.1375 | 0.374 | 0.1159 | 1x, risk sd 0 | risk improvement 0 < 0.25; centroid did not improve (-0.9 Hz) |
| Current Aurora baseline | 4.82 | centroid | 0.06s | 862.6 Hz | 0.1488 | 0.406 | 0.1072 | 1x, risk sd 0 | baseline |
| Sparkle with light noise | 4.82 | centroid | 0.06s | 757.2 Hz | 0.2197 | 0.272 | 0.005 | 1x, risk sd 0 | risk improvement 0 < 0.25; spectral band shape worsened by 0.0709 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 4.82 | centroid | 0.16s | 781.2 Hz | 0.2067 | 0.127 | 0.0155 | 1x, risk sd 0 | duration gap 0.16s > 0.08s; risk improvement 0 < 0.25; spectral band shape worsened by 0.0579 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 4.82 | centroid | 0.18s | 757.2 Hz | 0.2158 | 0.121 | 0.0106 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement 0 < 0.25; spectral band shape worsened by 0.067 |
| Staccato bright | 4.86 | centroid | 0.06s | 822.6 Hz | 0.233 | 0.15 | 0.0075 | 1x, risk sd 0 | risk improvement -0.04 < 0.25; spectral band shape worsened by 0.0842 |
| Band targeted triangle-ladder-tail 4699/square/0.0016 | 4.86 | centroid | 0.18s | 839.1 Hz | 0.2286 | 0.104 | 0.0021 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.04 < 0.25; spectral band shape worsened by 0.0798 |
| Low RMS square edge | 4.89 | centroid | 0.259s | 682.2 Hz | 0.2217 | 0.449 | 0.005 | 1x, risk sd 0 | duration gap 0.259s > 0.08s; risk improvement -0.07 < 0.25; spectral band shape worsened by 0.0729 |
| Sparkle low RMS | 4.9 | centroid | 0.06s | 827.3 Hz | 0.222 | 0.187 | 0.0135 | 1x, risk sd 0 | risk improvement -0.08 < 0.25; spectral band shape worsened by 0.0732 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 4.95 | centroid | 0.099s | 849.1 Hz | 0.2303 | 0.16 | 0.0053 | 1x, risk sd 0 | duration gap 0.099s > 0.08s; risk improvement -0.13 < 0.25; spectral band shape worsened by 0.0815 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 4.95 | centroid | 0.18s | 811.3 Hz | 0.2378 | 0.199 | 0.0088 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.13 < 0.25; spectral band shape worsened by 0.089 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 4.96 | centroid | 0.18s | 916.2 Hz | 0.2522 | 0.052 | 0.0042 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.14 < 0.25; centroid did not improve (-53.6 Hz); spectral band shape worsened by 0.1034 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 4.98 | centroid | 0.17s | 789.7 Hz | 0.2104 | 0.293 | 0.0187 | 1x, risk sd 0 | duration gap 0.17s > 0.08s; risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0616 |
| Thin bright square micro held | 5 | centroid | 0s | 875.2 Hz | 0.2384 | 0.09 | 0.0225 | 1x, risk sd 0 | risk improvement -0.18 < 0.25; centroid did not improve (-12.6 Hz); spectral band shape worsened by 0.0896 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5 | centroid | 0.18s | 856.5 Hz | 0.234 | 0.358 | 0.0008 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.18 < 0.25; spectral band shape worsened by 0.0852 |
| Band targeted triangle-ladder-tail 3520/triangle/0.0021 | 5.01 | centroid | 0.139s | 861.3 Hz | 0.2324 | 0.204 | 0.0078 | 1x, risk sd 0 | duration gap 0.139s > 0.08s; risk improvement -0.19 < 0.25; spectral band shape worsened by 0.0836 |
| Thin bright square quiet tail | 5.04 | centroid | 0s | 761.2 Hz | 0.218 | 0.366 | 0.0216 | 1x, risk sd 0 | risk improvement -0.22 < 0.25; spectral band shape worsened by 0.0692 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.04 | centroid | 0.099s | 840.5 Hz | 0.2295 | 0.388 | 0.0024 | 1x, risk sd 0 | duration gap 0.099s > 0.08s; risk improvement -0.22 < 0.25; spectral band shape worsened by 0.0807 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.05 | centroid | 0.18s | 847.5 Hz | 0.2363 | 0.273 | 0.0081 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.23 < 0.25; spectral band shape worsened by 0.0875 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 5.06 | centroid | 0.08s | 870.4 Hz | 0.2374 | 0.233 | 0.0099 | 1x, risk sd 0 | risk improvement -0.24 < 0.25; centroid did not improve (-7.8 Hz); spectral band shape worsened by 0.0886 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5.06 | centroid | 0.17s | 768.1 Hz | 0.2326 | 0.427 | 0.0002 | 1x, risk sd 0 | duration gap 0.17s > 0.08s; risk improvement -0.24 < 0.25; spectral band shape worsened by 0.0838 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.07 | centroid | 0.18s | 830 Hz | 0.2246 | 0.371 | 0.0016 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.25 < 0.25; spectral band shape worsened by 0.0758 |
| Thin bright square split low held | 5.08 | centroid | 0.049s | 862.4 Hz | 0.2334 | 0.219 | 0.014 | 1x, risk sd 0 | risk improvement -0.26 < 0.25; spectral band shape worsened by 0.0846 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.1 | centroid | 0.18s | 836.6 Hz | 0.2406 | 0.43 | 0.0022 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.28 < 0.25; spectral band shape worsened by 0.0918 |
| Band targeted triangle-ladder-tail 5274/triangle/0.0021 | 5.12 | centroid | 0.04s | 854.6 Hz | 0.2297 | 0.358 | 0.0111 | 1x, risk sd 0 | risk improvement -0.3 < 0.25; spectral band shape worsened by 0.0809 |
| Sparkle low RMS centered ZCR | 5.13 | centroid | 0.06s | 864.2 Hz | 0.2303 | 0.364 | 0.0044 | 1x, risk sd 0 | risk improvement -0.31 < 0.25; centroid did not improve (-1.6 Hz); spectral band shape worsened by 0.0815 |
| Octave chime thin | 5.14 | centroid | 0.06s | 848.7 Hz | 0.2219 | 0.379 | 0.0027 | 1x, risk sd 0 | risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0731 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.14 | centroid | 0.149s | 839.7 Hz | 0.246 | 0.306 | 0.0109 | 1x, risk sd 0 | duration gap 0.149s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0972 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.14 | centroid | 0.18s | 830.6 Hz | 0.2356 | 0.364 | 0.0032 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0868 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 5.14 | centroid | 0.18s | 858.2 Hz | 0.2404 | 0.329 | 0.0033 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0916 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 5.16 | centroid | 0.18s | 861.8 Hz | 0.2384 | 0.351 | 0.0049 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0896 |
| Sparkle low RMS square edge | 5.19 | centroid | 0.161s | 922.8 Hz | 0.264 | 0.15 | 0.0092 | 1x, risk sd 0 | duration gap 0.161s > 0.08s; risk improvement -0.37 < 0.25; centroid did not improve (-60.2 Hz); spectral band shape worsened by 0.1152 |
| Band targeted triangle-ladder-tail 4699/square/0.0021 | 5.22 | centroid | 0.12s | 905.8 Hz | 0.2541 | 0.25 | 0.0097 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.4 < 0.25; centroid did not improve (-43.2 Hz); spectral band shape worsened by 0.1053 |
| High square stair | 5.25 | centroid | 0s | 913.5 Hz | 0.2496 | 0.307 | 0.0085 | 1x, risk sd 0 | risk improvement -0.43 < 0.25; centroid did not improve (-50.9 Hz); spectral band shape worsened by 0.1008 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.25 | centroid | 0.18s | 837.6 Hz | 0.2504 | 0.408 | 0.0115 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.43 < 0.25; spectral band shape worsened by 0.1016 |
| Band targeted triangle-ladder-tail 3520/triangle/0.0021 | 5.26 | centroid | 0.18s | 894.9 Hz | 0.2457 | 0.28 | 0.0122 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.44 < 0.25; centroid did not improve (-32.3 Hz); spectral band shape worsened by 0.0969 |
| Band targeted triangle-ladder-tail 4699/triangle/0.0021 | 5.31 | centroid | 0.129s | 910.4 Hz | 0.2539 | 0.386 | 0.0115 | 1x, risk sd 0 | duration gap 0.129s > 0.08s; risk improvement -0.49 < 0.25; centroid did not improve (-47.8 Hz); spectral band shape worsened by 0.1051 |
| Band targeted triangle-ladder-tail 5274/square/0.0016 | 5.31 | centroid | 0.18s | 890.4 Hz | 0.2466 | 0.429 | 0.0043 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.49 < 0.25; centroid did not improve (-27.8 Hz); spectral band shape worsened by 0.0978 |
| Band targeted triangle-ladder-tail 3520/square/0.0021 | 5.32 | centroid | 0.18s | 882.9 Hz | 0.2539 | 0.398 | 0.0043 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.5 < 0.25; centroid did not improve (-20.3 Hz); spectral band shape worsened by 0.1051 |
| Band targeted triangle-ladder-tail 4186/square/0.0021 | 5.36 | centroid | 0.109s | 904.3 Hz | 0.2597 | 0.408 | 0.01 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; risk improvement -0.54 < 0.25; centroid did not improve (-41.7 Hz); spectral band shape worsened by 0.1109 |
| Band targeted triangle-ladder-tail 5274/square/0.0021 | 5.36 | centroid | 0.18s | 932.9 Hz | 0.256 | 0.394 | 0.0001 | 1x, risk sd 0 | duration gap 0.18s > 0.08s; risk improvement -0.54 < 0.25; centroid did not improve (-70.3 Hz); spectral band shape worsened by 0.1072 |
| Band targeted triangle-ladder-tail 4186/triangle/0.0021 | 5.39 | centroid | 0.119s | 883.1 Hz | 0.2294 | 0.38 | 0.0197 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; risk improvement -0.57 < 0.25; centroid did not improve (-20.5 Hz); spectral band shape worsened by 0.0806 |
| Low RMS brighter | 5.41 | centroid | 0.06s | 937.1 Hz | 0.2571 | 0.416 | 0.0053 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; centroid did not improve (-74.5 Hz); spectral band shape worsened by 0.1083 |
| Thin bright square soft attack held | 5.56 | centroid | 0.101s | 942 Hz | 0.2558 | 0.371 | 0.0331 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement -0.74 < 0.25; centroid did not improve (-79.4 Hz); spectral band shape worsened by 0.107 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

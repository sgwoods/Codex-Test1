# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T19:19:16.289Z`
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
- Measured best: `thin-bright-square-quiet-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Current Aurora baseline | 4.42 | centroid | 0.06s | 844.3 Hz | 0.1473 | 0.088 | 0.1055 | 1x, risk sd 0 | baseline |
| Thin bright square quiet held | 4.44 | centroid | 0.08s | 651.5 Hz | 0.1382 | 0.348 | 0.1294 | 1x, risk sd 0 | risk improvement -0.02 < 0.25; RMS worsened by 0.0239 |
| Thin bright square top | 4.48 | centroid | 0.141s | 719.2 Hz | 0.1289 | 0.444 | 0.1135 | 1x, risk sd 0 | duration gap 0.141s > 0.08s; risk improvement -0.06 < 0.25 |
| Thin bright triangle ladder | 4.51 | centroid | 0s | 767.4 Hz | 0.1252 | 0.216 | 0.1161 | 1x, risk sd 0 | risk improvement -0.09 < 0.25; RMS worsened by 0.0106 |
| Thin bright square soft held | 4.58 | centroid | 0.021s | 744.3 Hz | 0.1292 | 0.231 | 0.1322 | 1x, risk sd 0 | risk improvement -0.16 < 0.25; RMS worsened by 0.0267 |
| Thin bright square balanced held | 4.63 | centroid | 0.01s | 727.6 Hz | 0.1462 | 0.385 | 0.1316 | 1x, risk sd 0 | risk improvement -0.21 < 0.25; RMS worsened by 0.0261 |
| Thin bright square held | 4.67 | centroid | 0.03s | 738.9 Hz | 0.1506 | 0.375 | 0.1444 | 1x, risk sd 0 | risk improvement -0.25 < 0.25; RMS worsened by 0.0389 |
| Thin bright square long low held | 4.7 | centroid | 0.3s | 758.4 Hz | 0.1497 | 0.286 | 0.0597 | 1x, risk sd 0 | duration gap 0.3s > 0.08s; risk improvement -0.28 < 0.25 |
| Sparkle short tail | 4.79 | centroid | 0.06s | 865.1 Hz | 0.236 | 0.139 | 0.0006 | 1x, risk sd 0 | risk improvement -0.37 < 0.25; centroid did not improve (-20.8 Hz); spectral band shape worsened by 0.0887 |
| Sparkle with light noise | 4.84 | centroid | 0.06s | 730.9 Hz | 0.2226 | 0.323 | 0.005 | 1x, risk sd 0 | risk improvement -0.42 < 0.25; spectral band shape worsened by 0.0753 |
| Sparkle low RMS | 4.85 | centroid | 0.06s | 831.7 Hz | 0.2264 | 0.203 | 0.0107 | 1x, risk sd 0 | risk improvement -0.43 < 0.25; spectral band shape worsened by 0.0791 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 4.88 | centroid | 0.12s | 859.1 Hz | 0.2323 | 0.187 | 0.003 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.46 < 0.25; centroid did not improve (-14.8 Hz); spectral band shape worsened by 0.085 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 4.88 | centroid | 0.12s | 831.1 Hz | 0.224 | 0.233 | 0.0001 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.46 < 0.25; spectral band shape worsened by 0.0767 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0018 | 4.89 | centroid | 0.059s | 877.8 Hz | 0.2439 | 0.177 | 0.0032 | 1x, risk sd 0 | risk improvement -0.47 < 0.25; centroid did not improve (-33.5 Hz); spectral band shape worsened by 0.0966 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 4.9 | centroid | 0.12s | 886.5 Hz | 0.2465 | 0.067 | 0.0073 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.48 < 0.25; centroid did not improve (-42.2 Hz); spectral band shape worsened by 0.0992 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 4.91 | centroid | 0.12s | 882.3 Hz | 0.2398 | 0.1 | 0.0001 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.49 < 0.25; centroid did not improve (-38 Hz); spectral band shape worsened by 0.0925 |
| Thin bright square quiet tail | 4.92 | centroid | 0s | 770.7 Hz | 0.2163 | 0.25 | 0.0167 | 1x, risk sd 0 | risk improvement -0.5 < 0.25; spectral band shape worsened by 0.069 |
| Thin bright square micro held | 4.92 | centroid | 0.011s | 863.7 Hz | 0.2369 | 0.084 | 0.0233 | 1x, risk sd 0 | risk improvement -0.5 < 0.25; centroid did not improve (-19.4 Hz); spectral band shape worsened by 0.0896 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 4.94 | centroid | 0.12s | 854.6 Hz | 0.2455 | 0.146 | 0.0076 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.52 < 0.25; centroid did not improve (-10.3 Hz); spectral band shape worsened by 0.0982 |
| Low RMS harmonic | 4.95 | centroid | 0s | 765.5 Hz | 0.2094 | 0.417 | 0.0061 | 1x, risk sd 0 | risk improvement -0.53 < 0.25; spectral band shape worsened by 0.0621 |
| Sparkle low RMS square edge | 4.95 | centroid | 0.06s | 866.1 Hz | 0.2487 | 0.115 | 0.0141 | 1x, risk sd 0 | risk improvement -0.53 < 0.25; centroid did not improve (-21.8 Hz); spectral band shape worsened by 0.1014 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 4.95 | centroid | 0.08s | 781 Hz | 0.2293 | 0.345 | 0.0059 | 1x, risk sd 0 | risk improvement -0.53 < 0.25; spectral band shape worsened by 0.082 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0018 | 4.95 | centroid | 0.12s | 813.5 Hz | 0.2156 | 0.294 | 0.0153 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.53 < 0.25; spectral band shape worsened by 0.0683 |
| Sparkle low RMS centered ZCR | 4.97 | centroid | 0.101s | 845.8 Hz | 0.2334 | 0.141 | 0.0145 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement -0.55 < 0.25; centroid did not improve (-1.5 Hz); spectral band shape worsened by 0.0861 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 4.97 | centroid | 0.12s | 769.4 Hz | 0.2076 | 0.382 | 0.0055 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.55 < 0.25; spectral band shape worsened by 0.0603 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 4.97 | centroid | 0.12s | 756.8 Hz | 0.2155 | 0.4 | 0.0044 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.55 < 0.25; spectral band shape worsened by 0.0682 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 4.98 | centroid | 0.12s | 841.6 Hz | 0.2322 | 0.358 | 0.0016 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.56 < 0.25; spectral band shape worsened by 0.0849 |
| Band targeted sine-presence-air 0.0078/0.0032/0.0009 | 4.98 | centroid | 0.12s | 864.3 Hz | 0.25 | 0.125 | 0.0088 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.56 < 0.25; centroid did not improve (-20 Hz); spectral band shape worsened by 0.1027 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 5.01 | centroid | 0.06s | 809.9 Hz | 0.2194 | 0.378 | 0.0037 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; spectral band shape worsened by 0.0721 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 5.01 | centroid | 0.119s | 767.1 Hz | 0.2217 | 0.397 | 0.0115 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; risk improvement -0.59 < 0.25; spectral band shape worsened by 0.0744 |
| Band targeted soft-square-presence 0.0078/0.002/0.0024 | 5.02 | centroid | 0.09s | 774.5 Hz | 0.2068 | 0.322 | 0.0127 | 1x, risk sd 0 | duration gap 0.09s > 0.08s; risk improvement -0.6 < 0.25; spectral band shape worsened by 0.0595 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.03 | centroid | 0.12s | 843.8 Hz | 0.2366 | 0.278 | 0.0027 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.61 < 0.25; spectral band shape worsened by 0.0893 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0018 | 5.04 | centroid | 0.12s | 823.9 Hz | 0.2355 | 0.342 | 0.0028 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.62 < 0.25; spectral band shape worsened by 0.0882 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.06 | centroid | 0.12s | 791.9 Hz | 0.2112 | 0.441 | 0.002 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.64 < 0.25; spectral band shape worsened by 0.0639 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5.08 | centroid | 0.061s | 840.9 Hz | 0.2317 | 0.297 | 0.0147 | 1x, risk sd 0 | risk improvement -0.66 < 0.25; spectral band shape worsened by 0.0844 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0024 | 5.08 | centroid | 0.07s | 824 Hz | 0.2295 | 0.374 | 0.0041 | 1x, risk sd 0 | risk improvement -0.66 < 0.25; spectral band shape worsened by 0.0822 |
| Staccato bright | 5.09 | centroid | 0.06s | 840.4 Hz | 0.2305 | 0.384 | 0.0069 | 1x, risk sd 0 | risk improvement -0.67 < 0.25; spectral band shape worsened by 0.0832 |
| Low RMS square edge | 5.09 | centroid | 0.16s | 810.4 Hz | 0.2283 | 0.43 | 0.0034 | 1x, risk sd 0 | duration gap 0.16s > 0.08s; risk improvement -0.67 < 0.25; spectral band shape worsened by 0.081 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.11 | centroid | 0.12s | 842.7 Hz | 0.2335 | 0.372 | 0.0001 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.69 < 0.25; spectral band shape worsened by 0.0862 |
| Band targeted sine-presence-air 0.0078/0.0026/0.0013 | 5.12 | centroid | 0.05s | 887 Hz | 0.2475 | 0.258 | 0.0072 | 1x, risk sd 0 | risk improvement -0.7 < 0.25; centroid did not improve (-42.7 Hz); spectral band shape worsened by 0.1002 |
| Thin bright square split low held | 5.12 | centroid | 0.059s | 846 Hz | 0.2314 | 0.305 | 0.0153 | 1x, risk sd 0 | risk improvement -0.7 < 0.25; centroid did not improve (-1.7 Hz); spectral band shape worsened by 0.0841 |
| High square stair | 5.12 | centroid | 0.111s | 810.6 Hz | 0.2429 | 0.329 | 0.0063 | 1x, risk sd 0 | duration gap 0.111s > 0.08s; risk improvement -0.7 < 0.25; spectral band shape worsened by 0.0956 |
| Band targeted sine-balanced-air 0.0078/0.002/0.0024 | 5.14 | centroid | 0.119s | 842.4 Hz | 0.2403 | 0.384 | 0.0051 | 1x, risk sd 0 | duration gap 0.119s > 0.08s; risk improvement -0.72 < 0.25; spectral band shape worsened by 0.093 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 5.14 | centroid | 0.12s | 870.9 Hz | 0.2313 | 0.37 | 0.0008 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.72 < 0.25; centroid did not improve (-26.6 Hz); spectral band shape worsened by 0.084 |
| Band targeted sine-presence-air 0.0068/0.0032/0.0018 | 5.15 | centroid | 0.12s | 868.3 Hz | 0.2381 | 0.343 | 0.0042 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.73 < 0.25; centroid did not improve (-24 Hz); spectral band shape worsened by 0.0908 |
| Octave chime thin | 5.16 | centroid | 0.06s | 859.3 Hz | 0.224 | 0.403 | 0.0052 | 1x, risk sd 0 | risk improvement -0.74 < 0.25; centroid did not improve (-15 Hz); spectral band shape worsened by 0.0767 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 5.16 | centroid | 0.12s | 828.7 Hz | 0.2237 | 0.395 | 0.0076 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.74 < 0.25; spectral band shape worsened by 0.0764 |
| Band targeted soft-square-presence 0.0078/0.0026/0.0013 | 5.18 | centroid | 0.12s | 825.2 Hz | 0.2365 | 0.432 | 0.001 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.76 < 0.25; spectral band shape worsened by 0.0892 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0018 | 5.19 | centroid | 0.109s | 897.3 Hz | 0.243 | 0.236 | 0.0124 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; risk improvement -0.77 < 0.25; centroid did not improve (-53 Hz); spectral band shape worsened by 0.0957 |
| Band targeted soft-square-presence 0.0078/0.0032/0.0009 | 5.19 | centroid | 0.12s | 852.5 Hz | 0.2359 | 0.368 | 0.0051 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.77 < 0.25; centroid did not improve (-8.2 Hz); spectral band shape worsened by 0.0886 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0018 | 5.23 | centroid | 0.041s | 864.3 Hz | 0.2356 | 0.316 | 0.0137 | 1x, risk sd 0 | risk improvement -0.81 < 0.25; centroid did not improve (-20 Hz); spectral band shape worsened by 0.0883 |
| Band targeted sine-presence-air 0.0078/0.002/0.0024 | 5.25 | centroid | 0.12s | 872.9 Hz | 0.2482 | 0.375 | 0.0096 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.83 < 0.25; centroid did not improve (-28.6 Hz); spectral band shape worsened by 0.1009 |
| Band targeted sine-balanced-air 0.0078/0.0026/0.0013 | 5.27 | centroid | 0.109s | 877.2 Hz | 0.2505 | 0.393 | 0.0106 | 1x, risk sd 0 | duration gap 0.109s > 0.08s; risk improvement -0.85 < 0.25; centroid did not improve (-32.9 Hz); spectral band shape worsened by 0.1032 |
| Band targeted sine-balanced-air 0.0078/0.0032/0.0009 | 5.28 | centroid | 0.12s | 901 Hz | 0.2536 | 0.382 | 0.0024 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.86 < 0.25; centroid did not improve (-56.7 Hz); spectral band shape worsened by 0.1063 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 5.31 | centroid | 0.12s | 885.9 Hz | 0.2486 | 0.394 | 0.0101 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.89 < 0.25; centroid did not improve (-41.6 Hz); spectral band shape worsened by 0.1013 |
| Band targeted soft-square-presence 0.0068/0.0032/0.0024 | 5.32 | centroid | 0.12s | 886.9 Hz | 0.2505 | 0.449 | 0.0027 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.9 < 0.25; centroid did not improve (-42.6 Hz); spectral band shape worsened by 0.1032 |
| Band targeted sine-balanced-air 0.0068/0.0032/0.0024 | 5.39 | centroid | 0.039s | 920.1 Hz | 0.2603 | 0.381 | 0.0091 | 1x, risk sd 0 | risk improvement -0.97 < 0.25; centroid did not improve (-75.8 Hz); spectral band shape worsened by 0.113 |
| Thin bright square soft attack held | 5.41 | centroid | 0.111s | 860.8 Hz | 0.2541 | 0.384 | 0.0341 | 1x, risk sd 0 | duration gap 0.111s > 0.08s; risk improvement -0.99 < 0.25; centroid did not improve (-16.5 Hz); spectral band shape worsened by 0.1068 |
| Low RMS brighter | 5.45 | centroid | 0.06s | 932.5 Hz | 0.2541 | 0.394 | 0.0076 | 1x, risk sd 0 | risk improvement -1.03 < 0.25; centroid did not improve (-88.2 Hz); spectral band shape worsened by 0.1068 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

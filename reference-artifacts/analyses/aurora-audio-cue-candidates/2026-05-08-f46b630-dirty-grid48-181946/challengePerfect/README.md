# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:19:46.545Z`
Commit: `f46b630`

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
- Measured best: `thin-bright-square-top`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square top | 4.42 | centroid | 0.041s | 772.6 Hz | 0.1344 | 0.397 | 0.1119 | 1x, risk sd 0 | risk improvement 0.05 < 0.25 |
| Current Aurora baseline | 4.47 | centroid | 0.06s | 823.8 Hz | 0.1461 | 0.198 | 0.1049 | 1x, risk sd 0 | baseline |
| Thin bright square balanced held | 4.47 | centroid | 0.06s | 732.9 Hz | 0.1472 | 0.4 | 0.1215 | 1x, risk sd 0 | risk improvement 0 < 0.25; RMS worsened by 0.0166 |
| Thin bright square held | 4.48 | centroid | 0.13s | 674.6 Hz | 0.1515 | 0.264 | 0.1409 | 1x, risk sd 0 | duration gap 0.13s > 0.08s; risk improvement -0.01 < 0.25; RMS worsened by 0.036 |
| Thin bright square long low held | 4.5 | centroid | 0.19s | 674.7 Hz | 0.1317 | 0.396 | 0.0825 | 1x, risk sd 0 | duration gap 0.19s > 0.08s; risk improvement -0.03 < 0.25 |
| Thin bright square quiet held | 4.59 | centroid | 0.12s | 672.9 Hz | 0.1512 | 0.402 | 0.1254 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.12 < 0.25; RMS worsened by 0.0205 |
| Thin bright square soft held | 4.74 | centroid | 0s | 737.8 Hz | 0.1293 | 0.401 | 0.1451 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; RMS worsened by 0.0402 |
| Grid triangle step 0.053 volume 0.005 tone 0.00145/0.21 | 4.78 | centroid | 0.06s | 747.5 Hz | 0.204 | 0.134 | 0.0138 | 1x, risk sd 0 | risk improvement -0.31 < 0.25; spectral band shape worsened by 0.0579 |
| Sparkle low RMS | 4.81 | centroid | 0.131s | 819.2 Hz | 0.228 | 0.097 | 0.0028 | 1x, risk sd 0 | duration gap 0.131s > 0.08s; risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0819 |
| Grid triangle step 0.047 volume 0.005 tone 0.00145/0.21 | 4.82 | centroid | 0.06s | 784 Hz | 0.2142 | 0.272 | 0.0106 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.0681 |
| Grid triangle step 0.055 volume 0.0046 tone 0.00125/0.21 | 4.86 | centroid | 0.06s | 793 Hz | 0.2195 | 0.266 | 0.006 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; spectral band shape worsened by 0.0734 |
| Grid sine step 0.047 volume 0.0054 tone 0.00125/0.21 | 4.87 | centroid | 0.05s | 799.2 Hz | 0.23 | 0.206 | 0.0152 | 1x, risk sd 0 | risk improvement -0.4 < 0.25; spectral band shape worsened by 0.0839 |
| Low RMS harmonic | 4.88 | centroid | 0s | 764.9 Hz | 0.2044 | 0.404 | 0.008 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; spectral band shape worsened by 0.0583 |
| Grid triangle step 0.055 volume 0.005 tone 0.00085/0.21 | 4.88 | centroid | 0.009s | 876.3 Hz | 0.2409 | 0.146 | 0.007 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; centroid did not improve (-52.5 Hz); spectral band shape worsened by 0.0948 |
| Grid sine step 0.051 volume 0.005 tone 0.00125/0.21 | 4.88 | centroid | 0.01s | 771.8 Hz | 0.2135 | 0.281 | 0.0012 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; spectral band shape worsened by 0.0674 |
| Grid triangle step 0.051 volume 0.005 tone 0.00105/0.21 | 4.88 | centroid | 0.06s | 876.1 Hz | 0.2467 | 0.128 | 0.0016 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; centroid did not improve (-52.3 Hz); spectral band shape worsened by 0.1006 |
| Thin bright triangle ladder | 4.9 | centroid | 0s | 844.9 Hz | 0.1348 | 0.393 | 0.1155 | 1x, risk sd 0 | risk improvement -0.43 < 0.25; centroid did not improve (-21.1 Hz); RMS worsened by 0.0106 |
| Grid triangle step 0.055 volume 0.0046 tone 0.00105/0.21 | 4.91 | centroid | 0.06s | 766.5 Hz | 0.225 | 0.345 | 0.0011 | 1x, risk sd 0 | risk improvement -0.44 < 0.25; spectral band shape worsened by 0.0789 |
| Grid sine step 0.051 volume 0.0054 tone 0.00085/0.21 | 4.92 | centroid | 0.06s | 789.4 Hz | 0.2152 | 0.242 | 0.006 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; spectral band shape worsened by 0.0691 |
| Grid sine step 0.051 volume 0.005 tone 0.00145/0.21 | 4.92 | centroid | 0.06s | 797 Hz | 0.2302 | 0.271 | 0.0044 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; spectral band shape worsened by 0.0841 |
| Grid sine step 0.049 volume 0.005 tone 0.00145/0.21 | 4.93 | centroid | 0.06s | 781.2 Hz | 0.2097 | 0.395 | 0.0036 | 1x, risk sd 0 | risk improvement -0.46 < 0.25; spectral band shape worsened by 0.0636 |
| Thin bright square quiet tail | 4.93 | centroid | 0.081s | 753.8 Hz | 0.2102 | 0.282 | 0.0241 | 1x, risk sd 0 | duration gap 0.081s > 0.08s; risk improvement -0.46 < 0.25; spectral band shape worsened by 0.0641 |
| Grid sine step 0.055 volume 0.005 tone 0.00085/0.21 | 4.96 | centroid | 0.011s | 822.4 Hz | 0.2306 | 0.331 | 0.002 | 1x, risk sd 0 | risk improvement -0.49 < 0.25; spectral band shape worsened by 0.0845 |
| Grid triangle step 0.047 volume 0.0054 tone 0.00145/0.21 | 4.96 | centroid | 0.06s | 898.2 Hz | 0.2474 | 0.123 | 0.0077 | 1x, risk sd 0 | risk improvement -0.49 < 0.25; centroid did not improve (-74.4 Hz); spectral band shape worsened by 0.1013 |
| Grid triangle step 0.051 volume 0.0046 tone 0.00145/0.21 | 4.96 | centroid | 0.06s | 802.8 Hz | 0.2224 | 0.366 | 0.0014 | 1x, risk sd 0 | risk improvement -0.49 < 0.25; spectral band shape worsened by 0.0763 |
| Grid triangle step 0.055 volume 0.0046 tone 0.00145/0.21 | 4.98 | centroid | 0.091s | 852.3 Hz | 0.2314 | 0.211 | 0.014 | 1x, risk sd 0 | duration gap 0.091s > 0.08s; risk improvement -0.51 < 0.25; centroid did not improve (-28.5 Hz); spectral band shape worsened by 0.0853 |
| Grid triangle step 0.053 volume 0.005 tone 0.00125/0.21 | 4.98 | centroid | 0.12s | 856.9 Hz | 0.2375 | 0.177 | 0.0033 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.51 < 0.25; centroid did not improve (-33.1 Hz); spectral band shape worsened by 0.0914 |
| Grid triangle step 0.049 volume 0.0054 tone 0.00085/0.21 | 4.98 | centroid | 0.12s | 864.5 Hz | 0.2401 | 0.172 | 0.0031 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.51 < 0.25; centroid did not improve (-40.7 Hz); spectral band shape worsened by 0.094 |
| Grid triangle step 0.049 volume 0.005 tone 0.00125/0.21 | 4.99 | centroid | 0.06s | 847.3 Hz | 0.2421 | 0.257 | 0.004 | 1x, risk sd 0 | risk improvement -0.52 < 0.25; centroid did not improve (-23.5 Hz); spectral band shape worsened by 0.096 |
| Grid triangle step 0.051 volume 0.005 tone 0.00125/0.21 | 5 | centroid | 0.06s | 791.1 Hz | 0.2097 | 0.425 | 0.0104 | 1x, risk sd 0 | risk improvement -0.53 < 0.25; spectral band shape worsened by 0.0636 |
| Grid triangle step 0.055 volume 0.005 tone 0.00105/0.21 | 5.01 | centroid | 0.06s | 799.7 Hz | 0.2182 | 0.358 | 0.0062 | 1x, risk sd 0 | risk improvement -0.54 < 0.25; spectral band shape worsened by 0.0721 |
| Grid triangle step 0.049 volume 0.005 tone 0.00145/0.21 | 5.02 | centroid | 0.049s | 868.7 Hz | 0.2421 | 0.352 | 0.0025 | 1x, risk sd 0 | risk improvement -0.55 < 0.25; centroid did not improve (-44.9 Hz); spectral band shape worsened by 0.096 |
| Octave chime thin | 5.03 | centroid | 0.249s | 711 Hz | 0.2163 | 0.413 | 0.0182 | 1x, risk sd 0 | duration gap 0.249s > 0.08s; risk improvement -0.56 < 0.25; spectral band shape worsened by 0.0702 |
| Sparkle short tail | 5.04 | centroid | 0.06s | 800.4 Hz | 0.2288 | 0.44 | 0.0046 | 1x, risk sd 0 | risk improvement -0.57 < 0.25; spectral band shape worsened by 0.0827 |
| Grid triangle step 0.051 volume 0.005 tone 0.00145/0.21 | 5.05 | centroid | 0.06s | 842.4 Hz | 0.2306 | 0.37 | 0.0055 | 1x, risk sd 0 | risk improvement -0.58 < 0.25; centroid did not improve (-18.6 Hz); spectral band shape worsened by 0.0845 |
| Grid triangle step 0.053 volume 0.0046 tone 0.00145/0.21 | 5.06 | centroid | 0.001s | 847.2 Hz | 0.2308 | 0.328 | 0.0003 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; centroid did not improve (-23.4 Hz); spectral band shape worsened by 0.0847 |
| Grid sine step 0.047 volume 0.0058 tone 0.00105/0.21 | 5.06 | centroid | 0.06s | 862.8 Hz | 0.234 | 0.295 | 0.004 | 1x, risk sd 0 | risk improvement -0.59 < 0.25; centroid did not improve (-39 Hz); spectral band shape worsened by 0.0879 |
| Staccato bright | 5.07 | centroid | 0.06s | 833 Hz | 0.235 | 0.399 | 0.0053 | 1x, risk sd 0 | risk improvement -0.6 < 0.25; centroid did not improve (-9.2 Hz); spectral band shape worsened by 0.0889 |
| Grid triangle step 0.049 volume 0.0058 tone 0.00085/0.21 | 5.07 | centroid | 0.06s | 830.6 Hz | 0.229 | 0.366 | 0.0037 | 1x, risk sd 0 | risk improvement -0.6 < 0.25; centroid did not improve (-6.8 Hz); spectral band shape worsened by 0.0829 |
| Sparkle low RMS square edge | 5.07 | centroid | 0.071s | 867.9 Hz | 0.2513 | 0.242 | 0.0081 | 1x, risk sd 0 | risk improvement -0.6 < 0.25; centroid did not improve (-44.1 Hz); spectral band shape worsened by 0.1052 |
| Grid triangle step 0.051 volume 0.0054 tone 0.00105/0.21 | 5.1 | centroid | 0.041s | 826 Hz | 0.2323 | 0.363 | 0.0097 | 1x, risk sd 0 | risk improvement -0.63 < 0.25; centroid did not improve (-2.2 Hz); spectral band shape worsened by 0.0862 |
| Low RMS square edge | 5.1 | centroid | 0.06s | 829.3 Hz | 0.2392 | 0.378 | 0.0115 | 1x, risk sd 0 | risk improvement -0.63 < 0.25; centroid did not improve (-5.5 Hz); spectral band shape worsened by 0.0931 |
| Sparkle low RMS centered ZCR | 5.12 | centroid | 0.081s | 858.9 Hz | 0.2313 | 0.299 | 0.0146 | 1x, risk sd 0 | duration gap 0.081s > 0.08s; risk improvement -0.65 < 0.25; centroid did not improve (-35.1 Hz); spectral band shape worsened by 0.0852 |
| Grid sine step 0.047 volume 0.0054 tone 0.00145/0.21 | 5.12 | centroid | 0.11s | 882.9 Hz | 0.2357 | 0.26 | 0.0151 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.65 < 0.25; centroid did not improve (-59.1 Hz); spectral band shape worsened by 0.0896 |
| Sparkle with light noise | 5.13 | centroid | 0.06s | 875.8 Hz | 0.2431 | 0.357 | 0.0015 | 1x, risk sd 0 | risk improvement -0.66 < 0.25; centroid did not improve (-52 Hz); spectral band shape worsened by 0.097 |
| Thin bright square split low held | 5.14 | centroid | 0.01s | 798.7 Hz | 0.23 | 0.339 | 0.0153 | 1x, risk sd 0 | risk improvement -0.67 < 0.25; spectral band shape worsened by 0.0839 |
| Grid triangle step 0.049 volume 0.0054 tone 0.00145/0.21 | 5.14 | centroid | 0.03s | 862.4 Hz | 0.2282 | 0.432 | 0.0046 | 1x, risk sd 0 | risk improvement -0.67 < 0.25; centroid did not improve (-38.6 Hz); spectral band shape worsened by 0.0821 |
| Grid triangle step 0.053 volume 0.0054 tone 0.00085/0.21 | 5.14 | centroid | 0.06s | 912 Hz | 0.2492 | 0.246 | 0.0112 | 1x, risk sd 0 | risk improvement -0.67 < 0.25; centroid did not improve (-88.2 Hz); spectral band shape worsened by 0.1031 |
| Grid triangle step 0.047 volume 0.0054 tone 0.00105/0.21 | 5.15 | centroid | 0.019s | 872.8 Hz | 0.235 | 0.251 | 0.0116 | 1x, risk sd 0 | risk improvement -0.68 < 0.25; centroid did not improve (-49 Hz); spectral band shape worsened by 0.0889 |
| Grid triangle step 0.047 volume 0.0058 tone 0.00085/0.21 | 5.15 | centroid | 0.02s | 874.7 Hz | 0.246 | 0.339 | 0.0009 | 1x, risk sd 0 | risk improvement -0.68 < 0.25; centroid did not improve (-50.9 Hz); spectral band shape worsened by 0.0999 |
| Grid sine step 0.053 volume 0.005 tone 0.00125/0.21 | 5.15 | centroid | 0.03s | 835.2 Hz | 0.2248 | 0.383 | 0.0058 | 1x, risk sd 0 | risk improvement -0.68 < 0.25; centroid did not improve (-11.4 Hz); spectral band shape worsened by 0.0787 |
| Grid triangle step 0.053 volume 0.005 tone 0.00105/0.21 | 5.15 | centroid | 0.06s | 835 Hz | 0.2316 | 0.405 | 0.0017 | 1x, risk sd 0 | risk improvement -0.68 < 0.25; centroid did not improve (-11.2 Hz); spectral band shape worsened by 0.0855 |
| Grid triangle step 0.047 volume 0.0054 tone 0.00125/0.21 | 5.17 | centroid | 0.031s | 837.3 Hz | 0.2465 | 0.394 | 0.0091 | 1x, risk sd 0 | risk improvement -0.7 < 0.25; centroid did not improve (-13.5 Hz); spectral band shape worsened by 0.1004 |
| Grid sine step 0.047 volume 0.0058 tone 0.00085/0.21 | 5.17 | centroid | 0.12s | 780.6 Hz | 0.2245 | 0.395 | 0.0169 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.7 < 0.25; spectral band shape worsened by 0.0784 |
| Grid sine step 0.053 volume 0.0046 tone 0.00145/0.21 | 5.18 | centroid | 0.06s | 926.6 Hz | 0.2557 | 0.22 | 0.0075 | 1x, risk sd 0 | risk improvement -0.71 < 0.25; centroid did not improve (-102.8 Hz); spectral band shape worsened by 0.1096 |
| Grid triangle step 0.049 volume 0.0054 tone 0.00105/0.21 | 5.18 | centroid | 0.159s | 823.6 Hz | 0.2271 | 0.396 | 0.0111 | 1x, risk sd 0 | duration gap 0.159s > 0.08s; risk improvement -0.71 < 0.25; spectral band shape worsened by 0.081 |
| Thin bright square micro held | 5.21 | centroid | 0s | 829.7 Hz | 0.2368 | 0.398 | 0.0261 | 1x, risk sd 0 | risk improvement -0.74 < 0.25; centroid did not improve (-5.9 Hz); spectral band shape worsened by 0.0907 |
| Grid triangle step 0.049 volume 0.0054 tone 0.00125/0.21 | 5.22 | centroid | 0.169s | 862.9 Hz | 0.2317 | 0.282 | 0.0198 | 1x, risk sd 0 | duration gap 0.169s > 0.08s; risk improvement -0.75 < 0.25; centroid did not improve (-39.1 Hz); spectral band shape worsened by 0.0856 |
| Grid sine step 0.053 volume 0.005 tone 0.00105/0.21 | 5.26 | centroid | 0.06s | 910.7 Hz | 0.2527 | 0.373 | 0.0079 | 1x, risk sd 0 | risk improvement -0.79 < 0.25; centroid did not improve (-86.9 Hz); spectral band shape worsened by 0.1066 |
| Grid triangle step 0.053 volume 0.0046 tone 0.00125/0.21 | 5.26 | centroid | 0.06s | 872.8 Hz | 0.2458 | 0.422 | 0.0033 | 1x, risk sd 0 | risk improvement -0.79 < 0.25; centroid did not improve (-49 Hz); spectral band shape worsened by 0.0997 |
| Low RMS brighter | 5.26 | centroid | 0.07s | 851.8 Hz | 0.2438 | 0.395 | 0.0131 | 1x, risk sd 0 | risk improvement -0.79 < 0.25; centroid did not improve (-28 Hz); spectral band shape worsened by 0.0977 |
| Grid triangle step 0.053 volume 0.005 tone 0.00085/0.21 | 5.27 | centroid | 0.02s | 927.2 Hz | 0.2532 | 0.295 | 0.009 | 1x, risk sd 0 | risk improvement -0.8 < 0.25; centroid did not improve (-103.4 Hz); spectral band shape worsened by 0.1071 |
| Grid sine step 0.049 volume 0.0054 tone 0.00125/0.21 | 5.32 | centroid | 0.06s | 918.9 Hz | 0.2546 | 0.382 | 0.0097 | 1x, risk sd 0 | risk improvement -0.85 < 0.25; centroid did not improve (-95.1 Hz); spectral band shape worsened by 0.1085 |
| Grid triangle step 0.047 volume 0.0058 tone 0.00125/0.21 | 5.32 | centroid | 0.12s | 908 Hz | 0.2536 | 0.424 | 0.0068 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.85 < 0.25; centroid did not improve (-84.2 Hz); spectral band shape worsened by 0.1075 |
| Grid triangle step 0.051 volume 0.0054 tone 0.00085/0.21 | 5.33 | centroid | 0.12s | 892 Hz | 0.2597 | 0.419 | 0.0073 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.86 < 0.25; centroid did not improve (-68.2 Hz); spectral band shape worsened by 0.1136 |
| High square stair | 5.33 | centroid | 0.14s | 893.2 Hz | 0.2605 | 0.389 | 0.0005 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; risk improvement -0.86 < 0.25; centroid did not improve (-69.4 Hz); spectral band shape worsened by 0.1144 |
| Grid sine step 0.055 volume 0.0046 tone 0.00145/0.21 | 5.35 | centroid | 0.06s | 914.1 Hz | 0.254 | 0.396 | 0.0069 | 1x, risk sd 0 | risk improvement -0.88 < 0.25; centroid did not improve (-90.3 Hz); spectral band shape worsened by 0.1079 |
| Grid sine step 0.055 volume 0.0046 tone 0.00125/0.21 | 5.36 | centroid | 0.059s | 909.5 Hz | 0.2567 | 0.396 | 0.0096 | 1x, risk sd 0 | risk improvement -0.89 < 0.25; centroid did not improve (-85.7 Hz); spectral band shape worsened by 0.1106 |
| Grid triangle step 0.047 volume 0.0058 tone 0.00105/0.21 | 5.42 | centroid | 0.02s | 936.8 Hz | 0.2596 | 0.435 | 0.0068 | 1x, risk sd 0 | risk improvement -0.95 < 0.25; centroid did not improve (-113 Hz); spectral band shape worsened by 0.1135 |
| Grid sine step 0.049 volume 0.0054 tone 0.00105/0.21 | 5.42 | centroid | 0.06s | 918.8 Hz | 0.2642 | 0.421 | 0.009 | 1x, risk sd 0 | risk improvement -0.95 < 0.25; centroid did not improve (-95 Hz); spectral band shape worsened by 0.1181 |
| Thin bright square soft attack held | 5.57 | centroid | 0s | 926.6 Hz | 0.2602 | 0.356 | 0.0351 | 1x, risk sd 0 | risk improvement -1.1 < 0.25; centroid did not improve (-102.8 Hz); spectral band shape worsened by 0.1141 |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

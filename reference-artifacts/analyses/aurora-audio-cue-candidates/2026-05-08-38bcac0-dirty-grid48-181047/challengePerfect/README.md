# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:10:47.369Z`
Commit: `38bcac0`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift.

## Success Measure

A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS gap, and keep active duration within 0.08s of the reference.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `thin-bright-square-balanced-held`
- Reason: The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | ZCR Gap | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square top | 2.86 | centroid | 0.131s | 683.9 Hz | 2 | 0.1125 | 1x, risk sd 0 | duration gap 0.131s > 0.08s |
| Thin bright square balanced held | 3.08 | centroid | 0s | 749.5 Hz | 60.4 | 0.1217 | 1x, risk sd 0 | risk improvement 0.21 < 0.25; RMS worsened by 0.0163 |
| Thin bright square quiet held | 3.14 | centroid | 0.15s | 629.3 Hz | 268.7 | 0.1306 | 1x, risk sd 0 | duration gap 0.15s > 0.08s; risk improvement 0.15 < 0.25; RMS worsened by 0.0252 |
| Staccato bright | 3.18 | centroid | 0.06s | 714.6 Hz | 1275.2 | 0.0082 | 1x, risk sd 0 | risk improvement 0.11 < 0.25 |
| Thin bright square long low held | 3.27 | centroid | 0.3s | 759.6 Hz | 687.6 | 0.0611 | 1x, risk sd 0 | duration gap 0.3s > 0.08s; risk improvement 0.02 < 0.25 |
| Current Aurora baseline | 3.29 | centroid | 0.06s | 809.8 Hz | 277.6 | 0.1054 | 1x, risk sd 0 | baseline |
| Low RMS harmonic | 3.29 | centroid | 0.101s | 689.4 Hz | 1505 | 0.0016 | 1x, risk sd 0 | duration gap 0.101s > 0.08s; risk improvement 0 < 0.25 |
| Grid sine step 0.047 volume 0.0058 tone 0.00105/0.21 | 3.31 | centroid | 0.05s | 757.1 Hz | 1397.9 | 0.0013 | 1x, risk sd 0 | risk improvement -0.02 < 0.25 |
| Thin bright square held | 3.32 | centroid | 0.05s | 733.6 Hz | 142.7 | 0.1448 | 1x, risk sd 0 | risk improvement -0.03 < 0.25; RMS worsened by 0.0394 |
| Grid triangle step 0.055 volume 0.005 tone 0.00105/0.21 | 3.33 | centroid | 0.011s | 772.9 Hz | 1390.7 | 0.0022 | 1x, risk sd 0 | risk improvement -0.04 < 0.25 |
| Grid triangle step 0.051 volume 0.005 tone 0.00145/0.21 | 3.37 | centroid | 0.06s | 758.8 Hz | 1385.8 | 0.0082 | 1x, risk sd 0 | risk improvement -0.08 < 0.25 |
| Grid triangle step 0.049 volume 0.0054 tone 0.00125/0.21 | 3.38 | centroid | 0.049s | 794.7 Hz | 1384.7 | 0.0014 | 1x, risk sd 0 | risk improvement -0.09 < 0.25 |
| Grid triangle step 0.051 volume 0.005 tone 0.00125/0.21 | 3.39 | centroid | 0.019s | 745.2 Hz | 1508.9 | 0.0031 | 1x, risk sd 0 | risk improvement -0.1 < 0.25 |
| Thin bright square soft held | 3.39 | centroid | 0.041s | 718.3 Hz | 282.5 | 0.1424 | 1x, risk sd 0 | risk improvement -0.1 < 0.25; RMS worsened by 0.037 |
| Grid triangle step 0.049 volume 0.005 tone 0.00125/0.21 | 3.39 | centroid | 0.06s | 791.6 Hz | 1350.6 | 0.0059 | 1x, risk sd 0 | risk improvement -0.1 < 0.25 |
| Grid sine step 0.051 volume 0.005 tone 0.00145/0.21 | 3.39 | centroid | 0.06s | 795.1 Hz | 1372.9 | 0.0032 | 1x, risk sd 0 | risk improvement -0.1 < 0.25 |
| Sparkle with light noise | 3.4 | centroid | 0.06s | 720.7 Hz | 1508.6 | 0.0096 | 1x, risk sd 0 | risk improvement -0.11 < 0.25 |
| Grid triangle step 0.049 volume 0.0058 tone 0.00085/0.21 | 3.4 | centroid | 0.06s | 820.3 Hz | 1315.5 | 0.0035 | 1x, risk sd 0 | risk improvement -0.11 < 0.25; centroid did not improve (-10.5 Hz) |
| Sparkle short tail | 3.4 | centroid | 0.11s | 790.6 Hz | 1383.7 | 0.0018 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.11 < 0.25 |
| Grid sine step 0.051 volume 0.0054 tone 0.00085/0.21 | 3.41 | centroid | 0.06s | 731 Hz | 1495.1 | 0.0095 | 1x, risk sd 0 | risk improvement -0.12 < 0.25 |
| Grid sine step 0.049 volume 0.005 tone 0.00145/0.21 | 3.41 | centroid | 0.06s | 766.4 Hz | 1434 | 0.006 | 1x, risk sd 0 | risk improvement -0.12 < 0.25 |
| Grid triangle step 0.053 volume 0.005 tone 0.00145/0.21 | 3.43 | centroid | 0.02s | 795.9 Hz | 1356.5 | 0.0108 | 1x, risk sd 0 | risk improvement -0.14 < 0.25 |
| Grid triangle step 0.055 volume 0.005 tone 0.00085/0.21 | 3.43 | centroid | 0.06s | 818.4 Hz | 1350.6 | 0.0043 | 1x, risk sd 0 | risk improvement -0.14 < 0.25; centroid did not improve (-8.6 Hz) |
| Grid triangle step 0.053 volume 0.005 tone 0.00105/0.21 | 3.43 | centroid | 0.06s | 774.4 Hz | 1413.6 | 0.0085 | 1x, risk sd 0 | risk improvement -0.14 < 0.25 |
| Grid sine step 0.051 volume 0.005 tone 0.00125/0.21 | 3.44 | centroid | 0.001s | 808.4 Hz | 1423.4 | 0.0033 | 1x, risk sd 0 | risk improvement -0.15 < 0.25 |
| Sparkle low RMS | 3.44 | centroid | 0.06s | 769.3 Hz | 1389.5 | 0.014 | 1x, risk sd 0 | risk improvement -0.15 < 0.25 |
| Grid triangle step 0.047 volume 0.0058 tone 0.00085/0.21 | 3.47 | centroid | 0.06s | 852.2 Hz | 1348.8 | 0.0008 | 1x, risk sd 0 | risk improvement -0.18 < 0.25; centroid did not improve (-42.4 Hz) |
| Grid triangle step 0.053 volume 0.0046 tone 0.00145/0.21 | 3.47 | centroid | 0.06s | 801.6 Hz | 1472.9 | 0.001 | 1x, risk sd 0 | risk improvement -0.18 < 0.25 |
| Thin bright triangle ladder | 3.48 | centroid | 0s | 863.5 Hz | 295.8 | 0.1159 | 1x, risk sd 0 | risk improvement -0.19 < 0.25; centroid did not improve (-53.7 Hz); RMS worsened by 0.0105 |
| Thin bright square quiet tail | 3.49 | centroid | 0s | 758.5 Hz | 1391.6 | 0.026 | 1x, risk sd 0 | risk improvement -0.2 < 0.25 |
| Grid triangle step 0.051 volume 0.005 tone 0.00105/0.21 | 3.49 | centroid | 0.001s | 835.8 Hz | 1421.4 | 0.002 | 1x, risk sd 0 | risk improvement -0.2 < 0.25; centroid did not improve (-26 Hz) |
| Grid triangle step 0.055 volume 0.0046 tone 0.00105/0.21 | 3.49 | centroid | 0.06s | 835.4 Hz | 1387.7 | 0.0031 | 1x, risk sd 0 | risk improvement -0.2 < 0.25; centroid did not improve (-25.6 Hz) |
| Grid triangle step 0.051 volume 0.0054 tone 0.00105/0.21 | 3.5 | centroid | 0.049s | 864.9 Hz | 1339.3 | 0.0033 | 1x, risk sd 0 | risk improvement -0.21 < 0.25; centroid did not improve (-55.1 Hz) |
| Grid triangle step 0.047 volume 0.0054 tone 0.00105/0.21 | 3.51 | centroid | 0.021s | 854.2 Hz | 1400.2 | 0.0019 | 1x, risk sd 0 | risk improvement -0.22 < 0.25; centroid did not improve (-44.4 Hz) |
| Grid triangle step 0.047 volume 0.0054 tone 0.00145/0.21 | 3.51 | centroid | 0.06s | 875.6 Hz | 1330.3 | 0.0011 | 1x, risk sd 0 | risk improvement -0.22 < 0.25; centroid did not improve (-65.8 Hz) |
| Grid triangle step 0.053 volume 0.005 tone 0.00125/0.21 | 3.51 | centroid | 0.06s | 846.2 Hz | 1393.2 | 0.0021 | 1x, risk sd 0 | risk improvement -0.22 < 0.25; centroid did not improve (-36.4 Hz) |
| Grid triangle step 0.047 volume 0.005 tone 0.00145/0.21 | 3.51 | centroid | 0.06s | 808.7 Hz | 1343.2 | 0.0173 | 1x, risk sd 0 | risk improvement -0.22 < 0.25 |
| Grid triangle step 0.051 volume 0.0046 tone 0.00145/0.21 | 3.52 | centroid | 0.06s | 852 Hz | 1385.8 | 0.0032 | 1x, risk sd 0 | risk improvement -0.23 < 0.25; centroid did not improve (-42.2 Hz) |
| Thin bright square split low held | 3.53 | centroid | 0.029s | 800.5 Hz | 1409.5 | 0.0167 | 1x, risk sd 0 | risk improvement -0.24 < 0.25 |
| Grid triangle step 0.049 volume 0.005 tone 0.00145/0.21 | 3.53 | centroid | 0.06s | 833.2 Hz | 1446.9 | 0.0022 | 1x, risk sd 0 | risk improvement -0.24 < 0.25; centroid did not improve (-23.4 Hz) |
| Octave chime thin | 3.53 | centroid | 0.14s | 788.8 Hz | 1395.1 | 0.0165 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; risk improvement -0.24 < 0.25 |
| Grid sine step 0.055 volume 0.0046 tone 0.00145/0.21 | 3.54 | centroid | 0.03s | 853.9 Hz | 1417.2 | 0.0033 | 1x, risk sd 0 | risk improvement -0.25 < 0.25; centroid did not improve (-44.1 Hz) |
| Grid triangle step 0.053 volume 0.005 tone 0.00085/0.21 | 3.56 | centroid | 0.06s | 851.1 Hz | 1402.5 | 0.0068 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; centroid did not improve (-41.3 Hz) |
| Grid sine step 0.053 volume 0.005 tone 0.00125/0.21 | 3.56 | centroid | 0.06s | 872.8 Hz | 1371 | 0.0037 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; centroid did not improve (-63 Hz) |
| Grid sine step 0.055 volume 0.005 tone 0.00085/0.21 | 3.58 | centroid | 0.06s | 875.2 Hz | 1406.2 | 0.0028 | 1x, risk sd 0 | risk improvement -0.29 < 0.25; centroid did not improve (-65.4 Hz) |
| Grid triangle step 0.053 volume 0.0046 tone 0.00125/0.21 | 3.6 | centroid | 0.011s | 885.4 Hz | 1422.9 | 0.0028 | 1x, risk sd 0 | risk improvement -0.31 < 0.25; centroid did not improve (-75.6 Hz) |
| Grid triangle step 0.047 volume 0.0058 tone 0.00105/0.21 | 3.61 | centroid | 0.009s | 857.8 Hz | 1434.2 | 0.0093 | 1x, risk sd 0 | risk improvement -0.32 < 0.25; centroid did not improve (-48 Hz) |
| Grid triangle step 0.055 volume 0.0046 tone 0.00145/0.21 | 3.61 | centroid | 0.121s | 853.6 Hz | 1363 | 0.0138 | 1x, risk sd 0 | duration gap 0.121s > 0.08s; risk improvement -0.32 < 0.25; centroid did not improve (-43.8 Hz) |
| Grid triangle step 0.049 volume 0.0054 tone 0.00105/0.21 | 3.62 | centroid | 0.08s | 858.8 Hz | 1422.1 | 0.0094 | 1x, risk sd 0 | risk improvement -0.33 < 0.25; centroid did not improve (-49 Hz) |
| Grid sine step 0.053 volume 0.0046 tone 0.00145/0.21 | 3.65 | centroid | 0.06s | 900.1 Hz | 1385.8 | 0.0063 | 1x, risk sd 0 | risk improvement -0.36 < 0.25; centroid did not improve (-90.3 Hz) |
| Grid triangle step 0.047 volume 0.0054 tone 0.00125/0.21 | 3.66 | centroid | 0.059s | 886.3 Hz | 1406.4 | 0.0098 | 1x, risk sd 0 | risk improvement -0.37 < 0.25; centroid did not improve (-76.5 Hz) |
| Grid sine step 0.047 volume 0.0058 tone 0.00085/0.21 | 3.67 | centroid | 0.03s | 855 Hz | 1467.8 | 0.0131 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; centroid did not improve (-45.2 Hz) |
| Grid triangle step 0.055 volume 0.0046 tone 0.00125/0.21 | 3.67 | centroid | 0.06s | 920.2 Hz | 1363.6 | 0.0068 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; centroid did not improve (-110.4 Hz) |
| Grid sine step 0.049 volume 0.0054 tone 0.00105/0.21 | 3.67 | centroid | 0.06s | 899.9 Hz | 1382.1 | 0.0101 | 1x, risk sd 0 | risk improvement -0.38 < 0.25; centroid did not improve (-90.1 Hz) |
| Sparkle low RMS centered ZCR | 3.67 | centroid | 0.131s | 875 Hz | 1351.8 | 0.0162 | 1x, risk sd 0 | duration gap 0.131s > 0.08s; risk improvement -0.38 < 0.25; centroid did not improve (-65.2 Hz) |
| Grid triangle step 0.051 volume 0.0054 tone 0.00085/0.21 | 3.68 | centroid | 0.06s | 879.3 Hz | 1456.2 | 0.0087 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; centroid did not improve (-69.5 Hz) |
| Grid sine step 0.049 volume 0.0054 tone 0.00125/0.21 | 3.69 | centroid | 0.03s | 906.6 Hz | 1434.9 | 0.0054 | 1x, risk sd 0 | risk improvement -0.4 < 0.25; centroid did not improve (-96.8 Hz) |
| Grid triangle step 0.053 volume 0.0054 tone 0.00085/0.21 | 3.69 | centroid | 0.06s | 902.2 Hz | 1400.6 | 0.0093 | 1x, risk sd 0 | risk improvement -0.4 < 0.25; centroid did not improve (-92.4 Hz) |
| Grid triangle step 0.047 volume 0.0058 tone 0.00125/0.21 | 3.69 | centroid | 0.06s | 900.3 Hz | 1404.3 | 0.0098 | 1x, risk sd 0 | risk improvement -0.4 < 0.25; centroid did not improve (-90.5 Hz) |
| Thin bright square micro held | 3.71 | centroid | 0.04s | 842 Hz | 1454.3 | 0.0223 | 1x, risk sd 0 | risk improvement -0.42 < 0.25; centroid did not improve (-32.2 Hz) |
| Grid sine step 0.053 volume 0.005 tone 0.00105/0.21 | 3.71 | centroid | 0.129s | 869.3 Hz | 1400.7 | 0.0171 | 1x, risk sd 0 | duration gap 0.129s > 0.08s; risk improvement -0.42 < 0.25; centroid did not improve (-59.5 Hz) |
| Sparkle low RMS square edge | 3.72 | centroid | 0.06s | 904.6 Hz | 1406.2 | 0.012 | 1x, risk sd 0 | risk improvement -0.43 < 0.25; centroid did not improve (-94.8 Hz) |
| Grid sine step 0.055 volume 0.0046 tone 0.00125/0.21 | 3.72 | centroid | 0.06s | 912 Hz | 1393.2 | 0.0118 | 1x, risk sd 0 | risk improvement -0.43 < 0.25; centroid did not improve (-102.2 Hz) |
| Grid triangle step 0.049 volume 0.0054 tone 0.00085/0.21 | 3.74 | centroid | 0.06s | 919.4 Hz | 1409.9 | 0.0105 | 1x, risk sd 0 | risk improvement -0.45 < 0.25; centroid did not improve (-109.6 Hz) |
| Grid sine step 0.047 volume 0.0054 tone 0.00125/0.21 | 3.75 | centroid | 0.02s | 924.7 Hz | 1458.5 | 0.0059 | 1x, risk sd 0 | risk improvement -0.46 < 0.25; centroid did not improve (-114.9 Hz) |
| Grid sine step 0.047 volume 0.0054 tone 0.00145/0.21 | 3.75 | centroid | 0.039s | 865.2 Hz | 1547.3 | 0.0117 | 1x, risk sd 0 | risk improvement -0.46 < 0.25; centroid did not improve (-55.4 Hz) |
| Low RMS brighter | 3.77 | centroid | 0.06s | 955 Hz | 1375.2 | 0.0088 | 1x, risk sd 0 | risk improvement -0.48 < 0.25; centroid did not improve (-145.2 Hz) |
| Grid triangle step 0.049 volume 0.0054 tone 0.00145/0.21 | 3.78 | centroid | 0.149s | 878.1 Hz | 1421.3 | 0.0206 | 1x, risk sd 0 | duration gap 0.149s > 0.08s; risk improvement -0.49 < 0.25; centroid did not improve (-68.3 Hz) |
| High square stair | 3.8 | centroid | 0.121s | 933.2 Hz | 1460.6 | 0.0058 | 1x, risk sd 0 | duration gap 0.121s > 0.08s; risk improvement -0.51 < 0.25; centroid did not improve (-123.4 Hz) |
| Low RMS square edge | 3.9 | centroid | 0.249s | 918.9 Hz | 1492.7 | 0.013 | 1x, risk sd 0 | duration gap 0.249s > 0.08s; risk improvement -0.61 < 0.25; centroid did not improve (-109.1 Hz) |
| Thin bright square soft attack held | 4.08 | centroid | 0.131s | 953.7 Hz | 1497.7 | 0.031 | 1x, risk sd 0 | duration gap 0.131s > 0.08s; risk improvement -0.79 < 0.25; centroid did not improve (-143.9 Hz) |

## Next Step

Expand the candidate generator around the best measured direction instead of manually changing the game pack.

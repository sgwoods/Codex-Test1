# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:27:55.202Z`
Commit: `17ce604`

## Problem

Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.

## Strategy

Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift. The comparison now includes spectral band-shape, rolloff, and envelope segmentation so future searches can target timbre instead of only duration and centroid.

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
| Thin bright square top | 4.14 | centroid | 0.171s | 741.3 Hz | 0.1318 | 0.116 | 0.1121 | 1x, risk sd 0 | duration gap 0.171s > 0.08s |
| Thin bright square quiet held | 4.4 | centroid | 0.14s | 612.8 Hz | 0.1371 | 0.356 | 0.1295 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; RMS worsened by 0.024 |
| Thin bright square long low held | 4.54 | centroid | 0.31s | 696 Hz | 0.1429 | 0.345 | 0.0511 | 1x, risk sd 0 | duration gap 0.31s > 0.08s |
| Thin bright triangle ladder | 4.58 | centroid | 0s | 843.5 Hz | 0.1367 | 0.214 | 0.1147 | 1x, risk sd 0 | clears keeper gates |
| Thin bright square soft held | 4.58 | centroid | 0.031s | 746.3 Hz | 0.1274 | 0.223 | 0.1318 | 1x, risk sd 0 | RMS worsened by 0.0263 |
| Thin bright square balanced held | 4.58 | centroid | 0.06s | 755 Hz | 0.1441 | 0.353 | 0.1215 | 1x, risk sd 0 | RMS worsened by 0.016 |
| Thin bright square held | 4.67 | centroid | 0.02s | 720.2 Hz | 0.1492 | 0.366 | 0.1455 | 1x, risk sd 0 | RMS worsened by 0.04 |
| Segmented 520/1047/2349 0.14/0.22/0.13 | 4.67 | centroid | 0.12s | 741.1 Hz | 0.2125 | 0.116 | 0.003 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0497 |
| Sparkle low RMS | 4.72 | centroid | 0.06s | 780.2 Hz | 0.2348 | 0.129 | 0.0131 | 1x, risk sd 0 | spectral band shape worsened by 0.072 |
| Sparkle low RMS centered ZCR | 4.74 | centroid | 0.151s | 780 Hz | 0.2354 | 0.061 | 0.0161 | 1x, risk sd 0 | duration gap 0.151s > 0.08s; spectral band shape worsened by 0.0726 |
| Segmented 520/1047/2637 0.16/0.24/0.11 | 4.77 | centroid | 0.12s | 760.7 Hz | 0.2131 | 0.119 | 0.0073 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; spectral band shape worsened by 0.0503 |
| Low RMS harmonic | 4.81 | centroid | 0.08s | 702.9 Hz | 0.2114 | 0.326 | 0.0042 | 1x, risk sd 0 | risk improvement 0.21 < 0.25; spectral band shape worsened by 0.0486 |
| Sparkle with light noise | 4.83 | centroid | 0.06s | 759.4 Hz | 0.2102 | 0.22 | 0.0089 | 1x, risk sd 0 | risk improvement 0.19 < 0.25; spectral band shape worsened by 0.0474 |
| Segmented 520/1047/2637 0.14/0.22/0.13 | 4.85 | centroid | 0.12s | 802.8 Hz | 0.2246 | 0.307 | 0.0049 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.17 < 0.25; spectral band shape worsened by 0.0618 |
| Segmented 520/1047/2637 0.16/0.24/0.11 | 4.91 | centroid | 0.099s | 763.5 Hz | 0.2066 | 0.348 | 0.0122 | 1x, risk sd 0 | duration gap 0.099s > 0.08s; risk improvement 0.11 < 0.25; spectral band shape worsened by 0.0438 |
| Segmented 520/1047/2637 0.14/0.26/0.09 | 4.94 | centroid | 0.12s | 863.5 Hz | 0.2472 | 0.079 | 0.0052 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.08 < 0.25; spectral band shape worsened by 0.0844 |
| Staccato bright | 4.96 | centroid | 0.06s | 882.3 Hz | 0.2445 | 0.211 | 0.0031 | 1x, risk sd 0 | risk improvement 0.06 < 0.25; spectral band shape worsened by 0.0817 |
| Segmented 520/1047/2637 0.14/0.22/0.13 | 4.96 | centroid | 0.12s | 808.6 Hz | 0.2253 | 0.359 | 0.0049 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.06 < 0.25; spectral band shape worsened by 0.0625 |
| Segmented 520/1047/2349 0.14/0.26/0.09 | 4.96 | centroid | 0.12s | 852.3 Hz | 0.2335 | 0.242 | 0.0014 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.06 < 0.25; spectral band shape worsened by 0.0707 |
| Segmented 660/1047/2637 0.14/0.26/0.09 | 4.98 | centroid | 0.12s | 840 Hz | 0.2298 | 0.322 | 0.0014 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement 0.04 < 0.25; spectral band shape worsened by 0.067 |
| Current Aurora baseline | 5.02 | centroid | 0.06s | 963.8 Hz | 0.1628 | 0.37 | 0.1055 | 1x, risk sd 0 | baseline |
| Segmented 660/1047/2637 0.16/0.24/0.11 | 5.02 | centroid | 0.11s | 846.1 Hz | 0.2359 | 0.351 | 0.0048 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement 0 < 0.25; spectral band shape worsened by 0.0731 |
| Thin bright square quiet tail | 5.04 | centroid | 0.041s | 756.5 Hz | 0.2253 | 0.347 | 0.0134 | 1x, risk sd 0 | risk improvement -0.02 < 0.25; spectral band shape worsened by 0.0625 |
| Sparkle low RMS square edge | 5.06 | centroid | 0.06s | 770.4 Hz | 0.2339 | 0.405 | 0.0154 | 1x, risk sd 0 | risk improvement -0.04 < 0.25; spectral band shape worsened by 0.0711 |
| Thin bright square micro held | 5.08 | centroid | 0.03s | 806.1 Hz | 0.2263 | 0.349 | 0.024 | 1x, risk sd 0 | risk improvement -0.06 < 0.25; spectral band shape worsened by 0.0635 |
| Segmented 660/1047/2637 0.18/0.26/0.09 | 5.1 | centroid | 0.12s | 906.5 Hz | 0.2491 | 0.154 | 0.0076 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.08 < 0.25; spectral band shape worsened by 0.0863 |
| Segmented 660/1047/2637 0.14/0.22/0.13 | 5.11 | centroid | 0.12s | 852.8 Hz | 0.2343 | 0.361 | 0.0072 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0715 |
| Segmented 520/1047/2637 0.18/0.26/0.09 | 5.13 | centroid | 0.06s | 848.3 Hz | 0.2461 | 0.293 | 0.0078 | 1x, risk sd 0 | risk improvement -0.11 < 0.25; spectral band shape worsened by 0.0833 |
| Segmented 660/1047/2637 0.14/0.26/0.09 | 5.16 | centroid | 0.12s | 831 Hz | 0.2324 | 0.411 | 0.0057 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.14 < 0.25; spectral band shape worsened by 0.0696 |
| High square stair | 5.16 | centroid | 0.141s | 880.6 Hz | 0.2555 | 0.291 | 0.0066 | 1x, risk sd 0 | duration gap 0.141s > 0.08s; risk improvement -0.14 < 0.25; spectral band shape worsened by 0.0927 |
| Octave chime thin | 5.18 | centroid | 0.12s | 821.6 Hz | 0.2301 | 0.363 | 0.0188 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0673 |
| Segmented 520/1047/2349 0.18/0.26/0.09 | 5.18 | centroid | 0.12s | 871.9 Hz | 0.2349 | 0.336 | 0.0074 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0721 |
| Segmented 520/1047/2349 0.16/0.24/0.11 | 5.24 | centroid | 0.11s | 884.4 Hz | 0.2471 | 0.317 | 0.0112 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.22 < 0.25; spectral band shape worsened by 0.0843 |
| Thin bright square split low held | 5.29 | centroid | 0.05s | 853 Hz | 0.232 | 0.381 | 0.0171 | 1x, risk sd 0 | risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0692 |
| Sparkle short tail | 5.29 | centroid | 0.1s | 906.8 Hz | 0.2505 | 0.389 | 0.0036 | 1x, risk sd 0 | duration gap 0.1s > 0.08s; risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0877 |
| Segmented 520/1047/2637 0.14/0.26/0.09 | 5.29 | centroid | 0.12s | 888.1 Hz | 0.2386 | 0.428 | 0.003 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.27 < 0.25; spectral band shape worsened by 0.0758 |
| Low RMS square edge | 5.32 | centroid | 0.23s | 807.5 Hz | 0.2344 | 0.439 | 0.0153 | 1x, risk sd 0 | duration gap 0.23s > 0.08s; risk improvement -0.3 < 0.25; spectral band shape worsened by 0.0716 |
| Low RMS brighter | 5.41 | centroid | 0.16s | 951.5 Hz | 0.2593 | 0.379 | 0.0002 | 1x, risk sd 0 | duration gap 0.16s > 0.08s; risk improvement -0.39 < 0.25; spectral band shape worsened by 0.0965 |
| Thin bright square soft attack held | 5.5 | centroid | 0.021s | 909.7 Hz | 0.2585 | 0.36 | 0.0352 | 1x, risk sd 0 | risk improvement -0.48 < 0.25; spectral band shape worsened by 0.0957 |

## Next Step

Promote the recommended cue spec into the Aurora application audio theme, then run the full audio theme comparison and event-gap analysis.

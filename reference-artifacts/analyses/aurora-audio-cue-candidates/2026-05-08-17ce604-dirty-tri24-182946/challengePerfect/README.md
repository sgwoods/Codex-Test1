# Aurora Challenge Perfect Audio Candidate Loop

Generated: `2026-05-08T18:29:46.528Z`
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
- Measured best: `thin-bright-square-soft-held`
- Reason: Selected candidate clears risk, centroid, RMS, band-shape, and duration gates. The measured-lowest-risk candidate is tracked separately so the next sweep can still learn from it.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Thin bright square long low held | 4.18 | centroid | 0.31s | 683.8 Hz | 0.1362 | 0.19 | 0.0544 | 1x, risk sd 0 | duration gap 0.31s > 0.08s |
| Thin bright square soft held | 4.29 | centroid | 0.011s | 655.6 Hz | 0.1187 | 0.167 | 0.129 | 1x, risk sd 0 | RMS worsened by 0.0226 |
| Thin bright square quiet held | 4.4 | centroid | 0.11s | 673.6 Hz | 0.1472 | 0.288 | 0.1301 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; RMS worsened by 0.0237 |
| Thin bright square top | 4.47 | centroid | 0.151s | 771.8 Hz | 0.1377 | 0.376 | 0.1133 | 1x, risk sd 0 | duration gap 0.151s > 0.08s |
| Thin bright square held | 4.51 | centroid | 0.02s | 649.5 Hz | 0.1393 | 0.384 | 0.1456 | 1x, risk sd 0 | RMS worsened by 0.0392 |
| Thin bright square balanced held | 4.55 | centroid | 0.039s | 755.9 Hz | 0.1486 | 0.404 | 0.1218 | 1x, risk sd 0 | RMS worsened by 0.0154 |
| Triangle neighborhood 0.048/0.0064/0.0023/0.16/3136 | 4.59 | centroid | 0.06s | 810.4 Hz | 0.2356 | 0.119 | 0.0025 | 1x, risk sd 0 | spectral band shape worsened by 0.0782 |
| Thin bright triangle ladder | 4.61 | centroid | 0s | 858.1 Hz | 0.1384 | 0.129 | 0.115 | 1x, risk sd 0 | clears keeper gates |
| Triangle neighborhood 0.05/0.0064/0.0018/0.16/3136 | 4.77 | centroid | 0.06s | 767.7 Hz | 0.2086 | 0.241 | 0.0119 | 1x, risk sd 0 | risk improvement 0.2 < 0.25; spectral band shape worsened by 0.0512 |
| Sparkle with light noise | 4.78 | centroid | 0s | 747.8 Hz | 0.214 | 0.263 | 0.0012 | 1x, risk sd 0 | risk improvement 0.19 < 0.25; spectral band shape worsened by 0.0566 |
| Triangle neighborhood 0.046/0.0064/0.0018/0.16/3136 | 4.8 | centroid | 0.001s | 783.3 Hz | 0.2126 | 0.29 | 0.0103 | 1x, risk sd 0 | risk improvement 0.17 < 0.25; spectral band shape worsened by 0.0552 |
| Triangle neighborhood 0.046/0.0064/0.0023/0.16/3136 | 4.86 | centroid | 0s | 753.1 Hz | 0.2107 | 0.404 | 0.003 | 1x, risk sd 0 | risk improvement 0.11 < 0.25; spectral band shape worsened by 0.0533 |
| Triangle neighborhood 0.046/0.0064/0.0018/0.16/2794 | 4.86 | centroid | 0.06s | 803.4 Hz | 0.2152 | 0.254 | 0.0113 | 1x, risk sd 0 | risk improvement 0.11 < 0.25; spectral band shape worsened by 0.0578 |
| Triangle neighborhood 0.046/0.0064/0.0028/0.16/3136 | 4.87 | centroid | 0.06s | 770.4 Hz | 0.211 | 0.188 | 0.0068 | 1x, risk sd 0 | risk improvement 0.1 < 0.25; spectral band shape worsened by 0.0536 |
| Triangle neighborhood 0.05/0.0064/0.0018/0.16/2794 | 4.88 | centroid | 0.06s | 802 Hz | 0.2142 | 0.235 | 0.0054 | 1x, risk sd 0 | risk improvement 0.09 < 0.25; spectral band shape worsened by 0.0568 |
| Thin bright square micro held | 4.92 | centroid | 0.02s | 823.5 Hz | 0.2339 | 0.107 | 0.0257 | 1x, risk sd 0 | risk improvement 0.05 < 0.25; spectral band shape worsened by 0.0765 |
| Low RMS harmonic | 4.93 | centroid | 0.05s | 761.3 Hz | 0.2112 | 0.375 | 0.0112 | 1x, risk sd 0 | risk improvement 0.04 < 0.25; spectral band shape worsened by 0.0538 |
| Triangle neighborhood 0.046/0.0064/0.0018/0.16/3136 | 4.96 | centroid | 0.06s | 860.3 Hz | 0.244 | 0.283 | 0.0022 | 1x, risk sd 0 | risk improvement 0.01 < 0.25; spectral band shape worsened by 0.0866 |
| Current Aurora baseline | 4.97 | centroid | 0.06s | 929 Hz | 0.1574 | 0.371 | 0.1064 | 1x, risk sd 0 | baseline |
| Sparkle low RMS | 4.99 | centroid | 0.06s | 891.8 Hz | 0.2445 | 0.104 | 0.0139 | 1x, risk sd 0 | risk improvement -0.02 < 0.25; spectral band shape worsened by 0.0871 |
| Triangle neighborhood 0.048/0.0064/0.0023/0.16/3520 | 5.02 | centroid | 0.11s | 752.8 Hz | 0.213 | 0.4 | 0.0103 | 1x, risk sd 0 | duration gap 0.11s > 0.08s; risk improvement -0.05 < 0.25; spectral band shape worsened by 0.0556 |
| Triangle neighborhood 0.048/0.0064/0.0018/0.16/3520 | 5.03 | centroid | 0.06s | 834.1 Hz | 0.2327 | 0.323 | 0.0034 | 1x, risk sd 0 | risk improvement -0.06 < 0.25; spectral band shape worsened by 0.0753 |
| Staccato bright | 5.04 | centroid | 0.06s | 845.2 Hz | 0.2426 | 0.316 | 0.0042 | 1x, risk sd 0 | risk improvement -0.07 < 0.25; spectral band shape worsened by 0.0852 |
| Triangle neighborhood 0.046/0.007/0.0018/0.16/3520 | 5.06 | centroid | 0.149s | 822.8 Hz | 0.2228 | 0.313 | 0.0114 | 1x, risk sd 0 | duration gap 0.149s > 0.08s; risk improvement -0.09 < 0.25; spectral band shape worsened by 0.0654 |
| Sparkle short tail | 5.07 | centroid | 0.1s | 848.2 Hz | 0.2328 | 0.371 | 0.0006 | 1x, risk sd 0 | duration gap 0.1s > 0.08s; risk improvement -0.1 < 0.25; spectral band shape worsened by 0.0754 |
| Triangle neighborhood 0.046/0.007/0.0018/0.16/2794 | 5.07 | centroid | 0.1s | 838.5 Hz | 0.2222 | 0.368 | 0.0021 | 1x, risk sd 0 | duration gap 0.1s > 0.08s; risk improvement -0.1 < 0.25; spectral band shape worsened by 0.0648 |
| Triangle neighborhood 0.046/0.0064/0.0023/0.16/3520 | 5.11 | centroid | 0.06s | 890.3 Hz | 0.2502 | 0.346 | 0 | 1x, risk sd 0 | risk improvement -0.14 < 0.25; spectral band shape worsened by 0.0928 |
| Thin bright square quiet tail | 5.12 | centroid | 0.031s | 802.3 Hz | 0.2186 | 0.356 | 0.0189 | 1x, risk sd 0 | risk improvement -0.15 < 0.25; spectral band shape worsened by 0.0612 |
| Triangle neighborhood 0.048/0.0064/0.0018/0.16/3136 | 5.13 | centroid | 0.06s | 899.3 Hz | 0.2505 | 0.348 | 0.0006 | 1x, risk sd 0 | risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0931 |
| Triangle neighborhood 0.048/0.0064/0.0018/0.16/3520 | 5.13 | centroid | 0.06s | 876.1 Hz | 0.2481 | 0.379 | 0.0023 | 1x, risk sd 0 | risk improvement -0.16 < 0.25; spectral band shape worsened by 0.0907 |
| Sparkle low RMS centered ZCR | 5.14 | centroid | 0.151s | 855.6 Hz | 0.2363 | 0.353 | 0.015 | 1x, risk sd 0 | duration gap 0.151s > 0.08s; risk improvement -0.17 < 0.25; spectral band shape worsened by 0.0789 |
| High square stair | 5.16 | centroid | 0.06s | 873.2 Hz | 0.259 | 0.299 | 0.0085 | 1x, risk sd 0 | risk improvement -0.19 < 0.25; spectral band shape worsened by 0.1016 |
| Octave chime thin | 5.2 | centroid | 0.12s | 824.1 Hz | 0.2361 | 0.368 | 0.0195 | 1x, risk sd 0 | duration gap 0.12s > 0.08s; risk improvement -0.23 < 0.25; spectral band shape worsened by 0.0787 |
| Sparkle low RMS square edge | 5.25 | centroid | 0.06s | 899.9 Hz | 0.2483 | 0.383 | 0.01 | 1x, risk sd 0 | risk improvement -0.28 < 0.25; spectral band shape worsened by 0.0909 |
| Thin bright square split low held | 5.26 | centroid | 0.06s | 871.4 Hz | 0.2327 | 0.361 | 0.0153 | 1x, risk sd 0 | risk improvement -0.29 < 0.25; spectral band shape worsened by 0.0753 |
| Triangle neighborhood 0.048/0.0064/0.0023/0.16/2794 | 5.29 | centroid | 0.06s | 882.8 Hz | 0.253 | 0.421 | 0.0125 | 1x, risk sd 0 | risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0956 |
| Triangle neighborhood 0.048/0.0064/0.0018/0.16/3136 | 5.29 | centroid | 0.189s | 853.5 Hz | 0.226 | 0.411 | 0.0138 | 1x, risk sd 0 | duration gap 0.189s > 0.08s; risk improvement -0.32 < 0.25; spectral band shape worsened by 0.0686 |
| Triangle neighborhood 0.046/0.0064/0.0023/0.16/3136 | 5.31 | centroid | 0.06s | 884.6 Hz | 0.2501 | 0.399 | 0.0078 | 1x, risk sd 0 | risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0927 |
| Triangle neighborhood 0.048/0.0064/0.0018/0.16/2794 | 5.31 | centroid | 0.149s | 870.2 Hz | 0.2452 | 0.422 | 0.0151 | 1x, risk sd 0 | duration gap 0.149s > 0.08s; risk improvement -0.34 < 0.25; spectral band shape worsened by 0.0878 |
| Triangle neighborhood 0.046/0.0064/0.0018/0.16/3520 | 5.32 | centroid | 0.01s | 879.9 Hz | 0.2464 | 0.454 | 0.0106 | 1x, risk sd 0 | risk improvement -0.35 < 0.25; spectral band shape worsened by 0.089 |
| Triangle neighborhood 0.046/0.007/0.0018/0.16/3136 | 5.33 | centroid | 0s | 894 Hz | 0.2522 | 0.412 | 0.009 | 1x, risk sd 0 | risk improvement -0.36 < 0.25; spectral band shape worsened by 0.0948 |
| Low RMS brighter | 5.33 | centroid | 0.14s | 903.4 Hz | 0.2565 | 0.384 | 0.0015 | 1x, risk sd 0 | duration gap 0.14s > 0.08s; risk improvement -0.36 < 0.25; spectral band shape worsened by 0.0991 |
| Triangle neighborhood 0.046/0.0064/0.0023/0.16/2794 | 5.36 | centroid | 0.06s | 914.9 Hz | 0.2536 | 0.394 | 0.0074 | 1x, risk sd 0 | risk improvement -0.39 < 0.25; spectral band shape worsened by 0.0962 |
| Thin bright square soft attack held | 5.37 | centroid | 0.021s | 907.5 Hz | 0.2611 | 0.222 | 0.0361 | 1x, risk sd 0 | risk improvement -0.4 < 0.25; spectral band shape worsened by 0.1037 |
| Triangle neighborhood 0.05/0.0064/0.0018/0.16/3520 | 5.38 | centroid | 0.06s | 908.5 Hz | 0.2545 | 0.405 | 0.0101 | 1x, risk sd 0 | risk improvement -0.41 < 0.25; spectral band shape worsened by 0.0971 |
| Low RMS square edge | 5.43 | centroid | 0.23s | 891.7 Hz | 0.2485 | 0.436 | 0.017 | 1x, risk sd 0 | duration gap 0.23s > 0.08s; risk improvement -0.46 < 0.25; spectral band shape worsened by 0.0911 |
| Triangle neighborhood 0.048/0.0064/0.0018/0.16/2794 | 5.46 | centroid | 0s | 945.3 Hz | 0.2575 | 0.425 | 0.0064 | 1x, risk sd 0 | risk improvement -0.49 < 0.25; centroid did not improve (-16.3 Hz); spectral band shape worsened by 0.1001 |

## Next Step

Promote the recommended cue spec into the Aurora application audio theme, then run the full audio theme comparison and event-gap analysis.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

# Aurora Audio Theme Comparison

- Generated from commit `beb232a`
- Version: `1.3.0`
- Generated at: `2026-05-07T13:33:33.955Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9752 | 0.2565 | 1288.3 | 2043.2 | 0.010-3.712s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2572 | 1288.1 | 2068.7 | 0.000-3.722s | n/a | n/a |
| Ambience / Convoy | 8.034 | 0.2267 | 0.0848 | 1175.0 | 577.3 | 1.147-7.942s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `4.074s`; Aurora duration delta vs reference = `4.074s`.
- Quick read: synthetic Galaga centroid delta vs reference = `113.1Hz`; Aurora centroid delta vs reference = `113.3Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `3.093s`; centroid delta = `137.6Hz`.
- Candidate reference subwindows: 2.299-6.001s score 0.544.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.6093 | 0.0813 | 1220.7 | 600.3 | 1.985-3.960s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.5486 | 0.0809 | 1168.9 | 585.9 | 0.000-3.960s | n/a | n/a |
| Start | 7.012 | 0.8508 | 0.2606 | 1392.3 | 2234.5 | 0.718-6.545s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `3.052s`; Aurora duration delta vs reference = `3.052s`.
- Quick read: synthetic Galaga centroid delta vs reference = `223.4Hz`; Aurora centroid delta vs reference = `171.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `3.852s`; centroid delta = `253.9Hz`.
- Candidate reference subwindows: 0.000-1.975s score 0.582; 4.998-6.973s score 0.488; 2.799-4.774s score 0.484.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.8850 | 0.2539 | 1128.0 | 1881.0 | 0.000-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8190 | 0.2538 | 1224.8 | 1898.8 | 0.000-0.840s | n/a | n/a |
| Ambience / Convoy | 8.034 | 0.2267 | 0.0848 | 1175.0 | 577.3 | 1.147-7.942s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `7.194s`; Aurora duration delta vs reference = `7.194s`.
- Quick read: synthetic Galaga centroid delta vs reference = `49.8Hz`; Aurora centroid delta vs reference = `47.0Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `5.955s`; centroid delta = `47.3Hz`.
- Candidate reference subwindows: 1.649-2.489s score 0.584; 5.647-6.487s score 0.581; 2.599-3.439s score 0.577.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2561 | 1296.2 | 2075.8 | 0.000-3.732s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9266 | 0.2591 | 1281.7 | 2077.3 | 0.000-3.762s | n/a | n/a |
| Tractor Beam | 4.040 | 0.8581 | 0.3136 | 1829.9 | 2144.4 | 0.189-3.512s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.080s`; Aurora duration delta vs reference = `0.080s`.
- Quick read: synthetic Galaga centroid delta vs reference = `548.2Hz`; Aurora centroid delta vs reference = `533.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.409s`; centroid delta = `536.2Hz`.
- Candidate reference subwindows: 0.300-4.032s score 0.750.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2564 | 1296.5 | 2091.4 | 0.000-3.752s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2569 | 1286.3 | 2055.6 | 0.010-3.712s | n/a | n/a |
| Fighter Captured | 6.037 | 0.6662 | 0.1487 | 1966.8 | 1901.7 | 0.170-6.037s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.077s`; Aurora duration delta vs reference = `2.077s`.
- Quick read: synthetic Galaga centroid delta vs reference = `680.5Hz`; Aurora centroid delta vs reference = `670.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `2.116s`; centroid delta = `669.4Hz`.
- Candidate reference subwindows: 0.250-4.002s score 0.643.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9172 | 0.2559 | 1290.2 | 2082.8 | 0.000-3.732s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2559 | 1298.1 | 2086.9 | 0.000-3.732s | n/a | n/a |
| Captured Fighter Destroyed | 3.019 | 0.8836 | 0.1949 | 1393.9 | 2037.7 | 0.000-3.019s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.941s`; Aurora duration delta vs reference = `0.941s`.
- Quick read: synthetic Galaga centroid delta vs reference = `95.8Hz`; Aurora centroid delta vs reference = `103.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.713s`; centroid delta = `104.1Hz`.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2592 | 1281.8 | 2072.2 | 0.130-3.772s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9956 | 0.2566 | 1288.9 | 2076.5 | 0.010-3.712s | n/a | n/a |
| Fighter Rescued (Double Ship) | 4.040 | 0.4290 | 0.0979 | 1532.1 | 1374.4 | 0.000-4.011s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.080s`; Aurora duration delta vs reference = `0.080s`.
- Quick read: synthetic Galaga centroid delta vs reference = `243.2Hz`; Aurora centroid delta vs reference = `250.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.369s`; centroid delta = `238.8Hz`.
- Candidate reference subwindows: 0.050-3.692s score 0.535.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2562 | 1288.8 | 2081.3 | 0.000-3.722s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9649 | 0.2583 | 1292.1 | 2059.6 | 0.000-3.732s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.917s`; Aurora duration delta vs reference = `1.917s`.
- Quick read: synthetic Galaga centroid delta vs reference = `330.0Hz`; Aurora centroid delta vs reference = `326.7Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.754s`; centroid delta = `326.1Hz`.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.080 | 0.8577 | 0.2543 | 1216.2 | 1910.2 | 0.000-1.080s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.080 | 0.8182 | 0.2545 | 1198.5 | 1940.7 | 0.000-1.080s | n/a | n/a |
| Challenging Stage | 3.019 | 0.9491 | 0.1601 | 1474.2 | 1296.0 | 0.000-2.375s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.939s`; Aurora duration delta vs reference = `1.939s`.
- Quick read: synthetic Galaga centroid delta vs reference = `275.7Hz`; Aurora centroid delta vs reference = `258.0Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `1.295s`; centroid delta = `257.0Hz`.
- Candidate reference subwindows: 0.900-1.980s score 0.884.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.560 | 0.8263 | 0.2529 | 1254.1 | 2084.6 | 0.000-1.560s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.560 | 0.8850 | 0.2531 | 1226.7 | 2123.7 | 0.000-1.317s | n/a | n/a |
| Challenging Stage Results | 4.040 | 0.2975 | 0.0868 | 1900.3 | 2277.3 | 0.000-4.021s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.480s`; Aurora duration delta vs reference = `2.480s`.
- Quick read: synthetic Galaga centroid delta vs reference = `673.6Hz`; Aurora centroid delta vs reference = `646.2Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `2.461s`; centroid delta = `655.9Hz`.
- Candidate reference subwindows: 0.000-1.560s score 0.630; 1.649-3.209s score 0.602.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.740 | 0.8536 | 0.2575 | 1267.9 | 2147.7 | 0.000-1.740s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.740 | 0.8577 | 0.2569 | 1252.4 | 2093.7 | 0.000-1.740s | n/a | n/a |
| Challenging Stage Perfect | 4.040 | 0.4380 | 0.1263 | 2423.0 | 2978.8 | 0.000-4.040s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.300s`; Aurora duration delta vs reference = `2.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1170.6Hz`; Aurora centroid delta vs reference = `1155.1Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `2.300s`; centroid delta = `1155.1Hz`.
- Candidate reference subwindows: 0.000-1.740s score 0.496; 1.799-3.539s score 0.299.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2562 | 1293.7 | 2063.9 | 0.000-3.702s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9712 | 0.2561 | 1293.4 | 2044.2 | 0.000-3.702s | n/a | n/a |
| Name Entry (1st) | 8.034 | 0.9478 | 0.1954 | 1766.9 | 2077.4 | 0.000-6.695s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `4.074s`; Aurora duration delta vs reference = `4.074s`.
- Quick read: synthetic Galaga centroid delta vs reference = `473.5Hz`; Aurora centroid delta vs reference = `473.2Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `2.993s`; centroid delta = `469.5Hz`.
- Candidate reference subwindows: 3.598-7.300s score 0.793.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9735 | 0.2564 | 1288.1 | 2055.8 | 0.010-3.712s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2582 | 1280.8 | 2062.6 | 0.000-3.732s | n/a | n/a |
| Name Entry (2nd-5th) | 15.000 | 1.0000 | 0.2555 | 1707.1 | 2641.1 | 0.399-14.497s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `11.040s`; Aurora duration delta vs reference = `11.040s`.
- Quick read: synthetic Galaga centroid delta vs reference = `426.3Hz`; Aurora centroid delta vs reference = `419.0Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `10.396s`; centroid delta = `410.4Hz`.
- Candidate reference subwindows: 11.295-14.997s score 0.786; 2.149-5.851s score 0.730; 7.547-11.249s score 0.681.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9366 | 0.2590 | 1284.0 | 2062.9 | 0.110-3.742s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2563 | 1294.4 | 2042.2 | 0.000-3.702s | n/a | n/a |
| Last Ship Destroyed Ambience | 14.002 | 0.7676 | 0.1931 | 1455.1 | 840.5 | 3.771-14.002s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `10.042s`; Aurora duration delta vs reference = `10.042s`.
- Quick read: synthetic Galaga centroid delta vs reference = `160.7Hz`; Aurora centroid delta vs reference = `171.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `6.598s`; centroid delta = `166.5Hz`.
- Candidate reference subwindows: 2.449-6.081s score 0.805; 6.097-9.729s score 0.505; 10.295-13.927s score 0.459.

## Summary

- Items: 14
- Broad reference windows needing tighter segmentation: 7
- Candidate reference subwindows found: 22
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.178s`
- Average active Aurora-vs-reference duration delta: `3.236s`
- Average active Aurora-vs-reference centroid delta: `387.7Hz`

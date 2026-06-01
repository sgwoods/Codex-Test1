# Aurora Audio Theme Comparison

- Generated from commit `255ff96`
- Version: `1.3.0`
- Generated at: `2026-05-08T11:44:21.163Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9554 | 0.2575 | 1286.8 | 2034.8 | 0.000-3.692s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9265 | 0.2572 | 1291.2 | 2056.3 | 0.000-3.682s | n/a | n/a |
| Ambience / Convoy | 8.034 | 0.2267 | 0.0848 | 1175.0 | 577.3 | 1.147-7.942s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `4.074s`; Aurora duration delta vs reference = `4.074s`.
- Quick read: synthetic Galaga centroid delta vs reference = `116.2Hz`; Aurora centroid delta vs reference = `111.8Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `3.103s`; centroid delta = `113.6Hz`.
- Candidate reference subwindows: 4.148-7.840s score 0.546; 0.200-3.892s score 0.538.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.5192 | 0.0812 | 1181.4 | 601.8 | 1.945-3.960s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.5192 | 0.0812 | 1176.0 | 617.9 | 1.985-3.960s | n/a | n/a |
| Start | 7.012 | 0.8508 | 0.2606 | 1392.3 | 2234.5 | 0.718-6.545s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `3.052s`; Aurora duration delta vs reference = `3.052s`.
- Quick read: synthetic Galaga centroid delta vs reference = `216.3Hz`; Aurora centroid delta vs reference = `210.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `3.812s`; centroid delta = `212.7Hz`.
- Candidate reference subwindows: 0.000-2.015s score 0.589; 4.948-6.963s score 0.501; 2.899-4.914s score 0.497.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.8490 | 0.2528 | 1153.6 | 1922.6 | 0.000-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8577 | 0.2535 | 1172.4 | 1881.0 | 0.000-0.840s | n/a | n/a |
| Ambience / Convoy | 8.034 | 0.2267 | 0.0848 | 1175.0 | 577.3 | 1.147-7.942s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `7.194s`; Aurora duration delta vs reference = `7.194s`.
- Quick read: synthetic Galaga centroid delta vs reference = `2.6Hz`; Aurora centroid delta vs reference = `21.4Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `5.955s`; centroid delta = `21.7Hz`.
- Candidate reference subwindows: 1.649-2.489s score 0.592; 5.997-6.837s score 0.589; 6.997-7.837s score 0.584.

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9465 | 0.2561 | 1285.5 | 2051.3 | 0.000-3.672s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9308 | 0.2562 | 1284.9 | 2050.3 | 0.000-3.672s | n/a | n/a |
| Flagship/Fighter Shot | 2.043 | 0.8867 | 0.1428 | 1891.5 | 1063.0 | 0.090-1.367s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.917s`; Aurora duration delta vs reference = `1.917s`.
- Quick read: synthetic Galaga centroid delta vs reference = `606.6Hz`; Aurora centroid delta vs reference = `606.0Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.395s`; centroid delta = `605.7Hz`.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2557 | 1291.9 | 2085.1 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2553 | 1286.4 | 2064.9 | 0.000-3.672s | n/a | n/a |
| Flagship/Fighter Shot | 2.043 | 0.8867 | 0.1428 | 1891.5 | 1063.0 | 0.090-1.367s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.917s`; Aurora duration delta vs reference = `1.917s`.
- Quick read: synthetic Galaga centroid delta vs reference = `605.1Hz`; Aurora centroid delta vs reference = `599.6Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.405s`; centroid delta = `598.6Hz`.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2556 | 1292.8 | 2071.5 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2556 | 1292.8 | 2071.5 | 0.000-3.682s | n/a | n/a |
| Zako | 1.022 | 0.7430 | 0.1675 | 1303.4 | 835.9 | 0.439-1.018s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.938s`; Aurora duration delta vs reference = `2.938s`.
- Quick read: synthetic Galaga centroid delta vs reference = `10.6Hz`; Aurora centroid delta vs reference = `10.6Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `3.103s`; centroid delta = `6.8Hz`.

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9866 | 0.2542 | 1285.8 | 2055.3 | 0.000-3.672s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2561 | 1291.9 | 2069.9 | 0.000-3.692s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 2.043 | 0.8867 | 0.1428 | 1891.5 | 1063.0 | 0.090-1.367s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.917s`; Aurora duration delta vs reference = `1.917s`.
- Quick read: synthetic Galaga centroid delta vs reference = `599.6Hz`; Aurora centroid delta vs reference = `605.7Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.395s`; centroid delta = `601.0Hz`.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9810 | 0.2570 | 1291.9 | 2049.7 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9265 | 0.2572 | 1291.2 | 2056.3 | 0.000-3.682s | n/a | n/a |
| Zako | 1.022 | 0.7430 | 0.1675 | 1303.4 | 835.9 | 0.439-1.018s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.938s`; Aurora duration delta vs reference = `2.938s`.
- Quick read: synthetic Galaga centroid delta vs reference = `12.2Hz`; Aurora centroid delta vs reference = `11.5Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `3.103s`; centroid delta = `8.5Hz`.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2557 | 1291.9 | 2085.1 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9816 | 0.2540 | 1288.2 | 2052.3 | 0.000-3.672s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.917s`; Aurora duration delta vs reference = `1.917s`.
- Quick read: synthetic Galaga centroid delta vs reference = `452.5Hz`; Aurora centroid delta vs reference = `448.8Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.913s`; centroid delta = `408.5Hz`.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9466 | 0.2543 | 1290.0 | 2063.4 | 0.000-3.672s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9865 | 0.2558 | 1292.1 | 2084.6 | 0.000-3.692s | n/a | n/a |
| Tractor Beam | 4.040 | 0.8581 | 0.3136 | 1829.9 | 2144.4 | 0.189-3.512s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.080s`; Aurora duration delta vs reference = `0.080s`.
- Quick read: synthetic Galaga centroid delta vs reference = `537.8Hz`; Aurora centroid delta vs reference = `539.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.349s`; centroid delta = `541.8Hz`.
- Candidate reference subwindows: 0.350-4.022s score 0.751.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 1.0000 | 0.2557 | 1291.9 | 2085.1 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9099 | 0.2547 | 1296.1 | 2061.9 | 0.000-3.682s | n/a | n/a |
| Capturing | 3.019 | 0.4745 | 0.2299 | 986.4 | 1193.9 | 0.529-3.013s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.941s`; Aurora duration delta vs reference = `0.941s`.
- Quick read: synthetic Galaga centroid delta vs reference = `309.7Hz`; Aurora centroid delta vs reference = `305.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `1.197s`; centroid delta = `308.6Hz`.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9810 | 0.2570 | 1291.9 | 2049.7 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9810 | 0.2570 | 1291.9 | 2049.7 | 0.000-3.682s | n/a | n/a |
| Fighter Captured | 6.037 | 0.6662 | 0.1487 | 1966.8 | 1901.7 | 0.170-6.037s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.077s`; Aurora duration delta vs reference = `2.077s`.
- Quick read: synthetic Galaga centroid delta vs reference = `674.9Hz`; Aurora centroid delta vs reference = `674.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `2.186s`; centroid delta = `672.3Hz`.
- Candidate reference subwindows: 0.300-3.982s score 0.642.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9945 | 0.2567 | 1286.7 | 2060.4 | 0.000-3.722s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9735 | 0.2564 | 1288.1 | 2055.8 | 0.010-3.712s | n/a | n/a |
| Captured Fighter Destroyed | 3.019 | 0.8836 | 0.1949 | 1393.9 | 2037.7 | 0.000-3.019s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.941s`; Aurora duration delta vs reference = `0.941s`.
- Quick read: synthetic Galaga centroid delta vs reference = `105.8Hz`; Aurora centroid delta vs reference = `107.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.703s`; centroid delta = `104.4Hz`.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9765 | 0.2561 | 1284.6 | 2042.2 | 0.000-3.672s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9865 | 0.2558 | 1292.1 | 2084.6 | 0.000-3.692s | n/a | n/a |
| Fighter Rescued (Double Ship) | 4.040 | 0.4290 | 0.0979 | 1532.1 | 1374.4 | 0.000-4.011s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.080s`; Aurora duration delta vs reference = `0.080s`.
- Quick read: synthetic Galaga centroid delta vs reference = `240.0Hz`; Aurora centroid delta vs reference = `247.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.339s`; centroid delta = `244.4Hz`.
- Candidate reference subwindows: 0.050-3.722s score 0.531.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9379 | 0.2554 | 1293.1 | 2078.0 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2556 | 1292.8 | 2071.5 | 0.000-3.682s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.917s`; Aurora duration delta vs reference = `1.917s`.
- Quick read: synthetic Galaga centroid delta vs reference = `330.7Hz`; Aurora centroid delta vs reference = `331.0Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.714s`; centroid delta = `333.0Hz`.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.080 | 0.8592 | 0.2544 | 1167.2 | 1953.7 | 0.000-1.080s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.080 | 0.8706 | 0.2537 | 1207.9 | 1931.5 | 0.000-1.080s | n/a | n/a |
| Challenging Stage | 3.019 | 0.9491 | 0.1601 | 1474.2 | 1296.0 | 0.000-2.375s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.939s`; Aurora duration delta vs reference = `1.939s`.
- Quick read: synthetic Galaga centroid delta vs reference = `266.3Hz`; Aurora centroid delta vs reference = `307.0Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `1.295s`; centroid delta = `306.0Hz`.
- Candidate reference subwindows: 0.200-1.280s score 0.857; 1.299-2.379s score 0.531.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.560 | 0.8673 | 0.2536 | 1288.5 | 2114.1 | 0.000-1.560s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.560 | 0.8263 | 0.2530 | 1248.5 | 2094.2 | 0.000-1.560s | n/a | n/a |
| Challenging Stage Results | 4.040 | 0.2975 | 0.0868 | 1900.3 | 2277.3 | 0.000-4.021s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.480s`; Aurora duration delta vs reference = `2.480s`.
- Quick read: synthetic Galaga centroid delta vs reference = `651.8Hz`; Aurora centroid delta vs reference = `611.8Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `2.461s`; centroid delta = `621.5Hz`.
- Candidate reference subwindows: 0.000-1.560s score 0.649; 1.649-3.209s score 0.621.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.740 | 0.8592 | 0.2580 | 1259.7 | 2156.9 | 0.000-1.740s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.740 | 0.8536 | 0.2575 | 1267.9 | 2147.7 | 0.000-1.740s | n/a | n/a |
| Challenging Stage Perfect | 4.040 | 0.4380 | 0.1263 | 2423.0 | 2978.8 | 0.000-4.040s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `2.300s`; Aurora duration delta vs reference = `2.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1155.1Hz`; Aurora centroid delta vs reference = `1163.3Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `2.300s`; centroid delta = `1163.3Hz`.
- Candidate reference subwindows: 0.000-1.740s score 0.496; 1.799-3.539s score 0.296.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9861 | 0.2554 | 1293.5 | 2065.9 | 0.000-3.692s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9765 | 0.2561 | 1284.6 | 2042.2 | 0.000-3.672s | n/a | n/a |
| Name Entry (1st) | 8.034 | 0.9478 | 0.1954 | 1766.9 | 2077.4 | 0.000-6.695s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `4.074s`; Aurora duration delta vs reference = `4.074s`.
- Quick read: synthetic Galaga centroid delta vs reference = `482.3Hz`; Aurora centroid delta vs reference = `473.4Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `3.003s`; centroid delta = `471.3Hz`.
- Candidate reference subwindows: 3.598-7.290s score 0.793.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9942 | 0.2550 | 1294.2 | 2047.2 | 0.000-3.682s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 0.9810 | 0.2570 | 1291.9 | 2049.7 | 0.000-3.682s | n/a | n/a |
| Name Entry (2nd-5th) | 15.000 | 1.0000 | 0.2555 | 1707.1 | 2641.1 | 0.399-14.497s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `11.040s`; Aurora duration delta vs reference = `11.040s`.
- Quick read: synthetic Galaga centroid delta vs reference = `415.2Hz`; Aurora centroid delta vs reference = `412.9Hz`.
- Active-window status: `broad-reference-window-needs-segmentation`.
- Active quick read: Aurora vs reference duration delta = `10.416s`; centroid delta = `416.9Hz`.
- Candidate reference subwindows: 11.295-14.977s score 0.783; 2.199-5.881s score 0.731; 7.597-11.279s score 0.681.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 3.960 | 0.9670 | 0.2547 | 1286.3 | 2062.9 | 0.000-3.672s | n/a | n/a |
| Galaga Original Reference (synthetic) | 3.960 | 1.0000 | 0.2557 | 1291.9 | 2085.1 | 0.000-3.682s | n/a | n/a |
| Last Ship Destroyed Ambience | 14.002 | 0.7676 | 0.1931 | 1455.1 | 840.5 | 3.771-14.002s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `10.042s`; Aurora duration delta vs reference = `10.042s`.
- Quick read: synthetic Galaga centroid delta vs reference = `163.2Hz`; Aurora centroid delta vs reference = `168.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `6.558s`; centroid delta = `174.3Hz`.
- Candidate reference subwindows: 2.399-6.071s score 0.805; 6.097-9.769s score 0.492; 10.295-13.967s score 0.458.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 7
- Candidate reference subwindows found: 24
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.009s`
- Average active Aurora-vs-reference duration delta: `2.986s`
- Average active Aurora-vs-reference centroid delta: `377.9Hz`

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-theme-comparison/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-theme-comparison`

# Aurora Audio Theme Comparison

- Generated from commit `cfa8497`
- Version: `1.3.0`
- Generated at: `2026-05-08T17:05:11.674Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `18.0Hz`; Aurora centroid delta vs reference = `91.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `37.5Hz`.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.540 | 0.8141 | 0.2497 | 1204.1 | 1900.0 | 0.000-0.540s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.540 | 0.8141 | 0.2504 | 1189.4 | 1922.2 | 0.000-0.540s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `153.4Hz`; Aurora centroid delta vs reference = `138.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.150s`; centroid delta = `76.2Hz`.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `89.7Hz`; Aurora centroid delta vs reference = `89.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `48.2Hz`.

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7988 | 0.2460 | 1370.8 | 2175.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `645.2Hz`; Aurora centroid delta vs reference = `750.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.040s`; centroid delta = `749.6Hz`.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7649 | 0.2494 | 1460.8 | 2112.5 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `604.4Hz`; Aurora centroid delta vs reference = `589.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.020s`; centroid delta = `590.1Hz`.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7918 | 0.2457 | 1268.4 | 2013.3 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7807 | 0.2453 | 1275.8 | 2073.3 | 0.000-0.300s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `17.3Hz`; Aurora centroid delta vs reference = `9.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `6.9Hz`.

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7807 | 0.2453 | 1275.8 | 2073.3 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7807 | 0.2453 | 1275.8 | 2073.3 | 0.000-0.300s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.010s`; Aurora duration delta vs reference = `0.010s`.
- Quick read: synthetic Galaga centroid delta vs reference = `178.3Hz`; Aurora centroid delta vs reference = `178.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.080s`; centroid delta = `78.8Hz`.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7807 | 0.2453 | 1275.8 | 2073.3 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `10.2Hz`; Aurora centroid delta vs reference = `100.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `0.9Hz`.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.743s`; Aurora duration delta vs reference = `1.743s`.
- Quick read: synthetic Galaga centroid delta vs reference = `348.8Hz`; Aurora centroid delta vs reference = `389.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.469s`; centroid delta = `351.1Hz`.
- Candidate reference subwindows: 0.850-1.150s score 0.861; 1.349-1.649s score 0.784; 0.000-0.300s score 0.200.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2475 | 1160.4 | 1925.0 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8142 | 0.2493 | 1154.3 | 1956.2 | 0.000-0.480s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `641.9Hz`; Aurora centroid delta vs reference = `635.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.141s`; centroid delta = `632.5Hz`.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1222.8 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8142 | 0.2484 | 1205.0 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `113.2Hz`; Aurora centroid delta vs reference = `131.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `131.0Hz`.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8141 | 0.2473 | 1218.7 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `621.8Hz`; Aurora centroid delta vs reference = `617.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.021s`; centroid delta = `665.4Hz`.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `89.7Hz`; Aurora centroid delta vs reference = `89.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `89.7Hz`.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.7783 | 0.2471 | 1200.0 | 1988.9 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.360 | 0.7783 | 0.2471 | 1200.0 | 1988.9 | 0.000-0.360s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `316.5Hz`; Aurora centroid delta vs reference = `316.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `316.5Hz`.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2494 | 1160.4 | 1929.2 | 0.000-0.480s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.563s`; Aurora duration delta vs reference = `1.623s`.
- Quick read: synthetic Galaga centroid delta vs reference = `198.3Hz`; Aurora centroid delta vs reference = `261.0Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.548s`; centroid delta = `259.1Hz`.
- Candidate reference subwindows: 0.200-0.620s score 0.713; 0.650-1.070s score 0.597; 1.299-1.719s score 0.553.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2487 | 1139.4 | 1945.8 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2500 | 1153.7 | 1906.2 | 0.000-0.480s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `453.6Hz`; Aurora centroid delta vs reference = `467.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `467.9Hz`.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2485 | 1139.3 | 1925.0 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `642.9Hz`; Aurora centroid delta vs reference = `559.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `559.1Hz`.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2495 | 1160.0 | 1937.5 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `880.1Hz`; Aurora centroid delta vs reference = `817.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `817.0Hz`.
- Candidate reference subwindows: 0.000-0.420s score 0.581.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2487 | 1139.4 | 1945.8 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2483 | 1158.1 | 1933.3 | 0.000-0.480s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `717.7Hz`; Aurora centroid delta vs reference = `736.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `736.4Hz`.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `460.4Hz`; Aurora centroid delta vs reference = `460.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.050s`; centroid delta = `547.4Hz`.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.8522 | 0.2537 | 1215.6 | 1865.5 | 0.000-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8322 | 0.2538 | 1196.2 | 1873.8 | 0.000-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `315.6Hz`; Aurora centroid delta vs reference = `296.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.189s`; centroid delta = `287.4Hz`.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 7
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.012s`
- Average active Aurora-vs-reference duration delta: `0.093s`
- Average active Aurora-vs-reference centroid delta: `354.7Hz`


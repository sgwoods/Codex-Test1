# Aurora Audio Theme Comparison

- Generated from commit `ebd04ec`
- Version: `1.3.0`
- Generated at: `2026-05-08T12:17:45.468Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7649 | 0.2494 | 1460.8 | 2112.5 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 3.692 | 0.2264 | 0.0862 | 1193.6 | 554.4 | 1.377-3.692s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `3.452s`; Aurora duration delta vs reference = `3.452s`.
- Quick read: synthetic Galaga centroid delta vs reference = `172.5Hz`; Aurora centroid delta vs reference = `267.2Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `2.075s`; centroid delta = `290.9Hz`.
- Candidate reference subwindows: 2.199-2.439s score 0.582; 0.850-1.090s score 0.581; 0.450-0.690s score 0.578.

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
| Galaga Original Reference (synthetic) | 0.240 | 0.7722 | 0.2449 | 1264.8 | 2054.2 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `11.6Hz`; Aurora centroid delta vs reference = `89.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `48.2Hz`.

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 2.043 | 0.8867 | 0.1428 | 1891.5 | 1063.0 | 0.090-1.367s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.803s`; Aurora duration delta vs reference = `1.803s`.
- Quick read: synthetic Galaga centroid delta vs reference = `525.4Hz`; Aurora centroid delta vs reference = `525.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `1.037s`; centroid delta = `526.4Hz`.
- Candidate reference subwindows: 1.149-1.389s score 0.914; 0.900-1.140s score 0.743; 0.050-0.290s score 0.710.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 2.043 | 0.8867 | 0.1428 | 1891.5 | 1063.0 | 0.090-1.367s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.803s`; Aurora duration delta vs reference = `1.803s`.
- Quick read: synthetic Galaga centroid delta vs reference = `525.4Hz`; Aurora centroid delta vs reference = `525.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `1.037s`; centroid delta = `526.4Hz`.
- Candidate reference subwindows: 1.149-1.389s score 0.914; 0.900-1.140s score 0.743; 0.050-0.290s score 0.710.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7722 | 0.2465 | 1139.7 | 1990.0 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Zako | 1.022 | 0.7430 | 0.1675 | 1303.4 | 835.9 | 0.439-1.018s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.722s`; Aurora duration delta vs reference = `0.722s`.
- Quick read: synthetic Galaga centroid delta vs reference = `47.9Hz`; Aurora centroid delta vs reference = `163.7Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.279s`; centroid delta = `163.7Hz`.
- Candidate reference subwindows: 0.700-1.000s score 0.794; 0.400-0.700s score 0.670; 0.000-0.300s score 0.218.

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 2.043 | 0.8867 | 0.1428 | 1891.5 | 1063.0 | 0.090-1.367s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.743s`; Aurora duration delta vs reference = `1.743s`.
- Quick read: synthetic Galaga centroid delta vs reference = `540.2Hz`; Aurora centroid delta vs reference = `499.6Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.987s`; centroid delta = `539.5Hz`.
- Candidate reference subwindows: 1.149-1.439s score 0.843; 0.050-0.340s score 0.712; 0.850-1.140s score 0.667.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Zako | 1.022 | 0.7430 | 0.1675 | 1303.4 | 835.9 | 0.439-1.018s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.782s`; Aurora duration delta vs reference = `0.782s`.
- Quick read: synthetic Galaga centroid delta vs reference = `62.7Hz`; Aurora centroid delta vs reference = `62.7Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.339s`; centroid delta = `62.7Hz`.
- Candidate reference subwindows: 0.500-0.740s score 0.817; 0.750-0.990s score 0.813; 0.000-0.240s score 0.200.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.743s`; Aurora duration delta vs reference = `1.743s`.
- Quick read: synthetic Galaga centroid delta vs reference = `389.4Hz`; Aurora centroid delta vs reference = `389.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.469s`; centroid delta = `351.1Hz`.
- Candidate reference subwindows: 0.850-1.150s score 0.861; 1.349-1.649s score 0.784; 0.000-0.300s score 0.200.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8141 | 0.2492 | 1162.7 | 1925.0 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2490 | 1163.0 | 1943.8 | 0.000-0.480s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `633.2Hz`; Aurora centroid delta vs reference = `633.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.141s`; centroid delta = `630.2Hz`.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8141 | 0.2473 | 1218.7 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `126.9Hz`; Aurora centroid delta vs reference = `131.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `131.3Hz`.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2473 | 1218.0 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `617.4Hz`; Aurora centroid delta vs reference = `622.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.021s`; centroid delta = `670.5Hz`.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `242.4Hz`; Aurora centroid delta vs reference = `89.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `89.7Hz`.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.7807 | 0.2469 | 1270.9 | 2005.6 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.360 | 0.7783 | 0.2471 | 1200.0 | 1988.9 | 0.000-0.360s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `316.5Hz`; Aurora centroid delta vs reference = `245.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `245.6Hz`.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2476 | 1158.1 | 1957.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8142 | 0.2493 | 1154.3 | 1956.2 | 0.000-0.480s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.563s`; Aurora duration delta vs reference = `1.623s`.
- Quick read: synthetic Galaga centroid delta vs reference = `192.2Hz`; Aurora centroid delta vs reference = `196.0Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.548s`; centroid delta = `194.1Hz`.
- Candidate reference subwindows: 0.200-0.620s score 0.740; 0.650-1.070s score 0.624; 1.299-1.719s score 0.580.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2478 | 1146.6 | 1937.5 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2478 | 1186.3 | 1975.0 | 0.000-0.480s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `421.0Hz`; Aurora centroid delta vs reference = `460.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `460.7Hz`.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2492 | 1137.8 | 1920.8 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2490 | 1163.0 | 1943.8 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `619.2Hz`; Aurora centroid delta vs reference = `644.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `644.4Hz`.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8141 | 0.2494 | 1160.4 | 1929.2 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2497 | 1172.9 | 1935.4 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `867.2Hz`; Aurora centroid delta vs reference = `879.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `879.7Hz`.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8141 | 0.2497 | 1172.9 | 1935.4 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2496 | 1161.9 | 1952.1 | 0.000-0.480s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `713.9Hz`; Aurora centroid delta vs reference = `702.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `702.9Hz`.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2473 | 1218.0 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8141 | 0.2473 | 1218.7 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `464.8Hz`; Aurora centroid delta vs reference = `465.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.050s`; centroid delta = `552.5Hz`.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.8304 | 0.2533 | 1212.5 | 1902.4 | 0.000-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8536 | 0.2536 | 1199.5 | 1891.7 | 0.000-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 14.002 | 0.7676 | 0.1931 | 1455.1 | 840.5 | 3.771-14.002s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `13.162s`; Aurora duration delta vs reference = `13.162s`.
- Quick read: synthetic Galaga centroid delta vs reference = `255.6Hz`; Aurora centroid delta vs reference = `242.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `9.390s`; centroid delta = `96.7Hz`.
- Candidate reference subwindows: 3.798-4.638s score 0.902; 5.498-6.338s score 0.725; 4.648-5.488s score 0.690.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 27
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.003s`
- Average active Aurora-vs-reference duration delta: `0.791s`
- Average active Aurora-vs-reference centroid delta: `375.4Hz`

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-theme-comparison/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-theme-comparison`

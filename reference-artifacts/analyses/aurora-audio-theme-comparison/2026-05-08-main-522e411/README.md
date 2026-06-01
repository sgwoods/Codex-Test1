# Aurora Audio Theme Comparison

- Generated from commit `522e411`
- Version: `1.3.0`
- Generated at: `2026-05-08T19:26:14.930Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7858 | 0.2467 | 1544.1 | 2029.2 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `61.2Hz`; Aurora centroid delta vs reference = `160.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `106.0Hz`.
- Spectral shape: band distance = `0.1477`; rolloff delta = `37.3Hz`.
- Envelope shape: attack position delta = `0.567`; decay ratio delta = `0.076`; burst-share delta = `0.036`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.540 | 0.8706 | 0.2485 | 1151.0 | 1963.0 | 0.000-0.540s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.540 | 0.8142 | 0.2508 | 1152.0 | 1901.9 | 0.000-0.540s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `190.8Hz`; Aurora centroid delta vs reference = `191.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.150s`; centroid delta = `129.3Hz`.
- Spectral shape: band distance = `0.2715`; rolloff delta = `539.6Hz`.
- Envelope shape: attack position delta = `0.532`; decay ratio delta = `0.006`; burst-share delta = `0.051`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `46.5Hz`; Aurora centroid delta vs reference = `199.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `157.7Hz`.
- Spectral shape: band distance = `0.1533`; rolloff delta = `199.6Hz`.
- Envelope shape: attack position delta = `0.400`; decay ratio delta = `0.031`; burst-share delta = `0.028`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8020 | 0.2446 | 1377.5 | 2070.8 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `797.9Hz`; Aurora centroid delta vs reference = `743.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.040s`; centroid delta = `742.9Hz`.
- Spectral shape: band distance = `0.3200`; rolloff delta = `1106.5Hz`.
- Envelope shape: attack position delta = `0.653`; decay ratio delta = `5.345`; burst-share delta = `0.197`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `699.1Hz`; Aurora centroid delta vs reference = `699.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.020s`; centroid delta = `699.6Hz`.
- Spectral shape: band distance = `0.3638`; rolloff delta = `457.5Hz`.
- Envelope shape: attack position delta = `0.833`; decay ratio delta = `3.231`; burst-share delta = `0.099`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `92.8Hz`; Aurora centroid delta vs reference = `92.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `89.8Hz`.
- Spectral shape: band distance = `0.2351`; rolloff delta = `394.5Hz`.
- Envelope shape: attack position delta = `0.165`; decay ratio delta = `0.535`; burst-share delta = `0.090`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7807 | 0.2453 | 1275.8 | 2073.3 | 0.000-0.300s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.010s`; Aurora duration delta vs reference = `0.010s`.
- Quick read: synthetic Galaga centroid delta vs reference = `178.3Hz`; Aurora centroid delta vs reference = `62.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.070s`; centroid delta = `101.2Hz`.
- Spectral shape: band distance = `0.2172`; rolloff delta = `26.9Hz`.
- Envelope shape: attack position delta = `0.667`; decay ratio delta = `0.797`; burst-share delta = `0.204`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Candidate reference subwindows: 0.000-0.290s score 0.775.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `10.2Hz`; Aurora centroid delta vs reference = `10.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `10.2Hz`.
- Spectral shape: band distance = `0.2592`; rolloff delta = `420.9Hz`.
- Envelope shape: attack position delta = `0.034`; decay ratio delta = `0.270`; burst-share delta = `0.097`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7722 | 0.2465 | 1139.7 | 1990.0 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.8019 | 0.2469 | 1351.3 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.743s`; Aurora duration delta vs reference = `1.743s`.
- Quick read: synthetic Galaga centroid delta vs reference = `389.4Hz`; Aurora centroid delta vs reference = `601.0Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.469s`; centroid delta = `562.7Hz`.
- Spectral shape: band distance = `0.3983`; rolloff delta = `308.3Hz`.
- Envelope shape: attack position delta = `0.184`; decay ratio delta = `0.081`; burst-share delta = `0.237`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Candidate reference subwindows: 0.850-1.150s score 0.739; 1.349-1.649s score 0.639; 0.250-0.550s score 0.243.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2469 | 1121.1 | 1922.9 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2496 | 1161.9 | 1952.1 | 0.000-0.480s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `634.3Hz`; Aurora centroid delta vs reference = `675.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.141s`; centroid delta = `671.8Hz`.
- Spectral shape: band distance = `0.3340`; rolloff delta = `463.3Hz`.
- Envelope shape: attack position delta = `0.635`; decay ratio delta = `0.490`; burst-share delta = `0.199`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `131.3Hz`; Aurora centroid delta vs reference = `131.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `131.3Hz`.
- Spectral shape: band distance = `0.4301`; rolloff delta = `1126.1Hz`.
- Envelope shape: attack position delta = `0.174`; decay ratio delta = `0.194`; burst-share delta = `0.245`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2473 | 1216.6 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.7995 | 0.2463 | 1113.1 | 1966.7 | 0.000-0.420s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `727.4Hz`; Aurora centroid delta vs reference = `623.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.021s`; centroid delta = `671.9Hz`.
- Spectral shape: band distance = `0.1698`; rolloff delta = `2183.3Hz`.
- Envelope shape: attack position delta = `0.404`; decay ratio delta = `0.133`; burst-share delta = `0.029`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `158.7Hz`; Aurora centroid delta vs reference = `89.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `89.7Hz`.
- Spectral shape: band distance = `0.2919`; rolloff delta = `1179.1Hz`.
- Envelope shape: attack position delta = `0.533`; decay ratio delta = `0.071`; burst-share delta = `0.000`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.8019 | 0.2469 | 1244.0 | 2008.3 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.360 | 0.8019 | 0.2469 | 1244.0 | 2008.3 | 0.000-0.360s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `272.5Hz`; Aurora centroid delta vs reference = `272.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `272.5Hz`.
- Spectral shape: band distance = `0.1108`; rolloff delta = `80.5Hz`.
- Envelope shape: attack position delta = `0.022`; decay ratio delta = `0.061`; burst-share delta = `0.022`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2473 | 1218.0 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2496 | 1161.9 | 1952.1 | 0.000-0.480s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.563s`; Aurora duration delta vs reference = `1.623s`.
- Quick read: synthetic Galaga centroid delta vs reference = `199.8Hz`; Aurora centroid delta vs reference = `255.9Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.548s`; centroid delta = `254.0Hz`.
- Spectral shape: band distance = `0.0692`; rolloff delta = `564.2Hz`.
- Envelope shape: attack position delta = `0.069`; decay ratio delta = `0.384`; burst-share delta = `0.018`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Candidate reference subwindows: 0.200-0.620s score 0.748; 0.650-1.070s score 0.657; 1.299-1.719s score 0.619.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2465 | 1081.4 | 1920.8 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2495 | 1160.0 | 1937.5 | 0.000-0.480s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `447.3Hz`; Aurora centroid delta vs reference = `525.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `525.9Hz`.
- Spectral shape: band distance = `0.2248`; rolloff delta = `275.0Hz`.
- Envelope shape: attack position delta = `0.150`; decay ratio delta = `8.433`; burst-share delta = `0.229`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8141 | 0.2490 | 1163.0 | 1943.8 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2496 | 1161.9 | 1952.1 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `620.3Hz`; Aurora centroid delta vs reference = `619.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `619.2Hz`.
- Spectral shape: band distance = `0.1407`; rolloff delta = `642.9Hz`.
- Envelope shape: attack position delta = `0.948`; decay ratio delta = `0.003`; burst-share delta = `0.038`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2473 | 1218.7 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2496 | 1161.9 | 1952.1 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `878.2Hz`; Aurora centroid delta vs reference = `821.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `821.4Hz`.
- Spectral shape: band distance = `0.1450`; rolloff delta = `3176.2Hz`.
- Envelope shape: attack position delta = `0.096`; decay ratio delta = `0.094`; burst-share delta = `0.002`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Candidate reference subwindows: 0.000-0.420s score 0.629.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8141 | 0.2497 | 1172.9 | 1935.4 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2468 | 1095.1 | 1947.9 | 0.000-0.480s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `780.7Hz`; Aurora centroid delta vs reference = `702.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `702.9Hz`.
- Spectral shape: band distance = `0.2421`; rolloff delta = `897.9Hz`.
- Envelope shape: attack position delta = `0.634`; decay ratio delta = `0.040`; burst-share delta = `0.065`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2473 | 1216.6 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8141 | 0.2473 | 1218.0 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `465.5Hz`; Aurora centroid delta vs reference = `466.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.050s`; centroid delta = `553.9Hz`.
- Spectral shape: band distance = `0.1446`; rolloff delta = `625.1Hz`.
- Envelope shape: attack position delta = `0.817`; decay ratio delta = `0.013`; burst-share delta = `0.009`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.8263 | 0.2538 | 1194.0 | 1909.5 | 0.000-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8341 | 0.2547 | 1192.3 | 1873.8 | 0.000-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `319.5Hz`; Aurora centroid delta vs reference = `317.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.189s`; centroid delta = `309.0Hz`.
- Spectral shape: band distance = `0.0876`; rolloff delta = `601.8Hz`.
- Envelope shape: attack position delta = `0.397`; decay ratio delta = `0.027`; burst-share delta = `0.072`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 8
- Reference segments found: `37`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.009s`
- Average active Aurora-vs-reference duration delta: `0.092s`
- Average active Aurora-vs-reference centroid delta: `391.6Hz`
- Average active Aurora-vs-reference band-shape distance: `0.227`
- Average active Aurora-vs-reference envelope decay delta: `0.967`

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-theme-comparison/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-theme-comparison`

# Aurora Audio Theme Comparison

- Generated from commit `e6e69bd`
- Version: `1.3.0`
- Generated at: `2026-05-08T20:37:12.894Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7802 | 0.2473 | 1322.1 | 2058.3 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7824 | 0.2454 | 1265.8 | 2054.2 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `118.3Hz`; Aurora centroid delta vs reference = `62.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `116.0Hz`.
- Spectral shape: band distance = `0.1072`; rolloff delta = `233.1Hz`.
- Envelope shape: attack position delta = `0.200`; decay ratio delta = `0.049`; burst-share delta = `0.028`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.05/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.16s | 0.01-0.22s | 4.05 | 0.05s | 173.5Hz | 0.1682 | 622.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.540 | 0.8117 | 0.2509 | 1151.9 | 1824.1 | 0.000-0.540s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.540 | 0.8216 | 0.2496 | 1207.9 | 1911.1 | 0.000-0.540s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `134.9Hz`; Aurora centroid delta vs reference = `190.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.150s`; centroid delta = `128.4Hz`.
- Spectral shape: band distance = `0.2756`; rolloff delta = `541.5Hz`.
- Envelope shape: attack position delta = `0.264`; decay ratio delta = `0.024`; burst-share delta = `0.036`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `3.56/10`; tail timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.419-0.529s | 0.15-0.539s | 3.56 | 0.279s | 307.7Hz | 0.2598 | 239.6Hz | tail timing/duration differs enough to tune event pacing before timbre. |
| body | 0.2-0.309s | 0.15-0.539s | 3.42 | 0.279s | 332.0Hz | 0.2721 | 239.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.11-0.16s | 0.01-0.12s | 2.79 | 0.06s | 33.3Hz | 0.2574 | 217.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.01-0.06s | 0.01-0.12s | 2.66 | 0.06s | 21.9Hz | 0.2473 | 17.3Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7848 | 0.2455 | 1310.2 | 2041.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7848 | 0.2453 | 1312.4 | 2041.7 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `36.0Hz`; Aurora centroid delta vs reference = `33.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `7.7Hz`.
- Spectral shape: band distance = `0.1555`; rolloff delta = `137.9Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `0.006`; burst-share delta = `0.061`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.85/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.24s | 0.01-0.23s | 4.85 | 0.06s | 211.7Hz | 0.1988 | 203.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7773 | 0.2459 | 1310.0 | 2041.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7810 | 0.2458 | 1310.4 | 2058.3 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `810.4Hz`; Aurora centroid delta vs reference = `810.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.040s`; centroid delta = `810.4Hz`.
- Spectral shape: band distance = `0.3371`; rolloff delta = `1431.5Hz`.
- Envelope shape: attack position delta = `0.080`; decay ratio delta = `5.334`; burst-share delta = `0.262`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.48/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.12-0.24s | 0.01-0.23s | 5.48 | 0.1s | 615.9Hz | 0.307 | 1092.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7651 | 0.2454 | 1311.3 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7544 | 0.2432 | 1295.0 | 2058.3 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `770.2Hz`; Aurora centroid delta vs reference = `753.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.020s`; centroid delta = `754.4Hz`.
- Spectral shape: band distance = `0.3712`; rolloff delta = `778.4Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `3.232`; burst-share delta = `0.196`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.14/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.09-0.24s | 0.02-0.23s | 6.14 | 0.06s | 857.1Hz | 0.3851 | 1135.4Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7999 | 0.2465 | 1141.5 | 2003.3 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.8024 | 0.2469 | 1353.6 | 2040.0 | 0.000-0.300s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `95.1Hz`; Aurora centroid delta vs reference = `117.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `120.0Hz`.
- Spectral shape: band distance = `0.2142`; rolloff delta = `101.1Hz`.
- Envelope shape: attack position delta = `0.322`; decay ratio delta = `0.558`; burst-share delta = `0.015`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.09/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.01-0.17s | 0.02-0.13s | 3.09 | 0.05s | 80.7Hz | 0.2257 | 155.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7948 | 0.2467 | 1141.2 | 1996.7 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7805 | 0.2473 | 1141.0 | 2010.0 | 0.000-0.300s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.010s`; Aurora duration delta vs reference = `0.010s`.
- Quick read: synthetic Galaga centroid delta vs reference = `313.1Hz`; Aurora centroid delta vs reference = `312.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.080s`; centroid delta = `313.0Hz`.
- Spectral shape: band distance = `0.2339`; rolloff delta = `147.2Hz`.
- Envelope shape: attack position delta = `0.622`; decay ratio delta = `0.867`; burst-share delta = `0.156`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.05/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.02-0.299s | 3.05 | 0.129s | 277.4Hz | 0.2209 | 106.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7702 | 0.2438 | 1267.0 | 2037.5 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7678 | 0.2454 | 1311.0 | 2033.3 | 0.000-0.240s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `65.3Hz`; Aurora centroid delta vs reference = `109.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `109.3Hz`.
- Spectral shape: band distance = `0.2470`; rolloff delta = `141.7Hz`.
- Envelope shape: attack position delta = `0.634`; decay ratio delta = `0.266`; burst-share delta = `0.065`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.07/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.02-0.24s | 3.07 | 0.04s | 24.8Hz | 0.2236 | 418.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7762 | 0.2479 | 1277.5 | 1960.0 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7717 | 0.2476 | 1279.0 | 1966.7 | 0.000-0.300s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.743s`; Aurora duration delta vs reference = `1.743s`.
- Quick read: synthetic Galaga centroid delta vs reference = `461.7Hz`; Aurora centroid delta vs reference = `463.2Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.469s`; centroid delta = `424.9Hz`.
- Spectral shape: band distance = `0.3938`; rolloff delta = `234.9Hz`.
- Envelope shape: attack position delta = `0.454`; decay ratio delta = `0.075`; burst-share delta = `0.290`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.03/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.868-1.487s | 0.02-0.299s | 5.03 | 0.34s | 543.4Hz | 0.3937 | 246.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.850-1.150s score 0.766; 1.349-1.649s score 0.668; 0.250-0.550s score 0.248.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.8135 | 0.2474 | 1185.5 | 1988.9 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2501 | 1111.5 | 1914.6 | 0.000-0.480s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.120s`.
- Quick read: synthetic Galaga centroid delta vs reference = `684.7Hz`; Aurora centroid delta vs reference = `610.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.021s`; centroid delta = `607.4Hz`.
- Spectral shape: band distance = `0.3022`; rolloff delta = `407.7Hz`.
- Envelope shape: attack position delta = `0.374`; decay ratio delta = `0.463`; burst-share delta = `0.192`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.08/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.269s | 0.01-0.359s | 5.08 | 0.08s | 593.4Hz | 0.3079 | 405.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.100-0.460s score 0.678.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2483 | 1144.0 | 1966.7 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8142 | 0.2489 | 1126.3 | 1926.2 | 0.000-0.420s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `34.5Hz`; Aurora centroid delta vs reference = `52.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `52.2Hz`.
- Spectral shape: band distance = `0.4401`; rolloff delta = `1102.3Hz`.
- Envelope shape: attack position delta = `0.347`; decay ratio delta = `0.246`; burst-share delta = `0.226`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.8/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.02-0.419s | 4.8 | 0.219s | 170.6Hz | 0.4742 | 1132.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| tail | 0.259-0.389s | 0.02-0.419s | 4.67 | 0.269s | 61.7Hz | 0.4278 | 1093.5Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2456 | 1142.4 | 1942.9 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.7996 | 0.2461 | 1173.9 | 1928.6 | 0.000-0.420s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `666.6Hz`; Aurora centroid delta vs reference = `698.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.021s`; centroid delta = `746.1Hz`.
- Spectral shape: band distance = `0.1800`; rolloff delta = `2199.9Hz`.
- Envelope shape: attack position delta = `0.288`; decay ratio delta = `0.142`; burst-share delta = `0.009`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.5/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.06s | 0.02-0.419s | 6.5 | 0.339s | 1104.9Hz | 0.214 | 2965.7Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| body | 0.289-0.359s | 0.02-0.419s | 5.61 | 0.329s | 633.1Hz | 0.1864 | 2064.8Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.09-0.259s | 0.02-0.419s | 4.8 | 0.229s | 699.0Hz | 0.1799 | 2084.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7587 | 0.2433 | 1292.7 | 2058.3 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7831 | 0.2447 | 1318.8 | 2083.3 | 0.000-0.240s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `85.6Hz`; Aurora centroid delta vs reference = `59.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `59.5Hz`.
- Spectral shape: band distance = `0.2645`; rolloff delta = `800.0Hz`.
- Envelope shape: attack position delta = `0.366`; decay ratio delta = `0.034`; burst-share delta = `0.032`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.15/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.01-0.22s | 2.15 | 0.02s | 119.0Hz | 0.2738 | 750.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.7792 | 0.2446 | 1217.8 | 2002.8 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.360 | 0.7800 | 0.2434 | 1217.6 | 2008.3 | 0.000-0.360s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `298.9Hz`; Aurora centroid delta vs reference = `298.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `298.7Hz`.
- Spectral shape: band distance = `0.1168`; rolloff delta = `80.5Hz`.
- Envelope shape: attack position delta = `0.822`; decay ratio delta = `0.024`; burst-share delta = `0.022`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `body` risk `4.7/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.22-0.279s | 0.02-0.349s | 4.7 | 0.269s | 509.6Hz | 0.1762 | 948.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.09s | 0.02-0.349s | 3.76 | 0.259s | 283.4Hz | 0.1691 | 90.4Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| body | 0.12-0.18s | 0.02-0.349s | 3.74 | 0.269s | 324.0Hz | 0.1461 | 364.4Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.319-0.359s | 0.02-0.349s | 3.39 | 0.289s | 224.5Hz | 0.0606 | 279.0Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8000 | 0.2464 | 1127.2 | 1966.7 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8180 | 0.2493 | 1144.3 | 1908.3 | 0.000-0.480s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.563s`; Aurora duration delta vs reference = `1.623s`.
- Quick read: synthetic Galaga centroid delta vs reference = `182.2Hz`; Aurora centroid delta vs reference = `165.1Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.548s`; centroid delta = `163.2Hz`.
- Spectral shape: band distance = `0.0555`; rolloff delta = `511.9Hz`.
- Envelope shape: attack position delta = `0.623`; decay ratio delta = `0.389`; burst-share delta = `0.018`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `tail` risk `4.36/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.888-0.968s | 0.02-0.419s | 4.36 | 0.319s | 108.5Hz | 0.0732 | 504.3Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.09-0.858s | 0.02-0.419s | 3.62 | 0.369s | 127.2Hz | 0.0548 | 443.5Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.200-0.620s score 0.776; 0.650-1.070s score 0.685; 1.299-1.719s score 0.647.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8080 | 0.2490 | 1116.8 | 1925.0 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8142 | 0.2487 | 1124.0 | 1900.0 | 0.000-0.480s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `483.3Hz`; Aurora centroid delta vs reference = `490.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `490.5Hz`.
- Spectral shape: band distance = `0.2330`; rolloff delta = `239.6Hz`.
- Envelope shape: attack position delta = `0.384`; decay ratio delta = `8.417`; burst-share delta = `0.213`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `5.01/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.12s | 0.01-0.19s | 5.01 | 0.14s | 413.9Hz | 0.2094 | 113.6Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| tail | 0.239-0.469s | 0.249-0.459s | 3.59 | 0.02s | 399.1Hz | 0.1953 | 181.9Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8037 | 0.2472 | 1096.4 | 1939.6 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8217 | 0.2506 | 1111.7 | 1918.8 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `670.5Hz`; Aurora centroid delta vs reference = `685.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `685.8Hz`.
- Spectral shape: band distance = `0.1426`; rolloff delta = `745.0Hz`.
- Envelope shape: attack position delta = `0.664`; decay ratio delta = `0.009`; burst-share delta = `0.005`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.09/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.419s | 0.02-0.2s | 4.09 | 0.239s | 296.6Hz | 0.1674 | 11.6Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8038 | 0.2463 | 1181.0 | 1938.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8306 | 0.2501 | 1144.6 | 1927.1 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `895.5Hz`; Aurora centroid delta vs reference = `859.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `859.1Hz`.
- Spectral shape: band distance = `0.1478`; rolloff delta = `3178.5Hz`.
- Envelope shape: attack position delta = `0.365`; decay ratio delta = `0.109`; burst-share delta = `0.021`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `8.37/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.239-0.279s | 0.01-0.409s | 8.37 | 0.359s | 1116.0Hz | 0.2466 | 3226.5Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.319-0.429s | 0.01-0.409s | 7.07 | 0.289s | 954.6Hz | 0.1695 | 3228.1Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.18s | 0.01-0.409s | 5.93 | 0.219s | 878.0Hz | 0.1608 | 3217.3Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.000-0.420s score 0.607.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8045 | 0.2493 | 1190.2 | 1897.9 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2497 | 1163.3 | 1947.9 | 0.000-0.480s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `712.5Hz`; Aurora centroid delta vs reference = `685.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `685.6Hz`.
- Spectral shape: band distance = `0.2387`; rolloff delta = `893.8Hz`.
- Envelope shape: attack position delta = `0.266`; decay ratio delta = `0.059`; burst-share delta = `0.032`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.
- Worst segment role: `body` risk `6.21/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.16-0.22s | 0.01-0.479s | 6.21 | 0.409s | 848.2Hz | 0.2857 | 1692.2Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.329-0.479s | 0.01-0.479s | 5.85 | 0.319s | 680.9Hz | 0.2497 | 768.8Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.13s | 0.01-0.479s | 5.69 | 0.339s | 856.0Hz | 0.3182 | 1438.2Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8141 | 0.2483 | 1132.4 | 1947.6 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8135 | 0.2469 | 1140.1 | 1995.2 | 0.000-0.420s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `543.4Hz`; Aurora centroid delta vs reference = `551.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.050s`; centroid delta = `638.1Hz`.
- Spectral shape: band distance = `0.1588`; rolloff delta = `660.8Hz`.
- Envelope shape: attack position delta = `0.278`; decay ratio delta = `0.004`; burst-share delta = `0.010`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `5.09/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.319-0.419s | 0.02-0.419s | 5.09 | 0.299s | 802.8Hz | 0.1709 | 723.1Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.11-0.249s | 0.02-0.419s | 4.74 | 0.259s | 640.0Hz | 0.161 | 863.7Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 1.0000 | 0.2870 | 1648.9 | 2069.0 | 0.489-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 1.0000 | 0.2937 | 1642.4 | 2089.3 | 0.469-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `130.6Hz`; Aurora centroid delta vs reference = `137.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.300s`; centroid delta = `234.2Hz`.
- Spectral shape: band distance = `0.2050`; rolloff delta = `656.2Hz`.
- Envelope shape: attack position delta = `0.654`; decay ratio delta = `0.007`; burst-share delta = `0.098`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.7/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.269-0.838s | 0.479-0.748s | 4.7 | 0.3s | 239.3Hz | 0.2039 | 626.0Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.050-0.401s score 0.760; 0.450-0.801s score 0.658.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 10
- Reference segments found: `37`
- Segment role comparisons: `37`
- Average worst segment risk: `4.73/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.012s`
- Average active Aurora-vs-reference duration delta: `0.092s`
- Average active Aurora-vs-reference centroid delta: `395.5Hz`
- Average active Aurora-vs-reference band-shape distance: `0.230`
- Average active Aurora-vs-reference envelope decay delta: `0.967`


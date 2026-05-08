# Aurora Audio Theme Comparison

- Generated from commit `4a81804`
- Version: `1.3.0`
- Generated at: `2026-05-08T19:46:51.154Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7799 | 0.2426 | 1332.4 | 2120.8 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `18.0Hz`; Aurora centroid delta vs reference = `51.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `105.7Hz`.
- Spectral shape: band distance = `0.1207`; rolloff delta = `87.3Hz`.
- Envelope shape: attack position delta = `0.233`; decay ratio delta = `0.081`; burst-share delta = `0.061`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.04/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.16s | 0.03-0.21s | 4.04 | 0.02s | 120.7Hz | 0.2347 | 595.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.540 | 0.8142 | 0.2519 | 1143.6 | 1879.6 | 0.000-0.540s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.540 | 0.7995 | 0.2491 | 1131.2 | 1924.1 | 0.000-0.540s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `211.6Hz`; Aurora centroid delta vs reference = `199.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.150s`; centroid delta = `136.7Hz`.
- Spectral shape: band distance = `0.2701`; rolloff delta = `523.0Hz`.
- Envelope shape: attack position delta = `0.338`; decay ratio delta = `0.030`; burst-share delta = `0.065`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `body` risk `4.3/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.11-0.16s | 0.01-0.539s | 4.3 | 0.479s | 47.5Hz | 0.2446 | 333.1Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.01-0.06s | 0.01-0.539s | 4.17 | 0.479s | 36.1Hz | 0.2317 | 132.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| tail | 0.419-0.529s | 0.01-0.539s | 3.94 | 0.419s | 180.5Hz | 0.2649 | 352.3Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.2-0.309s | 0.01-0.539s | 3.87 | 0.419s | 204.8Hz | 0.2778 | 352.3Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7722 | 0.2449 | 1264.8 | 2054.2 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `46.5Hz`; Aurora centroid delta vs reference = `11.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.030s`; centroid delta = `53.1Hz`.
- Spectral shape: band distance = `0.1615`; rolloff delta = `100.4Hz`.
- Envelope shape: attack position delta = `0.233`; decay ratio delta = `0.017`; burst-share delta = `0.004`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.59/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.24s | 0.02-0.24s | 4.59 | 0.06s | 115.2Hz | 0.2004 | 189.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `797.9Hz`; Aurora centroid delta vs reference = `797.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.040s`; centroid delta = `797.5Hz`.
- Spectral shape: band distance = `0.3304`; rolloff delta = `1248.2Hz`.
- Envelope shape: attack position delta = `0.120`; decay ratio delta = `5.322`; burst-share delta = `0.229`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.69/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.12-0.24s | 0.01-0.22s | 6.69 | 0.09s | 924.3Hz | 0.3568 | 1774.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.8019 | 0.2453 | 1366.1 | 2091.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `742.3Hz`; Aurora centroid delta vs reference = `699.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.020s`; centroid delta = `699.6Hz`.
- Spectral shape: band distance = `0.3638`; rolloff delta = `457.5Hz`.
- Envelope shape: attack position delta = `0.833`; decay ratio delta = `3.231`; burst-share delta = `0.099`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.25/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.09-0.24s | 0.03-0.22s | 4.25 | 0.04s | 567.4Hz | 0.3567 | 456.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `133.4Hz`; Aurora centroid delta vs reference = `133.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.050s`; centroid delta = `91.5Hz`.
- Spectral shape: band distance = `0.2082`; rolloff delta = `221.4Hz`.
- Envelope shape: attack position delta = `0.367`; decay ratio delta = `0.487`; burst-share delta = `0.037`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.76/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.01-0.17s | 0.01-0.299s | 3.76 | 0.129s | 183.6Hz | 0.2358 | 50.1Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7807 | 0.2453 | 1275.8 | 2073.3 | 0.000-0.300s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.010s`; Aurora duration delta vs reference = `0.010s`.
- Quick read: synthetic Galaga centroid delta vs reference = `62.2Hz`; Aurora centroid delta vs reference = `178.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.080s`; centroid delta = `78.8Hz`.
- Spectral shape: band distance = `0.2070`; rolloff delta = `80.0Hz`.
- Envelope shape: attack position delta = `0.486`; decay ratio delta = `0.801`; burst-share delta = `0.182`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.7/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.01-0.269s | 2.7 | 0.109s | 134.1Hz | 0.1672 | 459.4Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7783 | 0.2479 | 1322.9 | 2050.0 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `99.3Hz`; Aurora centroid delta vs reference = `53.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `53.4Hz`.
- Spectral shape: band distance = `0.2602`; rolloff delta = `275.0Hz`.
- Envelope shape: attack position delta = `0.667`; decay ratio delta = `0.282`; burst-share delta = `0.033`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.21/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.01-0.22s | 3.21 | 0.03s | 179.5Hz | 0.2327 | 249.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.300 | 0.7783 | 0.2471 | 1391.9 | 2020.0 | 0.000-0.290s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.743s`; Aurora duration delta vs reference = `1.743s`.
- Quick read: synthetic Galaga centroid delta vs reference = `348.8Hz`; Aurora centroid delta vs reference = `348.8Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.479s`; centroid delta = `349.4Hz`.
- Spectral shape: band distance = `0.3928`; rolloff delta = `188.0Hz`.
- Envelope shape: attack position delta = `0.229`; decay ratio delta = `0.009`; burst-share delta = `0.285`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.78/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.868-1.487s | 0.01-0.299s | 4.78 | 0.33s | 616.9Hz | 0.3939 | 355.4Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.850-1.140s score 0.789; 1.349-1.639s score 0.696; 0.250-0.540s score 0.261.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8141 | 0.2489 | 1083.5 | 1997.9 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8706 | 0.2493 | 1136.9 | 1933.3 | 0.000-0.480s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `659.3Hz`; Aurora centroid delta vs reference = `712.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.141s`; centroid delta = `709.4Hz`.
- Spectral shape: band distance = `0.3315`; rolloff delta = `525.8Hz`.
- Envelope shape: attack position delta = `0.269`; decay ratio delta = `0.472`; burst-share delta = `0.232`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.77/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.269s | 0.01-0.479s | 5.77 | 0.2s | 642.1Hz | 0.3266 | 436.6Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2461 | 1223.1 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8141 | 0.2473 | 1218.0 | 1992.9 | 0.000-0.420s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `126.2Hz`; Aurora centroid delta vs reference = `131.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `131.3Hz`.
- Spectral shape: band distance = `0.4301`; rolloff delta = `1126.1Hz`.
- Envelope shape: attack position delta = `0.174`; decay ratio delta = `0.194`; burst-share delta = `0.245`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.98/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.01-0.409s | 4.98 | 0.219s | 126.7Hz | 0.4665 | 1127.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| tail | 0.259-0.389s | 0.01-0.409s | 4.98 | 0.269s | 17.8Hz | 0.4261 | 1088.5Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8142 | 0.2494 | 1139.0 | 1983.3 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8141 | 0.2474 | 1240.2 | 2035.7 | 0.000-0.420s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `600.3Hz`; Aurora centroid delta vs reference = `701.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.021s`; centroid delta = `749.5Hz`.
- Spectral shape: band distance = `0.1760`; rolloff delta = `2216.6Hz`.
- Envelope shape: attack position delta = `0.500`; decay ratio delta = `0.150`; burst-share delta = `0.010`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `7.03/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.06s | 0.01-0.399s | 7.03 | 0.329s | 1125.8Hz | 0.2164 | 2972.5Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| body | 0.289-0.359s | 0.01-0.399s | 5.78 | 0.319s | 654.0Hz | 0.1872 | 2071.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.09-0.259s | 0.01-0.399s | 5.18 | 0.219s | 719.9Hz | 0.1824 | 2090.8Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.240 | 0.7807 | 0.2485 | 1475.6 | 2066.7 | 0.000-0.240s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `242.4Hz`; Aurora centroid delta vs reference = `242.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `242.4Hz`.
- Spectral shape: band distance = `0.2833`; rolloff delta = `1337.5Hz`.
- Envelope shape: attack position delta = `0.333`; decay ratio delta = `0.101`; burst-share delta = `0.000`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.33/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.01-0.24s | 3.33 | 0.04s | 483.9Hz | 0.2145 | 1431.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.7649 | 0.2479 | 1243.1 | 2038.9 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.360 | 0.7807 | 0.2469 | 1270.9 | 2005.6 | 0.000-0.360s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `245.6Hz`; Aurora centroid delta vs reference = `273.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `273.4Hz`.
- Spectral shape: band distance = `0.1081`; rolloff delta = `75.0Hz`.
- Envelope shape: attack position delta = `0.333`; decay ratio delta = `0.035`; burst-share delta = `0.043`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `body` risk `3.91/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.22-0.279s | 0.08-0.359s | 3.91 | 0.219s | 403.0Hz | 0.1649 | 850.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.319-0.359s | 0.08-0.359s | 3.25 | 0.239s | 117.9Hz | 0.0214 | 377.6Hz | tail timing/duration differs enough to tune event pacing before timbre. |
| onset | 0.02-0.09s | 0.01-0.05s | 3.21 | 0.03s | 340.8Hz | 0.1575 | 194.2Hz | onset envelope is the leading gap: transient placement or burst structure differs. |
| body | 0.12-0.18s | 0.08-0.359s | 3.04 | 0.219s | 217.4Hz | 0.1133 | 265.8Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.360 | 0.8019 | 0.2469 | 1244.0 | 2008.3 | 0.000-0.360s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2474 | 1212.9 | 1983.3 | 0.000-0.480s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.563s`; Aurora duration delta vs reference = `1.683s`.
- Quick read: synthetic Galaga centroid delta vs reference = `250.8Hz`; Aurora centroid delta vs reference = `281.9Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.608s`; centroid delta = `280.0Hz`.
- Spectral shape: band distance = `0.0834`; rolloff delta = `565.4Hz`.
- Envelope shape: attack position delta = `0.054`; decay ratio delta = `0.396`; burst-share delta = `0.037`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `tail` risk `4.54/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.888-0.968s | 0.03-0.359s | 4.54 | 0.249s | 170.1Hz | 0.095 | 609.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.09-0.858s | 0.03-0.359s | 4.24 | 0.439s | 188.8Hz | 0.0766 | 549.1Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.100-0.460s score 0.728; 0.500-0.860s score 0.643; 1.050-1.410s score 0.630.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8142 | 0.2513 | 1137.1 | 1935.4 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2490 | 1123.7 | 1983.3 | 0.000-0.480s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `483.6Hz`; Aurora centroid delta vs reference = `470.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `470.2Hz`.
- Spectral shape: band distance = `0.2351`; rolloff delta = `191.7Hz`.
- Envelope shape: attack position delta = `0.434`; decay ratio delta = `8.394`; burst-share delta = `0.213`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `5.74/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.12s | 0.01-0.1s | 5.74 | 0.05s | 767.1Hz | 0.3033 | 599.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.239-0.469s | 0.229-0.479s | 3.74 | 0.019s | 480.3Hz | 0.2015 | 167.8Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.7995 | 0.2461 | 1206.4 | 2079.2 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.7995 | 0.2482 | 1163.9 | 1925.0 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.060s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `618.3Hz`; Aurora centroid delta vs reference = `575.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `575.8Hz`.
- Spectral shape: band distance = `0.1630`; rolloff delta = `632.5Hz`.
- Envelope shape: attack position delta = `0.981`; decay ratio delta = `0.011`; burst-share delta = `0.022`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.63/10`; onset envelope is the leading gap: transient placement or burst structure differs.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.419s | 0.01-0.479s | 3.63 | 0.05s | 559.2Hz | 0.1447 | 536.0Hz | onset envelope is the leading gap: transient placement or burst structure differs. |

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.8020 | 0.2464 | 1244.2 | 2019.0 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8142 | 0.2489 | 1159.0 | 1945.8 | 0.000-0.480s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.060s`.
- Quick read: synthetic Galaga centroid delta vs reference = `881.1Hz`; Aurora centroid delta vs reference = `795.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `795.9Hz`.
- Spectral shape: band distance = `0.1338`; rolloff delta = `3176.2Hz`.
- Envelope shape: attack position delta = `0.981`; decay ratio delta = `0.080`; burst-share delta = `0.017`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `7.38/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.239-0.279s | 0.04-0.389s | 7.38 | 0.309s | 1144.2Hz | 0.2353 | 3288.1Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.319-0.429s | 0.04-0.389s | 6.61 | 0.239s | 982.8Hz | 0.1692 | 3289.7Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.18s | 0.04-0.389s | 4.91 | 0.169s | 906.2Hz | 0.1605 | 3278.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.000-0.420s score 0.645.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.480 | 0.8142 | 0.2489 | 1159.0 | 1945.8 | 0.000-0.480s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.480 | 0.8141 | 0.2500 | 1085.0 | 1981.2 | 0.000-0.480s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `790.8Hz`; Aurora centroid delta vs reference = `716.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `716.8Hz`.
- Spectral shape: band distance = `0.2457`; rolloff delta = `906.2Hz`.
- Envelope shape: attack position delta = `0.084`; decay ratio delta = `0.009`; burst-share delta = `0.000`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `5.69/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.01-0.459s | 5.69 | 0.319s | 892.9Hz | 0.3074 | 1530.7Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| body | 0.16-0.22s | 0.01-0.459s | 5.64 | 0.389s | 885.1Hz | 0.2924 | 1784.7Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.329-0.479s | 0.01-0.459s | 5.59 | 0.299s | 717.8Hz | 0.2565 | 861.3Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.420 | 0.7995 | 0.2476 | 1158.1 | 1957.1 | 0.000-0.420s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.420 | 0.8142 | 0.2484 | 1205.0 | 1988.1 | 0.000-0.420s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `478.5Hz`; Aurora centroid delta vs reference = `525.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.050s`; centroid delta = `612.4Hz`.
- Spectral shape: band distance = `0.1493`; rolloff delta = `632.2Hz`.
- Envelope shape: attack position delta = `0.028`; decay ratio delta = `0.007`; burst-share delta = `0.009`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `4.2/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.11-0.249s | 0.01-0.419s | 4.2 | 0.269s | 329.4Hz | 0.1213 | 344.0Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| tail | 0.319-0.419s | 0.01-0.419s | 3.97 | 0.309s | 492.2Hz | 0.129 | 203.4Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.8577 | 0.2542 | 1199.8 | 1872.6 | 0.000-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8673 | 0.2543 | 1190.7 | 1896.4 | 0.000-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `321.1Hz`; Aurora centroid delta vs reference = `312.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.189s`; centroid delta = `303.2Hz`.
- Spectral shape: band distance = `0.0905`; rolloff delta = `603.0Hz`.
- Envelope shape: attack position delta = `0.406`; decay ratio delta = `0.036`; burst-share delta = `0.035`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.67/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.269-0.838s | 0.04-0.15s | 2.67 | 0.459s | 15.3Hz | 0.0404 | 107.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 7
- Reference segments found: `37`
- Segment role comparisons: `37`
- Average worst segment risk: `4.63/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.009s`
- Average active Aurora-vs-reference duration delta: `0.096s`
- Average active Aurora-vs-reference centroid delta: `391.7Hz`
- Average active Aurora-vs-reference band-shape distance: `0.226`
- Average active Aurora-vs-reference envelope decay delta: `0.959`


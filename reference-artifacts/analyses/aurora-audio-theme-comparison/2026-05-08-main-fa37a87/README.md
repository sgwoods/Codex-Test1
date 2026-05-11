# Aurora Audio Theme Comparison

- Generated from commit `fa37a87`
- Version: `1.3.0`
- Generated at: `2026-05-08T22:01:13.266Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9289 | 0.1223 | 1980.1 | 772.7 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1223 | 2045.2 | 803.0 | 0.469-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `661.1Hz`; Aurora centroid delta vs reference = `596.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.450s`; centroid delta = `542.0Hz`.
- Spectral shape: band distance = `0.2376`; rolloff delta = `1000.6Hz`.
- Envelope shape: attack position delta = `0.037`; decay ratio delta = `12.667`; burst-share delta = `0.065`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.5/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.549-0.659s | 6.5 | 0.02s | 654.3Hz | 0.3048 | 1129.9Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9147 | 0.1182 | 2011.4 | 1766.7 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9206 | 0.1203 | 1965.4 | 1754.5 | 0.469-0.660s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.120s`; Aurora duration delta vs reference = `0.120s`.
- Quick read: synthetic Galaga centroid delta vs reference = `622.6Hz`; Aurora centroid delta vs reference = `668.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.199s`; centroid delta = `757.5Hz`.
- Spectral shape: band distance = `0.4314`; rolloff delta = `2184.2Hz`.
- Envelope shape: attack position delta = `0.684`; decay ratio delta = `2.982`; burst-share delta = `0.131`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `5.8/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.259-0.379s | 0.09-0.19s | 5.8 | 0.02s | 769.0Hz | 0.4189 | 2013.5Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.16s | 0.09-0.19s | 5.16 | 0.04s | 622.9Hz | 0.4095 | 1712.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.050-0.241s score 0.624; 0.250-0.441s score 0.592.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8730 | 0.1166 | 1962.2 | 884.8 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1116 | 1970.4 | 757.6 | 0.479-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `694.0Hz`; Aurora centroid delta vs reference = `685.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.450s`; centroid delta = `644.3Hz`.
- Spectral shape: band distance = `0.2741`; rolloff delta = `1128.4Hz`.
- Envelope shape: attack position delta = `0.012`; decay ratio delta = `13.789`; burst-share delta = `0.077`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `7.03/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.05-0.21s | 0.559-0.659s | 7.03 | 0.06s | 762.2Hz | 0.3207 | 1255.6Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9173 | 0.1067 | 2032.6 | 618.2 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9052 | 0.1147 | 1950.8 | 684.8 | 0.479-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `170.0Hz`; Aurora centroid delta vs reference = `88.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.460s`; centroid delta = `87.8Hz`.
- Spectral shape: band distance = `0.1244`; rolloff delta = `98.9Hz`.
- Envelope shape: attack position delta = `0.068`; decay ratio delta = `4.352`; burst-share delta = `0.315`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.71/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.2s | 0.479-0.529s | 6.71 | 0.07s | 551.3Hz | 0.4015 | 482.7Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8905 | 0.1220 | 1957.0 | 709.1 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9206 | 0.1185 | 1996.1 | 700.0 | 0.469-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `69.1Hz`; Aurora centroid delta vs reference = `108.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.029s`; centroid delta = `59.0Hz`.
- Spectral shape: band distance = `0.2219`; rolloff delta = `615.3Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `0.827`; burst-share delta = `0.060`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.17/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.22s | 0.08-0.19s | 2.17 | 0.04s | 85.3Hz | 0.2184 | 575.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.732.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8867 | 0.0966 | 1955.6 | 563.6 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1150 | 1990.3 | 693.9 | 0.479-0.660s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `731.8Hz`; Aurora centroid delta vs reference = `697.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.420s`; centroid delta = `694.1Hz`.
- Spectral shape: band distance = `0.3452`; rolloff delta = `1625.4Hz`.
- Envelope shape: attack position delta = `0.663`; decay ratio delta = `10.305`; burst-share delta = `0.118`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.14/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.01-0.17s | 0.419-0.659s | 5.14 | 0.08s | 761.2Hz | 0.3921 | 1634.8Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8930 | 0.1194 | 1980.3 | 721.2 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8766 | 0.1143 | 1993.3 | 721.2 | 0.479-0.660s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.370s`; Aurora duration delta vs reference = `0.370s`.
- Quick read: synthetic Galaga centroid delta vs reference = `539.2Hz`; Aurora centroid delta vs reference = `526.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.029s`; centroid delta = `567.3Hz`.
- Spectral shape: band distance = `0.3644`; rolloff delta = `1546.5Hz`.
- Envelope shape: attack position delta = `0.652`; decay ratio delta = `3.855`; burst-share delta = `0.024`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.61/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.09-0.19s | 5.61 | 0.05s | 594.6Hz | 0.365 | 1519.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.609.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8926 | 0.1088 | 1949.5 | 737.9 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8930 | 0.1066 | 1988.6 | 630.3 | 0.000-0.660s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `612.3Hz`; Aurora centroid delta vs reference = `573.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.420s`; centroid delta = `573.2Hz`.
- Spectral shape: band distance = `0.3688`; rolloff delta = `1350.0Hz`.
- Envelope shape: attack position delta = `0.867`; decay ratio delta = `12.882`; burst-share delta = `0.028`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.8/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.419-0.659s | 5.8 | 0.06s | 681.5Hz | 0.3861 | 1437.8Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9193 | 0.1119 | 1972.1 | 690.9 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1151 | 1989.8 | 724.2 | 0.479-0.660s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.383s`.
- Quick read: synthetic Galaga centroid delta vs reference = `249.1Hz`; Aurora centroid delta vs reference = `231.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.109s`; centroid delta = `269.7Hz`.
- Spectral shape: band distance = `0.2823`; rolloff delta = `1302.3Hz`.
- Envelope shape: attack position delta = `0.550`; decay ratio delta = `12.557`; burst-share delta = `0.341`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.23/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.688s | 0.559-0.659s | 5.23 | 0.509s | 388.5Hz | 0.2705 | 1396.4Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 1.349-2.009s score 0.744; 0.300-0.960s score 0.740.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9289 | 0.1071 | 1902.7 | 1840.9 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1089 | 1946.1 | 1056.1 | 0.000-0.660s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `149.9Hz`; Aurora centroid delta vs reference = `106.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.321s`; centroid delta = `109.8Hz`.
- Spectral shape: band distance = `0.3215`; rolloff delta = `1057.9Hz`.
- Envelope shape: attack position delta = `0.891`; decay ratio delta = `10.244`; burst-share delta = `0.073`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.72/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.259s | 0.419-0.659s | 5.72 | 0.019s | 260.0Hz | 0.3301 | 1190.5Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8930 | 0.1802 | 1990.8 | 1992.4 | 0.110-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1166 | 1963.1 | 1130.3 | 0.000-0.660s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `871.3Hz`; Aurora centroid delta vs reference = `899.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.130s`; centroid delta = `907.1Hz`.
- Spectral shape: band distance = `0.5373`; rolloff delta = `2619.5Hz`.
- Envelope shape: attack position delta = `0.153`; decay ratio delta = `0.127`; burst-share delta = `0.348`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `tail` risk `6.95/10`; tail timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.259-0.389s | 0.469-0.549s | 6.95 | 0.05s | 840.1Hz | 0.6276 | 2580.1Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| onset | 0.0-0.18s | 0.08-0.269s | 6.37 | 0.01s | 967.3Hz | 0.5357 | 2677.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9137 | 0.1800 | 2031.5 | 1906.1 | 0.110-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1151 | 1988.1 | 884.8 | 0.479-0.660s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `147.6Hz`; Aurora centroid delta vs reference = `191.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.151s`; centroid delta = `161.3Hz`.
- Spectral shape: band distance = `0.2235`; rolloff delta = `571.8Hz`.
- Envelope shape: attack position delta = `0.088`; decay ratio delta = `0.207`; burst-share delta = `0.098`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.71/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.06s | 0.08-0.259s | 4.71 | 0.12s | 154.2Hz | 0.249 | 1289.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.289-0.359s | 0.469-0.549s | 4.51 | 0.01s | 358.5Hz | 0.2677 | 412.9Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.09-0.259s | 0.08-0.259s | 4.21 | 0.01s | 251.7Hz | 0.216 | 407.3Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9174 | 0.1116 | 1970.9 | 666.7 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1067 | 2032.4 | 630.3 | 0.000-0.660s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `799.2Hz`; Aurora centroid delta vs reference = `737.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.059s`; centroid delta = `750.0Hz`.
- Spectral shape: band distance = `0.4487`; rolloff delta = `2324.3Hz`.
- Envelope shape: attack position delta = `0.415`; decay ratio delta = `2.779`; burst-share delta = `0.197`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.08/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.09-0.18s | 6.08 | 0.1s | 923.7Hz | 0.4881 | 2430.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.181s score 0.616.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8781 | 0.1239 | 1985.5 | 1471.2 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8990 | 0.1229 | 1947.0 | 1251.5 | 0.469-0.660s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.300s`; Aurora duration delta vs reference = `0.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `430.5Hz`; Aurora centroid delta vs reference = `469.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.159s`; centroid delta = `486.0Hz`.
- Spectral shape: band distance = `0.2500`; rolloff delta = `1700.8Hz`.
- Envelope shape: attack position delta = `0.871`; decay ratio delta = `2.303`; burst-share delta = `0.201`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `6.81/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.319-0.359s | 0.09-0.2s | 6.81 | 0.07s | 630.6Hz | 0.3231 | 1920.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.12-0.18s | 0.09-0.2s | 6.1 | 0.05s | 531.1Hz | 0.2727 | 1277.5Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.09s | 0.09-0.2s | 5.97 | 0.04s | 571.7Hz | 0.235 | 1551.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.22-0.279s | 0.09-0.2s | 5.16 | 0.05s | 345.5Hz | 0.1953 | 693.3Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.100-0.301s score 0.668.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.960 | 1.0000 | 0.2555 | 1566.9 | 1602.1 | 0.050-0.960s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1578 | 1936.6 | 998.5 | 0.339-0.660s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.083s`.
- Quick read: synthetic Galaga centroid delta vs reference = `974.5Hz`; Aurora centroid delta vs reference = `604.8Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.058s`; centroid delta = `603.7Hz`.
- Spectral shape: band distance = `0.2239`; rolloff delta = `1449.3Hz`.
- Envelope shape: attack position delta = `0.817`; decay ratio delta = `0.664`; burst-share delta = `0.041`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `6.45/10`; body timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.499-0.539s | 0.529-0.708s | 6.45 | 0.14s | 880.9Hz | 0.3316 | 2052.7Hz | body timing/duration differs enough to tune event pacing before timbre. |
| onset | 0.08-0.459s | 0.05-0.279s | 1.39 | 0.149s | 85.5Hz | 0.0129 | 46.1Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.100-1.010s score 0.634; 1.050-1.960s score 0.513.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9137 | 0.1206 | 1985.9 | 2357.6 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9203 | 0.1151 | 1963.6 | 1886.4 | 0.479-0.660s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `356.3Hz`; Aurora centroid delta vs reference = `378.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `429.7Hz`.
- Spectral shape: band distance = `0.2498`; rolloff delta = `1481.2Hz`.
- Envelope shape: attack position delta = `0.380`; decay ratio delta = `5.413`; burst-share delta = `0.042`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `4.87/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.239-0.469s | 0.09-0.19s | 4.87 | 0.13s | 612.3Hz | 0.2993 | 1956.5Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.08-0.12s | 0.09-0.19s | 4.06 | 0.06s | 206.6Hz | 0.2506 | 1213.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.200-0.391s score 0.683; 0.000-0.191s score 0.665.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8940 | 0.1763 | 1957.5 | 2006.1 | 0.120-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1116 | 1970.6 | 1387.9 | 0.479-0.660s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `188.4Hz`; Aurora centroid delta vs reference = `175.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.120s`; centroid delta = `199.2Hz`.
- Spectral shape: band distance = `0.3298`; rolloff delta = `852.8Hz`.
- Envelope shape: attack position delta = `0.414`; decay ratio delta = `0.411`; burst-share delta = `0.116`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.34/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.419s | 0.08-0.269s | 6.34 | 0.229s | 275.6Hz | 0.3614 | 1045.3Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9137 | 0.1189 | 2017.0 | 2703.0 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1117 | 1971.8 | 2748.5 | 0.479-0.660s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `68.3Hz`; Aurora centroid delta vs reference = `23.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `1.9Hz`.
- Spectral shape: band distance = `0.2701`; rolloff delta = `1535.4Hz`.
- Envelope shape: attack position delta = `0.913`; decay ratio delta = `3.183`; burst-share delta = `0.155`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.37/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.09-0.19s | 5.37 | 0.08s | 57.8Hz | 0.2994 | 1555.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.319-0.429s | 0.09-0.19s | 4.26 | 0.01s | 18.8Hz | 0.2769 | 1565.8Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.239-0.279s | 0.09-0.19s | 4.03 | 0.06s | 180.2Hz | 0.1836 | 1564.2Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.776; 0.200-0.391s score 0.695.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9144 | 0.1151 | 1991.5 | 2530.3 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9137 | 0.1190 | 2015.1 | 2066.7 | 0.469-0.660s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `139.3Hz`; Aurora centroid delta vs reference = `115.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.299s`; centroid delta = `159.8Hz`.
- Spectral shape: band distance = `0.1686`; rolloff delta = `736.3Hz`.
- Envelope shape: attack position delta = `0.172`; decay ratio delta = `2.893`; burst-share delta = `0.161`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `3.49/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.08-0.18s | 3.49 | 0.03s | 73.3Hz | 0.2855 | 208.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.329-0.479s | 0.08-0.18s | 2.3 | 0.05s | 248.4Hz | 0.181 | 877.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.16-0.22s | 0.08-0.18s | 2.23 | 0.04s | 81.1Hz | 0.1183 | 45.5Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.231s score 0.832; 0.250-0.431s score 0.619.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9136 | 0.1119 | 1951.6 | 1693.9 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9147 | 0.1180 | 2013.4 | 1400.0 | 0.469-0.660s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `329.9Hz`; Aurora centroid delta vs reference = `268.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.290s`; centroid delta = `181.1Hz`.
- Spectral shape: band distance = `0.1960`; rolloff delta = `854.2Hz`.
- Envelope shape: attack position delta = `0.087`; decay ratio delta = `10.207`; burst-share delta = `0.122`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `2.91/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.06-0.2s | 0.559-0.659s | 2.91 | 0.04s | 350.4Hz | 0.2299 | 1130.3Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.319-0.369s | 0.559-0.659s | 2.6 | 0.05s | 132.7Hz | 0.2223 | 912.9Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.9218 | 0.1559 | 1935.9 | 1209.5 | 0.469-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.8960 | 0.1511 | 1915.2 | 1294.0 | 0.489-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `403.4Hz`; Aurora centroid delta vs reference = `424.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.280s`; centroid delta = `452.3Hz`.
- Spectral shape: band distance = `0.2803`; rolloff delta = `863.3Hz`.
- Envelope shape: attack position delta = `0.306`; decay ratio delta = `0.204`; burst-share delta = `0.227`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.65/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.559s | 0.09-0.269s | 5.65 | 0.299s | 460.5Hz | 0.2741 | 837.4Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.150-0.521s score 0.778.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 17
- Reference segments found: `37`
- Segment role comparisons: `35`
- Average worst segment risk: `5.49/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.230s`
- Average active Aurora-vs-reference duration delta: `0.239s`
- Average active Aurora-vs-reference centroid delta: `411.3Hz`
- Average active Aurora-vs-reference band-shape distance: `0.293`
- Average active Aurora-vs-reference envelope decay delta: `5.374`

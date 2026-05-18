# Aurora Audio Theme Comparison

- Generated from commit `c8c7246f`
- Version: `1.4.0`
- Generated at: `2026-05-15T20:16:49.273Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6600 | 0.1194 | 1982.8 | 1219.0 | 0.000-0.130s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6350 | 0.1185 | 2019.8 | 1158.3 | 0.000-0.134s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `635.7Hz`; Aurora centroid delta vs reference = `598.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.080s`; centroid delta = `284.8Hz`.
- Spectral shape: band distance = `0.1166`; rolloff delta = `554.8Hz`.
- Envelope shape: attack position delta = `0.875`; decay ratio delta = `0.904`; burst-share delta = `0.013`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.65/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.0-0.13s | 2.65 | 0.0s | 213.8Hz | 0.0651 | 443.1Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.130s score 0.738.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6573 | 0.1165 | 1992.6 | 1686.9 | 0.229-0.436s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6573 | 0.1165 | 1992.6 | 1627.4 | 0.239-0.444s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.349-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.300s`; Aurora duration delta vs reference = `0.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `649.8Hz`; Aurora centroid delta vs reference = `649.8Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.016s`; centroid delta = `324.3Hz`.
- Spectral shape: band distance = `0.4553`; rolloff delta = `1132.1Hz`.
- Envelope shape: attack position delta = `0.217`; decay ratio delta = `8.218`; burst-share delta = `0.058`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.67/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.18s | 0.15-0.2s | 6.67 | 0.06s | 903.9Hz | 0.4868 | 1850.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.300-0.507s score 0.619; 0.000-0.207s score 0.394.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.5717 | 0.1158 | 2018.5 | 1506.0 | 0.000-0.220s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6168 | 0.1143 | 1966.1 | 1179.8 | 0.000-0.150s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `689.7Hz`; Aurora centroid delta vs reference = `742.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.010s`; centroid delta = `18.7Hz`.
- Spectral shape: band distance = `0.0082`; rolloff delta = `68.4Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `0.080`; burst-share delta = `0.186`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.26/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.05-0.21s | 0.07-0.14s | 2.26 | 0.09s | 226.9Hz | 0.0406 | 708.3Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.220s score 0.942.

### Formation Cadence Pressure Analysis

- Cadence pressure score: `9.42/10`
- Weakest axis: `gain-match`
- Next experiment: Generate candidates that explicitly optimize low-band body and zero-crossing calm together, then require full audio-theme comparison before runtime promotion.

| Axis | Score | Aurora | Reference | Player/Designer Meaning |
| --- | ---: | --- | --- | --- |
| Gain match | 7.85 | `0.0534` | `0.0813` | Formation cadence should create pressure without masking shot, hit, and capture feedback. |
| Duration pocket | 9.17 | `0.22` | `0.21` | The pulse needs to sit inside the repeat cadence without smearing into a continuous drone. |
| Brightness control | 9.62 | `0.2591` | `0.2659` | A pressure cadence can be audible without pulling too much energy into mid/presence bands. |
| Zero-crossing calm | 9.68 | `600.9` | `547.2` | Lower crossing density keeps the cadence from feeling scratchy or over-complex. |
| Low-band body | 10.0 | `0.458` | `0.454` | Formation pressure should have enough low-frequency body to read as a marching bed, not only a bright tick. |
| Envelope smoothness | 10.0 | `{"attack_peak_position": 1.0, "burst_share": 0.036}` | `{"attack_peak_position": 1.0, "burst_share": 0.222}` | The cadence should feel like pressure building, not a foreground impact event. |

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6396 | 0.1409 | 2007.5 | 1732.1 | 0.020-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6339 | 0.1145 | 1950.2 | 1161.9 | 0.000-0.120s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.000-0.120s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `170.6Hz`; Aurora centroid delta vs reference = `113.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.100s`; centroid delta = `51.8Hz`.
- Spectral shape: band distance = `0.0875`; rolloff delta = `40.0Hz`.
- Envelope shape: attack position delta = `0.067`; decay ratio delta = `0.742`; burst-share delta = `0.054`.
- Reference segmentation: `curated-reference-segmentation` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.3/10`; onset envelope is the leading gap: transient placement or burst structure differs.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.2s | 0.08-0.22s | 2.3 | 0.02s | 105.5Hz | 0.0907 | 19.2Hz | onset envelope is the leading gap: transient placement or burst structure differs. |
- Candidate reference subwindows: 0.000-0.220s score 0.789.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6594 | 0.1343 | 1977.0 | 1566.7 | 0.000-0.150s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6274 | 0.1153 | 1938.8 | 1150.0 | 0.000-0.150s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.000-0.150s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `126.4Hz`; Aurora centroid delta vs reference = `88.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `66.1Hz`.
- Spectral shape: band distance = `0.0269`; rolloff delta = `45.7Hz`.
- Envelope shape: attack position delta = `0.111`; decay ratio delta = `0.653`; burst-share delta = `0.052`.
- Reference segmentation: `curated-reference-segmentation` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `1.78/10`; onset segment is comparatively close; keep it as a guardrail while other segments improve.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.22s | 0.04-0.15s | 1.78 | 0.04s | 111.8Hz | 0.0298 | 102.1Hz | onset segment is comparatively close; keep it as a guardrail while other segments improve. |
- Candidate reference subwindows: 0.050-0.200s score 0.831.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6361 | 0.1404 | 1780.7 | 1352.4 | 0.000-0.200s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6327 | 0.1151 | 1949.6 | 1153.6 | 0.000-0.188s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.160s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `691.1Hz`; Aurora centroid delta vs reference = `522.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.040s`; centroid delta = `114.8Hz`.
- Spectral shape: band distance = `0.0223`; rolloff delta = `50.7Hz`.
- Envelope shape: attack position delta = `0.640`; decay ratio delta = `0.066`; burst-share delta = `0.113`.
- Reference segmentation: `curated-reference-segmentation` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.17/10`; onset envelope is the leading gap: transient placement or burst structure differs.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.01-0.17s | 0.02-0.15s | 2.17 | 0.03s | 34.0Hz | 0.0241 | 11.4Hz | onset envelope is the leading gap: transient placement or burst structure differs. |
- Candidate reference subwindows: 0.000-0.200s score 0.918.

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6639 | 0.1387 | 1783.7 | 1438.1 | 0.000-0.220s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6512 | 0.1415 | 1806.9 | 1516.7 | 0.000-0.220s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.150s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.550s`; Aurora duration delta vs reference = `0.550s`.
- Quick read: synthetic Galaga centroid delta vs reference = `352.8Hz`; Aurora centroid delta vs reference = `329.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.070s`; centroid delta = `49.8Hz`.
- Spectral shape: band distance = `0.0091`; rolloff delta = `64.1Hz`.
- Envelope shape: attack position delta = `0.074`; decay ratio delta = `0.374`; burst-share delta = `0.146`.
- Reference segmentation: `curated-reference-segmentation` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `0.92/10`; onset loudness/energy differs; tune gain after timing and timbre remain stable.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.0-0.15s | 0.92 | 0.0s | 50.1Hz | 0.011 | 55.4Hz | onset loudness/energy differs; tune gain after timing and timbre remain stable. |
- Candidate reference subwindows: 0.050-0.270s score 0.879.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6465 | 0.1500 | 1748.1 | 1554.8 | 0.000-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6416 | 0.1499 | 1744.7 | 1526.2 | 0.000-0.240s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.180s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `368.4Hz`; Aurora centroid delta vs reference = `371.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.060s`; centroid delta = `0.9Hz`.
- Spectral shape: band distance = `0.0116`; rolloff delta = `4.9Hz`.
- Envelope shape: attack position delta = `0.024`; decay ratio delta = `0.423`; burst-share delta = `0.183`.
- Reference segmentation: `curated-reference-segmentation` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `0.86/10`; onset loudness/energy differs; tune gain after timing and timbre remain stable.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.01-0.18s | 0.86 | 0.01s | 21.7Hz | 0.0053 | 15.4Hz | onset loudness/energy differs; tune gain after timing and timbre remain stable. |

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 1.0000 | 0.1967 | 1829.8 | 2248.8 | 0.249-0.619s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.9189 | 0.1944 | 1819.2 | 2345.2 | 0.249-0.640s | n/a | n/a |
| Boss Death / Sasori | 0.769 | 0.7216 | 0.2551 | 1702.3 | 2307.0 | 0.000-0.270s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.071s`; Aurora duration delta vs reference = `0.071s`.
- Quick read: synthetic Galaga centroid delta vs reference = `116.9Hz`; Aurora centroid delta vs reference = `127.5Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.099s`; centroid delta = `196.8Hz`.
- Spectral shape: band distance = `0.0906`; rolloff delta = `907.3Hz`.
- Envelope shape: attack position delta = `0.345`; decay ratio delta = `0.251`; burst-share delta = `0.401`.
- Reference segmentation: `curated-reference-segmentation` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `3.54/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.052-0.233s | 0.06-0.369s | 3.54 | 0.128s | 179.9Hz | 0.0898 | 1149.6Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| body | 0.252-0.433s | 0.06-0.369s | 3.04 | 0.128s | 29.4Hz | 0.1409 | 873.3Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.601-0.769s | 0.06-0.369s | 2.67 | 0.141s | 31.7Hz | 0.1688 | 470.3Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.300-0.669s score 0.879.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6639 | 0.1146 | 1961.2 | 1995.2 | 0.000-0.284s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6396 | 0.1125 | 1942.0 | 1282.1 | 0.239-0.400s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.309s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.360s`; Aurora duration delta vs reference = `0.360s`.
- Quick read: synthetic Galaga centroid delta vs reference = `145.8Hz`; Aurora centroid delta vs reference = `165.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.025s`; centroid delta = `218.7Hz`.
- Spectral shape: band distance = `0.1105`; rolloff delta = `1159.5Hz`.
- Envelope shape: attack position delta = `0.118`; decay ratio delta = `0.485`; burst-share delta = `0.196`.
- Reference segmentation: `curated-reference-segmentation` with `3` segment(s); dominant role `onset`.
- Worst segment role: `tail` risk `5.33/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.269-0.339s | 0.01-0.07s | 5.33 | 0.01s | 1046.8Hz | 0.2993 | 1507.1Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.17s | 0.01-0.07s | 4.36 | 0.11s | 31.8Hz | 0.2558 | 988.2Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.17-0.269s | 0.01-0.07s | 4.04 | 0.039s | 63.4Hz | 0.244 | 1028.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.334s score 0.737.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6685 | 0.1622 | 1785.6 | 1601.2 | 0.110-0.399s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6605 | 0.1126 | 1948.6 | 1415.5 | 0.000-0.300s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.250s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `856.8Hz`; Aurora centroid delta vs reference = `693.8Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.040s`; centroid delta = `81.6Hz`.
- Spectral shape: band distance = `0.1955`; rolloff delta = `741.3Hz`.
- Envelope shape: attack position delta = `0.516`; decay ratio delta = `0.253`; burst-share delta = `0.343`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `1.61/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.06-0.22s | 1.61 | 0.02s | 43.7Hz | 0.0751 | 2.7Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.340s score 0.780.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6621 | 0.1311 | 1950.9 | 2004.8 | 0.030-0.240s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6579 | 0.1145 | 1945.7 | 1211.9 | 0.000-0.324s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.020-0.230s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `105.2Hz`; Aurora centroid delta vs reference = `110.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `76.6Hz`.
- Spectral shape: band distance = `0.0205`; rolloff delta = `224.0Hz`.
- Envelope shape: attack position delta = `0.462`; decay ratio delta = `0.014`; burst-share delta = `0.074`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `1.1/10`; body segment is comparatively close; keep it as a guardrail while other segments improve.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.07-0.14s | 0.07-0.14s | 1.1 | 0.0s | 81.6Hz | 0.0343 | 128.7Hz | body segment is comparatively close; keep it as a guardrail while other segments improve. |
| onset | 0.0-0.04s | 0.0-0.04s | 1.01 | 0.0s | 180.4Hz | 0.037 | 125.1Hz | onset segment is comparatively close; keep it as a guardrail while other segments improve. |
| tail | 0.17-0.21s | 0.17-0.21s | 0.92 | 0.0s | 112.9Hz | 0.0225 | 175.2Hz | tail segment is comparatively close; keep it as a guardrail while other segments improve. |
- Candidate reference subwindows: 0.000-0.210s score 0.903.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6744 | 0.1327 | 1902.0 | 1670.2 | 0.000-0.190s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6605 | 0.1125 | 1947.2 | 1108.3 | 0.000-0.170s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.180s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.600s`; Aurora duration delta vs reference = `0.600s`.
- Quick read: synthetic Galaga centroid delta vs reference = `714.0Hz`; Aurora centroid delta vs reference = `668.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.010s`; centroid delta = `5.1Hz`.
- Spectral shape: band distance = `0.0128`; rolloff delta = `32.8Hz`.
- Envelope shape: attack position delta = `0.130`; decay ratio delta = `0.010`; burst-share delta = `0.049`.
- Reference segmentation: `curated-reference-segmentation` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.07/10`; onset envelope is the leading gap: transient placement or burst structure differs.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.01-0.12s | 2.07 | 0.08s | 25.7Hz | 0.0169 | 99.9Hz | onset envelope is the leading gap: transient placement or burst structure differs. |
- Candidate reference subwindows: 0.050-0.240s score 0.887.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6416 | 0.1148 | 1943.2 | 1726.2 | 0.000-0.248s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6639 | 0.1145 | 1961.6 | 1533.3 | 0.000-0.248s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.180 | 0.3677 | 0.1028 | 1538.0 | 1783.3 | 0.000-0.150s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.660s`; Aurora duration delta vs reference = `0.660s`.
- Quick read: synthetic Galaga centroid delta vs reference = `423.6Hz`; Aurora centroid delta vs reference = `405.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.098s`; centroid delta = `328.6Hz`.
- Spectral shape: band distance = `0.4046`; rolloff delta = `1119.4Hz`.
- Envelope shape: attack position delta = `0.423`; decay ratio delta = `0.457`; burst-share delta = `0.044`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.74/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.09s | 0.01-0.18s | 4.74 | 0.1s | 438.2Hz | 0.4303 | 1537.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.260 | 0.8867 | 0.1662 | 1579.0 | 1548.4 | 0.020-0.619s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.260 | 0.8705 | 0.1682 | 1592.9 | 1531.7 | 0.020-0.639s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.010-0.539s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.783s`; Aurora duration delta vs reference = `0.783s`.
- Quick read: synthetic Galaga centroid delta vs reference = `630.8Hz`; Aurora centroid delta vs reference = `616.9Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.000s`; centroid delta = `537.8Hz`.
- Spectral shape: band distance = `0.2051`; rolloff delta = `1324.4Hz`.
- Envelope shape: attack position delta = `0.248`; decay ratio delta = `0.203`; burst-share delta = `0.065`.
- Reference segmentation: `curated-reference-segmentation` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `6.52/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.459-0.858s | 0.619-0.778s | 6.52 | 0.239s | 902.9Hz | 0.3521 | 2047.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.858-0.988s | 0.619-0.778s | 5.58 | 0.03s | 927.4Hz | 0.3528 | 2059.3Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| onset | 0.02-0.459s | 0.09-0.539s | 3.38 | 0.01s | 440.4Hz | 0.1778 | 994.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.200-1.168s score 0.733.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6744 | 0.1158 | 1945.7 | 2140.5 | 0.229-0.378s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6600 | 0.1151 | 1948.9 | 1861.9 | 0.229-0.388s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.160-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.360s`; Aurora duration delta vs reference = `0.360s`.
- Quick read: synthetic Galaga centroid delta vs reference = `341.6Hz`; Aurora centroid delta vs reference = `338.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.171s`; centroid delta = `147.1Hz`.
- Spectral shape: band distance = `0.3437`; rolloff delta = `712.5Hz`.
- Envelope shape: attack position delta = `0.367`; decay ratio delta = `9.723`; burst-share delta = `0.002`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.71/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.309s | 0.08-0.14s | 5.71 | 0.17s | 6.7Hz | 0.4029 | 1478.0Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.050-0.199s score 0.617; 0.250-0.399s score 0.491.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.380 | 0.7295 | 0.1315 | 1917.3 | 2183.3 | 0.918-1.200s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6317 | 0.1155 | 1941.0 | 1646.4 | 0.239-0.366s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.160-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.960s`.
- Quick read: synthetic Galaga centroid delta vs reference = `158.8Hz`; Aurora centroid delta vs reference = `135.1Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.022s`; centroid delta = `234.6Hz`.
- Spectral shape: band distance = `0.3218`; rolloff delta = `910.6Hz`.
- Envelope shape: attack position delta = `0.477`; decay ratio delta = `0.157`; burst-share delta = `0.240`.
- Reference segmentation: `curated-reference-segmentation` with `3` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `5.09/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.34-0.42s | 0.08-0.24s | 5.09 | 0.08s | 332.9Hz | 0.287 | 1638.7Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.14-0.34s | 0.08-0.24s | 4.44 | 0.04s | 281.4Hz | 0.3592 | 941.2Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.14s | 0.08-0.24s | 4.3 | 0.02s | 265.5Hz | 0.3552 | 1083.3Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.100-0.382s score 0.764.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6605 | 0.1156 | 1948.1 | 2664.3 | 0.229-0.330s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6268 | 0.1147 | 1948.7 | 2370.2 | 0.249-0.402s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.170s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.360s`; Aurora duration delta vs reference = `0.360s`.
- Quick read: synthetic Galaga centroid delta vs reference = `91.4Hz`; Aurora centroid delta vs reference = `92.0Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.069s`; centroid delta = `727.6Hz`.
- Spectral shape: band distance = `0.2682`; rolloff delta = `2563.0Hz`.
- Envelope shape: attack position delta = `0.917`; decay ratio delta = `17.580`; burst-share delta = `0.028`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.85/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.09s | 0.0-0.101s | 6.85 | 0.011s | 843.9Hz | 0.2948 | 2799.0Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.150-0.251s score 0.359; 0.000-0.101s score 0.329; 0.300-0.401s score 0.322.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6325 | 0.1155 | 1942.3 | 2400.0 | 0.239-0.372s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6321 | 0.1154 | 1943.2 | 2095.2 | 0.239-0.364s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.259-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.360s`; Aurora duration delta vs reference = `0.360s`.
- Quick read: synthetic Galaga centroid delta vs reference = `67.4Hz`; Aurora centroid delta vs reference = `66.5Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.088s`; centroid delta = `537.9Hz`.
- Spectral shape: band distance = `0.3751`; rolloff delta = `460.9Hz`.
- Envelope shape: attack position delta = `0.343`; decay ratio delta = `28.634`; burst-share delta = `0.210`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.25/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.21s | 0.08-0.13s | 6.25 | 0.09s | 545.3Hz | 0.4118 | 373.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.200-0.333s score 0.432; 0.050-0.183s score 0.313.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.6337 | 0.1148 | 1941.9 | 1897.6 | 0.000-0.328s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.6339 | 0.1146 | 1951.1 | 1642.9 | 0.000-0.320s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `267.6Hz`; Aurora centroid delta vs reference = `258.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.038s`; centroid delta = `4.2Hz`.
- Spectral shape: band distance = `0.2025`; rolloff delta = `351.7Hz`.
- Envelope shape: attack position delta = `0.054`; decay ratio delta = `0.419`; burst-share delta = `0.076`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.53/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.06-0.24s | 0.0-0.328s | 4.53 | 0.148s | 37.4Hz | 0.2148 | 352.5Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.328s score 0.606.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.960 | 0.6639 | 0.1143 | 1917.4 | 1235.4 | 0.329-0.649s | n/a | n/a |
| Galaga Original Reference (synthetic) | 1.020 | 0.6345 | 0.1110 | 1903.9 | 1340.2 | 0.309-0.639s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.120s`.
- Quick read: synthetic Galaga centroid delta vs reference = `392.1Hz`; Aurora centroid delta vs reference = `405.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.331s`; centroid delta = `441.3Hz`.
- Spectral shape: band distance = `0.2870`; rolloff delta = `925.5Hz`.
- Envelope shape: attack position delta = `0.329`; decay ratio delta = `0.068`; burst-share delta = `0.097`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.36/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.559s | 0.08-0.24s | 6.36 | 0.319s | 474.6Hz | 0.2948 | 922.2Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.450-0.770s score 0.711; 0.000-0.320s score 0.593.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 25
- Reference segments found: `31`
- Segment role comparisons: `31`
- Average worst segment risk: `3.78/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.034s`
- Average active Aurora-vs-reference duration delta: `0.065s`
- Average active Aurora-vs-reference centroid delta: `211.9Hz`
- Average active Aurora-vs-reference band-shape distance: `0.170`
- Average active Aurora-vs-reference envelope decay delta: `3.320`

# Aurora Audio Theme Comparison

- Generated from commit `63f90a0`
- Version: `1.3.0`
- Generated at: `2026-05-08T22:54:14.469Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9002 | 0.1525 | 1981.1 | 954.5 | 0.409-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1257 | 1972.1 | 825.8 | 0.459-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `588.0Hz`; Aurora centroid delta vs reference = `597.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.041s`; centroid delta = `562.4Hz`.
- Spectral shape: band distance = `0.2832`; rolloff delta = `942.2Hz`.
- Envelope shape: attack position delta = `0.032`; decay ratio delta = `1.011`; burst-share delta = `0.247`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.33/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.08-0.249s | 5.33 | 0.04s | 618.5Hz | 0.3424 | 1036.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9206 | 0.1202 | 1966.2 | 1812.1 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1169 | 1961.2 | 1724.2 | 0.000-0.660s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.120s`; Aurora duration delta vs reference = `0.120s`.
- Quick read: synthetic Galaga centroid delta vs reference = `618.4Hz`; Aurora centroid delta vs reference = `623.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.199s`; centroid delta = `763.5Hz`.
- Spectral shape: band distance = `0.4292`; rolloff delta = `2179.0Hz`.
- Envelope shape: attack position delta = `0.467`; decay ratio delta = `3.013`; burst-share delta = `0.131`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `5.86/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.259-0.379s | 0.09-0.19s | 5.86 | 0.02s | 780.0Hz | 0.4171 | 2013.5Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.16s | 0.09-0.19s | 5.14 | 0.04s | 633.9Hz | 0.4042 | 1712.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.050-0.241s score 0.640; 0.250-0.441s score 0.576.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8234 | 0.1268 | 1969.7 | 1086.4 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9118 | 0.1224 | 1962.0 | 790.9 | 0.469-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `685.6Hz`; Aurora centroid delta vs reference = `693.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.450s`; centroid delta = `651.8Hz`.
- Spectral shape: band distance = `0.2799`; rolloff delta = `1235.9Hz`.
- Envelope shape: attack position delta = `0.012`; decay ratio delta = `0.494`; burst-share delta = `0.053`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `7.18/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.05-0.21s | 0.539-0.659s | 7.18 | 0.04s | 824.7Hz | 0.3619 | 1287.6Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9147 | 0.1253 | 1990.8 | 871.2 | 0.449-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8780 | 0.1247 | 1995.1 | 813.6 | 0.449-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `125.7Hz`; Aurora centroid delta vs reference = `130.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.011s`; centroid delta = `117.5Hz`.
- Spectral shape: band distance = `0.0450`; rolloff delta = `26.5Hz`.
- Envelope shape: attack position delta = `0.003`; decay ratio delta = `3.324`; burst-share delta = `0.016`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `1.75/10`; onset segment is comparatively close; keep it as a guardrail while other segments improve.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.2s | 0.09-0.21s | 1.75 | 0.0s | 78.6Hz | 0.0272 | 16.7Hz | onset segment is comparatively close; keep it as a guardrail while other segments improve. |
- Candidate reference subwindows: 0.000-0.211s score 0.847.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9173 | 0.1192 | 1978.6 | 709.1 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9110 | 0.1075 | 1970.2 | 636.4 | 0.000-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `95.0Hz`; Aurora centroid delta vs reference = `86.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.029s`; centroid delta = `39.8Hz`.
- Spectral shape: band distance = `0.2416`; rolloff delta = `620.5Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `0.266`; burst-share delta = `0.060`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.92/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.22s | 0.09-0.19s | 2.92 | 0.05s | 56.7Hz | 0.2244 | 573.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.753.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8907 | 0.1691 | 1725.6 | 1127.3 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9052 | 0.1148 | 1949.8 | 706.1 | 0.479-0.660s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `691.3Hz`; Aurora centroid delta vs reference = `467.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.420s`; centroid delta = `464.1Hz`.
- Spectral shape: band distance = `0.1918`; rolloff delta = `1458.7Hz`.
- Envelope shape: attack position delta = `0.676`; decay ratio delta = `0.379`; burst-share delta = `0.123`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.09/10`; onset envelope is the leading gap: transient placement or burst structure differs.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.01-0.17s | 0.0-0.21s | 2.09 | 0.05s | 182.7Hz | 0.0489 | 147.7Hz | onset envelope is the leading gap: transient placement or burst structure differs. |

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9144 | 0.1258 | 1970.5 | 750.0 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1247 | 1982.6 | 759.1 | 0.459-0.660s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.370s`; Aurora duration delta vs reference = `0.370s`.
- Quick read: synthetic Galaga centroid delta vs reference = `528.5Hz`; Aurora centroid delta vs reference = `516.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.019s`; centroid delta = `536.3Hz`.
- Spectral shape: band distance = `0.3320`; rolloff delta = `1548.1Hz`.
- Envelope shape: attack position delta = `0.920`; decay ratio delta = `2.439`; burst-share delta = `0.030`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.95/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.08-0.2s | 4.95 | 0.03s | 549.9Hz | 0.3277 | 1532.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.636.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9227 | 0.1265 | 1986.1 | 830.3 | 0.449-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1192 | 1978.2 | 718.2 | 0.469-0.660s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `601.9Hz`; Aurora centroid delta vs reference = `609.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.029s`; centroid delta = `603.3Hz`.
- Spectral shape: band distance = `0.3308`; rolloff delta = `1482.5Hz`.
- Envelope shape: attack position delta = `0.752`; decay ratio delta = `1.825`; burst-share delta = `0.246`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.34/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.08-0.21s | 5.34 | 0.05s | 634.2Hz | 0.3281 | 1494.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.211s score 0.610.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9080 | 0.1227 | 1962.6 | 797.0 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1192 | 1978.1 | 754.5 | 0.469-0.660s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.383s`.
- Quick read: synthetic Galaga centroid delta vs reference = `237.4Hz`; Aurora centroid delta vs reference = `221.9Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.578s`; centroid delta = `298.8Hz`.
- Spectral shape: band distance = `0.2494`; rolloff delta = `1380.2Hz`.
- Envelope shape: attack position delta = `0.562`; decay ratio delta = `2.577`; burst-share delta = `0.057`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.98/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.688s | 0.08-0.19s | 4.98 | 0.499s | 310.4Hz | 0.2466 | 1389.2Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.800-0.991s score 0.713; 1.399-1.590s score 0.707; 1.199-1.390s score 0.646.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8818 | 0.1187 | 2051.0 | 1904.5 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9002 | 0.1085 | 1940.1 | 1031.8 | 0.000-0.660s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `143.9Hz`; Aurora centroid delta vs reference = `254.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.148s`; centroid delta = `213.0Hz`.
- Spectral shape: band distance = `0.2909`; rolloff delta = `1213.7Hz`.
- Envelope shape: attack position delta = `0.909`; decay ratio delta = `3.458`; burst-share delta = `0.328`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.17/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.259s | 0.09-0.19s | 4.17 | 0.159s | 256.2Hz | 0.2769 | 1213.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.200-0.391s score 0.700; 0.000-0.191s score 0.512.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9050 | 0.1254 | 1957.5 | 1198.5 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1192 | 1977.9 | 1127.3 | 0.469-0.660s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `886.1Hz`; Aurora centroid delta vs reference = `865.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.219s`; centroid delta = `903.2Hz`.
- Spectral shape: band distance = `0.5851`; rolloff delta = `2742.6Hz`.
- Envelope shape: attack position delta = `0.632`; decay ratio delta = `1.619`; burst-share delta = `0.385`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.27/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.08-0.2s | 6.27 | 0.06s | 946.1Hz | 0.6158 | 2749.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.259-0.389s | 0.08-0.2s | 5.87 | 0.01s | 837.2Hz | 0.5648 | 2710.2Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.150-0.351s score 0.523.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9203 | 0.1150 | 1963.1 | 843.9 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9120 | 0.1177 | 1934.7 | 871.2 | 0.000-0.660s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `94.2Hz`; Aurora centroid delta vs reference = `122.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.218s`; centroid delta = `107.3Hz`.
- Spectral shape: band distance = `0.2525`; rolloff delta = `576.2Hz`.
- Envelope shape: attack position delta = `0.455`; decay ratio delta = `3.038`; burst-share delta = `0.156`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `4.66/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.09-0.259s | 0.08-0.18s | 4.66 | 0.07s | 351.1Hz | 0.252 | 319.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.289-0.359s | 0.08-0.18s | 4.39 | 0.03s | 417.0Hz | 0.2569 | 299.8Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.06s | 0.08-0.18s | 3.93 | 0.04s | 54.8Hz | 0.2849 | 1200.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.181s score 0.770; 0.200-0.381s score 0.734.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9136 | 0.1236 | 1989.4 | 736.4 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1193 | 1977.4 | 724.2 | 0.469-0.660s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `744.2Hz`; Aurora centroid delta vs reference = `756.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.039s`; centroid delta = `774.9Hz`.
- Spectral shape: band distance = `0.4479`; rolloff delta = `2394.4Hz`.
- Envelope shape: attack position delta = `0.733`; decay ratio delta = `2.445`; burst-share delta = `0.268`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `7.37/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.09-0.2s | 7.37 | 0.08s | 1029.3Hz | 0.4898 | 2529.4Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.582.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9169 | 0.1286 | 1950.5 | 1477.3 | 0.449-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9052 | 0.1462 | 1931.5 | 1459.1 | 0.419-0.660s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.300s`; Aurora duration delta vs reference = `0.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `415.0Hz`; Aurora centroid delta vs reference = `434.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.149s`; centroid delta = `474.5Hz`.
- Spectral shape: band distance = `0.2424`; rolloff delta = `1688.0Hz`.
- Envelope shape: attack position delta = `0.488`; decay ratio delta = `2.027`; burst-share delta = `0.109`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `6.64/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.319-0.359s | 0.09-0.21s | 6.64 | 0.08s | 576.4Hz | 0.3171 | 1896.7Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.12-0.18s | 0.09-0.21s | 4.99 | 0.06s | 476.9Hz | 0.2667 | 1253.3Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.09s | 0.09-0.21s | 4.72 | 0.05s | 517.5Hz | 0.2351 | 1527.3Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.22-0.279s | 0.09-0.21s | 3.98 | 0.06s | 291.3Hz | 0.1894 | 669.1Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.261s score 0.672.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 1.020 | 1.0000 | 0.2489 | 1566.6 | 1663.7 | 0.040-1.020s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9092 | 0.1125 | 2055.3 | 681.8 | 0.479-0.660s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.023s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1093.2Hz`; Aurora centroid delta vs reference = `604.5Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.012s`; centroid delta = `604.3Hz`.
- Spectral shape: band distance = `0.2232`; rolloff delta = `1436.1Hz`.
- Envelope shape: attack position delta = `0.384`; decay ratio delta = `0.598`; burst-share delta = `0.014`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `5.84/10`; body timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.499-0.539s | 0.509-0.698s | 5.84 | 0.15s | 859.5Hz | 0.3239 | 2038.4Hz | body timing/duration differs enough to tune event pacing before timbre. |
| onset | 0.08-0.459s | 0.06-0.289s | 1.16 | 0.149s | 13.3Hz | 0.0122 | 6.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.100-1.080s score 0.638.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9257 | 0.1235 | 1957.3 | 2300.0 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8780 | 0.1216 | 1953.6 | 1945.5 | 0.469-0.660s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `346.3Hz`; Aurora centroid delta vs reference = `350.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `389.7Hz`.
- Spectral shape: band distance = `0.2401`; rolloff delta = `1460.3Hz`.
- Envelope shape: attack position delta = `0.467`; decay ratio delta = `5.883`; burst-share delta = `0.042`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `4.64/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.239-0.469s | 0.08-0.19s | 4.64 | 0.12s | 489.5Hz | 0.2813 | 1919.3Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.08-0.12s | 0.08-0.19s | 3.99 | 0.07s | 83.8Hz | 0.2525 | 1176.7Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.200-0.391s score 0.706; 0.000-0.191s score 0.678.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8801 | 0.1208 | 2016.6 | 1557.6 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8761 | 0.1148 | 1950.1 | 1375.8 | 0.479-0.660s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `167.9Hz`; Aurora centroid delta vs reference = `234.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.229s`; centroid delta = `252.5Hz`.
- Spectral shape: band distance = `0.3250`; rolloff delta = `999.8Hz`.
- Envelope shape: attack position delta = `0.633`; decay ratio delta = `2.333`; burst-share delta = `0.209`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.9/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.419s | 0.08-0.19s | 6.9 | 0.309s | 322.0Hz | 0.3332 | 1113.2Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.000-0.191s score 0.648; 0.200-0.391s score 0.610.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8930 | 0.1276 | 1983.8 | 2559.1 | 0.449-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1225 | 2044.7 | 2851.5 | 0.469-0.660s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `4.6Hz`; Aurora centroid delta vs reference = `56.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.269s`; centroid delta = `38.3Hz`.
- Spectral shape: band distance = `0.2595`; rolloff delta = `1567.5Hz`.
- Envelope shape: attack position delta = `0.846`; decay ratio delta = `2.160`; burst-share delta = `0.145`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.42/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.09-0.21s | 4.42 | 0.06s | 40.7Hz | 0.2885 | 1598.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.319-0.429s | 0.09-0.21s | 3.45 | 0.01s | 117.3Hz | 0.266 | 1608.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.239-0.279s | 0.09-0.21s | 3.22 | 0.08s | 278.7Hz | 0.1727 | 1607.3Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.211s score 0.742; 0.250-0.461s score 0.575.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9173 | 0.1193 | 1978.0 | 2545.5 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1042 | 2092.1 | 2018.2 | 0.000-0.660s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `216.3Hz`; Aurora centroid delta vs reference = `102.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `150.2Hz`.
- Spectral shape: band distance = `0.1683`; rolloff delta = `732.2Hz`.
- Envelope shape: attack position delta = `0.283`; decay ratio delta = `2.991`; burst-share delta = `0.187`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `4.03/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.09-0.19s | 4.03 | 0.03s | 97.2Hz | 0.2798 | 218.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.329-0.479s | 0.09-0.19s | 2.8 | 0.05s | 272.3Hz | 0.1753 | 887.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.16-0.22s | 0.09-0.19s | 2.23 | 0.04s | 105.0Hz | 0.1126 | 35.5Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.241s score 0.825; 0.250-0.441s score 0.627.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8781 | 0.1239 | 1985.3 | 1665.2 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9002 | 0.1220 | 2049.8 | 1463.6 | 0.469-0.660s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `366.3Hz`; Aurora centroid delta vs reference = `301.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.169s`; centroid delta = `232.0Hz`.
- Spectral shape: band distance = `0.2075`; rolloff delta = `996.4Hz`.
- Envelope shape: attack position delta = `0.047`; decay ratio delta = `2.239`; burst-share delta = `0.207`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `3.87/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.06-0.2s | 0.09-0.2s | 3.87 | 0.03s | 377.9Hz | 0.2175 | 1171.5Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.319-0.369s | 0.09-0.2s | 3.29 | 0.06s | 160.2Hz | 0.2064 | 954.1Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.643.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.9229 | 0.1577 | 1940.4 | 1191.7 | 0.459-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.9185 | 0.1543 | 1931.2 | 1373.8 | 0.479-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `419.4Hz`; Aurora centroid delta vs reference = `428.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.270s`; centroid delta = `452.9Hz`.
- Spectral shape: band distance = `0.2813`; rolloff delta = `863.0Hz`.
- Envelope shape: attack position delta = `0.271`; decay ratio delta = `0.090`; burst-share delta = `0.218`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.11/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.559s | 0.08-0.269s | 5.11 | 0.289s | 458.4Hz | 0.2777 | 836.0Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.150-0.531s score 0.788.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 27
- Reference segments found: `37`
- Segment role comparisons: `35`
- Average worst segment risk: `4.97/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.204s`
- Average active Aurora-vs-reference duration delta: `0.194s`
- Average active Aurora-vs-reference centroid delta: `411.0Hz`
- Average active Aurora-vs-reference band-shape distance: `0.281`
- Average active Aurora-vs-reference envelope decay delta: `2.105`

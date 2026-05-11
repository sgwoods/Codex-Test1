# Aurora Audio Theme Comparison

- Generated from commit `2812d6d`
- Version: `1.3.0`
- Generated at: `2026-05-08T21:26:35.021Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8984 | 0.1320 | 1986.6 | 906.1 | 0.439-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9137 | 0.1263 | 1982.8 | 847.0 | 0.449-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `598.7Hz`; Aurora centroid delta vs reference = `602.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.011s`; centroid delta = `565.7Hz`.
- Spectral shape: band distance = `0.2548`; rolloff delta = `1001.6Hz`.
- Envelope shape: attack position delta = `0.148`; decay ratio delta = `1.406`; burst-share delta = `0.171`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.29/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.08-0.22s | 5.29 | 0.01s | 616.9Hz | 0.316 | 1069.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.221s score 0.430.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8954 | 0.1210 | 2022.3 | 1754.5 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1195 | 1976.9 | 1706.1 | 0.469-0.660s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.120s`; Aurora duration delta vs reference = `0.120s`.
- Quick read: synthetic Galaga centroid delta vs reference = `634.1Hz`; Aurora centroid delta vs reference = `679.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.199s`; centroid delta = `762.6Hz`.
- Spectral shape: band distance = `0.4191`; rolloff delta = `2184.2Hz`.
- Envelope shape: attack position delta = `0.771`; decay ratio delta = `2.330`; burst-share delta = `0.131`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `5.78/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.259-0.379s | 0.08-0.19s | 5.78 | 0.01s | 725.9Hz | 0.4101 | 2003.7Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.16s | 0.08-0.19s | 5.21 | 0.03s | 579.8Hz | 0.4021 | 1703.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.050-0.241s score 0.638; 0.250-0.441s score 0.591.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8990 | 0.1249 | 2000.3 | 843.9 | 0.449-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1192 | 1978.5 | 760.6 | 0.469-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `702.1Hz`; Aurora centroid delta vs reference = `723.9Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.001s`; centroid delta = `676.0Hz`.
- Spectral shape: band distance = `0.3066`; rolloff delta = `1248.7Hz`.
- Envelope shape: attack position delta = `0.077`; decay ratio delta = `1.993`; burst-share delta = `0.185`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.98/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.05-0.21s | 0.09-0.21s | 6.98 | 0.04s | 753.0Hz | 0.3377 | 1270.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.211s score 0.389.

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8860 | 0.1253 | 1957.7 | 759.1 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8907 | 0.1166 | 1993.0 | 860.6 | 0.469-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `127.8Hz`; Aurora centroid delta vs reference = `163.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.460s`; centroid delta = `162.7Hz`.
- Spectral shape: band distance = `0.0776`; rolloff delta = `89.8Hz`.
- Envelope shape: attack position delta = `0.080`; decay ratio delta = `7.172`; burst-share delta = `0.266`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.25/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.2s | 0.549-0.659s | 2.25 | 0.01s | 92.3Hz | 0.0492 | 27.5Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9195 | 0.1273 | 1948.4 | 719.7 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1150 | 1989.6 | 675.8 | 0.479-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `75.6Hz`; Aurora centroid delta vs reference = `116.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.019s`; centroid delta = `62.2Hz`.
- Spectral shape: band distance = `0.2114`; rolloff delta = `606.9Hz`.
- Envelope shape: attack position delta = `0.040`; decay ratio delta = `0.959`; burst-share delta = `0.105`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.0/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.22s | 0.09-0.2s | 2.0 | 0.04s | 116.9Hz | 0.2088 | 557.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.789.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8940 | 0.1119 | 2026.3 | 637.9 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8730 | 0.1167 | 1962.2 | 751.5 | 0.000-0.660s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `703.7Hz`; Aurora centroid delta vs reference = `767.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.059s`; centroid delta = `809.7Hz`.
- Spectral shape: band distance = `0.3372`; rolloff delta = `1793.1Hz`.
- Envelope shape: attack position delta = `0.700`; decay ratio delta = `3.293`; burst-share delta = `0.165`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.93/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.01-0.17s | 0.09-0.18s | 4.93 | 0.07s | 793.7Hz | 0.3451 | 1788.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.050-0.231s score 0.638.

## Boss Hit

- Cue: `bossHit`
- Focus: Compare whether boss damage reads as a distinct multi-hit event.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9174 | 0.1132 | 1944.1 | 766.7 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1088 | 1949.5 | 728.8 | 0.000-0.660s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.370s`; Aurora duration delta vs reference = `0.370s`.
- Quick read: synthetic Galaga centroid delta vs reference = `495.4Hz`; Aurora centroid delta vs reference = `490.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.440s`; centroid delta = `489.9Hz`.
- Spectral shape: band distance = `0.3629`; rolloff delta = `1407.4Hz`.
- Envelope shape: attack position delta = `0.927`; decay ratio delta = `12.685`; burst-share delta = `0.260`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.18/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.559-0.659s | 5.18 | 0.05s | 564.3Hz | 0.3761 | 1489.0Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8781 | 0.1238 | 1985.8 | 747.0 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9052 | 0.1584 | 1882.6 | 906.1 | 0.000-0.660s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `506.3Hz`; Aurora centroid delta vs reference = `609.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.039s`; centroid delta = `626.3Hz`.
- Spectral shape: band distance = `0.3410`; rolloff delta = `1495.3Hz`.
- Envelope shape: attack position delta = `0.827`; decay ratio delta = `2.518`; burst-share delta = `0.301`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.34/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.09-0.2s | 5.34 | 0.07s | 694.7Hz | 0.3449 | 1515.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.578.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8813 | 0.1596 | 1891.6 | 1021.2 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9137 | 0.1280 | 2022.1 | 847.0 | 0.449-0.660s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.383s`.
- Quick read: synthetic Galaga centroid delta vs reference = `281.4Hz`; Aurora centroid delta vs reference = `150.9Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.109s`; centroid delta = `189.2Hz`.
- Spectral shape: band distance = `0.2456`; rolloff delta = `1206.9Hz`.
- Envelope shape: attack position delta = `0.489`; decay ratio delta = `9.569`; burst-share delta = `0.245`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.82/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.688s | 0.449-0.639s | 4.82 | 0.419s | 268.9Hz | 0.229 | 1237.9Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 1.349-2.009s score 0.829; 0.500-1.160s score 0.778.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9052 | 0.1148 | 1950.4 | 1845.5 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9137 | 0.1206 | 1982.1 | 1130.3 | 0.469-0.660s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `185.9Hz`; Aurora centroid delta vs reference = `154.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.158s`; centroid delta = `195.7Hz`.
- Spectral shape: band distance = `0.2969`; rolloff delta = `1184.4Hz`.
- Envelope shape: attack position delta = `0.907`; decay ratio delta = `3.327`; burst-share delta = `0.344`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.52/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.259s | 0.08-0.18s | 4.52 | 0.159s | 318.6Hz | 0.2829 | 1233.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.200-0.381s score 0.679; 0.000-0.181s score 0.501.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9174 | 0.1132 | 1944.3 | 1218.2 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1192 | 1977.9 | 1127.3 | 0.469-0.660s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `886.1Hz`; Aurora centroid delta vs reference = `852.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.240s`; centroid delta = `852.5Hz`.
- Spectral shape: band distance = `0.6135`; rolloff delta = `2606.9Hz`.
- Envelope shape: attack position delta = `0.639`; decay ratio delta = `10.369`; burst-share delta = `0.133`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.32/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.559-0.659s | 6.32 | 0.08s | 968.3Hz | 0.6638 | 2722.5Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.259-0.389s | 0.559-0.659s | 6.16 | 0.03s | 859.4Hz | 0.6129 | 2683.2Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8813 | 0.1071 | 1975.8 | 804.5 | 0.359-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1116 | 1968.7 | 866.7 | 0.479-0.660s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `128.2Hz`; Aurora centroid delta vs reference = `135.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.098s`; centroid delta = `99.1Hz`.
- Spectral shape: band distance = `0.2545`; rolloff delta = `634.9Hz`.
- Envelope shape: attack position delta = `0.500`; decay ratio delta = `3.200`; burst-share delta = `0.002`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `4.29/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.09-0.259s | 0.21-0.299s | 4.29 | 0.08s | 326.1Hz | 0.2483 | 341.4Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.289-0.359s | 0.21-0.299s | 4.26 | 0.02s | 392.0Hz | 0.2532 | 322.2Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.06s | 0.21-0.299s | 3.8 | 0.03s | 79.8Hz | 0.2812 | 1223.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.301s score 0.652.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8801 | 0.1223 | 1989.7 | 772.7 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9208 | 0.1123 | 1971.0 | 642.4 | 0.000-0.660s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `737.8Hz`; Aurora centroid delta vs reference = `756.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.049s`; centroid delta = `801.5Hz`.
- Spectral shape: band distance = `0.4514`; rolloff delta = `2413.5Hz`.
- Envelope shape: attack position delta = `0.385`; decay ratio delta = `2.405`; burst-share delta = `0.223`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `7.08/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.08-0.19s | 7.08 | 0.08s | 994.6Hz | 0.4878 | 2520.3Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.620.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9222 | 0.1230 | 1961.0 | 1439.4 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9261 | 0.1234 | 1958.2 | 1275.8 | 0.469-0.660s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.300s`; Aurora duration delta vs reference = `0.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `441.7Hz`; Aurora centroid delta vs reference = `444.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.169s`; centroid delta = `482.7Hz`.
- Spectral shape: band distance = `0.2460`; rolloff delta = `1699.2Hz`.
- Envelope shape: attack position delta = `0.911`; decay ratio delta = `2.601`; burst-share delta = `0.156`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `6.61/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.319-0.359s | 0.08-0.19s | 6.61 | 0.07s | 570.1Hz | 0.3208 | 1902.6Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.12-0.18s | 0.08-0.19s | 5.84 | 0.05s | 470.6Hz | 0.2704 | 1259.2Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.09s | 0.08-0.19s | 5.63 | 0.04s | 511.2Hz | 0.2327 | 1533.2Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.22-0.279s | 0.08-0.19s | 4.89 | 0.05s | 285.0Hz | 0.193 | 675.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.241s score 0.675.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9126 | 0.1254 | 2011.0 | 824.2 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9035 | 0.1225 | 1963.5 | 803.0 | 0.469-0.660s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.383s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1001.4Hz`; Aurora centroid delta vs reference = `1048.9Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.767s`; centroid delta = `1049.7Hz`.
- Spectral shape: band distance = `0.4076`; rolloff delta = `2190.7Hz`.
- Envelope shape: attack position delta = `0.835`; decay ratio delta = `2.747`; burst-share delta = `0.177`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `7.99/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.459s | 0.09-0.2s | 7.99 | 0.269s | 1062.6Hz | 0.4159 | 2178.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
| body | 0.499-0.539s | 0.09-0.2s | 7.55 | 0.07s | 1072.0Hz | 0.4282 | 2253.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.433; 0.300-0.501s score 0.416; 0.600-0.801s score 0.374.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8734 | 0.1112 | 1961.6 | 2336.4 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9206 | 0.1200 | 1968.1 | 2018.2 | 0.469-0.660s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `360.8Hz`; Aurora centroid delta vs reference = `354.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.180s`; centroid delta = `354.3Hz`.
- Spectral shape: band distance = `0.2529`; rolloff delta = `1324.2Hz`.
- Envelope shape: attack position delta = `0.455`; decay ratio delta = `0.086`; burst-share delta = `0.326`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `5.08/10`; tail timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.239-0.469s | 0.559-0.659s | 5.08 | 0.13s | 537.8Hz | 0.2925 | 1906.4Hz | tail timing/duration differs enough to tune event pacing before timbre. |
| onset | 0.08-0.12s | 0.559-0.659s | 4.09 | 0.06s | 132.1Hz | 0.2743 | 1163.8Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8926 | 0.1208 | 1990.6 | 1560.6 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9147 | 0.1254 | 1989.0 | 1459.1 | 0.449-0.660s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `206.8Hz`; Aurora centroid delta vs reference = `208.4Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.229s`; centroid delta = `220.2Hz`.
- Spectral shape: band distance = `0.3196`; rolloff delta = `978.9Hz`.
- Envelope shape: attack position delta = `0.851`; decay ratio delta = `2.496`; burst-share delta = `0.209`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.5/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.419s | 0.08-0.19s | 6.5 | 0.309s | 300.7Hz | 0.3323 | 1104.1Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.000-0.191s score 0.665; 0.200-0.391s score 0.630.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9173 | 0.1192 | 1978.9 | 2639.4 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1193 | 1978.1 | 2709.1 | 0.469-0.660s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `62.0Hz`; Aurora centroid delta vs reference = `61.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `14.1Hz`.
- Spectral shape: band distance = `0.2685`; rolloff delta = `1551.1Hz`.
- Envelope shape: attack position delta = `1.000`; decay ratio delta = `3.069`; burst-share delta = `0.155`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.14/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.09-0.19s | 5.14 | 0.08s | 2.4Hz | 0.3033 | 1585.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.319-0.429s | 0.09-0.19s | 3.53 | 0.01s | 79.0Hz | 0.2808 | 1595.8Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.239-0.279s | 0.09-0.19s | 3.51 | 0.06s | 240.4Hz | 0.1875 | 1594.2Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.774; 0.200-0.391s score 0.690.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8989 | 0.0966 | 1942.3 | 2360.6 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1225 | 2044.2 | 2121.2 | 0.469-0.660s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `168.4Hz`; Aurora centroid delta vs reference = `66.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.180s`; centroid delta = `66.5Hz`.
- Spectral shape: band distance = `0.1895`; rolloff delta = `547.0Hz`.
- Envelope shape: attack position delta = `0.246`; decay ratio delta = `7.928`; burst-share delta = `0.122`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `4.88/10`; tail timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.329-0.479s | 0.389-0.659s | 4.88 | 0.119s | 181.6Hz | 0.2495 | 708.6Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.16-0.22s | 0.389-0.659s | 4.69 | 0.209s | 14.3Hz | 0.1705 | 214.8Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.13s | 0.389-0.659s | 3.85 | 0.139s | 6.5Hz | 0.3301 | 39.2Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8766 | 0.1142 | 1996.2 | 1615.2 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8730 | 0.1258 | 1977.6 | 1416.7 | 0.459-0.660s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `294.1Hz`; Aurora centroid delta vs reference = `312.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.189s`; centroid delta = `260.3Hz`.
- Spectral shape: band distance = `0.2072`; rolloff delta = `993.1Hz`.
- Envelope shape: attack position delta = `0.087`; decay ratio delta = `2.941`; burst-share delta = `0.136`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `3.5/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.06-0.2s | 0.08-0.18s | 3.5 | 0.04s | 332.7Hz | 0.2234 | 1140.3Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.319-0.369s | 0.08-0.18s | 2.8 | 0.05s | 115.0Hz | 0.2122 | 922.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.231s score 0.591.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.9180 | 0.1564 | 1951.8 | 1217.9 | 0.469-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.9058 | 0.1519 | 1915.9 | 1323.8 | 0.479-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `404.1Hz`; Aurora centroid delta vs reference = `440.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.280s`; centroid delta = `491.6Hz`.
- Spectral shape: band distance = `0.2827`; rolloff delta = `893.0Hz`.
- Envelope shape: attack position delta = `0.284`; decay ratio delta = `0.202`; burst-share delta = `0.206`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.04/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.559s | 0.08-0.269s | 5.04 | 0.289s | 466.1Hz | 0.2764 | 851.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.200-0.571s score 0.771.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 23
- Reference segments found: `37`
- Segment role comparisons: `35`
- Average worst segment risk: `5.21/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.189s`
- Average active Aurora-vs-reference duration delta: `0.198s`
- Average active Aurora-vs-reference centroid delta: `439.6Hz`
- Average active Aurora-vs-reference band-shape distance: `0.302`
- Average active Aurora-vs-reference envelope decay delta: `3.966`


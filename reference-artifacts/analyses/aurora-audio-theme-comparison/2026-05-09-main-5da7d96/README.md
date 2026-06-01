# Aurora Audio Theme Comparison

- Generated from commit `5da7d96`
- Version: `1.3.0`
- Generated at: `2026-05-09T00:44:33.119Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9144 | 0.1337 | 1951.8 | 803.0 | 0.439-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8734 | 0.1246 | 2048.1 | 863.6 | 0.459-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1513 | 0.0798 | 1384.1 | 366.7 | 0.000-0.210s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `664.0Hz`; Aurora centroid delta vs reference = `567.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.011s`; centroid delta = `523.9Hz`.
- Spectral shape: band distance = `0.2549`; rolloff delta = `956.4Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `1.281`; burst-share delta = `0.207`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.79/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.08-0.22s | 5.79 | 0.01s | 658.4Hz | 0.3161 | 1127.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.221s score 0.444.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9235 | 0.1274 | 2031.8 | 1824.2 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9136 | 0.1238 | 1986.8 | 1657.6 | 0.459-0.660s | n/a | n/a |
| Start | 0.540 | 0.6950 | 0.2592 | 1342.8 | 1870.4 | 0.150-0.540s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.120s`; Aurora duration delta vs reference = `0.120s`.
- Quick read: synthetic Galaga centroid delta vs reference = `644.0Hz`; Aurora centroid delta vs reference = `689.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.189s`; centroid delta = `722.7Hz`.
- Spectral shape: band distance = `0.4027`; rolloff delta = `2165.1Hz`.
- Envelope shape: attack position delta = `0.371`; decay ratio delta = `1.674`; burst-share delta = `0.137`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `5.27/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.16s | 0.08-0.2s | 5.27 | 0.02s | 521.1Hz | 0.385 | 1678.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.259-0.379s | 0.08-0.2s | 4.91 | 0.0s | 667.2Hz | 0.3847 | 1978.7Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.251s score 0.649; 0.300-0.501s score 0.610.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8057 | 0.1173 | 2009.1 | 950.0 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8734 | 0.1230 | 1999.6 | 897.0 | 0.459-0.660s | n/a | n/a |
| Ambience / Convoy | 0.240 | 0.1659 | 0.0811 | 1276.4 | 533.3 | 0.030-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `723.2Hz`; Aurora centroid delta vs reference = `732.7Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.450s`; centroid delta = `691.2Hz`.
- Spectral shape: band distance = `0.2703`; rolloff delta = `1251.1Hz`.
- Envelope shape: attack position delta = `0.024`; decay ratio delta = `0.271`; burst-share delta = `0.077`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.82/10`; onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.05-0.21s | 0.11-0.17s | 2.82 | 0.1s | 413.3Hz | 0.0589 | 1211.1Hz | onset reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |

## Player Shot

- Cue: `playerShot`
- Focus: Compare whether player fire reads as a quick arcade shot instead of a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9144 | 0.1274 | 2015.5 | 765.2 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9052 | 0.1269 | 1972.0 | 747.0 | 0.459-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.8867 | 0.2155 | 2120.8 | 2220.8 | 0.040-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `148.8Hz`; Aurora centroid delta vs reference = `105.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.001s`; centroid delta = `130.0Hz`.
- Spectral shape: band distance = `0.0441`; rolloff delta = `27.9Hz`.
- Envelope shape: attack position delta = `0.000`; decay ratio delta = `3.733`; burst-share delta = `0.000`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `1.9/10`; onset segment is comparatively close; keep it as a guardrail while other segments improve.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.2s | 0.08-0.2s | 1.9 | 0.0s | 97.7Hz | 0.0342 | 16.7Hz | onset segment is comparatively close; keep it as a guardrail while other segments improve. |
- Candidate reference subwindows: 0.000-0.201s score 0.811.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare whether enemy fire is distinct enough from player fire and boss damage.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8907 | 0.1184 | 2048.9 | 772.7 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1264 | 2029.9 | 801.5 | 0.459-0.660s | n/a | n/a |
| Flagship/Fighter Shot | 0.240 | 0.6478 | 0.2225 | 2065.2 | 2170.8 | 0.020-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `35.3Hz`; Aurora centroid delta vs reference = `16.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.029s`; centroid delta = `58.2Hz`.
- Spectral shape: band distance = `0.2417`; rolloff delta = `615.3Hz`.
- Envelope shape: attack position delta = `0.087`; decay ratio delta = `0.286`; burst-share delta = `0.060`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `2.27/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.07-0.22s | 0.09-0.19s | 2.27 | 0.05s | 77.3Hz | 0.2258 | 563.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.748.

## Enemy Hit

- Cue: `enemyHit`
- Focus: Compare whether an enemy impact gives immediate hit confirmation.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9136 | 0.1740 | 1749.6 | 1157.6 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9270 | 0.1235 | 1958.9 | 751.5 | 0.469-0.660s | n/a | n/a |
| Zako | 0.240 | 0.5128 | 0.2236 | 1258.5 | 1662.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `700.4Hz`; Aurora centroid delta vs reference = `491.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.420s`; centroid delta = `488.1Hz`.
- Spectral shape: band distance = `0.1942`; rolloff delta = `1508.7Hz`.
- Envelope shape: attack position delta = `0.676`; decay ratio delta = `0.451`; burst-share delta = `0.099`.
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
| Aurora Application Mix | 0.660 | 0.9052 | 0.1148 | 1949.6 | 715.2 | 0.479-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9174 | 0.1264 | 2029.2 | 840.9 | 0.459-0.660s | n/a | n/a |
| Boss Damage / Flagship Fighter Shot | 0.290 | 0.6245 | 0.1949 | 1454.1 | 1806.8 | 0.000-0.220s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.370s`; Aurora duration delta vs reference = `0.370s`.
- Quick read: synthetic Galaga centroid delta vs reference = `575.1Hz`; Aurora centroid delta vs reference = `495.5Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.039s`; centroid delta = `534.3Hz`.
- Spectral shape: band distance = `0.3686`; rolloff delta = `1517.2Hz`.
- Envelope shape: attack position delta = `0.955`; decay ratio delta = `3.675`; burst-share delta = `0.002`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.4/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.15s | 0.08-0.18s | 5.4 | 0.05s | 643.7Hz | 0.3656 | 1539.1Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.181s score 0.646.

## Enemy Boom

- Cue: `enemyBoom`
- Focus: Compare whether normal enemy destruction is more emphatic than a simple hit.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8930 | 0.1277 | 1965.5 | 781.8 | 0.449-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8906 | 0.1206 | 2069.2 | 781.8 | 0.469-0.660s | n/a | n/a |
| Zako | 0.240 | 0.7430 | 0.2634 | 1376.3 | 1575.0 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `692.9Hz`; Aurora centroid delta vs reference = `589.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.029s`; centroid delta = `608.3Hz`.
- Spectral shape: band distance = `0.3328`; rolloff delta = `1444.6Hz`.
- Envelope shape: attack position delta = `0.790`; decay ratio delta = `2.372`; burst-share delta = `0.246`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.22/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.02-0.2s | 0.09-0.21s | 5.22 | 0.06s | 646.5Hz | 0.3325 | 1491.4Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.211s score 0.605.

## Boss Boom

- Cue: `bossBoom`
- Focus: Compare whether boss destruction feels larger and more final than normal enemy destruction.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9137 | 0.1810 | 1964.4 | 1807.6 | 0.110-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9235 | 0.1257 | 1987.6 | 760.6 | 0.459-0.660s | n/a | n/a |
| Boss Death / Sasori | 2.043 | 0.7794 | 0.1571 | 1740.7 | 930.8 | 0.798-1.567s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.383s`.
- Quick read: synthetic Galaga centroid delta vs reference = `246.9Hz`; Aurora centroid delta vs reference = `223.7Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.219s`; centroid delta = `284.4Hz`.
- Spectral shape: band distance = `0.2311`; rolloff delta = `1266.1Hz`.
- Envelope shape: attack position delta = `0.026`; decay ratio delta = `0.286`; burst-share delta = `0.126`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.72/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.688s | 0.08-0.259s | 5.72 | 0.429s | 344.0Hz | 0.2569 | 1344.8Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 1.149-1.699s score 0.843; 0.550-1.100s score 0.583; 0.000-0.550s score 0.324.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8781 | 0.1238 | 1985.3 | 1883.3 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8907 | 0.1168 | 1989.1 | 1018.2 | 0.469-0.660s | n/a | n/a |
| Tractor Beam | 0.480 | 0.6609 | 0.2549 | 1796.2 | 1995.8 | 0.000-0.339s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `192.9Hz`; Aurora centroid delta vs reference = `189.1Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.138s`; centroid delta = `209.6Hz`.
- Spectral shape: band distance = `0.2644`; rolloff delta = `1215.3Hz`.
- Envelope shape: attack position delta = `0.912`; decay ratio delta = `2.731`; burst-share delta = `0.415`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `4.1/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.259s | 0.09-0.2s | 4.1 | 0.149s | 272.6Hz | 0.2598 | 1234.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.200-0.401s score 0.737.

## Capture Retreat

- Cue: `captureRetreat`
- Focus: Compare whether the post-capture retreat phase remains audible as a distinct state.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9173 | 0.2072 | 1667.1 | 1459.1 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8988 | 0.1229 | 1946.5 | 1115.2 | 0.469-0.660s | n/a | n/a |
| Capturing | 0.420 | 0.4716 | 0.2589 | 1091.8 | 1561.9 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `854.7Hz`; Aurora centroid delta vs reference = `575.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.240s`; centroid delta = `575.3Hz`.
- Spectral shape: band distance = `0.3929`; rolloff delta = `2390.2Hz`.
- Envelope shape: attack position delta = `0.688`; decay ratio delta = `0.201`; burst-share delta = `0.373`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `tail` risk `5.89/10`; tail timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.259-0.389s | 0.539-0.659s | 5.89 | 0.01s | 838.2Hz | 0.5669 | 2710.2Hz | tail timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| onset | 0.0-0.18s | 0.0-0.329s | 2.25 | 0.149s | 3.6Hz | 0.0377 | 26.4Hz | onset timing/duration differs enough to tune event pacing before timbre. |

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9002 | 0.1202 | 1997.5 | 909.1 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8818 | 0.1187 | 2051.0 | 919.7 | 0.469-0.660s | n/a | n/a |
| Fighter Captured | 0.420 | 0.6022 | 0.1533 | 1840.5 | 1957.1 | 0.000-0.399s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `210.5Hz`; Aurora centroid delta vs reference = `157.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.208s`; centroid delta = `125.5Hz`.
- Spectral shape: band distance = `0.2561`; rolloff delta = `563.4Hz`.
- Envelope shape: attack position delta = `0.413`; decay ratio delta = `2.630`; burst-share delta = `0.182`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `4.55/10`; body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.09-0.259s | 0.08-0.19s | 4.55 | 0.06s | 258.4Hz | 0.2482 | 337.1Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.289-0.359s | 0.08-0.19s | 4.38 | 0.04s | 324.3Hz | 0.2531 | 317.9Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.0-0.06s | 0.08-0.19s | 4.2 | 0.05s | 147.5Hz | 0.2812 | 1218.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.000-0.191s score 0.780; 0.200-0.391s score 0.711.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8990 | 0.1526 | 1832.0 | 1486.4 | 0.000-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1273 | 1964.4 | 827.3 | 0.449-0.660s | n/a | n/a |
| Captured Fighter Destroyed | 0.240 | 0.6635 | 0.2176 | 1233.2 | 2012.5 | 0.000-0.240s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.420s`; Aurora duration delta vs reference = `0.420s`.
- Quick read: synthetic Galaga centroid delta vs reference = `731.2Hz`; Aurora centroid delta vs reference = `598.8Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.420s`; centroid delta = `598.8Hz`.
- Spectral shape: band distance = `0.3538`; rolloff delta = `2222.3Hz`.
- Envelope shape: attack position delta = `0.709`; decay ratio delta = `0.222`; burst-share delta = `0.049`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `1.99/10`; onset segment is comparatively close; keep it as a guardrail while other segments improve.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.19s | 0.01-0.12s | 1.99 | 0.08s | 138.5Hz | 0.0327 | 134.0Hz | onset segment is comparatively close; keep it as a guardrail while other segments improve. |

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9174 | 0.1264 | 2030.5 | 1519.7 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9235 | 0.1273 | 2034.2 | 1357.6 | 0.459-0.660s | n/a | n/a |
| Fighter Rescued (Double Ship) | 0.360 | 0.3846 | 0.1016 | 1516.5 | 1816.7 | 0.000-0.360s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.300s`; Aurora duration delta vs reference = `0.300s`.
- Quick read: synthetic Galaga centroid delta vs reference = `517.7Hz`; Aurora centroid delta vs reference = `514.0Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.159s`; centroid delta = `482.0Hz`.
- Spectral shape: band distance = `0.2492`; rolloff delta = `1690.8Hz`.
- Envelope shape: attack position delta = `0.911`; decay ratio delta = `2.384`; burst-share delta = `0.201`.
- Reference segmentation: `segmented-reference` with `4` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `6.73/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.319-0.359s | 0.09-0.2s | 6.73 | 0.07s | 664.7Hz | 0.3186 | 1930.0Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| body | 0.12-0.18s | 0.09-0.2s | 5.42 | 0.05s | 565.2Hz | 0.2682 | 1286.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.02-0.09s | 0.09-0.2s | 5.37 | 0.04s | 605.8Hz | 0.2305 | 1560.6Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.22-0.279s | 0.09-0.2s | 4.79 | 0.05s | 379.6Hz | 0.1909 | 702.4Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.251s score 0.679.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.960 | 1.0000 | 0.2497 | 1602.5 | 1731.2 | 0.040-0.960s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8990 | 0.1268 | 1981.6 | 804.5 | 0.449-0.660s | n/a | n/a |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | 0.020-0.988s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `1.383s`; Aurora duration delta vs reference = `1.083s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1019.5Hz`; Aurora centroid delta vs reference = `640.4Hz`.
- Active-window status: `active-segment-detected`.
- Active quick read: Aurora vs reference duration delta = `0.048s`; centroid delta = `622.6Hz`.
- Spectral shape: band distance = `0.2263`; rolloff delta = `1565.2Hz`.
- Envelope shape: attack position delta = `0.548`; decay ratio delta = `0.652`; burst-share delta = `0.030`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `onset`.
- Worst segment role: `body` risk `6.58/10`; body timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| body | 0.499-0.539s | 0.509-0.698s | 6.58 | 0.15s | 890.3Hz | 0.3354 | 2064.8Hz | body timing/duration differs enough to tune event pacing before timbre. |
| onset | 0.08-0.459s | 0.05-0.289s | 1.36 | 0.139s | 29.6Hz | 0.0132 | 10.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.100-1.020s score 0.610; 1.050-1.970s score 0.502.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8907 | 0.1185 | 2048.6 | 2342.4 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9193 | 0.1120 | 1971.6 | 1869.7 | 0.479-0.660s | n/a | n/a |
| Challenging Stage | 0.480 | 0.9487 | 0.2017 | 1607.3 | 2085.4 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `364.3Hz`; Aurora centroid delta vs reference = `441.3Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `400.3Hz`.
- Spectral shape: band distance = `0.2513`; rolloff delta = `1460.3Hz`.
- Envelope shape: attack position delta = `0.380`; decay ratio delta = `5.495`; burst-share delta = `0.042`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `tail` risk `4.71/10`; tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| tail | 0.239-0.469s | 0.09-0.19s | 4.71 | 0.13s | 531.6Hz | 0.2981 | 1916.5Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| onset | 0.08-0.12s | 0.09-0.19s | 3.88 | 0.06s | 125.9Hz | 0.2541 | 1173.9Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
- Candidate reference subwindows: 0.200-0.391s score 0.687; 0.000-0.191s score 0.672.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9193 | 0.1249 | 2014.4 | 1587.9 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9173 | 0.1192 | 1978.9 | 1406.1 | 0.469-0.660s | n/a | n/a |
| Challenging Stage Results | 0.420 | 0.2891 | 0.0912 | 1782.2 | 2047.6 | 0.000-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `196.7Hz`; Aurora centroid delta vs reference = `232.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.229s`; centroid delta = `210.0Hz`.
- Spectral shape: band distance = `0.3135`; rolloff delta = `984.1Hz`.
- Envelope shape: attack position delta = `0.981`; decay ratio delta = `2.160`; burst-share delta = `0.209`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `6.98/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.419s | 0.08-0.19s | 6.98 | 0.309s | 283.2Hz | 0.3297 | 1094.9Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.100-0.291s score 0.668.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9174 | 0.1263 | 2031.9 | 2777.3 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9144 | 0.1259 | 1972.0 | 2813.6 | 0.459-0.660s | n/a | n/a |
| Challenging Stage Perfect | 0.480 | 0.4117 | 0.1421 | 2040.1 | 2256.2 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `68.1Hz`; Aurora centroid delta vs reference = `8.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.279s`; centroid delta = `41.6Hz`.
- Spectral shape: band distance = `0.2627`; rolloff delta = `1564.7Hz`.
- Envelope shape: attack position delta = `1.000`; decay ratio delta = `2.429`; burst-share delta = `0.200`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.12/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.18s | 0.09-0.2s | 5.12 | 0.07s | 31.9Hz | 0.2826 | 1564.8Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.239-0.279s | 0.09-0.2s | 3.44 | 0.07s | 206.1Hz | 0.1668 | 1574.0Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.319-0.429s | 0.09-0.2s | 3.41 | 0.0s | 44.7Hz | 0.2601 | 1575.6Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.756; 0.250-0.451s score 0.588.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.8813 | 0.1226 | 2039.4 | 2628.8 | 0.469-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.8926 | 0.1208 | 1990.8 | 2084.8 | 0.469-0.660s | n/a | n/a |
| Name Entry (1st) | 0.480 | 0.8306 | 0.2250 | 1875.8 | 2614.6 | 0.000-0.480s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.180s`; Aurora duration delta vs reference = `0.180s`.
- Quick read: synthetic Galaga centroid delta vs reference = `115.0Hz`; Aurora centroid delta vs reference = `163.6Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.289s`; centroid delta = `124.4Hz`.
- Spectral shape: band distance = `0.1620`; rolloff delta = `716.5Hz`.
- Envelope shape: attack position delta = `0.196`; decay ratio delta = `2.536`; burst-share delta = `0.187`.
- Reference segmentation: `segmented-reference` with `3` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `3.59/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.0-0.13s | 0.08-0.19s | 3.59 | 0.02s | 83.9Hz | 0.2719 | 220.4Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| body | 0.16-0.22s | 0.08-0.19s | 2.65 | 0.05s | 91.7Hz | 0.1047 | 33.6Hz | body reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
| tail | 0.329-0.479s | 0.08-0.19s | 2.6 | 0.04s | 259.0Hz | 0.1673 | 889.8Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.050-0.241s score 0.846; 0.250-0.441s score 0.640.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.660 | 0.9144 | 0.1274 | 2014.7 | 1722.7 | 0.459-0.660s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.660 | 0.9137 | 0.1262 | 1982.9 | 1419.7 | 0.449-0.660s | n/a | n/a |
| Name Entry (2nd-5th) | 0.420 | 0.9313 | 0.2595 | 1683.5 | 2771.4 | 0.050-0.420s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.240s`; Aurora duration delta vs reference = `0.240s`.
- Quick read: synthetic Galaga centroid delta vs reference = `299.4Hz`; Aurora centroid delta vs reference = `331.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.169s`; centroid delta = `219.9Hz`.
- Spectral shape: band distance = `0.1997`; rolloff delta = `996.4Hz`.
- Envelope shape: attack position delta = `0.007`; decay ratio delta = `1.593`; burst-share delta = `0.168`.
- Reference segmentation: `segmented-reference` with `2` segment(s); dominant role `tail`.
- Worst segment role: `onset` risk `3.59/10`; onset timbre is the leading gap: band shape/rolloff differ from the reference segment.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.06-0.2s | 0.08-0.2s | 3.59 | 0.02s | 330.1Hz | 0.2095 | 1164.0Hz | onset timbre is the leading gap: band shape/rolloff differ from the reference segment. |
| tail | 0.319-0.369s | 0.08-0.2s | 2.97 | 0.07s | 112.4Hz | 0.1984 | 946.6Hz | tail reference sub-event is not separated in runtime; the cue is collapsing multiple reference moments into one continuous segment. |
- Candidate reference subwindows: 0.000-0.201s score 0.658.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.9120 | 0.1554 | 1981.0 | 1166.7 | 0.469-0.840s | n/a | n/a |
| Galaga Original Reference (synthetic) | 0.840 | 0.9087 | 0.1555 | 1971.3 | 1276.2 | 0.479-0.840s | n/a | n/a |
| Last Ship Destroyed Ambience | 0.840 | 0.7676 | 0.2477 | 1511.8 | 1915.5 | 0.189-0.840s | n/a | n/a |

- Quick read: synthetic Galaga duration delta vs reference = `0.000s`; Aurora duration delta vs reference = `0.000s`.
- Quick read: synthetic Galaga centroid delta vs reference = `459.5Hz`; Aurora centroid delta vs reference = `469.2Hz`.
- Active-window status: `direct-cue-comparison`.
- Active quick read: Aurora vs reference duration delta = `0.280s`; centroid delta = `500.6Hz`.
- Spectral shape: band distance = `0.2817`; rolloff delta = `895.6Hz`.
- Envelope shape: attack position delta = `0.284`; decay ratio delta = `0.170`; burst-share delta = `0.227`.
- Reference segmentation: `single-reference-body` with `1` segment(s); dominant role `onset`.
- Worst segment role: `onset` risk `5.3/10`; onset timing/duration differs enough to tune event pacing before timbre.

| Segment role | Reference window | Aurora window | Risk /10 | Duration gap | Centroid gap | Band gap | Rolloff gap | Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| onset | 0.08-0.559s | 0.08-0.269s | 5.3 | 0.289s | 473.1Hz | 0.2813 | 846.5Hz | onset timing/duration differs enough to tune event pacing before timbre. |
- Candidate reference subwindows: 0.150-0.521s score 0.773.

## Summary

- Items: 21
- Broad reference windows needing tighter segmentation: 0
- Candidate reference subwindows found: 25
- Reference segments found: `37`
- Segment role comparisons: `35`
- Average worst segment risk: `4.55/10`
- Average active Aurora-vs-synthetic-Galaga duration delta: `0.144s`
- Average active Aurora-vs-reference duration delta: `0.197s`
- Average active Aurora-vs-reference centroid delta: `388.2Hz`
- Average active Aurora-vs-reference band-shape distance: `0.264`
- Average active Aurora-vs-reference envelope decay delta: `1.773`

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-theme-comparison/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-theme-comparison`

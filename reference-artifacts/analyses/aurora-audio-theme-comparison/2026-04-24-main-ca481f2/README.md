# Aurora Audio Theme Comparison

- Generated from commit `ca481f2`
- Version: `1.2.3`
- Generated at: `2026-04-24T18:29:06.388Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare autoplay cadence and whether the board feels mechanically alive enough once demo motion begins.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0091 | 0.0009 | 1159.2 | 153.8 | [demo-pulse-aurora-waveform.png](plots/demo-pulse-aurora-waveform.png) | [demo-pulse-aurora-spectrogram.png](plots/demo-pulse-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0084 | 0.0009 | 1160.0 | 157.7 | [demo-pulse-galaga-waveform.png](plots/demo-pulse-galaga-waveform.png) | [demo-pulse-galaga-spectrogram.png](plots/demo-pulse-galaga-spectrogram.png) |
| Ambience / Convoy | 8.034 | 0.2267 | 0.0848 | 1175.0 | 577.3 | [demo-pulse-reference-waveform.png](plots/demo-pulse-reference-waveform.png) | [demo-pulse-reference-spectrogram.png](plots/demo-pulse-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `7.254s`; Aurora duration delta vs reference = `7.254s`.
- Quick read: synthetic Galaga centroid delta vs reference = `15.0Hz`; Aurora centroid delta vs reference = `15.8Hz`.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether stage start feels like a clear arcade start/announcement instead of a generic cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0086 | 0.0009 | 1154.5 | 151.3 | [stage-start-aurora-waveform.png](plots/stage-start-aurora-waveform.png) | [stage-start-aurora-spectrogram.png](plots/stage-start-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0093 | 0.0009 | 1159.1 | 144.9 | [stage-start-galaga-waveform.png](plots/stage-start-galaga-waveform.png) | [stage-start-galaga-spectrogram.png](plots/stage-start-galaga-spectrogram.png) |
| Start | 7.012 | 0.8508 | 0.2606 | 1392.3 | 2234.5 | [stage-start-reference-waveform.png](plots/stage-start-reference-waveform.png) | [stage-start-reference-spectrogram.png](plots/stage-start-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `6.232s`; Aurora duration delta vs reference = `6.232s`.
- Quick read: synthetic Galaga centroid delta vs reference = `233.2Hz`; Aurora centroid delta vs reference = `237.8Hz`.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing formation cadence and whether gameplay feels like it has enough marching pressure.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0087 | 0.0009 | 1152.3 | 150.0 | [formation-pulse-aurora-waveform.png](plots/formation-pulse-aurora-waveform.png) | [formation-pulse-aurora-spectrogram.png](plots/formation-pulse-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0087 | 0.0009 | 1160.6 | 143.6 | [formation-pulse-galaga-waveform.png](plots/formation-pulse-galaga-waveform.png) | [formation-pulse-galaga-spectrogram.png](plots/formation-pulse-galaga-spectrogram.png) |
| Ambience / Convoy | 8.034 | 0.2267 | 0.0848 | 1175.0 | 577.3 | [formation-pulse-reference-waveform.png](plots/formation-pulse-reference-waveform.png) | [formation-pulse-reference-spectrogram.png](plots/formation-pulse-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `7.254s`; Aurora duration delta vs reference = `7.254s`.
- Quick read: synthetic Galaga centroid delta vs reference = `14.4Hz`; Aurora centroid delta vs reference = `22.7Hz`.

## Capture Beam

- Cue: `captureBeam`
- Focus: Compare whether the beam deploy moment reads clearly as tractor-beam danger.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0094 | 0.0009 | 1149.2 | 141.0 | [capture-beam-aurora-waveform.png](plots/capture-beam-aurora-waveform.png) | [capture-beam-aurora-spectrogram.png](plots/capture-beam-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0086 | 0.0009 | 1162.9 | 147.4 | [capture-beam-galaga-waveform.png](plots/capture-beam-galaga-waveform.png) | [capture-beam-galaga-spectrogram.png](plots/capture-beam-galaga-spectrogram.png) |
| Tractor Beam | 4.040 | 0.8581 | 0.3136 | 1829.9 | 2144.4 | [capture-beam-reference-waveform.png](plots/capture-beam-reference-waveform.png) | [capture-beam-reference-spectrogram.png](plots/capture-beam-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `3.260s`; Aurora duration delta vs reference = `3.260s`.
- Quick read: synthetic Galaga centroid delta vs reference = `667.0Hz`; Aurora centroid delta vs reference = `680.7Hz`.

## Fighter Captured

- Cue: `captureSuccess`
- Focus: Compare the exact moment the fighter is fully captured, distinct from beam deploy and retreat.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0065 | 0.0005 | 1319.1 | 153.8 | [fighter-captured-aurora-waveform.png](plots/fighter-captured-aurora-waveform.png) | [fighter-captured-aurora-spectrogram.png](plots/fighter-captured-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0087 | 0.0009 | 1161.1 | 137.2 | [fighter-captured-galaga-waveform.png](plots/fighter-captured-galaga-waveform.png) | [fighter-captured-galaga-spectrogram.png](plots/fighter-captured-galaga-spectrogram.png) |
| Fighter Captured | 6.037 | 0.6662 | 0.1487 | 1966.8 | 1901.7 | [fighter-captured-reference-waveform.png](plots/fighter-captured-reference-waveform.png) | [fighter-captured-reference-spectrogram.png](plots/fighter-captured-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `5.257s`; Aurora duration delta vs reference = `5.257s`.
- Quick read: synthetic Galaga centroid delta vs reference = `805.7Hz`; Aurora centroid delta vs reference = `647.7Hz`.

## Captured Fighter Destroyed

- Cue: `capturedFighterDestroyed`
- Focus: Compare the regret/penalty moment when the carried fighter is destroyed.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0067 | 0.0006 | 1318.5 | 148.7 | [captured-fighter-destroyed-aurora-waveform.png](plots/captured-fighter-destroyed-aurora-waveform.png) | [captured-fighter-destroyed-aurora-spectrogram.png](plots/captured-fighter-destroyed-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 1918.4 | 48.7 | [captured-fighter-destroyed-galaga-waveform.png](plots/captured-fighter-destroyed-galaga-waveform.png) | [captured-fighter-destroyed-galaga-spectrogram.png](plots/captured-fighter-destroyed-galaga-spectrogram.png) |
| Captured Fighter Destroyed | 3.019 | 0.8836 | 0.1949 | 1393.9 | 2037.7 | [captured-fighter-destroyed-reference-waveform.png](plots/captured-fighter-destroyed-reference-waveform.png) | [captured-fighter-destroyed-reference-spectrogram.png](plots/captured-fighter-destroyed-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `2.239s`; Aurora duration delta vs reference = `2.239s`.
- Quick read: synthetic Galaga centroid delta vs reference = `524.5Hz`; Aurora centroid delta vs reference = `75.4Hz`.

## Rescue Join

- Cue: `rescueJoin`
- Focus: Compare whether the rescue/join moment feels celebratory and distinct from ordinary scoring.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0007 | 0.0002 | 1805.2 | 57.7 | [rescue-join-aurora-waveform.png](plots/rescue-join-aurora-waveform.png) | [rescue-join-aurora-spectrogram.png](plots/rescue-join-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0084 | 0.0009 | 1161.5 | 184.6 | [rescue-join-galaga-waveform.png](plots/rescue-join-galaga-waveform.png) | [rescue-join-galaga-spectrogram.png](plots/rescue-join-galaga-spectrogram.png) |
| Fighter Rescued (Double Ship) | 4.040 | 0.4290 | 0.0979 | 1532.1 | 1374.4 | [rescue-join-reference-waveform.png](plots/rescue-join-reference-waveform.png) | [rescue-join-reference-spectrogram.png](plots/rescue-join-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `3.260s`; Aurora duration delta vs reference = `3.260s`.
- Quick read: synthetic Galaga centroid delta vs reference = `370.6Hz`; Aurora centroid delta vs reference = `273.1Hz`.

## Ship Loss

- Cue: `playerHit`
- Focus: Compare whether ship loss feels like a real Galaga death moment rather than a generic impact.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0087 | 0.0009 | 1157.9 | 142.3 | [ship-loss-aurora-waveform.png](plots/ship-loss-aurora-waveform.png) | [ship-loss-aurora-spectrogram.png](plots/ship-loss-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 1897.8 | 47.4 | [ship-loss-galaga-waveform.png](plots/ship-loss-galaga-waveform.png) | [ship-loss-galaga-spectrogram.png](plots/ship-loss-galaga-spectrogram.png) |
| Death | 2.043 | 0.9449 | 0.1443 | 962.1 | 1201.9 | [ship-loss-reference-waveform.png](plots/ship-loss-reference-waveform.png) | [ship-loss-reference-spectrogram.png](plots/ship-loss-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `1.263s`; Aurora duration delta vs reference = `1.263s`.
- Quick read: synthetic Galaga centroid delta vs reference = `935.7Hz`; Aurora centroid delta vs reference = `195.8Hz`.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how distinct and ceremonial the challenge-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0017 | 0.0003 | 1587.0 | 105.1 | [challenge-transition-aurora-waveform.png](plots/challenge-transition-aurora-waveform.png) | [challenge-transition-aurora-spectrogram.png](plots/challenge-transition-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 2006.4 | 44.9 | [challenge-transition-galaga-waveform.png](plots/challenge-transition-galaga-waveform.png) | [challenge-transition-galaga-spectrogram.png](plots/challenge-transition-galaga-spectrogram.png) |
| Challenging Stage | 3.019 | 0.9491 | 0.1601 | 1474.2 | 1296.0 | [challenge-transition-reference-waveform.png](plots/challenge-transition-reference-waveform.png) | [challenge-transition-reference-spectrogram.png](plots/challenge-transition-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `2.239s`; Aurora duration delta vs reference = `2.239s`.
- Quick read: synthetic Galaga centroid delta vs reference = `532.2Hz`; Aurora centroid delta vs reference = `112.8Hz`.

## Challenge Results

- Cue: `challengeResults`
- Focus: Compare whether challenge wrap-up feels like a proper result phrase instead of a generic transition.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0086 | 0.0009 | 1161.7 | 139.7 | [challenge-results-aurora-waveform.png](plots/challenge-results-aurora-waveform.png) | [challenge-results-aurora-spectrogram.png](plots/challenge-results-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 1902.7 | 48.7 | [challenge-results-galaga-waveform.png](plots/challenge-results-galaga-waveform.png) | [challenge-results-galaga-spectrogram.png](plots/challenge-results-galaga-spectrogram.png) |
| Challenging Stage Results | 4.040 | 0.2975 | 0.0868 | 1900.3 | 2277.3 | [challenge-results-reference-waveform.png](plots/challenge-results-reference-waveform.png) | [challenge-results-reference-spectrogram.png](plots/challenge-results-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `3.260s`; Aurora duration delta vs reference = `3.260s`.
- Quick read: synthetic Galaga centroid delta vs reference = `2.4Hz`; Aurora centroid delta vs reference = `738.6Hz`.

## Challenge Perfect

- Cue: `challengePerfect`
- Focus: Compare whether a perfect challenge result feels more celebratory than the standard results cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0037 | 0.0004 | 1341.2 | 141.0 | [challenge-perfect-aurora-waveform.png](plots/challenge-perfect-aurora-waveform.png) | [challenge-perfect-aurora-spectrogram.png](plots/challenge-perfect-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0091 | 0.0009 | 1158.1 | 148.7 | [challenge-perfect-galaga-waveform.png](plots/challenge-perfect-galaga-waveform.png) | [challenge-perfect-galaga-spectrogram.png](plots/challenge-perfect-galaga-spectrogram.png) |
| Challenging Stage Perfect | 4.040 | 0.4380 | 0.1263 | 2423.0 | 2978.8 | [challenge-perfect-reference-waveform.png](plots/challenge-perfect-reference-waveform.png) | [challenge-perfect-reference-spectrogram.png](plots/challenge-perfect-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `3.260s`; Aurora duration delta vs reference = `3.260s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1264.9Hz`; Aurora centroid delta vs reference = `1081.8Hz`.

## High Score 1st

- Cue: `highScoreFirst`
- Focus: Compare whether first place entry feels distinct and more important than a lower board placement.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0004 | 0.0002 | 1938.4 | 47.4 | [high-score-1st-aurora-waveform.png](plots/high-score-1st-aurora-waveform.png) | [high-score-1st-aurora-spectrogram.png](plots/high-score-1st-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0086 | 0.0009 | 1157.7 | 153.8 | [high-score-1st-galaga-waveform.png](plots/high-score-1st-galaga-waveform.png) | [high-score-1st-galaga-spectrogram.png](plots/high-score-1st-galaga-spectrogram.png) |
| Name Entry (1st) | 8.034 | 0.9478 | 0.1954 | 1766.9 | 2077.4 | [high-score-1st-reference-waveform.png](plots/high-score-1st-reference-waveform.png) | [high-score-1st-reference-spectrogram.png](plots/high-score-1st-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `7.254s`; Aurora duration delta vs reference = `7.254s`.
- Quick read: synthetic Galaga centroid delta vs reference = `609.2Hz`; Aurora centroid delta vs reference = `171.5Hz`.

## High Score 2nd-10th

- Cue: `highScoreOther`
- Focus: Compare whether non-first leaderboard entry feels positive but smaller than first place.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0004 | 0.0002 | 2116.6 | 44.9 | [high-score-2nd-10th-aurora-waveform.png](plots/high-score-2nd-10th-aurora-waveform.png) | [high-score-2nd-10th-aurora-spectrogram.png](plots/high-score-2nd-10th-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0092 | 0.0009 | 1163.2 | 152.6 | [high-score-2nd-10th-galaga-waveform.png](plots/high-score-2nd-10th-galaga-waveform.png) | [high-score-2nd-10th-galaga-spectrogram.png](plots/high-score-2nd-10th-galaga-spectrogram.png) |
| Name Entry (2nd-5th) | 15.000 | 1.0000 | 0.2555 | 1707.1 | 2641.1 | [high-score-2nd-10th-reference-waveform.png](plots/high-score-2nd-10th-reference-waveform.png) | [high-score-2nd-10th-reference-spectrogram.png](plots/high-score-2nd-10th-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `14.220s`; Aurora duration delta vs reference = `14.220s`.
- Quick read: synthetic Galaga centroid delta vs reference = `543.9Hz`; Aurora centroid delta vs reference = `409.5Hz`.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final and emotionally complete enough.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.0041 | 0.0004 | 1707.3 | 132.1 | [game-over-aurora-waveform.png](plots/game-over-aurora-waveform.png) | [game-over-aurora-spectrogram.png](plots/game-over-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.840 | 0.0006 | 0.0002 | 1430.7 | 56.0 | [game-over-galaga-waveform.png](plots/game-over-galaga-waveform.png) | [game-over-galaga-spectrogram.png](plots/game-over-galaga-spectrogram.png) |
| Last Ship Destroyed Ambience | 14.002 | 0.7676 | 0.1931 | 1455.1 | 840.5 | [game-over-reference-waveform.png](plots/game-over-reference-waveform.png) | [game-over-reference-spectrogram.png](plots/game-over-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `13.162s`; Aurora duration delta vs reference = `13.162s`.
- Quick read: synthetic Galaga centroid delta vs reference = `24.4Hz`; Aurora centroid delta vs reference = `252.2Hz`.


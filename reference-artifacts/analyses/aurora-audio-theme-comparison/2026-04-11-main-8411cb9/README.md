# Aurora Audio Theme Comparison

- Generated from commit `8411cb9`
- Version: `1.2.3`
- Generated at: `2026-04-11T01:04:04.554Z`

This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.

Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.

## Demo Pulse

- Cue: `attractPulse`
- Focus: Compare how autoplay cadence and board motion feel under Aurora versus Galaga-reference audio.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0089 | 0.0009 | 1147.0 | 148.7 | [demo-pulse-aurora-waveform.png](plots/demo-pulse-aurora-waveform.png) | [demo-pulse-aurora-spectrogram.png](plots/demo-pulse-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 1880.2 | 50.0 | [demo-pulse-galaga-waveform.png](plots/demo-pulse-galaga-waveform.png) | [demo-pulse-galaga-spectrogram.png](plots/demo-pulse-galaga-spectrogram.png) |
| Opening Theme | 4.017 | 0.9498 | 0.2802 | 1325.7 | 2229.0 | [demo-pulse-reference-waveform.png](plots/demo-pulse-reference-waveform.png) | [demo-pulse-reference-spectrogram.png](plots/demo-pulse-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `3.237s`; Aurora duration delta vs reference = `3.237s`.
- Quick read: synthetic Galaga centroid delta vs reference = `554.5Hz`; Aurora centroid delta vs reference = `178.7Hz`.

## Stage Start

- Cue: `gameStart`
- Focus: Compare whether the opening announcement feels like an exciting arcade start or just a functional cue.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0090 | 0.0009 | 1187.6 | 150.0 | [stage-start-aurora-waveform.png](plots/stage-start-aurora-waveform.png) | [stage-start-aurora-spectrogram.png](plots/stage-start-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 1914.2 | 48.7 | [stage-start-galaga-waveform.png](plots/stage-start-galaga-waveform.png) | [stage-start-galaga-spectrogram.png](plots/stage-start-galaga-spectrogram.png) |
| Level Flag V1 | 4.017 | 0.9630 | 0.1574 | 1646.1 | 1039.6 | [stage-start-reference-waveform.png](plots/stage-start-reference-waveform.png) | [stage-start-reference-spectrogram.png](plots/stage-start-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `3.237s`; Aurora duration delta vs reference = `3.237s`.
- Quick read: synthetic Galaga centroid delta vs reference = `268.1Hz`; Aurora centroid delta vs reference = `458.5Hz`.

## Formation Pulse

- Cue: `stagePulse`
- Focus: Compare ongoing board pressure, march feel, and whether the cue feels musical enough during live play.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0004 | 0.0002 | 1905.3 | 48.7 | [formation-pulse-aurora-waveform.png](plots/formation-pulse-aurora-waveform.png) | [formation-pulse-aurora-spectrogram.png](plots/formation-pulse-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0091 | 0.0009 | 1159.0 | 147.4 | [formation-pulse-galaga-waveform.png](plots/formation-pulse-galaga-waveform.png) | [formation-pulse-galaga-spectrogram.png](plots/formation-pulse-galaga-spectrogram.png) |
| Sample Gameplay | 9.009 | 0.4738 | 0.0945 | 2595.6 | 3925.6 | [formation-pulse-reference-waveform.png](plots/formation-pulse-reference-waveform.png) | [formation-pulse-reference-spectrogram.png](plots/formation-pulse-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `8.229s`; Aurora duration delta vs reference = `8.229s`.
- Quick read: synthetic Galaga centroid delta vs reference = `1436.6Hz`; Aurora centroid delta vs reference = `690.3Hz`.

## Player Shot

- Cue: `playerShot`
- Focus: Compare shot energy and how clearly the player weapon reads in the mix.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0004 | 0.0002 | 1903.3 | 48.7 | [player-shot-aurora-waveform.png](plots/player-shot-aurora-waveform.png) | [player-shot-aurora-spectrogram.png](plots/player-shot-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 1913.6 | 47.4 | [player-shot-galaga-waveform.png](plots/player-shot-galaga-waveform.png) | [player-shot-galaga-spectrogram.png](plots/player-shot-galaga-spectrogram.png) |
| Sample Gameplay | 9.009 | 0.4738 | 0.0945 | 2595.6 | 3925.6 | [player-shot-reference-waveform.png](plots/player-shot-reference-waveform.png) | [player-shot-reference-spectrogram.png](plots/player-shot-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `8.229s`; Aurora duration delta vs reference = `8.229s`.
- Quick read: synthetic Galaga centroid delta vs reference = `682.0Hz`; Aurora centroid delta vs reference = `692.3Hz`.

## Enemy Shot

- Cue: `enemyShot`
- Focus: Compare threat clarity and whether the enemy projectile cue has enough arcade bite.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0007 | 0.0002 | 1764.9 | 75.6 | [enemy-shot-aurora-waveform.png](plots/enemy-shot-aurora-waveform.png) | [enemy-shot-aurora-spectrogram.png](plots/enemy-shot-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 2064.4 | 46.2 | [enemy-shot-galaga-waveform.png](plots/enemy-shot-galaga-waveform.png) | [enemy-shot-galaga-spectrogram.png](plots/enemy-shot-galaga-spectrogram.png) |
| Sample Gameplay | 9.009 | 0.4738 | 0.0945 | 2595.6 | 3925.6 | [enemy-shot-reference-waveform.png](plots/enemy-shot-reference-waveform.png) | [enemy-shot-reference-spectrogram.png](plots/enemy-shot-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `8.229s`; Aurora duration delta vs reference = `8.229s`.
- Quick read: synthetic Galaga centroid delta vs reference = `531.2Hz`; Aurora centroid delta vs reference = `830.7Hz`.

## Challenge Transition

- Cue: `challengeTransition`
- Focus: Compare how ceremonial and distinct the bonus-stage announcement feels.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.780 | 0.0089 | 0.0009 | 1152.0 | 150.0 | [challenge-transition-aurora-waveform.png](plots/challenge-transition-aurora-waveform.png) | [challenge-transition-aurora-spectrogram.png](plots/challenge-transition-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.780 | 0.0004 | 0.0002 | 2008.5 | 47.4 | [challenge-transition-galaga-waveform.png](plots/challenge-transition-galaga-waveform.png) | [challenge-transition-galaga-spectrogram.png](plots/challenge-transition-galaga-spectrogram.png) |
| Bonus Stage Results | 9.009 | 0.6517 | 0.1550 | 1676.0 | 3072.1 | [challenge-transition-reference-waveform.png](plots/challenge-transition-reference-waveform.png) | [challenge-transition-reference-spectrogram.png](plots/challenge-transition-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `8.229s`; Aurora duration delta vs reference = `8.229s`.
- Quick read: synthetic Galaga centroid delta vs reference = `332.5Hz`; Aurora centroid delta vs reference = `524.0Hz`.

## Game Over

- Cue: `gameOver`
- Focus: Compare whether the ending cue feels final, readable, and emotionally complete.

| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Aurora Application Mix | 0.840 | 0.0004 | 0.0002 | 1647.0 | 48.8 | [game-over-aurora-waveform.png](plots/game-over-aurora-waveform.png) | [game-over-aurora-spectrogram.png](plots/game-over-aurora-spectrogram.png) |
| Galaga Original Reference (synthetic) | 0.840 | 0.0091 | 0.0009 | 1168.4 | 147.6 | [game-over-galaga-waveform.png](plots/game-over-galaga-waveform.png) | [game-over-galaga-spectrogram.png](plots/game-over-galaga-spectrogram.png) |
| Last Ship Destroyed Ambience | 14.002 | 0.7676 | 0.1931 | 1455.1 | 840.5 | [game-over-reference-waveform.png](plots/game-over-reference-waveform.png) | [game-over-reference-spectrogram.png](plots/game-over-reference-spectrogram.png) |

- Quick read: synthetic Galaga duration delta vs reference = `13.162s`; Aurora duration delta vs reference = `13.162s`.
- Quick read: synthetic Galaga centroid delta vs reference = `286.7Hz`; Aurora centroid delta vs reference = `191.9Hz`.


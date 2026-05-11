# Aurora Formation Pulse Audio Candidate Analysis

Generated: 2026-05-08T22:40:35.466Z
Commit: 63f90a0 (dirty)

## Problem

Formation Pulse has the highest segment-level onset risk: the current classic pulse is a bright synthetic stab while the Galaga cadence reference has more low-frequency body and softer attack.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s660-d240-v105`
- Measured best: `refclip-s660-d240-v105`
- Reason: Formation Pulse candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Formation Pulse reference 0.66s/0.24s v1.05 | 2.33 | onset 2.39 | 0.139s | 91.3Hz | 0.0975 | clears keeper gates |
| Formation Pulse reference 0.6s/0.3s v1.05 | 3.44 | onset 2.66 | 0.45s | 558.9Hz | 0.2389 | duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.24s v1.05 | 3.54 | onset 2.56 | 0.45s | 589.6Hz | 0.2555 | duration gap improved only 0s |
| Formation Pulse reference 0.54s/0.24s v0.95 | 3.58 | onset 2.53 | 0.45s | 662.7Hz | 0.2509 | duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.24s v0.74 | 3.59 | onset 7.05 | 0.45s | 623.1Hz | 0.2655 | segment risk improved only -1.7; duration gap improved only 0s |
| Convoy current guide window | 3.62 | onset 7.13 | 0.45s | 679.5Hz | 0.256 | segment risk improved only -1.78; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.24s v0.86 | 3.62 | onset 7.13 | 0.45s | 679.5Hz | 0.256 | segment risk improved only -1.78; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.24s v0.95 | 3.65 | onset 7.12 | 0.45s | 620.3Hz | 0.262 | segment risk improved only -1.77; duration gap improved only 0s |
| Formation Pulse reference 0.54s/0.24s v1.05 | 3.68 | onset 7.12 | 0.45s | 614.3Hz | 0.2584 | segment risk improved only -1.77; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.2s v0.62 | 3.89 | onset 7.2 | 0.45s | 686.1Hz | 0.2893 | segment risk improved only -1.85; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.2s v0.86 | 4.14 | onset 7.07 | 0.45s | 641.5Hz | 0.3112 | whole-cue risk improved only 0.13; segment risk improved only -1.72; duration gap improved only 0s |
| Current Aurora baseline | 4.27 | onset 5.35 | 0.45s | 633.4Hz | 0.2707 | baseline |
| Low soft march | 4.37 | onset 6.29 | 0.45s | 644.9Hz | 0.2695 | whole-cue risk improved only -0.1; segment risk improved only -0.94; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.3s v0.95 | 4.76 | onset 6.88 | 0.139s | 663.4Hz | 0.349 | whole-cue risk improved only -0.49; segment risk improved only -1.53; band shape worsened by 0.0783 |
| Formation Pulse reference 0.6s/0.24s v0.62 | 4.9 | onset 6.58 | 0.039s | 795.2Hz | 0.3336 | whole-cue risk improved only -0.63; segment risk improved only -1.23; band shape worsened by 0.0629; centroid worsened by 161.8 Hz |
| Formation Pulse reference 0.54s/0.24s v0.74 | 4.95 | onset 6.96 | 0.131s | 723.9Hz | 0.3788 | whole-cue risk improved only -0.68; segment risk improved only -1.61; band shape worsened by 0.1081 |
| Formation Pulse reference 0.54s/0.24s v0.62 | 5.03 | onset 6.49 | 0.029s | 807.6Hz | 0.3286 | whole-cue risk improved only -0.76; segment risk improved only -1.14; centroid worsened by 174.2 Hz |
| Formation Pulse reference 0.6s/0.3s v0.74 | 5.06 | onset 7.24 | 0.019s | 824.8Hz | 0.3403 | whole-cue risk improved only -0.79; segment risk improved only -1.89; band shape worsened by 0.0696; centroid worsened by 191.4 Hz |
| Formation Pulse reference 0.66s/0.24s v0.95 | 5.07 | onset 6.8 | 0.081s | 728.6Hz | 0.3776 | whole-cue risk improved only -0.8; segment risk improved only -1.45; band shape worsened by 0.1069 |
| Formation Pulse reference 0.54s/0.24s v0.86 | 5.09 | onset 6.72 | 0.45s | 615.1Hz | 0.3054 | whole-cue risk improved only -0.82; segment risk improved only -1.37; duration gap improved only 0s |
| Formation Pulse reference 0.66s/0.24s v0.74 | 5.12 | onset 6.71 | 0.45s | 642.6Hz | 0.3164 | whole-cue risk improved only -0.85; segment risk improved only -1.36; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.2s v0.74 | 5.14 | onset 7.22 | 0.029s | 810.2Hz | 0.3351 | whole-cue risk improved only -0.87; segment risk improved only -1.87; band shape worsened by 0.0644; centroid worsened by 176.8 Hz |
| Formation Pulse reference 0.66s/0.24s v0.86 | 5.15 | onset 7.25 | 0.029s | 823.8Hz | 0.3367 | whole-cue risk improved only -0.88; segment risk improved only -1.9; band shape worsened by 0.066; centroid worsened by 190.4 Hz |
| Formation Pulse reference 0.6s/0.2s v0.95 | 5.17 | onset 6.69 | 0.45s | 635.2Hz | 0.3111 | whole-cue risk improved only -0.9; segment risk improved only -1.34; duration gap improved only 0s |

## Next Step

Promote refclip-s660-d240-v105 for Formation Pulse, then rerun the full audio comparison and event-gap rollup.

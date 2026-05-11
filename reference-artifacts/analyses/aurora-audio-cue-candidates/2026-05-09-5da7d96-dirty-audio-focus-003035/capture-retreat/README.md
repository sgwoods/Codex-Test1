# Aurora Capture Retreat Audio Candidate Analysis

Generated: 2026-05-09T00:30:35.802Z
Commit: 5da7d96 (dirty)

## Problem

Capture Retreat is the highest whole-cue audio gap: Aurora has the right semantic state, but the measured cue is too spectrally distant from the Capturing reference and its onset reads like a generic synthetic climb.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s2620-d420-v116`
- Measured best: `refclip-s2620-d420-v116`
- Reason: Capture Retreat candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Capture Retreat reference 2.62s/0.42s v1.16 | 1.01 | onset 1.56 | 0.021s | 40.4Hz | 0.0306 | clears keeper gates |
| Capture Retreat reference 2.46s/0.42s v0.95 | 4.49 | tail 6.06 | 0.24s | 663.4Hz | 0.4095 | segment risk improved only -0.16; duration gap improved only 0s |
| Capture Retreat reference 2.46s/0.5s v1.16 | 4.71 | tail 5.91 | 0.24s | 520Hz | 0.3672 | segment risk improved only -0.01; duration gap improved only 0s |
| Capture Retreat reference 2.62s/0.36s v0.86 | 4.73 | tail 5.47 | 0.24s | 705.5Hz | 0.4274 | duration gap improved only 0s; centroid worsened by 128.3 Hz; fewer exact segment-role matches than baseline |
| Capture Retreat reference 2.549s/0.3s v0.95 | 4.74 | tail 6.1 | 0.24s | 704.3Hz | 0.4303 | segment risk improved only -0.2; duration gap improved only 0s; centroid worsened by 127.1 Hz |
| Capture Retreat reference 2.46s/0.5s v1.05 | 4.87 | tail 5.7 | 0.23s | 540.1Hz | 0.3771 | segment risk improved only 0.2; duration gap improved only 0.01s |
| Capture Retreat reference 2.46s/0.5s v0.95 | 4.9 | tail 5.87 | 0.23s | 561.7Hz | 0.3828 | segment risk improved only 0.03; duration gap improved only 0.01s |
| Capture Retreat reference 2.62s/0.42s v1.05 | 4.91 | tail 5.33 | 0.24s | 640.7Hz | 0.3875 | duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.42s v1.05 | 4.91 | tail 6.15 | 0.24s | 561Hz | 0.3844 | segment risk improved only -0.25; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.5s v1.05 | 4.92 | tail 5.32 | 0.24s | 643Hz | 0.3774 | duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.5s v0.95 | 4.94 | tail 6.31 | 0.24s | 557.4Hz | 0.3883 | whole-cue risk improved only 0.29; segment risk improved only -0.41; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.5s v1.16 | 4.97 | tail 6.08 | 0.24s | 576.6Hz | 0.3805 | whole-cue risk improved only 0.26; segment risk improved only -0.18; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.42s v1.16 | 4.98 | tail 5.78 | 0.24s | 609.3Hz | 0.3849 | whole-cue risk improved only 0.25; segment risk improved only 0.12; duration gap improved only 0s |
| Capture Retreat reference 2.34s/0.42s v1.05 | 4.99 | tail 5.88 | 0.24s | 606.1Hz | 0.3845 | whole-cue risk improved only 0.24; segment risk improved only 0.02; duration gap improved only 0s |
| Capturing guide window | 4.99 | tail 6.39 | 0.24s | 576.3Hz | 0.3939 | whole-cue risk improved only 0.24; segment risk improved only -0.49; duration gap improved only 0s |
| Capture Retreat reference 2.34s/0.42s v0.86 | 5.03 | tail 6.04 | 0.24s | 545.7Hz | 0.3971 | whole-cue risk improved only 0.2; segment risk improved only -0.14; duration gap improved only 0s |
| Capture Retreat reference 2.34s/0.42s v0.95 | 5.06 | tail 5.48 | 0.24s | 695.9Hz | 0.3895 | whole-cue risk improved only 0.17; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.36s v0.95 | 5.06 | tail 6.39 | 0.24s | 593.7Hz | 0.3984 | whole-cue risk improved only 0.17; segment risk improved only -0.49; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.42s v0.95 | 5.07 | tail 6.16 | 0.24s | 598.9Hz | 0.3947 | whole-cue risk improved only 0.16; segment risk improved only -0.26; duration gap improved only 0s |
| Capture Retreat reference 2.46s/0.42s v1.16 | 5.07 | tail 6.31 | 0.24s | 563.8Hz | 0.3872 | whole-cue risk improved only 0.16; segment risk improved only -0.41; duration gap improved only 0s; fewer exact segment-role matches than baseline |
| Capture Retreat reference 2.549s/0.36s v1.16 | 5.08 | tail 5.82 | 0.24s | 580Hz | 0.3892 | whole-cue risk improved only 0.15; segment risk improved only 0.08; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.36s v1.05 | 5.11 | tail 5.75 | 0.24s | 579Hz | 0.3822 | whole-cue risk improved only 0.12; segment risk improved only 0.15; duration gap improved only 0s |
| Capture Retreat reference 2.46s/0.42s v1.05 | 5.11 | tail 5.98 | 0.24s | 586.3Hz | 0.3861 | whole-cue risk improved only 0.12; segment risk improved only -0.08; duration gap improved only 0s |
| Capture Retreat reference 2.549s/0.42s v0.86 | 5.12 | tail 6 | 0.24s | 582.2Hz | 0.4114 | whole-cue risk improved only 0.11; segment risk improved only -0.1; duration gap improved only 0s |

## Next Step

Promote refclip-s2620-d420-v116 for Capture Retreat, then rerun the full audio comparison and event-gap rollup.

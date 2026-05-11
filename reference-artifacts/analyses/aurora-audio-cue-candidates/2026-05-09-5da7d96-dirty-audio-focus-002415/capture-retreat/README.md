# Aurora Capture Retreat Audio Candidate Analysis

Generated: 2026-05-09T00:24:15.006Z
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
| Capture Retreat reference 2.62s/0.42s v1.16 | 1.33 | onset 2.22 | 0.011s | 81.9Hz | 0.0771 | clears keeper gates |
| Capture Retreat reference 2.549s/0.5s v1.16 | 4.63 | tail 6.53 | 0.24s | 694.7Hz | 0.4132 | segment risk improved only -0.24; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.36s v1.05 | 4.73 | tail 6.84 | 0.24s | 732Hz | 0.4146 | segment risk improved only -0.55; duration gap improved only -0.13s |
| Capture Retreat reference 2.62s/0.36s v0.86 | 4.77 | tail 7.17 | 0.24s | 712.1Hz | 0.4364 | segment risk improved only -0.88; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.36s v0.62 | 4.82 | tail 6.35 | 0.07s | 822.2Hz | 0.4882 | segment risk improved only -0.06 |
| Capture Retreat reference 2.46s/0.42s v0.95 | 4.84 | tail 5.75 | 0.24s | 711.6Hz | 0.4287 | duration gap improved only -0.13s; fewer exact segment-role matches than baseline |
| Capture Retreat reference 2.62s/0.42s v0.95 | 4.87 | tail 6.38 | 0.24s | 732.2Hz | 0.4389 | segment risk improved only -0.09; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.42s v1.05 | 4.92 | tail 5.92 | 0.24s | 546.3Hz | 0.3837 | duration gap improved only -0.13s |
| Capture Retreat reference 2.62s/0.42s v1.05 | 4.94 | tail 5.34 | 0.24s | 651.3Hz | 0.3933 | duration gap improved only -0.13s |
| Capturing guide window | 4.97 | tail 5.92 | 0.24s | 562.8Hz | 0.3943 | duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.5s v1.05 | 4.98 | tail 5.95 | 0.24s | 590.8Hz | 0.3898 | segment risk improved only 0.34; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.42s v1.16 | 5.02 | tail 5.74 | 0.24s | 616.3Hz | 0.3887 | duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.42s v0.95 | 5.02 | tail 6.34 | 0.24s | 499Hz | 0.3922 | segment risk improved only -0.05; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.5s v0.95 | 5.04 | tail 5.91 | 0.24s | 593.4Hz | 0.3963 | duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.36s v1.16 | 5.06 | tail 6.18 | 0.24s | 549.3Hz | 0.3846 | segment risk improved only 0.11; duration gap improved only -0.13s |
| Capture Retreat reference 2.46s/0.42s v1.05 | 5.09 | tail 5.9 | 0.24s | 551.5Hz | 0.389 | duration gap improved only -0.13s |
| Capture Retreat reference 2.46s/0.42s v1.16 | 5.1 | tail 6.37 | 0.23s | 562.5Hz | 0.3874 | segment risk improved only -0.08; duration gap improved only -0.12s; fewer exact segment-role matches than baseline |
| Capture Retreat reference 2.549s/0.36s v0.95 | 5.11 | tail 6.04 | 0.24s | 521.5Hz | 0.3864 | segment risk improved only 0.25; duration gap improved only -0.13s |
| Capture Retreat reference 2.62s/0.36s v0.74 | 5.12 | tail 5.86 | 0.24s | 778.7Hz | 0.4543 | duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.42s v0.86 | 5.13 | tail 6.35 | 0.24s | 579.1Hz | 0.4069 | segment risk improved only -0.06; duration gap improved only -0.13s |
| Capture Retreat reference 2.46s/0.42s v0.86 | 5.15 | tail 6.04 | 0.24s | 535.4Hz | 0.4048 | segment risk improved only 0.25; duration gap improved only -0.13s; fewer exact segment-role matches than baseline |
| Capture Retreat reference 2.549s/0.5s v0.86 | 5.2 | tail 6.51 | 0.24s | 582.6Hz | 0.4114 | segment risk improved only -0.22; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.36s v0.86 | 5.22 | tail 5.81 | 0.24s | 522.1Hz | 0.4205 | whole-cue risk improved only 0.29; duration gap improved only -0.13s |
| Capture Retreat reference 2.549s/0.42s v0.74 | 5.24 | tail 6.66 | 0.24s | 578.6Hz | 0.4281 | whole-cue risk improved only 0.27; segment risk improved only -0.37; duration gap improved only -0.13s |

## Next Step

Promote refclip-s2620-d420-v116 for Capture Retreat, then rerun the full audio comparison and event-gap rollup.

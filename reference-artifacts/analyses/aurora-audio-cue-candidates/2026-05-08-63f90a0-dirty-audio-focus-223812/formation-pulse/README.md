# Aurora Formation Pulse Audio Candidate Analysis

Generated: 2026-05-08T22:38:12.644Z
Commit: 63f90a0 (dirty)

## Problem

Formation Pulse has the highest segment-level onset risk: the current classic pulse is a bright synthetic stab while the Galaga cadence reference has more low-frequency body and softer attack.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s660-d240-v95`
- Reason: No Formation Pulse candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Formation Pulse reference 0.66s/0.24s v0.95 | 3.54 | onset 2.56 | 0.45s | 595.1Hz | 0.2571 | duration gap improved only -0.441s |
| Formation Pulse reference 0.6s/0.24s v1.05 | 3.56 | onset 3.55 | 0.45s | 603.6Hz | 0.2631 | duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.24s v0.95 | 3.57 | onset 7.12 | 0.45s | 609.2Hz | 0.2653 | segment risk improved only -0.2; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.24s v0.62 | 3.68 | onset 6.73 | 0.45s | 668.5Hz | 0.2725 | segment risk improved only 0.19; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.66s/0.24s v0.86 | 3.8 | onset 7.12 | 0.45s | 699.8Hz | 0.2774 | segment risk improved only -0.2; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.54s/0.24s v0.86 | 3.81 | onset 6.88 | 0.45s | 605.4Hz | 0.2682 | segment risk improved only 0.04; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.54s/0.24s v0.95 | 3.91 | onset 7.12 | 0.45s | 636.2Hz | 0.2722 | segment risk improved only -0.2; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.24s v0.86 | 3.97 | onset 7.11 | 0.45s | 641.8Hz | 0.2891 | segment risk improved only -0.19; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.2s v0.86 | 4.14 | onset 6.89 | 0.45s | 679.3Hz | 0.2944 | segment risk improved only 0.03; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Low soft march | 4.28 | onset 6.7 | 0.001s | 656.1Hz | 0.2964 | whole-cue risk improved only 0.22; segment risk improved only 0.22; duration gap improved only 0.008s |
| Current Aurora baseline | 4.5 | onset 6.92 | 0.009s | 685.4Hz | 0.3032 | baseline |
| Convoy current guide window | 5.07 | onset 7.04 | 0.009s | 780Hz | 0.3457 | whole-cue risk improved only -0.57; segment risk improved only -0.12; duration gap improved only 0s |
| Formation Pulse reference 0.6s/0.2s v0.74 | 5.15 | onset 6.72 | 0.45s | 636.3Hz | 0.3125 | whole-cue risk improved only -0.65; segment risk improved only 0.2; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.2s v0.95 | 5.21 | onset 6.75 | 0.45s | 662.2Hz | 0.3231 | whole-cue risk improved only -0.71; segment risk improved only 0.17; duration gap improved only -0.441s; fewer exact segment-role matches than baseline |
| Formation Pulse reference 0.6s/0.24s v0.74 | 5.34 | onset 7.26 | 0.039s | 796Hz | 0.3325 | whole-cue risk improved only -0.84; segment risk improved only -0.34; duration gap improved only -0.03s |

## Next Step

Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates.

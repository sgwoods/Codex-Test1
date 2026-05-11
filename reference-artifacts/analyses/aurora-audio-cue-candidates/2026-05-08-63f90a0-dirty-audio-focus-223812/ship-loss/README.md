# Aurora Ship Loss Body Audio Candidate Analysis

Generated: 2026-05-08T22:38:12.644Z
Commit: 63f90a0 (dirty)

## Problem

Ship Loss onset is now much better, but its body segment remains too bright and too extended versus the measured Galaga death body window.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `lower-gain-body-candidate`
- Reason: No Ship Loss Body candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Current Aurora baseline | 3.6 | body 6.99 | 0.048s | 593.8Hz | 0.219 | baseline |
| Lower gain body candidate | 3.74 | body 6.86 | 0.03s | 668.5Hz | 0.2464 | whole-cue risk improved only -0.14; segment risk improved only 0.13; duration gap improved only 0.018s |
| Ship Loss Body reference 0.05s/0.72s v1 | 3.87 | body 6.73 | 0.258s | 515.4Hz | 0.1881 | whole-cue risk improved only -0.27; segment risk improved only 0.26; duration gap improved only -0.21s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v1 | 3.99 | body 6.78 | 0.308s | 534.6Hz | 0.1957 | whole-cue risk improved only -0.39; segment risk improved only 0.21; duration gap improved only -0.26s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v1 | 4.05 | body 6.63 | 0.288s | 562Hz | 0.1932 | whole-cue risk improved only -0.45; duration gap improved only -0.24s; fewer exact segment-role matches than baseline |
| Promoted active window | 4.06 | body 6.95 | 0.048s | 613.1Hz | 0.2241 | whole-cue risk improved only -0.46; segment risk improved only 0.04; duration gap improved only 0s |
| Ship Loss Body reference 0.05s/0.72s v0.82 | 4.07 | body 6.99 | 0.268s | 710.6Hz | 0.2608 | whole-cue risk improved only -0.47; segment risk improved only 0; duration gap improved only -0.22s; centroid worsened by 116.8 Hz; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.05s/0.72s v0.9 | 4.08 | body 6.77 | 0.268s | 581Hz | 0.2136 | whole-cue risk improved only -0.48; segment risk improved only 0.22; duration gap improved only -0.22s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v0.82 | 4.1 | onset 2.71 | 0.318s | 612.1Hz | 0.2251 | whole-cue risk improved only -0.5; duration gap improved only -0.27s |
| Ship Loss Body reference 0s/0.72s v0.9 | 4.11 | body 6.71 | 0.308s | 575.4Hz | 0.2107 | whole-cue risk improved only -0.51; segment risk improved only 0.28; duration gap improved only -0.26s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v0.9 | 4.17 | onset 2.62 | 0.298s | 583.3Hz | 0.2109 | whole-cue risk improved only -0.57; duration gap improved only -0.25s |
| Ship Loss Body reference 0.02s/0.72s v0.82 | 4.3 | onset 2.77 | 0.288s | 614Hz | 0.2245 | whole-cue risk improved only -0.7; duration gap improved only -0.24s |
| Ship Loss Body reference 0.05s/0.72s v0.74 | 4.44 | body 6.66 | 0.278s | 636.1Hz | 0.2378 | whole-cue risk improved only -0.84; segment risk improved only 0.33; duration gap improved only -0.23s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v0.74 | 4.52 | body 7.23 | 0.338s | 743.6Hz | 0.2715 | whole-cue risk improved only -0.92; segment risk improved only -0.24; duration gap improved only -0.29s; band shape worsened by 0.0525; centroid worsened by 149.8 Hz; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v0.74 | 4.58 | body 6.76 | 0.328s | 632.2Hz | 0.2382 | whole-cue risk improved only -0.98; segment risk improved only 0.23; duration gap improved only -0.28s; fewer exact segment-role matches than baseline |

## Next Step

Do not promote Ship Loss Body yet; use the measured best candidate to refine the generator or scoring gates.

# Aurora Ship Loss Body Audio Candidate Analysis

Generated: 2026-05-08T22:43:24.758Z
Commit: 63f90a0 (dirty)

## Problem

Ship Loss onset is now much better, but its body segment remains too bright and too extended versus the measured Galaga death body window.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s100-d720-v74`
- Reason: No Ship Loss Body candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Ship Loss Body reference 0.1s/0.72s v0.74 | 2.13 | body 1.8 | 0.599s | 53Hz | 0.0191 | duration gap improved only -0.541s; fewer exact segment-role matches than baseline |
| Promoted active window | 3.54 | body 6.52 | 0.048s | 591.8Hz | 0.2173 | whole-cue risk improved only 0.17; segment risk improved only 0.27 |
| Current Aurora baseline | 3.71 | body 6.79 | 0.058s | 608.2Hz | 0.2231 | baseline |
| Ship Loss Body reference 0.05s/0.72s v1 | 3.75 | body 6.68 | 0.258s | 512.8Hz | 0.1936 | whole-cue risk improved only -0.04; segment risk improved only 0.11; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.1s/0.72s v1 | 3.85 | body 6.63 | 0.248s | 552.7Hz | 0.1937 | whole-cue risk improved only -0.14; segment risk improved only 0.16; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.12s/0.72s v0.9 | 3.87 | body 5.92 | 0.248s | 579.8Hz | 0.211 | whole-cue risk improved only -0.16; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Lower gain body candidate | 3.87 | body 6.47 | 0.03s | 652.7Hz | 0.2392 | whole-cue risk improved only -0.16; segment risk improved only 0.32 |
| Ship Loss Body reference 0.08s/0.72s v1 | 3.93 | body 6.98 | 0.248s | 612.3Hz | 0.2258 | whole-cue risk improved only -0.22; segment risk improved only -0.19; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v1 | 3.94 | body 6.23 | 0.298s | 533.4Hz | 0.1961 | whole-cue risk improved only -0.23; duration gap improved only -0.24s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v1 | 3.95 | body 6.94 | 0.288s | 522.3Hz | 0.1948 | whole-cue risk improved only -0.24; segment risk improved only -0.15; duration gap improved only -0.23s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.12s/0.72s v1 | 3.97 | body 6.97 | 0.248s | 548.7Hz | 0.1976 | whole-cue risk improved only -0.26; segment risk improved only -0.18; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.05s/0.72s v0.9 | 4.02 | body 6.51 | 0.258s | 597.4Hz | 0.2134 | whole-cue risk improved only -0.31; segment risk improved only 0.28; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.08s/0.72s v0.82 | 4.07 | onset 2.45 | 0.279s | 608.7Hz | 0.2232 | whole-cue risk improved only -0.36; duration gap improved only -0.221s |
| Ship Loss Body reference 0.08s/0.72s v0.9 | 4.07 | body 6.85 | 0.248s | 564.3Hz | 0.2107 | whole-cue risk improved only -0.36; segment risk improved only -0.06; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v0.9 | 4.09 | body 6.66 | 0.288s | 580Hz | 0.2128 | whole-cue risk improved only -0.38; segment risk improved only 0.13; duration gap improved only -0.23s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v0.9 | 4.15 | body 6.52 | 0.308s | 558.6Hz | 0.2089 | whole-cue risk improved only -0.44; segment risk improved only 0.27; duration gap improved only -0.25s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.05s/0.72s v0.82 | 4.16 | body 6.67 | 0.268s | 598.1Hz | 0.2199 | whole-cue risk improved only -0.45; segment risk improved only 0.12; duration gap improved only -0.21s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.1s/0.72s v0.82 | 4.18 | body 6.61 | 0.248s | 609.3Hz | 0.2265 | whole-cue risk improved only -0.47; segment risk improved only 0.18; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.1s/0.72s v0.9 | 4.19 | body 6.15 | 0.248s | 602.6Hz | 0.2135 | whole-cue risk improved only -0.48; duration gap improved only -0.19s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.08s/0.72s v0.74 | 4.24 | onset 2.65 | 0.248s | 592.9Hz | 0.229 | whole-cue risk improved only -0.53; duration gap improved only -0.19s |
| Ship Loss Body reference 0.05s/0.72s v0.74 | 4.31 | body 6.64 | 0.278s | 643.5Hz | 0.2403 | whole-cue risk improved only -0.6; segment risk improved only 0.15; duration gap improved only -0.22s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v0.82 | 4.32 | body 6.6 | 0.318s | 610Hz | 0.2242 | whole-cue risk improved only -0.61; segment risk improved only 0.19; duration gap improved only -0.26s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.12s/0.72s v0.82 | 4.39 | body 6.4 | 0.248s | 698.1Hz | 0.2545 | whole-cue risk improved only -0.68; duration gap improved only -0.19s |
| Ship Loss Body reference 0.02s/0.72s v0.82 | 4.39 | body 6.7 | 0.298s | 623.7Hz | 0.2264 | whole-cue risk improved only -0.68; segment risk improved only 0.09; duration gap improved only -0.24s; fewer exact segment-role matches than baseline |

## Next Step

Do not promote Ship Loss Body yet; use the measured best candidate to refine the generator or scoring gates.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

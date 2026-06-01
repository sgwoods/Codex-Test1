# Aurora Ship Loss Body Audio Candidate Analysis

Generated: 2026-05-08T22:40:35.466Z
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
| Ship Loss Body reference 0.1s/0.72s v0.74 | 1.95 | onset 2.42 | 0.609s | 106.4Hz | 0.0241 | duration gap improved only -0.561s; fewer exact segment-role matches than baseline |
| Promoted active window | 3.63 | body 7.01 | 0.048s | 601.6Hz | 0.2199 | whole-cue risk improved only 0.1; segment risk improved only 0.07; duration gap improved only 0s |
| Lower gain body candidate | 3.72 | body 6.56 | 0.05s | 655.9Hz | 0.2426 | whole-cue risk improved only 0.01; duration gap improved only -0.002s |
| Current Aurora baseline | 3.73 | body 7.08 | 0.048s | 618.8Hz | 0.227 | baseline |
| Ship Loss Body reference 0.08s/0.72s v1 | 3.9 | body 6.46 | 0.248s | 599.1Hz | 0.2215 | whole-cue risk improved only -0.17; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.05s/0.72s v1 | 3.91 | body 6.69 | 0.258s | 529.3Hz | 0.1941 | whole-cue risk improved only -0.18; duration gap improved only -0.21s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.1s/0.72s v1 | 3.92 | body 5.74 | 0.248s | 535.4Hz | 0.191 | whole-cue risk improved only -0.19; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v1 | 3.92 | body 6.78 | 0.278s | 521.9Hz | 0.1941 | whole-cue risk improved only -0.19; segment risk improved only 0.3; duration gap improved only -0.23s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.12s/0.72s v1 | 3.92 | body 6.98 | 0.248s | 536.7Hz | 0.1926 | whole-cue risk improved only -0.19; segment risk improved only 0.1; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.1s/0.72s v0.9 | 3.94 | body 6.59 | 0.248s | 575.4Hz | 0.2109 | whole-cue risk improved only -0.21; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.08s/0.72s v0.82 | 4.03 | onset 2.49 | 0.269s | 601.9Hz | 0.2204 | whole-cue risk improved only -0.3; duration gap improved only -0.221s |
| Ship Loss Body reference 0.08s/0.72s v0.9 | 4.03 | body 6.79 | 0.248s | 604.8Hz | 0.2155 | whole-cue risk improved only -0.3; segment risk improved only 0.29; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v1 | 4.06 | body 6.81 | 0.308s | 526.5Hz | 0.1922 | whole-cue risk improved only -0.33; segment risk improved only 0.27; duration gap improved only -0.26s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.12s/0.72s v0.9 | 4.08 | body 6.28 | 0.248s | 578.5Hz | 0.2088 | whole-cue risk improved only -0.35; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.1s/0.72s v0.82 | 4.1 | body 6.82 | 0.248s | 580.6Hz | 0.2148 | whole-cue risk improved only -0.37; segment risk improved only 0.26; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.05s/0.72s v0.9 | 4.1 | body 6.93 | 0.258s | 612.9Hz | 0.2118 | whole-cue risk improved only -0.37; segment risk improved only 0.15; duration gap improved only -0.21s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0s/0.72s v0.9 | 4.11 | onset 2.77 | 0.308s | 581.5Hz | 0.215 | whole-cue risk improved only -0.38; duration gap improved only -0.26s |
| Ship Loss Body reference 0.02s/0.72s v0.9 | 4.11 | body 6.59 | 0.298s | 575.8Hz | 0.2134 | whole-cue risk improved only -0.38; duration gap improved only -0.25s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.05s/0.72s v0.82 | 4.17 | body 6.62 | 0.268s | 615.8Hz | 0.2248 | whole-cue risk improved only -0.44; duration gap improved only -0.22s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v0.82 | 4.27 | onset 2.56 | 0.298s | 594.7Hz | 0.2224 | whole-cue risk improved only -0.54; duration gap improved only -0.25s |
| Ship Loss Body reference 0.05s/0.72s v0.74 | 4.31 | body 6.81 | 0.258s | 629.7Hz | 0.2332 | whole-cue risk improved only -0.58; segment risk improved only 0.27; duration gap improved only -0.21s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.02s/0.72s v0.74 | 4.32 | body 7.05 | 0.338s | 723.6Hz | 0.2694 | whole-cue risk improved only -0.59; segment risk improved only 0.03; duration gap improved only -0.29s; centroid worsened by 104.8 Hz; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.08s/0.72s v0.74 | 4.34 | body 6.76 | 0.248s | 639.5Hz | 0.2319 | whole-cue risk improved only -0.61; segment risk improved only 0.32; duration gap improved only -0.2s; fewer exact segment-role matches than baseline |
| Ship Loss Body reference 0.12s/0.72s v0.82 | 4.36 | body 6.63 | 0.248s | 699.1Hz | 0.2611 | whole-cue risk improved only -0.63; duration gap improved only -0.2s |

## Next Step

Do not promote Ship Loss Body yet; use the measured best candidate to refine the generator or scoring gates.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

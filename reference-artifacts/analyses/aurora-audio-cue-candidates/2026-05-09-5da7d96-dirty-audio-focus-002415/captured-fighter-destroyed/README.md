# Aurora Captured Fighter Destroyed Audio Candidate Analysis

Generated: 2026-05-09T00:24:15.006Z
Commit: 5da7d96 (dirty)

## Problem

Captured Fighter Destroyed is the highest segment-level audio gap: the current penalty sound has the right slot, but its onset lacks the measured impact/noise body of the reference.

## Decision

- Status: `candidate-recommended`
- Best: `refclip-s2020-d240-v74`
- Measured best: `refclip-s2020-d240-v74`
- Reason: Captured Fighter Destroyed candidate clears measured keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Captured Fighter Destroyed reference 2.02s/0.24s v0.74 | 1.42 | onset 1.46 | 0.079s | 91.2Hz | 0.0101 | clears keeper gates |
| Captured Fighter Destroyed reference 1.949s/0.3s v1.16 | 4.17 | onset 5.65 | 0.42s | 568.5Hz | 0.3352 | segment risk improved only 0.1; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.3s v1.05 | 4.29 | onset 5.78 | 0.42s | 604Hz | 0.3431 | segment risk improved only -0.03; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.24s v1.05 | 4.35 | onset 5.88 | 0.42s | 632Hz | 0.3481 | segment risk improved only -0.13; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.88s/0.24s v1.16 | 4.4 | onset 6.16 | 0.42s | 569.8Hz | 0.3314 | segment risk improved only -0.41; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.2s v0.86 | 4.68 | onset 6.11 | 0.42s | 645.2Hz | 0.3672 | segment risk improved only -0.36; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.18s v0.95 | 4.69 | onset 2.12 | 0.42s | 637.8Hz | 0.3643 | duration gap improved only -0.399s |
| Penalty wide impact | 4.69 | onset 2.22 | 0.42s | 454.5Hz | 0.2897 | duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.2s v0.62 | 4.81 | onset 6.2 | 0.289s | 632.7Hz | 0.3616 | whole-cue risk improved only 0.16; segment risk improved only -0.45; duration gap improved only -0.268s; fewer exact segment-role matches than baseline |
| Captured Fighter Destroyed reference 1.88s/0.24s v0.95 | 4.96 | onset 2.77 | 0.42s | 603.5Hz | 0.3246 | whole-cue risk improved only 0.01; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.3s v0.95 | 4.97 | onset 2.48 | 0.42s | 450.7Hz | 0.2885 | whole-cue risk improved only 0; duration gap improved only -0.399s |
| Current Aurora baseline | 4.97 | onset 5.75 | 0.021s | 747.8Hz | 0.4075 | baseline |
| Captured Fighter Destroyed reference 2.02s/0.24s v0.95 | 5.04 | onset 2.29 | 0.42s | 504.2Hz | 0.3141 | whole-cue risk improved only -0.07; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.24s v0.95 | 5.07 | onset 2.13 | 0.42s | 456.7Hz | 0.2964 | whole-cue risk improved only -0.1; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.3s v0.86 | 5.09 | onset 2.03 | 0.42s | 493.3Hz | 0.3141 | whole-cue risk improved only -0.12; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 2.02s/0.24s v1.05 | 5.1 | onset 2.21 | 0.42s | 494.5Hz | 0.3144 | whole-cue risk improved only -0.13; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.3s v0.62 | 5.12 | onset 5.83 | 0.001s | 808.8Hz | 0.4177 | whole-cue risk improved only -0.15; segment risk improved only -0.08 |
| Captured Fighter Destroyed reference 1.949s/0.2s v1.16 | 5.13 | onset 1.77 | 0.42s | 506.2Hz | 0.3208 | whole-cue risk improved only -0.16; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 2.02s/0.24s v1.16 | 5.14 | onset 2.03 | 0.42s | 535.3Hz | 0.3226 | whole-cue risk improved only -0.17; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.88s/0.24s v1.05 | 5.15 | onset 1.64 | 0.42s | 472.4Hz | 0.3024 | whole-cue risk improved only -0.18; duration gap improved only -0.399s |
| Penalty guide window | 5.16 | onset 2.13 | 0.42s | 525.9Hz | 0.3203 | whole-cue risk improved only -0.19; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.3s v0.74 | 5.17 | onset 1.88 | 0.42s | 577.5Hz | 0.3457 | whole-cue risk improved only -0.2; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 2.02s/0.24s v0.86 | 5.17 | onset 2.38 | 0.42s | 528Hz | 0.3254 | whole-cue risk improved only -0.2; duration gap improved only -0.399s |
| Captured Fighter Destroyed reference 1.949s/0.2s v1.05 | 5.18 | onset 2.36 | 0.42s | 515.4Hz | 0.2995 | whole-cue risk improved only -0.21; duration gap improved only -0.399s |

## Next Step

Promote refclip-s2020-d240-v74 for Captured Fighter Destroyed, then rerun the full audio comparison and event-gap rollup.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

# Aurora Player Hit Audio Candidate Analysis

Generated: 2026-05-08T22:04:15.323Z
Commit: fa37a87 (dirty)

## Problem

Ship Loss/playerHit is the highest current audio event-gap risk: Aurora reads as a short bright hit, while the Galaga reference is a longer low-band death event with a sustained onset and trailing body.

## Strategy

Capture bounded low-band, long-decay candidate specs through the live browser audio engine, compare against galaga3-death.m4a with active-window segmentation, and recommend promotion only if the candidate improves whole-cue risk, segment risk, duration, band shape, centroid, and role matching.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s20-d1040-v82`
- Reason: No candidate cleared the whole-cue, segment-risk, duration, band-shape, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Reference death subclip 0.02s/1.04s v0.82 | 1.17 | body 2.37 | 0.369s | 11.6Hz | 0.0097 | duration gap improved only -0.321s (<0.18s); fewer exact segment-role matches than baseline |
| Reference death subclip 0.08s/0.92s v1 | 3.3 | body 6.65 | 0.008s | 584.2Hz | 0.2158 | whole-cue risk improved only 0.28 (<0.35); segment risk improved only -0.26 (<0.35); duration gap improved only 0.04s (<0.18s) |
| Reference death subclip 0.1s/1.16s v1 | 3.46 | body 6.02 | 0.1s | 589.8Hz | 0.2177 | whole-cue risk improved only 0.12 (<0.35); duration gap improved only -0.052s (<0.18s) |
| Reference death subclip 0s/1.04s v1 | 3.49 | body 6.47 | 0.03s | 600Hz | 0.2222 | whole-cue risk improved only 0.09 (<0.35); segment risk improved only -0.08 (<0.35); duration gap improved only 0.018s (<0.18s) |
| Reference death subclip 0.02s/1.16s v1 | 3.5 | body 6.7 | 0.05s | 595.4Hz | 0.2186 | whole-cue risk improved only 0.08 (<0.35); segment risk improved only -0.31 (<0.35); duration gap improved only -0.002s (<0.18s) |
| Reference death subclip 0.1s/0.968s v1 | 3.51 | body 5.83 | 0.008s | 585.8Hz | 0.2155 | whole-cue risk improved only 0.07 (<0.35); duration gap improved only 0.04s (<0.18s) |
| Reference death subclip 0.05s/0.968s v1 | 3.52 | body 5.64 | 0.018s | 603.7Hz | 0.224 | whole-cue risk improved only 0.06 (<0.35); duration gap improved only 0.03s (<0.18s) |
| Reference death subclip 0.12s/1.04s v0.92 | 3.52 | body 6.74 | 0.07s | 639.4Hz | 0.2346 | whole-cue risk improved only 0.06 (<0.35); segment risk improved only -0.35 (<0.35); duration gap improved only -0.022s (<0.18s) |
| Reference death subclip 0.1s/0.968s v0.92 | 3.54 | body 6.25 | 0.008s | 616.2Hz | 0.2258 | whole-cue risk improved only 0.04 (<0.35); segment risk improved only 0.14 (<0.35); duration gap improved only 0.04s (<0.18s) |
| Reference death subclip 0.1s/0.84s v1 | 3.57 | body 6.28 | 0.128s | 581.4Hz | 0.2108 | whole-cue risk improved only 0.01 (<0.35); segment risk improved only 0.11 (<0.35); duration gap improved only -0.08s (<0.18s) |
| Current Aurora baseline | 3.58 | body 6.39 | 0.048s | 591.4Hz | 0.218 | baseline |
| Reference death subclip 0.1s/1.04s v1 | 3.59 | body 5.83 | 0.052s | 596.9Hz | 0.22 | whole-cue risk improved only -0.01 (<0.35); duration gap improved only -0.004s (<0.18s) |
| Reference death subclip 0.08s/0.968s v1 | 3.59 | body 6.47 | 0.008s | 585.8Hz | 0.2148 | whole-cue risk improved only -0.01 (<0.35); segment risk improved only -0.08 (<0.35); duration gap improved only 0.04s (<0.18s) |
| Reference death subclip 0.02s/0.968s v0.92 | 3.6 | body 6.5 | 0.048s | 634.1Hz | 0.2341 | whole-cue risk improved only -0.02 (<0.35); segment risk improved only -0.11 (<0.35); duration gap improved only 0s (<0.18s) |
| Reference death subclip 0.16s/0.968s v1 | 3.6 | body 6.7 | 0.008s | 609.3Hz | 0.2253 | whole-cue risk improved only -0.02 (<0.35); segment risk improved only -0.31 (<0.35); duration gap improved only 0.04s (<0.18s) |
| Reference death subclip 0.12s/0.968s v1 | 3.6 | body 6.73 | 0.008s | 609.5Hz | 0.2221 | whole-cue risk improved only -0.02 (<0.35); segment risk improved only -0.34 (<0.35); duration gap improved only 0.04s (<0.18s) |
| Reference death subclip 0.02s/1.04s v1 | 3.6 | body 6.86 | 0.05s | 605.5Hz | 0.2238 | whole-cue risk improved only -0.02 (<0.35); segment risk improved only -0.47 (<0.35); duration gap improved only -0.002s (<0.18s) |
| Reference death subclip 0.08s/1.04s v1 | 3.61 | body 6.67 | 0.08s | 595.1Hz | 0.2178 | whole-cue risk improved only -0.03 (<0.35); segment risk improved only -0.28 (<0.35); duration gap improved only -0.032s (<0.18s) |

## Next Step

Use the best measured candidates to expand the low-band envelope generator, or consider a reference-subclip strategy for ship loss if synthesized cues keep failing duration and band-shape gates.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`

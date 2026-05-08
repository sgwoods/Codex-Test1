# Aurora Player Hit Audio Candidate Analysis

Generated: 2026-05-08T22:02:10.236Z
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
| Reference death subclip 0.02s/1.04s v0.82 | 1.17 | body 2.55 | 0.359s | 21.7Hz | 0.0103 | duration gap improved only -0.347s (<0.18s); fewer exact segment-role matches than baseline |
| Reference death subclip 0.1s/0.968s v1 | 3.45 | body 6.02 | 0.052s | 596.5Hz | 0.2196 | whole-cue risk improved only 0.04 (<0.35); duration gap improved only -0.04s (<0.18s) |
| Current Aurora baseline | 3.49 | body 6.63 | 0.012s | 597.8Hz | 0.2218 | baseline |
| Reference death subclip 0.02s/0.92s v1 | 3.49 | body 6.69 | 0.048s | 619.4Hz | 0.2237 | whole-cue risk improved only 0 (<0.35); segment risk improved only -0.06 (<0.35); duration gap improved only -0.036s (<0.18s) |
| Reference death subclip 0.08s/0.968s v1 | 3.54 | body 6.64 | 0.008s | 592Hz | 0.2167 | whole-cue risk improved only -0.05 (<0.35); segment risk improved only -0.01 (<0.35); duration gap improved only 0.004s (<0.18s) |
| Reference death subclip 0.02s/0.968s v0.92 | 3.56 | body 6.27 | 0.048s | 642.6Hz | 0.2349 | whole-cue risk improved only -0.07 (<0.35); duration gap improved only -0.036s (<0.18s) |
| Reference death subclip 0.02s/0.968s v1 | 3.56 | body 6.59 | 0.058s | 590.2Hz | 0.2225 | whole-cue risk improved only -0.07 (<0.35); segment risk improved only 0.04 (<0.35); duration gap improved only -0.046s (<0.18s) |
| Reference death subclip 0.08s/0.92s v0.92 | 3.57 | body 6.72 | 0.008s | 613.9Hz | 0.226 | whole-cue risk improved only -0.08 (<0.35); segment risk improved only -0.09 (<0.35); duration gap improved only 0.004s (<0.18s) |
| Reference death subclip 0.12s/0.968s v1 | 3.6 | body 5.98 | 0.008s | 634.2Hz | 0.2287 | whole-cue risk improved only -0.11 (<0.35); duration gap improved only 0.004s (<0.18s) |
| Reference death subclip 0s/1.04s v0.92 | 3.61 | body 6.5 | 0.03s | 621.9Hz | 0.23 | whole-cue risk improved only -0.12 (<0.35); segment risk improved only 0.13 (<0.35); duration gap improved only -0.018s (<0.18s) |
| Reference death subclip 0.1s/0.968s v0.92 | 3.61 | body 6.54 | 0.008s | 605.7Hz | 0.2271 | whole-cue risk improved only -0.12 (<0.35); segment risk improved only 0.09 (<0.35); duration gap improved only 0.004s (<0.18s) |
| Reference death subclip 0.12s/0.968s v0.92 | 3.64 | body 6.19 | 0.008s | 655.6Hz | 0.238 | whole-cue risk improved only -0.15 (<0.35); duration gap improved only 0.004s (<0.18s) |
| Reference death subclip 0.05s/0.92s v1 | 3.65 | body 5.6 | 0.018s | 622.1Hz | 0.2241 | whole-cue risk improved only -0.16 (<0.35); duration gap improved only -0.006s (<0.18s) |
| Reference death subclip 0.1s/0.968s v0.82 | 3.65 | body 6.64 | 0.008s | 667.4Hz | 0.2429 | whole-cue risk improved only -0.16 (<0.35); segment risk improved only -0.01 (<0.35); duration gap improved only 0.004s (<0.18s) |
| Reference death subclip 0.08s/0.92s v0.82 | 3.71 | body 6.4 | 0.008s | 721.4Hz | 0.2653 | whole-cue risk improved only -0.22 (<0.35); segment risk improved only 0.23 (<0.35); duration gap improved only 0.004s (<0.18s); band shape worsened by 0.0435; centroid worsened by 123.6 Hz |
| Reference death subclip 0s/0.968s v0.92 | 3.73 | body 5.9 | 0.078s | 636.2Hz | 0.2349 | whole-cue risk improved only -0.24 (<0.35); duration gap improved only -0.066s (<0.18s) |
| Reference death subclip 0.05s/0.968s v0.82 | 3.74 | body 6.54 | 0.022s | 660.8Hz | 0.2455 | whole-cue risk improved only -0.25 (<0.35); segment risk improved only 0.09 (<0.35); duration gap improved only -0.01s (<0.18s) |
| Reference death subclip 0.02s/1.04s v1 | 3.74 | body 6.64 | 0.05s | 602.3Hz | 0.2219 | whole-cue risk improved only -0.25 (<0.35); segment risk improved only -0.01 (<0.35); duration gap improved only -0.038s (<0.18s) |

## Next Step

Use the best measured candidates to expand the low-band envelope generator, or consider a reference-subclip strategy for ship loss if synthesized cues keep failing duration and band-shape gates.

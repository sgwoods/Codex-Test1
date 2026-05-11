# Aurora Player Hit Audio Candidate Analysis

Generated: 2026-05-08T21:58:16.620Z
Commit: fa37a87 (dirty)

## Problem

Ship Loss/playerHit is the highest current audio event-gap risk: Aurora reads as a short bright hit, while the Galaga reference is a longer low-band death event with a sustained onset and trailing body.

## Strategy

Capture bounded low-band, long-decay candidate specs through the live browser audio engine, compare against galaga3-death.m4a with active-window segmentation, and recommend promotion only if the candidate improves whole-cue risk, segment risk, duration, band shape, centroid, and role matching.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `deathgrid-b176-t82-d960-lp1100-v200-n25-bd500`
- Reason: No candidate cleared the whole-cue, segment-risk, duration, band-shape, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Current Aurora baseline | 5.02 | body 7.03 | 0.458s | 967.8Hz | 0.3634 | baseline |
| Death grid 176/82 0.96s lp1100 | 5.14 | body 6.69 | 0.379s | 963.6Hz | 0.3543 | whole-cue risk improved only -0.12 (<0.35); segment risk improved only 0.34 (<0.35); duration gap improved only 0.079s (<0.18s) |
| Two pulse low bloom | 5.31 | onset 7.14 | 0.028s | 1005.6Hz | 0.3831 | whole-cue risk improved only -0.29 (<0.35); segment risk improved only -0.11 (<0.35) |
| Death grid 156/82 0.96s lp1100 | 5.32 | onset 7.06 | 0.062s | 999.8Hz | 0.3755 | whole-cue risk improved only -0.3 (<0.35); segment risk improved only -0.03 (<0.35) |
| Death grid 176/82 0.96s lp1100 | 5.33 | onset 7.95 | 0.369s | 948.4Hz | 0.3571 | whole-cue risk improved only -0.31 (<0.35); segment risk improved only -0.92 (<0.35); duration gap improved only 0.089s (<0.18s) |
| Low rumble long decay | 5.42 | onset 6.82 | 0.087s | 982.1Hz | 0.3594 | whole-cue risk improved only -0.4 (<0.35); segment risk improved only 0.21 (<0.35) |
| Death grid 156/82 0.96s lp1100 | 5.63 | body 6.71 | 0.379s | 967.1Hz | 0.3562 | whole-cue risk improved only -0.61 (<0.35); segment risk improved only 0.32 (<0.35); duration gap improved only 0.079s (<0.18s) |
| Death grid 156/82 0.96s lp1100 | 5.66 | body 6.64 | 0.379s | 968Hz | 0.3543 | whole-cue risk improved only -0.64 (<0.35); duration gap improved only 0.079s (<0.18s) |
| Death grid 176/82 0.96s lp1100 | 5.66 | body 6.71 | 0.379s | 960.6Hz | 0.3533 | whole-cue risk improved only -0.64 (<0.35); segment risk improved only 0.32 (<0.35); duration gap improved only 0.079s (<0.18s) |
| Sub-heavy collapse | 5.67 | onset 6.55 | 0.389s | 965.1Hz | 0.3546 | whole-cue risk improved only -0.65 (<0.35); duration gap improved only 0.069s (<0.18s) |

## Next Step

Use the best measured candidates to expand the low-band envelope generator, or consider a reference-subclip strategy for ship loss if synthesized cues keep failing duration and band-shape gates.

# Aurora Player Hit Audio Candidate Analysis

Generated: 2026-05-08T21:59:15.498Z
Commit: fa37a87 (dirty)

## Problem

Ship Loss/playerHit is the highest current audio event-gap risk: Aurora reads as a short bright hit, while the Galaga reference is a longer low-band death event with a sustained onset and trailing body.

## Strategy

Capture bounded low-band, long-decay candidate specs through the live browser audio engine, compare against galaga3-death.m4a with active-window segmentation, and recommend promotion only if the candidate improves whole-cue risk, segment risk, duration, band shape, centroid, and role matching.

## Decision

- Status: `candidate-recommended`
- Best: `reference-death-active-window`
- Measured best: `reference-death-active-window`
- Reason: Selected candidate clears measured ship-loss keeper gates.

| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Reference death active window | 3.67 | body 6.78 | 0.058s | 682.5Hz | 0.2497 | clears keeper gates |
| Current Aurora baseline | 6.41 | onset 7.74 | 0.308s | 979Hz | 0.3755 | baseline |
| Reference death full cue | 6.63 | body 6.59 | 2.824s | 817.8Hz | 0.3142 | whole-cue risk improved only -0.22 (<0.35); duration gap improved only -2.516s (<0.18s) |

## Next Step

Promote the recommended playerHit cue into the measured Aurora audio theme, then rerun the full audio comparison and event-gap rollup.

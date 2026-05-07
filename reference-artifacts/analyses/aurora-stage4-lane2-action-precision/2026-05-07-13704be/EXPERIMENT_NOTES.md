# Stage 4 Lane-2 Experiment Notes

## Rejected Runtime Cue

During this cycle, a bounded Stage 4 column-5 butterfly cue was tested locally at the archived source attack window. It improved controlled-clock geometry from a high-formation miss to near-contact, but the official realtime loss-window gate did not improve exact replay coverage and introduced an early lane-2 butterfly loss that blocked the later boss-window probe.

The runtime cue was backed out. The kept change is the analyzer plus source-exact scenario timing so future scheduling work can be measured before it is accepted.

## Current Interpretation

- Input precision alone does not reproduce the archived lane-2 loss.
- The source column-5 butterfly remains in formation across all final-turn timing variants.
- The next useful gameplay experiment should change attacker scheduling or cool-down selection, then rerun this artifact before running the expensive full loss-window gate.

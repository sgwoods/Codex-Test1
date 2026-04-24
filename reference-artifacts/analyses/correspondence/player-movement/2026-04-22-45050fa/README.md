# Player Movement Conformance

This artifact measures player movement against the documented control principles for Aurora:

- tap should support fine correction
- hold should support meaningful lane travel
- reversal should settle quickly enough for evasive play
- firing while moving should not stall the ship or suppress the shot window

## Sources

- Profile: `tools/harness/reference-profiles/player-movement-conformance.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Baseline score: 4.8/10
- Current score: 5/10
- Delta: 0.2

## Current build

- Tap correction abs delta: 56.43
- Hold travel delta: 150.4
- Hold settle after release (ms): 184
- Reversal cross ms: 184
- Shot delay while moving (ms): 231
- Post-shot travel: 60.79
- Max frame step: 29.47

## Read

- This is a first-phase movement conformance check based on the documented control principles and not yet a direct trace extraction from reference footage.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets later once we extract direct movement traces from the preserved Galaga gameplay footage.


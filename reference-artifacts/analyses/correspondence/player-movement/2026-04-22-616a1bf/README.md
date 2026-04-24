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

- Baseline score: 4.3/10
- Current score: 4.3/10
- Delta: 0

## Current build

- Tap correction abs delta: 0
- Hold travel delta: 0
- Hold settle after release (ms): 0
- Reversal cross ms: 67
- Shot delay while moving (ms): 1202
- Post-shot travel: 74.97
- Max frame step: 11.12

## Read

- This is a first-phase movement conformance check based on the documented control principles and not yet a direct trace extraction from reference footage.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets later once we extract direct movement traces from the preserved Galaga gameplay footage.


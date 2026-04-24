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

- Baseline score: 4.6/10
- Current score: 6/10
- Delta: 1.4

## Current build

- Tap correction abs delta: 17.71
- Hold travel delta: 85.1
- Hold settle after release (ms): null
- Reversal cross ms: 283
- Shot delay while moving (ms): 5
- Post-shot travel: 43.13
- Max frame step: 11.81

## Read

- This is a first-phase movement conformance check based on the documented control principles and not yet a direct trace extraction from reference footage.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets later once we extract direct movement traces from the preserved Galaga gameplay footage.


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
- Current score: 5.9/10
- Delta: 1.3

## Current build

- Tap correction abs delta: 18.09
- Hold travel delta: 106.86
- Hold settle after release (ms): null
- Reversal cross ms: 200
- Shot delay while moving (ms): 16
- Post-shot travel: 49.61
- Max frame step: 17.73

## Read

- This is a first-phase movement conformance check based on the documented control principles and not yet a direct trace extraction from reference footage.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets later once we extract direct movement traces from the preserved Galaga gameplay footage.


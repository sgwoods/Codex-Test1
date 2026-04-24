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

- Baseline score: 5.1/10
- Current score: 5/10
- Delta: -0.1

## Current build

- Tap correction abs delta: 27.85
- Hold travel delta: 96.64
- Hold settle after release (ms): null
- Reversal cross ms: 283
- Shot delay while moving (ms): -9
- Post-shot travel: 57.35
- Max frame step: 22.13

## Read

- This is a first-phase movement conformance check based on the documented control principles and not yet a direct trace extraction from reference footage.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets later once we extract direct movement traces from the preserved Galaga gameplay footage.


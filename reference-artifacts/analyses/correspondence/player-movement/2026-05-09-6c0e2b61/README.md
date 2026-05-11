# Player Movement Conformance

This artifact measures player movement against the documented control principles for Aurora:

- tap should support fine correction
- hold should support meaningful lane travel
- reversal should settle quickly enough for evasive play
- firing while moving should not stall the ship or suppress the shot window

## Sources

- Profile: `tools/harness/reference-profiles/player-movement-conformance.json`
- Reference trace source: `reference-artifacts/analyses/reference-video-alignment/stage1-opening-window-2026-04-24-e1c2c65/movement-traces.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Baseline score: 9.7/10
- Current score: 9.8/10
- Delta: 0.1

## Current build

- Tap correction abs delta: 17.14
- Hold travel delta: 91.05
- Hold settle after release (ms): 209
- Reversal cross ms: 267
- Shot delay while moving (ms): 33
- Post-shot travel: 79.87
- Max frame step: 19.36

## Current metric gaps

- maxFrameStep: value 19.36, target {"max":17}, gap 2.36

## Read

- This movement conformance check now uses first-pass trace-backed targets derived from the preserved stage-opening alignment window.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets again once direct frame-level movement extraction is automated from the preserved Galaga gameplay footage.


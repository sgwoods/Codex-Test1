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

- Baseline score: 10/10
- Current score: 10/10
- Delta: 0

## Current build

- Tap correction abs delta: 13.91
- Hold travel delta: 88.01
- Hold settle after release (ms): 217
- Reversal cross ms: 268
- Shot delay while moving (ms): -1
- Post-shot travel: 47.08
- Max frame step: 14.58

## Current metric gaps

- none

## Read

- This movement conformance check now uses first-pass trace-backed targets derived from the preserved stage-opening alignment window.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets again once direct frame-level movement extraction is automated from the preserved Galaga gameplay footage.


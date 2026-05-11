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

- Baseline score: 9.1/10
- Current score: 9.1/10
- Delta: 0

## Current build

- Tap correction abs delta: 32.23
- Hold travel delta: 86.99
- Hold settle after release (ms): 216
- Reversal cross ms: 267
- Shot delay while moving (ms): 7
- Post-shot travel: 62.21
- Max frame step: 11.26

## Current metric gaps

- tapAbsDelta: value 32.23, target {"min":11.5,"max":19.5}, gap 12.73

## Read

- This movement conformance check now uses first-pass trace-backed targets derived from the preserved stage-opening alignment window.
- Use it to catch jerkiness, sluggish release, weak lane travel, or movement-plus-fire regressions.
- Tighten the targets again once direct frame-level movement extraction is automated from the preserved Galaga gameplay footage.


# Controlled Clock Exact Advance

Generated: `2026-05-07T13:11:41.302Z`

## Problem

Controlled-clock replay was sensitive to how action intervals were segmented because `advanceFor(seconds)` could advance one full frame beyond the requested duration.

## Strategy

Advance a deterministic harness run through fractional intervals and compare `simT` and `stageClock` against the exact accumulated requested duration after each step.

## Success Measure

The worst absolute clock delta must be <= 0.001 seconds.

## Result

- Outcome: pass
- Worst delta: 0

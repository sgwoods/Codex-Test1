# Stage 1 Opening Correspondence

This artifact compares the current local candidate against the shipped local production baseline and the current Galaga-aligned reference targets for the first stage-1 timing family.

## Sources

- Profile: `tools/harness/reference-profiles/stage1-opening-first-dive.json`
- Reference timing metrics: `reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/metrics.json`
- Reference timing library: `reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Passed metrics: 1/4
- Worst current delta: 8.338
- Worst drift from baseline: 0.888

## Metrics

### Game start cue after spawn
- Target: 0
- Tolerance: 0.05
- Baseline: null
- Current: 0
- Baseline delta: null
- Current delta: 0
- Drift from baseline: null
- Within tolerance: yes

### First stage pulse after spawn
- Target: 0.817
- Tolerance: 0.2
- Baseline: null
- Current: 0.007
- Baseline delta: null
- Current delta: -0.81
- Drift from baseline: null
- Within tolerance: no

### First attack after spawn
- Target: 8.2
- Tolerance: 0.35
- Baseline: 0.117
- Current: 1.001
- Baseline delta: -8.083
- Current delta: -7.199
- Drift from baseline: 0.884
- Within tolerance: no

### First lower-field crossing after spawn
- Target: 9.35
- Tolerance: 0.45
- Baseline: 0.124
- Current: 1.012
- Baseline delta: -9.226
- Current delta: -8.338
- Drift from baseline: 0.888
- Within tolerance: no

## Read

- Use this as a first correspondence example, not a complete fidelity verdict.
- A current delta outside tolerance may represent intended tuning, acceptable drift, or regression; the purpose here is to make that drift explicit.
- Expand this pattern next to stage-opening spacing, capture/rescue, challenge timing, and persona progression evidence.


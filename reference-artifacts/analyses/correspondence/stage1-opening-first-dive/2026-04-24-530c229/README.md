# Stage 1 Opening Correspondence

This artifact compares the current local candidate against:

- the shipped local production baseline
- the preserved historical Aurora timing baseline
- the current Galaga-aligned reference targets

## Sources

- Profile: `tools/harness/reference-profiles/stage1-opening-first-dive.json`
- Reference timing metrics: `reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/metrics.json`
- Reference timing library: `reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`
- Historical Aurora baseline family: `formation-arrival-and-convoy`

## Summary

- Passed metrics: 4/4
- Worst current delta: 0.18
- Worst drift from baseline: 8.255
- Worst drift from historical Aurora baseline: 0.033

## Metrics

### Game start cue after spawn
- Target: 0
- Tolerance: 0.05
- Historical Aurora baseline: null
- Baseline: null
- Current: 0
- Historical baseline delta: null
- Baseline delta: null
- Current delta: 0
- Drift from historical Aurora baseline: null
- Drift from baseline: null
- Within tolerance: yes

### First stage pulse after formation arrival
- Target: 1.97
- Tolerance: 0.35
- Historical Aurora baseline: null
- Baseline: null
- Current: 2.15
- Historical baseline delta: null
- Baseline delta: null
- Current delta: 0.18
- Drift from historical Aurora baseline: null
- Drift from baseline: null
- Within tolerance: yes

### First attack after spawn
- Target: 8.2
- Tolerance: 0.35
- Historical Aurora baseline: 8.2
- Baseline: 1.04
- Current: 8.217
- Historical baseline delta: 0
- Baseline delta: -7.16
- Current delta: 0.017
- Drift from historical Aurora baseline: 0.017
- Drift from baseline: 7.177
- Within tolerance: yes

### First lower-field crossing after spawn
- Target: 9.35
- Tolerance: 0.45
- Historical Aurora baseline: 9.35
- Baseline: 1.128
- Current: 9.383
- Historical baseline delta: 0
- Baseline delta: -8.222
- Current delta: 0.033
- Drift from historical Aurora baseline: 0.033
- Drift from baseline: 8.255
- Within tolerance: yes

## Read

- Use this as a first correspondence example, not a complete fidelity verdict.
- A current delta outside tolerance may represent intended tuning, acceptable drift, or regression; the purpose here is to make that drift explicit.
- Expand this pattern next to stage-opening spacing, capture/rescue, challenge timing, and persona progression evidence.


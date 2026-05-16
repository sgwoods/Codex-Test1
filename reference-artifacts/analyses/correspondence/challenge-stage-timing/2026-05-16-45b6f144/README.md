# Challenge Stage Timing Correspondence

This artifact compares the current local candidate against:

- the shipped local production baseline
- the preserved historical Aurora challenge timing baseline
- the Galaga-aligned challenge timing targets captured in the reference library

## Sources

- Profile: `tools/harness/reference-profiles/challenge-stage-timing.json`
- Reference timing library: `reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`
- Historical Aurora baseline family: `challenge-entry-results-perfect`

## Summary

- Passed metrics: 5/5
- Worst current delta: 0.032
- Worst drift from baseline: 0.55

## Scenario Support

- Baseline challenge entry: ok
- Baseline challenge perfect: ok
- Current challenge entry: ok
- Current challenge perfect: ok

## Metrics

### Challenge Cue After Probe
- Target: 2.224
- Tolerance: 0.5
- Baseline: 2.217
- Current: 2.217
- Baseline delta: -0.007
- Current delta: -0.007
- Drift from baseline: 0
- Within tolerance: yes

### Challenge Spawn After Cue
- Target: 1.133
- Tolerance: 0.4
- Baseline: 0.583
- Current: 1.133
- Baseline delta: -0.55
- Current delta: 0
- Drift from baseline: 0.55
- Within tolerance: yes

### Challenge Result Cue After Clear
- Target: 0.342
- Tolerance: 0.4
- Baseline: null
- Current: 0.333
- Baseline delta: null
- Current delta: -0.009
- Drift from baseline: null
- Within tolerance: yes

### Next-Stage Cue After Clear
- Target: 2.851
- Tolerance: 0.6
- Baseline: null
- Current: 2.866
- Baseline delta: null
- Current delta: 0.015
- Drift from baseline: null
- Within tolerance: yes

### Next-Stage Spawn After Clear
- Target: 4.401
- Tolerance: 0.8
- Baseline: null
- Current: 4.433
- Baseline delta: null
- Current delta: 0.032
- Drift from baseline: null
- Within tolerance: yes

## Read

- Use this correspondence report for challenge announcement and post-clear handoff timing, not for challenge scoring or hit-rate fidelity.
- The historical target here comes from preserved Aurora timing work already aligned against Galaga references, not from a freshly inferred heuristic.
- Expand this pattern next into challenge scoring/results behavior and persona-based challenge hit-rate evidence.


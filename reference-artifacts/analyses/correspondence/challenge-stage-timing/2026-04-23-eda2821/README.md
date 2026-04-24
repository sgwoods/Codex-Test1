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
- Worst current delta: 0.483
- Worst drift from baseline: 4.424

## Scenario Support

- Baseline challenge entry: unsupported
- Baseline challenge perfect: ok
- Current challenge entry: ok
- Current challenge perfect: ok

## Metrics

- Baseline challenge-entry probe error: `    at async main (/Users/steven/Documents/Codex-Test1/tools/harness/run-gameplay.js:350:26)`

### Challenge Cue After Probe
- Target: 2.219
- Tolerance: 0.5
- Baseline: null
- Current: 2.216
- Baseline delta: null
- Current delta: -0.003
- Drift from baseline: null
- Within tolerance: yes

### Challenge Spawn After Cue
- Target: 0.583
- Tolerance: 0.4
- Baseline: null
- Current: 0.584
- Baseline delta: null
- Current delta: 0.001
- Drift from baseline: null
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
- Target: 2.85
- Tolerance: 0.6
- Baseline: null
- Current: 2.866
- Baseline delta: null
- Current delta: 0.016
- Drift from baseline: null
- Within tolerance: yes

### Next-Stage Spawn After Clear
- Target: 3.95
- Tolerance: 0.8
- Baseline: 0.009
- Current: 4.433
- Baseline delta: -3.941
- Current delta: 0.483
- Drift from baseline: 4.424
- Within tolerance: yes

## Read

- Use this correspondence report for challenge announcement and post-clear handoff timing, not for challenge scoring or hit-rate fidelity.
- The historical target here comes from preserved Aurora timing work already aligned against Galaga references, not from a freshly inferred heuristic.
- Expand this pattern next into challenge scoring/results behavior and persona-based challenge hit-rate evidence.


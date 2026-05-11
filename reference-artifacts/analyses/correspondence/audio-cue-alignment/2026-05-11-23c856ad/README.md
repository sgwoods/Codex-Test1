# Audio Cue Alignment Correspondence

This report compares Aurora gameplay-audio cue timing against the preserved
Galaga-aligned Aurora timing baselines and the shipped local production lane.

## Sources

- Profile: `tools/harness/reference-profiles/audio-cue-alignment.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`
- Timing library: `reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`

## Summary

- Passed metrics: 9/9
- Worst current delta: 6.31
- Worst current risk delta: 0
- Worst drift from baseline: 0.55

## Scenario Support

- Baseline challenge entry: ok
- Current challenge entry: ok

## Metrics

### Game Start Cue After Spawn
- Target: 0
- Tolerance: 0.05
- Baseline: 0
- Current: 0
- Baseline delta: 0
- Current delta: 0
- Drift from baseline: 0
- Within tolerance: yes

### First Stage Pulse After Formation Arrival
- Target: 1.97
- Tolerance: 0.35
- Baseline: 2.143
- Current: 2.143
- Baseline delta: 0.173
- Current delta: 0.173
- Drift from baseline: 0
- Within tolerance: yes

### Game Start Tail Past First Pulse
- Target: 0
- Tolerance: 0.15
- Baseline: -6.31
- Current: -6.31
- Baseline delta: -6.31
- Current delta: -6.31
- Drift from baseline: 0
- Within tolerance: yes

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

### Challenge Transition Tail Past Spawn
- Target: 0.467
- Tolerance: 0.15
- Baseline: 0.467
- Current: 0.467
- Baseline delta: 0
- Current delta: 0
- Drift from baseline: 0
- Within tolerance: yes

### Challenge Perfect Cue After Clear
- Target: 0.342
- Tolerance: 0.35
- Baseline: null
- Current: 0.333
- Baseline delta: null
- Current delta: -0.009
- Drift from baseline: null
- Within tolerance: yes

### Next Stage Cue After Clear
- Target: 2.851
- Tolerance: 0.55
- Baseline: null
- Current: 2.866
- Baseline delta: null
- Current delta: 0.015
- Drift from baseline: null
- Within tolerance: yes

### Result Cue Tail Past Next Cue
- Target: 0
- Tolerance: 0.2
- Baseline: null
- Current: -0.383
- Baseline delta: null
- Current delta: -0.383
- Drift from baseline: null
- Within tolerance: yes

## Read

- Use this report for audio cue timing and overlap windows, not for timbre identity by itself.
- Pair it with the audio theme comparison when making broader sound-design decisions.
- The next audio polish cycle should aim to improve the weak timing families without shortening canonical phrases just for convenience.


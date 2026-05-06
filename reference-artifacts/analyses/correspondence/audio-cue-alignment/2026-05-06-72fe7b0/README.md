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
- Worst current delta: 6.317
- Worst drift from baseline: 0

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
- Baseline: 2.15
- Current: 2.15
- Baseline delta: 0.18
- Current delta: 0.18
- Drift from baseline: 0
- Within tolerance: yes

### Game Start Tail Past First Pulse
- Target: 0
- Tolerance: 0.15
- Baseline: -6.317
- Current: -6.317
- Baseline delta: -6.317
- Current delta: -6.317
- Drift from baseline: 0
- Within tolerance: yes

### Challenge Cue After Probe
- Target: 2.219
- Tolerance: 0.5
- Baseline: 2.216
- Current: 2.216
- Baseline delta: -0.003
- Current delta: -0.003
- Drift from baseline: 0
- Within tolerance: yes

### Challenge Spawn After Cue
- Target: 0.583
- Tolerance: 0.4
- Baseline: 0.584
- Current: 0.584
- Baseline delta: 0.001
- Current delta: 0.001
- Drift from baseline: 0
- Within tolerance: yes

### Challenge Transition Tail Past Spawn
- Target: 0.467
- Tolerance: 0.15
- Baseline: 0.466
- Current: 0.466
- Baseline delta: -0.001
- Current delta: -0.001
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
- Target: 2.85
- Tolerance: 0.55
- Baseline: null
- Current: 2.866
- Baseline delta: null
- Current delta: 0.016
- Drift from baseline: null
- Within tolerance: yes

### Result Cue Tail Past Next Cue
- Target: 0
- Tolerance: 0.2
- Baseline: null
- Current: -0.833
- Baseline delta: null
- Current delta: -0.833
- Drift from baseline: null
- Within tolerance: yes

## Read

- Use this report for audio cue timing and overlap windows, not for timbre identity by itself.
- Pair it with the audio theme comparison when making broader sound-design decisions.
- The next audio polish cycle should aim to improve the weak timing families without shortening canonical phrases just for convenience.

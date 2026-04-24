# Audio Cue Alignment Correspondence

This report compares Aurora gameplay-audio cue timing against the preserved
Galaga-aligned Aurora timing baselines and the shipped local production lane.

## Sources

- Profile: `tools/harness/reference-profiles/audio-cue-alignment.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`
- Timing library: `reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`

## Summary

- Passed metrics: 3/9
- Worst current delta: 2.823
- Worst drift from baseline: null

## Scenario Support

- Baseline challenge entry: unsupported
- Current challenge entry: ok

## Metrics

- Baseline challenge-entry probe error: `page.evaluate: Error: Harness method not found: setupStageTransitionProbe
    at eval (eval at evaluate (:290:30), <anonymous>:3:61)
    at UtilityScript.evaluate (<anonymous>:292:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
    at replayDeterministic (/Users/steven/Documents/Codex-Test1/tools/harness/run-gameplay.js:186:18)
    at async main (/Users/steven/Documents/Codex-Test1/tools/harness/run-gameplay.js:350:26)`

### Game Start Cue After Spawn
- Target: 0
- Tolerance: 0.05
- Baseline: null
- Current: 0.005
- Baseline delta: null
- Current delta: 0.005
- Drift from baseline: null
- Within tolerance: yes

### First Stage Pulse After Spawn
- Target: 0.817
- Tolerance: 0.25
- Baseline: null
- Current: 0.159
- Baseline delta: null
- Current delta: -0.658
- Drift from baseline: null
- Within tolerance: no

### Game Start Tail Past First Pulse
- Target: 0
- Tolerance: 0.15
- Baseline: null
- Current: -0.154
- Baseline delta: null
- Current delta: -0.154
- Drift from baseline: null
- Within tolerance: yes

### Challenge Cue After Probe
- Target: 2.219
- Tolerance: 0.5
- Baseline: null
- Current: 0.008
- Baseline delta: null
- Current delta: -2.211
- Drift from baseline: null
- Within tolerance: no

### Challenge Spawn After Cue
- Target: 0.583
- Tolerance: 0.4
- Baseline: null
- Current: 0.001
- Baseline delta: null
- Current delta: -0.582
- Drift from baseline: null
- Within tolerance: no

### Challenge Transition Tail Past Spawn
- Target: 0
- Tolerance: 0.2
- Baseline: null
- Current: 1.049
- Baseline delta: null
- Current delta: 1.049
- Drift from baseline: null
- Within tolerance: no

### Challenge Perfect Cue After Clear
- Target: 0.342
- Tolerance: 0.35
- Baseline: null
- Current: 0.001
- Baseline delta: null
- Current delta: -0.341
- Drift from baseline: null
- Within tolerance: yes

### Next Stage Cue After Clear
- Target: 2.85
- Tolerance: 0.55
- Baseline: null
- Current: 0.027
- Baseline delta: null
- Current delta: -2.823
- Drift from baseline: null
- Within tolerance: no

### Result Cue Tail Past Next Cue
- Target: 0
- Tolerance: 0.2
- Baseline: null
- Current: 1.674
- Baseline delta: null
- Current delta: 1.674
- Drift from baseline: null
- Within tolerance: no

## Read

- Use this report for audio cue timing and overlap windows, not for timbre identity by itself.
- Pair it with the audio theme comparison when making broader sound-design decisions.
- The next audio polish cycle should aim to improve the weak timing families without shortening canonical phrases just for convenience.


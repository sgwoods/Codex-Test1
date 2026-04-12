# Galaga Audio Overlap Budget

This report measures whether reference-audio clip tails fit inside Aurora timing windows.
Positive overruns mean a clip is still active when the next cue or the next state begins.

## Current worst offenders

- No positive cue overruns detected in the current scenarios.

## Stage 1 opening
- Game start after spawn: 0.001
- First pulse after spawn: 6.291
- First dive after spawn: 9.791
- Attack-charge cue after dive: 0
- Game-start tail past first pulse: -2.29
- Game-start tail past first dive: -5.79

## Stage 1 -> 2 transition probe
- Transition window: 3.204
- Pulse lead before probe: null
- Transition cue after probe: 2.022
- Spawn after transition cue: 1.182
- Pulse tail past transition cue: null
- Pulse tail past spawn: null
- Transition cue tail past spawn: -0.322

## Stage 2 -> 3 challenge probe
- Transition window: 3.753
- Pulse lead before probe: null
- Challenge cue after probe: 2.228
- Spawn after challenge cue: 1.525
- Pulse tail past challenge cue: null
- Pulse tail past challenge spawn: null
- Challenge cue tail past spawn: -0.475

## Challenge perfect -> next stage
- Result cue after clear: 0.342
- Next-stage cue after clear: 2.85
- Spawn after clear: 3.95
- Result tail past next-stage cue: -0.808
- Result tail past spawn: -1.908
- Next-stage cue tail past spawn: -0.24

## Outputs
- Metrics JSON: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-a777fba/metrics.json`
- This README: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-a777fba/README.md`
- Run root: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/audio-overlap`


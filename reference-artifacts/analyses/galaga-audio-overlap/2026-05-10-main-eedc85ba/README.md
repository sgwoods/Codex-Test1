# Galaga Audio Overlap Budget

This report measures whether reference-audio clip tails fit inside Aurora timing windows.
Positive overruns mean a clip is still active when the next cue or the next state begins.

## Current worst offenders

- Stage 1->2 transition cue tail vs spawn: overruns by 2.166s
- Stage 2->3 challenge cue tail vs spawn: overruns by 0.467s
- Next-stage cue tail vs spawn after challenge: overruns by 1.800s

## Stage 1 opening
- Game start after spawn: 0
- First pulse after spawn: 6.293
- First dive after spawn: 8.193
- Attack-charge cue after dive: 0.125
- Game-start tail past first pulse: -2.293
- Game-start tail past first dive: -4.193

## Stage 1 -> 2 transition probe
- Transition window: 3.208
- Pulse lead before probe: null
- Transition cue after probe: 2.024
- Spawn after transition cue: 1.184
- Pulse tail past transition cue: null
- Pulse tail past spawn: null
- Transition cue tail past spawn: 2.166

## Stage 2 -> 3 challenge probe
- Transition window: 3.357
- Pulse lead before probe: null
- Challenge cue after probe: 2.224
- Spawn after challenge cue: 1.133
- Pulse tail past challenge cue: null
- Pulse tail past challenge spawn: null
- Challenge cue tail past spawn: 0.467

## Challenge perfect -> next stage
- Result cue after clear: 0.342
- Next-stage cue after clear: 2.851
- Spawn after clear: 4.401
- Result tail past next-stage cue: -0.359
- Result tail past spawn: -1.909
- Next-stage cue tail past spawn: 1.8

## Outputs
- Metrics JSON: `/Users/sgwoods/Development/Codex/Codex-test1/reference-artifacts/analyses/galaga-audio-overlap/2026-05-10-main-eedc85ba/metrics.json`
- This README: `/Users/sgwoods/Development/Codex/Codex-test1/reference-artifacts/analyses/galaga-audio-overlap/2026-05-10-main-eedc85ba/README.md`
- Run root: `/Users/sgwoods/Development/Codex/Codex-test1/harness-artifacts/audio-overlap`

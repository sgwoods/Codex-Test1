# Galaga Audio Overlap Budget

This report measures whether reference-audio clip tails fit inside Aurora timing windows.
Positive overruns mean a clip is still active when the next cue or the next state begins.

## Current worst offenders

- Stage 2->3 challenge cue tail vs spawn: overruns by 0.468s

## Stage 1 opening
- Game start after spawn: 0.001
- First pulse after spawn: 6.297
- First dive after spawn: 8.198
- Attack-charge cue after dive: 0.124
- Game-start tail past first pulse: -2.296
- Game-start tail past first dive: -4.197

## Stage 1 -> 2 transition probe
- Transition window: 3.199
- Pulse lead before probe: null
- Transition cue after probe: 2.024
- Spawn after transition cue: 1.175
- Pulse tail past transition cue: null
- Pulse tail past spawn: null
- Transition cue tail past spawn: -0.315

## Stage 2 -> 3 challenge probe
- Transition window: 2.807
- Pulse lead before probe: null
- Challenge cue after probe: 2.225
- Spawn after challenge cue: 0.582
- Pulse tail past challenge cue: null
- Pulse tail past challenge spawn: null
- Challenge cue tail past spawn: 0.468

## Challenge perfect -> next stage
- Result cue after clear: 0.341
- Next-stage cue after clear: 2.851
- Spawn after clear: 4.401
- Result tail past next-stage cue: -0.81
- Result tail past spawn: -2.36
- Next-stage cue tail past spawn: -0.69

## Outputs
- Metrics JSON: `/Users/sgwoods/Development/Codex/Codex-test1/reference-artifacts/analyses/galaga-audio-overlap/2026-05-07-main-beb232a/metrics.json`
- This README: `/Users/sgwoods/Development/Codex/Codex-test1/reference-artifacts/analyses/galaga-audio-overlap/2026-05-07-main-beb232a/README.md`
- Run root: `/Users/sgwoods/Development/Codex/Codex-test1/harness-artifacts/audio-overlap`

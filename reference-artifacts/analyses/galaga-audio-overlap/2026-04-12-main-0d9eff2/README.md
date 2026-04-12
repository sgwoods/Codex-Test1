# Galaga Audio Overlap Budget

This report measures whether reference-audio clip tails fit inside Aurora timing windows.
Positive overruns mean a clip is still active when the next cue or the next state begins.

## Current worst offenders

- No positive cue overruns detected in the current scenarios.

## Stage 1 opening
- Game start after spawn: 0.001
- First pulse after spawn: 6.283
- First dive after spawn: 9.783
- Attack-charge cue after dive: 0.125
- Game-start tail past first pulse: -2.282
- Game-start tail past first dive: -5.782

## Stage 1 -> 2 transition probe
- Transition window: 3.202
- Pulse lead before probe: null
- Transition cue after probe: 2.019
- Spawn after transition cue: 1.183
- Pulse tail past transition cue: null
- Pulse tail past spawn: null
- Transition cue tail past spawn: -0.323

## Stage 2 -> 3 challenge probe
- Transition window: 4.351
- Pulse lead before probe: null
- Challenge cue after probe: 2.625
- Spawn after challenge cue: 1.726
- Pulse tail past challenge cue: null
- Pulse tail past challenge spawn: null
- Challenge cue tail past spawn: -0.676

## Challenge perfect -> next stage
- Result cue after clear: 0.341
- Next-stage cue after clear: 4.384
- Spawn after clear: 6
- Result tail past next-stage cue: -2.343
- Result tail past spawn: -3.959
- Next-stage cue tail past spawn: -0.756

## Outputs
- Metrics JSON: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-0d9eff2/metrics.json`
- This README: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-0d9eff2/README.md`
- Run root: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/audio-overlap`


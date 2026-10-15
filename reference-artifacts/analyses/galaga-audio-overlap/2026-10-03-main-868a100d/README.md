# Galaga Audio Overlap Budget

This report measures whether reference-audio clip tails fit inside Aurora timing windows.
Positive overruns mean a clip is still active when the next cue or the next state begins.

## Current worst offenders

- Stage 1->2 transition cue tail vs spawn: overruns by 2.167s
- Stage 2->3 challenge cue tail vs spawn: overruns by 0.475s
- Challenge result tail vs next-stage cue: overruns by 1.492s
- Next-stage cue tail vs spawn after challenge: overruns by 1.791s

## Stage 1 opening
- Game start after spawn: 0
- First pulse after spawn: 6.289
- First dive after spawn: 8.19
- Attack-charge cue after dive: 0.124
- Game-start tail past first pulse: -2.289
- Game-start tail past first dive: -4.19

## Stage 1 -> 2 transition probe
- Transition window: 3.206
- Pulse lead before probe: null
- Transition cue after probe: 2.023
- Spawn after transition cue: 1.183
- Pulse tail past transition cue: null
- Pulse tail past spawn: null
- Transition cue tail past spawn: 2.167

## Stage 2 -> 3 challenge probe
- Transition window: 3.344
- Pulse lead before probe: null
- Challenge cue after probe: 2.219
- Spawn after challenge cue: 1.125
- Pulse tail past challenge cue: null
- Pulse tail past challenge spawn: null
- Challenge cue tail past spawn: 0.475

## Challenge perfect -> next stage
- Result cue after clear: 0.342
- Next-stage cue after clear: 2.85
- Spawn after clear: 4.409
- Result tail past next-stage cue: 1.492
- Result tail past spawn: -0.067
- Next-stage cue tail past spawn: 1.791

## Outputs
- Metrics JSON: `<workspace>/reference-artifacts/analyses/galaga-audio-overlap/2026-10-03-main-868a100d/metrics.json`
- This README: `<workspace>/reference-artifacts/analyses/galaga-audio-overlap/2026-10-03-main-868a100d/README.md`
- Run root: `<workspace>/harness-artifacts/audio-overlap`

